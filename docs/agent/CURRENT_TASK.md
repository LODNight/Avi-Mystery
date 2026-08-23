# Current Task

## Identification

- Project: Avi-Mystery
- Sprint: 4
- Step: 4.3
- Task ID: LRN-SQL-4.3-MISSION-SHELL
- Status: IN_PROGRESS
- Primary Module: LRN-SQL
- Supporting Modules:
  - SHR (service gateway and route boundary)
  - LRN-EXCEL (one regression-only wording fix)
- Module document: [modules/LRN-SQL.md](./modules/LRN-SQL.md)

## Gate Before This Task

- Step 4.1C is DONE: query policy, timeout/recovery and row limit have targeted test coverage.
- Step 4.2 is DONE: Schema Browser has all accepted states and 7/7 component tests passing.
- The prior task was reconciled on 2026-08-23. This task must restore the full regression gate before being marked DONE.

## Goal

Build the SQL Mission Shell, loader and an isolated learner route. A SQL mission must load typed SQL content and a SQLite dataset through a stable service gateway, initialize one engine lifecycle, display the existing Schema Browser, handle loading/error/retry, and dispose safely on mission change/unmount.

## In Scope

- Create a stable `sqlMissionService.loadWorkspace(missionId)` contract, mock implementation and API placeholder with the same public interface.
- Create correct SQLite datasets for the existing SQL mission metadata; SQL must never load Excel grid datasets.
- Update only SQL mission `datasetId` values in `src/mocks/data/missions.json` to use the SQL dataset IDs.
- Add `/missions/:missionId/sql` and update the mission-intro CTA to select it only for `tool: 'sql'`; keep the Excel workspace route unchanged.
- Create `SqlMissionPage` with mission header/briefing, loading, content/engine/schema error states, retry, Schema Browser and lifecycle cleanup.
- Add component/service/route tests using an injected fake engine; run a real Worker/WASM browser smoke test.
- Restore the existing HintPanel wording expected by the current Excel regression tests; no Excel behavior/refactor.
- Remove obsolete Markdown files only after their references have been removed and canonical docs have been synchronized.

## Out of Scope

- SQL Editor, controlled query state, Run action, Result Viewer, Result Checker and Submission.
- XP/progress mutation, backend execution, OPFS, CodeMirror, autocomplete, formatter and CSV export.
- Any Excel feature change other than the narrow regression wording fix.
- Refactoring generic Excel workspace routing or changing Excel datasets.

## Allowed Write Paths

- `src/pages/learner/SqlMissionPage.jsx`
- `src/pages/learner/SqlMissionPage.test.jsx`
- `src/pages/learner/MissionIntroPage.jsx`
- `src/pages/learner/MissionIntroPage.test.jsx`
- `src/components/sql/`
- `src/components/excel/HintPanel.jsx`
- `src/components/excel/HintPanel.test.jsx`
- `src/utils/sql/`
- `src/mocks/data/sql/`
- `src/mocks/data/missions.json` (SQL mission `datasetId` fields only)
- `src/services/contracts/sqlMissionService.js`
- `src/services/mock/mockSqlMissionService.js`
- `src/services/mock/mockSqlMissionService.test.js`
- `src/services/api/index.js`
- `src/services/index.js`
- `src/app/router/index.jsx`
- `docs/agent/CURRENT_TASK.md`
- `docs/agent/modules/LRN-SQL.md`
- `docs/agent/CONTRACTS.md`
- `docs/agent/MODULE_MAP.md`
- `docs/agent/PROJECT_CONTEXT.md`
- `docs/agent/TEST_STRATEGY.md`
- `docs/agent/UI_CHANGE_INVENTORY.md`
- `docs/PROJECT_STATUS.md`
- `docs/ROADMAP.md`
- `docs/CHECKLIST.md`
- `docs/BACKLOG.md`
- `docs/TEST_REPORT.md`
- `README.md`
- `docs/DOUBLE_CHECK_REPORT.md` (delete)
- `docs/avi-mystery-roadmap-review-sprint-3-8.md` (delete)

## Read-only Paths

- `src/components/ui/`
- `src/pages/learner/ExcelMissionPage.jsx`
- `src/services/contracts/submissionService.js`
- `src/services/mock/mockMissionService.js`
- `src/utils/excelChecker.js`
- `src/workers/sql/`

## Forbidden Paths

- `src/pages/admin/`
- Other Excel components/pages/services
- Backend source and API implementation beyond the declared placeholder
- `.git/`

## Acceptance Criteria

- [ ] Canonical Markdown shows 4.1C and 4.2 DONE with no contradictory status.
- [ ] Full regression is green; the HintPanel regression is restored without behavior change.
- [ ] Every supported SQL mission resolves a SQLite dataset, never an Excel grid dataset.
- [ ] UI calls SQL content only through `sqlMissionService` exported by `src/services/index.js`.
- [ ] `/missions/:missionId/sql` loads SQL only; Excel `/workspace` route remains unchanged.
- [ ] Shell has loading, content/engine/schema error + retry, and no product editor/result/submission controls.
- [ ] One engine is disposed on unmount and before a route mission changes; stale async results do not render.
- [ ] Unit/component tests, real browser Worker/WASM smoke, production build and full regression pass.

## Test Commands

```bash
node ./node_modules/vitest/vitest.mjs run src/services/mock/mockSqlMissionService.test.js src/pages/learner/SqlMissionPage.test.jsx src/pages/learner/MissionIntroPage.test.jsx src/components/excel/HintPanel.test.jsx
node ./node_modules/vitest/vitest.mjs run
node ./node_modules/vite/bin/vite.js build
```
