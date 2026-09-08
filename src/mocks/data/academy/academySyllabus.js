/**
 * Academy Course Syllabi & Curriculum Data (Sprint 9.5)
 * Cung cấp cây cấu trúc giáo trình W3Schools Style cho Học viện Excel & SQL
 */

export const ACADEMY_COURSES = [
  {
    id: 'excel-academy',
    slug: 'excel-academy',
    title: 'Excel Chuyên Sâu Cho Phân Tích Dữ Liệu',
    shortTitle: 'Excel Academy',
    badge: 'Chứng chỉ Phân tích',
    subtitle: 'Làm chủ các hàm tính toán, thống kê, kiểm tra số liệu kế toán và phân tích báo cáo',
    tool: 'excel',
    iconName: 'FileSpreadsheet',
    level: 'Từ Căn bản đến Nâng cao',
    totalLessons: 4,
    estimatedTime: '45 phút',
    accentColor: 'from-emerald-600 to-teal-700',
    borderColor: 'border-emerald-500/30',
    chapters: [
      {
        id: 'ch-excel-1',
        title: 'Chương 1: Các Hàm Tính Toán Căn Bản',
        description: 'Làm quen bảng tính và các phép toán cơ bản thông dụng nhất trong phân tích tài chính.',
        lessons: [
          {
            topicId: 'topic-001',
            title: 'Hàm SUM - Tính Tổng',
            duration: '10 phút',
            difficulty: 'Căn bản',
            checkpointQuiz: {
              question: 'Trong Excel, cú pháp nào sau đây dùng để tính tổng các ô từ D2 đến D9?',
              options: [
                '=TOTAL(D2:D9)',
                '=SUM(D2:D9)',
                '=ADD(D2..D9)',
                '=SUM(D2-D9)',
              ],
              correctIndex: 1,
              explanation: 'Cú pháp chuẩn của hàm tính tổng là =SUM(range), dấu hai chấm (:) biểu diễn dải ô liền kề.',
            },
          },
          {
            topicId: 'topic-005',
            title: 'Hàm AVERAGE & COUNT - Thống Kê Cơ Bản',
            duration: '12 phút',
            difficulty: 'Căn bản',
            checkpointQuiz: {
              question: 'Hàm nào dùng để tính giá trị trung bình cộng của một cột số trong Excel?',
              options: [
                '=MEAN(range)',
                '=AVG(range)',
                '=AVERAGE(range)',
                '=MEDIAN(range)',
              ],
              correctIndex: 2,
              explanation: 'Trong Excel, hàm =AVERAGE(range) được dùng để tính trung bình cộng số học.',
            },
          },
          {
            topicId: 'topic-006',
            title: 'Hàm MIN & MAX - Tìm Cực Trị Dữ Liệu',
            duration: '10 phút',
            difficulty: 'Căn bản',
            checkpointQuiz: {
              question: 'Để tìm đơn hàng có doanh số cao nhất trong dải ô F2:F9, ta dùng công thức nào?',
              options: [
                '=HIGHEST(F2:F9)',
                '=TOP(F2:F9)',
                '=MAX(F2:F9)',
                '=LARGE(F2:F9, 0)',
              ],
              correctIndex: 2,
              explanation: 'Hàm =MAX() trả về giá trị lớn nhất trong tập hợp tham số truyền vào.',
            },
          },
        ],
      },
      {
        id: 'ch-excel-2',
        title: 'Chương 2: Thống Kê Có Điều Kiện & Logic',
        description: 'Phân tích đa chiều với các điều kiện lọc nâng cao và logic kiểm chứng.',
        lessons: [
          {
            topicId: 'topic-002',
            title: 'Hàm SUMIF - Tính Tổng Có Điều Kiện',
            duration: '15 phút',
            difficulty: 'Trung cấp',
            checkpointQuiz: {
              question: 'Công thức =SUMIF(C2:C9, "Phụ kiện", F2:F9) thực hiện nhiệm vụ gì?',
              options: [
                'Tính tổng tiền cột C nếu cột F là Phụ kiện',
                'Tính tổng tiền cột F cho các dòng có cột C là Phụ kiện',
                'Đếm số sản phẩm Phụ kiện trong cột C',
                'Cộng dồn tất cả các ô có chữ Phụ kiện',
              ],
              correctIndex: 1,
              explanation: 'Hàm SUMIF kiểm tra điều kiện tại vùng C2:C9 ("Phụ kiện") và cộng các giá trị tương ứng ở vùng tính tổng F2:F9.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'sql-academy',
    slug: 'sql-academy',
    title: 'SQL Truy Vấn Dữ Liệu Thực Chiến',
    shortTitle: 'SQL Academy',
    badge: 'Chứng chỉ Cơ sở dữ liệu',
    subtitle: 'Làm chủ cú pháp truy vấn bảng dữ liệu, lọc chứng cứ gian lận, gom nhóm và tổng hợp',
    tool: 'sql',
    iconName: 'Database',
    level: 'Từ Căn bản đến Nâng cao',
    totalLessons: 4,
    estimatedTime: '55 phút',
    accentColor: 'from-blue-600 to-indigo-700',
    borderColor: 'border-blue-500/30',
    chapters: [
      {
        id: 'ch-sql-1',
        title: 'Chương 1: Truy Vấn Dữ Liệu Cơ Bản',
        description: 'Nền tảng về SELECT, chọn lọc cột và trích xuất dữ liệu có điều kiện.',
        lessons: [
          {
            topicId: 'topic-003',
            title: 'Lệnh SELECT - Truy Vấn Cơ Bản',
            duration: '10 phút',
            difficulty: 'Căn bản',
            checkpointQuiz: {
              question: 'Ký tự nào được dùng để chọn tất cả các cột trong một bảng SQL?',
              options: [
                '% (Phần trăm)',
                '* (Dấu hoa thị)',
                'ALL (Từ khóa)',
                '? (Dấu chấm hỏi)',
              ],
              correctIndex: 1,
              explanation: 'Cú pháp SELECT * FROM table_name dùng dấu hoa thị (*) đại diện cho tất cả các cột của bảng.',
            },
          },
          {
            topicId: 'topic-004',
            title: 'Mệnh Đề WHERE - Lọc Dữ Liệu',
            duration: '15 phút',
            difficulty: 'Trung cấp',
            checkpointQuiz: {
              question: 'Câu lệnh nào trích xuất các đơn hàng có số tiền trên 500,000đ?',
              options: [
                'SELECT * FROM sales HAVING amount > 500000;',
                'SELECT * FROM sales WHERE amount > 500000;',
                'SELECT * FROM sales FILTER amount > 500000;',
                'SELECT * FROM sales WHEN amount > 500000;',
              ],
              correctIndex: 1,
              explanation: 'Mệnh đề WHERE lọc dữ liệu từng bản ghi theo điều kiện so sánh được chỉ định.',
            },
          },
        ],
      },
      {
        id: 'ch-sql-2',
        title: 'Chương 2: Sắp Xếp & Thống Kê Nâng Cao',
        description: 'Tối ưu thứ tự xem và tổng hợp báo cáo đa chiều với GROUP BY.',
        lessons: [
          {
            topicId: 'topic-007',
            title: 'Mệnh Đề ORDER BY & LIMIT - Sắp Xếp & Giới Hạn',
            duration: '12 phút',
            difficulty: 'Căn bản',
            checkpointQuiz: {
              question: 'Từ khóa nào dùng để sắp xếp kết quả theo thứ tự từ lớn nhất đến nhỏ nhất?',
              options: [
                'ORDER BY column ASC',
                'ORDER BY column DESC',
                'SORT BY column DOWN',
                'LIMIT column MAX',
              ],
              correctIndex: 1,
              explanation: 'DESC (Descending) sắp xếp theo thứ tự giảm dần từ giá trị cao nhất đến thấp nhất.',
            },
          },
          {
            topicId: 'topic-008',
            title: 'Mệnh Đề GROUP BY & Hàm Tổng Hợp',
            duration: '18 phút',
            difficulty: 'Trung cấp',
            checkpointQuiz: {
              question: 'Mệnh đề GROUP BY thường được dùng kết hợp với các hàm nào?',
              options: [
                'Các hàm xử lý chuỗi UPPER, LOWER',
                'Các hàm tổng hợp như COUNT, SUM, AVG, MAX, MIN',
                'Các hàm toán học căn bậc hai SQRT',
                'Các lệnh INSERT và DELETE',
              ],
              correctIndex: 1,
              explanation: 'GROUP BY gom các hàng có chung giá trị để tính toán với các hàm tổng hợp (Aggregate Functions).',
            },
          },
        ],
      },
    ],
  },
];

/**
 * Tìm khóa học theo slug (ví dụ: 'excel-academy' hoặc 'sql-academy')
 */
export function getCourseBySlug(slug) {
  return ACADEMY_COURSES.find(c => c.slug === slug || c.id === slug) || ACADEMY_COURSES[0];
}

/**
 * Lấy danh sách phẳng tất cả bài học trong một khóa học theo thứ tự tuần tự
 */
export function getCourseFlatLessons(course) {
  if (!course?.chapters) return [];
  const flat = [];
  course.chapters.forEach((chapter, chIdx) => {
    chapter.lessons.forEach((lesson, lIdx) => {
      flat.push({
        ...lesson,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        chapterIndex: chIdx + 1,
        lessonIndex: flat.length + 1,
      });
    });
  });
  return flat;
}
