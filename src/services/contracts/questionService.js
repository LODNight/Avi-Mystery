/**
 * questionService contract
 * Handles retrieval and validation of Question domain entities (assessable learning units).
 *
 * @typedef {Object} QuestionHint
 * @property {string} id
 * @property {string} text
 * @property {number} [costXp]
 */

/**
 * @typedef {Object} QuestionReward
 * @property {number} baseXp
 */

/**
 * @typedef {Object} Question
 * @property {string} questionId
 * @property {string} id // Alias for compatibility
 * @property {string} investigationId
 * @property {string} datasetId
 * @property {string} skillId
 * @property {'beginner'|'intermediate'|'advanced'|'easy'|'medium'|'hard'} difficulty
 * @property {'excel_formula'|'sql_query'|'multiple_choice'} type
 * @property {string} prompt
 * @property {Object} checkerConfig
 * @property {Object} starterContent
 * @property {QuestionHint[]} hints
 * @property {QuestionReward} rewards
 * @property {string} [legacyMissionId]
 */

export const questionServiceContract = {
  /**
   * Fetch a Question entity by questionId or legacyMissionId.
   *
   * @param {string} questionId
   * @returns {Promise<{data: Question|null, error: string|null}>}
   */
  async getQuestion(_questionId) {
    throw new Error('questionService.getQuestion not implemented')
  },

  /**
   * Fetch all Question entities belonging to an Investigation.
   *
   * @param {string} investigationId
   * @returns {Promise<{data: Question[]|null, error: string|null}>}
   */
  async getQuestionsByInvestigation(_investigationId) {
    throw new Error('questionService.getQuestionsByInvestigation not implemented')
  },

  /**
   * Validate if an object conforms to a valid Question domain structure.
   *
   * @param {unknown} question
   * @returns {{valid: boolean, errors: string[]}}
   */
  validateQuestion(_question) {
    throw new Error('questionService.validateQuestion not implemented')
  },
}
