/**
 * tutorialCase0Content.js — Tutorial Case 0 static content definition
 *
 * Sprint 6.5 / Step 6.5.3
 *
 * Đây là nội dung RIÊNG của Tutorial onboarding — KHÔNG phải mission production.
 * Không import từ mocks/data/missions.json.
 * Không ghi vào learner progress hay XP của course thật.
 *
 * Khi Tutorial hoàn thành → onboardingService.setStatus(COMPLETED)
 *                          → progressService.grantXp(userId, TUTORIAL_XP)
 */

/**
 * Thông tin nhận dạng Tutorial Case 0.
 * Prefix "case-0" phân biệt với mission-001..009.
 */
export const TUTORIAL_ID = 'case-0';

/**
 * XP trao khi hoàn thành Tutorial (nhỏ, mang tính khích lệ).
 * Trao một lần duy nhất — onboardingService đảm bảo idempotency.
 */
export const TUTORIAL_XP = 50;

/**
 * Nội dung Tutorial Case 0.
 *
 * Mục tiêu thiết kế:
 *  - Cực kỳ đơn giản: chỉ 1 ô cần điền
 *  - Công thức = C2*D2 (nhân Số lượng × Đơn giá)
 *  - Không cần hàm phức tạp
 *  - Có scaffold hint rõ ràng ngay trong description
 */
export const TUTORIAL_CASE_0 = Object.freeze({
  id: TUTORIAL_ID,
  tool: 'excel',
  difficulty: 'tutorial',

  // ── Briefing ──────────────────────────────────────────────────────────────
  briefing: Object.freeze({
    title: 'Tính doanh thu cho đơn hàng đầu tiên',
    caseNumber: '00',
    story:
      'Sếp gọi điện: "Cho tôi biết đơn hàng ORD-001 mang về bao nhiêu tiền?" ' +
      'Bạn nhìn vào bảng tính — cột C là Số lượng, cột D là Đơn giá. ' +
      'Chỉ cần nhân hai cột này lại là ra ngay!',
    objective: 'Điền công thức vào ô E2 để tính Thành tiền của đơn hàng ORD-001.',
    hint: 'Gõ =C2*D2 vào ô E2, sau đó nhấn Enter.',
    tags: ['Tutorial', 'Excel', 'Phép nhân'],
  }),

  // ── Dataset ───────────────────────────────────────────────────────────────
  dataset: Object.freeze({
    name: 'Bảng dữ liệu Đơn hàng (Tutorial)',
    columns: Object.freeze([
      { key: 'orderId',   label: 'Mã đơn hàng', excelColumn: 'A', dataType: 'text',   editable: false },
      { key: 'product',   label: 'Sản phẩm',    excelColumn: 'B', dataType: 'text',   editable: false },
      { key: 'quantity',  label: 'Số lượng',     excelColumn: 'C', dataType: 'number', editable: false },
      { key: 'unitPrice', label: 'Đơn giá (VNĐ)', excelColumn: 'D', dataType: 'number', editable: false },
      { key: 'total',     label: 'Thành tiền (VNĐ)', excelColumn: 'E', dataType: 'number', editable: true  },
    ]),
    // Chỉ 1 dòng — giảm cognitive load tối đa
    rows: Object.freeze([
      {
        orderId:   'ORD-001',
        product:   'Chuột máy tính không dây',
        quantity:  3,
        unitPrice: 150000,
        total:     null,          // ← học viên cần điền
      },
    ]),
  }),

  // ── Workspace config ──────────────────────────────────────────────────────
  workspace: Object.freeze({
    targetSheet: 'DonHang',
    targetCell:  'E2',
    /**
     * Scaffold hint hiển thị trong FormulaBar dưới dạng placeholder.
     * Không phải đáp án — chỉ là gợi ý format.
     */
    formulaPlaceholder: '=C2*D2',
  }),

  // ── Evaluator config ──────────────────────────────────────────────────────
  evaluator: Object.freeze({
    /**
     * Câu trả lời đúng theo format string.
     * Khớp với cơ chế matchFormulaString trong excelChecker.js.
     */
    expectedFormula: '=C2*D2',

    /**
     * Giá trị số tính được khi công thức đúng: 3 × 150000 = 450000.
     * Dùng để cross-check kết quả nếu cần.
     */
    expectedValue: 450000,

    /**
     * Feedback message cho các trường hợp.
     */
    feedback: Object.freeze({
      correct:   '✅ Đúng rồi! Công thức =C2*D2 cho kết quả 450.000 VNĐ. Bạn đã biết cách dùng phép nhân trong Excel!',
      incorrect: '❌ Chưa đúng. Hãy thử nhập =C2*D2 vào ô E2. Nhớ bắt đầu bằng dấu =',
      empty:     '⚠️ Ô E2 đang trống. Hãy click vào ô E2 và nhập công thức =C2*D2.',
    }),
  }),

  // ── Spotlight steps ───────────────────────────────────────────────────────
  /**
   * Sequence cho Guided Spotlight (Step 6.5.5).
   * Mỗi bước có target element ID và nội dung hướng dẫn.
   */
  spotlightSteps: Object.freeze([
    {
      id:      'step-briefing',
      target:  '#tutorial-briefing-panel',
      title:   'Bước 1: Đọc hồ sơ vụ án',
      body:    'Đây là mô tả nhiệm vụ của bạn. Luôn đọc kỹ mục tiêu trước khi bắt đầu.',
    },
    {
      id:      'step-dataset',
      target:  '#tutorial-dataset-grid',
      body:    'Đây là bảng dữ liệu. Ô E2 (Thành tiền) đang chờ bạn điền.',
      title:   'Bước 2: Xem dữ liệu',
    },
    {
      id:      'step-formula-bar',
      target:  '#tutorial-formula-bar',
      title:   'Bước 3: Nhập công thức',
      body:    'Click vào ô E2, rồi gõ =C2*D2 vào đây. Nhấn Enter để xác nhận.',
    },
    {
      id:      'step-submit',
      target:  '#tutorial-submit-btn',
      title:   'Bước 4: Nộp bài',
      body:    'Khi đã điền xong, nhấn "Nộp bài" để kiểm tra kết quả và nhận XP.',
    },
  ]),
});

/**
 * Helper: kiểm tra câu trả lời của tutorial.
 * Trả về { isCorrect, feedback } — không import excelChecker để giữ dependency nhẹ.
 *
 * @param {string} answer — giá trị người dùng nhập (string)
 * @returns {{ isCorrect: boolean, feedback: string }}
 */
export function checkTutorialAnswer(answer) {
  const { evaluator } = TUTORIAL_CASE_0;

  if (!answer || answer.trim() === '') {
    return { isCorrect: false, feedback: evaluator.feedback.empty };
  }

  // So sánh formula string (case-insensitive, loại bỏ space)
  const normalized = answer.trim().toUpperCase().replace(/\s+/g, '');
  const expected   = evaluator.expectedFormula.toUpperCase().replace(/\s+/g, '');

  if (normalized === expected) {
    return { isCorrect: true,  feedback: evaluator.feedback.correct };
  }

  // Fallback: kiểm tra giá trị số (nếu user nhập trực tiếp 450000)
  const numericAnswer = parseFloat(answer);
  if (!isNaN(numericAnswer) && numericAnswer === evaluator.expectedValue) {
    return { isCorrect: true, feedback: evaluator.feedback.correct };
  }

  return { isCorrect: false, feedback: evaluator.feedback.incorrect };
}
