/**
 * Excel Answer Checker Utility (SHR-EXCEL-CHECKER-001)
 * Bộ công cụ kiểm tra & chấm điểm công thức Excel cho Learner App
 */

export const EXCEL_FORMULA_ERROR_CODES = Object.freeze({
  REQUIRED: 'FORMULA_REQUIRED',
  MISSING_EQUALS: 'FORMULA_MISSING_EQUALS',
  EMPTY_EXPRESSION: 'FORMULA_EMPTY_EXPRESSION',
  UNBALANCED_PARENTHESES: 'FORMULA_UNBALANCED_PARENTHESES',
  UNSUPPORTED_FUNCTION: 'FORMULA_UNSUPPORTED_FUNCTION',
  INVALID_RANGE: 'FORMULA_INVALID_RANGE',
  INVALID_CHARACTER: 'FORMULA_INVALID_CHARACTER',
  INVALID_SYNTAX: 'FORMULA_INVALID_SYNTAX',
  REFERENCE_NOT_FOUND: 'FORMULA_REFERENCE_NOT_FOUND',
  NON_NUMERIC_REFERENCE: 'FORMULA_NON_NUMERIC_REFERENCE',
  DIVISION_BY_ZERO: 'FORMULA_DIVISION_BY_ZERO',
});

const SUPPORTED_AGGREGATE_FUNCTIONS = Object.freeze([
  'SUM',
  'AVERAGE',
  'MAX',
  'MIN',
  'COUNT',
]);

function formulaError(code, message, normalizedFormula = '') {
  return {
    valid: false,
    value: null,
    normalizedFormula,
    errorCode: code,
    message,
  };
}

function formulaSuccess(value, normalizedFormula) {
  return {
    valid: true,
    value,
    normalizedFormula,
    errorCode: null,
    message: `Cú pháp hợp lệ. Kết quả: ${value}.`,
  };
}

function hasBalancedParentheses(expression) {
  let depth = 0;
  for (const char of expression) {
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    if (depth < 0) return false;
  }
  return depth === 0;
}

/**
 * Chuẩn hóa công thức Excel nhập vào từ người học:
 * 1. Trim khoảng trắng đầu/cuối.
 * 2. Tự động thêm dấu '=' ở đầu nếu chưa có.
 * 3. Chuyển tên các hàm Excel tiêu chuẩn thành chữ hoa (SUM, AVERAGE, MAX, MIN, COUNT, COUNTIF, SUMIF, IF, VLOOKUP, INDEX, MATCH).
 * 4. Rút gọn khoảng trắng thừa xung quanh dấu đóng/mở ngoặc, phẩy, hai chấm.
 *
 * @param {string} formula - Chuỗi công thức do người học nhập (ví dụ: "sum(b2:b10)")
 * @returns {string} Công thức đã được chuẩn hóa (ví dụ: "=SUM(B2:B10)")
 */
export function normalizeFormula(formula) {
  if (typeof formula !== 'string') return '';

  let trimmed = formula.trim();
  if (!trimmed) return '';

  // Thêm dấu '=' nếu thiếu
  if (!trimmed.startsWith('=')) {
    trimmed = '=' + trimmed;
  }

  // Tách dấu '=' ở đầu
  const prefix = '=';
  let body = trimmed.slice(1).trim();

  // Chuyển các tên hàm Excel phổ biến sang chữ hoa
  const functions = [
    'SUMIF',
    'COUNTIF',
    'SUM',
    'AVERAGE',
    'MAX',
    'MIN',
    'COUNT',
    'VLOOKUP',
    'INDEX',
    'MATCH',
    'IF',
    'AND',
    'OR',
  ];

  functions.forEach((fn) => {
    // Regex tìm tên hàm đứng trước mở ngoặc (không phân biệt hoa thường)
    const regex = new RegExp(`\\b${fn}\\b\\s*\\(`, 'gi');
    body = body.replace(regex, `${fn}(`);
  });

  // Chuẩn hóa tên ô/range: b2:b10 -> B2:B10 (ngoại trừ nội dung chuỗi trong ngoặc kép)
  // Đơn giản hóa khoảng trắng xung quanh toán tử & dấu phân cách
  body = body
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*\(\s*/g, '(')
    .replace(/\s*\)\s*/g, ')');

  return prefix + body;
}

/**
 * Chuyển tọa độ ô (ví dụ: "B2", "AA10") sang { colIndex, rowIndex }
 */
export function parseCellAddress(cell) {
  if (!cell || typeof cell !== 'string') return null;
  const match = cell.trim().toUpperCase().match(/^([A-Z]+)([0-9]+)$/);
  if (!match) return null;

  const colStr = match[1];
  const rowNum = parseInt(match[2], 10);

  let colIndex = 0;
  for (let i = 0; i < colStr.length; i++) {
    colIndex = colIndex * 26 + (colStr.charCodeAt(i) - 64);
  }

  return { colStr, rowNum, colIndex };
}

/**
 * Chuyển dải ô (ví dụ "B2:B5") thành danh sách các địa chỉ ô ["B2", "B3", "B4", "B5"]
 */
export function expandCellRange(rangeStr) {
  if (!rangeStr || typeof rangeStr !== 'string') return [];

  const parts = rangeStr.split(':');
  if (parts.length === 1) {
    return [parts[0].trim().toUpperCase()];
  }

  const start = parseCellAddress(parts[0]);
  const end = parseCellAddress(parts[1]);

  if (!start || !end) return [];

  const minCol = Math.min(start.colIndex, end.colIndex);
  const maxCol = Math.max(start.colIndex, end.colIndex);
  const minRow = Math.min(start.rowNum, end.rowNum);
  const maxRow = Math.max(start.rowNum, end.rowNum);

  const cells = [];
  for (let c = minCol; c <= maxCol; c++) {
    // Convert col index back to letter
    let temp = c;
    let colName = '';
    while (temp > 0) {
      const rem = (temp - 1) % 26;
      colName = String.fromCharCode(65 + rem) + colName;
      temp = Math.floor((temp - 1) / 26);
    }

    for (let r = minRow; r <= maxRow; r++) {
      cells.push(`${colName}${r}`);
    }
  }

  return cells;
}

/**
 * Tính toán thử nghiệm kết quả công thức đơn giản trên dữ liệu bảng tính (Grid Data)
 * Hỗ trợ các hàm: SUM, AVERAGE, MAX, MIN, COUNT
 *
 * @param {string} formula - Công thức đã chuẩn hóa
 * @param {Object} sheetData - Object chứa dữ liệu dạng { 'B2': 100, 'B3': 200 }
 * @returns {any} Giá trị tính toán được hoặc NaN/null
 */
export function analyzeExcelFormula(formula, sheetData = {}) {
  if (typeof formula !== 'string' || !formula.trim()) {
    return formulaError(
      EXCEL_FORMULA_ERROR_CODES.REQUIRED,
      'Vui lòng nhập công thức Excel.'
    );
  }

  const trimmedFormula = formula.trim();
  if (!trimmedFormula.startsWith('=')) {
    return formulaError(
      EXCEL_FORMULA_ERROR_CODES.MISSING_EQUALS,
      'Công thức Excel phải bắt đầu bằng dấu "=".'
    );
  }

  const normalizedFormula = normalizeFormula(trimmedFormula);
  const expression = normalizedFormula.slice(1).trim();
  if (!expression) {
    return formulaError(
      EXCEL_FORMULA_ERROR_CODES.EMPTY_EXPRESSION,
      'Dấu "=" phải đi kèm một biểu thức, ví dụ =C2*D2.',
      normalizedFormula
    );
  }

  if (!hasBalancedParentheses(expression)) {
    return formulaError(
      EXCEL_FORMULA_ERROR_CODES.UNBALANCED_PARENTHESES,
      'Dấu ngoặc trong công thức chưa cân bằng.',
      normalizedFormula
    );
  }

  const functionMatch = expression.match(/^([A-Z][A-Z0-9.]*)\((.*)\)$/i);
  if (functionMatch) {
    const functionName = functionMatch[1].toUpperCase();
    const rangeArgument = functionMatch[2].trim();

    if (!SUPPORTED_AGGREGATE_FUNCTIONS.includes(functionName)) {
      return formulaError(
        EXCEL_FORMULA_ERROR_CODES.UNSUPPORTED_FUNCTION,
        `Hàm ${functionName} chưa được hỗ trợ. Hiện hỗ trợ: ${SUPPORTED_AGGREGATE_FUNCTIONS.join(', ')}.`,
        normalizedFormula
      );
    }

    if (!/^[A-Z]+[1-9][0-9]*(?::[A-Z]+[1-9][0-9]*)?$/i.test(rangeArgument)) {
      return formulaError(
        EXCEL_FORMULA_ERROR_CODES.INVALID_RANGE,
        'Đối số hàm phải là một ô hoặc dải ô hợp lệ, ví dụ B2:B5.',
        normalizedFormula
      );
    }

    const cellAddresses = expandCellRange(rangeArgument);
    if (cellAddresses.length === 0) {
      return formulaError(
        EXCEL_FORMULA_ERROR_CODES.INVALID_RANGE,
        'Không thể xác định dải ô trong công thức.',
        normalizedFormula
      );
    }

    const values = [];
    for (const address of cellAddresses) {
      const rawValue = sheetData[address];
      if (rawValue === undefined || rawValue === null || rawValue === '') continue;
      const numericValue = Number(rawValue);
      if (Number.isNaN(numericValue)) {
        if (functionName === 'COUNT') continue;
        return formulaError(
          EXCEL_FORMULA_ERROR_CODES.NON_NUMERIC_REFERENCE,
          `Ô ${address} không chứa giá trị số phù hợp với hàm ${functionName}.`,
          normalizedFormula
        );
      }
      values.push(numericValue);
    }

    if (functionName !== 'COUNT' && values.length === 0) {
      return formulaError(
        EXCEL_FORMULA_ERROR_CODES.NON_NUMERIC_REFERENCE,
        'Dải ô không có giá trị số để tính toán.',
        normalizedFormula
      );
    }

    let result;
    switch (functionName) {
      case 'SUM':
        result = values.reduce((total, value) => total + value, 0);
        break;
      case 'AVERAGE':
        result = values.reduce((total, value) => total + value, 0) / values.length;
        break;
      case 'MAX':
        result = Math.max(...values);
        break;
      case 'MIN':
        result = Math.min(...values);
        break;
      case 'COUNT':
        result = values.length;
        break;
      default:
        result = null;
    }
    return formulaSuccess(result, normalizedFormula);
  }

  if (/[A-Z][A-Z0-9.]*\s*\(/i.test(expression)) {
    const functionName = expression.match(/([A-Z][A-Z0-9.]*)\s*\(/i)?.[1]?.toUpperCase();
    return formulaError(
      EXCEL_FORMULA_ERROR_CODES.UNSUPPORTED_FUNCTION,
      `Hàm ${functionName || 'này'} chưa được hỗ trợ hoặc có cú pháp không hợp lệ.`,
      normalizedFormula
    );
  }

  if (/^[A-Z][A-Z0-9.]*\s+[A-Z]+[1-9][0-9]*(?::[A-Z]+[1-9][0-9]*)?$/i.test(expression)) {
    return formulaError(
      EXCEL_FORMULA_ERROR_CODES.INVALID_SYNTAX,
      'Cú pháp hàm Excel cần dấu ngoặc, ví dụ =SUM(B2:B5).',
      normalizedFormula
    );
  }

  if (/[^A-Z0-9\s+\-*/().]/i.test(expression)) {
    return formulaError(
      EXCEL_FORMULA_ERROR_CODES.INVALID_CHARACTER,
      'Công thức chứa ký tự hoặc toán tử chưa được hỗ trợ.',
      normalizedFormula
    );
  }

  if (/\*\*|\/\/|\+\+|--|[+\-*/]\s*$/.test(expression)) {
    return formulaError(
      EXCEL_FORMULA_ERROR_CODES.INVALID_SYNTAX,
      'Thứ tự toán tử trong công thức không hợp lệ.',
      normalizedFormula
    );
  }

  let referenceError = null;
  const replacedExpression = expression.replace(/\b([A-Z]+[1-9][0-9]*)\b/gi, (match) => {
    const address = match.toUpperCase();
    if (!Object.prototype.hasOwnProperty.call(sheetData, address)) {
      referenceError = formulaError(
        EXCEL_FORMULA_ERROR_CODES.REFERENCE_NOT_FOUND,
        `Không tìm thấy ô tham chiếu ${address} trong bảng dữ liệu.`,
        normalizedFormula
      );
      return '0';
    }

    const numericValue = Number(sheetData[address]);
    if (Number.isNaN(numericValue)) {
      referenceError = formulaError(
        EXCEL_FORMULA_ERROR_CODES.NON_NUMERIC_REFERENCE,
        `Ô ${address} không chứa giá trị số để tính toán.`,
        normalizedFormula
      );
      return '0';
    }
    return String(numericValue);
  });

  if (referenceError) return referenceError;

  if (!/^[0-9\s+\-*/().]+$/.test(replacedExpression)) {
    return formulaError(
      EXCEL_FORMULA_ERROR_CODES.INVALID_SYNTAX,
      'Cú pháp công thức không hợp lệ hoặc chưa được hỗ trợ.',
      normalizedFormula
    );
  }

  try {
    // Chuỗi đã bị giới hạn chỉ còn số, ngoặc và toán tử số học ở trên.
    // eslint-disable-next-line no-new-func
    const result = new Function(`"use strict"; return (${replacedExpression})`)();
    if (typeof result !== 'number' || Number.isNaN(result)) {
      return formulaError(
        EXCEL_FORMULA_ERROR_CODES.INVALID_SYNTAX,
        'Không thể tính kết quả từ cú pháp công thức này.',
        normalizedFormula
      );
    }
    if (!Number.isFinite(result)) {
      return formulaError(
        EXCEL_FORMULA_ERROR_CODES.DIVISION_BY_ZERO,
        'Công thức phát sinh lỗi chia cho 0.',
        normalizedFormula
      );
    }
    return formulaSuccess(result, normalizedFormula);
  } catch (_error) {
    return formulaError(
      EXCEL_FORMULA_ERROR_CODES.INVALID_SYNTAX,
      'Cú pháp công thức không hợp lệ. Hãy kiểm tra toán tử và dấu ngoặc.',
      normalizedFormula
    );
  }
}

export function evaluateFormulaValue(formula, sheetData = {}) {
  const diagnostic = analyzeExcelFormula(formula, sheetData);
  return diagnostic.valid ? diagnostic.value : null;
}

/**
 * Đánh giá bài nộp công thức Excel của người học
 *
 * @param {Object} options
 * @param {string} options.userFormula - Công thức do người học nhập vào
 * @param {string|string[]} options.expectedFormula - Công thức mẫu (hoặc mảng công thức hợp lệ)
 * @param {number|string} [options.expectedValue] - Giá trị kết quả mong đợi (nếu có)
 * @param {Object} [options.sheetData] - Dữ liệu ô tính hiện tại
 * @returns {Object} { isCorrect: boolean, score: number, userFormulaNormalized: string, feedback: string }
 */
export function checkExcelAnswer({
  userFormula,
  expectedFormula,
  expectedValue,
  sheetData = {},
}) {
  if (!userFormula || typeof userFormula !== 'string' || !userFormula.trim()) {
    return {
      isCorrect: false,
      score: 0,
      userFormulaNormalized: '',
      feedbackCode: EXCEL_FORMULA_ERROR_CODES.REQUIRED,
      feedback: 'Vui lòng nhập công thức Excel vào ô tính bài làm.',
    };
  }

  const userNorm = normalizeFormula(userFormula);
  const diagnostic = analyzeExcelFormula(userFormula, sheetData);
  if (!diagnostic.valid) {
    return {
      isCorrect: false,
      score: 0,
      userFormulaNormalized: diagnostic.normalizedFormula,
      feedbackCode: diagnostic.errorCode,
      feedback: diagnostic.message,
    };
  }

  // Chuyển expectedFormula thành mảng danh sách các công thức chấp nhận được
  const expectedFormulasList = Array.isArray(expectedFormula)
    ? expectedFormula.map(normalizeFormula)
    : [normalizeFormula(expectedFormula)];

  // 1. Kiểm tra khớp chính xác với công thức mẫu đã chuẩn hóa
  const isFormulaMatch = expectedFormulasList.some((expNorm) => {
    // So sánh không phân biệt ký tự hoa thường hoặc hoa cả 2
    return (
      userNorm.toUpperCase() === expNorm.toUpperCase() ||
      userNorm.replace(/\s+/g, '') === expNorm.replace(/\s+/g, '')
    );
  });

  if (isFormulaMatch) {
    return {
      isCorrect: true,
      score: 100,
      userFormulaNormalized: userNorm,
      feedbackCode: 'CORRECT_ANSWER',
      feedback: 'Chính xác! Công thức của bạn hoàn toàn hợp lệ và chính xác.',
    };
  }

  // 2. Nếu không khớp chuỗi công thức chính xác, kiểm tra giá trị tính toán (Calculated Value Check)
  if (expectedValue !== undefined && expectedValue !== null) {
    if (Number(diagnostic.value) === Number(expectedValue)) {
      return {
        isCorrect: true,
        score: 100,
        userFormulaNormalized: userNorm,
        feedbackCode: 'CORRECT_ANSWER',
        feedback: 'Chính xác! Kết quả tính toán của công thức đạt yêu cầu.',
      };
    }
  }

  return {
    isCorrect: false,
    score: 0,
    userFormulaNormalized: userNorm,
    feedbackCode: 'INCORRECT_ANSWER',
    feedback: 'Công thức hợp lệ nhưng chưa cho ra đáp án yêu cầu. Hãy kiểm tra lại phép tính và các ô tham chiếu.',
  };
}

/**
 * Kiểm tra toàn bộ điều kiện Vụ án (Global Pre-check / Test Cases Validator)
 * Phục vụ cho nút "Chạy thử công thức" (Macro-action)
 *
 * @param {Object} options
 * @param {Object} [options.cellFormulas] - Danh sách công thức do học viên đã nhập { 'E2': '=C2*D2', 'E3': '=C3*D3' }
 * @param {Object} [options.cellValues] - Giá trị ô tính đã được tính toán { 'E2': 450000 }
 * @param {string} [options.starterCell] - Ô tính mục tiêu khởi đầu (ví dụ 'E2')
 * @param {string[]} [options.requiredRange] - Dải ô yêu cầu hoàn thành (ví dụ ['E2', 'E3', 'E4', 'E5', 'E6'])
 * @param {Object} [options.sheetData] - Dữ liệu bảng tính hiện tại
 * @returns {Object} { status: 'success'|'warning'|'error', title: string, message: string }
 */
export function validateGlobalExcelMission({
  cellFormulas = {},
  cellValues = {},
  starterCell = 'E2',
  requiredRange = [],
  sheetData = {},
}) {
  const targetCellKey = (starterCell || 'E2').trim().toUpperCase();
  const starterFormula = cellFormulas[targetCellKey];

  // 1. Kiểm tra nếu chưa nhập công thức ở ô mục tiêu
  if (!starterFormula || !starterFormula.trim()) {
    return {
      status: 'warning',
      title: 'Chưa có công thức tại ô mục tiêu',
      message: `Ô mục tiêu ${targetCellKey} chưa có công thức. Hãy chọn ô ${targetCellKey} và nhập công thức tính toán vào thanh fx.`,
      feedbackCode: EXCEL_FORMULA_ERROR_CODES.REQUIRED,
    };
  }

  // 2. Kiểm tra cú pháp của ô mục tiêu
  const starterDiagnostic = analyzeExcelFormula(starterFormula, sheetData);
  if (!starterDiagnostic.valid) {
    return {
      status: 'error',
      title: 'Công thức chưa đúng cú pháp',
      message: `Công thức tại ô ${targetCellKey} bị lỗi: ${starterDiagnostic.message}`,
      feedbackCode: starterDiagnostic.errorCode,
    };
  }

  // 3. Kiểm tra quét toàn bộ điều kiện Vụ án (Fill down / Complete Dataset Check)
  if (Array.isArray(requiredRange) && requiredRange.length > 1) {
    const missingCells = requiredRange.filter((cell) => {
      const cellKey = cell.toUpperCase();
      const hasFormula = Boolean(cellFormulas[cellKey] && cellFormulas[cellKey].trim());
      const hasValue =
        cellValues[cellKey] !== undefined &&
        cellValues[cellKey] !== null &&
        cellValues[cellKey] !== '';
      return !hasFormula && !hasValue;
    });

    if (missingCells.length > 0) {
      const filledCount = requiredRange.length - missingCells.length;
      return {
        status: 'warning',
        title: 'Chưa áp dụng công thức cho toàn bộ bảng',
        message: `Công thức ở ô ${targetCellKey} chính xác! Tuy nhiên, bạn mới hoàn thành ${filledCount}/${requiredRange.length} hàng. Các ô còn lại (${missingCells.slice(0, 3).join(', ')}${missingCells.length > 3 ? '...' : ''}) chưa có công thức. Hãy kéo (Fill down) hoặc điền công thức cho các ô còn lại!`,
        feedbackCode: 'INCOMPLETE_REQUIRED_RANGE',
      };
    }

    for (const cell of requiredRange) {
      const cellKey = cell.toUpperCase();
      const formula = cellFormulas[cellKey];
      if (!formula || !formula.trim()) continue;

      const diagnostic = analyzeExcelFormula(formula, sheetData);
      if (!diagnostic.valid) {
        return {
          status: 'error',
          title: `Công thức tại ô ${cellKey} chưa đúng cú pháp`,
          message: `Công thức tại ô ${cellKey} bị lỗi: ${diagnostic.message}`,
          feedbackCode: diagnostic.errorCode,
        };
      }
    }
  }

  // 4. Toàn bộ ô yêu cầu đã hợp lệ
  return {
    status: 'success',
    title: 'Kiểm tra tổng thể thành công',
    message: `Cú pháp tại ô ${targetCellKey} và dữ liệu toàn bảng đã hợp lệ! Bạn đã sẵn sàng bấm nút "Nộp bài vụ án".`,
    feedbackCode: 'GLOBAL_VALIDATION_SUCCESS',
  };
}

/**
 * Tự động dịch chuyển các ô tham chiếu trong công thức Excel khi Fill Down
 * Ví dụ: shiftFormulaRows("=C2*D2", 2, 3) → "=C3*D3"
 * Ví dụ: shiftFormulaRows("=SUM(C2:D2)", 2, 4) → "=SUM(C4:D4)"
 * Ví dụ: shiftFormulaRows("=C$2*D2", 2, 3) → "=C$2*D3" (giữ nguyên hàng có dấu $)
 *
 * @param {string} formula - Công thức gốc (ví dụ "=C2*D2")
 * @param {number} sourceRow - Hàng gốc (ví dụ 2)
 * @param {number} targetRow - Hàng đích (ví dụ 3)
 * @returns {string} Công thức đã được dịch chuyển hàng tương ứng
 */
export function shiftFormulaRows(formula, sourceRow, targetRow) {
  if (!formula || typeof formula !== 'string') return '';
  const delta = targetRow - sourceRow;
  if (delta === 0) return formula;

  return formula.replace(
    /(^|[^A-Z0-9_$])(\$?[A-Z]+)(\$?)([0-9]+)/gi,
    (match, prefix, colPart, rowDollar, rowNumStr) => {
      // Nếu có dấu $ trước số hàng ($2) -> Khóa hàng tuyệt đối, không dịch chuyển
      if (rowDollar === '$') {
        return match;
      }
      const originalRowNum = parseInt(rowNumStr, 10);
      const newRowNum = originalRowNum + delta;

      if (newRowNum < 1) return match;
      return `${prefix}${colPart}${newRowNum}`;
    }
  );
}


