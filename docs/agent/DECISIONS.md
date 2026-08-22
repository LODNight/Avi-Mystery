# Agent Decision Log

Lịch sử kiến trúc trước hệ thống này nằm tại [docs/DECISIONS.md](../DECISIONS.md). File này chỉ ghi quyết định scope/contract dùng để điều phối agent; không xóa hoặc thay thế lịch sử cũ.

## ADR-AGT-001 — Excel trước SQL; Python ngoài MVP

- Status: Accepted
- Date: 2026-08-21
- Context: Product direction cần thứ tự học rõ để tránh mở rộng scope.
- Decision: Hoàn thiện Excel trước SQL; Python learning không thuộc MVP hiện tại.
- Consequences: Không tự triển khai SQL trước khi task Sprint 4 được kích hoạt hoặc thêm Python learning.
- Related modules: LRN-EXCEL, LRN-SQL

## ADR-AGT-002 — Mock Service và API Client cùng interface

- Status: Accepted
- Date: 2026-08-21
- Context: Frontend được phát triển với mock trước backend Sprint 7.
- Decision: UI dùng stable service gateway; mock và API client implement cùng public interface.
- Consequences: Không import mock JSON/adapter trực tiếp trong UI; migration API không yêu cầu viết lại UI.
- Related modules: LRN-SUB, BE, SHR

## ADR-AGT-003 — Submission không trực tiếp trao XP

- Status: Accepted
- Date: 2026-08-21
- Context: Reward cần ownership và idempotency riêng.
- Decision: Submission trả evaluation/completion và `potentialXp`; Progress trao XP.
- Consequences: Mock Submission Step 3.4 không mutate XP; Progress Sprint 5 phải xử lý reward idempotency.
- Related modules: LRN-SUB, GAME, BE

## ADR-AGT-004 — Inline feedback cho lỗi thường; modal cho completion

- Status: Accepted
- Date: 2026-08-21
- Context: Modal cho mọi câu trả lời sai làm gián đoạn vòng lặp học.
- Decision: Validation/sai thông thường dùng inline feedback; modal ưu tiên hoàn thành Step/Mission.
- Consequences: Step 3.4 dùng inline feedback cho validation/incorrect/service error và success-only modal có quản lý focus/Escape.
- Related modules: LRN-EXCEL, LRN-SUB, SHR

## ADR-AGT-005 — Không tạo source folder rỗng cho module Planned

- Status: Accepted
- Date: 2026-08-21
- Context: Folder rỗng làm module roadmap trông như implementation thật.
- Decision: Module Planned chỉ có tài liệu trong `docs/agent/modules/` cho đến khi task tạo source được duyệt.
- Consequences: LRN-SQL, BE và ANL chưa có source module riêng.
- Related modules: LRN-SQL, BE, ANL

## ADR-AGT-006 — Canonical submission error catalog

- Status: Accepted
- Date: 2026-08-21
- Context: Mock/API cần error code và payload ổn định để UI không parse message.
- Decision: Dùng catalog và `{ data, error }` payload trong [CONTRACTS.md](./CONTRACTS.md).
- Consequences: API Sprint 7 phải map về cùng code/interface; message có thể thay đổi nhưng code không đổi tùy tiện.
- Related modules: LRN-SUB, BE, SHR

## ADR-AGT-007 — Sprint 4 bắt đầu bằng Technical Spike

- Status: Accepted
- Date: 2026-08-22
- Context: Scope Step 4.1 cũ gộp package/WASM/Worker/policy/schema/UI/route trong khi contract và write paths chưa hợp lệ.
- Decision: Step 4.0 là gate bắt buộc; product implementation chỉ bắt đầu từ Step 4.1A sau khi engine, Worker, contracts và policy được chốt.
- Consequences: Roadmap Sprint 4 được tách thành Step 4.0–4.8; không tạo SQL UI/route trong Step 4.0.
- Related modules: LRN-SQL, SHR, LRN-SUB

## ADR-AGT-008 — SQL MVP dùng sql.js Worker và database in-memory

- Status: Accepted
- Date: 2026-08-22
- Context: Query có thể block UI; database bài học nhỏ và cần reset xác định, không cần persistence thiết bị.
- Decision: Dùng `sql.js@1.14.2` (MIT, zero runtime dependencies) với SQLite WASM trong dedicated module Worker. Database chạy in-memory, tạo lại từ deterministic JSON seed; OPFS nằm ngoài MVP Sprint 4.
- Rationale: `sql.js` có API `Database` nhỏ, phù hợp seed/reset và Vite có thể đóng gói loader + WASM bằng asset URL. `@sqlite.org/sqlite-wasm` vẫn là lựa chọn mạnh khi cần SQLite Wasm APIs/OPFS sâu hơn, nhưng độ phức tạp Worker/persistence không mang lợi ích cho dataset học tập nhỏ của MVP.
- Consequences: SQLite là dialect học tập của Sprint 4. Default query timeout là 2000ms; timeout cứng terminate/recreate Worker và nạp lại seed. Default result limit là 500 rows, hard cap 5000. Worker protocol dùng request ID; không dùng OPFS/CDN/backend execution.
- Related modules: LRN-SQL

## ADR-AGT-009 — SQL tái sử dụng Submission Contract

- Status: Accepted
- Date: 2026-08-22
- Context: Tạo Submission Service riêng cho SQL sẽ phá gateway và idempotency boundary đã ổn định.
- Decision: SQL Result Checker là evaluator riêng nhưng Submit đi qua shared `submissionService`; Step 4.7 dùng Primary Module `LRN-SUB`.
- Consequences: `run` không complete, `submit` chỉ trả `potentialXp`, không mutate XP; contract changes cần path và Acceptance Criteria rõ.
- Related modules: LRN-SQL, LRN-SUB, GAME, BE
