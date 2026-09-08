

--- Content of docs/BACKLOG.md ---

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

## Sprint 5 — Content Domain & Dataset Decoupling Tasks (`CURRENT`)

| Task ID | Tiêu đề Task | Area | Mức ưu tiên | Trạng thái | Ghi chú / Acceptance Criteria |
|---|---|---|---|---|---|
| `CNT-CFG-5.1` | Evaluation Config Extraction out of Submission Adapter | `CNT` | `Critical` | `CURRENT` | Bóc tách hardcoded `EXCEL_CHECKER_CONFIG` & `SQL_CHECKER_CONFIG` khỏi submission service |
| `CNT-SEP-5.2` | Investigation, Question & Variant Domain Separation | `CNT` | `High` | `CURRENT` | Chuẩn hóa schema phân tách bối cảnh vụ án (`Investigation`) và nhiệm vụ kỹ thuật (`Question`) |
| `DATA-REG-5.3` | Dataset Domain Independence & Schema Registry | `DATA` | `High` | `CURRENT` | Tạo `datasetService` cho phép nạp và dùng chung dataset cho nhiều Question mà không nhân bản dữ liệu |
| `LRN-PROG-5.6` | Learner Progress State & Records | `GAME` | `High` | `CURRENT` | Tạo `learnerProgress.js` & `progressService.js` theo dõi trạng thái hoàn thành bài học |
| `GAM-REWD-5.7` | XP Reward Integration & Idempotent Ledger | `GAME` | `Critical` | `CURRENT` | Xây dựng `rewardEvaluator.js` hỗ trợ trao thưởng XP độc lập và Idempotent |

---

## Sprint 6 — Game Progress & Progression Architecture Tasks (`CURRENT`)

| Task ID | Tiêu đề Task | Area | Mức ưu tiên | Trạng thái | Ghi chú / Acceptance Criteria |
|---|---|---|---|---|---|
| `GAM-XP-6.1` | Deterministic Leveling Engine & Idempotent XP Ledger | `GAME` | `Critical` | `CURRENT` | Xây dựng pure `levelingEngine.js` (Level 1–50) và contract `progressService` trao thưởng idempotent |
| `GAM-MST-6.2` | Main Quest vs Practice Mode & Mastery Tracking | `GAME` | `High` | `CURRENT` | Phân biệt tiến độ Main Quest cốt truyện và Practice tự do; tính điểm thành thạo Mastery (`masteryEvaluator.js`) |
| `GAM-MAP-6.3` | Dynamic Learning Map Progression Hook | `GAME` | `High` | `CURRENT` | Tích hợp `useProgress` hook thời gian thực và `learningMapAdapter` trên `LearningMapPage` |

---

## Sprint 6.5 — Learner Onboarding & First-Run Experience Tasks (`CURRENT`)

| Task ID | Tiêu đề Task | Area | Mức ưu tiên | Trạng thái | Ghi chú / Acceptance Criteria |
|---|---|---|---|---|---|
| `LRN-ONB-6.5.1` | Onboarding State & Service Engine | `LRN` | `High` | `CURRENT` | `onboardingService.js` quản lý state cách ly per-user, transition guards |
| `LRN-ONB-6.5.2` | Welcome Gate Screen & Route Guard | `LRN` | `High` | `CURRENT` | Màn hình `WelcomeGatePage.jsx` full-screen, chuyển hướng sau đăng ký |
| `LRN-ONB-6.5.3` | Tutorial Case 0 Content & Evaluator | `LRN` | `High` | `CURRENT` | Nội dung Tutorial Case 0 (`tutorialCase0Content.js`), bộ chấm điểm tối giản |
| `LRN-ONB-6.5.4` | Minimal Case 0 Workspace & Guided Spotlight | `LRN` | `High` | `CURRENT` | `TutorialCase0Page.jsx` với spotlight 4 bước dẫn dắt trực quan |
| `LRN-ONB-6.6` | Dashboard Deep Guided Tour 5-Step Spotlight | `LRN` | `High` | `CURRENT` | Guided Tour 5 bước giới thiệu toàn diện các khu vực trên Dashboard |
| `ADM-ONB-6.7` | Admin Dev Testing Tools for Onboarding | `ADM` | `Medium` | `CURRENT` | Công cụ 1-click reset state onboarding và tour cho Admin |

---

## Sprint 7 — Learner Engagement & Practice Engine Tasks (`CURRENT`)

| Task ID | Tiêu đề Task | Area | Mức ưu tiên | Trạng thái | Ghi chú / Acceptance Criteria |
|---|---|---|---|---|---|
| `GAM-UI-7.1` | Level Up Popups & Streak Counter | `GAME` | `Medium` | `CURRENT` | `LevelUpModal.jsx` + `StreakDetailModal.jsx` — tích hợp Sidebar + 10/10 unit tests PASS |
| `LRN-PRAC-7.2` | Standalone Practice Workspace & Question Bank | `LRN` | `Medium` | `CURRENT` | Giao diện giải bài tập tự do tách biệt khỏi cốt truyện chính (`/practice`) |
| `GAME-PROF-7.3` | Learner Profile & Achievement Badges Page | `GAME` | `Medium` | `CURRENT` | Trang Hồ sơ cá nhân (`/profile`) và bảng huy hiệu danh hiệu thám tử (`/achievements`) |
| `GAME-HIST-7.4` | Activity History Timeline Page | `GAME` | `Medium` | `CURRENT` | Dải timeline lịch sử hoạt động học tập của người dùng (`/profile/history`) |
| `SYS-FB-7.5` | Firebase Production Infrastructure Migration | `SHR` | `Critical` | `CURRENT` | Di chuyển lưu trữ XP, Progress, Achievements, History sang Firebase Firestore thời gian thực |

---

## Sprint 8 — Admin Content Studio Tasks (`CURRENT`)

| Task ID | Tiêu đề Task | Area | Mức ưu tiên | Trạng thái | Ghi chú / Acceptance Criteria |
|---|---|---|---|---|---|
| `ADM-STUDIO-8.1` | Visual Investigation & Question Authoring Studio | `ADM` | `Critical` | `CURRENT` | `adminContentService`, `AdminMissionsPage`, `AdminMissionEditorPage`, `AdminCoursesPage`, `AdminChaptersPage` |
| `ADM-DATA-8.2` | Dataset Importer & SQLite Schema Generator | `ADM` | `High` | `CURRENT` | `AdminDatasetsPage`, trình phân tích CSV/text, tự động đoán kiểu dữ liệu và sinh DDL SQLite |
| `ADM-PREV-8.3` | Admin Live Preview & Test Runner Sandbox | `ADM` | `High` | `CURRENT` | Modal `AdminTestRunnerModal.jsx`, kiểm thử Excel/SQL sandbox an toàn độc lập |
| `ADM-READMODEL-8.4`| Materialized Learning Map Read Model & Sync | `ADM` | `Critical` | `CURRENT` | `learningMapProjector.js`, tạo collection `learning_map_views` giải quyết triệt để N+1 queries |
| `ADM-GUIDE-8.5` | Admin Workflow & Operational Guide Page | `ADM` | `Medium` | `CURRENT` | Trang `AdminGuidePage.jsx` giải thích trực quan luồng tạo và xuất bản dữ liệu |

---

## Technical Debts & Refactoring Backlog

| Task ID | Mô tả Debt | Area | Mức ảnh hưởng | Ưu tiên | Trạng thái |
|---|---|---|---|---|---|
| `SHR-DEBT-001` | Chuẩn hóa Toast Notification System | `SHR` | Nông | `Low` | `PLANNED` | Thay thế `alert()` bằng custom Toast component cho feedback thao tác |
| `CNT-DEBT-002` | Thu dọn legacy missionId alias mapping | `CNT` | Vừa | `Medium` | `PROPOSED` | Loại bỏ hoàn toàn alias missionId khi bóc tách xong `InvestigationId` / `QuestionId` |
| `LRN-DEBT-003` | Knowledge Hub Markdown Parser Performance | `LRN` | Vừa | `Medium` | `PROPOSED` | Nâng cấp `KnowledgeViewer` từ custom regex sang `react-markdown` để render ổn định hơn |
| `BE-DEBT-004` | Knowledge Service Pagination & Indexing | `BE` | Vừa | `Low` | `PROPOSED` | Thêm pagination và Firestore index cho `knowledgeService` khi lượng bài học tăng lên |


--- Content of docs/CHECKLIST.md ---

# Bảng Theo Dõi Tiến Độ Chi Tiết Theo Từng Step — Avi-Mystery

> **Cập nhật lần cuối:** 27/08/2026
> **Mô tả:** Bảng danh mục công việc chi tiết chia theo từng Step cho toàn bộ các Sprint của dự án **Avi-Mystery**.
> **Nguồn trạng thái task hiện tại:** [`agent/CURRENT_TASK.md`](./agent/CURRENT_TASK.md).

---

## 🟢 Sprint 1 — Frontend Foundation & RBAC System *(CURRENT — Hoàn thành 100%)*

### 🔹 Step 1.1: Khung Hạ Tầng & Phân Quyền Route Guards
- [x] Khởi tạo hệ thống router chính với React Router v6
- [x] Thiết lập RBAC Route Guards (Protect routes theo 3 roles: Unauthenticated, Learner, Admin)
- [x] Xây dựng Learner Layout với Sidebar mở rộng/thu gọn và Top Navigation Bar
- [x] Xây dựng Admin Layout với Sidebar riêng biệt dành cho Quản trị viên

### 🔹 Step 1.2: Design System Detective Amber & UI Kit
- [x] Thiết lập bảng màu Detective Amber & CSS Variables hỗ trợ chế độ Sáng/Tối (Light/Dark mode)
- [x] Xây dựng bộ UI Component Kit tiêu chuẩn: `Button`, `Card`, `Input`, `Badge`
- [x] Xây dựng Accessible Loading Skeletons (`aria-busy="true"`) tránh Layout Shift
- [x] Xây dựng các thành phần xử lý trạng thái tiêu chuẩn: `EmptyState`, `ErrorState`, `ProgressBar`

### 🔹 Step 1.3: Trang Lõi Ban Đầu & Service Layer Baseline
- [x] Xây dựng Trang Tổng quan Người học (Learner Dashboard)
- [x] Xây dựng Trang Tổng quan Quản trị viên (Admin Overview)
- [x] Khởi tạo các Mock Service Adapters (`mockAuthService`, `mockCourseService`, `mockMissionService`)
- [x] Cấu hình môi trường kiểm thử Vitest & React Testing Library

---

## 🟢 Sprint 2 — Course, Learning Map & Admin Management *(CURRENT — Hoàn thành 100%)*

### 🔹 Step 2.1: Luồng Khám Phá Khóa Học
- [x] Xây dựng Trang Danh sách Khóa học (`/courses`) kèm bộ lọc Tìm kiếm từ khóa, Công cụ (Excel/SQL) & Độ khó
- [x] Xây dựng Trang Chi tiết Khóa học (`/courses/:slug`) hiển thị Accordion danh sách chương & bài học

### 🔹 Step 2.2: Bản Đồ Học Tập & Hồ Sơ Vụ Án
- [x] Xây dựng Trang Bản đồ Học tập dạng cây Node tương tác (`/map`) hiển thị các nút vụ án
- [x] Xây dựng Màn hình Hồ sơ & Briefing Vụ án (`/missions/:missionId`) với câu chuyện bối cảnh, mục tiêu & thưởng XP

### 🔹 Step 2.3: Quản Lý Trạng Thái Trang & Chế Độ Bảo Trì Admin
- [x] Xây dựng Trang Quản lý Trạng thái Trang trong Admin Settings (`/admin/settings?tab=pages`)
- [x] Xây dựng `PageStatusProvider` & `usePageStatus` hook thời gian thực
- [x] Xây dựng Màn hình Bảo trì Tự động `UnderMaintenancePage` chặn truy cập học viên khi trang bảo trì
- [x] Thêm tính năng cho phép Admin xem trước trang bảo trì (Bypass Maintenance Guard)

### 🔹 Step 2.4: Đổi Tên Thương Hiệu & Kiểm Thử Toàn Hệ Thống
- [x] Đổi tên thương hiệu dự án từ DataQuest thành **Avi-Mystery** trên toàn hệ thống UI, CSS & Tài liệu
- [x] Cập nhật bộ test suite và xác minh regression tại thời điểm hoàn thành Sprint 2

---

## 🟢 Sprint 3 — Excel Vertical Slice *(CURRENT — Hoàn thành 100%)*

### 🔹 Step 3.0: Transition Audit & Bộ Chấm Điểm Công Thức *(HOÀN THÀNH)*
- [x] Kiểm tra 100% điều kiện Gate của Sprint 1 & Sprint 2
- [x] Xây dựng bộ chấm công thức `excelChecker.js` (Chuẩn hóa công thức, so sánh kết quả & hàm tính toán SUM, AVERAGE, MIN, MAX)
- [x] Viết bộ test unit cho `excelChecker.test.js`

### 🔹 Step 3.1: Excel Mission Shell & Kết Nối Dataset *(HOÀN THÀNH)*
- [x] Khởi tạo tệp mock dataset `datasets.json` cho vụ án Sales Orders & Customers
- [x] Bổ sung `getDataset(datasetId)` vào `mockMissionService.js` kèm bộ test unit
- [x] Xây dựng Màn hình `ExcelMissionPage.jsx` (`/missions/:missionId/workspace`) với Hồ sơ vụ án & Bảng xem trước dữ liệu
- [x] Đăng ký tuyến đường điều hướng chuẩn xác từ `MissionIntroPage`, `DashboardPage` & `LearningMapPage`
- [x] Viết bộ test component cho `ExcelMissionPage.jsx`

### 🔹 Step 3.2: Spreadsheet Grid Component & Formula Bar *(HOÀN THÀNH)*
- [x] Xây dựng component `SpreadsheetGrid.jsx` hỗ trợ hiển thị lưới ô A1, B1, C1...
- [x] Quản lý trạng thái ô đang chọn (Active Cell Selection: `selectedCell`, `highlightedCell`)
- [x] Xây dựng `FormulaBar.jsx` cho phép xem và nhập trực tiếp công thức Excel
- [x] Xử lý sự kiện chỉnh sửa ô dữ liệu được phép sửa (`editable: true`) và tự động cập nhật phản hồi UI khi nhập công thức

### 🔹 Step 3.3: Thanh Công Cụ Thao Tác & Hệ Thống Gợi Ý *(HOÀN THÀNH)*
- [x] Nút Chạy thử công thức (`Run / Evaluate`) hiển thị kết quả tính toán ngay tại ô
- [x] Nút Nộp bài (`Submit Answer`) để gửi bài làm sang bộ kiểm tra
- [x] Hệ thống Gợi ý từng bước (`Step-by-step Hints`) hiển thị mức giảm phần thưởng dự kiến; chưa trao XP
- [x] Nút Đặt lại dữ liệu ban đầu (`Reset Grid`)

### 🔹 Step 3.4: Submission & Feedback *(HOÀN THÀNH)*
- [x] Tạo shared `submissionService` contract và export qua service gateway
- [x] Mock và API placeholder giữ cùng public interface; UI không import mock adapter trực tiếp
- [x] Phân biệt `run` và `submit`; component không giữ expected answer
- [x] Incorrect/validation dùng inline feedback; success modal chỉ cho completion
- [x] Service error có Retry và không làm mất answer
- [x] Chặn double submit, replay theo `clientAttemptId` và cleanup an toàn khi unmount
- [x] Chỉ trả `potentialXp`; Submission không trực tiếp cập nhật XP/level
- [x] Submission/formula core tests pass; stabilization regression 133/133 tests pass

### 🔹 Step 3.4E: Submission UI Stabilization *(HOÀN THÀNH)*
- [x] Xác minh Run/Submit loading, disabled và chống double submit
- [x] Xác minh inline validation/incorrect/service error và Retry
- [x] Xác minh success modal, keyboard/focus và responsive submission area
- [x] Giữ answer khi sai/lỗi và wording phần thưởng dự kiến
- [x] Chạy targeted test và regression trước khi đóng Step

### 🔹 Step 3.5: Learner UI Foundation & Stabilization *(HOÀN THÀNH)*
- [x] Step 3.5A — UI Audit & Component Inventory
- [x] Step 3.5B — Shared UI Components (Button, Modal, Card, Input, Badge)
- [x] Step 3.5C — Learner Layout & Navigation (Collapsible Sidebar & Header)
- [x] Step 3.5D — Responsive & Accessibility (ARIA, focus-visible & screen reader landmarks)
- [x] Step 3.5E — Regression & User Test Readiness

### 🔹 Step 3.6: Light Mode Refinement & Accessibility *(HOÀN THÀNH)*
- [x] Step 3.6A — Light Mode Audit & Theme Tokens
- [x] Step 3.6B — Background, Cards & Visual Hierarchy
- [x] Step 3.6C — Secondary Action Buttons (Neutral grey/outline for Run/Hint/Reset)
- [x] Step 3.6D — Excel Workspace Light Mode (Formula Bar input contrast & Spreadsheet Grid headers)
- [x] Step 3.6E — Streak Visual Balance (Subtle amber card surface in Learner Sidebar)
- [x] Step 3.6F — Accessibility & Theme Regression

### 🔹 Step 3.6G: Sprint 3 Stabilization Gate *(HOÀN THÀNH)*
- [x] Sửa và mở rộng Global Excel Mission Validator; giữ stable diagnostic code
- [x] Xác minh dấu `=` hiển thị lỗi cú pháp trên Run, không báo success
- [x] Xóa inline hint stale khi Reset hoặc đổi mission
- [x] Chuẩn hóa “Phần thưởng dự kiến”, route boundary và mobile submit CTA
- [x] Hint drawer hỗ trợ focus, Escape và restore focus
- [x] Targeted 73/73, full regression 133/133, production build và Browser check pass

---

## 🟢 Sprint 4 — SQL Vertical Slice *(CURRENT — Hoàn thành 100%)*

### 🔹 Step 4.0: Technical Spike & SQL Contracts *(HOÀN THÀNH)*
- [x] Chốt `sql.js@1.14.2` (MIT), SQLite dialect và in-memory lifecycle
- [x] Xác minh Vite dev/build/production preview tải WASM và dedicated Worker
- [x] Chốt engine, mission, dataset, execution result và checker config contracts
- [x] Chốt read-only policy, hard timeout recovery, max rows, reset/dispose
- [x] Deterministic seed chứng minh initialize/load/schema/execute/reset/dispose
- [x] SQL unit 11/11, full regression 144/144; không xây product UI hoặc route

### 🔹 Step 4.1A: WASM Packaging & Worker Transport *(HOÀN THÀNH)*
- [x] Request ID correlation & handling out-of-order worker responses
- [x] Lọc stale responses muộn sau timeout/reset
- [x] Worker error handling (`onerror`, `messageerror`) & recovery không treo UI
- [x] Dispose dọn dẹp pending requests, timers và terminate worker
- [x] Singleton Lazy Worker initialization
- [x] Gate spike harness `sql-spike.html` phía sau cờ `BUILD_SQL_SPIKE`
- [x] Lazy-load WASM/Worker khi vào SQL flow

### 🔹 Step 4.1B: Database Lifecycle, Seed, Reset & Schema API *(HOÀN THÀNH)*
- [x] `getSchema()` trả `sampleRows` (tối đa 3 hàng) cho mỗi bảng để Schema Browser preview
- [x] Seed → reset → schema sau reset giống hệt schema ban đầu (determinism)
- [x] Reset khi chưa có dataset throw `ENGINE_NOT_READY`
- [x] Double-dispose an toàn, trả `{ disposed: true }` không throw
- [x] `sqlDatabaseLifecycle.test.js` bao phủ lifecycle end-to-end (7/7 tests)
- [x] `sqlDataset.test.js` bổ sung edge case tests
- [x] Full SQL targeted suite 27/27 pass

### 🔹 Step 4.1C: Read-only Query Policy, Timeout & Row Limit *(HOÀN THÀNH)*
- [x] Chỉ một `SELECT`/`WITH`; chặn mutation/DDL/attach/pragma (10 từ khóa cấm)
- [x] Timeout bằng cancel/terminate + worker/database recovery; giới hạn result rows (maxRows truncation)
- [x] `sqlQueryPolicy.test.js` & `sqlEngineAdapter.test.js` bao phủ 100% test cases

### 🔹 Step 4.2: Schema Browser *(HOÀN THÀNH)*
- [x] Table/column/type/PK/nullable; tự động ẩn internal tables (`sqlite_*`)
- [x] Loading/empty/error states, expand/collapse, copy identifier và xem mẫu 3 hàng data preview
- [x] `SchemaBrowser.test.jsx` bao phủ 100% test cases

### 🔹 Step 4.3: SQL Mission Shell, Loader & Route *(HOÀN THÀNH)*
- [x] Mission/dataset loading, error/retry và lifecycle cleanup
- [x] Route `/missions/:missionId/sql` độc lập, không vỡ Excel workspace
- [x] `SqlMissionPage.test.jsx`, `mockSqlMissionService.test.js` & `MissionIntroPage.test.jsx` pass

### 🔹 Step 4.4: SQL Editor MVP *(HOÀN THÀNH)*
- [x] Controlled editor, starter/reset query, Tab 2-space indentation và Ctrl/Cmd+Enter shortcut
- [x] Accessible ARIA label và đồng bộ Detective Amber theme
- [x] `SqlEditor.test.jsx` & `SqlMissionPage.test.jsx` pass

### 🔹 Step 4.5: Query Execution & Result Viewer *(HOÀN THÀNH)*
- [x] Running/double-run guard và stable error mapping
- [x] Columns/rows/`NULL`/empty/time/count/truncation, scroll và client-side pagination (50 dòng/trang)
- [x] UX Polish: Nút Nộp bài vụ án, căn phải ô số, format 1,000, scroll sticky header

### 🔹 Step 4.6: SQL Result Checker *(HOÀN THÀNH)*
- [x] Column/row/value comparison; column order và result order tùy cấu hình
- [x] `NULL`, duplicate rows, numeric tolerance và construct validation
- [x] `sqlChecker.js` & `sqlChecker.test.js` pass 100%

### 🔹 Step 4.7: Submission Integration *(HOÀN THÀNH)*
- [x] Dùng chung `submissionService`; hỗ trợ `tool: 'sql'` mở rộng trong `mockSubmissionService.js`.
- [x] Run không complete; Submit tính `potentialXp`, trả `attemptId` và kiểm tra idempotency.
- [x] Tích hợp `MissionResultModal` vào `SqlMissionPage.jsx`.

### 🔹 Step 4.8: WASM Security Guard, Cleanup & Build Gate *(HOÀN THÀNH)*
- [x] Policy security check, multi-statement guard, 3s timeout & row limit 500 rows.
- [x] Auto `dispose()` Web Worker khi unmount/switch dataset.
- [x] Responsive layout & Light/Dark theme visual polish.
- [x] Production WASM packaging & 222+ full Vitest regression pass 100%.

---

## 🟢 Sprint 5 — Content Domain & Dataset Decoupling *(HOÀN THÀNH 100%)*

### 🔹 Step 5.1: Dataset Domain Independence *(HOÀN THÀNH)*
- [x] Định nghĩa `datasetService` contract & registry tách biệt với vụ án (`mockDatasetService.js`)
- [x] Quản lý Schema, SQLite Table seed và Dataset metadata độc lập

### 🔹 Step 5.2: Content Domain Hierarchy Contracts *(HOÀN THÀNH)*
- [x] Khai báo `contentService.js` contract với cấu trúc phân cấp: Course -> Phase -> Chapter
- [x] Độc lập nội dung học tập khỏi logic người dùng/UI

### 🔹 Step 5.3: Investigation Domain Contract *(HOÀN THÀNH)*
- [x] Khai báo `investigationService.js` quản lý entity `Investigation` (Cốt truyện vụ án)
- [x] Hỗ trợ mapper dịch chuyển legacy `Mission` thành `Investigation` giữ tương thích ngược 100%

### 🔹 Step 5.4: Question Domain Contract *(HOÀN THÀNH)*
- [x] Khai báo `questionService.js` quản lý entity `Question` (Nhiệm vụ kỹ thuật Excel/SQL)
- [x] Bóc tách `checkerConfig` vào entity Question thay vì hardcode trong mock submission

### 🔹 Step 5.5: Question Submission Integration *(HOÀN THÀNH)*
- [x] Tích hợp `submissionService` với Question Domain entities
- [x] Trả về kết quả đánh giá submission với `potentialXp` mà không trực tiếp trao thưởng XP

### 🔹 Step 5.6: Learner Progress State *(HOÀN THÀNH)*
- [x] Tạo `learnerProgress.js` & `progressService.js` lưu trữ tiến độ học tập độc lập
- [x] Đánh dấu trạng thái `completed` / `in_progress` theo từng bài tập

### 🔹 Step 5.7: XP Reward Integration & Idempotent Ledger *(HOÀN THÀNH)*
- [x] Xây dựng `rewardEvaluator.js` hỗ trợ trao thưởng XP độc lập và Idempotent
- [x] Đảm bảo nộp lại thành công bài cũ không bị lặp XP Thưởng

### 🔹 Step 5.8: Completion vs Mastery Foundation *(HOÀN THÀNH)*
- [x] Tách biệt khái niệm Hoàn thành (Completion) và Thành thạo (Mastery) với `masteryEvaluator.js`
- [x] Thiết lập cấu trúc dữ liệu theo dõi kỹ năng (Skill association) và lịch sử lần làm bài (Attempt history)

---

## 🟢 Sprint 6 — Game Progress & Learning Map Integration *(HOÀN THÀNH 100%)*

### 🔹 Step 6.1: Learning Map Domain Adapter *(HOÀN THÀNH)*
- [x] Tạo `learningMapAdapter.js` chuyển đổi domain tree (`Journey` -> `Phase` -> `Chapter` -> `Investigation` -> `Question`)
- [x] Tích hợp `progressService` để giải quyết trạng thái nút (`completed`, `current`, `locked`)
- [x] Giữ tương thích 100% đường dẫn làm bài Excel/SQL hiện tại

### 🔹 Step 6.2: Learning Map UX Refactor *(HOÀN THÀNH)*
- [x] Loại bỏ phụ thuộc dropdown chọn khóa học nhỏ (`<select id="course-selector">`)
- [x] Xây dựng giao diện lộ trình đa Giai đoạn (Phase Navigation Tabs) trực quan
- [x] Trình bày toàn bộ tiến độ hành trình học tập (`Journey Progression`) giúp học viên thấy rõ vị trí hiện tại
- [x] Viết unit & component tests cho `learningMapAdapter.test.js` & `LearningMapPage.test.jsx`

### 🔹 Step 6.3: Practice Engine & Mastery Integration *(HOÀN THÀNH)*
- [x] Tách biệt dữ liệu tiến độ nhiệm vụ chính (Main Quest) và rèn luyện (Practice) qua tham số `mode`
- [x] Phát triển công thức tính toán điểm và danh hiệu thành thạo Mastery (`getSkillMasteryLevel`, `calculateOverallMastery`)
- [x] Tích hợp `useProgress` hook thời gian thực làm Single Source of Truth cho Progress, XP & Mastery
- [x] Hiển thị thẻ tổng quan thành thạo kỹ năng (**Skill Mastery Summary Card**) trên `LearningMapPage.jsx`
- [x] Đồng bộ hóa toàn bộ 9 bộ câu hỏi Excel (`mission-001` đến `mission-009`) & cấu hình chấm điểm công thức phong phú (`SUM`, `MAX`, `AVERAGE`, `COUNTIF`, `SUMIF`, `IF`, `VLOOKUP`, `INDEX/MATCH`)

---

## 🟢 Sprint 6.5 — Learner Onboarding & First-Run Experience *(CURRENT — Hoàn thành 100%)*

### 🔹 Step 6.5.0: First-Run UX Audit *(HOÀN THÀNH)*
- [x] Kiểm tra luồng Register → Dashboard hiện tại (READ-ONLY)
- [x] Đếm số CTA cạnh tranh trên Dashboard (~15–17 điểm tương tác)
- [x] Xác nhận không có onboarding state, Welcome Gate hay tour library nào tồn tại
- [x] Xác định `ds-001` + `mission-001` làm nền tảng Tutorial Case 0
- [x] Xác định 2 điểm can thiệp tối thiểu: `AuthPage.jsx:132` và `router/index.jsx`

### 🔹 Step 6.5.1: First-Run State *(HOÀN THÀNH)*
- [x] Implement `onboardingService.js` — single owner của onboarding state
- [x] State model: `NOT_STARTED | IN_PROGRESS | COMPLETED | SKIPPED`
- [x] Transition guards: COMPLETED & SKIPPED là terminal (không lặp lại Welcome Gate)
- [x] Persistence qua `storage.js` (prefix `avimystery:onboarding:{userId}`)
- [x] Per-user isolation: mỗi user có state riêng biệt
- [x] Export qua `services/index.js` (gateway pattern)
- [x] Tests: 30/30 PASS

### 🔹 Step 6.5.2: Welcome Gate UI *(HOÀN THÀNH)*
- [x] Trang `WelcomeGatePage.jsx` full-screen (không dùng LearnerLayout)
- [x] Redirect guard: unauthenticated → /login, terminal state → /dashboard
- [x] CTA chính: "Bắt đầu khóa huấn luyện" → /onboarding/case-0, set IN_PROGRESS
- [x] CTA phụ: "Bỏ qua, tôi đã có kinh nghiệm" → /dashboard, set SKIPPED
- [x] Route `/onboarding` + `/onboarding/case-0` thêm vào `router/index.jsx`
- [x] Redirect sau register: `AuthPage.jsx` → `/onboarding` thay vì `/dashboard`
- [x] Tests: 12 test cases

### 🔹 Step 6.5.3: Tutorial Case 0 Content *(HOÀN THÀNH)*
- [x] Tạo `tutorialCase0Content.js` — content riêng, không import `missions.json`
- [x] Briefing: story, objective, hint với `=C2*D2`
- [x] Dataset: 1 dòng duy nhất (ORD-001, quantity=3, unitPrice=150000, total=null)
- [x] Workspace config: targetCell=E2, formulaPlaceholder
- [x] Evaluator: expectedFormula + expectedValue (450000) + 3 feedback messages
- [x] Spotlight steps: 4 bước hướng dẫn có target CSS selector
- [x] `checkTutorialAnswer()` helper: formula + numeric fallback, case-insensitive
- [x] Tests: 22 test cases

### 🔹 Step 6.5.4: Minimal Case 0 Workspace *(HOÀN THÀNH)*
- [x] Trang `TutorialCase0Page.jsx` — focused workspace với low cognitive load
- [x] Gắn các Spotlight target IDs: `#tutorial-briefing-panel`, `#tutorial-dataset-grid`, `#tutorial-formula-bar`, `#tutorial-submit-btn`
- [x] Tái sử dụng components Excel (`SpreadsheetGrid`, `FormulaBar`)
- [x] Mount route `/onboarding/case-0` vào `AppRouter`
- [x] Xử lý nộp bài & cập nhật trạng thái `COMPLETED` / `SKIPPED`
- [x] Tests: 8 test cases PASS

### 🔹 Step 6.5.5: Guided Spotlight *(HOÀN THÀNH)*
- [x] Spotlight 4 steps (pure React/custom CSS, không dùng thư viện ngoài)
- [x] Backdrop mask + highlight ring animated xung quanh phần tử target
- [x] Tooltip tự động căn chỉnh vị trí (dưới/trên phần tử target)
- [x] Phím tắt bàn phím (Esc đóng, Enter/Mũi tên phải sang bước tiếp, Mũi tên trái quay lại)
- [x] Nút "Xem lại hướng dẫn" trên header `TutorialCase0Page.jsx`
- [x] Tests: 7 test cases PASS

### 🔹 Step 6.5.6: Completion + Reward *(HOÀN THÀNH)*
- [x] Kết nối completion với reward system hiện có: +50 XP qua `progressService.awardXp`
- [x] Đảm bảo tính Idempotency: Không thể nhận XP 2 lần cho cùng một vụ án tutorial
- [x] Direct redirect về `/dashboard` sau khi click "Hoàn thành & Vào Dashboard"
- [x] Total onboarding tests: 84/84 tests PASS

### 🔹 Step 6.5.7: Dashboard Handoff *(HOÀN THÀNH)*
- [x] Sau completion → Dashboard với CTA "Tiếp tục học" & Banner hoàn thành (+50 XP)
- [x] Route guard tự động điều hướng user `NOT_STARTED` truy cập `/dashboard` sang `/onboarding`

### 🔹 Step 6.5.8: Full Regression Test *(HOÀN THÀNH)*
- [x] Kiểm tra 7 luồng trong `onboardingRegression.test.jsx`: New learner, Skip, Return guard, Reload persistence, Replay, Fail→Retry, XP Idempotency

### 🔹 Step 6.6: Dashboard Deep Guided Tour & Spotlight Engine Refinement *(HOÀN THÀNH)*
- [x] **Step 6.6.1**: Chuẩn hóa Core Engine `OnboardingSpotlight.jsx` — Hỗ trợ prop aliases (`target`/`targetId`, `body`/`content`), tự động gắn `#`, cuộn trang `scrollIntoView` mượt và sửa lỗi highlight ring cutout.
- [x] **Step 6.6.2**: Gắn Target IDs toàn diện cho 6 khu vực Dashboard trong `DashboardPage.jsx` (`#dashboard-welcome-header`, `#dashboard-stat-cards`, `#dashboard-continue-investigation`, `#dashboard-investigator-level`, `#dashboard-active-courses`, `#dashboard-recommended-missions`).
- [x] **Step 6.6.3**: Thiết kế nội dung Tour 6 bước chi tiết & chuyên sâu trong `dashboardTourContent.js` giải thích toàn bộ tính năng thám tử dữ liệu.
- [x] **Step 6.6.4**: Mở rộng Unit Tests `dashboardTour.test.jsx` phủ cả 6 bước tour, kiểm tra tính tương thích prop alias và định vị phần tử DOM (6/6 tests PASS).
- [x] **Step 6.6.5**: Chạy Full Regression Suite (97/97 tests PASS), kiểm tra giao diện thực tế và hoàn thiện tài liệu.

### 🔹 Step 6.7: Admin Dev Testing Tools — Reset Onboarding *(HOÀN THÀNH)*
- [x] Card "Công cụ Dev: Test Chế độ Hướng dẫn Onboarding" trong `AdminSettingsPage.jsx` với 2 nút: Reset Welcome Gate & Reset Tour Dashboard.
- [x] Nút "🧪 Test Onboarding Mode" ở header trang `/admin` liên kết nhanh sang khu vực dev tools.
- [x] Nút "🧪 Test Luồng Hướng Dẫn (Welcome Gate)" trong khu vực DEV ONLY tại `AuthPage.jsx` — 1-click đăng nhập demo và reset state.
- [x] Tất cả các nút chỉ hiện với user Admin/Dev (bảo vệ bởi `FEATURE_FLAGS`/role `admin`).

---

## 🟢 Sprint 7 — Learner Engagement & Practice Engine *(HOÀN THÀNH 100%)*

### 🔹 Step 7.1: Level Up Popups & Streak Counter *(HOÀN THÀNH)*
- [x] `LevelUpModal.jsx`: Modal chúc mừng thăng cấp chuẩn Detective Amber — hiển thị cấp độ cũ/mới, danh hiệu thám tử, XP tích lũy, hiệu ứng pháo hoa. Đóng bằng Escape/backdrop/nút.
- [x] `StreakDetailModal.jsx`: Popup xem chi tiết chuỗi ngày học 7 ngày trong tuần (biểu đồ ngọn lửa 🔥, active/inactive per day).
- [x] Tích hợp vào `LearnerLayout.jsx` — bấm thẻ "Chuỗi học tập 🔥" Sidebar để mở `StreakDetailModal`.
- [x] Unit Tests: `LevelUpModal.test.jsx` (5/5 PASS) + `StreakDetailModal.test.jsx` (5/5 PASS).
- [x] Full regression: **110/110 tests PASS** sau tích hợp.

### 🔹 Step 7.2: Standalone Practice Workspace & Question Bank *(HOÀN THÀNH)*
- [x] Giao diện giải bài tập rèn luyện kỹ năng tự do (`/practice`) với bộ đếm thống kê thời gian thực.
- [x] Sửa lỗi trong suốt background popover Sort & Filter, đồng bộ tiến độ người học qua `useProgress`.

### 🔹 Step 7.3: Learner Profile & Achievement Badges Page *(HOÀN THÀNH)*
- [x] Trang Hồ sơ cá nhân (`/profile`) hiển thị tổng quan chỉ số Level, XP, tổng bài làm.
- [x] Trang Danh hiệu Thám tử (`/achievements`) liệt kê thành tích và điều kiện mở khóa.

### 🔹 Step 7.4: Activity History Timeline Page *(HOÀN THÀNH)*
- [x] Trang Lịch sử Hoạt động (`/profile/history`) với Timeline các hoạt động (Nhiệm vụ, Thăng cấp, Mở khóa Danh hiệu, Luyện tập).
- [x] Tích hợp bộ lọc dữ liệu đa chiều thời gian thực (Loại sự kiện, Thời gian 7 ngày/30 ngày).

### 🔹 Step 7.5: Firebase Production Infrastructure Migration *(HOÀN THÀNH)*
- [x] Tích hợp `firebaseProgressService.js` thay thế hoàn toàn `mockProgressService.js`.
- [x] Di chuyển hệ thống lưu trữ XP, tiến độ (Progress), danh hiệu (Achievements) và lịch sử hoạt động (Activity History) sang **Firebase Firestore**.
- [x] Đồng bộ hóa giao diện UI (Dashboard, Profile, Sidebar) theo dữ liệu thời gian thực từ Firestore với Transaction đảm bảo tính toàn vẹn (Idempotent XP Ledger).

---

## 🟢 Sprint 8 — Admin Content Studio *(CURRENT — Hoàn thành 100%)*

### 🔹 Step 8.1: Visual Investigation & Question Authoring Studio *(HOÀN THÀNH)*
- [x] Định nghĩa `adminContentService.js` contract & `mockAdminContentService.js` adapter hỗ trợ CRUD Course, Chapter, Mission, Dataset.
- [x] Trang Danh sách Vụ án (`/admin/missions`): Bộ lọc đa chiều (Course, Tool, Status, Difficulty, Search), chuyển đổi Publish/Draft tức thì và thống kê tổng quan.
- [x] Trình Soạn Thảo Vụ Án Trực Quan (`/admin/missions/new` & `/admin/missions/:id/edit`): 4 tabs (Hồ sơ & Bối cảnh, Không gian làm việc, Bộ chấm điểm Checker, Hệ thống gợi ý nhiều cấp độ).
- [x] Trang Quản lý Khóa học (`/admin/courses`) & Chương học (`/admin/chapters`): Tạo mới, sửa, xuất bản và nút 1-click đồng bộ lại Bản đồ Học tập Read Model (`learning_map_views`).

### 🔹 Step 8.2: Dataset Importer & Schema Generator *(HOÀN THÀNH)*
- [x] Trang Quản lý Dataset (`/admin/datasets`): Xem danh sách, thông tin bảng và modal Schema Viewer.
- [x] Trình nhập CSV & Tạo Schema Tự động: Tự động đoán kiểu dữ liệu (`INTEGER`, `REAL`, `DATE`, `TEXT`), xem trước dữ liệu mẫu và sinh lệnh SQLite DDL (`CREATE TABLE ...`, `INSERT INTO ...`).

### 🔹 Step 8.3: Admin Live Preview & Test Runner Sandbox *(HOÀN THÀNH)*
- [x] Modal `AdminTestRunnerModal.jsx`: Chạy thử công thức Excel qua `excelChecker` và câu lệnh SQL qua engine Web Worker SQLite WASM trực tiếp trong Studio.
- [x] Sandbox Isolation: Đảm bảo kiểm thử an toàn, không kích hoạt `progressService`, không ghi nhận XP hay ảnh hưởng dữ liệu học viên thật.

---

## 🟢 Sprint 8.5 — Education / Knowledge Hub *(HOÀN THÀNH 100%)*

### 🔹 Step 8.5.1: Markdown Renderer & UI Improvements
- [x] Tích hợp `react-markdown` và `remark-gfm` cho trang bài học.
- [x] Hỗ trợ đầy đủ UI hiển thị Code Block có tính năng copy, bảng (tables), danh sách và trích dẫn.

### 🔹 Step 8.5.2: Admin Editor & Firebase Offline Persistence
- [x] Cải thiện Admin Knowledge Editor: Sử dụng Mission Selector trực quan (Checkboxes, filter, search) thay vì text input.
- [x] Bật `persistentLocalCache` IndexedDB đa tab cho Firestore giúp xem bài học mượt mà cả khi offline.
- [x] Nâng cấp UI/UX trang `KnowledgeHubPage`: Thêm thanh tìm kiếm và Sidebar Drawer responsive trên di động.

---

## 🟢 Sprint 8.6 — UX/UI "Don't Make Me Think" & Contextual Layout *(HOÀN THÀNH 100%)*

*Mục tiêu: Giảm thiểu năng lượng nhận thức của học viên ("Bây giờ làm gì? Tiếp theo làm gì?"), tối ưu hóa sự tập trung khi giải vụ án bằng Focus Mode.*

### 🔹 Step 8.6.1: Contextual Layout & Focus Mode
- [x] Tạo `FocusLayout.jsx`: Chế độ toàn màn hình không sidebar, loại bỏ xao nhãng cho các trang làm bài `/missions/:missionId/workspace` và `/missions/:missionId/sql`.
- [x] Top Bar Focus Mode tinh gọn (`h-14`) với nút thoát nhanh, chỉ số XP và Dark/Light mode toggle.

### 🔹 Step 8.6.2: Hero Primary CTA & Guided Progression
- [x] Nâng cấp Dashboard: Thiết kế lại Banner "Nhiệm vụ ưu tiên hiện tại" nổi bật full-width với nút CTA "Tiến vào Bàn làm việc" giải quyết câu hỏi "Bây giờ làm gì?".
- [x] Khử ngõ cụt tại `KnowledgeHubPage`: Thêm card Guided Progression với nút "Vào giải vụ án ngay" (nếu có vụ án liên quan) và cặp nút "Bài trước / Bài tiếp theo".
- [x] Cải tiến Microcopy & Affordance tại `MissionIntroPage`: Nút hành động rõ ràng và hỗ trợ phím tắt `Enter ↵` để vào bàn làm việc ngay lập tức.

### 🔹 Step 8.6.3: Mission Solving Screen Interaction Flow & Unified Action Bar
- [x] **Thanh Action & Formula Bar duy nhất**: Hợp nhất thanh công cụ rời rạc (Chạy thử, Nộp bài, Gợi ý, Đặt lại) vào cùng 1 hàng với thanh nhập công thức `fx`, đặt sát phía trên Bảng tính `SpreadsheetGrid`.
- [x] **Tối ưu Keyboard UX**: Bấm `Enter` tự động kích hoạt Chạy thử công thức; bấm `Ctrl + Enter` (hoặc `Cmd + Enter`) kích hoạt Nộp bài vụ án; hiển thị tooltip mẹo phím tắt trực quan bên dưới input.
- [x] **Tinh gọn không gian chiều dọc (Viewport Optimization)**: Giảm padding và margin-bottom của header vụ án và khối tóm tắt mục tiêu, đảm bảo trên màn hình $\ge 1366 \times 768$ hiển thị trọn vẹn Tiêu đề $\to$ Mục tiêu $\to$ Thanh công cụ $\to$ ít nhất 6 hàng đầu tiên của Bảng tính mà không cần cuộn chuột.
- [x] **Target Highlight & Auto-focus**: Làm nổi bật ô mục tiêu trên bảng tính với viền 2px màu Hổ phách/Cam, hiệu ứng pulse nhẹ và box-shadow; tự động focus con trỏ vào ô nhập `fx` khi click chọn ô.
- [x] **Kiểm thử hồi quy 100%**: 66 test suites với 529 tests pass, build production thành công.

---

## 🟢 Sprint 9 — Split-Pane IDE Layout & Mission Workspace Architecture *(HOÀN THÀNH 100%)*

*Mục tiêu: Tái cấu trúc các trang giải đố (Excel & SQL) từ bố cục xếp chồng dọc sang kiến trúc chia khung (Split-Pane IDE Layout) chuẩn LeetCode / VS Code Web, tối ưu không gian desktop, thanh công cụ cố định và tích hợp hệ thống gợi ý vào luồng đọc.*

### 🔹 Step 9.1: Component Chia Khung Split-Pane (`WorkspaceSplitPane.jsx`)
- [x] Cài đặt và tích hợp thư viện `react-resizable-panels` (v4.12.4).
- [x] Tạo `WorkspaceSplitPane.jsx` hỗ trợ chia khung 40:60 trên Desktop kèm thanh divider có thể kéo thả linh hoạt.
- [x] Cơ chế Fallback Responsive cho Mobile/Tablet (< 1024px) với Tab Switcher giữa "Hồ sơ vụ án" và "Không gian làm việc".

### 🔹 Step 9.2: Problem Statement Pane & Embedded Hint System (`ProblemPane.jsx`)
- [x] Xây dựng `ProblemPane.jsx` độc lập cuộn mượt mà: Header thông tin, huy hiệu chế độ (Mission/Practice), Cốt truyện trinh thám, Mục tiêu ô đích và Lược đồ CSDL (SQL).
- [x] Tích hợp Hệ thống Gợi ý (Progressive Hints) trực tiếp vào cột đọc, loại bỏ Side Drawer che khuất bảng tính. Hỗ trợ mở gợi ý, trừ XP và Ghim gợi ý lên FormulaBar.

### 🔹 Step 9.3: Workspace Pane & Sticky Action Footer (`WorkspaceFooter.jsx`)
- [x] Xây dựng `WorkspaceFooter.jsx` neo cố định ở đáy cột phải: Chứa cụm nút Chạy thử, Nộp bài vụ án, Đặt lại và Fill down.
- [x] Tối ưu `FormulaBar.jsx`: Hỗ trợ `showActions={false}` giúp thanh nhập `fx` chiếm 100% chiều ngang cột phải như phần mềm Excel thực thụ.
- [x] Refactor `ExcelMissionPage.jsx` và `SqlMissionPage.jsx` sang kiến trúc Split-Pane IDE mới.

### 🔹 Step 9.4: Kiểm thử và Kiểm định Hệ thống
- [x] Cập nhật test suites và bổ sung mock `ResizeObserver` cho môi trường jsdom.
- [x] **68 test suites PASSED (100%)** với **535 tests** toàn dự án.
- [x] Build production hoàn tất thành công (`npm run build`).

---

## 🟢 Sprint 9.1 — Excel Mission Workspace UI/UX Refactor *(HOÀN THÀNH 100%)*

*Mục tiêu: Tái cấu trúc toàn diện không gian giải đố Excel Mission Screen theo chuẩn Senior Product UI/UX (21 Sections: 3-Layer Architecture, Split 34:66, 4-Tier Hierarchy, Authentic Spreadsheet Canvas, Focus Mode & Typography).*

### 🔹 Step 9.1.1: Design Tokens & Semantic Theming
- [x] Cập nhật bảng màu đa tầng (Multi-layer surfaces) cho Dark Mode: Background (`#0F0F0F`), Surface (`#151515`), Workspace (`#181818`), Elevated (`#202020`), Border (`#303030`), Text (`#F5F5F5` / `#A1A1AA`).
- [x] Thiết kế Light Mode chuẩn mực hạng nhất: Background (`#F5F6F8`), Surface & Workspace (`#FFFFFF`), Border (`#E5E7EB`), Text (`#18181B` / `#52525B` / `#71717A`).
- [x] Định nghĩa đầy đủ token ngữ nghĩa: `--color-background`, `--color-surface`, `--color-workspace`, `--color-border`, `--color-success`, `--color-warning`, `--color-error`, loại bỏ hoàn toàn hardcoded colors trong components.

### 🔹 Step 9.1.2: Kiến trúc 3 Lớp & Phân bổ Viewport (34% : 66%)
- [x] **Layer A (Top App Bar)**: Tinh gọn chiều cao `h-13`/`h-14`, chứa nút thoát, thương hiệu, nút bật/tắt Focus Mode, chỉ số XP, Dark/Light mode toggle và avatar người dùng.
- [x] **Layer B (Main Workspace)**: Split-Pane chuẩn LeetCode với tỷ lệ Cột Trái 34% (Context) : Cột Phải 66% (Primary Spreadsheet Canvas).
- [x] **Layer C (Bottom Action Bar)**: Thanh footer độc lập dưới Split-Pane với nút Bài trước / Bài kế tiếp, huy hiệu tiến độ vụ án, shortcut hint (`Ctrl + Enter`) và nút primary CTA "Nộp bài vụ án".
- [x] Loại bỏ padding dư thừa ở layout cấp cao (`FocusLayout`), chuyển container sang `flex-1 min-h-0 overflow-hidden` để bảng tính tận dụng 100% chiều cao màn hình.

### 🔹 Step 9.1.3: Cột Trái - Phân tầng Thông tin 4 Cấp (`ProblemPane.jsx`)
- [x] **Cấp 1 (Mission Identity)**: Nhãn `EXCEL MISSION` uppercase, mã vụ án `mission-001`, tiêu đề `h1` lớn nhất (`text-xl sm:text-2xl font-black font-sans`), huy hiệu `+XP`.
- [x] **Cấp 2 (Case File)**: Bề mặt elevated nhẹ (`bg-card/60`), chữ nghiêng trần thuật vụ án, giảm bớt sức nặng thị giác để người học tập trung vào mục tiêu.
- [x] **Cấp 3 (Objective - Trọng tâm)**: Phần tử nổi bật nhất sidebar với viền hổ phách, tiêu đề `🎯 MỤC TIÊU PHÁ ÁN (OBJECTIVE)`, nội dung nhiệm vụ đậm nét và huy hiệu tọa độ `Ô đích: [ E2 ]` hiển thị trực tiếp.
- [x] **Cấp 4 (Progressive Hints)**: Thu gọn thẻ gợi ý lũy tiến theo dạng disclosure card, ghi rõ chi phí trừ XP (`-15 XP`), nút ghim lên thanh công thức, tránh lồng card quá sâu.

### 🔹 Step 9.1.4: Cột Phải - Bảng tính Thực thụ & Xóa bỏ Badge Trong Ô (`SpreadsheetGrid.jsx`, `FormulaBar.jsx`)
- [x] **Loại bỏ hoàn toàn badge chữ "Mục tiêu" bên trong ô tính**: Thay thế bằng viền sáng Hổ phách (`ring-2 ring-amber-500 ring-inset`), nền mờ (`bg-amber-500/15`) và chấm marker nhỏ ở góc. Tuyệt đối không che khuất dữ liệu số/chữ trong ô.
- [x] **Khắc phục khoảng trống bên dưới (Ghost Rows)**: Tự động render các hàng trống liên tục (tối thiểu 16 hàng) với số thứ tự và đường lưới chuẩn mực, giúp bảng tính lấp đầy không gian làm việc như Microsoft Excel / Google Sheets thật.
- [x] **Sticky Headers & Chuẩn Typography**: Cố định hàng tên cột (A, B, C...) ở trên cùng và cột số thứ tự (1, 2, 3...) ở bên trái khi cuộn chuột; căn phải chặt chẽ cho số liệu/tiền tệ (`tabular-nums font-mono text-right`), căn trái cho văn bản (`font-sans text-left`).
- [x] **Formula Toolbar Chuẩn Bảng tính**: Thanh Name Box `[ E2 ]` $\to$ `fx` $\to$ Input công thức $\to$ `[ ↺ Đặt lại ]` $\to$ `[ Fill Down ]` $\to$ `[ ▶ Chạy thử ]`.

### 🔹 Step 9.1.5: Focus Mode Tương tác & Responsive Polish
- [x] **Interactive Focus Mode**: Nút `FOCUS MODE` trên Top Bar trở thành nút toggle tương tác. Khi BẬT, Cột Trái thu gọn hoàn toàn, Cột Phải mở rộng chiếm 100% chiều ngang kèm nút nổi `"Xem đề bài"` ở góc để mở lại bất kỳ lúc nào.
- [x] **Responsive Protection**: Thu gọn nhãn nút trên Formula Bar (`hidden xl:inline`) ở màn hình trung bình để tránh tràn thanh công cụ hoặc che khuất ô nhập `fx`.
- [x] **Kiểm thử hồi quy 100%**: **69 test suites PASSED (100%)** với **537 tests**, bổ sung unit test cho `FocusLayout.test.jsx`, build production thành công trong 13s.

---

## 🟢 Sprint 9.5 — Academy Mode & Interactive Sandbox *(IN PROGRESS)*

*Mục tiêu: Mở rộng định hướng sang mô hình W3Schools (Bên cạnh nhánh cốt truyện Game Mystery), cho phép học viên học lý thuyết kết hợp thực hành ngay lập tức (Try it Yourself).*

### 🔹 Step 9.5.1: Interactive Data Sandbox (Try It Yourself) *(HOÀN THÀNH 100%)*
- [x] Xây dựng màn hình `PracticeSandboxPage`: Trình soạn thảo chia đôi màn hình (Split-pane) với Lý thuyết bên trái và Editor/Terminal (SQL/Excel) bên phải.
- [x] Cho phép chạy thử (execute) code/công thức tự do hoặc theo kịch bản mini-task, trả về kết quả thời gian thực qua `analyzeExcelFormula` và Web Worker SQLite WASM (`createSqlEngine`).
- [x] Tích hợp liên thông 2 chiều: Thêm nút "Thực hành Sandbox (Try it Yourself)" trong `KnowledgeHubPage`, nút "Thử ngay" trên `SyntaxBlock`, và mục "Sandbox Thực hành" trên Sidebar `LearnerLayout`.
- [x] **Excel Practice Sandbox UX Refactor & Hardening (Final Verification Gate PASS):**
  - **In-cell Overlay (`CellEditorOverlay`)**: Nhấp đúp mở editor nổi render qua `createPortal` vào scroll container, tự động mở rộng theo nội dung (`max-content`), đồng bộ 2 chiều tức thì với `FormulaBar`.
  - **Session State Machine độc lập**: Phân tách rõ ràng giữa `originalValue`, `draftValue` và `committedValue`. Nhấn `Escape` hoàn tác 100% không làm biến dạng dữ liệu.
  - **Validation P0 & Điều hướng bàn phím**: Giữ editor mở khi công thức lỗi (viền đỏ `border-rose-500`), phím `Enter` commit và nhảy xuống ô dưới, `Tab` nhảy sang ô phải.
  - **Zero Unnecessary Re-renders**: `SpreadsheetGrid` và các thẻ `<td>` không bị re-render khi gõ phím trong ô hoặc Formula Bar (đã xác thực qua `window.__SPREADSHEET_GRID_RENDER_COUNT__`).
  - **Fix Split-Pane & Ghost Rows**: Khắc phục lỗi co hẹp thanh đề bài (`react-resizable-panels`), hiển thị kết quả tính toán định dạng tiền tệ trên toàn bộ ghost rows (hàng 10+).
- [x] **Hotfix Triển khai Production Vercel (`auth/invalid-api-key`)**:
  - Bổ sung `isFirebaseConfigured` và fallback mock config an toàn trong `src/lib/firebase.js` chống lỗi vỡ app ở top-level evaluation.
  - Tự động fallback sang Mock Services chuẩn mực khi thiếu biến môi trường Firebase trên Vercel.
- [x] Hoàn thiện bộ unit/component test `PracticeSandboxPage.test.jsx`, pass 71/71 test suites (562/562 tests), build production thành công 100%.

### 🔹 Step 9.5.2: Academy Course Structure (W3Schools Style) *(HOÀN THÀNH 100%)*
- [x] Cấu trúc dữ liệu giáo trình `academySyllabus.js`: Cung cấp 2 khóa học chính thức **Excel Academy** và **SQL Academy**, tổ chức thành các chương mục (Chapters & Lessons) và câu đố checkpoint.
- [x] Xây dựng giao diện `AcademyCoursePage.jsx` (`/academy`, `/academy/:courseSlug`, `/academy/:courseSlug/:topicId`):
  - Sidebar mục lục W3Schools Style: Bộ chuyển đổi khóa học tabs, thanh % tiến độ học tập, cây bài học accordion với tick xanh hoàn thành `CheckCircle2`.
  - Vòng lặp học tập khép kín: Lý thuyết Markdown ➡ Thẻ Try it Yourself mở sang Sandbox ➡ Quick Checkpoint câu đố trắc nghiệm tương tác +20 XP ➡ Footer điều hướng tuần tự Bài trước / Bài tiếp theo.
- [x] Cấu hình routes trong `src/app/router/index.jsx` và thêm mục `"Học viện Academy"` vào thanh điều hướng Sidebar (`LearnerLayout.jsx`).
- [x] Test suite `AcademyCoursePage.test.jsx` đạt 6/6 tests PASS; toàn dự án đạt **71/71 test suites (562/562 tests PASS 100%)**, build production hoàn tất thành công.

### 🔹 Step 9.5.3: Academy Certification & Mini-Exams *(NEXT)*
- [ ] Xây dựng bài kiểm tra tổng hợp cuối khóa (Final Exam / Assessment) cho từng khóa học (Excel Academy & SQL Academy).
- [ ] Cấp chứng chỉ điện tử (Digital Certificate / Badge) khi học viên hoàn thành khóa học và đạt điểm bài thi tốt nghiệp.

---

## ⚪ Sprint 10 — Backend API & Persistence *(PROPOSED)*

### 🔹 Step 10.1: FastAPI Server & PostgreSQL Database
- [ ] Xây dựng RESTful API với Python FastAPI & PostgreSQL database.
- [ ] Thay thế các Mock Services bằng API Client thực tế giữ nguyên Frontend contracts.

---

--- Content of docs/agent/CURRENT_TASK.md ---

# AVI-MYSTERY — CURRENT TASK

## Primary Module
- **Module Name**: `Academy Mode & Interactive Sandbox (W3Schools Style)`
- **Primary Path**: `src/pages/learner/AcademyCoursePage.jsx`, `src/pages/learner/PracticeSandboxPage.jsx`, `src/mocks/data/academy/academySyllabus.js`
- **Current Sprint**: **SPRINT 9.5 — Academy Mode & Interactive Sandbox**
- **Current Step**: **STEP 9.5.2: Academy Course Structure (W3Schools Style) — COMPLETED**
- **Next Step**: **STEP 9.5.3: Academy Certification & Mini-Exams**

## Completed Sub-steps
1. **Step 9.5.1.1: Sandbox Split-Pane & Engine**: Xây dựng `PracticeSandboxPage`, tích hợp tính toán Excel Formula & SQLite WASM.
2. **Step 9.5.1.2: Sandbox UX Refactor & Verification**: In-cell Editor Overlay (`createPortal`), state machine draft/commit/cancel, keyboard nav, ghost row currency format.
3. **Step 9.5.1.3: Production Hotfix**: Khắc phục lỗi crash `auth/invalid-api-key` trên Vercel khi thiếu env vars; graceful fallback sang Mock Services.
4. **Step 9.5.2.1: Academy Syllabus Data**: Tạo `academySyllabus.js` với cây cấu trúc giáo trình cho Excel Academy và SQL Academy kèm câu hỏi checkpoint và presets sandbox.
5. **Step 9.5.2.2: AcademyCoursePage UI**: Giao diện học viện chuẩn W3Schools với sidebar mục lục, thanh % tiến độ, nội dung bài học, thẻ Try it Yourself và câu đố Quick Checkpoint.
6. **Step 9.5.2.3: Closed-Loop Progression**: Tích hợp trả lời câu hỏi trắc nghiệm, phản hồi Đúng/Sai, thưởng +20 XP và tự động đánh dấu hoàn thành qua `knowledgeService`.
7. **Step 9.5.2.4: Routing & Navigation**: Đăng ký `/academy`, `/academy/:courseSlug`, `/academy/:courseSlug/:topicId` và mục menu `Học viện Academy` trên Sidebar.
8. **Step 9.5.2.5: Full Regression Testing & Build**: Bổ sung test suites, pass 562/562 tests (71 suites), Vite build production hoàn tất 100%.


