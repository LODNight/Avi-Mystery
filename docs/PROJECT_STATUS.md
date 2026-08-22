# Trạng Thái Dự Án Avi-Mystery

> **Cập nhật lần cuối:** 22/08/2026
> **Nguồn trạng thái task:** [`agent/CURRENT_TASK.md`](./agent/CURRENT_TASK.md)

---

## 1. Tổng Quan Tiến Độ Sprint 4

* **Sprint Hiện Tại:** Sprint 4 — SQL Vertical Slice
* **Sprint Goal:** Phát triển môi trường thực hành SQL trực tiếp trên trình duyệt (In-Browser SQLite WASM), Schema Browser, SQL Code Editor và bộ kiểm tra kết quả truy vấn.
* **Step đã hoàn thành:** Step 1.1–4.0.
* **Step vừa hoàn thành:** Step 4.0 — Technical Spike & SQL Contracts (`DONE`).
* **Step kế tiếp đã lên kế hoạch:** Step 4.1A — WASM Packaging & Worker Transport; chưa kích hoạt.
* **Trạng thái Sprint:** `TECHNICAL GATE PASS — CHƯA IMPLEMENT PRODUCT FEATURE`.

---

## 2. Bảng Trạng Thái Sprint Hiện Tại (Sprint 4)

| Khu vực | Trọng tâm | Tính năng trong Sprint | Trạng thái |
|---|---|---|---|
| **Learner SQL (`LRN-SQL`)** | `Primary` | Technical spike, contracts và risk gates trước SQL Workspace | `DONE / Step 4.0` |
| **Learner Excel (`LRN-EXCEL`)** | `Supporting` | Excel Workspace Core & Stabilization Gate | `DONE / Step 3.6G` |
| **Submission (`LRN-SUB`)** | `Supporting` | Submission Contract & Feedback Core | `DONE / Step 3.4E` |
| **Shared (`SHR`)** | `Supporting` | Contract/gateway, Learner layout & Design System tokens | `DONE / Step 3.6` |
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
| `LRN-UI-3.6` | `LRN-EXCEL` | Light Mode Refinement | Standardized Light Mode design & accessibility | Sprint 3 | `DONE` | Pass | `src/styles/index.css`, `ActionToolbar.jsx`, `FormulaBar.jsx`, `SpreadsheetGrid.jsx`, `LearnerLayout.jsx` |
| `LRN-EXCEL-3.6G` | `LRN-EXCEL` | Sprint Stabilization | Formula/global diagnostics, stale hint, route boundary, responsive/a11y verification | Sprint 3 | `DONE` | Pass (133/133) | `excelChecker*`, `ExcelMissionPage*`, `LearnerLayout*`, `HintPanel*` |
| `LRN-SQL-4.0` | `LRN-SQL` | Technical Spike & Contracts | WASM/Worker/dialect/contracts/query-policy decision gate | Sprint 4 | `DONE` | Pass (11/11 SQL; 144/144 full) | `src/utils/sql/`, `src/workers/sql/`, `docs/agent/CURRENT_TASK.md` |

---

## 4. Step 3.6 Completion Summary

* **Đã hoàn thành:** Tinh chỉnh theme tokens light mode, trung tính hóa các nút phụ ActionToolbar, nâng cao độ tương phản FormulaBar, làm sạch header và ô bảng SpreadsheetGrid, cân bằng Streak promo card trong Sidebar.
* **Boundary:** Giữ nguyên Submission Contract, Evaluator logic, không trao XP hay kích hoạt logic game chưa tới lượt.
* **Audit validation:** targeted 73/73, full regression 20/20 files với 133/133 tests, production build và Browser verification pass.
* **Tooling note:** lint project-level chưa khả dụng vì repository chưa có `eslint.config.*`; global npm của máy xác minh thiếu `npm-cli.js`.

## 5. Sprint 4 Planning Summary

* **Current gate:** Step 4.0 `DONE`; có engine/Worker/seed/browser harness nhưng chưa có product UI/route SQL.
* **Execution order:** 4.0, 4.1A, 4.1B, 4.1C, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8.
* **Boundary:** `sql.js@1.14.2` SQLite in-memory trong Worker; không OPFS/backend/XP; Step 4.1A chưa kích hoạt.
* **Verified:** SQL unit 11/11, full regression 144/144, Vite dev/build/production preview Worker+WASM pass.
* **Remaining risks:** read-only policy cần hardening theo fixture matrix và canonical result equivalence vẫn thuộc Step 4.6.
