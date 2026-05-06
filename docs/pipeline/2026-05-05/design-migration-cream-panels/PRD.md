# PRD: Design-System Migration — Cream Panels on Dark Chrome

**Status:** DRAFT
**Slug:** design-migration-cream-panels
**Run:** docs/pipeline/2026-05-05/design-migration-cream-panels/
**Created:** 2026-05-03
**Updated:** 2026-05-03

---

## 1. Header

| Field | Value |
|---|---|
| Requested by | user |
| CTO verdict | SIMPLIFY |
| Verdict date | 2026-05-03 |
| ADR | docs/pipeline/2026-05-05/design-migration-cream-panels/ADR.md |
| Phases | TBD (Architect) |
| Triggers | security: **OFF** (CTO call — no auth, no IPC, no new data, no new network surface; migration explicitly does not change `claudeConfigStore`/IPC/file-watcher wiring). performance: **OFF** (CTO call — token rename is mechanical, paint cost of 1.5–2px borders is unmeasurable in this Electron renderer). Architect to confirm at sign-off. |

---

## 2. CTO Verdict

See `cto-verdict.md` co-located with this PRD.

**Decision:** SIMPLIFY
**Confidence:** Medium-High

**One-line summary:** Approved as a unified design-system migration; foundation work (token consolidation, panel-border treatment, dev-switch fix, four mockup-issue resolutions) is locked in scope; full settings-panel migration is conditional on Architect proving every phase boundary is independently shippable, otherwise it spins out to a follow-on run.

**Approved scope:** Items 1–6 of CTO verdict §SIMPLIFY scope are non-negotiable. Item 7 (full re-theming of `src/panels/claude-settings/`) is conditional on Architect's enumeration of that surface. Phase 0 = Vitest + Testing Library setup, scoped to settings-panel functional regression coverage. ADR D2 from the prior run is intentionally reversed by this migration.

**Cut from original (if SIMPLIFY):** Settings-panel migration deferred entirely if file count makes phase sizing infeasible. No functionality change to settings (load/edit/save Claude Code config). No visual treatment for surfaces beyond settings + landing + dev-switch unless explicitly enumerated and added with their own AC.

**Architectural concerns flagged:** ADR D2 reversal must not leave codebase half-migrated; token consolidation file-structure choice; settings-panel scope enumeration; four mockup-issue resolution AC must be specific not directional; phase-boundary safety (every phase ships a working app); shim aliases have a one-phase max lifespan; `:focus-visible` global; `overflow: hidden` global; cross-phase regression strategy (Vitest harness or computed-style snapshots).

**Security considerations flagged:** None — no auth, no IPC, no new data, no network. Architect: confirm by walking diffs at sign-off; if any phase plan touches `claudeConfigStore`, IPC handlers, or file-watching infrastructure, flip security trigger and re-open consensus.

---

## 3. Summary

Unify Agentcon on a single cream-panels-on-dark-chrome design language. The landing page (already shipped, validated visually) defines the target; the settings panel and any other surfaces flip from CLI-dark to that language. The work consists of: consolidating two parallel token files into a coherent structure with dark-chrome and content tokens clearly separated, renaming the `--lp-*` prefix to a shared neutral namespace, introducing a new `--border-panel-strong` token applied to every cream content panel, fixing the dev-switch button's contrast regression, locking the four mockup-issue resolutions called out in the prompt (serif italic on tab titles, lifecycle chip selection state, dashed empty-state border, dev-switch readability), and re-theming the settings panel to consume the unified tokens with zero functional regression on its existing flows (load config, edit, save, switch tabs, hooks, presets, alerts). Phase 0 stands up Vitest + Testing Library as the regression net; the migration is greenlit only because that net exists.

This is a **migration**, not a new feature. The risk profile is regression on existing functionality, not "will it work at all." Acceptance criteria are written accordingly: every settings flow that exists today gets a functional-regression AC that resolves to a test specification.

---

## 4. User Stories

- As an existing Agentcon user, I open the settings panel after the migration and see the cream-panels-on-dark-chrome treatment with **zero functional regression**: every tab loads, every edit persists in the Claude Code config file, every save writes correctly, every alert displays, every preset card behaves as before. [Defer-candidate per CTO SIMPLIFY conditional — settings re-theme is conditional on Architect's enumeration]

- As an existing Agentcon user editing Claude Code configuration, I edit a value in any settings field and click Save, and the on-disk Claude Code config file contains my edit afterwards (verifiable by reading the file contents in a test). [Defer-candidate per CTO SIMPLIFY conditional]

- As an existing Agentcon user using the Hooks tab, I add, edit, and remove hook entries (lifecycle event chips, matchers, hook commands) and the resulting state is persisted to the config file with the same shape it had before the migration. [Defer-candidate per CTO SIMPLIFY conditional]

- As an existing Agentcon user encountering an error (e.g. the config file fails to parse), I see an alert/error surface that is readable on the new cream treatment with sufficient contrast and the same error message text as before the migration. [Defer-candidate per CTO SIMPLIFY conditional]

- As a future developer reading `src/styles/`, I find a single coherent token system with dark-chrome tokens and content tokens clearly separated, no `--lp-*` legacy prefixes anywhere in the codebase, no shim aliases left as a permanent bridge, and clear comments delineating the chrome/content boundary.

- As a future developer adding a new content panel, I read existing components, find a single applied border token (`--border-panel-strong`) that produces architectural separation between the panel and the dark chrome, and can apply it to my new panel without introducing a one-off color or width.

- As a dev-mode user on the landing page, I see the dev-switch button (top-right) with sufficient contrast against the cream landing surface to read at a glance — measurable contrast ratio ≥4.5:1 — and the same button when the surface is the settings panel remains readable against the dark chrome of that surface.

- As a Phase 0 maintainer, I run `npm test` (or the Architect-chosen Vitest entry point) and see a green suite covering the settings-panel functional flows above; subsequent phases that touch the settings panel run the same suite as their gate.

- As a regression-checker after the rename phase, I run `grep -r "\-\-lp-" src/` and see zero matches, confirming the namespace cleanup is complete and no shim aliases were stranded.

- As a user of the landing page after the rename phase, I open the landing page and see the same visual treatment as before the migration (modulo the intentional dev-switch contrast fix) — no visual regression on a surface that was already validated.

- As a planner reviewing the four mockup issues, I find four specific AC each locking the resolved treatment to named tokens and computed values — Builder cannot re-litigate which font goes on tab titles, which fill goes on selected chips, which border style replaces the dashed empty-state border, or which colors restore the dev-switch contrast.

- As a tab-section reader in the settings panel, I see section titles set in the monospace UI family at a defined weight and size (matching the landing page's section-header rhythm) and **not** in serif italic — serif italic is reserved for hero treatments only.

- As a Hooks-tab user selecting a lifecycle event chip, I see a clear visual selected state (specific fill token, specific border token, specific text color) distinct from the unselected state, with measurable contrast.

- As a Hooks-tab user encountering an empty state ("No hooks configured for X"), I see a container whose border is rendered in a treatment compatible with the cream surface (resolved per AC) — not a heavy dashed border that visually competes with the panel.

---

## 5. Acceptance Criteria

QA writes tests directly from these. Most ACs target Vitest + Testing Library tests written against the JSDOM render of components, computed-style assertions via `getComputedStyle()`, and file-system reads for save-flow verification. A subset (Hooks-tab interactions; live error states) require either Testing Library user events or — where Architect determines the JSDOM seam is not viable — a manual deterministic-inspection path documented in the test file.

Token names below (`--ink`, `--surface-cream`, `--accent-red`, etc.) are placeholders for the names Architect picks during consolidation. Each AC reads "the token assigned by Architect for [purpose]" — when Architect locks names in §8, QA substitutes them. The contracts (computed value match, contrast threshold, family/style/weight) are non-negotiable; the names are.

### Token consolidation and rename

**AC-001:** Given the rename phase has completed, when a developer runs `grep -rn "\-\-lp-" src/` from the repo root, then the command exits with no matches (zero lines of output). The same assertion is encoded as a Vitest test that reads the relevant source files (or shells out to `grep`) and asserts the match count equals 0.

**AC-002:** Given the rename phase has completed, when a developer inspects the file `src/styles/tokens-landing.css`, then either (a) the file does not exist, or (b) it exists but contains zero `--lp-*` token definitions and zero shim aliases of the form `--lp-*: var(--*)`. (The AC is satisfied by either outcome — Architect picks one in §8 and the AC binds to the chosen shape.)

**AC-003:** Given the consolidated token file structure as Architect specifies in §8, when a developer reads the file(s) Architect names, then dark-chrome tokens (canvas/title-bar/outer-shell colors and borders) are visually grouped under a comment-banded section labeled to indicate "chrome", and content-panel tokens (cream surface, ink, accent red, panel border, content typography) are visually grouped under a comment-banded section labeled to indicate "content". A test asserts both labelled regions exist in the file(s). [Named concern for Architect — section labels and exact file shape pending §8.]

**AC-004:** Given the rename phase has completed, when each former `--lp-*` token's renamed equivalent is loaded, then the new token name is non-prefixed and shared (e.g. `--surface-cream`, `--ink`, `--accent-red`, `--font-display`, `--font-mono`) — no token introduced by this migration carries a panel-specific or surface-specific prefix.

**AC-005:** Given the rename phase has completed, when a developer searches for `--accent-primary` within `src/`, then either (a) the token has been renamed/replaced as part of the unification (Architect's call in §8), or (b) it remains and is documented in §8 with explicit reasoning for retention. In case (a), zero references to `--accent-primary` exist in `src/`.

### Border-panel-strong token and application

**AC-006:** Given the migration has completed, when `getComputedStyle()` reads the value of the `--border-panel-strong` custom property at `:root` (or its scoped equivalent per Architect's structure), then `border-width` resolves to a value within the inclusive range `1.5px` to `2px`, `border-style` resolves to `solid`, and `border-color` resolves to a hex value defined by Architect in §8 that is darker than `--surface-cream` (i.e. the rendered RGB sum of the border color is strictly less than the rendered RGB sum of `--surface-cream`).

**AC-007:** Given the migration has completed, when contrast is computed between the resolved `border-color` of `--border-panel-strong` and `--surface-cream` using the WCAG relative-luminance formula, then the contrast ratio is ≥3.0:1 (sufficient for non-text architectural separation).

**AC-008:** Given the settings panel is rendered after migration, when each of the following panels is inspected via `getComputedStyle()`, then its `border-width` equals the resolved value of `--border-panel-strong` (the width portion of the token) and its `border-color` equals the resolved color of `--border-panel-strong`:
- the project-scope card(s) at the top of the settings surface
- the settings-tab content panel (the framed area each tab renders into)
- form panels inside any tab
- preset cards (e.g. the "Quick presets" cards in the Hooks tab)
- lifecycle-event-chip group container(s) in the Hooks tab
- alert/error containers (inline error banners and toast/notification surfaces, if any exist)

[If a panel in this list does not exist in the codebase, Architect must remove it from this AC in §8 with reasoning; the AC binds to the panels that do exist.]

**AC-009:** Given the settings panel is rendered, when each lifecycle-event-chip in its **default (unselected)** state is inspected via `getComputedStyle()`, then it carries `--border-panel-strong` *or* a token Architect explicitly defines in §8 for chip default-state border (whichever Architect chooses in §8). The AC binds to the chosen token.

### Dev-switch button (App.tsx)

**AC-010:** Given the app is running in dev mode and the landing surface is active, when the dev-switch button is rendered and `getComputedStyle()` is read on it, then `background-color`, `color`, and `border-color` resolve to specific tokens defined in §8 (no inline hex literals — replacing the current hardcoded `#1a1c19` / `#d8d2bf` / `#4a4742` from `App.tsx` lines 38-47). A test asserts no inline `style` prop on the button contains hex color literals.

**AC-011:** Given the app is running in dev mode and the landing surface is active, when contrast between the dev-switch button's `color` and `background-color` is computed, then the ratio is ≥4.5:1.

**AC-012:** Given the app is running in dev mode and the landing surface is active, when contrast between the dev-switch button's `background-color` and the surrounding landing surface (`--surface-cream` or its renamed equivalent) is computed, then the ratio is ≥3.0:1 (the button must be discernible from its surrounding background).

**AC-013:** Given the app is running in dev mode and the settings surface is active, when the dev-switch button is rendered (it remains visible per current behavior), then contrast between its `color` and `background-color` is ≥4.5:1, **and** contrast between its `background-color` and the settings outer chrome background (`--bg-base` or renamed equivalent) is ≥3.0:1.

**AC-014:** Given the migration has completed, when the dev-switch button source in `src/App.tsx` is inspected, then no inline `style` prop contains any color hex literal — every color value is sourced from a CSS custom property (`var(--*)`). The dev-switch may use a CSS Module class or inline `var()` references, Architect's call.

### Mockup-issue resolution: tab-section titles

**AC-015:** Given the settings panel is rendered, when any tab section title (e.g. "Hooks", "Quick presets", "Lifecycle event") is inspected via `getComputedStyle()`, then `font-family` resolves to the value of `--font-mono` (the unified monospace token), `font-style` equals `normal` (not `italic`), `font-weight` equals the value Architect locks in §8 (specific number — `400`, `500`, etc., not a CSS keyword unless Architect maps it explicitly), and `font-size` equals a specific token-derived value Architect locks in §8.

**AC-016:** Given the settings panel is rendered, when the document is searched for any element whose computed `font-family` is the serif display family (`--font-display` or its equivalent) **and** whose role is a tab-section title (i.e. labels a tab section, not the page hero), then the result set is empty. (Serif italic is reserved for hero treatments only — landing-page rule, now codified.)

### Mockup-issue resolution: lifecycle event chip selection state

**AC-017:** Given the settings panel's Hooks tab is rendered and a lifecycle-event chip has been clicked, when the clicked chip is inspected, then it carries an explicit selection signal of one of the following forms (Architect picks in §8):
- `aria-selected="true"`, OR
- `aria-pressed="true"`, OR
- a `data-selected="true"` attribute, OR
- a CSS class whose name Architect locks in §8 (e.g. `chipSelected`).

A test asserts the chosen signal is present on the clicked chip and absent on the un-clicked chips.

**AC-018:** Given a lifecycle-event chip is in its **selected** state (per AC-017's chosen signal), when `getComputedStyle()` is read on it, then `background-color`, `border-color`, and `color` resolve to a specific set of three tokens Architect defines in §8 for chip-selected-state. The three values are distinct from the chip's unselected-state values.

**AC-019:** Given a lifecycle-event chip is in its **unselected** state, when `getComputedStyle()` is read on it, then `background-color`, `border-color`, and `color` resolve to a specific set of three tokens Architect defines in §8 for chip-default-state.

**AC-020:** Given a lifecycle-event chip is in its **selected** state, when contrast between its computed `color` and `background-color` is computed via the WCAG relative-luminance formula, then the ratio is ≥4.5:1.

**AC-021:** Given a lifecycle-event chip is in its **unselected** state, when contrast between its computed `color` and `background-color` is computed, then the ratio is ≥4.5:1.

**AC-022:** Given the Hooks tab is rendered, when the user clicks an unselected chip, then after the click that chip carries the selection signal from AC-017 and any previously-selected chip in the same group has its selection signal removed (single-selection semantics — if Architect determines the underlying behavior is multi-select, AC-022 binds to multi-select instead and §8 documents the choice). A Testing Library test exercises this transition and asserts the resulting attribute/class state.

### Mockup-issue resolution: dashed empty-state border

**AC-023:** Given the Hooks tab is rendered with an empty state ("No hooks configured for X at this scope"), when the empty-state container is inspected via `getComputedStyle()`, then `border-style` equals `solid` (not `dashed` or `dotted`). [Architect may instead retain `dashed` if §8 documents the reasoning and the specific lighter border-color token used; in that case the AC binds to `dashed` plus the chosen token.]

**AC-024:** Given the Hooks tab is rendered with an empty state, when the empty-state container is inspected via `getComputedStyle()`, then `border-color` resolves to a specific token Architect defines in §8 for empty-state-container border, and `border-width` equals a specific value (1px or 1.5px — Architect's call) defined in §8.

**AC-025:** Given the Hooks tab is rendered with an empty state, when contrast between the empty-state container's `border-color` and the surrounding cream surface is computed, then the ratio is between 1.5:1 and 3.0:1 (inclusive) — present enough to read as a container, soft enough not to overwhelm on cream. [If Architect's chosen treatment in §8 falls outside this range, §8 documents the rationale and the AC binds to the chosen value.]

### Functional regression: settings panel — load config

**AC-026:** Given a valid Claude Code configuration file exists on disk at the path the settings panel reads from, when the settings panel mounts, then within the time bound the test runner observes (≤2000ms in JSDOM), the panel renders content sourced from that file's parsed contents (specific assertion: at least one read field's rendered value equals the parsed value from the file, verified by a test that writes a known value to a temp file, points the panel at it, and reads the rendered DOM).

**AC-027:** Given the Claude Code configuration file is missing, when the settings panel mounts, then the panel renders the same empty/initial state it rendered before the migration (specific assertion: a test captures the pre-migration DOM snapshot for this case as a baseline string and the post-migration render produces the same logical content — child element types, text, role attributes match the baseline; CSS values are expected to differ).

**AC-028:** Given the Claude Code configuration file exists but contains invalid JSON, when the settings panel mounts, then the panel renders an error/alert surface containing the same error message text it rendered before the migration (test reads the rendered DOM for the alert region and asserts its text content matches the pre-migration baseline).

### Functional regression: settings panel — edit and save

**AC-029:** Given the settings panel is mounted and a string field is editable, when a Testing Library test simulates user typing into that field, then the field's rendered value reflects the typed input character-for-character.

**AC-030:** Given the settings panel is mounted and the user has edited a field, when the user clicks Save (or activates whatever the settings panel's persistence trigger is — Architect identifies the trigger in §8), then within the time bound the test runner observes, the on-disk Claude Code configuration file contains the edited value (verified by the test reading the file with `fs.readFileSync` and parsing it; the asserted value equals the typed input).

**AC-031:** Given the settings panel is mounted and the user has edited a field but not yet saved, when the user navigates away (closes panel / switches tabs in a way that pre-migration code treated as a discard or commit point), then the on-disk file's state matches the pre-migration behavior for that flow exactly (i.e. if pre-migration committed pending edits on tab-switch, post-migration must too; if pre-migration discarded them, post-migration must too — Architect documents the pre-migration semantics for this flow in §8 and the AC binds to whichever applies).

**AC-032:** Given the settings panel is mounted and a save operation is in flight, when a second save is triggered before the first completes, then the second save's behavior matches pre-migration behavior (queued, replaced, or rejected — Architect documents the pre-migration semantics in §8 and the AC binds to whichever applies).

### Functional regression: settings panel — tab switching

**AC-033:** Given the settings panel is mounted on Tab A, when the user clicks Tab B's tab control, then within the time bound the test runner observes, Tab B's content panel is rendered and Tab A's content panel is unmounted or hidden (test asserts Tab B's distinguishing data-testid or text content is present in the DOM and Tab A's is absent or `aria-hidden="true"`).

**AC-034:** Given the settings panel is mounted, when the user switches tabs in any sequence covering each tab at least once, then no console errors are emitted and each tab's content renders without throwing (test wraps the render in an error boundary mock and asserts zero error captures across the sequence).

**AC-035:** Given the settings panel is mounted and an edit is pending in Tab A, when the user switches to Tab B and back to Tab A, then the pending edit's state matches pre-migration behavior (preserved or discarded — Architect documents in §8, AC binds to whichever applies).

### Functional regression: settings panel — Hooks tab interactions

**AC-036:** Given the Hooks tab is mounted with an existing hook group present in the on-disk config, when the tab renders, then the rendered group's matcher value, hook entries, and lifecycle event association each match the parsed values from the file (test writes a known hook group to a temp config, mounts the tab pointing at it, and asserts each rendered field's text content equals the file's value).

**AC-037:** Given the Hooks tab is mounted, when the user clicks "Add matcher group" (or whatever the pre-migration "create new group" affordance is — Architect identifies in §8), then a new editable group surface appears in the DOM (test asserts a new group container is added, distinguishable from existing groups by an empty matcher field or distinct test-id).

**AC-038:** Given the Hooks tab has a hook group with a matcher value, when the user edits the matcher and triggers the persistence flow, then the on-disk config's matcher value for that group equals the edited value (verified by reading the file).

**AC-039:** Given the Hooks tab has a hook group, when the user removes the group via its delete affordance (Architect identifies in §8), then within the time bound the on-disk config no longer contains that group (verified by reading the file and asserting the group's matcher is no longer present in the parsed structure).

### Functional regression: settings panel — presets

**AC-040:** Given the Hooks tab is mounted with the seed preset cards visible, when the user clicks a preset card to apply it, then within the time bound the on-disk config contains a hook entry derived from that preset (test asserts at least one identifying field — the preset's hook command or matcher — appears in the parsed config after the click). [If pre-migration behavior is "open editor pre-filled, do not commit until Save", AC-040 binds to that behavior instead and §8 documents.]

**AC-041:** Given a preset card is rendered, when its lifecycle-event status pill (e.g. `PRETOOLUSE`, `POSTTOOLUSE`, `STOP`) is inspected, then the pill carries a clear visual rest/active distinction (specific assertion: pills with the same lifecycle-event label rendered on different cards have identical computed `background-color`, `border-color`, `color`; pills representing different lifecycle events have at least one differing property among those three). [Per CTO §Key factors §3 — non-exhaustive mockup observation; included to lock the resolution.]

### Functional regression: settings panel — alerts and error states

**AC-042:** Given the settings panel is mounted and an alert/error condition is triggered (config parse failure, write failure — Architect enumerates the cases in §8), when the alert renders, then its text content matches the pre-migration text content for that case (test asserts text content equality against a recorded baseline per case).

**AC-043:** Given an alert/error surface is rendered after migration, when its `getComputedStyle()` is read, then `background-color`, `border-color`, and `color` resolve to tokens Architect defines in §8 for alert/error treatment, and contrast between `color` and `background-color` is ≥4.5:1.

**AC-044:** Given an alert/error surface is rendered, when its container's border is inspected, then `border-width` equals the value of `--border-panel-strong` and `border-color` equals the resolved color of `--border-panel-strong` (alert containers are panels — they get the architectural border treatment).

### Landing-page re-theme regression

**AC-045:** Given the landing page was rendered before the rename phase (baseline), and the landing page is rendered after the rename phase (post), when `getComputedStyle()` is captured for each of the following representative elements at both times, then every captured property's computed value is **identical** between baseline and post (modulo the dev-switch button, which is intentionally changed by this migration):
- `[data-testid="landing-page"]` — `background-color`, `font-family`, `color`
- the `h1` first line — `font-family`, `font-size`, `color`
- the `h1` second line (italic) — `font-family`, `font-style`, `color`
- a transmissions-feed row — `background-color`, `color`, `font-family`
- an operative card — `background-color`, `border-color`, `border-width`
- an operative card's Deploy button — `background-color`, `color`, `border-color`
- the footer — `background-color`, `color`, `font-family`

The baseline is captured by Builder before the rename phase and committed to the run's artifacts; the post-capture runs after the rename phase and the test asserts equality. [Named concern: Architect determines whether the baseline is captured manually-then-checked-in or via a Vitest setup that snapshots before/after — pinned in §8/§9.]

**AC-046:** Given the landing page is rendered after migration, when each landing component's source CSS Module is searched, then no `--lp-*` references remain (covered globally by AC-001, called out specifically here so the landing-page re-theme phase has a distinct gate).

### Phase 0: Vitest + Testing Library setup

**AC-047:** Given the repo is freshly cloned and `npm install` has run, when a developer runs the test command Architect picks in §8 (e.g. `npm test` or `npm run test`), then Vitest (or the equivalent runner Architect picks) executes, runs the test suite, and exits 0 with at least one passing test (the bootstrap test) defined in the suite.

**AC-048:** Given Phase 0 has completed, when a developer inspects `package.json`, then a `test` script exists in the `"scripts"` block whose command invokes the chosen runner. A `devDependencies` entry exists for the chosen runner and for `@testing-library/react` (or whichever equivalent Architect chooses in §8).

**AC-049:** Given Phase 0 has completed, when a developer inspects the test setup, then a JSDOM environment is configured (or equivalent — `happy-dom` is acceptable per Architect's call in §8), CSS Modules are mocked or compiled in a way that allows component tests to render, and at least one example test exists demonstrating a `render()` + `getComputedStyle()` round-trip.

**AC-050:** Given Phase 0 has completed, when subsequent migration phases run, then those phases' AC tests execute under the same runner without additional setup steps (i.e. the harness is sufficient — no per-phase test-config drift).

### Globals and existing rules — preservation/replacement

**AC-051:** Given the migration has completed, when a developer inspects the consolidated token file(s) for the rule `html, body, #root { overflow: hidden }` (currently at `src/styles/tokens.css:105-112`), then the rule is either (a) preserved in place at the consolidated file's chrome section, or (b) replaced with a per-surface scoped rule whose effect on existing surfaces is observably identical — specifically: at runtime, `getComputedStyle(document.documentElement).overflow` resolves to `hidden` and the same is true for `body` and `#root`. [Architect picks (a) or (b) in §8 with reasoning; the AC binds to the runtime computed result either way.]

**AC-052:** Given the migration has completed, when a `:focus-visible` outline is rendered on any focusable element in the settings surface, then the outline's color is sourced from a token in the unified system that produces ≥3:1 contrast against that surface's background (cream for content panels; dark for chrome). When the same focus is rendered on the landing surface, the same is true for cream backgrounds. (The pre-migration global `:focus-visible` rule at `tokens.css:151` referenced `--accent-primary`; Architect resolves whether `--accent-primary` is renamed/unified or scoped, per §8.)

**AC-053:** Given the migration has completed, when the global `body` background, color, and font tokens are resolved, then their values produce: (a) a dark chrome background outside content panels, and (b) text inside content panels that reads as dark on cream (panel-scoped `color` overrides body's default). A test asserts both a chrome region's `background-color` and a content panel's `color` resolve to the appropriate sides of the chrome/content split.

### Halftone / phase-boundary safety

**AC-054:** Given any individual phase has completed (in isolation, without the next phase running), when a developer runs `npm run dev` and opens the app, then the app renders without console errors, the settings surface is operable, and the landing surface is operable. Specifically: no phase exits with broken visuals on either surface or broken settings flow on settings. (This AC is checked at every phase boundary — it is a per-phase gate, not a one-time end-of-run gate.)

**AC-055:** Given the rename phase has completed and any subsequent phases have run, when the codebase is searched for shim aliases of the form `--lp-*: var(--*)`, then the result set is empty — no shim survives past the phase that introduces the rename. (If Architect picks the shim-then-remove pattern in §8, the shim's removal happens in the same phase that introduces consumers of the new names; no shim persists across more than one phase boundary.)

---

## 6. Scope

### In Scope (non-negotiable per CTO §SIMPLIFY scope items 1–6)

- **Phase 0 — Vitest + Testing Library setup** (or Architect-equivalent runner). Test command added to `package.json`. JSDOM environment configured. CSS Modules handled. Example test passes. (AC-047 through AC-050.)
- **Token consolidation.** `tokens.css` + `tokens-landing.css` reorganized into a clean structure where dark-chrome tokens and content-panel tokens are clearly separated. Architect picks the file structure (single file with sectioned banners, OR split into two files) and the layer/import ordering rules. (AC-003.)
- **Token rename.** Every `--lp-*` token renamed to a non-prefixed shared name. Zero `--lp-*` references remain in `src/`. (AC-001, AC-002, AC-004.)
- **New `--border-panel-strong` token** defined (1.5–2px, dark neutral, ≥3.0:1 contrast against cream) and applied to every cream content panel: project-scope cards, settings-tab content panels, form panels inside tabs, preset cards, lifecycle-chip group containers, alert containers. (AC-006, AC-007, AC-008, AC-044.)
- **Dev-switch button (App.tsx) re-themed** against unified tokens — no more inline hex literals. Contrast verified against both cream landing and dark settings chrome backgrounds. (AC-010 through AC-014.)
- **Landing-page re-theme** to consume the renamed tokens. Visual output identical to pre-migration landing (modulo intentional dev-switch fix). (AC-045, AC-046.)
- **Four mockup-issue resolutions, each with locked AC:**
  - Tab-section titles → monospace UI (no serif italic). (AC-015, AC-016.)
  - Lifecycle event chips → selection state restored with explicit token-driven treatment, single-vs-multi semantics matching pre-migration. (AC-017 through AC-022.)
  - Dashed empty-state border → resolved per Architect's choice (solid + lighter color, OR dashed-but-lighter; see AC-023). (AC-023, AC-024, AC-025.)
  - Dev-switch button → covered above (AC-010 through AC-014).
- **Globals resolution.** Existing `html, body, #root { overflow: hidden }` and `:focus-visible` rules either preserved or replaced with token-driven equivalents. Architect documents the choice. (AC-051, AC-052, AC-053.)
- **Phase-boundary safety.** Every phase ships a working app. No mid-pipeline half-migrated state. (AC-054, AC-055.)

### In Scope (conditional per CTO §SIMPLIFY scope item 7 — depends on Architect's enumeration of `src/panels/claude-settings/`)

- **Full re-theming of all `src/panels/claude-settings/` components and CSS modules** to the unified cream-panel-on-dark-chrome language.
- **Functional regression coverage on every settings flow that exists today** — load config, edit a value, save, switch tabs, Hooks-tab interactions (add/edit/remove groups, matcher edits, lifecycle-chip selection), presets (apply, status pills), alerts/error states. (AC-026 through AC-044.)

If Architect's enumeration of `src/panels/claude-settings/` shows the surface cannot fit alongside the foundation work in one coherent phase plan, item 7 is **deferred to a follow-on run**. In that case, AC-026 through AC-044 are removed from this PRD's gate during sign-off and the user stories tagged `[Defer-candidate per CTO SIMPLIFY conditional]` are pulled. The Phase-0 test runner still ships in this run, regardless of whether item 7 ships, so the follow-on run inherits the test net.

### Out of Scope

- Any change to settings-panel functionality. Load, edit, save Claude Code config — exact same behavior as today, modulo any pre-migration semantic notes Architect captures in §8 to bind ACs. CTO §SIMPLIFY explicitly excludes this.
- Visual treatment for surfaces beyond settings + landing + dev-switch. If PM/Architect/Builder discover an additional surface needing migration, it is enumerated in §8 with its own AC OR explicitly deferred — "any other surfaces" in the original prompt is too open-ended to gate.
- New routing system, replacement of the `App.tsx` surface switcher with a real router.
- Any change to the underlying Claude Code config file format, schema, or location.
- Visual regression tooling (Playwright / Percy / Chromatic baselines). Visual regression coverage is via `getComputedStyle()` snapshots in Vitest tests for the landing page baseline (AC-045) and computed-style assertions per visual AC. No new image-diffing infrastructure.
- Internationalization / localization. All text remains the existing English literals.
- Mobile breakpoint work — same scope as the landing run (1024–1680px desktop range).
- Behavioral tests for landing-page interactivity (dropdown, deploy buttons). Those are out of scope for this run; the test runner ships, but populating the suite for the landing surface is left to a future feature run.
- Permanent shim aliases in the token system. Shims are acceptable for one phase only as a transitional state per CTO §6.

---

## 7. Data Lifecycle

This migration reads from and writes to one external entity: the Claude Code configuration file on disk. That entity is **existing** — the settings panel reads and writes it today, the migration explicitly does not change the wiring (CTO §Trigger flags, security: OFF). All other "entities" in this migration are CSS tokens (which are not data — they are static stylesheet content).

| Entity | Source | Created by | Management interface | Status |
|---|---|---|---|---|
| Claude Code config file | Existing on-disk file (path is whatever the settings panel currently uses; Architect identifies in §8) | User (via existing settings-panel UI) | `src/panels/claude-settings/` (existing — unchanged behavior post-migration) | exists |
| Renamed token set (formerly `--lp-*`) | New consolidated stylesheet(s) | Developer (in repo) | `src/styles/tokens.css` (or Architect's chosen consolidated file structure — see §8) | in-scope |
| `--border-panel-strong` token | New consolidated stylesheet(s) | Developer (in repo) | Same as above | in-scope |
| Pre-migration baseline snapshots (for AC-027, AC-028, AC-035, AC-042 — recorded text content / DOM structure for cases that must match pre-migration) | Captured during Phase 0 by Builder before settings-panel migration phases run | Developer (in repo) | Recorded as fixture files under the test directory Architect specifies in §8 (e.g. `tests/fixtures/settings-baseline/`) — committed to the run's artifacts | in-scope |
| Test fixture config files (temp files written during test runs to point the panel at known content) | Generated at test runtime via `fs.writeFileSync` in test setup | Developer (test code) | Test setup helpers under the test directory Architect specifies | in-scope |
| Landing-page baseline `getComputedStyle()` snapshot (for AC-045) | Captured by Builder before the rename phase | Developer (in repo) | Committed to the run's artifacts; consumed by the AC-045 test | in-scope |

**Interim strategy for deferred entities:** None of the read/write surfaces is deferred. The Claude Code config file already exists and is managed by the settings panel today. The new tokens and the baseline snapshots are created **in this run** during the phases Architect lays out.

**External integration details:**
- **Connection config:** the Claude Code config file path is whatever the existing settings panel reads from today — Architect identifies the path-resolution code in §8. The migration does not change this.
- **Record selection / mapping:** N/A — single-file read/write, same as pre-migration.
- **Sync vs query strategy:** existing read-on-mount + write-on-save behavior. The migration does not change polling, watching, or sync semantics. If the existing settings panel has a file watcher (Architect identifies in §8), it remains in place; the AC-031 / AC-035 functional-regression bindings cover whatever the pre-migration semantics are.

---

## 8. Architecture Decision

**ADR:** `docs/pipeline/2026-05-05/design-migration-cream-panels/ADR.md` (16 numbered decisions D1–D16). The full reasoning, alternatives, and consequences live there; this section pins the load-bearing choices into the PRD so QA can resolve every "Architect decides" hook in §5 without paging out.

### 8.1 Surface enumeration (resolves CTO verdict §Architectural #3)

`src/panels/claude-settings/` contains **12 component files** + **1 shared CSS module** (`ClaudeSettingsPanel.module.css`, ~481 lines):
- `ClaudeSettingsPanel.tsx`, `ScopeSwitcher.tsx`, `ScaffoldBanner.tsx`, `AgentsTab.tsx`, `HooksTab.tsx`, `SkillsTab.tsx`, `CommandsTab.tsx`, `PluginsTab.tsx`, `PermissionsTab.tsx`, `EnvTab.tsx`, `ClaudeMdTab.tsx`, `RawJsonTab.tsx`.

All 12 components import classnames from the same `ClaudeSettingsPanel.module.css`. The settings re-theme is concentrated in one CSS file. **Settings re-theme stays IN scope (item 7 IN).** AC-026 through AC-044, AC-009, AC-015–AC-016, AC-018–AC-025 all stay in the gate.

`src/panels/landing/` contains 9 .tsx components + their .module.css files (~10 CSS files). The token rename touches each one mechanically.

### 8.2 Token consolidation strategy — single file, comment-banded sections (ADR D1)

`src/styles/tokens.css` is the single canonical token file. `src/styles/tokens-landing.css` is **deleted** in Phase 2 (AC-002 binds to outcome (a): file does not exist). The new structure under `:root`:

```css
:root {
  /* === CHROME TOKENS === */
  --bg-base, --bg-surface, --bg-elevated, --bg-input, --bg-overlay;
  --border-subtle, --border-default, --border-strong;
  --text-primary, --text-secondary, --text-muted, --text-inverse;
  --color-success, --color-warning, --color-danger, --color-info;
  --status-* (mappings);
  --space-*, --radius-*, --header-height, --sidebar-width, --statusbar-height;
  --shadow-*, --transition-*, --z-*;

  /* === CONTENT TOKENS === */
  --surface-cream, --surface-cream-soft, --feed-bg-dark, --feed-bg-dark-soft;
  --ink, --ink-soft, --ink-faint, --on-dark, --on-dark-soft;
  --accent-red, --accent-red-hover, --accent-red-bg;
  --accent-green, --accent-amber;
  --font-display, --font-mono (unified);
  --text-xxs, --text-xs, --text-sm, --text-base, --text-md, --text-lg, --text-xl, --text-xxl;
  --text-body-lg, --text-display-md, --text-display-lg, --text-display-xl;
  --weight-regular, --weight-medium, --weight-semibold;
  --leading-tight, --leading-normal, --leading-relaxed, --leading-mono, --leading-display-tight;
  --content-max, --page-pad-x;
  --border-panel-strong, --border-panel-strong-color;
  --border-hair, --border-card, --radius-card;
  --chip-bg-default, --chip-border-default, --chip-text-default;
  --chip-bg-selected, --chip-border-selected, --chip-text-selected;
  --empty-state-border-color;
  --alert-bg, --alert-border, --alert-text;
  --pulse-duration;
}
```

**Banner literal strings (resolves CTO concern #6, AC-003):** the comment banners are EXACTLY `/* === CHROME TOKENS === */` and `/* === CONTENT TOKENS === */`. AC-003's test asserts both substrings (`=== CHROME TOKENS ===` and `=== CONTENT TOKENS ===`) appear in `tokens.css`, in that order.

`@font-face` declarations for EB Garamond + JetBrains Mono move from `tokens-landing.css` into the top of `tokens.css` (above `:root`).

### 8.3 Rename strategy — atomic in one phase (ADR D2)

Phase 2 atomically (a) adds the new content tokens, (b) deletes `tokens-landing.css`, (c) flips every `--lp-*` reference to its new name across `src/panels/landing/`. **No shim aliases exist at any phase boundary.** AC-055 trivially satisfied.

The Phase 2 file count is ≤12 (1 token file + 1 deletion + LandingPage.tsx + ≤9 .module.css files). This deviates from the ≤5 files/phase soft cap; the deviation is justified because the rename is mechanical (find/replace `--lp-X` → `--X` per the D6 map) and any split would leave the codebase non-functional at the boundary, violating AC-054 (per-phase deployable).

### 8.4 Token name map (ADR D6)

Locked rename map (CSS-side):

| Old | New |
|---|---|
| `--lp-surface-cream` | `--surface-cream` |
| `--lp-surface-cream-soft` | `--surface-cream-soft` |
| `--lp-surface-dark` | `--feed-bg-dark` |
| `--lp-surface-dark-soft` | `--feed-bg-dark-soft` |
| `--lp-ink`, `--lp-ink-soft`, `--lp-ink-faint` | `--ink`, `--ink-soft`, `--ink-faint` |
| `--lp-on-dark`, `--lp-on-dark-soft` | `--on-dark`, `--on-dark-soft` |
| `--lp-accent-red`, `--lp-accent-green`, `--lp-accent-amber` | `--accent-red`, `--accent-green`, `--accent-amber` |
| `--lp-font-display`, `--lp-font-mono` | `--font-display`, `--font-mono` (replaces existing system-stack `--font-mono`) |
| `--lp-text-xxs`, `--lp-text-xs`, `--lp-text-sm` | `--text-xxs`, `--text-xs`, `--text-sm` (xs/sm match existing values, retained) |
| `--lp-text-base` (14px) | `--text-body-lg` (renamed — existing `--text-base` 13px retained for settings density) |
| `--lp-text-md`, `--lp-text-lg`, `--lp-text-xl` | `--text-display-md`, `--text-display-lg`, `--text-display-xl` (renamed to display tier — existing 13/14/16/18/22 size scale retained) |
| `--lp-weight-regular`, `--lp-weight-medium` | `--weight-regular`, `--weight-medium` (identical values, retained) |
| `--lp-leading-tight` | `--leading-display-tight` (1.05 — distinct from existing 1.3 `--leading-tight`) |
| `--lp-leading-normal` | `--leading-normal` (existing 1.5 retained — landing's 1.45 is acceptable variance, both are "normal") |
| `--lp-leading-mono` | `--leading-mono` |
| `--lp-content-max`, `--lp-page-pad-x` | `--content-max`, `--page-pad-x` |
| `--lp-border-hair`, `--lp-border-card`, `--lp-radius-card` | `--border-hair`, `--border-card`, `--radius-card` |
| `--lp-pulse-duration` | `--pulse-duration` |

**Collision resolutions (AC-005, CTO concern §Architectural #6):**
- `--font-mono`: unified to JetBrains-first stack (`"JetBrains Mono", "SF Mono", Menlo, Monaco, ui-monospace, monospace`). Settings panel inherits JetBrains Mono visually — accepted per the migration thesis. No AC asserts pre-migration `font-family` on settings.
- `--text-base`: 13px (settings density retained). Landing's 14px body becomes `--text-body-lg`.
- **`--accent-primary` is RENAMED/REPLACED.** AC-005 binds to outcome (a). `--accent-primary` → `--accent-red`; `--accent-primary-hover` → `--accent-red-hover` (`#c64b3f`); `--accent-primary-bg` → `--accent-red-bg` (`rgba(184, 54, 43, 0.12)`). After Phase 4, `grep -r "\-\-accent-primary" src/` returns zero matches.

### 8.5 New tokens introduced (ADR D7)

| Token | Value | Binds AC |
|---|---|---|
| `--border-panel-strong` | `1.5px solid var(--border-panel-strong-color)` | AC-006, AC-008, AC-044 |
| `--border-panel-strong-color` | `#9c8c5c` (RGB 156,140,92 — contrast ≈3.07:1 vs cream) | AC-007, AC-008 |
| `--chip-bg-default`, `--chip-border-default`, `--chip-text-default` | `var(--surface-cream-soft)`, `var(--border-panel-strong-color)`, `var(--ink-soft)` | AC-009, AC-019, AC-021 |
| `--chip-bg-selected`, `--chip-border-selected`, `--chip-text-selected` | `var(--ink)`, `var(--ink)`, `var(--surface-cream)` | AC-018, AC-020 |
| `--empty-state-border-color` | `#bfb59a` (contrast ≈1.71:1 vs cream — within AC-025 1.5–3.0 range) | AC-024, AC-025 |
| `--alert-bg`, `--alert-border`, `--alert-text` | `#f7e8d6`, `var(--border-panel-strong-color)`, `#7a2418` | AC-043, AC-044 |
| `--text-body-lg`, `--text-display-md`, `--text-display-lg`, `--text-display-xl` | `14px`, `18px`, `28px`, `56px` | AC-045 (landing regression) |
| `--leading-display-tight`, `--leading-mono` | `1.05`, `1.5` | AC-045 |

### 8.6 Test runner — Vitest + Testing Library + jsdom (ADR D4)

DevDependencies (added in Phase 0): `vitest@^2`, `@testing-library/react@^16`, `@testing-library/jest-dom@^6`, `@testing-library/user-event@^14`, `jsdom@^25`. Why jsdom over happy-dom: jsdom's `getComputedStyle` + CSS-custom-property resolution is more reliable; the migration's ACs depend on `getComputedStyle` reading `var()`-resolved values.

`package.json` adds `"test": "vitest"` and `"test:run": "vitest run"`. `npm run test:run` is the CI / pre-commit gate; `npm test` is dev watch mode. **AC-049 binds to:** `vitest.config.ts` declares `test.environment = "jsdom"`, `test.setupFiles = ["./tests/setup.ts"]`, `test.css = { modules: { classNameStrategy: "stable" } }`. CSS Modules pass through Vitest's Vite-native transformer — no `identity-obj-proxy` needed. The bootstrap test (`tests/example.test.tsx`) demonstrates `render() + getComputedStyle()` round-trip.

### 8.7 IPC mock seam — `window.agentcon` factory (ADR D5)

**Test-seam file path:** `tests/mocks/agentconMock.ts`. Exports `installAgentconMock(initialFs?: Map<string, string>)` which assigns a complete `AgentConApi` (matching `src/global.d.ts`) onto `globalThis.window.agentcon`. The mock wraps two in-memory `Map<string, string>` instances (one for the fake fs, one for renderer-side preferences) and returns the fs Map as a handle so tests can `set()` initial state and `get()` post-Save state.

Mocking strategy (CTO concern #1):
- **Not** `vi.mock("../../lib/config-io", ...)` — there is no such file. The settings panel calls `window.agentcon.fs.writeText` directly via the store. The mock seam is at the global window object, installed by `tests/setup.ts`'s `beforeEach`.
- `tests/setup.ts` does: `import { installAgentconMock } from "./mocks/agentconMock"; beforeEach(() => { installAgentconMock(); });`
- Save-flow assertion shape: `installAgentconMock()` returns a handle to the fake-fs Map. Test arranges initial config via `fakeFs.set(path, json)`, mounts panel, drives user events, clicks Save, then `expect(JSON.parse(fakeFs.get(path)!)).toEqual({...})`.

**AC-030, AC-038, AC-039 binding:** "the on-disk Claude Code configuration file contains the edited value" binds to the in-memory fake-fs Map at the renderer-test boundary. The Map IS the on-disk file from the renderer's perspective; production replaces the Map with the Electron-IPC implementation but the interface contract is identical.

### 8.8 Pre-migration baseline capture — Phase 0.5 (ADR D9)

A dedicated **Phase 0.5** (between Phase 0 and Phase 1) captures fixtures from the un-migrated codebase BEFORE any token-related source change. Phase 0.5 deliverables (committed to the run):

- `tests/baseline/landing-computed-style.json` — `getComputedStyle()` snapshot of the seven AC-045 elements (sorted-keys, fixed-property JSON shape).
- `tests/baseline/settings-empty-state.json` — DOM logical structure (element types + text + role attrs only, CSS values excluded) of the settings panel when config is missing. Binds AC-027.
- `tests/baseline/settings-invalid-json-alert.txt` — exact alert text shown when settings config JSON is invalid. Binds AC-028.
- `tests/baseline/settings-tab-switch-pending.json` — see D10/§8.10 below — captures the empirical pre-migration semantic for AC-035.
- `tests/baseline/settings-alerts-by-case.json` — text content of every alert/error case enumerated in §8.11 below. Binds AC-042.

Capture mechanism: a one-shot Vitest test (`tests/baseline/capture.test.ts`) mounts the un-migrated panel under the IPC mock with pre-arranged states, calls the relevant DOM/computed-style readouts, and `fs.writeFileSync`'s the results. The test runs once during Phase 0.5; its outputs are committed; the test is deleted (or `.skip`-marked) in the same Phase 0.5 deliverable.

**Phase 0.5 must run BEFORE Phase 1.** If Phase 0.5 ran after any token rename, AC-045 baseline would already be post-rename and the regression check would be hollow.

### 8.9 Pre-migration semantic captures — locked branches (ADR D10)

For every "whichever pre-migration behavior" disjunction in §5, Architect inspected the existing settings code and locks the branch:

| AC | Pre-migration behavior (architect-confirmed) | AC binds to |
|---|---|---|
| AC-031 | Pending edit on tab/scope navigation away → discarded silently. The Hooks tab keeps a local `draft` state (`HooksTab.tsx:31`) that resets via `useEffect` on scope change (lines 36-39); switching the surface/rail-tab unmounts the component, throwing away `draft`. | discarded (no on-disk write at navigation time) |
| AC-032 | Concurrent saves → not gated. `saveSettings` has no in-flight guard; both promises fire; whichever resolves last wins on disk. | not-gated; both fire; on-disk reflects the second write's payload after both settle |
| AC-035 | Pending edit on tab switch + return → discarded; on return, `draft` re-initializes from disk. | discarded |
| AC-040 | Preset apply → adds the hook to in-memory draft; no on-disk write until Save. | open-editor branch (test arranges preset click → Save click → file read) |
| AC-022 | Lifecycle chip → single-select. Clicking sets `event` to the new id; rendering shows exactly one selected (`event === e.id ? railItemActive : railItem`). | single-select; clicking a chip removes the selection signal from the previously-selected chip |
| AC-017 | Selection signal → CSS class swap (existing `railItemActive` pattern). Migration renames to `chipSelected` for the cream-panel chips. | CSS class form; selected class name = `chipSelected` |

### 8.10 Globals — preserved in place (ADR D11)

- **`html, body, #root { overflow: hidden }` (tokens.css:105-112):** preserved in place under `=== CHROME TOKENS ===` band. Per-surface scrolling already handled (landing has its own scroll container; settings `.tabBody` declares `overflow-y: auto` at line 170). **AC-051 binds to outcome (a).**
- **Hooks-tab scroll (CTO concern #5):** existing `.tabBody overflow-y:auto` is the scroll container. No new global rule. **Architect adds an addendum to AC-054's per-phase check: mount the Hooks tab with a tall content fixture and confirm `scrollHeight > clientHeight` on `.tabBody`.** PM is asked to adopt this addendum in next consensus round (§11 sign-off below); pending adoption Architect carries it as a watch item in §10.
- **`:focus-visible` (tokens.css:151):** rule preserved as global; references `--accent-red` after the rename. Contrast verified: `--accent-red` against `--surface-cream` ≈ 6.36:1; against `--bg-base` ≈ 3.13:1. **AC-052 satisfied on both surfaces.**
- **`body { background: var(--bg-base); color: var(--text-primary); font-family: var(--font-sans); }`:** preserved. Body is the dark-chrome canvas; cream content panels override at the panel-root level (`.shell` declares `background: var(--surface-cream); color: var(--ink);` after Phase 4). **AC-053 binds:** chrome region's `background-color` resolves to `--bg-base`; content panel's `color` resolves to `--ink`.

### 8.11 Settings-panel semantic enumeration

**Save trigger (binds AC-030):** every tab with editable state has a Save button. Specifically: `HooksTab.tsx` Save button at lines 119-128. The Save button calls `saveSettings(scope, next)` which calls `window.agentcon.fs.writeText`. The test seam (§8.7) captures the write.

**File path resolution (binds AC-026, AC-030, AC-038, AC-039):** the settings-panel reads from the path returned by `window.agentcon.fs.getRoots()`, then `${roots.user}/settings.json` (user scope) or `${roots.project}/settings.json` (project) or `${roots.project}/settings.local.json` (local). The mock returns predictable test paths (`/tmp/test-user-claude/settings.json` etc.) so tests can pre-arm content under known paths.

**Add-matcher-group affordance (binds AC-037):** `HooksTab.tsx` "+ Add matcher group" button at lines 232-240. Test asserts a new `.itemRow` element appears.

**Delete affordance (binds AC-039):** the `×` icon button per group at `HooksTab.tsx:192-200`. Test asserts the group is removed from the in-memory draft, then after Save the on-disk `parsed.hooks[event]` no longer contains that matcher.

**Alert/error case enumeration (binds AC-028, AC-042, AC-043, AC-044):** the settings-panel has these alert/error surfaces:
1. **Init failure** (`ClaudeSettingsPanel.tsx:140` reads `initError` from store and shows `errorBanner`). Triggered when `init()` throws. Text: `"Could not load Claude Code config: ${initError}"`.
2. **Scope load failure** (same `errorBanner` pattern, sourced from `scopeData.error`). Text: `"Could not load Claude Code config: ${scopeData.error}"`.
3. **Save failure** (per-tab — `HooksTab.tsx:130` `<div className={styles.errorBanner}>{error}</div>`). Text: the error message string from the catch in `handleSave` (line 105-107).

Phase 0.5's `tests/baseline/settings-alerts-by-case.json` captures the exact rendered text for all three cases under known input arrangements. Phase 4/5 tests (AC-042) assert text equality against the captured baselines.

### 8.12 Mockup-issue resolutions — locked treatments

| Issue | Treatment | AC binding |
|---|---|---|
| Tab section titles too heavy (serif italic) | `font-family: var(--font-mono)` (JetBrains Mono); `font-style: normal`; `font-weight: 500`; `font-size: 14px` (`var(--text-md)`); `text-transform: uppercase`; `letter-spacing: 0.04em` | AC-015, AC-016 |
| Lifecycle chips lost selection | CSS-class swap `chip` ↔ `chipSelected`; default tokens `--chip-bg-default`/`--chip-border-default`/`--chip-text-default`; selected tokens `--chip-bg-selected`/`--chip-border-selected`/`--chip-text-selected`; single-select | AC-009, AC-017–AC-022 |
| Dashed empty-state border | `border-style: solid`; `border-width: 1.5px`; `border-color: #bfb59a` (`--empty-state-border-color`) | AC-023 (solid branch), AC-024, AC-025 |
| Dev-switch unreadable | New CSS-Module class `.devSwitch` in new file `src/App.module.css`; `background: var(--ink)`; `color: var(--surface-cream)`; `border: 1px solid var(--surface-cream)`; no inline hex | AC-010, AC-011, AC-012, AC-013 (disjunction-binding — see ADR D14), AC-014 |

### 8.13 Cross-phase regression strategy (CTO concern G)

Two test files, both live at the repo level under `tests/`:

- **`tests/landing-regression.test.tsx`** — asserts `tests/baseline/landing-computed-style.json` matches the rendered landing page. Runs every phase from Phase 2 onwards. Binds AC-045, AC-046.
- **`tests/settings-regression.test.tsx`** — exercises AC-026 through AC-044. Runs every phase from Phase 4 onwards (Phase 0.5 captures baselines; Phase 4 produces the migrated CSS; Phase 5 runs the full assertion suite). Binds AC-026 through AC-044.

Each phase's exit criteria includes "`npm run test:run` exits 0." This is the per-phase regression net.

### 8.14 Component structure

```
src/
  App.tsx                                          MODIFY — Phase 3 (use new App.module.css for dev-switch)
  App.module.css                                   NEW    — Phase 3 (.devSwitch class)
  styles/
    tokens.css                                     MODIFY — Phase 1 (add content tokens), Phase 2 (rename map applied),
                                                            Phase 3 (focus-visible re-points to --accent-red)
    tokens-landing.css                             DELETE — Phase 2
  panels/
    landing/                                       MODIFY — Phase 2 (every .module.css has --lp-* refs flipped;
                                                            LandingPage.tsx swaps .landing-root for new class)
    claude-settings/
      ClaudeSettingsPanel.module.css               MODIFY — Phase 4 (full content-token rewrite, --accent-primary
                                                            replaced, --border-panel-strong applied, chip/empty-state/
                                                            tab-title/alert treatments)
      ClaudeSettingsPanel.tsx                      MODIFY (minor) — Phase 4 (banner alert text wraps unchanged; any
                                                            inline style="..." consuming a renamed token gets the new name)
      HooksTab.tsx                                 MODIFY (minor) — Phase 4 (chip className swap + inline style token
                                                            renames; lifecycle-chip JSX swaps railItem/Active for chip/
                                                            chipSelected)
      ScopeSwitcher.tsx, AgentsTab.tsx, ...        MODIFY (minor) — Phase 4 (any inline style token-rename touch-ups)
tests/
  setup.ts                                         NEW — Phase 0
  example.test.tsx                                 NEW — Phase 0
  vitest.config.ts (project root)                  NEW — Phase 0
  mocks/
    agentconMock.ts                                NEW — Phase 0
    styleMock.ts                                   NEW — Phase 0 (fallback only; not required if Vitest CSS Modules works)
  baseline/
    landing-computed-style.json                    NEW — Phase 0.5
    settings-empty-state.json                      NEW — Phase 0.5
    settings-invalid-json-alert.txt                NEW — Phase 0.5
    settings-tab-switch-pending.json               NEW — Phase 0.5
    settings-alerts-by-case.json                   NEW — Phase 0.5
    capture.test.ts                                NEW (one-shot) — Phase 0.5; deleted/skipped in same phase after fixtures committed
  landing-regression.test.tsx                      NEW — Phase 2 (consumes Phase 0.5 baselines)
  settings-regression.test.tsx                     NEW — Phase 5 (consumes Phase 0.5 baselines + asserts AC-026–AC-044)
package.json                                       MODIFY — Phase 0 (add devDeps + test scripts)
```

---

## 9. Phases

Six phases (0, 0.5, 1, 2, 3, 4, 5) plus one final settings-regression phase. Every phase boundary leaves the codebase in a deployable state per AC-054.

---

### Phase 0: Test runner setup
**AC covered:** AC-047, AC-048, AC-049, AC-050.
**Files to touch (5):**
- `package.json` (modify — add devDependencies + `test` and `test:run` scripts).
- `vitest.config.ts` (new — at repo root).
- `tests/setup.ts` (new).
- `tests/mocks/agentconMock.ts` (new).
- `tests/example.test.tsx` (new — bootstrap test demonstrating `render()` + `getComputedStyle()` round-trip).

(Optional 6th file `tests/mocks/styleMock.ts` — Builder verifies whether Vitest's default CSS Modules support produces non-empty exports under jsdom; if yes, this file is not created. If the bootstrap test sees empty `styles` exports, this file is added as a config-time fallback.)

**Implementation notes:**

Reference files (read first):
- `src/global.d.ts:1-91` — the full `AgentConApi` interface that `agentconMock.ts` must shape-match.
- `src/stores/claudeConfigStore.ts:1-100` — the call shapes for `window.agentcon.fs.*` that the mock must implement (readText, writeText, getRoots, exists, watchStart, watchStop, onWatchEvent).
- `src/main.tsx` — the existing render entry point; `tests/example.test.tsx` mounts a similarly minimal component tree.
- ADR D4, D5, D7 — the load-bearing structural choices.

Patterns to follow:
- jsdom (NOT happy-dom). Reason: more reliable `getComputedStyle` + var() resolution.
- `vitest.config.ts` declares: `test.environment = "jsdom"`, `test.setupFiles = ["./tests/setup.ts"]`, `test.css.modules.classNameStrategy = "stable"`.
- `tests/setup.ts` imports `@testing-library/jest-dom` for matchers; calls `installAgentconMock()` in a `beforeEach`.
- `installAgentconMock(initialFs?)` returns a handle (the fake-fs Map) so tests can `set()` initial config and `get()` post-write content.
- Test command: `npm run test:run` (single-run, exits 0 with at least one passing test).

Anti-patterns:
- Do NOT install `identity-obj-proxy` unless the bootstrap test demonstrates Vitest's built-in CSS Modules don't work under jsdom.
- Do NOT mock `electron` directly — the renderer never sees the `electron` module at runtime; it sees `window.agentcon` via the preload bridge.
- Do NOT `vi.mock("../../stores/claudeConfigStore", ...)` — the store is in scope of test; the IPC bridge below it is what gets mocked.
- Do NOT add `@testing-library/dom` separately — `@testing-library/react` includes it.

**Completion criteria:**
- `npm install` succeeds.
- `npm run test:run` exits 0 with at least 1 passing test (the bootstrap).
- `package.json` contains `"test"` and `"test:run"` scripts; devDeps include `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`.
- `vitest.config.ts` declares `environment: "jsdom"`, setup file, CSS Modules config.
- The bootstrap test in `tests/example.test.tsx` calls `render()`, queries the DOM, and reads at least one computed-style property successfully.

**Mid-pipeline shippability:** YES. No source code changed. The app boots and renders identically to pre-Phase-0; new test infra is unused by production code.

---

### Phase 0.5: Pre-migration baseline capture
**AC covered:** AC-027, AC-028, AC-035, AC-042, AC-045 (all baseline-binding).
**Files to touch (5 new + 1 one-shot test):**
- `tests/baseline/landing-computed-style.json` (new — written by capture test).
- `tests/baseline/settings-empty-state.json` (new — written by capture test).
- `tests/baseline/settings-invalid-json-alert.txt` (new — written by capture test).
- `tests/baseline/settings-tab-switch-pending.json` (new — written by capture test).
- `tests/baseline/settings-alerts-by-case.json` (new — written by capture test).
- `tests/baseline/capture.test.ts` (new, one-shot — runs once, writes the five fixtures, then is deleted or `.skip`-marked in the same commit).

**Implementation notes:**

Reference files (read first):
- `src/panels/landing/LandingPage.tsx` and components (`Hero.tsx`, `TransmissionsFeed.tsx`, `OperativeCard.tsx`, etc.) — for the seven `data-testid`'d elements AC-045 enumerates.
- `src/panels/claude-settings/ClaudeSettingsPanel.tsx` and `HooksTab.tsx` — for the alert/error rendering paths.
- ADR D9 — the full capture mechanism.
- §8.11 above — the alert case enumeration (init failure, scope load failure, save failure — three cases).

Patterns to follow:
- `capture.test.ts` mounts the un-migrated landing page, calls `getComputedStyle()` on each AC-045 selector, serializes to a stable-keyed JSON shape (sort the keys, use a fixed property allowlist), `fs.writeFileSync` to `tests/baseline/landing-computed-style.json`.
- For settings cases, `installAgentconMock()` with various pre-arranged states: empty fs (missing-config case), fs with malformed JSON (invalid case), fs with valid config + simulated write failure (save-failure case for AC-042).
- For AC-027 (DOM logical structure), capture only element type + text content + role attributes via a recursive serializer; explicitly EXCLUDE `style`, `className`, and computed-style values.
- For AC-035 (pending-edit on tab switch), the captured behavior is what D10 documents: discarded. The fixture file records `{ "behavior": "discarded", "captured_at": "<phase-0.5>", "verified_against_code": "HooksTab.tsx draft useEffect" }`.

Anti-patterns:
- Do NOT mutate any `src/` source file in this phase. Phase 0.5 is read-only against `src/`.
- Do NOT capture computed styles for the dev-switch button — AC-045 explicitly excludes it.
- Do NOT leave `capture.test.ts` runnable in subsequent phases (it would re-overwrite the fixtures with post-rename values). Either delete the file or annotate the test with `.skip` in this same phase.
- Do NOT capture in JSDOM if `getComputedStyle` returns the empty string for a property — fail the phase loud, do not commit a hollow fixture. (jsdom is reliable here, but verify.)

**Completion criteria:**
- The five fixture files exist under `tests/baseline/` with non-empty content.
- `tests/baseline/landing-computed-style.json` contains all 7 elements × ≥3 properties.
- `capture.test.ts` is deleted or marked `.skip` (and the phase's review confirms this).
- `npm run test:run` exits 0 (the rest of the suite still passes).

**Mid-pipeline shippability:** YES. Phase 0.5 only writes test fixtures and adds a now-skipped test file; no `src/` code change.

---

### Phase 1: Introduce content tokens (additive only)
**AC covered:** AC-003 (banner labels present in tokens.css). Partially: AC-006, AC-007 (token defined; consumer assertion happens later).
**Files to touch (1):**
- `src/styles/tokens.css` (modify — add `=== CHROME TOKENS ===` and `=== CONTENT TOKENS ===` banners; add the new content tokens listed in §8.5; do NOT delete or rename anything).

**Implementation notes:**

Reference files (read first):
- `src/styles/tokens.css` — the existing chrome tokens are reorganized but not changed in value. Wrap them with `/* === CHROME TOKENS === */` ... `/* === CONTENT TOKENS === */`.
- `src/styles/tokens-landing.css` — the values to replicate verbatim (the `--lp-*` source-of-truth for cream/ink/accent-red etc).
- ADR D1, D6, D7, D8 — banner literals, name map, new token values, contrast-verified colors.

Patterns to follow:
- Banner literal strings: EXACTLY `/* === CHROME TOKENS === */` and `/* === CONTENT TOKENS === */`. Whitespace and exact `===` surrounds matter for AC-003.
- Add the new content tokens BELOW the chrome tokens, inside the same `:root` block.
- The font-face declarations from `tokens-landing.css` are NOT moved yet (they stay in `tokens-landing.css` for Phase 1 because the landing still imports that file). Phase 2 moves them.
- Keep BOTH `--accent-primary` (existing, referenced by settings) AND `--accent-red` (new, referenced by no consumer yet). Phase 2 will rename in landing; Phase 4 will replace in settings.

Anti-patterns:
- Do NOT delete `tokens-landing.css` in this phase. Landing still consumes it.
- Do NOT rename any existing chrome token value. This is purely additive.
- Do NOT create shim aliases like `--lp-accent-red: var(--accent-red);` — atomic strategy means no shims at any boundary (per D2). Add the new token; leave `--lp-*` alone in the landing file.

**Completion criteria:**
- `tokens.css` contains both banner strings, in order, exact-text.
- `tokens.css` contains every new token in §8.5 with correct values.
- `npm run dev` boots; landing page renders unchanged (still using `--lp-*`); settings panel renders unchanged.
- `npm run test:run` exits 0 (regression tests don't yet exist; bootstrap test still passes).
- `grep "=== CHROME TOKENS ===" src/styles/tokens.css` and `grep "=== CONTENT TOKENS ===" src/styles/tokens.css` each return exactly 1 line.

**Mid-pipeline shippability:** YES. Additive-only change; no consumer disruption.

---

### Phase 2: Atomic rename — landing flips to unified tokens
**AC covered:** AC-001, AC-002, AC-004, AC-045, AC-046, AC-055.
**Files to touch (≤12 — soft-cap deviation justified per D2 + §8.3):**
- `src/styles/tokens.css` (modify — move `@font-face` declarations from tokens-landing here).
- `src/styles/tokens-landing.css` (DELETE).
- `src/panels/landing/LandingPage.tsx` (modify — remove `import "../../styles/tokens-landing.css"`; swap `.landing-root` for a CSS-Module class in `LandingPage.module.css`).
- `src/panels/landing/LandingPage.module.css` (modify — declare new scroll-container class with `position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; background: var(--surface-cream);`; rename every `--lp-*` reference per D6 map).
- `src/panels/landing/components/HeaderBar.module.css` (modify — rename `--lp-*` refs).
- `src/panels/landing/components/StatusBar.module.css` (modify — rename).
- `src/panels/landing/components/ProjectSelector.module.css` (modify — rename).
- `src/panels/landing/components/Hero.module.css` (modify — rename; `--lp-text-base` → `--text-body-lg`; `--lp-text-xl` → `--text-display-xl`).
- `src/panels/landing/components/PersonnelFileCard.module.css` (modify — rename).
- `src/panels/landing/components/TransmissionsFeed.module.css` (modify — rename).
- `src/panels/landing/components/OperativeCard.module.css` (modify — rename).
- `src/panels/landing/components/Footer.module.css` (modify — rename).
- `tests/landing-regression.test.tsx` (NEW — asserts `tests/baseline/landing-computed-style.json` matches post-rename render of the landing page; binds AC-045, AC-046).

**Implementation notes:**

Reference files (read first):
- ADR D2, D6 — atomic-rename rationale and full token name map.
- `tests/baseline/landing-computed-style.json` (from Phase 0.5) — the regression target.
- `src/styles/tokens-landing.css` — the source-of-truth for every `--lp-*` definition (used as the find-list for rename).
- `src/panels/landing/LandingPage.tsx:14-15` — current import + scroll-container class assignment.

Patterns to follow:
- Apply the D6 rename map verbatim. Special cases: `--lp-text-md` → `--text-display-md` (NOT `--text-md`, which is settings's 14px), `--lp-text-lg` → `--text-display-lg`, `--lp-text-xl` → `--text-display-xl`, `--lp-text-base` → `--text-body-lg`, `--lp-leading-tight` → `--leading-display-tight`. The display tier is a distinct family from the chrome size scale.
- The new scroll-container class in `LandingPage.module.css` should be named `landingPage` or `pageRoot` — Builder picks; document the class name in the test file's comment so AC-045's selectors still resolve.
- `LandingPage.tsx` swaps `<div className="landing-root">` for `<div className={styles.landingPage}>` (or whatever class name is picked).
- The `@font-face` rules move from `tokens-landing.css` (which is being deleted) to `tokens.css` near the top, ABOVE the `:root` block. The relative `url(...)` references update from `../assets/fonts/...` to whatever path is correct from `src/styles/tokens.css` (which is the same `../assets/fonts/...` since tokens.css and tokens-landing.css live in the same directory — verify path resolution doesn't change).
- `tests/landing-regression.test.tsx` asserts the post-rename render's computed-style snapshot equals the Phase-0.5 fixture (deep equality). Run it in this phase's exit criteria.

Anti-patterns:
- Do NOT introduce shim aliases. Atomic.
- Do NOT leave any `--lp-*` reference. AC-001 will fail. Run `grep -rn "\-\-lp-" src/` as a self-check before declaring the phase complete.
- Do NOT change any computed visual property of the landing page — only token names rename. AC-045 is an equality assertion; any change in computed value fails the regression.
- Do NOT rename `--accent-primary` in this phase. That's Phase 4's job (settings-side).
- Do NOT delete or modify `--lp-*` definitions inside `tokens-landing.css` — delete the whole file in one step.

**Completion criteria:**
- `src/styles/tokens-landing.css` does not exist.
- `grep -rn "\-\-lp-" src/` returns zero matches.
- `grep -rn "\-\-lp-[a-z-]*: var(" src/` returns zero matches (no shim aliases).
- `grep -rn "tokens-landing" src/` returns zero matches (no stranded import).
- `npm run dev` boots; landing page renders visually identical to pre-Phase-2 (modulo no expected change — dev-switch is still inline-hex, that's Phase 3).
- `npm run test:run` exits 0; `tests/landing-regression.test.tsx` passes.
- **Phase delivered as a single commit (or squash-merged on integration) so the boundary is atomic per AC-054.** Mid-phase commits exposing a half-renamed tree (e.g. `tokens-landing.css` deleted before consumers are renamed) are not deployable. Tightened per CTO Round 2 acknowledgement (watching concern #3).

**Mid-pipeline shippability:** YES. Landing renders identically (regression-tested). Settings unchanged.

---

### Phase 3: Dev-switch button re-themed (App.tsx)
**AC covered:** AC-010, AC-011, AC-012, AC-013, AC-014. Globals: `:focus-visible` re-points to `--accent-red` here.
**Files to touch (3):**
- `src/App.tsx` (modify — replace inline `style={{...}}` with `className={styles.devSwitch}`; import `App.module.css`).
- `src/App.module.css` (NEW — `.devSwitch` class consuming tokens per ADR D14).
- `src/styles/tokens.css` (modify — `:focus-visible` outline-color flips from `var(--accent-primary)` to `var(--accent-red)`; the chrome-side `::selection { background: var(--accent-primary-bg) }` rule (tokens.css:144-148) **also flips here** to `var(--accent-red-bg)`. Both rules sit in the same `tokens.css:144-153` block and are flipped together in Phase 3 — no Builder discretion. Tightened per CTO Round 2 acknowledgement (watching concern #4).)

**Implementation notes:**

Reference files (read first):
- `src/App.tsx:38-47` — the existing inline-hex block.
- ADR D14 — the dev-switch contrast resolution and the AC-013 disjunction note.
- `src/styles/tokens.css:144-153` — `::selection` and `:focus-visible` rules.

Patterns to follow:
- New file `src/App.module.css` declares `.devSwitch` exactly per ADR D14: `background: var(--ink); color: var(--surface-cream); border: 1px solid var(--surface-cream);` plus position/size/font.
- `App.tsx` import: `import styles from "./App.module.css";`. Button JSX: `<button type="button" className={styles.devSwitch} onClick={...}>...`.
- `:focus-visible { outline: 2px solid var(--accent-red); outline-offset: 2px; }` after the rename.
- `::selection` rule uses `--accent-red-bg` after the rename if it currently uses `--accent-primary-bg`.

Anti-patterns:
- Do NOT keep ANY hex literal in `App.tsx`. AC-014 binds.
- Do NOT use `--accent-red` for the dev-switch border — the contrast resolution per D14 uses `--surface-cream` border on `--ink` background.
- Do NOT change the `import.meta.env.DEV` gate or the button's positioning/onClick semantics — visual change only.

**Completion criteria:**
- `App.tsx` has no inline `style` prop on the dev-switch button (or if `style` is retained for non-color properties, no hex literal).
- `npm run dev` shows the dev-switch button readable on both surfaces.
- `npm run test:run` exits 0; `tests/landing-regression.test.tsx` still passes (the dev-switch is excluded from AC-045's selector list).
- A new test (added to `tests/landing-regression.test.tsx` or a new file `tests/dev-switch.test.tsx`) asserts AC-010 through AC-014:
  - No hex literal in `App.tsx` source (read file via fs, regex check).
  - `getComputedStyle()` on the button resolves `background-color`, `color`, `border-color` to the tokens listed in ADR D14.
  - Contrast computations satisfy AC-011, AC-012, AC-013 (with AC-013 binding to the disjunction documented in D14 — Builder writes the test to assert (a) `bg vs surround ≥3:1` OR (b) `border vs surround ≥3:1`).

**Mid-pipeline shippability:** YES. App renders correctly on both surfaces. Settings still uses `--accent-primary` (renamed/replaced in Phase 4) but the global `:focus-visible` already references `--accent-red` — meaning settings-panel focus rings show in red after Phase 3, before the rest of the settings re-theme. This is acceptable: focus ring is a thin outline; the settings panel as a whole still works and saves correctly.

---

### Phase 4: Settings panel re-theme
**AC covered:** AC-005 (zero `--accent-primary` refs after this phase), AC-006, AC-007, AC-008, AC-009, AC-015, AC-016, AC-017, AC-018, AC-019, AC-020, AC-021, AC-022, AC-023, AC-024, AC-025, AC-043, AC-044, AC-053.
**Files to touch (≤5):**
- `src/panels/claude-settings/ClaudeSettingsPanel.module.css` (modify — full rewrite of color/border/typography rules under content tokens; tab-title typography per D12; `--border-panel-strong` applied to enumerated panels per AC-008; alert treatment per §8.11 + ADR D7; chip class names + treatment per D13; empty-state border per D8; ALL `--accent-primary*` refs replaced with `--accent-red*` siblings).
- `src/panels/claude-settings/HooksTab.tsx` (modify — lifecycle-chip JSX: replace `event === e.id ? styles.railItemActive : styles.railItem` with `event === e.id ? styles.chipSelected : styles.chip`; preserve all functional logic; touch any inline style props that reference renamed tokens; the empty-state container `.itemDescription` becomes a dedicated empty-state class wrapped with the new border treatment — Builder evaluates whether to add a new class `emptyState` distinct from `itemDescription`).
- `src/panels/claude-settings/ClaudeSettingsPanel.tsx` (modify — minor: any inline style references; verify `errorBanner` uses the new alert tokens via the CSS class).
- (Optionally) one of `AgentsTab.tsx`, `ScopeSwitcher.tsx`, `EnvTab.tsx` if it has inline style props referencing `--accent-primary` or `--text-muted` strings that reference tokens being renamed — Builder grep-checks during exploration.
- `tokens.css` (modify — DELETE `--accent-primary`, `--accent-primary-hover`, `--accent-primary-bg` definitions; the new `--accent-red`, `--accent-red-hover`, `--accent-red-bg` already exist from Phase 1 / Phase 3). After this edit, `grep -r "\-\-accent-primary" src/` returns zero matches.

**Implementation notes:**

Reference files (read first):
- `src/panels/claude-settings/ClaudeSettingsPanel.module.css` (entire file) — every rule needs token-rewrite pass.
- `src/panels/claude-settings/HooksTab.tsx:135-164` — the lifecycle event chip JSX and surrounding draft-state logic.
- ADR D6, D7, D8, D12, D13 — all locked treatments.
- `.claude/run-assets/settings-cream-mockup.png` — directional visual reference (NOT authoritative on the four flagged issues; ADR locks those resolutions).

Patterns to follow:
- The `.shell` panel-root: `background: var(--surface-cream); color: var(--ink); border: var(--border-panel-strong);` — this is the "panel" the user sees. Outer chrome (body) remains dark.
- Apply `--border-panel-strong` to: `.itemRow` (project-scope cards), `.shell` or its child as the main settings-tab content panel, `.formField`-grouped containers (form panels — verify by reading the existing CSS), preset cards (within HooksTab — Builder identifies the preset card class), the chip-group container (the wrapping div around the lifecycle event chips), `.errorBanner` (alert containers). For `.errorBanner`, AC-044 binds.
- Tab-title rule: `.tabTitle { font-family: var(--font-mono); font-style: normal; font-weight: 500; font-size: var(--text-md); text-transform: uppercase; letter-spacing: 0.04em; color: var(--ink); }` — explicitly NOT italic, NOT serif.
- Lifecycle chip CSS: new classes `.chip` (default) and `.chipSelected` (selected) declaring the six tokens per D13. The HooksTab JSX changes from `railItemActive`/`railItem` to `chipSelected`/`chip` for these specific elements.
- Empty-state container: `border-style: solid; border-width: 1.5px; border-color: var(--empty-state-border-color);`.
- Alert treatment: `.errorBanner { background: var(--alert-bg); color: var(--alert-text); border: var(--border-panel-strong); border-color: var(--alert-border); ... }`.
- Replace every `--accent-primary` reference inside `ClaudeSettingsPanel.module.css` with `--accent-red`; every `--accent-primary-hover` with `--accent-red-hover`; every `--accent-primary-bg` with `--accent-red-bg`. After this, `grep` returns zero.
- The `.button` primary action: `background: var(--accent-red); color: var(--surface-cream);` (cream text on red — readable contrast).

Anti-patterns:
- Do NOT change any settings-panel functional logic (load/edit/save flows). This is regression-shape work; behavior unchanged.
- Do NOT introduce a separate ChipGroup component. The change is JSX-className-level, in the existing HooksTab.
- Do NOT make the lifecycle-event chip multi-select. AC-022 binds to single-select per D10.
- Do NOT remove the existing `.railItem`/`.railItemActive` classes — they're still used by the rail (left-side tab navigation). Only the lifecycle-event chip JSX gets new classes.
- Do NOT auto-save on preset click. Pre-migration semantic per D10 binds AC-040 to the open-editor branch.
- Do NOT touch `claudeConfigStore.ts`. The migration does not change save/load wiring (CTO trigger gates depend on this).

**Completion criteria:**
- `grep -rn "\-\-accent-primary" src/` returns zero matches (AC-005).
- `npm run dev` shows the migrated settings panel rendered with cream content surfaces, dark text, `--border-panel-strong` borders, lifecycle chips with selection state, monospace tab titles.
- `npm run test:run` exits 0. The settings-regression tests don't yet run (Phase 5); landing regression continues to pass.
- Manual visual check: the Hooks tab matches the locked treatments (cream surface, ink text, mono titles, chip selection state visible, solid empty-state border).
- Phase 5's tests are NOT required to pass yet — they get added in Phase 5.
- **Phase delivered as a single commit (or squash-merged on integration) so the boundary is atomic per AC-054.** Mid-phase commits exposing new class names against old CSS (or vice versa, or `--accent-primary` deleted before consumers are rewritten) are not deployable. Tightened per CTO Round 2 acknowledgement (watching concern #3).

**Mid-pipeline shippability:** YES. App boots; both surfaces render; settings load/edit/save flows still work (untouched). No console errors on tab navigation.

---

### Phase 5: Settings regression tests + final verification
**AC covered:** AC-026, AC-027, AC-028, AC-029, AC-030, AC-031, AC-032, AC-033, AC-034, AC-035, AC-036, AC-037, AC-038, AC-039, AC-040, AC-041, AC-042, AC-051, AC-052, AC-054.
**Files to touch (≤4):**
- `tests/settings-regression.test.tsx` (NEW — exercises AC-026 through AC-044, consuming Phase 0.5 baselines for AC-027/AC-028/AC-035/AC-042; uses `installAgentconMock` for read/write capture; uses `@testing-library/user-event` for typing/clicking/tab-switching).
- `tests/dev-switch.test.tsx` (NEW or merged into existing — AC-010-AC-014 if not already in Phase 3's test file).
- `tests/globals.test.tsx` (NEW — AC-051 (overflow:hidden), AC-052 (focus-visible contrast), AC-053 (chrome-vs-content split), AC-054 (per-phase boundary check assertion)).
- (Optional) any small fix-up in `ClaudeSettingsPanel.module.css` if a regression test exposes a missed AC binding.

**Implementation notes:**

Reference files (read first):
- ADR D5 (IPC mock seam), D9 (baseline files), D10 (locked semantic branches), D11 (globals).
- `tests/baseline/*.json` — the Phase 0.5 fixtures.
- `tests/mocks/agentconMock.ts` — the seam.
- `src/panels/claude-settings/HooksTab.tsx`, `ClaudeSettingsPanel.tsx` — the surfaces under test.
- §8.11 (alert case enumeration).

Patterns to follow:
- `tests/settings-regression.test.tsx` is one file with a `describe` block per AC group:
  - "load config": AC-026 (write known value → mount → assert rendered field), AC-027 (empty fs → mount → assert DOM matches `settings-empty-state.json` baseline), AC-028 (invalid JSON → mount → assert alert text matches `settings-invalid-json-alert.txt` baseline).
  - "edit + save": AC-029 (typing echo), AC-030 (Save → assert fake-fs Map content), AC-031 (tab switch → assert no fake-fs write), AC-032 (concurrent saves → assert second-write payload appears post-settle).
  - "tab switch": AC-033, AC-034, AC-035 (assert pending-edit discarded on return — fixture verifies).
  - "Hooks": AC-036, AC-037, AC-038, AC-039.
  - "presets": AC-040, AC-041.
  - "alerts": AC-042, AC-043, AC-044.
- `tests/globals.test.tsx`: assertions on `document.documentElement`/`body`/`#root` `getComputedStyle().overflow`; focus-visible outline color computed for elements on cream and dark surfaces; chrome region and content panel `background-color`/`color` resolution.

Anti-patterns:
- Do NOT skip any AC because "the test is hard." If an AC binding can't be tested, raise to Architect — don't silently pass.
- Do NOT modify `tests/baseline/*` in this phase. Those are the regression target, not the regression's mutable subject.
- Do NOT mutate the IPC mock between tests without resetting in `beforeEach` — `tests/setup.ts` already does this; verify it is wired.
- Do NOT add tests that depend on real Electron IPC. The mock is the seam.

**Completion criteria:**
- `npm run test:run` exits 0. Every AC-026 through AC-044 + AC-051, AC-052, AC-053 has a passing assertion.
- `tests/landing-regression.test.tsx` continues to pass.
- AC-054 per-phase check confirms the codebase boots and both surfaces render correctly.
- `grep -rn "\-\-lp-" src/` returns zero matches (AC-001 final verification).
- `grep -rn "\-\-accent-primary" src/` returns zero matches (AC-005 final verification).
- `grep -rn "\-\-lp-[a-z-]*: var(" src/` returns zero matches (AC-055 final verification).

**Mid-pipeline shippability:** YES. End of run.

---

## 10. Risks + Alternatives Considered

### Alternatives considered

| Alternative | Why rejected |
|---|---|
| Split token files (`tokens-chrome.css` + `tokens-content.css`) | Adds an import-ordering trip wire; single file with comment banners gives equivalent observability with less risk. |
| Shim-then-remove rename pattern | Adds a transient phase whose value (smaller per-phase diffs) is outweighed by bookkeeping cost; atomic is reviewer-friendlier. |
| Defer settings-panel re-theme to a follow-on run | Architect's enumeration shows the work fits in Phase 4 (one CSS file dominates). Spinning out would inherit a half-finished migration. |
| happy-dom over jsdom | jsdom's `getComputedStyle` + var() resolution is more reliable; the migration's ACs depend on this. |
| Mock Electron IPC at the main-process boundary | Out of test scope; renderer-side `window.agentcon` factory mock is faithful by construction and simpler. |
| Manual hand-written baseline JSON for AC-045 | Error-prone (7 elements × ≥3 properties); test-driven capture is reproducible. |
| Keep `--accent-primary` as a renamed-but-distinct (e.g. for a future blue accent) | No consumer needs it under the new design language; debt for a non-existent use case. |
| Lift `overflow: hidden` off the global rule | ADR D3 pattern of scoped scroll containers already works; `.tabBody` and `.landing-root` handle their own scrolling. The global rule stays. |
| Dashed empty-state border with lighter color | Dashed at any readable weight competes visually with panel border + chip border. Solid + lighter is cleaner. |
| `--accent-red` for both content-panel borders AND dev-switch | Dev-switch sits over chrome — needs neutral chrome treatment, not the content-accent treatment. |
| Visual regression via Playwright/Percy | Out of scope; computed-style + token-equality discipline gives deterministic checks at lower cost. |
| Auto-reset `draft` on tab switch (intentional behavior change) | Migration is regression-shape, not behavior-change. Existing semantic (discard) binds. |
| Multi-select on lifecycle chips | Pre-migration is single-select (`HooksTab.tsx:140-163`); AC-022 binds to single. |
| Place CSS Modules mock at `__mocks__/styleMock.js` unconditionally | Vitest's built-in CSS Modules support works under jsdom in our test setup; the mock is a fallback only. |

### Risks + mitigation

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Phase 2 mass-rename misses a `--lp-*` reference (typo, dynamically-built name) | Medium | Low (visible breakage in one component) | AC-001 grep check is mandatory in Phase 2 exit criteria; QA repeats. |
| AC-013 dev-switch contrast disjunction fails PM's literal reading in next consensus round | Medium | Medium (Phase 3 design needs revisit) | Architect flags in §11 sign-off; Builder writes test to assert disjunction (a OR b); if PM narrows to (a), Architect provides alt design (brighter border or shadow-based separation). |
| Hooks-tab content overflows viewport and the `.tabBody overflow-y:auto` doesn't engage post-rewrite | Low | Medium (silent visual clipping) | Architect adds an assertion to AC-054 per-phase check (mount Hooks tab with tall fixture, assert `scrollHeight > clientHeight` on `.tabBody`); raises to PM in §11 sign-off for adoption. |
| `getComputedStyle` under jsdom returns empty strings for some CSS custom properties | Low | High (every visual AC fails) | Phase 0 bootstrap test demonstrates round-trip. If it fails, fall back to happy-dom or extract values from CSSOM directly. Detected before any baseline capture. |
| Settings-panel save flow goes through `window.agentcon.fs` which is undefined in jsdom by default | Certain | High if not mocked | `tests/setup.ts` `beforeEach` installs the mock — pre-arranged. |
| Phase 0.5 `capture.test.ts` left runnable in subsequent phases overwrites fixtures with post-rename values | Low | High (regression target shifts under us) | Phase 0.5 exit criteria: file is deleted or `.skip`-marked. Reviewer enforces. |
| Phase 4 file count exceeds 5 (5 files at the cap; possibly 6 with one .tsx touch-up) | Medium | Low (justified deviation if it happens) | Builder splits into 4a (CSS rewrite) and 4b (.tsx inline-style cleanup) if file count >5. Each sub-phase is independently shippable. |
| `--font-mono` collision changes settings-panel mono font from system to JetBrains Mono | Certain | Low (visible but accepted change per migration thesis) | Documented in ADR D6; no AC asserts pre-migration `font-family` on settings. |
| Phase 2 file count (≤12) exceeds soft cap | Certain | Low (justified — atomic rename is mechanical) | Documented in §8.3; ADR D2; reviewer informed; deviation explicit. |
| `--accent-primary` removal breaks an undocumented external CSS-in-JS consumer | Very Low | Medium | Architect grep-verified no consumer in `src/`; AC-005 enforces. |
| Test-runner suite slows feedback meaningfully | Low | Low | Phase 0 test count is small; vitest run is fast under jsdom. |
| The mockup's "weak visual hierarchy on the left rail" (CTO §Key factors §3, non-exhaustive) is left unaddressed | Low | Low | Out of this run's scope; non-exhaustive observation acknowledged; raised to user as a follow-on candidate if ADR D12 (mono treatment) doesn't visually carry the rail too. |
| `:focus-visible` color flip in Phase 3 makes the focus ring on the un-migrated settings panel temporarily red against dark chrome at the Phase 3 boundary | Certain | Low (intermediate Phase 3 state — settings still has CLI-dark surfaces but red focus ring; readable per AC-052 contrast check 3.13:1) | Documented; acceptable transient state because it satisfies AC-054 (panel still operable, no console errors) and the next phase (Phase 4) completes the settings re-theme. |

---



---

## 11. Consensus

### Round 1

**PM Sign-off Request — 2026-05-03**
Sections owned: 3-7
Security trigger candidate: **no** — migration touches no auth, no IPC, no new data, no new network surface. Aligned with CTO's call (§Trigger flags). Architect: please confirm at sign-off by walking the diff of any phase that touches `src/App.tsx`, `src/panels/claude-settings/`, or `src/styles/`.
Status: Awaiting CTO sign-off

**Named concerns for Architect to address in §8 / §9:**

1. **Token file structure (single file vs. split chrome/content).** AC-003 binds to comment-banded sections labeled "chrome" and "content" — but the exact filename(s) and the layer/import ordering are Architect's call. AC-002 explicitly accommodates either "tokens-landing.css does not exist" or "tokens-landing.css exists with zero `--lp-*` definitions and zero shims" — pick one and the AC binds.

2. **Rename strategy (atomic-in-one-phase vs. shim-then-remove).** AC-055 enforces the one-phase max shim lifespan. If Architect picks atomic, AC-055 is trivially satisfied. If Architect picks shim-then-remove, the shim must be removed in the next phase or the AC fails.

3. **Settings-panel scope (item 7 in or out).** Architect must enumerate `src/panels/claude-settings/` and decide. If out, AC-026 through AC-044 are pulled at sign-off and the `[Defer-candidate]`-tagged user stories are pulled with them. PM will not silently expand or trim — pull happens explicitly at PM's Mode 3 sign-off.

4. **Pre-migration semantic captures.** Several functional-regression ACs (AC-031 commit-vs-discard on tab switch; AC-032 concurrent saves; AC-035 pending-edit preservation; AC-042 alert text per case) bind to "pre-migration behavior, whichever it is." Architect must enumerate the pre-migration semantics in §8 so QA can write the binding against a fixed value, not a moving target. If the pre-migration code has undefined behavior in any of these flows, Architect picks the post-migration semantics and §8 documents the choice as intentional.

5. **Empty-state border treatment (solid vs. dashed-lighter).** AC-023 accommodates either; Architect picks one in §8 and the AC binds to the choice.

6. **Single-vs-multi-select semantics on lifecycle chips (AC-022).** Whichever the pre-migration behavior is — Architect documents and the AC binds.

7. **Landing-page baseline capture mechanism (AC-045).** Manually-recorded-and-committed values, OR a Vitest setup that captures pre/post in the same test run. Architect picks; the AC binds either way.

8. **Globals resolution (AC-051, AC-052).** `overflow: hidden` and `:focus-visible` either preserved or replaced. AC binds to runtime computed-style result; Architect picks the mechanism.

9. **`--accent-primary` retention or replacement (AC-005).** Pre-existing token in `tokens.css`. Either renamed/replaced (zero references remain) or retained with §8 reasoning. Either is acceptable; the AC needs a binding decision.

10. **Specific list of panels receiving `--border-panel-strong` (AC-008).** PM listed six panel categories. If any does not exist in the codebase, Architect removes it from the AC in §8 with reasoning. If additional panels are discovered, Architect adds them.

11. **Pre-migration text-content baselines for alerts (AC-028, AC-042).** Architect must enumerate the alert/error cases and capture each baseline text string in §8 (or commit as a fixture file). Without this, AC-028 and AC-042 are not testable.

12. **Test directory location and fixture conventions.** AC-049 / AC-050 / Data Lifecycle reference "the test directory Architect specifies." Pick the path in §8 (e.g. `tests/`, `src/__tests__/`, `*.test.ts` co-located).

---

**CTO Sign-off — 2026-05-03**
Section reviewed: PM sections 3-7 (PRD AC-001 through AC-055)
Round: 1
Status: **APPROVED with named concerns**

---

### AC Quality Check — walked all 55 ACs

I walked every AC against the bar: Given/When/Then form, no vague language, concrete observable outcome, explicit precondition, edge cases broken out, testable as written via Vitest/Testing Library/`getComputedStyle`/`fs.readFileSync`/grep with no human judgment and no mockup-image inspection.

**Pass (51 of 55):**
- AC-001 ✓ — concrete grep with exit code or test reading source files; binary observable.
- AC-002 ✓ — binary disjunction (file absent OR file present with grep-zero); both branches falsifiable.
- AC-003 ✓ — labeled-region presence test asserts on file content; named concern below about how QA detects "comment-banded section labeled to indicate."
- AC-004 ✓ — token-name-pattern assertion, no judgment.
- AC-005 ✓ — disjunction binds to whichever Architect picks; satisfies CTO concern §Architectural #7.
- AC-006 ✓ — width range, style equality, RGB-sum inequality — all numerical.
- AC-007 ✓ — WCAG ratio threshold, deterministic.
- AC-008 ✓ — equality on resolved token; panel list explicit; "if a panel doesn't exist, Architect removes it" preserves binding.
- AC-009 ✓ — disjunction with "AC binds to chosen token."
- AC-010 ✓ — no-inline-hex assertion via source read; token assignment locked in §8.
- AC-011, AC-012, AC-013 ✓ — numeric WCAG thresholds.
- AC-014 ✓ — source-read regex/grep on inline `style` prop.
- AC-015 ✓ — `font-family`/`font-style`/`font-weight`/`font-size` all locked to specific token-derived values; explicitly excludes CSS keywords without explicit mapping.
- AC-016 ✓ — empty result-set assertion via DOM query + computed-style filter; cleanly falsifiable.
- AC-017 ✓ — disjunction over a closed set of selection signals; one is locked in §8; presence/absence test.
- AC-018, AC-019 ✓ — three computed values bound to three tokens; required to be distinct.
- AC-020, AC-021 ✓ — WCAG ratio.
- AC-022 ✓ — Testing Library click + state transition assertion; multi-vs-single semantics is a binary §8 lock.
- AC-023 ✓ — `border-style: solid` (or alternative documented in §8).
- AC-024 ✓ — token + width value locked in §8.
- AC-025 ✓ — numeric contrast range.
- AC-026 ✓ — write known value to temp file, read DOM after mount, assert equality. Concrete.
- AC-027 ✓ — pre-migration baseline DOM snapshot as fixture; equality on logical content (element types, text, role attrs); CSS values explicitly excluded from the comparison. This is the right shape.
- AC-028 ✓ — text-content equality vs. recorded baseline. Falsifiable IF baselines are captured (§8 concern #11 below).
- AC-029 ✓ — typed input echoed character-for-character.
- AC-030 ✓ — `fs.readFileSync` on the actual config file post-Save; parsed value equals typed input. The right shape.
- AC-031 ✓ — disjunction over a closed set (commit | discard); §8 picks; AC binds.
- AC-032 ✓ — disjunction over closed set (queued | replaced | rejected); §8 picks.
- AC-033 ✓ — DOM presence/absence on data-testid + `aria-hidden`.
- AC-034 ✓ — error-boundary mock + zero-error assertion.
- AC-035 ✓ — disjunction; §8 picks; AC binds.
- AC-036 ✓ — write known hook group to temp config, mount, assert per-field text-content equality.
- AC-037 ✓ — DOM container-count delta after click.
- AC-038 ✓ — file-read assertion on edited matcher value.
- AC-039 ✓ — file-read assertion on group absence.
- AC-040 ✓ — file-read for at-least-one identifying field; disjunction for the open-editor case.
- AC-041 ✓ — partition assertion: same-label pills have identical 3 props; differing-label pills differ on at least one. Mathematical.
- AC-042 ✓ — text-content equality vs. recorded baselines per case. Same dependency as AC-028.
- AC-043 ✓ — three computed-style values + WCAG ratio.
- AC-044 ✓ — equality on resolved token width and color.
- AC-045 ✓ — captured `getComputedStyle()` baseline + post-equality on enumerated properties; modulo dev-switch explicitly carved out.
- AC-046 ✓ — covered by AC-001's grep, repeated as a phase gate.
- AC-047 ✓ — `npm test` (or equivalent) exits 0 with at least one passing bootstrap test.
- AC-048 ✓ — `package.json` script-block + devDeps presence assertion.
- AC-050 ✓ — subsequent phases run AC tests under same harness; check is "no per-phase test-config drift" — falsifiable by inspecting whether each phase's tests need their own config.
- AC-051 ✓ — runtime `getComputedStyle` on `documentElement`/`body`/`#root` resolves `overflow: hidden`. Mechanism is §8's call; outcome is locked.
- AC-052 ✓ — outline color + 3:1 contrast against the surface in question. Numerical.
- AC-053 ✓ — chrome-region `background-color` and content-panel `color` assertions on the chrome/content split.
- AC-054 ✓ — per-phase boundary gate: app renders, no console errors, both surfaces operable.
- AC-055 ✓ — grep for `--lp-*: var(--*)` shim pattern returns empty post-rename phase.

**Concerns within the pass set (not blocking, raised below as named concerns for Architect):**
- AC-003: "comment-banded section labeled to indicate 'chrome' / 'content'" — QA's test needs to know what string token to grep for. Suggest §8 commit to a literal string (e.g., the comment must contain the literal `CHROME` and `CONTENT` in upper or mixed case). Not blocking — Architect can lock at §8.
- AC-008: the panel list mentions "alert/error containers (inline error banners and toast/notification surfaces, if any exist)." If toasts don't exist in the codebase today, "if any exist" creates ambiguity — but the trailing bracket clause already says "Architect removes it from the AC in §8 with reasoning." Acceptable.
- AC-027 / AC-028 / AC-035 / AC-042: bind to "pre-migration baseline" — these are only failable if Architect captures the baselines as fixture files. PM has flagged this as concern #11 ("Pre-migration text-content baselines for alerts"). I'm restating it as a CTO-level gate below: **no Architect sign-off without the baselines committed or scheduled in a specific phase deliverable.**

**Soft pass with reservation (1 of 55):**

- **AC-049** — "JSDOM environment is configured (or equivalent — `happy-dom` is acceptable)" + "CSS Modules are mocked or compiled in a way that allows component tests to render" + "at least one example test exists demonstrating a `render()` + `getComputedStyle()` round-trip." The example-test clause is concrete and failable. The "CSS Modules are mocked or compiled in a way that allows component tests to render" clause is partially circular: it's failable in the sense that if CSS Modules don't render, the example test fails, so AC-049 fails transitively. I accept it. Recommend Architect tighten in §8 by naming the specific config (e.g., `vitest.config.ts` with `css: { modules: { classNameStrategy: ... } }` or an explicit `__mocks__/styleMock.js`) so the AC isn't "tests pass therefore CSS Modules are configured" — that's a tautology in failure mode.

**Borderline — flagged for §8 tightening, not blocking sign-off (3 of 55):**

- **AC-031, AC-032, AC-035, AC-040, AC-042**: each binds to "pre-migration behavior, whichever it is." The disjunction is fine *as a structure*; what makes them failable is Architect actually picking and committing the chosen branch in §8. If Architect leaves any of these as "TBD — investigate during phase," the AC degrades to "did the post-migration behavior match whatever the pre-migration behavior was, which we'll figure out at QA time." That's not testable. **Mandatory at Architect sign-off:** every "pre-migration behavior" disjunction must resolve to a named branch in §8. I will check this at Architect sign-off; if any are unresolved, I'll object there.

### AC quality issues (none blocking)

I find **zero ACs that fail the falsifiability bar as written.** No "looks right," no "matches mockup," no "feels cohesive." Every visual AC reduces to `getComputedStyle()` + token equality + WCAG ratio. Every functional AC reduces to a Testing Library interaction + DOM/file-content assertion. The serif-italic carveout (AC-016) is correctly written as an empty-result-set query, not as "no serif italic on titles." The dashed-border carveout (AC-023) correctly admits the alternative `dashed-with-lighter-color` resolution as a binary choice and binds the AC to whichever Architect picks.

This is materially stronger AC discipline than the landing-run baseline. PM applied the lessons from AC-018/AC-021/AC-027 of the prior PRD.

---

### SIMPLIFY-scope tagging — verified

CTO §SIMPLIFY items 1-6 are non-conditional. Item 7 (settings re-theme + functional regression) is conditional on Architect's enumeration. PM's tagging:

- **User stories §4:** four stories tagged `[Defer-candidate per CTO SIMPLIFY conditional]` (lines 53, 55, 57, 59). Tagging is consistent. ✓
- **Acceptance criteria §5:** the conditional ACs are AC-026 through AC-044 (functional regression + chip-state + alerts) plus AC-009 (chip default-state border, which is settings-specific) plus AC-015/AC-016 (tab-titles, settings-specific) plus AC-018/AC-019/AC-020/AC-021/AC-022 (chip selection, settings-specific) plus AC-023/AC-024/AC-025 (empty-state, Hooks-tab specific). PM did **not** apply the `[Defer-candidate]` tag at the AC level — only at the user-story level. **Planning bug, low-severity:** when Architect decides item 7 is out, AC-026 through AC-044 must come out, and AC-015/AC-016/AC-018-AC-022/AC-023-AC-025 must also come out (they all bind to the settings panel). Without a per-AC tag, Architect risks pulling only AC-026-AC-044 and leaving the chip/title/empty-state ACs orphaned (they target settings surfaces that won't be migrated).

  **Resolution requested at Architect sign-off (not at PM round 2):** Architect's §6 scope-trim block must explicitly enumerate which ACs come out if item 7 defers. Concretely: list AC-009, AC-015–AC-016, AC-018–AC-025, AC-026–AC-044 as the full conditional set. PM's §6 already says "AC-026 through AC-044 are removed" but doesn't include AC-009, AC-015-016, AC-018-025. This is the only structural gap I'm flagging in the SIMPLIFY tagging.

- **§6 scope block:** correctly bifurcated into "non-negotiable" and "conditional"; correctly references item 7's defer trigger ("If Architect's enumeration of `src/panels/claude-settings/` shows the surface cannot fit alongside the foundation work in one coherent phase plan, item 7 is **deferred to a follow-on run**"). Phase-0 test runner correctly carves out as ship-regardless. ✓

**On the question of 55 ACs being right-sized for SIMPLIFY:** yes. The conditional set is ~26 ACs (AC-009, AC-015-016, AC-018-025, AC-026-044). The non-conditional core is ~29 ACs. If item 7 defers, the gate runs on ~29 ACs — still rich for a foundation migration. If item 7 ships, the gate runs on 55 — appropriate for a wide-blast-radius migration with regression risk. The structure is fine; the missing piece is per-AC tagging on the conditional set.

---

### Four mockup-issue resolutions — locked, not directional

- **Tab titles → mono not serif italic.** AC-015 locks `font-family = --font-mono`, `font-style = normal`, `font-weight = locked-in-§8`, `font-size = locked-in-§8`. AC-016 codifies the rule with an empty-result-set assertion. **Locked.** ✓
- **Lifecycle chips → 4-form selection signal + selected/unselected token bindings.** AC-017 closes the selection-signal choice to four named forms; Architect picks one and AC binds. AC-018/AC-019 lock the three computed values to three named tokens for selected/unselected. AC-020/AC-021 enforce 4.5:1 contrast in both states. AC-022 locks single-vs-multi as a §8 binary. **Locked.** ✓
- **Empty-state border.** AC-023 locks `solid` as default OR `dashed` as alternative with §8 documentation. AC-024 locks the token name + width. AC-025 locks the contrast range (1.5:1–3.0:1 inclusive). Architect picks the shape from a constrained set, not freely. **Locked.** ✓
- **Dev-switch.** AC-010 locks "no inline hex literals — replacing the current hardcoded `#1a1c19` / `#d8d2bf` / `#4a4742` from `App.tsx` lines 38-47." AC-011/AC-012/AC-013 lock contrast ratios on landing AND settings backgrounds. AC-014 locks the source-read assertion. **Locked.** ✓

I verified the file references — `src/App.tsx:38-47` is the inline hex block today, exactly as PM cited. Evidence-based AC.

**No "Architect picks freely" without binding constraints found.** Every choice in the AC structure is either a binary or a closed enumeration with the AC bound to whichever Architect picks. This is the right discipline.

---

### Six AC pre-warnings from CTO verdict — applied

1. **Functional regression ACs per settings flow.** AC-026 (load happy), AC-027 (load missing), AC-028 (load invalid), AC-029 (edit), AC-030 (save-to-disk via `fs.readFileSync`), AC-031 (pending-edit on tab-switch), AC-032 (concurrent saves), AC-033 (tab-switch render), AC-034 (no console errors across tabs), AC-035 (pending-edit preserved/discarded), AC-036 (Hooks group render from disk), AC-037 (Hooks add), AC-038 (Hooks edit-and-persist), AC-039 (Hooks remove-and-persist), AC-040 (preset apply), AC-041 (preset status pill), AC-042 (alert text), AC-043 (alert visual), AC-044 (alert border). **All four CTO-named flows covered.** ✓

2. **Visual ACs with falsifiability standard.** Every visual AC reduces to `getComputedStyle()` + named token + numerical comparison. No "matches mockup" survived. ✓

3. **Token cleanliness AC (`grep -r "\-\-lp-" src/`).** AC-001. Repeated as AC-046 (landing-page-specific gate) and as AC-055 (shim-discipline gate). ✓

4. **Border-token enumeration AC for `--border-panel-strong`.** AC-008 enumerates six panel categories (project-scope cards, settings-tab content panel, form panels, preset cards, lifecycle-chip group containers, alert/error containers); AC-006 + AC-007 lock the token's properties. ✓

5. **Four mockup-issue resolution ACs.** Verified above. ✓

6. **Dev-switch contrast AC with token + computed value.** AC-010 (token assignment), AC-011 (color/bg ratio ≥4.5:1), AC-012 (bg/landing-surround ratio ≥3.0:1), AC-013 (settings surface counterpart), AC-014 (no inline hex). ✓

**All six pre-warnings applied; none weakly applied.**

---

### Functional regression flow coverage — mapped

- **Load** (config from disk):
  - Happy: AC-026 (write known value, read DOM)
  - Missing: AC-027 (DOM matches pre-migration baseline)
  - Invalid: AC-028 (alert text equals baseline)
  - **Coverage: complete.** ✓

- **Edit + Save:**
  - Basic edit: AC-029 (typed-input echoed)
  - Save-to-disk: AC-030 (`fs.readFileSync` + parse, equality on typed value)
  - Pending-edit-on-navigation: AC-031 (commit | discard, §8 binds)
  - Concurrent saves: AC-032 (queued | replaced | rejected, §8 binds)
  - **Coverage: complete IF Architect resolves AC-031/AC-032 disjunctions in §8.** Watching at Architect sign-off.

- **Tab switching:**
  - Each tab renders: AC-033 (presence + absence)
  - No console errors: AC-034 (error-boundary mock)
  - Pending-edit on tab change: AC-035 (preserved | discarded, §8 binds)
  - **Coverage: complete IF Architect resolves AC-035 disjunction in §8.** Watching at Architect sign-off.

- **Hooks / presets / alerts:**
  - Hooks render-from-disk: AC-036 (per-field text-content equality)
  - Hooks add: AC-037 (container-count delta)
  - Hooks edit-and-persist: AC-038 (file-read on matcher)
  - Hooks remove-and-persist: AC-039 (file-read on group absence)
  - Preset apply: AC-040 (file-read on preset's identifying field)
  - Preset status pill: AC-041 (partition assertion)
  - Alert text: AC-042 (text-content equality vs. baseline)
  - Alert visual: AC-043 (computed-style + WCAG)
  - Alert border: AC-044 (resolved-token equality)
  - **Coverage: complete IF Architect captures alert-text baselines per case.** Watching at Architect sign-off.

**Vitest + Testing Library testability check:**
- AC-026, AC-029, AC-033, AC-034, AC-036, AC-037, AC-040, AC-041, AC-043 — pure DOM render + interaction assertions. JSDOM-tractable. ✓
- AC-030, AC-038, AC-039 — `fs.readFileSync` after Save action. **Question:** does the settings-panel save-flow go through Electron IPC to the main process, or does the renderer write to disk directly (or via a mocked path)? If the save-flow is IPC-mediated, JSDOM cannot exercise the actual file-write — Architect must either (a) configure a test seam where the IPC layer is mocked and the test asserts on the IPC payload + a separate fake-fs verification, or (b) declare the settings store is renderer-side and writes directly.

  **This is the single biggest planning concern I have.** If it turns out at Builder time that JSDOM cannot drive the save-flow because the IPC layer is required, AC-030/AC-038/AC-039 become un-testable as written, and "AC-049 the Phase-0 harness" silently fails to deliver the regression net. **Architect must address in §8 explicitly: how does the test runner exercise Save?** If the answer is "mock the IPC handler and assert payload equivalence + assert fake-fs receives the write," that needs to be locked in §8 and the relevant ACs re-bound to the IPC-payload assertion (the AC text "the on-disk Claude Code configuration file contains the edited value" is too tight if IPC mediates and the test mocks the IPC).

  This is a planning concern, not an objection. The AC are correctly structured today; the harness's ability to satisfy them is the open question.

- AC-027, AC-028, AC-035, AC-042 — "pre-migration baseline." Concrete IF Architect captures the baselines. Per CTO concern #11 in PM's list — must be a §8 deliverable, not "captured during Builder." Architect: schedule the baseline capture as a Phase 0 deliverable (or a pre-Phase-1 deliverable scheduled before the rename phase touches anything user-visible).

---

### Migration-specific risks beyond AC coverage

- **Mid-pipeline shippable state.** AC-054 explicitly per-phase ("This AC is checked at every phase boundary — it is a per-phase gate, not a one-time end-of-run gate"). AC-055 enforces the no-stranded-shim discipline. Adequate. The actual phase decomposition is Architect's job and I'll evaluate at §9.

- **No-shim discipline AC (AC-055).** Concrete: "shim aliases of the form `--lp-*: var(--*)`" + "no shim survives past the phase that introduces the rename." Enforceable via `grep -rn '\-\-lp-[a-z-]*: var(' src/` returning empty post-rename-phase. **Falsifiable.** ✓

- **ADR D2 reversal AC.** AC-002 binds to a binary outcome (file absent OR file present with grep-zero); AC-003 binds to comment-banded sections; AC-046 calls out the landing-page-specific gate; AC-001 the global gate. The post-migration file-system shape is locked to one of two possibilities, with §8 picking. Adequate. ✓

- **Globals preservation:** `tokens.css:105-112` overflow rule — AC-051 (preserve OR replace, runtime `overflow: hidden` resolution). `tokens.css:151` `:focus-visible` — AC-052 (3:1 outline-vs-surface contrast on both surfaces). Both correctly bind to runtime computed-style outcomes, not to mechanism. ✓

  **One gap I want to flag:** AC-051 covers `overflow: hidden`; the CTO verdict §Architectural #8 also asked whether any cream-themed settings surface needs to scroll (Hooks tab is taller than viewport). PM did not write a scroll-container AC. If item 7 ships and Hooks tab content overflows, the AC suite passes (overflow is `hidden` on `html`/`body`/`#root` per AC-051) but the user can't scroll to see the hidden content. **Planning bug, medium-severity:** add an AC of the form "Given the Hooks tab is rendered with content taller than the viewport, when the tab's scrollable region is inspected, then the user can scroll to reach the bottom-most rendered row (test asserts `scrollHeight > clientHeight` on a specific container OR the page scrolls)." If Architect's enumeration confirms the Hooks-tab content is always shorter than the viewport, the AC is trivially satisfied; if it's taller, the AC catches the regression. **Resolution requested at PM round 2 OR at Architect sign-off** — Architect can add it via §8 if PM is locked.

---

### Concerns I'm watching at Architect sign-off

1. **JSDOM-vs-IPC for Save flow.** AC-030/AC-038/AC-039 are unfailable if the test harness can't drive the actual file write or a faithful equivalent. Architect must specify the seam in §8.

2. **Pre-migration baseline capture as a Phase-0 deliverable.** AC-027/AC-028/AC-035/AC-042 require fixture files. Without these scheduled as a concrete deliverable in §9 (committed to the run's artifacts before any rename phase touches the settings panel), those four ACs degrade to advisory.

3. **Per-AC `[Defer-candidate]` tagging on the full conditional set.** PM tagged at the user-story level only; the conditional AC set is wider than AC-026-AC-044 (it also includes AC-009, AC-015-016, AC-018-025). Architect's §6 scope-trim block (or my final-lock pass) must enumerate the full conditional set explicitly.

4. **Pre-migration semantic captures (the "whichever it is" disjunctions).** AC-031, AC-032, AC-035, AC-040 all bind to a §8 branch decision. Every disjunction must resolve to a named branch — no "TBD — Builder investigates" punts.

5. **Hooks-tab scroll AC is missing.** Add at §8 if the Hooks tab is taller than the viewport. Otherwise document why omitted.

6. **AC-003 label-string literals.** Specify what literal substring(s) the comment banners must contain so the test can grep deterministically.

7. **AC-049 CSS-Modules-config tightening.** Avoid the "tests pass therefore CSS Modules are configured" tautology by naming the config file or mock path.

### Scope confirmation

Aligns with my SIMPLIFY verdict. PM did **not** silently expand scope. PM did **not** silently trim scope. The conditional bifurcation is correctly preserved. The Phase-0 test runner is correctly framed as ship-regardless. The four mockup-issue resolutions are locked, not directional. Globals are explicitly addressed. The `--accent-primary` retention question is bound to an AC (AC-005) that admits either resolution.

The only structural gap is per-AC `[Defer-candidate]` tagging on the conditional set, which I'm passing to Architect rather than sending PM back. Two reasons: (a) Architect's §6 scope-trim block is the natural place to enumerate the trimmed AC list anyway, and (b) sending PM back over a tagging convention burns a revision round on a bookkeeping fix when the substance is correct.

### Verdict

**APPROVED. Pipeline advances to Architect.** Architect must address the seven concerns above in §8/§9 and at sign-off. None are blocking PM's hand-off; all are blocking Architect's hand-off.

---

**Architect Sign-off Request — 2026-05-03**
**Sections owned:** 8, 9, 10
**ADR:** `docs/pipeline/2026-05-05/design-migration-cream-panels/ADR.md` (16 numbered decisions D1–D16)
**Status:** Awaiting CTO and PM sign-off

**Trigger calls (architect confirming):**

- **Security trigger: OFF.** Confirmed by walking the phase plan. Phase 0 introduces a renderer-side mock of `window.agentcon` for tests — does not modify production IPC schema, preload script, or main-process code. Phase 4 touches `src/panels/claude-settings/` CSS but does not touch `claudeConfigStore.ts`, `services/claude-config-parser`, or any IPC handler. Phase 3 touches `App.tsx` for visual treatment only — `import.meta.env.DEV` gate and surface-switcher logic unchanged. No new persisted data; no new network surface; no auth code; no payment code. **Reasoning: confirmed CTO call.**

- **Performance trigger: OFF, with named upper bounds.** Token consolidation does not change render path; the new `--border-panel-strong` adds 1.5px borders to ~6-8 panel categories (paint cost is unmeasurable at the data densities this app shows in an Electron renderer). The new content tokens add ~25 lines to `tokens.css`. **Committed upper bounds:**
  1. Bundle CSS size after consolidation must not exceed `1.3x` the pre-migration sum of `tokens.css` (≈4.5KB) + `tokens-landing.css` (≈3KB) — i.e. ≤ ~9.8KB. (Realistic delta: net reduction, since `tokens-landing.css` is deleted and only ~25 lines are added to `tokens.css`.)
  2. Phase 4's `ClaudeSettingsPanel.module.css` must not grow more than `1.5x` its pre-migration line count (≈481 lines pre; ≤720 lines post). Realistic delta: minimal — most rules are token-name swaps; new rules are ~30-50 lines for chip/empty-state/alert treatments.
  3. ~~`npm run dev` cold-start time must not regress measurably~~ — **WITHDRAWN per CTO Round 2 acknowledgement (2026-05-05); see §11 Architect Acknowledgement (Round 2).** The bound was unenforceable as written (Vitest doesn't measure cold-start; no measurement path was specified) and the realistic cold-start delta from a CSS-token migration with no JS surface changes is ~0. The two measurable bounds above (CSS bundle size, settings CSS line count) carry the perf-OFF commitment.

  If Builder observes either of the two remaining bounds tripped during execution, escalate immediately rather than silently shipping a regression. No additional gates are added; the trigger stays OFF.

**Architect's resolution map for the seven CTO Round 1 concerns** (one-line each, with location):

1. **JSDOM-vs-IPC for Save flow** → resolved in §8.7 + ADR D5. Test seam at `tests/mocks/agentconMock.ts`; `installAgentconMock()` factory; install via `globalThis.window.agentcon` in `tests/setup.ts` `beforeEach`. AC-030/AC-038/AC-039 bind to the in-memory fake-fs Map.

2. **Pre-migration baseline capture** → resolved in §8.8 + ADR D9. **Phase 0.5** captures five fixture files via one-shot `tests/baseline/capture.test.ts`; deliverables enumerated in §9 Phase 0.5 block.

3. **Per-AC `[Defer-candidate]` tagging** → resolved in §8.1 + ADR D3. Settings re-theme stays IN scope. Conditional matrix recorded in ADR D3 for the record (AC-009, AC-015–AC-016, AC-018–AC-025, AC-026–AC-044 = 26 ACs); CTO Round 1's enumeration is correct and binds.

4. **"Whichever pre-migration behavior" disjunctions** → resolved in §8.9 + ADR D10. AC-031 = discarded, AC-032 = not-gated/last-write-wins, AC-035 = discarded, AC-040 = open-editor (preset adds to draft only; Save commits), AC-022 = single-select, AC-017 = CSS class swap with `chipSelected`. Every disjunction has a named branch.

5. **Hooks-tab scroll** → resolved in §8.10 + ADR D11 + risks table. Existing `.tabBody overflow-y:auto` already handles it; Architect adds an addendum to AC-054's per-phase check (mount tall fixture, assert `scrollHeight > clientHeight`). PM is asked in next consensus round to adopt the addendum.

6. **AC-003 comment-banded label literals** → resolved in §8.2 + ADR D1. EXACT literal strings: `/* === CHROME TOKENS === */` and `/* === CONTENT TOKENS === */`. AC-003's test asserts both substrings appear in tokens.css in that order.

7. **AC-049 CSS-Modules tautology** → resolved in §8.6 + ADR D4. `vitest.config.ts` declares `test.css.modules.classNameStrategy: "stable"`; Vite's built-in CSS Modules support flows through Vitest. `tests/mocks/styleMock.ts` is an explicit fallback only if the bootstrap test demonstrates broken pass-through. No `identity-obj-proxy`. AC-049 binding tightened: the test asserts that `import styles from "*.module.css"` produces a non-empty exports object AND that `getComputedStyle()` returns non-empty values for at least one custom property.

**Concerns I'm Watching During Execution:**

1. **AC-013 dev-switch contrast literal vs. disjunction (ADR D14).** PM's AC-013 text reads literally on `background-color` contrast against surround. Architect's chosen treatment (background `--ink`, border `--surface-cream`) satisfies a disjunction (background OR border contrasts ≥3:1). Builder writes the test to assert the disjunction; **PM is asked to adopt the disjunction language in next consensus round.** If PM narrows to literal-`background-color`-only, the dev-switch design needs revisiting (likely brighter border + shadow). Reviewer: scrutinize the AC-013 test's binding language.

2. **Phase 2 file count exceeds the ≤5 soft cap (≤12 files).** Justified per ADR D2 + §8.3 — the rename is mechanical and splitting it leaves the codebase non-functional at the boundary. Reviewer: verify the diff is genuinely find/replace + no logic edits; if any logic change appears in Phase 2, reject.

3. **Phase 0.5 capture test must not survive past Phase 0.5.** If `capture.test.ts` is left runnable in Phase 1+, every subsequent phase overwrites the baseline fixtures with post-rename values, hollowing out the regression net (AC-045 etc. become tautologies). Reviewer: verify Phase 0.5 commit deletes or `.skip`-marks `capture.test.ts`; QA: assert via `git log` that the Phase 1 commit does not modify the baseline files.

4. **`getComputedStyle()` reliability under jsdom for `var()`-resolved values.** Phase 0 bootstrap test must demonstrate the round-trip works. If it doesn't, every visual AC in this run becomes un-testable as written. Builder: do not advance past Phase 0 until the bootstrap test passes with a non-empty resolved value for at least one CSS custom property.

5. **The `--font-mono` collision changes settings-panel typography visibly.** Settings panel body monospace flips from system stack to JetBrains Mono. This is acceptable per the migration thesis but **the change is not itself locked in any AC** — there is no AC asserting "settings panel uses JetBrains Mono after migration." If a reviewer or QA subjectively reads the post-migration settings as "looks weird," there is no AC to point at. Architect's recommendation: document in the run's verdict file that the font change was intentional and accepted.

6. **`:focus-visible` flips to `--accent-red` at the Phase 3 boundary, before the rest of the settings re-theme lands in Phase 4.** This means at the Phase 3 → Phase 4 boundary, the un-migrated CLI-dark settings panel has red focus rings. Per AC-052 contrast checks (3.13:1 against `--bg-base`), this is readable. Per AC-054, the panel is operable. Reviewer: confirm this transient state at the Phase 3 boundary is acceptable; if PM objects to red focus on dark chrome, Phase 3 and Phase 4 may need to merge (file count would still be ≤8).

7. **`--accent-primary` removal in Phase 4 is permanent — no consumer outside `src/panels/claude-settings/` and `src/styles/tokens.css` and `App.tsx`.** Architect grep-verified. Builder: re-run the grep at Phase 4 exit; if any consumer is found that wasn't anticipated, escalate, do not silently leave a stranded reference.

---

**CTO Sign-off — 2026-05-03 (Round 2)**
Section reviewed: Architect §8 + §9 + §10 + standalone ADR (D1–D16)
Round: 2
Status: **APPROVED with named concerns, conditional on two correctness fixes**

I walked all 7 of my Round 1 concerns against the actual cited PRD sections, ADR decisions, and source files. Six are resolved with concrete content. One has a counting error that must be corrected before Builder runs, and the perf-trigger commitments have a measurability gap I'm calling out.

---

### Round 1 concerns — resolution check

**Concern 1 (IPC mock seam) — RESOLVED.** §8.7 + ADR D5 specify `tests/mocks/agentconMock.ts` exporting `installAgentconMock(initialFs?)` installed via `globalThis.window.agentcon` in `tests/setup.ts` `beforeEach`. I cross-checked the actual call sites: `src/stores/claudeConfigStore.ts:161-163` (`watchStop`), `:163` (`getRoots`), `:209` (`getRoots`), `:226` (`onWatchEvent`), `:229` (`watchStart`), `:273, 290, 307, 322, 331` (`readText`), `:285, 301, 318` (`readDir`), `:363, 385` (`writeText`), `:403, 422, 440, 461, 478, 497, 521` (more writes/deletes). Every one of these calls `window.agentcon.fs.*` directly — the mock seam at the global window object is faithful by construction. Settings panel also uses `window.agentcon.settings.*` (`ClaudeSettingsPanel.tsx:72, 118-119, 124-125`) and `window.agentcon.dialog.*` (`:113-116`) and `window.agentcon.claude.seedAgents` (`AgentsTab.tsx:30`); ADR D5 explicitly covers all three (§8.7 names the `settings` and `dialog` and `claude` shapes). **Builder can implement the mock from the spec without inventing structure.** ✓

**Concern 2 (baseline capture) — RESOLVED.** §8.8 + ADR D9 + §9 Phase 0.5 block enumerate 5 named fixture files (`landing-computed-style.json`, `settings-empty-state.json`, `settings-invalid-json-alert.txt`, `settings-tab-switch-pending.json`, `settings-alerts-by-case.json`) tied to AC-027/AC-028/AC-035/AC-042/AC-045 respectively, written by a one-shot `tests/baseline/capture.test.ts` that is deleted/`.skip`-marked in the same Phase 0.5 commit. Phase 0.5 sits explicitly between Phase 0 and Phase 1 with the rationale "if Phase 0.5 ran after any token rename, AC-045 baseline would already be post-rename." Phase 0.5 has its own §9 entry with Files-To-Touch (5 + one-shot test), Implementation Notes, Anti-Patterns, Completion Criteria, and Mid-Pipeline Shippability assertion. ✓

**Concern 3 (per-AC defer tagging) — RESOLVED IN STRUCTURE, BUT WITH A COUNTING ERROR (BLOCKING — must fix).** ADR D3 and PRD §8.1 enumerate the canonical conditional matrix as "AC-009, AC-015–AC-016, AC-018–AC-025, AC-026–AC-044." ADR D3 then adds: *"Total conditional set: AC-009, AC-015–AC-016, AC-018–AC-025, AC-026–AC-044 = **26 ACs**. CTO Round 1's enumeration is correct as written and binds."*

**The arithmetic is wrong.** Walk it: AC-009 = 1; AC-015–AC-016 = 2; AC-018–AC-025 = 8 (18, 19, 20, 21, 22, 23, 24, 25); AC-026–AC-044 = 19 (26 through 44 inclusive, count = 44 − 26 + 1 = 19). Sum: **1 + 2 + 8 + 19 = 30 ACs, not 26.**

Architect's "26 ACs" figure is wrong by 4. The matrix's AC enumeration itself is correct (the right set of ACs is named); only the count tally is off. This is not a substantive disagreement between PM and Architect — both name the same AC ranges — but a published count that is provably wrong by elementary arithmetic is a planning bug the trio cannot ship. If Architect's matrix is invoked (e.g. a future revision pulls item 7), Builder/QA will count themselves and reach 30, then second-guess what they're being asked to remove. **Resolution required: Architect updates ADR D3 and PRD §8.1 to read "30 ACs" (the count) without changing the enumeration. No semantic change. If Architect actually intended a different enumeration (e.g. excluded a chip-state AC), say which, but the AC list as written sums to 30.**

This is non-blocking for Builder if item 7 stays IN (which §8.1 confirms it does). It is blocking for any trim. Fix it now while it's cheap.

**Concern 4 (disjunction resolutions) — RESOLVED.** §8.9 + ADR D10 lock all six disjunctions against named branches verified against existing code:
- AC-031 = discarded. Verified: `HooksTab.tsx:36-39` `useEffect` resets `draft` from `data.settings?.hooks ?? {}` on `[scope, data.settings]` change — pending edits never persist on tab/scope navigation. ✓
- AC-032 = not-gated/last-write-wins. Verified: `claudeConfigStore.ts:357-372` `saveSettings` is a plain async function with no in-flight guard; the Save button's `disabled={!dirty}` flips when the store updates, so a fast double-click fires two `writeText`s. ✓
- AC-035 = discarded. Same `useEffect` mechanism as AC-031 — return-to-tab re-reads from disk. ✓
- AC-040 = open-editor. Verified: `HooksTab.tsx:399-406` `applyPreset` only mutates the local `draft` state (`setDraft`); no `saveSettings` call until the explicit Save button. ✓
- AC-022 = single-select. Verified: `HooksTab.tsx:143` `onClick={() => setEvent(e.id)}` replaces the previously-selected value; `:144-146` renders `event === e.id ? railItemActive : railItem` — exactly one selected at a time. ✓
- AC-017 = CSS class swap. Verified: same `:144-146` shows class-toggling is the existing selection signal mechanism. Migration renames to `chipSelected` per D13. ✓

Every named branch matches the existing code. No planning bugs. ✓

**Concern 5 (Hooks-tab scroll) — RESOLVED.** §8.10 + ADR D11 reference `.tabBody overflow-y: auto`. Verified at `ClaudeSettingsPanel.module.css:167-172` — the rule is at line 170 exactly as Architect cited. The AC-054 addendum text ("mount the Hooks tab with a tall content fixture and confirm `scrollHeight > clientHeight` on `.tabBody`") appears in §8.10, in the §10 risks table (row "Hooks-tab content overflows…"), and in Architect's §11 sign-off-request block (concern reference). It is reachable for PM/QA. ✓

Note: the addendum has not been hoisted into the AC text proper (AC-054 still reads as written by PM). Architect explicitly defers that hoist to PM's next consensus round. This is acceptable — Architect is operating within scope by carrying it as a watch item until PM re-opens. Builder can write the assertion against the addendum as documented. If PM does not adopt at next round, the assertion still exists in §8.10 as Architect's binding instruction; Reviewer/QA will enforce.

**Concern 6 (comment literals) — RESOLVED.** §8.2 + ADR D1 commit verbatim to `/* === CHROME TOKENS === */` and `/* === CONTENT TOKENS === */`. AC-003's binding (§8.2 last paragraph): "AC-003's test asserts both substrings (`=== CHROME TOKENS ===` and `=== CONTENT TOKENS ===`) appear in tokens.css, in that order." Greppable, deterministic. ✓

**Concern 7 (CSS Modules config) — RESOLVED.** §8.6 + ADR D4 name the file path (`vitest.config.ts`), the strategy (`test.css.modules.classNameStrategy: "stable"`), and explicitly rule out `identity-obj-proxy`. The fallback file `tests/mocks/styleMock.ts` is documented as conditional (Phase 0 bootstrap test verifies pass-through). The AC-049 binding has been tightened in Architect's §11 block: *"the test asserts that `import styles from '*.module.css'` produces a non-empty exports object AND that `getComputedStyle()` returns non-empty values for at least one custom property."* The tautology is gone. ✓ (Note: this tightening lives in the Architect Sign-off Request block; PM should adopt as an explicit AC-049 update at next consensus pass — not blocking, but a hoist is cleaner than relying on Builder to read the §11 block.)

---

### Cross-check findings (user-requested)

**Settings-scope IN decision spot-check.** Architect's claim: 12 .tsx + 1 shared `.module.css`. Verified by inspecting `ClaudeSettingsPanel.tsx` (imports the 9 tab components plus ScopeSwitcher/ScaffoldBanner = 11 imports, plus self = 12) and `ClaudeSettingsPanel.module.css` (length verified — line 481 is the closing brace of `.monacoFrame`).

**Hidden-complexity assessment:** the settings panel reaches outside its own files via:
- Zustand store at `src/stores/claudeConfigStore.ts` — 1 store file, no cross-component prop chains.
- `services/claude-config-parser` parser/serializer — pure utility, not affected by re-theme.
- `window.agentcon.{fs,settings,dialog,claude}` — IPC bridge; mock covers all four namespaces (verified).
- No React context providers, no shared hooks beyond Zustand selectors, no toast/alert surface that escapes the panel (alerts are `.errorBanner` inside `.shell`, plus a per-tab `.errorBanner` in HooksTab).
- `HooksTab.tsx` is the heaviest component (~520 lines including `MatcherInput`, `HookEntryEditor`, `HookPresetsSection` — all co-located, all using the same `ClaudeSettingsPanel.module.css` for style), but its complexity is internal to the file. The migration's CSS rewrite touches the shared `.module.css`, not the JSX shape.
- Inline `style` props referencing tokens are present (`HooksTab.tsx:152-156` uses `var(--text-xs)` and `var(--text-muted)`; `:266-270` uses `var(--bg-input)` / `var(--radius-md)` / `var(--border-default)`; `ClaudeSettingsPanel.tsx:157` uses `var(--text-xs)`). All reference chrome tokens that survive the rename — none reference `--lp-*`. So Phase 4's "minor .tsx touch-ups" risk is small. The chrome-token names (`--bg-input`, `--text-muted`, `--border-default`) are NOT being renamed (they're under `=== CHROME TOKENS ===` and stay). One inline-style hazard: `HooksTab.tsx:269` references `--border-default` (unchanged). No hazard.

**Verdict on hidden complexity:** the file count (12 + 1) genuinely understates work in `HooksTab.tsx` (it's a long file with three sub-components), but the migration's blast radius does not scale with file length — it scales with the number of CSS modules touched and the number of tokens consumed. Both are small. **Settings-scope IN is the right call.** No new sign-off concern; the size of `HooksTab.tsx` is reflected in PRD §8.11 (the alert/error case enumeration explicitly walks `HooksTab.tsx:130` and `:105-107`).

**7-phase boundary shippability check.**

- **Phase 0.5 shippability:** confirmed trivially shippable. Files touched: 5 fixture files in `tests/baseline/` + one one-shot test that is deleted/skipped in the same commit. No `src/` modification. Anti-pattern bullet "Do NOT mutate any `src/` source file in this phase" is explicit. The codebase post-Phase-0.5 is identical to post-Phase-0 from production's perspective. ✓

- **Phase 2 atomicity:** confirmed atomic in a single PR-sized phase. Phase 2's Files-To-Touch list (≤12) bundles: tokens.css edit (move @font-face), tokens-landing.css delete, LandingPage.tsx import-removal + class-swap, LandingPage.module.css scroll-container declaration + rename map, 7 component .module.css files renamed, plus the new landing-regression test file. The phase description is structured as a single logical operation (apply D6 rename map verbatim across all 11 source files in one commit). Anti-pattern bullet "Do NOT introduce shim aliases. Atomic." is explicit. Completion criteria includes the grep assertion. **One edge case:** if Builder commits in a sequence of file-by-file commits within the phase rather than one squashed commit, the tree IS broken between commits (a renamed `.module.css` reading new tokens that don't yet exist — though the new tokens DO exist already from Phase 1, so the only sequencing risk is `tokens-landing.css` being deleted before its consumers are renamed). Recommend Architect or PM add explicit text to Phase 2's completion criteria: **"Phase 2 must be reviewed/squashed as a single logical commit. Mid-phase commits exposing a half-renamed tree are not deployable."** This is a tightening ask, not a blocker. The phase as written is squash-compatible.

- **Phase 3 sequencing:** Phase 3 only modifies App.tsx + new App.module.css + tokens.css `:focus-visible` flip. Settings panel mid-phase still uses `--accent-primary` for buttons but the global `:focus-visible` now resolves to `--accent-red`. Architect explicitly acknowledges this transient state in §11 watching concern #6 ("the un-migrated CLI-dark settings panel has red focus rings") and confirms via AC-052 contrast (3.13:1 ≥ 3.0). Per AC-054 the panel is operable. **This is acceptable but intentional.** The transient state is documented and within AC bounds. ✓

  **One sub-concern:** `tokens.css` in Phase 3 also flips `::selection { background: var(--accent-primary-bg) }` to `--accent-red-bg` (per Phase 3 implementation note line 728-729 — "OR can be flipped here — Builder picks"). The Builder-picks language is borderline — concern 4 was about removing "whichever Architect picks" punts, and a Phase-3-or-Phase-4 disjunction on `::selection` flip is a small but real reintroduction of the same shape. **Resolution: tighten to "flip in Phase 3 alongside `:focus-visible`."** Both rules sit in the same `tokens.css:144-153` block; flipping one and not the other is needlessly inconsistent. Non-blocking; Architect can acknowledge in next consensus round or Builder can resolve at commit time. (Phase 3's completion criteria already requires `tokens.css` to be modified in this phase, so the tighten is a one-line ADR/PRD edit.)

- **Phase 4 (settings re-theme) shippability:** Phase 4 changes shared layout primitives (`ClaudeSettingsPanel.module.css`) plus 1-3 .tsx files. Mid-phase if the CSS rewrite is committed before the JSX class swap (`railItem`/`railItemActive` → `chip`/`chipSelected` in `HooksTab.tsx`), the lifecycle chips render against old class names which no longer exist in CSS — visual breakage on the Hooks tab specifically. Conversely if JSX commits first, the new class names map to nothing — same breakage. **Same squash discipline as Phase 2 applies here.** Phase 4's completion criteria does not currently require single-commit treatment. Recommend tightening to "Phase 4 must be reviewed/squashed as a single logical commit; intermediate states with new class names against old CSS (or vice versa) are not deployable."

  Phase 4 also keeps `--accent-primary` in CSS rules until the same phase deletes the token from tokens.css. Phase 4's Files-To-Touch list lines 770 explicitly handles this: "DELETE `--accent-primary`, `--accent-primary-hover`, `--accent-primary-bg` definitions" (in same phase as the consumer rewrite). Atomic. ✓

**Verdict on phase shippability:** Phases 0, 0.5, 1, 3, 5 are clean. Phases 2 and 4 are atomic-by-intent but the PRD does not currently require single-commit-per-phase discipline; if Builder splits into per-file sub-commits, each phase's mid-tree state IS broken (briefly). **Tightening ask: PRD §9 Phase 2 + Phase 4 completion criteria add an explicit "must commit/squash as one logical unit" bullet.** Non-blocking — Architect's atomic-rename language already implies it; making it explicit removes ambiguity for Builder.

**Performance trigger OFF — measurability check.** Architect committed three named upper bounds in §11. Measurability:
- **Bundle CSS size ≤1.3x pre-migration sum.** Measurable from Vite build output (`dist/assets/*.css`). No new tooling needed. ✓
- **Settings CSS module ≤1.5x line count (≤720 lines).** `wc -l src/panels/claude-settings/ClaudeSettingsPanel.module.css`. Trivial. ✓
- **No measurable cold-start regression.** Architect did NOT specify a measurement path. Vitest doesn't measure Vite cold-start. Lighthouse, `vite preview` timer, manual stopwatch with N runs — none are named. **This bound is unmeasurable as written.** Phase 0's test infrastructure does not exercise it; no other phase has a "measure cold start" deliverable.

  This is not a substantive risk (cold-start delta from a CSS rename is ~0), but it's a commitment that cannot be verified. **Resolution requested: either remove the cold-start bound (the other two carry the perf-OFF commitment) OR specify the measurement (e.g. "manual timing over 5 cold starts pre/post, post mean ≤ pre mean × 1.10"). Architect picks; non-blocking; flagging because the user explicitly asked.**

---

### Concerns I'm Watching During Execution

1. **The "26 ACs" arithmetic error in ADR D3 / PRD §8.1.** Mechanical fix to "30 ACs" before Builder runs. If item 7 is ever pulled, Builder/QA must trust the matrix; a wrong count erodes that trust. (Blocking-soft: Builder can proceed if item 7 stays IN, but the fix is cheap and the ADR record should be correct on day one.)

2. **Cold-start regression bound is unmeasurable as written.** Architect committed it; nothing measures it. Either remove or specify the measurement path.

3. **Phase 2 + Phase 4 squash-as-one-commit discipline is implied but not explicit.** PRD/ADR atomic-rename language is good; an explicit "single logical commit" bullet in the phase completion criteria removes the squash ambiguity. Reviewer should reject if either phase appears in the diff as a sequence of file-by-file commits with broken intermediate states.

4. **`::selection` flip Phase-3-vs-Phase-4 is a small "Builder picks" punt** (Phase 3 implementation note, line 728-729). Tighten to "flip in Phase 3 alongside `:focus-visible`" — both rules are in the same `tokens.css:144-153` block. Cosmetic; non-blocking.

5. **AC-013 disjunction (Architect Round 1 watching concern #1).** I noted this at PM Round 1 sign-off and Architect echoed it. Builder writes the test for the disjunction (background OR border ≥3:1); Reviewer scrutinizes the test's binding language at Phase 3 review. If PM narrows to literal-`background-color`-only at any point, dev-switch design needs revisiting.

6. **Phase 0 bootstrap test must demonstrate `getComputedStyle() + var()` round-trip under jsdom.** Architect already calls this out as their watching concern #4. I'm restating because this is the single point of failure for every visual AC. If the round-trip fails, the entire test-driven regression net collapses. Builder MUST NOT advance past Phase 0 with a hollow bootstrap.

7. **Phase 0.5 `capture.test.ts` deletion/skip-marking.** Architect's watching concern #3. If left runnable, every subsequent phase silently overwrites the baseline fixtures. Reviewer enforces at Phase 0.5 review.

8. **Architect's §11 watching concern #5 (settings JetBrains Mono visible change is unlocked by any AC).** I accept Architect's recommendation to document the change in the verdict file. No new AC needed; subjective "looks weird" reactions during QA are out-of-band feedback, not AC failures.

---

### Scope confirmation

Aligns with my SIMPLIFY verdict. Architect's enumeration confirms item 7 fits (12 .tsx + 1 shared .module.css, well under the 25-file threshold; hidden complexity assessed and acceptable). Phase 0.5 is a real entry, not a pointer to an empty section. Every "whichever pre-migration" disjunction resolves to a named branch verified against existing code. The four mockup-issue resolutions are locked to specific tokens with computed contrast values. Globals are addressed (overflow:hidden preserved with scoped `.tabBody` scroll; `:focus-visible` re-points to `--accent-red` with verified contrast on both surfaces). The atomic rename strategy is reviewer-friendly and the file-count deviation is justified.

The only correctness fix I'm requiring is the matrix arithmetic. Everything else is concrete and Builder-ready.

### Verdict

**APPROVED with named concerns.** Pipeline advances to final lock once:
- (a) ADR D3 + PRD §8.1 "26 ACs" → "30 ACs" (mechanical fix; substantive enumeration is unchanged), AND
- (b) Architect acknowledges the cold-start measurability gap (either remove the bound or specify the measurement path).

Both are sub-revision-round fixes (one number, one sentence). I do not consider them grounds to send Architect back through a full revision; treat as Final-Lock-blockers that can be resolved in Architect's acknowledgement of this sign-off.

Watching concerns 3, 4 (squash discipline + `::selection` flip placement) are nice-to-haves; non-blocking.

---

### Architect Acknowledgement (Round 2) — 2026-05-05

Mechanical fixes addressing CTO Round 2's two BLOCKING-soft items, plus both watching concerns. No consensus reopened.

**Fix 1 — Matrix arithmetic (BLOCKING-soft):** ADR D3 count tally corrected from "26 ACs" to "30 ACs (1 + 2 + 8 + 19)" with the AC-range breakdown shown inline so the arithmetic is self-checking. Substantive enumeration (AC-009, AC-015–AC-016, AC-018–AC-025, AC-026–AC-044) is unchanged. PRD §8.1 itself does not contain the count string "26 ACs" — the matrix description in §8.1 enumerates the AC ranges without a tally — so no PRD §8.1 edit was needed. The "26 ACs" reference in the prior Architect Sign-off Request block (line 1175) is left in place per the "do not modify prior sign-off entries" directive; readers tracing forward see the corrected count in the canonical ADR D3 record and in this acknowledgement entry.

**Fix 2 — Cold-start performance bound (BLOCKING-soft):** Chose **option (a): remove the bound entirely.** Justification: cold-start risk for a CSS-token migration with no JS surface changes and no Vite-config changes is genuinely ~0; the two remaining bounds (CSS bundle ≤1.3x; settings CSS module ≤1.5x line count) are measurable and proportional to actual risk, and adding a bespoke timing harness for an unmeasurable risk is not worth the bookkeeping. The withdrawal is recorded inline at the prior Sign-off Request's bullet 3 with a strikethrough + cross-reference to this entry. Phase 0.5 exit criteria are unchanged (no baseline capture needed under option (a)).

**Watching concern 3 — Phase 2/4 squash discipline:** **Tightened.** Added a one-line completion-criterion bullet to both Phase 2 and Phase 4 in §9 stating the phase must be delivered as a single commit (or squash-merged) so the boundary is atomic per AC-054. Reasoning: cheap to add, removes the implicit-only language CTO flagged, and locks Reviewer's authority to reject per-file sub-commit sequences with broken intermediate states.

**Watching concern 4 — `::selection` token flip:** **Tightened to Phase 3.** Phase 3's Files-To-Touch note (§9) updated: `:focus-visible` and `::selection` both flip in Phase 3, in the same `tokens.css:144-153` block, no Builder discretion. Reasoning: cheap one-line edit, removes the "Builder picks" punt CTO flagged, and the new token (`--accent-red-bg`) already exists from Phase 1 so the dependency is satisfied. AC-005 (zero `--accent-primary` after Phase 4) remains unaffected — Phase 3 removes the chrome-side `tokens.css` references; Phase 4 removes the settings-side `ClaudeSettingsPanel.module.css` references and the token definitions themselves.

No other changes; consensus not reopened.

---

### PM Sign-off (Round 2) — 2026-05-05

**Section reviewed:** Architect §8, §9, §10, ADR D1–D16, plus CTO Round 2 acknowledgement and Architect Acknowledgement Round 2 mechanical fixes.
**Round:** 2
**Status:** **APPROVED with named concerns**

I walked the AC coverage matrix in both directions, confirmed every named concern from PM Round 1 is resolved against §8 / §9 / ADR with concrete content (not hand-wavy "see X"), verified the IPC mock seam supports each functional regression AC, and spot-checked the four mockup-issue resolutions for "TBD" / "Builder picks" residue. Architect's sections 8–10 plus the standalone ADR are Builder-ready. Mechanical fixes from Round 2 acknowledgement (matrix arithmetic 26→30, cold-start bound withdrawn, Phase 2/4 single-commit discipline, `::selection` Phase 3 lock) all landed. One minor implementation-gap sub-concern is flagged below; it is non-blocking and resolves at Builder time.

---

#### AC coverage matrix — walked both directions

**Forward (AC-001 → AC-055):** every AC has at least one phase claim. Mapping table:

| AC | Phase(s) claiming it | Status |
|---|---|---|
| AC-001 | Phase 2 (primary), Phase 5 (final grep verification) | ✓ |
| AC-002 | Phase 2 | ✓ |
| AC-003 | Phase 1 (banner labels added) | ✓ |
| AC-004 | Phase 2 | ✓ |
| AC-005 | Phase 4 (`--accent-primary` deletion + zero-grep) | ✓ |
| AC-006 | Phase 1 (partial — token defined), Phase 4 (consumer assertion) | ✓ |
| AC-007 | Phase 1 (partial), Phase 4 | ✓ |
| AC-008 | Phase 4 | ✓ |
| AC-009 | Phase 4 | ✓ |
| AC-010 → AC-014 | Phase 3 | ✓ |
| AC-015, AC-016 | Phase 4 | ✓ |
| AC-017 → AC-022 | Phase 4 | ✓ |
| AC-023 → AC-025 | Phase 4 | ✓ |
| AC-026 → AC-044 | Phase 5 (with AC-027/028/035/042 baselines captured in Phase 0.5) | ✓ |
| AC-045 | Phase 0.5 (baseline capture), Phase 2 (post-rename regression assertion) | ✓ |
| AC-046 | Phase 2 | ✓ |
| AC-047 → AC-050 | Phase 0 | ✓ |
| AC-051, AC-052, AC-053 | Phase 5 (AC-053 also referenced in Phase 4 as "panel-root applies cream-on-ink") | ✓ |
| AC-054 | Phase 5 (final assertion) + per-phase boundary check applied at every phase exit | ✓ |
| AC-055 | Phase 2 (atomic rename — trivially satisfied), Phase 5 (final grep verification) | ✓ |

**Reverse (Phase 0 → Phase 5):** every phase covers at least one AC; no phase is dead work.

| Phase | ACs claimed | Count |
|---|---|---|
| Phase 0 | AC-047, AC-048, AC-049, AC-050 | 4 |
| Phase 0.5 | AC-027, AC-028, AC-035, AC-042, AC-045 (baseline-binding) | 5 |
| Phase 1 | AC-003 + partial AC-006, AC-007 | 1 + 2 partial |
| Phase 2 | AC-001, AC-002, AC-004, AC-045, AC-046, AC-055 | 6 |
| Phase 3 | AC-010, AC-011, AC-012, AC-013, AC-014 | 5 |
| Phase 4 | AC-005, AC-006, AC-007, AC-008, AC-009, AC-015, AC-016, AC-017, AC-018, AC-019, AC-020, AC-021, AC-022, AC-023, AC-024, AC-025, AC-043, AC-044, AC-053 | 19 |
| Phase 5 | AC-026, AC-027, AC-028, AC-029, AC-030, AC-031, AC-032, AC-033, AC-034, AC-035, AC-036, AC-037, AC-038, AC-039, AC-040, AC-041, AC-042, AC-051, AC-052, AC-054 | 20 |

**Orphans (AC with no phase claim):** none. ✓
**Phases with zero AC (dead work):** none. ✓

**ACs claimed by more than one phase — examined for split-dependency hazards:**
- AC-006 / AC-007 (Phase 1 partial + Phase 4): Phase 1 defines the token, Phase 4 applies it to consumers. Two halves of one assertion; the test runs at Phase 4, not split across phases. Acceptable. ✓
- AC-027 / AC-028 / AC-035 / AC-042 (Phase 0.5 + Phase 5): Phase 0.5 captures the baseline fixture; Phase 5 asserts the post-migration render against the fixture. Two-phase preparation, single-phase assertion. Acceptable. ✓
- AC-045 (Phase 0.5 + Phase 2): Phase 0.5 captures, Phase 2 asserts. Same shape. ✓
- AC-053 (Phase 4 + Phase 5): Phase 4 makes the `.shell` change that satisfies the chrome/content split; Phase 5 writes the test. Acceptable. ✓
- AC-001 / AC-055 (Phase 2 primary + Phase 5 verification): Phase 2 is the assertion; Phase 5 re-runs the grep as a final-lock gate. Acceptable. ✓

**Conditional `[Defer-candidate]` set verification:** Architect kept item 7 IN, so the conditional matrix (AC-009, AC-015–AC-016, AC-018–AC-025, AC-026–AC-044 = 30 ACs) all remain in the live gate. I confirmed each of the 30 ACs maps to a phase in the table above. ✓

**Matrix arithmetic fix (CTO Round 2 BLOCKING-soft):** ADR D3 line 110 reads "30 ACs (1 + 2 + 8 + 19)" with self-checking arithmetic shown inline. ✓ Verified — corrected count landed. PRD §8.1 enumerates the AC ranges without a tally string, so no §8.1 edit was needed. The stale "26 ACs" figure remaining in the prior Architect Sign-off Request block (line 1175) is acceptable per the do-not-modify-prior-sign-off-entries directive; readers tracing forward see the corrected count in ADR D3 + the Architect Acknowledgement entry.

---

#### PM's 12 named concerns — resolution check

| # | Concern | Resolved at | Verdict |
|---|---|---|---|
| 1 | Token file structure (single vs split) | ADR D1 + §8.2 — single file, banner-banded sections, exact literal strings `/* === CHROME TOKENS === */` and `/* === CONTENT TOKENS === */` | ✓ Locked |
| 2 | Rename strategy (atomic vs shim) | ADR D2 + §8.3 + §9 Phase 2 — atomic in one phase; AC-055 trivially satisfied; no shim aliases at any boundary; Phase 2 single-commit discipline added in CTO Round 2 acknowledgement | ✓ Locked |
| 3 | Settings-panel scope (item 7 IN/OUT) | ADR D3 + §8.1 — IN, with 12 .tsx + 1 shared .module.css enumerated; conditional matrix recorded for any future trim | ✓ Spot-checked: `ClaudeSettingsPanel.tsx` imports the 9 tab components + ScopeSwitcher + ScaffoldBanner, total 11 + self = 12 components confirmed |
| 4 | Pre-migration semantic captures (5 disjunctions) | ADR D9 + §8.8 — Phase 0.5 with 5 fixture files (`landing-computed-style.json`, `settings-empty-state.json`, `settings-invalid-json-alert.txt`, `settings-tab-switch-pending.json`, `settings-alerts-by-case.json`) | ✓ Locked, all 5 fixtures named |
| 5 | Empty-state border (solid vs dashed-lighter) | ADR D8 + §8.12 + §8.5 — **solid**, `border-width: 1.5px`, `border-color: #bfb59a` (`--empty-state-border-color`); contrast ≈1.71:1 within AC-025 1.5–3.0 range | ✓ Locked to solid |
| 6 | Single-vs-multi-select chips | ADR D10 + §8.9 — single-select; verified at `HooksTab.tsx:143` `setEvent(e.id)` replaces previously-selected; AC-022 binds | ✓ Locked, code-verified |
| 7 | Landing baseline capture mechanism | ADR D9 + §8.8 + Phase 0.5 — test-driven via one-shot `tests/baseline/capture.test.ts`; outputs committed; test deleted/skipped in same phase | ✓ Locked |
| 8 | Globals resolution (preserve vs replace) | ADR D11 + §8.10 — `overflow: hidden` preserved in place under `=== CHROME TOKENS ===` band (AC-051 outcome a); `:focus-visible` preserved, references re-pointed to `--accent-red`; `body { background: var(--bg-base) }` preserved | ✓ Locked to preserve |
| 9 | `--accent-primary` retention or replacement | ADR D6 + §8.4 — **renamed/replaced**: `--accent-primary` → `--accent-red`; siblings (`-hover`, `-bg`) replaced with `--accent-red-hover` / `--accent-red-bg`; AC-005 binds outcome (a) | ✓ Locked to replacement |
| 10 | Panel list for `--border-panel-strong` (AC-008's six panels) | ADR D7 + §8.5 + Phase 4 implementation notes — 6 panels confirmed: `.itemRow` (project-scope cards), settings-tab content panel via `.shell` or child, form panels, preset cards, chip-group container, `.errorBanner` (alert containers) | ✓ All six retained; no removal |
| 11 | Pre-migration alert text baselines | §8.11 + ADR D9 — three alert/error cases enumerated (init failure, scope load failure, save failure) traced to `ClaudeSettingsPanel.tsx:140` and `HooksTab.tsx:130/:105-107`; `tests/baseline/settings-alerts-by-case.json` captures each via Phase 0.5's one-shot test | ✓ Locked, three cases enumerated |
| 12 | Test directory location and fixture conventions | ADR D4 + §8.14 — `tests/` at repo root: `tests/setup.ts`, `tests/mocks/agentconMock.ts`, `tests/baseline/`, `tests/example.test.tsx`, `tests/landing-regression.test.tsx`, `tests/settings-regression.test.tsx`. Component structure block in §8.14 enumerates every new test file with its phase | ✓ Locked |

**No "see X" with X empty.** Every concern resolves to a specific ADR decision number and a specific PRD section with concrete content. ✓

---

#### CTO Round 2 still-watching concerns

CTO Round 2 acknowledged the following as standard execution risks already in Architect's own watching list:
- **Watching #5 (jsdom round-trip):** Architect's §10 risk row "`getComputedStyle` under jsdom returns empty strings for some CSS custom properties" + Phase 0 bootstrap test gate. Builder must not advance past Phase 0 with a hollow bootstrap. ✓ Documented; in scope for Builder.
- **Watching #7 (`capture.test.ts` deletion):** Architect's §10 risk row "Phase 0.5 `capture.test.ts` left runnable in subsequent phases overwrites fixtures" + Phase 0.5 anti-pattern bullet. Reviewer enforces deletion/skip in the same Phase 0.5 commit. ✓ Documented; in scope for Reviewer.
- **AC-013 disjunction (Architect Round 1 #1, CTO Round 2 #5):** ADR D14 documents the disjunction (background OR border ≥3:1 against surround); Phase 3 test asserts the disjunction. PM is asked to clarify AC-013's literal in a future round. **For this run, I accept Architect's disjunction interpretation as the binding shape.** AC-013's literal text reads "ratio is ≥3.0:1 (the button must be discernible from its surrounding background)" — Architect's resolution (ink background + cream border on cream-surround) gives 15.5:1 border-vs-surround, which discernibly satisfies the parenthetical "must be discernible" intent even if the literal `background-color` clause technically reads at 1.0:1 on the cream landing. **PM accepts the disjunction binding for Phase 3 execution; I'm not narrowing AC-013 to literal-`background-color`-only.** Builder's test asserts the disjunction; Reviewer enforces.

All three are documented and in scope for Builder/Reviewer; no re-litigation needed at PM Round 2.

---

#### IPC mock seam coverage of functional regression ACs (AC-026 → AC-044)

Verified Architect's `tests/mocks/agentconMock.ts` spec (§8.7 + ADR D5) against `claudeConfigStore.ts` and `src/global.d.ts`. The mock matches the full `AgentConApi` interface including `fs.{readText, writeText, exists, getRoots, readDir, delete, watchStart, watchStop, onWatchEvent}` + `settings.{get, set, delete, save}` + `dialog.{open, ask}` + `claude.{seedAgents, scaffoldProject, readTemplate}`. Walk:

| AC | Mock support | Verdict |
|---|---|---|
| AC-026 (load happy) | Pre-arm `fakeFs.set(path, knownJson)` → mount → `readText` returns it → DOM renders parsed value | PASS |
| AC-027 (load missing) | `readText` returns `null` for missing path → panel renders empty state → compare to `settings-empty-state.json` baseline (logical structure only) | PASS |
| AC-028 (load invalid JSON) | Pre-arm `fakeFs.set(path, "{not json}")` → store's parser throws → `initError` populated → alert renders → compare text to `settings-invalid-json-alert.txt` baseline | PASS |
| AC-029 (typed input echoes) | Pure DOM/React; no IPC needed; Testing Library `user.type()` | PASS |
| AC-030 (Save persists) | Click Save → `saveSettings` → `writeText` to mock → `expect(JSON.parse(fakeFs.get(path)!))` contains edit | PASS (canonical pattern in ADR D5) |
| AC-031 (pending edit on tab change → discarded) | After edit, simulate scope/tab change → assert mock's `writeText` was never called between edit and navigation; in-memory Map content equals initial | PASS |
| AC-032 (concurrent saves last-write-wins, not gated) | Fire two `user.click(saveButton)` in sequence → await both promises → final Map content equals second payload | PASS |
| AC-033 (tab switch render) | Pure DOM; mount + `user.click(tabB)`; assert testid presence/absence | PASS |
| AC-034 (no console errors across tabs) | Pure DOM; error-boundary mock + zero-error assertion | PASS |
| AC-035 (pending edit preserved/discarded on tab+return) | Same mechanism as AC-031; assert no `writeText` AND on return field re-initializes from mock's Map | PASS |
| AC-036 (Hooks render-from-disk) | Pre-arm config with hook group; mount HooksTab; assert per-field text | PASS |
| AC-037 (Add matcher group) | Pure DOM; click `+ Add matcher group` (HooksTab.tsx:232-240); assert `.itemRow` count delta | PASS |
| AC-038 (edit matcher and persist) | user.type + Save → mock `writeText` → assert Map content matcher value | PASS |
| AC-039 (remove group and persist) | Click `×` (HooksTab.tsx:192-200) + Save → assert group absent in parsed Map content | PASS |
| AC-040 (preset apply, open-editor branch) | Click preset → `setDraft` mutates local; Save click → `writeText` to mock → assert Map content (matches D10's open-editor binding verified at HooksTab.tsx:399-406) | PASS |
| AC-041 (preset status pill) | Pure DOM computed-style partition test | PASS |
| AC-042 (alert text per case matches baseline) | Three cases: init failure (mock readText throws), scope load failure (mock readText throws on second scope), save failure (mock writeText throws) | PASS with sub-concern (see below) |
| AC-043 (alert visual) | Pure computed-style; no IPC | PASS |
| AC-044 (alert border) | Pure computed-style | PASS |

**All 19 functional regression ACs supported by the mock.** No FAIL.

**One sub-concern on AC-042 case 3 (save failure):** ADR D5 specifies `readText` returns `null` if missing and Map-backed otherwise; §8.11 references "fs with valid config + simulated write failure" for the save-failure alert case but the mock spec doesn't explicitly expose a write-failure injection knob (e.g. `mock.failNextWrite()` or per-path error mapping). **This is an implementation gap, not a planning gap** — Builder will need to extend the mock with a small write-error injection knob to capture AC-042 case 3's baseline in Phase 0.5 and assert against it in Phase 5. Architect's §8.11 implies this is intended; the ergonomics are Builder's call. **Non-blocking; flagging as a watching concern for Phase 0/Phase 0.5 execution.**

---

#### Four mockup-issue resolutions — TBD/Builder-picks residue check

| Issue | Resolution location | Concrete? | TBD residue? |
|---|---|---|---|
| Tab titles (AC-015–016) — mono not serif italic | §8.12 + ADR D12 — `font-family: var(--font-mono)`, `font-style: normal`, `font-weight: 500`, `font-size: var(--text-md)` (14px), `text-transform: uppercase`, `letter-spacing: 0.04em` | All five typography properties locked to specific values | **None.** ✓ |
| Lifecycle chips (AC-017–022) — selection signal + tokens + contrast | §8.12 + ADR D13 — CSS-class swap `chip` ↔ `chipSelected` (single-select per D10); selected = `--chip-bg-selected` (ink) / `--chip-border-selected` (ink) / `--chip-text-selected` (cream) → 14.8:1; default = `--chip-bg-default` (cream-soft) / `--chip-border-default` (border-panel-strong-color) / `--chip-text-default` (ink-soft) → 6.8:1 | All six tokens locked, both contrast floors verified | **None.** ✓ |
| Empty-state border (AC-023–025) — solid or dashed-lighter | §8.12 + ADR D8 — **solid**, 1.5px, `--empty-state-border-color` `#bfb59a` → 1.71:1 against cream (within 1.5–3.0 range) | Solid branch picked; color, width, contrast all locked | **None.** ✓ |
| Dev-switch contrast (AC-010–014) — token bindings on both surfaces | §8.12 + ADR D14 — new file `src/App.module.css` with `.devSwitch` class consuming `--ink` (background), `--surface-cream` (color), `1px solid var(--surface-cream)` (border); zero hex literals in `App.tsx` | All token assignments locked; AC-013 binds to disjunction (background OR border ≥3:1 against surround) per Architect's binding | AC-013 disjunction is the only soft spot — accepted; see CTO Round 2 still-watching above |

**No "TBD" or "Builder picks freely" residue in any of the four mockup-issue resolutions.** The only directional language remaining is AC-013's disjunction, which I'm accepting (see above). ✓

---

#### Security trigger confirmation

Security trigger remains **OFF**. Architect's Sign-off Request confirmed by walking the phase plan:
- Phase 0 introduces a renderer-side mock of `window.agentcon` for tests — does not modify production IPC schema, preload script, or main-process code.
- Phase 4 touches `src/panels/claude-settings/` CSS only; does not touch `claudeConfigStore.ts`, `services/claude-config-parser`, or any IPC handler.
- Phase 3 touches `App.tsx` for visual treatment only; `import.meta.env.DEV` gate and surface-switcher logic unchanged.
- No new persisted data; no new network surface; no auth code; no payment code.

I flagged "no security trigger candidate" at PM Round 1; Architect confirmed at sign-off; CTO confirmed at Round 2. Aligned. ✓

---

#### Concerns I'm watching during execution

1. **AC-042 case 3 (save-failure alert) needs a write-error injection knob in `agentconMock.ts`.** ADR D5 specifies the read-side error model (returns `null` for missing) but doesn't explicitly expose how to inject a `writeText` failure. §8.11 implies this is intended for the save-failure baseline. Builder extends the mock; Reviewer scrutinizes the Phase 0/0.5 mock surface to confirm the knob is present before the baseline is captured. Non-blocking.

2. **AC-013 disjunction binding (CTO Round 2 #5, Architect Round 1 #1).** Builder writes the Phase 3 test for the disjunction (background-vs-surround OR border-vs-surround ≥3:1). I'm accepting the disjunction for this run. If a future revision narrows AC-013 to literal-`background-color`-only, dev-switch design needs revisiting (D14 mentions "brighter border or shadow"); for this run that's hypothetical.

3. **Phase 0 bootstrap test must demonstrate `getComputedStyle()` + `var()` round-trip under jsdom.** If the round-trip fails, every visual AC collapses. Architect's §10 risk row + Phase 0 completion criteria. Builder must not advance past Phase 0 with a hollow bootstrap. (Echoing Architect Round 1 #4 + CTO Round 2 #6.)

4. **Phase 0.5 `capture.test.ts` deletion/skip-marking.** If left runnable, every subsequent phase silently overwrites the baseline fixtures, hollowing the regression net. Phase 0.5 anti-pattern bullet + Reviewer gate. (Echoing Architect Round 1 #3 + CTO Round 2 #7.)

5. **AC-031 / AC-035 binding to "discarded" depends on the `useEffect` reset at `HooksTab.tsx:36-39`.** Architect verified this against the existing code. If Phase 4's "minor .tsx touch-ups" inadvertently changes the `useEffect` dependency array or moves the reset logic, AC-031 / AC-035 binding shifts. Phase 4 anti-pattern bullet "Do NOT change any settings-panel functional logic (load/edit/save flows)" guards this; Reviewer scrutinizes the HooksTab.tsx diff.

6. **Phase 2 + Phase 4 squash discipline (CTO Round 2 #3, now landed in §9 completion criteria).** Reviewer enforces single-commit (or squash-merged) delivery; per-file sub-commits with broken intermediate states are rejected.

7. **AC-013 vs Architect's interpretation of the parenthetical** — flagged above as concern #2. The literal AC text and Architect's binding are not in conflict but require Reviewer's awareness at Phase 3 review.

8. **Settings panel JetBrains Mono font flip (Architect watching #5, CTO Round 2 #8).** Documented as accepted per the migration thesis. No new AC needed; subjective "looks weird" feedback during QA is out-of-band, not an AC failure. Verdict file should note the change was intentional.

9. **`::selection` flip placement (CTO Round 2 #4, now landed in Phase 3 completion criteria).** Both `:focus-visible` and `::selection` flip in Phase 3 in the same `tokens.css:144-153` block with no Builder discretion. Reviewer enforces.

10. **`--accent-primary` removal in Phase 4 — Architect grep-verified no consumer outside `src/panels/claude-settings/`, `tokens.css`, `App.tsx`.** Builder re-runs the grep at Phase 4 exit. (Architect Round 1 #7.)

11. **AC-049 binding tightened in Architect Sign-off Request to "import styles from '*.module.css' produces non-empty exports object AND `getComputedStyle()` returns non-empty values for at least one custom property."** This tightening lives in the §11 sign-off block, not in the AC-049 text in §5. Builder reads §11 to apply it; Reviewer scrutinizes the bootstrap test against the tightened binding. Non-blocking; the AC text in §5 is still satisfiable but the §11 tightening is the canonical Builder instruction.

12. **Hooks-tab scroll addendum** (Architect's §8.10 instruction: "mount Hooks tab with tall fixture, assert `scrollHeight > clientHeight` on `.tabBody`"). Carried by Architect as a watch item; not hoisted into AC-054 text. **PM accepts as a watch item for this run.** Builder writes the assertion against the addendum as documented in §8.10; if the existing `.tabBody overflow-y: auto` rule survives Phase 4 unchanged (which the anti-pattern bullets enforce), the assertion passes trivially. Non-blocking.

---

#### Verdict

**APPROVED with named concerns.** Pipeline advances to Builder execution starting at Phase 0.

All 12 of PM's Round 1 concerns are resolved against ADR / §8 / §9 with concrete content. CTO Round 2's two BLOCKING-soft fixes (matrix arithmetic, cold-start measurability) landed correctly via Architect Acknowledgement Round 2. CTO Round 2's two non-blocking watching concerns (Phase 2/4 squash discipline, `::selection` Phase 3 lock) also landed. AC coverage matrix has zero orphans, zero dead-work phases, and the duplicated-AC-across-phases set are all legitimate two-half preparations (capture + assert) with no split-dependency hazards. The IPC mock seam supports all 19 functional regression ACs (AC-026 → AC-044), with one minor implementation gap on AC-042 case 3 save-failure injection that Builder resolves at Phase 0/0.5.

The four mockup-issue resolutions are concretely specified with no "TBD" or "Builder picks freely" residue. AC-013's disjunction is the only directional remainder; I accept it for this run.

Twelve watching concerns documented above for Builder/Reviewer awareness during execution. None are blocking. Consensus closed.

---

## Consensus Status: LOCKED — 2026-05-05

**PRD locked at 2026-05-05 (CTO final lock block).**

### Sign-off ledger

| Agent | Round | Section reviewed | Status | Concerns named | Source location in §11 |
|---|---|---|---|---|---|
| PM | Round 1 (request) | Self — sections 3-7 | ✅ APPROVED (self-flagged) | 12 | "PM Sign-off Request — 2026-05-03" |
| CTO | Round 1 | PM sections 3-7 | ✅ APPROVED with named concerns | 7 | "CTO Sign-off — 2026-05-03" |
| Architect | Round 1 (request) | Self — sections 8-10 + ADR | ✅ APPROVED (self-flagged) | 7 | "Architect Sign-off Request — 2026-05-03" |
| CTO | Round 2 | Architect sections 8-10 + ADR | ✅ APPROVED with named concerns (2 BLOCKING-soft + 8 watching) | 8 | "CTO Sign-off — 2026-05-03 (Round 2)" |
| Architect | Acknowledgement R2 | CTO Round 2 mechanical fixes | ✅ FIXES LANDED | 4 | "Architect Acknowledgement (Round 2) — 2026-05-05" |
| PM | Round 2 | Architect sections 8-10 + ADR + R2 acknowledgement | ✅ APPROVED with named concerns | 12 | "PM Sign-off (Round 2) — 2026-05-05" |

All four required sign-offs are present:
- ✅ CTO on PM section (3-7) → CTO Round 1.
- ✅ CTO on Architect section (8-10 + ADR) → CTO Round 2.
- ✅ Architect Acknowledgement on CTO Round 2 → matrix arithmetic (26→30) corrected in ADR D3, cold-start bound withdrawn, Phase 2/4 single-commit discipline added to §9 exit criteria, `::selection` flip locked to Phase 3.
- ✅ PM on Architect section (8-10 + ADR + R2 acknowledgement) → PM Round 2.

No blocking objections survive. Both CTO Round 2 BLOCKING-soft items resolved by Architect Acknowledgement R2 with no consensus reopen required.

---

### Locked scope and triggers

**Verdict carried into lock:** SIMPLIFY (per `cto-verdict.md` 2026-05-03 + section 1 header). Architect's enumeration confirmed item 7 (full settings re-theme) fits the run; conditional matrix preserved as the canonical trim block if scope is later reduced.

**IN scope (locked, non-negotiable):**
1. Token consolidation — single `tokens.css` with banner-banded sections `/* === CHROME TOKENS === */` and `/* === CONTENT TOKENS === */` (ADR D1; AC-003 binds to those literal substrings).
2. Token rename — every `--lp-*` token gets a non-prefixed shared name (`--surface-cream`, `--ink`, `--accent-red`, `--font-display`, `--font-mono`, …). Atomic in Phase 2, no shim aliases (ADR D2; AC-001/AC-046/AC-055 enforce).
3. New `--border-panel-strong` token (ADR D7) defined in Phase 1 and applied in Phase 4 to six panel categories: project-scope cards (`.itemRow`), settings-tab content panel (`.shell`/child), form panels, preset cards, lifecycle-chip group containers, alert/error containers (`.errorBanner`).
4. Dev-switch fix — `App.tsx` inline hex literals (`#1a1c19` / `#d8d2bf` / `#4a4742` at lines 38-47) rewritten to use `--ink` / `--surface-cream` tokens via new `src/App.module.css` (ADR D14; AC-010-AC-014).
5. Landing-page re-theme — mechanical follow-on of the rename, no visible change to the validated landing surface (Phase 2; AC-045 baseline regression).
6. Four mockup-issue resolutions — each locked to specific token + computed values:
   - **Tab titles** → `font-family: var(--font-mono)`, `font-style: normal`, `font-weight: 500`, `font-size: var(--text-md)`, `text-transform: uppercase`, `letter-spacing: 0.04em` (ADR D12; AC-015/AC-016).
   - **Lifecycle chips** → CSS-class swap `chip` ↔ `chipSelected`, single-select; selected = ink/ink/cream → 14.8:1; default = cream-soft/border-panel-strong/ink-soft → 6.8:1 (ADR D13; AC-017–AC-022).
   - **Empty-state border** → solid, 1.5px, `--empty-state-border-color` `#bfb59a` → 1.71:1 within AC-025 1.5–3.0 range (ADR D8; AC-023–AC-025).
   - **Dev-switch** → see item 4 (ADR D14; AC-010–AC-014).
7. **Full settings-panel re-theme** — IN per Architect's enumeration: **12 `.tsx` files + 1 shared CSS module** (`src/panels/claude-settings/ClaudeSettingsPanel.module.css`, 481 lines pre-migration), well under the 25-file scope threshold. All settings flows preserve zero functional regression (load happy/missing/invalid, edit, save-to-disk, tab switch, hooks add/edit/remove, presets, alerts).

**OUT of scope (deferred or refused):**
- Electron main-process code untouched. No IPC schema change, no preload-script change, no main-process modification at any phase.
- `claudeConfigStore.ts` and `services/claude-config-parser` untouched (renderer-side mock at `tests/mocks/agentconMock.ts` is the test seam — not a production change).
- No behavioral feature changes to settings (load/edit/save Claude Code config logic preserved as-is).
- No new persisted data, no new network surface, no auth code, no payment code.
- No visual treatment for surfaces beyond settings + landing + dev-switch unless explicitly enumerated.
- "Weak left-rail visual hierarchy" (CTO verdict §Key factors §3, non-exhaustive observation) is acknowledged but out of scope; raised to user as a follow-on candidate.
- Visual regression via Playwright/Percy — out of scope; computed-style + token-equality discipline is the deterministic check.

**Security trigger: OFF.** No auth, no IPC schema change, no new persisted data, no new network surface. Confirmed by Architect (Sign-off Request) and CTO (Round 2 §Cross-check). Trigger flips ON only if Builder breaches by touching `claudeConfigStore.ts`, IPC handlers, preload script, or file-watching infrastructure.

**Performance trigger: OFF** with two measurable upper bounds:
1. CSS bundle size after consolidation must not exceed **1.3x** the pre-migration sum of `tokens.css` + `tokens-landing.css`. Measured against Vite build output `dist/assets/*.css`.
2. `src/panels/claude-settings/ClaudeSettingsPanel.module.css` must not grow more than **1.5x** its pre-migration line count (≤720 lines post; 481 lines pre). Measured via `wc -l`.
3. ~~Cold-start bound~~ — **WITHDRAWN per Architect Acknowledgement R2 (2026-05-05).** Unmeasurable as written; the two bounds above carry the perf-OFF commitment.

If Builder observes either remaining bound tripped during execution, escalate immediately rather than ship a regression.

**Testing posture flipped from prior run.** Prior run's ADR D7 ("Option C — no test runner") does NOT apply to this run. This run stands up **vitest + Testing Library** scoped to settings-panel functional regression coverage (CTO verdict §Testing posture; Architect ADR D4). Phase 0 deliverable: test runner config (`vitest.config.ts` with `test.css.modules.classNameStrategy: "stable"`), CSS Modules support via Vite's built-in pass-through (no `identity-obj-proxy`), IPC mock seam at `tests/mocks/agentconMock.ts` covering `fs` / `settings` / `dialog` / `claude` namespaces, jsdom environment, example test demonstrating `import styles from '*.module.css'` produces non-empty exports AND `getComputedStyle()` returns non-empty values for at least one custom property.

**Pre-migration baseline capture as Phase 0.5** — Architect's dedicated phase (ADR D9) capturing **5 fixture files** via one-shot `tests/baseline/capture.test.ts` BEFORE Phase 1 touches anything user-visible: `landing-computed-style.json` (AC-045), `settings-empty-state.json` (AC-027), `settings-invalid-json-alert.txt` (AC-028), `settings-tab-switch-pending.json` (AC-035), `settings-alerts-by-case.json` (AC-042). The capture file must be deleted or `.skip`-marked in the same Phase 0.5 commit so subsequent phases cannot overwrite the baselines with post-rename values (Reviewer enforces).

---

### AC ↔ phase coverage (locked)

Total: **55 AC across 7 phases (Phase 0 / 0.5 / 1 / 2 / 3 / 4 / 5).** Every AC-001 through AC-055 mapped to at least one phase. No orphans. No phase has zero AC. Validated by PM Round 2 forward and reverse walk.

| Phase | AC count | AC range / list |
|---|---|---|
| Phase 0 — Test runner setup (vitest + Testing Library, jsdom, CSS Modules pass-through, IPC mock seam) | 4 | AC-047, AC-048, AC-049, AC-050 |
| Phase 0.5 — Baseline capture (5 fixtures via one-shot `tests/baseline/capture.test.ts`) | 5 | AC-027, AC-028, AC-035, AC-042, AC-045 (baseline-binding leg) |
| Phase 1 — Token foundation (banner-banded sections, new content tokens, `--border-panel-strong` defined) | 1 + 2 partial | AC-003 + partial AC-006, AC-007 |
| Phase 2 — Atomic rename (delete `tokens-landing.css`, mass `--lp-*` → unified rename, landing regression test added) | 6 | AC-001, AC-002, AC-004, AC-045 (assert leg), AC-046, AC-055 |
| Phase 3 — Dev-switch + globals flip (`App.module.css`, `:focus-visible` → `--accent-red`, `::selection` → `--accent-red-bg`) | 5 | AC-010, AC-011, AC-012, AC-013, AC-014 |
| Phase 4 — Settings re-theme (`ClaudeSettingsPanel.module.css` + minor `.tsx` touch-ups; `--accent-primary` deletion) | 19 | AC-005, AC-006, AC-007, AC-008, AC-009, AC-015, AC-016, AC-017, AC-018, AC-019, AC-020, AC-021, AC-022, AC-023, AC-024, AC-025, AC-043, AC-044, AC-053 |
| Phase 5 — Settings regression tests + final verification | 20 | AC-026, AC-027 (assert), AC-028 (assert), AC-029, AC-030, AC-031, AC-032, AC-033, AC-034, AC-035 (assert), AC-036, AC-037, AC-038, AC-039, AC-040, AC-041, AC-042 (assert), AC-051, AC-052, AC-054 |

**Six ACs span two phases as legitimate capture+assert preparations (PM R2 verification):**
- **AC-006 / AC-007** — Phase 1 defines token, Phase 4 asserts on consumers.
- **AC-027 / AC-028 / AC-035 / AC-042** — Phase 0.5 captures baseline fixture, Phase 5 asserts post-migration render.
- **AC-045** — Phase 0.5 captures, Phase 2 asserts.
- **AC-053** — Phase 4 makes `.shell` change, Phase 5 writes the test.
- **AC-001 / AC-055** — Phase 2 primary assertion, Phase 5 final-lock grep verification.

No orphans. No dead-work phases. No split-dependency hazards.

---

### Conditional defer matrix (canonical trim block — currently dormant)

Settings re-theme (item 7) is **IN** for this run, so the conditional matrix is dormant. If a future revision pulls item 7, the following **30 ACs** come out together:

- **AC-009** (1 AC) — chip default-state border, settings-specific.
- **AC-015–AC-016** (2 ACs) — tab titles, settings-specific.
- **AC-018–AC-025** (8 ACs) — chip selection state + empty-state border, Hooks-tab-specific.
- **AC-026–AC-044** (19 ACs) — full functional regression set + Hooks/presets/alerts.

Total: **1 + 2 + 8 + 19 = 30 ACs** (corrected from "26 ACs" via Architect Acknowledgement R2; canonical record in ADR D3 line 110 reads "30 ACs (1 + 2 + 8 + 19)" with self-checking arithmetic). The stale "26 ACs" string in the prior Architect Sign-off Request block (line 1175 of this PRD) is left in place per do-not-modify-prior-sign-off-entries directive; readers tracing forward see the corrected count in ADR D3 + the Architect Acknowledgement R2 entry.

---

### Aggregated concerns ledger (deduplicated, IDed)

The six sign-off entries collectively named **40 concerns**: 12 PM Round 1 + 7 CTO Round 1 + 7 Architect Round 1 + 8 CTO Round 2 (2 BLOCKING-soft + ~6 watching) + 4 Architect R2 acknowledgement + 12 PM Round 2 — minus 2 BLOCKING-soft fixes already landed. After de-duping cross-references and dropping spec-completion concerns that are now resolved in §8 / §9 / ADR, **22 distinct downstream concerns** carry into execution.

**Dedupe summary:**
- **PM Round 1's 12 concerns** were *spec-completion* asks for Architect; all resolved against ADR / §8 / §9 with concrete content (PM R2 §"PM's 12 named concerns — resolution check"). The runtime guards that protect those resolutions live in CONS-04 / CONS-05 / CONS-08 / CONS-12 / CONS-15 below.
- **CTO Round 1's 7 architect-facing concerns** were *spec-completion* asks; all resolved per CTO Round 2 §"Round 1 concerns — resolution check." Runtime guards live in CONS-04 / CONS-08 / CONS-09 / CONS-15 / CONS-19 below.
- **CONS-08 = CTO-R1-1 + PM-R2-IPC-mock** — IPC mock seam discipline (read+write paths must support all functional regression ACs).
- **CONS-09 = CTO-R1-2 + Architect-R1-3** — Phase 0.5 baseline capture must run before any user-visible edit AND `capture.test.ts` must be deleted/skipped in same commit.
- **CONS-12 = CTO-R1-3 + ADR D3** — defer matrix arithmetic verified at 30 ACs (ADR-canonical, mechanical fix landed).
- **CONS-15 = CTO-R1-4 + PM-R1-4** — pre-migration semantic disjunctions (AC-031/AC-032/AC-035/AC-040/AC-022/AC-017) all bound to named branches in §8.9 / ADR D10 with code citations.
- **CONS-17 = CTO-R2-3 + Architect Ack R2 watching #3** — Phase 2/4 squash-as-one-commit discipline (now landed in §9 completion criteria).
- **CONS-18 = CTO-R2-4 + Architect Ack R2 watching #4** — `::selection` flip locked to Phase 3 (now landed in §9 Phase 3 implementation note).
- **CONS-19 = CTO-R2-1 + Architect Ack R2 fix 1** — matrix arithmetic 26→30 corrected in ADR D3 (verification point only).
- **CONS-20 = CTO-R2-2 + Architect Ack R2 fix 2** — cold-start bound withdrawn (verification point only).
- **CONS-13 = CTO-R2-5 + Architect-R1-1 + PM-R2-2** — AC-013 dev-switch contrast disjunction (background OR border ≥3:1 against surround); PM accepts the disjunction binding for Phase 3.
- **CONS-21 = Architect-R1-4 + CTO-R2-6 + PM-R2-3** — `getComputedStyle()` + `var()` round-trip under jsdom is the single point of failure for every visual AC; Phase 0 bootstrap must demonstrate non-empty resolved values.
- **CONS-22 = Architect-R1-5 + CTO-R2-8** — settings-panel JetBrains Mono font flip is intentional and accepted; documented in this lock entry rather than a new AC.

| ID | Source(s) | Concern (one-line) | Phase(s) | Owner during execution | Class |
|---|---|---|---|---|---|
| CONS-01 | CTO-R1-AC-quality §AC-049 + Architect Ack R2 | AC-049 binding tightened in Architect §11 sign-off block to "import styles from '*.module.css' produces non-empty exports object AND `getComputedStyle()` returns non-empty values for at least one custom property." Builder reads §11 to apply; AC-049 text in §5 is the looser parent. | Phase 0 | Builder (apply tighter binding), Reviewer (verify bootstrap test against tightened binding) | QA-test-target |
| CONS-02 | PM-R1-1 / ADR D1 / §8.2 | Token file structure: single `tokens.css` with banner-banded sections; literal substrings `/* === CHROME TOKENS === */` and `/* === CONTENT TOKENS === */` must appear in that order. AC-003's test greps deterministically. | Phase 1 | Builder (add banners), Reviewer (verify literal substrings + order) | QA-test-target |
| CONS-03 | PM-R1-2 / ADR D2 / §9 Phase 2 + Architect Ack R2 | Atomic rename in Phase 2 — no shim aliases at any boundary. Phase 2 must be reviewed/squashed as a single logical commit per §9 Phase 2 completion criteria. AC-055 trivially satisfied; mid-phase commits exposing half-renamed tree are not deployable. | Phase 2 | Builder (atomic delivery), Reviewer (reject per-file sub-commit sequences) | Builder-active-guard + Reviewer-verification |
| CONS-04 | PM-R1-3 + CTO-R1-3 / ADR D3 | Settings-scope IN: 12 `.tsx` + 1 shared `ClaudeSettingsPanel.module.css` (481 lines pre-migration). Phase 4 anti-pattern: do NOT modify any `.tsx` outside the enumerated 12; do NOT touch `claudeConfigStore`, IPC handlers, or main-process code. | Phase 4 | Builder (stay within enumeration), Reviewer (diff scope check) | Builder-active-guard |
| CONS-05 | PM-R1-4 / ADR D9 / §8.8 / §9 Phase 0.5 | Pre-migration baseline capture — 5 fixture files written via one-shot `tests/baseline/capture.test.ts` in Phase 0.5 BEFORE any user-visible edit. Files: `landing-computed-style.json`, `settings-empty-state.json`, `settings-invalid-json-alert.txt`, `settings-tab-switch-pending.json`, `settings-alerts-by-case.json`. | Phase 0.5 | Builder (run capture pre-rename), Reviewer (verify timing + file presence) | Builder-active-guard + QA-test-target |
| CONS-06 | PM-R1-5 / ADR D8 | Empty-state border locked to **solid**, 1.5px, `--empty-state-border-color` `#bfb59a` → 1.71:1 within AC-025 1.5–3.0 range. No dashed branch. | Phase 4 | Builder (apply solid), Reviewer (verify no dashed re-introduction) | QA-test-target |
| CONS-07 | PM-R1-6 / ADR D10 / §8.9 | Lifecycle chip selection = single-select per `HooksTab.tsx:143` `setEvent(e.id)`. AC-022 binds. CSS-class swap `chip` ↔ `chipSelected` (renamed from `railItem`/`railItemActive`). | Phase 4 | Builder (preserve single-select), Reviewer (verify no multi-select drift) | QA-test-target |
| CONS-08 | CTO-R1-1 + PM-R2-IPC-mock (deduped) | IPC mock seam at `tests/mocks/agentconMock.ts` must support all 19 functional regression ACs (AC-026 → AC-044). Mock covers `fs.{readText, writeText, exists, getRoots, readDir, delete, watchStart, watchStop, onWatchEvent}` + `settings.*` + `dialog.*` + `claude.*`. **Sub-concern: AC-042 case 3 (save failure) needs a write-error injection knob** (e.g. `mock.failNextWrite()` or per-path error mapping) — implementation gap, not a planning gap. | Phase 0 (mock surface), Phase 0.5 (capture case 3), Phase 5 (assert case 3) | Builder (extend mock with write-error knob; expose injection ergonomics), Reviewer (scrutinize Phase 0/0.5 mock surface) | Builder-active-guard |
| CONS-09 | CTO-R1-2 + Architect-R1-3 (deduped) | Phase 0.5 `capture.test.ts` deletion/skip-marking — file is deleted or `.skip`-marked in same Phase 0.5 commit. If left runnable, every subsequent phase silently overwrites the baseline fixtures, hollowing the regression net. | Phase 0.5 | Reviewer (verify deletion/skip in same commit), QA (assert via `git log` that Phase 1 commit does not modify baseline files) | Reviewer-verification |
| CONS-10 | PM-R1-10 / ADR D7 / §8.5 | `--border-panel-strong` applied to all six panel categories: `.itemRow` (project-scope cards), settings-tab content panel, form panels, preset cards, chip-group container, `.errorBanner`. No category dropped. | Phase 4 | Builder (apply to all six), Reviewer (verify no drop) | QA-test-target |
| CONS-11 | PM-R1-11 / §8.11 + ADR D9 | Three alert/error cases enumerated for AC-028 + AC-042: init failure (`ClaudeSettingsPanel.tsx:140`), scope load failure, save failure (`HooksTab.tsx:130`/`:105-107`). Each baseline captured in `tests/baseline/settings-alerts-by-case.json` via Phase 0.5. | Phase 0.5 (capture), Phase 5 (assert) | Builder (capture all three), QA (assert text equality) | QA-test-target |
| CONS-12 | CTO-R1-3 + ADR D3 (resolved at spec; verification carries) | Defer matrix counted at **30 ACs** (1 + 2 + 8 + 19), corrected from "26 ACs" via Architect Acknowledgement R2. Currently dormant since item 7 stays IN. Reviewer verifies ADR D3 line 110 reads "30 ACs (1 + 2 + 8 + 19)" with self-checking arithmetic. | All phases (record-only) | Reviewer (one-time verification of ADR D3) | Reviewer-verification |
| CONS-13 | CTO-R2-5 + Architect-R1-1 + PM-R2-2 (deduped) | AC-013 dev-switch contrast disjunction — Builder writes Phase 3 test asserting (background-vs-surround OR border-vs-surround ≥3:1). Architect's chosen treatment (ink background + cream border on cream landing) gives 15.5:1 border-vs-surround, which discernibly satisfies AC-013's parenthetical "must be discernible from its surrounding background." PM accepts disjunction for this run. If a future revision narrows AC-013 to literal-`background-color`-only, dev-switch design needs revisiting (D14 mentions brighter border + shadow). | Phase 3 | Builder (write disjunction test), Reviewer (scrutinize AC-013 test binding language at Phase 3 review) | QA-test-target |
| CONS-14 | Architect-R1-2 / ADR D2 / §8.3 | Phase 2 file count exceeds ≤5 soft cap (≤12 files). Justified per ADR D2: rename is mechanical, splitting leaves codebase non-functional at boundary. Reviewer verifies diff is genuinely find/replace + no logic edits; if any logic change appears in Phase 2, reject. | Phase 2 | Reviewer (logic-change rejection at Phase 2 review) | Reviewer-verification |
| CONS-15 | CTO-R1-4 + PM-R1-4 / ADR D10 / §8.9 (deduped) | "Whichever pre-migration behavior" disjunctions resolved against named branches verified against existing code: AC-031 = discarded (`HooksTab.tsx:36-39` useEffect resets); AC-032 = not-gated/last-write-wins (`claudeConfigStore.ts:357-372`); AC-035 = discarded (same useEffect); AC-040 = open-editor (`HooksTab.tsx:399-406` setDraft only); AC-022 = single-select (`HooksTab.tsx:143`); AC-017 = CSS class swap (`HooksTab.tsx:144-146`). Phase 4 must not change `useEffect` dependency array at `HooksTab.tsx:36-39` or AC-031/AC-035 binding shifts. | Phase 4 | Builder (preserve `useEffect` reset semantics), Reviewer (scrutinize HooksTab.tsx diff against the cited line ranges) | Builder-active-guard + Reviewer-verification |
| CONS-16 | Architect-R1-7 / Phase 4 completion criteria | `--accent-primary` removal in Phase 4 is permanent. Architect grep-verified no consumer outside `src/panels/claude-settings/`, `src/styles/tokens.css`, `App.tsx`. Builder re-runs `grep -rn "\-\-accent-primary" src/` at Phase 4 exit; if any consumer found that wasn't anticipated, escalate, do not silently leave a stranded reference. | Phase 4 | Builder (re-run grep at Phase 4 exit, escalate on unexpected consumer) | Builder-active-guard |
| CONS-17 | CTO-R2-3 + Architect Ack R2 watching #3 (deduped) | Phase 2 + Phase 4 squash-as-one-commit discipline — both phases delivered as single commit (or squash-merged). Mid-phase commits exposing new class names against old CSS (or vice versa, or `--accent-primary` deleted before consumers rewritten) are not deployable. Now landed in §9 completion criteria for both phases. | Phase 2, Phase 4 | Reviewer (reject per-file sub-commit sequences) | Reviewer-verification |
| CONS-18 | CTO-R2-4 + Architect Ack R2 watching #4 (deduped) | `::selection` token flip locked to Phase 3 alongside `:focus-visible` — both rules in same `tokens.css:144-153` block, no Builder discretion. New token `--accent-red-bg` already exists from Phase 1. AC-005 unaffected (Phase 3 removes chrome-side; Phase 4 removes settings-side + token definitions). | Phase 3 | Builder (flip both in Phase 3), Reviewer (verify both flipped together, no Builder discretion exercised) | Reviewer-verification |
| CONS-19 | CTO-R2-1 + Architect Ack R2 fix 1 (deduped) | Matrix arithmetic correction landed: ADR D3 reads "30 ACs (1 + 2 + 8 + 19)" with self-checking arithmetic. Verification only — Reviewer confirms ADR D3 content on first pass. PRD §8.1 enumerates ranges without a tally string (no edit needed). | Pre-Phase-0 (one-time) | Reviewer (one-time ADR D3 verification) | Reviewer-verification |
| CONS-20 | CTO-R2-2 + Architect Ack R2 fix 2 (deduped) | Cold-start performance bound WITHDRAWN. Two remaining bounds (CSS bundle ≤1.3x; settings CSS module ≤1.5x line count) carry the perf-OFF commitment and are measurable. Reviewer confirms no cold-start measurement deliverable was added to any phase. | All phases (record-only) | Reviewer (one-time confirmation of withdrawal) | Reviewer-verification |
| CONS-21 | Architect-R1-4 + CTO-R2-6 + PM-R2-3 (deduped) | Phase 0 bootstrap test must demonstrate `getComputedStyle() + var()` round-trip works under jsdom for at least one CSS custom property (non-empty resolved value). If round-trip fails, every visual AC collapses and the regression net is hollow. Builder MUST NOT advance past Phase 0 without a non-empty resolved value. Fallback: happy-dom or extract values from CSSOM directly. | Phase 0 | Builder (do not advance past Phase 0 with hollow bootstrap), Reviewer (verify non-empty resolved value in Phase 0 attempt note) | Builder-active-guard |
| CONS-22 | Architect-R1-5 + CTO-R2-8 (deduped) | Settings panel body monospace flips from system stack to JetBrains Mono via `--font-mono` collision. Intentional and accepted per migration thesis (ADR D6). Not locked in any AC. Subjective "looks weird" QA reactions are out-of-band, not AC failures. Documented in this lock entry instead of a new AC. | Phase 4 (visible at flip), Phase 5 (no AC asserts pre-migration `font-family`) | Builder (apply the rename), Reviewer (do not treat as a regression) | (informational — accepted change) |
| CONS-23 | Phase 0.5 QA adjudication (path a) + Phase 0.5 Reviewer routing (Option b) — fresh discovery | AC-028 binds to the IPC-rejection trigger path, NOT a malformed-JSON parse path. Pre-migration code at `src/stores/claudeConfigStore.ts:274-281` silently swallows JSON parse failures (`parsedSettings = null` with no `scopeData.error` set); only `fs.readText` rejections fire the `errorBanner`. The captured fixture `tests/baseline/settings-invalid-json-alert.txt` reflects the IPC-failure text. Phase 5 Builder MUST use an IPC `readText` rejection (mock rejection) — not a malformed-JSON entry in the fake-fs Map — when writing the AC-028 assert leg. Canonical lock in ADR D10 Addendum A. | Phase 5 | Builder (use IPC rejection trigger in AC-028 assert leg), QA (verify trigger mechanism in Phase 5 test review) | Builder-active-guard + QA-test-target |

---

### Downstream guidance

**Builder must actively guard against** (implementation-time hazards — if Builder lets one slip, QA or Reviewer downstream may not catch it cheaply):

- **CONS-03** — atomic Phase 2 rename, no shim aliases at any boundary, single-commit/squash delivery.
- **CONS-04** — stay within the 12 enumerated `.tsx` files in Phase 4; do NOT touch `claudeConfigStore`, IPC handlers, or main-process code.
- **CONS-05** — run baseline capture in Phase 0.5 BEFORE any user-visible edit; capture must precede any token rename.
- **CONS-08** — extend `agentconMock.ts` with a write-error injection knob for AC-042 case 3 save-failure baseline; do not silently skip case 3.
- **CONS-15** — preserve `useEffect` reset semantics at `HooksTab.tsx:36-39` and the `saveSettings` non-gated shape at `claudeConfigStore.ts:357-372`. Phase 4's "minor .tsx touch-ups" must not change these dependency arrays or move the reset logic. AC-031 / AC-035 / AC-032 binding depends on these.
- **CONS-16** — re-run `grep -rn "\-\-accent-primary" src/` at Phase 4 exit; escalate on any unanticipated consumer; do not silently leave a stranded reference.
- **CONS-17** — Phase 2 and Phase 4 each delivered as one commit (or squash-merged on integration). Mid-phase commits with broken intermediate states are rejected.
- **CONS-21** — do not advance past Phase 0 with a hollow bootstrap test. The `getComputedStyle() + var()` round-trip under jsdom is the single point of failure for every visual AC.

**Reviewer-only verification points** (downstream-only checks — Builder cannot self-verify these without reviewer-level diff context):

- **CONS-09** — `tests/baseline/capture.test.ts` is deleted or `.skip`-marked in the same Phase 0.5 commit. Verify via `git log` that the Phase 1 commit does not modify any `tests/baseline/*.json` files.
- **CONS-12** — one-time verification on first pass that ADR D3 line 110 reads "30 ACs (1 + 2 + 8 + 19)" and that the matrix enumeration (AC-009, AC-015–AC-016, AC-018–AC-025, AC-026–AC-044) is unchanged.
- **CONS-14** — at Phase 2 review, verify the diff is genuinely find/replace + no logic edits. Any logic change in Phase 2 is grounds for rejection.
- **CONS-17** — reject per-file sub-commit sequences at Phase 2 and Phase 4 review.
- **CONS-18** — at Phase 3 review, verify both `:focus-visible` and `::selection` flipped together in `tokens.css:144-153` with no Builder discretion exercised.
- **CONS-19** — one-time confirmation of ADR D3 arithmetic correction.
- **CONS-20** — one-time confirmation that no cold-start measurement deliverable was added to any phase.

**QA test targets** (these become explicit assertions in the test suite — this run has a real test runner):

- **CONS-01** — Phase 0 bootstrap test asserts `import styles from '*.module.css'` produces non-empty exports object AND `getComputedStyle()` returns non-empty values for at least one custom property.
- **CONS-02** — `tests/landing-regression.test.tsx` (or equivalent) asserts both `=== CHROME TOKENS ===` and `=== CONTENT TOKENS ===` substrings appear in `tokens.css` in that order.
- **CONS-05** + **CONS-11** — `tests/settings-regression.test.tsx` asserts post-migration render against each of the 5 baseline fixtures.
- **CONS-06** — Phase 5 test asserts empty-state border = solid, 1.5px, color `#bfb59a`, contrast ≥1.5:1 ≤3.0:1 against cream surround.
- **CONS-07** — Phase 5 Hooks-tab test asserts single-select chip semantics (clicking chip B deselects chip A).
- **CONS-08** — Phase 5 alert test exercises three alert/error cases including write-failure case 3 via mock injection knob.
- **CONS-10** — Phase 5 test asserts `--border-panel-strong` applied to each of six panel categories.
- **CONS-13** — Phase 3 dev-switch test asserts disjunction (background-vs-surround ≥3:1 OR border-vs-surround ≥3:1).
- **CONS-21** — Phase 0 bootstrap test demonstrates `getComputedStyle() + var()` round-trip under jsdom.
- Hooks-tab scroll addendum (Architect §8.10, PM R2 watching #12) — Phase 5 mounts Hooks tab with tall fixture, asserts `scrollHeight > clientHeight` on `.tabBody`. Trivially passes if `.tabBody overflow-y: auto` survives Phase 4 unchanged.

---

### Handoff

**PRD is LOCKED. No further edits to sections 1–10 without re-opening consensus** (which requires re-invoking CTO sign-off). Section 11 is append-only after this point.

The pipeline now advances to **Builder, starting with Phase 0 (Test runner setup — vitest + Testing Library + jsdom + CSS Modules pass-through + IPC mock seam at `tests/mocks/agentconMock.ts` + example test demonstrating `getComputedStyle() + var()` round-trip; AC-047 / AC-048 / AC-049 / AC-050).**

**Builder's first action** is exploration against the Phase 0 reference files listed in §9 (ADR D4, D5, D6, the existing `package.json`, and `vite.config.ts`).

**First runtime obligations** (Phase 0 exit gates, in order of criticality):
1. **CONS-21** — bootstrap test demonstrates `getComputedStyle() + var()` round-trip under jsdom returns a non-empty resolved value for at least one CSS custom property. **DO NOT advance past Phase 0 with a hollow bootstrap.** This is the single point of failure for every visual AC in the run.
2. **CONS-01** — Phase 0 example test asserts both halves of the AC-049 tightening (non-empty exports object AND non-empty computed-style values).
3. **CONS-08** — `agentconMock.ts` exports `installAgentconMock(initialFs?)` covering `fs.{readText, writeText, exists, getRoots, readDir, delete, watchStart, watchStop, onWatchEvent}` + `settings.*` + `dialog.*` + `claude.*`, AND exposes a write-error injection ergonomic for AC-042 case 3 (Builder picks the API shape; document in attempt note).

After Phase 0 exits clean, Phase 0.5 follows immediately (baseline capture; CONS-05 + CONS-11 + CONS-09 are the obligations there).

---

### Architect Acknowledgement (Round 3) — 2026-05-05 (Phase 0 ADR addenda)

Append-only acknowledgement of two ADR-shaped findings surfaced during Phase 0 execution. No section 1–10 edits, no consensus reopened.

- **D4 addendum landed.** Two forced corrections from Phase 0 are now recorded inline below ADR D4 as "Addendum A — 2026-05-05 (Phase 0 forced corrections)": (a) vitest version corrected from `^2` to `^4.1.5` with the vite-7 peer-alignment explanation, and (b) `css.include: [/\.module\.css$/]` added to the documented Vitest test config so the snippet matches the committed `vitest.config.ts` and CONS-01's non-empty-exports obligation is falsifiable. Cross-references: Reviewer Phase 0 SUGGESTION 1 + Phase 0 Build Summary "Deviations from PRD/ADR" items 1 and 2 (both retroactively authorized via this addendum).
- **D17 created.** New ADR entry locks the `getPropertyValue('--token-name')` (Direction 1) pattern as the only valid primary assertion mechanism for token-driven visual ACs in Phases 4 and 5, given jsdom 25's empirically-verified inability to resolve `var()` chains in computed-style readouts (Direction 2). Per-file happy-dom escape hatch documented for the unlikely case a future AC cannot be reformulated as Direction 1. Cross-references: Reviewer Phase 0 SUGGESTION 2 / CONS-21 ("CONS-21 Documentation Recommendation") + Phase 0 Build Summary §"CONS-21 Verification Result."

No other changes; consensus not reopened. Pipeline continues to Phase 0.5.

### Architect Acknowledgement (Round 4) — 2026-05-05 (Phase 0.5 D10 addendum + CONS-23)

Append-only acknowledgement of an AC-028 binding ambiguity surfaced during Phase 0.5 baseline capture: Builder discovered the pre-migration code silently swallows JSON parse errors so the `errorBanner` does not render for malformed-JSON content; QA adjudicated path (a) (captured fixture is correct, AC-028's "invalid JSON" prose binds to the IPC-rejection trigger path); Reviewer routed Option (b) (D10 addendum + CONS-23 reinforcement). No section 1–10 edits, no consensus reopened.

- **D10 Addendum A landed.** ADR D10 now carries a seventh locked branch alongside the original six: AC-028's trigger path is locked to the IPC `readText` rejection (caught at `src/stores/claudeConfigStore.ts:346-353`, which sets `scopeData.error`), not the silent-swallow JSON parse path at `claudeConfigStore.ts:274-281`. Phase 5's AC-028 assert leg MUST mock `fs.readText` to reject; a malformed-JSON entry in the fake-fs Map will not trigger the alert and will produce a false-failed test. Cross-references: Phase 0.5 QA verdict §"Step 4: AC-028 Ambiguity Adjudication" (path (a)) and Phase 0.5 Reviewer verdict §"Item 1: AC-028 Binding Interpretation — Routing Recommendation" (Option (b)).
- **CONS-23 created.** Durable record in the consensus ledger above (between CONS-22 and the Downstream guidance section). Classified Builder-active-guard + QA-test-target for Phase 5: Builder owns the trigger mechanism in the AC-028 assert leg, QA owns verification in Phase 5 test review. Canonical lock cross-references ADR D10 Addendum A.

No other changes; consensus not reopened. Pipeline continues to Phase 1.

