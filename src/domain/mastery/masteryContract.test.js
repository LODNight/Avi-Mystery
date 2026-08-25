import { describe, it, expect } from 'vitest'
import {
  createLearnerMasteryKey,
  createInitialMastery,
  evaluateSkillMastery,
} from './masteryEvaluator.js'

describe('Step 5.8 — Mastery Domain Core & Contract Tests', () => {
  it('creates composite skill mastery lookup keys in learnerId:skillId format', () => {
    const key = createLearnerMasteryKey('learner-001', 'excel-sum')
    expect(key).toBe('learner-001:excel-sum')
  })

  it('throws validation error if learnerId or skillId is missing from key generation', () => {
    expect(() => createLearnerMasteryKey('', 'excel-sum')).toThrow()
    expect(() => createLearnerMasteryKey('learner-001', '')).toThrow()
  })

  it('initializes a default zero-proficiency mastery record for unassessed skills', () => {
    const initial = createInitialMastery({ learnerId: 'learner-001', skillId: 'sql-select' })
    expect(initial).toEqual({
      learnerId: 'learner-001',
      skillId: 'sql-select',
      masteryScore: 0,
      totalAttempts: 0,
      successfulAttempts: 0,
      lastAssessedAt: null,
      history: [],
    })
  })

  it('calculates masteryScore deterministically across multiple attempts without mutating inputs', () => {
    const context = { learnerId: 'learner-001', skillId: 'excel-formula-basic' }

    // Attempt 1: Failed (0%)
    const m1 = evaluateSkillMastery(null, { questionId: 'q-001', isCorrect: false, score: 0 }, context, '2026-08-25T10:00:00Z')
    expect(m1.masteryScore).toBe(0)
    expect(m1.totalAttempts).toBe(1)
    expect(m1.successfulAttempts).toBe(0)
    expect(m1.history).toHaveLength(1)

    // Attempt 2: Correct (1/2 = 50%)
    const m2 = evaluateSkillMastery(m1, { questionId: 'q-001', isCorrect: true, score: 100 }, context, '2026-08-25T10:05:00Z')
    expect(m2.masteryScore).toBe(50)
    expect(m2.totalAttempts).toBe(2)
    expect(m2.successfulAttempts).toBe(1)

    // Attempt 3: Correct (2/3 = 67%)
    const m3 = evaluateSkillMastery(m2, { questionId: 'q-002', isCorrect: true, score: 100 }, context, '2026-08-25T10:10:00Z')
    expect(m3.masteryScore).toBe(67)
    expect(m3.totalAttempts).toBe(3)
    expect(m3.successfulAttempts).toBe(2)

    // Verify immutability of m1, m2
    expect(m1.totalAttempts).toBe(1)
    expect(m2.totalAttempts).toBe(2)
  })

  it('maintains history log capped at 50 assessments', () => {
    const context = { learnerId: 'learner-001', skillId: 'excel-cap' }
    let current = null

    for (let i = 0; i < 60; i++) {
      current = evaluateSkillMastery(
        current,
        { questionId: `q-${i}`, isCorrect: true },
        context
      )
    }

    expect(current.totalAttempts).toBe(60)
    expect(current.history).toHaveLength(50)
    expect(current.history[0].questionId).toBe('q-10')
  })
})
