# Learning Map Domain Contract & Adapter Specification (Step 6.2)

## 1. Multi-Phase Journey Hierarchy

The Learning Map resolves the conceptual distinction between **Course** ("What courses are available?") and **Learning Map** ("Where am I in my learning journey?").

```text
Domain Progression Hierarchy
----------------------------
Learning Journey (All Courses / Tracks)
  ├── Phase 1: Excel Data Investigation
  │     ├── Chapter 1: Basic Formulas & Logic
  │     │     ├── Investigation 1.1 (Excel Workspace)
  │     │     └── Investigation 1.2 (Excel Workspace)
  │     └── Chapter 2: Pivot & Data Cleaning
  └── Phase 2: SQL Forensic Analysis
        ├── Chapter 1: SELECT & Filtering
        │     ├── Investigation 2.1 (SQL Workspace)
        │     └── Investigation 2.2 (SQL Workspace)
        └── Chapter 2: JOINs & Aggregations
```

---

## 2. Learning Journey Schema

```js
/**
 * @typedef {Object} PhaseNode
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {'excel'|'sql'} tool
 * @property {number} totalChapters
 * @property {number} totalInvestigations
 * @property {number} totalXp
 * @property {number} completionPercentage
 * @property {'completed'|'in_progress'|'locked'} status
 * @property {ChapterNode[]} chapters
 */

/**
 * @typedef {Object} LearningJourneyMap
 * @property {Object} journeySummary
 * @property {number} journeySummary.totalPhases
 * @property {number} journeySummary.totalChapters
 * @property {number} journeySummary.totalInvestigations
 * @property {number} journeySummary.totalXp
 * @property {number} journeySummary.overallProgress
 * @property {PhaseNode[]} phases
 */
```

---

## 3. UX Progression Rules

1. **Primary Navigation**: Navigating between phases occurs via **Phase Tabs** / Phase Headers rather than a hidden course dropdown.
2. **Current Phase Active Selection**: Defaults to the active phase containing the learner's first incomplete `current` Investigation node.
3. **Locking Rules**: Phases and chapters unlock according to `unlockRule` policies (`none` or `complete_previous`).
