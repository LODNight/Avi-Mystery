# Bảng Theo Dõi Tiến Độ Chi Tiết Theoừng Step — Avi-Mystery

> **Cập nhật lần cuối:** 21/08/2026
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

## 🟡 Sprint 3 — Excel Vertical Slice *(Core hoàn thành — UI stabilization pending)*

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
- [x] Submission/formula core tests pass; audit working tree regression 120/120 tests pass

### 🔹 Step 3.4E: Submission UI Stabilization *(HOÀN THÀNH 100%)*
- [x] Xác minh Run/Submit loading, disabled và chống double submit
- [x] Xác minh inline validation/incorrect/service error và Retry
- [x] Xác minh success modal, keyboard/focus và responsive submission area
- [x] Giữ answer khi sai/lỗi và wording phần thưởng dự kiến
- [x] Chạy targeted test và regression trước khi đóng Step

### 🔹 Step 3.5: Learner UI Foundation & Stabilization *(PLANNED)*
- [ ] Step 3.5A — UI Audit & Component Inventory
- [ ] Step 3.5B — Shared UI Components
- [ ] Step 3.5C — Learner Layout & Navigation
- [ ] Step 3.5D — Responsive & Accessibility
- [ ] Step 3.5E — Regression & User Test Readiness

### 🔹 Step 3.6: Light Mode Refinement & Accessibility *(PLANNED)*
- [ ] Step 3.6A — Light Mode Audit & Theme Tokens
- [ ] Step 3.6B — Background, Cards & Visual Hierarchy
- [ ] Step 3.6C — Secondary Action Buttons
- [ ] Step 3.6D — Excel Workspace Light Mode (Formula Bar & Data Table)
- [ ] Step 3.6E — Streak Visual Balance
- [ ] Step 3.6F — Accessibility & Theme Regression

---

## ⚪ Sprint 4 — SQL Vertical Slice *(Chưa kích hoạt)*

### 🔹 Step 4.1: In-Browser SQL Engine & Schema Browser
- [ ] Tích hợp trình quản lý SQL WebAssembly (SQLite) chạy trực tiếp trên trình duyệt
- [ ] Xây dựng Trình duyệt Cấu trúc Bảng (`Schema Browser`) hiển thị tên bảng, tên cột & kiểu dữ liệu

### 🔹 Step 4.2: SQL Code Editor & Result Viewer
- [ ] Xây dựng Trình soạn thảo cú pháp SQL (`SQL Code Editor`) với Tô màu cú pháp & gợi ý tự động
- [ ] Xây dựng Bảng hiển thị Kết quả Truy vấn (`SQL Result Table`) hỗ trợ phân trang & đếm số dòng

### 🔹 Step 4.3: SQL Result Evaluator & Submission
- [ ] Xây dựng Bộ so sánh kết quả bảng truy vấn (`SQL Result Checker`)
- [ ] Xây dựng Mock Submission Service cho các nhiệm vụ SQL

---

## ⚪ Sprint 5 — Game Progress System *(Dự kiến)*

### 🔹 Step 5.1: Hệ Thống XP & Thăng Cấp (Leveling Engine)
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
