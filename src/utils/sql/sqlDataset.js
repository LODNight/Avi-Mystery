import { SQL_ERROR_CODES, SqlEngineError } from './sqlErrors.js'

const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/
const SQLITE_TYPES = new Set(['INTEGER', 'REAL', 'TEXT', 'BLOB', 'NUMERIC'])

function datasetError(message, details = null) {
  return new SqlEngineError(SQL_ERROR_CODES.DATASET_INVALID, message, details)
}

export function validateSqlDataset(dataset) {
  if (!dataset || typeof dataset !== 'object' || Array.isArray(dataset)) {
    throw datasetError('SQL dataset phải là một object hợp lệ.')
  }
  if (!dataset.id || typeof dataset.id !== 'string') {
    throw datasetError('SQL dataset phải có id.')
  }
  if (!Number.isInteger(dataset.version) || dataset.version < 1) {
    throw datasetError('SQL dataset phải có version là số nguyên dương.')
  }
  if (dataset.dialect !== 'sqlite') {
    throw datasetError('SQL dataset của Sprint 4 chỉ hỗ trợ dialect sqlite.')
  }
  if (!Array.isArray(dataset.tables) || dataset.tables.length === 0) {
    throw datasetError('SQL dataset phải có ít nhất một bảng.')
  }

  const tableNames = new Set()
  dataset.tables.forEach((table) => {
    if (!table || !IDENTIFIER_PATTERN.test(table.name || '')) {
      throw datasetError('Tên bảng chỉ được chứa chữ, số và dấu gạch dưới.', {
        table: table?.name,
      })
    }
    if (tableNames.has(table.name)) {
      throw datasetError(`Tên bảng ${table.name} bị trùng.`)
    }
    tableNames.add(table.name)

    if (!Array.isArray(table.columns) || table.columns.length === 0) {
      throw datasetError(`Bảng ${table.name} phải có ít nhất một cột.`)
    }

    const columnNames = new Set()
    table.columns.forEach((column) => {
      const columnType = String(column?.type || '').toUpperCase()
      if (!column || !IDENTIFIER_PATTERN.test(column.name || '')) {
        throw datasetError(`Bảng ${table.name} có tên cột không hợp lệ.`)
      }
      if (columnNames.has(column.name)) {
        throw datasetError(`Bảng ${table.name} có cột ${column.name} bị trùng.`)
      }
      if (!SQLITE_TYPES.has(columnType)) {
        throw datasetError(`Cột ${table.name}.${column.name} có kiểu dữ liệu không hỗ trợ.`)
      }
      columnNames.add(column.name)
    })

    if (!Array.isArray(table.rows)) {
      throw datasetError(`Rows của bảng ${table.name} phải là một mảng.`)
    }
    table.rows.forEach((row, rowIndex) => {
      if (!Array.isArray(row) || row.length !== table.columns.length) {
        throw datasetError(`Dòng ${rowIndex + 1} của bảng ${table.name} sai số lượng cột.`)
      }
    })
  })

  return dataset
}

export function cloneSqlDataset(dataset) {
  return JSON.parse(JSON.stringify(validateSqlDataset(dataset)))
}

