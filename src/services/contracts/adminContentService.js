/**
 * adminContentService contract
 * Manages Content Authoring Studio CRUD operations for Courses, Chapters, Missions, Datasets,
 * and handles Learning Map Read Model synchronization upon publication.
 *
 * @typedef {Object} AdminMissionInput
 * @property {string} [id]
 * @property {string} courseId
 * @property {string} chapterId
 * @property {string} title
 * @property {string} story
 * @property {string} objective
 * @property {'excel'|'sql'} tool
 * @property {'easy'|'medium'|'hard'|'beginner'|'intermediate'|'advanced'} difficulty
 * @property {number} estimatedDuration
 * @property {string} datasetId
 * @property {number} rewardXp
 * @property {number} [orderIndex]
 * @property {'draft'|'published'} status
 * @property {Object} starterContent
 * @property {Object} [checkerConfig]
 * @property {Array<{id: string, text: string, penaltyXp?: number}>} [hints]
 */

export const adminContentServiceContract = {
  // ── Courses ──
  async getCourses() {
    throw new Error('adminContentService.getCourses not implemented');
  },
  async getCourse(_courseId) {
    throw new Error('adminContentService.getCourse not implemented');
  },
  async saveCourse(_courseData) {
    throw new Error('adminContentService.saveCourse not implemented');
  },
  async deleteCourse(_courseId) {
    throw new Error('adminContentService.deleteCourse not implemented');
  },

  // ── Chapters ──
  async getChapters(_courseId) {
    throw new Error('adminContentService.getChapters not implemented');
  },
  async getChapter(_chapterId) {
    throw new Error('adminContentService.getChapter not implemented');
  },
  async saveChapter(_chapterData) {
    throw new Error('adminContentService.saveChapter not implemented');
  },
  async deleteChapter(_chapterId) {
    throw new Error('adminContentService.deleteChapter not implemented');
  },

  // ── Missions ──
  async getMissions(_filters) {
    throw new Error('adminContentService.getMissions not implemented');
  },
  async getMission(_missionId) {
    throw new Error('adminContentService.getMission not implemented');
  },
  async saveMission(_missionData) {
    throw new Error('adminContentService.saveMission not implemented');
  },
  async deleteMission(_missionId) {
    throw new Error('adminContentService.deleteMission not implemented');
  },
  async toggleMissionStatus(_missionId) {
    throw new Error('adminContentService.toggleMissionStatus not implemented');
  },
  async duplicateMission(_missionId) {
    throw new Error('adminContentService.duplicateMission not implemented');
  },

  // ── Datasets ──
  async getDatasets() {
    throw new Error('adminContentService.getDatasets not implemented');
  },
  async getDataset(_datasetId) {
    throw new Error('adminContentService.getDataset not implemented');
  },
  async saveDataset(_datasetData) {
    throw new Error('adminContentService.saveDataset not implemented');
  },
  async deleteDataset(_datasetId) {
    throw new Error('adminContentService.deleteDataset not implemented');
  },

  // ── Publish & Synchronization ──
  async publishCourse(_courseId) {
    throw new Error('adminContentService.publishCourse not implemented');
  },
};
