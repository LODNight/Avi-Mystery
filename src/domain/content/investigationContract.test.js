import { describe, it, expect } from 'vitest'
import { investigationService, contentService, missionService } from '../../services/index.js'
import { mapMissionToInvestigation } from './investigationAdapter.js'
import { getInvestigationIdentity } from './contentIdentity.js'

describe('Step 5.3 — Investigation Domain Contract & Mapping Tests', () => {
  it('verifies investigationService gateway is exported and functioning', async () => {
    expect(investigationService).toBeDefined()
    expect(typeof investigationService.getInvestigation).toBe('function')
    expect(typeof investigationService.getInvestigationsByChapter).toBe('function')

    const res = await investigationService.getInvestigation('inv-001')
    expect(res.error).toBeNull()
    expect(res.data.investigationId).toBe('inv-001')
  })

  it('verifies mapMissionToInvestigation adapter maps legacy Mission accurately', () => {
    const rawMission = {
      id: 'mission-001',
      chapterId: 'ch-001',
      datasetId: 'ds-001',
      title: 'Vụ Án Doanh Thu Mất Tích',
      story: 'Bối cảnh vụ án...',
      objective: 'Tính tổng doanh thu',
      orderIndex: 1,
      status: 'published',
      tool: 'excel',
      difficulty: 'beginner',
    }
    const identity = getInvestigationIdentity('mission-001')
    const inv = mapMissionToInvestigation(rawMission, identity)

    expect(inv.investigationId).toBe('inv-001')
    expect(inv.chapterId).toBe('ch-001')
    expect(inv.datasetId).toBe('ds-001')
    expect(inv.title).toBe('Vụ Án Doanh Thu Mất Tích')
    expect(inv.narrative).toBe('Bối cảnh vụ án...')
    expect(inv.story).toBe('Bối cảnh vụ án...')
    expect(inv.objective).toBe('Tính tổng doanh thu')
    expect(inv.ordering).toBe(1)
    expect(inv.status).toBe('published')
    expect(inv.questionIds).toEqual(['q-001'])
    expect(inv.legacyMissionId).toBe('mission-001')
    expect(inv.metadata.tool).toBe('excel')
  })

  it('verifies Chapter -> Investigation -> Question -> Dataset reference chain', async () => {
    const invRes = await investigationService.getInvestigation('inv-001')
    expect(invRes.error).toBeNull()
    const inv = invRes.data

    // 1. Chapter reference
    const chRes = await contentService.getChapter(inv.chapterId)
    expect(chRes.error).toBeNull()
    expect(chRes.data.investigationIds).toContain('inv-001')

    // 2. Dataset reference
    const dsRes = await contentService.getDataset(inv.datasetId)
    expect(dsRes.error).toBeNull()
    expect(dsRes.data.datasetId).toBe(inv.datasetId)

    // 3. Question reference
    expect(inv.questionIds.length).toBeGreaterThan(0)
    const qRes = await contentService.getQuestion(inv.questionIds[0])
    expect(qRes.error).toBeNull()
    expect(qRes.data.investigationId).toBe(inv.investigationId)
  })

  it('verifies contentService.getInvestigation delegates to investigationService', async () => {
    const contentRes = await contentService.getInvestigation('inv-010')
    const invRes = await investigationService.getInvestigation('inv-010')

    expect(contentRes.error).toBeNull()
    expect(contentRes.data).toEqual(invRes.data)
  })

  it('ensures legacy missionService remains 100% operational', async () => {
    const legacyRes = await missionService.getMission('mission-001')
    expect(legacyRes.error).toBeNull()
    expect(legacyRes.data.id).toBe('mission-001')
    expect(legacyRes.data.chapterId).toBe('ch-001')
  })
})
