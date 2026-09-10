# Technical Debt & Backlog

## Hạng mục tồn đọng từ Sprint 9 & 9.1 (Mission Workspace & UI/UX Refactor) — [ĐÃ HOÀN TẤT DỌN DẸP]

1. **Kiến trúc Chia Khung & Tỷ Lệ Viewport (Split-Pane):**
   - *Vấn đề:* Bố cục xếp chồng dọc gây lãng phí chiều ngang desktop, đẩy bảng tính xuống đáy màn hình; tỷ lệ 40:60 cũ làm bên đề bài chiếm nhiều diện tích hơn mức cần thiết.
   - *Trạng thái:* **ĐÃ XỬ LÝ (Resolved).** Chuyển sang mô hình 3 lớp chuẩn mực (Top Bar $\to$ Split-Pane $\to$ Bottom Action Bar). Điều chỉnh tỷ lệ Desktop về 34% (Context) : 66% (Primary Spreadsheet Workspace).

2. **UX Ô Mục Tiêu (Target Cell) & Trống Chân Bảng Tính:**
   - *Vấn đề:* Badge chữ `"Mục tiêu"` đặt trực tiếp bên trong ô tính làm che khuất nội dung dữ liệu; bảng dữ liệu ít dòng (4-5 hàng) để lại khoảng trống trắng hẫng hụt bên dưới.
   - *Trạng thái:* **ĐÃ XỬ LÝ (Resolved).** Loại bỏ hoàn toàn badge chữ trong ô, thay bằng viền Hổ phách sắc nét (`ring-2 ring-amber-500`) và marker nhỏ không che chữ. Bổ sung cơ chế Ghost Rows tự động bù đủ 16 hàng chuẩn bảng tính Excel thực thụ.

3. **Thanh Nhập Công Thức & Phân Tán Nút Hành Động:**
   - *Vấn đề:* Nút Nộp bài, Chạy thử, Đặt lại nằm rải rác; thanh công thức bị hẹp.
   - *Trạng thái:* **ĐÃ XỬ LÝ (Resolved).** Chuẩn hóa Formula Bar thành thanh công cụ Excel chuyên nghiệp (Name Box `[ E2 ]` $\to$ `fx` $\to$ Input $\to$ Reset $\to$ Run). Nút Nộp bài và điều hướng bài trước/sau được tách độc lập xuống Bottom Action Bar kiểu LeetCode.

4. **Chế Độ Tập Trung (Focus Mode) Tương Tác:**
   - *Vấn đề:* Trước đây chỉ có badge tĩnh "FOCUS MODE", không có tương tác thu gọn để người học tập trung cao độ.
   - *Trạng thái:* **ĐÃ XỬ LÝ (Resolved).** Nâng cấp thành nút toggle tương tác, thu gọn toàn bộ sidebar và mở rộng bảng tính 100% kèm nút nổi `"Xem đề bài"` tiện lợi.

5. **Thiết Kế Đa Tầng Dark Mode & Semantic Tokens:**
   - *Vấn đề:* Màu sắc Dark mode bị vỡ, độ tương phản không đồng nhất, xuất hiện hardcoded colors trong component.
   - *Trạng thái:* **ĐÃ XỬ LÝ (Resolved).** Quy hoạch toàn diện hệ thống semantic tokens cho cả Light Mode (`#F5F6F8`) và Dark Mode đa tầng (`#0F0F0F`, `#151515`, `#181818`, `#202020`, `#303030`).

---

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

---

## Hạng mục tồn đọng từ Sprint 9.5 (Academy & Practice Sandbox) — [ĐÃ HOÀN TẤT DỌN DẸP]

1. **Trải nghiệm Chỉnh sửa Ô Bảng Tính Excel (In-Cell Editor UX & Grid Distortion):**
   - *Vấn đề:* Chỉnh sửa trực tiếp bên trong thẻ `<td>` làm vỡ kích thước ô và giật lưới bảng tính; thiếu state machine đồng bộ giữa ô và thanh công thức (Formula Bar); gõ phím gây re-render toàn bộ `SpreadsheetGrid`.
   - *Trạng thái:* **ĐÃ XỬ LÝ (Resolved).** Xây dựng `CellEditorOverlay` render qua `createPortal` vào scroll container, tự động mở rộng theo nội dung (`max-content`). Thiết lập Session State Machine độc lập (`originalValue`, `draftValue`, `committedValue`). Hỗ trợ phím Enter, Tab, Escape, giữ editor mở khi công thức sai. Không gây bất kỳ re-render thừa nào trên lưới bảng tính.

2. **Lỗi Co Hẹp Split-Pane & Định Dạng Tiền Tệ Hàng Trống (Ghost Rows):**
   - *Vấn đề:* Panel lý thuyết/đề bài bị co hẹp thành 42px do sai kiểu dữ liệu kích thước (`react-resizable-panels`); các ô tính toán như `D10`, `F10` trên ghost rows không hiển thị kết quả và định dạng tiền tệ.
   - *Trạng thái:* **ĐÃ XỬ LÝ (Resolved).** Chuẩn hóa props kích thước dạng chuỗi phần trăm (`'38%'`, `'62%'`); kích hoạt `renderCellValue` cho toàn bộ các hàng ghost rows để hiển thị kết quả tính toán tức thì.

3. **Khởi Tạo Firebase & Crash Màn Hình Trắng trên Vercel (`auth/invalid-api-key`):**
   - *Vấn đề:* Khởi tạo `getAuth(app)` top-level trong `firebase.js` khi thiếu biến môi trường Firebase khiến Firebase SDK v10+ ném ngoại lệ `auth/invalid-api-key`, gây màn hình trắng (white screen) khi deploy lên Vercel.
   - *Trạng thái:* **ĐÃ XỬ LÝ (Resolved).** Bổ sung flag `isFirebaseConfigured` và cấu hình fallback an toàn. Tự động chuyển hướng sang Mock Services nội bộ nếu môi trường không có Firebase API key, giúp ứng dụng luôn chạy mượt mà 100%.

4. **Kỳ Thi Tốt Nghiệp & Cấp Chứng Chỉ Điện Tử (Academy Certification & Mini-Exams — Step 9.5.3):**
   - *Vấn đề:* Sau khi hoàn thành các bài học W3Schools Style, học viên thiếu bài đánh giá tổng hợp để kiểm chứng năng lực và nhận chứng chỉ ghi nhận thành quả.
   - *Trạng thái:* **ĐÃ XỬ LÝ (Resolved).** Xây dựng bộ đề 10 câu hỏi sát hạch trắc nghiệm chuyên sâu cho Excel & SQL Academy kèm giải thích, đồng hồ đếm ngược 15 phút, điều kiện đỗ $\ge 80\%$, và hệ thống cấp Chứng chỉ số Detective Amber Gold (`AcademyCertificateModal.jsx`) hỗ trợ In/Tải PDF, sao chép mã xác thực, lưu trữ trên Profile.

