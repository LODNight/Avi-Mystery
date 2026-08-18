/**
 * courseService contract
 *
 * @typedef {Object} Course
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {string} description
 * @property {'excel'|'sql'} tool
 * @property {'beginner'|'intermediate'|'advanced'} difficulty
 * @property {string|null} thumbnail
 * @property {number} estimatedDuration
 * @property {number} totalChapters
 * @property {number} totalMissions
 * @property {'draft'|'published'|'archived'} status
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Chapter
 * @property {string} id
 * @property {string} courseId
 * @property {string} title
 * @property {string} description
 * @property {number} orderIndex
 * @property {string} unlockRule
 * @property {'draft'|'published'} status
 * @property {number} totalMissions
 * @property {number} estimatedDuration
 */

export const courseServiceContract = {
  /**
   * Lấy danh sách course (learner chỉ thấy published).
   * @param {{ status?: string }} filters
   * @returns {Promise<{data: Course[], error: string|null}>}
   */
  async getCourses(_filters) {
    throw new Error('courseService.getCourses not implemented');
  },

  /**
   * Lấy chi tiết 1 course theo slug hoặc id.
   * @param {string} slugOrId
   * @returns {Promise<{data: Course|null, error: string|null}>}
   */
  async getCourse(_slugOrId) {
    throw new Error('courseService.getCourse not implemented');
  },

  /**
   * Lấy danh sách chapter của 1 course.
   * @param {string} courseId
   * @returns {Promise<{data: Chapter[], error: string|null}>}
   */
  async getChaptersByCourse(_courseId) {
    throw new Error('courseService.getChaptersByCourse not implemented');
  },
};
