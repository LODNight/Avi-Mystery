import { describe, it, expect } from 'vitest'
import { mockQuestionService } from './mockQuestionService.js'

describe('mockQuestionService Unit Tests', () => {
  it('fetches a Question by qId', async () => {
    const res = await mockQuestionService.getQuestion('q-001')
    expect(res.error).toBeNull()
    expect(res.data).toBeDefined()
    expect(res.data.questionId).toBe('q-001')
    expect(res.data.id).toBe('q-001')
    expect(res.data.investigationId).toBe('inv-001')
    expect(res.data.datasetId).toBe('ds-001')
    expect(res.data.type).toBe('excel_formula')
    expect(res.data.prompt).toBeDefined()
    expect(res.data.checkerConfig).toBeDefined()
    expect(Array.isArray(res.data.hints)).toBe(true)
    expect(typeof res.data.rewards.baseXp).toBe('number')
    expect(res.data.legacyMissionId).toBe('mission-001')
  })

  it('fetches a Question by legacy missionId', async () => {
    const res = await mockQuestionService.getQuestion('mission-010')
    expect(res.error).toBeNull()
    expect(res.data.questionId).toBe('q-010')
    expect(res.data.investigationId).toBe('inv-010')
    expect(res.data.datasetId).toBe('sql-sales-v1')
    expect(res.data.type).toBe('sql_query')
  })

  it('returns error for unknown questionId', async () => {
    const res = await mockQuestionService.getQuestion('q-unknown')
    expect(res.data).toBeNull()
    expect(res.error).toContain('Không tìm thấy Question "q-unknown"')
  })

  it('returns all questions for an investigation via getQuestionsByInvestigation', async () => {
    const res = await mockQuestionService.getQuestionsByInvestigation('inv-001')
    expect(res.error).toBeNull()
    expect(Array.isArray(res.data)).toBe(true)
    expect(res.data.length).toBeGreaterThan(0)
    expect(res.data.every((q) => q.investigationId === 'inv-001')).toBe(true)
  })

  it('validates Question structure using validateQuestion', () => {
    const validQuestion = {
      questionId: 'q-test',
      investigationId: 'inv-001',
      datasetId: 'ds-001',
      skillId: 'skill-excel-sum',
      difficulty: 'beginner',
      type: 'excel_formula',
      prompt: 'Test prompt',
      checkerConfig: { targetCell: 'D10', expectedResult: 100 },
      starterContent: { initialFormula: '' },
      hints: [],
      rewards: { baseXp: 100 },
    }
    expect(mockQuestionService.validateQuestion(validQuestion).valid).toBe(true)

    const invalidQuestion = {
      questionId: '',
      investigationId: null,
      datasetId: null,
      prompt: '',
      type: '',
      checkerConfig: null,
      rewards: {},
    }
    const validation = mockQuestionService.validateQuestion(invalidQuestion)
    expect(validation.valid).toBe(false)
    expect(validation.errors.length).toBeGreaterThan(0)
  })
})
