

--- Content of docs/PROJECT_MASTER_SUMMARY.md ---

# 📓 Avi-Mystery — Báo Cáo Tổng Hợp Chi Tiết Toàn Bộ Dự Án (Project Master Summary)

> **Tài liệu tổng hợp toàn diện nhất về sản phẩm Avi-Mystery**: Kiến trúc hệ thống, cấu trúc file, công dụng từng file, hợp đồng dữ liệu (contracts), danh sách tính năng hoàn thiện / chưa hoàn thiện, lộ trình Sprints mới, và hướng dẫn vận hành.
> **Cập nhật lần cuối:** 07/09/2026 sau khi hoàn tất Sprint 8 (Admin Content Studio & Materialized Read Model).

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
  5. **Learner Onboarding & First-Run Experience**: Welcome Gate, Tutorial Case 0 với Guided Spotlight 4 bước, Dashboard Tour 5 bước chuyên sâu (**Sprint 6.5 — HOÀN THÀNH 100%**).
  6. **Learner Engagement & Firebase Firestore Migration**: Modal mừng thăng cấp, chuỗi Streak ngọn lửa, Practice Workspace tự do, Profile, Huy hiệu thành tích, Lịch sử hoạt động và di chuyển lưu trữ sang Firebase Firestore Production (**Sprint 7 — HOÀN THÀNH 100%**).
  7. **Admin Content Studio & Materialized Read Model**: Giao diện trực quan cho Admin tạo/sửa Khóa học, Chương học, Vụ án, Bộ dữ liệu CSV, Sandbox Runner kiểm thử độc lập và Materialized Read Model `learning_map_views` tối ưu hóa triệt để Firestore (**Sprint 8 — HOÀN THÀNH 100%**).
  8. **Backend API & PostgreSQL Core**: Triển khai FastAPI và PostgreSQL thay thế Mock Adapters (**Sprint 9 — PROPOSED**).

### 1.2. Môi Trường Triển Khai & Demo
* **Trang Web Chính (Production/Staging)**: [https://avi-mystery.vercel.app/dashboard](https://avi-mystery.vercel.app/dashboard)
* **Nhánh Git Chiến Lược**:
  - `dev`: Phục vụ phát triển tính năng mới, tích hợp liên tục (CI/CD Staging).
  - `main`: Phục vụ phát hành chính thức người dùng cuối (Production Release).

---

## 2. 🏛 Phân Tầng Kiến Trúc & Các Khái Niệm Domain Lõi (Architecture & Domain Hierarchy)

### 2.1. Nhãn Phân Loại Trạng Thái Kiến Trúc
- `CURRENT`: Đã triển khai và verified hoàn tất trong mã nguồn thực tế (Sprint 1–8).
- `PLANNED`: Kế hoạch kiến trúc đã được chốt và chia nhỏ thành từng Step cụ thể.
- `PROPOSED`: Định hướng phát triển tương lai đang chờ phê duyệt (Sprint 9–10).
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
    │   ├── admin/                     # Các component cho Admin Content Studio
    │   │   └── AdminTestRunnerModal.jsx # Sandbox test runner cho phép chạy thử Excel/SQL độc lập
    │   └── ui/                        # Bộ UI primitive components (Design System)
    │       ├── Button.jsx             # Nút bấm chuẩn với biến thể primary/secondary/ghost/danger
    │       ├── Input.jsx              # Khung nhập liệu chuẩn
    │       ├── Card.jsx               # Thẻ bao bọc nội dung
    │       ├── Badge.jsx              # Nhãn trạng thái & điểm XP
    │       ├── EmptyState.jsx         # Giao diện khi không có dữ liệu hoặc gặp lỗi
    │       ├── EmptyState.test.jsx    # Test cases cho EmptyState
    │       ├── Skeleton.jsx           # Khung xương tải trang (Skeleton loading pattern)
    │       └── Skeleton.test.jsx      # Test cases cho Skeleton Loading
    ├── features/                      # Phân tầng tính năng nghiệp vụ mở rộng
    │   ├── onboarding/                # Tính năng dẫn dắt học viên mới (First-Run UX)
    │   │   ├── WelcomeGatePage.jsx    # Màn hình chào đón toàn cảnh
    │   │   ├── TutorialCase0Page.jsx  # Workspace thực hành bài mẫu Case 0
    │   │   ├── OnboardingSpotlight.jsx# Engine chiếu đèn spotlight các vùng tương tác
    │   │   ├── tutorialCase0Content.js# Nội dung bài tập mẫu Case 0
    │   │   └── dashboardTourContent.js# Nội dung tour 5 bước trên Dashboard
    │   └── gamification/              # Tính năng game hóa & tương tác
    │       ├── LevelUpModal.jsx       # Popup chúc mừng thăng cấp
    │       └── StreakDetailModal.jsx  # Popup xem chuỗi ngày học 7 ngày
    ├── domain/                        # Lớp quản lý Domain Logic & Entities
    │   ├── content/                   # Entity & Contracts cho Content Domain
    │   │   ├── contentIdentity.js     # Identity resolver cho Course/Phase/Chapter/Investigation/Question
    │   │   └── questionDomain.js      # Configuration & schema cho Question
    │   ├── learningMap/               # Adapter chuyển đổi dữ liệu cho Bản đồ Học tập
    │   │   ├── learningMapAdapter.js  # Adapter xây dựng cây lộ trình đa Phase & tính toán trạng thái
    │   │   ├── learningMapAdapter.test.js # Unit tests cho adapter Bản đồ Học tập
    │   │   ├── learningMapProjector.js# Projection builder xuất bản Materialized Read Model
    │   │   └── learningMapProjector.test.js # Unit tests cho projector
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
    │   │   ├── PracticePage.jsx       # Trang Ngân hàng luyện tập kỹ năng tự do
    │   │   ├── ProfilePage.jsx        # Trang Hồ sơ cá nhân người học
    │   │   ├── AchievementsPage.jsx   # Trang Danh hiệu & Huân chương thám tử
    │   │   ├── ActivityHistoryPage.jsx# Trang Lịch sử hoạt động học tập
    │   │   └── UnderMaintenancePage.jsx # Trang Thông báo Tính năng đang Bảo trì/Phát triển
    │   ├── admin/                     # Phân vùng trang dành cho Quản trị viên
    │   │   ├── OverviewPage.jsx       # Trang Tổng quan Admin
    │   │   ├── AdminGuidePage.jsx     # Trang Cẩm nang hướng dẫn luồng Admin
    │   │   ├── PageStatusPage.jsx     # Trang Quản lý Bật/Tắt Trạng thái các Page
    │   │   ├── AdminCoursesPage.jsx   # Quản lý Khóa học & Đồng bộ Read Model
    │   │   ├── AdminChaptersPage.jsx  # Quản lý Chương học
    │   │   ├── AdminMissionsPage.jsx  # Quản lý Danh sách Vụ án & Trạng thái xuất bản
    │   │   ├── AdminMissionEditorPage.jsx # Trình soạn thảo Vụ án 4 tabs trực quan
    │   │   ├── AdminDatasetsPage.jsx  # Quản lý Dataset & Bộ nhập CSV tự động sinh DDL
    │   │   └── SettingsPage.jsx       # Trang Cấu hình Hệ thống Admin
    │   └── NotFoundPage.jsx           # Trang Lỗi 404 Đường dẫn không tồn tại
    ├── services/                      # Lớp Dịch vụ & Hợp đồng Kết nối (Services & Gateway)
    │   ├── index.js                   # Service Gateway duy nhất xuất các ServiceInstance & Adapters
    │   ├── pageStatusService.js       # Dịch vụ kiểm tra trạng thái bảo trì trang
    │   ├── onboardingService.js       # Dịch vụ điều phối trạng thái Onboarding học viên
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
    │   │   ├── progressService.js     # Contract Lưu trữ tiến độ, mode-aware attempts & Skill Mastery
    │   │   └── adminContentService.js # Contract Quản trị nội dung Admin Content Studio
    │   ├── api/                       # Triển khai Production Adapters
    │   │   ├── firebase.js            # Khởi tạo Firebase SDK & Firestore instance
    │   │   └── firebaseProgressService.js # Persistence tiến độ, XP, danh hiệu thời gian thực trên Firestore
    │   └── mock/                      # Triển khai Mock Service chạy trên Frontend
    │       ├── mockAuthService.js     # Mock Đăng nhập & Phân quyền
    │       ├── mockCourseService.js   # Mock Dữ liệu Khóa học
    │       ├── mockMissionService.js  # Mock Dữ liệu Vụ án Excel
    │       ├── mockSqlMissionService.js # Mock Dữ liệu Vụ án SQL
    │       ├── mockSubmissionService.js # Gateway đánh giá bài làm Excel/SQL & trả kết quả
    │       ├── mockDatasetService.js  # Mock Bộ dữ liệu độc lập
    │       ├── mockProgressService.js # Mock Lưu trữ tiến độ người học & Skill Mastery records
    │       ├── mockContentService.js  # Mock Nội dung phân cấp Course -> Phase -> Chapter
    │       └── mockAdminContentService.js # Mock Quản trị nội dung cho Admin Content Studio
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
| 21 | **Onboarding** | Welcome Gate & Case 0 | Luồng chào đón người học mới (`WelcomeGatePage`), bài học mẫu Case 0 (`TutorialCase0Page`) và Guided Spotlight | **CURRENT** |
| 22 | **Onboarding** | Dashboard Deep Guided Tour | Tour 5 bước hướng dẫn trực quan giới thiệu các khu vực trên trang Tổng quan học viên | **CURRENT** |
| 23 | **Gamification** | Level Up Modal & Streak | Modal chúc mừng thăng cấp có hiệu ứng confetti và popup xem chuỗi ngày học 7 ngày (`StreakDetailModal`) | **CURRENT** |
| 24 | **Learner** | Standalone Practice Bank | Ngân hàng bài tập rèn luyện tự do (`/practice`) tách biệt khỏi tiến trình cốt truyện chính | **CURRENT** |
| 25 | **Learner** | Profile & Achievements | Trang hồ sơ thám tử cá nhân (`/profile`) và bảng danh hiệu huân chương (`/achievements`) | **CURRENT** |
| 26 | **Learner** | Activity History Timeline | Dải timeline lịch sử hoạt động học tập (`/profile/history`) với bộ lọc đa chiều thời gian thực | **CURRENT** |
| 27 | **Firebase** | Production Firestore State | Di chuyển lưu trữ XP Ledger, Tiến độ bài học, Danh hiệu và Lịch sử sang Firebase Firestore thời gian thực | **CURRENT** |
| 28 | **Admin** | Admin Content Studio | Trình quản lý danh sách và soạn thảo Vụ án trực quan (`/admin/missions`, `/admin/missions/:id/edit`), Khóa học (`/admin/courses`), Chương học (`/admin/chapters`) | **CURRENT** |
| 29 | **Admin** | CSV Dataset Importer | Trình tải lên tệp CSV, tự động đoán kiểu dữ liệu (`INTEGER`, `REAL`, `DATE`, `TEXT`) và sinh DDL SQLite (`/admin/datasets`) | **CURRENT** |
| 30 | **Admin** | Sandbox Live Preview & Test Runner | Modal chạy thử công thức Excel & câu lệnh SQLite WASM độc lập không ghi nhận XP (`AdminTestRunnerModal`) | **CURRENT** |
| 31 | **Admin** | Materialized Learning Map Read Model | Module `learningMapProjector.js` chiếu dữ liệu sang `learning_map_views` loại bỏ N+1 query Firestore | **CURRENT** |
| 32 | **Admin** | Admin Operational Guide | Trang cẩm nang hướng dẫn luồng tạo và xuất bản nội dung (`/admin/guide`) | **CURRENT** |

---

## 5. 🗺 Lộ Trình Sprints Mới (Reconciled Roadmap Summary)

* **Sprint 1: Frontend Foundation** ➔ **CURRENT** (Vite, React, Tailwind, Detective Amber Theme, RBAC).
* **Sprint 2: Course & Learning Map Baseline** ➔ **CURRENT** (Courses, Course Details, Static Map, Briefing).
* **Sprint 3: Excel Vertical Slice** ➔ **CURRENT** (Spreadsheet Grid, Formula Bar, Hint Drawer, Excel Checker, Submission Gateway).
* **Sprint 4: SQL Vertical Slice** ➔ **CURRENT** (SQLite WASM Engine, Worker, Schema Browser, SqlEditor, ResultViewer, Read-only Policy, Build Gate).
* **Sprint 5: Content Domain & Dataset Decoupling** ➔ **HOÀN THÀNH 100%** (Dataset, Content, Investigation, Question, Progress, XP Reward, Mastery).
* **Sprint 6: Game Progress & Progression Architecture** ➔ **HOÀN THÀNH 100%** (Step 6.1 Learning Map Adapter, Step 6.2 UX Refactor & Step 6.3 Practice Engine & Mastery Integration).
* **Sprint 6.5: Learner Onboarding & First-Run Experience** ➔ **HOÀN THÀNH 100%** (Welcome Gate, Tutorial Case 0, Dashboard Tour Spotlight, Dev Reset Tools).
* **Sprint 7: Learner Engagement & Practice Engine** ➔ **HOÀN THÀNH 100%** (Level Up Modal, Practice Workspace, Profile & Achievements, Activity History, Firebase Production Infrastructure).
* **Sprint 8: Admin Content Studio** ➔ **HOÀN THÀNH 100%** (Authoring Studio, Dataset CSV Importer & Schema Generator, Test Runner Sandbox, Materialized Learning Map Read Model).
* **Sprint 9: Backend API & Persistence** ➔ **PROPOSED** (FastAPI Core, PostgreSQL ORM, Real API Gateway Adapters & JWT Security).
* **Sprint 10: Production Hardening & Release** ➔ **PROPOSED** (Learner Analytics, Bundle Optimization, Security Audit & Launch).


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

## 🟢 Sprint 5 — Content Domain & Dataset Decoupling (`CURRENT`)

* **Dominant Architectural Objective:** Tái cấu trúc mô hình nội dung, tách biệt Investigation (Cốt truyện) và Question (Nhiệm vụ), giải phóng Dataset thành tài sản tái sử dụng độc lập, bóc tách evaluator config khỏi `mockSubmissionService`.
* **Status:** `CURRENT` (Hoàn thành 100%).
* **Key Deliverables:** `datasetService` registry, `contentService` hierarchy (Course -> Phase -> Chapter), `investigationService`, `questionService`, `rewardEvaluator`, `masteryEvaluator`.

---

## 🟢 Sprint 6 — Game Progress & Progression Architecture (`CURRENT`)

* **Dominant Architectural Objective:** Xây dựng `Progress Service` lưu trữ trạng thái học tập, sổ cái XP (XP Ledger) có tính Idempotent, công thức thăng cấp `levelingEngine`, và kết nối dữ liệu tiến độ thực tế vào `LearningMapPage`.
* **Status:** `CURRENT` (Hoàn thành 100%).
* **Key Deliverables:** pure `levelingEngine.js` (Level 1–50), `progressService.js`, `useProgress.js` hook thời gian thực, `learningMapAdapter.js` hỗ trợ Phase tabs, Skill Mastery Summary card.

---

## 🟢 Sprint 6.5 — Learner Onboarding & First-Run Experience (`CURRENT`)

* **Dominant Architectural Objective:** Trải nghiệm tiếp cận lần đầu cho tân binh thám tử (First-Run UX) với Welcome Gate full-screen, Tutorial Case 0 kèm Guided Spotlight và Dashboard Deep Guided Tour.
* **Status:** `CURRENT` (Hoàn thành 100%).
* **Key Deliverables:** `onboardingService.js`, `WelcomeGatePage.jsx`, `TutorialCase0Page.jsx`, `tutorialCase0Content.js`, `OnboardingSpotlight.jsx` engine, `dashboardTourContent.js`, Admin Dev Reset Tools.

---

## 🟢 Sprint 7 — Learner Engagement & Practice Engine (`CURRENT`)

* **Dominant Architectural Objective:** Phát triển các tính năng tăng cường tương tác cho Học viên (Modal Thăng Cấp, Chuỗi Streak, Ngân hàng Luyện tập, Trang Hồ sơ Cá nhân, Danh hiệu Thám tử & Lịch sử Hoạt động, Di chuyển lưu trữ sang Firebase Firestore).
* **Status:** `CURRENT` (Hoàn thành 100%).
* **Sub-Steps (Completed):**
  - **Step 7.1:** Level Up Modal & Streak Counter (`GAME-UI-7.1`)
  - **Step 7.2:** Standalone Practice Workspace (`LRN-PRAC-7.2`)
  - **Step 7.3:** Learner Profile & Achievement Badges (`GAME-PROF-7.3`)
  - **Step 7.4:** Activity History Timeline Page (`GAME-HIST-7.4`)
  - **Step 7.5:** Firebase Production Infrastructure Migration (`SYS-FB-7.5`)

---

## 🟢 Sprint 8 — Admin Content Studio & Materialized Read Model (`CURRENT`)

* **Dominant Architectural Objective:** Xây dựng bộ công cụ Quản trị cho Admin để tự soạn thảo Investigation, Question, Khóa học, Chương học, tải lên Dataset CSV và tối ưu hoá Bản đồ học tập Firestore với Materialized Read Model `learning_map_views`.
* **Status:** `CURRENT` (Hoàn thành 100%).
* **Sub-Steps (Completed):**
  - **Step 8.1:** Visual Investigation & Question Authoring Studio (`ADM-STUDIO-8.1`) — `AdminMissionsPage`, `AdminMissionEditorPage`, `AdminCoursesPage`, `AdminChaptersPage`.
  - **Step 8.2:** Dataset Importer & SQLite Schema Generator (`ADM-DATA-8.2`) — `AdminDatasetsPage`, tự động đoán kiểu dữ liệu và sinh DDL.
  - **Step 8.3:** Admin Live Preview & Test Runner Sandbox (`ADM-PREV-8.3`) — `AdminTestRunnerModal` chạy thử công thức Excel & câu lệnh SQLite WASM an toàn.
  - **Step 8.4:** Materialized Learning Map Read Model (`ADM-READMODEL-8.4`) — `learningMapProjector.js`, tạo và cập nhật collection `learning_map_views` giải quyết triệt để N+1 queries.
  - **Step 8.5:** Admin Workflow & Operational Guide (`ADM-GUIDE-8.5`) — Trang `AdminGuidePage.jsx` giải thích luồng tạo và xuất bản.

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

> **Cập nhật lần cuối:** 08/09/2026
> **Nguồn task hiện tại:** [`agent/CURRENT_TASK.md`](./agent/CURRENT_TASK.md)

---

## 1. Tổng Quan Tiến Độ

| Hạng mục | Trạng thái |
|---|---|
| **Kiến trúc** | Domain-Driven: `Course → Phase → Chapter → Investigation → Question` + Academy Syllabus |
| **Sprint hoàn thành** | Sprint 1 → 8 (100%), Sprint 9.1 (100%), Sprint 9.5 (Step 9.5.1 & 9.5.2) |
| **Sprint hiện tại** | **Sprint 9.5 — Academy Mode & Interactive Sandbox (Step 9.5.3 chuẩn bị bắt đầu)** |
| **Test suite** | `71 / 71` test suites, `562 / 562` tests PASS (Vitest) — cập nhật 08/09/2026 |
| **Build & Deploy** | `npm run build` PASS (0 errors) — Vercel Production LIVE (`https://avi-mystery.vercel.app`) |

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
| **Sprint 8** | Admin Content Studio & Materialized Read Model | `DONE` |
| **Sprint 9.1** | Excel Mission Workspace UI/UX Refactor | `DONE` |
| **Sprint 9.5** | Academy Mode & Interactive Sandbox (W3Schools Style) | `IN PROGRESS` |
| **Sprint 10** | Backend API & Persistence (FastAPI) | `PROPOSED` |

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
| `ADM-8.x` | Admin | Admin Content Studio & Materialized Read Model | 8 | PASS |
| `LRN-UX-9.1` | Excel | Excel Mission 3-Layer Split-Pane & Authentic Canvas | 9.1 | PASS |
| `LRN-SND-9.5` | Sandbox | Interactive Data Sandbox (Split-pane, In-Cell Overlay, Zero Re-render) | 9.5 | PASS |
| `LRN-ACD-9.5` | Academy | W3Schools Academy Syllabus, Checkpoint Quiz & Progression | 9.5 | PASS |
| `SYS-VRC-9.5` | Deploy | Vercel Cloud Safe Fallback to Mock Services | 9.5 | PASS |

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
| ADR-007 | Firebase Firestore Progress & XP Ledger | [`DECISIONS.md`](./DECISIONS.md) |
| ADR-008 | Materialized Read Model `learning_map_views` | [`DECISIONS.md`](./DECISIONS.md) |
| ADR-009 | Admin Content Studio & Live Sandbox Runner | [`DECISIONS.md`](./DECISIONS.md) |
| ADR-010 | In-Cell Editor Overlay & Session State Machine | [`DECISIONS.md`](./DECISIONS.md) |
| ADR-011 | Safe Firebase Init & Graceful Mock Fallback | [`DECISIONS.md`](./DECISIONS.md) |

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
