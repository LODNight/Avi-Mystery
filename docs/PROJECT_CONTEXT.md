# 📓 Avi-Mystery — Báo Cáo Tổng Hợp Chi Tiết Toàn Diện Dự Án (Project Master Summary)

> **Tài liệu tổng hợp duy nhất & toàn diện nhất về sản phẩm Avi-Mystery:**
> - Toàn bộ tính năng đã hoàn thành (Sprint 1 đến Sprint 9.5).
> - Toàn bộ các hạng mục chưa làm và lộ trình tương lai (Sprint 10+).
> - Báo cáo phân tích rủi ro hệ thống tiềm ẩn (System & Product Risks).
> - Dự đoán và đặc tả chi tiết các trường dữ liệu (Database Schemas & Fields) cần bổ sung.
> 
> **Cập nhật lần cuối:** 10/09/2026 sau khi hoàn tất Sprint 9.5 (Academy Certification & Mini-Exams).

---

## 1. 📌 TỔNG QUAN DỰ ÁN & BẢN CHẤT SẢN PHẨM (PRODUCT IDENTITY)

### 1.1. Giới thiệu Sản phẩm
* **Tên dự án**: **Avi-Mystery**
* **Bản chất sản phẩm**: Nền tảng EdTech học tập kỹ năng phân tích dữ liệu thực chiến (Excel & SQL) kết hợp **2 nhánh sản phẩm tương hỗ độc đáo**:
  1. **Nhánh Game Trinh Thám Phá Án (Mystery Storyline & Gamification)**: Người học nhập vai thám tử dữ liệu, tiếp nhận hồ sơ vụ án thực tế (gian lận thương mại điện tử, trộm cắp kho vận, thao túng báo cáo tài chính), sử dụng Excel/SQL để tìm ra chứng cứ và phá án.
  2. **Nhánh Học Viện Dữ Liệu Tự Do (Academy Mode - W3Schools Style)**: Cung cấp giáo trình lý thuyết chuẩn hóa, môi trường thực hành tự do không áp lực (**Interactive Data Sandbox - "Try It Yourself"**), câu hỏi củng cố nhanh (**Quick Checkpoints**) và kỳ thi tốt nghiệp cấp **Chứng chỉ điện tử chính thức (Digital Certificate)**.
* **Môi trường triển khai Production/Demo**: [https://avi-mystery.vercel.app/dashboard](https://avi-mystery.vercel.app/dashboard)
* **Quản lý phiên bản Git**: Nhánh `dev` (phát triển & tích hợp CI/CD) và nhánh `main` (bản phát hành người dùng cuối).

### 1.2. Tech Stack Hiện Tại
| Thành phần | Công nghệ sử dụng | Vai trò & Mục đích |
|---|---|---|
| **Core Framework** | React 18, Vite 5 | SPA render nhanh, Hot Module Replacement (HMR) < 50ms |
| **Routing** | React Router v6 | Điều hướng trang, phân quyền Role Guards, Focus Mode |
| **Styling & Theme** | Tailwind CSS 3, Vanilla CSS Variables | Design System **Detective Amber**, Light Mode & Dark Mode đa tầng |
| **Layout & Split-Pane** | `react-resizable-panels` | Chia khung IDE tỷ lệ 34:66 chuẩn LeetCode / VS Code Web |
| **SQL In-Browser Engine** | `sql.js@1.14.2` (SQLite WASM) + Web Worker | Thực thi truy vấn SQL trực tiếp trên trình duyệt, không cần backend |
| **Excel In-Browser Engine** | Custom Pure JS Evaluation Engine (`excelChecker.js`) | Chuẩn hóa cú pháp, tính toán hàm SUM, AVERAGE, COUNTIF, SUMIF, IF, VLOOKUP... |
| **Editor Trực Quan** | `CellEditorOverlay` (`createPortal`) | In-cell formula editor nổi, điều hướng Enter/Tab/Esc, zero re-render |
| **Markdown Renderer** | `react-markdown`, `remark-gfm` | Hiển thị bài giảng, bảng dữ liệu, khối code có nút copy |
| **Hạ tầng Dữ liệu** | Firebase Firestore + Client Storage (`storage.js`) | Lưu trữ tiến trình học tập, XP Ledger, Chứng chỉ, cache offline IndexedDB |
| **Testing Framework** | Vitest, React Testing Library, `@testing-library/jest-dom` | **72 test suites, 567 tests PASS 100%** |

---

## 2. ✅ TOÀN BỘ MỌI THỨ ĐÃ HOÀN THÀNH (SPRINT 1 ĐẾN SPRINT 9.5)

Dự án đã trải qua 14 giai đoạn phát triển liên tục, đạt trạng thái hoàn thiện 100% trên toàn bộ Frontend:

### 🔹 Sprint 1 — Frontend Foundation & RBAC System (100%)
- Hệ thống điều hướng React Router v6 với phân quyền 3 roles: `unauthenticated`, `learner`, `admin`.
- Bộ giao diện Learner Layout (Sidebar co giãn, Topbar) và Admin Layout độc lập.
- Design System **Detective Amber** với tone màu Hổ phách, CSS Variables đồng bộ Light/Dark mode.
- Bộ UI Kit cơ bản: `Button`, `Card`, `Input`, `Badge`, `Skeleton` (`aria-busy="true"`), `EmptyState`, `ErrorState`.
- Cấu trúc Service Contracts và Mock Adapters ban đầu (`authService`, `courseService`, `missionService`).

### 🔹 Sprint 2 — Course, Learning Map & Maintenance Mode (100%)
- Trang Danh sách Khóa học (`/courses`) với bộ lọc Từ khóa, Công cụ (Excel/SQL) và Độ khó.
- Trang Chi tiết Khóa học (`/courses/:slug`) với Accordion chương học và danh sách bài học.
- Trang Bản đồ Học tập sơ khai (`/map`) hiển thị các node vụ án kết nối trực quan.
- Trang Giới thiệu Vụ án (`/missions/:missionId`) tóm tắt bối cảnh và phần thưởng dự kiến.
- Hệ thống Bảo trì Trang (`UnderMaintenancePage`) kiểm soát bởi Admin Settings (`usePageStatus`).

### 🔹 Sprint 3 — Excel Vertical Slice (100%)
- Bộ chấm công thức `excelChecker.js` thuần túy: phân tích dải ô, chuẩn hóa dấu cách/hoa thường, kiểm tra kết quả tính toán.
- Không gian giải đố Excel (`ExcelMissionPage.jsx` tại `/missions/:missionId/workspace`).
- Lưới bảng tính `SpreadsheetGrid.jsx` (hỗ trợ ô A1-Z100, chọn ô active/highlight, nhập dữ liệu).
- Thanh công thức `FormulaBar.jsx`, thanh công cụ Chạy thử (Run), Nộp bài (Submit), Gợi ý (Hints) và Đặt lại (Reset).
- Cổng Submission Gateway (`submissionService`) hỗ trợ chống nộp đúp (`clientAttemptId`), retry khi lỗi mạng.
- Hoàn thiện UI Stabilization và tinh chỉnh độ tương phản Light Mode.

### 🔹 Sprint 4 — SQL Vertical Slice (100%)
- Tích hợp Web Worker đóng gói SQLite WASM (`sql.js`), xử lý request-response bất đồng bộ qua `requestId`.
- Bộ lọc bảo mật `sqlQueryPolicy.js`: Chặn 100% lệnh ghi/xóa/phá hoại DDL/DML, timeout 3s và giới hạn tối đa 500 dòng.
- `SchemaBrowser.jsx`: Xem cấu trúc bảng, kiểu dữ liệu cột, khóa chính và 3 dòng dữ liệu mẫu.
- `SqlEditor.jsx`: Trình soạn thảo SQL hỗ trợ Tab 2-space, phím tắt `Ctrl + Enter` (hoặc `Cmd + Enter`).
- `ResultViewer.jsx`: Bảng xem kết quả truy vấn, phân trang client-side 50 dòng/trang, định dạng NULL và căn phải số.
- Bộ chấm kết quả `sqlChecker.js` kiểm tra độ khớp cột, thứ tự dòng, dung sai số học (numeric tolerance).

### 🔹 Sprint 5 — Content Domain & Dataset Decoupling (100%)
- Tách biệt tuyệt đối giữa Bối cảnh vụ án (`Investigation`) và Nhiệm vụ kỹ thuật (`Question`).
- Tách biệt Bộ dữ liệu (`Dataset`) thành thực thể độc lập có thể tái sử dụng cho nhiều câu hỏi.
- Bóc tách cấu hình kiểm thử (`checkerConfig`) khỏi mã nguồn Mock Submission.
- Khởi tạo Domain `LearnerProgress` và sổ cái điểm thưởng XP bất biến (`rewardEvaluator.js`).

### 🔹 Sprint 6 — Game Progress & Progression Architecture (100%)
- Động cơ cấp độ thuần túy `levelingEngine.js` (Level 1 đến Level 50) với công thức lũy tiến đường cong kinh nghiệm.
- Tách biệt rõ ràng tiến độ cốt truyện (`main_quest`) và rèn luyện kỹ năng tự do (`practice`).
- Đánh giá độ thành thạo kỹ năng (`masteryEvaluator.js`).
- Bản đồ Học tập Dynamic Learning Map (`learningMapAdapter.js`) với Phase Navigation Tabs trực quan và thẻ tổng quan kỹ năng (Skill Mastery Card).

### 🔹 Sprint 6.5 — Learner Onboarding & First-Run Experience (100%)
- Trạng thái Onboarding per-user (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `SKIPPED`).
- Màn hình Welcome Gate toàn màn hình (`WelcomeGatePage.jsx`), tự động chuyển hướng người dùng mới.
- Vụ án huấn luyện tân thủ Tutorial Case 0 (`tutorialCase0Content.js`, `TutorialCase0Page.jsx`) với Guided Spotlight 4 bước.
- Dashboard Deep Tour 6 bước dẫn dắt học viên làm quen toàn bộ tính năng thám tử dữ liệu.
- Bộ công cụ Dev Testing Tools trong Admin cho phép 1-click reset trạng thái Onboarding để kiểm thử.

### 🔹 Sprint 7 — Learner Engagement & Firebase Firestore Migration (100%)
- Modal chúc mừng thăng cấp (`LevelUpModal.jsx`) với hiệu ứng pháo hoa, danh hiệu mới và tổng XP.
- Popup chuỗi ngày học tập (`StreakDetailModal.jsx`) hiển thị biểu đồ ngọn lửa 7 ngày trong tuần.
- Không gian Luyện tập tự do (`/practice`) tách biệt khỏi cốt truyện vụ án.
- Trang Hồ sơ cá nhân (`/profile`) và Bảng thành tựu danh hiệu (`/achievements`).
- Trang Lịch sử hoạt động (`/profile/history`) với Timeline đa chiều.
- Di chuyển toàn bộ lưu trữ XP, Progress, Achievements, Activity History sang **Firebase Firestore Production** với transaction bảo toàn dữ liệu.

### 🔹 Sprint 8 — Admin Content Studio (100%)
- Trình quản lý Vụ án trực quan (`/admin/missions`), Trình tạo & sửa Vụ án (`/admin/missions/:id/edit`) với 4 tabs chuyên sâu.
- Quản lý Khóa học (`/admin/courses`) và Chương học (`/admin/chapters`).
- Trình nhập CSV thông minh (`/admin/datasets`): tự động đoán kiểu dữ liệu (`INTEGER`, `REAL`, `DATE`, `TEXT`) và sinh mã SQLite DDL.
- Sandbox Runner kiểm thử độc lập (`AdminTestRunnerModal.jsx`) cho phép Admin test công thức Excel và query SQL an toàn.
- Bảng đọc tối ưu hóa Materialized Read Model (`learning_map_views`) xóa bỏ hoàn toàn hiện tượng N+1 queries trên Firestore.

### 🔹 Sprint 8.5 & 8.6 — Education Hub & Focus Mode UX (100%)
- Tích hợp `react-markdown` và `remark-gfm` cho trang bài giảng (`KnowledgeHubPage.jsx`).
- Bật bộ nhớ đệm ngoại tuyến `persistentLocalCache` IndexedDB đa tab cho Firebase Firestore.
- Bố cục chế độ tập trung Focus Mode (`FocusLayout.jsx`) loại bỏ toàn bộ sidebar khi làm bài.
- Thanh Action & Formula Bar hợp nhất, căn lề và tối ưu chiều dọc không phải cuộn chuột trên màn hình $\ge 1366 \times 768$.

### 🔹 Sprint 9 & 9.1 — Split-Pane IDE & Authentic Spreadsheet (100%)
- Bố cục chia khung Split-Pane chuẩn LeetCode (`WorkspaceSplitPane.jsx`) với tỷ lệ vàng Desktop 34% (Context) : 66% (Spreadsheet/Editor).
- Xóa bỏ hoàn toàn badge chữ "Mục tiêu" bên trong ô tính, thay bằng viền sáng Hổ phách sắc nét không che số liệu.
- Cơ chế Ghost Rows tự động render bù tối thiểu 16 hàng chuẩn bảng tính Excel thực thụ.
- Nâng cấp thanh công cụ: Name Box `[ E2 ]` $\to$ `fx` $\to$ Input $\to$ Reset $\to$ Fill Down $\to$ Run.
- Interactive Focus Mode: Nút toggle thu gọn hoàn toàn cột trái, mở rộng bảng tính 100% kèm nút nổi "Xem đề bài".

### 🔹 Sprint 9.5 — Academy Mode & Interactive Sandbox (100%)
1. **Interactive Data Sandbox (`/sandbox`)**:
   - Trình thực hành tự do chia đôi màn hình theo triết lý W3Schools "Try it Yourself".
   - **In-cell Editor Overlay (`CellEditorOverlay.jsx`)**: Nhấp đúp mở editor nổi dùng `createPortal`, state machine độc lập (`originalValue`/`draftValue`/`committedValue`), hỗ trợ Enter/Tab/Escape, zero re-renders trên bảng tính.
   - Hotfix Firebase: Cấu hình graceful fallback chống lỗi vỡ app `auth/invalid-api-key` trên Vercel.
2. **Cấu trúc Khóa học Học viện (`/academy`)**:
   - Dữ liệu giáo trình phân cấp chuẩn hóa `academySyllabus.js` (Excel Academy & SQL Academy).
   - Sidebar mục lục W3Schools, thanh % tiến độ học tập, cây bài học accordion với tick xanh hoàn thành.
   - Vòng lặp học tập: Lý thuyết Markdown $\to$ Thẻ Try it Yourself $\to$ Quick Checkpoint trắc nghiệm +20 XP $\to$ Footer điều hướng tuần tự.
3. **Kỳ thi Tốt nghiệp & Cấp Chứng chỉ Điện tử (`/academy/:courseSlug/exam`)**:
   - Ngân hàng câu hỏi `academyExams.js` (10 câu trắc nghiệm chuyên sâu cho từng khóa, giới hạn 15 phút, điểm đạt $\ge 80\%$, thưởng +100 XP).
   - Service `academyExamService.js` tự động chấm điểm, phân loại kết quả và cấp mã Certificate ID duy nhất (`AVI-EXCEL-CERT-XXXXX` / `AVI-SQL-CERT-XXXXX`).
   - Màn hình thi `AcademyExamPage.jsx` với bộ đếm ngược, thanh jumper câu hỏi và bảng xem lại đáp án chi tiết.
   - Modal Chứng chỉ số Detective Amber Gold (`AcademyCertificateModal.jsx`) hỗ trợ In/Tải PDF (`window.print()`) và sao chép mã xác thực.
   - Đồng bộ hiển thị danh sách chứng chỉ đã đạt được vào Hồ sơ cá nhân (`/profile`).

---

## 3. ⏳ TOÀN BỘ NHỮNG GÌ CHƯA LÀM (FUTURE ROADMAP & UNFINISHED WORK)

Dưới đây là các tính năng và module chưa được triển khai, được sắp xếp theo mức độ ưu tiên từ gần đến xa:

```
[Hiện tại: Sprint 9.5 Hoàn tất] 
       ↓
[Sprint 10: Backend API & PostgreSQL] 
       ↓
[Sprint 11: Competitive Seasons & Agencies] 
       ↓
[Sprint 12: Detective Audio & Immersion]
```

### 🔹 Sprint 10 — Backend API & Data Persistence *(Ưu tiên P0 - Kế hoạch tiếp theo)*
*Hiện tại Frontend vẫn dùng song song Firebase Firestore và Mock Adapters/LocalStorage. Sprint 10 sẽ chuyển đổi sang Backend Server độc lập:*
- [ ] **Khởi tạo FastAPI Server (`backend/`)**: Xây dựng kiến trúc thư mục chuẩn (Routers, Controllers, Services, Repositories, Schemas, Core Config).
- [ ] **Docker Compose Hạ tầng**: Cấu hình container chạy PostgreSQL 16 và pgAdmin.
- [ ] **Alembic Database Migrations**: Khởi tạo cấu trúc bảng CSDL quan hệ chuẩn hóa.
- [ ] **Hệ thống Xác thực JWT**: Endpoint `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/refresh` bằng JWT Token có gắn Role-Based Access Control (RBAC).
- [ ] **RESTful API Endpoints**:
  - Courses & Chapters CRUD API.
  - Investigations & Questions API (bao gồm nạp dataset).
  - Submission & Evaluation API (chấm điểm tập trung phía server chống can thiệp client).
  - Progress, XP Ledger & Leveling API với Database Transactions chống race condition.
  - Exams & Certificates Verification API.
- [ ] **Dual-Mode Adapter trên Frontend**: Kết nối API client vào `src/services/contracts/` mà không làm thay đổi bất kỳ component UI nào, tự động fallback về Mock/Firebase khi mất kết nối mạng.

### 🔹 Sprint 11 — Leaderboard, Competitive Seasons & Detective Agencies *(Ưu tiên P1)*
- [ ] **Bảng Xếp Hạng Thám Tử Toàn Hệ Thống (`/leaderboard`)**: Xếp hạng theo Tuần, Tháng và Toàn thời gian dựa trên XP và độ chính xác phá án (Mastery).
- [ ] **Mùa Giải Phá Án (Seasons)**: Cơ chế reset bảng xếp hạng theo mùa (Season 1: Gian Lận Thương Mại, Season 2: Thao Túng Sổ Sách Tài Chính) kèm danh hiệu giới hạn.
- [ ] **Tổ Đội Thám Tử (Detective Agencies / Guilds)**: Cho phép người học lập nhóm từ 3–5 thành viên, cộng dồn điểm XP phá án tổ đội và giải các đại án nhiều giai đoạn.

### 🔹 Sprint 12 — Detective Atmosphere, Audio & Voice Guidance *(Ưu tiên P2)*
- [ ] **Âm thanh Tương tác (Interactive SFX)**: Tiếng lật hồ sơ án, tiếng gõ phím máy chữ retro, âm báo nộp bài thành công (Success Chime), âm báo thăng cấp hoành tráng.
- [ ] **Nhạc nền Bối cảnh (Detective Ambient Background)**: Nhạc Jazz đêm mưa nhẹ nhàng đặc trưng của văn phòng thám tử tư (tùy chọn bật/tắt trên thanh Topbar).
- [ ] **Giọng nói Cảnh báo / Hướng dẫn (AI Voice / Audio Briefing)**: Audio trần thuật bối cảnh vụ án khi mở đầu màn chơi giúp tăng chiều sâu nhập vai.

### 🔹 Technical Debts & Các Tinh Chỉnh Cần Làm Sớm *(Ưu tiên P1/P2)*
- [ ] **`SHR-DEBT-001` (Toast Notification System)**: Thay thế hoàn toàn các lệnh `alert()` native trong codebase bằng component Toast Detective Amber tự động ẩn sau 3 giây.
- [ ] **Xuất Chứng chỉ dạng Ảnh PNG (`html2canvas`)**: Cho phép tải chứng chỉ trực tiếp dưới dạng ảnh chất lượng cao để chia sẻ lên Facebook/LinkedIn mà không phụ thuộc lệnh in của trình duyệt.
- [ ] **Chia Sẻ Chứng Chỉ Công Khai (`/verify/:certificateId`)**: Tuyến đường công khai cho phép nhà tuyển dụng hoặc người ngoài quét QR để xác minh tính xác thực của chứng chỉ.
- [ ] **Phân trang & Đánh Index Firestore (`BE-DEBT-004`)**: Thêm composite indexes và cursor-based pagination cho `knowledgeService` và `activityHistory` khi lượng dữ liệu lớn.
- [ ] **Đa ngôn ngữ (i18n)**: Mở rộng hỗ trợ song ngữ Tiếng Việt và Tiếng Anh (`vi`/`en`) cho toàn bộ giao diện học tập.

---

## 4. ⚠️ PHÂN TÍCH RỦI RO TIỀM ẨN CỦA HỆ THỐNG (SYSTEM & PRODUCT RISKS)

Qua rà soát kiến trúc hiện tại, có **6 rủi ro cốt lõi** cần đặc biệt lưu ý và chuẩn bị phương án dự phòng:

### ⚠️ Rủi ro 1: Xung đột Trạng thái Khi Chuyển Dịch từ Mock/LocalStorage sang Backend Server
- **Bản chất**: Hiện tại các tính năng mới (Exam Results, Certificates, Onboarding state) đang lưu trên trình duyệt qua `storage.js` (`avimystery:...`). Khi người dùng đăng nhập trên thiết bị khác hoặc khi triển khai FastAPI Backend, dữ liệu cục bộ này sẽ bị phân mảnh hoặc mất đồng bộ.
- **Mức độ nghiêm trọng**: `CAO (P0)`.
- **Giải pháp phòng ngừa**: Xây dựng cơ chế **Data Migration on First Login**: Khi user đăng nhập lần đầu vào backend mới, client sẽ tự động gửi gói backup LocalStorage lên server để lưu vĩnh viễn vào PostgreSQL, sau đó dọn dẹp storage cục bộ.

### ⚠️ Rủi ro 2: Giới hạn Bộ nhớ Client-side WASM & Rò rỉ Web Worker (Memory Leak)
- **Bản chất**: `sql.js` nạp toàn bộ CSDL SQLite vào RAM trình duyệt (~20–50MB). Nếu học viên chuyển đổi qua lại giữa hàng chục vụ án hoặc bài học Sandbox liên tục mà Web Worker không được `terminate()` và giải phóng bộ nhớ đúng cách, tab trình duyệt có thể bị treo hoặc crash Out-Of-Memory trên thiết bị di động/máy yếu.
- **Mức độ nghiêm trọng**: `TRUNG BÌNH (P1)`.
- **Giải pháp phòng ngừa**: Duy trì cơ chế Singleton Worker Pool hoặc gọi lệnh `dispose()` bắt buộc trong `useEffect` cleanup hook khi unmount component (đã áp dụng trong Sprint 4 và cần duy trì kiểm tra định kỳ).

### ⚠️ Rủi ro 3: Bùng Nổ Chi Phí Đọc Ghi Firebase Firestore (Cost & Quota Explosion)
- **Bản chất**: Firestore tính phí dựa trên số lượt Document Reads. Nếu các màn hình như Dashboard, Learning Map, Profile gọi `getDocs()` liên tục mà không có read model hoặc cache, chi phí sẽ tăng đột biến theo cấp số nhân khi số lượng user tăng.
- **Mức độ nghiêm trọng**: `CAO (P1)`.
- **Giải pháp phòng ngừa**: Duy trì kiến trúc **Materialized Read Model** (`learning_map_views`) đã xây dựng ở Sprint 8, kích hoạt `persistentLocalCache` của Firestore SDK v10+, và chuyển đổi các nghiệp vụ đọc dữ liệu tĩnh sang FastAPI Cache (Redis/In-memory) trong Sprint 10.

### ⚠️ Rủi ro 4: Gian Lận Điểm XP & Can Thiệp Chấm Điểm Phía Client (Client-side Cheating)
- **Bản chất**: Hiện tại bộ chấm công thức Excel (`excelChecker.js`) và câu hỏi bài thi (`academyExamService.js`) đang chạy hoàn toàn ở phía client (JavaScript trên trình duyệt). Người học am hiểu kỹ thuật có thể mở DevTools Console để xem đáp án `correctIndex` hoặc can thiệp gọi hàm `progressService.awardXp`.
- **Mức độ nghiêm trọng**: `TRUNG BÌNH (P2 - Chấp nhận được ở giai đoạn MVP/Demo, nhưng BẮT BUỘC KHẮC PHỤC ở Production)`.
- **Giải pháp phòng ngừa**: Chuyển toàn bộ logic so sánh đáp án và cộng điểm XP về phía **FastAPI Backend Server** trong Sprint 10; client chỉ gửi bài làm và nhận kết quả mã hóa từ server.

### ⚠️ Rủi ro 5: Xung Đột Cú Pháp SQL giữa SQLite (Client) và PostgreSQL (Server)
- **Bản chất**: Động cơ Sandbox và bài tập SQL hiện tại sử dụng SQLite (dialect chuẩn của `sql.js`). Tuy nhiên backend tương lai sẽ dùng PostgreSQL. Một số hàm ngày tháng (`strftime` vs `TO_CHAR`), hàm chuỗi, hoặc kiểu dữ liệu JSON có sự khác biệt về cú pháp.
- **Mức độ nghiêm trọng**: `TRUNG BÌNH (P1)`.
- **Giải pháp phòng ngừa**: Quy định rõ tiêu chuẩn bài tập: Các bài tập cơ bản/trung cấp tập trung vào chuẩn **ANSI SQL** (tương thích 100% giữa SQLite và Postgres); các bài nâng cao phải gắn cờ `dialect: 'sqlite'` hoặc `dialect: 'postgres'` và hiển thị chú thích rõ ràng cho học viên.

### ⚠️ Rủi ro 6: Giới hạn Hạn Ngạch Lưu Trữ LocalStorage (5MB Quota)
- **Bản chất**: Trình duyệt giới hạn LocalStorage tối đa 5MB cho mỗi domain. Nếu người học hoàn thành hàng trăm vụ án, lưu nhiều lịch sử activity log hoặc bộ nhớ tạm CSV, lệnh `storage.set` sẽ ném lỗi `QuotaExceededError`.
- **Mức độ nghiêm trọng**: `THẤP (P2)`.
- **Giải pháp phòng ngừa**: Đã bọc `try-catch` an toàn trong `src/utils/storage.js`. Đối với các dữ liệu lớn (CSV, SQLite binaries), bắt buộc dùng IndexedDB thay vì LocalStorage.

---

## 5. 🔮 DỰ ĐOÁN & THIẾT KẾ CÁC TRƯỜNG DỮ LIỆU CẦN BỔ SUNG (PREDICTED DATABASE SCHEMAS & FIELDS)

Để chuẩn bị sẵn sàng cho **Sprint 10 (Backend API & PostgreSQL)** và mở rộng tính năng về sau, dưới đây là đặc tả chi tiết các bảng CSDL và các trường dữ liệu cần thiết:

### 🗄️ Bảng 1: `users` (Thông tin tài khoản & Xác thực)
| Tên trường | Kiểu dữ liệu | Ràng buộc | Mục đích & Ý nghĩa |
|---|---|---|---|
| `id` | `UUID` / `VARCHAR(64)` | `PRIMARY KEY` | Mã định danh duy nhất của người dùng |
| `email` | `VARCHAR(255)` | `UNIQUE, NOT NULL` | Email đăng nhập |
| `hashed_password` | `VARCHAR(255)` | `NOT NULL` | Mật khẩu băm (bcrypt / argon2) |
| `display_name` | `VARCHAR(100)` | `NOT NULL` | Tên hiển thị của thám tử |
| `avatar_url` | `VARCHAR(500)` | `NULLABLE` | Đường dẫn ảnh đại diện thám tử |
| `role` | `VARCHAR(20)` | `DEFAULT 'learner'` | Phân quyền: `super_admin`, `content_admin`, `learner` |
| `status` | `VARCHAR(20)` | `DEFAULT 'active'` | Trạng thái: `active`, `suspended`, `banned` |
| `total_xp` | `INTEGER` | `DEFAULT 0` | Tổng điểm kinh nghiệm tích lũy |
| `current_level` | `INTEGER` | `DEFAULT 1` | Cấp bậc thám tử hiện tại (Level 1–50) |
| `rank_title` | `VARCHAR(50)` | `DEFAULT 'Thám tử Tập sự'` | Danh xưng thám tử |
| `current_streak` | `INTEGER` | `DEFAULT 0` | Số ngày duy trì chuỗi học tập liên tục |
| `max_streak` | `INTEGER` | `DEFAULT 0` | Kỷ lục chuỗi ngày học cao nhất |
| `last_active_at` | `TIMESTAMP WITH TIME ZONE`| `NULLABLE` | Thời điểm hoạt động gần nhất (tính streak) |
| `streak_freeze_count`| `INTEGER` | `DEFAULT 1` | **[Mới dự đoán]** Số bùa hộ mệnh đóng băng streak khi quên học |
| `theme_preference`| `VARCHAR(10)` | `DEFAULT 'dark'` | Tùy chọn giao diện: `dark` hoặc `light` |
| `created_at` | `TIMESTAMP WITH TIME ZONE`| `DEFAULT NOW()` | Thời điểm đăng ký tài khoản |
| `updated_at` | `TIMESTAMP WITH TIME ZONE`| `DEFAULT NOW()` | Thời điểm cập nhật hồ sơ |

---

### 🗄️ Bảng 2: `investigations` (Hồ sơ Vụ án Trinh thám)
| Tên trường | Kiểu dữ liệu | Ràng buộc | Mục đích & Ý nghĩa |
|---|---|---|---|
| `id` | `VARCHAR(64)` | `PRIMARY KEY` | Mã vụ án (ví dụ `mission-001`, `inv-fraud-01`) |
| `chapter_id` | `VARCHAR(64)` | `FOREIGN KEY` | Thuộc chương học nào |
| `title` | `VARCHAR(255)` | `NOT NULL` | Tiêu đề vụ án |
| `slug` | `VARCHAR(255)` | `UNIQUE, NOT NULL` | Đường dẫn URL thân thiện |
| `case_brief` | `TEXT` | `NOT NULL` | Tóm tắt hồ sơ bối cảnh trinh thám |
| `storyline` | `TEXT` | `NULLABLE` | Cốt truyện chi tiết dẫn dắt vào vụ án |
| `difficulty` | `VARCHAR(20)` | `NOT NULL` | Độ khó: `beginner`, `intermediate`, `advanced` |
| `tool` | `VARCHAR(20)` | `NOT NULL` | Công cụ áp dụng: `excel` hoặc `sql` |
| `order_index` | `INTEGER` | `DEFAULT 0` | Thứ tự xuất hiện trong chương học |
| `status` | `VARCHAR(20)` | `DEFAULT 'draft'` | Trạng thái: `published`, `draft`, `archived` |
| `estimated_time`| `VARCHAR(50)` | `DEFAULT '15 phút'`| Thời gian dự kiến hoàn thành |
| `badge_reward` | `VARCHAR(64)` | `NULLABLE` | Huy hiệu thưởng khi phá giải vụ án (nếu có) |
| `is_free` | `BOOLEAN` | `DEFAULT TRUE` | **[Mới dự đoán]** Miễn phí hay yêu cầu tài khoản Pro |
| `prerequisite_id`| `VARCHAR(64)` | `NULLABLE` | **[Mới dự đoán]** Mã vụ án bắt buộc phải xong trước khi mở khóa |

---

### 🗄️ Bảng 3: `questions` (Nhiệm vụ Thao tác Kỹ thuật)
| Tên trường | Kiểu dữ liệu | Ràng buộc | Mục đích & Ý nghĩa |
|---|---|---|---|
| `id` | `VARCHAR(64)` | `PRIMARY KEY` | Mã câu hỏi (ví dụ `q-excel-001`) |
| `investigation_id`| `VARCHAR(64)` | `FOREIGN KEY` | Gắn với vụ án nào |
| `dataset_id` | `VARCHAR(64)` | `FOREIGN KEY` | Gắn với bộ dữ liệu nào |
| `objective` | `TEXT` | `NOT NULL` | Mục tiêu kỹ thuật cụ thể cần đạt được |
| `target_cell` | `VARCHAR(10)` | `NULLABLE` | Tọa độ ô mục tiêu (đối với Excel, ví dụ `E2`) |
| `formula_placeholder`| `VARCHAR(100)`| `NULLABLE` | Gợi ý mờ trong thanh `fx` (ví dụ `=SUM(...)`) |
| `starter_query` | `TEXT` | `NULLABLE` | Câu lệnh mồi có sẵn (đối với SQL) |
| `base_xp` | `INTEGER` | `DEFAULT 50` | Điểm XP cơ bản khi hoàn thành lần đầu |
| `skill_id` | `VARCHAR(50)` | `NOT NULL` | Kỹ năng liên quan (`excel_formula`, `sql_query`...) |
| `checker_config` | `JSONB` | `NOT NULL` | Cấu hình bộ chấm điểm (expectedValue, tolerances, regex) |
| `hints` | `JSONB` | `DEFAULT '[]'` | Danh sách mảng các gợi ý kèm chi phí trừ XP |
| `max_attempts` | `INTEGER` | `NULLABLE` | **[Mới dự đoán]** Giới hạn số lần nộp bài tối đa (nếu là bài thi) |

---

### 🗄️ Bảng 4: `datasets` (Bộ Dữ Liệu Nguồn Độc Lập)
| Tên trường | Kiểu dữ liệu | Ràng buộc | Mục đích & Ý nghĩa |
|---|---|---|---|
| `id` | `VARCHAR(64)` | `PRIMARY KEY` | Mã bộ dữ liệu (ví dụ `ds-ecommerce-orders`) |
| `name` | `VARCHAR(255)` | `NOT NULL` | Tên bộ dữ liệu |
| `description` | `TEXT` | `NULLABLE` | Mô tả nguồn gốc và ý nghĩa các cột |
| `tool` | `VARCHAR(20)` | `NOT NULL` | Phù hợp cho công cụ nào: `excel`, `sql`, `both` |
| `table_name` | `VARCHAR(64)` | `NULLABLE` | Tên bảng SQLite (đối với SQL, ví dụ `orders`) |
| `sqlite_ddl` | `TEXT` | `NULLABLE` | Lệnh DDL SQLite khởi tạo bảng và seed dữ liệu mẫu |
| `excel_grid_data`| `JSONB` | `NULLABLE` | Dữ liệu ma trận lưới ô tính ban đầu (đối với Excel) |
| `schema_metadata`| `JSONB` | `NOT NULL` | Thông tin cột: tên cột, kiểu dữ liệu, khóa chính |
| `row_count` | `INTEGER` | `DEFAULT 0` | Tổng số hàng dữ liệu trong dataset |
| `is_readonly` | `BOOLEAN` | `DEFAULT TRUE` | Đảm bảo an toàn không bị sửa đổi bảng gốc |

---

### 🗄️ Bảng 5: `submissions` (Lịch Sử Bài Làm & Chấm Điểm)
| Tên trường | Kiểu dữ liệu | Ràng buộc | Mục đích & Ý nghĩa |
|---|---|---|---|
| `id` | `VARCHAR(64)` | `PRIMARY KEY` | Mã lần nộp bài (`attemptId`) |
| `user_id` | `VARCHAR(64)` | `FOREIGN KEY` | Học viên thực hiện |
| `question_id` | `VARCHAR(64)` | `FOREIGN KEY` | Câu hỏi được nộp |
| `mode` | `VARCHAR(20)` | `DEFAULT 'main_quest'`| Chế độ làm bài: `main_quest` hoặc `practice` |
| `submitted_answer`| `TEXT` | `NOT NULL` | Công thức Excel hoặc câu lệnh SQL học viên đã nhập |
| `is_correct` | `BOOLEAN` | `NOT NULL` | Đạt yêu cầu hay không |
| `score` | `INTEGER` | `DEFAULT 0` | Điểm số đạt được (0–100) |
| `hints_used` | `INTEGER` | `DEFAULT 0` | Số lượng gợi ý học viên đã mở |
| `execution_time_ms`| `INTEGER` | `NULLABLE` | Thời gian thực thi truy vấn / tính toán (mili-giây) |
| `error_message` | `TEXT` | `NULLABLE` | Thông báo lỗi chi tiết nếu bài làm sai |
| `created_at` | `TIMESTAMP WITH TIME ZONE`| `DEFAULT NOW()` | Thời điểm nộp bài |

---

### 🗄️ Bảng 6: `xp_ledger` (Sổ Cái Điểm Thưởng Bất Biến - Idempotent Ledger)
| Tên trường | Kiểu dữ liệu | Ràng buộc | Mục đích & Ý nghĩa |
|---|---|---|---|
| `id` | `VARCHAR(64)` | `PRIMARY KEY` | Mã giao dịch XP (`transactionId`) |
| `user_id` | `VARCHAR(64)` | `FOREIGN KEY` | Thám tử nhận thưởng |
| `content_id` | `VARCHAR(64)` | `NOT NULL` | Mã câu hỏi hoặc kỳ thi nhận điểm |
| `attempt_id` | `VARCHAR(64)` | `UNIQUE, NOT NULL` | **Idempotency Key chống nhận thưởng lặp lại** |
| `xp_amount` | `INTEGER` | `NOT NULL` | Số điểm XP được cộng (hoặc trừ nếu phạt) |
| `reason` | `VARCHAR(255)` | `NOT NULL` | Lý do cộng thưởng (First Blood, Level Up, Quiz, Exam) |
| `created_at` | `TIMESTAMP WITH TIME ZONE`| `DEFAULT NOW()` | Thời điểm ghi nhận giao dịch |

---

### 🗄️ Bảng 7: `academy_exams` & `exam_submissions` (Kỳ Thi & Kết Quả Sát Hạch)
| Tên trường | Kiểu dữ liệu | Ràng buộc | Mục đích & Ý nghĩa |
|---|---|---|---|
| `id` | `VARCHAR(64)` | `PRIMARY KEY` | Mã kết quả thi |
| `user_id` | `VARCHAR(64)` | `FOREIGN KEY` | Thí sinh dự thi |
| `course_slug` | `VARCHAR(64)` | `NOT NULL` | Khóa học dự thi (`excel-academy` / `sql-academy`) |
| `score_percent` | `INTEGER` | `NOT NULL` | Điểm số đạt được (0–100%) |
| `total_correct` | `INTEGER` | `NOT NULL` | Số câu trả lời đúng |
| `total_questions`| `INTEGER` | `NOT NULL` | Tổng số câu hỏi trong đề thi (10 câu) |
| `is_passed` | `BOOLEAN` | `NOT NULL` | Đạt chuẩn tốt nghiệp hay chưa (≥ 80%) |
| `grade` | `VARCHAR(50)` | `NOT NULL` | Xếp loại: Xuất Sắc, Giỏi, Đạt Chuẩn, Chưa Đạt |
| `time_spent_seconds`| `INTEGER` | `NOT NULL` | Thời gian làm bài thực tế (giây) |
| `answers_payload`| `JSONB` | `NOT NULL` | Chi tiết lựa chọn của học viên cho từng câu hỏi |
| `certificate_id`| `VARCHAR(64)` | `NULLABLE` | Mã chứng chỉ được cấp (nếu đỗ) |
| `completed_at` | `TIMESTAMP WITH TIME ZONE`| `DEFAULT NOW()` | Thời điểm nộp bài thi |

---

### 🗄️ Bảng 8: `certificates` (Chứng Chỉ Tốt Nghiệp Điện Tử Đã Cấp)
| Tên trường | Kiểu dữ liệu | Ràng buộc | Mục đích & Ý nghĩa |
|---|---|---|---|
| `certificate_id`| `VARCHAR(64)` | `PRIMARY KEY` | Mã chứng chỉ duy nhất (`AVI-EXCEL-CERT-XXXXX`) |
| `user_id` | `VARCHAR(64)` | `FOREIGN KEY` | Học viên sở hữu chứng chỉ |
| `learner_name` | `VARCHAR(100)` | `NOT NULL` | Họ tên in trên chứng chỉ tại thời điểm cấp |
| `course_slug` | `VARCHAR(64)` | `NOT NULL` | Khóa học tốt nghiệp |
| `course_title` | `VARCHAR(255)` | `NOT NULL` | Tiêu đề đầy đủ của khóa học |
| `score_percent` | `INTEGER` | `NOT NULL` | Điểm thi tốt nghiệp |
| `grade` | `VARCHAR(50)` | `NOT NULL` | Xếp loại tốt nghiệp |
| `issued_at` | `TIMESTAMP WITH TIME ZONE`| `NOT NULL` | Ngày giờ cấp chứng chỉ chính thức |
| `verification_code`| `VARCHAR(64)`| `UNIQUE, NOT NULL` | Mã bảo mật xác thực chứng chỉ |
| `is_revoked` | `BOOLEAN` | `DEFAULT FALSE` | **[Mới dự đoán]** Trạng thái thu hồi (nếu phát hiện gian lận) |
| `public_url` | `VARCHAR(500)` | `NULLABLE` | **[Mới dự đoán]** Đường dẫn xác thực công khai cho nhà tuyển dụng |
| `download_count`| `INTEGER` | `DEFAULT 0` | **[Mới dự đoán]** Số lượt tải về / in ấn chứng chỉ |

---

## 6. 📁 CẤU TRÚC FILE TOÀN DIỆN HIỆN TẠI CỦA DỰ ÁN

```
Avi-Mystery/
├── docs/                                  # Hệ thống tài liệu dự án
│   ├── PROJECT_CONTEXT.md                 # [File này] Báo cáo tổng hợp toàn diện nhất
│   ├── CURRENT_SPRINT.md                  # Theo dõi tiến độ Sprint & Checklist chi tiết
│   ├── QUICK_STATUS.md                    # Tóm tắt nhanh việc đã xong & việc tiếp theo
│   ├── BACKLOG.md                         # Bảng phân loại nhiệm vụ & nợ kỹ thuật
│   ├── ARCHITECTURE.md                    # Module map & sơ đồ phụ thuộc kiến trúc
│   └── DECISIONS_LOG.md                   # Nhật ký quyết định kiến trúc (ADR) & UI changes
│
├── src/                                   # Mã nguồn Frontend ứng dụng
│   ├── app/
│   │   ├── layouts/                       # Khung giao diện (LearnerLayout, FocusLayout, AdminLayout)
│   │   ├── providers/                     # Providers (Auth, Brand, Theme, PageStatus)
│   │   └── router/index.jsx               # Tuyến đường ứng dụng (React Router v6)
│   │
│   ├── components/                        # UI Components dùng chung
│   │   ├── academy/                       # Component học viện (AcademyCertificateModal.jsx)
│   │   ├── excel/                         # Bảng tính Excel (SpreadsheetGrid, FormulaBar, CellEditorOverlay)
│   │   ├── sql/                           # Trình chạy SQL (SqlEditor, SchemaBrowser, ResultViewer)
│   │   ├── workspace/                     # Split-Pane IDE (WorkspaceSplitPane, ProblemPane, WorkspaceFooter)
│   │   ├── knowledge/                     # Markdown render bài học (KnowledgeViewer, SyntaxBlock)
│   │   └── ui/                            # Primitives UI (Button, Card, Input, Modal, Badge, Skeleton)
│   │
│   ├── domain/                            # Logic nghiệp vụ thuần túy (Pure Domain Engines)
│   │   ├── content/                       # Investigation & Question contracts
│   │   ├── game/                          # levelingEngine (Level 1–50 curve)
│   │   ├── mastery/                       # masteryEvaluator (Đánh giá kỹ năng chuyên sâu)
│   │   ├── reward/                        # rewardEvaluator (Idempotent XP transaction)
│   │   └── progress/                      # learnerProgress (Trạng thái hoàn thành bài học)
│   │
│   ├── pages/                             # Màn hình chức năng
│   │   ├── learner/                       # Giao diện học viên
│   │   │   ├── DashboardPage.jsx          # Bàn làm việc thám tử & nhiệm vụ ưu tiên
│   │   │   ├── LearningMapPage.jsx        # Bản đồ học tập đa Phase
│   │   │   ├── ExcelMissionPage.jsx       # Bàn làm việc phá án Excel
│   │   │   ├── SqlMissionPage.jsx         # Bàn làm việc phá án SQL
│   │   │   ├── PracticePage.jsx           # Rèn luyện kỹ năng tự do
│   │   │   ├── PracticeSandboxPage.jsx    # Sandbox W3Schools "Try It Yourself"
│   │   │   ├── AcademyCoursePage.jsx      # Giáo trình học viện W3Schools
│   │   │   ├── AcademyExamPage.jsx        # Thi tốt nghiệp cấp chứng chỉ
│   │   │   ├── ProfilePage.jsx            # Hồ sơ cá nhân & Chứng chỉ đã đạt
│   │   │   ├── AchievementsPage.jsx       # Bảng huy hiệu thành tích
│   │   │   └── KnowledgeHubPage.jsx       # Thư viện kiến thức & bài giảng Markdown
│   │   └── admin/                         # Giao diện Quản trị viên
│   │       ├── OverviewPage.jsx           # Thống kê tổng quan hệ thống
│   │       ├── AdminMissionsPage.jsx      # Quản lý danh sách vụ án
│   │       ├── AdminMissionEditorPage.jsx # Trình tạo & sửa vụ án trực quan
│   │       ├── AdminCoursesPage.jsx       # Quản lý khóa học
│   │       ├── AdminChaptersPage.jsx      # Quản lý chương học
│   │       ├── AdminDatasetsPage.jsx      # Quản lý & nhập CSV dataset
│   │       └── AdminKnowledgePage.jsx     # Quản lý bài học lý thuyết
│   │
│   ├── services/                          # Tầng kết nối dịch vụ (Service Gateway)
│   │   ├── index.js                       # Environment switch tập trung (Mock / Firebase / API)
│   │   ├── academyExamService.js          # Service chấm điểm thi & cấp chứng chỉ
│   │   ├── contracts/                     # Hợp đồng giao tiếp (Interface specifications)
│   │   ├── mock/                          # Mock Adapters nội bộ
│   │   └── api/                           # Firebase Production & Real API Adapters
│   │
│   ├── utils/                             # Tiện ích bổ trợ
│   │   ├── excelChecker.js                # Động cơ chấm điểm công thức Excel
│   │   ├── sqlChecker.js                  # Động cơ so sánh kết quả truy vấn SQL
│   │   ├── storage.js                     # LocalStorage wrapper an toàn
│   │   └── sql/                           # Worker transport, policy & SQLite loader
│   │
│   └── workers/sql/sqlEngine.worker.js    # Web Worker SQLite WASM cách ly
│
├── dist/                                  # Bản build production đóng gói sẵn sàng deploy
└── package.json                           # Dependencies & NPM Scripts
```

---

## 7. 🎯 KẾT LUẬN & ĐỀ XUẤT HÀNH ĐỘNG TIẾP THEO

- **Hiện trạng sản phẩm**: Toàn bộ Frontend từ Sprint 1 đến Sprint 9.5 đã đạt độ chín muồi cao nhất, kiểm thử tự động **72/72 test suites (567/567 tests PASS 100%)**, giao diện bóng bẩy, chạy mượt mà cả offline và online trên Vercel.
- **Hành động kế tiếp**: Khởi động **Sprint 10 (Backend API & Data Persistence)** bằng việc khởi tạo thư mục `backend/` với **Python FastAPI**, container **PostgreSQL** qua Docker Compose, và tạo migrations theo đúng các bảng dữ liệu đã được đặc tả chi tiết ở Mục 5 của tài liệu này.
