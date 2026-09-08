/**
 * Default Sandbox Datasets & Presets for Academy Mode (Sprint 9.5)
 * Cung cấp dataset chuẩn và các ví dụ thực hành nhanh ("Try it Yourself") cho Excel & SQL
 */

export const DEFAULT_EXCEL_SANDBOX_DATASET = Object.freeze({
  id: 'sandbox-excel-sales-v1',
  name: 'Báo Cáo Bán Hàng Sản Phẩm Công Nghệ',
  description: 'Dữ liệu bán hàng phong phú dùng cho thực hành tự do các hàm SUM, AVERAGE, COUNTIF, SUMIF, IF...',
  columns: [
    { key: 'id', label: 'Mã SP', type: 'text', width: 90 },
    { key: 'product_name', label: 'Tên Sản Phẩm', type: 'text', width: 190 },
    { key: 'category', label: 'Ngành Hàng', type: 'text', width: 130 },
    { key: 'quantity', label: 'Số Lượng', type: 'number', width: 100 },
    { key: 'unit_price', label: 'Đơn Giá (VNĐ)', type: 'currency', width: 130 },
    { key: 'total', label: 'Thành Tiền (VNĐ)', type: 'currency', width: 140 },
  ],
  rows: [
    { id: 'SP01', product_name: 'Laptop Pro 16', category: 'Điện tử', quantity: 5, unit_price: 28000000, total: 140000000 },
    { id: 'SP02', product_name: 'Chuột Không Dây', category: 'Phụ kiện', quantity: 24, unit_price: 350000, total: 8400000 },
    { id: 'SP03', product_name: 'Bàn Phím Cơ RGB', category: 'Phụ kiện', quantity: 12, unit_price: 1250000, total: 15000000 },
    { id: 'SP04', product_name: 'Màn Hình 4K 27"', category: 'Màn hình', quantity: 8, unit_price: 8900000, total: 71200000 },
    { id: 'SP05', product_name: 'Tai Nghe Chống Ồn', category: 'Phụ kiện', quantity: 15, unit_price: 2200000, total: 33000000 },
    { id: 'SP06', product_name: 'Ổ Cứng Di Động 1TB', category: 'Lưu trữ', quantity: 30, unit_price: 1150000, total: 34500000 },
    { id: 'SP07', product_name: 'Webcam Full HD', category: 'Phụ kiện', quantity: 10, unit_price: 950000, total: 9500000 },
    { id: 'SP08', product_name: 'Ghế Công Thái Học', category: 'Nội thất', quantity: 4, unit_price: 4500000, total: 18000000 },
  ],
});

/**
 * Sinh map dữ liệu ban đầu cho các ô tính Excel (A2..F9)
 */
export function getInitialExcelSandboxCells() {
  const cellValues = {};
  const cellFormulas = {};

  DEFAULT_EXCEL_SANDBOX_DATASET.rows.forEach((row, rIdx) => {
    const rowNum = rIdx + 2; // Hàng bắt đầu từ 2 (hàng 1 là header)
    cellValues[`A${rowNum}`] = row.id;
    cellValues[`B${rowNum}`] = row.product_name;
    cellValues[`C${rowNum}`] = row.category;
    cellValues[`D${rowNum}`] = row.quantity;
    cellValues[`E${rowNum}`] = row.unit_price;

    // Cột F (Thành tiền) tính theo công thức số lượng * đơn giá
    const fCell = `F${rowNum}`;
    cellFormulas[fCell] = `=D${rowNum}*E${rowNum}`;
    cellValues[fCell] = row.quantity * row.unit_price;
  });

  return { cellValues, cellFormulas };
}

/**
 * Danh mục các Presets ví dụ mẫu ("Try it Yourself") gắn liền với từng bài học KnowledgeHub
 */
export const TOPIC_SANDBOX_PRESETS = Object.freeze({
  // ── EXCEL PRESETS ──
  'topic-001': {
    tool: 'excel',
    defaultFormula: '=SUM(D2:D9)',
    defaultTargetCell: 'D10',
    examples: [
      {
        title: 'Tính tổng toàn bộ số lượng sản phẩm',
        code: '=SUM(D2:D9)',
        targetCell: 'D10',
        explanation: 'Cộng toàn bộ giá trị từ ô D2 đến D9 trên cột Số Lượng.',
      },
      {
        title: 'Tính tổng doanh thu toàn bộ kho hàng',
        code: '=SUM(F2:F9)',
        targetCell: 'F10',
        explanation: 'Cộng tổng doanh số từ F2 đến F9 trên cột Thành Tiền.',
      },
      {
        title: 'Cộng các ô rời rạc không liền kề',
        code: '=SUM(D2, D4, D6)',
        targetCell: 'D11',
        explanation: 'Cộng số lượng của Laptop (D2), Màn hình (D4) và Ổ cứng (D6).',
      },
    ],
  },
  'topic-002': {
    tool: 'excel',
    defaultFormula: '=SUMIF(C2:C9, "Phụ kiện", F2:F9)',
    defaultTargetCell: 'F11',
    examples: [
      {
        title: 'Tính tổng doanh thu nhóm "Phụ kiện"',
        code: '=SUMIF(C2:C9, "Phụ kiện", F2:F9)',
        targetCell: 'F11',
        explanation: 'Tìm trong cột C những dòng có ngành hàng là "Phụ kiện" và cộng tổng tiền tương ứng ở cột F.',
      },
      {
        title: 'Tổng tiền các mặt hàng có số lượng >= 10',
        code: '=SUMIF(D2:D9, ">=10", F2:F9)',
        targetCell: 'F12',
        explanation: 'Chỉ tính tổng tiền những sản phẩm có tồn kho hoặc số lượng đặt từ 10 trở lên.',
      },
      {
        title: 'Tổng số lượng của các sản phẩm có đơn giá < 2 triệu',
        code: '=SUMIF(E2:E9, "<2000000", D2:D9)',
        targetCell: 'D12',
        explanation: 'Tính tổng số lượng của các mặt hàng giá rẻ dưới 2,000,000 VNĐ.',
      },
    ],
  },
  'topic-005': {
    tool: 'excel',
    defaultFormula: '=AVERAGE(E2:E9)',
    defaultTargetCell: 'E10',
    examples: [
      {
        title: 'Tính đơn giá trung bình',
        code: '=AVERAGE(E2:E9)',
        targetCell: 'E10',
        explanation: 'Tính trung bình cộng đơn giá của tất cả 8 sản phẩm trong kho.',
      },
      {
        title: 'Đếm số lượng mặt hàng có dữ liệu',
        code: '=COUNT(D2:D9)',
        targetCell: 'D11',
        explanation: 'Đếm số ô có giá trị số từ ô D2 đến D9.',
      },
    ],
  },
  'topic-006': {
    tool: 'excel',
    defaultFormula: '=MAX(F2:F9)',
    defaultTargetCell: 'F10',
    examples: [
      {
        title: 'Tìm đơn hàng có thành tiền lớn nhất',
        code: '=MAX(F2:F9)',
        targetCell: 'F10',
        explanation: 'Tìm giá trị doanh số lớn nhất trong dải ô F2:F9.',
      },
      {
        title: 'Tìm đơn giá sản phẩm thấp nhất',
        code: '=MIN(E2:E9)',
        targetCell: 'E11',
        explanation: 'Tìm đơn giá nhỏ nhất trong bảng danh mục.',
      },
    ],
  },

  // ── SQL PRESETS ──
  'topic-003': {
    tool: 'sql',
    defaultSql: 'SELECT * FROM sales LIMIT 5;',
    examples: [
      {
        title: 'Lấy 5 giao dịch đầu tiên',
        code: 'SELECT * FROM sales LIMIT 5;',
        explanation: 'Trích xuất toàn bộ các cột từ bảng sales, giới hạn 5 dòng xem nhanh.',
      },
      {
        title: 'Chỉ chọn các cột quan trọng',
        code: 'SELECT transaction_id, product_name, amount, payment_method FROM sales LIMIT 8;',
        explanation: 'Lọc ra mã giao dịch, tên sản phẩm, số tiền và phương thức thanh toán.',
      },
      {
        title: 'Xem danh sách các phương thức thanh toán duy nhất',
        code: 'SELECT DISTINCT payment_method FROM sales;',
        explanation: 'Dùng từ khóa DISTINCT để loại bỏ các giá trị trùng lặp.',
      },
    ],
  },
  'topic-004': {
    tool: 'sql',
    defaultSql: "SELECT * FROM sales WHERE amount > 500000;",
    examples: [
      {
        title: 'Lọc giao dịch có số tiền > 500,000đ',
        code: 'SELECT * FROM sales WHERE amount > 500000;',
        explanation: 'Dùng mệnh đề WHERE với toán tử so sánh lớn hơn (>).',
      },
      {
        title: 'Lọc giao dịch thanh toán bằng Chuyển khoản',
        code: "SELECT transaction_id, product_name, amount FROM sales WHERE payment_method = 'Bank Transfer';",
        explanation: 'Lọc chính xác chuỗi ký tự bằng dấu nháy đơn.',
      },
      {
        title: 'Kết hợp nhiều điều kiện với AND / OR',
        code: "SELECT * FROM sales WHERE amount >= 1000000 AND payment_method = 'Credit Card';",
        explanation: 'Chỉ lấy những đơn hàng giá trị từ 1 triệu trở lên VÀ thanh toán bằng thẻ tín dụng.',
      },
    ],
  },
  'topic-007': {
    tool: 'sql',
    defaultSql: 'SELECT transaction_id, product_name, amount FROM sales ORDER BY amount DESC LIMIT 5;',
    examples: [
      {
        title: 'Top 5 đơn hàng số tiền cao nhất',
        code: 'SELECT transaction_id, product_name, amount FROM sales ORDER BY amount DESC LIMIT 5;',
        explanation: 'Sắp xếp giảm dần (DESC) theo cột amount và lấy 5 dòng đầu.',
      },
      {
        title: 'Sắp xếp tên sản phẩm theo thứ tự A-Z',
        code: 'SELECT product_name, category, unit_price FROM sales ORDER BY product_name ASC;',
        explanation: 'Sắp xếp tăng dần theo bảng chữ cái tiếng Anh.',
      },
    ],
  },
  'topic-008': {
    tool: 'sql',
    defaultSql: 'SELECT payment_method, COUNT(*) AS total_orders, SUM(amount) AS total_revenue FROM sales GROUP BY payment_method;',
    examples: [
      {
        title: 'Thống kê tổng doanh thu theo phương thức thanh toán',
        code: 'SELECT payment_method, COUNT(*) AS total_orders, SUM(amount) AS total_revenue FROM sales GROUP BY payment_method;',
        explanation: 'Gom nhóm theo cột payment_method và tính tổng doanh thu bằng SUM(amount).',
      },
      {
        title: 'Đếm số giao dịch theo ngành hàng',
        code: 'SELECT category, COUNT(*) AS total_items FROM sales GROUP BY category;',
        explanation: 'Thống kê số đơn hàng của từng danh mục ngành hàng.',
      },
    ],
  },
});

export const DEFAULT_EXCEL_GENERIC_PRESETS = [
  {
    title: 'Tính tổng: =SUM(D2:D9)',
    code: '=SUM(D2:D9)',
    targetCell: 'D10',
    explanation: 'Tính tổng cột Số Lượng.',
  },
  {
    title: 'Giá trị trung bình: =AVERAGE(E2:E9)',
    code: '=AVERAGE(E2:E9)',
    targetCell: 'E10',
    explanation: 'Tính đơn giá trung bình của các sản phẩm.',
  },
  {
    title: 'Giá trị lớn nhất: =MAX(F2:F9)',
    code: '=MAX(F2:F9)',
    targetCell: 'F10',
    explanation: 'Tìm mặt hàng có thành tiền lớn nhất.',
  },
  {
    title: 'Đếm số mặt hàng: =COUNT(D2:D9)',
    code: '=COUNT(D2:D9)',
    targetCell: 'D11',
    explanation: 'Đếm số lượng ô có giá trị số.',
  },
];

export const DEFAULT_SQL_GENERIC_PRESETS = [
  {
    title: 'Xem dữ liệu: SELECT * FROM sales LIMIT 5;',
    code: 'SELECT * FROM sales LIMIT 5;',
    explanation: 'Xem trước 5 bản ghi bán hàng.',
  },
  {
    title: 'Thống kê tổng doanh thu theo phương thức',
    code: 'SELECT payment_method, COUNT(*) AS total_orders, SUM(amount) AS total_revenue FROM sales GROUP BY payment_method;',
    explanation: 'Nhóm theo payment_method và tính tổng doanh thu.',
  },
  {
    title: 'Top 5 đơn hàng giá trị cao nhất',
    code: 'SELECT transaction_id, product_name, amount FROM sales ORDER BY amount DESC LIMIT 5;',
    explanation: 'Sắp xếp giảm dần theo số tiền giao dịch.',
  },
];
