import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  MessageSquare,
  Archive,
  Eye,
  EyeOff,
  Camera,
  BookOpen,
  Terminal,
  Clipboard,
  ChevronRight,
  Clock,
  HelpCircle,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { ClueCard } from './ClueCard.jsx';
import { FindingCard } from './FindingCard.jsx';

const SOURCE_TYPE_CONFIG = {
  table: {
    icon: Archive,
    label: 'Data Records',
    accent: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  sql_table: {
    icon: Terminal,
    label: 'Database',
    accent: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  document: {
    icon: FileText,
    label: 'Document',
    accent: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
  },
  witness: {
    icon: MessageSquare,
    label: 'Witness Statement',
    accent: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  photo: {
    icon: Camera,
    label: 'Photo Evidence',
    accent: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
  report: {
    icon: Clipboard,
    label: 'Report',
    accent: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
  },
  log: {
    icon: Terminal,
    label: 'System Log',
    accent: 'text-zinc-600 dark:text-zinc-400',
    bg: 'bg-zinc-500/10',
    border: 'border-zinc-500/20',
  },
  field_note: {
    icon: BookOpen,
    label: 'Field Note',
    accent: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/20',
  },
};

/**
 * CaseFilePanel
 * Shows: case number, title, status, briefing, objective, sources list,
 * investigation question, clues, and recorded findings.
 * Does not reveal investigation techniques or expected answers.
 */
export function CaseFilePanel({
  caseData,
  caseState,
  currentPhase,
  investigationQuestion = null,
  clues = [],
  findings = [],
  viewedSourceIds = [],
  activeSourceId = null,
  latestHQMessage = null,
  onOpenSource,
  onInvestigateInSpreadsheet,
  onDeleteFinding,
}) {
  const { t } = useTranslation('investigation');

  if (!caseData || !caseState) return null;

  const statusConfig = {
    OPEN:              { label: t('status_OPEN'),        color: 'text-sky-600 dark:text-sky-400',     dot: 'bg-sky-500'     },
    INVESTIGATING:     { label: t('status_INVESTIGATING'),  color: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500'   },
    REPORT_READY:      { label: t('status_REPORT_READY'),      color: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500 animate-pulse' },
    SUBMITTED:         { label: t('status_SUBMITTED'),     color: 'text-blue-600 dark:text-blue-400',   dot: 'bg-blue-500'    },
    VERIFYING:         { label: t('status_VERIFYING'),      color: 'text-violet-600 dark:text-violet-400', dot: 'bg-violet-500 animate-pulse' },
    CASE_PROGRESS:     { label: t('status_CASE_PROGRESS'),       color: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
    REPORT_RETURNED:   { label: t('status_REPORT_RETURNED'),      color: 'text-rose-600 dark:text-rose-400',   dot: 'bg-rose-500'    },
    CASE_CLOSED:       { label: t('status_CASE_CLOSED'),          color: 'text-zinc-500',                      dot: 'bg-zinc-500'    },
  };

  const status = statusConfig[caseState.status] || statusConfig.OPEN;

  // Filter sources by current unlocked phase
  const unlockedPhaseIds = caseState.unlockedPhaseIds || ['phase-1'];
  const visibleSources = caseData.sources?.filter(s => unlockedPhaseIds.includes(s.unlockedAtPhase)) || [];

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin gap-0">
      {/* ── Case Header ── */}
      <div className="px-4 pt-4 pb-3 border-b border-border/60 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            {caseData.caseNumber}
          </span>
          <span className="h-px flex-1 bg-border/60" />
          <div className="flex items-center gap-1.5">
            <span className={`size-1.5 rounded-full ${status.dot}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wide ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>
        <h1 className="text-base font-bold text-foreground leading-tight">
          {caseData.title}
        </h1>
        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {caseData.estimatedMinutes} {t('min')}
          </span>
          <span className="font-mono uppercase">{caseData.difficulty}</span>
        </div>
      </div>

      {/* ── HQ Message (if any) ── */}
      {latestHQMessage && (
        <div className="mx-3 my-3 rounded-xl border border-amber-500/30 bg-amber-500/8 p-3 shrink-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[9px] font-black tracking-widest text-amber-600 dark:text-amber-400 uppercase">
              {t('hqMessageTitle')}
            </span>
          </div>
          <p className="text-xs text-foreground/90 leading-relaxed">
            {latestHQMessage.content}
          </p>
          {latestHQMessage.newLeadText && (
            <div className="mt-2 pt-2 border-t border-amber-500/20">
              <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                {t('newLead')}
              </p>
              <p className="text-xs text-foreground/80 mt-0.5">
                {latestHQMessage.newLeadText}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Briefing ── */}
      <div className="px-4 py-3 border-b border-border/40 shrink-0">
        <h2 className="text-[10px] font-black tracking-widest uppercase text-muted-foreground mb-2">
          {t('briefing')}
        </h2>
        <p className="text-xs text-foreground/85 leading-relaxed whitespace-pre-line">
          {caseData.briefing.narrative}
        </p>
      </div>

      {/* ── Objective ── */}
      <div className="px-4 py-3 border-b border-border/40 shrink-0">
        <h2 className="text-[10px] font-black tracking-widest uppercase text-muted-foreground mb-2">
          {t('objective')}
        </h2>
        <p className="text-xs font-medium text-foreground leading-relaxed">
          {caseData.briefing.objective}
        </p>
      </div>

      {/* ── Sources ── */}
      <div className="px-4 py-3 border-b border-border/40 shrink-0">
        <h2 className="text-[10px] font-black tracking-widest uppercase text-muted-foreground mb-2.5">
          {t('sources')}
        </h2>
        <div className="flex flex-col gap-1.5">
          {visibleSources.map(source => {
            const typeConfig = SOURCE_TYPE_CONFIG[source.type] || SOURCE_TYPE_CONFIG.document;
            const Icon = typeConfig.icon;
            const isViewed = viewedSourceIds.includes(source.id);
            const isActive = activeSourceId === source.id;

            return (
              <button
                key={source.id}
                type="button"
                onClick={() => onOpenSource?.(source.id)}
                className={`
                  w-full text-left rounded-xl border px-3 py-2.5 transition-all cursor-pointer group
                  ${isActive
                    ? `${typeConfig.border} ${typeConfig.bg} shadow-sm`
                    : 'border-border/50 hover:border-border hover:bg-muted/30'
                  }
                `}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`mt-0.5 size-6 rounded-lg ${typeConfig.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`size-3.5 ${typeConfig.accent}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-foreground truncate">
                        {source.title}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {isViewed ? (
                          <Eye className="size-3 text-muted-foreground/60" />
                        ) : (
                          <EyeOff className="size-3 text-muted-foreground/40" />
                        )}
                        <ChevronRight className="size-3 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                      {source.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Investigation Question ── */}
      {investigationQuestion && (
        <div className="px-4 py-3 border-b border-border/40 shrink-0">
          <h2 className="text-[10px] font-black tracking-widest uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
            <HelpCircle className="size-3" />
            {t('investigationQuestion')}
          </h2>
          <p className="text-xs font-semibold text-foreground leading-snug mb-1.5">
            {investigationQuestion.question}
          </p>
          {investigationQuestion.context && (
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {investigationQuestion.context}
            </p>
          )}
        </div>
      )}

      {/* ── Clues ── */}
      {clues.length > 0 && (
        <div className="px-4 py-3 border-b border-border/40 shrink-0">
          <h2 className="text-[10px] font-black tracking-widest uppercase text-muted-foreground mb-2.5 flex items-center gap-1.5">
            <Search className="size-3" />
            {t('leads')}
          </h2>
          <div className="flex flex-col gap-2">
            {clues.map(clue => {
              // Derive clue status from findings
              const clueFindings = findings.filter(f => f.sourceEvidenceId && clue.relevantSourceIds?.includes(f.sourceEvidenceId));
              const clueStatus = clueFindings.length > 0 ? 'finding_recorded' : 'investigating';
              return (
                <ClueCard
                  key={clue.clueId}
                  clue={clue}
                  status={caseState?.status === 'CASE_CLOSED' ? 'confirmed' : clueStatus}
                  sources={visibleSources}
                  onOpenSource={onOpenSource}
                  onInvestigateInSpreadsheet={onInvestigateInSpreadsheet}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ── Findings ── */}
      {findings.length > 0 && (
        <div className="px-4 py-3 flex-1">
          <h2 className="text-[10px] font-black tracking-widest uppercase text-muted-foreground mb-2.5 flex items-center gap-1.5">
            <CheckCircle2 className="size-3" />
            {t('findings')}
          </h2>
          <div className="flex flex-col gap-2">
            {findings
              .filter(f => f.phaseId === currentPhase?.id)
              .map(finding => (
                <FindingCard
                  key={finding.findingId}
                  finding={finding}
                  onDelete={onDeleteFinding}
                />
              ))
            }
          </div>
        </div>
      )}
      {findings.length === 0 && <div className="flex-1" />}
    </div>
  );
}
