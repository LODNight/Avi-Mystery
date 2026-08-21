# Test Strategy

## Verified Tooling and Commands

Stack test đã xác minh: Vitest `^2.1.1` được khai báo và local install là 2.1.9, React Testing Library 16, JSDOM. Hai config test cùng tồn tại (`vite.config.js` dùng `src/test/setup.js`; `vitest.config.js` dùng `src/tests/setup.js`) và cần được giữ nguyên trong task hiện tại.

```bash
# Watch mode theo script thật
npm test

# Toàn bộ suite, non-watch
npm test -- --run

# Step 3.4 scope
npm test -- --run src/services/mock/mockSubmissionService.test.js src/pages/learner/ExcelMissionPage.test.jsx src/components/excel/ActionToolbar.test.jsx src/components/excel/FormulaBar.test.jsx src/components/excel/MissionResultModal.test.jsx
```

Fallback chỉ dùng khi npm của máy bị hỏng nhưng local dependencies đã tồn tại: `node ./node_modules/vitest/vitest.mjs run`. Không cài lại package trong task chỉ để né lỗi npm toàn cục.

Không ghi pass nếu command chưa thực sự chạy trong lần làm việc đó.

## Test Pyramid

1. **Unit:** evaluator, contract normalization/error mapping, submission adapter, Progress rules khi module tồn tại.
2. **Component:** FormulaBar, toolbar disabled state, inline feedback, modal accessibility.
3. **Integration:** Excel workspace → service gateway → mock submission → UI result; giữ số lượng nhỏ và cover boundary quan trọng.
4. **E2E:** chưa có framework trong repository; TBD cho Sprint 7/8, không tự thêm package.

## Module Coverage

- `LRN-EXCEL`: formula normalization/evaluation, grid/edit state, reset, hints, run không complete.
- `LRN-SUB`: request validation, mode, result/error mapping, attempt state, double submit và retry.
- `LRN-SQL`: engine/worker timeout, row limit, reset, query error/result comparison khi được triển khai.
- `GAME`: idempotent reward, level boundary, unlock/streak khi được triển khai.
- `ADM`: validation/preview không ghi learner progress khi được triển khai.
- `BE`/`ANL`: contract/integration/security/metrics tests khi có source; hiện TBD.
- `SHR`: contract compatibility, UI primitives và utilities không phụ thuộc feature.

## Submission Integration Minimum

- Success: submit đúng hiển thị completion success và `potentialXp`, không mutate XP.
- Incorrect answer: inline feedback; giữ nguyên answer; không failure modal mặc định.
- Validation error: feedback gần input, không gọi/hoặc không hoàn thành service flow.
- Service error: message riêng và thao tác retry dùng lại answer.
- Retry: request mới có attempt identity hợp lệ; không duplicate side effect.
- Timeout: test chỉ khi adapter hỗ trợ; nếu chưa hỗ trợ ghi skip/TBD, không giả pass.
- Double submit: nút disabled và handler/service guard chỉ tạo một request.
- Unmount in flight: không state update sau unmount và không warning.
- `run`: không complete mission và không tạo XP.

## Fixtures and Determinism

- Test evaluator với fixture nhỏ, cố định; không phụ thuộc thứ tự test hoặc dữ liệu `localStorage` còn lại.
- Reset storage/mocks/timers trong setup của suite cần dùng chúng.
- Dùng fake timers hoặc injected delay cho timeout/retry; tránh sleep thực không xác định.
- ID/thời gian phải inject/fake hoặc chỉ assert shape, không snapshot `Date.now()`.
- Component test mock service boundary/gateway, không nhúng expected answer vào component fixture.

## Regression Checklist

- Auth/RBAC và learner/admin route guards.
- Course list/detail, learning map và mission intro.
- Excel grid, formula bar, run/reset/hints.
- Loading, empty/error states và accessibility hiện có.
- Full command `npm test -- --run` pass hoặc mọi failure được báo rõ là ngoài scope.

## Last Verified — Step 3.4

- Submission targeted command: 5 test files, 31/31 tests passed.
- Formula diagnostics follow-up: 4 test files, 55/55 tests passed.
- Full regression: 19 test files, 118/118 tests passed.
- Covered: structured errors, retry, timeout, duplicate/replay identity, double submit, unmount in flight, answer retention, success-only modal và no-XP-mutation.
- Non-failing warnings: React Router v7 future flags và `AuthProvider` act warning trong `PageStatus.test.jsx`.
