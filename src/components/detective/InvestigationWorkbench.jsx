import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlaskConical,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  Info,
  X,
  Sparkles,
} from 'lucide-react';
import { FormulaBar } from '../excel/FormulaBar.jsx';
import { SpreadsheetGrid } from '../excel/SpreadsheetGrid.jsx';

/**
 * InvestigationWorkbench
 *
 * The center-panel investigation tool for the Detective Workspace.
 * This is NOT a generic Excel editor — it is an investigation instrument.
 * The investigator imports evidence data and uses Excel to verify clues.
 *
 * Investigation context is always visible:
 *   - Which source was imported
 *   - What the investigation is trying to verify
 *
 * Evidence rows are READ-ONLY (selectable for formula references, not editable).
 * Analysis rows below evidence data are editable — formulas go here.
 *
 * When an analysis cell produces a result, the investigator can
 * [+ Record Finding] to save it to their investigation state.
 */

// ── Dataset adapter ─────────────────────────────────────────────────────────
// SpreadsheetGrid expects { columns: [{key, name, type}], rows: [{...}] }
// Case datasets use { schema: [{name, label, type}], rows: [{...}] }
function adaptDatasetForGrid(dataset) {
  if (!dataset) return null;
  const columns = (dataset.schema || []).map(col => ({
    key: col.name,
    name: col.label || col.name,
    type: col.type || 'string',
    dataType: col.type || 'string',
  }));
  return { columns, rows: dataset.rows || [] };
}

// ── Workbench formula engine (lightweight) ──────────────────────────────────
// Evaluates formulas against the workbench grid data.
// Evidence rows are indexed 2..N+1 (row 1 is header).
// Analysis rows start at N+2.
function evaluateFormula(formula, cellFormulas, cellValues, evidenceRows, schema) {
  if (!formula || typeof formula !== 'string') return '';
  const trimmed = formula.trim();
  if (!trimmed.startsWith('=')) {
    const cleanNum = trimmed.replace(/,/g, '');
    const num = parseFloat(cleanNum);
    return isNaN(num) ? formula : num;
  }

  try {
    // Build a column-key → excelColumn mapping
    const colMap = {}; // 'A' → schema[0].name
    (schema || []).forEach((col, i) => {
      colMap[String.fromCharCode(65 + i)] = col.name;
    });

    let expr = trimmed.slice(1).toUpperCase();

    // Normalize comma thousands separators in numbers (e.g. 18,420 -> 18420)
    expr = expr.replace(/(\d+),(\d{3})/g, '$1$2');

    // 1. Replace SUM(colLetter:rowStart:colLetter:rowEnd) style
    expr = expr.replace(/SUM\(([A-Z])(\d+):([A-Z])(\d+)\)/gi, (_, colA, r1, colB, r2) => {
      const colKey = colMap[colA];
      if (!colKey) return 'NaN';
      const start = parseInt(r1, 10) - 2; // row 2 = index 0
      const end = parseInt(r2, 10) - 2;
      let total = 0;
      for (let i = start; i <= end && i < evidenceRows.length; i++) {
        if (i >= 0) {
          const val = parseFloat(String(evidenceRows[i]?.[colKey]).replace(/,/g, ''));
          if (!isNaN(val)) total += val;
        }
      }
      return total;
    });

    // 2. Replace AVERAGE(colLetter:rowStart:colLetter:rowEnd)
    expr = expr.replace(/AVERAGE\(([A-Z])(\d+):([A-Z])(\d+)\)/gi, (_, colA, r1, colB, r2) => {
      const colKey = colMap[colA];
      if (!colKey) return 'NaN';
      const start = parseInt(r1, 10) - 2;
      const end = parseInt(r2, 10) - 2;
      let total = 0;
      let count = 0;
      for (let i = start; i <= end && i < evidenceRows.length; i++) {
        if (i >= 0) {
          const val = parseFloat(String(evidenceRows[i]?.[colKey]).replace(/,/g, ''));
          if (!isNaN(val)) {
            total += val;
            count++;
          }
        }
      }
      return count > 0 ? total / count : 0;
    });

    // 3. Replace COUNT(colLetter:rowStart:colLetter:rowEnd)
    expr = expr.replace(/COUNT\(([A-Z])(\d+):([A-Z])(\d+)\)/gi, (_, colA, r1, colB, r2) => {
      const colKey = colMap[colA];
      if (!colKey) return '0';
      const start = parseInt(r1, 10) - 2;
      const end = parseInt(r2, 10) - 2;
      let count = 0;
      for (let i = start; i <= end && i < evidenceRows.length; i++) {
        if (i >= 0 && evidenceRows[i]?.[colKey] !== undefined) count++;
      }
      return count;
    });

    // 4. Replace MIN and MAX
    expr = expr.replace(/MIN\(([A-Z])(\d+):([A-Z])(\d+)\)/gi, (_, colA, r1, colB, r2) => {
      const colKey = colMap[colA];
      if (!colKey) return 'NaN';
      const start = parseInt(r1, 10) - 2;
      const end = parseInt(r2, 10) - 2;
      let minVal = Infinity;
      for (let i = start; i <= end && i < evidenceRows.length; i++) {
        if (i >= 0) {
          const val = parseFloat(String(evidenceRows[i]?.[colKey]).replace(/,/g, ''));
          if (!isNaN(val) && val < minVal) minVal = val;
        }
      }
      return minVal === Infinity ? 0 : minVal;
    });

    expr = expr.replace(/MAX\(([A-Z])(\d+):([A-Z])(\d+)\)/gi, (_, colA, r1, colB, r2) => {
      const colKey = colMap[colA];
      if (!colKey) return 'NaN';
      const start = parseInt(r1, 10) - 2;
      const end = parseInt(r2, 10) - 2;
      let maxVal = -Infinity;
      for (let i = start; i <= end && i < evidenceRows.length; i++) {
        if (i >= 0) {
          const val = parseFloat(String(evidenceRows[i]?.[colKey]).replace(/,/g, ''));
          if (!isNaN(val) && val > maxVal) maxVal = val;
        }
      }
      return maxVal === -Infinity ? 0 : maxVal;
    });

    // 5. Replace cell references (A2, D5, etc.)
    expr = expr.replace(/([A-Z])(\d+)/g, (match, col, row) => {
      const cellId = `${col}${row}`;
      if (cellValues[cellId] !== undefined) return cellValues[cellId];
      if (cellFormulas[cellId]) {
        return evaluateFormula(cellFormulas[cellId], cellFormulas, cellValues, evidenceRows, schema);
      }
      const colKey = colMap[col];
      const rowIdx = parseInt(row, 10) - 2;
      if (colKey && rowIdx >= 0 && rowIdx < evidenceRows.length) {
        const val = evidenceRows[rowIdx][colKey];
        if (typeof val === 'number') return val;
        const num = parseFloat(String(val).replace(/,/g, ''));
        return !isNaN(num) ? num : `"${val}"`;
      }
      return 0;
    });

    // 6. Security & evaluation guard: only valid math expressions
    if (/^[0-9+\-*/().\s%]+$/.test(expr)) {
      // eslint-disable-next-line no-new-func
      const result = new Function(`return ${expr}`)();
      return typeof result === 'number' ? Math.round(result * 100) / 100 : result;
    }
    return '#ERROR';
  } catch {
    return '#ERROR';
  }
}

// ── Main Component ──────────────────────────────────────────────────────────

export function InvestigationWorkbench({
  sourceEvidenceId,
  sourceTitle,
  dataset,
  workbenchState = null,
  phaseId,
  isHQOpen = false,
  onSaveWorkbenchState,
  onRecordFinding,
  onViewSource,
}) {
  const { t } = useTranslation(['investigation', 'workbench', 'common']);

  const evidenceRows = dataset?.rows || [];
  const schema = dataset?.schema || [];

  // ── Workbench formula / cell state ────────────────────────────────────────
  const [cellFormulas, setCellFormulas] = useState(workbenchState?.cellFormulas || {});
  const [cellValues, setCellValues] = useState(workbenchState?.cellValues || {});
  const [selectedCell, setSelectedCell] = useState(workbenchState?.selectedCell || 'D2');
  const [currentFormula, setCurrentFormula] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(workbenchState?.analysisResult || null);

  // ── Finding registration modal state ─────────────────────────────────────
  const [showFindingModal, setShowFindingModal] = useState(false);
  const [findingClaim, setFindingClaim] = useState('');
  const [findingContext, setFindingContext] = useState('');
  const [findingValue, setFindingValue] = useState(null);

  // ── Active analysis result ────────────────────────────────────────────────
  const activeAnalysisResult = useMemo(() => {
    if (analysisResult?.value !== undefined && analysisResult?.value !== null && analysisResult?.value !== '') {
      return analysisResult.value;
    }
    return null;
  }, [analysisResult]);

  // ── Build grid dataset for SpreadsheetGrid ────────────────────────────────
  const gridDataset = useMemo(() => adaptDatasetForGrid(dataset), [dataset]);

  // ── Handle cell selection ─────────────────────────────────────────────────
  const handleCellSelect = useCallback((cellAddr) => {
    setSelectedCell(cellAddr);
    const col = cellAddr.replace(/\d/g, '');
    const row = parseInt(cellAddr.replace(/[A-Z]/g, ''), 10) - 2;
    const colKey = schema[col.charCodeAt(0) - 65]?.name;
    const val = colKey ? (evidenceRows[row]?.[colKey] ?? '') : '';
    if (!currentFormula.startsWith('=')) {
      setCurrentFormula(String(val));
    }
  }, [evidenceRows, schema, currentFormula]);

  // ── Run formula ───────────────────────────────────────────────────────────
  const handleRunFormula = useCallback((overrideFormula) => {
    const formulaToRun = (typeof overrideFormula === 'string' ? overrideFormula : currentFormula).trim();
    if (!formulaToRun) return;

    setIsEvaluating(true);
    setTimeout(() => {
      const result = evaluateFormula(formulaToRun, cellFormulas, cellValues, evidenceRows, schema);
      const nextResult = { formula: formulaToRun, value: result };
      setAnalysisResult(nextResult);
      setCurrentFormula(formulaToRun);
      setIsEvaluating(false);

      // Persist to investigation state
      onSaveWorkbenchState?.({
        sourceEvidenceId,
        cellFormulas,
        cellValues,
        selectedCell,
        analysisResult: nextResult,
      });
    }, 60);
  }, [currentFormula, cellFormulas, cellValues, evidenceRows, schema, sourceEvidenceId, onSaveWorkbenchState, selectedCell]);

  // ── Apply quick formula chip ──────────────────────────────────────────────
  const handleApplyQuickFormula = useCallback((formula) => {
    setCurrentFormula(formula);
    handleRunFormula(formula);
  }, [handleRunFormula]);

  // ── Reset analysis area ───────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setAnalysisResult(null);
    setCurrentFormula('');
    onSaveWorkbenchState?.({
      sourceEvidenceId,
      cellFormulas: {},
      cellValues: {},
      selectedCell,
      analysisResult: null,
    });
  }, [sourceEvidenceId, selectedCell, onSaveWorkbenchState]);

  // ── Open finding modal ────────────────────────────────────────────────────
  const handleOpenFindingModal = () => {
    const val = activeAnalysisResult;
    setFindingValue(val);
    let defaultClaim = '';
    let defaultContext = '';
    const numVal = typeof val === 'number' ? val : parseFloat(String(val).replace(/,/g, ''));
    if (numVal === 4210) {
      defaultClaim = 'Số lượng xuất kho trái phép vượt hạn mức ủy quyền là 4.210 kg';
      defaultContext = analysisResult?.formula || '=SUM(D2:D8) - 14,210 kg (Hồ sơ ủy quyền mua hàng)';
    } else if (numVal === 18420) {
      defaultClaim = 'Tổng lượng cà phê Robusta xuất kho thực tế tháng 5/2026 là 18.420 kg';
      defaultContext = analysisResult?.formula || '=SUM(D2:D8) Báo Cáo Xuất Kho (Warehouse Shipping Records)';
    } else {
      defaultClaim = val !== null && val !== undefined ? t('workbench:valueDerivedFromAnalysis', { value: val }) : '';
      defaultContext = analysisResult?.formula || t('workbench:analysisContext', { source: sourceTitle || t('common:evidenceData') });
    }
    setFindingClaim(defaultClaim);
    setFindingContext(defaultContext);
    setShowFindingModal(true);
  };

  // ── Confirm finding ───────────────────────────────────────────────────────
  const handleConfirmFinding = () => {
    if (!findingClaim.trim()) return;
    onRecordFinding?.({
      phaseId,
      claim: findingClaim.trim(),
      value: findingValue,
      sourceEvidenceId,
      investigationContext: findingContext.trim(),
    });
    setShowFindingModal(false);
    setFindingClaim('');
    setFindingContext('');
    setFindingValue(null);
  };

  // ── Build SpreadsheetGrid cell values ─────────────────────────────────────
  const gridCellValues = useMemo(() => {
    const vals = { ...cellValues };
    (gridDataset?.columns || []).forEach((col, colIdx) => {
      const colLetter = String.fromCharCode(65 + colIdx);
      evidenceRows.forEach((row, rowIdx) => {
        vals[`${colLetter}${rowIdx + 2}`] = row[col.key] ?? '';
      });
    });
    return vals;
  }, [gridDataset, evidenceRows, cellValues]);

  if (!dataset) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <FlaskConical className="size-8 text-muted-foreground/30 mb-3" />
        <p className="text-sm font-semibold text-foreground/60">{t('noEvidenceImported')}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {t('noEvidenceImportedDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Source Context Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-card/60 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <FlaskConical className="size-3.5 text-amber-500 shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">
              {t('investigationWorkbench')}
            </span>
            <span className="text-xs font-semibold text-foreground truncate">
              {sourceTitle || sourceEvidenceId}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onViewSource}
          className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-500 transition-colors cursor-pointer shrink-0 ml-2"
          title={t('viewSourceTooltip')}
        >
          <span className="hidden sm:inline">{t('viewSource')}</span>
          <ExternalLink className="size-3" />
        </button>
      </div>

      {/* ── Formula Bar ──────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-border/40">
        <FormulaBar
          selectedCell={selectedCell}
          formula={currentFormula}
          onChange={setCurrentFormula}
          onRun={handleRunFormula}
          onReset={handleReset}
          isEvaluating={isEvaluating}
          showActions={true}
          isTargetCell={true}
          disabled={false}
        />
      </div>

      {/* ── Quick Formula Chips ──────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border/40 bg-muted/25 overflow-x-auto text-[11px] shrink-0">
        <span className="text-muted-foreground font-semibold shrink-0 flex items-center gap-1">
          <Sparkles className="size-3 text-amber-500" />
          {t('quickFormulas', 'Gợi ý:')}
        </span>
        <button
          type="button"
          onClick={() => handleApplyQuickFormula('=SUM(D2:D8)')}
          className="px-2 py-0.5 rounded-md bg-background border border-border/70 text-foreground/90 hover:text-amber-500 hover:border-amber-500/50 transition-colors shrink-0 font-mono text-[10px] cursor-pointer"
          title={t('quickFormulaSumOutbound', 'Tổng xuất kho')}
        >
          =SUM(D2:D8)
        </button>
        <button
          type="button"
          onClick={() => handleApplyQuickFormula('=SUM(D2:D8)-14210')}
          className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 font-bold transition-colors shrink-0 font-mono text-[10px] cursor-pointer"
          title={t('quickFormulaDiscrepancy', 'Chênh lệch ủy quyền')}
        >
          =SUM(D2:D8)-14210
        </button>
        <button
          type="button"
          onClick={() => handleApplyQuickFormula('=18420-14210')}
          className="px-2 py-0.5 rounded-md bg-background border border-border/70 text-foreground/90 hover:text-amber-500 hover:border-amber-500/50 transition-colors shrink-0 font-mono text-[10px] cursor-pointer"
          title={t('quickFormulaDifference', 'Sai lệch thực tế')}
        >
          =18420-14210
        </button>
      </div>

      {/* ── Spreadsheet Grid ──────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-auto">
        <SpreadsheetGrid
          dataset={gridDataset}
          selectedCell={selectedCell}
          onCellSelect={handleCellSelect}
          cellFormulas={cellFormulas}
          cellValues={gridCellValues}
          editableCells={[]}
          targetCell={selectedCell}
        />
      </div>

      {/* ── Investigation Result Bar ───────────────────────────────────────── */}
      {activeAnalysisResult !== null && (
        <div className={`shrink-0 border-t border-amber-500/20 bg-amber-500/5 pl-4 py-3 relative transition-all ${isHQOpen ? 'pr-4' : 'pr-44 md:pr-48'}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <Info className="size-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-black tracking-widest uppercase text-amber-500 mb-0.5">
                  {t('investigationResult')}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-extrabold text-foreground">
                    {String(activeAnalysisResult)}
                  </span>
                  {analysisResult?.formula && (
                    <span className="font-mono text-xs text-muted-foreground">
                      ({analysisResult.formula})
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOpenFindingModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-amber-950 transition-all shadow-sm cursor-pointer shrink-0"
            >
              <Plus className="size-3.5" />
              {t('recordFinding')}
            </button>
          </div>
        </div>
      )}

      {/* ── Finding Registration Modal ────────────────────────────────────── */}
      {showFindingModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-amber-500" />
                <span className="text-xs font-black tracking-widest uppercase text-foreground">
                  {t('recordFinding')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowFindingModal(false)}
                className="size-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-4 space-y-3">
              {/* Value (read-only display) */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  {t('value')}
                </label>
                <div className="px-3 py-2 rounded-lg bg-muted/40 border border-border text-sm font-mono font-bold text-foreground">
                  {findingValue !== null ? String(findingValue) : '—'}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {t('sourceLabel', { source: sourceTitle })}
                </p>
              </div>

              {/* Claim */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  {t('claim')} <span className="text-rose-400">*</span>
                </label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg bg-muted/40 border border-border text-xs text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                  rows={2}
                  placeholder={t('claimPlaceholder')}
                  value={findingClaim}
                  onChange={e => setFindingClaim(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Context */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  {t('howDerived')}
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg bg-muted/40 border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                  placeholder={t('howDerivedPlaceholder')}
                  value={findingContext}
                  onChange={e => setFindingContext(e.target.value)}
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
              <button
                type="button"
                onClick={() => setShowFindingModal(false)}
                className="flex-1 px-3 py-2 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmFinding}
                disabled={!findingClaim.trim()}
                className="flex-1 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-black transition-colors cursor-pointer"
              >
                {t('recordFinding')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
