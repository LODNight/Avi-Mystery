# AVI-MYSTERY — CURRENT TASK

## Primary Module
- **Module Name**: `Onboarding / First-Run Experience`
- **Primary Path**: `src/features/onboarding/`
- **Current Sprint**: **SPRINT 6.5 — Learner Onboarding & First-Run Experience**
- **Current Step**: **STEP 6.6 — Dashboard Deep Guided Tour Refinement (DONE — SPRINT 6.5 & 6.6 COMPLETED)**

## Completed Objectives (Step 6.6 Sub-steps)
1. **Step 6.6.1 — Spotlight Core Engine Fix** *(DONE)*: Chuẩn hóa prop alias (`target`/`targetId`, `body`/`content`), tự động gắn `#`, cuộn trang `scrollIntoView` mượt và định vị `targetRect` chính xác.
2. **Step 6.6.2 — Layout Target ID Mapping** *(DONE)*: Gắn đầy đủ 6 target IDs trên `DashboardPage.jsx`.
3. **Step 6.6.3 — Enriched 6-Step Deep Tour Content** *(DONE)*: Cập nhật `dashboardTourContent.js` thành tour 6 bước sâu sắc giải thích toàn bộ tính năng Dashboard.
4. **Step 6.6.4 — Unit Test Suite** *(DONE)*: Mở rộng `dashboardTour.test.jsx` phủ cả 6 bước tour & kiểm tra prop aliases (6/6 tests PASS).
5. **Step 6.6.5 — Verification & Visual QA Pass** *(DONE)*: Vitest suite 97/97 tests PASS, giao diện mượt mà không lỗi.

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
