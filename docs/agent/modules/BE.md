# BE — Backend API

## Responsibility

FastAPI, PostgreSQL, authentication, persistence, migrations và server-authoritative submission/progress rules từ Sprint 7.

## Non-responsibility

Không sở hữu learner/admin UI và không thay đổi public service interface tùy tiện.

## Current Status

- Planned
- Related Sprint: 7
- Verified Paths: không có backend source; `src/services/api/index.js` là frontend stub và chưa implement.

## Public Interfaces

Target REST/API mapping phải implement same frontend service interfaces như mock. Endpoint, schemas, auth mechanism và backend layout: TBD.

## Dependencies

SHR/domain contracts; server persistence. Frontend API client phụ thuộc backend API, không để backend phụ thuộc UI component.

## Allowed Write Paths

Không có backend source path được duyệt. Task Sprint 7 phải phê duyệt cấu trúc trước khi tạo source, config hoặc migration.

## Read-only Paths

- `src/services/contracts/`
- `src/services/mock/`
- `src/services/api/index.js`
- `src/services/index.js`
- `docs/agent/CONTRACTS.md`

## Forbidden Scope

Mọi backend/API implementation hoặc migration trong Sprint 3.4; database/user data; UI rewrite; package/config changes chưa duyệt.

## Domain Rules

- Chỉ triển khai từ Sprint 7 nếu Current Task không ghi khác.
- API client bảo toàn interface/mapping đã dùng bởi Mock Service.
- Server là nguồn sự thật cuối cho XP và submission persistence.
- Reward/persistence transaction phải idempotent; không đưa secret vào source/docs.

## Required Test Coverage

Contract tests mock/API, auth/RBAC, validation, authoritative evaluation, idempotent reward transaction, migrations, persistence integration và frontend compatibility.

## Definition of Done

- [ ] Acceptance Criteria đạt.
- [ ] Test module pass.
- [ ] Regression liên quan pass.
- [ ] Không sửa ngoài scope.
- [ ] Documentation được cập nhật nếu contract thay đổi.

## Known Risks

Backend stack chỉ được nêu trong roadmap/prompt; chưa có source, schema, migration strategy hoặc server test framework.

## Open Questions

Repository layout, ORM/migration tool, auth/token strategy, endpoint versioning và deployment topology: TBD.
