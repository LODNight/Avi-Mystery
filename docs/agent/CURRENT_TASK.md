# Current Task

## Identification

- Project: Avi-Mystery
- Sprint: 3
- Step: 3.4E
- Task ID: LRN-SUB-3.4E-UI-STABILIZATION
- Status: DONE
- Primary Module: LRN-SUB
- Supporting Modules:
  - LRN-EXCEL
  - SHR
- Module document: [modules/LRN-SUB.md](./modules/LRN-SUB.md)

## Goal

Ổn định UI riêng của Submission & Feedback dựa trên [UI Change Inventory](./UI_CHANGE_INVENTORY.md): xác minh loading, validation, feedback, retry, completion modal, responsive và accessibility mà không mở rộng sang Learner UI foundation.

Không tự thực thi task này trong lượt audit. Không chuyển sang Step 3.5 hoặc Sprint 4.

## In Scope

- Run/Submit loading và disabled state.
- Chống double submit ở UI.
- Inline validation, incorrect feedback và service error/Retry.
- Success-only completion modal.
- Giữ answer khi submit sai hoặc service lỗi.
- Responsive riêng của Submission area.
- Accessibility của feedback và modal.
- Wording `potentialXp` là phần thưởng dự kiến, chưa được trao.
- Targeted tests và full regression.

## Out of Scope

- Learner Sidebar/Header/Footer hoặc navigation foundation.
- Hint side drawer, inline hint, Spreadsheet Grid restyle hoặc Mission layout redesign.
- Shared Button/Card/Form/loading/empty/error refactor.
- Submission contract/service/evaluator changes nếu audit không phát hiện blocker mới.
- SQL, Game Progress, Admin Content Builder, Backend và Analytics.
- Package, route, API migration, commit hoặc push.

## Allowed Write Paths

- `src/pages/learner/ExcelMissionPage.jsx`
- `src/pages/learner/ExcelMissionPage.test.jsx`
- `src/components/excel/ActionToolbar.jsx`
- `src/components/excel/ActionToolbar.test.jsx`
- `src/components/excel/FormulaBar.jsx`
- `src/components/excel/FormulaBar.test.jsx`
- `src/components/excel/MissionResultModal.jsx`
- `src/components/excel/MissionResultModal.test.jsx`
- `docs/agent/CURRENT_TASK.md`
- `docs/agent/UI_CHANGE_INVENTORY.md`
- `docs/agent/modules/LRN-SUB.md`
- `docs/agent/PROJECT_CONTEXT.md`
- `docs/agent/TEST_STRATEGY.md`
- `README.md`
- `docs/PROJECT_STATUS.md`
- `docs/ROADMAP.md`
- `docs/CHECKLIST.md`
- `docs/BACKLOG.md`
- `docs/TEST_REPORT.md`

`FormulaBar*` là đường dẫn Supporting Module được cho phép cụ thể vì nó hiển thị Submission validation/diagnostic. Các Supporting Module path khác mặc định read-only.

## Read-only Paths

- `src/services/contracts/submissionService.js`
- `src/services/index.js`
- `src/services/mock/mockSubmissionService.js`
- `src/services/mock/mockSubmissionService.test.js`
- `src/utils/excelChecker.js`
- `src/utils/excelChecker.test.js`
- `src/components/excel/HintPanel.jsx`
- `src/components/excel/HintPanel.test.jsx`
- `src/components/excel/SpreadsheetGrid.jsx`
- `src/components/excel/SpreadsheetGrid.test.jsx`
- `src/app/layouts/LearnerLayout.jsx`
- `src/app/router/index.jsx`
- `src/components/ui/`
- `src/mocks/data/`
- `docs/agent/CONTRACTS.md`
- `docs/agent/modules/LRN-EXCEL.md`
- `docs/agent/modules/SHR.md`

## Forbidden Paths

- `src/pages/admin/`
- `src/services/api/`
- `src/app/layouts/`
- `src/app/providers/`
- `src/features/auth/`
- Mọi SQL/Game/Admin/Backend/Analytics implementation path.
- `package.json`, `package-lock.json` và project config.
- `.git/`, commit và push.

## Required Contracts

- Không sửa Submission Contract trong Step 3.4E nếu không có user approval mới.
- UI gọi service qua gateway, không import mock adapter/JSON trực tiếp.
- `run` không complete; `submit` mới có thể complete.
- Submission chỉ trả `potentialXp`, không trao XP.
- Inline feedback cho validation/incorrect/service error; modal dành cho completion.

## Acceptance Criteria

- [x] Scope được đối chiếu với `UI_CHANGE_INVENTORY.md` trước khi sửa source.
- [x] Run/Submit loading và double-submit behavior được xác minh.
- [x] Validation, incorrect, service error và Retry hiển thị đúng, giữ answer.
- [x] Completion modal đạt keyboard/focus/Escape gate.
- [x] Submission area đạt mobile/tablet/desktop cơ bản.
- [x] Wording không hàm ý XP đã được trao.
- [x] Targeted tests pass và cover các gap đã ghi nhận.
- [x] Full regression Sprint 1–3 pass.
- [x] Không sửa HintPanel, SpreadsheetGrid, LearnerLayout hoặc shared foundation.
- [x] Sprint 4 chưa được kích hoạt.

## Test Commands

```bash
node ./node_modules/vitest/vitest.mjs run src/pages/learner/ExcelMissionPage.test.jsx src/components/excel/ActionToolbar.test.jsx src/components/excel/FormulaBar.test.jsx src/components/excel/MissionResultModal.test.jsx
node ./node_modules/vitest/vitest.mjs run
```

## Stop Conditions

- Cần đổi Submission Contract, route hoặc service behavior.
- Cần sửa HintPanel, SpreadsheetGrid, LearnerLayout hoặc shared UI foundation.
- Cần thêm package hoặc visual-test framework.
- Test fail do nguyên nhân ngoài Allowed Write Paths.
- Wording reward cần product decision trước khi triển khai.

## Audit Handoff

- Audit date: 21/08/2026.
- Working tree baseline: `HEAD` (`c7fef8b`); không có một commit duy nhất được xác nhận là baseline trước toàn bộ UI.
- Current working tree regression: 19/19 files, 120/120 tests pass; warnings React Router future flags và `AuthProvider` act vẫn không làm test fail.
- Step 3.5 đã được lên kế hoạch nhưng chưa kích hoạt.
- Sprint 4 chưa được kích hoạt.
