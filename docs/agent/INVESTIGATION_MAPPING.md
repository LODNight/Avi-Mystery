# Legacy Mission to Investigation Mapping Specification

This document details the exact field-level and architectural mapping between legacy `Mission` records and the new `Investigation` domain entities introduced in Sprint 5 (Step 5.3).

---

## Content Domain Hierarchy

```
Course
 └── Phase
      └── Chapter
           └── Investigation  (Narrative Learning Unit)
                └── Question  (Evaluation / Challenge Unit)
                     └── Dataset  (Reusable Shared Asset)
```

---

## Field Mapping Reference Table

| Legacy `Mission` Property | `Investigation` Property | Type | Description / Transformation |
| :--- | :--- | :--- | :--- |
| `id` (e.g. `mission-001`) | `legacyMissionId` | `string` | Preserved reference to legacy mission ID. |
| `id` (resolved via `contentIdentity`) | `investigationId` / `id` | `string` | Deterministic entity ID with prefix `inv-` (e.g. `inv-001`). |
| `chapterId` | `chapterId` | `string` | Domain reference to parent Chapter entity (e.g. `ch-001`). |
| `datasetId` | `datasetId` | `string` | Domain reference to reusable Dataset entity (`ds-001`, `sql-sales-v1`). |
| `title` | `title` | `string` | Display title of the investigation. |
| `story` / `description` | `narrative` / `story` | `string` | Detective narrative context surrounding the case. |
| `objective` | `objective` | `string` | Primary goal/objective of the investigation. |
| `orderIndex` | `ordering` / `orderIndex` | `number` | Display and sorting order within parent Chapter. |
| `status` | `status` | `string` | Availability status (`published`, `draft`). |
| (resolved graph) | `questionIds` | `string[]` | Array of child Question entity IDs (`['q-001']`). |
| `tool`, `difficulty` | `metadata` | `object` | Secondary metadata including engine type (`excel`/`sql`) and difficulty. |

---

## Legacy Graph Resolution Examples

1. **Excel Mission (`mission-001`)**:
   - `legacyMissionId`: `mission-001`
   - `investigationId`: `inv-001`
   - `chapterId`: `ch-001`
   - `datasetId`: `ds-001`
   - `questionIds`: `['q-001']`
   - `tool`: `excel`

2. **SQL Mission (`mission-010` / `sql-mission-01`)**:
   - `legacyMissionId`: `mission-010` (or `sql-mission-01`)
   - `investigationId`: `inv-010` (or `inv-sql-01`)
   - `chapterId`: `ch-004`
   - `datasetId`: `sql-sales-v1`
   - `questionIds`: `['q-010']`
   - `tool`: `sql`

---

## Architectural Guarantees
- **No Data Duplication**: Datasets are referenced by `datasetId` and not embedded inside Investigation objects.
- **Backward Compatibility**: Existing Mission-based components and tests continue working unaffected while new features target the `Investigation` contract.
