import missionsData from '../../mocks/data/missions.json'
import salesDataset from '../../mocks/data/sql/sql-sales-v1.json'
import commerceDataset from '../../mocks/data/sql/sql-commerce-v1.json'
import { SQL_MISSION_ERROR_CODES } from '../contracts/sqlMissionService.js'

const datasetsById = new Map([
  [salesDataset.id, salesDataset],
  [commerceDataset.id, commerceDataset],
])

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function failure(code, message, retryable = false) {
  return { data: null, error: { code, message, retryable } }
}

export const mockSqlMissionService = {
  async loadWorkspace(missionId) {
    const mission = missionsData.find((item) => item.id === missionId)
    if (!mission) {
      return failure(SQL_MISSION_ERROR_CODES.MISSION_NOT_FOUND, `Không tìm thấy SQL mission "${missionId}".`)
    }
    if (mission.tool !== 'sql') {
      return failure(SQL_MISSION_ERROR_CODES.MISSION_TOOL_MISMATCH, 'Mission này không sử dụng không gian học SQL.')
    }

    const dataset = datasetsById.get(mission.datasetId)
    if (!dataset) {
      return failure(SQL_MISSION_ERROR_CODES.DATASET_NOT_FOUND, `Không tìm thấy SQL dataset "${mission.datasetId}".`, true)
    }

    return {
      data: { mission: clone(mission), dataset: clone(dataset) },
      error: null,
    }
  },
}
