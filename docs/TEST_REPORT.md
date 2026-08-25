# Báo Cáo Kiểm Thử Tự Động (Test Report)

> **Cập nhật lần cuối:** 25/08/2026
> **Công cụ kiểm thử:** Vitest 2.1.9 + React Testing Library 16.0.0 + JSDOM
> **Tổng số Test Suites:** 46 files
> **Tổng số Test Cases:** 316 passed / 0 failed

> **Sprint 6 note:** Step 6.1–6.3 đã `DONE`. Đã xác minh 100% Learning Map Domain Adapter (`learningMapAdapter.js`), Multi-Phase Navigation Tabs (`LearningMapPage.jsx`), Mastery Evaluator (`masteryEvaluator.js`), Single Source of Truth Hook (`useProgress.js`) và Skill Mastery Summary Card.

---

## 1. Kết Quả Chạy Kiểm Thử Tự Động (Summary by Area)

| Khu vực Kiểm thử | Số File Test | Số Test Cases | Kết quả |
|---|---:|---:|---|
| **Excel Domain & Workspace** | 7 | 73 | `PASS` |
| **SQL Engine & Workspace** | 12 | 109 | `PASS` |
| **Content, Dataset & Domain Contracts** | 8 | 48 | `PASS` |
| **Progress, Reward & Mastery Domain** | 5 | 20 | `PASS` |
| **Service Mocks & Adapters** | 7 | 35 | `PASS` |
| **Shared UI & Layouts** | 7 | 31 | `PASS` |
| **TỔNG CỘNG** | **46** | **316** | `PASS (100%)` |

---

## 2. Coverage Summary

- **Service Mocks**: Auth, course, mission, sqlMission, dataset, progress và submission contract/error/idempotency behavior.
- **Shared UI/Providers**: Skeleton, empty/error state, brand, page status và theme providers.
- **Learner Flow**: Courses, course detail, learning map multi-phase navigation tabs, mission intro, Excel workspace và SQL workspace.
- **Excel Domain**: Evaluator (`excelChecker.js`), spreadsheet grid, Formula Bar with pin-to-fx, toolbar, hints drawer và result victory modal.
- **SQL Domain**: WASM packaging, Worker lifecycle, query policy guard (10 keywords), Schema Browser, SqlEditor (soft-tab 2 spaces, Ctrl+Enter), ResultViewer (pagination, NULL formatting) và sqlChecker.
- **Progress & Mastery Domain (Sprint 6)**: Dynamic progress state management via `useProgress.js`, mode-aware attempts (`'main_quest'` vs `'practice'`), mastery level evaluation (Novice -> Master Detective) và skill summary card rendering trên `LearningMapPage.jsx`.

---

## 3. Lệnh Chạy Kiểm Thử

Command chuẩn từ `package.json`:

```bash
npm test -- --run
```

Chạy toàn bộ 46 test files trong dự án:

```bash
npx vitest run
```

Kết quả:
- **Test Files**: 46 passed (46)
- **Tests**: 316 passed (316)
- **Duration**: ~7.09s

---

## 4. Warnings

- React Router v6 phát cảnh báo future flags cho v7 (`v7_startTransition`, `v7_relativeSplatPath`).
- Các cảnh báo trên không làm test fail và nằm trong kế hoạch nâng cấp lộ trình tương lai.
