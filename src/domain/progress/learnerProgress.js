/**
 * Learner Progress Domain Model & Pure Calculations
 * Manages learner state independently from static content definitions.
 */

export const PROGRESS_STATUS = Object.freeze({
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
})

export const CONTENT_TYPES = Object.freeze({
  QUESTION: 'question',
  INVESTIGATION: 'investigation',
  CHAPTER: 'chapter',
  COURSE: 'course',
})

/**
 * Generates a composite progress lookup key.
 *
 * @param {string} learnerId
 * @param {string} contentId
 * @returns {string} Composite key in format `${learnerId}:${contentId}`
 */
export function createLearnerProgressKey(learnerId, contentId) {
  if (!learnerId || typeof learnerId !== 'string') {
    throw new Error('learnerId must be a valid non-empty string.')
  }
  if (!contentId || typeof contentId !== 'string') {
    throw new Error('contentId must be a valid non-empty string.')
  }
  return `${learnerId}:${contentId}`
}

/**
 * Creates a blank initial LearnerProgressRecord.
 *
 * @param {Object} params
 * @param {string} params.learnerId
 * @param {string} params.contentId
 * @param {string} [params.contentType]
 * @returns {Object} Fresh LearnerProgressRecord
 */
export function createInitialProgress({ learnerId, contentId, contentType = CONTENT_TYPES.QUESTION }) {
  return {
    learnerId,
    contentId,
    contentType,
    status: PROGRESS_STATUS.NOT_STARTED,
    attempts: 0,
    bestScore: 0,
    lastAttemptAt: null,
    completedAt: null,
  }
}

/**
 * Pure calculation function to record an attempt against a learner progress record.
 * Returns a NEW LearnerProgressRecord instance without mutating input parameters.
 *
 * @param {Object|null} currentProgress Current progress record (or null for first attempt)
 * @param {Object} attemptResult
 * @param {boolean} attemptResult.isCorrect Whether attempt was successful
 * @param {number} [attemptResult.score] Score achieved (0..100)
 * @param {Object} [context]
 * @param {string} [context.learnerId]
 * @param {string} [context.contentId]
 * @param {string} [context.contentType]
 * @param {string} [timestamp] ISO timestamp string
 * @returns {Object} Updated LearnerProgressRecord
 */
export function recordAttemptProgress(
  currentProgress,
  attemptResult = {},
  context = {},
  timestamp = new Date().toISOString()
) {
  const learnerId = currentProgress?.learnerId || context.learnerId
  const contentId = currentProgress?.contentId || context.contentId
  const contentType = currentProgress?.contentType || context.contentType || CONTENT_TYPES.QUESTION

  if (!learnerId || !contentId) {
    throw new Error('learnerId and contentId are required to record progress.')
  }

  const prevAttempts = currentProgress?.attempts || 0
  const prevBestScore = currentProgress?.bestScore || 0
  const prevStatus = currentProgress?.status || PROGRESS_STATUS.NOT_STARTED
  const prevCompletedAt = currentProgress?.completedAt || null

  const isSuccess = Boolean(attemptResult.isCorrect || (typeof attemptResult.score === 'number' && attemptResult.score >= 100))
  const newScore = Math.max(0, typeof attemptResult.score === 'number' ? attemptResult.score : (isSuccess ? 100 : 0))
  const bestScore = Math.max(prevBestScore, newScore)

  let status = prevStatus
  let completedAt = prevCompletedAt

  if (isSuccess) {
    status = PROGRESS_STATUS.COMPLETED
    if (!completedAt) {
      completedAt = timestamp
    }
  } else if (prevStatus !== PROGRESS_STATUS.COMPLETED) {
    status = PROGRESS_STATUS.IN_PROGRESS
  }

  return {
    learnerId,
    contentId,
    contentType,
    status,
    attempts: prevAttempts + 1,
    bestScore,
    lastAttemptAt: timestamp,
    completedAt,
  }
}
