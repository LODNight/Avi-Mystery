import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Radio,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Loader2,
  FolderOpen,
  FlaskConical,
  Stamp,
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

import { useTranslation } from 'react-i18next';

/**
 * DetectiveWorkspacePage — Sprint 12 Investigation Tool Loop
 *
 * Route: /cases/:caseId/investigate
 *
 * Layout:
 *   Case File (left) | Evidence Dossier / Investigation Workbench (center) | HQ Terminal (right)
 *
 * UX flow:
 *   Evidence → Investigate in Spreadsheet → Workbench → Record Finding →
 *   Use Finding → Report → Verify → New Lead → Next Phase → CASE_CLOSED
 */
export function DetectiveWorkspacePage() {
  const { t, i18n } = useTranslation('investigation');
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFocusMode, toggleFocusMode } = useFocusMode();

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
    pinEvidence,
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

  // ── Center mode: 'dossier' | 'workbench' ─────────────────────────────────
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
      const firstSource = caseData.sources.find(s => s.isUnlocked) || caseData.sources[0];
      if (firstSource) {
        openSource(firstSource.id);
      }
    }
  }, [caseData, uiState.workspace.activeSourceId, openSource]);

  // ── Auto-focus first editable required field ───────────────────────────────
  useEffect(() => {
    if (!activeFieldId && reportDefinition?.fields) {
      const firstEditable = reportDefinition.fields.find(f => f.editable && f.required);
      if (firstEditable) {
        setActiveFieldId(firstEditable.field_id);
      }
    }
  }, [reportDefinition, activeFieldId]);

  // ── Smart Click-to-Fill Handler (secondary UX path) ───────────────────────
  // Kept for compatibility, demoted from primary path
  const handleSelectDataValue = (val) => {
    let targetFieldId = activeFieldId;
    if (!targetFieldId && reportDefinition?.fields) {
      const firstEditable = reportDefinition.fields.find(f => f.editable);
      if (firstEditable) targetFieldId = firstEditable.field_id;
    }
    if (!targetFieldId) return;

    updateReportField(targetFieldId, val);

    // Smart auto-advance to next empty required field
    if (reportDefinition?.fields) {
      const editableFields = reportDefinition.fields.filter(f => f.editable && f.required);
      const currentIndex = editableFields.findIndex(f => f.field_id === targetFieldId);
      const nextField = editableFields.find((f, idx) => idx > currentIndex && !reportDraft?.fields?.[f.field_id]?.value);
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
  }, [caseState?.status, uiState.hq.isOpen]);

  // ── Investigate in Spreadsheet ─────────────────────────────────────────────
  // Triggered from EvidencePanel CTA or ClueCard workbench shortcut
  const handleInvestigateInSpreadsheet = useCallback((sourceId, dataset) => {
    const source = caseData?.sources?.find(s => s.id === sourceId);
    if (!source) return;
    // Use passed dataset or look up from activeDataset
    const ds = dataset || activeDataset;
    if (!ds) return;

    setWorkbenchContext({
      sourceId,
      sourceTitle: source.title,
      dataset: ds,
    });
    setCenterMode('workbench');
  }, [caseData, activeDataset]);

  // Triggered from ClueCard workbench shortcut (opens source first, then workbench)
  const handleInvestigateFromClue = useCallback((sourceId) => {
    const source = caseData?.sources?.find(s => s.id === sourceId);
    if (!source || source.type !== 'table') return;

    // Get the dataset for this source
    const dataset = caseData?.datasets?.[source.datasetId];
    if (!dataset) {
      // Open source first so user can see it, then prompt
      openSource(sourceId);
      return;
    }

    setWorkbenchContext({
      sourceId,
      sourceTitle: source.title,
      dataset,
    });
    setCenterMode('workbench');
  }, [caseData, openSource]);

  // ── View source from Workbench ─────────────────────────────────────────────
  const handleViewSource = useCallback(() => {
    if (workbenchContext?.sourceId) {
      openSource(workbenchContext.sourceId);
    }
    setCenterMode('dossier');
  }, [workbenchContext, openSource]);

  // ── Record Finding ─────────────────────────────────────────────────────────
  const handleRecordFinding = useCallback((findingData) => {
    investigationStateService.recordFinding(caseId, userId, {
      ...findingData,
      phaseId: caseState?.currentPhaseId,
    });
  }, [caseId, userId, caseState?.currentPhaseId]);

  // ── Delete Finding ─────────────────────────────────────────────────────────
  const handleDeleteFinding = useCallback((findingId) => {
    investigationStateService.deleteFinding(caseId, userId, findingId);
  }, [caseId, userId]);

  // ── Save Workbench State ───────────────────────────────────────────────────
  const handleSaveWorkbenchState = useCallback((workbenchState) => {
    investigationStateService.saveWorkbenchState(caseId, userId, workbenchState);
  }, [caseId, userId]);

  const isCaseFileCollapsed = uiState.workspace.isCaseFilePanelCollapsed || isFocusMode;

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 text-amber-500 animate-spin" />
          <p className="text-sm text-muted-foreground">{t('loadingCaseFile')}</p>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (contentError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
          <AlertTriangle className="size-8 text-rose-500" />
          <p className="text-sm font-semibold text-foreground">{t('caseNotFound')}</p>
          <p className="text-xs text-muted-foreground">{contentError}</p>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="text-xs text-amber-600 hover:underline cursor-pointer"
          >
            {t('returnToDashboard')}
          </button>
        </div>
      </div>
    );
  }

  // ── Case Closed Stamp ──────────────────────────────────────────────────────
  const isCaseClosed = caseState?.status === 'CASE_CLOSED';

  return (
    <div className="flex flex-col h-full overflow-hidden relative">

      {/* ── Main Workspace — horizontal split ─────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden gap-0">

        {/* ── Case File Region (Left) ────────────────────────────────────── */}
        <div
          className={`
            flex-col border-r border-border/60 bg-card/40 overflow-hidden transition-all duration-200
            ${isCaseFileCollapsed
              ? 'w-0 min-w-0 overflow-hidden border-0'
              : 'flex w-full max-w-[280px] xl:max-w-[310px] shrink-0'
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
            onOpenSource={openSource}
            onInvestigateInSpreadsheet={handleInvestigateFromClue}
            onDeleteFinding={handleDeleteFinding}
          />
        </div>

        {/* ── Collapse/Expand toggle Left ───────────────────────────────── */}
        <button
          type="button"
          onClick={toggleCaseFilePanel}
          title={isCaseFileCollapsed ? t('showCaseFile') : t('collapseCaseFile')}
          className="
            flex-none w-3 flex items-center justify-center
            bg-muted/20 hover:bg-muted/40 border-r border-border/60
            text-muted-foreground hover:text-foreground
            transition-colors cursor-pointer group
          "
          aria-label={isCaseFileCollapsed ? t('showCaseFile') : t('collapseCaseFile')}
        >
          {isCaseFileCollapsed
            ? <ChevronRight className="size-2.5 group-hover:scale-110 transition-transform" />
            : <ChevronLeft className="size-2.5 group-hover:scale-110 transition-transform" />
          }
        </button>

        {/* ── Evidence / Workbench Region (Center) ─────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-background">

          {/* ── Center Mode Tab Switcher ──────────────────────────────── */}
          <div className="flex items-center border-b border-border/60 bg-muted/15 px-2 shrink-0">
            <button
              type="button"
              onClick={() => setCenterMode('dossier')}
              className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
                centerMode === 'dossier'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-background/60'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <FolderOpen className="size-3" />
              {t('evidenceDossier')}
            </button>
            <button
              type="button"
              onClick={() => centerMode === 'dossier' && workbenchContext && setCenterMode('workbench')}
              disabled={!workbenchContext}
              className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold border-b-2 transition-colors cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
                centerMode === 'workbench'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-background/60'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              title={!workbenchContext ? t('workbenchEmptyDesc') : undefined}
            >
              <FlaskConical className="size-3" />
              {t('investigationWorkbench')}
              {workbenchContext && <span className="size-1.5 rounded-full bg-amber-500 ml-0.5" />}
            </button>
          </div>

          {/* ── Center Content ─────────────────────────────────────────── */}
          <div className="flex-1 min-h-0 overflow-hidden relative">
            {/* Evidence Dossier */}
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
                onInvestigateInSpreadsheet={(sourceId, dataset) => handleInvestigateInSpreadsheet(sourceId, dataset)}
              />
            )}

            {/* Investigation Workbench */}
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

            {/* Workbench empty state (tab clicked but no context) */}
            {centerMode === 'workbench' && !workbenchContext && (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <FlaskConical className="size-8 text-muted-foreground/20 mb-3" />
                <p className="text-sm font-semibold text-foreground/60">{t('investigationWorkbench')}</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  {t('workbenchEmptyDesc')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Investigation & HQ Terminal Column (Right) ─────────────── */}
        <div
          className={`
            flex-col border-l border-border/60 bg-card/40 overflow-hidden transition-all duration-200
            ${uiState.hq.isOpen
              ? 'flex w-full max-w-[360px] xl:max-w-[420px] shrink-0'
              : 'w-0 min-w-0 overflow-hidden border-0'
            }
          `}
        >
          {uiState.hq.isOpen && (
            <HQCommunicationPanel
              embedded={true}
              isOpen={true}
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
          )}
        </div>
      </div>

      {/* ── HQ Terminal Trigger ──────────────────────────────────────────── */}
      {!uiState.hq.isOpen && (
        <div className="absolute bottom-4 right-4 z-30">
          {['CASE_PROGRESS', 'REPORT_RETURNED', 'CASE_CLOSED'].includes(caseState?.status) && (
            <div className="absolute -top-1 -right-1 size-3 rounded-full bg-amber-500 animate-bounce z-10" />
          )}
          <button
            type="button"
            id="hq-communication-trigger"
            onClick={openHQ}
            className="flex items-center gap-2 rounded-2xl border shadow-lg px-4 py-2.5 bg-card/95 border-amber-500/40 text-foreground hover:bg-amber-500/15 backdrop-blur-sm transition-all cursor-pointer group"
            aria-label={t('openHQTerminal')}
            title={t('openHQTerminal')}
          >
            <Radio className="size-4 text-amber-500 animate-pulse" />
            <span className="text-xs font-bold">{t('openHQTerminal')}</span>
          </button>
        </div>
      )}

      {/* ── Investigation Stamp (CASE_CLOSED only) ───────────────────────── */}
      {isCaseClosed && (
        <div className="absolute inset-0 pointer-events-none z-20 flex items-start justify-center pt-8">
          <div className="pointer-events-auto">
            <div className="flex flex-col items-center gap-1 px-6 py-3 rounded-2xl border-4 border-emerald-500 bg-emerald-500/10 backdrop-blur-sm shadow-2xl rotate-[-2deg]">
              <Stamp className="size-5 text-emerald-500" />
              <span className="text-sm font-black tracking-widest uppercase text-emerald-500">
                {t('caseSolved')}
              </span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                {t('investigationConcluded', { caseNumber: caseData?.caseNumber?.replace('#', '') })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
