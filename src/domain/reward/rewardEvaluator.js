/**
 * XP Reward Domain Evaluator & Pure Calculations (Step 5.7)
 * Handles XP calculations and idempotent ledger transactions.
 */

export const REWARD_REASONS = Object.freeze({
  FIRST_COMPLETION: 'FIRST_COMPLETION',
  ALREADY_COMPLETED: 'ALREADY_COMPLETED',
  ATTEMPT_FAILED: 'ATTEMPT_FAILED',
  INVALID_SUBMISSION: 'INVALID_SUBMISSION',
})

/**
 * Resolves base XP value from a Question object or legacy Mission object.
 *
 * @param {Object} [question]
 * @returns {number} Base XP amount
 */
export function getBaseXp(question) {
  if (!question || typeof question !== 'object') return 50
  if (typeof question.rewards?.baseXp === 'number') return question.rewards.baseXp
  if (typeof question.xp === 'number') return question.xp
  return 50
}

/**
 * Pure calculation function for XP reward based on submission correctness,
 * first completion status, and hint penalties.
 *
 * @param {Object} params
 * @param {Object} [params.question] Question entity or legacy mission config
 * @param {Object} params.submissionResult Result from submissionService
 * @param {boolean} params.isFirstCompletion True if content was not completed previously
 * @param {number} [params.hintsUsed=0] Number of hints unlocked/used
 * @returns {Object} XpRewardCalculationResult
 */
export function calculateXpReward({ question, submissionResult, isFirstCompletion, hintsUsed = 0 }) {
  if (!submissionResult || typeof submissionResult !== 'object') {
    return {
      xpAwarded: 0,
      baseXp: 0,
      isFirstCompletion: Boolean(isFirstCompletion),
      reason: REWARD_REASONS.INVALID_SUBMISSION,
    }
  }

  const isSuccess = Boolean(submissionResult.isCorrect || (typeof submissionResult.score === 'number' && submissionResult.score >= 100))
  const baseXp = getBaseXp(question)

  if (!isSuccess) {
    return {
      xpAwarded: 0,
      baseXp,
      isFirstCompletion: Boolean(isFirstCompletion),
      reason: REWARD_REASONS.ATTEMPT_FAILED,
    }
  }

  if (!isFirstCompletion) {
    return {
      xpAwarded: 0,
      baseXp,
      isFirstCompletion: false,
      reason: REWARD_REASONS.ALREADY_COMPLETED,
    }
  }

  const hintPenalty = question?.rewards?.hintPenalty || 0
  const xpAwarded = Math.max(0, baseXp - Math.max(0, hintsUsed) * hintPenalty)

  return {
    xpAwarded,
    baseXp,
    isFirstCompletion: true,
    reason: REWARD_REASONS.FIRST_COMPLETION,
  }
}

/**
 * Creates an XP ledger transaction object.
 *
 * @param {Object} params
 * @param {string} params.learnerId
 * @param {string} params.contentId
 * @param {string} [params.attemptId]
 * @param {number} params.xpAmount
 * @param {string} [params.reason]
 * @param {string} [timestamp]
 * @returns {Object} LearnerXpTransaction
 */
export function createXpTransaction(
  { learnerId, contentId, attemptId = 'tx-00', xpAmount, reason = REWARD_REASONS.FIRST_COMPLETION },
  timestamp = new Date().toISOString()
) {
  return {
    transactionId: `${learnerId}:${contentId}:${attemptId}`,
    learnerId,
    contentId,
    attemptId,
    xpAmount: Math.max(0, xpAmount),
    reason,
    awardedAt: timestamp,
  }
}

/**
 * Pure calculation function to apply an XP transaction to a learner's XP record.
 * Guarantees idempotency by preventing duplicate transactions.
 *
 * @param {Object|null} currentXpRecord Current LearnerXpRecord
 * @param {Object} transaction LearnerXpTransaction
 * @returns {Object} Updated LearnerXpRecord
 */
export function applyXpTransaction(currentXpRecord, transaction) {
  const learnerId = currentXpRecord?.learnerId || transaction?.learnerId
  const totalXp = currentXpRecord?.totalXp || 0
  const history = Array.isArray(currentXpRecord?.history) ? [...currentXpRecord.history] : []

  if (!transaction || !learnerId) {
    return { learnerId: learnerId || 'unknown', totalXp, history }
  }

  // Idempotency check: verify transactionId or existing positive XP award for contentId
  const exists = history.some((tx) => tx.transactionId === transaction.transactionId)
  if (exists) {
    return { learnerId, totalXp, history }
  }

  if (transaction.xpAmount > 0) {
    history.push(transaction)
    return {
      learnerId,
      totalXp: totalXp + transaction.xpAmount,
      history,
    }
  }

  // Log 0-XP transactions (e.g. ALREADY_COMPLETED) in history without changing totalXp
  history.push(transaction)
  return {
    learnerId,
    totalXp,
    history,
  }
}
