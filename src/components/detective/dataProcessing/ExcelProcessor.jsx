import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FileSpreadsheet, Plus, CheckCircle2 } from 'lucide-react';
import { FormulaBar } from '../../excel/FormulaBar.jsx';
import { SpreadsheetGrid } from '../../excel/SpreadsheetGrid.jsx';
import { analyzeExcelFormula, normalizeFormula } from '../../../utils/excelChecker.js';

/**
 * ExcelProcessor
 *
 * Provides Excel calculation and formula inspection capability within the Data Processing Workspace.
 * Reuses the existing SpreadsheetGrid, FormulaBar, and excelChecker utilities.
 */
export function ExcelProcessor({
  dataset = null,
  activeSourceTitle = '',
  onSelectDataValue = null,
  onUseAsFinding = null,
  className = '',
}) {
  const { t } = useTranslation('investigation');

  const [selectedCell, setSelectedCell] = useState(null); // e.g. "D2"
  const [activeFormula, setActiveFormula] = useState('');
  const [calculationResult, setCalculationResult] = useState(null);

  // Adapt dataset for grid: { columns: [{key, name, type}], rows: [...] }
  const adaptedData = useMemo(() => {
    if (!dataset) return { columns: [], rows: [] };
    const columns = (dataset.schema || []).map((col, idx) => ({
      key: col.name,
      name: col.label || col.name,
      type: col.type || 'string',
      excelColumn: col.excelColumn || String.fromCharCode(65 + idx),
    }));
    return { columns, rows: dataset.rows || [] };
  }, [dataset]);

  // Build sheetData lookup for formulas: { 'A2': 'ORD-1835', 'D2': 2100, ... }
  const sheetLookup = useMemo(() => {
    const lookup = {};
    if (!adaptedData.rows || !adaptedData.columns) return lookup;

    adaptedData.rows.forEach((row, rIdx) => {
      const rowNum = rIdx + 2; // header is row 1
      adaptedData.columns.forEach((col) => {
        const address = `${col.excelColumn}${rowNum}`;
        lookup[address] = row[col.key];
      });
    });

    return lookup;
  }, [adaptedData]);

  const handleCellSelect = (cell) => {
    // cell can be address like 'D2' or object { row, col }
    const address = typeof cell === 'string' ? cell : `${cell?.col || 'A'}${cell?.row || 2}`;
    setSelectedCell(address);
    const val = sheetLookup[address];
    setActiveFormula(val !== undefined ? String(val) : '');

    if (onSelectDataValue && val !== undefined) {
      onSelectDataValue(val, address);
    }
  };

  const handleFormulaChange = (newFormula) => {
    setActiveFormula(newFormula);

    if (newFormula && newFormula.trim().startsWith('=')) {
      const evalRes = analyzeExcelFormula(newFormula, sheetLookup);
      if (evalRes.valid) {
        setCalculationResult(evalRes.value);
      } else {
        setCalculationResult(null);
      }
    } else {
      setCalculationResult(null);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-card/60 rounded-2xl border border-border/80 overflow-hidden ${className}`}>
      {/* Excel Header */}
      <div className="flex items-center justify-between gap-3 px-3.5 py-2 border-b border-border/70 bg-card/90">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <FileSpreadsheet className="size-3.5" />
          </div>
          <span className="text-xs font-bold text-foreground">
            {t('dataProcessing.excelFormula')}
          </span>
          {activeSourceTitle && (
            <span className="text-[11px] text-muted-foreground font-mono truncate max-w-[200px]">
              · {activeSourceTitle}
            </span>
          )}
        </div>

        {calculationResult !== null && onUseAsFinding && (
          <button
            type="button"
            onClick={() => onUseAsFinding(null, calculationResult, activeFormula)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-xs font-bold text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
          >
            <Plus className="size-3" />
            <span>{t('dataProcessing.useAsFinding')}: {calculationResult}</span>
          </button>
        )}
      </div>

      {/* Formula Bar */}
      <div className="border-b border-border/60 bg-background/50">
        <FormulaBar
          activeCell={selectedCell || 'A2'}
          formulaValue={activeFormula}
          onChangeFormula={handleFormulaChange}
          onRunFormula={() => {}}
          disabled={false}
        />
      </div>

      {/* Spreadsheet Grid */}
      <div className="flex-1 overflow-auto p-2">
        <SpreadsheetGrid
          columns={adaptedData.columns}
          rows={adaptedData.rows}
          onSelectCell={handleCellSelect}
          activeCell={selectedCell}
        />
      </div>
    </div>
  );
}
