# Current Task

## Identification

- Project: Avi-Mystery
- Sprint: 4
- Step: 4.8C
- Task ID: LRN-SQL-4.8C-UI
- Status: IN_PROGRESS
- Primary Module: LRN-SQL

## Gate Before This Task

- Step 4.8A Query Security Policy & Resource Limits Guard is DONE.
- Step 4.8B Web Worker & Database Lifecycle Cleanup is DONE.
- Full unit test suite passing.

## Goal

Execute **Step 4.8C (Responsive Design & Light/Dark Theme Polish)**:
1. **Light/Dark Theme Fidelity**: Verify color tokens (`bg-card`, `border-stone-200/80`, `text-stone-800/200`, `amber-500`) across `SqlEditor`, `SchemaBrowser`, `ResultViewer`, and `MissionResultModal`.
2. **Responsive Layout Adaptation**: Ensure single-column stacking (`grid-cols-1`) on Mobile/Tablet and 2-column layout on Desktop (`lg:grid-cols-[minmax(0,1fr)_380px]`).
3. **Table & Editor Scroll Containers**: Verify horizontal table scrolling (`overflow-x-auto`) in `ResultViewer` and `SchemaBrowser`, and set responsive minimum height for `SchemaBrowser` on mobile.

## In Scope

- `src/components/sql/SchemaBrowser.jsx`
- `src/components/sql/SqlEditor.jsx`
- `src/components/sql/ResultViewer.jsx`
- `src/pages/learner/SqlMissionPage.jsx`
- Documentation files (`CHECKLIST.md`, `ROADMAP.md`, `PROJECT_STATUS.md`, `BACKLOG.md`, `CURRENT_TASK.md`).

## Out of Scope

- Production WASM build packaging & Vercel deployment gate (handled in Step 4.8D).
- Sprint 5 Game Progress System.

## Allowed Write Paths

- `src/components/sql/SchemaBrowser.jsx`
- `src/components/sql/SqlEditor.jsx`
- `src/components/sql/ResultViewer.jsx`
- `src/pages/learner/SqlMissionPage.jsx`
- `docs/agent/CURRENT_TASK.md`
- `docs/CHECKLIST.md`
- `docs/ROADMAP.md`
- `docs/PROJECT_STATUS.md`
- `docs/BACKLOG.md`

## Forbidden Paths

- `src/pages/admin/`
- `src/components/excel/SpreadsheetGrid.jsx`

## Acceptance Criteria

- [x] SchemaBrowser has responsive `min-h-[320px] lg:min-h-0` layout adaptation for mobile viewports.
- [x] SqlEditor uses 14px mono font size (preventing mobile zoom) with responsive buttons.
- [x] ResultViewer table scroll container supports `overflow-x-auto` for high column count.
- [x] All 4 SQL workspace components display harmoniously in both Light Mode and Dark Mode (Detective Amber).

## Test Commands

```bash
npx vitest run
```
