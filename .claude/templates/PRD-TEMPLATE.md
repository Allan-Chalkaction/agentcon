# PRD: [Feature Name]

**Status:** DRAFT | CONSENSUS_IN_PROGRESS | LOCKED | EXECUTING | COMPLETE | BLOCKED
**Slug:** [feature-slug]
**Run:** [docs/pipeline/YYYY-MM-DD/HHmm-RUN-feature-slug/]
**Created:** [TIMESTAMP]
**Updated:** [TIMESTAMP]

---

## 1. Header

| Field | Value |
|---|---|
| Requested by | [user identifier or "user"] |
| CTO verdict | [GO / SIMPLIFY / NO-GO / DEFER] |
| Verdict date | [TIMESTAMP] |
| ADR | [docs/decisions/ADR-NNN-feature-slug.md] |
| Phases | [N] |
| Triggers | [security: yes/no] [if no, brief reason. Architect sets this.] |

---

## 2. CTO Verdict

[Filled by CTO. Full content of cto-verdict.md is also stored at {run_dir}/cto-verdict.md.]

**Decision:** [GO / SIMPLIFY / NO-GO / DEFER]
**Confidence:** [High / Medium / Low]

**One-line summary:** [Single sentence]

**Approved scope:** [What CTO approved. If SIMPLIFY, this is the trimmed scope.]

**Cut from original (if SIMPLIFY):** [Explicit list]

**Architectural concerns flagged:** [What Architect should pay attention to]

**Security considerations flagged:** [Auth, data exposure, attack surface — informs Architect's security trigger decision]

---

## 3. Summary

[2-3 sentences from PM: what this does, why it matters]

---

## 4. User Stories

- As a [role], I want to [action] so that [benefit]
- As a [role], I want to [action] so that [benefit]

---

## 5. Acceptance Criteria

[Numbered, testable, written by PM. Builder targets these phase by phase. QA writes tests directly from these. CTO checks every AC at sign-off for testability.]

**AC-001:** Given [precondition], when [action], then [observable outcome]

**AC-002:** Given [precondition], when [action], then [observable outcome]

**AC-003:** [...]

[Cover happy path, error states, accessibility, permissions. No vague language. Edge cases get their own AC.]

---

## 6. Scope

### In Scope
- [What's included]
- [...]

### Out of Scope
- [What's explicitly deferred]
- [...]

---

## 7. Data Lifecycle

[Required for any feature reading data. PM owns this section.]

| Entity | Source | Created by | Management interface | Status |
|---|---|---|---|---|
| [name] | [existing table / new table / external API] | [admin / user / system] | [path or "NEW in scope" or "DEFERRED"] | [exists / in-scope / deferred] |

**Interim strategy for deferred entities:** [Concrete plan: seed script, manual SQL, import tool. "Will be available later" is not acceptable.]

**External integration details (if applicable):**
- Connection config: [how the integration is configured]
- Record selection / mapping: [who decides which external records appear]
- Sync vs query strategy: [push, pull, live-query, etc]

---

## 8. Architecture Decision

[Architect owns sections 8 through 10.]

### Approach

[1-2 paragraphs: chosen approach and why.]

### Component Structure

```
[Directory tree showing new files and where they live]
```

### Data Model

```sql
-- New tables, columns, migrations
[Concrete SQL]
```

### Access Control

```sql
-- RLS policies, auth guards
[Concrete SQL]
```

### Key Patterns

- "Follow [path/to/component] for the list view"
- "Use the hook pattern from [path/to/hook]"
- "RLS follows the structure from [existing-table]"

### UI Requirements

[Only if feature has UI. Skip otherwise.]

- **Components:** [Which UI primitives from project library]
- **Layout:** [Spacing, grid, breakpoints]
- **Typography:** [Headers, body, hierarchy]
- **Color tokens:** [Specific tokens, not hex values]
- **Interaction states:** [Hover, focus, disabled, loading, error]
- **Accessibility:** [Keyboard nav, ARIA, focus management specific to this feature]
- **Reference component:** [Closest existing component to match]

### Migration Safety

- **Reversible:** [yes / no, why]
- **Backfill needed:** [yes / no, plan if yes]
- **Zero-downtime:** [yes / no, mitigations if not]

### Testing Strategy

| Layer | What gets tested | Test type |
|---|---|---|
| [data] | [what] | unit / integration |
| [api] | [what] | integration |
| [ui] | [what] | unit / integration / e2e |

---

## 9. Phases

[Architect owns. Each phase: independently testable, maps to a subset of AC, ≤5 files, has explicit completion criteria.]

### Phase 1: [Title, action-oriented, ≤60 chars]

**AC covered:** AC-001, AC-002

**Files to touch:**
- `path/to/file1.ts` (new)
- `path/to/file2.ts` (modify)
- `path/to/migration_NNNNN.sql` (new)

**Implementation notes:**

Reference files (Builder reads first during exploration):
- `[path]` — [what to match]
- `[path]` — [what to match]

Patterns to follow:
- [Specific pattern with file reference]

Anti-patterns to avoid:
- [Specific thing not to do, with reasoning]

**Completion criteria:**
- Migration applies cleanly
- Typecheck passes
- AC-001 testable (specific behavior visible at [entry point])
- AC-002 testable (specific behavior visible at [entry point])

---

### Phase 2: [Title]

**AC covered:** AC-003, AC-004

**Files to touch:**
- [...]

**Implementation notes:**
- [...]

**Completion criteria:**
- [...]

---

[Continue for all phases. Foundational work first (migrations, types, shared utilities). Consumer work next (components, integration). Cross-cutting work last (docs).]

---

## 10. Risks + Alternatives Considered

### Alternatives considered

| Alternative | Why rejected |
|---|---|
| [Approach A] | [Reason] |
| [Approach B] | [Reason] |

### Risks + mitigation

| Risk | Likelihood | Mitigation |
|---|---|---|
| [Risk] | [low / med / high] | [plan] |

---

## 11. Consensus

[All sign-offs append here during consensus rounds. Each approval names specific concerns the agent is watching for. PRD is locked when all three are present and there are no open objections.]

### Round 1

**PM Sign-off Request — [TIMESTAMP]**
Sections owned: 3-7
Security trigger candidate: [yes/no, reasoning]
Status: Awaiting CTO sign-off

**CTO Sign-off — [TIMESTAMP]**
✅ APPROVED (sections 3-7)

AC Quality Check: walked through all [N] AC, each testable as written.

Concerns I'm watching during execution:
1. [Specific concern]
2. [Specific concern]

**Architect Sign-off Request — [TIMESTAMP]**
Sections owned: 8, 9, 10
ADR: docs/decisions/ADR-NNN-feature-slug.md
Security trigger: [ON / OFF, reasoning]
Status: Awaiting CTO and PM sign-off

Concerns I'm watching during execution:
1. [Specific concern]
2. [Specific concern]

**CTO Sign-off — [TIMESTAMP]**
✅ APPROVED (sections 8-10)

Concerns I'm watching during execution:
1. [Specific concern]

**PM Sign-off — [TIMESTAMP]**
✅ APPROVED (sections 8-10)

AC Coverage Check: all [N] AC mapped to phases.
Security Trigger Confirmation: [matches my flag / Architect set differently with reasoning ✓]

Concerns I'm watching during execution:
1. [Specific concern]

### Final Lock

```
## Consensus Status: LOCKED
- CTO: ✅ approved [timestamp] (concerns: [N] noted)
- PM: ✅ approved [timestamp] (concerns: [N] noted)
- Architect: ✅ approved [timestamp] (concerns: [N] noted)
- PRD locked: [timestamp]
```

---

## 12. Execution Log

[Auto-populated by Builder, QA, Reviewer, and Security as phases run. Not edited manually.]

### Phase 1
- Builder exploration: `{run_dir}/builds/phase-01-exploration.md` ([TIMESTAMP])
- Builder attempt 1: [READY_FOR_QA at TIMESTAMP] → `{run_dir}/builds/phase-01-attempt-1.md`
- QA attempt 1: [PASS at TIMESTAMP] → `{run_dir}/qa/phase-01-attempt-1-verdict.md`
- Reviewer attempt 1: [PASS at TIMESTAMP] → `{run_dir}/reviewer/phase-01-attempt-1-verdict.md`
- Security: [SKIPPED — trigger off | PASS at TIMESTAMP] → `{run_dir}/security/phase-01-attempt-1-verdict.md`
- Phase status: COMPLETE
- Judgment failures consumed: 0/2

### Phase 2
- Builder exploration: `{run_dir}/builds/phase-02-exploration.md` ([TIMESTAMP])
- Builder attempt 1: [READY_FOR_QA at TIMESTAMP] → `{run_dir}/builds/phase-02-attempt-1.md`
- QA attempt 1: [FAIL at TIMESTAMP] → `{run_dir}/qa/phase-02-attempt-1-findings.md` (judgment failure 1/2)
- Builder attempt 2: [READY_FOR_QA at TIMESTAMP] → `{run_dir}/builds/phase-02-attempt-2.md`
- QA attempt 2: [PASS at TIMESTAMP] → `{run_dir}/qa/phase-02-attempt-2-verdict.md`
- Reviewer attempt 1: [PASS at TIMESTAMP] → `{run_dir}/reviewer/phase-02-attempt-1-verdict.md`
- Security: [PASS at TIMESTAMP] → `{run_dir}/security/phase-02-attempt-1-verdict.md`
- Phase status: COMPLETE
- Judgment failures consumed: 1/2

[...]

---

## 13. Escalations

[Populated only if escalation triggers fire. Empty in clean runs.]

### Escalation Log

[Each escalation: trigger, what was tried, what's blocked, recommended action, user decision.]
