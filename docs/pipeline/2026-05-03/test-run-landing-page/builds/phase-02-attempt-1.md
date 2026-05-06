# Build Summary: Phase 2 (Attempt 1)

## Phase
Top sections — Header, Status, ProjectSelector, Hero

---

## AC Targeted

**AC-004:** `HeaderBar.tsx` renders three `<span>` elements with exact literal text: `AGENTCON` (app-name element), `FILE 0427-A` (file-id element), `2026-04-30` (date element). All styled with `font-family: var(--lp-font-mono)` via `HeaderBar.module.css`. `AGENTCON` uses `--lp-weight-medium` (500), others use `--lp-weight-regular` (400) in `--lp-ink-faint`. AC satisfied.

**AC-005:** `StatusBar.tsx` renders a `.segmentRow` containing the four literal segments in order — `SECURE CHANNEL`, `CONNECTION ESTABLISHED`, `NODE: ~/.CLAUDE`, `3 OPERATIVES ON STANDBY` — each as a `<span>` with `font-family: var(--lp-font-mono)`. Visual pipe separators (`|`) between segments with `aria-hidden="true"`. AC satisfied.

**AC-006:** `StatusBar.tsx` renders a `.subLine` div below the segment row with exact text `Status: standby — Awaiting deployment orders`, styled with `font-family: var(--lp-font-mono)` and `color: var(--lp-on-dark-soft)`. The sub-line is directly within the status-bar region. AC satisfied.

**AC-007:** `ProjectSelector.tsx` renders a `<button type="button">` with `aria-haspopup="listbox"`, `aria-expanded="false"`, `aria-controls="project-selector-listbox"`, and `aria-label="Project — <valueLabel>"` (accessible name contains "Project"). Visible label is `PROJECT [ <value> ]`. AC satisfied.

**AC-008:** `LandingPage.tsx` passes `selectedProjectId={null}` to `ProjectSelector`. In the component, `projects.find(p => p.id === null)` returns `undefined`, so `valueLabel = "- unassigned -"`. The trigger renders `PROJECT [ - unassigned - ]`. Exact text match. AC satisfied.

**AC-018:** `Hero.tsx` renders `<h1 className={styles.headline}>` with two `<span>` children. Span 1: `Brief once.` with `.headlineLine1` class — `font-style: normal`, `color: var(--lp-ink)`. Span 2: `Deploy everywhere.` with `.headlineLine2` class — `font-style: italic`, `color: var(--lp-accent-red)`. Both inherit `font-family: var(--lp-font-display)` = "EB Garamond" and `font-size: var(--lp-text-xl)` = 56px from the parent `.headline` class. EB Garamond Italic woff2 is registered via `@font-face` in `tokens-landing.css` with `font-style: italic` — real italic file, no synthetic obliquing (CONS-09 satisfied). AC satisfied.

**AC-019:** `Hero.tsx` renders `<p className={styles.body}>` with exact literal text: `A roster of specialized Claude subagents for code review, test authoring, and documentation. Briefed on your project's conventions. Reusable across every operation.` (apostrophe via `&apos;` JSX entity renders as the `'` character). AC satisfied.

**AC-020:** `Hero.tsx` renders a `.eyebrow` div above the `<h1>` containing two spans: `PERSONNEL DIVISION` (`.kicker`, mono) and `№ 047 / NEW BRIEFING` (`.meta`, mono). Both styled with `font-family: var(--lp-font-mono)` and `font-size: var(--lp-text-xs)`. AC satisfied.

---

## Files Created

| Path | Description |
|---|---|
| `src/panels/landing/data/seedProjects.ts` | Three `ProjectOption` entries: `{ id: "agentcon", label: "agentcon" }`, `{ id: "api-service", label: "api-service" }`, `{ id: "payments-core", label: "payments-core" }`. Imported at LandingPage boundary, passed as prop. |
| `src/panels/landing/components/HeaderBar.tsx` | Static component, no props. Renders `AGENTCON` / `FILE 0427-A` / `2026-04-30` in three `<span>` elements inside a `<header>`. |
| `src/panels/landing/components/HeaderBar.module.css` | Three-column flex layout. `--lp-font-mono`, `--lp-text-xxs`, `--lp-border-hair` bottom border. `AGENTCON` in `--lp-weight-medium`, others in `--lp-ink-faint`. |
| `src/panels/landing/components/StatusBar.tsx` | Static component, no props. Renders segment row + sub-line with `aria-hidden` separators. |
| `src/panels/landing/components/StatusBar.module.css` | `--lp-surface-dark-soft` background, `--lp-on-dark` segments, `--lp-on-dark-soft` sub-line. |
| `src/panels/landing/components/ProjectSelector.tsx` | Trigger-only. Props: `projects: ProjectOption[]`, `selectedProjectId: string | null | undefined`, `onProjectChange: (id: string) => void`. Button with full ARIA trigger markup. `_onProjectChange` unused (Phase 4 wires). |
| `src/panels/landing/components/ProjectSelector.module.css` | Closed-state trigger button. `--lp-font-mono`, `--lp-text-xs`, `--lp-border-hair` border, `--lp-radius-card`. `:focus-visible` with 2px `--lp-accent-red` outline. |
| `src/panels/landing/components/Hero.tsx` | Eyebrow div + `<h1>` with two spans + `<p>` body. Exact AC-019 text with `&apos;` entity. |
| `src/panels/landing/components/Hero.module.css` | `.headline` flex column, `--lp-font-display`, `--lp-text-xl`, `--lp-leading-tight`. Line 1 normal/ink, line 2 italic/red. Body paragraph system-sans inherited, `--lp-text-base`, `--lp-leading-normal`, max-width 480px. |

---

## Files Modified

| Path | Change |
|---|---|
| `src/panels/landing/LandingPage.tsx` | Added 5 imports (`HeaderBar`, `StatusBar`, `ProjectSelector`, `Hero`, `seedProjects`). Replaced first four empty `<section>` stubs by placing each component inside the respective region. Added `onProjectChange` no-op inline arrow function comment explaining Phase 4 wires the real behavior. Phase 3/4 stubs remain empty. |

---

## New `--lp-*` Tokens Added

**None.** All Phase 2 components use tokens already declared in Phase 1's `tokens-landing.css`. No modifications to `tokens-landing.css` were needed or made.

---

## Mechanical Self-Verification

### Typecheck: PASS

Command: `npx tsc --project tsconfig.web.json --noEmit`

Output: (no output = clean pass). Zero errors, zero warnings. Strict mode satisfied including `noUnusedLocals` — `_onProjectChange` is prefixed with `_` to satisfy the unused-parameter rule while keeping the prop in the type signature for Phase 4.

Iteration count: 1 (clean on first run).

### Lint: N/A

No ESLint config in repository. No lint script in `package.json`. Same as Phase 1.

### Tests: N/A

No test runner per ADR §D7. Same as Phase 1.

### Build: PASS

Command: `npx electron-vite build`

Output:
```
vite v7.3.2 building client environment for production...
✓ 71 modules transformed.
out/renderer/assets/EBGaramond-Regular-DSJrtJSV.woff2      21.70 kB
out/renderer/assets/JetBrainsMono-Medium-BWZEU5yA.woff2    21.83 kB
out/renderer/assets/EBGaramond-Italic-KGnr19QW.woff2       22.17 kB
out/renderer/assets/JetBrainsMono-Regular-6fWv1k7M.woff2   31.43 kB
out/renderer/assets/index-DV7yCFUk.css                     25.12 kB
out/renderer/assets/index-WAOSR6pq.js                     839.74 kB
✓ built in 427ms
```

Module count: 71 (up from 62 in Phase 1 — 9 new source files). CSS bundle: 25.12KB (up from 20.47KB — 4.65KB Phase 2 component styles). JS bundle: 839.74KB (up from 833.22KB — minimal growth from new component code). Zero errors, zero warnings.

### Imports Verified: PASS

- `LandingPage.tsx` imports `HeaderBar` from `./components/HeaderBar` — exports `{ HeaderBar }` in file. ✓
- `LandingPage.tsx` imports `StatusBar` from `./components/StatusBar` — exports `{ StatusBar }` in file. ✓
- `LandingPage.tsx` imports `ProjectSelector` from `./components/ProjectSelector` — exports `{ ProjectSelector }` in file. ✓
- `LandingPage.tsx` imports `Hero` from `./components/Hero` — exports `{ Hero }` in file. ✓
- `LandingPage.tsx` imports `seedProjects` from `./data/seedProjects` — exports `{ seedProjects }` in file. ✓
- `seedProjects.ts` imports `type { ProjectOption }` from `../types` — `types.ts` exports `ProjectOption`. ✓
- All CSS module imports resolve to co-located `.module.css` files in the same directory. ✓
- Vite build emitting 71 modules (vs 62 in Phase 1) confirms all new imports resolved. ✓

### No hardcoded hex colors: PASS

`grep -rn "#[0-9a-fA-F]{3,6}"` in `src/panels/landing/components/` returned zero matches. All colors via `var(--lp-*)`.

### No :root rules: PASS

`grep -n "^:root" src/styles/tokens-landing.css` returns zero matches. All `--lp-*` tokens remain scoped under `.landing-root`.

### No Phase 3/4 leakage: PASS

`LandingPage.tsx` imports only `HeaderBar`, `StatusBar`, `ProjectSelector`, `Hero`, `seedProjects`. No `PersonnelFileCard`, `TransmissionsFeed`, `OperativesGrid`, `OperativeCard`, `Footer`, `ClassifiedStamp`, `RedactedSilhouette`. Phase 3/4 stubs remain as empty `<section>` elements.

### No ProjectSelector open-state logic: PASS

`ProjectSelector.tsx` has zero `useState`, `useEffect`, `useRef`, or `aria-expanded="true"` occurrences. The trigger button renders `aria-expanded="false"` as a static attribute. Phase 4 wires the open behavior.

### AC behavioral spot-check: PASS

Walked through each of the 8 ACs targeted — traced through component code and CSS to confirm each AC's observable outcome is satisfiable. See AC Targeted section above.

### Static walk (dev server not running): PASS

Confirmed `LandingPage.tsx` imports and renders all four Phase 2 components inside the correct region stubs. Production build emits zero errors with 71 modules. The four woff2 font files appear in the output confirming the existing font-loading chain is intact.

---

## Deviations from PRD/ADR

**None.** All implementation follows PRD §9 Phase 2 and ADR §D1–D6 exactly.

**`_onProjectChange` naming:** PRD Phase 2 implementation notes say the prop is declared in the type signature but the dropdown doesn't open yet, clicking is a no-op. To satisfy TypeScript `noUnusedLocals: true` while keeping the prop in the signature, the destructured parameter uses the `_` prefix convention (`_onProjectChange`). This is idiomatic TypeScript, not a deviation.

---

## Confirmation: No Phase 3/4 Work

No `PersonnelFileCard`, `TransmissionsFeed`, `OperativesGrid`, `OperativeCard`, `Footer`, `ClassifiedStamp`, or `RedactedSilhouette` components were created or imported. The hero `<h1>` is the only heading element introduced (satisfying AC-041's single-h1 requirement — Phase 3 will add `h2`/`h3` elements in the operatives section).

ProjectSelector is trigger-only: no open state, no listbox markup, no keyboard navigation handlers, no `aria-expanded="true"` state. Phase 4 owns all of that.

---

## Confirmation: Phase 1 Reviewer NITs Not Regressed

- **NIT (a) — tokens-landing.css loads unconditionally:** Not changed. `tokens-landing.css` is still imported via `LandingPage.tsx` (side-effect import). All rules remain scoped to `.landing-root`. No fix needed per reviewer verdict.
- **NIT (b) — regionTransmissions stub background:** Not changed. `LandingPage.module.css` was not modified in Phase 2. The `.regionTransmissions` stub still has `background: var(--lp-surface-dark)` as it was in Phase 1.
- **NIT (c) — App.tsx ~55 lines:** `App.tsx` was NOT touched in Phase 2. Confirmed: `grep -rn "App.tsx" src/panels/landing/` returns zero matches. Line count unchanged.

---

## Notes for QA

**AC-004 verification:** With `?surface=landing`, inspect `[data-testid="header-bar"]`. Expect three text elements: `AGENTCON` (font-weight 500, `--lp-ink`), `FILE 0427-A` (`--lp-ink-faint`, weight 400), `2026-04-30` (`--lp-ink-faint`, weight 400). `getComputedStyle(...).fontFamily` should resolve to "JetBrains Mono" (or system mono fallback) for all three.

**AC-005 verification:** Inspect `[data-testid="status-bar"]`. Expect exactly four visible segment texts in order. Pipe separators have `aria-hidden="true"`. All in `--lp-font-mono`, `--lp-text-xxs` = 10px on `--lp-surface-dark-soft` background.

**AC-006 verification:** The sub-line `Status: standby — Awaiting deployment orders` is the second child inside `[data-testid="status-bar"]`. Color: `--lp-on-dark-soft` = `#8a8579`. Font: mono, `--lp-text-xxs`.

**AC-007 verification:** `document.querySelector('[data-testid="project-selector"] button')` should have `getAttribute('aria-haspopup') === 'listbox'`, `getAttribute('aria-expanded') === 'false'`, and `getAttribute('aria-label')` containing "Project".

**AC-008 verification:** With default `selectedProjectId={null}`, the button's visible text contains `- unassigned -`. QA can confirm by `document.querySelector('[data-testid="project-selector"] button').textContent` — should include `- unassigned -`.

**AC-018 verification:** `document.querySelector('[data-testid="hero"] h1')` should have two child spans. Check `getComputedStyle(span1).fontStyle === 'normal'` and `getComputedStyle(span1).color` resolves to the ink color. Check `getComputedStyle(span2).fontStyle === 'italic'` (real italic, not synthetic) and `getComputedStyle(span2).color` resolves to `rgb(184, 54, 43)` (= `#b8362b`). Critically: `getComputedStyle(span2).fontFamily` should begin with `"EB Garamond"` confirming the EB Garamond Italic woff2 is loaded (CONS-09).

**AC-019 verification:** `document.querySelector('[data-testid="hero"] p').textContent` should equal `A roster of specialized Claude subagents for code review, test authoring, and documentation. Briefed on your project's conventions. Reusable across every operation.` (possible whitespace normalization in DevTools — check the rendered text visually).

**AC-020 verification:** `document.querySelector('[data-testid="hero"] .eyebrow')` (or the eyebrow div's first two spans) should contain `PERSONNEL DIVISION` and `№ 047 / NEW BRIEFING`. Both in `--lp-font-mono`, `--lp-text-xs` = 11px.

**Settings panel regression:** AC-002/AC-039 regression check from Phase 1 remains valid. Phase 2 adds no new CSS to `:root`, no new settings-panel imports, and does not modify `App.tsx`. Cold start still lands on settings panel. The Phase 1 computed-style baseline holds.

**Dev-server smoke check (QA to perform):** Start `npm run dev`. Navigate to `?surface=landing`. Confirm:
1. Header bar shows `AGENTCON`, `FILE 0427-A`, `2026-04-30` in a thin row at the top.
2. Status bar (dark strip) shows four segments + sub-line.
3. Project selector trigger shows `PROJECT [ - unassigned - ]` with a chevron.
4. Hero shows `PERSONNEL DIVISION` / `№ 047 / NEW BRIEFING` eyebrow, `Brief once.` in dark serif, `Deploy everywhere.` in red serif italic, and the body paragraph.
5. Below hero: three empty section stubs (personnel file, transmissions, operatives) with cream/dark backgrounds as Phase 1 left them, plus an empty footer.
6. No console errors.

---

Status: READY_FOR_QA
