import { describe, it, expect } from 'vitest';
import {
  normalizeFormula,
  parseCellAddress,
  expandCellRange,
  evaluateFormulaValue,
  checkExcelAnswer,
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
  });

  describe('checkExcelAnswer', () => {
    it('xác nhận công thức đúng khi nhập chuẩn khớp expectedFormula', () => {
      const result = checkExcelAnswer({
        userFormula: '=SUM(B2:B5)',
        expectedFormula: '=SUM(B2:B5)',
      });

      expect(result.isCorrect).toBe(true);
      expect(result.score).toBe(100);
      expect(result.feedback).toContain('Chính xác');
    });

    it('xác nhận công thức đúng ngay cả khi nhập chữ thường hoặc thiếu dấu "="', () => {
      const result = checkExcelAnswer({
        userFormula: 'sum(b2:b5)',
        expectedFormula: '=SUM(B2:B5)',
      });

      expect(result.isCorrect).toBe(true);
      expect(result.score).toBe(100);
    });

    it('chấp nhận danh sách nhiều công thức mẫu tương đương (expectedFormula là mảng)', () => {
      const result = checkExcelAnswer({
        userFormula: '=SUM(B2:B5)',
        expectedFormula: ['=SUM(B2:B5)', '=SUM(B2, B3, B4, B5)'],
      });

      expect(result.isCorrect).toBe(true);
    });

    it('báo lỗi khi nhập sai công thức hoặc sai dải ô', () => {
      const result = checkExcelAnswer({
        userFormula: '=SUM(B2:B10)',
        expectedFormula: '=SUM(B2:B5)',
      });

      expect(result.isCorrect).toBe(false);
      expect(result.score).toBe(0);
      expect(result.feedback).toContain('chưa chính xác');
    });

    it('báo lỗi chi tiết khi công thức bỏ qua dấu ngoặc', () => {
      const result = checkExcelAnswer({
        userFormula: '=SUM B2:B5',
        expectedFormula: '=SUM(B2:B5)',
      });

      expect(result.isCorrect).toBe(false);
      expect(result.feedback).toContain('ngoặc');
    });
  });
});
