# Current Task

## Identification

- Project: Avi-Mystery
- Sprint: 4
- Step: 4.1A
- Task ID: LRN-SQL-4.1A-WORKER-TRANSPORT
- Status: DONE
- Primary Module: LRN-SQL
- Supporting Modules:
  - SHR
- Module document: [modules/LRN-SQL.md](./modules/LRN-SQL.md)

## Goal

Productionize Worker transport layer cho SQL Engine: đảm bảo Request ID correlation, xử lý out-of-order responses, chặn stale responses sau timeout/reset, xử lý Worker crash/error, dispose sạch sẽ không treo promise/timer,lazy-loading cách ly khỏi Dashboard/Excel và cổng đóng `sql-spike.html` khỏi production mặc định.

## In Scope

- Transport resilience: Request ID + response correlation.
- Out-of-order responses & stale response rejection.
- Worker crash (`onerror`, `onmessageerror`, unexpected termination) error handling & recovery.
- `dispose()` sạch sẽ: reject pending promises lập tức, hủy all timers, terminate worker, ngăn memory leak.
- Singleton / Lazy Worker initialization (nhiều lần gọi `initialize()` dùng chung 1 Worker instance).
- Test harness gating: Đưa `sql-spike.html` trong `vite.config.js` về cờ `BUILD_SQL_SPIKE=true`.
- Mở rộng unit test `sqlEngineAdapter.test.js` bao phủ các kịch bản transport edge cases.

## Out of Scope

- Product UI/Route (Schema Browser, SQL Editor, Result Viewer thuộc Step 4.2+).
- SQL Result Checker và Submission Integration (Step 4.6 & 4.7).
- Backend DB, OPFS persistence, XP mutation, Admin builder.

## Allowed Write Paths

- `src/utils/sql/`
- `src/workers/sql/`
- `vite.config.js`
- `docs/agent/CURRENT_TASK.md`
- `docs/agent/modules/LRN-SQL.md`
- `docs/PROJECT_STATUS.md`
- `docs/ROADMAP.md`
- `docs/CHECKLIST.md`
- `docs/BACKLOG.md`
- `docs/TEST_REPORT.md`

## Read-only Paths

- `src/components/`
- `src/pages/`
- `src/services/`
- `src/app/`

## Forbidden Paths

- `src/pages/admin/`
- `src/services/api/`
- `.git/`

## Acceptance Criteria

- [x] Request ID & response correlation xử lý out-of-order responses chính xác không nhầm lẫn.
- [x] Stale responses xuất hiện muộn sau timeout hoặc reset bị bỏ qua hoàn toàn.
- [x] Worker error (`error`, `messageerror`) reject pending promises và không làm ứng dụng treo.
- [x] `dispose()` dọn dẹp Worker, reject pending requests với `ENGINE_NOT_READY`, xóa toàn bộ timers.
- [x] Multiple concurrent `initialize()` calls chỉ khởi tạo 1 Worker duy nhất.
- [x] Spike harness `sql-spike.html` trong `vite.config.js` được che chắn bởi cờ `BUILD_SQL_SPIKE`.
- [x] Lazy loading được đảm bảo: Dashboard và Excel hoàn toàn không nạp SQL Worker hay WASM.
- [x] SQL targeted unit tests (7/7) và full regression suite (148/148) pass 100%.

## Completion Evidence

- Adapter Transport: `SqlEngineAdapter` quản lý Map pending requests, cấp Request ID tăng dần, hủy `setTimeout` khi nhận phản hồi hoặc dispose.
- Out-of-order & Timeout Test: `sqlEngineAdapter.test.js` đã thử nghiệm delays out-of-order, concurrent `initialize()`, Worker error event, và `dispose()` ngắt promise ngay lập tức.
- Vite Config Gating: `vite.config.js` chuyển `sql-spike.html` vào cờ `process.env.BUILD_SQL_SPIKE === 'true'`, bảo vệ production entry points.
- Test suite results: 7/7 SQL engine adapter tests pass; 148/148 full regression tests pass.

## Test Commands

```bash
node ./node_modules/vitest/vitest.mjs run src/utils/sql/
node ./node_modules/vitest/vitest.mjs run
```
