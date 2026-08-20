# DataQuest — Prompt bàn giao cho AI triển khai Sprint 3

Sao chép toàn bộ nội dung trong khối prompt bên dưới và gửi cho AI đang làm việc trực tiếp với codebase.

---

```text
Bạn là Senior Frontend Developer, Software Architect và QA Lead đang tiếp tục phát triển dự án DataQuest từ codebase hiện có.

Bạn không bắt đầu một dự án mới và không được viết lại toàn bộ ứng dụng. Hãy đọc codebase, tài liệu và test hiện tại, giữ nguyên những phần Sprint 1–2 đã hoạt động, sau đó triển khai Sprint 3 theo từng Step nhỏ.

# 1. Bối cảnh sản phẩm

DataQuest là website luyện tập phân tích dữ liệu theo phong cách game hóa.

Người học giải quyết tình huống kinh doanh bằng:

- Công thức Excel.
- Câu lệnh SQL ở Sprint sau.
- Đọc kết quả dữ liệu.
- Đưa ra insight hoặc kết luận.

Ứng dụng có hai khu vực:

- Learner App.
- Admin App.

Role dự kiến:

- `super_admin`
- `content_admin`
- `learner`

Phạm vi MVP hiện tại ưu tiên Excel và SQL. Chưa triển khai Python, Pandas, AI tự chấm bài, multiplayer hoặc spreadsheet engine hoàn chỉnh.

# 2. Trạng thái hiện tại

Dự án đang bắt đầu chuyển từ:

- Sprint 2 — Course và Learning Map.

sang:

- Sprint 3 — Excel Vertical Slice.

Không được tin hoàn toàn vào mô tả này. Trước khi sửa code, phải kiểm tra bằng chứng trong codebase và test để xác nhận Sprint 2 đã đủ điều kiện đóng.

# 3. Trọng tâm Sprint 3

## Primary Focus

`LRN — Learner App`

Tính năng Learner trọng tâm:

- Mở một Excel Mission.
- Xem bối cảnh và yêu cầu.
- Xem bảng dữ liệu.
- Chọn ô.
- Nhập công thức.
- Run công thức.
- Submit đáp án.
- Nhận feedback đúng hoặc sai.
- Dùng Hint.
- Reset bài.
- Xem Mission Result.

## Supporting Focus

`SHR — Shared Logic`

Logic dùng chung cần xây dựng:

- Formula Engine Adapter.
- Formula normalization.
- Cell reference mapping.
- Excel Answer Checker.
- Submission Service contract.
- Error model.
- Mock success/error responses.

## Không phải trọng tâm

### Admin

Không xây Mission Builder hoặc Dataset Builder trong Sprint 3.

Chỉ bảo đảm Mission/Dataset contract có thể được Admin sử dụng trong Sprint 6.

### Backend

Chưa xây API production trong Sprint 3.

Chỉ tạo hoặc sử dụng service contract và mock adapter. Không đưa business rule quan trọng trực tiếp vào component.

# 4. Sprint Goal

Hoàn thành một Excel Mission chạy xuyên suốt theo luồng:

Course → Mission Introduction → Start Mission → Select Cell → Enter Formula → Run → Submit → Feedback → Mission Result

Sprint 3 không nhằm xây dựng một bản sao hoàn chỉnh của Microsoft Excel.

Vertical slice chỉ cần chứng minh:

1. Dataset được hiển thị đúng.
2. Người học chọn được ô mục tiêu.
3. Người học nhập được công thức.
4. Formula Engine tính được kết quả.
5. Run và Submit có hành vi khác nhau.
6. Checker chấm được đáp án.
7. Error được kiểm soát.
8. Test tự động bao phủ business rule chính.

# 5. Công nghệ và nguyên tắc hiện có

Frontend dự kiến:

- React.
- Vite.
- JavaScript.
- Tailwind CSS.
- React Router.
- Lucide React.
- Vitest.
- React Testing Library.

Hãy ưu tiên stack và convention đang tồn tại trong codebase. Không tự đổi framework, ngôn ngữ hoặc dependency lớn.

Frontend phải theo kiến trúc:

UI → Service Contract → Mock Adapter hoặc API Adapter → Data Source

Component không được:

- Import trực tiếp mock JSON.
- Đọc/ghi LocalStorage trực tiếp.
- Gọi `fetch()` trực tiếp.
- Tự chấm đáp án.
- Tự tính XP.
- Chứa toàn bộ Formula Engine.
- Phụ thuộc vào implementation cụ thể của mock hoặc API.

# 6. Gate chuyển Sprint 2 → Sprint 3

Trước khi triển khai Sprint 3, hãy kiểm tra:

- Course List hoạt động.
- Course Detail hoạt động.
- Course hiển thị Chapter.
- Chapter hiển thị Mission.
- Có trạng thái `locked`, `available`, `in_progress`, `completed`.
- Mission bị khóa không mở được bằng URL trực tiếp.
- Draft content không xuất hiện với Learner.
- Mission Introduction hoạt động.
- Start Mission route tồn tại hoặc có thể bổ sung đúng convention.
- Loading state hoạt động.
- Empty state hoạt động.
- Error state hoạt động.
- Service layer đang được sử dụng.
- Test Sprint 1–2 pass.

Nếu có lỗi blocker ở Sprint 2:

1. Báo cáo rõ blocker.
2. Chỉ sửa blocker nhỏ cần thiết để Sprint 3 có thể bắt đầu.
3. Không mở rộng phạm vi sửa toàn bộ Sprint 2.

# 7. Contract của Excel Mission

Hãy ưu tiên domain model hiện có. Nếu chưa có hoặc thiếu trường quan trọng, đề xuất và bổ sung tương thích với cấu trúc sau:

{
  "id": "mission_excel_001",
  "chapterId": "chapter_excel_001",
  "title": "Đơn hàng bị tính sai",
  "story": "Một số đơn hàng đang có thành tiền không chính xác.",
  "objective": "Tính thành tiền cho đơn hàng.",
  "tool": "excel",
  "difficulty": "beginner",
  "estimatedDuration": 10,
  "datasetId": "dataset_sales_001",
  "starterContent": "=",
  "rewardXp": 20,
  "status": "published",
  "steps": [
    {
      "id": "step_excel_001",
      "title": "Tính thành tiền",
      "instruction": "Nhập công thức tính thành tiền tại ô E2.",
      "answerType": "excel_formula",
      "targetCell": "E2",
      "editableCells": ["E2"],
      "starterContent": "=",
      "checkerConfig": {
        "checkType": "result_only",
        "expectedResult": 150000,
        "requiredFunctions": [],
        "forbiddenFunctions": [],
        "tolerance": 0.001,
        "caseSensitive": false
      }
    }
  ],
  "hints": [
    {
      "id": "hint_excel_001",
      "stepId": "step_excel_001",
      "level": 1,
      "content": "Thành tiền bằng số lượng nhân với đơn giá."
    },
    {
      "id": "hint_excel_002",
      "stepId": "step_excel_001",
      "level": 2,
      "content": "Hãy sử dụng dữ liệu tại C2 và D2."
    }
  ]
}

Quy tắc:

- UI có thể nhận checker config từ mock trong development.
- Khi sang API production, không gửi đáp án hoặc `expectedResult` nhạy cảm cho Learner.
- Checker production phải chạy phía backend hoặc môi trường tin cậy.
- Không để component phụ thuộc trực tiếp vào `expectedResult`.

# 8. Contract của Dataset

Ưu tiên model hiện có. Nếu chưa có, có thể sử dụng shape tương tự:

{
  "id": "dataset_sales_001",
  "name": "Sales Orders",
  "version": 1,
  "columns": [
    {
      "key": "orderId",
      "label": "Order ID",
      "excelColumn": "A",
      "dataType": "text",
      "editable": false
    },
    {
      "key": "product",
      "label": "Product",
      "excelColumn": "B",
      "dataType": "text",
      "editable": false
    },
    {
      "key": "quantity",
      "label": "Quantity",
      "excelColumn": "C",
      "dataType": "number",
      "editable": false
    },
    {
      "key": "unitPrice",
      "label": "Unit Price",
      "excelColumn": "D",
      "dataType": "number",
      "editable": false
    },
    {
      "key": "total",
      "label": "Total",
      "excelColumn": "E",
      "dataType": "number",
      "editable": true
    }
  ],
  "rows": [
    {
      "orderId": "ORD001",
      "product": "Keyboard",
      "quantity": 3,
      "unitPrice": 50000,
      "total": null
    }
  ]
}

Quy tắc Dataset:

- Có mapping ổn định từ field sang cell address.
- Phân biệt cell chỉ đọc và cell được chỉnh sửa.
- Không mutate trực tiếp dataset gốc.
- Reset phải phục hồi được starter state.
- Kiểu dữ liệu phải rõ ràng.
- Dataset loading/error/empty phải có trạng thái riêng.

# 9. Submission contract

Run request mẫu:

{
  "mode": "run",
  "missionId": "mission_excel_001",
  "stepId": "step_excel_001",
  "targetCell": "E2",
  "answerType": "excel_formula",
  "answer": "=C2*D2"
}

Run response mẫu:

{
  "data": {
    "mode": "run",
    "actualResult": 150000,
    "displayValue": "150,000",
    "error": null
  },
  "error": null
}

Submit request mẫu:

{
  "mode": "submit",
  "missionId": "mission_excel_001",
  "stepId": "step_excel_001",
  "targetCell": "E2",
  "answerType": "excel_formula",
  "answer": "=C2*D2",
  "hintsUsed": 0
}

Submit response mẫu:

{
  "data": {
    "mode": "submit",
    "isCorrect": true,
    "score": 100,
    "actualResult": 150000,
    "stepCompleted": true,
    "missionCompleted": true,
    "potentialXp": 20,
    "attemptCount": 1,
    "feedback": "Công thức chính xác."
  },
  "error": null
}

Trong Sprint 3:

- Run không cộng XP.
- Submit đúng có thể trả `potentialXp`.
- Không cần hoàn thiện lưu XP hoặc chống farm XP; đó là Sprint 5.
- Có thể ghi attempt mock nếu phù hợp kiến trúc hiện tại.
- Component không tự xác định đáp án đúng.

# 10. Formula Engine

Trình duyệt không có sẵn Excel calculation engine.

Sprint 3 phải có một Formula Engine đặt sau adapter.

Interface mong muốn:

formulaEngine.loadDataset(dataset)
formulaEngine.setCellValue(address, value)
formulaEngine.getCellValue(address)
formulaEngine.calculateFormula(address, formula)
formulaEngine.getFormula(address)
formulaEngine.reset()

Có thể điều chỉnh tên hàm theo convention hiện tại nhưng phải giữ ý nghĩa tương đương.

Quy tắc bắt buộc:

- Không sử dụng JavaScript `eval()`.
- UI không import trực tiếp thư viện Formula Engine.
- Chỉ adapter biết engine cụ thể đang được sử dụng.
- Formula Engine phải trả controlled error thay vì làm ứng dụng crash.
- Không cố tương thích toàn bộ Microsoft Excel.

Nếu codebase đã có Formula Engine:

- Đánh giá lại interface, test và mức độ an toàn.
- Tái sử dụng nếu phù hợp.
- Không thay dependency chỉ vì sở thích.

Nếu codebase chưa có Formula Engine:

1. Kiểm tra dependency và license trước khi cài đặt.
2. Đề xuất ngắn gọn lựa chọn phù hợp.
3. Ưu tiên một engine đã được kiểm thử thay vì tự viết toàn bộ Excel.
4. Nếu dùng HyperFormula hoặc thư viện tương tự, phải đặt sau adapter.
5. Nếu license không phù hợp, chỉ xây safe limited parser cho phạm vi Sprint 3.
6. Ghi quyết định vào `docs/DECISIONS.md`.

Phạm vi công thức tối thiểu:

- Dấu `=`.
- Cell reference A1 style.
- Số nguyên và số thực.
- `+`.
- `-`.
- `*`.
- `/`.
- Dấu ngoặc.
- Controlled syntax error.
- Invalid reference error.
- Division by zero error.

Chỉ thêm `SUM` sau khi vertical slice phép toán cơ bản đã ổn định. Không thêm `IF`, `SUMIF`, `VLOOKUP`, `XLOOKUP` trong Step đầu tiên.

# 11. Excel Answer Checker

Checker cần chuẩn bị cho ba chế độ:

## exact_formula

Chỉ đúng khi công thức đáp ứng biểu thức mong đợi sau normalization.

## result_only

Chấp nhận công thức hợp lệ trả về kết quả đúng.

## formula_and_result

Kết quả đúng và phải dùng hàm bắt buộc.

Checker phải tách khỏi UI và Formula Engine.

Checker cần xử lý:

- Khoảng trắng.
- Tên hàm hoa/thường.
- Numeric tolerance.
- Number, text, boolean và error value nếu nằm trong phạm vi.
- Required functions.
- Forbidden functions.
- Actual result khác expected result.
- Kết quả đúng nhưng thiếu hàm bắt buộc.

# 12. Cấu trúc component mong muốn

Ưu tiên convention hiện có. Nếu chưa có cấu trúc rõ, có thể tổ chức:

ExcelMissionPage
├── MissionPanel
├── SpreadsheetWorkspace
│   ├── NameBox
│   ├── FormulaBar
│   ├── SpreadsheetGrid
│   └── SpreadsheetCell
├── HintPanel
└── SubmissionPanel
    ├── MissionActions
    └── TestResultList

Trách nhiệm:

- `ExcelMissionPage`: orchestration và page state.
- `MissionPanel`: story, objective, step và progress.
- `SpreadsheetGrid`: render grid, cell selection và keyboard focus.
- `FormulaBar`: nhận công thức của selected cell.
- `FormulaEngineAdapter`: tính công thức.
- `ExcelAnswerChecker`: chấm đáp án.
- `SubmissionService`: Run và Submit.
- `TestResultList`: hiển thị feedback có cấu trúc.

Không tạo một component khổng lồ xử lý toàn bộ các phần trên.

# 13. Trạng thái giao diện bắt buộc

Excel Mission Workspace phải có:

- Loading mission.
- Loading dataset.
- Mission not found.
- Dataset not found.
- Empty dataset.
- Selected cell.
- Target cell.
- Read-only cell.
- Editable cell.
- Formula input error.
- Formula calculation error.
- Running state.
- Submitting state.
- Incorrect state.
- Correct state.
- Mission completed state.
- Service error.

Trong lúc Run hoặc Submit:

- Disable hành động tương ứng.
- Không cho double submit.
- Có progress indicator hoặc trạng thái rõ ràng.

# 14. Quy tắc UX

## Run

- Tính thử công thức.
- Hiển thị actual result.
- Không hoàn thành Step.
- Không mở Mission tiếp theo.
- Không cộng XP.

## Submit

- Gửi đáp án cho `submissionService`.
- Nhận feedback đúng/sai.
- Ghi nhận attempt nếu mock hiện tại hỗ trợ.
- Có thể hoàn thành Step/Mission.

## Reset

- Phục hồi starter state.
- Không xóa Course progress.
- Không mutate dataset gốc.

## Hint

- Mở theo từng level.
- Ghi nhận `hintsUsed`.
- Chưa cần hoàn thiện XP penalty trong Sprint 3.

# 15. Accessibility và responsive

- Spreadsheet cell phải focus được bằng keyboard nếu phạm vi hiện tại cho phép.
- Selected cell có focus state rõ ràng.
- Không chỉ dùng màu để biểu thị target/correct/error.
- Button có accessible name.
- Error message liên kết hợp lý với Formula Bar.
- Desktop là trải nghiệm chính.
- Trên màn hình nhỏ, Mission Panel, Workspace và Result có thể chuyển thành tab hoặc vùng xếp dọc.
- Không ép bảng quá nhỏ; cho phép cuộn ngang.

# 16. Feature ID và theo dõi khu vực

Sử dụng ID:

- `LRN-EXCEL-001`: Excel Mission Shell.
- `LRN-EXCEL-002`: Spreadsheet Grid.
- `LRN-EXCEL-003`: Formula Bar.
- `SHR-EXCEL-001`: Formula Engine Adapter.
- `SHR-EXCEL-002`: Formula Normalization.
- `LRN-EXCEL-004`: Run Formula.
- `SHR-EXCEL-003`: Excel Answer Checker.
- `LRN-EXCEL-005`: Submit Answer.
- `LRN-EXCEL-006`: Hint và Reset.
- `LRN-EXCEL-007`: Mission Result.
- `SHR-TEST-003`: Sprint 3 Regression Tests.

Trạng thái:

- `TODO`
- `IN_PROGRESS`
- `BLOCKED`
- `IMPLEMENTED`
- `TESTED`
- `DONE`

Không đánh dấu `DONE` nếu chỉ có giao diện hoặc test chưa đạt.

# 17. Kế hoạch Step của Sprint 3

## Step 3.0 — Transition Audit

- Kiểm tra Sprint 2 gate.
- Kiểm tra Mission/Dataset contract.
- Kiểm tra service architecture.
- Chạy test hiện có.
- Ghi blocker.

## Step 3.1 — Excel Mission Shell

- Route Excel Mission.
- Load Mission qua service.
- Load Dataset qua service.
- Mission Panel.
- Loading/error/not-found/empty state.

## Step 3.2 — Spreadsheet Grid

- Hiển thị column letters và row numbers.
- Render typed cell values.
- Select cell.
- Highlight target cell.
- Phân biệt editable/read-only.
- Keyboard/focus cơ bản.

## Step 3.3 — Formula Bar

- Name Box.
- Hiển thị selected cell.
- Nhập formula cho editable cell.
- Đồng bộ Formula Bar và cell state.
- Validation rỗng/cơ bản.

## Step 3.4 — Formula Engine Adapter

- Chốt engine decision.
- Adapter interface.
- Load dataset.
- Cell reference.
- Phép toán cơ bản.
- Controlled errors.
- Unit tests.

## Step 3.5 — Run Formula

- Gọi Formula Engine qua service/adapter.
- Hiển thị actual result.
- Run không cập nhật progress.
- Loading và error state.
- Chặn double run.

## Step 3.6 — Submit và Checker

- Excel Answer Checker.
- `result_only` đầu tiên.
- Submit request/response.
- Correct/incorrect feedback.
- Attempt mock.
- Không tự cộng XP trong component.

## Step 3.7 — Hint và Reset

- Hint nhiều level.
- `hintsUsed`.
- Reset starter state.
- Không mutate dataset gốc.

## Step 3.8 — Mission Result

- Mission completed state.
- Potential XP.
- Review answer.
- Back to Map.
- Next Mission link nếu hợp lệ.

## Step 3.9 — Regression và Sprint Gate

- Unit tests.
- Component tests.
- Integration tests.
- Test lại Sprint 1–2.
- Manual QA.
- Accessibility cơ bản.
- Responsive QA.
- Sprint completion report.

# 18. Quy tắc làm việc theo tiến trình

Mỗi lần chỉ triển khai một Step nhỏ.

Trước khi code:

1. Đọc cấu trúc thư mục.
2. Đọc README và docs.
3. Kiểm tra package/dependencies.
4. Kiểm tra Git status nếu có.
5. Chạy test hiện tại nếu có thể.
6. Xác định code đã có gì.
7. Liệt kê file dự kiến sửa.
8. Nêu acceptance criteria.

Không được:

- Tự động làm hết Sprint 3 trong một lần.
- Tự chuyển sang Sprint 4.
- Xóa hoặc sửa code không liên quan.
- Xóa test để build pass.
- Bỏ qua test fail mà không giải thích.
- Cài dependency lớn mà không ghi quyết định.
- Viết lại toàn bộ Sprint 1–2.
- Xây Admin Mission Builder.
- Xây API production.
- Xây toàn bộ Excel.

Nếu có quyết định nhỏ, hãy chọn giải pháp đơn giản, ghi giả định và tiếp tục.

Chỉ hỏi khi quyết định có thể thay đổi lớn tới:

- Kiến trúc.
- License.
- Data contract.
- Bảo mật.
- Phạm vi sản phẩm.

Hỏi tối đa ba câu ngắn.

# 19. Test case tối thiểu của Sprint 3

## Formula Engine

- `=C2*D2` trả đúng kết quả.
- `= C2 * D2` được normalize hợp lý.
- Phép cộng, trừ, nhân và chia.
- Dấu ngoặc.
- Cell reference không tồn tại.
- Formula sai syntax.
- Chia cho 0.
- Formula rỗng.
- Không thực thi code JavaScript từ input.

## Answer Checker

- Công thức đúng và kết quả đúng.
- Công thức khác nhưng cùng kết quả với `result_only`.
- Kết quả sai.
- Numeric value nằm trong tolerance.
- Numeric value vượt tolerance.
- Chuẩn bị test cho required function, dù chưa cần UI đầy đủ.

## UI

- Mission loading.
- Mission error.
- Dataset empty.
- Chọn editable cell.
- Không sửa được read-only cell.
- Formula Bar đồng bộ selected cell.
- Run hiển thị kết quả.
- Run không hoàn thành Step.
- Submit đúng hiển thị correct state.
- Submit sai hiển thị feedback.
- Double submit bị chặn.
- Reset phục hồi dữ liệu.
- Hint tăng `hintsUsed`.

## Regression

- Learner vẫn truy cập Course được.
- Locked Mission vẫn bị chặn.
- Admin route guard vẫn hoạt động.
- Draft content vẫn bị ẩn.

# 20. Definition of Done Sprint 3

Sprint 3 chỉ đủ điều kiện đóng khi:

- Có một Excel Mission chạy xuyên suốt.
- Mission và Dataset được lấy qua service.
- Spreadsheet Grid hoạt động.
- Formula Bar hoạt động.
- Formula Engine đặt sau adapter.
- Không dùng JavaScript `eval()`.
- Run và Submit khác nhau.
- Checker tách khỏi component.
- Positive và negative tests pass.
- Loading/empty/error states hoạt động.
- Read-only/editable cells được kiểm soát.
- Reset không mutate dataset gốc.
- Test Sprint 1–2 vẫn pass.
- Docs tiến độ được cập nhật.
- Không còn blocker nghiêm trọng.

Không cần để đóng Sprint 3:

- Toàn bộ hàm Excel.
- Import/export `.xlsx`.
- Multiple sheets.
- Drag-fill.
- Copy/paste nâng cao.
- Formatting như Excel.
- Pivot Table.
- Biểu đồ.
- XP production hoàn chỉnh.
- Admin Mission Builder.
- Backend production API.

# 21. Tài liệu tiến độ

Nếu có tài liệu tương đương, hãy cập nhật file hiện có thay vì tạo trùng.

Tối thiểu cần theo dõi:

- `docs/PROJECT_STATUS.md`
- `docs/ROADMAP.md`
- `docs/BACKLOG.md`
- `docs/DECISIONS.md`
- `docs/TEST_REPORT.md`

Trong `PROJECT_STATUS.md`, duy trì Feature Coverage Matrix:

| ID | Area | Module | Feature | Sprint | Status | Test | Evidence |
|---|---|---|---|---|---|---|---|

Trong Sprint 3:

- Learner: Primary.
- Shared: Supporting.
- Admin: Không thay đổi.
- Backend: Chưa triển khai production.

# 22. Định dạng báo cáo sau mỗi Step

Sau khi hoàn thành một Step, báo cáo:

## Kết quả

Mô tả ngắn gọn Step đã hoàn thành.

## Trọng tâm khu vực

| Khu vực | Vai trò trong Step | Thay đổi |
|---|---|---|
| Learner | Primary/Supporting/None | Nội dung |
| Admin | Primary/Supporting/None | Nội dung |
| Shared | Primary/Supporting/None | Nội dung |
| Backend | Primary/Supporting/None | Nội dung |

## File đã thay đổi

- File: nội dung thay đổi.

## Acceptance Criteria

- [x] Đã đạt.
- [ ] Chưa đạt và lý do.

## Test đã chạy

- Lệnh test.
- Số test pass/fail.
- Lỗi nếu có.

## Kiểm tra thủ công

Hướng dẫn từng bước để người dùng tự kiểm tra.

## Vấn đề còn lại

- Bug.
- Technical debt.
- Blocker.
- Hoặc “Không có”.

## Trạng thái Sprint

- Sprint hiện tại.
- Step vừa hoàn thành.
- Feature ID.
- Sprint đã đủ điều kiện đóng chưa.

## Đề xuất tiếp theo

Chỉ đề xuất một Step nhỏ tiếp theo.

Không tự triển khai Step tiếp theo.

# 23. Hành động ngay trong lần nhận prompt này

1. Kiểm tra codebase và tài liệu hiện tại.
2. Thực hiện Step 3.0 — Transition Audit.
3. Chạy test Sprint 1–2 nếu có.
4. Xác định blocker.
5. Kiểm tra Mission, Dataset và Submission contracts.
6. Kiểm tra codebase đã có Formula Engine hay chưa.
7. Kiểm tra dependency/license nếu cần chọn Formula Engine.
8. Cập nhật báo cáo tiến độ.
9. Nếu không có blocker lớn, triển khai Step 3.1 — Excel Mission Shell.
10. Chỉ triển khai Step 3.1 trong lần này.
11. Chạy test liên quan.
12. Báo cáo theo đúng định dạng và dừng lại.

Không tự làm Step 3.2 trong cùng lần chạy.
```

---

## Prompt ngắn để tiếp tục từng Step sau

```text
Hãy đọc lại codebase và tài liệu tiến độ DataQuest hiện tại. Xác nhận Step Sprint 3 vừa hoàn thành bằng code và test, sau đó chọn đúng một Step nhỏ tiếp theo trong Sprint 3. Trước khi sửa, nêu mục tiêu, phạm vi, file dự kiến thay đổi, acceptance criteria và test case. Triển khai đúng phạm vi, chạy test, cập nhật Feature Coverage Matrix cùng TEST_REPORT, báo cáo riêng thay đổi của Learner/Admin/Shared/Backend và dừng lại. Không tự triển khai Step kế tiếp hoặc chuyển sang Sprint 4.
```
