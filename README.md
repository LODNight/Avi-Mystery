# Avi-Mystery — Nền Tảng Luyện Tập Phân Tích Dữ Liệu Nông Nghiệp & Kinh Doanh

> **Avi-Mystery** là ứng dụng luyện tập phân tích dữ liệu theo phong cách **game hóa điều tra vụ án** (Gameified Data Analytics Investigation).  
> Người học đóng vai trò là một **Nhà điều tra dữ liệu (Data Investigator)** giải quyết các tình huống kinh doanh & nông nghiệp thực tế bằng công thức **Excel** và câu lệnh **SQL**.

---

## 🌟 Tính Năng Nổi Bật

### 🕵️ Learner Application (Dành cho Người học)
- **Bảng điều khiển Học tập (Learner Dashboard)**: Theo dõi tiến trình học tập, tổng điểm kinh nghiệm (XP), nhiệm vụ đang làm dở và bảng xếp hạng.
- **Danh sách Khóa học (`/courses`)**: Tìm kiếm và lọc khóa học theo từ khóa, công cụ (Excel / SQL) và độ khó (Easy, Medium, Hard).
- **Chi tiết Khóa học (`/courses/:slug`)**: Xem thông tin tổng quan khóa học, cấu trúc chương học Accordion và danh sách bài học vụ án.
- **Bản đồ Học tập (`/map`)**: Bản đồ tiến trình dạng Node/Tree tương tác, kiểm soát trạng thái nhiệm vụ (`locked`, `available`, `in_progress`, `completed`).
- **Hồ sơ Vụ án (`/missions/:missionId`)**: Briefing chi tiết bối cảnh câu chuyện, mục tiêu vụ án, bộ dataset liên quan và điểm thưởng XP trước khi làm bài.
- **Màn hình Bảo trì Tự động (`UnderMaintenancePage`)**: Tự động chuyển hướng và chặn truy cập khi trang đang ở chế độ bảo trì do Admin thiết lập.

### 🛡️ Admin Application (Dành cho Quản trị viên)
- **Tổng quan Admin (`/admin`)**: Bảng thống kê tổng học viên, tỷ lệ hoàn thành, nhiệm vụ xuất bản và cảnh báo bài tập có tỷ lệ sai cao.
- **Cài đặt & Quản lý Trang (`/admin/settings?tab=pages`)**: 
  - Điều khiển trạng thái thời gian thực của toàn bộ trang Learner (`Active`, `Maintenance`, `Notice`).
  - Cấu hình thông điệp bảo trì, lý do và thời gian dự kiến khôi phục.
  - Chế độ **Admin Maintenance Bypass** (Cho phép Admin xem trước giao diện bị bảo trì).
  - Thao tác nhanh khẩn cấp: *Bảo trì tất cả*, *Kích hoạt tất cả*, *Khôi phục mặc định*.

---

## 🎨 Thiết Kế & Aesthetic

- **Design System Detective Amber**: Tông màu chủ đạo **Hổ phách (Amber/Warm brown)** gợi cảm giác hồ sơ điều tra trinh thám cổ điển.
- **Hỗ trợ Chế độ Tối & Sáng (Dark/Light Theme Toggle)**: Chuyển đổi theme mượt mà toàn ứng dụng.
- **Collapsible Responsive Sidebar**: Thanh điều hướng có thể thu gọn linh hoạt cho cả Learner và Admin layouts, tự động ghi nhớ trạng thái qua `localStorage`.

---

## 🛠️ Công Nghệ Sử Dụng

- **Core**: React 18 + JavaScript (ES6+).
- **Build Tool**: Vite.
- **Styling**: Tailwind CSS + Lucide React Icons.
- **Routing**: React Router v6.
- **Testing**: Vitest + React Testing Library + JSDOM.
- **Architecture**: Service Contract Pattern (`UI → Service Adapter → Mock / API Data`).

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
Avi-Mystery/
├── docs/                        # Bộ tài liệu tiến độ (PROJECT_STATUS, ROADMAP, BACKLOG, DECISIONS, TEST_REPORT)
├── src/
│   ├── app/
│   │   ├── layouts/            # LearnerLayout & AdminLayout (Sidebar + Topbar)
│   │   ├── providers/          # ThemeProvider, PageStatusProvider, AuthProvider
│   │   └── router/             # Cấu hình AppRouter & RBAC Route Guards
│   ├── components/
│   │   └── ui/                 # Component UI tái sử dụng (Button, Card, Skeleton, EmptyState)
│   ├── hooks/                  # Custom hooks (useAuth, useTheme, usePageStatus, useAsync)
│   ├── mocks/                  # Mock JSON data (courses, chapters, missions, steps, datasets)
│   ├── pages/
│   │   ├── admin/              # OverviewPage, SettingsPage, PageStatusPage
│   │   └── learner/            # DashboardPage, CoursesPage, CourseDetailPage, LearningMapPage, MissionIntroPage
│   ├── services/               # Service Layer (mockAuthService, mockCourseService, pageStatusService)
│   ├── tests/                  # Automated Vitest test suites
│   └── utils/                  # Excel Answer Checker (excelChecker.js) & format utilities
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Cài đặt các thư viện phụ thuộc:
```bash
npm install
```

### 2. Chạy môi trường phát triển (Dev Server):
```bash
npm run dev
```
Mở trình duyệt tại đường dẫn: `http://localhost:5173`

### 3. Chạy bộ kiểm thử tự động (Vitest Test Suite):
```bash
npx vitest run
```

### 4. Build bản đóng gói Production:
```bash
npm run build
```

---

## 🧪 Kết Quả Kiểm Thử (Automated Test Report)

Dự án hiện đạt **100% PASS** trên toàn bộ suite kiểm thử tự động:
- **12 Test Files Passed**
- **62 Test Cases Passed**
- Kiểm thử bao phủ: Service contracts, UI Skeletons, Empty states, Filter logic, Route guards, Page Status maintenance interception, Excel Answer Checker và Excel Mission Shell.

---

## 🗺️ Lộ Trình Phát Triển (Roadmap Summary)

Bảng tiến độ chi tiết theo dạng checkbox cho từng Sprint có thể xem tại tệp tài liệu: **[`docs/CHECKLIST.md`](./docs/CHECKLIST.md)**.

- [x] **Sprint 1 — Foundation & Auth**: Khởi tạo App Shell, Design System Amber, Service Layer contract, Role Guards.
- [x] **Sprint 2 — Course & Learning Map**: Danh sách khóa học, Chi tiết chương học, Bản đồ học tập Node Graph, Mission Intro briefing, Admin Page Status Manager.
- [x] **Step 3.0 & 3.1 — Excel Mission Shell & Checker**: Kiểm tra gate Sprint 2, bộ chấm điểm `excelChecker.js` và màn hình làm bài Excel Mission Shell (`/missions/:missionId/workspace`).
- [ ] **Sprint 3 (Tiếp) — Spreadsheet Grid & Engine**: Bảng tính tương tác `SpreadsheetGrid`, `FormulaBar`, `FormulaEngineAdapter` & `SubmissionService`.
- [ ] **Sprint 4 — SQL Vertical Slice**: Trình soạn thảo câu lệnh SQL, Mock Database engine và bảng kết quả truy vấn.
