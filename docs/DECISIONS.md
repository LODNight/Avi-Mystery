# Nhật Ký Quyết Định Kiến Trúc (Architecture Decision Log - ADR)

---

## ADR-001: Lựa Chọn Stack Frontend (React + Vite + Tailwind CSS + Vitest)

* **Bối cảnh:** Dự án Avi-Farm (DataQuest) đòi hỏi giao diện học tập tương tác cao, mượt mà và linh hoạt trong thiết kế game hóa.
* **Quyết định:**
  - Sử dụng React 18 & Vite cho tốc độ build và Hot Module Replacement (HMR) cực nhanh.
  - Sử dụng Vanilla Tailwind CSS 3 cho Design System phong cách Detective Amber.
  - Sử dụng Vitest + React Testing Library để viết unit và component tests.
* **Lý do:** Tốc độ phản hồi tức thì, cấu hình gọn nhẹ, đáp ứng tốt yêu cầu MVP.

---

## ADR-002: Kiến Trúc Abstraction Layer: Mock Adapter → API Adapter

* **Bối cảnh:** Frontend được phát triển song song trước khi Backend FastAPI hoàn thành. Cần tránh việc UI import trực tiếp dữ liệu JSON hoặc gọi `fetch()` rải rác.
* **Quyết định:**
  - Định nghĩa **Service Contracts** rõ ràng dưới dạng JS object spec (`authServiceContract`, `courseServiceContract`, v.v.).
  - Triển khai **Mock Adapters** trả về cấu trúc dữ liệu chuẩn domain models kèm giả lập độ trễ mạng (`delay(300ms)`).
  - Cung cấp cổng chuyển đổi tập trung `src/services/index.js` điều khiển bằng biến `USE_MOCK`.
* **Lý do:** Cho phép đổi sang kết nối API Backend thật (`USE_MOCK = false`) mà **không cần sửa bất kỳ file JSX UI nào**.

---

## ADR-003: Phân Quyền Vai Trò (Role-Based Access Control - RBAC)

* **Bối cảnh:** Hệ thống hỗ trợ 3 nhóm vai trò: `super_admin`, `content_admin`, `learner`.
* **Quyết định:**
  - Tạo bảng trợ giúp quyền hạn `src/constants/roles.js` quy định rõ quyền truy cập Admin (`super_admin`, `content_admin`) và Learner (`learner`).
  - Xây dựng HOC Route Guards (`RequireAuth`, `RequireLearner`, `RequireAdmin`) bao bọc các tuyến đường trong `AppRouter`.
* **Lý do:** Đảm bảo an toàn phân quyền ngay tại phía Frontend trước khi được Backend kiểm tra lại.

---

## ADR-004: Accessible Loading Patterns (Skeleton Loading & ARIA)

* **Bối cảnh:** Người dùng cần nhận biết trạng thái đang tải dữ liệu để tăng trải nghiệm người dùng (Perceived Performance).
* **Quyết định:**
  - Sử dụng Skeleton loaders giữ nguyên khung bố cục (Layout Geometry) thay vì Spinner xoay đơn điệu.
  - Gắn thuộc tính `aria-busy="true"` vào vùng container đang thực hiện fetch dữ liệu.
* **Lý do:** Đạt tiêu chuẩn Accessibility (a11y) và chống giật giật giao diện (Layout Shift).
