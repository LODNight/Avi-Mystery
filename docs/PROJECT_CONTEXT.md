

--- Content of docs/PROJECT_MASTER_SUMMARY.md ---

# 📓 Avi-Mystery — Báo Cáo Tổng Hợp Chi Tiết Toàn Bộ Dự Án (Project Master Summary)

> **Tài liệu tổng hợp toàn diện nhất về sản phẩm Avi-Mystery**: Kiến trúc hệ thống, cấu trúc file, công dụng từng file, hợp đồng dữ liệu (contracts), danh sách tính năng hoàn thiện / chưa hoàn thiện, lộ trình Sprints mới, và hướng dẫn vận hành.
> **Cập nhật lần cuối:** 27/08/2026 sau khi hoàn tất Sprint 7 (Learner Engagement & Practice Engine).

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
* **Sprint 7: Learner Engagement & Practice Engine** ➔ **HOÀN THÀNH 100%** (Level Up Modal, Standalone Practice Workspace, Learner Profile & Achievement Badges, Activity History).
* **Sprint 8: Admin Content Studio** ➔ **PROPOSED**.
* **Sprint 9: Backend API & Persistence** ➔ **PROPOSED**.
* **Sprint 10: Production Hardening & Release** ➔ **PROPOSED**.


--- Content of docs/ROADMAP.md ---

# Lộ Trình Phát Triển Dự Án Avi-Mystery (Project Roadmap)

> **Định hướng chiến lược:** Phát triển dự án theo mô hình Vertical Slice & Iterative Sprints. Ưu tiên hoàn thiện các luồng nghiệp vụ lõi (Excel & SQL practice) trước khi tái cấu trúc Learning Domain, tích hợp Game Progress, Admin Builder và Backend API.
> Các khu vực hệ thống bao gồm: `LRN` (Learner App), `ADM` (Admin App), `SHR` (Shared Layout & System Architecture), `BE` (Backend & Mock Services), `GAME` (Gamification & Progress Domain).
>
> **Nguồn trạng thái thực thi:** [`agent/CURRENT_TASK.md`](./agent/CURRENT_TASK.md). Roadmap mô tả thứ tự chiến lược và mục tiêu; không cho phép agent tự chuyển Sprint/Step.

---

## 🏛 Khung Phân Loại Kiến Trúc (Architecture Categorization Framework)

| Nhãn Trạng Thái | Ý Nghĩa Architecture |
|---|---|
| `CURRENT` | Đã triển khai hoàn tất trong source code, đã verified qua unit & integration tests. |
| `PLANNED` | Đã chốt spec và step decomposition, sẵn sàng thực thi theo kế hoạch. |
| `PROPOSED` | Định hướng kiến trúc tương lai, đang chờ phê duyệt hoặc phụ thuộc Sprint trước. |
| `DEPRECATED` | Mô hình cũ hoặc cấu trúc tạm thời đang trong lộ trình loại bỏ. |
| `LEGACY` | Các ID/Adapter từ giai đoạn đầu (Sprint 1–2) phục vụ backward compatibility. |

---

## 🎯 Phân Định Khái Niệm Domain Lõi (Core Domain Distinctions)

1. **Learning Journey (Hành trình) vs Phase (Giai đoạn) vs Course (Khóa học) vs Learning Map (Bản đồ học tập)**:
   - `Course`: Danh mục đóng gói kiến thức theo chủ đề (ví dụ: *Excel Adventure*, *SQL Investigation*).
   - `Learning Map`: Giao diện trực quan dạng cây Node biểu diễn tiến độ di chuyển của người học qua từng giai đoạn (`Phase`) và bài tập.
   - `Learning Journey`: Tuyến đường tổng thể đưa người học từ *Level 1 (Tập sự)* đến *Mastery*.

2. **Investigation (Vụ án / Câu chuyện) vs Question (Nhiệm vụ / Câu hỏi) vs Question Variant (Biến thể)**:
   - `Investigation`: Bối cảnh cốt truyện trinh thám, hồ sơ vụ án và tư liệu ban đầu.
   - `Question`: Nhiệm vụ kỹ thuật cụ thể (viết 1 công thức Excel hoặc 1 câu lệnh SQL) thuộc một Investigation.
   - `Question Variant`: Các biến thể tham số/dữ liệu của cùng 1 Question dùng cho luyện tập lại (Replay / Practice) hoặc chống gian lận.

3. **Dataset (Bộ dữ liệu độc lập)**:
   - Bộ dữ liệu (SQL Schema / Excel Table) được quản lý độc lập, tái sử dụng cho nhiều Question/Investigation khác nhau mà không bị nhân bản file.

4. **Main Quest (Nhiệm vụ chính) vs Practice (Luyện tập tự do)**:
   - `Main Quest`: Luồng mở khóa tuyến tính trên Bản đồ Học tập, ghi nhận `Completion` và tiến trình học.
   - `Practice`: Chế độ giải bài tự do trong ngân hàng câu hỏi, hỗ trợ rèn luyện kỹ năng mà không ảnh hưởng đến cốt truyện chính.

5. **Completion (Hoàn thành) vs Mastery (Thành thạo)**:
   - `Completion`: Trạng thái Boolean (Đã đạt / Chưa đạt) xác nhận người học đã giải đúng nhiệm vụ để mở khóa nút tiếp theo.
   - `Mastery`: Chỉ số đánh giá độ sâu (Độ chính xác, thời gian giải, số gợi ý đã dùng, điểm tối ưu câu lệnh SQL).

---

## 🟢 Sprint 1 — Frontend Foundation (`CURRENT`)

* **Dominant Architectural Objective:** Thiết lập khung hạ tầng ứng dụng Frontend, hệ thống phân quyền RBAC 3 roles, giao diện Detective Amber và cơ chế kiểm thử Vitest.
* **Status:** `CURRENT` (Hoàn thành 100%).
* **Key Deliverables:** App Shell, Learner & Admin Layouts, Design System tokens, Mock Adapters (`mockAuthService`, `mockCourseService`, `mockMissionService`).

---

## 🟢 Sprint 2 — Course & Learning Map Baseline (`CURRENT`)

* **Dominant Architectural Objective:** Xây dựng luồng khám phá lộ trình học tập, danh sách khóa học, cấu trúc chương và bản đồ học tập tĩnh cho Người học.
* **Status:** `CURRENT` (Hoàn thành 100%).
* **Key Deliverables:** `CoursesPage`, `CourseDetailPage`, `LearningMapPage` (Static nodes), `MissionIntroPage`, Admin Page Status Manager.

---

## 🟢 Sprint 3 — Excel Vertical Slice (`CURRENT`)

* **Dominant Architectural Objective:** Môi trường thực hành Excel tương tác trực tiếp, chấm điểm công thức tự động, Hint drawer và Submission gateway.
* **Status:** `CURRENT` (Hoàn thành 100%).
* **Key Deliverables:** `SpreadsheetGrid`, `FormulaBar`, `HintPanel`, pure evaluator `excelChecker.js`, `mockSubmissionService`, targeted 73/73 tests, full regression 133/133 tests pass.

---

## 🟢 Sprint 4 — SQL Vertical Slice (`CURRENT`)

* **Dominant Architectural Objective:** Động cơ thực thi SQL SQLite WASM In-Memory chạy trong Web Worker cách ly, Schema Browser, SQL Editor và Security Policy Guard.
* **Status:** `CURRENT` (Hoàn thành 100%).
* **Key Deliverables:** SQLite WASM Worker (`sqlEngine.worker.js`), `sqlEngineAdapter.js`, `sqlQueryPolicy.js` (chặn 12 từ khóa đột biến & multi-statement), `SchemaBrowser`, `SqlEditor`, `ResultViewer`, pure evaluator `sqlChecker.js`, submission integration, 222+ tests pass.

---

## 🟡 Sprint 5 — Content Domain & Dataset Decoupling (`PLANNED`)

* **Dominant Architectural Objective:** Tái cấu trúc mô hình nội dung, tách biệt Investigation (Cốt truyện) và Question (Nhiệm vụ), giải phóng Dataset thành tài sản tái sử dụng độc lập, bóc tách evaluator config khỏi `mockSubmissionService`.

### 🔹 Step 5.1: Content Schema & Evaluation Config Extraction
* **Objective:** Bóc tách các cấu hình kiểm thử hardcoded (`EXCEL_CHECKER_CONFIG`, `SQL_CHECKER_CONFIG`) ra khỏi `mockSubmissionService.js` đưa vào Content Layer contract.
* **Scope:** Tạo contract truy xuất cấu hình chấm điểm theo Question/Step, refactor `mockSubmissionService.js` để đọc config động.
* **Dependencies:** Sprint 3 (Excel Checker) & Sprint 4 (SQL Checker).
* **Files/Modules Affected:** `src/services/contracts/contentService.js` [NEW], `src/services/mock/mockSubmissionService.js` [MODIFY], `src/mocks/data/` [MODIFY].
* **Acceptance Criteria:** `mockSubmissionService` không chứa bất kỳ Object hardcode `EXCEL_CHECKER_CONFIG` hay `SQL_CHECKER_CONFIG` nào; toàn bộ config được nạp qua `contentService`.
* **Tests:** `npm test -- --run src/services/mock/mockSubmissionService.test.js`
* **Rollback Consideration:** Nếu nạp config động thất bại, `contentService` trả error standard `CONTENT_CONFIG_MISSING`.
* **Explicit Non-Goals:** Không sửa UI, không mutate XP, không xây backend API, không tạo database mới.

### 🔹 Step 5.2: Investigation, Question & Variant Domain Separation
* **Objective:** Chuẩn hóa sơ đồ dữ liệu phân tách rõ `Investigation` (Truyện/Bối cảnh) và `Question` (Nhiệm vụ/Câu hỏi) kèm hỗ trợ `Question Variant`.
* **Scope:** Định nghĩa Hợp đồng dữ liệu `Investigation` và `Question`, cập nhật mock json data (`investigations.json`, `questions.json`).
* **Dependencies:** Step 5.1.
* **Files/Modules Affected:** `src/services/contracts/contentService.js`, `src/mocks/data/investigations.json` [NEW], `src/mocks/data/questions.json` [NEW].
* **Acceptance Criteria:** 1 Investigation chứa được 1 hoặc nhiều Question steps; Question có thể khai báo nhiều Variant cho bài tập rèn luyện.
* **Tests:** Unit test cho Content Service API (`getInvestigation`, `getQuestionById`).
* **Rollback Consideration:** Duy trì alias mapping backward compatibility cho `missionId` cũ.
* **Explicit Non-Goals:** Không thay đổi các component UI hiển thị, không làm vỡ các route `/missions/:missionId`.

### 🔹 Step 5.3: Dataset Domain Independence & Schema Registry
* **Objective:** Biến Dataset (Excel Workbook / SQL SQLite Schema) thành tài sản độc lập có thể gán cho nhiều Question khác nhau mà không nhân bản dữ liệu.
* **Scope:** Tạo `datasetService` contract & registry, cập nhật SQL dataset loader để nạp và cache schema an toàn.
* **Dependencies:** Step 5.2.
* **Files/Modules Affected:** `src/services/contracts/datasetService.js` [NEW], `src/services/mock/mockDatasetService.js` [NEW], `src/utils/sql/sqlDataset.js` [MODIFY].
* **Acceptance Criteria:** Một dataset có thể dùng chung cho 5+ Question SQL/Excel mà không cần nạp lại file JSON trùng lặp.
* **Tests:** Test cases kiểm tra việc khởi tạo dataset độc lập và tính chia sẻ schema.
* **Rollback Consideration:** Giữ nguyên thuộc tính `datasetId` trên mission data làm fallback.
* **Explicit Non-Goals:** Không xây giao diện Upload Dataset cho Admin, không kết nối database ngoài.

---

## ⚪ Sprint 6 — Game Progress & Progression Architecture (`PLANNED`)

* **Dominant Architectural Objective:** Xây dựng `Progress Service` lưu trữ trạng thái học tập, sổ cái XP (XP Ledger) có tính Idempotent, công thức thăng cấp `levelingEngine`, và kết nối dữ liệu tiến độ thực tế vào `LearningMapPage`.

### 🔹 Step 6.1: Leveling Engine & XP Ledger Contract
* **Objective:** Phát triển module tính toán Level (1–50) thuần túy `levelingEngine.js` và `progressService` contract xử lý trao thưởng XP idempotent.
* **Scope:** Xây dựng công thức XP, định nghĩa contract lưu trữ tiến độ học viên trong storage.
* **Dependencies:** Sprint 5 Content Domain.
* **Files/Modules Affected:** `src/utils/game/levelingEngine.js` [NEW], `src/services/contracts/progressService.js` [NEW], `src/services/mock/mockProgressService.js` [NEW].
* **Acceptance Criteria:** Tính toán chính xác Level/XP/Danh hiệu; `progressService` nhận `SubmissionResult` và ghi nhận XP không bị cộng trùng khi submit lại bài đã đúng.
* **Tests:** `levelingEngine.test.js` & `mockProgressService.test.js`.
* **Rollback Consideration:** Lỗi ghi tiến độ không làm đứt luồng hiển thị kết quả làm bài của người học.
* **Explicit Non-Goals:** Chưa tạo giao diện Profile phức tạp, chưa làm Streak counter.

### 🔹 Step 6.2: Main Quest vs Practice Progress & Mastery Tracking
* **Objective:** Phân định rõ tiến độ `Main Quest` (mở khóa tuyến tính) và `Practice` (luyện tập tự do), đồng thời tính toán chỉ số `Mastery` (Độ chính xác, gợi ý đã dùng, thời gian làm bài).
* **Scope:** Cấu trúc dữ liệu bản ghi tiến độ, logic tính toán chỉ số Mastery.
* **Dependencies:** Step 6.1.
* **Files/Modules Affected:** `src/services/mock/mockProgressService.js`, `src/utils/game/masteryCalculator.js` [NEW].
* **Acceptance Criteria:** Bài tập Practice không ghi nhận mở khóa cốt truyện chính nhưng cập nhật chỉ số Mastery cho học viên.
* **Tests:** Integration test kiểm tra sự độc lập giữa Main Quest progress và Practice score.
* **Rollback Consideration:** Mặc định mọi attempt cũ thuộc Main Quest mode.
* **Explicit Non-Goals:** Chưa can thiệp giao diện Admin analytics.

### 🔹 Step 6.3: Dynamic Learning Map Progression
* **Objective:** Thay thế dữ liệu hardcode (`isCompleted = false`) trên `LearningMapPage.jsx` bằng dữ liệu tiến độ thực tế từ `progressService` thông qua `useProgress` hook.
* **Scope:** Xây dựng `useProgress` hook và tích hợp trạng thái Locked/Unlocked/Completed cho từng Node bài học.
* **Dependencies:** Step 6.1 & Step 6.2.
* **Files/Modules Affected:** `src/hooks/useProgress.js` [NEW], `src/pages/learner/LearningMapPage.jsx` [MODIFY].
* **Acceptance Criteria:** Bản đồ học tập tự động mở khóa nút bài học kế tiếp ngay khi người học hoàn thành bài học trước đó.
* **Tests:** `LearningMapPage.test.jsx` kiểm tra render các trạng thái Node khác nhau theo mock progress state.
* **Rollback Consideration:** Phục hồi trạng thái mặc định mở khóa Chương 1 nếu không lấy được progress.
* **Explicit Non-Goals:** Không thay đổi CSS layout của Bản đồ học tập.

---

## 🟢 Sprint 7 — Learner Engagement & Practice Engine (`CURRENT`)

* **Dominant Architectural Objective:** Phát triển các tính năng tăng cường tương tác cho Học viên (Modal Thăng Cấp, Chuỗi Streak, Ngân hàng Luyện tập, Trang Hồ sơ Cá nhân, Danh hiệu Thám tử & Lịch sử Hoạt động).
* **Sub-Steps (Completed):**
  - **Step 7.1:** Level Up Modal & Streak Counter (`GAME-UI-7.1`)
  - **Step 7.2:** Standalone Practice Workspace (`LRN-PRAC-7.2`)
  - **Step 7.3:** Learner Profile & Achievement Badges (`GAME-PROF-7.3`)
  - **Step 7.4:** Activity History Timeline Page (`GAME-HIST-7.4`)
  - **Step 7.5:** Firebase Production Infrastructure Migration (`SYS-FB-7.5`)

---

## ⚪ Sprint 8 — Admin Content Studio (`PROPOSED`)

* **Dominant Architectural Objective:** Xây dựng bộ công cụ Quản trị cho Admin để tự soạn thảo Investigation, Question, Dataset và xem trước trực tiếp.
* **Sub-Steps (Proposed):**
  - **Step 8.1:** Visual Investigation & Question Authoring Studio (`ADM-STUDIO-8.1`)
  - **Step 8.2:** Dataset Importer & SQLite Schema Generator (`ADM-DATA-8.2`)
  - **Step 8.3:** Admin Live Preview & Test Runner (`ADM-PREV-8.3`)

---

## ⚪ Sprint 9 — Backend API & Persistence (`PROPOSED`)

* **Dominant Architectural Objective:** Triển khai FastAPI Backend, Cơ sở dữ liệu PostgreSQL, Xác thực JWT và chuyển đổi Frontend từ Mock Adapters sang Real API Adapters.
* **Sub-Steps (Proposed):**
  - **Step 9.1:** FastAPI Application & PostgreSQL ORM Core (`BE-CORE-9.1`)
  - **Step 9.2:** Real API Gateway Adapters & JWT Security (`BE-GATEWAY-9.2`)

---

## ⚪ Sprint 10 — Production Hardening & Release (`PROPOSED`)

* **Dominant Architectural Objective:** Tối ưu hóa hiệu năng, bảo mật OWASP, Admin Analytics Dashboard và phát hành Production chính thức.
* **Sub-Steps (Proposed):**
  - **Step 10.1:** Admin Analytics & Learner Insights Dashboard (`ANL-DASH-10.1`)
  - **Step 10.2:** Bundle Optimization, Security Audit & Docker Packaging (`SYS-HARD-10.2`)


--- Content of docs/PROJECT_STATUS.md ---

# Trạng Thái Dự Án Avi-Mystery

> **Cập nhật lần cuối:** 27/08/2026
> **Nguồn task hiện tại:** [`agent/CURRENT_TASK.md`](./agent/CURRENT_TASK.md)

---

## 1. Tổng Quan Tiến Độ

| Hạng mục | Trạng thái |
|---|---|
| **Kiến trúc** | Domain-Driven: `Course → Phase → Chapter → Investigation → Question` |
| **Sprint hoàn thành** | Sprint 1 → 7 (100%) |
| **Sprint hiện tại** | **Sprint 8 — Admin Content Studio (Chuẩn bị bắt đầu)** |
| **Test suite** | `110 / 110` tests PASS (Vitest 2.1.9) — cập nhật 27/08/2026 |
| **Build** | `npm run build` PASS — không lỗi biên dịch |

---

## 2. Lịch Sử Sprint & Trạng Thái

| Sprint | Tên | Trạng thái |
|---|---|---|
| **Sprint 1** | Frontend Foundation & RBAC | `DONE` |
| **Sprint 2** | Course, Learning Map & Admin | `DONE` |
| **Sprint 3** | Excel Vertical Slice | `DONE` |
| **Sprint 4** | SQL Vertical Slice (WASM + Worker) | `DONE` |
| **Sprint 5** | Content Domain & Dataset Decoupling | `DONE` |
| **Sprint 6** | Game Progress & Progression Architecture | `DONE` |
| **Sprint 6.5** | Learner Onboarding & First-Run Experience | `DONE` |
| **Sprint 6.6** | Dashboard Deep Guided Tour Refinement | `DONE` |
| **Sprint 6.7** | Admin Onboarding Dev Testing Tools | `DONE` |
| **Sprint 7.1** | Level Up Popups & Streak Counter Engine | `DONE` |
| **Sprint 7.2** | Standalone Practice Workspace | `DONE` |
| **Sprint 7.3** | Learner Profile & Achievement Badges | `DONE` |
| **Sprint 7.4** | Activity History Timeline Page | `DONE` |
| **Sprint 7.5** | Firebase Production Infrastructure Migration | `DONE` |
| **Sprint 8** | Admin Content Studio | `PROPOSED` |
| **Sprint 9** | Backend API & Persistence (FastAPI) | `PROPOSED` |

---

## 3. Feature Coverage Matrix

| ID | Area | Feature | Sprint | Test |
|---|---|---|---|---|
| `SHR-AUTH-001` | Auth | RBAC Guard (`RequireAuth`, `RequireLearner`, `RequireAdmin`) | 1 | PASS |
| `SHR-AUTH-002` | Auth | Design System Detective Amber (Light/Dark) | 1 | PASS |
| `SHR-UI-001` | UI | Standard UI Components (`Button`, `Card`, `Input`, `Badge`) | 1 | PASS |
| `SHR-UI-002` | UI | Accessible Loading Skeletons (`aria-busy`) | 1 | PASS |
| `LRN-COURSE-001` | Course | Danh sách & Chi tiết Khóa học | 2 | PASS |
| `LRN-MAP-001` | Map | Learning Map — Multi-Phase Navigation | 2 | PASS |
| `LRN-EXCEL-001` | Excel | Excel Mission Workspace | 3 | PASS |
| `LRN-SQL-4.x` | SQL | SQL Engine (WASM Worker, Policy, Checker) | 4 | PASS |
| `CNT-INV-5.3` | Content | Investigation Domain Contract | 5 | PASS |
| `DATA-REG-5.1` | Dataset | Independent Dataset Registry | 5 | PASS |
| `LRN-PRG-5.6` | Progress | Learner Progress State & XP | 5 | PASS |
| `RWD-XP-5.7` | Reward | Idempotent XP Ledger | 5 | PASS |
| `MST-SKL-5.8` | Mastery | Skill Mastery Evaluator | 5 | PASS |
| `MAP-ADP-6.1` | Map | Learning Map Domain Adapter | 6 | PASS |
| `MAP-UX-6.2` | Map | Learning Map UX (Phase Tabs) | 6 | PASS |
| `MST-ENG-6.3` | Mastery | Practice Engine & Mastery Hook | 6 | PASS |
| `ONB-6.5` | Onboarding | Welcome Gate & Tutorial Case 0 | 6.5 | PASS |
| `TOUR-6.6` | Tour | Dashboard 5-Step Guided Tour | 6.6 | PASS |
| `DEV-6.7` | Dev Tools | Admin Reset Tour Testing Tools | 6.7 | PASS |
| `GAM-7.1` | Gamification | Level Up Modal & Streak Detail Modal | 7.1 | PASS |
| `LRN-7.2` | Practice | Standalone Practice Workspace | 7.2 | PASS |
| `GAM-7.3` | Profile | Learner Profile & Achievement Badges | 7.3 | PASS |
| `GAM-7.4` | Profile | Activity History Timeline | 7.4 | PASS |
| `SYS-FB-7.5` | System | Firebase Firestore Progress & Auth Integration | 7.5 | PASS |

---

## 4. Công Cụ Dev Testing (Sprint 6.7)

Các nút reset onboarding để test luồng hướng dẫn mà không cần tạo tài khoản mới:
- **`/admin/settings`** → Card "Công cụ Dev: Test Chế độ Hướng dẫn Onboarding"
- **`/admin`** → Nút "🧪 Test Onboarding Mode" trong header
- **`/login`** → Nút "🧪 Test Luồng Hướng Dẫn" trong khu vực DEV ONLY

---

## 5. Kiến Trúc Quyết Định Chính (Tóm tắt ADR)

| ADR | Quyết định | Xem chi tiết |
|---|---|---|
| ADR-001 | React + Vite + Tailwind + Vitest | [`DECISIONS.md`](./DECISIONS.md) |
| ADR-002 | Mock Adapter → API Adapter Gateway | [`DECISIONS.md`](./DECISIONS.md) |
| ADR-003 | RBAC Route Guards | [`DECISIONS.md`](./DECISIONS.md) |
| ADR-004 | SQLite WASM Worker + Policy Guard | [`DECISIONS.md`](./DECISIONS.md) |
| ADR-005 | Domain-Driven Architecture Sprint 5 | [`DECISIONS.md`](./DECISIONS.md) |
| ADR-006 | Submission ≠ XP; Progress trao XP | [`DECISIONS.md`](./DECISIONS.md) |

> Xem chi tiết quyết định agent tại [`agent/DECISIONS.md`](./agent/DECISIONS.md) và [`agent/CONTRACTS.md`](./agent/CONTRACTS.md).


--- Content of docs/agent/PROJECT_CONTEXT.md ---

# Project Context

## Product

- **Name:** Avi-Mystery.
- **Vision:** nền tảng luyện kỹ năng dữ liệu theo hướng game hóa; người học đóng vai thám tử giải vụ án dữ liệu.
- **Users:** learner và content/super admin.
- **Main areas:** Learner và Admin.
- **MVP learning focus:** Excel trước, SQL tiếp theo; Python learning cố ý nằm ngoài MVP hiện tại.

## Verified Current Architecture

- React 18 và JavaScript ES modules, build bằng Vite; Tailwind CSS cho styling và React Router v6 cho routing.
- Vitest, React Testing Library và JSDOM cho unit/component tests.
- Frontend dùng local React state/context. Dữ liệu trạng thái người học (Auth, Progress, XP, Achievements, History) đã được chuyển sang **Firebase Auth & Cloud Firestore** thông qua `firebaseAuthService.js` và `firebaseProgressService.js`.
- Service contracts hiện có tại `src/services/contracts/`; gateway cấu hình nạp adapter tại `src/services/index.js` tuỳ theo biến môi trường `VITE_USE_FIREBASE`.
- Luồng Excel/SQL Submission vẫn đi qua mock gateway `src/services/index.js` để đánh giá nhưng sau đó giao dịch phần thưởng XP và lưu tiến độ được uỷ thác an toàn qua Firebase Transaction (Idempotent XP Ledger).
- Các dữ liệu nội dung tĩnh (Courses, Chapters, Investigations, Datasets) vẫn duy trì dưới dạng JSON mock data để chuẩn bị cho giai đoạn CMS Admin sắp tới.
- SQL workspace, SQLite WASM Worker engine, Schema Browser, SQL Editor MVP đã hoàn thành.

## Target Architecture (Next Phase)

```text
UI → stable service contract → Mock Service
                           └→ API Client → FastAPI → PostgreSQL
```

Mock Service và API Client phải giữ cùng public interface để Sprint 7 không yêu cầu viết lại UI. Evaluator chỉ đánh giá đáp án; Submission điều phối attempt/result; Progress trao XP có idempotency; backend về sau là nguồn sự thật cuối cùng.

## Intentionally Deferred

- Admin Content Builder: Khởi tạo ở Sprint 8.
- FastAPI, PostgreSQL backend cho nội dung cốt truyện và bài tập: Sprint 9.
- Mặc dù Firebase đã được dùng để thay thế Database cho luồng học tập cá nhân (Auth/Progress/XP), phần cấu trúc Nội dung (Content Schema) hiện tại vẫn duy trì JSON vì Firebase Firestore không tối ưu cho mô hình dữ liệu quan hệ phức tạp như Dataset-Question-Investigation của hệ thống, sẽ chờ PostgreSQL ở Sprint 9.
- Analytics, hardening và launch readiness: Sprint 10.

## Documentation Status

Ngày 01/09/2026, toàn bộ Step 7.1–7.5 đã `DONE` (bao gồm chiến dịch chuyển đổi Firebase Firestore cho Progress Engine). `CURRENT_TASK.md` (được nhúng trong `CURRENT_SPRINT.md`) là nguồn trạng thái duy nhất cho agent.

Các tài liệu vận hành canonical nằm trong `docs/` và bộ tracker ngắn ở `docs/agent/`.
