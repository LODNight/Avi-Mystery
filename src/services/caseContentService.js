/**
 * caseContentService.js
 *
 * Loads case packages for the Detective Workspace.
 * Sprint 1: Reads from local data files.
 * Future: Reads from API / Firestore.
 *
 * Interface is stable — backing store can change without consumer changes.
 */

import {
  CASE_001,
  REPORT_CASE001_PHASE1,
  REPORT_CASE001_PHASE2,
  VERIFICATION_CASE001_PHASE1,
  VERIFICATION_CASE001_PHASE2,
  HQ_MESSAGES_CASE001,
} from '../data/cases/case001.js';
import i18n from '../i18n.js';
import { caseLocalizationService } from './caseLocalizationService.js';

const CASE_REGISTRY = {
  'case-001': {
    case: CASE_001,
    reports: {
      'phase-1': REPORT_CASE001_PHASE1,
      'phase-2': REPORT_CASE001_PHASE2,
    },
    verification: {
      'phase-1': VERIFICATION_CASE001_PHASE1,
      'phase-2': VERIFICATION_CASE001_PHASE2,
    },
    hqMessages: HQ_MESSAGES_CASE001,
  },
};

export const caseContentService = {
  /**
   * Load a complete case package.
   * @returns {{ data: CasePackage|null, error: string|null }}
   */
  getCase(caseId) {
    const entry = CASE_REGISTRY[caseId];
    if (!entry) {
      return { data: null, error: `Case "${caseId}" not found.` };
    }
    const localizedCase = caseLocalizationService.getLocalizedCase(entry.case, i18n.language);
    return { data: localizedCase, error: null };
  },

  /**
   * Load the report definition for a specific phase.
   */
  getReportDefinition(caseId, phaseId) {
    const entry = CASE_REGISTRY[caseId];
    if (!entry) return { data: null, error: `Case "${caseId}" not found.` };
    const report = entry.reports[phaseId];
    if (!report) return { data: null, error: `Report definition for phase "${phaseId}" not found.` };
    const localizedReport = caseLocalizationService.getLocalizedData(report, i18n.language);
    return { data: localizedReport, error: null };
  },

  /**
   * Load verification rules for a specific phase.
   * These are not exposed to the UI — only to the Verification Engine.
   */
  getVerificationRules(caseId, phaseId) {
    const entry = CASE_REGISTRY[caseId];
    if (!entry) return { data: null, error: `Case "${caseId}" not found.` };
    const rules = entry.verification[phaseId];
    if (!rules) return { data: null, error: `Verification rules for phase "${phaseId}" not found.` };
    const localizedRules = caseLocalizationService.getLocalizedData(rules, i18n.language);
    return { data: localizedRules, error: null };
  },

  /**
   * Load a dataset by ID from within a case.
   */
  getDataset(caseId, datasetId) {
    const entry = CASE_REGISTRY[caseId];
    if (!entry) return { data: null, error: `Case "${caseId}" not found.` };
    const dataset = entry.case.datasets?.[datasetId];
    if (!dataset) return { data: null, error: `Dataset "${datasetId}" not found in case "${caseId}".` };
    const localizedDataset = caseLocalizationService.getLocalizedData(dataset, i18n.language);
    return { data: localizedDataset, error: null };
  },

  /**
   * Get a source by ID from within a case.
   */
  getSource(caseId, sourceId) {
    const entry = CASE_REGISTRY[caseId];
    if (!entry) return { data: null, error: `Case "${caseId}" not found.` };
    const source = entry.case.sources?.find(s => s.id === sourceId);
    if (!source) return { data: null, error: `Source "${sourceId}" not found in case "${caseId}".` };
    const localizedSource = caseLocalizationService.getLocalizedData(source, i18n.language);
    return { data: localizedSource, error: null };
  },

  /**
   * Get the investigation question for a specific phase.
   * Returns { data: InvestigationQuestion|null, error: string|null }
   */
  getInvestigationQuestion(caseId, phaseId) {
    const entry = CASE_REGISTRY[caseId];
    if (!entry) return { data: null, error: `Case "${caseId}" not found.` };
    const phase = entry.case.phases?.find(p => p.id === phaseId);
    if (!phase) return { data: null, error: `Phase "${phaseId}" not found in case "${caseId}".` };
    const localizedQuestion = caseLocalizationService.getLocalizedData(phase.investigationQuestion || null, i18n.language);
    return { data: localizedQuestion, error: null };
  },

  /**
   * Get the clues for a specific phase.
   * Returns { data: Clue[]|null, error: string|null }
   */
  getPhaseClues(caseId, phaseId) {
    const entry = CASE_REGISTRY[caseId];
    if (!entry) return { data: null, error: `Case "${caseId}" not found.` };
    const phase = entry.case.phases?.find(p => p.id === phaseId);
    if (!phase) return { data: null, error: `Phase "${phaseId}" not found in case "${caseId}".` };
    const localizedClues = caseLocalizationService.getLocalizedData(phase.clues || [], i18n.language);
    return { data: localizedClues, error: null };
  },

  /**
   * List all available cases (for a future case selection screen).
   */
  listCases() {
    const cases = Object.values(CASE_REGISTRY).map(entry => {
      const localizedCase = caseLocalizationService.getLocalizedCase(entry.case, i18n.language);
      return {
        id: localizedCase.id,
        title: localizedCase.title,
        caseNumber: localizedCase.caseNumber,
        difficulty: localizedCase.difficulty,
        tool: localizedCase.tool,
        estimatedMinutes: localizedCase.estimatedMinutes,
        status: localizedCase.status,
      };
    });
    return { data: cases, error: null };
  },
};
