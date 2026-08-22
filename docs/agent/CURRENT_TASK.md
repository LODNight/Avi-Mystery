# Current Task

## Identification

- Project: Avi-Mystery
- Sprint: 4
- Step: 4.1B
- Task ID: LRN-SQL-4.1B-DB-LIFECYCLE
- Status: IN_PROGRESS
- Primary Module: LRN-SQL
- Supporting Modules:
  - SHR
- Module document: [modules/LRN-SQL.md](./modules/LRN-SQL.md)

## Goal

Hoàn thiện và kiểm tra toàn bộ Database Lifecycle API của SQL Engine: seed xác định, reset sạch về trạng thái ban đầu, Schema API trả về cấu trúc bảng kèm sample rows, và dispose chain dọn dẹp sạch. Đây là foundation cứng để Schema Browser (Step 4.2) có thể render thông tin bảng và cột mà không cần thêm contract mới.

## In Scope

1. **Schema API mở rộng với sample rows** — `getSchema()` trả thêm field `sampleRows: Array<Array<unknown>>` (tối đa 3 hàng đầu) để Schema Browser hiển thị preview dữ liệu mà không cần execute câu lệnh riêng.
2. **Database Lifecycle Test Suite** — Tạo `sqlDatabaseLifecycle.test.js` (adapter unit test, FakeSqlWorker) bao phủ:
   - Seed → getSchema (có sampleRows) → execute truy vấn → reset → schema sau reset không thay đổi → dispose.
   - Reset khi chưa có dataset phải throw `ENGINE_NOT_READY`.
   - Double-dispose phải trả về `{ disposed: true }` và không throw.
   - Schema sau reset phải giống schema sau seed ban đầu (determinism).
3. **`sqlDataset.test.js` bổ sung** — Thêm test case: duplicate table name, duplicate column name, column type không hợp lệ.
4. **Cập nhật Worker response contract** — Thêm `sampleRows` vào response của `getSchema` trong Worker (`sqlEngine.worker.js`).

## Out of Scope

- Product UI/Route (Schema Browser, SQL Editor, Result Viewer thuộc Step 4.2+).
- SQL Result Checker và Submission Integration (Step 4.6 & 4.7).
- Backend DB, OPFS persistence, XP mutation, Admin builder.
- Read-only Query Policy hardening (Step 4.1C).

## Allowed Write Paths

- `src/utils/sql/`
- `src/workers/sql/`
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

- [ ] `getSchema()` response có field `sampleRows` (mảng tối đa 3 hàng) cho mỗi bảng.
- [ ] Seed → reset → schema sau reset giống hệt schema sau seed (determinism).
- [ ] Reset khi chưa có dataset throw `ENGINE_NOT_READY`.
- [ ] Double-dispose trả `{ disposed: true }` không throw.
- [ ] `sqlDatabaseLifecycle.test.js` bao phủ lifecycle end-to-end.
- [ ] Dataset validation: duplicate table/column, column type không hợp lệ bị chặn.
- [ ] Full regression suite pass 100% (mọi test hiện tại vẫn xanh).

## Test Commands

```bash
node ./node_modules/vitest/vitest.mjs run src/utils/sql/
node ./node_modules/vitest/vitest.mjs run
```
