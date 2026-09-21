# 📊 Báo Cáo Tiến Độ Dự Án Avi-Mystery (Project Status)

> **Hướng dẫn đọc nhanh:** File này là tài liệu duy nhất theo dõi tiến độ toàn dự án, cập nhật liên tục. Không có mã task rườm rà — chỉ tập trung vào bức tranh tổng thể: **Đang ở đâu, đã làm gì, sắp tới làm gì, các rủi ro và các điểm cần tối ưu.**

---

## ⚡ 1. Tổng Quan Trạng Thái (15 Giây)

| Chỉ số | Trạng thái | Ghi chú |
|---|---|---|
| **Sprint hiện tại** | 🟢 **Sprint 11 (Xong 100%)** ➔ 🟡 **Sprint 12 (Đang triển khai)** | Đã hoàn thành lõi Bàn làm việc thám tử, Đồng bộ Đa ngôn ngữ toàn trang & Tái cấu trúc Hồ sơ Điều tra viên. |
| **Kiểm thử tự động** | 🟢 **77/77 test suites PASS (592/592 tests — 100%)** | Toàn bộ các luồng nghiệp vụ, giao diện, localization và settings đều có test bảo vệ. |
| **Production Build** | 🟢 **Vite Build SUCCESS** | Không có lỗi biên dịch; bundle và WASM tối ưu. |
| **Bản chạy thử (Demo)** | 🌐 [avi-mystery.vercel.app](https://avi-mystery.vercel.app/dashboard) | Chạy song song nhánh `dev` và `main`. |
| **Backend API** | ⏸️ **Tạm hoãn (Deferred)** | Tập trung 100% tài nguyên hoàn thiện trải nghiệm phá án phía Client trước. |

---

## ✅ 2. Những Gì Đã Hoàn Thành (Accomplished)

Toàn bộ hệ thống hiện tại được xây dựng qua các trụ cột chức năng chính:

### 1. Bàn Phân Tích Thám Tử (Detective Workspace)
- **Kiến trúc 3 cột nghiệp vụ** (`/cases/:caseId/investigate`):
  - **Hồ sơ vụ án (Trái)**: Bối cảnh, mục tiêu điều tra, danh sách nguồn tài liệu (hóa đơn, biên bản kiểm kho, lời khai).
  - **Khu vực chứng cứ (Giữa)**: Xem bảng dữ liệu, biên bản lời khai; trích xuất manh mối (*Finding*), ghim sổ tay hoặc điền nhanh vào báo cáo (*Click-to-Fill*).
  - **Trung tâm chỉ huy HQ (Phải)**: Sổ tay thực địa, kho chứng cứ đã ghim, biểu mẫu báo cáo tiến độ và công cụ thẩm định tự động (*Verification Engine*).
- **Vụ án mẫu Case #001 ("Đường dây buôn lậu cà phê")**:
  - Dữ liệu 2 giai đoạn: Phát hiện sai lệch 4.210 kg cà phê Robusta không có giấy phép Form OUT-07.
  - Quản lý 4 miền trạng thái tách biệt: Case Definition, Session State, UI State, Report Draft.

### 2. Đồng Bộ Đa Ngôn Ngữ Toàn Diện (Comprehensive Localization)
- **Kiến trúc 3 tầng phân cách tuyệt đối**:
  - *Tầng UI*: `i18next` với các namespaces (`nav`, `dashboard`, `map`, `practice`, `achievements`, `profile`, `settings`, `investigation`, `workbench`, `common`), mặc định tiếng Việt, hỗ trợ song ngữ Anh - Việt.
  - *Tầng Trình bày Vụ án*: Tự động dịch tiêu đề, bối cảnh, câu hỏi báo cáo mà không làm mất tiến độ điều tra.
  - *Tầng Nghiệp vụ*: Giữ nguyên 100% giá trị gốc (số liệu bảng tính, ID mã vụ án, đáp án kiểm định) để tránh lỗi so khớp.
- **Phủ sóng toàn diện các phân hệ chính**: Đã hoàn tất chuyển ngữ và kiểm tra trực quan trên Dashboard, Bản đồ điều tra (Learning Map), Phòng thực hành (Practice Lab), Thành tựu (Achievements), Hồ sơ (Profile) và Không gian điều tra (Detective Workspace).
- **Phản ứng tức thì (Runtime Reactivity)**: Đổi ngôn ngữ cập nhật ngay lập tức không cần reload trang.

### 3. Tái Cấu Trúc Trang Cài Đặt — "Hồ Sơ Điều Tra Viên" (Detective Settings Refactor)
- **Kiến trúc thông tin (IA) dạng Section chuẩn HQ**:
  - Tách biệt khỏi mô hình các card nhỏ lẻ, chuyển sang 4 khối ngữ nghĩa lớn:
    1. **Hồ sơ Điều tra viên (Detective Profile)**: Thay đổi Avatar, Tên hiển thị, Mật danh điều tra viên; hỗ trợ Autosave trên click/blur kèm badge trạng thái đã lưu.
    2. **Giao diện & Trải nghiệm (Appearance & Experience)**: Chủ đề (Dark/Light/System), Màu chủ đạo (Amber, Cyan, Emerald, Rose), Ngôn ngữ (VI/EN), Mật độ hiển thị (Tiêu chuẩn/Gọn gàng), Cỡ chữ, Giảm chuyển động.
    3. **Tuỳ chọn Điều tra (Investigation Preferences)**: Mức độ gợi ý manh mối (Tối thiểu/Tiêu chuẩn/Chi tiết), Kiểu hiển thị chứng cứ (Lưới/Danh sách), Tự động mở chứng cứ mới.
    4. **Tài khoản & Dữ liệu (Account & Data)**: Email tài khoản (read-only), Đổi mật khẩu tách riêng thành Modal độc lập (`PasswordModal`) bảo mật, tùy chọn sao lưu và khôi phục dữ liệu.
- **Tích hợp Tầng Dịch Vụ**: Mở rộng `mockAuthService` và `AuthProvider` với `updateProfile` và `changePassword`.
- **Tối ưu Điều Hướng**: Nhúng liên kết Cài đặt trực tiếp vào nhóm Hồ sơ ở `LearnerSidebar` và `FocusLayout`.

### 4. Động Cơ Thực Hành Excel & SQL Trên Trình Duyệt
- **Excel In-Browser**: Bộ tính toán thuần JS (`excelChecker.js`) hỗ trợ các hàm: `SUM`, `AVERAGE`, `MIN`, `MAX`, `COUNTIF`, `SUMIF`, `IF`, `VLOOKUP`, `INDEX/MATCH`.
- **In-cell Formula Editor nổi**: Nhấp đúp vào ô để mở editor nổi, tự co giãn theo nội dung, điều hướng phím `Enter`/`Tab`/`Esc`, chống re-render thừa.
- **SQL In-Browser (SQLite WASM)**: Chạy database SQLite ngay trong Web Worker của trình duyệt, có cơ chế chặn câu lệnh phá hoại (read-only guard) và giới hạn thời gian chạy 3 giây chống treo máy.
- **Bố cục Split-Pane IDE**: Chia khung linh hoạt tỷ lệ 34:66 chuẩn LeetCode / VS Code Web, hỗ trợ Focus Mode toàn màn hình.

### 5. Học Viện Dữ Liệu & Thực Nghiệm Tự Do (Academy & Sandbox)
- **Học viện Academy (W3Schools Style)**: Hai khóa học chính thức *Excel Chuyên Sâu* và *SQL Thực Chiến*, vòng lặp: Lý thuyết ➔ Thử ngay (Sandbox) ➔ Câu đố củng cố (+20 XP) ➔ Điều hướng tuần tự.
- **Phòng Thực Nghiệm Pháp Chứng (Interactive Sandbox)**: Môi trường chạy code và công thức tự do, không áp lực trừ điểm.
- **Hệ Thống Thi Tốt Nghiệp & Chứng Chỉ Số**: Bài thi trắc nghiệm 15 phút, tự động cấp Chứng chỉ điện tử phong cách Thám tử Hổ phách có mã xác thực riêng, hỗ trợ In/Lưu PDF.

### 6. Nền Tảng Hạ Tầng & Công Cụ Quản Trị (Admin Studio)
- **Hệ thống phân quyền (RBAC)**: Route Guard 3 cấp (Khách, Học viên, Quản trị viên).
- **Lưu trữ thời gian thực**: Tích hợp Firebase Firestore cho XP Ledger, tiến độ học tập và cache IndexedDB offline.
- **Admin Content Studio**: Giao diện tạo/sửa khóa học, chương học, vụ án, trình import CSV tự động sinh schema SQLite và chạy thử sandbox an toàn.

---

## 🚀 3. Đang Làm & Kế Hoạch Tiếp Theo (To-Do & Roadmaps)

```
[Sprint 11: ĐÃ XONG] ➔ [Sprint 12: ĐANG LÀM] ➔ [Sprint 13: SẮP TỚI] ➔ [Sprint 14: TƯƠNG LAI]
Lõi Workspace mới        Tích hợp Excel/SQL      Thêm 2 vụ án mới       Âm thanh & Nhập vai
& Đa ngôn ngữ (i18n)     & Đóng kín Case 001     & Tự nạp dataset       (SFX / Voice / Jazz)
```

### 🔹 Sprint 12: Tích hợp Công Cụ Thực Chiến & Hoàn Thiện Case #001 (Ưu tiên P0)
- [x] **Đồng bộ hóa Đa ngôn ngữ**: Chuyển ngữ Dashboard, Learning Map, Practice, Achievements, Profile theo hạ tầng i18n.
- [x] **Tái cấu trúc Cài đặt & Hồ sơ**: Giao diện dạng Section "Hồ sơ điều tra viên", tích hợp đổi mật khẩu modal và tùy chọn điều tra.
- [ ] **Đưa Bảng tính Excel & Terminal SQL vào Bàn Phân Tích trung tâm (`InvestigationWorkbench`)**:
  - Nhúng lưới bảng tính và thanh nhập công thức `fx` vào khu vực làm việc giữa.
  - Cho phép người học tự do phân tích số liệu trên bảng tính mà không bị gò bó vào 1 ô đích duy nhất.
- [ ] **Cơ chế nạp dữ liệu 1-click từ Bằng chứng vào Bảng tính**:
  - Bấm nút *"Mở bảng này trong bảng tính"* trên thẻ chứng cứ để đẩy toàn bộ hàng/cột vào lưới làm việc.
- [ ] **Hoàn thiện chu trình khép kín cho Case #001**:
  - Đọc hồ sơ ➔ Nạp chứng cứ vào bảng tính ➔ Dùng hàm `=SUM(...)` đối soát ➔ Ghi nhận manh mối sai lệch 4.210 kg ➔ Điền Báo cáo gửi Trụ sở ➔ Trụ sở phê duyệt ➔ Mở khóa Phase 2 ➔ Khép lại vụ án (*Case Closed*).

### 🔹 Sprint 13: Mở Rộng Vụ Án & Tự Do Nạp Dữ Liệu (Ưu tiên P1)
- [ ] **Thiết kế 2 Chuyên án mới**:
  - *Case #002 (Kế toán & Thuế)*: Thao túng khấu hao tài sản và che giấu doanh thu.
  - *Case #003 (Logistics & Thương mại điện tử)*: Gian lận đơn hàng ảo và chính sách hoàn tiền.
- [ ] **Tính năng Tải lên Dataset Cá Nhân**: Học viên có thể tự tải file `.xlsx` hoặc `.csv` của mình lên để thực hành phân tích trực tiếp trên giao diện thám tử.
- [ ] **Bảng Ghim Manh Mối Trực Quan (Evidence Pinboard / Corkboard)**: Ghim và nối dây các mối liên hệ giữa nghi phạm và dòng tiền.

### 🔹 Sprint 14: Âm Thanh & Bầu Không Khí Thám Tử (Ưu tiên P2)
- [ ] **Hiệu ứng âm thanh tương tác (SFX)**: Tiếng lật hồ sơ án, tiếng gõ máy chữ cơ học, âm báo dập dấu mộc đỏ phá án thành công.
- [ ] **Nhạc nền Bối cảnh**: Nhạc Jazz đêm mưa nhẹ nhàng mang phong cách văn phòng thám tử tư (tùy chọn bật/tắt).

---

## ⚠️ 4. Các Rủi Ro Cần Lưu Ý (Risks & Mitigations)

| # | Rủi ro tiềm ẩn | Mức độ | Bản chất & Giải pháp khắc phục |
|---|---|---|---|
| **1** | **Xung đột khi chuyển từ LocalStorage sang Backend** | 🔴 **Cao (P0)** | Các kết quả thi và ghi chú hiện lưu ở trình duyệt (`storage.js`). **Giải pháp:** Khi làm backend ở giai đoạn sau, xây dựng cơ chế tự động đồng bộ (Sync on Login) đẩy dữ liệu LocalStorage lên database và dọn dẹp bộ nhớ máy tính. |
| **2** | **Tràn bộ nhớ RAM từ SQLite WASM Worker** | 🟡 **Vừa (P1)** | `sql.js` nạp toàn bộ CSDL vào RAM (~20–50MB). Nếu đổi vụ án liên tục mà không hủy worker sẽ gây lag/crash trên điện thoại. **Giải pháp:** Bắt buộc gọi `dispose()` giải phóng bộ nhớ khi rời màn hình (đã áp dụng trong worker adapter). |
| **3** | **Quá tải chi phí đọc/ghi Firebase Firestore** | 🟡 **Vừa (P1)** | Gọi `getDocs()` liên tục sẽ làm tăng chi phí khi đông người dùng. **Giải pháp:** Sử dụng Read Model tổng hợp sẵn (`learning_map_views`) và bật bộ nhớ đệm offline IndexedDB của Firestore SDK. |
| **4** | **Gian lận điểm XP ở phía Client** | 🟡 **Vừa (P2)** | Do chưa có backend, bộ chấm điểm và trao XP đang chạy ở JavaScript trình duyệt (học viên rành kỹ thuật có thể mở Console can thiệp). **Giải pháp:** Chấp nhận ở giai đoạn thử nghiệm/Demo; chuyển toàn bộ logic so sánh đáp án về server khi triển khai backend chính thức. |
| **5** | **Lệch cú pháp giữa SQLite (Client) và Postgres (Server)** | 🟢 **Thấp (P1)** | SQLite trên trình duyệt có một số hàm ngày tháng (`strftime`) khác với PostgreSQL. **Giải pháp:** Các bài học cốt lõi chỉ dùng chuẩn **ANSI SQL** (tương thích cả hai); các bài chuyên biệt phải chú thích rõ dialect. |
| **6** | **Hạn mức dung lượng 5MB của LocalStorage** | 🟢 **Thấp (P2)** | Lưu trữ quá nhiều file tạm có thể gây lỗi `QuotaExceededError`. **Giải pháp:** Đã bọc `try-catch` an toàn; dữ liệu lớn (CSV, SQLite) được điều hướng sang IndexedDB. |

---

## 🛠️ 5. Các Phần Cần Tối Ưu Lại & Nợ Kỹ Thuật (Tech Debts)

1. **Chuẩn hóa Thông Báo Toast Notification**:
   - Hiện trạng: Còn một số vị trí sử dụng popup `alert()` mặc định của trình duyệt để báo lỗi hoặc thành công.
   - Hướng tối ưu: Thay thế bằng component Toast màu Hổ phách tự biến mất sau 3 giây, có âm báo nhẹ.
2. **Xuất Chứng Chỉ dạng File Ảnh PNG (`html2canvas`)**:
   - Hiện trạng: Nút In chứng chỉ đang phụ thuộc vào hộp thoại `window.print()` của trình duyệt.
   - Hướng tối ưu: Cho phép tải trực tiếp file `.png` sắc nét để người học dễ dàng đăng lên Facebook/LinkedIn.
3. **Phân Trang & Đánh Index Firestore**:
   - Hiện trạng: Một số truy vấn lịch sử hoạt động tải toàn bộ danh sách.
   - Hướng tối ưu: Bổ sung phân trang theo con trỏ (cursor-based pagination) khi lượng hoạt động vượt quá 100 dòng.
4. **Chuẩn hóa Format Dữ liệu Kiểm Định (Canonical Verification Schema)**:
   - Hiện trạng: So khớp đáp án đang dùng raw string matching (`ORD-1842`, `4210`).
   - Hướng tối ưu: Chuẩn hóa theo format canonical verification rules để sau này Backend có thể tái sử dụng trực tiếp mà không cần sửa đổi.
