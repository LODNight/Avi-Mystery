import { describe, it, expect } from 'vitest'
import {
  evaluateSqlResult,
  areCellsEqual,
  areRowsEqual,
  SQL_CHECKER_FEEDBACK_CODES,
} from './sqlChecker.js'

describe('SQL Result Checker — Helper Functions', () => {
  describe('areCellsEqual', () => {
    it('handles NULL and undefined correctly', () => {
      expect(areCellsEqual(null, null)).toBe(true)
      expect(areCellsEqual(undefined, undefined)).toBe(true)
      expect(areCellsEqual(null, undefined)).toBe(true)
      expect(areCellsEqual(null, 'NULL')).toBe(false)
      expect(areCellsEqual(null, 0)).toBe(false)
    })

    it('compares numbers within numericTolerance', () => {
      expect(areCellsEqual(12.3456, 12.3459, 0.001)).toBe(true)
      expect(areCellsEqual(12.34, 12.35, 0.001)).toBe(false)
      expect(areCellsEqual(100, 100, 0.001)).toBe(true)
    })

    it('compares strings after trimming', () => {
      expect(areCellsEqual('sales ', 'sales')).toBe(true)
      expect(areCellsEqual('Apple', 'apple')).toBe(false)
    })

    it('compares booleans correctly', () => {
      expect(areCellsEqual(true, true)).toBe(true)
      expect(areCellsEqual(true, false)).toBe(false)
    })
  })

  describe('areRowsEqual', () => {
    it('returns true for matching rows', () => {
      expect(areRowsEqual([1, 'Laptop', 1250000], [1, 'Laptop', 1250000])).toBe(true)
    })

    it('returns false for mismatched row content', () => {
      expect(areRowsEqual([1, 'Laptop', 1250000], [1, 'Mouse', 1250000])).toBe(false)
    })

    it('supports column index remapping', () => {
      // actual: [Laptop, 1], expected: [1, Laptop]
      expect(areRowsEqual(['Laptop', 1], [1, 'Laptop'], [1, 0])).toBe(true)
    })
  })
})

describe('SQL Result Checker — evaluateSqlResult', () => {
  const sampleExpected = {
    columns: ['order_id', 'product_name', 'revenue'],
    rows: [
      [101, 'Thẻ Nông Dân Gold', 1500000],
      [102, 'Máy Gặt Đa Năng', 25000000],
      [103, 'Phân Bón Hữu Cơ', 450000],
    ],
  }

  it('1. Returns execution error if actualResult has errorCode', () => {
    const actual = {
      errorCode: 'SQL_SYNTAX_ERROR',
      message: 'near "FORM": syntax error',
    }
    const result = evaluateSqlResult(actual, sampleExpected)
    expect(result.isCorrect).toBe(false)
    expect(result.score).toBe(0)
    expect(result.feedbackCode).toBe('SQL_SYNTAX_ERROR')
  })

  it('2. Fails when a required construct is missing', () => {
    const actual = {
      columns: ['order_id', 'product_name', 'revenue'],
      rows: sampleExpected.rows,
    }
    const config = { requiredConstructs: ['JOIN'] }
    const query = 'SELECT * FROM sales;'

    const result = evaluateSqlResult(actual, sampleExpected, config, query)
    expect(result.isCorrect).toBe(false)
    expect(result.feedbackCode).toBe(SQL_CHECKER_FEEDBACK_CODES.MISSING_REQUIRED_CONSTRUCT)
    expect(result.feedback).toContain('JOIN')
  })

  it('3. Fails when a forbidden construct is present', () => {
    const actual = {
      columns: ['order_id', 'product_name', 'revenue'],
      rows: sampleExpected.rows,
    }
    const config = { forbiddenConstructs: ['DROP'] }
    const query = 'DROP TABLE sales; SELECT * FROM sales;'

    const result = evaluateSqlResult(actual, sampleExpected, config, query)
    expect(result.isCorrect).toBe(false)
    expect(result.feedbackCode).toBe(SQL_CHECKER_FEEDBACK_CODES.FORBIDDEN_CONSTRUCT_USED)
    expect(result.feedback).toContain('DROP')
  })

  it('4. Fails when column count does not match', () => {
    const actual = {
      columns: ['order_id', 'product_name'],
      rows: [[101, 'Thẻ Nông Dân Gold']],
    }
    const result = evaluateSqlResult(actual, sampleExpected)
    expect(result.isCorrect).toBe(false)
    expect(result.feedbackCode).toBe(SQL_CHECKER_FEEDBACK_CODES.COLUMN_COUNT_MISMATCH)
    expect(result.feedback).toContain('2 cột')
  })

  it('5. Fails when expected column name is missing or wrong order', () => {
    const actual = {
      columns: ['order_id', 'item_name', 'revenue'],
      rows: sampleExpected.rows,
    }
    const result = evaluateSqlResult(actual, sampleExpected)
    expect(result.isCorrect).toBe(false)
    expect(result.feedbackCode).toBe(SQL_CHECKER_FEEDBACK_CODES.MISSING_EXPECTED_COLUMN)
    expect(result.feedback).toContain('item_name')
  })

  it('6. Fails when result set is empty but expected data exists', () => {
    const actual = {
      columns: ['order_id', 'product_name', 'revenue'],
      rows: [],
    }
    const result = evaluateSqlResult(actual, sampleExpected)
    expect(result.isCorrect).toBe(false)
    expect(result.feedbackCode).toBe(SQL_CHECKER_FEEDBACK_CODES.EMPTY_RESULT_SET)
    expect(result.feedback).toContain('0 kết quả')
  })

  it('7. Fails when row count does not match', () => {
    const actual = {
      columns: ['order_id', 'product_name', 'revenue'],
      rows: [[101, 'Thẻ Nông Dân Gold', 1500000]],
    }
    const result = evaluateSqlResult(actual, sampleExpected)
    expect(result.isCorrect).toBe(false)
    expect(result.feedbackCode).toBe(SQL_CHECKER_FEEDBACK_CODES.ROW_COUNT_MISMATCH)
    expect(result.feedback).toContain('1')
  })

  it('8. Detects row order mismatch when orderMatters is true', () => {
    const actual = {
      columns: ['order_id', 'product_name', 'revenue'],
      rows: [
        [102, 'Máy Gặt Đa Năng', 25000000],
        [101, 'Thẻ Nông Dân Gold', 1500000],
        [103, 'Phân Bón Hữu Cơ', 450000],
      ],
    }
    const config = { orderMatters: true }
    const result = evaluateSqlResult(actual, sampleExpected, config)

    expect(result.isCorrect).toBe(false)
    expect(result.score).toBe(50)
    expect(result.feedbackCode).toBe(SQL_CHECKER_FEEDBACK_CODES.ROW_ORDER_MISMATCH)
    expect(result.feedback).toContain('ORDER BY')
  })

  it('9. Passes when orderMatters is false even if rows are in different order', () => {
    const actual = {
      columns: ['order_id', 'product_name', 'revenue'],
      rows: [
        [103, 'Phân Bón Hữu Cơ', 450000],
        [101, 'Thẻ Nông Dân Gold', 1500000],
        [102, 'Máy Gặt Đa Năng', 25000000],
      ],
    }
    const config = { orderMatters: false }
    const result = evaluateSqlResult(actual, sampleExpected, config)

    expect(result.isCorrect).toBe(true)
    expect(result.score).toBe(100)
    expect(result.feedbackCode).toBe(SQL_CHECKER_FEEDBACK_CODES.SUCCESS)
  })

  it('10. Handles duplicate rows properly in orderMatters: false', () => {
    const expected = {
      columns: ['category'],
      rows: [['Phân bón'], ['Phân bón'], ['Dụng cụ']],
    }
    const actualMatch = {
      columns: ['category'],
      rows: [['Dụng cụ'], ['Phân bón'], ['Phân bón']],
    }
    const actualMismatch = {
      columns: ['category'],
      rows: [['Dụng cụ'], ['Phân bón'], ['Dụng cụ']],
    }

    expect(evaluateSqlResult(actualMatch, expected, { orderMatters: false }).isCorrect).toBe(true)
    expect(evaluateSqlResult(actualMismatch, expected, { orderMatters: false }).isCorrect).toBe(false)
  })

  it('11. Passes numeric tolerance check for float calculations', () => {
    const expected = {
      columns: ['avg_price'],
      rows: [[12500.333]],
    }
    const actual = {
      columns: ['avg_price'],
      rows: [[12500.3334]],
    }
    const config = { numericTolerance: 0.001 }

    const result = evaluateSqlResult(actual, expected, config)
    expect(result.isCorrect).toBe(true)
    expect(result.feedbackCode).toBe(SQL_CHECKER_FEEDBACK_CODES.SUCCESS)
  })

  it('12. Passes 100% when query result perfectly matches expected', () => {
    const actual = {
      columns: ['order_id', 'product_name', 'revenue'],
      rows: [
        [101, 'Thẻ Nông Dân Gold', 1500000],
        [102, 'Máy Gặt Đa Năng', 25000000],
        [103, 'Phân Bón Hữu Cơ', 450000],
      ],
    }
    const result = evaluateSqlResult(actual, sampleExpected)
    expect(result.isCorrect).toBe(true)
    expect(result.score).toBe(100)
    expect(result.feedbackCode).toBe(SQL_CHECKER_FEEDBACK_CODES.SUCCESS)
  })
})
