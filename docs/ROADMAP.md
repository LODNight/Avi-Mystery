# Lộ Trình Phát Triển Dự Án Avi-Mystery (Project Roadmap)

> **Định hướng chiến lược:** Phát triển dự án theo mô hình Vertical Slice & Iterative Sprints. Ưu tiên hoàn thiện các luồng nghiệp vụ lõi (Excel & SQL practice) trước khi tái cấu trúc Learning Domain, tích hợp Game Progress, Admin Builder và Backend API.
> Các khu vực hệ thống bao gồm: `LRN` (Learner App), `ADM` (Admin App), `SHR` (Shared Layout & System Architecture), `BE` (Backend & Mock Services), `GAME` (Gamification & Progress Domain).
>
> **Nguồn trạng thái thực thi:** [`agent/CURRENT_TASK.md`](./agent/CURRENT_TASK.md). Roadmap mô tả thứ tự chiến lược và mục tiêu; không cho phép agent tự chuyển Sprint/Step.

---

## 🏛 Khung Phân Loại Kiến Trúc (Architecture Categorization Framework)

| Nhãn Trạng Thái | Ý Nghĩa Architecture |
|---|---|
| `CURRENT` | Đã triển khai hoàn tất trong source code, đã verified qua unit & integration tests. |
| `PLANNED` | Đã chốt spec và step decomposition, sẵn sàng thực thi theo kế hoạch. |
| `PROPOSED` | Định hướng kiến trúc tương lai, đang chờ phê duyệt hoặc phụ thuộc Sprint trước. |
| `DEPRECATED` | Mô hình cũ hoặc cấu trúc tạm thời đang trong lộ trình loại bỏ. |
| `LEGACY` | Các ID/Adapter từ giai đoạn đầu (Sprint 1–2) phục vụ backward compatibility. |

---

## 🎯 Phân Định Khái Niệm Domain Lõi (Core Domain Distinctions)

1. **Learning Journey (Hành trình) vs Phase (Giai đoạn) vs Course (Khóa học) vs Learning Map (Bản đồ học tập)**:
   - `Course`: Danh mục đóng gói kiến thức theo chủ đề (ví dụ: *Excel Adventure*, *SQL Investigation*).
   - `Learning Map`: Giao diện trực quan dạng cây Node biểu diễn tiến độ di chuyển của người học qua từng giai đoạn (`Phase`) và bài tập.
   - `Learning Journey`: Tuyến đường tổng thể đưa người học từ *Level 1 (Tập sự)* đến *Mastery*.

2. **Investigation (Vụ án / Câu chuyện) vs Question (Nhiệm vụ / Câu hỏi) vs Question Variant (Biến thể)**:
   - `Investigation`: Bối cảnh cốt truyện trinh thám, hồ sơ vụ án và tư liệu ban đầu.
   - `Question`: Nhiệm vụ kỹ thuật cụ thể (viết 1 công thức Excel hoặc 1 câu lệnh SQL) thuộc một Investigation.
   - `Question Variant`: Các biến thể tham số/dữ liệu của cùng 1 Question dùng cho luyện tập lại (Replay / Practice) hoặc chống gian lận.

3. **Dataset (Bộ dữ liệu độc lập)**:
   - Bộ dữ liệu (SQL Schema / Excel Table) được quản lý độc lập, tái sử dụng cho nhiều Question/Investigation khác nhau mà không bị nhân bản file.

4. **Main Quest (Nhiệm vụ chính) vs Practice (Luyện tập tự do)**:
   - `Main Quest`: Luồng mở khóa tuyến tính trên Bản đồ Học tập, ghi nhận `Completion` và tiến trình học.
   - `Practice`: Chế độ giải bài tự do trong ngân hàng câu hỏi, hỗ trợ rèn luyện kỹ năng mà không ảnh hưởng đến cốt truyện chính.

5. **Completion (Hoàn thành) vs Mastery (Thành thạo)**:
   - `Completion`: Trạng thái Boolean (Đã đạt / Chưa đạt) xác nhận người học đã giải đúng nhiệm vụ để mở khóa nút tiếp theo.
   - `Mastery`: Chỉ số đánh giá độ sâu (Độ chính xác, thời gian giải, số gợi ý đã dùng, điểm tối ưu câu lệnh SQL).

---

## 🟢 Sprint 1 — Frontend Foundation (`CURRENT`)

* **Dominant Architectural Objective:** Thiết lập khung hạ tầng ứng dụng Frontend, hệ thống phân quyền RBAC 3 roles, giao diện Detective Amber và cơ chế kiểm thử Vitest.
* **Status:** `CURRENT` (Hoàn thành 100%).
* **Key Deliverables:** App Shell, Learner & Admin Layouts, Design System tokens, Mock Adapters (`mockAuthService`, `mockCourseService`, `mockMissionService`).

---

## 🟢 Sprint 2 — Course & Learning Map Baseline (`CURRENT`)

* **Dominant Architectural Objective:** Xây dựng luồng khám phá lộ trình học tập, danh sách khóa học, cấu trúc chương và bản đồ học tập tĩnh cho Người học.
* **Status:** `CURRENT` (Hoàn thành 100%).
* **Key Deliverables:** `CoursesPage`, `CourseDetailPage`, `LearningMapPage` (Static nodes), `MissionIntroPage`, Admin Page Status Manager.

---

## 🟢 Sprint 3 — Excel Vertical Slice (`CURRENT`)

* **Dominant Architectural Objective:** Môi trường thực hành Excel tương tác trực tiếp, chấm điểm công thức tự động, Hint drawer và Submission gateway.
* **Status:** `CURRENT` (Hoàn thành 100%).
* **Key Deliverables:** `SpreadsheetGrid`, `FormulaBar`, `HintPanel`, pure evaluator `excelChecker.js`, `mockSubmissionService`, targeted 73/73 tests, full regression 133/133 tests pass.

---

## 🟢 Sprint 4 — SQL Vertical Slice (`CURRENT`)

* **Dominant Architectural Objective:** Động cơ thực thi SQL SQLite WASM In-Memory chạy trong Web Worker cách ly, Schema Browser, SQL Editor và Security Policy Guard.
* **Status:** `CURRENT` (Hoàn thành 100%).
* **Key Deliverables:** SQLite WASM Worker (`sqlEngine.worker.js`), `sqlEngineAdapter.js`, `sqlQueryPolicy.js` (chặn 12 từ khóa đột biến & multi-statement), `SchemaBrowser`, `SqlEditor`, `ResultViewer`, pure evaluator `sqlChecker.js`, submission integration, 222+ tests pass.

---

## 🟡 Sprint 5 — Content Domain & Dataset Decoupling (`PLANNED`)

* **Dominant Architectural Objective:** Tái cấu trúc mô hình nội dung, tách biệt Investigation (Cốt truyện) và Question (Nhiệm vụ), giải phóng Dataset thành tài sản tái sử dụng độc lập, bóc tách evaluator config khỏi `mockSubmissionService`.

### 🔹 Step 5.1: Content Schema & Evaluation Config Extraction
* **Objective:** Bóc tách các cấu hình kiểm thử hardcoded (`EXCEL_CHECKER_CONFIG`, `SQL_CHECKER_CONFIG`) ra khỏi `mockSubmissionService.js` đưa vào Content Layer contract.
* **Scope:** Tạo contract truy xuất cấu hình chấm điểm theo Question/Step, refactor `mockSubmissionService.js` để đọc config động.
* **Dependencies:** Sprint 3 (Excel Checker) & Sprint 4 (SQL Checker).
* **Files/Modules Affected:** `src/services/contracts/contentService.js` [NEW], `src/services/mock/mockSubmissionService.js` [MODIFY], `src/mocks/data/` [MODIFY].
* **Acceptance Criteria:** `mockSubmissionService` không chứa bất kỳ Object hardcode `EXCEL_CHECKER_CONFIG` hay `SQL_CHECKER_CONFIG` nào; toàn bộ config được nạp qua `contentService`.
* **Tests:** `npm test -- --run src/services/mock/mockSubmissionService.test.js`
* **Rollback Consideration:** Nếu nạp config động thất bại, `contentService` trả error standard `CONTENT_CONFIG_MISSING`.
* **Explicit Non-Goals:** Không sửa UI, không mutate XP, không xây backend API, không tạo database mới.

### 🔹 Step 5.2: Investigation, Question & Variant Domain Separation
* **Objective:** Chuẩn hóa sơ đồ dữ liệu phân tách rõ `Investigation` (Truyện/Bối cảnh) và `Question` (Nhiệm vụ/Câu hỏi) kèm hỗ trợ `Question Variant`.
* **Scope:** Định nghĩa Hợp đồng dữ liệu `Investigation` và `Question`, cập nhật mock json data (`investigations.json`, `questions.json`).
* **Dependencies:** Step 5.1.
* **Files/Modules Affected:** `src/services/contracts/contentService.js`, `src/mocks/data/investigations.json` [NEW], `src/mocks/data/questions.json` [NEW].
* **Acceptance Criteria:** 1 Investigation chứa được 1 hoặc nhiều Question steps; Question có thể khai báo nhiều Variant cho bài tập rèn luyện.
* **Tests:** Unit test cho Content Service API (`getInvestigation`, `getQuestionById`).
* **Rollback Consideration:** Duy trì alias mapping backward compatibility cho `missionId` cũ.
* **Explicit Non-Goals:** Không thay đổi các component UI hiển thị, không làm vỡ các route `/missions/:missionId`.

### 🔹 Step 5.3: Dataset Domain Independence & Schema Registry
* **Objective:** Biến Dataset (Excel Workbook / SQL SQLite Schema) thành tài sản độc lập có thể gán cho nhiều Question khác nhau mà không nhân bản dữ liệu.
* **Scope:** Tạo `datasetService` contract & registry, cập nhật SQL dataset loader để nạp và cache schema an toàn.
* **Dependencies:** Step 5.2.
* **Files/Modules Affected:** `src/services/contracts/datasetService.js` [NEW], `src/services/mock/mockDatasetService.js` [NEW], `src/utils/sql/sqlDataset.js` [MODIFY].
* **Acceptance Criteria:** Một dataset có thể dùng chung cho 5+ Question SQL/Excel mà không cần nạp lại file JSON trùng lặp.
* **Tests:** Test cases kiểm tra việc khởi tạo dataset độc lập và tính chia sẻ schema.
* **Rollback Consideration:** Giữ nguyên thuộc tính `datasetId` trên mission data làm fallback.
* **Explicit Non-Goals:** Không xây giao diện Upload Dataset cho Admin, không kết nối database ngoài.

---

## ⚪ Sprint 6 — Game Progress & Progression Architecture (`PLANNED`)

* **Dominant Architectural Objective:** Xây dựng `Progress Service` lưu trữ trạng thái học tập, sổ cái XP (XP Ledger) có tính Idempotent, công thức thăng cấp `levelingEngine`, và kết nối dữ liệu tiến độ thực tế vào `LearningMapPage`.

### 🔹 Step 6.1: Leveling Engine & XP Ledger Contract
* **Objective:** Phát triển module tính toán Level (1–50) thuần túy `levelingEngine.js` và `progressService` contract xử lý trao thưởng XP idempotent.
* **Scope:** Xây dựng công thức XP, định nghĩa contract lưu trữ tiến độ học viên trong storage.
* **Dependencies:** Sprint 5 Content Domain.
* **Files/Modules Affected:** `src/utils/game/levelingEngine.js` [NEW], `src/services/contracts/progressService.js` [NEW], `src/services/mock/mockProgressService.js` [NEW].
* **Acceptance Criteria:** Tính toán chính xác Level/XP/Danh hiệu; `progressService` nhận `SubmissionResult` và ghi nhận XP không bị cộng trùng khi submit lại bài đã đúng.
* **Tests:** `levelingEngine.test.js` & `mockProgressService.test.js`.
* **Rollback Consideration:** Lỗi ghi tiến độ không làm đứt luồng hiển thị kết quả làm bài của người học.
* **Explicit Non-Goals:** Chưa tạo giao diện Profile phức tạp, chưa làm Streak counter.

### 🔹 Step 6.2: Main Quest vs Practice Progress & Mastery Tracking
* **Objective:** Phân định rõ tiến độ `Main Quest` (mở khóa tuyến tính) và `Practice` (luyện tập tự do), đồng thời tính toán chỉ số `Mastery` (Độ chính xác, gợi ý đã dùng, thời gian làm bài).
* **Scope:** Cấu trúc dữ liệu bản ghi tiến độ, logic tính toán chỉ số Mastery.
* **Dependencies:** Step 6.1.
* **Files/Modules Affected:** `src/services/mock/mockProgressService.js`, `src/utils/game/masteryCalculator.js` [NEW].
* **Acceptance Criteria:** Bài tập Practice không ghi nhận mở khóa cốt truyện chính nhưng cập nhật chỉ số Mastery cho học viên.
* **Tests:** Integration test kiểm tra sự độc lập giữa Main Quest progress và Practice score.
* **Rollback Consideration:** Mặc định mọi attempt cũ thuộc Main Quest mode.
* **Explicit Non-Goals:** Chưa can thiệp giao diện Admin analytics.

### 🔹 Step 6.3: Dynamic Learning Map Progression
* **Objective:** Thay thế dữ liệu hardcode (`isCompleted = false`) trên `LearningMapPage.jsx` bằng dữ liệu tiến độ thực tế từ `progressService` thông qua `useProgress` hook.
* **Scope:** Xây dựng `useProgress` hook và tích hợp trạng thái Locked/Unlocked/Completed cho từng Node bài học.
* **Dependencies:** Step 6.1 & Step 6.2.
* **Files/Modules Affected:** `src/hooks/useProgress.js` [NEW], `src/pages/learner/LearningMapPage.jsx` [MODIFY].
* **Acceptance Criteria:** Bản đồ học tập tự động mở khóa nút bài học kế tiếp ngay khi người học hoàn thành bài học trước đó.
* **Tests:** `LearningMapPage.test.jsx` kiểm tra render các trạng thái Node khác nhau theo mock progress state.
* **Rollback Consideration:** Phục hồi trạng thái mặc định mở khóa Chương 1 nếu không lấy được progress.
* **Explicit Non-Goals:** Không thay đổi CSS layout của Bản đồ học tập.

---

## ⚪ Sprint 7 — Learner Engagement & Practice Engine (`PROPOSED`)

* **Dominant Architectural Objective:** Phát triển các tính năng tăng cường tương tác cho Học viên (Modal Thăng Cấp, Chuỗi Streak, Ngân hàng Luyện tập & Trang Hồ sơ Cá nhân).
* **Sub-Steps (Proposed):**
  - **Step 7.1:** Level Up Modal & Animation (`GAME-UI-7.1`)
  - **Step 7.2:** Standalone Practice Workspace (`LRN-PRAC-7.2`)
  - **Step 7.3:** Learner Profile & Achievement Badges (`GAME-PROF-7.3`)

---

## ⚪ Sprint 8 — Admin Content Studio (`PROPOSED`)

* **Dominant Architectural Objective:** Xây dựng bộ công cụ Quản trị cho Admin để tự soạn thảo Investigation, Question, Dataset và xem trước trực tiếp.
* **Sub-Steps (Proposed):**
  - **Step 8.1:** Visual Investigation & Question Authoring Studio (`ADM-STUDIO-8.1`)
  - **Step 8.2:** Dataset Importer & SQLite Schema Generator (`ADM-DATA-8.2`)
  - **Step 8.3:** Admin Live Preview & Test Runner (`ADM-PREV-8.3`)

---

## ⚪ Sprint 9 — Backend API & Persistence (`PROPOSED`)

* **Dominant Architectural Objective:** Triển khai FastAPI Backend, Cơ sở dữ liệu PostgreSQL, Xác thực JWT và chuyển đổi Frontend từ Mock Adapters sang Real API Adapters.
* **Sub-Steps (Proposed):**
  - **Step 9.1:** FastAPI Application & PostgreSQL ORM Core (`BE-CORE-9.1`)
  - **Step 9.2:** Real API Gateway Adapters & JWT Security (`BE-GATEWAY-9.2`)

---

## ⚪ Sprint 10 — Production Hardening & Release (`PROPOSED`)

* **Dominant Architectural Objective:** Tối ưu hóa hiệu năng, bảo mật OWASP, Admin Analytics Dashboard và phát hành Production chính thức.
* **Sub-Steps (Proposed):**
  - **Step 10.1:** Admin Analytics & Learner Insights Dashboard (`ANL-DASH-10.1`)
  - **Step 10.2:** Bundle Optimization, Security Audit & Docker Packaging (`SYS-HARD-10.2`)
