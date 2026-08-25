# AVI-MYSTERY — CURRENT TASK

## Primary Module
- **Module Name**: `Onboarding / First-Run Experience`
- **Primary Path**: `src/features/onboarding/`
- **Current Sprint**: **SPRINT 6.5 — Learner Onboarding & First-Run Experience**
- **Current Step**: **STEP 6.6 — Dashboard Guided Tour (DONE — SPRINT 6.5 & 6.6 COMPLETED)**

## Completed Objectives (Sprint 6.5 & 6.6)
1. **Step 6.5.0 — First-Run UX Audit** *(DONE)*: UX audit & planning.
2. **Step 6.5.1 — First-Run State** *(DONE)*: `onboardingService.js`, 30/30 tests PASS.
3. **Step 6.5.2 — Welcome Gate UI** *(DONE)*: `WelcomeGatePage.jsx`, 2 routes mới, 11 tests PASS.
4. **Step 6.5.3 — Tutorial Case 0 Content** *(DONE)*: `tutorialCase0Content.js`, 27 tests PASS.
5. **Step 6.5.4 — Minimal Case 0 Workspace** *(DONE)*: `TutorialCase0Page.jsx`, mounted on `/onboarding/case-0`, spotlight IDs, 8 tests PASS.
6. **Step 6.5.5 — Guided Spotlight** *(DONE)*: `OnboardingSpotlight.jsx` pure React 4-step tour, highlight ring overlay, keyboard shortcuts, 7 tests PASS.
7. **Step 6.5.6 — Completion + Reward** *(DONE)*: `progressService.awardXp` +50 XP integration, idempotent ledger transaction, 9 tests PASS.
8. **Step 6.5.7 — Dashboard Handoff** *(DONE)*: Dashboard route guard for `NOT_STARTED` users + completion banner & replay CTA.
9. **Step 6.5.8 — Full Regression Test** *(DONE)*: `onboardingRegression.test.jsx` covering 7 key onboarding flows.
10. **Step 6.6 — Dashboard Guided Tour** *(DONE)*: `dashboardTourContent.js` & `dashboardTour.test.jsx` introducing 4 key Dashboard areas with automatic first-visit trigger and manual replay CTA.

## Allowed Write Paths
- `src/features/onboarding/`
- `src/services/index.js`
- `src/app/router/index.jsx`
- `src/features/auth/AuthPage.jsx`
- `docs/agent/CURRENT_TASK.md`
- `docs/CHECKLIST.md`
- `docs/PROJECT_STATUS.md`
- `docs/agent/UI_CHANGE_INVENTORY.md`

## Forbidden / Read-Only Paths
- `src/domain/**` — Không refactor domain trong Sprint 6.5
- `src/services/mock/mockSubmissionService.js` — Contract ổn định
- `src/utils/excelChecker.js`
- `src/workers/**`
- `src/mocks/data/missions.json` — Không thêm production data
- `src/pages/learner/SqlMissionPage.jsx` — Chỉ tái sử dụng
- `src/pages/learner/ExcelMissionPage.jsx` — Chỉ tái sử dụng

## Next Steps
- **Step 6.5.2**: Welcome Gate UI (`WelcomeGatePage.jsx`) — chưa có Case 0, chưa có spotlight.
- **Step 6.5.3**: Tutorial Case 0 Content (`tutorialCase0Content.js`).
- **Step 6.5.4**: Minimal Case 0 Workspace.
- **Step 6.5.5**: Guided Spotlight (3–5 steps, pure CSS/custom, no library).
- **Step 6.5.6**: Completion + Reward (+50 XP qua existing reward system).
- **Step 6.5.7**: Dashboard Handoff (CTA "Tiếp tục học").
- **Step 6.5.8**: Full regression test.
