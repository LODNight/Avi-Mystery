# Dự Án Avi-Farm (DataQuest) — Backlog

> **Quy tắc đặt mã Task:** `[AREA]-[MODULE]-[NUMBER]` (Ví dụ: `LRN-COURSE-001`, `ADM-MISSION-001`, `SHR-AUTH-001`, `BE-COURSE-001`).
> **Quy tắc quản lý trạng thái:**
> - `TODO`: Chưa bắt đầu.
> - `IN_PROGRESS`: Đang thực hiện trong Sprint hiện tại.
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
| `LRN-EXCEL-001` | Trang làm bài Excel Workspace & Spreadsheet Grid (`/practice`) | `LRN` | `High` | `TODO` | Giao diện bảng tính interactive, Formula Bar & Cell Selector |
| `BE-SUB-001` | Mock Submission Service & Xử lý nộp bài | `BE` | `Medium` | `TODO` | Service ghi nhận lượt nộp bài, tính XP thưởng và kết quả pass/fail |

---

## Technical Debts & Refactoring Backlog

| Task ID | Mô tả Debt | Area | Mức ảnh hưởng | Ưu tiên | Trạng thái |
|---|---|---|---|---|---|
| `SHR-DEBT-001` | Chuẩn hóa Toast Notification System | `SHR` | Nông | `Low` | `TODO` | Thay thế `alert()` bằng custom Toast component cho feedback thao tác |
