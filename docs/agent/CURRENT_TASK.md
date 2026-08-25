# Current Task

## Identification

- Project: Avi-Mystery
- Sprint: 5 (Content Domain & Dataset Decoupling)
- Step: 5.8 (Completion vs Mastery Foundation)
- Task ID: `MST-5.8`
- Status: `IN_PROGRESS`
- Primary Module: `MST` (Learner Mastery Domain & Progress Integration)

## Goal

Explicitly separate Completion from Mastery by establishing mastery-ready data structures and pure evaluation logic:
- **Completion** answers: "Has the learner completed this content?" (Keyed by `learnerId:contentId`).
- **Mastery** answers: "How well does the learner demonstrate the associated skill?" (Keyed by `learnerId:skillId`).
- Implement `LearnerMasteryRecord` schema and pure `evaluateSkillMastery` function.
- Support attempt history reference per skill assessment.
- Support skill association (`Question` references `skillId`).
- Do NOT implement a complex adaptive algorithm.
- Do NOT implement Practice Engine.
- Do NOT implement recommendations or analytics.

## Allowed Write Paths

- `src/domain/mastery/masteryEvaluator.js`
- `src/services/contracts/progressService.js`
- `src/services/mock/mockProgressService.js`
- `src/services/mock/mockProgressService.test.js`
- `src/domain/mastery/masteryContract.test.js`
- `docs/agent/MASTERY_CONTRACT.md`
- `docs/agent/CURRENT_TASK.md`

## Out of Scope (Preserved)

- Practice engine is NOT implemented.
- Recommendations engine is NOT implemented.
- Analytics dashboard is NOT built.
- Adaptive difficulty algorithms are NOT implemented.
- Learning Map UI is NOT modified.
- Admin UI is NOT built.

## Acceptance Criteria

- [ ] Completion state (`LearnerProgressRecord`) is explicitly separate from Mastery state (`LearnerMasteryRecord`).
- [ ] Mastery records are keyed by learner + skill identity (`learnerId:skillId`).
- [ ] `evaluateSkillMastery` calculates proficiency (`masteryScore`) deterministically without complex adaptive algorithms.
- [ ] Attempt history/reference is preserved per skill assessment.
- [ ] Existing completion, submission, and XP flows remain functional.
- [ ] Contract & unit tests added and verified.
