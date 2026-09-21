# Localization Inventory & Architecture Contract — Avi-Mystery

> **Last Updated:** 19/09/2026  
> **Status:** Phase 3.5 Completed — Foundation & Runtime Reactivity Operational  
> **Test Gate:** 76/76 test suites (586/586 tests PASS 100%), Build Vite SUCCESS  

---

## 1. Supported Languages
* **Default Language:** `vi` (Tiếng Việt)
* **Supported Language:** `en` (English)
* **Storage / Persistence:** `localStorage.getItem('i18nextLng')` with fallback to `vi`

---

## 2. Three-Layer Architectural Contract

| Layer | Responsibility | Technology / Tool | Mutability / Fallback Rules |
| :--- | :--- | :--- | :--- |
| **Layer A: Application UI** | Navigation, buttons, tooltips, dialogs, labels, error states | `i18next` + `react-i18next` (`t()`) | Key-based lookup per namespace. Language switch updates UI instantly. |
| **Layer B: Case Presentation** | Case narrative, briefings, clues, witness testimonies, report questions | `caseLocalizationService.js` | Raw case definition remains immutable bilingual (`{ en, vi }`). Resolves into a fresh localized case view. |
| **Layer C: Domain & Verification** | Dataset values, database cells, entity IDs, verification rules & expected values | Raw values / Verification Engine | **STRICTLY UNTRANSLATED.** Case-insensitive & numeric matching against raw verification rules (`ORD-1842`, `18420`, `4210`). |

---

## 3. UI Namespaces

| Namespace | Status | File Paths | Purpose |
| :--- | :--- | :--- | :--- |
| `nav` | **ACTIVE** | `src/locales/{lang}/nav.json` | TopBar, Sidebar, navigation labels, theme/language toggles |
| `investigation` | **ACTIVE** | `src/locales/{lang}/investigation.json` | Detective workspace, case headers, clues, evidence locker, report steps, HQ terminal |
| `workbench` | **ACTIVE** | `src/locales/{lang}/workbench.json` | Shared spreadsheet grid, formula bar, hints, diagnostics, action buttons |
| `common` | **ACTIVE** | `src/locales/{lang}/common.json` | Shared generic buttons, states, dates |
| `evidence` | *PLANNED* | `src/locales/{lang}/evidence.json` | Dedicated evidence board and dossier details |
| `practice` | *PLANNED* | `src/locales/{lang}/practice.json` | Standalone sandbox & practice challenges |
| `learning` | *PLANNED* | `src/locales/{lang}/learning.json` | Academy syllabus, markdown viewer, checkpoint quiz |
| `profile` | *PLANNED* | `src/locales/{lang}/profile.json` | Achievements, badges, certificate viewing, history |

---

## 4. Component Migration Matrix

| Component | Layer | Namespace / Method | Current Status |
| :--- | :--- | :--- | :--- |
| `LearnerTopBar.jsx` | Layer A | `useTranslation('nav')` + `i18n.changeLanguage()` | **MIGRATED** |
| `DetectiveWorkspacePage.jsx` | Layer A & B | `useTranslation('investigation')` + `caseContentService` | **MIGRATED** |
| `InvestigationWorkbench.jsx` | Layer A | `useTranslation('investigation')` & `workbench` | **MIGRATED** |
| `EvidencePanel.jsx` | Layer A & B | `useTranslation('investigation')` + localized sources | **MIGRATED** |
| `HQCommunicationPanel.jsx` | Layer A & B | `useTranslation('investigation')` + report definitions | **MIGRATED** |
| `VerificationResultPanel.jsx` | Layer A | `useTranslation('investigation')` | **MIGRATED** |
| `FormulaBar.jsx` | Layer A | `useTranslation('workbench')` + `<Trans>` for shortcuts | **MIGRATED** |
| `SpreadsheetGrid.jsx` | Layer A | `useTranslation('workbench')` | **MIGRATED** |
| `FindingCard.jsx` | Layer A | `useTranslation('investigation')` + dynamic locale dates | **MIGRATED** |
| `InvestigationNotebookDrawer.jsx` | Layer A | `useTranslation('investigation')` | **MIGRATED** |
| `case001.js` | Layer B & C | Bilingual `{en, vi}` for text; raw expected for verification | **MIGRATED** |
| `useDetectiveWorkspace.js` | Architecture | Decoupled content effect `[caseId, i18n.language]` from state effect | **MIGRATED** |

---

## 5. Surface Rollout Status

| Application Surface | Migration Status | Notes |
| :--- | :--- | :--- |
| **Detective Workspace (`/cases/:id/investigate`)** | **100% MIGRATED** | Complete 3-column workspace with bilingual Case 001 |
| **Shared Excel Tools (`FormulaBar`, `Grid`)** | **100% MIGRATED** | Localized tooltips, diagnostics, aria labels, shortcuts |
| **Practice Sandbox (`/sandbox`)** | **COMPATIBLE** | Tests verified with i18n test setup |
| **Academy Courses (`/academy`)** | *TODO* | Target for upcoming sprint |
| **Dashboard (`/dashboard`)** | *TODO* | Target for upcoming sprint |
| **Learning Map (`/map`)** | *TODO* | Target for upcoming sprint |
| **Profile & Achievements (`/profile`)** | *TODO* | Target for upcoming sprint |
| **Admin Studio (`/admin`)** | *TODO* | Target for upcoming sprint |
