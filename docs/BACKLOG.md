# Technical Debt & Backlog

# Technical Debt & Backlog

## Hạng mục tồn đọng từ Sprint 8.5 (Education / Knowledge Hub) — [ĐÃ HOÀN TẤT DỌN DẸP]

1. **Cơ Chế Offline & Caching Firestore:** 
   - *Vấn đề:* Trước đây Firestore chưa bật IndexedDB local persistence, gây lỗi hoặc màn hình trắng khi mất kết nối mạng.
   - *Trạng thái:* **ĐÃ XỬ LÝ (Resolved).** Đã cấu hình `initializeFirestore` với `persistentLocalCache({ tabManager: persistentMultipleTabManager() })` trong `src/lib/firebase.js`. Dữ liệu các bài học và tiến trình được đồng bộ đa tab và cache bền vững dưới IndexedDB client.

2. **Bộ Render Markdown & Syntax Highlight:** 
   - *Vấn đề:* `KnowledgeViewer` trước đây tự parse bằng chuỗi `split` và regex đơn giản, thiếu hỗ trợ GFM (tables, blockquotes, links, formatted lists).
   - *Trạng thái:* **ĐÃ XỬ LÝ (Resolved).** Đã tích hợp `react-markdown` kết hợp `remark-gfm`. Code blocks được xử lý mượt mà qua component `SyntaxBlock` kèm nút sao chép và nhãn ngôn ngữ.

3. **Giao Diện Gán Nhiệm Vụ Liên Quan (Admin Knowledge Editor):**
   - *Vấn đề:* `relatedMissions` nhập bằng ô text phẩy dễ gây lỗi ID không tồn tại.
   - *Trạng thái:* **ĐÃ XỬ LÝ (Resolved).** Đã nâng cấp thành bộ chọn nhiệm vụ trực quan (Mission Selector) trong `AdminKnowledgeEditorPage.jsx`: hỗ trợ tìm kiếm nhanh, lọc theo công cụ (Excel/SQL), chọn checkbox và hiển thị chip tag kèm tên nhiệm vụ rõ ràng.

4. **Tìm Kiếm & Responsive Mobile (Knowledge Hub):**
   - *Vấn đề:* Thiếu thanh tìm kiếm bài học và thanh sidebar danh mục cố định không tối ưu trên di động.
   - *Trạng thái:* **ĐÃ XỬ LÝ (Resolved).** Đã bổ sung ô tìm kiếm thời gian thực theo từ khóa/công cụ và hỗ trợ Drawer Sidebar kèm menu toggle/backdrop overlay chuẩn responsive cho tablet/smartphone.

