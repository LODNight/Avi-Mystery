import { describe, it, expect, beforeEach } from 'vitest';
import {
  createMockSubmissionService,
  MOCK_SUBMISSION_FAILURES,
} from './mockSubmissionService.js';
import { storage } from '../../utils/storage.js';
import {
  SUBMISSION_ERROR_CODES,
  SUBMISSION_MODES,
  SUBMISSION_TOOLS,
} from '../contracts/submissionService.js';

function makeRequest(overrides = {}) {
  return {
    mode: SUBMISSION_MODES.SUBMIT,
    missionId: 'mission-001',
    tool: SUBMISSION_TOOLS.EXCEL,
    answer: {
      formula: '=C2*D2',
      sheetData: { C2: 3, D2: 150000 },
    },
    hintsUsed: 0,
    clientAttemptId: 'client-attempt-001',
    ...overrides,
  };
}

describe('mockSubmissionService Unit Tests (Step 3.4)', () => {
  beforeEach(() => {
    storage.clear();
    storage.set('session', {
      id: 'user-001',
      name: 'Sherlock Learner',
      xp: 100,
      level: 1,
      xpToNextLevel: 1000,
    });
  });

  it('trả completion và potentialXp nhưng không cập nhật XP khi submit đúng', async () => {
    const service = createMockSubmissionService({ delayMs: 0 });
    const sessionBefore = storage.get('session');
    const res = await service.submit(makeRequest());

    expect(res.error).toBeNull();
    expect(res.data.isCorrect).toBe(true);
    expect(res.data.stepCompleted).toBe(true);
    expect(res.data.missionCompleted).toBe(true);
    expect(res.data.potentialXp).toBe(100);
    expect(res.data.attemptId).toBe('attempt-client-attempt-001');
    expect(res.data.feedback).toMatch(/chính xác/i);
    expect(res.data).not.toHaveProperty('updatedUser');
    expect(res.data).not.toHaveProperty('userLevelUp');
    expect(storage.get('session')).toEqual(sessionBefore);
  });

  it('chỉ tính phần thưởng dự kiến sau khi áp dụng hint penalty', async () => {
    const service = createMockSubmissionService({ delayMs: 0 });
    const res = await service.submit(makeRequest({ hintsUsed: 2 }));

    expect(res.data.isCorrect).toBe(true);
    expect(res.data.potentialXp).toBe(70);
    expect(storage.get('session').xp).toBe(100);
  });

  it('trả incorrect result, không completion và không potentialXp', async () => {
    const service = createMockSubmissionService({ delayMs: 0 });
    const res = await service.submit(makeRequest({
      answer: { formula: '=C2+D2', sheetData: { C2: 3, D2: 150000 } },
    }));

    expect(res.data.isCorrect).toBe(false);
    expect(res.data.stepCompleted).toBe(false);
    expect(res.data.missionCompleted).toBe(false);
    expect(res.data.potentialXp).toBe(0);
    expect(res.data.feedback).toBeDefined();
    expect(storage.get('session').xp).toBe(100);
  });

  it('mode run không hoàn thành nhiệm vụ, không có reward và không ghi history', async () => {
    const service = createMockSubmissionService({ delayMs: 0 });
    const res = await service.submit(makeRequest({ mode: SUBMISSION_MODES.RUN }));
    const history = await service.getSubmissionHistory();

    expect(res.data.isCorrect).toBe(true);
    expect(res.data.stepCompleted).toBe(false);
    expect(res.data.missionCompleted).toBe(false);
    expect(res.data.potentialXp).toBe(0);
    expect(history.data).toEqual([]);
  });

  it('trả stable validation error cho answer rỗng', async () => {
    const service = createMockSubmissionService({ delayMs: 0 });
    const res = await service.submit(makeRequest({ answer: { formula: '' } }));

    expect(res.data).toBeNull();
    expect(res.error.code).toBe(SUBMISSION_ERROR_CODES.VALIDATION_ERROR);
    expect(res.error.retryable).toBe(false);
  });

  it('trả formula diagnostic code thay vì coi dấu "=" là kết quả hợp lệ', async () => {
    const service = createMockSubmissionService({ delayMs: 0 });
    const res = await service.submit(makeRequest({
      answer: { formula: '=', sheetData: { C2: 3, D2: 150000 } },
    }));

    expect(res.error).toBeNull();
    expect(res.data.isCorrect).toBe(false);
    expect(res.data.feedbackCode).toBe('FORMULA_EMPTY_EXPRESSION');
    expect(res.data.feedback).toMatch(/đi kèm một biểu thức/i);
  });

  it('trả stable error khi không tìm thấy mission', async () => {
    const service = createMockSubmissionService({ delayMs: 0 });
    const res = await service.submit(makeRequest({ missionId: 'invalid-mission' }));

    expect(res.data).toBeNull();
    expect(res.error.code).toBe(SUBMISSION_ERROR_CODES.MISSION_NOT_FOUND);
  });

  it('không fallback sang đáp án mission mẫu khi checker config chưa tồn tại', async () => {
    const service = createMockSubmissionService({ delayMs: 0 });
    const res = await service.submit(makeRequest({ missionId: 'mission-002' }));

    expect(res.data).toBeNull();
    expect(res.error.code).toBe(SUBMISSION_ERROR_CODES.CONTENT_CONFIG_MISSING);
  });

  it('mô phỏng service error và timeout bằng error code ổn định', async () => {
    const serviceError = createMockSubmissionService({
      delayMs: 0,
      failureMode: MOCK_SUBMISSION_FAILURES.SERVICE_ERROR,
    });
    const timeout = createMockSubmissionService({
      delayMs: 0,
      failureMode: MOCK_SUBMISSION_FAILURES.TIMEOUT,
    });

    const serviceRes = await serviceError.submit(makeRequest());
    const timeoutRes = await timeout.submit(makeRequest({ clientAttemptId: 'timeout-001' }));

    expect(serviceRes.error.code).toBe(SUBMISSION_ERROR_CODES.SERVICE_UNAVAILABLE);
    expect(serviceRes.error.retryable).toBe(true);
    expect(timeoutRes.error.code).toBe(SUBMISSION_ERROR_CODES.TIMEOUT);
    expect(timeoutRes.error.retryable).toBe(true);
  });

  it('chặn cùng clientAttemptId khi request đầu tiên còn đang chạy', async () => {
    const service = createMockSubmissionService({ delayMs: 20 });
    const request = makeRequest();

    const firstRequest = service.submit(request);
    const duplicate = await service.submit(request);
    await firstRequest;

    expect(duplicate.data).toBeNull();
    expect(duplicate.error.code).toBe(SUBMISSION_ERROR_CODES.DUPLICATE_ATTEMPT);
  });

  it('replay cùng clientAttemptId trả cùng response và chỉ ghi một history record', async () => {
    const service = createMockSubmissionService({ delayMs: 0 });
    const request = makeRequest();

    const first = await service.submit(request);
    const replay = await service.submit(request);
    const history = await service.getSubmissionHistory();

    expect(replay).toEqual(first);
    expect(history.data).toHaveLength(1);
  });
});
