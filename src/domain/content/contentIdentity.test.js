import { describe, expect, it } from 'vitest'
import {
  ENTITY_TYPES,
  getInvestigationIdentity,
  getPhaseIdentity,
  getPhasesByCourse,
  getQuestionIdentity,
  isValidEntityId,
  resolveLegacyMissionIdentity,
} from './contentIdentity.js'
import { mockContentService } from '../../services/mock/mockContentService.js'

describe('Content Domain Identity Foundation (Step 5.1)', () => {
  describe('ID Prefix & Validation (isValidEntityId)', () => {
    it('validates Course IDs', () => {
      expect(isValidEntityId(ENTITY_TYPES.COURSE, 'course-001')).toBe(true)
      expect(isValidEntityId(ENTITY_TYPES.COURSE, 'ch-001')).toBe(false)
    })

    it('validates Phase IDs', () => {
      expect(isValidEntityId(ENTITY_TYPES.PHASE, 'phase-001')).toBe(true)
      expect(isValidEntityId(ENTITY_TYPES.PHASE, 'course-001')).toBe(false)
    })

    it('validates Chapter IDs', () => {
      expect(isValidEntityId(ENTITY_TYPES.CHAPTER, 'ch-001')).toBe(true)
      expect(isValidEntityId(ENTITY_TYPES.CHAPTER, 'phase-001')).toBe(false)
    })

    it('validates Dataset IDs (both Excel ds- and SQL sql- prefixes)', () => {
      expect(isValidEntityId(ENTITY_TYPES.DATASET, 'ds-001')).toBe(true)
      expect(isValidEntityId(ENTITY_TYPES.DATASET, 'sql-sales-v1')).toBe(true)
      expect(isValidEntityId(ENTITY_TYPES.DATASET, 'inv-001')).toBe(false)
    })

    it('validates Investigation IDs', () => {
      expect(isValidEntityId(ENTITY_TYPES.INVESTIGATION, 'inv-001')).toBe(true)
      expect(isValidEntityId(ENTITY_TYPES.INVESTIGATION, 'q-001')).toBe(false)
    })

    it('validates Question IDs', () => {
      expect(isValidEntityId(ENTITY_TYPES.QUESTION, 'q-001')).toBe(true)
      expect(isValidEntityId(ENTITY_TYPES.QUESTION, 'inv-001')).toBe(false)
    })
  })

  describe('Legacy Mission Identity Resolution', () => {
    it('maps legacy mission-001 to explicit domain entity graph', () => {
      const resolved = resolveLegacyMissionIdentity('mission-001')
      expect(resolved).toEqual({
        missionId: 'mission-001',
        investigationId: 'inv-001',
        questionId: 'q-001',
        chapterId: 'ch-001',
        phaseId: 'phase-001',
        courseId: 'course-001',
        datasetId: 'ds-001',
        tool: 'excel',
      })
    })

    it('maps legacy mission-010 (SQL) to explicit domain entity graph', () => {
      const resolved = resolveLegacyMissionIdentity('mission-010')
      expect(resolved).toEqual({
        missionId: 'mission-010',
        investigationId: 'inv-010',
        questionId: 'q-010',
        chapterId: 'ch-004',
        phaseId: 'phase-004',
        courseId: 'course-002',
        datasetId: 'sql-sales-v1',
        tool: 'sql',
      })
    })

    it('returns null for unknown missionId', () => {
      expect(resolveLegacyMissionIdentity('mission-999')).toBeNull()
    })
  })

  describe('Independent Dataset References', () => {
    it('proves single dataset ds-001 is referenced by multiple questions', () => {
      const q1 = getQuestionIdentity('q-001')
      const q2 = getQuestionIdentity('q-002')
      const q3 = getQuestionIdentity('q-003')

      expect(q1.datasetId).toBe('ds-001')
      expect(q2.datasetId).toBe('ds-001')
      expect(q3.datasetId).toBe('ds-001')
    })

    it('proves single dataset sql-sales-v1 is referenced by multiple SQL questions', () => {
      const q10 = getQuestionIdentity('q-010')
      const q11 = getQuestionIdentity('q-011')
      const q12 = getQuestionIdentity('q-012')

      expect(q10.datasetId).toBe('sql-sales-v1')
      expect(q11.datasetId).toBe('sql-sales-v1')
      expect(q12.datasetId).toBe('sql-sales-v1')
    })
  })

  describe('mockContentService API', () => {
    it('getCourse returns course with phaseIds', async () => {
      const res = await mockContentService.getCourse('course-001')
      expect(res.error).toBeNull()
      expect(res.data.id).toBe('course-001')
      expect(res.data.phaseIds).toEqual(['phase-001', 'phase-002', 'phase-003'])
    })

    it('getPhase returns phase metadata', async () => {
      const res = await mockContentService.getPhase('phase-004')
      expect(res.error).toBeNull()
      expect(res.data).toEqual({
        id: 'phase-004',
        courseId: 'course-002',
        orderIndex: 1,
        title: 'Giai đoạn 1: Khám phá SQL',
        chapterIds: ['ch-004'],
      })
    })

    it('getDataset returns dataset metadata for Excel and SQL', async () => {
      const excelRes = await mockContentService.getDataset('ds-001')
      expect(excelRes.error).toBeNull()
      expect(excelRes.data.type).toBe('excel')

      const sqlRes = await mockContentService.getDataset('sql-sales-v1')
      expect(sqlRes.error).toBeNull()
      expect(sqlRes.data.type).toBe('sql')
    })

    it('getInvestigation returns investigation details', async () => {
      const res = await mockContentService.getInvestigation('inv-010')
      expect(res.error).toBeNull()
      expect(res.data.id).toBe('inv-010')
      expect(res.data.chapterId).toBe('ch-004')
      expect(res.data.phaseId).toBe('phase-004')
      expect(res.data.courseId).toBe('course-002')
      expect(res.data.title).toBe('Khám phá dữ liệu bán hàng')
    })

    it('getQuestion returns question details', async () => {
      const res = await mockContentService.getQuestion('q-010')
      expect(res.error).toBeNull()
      expect(res.data.id).toBe('q-010')
      expect(res.data.investigationId).toBe('inv-010')
      expect(res.data.datasetId).toBe('sql-sales-v1')
      expect(res.data.tool).toBe('sql')
    })
  })
})
