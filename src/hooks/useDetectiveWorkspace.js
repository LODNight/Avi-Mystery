/**
 * useDetectiveWorkspace.js
 *
 * Central hook for the Detective Workspace.
 * Coordinates the four state domains and exposes a clean API to the page component.
 *
 * Separates: Case State, Investigation State, Report State, UI State.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  caseStateService,
  investigationStateService,
  reportStateService,
  verificationEngine,
} from '../services/investigationSessionService.js';
import { caseContentService } from '../services/caseContentService.js';
import { useTranslation } from 'react-i18next';

export function useDetectiveWorkspace({ caseId, userId = 'user-001' }) {
  // ── Content (static, from case data) ────────────────────────────────────────
  const [caseData, setCaseData] = useState(null);
  const [contentError, setContentError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Domain 1: Case State ────────────────────────────────────────────────────
  const [caseState, setCaseState] = useState(null);

  // ── Domain 2: Investigation State ───────────────────────────────────────────
  const [investigationState, setInvestigationState] = useState(null);

  // ── Domain 3: Report State ──────────────────────────────────────────────────
  const [reportDraft, setReportDraft] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // ── Domain 4: UI State ──────────────────────────────────────────────────────
  const [uiState, setUIState] = useState({
    hq: { isOpen: true, activeSection: 'report' },
    workspace: {
      activeSourceId: null,
      openSourceIds: [],
      activeEvidenceTab: null,
      isCaseFilePanelCollapsed: false,
      isFocusMode: false,
    },
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const { i18n } = useTranslation();

  // ── Load case content ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!caseId) return;
    setIsLoading(true);

    const caseRes = caseContentService.getCase(caseId);
    if (caseRes.error || !caseRes.data) {
      setContentError(caseRes.error || `Case "${caseId}" not found.`);
      setIsLoading(false);
      return;
    }

    setCaseData(caseRes.data);
    setIsLoading(false);
  }, [caseId, i18n.language]);

  // ── Restore state domains ───────────────────────────────────────────────────
  useEffect(() => {
    if (!caseId) return;

    // Restore state domains from storage
    const cs = caseStateService.getState(caseId, userId);
    const is = investigationStateService.getState(caseId, userId);
    let rd = reportStateService.getDraft(caseId, cs.currentPhaseId, userId);

    if (!rd) {
      const defRes = caseContentService.getReportDefinition(caseId, cs.currentPhaseId);
      if (defRes.data) {
        rd = reportStateService.initDraft(caseId, cs.currentPhaseId, userId, defRes.data);
      }
    }

    setCaseState(cs);
    setInvestigationState(is);
    setReportDraft(rd);

    // Auto-select first unlocked source if none active
    const caseRes = caseContentService.getCase(caseId);
    if (caseRes.data) {
      const firstSource = caseRes.data.sources?.find(s => s.isUnlocked) || caseRes.data.sources?.[0];
      if (firstSource) {
        setUIState(prev => ({
          ...prev,
          workspace: {
            ...prev.workspace,
            activeSourceId: prev.workspace.activeSourceId || firstSource.id,
            openSourceIds: prev.workspace.openSourceIds.length > 0 ? prev.workspace.openSourceIds : [firstSource.id],
            activeEvidenceTab: prev.workspace.activeEvidenceTab || firstSource.id,
          },
        }));
      }
    }
  }, [caseId, userId]);

  // ── Case State Actions ───────────────────────────────────────────────────────

  const startInvestigation = useCallback(() => {
    const next = caseStateService.startInvestigation(caseId, userId);
    if (isMountedRef.current) setCaseState(next);
  }, [caseId, userId]);

  const openReport = useCallback((reportDefinition) => {
    // Transition case state
    const nextCaseState = caseStateService.openReport(caseId, userId);
    if (isMountedRef.current) setCaseState(nextCaseState);

    // Initialize draft if none exists
    const phaseId = nextCaseState.currentPhaseId;
    const draft = reportStateService.initDraft(caseId, phaseId, userId, reportDefinition);
    if (isMountedRef.current) setReportDraft(draft);
  }, [caseId, userId]);

  const sendReport = useCallback(async () => {
    if (!reportDraft || !caseState) return;
    const phaseId = caseState.currentPhaseId;

    // Transition: REPORT_READY → SUBMITTED
    caseStateService.submitReport(caseId, userId);
    const submittedDraft = reportStateService.markSubmitted(caseId, phaseId, userId);
    if (isMountedRef.current) {
      setReportDraft(submittedDraft);
      setCaseState(prev => ({ ...prev, status: 'SUBMITTED' }));
      setIsVerifying(true);
    }

    // Simulate verification delay
    await new Promise(r => setTimeout(r, 1800));
    if (!isMountedRef.current) return;

    // Load verification rules and run engine
    const rulesRes = caseContentService.getVerificationRules(caseId, phaseId);
    if (rulesRes.error || !rulesRes.data) {
      setIsVerifying(false);
      return;
    }

    const result = verificationEngine.verify(submittedDraft, rulesRes.data);

    // Apply result to report
    const updatedDraft = reportStateService.applyVerificationResult(caseId, phaseId, userId, result);
    if (isMountedRef.current) setReportDraft(updatedDraft);

    // Advance case state
    let nextCaseState;
    if (result.overall === 'ACCEPTED') {
      // Check if this is a case-close (no next phase) or phase progression
      const rulesData = rulesRes.data;
      const isCloseCase = rulesData.onAccepted?.action === 'close_case';

      if (isCloseCase) {
        // CASE_CLOSED — no next phase
        nextCaseState = caseStateService.acceptReport(caseId, userId, {
          nextPhaseId: null,
          hqMessage: result.hqMessage,
          newLeadText: null,
        });
        // Force CASE_CLOSED status
        nextCaseState = { ...nextCaseState, status: 'CASE_CLOSED' };
        // Persist
        const { writeStorage } = await import('../services/investigationSessionService.js').then(m => m);
        // Use caseStateService directly since we need to write the closed state
        nextCaseState = caseStateService.acceptReport(caseId, userId, { nextPhaseId: null, hqMessage: result.hqMessage });
        // Manually set to CASE_CLOSED since acceptReport may set CASE_PROGRESS
        const storageKey = `avi-cs-${caseId}-${userId}`;
        const stored = JSON.parse(localStorage.getItem(storageKey) || '{}');
        const closedState = { ...stored, ...nextCaseState, status: 'CASE_CLOSED' };
        localStorage.setItem(storageKey, JSON.stringify(closedState));
        nextCaseState = closedState;
      } else {
        nextCaseState = caseStateService.acceptReport(caseId, userId, {
          nextPhaseId: result.nextPhaseId,
          hqMessage: result.hqMessage,
          newLeadText: result.newLeadText,
        });
      }
    } else {
      nextCaseState = caseStateService.returnReport(caseId, userId, { hqMessage: result.hqMessage });
    }

    if (isMountedRef.current) {
      setCaseState(nextCaseState);
      setIsVerifying(false);
    }
  }, [caseId, userId, caseState, reportDraft]);

  const resumeInvestigation = useCallback(() => {
    // If case is CASE_CLOSED, just close HQ — don't revert state
    if (caseState?.status === 'CASE_CLOSED') {
      setUIState(prev => ({ ...prev, hq: { isOpen: false, activeSection: null } }));
      return;
    }
    const next = caseStateService.resumeInvestigation(caseId, userId);
    if (isMountedRef.current) {
      setCaseState(next);
      // Close HQ panel
      setUIState(prev => ({ ...prev, hq: { isOpen: false, activeSection: null } }));
    }
  }, [caseId, userId, caseState]);

  // ── Investigation State Actions ──────────────────────────────────────────────

  const addNote = useCallback((noteData) => {
    const next = investigationStateService.addNote(caseId, userId, noteData);
    if (isMountedRef.current) setInvestigationState(next);
  }, [caseId, userId]);

  const updateNote = useCallback((noteId, text) => {
    const next = investigationStateService.updateNote(caseId, userId, noteId, text);
    if (isMountedRef.current) setInvestigationState(next);
  }, [caseId, userId]);

  const deleteNote = useCallback((noteId) => {
    const next = investigationStateService.deleteNote(caseId, userId, noteId);
    if (isMountedRef.current) setInvestigationState(next);
  }, [caseId, userId]);

  const pinEvidence = useCallback((evidenceData) => {
    const next = investigationStateService.pinEvidence(caseId, userId, evidenceData);
    if (isMountedRef.current) setInvestigationState(next);
  }, [caseId, userId]);

  const unpinEvidence = useCallback((evidenceId) => {
    const next = investigationStateService.unpinEvidence(caseId, userId, evidenceId);
    if (isMountedRef.current) setInvestigationState(next);
  }, [caseId, userId]);

  const saveToolState = useCallback((toolState) => {
    investigationStateService.saveToolState(caseId, userId, toolState);
    // Not setting state here — tool state is write-only from this hook
  }, [caseId, userId]);

  // ── Report State Actions ────────────────────────────────────────────────────

  const updateReportField = useCallback((fieldId, value) => {
    if (!caseState) return;
    const phaseId = caseState.currentPhaseId;
    const next = reportStateService.updateField(caseId, phaseId, userId, fieldId, value);
    if (isMountedRef.current) setReportDraft(next);
  }, [caseId, userId, caseState]);

  // ── UI State Actions ─────────────────────────────────────────────────────────

  const openHQ = useCallback(() => {
    setUIState(prev => ({ ...prev, hq: { isOpen: true, activeSection: prev.hq.activeSection || 'report' } }));
  }, []);

  const closeHQ = useCallback(() => {
    setUIState(prev => ({ ...prev, hq: { ...prev.hq, isOpen: false } }));
  }, []);

  const setHQSection = useCallback((section) => {
    setUIState(prev => ({ ...prev, hq: { ...prev.hq, activeSection: section } }));
  }, []);

  const openSource = useCallback((sourceId) => {
    // Mark as viewed
    const next = investigationStateService.markSourceViewed(caseId, userId, sourceId);
    if (isMountedRef.current) setInvestigationState(next);

    // If case was OPEN, start investigation
    if (caseState?.status === 'OPEN') startInvestigation();

    setUIState(prev => {
      const openIds = prev.workspace.openSourceIds.includes(sourceId)
        ? prev.workspace.openSourceIds
        : [...prev.workspace.openSourceIds.slice(-2), sourceId]; // Keep last 3
      return {
        ...prev,
        workspace: {
          ...prev.workspace,
          activeSourceId: sourceId,
          openSourceIds: openIds,
          activeEvidenceTab: sourceId,
        },
      };
    });
  }, [caseId, userId, caseState, startInvestigation]);

  const toggleCaseFilePanel = useCallback(() => {
    setUIState(prev => ({
      ...prev,
      workspace: {
        ...prev.workspace,
        isCaseFilePanelCollapsed: !prev.workspace.isCaseFilePanelCollapsed,
      },
    }));
  }, []);

  // ── Derived state ─────────────────────────────────────────────────────────

  const activeSource = caseData?.sources?.find(
    s => s.id === uiState.workspace.activeSourceId
  ) ?? null;

  const activeDataset = activeSource?.datasetId
    ? caseContentService.getDataset(caseId, activeSource.datasetId).data
    : null;

  const currentPhase = caseData?.phases?.find(
    p => p.id === caseState?.currentPhaseId
  ) ?? null;

  const latestHQMessage = caseState?.hqMessages?.slice(-1)[0] ?? null;

  return {
    // Content
    caseData,
    contentError,
    isLoading,

    // State domains
    caseState,
    investigationState,
    reportDraft,
    isVerifying,
    uiState,

    // Derived
    activeSource,
    activeDataset,
    currentPhase,
    latestHQMessage,

    // Actions
    startInvestigation,
    openReport,
    sendReport,
    resumeInvestigation,

    addNote,
    updateNote,
    deleteNote,
    pinEvidence,
    unpinEvidence,
    saveToolState,

    updateReportField,

    openHQ,
    closeHQ,
    setHQSection,
    openSource,
    toggleCaseFilePanel,
  };
}
