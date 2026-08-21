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

## 🟢 Sprint 3 — Excel Vertical Slice (HOÀN THÀNH)

* **Sprint Goal:** Phát triển không gian làm bài Excel interactive tối thiểu cho Người học, hỗ trợ nhập công thức, chạy kiểm tra và tự động chấm điểm.
* **Primary Focus Area hiện tại:** `LRN-SUB` (Submission & Feedback)
* **Supporting Focus Area:** `SHR` (contract/gateway, mặc định read-only ngoài path được duyệt)
* **Modules Affected:** `LRN-EXCEL`, `LRN-SUB`, `SHR`
* **Learner Features:**
  * Step 3.0 — Transition audit và Excel Answer Checker — **DONE**.
  * Step 3.1 — Excel Mission Shell và dataset — **DONE**.
  * Step 3.2 — Spreadsheet Grid và Formula Bar — **DONE**.
  * Step 3.3 — Run, Reset, Hint và Action Toolbar — **DONE**.
  * Step 3.4 — Submission contract, async flow và feedback — **DONE**.
* **Admin Features:** Chưa thay đổi trong Sprint này.
* **Shared / Backend Features:**
  * Bộ chấm điểm công thức Excel Answer Checker (`SHR-EXCEL-CHECKER-001`) — **DONE**.
  * Mock Submission Service, structured errors, retry/idempotency seams và feedback UI — **DONE**.
  * Submission contract dùng chung và gateway export — **DONE**.
* **Out of Scope:** SQL Sandbox, Admin Content Builder, API thật và trao XP/level/streak.
* **Exit Criteria:** **ĐẠT** — shared contract; structured formula diagnostics; đúng/sai/service error/retry rõ ràng; không double submit; giữ answer khi sai; Submission không trực tiếp trao XP; 118/118 regression tests pass.

---

## ⚪ Sprint 4 — SQL Vertical Slice (CHƯA KÍCH HOẠT)

* **Sprint Goal:** Phát triển môi trường thực thi câu lệnh SQL trực tiếp trên trình duyệt, hỗ trợ Schema Browser và tự động kiểm tra kết quả truy vấn.
* **Primary Focus Area:** `LRN-SQL` (SQL Workspace, in-browser engine và evaluator)
* **Supporting Focus Area:** `SHR` và `LRN-SUB`
* **Modules Affected:** SQL Workspace, SQL Engine, Submission Contract
* **Learner Features:** Code Editor SQL syntax highlighting, Schema Browser & SQL Result Viewer.
* **Admin Features:** Chưa thay đổi trong Sprint này.
* **Shared Features:** SQL Engine adapter/Worker, result checker và integration với generic submission contract.
* **Out of Scope:** Quản lý datasets backend PostgreSQL thật.
* **Exit Criteria:** 1 nhiệm vụ SQL mẫu chạy hoàn chỉnh từ A đến Z kèm test tự động.

---

## ⚪ Sprint 5 — Game Progress System

* **Sprint Goal:** Tích hợp cơ chế game hóa (XP, Leveling, Unlock Bài mới, Phạt Hint) để tạo động lực cho Người học.
* **Primary Focus Area:** `GAME` (Progress & Profile)
* **Supporting Focus Area:** `SHR` và `LRN-SUB`; backend authority chỉ đến Sprint 7.

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
