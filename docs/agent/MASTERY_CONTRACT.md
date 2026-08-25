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
