export const SQL_ERROR_CODES = Object.freeze({
  ENGINE_NOT_READY: 'SQL_ENGINE_NOT_READY',
  WASM_LOAD_FAILED: 'SQL_WASM_LOAD_FAILED',
  DATASET_INVALID: 'SQL_DATASET_INVALID',
  QUERY_REQUIRED: 'SQL_QUERY_REQUIRED',
  MULTIPLE_STATEMENTS: 'SQL_MULTIPLE_STATEMENTS',
  READ_ONLY_VIOLATION: 'SQL_READ_ONLY_VIOLATION',
  SYNTAX_ERROR: 'SQL_SYNTAX_ERROR',
  RUNTIME_ERROR: 'SQL_RUNTIME_ERROR',
  TIMEOUT: 'SQL_TIMEOUT',
  RESULT_LIMIT_EXCEEDED: 'SQL_RESULT_LIMIT_EXCEEDED',
  WORKER_TERMINATED: 'SQL_WORKER_TERMINATED',
})

export class SqlEngineError extends Error {
  constructor(code, message, details = null, retryable = false) {
    super(message)
    this.name = 'SqlEngineError'
    this.code = code
    this.details = details
    this.retryable = retryable
  }
}

export function toSqlError(error, fallbackCode = SQL_ERROR_CODES.RUNTIME_ERROR) {
  if (error instanceof SqlEngineError) return error

  return new SqlEngineError(
    error?.code || fallbackCode,
    error?.message || 'Không thể thực thi thao tác SQL.',
    error?.details || null,
    Boolean(error?.retryable)
  )
}

export function serializeSqlError(error, fallbackCode) {
  const normalizedError = toSqlError(error, fallbackCode)
  return {
    code: normalizedError.code,
    message: normalizedError.message,
    details: normalizedError.details,
    retryable: normalizedError.retryable,
  }
}

