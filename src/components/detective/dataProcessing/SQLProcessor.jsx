import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, RotateCcw, Database, AlertCircle, Loader2 } from 'lucide-react';
import { SqlEditor } from '../../sql/SqlEditor.jsx';
import { createSqlEngine, validateTableScope } from '../../../utils/sql/index.js';

const DEFAULT_QUERY = '-- Viết câu lệnh SQL để điều tra dữ liệu...\nSELECT * FROM ';

/**
 * SQLProcessor
 *
 * Wraps the existing SqlEngineAdapter (WASM SQLite) for the Data Processing Workspace.
 * Preserves read-only enforcement and execution timeout guards.
 */
export function SQLProcessor({
  sqlDataset = null,
  initialQuery = '',
  engineFactory = createSqlEngine,
  onExecuteStart = null,
  onExecuteSuccess = null,
  onExecuteError = null,
  onInsertTextRef = null,
  className = '',
}) {
  const { t } = useTranslation('investigation');
  const [query, setQuery] = useState(() => initialQuery || DEFAULT_QUERY);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const [initError, setInitError] = useState(null);

  const engineRef = useRef(null);

  // Expose text insertion handler to parent (via ref or callback)
  const handleInsertText = useCallback((text) => {
    setQuery((prev) => {
      // If query is default or empty, append nicely
      if (!prev || prev.trim() === '') {
        return `SELECT * FROM ${text} LIMIT 20;`;
      }
      return `${prev} ${text}`;
    });
  }, []);

  useEffect(() => {
    if (onInsertTextRef) {
      onInsertTextRef.current = handleInsertText;
    }
  }, [onInsertTextRef, handleInsertText]);

  // Clean up previous engine
  const disposeEngine = useCallback(async () => {
    const engine = engineRef.current;
    engineRef.current = null;
    if (engine) {
      try {
        await engine.dispose();
      } catch {
        // teardown ignore
      }
    }
  }, []);

  // Initialize engine and load dataset whenever sqlDataset changes
  useEffect(() => {
    let cancelled = false;

    async function setupEngine() {
      if (!sqlDataset) return;
      setIsInitializing(true);
      setInitError(null);
      setEngineReady(false);

      await disposeEngine();
      if (cancelled) return;

      try {
        const engine = engineFactory();
        engineRef.current = engine;

        await engine.initialize();
        if (cancelled) return;

        await engine.loadDataset(sqlDataset);
        if (cancelled) return;

        setEngineReady(true);
        setIsInitializing(false);

        // Auto-populate default table if query was empty
        if (!initialQuery && sqlDataset.tables?.[0]?.name) {
          setQuery(`SELECT * FROM ${sqlDataset.tables[0].name} LIMIT 20;`);
        }
      } catch (err) {
        if (cancelled) return;
        setInitError(err.message || 'Không thể khởi tạo cơ sở dữ liệu.');
        setIsInitializing(false);
      }
    }

    void setupEngine();

    return () => {
      cancelled = true;
      void disposeEngine();
    };
  }, [sqlDataset, engineFactory, disposeEngine, initialQuery]);

  // Execute current query
  const handleRun = useCallback(async () => {
    if (isExecuting || isInitializing || !engineReady || !engineRef.current) return;

    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    // Validate Step table scoping before execution
    if (sqlDataset?.tables && Array.isArray(sqlDataset.tables)) {
      const allowedTableNames = sqlDataset.tables.map((t) => t.name);
      try {
        validateTableScope(trimmedQuery, allowedTableNames);
      } catch (scopeError) {
        setIsExecuting(false);
        const errPayload = {
          errorCode: scopeError.code || 'SQL_TABLE_UNAVAILABLE',
          message: scopeError.message,
        };
        if (onExecuteError) onExecuteError(errPayload);
        return;
      }
    }

    setIsExecuting(true);
    if (onExecuteStart) onExecuteStart();

    try {
      const res = await engineRef.current.execute(trimmedQuery);
      setIsExecuting(false);

      if (res.errorCode || res.error) {
        if (onExecuteError) onExecuteError(res);
      } else {
        if (onExecuteSuccess) onExecuteSuccess(res, trimmedQuery);
      }
    } catch (err) {
      setIsExecuting(false);
      const errPayload = {
        errorCode: err?.code || 'SQL_RUNTIME_ERROR',
        message: err?.message || 'Lỗi khi thực thi câu lệnh SQL.',
      };
      if (onExecuteError) onExecuteError(errPayload);
    }
  }, [query, isExecuting, isInitializing, engineReady, sqlDataset, onExecuteStart, onExecuteSuccess, onExecuteError]);

  const handleReset = () => {
    const defaultTable = sqlDataset?.tables?.[0]?.name || '';
    setQuery(defaultTable ? `SELECT * FROM ${defaultTable} LIMIT 20;` : DEFAULT_QUERY);
  };

  return (
    <div className={`flex flex-col h-full bg-card/60 rounded-2xl border border-border/80 overflow-hidden ${className}`}>
      {/* Editor Header / Action Bar */}
      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 border-b border-border/70 bg-card/90">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <Database className="size-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-foreground">
              {t('dataProcessing.sqlQuery')}
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] text-muted-foreground">
              {t('dataProcessing.ctrlEnterHint')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={isExecuting || isInitializing}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-50"
            title={t('dataProcessing.reset')}
          >
            <RotateCcw className="size-3" />
            <span className="hidden sm:inline">{t('dataProcessing.reset')}</span>
          </button>

          <button
            type="button"
            onClick={handleRun}
            disabled={isExecuting || isInitializing || !engineReady}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs transition-all shadow-xs hover:shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExecuting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Play className="size-3.5 fill-current" />
            )}
            <span>{isExecuting ? t('dataProcessing.running') : t('dataProcessing.runQuery')}</span>
          </button>
        </div>
      </div>

      {/* Engine Init Error */}
      {initError && (
        <div className="p-3 bg-destructive/10 border-b border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{initError}</span>
        </div>
      )}

      {/* SQL Editor Area */}
      <div className="flex-1 min-h-[160px] relative">
        <SqlEditor
          value={query}
          onChange={setQuery}
          onRun={handleRun}
          disabled={isExecuting || isInitializing || !engineReady}
          isRunning={isExecuting}
        />
      </div>
    </div>
  );
}
