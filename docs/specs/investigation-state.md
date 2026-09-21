# INVESTIGATION STATE MODEL

> **Sprint 1 Deliverable**
> Defines the four distinct state domains for the Detective Workspace.
> Each domain has clear ownership, persistence strategy, and transition rules.
>
> **Version:** 1.0 — 2026-09-18

---

## DESIGN PRINCIPLE

> State domains are separated by **concern, not by convenience.**

The four domains are:
1. **Case State** — What is the status of this investigation?
2. **Investigation State** — What has the investigator done and discovered?
3. **Report State** — What is the investigator submitting to HQ?
4. **UI State** — What is currently visible on screen?

Each domain is independent. UI State never drives Case State. Report State is not derived from UI State. Case State transitions are triggered by Verification results, not by UI actions directly.

---

## 1. CASE STATE

**Owner:** `caseStateService`
**Persistence:** Firestore (production) / localStorage (Sprint 1 prototype)
**Scope:** Per case, per user

### Schema

```typescript
interface CaseState {
  caseId: string;
  userId: string;
  status: CaseStatus;
  currentPhaseId: string;
  completedPhaseIds: string[];
  unlockedPhaseIds: string[];
  hqMessages: HQMessage[];
  startedAt: string;       // ISO timestamp
  lastActivityAt: string;
  closedAt: string | null;
}

type CaseStatus =
  | 'OPEN'           // Case received, not yet examined
  | 'INVESTIGATING'  // Learner is actively investigating
  | 'REPORT_READY'   // Learner has opened the report (draft exists)
  | 'SUBMITTED'      // Report has been sent to HQ
  | 'VERIFYING'      // HQ is verifying the findings
  | 'CASE_PROGRESS'  // Report verified, case advancing
  | 'REPORT_RETURNED'// Findings not supported, returned for revision
  | 'CASE_CLOSED';   // Investigation complete

interface HQMessage {
  id: string;
  phaseId: string;
  type: 'progress' | 'returned' | 'new_lead' | 'verdict';
  content: string;
  sentAt: string;
}
```

### State Transitions

```
OPEN
 ↓ [Learner opens case file]
INVESTIGATING
 ↓ [Learner opens SEND REPORT]
REPORT_READY
 ↓ [Learner clicks SEND REPORT button]
SUBMITTED
 ↓ [automatic]
VERIFYING
 ↓ [verification engine completes]
 ├── [all fields correct] → CASE_PROGRESS
 │    ↓ [more phases exist] → INVESTIGATING (next phase)
 │    ↓ [no more phases] → CASE_CLOSED
 └── [any field incorrect] → REPORT_RETURNED
      ↓ [learner revises] → INVESTIGATING
```

### Transition Rules

- `OPEN → INVESTIGATING`: Triggered by first interaction with the case workspace (e.g., opening a source)
- `INVESTIGATING → REPORT_READY`: Triggered by opening the SEND REPORT form (not by filling fields)
- `REPORT_READY → SUBMITTED`: Triggered only by explicit SEND REPORT button action
- `SUBMITTED → VERIFYING`: Automatic, no learner action
- `VERIFYING → *`: Driven by Verification Engine result only
- `CASE_PROGRESS → INVESTIGATING`: Automatic if next phase exists
- `REPORT_RETURNED → INVESTIGATING`: Learner clicks "Continue Investigating"

### Responsibilities

| ✅ Case State does | ❌ Case State does NOT |
|---|---|
| Track overall case lifecycle | Know which UI panel is open |
| Track which phases are complete | Store form field values |
| Store HQ messages | Manage tool state (formulas, queries) |
| Record timestamps | Manage notebook notes |

---

## 2. INVESTIGATION STATE

**Owner:** `investigationStateService`
**Persistence:** localStorage (keyed by `caseId + userId`)
**Scope:** Per case, per user, per session (survives refresh)

### Schema

```typescript
interface InvestigationState {
  caseId: string;
  userId: string;
  phaseId: string;
  notes: InvestigationNote[];
  pinnedEvidence: PinnedEvidence[];
  viewedSourceIds: string[];
  toolState: ToolState;
  lastUpdatedAt: string;
}

interface InvestigationNote {
  id: string;
  caseId: string;
  category: 'theory' | 'observation' | 'suspicious' | 'to_verify' | 'custom';
  text: string;
  sourceId: string | null;    // Optional link to a source
  evidenceRef: string | null; // Optional link to a specific row/cell
  createdAt: string;
  updatedAt: string;
}

interface PinnedEvidence {
  id: string;
  sourceId: string;
  sourceTitle: string;
  excerpt: string;           // Text, cell address, or row identifier
  pinnedAt: string;
}

interface ToolState {
  excel?: {
    cellFormulas: Record<string, string>;
    cellValues: Record<string, unknown>;
    selectedCell: string;
  };
  sql?: {
    query: string;
    lastResult: unknown | null;
  };
}
```

### Responsibilities

| ✅ Investigation State does | ❌ Investigation State does NOT |
|---|---|
| Persist investigation notes across sessions | Track case lifecycle status |
| Remember which sources have been viewed | Store report field values |
| Preserve tool state (formulas, queries) | Drive UI layout decisions |
| Remember pinned evidence | Manage HQ messages |

### Persistence Strategy (Sprint 1)

```
localStorage key: `avi:investigation:${caseId}:${userId}`
Auto-save: debounced 500ms after any mutation
Recovery: loaded on workspace mount
Clear: only when case is CASE_CLOSED or user explicitly resets
```

> [!NOTE]
> In future sprints, investigation state may sync to Firestore when online, with localStorage as the offline fallback. This migration should not require changes to consumer code if the service interface is stable.

---

## 3. REPORT STATE

**Owner:** `reportStateService`
**Persistence:** localStorage (draft) → Firestore (on submit)
**Scope:** Per case, per phase, per user

### Schema

```typescript
interface ReportState {
  reportId: string;         // Generated UUID on first open
  caseId: string;
  phaseId: string;
  userId: string;
  status: ReportStatus;
  fields: Record<string, ReportFieldValue>;
  attachments: EvidenceAttachment[];
  verificationResult: VerificationResult | null;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
}

type ReportStatus =
  | 'DRAFT'      // Being filled
  | 'READY'      // All required fields filled, ready to send
  | 'SUBMITTED'  // Sent to HQ
  | 'VERIFYING'  // Under review
  | 'RETURNED'   // Sent back — fields may have errors
  | 'ACCEPTED';  // Verified and accepted

interface ReportFieldValue {
  field_id: string;
  value: string;
  isLocked: boolean;
  verificationStatus: 'unverified' | 'correct' | 'incorrect' | null;
  errorMessage: string | null;
}

interface EvidenceAttachment {
  id: string;
  sourceId: string;
  label: string;
  attachedAt: string;
}

interface VerificationResult {
  overall: 'ACCEPTED' | 'RETURNED';
  fields: Record<string, FieldVerificationResult>;
  hqMessage: string;
  verifiedAt: string;
}

interface FieldVerificationResult {
  field_id: string;
  status: 'correct' | 'incorrect' | 'not_checked';
  message: string | null;
}
```

### Responsibilities

| ✅ Report State does | ❌ Report State does NOT |
|---|---|
| Store field values as investigator types | Validate against expected answers directly |
| Persist draft between sessions | Track case progression |
| Store verification result per field | Manage investigation notes |
| Track report lifecycle status | Control UI visibility |

### Persistence Strategy

```
Draft: localStorage key `avi:report:${caseId}:${phaseId}:${userId}`
       Auto-saved on each field change (debounced 300ms)
       Survives page refresh, HQ panel open/close

Submitted: Firestore collection `report_submissions`
           Written on SEND — immutable after submission
           Verification result written back by Verification Engine
```

### Report State Transitions

```
Draft started → DRAFT
All required fields filled → READY (auto)
SEND REPORT clicked → SUBMITTED
Verification begins → VERIFYING
All fields correct → ACCEPTED → Case State advances
Any field incorrect → RETURNED → fields show error status
Investigator edits → DRAFT (new draft, same reportId round-trip or new)
```

---

## 4. UI STATE

**Owner:** Component-level React state / React Context (UI scope only)
**Persistence:** None — resets on page navigation (by design)
**Scope:** Per mounted workspace instance

### Schema

```typescript
interface UIState {
  hq: HQUIState;
  workspace: WorkspaceUIState;
}

interface HQUIState {
  isOpen: boolean;
  activeSection: 'menu' | 'notebook' | 'hint' | 'evidence_locker' | 'report' | null;
}

interface WorkspaceUIState {
  activeSourceId: string | null;    // Which source is selected in Sources Region
  openSourceIds: string[];          // Tab history in Evidence Region
  activeEvidenceTab: string | null; // Currently visible evidence tab
  isCaseFilePanelCollapsed: boolean;
  isFocusMode: boolean;             // Investigation Region expanded
}
```

### Responsibilities

| ✅ UI State does | ❌ UI State does NOT |
|---|---|
| Know which panel is currently open | Persist anything across sessions |
| Know which source is being viewed | Drive case lifecycle transitions |
| Control HQ panel visibility | Store investigation content |
| Manage responsive tab switching | Validate report fields |

### Why UI State is NOT persisted

UI State represents *where the investigator is looking*, not *what they have discovered*. On refresh:
- The workspace reloads
- Case State is restored from server/localStorage
- Investigation State is restored from localStorage
- Report draft is restored from localStorage
- The investigator starts viewing the case file again

This is intentional and correct. The investigation is preserved; the screen position is not.

---

## 5. SERVICE LAYER

Each state domain is managed by a dedicated service:

```
caseStateService          — reads/writes CaseState
investigationStateService — reads/writes InvestigationState
reportStateService        — reads/writes ReportState
                            (UI State is managed by React state, not a service)
```

### Interface Contracts

```typescript
// caseStateService
interface CaseStateService {
  getCaseState(caseId: string, userId: string): Promise<CaseState>;
  startInvestigation(caseId: string, userId: string): Promise<void>;
  advanceCaseProgress(caseId: string, phaseId: string): Promise<void>;
  returnReport(caseId: string, phaseId: string, hqMessage: string): Promise<void>;
  closeCase(caseId: string): Promise<void>;
}

// investigationStateService (extends existing service)
interface InvestigationStateService {
  getState(caseId: string, userId: string): InvestigationState;
  addNote(caseId: string, note: Omit<InvestigationNote, 'id' | 'createdAt' | 'updatedAt'>): void;
  updateNote(caseId: string, noteId: string, text: string): void;
  deleteNote(caseId: string, noteId: string): void;
  pinEvidence(caseId: string, evidence: Omit<PinnedEvidence, 'id' | 'pinnedAt'>): void;
  unpinEvidence(caseId: string, evidenceId: string): void;
  markSourceViewed(caseId: string, sourceId: string): void;
  saveToolState(caseId: string, toolState: Partial<ToolState>): void;
  subscribe(caseId: string, callback: (state: InvestigationState) => void): () => void;
}

// reportStateService
interface ReportStateService {
  getDraft(caseId: string, phaseId: string, userId: string): ReportState | null;
  initDraft(caseId: string, phaseId: string, userId: string, fields: ReportField[]): ReportState;
  updateField(reportId: string, fieldId: string, value: string): void;
  submitReport(reportId: string): Promise<void>;
  applyVerificationResult(reportId: string, result: VerificationResult): void;
  subscribe(reportId: string, callback: (state: ReportState) => void): () => void;
}
```

---

## 6. STATE INTERACTION MAP

```
User opens /cases/case-001/investigate
    ↓
caseStateService.getCaseState()         → loads Case State
investigationStateService.getState()    → loads Investigation State
reportStateService.getDraft()           → loads Report draft (if any)
    ↓
Workspace renders with all three states

User opens a source
    ↓
UIState.activeSourceId = 'source-001'
investigationStateService.markSourceViewed()  → Investigation State updated
Case State: OPEN → INVESTIGATING (first interaction)

User types formula and runs analysis
    ↓
investigationStateService.saveToolState()     → Investigation State updated
(No case or report state change)

User opens HQ Communication → clicks SEND REPORT
    ↓
UIState.hq.activeSection = 'report'
Case State: INVESTIGATING → REPORT_READY
reportStateService.initDraft() if no draft exists

User fills report fields
    ↓
reportStateService.updateField()      → Report State updated (auto-saved)
Report State: DRAFT → READY (when all required fields filled)

User clicks SEND REPORT
    ↓
Case State: REPORT_READY → SUBMITTED
Report State: READY → SUBMITTED
VerificationEngine.verify()
    ↓
[ACCEPTED]
Case State: SUBMITTED → VERIFYING → CASE_PROGRESS
Report State: SUBMITTED → VERIFYING → ACCEPTED
caseStateService.advanceCaseProgress()
    ↓
Next phase unlocked
Case State: CASE_PROGRESS → INVESTIGATING (new phase)

[RETURNED]
Case State: SUBMITTED → VERIFYING → REPORT_RETURNED
Report State: SUBMITTED → VERIFYING → RETURNED (field errors marked)
caseStateService.returnReport() — HQ message stored
Learner continues investigating
Case State: REPORT_RETURNED → INVESTIGATING
```

---

## 7. SPRINT 1 SIMPLIFICATIONS

For the Sprint 1 prototype, the following simplifications apply:

| Full Model | Sprint 1 Equivalent |
|---|---|
| `caseStateService` → Firestore | Mock object in component state |
| `investigationStateService` → localStorage | localStorage (existing service, extended) |
| `reportStateService` → localStorage + Firestore | localStorage only |
| `VerificationEngine` | Hardcoded mock rules for case-001 |
| `HQMessage` from server | Static strings in case content JSON |

The service interfaces defined above must be used even in Sprint 1, so that future implementations can replace the backing store without changing consumer code.
