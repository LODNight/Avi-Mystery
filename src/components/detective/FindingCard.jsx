import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Trash2, Database } from 'lucide-react';

/**
 * FindingCard
 *
 * Displays a recorded investigation finding.
 */
export function FindingCard({ finding, onDelete }) {
  const { t, i18n } = useTranslation('investigation');
  const activeLocale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';

  const formattedValue = finding.value !== null && finding.value !== undefined
    ? String(finding.value)
    : '-';

  const formattedDate = finding.recordedAt
    ? new Date(finding.recordedAt).toLocaleTimeString(activeLocale, { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="rounded-sm border border-emerald-500/25 bg-emerald-500/5 overflow-hidden">
      <div className="flex items-start gap-2 px-3 py-2.5">
        <CheckCircle2 className="size-3.5 text-emerald-500 mt-0.5 shrink-0" />

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground leading-snug">
            {finding.claim}
          </p>

          <div className="flex items-center gap-1.5 mt-1">
            <span className="font-mono text-[10px] font-black tracking-wider text-emerald-500 uppercase">{t('value')}:</span>
            <span className="text-xs font-mono font-bold text-foreground">{formattedValue}</span>
          </div>

          {finding.sourceEvidenceId && (
            <div className="flex items-center gap-1 mt-0.5">
              <Database className="size-2.5 text-muted-foreground/50 shrink-0" />
              <span className="font-mono text-[10px] text-muted-foreground truncate">
                {finding.sourceEvidenceId}
                {finding.investigationContext ? ` · ${finding.investigationContext}` : ''}
              </span>
            </div>
          )}

          {formattedDate && (
            <p className="font-mono text-[10px] text-muted-foreground/50 mt-0.5">
              {t('recordedAt', { time: formattedDate })}
            </p>
          )}
        </div>

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(finding.findingId)}
            className="size-5 flex items-center justify-center rounded-sm text-muted-foreground/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0 mt-0.5"
            title={t('removeFinding')}
          >
            <Trash2 className="size-3" />
          </button>
        )}
      </div>
    </div>
  );
}
