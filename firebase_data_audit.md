# Firebase Data Fetch Audit: LearningMapPage

**Ngày thực hiện:** 03/09/2026
**Mục tiêu:** Đánh giá tính khả thi và hiệu năng của kiến trúc hiện tại trên trang Bản đồ học tập (`/map`) nếu chuyển đổi 1-1 sang cấu trúc dữ liệu thật trên Firebase (Firestore).

> [!WARNING]
> **Tình trạng hiện tại:** Mã nguồn hiện tại đang bật `USE_MOCK = true` cho các dịch vụ Nội dung (Course, Chapter, Mission). Các adapter API thật sự (`apiCourseService`, `apiMissionService`) chưa được implement (chỉ chứa stub ném lỗi). Do đó, phân tích dưới đây dựa trên **kiến trúc gọi hàm hiện có** nếu được map 1-1 sang các câu lệnh Firestore.

---

## 1. Phân tích Flow & Dự phóng Query Firestore

Nếu thay thế mock bằng Firestore, luồng `loadMapData` hiện tại trong `LearningMapPage` sẽ sinh ra các query sau:

1. **Course Layer (1 Request):**
   - Query: `collection("courses").where("status", "==", "published").get()`

2. **Chapter Layer (Chạy song song N Khóa học):**
   - N Queries: `collection("chapters").where("courseId", "==", "<course_id>").get()`

3. **Investigation / Mission Layer (Chạy song song M Chương):**
   - M Queries: `collection("investigations").where("chapterId", "==", "<chapter_id>").get()`
   - **Vấn đề Fallback:** Nếu mảng trả về rỗng (0 kết quả), code hiện tại *fallback* gọi tiếp:
   - M Queries: `collection("missions").where("chapterId", "==", "<chapter_id>").get()`

---

## 2. Thống kê Metrics (Dựa trên Dataset hiện tại)

Dataset hiện tại có: **3 Courses, 6 Chapters, 0 Investigations, 18 Missions**.

| Tầng Dữ Liệu | Số HTTP Requests (Queries) | Số Document Reads (Firestore) |
| :--- | :--- | :--- |
| **Courses** | 1 | 3 reads |
| **Chapters** | 3 | 6 reads |
| **Investigations** | 6 | 0 reads |
| **Missions (Fallback)** | 6 | 18 reads |
| **Tổng cộng hiện tại** | **16 Requests** | **27 Reads** |

### Dự phóng mở rộng (Scale 10x)
Nếu hệ thống phát triển lên 30 Khóa học, 60 Chương, 180 Missions:
- **Số HTTP Requests bắn đi CÙNG LÚC:** `1 + 30 + 60 + 60` = **151 Requests**.
- **Số Document Reads:** `30 + 60 + 0 + 180` = **270 Reads** mỗi khi 1 user mở trang `/map`.

> [!CAUTION]
> Trình duyệt giới hạn số lượng kết nối mạng đồng thời (thường là 6 kết nối/domain). Việc dội 151 requests cùng lúc sẽ tạo ra hiện tượng nghẽn cổ chai mạng (Network Stalling), gây crash ứng dụng, và cực kỳ lãng phí quota đọc của Firestore. 

---

## 3. Các Vấn đề Kiến trúc Khác

### A. Fallback Logic gây lãng phí (The Fallback Anti-pattern)
Logic: 
```javascript
const invRes = await getInvestigationsByChapter(ch.id);
if (empty) await getMissionsByChapter(ch.id);
```
Vì hiện tại hệ thống chưa có Investigation, **mọi Chapter đều phải hứng 2 requests**. Request 1 luôn thất bại/rỗng, kéo theo Request 2. Đây là logic cực kỳ tối kỵ đối với NoSQL database vì nó x2 chi phí request (latency) và operations.

### B. Over-fetching Payload (Thừa thãi dữ liệu)
`LearningMapPage` chỉ cần **Metadata**: `id`, `title`, `objective`, `rewardXp`, `tool`, `status`.
Tuy nhiên, nếu fetch nguyên document `Mission` từ Firestore, nó sẽ kéo theo hàng loạt dữ liệu nặng không dùng tới:
- `starterContent` (Code SQL, HTML/CSS khởi tạo).
- `story`, `correctCondition`, `validation Rules`.
- `metadata` nội bộ, `hints`...

---

## 4. Đánh Giá Các Phương Án Giải Quyết

1. **Phương án A: Giữ nguyên `Promise.all` (Như hiện tại)**
   - *Ưu điểm:* Code dễ viết, chạy nhanh với Mock.
   - *Nhược điểm:* **Không thể dùng được cho Production.** Vi phạm best-practices của NoSQL, sụp đổ hoàn toàn khi scale 10x.

2. **Phương án B: Batch/Query Aggregation (Dùng "Map View Model")**
   - *Mô tả:* Chuyển đổi dữ liệu phía Backend/Admin. Tạo một collection tên là `learning_map_views`. Mỗi document trong này đại diện cho 1 Course, chứa sẵn mảng (array) các Chapter và Mission (chỉ chứa metadata).
   - *Ưu điểm:* Giảm từ 151 requests xuống còn **1 request duy nhất**. Số reads giảm từ 270 xuống còn **1 read**. Cực kỳ tiết kiệm và siêu tốc.
   - *Nhược điểm:* Đòi hỏi Admin Studio phải đồng bộ (sync) cập nhật vào `learning_map_views` mỗi khi sửa Mission/Chapter.

3. **Phương án C: Lazy Loading / Progressive Loading**
   - *Mô tả:* Chỉ fetch Course. Mặc định các Course bị khóa sẽ không fetch Chapter/Mission. Chỉ khi user bấm vào (hoặc mở rộng Phase đó ra) thì mới fetch.
   - *Ưu điểm:* Tiết kiệm read, giữ nguyên cấu trúc database chuẩn hóa.

---

## 5. Architecture Recommendation

👉 **Quyết định:** **REFACTOR (Tái cấu trúc thiết kế dữ liệu)**

**Giải thích:**
Ứng dụng Avi-Mystery đang ở giai đoạn chuẩn bị xây dựng **Admin Content Studio**. Đây là thời điểm VÀNG để thiết kế lại Database Schema trước khi chính thức cho phép Admin lưu nội dung thật lên Firestore. 

Chúng ta **BẮT BUỘC** phải kết hợp cả Phương án B và C:
1. **Loại bỏ cơ chế Fallback (Mission vs Investigation):** Admin Studio sắp tới phải chuẩn hóa toàn bộ các bài học thành một entity duy nhất (ví dụ: `Node` hoặc `Lesson`), dẹp bỏ sự phân mảnh giữa Mission cũ và Investigation mới.
2. **Denormalization (Chuẩn hóa ngược):** Lưu kèm Metadata của các bài học trực tiếp vào document của `Chapter` hoặc `Course`. Thay vì phải query 3 tầng, Client chỉ cần gọi 1 query lấy danh sách Courses, bên trong các Course document đã có sẵn dàn khung (Skeleton Tree) để vẽ lên Map.
3. Chỉ fetch nội dung nặng (`starterContent`, `rules`) khi người dùng thực sự bước vào trang học `/missions/:id`.

**Nếu giữ nguyên cấu trúc hiện tại và cắm thẳng vào Firestore, trang Bản Đồ sẽ là "Lỗ hổng" nuốt chửng tài nguyên và phá hỏng UX do quá tải request.**
