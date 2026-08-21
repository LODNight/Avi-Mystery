# ADM — Admin Content

## Responsibility

Course, chapter, mission, dataset, test-case builder, preview, content lifecycle và publish validation.

## Non-responsibility

Không đánh giá learner attempt, không trao progress/XP và không bypass shared schema/contract.

## Current Status

- Partial
- Related Sprint: 6
- Verified Paths: Admin shell/status/settings tồn tại tại `src/pages/admin/` và `src/app/layouts/AdminLayout.jsx`; content routes trong `src/app/router/index.jsx` chỉ là placeholder; chưa có Content Builder source.

## Public Interfaces

Hiện có admin overview/page-status/settings UI. Course/chapter/mission/dataset authoring and publish APIs: TBD.

## Dependencies

SHR UI, auth/RBAC, mission/course/dataset contracts. Preview có thể reuse learner renderer qua public boundary, không ghi learner progress.

## Allowed Write Paths

- Existing admin shell ownership: `src/pages/admin/`, `src/app/layouts/AdminLayout.jsx`.
- Content Builder chưa có path được duyệt; task Sprint 6 phải thu hẹp path cụ thể.

## Read-only Paths

- `src/services/contracts/`
- `src/mocks/data/`
- `src/components/ui/`
- `src/app/router/index.jsx`

## Forbidden Scope

Mọi Admin Content change trong Sprint 3.4; learner submission/progress, SQL engine và backend source.

## Domain Rules

- Course/chapter/mission/dataset/test-case phải qua shared contract.
- Preview không ghi progress hoặc trao XP.
- Publish cần validation rõ; draft/published lifecycle không được bypass.
- Expected answer/test case không được lộ vào learner component.

## Required Test Coverage

RBAC, create/edit validation, lifecycle transitions, preview isolation, publish blocking và contract round-trip khi được triển khai.

## Definition of Done

- [ ] Acceptance Criteria đạt.
- [ ] Test module pass.
- [ ] Regression liên quan pass.
- [ ] Không sửa ngoài scope.
- [ ] Documentation được cập nhật nếu contract thay đổi.

## Known Risks

Admin status/settings hiện tồn tại nhưng dễ bị hiểu nhầm là Content Builder đã có; các content routes chỉ là placeholder.

## Open Questions

Draft schema, validation ownership, versioning, preview sandbox và publish permissions: TBD.
