/**
 * Excel Answer Checker Utility (SHR-EXCEL-CHECKER-001)
 * Bộ công cụ kiểm tra & chấm điểm công thức Excel cho Learner App
 */

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
export function evaluateFormulaValue(formula, sheetData = {}) {
  const norm = normalizeFormula(formula);
  if (!norm.startsWith('=')) return null;

  const expr = norm.slice(1);

  // Match hàm đơn giản: SUM(B2:B5), MAX(E2:E10), AVERAGE(C1:C4)
  const simpleFuncMatch = expr.match(/^(SUM|AVERAGE|MAX|MIN|COUNT)\(([^)]+)\)$/i);
  if (simpleFuncMatch) {
    const funcName = simpleFuncMatch[1].toUpperCase();
    const rangeArg = simpleFuncMatch[2];

    const cellAddresses = expandCellRange(rangeArg);
    const values = cellAddresses
      .map((addr) => {
        const val = sheetData[addr];
        const num = Number(val);
        return isNaN(num) ? null : num;
      })
      .filter((v) => v !== null);

    if (values.length === 0) return 0;

    switch (funcName) {
      case 'SUM':
        return values.reduce((a, b) => a + b, 0);
      case 'AVERAGE':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'MAX':
        return Math.max(...values);
      case 'MIN':
        return Math.min(...values);
      case 'COUNT':
        return values.length;
      default:
        return null;
    }
  }

  // Nếu là công thức chứa giá trị trực tiếp hoặc biểu thức số đơn giản
  if (!isNaN(Number(expr))) {
    return Number(expr);
  }

  // 3. Đánh giá biểu thức toán học giữa các ô tính (Ví dụ: C2*D2, C2+D2, C2/10)
  try {
    // Tách và thay thế các địa chỉ ô tính (A1, B2, C10...) bằng giá trị số trong sheetData
    const replacedExpr = expr.replace(/\b([A-Z]+[0-9]+)\b/gi, (match) => {
      const addr = match.toUpperCase();
      const val = sheetData[addr];
      const num = Number(val);
      return isNaN(num) ? '0' : String(num);
    });

    // An toàn: Chỉ cho phép chữ số, khoảng trắng và các toán tử +, -, *, /, (, ), .
    if (/^[0-9\s\+\-\*\/\(\)\.]+$/.test(replacedExpr)) {
      // eslint-disable-next-line no-new-func
      const result = new Function(`"use strict"; return (${replacedExpr})`)();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        return result;
      }
    }
  } catch (_err) {
    return null;
  }

  return null;
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
      feedback: 'Vui lòng nhập công thức Excel vào ô tính bài làm.',
    };
  }

  const userNorm = normalizeFormula(userFormula);

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
      feedback: 'Chính xác! Công thức của bạn hoàn toàn hợp lệ và chính xác.',
    };
  }

  // 2. Nếu không khớp chuỗi công thức chính xác, kiểm tra giá trị tính toán (Calculated Value Check)
  if (expectedValue !== undefined && expectedValue !== null) {
    const computedVal = evaluateFormulaValue(userNorm, sheetData);
    if (computedVal !== null && Number(computedVal) === Number(expectedValue)) {
      return {
        isCorrect: true,
        score: 100,
        userFormulaNormalized: userNorm,
        feedback: 'Chính xác! Kết quả tính toán của công thức đạt yêu cầu.',
      };
    }
  }

  // 3. Phân tích lỗi sai phổ biến để phản hồi hướng dẫn (Diagnostic Feedback)
  let feedback = 'Công thức chưa chính xác. Vui lòng kiểm tra lại tên hàm và dải ô chọn.';

  if (!userFormula.trim().startsWith('=')) {
    feedback = 'Công thức Excel phải bắt đầu bằng dấu "=" (Ví dụ: =SUM(B2:B10)).';
  } else if (!userNorm.includes('(') || !userNorm.includes(')')) {
    feedback = 'Thiếu dấu ngoặc đơn () trong cú pháp hàm Excel.';
  }

  return {
    isCorrect: false,
    score: 0,
    userFormulaNormalized: userNorm,
    feedback,
  };
}
