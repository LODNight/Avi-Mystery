import missionsData from '../../mocks/data/missions.json';
import { checkExcelAnswer } from '../../utils/excelChecker.js';
import { evaluateSqlResult } from '../../utils/sql/sqlChecker.js';
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

// MVP Step 3.4 Excel Checker Config
const EXCEL_CHECKER_CONFIG = Object.freeze({
  'mission-001': Object.freeze({
    expectedFormula: Object.freeze(['=C2*D2', '=D2*C2', '=PRODUCT(C2,D2)']),
    expectedValue: 450000,
  }),
});

// MVP Step 4.7 SQL Checker Config
const SQL_CHECKER_CONFIG = Object.freeze({
  'mission-010': Object.freeze({
    expectedColumns: ['id', 'order_date', 'product_name', 'branch', 'quantity', 'revenue'],
    expectedRows: [
      [1, "2026-03-01", "Thẻ Nông Dân Gold", "Hà Nội", 2, 1500000],
      [2, "2026-03-02", "Máy Gặt Đa Năng", "TP.HCM", 1, 25000000],
      [3, "2026-03-03", "Phân Bón Hữu Cơ", "Cần Thơ", 5, 450000],
      [4, "2026-03-05", "Thẻ Nông Dân Gold", "Hà Nội", 1, 750000],
      [5, "2026-03-06", "Hạt Giống Lúa Hybrid", "Đà Nẵng", 10, 1200000],
      [6, "2026-03-07", "Máy Bơm Nước Nông Nghiệp", "TP.HCM", 2, 6800000],
      [7, "2026-03-08", "Phân Bón Hữu Cơ", "Hà Nội", 8, 720000],
      [8, "2026-03-10", "Thẻ Nông Dân Gold", "Đà Nẵng", 3, 2250000],
      [9, "2026-03-12", "Hệ Thống Tưới Tự Động", "Cần Thơ", 1, 14500000],
      [10, "2026-03-15", "Hạt Giống Lúa Hybrid", "Hà Nội", 15, 1800000]
    ],
    orderMatters: false,
    columnOrderMatters: true,
    numericTolerance: 0.001,
  }),
  'mission-011': Object.freeze({
    expectedColumns: ['id', 'order_date', 'product_name', 'branch', 'quantity', 'revenue'],
    expectedRows: [
      [2, "2026-03-02", "Máy Gặt Đa Năng", "TP.HCM", 1, 25000000],
      [6, "2026-03-07", "Máy Bơm Nước Nông Nghiệp", "TP.HCM", 2, 6800000],
      [9, "2026-03-12", "Hệ Thống Tưới Tự Động", "Cần Thơ", 1, 14500000]
    ],
    orderMatters: false,
    columnOrderMatters: true,
    numericTolerance: 0.001,
    requiredConstructs: ['WHERE'],
  }),
  'mission-012': Object.freeze({
    expectedColumns: ['product_name'],
    expectedRows: [
      ["Thẻ Nông Dân Gold"],
      ["Máy Gặt Đa Năng"],
      ["Phân Bón Hữu Cơ"],
      ["Hạt Giống Lúa Hybrid"],
      ["Máy Bơm Nước Nông Nghiệp"],
      ["Hệ Thống Tưới Tự Động"]
    ],
    orderMatters: false,
    columnOrderMatters: true,
    requiredConstructs: ['DISTINCT'],
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

  if (!Object.values(SUBMISSION_TOOLS).includes(request.tool)) {
    return errorEnvelope(
      SUBMISSION_ERROR_CODES.UNSUPPORTED_TOOL,
      `Công cụ "${request.tool || 'unknown'}" chưa được hỗ trợ.`
    );
  }

  if (!request.answer || typeof request.answer !== 'object') {
    return errorEnvelope(
      SUBMISSION_ERROR_CODES.VALIDATION_ERROR,
      'Dữ liệu câu trả lời (answer) không hợp lệ.'
    );
  }

  if (request.tool === SUBMISSION_TOOLS.EXCEL) {
    if (typeof request.answer.formula !== 'string' || !request.answer.formula.trim()) {
      return errorEnvelope(
        SUBMISSION_ERROR_CODES.VALIDATION_ERROR,
        'Vui lòng nhập công thức Excel trước khi nộp bài.'
      );
    }
  }

  if (request.tool === SUBMISSION_TOOLS.SQL) {
    if (typeof request.answer.query !== 'string' || !request.answer.query.trim()) {
      return errorEnvelope(
        SUBMISSION_ERROR_CODES.VALIDATION_ERROR,
        'Vui lòng nhập câu truy vấn SQL trước khi nộp bài.'
      );
    }
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

        let checkResult = { isCorrect: false, score: 0, feedback: '', feedbackCode: '' };

        if (request.tool === SUBMISSION_TOOLS.EXCEL) {
          const checkerConfig = EXCEL_CHECKER_CONFIG[request.missionId];
          if (!checkerConfig) {
            return errorEnvelope(
              SUBMISSION_ERROR_CODES.CONTENT_CONFIG_MISSING,
              `Bài học "${request.missionId}" chưa có cấu hình chấm điểm.`
            );
          }

          checkResult = checkExcelAnswer({
            userFormula: request.answer.formula,
            expectedFormula: checkerConfig.expectedFormula,
            expectedValue: checkerConfig.expectedValue,
            sheetData: request.answer.sheetData || {},
          });
        } else if (request.tool === SUBMISSION_TOOLS.SQL) {
          const checkerConfig = SQL_CHECKER_CONFIG[request.missionId];
          if (!checkerConfig) {
            return errorEnvelope(
              SUBMISSION_ERROR_CODES.CONTENT_CONFIG_MISSING,
              `Bài học "${request.missionId}" chưa có cấu hình chấm điểm.`
            );
          }

          const actualResult = request.answer.executionResult || {
            columns: [],
            rows: [],
          };

          checkResult = evaluateSqlResult(
            actualResult,
            { columns: checkerConfig.expectedColumns, rows: checkerConfig.expectedRows },
            checkerConfig,
            request.answer.query
          );
        }

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
              : checkResult.feedbackCode || (isOfficialSubmit
                ? SUBMISSION_FEEDBACK_CODES.INCORRECT_ANSWER
                : SUBMISSION_FEEDBACK_CODES.RUN_INCORRECT),
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
