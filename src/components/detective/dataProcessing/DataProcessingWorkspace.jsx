import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Search,
  Database,
  MapPin,
  HelpCircle,
  FileSpreadsheet,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookmarkPlus,
  Compass,
} from 'lucide-react';
import { DataSourceSelector } from './DataSourceSelector.jsx';
import { DataExplorer } from './DataExplorer.jsx';
import { SQLProcessor } from './SQLProcessor.jsx';
import { ExcelProcessor } from './ExcelProcessor.jsx';
import { ResultViewer } from './ResultViewer.jsx';
import { RecordFindingPanel } from './RecordFindingPanel.jsx';
import { createSqlEngine } from '../../../utils/sql/index.js';
import { investigationStateService } from '../../../services/investigationSessionService.js';

/**
 * Normalizes tabular or SQL data sources into SQLite-ready tables and schema.
 */
function normalizeSources(rawSources = []) {
  if (!rawSources || rawSources.length === 0) {
    return { tables: [], sqlDataset: null, activeSource: null };
  }

  const tables = [];

  rawSources.forEach((src, idx) => {
    const rawDataset = src.dataset || src;
    const tableName = (src.tableName || src.id || `table_${idx + 1}`)
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_');

    // Case A: Dataset is already an SQL dataset with `tables`
    if (rawDataset?.tables && Array.isArray(rawDataset.tables)) {
      rawDataset.tables.forEach((t) => {
        // If src explicitly restricts to a tableName, filter out other tables from the dataset
        if (src.tableName && t.name.toLowerCase() !== src.tableName.toLowerCase()) {
          return;
        }
        tables.push({
          name: t.name,
          title: t.title || src.title || t.name,
          columns: t.columns || [],
          rows: t.rows || [],
          rowCount: t.rows?.length || 0,
          sampleRows: (t.rows || []).slice(0, 3),
        });
      });
      return;
    }

    // Case B: Tabular dataset with { schema: [{name, type}], rows: [{...}] }
    if (rawDataset?.schema && Array.isArray(rawDataset.schema)) {
      const columns = rawDataset.schema.map((col) => {
        const typeStr = String(col.type || '').toLowerCase();
        let sqlType = 'TEXT';
        if (typeStr.includes('int')) sqlType = 'INTEGER';
        else if (typeStr.includes('num') || typeStr.includes('float') || typeStr.includes('real')) sqlType = 'REAL';

        return {
          name: col.name,
          type: sqlType,
          isPrimaryKey: Boolean(col.isPrimaryKey || col.name === 'id'),
        };
      });

      // Convert rows to 2D array if they are objects
      const rows = (rawDataset.rows || []).map((row) => {
        if (Array.isArray(row)) return row;
        return rawDataset.schema.map((col) => {
          const val = row[col.name];
          return val !== undefined ? val : null;
        });
      });

      tables.push({
        name: tableName,
        title: src.title || rawDataset.title || tableName,
        columns,
        rows,
        rowCount: rows.length,
        sampleRows: rows.slice(0, 3),
      });
      return;
    }

    // Fallback: Empty table stub
    tables.push({
      name: tableName,
      title: src.title || tableName,
      columns: [{ name: 'id', type: 'INTEGER' }],
      rows: [],
      rowCount: 0,
      sampleRows: [],
    });
  });

  const sqlDataset = {
    id: 'ds-workspace-database',
    version: 1,
    dialect: 'sqlite',
    tables,
  };

  return {
    tables,
    sqlDataset,
    activeSource: rawSources[0] || null,
  };
}

/**
 * DataProcessingWorkspace
 *
 * Reusable Investigation Workspace tool.
 * CASE IS THE PRODUCT. DATA PROCESSING IS AN INVESTIGATION TOOL.
 *
 * Flow:
 *   Step Context & Question -> Data Processing (SQL/Excel) -> Result -> Identify Evidence -> Record Finding -> Note
 */
export function DataProcessingWorkspace({
  step = null,
  caseId = '',
  chapterId = '',
  stepId = '',
  investigationQuestion = '',
  context = null,
  location = '',
  processor = null,
  dataSources = [],
  engineFactory = createSqlEngine,
  onRecordFinding = null,
  onDeleteFinding = null,
  findings = null,
  onClose = null,
  onBack = null,
  savedState = null,
  onSaveState = null,
  userId = 'user-001',
  className = '',
}) {
  const { t } = useTranslation('investigation');

  // ── Step Configuration Resolution ──────────────────────────────────────────
  const effectiveCaseId = step?.caseId || caseId || 'case-default';
  const effectiveChapterId = step?.chapterId || chapterId || '';
  const effectiveStepId = step?.id || stepId || 'step-01';
  const effectiveProcessor = step?.processor || processor || 'sql';
  const effectiveQuestion =
    step?.investigationQuestion?.question ||
    step?.investigationQuestion ||
    investigationQuestion ||
    '';
  const effectiveContext = step?.context || context || {};
  const effectiveLocation = step?.location || location || effectiveContext?.location || '';

  // ── Step Data Sources Restriction ──────────────────────────────────────────
  // Step must explicitly control which datasets are exposed to preserve
  // narrative pacing and investigation difficulty.
  const effectiveSources = useMemo(() => {
    // 1. If step explicitly restricts via availableSources
    if (Array.isArray(step?.availableSources) && step.availableSources.length > 0) {
      if (typeof step.availableSources[0] === 'string') {
        const allowedIds = new Set(step.availableSources.map(String));
        const pool =
          Array.isArray(step?.dataSources) && step.dataSources.length > 0
            ? step.dataSources
            : Array.isArray(dataSources) && dataSources.length > 0
            ? dataSources
            : [];

        const filtered = pool.filter(
          (s) => allowedIds.has(s.id) || allowedIds.has(s.tableName) || allowedIds.has(s.name)
        );
        if (filtered.length > 0) return filtered;

        // If pool didn't have full objects matching allowed IDs, create stubs
        return step.availableSources.map((id) => ({
          id,
          tableName: id,
          title: id,
        }));
      }

      if (typeof step.availableSources[0] === 'object') {
        return step.availableSources;
      }
    }

    // 2. If step.dataSources is explicitly provided
    if (Array.isArray(step?.dataSources)) {
      return step.dataSources;
    }

    // 3. Fallback to dataSources prop
    if (Array.isArray(dataSources)) {
      return dataSources;
    }

    return [];
  }, [step, dataSources]);

  // ── Data Normalization ─────────────────────────────────────────────────────
  const { tables, sqlDataset, activeSource: defaultSource } = useMemo(
    () => normalizeSources(effectiveSources),
    [effectiveSources]
  );

  const [activeSourceId, setActiveSourceId] = useState(defaultSource?.id || null);
  const activeSource = useMemo(() => {
    return effectiveSources.find((s) => s.id === activeSourceId) || defaultSource;
  }, [effectiveSources, activeSourceId, defaultSource]);

  // ── Local State ────────────────────────────────────────────────────────────
  const [queryResult, setQueryResult] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [isContextExpanded, setIsContextExpanded] = useState(false);
  const [isExplorerCollapsed, setIsExplorerCollapsed] = useState(false);
  const [isFindingsPanelCollapsed, setIsFindingsPanelCollapsed] = useState(false);

  // Findings list (synced from prop or investigationStateService)
  const [localFindings, setLocalFindings] = useState(() => {
    if (findings && Array.isArray(findings)) return findings;
    const st = investigationStateService.getState(effectiveCaseId, userId);
    return st.findings || [];
  });

  const onInsertTextRef = useRef(null);

  // ── Findings Handlers ──────────────────────────────────────────────────────
  const handleRecordFinding = useCallback(
    (findingData) => {
      const fullFindingData = {
        ...findingData,
        caseId: effectiveCaseId,
        chapterId: effectiveChapterId,
        stepId: effectiveStepId,
      };

      // 1. If parent provided callback, call it
      if (onRecordFinding) {
        onRecordFinding(fullFindingData);
      } else {
        // 2. Otherwise persist directly via investigationStateService
        const nextState = investigationStateService.recordFinding(
          effectiveCaseId,
          userId,
          fullFindingData
        );
        setLocalFindings(nextState.findings || []);
      }

      // Update local findings if using local state
      if (!onRecordFinding) {
        const nextState = investigationStateService.getState(effectiveCaseId, userId);
        setLocalFindings(nextState.findings || []);
      }
    },
    [effectiveCaseId, effectiveChapterId, effectiveStepId, userId, onRecordFinding]
  );

  const handleDeleteFinding = useCallback(
    (findingId) => {
      if (onDeleteFinding) {
        onDeleteFinding(findingId);
      } else {
        const nextState = investigationStateService.deleteFinding(
          effectiveCaseId,
          userId,
          findingId
        );
        setLocalFindings(nextState.findings || []);
      }
    },
    [effectiveCaseId, userId, onDeleteFinding]
  );

  // ── Row & Evidence Selection ───────────────────────────────────────────────
  const handleSelectRow = (index, rowData) => {
    setSelectedRowIndex(index);
    setSelectedEvidence({
      row: rowData,
      rowIndex: index,
      cellValue: Array.isArray(rowData) ? rowData[0] : Object.values(rowData)[0],
    });
  };

  const handleUseAsFinding = (rowData, cellValue, address = '') => {
    setSelectedEvidence({
      row: rowData,
      cellValue: cellValue,
      address,
    });
  };

  const handleInsertText = (text) => {
    if (onInsertTextRef.current) {
      onInsertTextRef.current(text);
    }
  };

  const activeFindingsList = findings && Array.isArray(findings) ? findings : localFindings;

  return (
    <div className={`flex flex-col h-full bg-background text-foreground overflow-hidden ${className}`}>
      {/* ── 1. Step Context & Investigation Question Top Banner ─────────────── */}
      <div className="border-b border-border/80 bg-card/90 px-4 py-3 shrink-0 shadow-xs">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Back button & Step Location */}
          <div className="flex items-center gap-2.5">
            {(onBack || onClose) && (
              <button
                type="button"
                onClick={onBack || onClose}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-border/70 hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                title={t('dataProcessing.backToCase')}
              >
                <ArrowLeft className="size-3.5" />
                <span className="hidden sm:inline">{t('dataProcessing.backToCase')}</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-mono text-[11px] font-bold">
                <Compass className="size-3" />
                {effectiveStepId.toUpperCase()}
              </span>

              {effectiveLocation && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                  <MapPin className="size-3 text-amber-500 shrink-0" />
                  <span className="truncate max-w-[200px]">{effectiveLocation}</span>
                </div>
              )}
            </div>
          </div>

          {/* Data Sources Selector */}
          <DataSourceSelector
            dataSources={effectiveSources}
            activeSourceId={activeSourceId}
            onSelectSource={setActiveSourceId}
          />
        </div>

        {/* Investigation Question Prompt */}
        <div className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-950 dark:text-amber-200">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <span className="text-amber-500 font-bold mt-0.5 shrink-0">❓</span>
              <div>
                <p className="font-bold text-foreground text-xs leading-snug">
                  {effectiveQuestion || t('dataProcessing.investigationQuestion')}
                </p>
                {effectiveContext?.narrative && (
                  <p
                    className={`text-[11px] text-muted-foreground mt-1 leading-relaxed ${
                      isContextExpanded ? '' : 'line-clamp-1'
                    }`}
                  >
                    {effectiveContext.narrative}
                  </p>
                )}
              </div>
            </div>

            {effectiveContext?.narrative && (
              <button
                type="button"
                onClick={() => setIsContextExpanded(!isContextExpanded)}
                className="text-muted-foreground hover:text-foreground text-[10px] flex items-center gap-0.5 shrink-0 cursor-pointer pt-0.5"
              >
                {isContextExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. Master 3-Column Workspace ────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex overflow-hidden p-3 gap-3">
        {/* Left: Data Explorer (Collapsible) */}
        {!isExplorerCollapsed && (
          <div className="w-64 xl:w-72 shrink-0 h-full flex flex-col">
            <DataExplorer
              tables={tables}
              activeTableName={activeSource?.tableName || tables[0]?.name}
              onSelectTable={(tableName) => {
                const matched = effectiveSources.find((s) => s.tableName === tableName || s.id === tableName);
                if (matched) setActiveSourceId(matched.id);
              }}
              onInsertText={handleInsertText}
            />
          </div>
        )}

        {/* Center: Processing Area + Result Viewer */}
        <div className="flex-1 min-w-0 h-full flex flex-col gap-3">
          {/* Top Half: Processor (SQL or Excel) */}
          <div className="h-[46%] min-h-[170px] shrink-0">
            {effectiveProcessor === 'sql' ? (
              <SQLProcessor
                sqlDataset={sqlDataset}
                engineFactory={engineFactory}
                onExecuteStart={() => {
                  setIsExecuting(true);
                  setQueryResult(null);
                  setSelectedRowIndex(null);
                }}
                onExecuteSuccess={(result, executedQuery) => {
                  setIsExecuting(false);
                  setQueryResult(result);
                  setCurrentQuery(executedQuery);
                }}
                onExecuteError={(err) => {
                  setIsExecuting(false);
                  setQueryResult(err);
                }}
                onInsertTextRef={onInsertTextRef}
              />
            ) : (
              <ExcelProcessor
                dataset={activeSource?.dataset}
                activeSourceTitle={activeSource?.title}
                onSelectDataValue={(val, address) => {
                  setSelectedEvidence({ cellValue: val, address });
                }}
                onUseAsFinding={handleUseAsFinding}
              />
            )}
          </div>

          {/* Bottom Half: Result Viewer */}
          <div className="flex-1 min-h-[180px] overflow-hidden">
            <ResultViewer
              result={queryResult}
              isExecuting={isExecuting}
              selectedRowIndex={selectedRowIndex}
              onSelectRow={handleSelectRow}
              onUseAsFinding={(row, cellValues) => {
                handleUseAsFinding(row, cellValues[0]);
              }}
              onReferenceEvidence={(row, cellValues) => {
                handleUseAsFinding(row, cellValues[0]);
              }}
            />
          </div>
        </div>

        {/* Right: Record Finding Panel (Collapsible) */}
        {!isFindingsPanelCollapsed && (
          <div className="w-72 xl:w-80 shrink-0 h-full flex flex-col">
            <RecordFindingPanel
              caseId={effectiveCaseId}
              chapterId={effectiveChapterId}
              stepId={effectiveStepId}
              activeSource={activeSource}
              currentQuery={currentQuery}
              selectedEvidence={selectedEvidence}
              onClearEvidence={() => setSelectedEvidence(null)}
              onRecordFinding={handleRecordFinding}
              onDeleteFinding={handleDeleteFinding}
              recordedFindings={activeFindingsList}
            />
          </div>
        )}
      </div>
    </div>
  );
}
