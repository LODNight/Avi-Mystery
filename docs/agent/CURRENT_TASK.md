# Current Task

## Identification

- Project: Avi-Mystery
- Sprint: 3
- Step: 3.4
- Task ID: LRN-EXCEL-3.4-FORMULA-DIAGNOSTICS
- Status: DONE
- Primary Module: LRN-EXCEL
- Supporting Module: LRN-SUB, SHR
- Module document: [modules/LRN-EXCEL.md](./modules/LRN-EXCEL.md)

## Goal

Chuẩn hóa validation/evaluation công thức Excel để luồng nhập, Run và Submit dùng chung diagnostic result; công thức rỗng như `=` và các lỗi cú pháp/liên quan không được báo thành công.

Không tự chuyển sang Sprint 4. Chỉ đánh dấu `DONE` khi toàn bộ Acceptance Criteria và regression gate đạt.

## In Scope

- Structured formula diagnostic với code/message ổn định.
- Phân biệt cú pháp hợp lệ, biểu thức rỗng, thiếu dấu `=`, ngoặc lỗi, hàm/toán tử không hỗ trợ, tham chiếu lỗi và chia cho 0.
- Đồng bộ feedback khi nhập, Apply/Enter, Run và Submit.
- Giữ API `evaluateFormulaValue` tương thích cho consumer hiện có.
- Unit/component/integration tests và full regression.

## Out of Scope

- Không xây SQL Engine.
- Không làm Admin Content Builder.
- Không xây FastAPI hoặc PostgreSQL.
- Không thay Mock bằng API thật.
- Không cộng XP vào tài khoản.
- Không xây leveling, streak hoặc achievement.

## Allowed Write Paths

Các đường dẫn dưới đây dành cho implementation Step 3.4 hiện tại:

- `src/utils/excelChecker.js`
- `src/utils/excelChecker.test.js`
- `src/services/contracts/submissionService.js`
- `src/services/mock/mockSubmissionService.js`
- `src/services/mock/mockSubmissionService.test.js`
- `src/pages/learner/ExcelMissionPage.jsx`
- `src/pages/learner/ExcelMissionPage.test.jsx`
- `src/components/excel/FormulaBar.jsx`
- `src/components/excel/FormulaBar.test.jsx`
- `src/components/excel/ActionToolbar.jsx`
- `src/components/excel/SpreadsheetGrid.jsx`
- `src/app/layouts/LearnerLayout.jsx`
- `docs/agent/CURRENT_TASK.md`
- `docs/agent/CONTRACTS.md`
- `docs/agent/modules/LRN-EXCEL.md`
- `docs/agent/modules/LRN-SUB.md`
- `docs/agent/TEST_STRATEGY.md`
- `README.md`
- `docs/CHECKLIST.md`
- `docs/PROJECT_STATUS.md`
- `docs/ROADMAP.md`
- `docs/TEST_REPORT.md`
- `docs/avi-mystery-roadmap-review-sprint-3-8.md`

## Read-only Paths

- `src/services/contracts/missionService.js`
- `src/services/mock/mockMissionService.js`
- `src/services/mock/mockAuthService.js`
- `src/services/index.js`
- `src/mocks/data/missions.json`
- `src/mocks/data/datasets.json`
- `src/mocks/data/steps.json`
- `src/app/router/index.jsx`

## Forbidden Paths

- `src/pages/admin/`
- `src/services/api/`
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
- [x] `=` và biểu thức rỗng không được đánh giá thành `0`/success.
- [x] Diagnostic code/message ổn định và có thể mở rộng.
- [x] Nhập, Apply/Enter, Run và Submit dùng chung evaluator result.
- [x] Lỗi cú pháp/liên quan hiển thị inline hoặc notification đúng loại.
- [x] Công thức hợp lệ vẫn tính đúng và luồng Submit không regression.
- [x] Test liên quan pass.
- [x] Full regression pass.

## Test Commands

```bash
npm test -- --run src/utils/excelChecker.test.js src/services/mock/mockSubmissionService.test.js src/pages/learner/ExcelMissionPage.test.jsx src/components/excel/FormulaBar.test.jsx
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

- Step 3.4 chính đã hoàn thành; follow-up này sửa bug formula diagnostics mà không thay đổi reward/service boundary.
- Sprint 4 chưa được kích hoạt.

## Completion Report

- Files changed: `src/pages/learner/ExcelMissionPage.jsx`, `src/pages/learner/ExcelMissionPage.test.jsx`, `src/components/excel/SpreadsheetGrid.jsx`, `src/components/excel/ActionToolbar.jsx`, `src/components/excel/FormulaBar.jsx`, `src/app/layouts/LearnerLayout.jsx`, `docs/agent/CURRENT_TASK.md`, `docs/PROJECT_STATUS.md`, `docs/TEST_REPORT.md`.
- Tests executed: `npx vitest run` — Full regression 19 test files, 119/119 tests passed (100% pass rate).
- Acceptance Criteria passed: 8/8.
- UI/UX Refinement: Single inline diagnostic under FormulaBar triggered upon "Chạy thử"/"Nộp bài"; formula diagnostic text contrast enhanced in dark mode; Excel application header (A, B, C, D) visually distinguished from dataset Row 1; Sidebar Active State highlight added (vertical indicator bar + primary/amber glow + sub-route matching).
- Remaining work: None for Step 3.4.
- Risks: None. React Router future-flag warnings remain non-breaking.
