# UI Change Inventory

## Audit Information

- Project: Avi-Mystery
- Current Sprint: Sprint 3 — Excel Vertical Slice / UI Stabilization
- Current Step: Step 3.6G — Sprint 3 Stabilization (`DONE`)
- Audit date: 22/08/2026
- Compared against: working tree sau stabilization Step 3.6G
- Audit status: Complete — code, automated regression và Browser verification

Không có một commit duy nhất được xác nhận là baseline trước toàn bộ thay đổi UI. Vì vậy audit không suy đoán nguồn gốc xa hơn ba commit gần nhất và trạng thái working tree hiện tại.

## Change Classification

| ID | Thay đổi | Màn hình | Module | Shared? | Logic affected? | Classification | Status | Evidence |
|---|---|---|---|---|---|---|---|---|
| `UI-001` | Inline validation/incorrect/service error và Retry trong vùng Submission | Excel Mission Workspace | `LRN-SUB` | No | Yes | `3.4E` | Tested | `src/pages/learner/ExcelMissionPage.jsx`; `ExcelMissionPage.test.jsx`; commit `9802cdc` |
| `UI-002` | Success-only completion modal, potential XP wording, focus/Escape/restore focus | Excel Mission Workspace | `LRN-SUB` | No | Yes | `3.4E` | Tested | `src/components/excel/MissionResultModal.jsx`; `MissionResultModal.test.jsx`; commits `a103cc0`, `9802cdc` |
| `UI-003` | Run/Submit loading, disabled state và phân cấp màu nút thao tác | Excel Mission Workspace | `LRN-SUB` | No | Yes | `3.4E` | Existing | `src/components/excel/ActionToolbar.jsx`; `ActionToolbar.test.jsx`; commits `9802cdc`, `c7fef8b` |
| `UI-004` | Formula diagnostic accessible và nhóm feedback phía trên Formula Bar | Excel Mission Workspace | `LRN-SUB` | No | Yes | `3.4E` | Tested | `src/components/excel/FormulaBar.jsx`; `src/pages/learner/ExcelMissionPage.jsx`; commit `c7fef8b` |
| `UI-005` | Chống double submit, giữ answer khi sai, retry và unmount guard | Excel Mission Workspace | `LRN-SUB` | No | Yes | `3.4E` | Tested | `src/pages/learner/ExcelMissionPage.test.jsx`; `src/services/mock/mockSubmissionService.test.js`; commit `9802cdc` |
| `UI-006` | Objective, Action Toolbar, feedback và Formula Bar được gom lại thành hierarchy mới | Excel Mission Workspace | `LRN-EXCEL` | No | No | `3.5` | Verified | `ExcelMissionPage.jsx`; Browser 390/768/1440px |
| `UI-007` | Header Excel A/B/C, dataset row, numeric alignment và target-cell badge được restyle | Excel Mission Workspace | `LRN-EXCEL` | No | No | `3.5` | Verified | `SpreadsheetGrid.test.jsx`; Browser Light/Dark |
| `UI-008` | Learner Sidebar active state cho route con và `/missions/*` | Toàn bộ Learner layout | `SHR` | Yes | Yes | `3.5` | Tested | `LearnerLayout.test.jsx`; segment boundary covered |
| `UI-009` | Hint Panel thành non-modal side drawer, không backdrop | Excel Mission Workspace | `LRN-EXCEL` | No | Yes | `3.5` | Tested | mobile width, focus, Escape và restore focus verified |
| `UI-010` | Hint header hai dòng, trạng thái card, XP badge và footer alignment | Excel Mission Workspace | `LRN-EXCEL` | No | No | `3.5` | Verified | wording “Phần thưởng dự kiến”; Browser tablet |
| `UI-011` | Gợi ý vừa mở được ghim inline dưới Formula Bar và có nút ẩn | Excel Mission Workspace | `LRN-EXCEL` | No | Yes | `3.5` | Tested | unlock → inline → reset/mission change integration covered |
| `UI-012` | `/profile` và `/achievements` đã có placeholder route | Learner placeholders | `GAME` | No | No | Future Sprint 5 | Planned — Early Prototype | `src/app/router/index.jsx` |
| `UI-013` | Admin content routes đã có placeholder | Admin placeholders | `ADM` | No | No | Future Sprint 6 | Planned — Early Prototype | `src/app/router/index.jsx` |
| `UI-014` | `/admin/analytics` đã có placeholder | Admin Analytics placeholder | `ANL` | No | No | Future Sprint 8 | Planned — Early Prototype | `src/app/router/index.jsx` |

## Step 3.4E Completion

- Xác minh lại toàn bộ feedback region cho validation, incorrect, service error và retry.
- Xác minh Run/Submit loading và disabled state bằng integration test, không chỉ component tồn tại.
- Xác minh success modal trên keyboard/focus và responsive submission area.
- Giữ nguyên answer khi incorrect/service error và không tạo duplicate request.
- Chốt wording `potentialXp` là phần thưởng dự kiến; không dùng wording hàm ý XP đã được trao.

Các mục trên đã được xác minh và Step 3.4E đã hoàn thành. Submission Contract không thay đổi và UI chỉ mô tả `potentialXp` là phần thưởng dự kiến.

## Step 3.5 Completion

- `3.5A–E`: hoàn thành; các risk còn lại được khép trong Step 3.6G.

## Future Sprint Candidates

- `/profile`, `/achievements`: Early Prototype cho Sprint 5; chưa có Game Progress domain.
- Admin course/chapter/mission/dataset placeholders: Early Prototype cho Sprint 6; chưa có Content Builder.
- `/admin/analytics`: Early Prototype cho Sprint 8; chưa có analytics implementation.
- Không có SQL learner UI; Step 4.0 chỉ thêm engine/Worker và browser harness cô lập, không thêm product route/navigation.

## Business Flow Verification

- Working tree không thay đổi route, service contract hoặc package.
- Sidebar ánh xạ `/missions/*` về `/map` theo segment boundary và có unit test.
- Inline hint được xóa khi Reset/mission change và có integration test.
- Submission contract change trong commit `9802cdc` đã được chấp nhận và thuộc Step 3.4 core; audit này không sửa `CONTRACTS.md`.

## Remaining Risks

- Fallback hint text đang được dựng trong `ExcelMissionPage` song song với normalization trong `HintPanel`, có nguy cơ lệch nội dung.
- Repository chưa có framework visual regression/E2E; Step 3.6G đã bù bằng Browser check có kích thước 390/768/1440px.
- Global npm trên máy xác minh bị thiếu `npm-cli.js`; local Vitest/Vite chạy được. ESLint 9 chưa có `eslint.config.*`, nên lint project-level chưa phải gate khả dụng.

## Closed Decisions

- Wording dùng “Phần thưởng dự kiến”.
- Inline hint tiếp tục thuộc `LRN-EXCEL`; chỉ promote khi có consumer thứ hai.
- Step 4.0 đã đạt gate; Sprint 4 product implementation chỉ bắt đầu khi người dùng kích hoạt Step tiếp theo với Current Task mới.
