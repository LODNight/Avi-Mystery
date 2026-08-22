# Dự Án Avi-Mystery — Backlog

> **Quy tắc đặt mã Task:** `[AREA]-[MODULE]-[NUMBER]` (Ví dụ: `LRN-COURSE-001`, `ADM-MISSION-001`, `SHR-AUTH-001`, `BE-COURSE-001`).
> Các ID `BE-*` của Sprint 1–2 là legacy IDs cho frontend mock adapters; ownership mới dùng [`agent/MODULE_MAP.md`](./agent/MODULE_MAP.md), trong đó `BE` dành cho Backend API Sprint 7.
> **Quy tắc quản lý trạng thái:**
> - `TODO`: Chưa bắt đầu.
> - `READY`: Đã chốt scope và có thể bắt đầu khi người dùng yêu cầu.
> - `IN_PROGRESS`: Đang thực hiện trong Sprint hiện tại.
> - `PARTIAL`: Đã có code nhưng chưa đạt contract hoặc Acceptance Criteria hiện hành.
> - `BLOCKED`: Đang bị tắc nghẽn do phụ thuộc.
> - `DONE`: Đã hoàn thành và pass đầy đủ Acceptance Criteria & Test.

---

## Sprint 1 — Frontend Foundation Tasks

| Task ID | Tiêu đề Task | Area | Mức ưu tiên | Trạng thái | Ghi chú / Acceptance Criteria |
|---|---|---|---|---|---|
| `SHR-SHELL-001` | Khởi tạo Vite + React + Tailwind App Shell | `SHR` | `High` | `DONE` | LearnerLayout & AdminLayout đầy đủ Sidebar & Navbar responsive |
| `SHR-AUTH-001` | Tích hợp Design System Detective Amber | `SHR` | `High` | `DONE` | Hỗ trợ Dark Mode & Light Mode, tone màu hổ phách |
| `BE-SERVICE-001` | Xây dựng Service Contract & Mock Adapters | `BE` | `High` | `DONE` | Tách biệt `authService`, `courseService`, `missionService` |
| `SHR-AUTH-002` | Cấu hình Route Guards & Role-based Access | `SHR` | `High` | `DONE` | Chặn truy cập trái phép giữa Admin và Learner |
| `SHR-UI-001` | Phát triển các UI Components cơ bản | `SHR` | `Medium` | `DONE` | Button, Card, Input, Badge, Skeleton, EmptyState |
| `SHR-TEST-001` | Thêm Test Infrastructure & Test Suites | `SHR` | `High` | `DONE` | Viết Vitest unit/component test cho Skeleton, EmptyState & Mock Services |
| `SHR-DOCS-001` | Khởi tạo Bộ Tài liệu Tiến độ Dự án | `SHR` | `Medium` | `DONE` | 5 file tài liệu tiêu chuẩn trong `docs/` |

---

## Sprint 2 — Course & Learning Map Tasks

| Task ID | Tiêu đề Task | Area | Mức ưu tiên | Trạng thái | Ghi chú / Acceptance Criteria |
|---|---|---|---|---|---|
| `LRN-COURSE-001` | Trang Danh sách Khóa học & Bộ lọc (`/courses`) | `LRN` | `High` | `DONE` | Hiển thị danh sách khóa học Excel/SQL, lọc theo từ khóa, công cụ & độ khó |
| `LRN-COURSE-002` | Trang Chi tiết Khóa học (`/courses/:slug`) | `LRN` | `High` | `DONE` | Hiển thị thông tin khóa học, accordion chương học & danh sách bài học |
| `LRN-MAP-001` | Xây dựng Component & Trang Learning Map (`/map`) | `LRN` | `High` | `DONE` | Bản đồ học tập hiển thị các node nhiệm vụ có kết nối trực quan |
| `LRN-MISSION-001` | Trang Giới thiệu & Nhận Nhiệm vụ vụ án (`/missions/:missionId`) | `LRN` | `Medium` | `DONE` | Bối cảnh vụ án, mục tiêu và điểm thưởng XP trước khi làm bài |

---

## Sprint 3 — Excel Vertical Slice Tasks

| Task ID | Tiêu đề Task | Area | Mức ưu tiên | Trạng thái | Ghi chú / Acceptance Criteria |
|---|---|---|---|---|---|
| `SHR-EXCEL-CHECKER-001` | Bộ chấm điểm công thức Excel Answer Checker (`excelChecker.js`) | `SHR` | `High` | `DONE` | Chuẩn hóa cú pháp công thức, phân tích ô tính & chấm điểm tự động |
| `LRN-EXCEL-001` | Excel Mission Shell (`/missions/:missionId/workspace`) | `LRN-EXCEL` | `High` | `DONE` | Mission/dataset loading và learner workspace |
| `LRN-EXCEL-002` | Spreadsheet Grid, Formula Bar và Toolbar | `LRN-EXCEL` | `High` | `DONE` | Cell state, formula input, Run/Reset/Hint và component tests |
| `LRN-SUB-3.4` | Submission Contract & Feedback Flow | `LRN-SUB` | `High` | `DONE` | Shared contract/gateway; async mock; structured error/retry; duplicate/replay guard; inline feedback; success modal; không mutate XP |
| `LRN-SUB-3.4E` | Submission UI Stabilization | `LRN-SUB` | `High` | `DONE` | Xác minh feedback/loading/retry/modal/responsive/a11y; hoàn thành gate 3.4E |
| `SHR-3.5` | Learner UI Foundation & Stabilization | `SHR` | `High` | `DONE` | UI inventory, shared primitives, Learner layout/navigation, Mission layout, responsive/a11y và regression pass |
| `LRN-UI-3.6` | Light Mode Refinement & Accessibility | `LRN-EXCEL` | `High` | `DONE` | Light mode theme tokens, secondary action buttons neutral tone, FormulaBar & SpreadsheetGrid contrast, Smart Visibility target cell badge |

Task `BE-SUB-001` cũ được thay bằng `LRN-SUB-3.4` để phản ánh đúng ownership. Backend thật vẫn thuộc Sprint 7.

---

## Sprint 4 — SQL Vertical Slice Tasks

| Task ID | Tiêu đề Task | Area | Mức ưu tiên | Trạng thái | Ghi chú / Acceptance Criteria |
|---|---|---|---|---|---|
| `LRN-SQL-4.1-ENGINE` | In-Browser SQL Engine Adapter & Schema Browser | `LRN-SQL` | `High` | `IN_PROGRESS` | Tích hợp SQLite WASM / engine adapter & component Schema Browser |
| `LRN-SQL-4.2-EDITOR` | SQL Code Editor & Result Viewer | `LRN-SQL` | `High` | `TODO` | Syntax highlighter, SQL editor UI & Query result table |
| `LRN-SQL-4.3-SUB` | SQL Result Evaluator & Submission | `LRN-SQL` | `High` | `TODO` | Dynamic query dataset comparator & Submission contract integration |

---

## Technical Debts & Refactoring Backlog

| Task ID | Mô tả Debt | Area | Mức ảnh hưởng | Ưu tiên | Trạng thái |
|---|---|---|---|---|---|
| `SHR-DEBT-001` | Chuẩn hóa Toast Notification System | `SHR` | Nông | `Low` | `TODO` | Thay thế `alert()` bằng custom Toast component cho feedback thao tác |
