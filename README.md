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
| **Kiểm thử tự động** | `npm test -- --run` | Chạy toàn bộ **75 test files / 583 test cases (Pass 100%)** |
| **Đóng gói sản phẩm** | `npm run build` | Đóng gói bản Production vào thư mục `dist/` |
| **Xem trước bản Build** | `npm run preview` | Chạy xem trước bản Production sau khi build |

---

## 🕵️ 2. Luồng Vận Hành Giao Diện Người Học (Learner Operations)

```text
[Đăng ký/Login] ➔ [/onboarding (Case 0)] ➔ [/dashboard (Guided Tour)] ➔ [/courses] ➔ [/map] ➔ [/missions/:id] ➔ [Excel/SQL Workspace] ➔ [/academy | /sandbox | /practice | /profile]
```

### 🔹 Step 0: Đón Tiếp Học Viên Mới (Onboarding & Tutorial Case 0)
- Tân binh đăng ký lần đầu sẽ được điều hướng tới màn hình **Welcome Gate (`/onboarding`)**.
- Học viên có thể tham gia **Khóa huấn luyện tân binh — Case 0 (`/onboarding/case-0`)** với bộ đèn chiếu **Guided Spotlight 4 bước** giúp làm quen với hồ sơ vụ án, bảng tính, thanh công thức và nút nộp bài.
- Sau khi hoàn thành, học viên nhận ngay **+50 XP** đầu tiên và được dẫn dắt về Dashboard.

### 🔹 Step 1: Đăng Nhập & Bảng Điều Khiển (`/login`, `/dashboard`)
- Sử dụng nút **"Demo Login"** (ở môi trường DEV) hoặc tài khoản học viên để vào hệ thống.
- Bảng điều khiển (`/dashboard`) theo phong cách **Bản Doanh Điều Tra (Detective Home)**: Thẻ hồ sơ vụ án ưu tiên, cấp bậc thám tử, lối tắt học viện và chuỗi ngày học 🔥.

### 🔹 Step 2: Khám Phá & Chọn Khóa Học (`/courses`, `/courses/:slug`)
- Trang danh sách khóa học (`/courses`): Hỗ trợ tìm kiếm theo từ khóa, lọc công cụ (**Excel** hoặc **SQL**) và mức độ khó (**Easy**, **Medium**, **Hard**). Mỗi khóa học gắn liền với **🎯 Ứng dụng điều tra** thực tế (đối soát, truy vết).
- Trang chi tiết khóa học (`/courses/:slug`): Hiển thị thông tin tổng quan, cấu trúc các Chương học (Accordion) và lối tắt tra cứu Học viện liên quan.

### 🔹 Step 3: Định Hướng Trên Bản Đồ Học Tập (`/map`)
- Bản đồ dạng Node/Tree tương tác hiển thị tiến trình của Người học theo từng Giai đoạn (Phase Navigation Tabs) với thẻ tổng quan trình độ thám tử (**Skill Mastery Summary**).
- Dữ liệu bản đồ được tối ưu hóa qua **Materialized Read Model (`learning_map_views`)** giúp tải trang tức thì.
- Trạng thái các nút bài học:
  - 🟢 **Completed**: Đã phá án thành công (cho phép làm lại rèn luyện kỹ năng).
  - 🟡 **Current / Available**: Vụ án mở khóa sẵn sàng điều tra.
  - 🔒 **Locked**: Vụ án bị khóa (yêu cầu hoàn thành các bài trước).

### 🔹 Step 4: Đọc Hồ Sơ Vụ Án (`/missions/:missionId`)
- Xem bối cảnh câu chuyện điều tra trinh thám dưới dạng **Hồ sơ bảo mật (Case Dossier)**, mục tiêu vụ án, tập dữ liệu liên quan và phần thưởng XP.
- Nút **"Bắt đầu điều tra"** sẽ chuyển tiếp tới không gian làm việc công cụ phù hợp (Excel hoặc SQL).

### 🔹 Step 5: Không Gian Làm Việc Thực Hành & Bàn Làm Việc Phá Án
- **Excel Workspace (`/missions/:missionId/workspace`)**:
  - Tỷ lệ Split-Pane vàng Desktop (34:66), Focus Mode mở rộng 100%.
  - Ô mục tiêu viền sáng hổ phách (`ring-2 ring-amber-500`), không che khuất số liệu, tự động bổ sung Ghost Rows bù đủ 16 dòng.
  - In-cell Editor Overlay nổi (`createPortal`), hỗ trợ phím Enter/Tab/Esc, zero re-render.
  - Thanh công thức Name Box `[ E2 ]` $\to$ `fx` $\to$ Input $\to$ Reset $\to$ Run.
  - Thẻ **Sổ tay điều tra** ngay trong Problem Pane: tra cứu công thức đã ghim, sửa inline ghi chú cá nhân và 1-click chèn vào bảng tính.
- **SQL Workspace (`/missions/:missionId/sql`)**:
  - Tra cứu cấu trúc bảng & dữ liệu mẫu tại **Schema Browser** bên trái.
  - Soạn thảo câu lệnh SQL tại **SQL Code Editor** (hỗ trợ phím tắt `Ctrl + Enter` và thụt lề Tab 2 khoảng trắng).
  - Bấm **"Chạy thử"** để thực thi câu lệnh trên trình duyệt (SQLite WASM Engine) và xem bảng kết quả tại **ResultViewer**.
  - Bấm **"Nộp bài vụ án"** để chấm điểm tự động. Khi đúng, cửa sổ **`MissionResultModal`** dập con dấu nghiệp vụ `InvestigationStamp` ("ÁN ĐÃ PHÁ / CASE CLOSED") cùng thẻ niêm phong vật chứng `EvidenceCard`.

### 🔹 Step 6: Học Viện Academy & Kỳ Thi Sát Hạch (`/academy`, `/academy/:courseSlug/exam`)
- **Học viện W3Schools Style (`/academy`)**: Cung cấp 2 lộ trình chuyên sâu **Excel Academy** và **SQL Academy**.
  - Sidebar mục lục giáo trình, thanh % tiến độ học tập, cây bài học accordion có tick xanh hoàn thành.
  - Vòng lặp học tập khép kín: Lý thuyết Markdown $\to$ Thẻ Try it Yourself $\to$ Quick Checkpoint trắc nghiệm 4 lựa chọn (+20 XP).
- **Kỳ thi Tốt nghiệp & Chứng chỉ số (`/academy/:courseSlug/exam`)**:
  - Bài kiểm tra năng lực thực chiến 10 câu trắc nghiệm chuyên sâu, đếm ngược 15 phút, điều kiện đạt $\ge 80\%$ (+100 XP).
  - Cấp **Chứng chỉ điện tử Detective Amber** với mã xác thực duy nhất (`AVI-EXCEL-CERT-XXXXX`), hỗ trợ In / Lưu PDF (`window.print()`) và lưu vĩnh viễn trên Profile cá nhân.

### 🔹 Step 7: Phòng Thực Nghiệm Pháp Chứng & Sổ Tay Điều Tra (`/sandbox`, `/knowledge`)
- **Phòng Thực Nghiệm Pháp Chứng (`/sandbox`)**: Trình thực hành tự do không áp lực trừ XP, tính toán tức thì với Excel Formula Checker & SQLite WASM. Hỗ trợ 2 Tabs: Lý thuyết/Presets và Sổ tay ghi chép thực địa.
- **Thư Viện Nghiệp Vụ (`/knowledge`)**: Lưu trữ tài liệu nghiệp vụ chuẩn hóa, gắn con dấu dập mộc `InvestigationStamp`, tích hợp nút mở ngăn kéo **Sổ tay điều tra (Drawer)** mọi lúc mọi nơi.

### 🔹 Step 8: Rèn Luyện & Phát Triển Kỹ Năng
- **Ngân Hàng Luyện Tập Tự Do (`/practice`)**: Giải bài tập củng cố kỹ năng Excel & SQL không ảnh hưởng tuyến tính đến cốt truyện.
- **Hồ Sơ Cá Nhân (`/profile`)**: Xem tổng quan chỉ số Level, XP tích lũy, bộ sưu tập **Chứng chỉ Học viện (Academy Certificates)** và các huy hiệu thám tử.
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

## 📚 5. Tài Liệu Dự Án & Kỹ Thuật

Dự án được tài liệu hóa đồng bộ và tinh gọn trong thư mục `docs/`:

- 📊 **[`docs/PROJECT_STATUS.md`](./docs/PROJECT_STATUS.md)**: **Bảng theo dõi tiến độ chính** — Đọc nhanh 2 phút: Đã làm, đang làm, to-do tiếp theo, 6 rủi ro then chốt và các điểm cần tối ưu.
- 🎯 **[`docs/PRODUCT_STRATEGY.md`](./docs/PRODUCT_STRATEGY.md)**: Định vị sản phẩm (Game phá án dữ liệu), nguyên tắc thiết kế Learner UX và Master Roadmap.
- 🏛️ **[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)**: Kiến trúc hệ thống, 4 miền trạng thái (4 State Domains), đa ngôn ngữ 3 tầng, phân vùng module và schema CSDL.
- ⚖️ **[`docs/DECISIONS_LOG.md`](./docs/DECISIONS_LOG.md)**: Nhật ký quyết định kiến trúc quan trọng (ADR-001 đến ADR-010).
- 🤖 **[`docs/AGENT_PROTOCOLS.md`](./docs/AGENT_PROTOCOLS.md)**: Quy chuẩn giao thức hoạt động, hợp đồng service dành cho AI Agent.
- 📂 **`docs/specs/`**: Thư mục chứa các đặc tả kỹ thuật chi tiết (`detective-workspace.md`, `investigation-state.md`, `report-schema.md`, `localization.md`).
- 📦 **`docs/archive/`**: Thư mục lưu trữ lịch sử các sprint và checklist cũ.
