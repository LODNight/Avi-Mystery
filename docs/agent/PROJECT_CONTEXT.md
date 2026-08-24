# Project Context

## Product

- **Name:** Avi-Mystery.
- **Vision:** nền tảng luyện kỹ năng dữ liệu theo hướng game hóa; người học đóng vai thám tử giải vụ án dữ liệu.
- **Users:** learner và content/super admin.
- **Main areas:** Learner và Admin.
- **MVP learning focus:** Excel trước, SQL tiếp theo; Python learning cố ý nằm ngoài MVP hiện tại.

## Verified Current Architecture

- React 18 và JavaScript ES modules, build bằng Vite; Tailwind CSS cho styling và React Router v6 cho routing.
- Vitest, React Testing Library và JSDOM cho unit/component tests.
- Frontend dùng local React state/context và `localStorage`; không tìm thấy Redux/Zustand.
- Service contracts hiện có tại `src/services/contracts/`; mock adapters tại `src/services/mock/`; gateway chọn adapter tại `src/services/index.js`.
- `src/services/api/index.js` chỉ là API stub. Luồng Excel Submission đi qua gateway `src/services/index.js`; `ExcelMissionPage.jsx` không import mock adapter trực tiếp.
- Excel workspace, evaluator, shared submission contract, mock orchestration và feedback UI của Step 3.4 đã hoàn thành. Submission chỉ trả `potentialXp`, không cập nhật XP.
- SQL workspace, SQLite WASM Worker engine, Schema Browser (`SchemaBrowser.jsx`), SQL Editor MVP (`SqlEditor.jsx`) và tuyến đường cách ly `/missions/:missionId/sql` (`SqlMissionPage.jsx`) của Step 4.0–4.4 đã hoàn thành.
- Không tìm thấy backend FastAPI/PostgreSQL, Admin Content Builder, Progress domain độc lập hoặc Analytics implementation.

## Target Architecture

```text
UI → stable service contract → Mock Service
                           └→ API Client → FastAPI → PostgreSQL
```

Mock Service và API Client phải giữ cùng public interface để Sprint 7 không yêu cầu viết lại UI. Evaluator chỉ đánh giá đáp án; Submission điều phối attempt/result; Progress trao XP có idempotency; backend về sau là nguồn sự thật cuối cùng.

## Intentionally Deferred

- SQL Query Execution & Result Viewer, Result Checker: Sprint 4 Step 4.5+; engine/Worker/SchemaBrowser/SqlEditor/route đã có ở Step 4.0–4.4.
- XP/level/streak/achievement domain hoàn chỉnh: Sprint 5.
- Admin Content Builder: Sprint 6.
- FastAPI, PostgreSQL, authentication/persistence phía server và API migration: Sprint 7.
- Analytics, hardening và launch readiness: Sprint 8.
- Hosting/deployment details, backend repository layout và production observability: TBD.

## Documentation Status

Ngày 24/08/2026, Step 3.0–4.4 đã `DONE`. Step 4.4 chốt SQL Editor MVP (`SqlEditor.jsx`) với starter query initialization, Reset query, soft Tab 2-spaces, phím tắt `Ctrl+Enter` và Detective Amber theme styling. `CURRENT_TASK.md` là nguồn trạng thái duy nhất cho agent.

`dataquest-project-prompts.md` là reference đầu vào, không phải status tracker. Các tài liệu vận hành canonical nằm trong `docs/agent/` và bộ tracker ngắn ở `docs/`.
