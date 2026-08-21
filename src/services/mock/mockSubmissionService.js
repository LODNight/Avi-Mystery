import missionsData from '../../mocks/data/missions.json';
import { checkExcelAnswer } from '../../utils/excelChecker.js';
import { storage } from '../../utils/storage.js';
import {
  SUBMISSION_ERROR_CODES,
  SUBMISSION_FEEDBACK_CODES,
  SUBMISSION_MODES,
  SUBMISSION_TOOLS,
} from '../contracts/submissionService.js';

const SUBMISSIONS_KEY = 'submission_history';
const DEFAULT_DELAY_MS = 25;

export const MOCK_SUBMISSION_FAILURES = Object.freeze({
  SERVICE_ERROR: 'service_error',
  TIMEOUT: 'timeout',
});

// MVP Step 3.4 supports one verified Excel vertical slice. Missions without a
// checker config fail explicitly instead of silently using another mission's answer.
const EXCEL_CHECKER_CONFIG = Object.freeze({
  'mission-001': Object.freeze({
    expectedFormula: Object.freeze(['=C2*D2', '=D2*C2', '=PRODUCT(C2,D2)']),
    expectedValue: 450000,
  }),
});

function delay(ms) {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function errorEnvelope(code, message, retryable = false) {
  return {
    data: null,
    error: { code, message, retryable },
  };
}

function validateRequest(request) {
  if (!request || typeof request !== 'object') {
    return errorEnvelope(
      SUBMISSION_ERROR_CODES.VALIDATION_ERROR,
      'Yêu cầu nộp bài không hợp lệ.'
    );
  }

  if (!Object.values(SUBMISSION_MODES).includes(request.mode)) {
    return errorEnvelope(
      SUBMISSION_ERROR_CODES.VALIDATION_ERROR,
      'Submission mode phải là "run" hoặc "submit".'
    );
  }

  if (!request.missionId || typeof request.missionId !== 'string') {
    return errorEnvelope(
      SUBMISSION_ERROR_CODES.VALIDATION_ERROR,
      'missionId là bắt buộc.'
    );
  }

  if (!request.clientAttemptId || typeof request.clientAttemptId !== 'string') {
    return errorEnvelope(
      SUBMISSION_ERROR_CODES.VALIDATION_ERROR,
      'clientAttemptId là bắt buộc.'
    );
  }

  if (request.tool !== SUBMISSION_TOOLS.EXCEL) {
    return errorEnvelope(
      SUBMISSION_ERROR_CODES.UNSUPPORTED_TOOL,
      `Công cụ "${request.tool || 'unknown'}" chưa được hỗ trợ trong Step 3.4.`
    );
  }

  if (
    !request.answer ||
    typeof request.answer !== 'object' ||
    typeof request.answer.formula !== 'string' ||
    !request.answer.formula.trim()
  ) {
    return errorEnvelope(
      SUBMISSION_ERROR_CODES.VALIDATION_ERROR,
      'Vui lòng nhập công thức Excel trước khi nộp bài.'
    );
  }

  return null;
}

/**
 * Factory exposes deterministic delay/failure seams for tests while keeping the
 * public adapter interface identical to the future API client.
 */
export function createMockSubmissionService({
  delayMs = DEFAULT_DELAY_MS,
  failureMode = null,
} = {}) {
  const inFlightAttemptIds = new Set();
  const completedResponses = new Map();

  return {
    async submit(request) {
      const validationError = validateRequest(request);
      if (validationError) return validationError;

      const { clientAttemptId } = request;
      if (completedResponses.has(clientAttemptId)) {
        return completedResponses.get(clientAttemptId);
      }

      if (inFlightAttemptIds.has(clientAttemptId)) {
        return errorEnvelope(
          SUBMISSION_ERROR_CODES.DUPLICATE_ATTEMPT,
          'Lượt nộp bài này đang được xử lý.',
          false
        );
      }

      inFlightAttemptIds.add(clientAttemptId);

      try {
        await delay(delayMs);

        if (failureMode === MOCK_SUBMISSION_FAILURES.SERVICE_ERROR) {
          return errorEnvelope(
            SUBMISSION_ERROR_CODES.SERVICE_UNAVAILABLE,
            'Dịch vụ nộp bài tạm thời không khả dụng.',
            true
          );
        }

        if (failureMode === MOCK_SUBMISSION_FAILURES.TIMEOUT) {
          return errorEnvelope(
            SUBMISSION_ERROR_CODES.TIMEOUT,
            'Yêu cầu nộp bài đã hết thời gian chờ.',
            true
          );
        }

        const mission = missionsData.find((item) => item.id === request.missionId);
        if (!mission) {
          return errorEnvelope(
            SUBMISSION_ERROR_CODES.MISSION_NOT_FOUND,
            `Không tìm thấy bài học "${request.missionId}".`
          );
        }

        const checkerConfig = EXCEL_CHECKER_CONFIG[request.missionId];
        if (!checkerConfig) {
          return errorEnvelope(
            SUBMISSION_ERROR_CODES.CONTENT_CONFIG_MISSING,
            `Bài học "${request.missionId}" chưa có cấu hình chấm điểm.`
          );
        }

        const checkResult = checkExcelAnswer({
          userFormula: request.answer.formula,
          expectedFormula: checkerConfig.expectedFormula,
          expectedValue: checkerConfig.expectedValue,
          sheetData: request.answer.sheetData || {},
        });

        const isOfficialSubmit = request.mode === SUBMISSION_MODES.SUBMIT;
        const isCompleted = isOfficialSubmit && checkResult.isCorrect;
        const hintsUsed = Math.max(0, Number(request.hintsUsed) || 0);
        const hintPenalty = hintsUsed * 15;
        const potentialXp = isCompleted
          ? Math.max(0, (mission.rewardXp || 0) - hintPenalty)
          : 0;
        const attemptId = `attempt-${clientAttemptId}`;

        const response = {
          data: {
            attemptId,
            isCorrect: checkResult.isCorrect,
            score: checkResult.score,
            stepCompleted: isCompleted,
            missionCompleted: isCompleted,
            potentialXp,
            feedbackCode: checkResult.isCorrect
              ? isOfficialSubmit
                ? SUBMISSION_FEEDBACK_CODES.CORRECT_ANSWER
                : SUBMISSION_FEEDBACK_CODES.RUN_CORRECT
              : isOfficialSubmit
                ? SUBMISSION_FEEDBACK_CODES.INCORRECT_ANSWER
                : SUBMISSION_FEEDBACK_CODES.RUN_INCORRECT,
            feedback: checkResult.feedback,
          },
          error: null,
        };

        if (isOfficialSubmit) {
          const submissions = storage.get(SUBMISSIONS_KEY) || [];
          submissions.push({
            attemptId,
            clientAttemptId,
            missionId: request.missionId,
            stepId: request.stepId || null,
            tool: request.tool,
            mode: request.mode,
            isCorrect: checkResult.isCorrect,
            score: checkResult.score,
            submittedAt: new Date().toISOString(),
          });
          storage.set(SUBMISSIONS_KEY, submissions);
        }

        completedResponses.set(clientAttemptId, response);
        return response;
      } finally {
        inFlightAttemptIds.delete(clientAttemptId);
      }
    },

    async getSubmissionHistory() {
      await delay(delayMs);
      return { data: storage.get(SUBMISSIONS_KEY) || [], error: null };
    },
  };
}

export const mockSubmissionService = createMockSubmissionService();
