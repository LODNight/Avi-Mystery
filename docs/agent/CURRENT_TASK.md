# Current Task

## Identification

- Project: Avi-Mystery
- Sprint: 4
- Step: 4.4
- Task ID: LRN-SQL-4.4-EDITOR-MVP
- Status: IN_PROGRESS
- Primary Module: LRN-SQL
- Supporting Modules:
  - SHR (UI components)
- Module document: [modules/LRN-SQL.md](./modules/LRN-SQL.md)

## Gate Before This Task

- Step 4.3 is DONE: SQL Mission Shell, loader, `/missions/:missionId/sql` route and lifecycle cleanup are implemented and verified.
- Targeted tests (9/9) and full regression test suite (178/178 across 27 files) are passing.

## Goal

Build the controlled SQL Editor MVP component (`SqlEditor.jsx`) inside `SqlMissionPage`. The component must provide a clean code editor container with accessible ARIA labels, starter query loading, query reset functionality, soft-tab indentation, and `Ctrl+Enter` / `Cmd+Enter` keyboard shortcuts.

## In Scope

- Create `SqlEditor.jsx` component in `src/components/sql/SqlEditor.jsx`.
- Controlled query input state management with starter query initialization and reset capabilities.
- Accessibility features: Proper `aria-label`, `id`, keyboard shortcuts, and focus indicators.
- Keyboard navigation: `Tab` key handling for soft indentation (2 spaces), `Ctrl+Enter` / `Cmd+Enter` key listener.
- Action toolbar: `Run Query` button (triggering onRun), `Reset Code` button (reverting to initial starter SQL).
- Integrate `SqlEditor` into `SqlMissionPage.jsx`.
- Component unit testing in `src/components/sql/SqlEditor.test.jsx`.

## Out of Scope

- WASM query execution against engine and result viewer rendering (deferred to Step 4.5).
- Heavy external dependencies (Monaco / CodeMirror) before dependency gate.
- Query result comparison (deferred to Step 4.6).

## Allowed Write Paths

- `src/components/sql/SqlEditor.jsx`
- `src/components/sql/SqlEditor.test.jsx`
- `src/components/sql/`
- `src/pages/learner/SqlMissionPage.jsx`
- `src/pages/learner/SqlMissionPage.test.jsx`
- `docs/agent/CURRENT_TASK.md`
- `docs/PROJECT_STATUS.md`
- `docs/CHECKLIST.md`

## Forbidden Paths

- `src/pages/admin/`
- `src/components/excel/`

## Acceptance Criteria

- [ ] `SqlEditor` component renders with proper ARIA accessibility labels and styling matching "Detective Amber" design system.
- [ ] Controlled value state initializes with mission `starterSql` query.
- [ ] `Reset` button reverts code back to initial `starterSql`.
- [ ] Keyboard navigation: `Tab` inserts 2 spaces without breaking focus; `Ctrl/Cmd+Enter` triggers the onRun callback.
- [ ] `SqlEditor.test.jsx` passes 100% with Vitest.

## Test Commands

```bash
node ./node_modules/vitest/vitest.mjs run src/components/sql/SqlEditor.test.jsx src/pages/learner/SqlMissionPage.test.jsx
node ./node_modules/vitest/vitest.mjs run
```
