/**
 * Service index — Environment switch
 *
 * Đổi USE_MOCK = false khi backend sẵn sàng.
 * Component chỉ import từ đây, không import trực tiếp mock hay api.
 */
import { mockAuthService } from './mock/mockAuthService.js';
import { mockCourseService } from './mock/mockCourseService.js';
import { mockMissionService } from './mock/mockMissionService.js';
import { mockSubmissionService } from './mock/mockSubmissionService.js';

import { apiAuthService, apiCourseService, apiMissionService } from './api/index.js';
import { SUBMISSION_ERROR_CODES } from './contracts/submissionService.js';

// Đổi thành false khi kết nối backend thật
const USE_MOCK = true;

export const authService    = USE_MOCK ? mockAuthService    : apiAuthService;
export const courseService  = USE_MOCK ? mockCourseService  : apiCourseService;
export const missionService = USE_MOCK ? mockMissionService : apiMissionService;

// API submission adapter is intentionally deferred to Sprint 7. This stub keeps
// the public interface stable without silently falling back to mock data.
const unavailableApiSubmissionService = {
  async submit() {
    return {
      data: null,
      error: {
        code: SUBMISSION_ERROR_CODES.SERVICE_UNAVAILABLE,
        message: 'Submission API chưa được triển khai.',
        retryable: true,
      },
    };
  },
  async getSubmissionHistory() {
    return {
      data: null,
      error: {
        code: SUBMISSION_ERROR_CODES.SERVICE_UNAVAILABLE,
        message: 'Submission API chưa được triển khai.',
        retryable: true,
      },
    };
  },
};

export const submissionService = USE_MOCK
  ? mockSubmissionService
  : unavailableApiSubmissionService;
