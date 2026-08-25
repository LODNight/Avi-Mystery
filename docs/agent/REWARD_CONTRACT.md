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
