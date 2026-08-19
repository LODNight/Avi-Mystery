# Trạng Thái Dự Án Avi-Farm (DataQuest)

> **Cập nhật lần cuối:** 19/08/2026  
> **Người thực hiện:** Senior Full-stack Developer & QA Lead

---

## 1. Tổng Quan Tiến Độ Sprint 2

* **Sprint Hiện Tại:** Sprint 2 — Course & Learning Map
* **Sprint Goal:** Phát triển các trang danh sách khóa học, chi tiết lộ trình học tập, cấu trúc chương và bản đồ học tập dạng node cho người học.
* **Step Vừa Hoàn Thành:** Step 2.4 — Trang Giới thiệu & Nhận Nhiệm vụ vụ án (`MissionIntroPage.jsx`) thuộc khu vực Learner (`LRN`).
* **Trạng Thái Sprint:** **HOÀN THÀNH (DONE - 4/4 Steps)**.

---

## 2. Bảng Trạng Thái Sprint Hiện Tại (Sprint 2)

| Khu vực | Trọng tâm | Tính năng trong Sprint | Trạng thái |
|---|---|---|---|
| **Learner (`LRN`)** | `Primary` | Trang Danh sách Khóa học (`/courses`), Trang Chi tiết Khóa học (`/courses/:slug`), Bản đồ học tập Learning Map (`/map`), Trang Giới thiệu Nhiệm vụ (`/missions/:missionId`) | `DONE` (Hoàn thành Step 2.1, 2.2, 2.3, 2.4) |
| **Admin (`ADM`)** | `None` | Giữ nguyên App Shell và màn hình tổng quan đã xây dựng từ Sprint 1 | `NO_CHANGE` |
| **Shared (`SHR`)** | `Supporting` | Tái sử dụng các UI components (`Badge`, `Skeleton`, `EmptyState`, `ErrorState`), bổ sung định dạng thời gian và nhãn công cụ | `DONE` |
| **Backend (`BE`)** | `Supporting` | Sử dụng `mockCourseService` (`getCourses`, `getCourse`, `getChaptersByCourse`) và `mockMissionService` (`getMissionsByChapter`, `getMission`) | `DONE` |

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
| `BE-MISSION-001` | `BE` | Mission | Mock Mission Service Adapter (`getMissionsByChapter`, `getMission`) | Sprint 1 & 2 | `DONE` | Pass | `src/services/mock/mockMissionService.js` |
| `LRN-DASH-001` | `LRN` | Dashboard | Trang Tổng quan Người học (Learner Dashboard) | Sprint 1 | `DONE` | Pass | `src/pages/learner/DashboardPage.jsx` |
| `ADM-OVER-001` | `ADM` | Overview | Trang Tổng quan Quản trị viên (Admin Overview) | Sprint 1 | `DONE` | Pass | `src/pages/admin/OverviewPage.jsx` |
| `LRN-COURSE-001` | `LRN` | Course | Trang Danh sách Khóa học & Bộ lọc Search/Tool/Difficulty | Sprint 2 | `DONE` | Pass | `src/pages/learner/CoursesPage.jsx` |
| `LRN-COURSE-002` | `LRN` | Course | Trang Chi tiết Khóa học & Accordion Chương học (`/courses/:slug`) | Sprint 2 | `DONE` | Pass | `src/pages/learner/CourseDetailPage.jsx` |
| `LRN-MAP-001` | `LRN` | Map | Bản đồ học tập dạng Node/Tree (`LearningMapPage`) | Sprint 2 | `DONE` | Pass | `src/pages/learner/LearningMapPage.jsx` |
| `LRN-MISSION-001` | `LRN` | Mission | Trang Giới thiệu & Nhận Nhiệm vụ vụ án (`MissionIntroPage`) | Sprint 2 | `DONE` | Pass | `src/pages/learner/MissionIntroPage.jsx` |

---

## 4. Kết Luận Tiến Độ Sprint 2

* **Phần đã hoàn thành:** 
  - `LRN-COURSE-001`: Trang Danh sách khóa học có bộ lọc từ khóa, công cụ Excel/SQL và độ khó.
  - `LRN-COURSE-002`: Trang Chi tiết khóa học với tổng quan vụ án, accordion chương học và danh sách nhiệm vụ.
  - `LRN-MAP-001`: Trang Bản đồ học tập cây node nhiệm vụ tương tác, chuyển đổi lộ trình khóa học, tính toán chỉ số XP và badge bài tiếp theo.
  - `LRN-MISSION-001`: Trang Giới thiệu chi tiết vụ án (Detective Briefing) với bối cảnh vụ án, mục tiêu, dataset metadata và nút bấm bắt đầu làm bài.
  - Test suites tự động đạt tỷ lệ Pass 100% (39/39 tests pass trên 9 files).
* **Blockers:** Không có.
* **Điều kiện đóng Sprint 2:** **ĐÃ ĐỦ ĐIỀU KIỆN ĐÓNG SPRINT 2**. Toàn bộ 4 user stories đã đạt Acceptance Criteria & Pass test suites.
