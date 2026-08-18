/**
 * Service index — Environment switch
 *
 * Đổi USE_MOCK = false khi backend sẵn sàng.
 * Component chỉ import từ đây, không import trực tiếp mock hay api.
 */
import { mockAuthService } from './mock/mockAuthService.js';
import { mockCourseService } from './mock/mockCourseService.js';
import { mockMissionService } from './mock/mockMissionService.js';

import { apiAuthService, apiCourseService, apiMissionService } from './api/index.js';

// Đổi thành false khi kết nối backend thật
const USE_MOCK = true;

export const authService    = USE_MOCK ? mockAuthService    : apiAuthService;
export const courseService  = USE_MOCK ? mockCourseService  : apiCourseService;
export const missionService = USE_MOCK ? mockMissionService : apiMissionService;
