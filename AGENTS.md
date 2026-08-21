# Avi-Mystery — Repository Instructions

## Product Direction

- Nền tảng học dữ liệu theo hướng game hóa.
- Ưu tiên Excel trước, SQL tiếp theo.
- Python learning không thuộc phạm vi MVP hiện tại.
- Frontend dùng Mock Service trước khi chuyển sang API thật.

## Required Reading

Trước khi sửa code, đọc:

1. `docs/agent/CURRENT_TASK.md`
2. Tài liệu module được khai báo trong Current Task
3. `docs/agent/CONTRACTS.md` nếu task liên quan service hoặc dữ liệu dùng chung
4. `docs/agent/TEST_STRATEGY.md`

## Scope Rules

- Mỗi task có đúng một Primary Module.
- Chỉ sửa file trong Allowed Write Paths; Supporting Module mặc định là read-only.
- Read-only Paths chỉ được đọc. Không sửa Forbidden Paths.
- Không tự chuyển sang Sprint hoặc Step tiếp theo, refactor module không liên quan, hoặc đổi mock sang API.
- Thay đổi Shared Contract phải được ghi rõ trong Current Task và có đường dẫn cụ thể trong Allowed Write Paths.
- Nếu cần sửa ngoài phạm vi, dừng và báo blocker.

## Engineering Rules

- UI không được đọc trực tiếp mock JSON hoặc import trực tiếp mock/API adapter; UI gọi service qua contract và gateway ổn định.
- Mock và API client phải có cùng public interface.
- Evaluator không trực tiếp trao XP. Submission trả kết quả; Progress chịu trách nhiệm trao XP.
- Thao tác trao thưởng phải hỗ trợ idempotency khi triển khai.
- Không đưa secret vào source code hoặc tài liệu.

## Completion Gate

Không đánh dấu hoàn thành nếu Acceptance Criteria hoặc test liên quan chưa đạt, regression chưa được giải thích, có thay đổi ngoài phạm vi, hoặc loading/success/error/retry state cần thiết chưa được xử lý.

## Final Report

Mỗi lần hoàn thành task phải báo:

1. Scope đã thực hiện
2. File đã thay đổi
3. Test đã chạy và kết quả
4. Acceptance Criteria
5. Phần chưa làm
6. Risk hoặc blocker
