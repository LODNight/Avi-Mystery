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
