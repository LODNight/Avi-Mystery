# Current Task

## Identification

- Project: Avi-Mystery
- Sprint: 4
- Step: 4.1C
- Task ID: LRN-SQL-4.1C-QUERY-POLICY
- Status: IN_PROGRESS
- Primary Module: LRN-SQL
- Supporting Modules:
  - SHR
- Module document: [modules/LRN-SQL.md](./modules/LRN-SQL.md)

## Goal

Hoàn thiện và kiểm định toàn bộ cơ chế bảo vệ truy vấn chỉ đọc (Read-only Policy), kiểm soát thời gian chờ (Timeout & Recovery) và giới hạn số dòng kết quả trả về (Row Limit / Truncation) của SQL Engine Web Worker.

## In Scope

1. **Chặn truy vấn thay đổi (Read-only Policy)** — Chỉ hỗ trợ đúng 1 câu lệnh `SELECT` hoặc `WITH`. Chặn tuyệt đối `INSERT`, `UPDATE`, `DELETE`, `DROP`, `CREATE`, `ALTER`, `ATTACH`, `PRAGMA`, `VACUUM`...
2. **Quản lý thời gian chờ (Timeout & Worker Recovery)** — Xử lý khi câu lệnh SQL thực thi vượt quá `queryTimeoutMs` bằng cách `terminate()` worker, tự động khởi tạo lại và khôi phục dataset hiện tại (`recoverWorker()`), trả về lỗi envelope `TIMEOUT` ổn định.
3. **Giới hạn số dòng kết quả (Row Truncation)** — Giới hạn số dòng kết quả ở mức `maxRows` (mặc định 500), đánh dấu `truncated: true` và đặt `errorCode` phù hợp.
4. **Test Suite bao phủ** — Mở rộng unit tests cho `sqlQueryPolicy.test.js` và `sqlEngineAdapter.test.js` đảm bảo 100% test cases pass.

## Out of Scope

- Product UI/Route (Schema Browser, SQL Editor, Result Viewer thuộc Step 4.2+).
- SQL Result Checker và Submission Integration (Step 4.6 & 4.7).
- Backend DB, OPFS persistence, XP mutation, Admin builder.

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

- [ ] Chỉ 1 câu lệnh `SELECT`/`WITH` duy nhất được chấp nhận; các câu lệnh mutation, DDL, PRAGMA bị chặn và trả `READ_ONLY_VIOLATION`.
- [ ] Truy vấn chạy vượt quá timeout sẽ tự động ngắt worker, khôi phục trạng thái database và trả mã lỗi `TIMEOUT`.
- [ ] Kết quả truy vấn vượt quá `maxRows` được ngắt đúng điểm, trả `truncated: true` và mã lỗi `RESULT_LIMIT_EXCEEDED`.
- [ ] Cụm test SQL targeted (`src/utils/sql/`) pass 100%.
- [ ] Toàn bộ regression suite dự án pass 100%.

## Test Commands

```bash
node ./node_modules/vitest/vitest.mjs run src/utils/sql/
node ./node_modules/vitest/vitest.mjs run
```
