/**
 * investigationSessionService.js
 *
 * Manages the unified investigation session state.
 * Coordinates: Case State, Investigation State, Report State.
 *
 * Sprint 1: localStorage-backed.
 * Future: Firestore-synced with localStorage fallback.
 *
 * Four domains are stored separately to allow independent updates.
 */

const STORAGE_KEYS = {
  caseState:           (caseId, userId) => `avi:case:${caseId}:${userId}:state`,
  investigationState:  (caseId, userId) => `avi:investigation:${caseId}:${userId}`,
  reportDraft:         (caseId, phaseId, userId) => `avi:report:${caseId}:${phaseId}:${userId}`,
};

// ── Utilities ─────────────────────────────────────────────────────────────────

function readStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

function now() { return new Date().toISOString(); }
function uid() { return crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`; }

// ── DOMAIN 1: Case State ─────────────────────────────────────────────────────

export const caseStateService = {
  /**
   * Get or initialize Case State.
   * If no state exists, creates OPEN state.
   */
  getState(caseId, userId) {
    const key = STORAGE_KEYS.caseState(caseId, userId);
    const stored = readStorage(key);
    if (stored) return stored;

    const initial = {
      caseId,
      userId,
      status: 'OPEN',
      currentPhaseId: 'phase-1',
      completedPhaseIds: [],
      unlockedPhaseIds: ['phase-1'],
      hqMessages: [],
      startedAt: null,
      lastActivityAt: now(),
      closedAt: null,
    };
    writeStorage(key, initial);
    return initial;
  },

  saveState(caseId, userId, updates) {
    const key = STORAGE_KEYS.caseState(caseId, userId);
    const current = this.getState(caseId, userId);
    const next = { ...current, ...updates, lastActivityAt: now() };
    writeStorage(key, next);
    return next;
  },

  startInvestigation(caseId, userId) {
    const current = this.getState(caseId, userId);
    if (current.status !== 'OPEN') return current;
    return this.saveState(caseId, userId, {
      status: 'INVESTIGATING',
      startedAt: current.startedAt || now(),
    });
  },

  openReport(caseId, userId) {
    return this.saveState(caseId, userId, { status: 'REPORT_READY' });
  },

  submitReport(caseId, userId) {
    return this.saveState(caseId, userId, { status: 'SUBMITTED' });
  },

  setVerifying(caseId, userId) {
    return this.saveState(caseId, userId, { status: 'VERIFYING' });
  },

  acceptReport(caseId, userId, { nextPhaseId, hqMessage, newLeadText }) {
    const current = this.getState(caseId, userId);
    const msg = {
      id: uid(),
      phaseId: current.currentPhaseId,
      type: 'progress',
      content: hqMessage,
      newLeadText: newLeadText || null,
      sentAt: now(),
    };
    const updates = {
      status: nextPhaseId ? 'CASE_PROGRESS' : 'CASE_CLOSED',
      completedPhaseIds: [...current.completedPhaseIds, current.currentPhaseId],
      unlockedPhaseIds: nextPhaseId
        ? [...(current.unlockedPhaseIds || []), nextPhaseId]
        : current.unlockedPhaseIds,
      currentPhaseId: nextPhaseId || current.currentPhaseId,
      hqMessages: [...current.hqMessages, msg],
      closedAt: nextPhaseId ? null : now(),
    };
    return this.saveState(caseId, userId, updates);
  },

  returnReport(caseId, userId, { hqMessage }) {
    const current = this.getState(caseId, userId);
    const msg = {
      id: uid(),
      phaseId: current.currentPhaseId,
      type: 'returned',
      content: hqMessage,
      sentAt: now(),
    };
    return this.saveState(caseId, userId, {
      status: 'REPORT_RETURNED',
      hqMessages: [...current.hqMessages, msg],
    });
  },

  resumeInvestigation(caseId, userId) {
    return this.saveState(caseId, userId, { status: 'INVESTIGATING' });
  },

  resetCase(caseId, userId) {
    const key = STORAGE_KEYS.caseState(caseId, userId);
    localStorage.removeItem(key);
  },
};

// ── DOMAIN 2: Investigation State ─────────────────────────────────────────────

const NOTE_CATEGORIES = ['theory', 'observation', 'suspicious', 'to_verify', 'custom'];

export const investigationStateService = {
  getState(caseId, userId) {
    const key = STORAGE_KEYS.investigationState(caseId, userId);
    const stored = readStorage(key);
    if (stored) {
      // Back-fill findings array for states saved before Sprint 12
      return { findings: [], ...stored };
    }
    return {
      caseId,
      userId,
      notes: [],
      pinnedEvidence: [],
      viewedSourceIds: [],
      toolState: {},
      findings: [],
      lastUpdatedAt: now(),
    };
  },

  _save(caseId, userId, state) {
    const key = STORAGE_KEYS.investigationState(caseId, userId);
    const next = { ...state, lastUpdatedAt: now() };
    writeStorage(key, next);
    return next;
  },

  addNote(caseId, userId, { category = 'custom', text, sourceId = null, evidenceRef = null }) {
    const state = this.getState(caseId, userId);
    const note = {
      id: uid(),
      caseId,
      category: NOTE_CATEGORIES.includes(category) ? category : 'custom',
      text: text.trim(),
      sourceId,
      evidenceRef,
      createdAt: now(),
      updatedAt: now(),
    };
    return this._save(caseId, userId, { ...state, notes: [note, ...state.notes] });
  },

  updateNote(caseId, userId, noteId, text) {
    const state = this.getState(caseId, userId);
    const notes = state.notes.map(n =>
      n.id === noteId ? { ...n, text: text.trim(), updatedAt: now() } : n
    );
    return this._save(caseId, userId, { ...state, notes });
  },

  deleteNote(caseId, userId, noteId) {
    const state = this.getState(caseId, userId);
    return this._save(caseId, userId, {
      ...state,
      notes: state.notes.filter(n => n.id !== noteId),
    });
  },

  pinEvidence(caseId, userId, { sourceId, sourceTitle, excerpt }) {
    const state = this.getState(caseId, userId);
    const alreadyPinned = state.pinnedEvidence.some(e => e.sourceId === sourceId && e.excerpt === excerpt);
    if (alreadyPinned) return state;
    const pin = { id: uid(), sourceId, sourceTitle, excerpt, pinnedAt: now() };
    return this._save(caseId, userId, {
      ...state,
      pinnedEvidence: [pin, ...state.pinnedEvidence],
    });
  },

  unpinEvidence(caseId, userId, evidenceId) {
    const state = this.getState(caseId, userId);
    return this._save(caseId, userId, {
      ...state,
      pinnedEvidence: state.pinnedEvidence.filter(e => e.id !== evidenceId),
    });
  },

  markSourceViewed(caseId, userId, sourceId) {
    const state = this.getState(caseId, userId);
    if (state.viewedSourceIds.includes(sourceId)) return state;
    return this._save(caseId, userId, {
      ...state,
      viewedSourceIds: [...state.viewedSourceIds, sourceId],
    });
  },

  saveToolState(caseId, userId, toolState) {
    const state = this.getState(caseId, userId);
    return this._save(caseId, userId, {
      ...state,
      toolState: { ...state.toolState, ...toolState },
    });
  },

  /**
   * Save Investigation Workbench state.
   * Stored under toolState.workbench — separate from legacy excel/sql tool state.
   *
   * @param {string} caseId
   * @param {string} userId
   * @param {object} workbenchState - Partial workbench state to merge
   *   { sourceEvidenceId, sourceSnapshotId, importedAt, cellFormulas, cellValues, selectedCell }
   */
  saveWorkbenchState(caseId, userId, workbenchState) {
    const state = this.getState(caseId, userId);
    const existing = state.toolState?.workbench || {};
    return this._save(caseId, userId, {
      ...state,
      toolState: {
        ...state.toolState,
        workbench: { ...existing, ...workbenchState },
      },
    });
  },

  /**
   * Record an investigation finding derived from the Workbench.
   * Findings are distinct from notebook notes — they represent derived conclusions
   * that can optionally feed into the Investigation Report.
   *
   * Semantics: a Finding is a verified observation, not an accusation.
   * "unauthorized_excess = 4210" is a finding. "stolen" is an interpretation.
   *
   * @param {string} caseId
   * @param {string} userId
   * @param {object} finding
   *   { phaseId, claim, value, sourceEvidenceId, investigationContext }
   */
  recordFinding(caseId, userId, { phaseId, claim, value, sourceEvidenceId, investigationContext = '' }) {
    const state = this.getState(caseId, userId);
    const finding = {
      findingId: uid(),
      phaseId,
      claim: String(claim).trim(),
      value,
      sourceEvidenceId,
      investigationContext: String(investigationContext).trim(),
      recordedAt: now(),
    };
    return this._save(caseId, userId, {
      ...state,
      findings: [finding, ...(state.findings || [])],
    });
  },

  /**
   * Delete a recorded finding by ID.
   */
  deleteFinding(caseId, userId, findingId) {
    const state = this.getState(caseId, userId);
    return this._save(caseId, userId, {
      ...state,
      findings: (state.findings || []).filter(f => f.findingId !== findingId),
    });
  },

  /**
   * Clear workbench state (called when advancing to a new phase).
   */
  clearWorkbenchState(caseId, userId) {
    const state = this.getState(caseId, userId);
    const toolState = { ...state.toolState };
    delete toolState.workbench;
    return this._save(caseId, userId, { ...state, toolState });
  },
};

// ── DOMAIN 3: Report State ────────────────────────────────────────────────────

export const reportStateService = {
  getDraft(caseId, phaseId, userId) {
    const key = STORAGE_KEYS.reportDraft(caseId, phaseId, userId);
    return readStorage(key);
  },

  /**
   * Initialize a draft from a ReportDefinition.
   * Pre-filled fields are already set; editable fields are empty.
   */
  initDraft(caseId, phaseId, userId, reportDefinition) {
    const existing = this.getDraft(caseId, phaseId, userId);
    if (existing && existing.status === 'DRAFT') return existing;

    const fields = {};
    for (const field of reportDefinition.fields) {
      fields[field.field_id] = {
        field_id: field.field_id,
        value: field.prefilled ? (field.prefilled_value ?? '') : '',
        isLocked: !field.editable,
        verificationStatus: null,
        errorMessage: null,
      };
    }

    const draft = {
      reportId: uid(),
      caseId,
      phaseId,
      userId,
      status: 'DRAFT',
      fields,
      attachments: [],
      verificationResult: null,
      createdAt: now(),
      updatedAt: now(),
      submittedAt: null,
    };

    writeStorage(STORAGE_KEYS.reportDraft(caseId, phaseId, userId), draft);
    return draft;
  },

  updateField(caseId, phaseId, userId, fieldId, value) {
    const draft = this.getDraft(caseId, phaseId, userId);
    if (!draft || draft.fields[fieldId]?.isLocked) return draft;

    const updatedFields = {
      ...draft.fields,
      [fieldId]: {
        ...draft.fields[fieldId],
        value,
        verificationStatus: null,
        errorMessage: null,
      },
    };

    // Recalculate status
    const allRequiredFilled = Object.values(updatedFields)
      .filter(f => !f.isLocked)
      .every(f => f.value && f.value.trim().length > 0);

    const next = {
      ...draft,
      fields: updatedFields,
      status: allRequiredFilled ? 'READY' : 'DRAFT',
      updatedAt: now(),
    };

    writeStorage(STORAGE_KEYS.reportDraft(caseId, phaseId, userId), next);
    return next;
  },

  markSubmitted(caseId, phaseId, userId) {
    const draft = this.getDraft(caseId, phaseId, userId);
    if (!draft) return null;
    const next = { ...draft, status: 'SUBMITTED', submittedAt: now() };
    writeStorage(STORAGE_KEYS.reportDraft(caseId, phaseId, userId), next);
    return next;
  },

  applyVerificationResult(caseId, phaseId, userId, result) {
    const draft = this.getDraft(caseId, phaseId, userId);
    if (!draft) return null;

    const updatedFields = { ...draft.fields };
    for (const fieldResult of result.fieldResults) {
      if (updatedFields[fieldResult.field_id]) {
        updatedFields[fieldResult.field_id] = {
          ...updatedFields[fieldResult.field_id],
          verificationStatus: fieldResult.status,
          errorMessage: fieldResult.message,
        };
      }
    }

    const next = {
      ...draft,
      fields: updatedFields,
      status: result.overall === 'ACCEPTED' ? 'ACCEPTED' : 'RETURNED',
      verificationResult: result,
      updatedAt: now(),
    };
    writeStorage(STORAGE_KEYS.reportDraft(caseId, phaseId, userId), next);
    return next;
  },

  clearDraft(caseId, phaseId, userId) {
    localStorage.removeItem(STORAGE_KEYS.reportDraft(caseId, phaseId, userId));
  },
};

// ── Verification Engine (Sprint 1 prototype) ───────────────────────────────────

export const verificationEngine = {
  /**
   * Verify a submitted report against the case's verification rules.
   * Returns a VerificationResult.
   */
  verify(reportDraft, verificationRules) {
    const fieldResults = [];
    let allCorrect = true;

    // Only verify editable (non-pre-filled) fields that have rules
    for (const rule of verificationRules.rules) {
      const fieldValue = reportDraft.fields[rule.field_id];
      if (!fieldValue) continue;

      const submitted = String(fieldValue.value ?? '').trim();
      const expected = String(rule.expected ?? '').trim();

      let isCorrect = false;
      if (rule.strategy === 'case_insensitive') {
        // Normalize Vietnamese characters via trim + lowercase
        isCorrect = submitted.toLowerCase().trim() === expected.toLowerCase().trim();
      } else if (rule.strategy === 'exact') {
        isCorrect = submitted === expected;
      } else if (rule.strategy === 'numeric_exact') {
        // Strip formatting (commas, spaces, units) then compare numerically
        const numericSubmitted = parseFloat(String(submitted).replace(/[^\d.-]/g, ''));
        isCorrect = !isNaN(numericSubmitted) && numericSubmitted === Number(rule.expected);
      } else if (rule.strategy === 'numeric_tolerance') {
        const num = parseFloat(submitted);
        const exp = parseFloat(expected);
        isCorrect = !isNaN(num) && Math.abs(num - exp) <= (rule.tolerance ?? 0.01);
      }

      if (!isCorrect) allCorrect = false;

      fieldResults.push({
        field_id: rule.field_id,
        label: fieldValue.field_id,
        status: isCorrect ? 'correct' : 'incorrect',
        submittedValue: submitted,
        // Use rule-specific error message if provided, fall back to generic
        message: isCorrect ? null : (rule.errorMessage || 'Does not match available evidence.'),
      });
    }

    // Pre-filled fields are marked as confirmed without checking
    for (const [field_id, fieldValue] of Object.entries(reportDraft.fields)) {
      if (fieldValue.isLocked && !fieldResults.find(r => r.field_id === field_id)) {
        fieldResults.push({
          field_id,
          label: field_id,
          status: 'prefilled',
          submittedValue: fieldValue.value,
          message: null,
        });
      }
    }

    const overall = allCorrect ? 'ACCEPTED' : 'RETURNED';
    const progression = overall === 'ACCEPTED' ? verificationRules.onAccepted : verificationRules.onReturned;

    return {
      reportId: reportDraft.reportId,
      caseId: reportDraft.caseId,
      phaseId: reportDraft.phaseId,
      overall,
      fieldResults,
      hqMessage: progression.hqMessage,
      newLeadText: progression.newLeadText || null,
      newLeadSourceId: (overall === 'ACCEPTED' ? progression.newLeadSourceId : null) || null,
      newLeadTitle: (overall === 'ACCEPTED' ? progression.newLeadTitle : null) || null,
      caseSummary: (overall === 'ACCEPTED' && progression.caseSummary) ? progression.caseSummary : null,
      nextPhaseId: overall === 'ACCEPTED' ? (progression.targetPhaseId || null) : null,
      verifiedAt: now(),
    };
  },
};
