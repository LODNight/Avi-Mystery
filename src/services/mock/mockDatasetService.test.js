import { describe, it, expect } from 'vitest'
import { mockDatasetService, normalizeDataset } from './mockDatasetService.js'

describe('mockDatasetService Unit Tests', () => {
  it('loads Excel dataset by datasetId independently', async () => {
    const res = await mockDatasetService.getDataset('ds-001')
    expect(res.error).toBeNull()
    expect(res.data).toBeDefined()
    expect(res.data.datasetId).toBe('ds-001')
    expect(res.data.id).toBe('ds-001')
    expect(res.data.type).toBe('excel')
    expect(res.data.version).toBe(1)
    expect(res.data.metadata.name).toBe('Bảng dữ liệu Doanh thu Bán hàng')
    expect(Array.isArray(res.data.schema.columns)).toBe(true)
    expect(Array.isArray(res.data.schema.rows)).toBe(true)
    // Legacy top-level accessors
    expect(res.data.columns).toEqual(res.data.schema.columns)
    expect(res.data.rows).toEqual(res.data.schema.rows)
  })

  it('loads SQL dataset by datasetId independently', async () => {
    const res = await mockDatasetService.getDataset('sql-sales-v1')
    expect(res.error).toBeNull()
    expect(res.data).toBeDefined()
    expect(res.data.datasetId).toBe('sql-sales-v1')
    expect(res.data.type).toBe('sql')
    expect(res.data.version).toBe(1)
    expect(res.data.schema.dialect).toBe('sqlite')
    expect(Array.isArray(res.data.schema.tables)).toBe(true)
    expect(res.data.tables).toEqual(res.data.schema.tables)
  })

  it('supports version referencing', async () => {
    const validRes = await mockDatasetService.getDataset('ds-001', 1)
    expect(validRes.error).toBeNull()
    expect(validRes.data.version).toBe(1)

    const invalidRes = await mockDatasetService.getDataset('ds-001', 2)
    expect(invalidRes.data).toBeNull()
    expect(invalidRes.error).toContain('Phiên bản dataset 2 không phù hợp')
  })

  it('returns error when datasetId is unknown', async () => {
    const res = await mockDatasetService.getDataset('unknown-dataset')
    expect(res.data).toBeNull()
    expect(res.error).toContain('Không tìm thấy dataset "unknown-dataset"')
  })

  it('lists datasets and filters by type', async () => {
    const allRes = await mockDatasetService.listDatasets()
    expect(allRes.error).toBeNull()
    expect(allRes.data.length).toBeGreaterThanOrEqual(4)

    const excelRes = await mockDatasetService.listDatasets({ type: 'excel' })
    expect(excelRes.data.every((d) => d.type === 'excel')).toBe(true)

    const sqlRes = await mockDatasetService.listDatasets({ type: 'sql' })
    expect(sqlRes.data.every((d) => d.type === 'sql')).toBe(true)
  })

  it('validates datasets using validateDataset helper', () => {
    const validExcel = {
      datasetId: 'ds-test',
      version: 1,
      type: 'excel',
      schema: { columns: [{ key: 'a' }], rows: [{ a: 1 }] },
    }
    expect(mockDatasetService.validateDataset(validExcel).valid).toBe(true)

    const validSql = {
      datasetId: 'sql-test',
      version: 1,
      type: 'sql',
      schema: { dialect: 'sqlite', tables: [{ name: 't', columns: [{ name: 'c', type: 'TEXT' }], rows: [] }] },
    }
    expect(mockDatasetService.validateDataset(validSql).valid).toBe(true)

    const invalid = { datasetId: 123, version: 0, type: 'invalid' }
    const validation = mockDatasetService.validateDataset(invalid)
    expect(validation.valid).toBe(false)
    expect(validation.errors.length).toBeGreaterThan(0)
  })

  it('normalizes legacy dataset structure correctly', () => {
    const rawLegacy = {
      id: 'ds-legacy',
      name: 'Legacy DS',
      version: 1,
      columns: [{ key: 'col' }],
      rows: [{ col: 'val' }],
    }
    const normalized = normalizeDataset(rawLegacy)
    expect(normalized.datasetId).toBe('ds-legacy')
    expect(normalized.type).toBe('excel')
    expect(normalized.schema.columns).toEqual(rawLegacy.columns)
    expect(normalized.schema.rows).toEqual(rawLegacy.rows)
  })
})
