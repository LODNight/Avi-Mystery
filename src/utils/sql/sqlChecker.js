/**
 * SQL Result Checker Module
 * Evaluates learner query output against canonical expected result & checker configuration.
 */

export const SQL_CHECKER_FEEDBACK_CODES = {
  SUCCESS: 'SQL_RESULT_MATCHED',
  MISSING_REQUIRED_CONSTRUCT: 'SQL_MISSING_REQUIRED_CONSTRUCT',
  FORBIDDEN_CONSTRUCT_USED: 'SQL_FORBIDDEN_CONSTRUCT_USED',
  EMPTY_RESULT_SET: 'SQL_EMPTY_RESULT_SET',
  COLUMN_COUNT_MISMATCH: 'SQL_COLUMN_COUNT_MISMATCH',
  MISSING_EXPECTED_COLUMN: 'SQL_MISSING_EXPECTED_COLUMN',
  ROW_COUNT_MISMATCH: 'SQL_ROW_COUNT_MISMATCH',
  ROW_ORDER_MISMATCH: 'SQL_ROW_ORDER_MISMATCH',
  VALUE_MISMATCH: 'SQL_VALUE_MISMATCH',
}

/**
 * Compare two cell values considering data types, NULLs, and numeric tolerance.
 *
 * @param {unknown} valA
 * @param {unknown} valB
 * @param {number} tolerance
 * @returns {boolean}
 */
export function areCellsEqual(valA, valB, tolerance = 0.001) {
  // 1. Both NULL or undefined
  if (valA === null || valA === undefined) {
    return valB === null || valB === undefined
  }
  if (valB === null || valB === undefined) {
    return false
  }

  // 2. Both numeric
  const numA = typeof valA === 'number' ? valA : Number(valA)
  const numB = typeof valB === 'number' ? valB : Number(valB)

  if (!isNaN(numA) && !isNaN(numB) && typeof valA !== 'boolean' && typeof valB !== 'boolean') {
    return Math.abs(numA - numB) <= tolerance
  }

  // 3. General comparison (strings, booleans)
  return String(valA).trim() === String(valB).trim()
}

/**
 * Compare two row arrays element by element.
 *
 * @param {Array} rowA
 * @param {Array} rowB
 * @param {Array<number>} [colMapping]
 * @param {number} [tolerance]
 * @returns {boolean}
 */
export function areRowsEqual(rowA, rowB, colMapping = null, tolerance = 0.001) {
  if (!rowA || !rowB || rowA.length !== rowB.length) return false

  for (let i = 0; i < rowA.length; i++) {
    const targetIdx = colMapping ? colMapping[i] : i
    if (targetIdx === -1 || targetIdx >= rowB.length) return false

    if (!areCellsEqual(rowA[i], rowB[targetIdx], tolerance)) {
      return false
    }
  }
  return true
}

/**
 * Main SQL Evaluation Engine.
 * Pure function: compares actualResult with expectedResult & checkerConfig.
 *
 * @param {Object} actualResult - Envelope from sqlEngine.execute ({ columns, rows, rowCount, errorCode, message })
 * @param {Object} expectedResult - Expected envelope ({ columns, rows })
 * @param {Object} [checkerConfig] - Rules ({ expectedColumns, orderMatters, columnOrderMatters, numericTolerance, requiredConstructs, forbiddenConstructs })
 * @param {string} [queryText] - User query string for syntax construct validation
 * @returns {Object} { isCorrect: boolean, score: number, feedbackCode: string, feedback: string, details?: object }
 */
export function evaluateSqlResult(actualResult, expectedResult, checkerConfig = {}, queryText = '') {
  // Guard 1: Execution error in actual result
  if (!actualResult || actualResult.errorCode) {
    return {
      isCorrect: false,
      score: 0,
      feedbackCode: actualResult?.errorCode || 'SQL_EXECUTION_ERROR',
      feedback: actualResult?.message || 'Không thể thực thi câu lệnh SQL.',
      details: { actualResult },
    }
  }

  const {
    expectedColumns = null,
    orderMatters = false,
    columnOrderMatters = true,
    numericTolerance = 0.001,
    requiredConstructs = [],
    forbiddenConstructs = [],
  } = checkerConfig

  // Guard 2: Required & Forbidden Constructs Validation
  if (queryText && typeof queryText === 'string') {
    const uppercaseQuery = queryText.toUpperCase()

    for (const forbidden of forbiddenConstructs) {
      if (new RegExp(`\\b${forbidden}\\b`, 'i').test(uppercaseQuery)) {
        return {
          isCorrect: false,
          score: 0,
          feedbackCode: SQL_CHECKER_FEEDBACK_CODES.FORBIDDEN_CONSTRUCT_USED,
          feedback: `Câu truy vấn của bạn chứa từ khóa không được phép sử dụng: ${forbidden}.`,
          details: { forbiddenConstruct: forbidden },
        }
      }
    }

    for (const required of requiredConstructs) {
      if (!new RegExp(`\\b${required}\\b`, 'i').test(uppercaseQuery)) {
        return {
          isCorrect: false,
          score: 0,
          feedbackCode: SQL_CHECKER_FEEDBACK_CODES.MISSING_REQUIRED_CONSTRUCT,
          feedback: `Câu truy vấn của bạn thiếu từ khóa bắt buộc: ${required}.`,
          details: { missingConstruct: required },
        }
      }
    }
  }

  const actualCols = (actualResult.columns || []).map((c) => String(c).trim())
  const targetCols = (expectedColumns || expectedResult?.columns || []).map((c) => String(c).trim())

  // Guard 3: Column count mismatch
  if (actualCols.length !== targetCols.length) {
    return {
      isCorrect: false,
      score: 0,
      feedbackCode: SQL_CHECKER_FEEDBACK_CODES.COLUMN_COUNT_MISMATCH,
      feedback: `Số lượng cột trả về (${actualCols.length} cột) không khớp với yêu cầu (${targetCols.length} cột).`,
      details: { actualCols, targetCols },
    }
  }

  // Guard 4: Column names / casing check & Mapping
  const colMapping = []
  for (let i = 0; i < actualCols.length; i++) {
    const actColLower = actualCols[i].toLowerCase()
    const expColLower = targetCols[i].toLowerCase()

    if (columnOrderMatters) {
      if (actColLower !== expColLower) {
        return {
          isCorrect: false,
          score: 0,
          feedbackCode: SQL_CHECKER_FEEDBACK_CODES.MISSING_EXPECTED_COLUMN,
          feedback: `Tên cột thứ ${i + 1} ('${actualCols[i]}') không khớp với tên cột yêu cầu ('${targetCols[i]}').`,
          details: { actualCol: actualCols[i], expectedCol: targetCols[i] },
        }
      }
      colMapping.push(i)
    } else {
      // Find matching column index anywhere
      const foundIdx = targetCols.findIndex((c) => c.toLowerCase() === actColLower)
      if (foundIdx === -1) {
        return {
          isCorrect: false,
          score: 0,
          feedbackCode: SQL_CHECKER_FEEDBACK_CODES.MISSING_EXPECTED_COLUMN,
          feedback: `Kết quả thiếu cột yêu cầu '${actualCols[i]}'.`,
          details: { actualCol: actualCols[i], targetCols },
        }
      }
      colMapping.push(foundIdx)
    }
  }

  const actualRows = actualResult.rows || []
  const expectedRows = expectedResult?.rows || []

  // Guard 5: Empty actual result set when expected is non-empty
  if (actualRows.length === 0 && expectedRows.length > 0) {
    return {
      isCorrect: false,
      score: 0,
      feedbackCode: SQL_CHECKER_FEEDBACK_CODES.EMPTY_RESULT_SET,
      feedback: 'Câu truy vấn không trả về dòng dữ liệu nào (0 kết quả). Hãy kiểm tra lại điều kiện lọc WHERE.',
      details: { actualRowsCount: 0, expectedRowsCount: expectedRows.length },
    }
  }

  // Guard 6: Row count mismatch
  if (actualRows.length !== expectedRows.length) {
    return {
      isCorrect: false,
      score: 0,
      feedbackCode: SQL_CHECKER_FEEDBACK_CODES.ROW_COUNT_MISMATCH,
      feedback: `Số lượng dòng dữ liệu (${actualRows.length}) không khớp với đáp án vụ án (${expectedRows.length} dòng).`,
      details: { actualCount: actualRows.length, expectedCount: expectedRows.length },
    }
  }

  // Guard 7: Row content & ordering matching
  if (orderMatters) {
    for (let i = 0; i < actualRows.length; i++) {
      if (!areRowsEqual(actualRows[i], expectedRows[i], colMapping, numericTolerance)) {
        // Check if row exists elsewhere in expected set (indicates missing ORDER BY)
        const existsElsewhere = expectedRows.some((expRow) => areRowsEqual(actualRows[i], expRow, colMapping, numericTolerance))

        if (existsElsewhere) {
          return {
            isCorrect: false,
            score: 50,
            feedbackCode: SQL_CHECKER_FEEDBACK_CODES.ROW_ORDER_MISMATCH,
            feedback: `Dữ liệu đúng nhưng thứ tự các dòng chưa chính xác ở dòng thứ ${i + 1}. Hãy sử dụng câu lệnh ORDER BY.`,
            details: { lineIndex: i, actualRow: actualRows[i] },
          }
        }

        return {
          isCorrect: false,
          score: 0,
          feedbackCode: SQL_CHECKER_FEEDBACK_CODES.VALUE_MISMATCH,
          feedback: `Nội dung dữ liệu ở dòng thứ ${i + 1} không chính xác.`,
          details: { lineIndex: i, actualRow: actualRows[i], expectedRow: expectedRows[i] },
        }
      }
    }
  } else {
    // Order insensitive: multiset frequency matching
    const pool = [...expectedRows]

    for (let i = 0; i < actualRows.length; i++) {
      const matchIdx = pool.findIndex((expRow) => areRowsEqual(actualRows[i], expRow, colMapping, numericTolerance))

      if (matchIdx === -1) {
        return {
          isCorrect: false,
          score: 0,
          feedbackCode: SQL_CHECKER_FEEDBACK_CODES.VALUE_MISMATCH,
          feedback: `Dữ liệu ở dòng thứ ${i + 1} không khớp với bất kỳ dòng đáp án mẫu nào.`,
          details: { lineIndex: i, actualRow: actualRows[i] },
        }
      }

      // Remove matched element from pool to handle duplicates properly
      pool.splice(matchIdx, 1)
    }
  }

  // All checks passed!
  return {
    isCorrect: true,
    score: 100,
    feedbackCode: SQL_CHECKER_FEEDBACK_CODES.SUCCESS,
    feedback: 'Xuất sắc! Kết quả truy vấn SQL hoàn toàn chính xác với đáp án vụ án.',
    details: { rowCount: actualRows.length },
  }
}
