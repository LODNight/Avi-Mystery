# Current Task

## Identification

- Project: Avi-Mystery
- Sprint: 4
- Step: 4.2
- Task ID: LRN-SQL-4.2-SCHEMA-BROWSER
- Status: IN_PROGRESS
- Primary Module: LRN-SQL
- Supporting Modules:
  - SHR
- Module document: [modules/LRN-SQL.md](./modules/LRN-SQL.md)

## Goal

Phát triển component Schema Browser (`src/components/sql/SchemaBrowser.jsx`) cho phép người học trực quan hóa cấu trúc bảng, danh sách cột, kiểu dữ liệu, khóa chính, tính nullable và xem trước các hàng mẫu (sample rows) trong môi trường giải quyết vụ án SQL.

## In Scope

1. **Giao diện Schema Browser (`SchemaBrowser.jsx`)**:
   - Tự động hiển thị danh sách bảng thu nạp từ `sqlEngine.getSchema()`.
   - Ẩn các bảng hệ thống SQLite (bắt đầu bằng `sqlite_`).
   - Tìm kiếm nhanh bảng và cột theo từ khóa (Search filter).
   - Mở rộng/thu gọn (Expand/Collapse) bảng để xem chi tiết cột.
   - Thẻ hiển thị kiểu dữ liệu (`TEXT`, `INTEGER`, `REAL`...), Biểu tượng Khóa chính (`PK`), và cờ `NULL` / `NOT NULL`.
   - Xem trước 3 hàng dữ liệu mẫu (`sampleRows`) của từng bảng.
   - Nút Copy tên bảng / tên cột nhanh vào bộ nhớ tạm (Clipboard feedback `Copied!`).
2. **Bộ Test Suite (`SchemaBrowser.test.jsx`)**:
   - Test render danh sách bảng/cột từ schema prop.
   - Test lọc từ khóa tìm kiếm.
   - Test expand/collapse và copy identifier.
   - Test xử lý trạng thái Loading / Empty / Error.

## Out of Scope

- SQL Code Editor & Result Execution Viewer (Step 4.4 & 4.5).
- Route/Page Integration (Step 4.3).

## Allowed Write Paths

- `src/components/sql/`
- `docs/agent/CURRENT_TASK.md`
- `docs/agent/modules/LRN-SQL.md`
- `docs/PROJECT_STATUS.md`
- `docs/ROADMAP.md`
- `docs/CHECKLIST.md`
- `docs/BACKLOG.md`
- `docs/TEST_REPORT.md`

## Read-only Paths

- `src/components/ui/`
- `src/pages/`
- `src/services/`
- `src/utils/sql/`

## Forbidden Paths

- `src/pages/admin/`
- `src/services/api/`
- `.git/`

## Acceptance Criteria

- [ ] Hiển thị đầy đủ bảng, cột, kiểu dữ liệu, khóa chính (`PK`) và nullable.
- [ ] Tự động ẩn các bảng nội bộ của SQLite (`sqlite_%`).
- [ ] Có ô tìm kiếm bảng/cột phản hồi tức thì.
- [ ] Hỗ trợ xem trước tối đa 3 hàng mẫu cho mỗi bảng.
- [ ] Có chức năng Copy tên bảng/cột vào clipboard kèm tooltip phản hồi.
- [ ] Đạt 100% pass trên bộ unit test `SchemaBrowser.test.jsx`.

## Test Commands

```bash
node ./node_modules/vitest/vitest.mjs run src/components/sql/
```
