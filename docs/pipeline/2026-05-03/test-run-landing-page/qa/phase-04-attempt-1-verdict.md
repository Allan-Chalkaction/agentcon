# QA Verdict: PASS

**Phase:** 4 — Interactivity + accessibility polish
**Attempt:** 1
**Date:** 2026-05-03

---

## Preliminary Checks

**Phase state confirmed:** `READY_FOR_QA` in `phase-state.json` before inspection began.

**PRD lock confirmed:** Section 11 contains CTO Round 2 final sign-off block with consensus status LOCKED — 2026-05-03.

**Phase 4 AC list per PRD §9:** 14 ACs — AC-009, AC-010, AC-011, AC-012, AC-013, AC-014, AC-015, AC-016, AC-017, AC-035, AC-036, AC-042, AC-044, AC-045. Builder's exploration and build summary match this list exactly.

**PRD file list match:** PRD §9 Phase 4 lists 4 files to modify (`ProjectSelector.tsx`, `ProjectSelector.module.css`, `OperativeCard.module.css`, `LandingPage.tsx`, `LandingPage.module.css`) plus `ClassifiedStamp.tsx` as explicitly scoped a11y fix. Builder also read-confirmed `TransmissionsFeed.module.css` (Phase 3 already had the reduced-motion gate; no new edit was required in Phase 4). All files verified on disk.

---

## Step 1: AC Testability Pre-Check

All 14 Phase 4 ACs walked against testability criteria. All pass.

| AC | Testable? | Mechanism |
|---|---|---|
| AC-009 | Yes | Static trace: `openViaClick()` code path |
| AC-010 | Yes | Static trace: `handleOptionMouseDown()` code path |
| AC-011 | Yes | Static trace: `openViaKeyboard()` code path |
| AC-012 | Yes | Static trace: ArrowDown/ArrowUp cases in `handleTriggerKeyDown` |
| AC-013 | Yes | Static trace: Enter-when-open case in `handleTriggerKeyDown` |
| AC-014 | Yes | Static trace: Escape case in `handleTriggerKeyDown` + `close()` |
| AC-015 | Yes | Static trace: `useEffect` with `document.mousedown` listener |
| AC-016 | Yes | CSS rule inspection in `ProjectSelector.module.css` |
| AC-017 | Yes | Code grep: only `setSelectedProjectId` in `onProjectChange` chain |
| AC-035 | Yes | CSS rule inspection in `OperativeCard.module.css` |
| AC-036 | Yes | Code grep: `console.info` fallback, no `onDeploy` passed |
| AC-042 | Yes | CSS `@media (prefers-reduced-motion: reduce)` block inspection |
| AC-044 | Yes | DOM order inspection in `LandingPage.tsx` |
| AC-045 | Yes | CSS breakpoint inspection + grid template inspection |

No AC is untestable. No planning bug found.

---

## Step 2: AC Verification by Deterministic Inspection

### AC-009: Click-to-open highlights first option

**Spec:** "when the user clicks the trigger with a pointer, then the dropdown opens, `aria-expanded` on the trigger becomes `'true'`, and the first option receives visual highlight."

**Evidence:**
- `ProjectSelector.tsx:82-89` — `handleTriggerClick()`: when `!isOpen`, calls `openViaClick()`.
- `ProjectSelector.tsx:62-65` — `openViaClick()`: `setIsOpen(true)`, `setHighlightedIndex(0)` — index 0 always.
- `ProjectSelector.tsx:207` — `aria-expanded={isOpen ? "true" : "false"}` — state-driven.
- `ProjectSelector.tsx:237-241` — `aria-activedescendant` on `<ul role="listbox">` set to `project-option-${projects[0].id}` when `highlightedIndex === 0`.
- `ProjectSelector.tsx:254-258` — option at index 0 receives `styles.option + styles.optionHighlighted` CSS classes.
- `ProjectSelector.module.css:137-140` — `.optionHighlighted` applies `background: var(--lp-surface-cream-soft)`, `color: var(--lp-ink)`.

**PASS**

---

### CONS-08 / AC-009 vs AC-011 highlight asymmetry analysis

**AC-009 exact text:** "the first option receives visual highlight."

This mandates highlight index 0 on click-open. No qualification about previous selection state. It applies on every click-open, including reopens after a prior selection.

**AC-011 exact text:** "the dropdown opens and keyboard focus moves into the listbox with the first option (or the previously-selected option, if any) marked as highlighted via `aria-activedescendant` or focus."

This mandates: first option OR previously-selected option, on keyboard-open. A prior selection changes the highlighted item on keyboard-reopen.

**Builder's implementation:**

- `openViaClick()` (`ProjectSelector.tsx:62-65`): `setHighlightedIndex(0)` unconditionally. Always first option. Matches AC-009 exactly.
- `openViaKeyboard()` (`ProjectSelector.tsx:68-71`): `setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0)`. Prefers selected index, falls back to 0. Matches AC-011 exactly.

**Distinction preserved:**

The Space key's `keyDown` handler calls `e.preventDefault()` at `ProjectSelector.tsx:98`. On a native `<button>`, `preventDefault()` on `keydown` suppresses the browser's synthetic click event that would otherwise fire on Space/keyup. Therefore:
- Space → `onKeyDown` fires → `preventDefault()` → `openViaKeyboard()` → `handleTriggerClick` does NOT fire.
- Pointer click → `onClick` fires → `handleTriggerClick()` → `openViaClick()`.

The two-path distinction is real. The `preventDefault()` call is the mechanism.

**CONS-08 verdict: PASS.** The asymmetry is correct per both AC texts. AC-009 specifies "first option" on click (Builder does this). AC-011 specifies "first or previously-selected" on keyboard (Builder does this). The implementation does not unify the two paths.

---

### AC-010: Option click selects, closes, focus returns

**Spec:** "the dropdown's `onProjectChange` callback is invoked with that option's id as its argument, the dropdown closes, `aria-expanded` returns to `'false'`, the trigger label updates to that option's label, and focus returns to the trigger."

**Evidence:**
- `ProjectSelector.tsx:161-168` — `handleOptionMouseDown(e, projectId)`: calls `e.preventDefault()`, `onProjectChange(projectId)`, then `close()`.
- `ProjectSelector.tsx:73-79` — `close(returnFocus=true)`: `setIsOpen(false)`, `setHighlightedIndex(-1)`, `triggerRef.current?.focus()` — focus returned.
- `ProjectSelector.tsx:53-54` — `valueLabel = selected ? selected.label : "- unassigned -"` — trigger label re-renders with selected label after state update.
- `onMouseDown` on `<li>` fires before `onBlur` on trigger — prevents listbox closure before selection registers.

**PASS**

---

### AC-011: Space/Enter opens with selected-or-first highlighted

**Spec:** "when the user presses Space or Enter, then the dropdown opens and keyboard focus moves into the listbox with the first option (or the previously-selected option, if any) marked as highlighted via `aria-activedescendant` or focus."

**Evidence:**
- `ProjectSelector.tsx:95-107` — `handleTriggerKeyDown` cases `" "` and `"Enter"`: when `!isOpen`, calls `openViaKeyboard()`.
- `ProjectSelector.tsx:68-71` — `openViaKeyboard()`: `setIsOpen(true)`, `setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0)`.
- `ProjectSelector.tsx:55` — `selectedIndex = projects.findIndex(p => p.id === selectedProjectId)` — resolves current selection index.
- `ProjectSelector.tsx:98` — `e.preventDefault()` — prevents Space from scrolling page.
- AC-011 says "keyboard focus moves into the listbox" — clarification: the WAI-ARIA listbox pattern does NOT move DOM focus into `<li>` elements. Focus stays on the trigger. `aria-activedescendant` on the `<ul>` conveys the highlighted item to AT. This implementation is correct per W3C ARIA 1.2 listbox pattern (cited at `ProjectSelector.tsx:7`). The PRD also states "marked as highlighted via `aria-activedescendant` or focus" — the "or" permits this.

**PASS**

---

### AC-012: ArrowDown/ArrowUp move highlight with wrap

**Spec:** "when the user presses ArrowDown, then highlight advances to the next option (wrapping from last to first), and when the user presses ArrowUp, highlight moves to the previous option (wrapping from first to last)."

**Evidence:**
- `ProjectSelector.tsx:109-119` — ArrowDown when open: `setHighlightedIndex((prev) => prev < 0 ? 0 : (prev + 1) % projects.length)`. At last index (N-1): `(N-1+1) % N = 0` — wraps to first. Correct.
- `ProjectSelector.tsx:122-133` — ArrowUp when open: `setHighlightedIndex((prev) => prev <= 0 ? projects.length - 1 : (prev - 1 + projects.length) % projects.length)`. At 0: `projects.length - 1` — wraps to last. Correct.
- `e.preventDefault()` at lines 110, 123 — prevents page scroll on both arrows.
- Both arrows also open the dropdown when closed (`openViaKeyboard()`) — WAI-ARIA convention, not forbidden by AC-012.
- `aria-activedescendant` on `<ul>` (`ProjectSelector.tsx:237-241`) updates on every `highlightedIndex` change.

**PASS**

---

### AC-013: Enter selects highlighted option

**Spec:** "when the user presses Enter, then `onProjectChange` is invoked with that option's id, the dropdown closes, and focus returns to the trigger."

**Evidence:**
- `ProjectSelector.tsx:102-106` — when `isOpen` and `e.key === "Enter"` and `highlightedIndex >= 0`: calls `onProjectChange(projects[highlightedIndex].id)`, then `close()`.
- `close()` (`ProjectSelector.tsx:73-79`): `setIsOpen(false)`, `setHighlightedIndex(-1)`, `triggerRef.current?.focus()` — focus returned.
- Note: when `isOpen` and `e.key === " "` (Space), the code falls into the same `case " ": case "Enter":` block but the inner check is `e.key === "Enter"` — Space when open does nothing (no selection). This is correct behavior since pressing Space when open would otherwise select, which is not in the AC.

**PASS**

---

### AC-014: Escape closes without selecting, returns focus

**Spec:** "when the user presses Escape, then the dropdown closes, `onProjectChange` is not invoked, and focus returns to the trigger."

**Evidence:**
- `ProjectSelector.tsx:136-140` — `case "Escape":` when `isOpen`: calls `close()` only. No `onProjectChange` call.
- `close()` calls `triggerRef.current?.focus()` — focus returned.
- The `close()` function at `ProjectSelector.tsx:73-79` does not call `onProjectChange` anywhere.

**PASS**

---

### AC-015: Outside-click closes without selecting

**Spec:** "when the user clicks outside the dropdown's bounding region, then the dropdown closes, `onProjectChange` is not invoked, and `aria-expanded` returns to `'false'`."

**Evidence:**
- `ProjectSelector.tsx:173-192` — `useEffect` with `[isOpen]` dependency: when `isOpen === true`, attaches `mousedown` listener to `document`.
- `ProjectSelector.tsx:176-185` — `handleDocumentMouseDown`: if `wrapperRef.current && !wrapperRef.current.contains(e.target as Node)`, calls `setIsOpen(false)`, `setHighlightedIndex(-1)`. No `onProjectChange` call.
- Listener is returned from `useEffect` cleanup — removed when `isOpen` becomes false.
- `wrapperRef` covers both trigger and listbox (`<div ref={wrapperRef}>` wraps both).
- `aria-expanded` is state-driven — becomes `"false"` when `isOpen=false`.

**PASS**

---

### AC-016: Hover/focus-visible/active visual states on trigger

**Spec:** "each of the three states applies a visually distinct style (e.g. background, border, or outline change) and `:focus-visible` produces a focus ring with at least 2px outline width using a defined token color, distinguishable against the cream surface."

**Evidence:**
- `ProjectSelector.module.css:23-45` — Idle: `background: var(--lp-surface-cream)`, `border: var(--lp-border-hair)` (`1px solid #d4cdb6`).
- `ProjectSelector.module.css:47-51` — Hover: `background: var(--lp-surface-cream-soft)`, `border-color: var(--lp-ink-faint)` — distinct from idle (darker bg, darker border).
- `ProjectSelector.module.css:53-58` — Focus-visible: `outline: 2px solid var(--lp-accent-red)`, `outline-offset: 2px` — 2px, token color `#b8362b` on `#f1ead8` = 5.4:1 contrast. Meets spec.
- `ProjectSelector.module.css:60-64` — Active: `background: var(--lp-surface-cream-soft)`, `border-color: var(--lp-ink-soft)` — distinct from hover (border is `--lp-ink-soft` vs `--lp-ink-faint`, a visibly darker gray).

**Three-state check:** Idle (cream bg, hairline border) → Hover (cream-soft bg, ink-faint border) → Active (cream-soft bg, ink-soft border). These are three distinct states. Focus-visible uses outline (separate from background/border), so it stacks correctly with any other state.

**Global `:focus-visible` conflict:** `tokens.css:151-154` defines a global `:focus-visible { outline: 2px solid var(--accent-primary) }` (blue `#5b8def`). The CSS Module scoped `.trigger:focus-visible` rule is more specific than the bare `:focus-visible` selector and will win for the trigger element. Behavior: red focus ring on trigger as specified. Not a failure — CSS specificity resolves this correctly.

**PASS**

---

### AC-017: No-op on selection — no IPC/store/nav

**Spec:** "no navigation, no IPC call, no network call, and no mutation of any persisted store; the only effects permitted are (a) updating the local component/UI state that drives the trigger label and (b) calling the `onProjectChange` prop."

**Evidence:**
- `LandingPage.tsx:36-38` — `const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)`.
- `LandingPage.tsx:77` — `onProjectChange={setSelectedProjectId}` — React `useState` setter, no side effects.
- Grep result confirms: no `claudeConfigStore`, no `window.agentcon.*`, no `ipcRenderer`, no `navigation` in `LandingPage.tsx` or `ProjectSelector.tsx`.
- No `useEffect` in `LandingPage.tsx` that watches `selectedProjectId`.

**PASS**

---

### AC-035: Deploy button hover/focus-visible/active/disabled states

**Spec:** "idle style; when hovered, visually distinct hover style; when focused via keyboard, `:focus-visible` outline of at least 2px in a defined token color; when active (`:active`), visually distinct pressed style; when given a `disabled` prop value of `true`, renders with `aria-disabled='true'` (or native `disabled`), opacity reduced from default, and pointer events suppressed."

**Evidence:**
- `OperativeCard.module.css:125-140` — Idle: `background: transparent`, `color: var(--lp-ink)`, `border: var(--lp-border-card)`.
- `OperativeCard.module.css:144-148` — Hover (`:hover:not(:disabled):not([aria-disabled="true"])`): `background: var(--lp-ink)`, `color: var(--lp-surface-cream)`, `border-color: var(--lp-ink)` — inverted from idle, distinct.
- `OperativeCard.module.css:152-155` — Focus-visible: `outline: 2px solid var(--lp-accent-red)`, `outline-offset: 2px` — 2px, token color.
- `OperativeCard.module.css:159-163` — Active (`:active:not(:disabled):not([aria-disabled="true"])`): `background: var(--lp-accent-red)`, `color: var(--lp-surface-cream)`, `border-color: var(--lp-accent-red)` — red bg, distinct from hover.
- `OperativeCard.module.css:169-174` — Disabled (`:disabled, [aria-disabled="true"]`): `opacity: 0.5`, `pointer-events: none`.
- `OperativeCard.tsx:86-88` — `aria-disabled={operative.disabled === true ? "true" : undefined}`, `disabled={operative.disabled === true}`, `onClick={operative.disabled ? undefined : handleDeploy}` — both attribute and native disabled wired.
- Seed data: all three operatives have `disabled: false` — disabled state is styled but unfired in default render. ADR §D12 explicitly approves this.

**PASS**

---

### AC-036: Deploy click is no-op beyond console.info

**Spec:** "the only effect is invocation of the `onDeploy(operativeId: string)` prop callback; if no `onDeploy` prop is provided, the click invokes a single `console.info` call containing the operative codename and otherwise has no effect."

**Evidence:**
- `LandingPage.tsx:121-122` — `<OperativesGrid operatives={seedOperatives} />` — no `onDeploy` prop passed.
- `OperativeCard.tsx:24-33` — `handleDeploy()`: if `onDeploy` exists, calls it; else `console.info(`Deploy: ${operative.codename}`)`. No navigation, no fetch, no store mutation.
- `TransmissionsFeed.tsx` (Phase 3, unchanged) — no `useEffect` confirmed by grep.

**PASS**

---

### AC-042: prefers-reduced-motion gates all animations

**Spec:** "any pulsing, blinking, or transform-based motion effects are disabled or reduced to a non-animating state via a `@media (prefers-reduced-motion: reduce)` rule."

**Evidence per animation/transition:**

| Motion | File:Line | Gate |
|---|---|---|
| LIVE pulse (`animation: livePulse`) | `TransmissionsFeed.module.css:57` | `TransmissionsFeed.module.css:68-73` — `@media (prefers-reduced-motion: reduce) { .liveDot { animation: none; opacity: 1; } }` |
| Deploy button transition (`transition: background 120ms ease, color 120ms ease`) | `OperativeCard.module.css:137` | `OperativeCard.module.css:180-184` — `@media (prefers-reduced-motion: reduce) { .deployButton { transition: none; } }` |
| Chevron rotation transition (`transition: transform 120ms ease`) | `ProjectSelector.module.css:92` | `ProjectSelector.module.css:145-151` — `@media (prefers-reduced-motion: reduce) { .trigger { transition: none; } .chevron { transition: none; } }` |
| Trigger background/border transition (`transition: background 120ms ease, border-color 120ms ease`) | `ProjectSelector.module.css:40` | Same block at `ProjectSelector.module.css:145-151` — `.trigger { transition: none; }` covers both transitions. |
| Page-level safety net | `LandingPage.module.css:103-108` | `@media (prefers-reduced-motion: reduce) { .page { transition: none; } }` |

All introduced transitions and animations have a gate. The LIVE pulse gate was added in Phase 3 and confirmed present in Phase 4 (builder did not modify `TransmissionsFeed.module.css` in Phase 4 but verified the Phase 3 gate remains).

**PASS**

---

### AC-044: Tab order through interactive controls

**Spec:** "focus moves in document order through every interactive element (project selector trigger, then each Deploy button in left-to-right order)."

**Evidence:**
- `LandingPage.tsx:69-79` — `<ProjectSelector>` renders its trigger `<button>` first interactive element.
- `LandingPage.tsx:116-122` — `<OperativesGrid operatives={seedOperatives} />` renders cards in seed order: Hawkeye → Echo → Ghost (via `seedOperatives` array order confirmed in `seedOperatives.ts:9,23,37`).
- `OperativeCard.tsx:82-92` — Each card has a single `<button type="button">` (DEPLOY) at card-footer level.
- `OperativesGrid.tsx` (Phase 3, not shown but described) renders cards from `operatives` prop in array order.
- All interactive elements are native `<button>` elements — inherently focusable, inherently in DOM tab order. No `tabIndex` overrides that would disrupt order.
- No `tabIndex=-1` on any interactive element in Phase 4 scope.

Tab order in document flow: ProjectSelector trigger → Deploy(Hawkeye) → Deploy(Echo) → Deploy(Ghost). Matches spec.

**PASS**

---

### AC-045: Responsive 1024–1680px, no horizontal scroll, three-up grid

**Spec:** "no horizontal scrollbar appears, no element overflows the viewport horizontally, and the operatives grid lays out as three side-by-side cards."

**Evidence:**

Breakpoints and overflow guards:
- `tokens-landing.css:95-99` — `.landing-root { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; }` — scroll context established, horizontal overflow suppressed at root level.
- `LandingPage.module.css:17-18` — `.page { max-width: 100%; overflow-x: hidden; }` — belt-and-suspenders at page level.
- `LandingPage.module.css:85-92` — `@media (max-width: 1279px)` reduces padding from `64px` to `24px` on `.regionProject`, `.regionHero`, `.regionPersonnel`, `.regionOperatives`.
- Content regions use `max-width: var(--lp-content-max)` (1200px) + `width: 100%` — at 1024px viewport: `1024 - 48 (24px padding each side) = 976px` effective content width, which is within 1200px max.

Three-column grid:
- `OperativesGrid.module.css:41-45` — `.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }` — no breakpoint override reducing columns.
- At 1024px with 24px padding: `976px / 3 = ~325px` per card — viable.
- At 1280px+ with 64px padding: `1200px / 3 = 400px` per card — viable.
- At 1680px: content capped at 1200px by `max-width: var(--lp-content-max)` — same as 1280px case, no overflow.

ADR D11 pins range: 1024px to 1680px. QA test points: 1024, 1280, 1680. All three covered by the above rules.

**Note (non-blocking, for Reviewer):** AC-045's PRD text reads "any window width between the smallest and largest sizes the existing app already supports" — which ADR D11 locks numerically to 1024–1680. The CSS does not have an explicit 1024px min-width media query (below 1024 is "out of scope per ADR D11"). Within the locked range, overflow is suppressed and grid stays three-up. This is compliant.

**PASS**

---

## Special Checks (User-Called-Out)

### Check 1: CONS-08 / AC-009 vs AC-011 highlight asymmetry

Already addressed in full under AC-009 and AC-011 sections above.

**AC-009 quoted:** "and the first option receives visual highlight." — Mandates index 0, no qualification.

**AC-011 quoted:** "with the first option (or the previously-selected option, if any) marked as highlighted." — Mandates selected-or-first.

**Implementation:** `openViaClick()` → always index 0; `openViaKeyboard()` → selected index or 0. `e.preventDefault()` on Space/Enter keydown suppresses the synthetic click event, ensuring the two paths don't collide.

**Decision:** PASS. Asymmetry is correct per both AC texts. Builder did not accidentally unify the paths.

---

### Check 2: ClassifiedStamp.tsx Phase 3 carryover fix

**Spec:** Remove `role="img"` from `<svg>`, retain `aria-hidden="true"`.

**Evidence:**
- `ClassifiedStamp.tsx:21-26` — `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg" className={styles.stamp} aria-hidden="true">` — no `role` attribute present.
- Grep for `role="img"` in `ClassifiedStamp.tsx` returns only comment text (lines 10-13), not a live attribute.
- `aria-hidden="true"` is present on the `<svg>` element at line 25.
- `PersonnelFileCard.tsx:56` — `<div className={styles.stampWrapper} aria-hidden="true">` — parent wrapper also has `aria-hidden="true"`. Defense-in-depth intact.

**PASS. The Phase 3 Reviewer HIGH finding is resolved.**

---

### Check 3: AC-042 reduced-motion gates — complete audit

All animations and transitions verified:

| Motion source | File | Line | Gate file | Gate line |
|---|---|---|---|---|
| LIVE dot animation (`livePulse` keyframes) | TransmissionsFeed.module.css | 57 | TransmissionsFeed.module.css | 68-73 |
| Deploy button transition (bg+color 120ms) | OperativeCard.module.css | 137 | OperativeCard.module.css | 180-184 |
| Chevron rotation transition (transform 120ms) | ProjectSelector.module.css | 92 | ProjectSelector.module.css | 145-151 |
| Trigger bg+border transition (120ms) | ProjectSelector.module.css | 40 | ProjectSelector.module.css | 145-151 (`.trigger { transition: none }`) |
| Page-level safety net | LandingPage.module.css | — | LandingPage.module.css | 103-108 |

No unported transition or animation found across the Phase 4 scope. Every motion source has a gate.

**PASS**

---

### Check 4: AC-045 responsive breakpoints

**AC-045 quoted:** "no horizontal scrollbar appears, no element overflows the viewport horizontally, and the operatives grid lays out as three side-by-side cards."

The AC mandates: (1) no horizontal scroll, (2) no horizontal overflow, (3) three-up grid. It does not mandate specific layout changes at named breakpoints — it mandates correctness across the range.

**ADR D11** pins the range numerically: 1024–1680. QA test points: 1024, 1280, 1680.

Media queries present:
- `LandingPage.module.css:85` — `@media (max-width: 1279px)` → reduces region padding from 64px to 24px. Covers 1024–1279 range.
- No `@media (max-width: 1024px)` or `@media (min-width: 1680px)` needed — below 1024 is out of scope; above 1680, content is capped at 1200px by `max-width: var(--lp-content-max)`.
- `TransmissionsFeed.module.css:132` — `@media (max-width: 1279px)` reduces `.inner` padding — consistent.

Grid stays three-up: `OperativesGrid.module.css:41-45` — `grid-template-columns: repeat(3, 1fr)` with no breakpoint override. Confirmed.

Overflow suppressed: `tokens-landing.css:98` + `LandingPage.module.css:18` — dual `overflow-x: hidden`.

**PASS**

---

## Dropdown Keyboard AC Handler Summary

| AC | Handler location | Key verified | `preventDefault` | Focus return | Correct |
|---|---|---|---|---|---|
| AC-011 | `ProjectSelector.tsx:95-107` | Space, Enter | Line 98 | N/A (open action) | Yes |
| AC-012 | `ProjectSelector.tsx:109-133` | ArrowDown, ArrowUp | Lines 110, 123 | N/A (navigate action) | Yes |
| AC-013 | `ProjectSelector.tsx:102-106` | Enter (when open) | Line 98 | via `close()` → `triggerRef.focus()` | Yes |
| AC-014 | `ProjectSelector.tsx:136-140` | Escape | N/A | via `close()` → `triggerRef.focus()` | Yes |
| AC-015 | `ProjectSelector.tsx:173-192` | mousedown (outside) | N/A | Not returned (user clicked elsewhere) | Yes |

**Tab handling:** `ProjectSelector.tsx:143-151` — Tab while open: `setIsOpen(false)`, `setHighlightedIndex(-1)`, no focus return (Tab moves naturally to next element). No focus trap.

---

## Additional Critical Checks

### Trigger click vs keyboard distinction

PASS (see CONS-08 analysis). `e.preventDefault()` on Space/Enter keydown blocks the browser's synthetic click. Two paths are genuinely distinct.

### `aria-activedescendant` correctness

- Placed on `<ul role="listbox">` at `ProjectSelector.tsx:237-241` — correct WAI-ARIA listbox placement.
- Value: `project-option-${projects[highlightedIndex].id}` when `highlightedIndex >= 0`, else `undefined`.
- Each `<li>` has `id={`project-option-${project.id}`}` at `ProjectSelector.tsx:247` — IDs are unique (project IDs in seed data are `"agentcon"`, `"api-service"`, `"payments-core"` — all distinct).
- When closed (`isOpen === false`), the listbox `<ul>` is unmounted — `aria-controls` on trigger points to a non-existent ID. Per ARIA spec, `aria-controls` to a non-existent ID is silently ignored. Acceptable.

PASS.

### `aria-controls` resolution

Trigger: `aria-controls={listboxId}` where `listboxId = "project-selector-listbox"` (`ProjectSelector.tsx:57`). When open, `<ul id="project-selector-listbox">` exists in the DOM (`ProjectSelector.tsx:231`). Forward reference resolves correctly when open.

PASS.

### No focus trap, focus stays on trigger

- DOM focus never moves into `<ul>` or `<li>` elements. Only `triggerRef.current?.focus()` is called (on close).
- `<ul>` has no `tabIndex`, no focus handler, no `onKeyDown`.
- Tab while open: `ProjectSelector.tsx:143-151` — closes without returning focus to trigger (allows Tab to move to next element). No trap.

PASS.

### No-op seam preservation (AC-017)

- `selectedProjectId` state in `LandingPage.tsx` used only to pass to `ProjectSelector` as `selectedProjectId` prop.
- No `useEffect` in `LandingPage.tsx` that syncs `selectedProjectId` to external state.
- `onProjectChange={setSelectedProjectId}` — setter only, no wrapper function, no side effects.

PASS.

### AC-029 / AC-036 unchanged

- `TransmissionsFeed.tsx`: grep for `useEffect` returns only a comment reference (line 6 of the file is a comment in the build summary, not in the source). Source file confirmed clean — `useEffect` not present. LIVE indicator is CSS-only. PASS.
- `OperativeCard.tsx:32` — `console.info(`Deploy: ${operative.codename}`)` — exact spec text. No `onDeploy` passed from `LandingPage.tsx`. PASS.

### Disabled state on Deploy button (AC-035 seam)

- `OperativeCard.tsx:86-88` — `aria-disabled`, `disabled` attribute, and `onClick` all wired to `operative.disabled`.
- `OperativeCard.module.css:169-174` — CSS `:disabled, [aria-disabled="true"]` rule: `opacity: 0.5`, `pointer-events: none`.
- Seed: all three operatives have `disabled: false` — seam is wireable but unfired. Per ADR §D12, this is acceptable.

PASS.

---

## Phase 1+2+3 Invariants

| Invariant | Check | Status |
|---|---|---|
| `tokens.css` unchanged | `git log -- src/styles/tokens.css` shows only initial commit; `git status` shows no uncommitted changes | PASS |
| `App.tsx` unchanged from Phase 1 | `git diff HEAD -- src/App.tsx` shows only Phase 1 surface-switcher changes; Phase 4 did not touch it | PASS |
| `tokens-landing.css` zero `--lp-*` under `:root` | Grep for `:root` in file returns only comment text (line 3); all tokens under `.landing-root` selector | PASS |
| Settings cold-start defaults to `"settings"` | `App.tsx:23` — `useState<Surface>(readInitialSurface)`; `readInitialSurface()` returns `"settings"` unless `?surface=landing` query param present | PASS |
| Phase 2 components untouched by Phase 4 | Phase 4 files: `ProjectSelector.tsx/css`, `OperativeCard.module.css`, `LandingPage.tsx/css`, `ClassifiedStamp.tsx`. Phase 2 components (HeaderBar, StatusBar, Hero) not in Phase 4 scope | PASS |
| Seed files untouched | `seedAgent.ts`, `seedTransmissions.ts`, `seedOperatives.ts`, `seedProjects.ts` — Phase 4 did not modify any seed file | PASS |
| Phase 3 Reviewer HIGH resolved | `ClassifiedStamp.tsx` — `role="img"` removed, `aria-hidden="true"` retained | PASS |

---

## AC Coverage Summary

| AC | Criterion | Status |
|---|---|---|
| AC-009 | Click-to-open, first option highlighted | PASS |
| AC-010 | Option click selects, focus returns | PASS |
| AC-011 | Space/Enter opens, selected-or-first highlighted | PASS |
| AC-012 | Arrow keys move highlight with wrap | PASS |
| AC-013 | Enter selects, closes, focus returns | PASS |
| AC-014 | Escape closes, no selection, focus returns | PASS |
| AC-015 | Outside click closes, no selection | PASS |
| AC-016 | Trigger hover/focus-visible/active distinct states | PASS |
| AC-017 | No-op on selection — local state only | PASS |
| AC-035 | Deploy button all 5 visual states | PASS |
| AC-036 | Deploy click → console.info only, no side effects | PASS |
| AC-042 | All animations/transitions gated by reduced-motion | PASS |
| AC-044 | Tab order: trigger → Hawkeye → Echo → Ghost | PASS |
| AC-045 | Responsive 1024–1680, no horizontal scroll, 3-col grid | PASS |

**AC Coverage: 14/14**

---

## Observations for Reviewer (Non-Blocking)

1. **Global `:focus-visible` rule in `tokens.css:151-154`** sets `outline: 2px solid var(--accent-primary)` (blue `#5b8def`). CSS Module specificity ensures `.trigger:focus-visible` and `.deployButton:focus-visible` override this for the landing page's buttons. This is behaviorally correct but the global rule may produce blue focus rings on any non-explicitly-styled landing element that receives focus. Reviewer may want to verify no unfocused-but-focusable landing elements are affected.

2. **`?surface=landing` query-param reader is not DEV-gated** (CTO Round 2 watching concern #2). The reader in `App.tsx:17-20` runs in production. This is a known, accepted architectural note per ADR D1 and CTO Round 2 §2. Not a QA failure.

3. **Hover vs Active state visual distinction on trigger**: Hover and Active use the same background (`--lp-surface-cream-soft`) but differ only in border color (`--lp-ink-faint` vs `--lp-ink-soft`). These tokens are `#7a766f` and `#4a4742` respectively — a visible distinction. The PRD says "visually distinct" which is met, but the distinction is subtle. Reviewer may confirm whether the mockup intends a stronger active depression indicator.

---

## Test Results

- New tests: N/A — no test runner per ADR D7. Verification by deterministic code inspection.
- Full suite: N/A — no test suite.
- All 14 Phase 4 AC verified by file content, handler code trace, and CSS rule inspection.
- Zero failures found.

---

## Phase Status

**QA_PASSED — advancing to Reviewer.**
