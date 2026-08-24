import { describe, expect, it, vi } from 'vitest'
import spikeDataset from '../../mocks/data/sql/aviation-spike.json'
import { SqlEngineAdapter } from './sqlEngineAdapter.js'
import { SQL_ERROR_CODES } from './sqlErrors.js'

class FakeSqlWorker {
  constructor({ hangOnFirstExecute = false, delayMap = new Map() } = {}) {
    this.listeners = new Map()
    this.terminated = false
    this.hangOnFirstExecute = hangOnFirstExecute
    this.executeCount = 0
    this.actions = []
    this.delayMap = delayMap
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

  emitError(message) {
    this.listeners.get('error')?.forEach((listener) => listener({ message }))
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

    const delay = this.delayMap.get(message.id) || 0

    const sendResponse = () => {
      if (!this.terminated) {
        this.emit('message', { id: message.id, ok: true, data: responses[message.action] })
      }
    }

    if (delay > 0) {
      setTimeout(sendResponse, delay)
    } else {
      queueMicrotask(sendResponse)
    }
  }

  terminate() {
    this.terminated = true
  }
}

describe('SqlEngineAdapter — Step 4.1A Production Transport Tests', () => {
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

  it('xử lý out-of-order responses chính xác theo request ID', async () => {
    // ID 1 (initialize): delay 50ms, ID 2 (loadDataset): delay 10ms
    const delayMap = new Map([
      [1, 50],
      [2, 10],
    ])
    const worker = new FakeSqlWorker({ delayMap })
    const engine = new SqlEngineAdapter({ workerFactory: () => worker })

    const p1 = engine.initialize()
    const p2 = engine.request('loadDataset', spikeDataset, 5000)

    // Resolution: p2 finishes at 10ms, p1 finishes at 50ms
    const res2 = await p2
    const res1 = await p1

    expect(res2).toMatchObject({ datasetId: spikeDataset.id })
    expect(res1).toEqual({ ready: true, dialect: 'sqlite' })
  })

  it('nhiều lần gọi initialize concurrent chỉ tạo 1 Worker duy nhất', async () => {
    let factoryCount = 0
    const engine = new SqlEngineAdapter({
      workerFactory: () => {
        factoryCount += 1
        return new FakeSqlWorker()
      },
    })

    const [r1, r2, r3] = await Promise.all([
      engine.initialize(),
      engine.initialize(),
      engine.initialize(),
    ])

    expect(factoryCount).toBe(1)
    expect(r1).toEqual({ ready: true, dialect: 'sqlite' })
    expect(r2).toEqual({ ready: true, dialect: 'sqlite' })
    expect(r3).toEqual({ ready: true, dialect: 'sqlite' })

    await engine.dispose()
  })

  it('xử lý Worker crash unexpected và reject pending requests', async () => {
    const worker = new FakeSqlWorker()
    const engine = new SqlEngineAdapter({ workerFactory: () => worker })

    await engine.initialize()
    const pendingQuery = engine.request('execute', { query: 'SELECT 1' }, 5000)

    worker.emitError('Fatal Worker Out Of Memory Error')

    await expect(pendingQuery).rejects.toMatchObject({
      code: SQL_ERROR_CODES.WORKER_TERMINATED,
    })
    expect(worker.terminated).toBe(true)

    await engine.dispose()
  })

  it('dispose dọn dẹp các pending requests và hủy timer không bị treo', async () => {
    const worker = new FakeSqlWorker()
    const engine = new SqlEngineAdapter({ workerFactory: () => worker })

    await engine.initialize()
    // Trigger request hangs
    const pendingQuery = engine.request('execute', { query: 'SELECT 1' }, 10000)

    const disposePromise = engine.dispose()

    await expect(pendingQuery).rejects.toMatchObject({
      code: SQL_ERROR_CODES.ENGINE_NOT_READY,
    })
    await expect(disposePromise).resolves.toEqual({ disposed: true })

    // Calling initialize after dispose throws ENGINE_NOT_READY
    await expect(engine.initialize()).rejects.toMatchObject({
      code: SQL_ERROR_CODES.ENGINE_NOT_READY,
    })
  })

  it('từ chối các truy vấn vi phạm Security Query Policy trước khi gửi sang Worker', async () => {
    const worker = new FakeSqlWorker()
    const engine = new SqlEngineAdapter({ workerFactory: () => worker })

    await engine.loadDataset(spikeDataset)

    const resMutation = await engine.execute('DELETE FROM airports')
    expect(resMutation.errorCode).toBe(SQL_ERROR_CODES.READ_ONLY_VIOLATION)
    expect(resMutation.message).toMatch(/không được phép/i)

    const resMulti = await engine.execute('SELECT 1; SELECT 2;')
    expect(resMulti.errorCode).toBe(SQL_ERROR_CODES.MULTIPLE_STATEMENTS)
    expect(resMulti.message).toMatch(/chỉ được chạy một câu lệnh/i)

    await engine.dispose()
  })
})
