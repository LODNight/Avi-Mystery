# Trạng Thái Dự Án Avi-Mystery

> **Cập nhật lần cuối:** 24/08/2026
> **Nguồn trạng thái task:** [`agent/CURRENT_TASK.md`](./agent/CURRENT_TASK.md)

---

## 1. Tổng Quan Tiến Độ Sprint 4

* **Sprint Hiện Tại:** Sprint 4 — SQL Vertical Slice
* **Sprint Goal:** Phát triển môi trường thực hành SQL trực tiếp trên trình duyệt (In-Browser SQLite WASM), Schema Browser, SQL Code Editor và bộ kiểm tra kết quả truy vấn.
* **Step đã hoàn thành:** Step 1.1–4.7.
* **Step hiện tại:** Step 4.8 — Security, Browser, Deployment & Regression Gate (`IN_PROGRESS`).
* **Step kế tiếp:** Sprint 5 — Game Progress System (`PLANNED`).
* **Trạng thái Sprint:** `RÀ SOÁT BẢO MẬT, THEME/RESPONSIVE, WASM PRODUCTION BUILD & REGRESSION GATE SPRINT 4`.

---

## 2. Bảng Trạng Thái Sprint Hiện Tại (Sprint 4)

| Khu vực | Trọng tâm | Tính năng trong Sprint | Trạng thái |
|---|---|---|---|
| **Learner SQL (`LRN-SQL`)** | `Primary` | Security policy, Worker lifecycle cleanup, Responsive/Theme Polish, Production WASM & Regression Gate | `IN_PROGRESS / Step 4.8` |
| **Learner Excel (`LRN-EXCEL`)** | `Supporting` | Excel Workspace Core & Stabilization Gate | `DONE / Step 3.6G` |
| **Submission (`LRN-SUB`)** | `Supporting` | Submission Contract & SQL Tool Extension | `DONE / Step 4.7` |
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
| `LRN-EXCEL-001` | `LRN` | Excel | Giao diện Bảng tính & Thanh nhập liệu FormulaBar (`SpreadsheetGrid`, `FormulaBar`) | Sprint 3 | `DONE` | Pass | `src/components/excel/` |
| `LRN-EXCEL-002` | `LRN` | Excel | Trang Nhiệm vụ Excel (`ExcelMissionPage`) & Điều phối gợi ý (`HintPanel`) | Sprint 3 | `DONE` | Pass | `src/pages/learner/ExcelMissionPage.jsx` |
| `LRN-SUB-3.4` | `LRN` | Submission | Integration của Excel Mission với Submission Gateway (`mockSubmissionService`) | Sprint 3 | `DONE` | Pass | `src/services/mock/mockSubmissionService.js` |
| `LRN-UI-3.6` | `LRN` | Excel | Light Mode Refinement, Contrast & Accessibility Gate | Sprint 3 | `DONE` | Pass | `src/components/excel/` |
| `LRN-SQL-4.0` | `LRN` | SQL | Technical Spike & SQL Contracts (SQLite WASM, Worker, Policy, Error Envelope) | Sprint 4 | `DONE` | Pass | `src/utils/sql/`, `src/workers/sql/` |
| `LRN-SQL-4.1A` | `LRN` | SQL | WASM Packaging & Worker Transport (Request ID correlation, stale response filter, lazy-load & test harness gating) | Sprint 4 | `DONE` | Pass | `src/utils/sql/sqlEngineAdapter.js`, `vite.config.js` |
| `LRN-SQL-4.1B` | `LRN` | SQL | Database Lifecycle, Seed, Reset & Schema API (`getSchema` + `sampleRows`, deterministic reset, lifecycle/validation tests) | Sprint 4 | `DONE` | Pass | `src/utils/sql/sqlDatabaseLifecycle.test.js`, `src/workers/sql/sqlEngine.worker.js` |
| `LRN-SQL-4.1C` | `LRN` | SQL | Read-only Query Policy, Timeout & Row Limit (10 DDL/mutation keywords guard, worker recovery on timeout, maxRows truncation) | Sprint 4 | `DONE` | Pass | `src/utils/sql/sqlQueryPolicy.js`, `src/utils/sql/sqlEngineAdapter.js` |
| `LRN-SQL-4.2` | `LRN` | SQL | Schema Browser Component (Table/column metadata, type badge, primary key indicator, copy identifier, sample rows preview) | Sprint 4 | `DONE` | Pass | `src/components/sql/SchemaBrowser.jsx`, `src/components/sql/SchemaBrowser.test.jsx` |
| `LRN-SQL-4.3` | `LRN` | SQL | SQL Mission Shell, Loader & Isolated Route (`/missions/:missionId/sql`, dataset isolation, lifecycle cleanup) | Sprint 4 | `DONE` | Pass | `src/pages/learner/SqlMissionPage.jsx`, `src/services/mock/mockSqlMissionService.js` |
| `LRN-SQL-4.4` | `LRN` | SQL | Controlled SQL Code Editor MVP Component (`SqlEditor.jsx`, starter query, Reset/Run, Tab soft 2-spaces, Ctrl+Enter) | Sprint 4 | `DONE` | Pass | `src/components/sql/SqlEditor.jsx`, `src/components/sql/SqlEditor.test.jsx` |
