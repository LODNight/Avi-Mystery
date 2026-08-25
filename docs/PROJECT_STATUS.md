# Trạng Thái Dự Án Avi-Mystery

> **Cập nhật lần cuối:** 25/08/2026
> **Nguồn trạng thái task:** [`agent/CURRENT_TASK.md`](./agent/CURRENT_TASK.md)

---

## 1. Tổng Quan Tiến Độ Dự Án

* **Phân khúc Kiến trúc:** Tái cấu trúc thành công từ Monolithic `Mission`/`Step` sang Domain-Driven Architecture (`Course` -> `Phase` -> `Chapter` -> `Investigation` -> `Question`).
* **Sprint Hoàn Thành:** Sprint 1–5 (100% Core Vertical Slices & Content/Dataset Decoupling).
* **Sprint Hiện Tại:** Sprint 6 — Game Progress & Gamification Layer (`PLANNED`).
* **Step Kế Tiếp:** Step 6.1 — Deterministic Leveling Engine & XP Ledger UI (`PLANNED`).
* **Trạng thái Sprint:** `SPRINT 5 HOÀN THÀNH (100% STEPS 5.1 -> 5.8 PASSED)`.

---

## 2. Bảng Trạng Thái Sprint (Sprint 5 Hoàn Thành)

| Step | Khu vực | Trọng tâm | Tính năng trong Step | Trạng thái |
|---|---|---|---|---|
| **5.1** | `DATA` | Primary | Dataset Domain Contract & Service Binding (`datasetService`) | `DONE` |
| **5.2** | `CNT` | Primary | Course / Phase / Chapter Content Hierarchy Contract (`contentService`) | `DONE` |
| **5.3** | `CNT` | Primary | Investigation Domain Contract & Legacy Mission Mapping (`investigationService`) | `DONE` |
| **5.4** | `CNT` | Primary | Question Domain Contract (`questionService`) | `DONE` |
| **5.5** | `LRN-SUB` | Primary | Question Submission Binding (`submissionService` integration) | `DONE` |
| **5.6** | `LRN-PRG` | Primary | Learner Progress Contract (`learnerProgress`, `progressService`) | `DONE` |
| **5.7** | `RWD` | Primary | XP Reward Integration & Idempotent Ledger (`rewardEvaluator`) | `DONE` |
| **5.8** | `MST` | Primary | Completion vs Mastery Foundation (`masteryEvaluator`) | `DONE` |

---

## 3. Feature Coverage Matrix (Architecture Alignment)

| ID | Area | Module | Feature | Architecture Status | Implemented Sprint | Test Status | Evidence |
|---|---|---|---|---|---|---|---|
| `SHR-AUTH-001` | `SHR` | Auth | Phân quyền RBAC Guard (`RequireAuth`, `RequireLearner`, `RequireAdmin`) | `CURRENT` | Sprint 1 | Pass | `src/app/router/index.jsx` |
| `SHR-AUTH-002` | `SHR` | Auth | Design System Detective Amber (Light/Dark Theme Toggle) | `CURRENT` | Sprint 1 | Pass | `src/app/layouts/LearnerLayout.jsx` |
| `SHR-UI-001` | `SHR` | UI | Standard UI Components (`Button`, `Card`, `Input`, `Badge`) | `CURRENT` | Sprint 1 | Pass | `src/components/ui/` |
| `SHR-UI-002` | `SHR` | UI | Accessible Loading Skeletons (`aria-busy="true"`) | `CURRENT` | Sprint 1 | Pass | `src/components/ui/Skeleton.jsx` |
| `BE-COURSE-001` | `BE` | Course | Course Content Service Adapter (`Course` / `Phase` / `Chapter`) | `CURRENT` | Sprint 5 | Pass | `src/services/mock/mockContentService.js` |
| `DATA-REG-5.1` | `DATA` | Dataset | Independent Dataset Registry & Schema Binding (`datasetService`) | `CURRENT` | Sprint 5 | Pass | `src/services/mock/mockDatasetService.js` |
| `CNT-INV-5.3` | `CNT` | Content | Investigation Domain Contract & Legacy Mission Resolver | `CURRENT` | Sprint 5 | Pass | `src/domain/content/contentIdentity.js` |
| `CNT-QST-5.4` | `CNT` | Content | Question Domain Contract & Checker Configuration | `CURRENT` | Sprint 5 | Pass | `src/domain/content/questionDomain.js` |
| `LRN-SUB-5.5` | `LRN` | Submission | Question Submission Integration (`mockSubmissionService.js`) | `CURRENT` | Sprint 5 | Pass | `src/services/mock/mockSubmissionService.js` |
| `LRN-PRG-5.6` | `LRN` | Progress | Learner Progress State (`learnerProgress.js`, `progressService.js`) | `CURRENT` | Sprint 5 | Pass | `src/domain/progress/learnerProgress.js` |
| `RWD-XP-5.7` | `RWD` | Reward | Idempotent XP Reward Calculation & Ledger (`rewardEvaluator.js`) | `CURRENT` | Sprint 5 | Pass | `src/domain/reward/rewardEvaluator.js` |
| `MST-SKL-5.8` | `MST` | Mastery | Skill Mastery Foundation (`masteryEvaluator.js`) | `CURRENT` | Sprint 5 | Pass | `src/domain/mastery/masteryEvaluator.js` |
