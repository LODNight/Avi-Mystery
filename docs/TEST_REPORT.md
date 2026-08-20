# Báo Cáo Kiểm Thử Tự Động (Test Report)

> **Cập nhật lần cuối:** 20/08/2026  
> **Công cụ kiểm thử:** Vitest 2.1.9 + React Testing Library 16.0.0 + JSDOM  
> **Tổng số Test Suites:** 11 files  
> **Tổng số Test Cases:** 58 passed / 0 failed  

---

## 1. Kết Quả Chạy Kiểm Thử Tự Động

| File Test | Loại Test | Số Test Cases | Kết quả | Thời gian chạy |
|---|---|---|---|---|
| `src/tests/PageStatus.test.jsx` | Component & Service Test | 6 | `PASS` | 86ms |
| `src/utils/excelChecker.test.js` | Unit Test | 13 | `PASS` | 12ms |
| `src/pages/learner/MissionIntroPage.test.jsx` | Component Test | 2 | `PASS` | 169ms |
| `src/pages/learner/LearningMapPage.test.jsx` | Component Test | 3 | `PASS` | 197ms |
| `src/pages/learner/CourseDetailPage.test.jsx` | Component Test | 3 | `PASS` | 292ms |
| `src/pages/learner/CoursesPage.test.jsx` | Component Test | 5 | `PASS` | 380ms |
| `src/components/ui/Skeleton.test.jsx` | Component Test | 7 | `PASS` | 133ms |
| `src/components/ui/EmptyState.test.jsx` | Component Test | 5 | `PASS` | 182ms |
| `src/services/mock/mockMissionService.test.js` | Unit Test | 4 | `PASS` | 1248ms |
| `src/services/mock/mockCourseService.test.js` | Unit Test | 5 | `PASS` | 1554ms |
| `src/services/mock/mockAuthService.test.js` | Unit Test | 5 | `PASS` | 1879ms |


---

## 2. Chi Tiết Các Test Case Đã Thực Hiện

### 🟢 `excelChecker.test.js` (Mới)
- `[PASS]` Tự động bổ sung dấu `=` nếu thiếu khi chuẩn hóa công thức Excel.
- `[PASS]` Chuyển đổi toàn bộ tên hàm Excel phổ biến sang chữ hoa (`SUM`, `SUMIF`, `MAX`, `MIN`, `AVERAGE`).
- `[PASS]` Xử lý an toàn với đầu vào rỗng hoặc không hợp lệ.
- `[PASS]` Phân tích chính xác tọa độ ô (`parseCellAddress`).
- `[PASS]` Mở rộng dải ô (`expandCellRange`) từ chuỗi dạng `"B2:B5"` hoặc `"A1:B2"`.
- `[PASS]` Tính toán chính xác giá trị thử nghiệm cho hàm `SUM`, `AVERAGE`, `MAX`, `MIN`.
- `[PASS]` Kiểm tra và xác nhận câu trả lời đúng khi công thức khớp `expectedFormula`.
- `[PASS]` Xác nhận công thức đúng không phân biệt hoa thường hoặc thiếu dấu `=`.
- `[PASS]` Hỗ trợ so sánh với mảng danh sách công thức mẫu tương đương.
- `[PASS]` Đánh giá và trả về phản hồi chuẩn đoán khi người học nhập sai công thức hoặc sai dải ô.
- `[PASS]` Cung cấp hướng dẫn sửa lỗi khi thiếu dấu ngoặc đơn `()`.

### 🟢 `MissionIntroPage.test.jsx`
- `[PASS]` Render thông tin hồ sơ vụ án, bối cảnh (story), mục tiêu (objective) và điểm thưởng XP sau khi load thành công.
- `[PASS]` Hiển thị `ErrorState` khi vụ án không tồn tại hoặc dịch vụ gặp lỗi.

### 🟢 `LearningMapPage.test.jsx`
- `[PASS]` Render bản đồ học tập và danh sách bài học vụ án theo node-tree sau khi load dữ liệu thành công.
- `[PASS]` Đổi khóa học mượt mà bằng selector dropdown và tải lại sơ đồ chương tương ứng.
- `[PASS]` Hiển thị `ErrorState` kèm nút thử lại khi dịch vụ gặp lỗi.

### 🟢 `CourseDetailPage.test.jsx`
- `[PASS]` Render thông tin chi tiết khóa học, nhãn công cụ, độ khó và danh sách chương.
- `[PASS]` Mở/đóng các chương trong Accordion để xem bài học vụ án.
- `[PASS]` Hiển thị trạng thái khóa học không tồn tại.

### 🟢 `CoursesPage.test.jsx`
- `[PASS]` Render danh sách toàn bộ khóa học công bố (`published`).
- `[PASS]` Lọc danh sách theo từ khóa tìm kiếm.
- `[PASS]` Lọc danh sách theo công cụ Excel / SQL.
- `[PASS]` Lọc danh sách theo độ khó.
- `[PASS]` Hiển thị `EmptyState` khi không tìm thấy khóa học phù hợp với bộ lọc.

---

## 3. Lệnh Chạy Kiểm Thử

Để chạy lại toàn bộ test suite bất kỳ lúc nào:

```bash
npx vitest run
```

Hoặc chạy giao diện kiểm thử trực quan:

```bash
npm run test:ui
```
