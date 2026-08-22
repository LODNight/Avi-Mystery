# LRN-SQL — SQL Learning

## Responsibility

SQL engine adapter/Worker, schema browser, editor, query result viewer, SQL evaluator và learner feedback riêng cho SQL.

## Non-responsibility

Không trao XP, không chạy query trên backend trong Sprint 4, không quản lý Admin content hoặc Excel evaluator.

## Current Status

- IN_PROGRESS — Step 4.1: In-Browser SQL Engine & Schema Browser
- Related Sprint: 4
- Verified Paths: `src/components/sql/`, `src/utils/sql/`, `src/pages/learner/SqlMissionPage.jsx`

## Public Interfaces

TBD. Engine adapter/Worker boundary, result-set evaluator và integration với generic submission contract.

## Dependencies

Chỉ SHR contracts/UI/utilities và LRN-SUB public interface. Shared không được phụ thuộc ngược LRN-SQL.

## Allowed Write Paths

- `src/components/sql/`
- `src/utils/sql/`
- `src/pages/learner/SqlMissionPage.jsx`
- `src/services/mock/mockSqlService.js`
- `src/mocks/data/sqlMissions.json`

## Read-only Paths

- `src/mocks/data/missions.json`
- `src/mocks/data/steps.json`
- `src/services/contracts/`
- `src/services/index.js`
- `src/app/router/index.jsx`

## Forbidden Scope

Mọi source change khi Current Task vẫn là Sprint 3.4; backend query execution; XP/progress; Admin Content Builder.

## Domain Rules

- SQL chạy trong browser ở MVP Sprint 4; không gửi query lên backend.
- Worker/engine cần timeout, row limit, reset database và stable error mapping.
- SQL evaluator không trao XP và không bypass Submission Contract.
- Query policy/security phải được chốt trước implementation.

## Required Test Coverage

Engine isolation, allowed/read-only query policy, timeout, max rows, reset, syntax/runtime error mapping, deterministic result comparison và submission modes.

## Definition of Done

- [ ] Acceptance Criteria đạt.
- [ ] Test module pass.
- [ ] Regression liên quan pass.
- [ ] Không sửa ngoài scope.
- [ ] Documentation được cập nhật nếu contract thay đổi.

## Known Risks

Không có SQL dependency/package hoặc Worker architecture; thêm package cần approval riêng.

## Open Questions

SQLite/WASM library, editor library, Worker protocol, schema format và canonical result comparison: TBD.
