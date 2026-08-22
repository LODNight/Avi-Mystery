import spikeDataset from '../../mocks/data/sql/aviation-spike.json'
import { createSqlEngine } from './sqlEngineAdapter.js'

async function runBrowserSpike() {
  const engine = createSqlEngine({ queryTimeoutMs: 2000, maxRows: 500 })

  try {
    const initialized = await engine.initialize()
    const loaded = await engine.loadDataset(spikeDataset)
    const schema = await engine.getSchema()
    const queryResult = await engine.execute(
      'SELECT flight_no, status FROM flights ORDER BY id'
    )
    const syntaxResult = await engine.execute('=')
    const limitedResult = await engine.execute(
      'SELECT code FROM airports ORDER BY id',
      { maxRows: 2 }
    )
    const resetResult = await engine.reset()
    const afterReset = await engine.execute('SELECT COUNT(*) AS total FROM flights')

    return {
      ok: true,
      initialized,
      loadedDataset: loaded.datasetId,
      tables: schema.tables.map((table) => table.name),
      queryResult,
      syntaxResult,
      limitedResult,
      resetDataset: resetResult.datasetId,
      afterReset,
    }
  } catch (error) {
    return {
      ok: false,
      errorCode: error?.code || 'SQL_BROWSER_SPIKE_FAILED',
      message: error?.message || String(error),
    }
  } finally {
    await engine.dispose()
  }
}

const output = document.querySelector('#sql-spike-result')
runBrowserSpike().then((result) => {
  output.textContent = JSON.stringify(result, null, 2)
  output.dataset.status = result.ok ? 'passed' : 'failed'
})
