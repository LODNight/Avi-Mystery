import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Trash2, Database } from 'lucide-react';

/**
 * FindingCard
 *
 * Displays a recorded investigation finding.
 * Findings are derived conclusions — they represent what the investigator
 * has observed and calculated, not final accusations.
 *
 * Semantics: "Unauthorized excess: 4,210 kg" is a finding.
 * "The goods were stolen" is an interpretation — not a finding.
 */
export function FindingCard({ finding, onDelete }) {
  const { t, i18n } = useTranslation('investigation');
  const activeLocale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';

  const formattedValue = finding.value !== null && finding.value !== undefined
    ? String(finding.value)
    : '—';

  const formattedDate = finding.recordedAt
    ? new Date(finding.recordedAt).toLocaleTimeString(activeLocale, { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 overflow-hidden">
      <div className="flex items-start gap-2 px-3 py-2.5">
        {/* Icon */}
        <CheckCircle2 className="size-3.5 text-emerald-400 mt-0.5 shrink-0" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Claim */}
          <p className="text-xs font-semibold text-foreground leading-snug">
            {finding.claim}
          </p>

          {/* Value */}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] font-black tracking-wider text-emerald-400 uppercase">{t('value')}:</span>
            <span className="text-xs font-mono font-bold text-foreground">{formattedValue}</span>
          </div>

          {/* Source + context */}
          {finding.sourceEvidenceId && (
            <div className="flex items-center gap-1 mt-0.5">
              <Database className="size-2.5 text-muted-foreground/50 shrink-0" />
              <span className="text-[10px] text-muted-foreground truncate">
                {finding.sourceEvidenceId}
                {finding.investigationContext ? ` · ${finding.investigationContext}` : ''}
              </span>
            </div>
          )}

          {/* Timestamp */}
          {formattedDate && (
            <p className="text-[10px] text-muted-foreground/50 mt-0.5">
              {t('recordedAt', { time: formattedDate })}
            </p>
          )}
        </div>

        {/* Delete */}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(finding.findingId)}
            className="size-5 flex items-center justify-center rounded text-muted-foreground/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0 mt-0.5"
            title={t('removeFinding')}
          >
            <Trash2 className="size-3" />
          </button>
        )}
      </div>
    </div>
  );
}
