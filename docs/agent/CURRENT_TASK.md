# Current Task

## Identification

- Project: Avi-Mystery
- Sprint: 5
- Step: 5.1
- Task ID: GAM-XP-5.1-LEVELING
- Status: IN_PROGRESS
- Primary Module: GAME

## Gate Before This Task

- Sprint 4 (SQL Vertical Slice) is 100% COMPLETED (Step 4.0 - 4.8D).
- All unit tests and regression gates pass.

## Goal

Execute **Step 5.1 (Leveling Engine & XP System)**:
1. **Leveling Formula & Engine**: Build a pure, deterministic utility `levelingEngine.js` calculating level (Level 1 to 50), XP required for next level, and title progression (e.g. "Tập sự", "Trinh thám tập sự", "Thám tử tư", "Siêu thám tử").
2. **Progress Integration**: Connect submission XP rewards to cumulative XP progression.
3. **Level Up Modal & Animation**: Design visual level-up popups and progress indicators in the UI.

## In Scope

- `src/utils/game/levelingEngine.js` (NEW)
- `src/utils/game/levelingEngine.test.js` (NEW)
- Documentation files (`CHECKLIST.md`, `ROADMAP.md`, `PROJECT_STATUS.md`, `BACKLOG.md`, `CURRENT_TASK.md`).

## Out of Scope

- Auto unlock lesson map logic (handled in Step 5.2).
- Profile page & Achievements (handled in Step 5.3).

## Allowed Write Paths

- `src/utils/game/levelingEngine.js`
- `src/utils/game/levelingEngine.test.js`
- `docs/agent/CURRENT_TASK.md`
- `docs/CHECKLIST.md`
- `docs/ROADMAP.md`
- `docs/PROJECT_STATUS.md`
- `docs/BACKLOG.md`

## Forbidden Paths

- `src/pages/admin/`

## Acceptance Criteria

- [ ] Deterministic XP to Level calculation supporting Level 1 - 50.
- [ ] Comprehensive unit tests for leveling formula and title progression.
- [ ] Level Up event state returned cleanly for progress gateway integration.

## Test Commands

```bash
npx vitest run src/utils/game/levelingEngine.test.js
```
