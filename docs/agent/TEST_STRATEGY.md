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

## Sprint 4 SQL Test Strategy

1. **Pure unit:** query policy, result normalization/comparison, dataset validation và stable error mapping không cần WASM.
2. **Adapter unit:** inject fake Worker/engine để test request correlation, timeout, cancel, reset, dispose và stale response.
3. **Component:** Schema Browser, Editor, Result Viewer và feedback dùng fake adapter; không buộc JSDOM tải WASM.
4. **Browser integration:** WASM init, real Worker, seed/schema/execute/reset/dispose, hard timeout recovery và mission change.
5. **Production gate:** built asset URL/MIME, lazy loading, console/network error và deployment preview.
6. **Regression:** full Sprint 1–3 suite sau mỗi Step có route/gateway/shared-contract change.

Minimum SQL fixture matrix: `SELECT`, `WITH`, syntax/runtime error, mutation/DDL/PRAGMA/ATTACH, comments và multiple statements, timeout, result limit, `NULL`, duplicate rows, order true/false, column order, numeric tolerance, reset và Worker cleanup.

Step 4.0 không được ghi pass chỉ bằng fake adapter; phải có ít nhất một Browser smoke test với WASM/Worker thật. Ngược lại, unit/component suite không phụ thuộc network hoặc browser WASM asset.

## Last Verified — Step 3.6G (22/08/2026)

- Submission targeted command: 5 test files, 31/31 tests passed.
- Formula diagnostics follow-up: 4 test files, 55/55 tests passed.
- Step 3.6G targeted: 8 test files, 73/73 tests passed.
- Full regression: 20 test files, 133/133 tests passed.
- Production build: 1621 modules transformed, build pass bằng local Vite executable.
- Browser verification: 390/768/1440px, Light/Dark, dấu `=`, mobile CTA, hint focus/Escape/restore focus; không có console error.
- Covered: structured errors, retry, timeout, duplicate/replay identity, double submit, unmount in flight, answer retention, success-only modal và no-XP-mutation.
- Non-failing warnings: React Router v7 future flags và `AuthProvider` act warning trong `PageStatus.test.jsx`.
- Giới hạn: chưa có framework visual regression/E2E. Global npm thiếu `npm-cli.js`; ESLint 9 chưa có `eslint.config.*`, nên lint project-level chưa khả dụng và phải được xử lý bằng task tooling riêng.

## Last Verified — Step 4.0 (22/08/2026)

- SQL pure/adapter unit: 3 files, 11/11 tests passed; fake Worker cover lifecycle, stable not-ready error và timeout recovery.
- Full regression: 23 files, 144/144 tests passed; warning cũ gồm React Router v7 future flags và `AuthProvider` act warning.
- Real browser Vite dev: WASM/Worker initialize, seed, schema, execute, syntax error, row limit, reset và dispose pass.
- Production build/preview: pass; phát sinh module Worker riêng và `sql-wasm-browser` asset 658.41 kB, preview lifecycle pass.
- Browser harness nằm tại `src/utils/sql/sql-spike.html`, không có product route/navigation và sẽ bỏ extra build entry khi SQL Workspace import adapter ở Step sau.
- ESLint project-level chưa khả dụng vì thiếu `eslint.config.*`; không mở rộng tooling ngoài Step 4.0.
