import { describe, expect, it } from 'vitest'
import spikeDataset from '../../mocks/data/sql/aviation-spike.json'
import { SqlEngineAdapter } from './sqlEngineAdapter.js'
import { SQL_ERROR_CODES } from './sqlErrors.js'

class FakeSqlWorker {
  constructor({ hangOnFirstExecute = false } = {}) {
    this.listeners = new Map()
    this.terminated = false
    this.hangOnFirstExecute = hangOnFirstExecute
    this.executeCount = 0
    this.actions = []
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

  postMessage(message) {
    this.actions.push(message.action)
    if (message.action === 'execute') {
      this.executeCount += 1
      if (this.hangOnFirstExecute && this.executeCount === 1) return
    }

    const responses = {
      initialize: { ready: true, dialect: 'sqlite' },
      loadDataset: {
        datasetId: spikeDataset.id,
        datasetVersion: spikeDataset.version,
        schema: { dialect: 'sqlite', tables: [{ name: 'airports', columns: [] }] },
      },
      getSchema: { dialect: 'sqlite', tables: [{ name: 'airports', columns: [] }] },
      execute: {
        columns: ['flight_no'],
        rows: [['AV101']],
        rowCount: 1,
        truncated: false,
        executionMs: 0.2,
        errorCode: null,
        message: null,
      },
      reset: { datasetId: spikeDataset.id, schema: { dialect: 'sqlite', tables: [] } },
      dispose: { disposed: true },
    }

    queueMicrotask(() => {
      if (!this.terminated) {
        this.emit('message', { id: message.id, ok: true, data: responses[message.action] })
      }
    })
  }

  terminate() {
    this.terminated = true
  }
}

describe('SqlEngineAdapter with fake Worker', () => {
  it('giữ interface initialize/load/schema/execute/reset/dispose ổn định', async () => {
    const worker = new FakeSqlWorker()
    const engine = new SqlEngineAdapter({ workerFactory: () => worker })

    await expect(engine.initialize()).resolves.toEqual({
      ready: true,
      dialect: 'sqlite',
    })
    await expect(engine.loadDataset(spikeDataset)).resolves.toMatchObject({
      datasetId: spikeDataset.id,
    })
    await expect(engine.getSchema()).resolves.toMatchObject({ dialect: 'sqlite' })
    await expect(engine.execute('SELECT flight_no FROM flights')).resolves.toMatchObject({
      columns: ['flight_no'],
      rows: [['AV101']],
      errorCode: null,
    })
    await expect(engine.reset()).resolves.toMatchObject({ datasetId: spikeDataset.id })
    await expect(engine.dispose()).resolves.toEqual({ disposed: true })

    expect(worker.actions).toEqual([
      'initialize',
      'loadDataset',
      'getSchema',
      'execute',
      'reset',
      'dispose',
    ])
    expect(worker.terminated).toBe(true)
  })

  it('trả stable error envelope trước khi engine sẵn sàng', async () => {
    const engine = new SqlEngineAdapter({ workerFactory: () => new FakeSqlWorker() })

    await expect(engine.execute('SELECT 1')).resolves.toMatchObject({
      columns: [],
      rows: [],
      errorCode: SQL_ERROR_CODES.ENGINE_NOT_READY,
    })
    await engine.dispose()
  })

  it('khôi phục Worker và dataset sau hard timeout', async () => {
    const workers = []
    const engine = new SqlEngineAdapter({
      queryTimeoutMs: 5,
      workerFactory: () => {
        const worker = new FakeSqlWorker({ hangOnFirstExecute: workers.length === 0 })
        workers.push(worker)
        return worker
      },
    })

    await engine.loadDataset(spikeDataset)
    await expect(engine.execute('SELECT * FROM flights')).resolves.toMatchObject({
      errorCode: SQL_ERROR_CODES.TIMEOUT,
    })

    expect(workers).toHaveLength(2)
    expect(workers[0].terminated).toBe(true)
    await expect(engine.execute('SELECT * FROM flights')).resolves.toMatchObject({
      errorCode: null,
      rowCount: 1,
    })
    await engine.dispose()
  })
})
