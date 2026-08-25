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
