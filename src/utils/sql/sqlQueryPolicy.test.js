import { describe, expect, it } from 'vitest'
import { SQL_ERROR_CODES } from './sqlErrors.js'
import { validateReadOnlyQuery } from './sqlQueryPolicy.js'

function expectPolicyError(query, code) {
  expect(() => validateReadOnlyQuery(query)).toThrow(
    expect.objectContaining({ code })
  )
}

describe('SQL read-only query policy', () => {
  it('chấp nhận SELECT, WITH và một dấu chấm phẩy kết thúc', () => {
    expect(validateReadOnlyQuery('SELECT * FROM flights;')).toBe(
      'SELECT * FROM flights;'
    )
    expect(
      validateReadOnlyQuery(
        'WITH delayed AS (SELECT * FROM flights WHERE status = \'DELAYED\') SELECT * FROM delayed'
      )
    ).toContain('WITH delayed')
  })

  it('phân loại input rỗng và input chỉ có ký hiệu thành lỗi phù hợp', () => {
    expectPolicyError('  ', SQL_ERROR_CODES.QUERY_REQUIRED)
    expectPolicyError('=', SQL_ERROR_CODES.SYNTAX_ERROR)
  })

  it('chặn nhiều statement và mutation kể cả nằm sau WITH', () => {
    expectPolicyError(
      'SELECT * FROM flights; SELECT * FROM airports',
      SQL_ERROR_CODES.MULTIPLE_STATEMENTS
    )
    expectPolicyError(
      'WITH target AS (SELECT 1) DELETE FROM flights',
      SQL_ERROR_CODES.READ_ONLY_VIOLATION
    )
    expectPolicyError('PRAGMA table_info(flights)', SQL_ERROR_CODES.READ_ONLY_VIOLATION)
  })

  it('không coi keyword hoặc dấu chấm phẩy trong string/comment là mutation', () => {
    expect(validateReadOnlyQuery("SELECT 'DELETE; DROP' AS note")).toContain(
      "'DELETE; DROP'"
    )
    expect(
      validateReadOnlyQuery('/* DELETE FROM flights; */ SELECT * FROM flights')
    ).toContain('SELECT')
  })

  it('báo syntax error khi quote hoặc comment chưa đóng', () => {
    expectPolicyError("SELECT 'missing", SQL_ERROR_CODES.SYNTAX_ERROR)
    expectPolicyError('SELECT 1 /* missing', SQL_ERROR_CODES.SYNTAX_ERROR)
  })
})

