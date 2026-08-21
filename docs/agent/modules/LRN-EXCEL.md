# LRN-EXCEL — Excel Learning

Allowed paths ở đây mô tả ownership; task đang hoạt động vẫn phải bị thu hẹp bởi [CURRENT_TASK.md](../CURRENT_TASK.md).

## Responsibility

Formula input, workbook/worksheet state, grid interaction, Excel evaluator và learner feedback riêng cho Excel.

## Non-responsibility

Không điều phối generic submission attempt, không lưu/trao XP, không triển khai SQL hoặc backend persistence.

## Current Status

- Existing
- UI stabilization candidates: Partial; planned for Step 3.5
- Related Sprint: 1–3
- Verified Paths: `src/components/excel/`; `src/pages/learner/ExcelMissionPage.jsx`; `src/pages/learner/ExcelMissionPage.test.jsx`; `src/utils/excelChecker.js`; `src/utils/excelChecker.test.js`

## Public Interfaces

- `ExcelMissionPage` tại route `/missions/:missionId/workspace`.
- `FormulaBar`, `SpreadsheetGrid`, `ActionToolbar`, `HintPanel`, `MissionResultModal`.
- `normalizeFormula`, `analyzeExcelFormula`, `evaluateFormulaValue`, `checkExcelAnswer` và `EXCEL_FORMULA_ERROR_CODES` từ `excelChecker.js`.

## Dependencies

Được phụ thuộc SHR mission/dataset/service contracts, UI primitives và LRN-SUB submission interface. Không phụ thuộc GAME implementation.

## Allowed Write Paths

- `src/components/excel/`
- `src/pages/learner/ExcelMissionPage.jsx`
- `src/pages/learner/ExcelMissionPage.test.jsx`
- `src/utils/excelChecker.js`
- `src/utils/excelChecker.test.js`

## Read-only Paths

- `src/services/contracts/`
- `src/services/index.js`
- `src/services/mock/`
- `src/mocks/data/missions.json`
- `src/mocks/data/datasets.json`

## Forbidden Scope

SQL engine/workspace, Admin Content Builder, API/backend, progress/XP persistence và unrelated learner/admin pages.

## Domain Rules

- Không đưa expected answer vào component.
- Excel evaluator đánh giá đáp án nhưng không trao XP.
- `run` không hoàn thành nhiệm vụ.
- Giữ tương thích với [Submission Contract](../CONTRACTS.md).
- UI đi qua service gateway, không đọc mock JSON/import adapter trực tiếp.

## Required Test Coverage

Formula normalization/value/error, grid selection/edit/reset, run/hint states, target cell, integration với submission và giữ answer khi sai.

## Definition of Done

- [x] Acceptance Criteria của formula diagnostics đạt.
- [x] Test module pass.
- [x] Regression liên quan pass.
- [x] Không sửa ngoài scope.
- [x] Documentation được cập nhật theo diagnostic contract.

## Known Risks

`ExcelMissionPage.jsx` vẫn chứa Excel state, submission orchestration và inline hint state ở cấp page. Working tree có Hint side drawer/inline hint nhưng integration coverage chưa đủ; reset hoặc mission change có thể giữ hint stale. Thay đổi Step 3.5 phải tránh làm vỡ Sprint 1–3.4.

## Open Questions

Workbook multi-sheet state, cú pháp Excel nâng cao và boundary tách page/controller: TBD. Inline hint vẫn thuộc LRN-EXCEL cho đến khi có consumer thứ hai; không tự promote sang SHR.
