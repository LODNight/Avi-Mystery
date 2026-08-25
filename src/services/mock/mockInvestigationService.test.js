import { describe, it, expect } from 'vitest'
import { mockInvestigationService } from './mockInvestigationService.js'

describe('mockInvestigationService Unit Tests', () => {
  it('fetches an Investigation by invId', async () => {
    const res = await mockInvestigationService.getInvestigation('inv-001')
    expect(res.error).toBeNull()
    expect(res.data).toBeDefined()
    expect(res.data.investigationId).toBe('inv-001')
    expect(res.data.id).toBe('inv-001')
    expect(res.data.chapterId).toBe('ch-001')
    expect(res.data.datasetId).toBe('ds-001')
    expect(res.data.title).toBeDefined()
    expect(res.data.narrative).toBeDefined()
    expect(res.data.objective).toBeDefined()
    expect(typeof res.data.ordering).toBe('number')
    expect(res.data.status).toBe('published')
    expect(Array.isArray(res.data.questionIds)).toBe(true)
    expect(res.data.legacyMissionId).toBe('mission-001')
  })

  it('fetches an Investigation by legacy missionId', async () => {
    const res = await mockInvestigationService.getInvestigation('mission-010')
    expect(res.error).toBeNull()
    expect(res.data.investigationId).toBe('inv-010')
    expect(res.data.chapterId).toBe('ch-004')
    expect(res.data.datasetId).toBe('sql-sales-v1')
    expect(res.data.metadata.tool).toBe('sql')
  })

  it('returns error for unknown investigationId', async () => {
    const res = await mockInvestigationService.getInvestigation('inv-unknown')
    expect(res.data).toBeNull()
    expect(res.error).toContain('Không tìm thấy Investigation "inv-unknown"')
  })

  it('returns all investigations for a chapter via getInvestigationsByChapter', async () => {
    const res = await mockInvestigationService.getInvestigationsByChapter('ch-001')
    expect(res.error).toBeNull()
    expect(Array.isArray(res.data)).toBe(true)
    expect(res.data.length).toBe(3)
    expect(res.data.every((inv) => inv.chapterId === 'ch-001')).toBe(true)
  })

  it('validates Investigation structure using validateInvestigation', () => {
    const validInv = {
      investigationId: 'inv-test',
      chapterId: 'ch-001',
      datasetId: 'ds-001',
      title: 'Test Investigation',
      narrative: 'Test narrative',
      objective: 'Test objective',
      ordering: 1,
      status: 'published',
      questionIds: ['q-001'],
    }
    expect(mockInvestigationService.validateInvestigation(validInv).valid).toBe(true)

    const invalidInv = {
      investigationId: '',
      chapterId: null,
      datasetId: null,
      title: '',
      ordering: 'first',
      questionIds: 'q-001',
    }
    const validation = mockInvestigationService.validateInvestigation(invalidInv)
    expect(validation.valid).toBe(false)
    expect(validation.errors.length).toBeGreaterThan(0)
  })
})
