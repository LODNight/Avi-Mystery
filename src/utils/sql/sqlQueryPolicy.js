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
      'Chỉ hỗ trợ truy vấn đọc dữ liệu bắt đầu bằng SELECT hoặc WITH.'
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

