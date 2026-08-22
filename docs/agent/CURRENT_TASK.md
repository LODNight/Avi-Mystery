# Current Task

## Identification

- Project: Avi-Mystery
- Sprint: 3
- Step: 3.6G
- Task ID: LRN-EXCEL-3.6G-STABILIZATION
- Status: DONE
- Primary Module: LRN-EXCEL
- Supporting Modules:
  - SHR
  - LRN-SUB
- Module document: [modules/LRN-EXCEL.md](./modules/LRN-EXCEL.md)

## Goal

Khép gate ổn định Sprint 3 sau Step 3.6: sửa regression của Excel mission validator, xác minh luồng diagnostic khi người dùng chỉ nhập `=`, xử lý các risk UI đã ghi nhận và đồng bộ tài liệu trước khi người dùng quyết định kích hoạt Sprint 4.

Không mở rộng sang Sprint 4 (SQL), không thay đổi Submission Contract và không trao XP.

## In Scope

- Audit và ổn định `validateGlobalExcelMission`; giữ evaluator chỉ đánh giá và trả feedback, không trao XP.
- Bảo đảm Run với `=` trả lỗi cú pháp thống nhất từ `analyzeExcelFormula`, không báo thành công.
- Xóa inline hint stale khi Reset hoặc đổi mission.
- Chuẩn hóa wording `potentialXp` thành “Phần thưởng dự kiến”.
- Sửa route active matching theo segment boundary và bổ sung regression test.
- Bổ sung test cho các risk trên và chạy targeted/full regression, lint, build.
- Đồng bộ tài liệu tiến độ và Completion Report bằng kết quả thực chạy.

## Preserved Step 3.6 Scope

- Tinh chỉnh CSS Root Variables cho Light Mode (`index.css`): background xám nhạt ấm (`#fafaf9`), card trắng (`#ffffff`), viền rõ ràng (`#e7e5e4` / `#d6d3d1`).
- Chuẩn hóa nút phụ (Secondary Actions: Chạy thử công thức, Gợi ý, Đặt lại) trong `ActionToolbar` về tone trung tính (neutral gray / outline) ở Light Mode để nút Nộp bài nổi bật làm Primary CTA.
- Tăng độ tương phản của thanh nhập công thức `FormulaBar` và viền nhận biết ô tính mục tiêu ở Light Mode.
- Làm sạch bảng dữ liệu `SpreadsheetGrid`: Header tên cột xám trung tính nhạt (`stone-100` / `stone-200`), phân biệt rõ các ô Target, Selected, Editable và Grid Lines.
- Cân bằng thị giác thẻ Promo Streak trong Sidebar `LearnerLayout` ở Light Mode (dùng nền thẻ surface nhạt kèm viền & icon cam thay vì dải màu cam đậm lấn át).
- Đảm bảo Accessibility (độ tương phản chữ, focus-visible) và chạy regression test cho cả Light Mode và Dark Mode.
- Cập nhật tài liệu tiến độ (`CURRENT_TASK.md`, `ROADMAP.md`, `PROJECT_STATUS.md`, `CHECKLIST.md`).

## Out of Scope

- Submission contract, mock service hoặc evaluator changes ngoài phạm vi ổn định `validateGlobalExcelMission` đã khai báo.
- Chức năng trao XP/Streak thật (game progress thuộc Sprint 5).
- SQL Sandbox, Admin Content Builder, Backend API thật.
- Thêm các thư viện ngoài.

## Allowed Write Paths

- `src/styles/index.css`
- `src/components/excel/ActionToolbar.jsx`
- `src/components/excel/ActionToolbar.test.jsx`
- `src/components/excel/FormulaBar.jsx`
- `src/components/excel/FormulaBar.test.jsx`
- `src/components/excel/SpreadsheetGrid.jsx`
- `src/components/excel/SpreadsheetGrid.test.jsx`
- `src/components/excel/HintPanel.jsx`
- `src/components/excel/HintPanel.test.jsx`
- `src/components/excel/MissionResultModal.jsx`
- `src/app/layouts/LearnerLayout.jsx`
- `src/app/layouts/LearnerLayout.test.jsx`
- `src/pages/learner/ExcelMissionPage.jsx`
- `src/pages/learner/ExcelMissionPage.test.jsx`
- `src/utils/excelChecker.js`
- `src/utils/excelChecker.test.js`
- `docs/agent/CURRENT_TASK.md`
- `docs/agent/UI_CHANGE_INVENTORY.md`
- `docs/agent/PROJECT_CONTEXT.md`
- `docs/agent/MODULE_MAP.md`
- `docs/agent/TEST_STRATEGY.md`
- `docs/agent/modules/LRN-EXCEL.md`
- `docs/agent/modules/LRN-SUB.md`
- `README.md`
- `docs/PROJECT_STATUS.md`
- `docs/ROADMAP.md`
- `docs/CHECKLIST.md`
- `docs/BACKLOG.md`
- `docs/TEST_REPORT.md`
- `docs/DOUBLE_CHECK_REPORT.md`

## Read-only Paths

- `src/services/contracts/`
- `src/services/mock/`
- `src/app/router/`
- `src/components/ui/`
- `src/mocks/data/`

## Forbidden Paths

- `src/pages/admin/`
- `src/services/api/`
- `package.json`, `package-lock.json`
- `.git/`

## Acceptance Criteria

- [x] Nhập `=` rồi Run trả `FORMULA_EMPTY_EXPRESSION` và feedback lỗi cú pháp, không trả success.
- [x] Global validator có test cho thiếu công thức, lỗi cú pháp, thiếu fill-down và thành công.
- [x] Reset hoặc đổi mission không giữ inline hint stale.
- [x] Wording XP chỉ mô tả “Phần thưởng dự kiến”, không ngụ ý XP đã trao.
- [x] Sidebar active state chỉ match đúng route segment và có regression test.
- [x] Targeted tests, full regression và production build pass; giới hạn lint được ghi rõ.
- [x] Tài liệu Sprint 3 thống nhất theo kết quả kiểm chứng thực tế.

## Test Commands

```bash
node ./node_modules/vitest/vitest.mjs run src/utils/excelChecker.test.js src/components/excel/ActionToolbar.test.jsx src/components/excel/FormulaBar.test.jsx src/components/excel/SpreadsheetGrid.test.jsx src/components/excel/HintPanel.test.jsx src/components/excel/MissionResultModal.test.jsx src/app/layouts/LearnerLayout.test.jsx src/pages/learner/ExcelMissionPage.test.jsx
node ./node_modules/vitest/vitest.mjs run
node ./node_modules/vite/bin/vite.js build
```

## Completion Report

1. **Scope:** ổn định formula/global diagnostics, hint lifecycle/a11y, route boundary, responsive CTA và đồng bộ tài liệu Sprint 3.
2. **Source/Test files:** `excelChecker*`, `ExcelMissionPage*`, `ActionToolbar*`, `HintPanel*`, `LearnerLayout*`.
3. **Verification:** targeted 8 files/73 tests pass; full 20 files/133 tests pass; production build pass; Browser 390/768/1440px, Light/Dark, `=`, focus/Escape pass và không có console error.
4. **Acceptance Criteria:** 7/7 đạt.
5. **Chưa làm:** chưa kích hoạt Sprint 4; không thêm visual regression/E2E framework.
6. **Risk/tooling:** global npm thiếu `npm-cli.js`; ESLint 9 chưa có `eslint.config.*`, nên lint project-level chưa khả dụng. React Router future-flag và `AuthProvider` act warning vẫn là non-failing technical debt.
