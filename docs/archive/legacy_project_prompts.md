# DataQuest — Bộ prompt xây dựng dự án

Tài liệu gồm hai prompt độc lập:

1. Prompt xây dựng riêng phần giao diện bằng React, Vite và Tailwind CSS.
2. Prompt tổng thể để phân tích, thiết kế và triển khai toàn bộ dự án theo từng sprint.

Tên `DataQuest` chỉ là tên tạm thời và có thể đổi sau.

---

# PROMPT 1 — Xây dựng giao diện DataQuest bằng Tailwind CSS

```text
Bạn là Senior UI/UX Designer kiêm Senior Frontend Developer. Hãy thiết kế và xây dựng giao diện frontend hoàn chỉnh cho một nền tảng học phân tích dữ liệu theo phong cách game hóa, tên tạm thời là “DataQuest”.

## 1. Mục tiêu sản phẩm

DataQuest giúp người mới luyện tập Excel và SQL thông qua các nhiệm vụ điều tra dữ liệu. Người học không chỉ nhập công thức hoặc câu SQL, mà phải sử dụng dữ liệu để tìm manh mối, trả lời câu hỏi và hoàn thành một tình huống kinh doanh.

Sản phẩm có hai khu vực chính:

1. Learner App dành cho người học.
2. Admin App dành cho quản trị viên tạo và quản lý nội dung học tập.

Trong giai đoạn hiện tại, chỉ xây dựng frontend với mock data. Tuy nhiên, frontend phải được tổ chức theo hướng API-ready để sau này thay mock data bằng backend API mà không phải viết lại component và giao diện.

## 2. Công nghệ bắt buộc

- React.
- Vite.
- JavaScript, chưa cần TypeScript.
- Tailwind CSS là công cụ styling chính.
- React Router cho điều hướng.
- Lucide React cho icon.
- Có thể sử dụng Recharts cho biểu đồ dashboard nếu thật sự cần.
- Vitest và React Testing Library cho test.
- Không sử dụng Bootstrap.
- Không sử dụng CSS framework khác.
- Chỉ viết CSS riêng cho những phần Tailwind khó xử lý, ví dụ code editor, spreadsheet grid hoặc scrollbar.

Nếu cần code editor, hãy tạo adapter component để có thể dùng textarea trong mock ban đầu và thay bằng Monaco Editor sau này.

## 3. Nguyên tắc kiến trúc frontend

Component không được import trực tiếp file JSON và không được tự đọc LocalStorage.

Mọi dữ liệu phải đi qua service interface:

- authService
- courseService
- missionService
- submissionService
- progressService
- datasetService
- adminCourseService
- adminMissionService

Tạo hai adapter:

- mock adapter: sử dụng JSON và LocalStorage trong MVP.
- api adapter: tạo sẵn cấu trúc nhưng chưa cần kết nối backend thật.

Ví dụ:

const services = environment.useMock
  ? mockServices
  : apiServices;

Component chỉ gọi service và không cần biết dữ liệu đến từ mock hay API.

Chuẩn hóa trạng thái bất đồng bộ cho mọi màn hình:

- loading
- success
- empty
- error
- unauthorized hoặc forbidden nếu có liên quan tới quyền

## 4. Phong cách giao diện

Phong cách mong muốn:

- Hiện đại, đơn giản, dễ sử dụng với người mới.
- Theme vàng nâu, tạo cảm giác trinh thám.
- Được chọn màu sắc giao diện sáng/tối
- Mang cảm giác học tập như đang khám phá bản đồ và hoàn thành nhiệm vụ.
- Có yếu tố game hóa nhưng không biến giao diện thành game fantasy quá rối.
- Ưu tiên cảm giác “data laboratory”, “mission control” và “investigation board”.
- Dashboard có thể hơi giống công cụ quản lý dự án hiện đại, nhưng phải thân thiện hơn DevOps dashboard.
- Không lạm dụng gradient, glassmorphism, glow hoặc animation.
- Mỗi màn hình phải có một hành động chính rõ ràng.
- Thông tin quan trọng được thể hiện bằng hierarchy, spacing và màu sắc; không dựa hoàn toàn vào border.

## 5. Design system đề xuất

Hãy thiết lập design token trong Tailwind config hoặc CSS variables để dễ đổi theme.

### Màu sắc

- Primary: Indigo hoặc Blue, dùng cho hành động chính và tiến trình.
- Secondary: Cyan hoặc Teal, dùng cho dữ liệu và kỹ năng.
- Success: Emerald.
- Warning: Amber.
- Danger: Rose hoặc Red.
- Neutral: Slate.
- Background chính: Slate 50 ở light mode.
- Sidebar: Slate 900 hoặc Navy tối.
- Card: White.

Không dùng màu sắc làm dấu hiệu duy nhất. Luôn kết hợp icon, text hoặc trạng thái.

### Typography

- Font giao diện: Inter hoặc font sans-serif dễ đọc.
- Font code và công thức: JetBrains Mono hoặc font monospace phù hợp.
- Heading ngắn gọn, rõ hierarchy.
- Không sử dụng quá nhiều cỡ chữ.

### Spacing và hình dạng

- Hệ thống spacing nhất quán theo Tailwind.
- Card bo góc vừa phải: rounded-xl.
- Button: rounded-lg.
- Border mảnh, shadow nhẹ.
- Hạn chế card lồng card quá nhiều tầng.

### Responsive

- Desktop-first cho trang làm bài vì cần bảng dữ liệu và code editor.
- Vẫn phải sử dụng được trên tablet và mobile.
- Trên mobile, sidebar chuyển thành drawer.
- Các panel trong trang làm bài chuyển thành tab hoặc accordion.
- Không ép bảng dữ liệu quá nhỏ; cho phép cuộn ngang có chỉ dẫn rõ ràng.

## 6. Navigation và layout

### Learner Layout

Sidebar gồm:

- Dashboard
- Learning Map
- Courses
- Practice
- Achievements
- Profile

Phần cuối sidebar hiển thị:

- Avatar.
- Tên người học.
- Level hiện tại.
- Nút đăng xuất.

Topbar gồm:

- Breadcrumb.
- Global search nếu cần.
- Streak.
- Tổng XP.
- Notification placeholder.
- Avatar menu.

### Admin Layout

Sidebar gồm:

- Overview
- Courses
- Chapters
- Missions
- Datasets
- Learners
- Analytics
- Settings

Hiển thị rõ người dùng đang ở Admin App. Có nút chuyển sang Learner Preview nếu có quyền.

## 7. Các màn hình Learner bắt buộc

### 7.1 Login

- Logo và giới thiệu ngắn về DataQuest.
- Email, password, remember me.
- Hiển thị validation tại field.
- Có tài khoản mock để đăng nhập nhanh với role Learner và Admin.
- Có trạng thái loading và lỗi đăng nhập.

### 7.2 Learner Dashboard

Hiển thị:

- Lời chào và nhiệm vụ nên tiếp tục.
- Level, XP hiện tại và XP cần để lên level.
- Streak.
- Tổng mission đã hoàn thành.
- Skill progress riêng cho Excel và SQL.
- Continue Learning card.
- Recent activities.
- Recommended missions.
- Thành tựu gần nhất.

Không biến dashboard thành một trang chứa quá nhiều số liệu. Ưu tiên hành động “Tiếp tục học”.

### 7.3 Learning Map

- Hiển thị các course hoặc chapter giống các khu vực trên bản đồ học tập.
- Trạng thái chapter: locked, available, in_progress, completed.
- Các mission được nối theo progression rõ ràng.
- Không cần bản đồ fantasy phức tạp; có thể dùng đường tiến trình dạng vertical journey hoặc node map responsive.
- Khi chọn mission, mở mission summary panel.

### 7.4 Course Detail

- Course overview.
- Mô tả kỹ năng sẽ đạt được.
- Tổng số chapter, mission, thời lượng dự kiến.
- Progress bar.
- Danh sách chapter dạng accordion.
- Mission card thể hiện độ khó, XP, trạng thái, thời gian dự kiến.
- Nút tiếp tục bài gần nhất.

### 7.5 Mission Introduction

- Tên nhiệm vụ.
- Câu chuyện hoặc tình huống kinh doanh.
- Mục tiêu cần tìm.
- Dataset sẽ sử dụng.
- Kiến thức cần dùng.
- XP và độ khó.
- Nút Start Mission.

### 7.6 Excel Mission Workspace

Thiết kế màn hình làm bài Excel theo ba vùng:

1. Mission panel:
   - Câu chuyện.
   - Step hiện tại.
   - Danh sách yêu cầu.
   - Progress của mission.
   - Hint.

2. Spreadsheet workspace:
   - Name box hiển thị ô đang chọn.
   - Formula bar.
   - Bảng dữ liệu có tên cột A, B, C... và số dòng.
   - Highlight ô mục tiêu.
   - Có selected cell state.
   - Chỉ mô phỏng các chức năng cần cho bài tập, không xây lại toàn bộ Excel.

3. Result panel:
   - Run Formula.
   - Submit Answer.
   - Actual result.
   - Expected format, không tiết lộ đáp án.
   - Validation message.
   - Test results.

Các hành động:

- Run: chạy thử, không tính điểm.
- Submit: gửi để chấm.
- Reset: đưa bài về starter state.
- Hint: mở từng cấp độ gợi ý.
- Next Step: chỉ bật khi step hiện tại hoàn thành.

Hỗ trợ trạng thái:

- Công thức đúng.
- Công thức sai.
- Công thức không hợp lệ.
- Đúng kết quả nhưng thiếu hàm bắt buộc.
- Dataset không tải được.
- Mission đã hoàn thành.

### 7.7 SQL Mission Workspace

Thiết kế màn hình theo ba vùng tương tự Excel:

1. Mission panel.
2. SQL editor.
3. Schema và result panel.

Phải có:

- Starter SQL.
- Nút Run Query.
- Nút Submit Answer.
- Nút Reset.
- Schema browser hiển thị table, column và type.
- Result table.
- Query error message dễ hiểu.
- Execution time mock.
- Số dòng trả về.
- Test result.
- Hint theo cấp độ.

Nếu màn hình nhỏ, Schema, Result và Test chuyển thành tab.

### 7.8 Mission Result

- Kết quả hoàn thành.
- XP nhận được.
- Perfect score hoặc số hint đã dùng.
- Số lần thử.
- Kỹ năng vừa luyện.
- Tóm tắt insight đúng.
- Nút Next Mission.
- Nút Review Solution.
- Nút Back to Map.

### 7.9 Practice Mode

- Chọn Excel hoặc SQL.
- Lọc theo topic, difficulty và completion status.
- Tìm kiếm bài tập.
- Practice card ngắn gọn.
- Không cần progression story bắt buộc.

### 7.10 Profile và Achievements

- Avatar và thông tin cơ bản.
- Level, XP, streak.
- Skill matrix Excel/SQL.
- Badge.
- Mission history.
- Các project hoặc boss mission đã hoàn thành.

## 8. Các màn hình Admin bắt buộc

### 8.1 Admin Overview

- Tổng learner hoạt động.
- Tỷ lệ hoàn thành.
- Số mission đã publish.
- Mission có tỷ lệ sai cao.
- Recent content changes.
- Quick actions: tạo course, mission, upload dataset.

### 8.2 Course Management

- Table hoặc data list của course.
- Search, filter theo type và status.
- Draft, published, archived.
- Tạo, sửa, xem trước và xóa.
- Xác nhận trước hành động nguy hiểm.
- Empty state có CTA rõ ràng.

### 8.3 Course Editor

- Thông tin course.
- Quản lý chapter.
- Sắp xếp chapter và mission.
- Không cần drag-and-drop trong bản đầu; có thể dùng nút Move Up/Down.
- Hiển thị validation trước khi publish.

### 8.4 Mission Builder

Thiết kế theo wizard hoặc các section rõ ràng:

1. Basic information.
2. Story and learning objective.
3. Tool: Excel hoặc SQL.
4. Dataset.
5. Starter content.
6. Steps.
7. Answer checker và test cases.
8. Hints.
9. Reward và unlock condition.
10. Review and publish.

Phải có Save Draft, Preview và Publish.

### 8.5 Dataset Management

- Danh sách dataset.
- Upload CSV mock.
- Data preview.
- Schema preview.
- Missing values summary.
- Mission đang sử dụng dataset.
- Không cho xóa ngay dataset đang được sử dụng.

### 8.6 Analytics

- Completion rate theo course và mission.
- Average attempts.
- Hint usage.
- Mission có tỷ lệ sai cao.
- Learner drop-off.
- Filter theo thời gian, course và tool.

## 9. Component dùng chung

Tạo component có khả năng tái sử dụng:

- AppShell
- Sidebar
- Topbar
- Breadcrumb
- PageHeader
- Button
- IconButton
- Input
- Select
- Textarea
- SearchInput
- Badge
- StatusBadge
- Card
- ModalConfirm
- Drawer
- Tabs
- Tooltip
- ProgressBar
- EmptyState
- ErrorState
- Skeleton
- Toast
- DataTable
- Pagination
- CourseCard
- MissionCard
- ChapterAccordion
- XPBar
- SkillProgress
- AchievementBadge
- MissionPanel
- HintPanel
- SpreadsheetGrid
- FormulaBar
- CodeEditorAdapter
- SchemaBrowser
- QueryResultTable
- TestResultList

Modal phải quản lý focus đúng, đóng được bằng Escape và không để người dùng tương tác với phần nền khi đang mở.

## 10. Mock data cần có

Tạo mock data đủ để kiểm tra toàn bộ giao diện:

- 2 tài khoản: admin và learner.
- 2 course: Excel Adventure và SQL Investigation.
- Mỗi course có ít nhất 3 chapter.
- Mỗi chapter có mission ở nhiều trạng thái.
- Ít nhất 3 Excel missions.
- Ít nhất 3 SQL missions.
- 2 datasets: sales và customers.
- Progress của learner.
- Submission thành công, sai và lỗi.
- Analytics data cho admin.

Không nhúng mock data trực tiếp vào component.

## 11. Test giao diện bắt buộc

Viết test cho các luồng quan trọng:

- Learner không truy cập được Admin route.
- Admin có thể mở Admin route.
- Loading, empty và error state hiển thị đúng.
- Mission bị khóa không thể bắt đầu.
- Run và Submit là hai hành động khác nhau.
- Submit đúng hiển thị mission result.
- Submit sai không cộng XP.
- Dùng hint cập nhật giao diện.
- Draft course không xuất hiện bên Learner.
- Confirm modal xuất hiện trước thao tác xóa.
- Responsive navigation hoạt động.

## 12. Accessibility

- Sử dụng semantic HTML.
- Mọi input có label.
- Keyboard navigation đầy đủ.
- Focus state rõ ràng.
- Modal và drawer quản lý focus.
- Icon-only button phải có aria-label.
- Màu sắc đạt độ tương phản hợp lý.
- Không dùng màu làm cách duy nhất để báo đúng/sai.
- Bảng dữ liệu có caption hoặc accessible name.

## 13. Cấu trúc thư mục đề xuất

src/
├── app/
│   ├── router/
│   ├── providers/
│   └── layouts/
├── assets/
├── components/
│   ├── ui/
│   ├── navigation/
│   ├── learning/
│   ├── excel/
│   ├── sql/
│   └── admin/
├── features/
│   ├── auth/
│   ├── courses/
│   ├── missions/
│   ├── submissions/
│   ├── progress/
│   ├── datasets/
│   └── admin/
├── services/
│   ├── contracts/
│   ├── mock/
│   └── api/
├── mocks/
├── hooks/
├── utils/
├── constants/
├── styles/
└── tests/

Có thể điều chỉnh nếu có lý do rõ ràng, nhưng phải giữ nguyên nguyên tắc tách UI, feature, service contract, mock adapter và API adapter.

## 14. Quy tắc triển khai

- Không triển khai tất cả màn hình trong một lần.
- Chia nhỏ theo sprint hoặc vertical slice.
- Trước khi code, hãy liệt kê page map, component map và những file sẽ tạo hoặc sửa.
- Mỗi lần chỉ triển khai scope được yêu cầu.
- Không tự ý thêm chức năng ngoài phạm vi.
- Không hard-code dữ liệu nghiệp vụ trong JSX.
- Không gọi fetch trực tiếp trong component.
- Không tạo component khổng lồ; tách khi component có nhiều trách nhiệm.
- Không tối ưu quá sớm.
- Không xây spreadsheet engine hoàn chỉnh.
- Không thực thi SQL thật trong frontend.
- Mock phải mô phỏng cả success, empty, validation error và server error.
- Giữ code dễ đọc cho developer trình độ junior.
- Thêm comment tại các đoạn business logic khó, không comment những dòng hiển nhiên.

## 15. Definition of Done cho một màn hình

Một màn hình chỉ được xem là hoàn thành khi:

- Đúng layout và design system.
- Responsive ở desktop, tablet và mobile.
- Có loading, empty và error state phù hợp.
- Sử dụng service thay vì đọc mock trực tiếp.
- Có validation.
- Có keyboard và focus state cơ bản.
- Có component test cho hành vi chính.
- Không có lỗi console nghiêm trọng.
- Dữ liệu dài hoặc bất thường không phá layout.

## 16. Yêu cầu đầu ra

Khi nhận prompt này, chưa được viết toàn bộ ứng dụng ngay lập tức. Hãy trả lời theo thứ tự:

1. Tóm tắt cách bạn hiểu sản phẩm.
2. Nêu các giả định cần thiết.
3. Đề xuất sitemap cho Learner và Admin.
4. Đề xuất design system ngắn gọn.
5. Đề xuất component architecture và service architecture.
6. Chia kế hoạch frontend thành các sprint nhỏ.
7. Chỉ ra scope của sprint đầu tiên.
8. Liệt kê file dự kiến tạo hoặc sửa trong sprint đầu tiên.
9. Chờ xác nhận trước khi bắt đầu triển khai nếu có quyết định ảnh hưởng lớn tới kiến trúc.

Sprint frontend đầu tiên nên tạo App Shell, routing, mock authentication, role guard, service contracts, mock adapters và các trạng thái loading/error cơ bản. Không triển khai Excel Workspace hoặc SQL Workspace trước khi nền tảng này ổn định.
```

---

# PROMPT 2 — Prompt tổng thể xây dựng dự án DataQuest

```text
Bạn là Product Architect, Business Analyst, Senior Full-stack Developer và QA Lead. Nhiệm vụ của bạn là cùng tôi phân tích, thiết kế và xây dựng từng bước một nền tảng học phân tích dữ liệu theo phong cách game hóa, tên tạm thời là “DataQuest”.

Không xây toàn bộ dự án trong một lần. Hãy phát triển theo từng sprint nhỏ, có mock, test case, acceptance criteria và Definition of Done rõ ràng. Chỉ chuyển sang sprint tiếp theo khi sprint hiện tại đã được kiểm tra và chấp nhận.

## 1. Bối cảnh và mục tiêu

DataQuest giúp người mới học phân tích dữ liệu bằng cách hoàn thành những nhiệm vụ điều tra dữ liệu gần với tình huống thực tế.

Ví dụ:

- Vì sao doanh thu tháng này giảm?
- Chi nhánh nào đang hoạt động kém?
- Sản phẩm nào bán nhiều nhưng lợi nhuận thấp?
- Đơn hàng nào có dữ liệu sai?
- Nhóm khách hàng nào có khả năng rời bỏ dịch vụ?

Người học phải sử dụng công thức Excel hoặc câu lệnh SQL để tìm kết quả, thu thập manh mối và đưa ra kết luận cuối cùng.

Ba kỹ năng cốt lõi:

1. Sử dụng công cụ: Excel và SQL.
2. Hiểu và phân tích dữ liệu.
3. Trình bày insight và đề xuất hành động.

## 2. Phạm vi ưu tiên

Giai đoạn đầu chỉ tập trung:

- Excel Formula.
- SQL Query.
- Learning progression.
- Submission và answer checking.
- Game progress cơ bản.
- Admin quản lý nội dung.
- Mock data và automated tests.

Chưa triển khai trong MVP:

- Python và Pandas.
- AI tự sinh hoặc tự chấm bài.
- Multiplayer.
- Marketplace.
- Chat realtime.
- Bảng xếp hạng cạnh tranh toàn hệ thống.
- Spreadsheet engine đầy đủ như Microsoft Excel.
- Chạy SQL trực tiếp trên database sản xuất.

Kiến trúc phải cho phép bổ sung Python/Pandas sau này dưới dạng learning tool mới, nhưng không xây trước.

## 3. Nhóm người dùng và quyền

### Super Admin

- Quản lý Content Admin.
- Quản lý cấu hình hệ thống.
- Có toàn bộ quyền của Content Admin.

### Content Admin

- CRUD course, chapter, mission và step.
- Upload và quản lý dataset.
- Cấu hình starter content, đáp án và test case.
- Preview bài học.
- Publish hoặc unpublish nội dung.
- Xem learning analytics.

### Learner

- Xem course và learning map.
- Làm Excel/SQL mission.
- Run thử và Submit đáp án.
- Sử dụng hint.
- Nhận XP, level và achievement.
- Theo dõi lịch sử và tiến trình.

Áp dụng RBAC ở cả frontend và backend. Ẩn menu không được xem chưa đủ; backend vẫn phải kiểm tra quyền.

## 4. Core learning loop

Luồng học chính:

1. Chọn course.
2. Mở chapter.
3. Nhận mission và đọc bối cảnh.
4. Xem dataset hoặc schema.
5. Hoàn thành từng step bằng Excel Formula hoặc SQL Query.
6. Run để kiểm tra thử.
7. Submit để chấm chính thức.
8. Nhận feedback, XP và insight.
9. Mở khóa mission tiếp theo.

Phân biệt rõ:

- Run: chạy thử, không cộng XP và không đánh dấu hoàn thành.
- Submit: chấm chính thức, lưu attempt và có thể cập nhật progress.
- Reset: phục hồi starter state.
- Hint: mở gợi ý theo cấp độ và có thể làm giảm bonus.

Không dùng cơ chế mất mạng khi trả lời sai. Khuyến khích thử nghiệm và cho feedback dễ hiểu.

## 5. Cấu trúc nội dung

Course
└── Chapter
    └── Mission
        └── Step

### Course

- id
- slug
- title
- description
- tool: excel hoặc sql
- difficulty
- thumbnail
- estimatedDuration
- status: draft, published, archived
- version
- createdAt
- updatedAt

### Chapter

- id
- courseId
- title
- description
- orderIndex
- unlockRule
- status

### Mission

- id
- chapterId
- title
- story
- objective
- tool
- difficulty
- estimatedDuration
- datasetId
- starterContent
- rewardXp
- orderIndex
- status
- version

### Step

- id
- missionId
- title
- instruction
- answerType
- targetCell, nếu là Excel
- starterContent
- orderIndex
- checkerConfig

### Hint

- id
- stepId
- level
- content
- xpPenalty hoặc bonusPenalty

### Dataset

- id
- name
- description
- storageKey
- schema
- previewRows
- version
- status
- createdBy
- createdAt

### Submission Attempt

- id
- userId
- missionId
- stepId
- mode: run hoặc submit
- answer
- normalizedAnswer
- resultSummary
- isCorrect
- score
- hintsUsed
- executionTime
- createdAt

### User Progress

- userId
- courseId
- chapterId
- missionId
- status: locked, available, in_progress, completed
- bestScore
- attemptCount
- earnedXp
- completedAt

## 6. Nội dung học Excel

Ưu tiên theo thứ tự:

### Level 1

- Toán tử số học.
- Tham chiếu ô.
- SUM.
- AVERAGE.
- MIN.
- MAX.

### Level 2

- IF.
- AND.
- OR.
- COUNTIF.
- SUMIF.

### Level 3

- COUNTIFS.
- SUMIFS.
- IFERROR.
- VLOOKUP hoặc XLOOKUP.

### Level 4

- LEFT, RIGHT, MID.
- TRIM.
- CONCAT hoặc TEXTJOIN.
- DATE, YEAR, MONTH, DAY.

### Level 5

- Nhiệm vụ phân tích tổng hợp.
- Làm sạch dữ liệu cơ bản.
- Chọn đúng công thức theo yêu cầu kinh doanh.

Trong MVP, chỉ cần engine hoặc checker hỗ trợ nhóm hàm được sử dụng trong nội dung đã publish. Không cố gắng tương thích toàn bộ Excel.

## 7. Nội dung học SQL

Ưu tiên theo thứ tự:

### Level 1

- SELECT.
- Alias.
- DISTINCT.

### Level 2

- WHERE.
- LIKE.
- IN.
- BETWEEN.
- IS NULL.

### Level 3

- ORDER BY.
- LIMIT.

### Level 4

- COUNT.
- SUM.
- AVG.
- MIN và MAX.
- GROUP BY.
- HAVING.

### Level 5

- INNER JOIN.
- LEFT JOIN.
- Quan hệ giữa nhiều bảng.

### Level 6

- CASE WHEN.
- Subquery.
- CTE cơ bản.

### Level 7

- Phân tích tình huống kinh doanh.
- Kết hợp nhiều kỹ năng.
- Viết insight từ result set.

## 8. Kiến trúc chuyển từ mock sang API

Đây là yêu cầu quan trọng nhất.

Frontend không được đọc JSON hoặc LocalStorage trực tiếp trong component. Mọi dữ liệu đi qua service contracts.

Ví dụ:

- authService
- courseService
- missionService
- submissionService
- progressService
- datasetService
- adminService

Mỗi service có:

- Mock adapter dùng trong MVP frontend.
- API adapter dùng khi backend đã sẵn sàng.

Frontend component không thay đổi khi chuyển adapter.

Luồng:

UI → Service Contract → Mock Adapter hoặc API Adapter → Data Source

Mock response phải có cấu trúc gần giống API response tương lai, bao gồm cả:

- data
- metadata nếu cần
- error code
- user-friendly message
- field errors

Không để mock luôn trả success. Phải mô phỏng success, empty, invalid input, forbidden, not found, conflict và server error.

## 9. Công nghệ đề xuất

### Frontend

- React.
- Vite.
- JavaScript.
- Tailwind CSS.
- React Router.
- Lucide React.
- Vitest.
- React Testing Library.

### Backend khi bắt đầu API phase

- Python.
- FastAPI.
- SQLAlchemy.
- Alembic.
- Pydantic.
- Pytest.
- JWT hoặc session-based authentication phù hợp.

### Database

- SQLite có thể dùng cho local development và SQL practice sandbox.
- PostgreSQL dùng cho application database khi triển khai thật.
- Database của hệ thống và database dùng để luyện SQL phải tách biệt hoàn toàn.

### Ghi chú

- Không bắt buộc triển khai backend ở những sprint đầu.
- Nếu chọn công nghệ khác, phải giải thích lợi ích, trade-off và ảnh hưởng tới việc migration từ mock sang API.
- Không tự ý đổi stack nếu chưa được xác nhận.

## 10. Excel answer checking

Không chỉ so sánh chuỗi công thức vì nhiều công thức khác nhau có thể cho cùng một kết quả.

Checker cần hỗ trợ các chế độ:

### exact_formula

Dùng khi bài yêu cầu một cú pháp cụ thể.

### result_only

Chấp nhận mọi công thức hợp lệ trả về kết quả đúng.

### formula_and_result

Kết quả phải đúng và phải sử dụng hàm bắt buộc.

Checker config ví dụ:

{
  "checkType": "formula_and_result",
  "requiredFunctions": ["SUMIF"],
  "forbiddenFunctions": [],
  "expectedResult": 550000,
  "tolerance": 0.001,
  "caseSensitive": false
}

Chuẩn hóa trước khi kiểm tra:

- Khoảng trắng.
- Tên hàm viết hoa hoặc thường.
- Dấu phân cách nếu hệ thống có hỗ trợ nhiều locale.
- Kiểu dữ liệu number, text, boolean, date.

Cần xử lý:

- Công thức sai cú pháp.
- Tham chiếu ô không tồn tại.
- Chia cho 0.
- Circular reference nếu phạm vi engine cho phép xuất hiện.
- Ô rỗng.
- Kết quả số thực và tolerance.
- Kết quả đúng nhưng thiếu hàm bắt buộc.

Không dùng eval JavaScript trực tiếp với input của người dùng.

## 11. SQL execution và answer checking

SQL practice phải chạy trong môi trường sandbox tách biệt với application database.

MVP chỉ cho phép read-only query:

- SELECT.
- WITH nếu an toàn.

Chặn ít nhất:

- INSERT.
- UPDATE.
- DELETE.
- DROP.
- ALTER.
- CREATE.
- ATTACH.
- DETACH.
- PRAGMA nguy hiểm.
- Multiple statements nếu chưa kiểm soát an toàn.

Không chỉ kiểm tra keyword bằng regex. Khi triển khai backend thật, cần kết hợp parser hoặc database permission read-only, transaction isolation, timeout và resource limit.

SQL checker cần hỗ trợ:

- So sánh tên cột.
- So sánh số dòng.
- So sánh giá trị.
- Tùy chọn có quan tâm thứ tự hay không.
- Tolerance cho số thực.
- Xử lý NULL.
- Required constructs, ví dụ GROUP BY.
- Forbidden constructs.

Checker config ví dụ:

{
  "checkType": "result_set",
  "expectedColumns": ["branch", "total_revenue"],
  "orderMatters": false,
  "requiredConstructs": ["GROUP_BY"],
  "forbiddenConstructs": ["UPDATE", "DELETE"],
  "numericTolerance": 0.001,
  "maxExecutionMs": 2000,
  "maxRows": 500
}

Một query khác đáp án mẫu nhưng trả về kết quả đúng vẫn có thể được chấp nhận.

## 12. Game progress

MVP chỉ cần:

- XP.
- Level.
- Mission status.
- Chapter unlock.
- Hint usage.
- Attempt count.
- Perfect score.
- Badge cơ bản.

Quy tắc quan trọng:

- Không được farm XP bằng cách submit lại một mission đã hoàn thành.
- Có thể cho phép cải thiện best score nhưng không cộng lại toàn bộ XP.
- Run không cộng XP.
- Admin Preview không cập nhật progress.
- Hint có thể giảm bonus, nhưng không ngăn người học hoàn thành.
- Mọi thay đổi XP phải có transaction hoặc cơ chế chống cập nhật lặp khi chuyển sang API.

## 13. Admin content workflow

Trạng thái nội dung:

- draft
- published
- archived

Quy trình:

1. Admin tạo course hoặc mission dạng draft.
2. Nhập nội dung và gắn dataset.
3. Cấu hình starter content.
4. Cấu hình answer checker.
5. Tạo test cases.
6. Preview như learner nhưng không lưu progress.
7. Chạy validation checklist.
8. Publish.

Không cho publish mission khi thiếu một trong các phần bắt buộc:

- Objective.
- Dataset hợp lệ.
- Ít nhất một step.
- Checker config.
- Ít nhất một positive test case.
- Ít nhất một negative test case.
- Reward XP hợp lệ.

Không xóa ngay dataset đang được mission sử dụng. Ưu tiên archive hoặc hiển thị conflict rõ ràng.

## 14. API contract dự kiến

### Auth

POST /auth/login
POST /auth/logout
GET /me

### Learner

GET /courses
GET /courses/{courseId}
GET /chapters/{chapterId}
GET /missions/{missionId}
POST /submissions/run
POST /submissions/submit
GET /me/progress
GET /me/achievements

### Admin

GET /admin/courses
POST /admin/courses
GET /admin/courses/{courseId}
PUT /admin/courses/{courseId}
DELETE hoặc PATCH /admin/courses/{courseId}

POST /admin/chapters
PUT /admin/chapters/{chapterId}

POST /admin/missions
PUT /admin/missions/{missionId}
POST /admin/missions/{missionId}/preview
POST /admin/missions/{missionId}/publish

GET /admin/datasets
POST /admin/datasets
GET /admin/datasets/{datasetId}/preview

GET /admin/analytics/overview
GET /admin/analytics/missions

Chuẩn response đề xuất:

{
  "data": {},
  "meta": {},
  "error": null
}

Chuẩn error đề xuất:

{
  "data": null,
  "error": {
    "code": "MISSION_LOCKED",
    "message": "Bạn cần hoàn thành nhiệm vụ trước đó.",
    "fieldErrors": {}
  }
}

Không trả stack trace hoặc lỗi database thô cho người dùng.

## 15. Module dự án

### Shared/Core

- M01 Authentication và RBAC.
- M02 Course Management.
- M03 Learning Progression.
- M04 Submission và Feedback.
- M05 Game Progress.
- M06 Notification/Toast trong ứng dụng.

### Excel

- M07 Excel Learning Content.
- M08 Spreadsheet Practice UI.
- M09 Excel Formula Parser/Evaluator Adapter.
- M10 Excel Answer Checker.

### SQL

- M11 SQL Learning Content.
- M12 SQL Editor và Schema Browser.
- M13 SQL Sandbox Execution.
- M14 SQL Result Checker.

### Admin

- M15 Course/Chapter Admin.
- M16 Mission Builder.
- M17 Dataset Management.
- M18 Learning Analytics.

### Infrastructure

- M19 Service Contracts và Mock Adapters.
- M20 API Adapters.
- M21 Logging và Error Handling.
- M22 Test Infrastructure.

Mỗi module cần có owner logic rõ ràng, public interface và test độc lập. Không để module Excel phụ thuộc trực tiếp module SQL.

## 16. Mock strategy

Mock data phải phục vụ kiểm tra luồng, không chỉ dùng để làm giao diện đẹp.

Cần có:

- User cho từng role.
- Course draft và published.
- Chapter locked, available, in_progress và completed.
- Mission Excel và SQL.
- Dataset sales và customers.
- Submission đúng, sai cú pháp, sai kết quả và timeout.
- Progress chưa học, đang học và hoàn thành.
- Analytics data.

Mock service cần hỗ trợ:

- Artificial delay.
- Success.
- Empty response.
- Validation error.
- Unauthorized.
- Forbidden.
- Not found.
- Conflict.
- Internal error.

Không hard-code response trong component test. Dùng fixture hoặc mock factory có thể tái sử dụng.

## 17. Test strategy

### Unit Test

- Excel formula normalization.
- Excel result comparison.
- Required function checking.
- SQL result-set comparison.
- NULL và numeric tolerance.
- XP calculation.
- Unlock rule.
- Permission checking.

### Component Test

- Formula bar.
- Spreadsheet grid.
- SQL editor adapter.
- Result table.
- Hint panel.
- Mission card.
- Publish validation.

### Integration Test

- UI gọi đúng service contract.
- Mock adapter trả dữ liệu đúng format.
- API adapter map response về domain model.
- Submit cập nhật progress đúng.
- Admin publish mission.

### End-to-End Test

Luồng Learner:

1. Đăng nhập.
2. Mở course.
3. Chọn mission khả dụng.
4. Run câu trả lời.
5. Submit.
6. Nhận XP.
7. Mission tiếp theo được mở.

Luồng Admin:

1. Đăng nhập.
2. Tạo mission draft.
3. Gắn dataset.
4. Tạo checker và test cases.
5. Preview.
6. Publish.
7. Learner nhìn thấy mission.

## 18. Test case tối thiểu

### Excel

- Công thức và kết quả đúng.
- Công thức khác nhưng cho cùng kết quả.
- Kết quả đúng nhưng thiếu hàm bắt buộc.
- Sai ô tham chiếu.
- Ô dữ liệu trống.
- Chia cho 0.
- Công thức sai cú pháp.
- Khác chữ hoa/chữ thường.
- Số thực nằm trong và ngoài tolerance.

### SQL

- Query đúng và result set đúng.
- Query khác đáp án mẫu nhưng kết quả giống nhau.
- Sai tên cột.
- Trả thiếu hoặc thừa cột.
- Sai số dòng.
- Đúng dữ liệu nhưng sai thứ tự khi orderMatters=true.
- Khác thứ tự khi orderMatters=false.
- NULL.
- Duplicate row.
- Query nguy hiểm.
- Multiple statements.
- Timeout.
- Result vượt quá maxRows.

### Progress

- Submit đúng lần đầu cộng XP.
- Submit lại không farm XP.
- Run không cộng XP.
- Hint giảm bonus đúng.
- Mission trước chưa xong thì mission sau còn khóa.
- Hoàn thành mission mở đúng mission tiếp theo.
- Admin Preview không cập nhật progress.

### Admin

- Draft không xuất hiện cho Learner.
- Không publish mission thiếu checker.
- Không publish nếu thiếu positive hoặc negative test.
- Không xóa dataset đang được sử dụng.
- Content Admin không quản lý được Super Admin.

## 19. Sprint plan

Mỗi sprint kéo dài khoảng 1–2 tuần đối với một developer. Có thể điều chỉnh thời lượng, nhưng không gộp quá nhiều vertical slice.

### Sprint 0 — Discovery và contract

Mục tiêu:

- Chốt requirement.
- Chốt user flow.
- Chốt domain model.
- Chốt API contract dự kiến.
- Chuẩn bị mock và test scenarios.

Deliverables:

- Scope và out-of-scope.
- Role-permission matrix.
- Sitemap.
- Course → Chapter → Mission → Step model.
- Service contracts.
- Mock JSON schema.
- Một dataset sales mẫu.
- Một Excel mission hoàn chỉnh.
- Một SQL mission hoàn chỉnh.
- Acceptance criteria và test cases cho hai mission.

### Sprint 1 — Frontend foundation

Mục tiêu:

- App shell.
- Routing.
- Mock auth.
- Role guard.
- Service contracts.
- Mock adapters.
- Loading, empty và error states.

Chưa làm Excel engine hoặc SQL execution.

### Sprint 2 — Course và learning map

- Course list.
- Course detail.
- Chapter progression.
- Mission summary.
- Locked/available/completed state.

### Sprint 3 — Excel vertical slice

- Một Excel mission hoàn chỉnh.
- Spreadsheet practice UI tối thiểu.
- Formula input.
- Run, Submit, Reset và Hint.
- Formula checker cho tập hàm MVP.
- Test tự động.

### Sprint 4 — SQL vertical slice

- Một SQL mission hoàn chỉnh.
- SQL editor.
- Schema browser.
- Result table.
- Read-only sandbox.
- Run, Submit, Reset và Hint.
- Result checker.
- Security tests.

### Sprint 5 — Game progress

- XP.
- Level.
- Unlock.
- Attempt count.
- Perfect score.
- Profile progress.
- Chống farm XP.

### Sprint 6 — Admin content builder

- CRUD Course, Chapter và Mission.
- Dataset management.
- Checker config.
- Test-case builder.
- Preview.
- Draft và Publish.

### Sprint 7 — Backend API

- FastAPI foundation.
- Database model và migration.
- Authentication thật.
- Learner APIs.
- Admin APIs.
- API adapters thay mock adapters.
- Integration tests.

Yêu cầu quan trọng: UI component không phải viết lại khi chuyển sang API adapter.

### Sprint 8 — Analytics và hardening

- Admin analytics.
- Audit log cần thiết.
- Performance.
- Accessibility.
- Responsive QA.
- Security hardening.
- End-to-end regression tests.

## 20. Template quản lý một sprint

Mỗi sprint phải được mô tả bằng:

- Sprint Goal.
- In Scope.
- Out of Scope.
- User Stories.
- Tasks theo module.
- Dependencies.
- Mock cần chuẩn bị.
- Acceptance Criteria.
- Test Cases.
- Risks.
- Definition of Done.
- Demo Checklist.
- Những quyết định cần xác nhận trước khi code.

Mỗi task nên đủ nhỏ để hoàn thành trong khoảng vài giờ đến tối đa hai ngày. Nếu task lớn hơn, phải chia nhỏ.

## 21. Definition of Done chung

Một feature chỉ hoàn thành khi:

- Đáp ứng acceptance criteria.
- Có validation.
- Có loading, empty và error state nếu phù hợp.
- Tuân thủ quyền truy cập.
- Không đọc mock trực tiếp trong UI component.
- Có unit test cho business logic quan trọng.
- Có integration test cho luồng chính.
- Không có lỗi console hoặc server nghiêm trọng.
- Không làm hỏng feature đã hoàn thành.
- Tài liệu module và API contract được cập nhật.
- Mock và API response giữ cùng domain shape.
- Đã chạy demo checklist.

## 22. Quy tắc làm việc với codebase

- Trước khi sửa code, đọc cấu trúc dự án và các tài liệu hiện có.
- Liệt kê file dự kiến tạo hoặc sửa.
- Không ghi đè phần code không liên quan.
- Không thay đổi kiến trúc hoặc dependency lớn mà không giải thích.
- Không tự ý làm tiếp sprint sau.
- Mỗi lần chỉ giải quyết scope hiện tại.
- Ưu tiên giải pháp đơn giản, dễ đọc và dễ test.
- Không tạo abstraction khi chưa có ít nhất một nhu cầu rõ ràng, ngoại trừ service contract cần thiết cho mock → API.
- Không để component frontend tự chứa business rule chấm bài, XP hoặc unlock.
- Không để SQL practice truy cập application database.
- Không dùng JavaScript eval cho công thức người dùng.
- Không lưu đáp án nhạy cảm trong payload gửi cho Learner ở production API.
- Không chỉ kiểm tra SQL nguy hiểm bằng regex khi sang API thật.
- Viết comment cho business rule khó hiểu, không comment dòng code hiển nhiên.

## 23. Cách phản hồi khi bắt đầu dự án

Khi nhận prompt này, chưa được bắt đầu viết toàn bộ code. Hãy trả lời theo trình tự:

1. Tóm tắt cách hiểu dự án.
2. Chỉ ra các quyết định đã rõ.
3. Liệt kê các giả định đang dùng.
4. Chỉ hỏi những câu có khả năng thay đổi lớn tới kiến trúc hoặc phạm vi.
5. Đề xuất roadmap các sprint.
6. Chi tiết hóa Sprint 0 theo template quản lý sprint.
7. Tạo backlog Sprint 0 thành các task nhỏ.
8. Đề xuất cấu trúc tài liệu và file mock cần tạo.
9. Đề xuất một Excel mission và một SQL mission làm vertical slice.
10. Đưa ra acceptance criteria cùng test case trước khi triển khai.

Sau khi Sprint 0 được xác nhận, mới bắt đầu tạo hoặc sửa file. Khi kết thúc mỗi sprint, phải báo cáo:

- Đã hoàn thành gì.
- File nào đã thay đổi.
- Test nào đã chạy và kết quả.
- Phần nào chưa hoàn thành.
- Rủi ro hoặc technical debt.
- Checklist để người dùng tự kiểm tra.
- Đề xuất scope sprint tiếp theo, nhưng không tự triển khai nếu chưa được yêu cầu.
```

---

# Cách sử dụng hai prompt

- Dùng **Prompt 1** khi muốn AI tập trung thiết kế hoặc code riêng frontend.
- Dùng **Prompt 2** khi bắt đầu một cuộc hội thoại mới để AI quản lý toàn bộ dự án từ requirement, kiến trúc, frontend, backend đến kiểm thử.
- Khi dùng Prompt 2, nên yêu cầu AI bắt đầu ở Sprint 0; không yêu cầu tạo toàn bộ ứng dụng ngay lần đầu.
- Khi chuyển sang một sprint mới, bổ sung trạng thái hiện tại của codebase, phần đã hoàn thành và những lỗi còn tồn tại.
