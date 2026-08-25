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
    const res = await service.submit(makeRequest({ missionId: 'mission-010', tool: SUBMISSION_TOOLS.EXCEL }));

    expect(res.data).toBeNull();
    expect(res.error.code).toBe(SUBMISSION_ERROR_CODES.CONTENT_CONFIG_MISSING);
  });

  describe('Full Excel Missions Checker Configs (001 - 009)', () => {
    const ds001Sheet = {
      A2: 'ORD-001', B2: 'Chuột máy tính không dây', C2: 3, D2: 150000, E2: 450000,
      A3: 'ORD-002', B3: 'Bàn phím cơ RGB', C3: 2, D3: 450000, E3: 900000,
      A4: 'ORD-003', B4: 'Laptop Pro', C4: 1, D4: 3200000, E4: 3200000,
      A5: 'ORD-004', B5: 'Màn hình 24 inch 144Hz', C5: 5, D5: 250000, E5: 1250000,
      A6: 'ORD-005', B6: 'Cáp sạc Type-C siêu bền', C6: 10, D6: 80000, E6: 800000,
    };
    const ds002Sheet = {
      A2: 'KH-001', B2: 'Nguyễn Văn An', C2: 65000000, D2: 'VIP',
      A3: 'KH-002', B3: 'Trần Thị Bình', C3: 22000000, D3: 'Regular',
      A4: 'KH-003', B4: 'Lê Hoàng Cường', C3: 85000000, D4: 'VIP',
      A5: 'KH-004', B5: 'Phạm Minh Đức', C5: 15000000, D5: 'Regular',
    };

    const excelAnswers = [
      { id: 'mission-001', formula: '=C2*D2', expectedXp: 100, sheet: ds001Sheet },
      { id: 'mission-002', formula: '=MAX(D2:D6)', expectedXp: 120, sheet: ds001Sheet },
      { id: 'mission-003', formula: '=AVERAGE(D2:D6)', expectedXp: 100, sheet: ds001Sheet },
      { id: 'mission-004', formula: '=COUNTIF(E2:E6, ">=10000000")', expectedXp: 150, sheet: ds001Sheet },
      { id: 'mission-005', formula: '=SUMIF(B2:B6, "Laptop Pro", E2:E6)', expectedXp: 150, sheet: ds001Sheet },
      { id: 'mission-006', formula: '=IF(C2>=50000000, "VIP", "Regular")', expectedXp: 150, sheet: ds002Sheet },
      { id: 'mission-007', formula: '=VLOOKUP(A2, Customers!A2:D5, 2, 0)', expectedXp: 200, sheet: ds002Sheet },
      { id: 'mission-008', formula: '=INDEX(B2:B6, MATCH(MIN(C2:C6), C2:C6, 0))', expectedXp: 250, sheet: ds001Sheet },
      { id: 'mission-009', formula: '=SUM(E2:E6)', expectedXp: 300, sheet: ds001Sheet },
    ];

    excelAnswers.forEach((item) => {
      it(`hoàn thành xuất sắc nhiệm vụ ${item.id} với công thức ${item.formula}`, async () => {
        const service = createMockSubmissionService({ delayMs: 0 });
        const res = await service.submit(makeRequest({
          missionId: item.id,
          answer: { formula: item.formula, sheetData: item.sheet },
          clientAttemptId: `client-attempt-${item.id}`,
        }));

        expect(res.error).toBeNull();
        expect(res.data.feedback).toBeDefined();
        expect(res.data.isCorrect).toBe(true);
        expect(res.data.stepCompleted).toBe(true);
        expect(res.data.potentialXp).toBe(item.expectedXp);
      });
    });
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

  describe('SQL Tool Submissions (Step 4.7)', () => {
    const makeSqlRequest = (overrides = {}) => ({
      mode: SUBMISSION_MODES.SUBMIT,
      missionId: 'mission-010',
      tool: SUBMISSION_TOOLS.SQL,
      answer: {
        query: 'SELECT * FROM sales;',
        executionResult: {
          columns: ['id', 'order_id', 'product_name', 'branch', 'revenue'],
          rows: [
            [1, 'ORD-1001', 'Laptop Pro', 'Hà Nội', 12500000],
            [2, 'ORD-1002', 'Màn hình 27 inch', 'Hà Nội', 6200000],
            [3, 'ORD-1003', 'Laptop Pro', 'Đà Nẵng', 11800000],
            [4, 'ORD-1004', 'Chuột không dây', 'Hồ Chí Minh', 850000],
            [5, 'ORD-1005', 'Bàn phím cơ', 'Hồ Chí Minh', 2100000],
            [6, 'ORD-1006', 'Màn hình 27 inch', 'Đà Nẵng', 5900000],
            [7, 'ORD-1007', 'Laptop Pro', 'Hồ Chí Minh', 13900000],
            [8, 'ORD-1008', 'Tai nghe', 'Hà Nội', 1750000],
          ],
        },
      },
      hintsUsed: 0,
      clientAttemptId: 'client-sql-attempt-001',
      ...overrides,
    });

    it('hoàn thành vụ án SQL khi kết quả khớp 100%', async () => {
      const service = createMockSubmissionService({ delayMs: 0 });
      const res = await service.submit(makeSqlRequest());

      expect(res.error).toBeNull();
      expect(res.data.isCorrect).toBe(true);
      expect(res.data.stepCompleted).toBe(true);
      expect(res.data.missionCompleted).toBe(true);
      expect(res.data.potentialXp).toBe(100);
      expect(res.data.feedback).toMatch(/hoàn toàn chính xác/i);
    });

    it('trả kết quả chưa đạt khi câu truy vấn SQL thiếu từ khóa bắt buộc', async () => {
      const service = createMockSubmissionService({ delayMs: 0 });
      const res = await service.submit(
        makeSqlRequest({
          missionId: 'mission-011',
          answer: {
            query: 'SELECT * FROM sales;',
            executionResult: {
              columns: ['id', 'order_date', 'product_name', 'branch', 'quantity', 'revenue'],
              rows: [],
            },
          },
        })
      );

      expect(res.error).toBeNull();
      expect(res.data.isCorrect).toBe(false);
      expect(res.data.stepCompleted).toBe(false);
      expect(res.data.feedbackCode).toBe('SQL_MISSING_REQUIRED_CONSTRUCT');
      expect(res.data.feedback).toMatch(/WHERE/i);
    });

    it('báo lỗi validation khi câu truy vấn SQL để rỗng', async () => {
      const service = createMockSubmissionService({ delayMs: 0 });
      const res = await service.submit(
        makeSqlRequest({
          answer: { query: '   ' },
        })
      );

      expect(res.data).toBeNull();
      expect(res.error.code).toBe(SUBMISSION_ERROR_CODES.VALIDATION_ERROR);
    });
  });

  describe('Question Domain Submissions (Step 5.5)', () => {
    it('chấp nhận submission với questionId và trả về questionId và investigationId', async () => {
      const service = createMockSubmissionService({ delayMs: 0 });
      const res = await service.submit({
        mode: SUBMISSION_MODES.SUBMIT,
        questionId: 'q-001',
        tool: SUBMISSION_TOOLS.EXCEL,
        answer: {
          formula: '=C2*D2',
          sheetData: { C2: 3, D2: 150000 },
        },
        clientAttemptId: 'q-attempt-001',
      });

      expect(res.error).toBeNull();
      expect(res.data.isCorrect).toBe(true);
      expect(res.data.questionId).toBe('q-001');
      expect(res.data.investigationId).toBe('inv-001');
    });

    it('tự động suy ra questionId và investigationId khi submit bằng legacy missionId', async () => {
      const service = createMockSubmissionService({ delayMs: 0 });
      const res = await service.submit(makeRequest({ missionId: 'mission-001' }));

      expect(res.error).toBeNull();
      expect(res.data.questionId).toBe('q-001');
      expect(res.data.investigationId).toBe('inv-001');
    });

    it('báo lỗi khi không truyền cả missionId lẫn questionId', async () => {
      const service = createMockSubmissionService({ delayMs: 0 });
      const res = await service.submit({
        mode: SUBMISSION_MODES.SUBMIT,
        tool: SUBMISSION_TOOLS.EXCEL,
        answer: { formula: '=C2*D2' },
        clientAttemptId: 'invalid-no-id',
      });

      expect(res.data).toBeNull();
      expect(res.error.code).toBe(SUBMISSION_ERROR_CODES.VALIDATION_ERROR);
      expect(res.error.message).toMatch(/questionId hoặc missionId là bắt buộc/i);
    });
  });
});
