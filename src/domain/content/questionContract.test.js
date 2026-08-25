import { describe, it, expect } from 'vitest'
import { questionService, investigationService, contentService } from '../../services/index.js'
import { mapMissionToQuestion } from './questionAdapter.js'
import { getQuestionIdentity } from './contentIdentity.js'

describe('Step 5.4 — Question Domain Contract & Mapping Tests', () => {
  it('verifies questionService gateway is exported and functioning', async () => {
    expect(questionService).toBeDefined()
    expect(typeof questionService.getQuestion).toBe('function')
    expect(typeof questionService.getQuestionsByInvestigation).toBe('function')

    const res = await questionService.getQuestion('q-001')
    expect(res.error).toBeNull()
    expect(res.data.questionId).toBe('q-001')
  })

  it('verifies mapMissionToQuestion adapter maps legacy Mission accurately', () => {
    const rawMission = {
      id: 'mission-001',
      chapterId: 'ch-001',
      datasetId: 'ds-001',
      title: 'Vụ Án Doanh Thu Mất Tích',
      task: 'Tính tổng doanh thu cột D',
      hint: 'Dùng hàm SUM',
      targetCell: 'D10',
      expectedResult: 15000,
      initialFormula: '',
      reward: { xp: 100 },
      tool: 'excel',
      difficulty: 'beginner',
    }
    const identity = getQuestionIdentity('mission-001')
    const q = mapMissionToQuestion(rawMission, identity)

    expect(q.questionId).toBe('q-001')
    expect(q.investigationId).toBe('inv-001')
    expect(q.datasetId).toBe('ds-001')
    expect(q.type).toBe('excel_formula')
    expect(q.prompt).toBe('Tính tổng doanh thu cột D')
    expect(q.checkerConfig.targetCell).toBe('D10')
    expect(q.checkerConfig.expectedResult).toBe(15000)
    expect(q.hints.length).toBe(1)
    expect(q.hints[0].text).toBe('Dùng hàm SUM')
    expect(q.rewards.baseXp).toBe(100)
    expect(q.legacyMissionId).toBe('mission-001')
  })

  it('verifies Question is pure content metadata and DOES NOT embed XP execution state', async () => {
    const qRes = await questionService.getQuestion('q-001')
    expect(qRes.error).toBeNull()
    const q = qRes.data

    // Must describe static metadata
    expect(q.rewards).toBeDefined()
    expect(typeof q.rewards.baseXp).toBe('number')

    // Must NOT contain execution or state-mutating functions
    expect(q.awardXp).toBeUndefined()
    expect(q.evaluateAttempt).toBeUndefined()
    expect(q.userStatus).toBeUndefined()
  })

  it('verifies Investigation -> Question -> Dataset reference chain', async () => {
    const qRes = await questionService.getQuestion('q-001')
    expect(qRes.error).toBeNull()
    const q = qRes.data

    // 1. Investigation reference
    const invRes = await investigationService.getInvestigation(q.investigationId)
    expect(invRes.error).toBeNull()
    expect(invRes.data.questionIds).toContain(q.questionId)

    // 2. Dataset reference
    const dsRes = await contentService.getDataset(q.datasetId)
    expect(dsRes.error).toBeNull()
    expect(dsRes.data.datasetId).toBe(q.datasetId)
  })

  it('verifies contentService.getQuestion delegates to questionService', async () => {
    const contentRes = await contentService.getQuestion('q-010')
    const qRes = await questionService.getQuestion('q-010')

    expect(contentRes.error).toBeNull()
    expect(contentRes.data).toEqual(qRes.data)
  })
})
