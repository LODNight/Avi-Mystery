# LRN-SUB — Submission & Feedback

Allowed paths ở đây mô tả ownership; [CURRENT_TASK.md](../CURRENT_TASK.md) là quyền ghi thực tế.

## Responsibility

Orchestration `run`/`submit`, async state, attempt identity/count, validation/result mapping, double-submit guard, retry và feedback presentation.

## Non-responsibility

Không tự đánh giá Excel/SQL khi evaluator riêng tồn tại; không trực tiếp trao XP, level-up hoặc persistence backend.

## Current Status

- Existing — Step 3.4 `DONE`
- Related Sprint: 3.4
- Verified Paths: `src/services/contracts/submissionService.js`; `src/services/index.js`; `src/services/mock/mockSubmissionService*`; submission flow trong `src/pages/learner/ExcelMissionPage*`; `src/components/excel/ActionToolbar*`; `src/components/excel/MissionResultModal*`

Contract và gateway đã có. Mock lưu submission history nhưng không cập nhật session XP/level; UI chỉ gọi gateway.

## Public Interfaces

- `submissionService.submit(request)`.
- `submissionService.getSubmissionHistory(userId)`.
- Mock hiện thực interface; API placeholder giữ cùng interface và API thật thuộc Sprint 7.

## Dependencies

Được phụ thuộc LRN-EXCEL evaluator và SHR mission/content/contracts. SQL evaluator chỉ được dùng khi Sprint 4 tạo module đó. Không phụ thuộc GAME internals.

## Allowed Write Paths

- `src/services/contracts/submissionService.js`
- `src/services/mock/mockSubmissionService.js`
- `src/services/mock/mockSubmissionService.test.js`
- `src/services/index.js`
- `src/pages/learner/ExcelMissionPage.jsx`
- `src/pages/learner/ExcelMissionPage.test.jsx`
- `src/components/excel/ActionToolbar.jsx`
- `src/components/excel/ActionToolbar.test.jsx`
- `src/components/excel/FormulaBar.jsx`
- `src/components/excel/FormulaBar.test.jsx`
- `src/components/excel/MissionResultModal.jsx`
- `src/components/excel/MissionResultModal.test.jsx`

## Read-only Paths

- `src/utils/excelChecker.js`
- `src/services/contracts/missionService.js`
- `src/services/mock/mockMissionService.js`
- `src/services/mock/mockAuthService.js`
- `src/mocks/data/missions.json`
- `src/mocks/data/datasets.json`
- `src/mocks/data/steps.json`

## Forbidden Scope

XP mutation/leveling/streak/achievement, SQL engine, Admin Content Builder, API implementation, FastAPI/PostgreSQL, package/config changes.

## Domain Rules

- Một task chỉ có LRN-SUB làm Primary Module; SHR chỉ được sửa ở path cụ thể trong Current Task.
- `run` không complete; chỉ `submit` có thể trả completion.
- Trả `potentialXp`, không cập nhật XP.
- Chặn double submit ở UI và giữ service idempotency-ready.
- Giữ answer sau incorrect/service error; feedback sai dùng inline, modal ưu tiên completion.
- Component không giữ expected answer; mock/API cùng public interface.
- Formula diagnostic code từ LRN-EXCEL được giữ nguyên trong `feedbackCode` để Run/Submit nhất quán.

## Required Test Coverage

Success, incorrect, validation error, service error, retry, optional timeout, double submit, unmount in-flight, `run` không complete và không XP mutation.

## Definition of Done

- [x] Acceptance Criteria đạt.
- [x] Test module pass.
- [x] Regression liên quan pass.
- [x] Không sửa ngoài scope.
- [x] Documentation được cập nhật theo contract.

## Known Risks

Checker config mới được xác minh cho `mission-001`; mission Excel khác trả `CONTENT_CONFIG_MISSING` cho đến khi content/checker được cấu hình. Reward idempotency và XP mutation vẫn thuộc Sprint 5/7.

## Open Questions

SQL answer union và completion/versioning đa-step sẽ được chốt khi Sprint 4 được kích hoạt; không nằm trong Step 3.4.
