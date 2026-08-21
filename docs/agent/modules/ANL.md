# ANL — Analytics & Hardening

## Responsibility

Event taxonomy, admin reporting, performance, security hardening, observability và launch readiness.

## Non-responsibility

Không thu thập dữ liệu nhạy cảm không cần thiết, không định nghĩa metric chỉ bằng chart và không sửa core feature ngoài task.

## Current Status

- Planned
- Related Sprint: 8
- Verified Paths: `/admin/analytics` là placeholder trong `src/app/router/index.jsx`; không có analytics/security/observability module source.

## Public Interfaces

TBD. Cần event schema/version, metric definitions, reporting contract và privacy/retention rules.

## Dependencies

Frontend event producers, BE authoritative data và SHR contracts. Feature module không được phụ thuộc chặt vào analytics transport.

## Allowed Write Paths

Không có source path được duyệt. Task Sprint 8 phải phê duyệt path/event boundary cụ thể.

## Read-only Paths

- `src/app/router/index.jsx`
- `src/pages/admin/OverviewPage.jsx`
- `docs/agent/CONTRACTS.md`

## Forbidden Scope

Mọi analytics/hardening implementation trong Sprint 3.4; sensitive-data collection; feature refactor không phục vụ metric/security acceptance criteria.

## Domain Rules

- Mỗi metric có tên, định nghĩa, numerator/denominator, nguồn và thời gian tính.
- Không thu dữ liệu nhạy cảm nếu không cần.
- Event taxonomy ổn định/versioned; dashboard không là nguồn sự thật.
- Security findings không tự cấp quyền sửa ngoài Current Task.

## Required Test Coverage

Event schema, deduplication, metric calculation, authorization/privacy, performance budgets và security regression khi được triển khai.

## Definition of Done

- [ ] Acceptance Criteria đạt.
- [ ] Test module pass.
- [ ] Regression liên quan pass.
- [ ] Không sửa ngoài scope.
- [ ] Documentation được cập nhật nếu contract thay đổi.

## Known Risks

Không có event instrumentation, backend reporting source, metric dictionary hoặc monitoring stack.

## Open Questions

Event transport, retention/consent, metric owners, performance budgets, threat model và launch gate: TBD.
