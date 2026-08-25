# Shared Service & Domain Contracts

> **Cập nhật lần cuối:** 24/08/2026
> **Trạng thái hợp đồng:** Nguồn chuẩn cho giao tiếp dữ liệu giữa các module Frontend và Backend.
> **Trạng thái phân loại:**
> - `CURRENT`: Đã triển khai và verified (`submissionService`, `sqlEngineAdapter`, `excelChecker`, `sqlChecker`).
> - `PLANNED`: Chuẩn bị triển khai trong Sprint 5–6 (`contentService`, `datasetService`, `progressService`).
> - `PROPOSED`: Định hướng mở rộng tương lai (`practiceService`, `analyticsService`).

---

## 1. 🏛 Domain Hierarchy & Taxonomy Contracts (`PLANNED`)

Hệ thống tuân thủ chuỗi phân cấp dữ liệu học tập chuẩn:
```text
Learning Journey
  └── Phase
       └── Chapter
            └── Investigation (Truyện / Bối cảnh Vụ án)
                 └── Question (Nhiệm vụ kỹ thuật Excel/SQL)
                      ├── Question Variant (Biến thể bài tập)
                      └── Submission (Bài làm của người học)
                           └── Result (Kết quả chấm điểm & potentialXp)
                                └── Progress (Ghi nhận XP & Level - Progress Domain)
```

### 1.1. Core Concept Distinctions
- **Investigation vs Question**: `Investigation` chứa câu chuyện bối cảnh trinh thám; `Question` là nhiệm vụ thao tác kỹ thuật cụ thể (công thức Excel hoặc câu lệnh SQL).
- **Question vs Question Variant**: `Question` quy định đề bài lõi; `Question Variant` chứa bộ test/tham số khác nhau cho chế độ Luyện tập hoặc Replay.
- **Dataset (Independent Asset)**: Bộ dữ liệu `Dataset` tồn tại độc lập với ID riêng (`datasetId`), có thể được gán cho nhiều `Question` hoặc `Investigation` mà không bị nhân bản.
- **Course vs Learning Map**: `Course` chứa cấu trúc tri thức; `Learning Map` hiển thị trạng thái nút học tập của người học theo thời gian thực.
- **Main Quest vs Practice**: `Main Quest` mở khóa tuyến tính trên Bản đồ Học tập; `Practice` làm bài rèn luyện tự do trong ngân hàng câu hỏi.
- **Completion vs Mastery**: `Completion` là cờ Boolean mở khóa bài học; `Mastery` là điểm số đánh giá chất lượng (Độ chính xác, thời gian giải, số gợi ý đã dùng, tối ưu SQL).

---

## 2. 📝 Content & Evaluation Configuration Contract (`PLANNED — Step 5.1`)

```js
/**
 * @typedef {Object} EvaluationConfig
 * @property {'excel'|'sql'} tool
 * @property {Object} [excelConfig]
 * @property {string} [excelConfig.targetCell]
 * @property {string} [excelConfig.expectedFormula]
 * @property {unknown} [excelConfig.expectedValue]
 * @property {Object} [sqlConfig]
 * @property {string[]} [sqlConfig.expectedColumns]
 * @property {boolean} [sqlConfig.orderMatters]
 * @property {boolean} [sqlConfig.columnOrderMatters]
 * @property {number} [sqlConfig.numericTolerance]
 * @property {string[]} [sqlConfig.requiredConstructs]
 * @property {string[]} [sqlConfig.forbiddenConstructs]
 */
```

- **Quy tắc bóc tách (`Step 5.1`)**: Evaluator configs không được lưu cứng trong `mockSubmissionService.js`. `submissionService` sẽ gọi `contentService.getEvaluationConfig(questionId)` để lấy `EvaluationConfig` tại thời điểm chấm bài.

---

## 3. 🎯 Submission Service Contract (`CURRENT`)

Duy trì tại `src/services/contracts/submissionService.js`. Mock và API adapter giữ cùng public interface.

### 3.1. Submission Request
```js
/**
 * @typedef {Object} SubmissionRequest
 * @property {'run'|'submit'} mode
 * @property {string} questionId // (Hoặc missionId cho legacy compatibility)
 * @property {string} [stepId]
 * @property {'excel'|'sql'} tool
 * @property {{formula?: string, query?: string, sheetData?: unknown}} answer
 * @property {number} [hintsUsed]
 * @property {string} clientAttemptId
 */
```

### 3.2. Submission Result
```js
/**
 * @typedef {Object} SubmissionResult
 * @property {string} attemptId
 * @property {boolean} isCorrect
 * @property {number} score
 * @property {boolean} stepCompleted
 * @property {boolean} questionCompleted
 * @property {number} potentialXp // Ghi chú: CHỈ LÀ PHẦN THƯỞNG DỰ KIẾN, KHÔNG MUTATE XP
 * @property {string} feedbackCode
 * @property {string} feedback
 */
```

- **Ranh giới an toàn (`Boundaries`)**: `submissionService` **tuyệt đối không mutate XP** của người dùng. Mọi thao tác trao XP do `progressService` đảm nhận.

---

## 4. 🏆 Progress Service Contract (`PLANNED — Step 6.1`)

```js
/**
 * @typedef {Object} UserProgressRecord
 * @property {string} userId
 * @property {number} currentXp
 * @property {number} currentLevel
 * @property {string} title
 * @property {Record<string, boolean>} completedQuestions // Map questionId -> boolean
 * @property {Record<string, number>} masteryScores // Map questionId -> score
 * @property {number} streakDays
 * @property {string} lastActiveDate
 */

/**
 * @typedef {Object} AwardXpRequest
 * @property {string} userId
 * @property {string} questionId
 * @property {string} attemptId
 * @property {number} xpAmount
 * @property {'main_quest'|'practice'} mode
 */
```

### 4.1. Nguyên Tắc Idempotency (Chống Cộng Trùng XP)
- Thao tác `awardXp(request)` kiểm tra cờ `completedQuestions[questionId]`.
- Nếu bài học đã được hoàn thành từ trước, hệ thống trả về bản ghi tiến độ hiện tại mà **không cộng thêm XP cốt truyện**.
- Chế độ `practice` chỉ cập nhật điểm `masteryScores` nếu điểm mới cao hơn điểm cũ.

---

## 5. ⚡ SQL WASM Engine Contract (`CURRENT`)

Được xác minh tại Step 4.0–4.8.

### 5.1. Worker Request Transport
- Worker Request: `{ id: string, action: string, payload: unknown }`
- Worker Response: `{ id: string, ok: true, data: unknown }` hoặc `{ id: string, ok: false, error: { code: string, message: string, retryable: boolean } }`

### 5.2. Security Policy Guards
- **Read-Only Enforcer**: Chặn 100% các từ khóa `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `CREATE`, `VACUUM`, `PRAGMA`, `ATTACH`, `DETACH`.
- **Multi-Statement Guard**: Chặn thực thi nhiều hơn 1 câu lệnh SQL phân tách bởi dấu `;`.
- **Resource Limits**: Hard timeout 3000ms (giải phóng Worker) và truncation cap 500 rows.

---

## 6. 🔄 Subsystem Boundaries Summary

```text
UI Component ──> submissionService.submit(req) ──> tool Evaluator (pure)
                         │                                 │
                         ▼                                 ▼
                SubmissionResult                     Returns Feedback
             (potentialXp preview)                     & Correctness
                         │
                         ▼
        progressService.awardProgress(result)
                         │
                         ▼
               Idempotent XP Ledger
               & Level Up Event Trigger
```
