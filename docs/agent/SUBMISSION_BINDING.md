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
