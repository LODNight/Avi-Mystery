import { describe, it, expect } from 'vitest'
import {
  MASTERY_LEVELS,
  getSkillMasteryLevel,
  calculateOverallMastery,
  createLearnerMasteryKey,
  createInitialMastery,
  evaluateSkillMastery,
} from './masteryEvaluator.js'

describe('masteryEvaluator Domain Module', () => {
  it('generates correct composite lookup key', () => {
    const key = createLearnerMasteryKey('user-001', 'excel_formula')
    expect(key).toBe('user-001:excel_formula')
  })

  it('throws error for missing learnerId or skillId in key generation', () => {
    expect(() => createLearnerMasteryKey('', 'excel_formula')).toThrow('learnerId must be a valid non-empty string.')
    expect(() => createLearnerMasteryKey('user-001', '')).toThrow('skillId must be a valid non-empty string.')
  })

  it('creates blank initial mastery record', () => {
    const initial = createInitialMastery({ learnerId: 'u1', skillId: 's1' })
    expect(initial).toEqual({
      learnerId: 'u1',
      skillId: 's1',
      masteryScore: 0,
      totalAttempts: 0,
      successfulAttempts: 0,
      lastAssessedAt: null,
      history: [],
    })
  })

  it('returns correct Mastery Level for score thresholds', () => {
    expect(getSkillMasteryLevel(0)).toEqual(MASTERY_LEVELS.NOVICE)
    expect(getSkillMasteryLevel(25)).toEqual(MASTERY_LEVELS.NOVICE)
    expect(getSkillMasteryLevel(30)).toEqual(MASTERY_LEVELS.APPRENTICE)
    expect(getSkillMasteryLevel(69)).toEqual(MASTERY_LEVELS.APPRENTICE)
    expect(getSkillMasteryLevel(70)).toEqual(MASTERY_LEVELS.ADVANCED)
    expect(getSkillMasteryLevel(89)).toEqual(MASTERY_LEVELS.ADVANCED)
    expect(getSkillMasteryLevel(90)).toEqual(MASTERY_LEVELS.MASTER)
    expect(getSkillMasteryLevel(100)).toEqual(MASTERY_LEVELS.MASTER)
  })

  it('evaluates skill mastery correctly for multiple assessments', () => {
    const timestamp = '2026-08-25T12:00:00.000Z'
    let record = evaluateSkillMastery(
      null,
      { questionId: 'q1', isCorrect: true },
      { learnerId: 'u1', skillId: 's1' },
      timestamp
    )
    expect(record.masteryScore).toBe(100)
    expect(record.totalAttempts).toBe(1)
    expect(record.successfulAttempts).toBe(1)

    record = evaluateSkillMastery(
      record,
      { questionId: 'q2', isCorrect: false },
      { learnerId: 'u1', skillId: 's1' },
      timestamp
    )
    expect(record.masteryScore).toBe(50) // 1 out of 2 = 50%
    expect(record.totalAttempts).toBe(2)
    expect(record.successfulAttempts).toBe(1)
    expect(record.history.length).toBe(2)
  })

  it('calculates aggregate overall mastery statistics', () => {
    const records = [
      { skillId: 's1', masteryScore: 100 },
      { skillId: 's2', masteryScore: 50 },
      { skillId: 's3', masteryScore: 80 },
    ]
    const summary = calculateOverallMastery(records)
    expect(summary.totalSkills).toBe(3)
    expect(summary.averageScore).toBe(77) // (100+50+80)/3 = 76.66 -> 77
    expect(summary.masteredSkills).toBe(2) // 100 & 80 >= 70
    expect(summary.overallLevel).toEqual(MASTERY_LEVELS.ADVANCED)
  })
})
