# Avi-Mystery — Phân tích và băm nhỏ Roadmap Sprint 3.4 đến Sprint 8

> **Vai trò tài liệu:** tài liệu phân tích/reference, không phải status tracker. Trạng thái task nằm tại [`agent/CURRENT_TASK.md`](./agent/CURRENT_TASK.md). Tại ngày 22/08/2026, Sprint 3 và Step 4.0 Technical Spike/Contracts đã `DONE`; Step 4.1A chưa được kích hoạt, chưa triển khai product feature.

> **Execution mapping hiện hành:** nội dung kỹ thuật Sprint 4 bên dưới được thực thi theo chuỗi `4.0 → 4.1A → 4.1B → 4.1C → 4.2 → 4.3 → 4.4 → 4.5 → 4.6 → 4.7 → 4.8` trong `docs/ROADMAP.md`. Các heading 4.1–4.6 cũ trong tài liệu reference chỉ còn là nhóm nội dung phân tích, không phải Current Task IDs.

## 0. Checklist đổi tên dự án sang Avi-Mystery

Phân biệt hai loại tên:

- Tên hiển thị: `Avi-Mystery`.
- Tên kỹ thuật/package: nên dùng `avi-mystery`.

Các phần cần kiểm tra:

- [ ] Logo và tên trên Sidebar/Header/Login.
- [ ] `<title>` trong HTML.
- [ ] README và tài liệu Sprint.
- [ ] `package.json` nếu muốn đổi package name.
- [ ] Metadata/PWA manifest nếu có.
- [ ] Tên repository nếu thật sự cần; không bắt buộc đổi chỉ vì đổi thương hiệu.
- [ ] Tên project/domain trên Vercel nếu muốn URL mới.
- [ ] Email/template/text mock đang dùng tên cũ.
- [ ] Test snapshot hoặc assertion chứa tên cũ.
- [ ] Tìm toàn bộ chuỗi tên cũ bằng search trước khi sửa.

Không đổi mù quáng:

- Route đang được chia sẻ.
- ID của Course/Mission.
- Database key.
- LocalStorage key.
- Environment variable.

Nếu cần đổi LocalStorage key, phải có migration hoặc chấp nhận rõ rằng progress mock cũ sẽ bị reset. Việc đổi tên thương hiệu không nên làm thay đổi domain ID hoặc làm hỏng dữ liệu hiện có.

## 1. Kết luận nhanh

Roadmap hiện tại đi đúng hướng, nhưng có 7 điểm cần chỉnh trước khi tiếp tục:

1. Không cộng XP trực tiếp trong Step 3.4. Step này chỉ ghi nhận hoàn thành và trả về `potentialXp`; việc trao XP chính thức thuộc Sprint 5.
2. Không tạo hai Submission Service riêng cho Excel và SQL. Dùng một service contract chung, sau đó tách evaluator/checker theo `tool`.
3. Không nên luôn bật modal khi trả lời sai. Sai nên phản hồi inline để người học sửa nhanh; modal phù hợp hơn khi hoàn thành Step hoặc Mission.
4. Sprint 4 cần thêm Web Worker, database lifecycle, reset, query policy, timeout, giới hạn dòng và regression test.
5. Sprint 5 cần chốt domain rules, persistence và idempotency trước animation, streak và profile.
6. Sprint 6 còn thiếu Dataset Manager, Test-case Builder, Publish Validation và Content Versioning.
7. Sprint 7 không thể chỉ có hai Step. Đây là Sprint có rủi ro kỹ thuật lớn nhất và cần chia tối thiểu 7 Step.

---

## 2. Quy ước ưu tiên

| Mức | Ý nghĩa |
|---|---|
| P0 | Bắt buộc để feature hoạt động đúng và an toàn |
| P1 | Nên có trong MVP để trải nghiệm đủ tốt |
| P2 | Có thể chuyển sang phiên bản sau |

Trạng thái task:

- `TODO`
- `IN_PROGRESS`
- `BLOCKED`
- `IMPLEMENTED`
- `TESTED`
- `DONE`

Không đánh dấu `DONE` nếu mới có giao diện hoặc test chính chưa đạt.

---

# 3. Sprint 3.4 — Submission và Feedback

## Vấn đề trong checklist hiện tại

Checklist hiện tại đang gộp ba trách nhiệm:

- Gửi bài bất đồng bộ.
- Hiển thị kết quả.
- Cộng XP.

Ba phần này không nên hoàn thành cùng một task vì chúng thuộc ba lớp khác nhau:

- Submission thuộc application/service layer.
- Feedback thuộc UI layer.
- XP thuộc Progress/Game domain của Sprint 5.

## Phạm vi đề xuất

### Step 3.4A — Submission Contract `[P0]`

- [x] Chốt request contract dùng chung cho các loại nhiệm vụ.
- [x] Chốt response contract dùng chung.
- [x] Phân biệt `mode: run` và `mode: submit`.
- [x] Có `attemptId` giả lập.
- [x] Có error code ổn định.
- [x] Có `potentialXp`, nhưng chưa trao XP.
- [x] Component không biết đáp án đúng.

Request đề xuất:

```json
{
  "mode": "submit",
  "missionId": "mission_excel_001",
  "stepId": "step_excel_001",
  "tool": "excel",
  "answer": "=C2*D2",
  "hintsUsed": 0,
  "clientAttemptId": "attempt_uuid"
}
```

Response đề xuất:

```json
{
  "data": {
    "attemptId": "attempt_001",
    "isCorrect": true,
    "score": 100,
    "stepCompleted": true,
    "missionCompleted": true,
    "potentialXp": 20,
    "feedbackCode": "CORRECT_ANSWER",
    "feedback": "Công thức chính xác."
  },
  "error": null
}
```

### Step 3.4B — Mock Submission Service `[P0]`

- [x] Tạo `submissionService` contract dùng chung.
- [x] Tạo `mockSubmissionService` implement contract.
- [x] Hỗ trợ artificial delay.
- [x] Hỗ trợ success response.
- [x] Hỗ trợ incorrect response.
- [x] Hỗ trợ validation error.
- [x] Hỗ trợ server error giả lập.
- [x] Hỗ trợ timeout giả lập.
- [x] Chặn duplicate attempt trong thời gian request đang chạy.
- [x] Không đọc mock JSON trực tiếp từ component.
- [x] Không cộng XP trong service này.

Không nên tạo sau này:

```text
mockExcelSubmissionService
mockSqlSubmissionService
```

Nên dùng:

```text
submissionService
├── excelAnswerChecker
└── sqlResultChecker
```

### Step 3.4C — Feedback UI `[P0]`

- [x] Loading state khi Submit.
- [x] Disable Submit khi đang xử lý.
- [x] Inline validation cho câu trả lời rỗng.
- [x] Inline feedback khi câu trả lời sai.
- [x] Success Modal khi Step hoặc Mission hoàn thành.
- [x] Retry khi service error.
- [x] Không làm mất câu trả lời của người học khi submit sai.

Khuyến nghị UX:

| Trường hợp | Cách hiển thị |
|---|---|
| Formula rỗng | Inline validation |
| Formula sai cú pháp | Inline error gần Formula Bar |
| Kết quả sai | Inline feedback trong Result Panel |
| Service lỗi | Inline error hoặc toast có Retry |
| Hoàn thành Step | Success state nhỏ hoặc modal |
| Hoàn thành Mission | Success Modal |

Failure Modal xuất hiện sau mọi lần sai sẽ làm gián đoạn quá trình thử nghiệm. Chỉ dùng Failure Modal nếu sản phẩm có lý do UX rõ ràng.

Nếu sử dụng modal:

- [x] Dùng semantic dialog.
- [x] Quản lý focus.
- [x] Đóng được bằng Escape.
- [x] Trả focus về nút Submit sau khi đóng.
- [x] Không dùng màu làm dấu hiệu đúng/sai duy nhất.

### Step 3.4D — Attempt State và Integration Test `[P0]`

- [x] Ghi nhận attempt identity/history mock.
- [x] Giữ câu trả lời khi submit sai.
- [x] Reset chỉ phục hồi starter state.
- [x] Submit đúng trả `missionCompleted`.
- [x] Run không cập nhật completion/history.
- [x] Unmount component trong lúc request không tạo state update lỗi.
- [x] Test double click Submit.
- [x] Test Retry.
- [x] Test service error/timeout.
- [x] Regression test Sprint 1–3.3.

## XP nên xử lý thế nào ở Sprint 3.4?

Trong Sprint 3.4 chỉ hiển thị:

```text
Phần thưởng dự kiến: +20 XP
```

Không nên làm:

```javascript
currentUser.xp += 20;
```

Việc trao XP cần idempotency để một Submission không thể nhận thưởng nhiều lần. Quy tắc này thuộc Sprint 5 và sau này phải được backend xác nhận.

## Điều kiện đóng Step 3.4

- [x] Có service contract dùng chung.
- [x] Async mock hoạt động.
- [x] Đúng, sai và lỗi đều có feedback.
- [x] Không double submit.
- [x] Không cộng XP trực tiếp.
- [x] Submission targeted 31/31; formula diagnostics targeted 55/55; regression 118/118 tests pass.
- [x] Mission hoàn thành được thể hiện rõ.

---

# 4. Sprint 4 — SQL Vertical Slice

## Mục tiêu Sprint

Hoàn thành một SQL Mission theo luồng:

```text
Mission Introduction
→ Load Dataset
→ Xem Schema
→ Viết Query
→ Run Query
→ Xem Result Table
→ Submit
→ Checker
→ Feedback
```

## Step 4.0 — Technical Spike và SQL Contract `[P0]`

- [ ] Chốt SQLite WASM library.
- [ ] Kiểm tra license.
- [ ] Kiểm tra cách Vite đóng gói file `.wasm`.
- [ ] Kiểm tra deploy trên Vercel Preview.
- [ ] Chốt có dùng Web Worker.
- [ ] Chốt SQL Mission contract.
- [ ] Chốt SQL Dataset contract.
- [ ] Chốt Query Execution response.
- [ ] Chốt SQL Result Checker config.
- [ ] Tạo một SQL mission mẫu và database seed nhỏ.

Khuyến nghị hiện tại: `sql.js` phù hợp cho MVP vì chạy SQLite trong browser, database có thể nằm trong memory, hỗ trợ import/export và có Web Worker API. Không cần persistence OPFS cho từng bài tập nếu database luôn được reset từ seed. Nếu sau này cần database tồn tại lâu trên thiết bị, mới cân nhắc OPFS. Tài liệu chính thức của SQLite lưu ý OPFS integration cần chạy trong Worker context.

### SQL Mission contract cần có

- `tool: sql`
- `datasetId`
- `starterQuery`
- `expectedColumns`
- `orderMatters`
- `columnOrderMatters`
- `numericTolerance`
- `maxExecutionMs`
- `maxRows`
- `requiredConstructs`
- `forbiddenConstructs`
- `hints`

## Step 4.1 — SQL Engine Adapter và Worker `[P0]`

- [ ] Tạo `sqlEngineAdapter`.
- [ ] Khởi tạo WASM bất đồng bộ.
- [ ] Chạy engine trong Web Worker.
- [ ] Load database seed.
- [ ] Reset database theo Mission.
- [ ] Dispose database/worker đúng cách.
- [ ] Có loading state khi tải WASM.
- [ ] Có controlled error khi WASM không tải được.
- [ ] Không để query nặng block main UI thread.

Interface đề xuất:

```text
sqlEngine.initialize()
sqlEngine.loadDataset(dataset)
sqlEngine.execute(query, options)
sqlEngine.getSchema()
sqlEngine.reset()
sqlEngine.dispose()
```

### Query policy cho MVP

- [ ] Chỉ cho phép một statement mỗi lần Run.
- [ ] Chỉ chấp nhận `SELECT` và `WITH` đọc dữ liệu.
- [ ] Chặn `INSERT`, `UPDATE`, `DELETE`.
- [ ] Chặn `DROP`, `ALTER`, `CREATE` từ user query.
- [ ] Chặn `ATTACH`, `DETACH`.
- [ ] Không cho user chạy `PRAGMA`; Schema Browser dùng internal query riêng.
- [ ] Có timeout/cancel strategy.
- [ ] Có giới hạn result rows.

Lưu ý: bảo vệ phía browser chỉ phục vụ UX, không phải lớp bảo mật đáng tin cậy. Khi có XP thật, Submit phải được backend xác nhận lại ở Sprint 7.

## Step 4.2 — Schema Browser `[P0]`

- [ ] Hiển thị danh sách table.
- [ ] Expand/collapse table.
- [ ] Hiển thị column name.
- [ ] Hiển thị data type.
- [ ] Hiển thị primary key.
- [ ] Hiển thị nullable nếu có thể.
- [ ] Không hiển thị internal SQLite tables.
- [ ] Loading, empty và error state.
- [ ] Copy table/column name.
- [ ] Keyboard navigation cơ bản.

P1:

- [ ] Hiển thị foreign key relationship.
- [ ] Xem 5 dòng preview.
- [ ] Search table/column.

## Step 4.3 — SQL Code Editor `[P0]`

- [ ] Starter Query.
- [ ] Syntax highlighting.
- [ ] Line numbers.
- [ ] Tab indentation.
- [ ] Keyboard shortcut Run.
- [ ] Reset Query.
- [ ] Accessible label.
- [ ] Controlled editor state.
- [ ] Giữ query khi Run sai.

CodeMirror là lựa chọn nhẹ và có license MIT. Monaco mạnh hơn nhưng bundle lớn hơn. Với MVP, syntax highlighting là P0; schema-aware autocomplete là P1 và không nên chặn Sprint.

P1:

- [ ] Autocomplete SQL keywords.
- [ ] Autocomplete table names.
- [ ] Autocomplete columns theo schema.
- [ ] Format Query.

## Step 4.4 — Query Execution và Result Viewer `[P0]`

- [ ] Nút Run Query.
- [ ] Running state.
- [ ] Disable double run.
- [ ] Hiển thị syntax error dễ hiểu.
- [ ] Hiển thị columns và rows.
- [ ] Hiển thị `NULL` rõ ràng.
- [ ] Hiển thị execution time.
- [ ] Hiển thị total returned rows.
- [ ] Empty result state.
- [ ] Horizontal scroll.
- [ ] Client-side pagination cho result nhỏ.
- [ ] Không render hàng nghìn DOM rows cùng lúc.

P1:

- [ ] Sort UI chỉ để xem, không thay đổi raw checker result.
- [ ] Copy cell.
- [ ] Export CSV phục vụ học tập.

## Step 4.5 — SQL Result Checker và Submission `[P0]`

- [ ] Checker tách khỏi editor và result viewer.
- [ ] So sánh column names.
- [ ] Tùy chọn kiểm tra column order.
- [ ] So sánh row count.
- [ ] So sánh cell values.
- [ ] Xử lý `NULL`.
- [ ] Xử lý duplicate rows.
- [ ] Tùy chọn `orderMatters`.
- [ ] Numeric tolerance.
- [ ] Query khác đáp án mẫu nhưng kết quả đúng vẫn pass.
- [ ] Tích hợp service contract chung của Sprint 3.4.
- [ ] Không tạo một Submission Service riêng không cần thiết.

P1:

- [ ] Kiểm tra required construct như `GROUP BY`.
- [ ] Kiểm tra forbidden construct.
- [ ] Feedback theo từng dimension: cột, dòng, giá trị, thứ tự.

## Step 4.6 — SQL Security và Regression Test `[P0]`

- [ ] Test `SELECT` hợp lệ.
- [ ] Test `WITH` hợp lệ.
- [ ] Test syntax error.
- [ ] Test `DROP` bị chặn.
- [ ] Test `DELETE` bị chặn.
- [ ] Test multiple statements bị chặn.
- [ ] Test timeout/cancel.
- [ ] Test result vượt giới hạn.
- [ ] Test `NULL`.
- [ ] Test duplicate rows.
- [ ] Test order matters true/false.
- [ ] Test Worker cleanup.
- [ ] Test Vercel Preview tải được file WASM.
- [ ] Regression Excel Mission.

## Điều kiện đóng Sprint 4

- [ ] Một SQL Mission chạy xuyên suốt.
- [ ] Engine không block UI.
- [ ] Database reset được.
- [ ] Schema Browser hoạt động.
- [ ] Run và Submit khác nhau.
- [ ] Checker xử lý đúng thứ tự, NULL và duplicate.
- [ ] User query chỉ đọc.
- [ ] Test bảo mật và regression pass.

---

# 5. Sprint 5 — Game Progress System

## Vấn đề cần đào sâu

Game Progress không chỉ là animation. Đây là domain có nhiều business rule và dễ phát sinh lỗi farm XP, sai unlock hoặc streak không công bằng.

## Step 5.0 — Progress Domain và Persistence `[P0]`

- [ ] Chốt `UserProgress` schema.
- [ ] Chốt `MissionProgress` schema.
- [ ] Chốt `RewardTransaction` schema.
- [ ] Chốt trạng thái locked/available/in_progress/completed.
- [ ] Tạo `progressService` contract.
- [ ] Tạo mock persistence adapter.
- [ ] Không đọc LocalStorage trực tiếp từ component.
- [ ] Có schema version để migration mock data.

## Step 5.1 — XP và Level Engine `[P0]`

- [ ] Chốt XP reward theo Mission.
- [ ] Chốt level threshold formula.
- [ ] Tạo hàm tính Level thuần, dễ unit test.
- [ ] Mỗi Mission reward chỉ được trao một lần.
- [ ] Retry request không cộng XP lần hai.
- [ ] Có reward transaction ID.
- [ ] Re-submit có thể tăng best score nhưng không farm XP.
- [ ] Hint penalty chỉ giảm bonus, không chặn hoàn thành.
- [ ] Admin Preview không tạo reward.

Tách riêng:

- XP Engine: P0.
- Level Up Modal: P1.
- Animation phức tạp: P2.

## Step 5.2 — Unlock Engine `[P0]`

- [ ] Không hard-code “mission tiếp theo” trong component.
- [ ] Chốt prerequisite rule.
- [ ] Hỗ trợ Mission phụ thuộc một hoặc nhiều Mission.
- [ ] Chốt điểm tối thiểu để pass nếu cần.
- [ ] Tính unlock từ progress và content graph.
- [ ] URL trực tiếp vẫn bị chặn.
- [ ] Completed content không bị khóa lại khi content reorder.

## Step 5.3 — Streak `[P1]`

- [ ] Chốt timezone dùng để tính ngày.
- [ ] Chốt một ngày được tính khi nào.
- [ ] Chỉ tính khi hoàn thành hoạt động học hợp lệ.
- [ ] Không tăng streak do refresh hoặc login nhiều lần.
- [ ] Xử lý ngày bị bỏ lỡ.
- [ ] Chốt có grace day/streak freeze hay không.
- [ ] Mock client chỉ để demo; backend là source of truth ở Sprint 7.

Khuyến nghị: daily attendance reward là P2. Nó dễ bị lợi dụng và không trực tiếp chứng minh hiệu quả học tập.

## Step 5.4 — Profile `[P1]`

- [ ] Tổng XP và Level.
- [ ] Skill progress Excel/SQL.
- [ ] Course completion.
- [ ] Mission history.
- [ ] Best score và attempt count.
- [ ] Recent activity.
- [ ] Loading/empty/error state.
- [ ] Không hiển thị dữ liệu riêng tư không cần thiết.

## Step 5.5 — Achievements `[P1]`

- [ ] Achievement rule tách khỏi UI.
- [ ] Achievement ID ổn định.
- [ ] Unlock chỉ diễn ra một lần.
- [ ] Có progress cho achievement chưa hoàn thành.
- [ ] Có trạng thái locked/unlocked.
- [ ] Không phụ thuộc vào label hiển thị.

## Step 5.6 — Progress Regression Test `[P0]`

- [ ] Submit đúng lần đầu cộng XP.
- [ ] Submit lại không cộng XP.
- [ ] Run không cộng XP.
- [ ] Retry không duplicate reward.
- [ ] Hint penalty đúng.
- [ ] Unlock đúng prerequisite.
- [ ] Refresh không mất progress.
- [ ] Admin Preview không tạo progress.
- [ ] Mock data version migration hoạt động.

---

# 6. Sprint 6 — Admin Content Builder

## Step 6.0 — Admin Access và Content Lifecycle `[P0]`

- [ ] Admin route guard.
- [ ] Role permission matrix.
- [ ] Trạng thái draft/published/archived.
- [ ] Không hard delete content đã có learner progress.
- [ ] Chốt soft delete/archive policy.
- [ ] Chốt content versioning.

## Step 6.1 — Course và Chapter Manager `[P0]`

- [ ] Tạo/sửa Course.
- [ ] Publish/archive Course.
- [ ] Tạo/sửa Chapter.
- [ ] Reorder Chapter.
- [ ] Reorder Mission.
- [ ] Validation slug/title/order.
- [ ] Confirm hành động nguy hiểm.
- [ ] Empty/loading/error state.

Không nên làm drag-and-drop ngay nếu nút Move Up/Down đã đáp ứng MVP.

## Step 6.2 — Dataset Manager `[P0]`

- [ ] Tạo Dataset.
- [ ] Upload CSV hoặc nhập dữ liệu mẫu.
- [ ] Data preview.
- [ ] Schema preview.
- [ ] Khai báo data type.
- [ ] Missing-value summary.
- [ ] Dataset version.
- [ ] Xem Mission đang sử dụng Dataset.
- [ ] Không xóa Dataset đang được sử dụng.
- [ ] Clone Dataset khi muốn thay đổi lớn.

## Step 6.3 — Mission Editor `[P0]`

- [ ] Metadata, story và objective.
- [ ] Chọn tool Excel/SQL.
- [ ] Chọn Dataset.
- [ ] Starter Formula hoặc Starter Query.
- [ ] Quản lý nhiều Step.
- [ ] Editable cells cho Excel.
- [ ] Schema visibility cho SQL.
- [ ] Hint nhiều level.
- [ ] Reward XP.
- [ ] Prerequisite/unlock rule.

Không chỉ lưu “công thức đáp án”. Cần lưu checker config để chấp nhận nhiều cách giải đúng.

## Step 6.4 — Checker và Test-case Builder `[P0]`

- [ ] Chọn checker mode.
- [ ] Cấu hình expected result.
- [ ] Required/forbidden functions cho Excel.
- [ ] Order/column/tolerance cho SQL.
- [ ] Tạo positive test case.
- [ ] Tạo negative test case.
- [ ] Chạy test case trước khi Publish.
- [ ] Hiển thị test fail rõ nguyên nhân.

## Step 6.5 — Preview và Publish Validation `[P0]`

- [ ] Preview đúng giao diện Learner.
- [ ] Preview không tạo attempt/progress/XP.
- [ ] Không publish nếu thiếu Dataset.
- [ ] Không publish nếu thiếu Step.
- [ ] Không publish nếu thiếu Checker.
- [ ] Không publish nếu thiếu positive test.
- [ ] Không publish nếu thiếu negative test.
- [ ] Không publish nếu test fail.
- [ ] Published version không bị thay đổi ngầm khi sửa Draft.

## Step 6.6 — Admin Regression Test `[P0]`

- [ ] Content Admin không quản lý Super Admin.
- [ ] Learner không truy cập Admin URL.
- [ ] Draft không xuất hiện với Learner.
- [ ] Archive không phá progress cũ.
- [ ] Preview không tạo progress.
- [ ] Dataset conflict hoạt động.

---

# 7. Sprint 7 — Backend API và Integration

## Vấn đề trong checklist hiện tại

Hai Step hiện tại đang gộp:

- Server foundation.
- Database.
- Authentication.
- RBAC.
- Content API.
- Submission.
- SQL sandbox.
- Progress.
- Migration từ mock.
- Integration test.

Đây là quá nhiều rủi ro cho hai Step.

## Step 7.0 — Backend Architecture `[P0]`

- [ ] FastAPI project structure.
- [ ] Environment configuration.
- [ ] Development/test/production settings.
- [ ] Health check.
- [ ] CORS policy.
- [ ] Standard success/error response.
- [ ] Request ID.
- [ ] Logging policy.
- [ ] OpenAPI contract review.

## Step 7.1 — PostgreSQL Models và Migration `[P0]`

Models tối thiểu cần xem xét:

- Users.
- Roles/Permissions nếu không dùng enum đơn giản.
- Courses.
- Chapters.
- Missions.
- MissionSteps.
- Hints.
- Datasets.
- DatasetVersions.
- CheckerConfigs.
- Submissions/Attempts.
- UserProgress.
- RewardTransactions.
- Achievements.
- UserAchievements.
- MissionPrerequisites.
- ContentVersions hoặc publish snapshot.

Checklist:

- [ ] SQLAlchemy models.
- [ ] Foreign keys.
- [ ] Unique constraints.
- [ ] Indexes.
- [ ] Alembic initial migration.
- [ ] Seed development data.
- [ ] Migration rollback test.

## Step 7.2 — Authentication và RBAC `[P0]`

- [ ] Password hashing.
- [ ] Login/logout.
- [ ] Token/session expiration.
- [ ] Refresh/revocation strategy.
- [ ] Backend permission checks.
- [ ] Super Admin/Content Admin/Learner policies.
- [ ] Rate limit login.
- [ ] Không lưu plaintext password.
- [ ] Không hard-code secret.

“JWT và Session” không nên để mơ hồ. Hãy chốt một chiến lược cụ thể. Nếu dùng bearer JWT, cần expiration và refresh/revocation rõ ràng. JWT được ký chứ không tự mã hóa nội dung, nên không đặt dữ liệu nhạy cảm trong payload.

## Step 7.3 — Content APIs `[P0]`

- [ ] Learner Course APIs.
- [ ] Learner Mission API không trả đáp án.
- [ ] Admin Course/Chapter APIs.
- [ ] Admin Mission/Dataset APIs.
- [ ] Draft/publish/archive workflow.
- [ ] Pagination/filter/search.
- [ ] API validation.

## Step 7.4 — Authoritative Submission `[P0]`

- [ ] Backend không tin `isCorrect` từ client.
- [ ] Excel Submit được tính/chấm lại ở môi trường tin cậy.
- [ ] SQL Submit được chạy lại trong sandbox tách biệt.
- [ ] SQL sandbox không truy cập PostgreSQL application database.
- [ ] Timeout.
- [ ] Memory/row/query limits.
- [ ] Idempotency key cho Submit.
- [ ] Attempt audit.
- [ ] Không trả expected answer cho Learner.

Kiến trúc khuyến nghị:

```text
Run Excel/SQL: browser để phản hồi nhanh
Submit Excel/SQL: backend kiểm tra lại để trao XP
```

## Step 7.5 — Progress và Reward Transactions `[P0]`

- [ ] Transaction trao XP.
- [ ] Unique reward constraint.
- [ ] Server-side unlock.
- [ ] Server-side streak date.
- [ ] Reconcile dữ liệu mock nếu cần.
- [ ] Concurrent submission test.

## Step 7.6 — API Client Migration `[P0]`

- [ ] `apiAuthService`.
- [ ] `apiCourseService`.
- [ ] `apiMissionService`.
- [ ] `apiSubmissionService`.
- [ ] `apiProgressService`.
- [ ] Admin API services.
- [ ] Chuyển adapter bằng config.
- [ ] Không viết lại UI component.
- [ ] Loading/error/unauthorized handling.

## Step 7.7 — Integration và E2E `[P0]`

- [ ] Learner login → course → submit → XP → unlock.
- [ ] Admin create → preview → publish → learner thấy nội dung.
- [ ] Unauthorized/forbidden tests.
- [ ] Duplicate reward tests.
- [ ] SQL sandbox isolation tests.
- [ ] API contract tests.
- [ ] Database migration test trên staging.

---

# 8. Sprint 8 — Analytics, Hardening và Launch

## Step 8.0 — Analytics Event Foundation `[P0, bắt đầu sớm hơn]`

Không nên đợi Sprint 8 mới thu thập dữ liệu. Nếu không có event history, dashboard sẽ không có dữ liệu đáng tin.

Event cần xác định từ Sprint 5 hoặc Sprint 7:

- `mission_started`
- `formula_run`
- `query_run`
- `answer_submitted`
- `hint_opened`
- `step_completed`
- `mission_completed`
- `mission_abandoned`

Mỗi event cần:

- event ID.
- user ID.
- mission/step ID.
- timestamp server.
- tool.
- result/status.
- duration methodology.

Không tính “thời gian làm bài” chỉ bằng thời điểm mở và đóng trang; tab bị bỏ quên sẽ làm số liệu sai. Cần định nghĩa active time hoặc inactivity threshold.

## Step 8.1 — Admin Analytics `[P1]`

- [ ] Completion rate.
- [ ] Average active completion time.
- [ ] Average attempts.
- [ ] Hint usage rate.
- [ ] Error rate theo Mission.
- [ ] Drop-off Step.
- [ ] Mission bị vướng nhiều nhất.
- [ ] Filter theo Course, Tool và thời gian.
- [ ] Định nghĩa metric được ghi trong tài liệu.

## Step 8.2 — Performance `[P0]`

- [ ] Thiết lập performance baseline.
- [ ] Bundle analysis.
- [ ] Lazy-load Excel/SQL engines.
- [ ] Lazy-load Code Editor.
- [ ] Code splitting theo route.
- [ ] WASM caching.
- [ ] Không khởi tạo SQL engine khi chưa vào SQL Mission.
- [ ] Virtualize bảng lớn nếu cần.
- [ ] Image/font optimization.

## Step 8.3 — Security Hardening `[P0]`

- [ ] Broken access control audit.
- [ ] Security misconfiguration audit.
- [ ] Injection audit.
- [ ] Authentication/session audit.
- [ ] Input validation.
- [ ] Dependency/supply-chain scan.
- [ ] Security headers.
- [ ] CORS review.
- [ ] Rate limiting.
- [ ] Logging và alerting.
- [ ] Secret rotation plan.
- [ ] Backup/restore test.

OWASP audit không nên chỉ diễn ra một lần ở cuối. Sprint 8 là lần tổng kiểm tra; các rule chính phải được áp dụng từ Sprint 7.

## Step 8.4 — Observability `[P0]`

- [ ] Structured logs.
- [ ] Error tracking.
- [ ] Health/readiness checks.
- [ ] Performance monitoring.
- [ ] Alert cho submission error tăng cao.
- [ ] Không log password, token hoặc đáp án nhạy cảm.

## Step 8.5 — Deployment Architecture `[P0]`

Docker là cách đóng gói, không tự động đồng nghĩa với phát hành thành công.

Nếu frontend hiện chạy trên Vercel, kiến trúc hợp lý có thể là:

```text
React/Vite Frontend → Vercel
FastAPI Backend → Container Platform
PostgreSQL → Managed Database
```

Checklist:

- [ ] Dockerfile backend.
- [ ] Non-root container user.
- [ ] Health check.
- [ ] Production environment variables.
- [ ] Managed PostgreSQL.
- [ ] Migration command trong deployment workflow.
- [ ] Staging environment.
- [ ] Production environment.
- [ ] Domain/HTTPS.
- [ ] Rollback strategy.
- [ ] Backup/restore.
- [ ] CI/CD test gate.

Không bắt buộc Dockerize Vite frontend nếu Vercel đã build và phục vụ frontend tốt.

## Step 8.6 — UAT và Launch Gate `[P0]`

- [ ] Alpha feedback đã xử lý.
- [ ] Functional test Excel pass.
- [ ] Functional test SQL pass.
- [ ] Admin publish flow pass.
- [ ] Learner progress flow pass.
- [ ] Accessibility smoke test.
- [ ] Responsive smoke test.
- [ ] Security blocker bằng 0.
- [ ] Migration production rehearsal.
- [ ] Rollback rehearsal.
- [ ] Known issues được công khai nội bộ.

---

# 9. Roadmap đã chỉnh gọn

| Sprint | Primary Area | Step đề xuất |
|---|---|---|
| 3.4 | Learner + Shared | Contract → Mock Service → Feedback → Integration Test |
| 4 | Learner + Shared | Spike → Engine/Worker → Schema → Editor → Result → Checker → Test |
| 5 | Learner + Shared | Domain/Persistence → XP → Unlock → Streak → Profile → Achievement → Test |
| 6 | Admin | Lifecycle → Course/Chapter → Dataset → Mission → Checker Tests → Preview/Publish → Test |
| 7 | Backend | Foundation → DB → Auth → Content API → Submission → Progress → Client Migration → E2E |
| 8 | Admin + Infrastructure | Events → Analytics → Performance → Security → Observability → Deploy → UAT |

---

# 10. Ưu tiên đầu tư kỹ nhất

## Cấp 1 — Không được làm sơ sài

1. Step 3.4 Submission contract và idempotency boundary.
2. Sprint 4 SQL sandbox, Worker và Result Checker.
3. Sprint 5 XP transaction và Unlock Engine.
4. Sprint 7 authoritative grading và database separation.

## Cấp 2 — Quyết định khả năng mở rộng nội dung

1. Sprint 6 Dataset Manager.
2. Mission Editor.
3. Checker/Test-case Builder.
4. Publish Validation và Content Versioning.

## Cấp 3 — Có thể cải tiến sau MVP

1. Animation thăng cấp phức tạp.
2. Daily attendance rewards.
3. Autocomplete SQL nâng cao.
4. Achievement gallery cầu kỳ.
5. Export result CSV.

---

# 11. Đầu việc tiếp theo được khuyến nghị

Các gate Sprint 3 và Step 4.0 đã hoàn thành. Step kế tiếp theo roadmap là 4.1A, nhưng chưa được kích hoạt. Bằng chứng Step 4.0 gồm:

1. Chốt engine package/version/license và SQLite dialect.
2. Xác minh WASM/Worker trên Vite dev, production build và browser preview.
3. Chốt mission/dataset/execution/checker contract proposal.
4. Chốt read-only policy, timeout/cancel, row limit và worker recovery.
5. Chứng minh seed/schema/execute/reset/dispose bằng spike nhỏ.
6. Chạy full Sprint 1–3 regression; không tạo product route/UI.

Các mục trên đã pass; chỉ mở Step 4.1A khi Current Task được chuyển phạm vi rõ ràng.

---

# 12. Nguồn kỹ thuật tham khảo

- [sql.js official repository](https://github.com/sql-js/sql.js/): SQLite chạy trong browser bằng WebAssembly, có in-memory database và Web Worker API.
- [SQLite WASM persistence](https://sqlite.org/wasm/doc/92e1d3dab4/persistence.md): OPFS và yêu cầu Worker context khi cần browser persistence.
- [CodeMirror documentation](https://codemirror.net/docs/): editor framework và extension system.
- [FastAPI OAuth2/JWT documentation](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/): JWT, expiration và password hashing.
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/): checklist verification cho ứng dụng web.
- [OWASP Top 10:2025](https://owasp.org/Top10/): nhóm rủi ro web application cần ưu tiên khi hardening.
