# Build Summary: Phase 4 (Attempt 1)

## Phase
Interactivity + accessibility polish

---

## AC Targeted (Phase 4 per PRD §9)

**AC-009 (click-to-open, first option highlighted):** `openViaClick()` in `ProjectSelector.tsx` calls `setIsOpen(true)` and `setHighlightedIndex(0)`. The `<ul role="listbox">` renders with `aria-activedescendant="project-option-{projects[0].id}"`. The first `<li>` receives `.optionHighlighted` CSS class. `aria-expanded` on the trigger becomes `"true"`.

**AC-010 (option click selects, closes, focus returns):** `handleOptionMouseDown` uses `onMouseDown` (not `onClick`) to fire before trigger blur. Calls `onProjectChange(projectId)`, then `close()` which sets `isOpen=false`, `highlightedIndex=-1`, and calls `triggerRef.current?.focus()`. Trigger label updates to the selected option's label via the `selected`/`valueLabel` derived values.

**AC-011 (Space/Enter opens with selected-or-first highlighted):** `handleTriggerKeyDown` handles `" "` and `"Enter"` when `!isOpen`. Calls `openViaKeyboard()` which sets `highlightedIndex = selectedIndex >= 0 ? selectedIndex : 0`. If nothing is selected, `findIndex` returns -1, so index 0 is used.

**AC-012 (ArrowDown/Up wrap):** Down: `setHighlightedIndex((prev) => prev < 0 ? 0 : (prev + 1) % projects.length)`. At last item, `(N-1+1) % N = 0` — wraps to first. Up: `setHighlightedIndex((prev) => prev <= 0 ? projects.length - 1 : (prev - 1 + projects.length) % projects.length)`. At 0, wraps to last. Both Arrow keys also open the dropdown if closed (per WAI-ARIA convention).

**AC-013 (Enter selects when open):** `handleTriggerKeyDown` when `isOpen` and `key === "Enter"` and `highlightedIndex >= 0`: calls `onProjectChange(projects[highlightedIndex].id)` then `close()` (returns focus to trigger).

**AC-014 (Escape closes without selecting):** `handleTriggerKeyDown` when `isOpen` and `key === "Escape"`: calls `close()` with no `onProjectChange`. No selection change.

**AC-015 (outside click closes):** `useEffect` when `isOpen === true` adds `mousedown` listener to `document`. If `!wrapperRef.current.contains(e.target)`: `setIsOpen(false)`, `setHighlightedIndex(-1)`. No `onProjectChange`. Listener cleaned up on `isOpen` becoming false.

**AC-016 (trigger hover/focus-visible/active states):** `ProjectSelector.module.css`: `.trigger:hover` → `background: var(--lp-surface-cream-soft)`, darker border. `.trigger:focus-visible` → `outline: 2px solid var(--lp-accent-red)`, `outline-offset: 2px`. `.trigger:active` → distinct background + border. `.triggerOpen` → softened open state. All three states are visually distinct from idle.

**AC-017 (no-op on selection):** `LandingPage.tsx` passes `onProjectChange={setSelectedProjectId}` — a local `useState` setter. Code search: `setSelectedProjectId` is the only consumer of `onProjectChange`. No `claudeConfigStore`, no `window.agentcon.*`, no IPC, no navigation.

**AC-035 (Deploy button states):** Phase 3 implemented all states in `OperativeCard.module.css`; Phase 4 verifies and adds the reduced-motion gate. All 5 states confirmed present: idle (transparent bg, `--lp-ink` text, hairline border), hover (ink bg, cream text), focus-visible (2px red outline offset 2px), active (red bg, cream text), disabled (opacity 0.5, pointer-events none). See state matrix below.

**AC-036 (Deploy click no-op):** `LandingPage.tsx` does not pass `onDeploy` to `<OperativesGrid>`. `OperativeCard.tsx` `handleDeploy()` falls to `console.info(`Deploy: ${operative.codename}`)`. No navigation, no fetch, no store mutation. Seam is wired as a passthrough prop chain that is deliberately not connected.

**AC-042 (reduced-motion):** Three `@media (prefers-reduced-motion: reduce)` blocks added:
1. `TransmissionsFeed.module.css` (Phase 3 already had this): `.liveDot { animation: none; opacity: 1; }` — confirmed present.
2. `ProjectSelector.module.css`: `.trigger { transition: none; }`, `.chevron { transition: none; }`.
3. `OperativeCard.module.css`: `.deployButton { transition: none; }`.
4. `LandingPage.module.css`: page-level safety net (`.page { transition: none; }`).

**AC-044 (Tab order):** DOM order produces natural focus flow: `<button>` (ProjectSelector trigger) → `<button>` (Deploy Hawkeye) → `<button>` (Deploy Echo) → `<button>` (Deploy Ghost). All are native `<button>` elements, inherently focusable. `:focus-visible` outlines present on all (2px solid `--lp-accent-red`).

**AC-045 (responsive 1024–1680px):** `.landing-root` has `overflow-x: hidden` (from Phase 1 tokens-landing.css). `.page` has `overflow-x: hidden` and `max-width: 100%`. Content regions have `max-width: 1200px`, `width: 100%`. At 1024px: 24px padding on each side → 976px content width. `OperativesGrid.module.css` uses `grid-template-columns: repeat(3, 1fr)` with no breakpoint override — three cards at ~325px each fit within 976px. No horizontal scrollbar at any point in 1024–1680 range.

---

## Files Created

None (Phase 4 is all modifications).

## Files Modified

**`src/panels/landing/components/ClassifiedStamp.tsx`** — Removed `role="img"` from `<svg>` (kept `aria-hidden="true"`). Fixes Reviewer HIGH: aria-hidden + role="img" contradiction. Added Phase 4 a11y fix comment block.

**`src/panels/landing/components/ProjectSelector.tsx`** — Full rewrite from Phase 2 trigger-only stub. Added `useState` for `isOpen` and `highlightedIndex`, `useRef` for trigger and wrapper, `openViaClick` (AC-009), `openViaKeyboard` (AC-011), `close`, `handleTriggerClick`, `handleTriggerKeyDown` (AC-011/012/013/014/Tab), `handleOptionMouseDown` (AC-010), `useEffect` for click-outside (AC-015). Render now conditionally renders `<ul role="listbox">` with `aria-activedescendant`, and `<li role="option">` with `aria-selected`. `aria-expanded` bound to `isOpen` state.

**`src/panels/landing/components/ProjectSelector.module.css`** — Full rewrite from Phase 2 closed-state only. Added: `.trigger:hover` and `.trigger:active` states (AC-016), `.triggerOpen` open state, `.chevron` with rotate transition and `.chevronOpen` (180deg), `.listbox` panel (absolute positioned, z-index 100, shadow), `.option` default style, `.optionHighlighted` keyboard-highlight style. Added `@media (prefers-reduced-motion: reduce)` gate for trigger and chevron transitions (AC-042).

**`src/panels/landing/components/OperativeCard.module.css`** — Added `@media (prefers-reduced-motion: reduce) { .deployButton { transition: none; } }` block to gate the Phase 3 `transition: background 120ms ease, color 120ms ease` rule (AC-042). Comment updated to reflect Phase 4 scope.

**`src/panels/landing/LandingPage.tsx`** — Added `useState<string | null>` for `selectedProjectId`. Replaced `selectedProjectId={null}` literal and no-op `onProjectChange` with real state + `setSelectedProjectId` setter. Import: added `useState` from React. AC-017 comment block added explicitly documenting no-op contract.

**`src/panels/landing/LandingPage.module.css`** — Added `overflow-x: hidden` and `max-width: 100%` to `.page`. Added `@media (prefers-reduced-motion: reduce)` page-level safety net. Added explanatory comments for AC-045 responsive range. (The `max-width: 1279px` breakpoint existed from Phase 3 and covers 1024–1279px range.)

---

## Database Changes

None (no database).

---

## Mechanical Self-Verification

- **Typecheck (`npx tsc --project tsconfig.web.json --noEmit`):** PASS (no output = clean)
- **Existing test suite:** N/A — no test runner in this run (ADR D7, PRD §9)
- **Lint:** No lint script configured in `package.json`. N/A.
- **Build (`npm run build`):** PASS — clean prod bundle, no errors:
  ```
  vite v7.3.2 building client environment for production...
  ✓ 88 modules transformed.
  out/renderer/assets/EBGaramond-Regular-DSJrtJSV.woff2      21.70 kB
  out/renderer/assets/JetBrainsMono-Medium-BWZEU5yA.woff2    21.83 kB
  out/renderer/assets/EBGaramond-Italic-KGnr19QW.woff2       22.17 kB
  out/renderer/assets/JetBrainsMono-Regular-6fWv1k7M.woff2   31.43 kB
  out/renderer/assets/index-DWbbuAft.css                     45.89 kB
  out/renderer/assets/index-jGazo-YU.js                     859.02 kB
  ✓ built in 435ms
  ```
- **Node/main process typecheck:** The `fs-bridge.ts(195,21) Cannot find name 'userClaudeJson'` error is a pre-existing issue confirmed by `git stash` + re-run before Phase 4 changes. Not introduced by Phase 4.
- **Imports verified:** All imports in `ProjectSelector.tsx` (`useEffect`, `useRef`, `useState`, `KeyboardEvent`, `MouseEvent` from "react"; `ProjectOption` type from `../types`; CSS module from `./ProjectSelector.module.css`) resolve to real exports. `LandingPage.tsx` added `useState` to the existing React import. All other imports unchanged.
- **Behavioral spot-check:** Static walk of all 14 AC confirms code paths satisfy each criterion. See AC Targeted section and Dropdown Keyboard Behavior Summary below.

---

## New `--lp-*` Tokens Added

None. All listbox and trigger interactive styles use existing tokens:
- `.optionHighlighted` uses `var(--lp-surface-cream-soft)` (background) and `var(--lp-ink)` (text) — both already declared in `tokens-landing.css` under `.landing-root`.
- `.listbox` box-shadow uses an inline `rgba(29, 28, 25, 0.12)` — a direct color value rather than a token (listbox shadow is not in the PRD token vocabulary; adding a token for this one-off is not warranted).

---

## Dropdown Keyboard Behavior Summary

| AC | File:Approx Lines | Observable Behavior |
|---|---|---|
| AC-009 | `ProjectSelector.tsx:62-65` (`openViaClick`) | Click → `highlightedIndex=0`, `isOpen=true`. Listbox renders. Option[0] gets `.optionHighlighted`. `aria-activedescendant` = `project-option-{projects[0].id}`. |
| AC-010 | `ProjectSelector.tsx:161-168` (`handleOptionMouseDown`) | `onMouseDown` on `<li>` → `onProjectChange(id)`, `close()` → `isOpen=false`, focus returns to trigger. Trigger label updates. |
| AC-011 | `ProjectSelector.tsx:68-71` (`openViaKeyboard`) | Space/Enter → `highlightedIndex = selectedIndex ≥ 0 ? selectedIndex : 0`. `aria-activedescendant` set to selected or first option. |
| AC-012 | `ProjectSelector.tsx:115-133` | ArrowDown: `(prev + 1) % N`; ArrowUp: `(prev - 1 + N) % N`. Wraps at both ends. |
| AC-013 | `ProjectSelector.tsx:102-106` | Enter when open and `highlightedIndex ≥ 0` → `onProjectChange`, `close()`. |
| AC-014 | `ProjectSelector.tsx:137-140` | Escape → `close()`, no `onProjectChange`. Focus returns to trigger. |
| AC-015 | `ProjectSelector.tsx:173-192` (`useEffect`) | `mousedown` on `document` while open → if outside `wrapperRef`, `setIsOpen(false)`. No `onProjectChange`. |
| AC-016 | `ProjectSelector.module.css:.trigger:hover/:focus-visible/:active` | Three distinct states: hover (cream-soft bg), focus-visible (2px red outline), active (cream-soft bg + darker border). |

**CONS-08 explicit resolution:** The click-open and keyboard-open paths are deliberately asymmetric:
- `openViaClick()` (line 62): always `setHighlightedIndex(0)` — first option, regardless of selection.
- `openViaKeyboard()` (line 68): `setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0)` — prefers selected option.

CONS-08 walkthrough: Open (keyboard, Space) → highlight=0. ArrowDown → highlight=1. Enter → commits option[1], closes. Press Space (reopen, keyboard) → `selectedIndex=1` → highlight=1 (option 2). Click trigger (click-reopen) → highlight=0 (option 1). The asymmetry between click-reopen (always first) and keyboard-reopen (always selected) is present and correct per AC-009 vs AC-011 and CTO Round 2 §4.

---

## Deploy Button State Matrix

All states from Phase 3, verified in Phase 4. Located in `src/panels/landing/components/OperativeCard.module.css`:

| State | CSS Rule | File Lines (approx) | Visual |
|---|---|---|---|
| Idle | `.deployButton` | ~125-140 | Transparent bg, `--lp-ink` text, `--lp-border-card` border |
| Hover | `.deployButton:hover:not(:disabled):not([aria-disabled="true"])` | ~144-148 | `--lp-ink` bg, `--lp-surface-cream` text |
| Focus-visible | `.deployButton:focus-visible` | ~152-155 | 2px solid `--lp-accent-red`, offset 2px |
| Active | `.deployButton:active:not(:disabled):not([aria-disabled="true"])` | ~159-163 | `--lp-accent-red` bg, `--lp-surface-cream` text |
| Disabled | `.deployButton:disabled, .deployButton[aria-disabled="true"]` | ~169-174 | `opacity: 0.5`, `pointer-events: none` |

`disabled={operative.disabled === true}` and `aria-disabled={operative.disabled === true ? "true" : undefined}` wired in `OperativeCard.tsx` from Phase 3. No operative in seed data has `disabled: true` — the visual state is tested via DevTools force-state per Phase 4 completion criteria.

---

## ClassifiedStamp Aria Fix

- **File:** `src/panels/landing/components/ClassifiedStamp.tsx`
- **Fix:** Removed `role="img"` from the `<svg>` element (was on line 21 of the Phase 3 version).
- **Kept:** `aria-hidden="true"` remains on the `<svg>`.
- **Reasoning:** `aria-hidden="true"` removes the element from the accessibility tree. Simultaneously declaring `role="img"` is contradictory per ARIA spec — the role targets AT, but `aria-hidden` removes it from AT. Fix removes the contradiction. The parent `<div aria-hidden="true">` stamp wrapper in `PersonnelFileCard.tsx` already hides the entire stamp from AT. The fix is purely markup correctness.

---

## Reduced-Motion Gates

All `@media (prefers-reduced-motion: reduce)` blocks in Phase 4 scope:

1. **`TransmissionsFeed.module.css`** (Phase 3 already present, confirmed): `.liveDot { animation: none; opacity: 1; }` — disables LIVE pulse.

2. **`ProjectSelector.module.css`** (Phase 4 added):
   ```css
   @media (prefers-reduced-motion: reduce) {
     .trigger { transition: none; }
     .chevron { transition: none; }
   }
   ```
   Disables: trigger background/border transition (120ms) and chevron rotation transition (120ms).

3. **`OperativeCard.module.css`** (Phase 4 added):
   ```css
   @media (prefers-reduced-motion: reduce) {
     .deployButton { transition: none; }
   }
   ```
   Disables: Deploy button background/color transition (120ms).

4. **`LandingPage.module.css`** (Phase 4 added, page-level safety net):
   ```css
   @media (prefers-reduced-motion: reduce) {
     .page { transition: none; }
   }
   ```

---

## Responsive Breakpoints

AC-045 — ADR D11 pins range 1024–1680px, QA tests at 1024 / 1280 / 1680.

Media queries covering the range (in `LandingPage.module.css`):

```css
/* 1024–1279px: reduce padding */
@media (max-width: 1279px) {
  .regionProject, .regionHero, .regionPersonnel, .regionOperatives {
    padding: 0 24px;
  }
}
/* ≥1280px: default 64px padding via var(--lp-page-pad-x) */
```

Overflow guards:
- `.landing-root` (in `tokens-landing.css`): `overflow-x: hidden` (Phase 1)
- `.page` (in `LandingPage.module.css`): `overflow-x: hidden`, `max-width: 100%` (Phase 4 added)
- Content regions: `max-width: var(--lp-content-max)` (1200px) + `width: 100%` keeps them within viewport.

Grid behavior: `OperativesGrid.module.css` has `grid-template-columns: repeat(3, 1fr)` with no breakpoint that reduces it. At 1024px with 24px padding: 976px for three cards → ~325px each. Sufficient. No horizontal scroll.

---

## No-op Seam Preservation

**AC-017 (ProjectSelector → no store/IPC):** `LandingPage.tsx` passes `onProjectChange={setSelectedProjectId}`. `setSelectedProjectId` is a React `useState` setter. Code path: click option → `onProjectChange(id)` → `setSelectedProjectId(id)` → local state update → trigger label re-renders. Zero other effects.

**AC-029 (TransmissionsFeed → no timer/socket):** `TransmissionsFeed.tsx` unchanged from Phase 3. `git grep useEffect src/panels/landing/components/TransmissionsFeed.tsx` returns zero. Seam unchanged.

**AC-036 (Deploy button → no-op beyond console.info):** `LandingPage.tsx` does not pass `onDeploy` to `<OperativesGrid>`. `OperativeCard.tsx` `handleDeploy()` falls to `console.info`. `OperativesGrid.tsx` unchanged. Seam unchanged.

---

## Phase 1+2+3 Invariants

- **`tokens.css` unchanged:** Not touched. Phase 4 touches no files outside its scope.
- **`App.tsx` unchanged:** Not touched. Dev-switch structural gating (CONS-15) intact.
- **`tokens-landing.css` zero `--lp-*` under `:root`:** Not touched in Phase 4. Still `--lp-*` only under `.landing-root`. CONS-13 intact.
- **Settings cold-start works:** `App.tsx` unchanged, default `useState("settings")` untouched. Build produces no errors for the main/preload bundles.
- **Prior phases' Reviewer NIT/HIGH findings:** The only Reviewer HIGH from Phase 3 (`ClassifiedStamp` aria contradiction) is explicitly fixed in Phase 4 as scoped a11y polish. No other prior findings regressed.

---

## Deviations from PRD/ADR

1. **`TransmissionsFeed.module.css` added to scope:** PRD §9 Phase 4 lists 4 files to modify (`ProjectSelector.tsx + .module.css`, `OperativeCard.module.css`, `LandingPage.tsx`, `LandingPage.module.css`). `TransmissionsFeed.module.css` is not listed. However, the reduced-motion rule for `.liveDot` must live in the file where `.liveDot` is defined (CSS Modules scope prevents cross-file class targeting). The Phase 3 build already included this rule (lines 68-73 of `TransmissionsFeed.module.css`) — it was implemented in Phase 3 before Phase 4 was listed as the formal AC-042 owner. Phase 4 confirmed the rule exists; no new edit was needed to this file. The file was read but not modified in Phase 4.

2. **Click-outside in `ProjectSelector.tsx` rather than `LandingPage.tsx`:** PRD Phase 4 implementation notes say "a `useEffect` registered while `open === true`" and separately mentions "at the page level, not inside the selector" as one option. The implementation places the `useEffect` inside `ProjectSelector.tsx` using a `wrapperRef` on the outer `<div>`. This is the standard React dropdown pattern, self-contained, and satisfies AC-015's requirement verbatim. The PRD's phrasing is "can be" at the page level, not "must be."

3. **`ClassifiedStamp.tsx` added to scope:** Phase 4 scope in PRD §9 lists 4 files. The prompt's explicit instructions include `ClassifiedStamp.tsx` as "Phase 4 fixes Reviewer HIGH on the aria-hidden + role='img' contradiction." Added as a justified a11y fix within Phase 4's stated a11y polish purpose.

---

## Decisions Not Pre-Specified

1. **Chevron rotation CSS:** The PRD doesn't specify chevron behavior in detail. Used `transform: rotate(180deg)` on `.chevronOpen` to flip ▾ visually to indicate open state, with a `transition: transform 120ms ease` gated by reduced-motion. Standard dropdown affordance, consistent with the spy aesthetic.

2. **Listbox `box-shadow`:** Added a subtle `box-shadow: 0 4px 12px rgba(29,28,25,0.12)` to the listbox panel to distinguish it from the page surface. Not specified in PRD; used `rgba` based on `--lp-ink` (#1d1c19) at 12% opacity. Consistent with the ink token family. No new token added.

3. **`onMouseDown` vs `onClick` for options:** Used `onMouseDown` to prevent the trigger's `onBlur` from firing before selection. Standard DOM event ordering solution for dropdown components. Not a new dependency or pattern — pure React/DOM behavior.

---

Status: READY_FOR_QA
