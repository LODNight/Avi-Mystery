import { describe, expect, it } from 'vitest'
import missions from '../../mocks/data/missions.json'
import { SQL_MISSION_ERROR_CODES } from '../contracts/sqlMissionService.js'
import { mockSqlMissionService } from './mockSqlMissionService.js'

describe('mockSqlMissionService', () => {
  it('loads every published SQL mission with an isolated SQLite dataset', async () => {
    const sqlMissions = missions.filter((mission) => mission.tool === 'sql' && mission.status === 'published')
    for (const mission of sqlMissions) {
      const result = await mockSqlMissionService.loadWorkspace(mission.id)
      expect(result.error).toBeNull()
      expect(result.data.mission.id).toBe(mission.id)
      expect(result.data.dataset.id).toBe(mission.datasetId)
      expect(result.data.dataset.dialect).toBe('sqlite')
      expect(result.data.dataset.tables.length).toBeGreaterThan(0)
    }
  })

  it('does not leak mutable mission or dataset references between calls', async () => {
    const first = await mockSqlMissionService.loadWorkspace('mission-010')
    first.data.dataset.tables[0].name = 'changed'
    const second = await mockSqlMissionService.loadWorkspace('mission-010')
    expect(second.data.dataset.tables[0].name).toBe('sales')
  })

  it('returns stable errors for missing and non-SQL missions', async () => {
    await expect(mockSqlMissionService.loadWorkspace('missing')).resolves.toMatchObject({
      data: null, error: { code: SQL_MISSION_ERROR_CODES.MISSION_NOT_FOUND },
    })
    await expect(mockSqlMissionService.loadWorkspace('mission-001')).resolves.toMatchObject({
      data: null, error: { code: SQL_MISSION_ERROR_CODES.MISSION_TOOL_MISMATCH },
    })
  })
})
