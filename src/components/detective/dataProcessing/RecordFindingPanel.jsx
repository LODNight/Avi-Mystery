import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BookmarkPlus,
  CheckCircle2,
  Trash2,
  Database,
  HelpCircle,
  FileText,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { FINDING_TYPES } from '../../../domain/investigation/findingModel.js';

/**
 * RecordFindingPanel
 *
 * Right panel of the Data Processing Workspace.
 * Allows the investigator to document their discoveries into verified FACTs
 * or investigative INTERPRETATIONs without triggering premature game judgements.
 *
 * NO XP is awarded here. NO immediate correctness is shown.
 * The player creates their investigation trail.
 */
export function RecordFindingPanel({
  caseId = '',
  chapterId = '',
  stepId = '',
  activeSource = null,
  currentQuery = '',
  selectedEvidence = null, // { row, cellValue, address, columns }
  onClearEvidence = null,
  onRecordFinding = null,
  onDeleteFinding = null,
  recordedFindings = [],
  className = '',
}) {
  const { t, i18n } = useTranslation('investigation');
  const activeLocale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';

  const [findingType, setFindingType] = useState(FINDING_TYPES.FACT);
  const [content, setContent] = useState('');
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  // NOTE: Do NOT automatically generate player's conclusion into content.
  // The player writes their own finding and selects FACT or INTERPRETATION.

  const handleInsertValue = () => {
    if (!selectedEvidence) return;
    const valueToInsert =
      selectedEvidence.cellValue !== undefined && selectedEvidence.cellValue !== null
        ? String(selectedEvidence.cellValue)
        : selectedEvidence.row
        ? Array.isArray(selectedEvidence.row)
          ? selectedEvidence.row.join(', ')
          : JSON.stringify(selectedEvidence.row)
        : '';
    if (!valueToInsert) return;
    setContent((prev) => (prev ? `${prev} ${valueToInsert}` : valueToInsert));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    const sourceMetadata = {
      datasetId: activeSource?.datasetId || null,
      tableId: activeSource?.tableName || activeSource?.id || null,
      queryId: currentQuery ? 'query-user' : null,
      query: currentQuery ? currentQuery.slice(0, 300) : null,
      selectedRow: selectedEvidence?.row || null,
    };

    if (onRecordFinding) {
      onRecordFinding({
        caseId,
        chapterId,
        stepId,
        type: findingType,
        content: trimmed,
        source: sourceMetadata,
        sourceEvidenceId: sourceMetadata.tableId,
        value: selectedEvidence?.cellValue ?? null,
      });
    }

    setContent('');
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2500);
  };

  // Filter findings for this step or case
  const stepFindings = recordedFindings.filter(
    (f) => !stepId || f.stepId === stepId || f.phaseId === stepId || f.chapterId === chapterId
  );

  return (
    <div className={`flex flex-col h-full bg-card/60 rounded-2xl border border-border/80 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-3.5 border-b border-border/70 bg-card/90">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <BookmarkPlus className="size-3.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground leading-tight">
                {t('dataProcessing.recordFinding')}
              </p>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                {t('dataProcessing.recordFindingDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Finding Level Selector (FACT vs INTERPRETATION) */}
          <div>
            <label className="block text-[11px] font-bold text-foreground/90 uppercase tracking-wider mb-1.5">
              {t('dataProcessing.findingLevel')}
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFindingType(FINDING_TYPES.FACT)}
                className={`flex flex-col items-start p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  findingType === FINDING_TYPES.FACT
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500/30'
                    : 'border-border bg-background/60 text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-[11px]">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span>{t('dataProcessing.typeFact')}</span>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 leading-snug line-clamp-2">
                  {t('dataProcessing.typeFactDesc')}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFindingType(FINDING_TYPES.INTERPRETATION)}
                className={`flex flex-col items-start p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  findingType === FINDING_TYPES.INTERPRETATION
                    ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 ring-1 ring-indigo-500/30'
                    : 'border-border bg-background/60 text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-[11px]">
                  <span className="size-2 rounded-full bg-indigo-500" />
                  <span>{t('dataProcessing.typeInterpretation')}</span>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 leading-snug line-clamp-2">
                  {t('dataProcessing.typeInterpretationDesc')}
                </span>
              </button>
            </div>

            {/* Semantic Hint */}
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/80 px-0.5 mt-1.5">
              <Info className="size-3 shrink-0 text-amber-500/80" />
              <span>{t('dataProcessing.semanticHint')}</span>
            </div>
          </div>

          {/* Evidence Reference (Prefilled from selected evidence, not conclusion) */}
          {selectedEvidence && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1">
                  <Database className="size-3" />
                  {t('dataProcessing.evidenceReference')}:
                </span>
                {onClearEvidence && (
                  <button
                    type="button"
                    onClick={onClearEvidence}
                    className="text-[10px] text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    {t('dataProcessing.clearReference')}
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                {activeSource && (
                  <span className="px-1.5 py-0.5 rounded bg-background/80 border border-border/80 text-foreground">
                    {activeSource.tableName || activeSource.id}
                  </span>
                )}
                {selectedEvidence.cellValue !== undefined && selectedEvidence.cellValue !== null && (
                  <span className="px-1.5 py-0.5 rounded bg-background/90 border border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold truncate max-w-[150px]">
                    val: {String(selectedEvidence.cellValue)}
                  </span>
                )}
                {selectedEvidence.address && (
                  <span className="px-1.5 py-0.5 rounded bg-background/80 border border-border/80 text-muted-foreground">
                    ô {selectedEvidence.address}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-amber-500/20">
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {t('dataProcessing.evidenceReferenceDesc')}
                </span>
                <button
                  type="button"
                  onClick={handleInsertValue}
                  className="shrink-0 px-2 py-0.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 text-[10px] font-semibold transition-colors cursor-pointer"
                >
                  + {t('dataProcessing.insertValue')}
                </button>
              </div>
            </div>
          )}

          {/* Finding Content Input — Player writes their own finding */}
          <div>
            <label className="block text-[11px] font-bold text-foreground/90 uppercase tracking-wider mb-1.5">
              {t('dataProcessing.findingContent')}
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('dataProcessing.findingContentPlaceholder')}
              className="w-full p-2.5 text-xs rounded-xl bg-background/80 border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all font-sans resize-none"
            />
          </div>

          {/* Active Source / Query Metadata Tag (when no selectedEvidence or alongside) */}
          {!selectedEvidence && (activeSource || currentQuery) && (
            <div className="p-2 rounded-xl bg-muted/40 border border-border/70 space-y-1 text-[11px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                {t('dataProcessing.sourceMetadata')}:
              </span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                {activeSource && (
                  <span className="px-1.5 py-0.5 rounded bg-background border border-border/80 text-foreground">
                    table: {activeSource.tableName || activeSource.id}
                  </span>
                )}
                {currentQuery && (
                  <span className="px-1.5 py-0.5 rounded bg-background border border-border/80 text-muted-foreground truncate max-w-[200px]" title={currentQuery}>
                    sql: {currentQuery.slice(0, 40)}...
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!content.trim()}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs transition-all shadow-xs hover:shadow cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <BookmarkPlus className="size-3.5" />
            <span>{t('dataProcessing.saveFinding')}</span>
          </button>

          {/* Success Feedback */}
          {showSavedFeedback && (
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
              <span>{t('dataProcessing.findingSaved')}</span>
            </div>
          )}
        </form>

        {/* Trail of Recorded Findings */}
        <div className="pt-2 border-t border-border/70">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
              {t('dataProcessing.recordedFindings')}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              {stepFindings.length}
            </span>
          </div>

          {stepFindings.length === 0 ? (
            <p className="text-[11px] text-muted-foreground italic py-2 text-center">
              {t('dataProcessing.noFindingsYet')}
            </p>
          ) : (
            <div className="space-y-2">
              {stepFindings.map((finding) => {
                const isFact = finding.type === FINDING_TYPES.FACT;
                const formattedTime = finding.createdAt
                  ? new Date(finding.createdAt).toLocaleTimeString(activeLocale, { hour: '2-digit', minute: '2-digit' })
                  : null;

                return (
                  <div
                    key={finding.id || finding.findingId}
                    className="p-2.5 rounded-xl border border-border/70 bg-card/80 space-y-1.5 text-xs group"
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                          isFact
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30'
                        }`}
                      >
                        {finding.type || 'FACT'}
                      </span>

                      {onDeleteFinding && (
                        <button
                          type="button"
                          onClick={() => onDeleteFinding(finding.id || finding.findingId)}
                          className="size-5 rounded flex items-center justify-center text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Xóa manh mối này"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-foreground font-medium leading-snug">
                      {finding.content || finding.claim}
                    </p>

                    <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground pt-0.5">
                      <span className="font-mono truncate max-w-[150px]">
                        {finding.source?.tableId || finding.sourceEvidenceId || 'data'}
                      </span>
                      {formattedTime && <span>{formattedTime}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
