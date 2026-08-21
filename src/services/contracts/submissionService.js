/**
 * Stable submission contract shared by mock and future API adapters.
 * UI imports the selected adapter from src/services/index.js only.
 */

export const SUBMISSION_MODES = Object.freeze({
  RUN: 'run',
  SUBMIT: 'submit',
});

export const SUBMISSION_TOOLS = Object.freeze({
  EXCEL: 'excel',
  SQL: 'sql',
});

export const SUBMISSION_ERROR_CODES = Object.freeze({
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSION_NOT_FOUND: 'MISSION_NOT_FOUND',
  CONTENT_CONFIG_MISSING: 'CONTENT_CONFIG_MISSING',
  UNSUPPORTED_TOOL: 'UNSUPPORTED_TOOL',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
  DUPLICATE_ATTEMPT: 'DUPLICATE_ATTEMPT',
});

export const SUBMISSION_FEEDBACK_CODES = Object.freeze({
  CORRECT_ANSWER: 'CORRECT_ANSWER',
  INCORRECT_ANSWER: 'INCORRECT_ANSWER',
  RUN_CORRECT: 'RUN_CORRECT',
  RUN_INCORRECT: 'RUN_INCORRECT',
});

/**
 * @typedef {Object} ExcelSubmissionAnswer
 * @property {string} formula
 * @property {Record<string, unknown>} [sheetData]
 */

/**
 * @typedef {Object} SubmissionRequest
 * @property {'run'|'submit'} mode
 * @property {string} missionId
 * @property {string} [stepId]
 * @property {'excel'|'sql'} tool
 * @property {ExcelSubmissionAnswer|unknown} answer
 * @property {number} [hintsUsed]
 * @property {string} clientAttemptId
 */

/**
 * @typedef {Object} SubmissionResult
 * @property {string} attemptId
 * @property {boolean} isCorrect
 * @property {number} score
 * @property {boolean} stepCompleted
 * @property {boolean} missionCompleted
 * @property {number} potentialXp Reward preview only; not awarded by Submission.
 * @property {string} feedbackCode
 * @property {string} feedback
 */

/**
 * @typedef {Object} SubmissionError
 * @property {string} code
 * @property {string} message
 * @property {boolean} retryable
 */

/**
 * Interface specification. Adapters implement these methods; components never
 * invoke this object directly.
 */
export const submissionServiceContract = Object.freeze({
  async submit(_request) {
    throw new Error('submissionService.submit not implemented');
  },

  async getSubmissionHistory(_userId) {
    throw new Error('submissionService.getSubmissionHistory not implemented');
  },
});
