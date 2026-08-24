# Current Task

## Identification

- Project: Avi-Mystery
- Sprint: 4
- Step: 4.5-UX
- Task ID: LRN-SQL-4.5-UX-POLISH
- Status: DONE

## Gate Before This Task

- Step 4.5 base execution & ResultViewer are DONE.
- Full regression test suite (191/191 across 29 files) is passing.

## Goal

Refine the UX/UI of `ResultViewer.jsx` and `SqlMissionPage.jsx` based on user feedback:
1. **User Flow**: Add prominent action button ("Kiểm tra đáp án / Nộp bài") upon successful query run to prevent dead-end flow.
2. **Data Alignment**: Right-align numeric data cells (`number`, `INTEGER`, `REAL`), keep text/string cells left-aligned.
3. **Data Formatting**: Format numbers with thousand separators (e.g. `12,500,000`).
4. **Consistency**: Preserve case of column headers matching database/query schema without forced casing.
5. **Layout Scalability**: Add internal scroll container with `max-h-[360px]` and `sticky top-0` header to prevent layout explosion.

## In Scope

- Update `ResultViewer.jsx` for right-aligning numbers, thousand separator formatting, sticky header, scroll container, and column header case consistency.
- Add primary call-to-action button in `ResultViewer.jsx` or `SqlMissionPage.jsx` when query runs successfully.
- Update `ResultViewer.test.jsx` and `SqlMissionPage.test.jsx` for the new UX features.

## Out of Scope

- Full submission evaluator backend logic (Step 4.6 / Step 4.7).

## Allowed Write Paths

- `src/components/sql/ResultViewer.jsx`
- `src/components/sql/ResultViewer.test.jsx`
- `src/components/sql/`
- `src/pages/learner/SqlMissionPage.jsx`
- `src/pages/learner/SqlMissionPage.test.jsx`
- `docs/agent/CURRENT_TASK.md`

## Forbidden Paths

- `src/pages/admin/`
- `src/components/excel/`

## Acceptance Criteria

- [x] Successful query execution shows a prominent green/emerald "Nộp bài vụ án" / "Kiểm tra đáp án" action button.
- [x] Data cells containing numbers are right-aligned with `text-right` class.
- [x] Numbers >= 1,000 or currency/quantity values are formatted with thousand separators (e.g. `12,500,000`).
- [x] Table headers maintain exact database schema column name casing.
- [x] Table container has `max-h-[360px]` with sticky header (`sticky top-0`) and vertical scrollbar (`overflow-y-auto`).
- [x] Unit & integration tests pass 100%.


## Test Commands

```bash
node ./node_modules/vitest/vitest.mjs run src/components/sql/ResultViewer.test.jsx src/pages/learner/SqlMissionPage.test.jsx
node ./node_modules/vitest/vitest.mjs run
```

