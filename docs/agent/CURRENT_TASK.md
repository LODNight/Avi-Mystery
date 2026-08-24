# Current Task

## Identification

- Project: Avi-Mystery
- Sprint: 4
- Step: 4.8A
- Task ID: LRN-SQL-4.8A-SECURITY
- Status: IN_PROGRESS
- Primary Module: LRN-SQL

## Gate Before This Task

- Step 4.7 SQL Submission Integration is DONE.
- Step 4.8 has been broken down into 4 focused sub-steps (4.8A, 4.8B, 4.8C, 4.8D).
- Full test suite (222/222 across 30 files) is passing.

## Goal

Execute **Step 4.8A (Security, Query Policy & Resource Limits Guard)**:
1. **Read-only Query Policy Audit**: Ensure `sqlQueryPolicy.js` strictly blocks all 10 mutation/DDL statement keywords (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `CREATE`, `REPLACE`, `TRUNCATE`, `ATTACH`, `DETACH`, `VACUUM`).
2. **Multi-Statement Guard**: Ensure queries containing multiple statements separated by `;` are rejected with `SQL_POLICY_MULTIPLE_STATEMENTS` to prevent SQL injection attacks.
3. **Execution Timeout Guard**: Ensure heavy queries exceeding 3000ms are terminated safely without hanging the browser UI.
4. **Row Truncation Guard**: Ensure output datasets exceeding 500 rows are truncated with a user notification to preserve DOM rendering performance.
5. **Unit Tests**: Ensure unit test coverage for `sqlQueryPolicy.test.js` covers 100% of security boundary conditions.

## In Scope

- `src/utils/sql/sqlQueryPolicy.js`
- `src/utils/sql/sqlQueryPolicy.test.js`
- `src/utils/sql/sqlEngineAdapter.js`
- Documentation files (`CHECKLIST.md`, `ROADMAP.md`, `PROJECT_STATUS.md`, `BACKLOG.md`, `CURRENT_TASK.md`).

## Out of Scope

- Worker unmount lifecycle cleanup (handled in Step 4.8B).
- Light/Dark theme visual polish & responsive tuning (handled in Step 4.8C).
- Production build & full regression gate (handled in Step 4.8D).

## Allowed Write Paths

- `src/utils/sql/sqlQueryPolicy.js`
- `src/utils/sql/sqlQueryPolicy.test.js`
- `src/utils/sql/sqlEngineAdapter.js`
- `src/utils/sql/sqlEngineAdapter.test.js`
- `docs/agent/CURRENT_TASK.md`
- `docs/CHECKLIST.md`
- `docs/ROADMAP.md`
- `docs/PROJECT_STATUS.md`
- `docs/BACKLOG.md`

## Forbidden Paths

- `src/pages/admin/`
- `src/components/excel/SpreadsheetGrid.jsx`

## Acceptance Criteria

- [ ] All 10 mutation/DDL statement types are blocked with descriptive error code `SQL_POLICY_MUTATION_DISALLOWED`.
- [ ] Multi-statement queries separated by `;` are blocked with error code `SQL_POLICY_MULTIPLE_STATEMENTS`.
- [ ] Query timeout guard (3000ms) terminates long queries with error code `SQL_TIMEOUT`.
- [ ] Row truncation (500 rows limit) marks `isTruncated: true` in the output result envelope.
- [ ] All policy unit tests pass 100%.

## Test Commands

```bash
npx vitest run src/utils/sql/sqlQueryPolicy.test.js src/utils/sql/sqlEngineAdapter.test.js
```
