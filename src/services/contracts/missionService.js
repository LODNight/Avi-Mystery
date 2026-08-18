/**
 * missionService contract
 *
 * @typedef {Object} Mission
 * @property {string} id
 * @property {string} chapterId
 * @property {string} courseId
 * @property {string} title
 * @property {string} story
 * @property {string} objective
 * @property {'excel'|'sql'} tool
 * @property {'easy'|'medium'|'hard'} difficulty
 * @property {number} estimatedDuration
 * @property {string} datasetId
 * @property {number} rewardXp
 * @property {number} orderIndex
 * @property {'draft'|'published'|'archived'} status
 */

export const missionServiceContract = {
  /**
   * Lấy danh sách mission của 1 chapter.
   * @param {string} chapterId
   * @returns {Promise<{data: Mission[], error: string|null}>}
   */
  async getMissionsByChapter(_chapterId) {
    throw new Error('missionService.getMissionsByChapter not implemented');
  },

  /**
   * Lấy chi tiết 1 mission.
   * @param {string} missionId
   * @returns {Promise<{data: Mission|null, error: string|null}>}
   */
  async getMission(_missionId) {
    throw new Error('missionService.getMission not implemented');
  },

  /**
   * Lấy các mission được đề xuất cho learner (dashboard).
   * @param {string} userId
   * @returns {Promise<{data: Mission[], error: string|null}>}
   */
  async getRecommendedMissions(_userId) {
    throw new Error('missionService.getRecommendedMissions not implemented');
  },
};
