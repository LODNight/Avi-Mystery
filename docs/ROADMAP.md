# Lộ Trình Phát Triển Dự Án Avi-Mystery

> **Định hướng chiến lược:** Phát triển dự án theo mô hình Vertical Slice & Iterative Sprints. Ưu tiên hoàn thiện các luồng nghiệp vụ lõi (Excel & SQL practice, Game progress) trước khi tích hợp Backend thật và mở rộng tính năng nâng cao.
> Các khu vực hệ thống bao gồm: `LRN` (Learner App), `ADM` (Admin App), `SHR` (Shared UI/Logic), `BE` (Backend & Mock Services).
>
> **Nguồn trạng thái thực thi:** [`agent/CURRENT_TASK.md`](./agent/CURRENT_TASK.md). Roadmap chỉ mô tả thứ tự và mục tiêu; không cho phép agent tự chuyển Sprint/Step.

---

## 🟢 Sprint 1 — Frontend Foundation (HOÀN THÀNH)

* **Sprint Goal:** Thiết lập toàn bộ khung hạ tầng ứng dụng Frontend, hệ thống phân quyền RBAC, giao diện Detective Amber và cơ chế kiểm thử tự động.
* **Primary Focus Area:** `SHR` (Shared Layout & System Architecture)
* **Supporting Focus Area:** `LRN` & `ADM`
* **Modules Affected:** Auth, Router, UI Components, Service Contracts
* **Learner Features:**
  * App Shell & Sidebar responsive thu gọn/mở rộng.
  * Trang Dashboard Người học tổng quan (`LRN-DASH-001`).
* **Admin Features:**
  * App Shell Admin & Phân quyền bảo vệ route (`RequireAdmin`).
  * Trang Tổng quan Admin Overview (`ADM-OVER-001`).
* **Shared / Backend Features:**
  * Phân quyền RBAC Guard 3 roles (`SHR-AUTH-001`).
  * Design System Detective Amber hỗ trợ Light/Dark Theme (`SHR-AUTH-002`).
  * Bộ UI Components tiêu chuẩn (`Button`, `Card`, `Input`, `Badge`, `Skeleton`, `EmptyState`).
  * Accessible Loading Skeletons (`aria-busy="true"`).
  * Mock Auth, Course, Mission Adapters (`BE-AUTH-001`, `BE-COURSE-001`, `BE-MISSION-001`).
* **Out of Scope:** Màn hình làm bài Excel/SQL thực tế, kết nối API backend thật.
* **Exit Criteria:** 100% test cases pass, RBAC bảo vệ 100% routes, 5 file tài liệu tiến độ khởi tạo thành công.

---

## 🟢 Sprint 2 — Course & Learning Map (HOÀN THÀNH)

* **Sprint Goal:** Xây dựng luồng khám phá lộ trình học tập, danh sách khóa học, cấu trúc chương và bản đồ học tập dạng Node cho Người học.
* **Primary Focus Area:** `LRN` (Learner App)
* **Supporting Focus Area:** `BE` & `SHR`
* **Modules Affected:** Course, Map, Mission
* **Learner Features:**
  * Trang Danh sách Khóa học (`/courses`) kèm ô tìm kiếm, lọc theo công cụ Excel/SQL và độ khó (`LRN-COURSE-001`) — **DONE**.
  * Trang Chi tiết Khóa học (`/courses/:slug`) hiển thị tổng quan khóa học, Accordion chương học & danh sách bài học vụ án (`LRN-COURSE-002`) — **DONE**.
  * Bản đồ học tập dạng Node/Tree (`LearningMapPage` `/map`) với các vị trí vụ án (`LRN-MAP-001`) — **DONE**.
  * Trang Giới thiệu & Nhận Nhiệm vụ vụ án (`MissionIntroPage` `/missions/:missionId`) (`LRN-MISSION-001`) — **DONE**.
* **Admin Features:** Giữ nguyên giao diện Admin Overview từ Sprint 1 (không thay đổi).
* **Shared / Backend Features:**
  * Bổ sung định dạng thời gian `formatDuration`, nhãn độ khó `difficultyLabel`, nhãn công cụ `toolLabel` vào `src/utils/format.js`.
  * `mockCourseService` & `mockMissionService` phục vụ lấy danh sách và chi tiết (`getMissionsByChapter`, `getMission`).
* **Out of Scope:** Trình soạn thảo công thức Excel, trình soạn câu lệnh SQL, quản lý khóa học Admin.
* **Exit Criteria:** Toàn bộ 4 tính năng `LRN-COURSE-001`, `LRN-COURSE-002`, `LRN-MAP-001`, `LRN-MISSION-001` được triển khai đầy đủ code và Pass 100% Unit/Component Tests.

---

## 🟢 Sprint 3 — Excel Vertical Slice (HOÀN THÀNH 100%)

* **Sprint Goal:** Phát triển không gian làm bài Excel interactive tối thiểu cho Người học, hỗ trợ nhập công thức, chạy kiểm tra và tự động chấm điểm.
* **Primary Focus Area hiện tại:** `LRN-EXCEL` (Excel Workspace & Light Mode Refinement)
* **Supporting Focus Area:** `SHR` (contract/gateway, mặc định read-only ngoài path được duyệt)
* **Modules Affected:** `LRN-EXCEL`, `LRN-SUB`, `SHR`
* **Learner Features:**
  * Step 3.0 — Transition audit và Excel Answer Checker — **DONE**.
  * Step 3.1 — Excel Mission Shell và dataset — **DONE**.
  * Step 3.2 — Spreadsheet Grid và Formula Bar — **DONE**.
  * Step 3.3 — Run, Reset, Hint và Action Toolbar — **DONE**.
  * Step 3.4 — Submission contract, async flow và feedback — **DONE**.
  * Step 3.4E — Submission UI Stabilization — **DONE**.
  * Step 3.5 — Learner UI Foundation & Stabilization — **DONE**.
  * Step 3.6 — Light Mode Refinement & Accessibility — **DONE**.
  * Step 3.6G — Sprint 3 Stabilization Gate — **DONE**.
* **Admin Features:** Chưa thay đổi trong Sprint này.
* **Shared / Backend Features:**
  * Bộ chấm điểm công thức Excel Answer Checker (`SHR-EXCEL-CHECKER-001`) — **DONE**.
  * Mock Submission Service, structured errors, retry/idempotency seams và feedback UI — **DONE**.
  * Submission contract dùng chung và gateway export — **DONE**.
* **Out of Scope:** SQL Sandbox, Admin Content Builder, API thật và trao XP/level/streak.
* **Exit Criteria:** Core technical gate đã đạt. Toàn bộ Step 3.0–3.6G, targeted 73/73, regression 133/133, production build và Browser viewport/theme/a11y check pass. Sprint 4 Step 4.0 → 4.1B cũng đã hoàn thành.

### Step 3.4E — Submission UI Stabilization (HOÀN THÀNH)

- [x] Xác minh Run/Submit loading và double-submit guard.
- [x] Xác minh inline validation/incorrect/service error/Retry.
- [x] Xác minh success modal, focus, Escape và responsive submission area.
- [x] Giữ answer khi sai/lỗi và giữ wording `potentialXp` là phần thưởng dự kiến.
- [x] Bổ sung regression test còn thiếu; không mở rộng sang Learner UI redesign.

### Step 3.5 — Learner UI Foundation & Stabilization (HOÀN THÀNH)

#### Step 3.5A — UI Audit & Component Inventory

- [x] Kiểm kê màn hình và component hiện tại.
- [x] Phân loại feature component và shared component.
- [x] Xác định component trùng lặp.
- [x] Xác định regression risk.
- [x] Chốt phạm vi được phép refactor.

#### Step 3.5B — Shared UI Components

- [x] Chuẩn hóa Button.
- [x] Chuẩn hóa Modal/Dialog.
- [x] Chuẩn hóa Card, Form và feedback state.
- [x] Chuẩn hóa loading, empty và error state.
- [x] Không thay đổi business logic.

#### Step 3.5C — Learner Layout & Navigation

- [x] Chuẩn hóa Header/Sidebar.
- [x] Chuẩn hóa Mission layout.
- [x] Kiểm tra navigation.
- [x] Không xây route thuộc Sprint tương lai.

#### Step 3.5D — Responsive & Accessibility

- [x] Kiểm tra desktop, tablet và mobile cơ bản.
- [x] Kiểm tra keyboard navigation và focus management.
- [x] Không dùng màu sắc làm dấu hiệu duy nhất.

#### Step 3.5E — Regression & User Test Readiness

- [x] Regression test Sprint 1–3.4.
- [x] Kiểm tra learner happy path, loading, error và retry.
- [x] Tổng hợp feedback nhưng không tự mở rộng scope.

### Step 3.6 — Light Mode Refinement & Accessibility (HOÀN THÀNH)

#### Step 3.6A — Light Mode Audit & Theme Tokens
- [x] Kiểm kê các màn hình Learner sử dụng Light Mode.
- [x] Xác định màu đang hard-code.
- [x] Chuẩn hóa token cho background, surface, border và text.
- [x] Xác định visual baseline của Dark Mode.
- [x] Không chỉnh Dark Mode nếu không có regression.

#### Step 3.6B — Background, Cards & Visual Hierarchy
- [x] Nền hệ thống sử dụng xám cực nhạt.
- [x] Card sử dụng nền trắng.
- [x] Chuẩn hóa border hoặc shadow.
- [x] Phân biệt rõ page, section và card.
- [x] Không lạm dụng drop shadow.
- [x] Kiểm tra giao diện desktop và mobile.

#### Step 3.6C — Secondary Action Buttons
- [x] Sử dụng màu xám hoặc outline trung tính cho Chạy thử, Gợi ý, Đặt lại.
- [x] Nút Nộp bài vẫn là primary action.
- [x] Có default, hover, active và disabled state.
- [x] Có `focus-visible` khi dùng bàn phím.
- [x] Không chỉ dùng màu để biểu thị trạng thái.
- [x] Không thay đổi logic của nút.

#### Step 3.6D — Excel Workspace Light Mode
- [x] Formula Bar: Tăng khả năng nhận biết input, border rõ hơn trên nền trắng, hover/focus/error state.
- [x] Data Table: Header xám trung tính, tăng độ đọc text, phân biệt cell states, kiểm tra grid line.
- [x] Không thay đổi formula evaluator hoặc worksheet state.

#### Step 3.6E — Streak Visual Balance
- [x] Giảm saturation của màu cam, không để Streak cạnh tranh với nút Nộp bài.
- [x] Ưu tiên nền trắng/xám và viền cam, giữ icon và nội dung dễ nhận biết.
- [x] Không xây streak logic, không trao XP, không đánh dấu Sprint 5 đã bắt đầu.

#### Step 3.6F — Accessibility & Theme Regression
- [x] Kiểm tra text contrast, component contrast, keyboard focus.
- [x] Regression test Dark Mode, Submission flow trên desktop & mobile.
- [x] Xác minh local Browser preview trên desktop/tablet/mobile.

### Step 3.6G — Sprint 3 Stabilization Gate (HOÀN THÀNH)

- [x] Dấu `=` và lỗi cú pháp trong required range không trả success.
- [x] Global validator trả mã lỗi ổn định và có unit test đủ các nhánh.
- [x] Reset/mission change xóa inline hint stale.
- [x] Hint drawer hỗ trợ focus, Escape và restore focus.
- [x] Sidebar active matching theo segment boundary.
- [x] Targeted 73/73, full regression 133/133, production build và Browser check pass.

---

## 🟡 Sprint 4 — SQL Vertical Slice (ĐANG THỰC HIỆN — Step 4.3)

* **Sprint Goal:** Phát triển môi trường thực thi câu lệnh SQL trực tiếp trên trình duyệt, hỗ trợ Schema Browser, SQL Code Editor và tự động kiểm tra kết quả truy vấn.
* **Primary Focus Area:** `LRN-SQL` (SQL Workspace, in-browser engine và evaluator)
* **Supporting Focus Area:** `SHR` và `LRN-SUB`
* **Execution rule:** Step 4.0 phải hoàn thành trước mọi product implementation; mỗi Step có một Primary Module và Current Task riêng.
* **Sub-Steps:**
  - **Step 4.0:** Technical Spike & SQL Contracts — **DONE**; `sql.js@1.14.2`, SQL unit 11/11, regression 144/144 và dev/build/preview Worker+WASM pass
  - **Step 4.1A:** WASM Packaging & Worker Transport — **DONE**; Request ID correlation, out-of-order & stale filter, lazy-loading, build gating `sql-spike.html`, unit 7/7 & full regression 148/148 pass
  - **Step 4.1B:** Database Lifecycle, Seed, Reset & Schema API — **DONE**; `getSchema` mở rộng `sampleRows`, lifecycle test 7/7 & dataset validation 8/8 & full SQL 27/27 pass
  - **Step 4.1C:** Read-only Query Policy, Timeout & Row Limit — **DONE**; 10 mutation/DDL keywords, single-statement policy, timeout recovery and row truncation verified
  - **Step 4.2:** Schema Browser — **DONE**; search, metadata, sample rows, copy, loading/empty/error and keyboard tests pass
  - **Step 4.3:** SQL Mission Shell, Loader & Route — **IN_PROGRESS**
  - **Step 4.4:** SQL Editor MVP — **PLANNED**
  - **Step 4.5:** Query Execution & Result Viewer — **PLANNED**
  - **Step 4.6:** SQL Result Checker — **PLANNED**
  - **Step 4.7:** Submission Integration — **PLANNED**; Primary Module dự kiến `LRN-SUB`
  - **Step 4.8:** Security, Browser, Deployment & Regression Gate — **PLANNED**
* **MVP Boundary:** SQLite dialect, database in-memory, Worker bắt buộc, không OPFS, không backend execution, không XP mutation. Editor dùng controlled textarea trước; syntax highlighting/CodeMirror chỉ được nâng lên P0 khi dependency spike pass.
* **Sprint Exit Criteria:** một SQL Mission chạy xuyên suốt; engine không block UI; reset/dispose ổn định; user query read-only; checker xử lý order/`NULL`/duplicate/tolerance; Run khác Submit; production WASM và full Excel regression pass.

---

## ⚪ Sprint 5 — Game Progress System

* **Sprint Goal:** Tích hợp cơ chế game hóa (XP, Leveling, Unlock Bài mới, Phạt Hint) để tạo động lực cho Người học.
* **Primary Focus Area:** `GAME` (Progress & Profile)

---

## ⚪ Sprint 6 — Admin Content Builder

* **Sprint Goal:** Cung cấp công cụ quản trị giúp Admin soạn thảo Khóa học, Chương, Nhiệm vụ và xem trước nội dung.
* **Primary Focus Area:** `ADM` (Admin App - Content Builder)

---

## ⚪ Sprint 7 — Backend API & Integration

* **Sprint Goal:** Triển khai FastAPI Backend, PostgreSQL Application DB và chuyển đổi Frontend từ Mock Adapters sang Real API.
* **Primary Focus Area:** `BE` (FastAPI & PostgreSQL)

---

## ⚪ Sprint 8 — Analytics, Hardening & Launch

* **Sprint Goal:** Tối ưu hóa hiệu năng, bảo mật, báo cáo Admin Analytics và phát hành sản phẩm.
* **Primary Focus Area:** `ANL`, hỗ trợ bởi `ADM`, frontend và `BE`.
