# UI Change Inventory

## Audit Information

- Project: Avi-Mystery
- Current Sprint: Sprint 3 — Excel Vertical Slice / UI Stabilization
- Current Step: Step 3.4E — Submission UI Stabilization (`READY` sau audit)
- Audit date: 21/08/2026
- Compared against: working tree so với `HEAD` (`c7fef8b`); lịch sử tham chiếu `c7fef8b`, `9802cdc`, `a103cc0`
- Audit status: Complete — documentation only

Không có một commit duy nhất được xác nhận là baseline trước toàn bộ thay đổi UI. Vì vậy audit không suy đoán nguồn gốc xa hơn ba commit gần nhất và trạng thái working tree hiện tại.

## Change Classification

| ID | Thay đổi | Màn hình | Module | Shared? | Logic affected? | Classification | Status | Evidence |
|---|---|---|---|---|---|---|---|---|
| `UI-001` | Inline validation/incorrect/service error và Retry trong vùng Submission | Excel Mission Workspace | `LRN-SUB` | No | Yes | `3.4E` | Tested | `src/pages/learner/ExcelMissionPage.jsx`; `ExcelMissionPage.test.jsx`; commit `9802cdc` |
| `UI-002` | Success-only completion modal, potential XP wording, focus/Escape/restore focus | Excel Mission Workspace | `LRN-SUB` | No | Yes | `3.4E` | Tested | `src/components/excel/MissionResultModal.jsx`; `MissionResultModal.test.jsx`; commits `a103cc0`, `9802cdc` |
| `UI-003` | Run/Submit loading, disabled state và phân cấp màu nút thao tác | Excel Mission Workspace | `LRN-SUB` | No | Yes | `3.4E` | Existing | `src/components/excel/ActionToolbar.jsx`; `ActionToolbar.test.jsx`; commits `9802cdc`, `c7fef8b` |
| `UI-004` | Formula diagnostic accessible và nhóm feedback phía trên Formula Bar | Excel Mission Workspace | `LRN-SUB` | No | Yes | `3.4E` | Tested | `src/components/excel/FormulaBar.jsx`; `src/pages/learner/ExcelMissionPage.jsx`; commit `c7fef8b` |
| `UI-005` | Chống double submit, giữ answer khi sai, retry và unmount guard | Excel Mission Workspace | `LRN-SUB` | No | Yes | `3.4E` | Tested | `src/pages/learner/ExcelMissionPage.test.jsx`; `src/services/mock/mockSubmissionService.test.js`; commit `9802cdc` |
| `UI-006` | Objective, Action Toolbar, feedback và Formula Bar được gom lại thành hierarchy mới | Excel Mission Workspace | `LRN-EXCEL` | No | No | `3.5` | Partial | `src/pages/learner/ExcelMissionPage.jsx`; commit `c7fef8b` |
| `UI-007` | Header Excel A/B/C, dataset row, numeric alignment và target-cell badge được restyle | Excel Mission Workspace | `LRN-EXCEL` | No | No | `3.5` | Partial | `src/components/excel/SpreadsheetGrid.jsx`; commit `c7fef8b` |
| `UI-008` | Learner Sidebar active state cho route con và `/missions/*` | Toàn bộ Learner layout | `SHR` | Yes | Yes | `3.5` | Partial | `src/app/layouts/LearnerLayout.jsx`; commit `c7fef8b` |
| `UI-009` | Hint Panel thành non-modal side drawer, không backdrop | Excel Mission Workspace | `LRN-EXCEL` | No | Yes | `3.5` | Partial | working tree: `src/pages/learner/ExcelMissionPage.jsx`; `src/components/excel/HintPanel.jsx` |
| `UI-010` | Hint header hai dòng, trạng thái card, XP badge và footer alignment | Excel Mission Workspace | `LRN-EXCEL` | No | No | `3.5` | Partial | working tree: `src/components/excel/HintPanel.jsx`; baseline tests tại `HintPanel.test.jsx` |
| `UI-011` | Gợi ý vừa mở được ghim inline dưới Formula Bar và có nút ẩn | Excel Mission Workspace | `LRN-EXCEL` | No | Yes | `3.5` | Partial | working tree: `FormulaBar.jsx`, `FormulaBar.test.jsx`, `ExcelMissionPage.jsx` |
| `UI-012` | `/profile` và `/achievements` đã có placeholder route | Learner placeholders | `GAME` | No | No | Future Sprint 5 | Planned — Early Prototype | `src/app/router/index.jsx` |
| `UI-013` | Admin content routes đã có placeholder | Admin placeholders | `ADM` | No | No | Future Sprint 6 | Planned — Early Prototype | `src/app/router/index.jsx` |
| `UI-014` | `/admin/analytics` đã có placeholder | Admin Analytics placeholder | `ANL` | No | No | Future Sprint 8 | Planned — Early Prototype | `src/app/router/index.jsx` |

## Step 3.4E Candidates

- Xác minh lại toàn bộ feedback region cho validation, incorrect, service error và retry.
- Xác minh Run/Submit loading và disabled state bằng integration test, không chỉ component tồn tại.
- Xác minh success modal trên keyboard/focus và responsive submission area.
- Giữ nguyên answer khi incorrect/service error và không tạo duplicate request.
- Chốt wording `potentialXp` là phần thưởng dự kiến; không dùng wording hàm ý XP đã được trao.

Các thay đổi trên nằm trực tiếp trong Submission & Feedback. Step 3.4 core có implementation/test, nhưng Step 3.4E vẫn phải chạy stabilization gate riêng trước khi đánh dấu hoàn thành.

## Step 3.5 Candidates

- `3.5A`: inventory và boundary trong tài liệu này; cần dùng làm input cho task thực thi riêng.
- `3.5B`: đánh giá khả năng tái sử dụng Button/feedback/modal/card; không tự chuyển feature-specific Excel component sang shared.
- `3.5C`: Learner Sidebar active state, Mission workspace hierarchy và Hint side drawer.
- `3.5D`: desktop/tablet/mobile, keyboard, focus, contrast và non-modal drawer behavior.
- `3.5E`: regression Sprint 1–3.4 và user-test readiness.

## Future Sprint Candidates

- `/profile`, `/achievements`: Early Prototype cho Sprint 5; chưa có Game Progress domain.
- Admin course/chapter/mission/dataset placeholders: Early Prototype cho Sprint 6; chưa có Content Builder.
- `/admin/analytics`: Early Prototype cho Sprint 8; chưa có analytics implementation.
- Không phát hiện SQL learner UI trong audit; Sprint 4 vẫn chưa kích hoạt.

## Business Flow Changes

- Working tree không thay đổi route, service, submission contract hoặc package.
- Sidebar active-state logic mới ánh xạ `/missions/*` về mục `/map`; đây là navigation-state behavior, không thay route nhưng cần regression test ở Step 3.5C.
- Inline unlocked hint thêm state/UI behavior trong `ExcelMissionPage`; không đổi contract nhưng cần test tích hợp unlock → inline hint → reset/mission change.
- Submission contract change trong commit `9802cdc` đã được chấp nhận và thuộc Step 3.4 core; audit này không sửa `CONTRACTS.md`.

## Regression Risks

- `activeUnlockedHint` chưa được xóa rõ ràng khi Reset hoặc khi đổi mission; có nguy cơ hiển thị hint stale.
- Fallback hint text đang được dựng trong `ExcelMissionPage` song song với normalization trong `HintPanel`, có nguy cơ lệch nội dung.
- Test mới chỉ cover render/close inline hint ở `FormulaBar`; chưa cover integration mở hint từ page.
- Hint side drawer chưa có test cho mobile width, keyboard close, focus behavior hoặc tương tác nền.
- `Thưởng Net` có thể bị hiểu là XP đã trao, trong khi contract chỉ cho phép `potentialXp`.
- Sidebar active matching dùng `startsWith`; chưa có test route boundary cho các path gần giống nhau.
- Spreadsheet/Grid và mission hierarchy là visual changes nhưng chưa có visual regression hoặc E2E coverage.

## Open Questions

- Có đổi toàn bộ wording `Thưởng Net` thành `Phần thưởng dự kiến` trong Step 3.4E để khớp contract hay không?
- Inline hint vẫn nên thuộc `LRN-EXCEL`; chỉ promote thành shared component khi có consumer thứ hai. Người dùng có đồng ý boundary này không?
- Step 3.5 có được phép chuẩn hóa `LearnerLayout` và Mission layout trong cùng một task, hay cần tách `3.5B` và `3.5C` thành hai Current Task nối tiếp?
