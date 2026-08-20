# Trạng Thái Dự Án Avi-Mystery

> **Cập nhật lần cuối:** 20/08/2026  
> **Người thực hiện:** Senior Frontend Developer, Software Architect & QA Lead

---

## 1. Tổng Quan Tiến Độ Sprint 3

* **Sprint Hiện Tại:** Sprint 3 — Excel Vertical Slice
* **Sprint Goal:** Phát triển không gian làm bài Excel interactive tối thiểu cho Người học, hỗ trợ hiển thị bảng tính, chọn ô, nhập công thức, tính toán qua Formula Engine Adapter, kiểm tra câu trả lời và tự động tính điểm.
* **Step Vừa Hoàn Thành:** Step 3.1 — Excel Mission Shell (`LRN-EXCEL-001`).
* **Trạng Thái Sprint:** Đang triển khai (Hoàn thành Step 3.1 Excel Mission Shell, chuẩn bị chuyển sang Step 3.2 Spreadsheet Grid & Formula Bar).

---

## 2. Bảng Trạng Thái Sprint Hiện Tại (Sprint 3)

| Khu vực | Trọng tâm | Tính năng trong Sprint | Trạng thái |
|---|---|---|---|
| **Learner (`LRN`)** | `Primary` | Trang làm bài Excel Workspace (`/missions/:missionId/workspace`), Spreadsheet Grid & Formula Bar | `IN_PROGRESS` (Step 3.1 Shell Done) |
| **Admin (`ADM`)** | `None` | Giữ nguyên App Shell, Quản lý trạng thái trang trong Cài đặt | `NO_CHANGE` |
| **Shared (`SHR`)** | `Primary` | Formula Engine Adapter & Excel Answer Checker (`excelChecker.js`) | `DONE` (Checker ready) |
| **Backend (`BE`)** | `Supporting` | Mock Dataset Service & Submission Service | `IN_PROGRESS` (`getDataset` Done) |

---

## 3. Feature Coverage Matrix

| ID | Area | Module | Feature | Sprint | Status | Test | Evidence |
|---|---|---|---|---|---|---|---|
| `SHR-AUTH-001` | `SHR` | Auth | Phân quyền RBAC Guard (`RequireAuth`, `RequireLearner`, `RequireAdmin`) | Sprint 1 | `DONE` | Pass | `src/app/router/index.jsx` |
| `SHR-AUTH-002` | `SHR` | Auth | Design System Detective Amber (Light/Dark Theme Toggle) | Sprint 1 | `DONE` | Pass | `src/app/layouts/LearnerLayout.jsx` |
| `SHR-UI-001` | `SHR` | UI | Standard UI Components (`Button`, `Card`, `Input`, `Badge`) | Sprint 1 | `DONE` | Pass | `src/components/ui/` |
| `SHR-UI-002` | `SHR` | UI | Accessible Loading Skeletons (`aria-busy="true"`) | Sprint 1 | `DONE` | Pass | `src/components/ui/Skeleton.jsx` |
| `SHR-UI-003` | `SHR` | UI | Standard States (`EmptyState`, `ErrorState`, `ProgressBar`) | Sprint 1 | `DONE` | Pass | `src/components/ui/EmptyState.jsx` |
| `BE-AUTH-001` | `BE` | Auth | Mock Auth Service Adapter (Session LocalStorage) | Sprint 1 | `DONE` | Pass | `src/services/mock/mockAuthService.js` |
| `BE-COURSE-001` | `BE` | Course | Mock Course Service Adapter (`getCourses`, `getCourse`, `getChaptersByCourse`) | Sprint 1 & 2 | `DONE` | Pass | `src/services/mock/mockCourseService.js` |
| `BE-MISSION-001` | `BE` | Mission | Mock Mission Service Adapter (`getMissionsByChapter`, `getMission`, `getDataset`) | Sprint 1, 2, 3 | `DONE` | Pass | `src/services/mock/mockMissionService.js` |
| `LRN-DASH-001` | `LRN` | Dashboard | Trang Tổng quan Người học (Learner Dashboard) | Sprint 1 | `DONE` | Pass | `src/pages/learner/DashboardPage.jsx` |
| `ADM-OVER-001` | `ADM` | Overview | Trang Tổng quan Quản trị viên (Admin Overview & Page Status Manager) | Sprint 1 & 2 | `DONE` | Pass | `src/pages/admin/PageStatusPage.jsx` |
| `LRN-COURSE-001` | `LRN` | Course | Trang Danh sách Khóa học & Bộ lọc Search/Tool/Difficulty | Sprint 2 | `DONE` | Pass | `src/pages/learner/CoursesPage.jsx` |
| `LRN-COURSE-002` | `LRN` | Course | Trang Chi tiết Khóa học & Accordion Chương học (`/courses/:slug`) | Sprint 2 | `DONE` | Pass | `src/pages/learner/CourseDetailPage.jsx` |
| `LRN-MAP-001` | `LRN` | Map | Bản đồ học tập dạng Node/Tree (`LearningMapPage`) | Sprint 2 | `DONE` | Pass | `src/pages/learner/LearningMapPage.jsx` |
| `LRN-MISSION-001` | `LRN` | Mission | Trang Giới thiệu & Nhận Nhiệm vụ vụ án (`MissionIntroPage`) | Sprint 2 | `DONE` | Pass | `src/pages/learner/MissionIntroPage.jsx` |
| `SHR-EXCEL-CHECKER-001` | `SHR` | Excel | Bộ chấm điểm công thức Excel Answer Checker (`excelChecker.js`) | Sprint 3 | `DONE` | Pass | `src/utils/excelChecker.js` |
| `SHR-AUDIT-003` | `SHR` | Audit | Step 3.0 Transition Audit (Kiểm tra điều kiện gate Sprint 2) | Sprint 3 | `DONE` | Pass | 58/58 tests passed across 11 test suites |
| `LRN-EXCEL-001` | `LRN` | Mission | Step 3.1 Excel Mission Shell (`ExcelMissionPage.jsx` `/missions/:missionId/workspace`) | Sprint 3 | `DONE` | Pass | 62/62 tests passed across 12 test suites |

---

## 4. Kết Luận Tiến Độ Step 3.1 (Excel Mission Shell)

* **Phần đã hoàn thành:** 
  - Khởi tạo tệp mock dataset `src/mocks/data/datasets.json` cho vụ án Sales Orders & Customers.
  - Bổ sung `getDataset(datasetId)` vào `mockMissionService.js` kèm bộ test unit 100% pass.
  - Xây dựng component `ExcelMissionPage.jsx` với giao diện hai cột (Hồ sơ vụ án MissionPanel & Không gian bảng tính Spreadsheet Workspace).
  - Đăng ký route `/missions/:missionId/workspace` trong AppRouter được bảo vệ bởi RBAC guards (`RequireAuth`, `RequireLearner`).
  - Liên kết nút "Bắt đầu điều tra ngay" từ `MissionIntroPage` tới không gian làm bài Excel Workspace.
  - Viết bộ test component `ExcelMissionPage.test.jsx` với 100% test cases pass.
* **Kế hoạch Step tiếp theo:** Step 3.2 — Spreadsheet Grid & Formula Bar (`LRN-EXCEL-002`).


