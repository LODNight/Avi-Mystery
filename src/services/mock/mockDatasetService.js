import excelDatasets from '../../mocks/data/datasets.json'
import sqlSalesDataset from '../../mocks/data/sql/sql-sales-v1.json'
import sqlCommerceDataset from '../../mocks/data/sql/sql-commerce-v1.json'
import aviationSpikeDataset from '../../mocks/data/sql/aviation-spike.json'

const ALL_RAW_DATASETS = [
  ...excelDatasets,
  sqlSalesDataset,
  sqlCommerceDataset,
  aviationSpikeDataset,
]

function clone(val) {
  return JSON.parse(JSON.stringify(val))
}

export function normalizeDataset(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null

  const datasetId = raw.datasetId || raw.id
  if (!datasetId || typeof datasetId !== 'string') return null

  const type = raw.type || (raw.tables || raw.schema?.tables ? 'sql' : 'excel')
  const version = Number.isInteger(raw.version) && raw.version >= 1 ? raw.version : 1
  const name = raw.metadata?.name || raw.name || datasetId
  const description = raw.metadata?.description || raw.description || ''

  const metadata = {
    name,
    description,
    tags: Array.isArray(raw.metadata?.tags || raw.tags) ? raw.metadata?.tags || raw.tags : [],
  }

  let schema = {}
  if (type === 'excel') {
    const columns = raw.schema?.columns || raw.columns || []
    const rows = raw.schema?.rows || raw.rows || []
    schema = { columns, rows }
  } else {
    const dialect = raw.schema?.dialect || raw.dialect || 'sqlite'
    const tables = raw.schema?.tables || raw.tables || []
    schema = { dialect, tables }
  }

  return {
    datasetId,
    id: datasetId,
    version,
    type,
    schema,
    metadata,
    // Root level aliases for legacy compatibility
    name,
    ...(type === 'excel'
      ? { columns: schema.columns, rows: schema.rows }
      : { dialect: schema.dialect, tables: schema.tables }),
  }
}

export function createMockDatasetService() {
  const datasetRegistry = new Map()

  ALL_RAW_DATASETS.forEach((raw) => {
    const normalized = normalizeDataset(raw)
    if (normalized) {
      datasetRegistry.set(normalized.datasetId, normalized)
    }
  })

  return {
    async getDataset(datasetId, version = null) {
      const dataset = datasetRegistry.get(datasetId)
      if (!dataset) {
        return { data: null, error: `Không tìm thấy dataset "${datasetId}".` }
      }

      if (version !== null && version !== undefined && dataset.version !== version) {
        return {
          data: null,
          error: `Phiên bản dataset ${version} không phù hợp với phiên bản hiện tại (${dataset.version}) của "${datasetId}".`,
        }
      }

      return { data: clone(dataset), error: null }
    },

    async listDatasets(filter = {}) {
      let list = Array.from(datasetRegistry.values())

      if (filter.type) {
        list = list.filter((d) => d.type === filter.type)
      }

      return { data: clone(list), error: null }
    },

    validateDataset(dataset) {
      const errors = []
      if (!dataset || typeof dataset !== 'object' || Array.isArray(dataset)) {
        return { valid: false, errors: ['Dataset phải là một object hợp lệ.'] }
      }

      const datasetId = dataset.datasetId || dataset.id
      if (!datasetId || typeof datasetId !== 'string') {
        errors.push('Dataset phải có datasetId (hoặc id) dạng chuỗi.')
      }

      if (!Number.isInteger(dataset.version) || dataset.version < 1) {
        errors.push('Dataset phải có version là số nguyên dương.')
      }

      if (dataset.type !== 'excel' && dataset.type !== 'sql') {
        errors.push('Dataset type phải là "excel" hoặc "sql".')
      }

      const schema = dataset.schema || dataset
      if (!schema || typeof schema !== 'object') {
        errors.push('Dataset phải chứa schema hợp lệ.')
      } else if (dataset.type === 'excel') {
        if (!Array.isArray(schema.columns) && !Array.isArray(dataset.columns)) {
          errors.push('Excel dataset phải chứa mảng columns.')
        }
        if (!Array.isArray(schema.rows) && !Array.isArray(dataset.rows)) {
          errors.push('Excel dataset phải chứa mảng rows.')
        }
      } else if (dataset.type === 'sql') {
        const dialect = schema.dialect || dataset.dialect
        if (dialect !== 'sqlite') {
          errors.push('SQL dataset chỉ hỗ trợ dialect "sqlite".')
        }
        const tables = schema.tables || dataset.tables
        if (!Array.isArray(tables) || tables.length === 0) {
          errors.push('SQL dataset phải chứa mảng tables có ít nhất 1 bảng.')
        }
      }

      return { valid: errors.length === 0, errors }
    },
  }
}

export const mockDatasetService = createMockDatasetService()
