# Legacy Step / Mission to Question Mapping Specification

This document details the exact field-level and architectural mapping between legacy `Mission` / `Step` records and the new `Question` domain entities introduced in Sprint 5 (Step 5.4).

---

## Architectural Responsibility Separation

```
┌────────────────────────────────────────────────────────┐
│ Question Domain Entity                                 │
│ - Describes learning content & metadata ONLY           │
│ - Contains prompt, checkerConfig, hints, reward config │
│ - DOES NOT execute evaluator or grant XP               │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Submission Service                                     │
│ - Evaluates attempt against checkerConfig              │
│ - Returns submission evaluation result                 │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Progress & Reward Service                              │
│ - Records learner state                                │
│ - Grants XP & unlocks next Question / Investigation    │
└────────────────────────────────────────────────────────┘
```

---

## Field Mapping Reference Table

| Legacy `Mission` / `Step` Property | `Question` Property | Type | Description / Transformation |
| :--- | :--- | :--- | :--- |
| `id` (resolved via `contentIdentity`) | `questionId` / `id` | `string` | Deterministic entity ID with prefix `q-` (e.g. `q-001`). |
| (resolved graph) | `investigationId` | `string` | Parent Investigation entity ID (`inv-001`). |
| `datasetId` | `datasetId` | `string` | Domain reference to reusable Dataset entity (`ds-001`, `sql-sales-v1`). |
| (topic / category) | `skillId` | `string` | Skill identity taxonomy (`skill-excel-formula`, `skill-sql-select`). |
| `difficulty` | `difficulty` | `string` | Difficulty level (`beginner`, `intermediate`, `advanced`). |
| `tool` | `type` | `string` | Assessment type (`excel_formula`, `sql_query`, `multiple_choice`). |
| `task` / `description` | `prompt` | `string` | Question prompt / instruction given to the learner. |
| `targetCell`, `expectedResult`, `initialFormula` | `checkerConfig` | `object` | Evaluation criteria (target cell, expected answer, starter content). |
| `hint` | `hints` | `array` | Unlockable hints array (`[{ id: 'hint-1', text: '...' }]`). |
| `reward` / `xp` | `rewards` | `object` | Static reward metadata (`{ baseXp: 100 }`). |
| `id` (legacy) | `legacyMissionId` | `string` | Preserved reference to legacy mission ID (`mission-001`). |

---

## Legacy Graph Resolution Examples

1. **Excel Mission Question (`mission-001` -> `q-001`)**:
   - `questionId`: `q-001`
   - `investigationId`: `inv-001`
   - `datasetId`: `ds-001`
   - `type`: `excel_formula`
   - `prompt`: "Tính tổng doanh thu..."
   - `checkerConfig`: `{ targetCell: 'D10', expectedResult: 15000, initialFormula: '=SUM(...)' }`
   - `hints`: `[{ id: 'hint-1', text: 'Sử dụng hàm SUM' }]`
   - `rewards`: `{ baseXp: 100 }`
   - `legacyMissionId`: `mission-001`

2. **SQL Mission Question (`mission-010` -> `q-010`)**:
   - `questionId`: `q-010`
   - `investigationId`: `inv-010`
   - `datasetId`: `sql-sales-v1`
   - `type`: `sql_query`
   - `prompt`: "Truy vấn danh sách đơn hàng..."
   - `checkerConfig`: `{ expectedResult: [...], allowedTables: ['orders'] }`
   - `hints`: `[{ id: 'hint-1', text: 'Sử dụng SELECT * FROM orders' }]`
   - `rewards`: `{ baseXp: 100 }`
   - `legacyMissionId`: `mission-010`

---

## Architectural Guarantees
- **Pure Content Descriptor**: Question entity is strictly read-only content metadata.
- **Independent Evaluation**: Evaluation and XP rewarding remain in Submission and Progress services.
- **Backward Compatibility**: Legacy Mission/Step workspaces continue operating using the same data sources.
