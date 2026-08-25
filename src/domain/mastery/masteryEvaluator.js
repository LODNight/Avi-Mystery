/**
 * Learner Mastery Domain Model & Pure Evaluation Logic (Step 5.8 & 6.3)
 * Manages skill-level proficiency calculations independently from content completion.
 */

export const MASTERY_LEVELS = Object.freeze({
  NOVICE: {
    key: 'novice',
    name: 'Tập sự',
    minScore: 0,
    badge: '🌱',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    border: 'border-amber-500/30 dark:border-amber-500/40',
  },
  APPRENTICE: {
    key: 'apprentice',
    name: 'Học việc',
    minScore: 30,
    badge: '🔍',
    color: 'text-sky-600 dark:text-sky-300',
    bg: 'bg-sky-500/10 dark:bg-sky-500/20',
    border: 'border-sky-500/30 dark:border-sky-500/40',
  },
  ADVANCED: {
    key: 'advanced',
    name: 'Thành thạo',
    minScore: 70,
    badge: '⭐',
    color: 'text-emerald-600 dark:text-emerald-300',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    border: 'border-emerald-500/30 dark:border-emerald-500/40',
  },
  MASTER: {
    key: 'master',
    name: 'Thám tử Bậc thầy',
    minScore: 90,
    badge: '🏆',
    color: 'text-purple-600 dark:text-purple-300',
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    border: 'border-purple-500/30 dark:border-purple-500/40',
  },
})

/**
 * Returns the Mastery Level metadata object based on a 0-100 mastery score.
 *
 * @param {number} masteryScore Proficiency percentage (0-100)
 * @returns {Object} Mastery Level descriptor
 */
export function getSkillMasteryLevel(masteryScore = 0) {
  const score = typeof masteryScore === 'number' ? Math.max(0, Math.min(100, masteryScore)) : 0
  if (score >= 90) return MASTERY_LEVELS.MASTER
  if (score >= 70) return MASTERY_LEVELS.ADVANCED
  if (score >= 30) return MASTERY_LEVELS.APPRENTICE
  return MASTERY_LEVELS.NOVICE
}

/**
 * Calculates aggregate overall mastery statistics across a list of LearnerMasteryRecord items.
 *
 * @param {Array} [masteryRecords=[]] List of LearnerMasteryRecord
 * @returns {Object} Aggregate mastery summary
 */
export function calculateOverallMastery(masteryRecords = []) {
  if (!Array.isArray(masteryRecords) || masteryRecords.length === 0) {
    return {
      averageScore: 0,
      totalSkills: 0,
      masteredSkills: 0,
      overallLevel: MASTERY_LEVELS.NOVICE,
    }
  }

  const totalScore = masteryRecords.reduce((sum, r) => sum + (r.masteryScore || 0), 0)
  const averageScore = Math.round(totalScore / masteryRecords.length)
  const masteredSkills = masteryRecords.filter(r => (r.masteryScore || 0) >= 70).length
  const overallLevel = getSkillMasteryLevel(averageScore)

  return {
    averageScore,
    totalSkills: masteryRecords.length,
    masteredSkills,
    overallLevel,
  }
}

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
