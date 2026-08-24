# Current Task

## Identification

- Project: Avi-Mystery
- Sprint: 4
- Step: 4.8B
- Task ID: LRN-SQL-4.8B-LIFECYCLE
- Status: IN_PROGRESS
- Primary Module: LRN-SQL

## Gate Before This Task

- Step 4.8A Query Security Policy & Resource Limits Guard is DONE.
- Full test suite passing.

## Goal

Execute **Step 4.8B (Web Worker & Database Lifecycle Cleanup)**:
1. **Web Worker Unmount Cleanup**: Ensure `SqlMissionPage` calls `dispose()` on the Web Worker instance when leaving the mission component.
2. **Dataset Switching Cleanup**: Ensure switching between missions (e.g. `mission-010` ➔ `mission-011` / `sql-sales-v1` ↔ `sql-commerce-v1`) disposes the old engine instance and loads a fresh dataset into SQLite.
3. **Component Tests**: Verify lifecycle cleanup test cases in `SqlMissionPage.test.jsx`.

## In Scope

- `src/pages/learner/SqlMissionPage.jsx`
- `src/pages/learner/SqlMissionPage.test.jsx`
- Documentation files (`CHECKLIST.md`, `ROADMAP.md`, `PROJECT_STATUS.md`, `BACKLOG.md`, `CURRENT_TASK.md`).

## Out of Scope

- Light/Dark theme visual polish & responsive tuning (handled in Step 4.8C).
- Production build & full regression gate (handled in Step 4.8D).

## Allowed Write Paths

- `src/pages/learner/SqlMissionPage.jsx`
- `src/pages/learner/SqlMissionPage.test.jsx`
- `docs/agent/CURRENT_TASK.md`
- `docs/CHECKLIST.md`
- `docs/ROADMAP.md`
- `docs/PROJECT_STATUS.md`
- `docs/BACKLOG.md`

## Forbidden Paths

- `src/pages/admin/`
- `src/components/excel/SpreadsheetGrid.jsx`

## Acceptance Criteria

- [x] Worker `dispose()` is called when `SqlMissionPage` unmounts.
- [x] Switching missions disposes the active Web Worker engine and loads fresh dataset.
- [x] Component test cases in `SqlMissionPage.test.jsx` cover unmount and dataset switching lifecycle.

## Test Commands

```bash
npx vitest run src/pages/learner/SqlMissionPage.test.jsx
```
