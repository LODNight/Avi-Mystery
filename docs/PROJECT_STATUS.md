# 📊 Báo Cáo Tiến Độ Dự Án Avi-Mystery (Project Status)

> **Hướng dẫn đọc nhanh:** File này là tài liệu duy nhất theo dõi tiến độ toàn dự án, cập nhật liên tục. Không có mã task rườm rà — chỉ tập trung vào bức tranh tổng thể: **Đang ở đâu, đã làm gì, sắp tới làm gì, các rủi ro và các điểm cần tối ưu.**

---

## ⚡ 1. Tổng Quan Trạng Thái (15 Giây)

| Chỉ số | Trạng thái | Ghi chú |
|---|---|---|
| **Sprint hiện tại** | 🟢 **Sprint 11 (Xong 100%)** ➔ 🟡 **Sprint 12 (Đang hoàn thiện lõi Data Processing)** | Đã hoàn thành Bàn làm việc thám tử, Đồng bộ i18n, Tái cấu trúc Cài đặt, và Lõi Bàn Xử Lý Dữ Liệu (Data Processing Workspace). |
| **Kiểm thử tự động** | 🟢 **80/80 test suites PASS (619/619 tests — 100%)** | Toàn bộ các luồng nghiệp vụ, giao diện, localization, settings, SQL engine scoping và DataProcessingWorkspace đều có test bảo vệ. |
| **Production Build** | 🟢 **Vite Build SUCCESS** | Không có lỗi biên dịch; bundle và WASM tối ưu (8.55s). |
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

### 7. Bàn Xử Lý Dữ Liệu Tái Sử Dụng & Bảo Toàn Dữ Liệu SQL (Data Processing Workspace)
- **Triết lý kiến trúc**: *"CASE IS THE PRODUCT. DATA PROCESSING IS AN INVESTIGATION TOOL."* Không biến công cụ thành trang học SQL/Excel độc lập mà phục vụ trực tiếp tiến trình phá án.
- **Vòng lặp nghiệp vụ Step-driven**:
  - `Step Context` ➔ `Investigation Question` ➔ `Data Processing (SQL / Excel)` ➔ `Result Viewer` ➔ `Evidence Selection` ➔ `Record Finding` ➔ `Investigation Note`.
- **Mô hình Ngữ nghĩa Manh Mối (Finding Semantic Model)**:
  - Phân tách rõ ràng giữa **FACT** (Sự kiện khách quan trích xuất từ dữ liệu) và **INTERPRETATION** (Suy đoán/Nhận định mang tính phán đoán của điều tra viên).
  - Tự động đồng bộ sang Sổ tay điều tra (`Note`) có kèm metadata nguồn (`caseId`, `stepId`, `sourceId`, tọa độ dữ liệu).
  - **Không tự phán xét đúng/sai tức thì**: Không chấm điểm, không cộng XP, không phán xét đúng/sai khi ghi nhận manh mối. Việc thẩm định độ chính xác chuyển dời về giai đoạn Báo cáo Trụ sở (HQ Report).
- **Cơ chế Bảo vệ Toàn vẹn Dữ liệu ở Tầng SQL Engine (Step-Level SQL Scoping)**:
  - Tích hợp lớp kiểm duyệt an toàn `validateTableScope` và `extractTableNames` trong `sqlQueryPolicy.js`.
  - Phân tích cú pháp câu lệnh (FROM, JOIN, CTE), chặn đứng mọi nỗ lực gõ lệnh thủ công để đọc trộm các bảng của Step tương lai hoặc bảng bị ẩn (`SQL_TABLE_UNAVAILABLE`).
  - Đi kèm bộ test hồi quy tự động bảo vệ tính toàn vẹn câu chuyện trinh thám.

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
- [x] **Xây dựng Bàn Xử Lý Dữ Liệu Tái Sử Dụng (`DataProcessingWorkspace`)**:
  - Kiến trúc cấu hình hóa theo Step: `investigationQuestion`, `context`, `location`, `processor` (SQL/Excel), `dataSources`.
  - Khảo sát dữ liệu (`DataExplorer`): Tìm kiếm bảng/cột, danh sách bảng, kiểu dữ liệu, số dòng, xem mẫu dữ liệu.
  - Tái sử dụng trọn vẹn SQL Worker/WASM in-browser (`SQLProcessor`): Giữ nguyên tính năng chỉ đọc, xử lý lỗi thân thiện.
  - Bảng kết quả truy vấn (`ResultViewer`): Xem dữ liệu dạng bảng, cuộn 2 chiều, chọn dòng, sao chép ô/dòng, đưa vào manh mối (không biến thành spreadsheet editor).
  - Phân tách ngữ nghĩa Manh mối (`RecordFindingPanel`): Phân biệt rõ **FACT (Sự kiện thực tế)** và **INTERPRETATION (Suy đoán/Nhận định)**.
  - Tự động đồng bộ hóa Manh mối sang Ghi chép (`Note`): Lưu trữ tham chiếu Case/Chapter/Step/Source mà không lưu trữ tràn lan 500 dòng thô.
  - Không phán xét đúng/sai tức thì (No immediate correctness): Không cộng XP, không phán xét đúng/sai, giữ trọn vẹn tâm thế điều tra viên.
- [x] **Cơ chế nạp dữ liệu 1-click từ Bằng chứng vào Bảng tính & Chuyển đổi linh hoạt**:
  - Bấm nút *"Nạp vào Bàn Điều Tra"* trên thẻ chứng cứ để đẩy toàn bộ hàng/cột vào lưới làm việc.
  - Hỗ trợ chuyển đổi mượt mà giữa Hồ Sơ Chứng Cứ, Bàn Phân Tích (Excel Workbench) và Bàn Xử Lý Dữ Liệu (Data Processing).
- [x] **Step-level Data Source Enforcement tại tầng SQL execution level**:
  - Chặn đứng hoàn toàn việc vượt rào Step bằng cách gõ tay câu lệnh SQL tới bảng tương lai/bị ẩn.
  - Mã lỗi chuẩn hóa `SQL_TABLE_UNAVAILABLE` kèm thông báo UI thân thiện.
  - Test hồi quy chuyên biệt: *"hidden dataset cannot be queried manually even when the player knows its table name"*.
- [ ] **Kiến trúc Nội dung Vụ án / Chương / Bước (Case / Chapter / Step Content Architecture)**:
  - Chuẩn hóa schema dữ liệu cho các Step điều tra theo Case 001 ("Đường dây buôn lậu cà phê").
  - Đóng kín chu trình: Đọc hồ sơ ➔ Nạp chứng cứ / truy vấn dữ liệu theo Step ➔ Ghi nhận FACT/INTERPRETATION ➔ Báo cáo HQ ➔ Khép lại vụ án (*Case Closed*).

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

1. **Chuẩn hóa Thông Báo Toast Notification** (✅ ĐÃ GIẢI QUYẾT):
   - Đã xây dựng component `ToastProvider` & hook `useToast` màu Hổ phách chuẩn HQ tại [`src/components/ui/Toast.jsx`](file:///d:/Coding_Design/Personal/Avi-Mystery/src/components/ui/Toast.jsx) với đầy đủ các mức độ `success`, `error`, `warning`, `info`, `hq`. Tự động tan biến sau 3.5 giây kèm animation mượt mà.
2. **Xuất Chứng Chỉ dạng File Ảnh PNG** (✅ ĐÃ GIẢI QUYẾT):
   - Đã tích hợp nút *"Tải ảnh PNG"* trực tiếp vào [`AcademyCertificateModal.jsx`](file:///d:/Coding_Design/Personal/Avi-Mystery/src/components/academy/AcademyCertificateModal.jsx). Sử dụng HTML5 Canvas render ảnh chứng nhận độ phân giải cao (1200x800) mang phong cách cổ điển HQ, không phụ thuộc thư viện ngoài, tải về máy tức thì.
3. **Cấu Hình Linter ESLint v9 Flat Config** (✅ ĐÃ GIẢI QUYẾT):
   - Đã bổ sung [`eslint.config.js`](file:///d:/Coding_Design/Personal/Avi-Mystery/eslint.config.js) tương thích hoàn toàn với ESLint v9 và chuẩn hóa các biểu thức regex trong `sqlQueryPolicy.js`.
4. **Phân Trang & Đánh Index Firestore** (🟡 Tối ưu theo lộ trình):
   - Một số truy vấn lịch sử hoạt động tải toàn bộ danh sách. Bổ sung phân trang theo con trỏ (cursor-based pagination) khi lượng hoạt động thực tế vượt quá 100 dòng.
5. **Chuẩn hóa Format Dữ liệu Kiểm Định (Canonical Verification Schema)** (🟡 Giai đoạn đóng kín Case 001):
   - So khớp đáp án đang kết hợp `exact`, `case_insensitive`, `numeric_exact` và `numeric_tolerance`. Sẽ được đồng bộ hóa triệt để khi hoàn thiện Schema Case Content.

