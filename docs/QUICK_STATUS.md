# Tóm tắt Tiến độ & Kế hoạch Tiếp theo (Quick Status)

---

### 1. Hiện tại đã xong gì?
* **Hoàn thành Sprint 9.5 — Step 9.5.1: Xây dựng màn hình `PracticeSandboxPage` (Trình thực hành tự do theo mô hình W3Schools "Try it Yourself"):**
  - **Màn hình Sandbox chia đôi Split-Pane IDE:** Cột Trái hiển thị lý thuyết + presets 1-click; Cột Phải thực thi Excel Formula và SQL Query.
  - **Động cơ thực thi tự do:** Không áp lực trừ XP, tính toán tức thì với Excel WASM/Parser và SQLite WASM Worker.
  - **Chế độ Focus Mode tự động đóng Sidebar:** Tuyến đường `/sandbox` chạy bên trong `FocusLayout`, tự động kích hoạt Focus Mode mặc định mở rộng toàn màn hình.
  - **Liên thông 2 chiều:** Nút "Thử ngay" trên syntax code blocks, nút "Mở Sandbox" trên `KnowledgeHubPage` và mục menu `LearnerLayout`.
  - **Cải tiến Trải nghiệm Excel (UX) & Final Verification Gate (PASS — RELEASE READY):**
    - **In-cell Overlay (`CellEditorOverlay`):** Nhấp đúp mở editor nổi dùng `createPortal` vào scroll container, đồng bộ 2 chiều tức thì với `FormulaBar`, tự động mở rộng theo nội dung (`width: max-content`) mà không làm méo lưới bảng tính.
    - **Session State Machine độc lập:** Tách biệt tuyệt đối giữa `originalValue`, `draftValue` và `committedValue`. Nhấn `Escape` hủy và hoàn tác 100% không làm biến dạng dữ liệu.
    - **Cơ chế Validation P0:** Công thức không hợp lệ (ví dụ `=SUM(`) giữ nguyên editor mở với viền đỏ `border-rose-500`, khóa không cho click chuyển sang ô khác.
    - **Điều hướng bàn phím chuẩn Excel:** `Enter` commit và nhảy xuống ô dưới (D10 -> D11), `Tab` commit và nhảy sang ô phải (D10 -> E10), `Escape` giữ nguyên vị trí, phím mũi tên điều khiển con trỏ văn bản.
    - **Hiệu năng Render chứng minh qua Render Counter:** `window.__SPREADSHEET_GRID_RENDER_COUNT__` chứng minh `SpreadsheetGrid` và các thẻ `<td>` không bị re-render thêm bất kỳ lần nào trong suốt quá trình gõ phím.
    - **Fix SplitPane & Hiển thị kết quả trong ô:**
      - Đã chuẩn hóa prop kích thước dạng chuỗi phần trăm (`'38%'`, `'62%'`) cho `react-resizable-panels`, sửa lỗi panel Đề bài bị co hẹp thành 42px.
      - Đã kích hoạt cơ chế `renderCellValue` cho toàn bộ các hàng ghost rows (hàng 10 trở đi), đảm bảo các ô tính toán như `D10`, `F10` hiển thị kết quả và định dạng tiền tệ trực tiếp trong ô.
    - **Kiểm thử tự động:** 19/19 tests Sandbox và 71/71 test suites toàn dự án (562/562 tests) vượt qua 100%. Xác thực runtime trên trình duyệt ở cả 2 giao diện Light và Dark mode.


* **Hoàn thành Sprint 9.5 — Step 9.5.2: Xây dựng Cấu Trúc Khóa Học Academy Mode (W3Schools Style):**
  - **Cơ sở dữ liệu giáo trình phân cấp chuẩn hóa (`academySyllabus.js`):**
    - Cung cấp 2 khóa học chính thức: **Excel Chuyên Sâu (`excel-academy`)** và **SQL Thực Chiến (`sql-academy`)**.
    - Phân chia theo chương mục tuần tự (Chapters & Lessons): Chương 1 (Căn bản), Chương 2 (Điều kiện & Thống kê nâng cao).
    - Mở rộng mock topics hoàn chỉnh 8 bài học (`topic-001` đến `topic-008`) kèm presets thực hành tương ứng.
  - **Giao diện Khóa học Học viện (`AcademyCoursePage` tại `/academy`, `/academy/:courseSlug`, `/academy/:courseSlug/:topicId`):**
    - **Sidebar mục lục giáo trình W3Schools:** Chuyển đổi linh hoạt giữa 2 khóa học Excel/SQL, thanh % tiến độ học tập thời gian thực (`X/Y bài (Z%)`), cây bài học phân cấp theo chương (Accordion) có tick xanh `CheckCircle2` khi đã hoàn thành.
    - **Vòng lặp học tập khép kín (Closed-loop Learning Cycle):**
      1. **Lý thuyết chi tiết**: Render Markdown chuẩn mực qua `KnowledgeViewer`.
      2. **Thẻ Try it Yourself**: Hiển thị công thức/câu lệnh mẫu kèm nút mở thẳng sang Sandbox trong chế độ Focus Mode.
      3. **Thẻ Quick Checkpoint**: Câu đố trắc nghiệm tương tác 4 lựa chọn (A, B, C, D) kiểm tra mức độ hiểu bài ngay tại chỗ, phản hồi Đúng/Sai tức thì kèm giải thích chi tiết, thưởng **+20 XP** và tự động đánh dấu hoàn thành bài học qua `knowledgeService`.
      4. **Footer điều hướng tuần tự**: Cặp nút `[ ❮ Bài trước: ... ]` và `[ Bài tiếp theo: ... ❯ ]` giúp học viên không bao giờ bị rơi vào ngõ cụt.
  - **Tích hợp hệ thống:**
    - Khai báo các tuyến đường `/academy` trong `src/app/router/index.jsx`.
    - Thêm mục `"Học viện Academy"` vào thanh điều hướng Sidebar (`LearnerLayout.jsx`).
  - **Chất lượng kiểm thử & biên dịch:**
    - Test suite `AcademyCoursePage.test.jsx`: **6/6 tests PASS 100%**.
    - Toàn bộ test suite dự án: **71/71 test suites, 549/549 tests PASS 100%**.
    - Build production `npm run build`: Thành công 100% (1969 modules, 0 errors).

---

### 2. Tiếp theo cần làm gì?
* **Triển khai Sprint 9.5 — Step 9.5.3: Hệ Thống Bài Thi Tốt Nghiệp & Cấp Chứng Chỉ Academy (Academy Certification & Mini-Exams):**
  - Xây dựng bài kiểm tra tổng hợp cuối khóa (Final Quiz / Assessment) cho từng khóa học (Excel Academy & SQL Academy).
  - Cấp chứng chỉ điện tử (Digital Certificate / Badge) khi học viên đạt từ 80% điểm bài thi tốt nghiệp, lưu vào hồ sơ thám tử (`/profile` & `/achievements`).
  - Hoàn thiện luồng liên kết mượt mà giữa Academy Mode (Học viện lý thuyết + thực hành) và Game Vụ án (Vận dụng phá án trinh thám).

---

### 3. Bước đầu tiên cần làm trong bước tiếp theo là gì?
* **Bước 9.5.3.1: Thiết kế cấu trúc đề thi tốt nghiệp & cấp chứng chỉ (`academyExamService.js`):**
  - Xây dựng ngân hàng câu hỏi tổng hợp cuối khóa cho `excel-academy` và `sql-academy`.
  - Thiết kế modal / trang thi trắc nghiệm tính giờ và cấp chứng nhận Certificate hoàn thành khóa học.
