# Trạng Thái Dự Án Avi-Mystery

> **Cập nhật lần cuối:** 22/08/2026
> **Nguồn trạng thái task:** [`agent/CURRENT_TASK.md`](./agent/CURRENT_TASK.md)

---

## 1. Tổng Quan Tiến Độ Sprint 3

* **Sprint Hiện Tại:** Sprint 3 — Excel Vertical Slice
* **Sprint Goal:** Hoàn thiện một Excel learning vertical slice với workspace, evaluator, submission orchestration và feedback có boundary ổn định.
* **Step đã hoàn thành:** Step 3.0–3.6.
* **Step hiện tại:** Step 3.6 — Light Mode Refinement & Accessibility (`DONE`).
* **Step kế tiếp đã lên kế hoạch:** Sprint 4 — SQL Vertical Slice.
* **Trạng thái Sprint:** `DONE — SPRINT 3 COMPLETE`; Chuẩn bị kích hoạt Sprint 4.

---

## 2. Bảng Trạng Thái Sprint Hiện Tại (Sprint 3)

| Khu vực | Trọng tâm | Tính năng trong Sprint | Trạng thái |
|---|---|---|---|
| **Learner Excel (`LRN-EXCEL`)** | `Primary` | Workspace core `DONE`; Light Mode & Accessibility Refinement | `DONE / Step 3.6` |
| **Submission (`LRN-SUB`)** | `Supporting` | Core `DONE`; feedback/responsive/a11y stabilization | `DONE / Step 3.4E` |
| **Admin (`ADM`)** | `None` | Giữ nguyên App Shell, Quản lý trạng thái trang trong Cài đặt | `NO_CHANGE` |
| **Shared (`SHR`)** | `Supporting` | Contract/gateway `DONE`; Learner layout/shared UI audit & Light Mode tokens | `DONE / Step 3.6` |
| **Backend (`BE`)** | `None` | FastAPI/PostgreSQL/API integration | `PLANNED` cho Sprint 7 |

---

## 3. Feature Coverage Matrix

Các ID `BE-*` ở Sprint 1–2 là legacy IDs của frontend mock adapters; không có nghĩa backend FastAPI đã tồn tại. Ownership hiện hành nằm tại [`agent/MODULE_MAP.md`](./agent/MODULE_MAP.md).

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
| `SHR-AUDIT-003` | `SHR` | Audit | Step 3.0 Transition Audit và Excel checker | Sprint 3 | `DONE` | Pass | `src/utils/excelChecker.test.js` |
| `LRN-EXCEL-001` | `LRN-EXCEL` | Mission | Step 3.1 Excel Mission Shell (`/missions/:missionId/workspace`) | Sprint 3 | `DONE` | Pass | `src/pages/learner/ExcelMissionPage.test.jsx` |
| `LRN-EXCEL-002` | `LRN-EXCEL` | Workspace | Step 3.2 Grid/Formula Bar và Step 3.3 Toolbar/Hints | Sprint 3 | `DONE` | Pass | `src/components/excel/*.test.jsx` |
| `LRN-SUB-3.4` | `LRN-SUB` | Submission | Contract, async submit và feedback | Sprint 3 | `DONE` | Pass | `src/services/contracts/submissionService.js`, `src/services/mock/mockSubmissionService*`, `ExcelMissionPage*` |
| `LRN-SUB-3.4E` | `LRN-SUB` | UI Stabilization | Submission feedback/responsive/accessibility gate | Sprint 3 | `DONE` | Pass | `docs/agent/UI_CHANGE_INVENTORY.md` |
| `LRN-UI-3.6` | `LRN-EXCEL` | Light Mode Refinement | Standardized Light Mode design & accessibility | Sprint 3 | `DONE` | Pass (120/120) | `src/styles/index.css`, `ActionToolbar.jsx`, `FormulaBar.jsx`, `SpreadsheetGrid.jsx`, `LearnerLayout.jsx` |

---

## 4. Step 3.6 Completion Summary

* **Đã hoàn thành:** Tinh chỉnh theme tokens light mode, trung tính hóa các nút phụ ActionToolbar, nâng cao độ tương phản FormulaBar, làm sạch header và ô bảng SpreadsheetGrid, cân bằng Streak promo card trong Sidebar.
* **Boundary:** Giữ nguyên Submission Contract, Evaluator logic, không trao XP hay kích hoạt logic game chưa tới lượt.
* **Audit validation:** Current working tree full regression pass 19/19 test files với 120/120 unit & integration tests pass.
