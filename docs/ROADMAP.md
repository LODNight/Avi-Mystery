# Lộ Trình Phát Triển Dự Án Avi-Farm (DataQuest)

> **Định hướng chiến lược:** Phát triển dự án theo mô hình Vertical Slice & Iterative Sprints. Ưu tiên hoàn thiện các luồng nghiệp vụ lõi (Excel & SQL practice, Game progress) trước khi tích hợp Backend thật và mở rộng tính năng nâng cao.
> Các khu vực hệ thống bao gồm: `LRN` (Learner App), `ADM` (Admin App), `SHR` (Shared UI/Logic), `BE` (Backend & Mock Services).

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

## 🟡 Sprint 2 — Course & Learning Map (ĐANG THỰC HIỆN)

* **Sprint Goal:** Xây dựng luồng khám phá lộ trình học tập, danh sách khóa học, cấu trúc chương và bản đồ học tập dạng Node cho Người học.
* **Primary Focus Area:** `LRN` (Learner App)
* **Supporting Focus Area:** `BE` & `SHR`
* **Modules Affected:** Course, Map, Mission
* **Learner Features:**
  * Trang Danh sách Khóa học (`/courses`) kèm ô tìm kiếm, lọc theo công cụ Excel/SQL và độ khó (`LRN-COURSE-001`) — **DONE**.
  * Trang Chi tiết Khóa học (`/courses/:slug`) hiển thị tổng quan khóa học, Accordion chương học & danh sách bài học vụ án (`LRN-COURSE-002`) — **DONE**.
  * Bản đồ học tập dạng Node/Tree (`LearningMapPage` `/map`) với các vị trí vụ án (`LRN-MAP-001`) — **DONE**.
  * Trang Giới thiệu & Nhận Nhiệm vụ vụ án (`MissionIntroPage`) (`LRN-MISSION-001`) — **TODO**.
* **Admin Features:** Giữ nguyên giao diện Admin Overview từ Sprint 1 (không thay đổi).
* **Shared / Backend Features:**
  * Bổ sung định dạng thời gian `formatDuration`, nhãn độ khó `difficultyLabel`, nhãn công cụ `toolLabel` vào `src/utils/format.js`.
  * `mockCourseService` & `mockMissionService` phục vụ lấy danh sách và chi tiết.
* **Out of Scope:** Trình soạn thảo công thức Excel, trình soạn câu lệnh SQL, quản lý khóa học Admin.
* **Exit Criteria:**
  * Toàn bộ 4 tính năng `LRN-COURSE-001`, `LRN-COURSE-002`, `LRN-MAP-001`, `LRN-MISSION-001` được triển khai đầy đủ code và Pass 100% Unit/Component Tests.
  * Cập nhật Feature Coverage Matrix trong `PROJECT_STATUS.md`.

---

## ⚪ Sprint 3 — Excel Vertical Slice

* **Sprint Goal:** Phát triển không gian làm bài Excel interactive tối thiểu cho Người học, hỗ trợ nhập công thức, chạy kiểm tra và tự động chấm điểm.
* **Primary Focus Area:** `LRN` (Learner App - Excel Workspace) & `SHR` (Excel Answer Checker)
* **Supporting Focus Area:** `BE` (Mock Submission Service)
* **Modules Affected:** Excel Workspace, Submission Checker
* **Learner Features:**
  * Spreadsheet Grid tương tác & Formula Bar (`LRN-EXCEL-001`).
  * Thanh công cụ tương tác: Run, Submit, Reset, Hint (`LRN-EXCEL-002`).
* **Admin Features:** Chưa thay đổi trong Sprint này.
* **Shared / Backend Features:**
  * Bộ chấm điểm công thức Excel Answer Checker (`SHR-EXCEL-CHECKER-001`).
  * Mock Submission Service xử lý nộp bài (`BE-SUB-001`).
* **Out of Scope:** SQL Sandbox, Chỉnh sửa bài tập Admin.
* **Exit Criteria:** 1 nhiệm vụ Excel mẫu chạy hoàn chỉnh từ A đến Z kèm test tự động.

---

## ⚪ Sprint 4 — SQL Vertical Slice

* **Sprint Goal:** Phát triển môi trường thực thi câu lệnh SQL trực tiếp trên trình duyệt, hỗ trợ Schema Browser và tự động kiểm tra kết quả truy vấn.
* **Primary Focus Area:** `LRN` (Learner App - SQL Workspace) & `SHR` (SQL Result Checker)
* **Supporting Focus Area:** `BE` (In-Browser SQL Sandbox Engine)
* **Modules Affected:** SQL Workspace, SQL Engine
* **Learner Features:** Code Editor SQL syntax highlighting, Schema Browser & SQL Result Viewer.
* **Admin Features:** Chưa thay đổi trong Sprint này.
* **Shared / Backend Features:** SQL Engine (WebAssembly SQLite) & SQL Result Checker.
* **Out of Scope:** Quản lý datasets backend PostgreSQL thật.
* **Exit Criteria:** 1 nhiệm vụ SQL mẫu chạy hoàn chỉnh từ A đến Z kèm test tự động.

---

## ⚪ Sprint 5 — Game Progress System

* **Sprint Goal:** Tích hợp cơ chế game hóa (XP, Leveling, Unlock Bài mới, Phạt Hint) để tạo động lực cho Người học.
* **Primary Focus Area:** `LRN` (Progress & Profile)
* **Supporting Focus Area:** `BE` (User Progress Service)

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
* **Primary Focus Area:** `SHR` & `ADM`
