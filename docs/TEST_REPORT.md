# Báo Cáo Kiểm Thử Tự Động (Test Report)

> **Cập nhật lần cuối:** 19/08/2026  
> **Công cụ kiểm thử:** Vitest 2.1.9 + React Testing Library 16.0.0 + JSDOM  
> **Tổng số Test Suites:** 8 files  
> **Tổng số Test Cases:** 37 passed / 0 failed  

---

## 1. Kết Quả Chạy Kiểm Thử Tự Động

| File Test | Loại Test | Số Test Cases | Kết quả | Thời gian chạy |
|---|---|---|---|---|
| `src/pages/learner/LearningMapPage.test.jsx` | Component Test | 3 | `PASS` | 231ms |
| `src/pages/learner/CourseDetailPage.test.jsx` | Component Test | 3 | `PASS` | 341ms |
| `src/pages/learner/CoursesPage.test.jsx` | Component Test | 5 | `PASS` | 449ms |
| `src/components/ui/Skeleton.test.jsx` | Component Test | 7 | `PASS` | 123ms |
| `src/components/ui/EmptyState.test.jsx` | Component Test | 5 | `PASS` | 199ms |
| `src/services/mock/mockMissionService.test.js` | Unit Test | 4 | `PASS` | 1234ms |
| `src/services/mock/mockCourseService.test.js` | Unit Test | 5 | `PASS` | 1558ms |
| `src/services/mock/mockAuthService.test.js` | Unit Test | 5 | `PASS` | 1881ms |

---

## 2. Chi Tiết Các Test Case Đã Thực Hiện

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

### 🟢 `mockAuthService.test.js`
- `[PASS]` `login` thành công với email và password hợp lệ (trả về safeUser không chứa password).
- `[PASS]` `login` thất bại khi nhập sai password.
- `[PASS]` `register` thành công với user mới và lưu session tự động.
- `[PASS]` `register` thất bại khi đăng ký email đã tồn tại.
- `[PASS]` `logout` xóa thông tin session khỏi LocalStorage.

### 🟢 `mockCourseService.test.js`
- `[PASS]` `getCourses` trả về danh sách toàn bộ khóa học.
- `[PASS]` `getCourses` lọc chính xác khóa học theo trạng thái (`published`).
- `[PASS]` `getCourse` lấy chi tiết khóa học bằng ID hoặc Slug.
- `[PASS]` `getCourse` trả về thông báo lỗi khi truy cập khóa học không tồn tại.
- `[PASS]` `getChaptersByCourse` lấy danh sách các chương thuộc về khóa học tương ứng.

### 🟢 `mockMissionService.test.js`
- `[PASS]` `getMissionsByChapter` lấy danh sách nhiệm vụ đã xuất bản theo Chapter ID.
- `[PASS]` `getMission` lấy chi tiết nhiệm vụ theo Mission ID.
- `[PASS]` `getMission` trả về lỗi khi Mission ID không hợp lệ.
- `[PASS]` `getRecommendedMissions` gợi ý tối đa 3 nhiệm vụ cho người học trên Dashboard.

### 🟢 `EmptyState.test.jsx`
- `[PASS]` Render đúng `title` và `description` của EmptyState.
- `[PASS]` Kích hoạt callback function khi bấm nút action.
- `[PASS]` ErrorState hiển thị tiêu chuẩn báo lỗi kèm nút "Thử lại".
- `[PASS]` ProgressBar gán chuẩn các thuộc tính ARIA (`aria-valuenow="75"`).
- `[PASS]` ProgressBar clamp chính xác các giá trị nằm ngoài vùng [0, 100].

### 🟢 `Skeleton.test.jsx`
- `[PASS]` Skeleton render class animate-pulse đúng tiêu chuẩn design system.
- `[PASS]` SkeletonCard render layout geometry chính xác.
- `[PASS]` DashboardSkeleton gán thuộc tính `aria-busy="true"` chuẩn Accessibility.

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
