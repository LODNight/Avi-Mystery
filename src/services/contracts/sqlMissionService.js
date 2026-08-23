/**
 * Stable workspace contract for SQL missions.
 * UI consumes the selected gateway from src/services/index.js only.
 */

export const SQL_MISSION_ERROR_CODES = Object.freeze({
  MISSION_NOT_FOUND: 'MISSION_NOT_FOUND',
  MISSION_TOOL_MISMATCH: 'MISSION_TOOL_MISMATCH',
  DATASET_NOT_FOUND: 'DATASET_NOT_FOUND',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
})

/**
 * @typedef {Object} SqlMissionWorkspace
 * @property {Object} mission
 * @property {Object} dataset SQLite dataset consumed by the SQL engine.
 */

/**
 * @typedef {Object} SqlMissionServiceError
 * @property {string} code
 * @property {string} message
 * @property {boolean} retryable
 */

export const sqlMissionServiceContract = Object.freeze({
  async loadWorkspace(_missionId) {
    throw new Error('sqlMissionService.loadWorkspace not implemented')
  },
})
