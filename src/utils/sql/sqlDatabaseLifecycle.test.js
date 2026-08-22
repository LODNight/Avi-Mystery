import { describe, expect, it } from 'vitest'
import { SqlEngineAdapter } from './sqlEngineAdapter.js'
import { SQL_ERROR_CODES } from './sqlErrors.js'
import spikeDataset from '../../mocks/data/sql/aviation-spike.json'

// ── Fake Worker with lifecycle-aware state ────────────────────────────────────

class LifecycleFakeSqlWorker {
  constructor() {
    this.listeners = new Map()
    this.terminated = false
    this.db = null // null = not seeded
    this.lastDataset = null
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || new Set()
    listeners.add(listener)
    this.listeners.set(type, listeners)
  }

  removeEventListener(type, listener) {
    this.listeners.get(type)?.delete(listener)
  }

  emit(type, data) {
    this.listeners.get(type)?.forEach((listener) => listener({ data }))
  }

  buildSchemaFromDataset(dataset) {
    if (!dataset) return { dialect: 'sqlite', tables: [] }
    return {
      dialect: 'sqlite',
      tables: dataset.tables.map((table) => ({
        name: table.name,
        columns: table.columns.map((col) => ({
          name: col.name,
          type: col.type,
          nullable: col.nullable !== false,
          primaryKey: Boolean(col.primaryKey),
          defaultValue: null,
        })),
        sampleRows: table.rows.slice(0, 3),
      })),
    }
  }

  postMessage(message) {
    const { id, action, payload } = message

    queueMicrotask(() => {
      if (this.terminated) return

      let response = null
      let error = null

      try {
        if (action === 'initialize') {
          response = { ready: true, dialect: 'sqlite' }
        } else if (action === 'loadDataset') {
          this.lastDataset = payload
          this.db = 'seeded'
          const schema = this.buildSchemaFromDataset(payload)
          response = {
            datasetId: payload.id,
            datasetVersion: payload.version,
            schema,
          }
        } else if (action === 'getSchema') {
          if (!this.db) {
            error = { code: SQL_ERROR_CODES.ENGINE_NOT_READY, message: 'Not seeded.' }
          } else {
            response = this.buildSchemaFromDataset(this.lastDataset)
          }
        } else if (action === 'execute') {
          if (!this.db) {
            error = { code: SQL_ERROR_CODES.ENGINE_NOT_READY, message: 'Not seeded.' }
          } else {
            response = {
              columns: ['airport_code', 'name'],
              rows: [['SGN', 'Tân Sơn Nhất']],
              rowCount: 1,
              truncated: false,
              executionMs: 0.1,
              errorCode: null,
              message: null,
            }
          }
        } else if (action === 'reset') {
          if (!this.lastDataset) {
            error = { code: SQL_ERROR_CODES.ENGINE_NOT_READY, message: 'No dataset to reset.' }
          } else {
            const schema = this.buildSchemaFromDataset(this.lastDataset)
            response = { datasetId: this.lastDataset.id, datasetVersion: this.lastDataset.version, schema }
          }
        } else if (action === 'dispose') {
          this.db = null
          this.lastDataset = null
          response = { disposed: true }
        } else {
          error = { code: SQL_ERROR_CODES.RUNTIME_ERROR, message: `Unknown action: ${action}` }
        }
      } catch (err) {
        error = { code: SQL_ERROR_CODES.RUNTIME_ERROR, message: err.message }
      }

      if (error) {
        this.emit('message', { id, ok: false, error })
      } else {
        this.emit('message', { id, ok: true, data: response })
      }
    })
  }

  terminate() {
    this.terminated = true
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeEngine(options = {}) {
  return new SqlEngineAdapter({
    workerFactory: () => new LifecycleFakeSqlWorker(),
    ...options,
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('SqlEngineAdapter — Step 4.1B Database Lifecycle Tests', () => {
  it('seed → getSchema (có sampleRows) → execute → reset → schema sau reset giống seed', async () => {
    const engine = makeEngine()

    // Seed
    const loadResult = await engine.loadDataset(spikeDataset)
    expect(loadResult.datasetId).toBe(spikeDataset.id)
    expect(loadResult.schema).toMatchObject({ dialect: 'sqlite' })
    expect(loadResult.schema.tables.length).toBeGreaterThan(0)

    // Schema có sampleRows
    const schema = await engine.getSchema()
    expect(schema.dialect).toBe('sqlite')
    expect(schema.tables.length).toBeGreaterThan(0)
    schema.tables.forEach((table) => {
      expect(Array.isArray(table.sampleRows)).toBe(true)
      expect(table.sampleRows.length).toBeLessThanOrEqual(3)
    })

    // Execute
    const execResult = await engine.execute('SELECT airport_code FROM airports')
    expect(execResult.errorCode).toBeNull()
    expect(execResult.columns).toContain('airport_code')

    // Reset
    const resetResult = await engine.reset()
    expect(resetResult.datasetId).toBe(spikeDataset.id)

    // Schema sau reset giống schema ban đầu (determinism)
    const schemaAfterReset = await engine.getSchema()
    expect(schemaAfterReset.tables.map((t) => t.name)).toEqual(
      schema.tables.map((t) => t.name)
    )
    schemaAfterReset.tables.forEach((table, idx) => {
      expect(table.columns.map((c) => c.name)).toEqual(
        schema.tables[idx].columns.map((c) => c.name)
      )
    })

    await engine.dispose()
  })

  it('getSchema khi chưa loadDataset throw ENGINE_NOT_READY', async () => {
    const engine = makeEngine()
    await engine.initialize()

    await expect(engine.getSchema()).rejects.toMatchObject({
      code: SQL_ERROR_CODES.ENGINE_NOT_READY,
    })
    await engine.dispose()
  })

  it('reset khi chưa loadDataset throw ENGINE_NOT_READY', async () => {
    const engine = makeEngine()
    await engine.initialize()

    await expect(engine.reset()).rejects.toMatchObject({
      code: SQL_ERROR_CODES.ENGINE_NOT_READY,
    })
    await engine.dispose()
  })

  it('double-dispose trả { disposed: true } không throw', async () => {
    const engine = makeEngine()
    await engine.loadDataset(spikeDataset)

    const r1 = await engine.dispose()
    const r2 = await engine.dispose()

    expect(r1).toEqual({ disposed: true })
    expect(r2).toEqual({ disposed: true })
  })

  it('getSchema với sampleRowLimit: 0 trả sampleRows rỗng', async () => {
    const worker = new LifecycleFakeSqlWorker()
    const engine = new SqlEngineAdapter({ workerFactory: () => worker })
    await engine.loadDataset(spikeDataset)

    // Patch: worker returns sampleRows based on limit payload
    const origPostMessage = worker.postMessage.bind(worker)
    worker.postMessage = (message) => {
      if (message.action === 'getSchema' && message.payload?.sampleRowLimit === 0) {
        queueMicrotask(() => {
          if (worker.terminated) return
          const schema = worker.buildSchemaFromDataset(worker.lastDataset)
          const zeroSampleSchema = {
            ...schema,
            tables: schema.tables.map((t) => ({ ...t, sampleRows: [] })),
          }
          worker.emit('message', { id: message.id, ok: true, data: zeroSampleSchema })
        })
        return
      }
      origPostMessage(message)
    }

    const schema = await engine.getSchema({ sampleRowLimit: 0 })
    schema.tables.forEach((table) => {
      expect(table.sampleRows).toEqual([])
    })

    await engine.dispose()
  })

  it('schema.tables có đầy đủ column metadata (name, type, nullable, primaryKey)', async () => {
    const engine = makeEngine()
    await engine.loadDataset(spikeDataset)

    const schema = await engine.getSchema()
    expect(schema.tables.length).toBeGreaterThan(0)

    for (const table of schema.tables) {
      expect(typeof table.name).toBe('string')
      expect(Array.isArray(table.columns)).toBe(true)
      expect(Array.isArray(table.sampleRows)).toBe(true)
      for (const col of table.columns) {
        expect(typeof col.name).toBe('string')
        expect(typeof col.type).toBe('string')
        expect(typeof col.nullable).toBe('boolean')
        expect(typeof col.primaryKey).toBe('boolean')
      }
    }

    await engine.dispose()
  })

  it('full dispose chain: initialize → loadDataset → reset → dispose → initialize throws', async () => {
    const engine = makeEngine()
    await engine.initialize()
    await engine.loadDataset(spikeDataset)
    await engine.reset()
    const disposed = await engine.dispose()

    expect(disposed).toEqual({ disposed: true })

    // After dispose, further calls throw ENGINE_NOT_READY
    await expect(engine.initialize()).rejects.toMatchObject({
      code: SQL_ERROR_CODES.ENGINE_NOT_READY,
    })
  })
})
