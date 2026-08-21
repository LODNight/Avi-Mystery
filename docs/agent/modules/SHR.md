# SHR — Shared Contracts/UI

## Responsibility

Stable service/domain contracts, service gateway, reusable UI primitives, hooks/utilities và mock fixtures/adapters thật sự dùng chung.

## Non-responsibility

Không là nơi chứa code chưa biết đặt đâu; không sở hữu feature workflow, evaluator-specific UI hoặc XP progression.

## Current Status

- Existing
- Related Sprint: Xuyên suốt
- Verified Paths: `src/services/contracts/`; `src/services/index.js`; `src/components/ui/`; `src/hooks/`; `src/utils/`; `src/mocks/`; shared providers/layout/router tại `src/app/`

## Public Interfaces

- Auth/course/mission JSDoc contracts và service gateway exports.
- Reusable UI primitives (`Button`, `Card`, `Input`, `Badge`, `Skeleton`, `EmptyState`).
- Shared hooks/utilities/storage; exact public barrel strategy: TBD.

## Dependencies

Platform/library dependencies và stable domain primitives only. SHR không phụ thuộc ngược LRN-EXCEL, LRN-SUB, LRN-SQL, GAME, ADM, BE hoặc ANL.

## Allowed Write Paths

- `src/services/contracts/`
- `src/services/index.js`
- `src/components/ui/`
- `src/hooks/`
- `src/utils/`
- `src/mocks/`

## Read-only Paths

- Mọi feature consumer bị ảnh hưởng bởi contract change.
- `src/pages/learner/`
- `src/pages/admin/`
- `src/components/excel/`

## Forbidden Scope

Feature behavior/refactor không cần cho contract, SQL/Admin/Backend/Analytics implementation và thay đổi consumer không được Current Task duyệt.

## Domain Rules

- Shared contract change phải liệt kê mọi consumer impact và path được sửa.
- UI không đọc mock JSON; adapter qua gateway.
- Mock/API cùng public interface.
- Shared không phụ thuộc feature module.
- Không đưa secret hoặc expected answer vào UI-facing contract.

## Required Test Coverage

Contract compatibility, adapter parity, UI primitive accessibility, hook cleanup và utility edge cases; chạy regression consumer liên quan.

## Definition of Done

- [ ] Acceptance Criteria đạt.
- [ ] Test module pass.
- [ ] Regression liên quan pass.
- [ ] Không sửa ngoài scope.
- [ ] Documentation được cập nhật nếu contract thay đổi.

## Known Risks

`src/services/index.js` mới gateway auth/course/mission; submission chưa export. Một số UI import mock adapter trực tiếp. `src/utils/excelChecker.js` mang tên shared nhưng logic feature-specific.

## Open Questions

Vị trí lâu dài của evaluators, contract runtime validation, barrel exports và ownership mock data: TBD.
