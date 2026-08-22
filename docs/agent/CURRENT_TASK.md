# Current Task

## Identification

- Project: Avi-Mystery
- Sprint: 3
- Step: 3.6
- Task ID: LRN-UI-3.6-LIGHT-MODE
- Status: DONE
- Primary Module: LRN-EXCEL
- Supporting Modules:
  - SHR
  - LRN-SUB
- Module document: [modules/LRN-EXCEL.md](./modules/LRN-EXCEL.md)

## Goal

Tinh chỉnh giao diện Light Mode trên toàn bộ ứng dụng Người học (`Learner`), đặc biệt là không gian làm bài Excel (`ExcelMissionPage`, `ActionToolbar`, `FormulaBar`, `SpreadsheetGrid`) và App Shell Sidebar theo các quy chuẩn thẩm mỹ và accessibility của Step 3.6 trong Roadmap.

Không mở rộng sang Sprint 4 (SQL) hoặc thay đổi Submission Contract / Evaluator logic.

## In Scope

- Tinh chỉnh CSS Root Variables cho Light Mode (`index.css`): background xám nhạt ấm (`#fafaf9`), card trắng (`#ffffff`), viền rõ ràng (`#e7e5e4` / `#d6d3d1`).
- Chuẩn hóa nút phụ (Secondary Actions: Chạy thử công thức, Gợi ý, Đặt lại) trong `ActionToolbar` về tone trung tính (neutral gray / outline) ở Light Mode để nút Nộp bài nổi bật làm Primary CTA.
- Tăng độ tương phản của thanh nhập công thức `FormulaBar` và viền nhận biết ô tính mục tiêu ở Light Mode.
- Làm sạch bảng dữ liệu `SpreadsheetGrid`: Header tên cột xám trung tính nhạt (`stone-100` / `stone-200`), phân biệt rõ các ô Target, Selected, Editable và Grid Lines.
- Cân bằng thị giác thẻ Promo Streak trong Sidebar `LearnerLayout` ở Light Mode (dùng nền thẻ surface nhạt kèm viền & icon cam thay vì dải màu cam đậm lấn át).
- Đảm bảo Accessibility (độ tương phản chữ, focus-visible) và chạy regression test cho cả Light Mode và Dark Mode.
- Cập nhật tài liệu tiến độ (`CURRENT_TASK.md`, `ROADMAP.md`, `PROJECT_STATUS.md`, `CHECKLIST.md`).

## Out of Scope

- Submission contract, evaluator, hoặc mock service changes.
- Chức năng trao XP/Streak thật (game progress thuộc Sprint 5).
- SQL Sandbox, Admin Content Builder, Backend API thật.
- Thêm các thư viện ngoài.

## Allowed Write Paths

- `src/styles/index.css`
- `src/components/excel/ActionToolbar.jsx`
- `src/components/excel/ActionToolbar.test.jsx`
- `src/components/excel/FormulaBar.jsx`
- `src/components/excel/FormulaBar.test.jsx`
- `src/components/excel/SpreadsheetGrid.jsx`
- `src/components/excel/SpreadsheetGrid.test.jsx`
- `src/components/excel/HintPanel.jsx`
- `src/components/excel/MissionResultModal.jsx`
- `src/app/layouts/LearnerLayout.jsx`
- `src/pages/learner/ExcelMissionPage.jsx`
- `docs/agent/CURRENT_TASK.md`
- `docs/agent/UI_CHANGE_INVENTORY.md`
- `docs/agent/PROJECT_CONTEXT.md`
- `README.md`
- `docs/PROJECT_STATUS.md`
- `docs/ROADMAP.md`
- `docs/CHECKLIST.md`
- `docs/BACKLOG.md`
- `docs/TEST_REPORT.md`

## Read-only Paths

- `src/services/contracts/`
- `src/services/mock/`
- `src/utils/excelChecker.js`
- `src/utils/excelChecker.test.js`
- `src/app/router/`
- `src/components/ui/`
- `src/mocks/data/`

## Forbidden Paths

- `src/pages/admin/`
- `src/services/api/`
- `package.json`, `package-lock.json`
- `.git/`

## Acceptance Criteria

- [x] Light mode root variables chuẩn hóa background xám nhạt (`#fafaf9`), card trắng (`#ffffff`), border tương phản rõ.
- [x] ActionToolbar secondary buttons (Chạy thử, Gợi ý, Đặt lại) dùng tone trung tính ở Light Mode, giữ Nộp bài làm primary action.
- [x] FormulaBar input border rõ ràng trên nền sáng; diagnostic và active hint hiển thị rõ nét.
- [x] SpreadsheetGrid header xám trung tính, phân biệt ô Target vs Selected vs Editable.
- [x] Streak promo card trong Sidebar dùng card surface cân bằng ở Light mode.
- [x] Pass toàn bộ unit tests và full regression tests.
- [x] Dark Mode không bị ảnh hưởng tiêu cực (regression pass).

## Test Commands

```bash
node ./node_modules/vitest/vitest.mjs run src/components/excel/ActionToolbar.test.jsx src/components/excel/FormulaBar.test.jsx src/components/excel/SpreadsheetGrid.test.jsx src/pages/learner/ExcelMissionPage.test.jsx
node ./node_modules/vitest/vitest.mjs run
```
