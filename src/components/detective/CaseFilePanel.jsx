import React, { useState } from 'react';
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
  ChevronDown,
  Clock,
  HelpCircle,
  Search,
  CheckCircle2,
  FlaskConical,
  Crosshair,
  FolderOpen,
} from 'lucide-react';
import { ClueCard } from './ClueCard.jsx';
import { FindingCard } from './FindingCard.jsx';

const SOURCE_TYPE_CONFIG = {
  table: {
    icon: Archive,
    tag: 'DATA LEDGER',
    accent: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/35',
  },
  sql_table: {
    icon: Terminal,
    tag: 'SQL DATABASE',
    accent: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/35',
  },
  document: {
    icon: FileText,
    tag: 'DOCUMENT',
    accent: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/35',
  },
  witness: {
    icon: MessageSquare,
    tag: 'WITNESS TAPE',
    accent: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/35',
  },
  photo: {
    icon: Camera,
    tag: 'SCENE PHOTO',
    accent: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/35',
  },
  report: {
    icon: Clipboard,
    tag: 'FIELD REPORT',
    accent: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/35',
  },
  log: {
    icon: Terminal,
    tag: 'SYSTEM LOG',
    accent: 'text-zinc-600 dark:text-zinc-400',
    bg: 'bg-zinc-500/10',
    border: 'border-zinc-500/35',
  },
  field_note: {
    icon: BookOpen,
    tag: 'FIELD NOTE',
    accent: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/35',
  },
};

/**
 * CaseFilePanel — Zone B: Classified Case Folder & Evidence Index
 * Organizes the case file into clear, scannable forensic sections with quick-filter views
 * while keeping all essential DOM nodes mounted for accessibility & tests.
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
  // 'all' | 'evidence' | 'leads'
  const [folderTab, setFolderTab] = useState('all');
  const [briefingExpanded, setBriefingExpanded] = useState(true);

  if (!caseData || !caseState) return null;

  const unlockedPhaseIds = caseState.unlockedPhaseIds || ['phase-1'];
  const visibleSources =
    caseData.sources?.filter(s => unlockedPhaseIds.includes(s.unlockedAtPhase)) || [];
  const phaseFindings = findings.filter(f => f.phaseId === currentPhase?.id);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Top Zone Header: Classified Case Dossier Banner ── */}
      <div className="px-3.5 py-2.5 border-b border-border bg-muted/35 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <FolderOpen className="size-3.5 text-primary" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
              ZONE 01 // HỒ SƠ VỤ ÁN
            </span>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="size-3" />
            {caseData.estimatedMinutes} {t('min')} · {caseData.difficulty?.toUpperCase()}
          </span>
        </div>

        {/* Folder Quick-Filter Switcher */}
        <div className="mt-2 grid grid-cols-3 gap-1 rounded-xs border border-border bg-background p-0.5">
          <button
            type="button"
            onClick={() => setFolderTab('all')}
            className={`py-1 rounded-xs font-mono text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              folderTab === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setFolderTab('evidence')}
            className={`py-1 rounded-xs font-mono text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              folderTab === 'evidence'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tang vật ({visibleSources.length})
          </button>
          <button
            type="button"
            onClick={() => setFolderTab('leads')}
            className={`py-1 rounded-xs font-mono text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              folderTab === 'leads'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Manh mối ({clues.length + phaseFindings.length})
          </button>
        </div>
      </div>

      {/* ── Scrollable Dossier Body ── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-border/60">
        {/* 1. HQ Urgent Dispatch (if any) */}
        {latestHQMessage && (
          <div className="p-3 bg-amber-500/10">
            <div className="rounded-sm border border-amber-500/40 bg-card p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="font-mono text-[9px] font-black tracking-widest text-amber-600 dark:text-amber-400 uppercase">
                  {t('hqMessageTitle')} // MẬT ĐIỆN
                </span>
              </div>
              <p className="text-xs text-foreground/90 leading-relaxed">
                {latestHQMessage.content}
              </p>
              {latestHQMessage.newLeadText && (
                <div className="mt-2 pt-2 border-t border-dashed border-amber-500/30">
                  <p className="font-mono text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
                    {t('newLead')}
                  </p>
                  <p className="text-xs text-foreground/85 mt-0.5">
                    {latestHQMessage.newLeadText}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. Primary Objective Directive (Always visible at top of dossier) */}
        <div className="p-3.5 bg-primary/5">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h2 className="font-mono text-[10px] font-black tracking-widest uppercase text-primary flex items-center gap-1.5">
              <Crosshair className="size-3" />
              {t('objective')}
            </h2>
            <span className="font-mono text-[9px] font-bold uppercase text-muted-foreground">
              [CHỈ THỊ TRỌNG TÂM]
            </span>
          </div>
          <p className="text-xs font-bold text-foreground leading-relaxed">
            {caseData.briefing.objective}
          </p>
        </div>

        {/* 3. Evidence Sources List (Tang vật & Tài liệu hiện trường) */}
        <div className={folderTab === 'leads' ? 'hidden' : 'p-3.5'}>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="font-mono text-[10px] font-black tracking-widest uppercase text-foreground flex items-center gap-1.5">
              <Archive className="size-3.5 text-primary" />
              {t('sources')} ({visibleSources.length})
            </h2>
            <span className="font-mono text-[9px] text-muted-foreground uppercase">
              Bấm để khám nghiệm
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {visibleSources.map((source, idx) => {
              const typeConfig = SOURCE_TYPE_CONFIG[source.type] || SOURCE_TYPE_CONFIG.document;
              const Icon = typeConfig.icon;
              const isViewed = viewedSourceIds.includes(source.id);
              const isActive = activeSourceId === source.id;
              const exCode = `EXH-0${idx + 1}`;

              return (
                <div
                  key={source.id}
                  className={`rounded-sm border transition-all ${
                    isActive
                      ? 'border-l-[3px] border-primary bg-primary/10 shadow-2xs'
                      : 'border-border bg-background/80 hover:border-primary/40 hover:bg-muted/30'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onOpenSource?.(source.id)}
                    className="w-full text-left px-3 py-2.5 cursor-pointer group"
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`mt-0.5 size-7 rounded-xs border ${typeConfig.border} ${typeConfig.bg} flex items-center justify-center shrink-0`}
                      >
                        <Icon className={`size-3.5 ${typeConfig.accent}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                            [{exCode} // {typeConfig.tag}]
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-xs ${
                              isViewed
                                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                                : 'text-amber-600 dark:text-amber-400 bg-amber-500/15'
                            }`}
                          >
                            {isViewed ? (
                              <>
                                <Eye className="size-2.5" /> Đã xem
                              </>
                            ) : (
                              <>
                                <EyeOff className="size-2.5" /> Mới
                              </>
                            )}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-foreground truncate mt-0.5 group-hover:text-primary transition-colors">
                          {source.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-snug">
                          {source.description}
                        </p>
                      </div>
                    </div>
                  </button>

                  {source.type === 'table' && onInvestigateInSpreadsheet && (
                    <div className="px-3 pb-2 pt-1 border-t border-dashed border-border/60 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onInvestigateInSpreadsheet(source.id)}
                        className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider text-primary hover:underline cursor-pointer"
                      >
                        <FlaskConical className="size-3" />
                        <span>Đưa vào Bàn Phân Tích</span>
                        <ChevronRight className="size-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Case Briefing Narrative (Collapsible Dossier Note) */}
        <div className={folderTab === 'leads' ? 'hidden' : 'p-3.5'}>
          <button
            type="button"
            onClick={() => setBriefingExpanded(v => !v)}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <h2 className="font-mono text-[10px] font-black tracking-widest uppercase text-muted-foreground flex items-center gap-1.5">
              <FileText className="size-3 text-primary" />
              {t('briefing')}
            </h2>
            <ChevronDown
              className={`size-3.5 text-muted-foreground transition-transform ${
                briefingExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
          {briefingExpanded && (
            <p className="mt-2 text-xs text-foreground/85 leading-relaxed whitespace-pre-line rounded-sm border border-dashed border-border bg-muted/20 p-2.5">
              {caseData.briefing.narrative}
            </p>
          )}
        </div>

        {/* 5. Investigation Question & Leads (Clues) */}
        <div className={folderTab === 'evidence' ? 'hidden' : 'p-3.5 space-y-3'}>
          {investigationQuestion && (
            <div className="rounded-sm border border-primary/30 bg-primary/5 p-3">
              <h2 className="font-mono text-[10px] font-black tracking-widest uppercase text-primary mb-1.5 flex items-center gap-1.5">
                <HelpCircle className="size-3" />
                {t('investigationQuestion')}
              </h2>
              <p className="text-xs font-bold text-foreground leading-snug">
                {investigationQuestion.question}
              </p>
              {investigationQuestion.context && (
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                  {investigationQuestion.context}
                </p>
              )}
            </div>
          )}

          {clues.length > 0 && (
            <div>
              <h2 className="font-mono text-[10px] font-black tracking-widest uppercase text-foreground mb-2 flex items-center gap-1.5">
                <Search className="size-3 text-primary" />
                {t('leads')} ({clues.length})
              </h2>
              <div className="flex flex-col gap-2">
                {clues.map(clue => {
                  const clueFindings = findings.filter(
                    f => f.sourceEvidenceId && clue.relevantSourceIds?.includes(f.sourceEvidenceId)
                  );
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

          {/* 6. Recorded Findings */}
          {phaseFindings.length > 0 && (
            <div className="pt-2 border-t border-dashed border-border">
              <h2 className="font-mono text-[10px] font-black tracking-widest uppercase text-emerald-500 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="size-3" />
                {t('findings')} ({phaseFindings.length})
              </h2>
              <div className="flex flex-col gap-2">
                {phaseFindings.map(finding => (
                  <FindingCard
                    key={finding.findingId}
                    finding={finding}
                    onDelete={onDeleteFinding}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
