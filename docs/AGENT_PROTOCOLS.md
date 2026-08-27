

--- Content of AGENTS.md ---

# Avi-Mystery — Repository Instructions

## Product Direction

- Nền tảng học dữ liệu theo hướng game hóa.
- Ưu tiên Excel trước, SQL tiếp theo.
- Python learning không thuộc phạm vi MVP hiện tại.
- Frontend dùng Mock Service trước khi chuyển sang API thật.

## Required Reading

Trước khi sửa code, đọc:

1. `docs/agent/CURRENT_TASK.md`
2. Tài liệu module được khai báo trong Current Task
3. `docs/agent/CONTRACTS.md` nếu task liên quan service hoặc dữ liệu dùng chung
4. `docs/agent/TEST_STRATEGY.md`

## Scope Rules

- Mỗi task có đúng một Primary Module.
- Chỉ sửa file trong Allowed Write Paths; Supporting Module mặc định là read-only.
- Read-only Paths chỉ được đọc. Không sửa Forbidden Paths.
- Không tự chuyển sang Sprint hoặc Step tiếp theo, refactor module không liên quan, hoặc đổi mock sang API.
- Thay đổi Shared Contract phải được ghi rõ trong Current Task và có đường dẫn cụ thể trong Allowed Write Paths.
- Nếu cần sửa ngoài phạm vi, dừng và báo blocker.

## Engineering Rules

- UI không được đọc trực tiếp mock JSON hoặc import trực tiếp mock/API adapter; UI gọi service qua contract và gateway ổn định.
- Mock và API client phải có cùng public interface.
- Evaluator không trực tiếp trao XP. Submission trả kết quả; Progress chịu trách nhiệm trao XP.
- Thao tác trao thưởng phải hỗ trợ idempotency khi triển khai.
- Không đưa secret vào source code hoặc tài liệu.

## Completion Gate

Không đánh dấu hoàn thành nếu Acceptance Criteria hoặc test liên quan chưa đạt, regression chưa được giải thích, có thay đổi ngoài phạm vi, hoặc loading/success/error/retry state cần thiết chưa được xử lý.

## Final Report

Mỗi lần hoàn thành task phải báo:

1. Scope đã thực hiện
2. File đã thay đổi
3. Test đã chạy và kết quả
4. Acceptance Criteria
5. Phần chưa làm
6. Risk hoặc blocker


--- Content of docs/agent/CONTRACTS.md ---

# Shared Service & Domain Contracts

> **Cập nhật lần cuối:** 24/08/2026
> **Trạng thái hợp đồng:** Nguồn chuẩn cho giao tiếp dữ liệu giữa các module Frontend và Backend.
> **Trạng thái phân loại:**
> - `CURRENT`: Đã triển khai và verified (`submissionService`, `sqlEngineAdapter`, `excelChecker`, `sqlChecker`).
> - `PLANNED`: Chuẩn bị triển khai trong Sprint 5–6 (`contentService`, `datasetService`, `progressService`).
> - `PROPOSED`: Định hướng mở rộng tương lai (`practiceService`, `analyticsService`).

---

## 1. 🏛 Domain Hierarchy & Taxonomy Contracts (`PLANNED`)

Hệ thống tuân thủ chuỗi phân cấp dữ liệu học tập chuẩn:
```text
Learning Journey
  └── Phase
       └── Chapter
            └── Investigation (Truyện / Bối cảnh Vụ án)
                 └── Question (Nhiệm vụ kỹ thuật Excel/SQL)
                      ├── Question Variant (Biến thể bài tập)
                      └── Submission (Bài làm của người học)
                           └── Result (Kết quả chấm điểm & potentialXp)
                                └── Progress (Ghi nhận XP & Level - Progress Domain)
```

### 1.1. Core Concept Distinctions
- **Investigation vs Question**: `Investigation` chứa câu chuyện bối cảnh trinh thám; `Question` là nhiệm vụ thao tác kỹ thuật cụ thể (công thức Excel hoặc câu lệnh SQL).
- **Question vs Question Variant**: `Question` quy định đề bài lõi; `Question Variant` chứa bộ test/tham số khác nhau cho chế độ Luyện tập hoặc Replay.
- **Dataset (Independent Asset)**: Bộ dữ liệu `Dataset` tồn tại độc lập với ID riêng (`datasetId`), có thể được gán cho nhiều `Question` hoặc `Investigation` mà không bị nhân bản.
- **Course vs Learning Map**: `Course` chứa cấu trúc tri thức; `Learning Map` hiển thị trạng thái nút học tập của người học theo thời gian thực.
- **Main Quest vs Practice**: `Main Quest` mở khóa tuyến tính trên Bản đồ Học tập; `Practice` làm bài rèn luyện tự do trong ngân hàng câu hỏi.
- **Completion vs Mastery**: `Completion` là cờ Boolean mở khóa bài học; `Mastery` là điểm số đánh giá chất lượng (Độ chính xác, thời gian giải, số gợi ý đã dùng, tối ưu SQL).

---

## 2. 📝 Content & Evaluation Configuration Contract (`PLANNED — Step 5.1`)

```js
/**
 * @typedef {Object} EvaluationConfig
 * @property {'excel'|'sql'} tool
 * @property {Object} [excelConfig]
 * @property {string} [excelConfig.targetCell]
 * @property {string} [excelConfig.expectedFormula]
 * @property {unknown} [excelConfig.expectedValue]
 * @property {Object} [sqlConfig]
 * @property {string[]} [sqlConfig.expectedColumns]
 * @property {boolean} [sqlConfig.orderMatters]
 * @property {boolean} [sqlConfig.columnOrderMatters]
 * @property {number} [sqlConfig.numericTolerance]
 * @property {string[]} [sqlConfig.requiredConstructs]
 * @property {string[]} [sqlConfig.forbiddenConstructs]
 */
```

- **Quy tắc bóc tách (`Step 5.1`)**: Evaluator configs không được lưu cứng trong `mockSubmissionService.js`. `submissionService` sẽ gọi `contentService.getEvaluationConfig(questionId)` để lấy `EvaluationConfig` tại thời điểm chấm bài.

---

## 3. 🎯 Submission Service Contract (`CURRENT`)

Duy trì tại `src/services/contracts/submissionService.js`. Mock và API adapter giữ cùng public interface.

### 3.1. Submission Request
```js
/**
 * @typedef {Object} SubmissionRequest
 * @property {'run'|'submit'} mode
 * @property {string} questionId // (Hoặc missionId cho legacy compatibility)
 * @property {string} [stepId]
 * @property {'excel'|'sql'} tool
 * @property {{formula?: string, query?: string, sheetData?: unknown}} answer
 * @property {number} [hintsUsed]
 * @property {string} clientAttemptId
 */
```

### 3.2. Submission Result
```js
/**
 * @typedef {Object} SubmissionResult
 * @property {string} attemptId
 * @property {boolean} isCorrect
 * @property {number} score
 * @property {boolean} stepCompleted
 * @property {boolean} questionCompleted
 * @property {number} potentialXp // Ghi chú: CHỈ LÀ PHẦN THƯỞNG DỰ KIẾN, KHÔNG MUTATE XP
 * @property {string} feedbackCode
 * @property {string} feedback
 */
```

- **Ranh giới an toàn (`Boundaries`)**: `submissionService` **tuyệt đối không mutate XP** của người dùng. Mọi thao tác trao XP do `progressService` đảm nhận.

---

## 4. 🏆 Progress Service Contract (`PLANNED — Step 6.1`)

```js
/**
 * @typedef {Object} UserProgressRecord
 * @property {string} userId
 * @property {number} currentXp
 * @property {number} currentLevel
 * @property {string} title
 * @property {Record<string, boolean>} completedQuestions // Map questionId -> boolean
 * @property {Record<string, number>} masteryScores // Map questionId -> score
 * @property {number} streakDays
 * @property {string} lastActiveDate
 */

/**
 * @typedef {Object} AwardXpRequest
 * @property {string} userId
 * @property {string} questionId
 * @property {string} attemptId
 * @property {number} xpAmount
 * @property {'main_quest'|'practice'} mode
 */
```

### 4.1. Nguyên Tắc Idempotency (Chống Cộng Trùng XP)
- Thao tác `awardXp(request)` kiểm tra cờ `completedQuestions[questionId]`.
- Nếu bài học đã được hoàn thành từ trước, hệ thống trả về bản ghi tiến độ hiện tại mà **không cộng thêm XP cốt truyện**.
- Chế độ `practice` chỉ cập nhật điểm `masteryScores` nếu điểm mới cao hơn điểm cũ.

---

## 5. ⚡ SQL WASM Engine Contract (`CURRENT`)

Được xác minh tại Step 4.0–4.8.

### 5.1. Worker Request Transport
- Worker Request: `{ id: string, action: string, payload: unknown }`
- Worker Response: `{ id: string, ok: true, data: unknown }` hoặc `{ id: string, ok: false, error: { code: string, message: string, retryable: boolean } }`

### 5.2. Security Policy Guards
- **Read-Only Enforcer**: Chặn 100% các từ khóa `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `CREATE`, `VACUUM`, `PRAGMA`, `ATTACH`, `DETACH`.
- **Multi-Statement Guard**: Chặn thực thi nhiều hơn 1 câu lệnh SQL phân tách bởi dấu `;`.
- **Resource Limits**: Hard timeout 3000ms (giải phóng Worker) và truncation cap 500 rows.

---

## 6. 🔄 Subsystem Boundaries Summary

```text
UI Component ──> submissionService.submit(req) ──> tool Evaluator (pure)
                         │                                 │
                         ▼                                 ▼
                SubmissionResult                     Returns Feedback
             (potentialXp preview)                     & Correctness
                         │
                         ▼
        progressService.awardProgress(result)
                         │
                         ▼
               Idempotent XP Ledger
               & Level Up Event Trigger
```


--- Content of docs/agent/LEARNING_MAP_CONTRACT.md ---

# Learning Map Domain Contract & Adapter Specification (Step 6.2)

## 1. Multi-Phase Journey Hierarchy

The Learning Map resolves the conceptual distinction between **Course** ("What courses are available?") and **Learning Map** ("Where am I in my learning journey?").

```text
Domain Progression Hierarchy
----------------------------
Learning Journey (All Courses / Tracks)
  ├── Phase 1: Excel Data Investigation
  │     ├── Chapter 1: Basic Formulas & Logic
  │     │     ├── Investigation 1.1 (Excel Workspace)
  │     │     └── Investigation 1.2 (Excel Workspace)
  │     └── Chapter 2: Pivot & Data Cleaning
  └── Phase 2: SQL Forensic Analysis
        ├── Chapter 1: SELECT & Filtering
        │     ├── Investigation 2.1 (SQL Workspace)
        │     └── Investigation 2.2 (SQL Workspace)
        └── Chapter 2: JOINs & Aggregations
```

---

## 2. Learning Journey Schema

```js
/**
 * @typedef {Object} PhaseNode
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {'excel'|'sql'} tool
 * @property {number} totalChapters
 * @property {number} totalInvestigations
 * @property {number} totalXp
 * @property {number} completionPercentage
 * @property {'completed'|'in_progress'|'locked'} status
 * @property {ChapterNode[]} chapters
 */

/**
 * @typedef {Object} LearningJourneyMap
 * @property {Object} journeySummary
 * @property {number} journeySummary.totalPhases
 * @property {number} journeySummary.totalChapters
 * @property {number} journeySummary.totalInvestigations
 * @property {number} journeySummary.totalXp
 * @property {number} journeySummary.overallProgress
 * @property {PhaseNode[]} phases
 */
```

---

## 3. UX Progression Rules

1. **Primary Navigation**: Navigating between phases occurs via **Phase Tabs** / Phase Headers rather than a hidden course dropdown.
2. **Current Phase Active Selection**: Defaults to the active phase containing the learner's first incomplete `current` Investigation node.
3. **Locking Rules**: Phases and chapters unlock according to `unlockRule` policies (`none` or `complete_previous`).


--- Content of docs/agent/MASTERY_CONTRACT.md ---

# Completion vs. Mastery Domain Contract Specification (Step 5.8)

## 1. Architectural Distinction

This document formalizes the fundamental separation between **Completion State** and **Skill Mastery State**.

| Dimension | Completion (`LearnerProgressRecord`) | Skill Mastery (`LearnerMasteryRecord`) |
|---|---|---|
| **Core Question** | "Has the learner completed this content?" | "How well does the learner demonstrate the associated skill?" |
| **Lookup Key** | `${learnerId}:${contentId}` | `${learnerId}:${skillId}` |
| **Primary State** | `status` (`not_started` \| `in_progress` \| `completed`) | `masteryScore` (0 to 100 proficiency rating) |
| **Lifecycle Metric** | First completion timestamp (`completedAt`) | Accumulated attempts (`totalAttempts`, `successfulAttempts`) |
| **Target Entity** | Content (`Question`, `Investigation`, `Chapter`) | Skill (`excel-formula-basic`, `sql-select-basic`) |
| **Unlocking Purpose**| Unlocks learning map nodes | Informs skill readiness / practice recommendations |

---

## 2. Mastery Record Schema

```js
/**
 * @typedef {Object} SkillAssessmentItem
 * @property {string} questionId        // Target question evaluated
 * @property {boolean} isCorrect        // Whether assessment was passed
 * @property {number} score             // Raw score achieved (0..100)
 * @property {string} assessedAt        // ISO timestamp
 */

/**
 * @typedef {Object} LearnerMasteryRecord
 * @property {string} learnerId         // Target learner ID
 * @property {string} skillId           // Skill identifier (e.g. "excel-sum")
 * @property {number} masteryScore      // Calculated skill proficiency score (0 to 100)
 * @property {number} totalAttempts     // Total attempts submitted across all questions for this skill
 * @property {number} successfulAttempts // Total successful attempts for this skill
 * @property {string|null} lastAssessedAt // ISO timestamp of most recent assessment
 * @property {SkillAssessmentItem[]} history // Log of recent skill assessments
 */
```

---

## 3. Pure Mastery Evaluation Algorithm (`evaluateSkillMastery`)

Proficiency calculation is kept simple, deterministic, and transparent:

1. **Initial Assessment**: `totalAttempts = 1`, `successfulAttempts = isCorrect ? 1 : 0`.
2. **Mastery Score Calculation**:
   $$\text{masteryScore} = \text{Math.round}\left(\frac{\text{successfulAttempts}}{\text{totalAttempts}} \times 100\right)$$
3. **Assessment Log Cap**: Keeps the last 50 assessment entries in `history` to prevent memory growth while enabling analytics in future sprints.
4. **Immutability Guarantee**: `evaluateSkillMastery` returns a NEW `LearnerMasteryRecord` without mutating existing records or content entities.


--- Content of docs/agent/PROGRESS_CONTRACT.md ---

# Learner Progress Contract Specification (Step 5.6)

## 1. Overview

The Learner Progress domain models a learner's interactive journey through learning content (`Question`, `Investigation`, `Chapter`, `Course`). It explicitly decouples **Learner State** from static **Content Definitions**.

### Content State vs. Learner State

| Dimension | Content Definition (Static) | Learner Progress (Dynamic State) |
|---|---|---|
| **Identity** | `questionId`, `investigationId`, `chapterId` | `learnerId` + `contentId` (`learnerId:contentId`) |
| **Mutability** | Read-only static descriptors | Dynamically updated per attempt |
| **Ownership** | System content graph | Associated with a specific learner |
| **Lifecycle** | Global / Versioned | Mutable per learner activity |

---

## 2. Progress Record Schema

Every progress record adheres to the following contract schema:

```js
/**
 * @typedef {Object} LearnerProgressRecord
 * @property {string} learnerId      // Unique learner ID (e.g. "user-001")
 * @property {string} contentId      // Target content entity ID (e.g. "q-001", "inv-001")
 * @property {'question'|'investigation'|'chapter'|'course'} contentType // Type of content entity
 * @property {'not_started'|'in_progress'|'completed'|'failed'} status   // Progress status
 * @property {number} attempts       // Total number of submission attempts
 * @property {number} bestScore      // Highest score achieved across all attempts (0 to 100)
 * @property {string|null} lastAttemptAt // ISO 8601 timestamp of most recent attempt
 * @property {string|null} completedAt   // ISO 8601 timestamp when content was first successfully completed
 */
```

---

## 3. Composite Keying & State Transitions

### Keying Strategy
Progress records are indexed using a deterministic composite key:
`createLearnerProgressKey(learnerId, contentId)` $\rightarrow$ `"${learnerId}:${contentId}"`

### Status State Machine
```text
  [Not Started]
        │
        │ (recordAttempt: incorrect / run)
        ▼
  [In Progress] ───────┐ (recordAttempt: retry / failed)
        │              │
        │ (recordAttempt: correct / passed)
        ▼              │
   [Completed] ◄───────┘
        │
        ▼ (recordAttempt: retry after completion)
   [Completed]  (attempts++, bestScore updated, completedAt preserved)
```

- **Not Started**: Initial state before any attempt has been recorded.
- **In Progress**: At least 1 attempt recorded, but content not yet successfully completed.
- **Completed**: At least 1 attempt succeeded (`isCorrect === true` or `score >= 100`).
- **Retries after Completion**: Subsequent retries increment `attempts`, update `lastAttemptAt`, update `bestScore` if higher, but preserve original `completedAt` timestamp and `completed` status.

---

## 4. Subsystem Isolation & Non-Mutation Rules

1. **No Content Mutation**: Content objects passed to progress calculations or returned by progress services are strictly read-only and never mutated.
2. **Separation from Submission Engine**: `submissionService` evaluates attempts and returns `SubmissionResult`. `progressService` consumes `SubmissionResult` to update learner progress records.
3. **No XP / Gamification Side Effects**: `LearnerProgressRecord` tracks completion and attempts only. XP balances, level-ups, streaks, and achievements belong to downstream progress reward handlers.


--- Content of docs/agent/REWARD_CONTRACT.md ---

# XP Reward Contract Specification (Step 5.7)

## 1. Architectural Overview

The XP Reward system connects submission outcomes to learner progress and XP accumulation. It enforces strict separation between:

1. **Submission Evaluation Layer**: Evaluates answer correctness (`SubmissionResult`). Evaluator functions (`checkExcelAnswer`, `evaluateSqlResult`) remain 100% pure and **never award XP**.
2. **Learner Progress Layer**: Tracks completion status (`LearnerProgressRecord`) and attempt metrics.
3. **XP Reward Layer**: Calculates XP earned (`calculateXpReward`) and applies transactions idempotently to the learner's total XP ledger (`applyXpTransaction`).

---

## 2. XP Calculation Rules (`calculateXpReward`)

```js
/**
 * @typedef {Object} CalculateXpRewardParams
 * @property {Object} [question]           // Question domain object or legacy mission
 * @property {Object} submissionResult   // Result returned by submissionService
 * @property {boolean} isFirstCompletion // Whether this attempt is the first successful completion
 * @property {number} [hintsUsed=0]      // Number of hints used by learner
 */

/**
 * @typedef {Object} XpRewardCalculationResult
 * @property {number} xpAwarded          // Actual XP awarded (0 if not first completion or failed)
 * @property {number} baseXp             // Base XP defined for the question
 * @property {boolean} isFirstCompletion // Echo of first completion state
 * @property {string} reason             // Reason code (e.g., 'FIRST_COMPLETION', 'ALREADY_COMPLETED', 'ATTEMPT_FAILED')
 */
```

### Reward Formula Rules:
- **Failed Attempt (`!isCorrect`)**: `xpAwarded = 0`, `reason = 'ATTEMPT_FAILED'`.
- **Already Completed (`!isFirstCompletion`)**: `xpAwarded = 0`, `reason = 'ALREADY_COMPLETED'`.
- **First Successful Completion (`isCorrect && isFirstCompletion`)**:
  - `baseXp`: Resolved from `question.rewards.baseXp` $\rightarrow$ `question.xp` $\rightarrow$ default `50`.
  - `hintPenalty`: Resolved from `question.rewards.hintPenalty` $\rightarrow$ default `0` (or `10` per hint if specified).
  - `xpAwarded`: `Math.max(0, baseXp - hintsUsed * hintPenalty)`.
  - `reason`: `'FIRST_COMPLETION'`.

---

## 3. Idempotent XP Ledger (`applyXpTransaction`)

Every learner possesses an XP ledger (`LearnerXpRecord`):

```js
/**
 * @typedef {Object} LearnerXpTransaction
 * @property {string} transactionId // Unique ID `${learnerId}:${contentId}:${attemptId}`
 * @property {string} learnerId
 * @property {string} contentId
 * @property {string} attemptId
 * @property {number} xpAmount
 * @property {string} reason
 * @property {string} awardedAt
 */

/**
 * @typedef {Object} LearnerXpRecord
 * @property {string} learnerId
 * @property {number} totalXp
 * @property {LearnerXpTransaction[]} history
 */
```

### Idempotency Guarantee:
1. When `awardXp` is invoked for a given `learnerId` and `contentId`:
2. `progressService` checks if `learnerId:contentId` was already completed.
3. If previously completed, `isFirstCompletion = false`, resulting in `xpAwarded = 0`.
4. If not previously completed, `isFirstCompletion = true`, `xpAwarded > 0`, transaction is created and appended to `history`, and `totalXp` is updated.
5. Re-transmitting or retrying the attempt with the same or different `attemptId` will never duplicate XP.


--- Content of docs/agent/SUBMISSION_BINDING.md ---

# Question Submission Binding Specification

This document details how the `Question` domain entity connects to the `SubmissionService` and underlying evaluators (`checkExcelAnswer`, `evaluateSqlResult`).

---

## Evaluation Flow & Purity

```
┌────────────────────────────────────────────────────────┐
│ Learner / Workspace UI                                 │
│ Calls submissionService.submit({                       │
│   questionId: 'q-001',                                 │
│   investigationId: 'inv-001',                          │
│   tool: 'excel',                                       │
│   answer: { formula: '=SUM(C2:C5)' },                  │
│   clientAttemptId: 'attempt-123'                       │
│ })                                                     │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ SubmissionService                                      │
│ - Identifies Question & resolves legacy Mission/Config │
│ - Prevents duplicate in-flight requests                │
│ - Idempotently caches responses by clientAttemptId     │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Pure Evaluators                                        │
│ - checkExcelAnswer(userFormula, expectedConfig)        │
│ - evaluateSqlResult(actualResult, expectedConfig)      │
│ - NO side effects, NO learner progress state mutation  │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Deterministic SubmissionResult                         │
│ Returns: {                                             │
│   attemptId, questionId, investigationId,              │
│   isCorrect, score, stepCompleted, potentialXp, ...    │
│ }                                                      │
└────────────────────────────────────────────────────────┘
```

---

## Entity Identity Resolution in Submissions

The `submissionService` accepts either `questionId` or legacy `missionId` (or both):

| Request Identifiers | Resolved Entities | Return Attributes in `SubmissionResult` |
| :--- | :--- | :--- |
| `{ questionId: 'q-001' }` | `questionId: 'q-001'`, `investigationId: 'inv-001'`, `legacyMissionId: 'mission-001'` | `questionId: 'q-001'`, `investigationId: 'inv-001'` |
| `{ missionId: 'mission-001' }` | `questionId: 'q-001'`, `investigationId: 'inv-001'`, `legacyMissionId: 'mission-001'` | `questionId: 'q-001'`, `investigationId: 'inv-001'` |

---

## Architectural Guarantees & Acceptance Criteria
- **Pure Evaluator**: Evaluators take answer inputs + checker configs and return boolean/score feedback without reading or writing database / local user progress.
- **Idempotency & Duplicate Prevention**: In-flight submissions with identical `clientAttemptId` return `DUPLICATE_ATTEMPT` error; completed submissions return cached result.
- **Retryability**: Learners can submit new attempts anytime using a unique `clientAttemptId`.
- **Backward Compatibility**: Existing Excel and SQL mission components pass `missionId` without breaking.
