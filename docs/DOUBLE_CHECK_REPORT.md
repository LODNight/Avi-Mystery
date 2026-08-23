# Nhật Ký Thay Đổi & Commit (Project Change Log)

Tài liệu này ghi lại lịch sử các Commit thay đổi codebase dự án Avi-Mystery theo từng Step. Mỗi commit ghi rõ nội dung ngắn gọn, đúng trọng tâm và các file đã điều chỉnh.

---

## 📌 Commit Log History

### 1. `fix(sql): double check schema browser toggle state & audit overall routes`
* **Nội dung:** Fix logic `toggleExpand` khi state khởi tạo là `undefined`; Rà soát 100% ứng dụng đảm bảo không gãy route.
* **Các file thay đổi:**
  - `src/components/sql/SchemaBrowser.jsx`
  - `docs/DOUBLE_CHECK_REPORT.md`

### 2. `feat(sql): implement SQL Mission Shell, loader and route (Step 4.3)`
* **Nội dung:** Xây dựng `SqlMissionPage` loader, route `/missions/:missionId/sql`, dataset SQLite cách ly và lifecycle disposal.
* **Các file thay đổi:**
  - `src/pages/learner/SqlMissionPage.jsx`
  - `src/pages/learner/SqlMissionPage.test.jsx`
  - `src/services/contracts/sqlMissionService.js`
  - `src/services/mock/mockSqlMissionService.js`
  - `src/services/mock/mockSqlMissionService.test.js`
  - `src/mocks/data/sql/sql-sales-v1.json`
  - `src/mocks/data/sql/sql-commerce-v1.json`
  - `src/app/router/index.jsx`

### 3. `feat(sql): create controlled SQL Editor MVP component (Step 4.4)`
* **Nội dung:** Xây dựng component `SqlEditor.jsx` với giao diện "Detective Amber", controlled state, nút Đặt lại/Chạy truy vấn, phím tắt `Ctrl + Enter` và lề dòng 2 space bằng `Tab`.
* **Các file thay đổi:**
  - `src/components/sql/SqlEditor.jsx`
  - `src/components/sql/SqlEditor.test.jsx`
  - `src/pages/learner/SqlMissionPage.jsx`
  - `src/pages/learner/SqlMissionPage.test.jsx`
  - `docs/CHECKLIST.md`
  - `docs/PROJECT_STATUS.md`
  - `docs/agent/CURRENT_TASK.md`
  - `docs/DOUBLE_CHECK_REPORT.md`

### 4. `fix(router): sync SQL workspace route navigation in LearningMapPage`
* **Nội dung:** Đồng bộ điều hướng Bản đồ học tập (`LearningMapPage`), tự động nhận diện bài học SQL để chuyển hướng sang `/missions/:id/sql`.
* **Các file thay đổi:**
  - `src/pages/learner/LearningMapPage.jsx`

### 5. `style(sql): refine UI layout, remove duplicate briefing and enhance SQL syntax highlighting`
* **Nội dung:** Tối ưu hóa chiều cao không gian dọc (vertical space), loại bỏ khối Briefing lặp lại, chuyển badge REQ sang màu stone dịu mắt và thêm SQL syntax highlighting.
* **Các file thay đổi:**
  - `src/pages/learner/SqlMissionPage.jsx`
  - `src/components/sql/SchemaBrowser.jsx`
  - `src/components/sql/SqlEditor.jsx`
  - `docs/DOUBLE_CHECK_REPORT.md`

### 6. `style(sql): separate Light/Dark mode themes and improve Run Query button contrast`
* **Nội dung:** Cấu hình chủ đề riêng biệt cho Light Mode (nền editor nhạt #F9FAFB, chữ tối, từ khóa xanh dương đậm, comment xanh lá) và tăng độ tương phản nút "Chạy truy vấn" với chữ nâu đen sẫm.
* **Các file thay đổi:**
  - `src/components/sql/SqlEditor.jsx`
  - `docs/DOUBLE_CHECK_REPORT.md`


