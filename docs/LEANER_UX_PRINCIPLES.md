# Learner UX Principles — Avi-Mystery

> **Status:** ACTIVE
> **Scope:** Learner-facing experience only
> **Date:** September 2026
> **Purpose:** Define the UX principles that govern all future Learner UI decisions in Avi-Mystery.

---

# 1. Core Philosophy

## 1.1 The fundamental distinction

Avi-Mystery has two fundamentally different users:

```text
ADMIN
→ Manages the system

LEARNER
→ Lives inside the system
```

The Learner must not be treated as a smaller version of the Admin.

The Learner is a **player/detective progressing through an investigation journey**.

Therefore:

> **Admin UX optimizes for control and information.**
>
> **Learner UX optimizes for progression, clarity, discovery, and engagement.**

---

# 2. Primary UX Goal

Every Learner-facing screen should answer one question:

> **"What should the detective do next?"**

The UI should minimize the amount of interpretation required from the learner.

The learner should not need to understand:

* the internal application structure
* the entire course catalog
* the database of available features
* the relationship between every learning module
* which feature they should choose next

The system should provide a clear path.

---

# 3. Core Experience Loop

The primary Learner experience should follow:

```text
STORY
  ↓
CURRENT OBJECTIVE
  ↓
ACTION
  ↓
INVESTIGATION
  ↓
VERIFICATION
  ↓
EVIDENCE / REWARD
  ↓
PROGRESSION
  ↓
NEXT OBJECTIVE
```

This loop is more important than exposing every available feature.

---

# 4. Information Hierarchy

## 4.1 Priority order

Learner UI should generally prioritize information in this order:

```text
P0 — What am I doing?
P1 — Why am I doing it?
P2 — What do I need to know?
P3 — What tool do I use?
P4 — How did I perform?
P5 — Optional metadata
```

Example:

### Good

```text
CASE #04
The Missing Record

Something doesn't add up in the regional report.

Your objective:
Find the branch responsible for the anomaly.

[ Continue Investigation ]
```

### Avoid

```text
SQL
Intermediate
15 minutes
120 XP
3 lessons
Recommended
Active
```

The second version exposes metadata before purpose.

---

# 5. One Primary Action

Every major Learner screen should have **one dominant CTA**.

Examples:

```text
Continue Investigation
Start Mission
Examine Evidence
Learn Concept
Submit Investigation
Continue Case
```

Secondary actions must visually remain secondary.

Avoid presenting multiple equally prominent actions such as:

```text
Start Course
Practice
Open Knowledge
View Sandbox
View Map
View Achievements
```

when the learner has an obvious next step.

---

# 6. Learner Navigation Principles

## 6.1 Navigation should represent the journey

Learner navigation should not mirror Admin navigation.

Avoid exposing every feature as a top-level navigation item.

The preferred mental model is:

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

Supporting tools such as Knowledge and Sandbox may remain available but should not compete with the primary journey.

---

## 6.2 Feature visibility does not equal feature importance

A feature can remain accessible without being permanently visible in the main navigation.

For example:

```text
Knowledge
```

can be accessible contextually from:

```text
SQL Mission
    ↓
Need help?
    ↓
Relevant Knowledge
```

instead of requiring the learner to leave the investigation and manually search for knowledge.

---

# 7. Learner Mental Model

The learner should feel:

> "I am investigating a case."

Not:

> "I am navigating an LMS."

And not:

> "I am operating a data management system."

The interface should reinforce:

```text
Case
Evidence
Mission
Investigation
Clue
Verification
Discovery
Rank
Progression
```

These concepts should be used where appropriate.

Do not force detective terminology into every UI element.

---

# 8. Detective Home / Dashboard

The Learner home page should not behave like an Admin metrics dashboard.

## 8.1 Primary purpose

The Home page should answer:

> **"Where am I in my investigation, and what should I do next?"**

---

## 8.2 Preferred hierarchy

```text
Greeting / Context
        ↓
Current Case
        ↓
Current Objective
        ↓
Primary CTA
        ↓
Investigation Progress
        ↓
Recent Evidence
        ↓
Achievements / Secondary Progress
```

---

## 8.3 Metrics are supporting information

XP, Streak, Weekly Missions, and Time Spent are not the primary content.

They should support the learner's progression rather than dominate the screen.

Avoid:

```text
[ XP ]
[ Streak ]
[ Missions ]
[ Time ]
```

as the first visual content.

Prefer:

```text
CURRENT CASE
The Missing Record

Objective:
Identify the suspicious branch.

[ Continue Investigation ]

Progress: 68%
```

followed by supporting statistics.

---

# 9. Gamification Principles

Gamification should represent **detective progression**, not spreadsheet metrics.

## 9.1 XP

XP is a progression mechanism.

It should support concepts such as:

```text
Level
Rank
Investigator progression
Unlocks
Case progression
```

rather than becoming the sole purpose of the interface.

---

## 9.2 Rank

Potential progression model:

```text
Trainee
    ↓
Junior Analyst
    ↓
Data Investigator
    ↓
Case Analyst
    ↓
Senior Investigator
```

The exact naming can evolve.

The principle is:

> **The learner should feel that they are becoming better at investigation.**

---

# 10. Academy Principles

Academy is not intended to be a direct clone of W3Schools.

The existing course infrastructure may still be reused, but the learner-facing presentation should prioritize:

```text
Concept
   ↓
Small Example
   ↓
Try
   ↓
Apply to Investigation
```

rather than:

```text
Long theory
   ↓
Large syllabus
   ↓
Exercise
```

---

# 11. Knowledge vs Academy

These are different concepts.

## Academy

Purpose:

> Learn something because the current investigation requires it.

Mental model:

```text
"I need to understand this to solve the case."
```

## Knowledge

Purpose:

> Reference or review something independently.

Mental model:

```text
"I want to look this up."
```

Do not merge their purposes simply because both contain educational content.

---

# 12. Workspace Principles

Excel/SQL workspaces are important tools, but they should not dominate the learner's experience before the learner understands the objective.

Preferred flow:

```text
Case Brief
    ↓
Objective
    ↓
Relevant Evidence
    ↓
Workspace
```

Not:

```text
Workspace
    +
Dense Instructions
    +
Metadata
    +
Navigation
```

---

# 13. Split-Pane Guidelines

`WorkspaceSplitPane` may continue to be used.

However, the split-pane must serve the investigation.

For beginner experiences:

* reduce unnecessary persistent text
* prioritize the immediate objective
* hide secondary information when possible
* avoid presenting every hint and metadata field simultaneously
* progressively reveal complexity

The principle is:

> **Narrative first, tool second.**

---

# 14. Progressive Disclosure

Do not expose every piece of information immediately.

Use:

```text
Primary information
      ↓
Optional detail
      ↓
Advanced information
```

Examples:

* Show the objective before showing detailed instructions.
* Show the relevant evidence before showing all available metadata.
* Show a hint only when needed.
* Show advanced explanations after the learner encounters the relevant concept.

---

# 15. Detective Amber Design Language

"Detective Amber" must become more than an accent color.

It should be a **cohesive visual language**.

---

## 15.1 Color

Amber should communicate concepts such as:

* investigation
* evidence
* attention
* important discovery
* active state

Do not use amber on every button or interactive element.

Amber should retain meaning.

---

## 15.2 Materiality

Appropriate surfaces may evoke:

* case files
* evidence cards
* investigation notes
* documents
* stamps
* dossier-like containers

However:

> Do not turn the entire application into a retro detective UI.

The design should remain modern and usable.

---

## 15.3 Typography

Display typography may be used selectively for:

```text
CASE FILE
INVESTIGATION
EVIDENCE
MISSION
```

Body text should remain highly readable and modern.

---

## 15.4 Motion

Animation should communicate:

```text
Discovery
Verification
Progression
Reward
Transition
```

Examples:

```text
Submit
  ↓
Checking
  ↓
Evidence Verified
  ↓
Reward
  ↓
New Objective
```

Avoid animation that exists only for decoration.

---

# 16. Visual Hierarchy

Learner UI should have clear levels:

```text
LEVEL 1
Current objective

LEVEL 2
Supporting evidence / context

LEVEL 3
Progress / reward

LEVEL 4
Metadata / utilities
```

Do not give every card the same visual weight.

If everything looks important, nothing is important.

---

# 17. Component Reuse Rules

Reuse of implementation primitives is encouraged.

Reuse of information architecture is not automatically encouraged.

### Allowed

```text
Button
Modal
Input
Card
Tabs
Table
Theme system
Icons
Form primitives
```

### Do not blindly reuse

```text
Admin sidebar structure
Admin dashboard structure
Admin information hierarchy
Admin data tables
Admin navigation patterns
Admin metrics presentation
```

The rule is:

> **Reuse code where appropriate. Do not reuse mental models blindly.**

---

# 18. Admin vs Learner Boundary

The two experiences should remain architecturally independent at the UX layer.

```text
AdminLayout
    ↓
System Management UX

LearnerLayout
    ↓
Investigation Journey UX
```

Business logic and low-level components may be shared.

The experience architecture should not be.

---

# 19. Accessibility

The immersive design must never compromise usability.

Maintain:

* WCAG-conscious contrast
* keyboard accessibility
* clear focus states
* readable text sizes
* semantic HTML
* reduced-motion considerations
* light/dark mode support

"Detective" styling must remain secondary to usability.

---

# 20. Anti-Patterns

The following should be treated as UX warnings.

### AP-01 — Admin Clone

Making LearnerLayout visually and structurally identical to AdminLayout.

### AP-02 — Dashboard Wall

Displaying many metric cards before showing the current objective.

### AP-03 — Feature Dump

Exposing every available feature in navigation.

### AP-04 — Metadata First

Showing tool, difficulty, duration, XP, tags, and status before explaining the task.

### AP-05 — LMS Syndrome

Presenting the experience primarily as courses, lessons, and syllabus navigation.

### AP-06 — Tool First

Opening the learner directly into a complex SQL/Excel workspace without sufficient context.

### AP-07 — Amber Everywhere

Using the theme accent on every interactive element.

### AP-08 — Decoration Without Meaning

Adding animation, texture, or detective motifs that do not improve comprehension or storytelling.

---

# 21. Decision Rule

When deciding between two UX implementations, prefer the one that:

1. makes the next action clearer
2. reduces cognitive load
3. strengthens the investigation mental model
4. preserves learner focus
5. provides progressive disclosure
6. supports accessibility
7. avoids unnecessary metadata
8. maintains consistency with the Detective Amber language

---

# 22. Definition of a Good Learner Screen

A good Learner screen should make the learner feel:

> "I know where I am."
>
> "I understand why this matters."
>
> "I know what I need to do."
>
> "I can do it."
>
> "I can see that I am progressing."

If a redesign makes the interface prettier but does not improve these five statements, it is not considered a successful Learner UX improvement.

---

# 23. Non-Negotiable Principle

> **Avi-Mystery is a learning game with data tools — not an LMS with a detective theme.**
