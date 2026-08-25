import { describe, it, expect } from 'vitest'
import { datasetService, contentService, sqlMissionService, missionService } from '../../services/index.js'
import { getInvestigationIdentity } from './contentIdentity.js'
import { validateSqlDataset } from '../../utils/sql/sqlDataset.js'

describe('Step 5.2 — Dataset Contract & Decoupling Tests', () => {
  it('verifies datasetService gateway is exported and functioning', async () => {
    expect(datasetService).toBeDefined()
    expect(typeof datasetService.getDataset).toBe('function')
    expect(typeof datasetService.listDatasets).toBe('function')

    const res = await datasetService.getDataset('ds-001')
    expect(res.error).toBeNull()
    expect(res.data.datasetId).toBe('ds-001')
  })

  it('ensures Investigation references datasetId without embedding dataset content', async () => {
    const invIdentity = getInvestigationIdentity('inv-sql-01')
    expect(invIdentity).toBeDefined()
    expect(invIdentity.datasetId).toBe('sql-sales-v1')

    const invRes = await contentService.getInvestigation('inv-sql-01')
    expect(invRes.error).toBeNull()
    expect(invRes.data.datasetId).toBe('sql-sales-v1')
    // Verification: Investigation does NOT contain embedded tables or raw datasets
    expect(invRes.data.tables).toBeUndefined()
    expect(invRes.data.columns).toBeUndefined()
  })

  it('allows Dataset to be referenced independently of any Investigation', async () => {
    const dsRes = await datasetService.getDataset('sql-sales-v1')
    expect(dsRes.error).toBeNull()
    expect(dsRes.data).toBeDefined()
    expect(dsRes.data.datasetId).toBe('sql-sales-v1')
    expect(dsRes.data.type).toBe('sql')
    expect(dsRes.data.schema.tables.length).toBeGreaterThan(0)
  })

  it('verifies SQL engine validator supports canonical dataset structure', async () => {
    const { data: sqlDataset } = await datasetService.getDataset('sql-sales-v1')
    expect(() => validateSqlDataset(sqlDataset)).not.toThrow()
  })

  it('verifies sqlMissionService workspace loading uses datasetService', async () => {
    const res = await sqlMissionService.loadWorkspace('sql-mission-01')
    expect(res.error).toBeNull()
    expect(res.data.mission.id).toBe('sql-mission-01')
    expect(res.data.dataset.datasetId).toBe('sql-sales-v1')
    expect(res.data.dataset.schema.dialect).toBe('sqlite')
  })

  it('verifies legacy missionService getDataset delegates to datasetService', async () => {
    const res = await missionService.getDataset('ds-001')
    expect(res.error).toBeNull()
    expect(res.data.datasetId).toBe('ds-001')
    expect(res.data.type).toBe('excel')
  })
})
