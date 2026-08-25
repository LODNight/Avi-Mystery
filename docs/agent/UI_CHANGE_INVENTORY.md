# UI Change Inventory & Architecture Alignment

> **Cập nhật lần cuối:** 24/08/2026
> **Mục tiêu:** Quản lý danh mục thay đổi giao diện UI, trạng thái verified và phân tầng theo các Sprint.
> **Trạng thái phân loại:** `CURRENT` (Đã có trong codebase), `PLANNED` (Kế hoạch sắp tới), `PROPOSED` (Định hướng tương lai).

---

## 1. 📋 UI Change Classification Table

| ID | Thay đổi Giao diện | Màn hình / Component | Module Ownership | Trạng thái Kiến trúc | Status | Verified Evidence |
|---|---|---|---|---|---|---|
| `UI-001` | Inline validation/incorrect/service error & Retry button | Excel Mission Workspace | `LRN-SUB` | `CURRENT` | Tested | `src/pages/learner/ExcelMissionPage.jsx` |
| `UI-002` | Victory Modal chúc mừng phá án, potential XP wording | Excel Mission Workspace | `LRN-SUB` | `CURRENT` | Tested | `src/components/excel/MissionResultModal.jsx` |
| `UI-003` | Action Toolbar buttons (Run / Submit) with loading state | Excel Mission Workspace | `LRN-SUB` | `CURRENT` | Tested | `src/components/excel/ActionToolbar.jsx` |
| `UI-004` | Formula diagnostic message bar above Formula Bar | Excel Mission Workspace | `LRN-SUB` | `CURRENT` | Tested | `src/components/excel/FormulaBar.jsx` |
| `UI-005` | Spreadsheet Grid interactive cell selection & formula entry | Excel Mission Workspace | `LRN-EXCEL` | `CURRENT` | Tested | `src/components/excel/SpreadsheetGrid.jsx` |
| `UI-006` | Hint Drawer non-blocking side panel & Pin-to-fx button | Excel Mission Workspace | `LRN-EXCEL` | `CURRENT` | Tested | `src/components/excel/HintPanel.jsx` |
| `UI-007` | Learner Layout Collapsible Sidebar & Detective Amber Theme | Learner App Shell | `SHR` | `CURRENT` | Tested | `src/app/layouts/LearnerLayout.jsx` |
| `UI-008` | Schema Browser Table/Column metadata view & sample rows | SQL Mission Workspace | `LRN-SQL` | `CURRENT` | Tested | `src/components/sql/SchemaBrowser.jsx` |
| `UI-009` | SQL Code Editor MVP with Ctrl+Enter & soft Tab 2-space | SQL Mission Workspace | `LRN-SQL` | `CURRENT` | Tested | `src/components/sql/SqlEditor.jsx` |
| `UI-010` | Query Result Viewer with client pagination & NULL badge | SQL Mission Workspace | `LRN-SQL` | `CURRENT` | Tested | `src/components/sql/ResultViewer.jsx` |
| `UI-011` | SQL Mission Shell with loader & isolated route | SQL Mission Workspace | `LRN-SQL` | `CURRENT` | Tested | `src/pages/learner/SqlMissionPage.jsx` |
| `UI-012` | Dynamic Learning Map node unlock & completion status | `LearningMapPage` | `GAME` | `PLANNED` | Planned | `Sprint 6` |
| `UI-013` | Level Up Popup Modal & Leveling animation | Learner App Shell | `GAME` | `PLANNED` | Planned | `Sprint 7` |
| `UI-014` | Learner Profile Page (`/profile`) & Achievements Grid | Learner App Shell | `GAME` | `PLANNED` | Planned | `Sprint 7` |
| `UI-015` | Admin Visual Investigation & Question Studio | Admin App Shell | `ADM` | `PROPOSED` | Proposed | `Sprint 8` |

---

## 2. 🛡 UI Architecture Guard Rules

1. **NO direct mock JSON imports in UI**: Mọi trang UI JSX tuyệt đối không import trực tiếp `.json` trong `src/mocks/data/` hoặc gọi trực tiếp `mockSubmissionService.js`. Mọi giao tiếp đi qua `src/services/index.js`.
2. **Wording Standard for Potential XP**: Giao diện UI chỉ sử dụng cụm từ *"Phần thưởng dự kiến"* (`potentialXp`) khi hiển thị thông tin bài tập. Tuyệt đối không dùng câu chữ hàm ý điểm XP đã được ghi nhận vào tài khoản khi `progressService` chưa chạy.
3. **Responsive Grid & WASM Cleanup**: Mọi màn hình workspace (Excel & SQL) bảo đảm hiển thị mượt trên 390px, 768px, 1440px và tự động cleanup Web Worker / memory timers khi unmount.
