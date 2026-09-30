import React from 'react';
import { useTranslation } from 'react-i18next';
import { Database, FileSpreadsheet, Layers } from 'lucide-react';

/**
 * DataSourceSelector
 *
 * Allows switching between active data sources defined in Step configuration,
 * or displays an informative badge when single data source is active.
 */
export function DataSourceSelector({
  dataSources = [],
  activeSourceId = null,
  onSelectSource = null,
  className = '',
}) {
  const { t } = useTranslation('investigation');

  if (!dataSources || dataSources.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 overflow-x-auto py-1 ${className}`}>
      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1 shrink-0">
        <Layers className="size-3.5 text-amber-500" />
        {t('dataProcessing.dataSource')}:
      </span>

      <div className="flex items-center gap-1.5 flex-wrap">
        {dataSources.map((source) => {
          const isActive = source.id === activeSourceId || (!activeSourceId && dataSources[0]?.id === source.id);
          const isTable = source.type === 'table' || source.type === 'sql_table';

          return (
            <button
              key={source.id}
              type="button"
              onClick={() => onSelectSource && onSelectSource(source.id)}
              disabled={!onSelectSource || dataSources.length <= 1}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                isActive
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 shadow-xs'
                  : 'bg-muted/40 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/70'
              } disabled:cursor-default`}
            >
              {isTable ? (
                <Database className="size-3 text-amber-500 shrink-0" />
              ) : (
                <FileSpreadsheet className="size-3 text-emerald-500 shrink-0" />
              )}
              <span className="truncate max-w-[140px]">{source.title || source.tableName || source.id}</span>
              {typeof source.rowCount === 'number' && (
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-background/60 text-muted-foreground">
                  {source.rowCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
