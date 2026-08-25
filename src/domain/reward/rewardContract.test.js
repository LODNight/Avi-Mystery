import { describe, it, expect } from 'vitest'
import {
  calculateXpReward,
  createXpTransaction,
  applyXpTransaction,
  getBaseXp,
  REWARD_REASONS,
} from './rewardEvaluator.js'

describe('Step 5.7 — Reward Domain Pure Logic Tests', () => {
  const mockQuestion = {
    questionId: 'q-001',
    rewards: { baseXp: 100, hintPenalty: 15 },
  }

  it('calculates full base XP on first completion with zero hints', () => {
    const res = calculateXpReward({
      question: mockQuestion,
      submissionResult: { isCorrect: true, score: 100 },
      isFirstCompletion: true,
      hintsUsed: 0,
    })

    expect(res.xpAwarded).toBe(100)
    expect(res.baseXp).toBe(100)
    expect(res.isFirstCompletion).toBe(true)
    expect(res.reason).toBe(REWARD_REASONS.FIRST_COMPLETION)
  })

  it('deducts hint penalties accurately on first completion', () => {
    const res = calculateXpReward({
      question: mockQuestion,
      submissionResult: { isCorrect: true, score: 100 },
      isFirstCompletion: true,
      hintsUsed: 2, // 2 * 15 = 30 penalty -> 70 XP
    })

    expect(res.xpAwarded).toBe(70)
    expect(res.baseXp).toBe(100)
    expect(res.reason).toBe(REWARD_REASONS.FIRST_COMPLETION)
  })

  it('awards ZERO XP on failed attempt', () => {
    const res = calculateXpReward({
      question: mockQuestion,
      submissionResult: { isCorrect: false, score: 0 },
      isFirstCompletion: true,
    })

    expect(res.xpAwarded).toBe(0)
    expect(res.reason).toBe(REWARD_REASONS.ATTEMPT_FAILED)
  })

  it('awards ZERO XP when question was ALREADY_COMPLETED previously', () => {
    const res = calculateXpReward({
      question: mockQuestion,
      submissionResult: { isCorrect: true, score: 100 },
      isFirstCompletion: false,
    })

    expect(res.xpAwarded).toBe(0)
    expect(res.isFirstCompletion).toBe(false)
    expect(res.reason).toBe(REWARD_REASONS.ALREADY_COMPLETED)
  })

  it('applies transactions idempotently to learner XP ledger', () => {
    const tx1 = createXpTransaction({
      learnerId: 'user-001',
      contentId: 'q-001',
      attemptId: 'att-01',
      xpAmount: 100,
    })

    // Initial application
    const r1 = applyXpTransaction(null, tx1)
    expect(r1.totalXp).toBe(100)
    expect(r1.history).toHaveLength(1)

    // Re-applying same transactionId yields NO additional XP
    const r2 = applyXpTransaction(r1, tx1)
    expect(r2.totalXp).toBe(100)
    expect(r2.history).toHaveLength(1)
  })
})
