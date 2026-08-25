/**
 * datasetService contract
 * Manages first-class reusable Dataset content entities.
 *
 * @typedef {Object} DatasetMetadata
 * @property {string} name
 * @property {string} [description]
 * @property {string[]} [tags]
 */

/**
 * @typedef {Object} DatasetSchema
 * @property {'sqlite'|'excel_grid'} [dialect]
 * @property {Array} [tables] // For SQL datasets
 * @property {Array} [columns] // For Excel datasets
 * @property {Array} [rows] // For Excel datasets
 */

/**
 * @typedef {Object} Dataset
 * @property {string} datasetId
 * @property {string} id // Alias for datasetId for backwards compatibility
 * @property {number} version
 * @property {'excel'|'sql'} type
 * @property {DatasetSchema} schema
 * @property {DatasetMetadata} metadata
 * @property {string} [name] // Backward compatibility alias
 * @property {string} [dialect] // Backward compatibility alias
 * @property {Array} [tables] // Backward compatibility alias
 * @property {Array} [columns] // Backward compatibility alias
 * @property {Array} [rows] // Backward compatibility alias
 */

export const datasetServiceContract = {
  /**
   * Fetch a Dataset entity by datasetId and optional version.
   *
   * @param {string} datasetId
   * @param {number} [version]
   * @returns {Promise<{data: Dataset|null, error: string|null}>}
   */
  async getDataset(_datasetId, _version) {
    throw new Error('datasetService.getDataset not implemented')
  },

  /**
   * List available datasets filtered by optional parameters.
   *
   * @param {Object} [filter]
   * @param {'excel'|'sql'} [filter.type]
   * @returns {Promise<{data: Dataset[]|null, error: string|null}>}
   */
  async listDatasets(_filter) {
    throw new Error('datasetService.listDatasets not implemented')
  },

  /**
   * Validate if an object conforms to a valid Dataset structure.
   *
   * @param {unknown} dataset
   * @returns {{valid: boolean, errors: string[]}}
   */
  validateDataset(_dataset) {
    throw new Error('datasetService.validateDataset not implemented')
  },
}
