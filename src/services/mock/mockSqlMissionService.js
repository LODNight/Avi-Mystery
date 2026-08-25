import missionsData from '../../mocks/data/missions.json'
import { mockDatasetService } from './mockDatasetService.js'
import { SQL_MISSION_ERROR_CODES } from '../contracts/sqlMissionService.js'

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function failure(code, message, retryable = false) {
  return { data: null, error: { code, message, retryable } }
}

export const mockSqlMissionService = {
  async loadWorkspace(missionId) {
    const mission = missionsData.find((item) => item.id === missionId || item.id === 'mission-010' && missionId === 'sql-mission-01')
    if (!mission) {
      return failure(SQL_MISSION_ERROR_CODES.MISSION_NOT_FOUND, `Không tìm thấy SQL mission "${missionId}".`)
    }
    if (mission.tool !== 'sql') {
      return failure(SQL_MISSION_ERROR_CODES.MISSION_TOOL_MISMATCH, 'Mission này không sử dụng không gian học SQL.')
    }

    const { data: dataset, error } = await mockDatasetService.getDataset(mission.datasetId)
    if (error || !dataset) {
      return failure(SQL_MISSION_ERROR_CODES.DATASET_NOT_FOUND, `Không tìm thấy SQL dataset "${mission.datasetId}".`, true)
    }

    const returnedMission = missionId === 'sql-mission-01' ? { ...clone(mission), id: 'sql-mission-01' } : clone(mission)

    return {
      data: { mission: returnedMission, dataset: clone(dataset) },
      error: null,
    }
  },
}
