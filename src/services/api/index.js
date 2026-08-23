/**
 * API adapter stubs — chưa implement.
 * Cấu trúc đặt sẵn để sau này thay mock bằng fetch/axios.
 */

export const apiAuthService = {
  async login(_credentials) {
    throw new Error('API not implemented yet. Use mock adapter.');
  },
  async logout() {
    throw new Error('API not implemented yet.');
  },
  async getCurrentUser() {
    throw new Error('API not implemented yet.');
  },
};

export const apiCourseService = {
  async getCourses(_filters) {
    throw new Error('API not implemented yet.');
  },
  async getCourse(_slugOrId) {
    throw new Error('API not implemented yet.');
  },
  async getChaptersByCourse(_courseId) {
    throw new Error('API not implemented yet.');
  },
};

export const apiMissionService = {
  async getMissionsByChapter(_chapterId) {
    throw new Error('API not implemented yet.');
  },
  async getMission(_missionId) {
    throw new Error('API not implemented yet.');
  },
  async getRecommendedMissions(_userId) {
    throw new Error('API not implemented yet.');
  },
};

export const apiSqlMissionService = {
  async loadWorkspace(_missionId) {
    return {
      data: null,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'SQL Mission API chưa được triển khai.',
        retryable: true,
      },
    };
  },
};
