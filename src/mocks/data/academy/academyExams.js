/**
 * Academy Final Exams Data (Sprint 9.5 — Step 9.5.3)
 * Cung cấp bộ đề thi tốt nghiệp 10 câu hỏi sát hạch lý thuyết & thực hành
 * cho cả Excel Academy và SQL Academy.
 */

export const ACADEMY_EXAMS = {
  'excel-academy': {
    courseSlug: 'excel-academy',
    courseTitle: 'Excel Chuyên Sâu Cho Phân Tích Dữ Liệu',
    shortTitle: 'Excel Academy Exam',
    description: 'Kỳ thi sát hạch toàn diện kỹ năng phân tích bảng tính, làm chủ hàm số học, thống kê có điều kiện, tra cứu và logic điều kiện.',
    durationSeconds: 900, // 15 phút
    passingScorePercent: 80, // 80% (8/10 câu)
    rewardXp: 100,
    badgeId: 'badge-excel-academy-cert',
    questions: [
      {
        id: 'ex-q1',
        category: 'Hàm Cơ Bản',
        text: 'Trong Excel, công thức nào dưới đây tính tổng các ô từ A2 đến A10, bỏ qua các ô chứa chuỗi ký tự?',
        codeSnippet: null,
        options: [
          '=SUM(A2:A10)',
          '=TOTAL(A2:A10)',
          '=ADD(A2:A10)',
          '=SUMIF(A2:A10, "isNumber")',
        ],
        correctIndex: 0,
        explanation: 'Hàm =SUM(range) tự động bỏ qua các ô chứa chuỗi văn bản (text) và chỉ cộng các giá trị số hợp lệ.',
      },
      {
        id: 'ex-q2',
        category: 'Thống Kê Cơ Bản',
        text: 'Cột C từ C2 đến C11 chứa số tiền của 10 đơn hàng. Bạn muốn biết giá trị đơn hàng trung bình của danh sách này. Công thức chuẩn xác là:',
        codeSnippet: null,
        options: [
          '=MEDIAN(C2:C11)',
          '=AVG(C2:C11)',
          '=AVERAGE(C2:C11)',
          '=SUM(C2:C11)/COUNTBLANK(C2:C11)',
        ],
        correctIndex: 2,
        explanation: 'Trong Excel, hàm chuẩn để tính trung bình cộng số học là =AVERAGE(range). Hàm =AVG() không tồn tại trong Excel.',
      },
      {
        id: 'ex-q3',
        category: 'Thống Kê Có Điều Kiện',
        text: 'Bảng dữ liệu có Cột B chứa Loại Khách Hàng ("VIP", "Thường") và Cột D chứa Doanh Số. Công thức nào tính tổng doanh số của nhóm khách hàng "VIP"?',
        codeSnippet: null,
        options: [
          '=COUNTIF(B2:B50, "VIP", D2:D50)',
          '=SUMIF(B2:B50, "VIP", D2:D50)',
          '=SUMIF(D2:D50, "VIP", B2:B50)',
          '=IF(B2:B50="VIP", SUM(D2:D50))',
        ],
        correctIndex: 1,
        explanation: 'Cú pháp của SUMIF là =SUMIF(vùng_điều_kiện, điều_kiện, [vùng_tính_tổng]). Do đó B2:B50 là vùng điều kiện, "VIP" là tiêu chí, và D2:D50 là vùng tính tổng.',
      },
      {
        id: 'ex-q4',
        category: 'Đếm Dữ Liệu',
        text: 'Để đếm số đơn hàng có giá trị lớn hơn hoặc bằng 1,000,000đ trong cột F từ F2 đến F30, công thức nào sau đây là đúng?',
        codeSnippet: null,
        options: [
          '=COUNT(F2:F30 >= 1000000)',
          '=COUNTIF(F2:F30, ">=1000000")',
          '=COUNTIF(F2:F30, >=1000000)',
          '=COUNTA(F2:F30, ">1000000")',
        ],
        correctIndex: 1,
        explanation: 'Trong hàm COUNTIF/SUMIF, các toán tử so sánh kết hợp số phải được đặt trong dấu ngoặc kép dạng chuỗi: ">=1000000".',
      },
      {
        id: 'ex-q5',
        category: 'Logic Điều Kiện',
        text: 'Cho công thức =IF(E2 >= 80, "Giỏi", IF(E2 >= 65, "Khá", "Trung bình")). Nếu ô E2 có giá trị 70, kết quả trả về là gì?',
        codeSnippet: null,
        options: [
          '"Giỏi"',
          '"Khá"',
          '"Trung bình"',
          'Lỗi cú pháp #VALUE!',
        ],
        correctIndex: 1,
        explanation: 'E2 = 70 không thỏa mãn >= 80, chuyển sang nhánh FALSE thứ nhất; tại đây 70 thỏa mãn >= 65 nên hàm trả về "Khá".',
      },
      {
        id: 'ex-q6',
        category: 'Cực Trị Dữ Liệu',
        text: 'Để tìm đơn hàng có giá trị nhỏ nhất nhưng khác 0 trong dải ô D2:D20 (các số đều dương), công thức kết hợp nào sau đây hiệu quả nhất?',
        codeSnippet: null,
        options: [
          '=MIN(D2:D20)',
          '=MINIFS(D2:D20, D2:D20, ">0")',
          '=LOWEST(D2:D20, ">0")',
          '=SMALL(D2:D20, 0)',
        ],
        correctIndex: 1,
        explanation: 'Hàm =MINIFS(vùng_tìm_min, vùng_điều_kiện, ">0") cho phép tìm giá trị nhỏ nhất thỏa mãn điều kiện lớn hơn 0.',
      },
      {
        id: 'ex-q7',
        category: 'Tra Cứu Dữ Liệu',
        text: 'Cú pháp =VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup]). Để tra cứu chính xác tuyệt đối (exact match), tham số thứ tư range_lookup phải là:',
        codeSnippet: null,
        options: [
          'TRUE hoặc 1',
          'FALSE hoặc 0',
          '"EXACT"',
          'Để trống (mặc định)',
        ],
        correctIndex: 1,
        explanation: 'Tham số FALSE hoặc 0 chỉ định dò tìm chính xác 100%. Nếu để TRUE hoặc bỏ trống, Excel sẽ mặc định dò tìm tương đối (approximate match).',
      },
      {
        id: 'ex-q8',
        category: 'Tra Cứu Dữ Liệu',
        text: 'Ưu điểm vượt trội của cặp hàm INDEX & MATCH so với VLOOKUP truyền thống là gì?',
        codeSnippet: null,
        options: [
          'INDEX/MATCH tính toán nhanh hơn 100 lần so với VLOOKUP trên mọi tập dữ liệu',
          'INDEX/MATCH có thể tra cứu sang trái (cột trả về nằm bên trái cột chứa khóa tìm kiếm)',
          'INDEX/MATCH tự động sửa lỗi chính tả trong dữ liệu tìm kiếm',
          'INDEX/MATCH không yêu cầu chọn dải ô tham chiếu',
        ],
        correctIndex: 1,
        explanation: 'VLOOKUP chỉ có thể dò tìm từ trái sang phải (cột kết quả phải nằm sau cột khóa). Trong khi đó, INDEX kết hợp MATCH có thể tra cứu theo bất kỳ hướng nào (sang trái, sang phải, trên, dưới).',
      },
      {
        id: 'ex-q9',
        category: 'Xử Lý Lỗi Bảng Tính',
        text: 'Khi một công thức VLOOKUP không tìm thấy giá trị tra cứu trong bảng nguồn, Excel sẽ trả về mã lỗi nào?',
        codeSnippet: null,
        options: [
          '#NULL!',
          '#DIV/0!',
          '#N/A',
          '#REF!',
        ],
        correctIndex: 2,
        explanation: 'Lỗi #N/A (Not Available) xuất hiện khi hàm tra cứu không tìm thấy giá trị khớp theo yêu cầu.',
      },
      {
        id: 'ex-q10',
        category: 'Thực Hành Tổng Hợp',
        text: 'Bạn muốn tính tổng tiền của các giao dịch thỏa mãn ĐỒNG THỜI 2 điều kiện: Nhân viên là "Lan" và Khu vực là "Miền Bắc". Hàm nào sau đây hỗ trợ tốt nhất?',
        codeSnippet: null,
        options: [
          '=SUMIF()',
          '=SUMIFS()',
          '=TOTALIF()',
          '=AND(SUMIF())',
        ],
        correctIndex: 1,
        explanation: 'Hàm =SUMIFS(sum_range, criteria_range1, criteria1, criteria_range2, criteria2, ...) được thiết kế chuyên biệt để tính tổng theo nhiều điều kiện đồng thời (AND logic).',
      },
    ],
  },

  'sql-academy': {
    courseSlug: 'sql-academy',
    courseTitle: 'SQL Truy Vấn Dữ Liệu Thực Chiến',
    shortTitle: 'SQL Academy Exam',
    description: 'Kỳ thi sát hạch toàn diện kỹ năng truy vấn cơ sở dữ liệu quan hệ, làm chủ câu lệnh SELECT, lọc WHERE, gom nhóm GROUP BY, hàm tổng hợp và liên kết JOIN.',
    durationSeconds: 900, // 15 phút
    passingScorePercent: 80, // 80% (8/10 câu)
    rewardXp: 100,
    badgeId: 'badge-sql-academy-cert',
    questions: [
      {
        id: 'sql-q1',
        category: 'Truy Vấn Cơ Bản',
        text: 'Câu lệnh SQL nào sau đây trích xuất tất cả các giá trị duy nhất (không trùng lặp) của cột city trong bảng customers?',
        codeSnippet: null,
        options: [
          'SELECT UNIQUE city FROM customers;',
          'SELECT DISTINCT city FROM customers;',
          'SELECT DIFFERENT city FROM customers;',
          'SELECT INDEPENDENT city FROM customers;',
        ],
        correctIndex: 1,
        explanation: 'Từ khóa DISTINCT trong SQL được dùng để lọc bỏ các bản ghi trùng lặp và chỉ trả về các giá trị khác nhau duy nhất.',
      },
      {
        id: 'sql-q2',
        category: 'Lọc Dữ Liệu',
        text: 'Để lọc các đơn hàng có giá trị từ 100 đến 500 (bao gồm cả 100 và 500), toán tử nào sau đây chuẩn cú pháp và tối ưu nhất?',
        codeSnippet: 'SELECT * FROM orders WHERE total _____ ;',
        options: [
          'BETWEEN 100 AND 500',
          'IN (100, 500)',
          'RANGE(100, 500)',
          'FROM 100 TO 500',
        ],
        correctIndex: 0,
        explanation: 'Toán tử BETWEEN ... AND ... chọn các giá trị trong một phạm vi xác định (bao gồm cả 2 giá trị biên).',
      },
      {
        id: 'sql-q3',
        category: 'Tìm Kiếm Mẫu Ký Tự',
        text: 'Bạn muốn tìm tất cả khách hàng có họ tên bắt đầu bằng chữ cái "A". Mệnh đề WHERE nào sau đây là chính xác?',
        codeSnippet: null,
        options: [
          'WHERE full_name LIKE "A_"',
          'WHERE full_name LIKE "A%"',
          'WHERE full_name = "A*"',
          'WHERE full_name STARTS WITH "A"',
        ],
        correctIndex: 1,
        explanation: 'Trong SQL, dấu % trong toán tử LIKE đại diện cho 0, 1 hoặc nhiều ký tự bất kỳ. "A%" nghĩa là bắt đầu bằng A và theo sau bởi bất kỳ ký tự nào.',
      },
      {
        id: 'sql-q4',
        category: 'Sắp Xếp & Giới Hạn',
        text: 'Để lấy ra 3 sản phẩm có giá bán (price) cao nhất từ bảng products, thứ tự các mệnh đề trong câu truy vấn phải là:',
        codeSnippet: null,
        options: [
          'ORDER BY price ASC LIMIT 3;',
          'ORDER BY price DESC LIMIT 3;',
          'LIMIT 3 ORDER BY price DESC;',
          'SORT BY price DESC TOP 3;',
        ],
        correctIndex: 1,
        explanation: 'Mệnh đề ORDER BY price DESC sắp xếp giá giảm dần từ lớn nhất đến nhỏ nhất, và LIMIT 3 giữ lại 3 dòng đầu tiên.',
      },
      {
        id: 'sql-q5',
        category: 'Hàm Tổng Hợp',
        text: 'Hàm nào sau đây đếm tổng số bản ghi trong bảng bất kể giá trị của các cột có chứa NULL hay không?',
        codeSnippet: null,
        options: [
          'COUNT(column_name)',
          'COUNT(*)',
          'SUM(1)',
          'TOTAL(*)',
        ],
        correctIndex: 1,
        explanation: 'COUNT(*) đếm tất cả các hàng trong bảng, kể cả những hàng chứa giá trị NULL. Trong khi COUNT(column) chỉ đếm các ô không chứa NULL.',
      },
      {
        id: 'sql-q6',
        category: 'Gom Nhóm Dữ Liệu',
        text: 'Khi sử dụng mệnh đề GROUP BY category, câu lệnh sau có hợp lệ không?\nSELECT category, product_name, AVG(price) FROM products GROUP BY category;',
        codeSnippet: null,
        options: [
          'Hoàn toàn hợp lệ, SQL tự động lấy product_name đầu tiên',
          'Không hợp lệ trong chuẩn SQL, vì cột product_name không nằm trong GROUP BY và không được bao bọc bởi hàm tổng hợp',
          'Hợp lệ nếu bảng có ít hơn 100 dòng',
          'Hợp lệ nhưng sẽ làm đảo lộn thứ tự các cột',
        ],
        correctIndex: 1,
        explanation: 'Trong SQL chuẩn, mọi cột xuất hiện trong SELECT list bắt buộc phải thuộc danh sách GROUP BY hoặc phải nằm bên trong một hàm tổng hợp (Aggregate Function).',
      },
      {
        id: 'sql-q7',
        category: 'Lọc Nhóm Dữ Liệu',
        text: 'Sự khác biệt cốt lõi giữa mệnh đề WHERE và mệnh đề HAVING là gì?',
        codeSnippet: null,
        options: [
          'WHERE lọc sau khi gom nhóm, HAVING lọc trước khi gom nhóm',
          'WHERE dùng cho số, HAVING dùng cho chuỗi văn bản',
          'WHERE lọc từng dòng trước khi nhóm dữ liệu; HAVING lọc kết quả nhóm sau khi tính toán các hàm tổng hợp',
          'Không có khác biệt nào, có thể thay thế cho nhau',
        ],
        correctIndex: 2,
        explanation: 'WHERE được áp dụng cho từng dòng đơn lẻ trước khi thực hiện GROUP BY; còn HAVING lọc trên kết quả của các nhóm (thường đi kèm với các hàm như COUNT, SUM, AVG).',
      },
      {
        id: 'sql-q8',
        category: 'Xử Lý Giá Trị Rỗng',
        text: 'Trong cơ sở dữ liệu quan hệ, biểu thức so sánh nào sau đây dùng để kiểm tra một ô có bị rỗng (không có dữ liệu) hay không?',
        codeSnippet: null,
        options: [
          'WHERE email = NULL',
          'WHERE email IS NULL',
          'WHERE email == ""',
          'WHERE email IS EMPTY',
        ],
        correctIndex: 1,
        explanation: 'Trong SQL, NULL đại diện cho giá trị chưa biết (unknown), không thể dùng toán tử = hay != để so sánh với NULL mà bắt buộc phải dùng IS NULL hoặc IS NOT NULL.',
      },
      {
        id: 'sql-q9',
        category: 'Liên Kết Bảng (JOIN)',
        text: 'Bạn muốn lấy tất cả khách hàng từ bảng customers, kể cả những khách hàng chưa từng phát sinh bất kỳ đơn hàng nào trong bảng orders. Bạn nên dùng phép JOIN nào?',
        codeSnippet: null,
        options: [
          'INNER JOIN',
          'CROSS JOIN',
          'LEFT JOIN (hoặc LEFT OUTER JOIN)',
          'RIGHT JOIN',
        ],
        correctIndex: 2,
        explanation: 'LEFT JOIN giữ lại toàn bộ các bản ghi từ bảng bên trái (customers), và điền NULL cho các cột của bảng bên phải (orders) nếu không tìm thấy bản ghi khớp.',
      },
      {
        id: 'sql-q10',
        category: 'Thực Hành Tổng Hợp',
        text: 'Xem xét câu truy vấn:\nSELECT department, COUNT(*) AS total_staff\nFROM employees\nWHERE salary > 1000\nGROUP BY department\nHAVING COUNT(*) >= 5\nORDER BY total_staff DESC;\n\nThứ tự thực thi logic (Logical Execution Order) của các mệnh đề trong SQL là:',
        codeSnippet: null,
        options: [
          'SELECT -> FROM -> WHERE -> GROUP BY -> HAVING -> ORDER BY',
          'FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY',
          'FROM -> SELECT -> WHERE -> GROUP BY -> ORDER BY -> HAVING',
          'WHERE -> FROM -> GROUP BY -> HAVING -> ORDER BY -> SELECT',
        ],
        correctIndex: 1,
        explanation: 'Thứ tự thực thi logic của SQL: 1. FROM/JOIN -> 2. WHERE -> 3. GROUP BY -> 4. HAVING -> 5. SELECT -> 6. ORDER BY -> 7. LIMIT.',
      },
    ],
  },
};

/**
 * Lấy cấu hình và danh sách câu hỏi kỳ thi theo slug khóa học
 */
export function getExamBySlug(slug) {
  return ACADEMY_EXAMS[slug] || null;
}
