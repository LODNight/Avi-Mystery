# Dự Án Avi-Mystery — Backlog

> **Quy tắc đặt mã Task:** `[AREA]-[MODULE]-[NUMBER]` (Ví dụ: `LRN-COURSE-001`, `ADM-MISSION-001`, `SHR-AUTH-001`, `CNT-CFG-5.1`, `GAM-XP-6.1`).
> Các ID `BE-*` của Sprint 1–2 là legacy IDs cho frontend mock adapters; ownership mới dùng [`agent/MODULE_MAP.md`](./agent/MODULE_MAP.md), trong đó `BE` dành cho Backend API Sprint 9.
> **Quy tắc quản lý trạng thái:**
> - `CURRENT`: Đã hoàn thành trong codebase thực tế.
> - `READY`: Đã chốt scope và có thể bắt đầu khi người dùng yêu cầu.
> - `IN_PROGRESS`: Đang thực hiện trong Step hiện tại.
> - `PLANNED`: Thuộc kế hoạch Sprint đã được phê duyệt.
> - `PROPOSED`: Định hướng tính năng tương lai.
> - `DEPRECATED`: Mô hình hoặc adapter cũ cần thay thế.
> - `LEGACY`: Cấu trúc cũ từ các phiên bản ban đầu.

---

## Sprint 1 — Frontend Foundation Tasks (`CURRENT`)

| Task ID | Tiêu đề Task | Area | Mức ưu tiên | Trạng thái | Ghi chú / Acceptance Criteria |
|---|---|---|---|---|---|
| `SHR-SHELL-001` | Khởi tạo Vite + React + Tailwind App Shell | `SHR` | `High` | `CURRENT` | LearnerLayout & AdminLayout đầy đủ Sidebar & Navbar responsive |
| `SHR-AUTH-001` | Tích hợp Design System Detective Amber | `SHR` | `High` | `CURRENT` | Hỗ trợ Dark Mode & Light Mode, tone màu hổ phách |
| `BE-SERVICE-001` | Xây dựng Service Contract & Mock Adapters | `BE` | `High` | `CURRENT` | Tách biệt `authService`, `courseService`, `missionService` |
| `SHR-AUTH-002` | Cấu hình Route Guards & Role-based Access | `SHR` | `High` | `CURRENT` | Chặn truy cập trái phép giữa Admin và Learner |
| `SHR-UI-001` | Phát triển các UI Components cơ bản | `SHR` | `Medium` | `CURRENT` | Button, Card, Input, Badge, Skeleton, EmptyState |
| `SHR-TEST-001` | Thêm Test Infrastructure & Test Suites | `SHR` | `High` | `CURRENT` | Viết Vitest unit/component test cho Skeleton, EmptyState & Mock Services |
| `SHR-DOCS-001` | Khởi tạo Bộ Tài liệu Tiến độ Dự án | `SHR` | `Medium` | `CURRENT` | 5 file tài liệu tiêu chuẩn trong `docs/` |

---

## Sprint 2 — Course & Learning Map Baseline Tasks (`CURRENT`)

| Task ID | Tiêu đề Task | Area | Mức ưu tiên | Trạng thái | Ghi chú / Acceptance Criteria |
|---|---|---|---|---|---|
| `LRN-COURSE-001` | Trang Danh sách Khóa học & Bộ lọc (`/courses`) | `LRN` | `High` | `CURRENT` | Hiển thị danh sách khóa học Excel/SQL, lọc theo từ khóa, công cụ & độ khó |
| `LRN-COURSE-002` | Trang Chi tiết Khóa học (`/courses/:slug`) | `LRN` | `High` | `CURRENT` | Hiển thị thông tin khóa học, accordion chương học & danh sách bài học |
| `LRN-MAP-001` | Xây dựng Component & Trang Learning Map (`/map`) | `LRN` | `High` | `CURRENT` | Bản đồ học tập hiển thị các node nhiệm vụ có kết nối trực quan |
| `LRN-MISSION-001` | Trang Giới thiệu & Nhận Nhiệm vụ vụ án (`/missions/:missionId`) | `LRN` | `Medium` | `CURRENT` | Bối cảnh vụ án, mục tiêu và điểm thưởng XP trước khi làm bài |

---

## Sprint 3 — Excel Vertical Slice Tasks (`CURRENT`)

| Task ID | Tiêu đề Task | Area | Mức ưu tiên | Trạng thái | Ghi chú / Acceptance Criteria |
|---|---|---|---|---|---|
| `SHR-EXCEL-CHECKER-001` | Bộ chấm điểm công thức Excel Answer Checker (`excelChecker.js`) | `SHR` | `High` | `CURRENT` | Chuẩn hóa cú pháp công thức, phân tích ô tính & chấm điểm tự động |
| `LRN-EXCEL-001` | Excel Mission Shell (`/missions/:missionId/workspace`) | `LRN-EXCEL` | `High` | `CURRENT` | Mission/dataset loading và learner workspace |
| `LRN-EXCEL-002` | Spreadsheet Grid, Formula Bar và Toolbar | `LRN-EXCEL` | `High` | `CURRENT` | Cell state, formula input, Run/Reset/Hint và component tests |
| `LRN-SUB-3.4` | Submission Contract & Feedback Flow | `LRN-SUB` | `High` | `CURRENT` | Shared contract/gateway; async mock; structured error/retry; không mutate XP |
| `LRN-SUB-3.4E` | Submission UI Stabilization | `LRN-SUB` | `High` | `CURRENT` | Xác minh feedback/loading/retry/modal/responsive/a11y; hoàn thành gate 3.4E |
| `SHR-3.5` | Learner UI Foundation & Stabilization | `SHR` | `High` | `CURRENT` | UI inventory, shared primitives, Learner layout/navigation, Mission layout |
| `LRN-UI-3.6` | Light Mode Refinement & Accessibility | `LRN-EXCEL` | `High` | `CURRENT` | Light mode theme tokens, secondary action buttons neutral tone |

---

## Sprint 4 — SQL Vertical Slice Tasks (`CURRENT`)

| Task ID | Tiêu đề Task | Area | Mức ưu tiên | Trạng thái | Ghi chú / Acceptance Criteria |
|---|---|---|---|---|---|
| `LRN-SQL-4.0-SPIKE` | Technical Spike & SQL Contracts | `LRN-SQL` | `Critical` | `CURRENT` | `sql.js@1.14.2`, Worker/WASM, contracts, policy và browser/build gate đã pass |
| `LRN-SQL-4.1A-WORKER` | WASM Packaging & Worker Transport | `LRN-SQL` | `High` | `CURRENT` | Request ID correlation, out-of-order & stale filter, lazy-loading |
| `LRN-SQL-4.1B-LIFECYCLE` | Database Lifecycle, Seed, Reset & Schema API | `LRN-SQL` | `High` | `CURRENT` | `getSchema` + `sampleRows`, deterministic seed/reset |
| `LRN-SQL-4.1C-POLICY` | Read-only Policy, Timeout & Row Limit | `LRN-SQL` | `Critical` | `CURRENT` | Single read-only statement, recovery, mutation/DDL guard và resource limits verified |
| `LRN-SQL-4.2-SCHEMA` | Schema Browser | `LRN-SQL` | `High` | `CURRENT` | Accessible table/column metadata, sample rows and component states verified |
| `LRN-SQL-4.3-SHELL` | SQL Mission Shell, Loader & Route | `LRN-SQL` | `High` | `CURRENT` | Typed SQL content gateway, lifecycle cleanup, isolated route `/missions/:missionId/sql` |
| `LRN-SQL-4.4-EDITOR` | SQL Editor MVP | `LRN-SQL` | `Medium` | `CURRENT` | Controlled editor (`SqlEditor.jsx`), starter query, Reset/Run, Tab soft 2-spaces, Ctrl+Enter |
| `LRN-SQL-4.5-RESULTS` | Query Execution & Result Viewer | `LRN-SQL` | `High` | `CURRENT` | Run execution wire-up, ResultViewer component, NULL/number formatting, sticky height |
| `LRN-SQL-4.6-CHECKER` | SQL Result Checker | `LRN-SQL` | `Critical` | `CURRENT` | Order/NULL/duplicate/tolerance-aware pure evaluator (`sqlChecker.js`) |
| `LRN-SQL-4.7-SUB` | SQL Submission Integration | `LRN-SUB` | `Critical` | `CURRENT` | Mở rộng `mockSubmissionService.js` hỗ trợ SQL, tích hợp submission flow & modal |
| `LRN-SQL-4.8-GATE` | WASM Security Guard & Full Build Gate | `LRN-SQL` | `Critical` | `CURRENT` | Read-only guard, worker cleanup, theme polish & Vite WASM build 222+ tests pass |

---

## Sprint 5 — Content Domain & Dataset Decoupling Tasks (`PLANNED`)

| Task ID | Tiêu đề Task | Area | Mức ưu tiên | Trạng thái | Ghi chú / Acceptance Criteria |
|---|---|---|---|---|---|
| `CNT-CFG-5.1` | Evaluation Config Extraction out of Submission Adapter | `CNT` | `Critical` | `PLANNED` | Bóc tách hardcoded `EXCEL_CHECKER_CONFIG` & `SQL_CHECKER_CONFIG` khỏi submission service |
| `CNT-SEP-5.2` | Investigation, Question & Variant Domain Separation | `CNT` | `High` | `PLANNED` | Chuẩn hóa schema phân tách bối cảnh vụ án (`Investigation`) và nhiệm vụ kỹ thuật (`Question`) |
| `DATA-REG-5.3` | Dataset Domain Independence & Schema Registry | `DATA` | `High` | `PLANNED` | Tạo `datasetService` cho phép nạp và dùng chung dataset cho nhiều Question mà không nhân bản dữ liệu |

---

## Sprint 6 — Game Progress & Progression Architecture Tasks (`PLANNED`)

| Task ID | Tiêu đề Task | Area | Mức ưu tiên | Trạng thái | Ghi chú / Acceptance Criteria |
|---|---|---|---|---|---|
| `GAM-XP-6.1` | Deterministic Leveling Engine & Idempotent XP Ledger | `GAME` | `Critical` | `PLANNED` | Xây dựng pure `levelingEngine.js` (Level 1–50) và contract `progressService` trao thưởng idempotent |
| `GAM-MST-6.2` | Main Quest vs Practice Mode & Mastery Tracking | `GAME` | `High` | `PLANNED` | Phân biệt tiến độ Main Quest cốt truyện và Practice tự do; tính điểm thành thạo Mastery |
| `GAM-MAP-6.3` | Dynamic Learning Map Progression Hook | `GAME` | `High` | `PLANNED` | Thay thế dữ liệu locked/unlocked hardcode bằng `useProgress` hook thời gian thực trên `LearningMapPage` |

---

## Sprint 7 — Learner Engagement & Practice Engine Tasks (`PROPOSED`)

| Task ID | Tiêu đề Task | Area | Mức ưu tiên | Trạng thái | Ghi chú / Acceptance Criteria |
|---|---|---|---|---|---|
| `GAM-UI-7.1` | Level Up Popups & Streak Counter | `GAME` | `Medium` | `PROPOSED` | Hiệu ứng hoạt họa khi thăng cấp và bộ đếm chuỗi ngày học liên tục |
| `LRN-PRAC-7.2` | Standalone Practice Workspace & Question Bank | `LRN` | `Medium` | `PROPOSED` | Giao diện giải bài tập tự do tách biệt khỏi cốt truyện chính |
| `GAME-PROF-7.3` | Learner Profile & Achievement Badges Page | `GAME` | `Medium` | `PROPOSED` | Trang Hồ sơ cá nhân (`/profile`) và bảng huy hiệu danh hiệu thám tử |

---

## Technical Debts & Refactoring Backlog

| Task ID | Mô tả Debt | Area | Mức ảnh hưởng | Ưu tiên | Trạng thái |
|---|---|---|---|---|---|
| `SHR-DEBT-001` | Chuẩn hóa Toast Notification System | `SHR` | Nông | `Low` | `PLANNED` | Thay thế `alert()` bằng custom Toast component cho feedback thao tác |
| `CNT-DEBT-002` | Thu dọn legacy missionId alias mapping | `CNT` | Vừa | `Medium` | `PROPOSED` | Loại bỏ hoàn toàn alias missionId khi bóc tách xong `InvestigationId` / `QuestionId` |
