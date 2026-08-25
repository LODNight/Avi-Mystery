# Nhật Ký Quyết Định Kiến Trúc (Architecture Decision Log - ADR)

---

## ADR-001: Lựa Chọn Stack Frontend (React + Vite + Tailwind CSS + Vitest)

* **Bối cảnh:** Dự án Avi-Mystery đòi hỏi giao diện học tập tương tác cao, mượt mà và linh hoạt trong thiết kế game hóa.
* **Quyết định:**
  - Sử dụng React 18 & Vite cho tốc độ build và Hot Module Replacement (HMR) cực nhanh.
  - Sử dụng Vanilla Tailwind CSS 3 cho Design System phong cách Detective Amber.
  - Sử dụng Vitest + React Testing Library để viết unit và component tests.
* **Trạng thái:** `CURRENT` (Đã áp dụng từ Sprint 1).

---

## ADR-002: Kiến Trúc Abstraction Layer: Mock Adapter → API Adapter

* **Bối cảnh:** Frontend được phát triển song song trước khi Backend FastAPI hoàn thành. Cần tránh việc UI import trực tiếp dữ liệu JSON hoặc gọi `fetch()` rải rác.
* **Quyết định:**
  - Định nghĩa **Service Contracts** rõ ràng dưới dạng JS object spec (`authServiceContract`, `courseServiceContract`, v.v.).
  - Triển khai **Mock Adapters** trả về cấu trúc dữ liệu chuẩn domain models kèm giả lập độ trễ mạng (`delay(300ms)`).
  - Cung cấp cổng chuyển đổi tập trung `src/services/index.js` điều khiển bằng biến `USE_MOCK`.
* **Trạng thái:** `CURRENT` (Đã áp dụng từ Sprint 1–4). Backend API thật chuyển hướng sang Sprint 9.

---

## ADR-003: Phân Quyền Vai Trò (Role-Based Access Control - RBAC)

* **Bối cảnh:** Hệ thống hỗ trợ 3 nhóm vai trò: `super_admin`, `content_admin`, `learner`.
* **Quyết định:**
  - Tạo bảng trợ giúp quyền hạn `src/constants/roles.js` quy định rõ quyền truy cập Admin và Learner.
  - Xây dựng HOC Route Guards (`RequireAuth`, `RequireLearner`, `RequireAdmin`) bao bọc các tuyến đường trong `AppRouter`.
* **Trạng thái:** `CURRENT` (Đã áp dụng từ Sprint 1).

---

## ADR-004: In-Browser SQLite WASM Worker Engine & Security Guard

* **Bối cảnh:** Cần cung cấp môi trường thực hành SQL trực tiếp trên trình duyệt mà không phụ thuộc backend server, đồng thời đảm bảo không làm lag UI chính và ngăn chặn các câu lệnh nguy hại.
* **Quyết định:**
  - Sử dụng `sql.js` (SQLite WASM) chạy hoàn toàn trong Web Worker cách ly (`sqlEngine.worker.js`).
  - Xây dựng bộ lọc an toàn `sqlQueryPolicy.js` chặn 100% các từ khóa đột biến cấu trúc/dữ liệu và multi-statement queries.
  - Thiết lập ngắt thời gian thực thi (Execution Timeout 3s) và giới hạn dòng dữ liệu trả về (Row Cap 500 rows).
* **Trạng thái:** `CURRENT` (Đã áp dụng từ Sprint 4).

---

## ADR-005: Tái Cấu Trúc Learning Domain & Bóc Tách Cấu Hình Chấm Điểm (Sprint 5 Architecture)

* **Bối cảnh:** Đợt Audit sau Sprint 4 xác định hai khoản nợ kiến trúc:
  1. Cấu hình kiểm thử (`EXCEL_CHECKER_CONFIG`, `SQL_CHECKER_CONFIG`) đang bị nhúng trực tiếp trong `mockSubmissionService.js`.
  2. Khái niệm `Mission` bị gộp chung giữa bối cảnh vụ án (Story Narrative) và nhiệm vụ kỹ thuật (Technical Task/Step).
* **Quyết định:**
  - Bóc tách cấu hình chấm điểm ra khỏi Submission Adapter đưa về `contentService`.
  - Chuẩn hóa mô hình phân tầng: `Learning Journey` → `Phase` → `Chapter` → `Investigation` → `Question` → `Question Variant` → `Submission` → `Result` → `Progress` → `XP / Mastery`.
  - Độc lập hóa `Dataset` thành tài sản có thể tái sử dụng cho nhiều Question khác nhau.
* **Trạng thái:** `PLANNED` (Sẵn sàng thực thi trong Sprint 5).

---

## ADR-006: Phân Tách Trách Nhiệm Giữa Submission Service & Progress Service (Sprint 6 Architecture)

* **Bối cảnh:** Trước đây `mockSubmissionService.js` tự tính toán `potentialXp` nhưng không lưu trữ tiến độ hoặc level của người học.
* **Quyết định:**
  - `Submission Service` chỉ chịu trách nhiệm đánh giá tính đúng/sai của câu trả lời, trả về `SubmissionResult` chứa kết quả và `potentialXp` (không mutate state).
  - `Progress Service` chịu trách nhiệm độc lập trong việc tiếp nhận `SubmissionResult`, thực hiện trao thưởng XP theo cơ chế **Idempotent** (chống cộng trùng), thăng cấp và cập nhật mở khóa trên Bản đồ Học tập.
* **Trạng thái:** `PLANNED` (Sẵn sàng thực thi trong Sprint 6).

---

## Agent-facing Decisions

Các quyết định scope/contract chi tiết dành cho AI Agent tiếp tục được duy trì tại [`agent/CONTRACTS.md`](./agent/CONTRACTS.md) và [`agent/MODULE_MAP.md`](./agent/MODULE_MAP.md).
