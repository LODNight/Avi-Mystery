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
import { mockSqlMissionService } from './mock/mockSqlMissionService.js';
import { mockContentService } from './mock/mockContentService.js';
import { mockDatasetService } from './mock/mockDatasetService.js';
import { mockInvestigationService } from './mock/mockInvestigationService.js';
import { mockQuestionService } from './mock/mockQuestionService.js';
import { mockProgressService } from './mock/mockProgressService.js';

import { apiAuthService, apiCourseService, apiMissionService, apiSqlMissionService } from './api/index.js';
import { SUBMISSION_ERROR_CODES } from './contracts/submissionService.js';

// Đổi thành false khi kết nối backend thật
const USE_MOCK = true;

export const authService    = USE_MOCK ? mockAuthService    : apiAuthService;
export const courseService  = USE_MOCK ? mockCourseService  : apiCourseService;
export const missionService = USE_MOCK ? mockMissionService : apiMissionService;
export const sqlMissionService = USE_MOCK ? mockSqlMissionService : apiSqlMissionService;
export const contentService = USE_MOCK ? mockContentService : mockContentService;
export const datasetService = USE_MOCK ? mockDatasetService : mockDatasetService;
export const investigationService = USE_MOCK ? mockInvestigationService : mockInvestigationService;
export const questionService = USE_MOCK ? mockQuestionService : mockQuestionService;
export const progressService = USE_MOCK ? mockProgressService : mockProgressService;

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

export * as learningMapAdapter from '../domain/learningMap/learningMapAdapter.js';

// Sprint 6.5 — Onboarding Service (First-Run State)
export { onboardingService, ONBOARDING_STATUS } from '../features/onboarding/onboardingService.js';
