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
- Không tìm thấy backend FastAPI/PostgreSQL, SQL engine/workspace, Admin Content Builder, Progress domain độc lập hoặc Analytics implementation.

## Target Architecture

```text
UI → stable service contract → Mock Service
                           └→ API Client → FastAPI → PostgreSQL
```

Mock Service và API Client phải giữ cùng public interface để Sprint 7 không yêu cầu viết lại UI. Evaluator chỉ đánh giá đáp án; Submission điều phối attempt/result; Progress trao XP có idempotency; backend về sau là nguồn sự thật cuối cùng.

## Intentionally Deferred

- SQL browser engine và SQL learner workspace: Sprint 4.
- XP/level/streak/achievement domain hoàn chỉnh: Sprint 5.
- Admin Content Builder: Sprint 6.
- FastAPI, PostgreSQL, authentication/persistence phía server và API migration: Sprint 7.
- Analytics, hardening và launch readiness: Sprint 8.
- Hosting/deployment details, backend repository layout và production observability: TBD.

## Documentation Status

Ngày 21/08/2026, Step 3.0–3.4 core đã `DONE`; audit UI mở Step 3.4E `READY` và Step 3.5 `PLANNED`. Sprint 3 đang ở UI stabilization và Sprint 4 chưa được kích hoạt. [CURRENT_TASK.md](./CURRENT_TASK.md) vẫn là nguồn trạng thái duy nhất cho agent.

Các file prompt/reference (`dataquest-project-prompts.md`, `docs/avi-mystery-codex-agent-md-generator.md`, `docs/avi-mystery-roadmap-review-sprint-3-8.md`) không phải status tracker.
