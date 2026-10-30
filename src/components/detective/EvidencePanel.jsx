import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  MessageSquare,
  Archive,
  X,
  FlaskConical,
  Stamp,
  MousePointerClick,
} from 'lucide-react';

/**
 * EvidencePanel — Zone C (Station 01): Forensic Evidence Examination Desk
 * Displays all unlocked exhibits in a quick-switch ribbon at the top so the detective
 * can flip between Witness Statements, Documents, and Data Ledgers effortlessly.
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
  activeFieldLabel,
  onInvestigateInSpreadsheet,
}) {
  const { t } = useTranslation('investigation');

  // Show all unlocked sources in the exhibit switcher ribbon so users don't get stuck
  const unlockedSources =
    caseData?.sources?.filter(s => s.isUnlocked) ||
    openSourceIds.map(id => caseData?.sources?.find(s => s.id === id)).filter(Boolean);

  if (!source) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 bg-forensic-grid">
        <div className="dossier-card corner-brackets max-w-sm rounded-md border border-border bg-card p-6">
          <div className="size-12 rounded-sm border border-border bg-muted/50 flex items-center justify-center mx-auto mb-3">
            <Archive className="size-5 text-primary" />
          </div>
          <p className="font-display text-base font-bold text-foreground">{t('noEvidenceSelected')}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('noEvidenceDesc')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Quick Exhibit Switcher Ribbon ── */}
      {unlockedSources.length > 0 && (
        <div className="flex items-center gap-1 border-b border-border bg-muted/30 px-3 py-1.5 overflow-x-auto shrink-0 scrollbar-thin">
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground mr-1.5 shrink-0">
            [TANG VẬT]:
          </span>
          {unlockedSources.map((src, idx) => {
            const isActive = source.id === src.id;
            return (
              <button
                key={src.id}
                type="button"
                onClick={() => onSelectTab?.(src.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xs font-mono text-[11px] font-bold transition-all shrink-0 cursor-pointer border ${
                  isActive
                    ? 'border-primary bg-primary/15 text-primary shadow-2xs'
                    : 'border-transparent bg-card/60 text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <span className="opacity-70">#0{idx + 1}</span>
                <span className="font-sans font-semibold truncate max-w-[150px]">{src.title}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Exhibit Dossier Header Banner ── */}
      <div className="px-4 py-2.5 border-b border-border bg-card/70 shrink-0 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="detective-stamp text-primary border-primary/40 bg-primary/10">
              EXHIBIT // {source.type.replace(/_/g, ' ').toUpperCase()}
            </span>
            <h3 className="font-display text-base font-bold text-foreground truncate">
              {source.title}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {source.description}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {(source.type === 'table' || source.type === 'sql_table') && onInvestigateInSpreadsheet && (
            <button
              type="button"
              onClick={() => onInvestigateInSpreadsheet(source.id, dataset)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-primary text-primary-foreground hover:opacity-90 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs"
              title={t('investigateInSpreadsheetTooltip')}
            >
              <FlaskConical className="size-3.5" />
              <span>{t('investigateInSpreadsheet')}</span>
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="size-7 rounded-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Source Content Viewport ── */}
      <div className="flex-1 overflow-auto min-h-0 bg-forensic-grid">
        {/* Table source */}
        {(source.type === 'table' || source.type === 'sql_table') && dataset && (
          <EvidenceTable
            dataset={dataset}
            onSelectDataValue={onSelectDataValue}
            activeFieldId={activeFieldId}
            activeFieldLabel={activeFieldLabel}
            onInvestigateInSpreadsheet={
              onInvestigateInSpreadsheet ? () => onInvestigateInSpreadsheet(source.id, dataset) : null
            }
          />
        )}

        {/* Document source */}
        {source.type === 'document' && source.content && (
          <EvidenceDocument
            title={source.title}
            content={source.content}
            onSelectDataValue={onSelectDataValue}
          />
        )}

        {/* Witness statement */}
        {source.type === 'witness' && source.content && (
          <WitnessStatement
            title={source.title}
            content={source.content}
            onSelectDataValue={onSelectDataValue}
          />
        )}
      </div>
    </div>
  );
}

function EvidenceTable({ dataset, onSelectDataValue, activeFieldLabel, onInvestigateInSpreadsheet }) {
  const { t } = useTranslation('investigation');

  if (!dataset?.rows || !dataset?.schema) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground font-mono text-xs">
        {t('noDataAvailable')}
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-auto">
      {/* Dataset Metadata & Click-to-Fill Guide Bar */}
      <div className="mb-3 flex items-center justify-between flex-wrap gap-2 rounded-sm border border-border bg-card p-2.5 shadow-2xs">
        <div className="flex items-center gap-2">
          <Archive className="size-4 text-primary shrink-0" />
          <div>
            <p className="font-mono text-[11px] font-bold tracking-wider uppercase text-foreground">
              {dataset.title}
            </p>
            {dataset.description && (
              <p className="text-[11px] text-muted-foreground">{dataset.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onSelectDataValue && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/35 rounded-xs text-[11px] text-amber-600 dark:text-amber-400">
              <MousePointerClick className="size-3.5 shrink-0" />
              <span className="font-bold">{t('clickToFillTitle')}:</span>
              <span className="hidden sm:inline">
                {activeFieldLabel
                  ? `Bấm vào ô bất kỳ để điền vào "${activeFieldLabel}"`
                  : t('clickToFillDesc')}
              </span>
            </div>
          )}

          {onInvestigateInSpreadsheet && (
            <button
              type="button"
              onClick={onInvestigateInSpreadsheet}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-primary/15 border border-primary/35 hover:bg-primary/25 font-mono text-[10px] font-bold uppercase tracking-wider text-primary transition-colors cursor-pointer"
              title={t('investigateInSpreadsheetTooltip')}
            >
              <FlaskConical className="size-3 text-primary" />
              <span>{t('loadEvidenceToSpreadsheet', 'Nạp vào Bàn Điều Tra')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Forensic Ledger Data Table */}
      <div className="dossier-card overflow-auto rounded-sm border border-border bg-card shadow-2xs">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-border bg-muted/60">
              <th className="w-10 px-2.5 py-2.5 text-center font-mono text-[10px] font-bold text-muted-foreground border-r border-border/60">
                #
              </th>
              {dataset.schema.map(col => (
                <th
                  key={col.name}
                  className="px-3 py-2.5 text-left font-mono text-[11px] font-bold uppercase tracking-wider text-foreground whitespace-nowrap border-r border-border/40 last:border-r-0"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {dataset.rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className={`transition-colors hover:bg-primary/5 ${
                  rIdx % 2 === 0 ? 'bg-card' : 'bg-muted/15'
                }`}
              >
                <td className="px-2.5 py-2 text-center font-mono text-[10px] text-muted-foreground border-r border-border/60 tabular-nums">
                  {String(rIdx + 1).padStart(2, '0')}
                </td>
                {dataset.schema.map(col => {
                  const value = row[col.name];
                  const isEmpty = value === null || value === undefined || value === '' || value === '-';
                  return (
                    <td
                      key={col.name}
                      onClick={() => {
                        if (!isEmpty && onSelectDataValue) {
                          onSelectDataValue(String(value));
                        }
                      }}
                      title={!isEmpty && onSelectDataValue ? t('clickToFillAction', { value }) : undefined}
                      className={`px-3 py-2 whitespace-nowrap border-r border-border/30 last:border-r-0 transition-colors ${
                        isEmpty
                          ? 'text-rose-500 dark:text-rose-400 font-mono font-bold italic bg-rose-500/5'
                          : 'text-foreground hover:bg-primary/20 hover:text-primary cursor-pointer font-medium'
                      } ${col.type === 'number' ? 'text-right font-mono tabular-nums' : ''}`}
                    >
                      {isEmpty ? '[TRỐNG]' : String(value)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
        <span>STATUS: VERIFIED LEDGER</span>
        <span>
          TỔNG CỘNG: {dataset.rows.length} {t('records').toUpperCase()}
        </span>
      </div>
    </div>
  );
}

function EvidenceDocument({ title, content, onSelectDataValue }) {
  const { t } = useTranslation('investigation');

  const handleDoubleClick = () => {
    const selection = window.getSelection()?.toString().trim();
    if (selection && onSelectDataValue) {
      onSelectDataValue(selection);
    }
  };

  return (
    <div className="p-5 max-w-2xl mx-auto">
      <div className="dossier-card corner-brackets rounded-md border border-border bg-card p-6 bg-ruled-ledger shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b-2 border-border">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <div>
              <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-primary block">
                {t('officialDocument')} // CLASSIFIED EXHIBIT
              </span>
              {title && <h4 className="font-display text-base font-bold text-foreground">{title}</h4>}
            </div>
          </div>
          <span className="detective-stamp text-amber-500 border-amber-500/40 bg-amber-500/10">
            <Stamp className="size-3" />
            {t('highlightToFill')}
          </span>
        </div>
        <pre
          onDoubleClick={handleDoubleClick}
          className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap font-sans selection:bg-primary/25 cursor-text"
        >
          {content}
        </pre>
      </div>
    </div>
  );
}

function WitnessStatement({ title, content, onSelectDataValue }) {
  const { t } = useTranslation('investigation');

  const handleDoubleClick = () => {
    const selection = window.getSelection()?.toString().trim();
    if (selection && onSelectDataValue) {
      onSelectDataValue(selection);
    }
  };

  return (
    <div className="p-5 max-w-2xl mx-auto">
      <div className="dossier-card corner-brackets rounded-md border border-emerald-500/40 bg-card p-6 bg-ruled-ledger shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b-2 border-emerald-500/30">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4 text-emerald-500" />
            <div>
              <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 block">
                {t('witnessStatement')} // INTERROGATION RECORD
              </span>
              {title && <h4 className="font-display text-base font-bold text-foreground">{title}</h4>}
            </div>
          </div>
          <span className="detective-stamp text-emerald-500 border-emerald-500/40 bg-emerald-500/10">
            {t('highlightToFill')}
          </span>
        </div>
        <pre
          onDoubleClick={handleDoubleClick}
          className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap font-sans selection:bg-emerald-500/30 cursor-text"
        >
          {content}
        </pre>
      </div>
    </div>
  );
}
