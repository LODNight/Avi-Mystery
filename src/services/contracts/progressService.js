/**
 * Progress, Reward & Mastery Service Interface & Typedef Definitions (Step 5.6 - 5.8)
 */

/**
 * @typedef {Object} LearnerProgressRecord
 * @property {string} learnerId
 * @property {string} contentId
 * @property {'question'|'investigation'|'chapter'|'course'} contentType
 * @property {'not_started'|'in_progress'|'completed'|'failed'} status
 * @property {number} attempts
 * @property {number} bestScore
 * @property {string|null} lastAttemptAt
 * @property {string|null} completedAt
 */

/**
 * @typedef {Object} SkillAssessmentItem
 * @property {string} questionId
 * @property {boolean} isCorrect
 * @property {number} score
 * @property {string} assessedAt
 */

/**
 * @typedef {Object} LearnerMasteryRecord
 * @property {string} learnerId
 * @property {string} skillId
 * @property {number} masteryScore
 * @property {number} totalAttempts
 * @property {number} successfulAttempts
 * @property {string|null} lastAssessedAt
 * @property {SkillAssessmentItem[]} history
 */

/**
 * @typedef {Object} RecordAttemptRequest
 * @property {string} learnerId
 * @property {string} contentId
 * @property {'question'|'investigation'|'chapter'|'course'} [contentType]
 * @property {boolean} isCorrect
 * @property {number} [score]
 * @property {string} [timestamp]
 */

/**
 * @typedef {Object} AwardXpRequest
 * @property {string} learnerId
 * @property {string} contentId
 * @property {'question'|'investigation'|'chapter'|'course'} [contentType]
 * @property {Object} submissionResult
 * @property {Object} [question]
 * @property {number} [hintsUsed]
 */

/**
 * @typedef {Object} AwardXpResult
 * @property {LearnerProgressRecord} progress
 * @property {number} xpAwarded
 * @property {number} totalXp
 * @property {boolean} isFirstCompletion
 * @property {string} reason
 */

/**
 * @typedef {Object} RecordMasteryAssessmentRequest
 * @property {string} learnerId
 * @property {string} skillId
 * @property {string} questionId
 * @property {boolean} isCorrect
 * @property {number} [score]
 * @property {string} [timestamp]
 */

/**
 * @typedef {Object} LearnerXpTransaction
 * @property {string} transactionId
 * @property {string} learnerId
 * @property {string} contentId
 * @property {string} attemptId
 * @property {number} xpAmount
 * @property {string} reason
 * @property {string} awardedAt
 */

/**
 * @typedef {Object} LearnerXpRecord
 * @property {string} learnerId
 * @property {number} totalXp
 * @property {LearnerXpTransaction[]} history
 */

export const PROGRESS_ERROR_CODES = Object.freeze({
  VALIDATION_ERROR: 'PROGRESS_VALIDATION_ERROR',
  NOT_FOUND: 'PROGRESS_NOT_FOUND',
  INVALID_KEY: 'PROGRESS_INVALID_KEY',
})

/**
 * Interface specification for Progress Service implementations.
 *
 * @typedef {Object} ProgressServiceContract
 * @property {(learnerId: string, contentId: string) => Promise<{data: LearnerProgressRecord|null, error: Object|null}>} getProgress
 * @property {(learnerId: string, contentType?: string) => Promise<{data: LearnerProgressRecord[], error: Object|null}>} listProgress
 * @property {(request: RecordAttemptRequest) => Promise<{data: LearnerProgressRecord|null, error: Object|null}>} recordAttempt
 * @property {(request: AwardXpRequest) => Promise<{data: AwardXpResult|null, error: Object|null}>} awardXp
 * @property {(learnerId: string) => Promise<{data: LearnerXpRecord|null, error: Object|null}>} getLearnerXp
 * @property {(learnerId: string, skillId: string) => Promise<{data: LearnerMasteryRecord|null, error: Object|null}>} getSkillMastery
 * @property {(learnerId: string) => Promise<{data: LearnerMasteryRecord[], error: Object|null}>} listSkillMastery
 * @property {(request: RecordMasteryAssessmentRequest) => Promise<{data: LearnerMasteryRecord|null, error: Object|null}>} recordMasteryAssessment
 * @property {(record: LearnerProgressRecord) => {valid: boolean, errors: string[]}} validateProgress
 */
