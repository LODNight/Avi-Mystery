# Bảng Theo Dõi Tiến Độ Chi Tiết Theoừng Step — Avi-Mystery

> **Cập nhật lần cuối:** 22/08/2026
> **Mô tả:** Bảng danh mục công việc chi tiết chia theo từng Step cho toàn bộ 8 Sprint của dự án **Avi-Mystery**.
> **Nguồn trạng thái task hiện tại:** [`agent/CURRENT_TASK.md`](./agent/CURRENT_TASK.md).

---

## 🟢 Sprint 1 — Frontend Foundation & RBAC System *(Hoàn thành 100%)*

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

## 🟢 Sprint 2 — Course, Learning Map & Admin Management *(Hoàn thành 100%)*

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

## 🟢 Sprint 3 — Excel Vertical Slice *(Hoàn thành 100%)*

### 🔹 Step 3.0: Transition Audit & Bộ Chấm Điểm Công Thức *(HOÀN THÀNH)*
- [x] Kiểm tra 100% điều kiện Gate của Sprint 1 & Sprint 2
- [x] Xây dựng bộ chấm công thức `excelChecker.js` (Chuẩn hóa công thức, so sánh kết quả & hàm tính toán SUM, AVERAGE, MIN, MAX)
- [x] Viết bộ test unit cho `excelChecker.test.js` (hiện có 26 test, gồm structured formula diagnostics)

### 🔹 Step 3.1: Excel Mission Shell & Kết Nối Dataset *(HOÀN THÀNH)*
- [x] Khởi tạo tệp mock dataset `datasets.json` cho vụ án Sales Orders & Customers
- [x] Bổ sung `getDataset(datasetId)` vào `mockMissionService.js` kèm bộ test unit
- [x] Xây dựng Màn hình `ExcelMissionPage.jsx` (`/missions/:missionId/workspace`) với Hồ sơ vụ án & Bảng xem trước dữ liệu (Dataset Preview Table)
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

### 🔹 Step 3.4E: Submission UI Stabilization *(HOÀN THÀNH 100%)*
- [x] Xác minh Run/Submit loading, disabled và chống double submit
- [x] Xác minh inline validation/incorrect/service error và Retry
- [x] Xác minh success modal, keyboard/focus và responsive submission area
- [x] Giữ answer khi sai/lỗi và wording phần thưởng dự kiến
- [x] Chạy targeted test và regression trước khi đóng Step

### 🔹 Step 3.5: Learner UI Foundation & Stabilization *(HOÀN THÀNH 100%)*
- [x] Step 3.5A — UI Audit & Component Inventory
- [x] Step 3.5B — Shared UI Components (Button, Modal, Card, Input, Badge)
- [x] Step 3.5C — Learner Layout & Navigation (Collapsible Sidebar & Header)
- [x] Step 3.5D — Responsive & Accessibility (ARIA, focus-visible & screen reader landmarks)
- [x] Step 3.5E — Regression & User Test Readiness

### 🔹 Step 3.6: Light Mode Refinement & Accessibility *(HOÀN THÀNH 100%)*
- [x] Step 3.6A — Light Mode Audit & Theme Tokens
- [x] Step 3.6B — Background, Cards & Visual Hierarchy
- [x] Step 3.6C — Secondary Action Buttons (Neutral grey/outline for Run/Hint/Reset)
- [x] Step 3.6D — Excel Workspace Light Mode (Formula Bar input contrast & Spreadsheet Grid headers)
- [x] Step 3.6E — Streak Visual Balance (Subtle amber card surface in Learner Sidebar)
- [x] Step 3.6F — Accessibility & Theme Regression

### 🔹 Step 3.6G: Sprint 3 Stabilization Gate *(HOÀN THÀNH 100%)*
- [x] Sửa và mở rộng Global Excel Mission Validator; giữ stable diagnostic code
- [x] Xác minh dấu `=` hiển thị lỗi cú pháp trên Run, không báo success
- [x] Xóa inline hint stale khi Reset hoặc đổi mission
- [x] Chuẩn hóa “Phần thưởng dự kiến”, route boundary và mobile submit CTA
- [x] Hint drawer hỗ trợ focus, Escape và restore focus
- [x] Targeted 73/73, full regression 133/133, production build và Browser check pass

---

## 🟡 Sprint 4 — SQL Vertical Slice *(TECHNICAL GATE PASS)*

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
- [x] Singleton Lazy Worker initialization (không tạo nhiều Worker)
- [x] Gate spike harness `sql-spike.html` phía sau cờ `BUILD_SQL_SPIKE`
- [x] Lazy-load WASM/Worker khi vào SQL flow; không tải ở Excel/dashboard

### 🔹 Step 4.1B: Database Lifecycle, Seed, Reset & Schema API *(HOÀN THÀNH)*
- [x] `getSchema()` trả `sampleRows` (tối đa 3 hàng) cho mỗi bảng để Schema Browser preview
- [x] Seed → reset → schema sau reset giống hệt schema ban đầu (determinism)
- [x] Reset khi chưa có dataset throw `ENGINE_NOT_READY`
- [x] Double-dispose an toàn, trả `{ disposed: true }` không throw
- [x] `sqlDatabaseLifecycle.test.js` bao phủ lifecycle end-to-end (7/7 tests)
- [x] `sqlDataset.test.js` bổ sung: duplicate table/column, unsupported type, no-table, no-column (8/8 tests)
- [x] Full SQL targeted suite 27/27 pass

### 🔹 Step 4.1C: Read-only Query Policy, Timeout & Row Limit *(HOÀN THÀNH)*
- [x] Chỉ một `SELECT`/`WITH`; chặn mutation/DDL/attach/pragma (10 từ khóa cấm)
- [x] Timeout bằng cancel/terminate + worker/database recovery; giới hạn result rows (maxRows truncation)
- [x] `sqlQueryPolicy.test.js` & `sqlEngineAdapter.test.js` bao phủ 100% test cases (28/28 tests pass)

### 🔹 Step 4.2: Schema Browser *(HOÀN THÀNH)*
- [x] Table/column/type/PK/nullable; tự động ẩn internal tables (`sqlite_*`)
- [x] Loading/empty/error states, expand/collapse, copy identifier vào clipboard và xem mẫu 3 hàng data preview
- [x] `SchemaBrowser.test.jsx` bao phủ 100% test cases (6/6 tests pass)

### 🔹 Step 4.3: SQL Mission Shell, Loader & Route *(HOÀN THÀNH)*
- [x] Mission/dataset loading, error/retry và lifecycle cleanup
- [x] Route `/missions/:missionId/sql` độc lập, không vỡ Excel workspace (`/workspace`)
- [x] `SqlMissionPage.test.jsx`, `mockSqlMissionService.test.js` & `MissionIntroPage.test.jsx` pass (100% regression pass)

### 🔹 Step 4.4: SQL Editor MVP *(HOÀN THÀNH)*
- [x] Controlled editor, starter/reset query, Tab 2-space indentation và Ctrl/Cmd+Enter shortcut
- [x] Accessible ARIA label (`Khung soạn thảo câu lệnh SQL`) và đồng bộ Detective Amber theme
- [x] `SqlEditor.test.jsx` & `SqlMissionPage.test.jsx` bao phủ 100% test cases (7/7 component tests pass)

### 🔹 Step 4.5: Query Execution & Result Viewer *(HOÀN THÀNH)*
- [x] Running/double-run guard và stable error mapping (`SQL_SYNTAX_ERROR`, `SQL_READ_ONLY_VIOLATION`, v.v.)
- [x] Columns/rows/`NULL`/empty/time/count/truncation, scroll và client-side pagination (50 dòng/trang)
- [x] UX Polish: Nút "Nộp bài vụ án" nổi bật, căn phải ô số (`text-right`), định dạng 1,000, giữ nguyên casing tên cột, cuộn nội bộ `max-h-[360px]` với sticky header, tối ưu độ rộng cột (`w-1`/`w-auto`) và căn chỉnh con trỏ gõ phím pixel-perfect.
- [x] `ResultViewer.test.jsx` & `SqlMissionPage.test.jsx` bao phủ 100% test cases (12/12 component tests pass)

### 🔹 Step 4.6: SQL Result Checker *(HOÀN THÀNH)*
- [x] Column/row/value comparison; column order và result order tùy cấu hình
- [x] `NULL`, duplicate rows, numeric tolerance và construct validation (`requiredConstructs`/`forbiddenConstructs`)
- [x] `sqlChecker.js` & `sqlChecker.test.js` bao phủ 100% test cases (17/17 test cases pass)

### 🔹 Step 4.7: Submission Integration *(HOÀN THÀNH)*
- [x] Dùng chung `submissionService`; không tạo SQL Submission Service riêng. Hỗ trợ `tool: 'sql'` mở rộng trong `mockSubmissionService.js`.
- [x] Run không complete; Submit tính `potentialXp`, trả `attemptId` và kiểm tra idempotency seam với `clientAttemptId`.
- [x] Tích hợp `MissionResultModal` vào `SqlMissionPage.jsx` khi phá án thành công, hiển thị banner cảnh báo inline khi câu truy vấn chưa đạt.
- [x] Unit & component test cases (`mockSubmissionService.test.js`, `SqlMissionPage.test.jsx`) bao phủ 100%.

### 🔹 Step 4.8A: Security, Query Policy & Resource Limits Guard *(HOÀN THÀNH)*
- [x] Kiểm tra chính sách Read-only (`sqlQueryPolicy.js`): Chặn 100% câu lệnh đột biến (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `CREATE`, `VACUUM`, `PRAGMA`...).
- [x] Kiểm tra bảo vệ Multi-statement & SQL Injection (chặn thực thi nhiều câu lệnh cách nhau bởi dấu `;`).
- [x] Kiểm tra ngắt thời gian (Execution Timeout 3000ms) giải phóng Worker khi gặp vòng lặp/Cartesian join quá nặng.
- [x] Kiểm tra cắt giảm dòng dữ liệu (Row truncation limit 500 rows) bảo vệ hiệu năng DOM trình duyệt.
- [x] Bổ sung unit tests cho Query Policy (`sqlQueryPolicy.test.js`) & Resource limits (`sqlEngineAdapter.test.js`).

### 🔹 Step 4.8B: Web Worker & Database Lifecycle Cleanup *(HOÀN THÀNH)*
- [x] Tự động gọi `dispose()` trên Web Worker khi unmount `SqlMissionPage`.
- [x] Đảm bảo dọn dẹp bộ nhớ và khởi tạo lại SQLite DB sạch khi chuyển đổi vụ án (`sql-sales-v1` ↔ `sql-commerce-v1`).
- [x] Thêm test cases kiểm tra dọn dẹp lifecycle trong `SqlMissionPage.test.jsx`.

### 🔹 Step 4.8C: Responsive Design & Light/Dark Theme Polish *(HOÀN THÀNH)*
- [x] Tinh chỉnh hiển thị giao diện chuẩn đẹp trong 2 chế độ Sáng/Tối (Light/Dark Mode) trên `SqlEditor`, `SchemaBrowser`, `ResultViewer` và `MissionResultModal`.
- [x] Tinh chỉnh giao diện đáp ứng linh hoạt (Responsive Layout) trên các thiết bị Mobile, Tablet và Desktop (tối ưu hóa thanh cuộn và ô bảng).

### 🔹 Step 4.8D: Production WASM Build & Full Regression Gate *(HOÀN THÀNH)*
- [x] Chạy `npm run build` và `npm run preview` xác minh đóng gói file `.wasm` và Web Worker không bị lỗi MIME type hay 404 trên Vercel.
- [x] Chạy full Vitest suite (tất cả 30+ test files / 222+ test cases pass 100%).
- [x] Kiểm tra luồng Happy Path E2E từ `/map` ➔ `/missions/mission-010` ➔ `/missions/mission-010/sql` ➔ Run ➔ Submit ➔ Modal thành công.

---

## 🟡 Sprint 5 — Game Progress System *(ĐANG THỰC HIỆN)*

### 🔹 Step 5.1: Hệ Thống XP & Thăng Cấp (Leveling Engine) *(ĐANG THỰC HIỆN)*
- [ ] Hệ thống tính toán điểm XP tích lũy & công thức thăng cấp (Level Up Formula)
- [ ] Hiệu ứng hoạt họa khi thăng cấp & nhận danh hiệu mới (Level Up Modal & Animation)

### 🔹 Step 5.2: Tự Động Mở Khóa Bài Học & Chuỗi Streak
- [ ] Tự động mở khóa bài học kế tiếp trên Bản đồ Học tập khi bài trước đạt
- [ ] Chuỗi ngày học liên tục (Streak Counter) & thưởng điểm danh hàng ngày

### 🔹 Step 5.3: Trang Hồ Sơ Cá Nhân & Bảng Thành Tựu
- [ ] Trang Hồ sơ Cá nhân Học viên (`/profile`) xem lịch sử học tập & thống kê
- [ ] Trang Danh hiệu & Thành tựu (`/achievements`) với bộ huy hiệu thám tử mở khóa

---

## ⚪ Sprint 6 — Admin Content Builder *(Dự kiến)*

### 🔹 Step 6.1: Quản Lý Khóa Học & Chương Học
- [ ] Giao diện Thêm / Sửa / Xóa Khóa học dành cho Quản trị viên (`Course Builder`)
- [ ] Giao diện Quản lý Cấu trúc Chương học (`Chapter Manager`)

### 🔹 Step 6.2: Trình Soạn Thảo Vụ Án & Xem Trước
- [ ] Trình soạn thảo Vụ án (`Mission Editor`): Nhập câu chuyện bối cảnh, mục tiêu, công thức đáp án & dataset mẫu
- [ ] Chế độ Xem trước Vụ án dành cho Quản trị viên (Admin Mission Live Preview)

---

## ⚪ Sprint 7 — Backend API & Integration *(Dự kiến)*

### 🔹 Step 7.1: FastAPI Server & Cơ Sở Dữ Liệu PostgreSQL
- [ ] Xây dựng ứng dụng RESTful API với Python FastAPI & Cơ sở dữ liệu PostgreSQL
- [ ] Thiết lập mảng ORM models (Users, Courses, Chapters, Missions, Submissions)

### 🔹 Step 7.2: Chuyển Đổi Sang API Real Client
- [ ] Thay thế toàn bộ Mock Services bằng API Client thực tế (Axios / Fetch)
- [ ] Xác thực Token JWT & Quản lý Session an toàn trên Server

---

## ⚪ Sprint 8 — Analytics, Hardening & Launch *(Dự kiến)*

### 🔹 Step 8.1: Báo Cáo Phân Tích Dữ Liệu Admin
- [ ] Bảng thống kê chi tiết tỷ lệ hoàn thành, thời gian trung bình & bài tập bị vướng nhiều nhất

### 🔹 Step 8.2: Tối Ưu Hiệu Năng & Audit Bảo Mật
- [ ] Tối ưu hóa thời gian tải trang (Code Splitting, Lazy Loading) & Audit bảo mật OWASP

### 🔹 Step 8.3: Đóng Gói Docker & Phát Hành Sản Phẩm
- [ ] Đóng gói Docker & Triển khai ứng dụng lên môi trường Production
