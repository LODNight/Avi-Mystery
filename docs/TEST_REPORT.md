# Báo Cáo Kiểm Thử Tự Động (Test Report)

> **Cập nhật lần cuối:** 24/08/2026
> **Công cụ kiểm thử:** Vitest 2.1.9 + React Testing Library 16.0.0 + JSDOM
> **Tổng số Test Suites:** 28 files
> **Tổng số Test Cases:** 178 passed / 0 failed

> **Sprint 4 note:** Step 4.0, 4.1A, 4.1B, 4.1C, 4.2, 4.3 và 4.4 đã `DONE`. Đã xác minh SQLite WASM Worker, Schema Browser, SQL Mission Shell loader/route (`/missions/:missionId/sql`), và SQL Editor MVP (`SqlEditor.jsx`).

---

## 1. Kết Quả Chạy Kiểm Thử Tự Động

| File Test | Số Test Cases | Kết quả |
|---|---:|---|
| `src/utils/excelChecker.test.js` | 32 | `PASS` |
| `src/utils/sql/sqlQueryPolicy.test.js` | 28 | `PASS` |
| `src/utils/sql/sqlDatabaseLifecycle.test.js` | 7 | `PASS` |
| `src/utils/sql/sqlDataset.test.js` | 8 | `PASS` |
| `src/utils/sql/sqlEngineAdapter.test.js` | 3 | `PASS` |
| `src/components/sql/SchemaBrowser.test.jsx` | 6 | `PASS` |
| `src/components/sql/SqlEditor.test.jsx` | 5 | `PASS` |
| `src/pages/learner/SqlMissionPage.test.jsx` | 4 | `PASS` |
| `src/services/mock/mockSqlMissionService.test.js` | 4 | `PASS` |
| `src/services/mock/mockAuthService.test.js` | 5 | `PASS` |
| `src/services/mock/mockCourseService.test.js` | 5 | `PASS` |
| `src/services/mock/mockMissionService.test.js` | 6 | `PASS` |
| `src/services/mock/mockSubmissionService.test.js` | 11 | `PASS` |
| `src/app/providers/BrandProvider.test.jsx` | 2 | `PASS` |
| `src/components/ui/Skeleton.test.jsx` | 7 | `PASS` |
| `src/components/ui/EmptyState.test.jsx` | 5 | `PASS` |
| `src/components/excel/SpreadsheetGrid.test.jsx` | 4 | `PASS` |
| `src/components/excel/FormulaBar.test.jsx` | 7 | `PASS` |
| `src/components/excel/ActionToolbar.test.jsx` | 4 | `PASS` |
| `src/components/excel/HintPanel.test.jsx` | 3 | `PASS` |
| `src/components/excel/MissionResultModal.test.jsx` | 4 | `PASS` |
| `src/pages/learner/CoursesPage.test.jsx` | 5 | `PASS` |
| `src/pages/learner/CourseDetailPage.test.jsx` | 3 | `PASS` |
| `src/pages/learner/LearningMapPage.test.jsx` | 3 | `PASS` |
| `src/pages/learner/MissionIntroPage.test.jsx` | 2 | `PASS` |
| `src/pages/learner/ExcelMissionPage.test.jsx` | 16 | `PASS` |
| `src/app/layouts/LearnerLayout.test.jsx` | 3 | `PASS` |
| `src/tests/PageStatus.test.jsx` | 6 | `PASS` |


---

## 2. Coverage Summary

- Service mocks: auth, course, mission, sqlMission và submission contract/error/idempotency behavior.
- Shared UI/providers: skeleton, empty/error state, brand và page status.
- Learner flow: courses, course detail, learning map, mission intro, Excel workspace và SQL workspace.
- Excel: evaluator, spreadsheet grid, Formula Bar, toolbar, hints và result modal.
- Step 3.4 đã cover service error/retry, timeout, duplicate/replay attempt, double submit, unmount in-flight, gateway boundary, answer retention, modal accessibility và xác nhận không mutate XP.
- Step 3.6G cover Global Mission Validator, dấu `=`, required-range syntax, stale hint khi Reset/mission change, Hint drawer focus/Escape/restore focus và Learner Sidebar route boundary.
- Step 4.0-4.1C cover SQL query policy (10 keyword guards), dataset validation, SQLite WASM lazy-load packaging, Worker lifecycle, deterministic seed/reset, timeout recovery và maxRows truncation.
- Step 4.2 cover Schema Browser (table/column/type/PK/nullable metadata, search, 3 sample rows preview, copy identifier).
- Step 4.3 cover SQL Mission Shell (`SqlMissionPage`), `/missions/:missionId/sql` isolated route, mock SqlMissionService, lifecycle disposal on unmount và navigation auto-routing từ LearningMapPage.
- Step 4.4 cover SQL Editor MVP (`SqlEditor.jsx`), starter SQL initialization, Reset/Run actions, soft-tab 2-spaces indentation, `Ctrl+Enter` shortcut, ARIA accessibility & Detective Amber theme styling.

---

## 3. Lệnh Chạy Kiểm Thử

Command chuẩn từ `package.json`:

```bash
npm test -- --run
```

Kết quả Step 4.4:

- SQL targeted suite: 8 files, 60/60 tests pass.
- Full regression: 28 files, 178/178 tests pass.
- Production build bằng local Vite: pass, 1630 modules transformed.

Máy xác minh chạy bằng local executable mà không cài package:

```bash
node ./node_modules/vitest/vitest.mjs run
```

## 4. Warnings

- React Router v6 phát cảnh báo future flags cho v7.
- `PageStatus.test.jsx` phát một cảnh báo state update trong `AuthProvider` chưa được bọc `act(...)`.
- Hai cảnh báo trên không làm test fail và là technical debt ngoài phạm vi stabilization.

