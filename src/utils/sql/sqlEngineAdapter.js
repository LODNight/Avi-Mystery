import { cloneSqlDataset } from './sqlDataset.js'
import {
  SQL_ERROR_CODES,
  SqlEngineError,
  toSqlError,
} from './sqlErrors.js'
import { validateReadOnlyQuery } from './sqlQueryPolicy.js'

const DEFAULT_QUERY_TIMEOUT_MS = 2000
const DEFAULT_INITIALIZATION_TIMEOUT_MS = 10000
const DEFAULT_MAX_ROWS = 500

function createWorker() {
  return new Worker(
    new URL('../../workers/sql/sqlEngine.worker.js', import.meta.url),
    { type: 'module', name: 'avi-sql-engine' }
  )
}

function errorResult(error, executionMs) {
  const normalizedError = toSqlError(error)
  return {
    columns: [],
    rows: [],
    rowCount: 0,
    truncated: false,
    executionMs,
    errorCode: normalizedError.code,
    message: normalizedError.message,
  }
}

export class SqlEngineAdapter {
  constructor({
    workerFactory = createWorker,
    queryTimeoutMs = DEFAULT_QUERY_TIMEOUT_MS,
    initializationTimeoutMs = DEFAULT_INITIALIZATION_TIMEOUT_MS,
    maxRows = DEFAULT_MAX_ROWS,
  } = {}) {
    this.workerFactory = workerFactory
    this.queryTimeoutMs = queryTimeoutMs
    this.initializationTimeoutMs = initializationTimeoutMs
    this.maxRows = maxRows
    this.worker = null
    this.pendingRequests = new Map()
    this.nextRequestId = 1
    this.initialized = false
    this.disposed = false
    this.initializationPromise = null
    this.lastDataset = null

    this.handleMessage = this.handleMessage.bind(this)
    this.handleWorkerFailure = this.handleWorkerFailure.bind(this)
  }

  ensureWorker() {
    if (this.disposed) {
      throw new SqlEngineError(
        SQL_ERROR_CODES.ENGINE_NOT_READY,
        'SQL engine đã được dispose. Hãy tạo adapter mới.'
      )
    }
    if (this.worker) return

    this.worker = this.workerFactory()
    this.worker.addEventListener('message', this.handleMessage)
    this.worker.addEventListener('error', this.handleWorkerFailure)
    this.worker.addEventListener('messageerror', this.handleWorkerFailure)
  }

  handleMessage(event) {
    const { id, ok, data, error } = event.data || {}
    const pendingRequest = this.pendingRequests.get(id)
    if (!pendingRequest) return

    clearTimeout(pendingRequest.timeoutId)
    this.pendingRequests.delete(id)
    if (ok) {
      pendingRequest.resolve(data)
    } else {
      pendingRequest.reject(
        new SqlEngineError(
          error?.code || SQL_ERROR_CODES.RUNTIME_ERROR,
          error?.message || 'SQL Worker trả về lỗi không xác định.',
          error?.details || null,
          Boolean(error?.retryable)
        )
      )
    }
  }

  handleWorkerFailure(event) {
    const error = new SqlEngineError(
      SQL_ERROR_CODES.WORKER_TERMINATED,
      event?.message || 'SQL Worker đã dừng ngoài dự kiến.',
      null,
      true
    )
    this.terminateWorker(error)
  }

  request(action, payload = {}, timeoutMs = this.queryTimeoutMs) {
    this.ensureWorker()
    const id = this.nextRequestId
    this.nextRequestId += 1

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(id)
        reject(
          new SqlEngineError(
            SQL_ERROR_CODES.TIMEOUT,
            `Truy vấn SQL vượt quá giới hạn ${timeoutMs}ms.`,
            { timeoutMs },
            true
          )
        )
      }, timeoutMs)

      this.pendingRequests.set(id, { resolve, reject, timeoutId })
      this.worker.postMessage({ id, action, payload })
    })
  }

  async initialize() {
    if (this.initialized) return { ready: true, dialect: 'sqlite' }
    if (this.initializationPromise) return this.initializationPromise

    this.initializationPromise = this.request(
      'initialize',
      {},
      this.initializationTimeoutMs
    )
      .then((result) => {
        this.initialized = true
        return result
      })
      .finally(() => {
        this.initializationPromise = null
      })

    return this.initializationPromise
  }

  async loadDataset(dataset) {
    const safeDataset = cloneSqlDataset(dataset)
    await this.initialize()
    const result = await this.request(
      'loadDataset',
      safeDataset,
      this.initializationTimeoutMs
    )
    this.lastDataset = safeDataset
    return result
  }

  async getSchema({ sampleRowLimit = 3 } = {}) {
    if (!this.initialized || !this.lastDataset) {
      throw new SqlEngineError(
        SQL_ERROR_CODES.ENGINE_NOT_READY,
        'SQL engine chưa được nạp dataset.',
        null,
        true
      )
    }
    return this.request('getSchema', { sampleRowLimit })
  }

  async execute(query, options = {}) {
    const startTime = performance.now()

    try {
      if (!this.initialized || !this.lastDataset) {
        throw new SqlEngineError(
          SQL_ERROR_CODES.ENGINE_NOT_READY,
          'SQL engine chưa được nạp dataset.',
          null,
          true
        )
      }
      validateReadOnlyQuery(query)
      return await this.request(
        'execute',
        { query, maxRows: options.maxRows || this.maxRows },
        options.timeoutMs || this.queryTimeoutMs
      )
    } catch (error) {
      const normalizedError = toSqlError(error)
      if (normalizedError.code === SQL_ERROR_CODES.TIMEOUT) {
        try {
          await this.recoverWorker()
        } catch (recoveryError) {
          return errorResult(
            new SqlEngineError(
              SQL_ERROR_CODES.WORKER_TERMINATED,
              `SQL Worker không thể khôi phục sau timeout: ${recoveryError.message}`,
              null,
              true
            ),
            Math.round((performance.now() - startTime) * 100) / 100
          )
        }
      }

      return errorResult(
        normalizedError,
        Math.round((performance.now() - startTime) * 100) / 100
      )
    }
  }

  async reset() {
    if (!this.initialized || !this.lastDataset) {
      throw new SqlEngineError(
        SQL_ERROR_CODES.ENGINE_NOT_READY,
        'Chưa có SQL dataset để reset.',
        null,
        true
      )
    }
    return this.request('reset', {}, this.initializationTimeoutMs)
  }

  async recoverWorker() {
    const datasetToRestore = this.lastDataset
    this.terminateWorker()
    this.initialized = false
    this.initializationPromise = null
    await this.initialize()
    if (datasetToRestore) {
      await this.request(
        'loadDataset',
        datasetToRestore,
        this.initializationTimeoutMs
      )
      this.lastDataset = datasetToRestore
    }
  }

  terminateWorker(error = null) {
    if (this.worker) {
      this.worker.removeEventListener('message', this.handleMessage)
      this.worker.removeEventListener('error', this.handleWorkerFailure)
      this.worker.removeEventListener('messageerror', this.handleWorkerFailure)
      this.worker.terminate()
      this.worker = null
    }

    if (this.pendingRequests.size > 0) {
      const terminationError = error || new SqlEngineError(
        SQL_ERROR_CODES.WORKER_TERMINATED,
        'SQL Worker đã được khởi động lại.',
        null,
        true
      )
      this.pendingRequests.forEach((pendingRequest) => {
        clearTimeout(pendingRequest.timeoutId)
        pendingRequest.reject(terminationError)
      })
    }
    this.pendingRequests.clear()
    this.initialized = false
    this.initializationPromise = null
  }

  async dispose() {
    if (this.disposed) return { disposed: true }

    try {
      if (this.worker && this.initialized && this.pendingRequests.size === 0) {
        await this.request('dispose', {}, 1000)
      }
    } catch {
      // Ignore worker dispose request timeout/failure during teardown
    } finally {
      this.terminateWorker(
        new SqlEngineError(
          SQL_ERROR_CODES.ENGINE_NOT_READY,
          'SQL engine đã được dispose. Hãy tạo adapter mới.',
          null,
          false
        )
      )
      this.initialized = false
      this.lastDataset = null
      this.disposed = true
    }

    return { disposed: true }
  }
}

export function createSqlEngine(options) {
  return new SqlEngineAdapter(options)
}
