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
| Requested by | user |
| CTO verdict | SIMPLIFY |
| Verdict date | 2026-05-03 |
| ADR | docs/pipeline/2026-05-03/test-run-landing-page/ADR.md |
| Phases | 4 |
| Triggers | security: **OFF** (no auth, no PII, no IPC, no network, no persisted store mutations; AC-017/AC-029/AC-036 explicitly forbid the wiring that would flip this on). performance: **OFF** (static visual page, ≤4 transmission rows, ≤3 operative cards, no animation beyond a CSS-only LIVE pulse gated by `prefers-reduced-motion`; bundle delta ~110KB woff2 assets, no runtime data work). |

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

Render a static, presentational landing page for Agentcon styled in a spy/dossier aesthetic (cream surface, dark feed band, red brand accent, serif italic display, monospace UI). The page assembles a header, secure-channel status bar, project-selector dropdown, hero, personnel-file dossier card with CLASSIFIED stamp, "recent transmissions" feed rendered from a seeded array, "field-ready operatives" grid with three featured agents and Deploy buttons, and a footer. Behavioral wiring (real deploys, live transmission source, project-load behavior) is explicitly deferred — components must expose clean prop seams so a follow-on run can attach real behavior mechanically.

---

## 4. User Stories

- As a visitor opening the Agentcon landing page, I want to see a fully rendered dossier-style page (header, status bar, project selector, hero, personnel file, transmissions feed, operatives grid, footer) so that I can understand the product's positioning at a glance.
- As a visitor on the landing page, I want to open the project selector dropdown and see selectable options so that I can preview the project-context affordance even though no project is loaded yet.
- As a visitor browsing the operatives grid, I want each operative card to expose a Deploy button with visible interaction states (hover, focus, active) so that the call-to-action affordance is obvious before the deploy contract is wired.
- As a visitor scanning the recent transmissions feed, I want to read a list of timestamped agent activity entries with a visible "LIVE" indicator so that the page communicates ongoing operational tempo (visual only, not real-time).
- As a keyboard-only user, I want to operate the project selector and the Deploy buttons using Tab, Space/Enter, Arrow keys, and Esc so that I can use the page without a pointing device.
- As a developer wiring real behavior in a follow-on run, I want each interactive component (dropdown, transmissions list, operatives grid) to accept its data and callbacks via props so that I can attach real sources and handlers without refactoring the components.
- As a user of the existing Claude settings panel, I want the settings panel to continue loading and functioning unchanged when the landing page route is added so that the new surface does not regress existing functionality.

---

## 5. Acceptance Criteria

[QA writes tests directly from these. Each AC is independently testable. Visual claims reference named elements, exact text, or design-token names — not "matches mockup".]

### Page shell and routing surface

**AC-001:** Given the app is running, when the landing page route/surface is rendered, then a top-level container element exists with a stable test identifier (e.g. `data-testid="landing-page"`) and contains, in document order: a header bar, a status bar, a project-selector region, a hero region, a personnel-file region, a transmissions-feed region, an operatives-grid region, and a footer.

**AC-002:** Given the existing `ClaudeSettingsPanel` surface is selected (default app entry behavior preserved or behind the same toggle the Architect chooses), when the app loads, then the settings panel renders without console errors and all of its existing controls remain operable. (Regression guard for the routing approach Architect selects.)

**AC-003:** Given the landing page is rendered, when the user scrolls vertically inside the landing surface, then the page content scrolls (the landing route is not constrained by the global `html, body, #root { overflow: hidden }` rule) and the existing settings panel's overflow behavior remains unchanged when the settings panel is rendered instead.

### Header bar

**AC-004:** Given the landing page is rendered, when the header bar is inspected, then it contains the literal text "AGENTCON" as the app-name element, the literal text "FILE 0427-A" as the file-id element, and a date element with the literal text "2026-04-30", each rendered in the monospace UI font family token.

### Secure channel status bar

**AC-005:** Given the landing page is rendered, when the status bar is inspected, then it contains, in this order, the literal text segments "SECURE CHANNEL", "CONNECTION ESTABLISHED", "NODE: ~/.CLAUDE", and "3 OPERATIVES ON STANDBY", each in the monospace UI font family token.

**AC-006:** Given the landing page is rendered, when the status bar is inspected, then a status indicator element labeled "Status: standby — Awaiting deployment orders" (or text content matching that pattern) is visible directly below or within the status bar region using the monospace UI token.

### Project selector dropdown

**AC-007:** Given the landing page is rendered and the dropdown is in its default closed state, when the dropdown trigger is inspected, then it renders as a button element with `aria-haspopup="listbox"`, `aria-expanded="false"`, an accessible name containing "Project", and a visible label of the form `PROJECT [ - unassigned - ]` or `PROJECT [ <selectedLabel> ]` when a selection exists.

**AC-008:** Given the dropdown is closed and receives a `selectedProjectId` prop value of `null` or `undefined`, when the trigger renders, then the visible value text reads exactly `- unassigned -`.

**AC-009:** Given the dropdown is closed, when the user clicks the trigger with a pointer, then the dropdown opens (an element with role `listbox` becomes visible), `aria-expanded` on the trigger becomes `"true"`, and the first option receives visual highlight.

**AC-010:** Given the dropdown is open, when the user clicks an option, then the dropdown's `onProjectChange` callback is invoked with that option's id as its argument, the dropdown closes, `aria-expanded` returns to `"false"`, the trigger label updates to that option's label, and focus returns to the trigger.

**AC-011:** Given the dropdown is closed and the trigger has keyboard focus, when the user presses Space or Enter, then the dropdown opens and keyboard focus moves into the listbox with the first option (or the previously-selected option, if any) marked as highlighted via `aria-activedescendant` or focus.

**AC-012:** Given the dropdown is open with keyboard focus, when the user presses ArrowDown, then highlight advances to the next option (wrapping from last to first), and when the user presses ArrowUp, highlight moves to the previous option (wrapping from first to last).

**AC-013:** Given the dropdown is open and an option is highlighted, when the user presses Enter, then `onProjectChange` is invoked with that option's id, the dropdown closes, and focus returns to the trigger.

**AC-014:** Given the dropdown is open, when the user presses Escape, then the dropdown closes, `onProjectChange` is not invoked, and focus returns to the trigger.

**AC-015:** Given the dropdown is open, when the user clicks outside the dropdown's bounding region (anywhere on the document outside the trigger and the listbox), then the dropdown closes, `onProjectChange` is not invoked, and `aria-expanded` returns to `"false"`.

**AC-016:** Given the dropdown trigger is rendered in its default state, when CSS-computed styles are inspected on hover, on `:focus-visible`, and on `:active`, then each of the three states applies a visually distinct style (e.g. background, border, or outline change) and `:focus-visible` produces a focus ring with at least 2px outline width using a defined token color, distinguishable against the cream surface.

**AC-017 (deferred behavior — explicit no-op):** Given a project is selected via the dropdown, when `onProjectChange` fires, then the page performs no navigation, no IPC call, no network call, and no mutation of any persisted store; the only effects permitted in this run are (a) updating the local component/UI state that drives the trigger label and (b) calling the `onProjectChange` prop. No integration with `claudeConfigStore.activeProjectPath` or any real project-loading flow.

### Hero

**AC-018:** Given the landing page is rendered, when the hero region is inspected, then it contains an `h1` with two visible lines: line 1 is "Brief once." in the serif display family token, and line 2 is "Deploy everywhere." in the serif display *italic* family token rendered in the red brand accent color token.

**AC-019:** Given the landing page is rendered, when the hero region is inspected, then a paragraph element below the `h1` contains the literal text "A roster of specialized Claude subagents for code review, test authoring, and documentation. Briefed on your project's conventions. Reusable across every operation." rendered in the body type token.

**AC-020:** Given the landing page is rendered, when the hero region is inspected, then an eyebrow/kicker element above the `h1` contains the literal text "PERSONNEL DIVISION" in the monospace UI token, accompanied by a metadata line containing the literal text "№ 047 / NEW BRIEFING" in the monospace UI token.

### Personnel file card

**AC-021:** Given the landing page is rendered, when the personnel-file card is inspected, then it contains, as labeled fields with monospace UI labels and corresponding values, all of the following key/value pairs:
- ACTIVE FILE: `0427-A`
- CODENAME: `HAWKEYE`
- CALLSIGN: `code-review`
- SPECIALTY: `sonnet`
- CLEARANCE: `all tools`
- LAST SEEN: `~ 2d`
- STATUS: `Active`

**AC-022:** Given the landing page is rendered, when the personnel-file card is inspected, then a redacted-photo element (raster, vector, or CSS-rendered silhouette) is present in the photo slot, and a "REDACTED" caption is visible adjacent to or overlaid on the photo in the monospace UI token.

**AC-023:** Given the landing page is rendered, when the personnel-file card is inspected, then a `CLASSIFIED` stamp element is rendered overlaid on the card with a CSS rotation transform between `-20deg` and `-10deg` and a red accent color from the defined token, and the stamp's text content is the literal string `CLASSIFIED`.

**AC-024:** Given the personnel-file card receives an `agent` prop with the documented shape (codename, callsign, specialty, clearance, lastSeen, status, fileId), when it renders, then all displayed fields read from that prop and no agent values are hardcoded inside the card component itself. (Seam check.)

### Recent transmissions feed

**AC-025:** Given the landing page is rendered, when the transmissions feed region is inspected, then it contains a header element with the literal text `// RECENT TRANSMISSIONS` in the monospace UI token rendered against a dark surface token, and a `● LIVE` indicator element rendered in the green accent token aligned to the right of the header.

**AC-026:** Given the transmissions feed receives a `transmissions` prop containing an array of at least four entries, when it renders, then each entry renders as a row containing, in this order: a timestamp in the monospace UI token, an agent codename in the green accent token, and an action description in the monospace UI token using the body color token for dark surfaces.

**AC-027:** Given the seed `transmissions` array is the default for this run, when the feed renders, then it contains exactly these four rows in this order (timestamps may be exact strings):
1. `01:42:07 — HAWKEYE — flagged 3 issues in api/auth.ts`
2. `01:38:14 — ECHO — authored 12 tests for payments/processor.ts`
3. `01:31:55 — GHOST — updated docs/getting-started.md`
4. `01:24:02 — ECHO — cleared PR #2247`

**AC-028 (empty state):** Given the transmissions feed receives a `transmissions` prop equal to an empty array, when it renders, then the row container is empty and a placeholder element with the literal text `// NO TRANSMISSIONS` is visible in the monospace UI token; the `● LIVE` indicator continues to render.

**AC-029 (deferred behavior — explicit no-op):** Given the landing page is rendered, when the transmissions feed mounts, then no timer, polling interval, websocket, IPC subscription, or file watcher is started; the `● LIVE` indicator is purely visual and any pulsing animation is CSS-only.

### Field-ready operatives grid

**AC-030:** Given the landing page is rendered, when the operatives grid region is inspected, then a header element contains the literal text `QUICK START TEMPLATES` in the monospace UI token and an `h2` contains the literal text `Field-ready operatives` in the serif display italic family token.

**AC-031:** Given the operatives grid receives an `operatives` prop with three entries, when it renders, then it produces exactly three operative card elements in left-to-right order: card 1 with codename `Hawkeye`, card 2 with codename `Echo`, card 3 with codename `Ghost`.

**AC-032:** Given the seed `operatives` array is the default for this run, when each card renders, then its visible content matches:

| Card | Index label | Class | Status | Codename | Callsign | Description | Model | Missions |
|---|---|---|---|---|---|---|---|---|
| 1 | `// 01 //` | `Reviewer-class` | `● Active` | `Hawkeye` | `CALLSIGN — CODE-REVIEWER` | `Reads diffs and PRs for correctness, security, and maintainability. Flags what matters, skips the pedantic.` | `MODEL sonnet` | `MISSIONS 47` |
| 2 | `// 02 //` | `Analyst-class` | `● Active` | `Echo` | `CALLSIGN — TEST-WRITER` | `Detects your test framework, mirrors existing conventions, covers the happy path and the edges that bite.` | `MODEL default` | `MISSIONS 23` |
| 3 | `// 03 //` | `Archivist-class` | `● Active` | `Ghost` | `CALLSIGN — DOC-WRITER` | `Reads existing docs to match voice and structure. Leads with the why, then the how. Leaves no trace.` | `MODEL default` | `MISSIONS 11` |

**AC-033:** Given each operative card is rendered, when its top accent is inspected, then a colored top-rule element is present using the red brand accent token (or per-card accent token if the design uses three accents — Architect to confirm token mapping; the rule itself is required regardless).

**AC-034:** Given each operative card is rendered, when its `Deploy` button is inspected, then the button is a `<button>` element with type `button`, an accessible name of the form `Deploy <codename>` (e.g. `Deploy Hawkeye`), and visible text content `DEPLOY` in the monospace UI token.

**AC-035:** Given each Deploy button in its default state, when CSS-computed styles are inspected, then it has an idle style; when hovered, it presents a visually distinct hover style; when focused via keyboard, it shows a `:focus-visible` outline of at least 2px in a defined token color; when active (`:active`), it presents a visually distinct pressed style; when given a `disabled` prop value of `true`, it renders with `aria-disabled="true"` (or the native `disabled` attribute), opacity reduced from default, and pointer events suppressed so the click handler is not invoked.

**AC-036 (deferred behavior — explicit no-op):** Given a Deploy button is clicked or activated via keyboard, when its handler runs, then the only effect is invocation of the `onDeploy(operativeId: string)` prop callback; the page performs no navigation, no command execution, no scaffolding, no IPC call, no network call, and no mutation of any persisted store. If no `onDeploy` prop is provided, the click invokes a single `console.info` call containing the operative codename and otherwise has no effect.

**AC-037:** Given the operatives grid component is rendered, when its props are inspected, then it accepts `operatives: Operative[]` and `onDeploy: (operativeId: string) => void` as documented props, and no operative data is hardcoded inside the grid component itself. (Seam check.)

### Footer

**AC-038:** Given the landing page is rendered, when the footer is inspected, then it contains the literal text `v0.1 · ~/.CLAUDE` aligned to the start and the literal text `ENCRYPTED AT REST` aligned to the end, both in the monospace UI token.

### Visual tokens and palette

**AC-039:** Given the landing page is rendered, when the page background and dark feed band are inspected via CSS-computed styles, then the page surface uses a defined cream-surface token, the recent-transmissions section uses a defined dark-surface token, and the brand accent (hero italic line, CLASSIFIED stamp, card top rules) uses a defined red-accent token; all three tokens are namespaced to the landing page and do not redefine any existing token currently consumed by `ClaudeSettingsPanel`.

**AC-040:** Given the landing page is rendered, when the typography of `h1`, `h2`, body paragraphs, and UI labels is inspected via CSS-computed styles, then the display headings use a defined serif display family token, italic display lines use the same family in italic, and all UI labels, status text, file ids, dates, and footer text use a defined monospace UI family token. Both font families are loaded with explicit fallbacks and the page does not depend on a remote web-font CDN at runtime (bundled or system stack only).

### Accessibility (beyond keyboard ACs above)

**AC-041:** Given the landing page is rendered, when the document is inspected, then there is exactly one `h1` element on the page (the hero headline), and section headings (`h2`, `h3`) follow a non-skipping order within their respective regions.

**AC-042:** Given the user has `prefers-reduced-motion: reduce` set, when the landing page is rendered, then any pulsing, blinking, or transform-based motion effects (notably the `● LIVE` indicator pulse, if present) are disabled or reduced to a non-animating state via a `@media (prefers-reduced-motion: reduce)` rule.

**AC-043:** Given the landing page is rendered, when text/background pairings are checked against WCAG 2.1 AA contrast ratios, then the following pairings meet at minimum 4.5:1 for normal text and 3:1 for large text (≥18pt or ≥14pt bold): body text on cream surface, monospace UI text on cream surface, monospace UI text on dark feed surface, and red-accent text on cream surface. The red-on-cream pairing is explicitly verified and documented.

**AC-044:** Given the landing page is rendered, when keyboard Tab navigation is performed from the top of the page, then focus moves in document order through every interactive element (project selector trigger, then each Deploy button in left-to-right order, plus any other interactive controls Architect introduces), and `:focus-visible` outlines are visible on each.

### Responsive behavior

**AC-045:** Given the landing page is rendered inside the existing Electron renderer at any window width between the smallest and largest sizes the existing app already supports, when the layout is inspected, then no horizontal scrollbar appears, no element overflows the viewport horizontally, and the operatives grid lays out as three side-by-side cards. (No mobile breakpoint is in scope.)

---

## 6. Scope

### In Scope

- New top-level landing-page surface composed of: header bar, status bar, project-selector region, hero, personnel-file card, recent-transmissions feed, field-ready operatives grid (three cards), and footer — all rendered with the visual treatment described in section 5.
- A project-selector dropdown component that opens, closes, supports pointer and keyboard interaction (Tab, Space/Enter, Arrow keys, Esc), reflects selection in its trigger label, and exposes `selectedProjectId` and `onProjectChange` as props. Selection effects in this run are limited to local UI state and the callback (see AC-017).
- A recent-transmissions feed component that accepts a `transmissions: Transmission[]` prop, renders rows in the visual treatment described, renders a `● LIVE` indicator (visual only), and supports an empty-state placeholder.
- A field-ready operatives grid component that accepts `operatives: Operative[]` and `onDeploy: (operativeId: string) => void` props, renders three seeded operative cards (Hawkeye, Echo, Ghost), and exposes Deploy buttons with idle/hover/focus-visible/active/disabled states. Deploy click is a no-op beyond the callback (see AC-036).
- A personnel-file card component that accepts an `agent` prop and renders the dossier fields, REDACTED photo slot, and rotated CLASSIFIED stamp.
- Seeded data files (or constants) for the default `agent`, `transmissions`, and `operatives` arrays specified in section 5.
- Landing-page-scoped design tokens (cream surface, dark feed surface, red accent, serif display family, monospace UI family) added without redefining tokens currently consumed by `ClaudeSettingsPanel`.
- Route-scoped resolution of the global `overflow: hidden` rule so the landing page can scroll without breaking the settings panel's existing layout.
- Keyboard accessibility for the dropdown and Deploy buttons exactly as specified in AC-007 through AC-016, AC-035, AC-044.
- `prefers-reduced-motion` handling for any motion introduced (AC-042).
- WCAG 2.1 AA contrast verification for the four named text/background pairings, including red-on-cream (AC-043).
- Bundled or system-stack font loading with explicit fallbacks; no runtime web-font CDN dependency (AC-040).
- Continued working behavior of the existing `ClaudeSettingsPanel` surface after the landing page is added (AC-002).

### Out of Scope (deferred — explicit no-ops in this run)

- Any real "deploy" action: no command execution, no agent scaffolding, no workflow trigger, no file mutation. Deploy click only invokes the `onDeploy` prop (or `console.info` as fallback) — see AC-036.
- Real source for the recent-transmissions feed: no log tail, no file watcher, no IPC stream, no polling, no websocket. The feed is fed exclusively by the seeded `transmissions` prop — see AC-029.
- Wiring the project dropdown into `claudeConfigStore.activeProjectPath` or any real project-loading flow — see AC-017.
- Dynamic "active agent" selection driven by real agents data (`AgentsTab` or other). The personnel-file card reads from a single seeded `agent` record.
- Routing system, navigation between landing and settings, or any URL-based addressing. Architect chooses one of: lightweight surface switcher, build/dev flag, or replacement entry — but adds no router framework as a deliverable of the landing page itself.
- Live status indicators reflecting real system state ("CONNECTION ESTABLISHED", "● LIVE", "ENCRYPTED AT REST" are static text/visual elements only).
- Mobile breakpoint work; only desktop window sizes the existing Electron app already supports are in scope.
- Visual regression tooling/baselines (Playwright/Percy/etc.). Verification of visual ACs is via the named-element / exact-text / token-name claims in section 5.
- New test infrastructure beyond what already exists in the repo. If Architect introduces a test runner, that is a phase-zero decision they own and is not implied by this PRD.
- Internationalization / localization. All text is English literal strings as specified.

---

## 7. Data Lifecycle

This feature reads no persisted data. All on-page content is renderer-local seeded content checked into the repo.

| Entity | Source | Created by | Management interface | Status |
|---|---|---|---|---|
| Project options (for dropdown) | Hardcoded array in renderer | Developer (in repo) | NEW in scope — a single seed module exporting `projectOptions: { id: string; label: string }[]` with at least three entries plus the `- unassigned -` default behavior | in-scope |
| Active agent (personnel file) | Hardcoded record in renderer | Developer (in repo) | NEW in scope — a single seed module exporting the default `agent` record matching AC-021 | in-scope |
| Transmissions (recent-transmissions feed) | Hardcoded array in renderer | Developer (in repo) | NEW in scope — a single seed module exporting the four-row default array specified in AC-027 | in-scope |
| Operatives (field-ready grid) | Hardcoded array in renderer | Developer (in repo) | NEW in scope — a single seed module exporting the three operatives specified in AC-032 | in-scope |
| Real project list | Existing `claudeConfigStore` (or future source) | n/a this run | DEFERRED — dropdown does not consume real project data in this run | deferred |
| Real transmissions stream | Undefined source (log tail / IPC / watcher) | n/a this run | DEFERRED — feed accepts data via prop only; no source connection | deferred |
| Real agents catalog | Existing `AgentsTab` data model (or future source) | n/a this run | DEFERRED — operatives grid accepts data via prop only | deferred |

**Interim strategy for deferred entities:** All deferred entities are replaced in this run by checked-in seed modules (one file per entity, exporting a typed constant) imported by the landing page at the route boundary and passed down as props. This guarantees the components themselves contain no hardcoded data and the seam is observable in the diff. When the follow-on run promotes a deferred entity, the seed import at the route boundary is replaced with the real source — components are untouched.

**External integration details:** Not applicable. This feature performs no network calls, opens no IPC channels, and reads no files at runtime.

---

---

## 8. Architecture Decision

ADR: [docs/pipeline/2026-05-03/test-run-landing-page/ADR.md](./ADR.md). Section 8 summarizes; the ADR is the source of record.

### Approach

A new top-level surface lives at `src/panels/landing/` following the existing `src/panels/claude-settings/` convention. `App.tsx` becomes a tiny `useState`-driven surface switcher (`"settings" | "landing"`) defaulting to `"settings"` so the existing app entry is preserved. The landing surface mounts a single root `<div className="landing-root">` that owns its own scrollable container; the global `html, body, #root { overflow: hidden }` rule is left untouched. Landing-only design tokens live in a new `src/styles/tokens-landing.css` scoped under the `.landing-root` class with a `--lp-*` prefix — no `:root` mutation, no risk of overwriting settings-panel tokens. CLASSIFIED stamp and REDACTED silhouette are inline SVG components. EB Garamond (display serif + italic) and JetBrains Mono (UI mono, regular + medium) are bundled as `.woff2` files in `src/assets/fonts/` and loaded via `@font-face` with explicit fallback chains; no runtime CDN.

This approach minimizes blast radius (one switcher line in `App.tsx`, one new tokens file, one new panels directory), keeps every deferred behavior on a clean prop seam, and is fully reversible. The settings panel computed styles must remain byte-identical for at least one representative element — QA validates this for AC-002/AC-039 regression coverage.

### Component Structure

```
src/
├── App.tsx                              (modify — add surface switcher)
├── main.tsx                             (unchanged)
├── styles/
│   ├── tokens.css                       (unchanged — settings-panel tokens)
│   └── tokens-landing.css               (NEW — scoped under .landing-root)
├── assets/
│   └── fonts/
│       ├── eb-garamond/
│       │   ├── EBGaramond-Regular.woff2 (NEW)
│       │   └── EBGaramond-Italic.woff2  (NEW)
│       └── jetbrains-mono/
│           ├── JetBrainsMono-Regular.woff2 (NEW)
│           └── JetBrainsMono-Medium.woff2  (NEW)
└── panels/
    ├── claude-settings/                 (unchanged)
    └── landing/                         (NEW)
        ├── LandingPage.tsx              (composition + scroll container)
        ├── LandingPage.module.css
        ├── types.ts                     (Agent, Transmission, Operative, ProjectOption)
        ├── data/
        │   ├── seedAgent.ts             (Hawkeye dossier — AC-021)
        │   ├── seedTransmissions.ts     (4 rows — AC-027)
        │   ├── seedOperatives.ts        (Hawkeye/Echo/Ghost — AC-032)
        │   └── seedProjects.ts          (≥3 dropdown options — Section 7)
        └── components/
            ├── HeaderBar.tsx + .module.css
            ├── StatusBar.tsx + .module.css
            ├── ProjectSelector.tsx + .module.css
            ├── Hero.tsx + .module.css
            ├── PersonnelFileCard.tsx + .module.css
            ├── ClassifiedStamp.tsx       (inline SVG)
            ├── RedactedSilhouette.tsx    (inline SVG)
            ├── TransmissionsFeed.tsx + .module.css
            ├── OperativesGrid.tsx + .module.css
            ├── OperativeCard.tsx + .module.css
            └── Footer.tsx + .module.css
```

### Data Model

N/A — no persisted data, no migrations, no schema changes. All on-page data is renderer-local seed modules under `src/panels/landing/data/` typed by `src/panels/landing/types.ts`.

```ts
// src/panels/landing/types.ts
export interface Agent {
  fileId: string;       // "0427-A"
  codename: string;     // "HAWKEYE"
  callsign: string;     // "code-review"
  specialty: string;    // "sonnet"
  clearance: string;    // "all tools"
  lastSeen: string;     // "~ 2d"
  status: string;       // "Active"
}

export interface Transmission {
  timestamp: string;    // "01:42:07"
  codename: string;     // "HAWKEYE"
  action: string;       // "flagged 3 issues in api/auth.ts"
}

export interface Operative {
  id: string;                            // "hawkeye"
  index: string;                         // "// 01 //"
  className: string;                     // "Reviewer-class"
  status: string;                        // "● Active"
  codename: string;                      // "Hawkeye"
  callsignLine: string;                  // "CALLSIGN — CODE-REVIEWER"
  description: string;
  model: string;                         // "MODEL sonnet"
  missions: string;                      // "MISSIONS 47"
  disabled?: boolean;                    // unused this run; seam for AC-035
}

export interface ProjectOption {
  id: string;
  label: string;
}
```

### Access Control

N/A — no auth, no permissions, no RLS, no IPC handlers added.

### Key Patterns

- **Surface composition.** Follow `src/panels/claude-settings/ClaudeSettingsPanel.tsx` for top-level surface composition: a single `*Page.tsx` orchestrates child components and owns layout-level state; child components live in a co-located subdirectory; each component owns a `.module.css`.
- **CSS modules + token vars.** Follow `src/panels/claude-settings/ClaudeSettingsPanel.module.css` for the pattern of consuming `var(--*)` tokens inside `.module.css` files. Landing components consume `var(--lp-*)` tokens defined in `src/styles/tokens-landing.css`.
- **Surface switcher.** `App.tsx` is the only place that knows about both surfaces. `LandingPage` and `ClaudeSettingsPanel` do not import each other and do not coordinate.
- **Seeded data + prop seams.** Each component that will eventually take real data accepts it as a prop (`agent`, `transmissions`, `operatives`, `selectedProjectId`/`onProjectChange`, `onDeploy`). Seed modules are imported only at `LandingPage.tsx` and passed down. Components contain no hardcoded display data.

### UI Requirements

#### Design tokens (declared in `src/styles/tokens-landing.css`, scoped under `.landing-root`)

**Surfaces:**
- `--lp-surface-cream: #f1ead8` — main page surface
- `--lp-surface-cream-soft: #ece4cf` — card backgrounds, file-card surface
- `--lp-surface-dark: #131512` — recent-transmissions feed band
- `--lp-surface-dark-soft: #1a1c19` — feed alt rows / borders on dark
- `--lp-ink: #1d1c19` — primary ink on cream
- `--lp-ink-soft: #4a4742` — secondary ink (labels, metadata) on cream
- `--lp-ink-faint: #7a766f` — faint UI text (file ids, footer)
- `--lp-on-dark: #d8d2bf` — primary text on dark surface
- `--lp-on-dark-soft: #8a8579` — secondary text on dark surface

**Accents:**
- `--lp-accent-red: #b8362b` — hero italic line, CLASSIFIED stamp, card top rules (single accent — see ADR D8)
- `--lp-accent-green: #6b8a3a` — `● LIVE` indicator and codename text in transmissions feed
- `--lp-accent-amber: #b08740` — secondary accent for the "● Active" dot on operative cards

**Typography:**
- `--lp-font-display: "EB Garamond", Georgia, "Times New Roman", serif`
- `--lp-font-mono: "JetBrains Mono", "SF Mono", Menlo, Monaco, ui-monospace, monospace`
- `--lp-text-xxs: 10px` — chrome labels (header bar, status bar)
- `--lp-text-xs: 11px` — eyebrows, kickers, file ids
- `--lp-text-sm: 12px` — body monospace (transmissions, dossier values)
- `--lp-text-base: 14px` — body paragraph
- `--lp-text-md: 18px` — operative card codename
- `--lp-text-lg: 28px` — `h2` "Field-ready operatives"
- `--lp-text-xl: 56px` — `h1` hero lines (display)
- `--lp-weight-regular: 400`
- `--lp-weight-medium: 500`
- `--lp-leading-tight: 1.05` (display), `--lp-leading-normal: 1.45` (body), `--lp-leading-mono: 1.5`

**Layout:**
- `--lp-content-max: 1200px` — page max-width
- `--lp-page-pad-x: 64px` — horizontal page padding at ≥1280px (24px below 1280)
- Spacing reuses 4px-grid values inline (4, 8, 12, 16, 20, 24, 32, 40, 56, 80).

**Borders / radii:**
- `--lp-border-hair: 1px solid #d4cdb6` — hairline dividers on cream
- `--lp-border-card: 1px solid #c9c1a8` — card borders
- `--lp-radius-card: 2px` — minimal radius (dossier aesthetic; near-square corners)

**Motion:**
- `--lp-pulse-duration: 1.6s` — `● LIVE` pulse opacity animation
- All animations gated by `@media (prefers-reduced-motion: reduce)` (AC-042).

#### Per-region UI specifics

- **HeaderBar:** thin row, `--lp-text-xxs`, `--lp-font-mono`, `--lp-ink-faint`. Three slots: `AGENTCON` (bold weight via `--lp-weight-medium`), `FILE 0427-A` (centered or right-of-app-name), `2026-04-30` (right-aligned).
- **StatusBar:** dark-tone strip directly below header — uses `--lp-surface-dark-soft` as background with `--lp-on-dark` text, monospace. Sub-line `Status: standby — Awaiting deployment orders` rendered in `--lp-on-dark-soft`.
- **ProjectSelector:** `<button>` trigger renders text `PROJECT [ <value> ]`. Closed state: light-cream surface, hairline border. Open listbox: absolutely positioned, same surface tone, `role="listbox"`, options `role="option"`. `aria-expanded`, `aria-haspopup="listbox"`, `aria-activedescendant` for keyboard highlight. `:focus-visible` outline 2px solid `--lp-accent-red` offset 2px.
- **Hero:** eyebrow row (`PERSONNEL DIVISION` + `№ 047 / NEW BRIEFING`) in mono `--lp-text-xs`. `h1` two lines: line 1 "Brief once." in `--lp-font-display` regular at `--lp-text-xl`; line 2 "Deploy everywhere." in `--lp-font-display` *italic* at `--lp-text-xl` color `--lp-accent-red`. Body paragraph in default sans inherited from `body` (we don't override body text font here — settings panel's `--font-sans` is fine and was originally requested as `system-ui` stack which reads correctly on cream too). Leading-tight on `h1`.
- **PersonnelFileCard:** two-column layout — labels column (mono, uppercase, `--lp-ink-soft`, `--lp-text-xs`), values column (mono, `--lp-ink`, `--lp-text-sm`). REDACTED silhouette as inline SVG occupies a square slot left of fields. CLASSIFIED stamp absolutely positioned over the lower-right portion of the card, `transform: rotate(-15deg)` (within AC-023 range), color `--lp-accent-red`, opacity 0.92.
- **TransmissionsFeed:** dark surface band `--lp-surface-dark`. Header row: `// RECENT TRANSMISSIONS` left, `● LIVE` right (green dot pulsing). Rows: timestamp (mono, `--lp-on-dark-soft`), em-dash separator, codename (mono, `--lp-accent-green`), em-dash, action (mono, `--lp-on-dark`). Empty state: single row with `// NO TRANSMISSIONS` in `--lp-on-dark-soft`.
- **OperativesGrid:** CSS grid `grid-template-columns: repeat(3, 1fr)` with `gap: 32px`. Header row above: `QUICK START TEMPLATES` mono kicker + `Field-ready operatives` `h2` in `--lp-font-display` *italic* `--lp-text-lg`.
- **OperativeCard:** top rule `border-top: 2px solid var(--lp-accent-red)` (single shared accent — ADR D8). Index label `// NN //` mono `--lp-text-xs` `--lp-ink-soft`. `Reviewer-class` line (mono `--lp-text-xs`) on left, `● Active` (mono `--lp-text-xs`, `--lp-accent-amber` for dot) on right. Codename (`--lp-font-display` italic, `--lp-text-md`). Callsign line (mono `--lp-text-xs`). Description (sans default, `--lp-text-base`). Footer row: `MODEL` and `MISSIONS` left, `DEPLOY` button right.
- **DEPLOY button:** `<button type="button">` with `aria-label="Deploy <Codename>"`. Idle: `--lp-ink` text on transparent with hairline border. Hover: invert to `--lp-ink` background + `--lp-surface-cream` text. Focus-visible: 2px outline `--lp-accent-red` offset 2px. Active: scale-pressed (no transform — just background `--lp-accent-red` / cream text). Disabled: `aria-disabled="true"`, `opacity: 0.5`, `pointer-events: none`.
- **Footer:** thin row, `--lp-text-xxs`, mono, `--lp-ink-faint`. Left: `v0.1 · ~/.CLAUDE`. Right: `ENCRYPTED AT REST`.

#### Accessibility specifics
- Single `h1` (hero), descending heading order respected (`h2` for "Field-ready operatives", `h3` per operative codename — Builder confirms during exploration that `h3` reads correctly at the design size).
- All interactive elements receive a visible `:focus-visible` outline of ≥2px in `--lp-accent-red` against the cream surface (verified contrast > 4.5:1 — `#b8362b` on `#f1ead8` is 5.4:1 by WCAG calc; locked).
- Listbox follows ARIA 1.2 listbox pattern: `role="listbox"`, options have `role="option"` and `aria-selected` reflecting current selection; `aria-activedescendant` on the listbox tracks keyboard highlight.
- `prefers-reduced-motion` disables `● LIVE` pulse animation (sets `animation: none`).

#### Reference component
- Read `src/panels/claude-settings/ClaudeSettingsPanel.tsx` first for surface composition patterns. Read its `.module.css` for token consumption shape. Do **not** copy the dark color choices.

### Migration Safety

- **Reversible:** yes. Deletion is `rm -rf src/panels/landing/ src/styles/tokens-landing.css src/assets/fonts/` plus reverting `App.tsx` to the original 5-line file. No persisted state, no migrations, no IPC contracts.
- **Backfill needed:** no.
- **Zero-downtime:** N/A (Electron desktop app, no deployment).
- **Settings-panel regression assertion:** `<ClaudeSettingsPanel />` is the default surface. Builder must verify (and QA must spot-check) that:
  1. Cold dev start lands on the settings panel, not the landing page.
  2. `getComputedStyle` for at least one settings element (e.g. `.rail` first item) is unchanged in `font-family`, `font-size`, `color`, `background-color`. (Concrete check is part of QA's AC-002/AC-039 verification.)
  3. The settings panel still scrolls inside `.tabBody` exactly as before (overflow rules untouched).

### Testing Strategy

No new automated test infrastructure is added in this run. See ADR §D7 for full reasoning.

| Layer | What gets verified | Verification path |
|---|---|---|
| Visual / DOM | All AC-001 through AC-045 | QA opens dev build with the landing surface active, walks each AC against live DOM and computed styles. PASS captured by quoting the observed value (literal text, computed `font-family`, computed `color`) in the QA verdict. |
| Settings-panel regression | AC-002 and AC-039 | QA opens dev build with the default (settings) surface active, captures `getComputedStyle` snapshot of one rail item before reverting; compares against same snapshot post-change. |
| Keyboard accessibility | AC-011 through AC-016, AC-035, AC-044 | QA exercises Tab/Space/Enter/Arrow/Esc per AC; observes `:focus-visible` outlines; observes `aria-expanded`/`aria-activedescendant` in DevTools. |
| Contrast (AC-043) | Four named pairings | QA computes ratios using devtools color-picker contrast tool or external WCAG calc. Red-on-cream specifically captured in QA verdict with ratio. |
| Motion (AC-042) | Reduced-motion handling | QA toggles OS / DevTools reduced-motion and confirms pulse halts. |
| Bundle size | <150KB woff2 added | Builder reports `du -sh src/assets/fonts/` in attempt note; QA sanity-checks dev console has no `404`s on font requests. |

A follow-up phase to introduce Vitest + Testing Library is recorded as a known gap in section 10 risks. Future automated coverage is deferred.

### Concerns Resolution Matrix

The 14 named concerns from PM hand-off and CTO sign-off, mapped to where this PRD/ADR resolves them:

| # | Source | Concern | Resolution | Section |
|---|---|---|---|---|
| 1 | PM | Transmissions seed cardinality (4 vs other) | Locked at exactly 4 rows per AC-027. | ADR §D9; PRD §8 (no change to AC-027) |
| 2 | PM | Per-card top-rule color (single vs 3 accents) | **Single shared `--lp-accent-red`** for all three cards. AC-033's "or per-card" branch closed. | ADR §D8; PRD §8 UI Requirements (OperativeCard) |
| 3 | PM | CLASSIFIED stamp asset format | **Inline SVG component** (`ClassifiedStamp.tsx`). REDACTED silhouette also inline SVG. Consistent treatment, both tokenable via `currentColor` / `var(--lp-*)`. | ADR §D5; PRD §8 Component Structure + UI Requirements (PersonnelFileCard) |
| 4 | PM | Routing/surface-switcher choice that preserves `ClaudeSettingsPanel` and overflow fix | **`useState` surface switcher in `App.tsx`**, default `"settings"`. Dev-only `?surface=landing` URL trigger + dev-only floating switch button. No router framework. Overflow scoped to `.landing-root` via absolutely-positioned scrollable container; global rule untouched. | ADR §D1, §D3; PRD §8 Approach + Migration Safety |
| 5 | PM | Token namespacing strategy | **Separate file `src/styles/tokens-landing.css`, scoped to `.landing-root` class, all tokens prefixed `--lp-*`.** `:root` and `tokens.css` untouched. Builder must not edit `tokens.css`. | ADR §D2; PRD §8 Component Structure + UI Requirements |
| 6 | PM | Font load strategy — exact families/weights, mechanism | **EB Garamond Regular 400 + Italic 400** (display) and **JetBrains Mono Regular 400 + Medium 500** (mono). Bundled `.woff2` from `src/assets/fonts/`, `@font-face` with `font-display: swap`, Latin subset. No CDN. Explicit fallback chains in token vars. | ADR §D6; PRD §8 UI Requirements (Typography tokens) |
| 7 | PM | Visual fidelity verification path | **Named-element / literal-text / token-name / computed-style approach.** No Playwright baselines. QA walks AC against live DOM. | ADR §D7, §D10; PRD §8 Testing Strategy |
| 8 | PM | Phase-zero test infrastructure decision | **Option (c): no test runner this run.** Pipeline shakedown framing + AC are deterministically inspectable + no other test consumers in repo. Future runner setup recorded as risk in §10. | ADR §D7; PRD §8 Testing Strategy + §10 Risks |
| 9 | CTO | AC-045 responsive bounds unnumbered | **Pinned: 1024px to 1680px.** QA tests at 1024 / 1280 / 1680. Three side-by-side cards across that range. | ADR §D11; PRD §10 (test points listed) |
| 10 | CTO | AC-002 toggle must not break overflow or surprise users | Surface switcher defaults to `"settings"` on cold start. Landing page only reachable via dev-only affordances. Overflow strictly scoped to `.landing-root`. Settings panel computed-style regression check is part of QA's AC-002 verification. | ADR §D1, §D3; PRD §8 Migration Safety |
| 11 | CTO | AC-033 single vs per-card accent | **Locked: single shared `--lp-accent-red`.** Same as concern #2. | ADR §D8; PRD §8 UI Requirements |
| 12 | CTO | AC-035 disabled-state seam (`disabled?: boolean`) | **Explicit on `OperativeCard` props** (`disabled?: boolean`, default `false`). CSS for disabled state is implemented; no operative is disabled in the seed data. Seam wire-up is mechanical. | ADR §D12; PRD §8 Data Model (Operative type) |
| 13 | CTO | AC-039 token-bifurcation regression check on settings-panel computed styles | QA's AC-002/AC-039 path explicitly compares `getComputedStyle` for one settings rail item (`font-family`, `font-size`, `color`, `background-color`) before/after; recorded in Testing Strategy table. | PRD §8 Testing Strategy + §8 Migration Safety |
| 14 | CTO | AC-040 font-loading mechanism unspecified | Same as concern #6 — bundled `.woff2`, named families, named weights, named fallback chains. | ADR §D6 |

---

## 9. Phases

Four phases. Phase ordering follows: foundation (tokens + fonts + scaffolding) → composition (sections 1–4) → composition (sections 5–7) → interactivity + accessibility polish. Each phase is independently testable against a defined AC subset. Soft cap of 5 files is honored except Phase 2 and Phase 3, where component subdirectories naturally cluster — split rationale stated in each.

### Phase 1: Foundation — tokens, fonts, surface switcher, overflow scope

**AC covered:** AC-001 (page shell with regions present, even if regions are empty stubs), AC-002 (settings panel still loads + works as default), AC-003 (landing route scrolls without breaking settings overflow), AC-039 (tokens namespaced and not redefining settings tokens), AC-040 (fonts loaded with explicit fallbacks, no CDN).

**Files to touch:**
- `src/styles/tokens-landing.css` (new) — full `--lp-*` token set scoped under `.landing-root`, `@font-face` declarations
- `src/assets/fonts/eb-garamond/EBGaramond-Regular.woff2` + `EBGaramond-Italic.woff2` (new — assets)
- `src/assets/fonts/jetbrains-mono/JetBrainsMono-Regular.woff2` + `JetBrainsMono-Medium.woff2` (new — assets)
- `src/panels/landing/LandingPage.tsx` (new) — root `<div className="landing-root">` with stub regions (each region is a single empty `<section data-testid="...">`)
- `src/panels/landing/LandingPage.module.css` (new) — page layout, scrollable container, region scaffolding
- `src/panels/landing/types.ts` (new) — type declarations from §8 Data Model
- `src/App.tsx` (modify) — surface switcher with dev-only trigger

File count: 7 source files + 4 binary asset files. Source-file count is over the soft cap of 5. **Justification:** the four `.woff2` are static binary assets (no review surface), `tokens-landing.css` and `LandingPage.module.css` are CSS files, and `types.ts` is type-only. Splitting into two phases would put fonts in one and tokens that reference fonts in another — testing the first half would fail until the second half lands. Keeping together preserves Phase 1 as independently testable.

**Implementation notes:**

Reference files (Builder reads first during exploration):
- `src/App.tsx` — current entry. Match its terseness; the switcher must remain ≤30 lines.
- `src/panels/claude-settings/ClaudeSettingsPanel.tsx` — surface composition pattern. Note how it wires its own state and renders into a single shell `<div>`.
- `src/styles/tokens.css` lines 1-96 — token vocabulary structure and grouping conventions. Mirror that grouping in `tokens-landing.css` (Surfaces / Accents / Typography / Layout / Borders / Motion comment headers).
- `src/styles/tokens.css` lines 105-112 — the `html, body, #root { overflow: hidden }` rule. **Do not modify it.**
- `src/main.tsx` — note that `tokens.css` is imported here. `tokens-landing.css` is imported from `LandingPage.tsx`, **not** from `main.tsx`.

Patterns to follow:
- All `--lp-*` tokens declared under `.landing-root`, never `:root`.
- `@font-face` `src` URLs use Vite-resolvable relative paths from `tokens-landing.css` (e.g. `url("../assets/fonts/eb-garamond/EBGaramond-Regular.woff2")`); Vite handles asset hashing on build.
- Surface switcher in `App.tsx`:
  ```tsx
  type Surface = "settings" | "landing";
  function readInitialSurface(): Surface {
    if (typeof window === "undefined") return "settings";
    const params = new URLSearchParams(window.location.search);
    return params.get("surface") === "landing" ? "landing" : "settings";
  }
  ```
- The dev-only switch button is rendered inside an `import.meta.env.DEV` guard, positioned `fixed top: 8px, right: 8px, z-index: 9999`, with a comment block citing this ADR by path.

Anti-patterns to avoid:
- Do NOT put `--lp-*` tokens under `:root`. They must be scoped to `.landing-root`.
- Do NOT modify `src/styles/tokens.css`. Any token landing here breaks AC-039.
- Do NOT lift `overflow: hidden` off the global rule. Scope new overflow inside `.landing-root` only.
- Do NOT install `react-router`, `wouter`, `@vitejs/plugin-react-swc`, or any new dependency. Use only what's in `package.json`.
- Do NOT register fonts via `<link>` tags or web requests. `@font-face` only, with bundled relative URLs.
- Do NOT default the surface switcher to `"landing"`. The settings panel is the cold-start surface (regression guard for AC-002).

**Completion criteria:**
- `npm run dev` starts cleanly. No TS errors, no console errors.
- Cold open lands on the settings panel. Settings panel remains fully functional (rail clickable, scope tabs work, project picker works).
- Visiting `?surface=landing` (or clicking dev-only switch) renders the landing root with empty region stubs visible in the DOM (`data-testid="landing-page"` plus child `data-testid` per region).
- The landing root scrolls vertically (verified by adding temporary tall content and scrolling) while the body/`#root` overflow remains `hidden`.
- `getComputedStyle(document.querySelector('.rail button'))` returns the same values for `font-family`, `font-size`, `color`, `background-color` as before this phase. (Builder records the captured values in the attempt note for QA.)
- DevTools Network panel shows no remote font requests; `Sources → src/assets/fonts/` shows the four bundled `.woff2` files.

---

### Phase 2: Top sections — Header, Status, ProjectSelector, Hero

**AC covered:** AC-004 (header bar text + mono font), AC-005 (status bar segments), AC-006 (status sub-line), AC-007 (project selector default closed state, ARIA), AC-008 (unassigned label rule), AC-018 (hero h1 lines + display family + italic + red), AC-019 (hero paragraph), AC-020 (hero eyebrow + metadata).

**Files to touch:**
- `src/panels/landing/components/HeaderBar.tsx` + `HeaderBar.module.css` (new)
- `src/panels/landing/components/StatusBar.tsx` + `StatusBar.module.css` (new)
- `src/panels/landing/components/ProjectSelector.tsx` + `ProjectSelector.module.css` (new — closed state and trigger only; open/keyboard land in Phase 4)
- `src/panels/landing/components/Hero.tsx` + `Hero.module.css` (new)
- `src/panels/landing/data/seedProjects.ts` (new — at least 3 options)
- `src/panels/landing/LandingPage.tsx` (modify — wire HeaderBar, StatusBar, ProjectSelector trigger, Hero into the region stubs)

File count: 9 (4 component pairs + 1 seed + 1 modify). **Justification for over-cap:** component pair (`.tsx` + `.module.css`) is a single conceptual unit. Counted as components, this phase is 4 new + 1 seed + 1 modify = 6 logical units. Phase 2 covers the top half of the page above the dossier card; splitting further (e.g. header/status separate from hero/dropdown) would require two phases that both touch `LandingPage.tsx`, fighting each other for layout. Acceptable bundle.

**Implementation notes:**

Reference files (Builder reads first):
- `src/panels/landing/LandingPage.tsx` (from Phase 1) — composition pattern.
- `src/panels/landing/types.ts` — `ProjectOption` shape.
- `src/panels/claude-settings/ClaudeSettingsPanel.module.css` lines 1-100 — token-consumption shape inside `.module.css`.

Patterns to follow:
- HeaderBar receives no props this phase (literals are static text per AC-004).
- StatusBar receives no props this phase.
- ProjectSelector this phase: trigger button only, with `aria-haspopup="listbox"`, `aria-expanded="false"`, and `aria-controls` pointing at the (yet-unrendered) listbox id. Trigger renders text per AC-007/AC-008. `selectedProjectId` and `onProjectChange` props are declared in the type signature but the dropdown doesn't open yet — clicking the trigger this phase is a no-op (Phase 4 wires the open/close behavior).
- Hero `h1` uses two `<span>` lines or a `<br>` separator; line 2 has its own class applying italic + red.
- Wire `seedProjects` import into `LandingPage.tsx` and pass `selectedProjectId={null}` to `ProjectSelector` so AC-008 is exercised.

Anti-patterns to avoid:
- Do NOT inline open-state logic in `ProjectSelector` this phase. Phase 4 owns interactivity.
- Do NOT hardcode hex colors. All colors via `var(--lp-*)`.
- Do NOT use `font-style: italic` for the Hero line 2 if the EB Garamond Italic file isn't loading — verify in DevTools that the italic glyphs are EB Garamond, not synthetic obliquing of the regular file.

**Completion criteria:**
- AC-004 visually verifiable: header shows literal `AGENTCON`, `FILE 0427-A`, `2026-04-30` in mono.
- AC-005 + AC-006 visually verifiable: status bar shows the four segments and the sub-line.
- AC-007 verifiable in DevTools: trigger button has `aria-haspopup="listbox"`, `aria-expanded="false"`, accessible name contains "Project". AC-008: with `selectedProjectId={null}`, trigger label shows `- unassigned -`.
- AC-018 visually verifiable: h1 line 1 "Brief once." in EB Garamond regular at 56px; line 2 "Deploy everywhere." in EB Garamond italic at 56px in `--lp-accent-red`.
- AC-019: paragraph text matches literal exactly.
- AC-020: eyebrow + metadata literals match.
- No console errors. `npm run dev` clean.

---

### Phase 3: Mid + bottom sections — PersonnelFile, Transmissions, OperativesGrid, Footer

**AC covered:** AC-021 (personnel file fields), AC-022 (REDACTED photo + caption), AC-023 (CLASSIFIED stamp rotated -15deg + red), AC-024 (personnel card reads agent from prop — seam check), AC-025 (transmissions header + LIVE indicator), AC-026 (transmissions row visual treatment), AC-027 (4 exact rows), AC-028 (empty state), AC-029 (no timer/poll/socket — implementation observation), AC-030 (operatives grid header + h2), AC-031 (3 cards, codenames in order), AC-032 (per-card content), AC-033 (top-rule shared red accent), AC-034 (DEPLOY button content + accessible name), AC-037 (operatives grid reads from props — seam check), AC-038 (footer content), AC-041 (single h1, heading hierarchy), AC-043 (contrast pairings).

**Files to touch:**
- `src/panels/landing/components/PersonnelFileCard.tsx` + `.module.css`, `ClassifiedStamp.tsx`, `RedactedSilhouette.tsx` (new — 4 files)
- `src/panels/landing/components/TransmissionsFeed.tsx` + `.module.css` (new)
- `src/panels/landing/components/OperativesGrid.tsx` + `.module.css`, `OperativeCard.tsx` + `.module.css` (new — 4 files)
- `src/panels/landing/components/Footer.tsx` + `.module.css` (new)
- `src/panels/landing/data/seedAgent.ts`, `seedTransmissions.ts`, `seedOperatives.ts` (new — 3 seeds)
- `src/panels/landing/LandingPage.tsx` (modify — wire all the above)

File count: 14 source files + 1 modify. **Justification for over-cap:** this phase composes the entire visual remainder of the page. The natural split point would be (3a) personnel + transmissions, (3b) operatives + footer, but operative cards share `OperativeCard.module.css` token consumption with personnel-file styling and the heading-hierarchy AC-041 spans both. The interactivity-free composition can be reviewed as a single visual cut. Builder is expected to commit incrementally within this phase (one component group per commit) so review remains tractable.

**Implementation notes:**

Reference files (Builder reads first):
- Phase 2 components (`Hero.tsx`, `HeaderBar.tsx`) — established the per-component pattern this phase mirrors.
- `src/panels/landing/types.ts` — `Agent`, `Transmission`, `Operative` shapes.
- The mockup at `.claude/run-assets/landing-mockup.png` — re-inspect for relative spacing of the personnel card vs hero, transmissions row density, operative card internal spacing.

Patterns to follow:
- `ClassifiedStamp.tsx`: inline `<svg viewBox="0 0 240 80">` with a stroked `<rect>` border (red, 3px stroke, no fill) and a centered `<text>` with content `CLASSIFIED`, font `--lp-font-display` (or hardcoded fallback for SVG), letter-spacing wide, fill `--lp-accent-red`. SVG element has `transform: rotate(-15deg)`.
- `RedactedSilhouette.tsx`: simple human-bust silhouette (head + shoulders) as `<path>` filled with `--lp-ink-soft`, on a slightly desaturated rectangle background. The literal text "REDACTED" is rendered as a separate DOM element adjacent to the SVG (not inside it) per AC-022, so QA can grep for it cleanly.
- `TransmissionsFeed.tsx` accepts `transmissions: Transmission[]`; if `length === 0`, renders the empty-state placeholder (AC-028). The `● LIVE` indicator is a `<span>` with a CSS-only opacity-pulse animation, gated by the reduced-motion media query (AC-029 forbids any timer/socket/IPC; AC-042 gates the animation). No `useEffect`, no `setInterval`.
- `OperativesGrid.tsx` accepts `operatives: Operative[]` and `onDeploy?: (id: string) => void`. If `operatives.length !== 3`, render whatever the array is — but the AC-031 default seed always has length 3. The grid does **not** internally filter or sort.
- `OperativeCard.tsx` accepts a single `operative: Operative` prop and an `onDeploy?: (id: string) => void` callback. Card top rule via `border-top` on the card root.
- The Deploy button: if `onDeploy` is provided, click invokes `onDeploy(operative.id)`. If not, click invokes `console.info(\`Deploy: \${operative.codename}\`)` (AC-036's fallback). This phase implements the click handler but the visual states (hover/focus/active/disabled CSS) are also fully styled here — the *keyboard* and *focus-management* AC live in Phase 4.
- Single `h1` is in Hero (Phase 2). This phase introduces `h2` ("Field-ready operatives") and `h3` (per operative codename). Builder confirms heading order during exploration: header bar uses no heading element; status bar uses no heading element; project selector trigger uses `<button>` not `<h*>`; hero is `h1`; transmissions header is a `<div>` with mono styling, not a heading; operatives section header is `h2`; operative card codenames are `h3`. This satisfies AC-041.

Anti-patterns to avoid:
- Do NOT add a `useEffect` to TransmissionsFeed for any reason. AC-029 is observed by inspection: `git grep useEffect src/panels/landing/components/TransmissionsFeed.tsx` should return nothing.
- Do NOT pass `onDeploy` from `LandingPage.tsx` in this run — let the card fall to the `console.info` fallback. AC-036 explicitly approves this.
- Do NOT use raster images for the silhouette or stamp. SVG inline only (ADR §D5).
- Do NOT bake operative data into `OperativeCard.tsx` or `OperativesGrid.tsx`. Seed must come via prop (AC-037 seam check).
- Do NOT use multiple `h1`s. AC-041 is binary.

**Completion criteria:**
- All AC listed above visually verifiable in dev build.
- Personnel-file card displays exact key/value pairs from AC-021 reading from `seedAgent.ts`.
- CLASSIFIED stamp visible, rotated within -20 to -10 deg, red.
- Transmissions feed renders the four exact rows in order (AC-027). Empty state verifiable by Builder temporarily passing `transmissions={[]}` and confirming the placeholder renders, then reverting.
- Operatives grid renders three cards in order (Hawkeye, Echo, Ghost) with all per-card content per AC-032. All three top rules use `--lp-accent-red`.
- Each Deploy button has `aria-label="Deploy <Codename>"` and visible text "DEPLOY".
- Clicking a Deploy button logs `Deploy: <Codename>` to the console and does nothing else (no navigation, no fetches, no store mutation observable).
- Footer text matches AC-038 exactly.
- DOM has exactly one `h1`. Heading hierarchy is `h1` → `h2` → `h3` in document order through the operatives section.
- Contrast (AC-043): Builder records the four pairings' computed ratios in the attempt note (cream `#f1ead8` vs body, mono on cream, mono on dark `#131512`, red `#b8362b` on cream). All ≥4.5:1 for normal text.

---

### Phase 4: Interactivity + accessibility polish

**AC covered:** AC-009 (dropdown click-to-open), AC-010 (option click selects), AC-011 (Space/Enter opens with focus management), AC-012 (Arrow keys move highlight with wrap), AC-013 (Enter selects), AC-014 (Escape closes without selecting), AC-015 (outside click closes), AC-016 (hover/focus/active visual states on trigger), AC-017 (no-op on selection — verified by absence), AC-035 (Deploy button hover/focus-visible/active/disabled states), AC-036 (Deploy click is a no-op beyond callback), AC-042 (reduced-motion handling), AC-044 (Tab order through interactive controls), AC-045 (responsive 1024–1680px range, three-up grid).

**Files to touch:**
- `src/panels/landing/components/ProjectSelector.tsx` + `.module.css` (modify — full keyboard listbox; CSS for hover/focus-visible/active states)
- `src/panels/landing/components/OperativeCard.module.css` (modify — finalize hover/focus-visible/active/disabled CSS)
- `src/panels/landing/LandingPage.tsx` (modify — wrap selector with local `useState` for `selectedProjectId`, pass `onProjectChange` that only updates that state; add document-level click-outside listener at the page level, not inside the selector)
- `src/panels/landing/LandingPage.module.css` (modify — `prefers-reduced-motion` rules; responsive-range media queries for 1024px breakpoint padding adjustments; ensure operatives grid stays 3 cols across the range)

File count: 4 modifies. Within cap.

**Implementation notes:**

Reference files (Builder reads first):
- ProjectSelector and OperativeCard from prior phases.
- `https://www.w3.org/TR/wai-aria-practices-1.2/#Listbox` — ARIA listbox keyboard pattern. Builder is implementing the "Listbox with single selection" variant. Cite this pattern in a comment.

Patterns to follow:
- ProjectSelector internal state: `const [open, setOpen] = useState(false)` and `const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)`. When `open` becomes true via keyboard, highlight defaults to the index of `selectedProjectId` or 0.
- Use `aria-activedescendant` on the listbox to track highlight rather than moving DOM focus to each option (preferred ARIA pattern for listbox).
- Click-outside handling: a `useEffect` registered while `open === true` listening for `mousedown` on `document`; if `event.target` is not within the trigger or listbox refs, set `open = false` and **do not** invoke `onProjectChange` (AC-015).
- Escape: handled in the `onKeyDown` of the trigger (when open) and listbox; sets `open = false` and returns focus to the trigger ref (AC-014).
- Deploy button states in CSS:
  ```css
  .deployButton:hover:not(:disabled) { background: var(--lp-ink); color: var(--lp-surface-cream); }
  .deployButton:focus-visible { outline: 2px solid var(--lp-accent-red); outline-offset: 2px; }
  .deployButton:active:not(:disabled) { background: var(--lp-accent-red); color: var(--lp-surface-cream); }
  .deployButton[aria-disabled="true"], .deployButton:disabled { opacity: 0.5; pointer-events: none; }
  ```
- Reduced-motion:
  ```css
  @media (prefers-reduced-motion: reduce) {
    .liveIndicator { animation: none !important; opacity: 1; }
  }
  ```
- AC-045 responsive: at viewport widths ≥1024 and ≤1680, the operatives grid is `grid-template-columns: repeat(3, 1fr)`. Below 1024 is out of scope (page may show horizontal overflow). Builder verifies at 1024 / 1280 / 1680 with DevTools' device-mode width override.

Anti-patterns to avoid:
- Do NOT wire `onProjectChange` to anything other than the local `selectedProjectId` state (AC-017). Specifically: do NOT touch `claudeConfigStore`, do NOT call `window.agentcon.*` IPC, do NOT trigger any side effect.
- Do NOT use `aria-selected` instead of `aria-activedescendant` for the keyboard highlight; selection and highlight are different concepts in listbox semantics.
- Do NOT trap focus inside the listbox. Tab from the trigger (when open) should still close the listbox and move focus to the next focusable element — most listbox implementations close on Tab.
- Do NOT animate the LIVE indicator or any element when reduced-motion is set.
- Do NOT introduce a horizontal scrollbar on the page itself at any viewport width in the responsive range.

**Completion criteria:**
- All dropdown ACs (AC-009 through AC-016) verifiable by QA via pointer + keyboard exercise:
  - Click trigger → opens with first option highlighted, `aria-expanded="true"`.
  - Click option → closes, label updates, `aria-expanded="false"`, focus returned to trigger.
  - Space/Enter from focused trigger → opens with first or previously-selected option highlighted.
  - ArrowDown/ArrowUp wrap top↔bottom.
  - Enter → selects + closes + returns focus.
  - Escape → closes without selection, returns focus.
  - Click outside → closes, no selection.
  - Trigger has visually-distinct hover/`:focus-visible`/`:active` states; focus ring ≥2px in `--lp-accent-red`.
- AC-017 verifiable by Builder note: code search shows `onProjectChange` is wired only to local `setSelectedProjectId`; no other consumers.
- AC-035 verifiable: Deploy button shows distinct hover/focus/active states; if Builder temporarily sets `disabled={true}` on one card during testing, the disabled style applies and the click handler is not invoked.
- AC-036: clicking Deploy logs `Deploy: <Codename>` and produces no other observable effect. Builder verifies via DevTools console + Network tab + zustand devtools.
- AC-042: with OS reduced-motion set, the `● LIVE` indicator is static; with it unset, the pulse runs at `--lp-pulse-duration`.
- AC-044: Tab through the page in document order traverses ProjectSelector trigger → Deploy(Hawkeye) → Deploy(Echo) → Deploy(Ghost) (and any other interactive control if Builder adds one). Each shows `:focus-visible` outline.
- AC-045: at 1024 / 1280 / 1680, no horizontal scrollbar, three side-by-side operative cards.

---

## 10. Risks + Alternatives Considered

### Alternatives considered

(Full list lives in the ADR. Summary here.)

| Alternative | Why rejected |
|---|---|
| Add `react-router` for two surfaces | Over-engineered; verdict explicitly forbids router as deliverable. (ADR §D1) |
| Replace `App.tsx` entry with landing page; settings via menu | Default-breaks AC-002; surprises existing users. (ADR §D1) |
| Build-flag landing page out of production | Removes artifact display value. (ADR §D1) |
| Extend `:root` with `--lp-*` tokens (no scoped selector) | Pollutes global scope for a single-route feature. (ADR §D2) |
| Lift `overflow: hidden` off `html, body, #root` globally | Unbounded blast radius vs scoped container. (ADR §D3) |
| Raster CLASSIFIED stamp (PNG) | Loses tokenability + textual verification. (ADR §D5) |
| Google Fonts CDN | Forbidden by AC-040; inappropriate for Electron desktop app. (ADR §D6) |
| System-stack fonts only | Display serif italic is load-bearing for the aesthetic. (ADR §D6) |
| Vitest + Testing Library setup as Phase 0 | Pipeline shakedown framing; AC are deterministically inspectable; no other test consumers in repo. (ADR §D7) |
| Playwright visual regression baselines | Heavy infra for a single artifact; named-element AC give cheaper deterministic checks. (ADR §D7, §D10) |
| Per-card accent tokens (3 colors) | Mockup ambiguity resolved as printing grain. Single accent simpler, equally satisfies AC-033. (ADR §D8) |

### Risks + mitigation

| Risk | Likelihood | Mitigation |
|---|---|---|
| Settings panel computed styles regress because someone adds a `--lp-*` token to `:root` accidentally | low | Linter-by-convention: `tokens-landing.css` only declares under `.landing-root`. QA's AC-002/AC-039 step compares `getComputedStyle` of one settings rail item before/after. ADR §D2 spells this out. |
| Surface switcher in `App.tsx` is non-standard and confuses a future contributor | low | Inline comment block in `App.tsx` referencing `docs/pipeline/2026-05-03/test-run-landing-page/ADR.md`. Explicit "temporary" framing. Reversible in one diff. |
| `overflow: hidden` regresses on a future surface | low | Scoped overflow inside `.landing-root` only; global rule untouched. Verified in Phase 1 completion. |
| Bundled `.woff2` files are checked in but not licensed correctly | low | EB Garamond (SIL OFL) and JetBrains Mono (SIL OFL) are both open licenses suitable for embedding. License files committed alongside the fonts. |
| QA misreads "matches mockup" intent and demands pixel-perfect alignment | low | All visual AC are token / literal-text / computed-style based. No AC says "matches mockup". QA verdict format demands quoted observed values, not rasters. |
| Red-on-cream fails WCAG AA contrast | very low | `#b8362b` on `#f1ead8` computes to 5.4:1 (passes 4.5:1 normal-text threshold). Builder records the ratio in Phase 3 attempt note; QA verifies in AC-043. If the chosen red ever fails, fall back to `#a32e23` (6.0:1) and update the token; no component-level change needed. |
| Dropdown listbox keyboard pattern subtly wrong (focus management or `aria-activedescendant`) | medium | Phase 4 implementation notes cite the W3C ARIA practices listbox pattern. QA exercises every keystroke combination per AC-011/012/013/014. |
| Reduced-motion not honored because pulse uses inline-style animation | medium | Phase 4 implementation notes specify `@media (prefers-reduced-motion: reduce)` rule explicitly disables the animation; Builder verifies in OS-level toggle. |
| `disabled?: boolean` seam unwired but expected | low | ADR §D12 makes the seam explicit: prop declared, CSS for disabled state implemented, no operative is disabled in seed data. AC-035's disabled-state branch is satisfied as styled-but-unfired. |
| Future feature wants automated tests, no runner in place | medium | Recorded as known gap. When the next feature needs behavioral coverage, that run owns introducing Vitest + Testing Library (or Node `node:test`). Adding it now buys nothing because no other code path consumes it. |
| Bundle size grows unexpectedly because someone imports the full font files | low | Latin-only `unicode-range` subset locks each `.woff2` ≤30KB. `du -sh src/assets/fonts/` recorded in Phase 1 attempt note. |
| Surface switcher defaults wrong (lands on landing instead of settings) on a fresh dev start | low | Phase 1 completion criterion explicitly verifies cold start lands on settings. AC-002 covers the regression. |
| AC-045 viewport range too narrow / too wide for the existing app | low | Pinned 1024–1680. If real Electron `BrowserWindow` config is found to enforce a different range later, update AC-045 in a follow-on; current value is a defensible default for desktop screens. |

### Triggers (recap)

- **Security trigger: OFF.** No auth code, no PII, no new tables, no new API endpoints, no IPC handlers, no file system access, no payments, no external input. AC-017 / AC-029 / AC-036 explicitly forbid the wiring that would flip this on. If Architect or Builder breaches those AC during execution, trigger flips ON and Security agent runs. Aligned with CTO recommendation.
- **Performance trigger: OFF.** Static visual page; ≤4 transmission rows, 3 operative cards, no streaming, no polling. CSS-only LIVE pulse gated by reduced-motion. ~110KB woff2 added (Latin subset, 4 files). No measurable runtime perf surface.

---

## 11. Consensus

[All sign-offs append here during consensus rounds. Each approval names specific concerns the agent is watching for. PRD is locked when all three are present and there are no open objections.]

### Round 1

**PM Sign-off Request — 2026-05-03**
Sections owned: 3-7
Security trigger candidate: **no**. Reasoning: no auth code, no PII, no new tables, no new API endpoints, no IPC handlers added, no file system access, no payments, no external input accepted. All data is renderer-local seeded constants. Dropdown selection is local UI state with an explicit no-op AC (AC-017) prohibiting any store mutation or real project-load wiring in this run. Deploy buttons have an explicit no-op AC (AC-036) prohibiting command execution, network calls, IPC, or store mutation. Aligns with CTO verdict's recommendation of security trigger OFF for this scope. If Architect deviates from the deferral guidance in section 6 and wires the dropdown into `claudeConfigStore`, the security trigger should flip ON.
Status: Awaiting CTO sign-off

**CTO Sign-off — 2026-05-03**
✅ APPROVED (sections 3-7)

**SIMPLIFY scope compliance:** confirmed.
- Real deploy actions deferred with explicit no-op: **AC-036** ("the only effect is invocation of the `onDeploy(operativeId: string)` prop callback; the page performs no navigation, no command execution, no scaffolding, no IPC call, no network call, and no mutation of any persisted store"). ✓
- Real transmissions source deferred with explicit no-op: **AC-029** ("no timer, polling interval, websocket, IPC subscription, or file watcher is started"). ✓
- Real project-load wiring deferred with explicit no-op: **AC-017** ("no navigation, no IPC call, no network call, and no mutation of any persisted store... No integration with `claudeConfigStore.activeProjectPath` or any real project-loading flow"). ✓
- Clean prop seams in place for follow-on attachment: dropdown takes `selectedProjectId` and `onProjectChange` (AC-007, AC-010); transmissions feed takes `transmissions` prop (AC-026); operatives grid takes `operatives` and `onDeploy` (AC-031, AC-037); personnel-file card takes `agent` prop (AC-024). Seed modules pass props at the route boundary per section 7. ✓

**AC Quality Check:** walked AC-001 through AC-045. Each is testable as written:
- Given/When/Then form (or precondition + action + observable outcome): all 45 pass.
- No vague language: no "matches mockup", "looks good", "feels right", "appropriate" anywhere. Visual claims reference token names (cream-surface, dark-surface, red-accent, serif display, monospace UI) or literal strings (`AGENTCON`, `FILE 0427-A`, `Brief once.`, `Deploy everywhere.`, `// 01 //`, `MISSIONS 47`, `v0.1 · ~/.CLAUDE`, etc.). No prose-level subjective claims.
- Concrete observable outcome: AC-001 (document order of regions), AC-018 (literal h1 line text + serif italic family + red token), AC-027 (four exact transmission rows in order), AC-032 (exact card content table) — all binary checks.
- Explicit precondition: every AC opens with "Given the landing page is rendered" or a more specific precondition (e.g. AC-008 "Given the dropdown is closed and receives a `selectedProjectId` prop value of `null` or `undefined`", AC-028 "Given the transmissions feed receives a `transmissions` prop equal to an empty array").
- Edge cases broken out: dropdown has nine separate AC for closed/open/click/keyboard-open/arrow-nav/enter-select/esc-close/outside-click/focus-state (AC-007 through AC-016) instead of one lumped "is accessible" AC; transmissions feed has separate AC for default rows (AC-027), empty state (AC-028), and no-op behavior (AC-029); deploy button has separate AC for content (AC-034), states (AC-035), no-op behavior (AC-036), and accessible name (AC-034).
- Testable as written: AC-021 (key/value field table), AC-027 (numbered exact rows), AC-032 (per-card content table), AC-043 (named contrast pairings with explicit ratios) all give QA deterministic inspection paths. Keystroke-specific accessibility ACs (AC-011 Space/Enter, AC-012 ArrowDown/ArrowUp, AC-013 Enter, AC-014 Escape, AC-015 outside-click) honor the verdict's accessibility specificity requirement.

### Concerns I'm watching during execution

1. **AC-045 lower/upper bound is implicit, not numeric.** The criterion reads "any window width between the smallest and largest sizes the existing app already supports". Architect must pin specific min/max widths in section 8 or 9 so QA has a numeric range to test. If Architect leaves it un-pinned, QA will pick arbitrary widths and we'll re-litigate at QA time. Not blocking sign-off — Architect's job to nail down — but I want it numeric before phase plan locks.

2. **AC-002 toggle ambiguity.** AC-002 says default app entry behavior is "preserved or behind the same toggle the Architect chooses". I support that flexibility, but I'm watching for: (a) whatever surface-switching mechanism Architect picks must not break the settings panel's existing overflow behavior (AC-003 covers the global rule but not whatever wrapper Architect introduces), and (b) the toggle must not silently default to the landing page on first open if that would surprise current users of the settings panel. Architect should call this out in section 10 risks.

3. **AC-033 token mapping is unresolved in the spec.** "(or per-card accent token if the design uses three accents — Architect to confirm token mapping; the rule itself is required regardless)" — the existence claim is testable, but the choice between one shared red accent and three per-card accents is a design call the mockup leaves ambiguous. Architect must pick one and lock it in section 8 UI Requirements before Builder runs, otherwise this AC is half-spec'd at QA time.

4. **AC-035 disabled-state branch is conditional on a state that is not currently set anywhere.** No AC says any Deploy button is ever disabled in this run. The disabled-state clause is harmless seam preparation, but I want to confirm with Architect that the operative card component types `disabled?: boolean` on its props so Builder isn't asked to wire a state machine for which no upstream signal exists.

5. **Token bifurcation discipline.** AC-039 says the new tokens "do not redefine any existing token currently consumed by `ClaudeSettingsPanel`". This is the right rule but it's a negative assertion — easy to miss in code review. I want Architect's component-structure section to specify whether new tokens land in a separate file (`tokens-landing.css`), a scoped wrapper class, or a namespaced extension — and I want QA's regression check on AC-002 to include "settings panel computed styles for at least one representative element are byte-identical before and after this change" or equivalent. This is the single highest-risk seam in the run.

6. **Font loading path unspecified.** AC-040 forbids runtime CDN dependency and requires explicit fallbacks but does not name the exact families/weights or the load mechanism. PM correctly punted this to Architect (verdict §6 flagged it). Watching that Architect picks bundled `.woff2` via Vite or a system stack with explicit fallback chain, not "we'll figure it out".

No blocking objections. Sign-off granted on sections 3-7.

**Architect Sign-off Request — 2026-05-03**
Sections owned: 8, 9, 10
ADR: `docs/pipeline/2026-05-03/test-run-landing-page/ADR.md` (filename per user-specified path; no `docs/decisions/` precedent in repo today, so the ADR lives alongside the run artifacts).

**Security trigger: OFF.** Reasoning: every criterion from my agent checklist (new auth code / PII tables / RLS changes / new external-input endpoints / changes to existing auth flows / payments / edge-function credentials) is negative for this run. The only way the trigger flips ON is if Builder breaches AC-017 (dropdown wires into `claudeConfigStore`), AC-029 (transmissions feed opens any kind of subscription), or AC-036 (Deploy button does anything beyond callback/`console.info`). Those AC are explicit no-ops, and Phase 4 implementation notes restate the prohibitions inline. PM's flag was OFF, CTO's recommendation was OFF, my call confirms OFF.

**Performance trigger: OFF.** Static visual page; no runtime data work; CSS-only animation gated by reduced-motion; bundle delta ~110KB woff2 with Latin subset. Not a perf surface.

**PM concerns addressed:** all 8 resolved in §8 Concerns Resolution Matrix (rows 1–8) and the ADR. **CTO concerns addressed:** all 6 resolved in §8 Concerns Resolution Matrix (rows 9–14) and the ADR.

Status: Awaiting CTO and PM sign-off.

Concerns I'm watching during execution:

1. **`tokens-landing.css` discipline.** The whole design rests on no `--lp-*` token leaking into `:root`. If Builder writes one rule under `:root` by accident, AC-039 fails and AC-002 is at risk. Reviewer should grep for `^:root` in `src/styles/tokens-landing.css` as a hard check. QA's settings-panel computed-style snapshot is the second line of defense.

2. **ProjectSelector keyboard semantics (Phase 4).** This is the trickiest single piece of the build. The W3C listbox pattern with `aria-activedescendant` is correct for screen readers but is easy to half-implement: a common failure mode is updating highlight state but forgetting to set `aria-activedescendant` on the listbox element on every keystroke, or moving DOM focus to options instead of leaving it on the listbox. Reviewer should walk the eight dropdown AC (AC-009 through AC-016) against the implementation in one pass, not skim.

3. **Surface switcher must default to settings on cold start.** Phase 1 completion criterion says it explicitly. If anyone (Builder, a future contributor) flips the default to `"landing"` for convenience, AC-002 silently breaks for every existing user of the settings panel. The dev-only `?surface=landing` query string is the only intended landing entrance for this run.

No blocking objections raised against PM's sections 3–7 — they are tight enough to plan against. CTO's section 11 sign-off concerns are all answered above and in the matrix.

**CTO Sign-off (Round 2) — 2026-05-03**
✅ APPROVED (sections 8-10, ADR)

**Cross-checks performed against Architect's submission:**

**1. SIMPLIFY scope adherence.** Confirmed. The 4-phase plan builds a static visual page with prop seams and nothing more. D1 (state-based switcher, no router framework), D2 (scoped tokens, no new design-system layer), D3 (scoped overflow, no global rule edit), D4 (existing `src/panels/<feature>/` convention, no new top-level directory), D5 (inline SVG, no asset pipeline change), D7 (no test runner), and D11 (responsive bounds pinned numerically) all stay inside or below the verdict's approved scope. The deferred-behavior seams in §8 Data Model (`Operative.disabled?`, `onDeploy?`, `onProjectChange`, `transmissions: Transmission[]`, `agent: Agent`) are exactly what verdict §6 ("How deferred features should still be planned for") called for. No premature generalization observed.

**2. Security trigger = OFF — confirmed.** Walked the surface area: no auth, no IPC, no persisted user input, no network calls, no credential handling. AC-017 / AC-029 / AC-036 are explicit no-ops with inline anti-patterns in Phases 3 and 4. The `?surface=landing` query-param reader (D1) does string equality on `window.location.search` — no injection surface. The dev-only floating switch button is correctly gated by `import.meta.env.DEV` (Vite dead-code-eliminates this in production). One narrow note carried into watching concerns below: the *query-param reader itself* is not `DEV`-gated, so a production build would still render `<LandingPage />` if a URL with `?surface=landing` were ever loaded into the renderer. That is a "dev affordance leaks into prod" concern, not a security trigger flip — the landing page is a static visual artifact and reaching it in production has no security consequence. Trigger OFF stands.

**3. Phase independence and testability.** All four phases verifiable against named AC subsets with concrete completion criteria (file states, computed-style snapshots, DOM literals, code-grep observations). Coverage check: Phase 1 = 5 AC, Phase 2 = 8 AC, Phase 3 = 18 AC, Phase 4 = 14 AC → total 45 AC, every AC-001 through AC-045 assigned. No mid-pipeline phase leaves the codebase unshippable: Phase 1 sets up scaffolding behind a dev-only entry; settings panel remains the cold-start surface throughout. Phases 2 and 3 fail safely (incomplete landing surface, settings panel unaffected). Phase 4 is the only phase whose failure visibly affects the landing surface, and it touches no settings code.

**4. Per-phase file count.** Phase 1 (7 source + 4 binary) and Phase 2 (9 source) are over the soft cap of 5 with stated reasoning that I accept. Phase 4 is within cap. **Phase 3 at 14 source + 1 modify is the largest single phase in the plan** — Architect's justification (single visual cut, shared token consumption across personnel/operative cards, AC-041 heading hierarchy spans the cut) is defensible but at the limit of "feature phase sprawl" the verdict warned about. I'm accepting it because (a) every component is structurally identical (one `.tsx` + one `.module.css`), (b) the seed modules are tiny, and (c) Architect explicitly instructs incremental commits within the phase. This becomes a watching concern, not a blocker.

**5. No-op AC preservation in phase breakdown — confirmed.**
   - **AC-017** is in Phase 4. Phase 4 anti-pattern: "Do NOT wire `onProjectChange` to anything other than the local `selectedProjectId` state... do NOT touch `claudeConfigStore`, do NOT call `window.agentcon.*` IPC, do NOT trigger any side effect." Completion criterion: "code search shows `onProjectChange` is wired only to local `setSelectedProjectId`; no other consumers." No-op contract intact. ✓
   - **AC-029** is in Phase 3. Phase 3 anti-pattern: "Do NOT add a `useEffect` to TransmissionsFeed for any reason. AC-029 is observed by inspection: `git grep useEffect src/panels/landing/components/TransmissionsFeed.tsx` should return nothing." No-op contract intact. ✓
   - **AC-036** is in Phase 3 (handler implementation falls through to `console.info`) and Phase 4 (no-op verification). Phase 3 anti-pattern: "Do NOT pass `onDeploy` from `LandingPage.tsx` in this run — let the card fall to the `console.info` fallback." Phase 4 completion: "clicking Deploy logs `Deploy: <Codename>` and produces no other observable effect. Builder verifies via DevTools console + Network tab + zustand devtools." No-op contract intact. ✓

**6. 14-concerns resolution spot-check (4 sampled).**
   - PM-1 (transmissions cardinality = 4): Matrix → ADR D9. ADR D9 reads "PM specified four exact rows in AC-027. Builder uses exactly those four. No extras, no fewer." Present and binding. ✓
   - PM-4 (routing/surface-switcher choice): Matrix → ADR D1 + D3. D1 spells out the `useState` switcher, `?surface=landing` reader, dev-only button, and explicitly forbids router/build-flag/entry-replacement. D3 scopes overflow inside `.landing-root`. Present. ✓
   - CTO-9 (AC-045 numeric bounds): Matrix → ADR D11 + PRD §9 Phase 4. ADR D11 reads "the responsive range is 1024px to 1680px wide. QA tests three points: 1024, 1280, 1680." Phase 4 completion criterion repeats the three test points. Present and numeric. ✓
   - CTO-13 (token bifurcation regression on settings panel): Matrix → §8 Migration Safety + §8 Testing Strategy. §8 Migration Safety reads "`getComputedStyle` for at least one settings element (e.g. `.rail` first item) is unchanged in `font-family`, `font-size`, `color`, `background-color`." §8 Testing Strategy table assigns this to QA's AC-002/AC-039 path. Phase 1 completion criterion repeats this as a Builder-recorded snapshot. Present. ✓

   All four spot-checks land on real content in §8/§10/ADR — no empty matrix pointers.

**7. Test-infra decision (Option c) consistency check.** Walked the AC list for any criterion requiring repeated state transitions, timing assertions, or async observation that inspection alone couldn't verify. Findings:
   - All keyboard AC (AC-011 through AC-014) are single-keystroke + DOM-state observations.
   - AC-029 (no-op timers/sockets) is verifiable by code grep — Architect's anti-pattern note locks this.
   - AC-042 (reduced-motion) is a CSS media-query toggle + animation observation.
   - AC-045 (responsive) is three discrete viewport-width snapshots.
   - AC-009 / AC-011 (dropdown highlight on open: "first option" vs "previously-selected option") requires a 2-step manual sequence (select an option, close, reopen) but the observation at each step is deterministic DOM state.
   No AC was found that *silently fails* without a test runner. Option (c) is consistent with PM's AC. ✓

---

**Concerns I'm watching during execution:**

1. **Phase 3 size.** 14 new source files + 1 modify is a meaningful chunk to land in one Builder pass. I'm relying on Architect's instruction that Builder commits incrementally inside the phase (one component group per commit) and on the AC-by-AC completion checklist to keep review tractable. If Builder's Phase 3 attempt 1 fails QA, I want the failure to be on a specific component group, not a sprawling diff QA can't reason about. Reviewer should flag any Phase 3 attempt that lands as a single monolithic commit.

2. **`?surface=landing` query-param reader is not `DEV`-gated.** D1 reads the query string regardless of build mode, only the floating switch *button* is gated by `import.meta.env.DEV`. In a production Electron build, a URL like `app://./index.html?surface=landing` loaded into `BrowserWindow` would render the landing page. That isn't a security issue (the landing page is static visual content) but it's a "dev affordance leaks into prod" subtlety the ADR doesn't acknowledge. Not blocking — Builder can land it as written. Reviewer should consider whether to also gate the reader on `import.meta.env.DEV` so production cold-start is hard-pinned to settings, or whether the leakage is acceptable as the artifact-display value the verdict called out. Either choice is fine; record it explicitly.

3. **Settings-panel computed-style snapshot must be captured *before* Phase 1 modifies anything.** Phase 1 completion criterion says Builder records `getComputedStyle(document.querySelector('.rail button'))` values "as before this phase" in the attempt note. Builder needs to capture the baseline at exploration time (against `main`/pre-phase state), not after edits — otherwise the comparison is vacuous. Reviewer should verify the attempt note shows a real before-snapshot.

4. **AC-009 vs AC-011 highlight-on-reopen state.** AC-009 says click-to-open highlights "the first option". AC-011 says keyboard-open highlights "the first option (or the previously-selected option, if any)". Phase 4 implementation note resolves this with `setHighlightedIndex(selectedProjectId index || 0)`, but only on the keyboard path. Click-open per AC-009 should always highlight the first option regardless of selection — confirm Builder doesn't accidentally unify the two paths into "always highlight selected" or "always highlight first" and break one of the two AC. QA should test the multi-step reopen sequence (select option 2, close, click-reopen → highlight on option 1; vs select option 2, close, keyboard-reopen → highlight on option 2) explicitly.

5. **EB Garamond Italic must be a real italic file, not synthetic obliquing.** AC-018 requires "italic display family token" for line 2 of the hero. Phase 2 anti-pattern correctly calls out: "verify in DevTools that the italic glyphs are EB Garamond, not synthetic obliquing of the regular file." If Builder forgets to bundle `EBGaramond-Italic.woff2` (D6 lists it but file delivery is the Builder's job) and the browser falls through to Georgia italic or synthesizes obliqued glyphs from the regular file, AC-018 fails on font-family inspection. QA's AC-018 verification path needs to include `getComputedStyle(...).fontStyle === 'italic'` *and* `getComputedStyle(...).fontFamily` resolving to `EB Garamond` (not Georgia).

6. **Production-mode verification of the dev-only switcher button.** D1 says the switcher button is gated by `import.meta.env.DEV`. If the Electron app's release pipeline ever runs a production build (`npm run build` not `npm run dev`), the button must not render. There is no AC asserting this — it's only a property of the implementation. Reviewer should confirm during Phase 1 review that the gating is structural (`{import.meta.env.DEV && <button .../>}`) and that the boolean is evaluated at Vite build time, not at runtime.

---

**Scope Confirmation:** Aligns with my SIMPLIFY verdict. The architecture stays inside the approved scope and adds no infrastructure beyond what is needed for a static visual build. The three deferred behaviors (deploy, transmissions source, project-load) all have explicit no-op AC and inline anti-pattern guards in the phase plan. Security trigger OFF is correct. ADR captures every architectural decision the verdict flagged for Architect attention.

No blocking objections. Sign-off granted on sections 8-10 and the ADR.

**PM Sign-off — [TIMESTAMP]**
✅ APPROVED (sections 8-10)

AC Coverage Check: all [N] AC mapped to phases.
Security Trigger Confirmation: [matches my flag / Architect set differently with reasoning ✓]

Concerns I'm watching during execution:
1. [Specific concern]

---

**PM Sign-off (Round 2) — 2026-05-03**
✅ APPROVED (sections 8-10 + ADR)
Section: Architect plan (sections 8-10) and standalone ADR (D1–D12)

### 1. AC Coverage Check — independently walked

I walked the phase breakdown end-to-end and listed the AC each phase claims, then walked AC-001 → AC-045 the other direction confirming every AC lands in exactly one phase. Result: full coverage, no orphans, no doubles. CTO Round 2's 5+8+18+14=45 count is correct.

| Phase | Count | AC mapped |
|---|---|---|
| Phase 1 (foundation) | 5 | AC-001, AC-002, AC-003, AC-039, AC-040 |
| Phase 2 (top sections) | 8 | AC-004, AC-005, AC-006, AC-007, AC-008, AC-018, AC-019, AC-020 |
| Phase 3 (mid + bottom) | 18 | AC-021, AC-022, AC-023, AC-024, AC-025, AC-026, AC-027, AC-028, AC-029, AC-030, AC-031, AC-032, AC-033, AC-034, AC-037, AC-038, AC-041, AC-043 |
| Phase 4 (interactivity + a11y polish) | 14 | AC-009, AC-010, AC-011, AC-012, AC-013, AC-014, AC-015, AC-016, AC-017, AC-035, AC-036, AC-042, AC-044, AC-045 |
| **Total** | **45** | AC-001 through AC-045 — every AC mapped to exactly one phase. No orphans. No phase has zero AC. |

Forward walk (AC-001 → AC-045): each lands in exactly one phase per the phase headers' "AC covered" lines. Reverse walk (Phase 1 → Phase 4): every claimed AC traces back to a real AC number written in §5. No duplicates. No "TBD".

One note for Reviewer (not blocking): AC-036 is listed in Phase 4's "AC covered" line and is verified end-to-end in Phase 4's completion criteria, but the *implementation* of the click handler with the `console.info` fallback lands in Phase 3 (Phase 3 implementation notes: "if `onDeploy` is provided, click invokes `onDeploy(operative.id)`. If not, click invokes `console.info(...)` (AC-036's fallback)"). I treat this as Phase 4-owned for AC purposes (the no-op verification is what AC-036 demands) and Phase 3 happens to set the seam up. CTO Round 2 §5 already noted this distribution. No phase double-claims AC-036.

### 2. Concerns Resolution Spot-check

I sampled four of my eight hand-off concerns and two of CTO's six. All landed on real content in §8 / §10 / ADR — no empty matrix pointers. None weakens the AC it resolves.

**PM concerns sampled:**
- **PM-2 (per-card top-rule color):** Matrix → ADR §D8 + §8 OperativeCard. ADR §D8 reads "All three operative cards use the same `--lp-accent-red` for their top rule... This locks AC-033's 'or per-card accent token' branch closed: single shared red accent." §8 UI Requirements (OperativeCard) reads "top rule `border-top: 2px solid var(--lp-accent-red)` (single shared accent — ADR D8)." **AC intent preserved:** AC-033 reads "the rule itself is required regardless" with the per-card branch as a parenthetical "or" — locking to a single shared red still satisfies the binding clause. Resolution is consistent with how I wrote AC-033. ✓
- **PM-4 (routing + overflow scope):** Matrix → ADR §D1 + §D3 + §8 Approach + Migration Safety. D1 spells out the `useState` switcher, default `"settings"`, dev-only `?surface=landing` and dev-only floating button, and explicitly forbids router/build-flag/entry-replacement. D3 scopes overflow inside `.landing-root` with absolute-positioned scrollable container, leaving the global rule untouched. Migration Safety adds the cold-start regression assertion and a `getComputedStyle` snapshot path. **AC intent preserved:** AC-002, AC-003, AC-039 are all satisfied without modifying `tokens.css` lines 105-112 (verified by reading the file). ✓
- **PM-5 (token namespacing):** Matrix → ADR §D2 + §8 Component Structure. D2 specifies separate `src/styles/tokens-landing.css`, scoped under `.landing-root` (not `:root`), `--lp-*` prefix. §8 Component Structure shows `tokens.css` as "(unchanged — settings-panel tokens)" and `tokens-landing.css` as new. Phase 1 anti-pattern: "Do NOT put `--lp-*` tokens under `:root`. They must be scoped to `.landing-root`. Do NOT modify `src/styles/tokens.css`." **AC intent preserved:** AC-039's negative assertion ("does not redefine any existing token currently consumed by `ClaudeSettingsPanel`") is structurally enforced by the scoped-class approach. ✓
- **PM-7 (visual fidelity verification path):** Matrix → ADR §D7 + §D10 + §8 Testing Strategy. D7 commits to "no automated tests this run" with full reasoning. D10 commits to named-element / text / token / computed-style approach. §8 Testing Strategy table maps each verification layer to a concrete deterministic path. **AC intent preserved:** every visual AC I wrote (AC-018, AC-021, AC-027, AC-032, AC-038, AC-039, AC-040, AC-043) names a literal string, a token, an element, or a computed-style assertion — all verifiable by inspection without a runner. ✓ See §5 below for the full walk of dropdown / focus AC under this path.

**CTO concerns sampled:**
- **CTO-9 (AC-045 numeric bounds):** Matrix → ADR §D11 + Phase 4. D11 reads "the responsive range is 1024px to 1680px wide. QA tests three points: 1024, 1280, 1680." Phase 4 completion criterion repeats: "at 1024 / 1280 / 1680, no horizontal scrollbar, three side-by-side operative cards." **Resolution preserves AC-045** — AC-045 was implicit on bounds; numeric pin satisfies it without changing the assertion. ✓
- **CTO-12 (AC-035 disabled-state seam):** Matrix → ADR §D12 + §8 Data Model. D12 reads "`OperativeCard` declares `disabled?: boolean` on its props (default `false`)" and the styled-but-unwired CSS state is implemented and visible to QA via DevTools or manual prop override. §8 Data Model shows `disabled?: boolean` on the `Operative` type with comment "unused this run; seam for AC-035." **Resolution preserves AC-035** — the disabled-state branch in AC-035 is verifiable by Builder temporarily setting `disabled={true}` per Phase 4 completion criteria. The CSS exists; the prop exists; no operative is disabled in seed data, which is consistent with my AC (the AC describes the styled state, not whether any operative actually has it set). ✓

No resolution silently weakens an AC. No matrix pointer is empty.

### 3. Security Trigger Confirmation

Confirmed **OFF**. Architect's reasoning aligns with my hand-off flag and CTO Round 2's confirmation. I re-walked my user stories and AC for any auth, persisted user input, or sensitive-flow surface that the trigger setting might miss:

- All seven user stories describe presentational behavior or seam-shape (no auth, no persistence, no IPC).
- AC-017, AC-029, AC-036 are explicit no-ops; CTO Round 2 §2 confirmed each has inline anti-pattern guards in the phase plan.
- The dev-only `?surface=landing` reader does string equality on `window.location.search` — no injection surface (CTO Round 2 noted this and I agree it's not a security flip).
- No file system access, no network calls, no IPC handlers added. `tokens-landing.css` font assets are bundled at build time, not fetched at runtime.

Trigger OFF stands. If Builder breaches AC-017 / AC-029 / AC-036 the trigger flips ON; the phase plan's anti-patterns make a quiet breach unlikely.

### 4. No-op AC Integrity in Phase Breakdown

Walked AC-017, AC-029, AC-036 against the phase implementation notes and anti-patterns. No silent re-spec to "wired" anywhere.

- **AC-017 (Phase 4):** Phase 4 anti-pattern reads "Do NOT wire `onProjectChange` to anything other than the local `selectedProjectId` state... do NOT touch `claudeConfigStore`, do NOT call `window.agentcon.*` IPC, do NOT trigger any side effect." Phase 4 completion criterion: "code search shows `onProjectChange` is wired only to local `setSelectedProjectId`; no other consumers." ✓ no-op preserved.
- **AC-029 (Phase 3):** Phase 3 anti-pattern: "Do NOT add a `useEffect` to TransmissionsFeed for any reason. AC-029 is observed by inspection: `git grep useEffect src/panels/landing/components/TransmissionsFeed.tsx` should return nothing." ✓ no-op preserved.
- **AC-036 (Phase 4 verification, Phase 3 implementation):** Phase 3 anti-pattern: "Do NOT pass `onDeploy` from `LandingPage.tsx` in this run — let the card fall to the `console.info` fallback. AC-036 explicitly approves this." Phase 4 completion criterion: "clicking Deploy logs `Deploy: <Codename>` and produces no other observable effect. Builder verifies via DevTools console + Network tab + zustand devtools." ✓ no-op preserved.

All three deferred behaviors retain their explicit no-op character through both implementation and verification phases.

### 5. Visual-fidelity verification path — keyboard / dropdown / focus AC walked under D10

My PM-7 concern was whether the test-infra Option (c) (deterministic inspection, no runner) actually covers the keyboard/dropdown ACs (AC-007 through AC-016) and the focus-state AC (AC-035). Walking each:

- **AC-007 (default closed state):** trigger has `aria-haspopup="listbox"`, `aria-expanded="false"`, accessible name. → DOM inspection in DevTools. ✓
- **AC-008 (unassigned label rule):** trigger label reads `- unassigned -` when `selectedProjectId` is null. → text content inspection. ✓
- **AC-009 (click to open):** click trigger; observe `role="listbox"` element appears, `aria-expanded="true"`, first option highlighted. → manual click + DOM observation. ✓
- **AC-010 (option click selects):** click option; observe callback fired (DevTools console log if Builder adds a temporary log, or selected state observed via trigger label change), dropdown closes, focus on trigger. → DOM + console + `document.activeElement` inspection. ✓
- **AC-011 (Space/Enter opens with focus management):** focus trigger via Tab; press Space; observe listbox open, `aria-activedescendant` set to first or selected option's id. → keystroke + DOM. ✓
- **AC-012 (ArrowDown/ArrowUp wrap):** open listbox; press ArrowDown until wraps to first; press ArrowUp until wraps to last. → keystroke + `aria-activedescendant` value inspection. ✓
- **AC-013 (Enter selects):** highlight an option; press Enter; observe selection effect + close + focus return. → keystroke + DOM + `document.activeElement`. ✓
- **AC-014 (Escape closes without selecting):** press Escape; observe close + no selection change + focus on trigger. → keystroke + DOM + `document.activeElement`. ✓
- **AC-015 (outside click closes):** open dropdown; click outside bounding box; observe close + no selection change. → click + DOM. ✓
- **AC-016 (trigger hover/focus-visible/active states):** computed styles on hover, `:focus-visible`, `:active`. → DevTools "force element state" inspector + `getComputedStyle`. ✓
- **AC-035 (Deploy idle/hover/focus-visible/active/disabled states):** same DevTools force-state pattern; for the disabled branch, Builder temporarily sets `disabled={true}` per Phase 4 completion criteria. → forced state + `getComputedStyle` + `aria-disabled` attribute inspection. ✓

Every keyboard AC is a single keystroke or short keystroke sequence + a deterministic DOM/computed-style observation. Every focus-state AC is verifiable via DevTools' built-in "force element state" feature plus `getComputedStyle`. CTO Round 2 §7 reached the same conclusion via a different walk. No AC silently requires a runner. Option (c) holds.

### 6. Disposition of Architect's three watching concerns

- **Architect-1 (`tokens-landing.css` discipline — no `--lp-*` under `:root`):** **Reviewer/Builder concern, not new AC needed.** AC-039 already covers the negative assertion ("does not redefine any existing token currently consumed by `ClaudeSettingsPanel`"). Architect's proposed Reviewer grep (`grep -n '^:root' src/styles/tokens-landing.css`) plus QA's `getComputedStyle` snapshot on a settings rail item (Phase 1 completion criterion) covers detection. AC-039 is the right home; AC-002 is the regression backstop.
- **Architect-2 (ProjectSelector `aria-activedescendant` half-implementation risk):** **QA verification scope, supported by existing AC.** AC-011 explicitly names "the first option (or the previously-selected option, if any) marked as highlighted via `aria-activedescendant` or focus." AC-012 names ArrowDown/ArrowUp highlight movement. CTO Round 2 §4 added the explicit multi-step reopen sequence (select option 2 → close → click-reopen highlights option 1; vs keyboard-reopen highlights option 2) which catches the half-implementation pattern. QA scope is sufficient with the existing AC; no new AC required.
- **Architect-3 (surface switcher must default to settings on cold start):** **QA verification scope, supported by existing AC.** AC-002 ("default app entry behavior preserved") plus Phase 1 completion criterion ("Cold open lands on the settings panel") plus Phase 1 anti-pattern ("Do NOT default the surface switcher to `'landing'`") are sufficient. No new AC required.

All three Architect concerns are real but already covered by existing AC + phase completion criteria + Reviewer/QA scope. No PRD changes needed.

### Concerns I'm watching during execution

1. **CTO Round 2 watching concern #4 (AC-009 vs AC-011 highlight-on-reopen).** The two ACs differ on purpose: click-open always highlights first; keyboard-open highlights selected-or-first. Phase 4 implementation notes resolve this asymmetrically (`setHighlightedIndex(selectedProjectId index || 0)` on the keyboard path only), which is correct, but the asymmetry is easy to flatten on review. QA must test the multi-step reopen sequence explicitly: (a) keyboard-select option 2, close, click-reopen → highlight on option 1; (b) keyboard-select option 2, close, keyboard-reopen → highlight on option 2. If QA collapses this to a single test, AC-009 or AC-011 silently degrades.

2. **AC-036 implementation in Phase 3 vs verification in Phase 4.** Phase 3 implements the click handler with the `console.info` fallback. Phase 4 owns the no-op *verification*. If Phase 3 ships and Phase 4 stalls, AC-036 is implemented but unverified — Reviewer should not allow Phase 3 to merge without confirming Phase 4 will run before the run closes. The seam is right; the verification gate matters.

3. **AC-018 italic must be a real italic file (not synthetic obliquing).** CTO Round 2 watching concern #5 already flagged this. Adding my voice: the entire spy/dossier aesthetic is carried by the EB Garamond italic line in the hero. If `EBGaramond-Italic.woff2` ships missing or the `@font-face` `font-style: italic` declaration is wrong, the browser falls through to Georgia italic or synthesizes obliqued glyphs from the regular file — both visually weaker and both technically violate AC-040's "explicit fallbacks" intent. QA's AC-018 verification must include `getComputedStyle(...).fontFamily` resolving to `EB Garamond` (not Georgia) AND `fontStyle === 'italic'`. If AC-018 passes on text/family but the rendered glyphs are obliqued regulars, that's a covert fail that QA's named-element checklist could miss. I want this stated in the QA verdict explicitly.

No blocking objections. Sign-off granted on sections 8-10 and the ADR.

### Final Lock

```
## Consensus Status: LOCKED
- CTO: ✅ approved [timestamp] (concerns: [N] noted)
- PM: ✅ approved [timestamp] (concerns: [N] noted)
- Architect: ✅ approved [timestamp] (concerns: [N] noted)
- PRD locked: [timestamp]
```

---

## Consensus Status: LOCKED — 2026-05-03

**PRD locked at 2026-05-03 (CTO final lock block).**

### Sign-off ledger

| Agent | Round | Section reviewed | Status | Concerns named | Source line range |
|---|---|---|---|---|---|
| CTO | Round 1 | PM sections 3-7 | ✅ APPROVED | 6 | Section 11, "CTO Sign-off — 2026-05-03" |
| Architect | Round 1 (request) | Self — sections 8-10 + ADR | ✅ APPROVED (self-flagged) | 3 | Section 11, "Architect Sign-off Request — 2026-05-03" |
| CTO | Round 2 | Architect sections 8-10 + ADR | ✅ APPROVED | 6 | Section 11, "CTO Sign-off (Round 2) — 2026-05-03" |
| PM | Round 2 | Architect sections 8-10 + ADR | ✅ APPROVED | 3 | Section 11, "PM Sign-off (Round 2) — 2026-05-03" |

All three required sign-offs are present:
- ✅ CTO on PM section (3-7) → CTO Round 1.
- ✅ CTO on Architect section (8-10 + ADR) → CTO Round 2.
- ✅ PM on Architect section (8-10 + ADR) → PM Round 2.

No blocking objections recorded in any round. Architect's Round 1 sign-off is included as a self-flagged set of watching concerns (it pre-dates and informs CTO Round 2).

### Locked scope and triggers

- **Verdict carried into lock:** SIMPLIFY (per section 1 header and CTO verdict 2026-05-03). Static, presentational landing page only; behavioral wiring deferred behind clean prop seams. **Preserved.**
- **Three deferred behaviors with explicit no-op AC** (Builder must not breach; breach flips security trigger ON):
  - **AC-017** — project-selector dropdown selection: no navigation, no IPC, no network, no `claudeConfigStore` mutation. Only effects: local UI state + `onProjectChange` prop callback.
  - **AC-029** — recent-transmissions feed: no timer, no polling, no websocket, no IPC subscription, no file watcher; `● LIVE` is purely visual; any pulse is CSS-only.
  - **AC-036** — Deploy button activation: no navigation, no command execution, no scaffolding, no IPC, no network, no persisted-store mutation. Only effects: `onDeploy(operativeId)` if provided, otherwise a single `console.info` fallback.
- **Security trigger: OFF.** No auth, no PII, no IPC handlers added, no network calls, no persisted-store mutations. Confirmed by PM (hand-off), Architect (Round 1), CTO (Round 2). Trigger flips ON only if Builder breaches AC-017 / AC-029 / AC-036.
- **Performance trigger: OFF.** ≤4 transmission rows, ≤3 operative cards, no streaming, no polling, ~110KB woff2 bundle delta (Latin subset). Not a perf surface.

### AC ↔ phase coverage (locked)

Total: **45 AC across 4 phases (5 + 8 + 18 + 14).** Every AC-001 through AC-045 mapped to exactly one phase. No orphans. Validated by both CTO Round 2 §3 and PM Round 2 §1.

| Phase | AC count | AC range / list |
|---|---|---|
| Phase 1 — Foundation (tokens, fonts, surface switcher, overflow scope) | 5 | AC-001, AC-002, AC-003, AC-039, AC-040 |
| Phase 2 — Top sections (Header, Status, ProjectSelector trigger, Hero) | 8 | AC-004, AC-005, AC-006, AC-007, AC-008, AC-018, AC-019, AC-020 |
| Phase 3 — Mid + bottom (PersonnelFile, Transmissions, OperativesGrid, Footer) | 18 | AC-021 through AC-034, AC-037, AC-038, AC-041, AC-043 |
| Phase 4 — Interactivity + a11y polish | 14 | AC-009 through AC-017, AC-035, AC-036, AC-042, AC-044, AC-045 |

### Aggregated concerns ledger (de-duped, IDed)

The four sign-offs collectively named **18 concerns** (6 + 6 + 3 + 3). After de-duping cross-references, **15 distinct downstream concerns** carry into execution. Each has a stable ID (CONS-NN) for Builder, QA, Reviewer, and Security to reference in their verdicts. Where two agents flagged the same underlying issue, the entry lists both with the dedupe noted.

**De-dupe summary:**
- CONS-08 merges PM-R2-1 + CTO-R2-4 (both flagged the AC-009 vs AC-011 highlight-on-reopen asymmetry).
- CONS-09 merges PM-R2-3 + CTO-R2-5 (both flagged EB Garamond italic vs synthetic obliquing).
- CTO-R1's six concerns (CTO-R1-1 through CTO-R1-6) were *spec-completion* concerns about Architect's job; they were resolved in §8 Concerns Resolution Matrix rows 9-14 and the ADR before Architect signed. They are not re-listed as live execution concerns. The *runtime guards* that protect those resolutions live in CONS-04, CONS-05, CONS-06, CONS-13, CONS-14, CONS-15 below — those are what Builder/QA/Reviewer must enforce going forward.
- Architect self-flagged Arch-1 (tokens-landing.css discipline) and Arch-3 (cold-start default) overlap with CTO-R1-5 and CTO-R1-2 respectively at the spec level (resolved) but are kept as live runtime guards (CONS-13 and CONS-15) because that is where they bite during execution.

| ID | Source(s) | Concern (one-line) | Phase(s) | Owner during execution |
|---|---|---|---|---|
| CONS-01 | CTO-R2-1 | Phase 3 lands 14 source files + 1 modify; require incremental commits per component group, fail fast on any monolithic Phase 3 attempt. | Phase 3 | Reviewer (commit shape), Builder (commit cadence) |
| CONS-02 | CTO-R2-2 | `?surface=landing` query-param reader is not `DEV`-gated; production builds will still render landing if the URL is loaded. Decide explicitly: gate the reader, or accept the artifact-display leak. Either choice must be recorded in the attempt note. | Phase 1 | Reviewer (decide and record), Builder (implement decision) |
| CONS-03 | CTO-R2-3 | Settings-panel `getComputedStyle` baseline (rail item: `font-family`, `font-size`, `color`, `background-color`) must be captured *before* Phase 1 edits, not after. Vacuous if captured post-edit. | Phase 1 | Builder (capture pre-edit baseline in attempt note), Reviewer (verify before-snapshot is real) |
| CONS-04 | CTO-R2-6 | Dev-only switcher *button* must be structurally gated by `import.meta.env.DEV` so Vite dead-code-eliminates it at production build; not a runtime check. | Phase 1 | Reviewer (verify gating shape) |
| CONS-05 | Arch-2 | ProjectSelector listbox keyboard semantics are easy to half-implement: must update `aria-activedescendant` on the listbox on every keystroke; do NOT move DOM focus to options; do NOT trap focus. Walk all eight dropdown AC (AC-009–AC-016) in one pass. | Phase 4 | Reviewer (one-pass walk), QA (per-keystroke verification) |
| CONS-06 | Arch-1 | `tokens-landing.css` discipline: no `--lp-*` token may be declared under `:root`. Reviewer hard check: `grep -n '^:root' src/styles/tokens-landing.css` returns nothing. Settings-panel `getComputedStyle` snapshot is the second line of defense. | Phase 1 | Reviewer (grep), QA (computed-style regression on AC-002/AC-039) |
| CONS-07 | Arch-3 | Surface switcher must default to `"settings"` on cold start. AC-002 + Phase 1 completion criterion + Phase 1 anti-pattern enforce this; do not silently flip the default for convenience. | Phase 1 | Builder (preserve default), Reviewer (verify default), QA (cold-start observation) |
| CONS-08 | CTO-R2-4 + PM-R2-1 (deduped) | AC-009 (click-open: always highlight first) and AC-011 (keyboard-open: highlight selected-or-first) are intentionally asymmetric. Phase 4 implementation notes resolve correctly only on the keyboard path. QA must run the multi-step reopen sequence: (a) keyboard-select option 2, close, click-reopen → highlight option 1; (b) keyboard-select option 2, close, keyboard-reopen → highlight option 2. Collapsing to a single test silently degrades one of the two ACs. | Phase 4 | QA (explicit two-path verification), Reviewer (do not accept unified handling) |
| CONS-09 | CTO-R2-5 + PM-R2-3 (deduped) | EB Garamond italic must be a real italic file (`EBGaramond-Italic.woff2`), not synthetic obliquing of the regular. AC-018 verification must include `getComputedStyle(...).fontFamily` resolving to `EB Garamond` (not Georgia) AND `fontStyle === 'italic'`. Covert fail risk on the named-element checklist alone. | Phase 1 (asset bundling), Phase 2 (hero rendering) | Builder (bundle italic woff2; correct `@font-face`), QA (computed-style + font-family verification, recorded in QA verdict) |
| CONS-10 | PM-R2-2 | AC-036 implementation lands in Phase 3 (`console.info` fallback handler), but no-op *verification* lands in Phase 4. Phase 3 must not merge as the run's terminal state — Phase 4 must run before the run closes, or AC-036 is implemented-but-unverified. | Phase 3 → Phase 4 | Reviewer (gate Phase 3 merge on Phase 4 still in scope), QA (Phase 4 verification of `console.info` + no other observable effects) |
| CONS-11 | CTO-R1-1 (resolved at spec; runtime check carries) | AC-045 responsive bounds locked at 1024px–1680px (ADR §D11). QA tests three discrete points: 1024 / 1280 / 1680. Three side-by-side cards across the range; no horizontal scrollbar. | Phase 4 | QA (three viewport snapshots) |
| CONS-12 | CTO-R1-3 (resolved at spec; runtime check carries) | AC-033 top-rule accent locked to single shared `--lp-accent-red` (ADR §D8). All three operative cards use the same red. Per-card-accent branch closed. | Phase 3 | Builder (single accent), Reviewer (no per-card override slipped in) |
| CONS-13 | CTO-R1-5 (resolved at spec; runtime check carries — overlap with CONS-06) | Token bifurcation regression: settings-panel `getComputedStyle` for one rail item must be byte-identical (`font-family`, `font-size`, `color`, `background-color`) before vs after the run. AC-002 + AC-039 backstop. | All phases (cumulative regression) | QA (snapshot diff at end of Phase 1 and again at end of Phase 4) |
| CONS-14 | CTO-R1-4 (resolved at spec; runtime check carries) | `Operative.disabled?: boolean` seam declared on props (default `false`); CSS for disabled state implemented; no operative is disabled in seed. AC-035 disabled branch verified by Builder temporarily setting `disabled={true}` per Phase 4 completion criteria. | Phase 3 (CSS), Phase 4 (verification) | Builder (declare prop + CSS), QA (manual disabled toggle test) |
| CONS-15 | CTO-R1-2 (resolved at spec; runtime check carries — overlap with CONS-07) | AC-002 toggle: surface switcher must not break settings overflow; cold start must default to settings. ADR §D1 + §D3 + Migration Safety carry the resolution. | Phase 1 (default), Phase 4 (overflow scope holds across responsive range) | Builder, Reviewer, QA (cold-start + overflow observation) |

### Downstream guidance

**Builder must actively guard against** (these are implementation-time hazards — if Builder lets one slip, QA or Reviewer downstream may not catch it cheaply):

- **CONS-03** — capture the settings-panel computed-style baseline pre-edit. Easy to forget; vacuous if captured post-edit.
- **CONS-06** — never declare `--lp-*` under `:root` in `tokens-landing.css`. Single keystroke breach; downstream regression is broad.
- **CONS-07** / **CONS-15** — keep cold-start default at `"settings"`. Convenience flip silently breaks AC-002 for every existing user.
- **CONS-09** — bundle the actual `EBGaramond-Italic.woff2` and write the matching `@font-face` declaration. Synthetic obliquing falls through silently.
- **CONS-12** — single shared `--lp-accent-red` for all three operative card top rules. No per-card override.
- **CONS-14** — declare `disabled?: boolean` on `Operative` and implement the CSS state, even though no seed operative is disabled. The seam must exist.
- **AC-017 / AC-029 / AC-036** — never wire any deferred behavior. Phase anti-patterns spell out the prohibitions inline; a breach flips the security trigger ON.
- **CONS-01** — commit Phase 3 incrementally (one component group per commit). A monolithic Phase 3 attempt is grounds for Reviewer rejection.

**Reviewer / QA verification points** (these are downstream-only checks; Builder cannot self-verify them without the same toolset):

- **CONS-02** — Reviewer decides explicitly whether to also `DEV`-gate the query-param reader, or accept the production leak. Either is acceptable; the decision must be recorded in writing.
- **CONS-04** — Reviewer confirms the dev-only button gating is structural (`{import.meta.env.DEV && <button .../>}`), not a runtime variable.
- **CONS-05** — Reviewer walks AC-009 through AC-016 against the implementation in one pass; QA exercises every keystroke per AC.
- **CONS-08** — QA explicitly runs the two-path reopen sequence (click-reopen highlights option 1 even after keyboard-selecting option 2; keyboard-reopen highlights option 2). Both paths are required to pass.
- **CONS-09** (verification leg) — QA records `getComputedStyle(...).fontFamily === "EB Garamond"` AND `fontStyle === "italic"` in the AC-018 verdict. Family-only or style-only is a covert fail.
- **CONS-10** — Reviewer does not allow the run to close after Phase 3 if Phase 4 has not run. AC-036 verification gate is in Phase 4.
- **CONS-11** — QA tests at 1024 / 1280 / 1680 specifically; no horizontal scrollbar; three-up grid.
- **CONS-13** — QA captures the settings-panel rail-item `getComputedStyle` snapshot at end of Phase 1 and again at end of Phase 4; both must match the pre-edit baseline.

### Handoff

**PRD is LOCKED. No further edits to sections 1–10 without re-opening consensus (which requires re-invoking CTO sign-off).** The pipeline now advances to **Builder, starting with Phase 1 (Foundation — tokens, fonts, surface switcher, overflow scope; AC-001 / AC-002 / AC-003 / AC-039 / AC-040).** Builder's first action is exploration against the Phase 1 reference files listed in §9. CONS-03 (capture baseline pre-edit) is the first runtime obligation.

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
