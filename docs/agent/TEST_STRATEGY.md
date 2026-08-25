# Test Strategy & Quality Assurance Architecture

> **Cập nhật lần cuối:** 24/08/2026
> **Mục tiêu:** Định hướng kiểm thử tự động, tiêu chuẩn regression test và quy định chạy test command theo từng phân vùng kiến trúc.

---

## 1. 🛠 Verified Test Tooling & Environment

- **Test Framework:** Vitest `^2.1.1` (local version `2.1.9`), React Testing Library `^16.0.0`, JSDOM environment.
- **Config Files:** `vite.config.js` (dùng `src/test/setup.js`) và `vitest.config.js` (dùng `src/tests/setup.js`). Giữ nguyên cấu hình hiện tại.

### Commands Chuẩn Khi Chạy Test:
```bash
# Chạy toàn bộ test suite (Non-watch mode)
npm test -- --run

# Targeted test cho Submission Gateway & Workspace
npm test -- --run src/services/mock/mockSubmissionService.test.js src/pages/learner/ExcelMissionPage.test.jsx src/pages/learner/SqlMissionPage.test.jsx

# Targeted test cho SQL Engine WASM & Policies
npm test -- --run src/utils/sql/sqlQueryPolicy.test.js src/utils/sql/sqlEngineAdapter.test.js src/utils/sql/sqlChecker.test.js
```

---

## 2. 🏛 Architectural Test Pyramid & Domain Boundaries

```text
               ▲
              / \     E2E Tests (Planned - Sprint 10)
             /   \    
            /-----\   Integration Tests (CURRENT - Workspace to Service Gateway)
           /       \  
          /---------\ Component Tests (CURRENT - SchemaBrowser, SqlEditor, FormulaBar)
         /-----------\ Unit Tests (CURRENT - pure excelChecker, sqlChecker, policy guards)
```

### Coverage Rule theo Module:
| Area | Module | Test Scope | Trạng Thái |
|---|---|---|---|
| `SHR` | Shared | UI primitives (`Button`, `Card`, `Skeleton`), RBAC route guards, Theme provider | `CURRENT` |
| `LRN-EXCEL` | Excel Workspace | `excelChecker.js` pure logic, `SpreadsheetGrid`, `FormulaBar`, `HintPanel` pin-to-fx | `CURRENT` |
| `LRN-SQL` | SQL Workspace | `sqlQueryPolicy.js` (12 keywords & multi-statement guard), SQLite Worker lifecycle, `SchemaBrowser`, `SqlEditor`, `ResultViewer`, `sqlChecker.js` | `CURRENT` |
| `LRN-SUB` | Submission Gateway | `submissionService` contract, `mockSubmissionService` mode `run`/`submit`, `clientAttemptId` replay guard, `potentialXp` preview (No XP mutation) | `CURRENT` |
| `CNT` | Content Domain | Content config extraction, `contentService` dynamic evaluation config loading | `PLANNED / Sprint 5` |
| `DATA` | Dataset Domain | Independent dataset registry loading & schema caching across questions | `PLANNED / Sprint 5` |
| `GAME` | Game Progress | Deterministic `levelingEngine.js` (Level 1–50), `progressService` idempotent XP ledger, dynamic `LearningMapPage` unlocking | `PLANNED / Sprint 6` |

---

## 3. 🎯 Specific Test Verification Rules

### 3.1. Submission Gateway Verification
- `run` mode: Trả về kết quả đánh giá công thức/query, `stepCompleted = false`, `potentialXp = 0`, không làm đổi state.
- `submit` mode: Trả về `stepCompleted`, `questionCompleted`, và `potentialXp` phần thưởng dự kiến. **Không mutate user XP**.
- `clientAttemptId`: Đảm bảo cùng một attempt ID không gửi request trùng lặp.
- Incorrect Answer: Trả về `feedbackCode` và `feedback` hiển thị inline UI, giữ nguyên câu trả lời người học đã gõ.

### 3.2. SQL WASM Engine Verification
- Security Guard: Bắt buộc test 100% các câu lệnh chứa `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `CREATE`, `VACUUM`, `PRAGMA`, `ATTACH`, `DETACH` hoặc có dấu `;`.
- Execution Timeout: Giả lập query nặng hoặc Cartesian join để xác minh ngắt timeout 3000ms và tự tái tạo Worker.
- Row Cap: Xác minh câu lệnh trả về hơn 500 dòng bị cắt gọn kèm cờ `truncated: true`.

---

## 4. 📊 Last Verified Baseline (Sprint 4 Gate)

- **Total Tests:** 222+ tests pass 100% trên 30+ test files.
- **WASM Production Build Gate:** Vite build thành công, `.wasm` asset đóng gói chính xác, preview server hoạt động ổn định.
- **Zero Regression Rule:** Không được phép làm vỡ bất kỳ test case nào của các Sprint 1–4 trước khi đóng bất kỳ Step nào trong tương lai.
