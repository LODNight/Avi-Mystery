import initSqlJs from 'sql.js'
import sqlWasmUrl from 'sql.js/dist/sql-wasm-browser.wasm?url'
import { validateSqlDataset } from '../../utils/sql/sqlDataset.js'
import {
  SQL_ERROR_CODES,
  SqlEngineError,
  serializeSqlError,
} from '../../utils/sql/sqlErrors.js'
import { validateReadOnlyQuery } from '../../utils/sql/sqlQueryPolicy.js'

let SQL = null
let database = null
let activeDataset = null

function quoteIdentifier(identifier) {
  return `"${identifier.replaceAll('"', '""')}"`
}

async function initialize() {
  if (SQL) return { ready: true, dialect: 'sqlite' }

  try {
    SQL = await initSqlJs({ locateFile: () => sqlWasmUrl })
    return { ready: true, dialect: 'sqlite' }
  } catch (error) {
    throw new SqlEngineError(
      SQL_ERROR_CODES.WASM_LOAD_FAILED,
      'Không thể khởi tạo SQLite WebAssembly.',
      { cause: error?.message },
      true
    )
  }
}

function closeDatabase() {
  if (database) database.close()
  database = null
}

function seedTable(table) {
  const columnDefinitions = table.columns.map((column) => {
    const constraints = []
    if (column.primaryKey) constraints.push('PRIMARY KEY')
    if (column.nullable === false) constraints.push('NOT NULL')
    return `${quoteIdentifier(column.name)} ${column.type.toUpperCase()} ${constraints.join(' ')}`.trim()
  })

  database.run(
    `CREATE TABLE ${quoteIdentifier(table.name)} (${columnDefinitions.join(', ')})`
  )

  if (!table.rows.length) return

  const placeholders = table.columns.map(() => '?').join(', ')
  const statement = database.prepare(
    `INSERT INTO ${quoteIdentifier(table.name)} VALUES (${placeholders})`
  )
  try {
    table.rows.forEach((row) => statement.run(row))
  } finally {
    statement.free()
  }
}

async function loadDataset(dataset) {
  validateSqlDataset(dataset)
  await initialize()
  closeDatabase()
  database = new SQL.Database()

  try {
    database.run('BEGIN')
    dataset.tables.forEach(seedTable)
    database.run('COMMIT')
    activeDataset = JSON.parse(JSON.stringify(dataset))
  } catch (error) {
    try {
      database.run('ROLLBACK')
    } catch (_rollbackError) {
      // The original seed error is more useful than a rollback failure.
    }
    closeDatabase()
    throw new SqlEngineError(
      SQL_ERROR_CODES.DATASET_INVALID,
      'Không thể nạp SQL dataset vào SQLite.',
      { cause: error?.message }
    )
  }

  return {
    datasetId: dataset.id,
    datasetVersion: dataset.version,
    schema: getSchema(),
  }
}

function assertDatabaseReady() {
  if (!database) {
    throw new SqlEngineError(
      SQL_ERROR_CODES.ENGINE_NOT_READY,
      'SQL engine chưa được nạp dataset.',
      null,
      true
    )
  }
}

function getSchema({ sampleRowLimit = 3 } = {}) {
  assertDatabaseReady()
  const safeLimit = Number.isInteger(sampleRowLimit)
    ? Math.min(Math.max(sampleRowLimit, 0), 10)
    : 3

  const tablesResult = database.exec(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  )
  const tableNames = tablesResult[0]?.values.map(([name]) => name) || []

  return {
    dialect: 'sqlite',
    tables: tableNames.map((tableName) => {
      const pragmaResult = database.exec(
        `PRAGMA table_info(${quoteIdentifier(tableName)})`
      )
      const columnMeta = pragmaResult[0]?.values || []

      // Fetch sample rows for Schema Browser preview
      let sampleRows = []
      if (safeLimit > 0) {
        try {
          const sampleResult = database.exec(
            `SELECT * FROM ${quoteIdentifier(tableName)} LIMIT ${safeLimit}`
          )
          sampleRows = sampleResult[0]?.values || []
        } catch {
          sampleRows = []
        }
      }

      return {
        name: tableName,
        columns: columnMeta.map(([, name, type, notNull, defaultValue, primaryKey]) => ({
          name,
          type,
          nullable: !Boolean(notNull),
          primaryKey: Boolean(primaryKey),
          defaultValue,
        })),
        sampleRows,
      }
    }),
  }
}

function mapExecutionError(error) {
  if (error instanceof SqlEngineError) return error

  const message = error?.message || 'SQLite không thể thực thi truy vấn.'
  const isSyntaxError = /syntax error|incomplete input|unrecognized token|unterminated/i.test(
    message
  )
  return new SqlEngineError(
    isSyntaxError ? SQL_ERROR_CODES.SYNTAX_ERROR : SQL_ERROR_CODES.RUNTIME_ERROR,
    isSyntaxError
      ? `Cú pháp SQL không hợp lệ: ${message}`
      : `Không thể chạy truy vấn SQL: ${message}`
  )
}

function execute({ query, maxRows = 500 }) {
  assertDatabaseReady()
  const normalizedQuery = validateReadOnlyQuery(query)
  const safeMaxRows = Number.isInteger(maxRows)
    ? Math.min(Math.max(maxRows, 1), 5000)
    : 500
  const startTime = performance.now()
  let statement

  try {
    statement = database.prepare(normalizedQuery)
    const columns = statement.getColumnNames()
    const rows = []
    let truncated = false

    while (statement.step()) {
      if (rows.length >= safeMaxRows) {
        truncated = true
        break
      }
      rows.push(statement.get())
    }

    return {
      columns,
      rows,
      rowCount: rows.length,
      truncated,
      executionMs: Math.round((performance.now() - startTime) * 100) / 100,
      errorCode: truncated ? SQL_ERROR_CODES.RESULT_LIMIT_EXCEEDED : null,
      message: truncated
        ? `Kết quả đã được giới hạn ở ${safeMaxRows} dòng.`
        : null,
    }
  } catch (error) {
    throw mapExecutionError(error)
  } finally {
    statement?.free()
  }
}

async function reset() {
  if (!activeDataset) {
    throw new SqlEngineError(
      SQL_ERROR_CODES.ENGINE_NOT_READY,
      'Chưa có SQL dataset để reset.',
      null,
      true
    )
  }
  return loadDataset(activeDataset)
}

function dispose() {
  closeDatabase()
  activeDataset = null
  SQL = null
  return { disposed: true }
}

const actions = { initialize, loadDataset, getSchema, execute, reset, dispose }

self.addEventListener('message', async (event) => {
  const { id, action, payload } = event.data || {}
  const handler = actions[action]

  if (!handler) {
    self.postMessage({
      id,
      ok: false,
      error: serializeSqlError(
        new SqlEngineError(SQL_ERROR_CODES.RUNTIME_ERROR, `Worker action ${action} không hợp lệ.`)
      ),
    })
    return
  }

  try {
    const data = await handler(payload || {})
    self.postMessage({ id, ok: true, data })
  } catch (error) {
    self.postMessage({ id, ok: false, error: serializeSqlError(error) })
  }
})
