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
  FORMULA_REQUIRED: 'FORMULA_REQUIRED',
  FORMULA_MISSING_EQUALS: 'FORMULA_MISSING_EQUALS',
  FORMULA_EMPTY_EXPRESSION: 'FORMULA_EMPTY_EXPRESSION',
  FORMULA_UNBALANCED_PARENTHESES: 'FORMULA_UNBALANCED_PARENTHESES',
  FORMULA_UNSUPPORTED_FUNCTION: 'FORMULA_UNSUPPORTED_FUNCTION',
  FORMULA_INVALID_RANGE: 'FORMULA_INVALID_RANGE',
  FORMULA_INVALID_CHARACTER: 'FORMULA_INVALID_CHARACTER',
  FORMULA_INVALID_SYNTAX: 'FORMULA_INVALID_SYNTAX',
  FORMULA_REFERENCE_NOT_FOUND: 'FORMULA_REFERENCE_NOT_FOUND',
  FORMULA_NON_NUMERIC_REFERENCE: 'FORMULA_NON_NUMERIC_REFERENCE',
  FORMULA_DIVISION_BY_ZERO: 'FORMULA_DIVISION_BY_ZERO',
});

/**
 * @typedef {Object} ExcelSubmissionAnswer
 * @property {string} formula
 * @property {Record<string, unknown>} [sheetData]
 */

/**
 * @typedef {Object} SqlSubmissionAnswer
 * @property {string} query
 * @property {Object} [executionResult] Envelope from sqlEngine.execute ({ columns, rows, rowCount, truncated, executionMs, errorCode, message })
 */

/**
 * @typedef {Object} SubmissionRequest
 * @property {'run'|'submit'} mode
 * @property {string} [missionId] Legacy mission ID reference
 * @property {string} [questionId] Canonical question ID reference (e.g. 'q-001')
 * @property {string} [investigationId] Canonical investigation ID reference (e.g. 'inv-001')
 * @property {string} [stepId]
 * @property {'excel'|'sql'} tool
 * @property {ExcelSubmissionAnswer|SqlSubmissionAnswer|unknown} answer
 * @property {number} [hintsUsed]
 * @property {string} clientAttemptId
 */

/**
 * @typedef {Object} SubmissionResult
 * @property {string} attemptId
 * @property {string} [questionId]
 * @property {string} [investigationId]
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
