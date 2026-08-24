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
| `LRN-SQL-4.0-SPIKE` | Technical Spike & SQL Contracts | `LRN-SQL` | `Critical` | `DONE` | `sql.js@1.14.2`, Worker/WASM, contracts, policy và browser/build gate đã pass |
| `LRN-SQL-4.1A-WORKER` | WASM Packaging & Worker Transport | `LRN-SQL` | `High` | `DONE` | Request ID correlation, out-of-order & stale filter, lazy-loading, build gating, unit 7/7 & regression 148/148 pass |
| `LRN-SQL-4.1B-LIFECYCLE` | Database Lifecycle, Seed, Reset & Schema API | `LRN-SQL` | `High` | `DONE` | `getSchema` + `sampleRows`, deterministic seed/reset, lifecycle test 7/7, dataset validation 8/8, SQL 27/27 pass |
| `LRN-SQL-4.1C-POLICY` | Read-only Policy, Timeout & Row Limit | `LRN-SQL` | `Critical` | `DONE` | Single read-only statement, recovery, mutation/DDL guard và resource limits verified |
| `LRN-SQL-4.2-SCHEMA` | Schema Browser | `LRN-SQL` | `High` | `DONE` | Accessible table/column metadata, sample rows and component states verified |
| `LRN-SQL-4.3-SHELL` | SQL Mission Shell, Loader & Route | `LRN-SQL` | `High` | `DONE` | Typed SQL content gateway, lifecycle cleanup, isolated route `/missions/:missionId/sql` and Excel regression gate |
| `LRN-SQL-4.4-EDITOR` | SQL Editor MVP | `LRN-SQL` | `Medium` | `DONE` | Controlled editor (`SqlEditor.jsx`), starter query, Reset/Run, Tab soft 2-spaces, Ctrl+Enter keyboard shortcut |
| `LRN-SQL-4.5-RESULTS` | Query Execution & Result Viewer | `LRN-SQL` | `High` | `DONE` | Run execution wire-up, ResultViewer component, NULL/number formatting, thousand separator, action button, sticky height constraint, column compacting, caret pixel-alignment & integration tests (191 tests pass) |
| `LRN-SQL-4.6-CHECKER` | SQL Result Checker | `LRN-SQL` | `Critical` | `DONE` | Order/NULL/duplicate/tolerance-aware pure evaluator (`sqlChecker.js`), construct validation, feedback codes & 17 unit tests pass |
| `LRN-SUB-4.7-SQL` | SQL Submission Integration | `LRN-SUB` | `Critical` | `DONE` | Mở rộng `mockSubmissionService.js` hỗ trợ SQL, tích hợp submission flow & `MissionResultModal` vào `SqlMissionPage.jsx`, unit & integration tests pass (222 tests pass) |
| `LRN-SQL-4.8A-SECURITY` | Query Security Policy & Resource Limits Guard | `LRN-SQL` | `Critical` | `DONE` | Read-only policy, multi-statement injection guard, timeout 3s & row truncation 500 rows |
| `LRN-SQL-4.8B-LIFECYCLE` | Web Worker & Database Lifecycle Cleanup | `LRN-SQL` | `High` | `DONE` | Worker `dispose()` memory cleanup on route unmount and dataset switching |
| `LRN-SQL-4.8C-UI` | Responsive Design & Theme Polish | `LRN-SQL` | `Medium` | `DONE` | Light/Dark theme visual fidelity & responsive layout tuning across screen sizes |
| `LRN-SQL-4.8D-GATE` | Production WASM Build & Full Regression Gate | `LRN-SQL` | `Critical` | `DONE` | Vite WASM build packaging & 222+ test suite full Excel/SQL regression pass |
| `GAM-XP-5.1-LEVELING` | Leveling Engine & XP Calculator | `GAME` | `Critical` | `IN_PROGRESS` | Level formula, cumulative XP calculation & Level Up Modal animation |

---

## Technical Debts & Refactoring Backlog

| Task ID | Mô tả Debt | Area | Mức ảnh hưởng | Ưu tiên | Trạng thái |
|---|---|---|---|---|---|
| `SHR-DEBT-001` | Chuẩn hóa Toast Notification System | `SHR` | Nông | `Low` | `TODO` | Thay thế `alert()` bằng custom Toast component cho feedback thao tác |
