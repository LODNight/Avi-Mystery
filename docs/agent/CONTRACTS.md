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

## Excel Formula Diagnostics

Nhập, Apply/Enter, Run và Submit dùng chung `analyzeExcelFormula(formula, sheetData)`. Result có shape `{ valid, value, normalizedFormula, errorCode, message }`; `evaluateFormulaValue` giữ compatibility bằng cách trả value hoặc `null`.

Stable formula codes: `FORMULA_REQUIRED`, `FORMULA_MISSING_EQUALS`, `FORMULA_EMPTY_EXPRESSION`, `FORMULA_UNBALANCED_PARENTHESES`, `FORMULA_UNSUPPORTED_FUNCTION`, `FORMULA_INVALID_RANGE`, `FORMULA_INVALID_CHARACTER`, `FORMULA_INVALID_SYNTAX`, `FORMULA_REFERENCE_NOT_FOUND`, `FORMULA_NON_NUMERIC_REFERENCE`, `FORMULA_DIVISION_BY_ZERO`.

Khi evaluator trả lỗi, Submission Result dùng chính formula code làm `feedbackCode`; UI hiển thị `message` nhưng không suy luận loại lỗi bằng cách parse message.

## SQL Contracts — Step 4.0 Baseline

Engine, Dataset, Execution Result, stable errors và Worker transport dưới đây đã được spike xác minh. Mission/checker/submission shape vẫn là proposal để Step 4.3, 4.6 và 4.7 triển khai mà không mở rộng UI/service trong Step 4.0.

### SQL Engine / Worker

Public engine interface: `initialize()`, `loadDataset(dataset)`, `getSchema()`, `execute(query, options)`, `reset()` và `dispose()`.

Worker request dùng `{ id, action, payload }`; response dùng `{ id, ok: true, data }` hoặc `{ id, ok: false, error: { code, message, details, retryable } }`. Adapter giữ request correlation, timeout và Worker recovery; Worker sở hữu WASM/database.

### SQL Mission / Dataset

```js
{
  missionId: 'string',
  tool: 'sql',
  datasetId: 'string',
  starterQuery: 'string',
  checkerConfig: {
    expectedColumns: ['string'],
    orderMatters: false,
    columnOrderMatters: true,
    numericTolerance: 0.001,
    maxExecutionMs: 2000,
    maxRows: 500,
    requiredConstructs: [],
    forbiddenConstructs: []
  },
  hints: []
}
```

Dataset đã triển khai có shape `{ id, version, dialect: 'sqlite', tables: [{ name, columns, rows }] }`. Mỗi column có `{ name, type, primaryKey?, nullable? }`; identifier/type/row width được validate trước khi seed. Dataset phải deterministic và đủ metadata để reset database. Expected result/config nằm ở content/evaluator boundary, không nằm trong UI component.

### SQL Execution Result

```js
{
  columns: ['string'],
  rows: [[]],
  rowCount: 0,
  truncated: false,
  executionMs: 0,
  errorCode: null,
  message: null
}
```

Stable errors: `SQL_ENGINE_NOT_READY`, `SQL_WASM_LOAD_FAILED`, `SQL_DATASET_INVALID`, `SQL_QUERY_REQUIRED`, `SQL_MULTIPLE_STATEMENTS`, `SQL_READ_ONLY_VIOLATION`, `SQL_SYNTAX_ERROR`, `SQL_RUNTIME_ERROR`, `SQL_TIMEOUT`, `SQL_RESULT_LIMIT_EXCEEDED`, `SQL_WORKER_TERMINATED`.

`execute` chỉ nhận một statement bắt đầu bằng `SELECT`/`WITH`; mutation, DDL, `ATTACH`, `PRAGMA` và statement thứ hai bị chặn ở adapter và Worker. Default timeout 2000ms; timeout cứng terminate/recreate Worker rồi nạp lại seed. Default 500 rows, hard cap 5000; kết quả vượt limit trả rows đã cắt với `truncated: true` và `SQL_RESULT_LIMIT_EXCEEDED`.

### SQL Submission Answer

SQL dùng shared Submission Request với `tool: 'sql'` và answer proposal `{ query, executionResult? }`. Submission adapter/evaluator phải tự lấy expected config từ content boundary; client-provided execution result không được coi là authoritative khi backend Sprint 7 tồn tại.

`run` chỉ execute/feedback; `submit` mới có thể trả completion và `potentialXp`. Không tạo SQL Submission Service riêng.

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
