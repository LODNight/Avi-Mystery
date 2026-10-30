import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Radio,
  ChevronRight,
  AlertTriangle,
  Loader2,
  FolderOpen,
  FlaskConical,
  Stamp,
  Database,
  Crosshair,
  PanelLeftClose,
  PanelLeftOpen,
  FileSearch,
  Send,
  CheckCircle2,
  MousePointerClick,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useFocusMode } from '../../app/layouts/FocusLayout.jsx';
import { useDetectiveWorkspace } from '../../hooks/useDetectiveWorkspace.js';
import { caseContentService } from '../../services/caseContentService.js';
import { investigationStateService } from '../../services/investigationSessionService.js';
import { CaseFilePanel } from '../../components/detective/CaseFilePanel.jsx';
import { EvidencePanel } from '../../components/detective/EvidencePanel.jsx';
import { HQCommunicationPanel } from '../../components/detective/HQCommunicationPanel.jsx';
import { InvestigationWorkbench } from '../../components/detective/InvestigationWorkbench.jsx';
import { DataProcessingWorkspace } from '../../components/detective/DataProcessingWorkspace.jsx';

import { useTranslation } from 'react-i18next';

/**
 * DetectiveWorkspacePage — 2-Column Forensic Investigation Board + Centered HQ Command Dialog
 *
 * Route: /cases/:caseId/investigate
 *
 * Layout Architecture:
 *   [ZONE A] Top Case Command & 3-Step Investigation Pipeline Bar
 *   [ZONE 01] Left Column: Classified Case Folder & Evidence Index (Collapsible)
 *   [ZONE 02] Main Region: Full-Width Forensic Examination Desk (Pinned Directive + Quick-Fill Strip + 3 Tool Stations)
 *   [DIALOG] Centered HQ Dispatch & Official Verdict Dossier Modal
 */
export function DetectiveWorkspacePage() {
  const { t, i18n } = useTranslation('investigation');
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFocusMode } = useFocusMode();

  const userId = user?.id || 'user-001';

  const {
    caseData,
    contentError,
    isLoading,

    caseState,
    investigationState,
    reportDraft,
    isVerifying,
    uiState,

    activeSource,
    activeDataset,
    currentPhase,
    latestHQMessage,

    openReport,
    sendReport,
    resumeInvestigation,

    addNote,
    updateNote,
    deleteNote,
    unpinEvidence,

    updateReportField,

    openHQ,
    closeHQ,
    setHQSection,
    openSource,
    toggleCaseFilePanel,
  } = useDetectiveWorkspace({ caseId, userId });

  // ── Active field for Click-to-Fill ────────────────────────────────────────
  const [activeFieldId, setActiveFieldId] = useState(null);

  // ── Report definition (loaded from case content) ──────────────────────────
  const [reportDefinition, setReportDefinition] = useState(null);
  useEffect(() => {
    if (!caseId || !caseState?.currentPhaseId) return;
    const res = caseContentService.getReportDefinition(caseId, caseState.currentPhaseId);
    if (res.data) setReportDefinition(res.data);
  }, [caseId, caseState?.currentPhaseId, i18n.language]);

  // ── Investigation Question (per phase) ────────────────────────────────────
  const [investigationQuestion, setInvestigationQuestion] = useState(null);
  useEffect(() => {
    if (!caseId || !caseState?.currentPhaseId) return;
    const res = caseContentService.getInvestigationQuestion(caseId, caseState.currentPhaseId);
    if (res.data) setInvestigationQuestion(res.data);
  }, [caseId, caseState?.currentPhaseId, i18n.language]);

  // ── Clues (per phase) ─────────────────────────────────────────────────────
  const [clues, setClues] = useState([]);
  useEffect(() => {
    if (!caseId || !caseState?.currentPhaseId) return;
    const res = caseContentService.getPhaseClues(caseId, caseState.currentPhaseId);
    if (res.data) setClues(res.data);
  }, [caseId, caseState?.currentPhaseId, i18n.language]);

  // ── Findings (from investigation state) ───────────────────────────────────
  const findings = investigationState?.findings || [];

  // ── Step Data Sources (Strictly isolated by current Step/Phase) ────────────
  const currentPhaseRelevantSourceIds = useMemo(() => {
    const ids = new Set();
    if (currentPhase?.relevantSourceIds && Array.isArray(currentPhase.relevantSourceIds)) {
      currentPhase.relevantSourceIds.forEach((id) => ids.add(id));
    }
    if (clues && Array.isArray(clues)) {
      clues.forEach((c) => {
        if (c.relevantSourceIds && Array.isArray(c.relevantSourceIds)) {
          c.relevantSourceIds.forEach((id) => ids.add(id));
        }
      });
    }
    return ids;
  }, [currentPhase, clues]);

  const stepSources = useMemo(() => {
    if (!caseData?.sources) return [];
    return caseData.sources
      .filter((s) => {
        if (s.type !== 'table' && s.type !== 'sql_table') return false;

        if (currentPhaseRelevantSourceIds.size > 0) {
          return currentPhaseRelevantSourceIds.has(s.id);
        }

        if (s.unlockedAtPhase) {
          return s.unlockedAtPhase === caseState?.currentPhaseId;
        }

        return s.isUnlocked;
      })
      .map((s) => {
        const titleStr =
          typeof s.title === 'object'
            ? s.title[i18n.language] || s.title.vi || s.title.en || s.id
            : s.title || s.id;

        return {
          id: s.id,
          tableName: s.id.replace(/[^a-zA-Z0-9_]/g, '_'),
          title: titleStr,
          type: s.type,
          dataset: caseData?.datasets?.[s.datasetId],
        };
      });
  }, [caseData, currentPhaseRelevantSourceIds, caseState?.currentPhaseId, i18n.language]);

  // ── Center mode: 'dossier' | 'workbench' | 'processing' ──────────────────
  const [centerMode, setCenterMode] = useState('dossier');
  const [workbenchContext, setWorkbenchContext] = useState(null); // { sourceId, sourceTitle, dataset }

  // ── Auto-initialize report draft if none exists ───────────────────────────
  useEffect(() => {
    if (reportDefinition && !reportDraft && openReport) {
      openReport(reportDefinition);
    }
  }, [reportDefinition, reportDraft, openReport]);

  // ── Auto-select first source if none selected ──────────────────────────────
  useEffect(() => {
    if (caseData?.sources?.length > 0 && !uiState.workspace.activeSourceId) {
      const firstSource = caseData.sources.find((s) => s.isUnlocked) || caseData.sources[0];
      if (firstSource) {
        openSource(firstSource.id);
      }
    }
  }, [caseData, uiState.workspace.activeSourceId, openSource]);

  // ── Auto-focus first editable required field ───────────────────────────────
  useEffect(() => {
    if (!activeFieldId && reportDefinition?.fields) {
      const firstEditable = reportDefinition.fields.find((f) => f.editable && f.required);
      if (firstEditable) {
        setActiveFieldId(firstEditable.field_id);
      }
    }
  }, [reportDefinition, activeFieldId]);

  // ── Smart Click-to-Fill Handler ────────────────────────────────────────────
  const handleSelectDataValue = (val) => {
    let targetFieldId = activeFieldId;
    if (!targetFieldId && reportDefinition?.fields) {
      const firstEditable = reportDefinition.fields.find((f) => f.editable);
      if (firstEditable) targetFieldId = firstEditable.field_id;
    }
    if (!targetFieldId) return;

    updateReportField(targetFieldId, val);

    // Smart auto-advance to next empty required field
    if (reportDefinition?.fields) {
      const editableFields = reportDefinition.fields.filter((f) => f.editable && f.required);
      const currentIndex = editableFields.findIndex((f) => f.field_id === targetFieldId);
      const nextField = editableFields.find(
        (f, idx) => idx > currentIndex && !reportDraft?.fields?.[f.field_id]?.value
      );
      if (nextField) {
        setActiveFieldId(nextField.field_id);
      }
    }
  };

  // ── Auto-show verification result ──────────────────────────────────────────
  useEffect(() => {
    if (
      uiState.hq.isOpen &&
      ['CASE_PROGRESS', 'REPORT_RETURNED', 'CASE_CLOSED'].includes(caseState?.status)
    ) {
      setHQSection('verification_result');
    }
  }, [caseState?.status, uiState.hq.isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Investigate in Spreadsheet ─────────────────────────────────────────────
  const handleInvestigateInSpreadsheet = useCallback(
    (sourceId, dataset) => {
      const source = caseData?.sources?.find((s) => s.id === sourceId);
      if (!source) return;
      const ds = dataset || activeDataset;
      if (!ds) return;

      setWorkbenchContext({
        sourceId,
        sourceTitle: source.title,
        dataset: ds,
      });
      setCenterMode('workbench');
    },
    [caseData, activeDataset]
  );

  const handleInvestigateFromClue = useCallback(
    (sourceId) => {
      const source = caseData?.sources?.find((s) => s.id === sourceId);
      if (!source || source.type !== 'table') return;

      const dataset = caseData?.datasets?.[source.datasetId];
      if (!dataset) {
        openSource(sourceId);
        return;
      }

      setWorkbenchContext({
        sourceId,
        sourceTitle: source.title,
        dataset,
      });
      setCenterMode('workbench');
    },
    [caseData, openSource]
  );

  const handleViewSource = useCallback(() => {
    if (workbenchContext?.sourceId) {
      openSource(workbenchContext.sourceId);
    }
    setCenterMode('dossier');
  }, [workbenchContext, openSource]);

  const handleRecordFinding = useCallback(
    (findingData) => {
      investigationStateService.recordFinding(caseId, userId, {
        ...findingData,
        phaseId: caseState?.currentPhaseId,
      });
    },
    [caseId, userId, caseState?.currentPhaseId]
  );

  const handleDeleteFinding = useCallback(
    (findingId) => {
      investigationStateService.deleteFinding(caseId, userId, findingId);
    },
    [caseId, userId]
  );

  const handleSaveWorkbenchState = useCallback(
    (workbenchState) => {
      investigationStateService.saveWorkbenchState(caseId, userId, workbenchState);
    },
    [caseId, userId]
  );

  const isCaseFileCollapsed = uiState.workspace.isCaseFilePanelCollapsed || isFocusMode;

  // ── Compute Telemetry Metrics for the Top Command Bar ──────────────────────
  const unlockedPhaseIds = caseState?.unlockedPhaseIds || ['phase-1'];
  const visibleSources = useMemo(
    () => caseData?.sources?.filter((s) => unlockedPhaseIds.includes(s.unlockedAtPhase)) || [],
    [caseData?.sources, unlockedPhaseIds]
  );
  const viewedCount = (investigationState?.viewedSourceIds || []).filter((id) =>
    visibleSources.some((s) => s.id === id)
  ).length;

  const editableRequiredFields = useMemo(
    () =>
      (reportDefinition?.fields || [])
        .filter((f) => f.required && f.editable)
        .sort((a, b) => a.order - b.order),
    [reportDefinition]
  );
  const filledRequiredCount = editableRequiredFields.filter((f) => {
    const val = reportDraft?.fields?.[f.field_id]?.value;
    return val && String(val).trim().length > 0;
  }).length;

  const activeFieldLabel = useMemo(() => {
    if (!activeFieldId || !reportDefinition?.fields) return null;
    const found = reportDefinition.fields.find((f) => f.field_id === activeFieldId);
    return found ? found.label : null;
  }, [activeFieldId, reportDefinition]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 text-amber-500 animate-spin" />
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t('loadingCaseFile')}
          </p>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (contentError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="dossier-card corner-brackets flex flex-col items-center gap-3 text-center max-w-sm p-6 rounded-md border border-border bg-card">
          <AlertTriangle className="size-8 text-rose-500" />
          <p className="font-display text-base font-bold text-foreground">{t('caseNotFound')}</p>
          <p className="text-xs text-muted-foreground">{contentError}</p>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="font-mono text-xs font-bold uppercase tracking-wider text-primary hover:underline cursor-pointer"
          >
            {t('returnToDashboard')}
          </button>
        </div>
      </div>
    );
  }

  const isCaseClosed = caseState?.status === 'CASE_CLOSED';
  const phaseNumber = caseState?.currentPhaseId?.replace('phase-', '') || '1';
  const totalPhases = caseData?.phases?.length || 1;

  return (
    <div className="flex flex-col h-full overflow-hidden relative gap-2">
      {/* ═══════════════════════════════════════════════════════════════════════
          [ZONE A] TOP CASE COMMAND & 3-STEP INVESTIGATION PIPELINE BAR
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card/95 px-3.5 py-2 shadow-2xs shrink-0">
        {/* Left: Back to Hub, Case Identity & Left Drawer Toggle */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => navigate(`/cases/${caseId || 'case-001'}`)}
            title="Quay lại Phòng Tiếp Nhận Hồ Sơ Vụ Án"
            className="inline-flex items-center gap-1 rounded-sm border border-border bg-background hover:bg-muted px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
          >
            <span>← Phòng Hồ Sơ</span>
          </button>

          <button
            type="button"
            onClick={toggleCaseFilePanel}
            title={isCaseFileCollapsed ? t('showCaseFile') : t('collapseCaseFile')}
            aria-label={isCaseFileCollapsed ? t('showCaseFile') : t('collapseCaseFile')}
            className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
              !isCaseFileCollapsed
                ? 'border-primary/40 bg-primary/15 text-primary'
                : 'border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {isCaseFileCollapsed ? (
              <PanelLeftOpen className="size-3.5" />
            ) : (
              <PanelLeftClose className="size-3.5" />
            )}
            <span className="hidden sm:inline">1. Hồ Sơ Vụ Án</span>
          </button>

          <div className="h-5 w-px bg-border hidden sm:block" />

          <div className="min-w-0 flex items-center gap-2.5">
            <span className="detective-stamp text-primary border-primary/40 bg-primary/10 shrink-0 hidden md:inline-flex">
              {caseData?.caseNumber || 'CASE-001'}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
                  GIAI ĐOẠN {phaseNumber}/{totalPhases}
                </span>
                <span className="text-muted-foreground/40">•</span>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                  {caseState?.status === 'CASE_CLOSED' ? t('status_CASE_CLOSED') : t('status_INVESTIGATING')}
                </span>
              </div>
              <p className="font-display text-sm sm:text-base font-bold text-foreground truncate leading-tight">
                {caseData?.title}
              </p>
            </div>
          </div>
        </div>

        {/* Center: 3-Step Guided Investigation Pipeline */}
        <div className="hidden xl:flex items-center gap-1.5 rounded-sm border border-border bg-background/80 px-2.5 py-1">
          <button
            type="button"
            onClick={() => setCenterMode('dossier')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xs font-mono text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              centerMode === 'dossier'
                ? 'bg-primary/15 text-primary border border-primary/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileSearch className="size-3" />
            <span>B1: Khám nghiệm ({viewedCount}/{visibleSources.length})</span>
          </button>

          <ChevronRight className="size-3 text-muted-foreground/50" />

          <button
            type="button"
            onClick={() => setCenterMode('processing')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xs font-mono text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              centerMode === 'workbench' || centerMode === 'processing'
                ? 'bg-primary/15 text-primary border border-primary/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FlaskConical className="size-3" />
            <span>B2: Phân tích ({findings.length} manh mối)</span>
          </button>

          <ChevronRight className="size-3 text-muted-foreground/50" />

          <button
            type="button"
            onClick={() => {
              openHQ();
              setHQSection('report');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xs font-mono text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              uiState.hq.isOpen
                ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Send className="size-3" />
            <span>
              B3: Kết luận HQ ({filledRequiredCount}/{editableRequiredFields.length})
            </span>
          </button>
        </div>

        {/* Right: Trigger Button for HQ Dialog */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              openHQ();
              setHQSection('report');
            }}
            className={`inline-flex items-center gap-1.5 rounded-sm border px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs ${
              filledRequiredCount === editableRequiredFields.length && editableRequiredFields.length > 0
                ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25'
                : 'border-primary/50 bg-primary text-primary-foreground hover:opacity-90'
            }`}
          >
            <Radio className="size-3.5 animate-pulse" />
            <span>
              Điện Đàm &amp; Báo Cáo HQ ({filledRequiredCount}/{editableRequiredFields.length})
            </span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          MAIN 2-COLUMN INVESTIGATION BOARD (FULL-WIDTH FORENSIC DESK)
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 min-h-0 overflow-hidden gap-2">
        {/* ── [ZONE 01] Case File Dossier Folder (Left Column) ────────────── */}
        <div
          className={`
            flex-col rounded-md border border-border bg-card/90 overflow-hidden transition-all duration-200 shadow-2xs
            ${
              isCaseFileCollapsed
                ? 'w-0 min-w-0 overflow-hidden border-0'
                : 'flex w-full max-w-[300px] xl:max-w-[330px] shrink-0'
            }
          `}
        >
          <CaseFilePanel
            caseData={caseData}
            caseState={caseState}
            currentPhase={currentPhase}
            investigationQuestion={investigationQuestion}
            clues={clues}
            findings={findings}
            viewedSourceIds={investigationState?.viewedSourceIds || []}
            activeSourceId={uiState.workspace.activeSourceId}
            latestHQMessage={latestHQMessage}
            onOpenSource={(srcId) => {
              openSource(srcId);
              if (centerMode !== 'dossier') setCenterMode('dossier');
            }}
            onInvestigateInSpreadsheet={handleInvestigateFromClue}
            onDeleteFinding={handleDeleteFinding}
          />
        </div>

        {/* ── [ZONE 02] Full-Width Forensic Examination Desk ─────────────── */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden rounded-md border border-border bg-card shadow-2xs">
          {/* ── Pinned Investigation Directive & Inline Quick-Fill Verdict Bar ── */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-border bg-muted/35 px-4 py-2 shrink-0">
            {investigationQuestion && (
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="inline-flex items-center gap-1 rounded-xs border border-primary/40 bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary shrink-0">
                  <Crosshair className="size-3" />
                  Trọng tâm điều tra
                </span>
                <p
                  className="text-xs font-bold text-foreground truncate"
                  title={investigationQuestion.question}
                >
                  {investigationQuestion.question}
                </p>
              </div>
            )}

            {/* Inline Quick-Fill Evidence Slots (Click-to-Fill Bar) */}
            {editableRequiredFields.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                <span className="hidden 2xl:inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground mr-0.5">
                  <MousePointerClick className="size-3 text-primary" />
                  Điền nhanh kết luận:
                </span>
                {editableRequiredFields.map((field, idx) => {
                  const val = reportDraft?.fields?.[field.field_id]?.value || '';
                  const isCurrent = activeFieldId === field.field_id;
                  return (
                    <button
                      key={field.field_id}
                      type="button"
                      onClick={() => setActiveFieldId(field.field_id)}
                      title={`Chọn mục "${field.label}" rồi nhấp vào ô dữ liệu trên bảng để điền nhanh`}
                      className={`inline-flex items-center gap-1.5 rounded-xs border px-2 py-1 font-mono text-[10px] transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-primary bg-primary/15 text-primary font-bold shadow-2xs'
                          : val
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span className="opacity-70">M0{idx + 1}:</span>
                      <span className="max-w-[130px] truncate">
                        {val ? val : field.label}
                      </span>
                      {val && <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    openHQ();
                    setHQSection('report');
                  }}
                  className="inline-flex items-center gap-1 rounded-xs border border-primary/40 bg-primary/15 hover:bg-primary/25 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-primary cursor-pointer"
                >
                  <Send className="size-2.5" />
                  <span>Xem &amp; Gửi HQ</span>
                </button>
              </div>
            )}
          </div>

          {/* ── 3 Forensic Desk Stations Switcher ─────────────────────────── */}
          <div className="grid grid-cols-3 border-b-2 border-border bg-muted/20 px-2 pt-1.5 gap-1.5 shrink-0">
            {/* Station 1: Evidence Dossier */}
            <button
              type="button"
              onClick={() => setCenterMode('dossier')}
              className={`flex items-center gap-2.5 px-3 py-2 text-left rounded-t-sm transition-all cursor-pointer ${
                centerMode === 'dossier'
                  ? 'border-t-2 border-x border-primary bg-card text-primary -mb-[2px] shadow-2xs'
                  : 'border-t-2 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              <div
                className={`grid size-7 shrink-0 place-items-center rounded-xs border font-mono text-[10px] font-bold ${
                  centerMode === 'dossier'
                    ? 'border-primary/40 bg-primary/15 text-primary'
                    : 'border-border bg-muted text-muted-foreground'
                }`}
              >
                <FolderOpen className="size-3.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-widest opacity-75">
                    TRẠM 01
                  </span>
                </div>
                <p className="text-xs font-bold truncate">{t('evidenceDossier')}</p>
              </div>
            </button>

            {/* Station 2: Investigation Workbench (Spreadsheet) */}
            <button
              type="button"
              onClick={() => {
                if (workbenchContext) {
                  setCenterMode('workbench');
                } else {
                  let targetSource = activeSource?.type === 'table' ? activeSource : null;
                  let targetDataset = activeDataset;
                  if (!targetSource || !targetDataset) {
                    targetSource = caseData?.sources?.find((s) => s.type === 'table' && s.isUnlocked);
                    if (targetSource) {
                      targetDataset = caseData?.datasets?.[targetSource.datasetId];
                    }
                  }
                  if (targetSource && targetDataset) {
                    setWorkbenchContext({
                      sourceId: targetSource.id,
                      sourceTitle: targetSource.title,
                      dataset: targetDataset,
                    });
                  }
                  setCenterMode('workbench');
                }
              }}
              className={`flex items-center gap-2.5 px-3 py-2 text-left rounded-t-sm transition-all cursor-pointer ${
                centerMode === 'workbench'
                  ? 'border-t-2 border-x border-primary bg-card text-primary -mb-[2px] shadow-2xs'
                  : 'border-t-2 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              <div
                className={`grid size-7 shrink-0 place-items-center rounded-xs border font-mono text-[10px] font-bold ${
                  centerMode === 'workbench'
                    ? 'border-primary/40 bg-primary/15 text-primary'
                    : 'border-border bg-muted text-muted-foreground'
                }`}
              >
                <FlaskConical className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-widest opacity-75">
                    TRẠM 02
                  </span>
                  {workbenchContext && <span className="size-1.5 rounded-full bg-emerald-500" />}
                </div>
                <p className="text-xs font-bold truncate">{t('investigationWorkbench')}</p>
              </div>
            </button>

            {/* Station 3: Forensic Data Processing Lab */}
            <button
              type="button"
              onClick={() => setCenterMode('processing')}
              className={`flex items-center gap-2.5 px-3 py-2 text-left rounded-t-sm transition-all cursor-pointer ${
                centerMode === 'processing'
                  ? 'border-t-2 border-x border-primary bg-card text-primary -mb-[2px] shadow-2xs'
                  : 'border-t-2 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              <div
                className={`grid size-7 shrink-0 place-items-center rounded-xs border font-mono text-[10px] font-bold ${
                  centerMode === 'processing'
                    ? 'border-primary/40 bg-primary/15 text-primary'
                    : 'border-border bg-muted text-muted-foreground'
                }`}
              >
                <Database className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-widest opacity-75">
                    TRẠM 03
                  </span>
                  {stepSources.length > 0 && (
                    <span className="text-[9px] font-mono font-bold px-1 rounded-xs bg-primary/15 text-primary border border-primary/30">
                      {stepSources.length} bảng
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold truncate">
                  {t('dataProcessing.title', 'Xử Lý Dữ Liệu')}
                </p>
              </div>
            </button>
          </div>

          {/* ── Center Station Active Viewport ────────────────────────────── */}
          <div className="flex-1 min-h-0 overflow-hidden relative bg-background">
            {/* Station 1: Evidence Dossier */}
            {centerMode === 'dossier' && (
              <EvidencePanel
                source={activeSource}
                dataset={activeDataset}
                openSourceIds={uiState.workspace.openSourceIds}
                caseData={caseData}
                onSelectTab={openSource}
                onClose={null}
                onSelectDataValue={handleSelectDataValue}
                activeFieldId={activeFieldId}
                activeFieldLabel={activeFieldLabel}
                onInvestigateInSpreadsheet={(sourceId, dataset) =>
                  handleInvestigateInSpreadsheet(sourceId, dataset)
                }
              />
            )}

            {/* Station 3: Data Processing Workspace */}
            {centerMode === 'processing' && (
              <DataProcessingWorkspace
                step={{
                  id: caseState?.currentPhaseId || 'phase-1',
                  caseId,
                  chapterId: caseState?.currentPhaseId || 'phase-1',
                  stepId: caseState?.currentPhaseId || 'phase-1',
                  investigationQuestion:
                    investigationQuestion?.question || currentPhase?.investigationQuestion?.question,
                  context: {
                    title:
                      typeof currentPhase?.title === 'object'
                        ? currentPhase.title[i18n.language] || currentPhase.title.vi || currentPhase.title.en
                        : currentPhase?.title,
                    narrative:
                      investigationQuestion?.context ||
                      (typeof currentPhase?.description === 'object'
                        ? currentPhase.description[i18n.language] ||
                          currentPhase.description.vi ||
                          currentPhase.description.en
                        : currentPhase?.description),
                    location: caseData?.title,
                  },
                  location: caseData?.title,
                  processor:
                    caseData?.tool === 'sql' || currentPhase?.processor === 'sql' ? 'sql' : 'excel',
                  availableSources: stepSources.map((s) => s.id),
                  dataSources: stepSources,
                }}
                caseId={caseId}
                chapterId={caseState?.currentPhaseId}
                stepId={caseState?.currentPhaseId}
                onRecordFinding={handleRecordFinding}
                onDeleteFinding={handleDeleteFinding}
                findings={findings}
                onBack={() => setCenterMode('dossier')}
                userId={userId}
              />
            )}

            {/* Station 2: Investigation Workbench */}
            {centerMode === 'workbench' && workbenchContext && (
              <InvestigationWorkbench
                sourceEvidenceId={workbenchContext.sourceId}
                sourceTitle={workbenchContext.sourceTitle}
                dataset={workbenchContext.dataset}
                workbenchState={investigationState?.toolState?.workbench}
                phaseId={caseState?.currentPhaseId}
                isHQOpen={uiState.hq.isOpen}
                onSaveWorkbenchState={handleSaveWorkbenchState}
                onRecordFinding={handleRecordFinding}
                onViewSource={handleViewSource}
              />
            )}

            {/* Station 2 Empty State */}
            {centerMode === 'workbench' && !workbenchContext && (
              <div className="flex flex-col items-center justify-center h-full text-center px-6 bg-forensic-grid">
                <div className="dossier-card corner-brackets max-w-md w-full rounded-md border border-border bg-card p-6 shadow-sm">
                  <FlaskConical className="size-9 text-primary mx-auto mb-3" />
                  <p className="font-display text-base font-bold text-foreground">
                    {t('investigationWorkbench')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t(
                      'selectEvidenceTableToAnalyze',
                      'Chọn một bảng dữ liệu bên dưới để nạp vào Bàn Phân Tích:'
                    )}
                  </p>
                  <div className="mt-4 flex flex-col gap-2 w-full">
                    {caseData?.sources
                      ?.filter((s) => (s.type === 'table' || s.type === 'sql_table') && s.isUnlocked)
                      .map((s, idx) => {
                        const ds = caseData?.datasets?.[s.datasetId];
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => handleInvestigateInSpreadsheet(s.id, ds)}
                            className="flex items-center justify-between p-3 rounded-sm border border-border bg-background hover:border-primary/50 hover:bg-muted/40 transition-all text-left cursor-pointer group"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="font-mono text-[9px] font-bold uppercase text-primary block">
                                [EXHIBIT #{idx + 1}]
                              </span>
                              <p className="text-xs font-bold text-foreground truncate group-hover:text-primary">
                                {s.title}
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate">{s.description}</p>
                            </div>
                            <span className="font-mono text-[10px] font-bold uppercase text-primary bg-primary/10 border border-primary/30 px-2.5 py-1 rounded-xs shrink-0">
                              {t('loadEvidenceToSpreadsheet', 'Nạp bảng')}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          [DIALOG] CENTERED HQ DISPATCH & OFFICIAL VERDICT DOSSIER MODAL
          ═══════════════════════════════════════════════════════════════════════ */}
      <HQCommunicationPanel
        embedded={false}
        isOpen={uiState.hq.isOpen}
        activeSection={uiState.hq.activeSection || 'report'}
        caseData={caseData}
        caseState={caseState}
        investigationState={investigationState}
        reportDraft={reportDraft}
        reportDefinition={reportDefinition}
        findings={findings}
        isVerifying={isVerifying}
        onClose={closeHQ}
        onSetSection={setHQSection}
        onAddNote={addNote}
        onUpdateNote={updateNote}
        onDeleteNote={deleteNote}
        onUnpinEvidence={unpinEvidence}
        onUpdateReportField={updateReportField}
        onSendReport={sendReport}
        onResumeInvestigation={resumeInvestigation}
        onOpenReport={(def) => openReport(def)}
        activeFieldId={activeFieldId}
        onSelectField={setActiveFieldId}
      />

      {/* ── Floating HQ Terminal Trigger (Bottom-Right Quick Access) ──────── */}
      {!uiState.hq.isOpen && (
        <div className="absolute bottom-4 right-4 z-30">
          {['CASE_PROGRESS', 'REPORT_RETURNED', 'CASE_CLOSED'].includes(caseState?.status) && (
            <div className="absolute -top-1 -right-1 size-3 rounded-full bg-amber-500 animate-bounce z-10" />
          )}
          <button
            type="button"
            id="hq-communication-trigger"
            onClick={openHQ}
            className="dossier-card flex items-center gap-2 rounded-sm border shadow-xl px-4 py-2.5 bg-card border-primary/50 text-foreground hover:bg-primary/15 backdrop-blur-sm transition-all cursor-pointer group"
            aria-label={t('openHQTerminal')}
            title={t('openHQTerminal')}
          >
            <Radio className="size-4 text-primary animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              {t('openHQTerminal')}
            </span>
          </button>
        </div>
      )}

      {/* ── Official Case Closed Stamp Overlay ───────────────────────────── */}
      {isCaseClosed && (
        <div className="absolute inset-0 pointer-events-none z-20 flex items-start justify-center pt-12">
          <div className="pointer-events-auto">
            <div className="flex flex-col items-center gap-1 px-6 py-3 rounded-sm border-4 border-emerald-500 bg-emerald-500/15 backdrop-blur-sm shadow-2xl rotate-[-2deg]">
              <Stamp className="size-5 text-emerald-500" />
              <span className="font-mono text-sm font-black tracking-widest uppercase text-emerald-500">
                {t('caseSolved')}
              </span>
              <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                {t('investigationConcluded', { caseNumber: caseData?.caseNumber?.replace('#', '') })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
