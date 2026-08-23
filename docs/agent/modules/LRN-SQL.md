# LRN-SQL — SQL Learning

## Responsibility

# LRN-SQL — SQL Learning

## Responsibility

SQL engine adapter/Worker, schema browser, editor, query result viewer, SQL evaluator và learner feedback riêng cho SQL.

## Non-responsibility

Không trao XP, không chạy query trên backend trong Sprint 4, không quản lý Admin content hoặc Excel evaluator.

## Current Status

- DONE — Step 4.0: Technical Spike & SQL Contracts
- DONE — Step 4.1A: WASM Packaging & Worker Transport
- DONE — Step 4.1B: Database Lifecycle, Seed, Reset & Schema API
- DONE — Step 4.1C: Read-only Query Policy, Timeout & Row Limit
- DONE — Step 4.2: Schema Browser
- IN_PROGRESS — Step 4.3: SQL Mission Shell, Loader & Route
- Related Sprint: 4
- Verified Paths: `src/components/sql/`, `src/utils/sql/`, `src/workers/sql/`

## Proposed Public Interfaces

- `sqlEngine.initialize()`
- `sqlEngine.loadDataset(dataset)`
- `sqlEngine.getSchema()`
- `sqlEngine.execute(query, options)`
- `sqlEngine.reset()`
- `sqlEngine.dispose()`

Execution trả envelope ổn định chứa `columns`, `rows`, `rowCount`, `truncated`, `executionMs`, `errorCode` và `message`. Engine/Dataset/Execution baseline đã được Step 4.0 xác minh; Mission/Checker/Submission proposal được triển khai ở các Step tương ứng.

## Dependencies

Chỉ SHR contracts/UI/utilities và LRN-SUB public interface. Shared không được phụ thuộc ngược LRN-SQL.

## Allowed Write Paths

- `src/components/sql/`
- `src/utils/sql/`
- `src/workers/sql/`
- `src/pages/learner/SqlMissionPage.jsx`
- `src/pages/learner/SqlMissionPage.test.jsx`
- `src/services/mock/mockSqlService.js`
- `src/mocks/data/sql/`

## Read-only Paths

- `src/mocks/data/missions.json`
- `src/mocks/data/steps.json`
- `src/services/contracts/`
- `src/services/index.js`
- `src/app/router/index.jsx`

## Forbidden Scope

Backend query execution, XP/progress mutation, Admin Content Builder, Python sandbox, OPFS persistence trong MVP và thay đổi Excel evaluator.

## Domain Rules

- SQL chạy trong browser ở MVP Sprint 4; không gửi query lên backend.
- SQLite là dialect MVP; database nhỏ chạy in-memory và được dựng lại từ deterministic seed.
- Worker/engine cần timeout, row limit, reset database, dispose và stable error mapping.
- Timeout cứng phải có recovery strategy; không giả định `setTimeout` có thể ngắt WASM đang chạy đồng bộ.
- User query chỉ được đọc dữ liệu; internal schema query tách khỏi user-query policy.
- SQL evaluator không trao XP và không bypass Submission Contract.
- Query policy phía browser là UX protection, không phải security boundary cho reward/backend.

## Required Test Coverage

Fake adapter unit tests; Worker/WASM browser integration; engine isolation; read-only policy; timeout/recovery; max rows; reset/dispose; syntax/runtime mapping; deterministic result comparison; submission modes; production asset loading và full Excel regression.

## Definition of Done

- [x] Step 4.0 decision/contracts pass trước implementation.
- [ ] Mỗi Step 4.1A–4.8 đạt Acceptance Criteria riêng.
- [ ] Một SQL Mission chạy end-to-end mà không mutate XP.
- [ ] Security/resource/browser/build và full regression gates pass.
- [ ] Không sửa ngoài scope; contract changes được ghi rõ.

## Known Risks

- `sql.js@1.14.2` và spike source đã có; product route/UI vẫn chưa tồn tại theo boundary Step 4.0.
- JSDOM không đại diện đầy đủ cho Worker/WASM; cần browser integration riêng.
- Read-only parsing, hard timeout/recovery và result equivalence (`NULL`, duplicate, order, tolerance) là các vùng risk cao.
- Editor dependency và route integration có thể làm tăng bundle hoặc ảnh hưởng Excel nếu không lazy-load/test boundary.

## Open Questions

Step 4.0 đã chốt engine package/version, Worker protocol, WASM asset path, schema format và error catalog. Canonical result comparison được giữ cho Step 4.6. CodeMirror/syntax highlighting là dependency gate riêng; controlled textarea là fallback MVP.
