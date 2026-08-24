# Current Task

## Identification

- Project: Avi-Mystery
- Sprint: 4
- Step: 4.7
- Task ID: LRN-SUB-4.7-SQL
- Status: DONE
- Primary Module: LRN-SUB

## Gate Before This Task

- Step 4.5 base execution, ResultViewer & UX/UI polish are DONE.
- Step 4.6 SQL Result Checker (`sqlChecker.js`) pure evaluator engine is DONE.
- Step 4.7 SQL Submission Integration is DONE.
- Full test suite (213/213 across 30 files) is passing.

## Goal

Integrate SQL query submission into the shared `submissionService` gateway & `SqlMissionPage`:
1. **Service Gateway**: Extended `mockSubmissionService.js` to support `tool: 'sql'` requests without creating a separate SQL submission service.
2. **Evaluator Wiring**: Wired `evaluateSqlResult` into `mockSubmissionService` using SQL mission checker configs (`SQL_CHECKER_CONFIG`).
3. **Workspace Integration**: Wired `SqlMissionPage.jsx` action button to `submissionService.submit({ mode: 'submit', tool: 'sql', ... })` with `isSubmitting` guards and `clientAttemptId` idempotency.
4. **Completion Feedback**: Rendered `MissionResultModal` on successful query submission showing potential XP & completion status, while keeping incorrect answer feedback inline in the SQL workspace.
5. **Testing**: Added component & unit tests covering SQL submission happy path, incorrect answer feedback, missing query validation, and idempotency.

## In Scope

- Updated `src/services/mock/mockSubmissionService.js` to support `SUBMISSION_TOOLS.SQL` and `evaluateSqlResult`.
- Updated `src/services/mock/mockSubmissionService.test.js` with SQL submission test cases.
- Updated `src/components/excel/MissionResultModal.jsx` for SQL mission completion.
- Updated `src/pages/learner/SqlMissionPage.jsx` to handle submit state, call `submissionService.submit`, display inline feedback or trigger result modal.
- Updated `src/pages/learner/SqlMissionPage.test.jsx` for end-to-end submission testing.
- Updated documentation files (`CHECKLIST.md`, `ROADMAP.md`, `PROJECT_STATUS.md`, `BACKLOG.md`, `TEST_REPORT.md`, `README.md`).

## Out of Scope

- User state XP mutation or persistent progress unlocking (reserved for Sprint 5).
- Admin Content Builder UI (Sprint 6).

## Allowed Write Paths

- `src/services/mock/mockSubmissionService.js`
- `src/services/mock/mockSubmissionService.test.js`
- `src/components/excel/MissionResultModal.jsx`
- `src/pages/learner/SqlMissionPage.jsx`
- `src/pages/learner/SqlMissionPage.test.jsx`
- `docs/agent/CURRENT_TASK.md`
- `docs/CHECKLIST.md`
- `docs/ROADMAP.md`
- `docs/PROJECT_STATUS.md`
- `docs/BACKLOG.md`
- `docs/TEST_REPORT.md`
- `README.md`

## Forbidden Paths

- `src/pages/admin/`
- `src/components/excel/SpreadsheetGrid.jsx`

## Acceptance Criteria

- [x] `submissionService.submit({ tool: 'sql' })` executes evaluation using `sqlChecker.js` and returns standard `SubmissionResult` shape.
- [x] Mode `'run'` does not mark mission completed or calculate `potentialXp`. Mode `'submit'` calculates `potentialXp` when `isCorrect: true`.
- [x] Clicking "Nộp bài vụ án" in `SqlMissionPage` triggers `submissionService.submit`, shows loading spinner, and disables double click.
- [x] Correct answer displays `MissionResultModal` with potential XP and success feedback.
- [x] Incorrect answer displays clear inline error/feedback in `SqlMissionPage` without breaking workspace.
- [x] All unit and component tests pass 100% (213/213 passed across 30 files).

## Test Commands

```bash
npx vitest run src/services/mock/mockSubmissionService.test.js src/pages/learner/SqlMissionPage.test.jsx
```
