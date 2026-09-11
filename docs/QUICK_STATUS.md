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

* **Hotfix Triển khai Production Vercel (`auth/invalid-api-key`):**
  - **Khắc phục lỗi màn hình trắng (White screen crash):** Xử lý triệt để lỗi `Uncaught FirebaseError: Firebase: Error (auth/invalid-api-key)` phát sinh khi deploy lên Vercel do thiếu biến môi trường Firebase ở top-level module evaluation.
  - **Cơ chế Fallback & Graceful Degradation:** Bổ sung flag `isFirebaseConfigured` và fallback an toàn trong `src/lib/firebase.js`. Tự động chuyển hướng sang Mock Services chuẩn mực nếu thiếu biến môi trường Firebase (`VITE_FIREBASE_API_KEY`).
  - **Xác thực Production:** Đã deploy thành công lên Vercel (`https://avi-mystery.vercel.app/dashboard`), giao diện đăng nhập, điều hướng và dashboard tải mượt mà không lỗi.

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
    - Toàn bộ test suite dự án: **71/71 test suites, 562/562 tests PASS 100%**.
    - Build production `npm run build`: Thành công 100% (0 errors).

* **Hoàn thành Sprint 9.5 — Step 9.5.3: Hệ Thống Bài Thi Tốt Nghiệp & Cấp Chứng Chỉ Academy (Academy Certification & Mini-Exams) — [HOÀN THÀNH 100%]:**
  - **Dữ liệu ngân hàng câu hỏi (`academyExams.js`):** 10 câu hỏi sát hạch chuyên sâu cho Excel Academy & SQL Academy, giải thích chi tiết, 15 phút đếm ngược, ngưỡng đạt ≥ 80% (+100 XP).
  - **Service chấm điểm & chứng chỉ số (`academyExamService.js`):** Chấm điểm tự động, xếp loại (Xuất sắc / Giỏi / Đạt chuẩn), cấp mã Certificate ID duy nhất (`AVI-EXCEL-CERT-XXXXX` / `AVI-SQL-CERT-XXXXX`), lưu trữ qua `storage.js` và trao thưởng XP an toàn qua `progressService.awardXp`.
  - **Giao diện làm bài thi (`AcademyExamPage` tại `/academy/:courseSlug/exam`):** Màn hình Briefing thể lệ $\to$ Trình thi trắc nghiệm (Timer đếm ngược, Jumper 1-10, thẻ trắc nghiệm, modal xác nhận nộp bài) $\to$ Màn hình Kết quả vinh danh và phân tích đáp án chi tiết.
  - **Chứng chỉ điện tử Detective Amber (`AcademyCertificateModal.jsx`):** Khung viền vàng kim loại sang trọng, con dấu học viện, tên học viên, ngày cấp, xếp loại, hỗ trợ In/Lưu PDF (`window.print()`) và sao chép mã xác thực.
  - **Liên thông hệ thống:** Nút thi tốt nghiệp ở cuối bài học & sidebar `AcademyCoursePage`, khu vực "Chứng Chỉ Học Viện" trên `ProfilePage` và đăng ký route trong `router/index.jsx`.
  - **Kiểm thử & Biên dịch:** `AcademyExamPage.test.jsx` (5/5 tests PASS); toàn dự án đạt **72/72 test suites (567/567 tests PASS 100%)**, build production Vite hoàn tất trơn tru.

---

* **Hoàn thành Phase 2 & 3: Tái thiết kế Luồng Điều Tra Viên & Trải Nghiệm Vụ Án (Detective Experience):**
  - **Dashboard (Bản Doanh Điều Tra):** Chuyển đổi thành "Detective Home" lấy hồ sơ vụ án đang điều tra làm trọng tâm, danh sách nhiệm vụ ưu tiên, thống kê cấp bậc thám tử và phím tắt điều hướng nhanh.
  - **Mission Intro (Hồ Sơ Vụ Án / Case Dossier):** Layout hồ sơ tài liệu bảo mật, hạ cấp metadata thông số kỹ thuật xuống footer strip, làm nổi bật bối cảnh cốt truyện và mục tiêu phá án.
  - **Investigation Workspace & Navigation:**
    - Tinh giản thanh phân cách co giãn `WorkspaceSplitPane`, loại bỏ nút toggle gây đè trùng vị trí.
    - Cập nhật nút "Rời bàn làm việc" điều hướng dứt khoát về Bản Đồ Học Tập (`/map`).

* **Hoàn thành Phase 4: Tái cấu trúc Học viện & Vòng Lặp Học Tập Điều Tra (Academy & Investigation Learning Loop):**
  - **Tuân thủ 5 nguyên tắc chỉ đạo:**
    1. Evidence là presentation concept, không thay đổi data models backend.
    2. Metadata hạ cấp hierarchy, không xóa.
    3. Clarity > role-play trong nút bấm và nhãn điều hướng.
    4. Workspace tinh gọn, không redesign toàn bộ.
    5. Taste Audit được thực hiện nghiêm ngặt trước và sau triển khai.
  - **Triết lý học tập thực chiến:** Tinh giản thủ tục cấp chứng chỉ rườm rà, tập trung tuyệt đối vào chu trình: **"Đọc ➔ Hiểu ➔ Thực hành"**.
  - **Trung Tâm Đào Tạo Nghiệp Vụ (`/courses`):** Reframe từ giao diện danh mục khóa học LMS thông thường sang Trung tâm Phương pháp luận Điều tra, bổ sung trường **🎯 Ứng dụng điều tra** cho từng khóa học (Excel: kiểm tra sai lệch/đối soát; SQL: truy vết nhật ký/khoanh vùng đối tượng).
  - **Hồ Sơ Chuyên Đề Nghiệp Vụ (`/courses/:slug`):** Bổ sung khối "Mục tiêu nghiệp vụ & Ứng dụng trong điều tra", tích hợp lối tắt mở nhanh bài giảng chuyên sâu trong Học viện Academy.
  - **Cơ chế Sổ tay điều tra (`investigationNotebookService.js`):** Cho phép học viên bấm **"Ghim sổ tay"** tại bất kỳ bài đọc nào ở Học viện để lưu lại công thức/câu lệnh mẫu vào `localStorage`, phát event đồng bộ thời gian thực.
  - **Cầu nối Vòng lặp Học tập (Mission ➔ Academy ➔ Mission):**
    - Khi bí ý tưởng tại `ProblemPane`, mục Gợi ý cung cấp liên kết **"Tra cứu Học viện ❯"** dẫn thẳng đến bài giảng liên quan.
    - Tại `AcademyCoursePage`, thanh banner nổi bật hỗ trợ: *"Bạn đang tra cứu tài liệu cho Vụ án X. Đã nắm vững kiến thức? [Quay lại phá án ➔]"*.
    - Tại `ProblemPane`, thẻ **Sổ tay điều tra** hiển thị ngay các ghi chú đã ghim kèm cú pháp mẫu có thể copy nhanh vào bảng tính.
  - **Field Check Exam (`/academy/:courseSlug/exam`):** Reframe bài thi thành bài kiểm tra xác thực năng lực thực chiến, màn hình hoàn thành dẫn thẳng vào Bản đồ Phá án (`/map`).
  - **Chất lượng kiểm thử & biên dịch:** 72/72 test files (567/567 tests) PASS 100%, `npm run build` hoàn thành thành công trong 10.32s.

---

### 2. Tiếp theo cần làm gì?
* **Lựa chọn 1 (Tiếp tục hoàn thiện Frontend UX theo Anti-slop / Taste Audit):**
  - Đồng bộ giao diện `KnowledgeHubPage` và `PracticeSandboxPage` theo ngôn ngữ thiết kế điều tra tinh gọn.
  - Mở rộng Sổ tay điều tra cho phép người học tự thêm ghi chú cá nhân dạng text ngắn ngoài các công thức ghim tự động.
* **Lựa chọn 2 (Khởi động Sprint 10: Backend API & Data Persistence với FastAPI + PostgreSQL):**
  - Xây dựng RESTful API server sử dụng Python FastAPI và PostgreSQL database.
  - Tạo database migrations, thiết lập schema tables cho Users, Courses, Chapters, Investigations, Questions, Submissions, Progress, Exams, Certificates.
  - Thay thế các Frontend Mock Adapters bằng API Client thực tế giữ nguyên Frontend contracts (`src/services/contracts/`).

---

### 3. Bước đầu tiên cần làm trong bước tiếp theo là gì?
* Xác nhận với người dùng về hướng đi ưu tiên tiếp theo (Tiếp tục hoàn thiện UX các trang còn lại hay bắt tay vào Backend Sprint 10).

