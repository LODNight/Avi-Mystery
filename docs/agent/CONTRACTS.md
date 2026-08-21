# Shared Contracts

Đây là contract đã được chấp nhận và triển khai cho Step 3.4. Nguồn code là `src/services/contracts/submissionService.js`; mock và API adapter tương lai phải giữ cùng public interface qua service gateway.

## Mission Identity

- `missionId`: string ổn định, bắt buộc.
- `stepId`: string tùy chọn khi submission ở cấp step.
- `tool`: `'excel' | 'sql'`.
- Version/content revision dùng cho submission: TBD.

## Submission Mode

- `run`: đánh giá thử; không hoàn thành step/mission, không tạo thưởng.
- `submit`: đánh giá chính thức; có thể trả trạng thái hoàn thành và `potentialXp`, nhưng không trao XP.

## Submission Request

```js
/**
 * @typedef {Object} SubmissionRequest
 * @property {'run'|'submit'} mode
 * @property {string} missionId
 * @property {string} [stepId] // required/optional rule: TBD
 * @property {'excel'|'sql'} tool
 * @property {{formula: string, sheetData?: Record<string, unknown>}|unknown} answer
 * @property {number} [hintsUsed]
 * @property {string} clientAttemptId
 */
```

Component cung cấp câu trả lời của người học; evaluator/service lấy expected answer từ content boundary. Component không giữ expected formula/result set.

## Submission Result

```js
/**
 * @typedef {Object} SubmissionResult
 * @property {string} attemptId
 * @property {boolean} isCorrect
 * @property {number} score
 * @property {boolean} stepCompleted
 * @property {boolean} missionCompleted
 * @property {number} potentialXp // not awarded
 * @property {string} feedbackCode
 * @property {string} feedback
 */
```

Mọi adapter trả envelope `{ data, error }`. Khi thành công, `error` là `null`; khi lỗi, `data` là `null` và error có shape `{ code, message, retryable }`. `netXp`, `updatedUser` và `userLevelUp` không thuộc Submission Result.

## Stable Errors

Canonical codes ổn định giữa mock/API: `VALIDATION_ERROR`, `MISSION_NOT_FOUND`, `CONTENT_CONFIG_MISSING`, `UNSUPPORTED_TOOL`, `SERVICE_UNAVAILABLE`, `TIMEOUT`, `DUPLICATE_ATTEMPT`. Message hiển thị có thể thay đổi; UI branch theo code, không parse message. `SERVICE_UNAVAILABLE` và `TIMEOUT` là retryable trong mock Step 3.4.

## Idempotency

- `clientAttemptId` nhận diện một hành động submit phía client; cùng ID không được tạo nhiều attempt/reward.
- `run` không trao thưởng.
- `submit` đúng chỉ trả `potentialXp` trong Sprint 3.4.
- Progress Sprint 5 trao thưởng tối đa một lần cho completion key; backend Sprint 7 thực thi transaction/server authority.
- Completion key và chính sách reward/resubmit dài hạn thuộc Progress Sprint 5 và backend Sprint 7.

## Boundaries

```text
UI → submissionService → tool evaluator → SubmissionResult
                               ↓
                         no XP mutation

Progress consumes an eligible completed result → idempotent award
```

- Evaluator: kiểm tra đáp án và tạo evaluation detail; không lưu attempt, completion hoặc XP.
- Submission: validation, async orchestration, attempt identity, mode và feedback mapping; không cập nhật user XP.
- Progress: completion/reward/level/streak; không gọi UI component và không đánh giá formula/query.
- Mock/API adapters: cùng public methods và response shape qua `src/services/index.js`.

## Implemented Contract

`submissionService` cung cấp `submit(request)` và `getSubmissionHistory(userId)` qua `src/services/index.js`. Step 3.4 triển khai checker đã xác minh cho `mission-001`; mission chưa có checker trả `CONTENT_CONFIG_MISSING` thay vì dùng fallback sai. API thật vẫn được hoãn đến Sprint 7.
