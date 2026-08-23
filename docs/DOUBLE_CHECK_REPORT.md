# 📋 Nhật Ký Thay Đổi & Commit Dự Án (Change Log)

> **Mục đích:** Lưu trữ lịch sử các thay đổi, commit đã thực hiện, nội dung trọng tâm và danh sách file đã điều chỉnh cụ thể qua từng bước phát triển của dự án Avi-Mystery.

---

## 📌 Nhật Ký Commit & Thay Đổi Chi Tiết

### 🔹 Commit: Step 4.2 Double-Check & Routing Audit Polish
- **Thời gian:** 23/08/2026
- **Nội dung trọng tâm:**
  - Fix triệt để bug logic `toggleExpand` trong `SchemaBrowser.jsx` khi state khởi tạo là `undefined`.
  - Rà soát 100% đường dẫn (Routes, Links, Redirects) toàn hệ thống, đảm bảo không gãy liên kết.
  - Chuyển đổi `docs/DOUBLE_CHECK_REPORT.md` thành Change Log lưu vết commit dự án ngắn gọn, trực diện.
- **File điều chỉnh:**
  - `src/components/sql/SchemaBrowser.jsx` *(Sửa logic toggle state & keyboard listener)*
  - `docs/DOUBLE_CHECK_REPORT.md` *(Cấu trúc lại thành nhật ký commit)*

---
- **Thời gian:** 23/08/2026
- **Nội dung trọng tâm:**
  - Triển khai component `SchemaBrowser.jsx`: Hiển thị danh sách bảng, cột, khóa chính (PK), kiểu dữ liệu và badge `NULL/NOT NULL`.
  - Hỗ trợ tìm kiếm thời gian thực (Search), bung mở tự động (Auto-expand), sao chép tên cột/bảng (Copy Identifier) và tab xem dữ liệu mẫu.
  - Sửa lỗi state toggle `toggleExpand` (chuyển chính xác từ mặc định mở `true` sang `false`).
  - Tối ưu WCAG Accessibility: Gắn `role="button"`, `tabIndex={0}`, `aria-expanded` và hỗ trợ phím `Enter`/`Space`.
- **File điều chỉnh:**
  - `src/components/sql/SchemaBrowser.jsx` *(Tạo mới & hoàn thiện UI/UX/Accessibility)*
  - `src/components/sql/SchemaBrowser.test.jsx` *(Tạo mới unit test suite - 7/7 tests pass)*
  - `docs/agent/CURRENT_TASK.md` *(Cập nhật scope & tiêu chí Step 4.2)*
  - `docs/CHECKLIST.md` *(Đánh dấu hoàn thành Step 4.2)*
  - `docs/PROJECT_STATUS.md` *(Cập nhật tiến độ dự án sang Step 4.3)*

---

### 🔹 Commit: Step 4.1B — SQL Guard Policy & Security Validation
- **Thời gian:** 23/08/2026
- **Nội dung trọng tâm:**
  - Xây dựng `sqlQueryPolicy.js`: Chặn các câu lệnh nguy hiểm (`DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`), chỉ cho phép `SELECT` và `WITH`.
  - Giới hạn hàng tự động (`LIMIT 100`) để bảo vệ bộ nhớ trình duyệt.
  - Xây dựng `sqlErrorTranslator.js` dịch lỗi SQLite thô sang thông điệp tiếng Việt dễ hiểu cho người học.
- **File điều chỉnh:**
  - `src/utils/sql/sqlQueryPolicy.js` *(Tạo mới bộ lọc an toàn SQL)*
  - `src/utils/sql/sqlErrorTranslator.js` *(Tạo mới trình dịch lỗi tiếng Việt)*
  - `src/utils/sql/sqlQueryPolicy.test.js` *(Tạo mới test suite - 15/15 tests pass)*
  - `src/utils/sql/sqlErrorTranslator.test.js` *(Tạo mới test suite - 6/6 tests pass)*

---

### 🔹 Commit: Step 4.1A — SQL Engine Service Gateway & State Adapter
- **Thời gian:** 23/08/2026
- **Nội dung trọng tâm:**
  - Triển khai `sqlEngineAdapter.js` điều phối việc tải và thực thi dữ liệu SQLite WASM trong bộ nhớ trình duyệt.
  - Xây dựng `mockSqlMissionService.js` tuân thủ Shared Service Contract, hỗ trợ tải vụ án SQL, seed DB và chấm điểm.
- **File điều chỉnh:**
  - `src/services/sqlEngineAdapter.js` *(Tạo mới adapter kết nối SQLite WASM)*
  - `src/services/mock/mockSqlMissionService.js` *(Tạo mới mock service cho SQL)*
  - `src/services/mock/mockSqlMissionService.test.js` *(Tạo mới test suite - 7/7 tests pass)*

---

### 🔹 Commit: Step 4.0 — Technical Spike: sql.js WASM Integration Baseline
- **Thời gian:** 22/08/2026
- **Nội dung trọng tâm:**
  - Tích hợp thư viện `sql.js@1.14.2` WASM vào môi trường Vite build & preview.
  - Xây dựng test baseline xác minh khả năng khởi tạo DB seed và chạy câu lệnh `SELECT`.
- **File điều chỉnh:**
  - `package.json` *(Thêm dependency sql.js)*
  - `vite.config.js` *(Cấu hình WASM asset bundler)*
  - `src/utils/sql/sqlEngine.test.js` *(Test kiểm tra tích hợp WASM)*

---

### 🔹 Commit: Step 3.6 — Excel Mission Refinement & Light Mode Stabilization
- **Thời gian:** 21/08/2026 - 22/08/2026
- **Nội dung trọng tâm:**
  - Tối ưu giao diện Excel Mission Workspace theo bảng màu "Detective Amber" tương thích cả Light Mode & Dark Mode.
  - Cải tiến Side-drawer gợi ý (Non-modal) và tính năng Pin-to-fx (ghim gợi ý trực tiếp vào thanh công thức).
- **File điều chỉnh:**
  - `src/components/excel/HintPanel.jsx` *(Cải tiến Non-modal drawer & Pin-to-fx)*
  - `src/components/excel/FormulaBar.jsx` *(Hiển thị ghim hint nội tuyến)*
  - `src/pages/learner/ExcelMissionPage.jsx` *(Đồng bộ layout & theme mode)*

---

## 📌 Bảng Tổng Hợp Trạng Thái Các Component SQL Engine

| Component / Utility | File Mã Nguồn | File Test Tương Ứng | Trạng Thái |
| :--- | :--- | :--- | :---: |
| **SQL WASM Adapter** | `src/services/sqlEngineAdapter.js` | Integration Verified | 🟢 DONE |
| **SQL Mission Service** | `src/services/mock/mockSqlMissionService.js` | `mockSqlMissionService.test.js` | 🟢 DONE |
| **SQL Query Policy** | `src/utils/sql/sqlQueryPolicy.js` | `sqlQueryPolicy.test.js` | 🟢 DONE |
| **SQL Error Translator** | `src/utils/sql/sqlErrorTranslator.js` | `sqlErrorTranslator.test.js` | 🟢 DONE |
| **SQL Schema Browser** | `src/components/sql/SchemaBrowser.jsx` | `SchemaBrowser.test.jsx` | 🟢 DONE |
