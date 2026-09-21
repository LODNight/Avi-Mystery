# DETECTIVE WORKSPACE — UX SPECIFICATION

> **Sprint 1 Deliverable**
> Mô tả tương tác và vùng không gian của Detective Workspace.
> Cấu trúc component được suy ra từ đây, không phải ngược lại.
>
> **Version:** 1.0 — 2026-09-18

---

## 1. CORE QUESTION

> What does an investigator need to **see**, **know**, and **do** during an investigation?

| Need | Description |
|---|---|
| **See** | The case context, available sources, and evidence clearly separated from the investigation workspace |
| **Know** | What happened, what is still unknown, what is being investigated right now |
| **Do** | Examine sources, inspect evidence using tools, form findings, communicate with HQ, submit a report |

These three needs define the workspace regions. Component boundaries follow from them.

---

## 2. WORKSPACE REGIONS

The Detective Workspace is divided into **functional regions**, not panels. The physical layout of regions adapts to screen size and active case type.

### 2.1 Case File Region

**Purpose:** Ground the investigator in the case context at all times.

Contains:
- Case number and title
- Investigation status (Open / Investigating / Report Submitted / Case Closed)
- Briefing — what happened (narrative, past tense)
- Objective — what needs to be discovered (directive, specific)
- Available sources list (does not display source content — only titles and types)

**Behavior rules:**
- Always visible or accessible when the workspace is open
- Does not reveal investigation techniques (no mention of Excel/SQL/formulas)
- Status updates as the investigation progresses
- Objective language describes the discovery goal, not a technical task

**Example:**
```
CASE #001
Illegal Coffee Delivery

STATUS: Investigation in progress

BRIEFING:
The warehouse supervisor filed a report stating 18,420kg of coffee
was shipped during May. However, internal procurement records show
only 14,210kg was authorized. The discrepancy has not been explained.

OBJECTIVE:
Identify which shipment order contains the unauthorized quantity,
and determine the destination and responsible manager.

SOURCES:
  [Document] Warehouse Shipping Records
  [Report]   Monthly Procurement Authorization
  [Witness]  Supervisor Statement
```

### 2.2 Sources Region

**Purpose:** List and access the evidence materials available to the investigator.

Each source has:
- A type (Document, Witness Statement, System Log, Field Note, Message, Photo, Archive, Report)
- A title
- A brief description (what it is, not what it contains)
- An open/viewed state

**Behavior rules:**
- Sources are listed, not immediately shown
- Clicking/selecting a source opens it in the Evidence Region
- Sources can be revisited multiple times, in any order
- A source type determines how it is displayed in Evidence (table, text, image, etc.)

**Does NOT:**
- Reveal the answer
- Guide the learner to inspect sources in a specific order (unless the case requires it)
- Use technical tool language ("load into Excel", "run a SQL query")

### 2.3 Evidence Region

**Purpose:** Display the content of a selected source so the investigator can examine it.

What it renders (depending on source type):
- `table` → SpreadsheetGrid (for structured data)
- `sql_table` → SchemaBrowser + ResultViewer (for SQL database evidence)
- `text` → formatted document/text block
- `image` → image viewer (future)
- `log` → structured log viewer (future)

**Behavior rules:**
- One source is active at a time; tabs allow switching between recently opened sources
- Investigator can scroll, inspect, and examine freely — no "correct" path enforced
- Evidence is read-only from the narrative perspective (but investigation tools can operate on it)
- Evidence can be pinned to the Investigation Notebook

**Design principle:**
> The evidence region shows *what the data says*, not *what to do with it*.

### 2.4 Investigation Region

**Purpose:** The active workspace where the investigator applies tools to examine evidence.

Contains:
- Tool workspace appropriate to the case type (Formula Bar + Spreadsheet for Excel; SQL Editor for SQL)
- Results of the current analysis
- Investigation actions (run analysis, fill down, reset)

**Behavior rules:**
- The tool workspace is presented as an *instrument of investigation*, not a lesson
- There is no "target cell" indicator or instructional overlay in the UI
- The investigator uses the tool to answer their own hypothesis, not to complete a checklist
- Results feed into the investigator's understanding, not into a PASS/FAIL checker

**Language:**
- ❌ "Complete the formula in cell E2"
- ✅ The investigator notices a discrepancy and uses the tool to verify it

### 2.5 HQ Communication

**Purpose:** The investigator's channel to headquarters — for assistance, reporting, and receiving new information.

**It is NOT:**
- A settings menu
- A progress bar
- A submit button

**It IS:**
- An official communication terminal

**Entry point:** A single persistent trigger available from the workspace:
```
📡 HQ COMMUNICATION
```

When opened, shows:
```
📡 HQ COMMUNICATION

CASE #001 — Illegal Coffee Delivery
STATUS: Investigation in progress

─────────────────────────────────

📓 NOTEBOOK
  Record theories and observations

💡 REQUEST HINT
  Contact HQ for investigative assistance

📎 EVIDENCE LOCKER
  Review collected and pinned evidence

📡 SEND REPORT
  Submit your current investigation findings

─────────────────────────────────
              [ CLOSE ]
```

**Behavior rules:**
- Opens as an overlay panel/modal — does NOT replace the investigation workspace
- Closing HQ Communication returns the investigator to exactly where they were
- All investigation state is preserved when HQ panel opens or closes
- SEND REPORT leads to the structured Investigation Report form

---

## 3. USER JOURNEY

```
[Investigator opens case]
         ↓
[Case File Region visible — reads briefing and objective]
         ↓
[Notices available sources]
         ↓
[Opens first source → Evidence Region populates]
         ↓
[Examines evidence using tools in Investigation Region]
         ↓
[Forms a hypothesis — records in Notebook]
         ↓
[Opens another source to cross-reference]
         ↓
[Uses tool again to verify]
         ↓
[Has a finding — opens 📡 HQ COMMUNICATION]
         ↓
[Selects SEND REPORT → Investigation Report form opens]
         ↓
[Fills in finding fields]
         ↓
[Submits report to HQ]
         ↓
[VERIFYING... → HQ response]
         ↓
[CASE PROGRESS: new lead] OR [REPORT RETURNED: continue investigating]
         ↓
[If new lead: Phase 2 unlocked]
         ↓
[Continues investigating → Phase 2 SEND → Final Verdict]
         ↓
[CASE CLOSED]
```

The investigator can revisit any source at any time. The journey is non-linear within a phase.

---

## 4. CASE FILE BEHAVIOR

- The case file is the **anchor** of the workspace. It defines what the investigation is about.
- It does not change as the investigator examines evidence or uses tools.
- It updates when: a phase is completed (status badge changes), or HQ sends a response (new information may be added to briefing, or a new lead is visible).
- Objective language must be neutral to the tool: it describes *what needs to be discovered*, not *how to discover it*.

---

## 5. SOURCE BEHAVIOR

| Aspect | Behavior |
|---|---|
| **Types** | Document, Witness Statement, Message, Report, Photo, Archive, System Log, Field Note |
| **Selection** | Click to open in Evidence Region |
| **Revisiting** | Always allowed — sources can be re-opened |
| **Status** | Viewed / Unviewed (not "completed") |
| **Order** | Listed in case configuration order; not sequentially enforced |
| **Future** | Sources can be unlocked progressively as phases advance |

---

## 6. EVIDENCE BEHAVIOR

| Aspect | Behavior |
|---|---|
| **Display** | Determined by source type — table, text, image |
| **Interaction** | Read and examine freely; tool operations happen in Investigation Region |
| **Tabs** | Multiple recently-opened sources can be tabbed |
| **Pin** | Evidence or specific cells/records can be pinned to Notebook |
| **Consistency** | Same evidence renders consistently regardless of which tool is active |

---

## 7. INVESTIGATION BEHAVIOR

| Aspect | Behavior |
|---|---|
| **Tool type** | Determined by case configuration (excel, sql, text) |
| **Freedom** | Investigator can run analyses freely without triggering verification |
| **No PASS/FAIL** | Tool results do not produce correct/incorrect feedback |
| **Notebook** | Investigator can note findings at any time |
| **Reset** | Tool state can be reset without affecting case or report state |

---

## 8. HQ COMMUNICATION BEHAVIOR

| State | Condition |
|---|---|
| `HQ_CLOSED` | Default state |
| `HQ_OPEN` | Panel is visible, workspace visible behind |
| `NOTEBOOK_OPEN` | Notebook view within HQ |
| `HINT_OPEN` | HQ assistance request view |
| `EVIDENCE_LOCKER_OPEN` | Pinned evidence review |
| `REPORT_OPEN` | Investigation Report form |

**Transitions:**
- `HQ_CLOSED` → `HQ_OPEN`: click 📡 HQ COMMUNICATION trigger
- `HQ_OPEN` → any section: click section button
- Any section → `HQ_OPEN`: click Back
- `HQ_OPEN` → `HQ_CLOSED`: click Close or press Escape

**Investigation state preservation:**
- Opening HQ panel must NOT reset tool state
- Closing HQ panel must NOT lose report draft
- Report draft persists across HQ open/close cycles

---

## 9. REPORT ENTRY FLOW

```
Click SEND REPORT (in HQ panel)
        ↓
Investigation Report form appears (within HQ panel, or full overlay)
        ↓
[Pre-filled fields displayed as locked — read-only]
[Empty fields available for investigator input]
        ↓
Investigator types findings
        ↓
[Required validation: empty required fields highlighted before submit]
        ↓
Click SEND REPORT button
        ↓
Report locked (read-only) during verification
        ↓
Verification result displayed
```

**Report language:**
- Form title: "INVESTIGATION REPORT — CASE #001"
- Submit button: "SEND REPORT"
- Not: "Submit Answer", "Check", "Submit", "Confirm"

---

## 10. RESPONSIVE BEHAVIOR

| Viewport | Layout |
|---|---|
| **Desktop ≥ 1280px** | Case File sidebar (left) + Evidence + Investigation split (center/right) |
| **Tablet 768–1280px** | Tabbed interface: Case File / Evidence / Investigation |
| **Mobile < 768px** | Single panel with tab switcher; HQ accessible via floating button |

HQ Communication panel:
- Desktop: slides in from right as an overlay, workspace remains visible
- Mobile: full-screen modal

---

## 11. VISUAL LANGUAGE

- Follows existing **Detective Amber** design system (amber tones, dark/light mode, CSS variables)
- Case File and Sources use muted, document-like aesthetic
- Evidence Region is clean and data-focused
- Investigation Region uses neutral workspace aesthetic
- HQ Communication panel uses a distinct "communication terminal" visual language
- Investigation Report uses formal document aesthetic
- No generic quiz or LMS styling anywhere in the new system

---

## 12. WHAT THIS SPEC DOES NOT DEFINE

- The exact pixel dimensions of each region (determined in implementation)
- The exact animation timing (determined in Sprint 9 Polish)
- The full evidence binding graph (future sprints)
- The complete verification engine (Sprint 4)
- Audio design (Sprint 12)
