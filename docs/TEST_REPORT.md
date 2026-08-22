# Báo Cáo Kiểm Thử Tự Động (Test Report)

> **Cập nhật lần cuối:** 22/08/2026
> **Công cụ kiểm thử:** Vitest 2.1.9 + React Testing Library 16.0.0 + JSDOM
> **Tổng số Test Suites:** 23 files
> **Tổng số Test Cases:** 144 passed / 0 failed

> **Sprint 4 note:** Step 4.0 đã `DONE`; SQL unit/fake Worker và real browser Worker/WASM đều đã được xác minh. Product SQL UI/route chưa được triển khai.

---

## 1. Kết Quả Chạy Kiểm Thử Tự Động

| File Test | Số Test Cases | Kết quả |
|---|---:|---|
| `src/utils/excelChecker.test.js` | 32 | `PASS` |
| `src/utils/sql/sqlQueryPolicy.test.js` | 5 | `PASS` |
| `src/utils/sql/sqlDataset.test.js` | 3 | `PASS` |
| `src/utils/sql/sqlEngineAdapter.test.js` | 3 | `PASS` |
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

- Service mocks: auth, course, mission và submission contract/error/idempotency behavior.
- Shared UI/providers: skeleton, empty/error state, brand và page status.
- Learner flow: courses, course detail, learning map, mission intro và Excel workspace.
- Excel: evaluator, spreadsheet grid, Formula Bar, toolbar, hints và result modal.
- Step 3.4 đã cover service error/retry, timeout, duplicate/replay attempt, double submit, unmount in-flight, gateway boundary, answer retention, modal accessibility và xác nhận không mutate XP.
- Formula diagnostics cover biểu thức rỗng `=`, thiếu dấu `=`, ngoặc, hàm/range, ký tự/toán tử, tham chiếu, dữ liệu không phải số, chia cho 0 và đồng bộ nhập/Run/Submit.
- UI/UX Refinement: Chạy thử trigger inline error, chuẩn hóa A,B,C... headers, căn phải cột số/tiền tệ, CTA hierarchy.
- Step 3.6G cover Global Mission Validator, dấu `=`, required-range syntax, stale hint khi Reset/mission change, Hint drawer focus/Escape/restore focus và Learner Sidebar route boundary.
- Browser verification bổ sung viewport 390/768/1440px, Light/Dark và console error check; repository vẫn chưa có framework visual regression/E2E.
- Step 4.0 cover query policy/syntax `=`, dataset validation, fake Worker lifecycle/timeout recovery và browser thật cho WASM init/seed/schema/execute/row limit/reset/dispose.

---

## 3. Lệnh Chạy Kiểm Thử

Command chuẩn từ `package.json`:

```bash
npm test -- --run
```

Kết quả Step 3.6G:

- Submission targeted suite: 5 files, 31/31 tests pass.
- Formula diagnostics targeted suite: 4 files, 55/55 tests pass.
- Stabilization targeted suite: 8 files, 73/73 tests pass.
- Full regression: 20 files, 133/133 tests pass.
- Production build bằng local Vite: pass, 1621 modules transformed.

Kết quả Step 4.0:

- SQL targeted: 3 files, 11/11 tests pass.
- Full regression: 23 files, 144/144 tests pass.
- Production build: pass, 1628 modules transformed; Worker 48.28 kB và WASM 658.41 kB được phát sinh riêng.
- Browser Vite dev và production preview: lifecycle thật pass; input `=` trả `SQL_SYNTAX_ERROR`, result limit trả `truncated: true`, reset phục hồi seed.

Máy xác minh ngày 21/08/2026 có global npm bị thiếu `npm-cli.js`; suite đã được chạy bằng local executable mà không cài package:

```bash
node ./node_modules/vitest/vitest.mjs run
```

## 4. Warnings

- React Router v6 phát cảnh báo future flags cho v7.
- `PageStatus.test.jsx` phát một cảnh báo state update trong `AuthProvider` chưa được bọc `act(...)`.
- Hai cảnh báo trên không làm test fail và là technical debt ngoài phạm vi stabilization.
- Global npm thiếu `npm-cli.js`; ESLint 9 không tìm thấy `eslint.config.*`, vì vậy lint project-level chưa khả dụng. Không cài package hoặc tự mở rộng config trong Step 3.6G.
