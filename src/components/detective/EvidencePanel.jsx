import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, MessageSquare, Archive, X } from 'lucide-react';
import { SpreadsheetGrid } from '../excel/SpreadsheetGrid.jsx';

/**
 * EvidencePanel
 * Displays the content of the currently selected source.
 * Rendering mode is determined by source.type — not hardcoded to Excel or SQL.
 */
export function EvidencePanel({
  source,
  dataset,
  openSourceIds = [],
  caseData,
  onSelectTab,
  onClose,
  onSelectDataValue,
  activeFieldId,
  onInvestigateInSpreadsheet,
}) {
  const { t } = useTranslation('investigation');

  if (!source) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="size-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
          <Archive className="size-5 text-muted-foreground/40" />
        </div>
        <p className="text-sm font-semibold text-foreground/60">{t('noEvidenceSelected')}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {t('noEvidenceDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Source Tabs ── */}
      {openSourceIds.length > 0 && (
        <div className="flex items-center gap-0 border-b border-border/60 bg-card/60 overflow-x-auto shrink-0 scrollbar-thin">
          {openSourceIds.map(sourceId => {
            const src = caseData?.sources?.find(s => s.id === sourceId);
            if (!src) return null;
            const isActive = source.id === sourceId;
            return (
              <button
                key={sourceId}
                type="button"
                onClick={() => onSelectTab?.(sourceId)}
                className={`
                  flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors shrink-0 border-b-2
                  ${isActive
                    ? 'border-amber-500 text-foreground bg-background'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }
                `}
              >
                <span className="truncate max-w-[140px]">{src.title}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Source Header ── */}
      <div className="px-4 py-2.5 border-b border-border/60 bg-card/40 shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest uppercase text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                {source.type.replace(/_/g, ' ')}
              </span>
            </div>
            <h3 className="text-sm font-bold text-foreground mt-0.5">
              {source.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {source.description}
            </p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="size-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        {/* Investigate in Spreadsheet CTA — only on table sources */}
        {(source.type === 'table' || source.type === 'sql_table') && onInvestigateInSpreadsheet && (
          <button
            type="button"
            onClick={() => onInvestigateInSpreadsheet(source.id, dataset)}
            className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer w-full"
            title={t('investigateInSpreadsheetTooltip')}
          >
            <span className="text-emerald-500">⚗</span>
            {t('investigateInSpreadsheet')}
          </button>
        )}
      </div>

      {/* ── Source Content ── */}
      <div className="flex-1 overflow-auto min-h-0">
        {/* Table source — renders as data grid */}
        {(source.type === 'table' || source.type === 'sql_table') && dataset && (
          <EvidenceTable
            dataset={dataset}
            onSelectDataValue={onSelectDataValue}
            activeFieldId={activeFieldId}
          />
        )}

        {/* Document source — renders as formatted text */}
        {source.type === 'document' && source.content && (
          <EvidenceDocument
            content={source.content}
            onSelectDataValue={onSelectDataValue}
          />
        )}

        {/* Witness statement — renders as formal statement */}
        {source.type === 'witness' && source.content && (
          <WitnessStatement
            content={source.content}
            onSelectDataValue={onSelectDataValue}
          />
        )}
      </div>
    </div>
  );
}

function EvidenceTable({ dataset, onSelectDataValue, activeFieldId }) {
  const { t } = useTranslation('investigation');

  if (!dataset?.rows || !dataset?.schema) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        {t('noDataAvailable')}
      </div>
    );
  }

  return (
    <div className="p-3 h-full overflow-auto">
      {/* Dataset title & Click-to-Fill banner */}
      <div className="mb-2 flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
            {dataset.title}
          </p>
          {dataset.description && (
            <p className="text-[10px] text-muted-foreground mt-0.5">{dataset.description}</p>
          )}
        </div>
        {onSelectDataValue && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-md text-[10px] text-amber-700 dark:text-amber-300 font-medium">
            <span>{t('clickToFillTitle')}</span>
            <span className="text-muted-foreground">{t('clickToFillDesc')}</span>
          </div>
        )}
      </div>

      {/* Data table */}
      <div className="overflow-auto rounded-xl border border-border/60">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/60 bg-muted/40">
              {dataset.schema.map(col => (
                <th
                  key={col.name}
                  className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataset.rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className={`border-b border-border/40 transition-colors hover:bg-muted/20 ${
                  rIdx % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                }`}
              >
                {dataset.schema.map(col => {
                  const value = row[col.name];
                  // Highlight cells with suspicious/missing data
                  const isEmpty = value === null || value === undefined || value === '' || value === '—';
                  return (
                    <td
                      key={col.name}
                      onClick={() => {
                        if (!isEmpty && onSelectDataValue) {
                          onSelectDataValue(String(value));
                        }
                      }}
                      title={!isEmpty && onSelectDataValue ? t('clickToFillAction', { value }) : undefined}
                      className={`px-3 py-2 whitespace-nowrap transition-colors ${
                        isEmpty
                          ? 'text-rose-500 dark:text-rose-400 font-medium italic'
                          : 'text-foreground hover:bg-amber-500/20 hover:text-amber-700 dark:hover:text-amber-300 cursor-pointer active:scale-95'
                      } ${col.type === 'number' ? 'text-right tabular-nums' : ''}`}
                    >
                      {isEmpty ? '—' : String(value)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-muted-foreground mt-2 text-right">
        {dataset.rows.length} {t('records')}
      </p>
    </div>
  );
}

function EvidenceDocument({ content, onSelectDataValue }) {
  const { t } = useTranslation('investigation');

  const handleDoubleClick = () => {
    const selection = window.getSelection()?.toString().trim();
    if (selection && onSelectDataValue) {
      onSelectDataValue(selection);
    }
  };

  return (
    <div className="p-4 max-w-prose mx-auto">
      <div className="rounded-xl border border-border/60 bg-card/60 p-4">
        <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <FileText className="size-3.5 text-muted-foreground" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
              {t('officialDocument')}
            </span>
          </div>
          {onSelectDataValue && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400">
              {t('highlightToFill')}
            </span>
          )}
        </div>
        <pre
          onDoubleClick={handleDoubleClick}
          className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap font-sans selection:bg-amber-500/30 cursor-text"
        >
          {content}
        </pre>
      </div>
    </div>
  );
}

function WitnessStatement({ content, onSelectDataValue }) {
  const { t } = useTranslation('investigation');

  const handleDoubleClick = () => {
    const selection = window.getSelection()?.toString().trim();
    if (selection && onSelectDataValue) {
      onSelectDataValue(selection);
    }
  };

  return (
    <div className="p-4 max-w-prose mx-auto">
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
        <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-emerald-500/20">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
              {t('witnessStatement')}
            </span>
          </div>
          {onSelectDataValue && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
              {t('highlightToFill')}
            </span>
          )}
        </div>
        <pre
          onDoubleClick={handleDoubleClick}
          className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap font-sans selection:bg-emerald-500/30 cursor-text"
        >
          {content}
        </pre>
      </div>
    </div>
  );
}
