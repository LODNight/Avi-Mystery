# 🕵️‍♂️ Avi-Mystery — Chiến Lược Sản Phẩm & Định Hướng Trải Nghiệm
## (Product Strategy, Pivot Rationale & Master Roadmap)

> **Mục đích tài liệu:** Xác định rõ bản chất sản phẩm, nguyên tắc thiết kế trải nghiệm người học (Learner UX Principles), lý do chuyển dịch (Pivot Rationale) và lộ trình phát triển dài hạn của Avi-Mystery.

---

## 1. 🎯 Tuyên Ngôn Định Vị Sản Phẩm (Product Identity)

Avi-Mystery **không phải** là một nền tảng LMS làm bài tập hay trang giải đố cú pháp dạng LeetCode thông thường.

> **Bản chất cốt lõi của Avi-Mystery:**
> **"Một nền tảng game hóa nơi người học nhập vai Thám tử Điều tra Dữ liệu (Data Detective), khám phá và giải quyết các đại án thực tế bằng cách truy vết bằng chứng qua dữ liệu."**

### Chuyển Dịch Tư Duy: Công Cụ vs. Mục Đích

* **Trong mô hình LMS truyền thống:**
  - Mục đích: Học thuộc công thức Excel (ví dụ `=SUMIF`, `=VLOOKUP`) hoặc cú pháp SQL (ví dụ `GROUP BY`, `HAVING`).
  - Trải nghiệm: Đọc đề $\to$ Nhập đúng ô $\to$ Chấm đúng/sai $\to$ Sang bài mới. Người học nhanh chóng cảm thấy máy móc, nhàm chán và thiếu ứng dụng thực tiễn.
* **Trong mô hình Avi-Mystery (Mới):**
  - **Mục đích:** Phá một vụ án kinh tế/hình sự thực tế (gian lận thương mại điện tử, biển thủ ngân sách, buôn lậu, thao túng tồn kho...).
  - **Vai trò của Excel & SQL:** Đóng vai trò là **vũ khí / công cụ điều tra (Investigative Tools)**, không phải đích đến cuối cùng.
  - **Trải nghiệm:** Bối cảnh vụ án $\to$ Nguồn chứng cứ $\to$ Phân tích & Truy vết $\to$ Phát hiện bất thường (Findings) $\to$ Báo cáo Trụ sở (HQ) $\to$ Mở khóa tình tiết mới $\to$ Đóng án (Final Verdict).

```text
       [ CÁCH TIẾP CẬN CŨ: LMS TRUYỀN THỐNG ]
       Đề bài → Gõ công thức vào ô → Chấm điểm → Next bài
                                  ↓
       [ CÁCH TIẾP CẬN MỚI: ĐIỀU TRA DỮ LIỆU TỰ NHIÊN ]
       Bối cảnh vụ án (Case Dossier)
             ↓
       Nguồn chứng cứ (Bảng tính, Chứng từ, Lời khai)
             ↓
       Phân tích & Truy vết (Dùng Excel / SQL / Logic)
             ↓
       Phát hiện bất thường (Evidence Findings)
             ↓
       Báo cáo Trụ sở (Investigation Report to HQ)
             ↓
       Phản hồi nghiệp vụ & Mở khóa giai đoạn mới
             ↓
       Phán quyết cuối cùng (Final Verdict)
```

---

## 2. 💡 Nguyên Tắc Thiết Kế Trải Nghiệm (Learner UX Principles)

### 2.1. Phân Biệt Tuyệt Đối Giữa Admin & Learner
- **Admin UX**: Tối ưu cho kiểm soát, cấu hình và hiển thị thông tin dày đặc.
- **Learner UX**: Tối ưu cho tiến trình, sự rõ ràng, khám phá và cảm giác nhập vai thám tử.

### 2.2. Câu Hỏi Tối Thượng Mọi Màn Hình Phải Trả Lời
Mọi màn hình dành cho học viên phải giải quyết một câu hỏi duy nhất:
> **"Bây giờ thám tử cần làm gì tiếp theo?" (What should the detective do next?)**

Giao diện phải tối thiểu hóa sự ngập ngừng và năng lượng nhận thức. Học viên không cần phải bận tâm về cấu trúc nội bộ của website hay lựa chọn phức tạp; hệ thống luôn dẫn đường tự nhiên.

### 2.3. Thứ Tự Ưu Tiên Thông Tin (Information Hierarchy)
1. **P0 — Tôi đang làm gì?** (Tiêu đề vụ án & hành động ngay trước mắt).
2. **P1 — Tại sao tôi phải làm điều đó?** (Bối cảnh vụ án, tổn thất nghi vấn).
3. **P2 — Mục tiêu cụ thể là gì?** (Số liệu cần tìm, đối tượng cần khoanh vùng).
4. **P3 — Tôi dùng công cụ gì để làm?** (Bảng tính Excel, truy vấn SQL).
5. **P4 — Đánh giá & phần thưởng ra sao?** (Phản hồi nghiệp vụ từ HQ, danh hiệu).
6. **P5 — Thông số kỹ thuật phụ** (Thời lượng ước tính, tag phân loại — hạ cấp xuống cuối).

---

## 3. 🧩 Kiến Trúc 4 Miền Trạng Thái (4 State Domains)

Để không gian làm việc thám tử không bị phụ thuộc cứng vào bất kỳ công cụ kỹ thuật nào:

1. **Case State:** Quản lý bối cảnh vụ án, tiến trình các giai đoạn (Phase 1, Phase 2...), danh sách đối tượng và trạng thái mở khóa.
2. **Investigation State:** Quản lý các nguồn dữ liệu đang mở (bảng số liệu, chứng từ, lời khai), sổ tay thực địa (Field Notes) và manh mối đã ghim (Pinned Clues).
3. **Report State:** Quản lý bản nháp báo cáo điều tra gửi Trụ sở chỉ huy (HQ), các trường dữ liệu điều tra viên điền vào kèm bằng chứng xác thực.
4. **UI State:** Bố cục hiển thị linh hoạt (Split-Pane, Focus Mode, Drawer), cho phép phóng to thu nhỏ công cụ theo nhu cầu người dùng.

---

## 4. 🧭 Lộ Trình Phát Triển Dài Hạn (Master Roadmap)

```text
[Sprint 11] Nền tảng Bàn Làm Việc Thám Tử & Đa Ngôn Ngữ (ĐÃ XONG 100%)
       ↓
[Sprint 12] Tích hợp Công Cụ Thực Chiến (Excel/SQL) & Khép Kín Case 001 (ĐANG LÀM)
       ↓
[Sprint 13] Mở Rộng Vụ Án (Case 002, 003) & Nạp Dataset Cá Nhân
       ↓
[Sprint 14] Âm Thanh & Bầu Không Khí Thám Tử (SFX, Máy Chữ, Nhạc Jazz)
       ↓
[Sprint 15] Bảng Ghim Manh Mối Corkboard & Tư Duy Trực Quan
       ↓
[Sprint 16] Chế Độ Phá Án Tổ Đội (Detective Agencies & Multi-player)
       ↓
[Giai đoạn sau] Backend API Server (FastAPI + PostgreSQL) & Chấm Điểm Máy Chủ
```

### Chiến Lược Phân Kỳ Hiện Tại
- **Ưu tiên số 1 (Hiện tại):** Hoàn thiện 100% vòng lặp trải nghiệm phía Client trên trình duyệt. Không gian phá án phải mượt mà, trực quan, giải quyết trọn vẹn vụ án mẫu Case #001.
- **Kế thừa & Bảo tồn:** Hệ sinh thái Học viện Academy (W3Schools Style) và Phòng thực nghiệm tự do (Sandbox) từ các sprint trước được giữ nguyên vẹn làm "Trung tâm Đào tạo & Tra cứu Phương pháp luận". Khi bế tắc, thám tử tra cứu nhanh ở Academy rồi quay lại phá án ngay.
- **Backend:** Tạm hoãn cho đến khi trải nghiệm người học phía Client đạt mức độ hoàn thiện xuất sắc.
