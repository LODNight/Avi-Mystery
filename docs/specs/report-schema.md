# INVESTIGATION REPORT — DOMAIN MODEL & SCHEMA

> **Sprint 1 Deliverable**
> The Investigation Report is the investigator's official communication to HQ.
> It is a domain model, not a generic form.
>
> **Version:** 1.0 — 2026-09-18

---

## 1. DESIGN PRINCIPLE

> An Investigation Report is not a quiz answer sheet.

It is an official document that:
- Records the investigator's discoveries
- Cites the findings in structured, verifiable format
- Is submitted as a formal communication to HQ
- Can be returned for revision if findings are not supported

The UI that renders a report is generated from a **configuration schema**, not hardcoded HTML. This allows different cases to have different report structures without modifying the report renderer.

---

## 2. REPORT STRUCTURE

A report consists of:

```
ReportDefinition (in case content)
    ↓
ReportState (runtime, per-investigator)
    ↓
ReportForm (UI generated from definition + state)
    ↓
Submitted Report (immutable snapshot after SEND)
    ↓
VerificationResult (written by Verification Engine)
```

---

## 3. REPORT DEFINITION SCHEMA

The `ReportDefinition` lives in the case content data, one per investigation phase. It defines the structure of the report that will be rendered. It is authored by content designers, not generated automatically.

```typescript
interface ReportDefinition {
  reportDefinitionId: string;
  caseId: string;
  phaseId: string;
  title: string;                 // e.g. "INVESTIGATION REPORT — PHASE 1"
  instructions: string | null;   // Optional guidance shown above the form
  fields: ReportField[];
  evidenceRequired: boolean;     // Whether evidence attachments are required
}

interface ReportField {
  field_id: string;              // Machine-readable: "destination", "order_id"
  label: string;                 // Human-readable: "Destination", "Order ID"
  type: FieldType;
  order: number;                 // Display order
  required: boolean;
  prefilled: boolean;
  prefilled_value: string | null;
  editable: boolean;             // false for locked/pre-filled fields
  placeholder: string | null;    // Shown when field is empty
  validation: FieldValidation | null;
  evidence_required: boolean;    // Future: field requires attached evidence
  hint: string | null;           // Optional contextual guidance (not the answer)
}

type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'datetime'
  | 'select'
  | 'evidence_ref';              // Future: reference to pinned evidence

interface FieldValidation {
  min_length?: number;
  max_length?: number;
  pattern?: string;              // Regex
  min?: number;                  // For number type
  max?: number;
}
```

---

## 4. FIELD EXAMPLES

### Pre-filled, locked field (tutorial scaffolding)
```json
{
  "field_id": "order_id",
  "label": "Order ID",
  "type": "text",
  "order": 1,
  "required": true,
  "prefilled": true,
  "prefilled_value": "ORD-1842",
  "editable": false,
  "placeholder": null,
  "validation": null,
  "evidence_required": false,
  "hint": null
}
```

Renders as:
```
Order ID
[ ORD-1842 ] 🔒
```

### Empty field (investigator must discover)
```json
{
  "field_id": "destination",
  "label": "Destination",
  "type": "text",
  "order": 4,
  "required": true,
  "prefilled": false,
  "prefilled_value": null,
  "editable": true,
  "placeholder": "Enter the shipment destination...",
  "validation": { "min_length": 3 },
  "evidence_required": false,
  "hint": null
}
```

Renders as:
```
Destination *
[ ________________________________ ]
```

### Date field
```json
{
  "field_id": "shipment_date",
  "label": "Shipment Date",
  "type": "date",
  "order": 2,
  "required": true,
  "prefilled": false,
  "prefilled_value": null,
  "editable": true,
  "placeholder": "DD/MM/YYYY",
  "validation": null,
  "evidence_required": false,
  "hint": null
}
```

### Select field
```json
{
  "field_id": "shipment_status",
  "label": "Status at Time of Incident",
  "type": "select",
  "order": 5,
  "required": true,
  "prefilled": false,
  "prefilled_value": null,
  "editable": true,
  "placeholder": "Select status...",
  "validation": null,
  "evidence_required": false,
  "hint": null,
  "options": ["Authorized", "Unauthorized", "Under Investigation"]
}
```

---

## 5. COMPLETE REPORT DEFINITION EXAMPLE

Case #001, Phase 1 — Find Suspicious Shipment:

```json
{
  "reportDefinitionId": "report-case001-phase1",
  "caseId": "case-001",
  "phaseId": "phase-1",
  "title": "INVESTIGATION REPORT",
  "instructions": "Based on your investigation of the warehouse records, identify the unauthorized shipment.",
  "evidenceRequired": false,
  "fields": [
    {
      "field_id": "order_id",
      "label": "Order ID",
      "type": "text",
      "order": 1,
      "required": true,
      "prefilled": true,
      "prefilled_value": "ORD-1842",
      "editable": false,
      "placeholder": null,
      "validation": null,
      "evidence_required": false,
      "hint": null
    },
    {
      "field_id": "shipment_date",
      "label": "Shipment Date",
      "type": "text",
      "order": 2,
      "required": true,
      "prefilled": true,
      "prefilled_value": "14/05/2026",
      "editable": false,
      "placeholder": null,
      "validation": null,
      "evidence_required": false,
      "hint": null
    },
    {
      "field_id": "origin",
      "label": "Origin",
      "type": "text",
      "order": 3,
      "required": true,
      "prefilled": true,
      "prefilled_value": "Warehouse A",
      "editable": false,
      "placeholder": null,
      "validation": null,
      "evidence_required": false,
      "hint": null
    },
    {
      "field_id": "destination",
      "label": "Destination",
      "type": "text",
      "order": 4,
      "required": true,
      "prefilled": false,
      "prefilled_value": null,
      "editable": true,
      "placeholder": "Enter the destination warehouse or location...",
      "validation": { "min_length": 3 },
      "evidence_required": false,
      "hint": null
    },
    {
      "field_id": "responsible_manager",
      "label": "Responsible Manager",
      "type": "text",
      "order": 5,
      "required": true,
      "prefilled": false,
      "prefilled_value": null,
      "editable": true,
      "placeholder": "Full name of the responsible manager...",
      "validation": { "min_length": 3 },
      "evidence_required": false,
      "hint": null
    }
  ]
}
```

Rendered form:
```
CASE #001 — Illegal Coffee Delivery
INVESTIGATION REPORT
────────────────────────────────────

Order ID
[ ORD-1842 ] 🔒

Shipment Date
[ 14/05/2026 ] 🔒

Origin
[ Warehouse A ] 🔒

Destination *
[ ________________________________ ]

Responsible Manager *
[ ________________________________ ]

────────────────────────────────────

                  [ SEND REPORT ]
```

---

## 6. VERIFICATION RULES SCHEMA

Verification rules live alongside the report definition in case content. They define how each field is verified. They are **not exposed to the UI** — they live in the content data layer.

```typescript
interface VerificationRuleSet {
  caseId: string;
  phaseId: string;
  reportDefinitionId: string;
  rules: VerificationRule[];
  onAccepted: CaseProgressAction;
  onReturned: CaseReturnedAction;
}

interface VerificationRule {
  field_id: string;
  strategy: VerificationStrategy;
  expected?: string | number;       // For 'exact' strategy (Sprint 1 prototype)
  case_sensitive?: boolean;
  tolerance?: number;               // For numeric fields
  // Future strategies will add more fields here
}

type VerificationStrategy =
  | 'exact'                  // Exact string/number match (Sprint 1)
  | 'case_insensitive'       // Case-insensitive string match (Sprint 1)
  | 'numeric_tolerance'      // Number within tolerance
  | 'dataset_lookup'         // Future: value exists in dataset
  | 'cross_table'            // Future: value matches related table
  | 'calculation'            // Future: value satisfies formula
  | 'evidence_supported';    // Future: value supported by attached evidence

interface CaseProgressAction {
  action: 'unlock_phase' | 'close_case';
  targetPhaseId?: string;
  hqMessage: string;         // What HQ says to the investigator
  newLeadText?: string;      // Optional new lead description
}

interface CaseReturnedAction {
  action: 'return_report';
  hqMessage: string;         // What HQ says to the investigator
}
```

### Example verification rules for Case #001, Phase 1:

```json
{
  "caseId": "case-001",
  "phaseId": "phase-1",
  "reportDefinitionId": "report-case001-phase1",
  "rules": [
    {
      "field_id": "destination",
      "strategy": "case_insensitive",
      "expected": "Warehouse C"
    },
    {
      "field_id": "responsible_manager",
      "strategy": "case_insensitive",
      "expected": "Nguyễn Văn Tâm"
    }
  ],
  "onAccepted": {
    "action": "unlock_phase",
    "targetPhaseId": "phase-2",
    "hqMessage": "Your shipment identification is confirmed. However, the destination listed does not match the invoice records. A new lead has been attached to the case.",
    "newLeadText": "Invoice records show a discrepancy with the listed destination. Cross-reference against the procurement database."
  },
  "onReturned": {
    "action": "return_report",
    "hqMessage": "Your findings could not be verified against available evidence. Review the warehouse records and revise your report."
  }
}
```

---

## 7. VERIFICATION RESULT SCHEMA

Produced by the Verification Engine after a report is submitted:

```typescript
interface VerificationResult {
  reportId: string;
  caseId: string;
  phaseId: string;
  overall: 'ACCEPTED' | 'RETURNED';
  fieldResults: FieldVerificationResult[];
  hqMessage: string;
  verifiedAt: string;
}

interface FieldVerificationResult {
  field_id: string;
  label: string;
  status: 'correct' | 'incorrect' | 'not_checked' | 'prefilled';
  submittedValue: string;
  message: string | null;   // HQ feedback for this specific field (no raw answer dump)
}
```

### Example ACCEPTED result (displayed to investigator):

```
REPORT RECEIVED
────────────────────────────

✓ Order ID — Confirmed
✓ Shipment Date — Confirmed
✓ Origin — Confirmed
✓ Destination — Verified against warehouse records
✓ Responsible Manager — Verified

────────────────────────────

CASE PROGRESS

A new lead has been added to the case.
```

### Example RETURNED result (displayed to investigator):

```
REPORT RETURNED
────────────────────────────

✓ Order ID — Confirmed
✓ Shipment Date — Confirmed
✓ Origin — Confirmed
✗ Destination — Does not match available evidence
✓ Responsible Manager — Verified

────────────────────────────

Your investigation remains open.

Review the evidence and revise your findings.
```

> [!IMPORTANT]
> The Verification Result display must NEVER show the expected answer directly.
> `message` for an incorrect field should be a direction, not a correction.
> Example: "Does not match available evidence" — not "Expected: Warehouse C"

---

## 8. FUTURE EVIDENCE BINDING

The current model supports:
```
field value → expected string → match/no match
```

The architecture must support this future model:
```
field value → evidence record → verified/not supported
```

This is preserved by the `VerificationStrategy` enum — adding `dataset_lookup`, `cross_table`, `evidence_supported` strategies will not require structural changes to `VerificationRule` or `VerificationResult`.

The `evidence_required` field on `ReportField` is already present and can activate evidence attachment UI in a future sprint.

---

## 9. DIFFICULTY MODEL — REPORT DIMENSION

Report structure is part of difficulty, not just tool complexity:

| Level | Pre-filled | Empty | Total |
|---|---|---|---|
| Tutorial | 3 | 2 | 5 |
| Easy | 2 | 3 | 5 |
| Intermediate | 1 | 4–5 | 5–6 |
| Advanced | 0 | 6–8 | 6–8 |

Advanced difficulty may also:
- Use `evidence_required: true` on multiple fields
- Include fields where the field label does not directly suggest where to look
- Include decoy fields (fields where the answer is not in the primary dataset)

---

## 10. WHAT THE REPORT SCHEMA DOES NOT COVER

- The full evidence binding graph (future sprint)
- Multi-part reports (future — a single phase with multiple sub-reports)
- Collaborative reports (future — multi-user agency mode)
- Report versioning beyond DRAFT/SUBMITTED (future)
