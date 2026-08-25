/**
 * Learner Mastery Domain Model & Pure Evaluation Logic (Step 5.8)
 * Manages skill-level proficiency calculations independently from content completion.
 */

/**
 * Generates a composite skill mastery lookup key.
 *
 * @param {string} learnerId
 * @param {string} skillId
 * @returns {string} Composite key in format `${learnerId}:${skillId}`
 */
export function createLearnerMasteryKey(learnerId, skillId) {
  if (!learnerId || typeof learnerId !== 'string') {
    throw new Error('learnerId must be a valid non-empty string.')
  }
  if (!skillId || typeof skillId !== 'string') {
    throw new Error('skillId must be a valid non-empty string.')
  }
  return `${learnerId}:${skillId}`
}

/**
 * Creates a blank initial LearnerMasteryRecord for a given skill.
 *
 * @param {Object} params
 * @param {string} params.learnerId
 * @param {string} params.skillId
 * @returns {Object} Fresh LearnerMasteryRecord
 */
export function createInitialMastery({ learnerId, skillId }) {
  return {
    learnerId,
    skillId,
    masteryScore: 0,
    totalAttempts: 0,
    successfulAttempts: 0,
    lastAssessedAt: null,
    history: [],
  }
}

/**
 * Pure calculation function to evaluate skill mastery upon assessment.
 * Returns a NEW LearnerMasteryRecord instance without mutating input parameters.
 *
 * @param {Object|null} currentMastery Current LearnerMasteryRecord (or null)
 * @param {Object} assessment Assessment data
 * @param {string} assessment.questionId Target question ID
 * @param {boolean} assessment.isCorrect Whether assessment was successful
 * @param {number} [assessment.score=0] Score achieved (0..100)
 * @param {Object} [context] Context object
 * @param {string} [context.learnerId]
 * @param {string} [context.skillId]
 * @param {string} [timestamp] ISO timestamp string
 * @returns {Object} Updated LearnerMasteryRecord
 */
export function evaluateSkillMastery(
  currentMastery,
  assessment = {},
  context = {},
  timestamp = new Date().toISOString()
) {
  const learnerId = currentMastery?.learnerId || context.learnerId
  const skillId = currentMastery?.skillId || context.skillId

  if (!learnerId || !skillId) {
    throw new Error('learnerId and skillId are required to evaluate skill mastery.')
  }

  const prevTotal = currentMastery?.totalAttempts || 0
  const prevSuccess = currentMastery?.successfulAttempts || 0
  const prevHistory = Array.isArray(currentMastery?.history) ? [...currentMastery.history] : []

  const isCorrect = Boolean(assessment.isCorrect || (typeof assessment.score === 'number' && assessment.score >= 100))
  const score = typeof assessment.score === 'number' ? Math.max(0, Math.min(100, assessment.score)) : (isCorrect ? 100 : 0)

  const totalAttempts = prevTotal + 1
  const successfulAttempts = prevSuccess + (isCorrect ? 1 : 0)

  // Simple deterministic proficiency percentage (0 to 100)
  const masteryScore = Math.round((successfulAttempts / totalAttempts) * 100)

  const assessmentItem = {
    questionId: assessment.questionId || 'unknown-question',
    isCorrect,
    score,
    assessedAt: timestamp,
  }

  // Cap history log at last 50 items
  const history = [...prevHistory, assessmentItem].slice(-50)

  return {
    learnerId,
    skillId,
    masteryScore,
    totalAttempts,
    successfulAttempts,
    lastAssessedAt: timestamp,
    history,
  }
}
