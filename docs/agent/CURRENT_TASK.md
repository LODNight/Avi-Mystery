# Current Task

## Identification

- Project: Avi-Mystery
- Sprint: 4
- Step: 4.6
- Task ID: LRN-SQL-4.6-CHECKER
- Status: DONE
- Primary Module: LRN-SQL

## Gate Before This Task

- Step 4.5 base execution, ResultViewer & UX/UI polish are DONE.
- Step 4.6 SQL Result Checker (`sqlChecker.js`) is DONE.
- Full test suite (208/208 across 30 files) is passing.

## Goal

Implement the SQL Result Checker (`sqlChecker.js`) to evaluate learner SQL query results against canonical mission solutions:
1. **Construct Validation**: Check required keywords (`requiredConstructs`) and forbidden constructs (`forbiddenConstructs`).
2. **Column Matching**: Validate column count and column names/casing according to `checkerConfig` (`expectedColumns`, `columnOrderMatters`).
3. **Row Count & Multiplicity Matching**: Compare actual vs expected row counts, handling row order sensitivity (`orderMatters: true/false`) with frequency/multiplicity hash matching.
4. **Numeric Tolerance & NULL Alignment**: Support floating-point comparison tolerance (`numericTolerance`, default `0.001`) and strict `NULL` matching.
5. **Stable Feedback Catalog**: Map evaluation outcomes to canonical feedback codes (`SQL_CHECKER_FEEDBACK_CODES`) with human-readable Vietnamese feedback messages.

## In Scope

- Create `src/utils/sql/sqlChecker.js` implementing `evaluateSqlResult(actualResult, expectedResult, checkerConfig)`.
- Export stable feedback catalog `SQL_CHECKER_FEEDBACK_CODES`.
- Create comprehensive unit test suite `src/utils/sql/sqlChecker.test.js` covering all edge cases (constructs, columns, row order, numeric tolerance, empty sets, NULLs).
- Update documentation files (`CHECKLIST.md`, `ROADMAP.md`, `PROJECT_STATUS.md`, `BACKLOG.md`).

## Out of Scope

- Submission XP awarding and Progress system state mutation (reserved for Step 4.7 / Sprint 5).
- Admin Content Builder UI for configuring checkers (Sprint 6).

## Allowed Write Paths

- `src/utils/sql/sqlChecker.js`
- `src/utils/sql/sqlChecker.test.js`
- `src/utils/sql/`
- `docs/agent/CURRENT_TASK.md`
- `docs/CHECKLIST.md`
- `docs/ROADMAP.md`
- `docs/PROJECT_STATUS.md`
- `docs/BACKLOG.md`
- `docs/TEST_REPORT.md`

## Forbidden Paths

- `src/pages/admin/`
- `src/components/excel/`

## Acceptance Criteria

- [x] `evaluateSqlResult` pure evaluator handles all comparison rules deterministically without mutating inputs.
- [x] Returns `{ isCorrect, score, feedbackCode, feedback, details }`.
- [x] `SQL_CHECKER_FEEDBACK_CODES` contains all canonical codes (`SUCCESS`, `MISSING_REQUIRED_CONSTRUCT`, `FORBIDDEN_CONSTRUCT_USED`, `COLUMN_COUNT_MISMATCH`, `MISSING_EXPECTED_COLUMN`, `ROW_COUNT_MISMATCH`, `ROW_ORDER_MISMATCH`, `VALUE_MISMATCH`, `EMPTY_RESULT_SET`).
- [x] Row order insensitivity (`orderMatters: false`) handles duplicate rows and different row ordering accurately.
- [x] Numeric comparison respects `numericTolerance` (e.g. `0.001`).
- [x] 100% test coverage for `sqlChecker.test.js` with 17 passed test cases and 0 failures.

## Test Commands

```bash
npx vitest run src/utils/sql/sqlChecker.test.js
```
