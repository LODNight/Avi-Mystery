import { describe, it, expect } from 'vitest';
import {
  normalizeFormula,
  parseCellAddress,
  expandCellRange,
  analyzeExcelFormula,
  evaluateFormulaValue,
  checkExcelAnswer,
  validateGlobalExcelMission,
  EXCEL_FORMULA_ERROR_CODES,
} from './excelChecker.js';

describe('excelChecker Utility Unit Tests (SHR-EXCEL-CHECKER-001)', () => {
  describe('normalizeFormula', () => {
    it('tự động bổ sung dấu "=" nếu thiếu', () => {
      expect(normalizeFormula('SUM(B2:B10)')).toBe('=SUM(B2:B10)');
      expect(normalizeFormula('  sum(b2:b10) ')).toBe('=SUM(b2:b10)');
    });

    it('chuyển các tên hàm Excel về chữ hoa', () => {
      expect(normalizeFormula('=sum(b2:b10)')).toBe('=SUM(b2:b10)');
      expect(normalizeFormula('=sumif(a2:a10, "Tháng 3", b2:b10)')).toBe(
        '=SUMIF(a2:a10, "Tháng 3", b2:b10)'
      );
      expect(normalizeFormula('=max(e5:e20)')).toBe('=MAX(e5:e20)');
    });

    it('xử lý chuỗi rỗng hoặc dữ liệu không hợp lệ', () => {
      expect(normalizeFormula('')).toBe('');
      expect(normalizeFormula(null)).toBe('');
      expect(normalizeFormula(undefined)).toBe('');
    });
  });

  describe('parseCellAddress & expandCellRange', () => {
    it('phân tích chính xác tọa độ ô Excel', () => {
      expect(parseCellAddress('B2')).toEqual({
        colStr: 'B',
        rowNum: 2,
        colIndex: 2,
      });
      expect(parseCellAddress('A10')).toEqual({
        colStr: 'A',
        rowNum: 10,
        colIndex: 1,
      });
    });

    it('mở rộng dải ô range thành mảng các tọa độ ô', () => {
      expect(expandCellRange('B2:B5')).toEqual(['B2', 'B3', 'B4', 'B5']);
      expect(expandCellRange('A1:B2')).toEqual(['A1', 'A2', 'B1', 'B2']);
    });
  });

  describe('evaluateFormulaValue', () => {
    const sheetData = {
      B2: 10,
      B3: 20,
      B4: 30,
      B5: 40,
    };

    it('tính tổng hàm SUM chính xác', () => {
      expect(evaluateFormulaValue('=SUM(B2:B5)', sheetData)).toBe(100);
    });

    it('tính trung bình hàm AVERAGE chính xác', () => {
      expect(evaluateFormulaValue('=AVERAGE(B2:B5)', sheetData)).toBe(25);
    });

    it('tìm giá trị lớn nhất MAX và nhỏ nhất MIN chính xác', () => {
      expect(evaluateFormulaValue('=MAX(B2:B5)', sheetData)).toBe(40);
      expect(evaluateFormulaValue('=MIN(B2:B5)', sheetData)).toBe(10);
    });

    it('tính toán phép nhân ô tính như =C2*D2 chính xác', () => {
      const mathSheetData = { C2: 3, D2: 150000 };
      expect(evaluateFormulaValue('=C2*D2', mathSheetData)).toBe(450000);
      expect(evaluateFormulaValue('=C2 * D2', mathSheetData)).toBe(450000);
      expect(evaluateFormulaValue('=C2 + D2', mathSheetData)).toBe(150003);
    });
  });

  describe('analyzeExcelFormula', () => {
    const sheetData = { B2: 10, B3: 0, C2: 3, D2: 150000, A2: 'text' };

    it('không coi dấu "=" đơn lẻ là kết quả 0 hợp lệ', () => {
      const result = analyzeExcelFormula('=', sheetData);

      expect(result.valid).toBe(false);
      expect(result.value).toBeNull();
      expect(result.errorCode).toBe(EXCEL_FORMULA_ERROR_CODES.EMPTY_EXPRESSION);
      expect(evaluateFormulaValue('=', sheetData)).toBeNull();
    });

    it.each([
      ['C2*D2', EXCEL_FORMULA_ERROR_CODES.MISSING_EQUALS],
      ['=SUM(B2:B3', EXCEL_FORMULA_ERROR_CODES.UNBALANCED_PARENTHESES],
      ['=MEDIAN(B2:B3)', EXCEL_FORMULA_ERROR_CODES.UNSUPPORTED_FUNCTION],
      ['=SUM(B2:)', EXCEL_FORMULA_ERROR_CODES.INVALID_RANGE],
      ['=C2^D2', EXCEL_FORMULA_ERROR_CODES.INVALID_CHARACTER],
      ['=C2**D2', EXCEL_FORMULA_ERROR_CODES.INVALID_SYNTAX],
      ['=Z99+1', EXCEL_FORMULA_ERROR_CODES.REFERENCE_NOT_FOUND],
      ['=A2+1', EXCEL_FORMULA_ERROR_CODES.NON_NUMERIC_REFERENCE],
      ['=B2/B3', EXCEL_FORMULA_ERROR_CODES.DIVISION_BY_ZERO],
    ])('trả diagnostic ổn định cho %s', (formula, errorCode) => {
      const result = analyzeExcelFormula(formula, sheetData);

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe(errorCode);
      expect(result.message).toBeTruthy();
    });

    it('trả value và diagnostic success cho công thức hợp lệ', () => {
      expect(analyzeExcelFormula('=C2*D2', sheetData)).toMatchObject({
        valid: true,
        value: 450000,
        errorCode: null,
      });
    });
  });

  describe('checkExcelAnswer', () => {
    it('xác nhận công thức đúng khi nhập chuẩn khớp expectedFormula', () => {
      const result = checkExcelAnswer({
        userFormula: '=SUM(B2:B5)',
        expectedFormula: '=SUM(B2:B5)',
        sheetData: { B2: 10, B3: 20, B4: 30, B5: 40 },
      });

      expect(result.isCorrect).toBe(true);
      expect(result.score).toBe(100);
      expect(result.feedback).toContain('Chính xác');
    });

    it('xác nhận công thức đúng khi nhập chữ thường nhưng vẫn có dấu "="', () => {
      const result = checkExcelAnswer({
        userFormula: '=sum(b2:b5)',
        expectedFormula: '=SUM(B2:B5)',
        sheetData: { B2: 10, B3: 20, B4: 30, B5: 40 },
      });

      expect(result.isCorrect).toBe(true);
      expect(result.score).toBe(100);
    });

    it('chấp nhận danh sách nhiều công thức mẫu tương đương (expectedFormula là mảng)', () => {
      const result = checkExcelAnswer({
        userFormula: '=SUM(B2:B5)',
        expectedFormula: ['=SUM(B2:B5)', '=SUM(B2, B3, B4, B5)'],
        sheetData: { B2: 10, B3: 20, B4: 30, B5: 40 },
      });

      expect(result.isCorrect).toBe(true);
    });

    it('báo lỗi khi nhập sai công thức hoặc sai dải ô', () => {
      const result = checkExcelAnswer({
        userFormula: '=SUM(B2:B10)',
        expectedFormula: '=SUM(B2:B5)',
        sheetData: { B2: 10, B3: 20, B4: 30, B5: 40 },
      });

      expect(result.isCorrect).toBe(false);
      expect(result.score).toBe(0);
      expect(result.feedbackCode).toBe('INCORRECT_ANSWER');
    });

    it('báo lỗi chi tiết khi công thức bỏ qua dấu ngoặc', () => {
      const result = checkExcelAnswer({
        userFormula: '=SUM B2:B5',
        expectedFormula: '=SUM(B2:B5)',
      });

      expect(result.isCorrect).toBe(false);
      expect(result.feedback).toContain('ngoặc');
      expect(result.feedbackCode).toBe(EXCEL_FORMULA_ERROR_CODES.INVALID_SYNTAX);
    });

    it('trả cùng diagnostic code cho dấu "=" đơn lẻ', () => {
      const result = checkExcelAnswer({
        userFormula: '=',
        expectedFormula: '=C2*D2',
        sheetData: { C2: 3, D2: 150000 },
      });

      expect(result.isCorrect).toBe(false);
      expect(result.feedbackCode).toBe(EXCEL_FORMULA_ERROR_CODES.EMPTY_EXPRESSION);
    });
  });

  describe('validateGlobalExcelMission (Macro-Action Global Test Cases Validator)', () => {
    const sheetData = { C2: 3, D2: 150000, C3: 2, D3: 450000 };

    it('cảnh báo khi ô mục tiêu chưa có công thức', () => {
      const res = validateGlobalExcelMission({
        cellFormulas: {},
        starterCell: 'E2',
        requiredRange: ['E2', 'E3', 'E4'],
        sheetData,
      });
      expect(res.status).toBe('warning');
      expect(res.message).toContain('Ô mục tiêu E2 chưa có công thức');
    });

    it('báo lỗi khi công thức tại ô mục tiêu sai cú pháp', () => {
      const res = validateGlobalExcelMission({
        cellFormulas: { E2: '=C2*' },
        starterCell: 'E2',
        requiredRange: ['E2', 'E3', 'E4'],
        sheetData,
      });
      expect(res.status).toBe('error');
      expect(res.message).toContain('bị lỗi');
    });

    it('cảnh báo khi ô E2 đúng nhưng thiếu các hàng E3-E4 (Fill down check)', () => {
      const res = validateGlobalExcelMission({
        cellFormulas: { E2: '=C2*D2' },
        cellValues: { E2: 450000 },
        starterCell: 'E2',
        requiredRange: ['E2', 'E3', 'E4'],
        sheetData,
      });
      expect(res.status).toBe('warning');
      expect(res.message).toContain('chưa áp dụng công thức cho toàn bộ bảng');
      expect(res.message).toContain('E3');
    });

    it('trả về success khi tất cả các ô trong requiredRange đã được hoàn thành', () => {
      const res = validateGlobalExcelMission({
        cellFormulas: { E2: '=C2*D2', E3: '=C3*D3', E4: '=C4*D4' },
        cellValues: { E2: 450000, E3: 900000, E4: 3200000 },
        starterCell: 'E2',
        requiredRange: ['E2', 'E3', 'E4'],
        sheetData,
      });
      expect(res.status).toBe('success');
      expect(res.message).toContain('Kiểm tra tổng thể thành công');
    });
  });
});
