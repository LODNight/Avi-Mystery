# Current Task

## Identification

- Project: Avi-Mystery
- Sprint: 4
- Step: 4.0
- Task ID: LRN-SQL-4.0-TECHNICAL-SPIKE
- Status: DONE
- Primary Module: LRN-SQL
- Supporting Modules:
  - SHR
- Module document: [modules/LRN-SQL.md](./modules/LRN-SQL.md)

## Goal

Thực hiện Technical Spike bắt buộc trước implementation Sprint 4: chốt SQLite WASM library, cách Vite đóng gói WASM/Worker, dialect, SQL mission/dataset/execution/checker contracts, query policy và chiến lược timeout/reset/dispose.

Step này chỉ tạo decision, contract proposal, fixture/spike tối thiểu và bằng chứng build/browser. Không xây SQL Workspace, Schema Browser, Editor, Result Viewer hoặc Submission flow.

## In Scope

- So sánh `sql.js` và `@sqlite.org/sqlite-wasm` theo license, API, Worker, Vite và deployment.
- Chốt SQLite dialect, in-memory lifecycle và không dùng OPFS trong MVP trừ khi spike chứng minh cần thiết.
- Chốt interface engine: `initialize`, `loadDataset`, `getSchema`, `execute`, `reset`, `dispose`.
- Chốt SQL Mission/Dataset contract, execution result/error codes và result checker config.
- Chốt query policy: single statement, read-only, timeout/cancel, max rows và worker recovery.
- Tạo spike/fixture nhỏ để xác minh WASM init, Worker message, seed/reset và production build nếu cần.
- Ghi decision và cập nhật toàn bộ tài liệu Sprint 4 theo Step 4.0–4.8.

## Out of Scope

- Product route và SQL Mission Workspace.
- Schema Browser, SQL Editor, Result Viewer và learner-facing UI.
- SQL Result Checker hoặc Submission implementation.
- Backend API, OPFS persistence, XP/Streak, Python sandbox và Admin Content Builder.
- Autocomplete theo schema, format query, CSV export hoặc advanced editor features.

## Allowed Write Paths

- `src/utils/sql/`
- `src/workers/sql/`
- `src/mocks/data/sql/`
- `package.json`
- `package-lock.json`
- `vite.config.js`
- `docs/agent/CURRENT_TASK.md`
- `docs/agent/modules/LRN-SQL.md`
- `docs/agent/CONTRACTS.md`
- `docs/agent/DECISIONS.md`
- `docs/agent/MODULE_MAP.md`
- `docs/agent/PROJECT_CONTEXT.md`
- `docs/agent/TEST_STRATEGY.md`
- `docs/agent/UI_CHANGE_INVENTORY.md`
- `docs/PROJECT_STATUS.md`
- `docs/ROADMAP.md`
- `docs/CHECKLIST.md`
- `docs/BACKLOG.md`
- `docs/TEST_REPORT.md`
- `docs/DOUBLE_CHECK_REPORT.md`
- `docs/avi-mystery-roadmap-review-sprint-3-8.md`
- `README.md`

## Read-only Paths

- `src/components/sql/`
- `src/pages/learner/SqlMissionPage.jsx`
- `src/services/mock/`
- `src/services/index.js`
- `src/components/excel/`
- `src/utils/excelChecker.js`
- `src/services/contracts/`
- `src/app/router/`
- `src/app/layouts/`
- `src/components/ui/`

## Forbidden Paths

- `src/pages/admin/`
- `src/services/api/`
- `src/pages/learner/` ngoài path spike được khai báo
- `src/components/` ngoài path spike được khai báo
- `.git/`

## Acceptance Criteria

- [x] Có decision record cho engine library, version, license và lý do chọn.
- [x] WASM/Worker spike chạy được ở Vite dev và production build mà không block main thread.
- [x] SQL Mission, Dataset, Execution Result, stable errors và Checker config được chốt ở mức proposal.
- [x] Query policy, timeout/cancel, row limit, reset/dispose và recovery strategy được chốt.
- [x] Một seed nhỏ chứng minh initialize/load/schema/execute/reset/dispose khả thi.
- [x] Test strategy tách unit fake adapter khỏi browser WASM integration.
- [x] Không tạo product UI, route, Submission implementation hoặc thay đổi Excel behavior.
- [x] Full regression Sprint 1–3 và production build vẫn pass.

## Completion Evidence

- Engine: `sql.js@1.14.2`, MIT, SQLite WASM in-memory trong dedicated module Worker.
- Worker transport: request ID + action/payload; response success/error có correlation ổn định.
- Policy: một `SELECT`/`WITH`, read-only, mặc định timeout 2000ms, mặc định 500 rows và hard cap 5000 rows.
- Recovery: hard timeout terminate Worker, tạo Worker mới, khởi tạo WASM và nạp lại deterministic seed.
- Browser harness cô lập: `src/utils/sql/sql-spike.html`; không có product route hoặc navigation.
- SQL unit: 3 files, 11/11 tests pass; full regression: 23 files, 144/144 tests pass.
- Vite dev và production preview đều pass real Worker/WASM lifecycle; production build phát sinh Worker + WASM asset riêng.
- Lint chưa chạy được vì repository chưa có `eslint.config.*`; đây là tooling debt đã tồn tại, không phải regression của Step 4.0.

## Test Commands

```bash
node ./node_modules/vitest/vitest.mjs run src/utils/sql/
node ./node_modules/vitest/vitest.mjs run
node ./node_modules/vite/bin/vite.js build
```
