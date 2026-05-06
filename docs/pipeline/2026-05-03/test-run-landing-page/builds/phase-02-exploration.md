# Phase 2 Exploration

## 1. PRD Lock Confirmation

Quoted from PRD section 11:

> "PRD locked: 2026-05-03" — confirmed by the presence of all three sign-offs (PM Round 1, CTO Round 1, Architect, CTO Round 2, PM Round 2) in section 11, each marked ✅ APPROVED. The PRD's Status line at top reads "LOCKED | EXECUTING | COMPLETE".

The lock line is embedded in the multi-round consensus — the PM Round 2 final sign-off (2026-05-03) closes the consensus gate. Phase-state.json shows `REVIEWER_PASSED` for Phase 1, which is the correct terminal state before Phase 2.

---

## 2. Phase 2 File List (from PRD section 9, Phase 2)

Files to create (new):
- `src/panels/landing/components/HeaderBar.tsx`
- `src/panels/landing/components/HeaderBar.module.css`
- `src/panels/landing/components/StatusBar.tsx`
- `src/panels/landing/components/StatusBar.module.css`
- `src/panels/landing/components/ProjectSelector.tsx`
- `src/panels/landing/components/ProjectSelector.module.css`
- `src/panels/landing/components/Hero.tsx`
- `src/panels/landing/components/Hero.module.css`
- `src/panels/landing/data/seedProjects.ts`

Files to modify (existing):
- `src/panels/landing/LandingPage.tsx` — wire HeaderBar, StatusBar, ProjectSelector trigger, Hero into region stubs

Total: 9 source files (4 component pairs + 1 seed + 1 modify). This matches the PRD's stated count exactly.

Files NOT in this phase (do not touch):
- `src/App.tsx` (Phase 1, complete)
- `src/styles/tokens-landing.css` (Phase 1, complete — additions allowed for new --lp-* tokens if genuinely needed)
- `src/styles/tokens.css` (NEVER modify)
- `src/panels/landing/LandingPage.module.css` (Phase 1, may read but do not modify)
- Any Phase 3 or Phase 4 files (PersonnelFileCard, TransmissionsFeed, OperativesGrid, etc.)

---

## 3. Reference Files Read

### `src/panels/landing/LandingPage.tsx` (Phase 1 output)
- Pattern to match: named export `export function LandingPage()`, no default export.
- Component imports at top, then render — I'll add `HeaderBar`, `StatusBar`, `ProjectSelector`, `Hero` imports in Phase 2.
- Region stubs are empty `<section>` elements. Phase 2 replaces the first four stubs' content by placing the component inside the `<section>`.
- `seedProjects` will be imported here and `selectedProjectId={null}` passed to ProjectSelector.

### `src/panels/landing/LandingPage.module.css` (Phase 1 output)
- Token consumption pattern: `var(--lp-*)` inside `.module.css` — I'll follow this exactly.
- Existing region classes: `.regionHeader`, `.regionStatus`, `.regionProject`, `.regionHero` — these are the four I'm wiring. No CSS changes needed for Phase 2 layout (the sections already have the correct width/padding/margin scaffold).

### `src/panels/landing/types.ts` (Phase 1 output)
- `ProjectOption` interface: `{ id: string; label: string }` — used by `seedProjects.ts` and `ProjectSelector` props.
- No Agent/Transmission/Operative needed in Phase 2.

### `src/styles/tokens-landing.css` (Phase 1 output)
- All `--lp-*` tokens are scoped under `.landing-root`. I must not add anything under `:root`.
- Tokens I'll use in Phase 2 components:
  - Colors: `--lp-ink-faint`, `--lp-ink`, `--lp-ink-soft`, `--lp-surface-cream`, `--lp-surface-dark-soft`, `--lp-on-dark`, `--lp-on-dark-soft`, `--lp-accent-red`, `--lp-border-hair`, `--lp-border-card`
  - Typography: `--lp-font-mono`, `--lp-font-display`, `--lp-text-xxs`, `--lp-text-xs`, `--lp-text-sm`, `--lp-text-xl`, `--lp-weight-medium`, `--lp-weight-regular`, `--lp-leading-tight`, `--lp-leading-mono`
  - Layout: `--lp-content-max`, `--lp-page-pad-x`, `--lp-radius-card`
  - Borders: `--lp-border-hair`

---

## 4. Mockup-Derived Visual Decisions

From reading the mockup image carefully:

### HeaderBar
- **Layout:** Full-width thin row. Dark ink on cream surface. Three slots in a row.
- **Left:** `AGENTCON` — monospace, slightly bolder/medium weight, small size (~10px = `--lp-text-xxs`)
- **Center/Right:** `FILE 0427-A` — monospace, same small size, faint ink color
- **Far right:** `2026-04-30` — monospace, same small size, faint ink color
- **Background:** cream surface (`--lp-surface-cream`) — header blends with the page background
- **Border:** thin hairline border-bottom (`--lp-border-hair`) to separate from status bar
- **Font:** `var(--lp-font-mono)`, `var(--lp-text-xxs)` = 10px
- **AGENTCON:** `font-weight: var(--lp-weight-medium)` = 500 (per PRD "bold weight via --lp-weight-medium")
- **FILE/DATE:** `font-weight: var(--lp-weight-regular)` = 400, color `var(--lp-ink-faint)`
- **Padding:** ~8px vertical, horizontal padded via page pad

### StatusBar
- **Layout:** Full-width strip directly below header
- **Background:** `var(--lp-surface-dark-soft)` = `#1a1c19` (dark tone per PRD)
- **Text color:** `var(--lp-on-dark)` = `#d8d2bf`
- **Four segments in one row:** `SECURE CHANNEL` / `CONNECTION ESTABLISHED` / `NODE: ~/.CLAUDE` / `3 OPERATIVES ON STANDBY`
- Segments separated by visible dividers or spacing (from mockup: pipe-separated or spaced)
- **Sub-line:** `Status: standby — Awaiting deployment orders` below the segment row, in `var(--lp-on-dark-soft)` = `#8a8579`
- **Font:** `var(--lp-font-mono)`, `var(--lp-text-xxs)` = 10px for segments, same or `--lp-text-xs` for sub-line
- **Padding:** ~8px vertical, full-width (no max-width constraint)

### ProjectSelector (trigger only — Phase 4 owns open behavior)
- **Layout:** Renders below the status bar in the content area, left-aligned with page padding
- **Trigger button:** `PROJECT [ - unassigned - ]` when no selection
- **Background:** cream surface, hairline border
- **Font:** `var(--lp-font-mono)`, `var(--lp-text-xs)` = 11px, `var(--lp-ink-soft)`
- **Chevron:** a small down-arrow indicator to the right of the bracket text (or inside)
- **ARIA:** `aria-haspopup="listbox"`, `aria-expanded="false"`, accessible name contains "Project"
- **AC-008:** with `selectedProjectId={null}` → visible text `PROJECT [ - unassigned - ]`
- **Phase boundary:** trigger button is a `<button>` element. No open state, no listbox, no keyboard listeners beyond native `<button>` affordances (Tab focusability free). `aria-controls` points at a yet-unrendered listbox id (placeholder id is fine).
- **Focus-visible:** 2px outline `--lp-accent-red` offset 2px (per PRD per-region notes)

### Hero
- **Layout:** Below project selector, within content-max, generous vertical padding
- **Eyebrow row:** Two items side by side
  - Left: `PERSONNEL DIVISION` — `--lp-font-mono`, `--lp-text-xs` = 11px, `--lp-ink-soft`
  - Right: `№ 047 / NEW BRIEFING` — `--lp-font-mono`, `--lp-text-xs` = 11px, `--lp-ink-soft` (or `--lp-ink-faint`)
  - Separated with a horizontal rule-like element or just spaced flex
- **h1:** Two lines, `font-family: var(--lp-font-display)`, `font-size: var(--lp-text-xl)` = 56px, `line-height: var(--lp-leading-tight)` = 1.05
  - Line 1: `Brief once.` — `font-style: normal`, `font-weight: 400`, color `var(--lp-ink)`
  - Line 2: `Deploy everywhere.` — `font-style: italic`, `font-weight: 400`, color `var(--lp-accent-red)`
- **Body paragraph:** `A roster of specialized Claude subagents for code review, test authoring, and documentation. Briefed on your project's conventions. Reusable across every operation.`
  - Font: system sans (inherited from body, not overriding to `--lp-font-display` or `--lp-font-mono`)
  - Size: `--lp-text-base` = 14px
  - Color: `--lp-ink` or `--lp-ink-soft`
  - Width: ~50% of hero width (from mockup — narrow column left side)

**CONS-09 critical note:** Line 2 uses `font-style: italic` applied to the `<span>` which inherits `font-family: var(--lp-font-display)`. The `@font-face` rule for EB Garamond Italic in `tokens-landing.css` declares `font-style: italic` and points to `EBGaramond-Italic.woff2`. The browser will use the real italic woff2 file (not synthetic obliquing) because we have an explicit `@font-face` with matching `font-style: italic`. Confirmed: Phase 1 build summary shows `EBGaramond-Italic.woff2` is present in the Vite output.

---

## 5. Anti-Patterns from PRD Phase 2 Implementation Notes

From PRD section 9, Phase 2 "Anti-patterns to avoid":

1. **Do NOT inline open-state logic in `ProjectSelector` this phase.** Phase 4 owns interactivity. The trigger is a button that does nothing on click in Phase 2 (it will be wired in Phase 4).

2. **Do NOT hardcode hex colors.** All colors via `var(--lp-*)` only. No `#b8362b` or any hex in component CSS.

3. **Do NOT use `font-style: italic` for Hero line 2 if the EB Garamond Italic file isn't loading.** The file IS loading (verified in Phase 1 build). I will use `font-style: italic` on the span, which will correctly resolve to `EBGaramond-Italic.woff2` via the registered `@font-face`.

Additional constraints from implementation notes:
- **HeaderBar receives no props this phase** — literals are static text per AC-004.
- **StatusBar receives no props this phase** — literals are static.
- **ProjectSelector this phase:** trigger button only, with `aria-haspopup="listbox"`, `aria-expanded="false"`, `aria-controls` pointing at a placeholder id. `selectedProjectId` and `onProjectChange` props declared in type signature but the dropdown doesn't open yet — clicking the trigger this phase is a no-op.
- **Hero h1:** Two `<span>` lines; line 2 has its own class applying italic + red.
- **Wire `seedProjects` import into `LandingPage.tsx`** and pass `selectedProjectId={null}` to `ProjectSelector`.

**Phase scope boundary:** Do NOT implement:
- Open state in ProjectSelector (Phase 4)
- Any keyboard handlers beyond native `<button>` (Phase 4)
- Any listbox markup (Phase 4)
- Personnel file, Transmissions, OperativesGrid, Footer (Phase 3)
- Reduced-motion rules (Phase 4)
- Responsive breakpoints beyond what Phase 1 already set in LandingPage.module.css (Phase 4)

---

## 6. Consensus Ledger Items Applicable to Phase 2

**CONS-09 (real italic font file):** Directly relevant to the Hero `Deploy everywhere.` line. The `@font-face` with `font-style: italic` is already in `tokens-landing.css` (Phase 1). Phase 2 applies `font-style: italic` on the span and the browser matches to `EBGaramond-Italic.woff2`. Phase 2 satisfies CONS-09 by relying on the already-registered italic font-face, not by synthetic obliquing.

**CONS-13 (no `--lp-*` under `:root`):** Ongoing discipline. All Phase 2 CSS module files consume `var(--lp-*)` tokens defined under `.landing-root` in `tokens-landing.css`. No Phase 2 file touches `:root`. Any new token additions (if needed) go inside `.landing-root` in `tokens-landing.css`, not in component CSS files and never under `:root`.

**CONS-14 (plain string class on landing-root):** Already set in Phase 1 (`className="landing-root"` as a string literal). Phase 2 components use CSS module classes normally (hashed by Vite at build time). The `.landing-root` class remains a plain string in `LandingPage.tsx` — Phase 2 does not change this.

**CONS-08 (highlight asymmetry in ProjectSelector):** This is Phase 4 territory. Phase 2 only implements the closed trigger state. No highlight states to get wrong.

**Phase 1 Reviewer NITs — confirmed will not regress:**
- NIT (a): tokens-landing.css loads unconditionally — Phase 2 does not modify this file's import location. Remains as-is per ADR.
- NIT (b): `regionTransmissions` stub background CSS — Phase 2 does not touch `LandingPage.module.css`.
- NIT (c): `App.tsx` ~55 lines — Phase 2 does NOT touch `App.tsx`.

---

## 7. New `--lp-*` Tokens Required

After checking existing tokens in `tokens-landing.css`, all needed tokens for Phase 2 are already declared:
- `--lp-surface-cream-soft` — not needed in Phase 2 (cards are Phase 3)
- Header uses: `--lp-ink-faint`, `--lp-ink`, `--lp-weight-medium`, `--lp-font-mono`, `--lp-text-xxs`, `--lp-border-hair`
- Status bar uses: `--lp-surface-dark-soft`, `--lp-on-dark`, `--lp-on-dark-soft`, `--lp-font-mono`, `--lp-text-xxs`
- ProjectSelector uses: `--lp-font-mono`, `--lp-text-xs`, `--lp-ink-soft`, `--lp-border-hair`, `--lp-accent-red`
- Hero uses: `--lp-font-display`, `--lp-font-mono`, `--lp-text-xl`, `--lp-text-xs`, `--lp-text-base`, `--lp-leading-tight`, `--lp-leading-normal`, `--lp-ink`, `--lp-ink-soft`, `--lp-accent-red`

**No new `--lp-*` tokens needed.** All required tokens are present in Phase 1's `tokens-landing.css`. I will not modify `tokens-landing.css` in Phase 2.

---

## 8. Implementation Plan Summary

1. Create `src/panels/landing/data/seedProjects.ts` — three `ProjectOption` entries
2. Create `src/panels/landing/components/HeaderBar.tsx` — static, no props
3. Create `src/panels/landing/components/HeaderBar.module.css`
4. Create `src/panels/landing/components/StatusBar.tsx` — static, no props
5. Create `src/panels/landing/components/StatusBar.module.css`
6. Create `src/panels/landing/components/ProjectSelector.tsx` — trigger-only, `selectedProjectId` + `onProjectChange` props, `aria-haspopup="listbox"`, `aria-expanded="false"`
7. Create `src/panels/landing/components/ProjectSelector.module.css`
8. Create `src/panels/landing/components/Hero.tsx` — eyebrow, h1 (two spans), paragraph
9. Create `src/panels/landing/components/Hero.module.css`
10. Modify `src/panels/landing/LandingPage.tsx` — wire all four components into region stubs, import seedProjects, pass `selectedProjectId={null}`
11. Run typecheck (`npx tsc --project tsconfig.web.json --noEmit`)
12. Run build (`npx electron-vite build`)
