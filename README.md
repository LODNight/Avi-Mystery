# Avi-Mystery — Hướng Dẫn Vận Hành Ứng Dụng (Page Operations Guide)

> **Avi-Mystery** là ứng dụng luyện tập phân tích dữ liệu theo phong cách **game hóa điều tra vụ án** (Gameified Data Analytics Investigation).  
> 🌐 **Trải nghiệm ứng dụng trực tiếp tại**: [https://avi-mystery.vercel.app/dashboard](https://avi-mystery.vercel.app/dashboard)  
> Tài liệu này tập trung vào **hướng dẫn vận hành các trang giao diện**, luồng trải nghiệm của **Người học (Learner)** và **Quản trị viên (Admin)**.

---

## ⚡ 1. Hướng Dẫn Chạy & Thao Tác Cơ Bản

| Thao tác | Câu lệnh Terminal | Mô tả |
|---|---|---|
| **Cài đặt phụ thuộc** | `npm install` | Cài đặt các package cần thiết cho dự án |
| **Khởi chạy ứng dụng (Dev)** | `npm run dev` | Chạy dev server tại `http://localhost:5173` |
| **Kiểm thử tự động** | `npm test -- --run` | Chạy toàn bộ **66 test files / 529 test cases (Pass 100%)** |
| **Đóng gói sản phẩm** | `npm run build` | Đóng gói bản Production vào thư mục `dist/` |
| **Xem trước bản Build** | `npm run preview` | Chạy xem trước bản Production sau khi build |

---

## 🕵️ 2. Luồng Vận Hành Giao Diện Người Học (Learner Operations)

```text
[Đăng ký/Login] ➔ [/onboarding (Case 0)] ➔ [/dashboard (Guided Tour)] ➔ [/courses] ➔ [/map] ➔ [/missions/:id] ➔ [Excel/SQL Workspace] ➔ [/practice | /profile | /achievements]
```

### 🔹 Step 0: Đón Tiếp Học Viên Mới (Onboarding & Tutorial Case 0)
- Tân binh đăng ký lần đầu sẽ được điều hướng tới màn hình **Welcome Gate (`/onboarding`)**.
- Học viên có thể tham gia **Khóa huấn luyện tân binh — Case 0 (`/onboarding/case-0`)** với bộ đèn chiếu **Guided Spotlight 4 bước** giúp làm quen với hồ sơ vụ án, bảng tính, thanh công thức và nút nộp bài.
- Sau khi hoàn thành, học viên nhận ngay **+50 XP** đầu tiên và được dẫn dắt về Dashboard.

### 🔹 Step 1: Đăng Nhập & Bảng Điều Khiển (`/login`, `/dashboard`)
- Sử dụng nút **"Demo Login"** (ở môi trường DEV) hoặc tài khoản học viên để vào hệ thống.
- Bảng điều khiển (`/dashboard`) tích hợp **Deep Guided Tour 5 bước** giới thiệu toàn diện: Chỉ số XP, Cấp bậc thám tử, Lối tắt vụ án đang làm, Khóa học đề xuất và Chuỗi ngày học 🔥.

### 🔹 Step 2: Khám Phá & Chọn Khóa Học (`/courses`, `/courses/:slug`)
- Trang danh sách khóa học (`/courses`): Hỗ trợ tìm kiếm theo từ khóa, lọc công cụ (**Excel** hoặc **SQL**) và mức độ khó (**Easy**, **Medium**, **Hard**).
- Trang chi tiết khóa học (`/courses/:slug`): Hiển thị thông tin tổng quan, cấu trúc các Chương học (Accordion) và các Bài học vụ án.

### 🔹 Step 3: Định Hướng Trên Bản Đồ Học Tập (`/map`)
- Bản đồ dạng Node/Tree tương tác hiển thị tiến trình của Người học theo từng Giai đoạn (Phase Navigation Tabs) với thẻ tổng quan trình độ thám tử (**Skill Mastery Summary**).
- Dữ liệu bản đồ được tối ưu hóa qua **Materialized Read Model (`learning_map_views`)** giúp tải trang tức thì.
- Trạng thái các nút bài học:
  - 🟢 **Completed**: Đã phá án thành công (cho phép làm lại rèn luyện kỹ năng).
  - 🟡 **Current / Available**: Vụ án mở khóa sẵn sàng điều tra.
  - 🔒 **Locked**: Vụ án bị khóa (yêu cầu hoàn thành các bài trước).

### 🔹 Step 4: Đọc Hồ Sơ Vụ Án (`/missions/:missionId`)
- Xem bối cảnh câu chuyện điều tra trinh thám, mục tiêu vụ án, tập dữ liệu liên quan và phần thưởng XP.
- Nút **"Bắt đầu điều tra"** sẽ chuyển tiếp tới không gian làm việc công cụ phù hợp (Excel hoặc SQL).

### 🔹 Step 5: Không Gian Làm Việc Thực Hành
- **Excel Workspace (`/missions/:missionId/workspace`)**:
  - Nhập công thức vào thanh `FormulaBar` hoặc ô lưới `SpreadsheetGrid`.
  - Bấm **"Chạy thử"** để xem kết quả tính toán hoặc **"Nộp bài vụ án"** để chấm điểm tự động.
  - Sử dụng bảng **Gợi ý (Hint Panel)** khi cần hỗ trợ (có tính năng ghim gợi ý lên thanh công thức).
- **SQL Workspace (`/missions/:missionId/sql`)**:
  - Tra cứu cấu trúc bảng & dữ liệu mẫu tại **Schema Browser** bên trái.
  - Soạn thảo câu lệnh SQL tại **SQL Code Editor** (hỗ trợ phím tắt `Ctrl + Enter` và thụt lề Tab 2 khoảng trắng).
  - Bấm **"Chạy thử"** để thực thi câu lệnh trên trình duyệt (SQLite WASM Engine) và xem bảng kết quả tại **ResultViewer**.
  - Bấm **"Nộp bài vụ án"** để chấm điểm tự động. Khi đúng, cửa sổ **`MissionResultModal`** sẽ xuất hiện chúc mừng phá án thành công.

### 🔹 Step 6: Rèn Luyện & Phát Triển Kỹ Năng
- **Ngân Hàng Luyện Tập Tự Do (`/practice`)**: Giải bài tập củng cố kỹ năng Excel & SQL không ảnh hưởng tuyến tính đến cốt truyện.
- **Hồ Sơ Cá Nhân (`/profile`)**: Xem tổng quan chỉ số Level, XP tích lũy, số bài đã giải.
- **Bảng Danh Hiệu Thám Tử (`/achievements`)**: Xem danh sách huân chương và điều kiện mở khóa.
- **Lịch Sử Hoạt Động (`/profile/history`)**: Dải timeline ghi nhận từng mốc phá án, thăng cấp với bộ lọc thời gian thực.
- **Cơ Chế Gamification**: Modal mừng thăng cấp (`LevelUpModal`) kèm hiệu ứng confetti và popup theo dõi chuỗi ngày học 7 ngày (`StreakDetailModal`).

---

## 🛡️ 3. Luồng Vận Hành Quản Trị Viên & Admin Content Studio (Admin Operations)

### 🔹 1. Admin Content Studio — Quản Lý & Xuất Bản Nội Dung
- **Quản lý Vụ án (`/admin/missions`)**: Lọc theo Khóa học, Công cụ (Excel/SQL), Độ khó, Trạng thái (Draft/Published); chuyển đổi nhanh trạng thái xuất bản 1-click.
- **Trình Soạn Thảo Vụ Án (`/admin/missions/new` & `/admin/missions/:id/edit`)**: 4 tab trực quan:
  1. *Hồ sơ & Bối cảnh*: Tiêu đề, cốt truyện, mục tiêu, độ khó, điểm XP thưởng.
  2. *Không gian làm việc*: Chọn loại công cụ (Excel/SQL), gán Dataset liên kết, cấu hình ô mục tiêu / câu truy vấn mẫu.
  3. *Bộ chấm điểm (Checker)*: Cấu hình công thức mong muốn, giá trị kỳ vọng, so sánh kết quả SQL (thứ tự dòng, sai số, null).
  4. *Hệ thống gợi ý*: Tạo nhiều cấp độ gợi ý từng bước.
- **Quản lý Khóa học & Chương học (`/admin/courses`, `/admin/chapters`)**: Tạo mới, sửa cấu trúc và nút 1-click **"Đồng bộ Bản đồ Học tập"** để chiếu dữ liệu sang `learning_map_views`.
- **Quản lý Bộ dữ liệu & Nhập CSV (`/admin/datasets`)**: Tải lên tệp CSV/dán văn bản, hệ thống tự động nhận diện kiểu dữ liệu (`INTEGER`, `REAL`, `DATE`, `TEXT`) và tự động sinh câu lệnh SQLite DDL (`CREATE TABLE ...`, `INSERT INTO ...`).
- **Sandbox Live Preview & Test Runner (`AdminTestRunnerModal`)**: Chạy thử công thức Excel hoặc câu lệnh SQL SQLite WASM trực tiếp trong Studio mà không ảnh hưởng tới tiến độ hay điểm XP thật.
- **Cẩm Nang Vận Hành Admin (`/admin/guide`)**: Hướng dẫn trực quan quy trình 4 bước từ tạo Dataset ➔ Vụ án ➔ Chương ➔ Khóa học & Xuất bản.

### 🔹 2. Quản Lý Trạng Thái Giao Diện (`/admin/pages` hoặc `/admin/settings?tab=pages`)
Admin có toàn quyền điều khiển khả năng truy cập của Người học theo thời gian thực:
- 🟢 **Hoạt động (Active)**: Trang hiển thị bình thường cho Người học.
- 🟡 **Thông báo (Notice)**: Trang vẫn truy cập được nhưng hiển thị banner lưu ý trên cùng.
- 🔴 **Bảo trì (Maintenance)**: Chặn Người học truy cập, tự động chuyển hướng về trang **Bảo trì (`UnderMaintenancePage`)**.
- **Admin Maintenance Bypass**: Cho phép Admin bật cờ Bypass để xem trước các trang đang bảo trì.

### 🔹 3. Công Cụ Dev Test Onboarding (`/admin/settings`)
- Cung cấp nút 1-click đặt lại trạng thái Onboarding Welcome Gate và Dashboard Guided Tour để thuận tiện cho việc kiểm thử.

---

## 🌍 4. Phân Luồng Môi Trường (Dev vs Prod)

- **Môi trường Phát triển (Dev Branch / Local)**:
  - Hiển thị Badge **"DEV"** trên thanh điều hướng Topbar.
  - Cho phép đăng nhập nhanh qua nút **Demo Login**, truy cập công cụ kiểm thử nhanh Onboarding.
- **Môi trường Sản phẩm (Main Branch / Vercel Production)**:
  - Tự động ẩn các lối tắt Demo/DEV, bảo vệ phân quyền chặt chẽ qua Firebase Auth & RBAC Guards.

---

## 📚 5. Tài Liệu Kỹ Thuật Chi Tiết

Dự án được tài liệu hóa đồng bộ trong thư mục `docs/`:

- 📓 **[`docs/PROJECT_CONTEXT.md`](./docs/PROJECT_CONTEXT.md)**: Báo cáo tổng quan dự án, cấu trúc mã nguồn, danh sách tính năng và lộ trình Sprints.
- 📋 **[`docs/CURRENT_SPRINT.md`](./docs/CURRENT_SPRINT.md)**: Bảng theo dõi tiến độ chi tiết theo từng Step, Backlog nhiệm vụ và trạng thái task hiện tại.
- 🏛️ **[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)**: Sơ đồ phân vùng Module, hợp đồng ranh giới, ánh xạ thực thể Domain và chiến lược kiểm thử tự động.
- ⚖️ **[`docs/DECISIONS_LOG.md`](./docs/DECISIONS_LOG.md)**: Nhật ký quyết định kiến trúc quan trọng (ADR-001 đến ADR-009).
- 🤖 **[`docs/AGENT_PROTOCOLS.md`](./docs/AGENT_PROTOCOLS.md)**: Quy chuẩn giao thức hoạt động, hợp đồng service dành cho AI Agent.
