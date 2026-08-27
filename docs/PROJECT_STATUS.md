# Trạng Thái Dự Án Avi-Mystery

> **Cập nhật lần cuối:** 27/08/2026
> **Nguồn task hiện tại:** [`agent/CURRENT_TASK.md`](./agent/CURRENT_TASK.md)

---

## 1. Tổng Quan Tiến Độ

| Hạng mục | Trạng thái |
|---|---|
| **Kiến trúc** | Domain-Driven: `Course → Phase → Chapter → Investigation → Question` |
| **Sprint hoàn thành** | Sprint 1 → 6 (100%) + Sprint 6.5–6.6 Onboarding & Guided Tour |
| **Sprint hiện tại** | **Sprint 7 — Learner Engagement & Practice Engine** |
| **Test suite** | `110 / 110` tests PASS (Vitest 2.1.9) — cập nhật 27/08/2026 |
| **Build** | `npm run build` PASS — không lỗi biên dịch |

---

## 2. Lịch Sử Sprint & Trạng Thái

| Sprint | Tên | Trạng thái |
|---|---|---|
| **Sprint 1** | Frontend Foundation & RBAC | `DONE` |
| **Sprint 2** | Course, Learning Map & Admin | `DONE` |
| **Sprint 3** | Excel Vertical Slice | `DONE` |
| **Sprint 4** | SQL Vertical Slice (WASM + Worker) | `DONE` |
| **Sprint 5** | Content Domain & Dataset Decoupling | `DONE` |
| **Sprint 6** | Game Progress & Progression Architecture | `DONE` |
| **Sprint 6.5** | Learner Onboarding & First-Run Experience | `DONE` |
| **Sprint 6.6** | Dashboard Deep Guided Tour Refinement | `DONE` |
| **Sprint 6.7** | Admin Onboarding Dev Testing Tools | `DONE` |
| **Sprint 7.1** | Level Up Popups & Streak Counter Engine | `DONE` |
| **Sprint 7.2** | Standalone Practice Workspace | `PROPOSED` |
| **Sprint 7.3** | Learner Profile & Achievement Badges | `PROPOSED` |
| **Sprint 8** | Admin Content Studio | `PROPOSED` |
| **Sprint 9** | Backend API & Persistence (FastAPI) | `PROPOSED` |

---

## 3. Feature Coverage Matrix

| ID | Area | Feature | Sprint | Test |
|---|---|---|---|---|
| `SHR-AUTH-001` | Auth | RBAC Guard (`RequireAuth`, `RequireLearner`, `RequireAdmin`) | 1 | PASS |
| `SHR-AUTH-002` | Auth | Design System Detective Amber (Light/Dark) | 1 | PASS |
| `SHR-UI-001` | UI | Standard UI Components (`Button`, `Card`, `Input`, `Badge`) | 1 | PASS |
| `SHR-UI-002` | UI | Accessible Loading Skeletons (`aria-busy`) | 1 | PASS |
| `LRN-COURSE-001` | Course | Danh sách & Chi tiết Khóa học | 2 | PASS |
| `LRN-MAP-001` | Map | Learning Map — Multi-Phase Navigation | 2 | PASS |
| `LRN-EXCEL-001` | Excel | Excel Mission Workspace | 3 | PASS |
| `LRN-SQL-4.x` | SQL | SQL Engine (WASM Worker, Policy, Checker) | 4 | PASS |
| `CNT-INV-5.3` | Content | Investigation Domain Contract | 5 | PASS |
| `DATA-REG-5.1` | Dataset | Independent Dataset Registry | 5 | PASS |
| `LRN-PRG-5.6` | Progress | Learner Progress State & XP | 5 | PASS |
| `RWD-XP-5.7` | Reward | Idempotent XP Ledger | 5 | PASS |
| `MST-SKL-5.8` | Mastery | Skill Mastery Evaluator | 5 | PASS |
| `MAP-ADP-6.1` | Map | Learning Map Domain Adapter | 6 | PASS |
| `MAP-UX-6.2` | Map | Learning Map UX (Phase Tabs) | 6 | PASS |
| `MST-ENG-6.3` | Mastery | Practice Engine & Mastery Hook | 6 | PASS |
| `ONB-6.5` | Onboarding | Welcome Gate & Tutorial Case 0 | 6.5 | PASS |
| `TOUR-6.6` | Tour | Dashboard 5-Step Guided Tour | 6.6 | PASS |
| `DEV-6.7` | Dev Tools | Admin Reset Tour Testing Tools | 6.7 | PASS |
| `GAM-7.1` | Gamification | Level Up Modal & Streak Detail Modal | 7.1 | PASS |

---

## 4. Công Cụ Dev Testing (Sprint 6.7)

Các nút reset onboarding để test luồng hướng dẫn mà không cần tạo tài khoản mới:
- **`/admin/settings`** → Card "Công cụ Dev: Test Chế độ Hướng dẫn Onboarding"
- **`/admin`** → Nút "🧪 Test Onboarding Mode" trong header
- **`/login`** → Nút "🧪 Test Luồng Hướng Dẫn" trong khu vực DEV ONLY

---

## 5. Kiến Trúc Quyết Định Chính (Tóm tắt ADR)

| ADR | Quyết định | Xem chi tiết |
|---|---|---|
| ADR-001 | React + Vite + Tailwind + Vitest | [`DECISIONS.md`](./DECISIONS.md) |
| ADR-002 | Mock Adapter → API Adapter Gateway | [`DECISIONS.md`](./DECISIONS.md) |
| ADR-003 | RBAC Route Guards | [`DECISIONS.md`](./DECISIONS.md) |
| ADR-004 | SQLite WASM Worker + Policy Guard | [`DECISIONS.md`](./DECISIONS.md) |
| ADR-005 | Domain-Driven Architecture Sprint 5 | [`DECISIONS.md`](./DECISIONS.md) |
| ADR-006 | Submission ≠ XP; Progress trao XP | [`DECISIONS.md`](./DECISIONS.md) |

> Xem chi tiết quyết định agent tại [`agent/DECISIONS.md`](./agent/DECISIONS.md) và [`agent/CONTRACTS.md`](./agent/CONTRACTS.md).
