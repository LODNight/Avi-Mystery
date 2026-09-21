import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  XCircle,
  FileText,
  Unlock,
  ArrowRight,
  Stamp,
  AlertTriangle,
} from 'lucide-react';

/**
 * VerificationResultPanel
 *
 * Renders inside HQCommunicationPanel's 'verification_result' section.
 * Shows the outcome of a submitted investigation report.
 *
 * ACCEPTED path:
 *   - "REPORT VERIFIED" heading
 *   - Field-by-field confirmation list
 *   - NEW LEAD section (if next phase exists)
 *   - OR CASE CLOSED section (if no next phase)
 *   - [CONTINUE INVESTIGATION] button
 *
 * RETURNED path:
 *   - "REPORT RETURNED" heading
 *   - Field-by-field error list
 *   - HQ message
 *   - [Continue Investigating] button (resume)
 *
 * No full-screen modal in Sprint 12 — all in-panel.
 */
export function VerificationResultPanel({
  verificationResult,
  reportDefinition,
  caseData,
  caseState,
  onResumeInvestigation,
  onContinueToNextPhase,
}) {
  const { t } = useTranslation('investigation');

  if (!verificationResult) return null;

  const isAccepted = verificationResult.overall === 'ACCEPTED';
  const hasNextPhase = !!verificationResult.nextPhaseId;
  const isCaseClosed = isAccepted && !hasNextPhase;

  // Map field_id → label from report definition
  const fieldLabels = {};
  (reportDefinition?.fields || []).forEach(f => {
    fieldLabels[f.field_id] = f.label;
  });

  // Only show editable fields in verification results (not prefilled ones)
  const verifiedFields = (verificationResult.fieldResults || []).filter(
    r => r.status !== 'prefilled'
  );

  return (
    <div className="flex flex-col gap-4 p-4">

      {/* ── Verdict Banner ───────────────────────────────────────────── */}
      <div className={`
        rounded-xl border px-4 py-3 flex items-start gap-3
        ${isAccepted
          ? 'border-emerald-500/30 bg-emerald-500/10'
          : 'border-rose-500/30 bg-rose-500/10'
        }
      `}>
        {isAccepted
          ? <CheckCircle2 className="size-5 text-emerald-400 shrink-0 mt-0.5" />
          : <XCircle className="size-5 text-rose-400 shrink-0 mt-0.5" />
        }
        <div>
          <p className={`text-xs font-black uppercase tracking-widest ${isAccepted ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isAccepted ? t('reportVerified') : t('reportReturned')}
          </p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {verificationResult.hqMessage}
          </p>
        </div>
      </div>

      {/* ── Field Confirmations ──────────────────────────────────────── */}
      {verifiedFields.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {t('fieldVerification')}
          </p>
          {verifiedFields.map(result => (
            <div
              key={result.field_id}
              className={`
                flex items-start gap-2 px-3 py-2 rounded-lg border text-xs
                ${result.status === 'correct'
                  ? 'border-emerald-500/20 bg-emerald-500/5'
                  : 'border-rose-500/20 bg-rose-500/5'
                }
              `}
            >
              {result.status === 'correct'
                ? <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                : <XCircle className="size-3.5 text-rose-400 shrink-0 mt-0.5" />
              }
              <div className="flex-1 min-w-0">
                <p className={`font-semibold ${result.status === 'correct' ? 'text-foreground' : 'text-rose-300'}`}>
                  {fieldLabels[result.field_id] || result.field_id}
                </p>
                {result.status === 'incorrect' && result.message && (
                  <p className="text-rose-400/80 mt-0.5 leading-snug">{result.message}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── NEW LEAD Section (ACCEPTED + next phase) ──────────────── */}
      {isAccepted && hasNextPhase && verificationResult.newLeadText && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-amber-500/20">
            <Unlock className="size-3.5 text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
              {t('newLead')}
            </span>
          </div>
          <div className="px-3 py-2.5 space-y-1.5">
            {verificationResult.newLeadTitle && (
              <p className="text-xs font-bold text-foreground">
                {verificationResult.newLeadTitle}
              </p>
            )}
            <p className="text-xs text-muted-foreground leading-relaxed">
              {verificationResult.newLeadText}
            </p>
          </div>
        </div>
      )}

      {/* ── CASE CLOSED Section (ACCEPTED + no next phase) ──────────── */}
      {isCaseClosed && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-emerald-500/20">
            <Stamp className="size-3.5 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
              {t('caseClosed')}
            </span>
          </div>
          {verificationResult.caseSummary && (
            <div className="px-3 py-2.5 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">
                {t('investigationSummary')}
              </p>
              {verificationResult.caseSummary.order_id && (
                <SummaryRow label={t('order')} value={verificationResult.caseSummary.order_id} />
              )}
              {verificationResult.caseSummary.unauthorized_excess_kg !== undefined && (
                <SummaryRow label={t('unauthorizedExcess')} value={`${verificationResult.caseSummary.unauthorized_excess_kg.toLocaleString()} kg`} />
              )}
              {verificationResult.caseSummary.destination && (
                <SummaryRow label={t('destination')} value={verificationResult.caseSummary.destination} />
              )}
              {verificationResult.caseSummary.received_by && (
                <SummaryRow label={t('receivedBy')} value={verificationResult.caseSummary.received_by} />
              )}
              {verificationResult.caseSummary.storage_location && (
                <SummaryRow label={t('storage')} value={verificationResult.caseSummary.storage_location} />
              )}
              {verificationResult.caseSummary.responsible_manager && (
                <SummaryRow label={t('responsibleManager')} value={verificationResult.caseSummary.responsible_manager} />
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Action Button ────────────────────────────────────────────── */}
      {isAccepted ? (
        <button
          type="button"
          onClick={onContinueToNextPhase || onResumeInvestigation}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-black uppercase tracking-widest text-black transition-colors cursor-pointer"
        >
          {isCaseClosed ? (
            <>
              <Stamp className="size-3.5" />
              {t('viewInvestigationStamp')}
            </>
          ) : (
            <>
              {t('continueInvestigation')}
              <ArrowRight className="size-3.5" />
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onResumeInvestigation}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border hover:bg-muted/30 text-xs font-bold text-foreground transition-colors cursor-pointer"
        >
          {t('continueInvestigating')}
          <ArrowRight className="size-3.5" />
        </button>
      )}
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[10px] text-muted-foreground min-w-0 shrink-0">{label}:</span>
      <span className="text-xs font-semibold text-foreground truncate">{value}</span>
    </div>
  );
}
