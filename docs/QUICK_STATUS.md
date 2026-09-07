# Tóm tắt Tiến độ & Kế hoạch Tiếp theo (Quick Status)

---

### 1. Hiện tại đã xong gì?
* **Hoàn thành Sprint 9.1 — Tái cấu trúc toàn diện không gian giải đố Excel Mission Workspace:**
  - **Kiến trúc 3 lớp:** Top App Bar tinh gọn $\to$ Split-Pane IDE 34:66 trên Desktop $\to$ Bottom Action Bar độc lập kiểu LeetCode (Nộp bài + Điều hướng bài trước/sau).
  - **Bảng tính chuẩn Excel thực thụ:** Bỏ hẳn badge chữ che chữ trong ô đích, thay bằng viền Hổ phách sắc nét; bổ sung hàng trống liên tục (Ghost Rows tối thiểu 16 hàng) xóa bỏ khoảng hẫng chân bảng tính; sticky headers và căn phải số liệu chuẩn mực.
  - **Hệ thống phân tầng thông tin 4 cấp ở cột trái:** Tên vụ án nổi bật nhất $\to$ Hồ sơ vụ án trinh thám $\to$ Mục tiêu trọng tâm kèm tọa độ ô đích $\to$ Gợi ý lũy tiến thu gọn tiết kiệm diện tích.
  - **Chế độ tập trung (Focus Mode) tương tác:** Bấm nút toggle trên Top Bar thu gọn hoàn toàn cột đề bài, mở rộng bảng tính 100% kèm nút nổi `"Xem đề bài"` tiện lợi.
  - **Đồng bộ Design Tokens & Phông chữ:** Bảng màu đa tầng Dark mode (`#0F0F0F`) và Light mode chuẩn mực; phân định rạch ròi sans-serif cho văn bản và mono cho tọa độ/công thức/ID.
  - **Chất lượng:** Pass toàn bộ **69 test suites (537/537 tests)**, build production thành công 100%.

---

### 2. Tiếp theo cần làm gì?
* **Triển khai Sprint 9.5 — Academy Mode & Interactive Sandbox:**
  - Mở rộng nền tảng theo mô hình W3Schools (bên cạnh chế độ Game Trinh thám hiện tại), xây dựng môi trường học kết hợp thực hành ngay lập tức *(Try it Yourself)*.
  - Tổ chức lại luồng bài học tuần tự từ lý thuyết đến thực hành tự do không bị gò bó bởi điều kiện phá án.

---

### 3. Bước đầu tiên cần làm trong bước tiếp theo là gì?
* **Bước 9.5.1: Xây dựng màn hình `PracticeSandboxPage` (Trình thực hành tự do):**
  - Thiết kế layout chia đôi màn hình (Split-Pane): Cột trái hiển thị lý thuyết ngắn gọn từ `KnowledgeHub`, Cột phải là Trình soạn thảo công thức/truy vấn (Excel Formula / SQL Editor) kèm Bảng kết quả chạy thử tức thì.
  - Tích hợp engine thực thi tự do (`excelChecker` / `sql-wasm`) cho phép người học gõ và xem kết quả tính toán theo thời gian thực mà không yêu cầu nộp bài chấm điểm.
