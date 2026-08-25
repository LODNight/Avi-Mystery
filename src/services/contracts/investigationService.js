/**
 * investigationService contract
 * Manages Investigation narrative learning units.
 *
 * @typedef {Object} InvestigationMetadata
 * @property {'excel'|'sql'} tool
 * @property {string} [difficulty]
 */

/**
 * @typedef {Object} Investigation
 * @property {string} investigationId
 * @property {string} id // Alias for compatibility
 * @property {string} chapterId
 * @property {string} datasetId
 * @property {string} title
 * @property {string} narrative
 * @property {string} story // Alias for narrative
 * @property {string} objective
 * @property {number} ordering
 * @property {number} orderIndex // Alias for ordering
 * @property {'published'|'draft'} status
 * @property {string[]} questionIds
 * @property {string} [legacyMissionId]
 * @property {InvestigationMetadata} metadata
 */

export const investigationServiceContract = {
  /**
   * Fetch an Investigation entity by investigationId or legacyMissionId.
   *
   * @param {string} investigationId
   * @returns {Promise<{data: Investigation|null, error: string|null}>}
   */
  async getInvestigation(_investigationId) {
    throw new Error('investigationService.getInvestigation not implemented')
  },

  /**
   * Fetch all Investigation entities belonging to a Chapter.
   *
   * @param {string} chapterId
   * @returns {Promise<{data: Investigation[]|null, error: string|null}>}
   */
  async getInvestigationsByChapter(_chapterId) {
    throw new Error('investigationService.getInvestigationsByChapter not implemented')
  },

  /**
   * Validate if an object conforms to a valid Investigation domain structure.
   *
   * @param {unknown} investigation
   * @returns {{valid: boolean, errors: string[]}}
   */
  validateInvestigation(_investigation) {
    throw new Error('investigationService.validateInvestigation not implemented')
  },
}
