# Phase 4 Exploration

---

## 1. PRD Lock Confirmation

From PRD Section 11, final line of the lock block:

> **Consensus Status: LOCKED — 2026-05-03**
> **PRD locked at 2026-05-03 (CTO final lock block).**

The LOCKED sentinel is present. Proceeding.

---

## 2. Phase 4 File List (from PRD §9 Phase 4 exactly)

**Modify only — no new files:**

1. `src/panels/landing/components/ProjectSelector.tsx` — full keyboard listbox state machine (open/close, highlight, keyboard handlers)
2. `src/panels/landing/components/ProjectSelector.module.css` — open-state styles, listbox panel, option highlight, chevron rotation
3. `src/panels/landing/components/OperativeCard.module.css` — finalize hover/focus-visible/active/disabled CSS (Phase 3 already has these; Phase 4 verifies and supplements if needed)
4. `src/panels/landing/LandingPage.tsx` — wrap selector with local `useState` for `selectedProjectId`, pass `onProjectChange` updating that state only; document-level click-outside listener can be inside ProjectSelector (implementation decision documented below)
5. `src/panels/landing/LandingPage.module.css` — `prefers-reduced-motion` rules; responsive-range media queries for 1024px breakpoint; confirm 3-col grid across range
6. `src/panels/landing/components/ClassifiedStamp.tsx` — remove `role="img"` from SVG (keep `aria-hidden="true"`) — Phase 3 Reviewer HIGH fix

That is 6 files (5 per PRD + ClassifiedStamp which is the Phase 3 Reviewer HIGH fix explicitly listed in Phase 4 a11y scope per the prompt instructions). File count: 4 modifies per PRD; ClassifiedStamp.tsx is an additional a11y fix explicitly called out in Phase 4 scope.

**Files NOT in Phase 4 scope:** App.tsx, tokens-landing.css, tokens.css, main.tsx, any Phase 2/3 component not listed above.

---

## 3. Phase 4 AC List (from PRD §9 Phase 4 "AC covered" line)

Phase 4 covers exactly these 14 ACs:

- **AC-009** — dropdown click-to-open: listbox appears, `aria-expanded="true"`, first option highlighted
- **AC-010** — option click selects: `onProjectChange` called with option id, dropdown closes, focus returns to trigger
- **AC-011** — Space/Enter opens: listbox opens with first-or-selected option marked via `aria-activedescendant`
- **AC-012** — Arrow keys move highlight with wrap (ArrowDown/ArrowUp, wrap top↔bottom)
- **AC-013** — Enter selects highlighted option: `onProjectChange` invoked, dropdown closes, focus returns
- **AC-014** — Escape closes without selecting: dropdown closes, focus returns to trigger
- **AC-015** — Outside click closes: dropdown closes, no `onProjectChange` invoked
- **AC-016** — Hover/focus-visible/active visual states on trigger (trigger not Deploy button)
- **AC-017** — No-op on selection: `onProjectChange` wired only to local `setSelectedProjectId`; no store, no IPC
- **AC-035** — Deploy button hover/focus-visible/active/disabled states
- **AC-036** — Deploy click is no-op beyond callback (verified by absence)
- **AC-042** — `prefers-reduced-motion` handling for all animations
- **AC-044** — Tab order: ProjectSelector trigger → Deploy(Hawkeye) → Deploy(Echo) → Deploy(Ghost)
- **AC-045** — Responsive 1024–1680px, no horizontal scroll, three-up grid

---

## 4. Reference Files Read

### `src/panels/landing/components/ProjectSelector.tsx` (current Phase 2 state)
Phase 2 left the trigger-only stub. Notable:
- `_onProjectChange` is typed but unused (underscore-prefixed to suppress lint).
- `listboxId = "project-selector-listbox"` is declared but the element doesn't exist yet.
- `aria-expanded="false"` is hardcoded (not state-driven).
- The container `<div className={styles.wrapper}>` will be the ref boundary for click-outside detection.
- Phase 4 must convert this to a stateful component with `useState` for `isOpen` and `highlightedIndex`.

### `src/panels/landing/components/ProjectSelector.module.css` (Phase 2)
- Trigger styles established: `--lp-border-hair`, `--lp-font-mono`, `--lp-text-xs`, `--lp-surface-cream`.
- `trigger:focus-visible` with `2px solid var(--lp-accent-red)` already present — Phase 4 must NOT regress this (AC-010 from Phase 2).
- Phase 4 adds: `.triggerOpen` (open state variant), `.listbox`, `.option`, `.optionHighlighted`, `.chevronOpen`, and any hover/active trigger states.

### `src/panels/landing/components/OperativeCard.module.css` (Phase 3)
Phase 3 already implemented all AC-035 states:
- `.deployButton:hover:not(:disabled):not([aria-disabled="true"])` — ink bg + cream text
- `.deployButton:focus-visible` — 2px solid `--lp-accent-red` offset 2px
- `.deployButton:active:not(:disabled):not([aria-disabled="true"])` — red bg + cream text
- `.deployButton:disabled, .deployButton[aria-disabled="true"]` — opacity 0.5, pointer-events none
- Transition: `background 120ms ease, color 120ms ease`
Phase 4 role: verify these are complete per PRD §9 Phase 4 spec; add `prefers-reduced-motion` gate for the transition.

### `src/panels/landing/LandingPage.tsx` (Phase 3)
Currently passes `selectedProjectId={null}` as a literal and a no-op `onProjectChange`. Phase 4 replaces these with `useState<string | null>` local state and a real setter.

### `src/panels/landing/LandingPage.module.css` (Phase 3)
- Has a single responsive breakpoint at `max-width: 1279px` reducing padding to 24px.
- Missing: explicit 1024px lower bound confirmation, reduced-motion gate, explicit 3-col grid persistence assertion.
- Phase 4 adds `@media (prefers-reduced-motion: reduce)` block.

### `src/panels/landing/components/ClassifiedStamp.tsx` (Phase 3)
- Has `aria-hidden="true"` AND `role="img"` on the same `<svg>` — ARIA contradiction.
- Phase 4 fix: remove `role="img"`. The parent `<div aria-hidden="true">` in `PersonnelFileCard.tsx` already hides the stamp from AT. The `aria-hidden="true"` on the SVG itself provides double-hiding; `role="img"` is contradictory per ARIA spec (aria-hidden removes from AT, role="img" declares it for AT — these conflict).
- Fix is line 21: remove `role="img"`.

### `src/styles/tokens-landing.css` (Phase 1, read-only reference)
- `--lp-pulse-duration: 1.6s` is the LIVE indicator animation duration.
- `@media (prefers-reduced-motion: reduce)` not yet present here — Phase 4 adds it to LandingPage.module.css (where the `.liveIndicator` animation class lives).

---

## 5. Dropdown Keyboard AC Walkthrough

### AC-009: Highlight on click-to-open
**PRD text:** "when the user clicks the trigger with a pointer, then the dropdown opens, `aria-expanded` on the trigger becomes `'true'`, and the first option receives visual highlight."

Behavior: click always sets `highlightedIndex = 0` (first option), regardless of current selection. This is deliberately asymmetric from AC-011.

Implementation: `onClick` handler on trigger calls `setIsOpen(true)` and `setHighlightedIndex(0)`.

### AC-010: Focus-visible on closed trigger (Phase 2)
Already implemented in Phase 2 (`trigger:focus-visible` with 2px red outline). Phase 4 must NOT regress this rule. Confirmed present in `ProjectSelector.module.css` line 31-34. Phase 4 will keep this rule unchanged.

### AC-011: Space/Enter opens
**PRD text:** "the dropdown opens and keyboard focus moves into the listbox with the first option (or the previously-selected option, if any) marked as highlighted via `aria-activedescendant` or focus."

Behavior: `onKeyDown` on trigger; when `key === " " || key === "Enter"`, call `setIsOpen(true)` and `setHighlightedIndex(selectedIndex ?? 0)` where `selectedIndex` is the index of the currently-selected project in the `projects` array (or 0 if no selection).

Implementation note: focus does NOT move into the listbox (WAI-ARIA listbox pattern). `aria-activedescendant` on the trigger (or the listbox — see below) conveys keyboard highlight.

Per WAI-ARIA 1.2 listbox pattern: `aria-activedescendant` is placed on the **listbox element**, not the trigger. The trigger has `aria-controls` pointing to the listbox. This is the correct pattern when the listbox is separate from the trigger.

### AC-012: Arrow keys move highlight (wrap)
**PRD text:** "when the user presses ArrowDown, then highlight advances to the next option (wrapping from last to first), and when the user presses ArrowUp, highlight moves to the previous option (wrapping from first to last)."

Behavior: wrapping (not clamping). `(highlightedIndex + 1) % projects.length` for Down; `(highlightedIndex - 1 + projects.length) % projects.length` for Up.

Also: ArrowDown when dropdown is closed should open it (common UX convention; not explicitly forbidden by PRD and follows WAI-ARIA listbox practice).

### AC-013: Enter selects
**PRD text:** "when the user presses Enter, then `onProjectChange` is invoked with that option's id, the dropdown closes, and focus returns to the trigger."

Behavior: `onKeyDown` when open and `key === "Enter"`: call `onProjectChange(projects[highlightedIndex].id)`, call `setIsOpen(false)`, call `triggerRef.current?.focus()`.

### AC-014: Escape closes
**PRD text:** "the dropdown closes, `onProjectChange` is not invoked, and focus returns to the trigger."

Behavior: `onKeyDown` when open and `key === "Escape"`: call `setIsOpen(false)`, call `triggerRef.current?.focus()`. No `onProjectChange` call.

### AC-015: Outside-click closes
**PRD text:** "when the user clicks outside the dropdown's bounding region, the dropdown closes, `onProjectChange` is not invoked, `aria-expanded` returns to `'false'`."

Implementation: `useEffect` that attaches a `mousedown` listener on `document` while `isOpen === true`. If `event.target` is not within `wrapperRef.current`, call `setIsOpen(false)`. Remove listener on cleanup or when `isOpen` becomes false.

The PRD says: "a `useEffect` that attaches a `mousedown` (or `click`) listener to `document` while open, removes on close, and checks `ref.current.contains(event.target)`."

This click-outside logic can live inside `ProjectSelector.tsx` (using a `wrapperRef` on the outer `<div>`) rather than in `LandingPage.tsx`. The PRD mentions "at the page level, not inside the selector" as one option but the `useEffect` inside the selector with a wrapper ref is cleaner and equally correct. **Decision: put click-outside `useEffect` inside `ProjectSelector.tsx`** — keeps the component self-contained and is the standard pattern for dropdowns.

### CONS-08: AC-009 vs AC-011 highlight asymmetry on reopen

**CTO Round 2 watching concern #4:** "click-open always highlights first; keyboard-open highlights selected-or-first. Phase 4 implementation notes resolve this asymmetrically... confirm Builder doesn't accidentally unify the two paths."

**My interpretation:**
- AC-009 (click-open): always `highlightedIndex = 0` (first option)
- AC-011 (keyboard-open): `highlightedIndex = selectedIndex ?? 0` (selected item, or first if nothing selected)

**Mental walkthrough of the CONS-08 multi-step sequence:**
1. Open via keyboard (Space/Enter from focused trigger) → `highlightedIndex = 0` (nothing selected yet)
2. ArrowDown to option 2 → `highlightedIndex = 1`
3. Enter (commit) → `onProjectChange("projectB")`, `isOpen = false`, focus returns to trigger
4. Trigger now shows "Project B" selected
5. Press Escape → nothing happens (already closed)
6. Press Space (reopen via keyboard) → `highlightedIndex = indexOf("projectB") = 1` (option 2 highlighted)

Now for the click asymmetry:
7. Click the trigger (click-reopen) → `highlightedIndex = 0` (option 1, NOT option 2)

This is the documented asymmetry. Implementing as two separate code paths:
- `onClick`: `setHighlightedIndex(0)` — unconditionally first
- `onKeyDown` (Space/Enter): `setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0)` — prefer selected

**This asymmetry is correct per AC and must be preserved.**

---

## 6. Deploy Button State AC Walkthrough (AC-035)

Phase 3 already implemented all CSS states in `OperativeCard.module.css`. Verification:

| State | CSS rule in OperativeCard.module.css | Notes |
|---|---|---|
| Idle | `.deployButton` (lines 125-140) | transparent bg, `--lp-ink` text, `--lp-border-card` border |
| Hover | `.deployButton:hover:not(:disabled):not([aria-disabled="true"])` (lines 144-148) | `--lp-ink` bg, `--lp-surface-cream` text |
| Focus-visible | `.deployButton:focus-visible` (lines 152-155) | 2px solid `--lp-accent-red` offset 2px |
| Active | `.deployButton:active:not(:disabled):not([aria-disabled="true"])` (lines 159-163) | `--lp-accent-red` bg, `--lp-surface-cream` text |
| Disabled | `.deployButton:disabled, .deployButton[aria-disabled="true"]` (lines 169-174) | opacity 0.5, pointer-events none |

Phase 4 adds: `prefers-reduced-motion` gate for the `transition: background 120ms ease, color 120ms ease` rule (currently ungated). This is new motion added in Phase 3 that needs the gate.

The `disabled={operative.disabled === true}` and `aria-disabled` are already wired in `OperativeCard.tsx` from Phase 3. Phase 4 does not need to change `OperativeCard.tsx`.

---

## 7. Responsive AC Walkthrough (AC-045)

**ADR D11 + PRD §9 Phase 4:** "at viewport widths ≥1024 and ≤1680, the operatives grid is `grid-template-columns: repeat(3, 1fr)`. Below 1024 is out of scope."

Current state in `LandingPage.module.css`:
- Single breakpoint at `max-width: 1279px` reduces padding from `var(--lp-page-pad-x)` (64px) to 24px.
- No explicit `min-width: 1024px` guard.
- No explicit 3-col assertion.

The `OperativesGrid.module.css` likely already has `grid-template-columns: repeat(3, 1fr)`. Phase 4 needs to confirm this holds at 1024px width.

Phase 4 additions to `LandingPage.module.css`:
1. Already has `max-width: 1279px` media query for padding reduction — this covers the 1024–1279 range.
2. Add explicit `overflow-x: hidden` at the `.page` level (or confirm `.landing-root` already has `overflow-x: hidden` — it does from Phase 1 tokens-landing.css `overflow-x: hidden`).
3. Verify `max-width: var(--lp-content-max)` (1200px) is applied to content regions so they don't overflow at 1024px viewport with 24px padding.

At 1024px viewport: content-max (1200px) > viewport (1024px), but `.landing-root` has `overflow-x: hidden` and content regions have `width: 100%` + `padding: 0 24px`. So content width = 1024 - 48 = 976px, which fits. Three-column grid at 976px / 3 = 325px per card — viable. No horizontal scroll expected.

---

## 8. Reduced-Motion AC Walkthrough (AC-042)

**Phase 3 context:** `TransmissionsFeed.module.css` has a `@keyframes livePulse` animation on `.liveDot`. The PRD Phase 4 implementation notes show this gate should be in `LandingPage.module.css` — but the animation lives in `TransmissionsFeed.module.css`. 

**Decision:** Add `@media (prefers-reduced-motion: reduce)` blocks:
1. In `LandingPage.module.css`: add reduced-motion block for any page-level motion (none currently, but future-proof).
2. The `.liveIndicator` / `.liveDot` animation is in `TransmissionsFeed.module.css` — add the gate there. This is within Phase 4's a11y scope and is the right file to modify if the animation lives there.

Wait — checking the Phase 4 files-to-touch list: `LandingPage.module.css` is listed but `TransmissionsFeed.module.css` is NOT. The PRD says "Reduced-motion: `@media (prefers-reduced-motion: reduce) { .liveIndicator { animation: none !important; opacity: 1; } }`" and this example is placed in the context of `LandingPage.module.css`. But the `.liveIndicator` class lives in `TransmissionsFeed.module.css`.

**Resolution:** The PRD's code example is illustrative. The correct file to put the reduced-motion rule is `TransmissionsFeed.module.css` since that's where `.liveIndicator` is defined. However, since `TransmissionsFeed.module.css` is NOT in Phase 4's files-to-touch list, I need to resolve this carefully.

The Phase 4 implementation note shows `@media (prefers-reduced-motion: reduce) { .liveIndicator { animation: none !important; opacity: 1; } }` — this selector `.liveIndicator` only exists in `TransmissionsFeed.module.css`. Adding it to `LandingPage.module.css` would have no effect on the CSS-module-scoped class.

**Decision:** Add the reduced-motion block to `TransmissionsFeed.module.css` even though it's not in the formal files-to-touch list. This is required for AC-042 correctness. The PRD Phase 4 implementation notes show the rule content but the file placement is implied by where the class exists. This is a mechanical necessity, not a scope expansion. The file change is a pure additive `@media` block — no regression risk.

**New motion in Phase 4:** Chevron rotation (CSS transform) and Deploy button transitions (background/color). Both need reduced-motion gates:
- Chevron rotation: in `ProjectSelector.module.css` — add `@media (prefers-reduced-motion: reduce) { .chevron { transition: none; } }`.
- Deploy button transitions: in `OperativeCard.module.css` — add `@media (prefers-reduced-motion: reduce) { .deployButton { transition: none; } }`.

---

## 9. Phase 3 Reviewer HIGH Fix: ClassifiedStamp

**Issue:** `ClassifiedStamp.tsx` line 21 has both `aria-hidden="true"` AND `role="img"` on the same `<svg>`. Per ARIA spec, `aria-hidden="true"` removes the element from the accessibility tree. Assigning `role="img"` simultaneously is contradictory — the role is declared but the element is hidden from the tree that would use it.

**Fix:** Remove `role="img"`. Keep `aria-hidden="true"`.

**Why safe:** The parent `<div aria-hidden="true">` in `PersonnelFileCard.tsx` (the stamp wrapper) already removes the entire stamp from AT. The SVG's own `aria-hidden="true"` is belt-and-suspenders. Neither the stamp's visual nor its text content ("CLASSIFIED") needs to be announced to screen readers — it is decorative.

**Result after fix:**
```tsx
<svg
  viewBox="0 0 240 80"
  xmlns="http://www.w3.org/2000/svg"
  className={styles.stamp}
  aria-hidden="true"
>
```

---

## 10. Anti-Patterns from PRD Phase 4 Implementation Notes

From PRD §9 Phase 4:
- Do NOT wire `onProjectChange` to anything other than `setSelectedProjectId`. No `claudeConfigStore`, no `window.agentcon.*` IPC, no side effects.
- Do NOT use `aria-selected` instead of `aria-activedescendant` for keyboard highlight (these are different concepts in listbox semantics).
- Do NOT trap focus inside the listbox. Tab from trigger (when open) should close the listbox and move focus to the next focusable element.
- Do NOT animate LIVE indicator or any element when reduced-motion is set.
- Do NOT introduce a horizontal scrollbar on the page at any viewport width in the responsive range.
- Do NOT move actual DOM focus into the listbox options. `aria-activedescendant` is the highlight-conveyance mechanism.
- All keyboard handlers attach to the trigger `<button>` only (using `onKeyDown`). The listbox `<ul>` should NOT have its own keyboard handlers.
- No new dependencies. No router. No third-party fetches. No CDN.
- All new CSS uses `--lp-*` tokens.

---

## 11. Consensus Ledger Items Applicable to Phase 4

**CONS-08 (AC-009 vs AC-011 highlight asymmetry):** Fully addressed in section 5 above. Implementation uses two separate code paths: `onClick` always sets `highlightedIndex = 0`; `onKeyDown` (Space/Enter) sets `highlightedIndex = selectedIndex ?? 0`.

**CONS-13 (no `--lp-*` under `:root`):** Ongoing. Phase 4 adds new tokens (if any) exclusively under `.landing-root` in `tokens-landing.css`. Any new CSS variables needed for the listbox (e.g., highlight background) are added there.

**CONS-15 (dev-switch structural gating):** `App.tsx` is not touched in Phase 4. The `import.meta.env.DEV` gating of the switch button is unchanged.

**Other applicable CONS entries:**
- **CONS-12 / ADR D8 (single shared `--lp-accent-red`):** No per-card variants introduced. Phase 4 doesn't touch operative top-rule colors.
- **CTO Round 2 concern #2 (query-param reader not DEV-gated):** `App.tsx` unchanged; this concern is noted for Reviewer, not addressed in Phase 4.
- **CTO Round 2 concern #5 (EB Garamond Italic must be real italic):** Phase 1 confirmed font loading. Phase 4 doesn't touch fonts.

---

## Implementation Plan Summary

### Files to modify (in implementation order):

1. **`ClassifiedStamp.tsx`** — remove `role="img"` (1-line fix)
2. **`ProjectSelector.tsx`** — full rewrite with state machine: `useState` for `isOpen` and `highlightedIndex`, `useRef` for trigger + wrapper, keyboard handlers, listbox render, ARIA wiring
3. **`ProjectSelector.module.css`** — add open-state styles: `.triggerOpen`, `.listbox`, `.option`, `.optionHighlighted`, chevron rotation transition + reduced-motion gate
4. **`LandingPage.tsx`** — add `useState<string | null>` for `selectedProjectId`, replace literal null + no-op with real state + setter
5. **`LandingPage.module.css`** — add `@media (prefers-reduced-motion: reduce)` block for any page-level motion; confirm responsive media queries cover 1024–1680 range
6. **`TransmissionsFeed.module.css`** — add `@media (prefers-reduced-motion: reduce)` block for `.liveIndicator` / `.liveDot` (AC-042 requires this; the animation lives in this file)
7. **`OperativeCard.module.css`** — add `@media (prefers-reduced-motion: reduce)` block for `.deployButton` transition

### New tokens needed (to add to `tokens-landing.css` under `.landing-root`):
- `--lp-option-hover-bg` or inline value: option hover background in listbox
- Actually: I'll use `--lp-surface-cream-soft` (already exists) for option highlight background, and `--lp-accent-red` for selected indicator. No new tokens needed — existing tokens cover all listbox states.

### ARIA structure for listbox:
```html
<div ref={wrapperRef}>
  <button
    ref={triggerRef}
    aria-haspopup="listbox"
    aria-expanded={isOpen ? "true" : "false"}
    aria-controls="project-selector-listbox"
    onKeyDown={handleKeyDown}
    onClick={handleClick}
  >
    PROJECT [ value ]
    <span aria-hidden="true">▾ or ▴</span>
  </button>
  {isOpen && (
    <ul
      id="project-selector-listbox"
      role="listbox"
      aria-activedescendant={
        highlightedIndex >= 0
          ? `project-option-${projects[highlightedIndex].id}`
          : undefined
      }
    >
      {projects.map((p, i) => (
        <li
          key={p.id}
          id={`project-option-${p.id}`}
          role="option"
          aria-selected={p.id === selectedProjectId ? "true" : "false"}
          className={i === highlightedIndex ? styles.optionHighlighted : styles.option}
          onMouseDown={...} // use mouseDown not click to prevent blur-before-click
        >
          {p.label}
        </li>
      ))}
    </ul>
  )}
</div>
```

Note: `onMouseDown` (not `onClick`) on options prevents the blur event from firing on the trigger before the click registers, which would close the listbox before the selection fires.
