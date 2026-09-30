import { SQL_ERROR_CODES, SqlEngineError } from './sqlErrors.js'

const READ_ONLY_START_KEYWORDS = new Set(['SELECT', 'WITH'])
const MUTATION_KEYWORDS = new Set([
  'ALTER',
  'ATTACH',
  'CREATE',
  'DELETE',
  'DETACH',
  'DROP',
  'INSERT',
  'PRAGMA',
  'REINDEX',
  'REPLACE',
  'UPDATE',
  'VACUUM',
])

function scanQuery(query) {
  let sanitized = ''
  let state = 'normal'

  for (let index = 0; index < query.length; index += 1) {
    const character = query[index]
    const nextCharacter = query[index + 1]

    if (state === 'line-comment') {
      if (character === '\n') {
        state = 'normal'
        sanitized += '\n'
      } else {
        sanitized += ' '
      }
      continue
    }

    if (state === 'block-comment') {
      if (character === '*' && nextCharacter === '/') {
        state = 'normal'
        sanitized += '  '
        index += 1
      } else {
        sanitized += ' '
      }
      continue
    }

    if (state === 'single-quote') {
      if (character === "'" && nextCharacter === "'") {
        sanitized += '  '
        index += 1
      } else if (character === "'") {
        state = 'normal'
        sanitized += ' '
      } else {
        sanitized += ' '
      }
      continue
    }

    if (state === 'double-quote') {
      if (character === '"' && nextCharacter === '"') {
        sanitized += '  '
        index += 1
      } else if (character === '"') {
        state = 'normal'
        sanitized += ' '
      } else {
        sanitized += ' '
      }
      continue
    }

    if (state === 'backtick') {
      if (character === '`') state = 'normal'
      sanitized += ' '
      continue
    }

    if (state === 'bracket') {
      if (character === ']') state = 'normal'
      sanitized += ' '
      continue
    }

    if (character === '-' && nextCharacter === '-') {
      state = 'line-comment'
      sanitized += '  '
      index += 1
    } else if (character === '/' && nextCharacter === '*') {
      state = 'block-comment'
      sanitized += '  '
      index += 1
    } else if (character === "'") {
      state = 'single-quote'
      sanitized += ' '
    } else if (character === '"') {
      state = 'double-quote'
      sanitized += ' '
    } else if (character === '`') {
      state = 'backtick'
      sanitized += ' '
    } else if (character === '[') {
      state = 'bracket'
      sanitized += ' '
    } else {
      sanitized += character
    }
  }

  return { sanitized, state }
}

export function validateReadOnlyQuery(query) {
  if (typeof query !== 'string' || !query.trim()) {
    throw new SqlEngineError(
      SQL_ERROR_CODES.QUERY_REQUIRED,
      'Vui lòng nhập câu lệnh SQL.'
    )
  }

  const { sanitized, state } = scanQuery(query)
  if (!['normal', 'line-comment'].includes(state)) {
    throw new SqlEngineError(
      SQL_ERROR_CODES.SYNTAX_ERROR,
      'Câu lệnh SQL có chuỗi, định danh hoặc comment chưa được đóng.'
    )
  }

  const semicolonIndex = sanitized.indexOf(';')
  if (
    semicolonIndex !== -1 &&
    (sanitized.indexOf(';', semicolonIndex + 1) !== -1 ||
      sanitized.slice(semicolonIndex + 1).trim())
  ) {
    throw new SqlEngineError(
      SQL_ERROR_CODES.MULTIPLE_STATEMENTS,
      'Mỗi lần chỉ được chạy một câu lệnh SQL.'
    )
  }

  const statement = (semicolonIndex === -1
    ? sanitized
    : sanitized.slice(0, semicolonIndex)
  ).trim()
  const tokens = statement.match(/[A-Za-z_][A-Za-z0-9_]*/g) || []
  const keywords = tokens.map((token) => token.toUpperCase())

  if (!keywords.length) {
    throw new SqlEngineError(
      SQL_ERROR_CODES.SYNTAX_ERROR,
      'Cú pháp SQL chưa hoàn chỉnh. Hãy bắt đầu bằng SELECT hoặc WITH.'
    )
  }

  if (!READ_ONLY_START_KEYWORDS.has(keywords[0])) {
    throw new SqlEngineError(
      SQL_ERROR_CODES.READ_ONLY_VIOLATION,
      'Chỉ hỗ trợ truy vấn đọc dữ liệu bắt đầu bằng SELECT hoặc WITH. Các câu lệnh thay đổi dữ liệu không được phép.'
    )
  }

  const mutationKeyword = keywords.find((keyword) => MUTATION_KEYWORDS.has(keyword))
  if (mutationKeyword) {
    throw new SqlEngineError(
      SQL_ERROR_CODES.READ_ONLY_VIOLATION,
      `Từ khóa ${mutationKeyword} không được phép trong chế độ chỉ đọc.`,
      { keyword: mutationKeyword }
    )
  }

  return query.trim()
}

/**
 * Extracts referenced table names from a read-only SQL query (SELECT / WITH).
 * Strips comments, string literals, subqueries, and accounts for CTEs.
 *
 * @param {string} query
 * @returns {string[]} Array of lowercased referenced table names
 */
export function extractTableNames(query) {
  if (typeof query !== 'string' || !query.trim()) return []

  // 1. Remove comments and string literals
  let cleanSql = ''
  let state = 'normal'

  for (let i = 0; i < query.length; i += 1) {
    const ch = query[i]
    const next = query[i + 1]

    if (state === 'line-comment') {
      if (ch === '\n') {
        state = 'normal'
        cleanSql += '\n'
      } else {
        cleanSql += ' '
      }
      continue
    }

    if (state === 'block-comment') {
      if (ch === '*' && next === '/') {
        state = 'normal'
        cleanSql += '  '
        i += 1
      } else {
        cleanSql += ' '
      }
      continue
    }

    if (state === 'single-quote') {
      if (ch === "'" && next === "'") {
        cleanSql += '  '
        i += 1
      } else if (ch === "'") {
        state = 'normal'
        cleanSql += ' '
      } else {
        cleanSql += ' '
      }
      continue
    }

    if (ch === '-' && next === '-') {
      state = 'line-comment'
      cleanSql += '  '
      i += 1
    } else if (ch === '/' && next === '*') {
      state = 'block-comment'
      cleanSql += '  '
      i += 1
    } else if (ch === "'") {
      state = 'single-quote'
      cleanSql += ' '
    } else {
      cleanSql += ch
    }
  }

  // 2. Identify CTE aliases defined in WITH ... AS (
  const cteNames = new Set()
  const cteRegex = /\bWITH\s+([A-Za-z0-9_"`\u005B\u005D]+)\s+AS\s*\(/gi
  let cteMatch
  while ((cteMatch = cteRegex.exec(cleanSql)) !== null) {
    const rawName = cteMatch[1].replace(/["`\u005B\u005D]/g, '').toLowerCase()
    cteNames.add(rawName)
  }

  // Also match subsequent CTEs: , cte_two AS (
  const nextCteRegex = /,\s*([A-Za-z0-9_"`\u005B\u005D]+)\s+AS\s*\(/gi
  while ((cteMatch = nextCteRegex.exec(cleanSql)) !== null) {
    const rawName = cteMatch[1].replace(/["`\u005B\u005D]/g, '').toLowerCase()
    cteNames.add(rawName)
  }

  const tableNames = new Set()

  // 3. Match FROM / JOIN clauses
  const fromJoinRegex = /\b(?:FROM|JOIN)\s+([A-Za-z0-9_"`\u005B\u005D.]+)/gi
  let match
  while ((match = fromJoinRegex.exec(cleanSql)) !== null) {
    let raw = match[1].trim()
    if (raw.startsWith('(')) continue
    raw = raw.replace(/[);,\s]+$/, '')
    if (raw.includes('.')) {
      raw = raw.split('.').pop()
    }
    raw = raw.replace(/["`\u005B\u005D]/g, '').toLowerCase()
    if (raw && !cteNames.has(raw)) {
      tableNames.add(raw)
    }
  }

  // 4. Match comma-separated tables in FROM clause: FROM table1, table2
  const fromClauseRegex =
    /\bFROM\s+([^;]+?)(?=\bWHERE\b|\bGROUP\b|\bORDER\b|\bHAVING\b|\bLIMIT\b|\bJOIN\b|\bUNION\b|;|$)/gi
  let fromMatch
  while ((fromMatch = fromClauseRegex.exec(cleanSql)) !== null) {
    const clause = fromMatch[1]
    const parts = clause.split(',')
    for (let part of parts) {
      part = part.trim()
      if (!part || part.startsWith('(')) continue
      const firstToken = part.split(/\s+/)[0]
      let tableName = firstToken.trim().replace(/[);,\s]+$/, '')
      if (tableName.includes('.')) {
        tableName = tableName.split('.').pop()
      }
      tableName = tableName.replace(/["`\u005B\u005D]/g, '').toLowerCase()
      if (tableName && !cteNames.has(tableName)) {
        tableNames.add(tableName)
      }
    }
  }

  return Array.from(tableNames)
}

/**
 * Validates that all tables referenced in a query belong to the allowed table set.
 * Prevents players from manually querying hidden/future datasets.
 *
 * @param {string} query
 * @param {string[]} allowedTableNames - List of authorized table names
 * @throws {SqlEngineError} if an unauthorized/unlocked table is referenced
 */
export function validateTableScope(query, allowedTableNames = []) {
  if (!allowedTableNames || allowedTableNames.length === 0) return

  const allowedSet = new Set(
    allowedTableNames.map((name) => String(name).toLowerCase())
  )

  const referencedTables = extractTableNames(query)

  for (const table of referencedTables) {
    if (!allowedSet.has(table)) {
      throw new SqlEngineError(
        SQL_ERROR_CODES.TABLE_UNAVAILABLE || 'SQL_TABLE_UNAVAILABLE',
        `Bảng '${table}' không khả dụng hoặc chưa được mở khóa trong bước điều tra này.`,
        { table, allowedTables: Array.from(allowedSet) }
      )
    }
  }
}

