# Báo Cáo Kiểm Thử Tự Động (Test Report)

> **Cập nhật lần cuối:** 21/08/2026
> **Công cụ kiểm thử:** Vitest 2.1.9 + React Testing Library 16.0.0 + JSDOM
> **Tổng số Test Suites:** 19 files
> **Tổng số Test Cases:** 119 passed / 0 failed

---

## 1. Kết Quả Chạy Kiểm Thử Tự Động

| File Test | Số Test Cases | Kết quả |
|---|---:|---|
| `src/utils/excelChecker.test.js` | 26 | `PASS` |
| `src/services/mock/mockAuthService.test.js` | 5 | `PASS` |
| `src/services/mock/mockCourseService.test.js` | 5 | `PASS` |
| `src/services/mock/mockMissionService.test.js` | 6 | `PASS` |
| `src/services/mock/mockSubmissionService.test.js` | 11 | `PASS` |
| `src/app/providers/BrandProvider.test.jsx` | 2 | `PASS` |
| `src/components/ui/Skeleton.test.jsx` | 7 | `PASS` |
| `src/components/ui/EmptyState.test.jsx` | 5 | `PASS` |
| `src/components/excel/SpreadsheetGrid.test.jsx` | 4 | `PASS` |
| `src/components/excel/FormulaBar.test.jsx` | 6 | `PASS` |
| `src/components/excel/ActionToolbar.test.jsx` | 3 | `PASS` |
| `src/components/excel/HintPanel.test.jsx` | 3 | `PASS` |
| `src/components/excel/MissionResultModal.test.jsx` | 4 | `PASS` |
| `src/pages/learner/CoursesPage.test.jsx` | 5 | `PASS` |
| `src/pages/learner/CourseDetailPage.test.jsx` | 3 | `PASS` |
| `src/pages/learner/LearningMapPage.test.jsx` | 3 | `PASS` |
| `src/pages/learner/MissionIntroPage.test.jsx` | 2 | `PASS` |
| `src/pages/learner/ExcelMissionPage.test.jsx` | 13 | `PASS` |
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

---

## 3. Lệnh Chạy Kiểm Thử

Command chuẩn từ `package.json`:

```bash
npm test -- --run
```

Kết quả Step 3.4:

- Submission targeted suite: 5 files, 31/31 tests pass.
- Formula diagnostics targeted suite: 4 files, 55/55 tests pass.
- Full regression: 19 files, 119/119 tests pass.

Máy xác minh ngày 21/08/2026 có global npm bị thiếu `npm-cli.js`; suite đã được chạy bằng local executable mà không cài package:

```bash
node ./node_modules/vitest/vitest.mjs run
```

## 4. Warnings

- React Router v6 phát cảnh báo future flags cho v7.
- `PageStatus.test.jsx` phát một cảnh báo state update trong `AuthProvider` chưa được bọc `act(...)`.
- Hai cảnh báo trên không làm test fail và nằm ngoài phạm vi Step 3.4.
