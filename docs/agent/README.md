# Agent Documentation Guide

Hệ thống này khóa mỗi lần làm việc vào đúng Sprint, Step và module. `CURRENT_TASK.md` là trạng thái thực thi duy nhất; roadmap chỉ mô tả kế hoạch dài hạn và không được dùng như một task đang hoạt động cạnh tranh.

## Required Flow

```text
Chọn Sprint/Step
→ cập nhật CURRENT_TASK.md
→ chọn module document
→ agent đọc phạm vi
→ implement
→ chạy test
→ cập nhật trạng thái
```

Khi chuyển Sprint hoặc Step, cập nhật [CURRENT_TASK.md](./CURRENT_TASK.md), rồi kiểm tra tài liệu module trong [modules/](./modules/) và contract/test liên quan. Không sửa roadmap chỉ để phản ánh trạng thái task ngắn hạn.

## Scope Vocabulary

- **Primary Module:** module duy nhất chịu trách nhiệm chính và quyết định scope của task.
- **Allowed Write Paths:** file hoặc thư mục cụ thể được phép tạo/sửa.
- **Read-only Paths:** dependency được phép khảo sát nhưng không thay đổi.
- **Forbidden Paths:** ranh giới cấm; nếu cần chạm vào phải dừng và xin đổi scope.

Supporting Module mặc định là read-only. Nếu task thực sự cần sửa module thứ hai, thêm đúng file của module đó vào Allowed Write Paths và ghi rõ contract impact. Nếu phạm vi lớn hơn một module, ưu tiên tách thành các task nối tiếp với một Primary Module cho mỗi task.

## Sources of Truth

- [CURRENT_TASK.md](./CURRENT_TASK.md): Sprint/Step/task đang được phép thực hiện.
- [MODULE_MAP.md](./MODULE_MAP.md): ownership, dependency và trạng thái module đã xác minh.
- [CONTRACTS.md](./CONTRACTS.md): boundary dùng chung; ví dụ Proposed không phải implementation hiện có.
- [TEST_STRATEGY.md](./TEST_STRATEGY.md): command và coverage gate.
- [DECISIONS.md](./DECISIONS.md): quyết định agent-facing; lịch sử ADR cũ vẫn ở [project ADR log](../DECISIONS.md).

Roadmap không tự kích hoạt công việc. Agent không tự chuyển task khi một checklist được hoàn thành.
