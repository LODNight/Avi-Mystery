# SHR — Shared Contracts/UI

## Responsibility

Stable service/domain contracts, service gateway, reusable UI primitives, hooks/utilities và mock fixtures/adapters thật sự dùng chung.

## Non-responsibility

Không là nơi chứa code chưa biết đặt đâu; không sở hữu feature workflow, evaluator-specific UI hoặc XP progression.

## Current Status

- Existing
- Learner UI foundation stabilization: Planned for Step 3.5
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
- `src/app/layouts/`
- `src/app/router/`

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

Submission đã export qua gateway và Excel Mission không import mock adapter trực tiếp. Learner Sidebar active-state logic hiện chưa có route-boundary test; Step 3.5 phải phân biệt shared layout/primitives với component chỉ dùng cho Excel. `src/utils/excelChecker.js` vẫn là logic feature-specific dù nằm trong `utils`.

## Open Questions

Vị trí lâu dài của evaluators, contract runtime validation, barrel exports và ownership mock data: TBD.
