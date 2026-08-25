/**
 * contentService contract
 * Handles retrieval of learning domain entity metadata & evaluation configs.
 *
 * @typedef {Object} CourseIdentity
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {'excel'|'sql'} tool
 * @property {string[]} phaseIds
 */

/**
 * @typedef {Object} PhaseIdentity
 * @property {string} id
 * @property {string} courseId
 * @property {number} orderIndex
 * @property {string} title
 * @property {string} description
 * @property {string[]} chapterIds
 */

/**
 * @typedef {Object} ChapterIdentity
 * @property {string} id
 * @property {string} phaseId
 * @property {string} courseId
 * @property {number} orderIndex
 * @property {string} title
 * @property {string} description
 * @property {string[]} investigationIds
 */

/**
 * @typedef {Object} DatasetIdentity
 * @property {string} id
 * @property {'excel'|'sql'} type
 * @property {string} name
 * @property {number} version
 */

/**
 * @typedef {Object} InvestigationIdentity
 * @property {string} id
 * @property {string} investigationId
 * @property {string} chapterId
 * @property {string} phaseId
 * @property {string} courseId
 * @property {string} datasetId
 * @property {string} title
 * @property {string} narrative
 * @property {string} story
 * @property {string} objective
 * @property {number} ordering
 * @property {string} status
 * @property {string[]} questionIds
 * @property {string} [legacyMissionId]
 */

/**
 * @typedef {Object} QuestionIdentity
 * @property {string} id
 * @property {string} questionId
 * @property {string} investigationId
 * @property {string} datasetId
 * @property {string} skillId
 * @property {'excel'|'sql'} tool
 * @property {'excel_formula'|'sql_query'|'multiple_choice'} type
 * @property {'beginner'|'intermediate'|'advanced'|'easy'|'medium'|'hard'} difficulty
 * @property {string} prompt
 * @property {Object} checkerConfig
 * @property {Object} starterContent
 * @property {Array} hints
 * @property {Object} rewards
 * @property {string} [legacyMissionId]
 */

export const contentServiceContract = {
  /**
   * Lấy chi tiết Course identity theo ID.
   * @param {string} courseId
   * @returns {Promise<{data: CourseIdentity|null, error: string|null}>}
   */
  async getCourse(_courseId) {
    throw new Error('contentService.getCourse not implemented')
  },

  /**
   * Lấy chi tiết Phase identity theo ID.
   * @param {string} phaseId
   * @returns {Promise<{data: PhaseIdentity|null, error: string|null}>}
   */
  async getPhase(_phaseId) {
    throw new Error('contentService.getPhase not implemented')
  },

  /**
   * Lấy chi tiết Chapter identity theo ID.
   * @param {string} chapterId
   * @returns {Promise<{data: ChapterIdentity|null, error: string|null}>}
   */
  async getChapter(_chapterId) {
    throw new Error('contentService.getChapter not implemented')
  },

  /**
   * Lấy chi tiết Dataset identity theo ID.
   * @param {string} datasetId
   * @returns {Promise<{data: DatasetIdentity|null, error: string|null}>}
   */
  async getDataset(_datasetId) {
    throw new Error('contentService.getDataset not implemented')
  },

  /**
   * Lấy chi tiết Investigation identity theo ID.
   * @param {string} investigationId
   * @returns {Promise<{data: InvestigationIdentity|null, error: string|null}>}
   */
  async getInvestigation(_investigationId) {
    throw new Error('contentService.getInvestigation not implemented')
  },

  /**
   * Lấy chi tiết Question identity theo ID.
   * @param {string} questionId
   * @returns {Promise<{data: QuestionIdentity|null, error: string|null}>}
   */
  async getQuestion(_questionId) {
    throw new Error('contentService.getQuestion not implemented')
  },

  /**
   * Phân giải legacy missionId sang domain entity graph.
   * @param {string} missionId
   * @returns {Promise<{data: Object|null, error: string|null}>}
   */
  async resolveLegacyMission(_missionId) {
    throw new Error('contentService.resolveLegacyMission not implemented')
  },
}
