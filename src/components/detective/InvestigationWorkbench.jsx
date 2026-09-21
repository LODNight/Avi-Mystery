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
// Evaluates simple formulas against the workbench grid data.
// Evidence rows are indexed 2..N+1 (row 1 is header).
// Analysis rows start at N+2.
function evaluateFormula(formula, cellFormulas, cellValues, evidenceRows, schema) {
  if (!formula.startsWith('=')) {
    const num = parseFloat(formula);
    return isNaN(num) ? formula : num;
  }

  try {
    // Build a column-key → excelColumn mapping
    const colMap = {}; // 'A' → schema[0].name
    (schema || []).forEach((col, i) => {
      colMap[String.fromCharCode(65 + i)] = col.name;
    });

    let expr = formula.slice(1).toUpperCase();

    // Replace SUM(colLetter:rowStart:colLetter:rowEnd) style
    // Support: SUM(D2:D8), SUM(D2:D9)
    expr = expr.replace(/SUM\(([A-Z])(\d+):([A-Z])(\d+)\)/gi, (_, colA, r1, colB, r2) => {
      const colKey = colMap[colA];
      if (!colKey) return 'NaN';
      const start = parseInt(r1) - 2; // row 2 = index 0
      const end = parseInt(r2) - 2;
      let total = 0;
      for (let i = start; i <= end && i < evidenceRows.length; i++) {
        if (i >= 0) {
          const val = parseFloat(evidenceRows[i]?.[colKey]);
          if (!isNaN(val)) total += val;
        }
      }
      return total;
    });

    // Replace COUNT(colLetter:rowStart:colLetter:rowEnd)
    expr = expr.replace(/COUNT\(([A-Z])(\d+):([A-Z])(\d+)\)/gi, (_, colA, r1, colB, r2) => {
      const colKey = colMap[colA];
      if (!colKey) return '0';
      const start = parseInt(r1) - 2;
      const end = parseInt(r2) - 2;
      let count = 0;
      for (let i = start; i <= end && i < evidenceRows.length; i++) {
        if (i >= 0 && evidenceRows[i]?.[colKey] !== undefined) count++;
      }
      return count;
    });

    // Replace cell references (A2, D5, etc.) for analysis cells
    expr = expr.replace(/([A-Z])(\d+)/g, (match, col, row) => {
      const cellId = `${col}${row}`;
      if (cellValues[cellId] !== undefined) return cellValues[cellId];
      if (cellFormulas[cellId]) {
        const v = evaluateFormula(cellFormulas[cellId], cellFormulas, cellValues, evidenceRows, schema);
        return v;
      }
      // Evidence row reference
      const colKey = colMap[col];
      const rowIdx = parseInt(row) - 2;
      if (colKey && rowIdx >= 0 && rowIdx < evidenceRows.length) {
        const val = evidenceRows[rowIdx][colKey];
        return typeof val === 'number' ? val : `"${val}"`;
      }
      return 0;
    });

    // eslint-disable-next-line no-new-func
    const result = new Function(`return ${expr}`)();
    return typeof result === 'number' ? Math.round(result * 100) / 100 : result;
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
  const [selectedCell, setSelectedCell] = useState(workbenchState?.selectedCell || `A${evidenceRows.length + 3}`);
  const [currentFormula, setCurrentFormula] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);

  // ── Finding registration modal state ─────────────────────────────────────
  const [showFindingModal, setShowFindingModal] = useState(false);
  const [findingClaim, setFindingClaim] = useState('');
  const [findingContext, setFindingContext] = useState('');
  const [findingValue, setFindingValue] = useState(null);

  const formulaInputRef = useRef(null);

  // ── Determine analysis row range ──────────────────────────────────────────
  // Evidence rows: 2 to N+1. Analysis rows: N+2 onward.
  const analysisRowStart = evidenceRows.length + 2;

  const isEvidenceRow = useCallback((cellAddr) => {
    const rowNum = parseInt(cellAddr?.replace(/[A-Z]/g, ''));
    return rowNum >= 2 && rowNum <= evidenceRows.length + 1;
  }, [evidenceRows.length]);

  const isAnalysisRow = useCallback((cellAddr) => {
    const rowNum = parseInt(cellAddr?.replace(/[A-Z]/g, ''));
    return rowNum >= analysisRowStart;
  }, [analysisRowStart]);

  // ── Active analysis result ────────────────────────────────────────────────
  const activeAnalysisResult = useMemo(() => {
    if (!selectedCell || !isAnalysisRow(selectedCell)) return null;
    const val = cellValues[selectedCell];
    if (val === undefined || val === null || val === '') return null;
    return val;
  }, [selectedCell, cellValues, isAnalysisRow]);

  // ── Build grid dataset for SpreadsheetGrid ────────────────────────────────
  const gridDataset = useMemo(() => adaptDatasetForGrid(dataset), [dataset]);

  // Analysis rows appended below evidence data
  const ANALYSIS_ROW_COUNT = 6;
  const gridWithAnalysis = useMemo(() => {
    if (!gridDataset) return null;
    const analysisRows = Array.from({ length: ANALYSIS_ROW_COUNT }, (_, i) => {
      const rowObj = {};
      gridDataset.columns.forEach(col => { rowObj[col.key] = ''; });
      rowObj.__isAnalysis = true;
      rowObj.__rowIndex = i;
      return rowObj;
    });
    return {
      ...gridDataset,
      rows: [...(gridDataset.rows || []), analysisRows[0]], // separator marker
      analysisRows,
    };
  }, [gridDataset]);

  // ── Build editableCells for SpreadsheetGrid ───────────────────────────────
  // Only analysis row cells are editable; evidence rows stay read-only.
  const editableCells = useMemo(() => {
    if (!gridDataset) return [];
    const cells = [];
    const cols = gridDataset.columns.map((_, i) => String.fromCharCode(65 + i));
    for (let row = analysisRowStart; row < analysisRowStart + ANALYSIS_ROW_COUNT; row++) {
      cols.forEach(col => cells.push(`${col}${row}`));
    }
    return cells;
  }, [gridDataset, analysisRowStart]);

  // ── Handle cell selection ─────────────────────────────────────────────────
  const handleCellSelect = useCallback((cellAddr) => {
    setSelectedCell(cellAddr);
    if (isEvidenceRow(cellAddr)) {
      // Evidence cell: show its value in formula bar as read-only reference
      const col = cellAddr.replace(/\d/g, '');
      const row = parseInt(cellAddr.replace(/[A-Z]/g, '')) - 2;
      const colKey = schema[col.charCodeAt(0) - 65]?.name;
      const val = colKey ? (evidenceRows[row]?.[colKey] ?? '') : '';
      setCurrentFormula(String(val));
    } else if (isAnalysisRow(cellAddr)) {
      setCurrentFormula(cellFormulas[cellAddr] || cellValues[cellAddr]?.toString() || '');
    }
  }, [cellFormulas, cellValues, evidenceRows, schema, isEvidenceRow, isAnalysisRow]);

  // ── Run formula ───────────────────────────────────────────────────────────
  const handleRunFormula = useCallback(() => {
    if (!selectedCell || !isAnalysisRow(selectedCell)) return;
    const formula = currentFormula.trim();
    if (!formula) return;

    setIsEvaluating(true);
    setTimeout(() => {
      const result = evaluateFormula(formula, cellFormulas, cellValues, evidenceRows, schema);
      const nextFormulas = { ...cellFormulas, [selectedCell]: formula };
      const nextValues = { ...cellValues, [selectedCell]: result };
      setCellFormulas(nextFormulas);
      setCellValues(nextValues);
      setIsEvaluating(false);

      // Persist to investigation state
      onSaveWorkbenchState?.({
        sourceEvidenceId,
        cellFormulas: nextFormulas,
        cellValues: nextValues,
        selectedCell,
      });
    }, 80);
  }, [selectedCell, currentFormula, cellFormulas, cellValues, evidenceRows, schema, sourceEvidenceId, onSaveWorkbenchState, isAnalysisRow]);

  // ── Reset analysis area ───────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setCellFormulas({});
    setCellValues({});
    setCurrentFormula('');
    onSaveWorkbenchState?.({
      sourceEvidenceId,
      cellFormulas: {},
      cellValues: {},
      selectedCell,
    });
  }, [sourceEvidenceId, selectedCell, onSaveWorkbenchState]);

  // ── Open finding modal ────────────────────────────────────────────────────
  const handleOpenFindingModal = () => {
    const val = activeAnalysisResult;
    setFindingValue(val);
    // Pre-populate claim based on context
    setFindingClaim(val !== null && val !== undefined ? t('workbench:valueDerivedFromAnalysis', { value: val }) : '');
    setFindingContext(t('workbench:analysisContext', { source: sourceTitle || t('common:evidenceData') }));
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

  // ── Build SpreadsheetGrid cell values (evidence + analysis) ──────────────
  // Map evidence data into cellValues format for the grid
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
          isTargetCell={isAnalysisRow(selectedCell)}
          disabled={isEvidenceRow(selectedCell)}
        />
      </div>

      {/* ── Grid Area ────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-auto">
        {/* Evidence data label */}
        <div className="px-3 py-1 bg-blue-500/5 border-b border-blue-500/10 flex items-center gap-1.5">
          <div className="size-1.5 rounded-full bg-blue-400" />
          <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
            {t('evidenceDataReadOnly')}
          </span>
          <span className="text-[10px] text-muted-foreground ml-auto">
            {sourceTitle}
          </span>
        </div>

        <SpreadsheetGrid
          dataset={gridDataset}
          selectedCell={selectedCell}
          onCellSelect={handleCellSelect}
          cellFormulas={cellFormulas}
          cellValues={gridCellValues}
          editableCells={editableCells}
          targetCell={selectedCell}
        />

        {/* Analysis area label */}
        <div className="px-3 py-1 bg-amber-500/5 border-y border-amber-500/10 flex items-center gap-1.5">
          <div className="size-1.5 rounded-full bg-amber-400" />
          <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
            {t('analysisAreaLabel')}
          </span>
          <span className="text-[10px] text-muted-foreground ml-auto">
            {t('rowXPlus', { row: analysisRowStart })}
          </span>
        </div>

        {/* Analysis rows (editable) */}
        <div className="bg-background/40">
          {Array.from({ length: ANALYSIS_ROW_COUNT }, (_, i) => {
            const rowNum = analysisRowStart + i;
            const cols = (gridDataset?.columns || []);
            return (
              <div key={rowNum} className="flex border-b border-border/20">
                {/* Row number */}
                <div className="w-8 shrink-0 flex items-center justify-center text-[10px] text-muted-foreground/40 border-r border-border/20 bg-muted/10">
                  {rowNum}
                </div>
                {cols.map((col, colIdx) => {
                  const colLetter = String.fromCharCode(65 + colIdx);
                  const cellAddr = `${colLetter}${rowNum}`;
                  const isSelected = selectedCell === cellAddr;
                  const val = cellValues[cellAddr];
                  const formula = cellFormulas[cellAddr];
                  return (
                    <button
                      key={cellAddr}
                      type="button"
                      onClick={() => handleCellSelect(cellAddr)}
                      className={`
                        flex-1 min-w-0 h-7 px-2 text-left text-xs border-r border-border/20 transition-colors
                        ${isSelected
                          ? 'bg-amber-500/10 ring-1 ring-inset ring-amber-500/50 text-foreground'
                          : 'hover:bg-muted/30 text-foreground/80'
                        }
                      `}
                    >
                      <span className="truncate block">
                        {formula ? (
                          val !== undefined
                            ? <span className={val === '#ERROR' ? 'text-rose-400' : 'text-emerald-400'}>{String(val)}</span>
                            : <span className="text-muted-foreground italic">{formula}</span>
                        ) : (
                          <span className="text-muted-foreground/30">—</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Investigation Result ──────────────────────────────────────────── */}
      {activeAnalysisResult !== null && (
        <div className={`shrink-0 border-t border-amber-500/20 bg-amber-500/5 pl-4 py-3 relative transition-all ${isHQOpen ? 'pr-4' : 'pr-44 md:pr-48'}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-start gap-2 min-w-0">
              <Info className="size-3.5 text-amber-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-black tracking-widest uppercase text-amber-400 mb-0.5">
                  {t('investigationResult')}
                </p>
                <p className="text-sm font-bold text-foreground">
                  {String(activeAnalysisResult)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {t('cellSourceDesc', { cell: selectedCell, source: sourceTitle })}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOpenFindingModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-bold text-black transition-colors cursor-pointer shrink-0"
            >
              <Plus className="size-3" />
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
