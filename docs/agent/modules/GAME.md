# GAME — Game Progress

## Responsibility

Frontend domain duy nhất điều phối XP, level, streak, unlock và achievements; đảm bảo reward idempotency.

## Non-responsibility

Không đánh giá formula/query, không render animation làm nguồn sự thật, không sở hữu submission transport.

## Current Status

- Partial
- Related Sprint: 5
- Verified Paths: chưa có module riêng; XP/level/streak fields tại `src/services/contracts/authService.js` và mock auth data; `/profile` và `/achievements` là placeholder. Submission Step 3.4 không mutate XP.

## Public Interfaces

TBD. Cần Progress service/store nhận eligible completion và trả authoritative progress snapshot.

## Dependencies

LRN-SUB result/attempt identity và SHR contracts/storage adapter. Không phụ thuộc trực tiếp React component.

## Allowed Write Paths

Không có source path module độc lập được duyệt. Task Sprint 5 phải phê duyệt path cụ thể; code XP rải hiện tại không cấp quyền mặc định.

## Read-only Paths

- `src/services/contracts/authService.js`
- `src/services/mock/mockAuthService.js`
- `src/services/mock/mockSubmissionService.js`
- `src/app/router/index.jsx`

## Forbidden Scope

Mọi thay đổi Sprint 5 khi Current Task là Sprint 3.4; evaluator, Admin, SQL engine và backend persistence.

## Domain Rules

- Chỉ GAME/Progress điều phối XP/level/streak/achievement ở frontend domain.
- Một completion chỉ nhận thưởng một lần; animation không là nguồn sự thật.
- Sprint 3.4 chỉ nhận `potentialXp`, chưa trao XP.
- Backend Sprint 7 là authority cuối cùng cho reward/persistence.

## Required Test Coverage

Duplicate/replay reward, level thresholds, zero/negative rewards, unlock sequence, streak timezone/race rules và progress snapshot consistency.

## Definition of Done

- [ ] Acceptance Criteria đạt.
- [ ] Test module pass.
- [ ] Regression liên quan pass.
- [ ] Không sửa ngoài scope.
- [ ] Documentation được cập nhật nếu contract thay đổi.

## Known Risks

Progress/reward domain chưa được triển khai; Sprint 5 vẫn phải chốt completion key và idempotent award trước khi mutate XP.

## Open Questions

Reward key, level formula, streak timezone, hint penalty ownership và offline reconciliation: TBD.
