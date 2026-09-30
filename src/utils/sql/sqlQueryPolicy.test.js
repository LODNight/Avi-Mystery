import { describe, expect, it } from 'vitest'
import { SQL_ERROR_CODES } from './sqlErrors.js'
import { validateReadOnlyQuery, extractTableNames, validateTableScope } from './sqlQueryPolicy.js'

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

  it('chặn các câu lệnh DDL và mutation khác (CREATE, DROP, ALTER, UPDATE, INSERT, ATTACH, DETACH, VACUUM, REINDEX, REPLACE, PRAGMA)', () => {
    const forbiddenQueries = [
      'CREATE TABLE temp (id INT)',
      'DROP TABLE flights',
      'ALTER TABLE flights ADD COLUMN test TEXT',
      'UPDATE flights SET status = "CANCELLED"',
      'INSERT INTO flights VALUES (1)',
      'ATTACH DATABASE "other.db" AS other',
      'DETACH DATABASE other',
      'VACUUM',
      'REINDEX flights',
      'REPLACE INTO flights VALUES (1)',
      'PRAGMA journal_mode=WAL',
      'PRAGMA foreign_keys=OFF',
    ]

    forbiddenQueries.forEach((q) => {
      expectPolicyError(q, SQL_ERROR_CODES.READ_ONLY_VIOLATION)
    })
  })

  it('chặn các mưu đồ SQL Injection thông qua multi-statement hoặc từ khóa bị cấm ẩn', () => {
    expectPolicyError(
      "SELECT * FROM sales WHERE branch = 'Hà Nội'; DROP TABLE sales;",
      SQL_ERROR_CODES.MULTIPLE_STATEMENTS
    )
    expectPolicyError(
      "SELECT * FROM sales; UPDATE sales SET revenue = 0;",
      SQL_ERROR_CODES.MULTIPLE_STATEMENTS
    )
    expectPolicyError(
      "SELECT * FROM sales;\nDELETE FROM sales;",
      SQL_ERROR_CODES.MULTIPLE_STATEMENTS
    )
  })

  it('cho phép câu lệnh kết thúc bằng dấu chấm phẩy và khoảng trắng', () => {
    expect(validateReadOnlyQuery('SELECT * FROM sales;   \n  ')).toBe(
      'SELECT * FROM sales;'
    )
  })

  describe('extractTableNames & validateTableScope', () => {
    it('trích xuất chính xác tên bảng từ câu lệnh SELECT, JOIN, CTE', () => {
      expect(extractTableNames('SELECT * FROM camera_logs;')).toEqual(['camera_logs'])
      expect(extractTableNames('SELECT * FROM "camera_logs";')).toEqual(['camera_logs'])
      expect(
        extractTableNames('SELECT * FROM camera_logs c JOIN transactions t ON c.id = t.id')
      ).toEqual(['camera_logs', 'transactions'])
      expect(
        extractTableNames('SELECT * FROM camera_logs, employee_records WHERE 1=1')
      ).toEqual(['camera_logs', 'employee_records'])
      // CTE alias không bị coi là bảng vật lý
      expect(
        extractTableNames('WITH local_cte AS (SELECT * FROM camera_logs) SELECT * FROM local_cte')
      ).toEqual(['camera_logs'])
    })

    it('cho phép truy vấn khi tất cả các bảng nằm trong danh sách được phép', () => {
      expect(() =>
        validateTableScope('SELECT * FROM camera_logs;', ['camera_logs'])
      ).not.toThrow()
      expect(() =>
        validateTableScope('SELECT c.*, a.* FROM camera_logs c JOIN access_logs a ON c.id = a.id', [
          'camera_logs',
          'access_logs',
        ])
      ).not.toThrow()
    })

    it('chặn truy vấn khi người chơi cố tình gọi bảng ẩn/tương lai (transactions)', () => {
      expect(() =>
        validateTableScope('SELECT * FROM transactions;', ['camera_logs'])
      ).toThrow(
        expect.objectContaining({
          code: SQL_ERROR_CODES.TABLE_UNAVAILABLE,
          message: expect.stringContaining("Bảng 'transactions' không khả dụng"),
        })
      )

      expect(() =>
        validateTableScope('SELECT * FROM camera_logs JOIN transactions ON 1=1', ['camera_logs'])
      ).toThrow(
        expect.objectContaining({
          code: SQL_ERROR_CODES.TABLE_UNAVAILABLE,
        })
      )
    })
  })
})

