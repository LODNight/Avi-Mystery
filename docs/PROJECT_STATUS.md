# Trạng Thái Dự Án Avi-Mystery

> **Cập nhật lần cuối:** 25/08/2026
> **Nguồn trạng thái task:** [`agent/CURRENT_TASK.md`](./agent/CURRENT_TASK.md)

---

## 1. Tổng Quan Tiến Độ Dự Án

* **Phân khúc Kiến trúc:** Tái cấu trúc thành công từ Monolithic `Mission`/`Step` sang Domain-Driven Architecture (`Course` -> `Phase` -> `Chapter` -> `Investigation` -> `Question`).
* **Sprint Hoàn Thành:** Sprint 1–6 (100% Core Vertical Slices, Content/Dataset Decoupling, Learning Map Domain & Mastery Progress Architecture).
* **Sprint Hiện Tại:** Sprint 7 — Learner Engagement & Practice Engine (`PLANNED`).
* **Step Đã Hoàn Thành Trong Sprint 6:**
  - `Step 6.1` — Learning Map Domain Adapter (`DONE`).
  - `Step 6.2` — Learning Map UX Refactor (`DONE`).
  - `Step 6.3` — Practice Engine & Mastery Integration (`DONE`).
* **Trạng thái Sprint:** `SPRINT 6 COMPLETED (STEPS 6.1, 6.2 & 6.3 HOÀN THÀNH 100%)`.

---

## 2. Bảng Trạng Thái Sprint 6 (Game Progress & Progression Architecture)

| Step | Khu vực | Trọng tâm | Tính năng trong Step | Trạng thái |
|---|---|---|---|---|
| **6.1** | `MAP` | Primary | Learning Map Domain Adapter (`learningMapAdapter.js`) | `DONE` |
| **6.2** | `MAP-UX` | Primary | Learning Map UX Refactor (Phase Navigation Tabs & Journey View) | `DONE` |
| **6.3** | `MST` | Primary | Practice Engine & Mastery Tracking Integration (`useProgress.js`, `masteryEvaluator.js`) | `DONE` |

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
| `MAP-ADP-6.1` | `MAP` | Map | Learning Map Domain Adapter (`learningMapAdapter.js`) | `CURRENT` | Sprint 6 | Pass | `src/domain/learningMap/learningMapAdapter.js` |
| `MAP-UX-6.2` | `MAP` | Map | Learning Map UX Refactor (Multi-Phase Journey Tabs) | `CURRENT` | Sprint 6 | Pass | `src/pages/learner/LearningMapPage.jsx` |
| `MST-ENG-6.3` | `MST` | Mastery | Practice Engine & Mastery Integration (`useProgress.js`, Skill Mastery Summary Card) | `CURRENT` | Sprint 6 | Pass | `src/hooks/useProgress.js` |
| `EXC-QST-6.4` | `LRN` | Content | Excel Questions & Checker Sync (Missions 001–009) | `CURRENT` | Sprint 6 | Pass | `src/services/mock/mockSubmissionService.js` |
