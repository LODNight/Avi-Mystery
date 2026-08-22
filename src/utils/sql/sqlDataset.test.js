import { describe, expect, it } from 'vitest'
import spikeDataset from '../../mocks/data/sql/aviation-spike.json'
import { validateSqlDataset } from './sqlDataset.js'
import { SQL_ERROR_CODES } from './sqlErrors.js'

describe('SQL dataset contract', () => {
  it('chấp nhận deterministic seed của Step 4.0', () => {
    expect(validateSqlDataset(spikeDataset)).toBe(spikeDataset)
  })

  it('chặn dialect khác SQLite và identifier không an toàn', () => {
    expect(() =>
      validateSqlDataset({ ...spikeDataset, dialect: 'postgres' })
    ).toThrow(expect.objectContaining({ code: SQL_ERROR_CODES.DATASET_INVALID }))

    const invalidDataset = JSON.parse(JSON.stringify(spikeDataset))
    invalidDataset.tables[0].name = 'airports; DROP TABLE flights'
    expect(() => validateSqlDataset(invalidDataset)).toThrow(
      expect.objectContaining({ code: SQL_ERROR_CODES.DATASET_INVALID })
    )
  })

  it('chặn seed row không khớp số cột', () => {
    const invalidDataset = JSON.parse(JSON.stringify(spikeDataset))
    invalidDataset.tables[0].rows[0] = [1, 'SGN']
    expect(() => validateSqlDataset(invalidDataset)).toThrow(
      expect.objectContaining({ code: SQL_ERROR_CODES.DATASET_INVALID })
    )
  })

  it('chặn tên bảng bị trùng nhau (duplicate table name)', () => {
    const invalidDataset = JSON.parse(JSON.stringify(spikeDataset))
    invalidDataset.tables.push({ ...invalidDataset.tables[0] })
    expect(() => validateSqlDataset(invalidDataset)).toThrow(
      expect.objectContaining({ code: SQL_ERROR_CODES.DATASET_INVALID })
    )
  })

  it('chặn tên cột bị trùng trong cùng một bảng (duplicate column name)', () => {
    const invalidDataset = JSON.parse(JSON.stringify(spikeDataset))
    const col0 = invalidDataset.tables[0].columns[0]
    invalidDataset.tables[0].columns.push({ ...col0 })
    expect(() => validateSqlDataset(invalidDataset)).toThrow(
      expect.objectContaining({ code: SQL_ERROR_CODES.DATASET_INVALID })
    )
  })

  it('chặn kiểu dữ liệu cột không hợp lệ (unsupported column type)', () => {
    const invalidDataset = JSON.parse(JSON.stringify(spikeDataset))
    invalidDataset.tables[0].columns[0] = {
      ...invalidDataset.tables[0].columns[0],
      type: 'VARCHAR',
    }
    expect(() => validateSqlDataset(invalidDataset)).toThrow(
      expect.objectContaining({ code: SQL_ERROR_CODES.DATASET_INVALID })
    )
  })

  it('chặn dataset không có bảng nào', () => {
    expect(() =>
      validateSqlDataset({ ...spikeDataset, tables: [] })
    ).toThrow(expect.objectContaining({ code: SQL_ERROR_CODES.DATASET_INVALID }))
  })

  it('chặn bảng không có cột nào', () => {
    const invalidDataset = JSON.parse(JSON.stringify(spikeDataset))
    invalidDataset.tables[0].columns = []
    expect(() => validateSqlDataset(invalidDataset)).toThrow(
      expect.objectContaining({ code: SQL_ERROR_CODES.DATASET_INVALID })
    )
  })
})


