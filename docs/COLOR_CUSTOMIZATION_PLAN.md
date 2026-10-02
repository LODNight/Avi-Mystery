# 🎨 Kế Hoạch & Brainstorm Tuỳ Chỉnh Màu Sắc Giao Diện (Color System Plan)
> **Dự án**: Avi-Mystery (Nền tảng Học tập & Điều tra Dữ liệu)  
> **Tài liệu**: Kế hoạch kiến trúc hệ thống màu sắc cá nhân hoá  
> **Trạng thái**: Đề xuất thiết kế & Lộ trình thực thi (Phase 1)

---

## 1. Mục Tiêu & Triết Lý Thiết Kế (Design Philosophy)

Mục tiêu của hệ thống tuỳ chỉnh màu không chỉ đơn thuần là đổi một mã HEX, mà là **trao quyền cá nhân hoá nhân dạng điều tra viên** cho từng học viên, đồng thời bảo đảm các nguyên tắc vàng:

1. **Thẩm mỹ cao cấp & Hài hoà (Anti-Slop UI)**: Tránh các màu chói gắt làm nhức mắt hoặc phá vỡ cấu trúc giao diện; bảo đảm mọi tông màu khi áp dụng vào Sidebar, Button, Badge đều tự nhiên và sang trọng.
2. **Đảm bảo khả năng đọc & Khả năng tiếp cận (Accessibility - WCAG AA/AAA)**: Khi người dùng chọn màu quá sáng (vàng chanh, xanh nõn chuối) hoặc quá tối, hệ thống phải **tự động tính toán độ tương phản** của màu chữ (`--primary-foreground`) để văn bản luôn sắc nét 100%.
3. **Phù hợp không khí trinh thám (Detective Persona)**: Các preset màu được thiết kế gắn liền với các phong cách điều tra khác nhau (Cổ điển Noir, Điều tra số Cyber, Phòng pháp y Forensic, v.v.).
4. **Hiệu năng tức thì & Đồng bộ đa thiết bị**: Áp dụng ngay lập tức thông qua biến CSS `:root` (không giật lag / không re-render toàn app), lưu `localStorage` và đồng bộ vào Profile Firebase.

---

## 2. Brainstorm Các Bộ Màu Chủ Đề (Detective Persona Presets)

Thay vì chỉ đặt tên màu phổ thông (Vàng, Xanh, Đỏ), chúng ta xây dựng các **Preset mang phong cách Thám tử** vừa chuyên nghiệp vừa tạo cảm xúc nhập vai:

| Persona / Chủ đề | Mã HEX | Cảm hứng & Ngữ cảnh sử dụng | Tông màu hiển thị |
| :--- | :---: | :--- | :---: |
| 🕵️ **Amber Noir (Mặc định)** | `#D97706` / `#F59E0B` | Đèn bàn trinh thám cổ điển, hồ sơ giấy da, cảm giác ấm cúng & tập trung | Amber Gold |
| 💻 **Cyber Forensics** | `#6366F1` / `#4F46E5` | Chuyên gia điều tra số, trích xuất dữ liệu số, màn hình terminal hiện đại | Deep Indigo |
| 🔬 **Emerald Evidence** | `#059669` / `#10B981` | Phòng giám định pháp y, tài liệu mật đã xác minh, cảm giác chính xác | Emerald Green |
| 🎯 **Crimson Dossier** | `#E11D48` / `#F43F5E` | Hồ sơ tuyệt mật mức độ Đỏ, vụ án khẩn cấp, cảnh báo nghi can | Rose Crimson |
| 🌐 **Cyan Protocol** | `#0891B2` / `#06B6D4` | Mạng lưới tình báo, phân tích dữ liệu viễn thông, radar quét | Electric Cyan |
| 🕶️ **Shadow Amethyst** | `#9333EA` / `#A855F7` | Điệp viên ngầm tác chiến ban đêm, bí ẩn, phong cách tối giản huyền bí | Royal Purple |
| 📋 **Monochrome Agent** | `#52525B` / `#3F3F46` | Phong cách tối giản tuyệt đối (Minimalist Slate), tập trung 100% vào dữ liệu | Slate Gray |

---

## 3. Kiến Trúc Kỹ Thuật (Color Engine Architecture)

### 3.1. Cơ Chế Thích Ứng Độ Tương Phản Tự Động (Luminance & Contrast Engine)
Khi người dùng nhập một mã HEX bất kỳ (ví dụ `#FACC15` - màu vàng rất sáng), nếu chữ hiển thị trên nút bấm vẫn giữ màu trắng (`#FFFFFF`) thì người dùng sẽ **hoàn toàn không đọc được**.

* **Giải pháp thuật toán**:
  Tính toán độ sáng tương đối (Relative Luminance theo công thức WCAG):
  $$L = 0.2126 \times R + 0.7152 \times G + 0.0722 \times B$$
  * Nếu $L > 0.55$ (Màu sáng): Tự động set `--primary-foreground: #0f172a` (Chữ đen/navy đậm).
  * Nếu $L \le 0.55$ (Màu tối/trung bình): Tự động set `--primary-foreground: #ffffff` (Chữ trắng tinh).
* **Hiển thị Badge kiểm tra**: Trên giao diện cài đặt có một nhãn nhỏ: `Độ tương phản đạt chuẩn WCAG AA (4.5:1) ✓` giúp người dùng an tâm.

### 3.2. Hệ Thống Biến CSS Tự Động Cập Nhật
Khi người dùng chọn màu, `ThemeProvider` sẽ cập nhật trực tiếp vào style của thẻ `:root`:
```css
:root {
  --primary: #f59e0b;               /* Màu chính do người dùng chọn */
  --primary-foreground: #ffffff;    /* Tự động tính toán (Trắng hoặc Đen) */
  --ring: #f59e0b;                  /* Hiệu ứng viền focus */
  --sidebar-primary: #f59e0b;       /* Nhấn trên thanh Sidebar */
  --primary-hover: #d97706;         /* Tự động làm tối 10% khi hover */
}
```

### 3.3. Các Tầng Tuỳ Chỉnh (Phân cấp tính năng)
Chúng ta sẽ chia trải nghiệm tuỳ chỉnh làm **3 cấp độ**:

* **Cấp độ 1: Màu Nhấn Chủ Đạo (Primary Accent)** - Đang triển khai:
  * Chọn màu nhanh từ Preset Thám tử
  * Thanh trượt & Nhập mã HEX tự do
  * Thẻ xem trước tương tác Nút/Badge
* **Cấp độ 2: Tông Nền & Độ Tương Phản Neutral**:
  * Tông nền ấm Stone / Warm Paper
  * Tông nền lạnh Zinc / Cyber Slate
  * Chế độ tối sâu OLED Pure Black
* **Cấp độ 3: Màu Dữ Liệu Chuyên Sâu (Data / SQL)**:
  * Màu cú pháp SQL Syntax Highlight
  * Màu thẻ manh mối bằng chứng (Evidence Cards)

---

## 4. Trải Nghiệm Giao Diện Người Dùng (UI/UX Mockup Specs)

Khu vực **Giao diện: Màu sắc** trên màn hình chính sẽ gồm 4 khối trực quan:

1. **Khối 1: Chế độ hiển thị (Display Mode)**:
   * Hai card chuyển đổi lớn: **Sáng (Light)** và **Tối (Dark)** với icon mặt trời / mặt trăng.
2. **Khối 2: Công cụ chọn màu (Color Mixer & HEX)**:
   * Ô nhập dạng font monospace, tự động thêm dấu `#`, tự động viết hoa (ví dụ `#F59E0B`).
   * Color picker trực quan cho phép click mở bảng chọn màu tự do.
   * Nút "Khôi phục mặc định" (Reset) giúp trở về màu Amber nguyên bản chỉ với 1 click.
   * Thước đo độ tương phản: Hiển thị điểm số tương phản thực tế giữa màu nền nút và màu chữ.
3. **Khối 3: Bộ sưu tập bảng màu thám tử (Detective Palettes)**:
   * 7 bộ màu đại diện cho 7 nhân dạng điều tra viên.
   * Hiệu ứng hover scale mượt mà, viền active ring tinh tế.
4. **Khối 4: Thao trường xem trước tương tác (Live Interactive Playground)**:
   * Mô phỏng nút bấm chính (Primary Button), nút viền mảnh (Outline), thẻ huy hiệu (Badge) và mini thẻ manh mối (Evidence Card).

---

## 5. Lộ Trình Triển Khai (Roadmap)

### 📌 Bước 1: Hoàn thiện Engine Màu Sắc & Độ Tương Phản *(ĐÃ HOÀN THÀNH 100%)*
- [x] Tạo module tính toán màu độc lập `src/utils/colorEngine.js` với thuật toán Relative Luminance & Contrast Ratio theo chuẩn WCAG 2.1.
- [x] Bổ sung hàm tính độ tương phản `analyzeContrast(hexColor)` và `getContrastForeground(hexColor)` trong `ThemeProvider.jsx`.
- [x] Cập nhật các biến CSS động: `--primary`, `--primary-hover`, `--primary-glow`, `--primary-foreground`, `--sidebar-primary`, `--ring`.
- [x] Mở rộng bảng màu Preset thám tử (7 preset Detective Persona với tên gọi, tagline, và mô tả chi tiết).
- [x] Nâng cấp Thao trường xem trước (Live Interactive Playground) trong `SettingsPage.jsx` với Nút Primary, Nút Outline, Badge Nổi Bật, Thước đo tương phản trực tiếp, và Thẻ Hồ Sơ Vật Chứng Mini (Mini Evidence Card) có hiệu ứng viền phát sáng.
- [x] Xử lý toàn diện lỗi kỹ thuật: Nhập mã HEX an toàn không vỡ layout, fallback theme light/dark, bổ sung biến hover/glow mặc định trong `index.css`, chuẩn hóa 100% các trang Admin và Learner sang CSS token.
- [x] Viết bộ kiểm thử unit test `src/utils/colorEngine.test.js` (11/11 tests PASS); toàn dự án đạt 81/81 test suites (632/632 tests PASS 100%) và đóng gói `vite build` thành công xuất sắc.

### 📌 Bước 2: Lưu trữ & Đồng bộ Firebase
- [ ] Lưu cấu hình màu vào `localStorage` key `avi_custom_theme`.
- [ ] Khi đăng nhập, nếu người dùng đã lưu màu trên Firestore User Profile, đồng bộ tự động xuống máy khách.

### 📌 Bước 3: Áp dụng màu Accent cho Không gian Điều tra (Investigation Workspace)
- [ ] Đổi màu highlight cho các từ khoá SQL (SELECT, FROM, WHERE...) theo tone màu người dùng đã chọn.
- [ ] Đổi màu viền phát sáng khi phát hiện manh mối hợp lệ (Valid Evidence).
