# Current Task

## Identification

- Project: Avi-Mystery
- Sprint: 3
- Step: 3.4
- Task ID: LRN-SUB-3.4-IMPLEMENT
- Status: DONE
- Primary Module: LRN-SUB
- Supporting Module: SHR
- Module document: [modules/LRN-SUB.md](./modules/LRN-SUB.md)

## Goal

Hoàn thiện Submission Contract, Mock Submission Service và Feedback UI theo boundary đã duyệt cho Step 3.4.

Không tự chuyển sang Sprint 4. Chỉ đánh dấu `DONE` khi toàn bộ Acceptance Criteria và regression gate đạt.

## In Scope

- Submission contract dùng chung.
- Mock submission bất đồng bộ.
- Loading và chống double submit.
- Inline feedback cho dữ liệu sai.
- Success modal khi hoàn thành.
- Retry cho service error.
- Test cho đúng, sai, lỗi và retry.

## Out of Scope

- Không xây SQL Engine.
- Không làm Admin Content Builder.
- Không xây FastAPI hoặc PostgreSQL.
- Không thay Mock bằng API thật.
- Không cộng XP vào tài khoản.
- Không xây leveling, streak hoặc achievement.

## Allowed Write Paths

Các đường dẫn dưới đây dành cho implementation Step 3.4 hiện tại:

- `src/services/contracts/submissionService.js` — file mới được duyệt trong thư mục hiện có `src/services/contracts/`.
- `src/services/mock/mockSubmissionService.js`
- `src/services/mock/mockSubmissionService.test.js`
- `src/services/index.js`
- `src/pages/learner/ExcelMissionPage.jsx`
- `src/pages/learner/ExcelMissionPage.test.jsx`
- `src/components/excel/ActionToolbar.jsx`
- `src/components/excel/ActionToolbar.test.jsx`
- `src/components/excel/FormulaBar.jsx`
- `src/components/excel/FormulaBar.test.jsx`
- `src/components/excel/MissionResultModal.jsx`
- `src/components/excel/MissionResultModal.test.jsx`
- `docs/agent/CURRENT_TASK.md`
- `docs/agent/CONTRACTS.md`
- `docs/agent/modules/LRN-SUB.md`
- `docs/agent/modules/LRN-EXCEL.md`
- `docs/agent/modules/GAME.md`
- `docs/agent/TEST_STRATEGY.md`
- `docs/agent/PROJECT_CONTEXT.md`
- `docs/agent/MODULE_MAP.md`
- `docs/agent/DECISIONS.md`
- `README.md`
- `docs/BACKLOG.md`
- `docs/CHECKLIST.md`
- `docs/DECISIONS.md`
- `docs/PROJECT_STATUS.md`
- `docs/ROADMAP.md`
- `docs/TEST_REPORT.md`
- `docs/avi-mystery-roadmap-review-sprint-3-8.md`

## Read-only Paths

- `src/utils/excelChecker.js`
- `src/utils/excelChecker.test.js`
- `src/services/contracts/missionService.js`
- `src/services/mock/mockMissionService.js`
- `src/services/mock/mockAuthService.js`
- `src/mocks/data/missions.json`
- `src/mocks/data/datasets.json`
- `src/mocks/data/steps.json`
- `src/components/excel/SpreadsheetGrid.jsx`
- `src/app/router/index.jsx`

## Forbidden Paths

- `src/pages/admin/`
- `src/services/api/`
- `src/app/layouts/`
- `src/app/providers/`
- `src/features/auth/`
- `src/mocks/data/courses.json`
- `src/mocks/data/chapters.json`
- Mọi SQL engine/workspace path chưa tồn tại.
- Mọi backend/FastAPI/PostgreSQL path chưa tồn tại.
- `package.json`, `package-lock.json` và các file config dự án.

## Required Contracts

- Submission response có thể trả `potentialXp`, nhưng đây là phần thưởng chưa được trao.
- Submission không trực tiếp cập nhật XP.
- `run` không hoàn thành nhiệm vụ; chỉ `submit` mới có thể cập nhật trạng thái hoàn thành.
- Component không biết hoặc giữ đáp án chuẩn.
- Mock và API client phải triển khai cùng interface qua service gateway.

## Acceptance Criteria

- [x] Scope và đường dẫn đã được xác minh.
- [x] Service contract dùng chung được xác định.
- [x] Có loading và chống double submit.
- [x] Đúng, sai và service error có feedback riêng.
- [x] Câu trả lời không bị mất khi submit sai.
- [x] Không cộng XP trực tiếp.
- [x] Test liên quan pass.
- [x] Regression của luồng Sprint 1–3.3 pass.

## Test Commands

```bash
npm test -- --run src/services/mock/mockSubmissionService.test.js src/pages/learner/ExcelMissionPage.test.jsx src/components/excel/ActionToolbar.test.jsx src/components/excel/FormulaBar.test.jsx src/components/excel/MissionResultModal.test.jsx
npm test -- --run
```

## Stop Conditions

Dừng và báo người dùng nếu:

- Cần sửa Shared Contract ngoài file đã duyệt.
- Cần thêm package mới.
- Cần sửa module SQL, Admin hoặc Backend.
- Test cũ fail vì nguyên nhân ngoài module.
- Yêu cầu hiện tại mâu thuẫn với kiến trúc đã ghi nhận.

## Migration Notes

- Step 3.4 đã remediation xong: UI đi qua gateway, mock theo shared contract, không mutate XP và feedback đúng boundary.
- Các Markdown vận hành đã được đồng bộ ngày 21/08/2026 về trạng thái Step 3.4/Sprint 3 `DONE`; Sprint 4 chưa được kích hoạt.

## Completion Report

- Files changed: shared submission contract/gateway; mock submission service/tests; Excel submission page/tests; toolbar/modal/tests; tài liệu agent và status trackers trong Allowed Write Paths.
- Tests executed: targeted 5 files — 31/31 pass; full regression 19 files — 101/101 pass.
- Acceptance Criteria passed: 8/8.
- Remaining work: không còn hạng mục bắt buộc của Step 3.4; Sprint 4 chưa kích hoạt, reward/XP vẫn thuộc Sprint 5 và API thật thuộc Sprint 7.
- Risks: checker config mới được xác minh cho `mission-001`; mission khác trả `CONTENT_CONFIG_MISSING`. React Router future-flag warning và `AuthProvider` act warning vẫn tồn tại nhưng không làm test fail và ngoài scope.
