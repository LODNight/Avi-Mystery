/**
 * Contract cho dịch vụ Knowledge (Thư viện kiến thức).
 * Định nghĩa giao diện cho cả Admin (CRUD) và Learner (Read & Track Progress).
 */

export const KNOWLEDGE_ERROR_CODES = {
  NOT_FOUND: 'KNOWLEDGE_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

/**
 * Interface cho knowledgeService
 */
export const knowledgeServiceContract = {
  // --- Dành cho Learner ---
  /**
   * Lấy danh sách các topic đã publish (dành cho Learner).
   * @param {Object} filter - Điều kiện lọc (ví dụ: { tool: 'excel', category: 'basic' })
   * @returns {Promise<{ data: Array, error: Object }>}
   */
  async getPublishedTopics(filter = {}) {
    throw new Error('Not implemented');
  },

  /**
   * Lấy danh sách các topic liên quan đến 1 vụ án.
   * @param {string} missionId
   * @returns {Promise<{ data: Array, error: Object }>}
   */
  async getTopicsByMission(missionId) {
    throw new Error('Not implemented');
  },

  /**
   * Lấy thông tin chi tiết 1 topic.
   * @param {string} topicId
   * @returns {Promise<{ data: Object, error: Object }>}
   */
  async getTopicById(topicId) {
    throw new Error('Not implemented');
  },

  /**
   * Đánh dấu 1 bài học đã đọc (Learner Progress).
   * @param {string} learnerId
   * @param {string} topicId
   * @returns {Promise<{ data: Object, error: Object }>}
   */
  async markTopicAsRead(learnerId, topicId) {
    throw new Error('Not implemented');
  },

  /**
   * Lấy danh sách ID các bài học đã đọc của 1 Learner.
   * @param {string} learnerId
   * @returns {Promise<{ data: string[], error: Object }>}
   */
  async getReadTopics(learnerId) {
    throw new Error('Not implemented');
  },

  // --- Dành cho Admin ---
  /**
   * Lấy TẤT CẢ topics (cả draft và published) dành cho Admin.
   * @returns {Promise<{ data: Array, error: Object }>}
   */
  async getAllTopics() {
    throw new Error('Not implemented');
  },

  /**
   * Tạo 1 topic mới.
   * @param {Object} topicData
   * @returns {Promise<{ data: Object, error: Object }>}
   */
  async createTopic(topicData) {
    throw new Error('Not implemented');
  },

  /**
   * Cập nhật 1 topic.
   * @param {string} topicId
   * @param {Object} updates
   * @returns {Promise<{ data: Object, error: Object }>}
   */
  async updateTopic(topicId, updates) {
    throw new Error('Not implemented');
  },

  /**
   * Xóa 1 topic.
   * @param {string} topicId
   * @returns {Promise<{ data: boolean, error: Object }>}
   */
  async deleteTopic(topicId) {
    throw new Error('Not implemented');
  }
};
