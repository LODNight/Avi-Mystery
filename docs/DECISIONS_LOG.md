

--- Content of docs/DECISIONS.md ---

# Nhật Ký Quyết Định Kiến Trúc (Architecture Decision Log - ADR)

---

## ADR-001: Lựa Chọn Stack Frontend (React + Vite + Tailwind CSS + Vitest)

* **Bối cảnh:** Dự án Avi-Mystery đòi hỏi giao diện học tập tương tác cao, mượt mà và linh hoạt trong thiết kế game hóa.
* **Quyết định:**
  - Sử dụng React 18 & Vite cho tốc độ build và Hot Module Replacement (HMR) cực nhanh.
  - Sử dụng Vanilla Tailwind CSS 3 cho Design System phong cách Detective Amber.
  - Sử dụng Vitest + React Testing Library để viết unit và component tests.
* **Trạng thái:** `CURRENT` (Đã áp dụng từ Sprint 1).

---

## ADR-002: Kiến Trúc Abstraction Layer: Mock Adapter → API Adapter

* **Bối cảnh:** Frontend được phát triển song song trước khi Backend FastAPI hoàn thành. Cần tránh việc UI import trực tiếp dữ liệu JSON hoặc gọi `fetch()` rải rác.
* **Quyết định:**
  - Định nghĩa **Service Contracts** rõ ràng dưới dạng JS object spec (`authServiceContract`, `courseServiceContract`, v.v.).
  - Triển khai **Mock Adapters** trả về cấu trúc dữ liệu chuẩn domain models kèm giả lập độ trễ mạng (`delay(300ms)`).
  - Cung cấp cổng chuyển đổi tập trung `src/services/index.js` điều khiển bằng biến `USE_MOCK`.
* **Trạng thái:** `CURRENT` (Đã áp dụng từ Sprint 1–4). Backend API thật chuyển hướng sang Sprint 9.

---

## ADR-003: Phân Quyền Vai Trò (Role-Based Access Control - RBAC)

* **Bối cảnh:** Hệ thống hỗ trợ 3 nhóm vai trò: `super_admin`, `content_admin`, `learner`.
* **Quyết định:**
  - Tạo bảng trợ giúp quyền hạn `src/constants/roles.js` quy định rõ quyền truy cập Admin và Learner.
  - Xây dựng HOC Route Guards (`RequireAuth`, `RequireLearner`, `RequireAdmin`) bao bọc các tuyến đường trong `AppRouter`.
* **Trạng thái:** `CURRENT` (Đã áp dụng từ Sprint 1).

---

## ADR-004: In-Browser SQLite WASM Worker Engine & Security Guard

* **Bối cảnh:** Cần cung cấp môi trường thực hành SQL trực tiếp trên trình duyệt mà không phụ thuộc backend server, đồng thời đảm bảo không làm lag UI chính và ngăn chặn các câu lệnh nguy hại.
* **Quyết định:**
  - Sử dụng `sql.js` (SQLite WASM) chạy hoàn toàn trong Web Worker cách ly (`sqlEngine.worker.js`).
  - Xây dựng bộ lọc an toàn `sqlQueryPolicy.js` chặn 100% các từ khóa đột biến cấu trúc/dữ liệu và multi-statement queries.
  - Thiết lập ngắt thời gian thực thi (Execution Timeout 3s) và giới hạn dòng dữ liệu trả về (Row Cap 500 rows).
* **Trạng thái:** `CURRENT` (Đã áp dụng từ Sprint 4).

---

## ADR-005: Tái Cấu Trúc Learning Domain & Bóc Tách Cấu Hình Chấm Điểm (Sprint 5 Architecture)

* **Bối cảnh:** Đợt Audit sau Sprint 4 xác định hai khoản nợ kiến trúc:
  1. Cấu hình kiểm thử (`EXCEL_CHECKER_CONFIG`, `SQL_CHECKER_CONFIG`) đang bị nhúng trực tiếp trong `mockSubmissionService.js`.
  2. Khái niệm `Mission` bị gộp chung giữa bối cảnh vụ án (Story Narrative) và nhiệm vụ kỹ thuật (Technical Task/Step).
* **Quyết định:**
  - Bóc tách cấu hình chấm điểm ra khỏi Submission Adapter đưa về `contentService`.
  - Chuẩn hóa mô hình phân tầng: `Learning Journey` → `Phase` → `Chapter` → `Investigation` → `Question` → `Question Variant` → `Submission` → `Result` → `Progress` → `XP / Mastery`.
  - Độc lập hóa `Dataset` thành tài sản có thể tái sử dụng cho nhiều Question khác nhau.
* **Trạng thái:** `CURRENT` (Đã áp dụng trong Sprint 5).

---

## ADR-006: Phân Tách Trách Nhiệm Giữa Submission Service & Progress Service (Sprint 6 Architecture)

* **Bối cảnh:** Trước đây `mockSubmissionService.js` tự tính toán `potentialXp` nhưng không lưu trữ tiến độ hoặc level của người học.
* **Quyết định:**
  - `Submission Service` chỉ chịu trách nhiệm đánh giá tính đúng/sai của câu trả lời, trả về `SubmissionResult` chứa kết quả và `potentialXp` (không mutate state).
  - `Progress Service` chịu trách nhiệm độc lập trong việc tiếp nhận `SubmissionResult`, thực hiện trao thưởng XP theo cơ chế **Idempotent** (chống cộng trùng), thăng cấp và cập nhật mở khóa trên Bản đồ Học tập.
* **Trạng thái:** `CURRENT` (Đã áp dụng trong Sprint 6).

---

## ADR-007: Di Chuyển Tiến Độ & Sổ Cái XP Sang Firebase Firestore Production

* **Bối cảnh:** Cần hệ thống lưu trữ bền vững cho tiến độ học viên, điểm XP, huy hiệu thành tích và lịch sử hoạt động, sẵn sàng cho môi trường người dùng thật thay vì chỉ lưu tạm trên mock/localStorage.
* **Quyết định:**
  - Tích hợp `firebaseProgressService.js` giao tiếp trực tiếp với Firebase Firestore.
  - Sử dụng Firestore Transaction để đảm bảo tính toàn vẹn (Idempotent XP Ledger), ngăn chặn race condition và cộng trùng XP.
  - Đồng bộ real-time với các thành phần giao diện (Dashboard, Sidebar, Profile, Achievements) qua `useProgress` hook.
* **Trạng thái:** `CURRENT` (Đã áp dụng trong Sprint 7).

---

## ADR-008: Materialized Read Model `learning_map_views` Cho Bản Đồ Học Tập

* **Bối cảnh:** Luồng lấy dữ liệu Bản đồ Học tập (`/map`) trước đây thực hiện N+1 queries (Course -> Chapters -> Missions), gây quá tải document reads trên Firestore và kéo theo toàn bộ payload nặng của Mission (starterContent, dataset, solution).
* **Quyết định:**
  - Thiết lập collection chuyên biệt `learning_map_views` làm Materialized Read Model.
  - Mỗi Document đại diện cho 1 Khóa học chứa cây rút gọn (Phase -> Chapter -> Node tóm tắt gồm ID, Title, Objective, XP, Tool).
  - Xây dựng `learningMapProjector.js` để tự động tổng hợp và ghi Read Model mỗi khi Admin xuất bản Khóa học/Chương học/Vụ án.
  - Giao diện `/map` chỉ cần đọc 1 Document duy nhất cho mỗi khóa học, giảm hơn 90% số lượng read operations.
* **Trạng thái:** `CURRENT` (Đã áp dụng trong Sprint 8).

---

## ADR-009: Admin Content Studio & In-Browser Sandbox Test Runner

* **Bối cảnh:** Quản trị viên cần tự soạn thảo, chỉnh sửa vụ án và kiểm tra ngay tính chính xác của bộ chấm điểm (Excel/SQL) mà không làm ô nhiễm tiến độ hoặc ghi nhận XP vào tài khoản học viên.
* **Quyết định:**
  - Xây dựng Admin Content Studio trực quan với 4 tabs: Hồ sơ vụ án, Không gian làm việc, Cấu hình bộ chấm điểm, Hệ thống gợi ý.
  - Tích hợp `AdminTestRunnerModal`: chạy công thức Excel qua `excelChecker` và câu lệnh SQL qua Web Worker SQLite WASM trực tiếp trong phiên làm việc.
  - Đảm bảo cơ chế Sandbox Isolation: không gọi `progressService`, không mutate dữ liệu học viên thật.
* **Trạng thái:** `CURRENT` (Đã áp dụng trong Sprint 8).

---

## ADR-010: Kiến Trúc In-Cell Spreadsheet Editor Overlay & Session State Machine

* **Bối cảnh:** Việc chỉnh sửa trực tiếp bên trong thẻ `<td>` của bảng tính gây vỡ layout lưới, giật giật kích thước ô khi công thức dài, và mỗi ký tự gõ lại buộc toàn bộ bảng tính re-render.
* **Quyết định:**
  - Triển khai `CellEditorOverlay` render qua `createPortal` neo vào scroll container của bảng tính.
  - Tự động định vị tuyệt đối theo tọa độ ô tính mục tiêu, co giãn chiều rộng linh hoạt theo nội dung (`width: max-content`).
  - Thiết lập Session State Machine độc lập với 3 tầng giá trị: `originalValue`, `draftValue` và `committedValue`.
  - Đồng bộ 2 chiều tức thì giữa `CellEditorOverlay` và `FormulaBar` qua draft value mà không làm re-render lưới bảng tính (`SpreadsheetGrid`).
  - Hỗ trợ đầy đủ phím Enter (commit và nhảy xuống), Tab (commit và nhảy sang phải), Escape (hủy bỏ hoàn tác). Giữ editor mở kèm viền đỏ `border-rose-500` khi công thức không hợp lệ.
* **Trạng thái:** `CURRENT` (Đã áp dụng trong Sprint 9.5).

---

## ADR-011: Khởi Tạo Firebase An Toàn & Fallback Sang Mock Services Trên Hosted Cloud

* **Bối cảnh:** Khi triển khai lên nền tảng đám mây (như Vercel) chưa cấu hình biến môi trường Firebase, Firebase SDK v10+ ném lỗi ngoại lệ đồng bộ `auth/invalid-api-key` ở top-level module import của `firebase.js`, làm ứng dụng bị vỡ và hiển thị màn hình trắng trước khi React kịp khởi chạy.
* **Quyết định:**
  - Thêm cờ kiểm tra `isFirebaseConfigured` dựa trên tính hợp lệ của `VITE_FIREBASE_API_KEY`.
  - Cung cấp cấu hình fallback dummy an toàn cho `initializeApp` và `getAuth(app)` để ngăn chặn lỗi ném ngoại lệ ở top-level module evaluation.
  - Tự động chuyển hướng toàn bộ service layer (`authService`, `progressService`, `knowledgeService`) sang Mock Services nội bộ khi `isFirebaseConfigured` là false hoặc `VITE_USE_FIREBASE !== 'true'`.
* **Trạng thái:** `CURRENT` (Đã áp dụng trong Sprint 9.5).

---

## ADR-012: Tái Cấu Trúc Học Viện Theo Tư Duy Điều Tra & Vòng Lặp Học Tập Thực Chiến (Phase 4)

* **Bối cảnh:** Giao diện Academy trước đây mang dáng dấp của một hệ thống LMS truyền thống (khóa học đại trà, bài thi cấp chứng chỉ mang tính thủ tục hành chính). Cần tái định hình để người học không chỉ nhìn thấy giao diện thám tử trang trí, mà thực sự suy nghĩ và hành động như một điều tra viên dữ liệu.
* **Quyết định:**
  - Áp dụng 5 nguyên tắc cốt lõi:
    1. Evidence là presentation concept, không tạo backend/data model mới.
    2. Metadata được hạ cấp hierarchy, không xóa.
    3. Clarity > role-play trong nút bấm và nhãn chức năng.
    4. Workspace chỉ tinh gọn, không redesign toàn bộ.
    5. Taste Audit nghiêm ngặt trước và sau triển khai.
  - Triết lý học tập: **"Đọc ➔ Hiểu ➔ Thực hành"**, loại bỏ gánh nặng thủ tục hành chính chứng chỉ.
  - Xây dựng `investigationNotebookService.js` (client-side storage + events) hỗ trợ ghim công thức/truy vấn mẫu vào Sổ tay điều tra.
  - Thiết lập cầu nối 2 chiều giữa Mission Workspace và Academy:
    - Khi bí ý tưởng trong lúc phá án, `ProblemPane` cung cấp link "Tra cứu Học viện ❯".
    - Tại bài giảng Học viện, hiển thị banner sticky "Quay lại phá án" giữ nguyên bối cảnh vụ án đang làm.
    - Tại `ProblemPane`, thẻ Sổ tay điều tra hiển thị các ghi chú đã ghim cho phép copy nhanh công thức mà không phải chuyển tab.
  - Bài thi sát hạch chuyển thành kiểm tra xác thực năng lực thực chiến (Field Check), hoàn thành dẫn thẳng vào Bản đồ Phá án (`/map`).
* **Trạng thái:** `CURRENT` (Đã áp dụng trong Phase 4).

---

## Agent-facing Decisions

Các quyết định scope/contract chi tiết dành cho AI Agent tiếp tục được duy trì tại [`agent/CONTRACTS.md`](./agent/CONTRACTS.md) và [`agent/MODULE_MAP.md`](./agent/MODULE_MAP.md).



--- Content of docs/agent/DECISIONS.md ---

# Agent Decision Log

Lịch sử kiến trúc trước hệ thống này nằm tại [docs/DECISIONS.md](../DECISIONS.md). File này chỉ ghi quyết định scope/contract dùng để điều phối agent; không xóa hoặc thay thế lịch sử cũ.

## ADR-AGT-001 — Excel trước SQL; Python ngoài MVP

- Status: Accepted
- Date: 2026-08-21
- Context: Product direction cần thứ tự học rõ để tránh mở rộng scope.
- Decision: Hoàn thiện Excel trước SQL; Python learning không thuộc MVP hiện tại.
- Consequences: Không tự triển khai SQL trước khi task Sprint 4 được kích hoạt hoặc thêm Python learning.
- Related modules: LRN-EXCEL, LRN-SQL

## ADR-AGT-002 — Mock Service và API Client cùng interface

- Status: Accepted
- Date: 2026-08-21
- Context: Frontend được phát triển với mock trước backend Sprint 7.
- Decision: UI dùng stable service gateway; mock và API client implement cùng public interface.
- Consequences: Không import mock JSON/adapter trực tiếp trong UI; migration API không yêu cầu viết lại UI.
- Related modules: LRN-SUB, BE, SHR

## ADR-AGT-003 — Submission không trực tiếp trao XP

- Status: Accepted
- Date: 2026-08-21
- Context: Reward cần ownership và idempotency riêng.
- Decision: Submission trả evaluation/completion và `potentialXp`; Progress trao XP.
- Consequences: Mock Submission Step 3.4 không mutate XP; Progress Sprint 5 phải xử lý reward idempotency.
- Related modules: LRN-SUB, GAME, BE

## ADR-AGT-004 — Inline feedback cho lỗi thường; modal cho completion

- Status: Accepted
- Date: 2026-08-21
- Context: Modal cho mọi câu trả lời sai làm gián đoạn vòng lặp học.
- Decision: Validation/sai thông thường dùng inline feedback; modal ưu tiên hoàn thành Step/Mission.
- Consequences: Step 3.4 dùng inline feedback cho validation/incorrect/service error và success-only modal có quản lý focus/Escape.
- Related modules: LRN-EXCEL, LRN-SUB, SHR

## ADR-AGT-005 — Không tạo source folder rỗng cho module Planned

- Status: Accepted
- Date: 2026-08-21
- Context: Folder rỗng làm module roadmap trông như implementation thật.
- Decision: Module Planned chỉ có tài liệu trong `docs/agent/modules/` cho đến khi task tạo source được duyệt.
- Consequences: LRN-SQL, BE và ANL chưa có source module riêng.
- Related modules: LRN-SQL, BE, ANL

## ADR-AGT-006 — Canonical submission error catalog

- Status: Accepted
- Date: 2026-08-21
- Context: Mock/API cần error code và payload ổn định để UI không parse message.
- Decision: Dùng catalog và `{ data, error }` payload trong [CONTRACTS.md](./CONTRACTS.md).
- Consequences: API Sprint 7 phải map về cùng code/interface; message có thể thay đổi nhưng code không đổi tùy tiện.
- Related modules: LRN-SUB, BE, SHR

## ADR-AGT-007 — Sprint 4 bắt đầu bằng Technical Spike

- Status: Accepted
- Date: 2026-08-22
- Context: Scope Step 4.1 cũ gộp package/WASM/Worker/policy/schema/UI/route trong khi contract và write paths chưa hợp lệ.
- Decision: Step 4.0 là gate bắt buộc; product implementation chỉ bắt đầu từ Step 4.1A sau khi engine, Worker, contracts và policy được chốt.
- Consequences: Roadmap Sprint 4 được tách thành Step 4.0–4.8; không tạo SQL UI/route trong Step 4.0.
- Related modules: LRN-SQL, SHR, LRN-SUB

## ADR-AGT-008 — SQL MVP dùng sql.js Worker và database in-memory

- Status: Accepted
- Date: 2026-08-22
- Context: Query có thể block UI; database bài học nhỏ và cần reset xác định, không cần persistence thiết bị.
- Decision: Dùng `sql.js@1.14.2` (MIT, zero runtime dependencies) với SQLite WASM trong dedicated module Worker. Database chạy in-memory, tạo lại từ deterministic JSON seed; OPFS nằm ngoài MVP Sprint 4.
- Rationale: `sql.js` có API `Database` nhỏ, phù hợp seed/reset và Vite có thể đóng gói loader + WASM bằng asset URL. `@sqlite.org/sqlite-wasm` vẫn là lựa chọn mạnh khi cần SQLite Wasm APIs/OPFS sâu hơn, nhưng độ phức tạp Worker/persistence không mang lợi ích cho dataset học tập nhỏ của MVP.
- Consequences: SQLite là dialect học tập của Sprint 4. Default query timeout là 2000ms; timeout cứng terminate/recreate Worker và nạp lại seed. Default result limit là 500 rows, hard cap 5000. Worker protocol dùng request ID; không dùng OPFS/CDN/backend execution.
- Related modules: LRN-SQL

## ADR-AGT-009 — SQL tái sử dụng Submission Contract

- Status: Accepted
- Date: 2026-08-22
- Context: Tạo Submission Service riêng cho SQL sẽ phá gateway và idempotency boundary đã ổn định.
- Decision: SQL Result Checker là evaluator riêng nhưng Submit đi qua shared `submissionService`; Step 4.7 dùng Primary Module `LRN-SUB`.
- Consequences: `run` không complete, `submit` chỉ trả `potentialXp`, không mutate XP; contract changes cần path và Acceptance Criteria rõ.
- Related modules: LRN-SQL, LRN-SUB, GAME, BE

## ADR-AGT-010 — In-cell Editor Overlay độc lập khỏi SpreadsheetGrid

- Status: Accepted
- Date: 2026-09-08
- Context: Gõ phím trong ô hoặc Formula Bar không được phép làm giật lag hoặc re-render toàn bộ bảng tính.
- Decision: Render `CellEditorOverlay` qua React Portal, dùng state session riêng biệt (`originalValue`, `draftValue`, `committedValue`) và chỉ update committed state vào bảng tính khi kết thúc phiên edit.
- Consequences: Phải kiểm tra và duy trì chỉ số `window.__SPREADSHEET_GRID_RENDER_COUNT__` bằng 0 trong suốt quá trình gõ phím.
- Related modules: LRN-EXCEL, LRN-SANDBOX

## ADR-AGT-011 — Graceful Fallback khi thiếu biến môi trường Firebase trên Cloud

- Status: Accepted
- Date: 2026-09-08
- Context: Các bản build production preview hoặc user deployment trên Vercel có thể thiếu credentials Firebase dẫn đến `auth/invalid-api-key`.
- Decision: Cung cấp fallback credentials dummy an toàn trong `firebase.js` để `initializeApp`/`getAuth` không ném exception fatal; tự động chuyển sang Mock Services nếu `isFirebaseConfigured` là false hoặc `VITE_USE_FIREBASE !== 'true'`.
- Consequences: Tránh lỗi màn hình trắng trên Vercel; người dùng luôn có trải nghiệm demo mượt mà.
- Related modules: SYS-FB, BE, SHR


--- Content of docs/agent/UI_CHANGE_INVENTORY.md ---

# UI Change Inventory & Architecture Alignment

> **Cập nhật lần cuối:** 08/09/2026
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
| `UI-012` | Dynamic Learning Map Multi-Phase Navigation Tabs & Journey View | `LearningMapPage` | `GAME` | `CURRENT` | Tested | `src/pages/learner/LearningMapPage.jsx` |
| `UI-016` | High-contrast Skill Mastery Badges & Level Indicators in Dark/Light Mode | `LearningMapPage` | `GAME` | `CURRENT` | Tested | `src/pages/learner/LearningMapPage.jsx` |
| `UI-017` | In-cell Editor Overlay (`CellEditorOverlay`) with portal & auto-expanding width | Excel Sandbox Workspace | `LRN-SANDBOX` | `CURRENT` | Tested | `src/components/excel/CellEditorOverlay.jsx` |
| `UI-018` | Academy Course Page with W3Schools syllabus tree & checkpoint quiz | Academy Course Page | `LRN-ACADEMY` | `CURRENT` | Tested | `src/pages/learner/AcademyCoursePage.jsx` |
| `UI-019` | Academy Exam Page with countdown timer & comprehensive review | Academy Exam Runner | `LRN-ACADEMY` | `CURRENT` | Tested | `src/pages/learner/AcademyExamPage.jsx` |
| `UI-020` | Digital Certificate Modal with Detective Amber Gold theme & print PDF | Academy Certificate Modal | `LRN-ACADEMY` | `CURRENT` | Tested | `src/components/academy/AcademyCertificateModal.jsx` |
| `UI-013` | Level Up Popup Modal & Leveling animation | Learner App Shell | `GAME` | `CURRENT` | Tested | `src/features/gamification/LevelUpModal.jsx` |
| `UI-014` | Learner Profile Page (`/profile`) & Achievements Grid | Learner App Shell | `GAME` | `CURRENT` | Tested | `src/pages/learner/ProfilePage.jsx` |
| `UI-015` | Admin Visual Investigation & Question Studio | Admin App Shell | `ADM` | `CURRENT` | Tested | `src/pages/admin/AdminMissionsPage.jsx` |

---

## 2. 🛡 UI Architecture Guard Rules

1. **NO direct mock JSON imports in UI**: Mọi trang UI JSX tuyệt đối không import trực tiếp `.json` trong `src/mocks/data/` hoặc gọi trực tiếp `mockSubmissionService.js`. Mọi giao tiếp đi qua `src/services/index.js`.
2. **Wording Standard for Potential XP**: Giao diện UI chỉ sử dụng cụm từ *"Phần thưởng dự kiến"* (`potentialXp`) khi hiển thị thông tin bài tập. Tuyệt đối không dùng câu chữ hàm ý điểm XP đã được ghi nhận vào tài khoản khi `progressService` chưa chạy.
3. **Responsive Grid & WASM Cleanup**: Mọi màn hình workspace (Excel & SQL) bảo đảm hiển thị mượt trên 390px, 768px, 1440px và tự động cleanup Web Worker / memory timers khi unmount.
