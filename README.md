# Avi-Mystery — Nền Tảng Luyện Tập Phân Tích Dữ Liệu Nông Nghiệp & Kinh Doanh

> **Avi-Mystery** là ứng dụng luyện tập phân tích dữ liệu theo phong cách **game hóa điều tra vụ án** (Gameified Data Analytics Investigation).  
> Người học đóng vai trò là một **Nhà điều tra dữ liệu (Data Investigator)** giải quyết các tình huống kinh doanh & nông nghiệp thực tế bằng công thức **Excel** và câu lệnh **SQL**.

---

## 🌟 Tính Năng Nổi Bật

### 🕵️ Learner Application (Dành cho Người học)
- **Bảng điều khiển Học tập (Learner Dashboard)**: Hiển thị tổng quan mock về XP, nhiệm vụ và bảng xếp hạng; Progress domain chính thức thuộc Sprint 5.
- **Danh sách Khóa học (`/courses`)**: Tìm kiếm và lọc khóa học theo từ khóa, công cụ (Excel / SQL) và độ khó (Easy, Medium, Hard).
- **Chi tiết Khóa học (`/courses/:slug`)**: Xem thông tin tổng quan khóa học, cấu trúc chương học Accordion và danh sách bài học vụ án.
- **Bản đồ Học tập (`/map`)**: Bản đồ tiến trình dạng Node/Tree tương tác, kiểm soát trạng thái nhiệm vụ (`locked`, `available`, `in_progress`, `completed`).
- **Hồ sơ Vụ án (`/missions/:missionId`)**: Briefing chi tiết bối cảnh câu chuyện, mục tiêu vụ án, bộ dataset liên quan và điểm thưởng XP trước khi làm bài.
- **Màn hình Bảo trì Tự động (`UnderMaintenancePage`)**: Tự động chuyển hướng và chặn truy cập khi trang đang ở chế độ bảo trì do Admin thiết lập.

### 🛡️ Admin Application (Dành cho Quản trị viên)
- **Tổng quan Admin (`/admin`)**: Giao diện tổng quan với dữ liệu hiện tại; Admin Analytics chính thức thuộc Sprint 8.
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
│   │   ├── excel/              # Grid, Formula Bar, toolbar, hints và result modal
│   │   └── ui/                 # Component UI tái sử dụng (Button, Card, Skeleton, EmptyState)
│   ├── hooks/                  # Custom hooks (useAuth, useTheme, usePageStatus, useAsync)
│   ├── mocks/                  # Mock JSON data (courses, chapters, missions, steps, datasets)
│   ├── pages/
│   │   ├── admin/              # OverviewPage, SettingsPage, PageStatusPage
│   │   └── learner/            # Dashboard, course/map/mission và Excel workspace
│   ├── services/               # Contracts, mock adapters, API stubs và service gateway
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

Lần xác minh gần nhất ngày **21/08/2026** đạt:

- **19 Test Files Passed**
- **120 Test Cases Passed**
- Bao phủ service mocks, shared UI, route/page status, course/map/mission flow, Excel evaluator, submission contract/gateway, async guards và feedback UI.

Chi tiết và cảnh báo test được ghi tại **[`docs/TEST_REPORT.md`](./docs/TEST_REPORT.md)**.

---

## 🗺️ Lộ Trình Phát Triển (Roadmap Summary)

Bảng tiến độ chi tiết theo dạng checkbox cho từng Sprint có thể xem tại tệp tài liệu: **[`docs/CHECKLIST.md`](./docs/CHECKLIST.md)**.

- [x] **Sprint 1 — Foundation & Auth**: Khởi tạo App Shell, Design System Amber, Service Layer contract, Role Guards.
- [x] **Sprint 2 — Course & Learning Map**: Danh sách khóa học, Chi tiết chương học, Bản đồ học tập Node Graph, Mission Intro briefing, Admin Page Status Manager.
- [x] **Step 3.0–3.3 — Excel Workspace**: Checker, mission shell, spreadsheet grid, Formula Bar, Run/Reset/Hint và toolbar đã có code/test.
- [x] **Step 3.4 — Submission & Feedback**: Shared contract/gateway, mock async/idempotency-ready, inline feedback/retry, double-submit guard, success modal và boundary không trao XP đã hoàn thành.
- [ ] **Sprint 4 — SQL Vertical Slice**: Step 4.0 Technical Spike/Contract đã `DONE` (SQL unit 11/11, full regression 144/144, dev/build/preview Worker+WASM pass); Step 4.1A chưa được kích hoạt.

Trạng thái task duy nhất dành cho agent nằm tại **[`docs/agent/CURRENT_TASK.md`](./docs/agent/CURRENT_TASK.md)**; roadmap không tự kích hoạt Sprint/Step tiếp theo.
