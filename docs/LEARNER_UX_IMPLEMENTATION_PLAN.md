# Learner UX Implementation Plan — Avi-Mystery

> **Status:** READY
> **Date:** September 2026
> **Scope:** Learner UX redesign
> **Primary reference:** `docs/LEARNER_UX_PRINCIPLES.md`

---

# 1. Objective

Redesign the Learner-facing experience so that Avi-Mystery behaves as a:

> **story-driven investigation platform with learning tools**

rather than:

> **a traditional LMS / SaaS dashboard with gamification.**

The redesign must preserve existing business logic, learning content, progress tracking, XP systems, authentication, and Admin functionality unless explicitly required.

---

# 2. Core Implementation Rule

Before modifying any Learner UI:

```text
READ
docs/LEARNER_UX_PRINCIPLES.md
```

The implementation must follow those principles.

---

# 3. Current Problem

The current Learner experience has several structural problems:

```text
Admin-like Layout
       ↓
Dense Navigation
       ↓
Feature-oriented Mental Model
       ↓
Dashboard Metrics
       ↓
High Cognitive Load
       ↓
Weak Investigation Identity
```

The target experience is:

```text
Learner Layout
       ↓
Journey-oriented Navigation
       ↓
Current Case
       ↓
Clear Objective
       ↓
Investigation
       ↓
Evidence / Reward
       ↓
Next Objective
```

---

# 4. Scope

## In Scope

* LearnerLayout
* Learner navigation
* Learner Home / Dashboard
* Case-oriented information hierarchy
* Learner visual language
* Academy presentation
* Workspace context
* Progressive disclosure
* Learner-specific reusable components
* Learner-specific responsive behavior
* Light/Dark mode consistency

## Out of Scope

Do not modify without explicit approval:

* Admin UX
* Firebase data model
* Authentication architecture
* XP business rules
* Achievement calculation logic
* Course content itself
* SQL execution engine
* Excel checker logic
* Firestore security rules
* backend architecture
* unrelated gameplay systems

---

# 5. Implementation Strategy

Do not redesign the entire application in one pass.

Implementation must happen incrementally:

```text
PHASE 0
Audit & Architecture

        ↓

PHASE 1
Learner Shell + Navigation

        ↓

PHASE 2
Detective Home

        ↓

PHASE 3
Case Experience

        ↓

PHASE 4
Academy Experience

        ↓

PHASE 5
Visual Language

        ↓

PHASE 6
Polish + Accessibility + Regression
```

Each phase must remain independently testable.

---

# 6. Phase 0 — Repository Audit

## Goal

Understand the current Learner architecture before changing code.

## Tasks

Identify:

* `LearnerLayout`
* `AdminLayout`
* Learner routes
* Dashboard/Home components
* navigation configuration
* shared layout components
* `StatCard`
* `WorkspaceSplitPane`
* Academy components
* Case/Mission components
* Progress components
* Achievement components
* theme/token definitions
* responsive breakpoints

Create a short internal map:

```text
Learner
├── Layout
├── Navigation
├── Home
├── Case
├── Academy
├── Practice
├── Knowledge
├── Achievements
└── Profile
```

## Acceptance Criteria

* Existing Learner routes are documented.
* Shared components are identified.
* Admin-only components are identified.
* No production behavior is changed.

---

# 7. Phase 1 — Learner Shell

## Goal

Decouple Learner UX from Admin UX.

## Tasks

Create/refactor:

```text
LearnerLayout
LearnerSidebar
LearnerTopBar
LearnerNavigation
```

Do not duplicate business logic unnecessarily.

Reuse low-level primitives where appropriate.

---

## Target Navigation

Preferred structure:

```text
CASE
├── Current Case
└── Case Files

ACADEMY
├── Academy
└── Practice

PROFILE
├── Achievements
└── Profile
```

Supporting features may remain accessible contextually.

---

## Important

Do not blindly expose:

```text
Map
Academy
Courses
Knowledge
Sandbox
Practice
Achievements
Profile
```

as eight equally important top-level destinations.

---

## Developer/Admin Access

If a development-only Admin switch currently exists for testing:

```text
[ Admin ]
```

it may remain during development.

Requirements:

* clearly marked as developer/test functionality
* not part of the production learner experience
* removable through build environment / feature flag where appropriate

Do not redesign production navigation around this developer convenience.

---

## Acceptance Criteria

* Learner and Admin layouts are structurally independent.
* Learner navigation no longer mirrors Admin navigation.
* Current Case has the strongest navigation priority.
* Developer Admin access still works in development.
* Existing learner routes remain reachable.
* No Admin UI regressions.

---

# 8. Phase 2 — Detective Home

## Goal

Transform the Dashboard from a metrics overview into a "Detective Home".

---

## Target Hierarchy

```text
Greeting
    ↓
Current Case
    ↓
Objective
    ↓
Primary CTA
    ↓
Investigation Progress
    ↓
Recent Evidence
    ↓
Achievements / Supporting Stats
```

---

## Primary Card

The primary area should communicate:

```text
CASE #XX
Case Name

Short narrative/context

Objective:
[What the learner needs to accomplish]

[ Continue Investigation ]
```

The primary CTA must be visually dominant.

---

## Secondary Content

Supporting sections may include:

* investigation progress
* evidence collected
* recent cases
* achievements
* XP / level
* streak

But these must not overpower the current objective.

---

## Remove / De-emphasize

Do not automatically show:

```text
4 equally weighted StatCards
```

as the first visual hierarchy.

Metadata such as:

```text
Tool
Difficulty
Duration
XP
```

should be secondary.

---

## Acceptance Criteria

A learner opening Home can answer within a few seconds:

1. What case am I working on?
2. What is my current objective?
3. What should I click?

The page must have one clearly dominant primary CTA.

---

# 9. Phase 3 — Case Experience

## Goal

Establish the investigation loop.

Target flow:

```text
Case Brief
    ↓
Objective
    ↓
Evidence
    ↓
Mission
    ↓
Workspace
    ↓
Verification
    ↓
Reward
    ↓
Next Objective
```

---

## Case Brief

The learner should understand:

* what happened
* why it matters
* what they need to investigate

Keep narrative concise.

Do not overwhelm the learner with technical metadata before the objective.

---

## Evidence

Evidence should feel meaningful.

Potential representations:

```text
Evidence Card
Evidence File
Investigation Note
Data Artifact
```

Evidence should support the story rather than exist purely as decoration.

---

## Mission

The mission should clearly state:

```text
OBJECTIVE
What must be solved

SUCCESS CONDITION
What counts as correct

AVAILABLE TOOLS
What the learner may use
```

---

## Workspace

Use existing:

```text
WorkspaceSplitPane
```

where appropriate.

Do not automatically display every possible piece of information.

Prefer:

```text
Context
+
Task
+
Tool
```

over:

```text
Context
+
Full theory
+
Metadata
+
Hints
+
Tool
+
Navigation
```

---

## Acceptance Criteria

The learner can move through a case without needing to understand the application's internal architecture.

The flow clearly communicates:

```text
Why → What → How → Result → What's next
```

---

# 10. Phase 4 — Academy

## Goal

Move Academy away from a pure reference-manual mental model.

---

## Target Learning Flow

```text
Concept
    ↓
Tiny Example
    ↓
Try
    ↓
Apply
    ↓
Return to Investigation
```

---

## Keep Existing Content

Do not rewrite all educational content during the first implementation.

Focus first on:

* layout
* hierarchy
* navigation
* progressive disclosure
* relationship between concept and investigation

---

## Academy vs Knowledge

Maintain clear distinction:

```text
Academy
→ Learn to solve something.

Knowledge
→ Look something up.
```

Contextual links may connect the two.

---

## Acceptance Criteria

* Academy no longer visually behaves like a dense documentation dashboard.
* The current learning goal is visually clear.
* The learner can return to the relevant investigation.
* Existing course content remains functional.

---

# 11. Phase 5 — Detective Amber Visual Language

## Goal

Transform "Detective Amber" from an accent color into a coherent design language.

---

## Design Tokens

Before creating one-off styles, identify or create reusable tokens for:

```text
investigation
evidence
success
warning
discovery
active
background
surface
text
muted text
border
```

Maintain compatibility with:

```text
Light Mode
Dark Mode
```

---

## Materiality

Introduce subtle visual concepts such as:

* case file containers
* evidence cards
* document surfaces
* stamps
* investigation markers

Use them selectively.

Avoid making every card look like paper.

---

## Typography

Use display typography selectively for narrative headings.

Do not sacrifice readability.

---

## Icons

Continue using Lucide or existing icon infrastructure unless there is a strong UX reason to replace it.

Do not replace icons simply to make the UI look more "detective-like".

---

## Acceptance Criteria

* Detective Amber has consistent meaning.
* Amber is not used indiscriminately.
* Light and Dark modes remain coherent.
* The design feels investigative without becoming a novelty/retro theme.
* Visual patterns are implemented as reusable components/tokens where possible.

---

# 12. Phase 6 — Motion

## Goal

Use animation to reinforce investigation and progression.

---

## Preferred Motion Events

```text
Discovery
Verification
Reward
Case transition
Evidence reveal
Progression
```

Example:

```text
Submit
  ↓
Checking
  ↓
Evidence Verified
  ↓
XP / Rank Update
  ↓
New Objective
```

---

## Avoid

* animation on every card
* continuous decorative motion
* excessive parallax
* animation that delays task completion
* motion without semantic purpose

Respect reduced-motion preferences.

---

## Acceptance Criteria

Animations:

* reinforce state changes
* do not block interaction
* remain performant
* work in Light/Dark mode
* respect reduced-motion settings

---

# 13. Component Strategy

Create Learner-specific components when the mental model differs significantly from existing shared components.

Potential components:

```text
DetectiveHome
CurrentCaseCard
CaseBrief
EvidenceCard
MissionObjective
InvestigationProgress
DetectiveRank
InvestigationTimeline
EvidenceReveal
CaseCompletion
```

These names are proposals, not mandatory exact names.

---

# 14. Reuse Policy

## Reuse

Prefer reusing:

* buttons
* inputs
* modals
* typography primitives
* icons
* theme infrastructure
* accessibility primitives
* data services
* progress services
* existing checker logic
* existing workspace engines

## Do Not Reuse Blindly

Avoid copying:

* Admin sidebar
* Admin dashboard
* Admin metrics layout
* Admin information hierarchy
* Admin tables
* Admin navigation

The implementation should share infrastructure while maintaining separate UX.

---

# 15. Data / Business Logic Constraint

This UX redesign is primarily a presentation-layer change.

Do not modify business rules simply to make UI implementation easier.

Examples:

Do not change:

```text
XP calculation
attemptId logic
progress persistence
achievement evaluation
course completion rules
```

unless a separate requirement explicitly demands it.

If existing data does not support the ideal UI:

1. identify the gap
2. propose the smallest required data change
3. do not silently modify the data model

---

# 16. Responsive Behavior

Learner UX must be designed for:

```text
Desktop
Tablet
Mobile
```

Do not simply shrink the desktop layout.

For narrow screens:

```text
Narrative
    ↓
Objective
    ↓
Action
    ↓
Tool
```

should remain the priority.

Complex split-pane experiences may become:

```text
Context
  ↓
Workspace
```

or use an intentional tab/expand interaction.

---

# 17. Accessibility

Every phase must preserve:

* keyboard navigation
* visible focus states
* semantic structure
* sufficient contrast
* readable text
* screen-reader meaningful labels
* reduced motion
* Light/Dark mode accessibility

Do not treat accessibility as a final cosmetic pass only.

---

# 18. Testing Strategy

After each phase:

```text
npm test
npm run build
```

where applicable.

Also perform manual learner-flow testing.

---

## Core Learner Flow

Test:

```text
Login
 ↓
Learner Home
 ↓
Current Case
 ↓
Mission
 ↓
Workspace
 ↓
Submit
 ↓
Result
 ↓
Reward
 ↓
Next Objective
```

Verify:

* navigation
* progress
* XP
* completion state
* persistence
* refresh behavior
* light/dark mode
* responsive layout

---

# 19. Visual QA Checklist

For each redesigned screen:

### Hierarchy

* [ ] Is the primary objective immediately visible?
* [ ] Is there one dominant CTA?
* [ ] Are secondary details visually subordinate?
* [ ] Is metadata kept under control?

### Mental Model

* [ ] Does this feel like an investigation?
* [ ] Is the learner treated as a detective/player?
* [ ] Does the screen communicate progression?

### Navigation

* [ ] Is the next action clear?
* [ ] Are unnecessary choices hidden or de-emphasized?
* [ ] Does the learner remain inside the journey?

### Visual Design

* [ ] Is Detective Amber used intentionally?
* [ ] Is the interface still modern?
* [ ] Does Light Mode work?
* [ ] Does Dark Mode work?

### Accessibility

* [ ] Keyboard navigation works.
* [ ] Focus states are visible.
* [ ] Contrast is acceptable.
* [ ] Reduced motion is respected.

---

# 20. Agent Guardrails

The Agent MUST NOT:

1. redesign Admin UI while working on Learner UX
2. copy Admin information architecture into Learner UI
3. add new navigation items simply because a feature exists
4. add metadata merely because it is available
5. make every element amber
6. add decorative animation without UX purpose
7. rewrite learning content unnecessarily
8. change business logic to simplify UI implementation
9. remove existing functionality without documenting the reason
10. perform a large rewrite when an incremental refactor is sufficient

---

# 21. Agent Decision Framework

Before implementing a Learner UI change, ask:

```text
Q1
Does this help the learner understand the current objective?

Q2
Does this help the learner complete the investigation?

Q3
Does this strengthen the investigation mental model?

Q4
Does this reduce or increase cognitive load?

Q5
Could this information be progressively disclosed?

Q6
Is this feature actually necessary at this point in the journey?

Q7
Am I reusing an Admin pattern simply because it already exists?
```

If the answer to Q7 is "yes", stop and reconsider the design.

---

# 22. Implementation Order

The recommended implementation sequence is:

```text
01
Repository audit

02
LearnerLayout separation

03
Learner navigation

04
Detective Home

05
Current Case

06
Case Brief / Mission hierarchy

07
Workspace context

08
Academy UX

09
Detective Amber visual language

10
Motion

11
Responsive refinement

12
Accessibility + regression
```

Do not start with visual polish.

---

# 23. Definition of Done

The Learner UX redesign is considered successful when:

### Navigation

* Learner navigation no longer feels like Admin navigation.
* The primary journey is obvious.
* Secondary tools do not compete with the main journey.

### Home

* Current case is the visual focus.
* The next action is obvious.
* Metrics are supporting information.

### Case

* Story → Objective → Action → Result → Progression is clear.
* The workspace feels like a tool used for investigation.

### Academy

* Learning is contextual.
* Academy does not feel like a documentation clone.
* Knowledge and Academy have distinct purposes.

### Visual

* Detective Amber is a coherent design language.
* The UI remains modern.
* Light/Dark mode remain usable.
* Materiality and motion support the story.

### Engineering

* Existing learner functionality remains intact.
* Business logic is preserved.
* Tests/build pass.
* No unnecessary Admin changes are introduced.

---

# 24. Final Product Principle

The implementation should ultimately transform:

```text
"I am using an LMS."
```

into:

```text
"I am investigating a case,
and I'm learning the skills I need along the way."
```

That is the central UX transformation this plan is intended to achieve.
