# Bảng Theo Dõi Tiến Độ Chi Tiết Theo Từng Step — Avi-Mystery

> **Cập nhật lần cuối:** 24/08/2026
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

## 🟡 Sprint 5 — Content Domain & Dataset Decoupling *(PLANNED / SẴN SÀNG THỰC THI)*

### 🔹 Step 5.1: Content Schema & Evaluation Config Extraction *(PLANNED)*
- [ ] Bóc tách `EXCEL_CHECKER_CONFIG` & `SQL_CHECKER_CONFIG` khỏi `mockSubmissionService.js`
- [ ] Định nghĩa `contentService.js` contract cung cấp cấu hình chấm điểm động theo bài tập
- [ ] Cập nhật `mockSubmissionService.js` sử dụng `contentService` để nạp config
- [ ] Chạy test suite `mockSubmissionService.test.js` xác minh không còn hardcoded config

### 🔹 Step 5.2: Investigation, Question & Variant Domain Separation *(PLANNED)*
- [ ] Tạo schema dữ liệu `Investigation` (Cốt truyện vụ án) và `Question` (Nhiệm vụ kỹ thuật)
- [ ] Phân tách dữ liệu bài tập trong `investigations.json` và `questions.json`
- [ ] Thêm hỗ trợ `Question Variant` cho chế độ luyện tập tự do
- [ ] Đảm bảo backward compatibility cho các đường dẫn `/missions/:missionId` hiện tại

### 🔹 Step 5.3: Dataset Domain Independence & Schema Registry *(PLANNED)*
- [ ] Định nghĩa `datasetService` contract quản lý danh mục bộ dữ liệu Excel/SQL
- [ ] Cho phép 1 dataset được tái sử dụng bởi nhiều Question mà không nhân bản file JSON/Schema
- [ ] Thử nghiệm nạp và cache schema SQLite độc lập với ID vụ án

---

## ⚪ Sprint 6 — Game Progress & Progression Architecture *(PLANNED)*

### 🔹 Step 6.1: Leveling Engine & XP Ledger Contract *(PLANNED)*
- [ ] Xây dựng `src/utils/game/levelingEngine.js` tính toán Level (1–50), XP required & danh hiệu
- [ ] Khởi tạo `progressService` contract và `mockProgressService.js`
- [ ] Thiết lập sổ cái XP (XP Ledger) hỗ trợ ghi nhận thưởng Idempotent khi nhận kết quả từ `submissionService`

### 🔹 Step 6.2: Main Quest vs Practice Mode & Mastery Tracking *(PLANNED)*
- [ ] Tách biệt dữ liệu tiến độ nhiệm vụ chính (Main Quest) và rèn luyện (Practice)
- [ ] Phát triển công thức tính toán điểm thành thạo Mastery (Độ chính xác, gợi ý, thời gian)

### 🔹 Step 6.3: Dynamic Learning Map Progression *(PLANNED)*
- [ ] Phát triển `useProgress` hook kết nối trực tiếp với `progressService`
- [ ] Cập nhật `LearningMapPage.jsx` hiển thị nút Locked/Unlocked/Completed dựa trên progress thật

---

## ⚪ Sprint 7 — Learner Engagement & Practice Engine *(PROPOSED)*

### 🔹 Step 7.1: Level Up Popups & Streak Counter *(PROPOSED)*
- [ ] Hiệu ứng hoạt họa Popup mừng thăng cấp và bộ đếm chuỗi ngày học liên tục

### 🔹 Step 7.2: Standalone Practice Workspace & Question Bank *(PROPOSED)*
- [ ] Giao diện giải bài tập rèn luyện kỹ năng tự do

### 🔹 Step 7.3: Learner Profile & Achievement Badges Page *(PROPOSED)*
- [ ] Trang Hồ sơ cá nhân (`/profile`) và bảng danh hiệu thám tử (`/achievements`)

---

## ⚪ Sprint 8 — Admin Content Studio *(PROPOSED)*

### 🔹 Step 8.1: Visual Investigation & Question Authoring Studio *(PROPOSED)*
- [ ] Giao diện tạo và chỉnh sửa vụ án/câu hỏi trực quan cho Quản trị viên

### 🔹 Step 8.2: Dataset Importer & Schema Generator *(PROPOSED)*
- [ ] Công cụ chuyển đổi CSV/Excel thành Dataset schema tự động

### 🔹 Step 8.3: Admin Live Preview & Test Runner *(PROPOSED)*
- [ ] Chế độ chạy thử nghiệm bài tập trực tiếp trong giao diện Admin

---

## ⚪ Sprint 9 — Backend API & Persistence *(PROPOSED)*

### 🔹 Step 9.1: FastAPI Server & PostgreSQL Database *(PROPOSED)*
- [ ] Xây dựng RESTful API với Python FastAPI & PostgreSQL database

### 🔹 Step 9.2: Real API Client Adapters & JWT Auth *(PROPOSED)*
- [ ] Thay thế các Mock Services bằng API Client thực tế giữ nguyên Frontend contracts

---

## ⚪ Sprint 10 — Production Hardening & Release *(PROPOSED)*

### 🔹 Step 10.1: Learner Analytics & Insights Dashboard *(PROPOSED)*
- [ ] Trang phân tích chỉ số học tập dành cho Quản trị viên

### 🔹 Step 10.2: Bundle Optimization, Security Audit & Launch *(PROPOSED)*
- [ ] Tối ưu hóa bundle, audit bảo mật OWASP và phát hành ứng dụng
