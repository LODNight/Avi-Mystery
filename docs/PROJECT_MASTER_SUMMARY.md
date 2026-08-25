# 📓 Avi-Mystery — Báo Cáo Tổng Hợp Chi Tiết Toàn Bộ Dự Án (Project Master Summary)

> **Tài liệu tổng hợp toàn diện nhất về sản phẩm Avi-Mystery**: Kiến trúc hệ thống, cấu trúc file, công dụng từng file, hợp đồng dữ liệu (contracts), danh sách tính năng hoàn thiện / chưa hoàn thiện, lộ trình Sprints mới, và hướng dẫn vận hành.
> **Cập nhật lần cuối:** 25/08/2026 sau khi hoàn tất Step 6.3 (Practice Engine & Mastery Integration & Sprint 6 Completion).

---

## 1. 📌 Tổng Quan Dự Án & Định Hướng Sản Phẩm (Product Overview)

### 1.1. Giới thiệu Sản phẩm
* **Tên dự án**: **Avi-Mystery**
* **Bản chất sản phẩm**: Nền tảng học tập phân tích dữ liệu theo hướng **Game hóa (Gamification)** kết hợp cốt truyện **Trinh thám (Detective Theme)**. Người học nhập vai thám tử giải quyết các vụ án dữ liệu thực tế.
* **Định hướng chiến lược (Scope Rules)**:
  1. **Excel First**: Ưu tiên xây dựng và ổn định công cụ thực hành Excel trước (**Sprint 3 — HOÀN THÀNH**).
  2. **SQL Second**: Tích hợp công cụ thực hành SQL trực tiếp trên trình duyệt bằng SQLite WASM In-Memory (**Sprint 4 — HOÀN THÀNH**).
  3. **Content & Dataset Decoupling**: Tái cấu trúc mô hình nội dung, bóc tách cấu hình chấm điểm khỏi submission service và độc lập hóa dataset (**Sprint 5 — HOÀN THÀNH**).
  4. **Game Progress System & Domain Adapter**: Tích hợp Progress Service, Leveling Engine, Idempotent XP Ledger và mở khóa Bản đồ Học tập lộ trình đa Giai đoạn Phase Navigation Tabs kết hợp Thẻ Độ thành thạo Kỹ năng Skill Mastery (**Sprint 6 — HOÀN THÀNH 100%**).
  5. **Frontend Mock First**: Toàn bộ hệ thống Frontend sử dụng kiến trúc Service Contracts & Gateway kết hợp Mock Service trước khi chuyển sang Production API thật mà không làm thay đổi UI.

### 1.2. Môi Trường Triển Khai & Demo
* **Trang Web Chính (Production/Staging)**: [https://avi-mystery.vercel.app/dashboard](https://avi-mystery.vercel.app/dashboard)
* **Nhánh Git Chiến Lược**:
  - `dev`: Phục vụ phát triển tính năng mới, tích hợp liên tục (CI/CD Staging).
  - `main`: Phục vụ phát hành chính thức người dùng cuối (Production Release).

---

## 2. 🏛 Phân Tầng Kiến Trúc & Các Khái Niệm Domain Lõi (Architecture & Domain Hierarchy)

### 2.1. Nhãn Phân Loại Trạng Thái Kiến Trúc
- `CURRENT`: Đã triển khai và verified hoàn tất trong mã nguồn thực tế (Sprint 1–6).
- `PLANNED`: Kế hoạch kiến trúc đã được chốt và chia nhỏ thành từng Step cụ thể (Sprint 7.1).
- `PROPOSED`: Định hướng phát triển tương lai đang chờ phê duyệt (Sprint 7–10).
- `DEPRECATED`: Cấu trúc cũ trong lộ trình bóc tách.
- `LEGACY`: Phục vụ tương thích ngược cho phiên bản ban đầu.

### 2.2. Chuỗi Phân Cấp Nội Dung & Tiến Độ Học Tập
```text
Learning Journey (Hành trình học tập)
  └── Phase (Giai đoạn)
       └── Chapter (Chương)
            └── Investigation (Bối cảnh truyện Vụ án)
                 └── Question (Nhiệm vụ kỹ thuật Excel/SQL)
                      ├── Question Variant (Biến thể bài tập)
                      └── Submission (Bài làm của người học)
                           └── Result (Kết quả chấm điểm & potentialXp)
                                └── Progress (Trao thưởng XP & Level - Progress Domain)
```

### 2.3. Phân Định Khái Niệm Quan Trọng
1. **Investigation vs Question**: `Investigation` sở hữu cốt truyện trinh thám và bối cảnh vụ án; `Question` sở hữu nhiệm vụ thao tác kỹ thuật (viết công thức Excel hay câu lệnh SQL).
2. **Question vs Question Variant**: `Question` định nghĩa đề bài chuẩn; `Question Variant` định nghĩa các bộ tham số khác nhau cho rèn luyện.
3. **Dataset (Bộ dữ liệu độc lập)**: Tồn tại độc lập với `datasetId` riêng, được tái sử dụng cho nhiều Question mà không nhân bản dữ liệu.
4. **Course vs Learning Map**: `Course` trả lời câu hỏi "Có những lộ trình/khóa học nào?"; `Learning Map` trả lời câu hỏi "Tôi đang ở đâu trên hành trình học tập?".
5. **Main Quest vs Practice**: `Main Quest` di chuyển tuyến tính theo cốt truyện; `Practice` làm bài tự do rèn luyện kỹ năng.
6. **Completion vs Mastery**: `Completion` là cờ Boolean (Đạt/Chưa đạt); `Mastery` là chỉ số đánh giá độ sâu (Chính xác, gợi ý, thời gian, tối ưu SQL).

---

## 3. 📁 Cấu Trúc File & Công Dụng Chi Tiết Toàn Bộ Dự Án (File Inventory)

```
Avi-Mystery/
├── AGENTS.md                          # Quy tắc làm việc & phạm vi hoạt động của Agent AI
├── README.md                          # Tài liệu hướng dẫn vận hành nhanh trang web cho người đọc
├── index.html                         # Điểm vào HTML chính của ứng dụng Vite
├── package.json                       # Khai báo dependencies, scripts và cấu hình dự án
├── vite.config.js                     # Cấu hình đóng gói Vite (hỗ trợ Web Worker & WASM)
├── vitest.config.js                   # Cấu hình môi trường chạy kiểm thử Vitest (jsdom, setupFiles)
├── tailwind.config.js                 # Cấu hình Design System, bảng màu Detective Amber & Light/Dark mode
├── postcss.config.js                  # Cấu hình xử lý CSS Tailwind
├── vercel.json                        # Cấu hình điều hướng Single Page Application trên Vercel
├── docs/                              # Hệ thống hồ sơ tài liệu quản lý dự án
│   ├── PROJECT_MASTER_SUMMARY.md      # [File Hiện Tại] File tổng hợp toàn bộ thông tin dự án
│   ├── CHECKLIST.md                   # Danh sách kiểm tra chi tiết các Step theo từng Sprint
│   ├── ROADMAP.md                     # Lộ trình tổng thể dự án theo cấu trúc Sprints bóc tách
│   ├── PROJECT_STATUS.md              # Báo cáo trạng thái hiện tại & công việc đang thực hiện
│   ├── BACKLOG.md                     # Bảng quản lý nhiệm vụ (Backlog & Task IDs)
│   ├── DECISIONS.md                   # Nhật ký các quyết định kiến trúc quan trọng (ADR)
│   ├── TEST_REPORT.md                 # Báo cáo kết quả kiểm thử tự động
│   └── agent/                         # Tài liệu chuẩn dành riêng cho AI Agent
│       ├── CONTRACTS.md               # Quy định các Service Contract & Domain Taxonomy
│       ├── LEARNING_MAP_CONTRACT.md   # Hợp đồng cây domain & adapter của Bản đồ Học tập
│       ├── CURRENT_TASK.md            # Thông tin nhiệm vụ đang thực thi ở lượt làm việc
│       ├── TEST_STRATEGY.md           # Chiến lược và quy chuẩn kiểm thử tự động
│       ├── MODULE_MAP.md              # Bảng phân vùng trách nhiệm và sơ đồ phụ thuộc Module
│       ├── UI_CHANGE_INVENTORY.md     # Nhật ký thay đổi giao diện người dùng
│       └── README.md                  # Hướng dẫn dành cho AI Agent trước khi sửa code
└── src/                               # Toàn bộ mã nguồn Frontend ứng dụng
    ├── app/                           # Lớp ứng dụng lõi (Routing, Layouts, Providers)
    │   ├── router/
    │   │   └── index.jsx              # Định tuyến toàn ứng dụng (React Router v6)
    │   ├── layouts/
    │   │   ├── LearnerLayout.jsx      # Khung giao diện Học viên (Sidebar co giãn, Topbar, Theme Toggle)
    │   │   ├── LearnerLayout.test.jsx # Test case kiểm tra khung giao diện Học viên
    │   │   └── AdminLayout.jsx        # Khung giao diện Quản trị viên (Admin Layout)
    │   └── providers/
    │       ├── AuthProvider.jsx       # Provider quản lý trạng thái Đăng nhập & Quyền hạn
    │       ├── BrandProvider.jsx      # Provider quản lý thông tin thương hiệu & Logo
    │       ├── BrandProvider.test.jsx # Test case cho BrandProvider
    │       ├── ThemeProvider.jsx      # Provider quản lý giao diện Sáng/Tối (Light/Dark Mode)
    │       └── PageStatusProvider.jsx # Provider kiểm soát trạng thái bảo trì trang (Maintenance state)
    ├── components/                    # Thư viện UI Components tái sử dụng
    │   ├── excel/                     # Các component cho công cụ thực hành Excel
    │   │   ├── SpreadsheetGrid.jsx    # Bảng tính Excel hỗ trợ ô dữ liệu, công thức, chọn vùng
    │   │   ├── SpreadsheetGrid.test.js# Test cases cho Bảng tính Excel
    │   │   ├── FormulaBar.jsx         # Thanh nhập công thức Excel tích hợp Pin-to-fx Hint
    │   │   ├── FormulaBar.test.jsx    # Test cases cho Thanh công thức Excel
    │   │   ├── HintPanel.jsx          # Ngăn kéo gợi ý (Hint Drawer) không block màn hình
    │   │   ├── HintPanel.test.jsx     # Test cases cho Ngăn kéo gợi ý
    │   │   ├── ActionToolbar.jsx      # Thanh công cụ chạy thử & nộp bài vụ án Excel
    │   │   ├── ActionToolbar.test.jsx # Test cases cho Thanh công cụ Excel
    │   │   ├── MissionResultModal.jsx # Cửa sổ chúc mừng phá án thành công (Victory Modal)
    │   │   └── MissionResultModal.test.jsx # Test cases cho Result Modal
    │   ├── sql/                       # Các component cho công cụ thực hành SQL
    │   │   ├── SchemaBrowser.jsx      # Trình duyệt sơ đồ CSDL (Tìm kiếm, xem cột, xem mẫu 3 hàng)
    │   │   ├── SchemaBrowser.test.jsx # Test cases cho Schema Browser
    │   │   ├── SqlEditor.jsx          # Khung soạn thảo câu lệnh SQL (Phím tắt Ctrl+Enter, Tab 2-space)
    │   │   ├── SqlEditor.test.jsx     # Test cases cho SQL Code Editor
    │   │   ├── ResultViewer.jsx       # Bảng hiển thị kết quả truy vấn SQL (Phân trang, format NULL/số)
    │   │   └── ResultViewer.test.jsx  # Test cases cho Result Viewer
    │   └── ui/                        # Bộ UI primitive components (Design System)
    │       ├── Button.jsx             # Nút bấm chuẩn với biến thể primary/secondary/ghost/danger
    │       ├── Input.jsx              # Khung nhập liệu chuẩn
    │       ├── Card.jsx               # Thẻ bao bọc nội dung
    │       ├── Badge.jsx              # Nhãn trạng thái & điểm XP
    │       ├── EmptyState.jsx         # Giao diện khi không có dữ liệu hoặc gặp lỗi
    │       ├── EmptyState.test.jsx    # Test cases cho EmptyState
    │       ├── Skeleton.jsx           # Khung xương tải trang (Skeleton loading pattern)
    │       └── Skeleton.test.jsx      # Test cases cho Skeleton Loading
    ├── domain/                        # Lớp quản lý Domain Logic & Entities
    │   ├── content/                   # Entity & Contracts cho Content Domain
    │   │   ├── contentIdentity.js     # Identity resolver cho Course/Phase/Chapter/Investigation/Question
    │   │   └── questionDomain.js      # Configuration & schema cho Question
    │   ├── learningMap/               # Adapter chuyển đổi dữ liệu cho Bản đồ Học tập
    │   │   ├── learningMapAdapter.js  # Adapter xây dựng cây lộ trình đa Phase & tính toán trạng thái
    │   │   └── learningMapAdapter.test.js # Unit tests cho adapter Bản đồ Học tập
    │   ├── progress/                  # Tiến độ học tập & Idempotent XP Ledger
    │   │   └── learnerProgress.js     # Progress state & records
    │   ├── reward/                    # Đánh giá phần thưởng XP
    │   │   └── rewardEvaluator.js     # Thưởng XP độc lập & Idempotent
    │   └── mastery/                   # Đánh giá mức độ thành thạo
    │       ├── masteryEvaluator.js    # Completion vs Skill Mastery evaluation
    │       └── masteryEvaluator.test.js # Unit tests cho bộ tính toán Mastery
    ├── hooks/                         # React Custom Hooks
    │   ├── useProgress.js             # Hook thời gian thực quản lý Progress, XP & Skill Mastery State
    │   └── useProgress.test.jsx       # Unit test suite cho useProgress hook
    ├── pages/                         # Các trang giao diện chính
    │   ├── learner/                   # Phân vùng trang dành cho Học viên
    │   │   ├── DashboardPage.jsx      # Trang Tổng quan Học viên (Thống kê tiến độ, Vụ án đang làm)
    │   │   ├── CoursesPage.jsx        # Danh sách Khóa học (Excel, SQL, Data Analysis)
    │   │   ├── CoursesPage.test.jsx   # Test cases cho trang Khóa học
    │   │   ├── CourseDetailPage.jsx   # Trang Chi tiết Khóa học & Cây bài học
    │   │   ├── CourseDetailPage.test.jsx # Test cases cho Chi tiết Khóa học
    │   │   ├── LearningMapPage.jsx    # Bản đồ Học tập lộ trình đa Giai đoạn & Skill Mastery Summary Card
    │   │   ├── LearningMapPage.test.jsx # Test cases cho Bản đồ Học tập
    │   │   ├── MissionIntroPage.jsx   # Trang Giới thiệu Vụ án & Bối cảnh cốt truyện
    │   │   ├── MissionIntroPage.test.jsx # Test cases cho Giới thiệu Vụ án
    │   │   ├── ExcelMissionPage.jsx   # Trang Thực hành Vụ án Excel
    │   │   ├── ExcelMissionPage.test.jsx # Test cases cho Trang Thực hành Excel
    │   │   ├── SqlMissionPage.jsx     # Trang Thực hành Vụ án SQL
    │   │   ├── SqlMissionPage.test.jsx # Test cases cho Trang Thực hành SQL
    │   │   └── UnderMaintenancePage.jsx # Trang Thông báo Tính năng đang Bảo trì/Phát triển
    │   ├── admin/                     # Phân vùng trang dành cho Quản trị viên
    │   │   ├── OverviewPage.jsx       # Trang Tổng quan Admin
    │   │   ├── PageStatusPage.jsx     # Trang Quản lý Bật/Tắt Trạng thái các Page
    │   │   └── SettingsPage.jsx       # Trang Cấu hình Hệ thống Admin
    │   └── NotFoundPage.jsx           # Trang Lỗi 404 Đường dẫn không tồn tại
    ├── services/                      # Lớp Dịch vụ & Hợp đồng Kết nối (Services & Gateway)
    │   ├── index.js                   # Service Gateway duy nhất xuất các ServiceInstance & Adapters
    │   ├── pageStatusService.js       # Dịch vụ kiểm tra trạng thái bảo trì trang
    │   ├── contracts/                 # Định nghĩa các Hợp đồng Dữ liệu (Interfaces/Contracts)
    │   │   ├── authService.js         # Contract Xác thực Đăng nhập
    │   │   ├── courseService.js       # Contract Khóa học & Chương học
    │   │   ├── missionService.js      # Contract Vụ án & Bài học Excel
    │   │   ├── sqlMissionService.js   # Contract Vụ án SQL & Bộ dữ liệu SQL
    │   │   ├── submissionService.js   # Contract Nộp bài & Đánh giá Kết quả (Excel/SQL)
    │   │   ├── contentService.js      # Contract Nạp cấu hình nội dung & evaluator config
    │   │   ├── datasetService.js      # Contract Quản lý bộ dữ liệu độc lập
    │   │   ├── investigationService.js# Contract Quản lý entity Investigation
    │   │   ├── questionService.js     # Contract Quản lý entity Question
    │   │   └── progressService.js     # Contract Lưu trữ tiến độ, mode-aware attempts & Skill Mastery
    │   └── mock/                      # Triển khai Mock Service chạy trên Frontend
    │       ├── mockAuthService.js     # Mock Đăng nhập & Phân quyền
    │       ├── mockCourseService.js   # Mock Dữ liệu Khóa học
    │       ├── mockMissionService.js  # Mock Dữ liệu Vụ án Excel
    │       ├── mockSqlMissionService.js # Mock Dữ liệu Vụ án SQL
    │       ├── mockSubmissionService.js # Gateway đánh giá bài làm Excel/SQL & trả kết quả
    │       ├── mockDatasetService.js  # Mock Bộ dữ liệu độc lập
    │       ├── mockProgressService.js # Mock Lưu trữ tiến độ người học & Skill Mastery records
    │       └── mockContentService.js  # Mock Nội dung phân cấp Course -> Phase -> Chapter
    ├── utils/                         # Công cụ Tính toán & Xử lý Logic Thuần túy (Pure Functions)
    │   ├── format.js                  # Hàm format định dạng Số, Tiền tệ, Ngày tháng, Thời lượng, XP
    │   ├── storage.js                 # Hàm tương tác LocalStorage an toàn
    │   ├── excelChecker.js            # Bộ đánh giá bài làm Excel thuần túy (Value & Formula checker)
    │   ├── excelChecker.test.js       # Unit tests cho Bộ đánh giá Excel
    │   ├── game/                      # Công cụ logic Game & Leveling
    │   │   ├── levelingEngine.js      # Pure formula tính Level (1-50) & XP
    │   │   └── levelingEngine.test.js # Unit tests cho Leveling Engine
    │   └── sql/                       # Động cơ & Bộ công cụ xử lý SQL
    │       ├── index.js               # Export Factory khởi tạo SQL Engine
    │       ├── sqlEngineAdapter.js    # Adapter giao tiếp giữa Main Thread và Web Worker
    │       ├── sqlQueryPolicy.js      # Bộ kiểm soát An toàn SQL (Read-only, Multi-statement guard)
    │       ├── sqlChecker.js          # Bộ đánh giá kết quả truy vấn SQL (Order/NULL/Tolerance)
    │       ├── sqlDataset.js          # Công cụ tải & chuẩn hóa Dữ liệu mẫu SQLite
    │       └── sqlErrors.js           # Định nghĩa Mã lỗi SQL chuẩn & Thông điệp tiếng Việt
    ├── workers/                       # Luồng chạy ngầm cách ly (Web Workers)
    │   └── sql/
    │       └── sqlEngine.worker.js    # Web Worker thực thi SQLite WASM in-memory
    └── mocks/                         # Dữ liệu Mẫu (Mock Data JSON)
        └── data/
            ├── users.json             # Danh sách Người dùng mẫu (Learner, Admin)
            ├── courses.json           # Danh sách Khóa học mẫu
            ├── chapters.json          # Danh sách Chương học mẫu
            ├── investigations.json    # Danh sách Bối cảnh Vụ án trinh thám
            ├── questions.json         # Danh sách Nhiệm vụ kỹ thuật & Variants
            ├── datasets.json          # Danh sách Bộ dữ liệu Excel/SQL
            ├── hints.json             # Danh sách Gợi ý có phí XP
            └── sql/                   # Dữ liệu khởi tạo SQL (.json schema & rows)
                ├── sql-sales-v1.json  # Dataset Bán hàng vụ án SQL 01
                ├── sql-commerce-v1.json# Dataset Thương mại điện tử vụ án SQL 02
                └── aviation-spike.json# Dataset Hàng không spike
```

---

## 4. 📊 Danh Sách Tính Năng: Đã Hoàn Thành vs Chưa Hoàn Thành

### 4.1. 🟢 Các Tính Năng Đã Hoàn Thành (Sprint 1 đến Sprint 6.3 — CURRENT)

| STT | Phân Vùng | Tính Năng | Mô Tả Chi Tiết | Trạng Thái |
|---|---|---|---|---|
| 1 | **Shared** | Auth & Demo Login | Đăng nhập demo nhanh cho Học viên / Admin, quản lý token & phiên làm việc trong `AuthProvider` | **CURRENT** |
| 2 | **Shared** | Design System & Theme | Detective Amber Design System, hỗ trợ Light Mode / Dark Mode toàn diện, Collapsible Sidebar | **CURRENT** |
| 3 | **Shared** | Maintenance Mode | Cho phép Admin bật/tắt bảo trì theo từng trang (`PageStatusProvider`, `UnderMaintenancePage`) | **CURRENT** |
| 4 | **Learner** | Dashboard & Courses | Trang Tổng quan học viên, Danh sách Khóa học Excel/SQL, Trang Chi tiết Khóa học | **CURRENT** |
| 5 | **Learner** | Learning Map Domain Tree | Bản đồ học tập chuyển đổi domain (`Journey -> Phase -> Chapter -> Investigation`), hỗ trợ Phase tabs | **CURRENT** |
| 6 | **Learner** | Mission Briefing | Trang Giới thiệu Vụ án (`MissionIntroPage`) hiển thị bối cảnh cốt truyện & mục tiêu | **CURRENT** |
| 7 | **Excel** | Spreadsheet Grid | Bảng tính Excel hiển thị ô dữ liệu, công thức, định dạng số, chọn vùng cell | **CURRENT** |
| 8 | **Excel** | Formula Bar & Hint Drawer | Thanh nhập công thức Excel tích hợp tính năng ghim gợi ý (Pin-to-fx), Ngăn kéo gợi ý không che màn hình | **CURRENT** |
| 9 | **Excel** | Excel Evaluator | Bộ kiểm tra công thức Excel thuần túy (`excelChecker.js`), kiểm tra chính xác giá trị và công thức | **CURRENT** |
| 10 | **SQL** | In-Browser SQLite Engine | Động cơ SQLite WASM thực thi truy vấn in-memory thông qua Web Worker | **CURRENT** |
| 11 | **SQL** | Schema Browser | Trình duyệt CSDL: Tìm kiếm bảng/cột, nhãn PK/NOT NULL, xem nhanh 3 dòng mẫu, sao chép tên | **CURRENT** |
| 12 | **SQL** | SQL Code Editor | Khung soạn thảo SQL: Phím tắt `Ctrl + Enter`, lề `Tab 2-space`, font 14px | **CURRENT** |
| 13 | **SQL** | Query Result Viewer | Bảng hiển thị kết quả: Phân trang 50 dòng/trang, định dạng `NULL`/BOOLEAN/Số phân cách nghìn | **CURRENT** |
| 14 | **SQL** | Security Guard & Timeout | Bộ lọc Read-only chặn 12 từ khóa cấm, chặn multi-statement, ngắt timeout 3s, cắt dòng > 500 rows | **CURRENT** |
| 15 | **SQL** | Worker Memory Cleanup | Tự động dọn dẹp Web Worker khi unmount trang hoặc đổi bộ dữ liệu vụ án | **CURRENT** |
| 16 | **SQL** | SQL Result Evaluator | Bộ đánh giá kết quả SQL (`sqlChecker.js`) thông minh: Xử lý thứ tự dòng, NULL, trùng lặp, sai số thập phân | **CURRENT** |
| 17 | **Submission** | Submission Gateway & Modal | Tích hợp luồng nộp bài Excel & SQL, mở Modal chúc mừng khi làm đúng, hiển thị lỗi inline khi làm sai | **CURRENT** |
| 18 | **Content** | Domain Decoupling | Phân tách `Dataset`, `Content`, `Investigation`, `Question`, `Progress`, `Reward` & `Mastery` | **CURRENT** |
| 19 | **Progress** | Single Source of Truth Hook | Dynamic `useProgress` React hook quản lý tập trung Progress state, XP Ledger & Skill Mastery | **CURRENT** |
| 20 | **Mastery** | Skill Mastery Summary UI | Thẻ tổng quan trình độ thám tử kỹ năng (Novice -> Master Detective) hiển thị trên `LearningMapPage` | **CURRENT** |

---

## 5. 🗺 Lộ Trình Sprints Mới (Reconciled Roadmap Summary)

* **Sprint 1: Frontend Foundation** ➔ **CURRENT** (Vite, React, Tailwind, Detective Amber Theme, RBAC).
* **Sprint 2: Course & Learning Map Baseline** ➔ **CURRENT** (Courses, Course Details, Static Map, Briefing).
* **Sprint 3: Excel Vertical Slice** ➔ **CURRENT** (Spreadsheet Grid, Formula Bar, Hint Drawer, Excel Checker, Submission Gateway).
* **Sprint 4: SQL Vertical Slice** ➔ **CURRENT** (SQLite WASM Engine, Worker, Schema Browser, SqlEditor, ResultViewer, Read-only Policy, Build Gate).
* **Sprint 5: Content Domain & Dataset Decoupling** ➔ **HOÀN THÀNH 100%** (Dataset, Content, Investigation, Question, Progress, XP Reward, Mastery).
* **Sprint 6: Game Progress & Progression Architecture** ➔ **HOÀN THÀNH 100%** (Step 6.1 Learning Map Adapter, Step 6.2 UX Refactor & Step 6.3 Practice Engine & Mastery Integration HOÀN THÀNH).
* **Sprint 7: Learner Engagement & Practice Engine** ➔ **PROPOSED**.
* **Sprint 8: Admin Content Studio** ➔ **PROPOSED**.
* **Sprint 9: Backend API & Persistence** ➔ **PROPOSED**.
* **Sprint 10: Production Hardening & Release** ➔ **PROPOSED**.
