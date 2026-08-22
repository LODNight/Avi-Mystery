# Current Task

## Identification

- Project: Avi-Mystery
- Sprint: 4
- Step: 4.1
- Task ID: LRN-SQL-4.1-ENGINE
- Status: IN_PROGRESS
- Primary Module: LRN-SQL
- Supporting Modules:
  - SHR
  - BE
- Module document: [modules/LRN-SQL.md](./modules/LRN-SQL.md)

## Goal

Khởi tạo hạ tầng cho Sprint 4 (SQL Vertical Slice): Tích hợp trình quản lý SQL WebAssembly (SQLite WASM / SQL engine adapter) chạy trực tiếp trên trình duyệt và xây dựng component Trình duyệt Cấu trúc Bảng (`Schema Browser`) hiển thị danh sách bảng, tên cột, kiểu dữ liệu và chỉ dẫn dataset SQL cho người học.

Không trao XP, không gửi SQL query lên Backend API thật, không làm sụp đổ các trang Excel Mission và Learner Shell hiện có.

## In Scope

- Khởi tạo kiến trúc client-side SQL engine (WASM/adapter) và utility quản lý schema / mock SQLite database.
- Phát triển component `Schema Browser` hiển thị danh sách bảng (Tables), danh sách cột (Columns) và dữ liệu mẫu (Sample data).
- Xây dựng mock datasets cho bài tập SQL đầu tiên (ví dụ: `investigations`, `clues`, `suspects`).
- Đăng ký route và layout cơ bản cho SQL Mission Workspace (`/missions/sql/:missionId/workspace` hoặc tương đương).
- Viết unit test cho SQL engine adapter và `Schema Browser` component.
- Cập nhật tài liệu tiến độ (`CURRENT_TASK.md`, `ROADMAP.md`, `PROJECT_STATUS.md`, `CHECKLIST.md`, `BACKLOG.md`).

## Out of Scope

- Backend API thật cho SQL execution (Backend thật thuộc Sprint 7).
- SQL Evaluator nâng cao và Submission Contract integration (thuộc Step 4.3).
- Chức năng trao XP / Streak thật (Game progress thuộc Sprint 5).
- Python learning sandbox hay Admin Content Builder cho SQL.

## Allowed Write Paths

- `src/components/sql/`
- `src/utils/sql/`
- `src/pages/learner/SqlMissionPage.jsx`
- `src/pages/learner/SqlMissionPage.test.jsx`
- `src/services/mock/mockSqlService.js`
- `src/services/mock/mockSqlService.test.js`
- `src/mocks/data/sqlMissions.json`
- `docs/agent/CURRENT_TASK.md`
- `docs/agent/modules/LRN-SQL.md`
- `docs/PROJECT_STATUS.md`
- `docs/ROADMAP.md`
- `docs/CHECKLIST.md`
- `docs/BACKLOG.md`
- `docs/TEST_REPORT.md`

## Read-only Paths

- `src/components/excel/`
- `src/utils/excelChecker.js`
- `src/services/contracts/`
- `src/app/layouts/`
- `src/components/ui/`

## Forbidden Paths

- `src/pages/admin/`
- `src/services/api/`
- `package.json`
- `.git/`

## Acceptance Criteria

- [ ] Client-side SQL engine / mock database adapter khởi tạo dữ liệu bài học thành công trong trình duyệt.
- [ ] `Schema Browser` hiển thị trực quan các bảng, cột, kiểu dữ liệu và mẫu dữ liệu.
- [ ] Route không bị xung đột với Excel Mission Workspace hiện có.
- [ ] Pass 100% unit tests cho SQL engine adapter & Schema Browser.
- [ ] Full regression tests Sprint 1–3 vẫn pass 100%.

## Test Commands

```bash
node ./node_modules/vitest/vitest.mjs run src/utils/sql/
node ./node_modules/vitest/vitest.mjs run
```
