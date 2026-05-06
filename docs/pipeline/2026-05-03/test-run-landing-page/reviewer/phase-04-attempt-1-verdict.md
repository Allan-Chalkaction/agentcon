## Reviewer Verdict: PASS

**Phase:** 4 — Interactivity + accessibility polish
**Attempt:** 1
**Date:** 2026-05-03

---

### Findings Summary
- BLOCKING: 0
- HIGH: 1
- SUGGESTION: 0
- NIT: 1

---

### Convention Compliance
All conventions from `.claude/rules/` and CLAUDE.md followed:
- Named export (`export function ProjectSelector`, `export function LandingPage`) — correct.
- No `export default` in component files — correct.
- `className="landing-root"` is a plain string literal (CONS-14) — correct.
- All `--lp-*` tokens remain under `.landing-root` in `tokens-landing.css`, not `:root` (CONS-13) — correct.
- No new `@font-face` blocks in component CSS files — correct.
- `import.meta.env.DEV` structural gate in `App.tsx` (CONS-15) — untouched, correct.
- No new entries in `package.json` — Builder confirmed clean.
- TypeScript: no `any` types, no `@ts-ignore`, no `@ts-expect-error` — correct.

---

### Builder Exploration Consistency
Implementation matches claimed patterns with one minor deviation:

- CONS-08 two-path implementation: `openViaClick()` always sets `highlightedIndex=0`; `openViaKeyboard()` uses `selectedIndex >= 0 ? selectedIndex : 0`. `e.preventDefault()` on Space/Enter in `handleTriggerKeyDown` (line 98) blocks the browser's synthetic click event, ensuring the two paths do not collide. Matches the exploration note exactly.
- Click-outside `useEffect` placed in `ProjectSelector.tsx` (not `LandingPage.tsx`): Builder justified this as the standard self-contained dropdown pattern, and noted the PRD says "can be at the page level." Correct interpretation — the PRD framing is permissive, not prescriptive.
- `TransmissionsFeed.module.css` added to scope: Builder's resolution is accurate — the reduced-motion gate for `.liveDot` was already added in Phase 3 (lines 68–73 of that file); no edit was needed in Phase 4. The file was read-verified, not modified. This is not a scope violation.
- `ClassifiedStamp.tsx` added to scope: explicitly called out in Phase 4 a11y scope per the review instructions. Correctly handled.

No unexplained discrepancies between exploration claims and final code.

---

### Correctness

**React hook hygiene — clean:**

- `useState(false)` for `isOpen`, `useState<number>(-1)` for `highlightedIndex` — types correct, initial values sane. The -1 convention for "nothing highlighted" is idiomatic and used consistently throughout.
- `useRef<HTMLDivElement>(null)` for `wrapperRef`, `useRef<HTMLButtonElement>(null)` for `triggerRef` — both typed correctly. All access uses optional chaining (`triggerRef.current?.focus()`, `wrapperRef.current &&`) — no null dereference risk.
- `useEffect` for click-outside (lines 173–192): dependency array is `[isOpen]`. Effect early-returns when `isOpen === false`, attaches listener only when `isOpen === true`. Cleanup function removes the exact same `handleDocumentMouseDown` reference (function is declared inside the effect). No listener leak. Correct.
- No stale closure issue: `setIsOpen` and `setHighlightedIndex` are stable React setter references, not captured from render scope. `wrapperRef.current` is accessed at event time, not at capture time. Clean.
- Rapid open/close: clicking trigger while open calls `close()` (lines 83–85); `close()` calls `setIsOpen(false)` then `triggerRef.current?.focus()`. If the user presses Escape while a click event fires, both handlers converge on `setIsOpen(false)` — React batches these correctly. No inconsistent state.
- Tab handling (lines 143–151): closes without returning focus, allowing Tab to advance naturally. No focus trap. Correct per WAI-ARIA listbox pattern and PRD anti-pattern note.
- No premature `useCallback`/`useMemo` — appropriate for a 3-item listbox. Correct.
- AC-017 no-op seam: `onProjectChange={setSelectedProjectId}` in `LandingPage.tsx:77` — no `useEffect` in `LandingPage.tsx` watches `selectedProjectId`. No IPC, no `claudeConfigStore`, no `window.agentcon.*`, no `localStorage`. Clean.

**Edge cases:**
- `highlightedIndex >= 0` guard before `onProjectChange(projects[highlightedIndex].id)` in AC-013 path (line 102) — safe, prevents index-out-of-range if Enter fires before index is set.
- `selectedProjectId` typed `string | null | undefined` in props — `projects.findIndex()` returns -1 for null/undefined, which is handled by `selectedIndex >= 0` guard. Clean.
- `wrapperRef.current.contains(e.target as Node)` in click-outside handler — standard DOM API, safe.

**ClassifiedStamp.tsx a11y fix:**
- `role="img"` removed, `aria-hidden="true"` retained on `<svg>`. Parent `<div aria-hidden="true">` in `PersonnelFileCard.tsx:56` provides defense-in-depth. Fix is correct.

---

### Performance

No perf red flags:
- Click-outside listener: gated to `isOpen === true` via early return on line 174. The listener is not attached during normal browsing with the dropdown closed.
- Listbox `<ul>`: conditionally rendered via `{isOpen && <ul>...}` (line 229). When closed, no DOM node, no AT tree entries, no keyboard handlers active. Correct — avoids the `display:none` anti-pattern.
- 3-item list: no virtualization needed or added.
- CSS transitions use `transform` (chevron) and `background`/`border-color`/`color` (trigger, deploy button) — no `width`/`height`/`top`/`left` transitions that would cause layout thrash. Correct.
- No `setInterval` or `setTimeout` introduced.
- Bundle: Build Summary shows 859KB JS bundle; 4 woff2 font files (~97KB total). Font files are within the ADR D6 ~110KB estimate. No new dependencies.

---

### Security Smells

No issues found:
- No `dangerouslySetInnerHTML`.
- Click-outside handler: `e.target` passed to `wrapperRef.current.contains()` — safe DOM method, no property introspection.
- `aria-activedescendant` value: `project-option-${projects[highlightedIndex].id}` where project IDs come from `seedProjects.ts` (static strings: "agentcon", "api-service", "payments-core"). No user input. No XSS surface.
- `selectedProjectId` local state: used only to drive the trigger label and pass back to `ProjectSelector`. No persistence.
- `console.info` on Deploy fallback: logs operative codename (static seed data). Not sensitive.

---

### UI Spec Compliance

**Mockup review:** Mockup shows closed trigger ("PROJECT [ -- unassigned -- ]") on cream surface. The open-state is not in the mockup; evaluated by token coherence.

**Open-state visual (read from CSS):**
- Listbox panel (`ProjectSelector.module.css:102–119`): `background: var(--lp-surface-cream)`, `border: var(--lp-border-hair)`, `border-radius: var(--lp-radius-card)`, `box-shadow: rgba(29,28,25,0.12)`. Consistent with cream surface aesthetic.
- Option default (`.option`): `font-family: var(--lp-font-mono)`, `color: var(--lp-ink-soft)`. Consistent.
- Option highlighted (`.optionHighlighted`): `background: var(--lp-surface-cream-soft)`, `color: var(--lp-ink)`. Subtle highlight, legible, consistent with the dossier aesthetic.
- Chevron rotation: `transform: rotate(180deg)` on `.chevronOpen` — ▾ visually becomes ▴. Standard dropdown affordance, reduced-motion gated.
- `.triggerOpen` class adds `background: var(--lp-surface-cream-soft)`, `border-color: var(--lp-ink-faint)` — open state is visually distinguished from idle.
- No hardcoded hex in component CSS except one `rgba` in the shadow (see NIT below).
- No `font-style: italic` on any non-EB-Garamond font — CONS-09 satisfied. The `.codename` italic at `OperativeCard.module.css:71` is on `var(--lp-font-display)` (EB Garamond) which has a real italic `@font-face` registered. No synthetic obliquing.
- CONS-12 (single `--lp-accent-red`): Phase 4 did not add per-card or per-state red variants. Confirmed.

**Accessibility — focus ring audit:**

All landing-page focusable elements evaluated against the global `:focus-visible { outline: 2px solid var(--accent-primary) }` rule in `tokens.css:151`:

1. **ProjectSelector trigger (`<button>`)**: `ProjectSelector.module.css:55` — `.trigger:focus-visible` sets `outline: 2px solid var(--lp-accent-red)`. CSS module class selector (`.trigger:focus-visible`) has higher specificity than the global bare `:focus-visible` selector. Result: red ring. Correct per spec.

2. **Deploy buttons (3x `<button>`)**: `OperativeCard.module.css:152` — `.deployButton:focus-visible` sets `outline: 2px solid var(--lp-accent-red)`. Same specificity reasoning. Result: red ring. Correct.

3. **Listbox options (`<li role="option">`)**: `<li>` elements are not natively focusable and have no `tabIndex`. DOM focus never moves to them (WAI-ARIA listbox pattern: focus stays on trigger). No `:focus-visible` rule needed. No AT exposure risk.

4. **Dev-switch button (dev-only, inline-styled)**: Not inside `.landing-root`. Has no class. Will receive the global blue focus ring from `tokens.css:151`. **Acceptable** — it's dev-only, not part of the landing page surface, and its inline style already makes clear it's a framework artifact, not a designed element.

5. **`<a>` links**: No `<a>` elements anywhere in the landing page (`src/panels/landing/`). Footer contains only `<span>` text. PersonnelFileCard contains no links. No anchor focus risk exists.

6. **Other interactive elements**: No `<input>`, `<select>`, `<textarea>`, `<summary>`, `<details>` elements in the landing page. The landing page has exactly 4 native focusable elements: 1 trigger button + 3 deploy buttons. All explicitly override the global focus style.

**QA non-blocking observation resolution:**
The global `:focus-visible` rule in `tokens.css:151` does NOT affect any user-facing landing page element, because:
- All 4 landing-page buttons have explicit `.trigger:focus-visible` or `.deployButton:focus-visible` overrides that win on specificity.
- There are no `<a>` or other unoveridden focusable elements in the landing page.
- The dev-switch button is outside `.landing-root` and dev-only — acceptable to pick up the global blue ring.

Severity for each category:
- ProjectSelector trigger: no issue (explicitly overridden) — NIT/none.
- Deploy buttons: no issue (explicitly overridden) — NIT/none.
- Listbox `<li>` options: no issue (not focusable) — none.
- Dev-switch button: picks up global blue ring — NIT, dev-only element, acceptable.
- `<a>` links: none exist — non-issue.

**Overall:** The QA observation is informational. No BLOCKING, HIGH, or SUGGESTION arises from the global `:focus-visible` rule in this phase's surface.

---

### ADR Compliance

All ADR decisions followed:
- D1 (surface switcher): `App.tsx` unchanged from Phase 1 — correct.
- D2 (token namespacing): No new `--lp-*` under `:root`. No new tokens added at all.
- D3 (overflow scoping): `.landing-root overflow-y: auto; overflow-x: hidden` unchanged.
- D7 (no test runner): No test files added.
- D8/CONS-12 (single red accent): No per-card variants introduced.
- D11 (responsive range): Breakpoint at `max-width: 1279px` covers 1024–1279; default 64px covers 1280–1680. Correct.
- D12 (disabled seam): `disabled` and `aria-disabled` both wired; all three seed operatives have `disabled: false`.

---

### Non-Blocking Findings

#### HIGH-1: `aria-activedescendant` placed on `<ul role="listbox">` rather than on the focused `<button>`

**File:** `src/panels/landing/components/ProjectSelector.tsx:237`
**Category:** Accessibility pattern
**Issue:** `aria-activedescendant` is set on `<ul role="listbox">`. DOM focus resides on the trigger `<button>`, not on the `<ul>`. Per WAI-ARIA 1.2 §6.2.3, `aria-activedescendant` is most reliably processed by AT when placed on the element that currently has DOM focus — i.e., the trigger button. AT (NVDA, JAWS) reads `aria-activedescendant` from the focused element to announce the active descendant. When the property sits on a non-focused `<ul>`, some AT implementations may not announce the highlighted option as the user navigates with arrow keys.

The correct WAI-ARIA listbox pattern for a button-controlled listbox (the "combobox-like" pattern) places `aria-activedescendant` on the trigger: `<button aria-haspopup="listbox" aria-controls="listboxId" aria-activedescendant="project-option-agentcon">`. The `<ul role="listbox">` should not carry `aria-activedescendant`.

**Why HIGH and not BLOCKING:** AC-011 and AC-012 say "marked as highlighted via `aria-activedescendant` or focus" — QA verified this passed. The visual highlight works correctly regardless (CSS class on `<li>`). AT behavior is AT-implementation-dependent; some (VoiceOver on macOS, some versions of NVDA) will still announce correctly from the listbox. Not every user is affected. However, for maximum AT compatibility per WAI-ARIA 1.2, the property should be on the focused element.

**Recommended fix:** Move `aria-activedescendant` from the `<ul>` to the trigger `<button>`. The `<ul>` needs no `aria-activedescendant`. The trigger becomes:
```tsx
<button
  ...
  aria-activedescendant={
    isOpen && highlightedIndex >= 0
      ? `project-option-${projects[highlightedIndex].id}`
      : undefined
  }
>
```
And the `<ul>` loses the attribute.

---

#### NIT-1: Inline `rgba` for listbox box-shadow in component CSS file

**File:** `src/panels/landing/components/ProjectSelector.module.css:118`
**Category:** Minor convention
**Issue:** `box-shadow: 0 4px 12px rgba(29, 28, 25, 0.12)` uses an inline color value in a component CSS module. Project convention (per memory) is that all hardcoded color values live as token definitions in `tokens-landing.css`. The value is correctly derived from `--lp-ink` (#1d1c19 → rgb(29,28,25)) at 12% opacity. Builder's justification (one-off shadow not warranting a token) is reasonable, and the Build Summary calls this out explicitly.

**Why NIT and not HIGH:** Functional, visually correct, intentional, and pre-justified in the Build Summary. No token for shadow/opacity exists in this project. Adding one for a single use is arguably over-engineering. This is a style preference, not a blocking convention violation.

---

### Cross-Phase Regression Summary

All four phases hold. Full walkthrough:

**Phase 1 (Foundation):**
- `tokens.css`: `git diff HEAD -- src/styles/tokens.css` returns empty. Zero changes. Confirmed.
- `App.tsx`: Contains only the Phase 1 surface switcher (diff confirmed against initial commit). Phase 4 did not touch it.
- `tokens-landing.css`: All `--lp-*` tokens under `.landing-root`, no `:root` entries. Phase 4 added no new tokens. CONS-13 intact.
- `.landing-root` as plain class string: `LandingPage.tsx:46` — `className="landing-root"`. CONS-14 intact.
- `readInitialSurface()` defaults to `"settings"`: `App.tsx:19` returns `"landing"` only when `?surface=landing` param present. AC-002 intact.
- CONS-15 dev-switch gating: `App.tsx:30` — `{import.meta.env.DEV && (<button ...>)}`. Structurally gated. Intact.
- 8 page regions preserved: HeaderBar, StatusBar, ProjectSelector, Hero, PersonnelFileCard, TransmissionsFeed, OperativesGrid, Footer — all 8 present in `LandingPage.tsx`, order correct, no region added or removed.

**Phase 2 (Top sections):**
- `HeaderBar.tsx`, `HeaderBar.module.css`: file headers confirm Phase 2 origin; not in Phase 4 file list. Untouched.
- `StatusBar.tsx`, `StatusBar.module.css`: same. Untouched.
- `Hero.tsx`, `Hero.module.css`: same. Untouched.
- `seedProjects.ts`: 3 entries (`agentcon`, `api-service`, `payments-core`). Untouched.
- `ProjectSelector.tsx`: Phase 4 intentionally rewrote from trigger-only stub. Closed-state (when `isOpen === false`) preserves Phase 2 AC-007/AC-008 behavior: `aria-expanded="false"`, trigger renders with `valueLabel` ("- unassigned -" when no selection). No regression.

**Phase 3 (Mid + bottom):**
- `PersonnelFileCard.tsx`, `.module.css`: file headers confirm Phase 3 origin; not in Phase 4 file list. Untouched.
- `TransmissionsFeed.tsx`: unchanged. `useEffect` not present. LIVE indicator CSS-only. AC-029 intact.
- `TransmissionsFeed.module.css`: Phase 3 reduced-motion gate at lines 68–73 confirmed present. Phase 4 did not modify this file.
- `OperativesGrid.tsx`, `OperativesGrid.module.css`: not in Phase 4 file list. Untouched. `grid-template-columns: repeat(3, 1fr)` confirmed by QA at lines 41–45.
- `OperativeCard.tsx`: Phase 4 intentionally wired `disabled` and `aria-disabled`. Review confirms the Phase 3 base content (handleDeploy, all fields) is fully preserved; the only change is the two `disabled`-related props on the deploy button.
- `OperativeCard.module.css`: Phase 4 added `@media (prefers-reduced-motion: reduce)` block (lines 180–184) for the deploy button transition. All 5 Phase 3 AC-035 state rules (idle, hover, focus-visible, active, disabled) confirmed present and unmodified.
- `Footer.tsx`, `Footer.module.css`: not in Phase 4 file list. Untouched.
- `ClassifiedStamp.tsx`: Phase 4 intentionally removed `role="img"`. Fix is correct. Phase 3 HIGH finding resolved.
- `RedactedSilhouette.tsx`, `.module.css`: not in Phase 4 file list. Untouched.
- All seed data files (`seedAgent.ts`, `seedTransmissions.ts`, `seedOperatives.ts`): confirmed untouched (directory listing and content reads).

---

### Overall Phase Run Summary (Final Gate)

All four phases of the Agentcon landing-page run have passed Reviewer. The build is structurally sound end-to-end:

Phase 1 established a clean token-scoped foundation (separate `tokens-landing.css`, `.landing-root` scroll container, bundled fonts, surface switcher) that was never violated in any subsequent phase. Phase 2 built the top three sections (HeaderBar, StatusBar, ProjectSelector stub, Hero) following all ADR decisions. Phase 3 built the mid and bottom sections (PersonnelFileCard with inline SVG components, TransmissionsFeed with CSS-only LIVE indicator, OperativesGrid with three OperativeCards including full deploy-state CSS, Footer) with one HIGH finding on ClassifiedStamp ARIA that Phase 4 resolved. Phase 4 delivered the keyboard listbox state machine, reduced-motion gating across all motion sources, responsive media query confirmation, and the ClassifiedStamp a11y fix — all cleanly, with zero cross-phase regressions and zero security smells. The one HIGH finding (aria-activedescendant placement) is an AT compatibility improvement, not a correctness failure, and the one NIT (inline rgba for a box-shadow) is an intentional, pre-justified pragmatic choice. The run is complete.

---

### Phase Status

REVIEWER_PASS — final gate. Run complete. No security trigger in PRD.
