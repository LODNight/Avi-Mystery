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
| **Kiểm thử tự động** | `npx vitest run` | Chạy toàn bộ 30 test files / 222 test cases |
| **Đóng gói sản phẩm** | `npm run build` | Đóng gói bản Production vào thư mục `dist/` |
| **Xem trước bản Build** | `npm run preview` | Chạy xem trước bản Production sau khi build |

---

## 🕵️ 2. Luồng Vận Hành Giao Diện Người Học (Learner Operations)

```text
[Trang chủ / Login] ➔ [/courses] ➔ [/courses/:slug] ➔ [/map] ➔ [/missions/:id] ➔ [Excel / SQL Workspace]
```

### 🔹 Step 1: Đăng Nhập & Bảng Điều Khiển (`/login`, `/dashboard`)
- Sử dụng nút **"Demo Login"** (ở môi trường DEV) hoặc đăng nhập để vào giao diện Người học.
- Bảng điều khiển (`/dashboard`) hiển thị tổng quan tiến trình học tập, XP và lối tắt vụ án đang làm dở.

### 🔹 Step 2: Khám Phá & Chọn Khóa Học (`/courses`, `/courses/:slug`)
- Trang danh sách khóa học (`/courses`): Hỗ trợ tìm kiếm theo từ khóa, lọc công cụ (**Excel** hoặc **SQL**) và mức độ khó (**Easy**, **Medium**, **Hard**).
- Trang chi tiết khóa học (`/courses/:slug`): Hiển thị thông tin tổng quan, cấu trúc các Chương học (Accordion) và các Bài học vụ án.

### 🔹 Step 3: Định Hướng Trên Bản Đồ Học Tập (`/map`)
- Bản đồ dạng Node/Tree tương tác hiển thị tiến trình của Người học.
- Trạng thái các nút bài học:
  - 🟢 **Completed / Available**: Đã hoàn thành hoặc đã mở khóa để làm bài.
  - 🟡 **In Progress**: Vụ án đang thực hiện dở dang.
  - 🔒 **Locked**: Vụ án chưa đủ điều kiện mở khóa.

### 🔹 Step 4: Đọc Hồ Sơ Vụ Án (`/missions/:missionId`)
- Xem bối cảnh câu chuyện điều tra trinh thám, mục tiêu vụ án, tập dữ liệu liên quan và phần thưởng XP.
- Nút **"Bắt đầu điều tra"** sẽ chuyển tiếp tới không gian làm việc công cụ phù hợp (Excel hoặc SQL).

### 🔹 Step 5: Không Gian Làm Việc Thực Hành
- **Excel Workspace (`/missions/:missionId/excel`)**:
  - Nhập công thức vào thanh `FormulaBar` hoặc ô lưới `SpreadsheetGrid`.
  - Bấm **"Chạy thử"** để xem kết quả tính toán hoặc **"Nộp bài vụ án"** để chấm điểm.
  - Sử dụng bảng **Gợi ý (Hint Panel)** khi cần hỗ trợ (có tính năng ghim gợi ý lên công thức).
- **SQL Workspace (`/missions/:missionId/sql`)**:
  - Tra cứu cấu trúc bảng & dữ liệu mẫu tại **Schema Browser** bên trái.
  - Soạn thảo câu lệnh SQL tại **SQL Code Editor** (hỗ trợ phím tắt `Ctrl + Enter` và thụt lề Tab 2 khoảng trắng).
  - Bấm **"Chạy thử"** để thực thi câu lệnh trên trình duyệt (SQLite WASM Engine) và xem bảng kết quả tại **ResultViewer**.
  - Bấm **"Nộp bài vụ án"** để chấm điểm tự động. Khi đúng, cửa sổ **`MissionResultModal`** sẽ xuất hiện chúc mừng phá án thành công.

---

## 🛡️ 3. Luồng Vận Hành Quản Trị Viên & Chế Độ Bảo Trì (Admin Operations)

### 🔹 Trang Quản Lý Trạng Thái Giao Diện (`/admin/settings?tab=pages`)
Admin có toàn quyền điều khiển khả năng truy cập của Người học theo thời gian thực:

1. **Thay Đổi Trạng Thái Trang**:
   - 🟢 **Hoạt động (Active)**: Trang hiển thị bình thường cho Người học.
   - 🟡 **Thông báo (Notice)**: Trang vẫn truy cập được nhưng hiển thị banner lưu ý trên cùng.
   - 🔴 **Bảo trì (Maintenance)**: Chặn Người học truy cập, tự động chuyển hướng về trang **Bảo trì (`UnderMaintenancePage`)**.

2. **Cấu Hình Nội Dung Bảo Trì**:
   - Nhập tiêu đề, thông điệp giải thích, lý do và thời gian dự kiến hoàn thành.

3. **Admin Maintenance Bypass (Xem Trước Giao Diện)**:
   - Admin luôn có nút bật/tắt **Bypass** để truy cập và xem trước các trang đang trong chế độ bảo trì mà không bị hệ thống chặn.

4. **Thao Tác Nhanh Khẩn Cấp**:
   - **Bảo trì tất cả**: Chuyển ngay toàn bộ hệ thống sang trạng thái bảo trì.
   - **Kích hoạt tất cả**: Khôi phục tất cả các trang về trạng thái hoạt động.
   - **Khôi phục mặc định**: Đưa cấu hình về trạng thái ban đầu của hệ thống.

---

## 🌍 4. Phân Luồng Môi Trường (Dev vs Prod)

- **Môi trường Phát triển (Dev Branch / Local)**:
  - Hiển thị Badge **"DEV"** trên thanh điều hướng Topbar.
  - Cho phép đăng nhập nhanh qua nút **Demo Login**.
- **Môi trường Sản phẩm (Main Branch / Vercel Production)**:
  - Tự động ẩn các lối tắt Demo/DEV, đảm bảo trải nghiệm người dùng cuối chuẩn chỉnh và an toàn.

---

## 📚 5. Tài Liệu Kỹ Thuật Chi Tiết

Đối với các nhà phát triển muốn tìm hiểu sâu về kiến trúc mã nguồn và tiến độ dự án, tham khảo các tệp tài liệu trong thư mục `docs/`:

- 📓 **[`docs/PROJECT_MASTER_SUMMARY.md`](./docs/PROJECT_MASTER_SUMMARY.md)**: **Báo cáo tổng hợp chi tiết toàn bộ thông tin dự án (Master Summary)**.
- 📋 **[`docs/CHECKLIST.md`](./docs/CHECKLIST.md)**: Danh sách kiểm tra tiến độ chi tiết theo từng Step.
- 📊 **[`docs/PROJECT_STATUS.md`](./docs/PROJECT_STATUS.md)**: Báo cáo trạng thái tổng thể và các quyết định kiến trúc.
- 🧪 **[`docs/TEST_REPORT.md`](./docs/TEST_REPORT.md)**: Kết quả chạy tự động 222 unit & integration test cases.
- 🎯 **[`docs/agent/CURRENT_TASK.md`](./docs/agent/CURRENT_TASK.md)**: Nhiệm vụ hiện tại đang thực hiện.

