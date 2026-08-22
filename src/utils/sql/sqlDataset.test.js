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
})

