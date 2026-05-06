# Build Summary: Phase 1 (Attempt 1)

## Phase
Foundation — tokens, fonts, surface switcher, overflow scope

## AC Targeted

- **AC-001:** Page shell with stable `data-testid="landing-page"` and eight child regions in document order (header, status, project-selector, hero, personnel-file, transmissions-feed, operatives-grid, footer) — each an empty `<section>` stub. Satisfied by `LandingPage.tsx` which renders all eight `data-testid` regions inside `<div className="landing-root">`.

- **AC-002:** Settings panel still loads as the cold-start default. Satisfied by `App.tsx` `readInitialSurface()` returning `"settings"` unless `?surface=landing` is explicitly in the URL. `ClaudeSettingsPanel` renders when `surface === "settings"`.

- **AC-003:** Landing route scrolls vertically without being blocked by the global `overflow: hidden`. Satisfied by `.landing-root` in `tokens-landing.css` declaring `position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden;` — a scoped scroll container inside `#root` (which remains `overflow: hidden`). `tokens.css` is untouched.

- **AC-039:** Landing tokens namespaced `--lp-*`, scoped under `.landing-root`, do not redefine any setting-panel token. Satisfied by `tokens-landing.css` having no `:root` rule (verified by grep); all tokens declared inside `.landing-root { ... }`. `tokens.css` is untouched.

- **AC-040:** Display headings use `--lp-font-display` ("EB Garamond" + fallback chain); UI labels use `--lp-font-mono` ("JetBrains Mono" + fallback chain). Both fonts bundled as `.woff2` files via `@font-face` with `font-display: swap` and Latin-only `unicode-range`. No CDN. Satisfied by `tokens-landing.css` `@font-face` declarations pointing to `src/assets/fonts/` with relative `url()` paths that Vite resolves and hashes at build time.

---

## Files Created

| Path | Description |
|---|---|
| `src/styles/tokens-landing.css` | Full `--lp-*` token set scoped under `.landing-root`; four `@font-face` declarations for EB Garamond (Regular + Italic 400) and JetBrains Mono (Regular 400 + Medium 500); `.landing-root` scroll-container rules (position: absolute, inset: 0, overflow-y: auto). 101 lines. |
| `src/panels/landing/LandingPage.tsx` | Root component. Imports `tokens-landing.css` and `LandingPage.module.css`. Returns `<div className="landing-root" data-testid="landing-page">` containing eight empty `<section>` stubs with `data-testid` and `aria-label` attributes. No Phase 2/3/4 components. 77 lines. |
| `src/panels/landing/LandingPage.module.css` | Page layout using `var(--lp-*)` tokens. `.page` is a flex column. Region classes set `width`, `max-width`, and `padding` via `var(--lp-content-max)` / `var(--lp-page-pad-x)`. Responsive media query at 1279px reduces horizontal padding to 24px. 73 lines. |
| `src/panels/landing/types.ts` | Type-only module. Exports `Agent`, `Transmission`, `Operative`, `ProjectOption` interfaces per PRD §8 Data Model. 38 lines. |
| `src/assets/fonts/eb-garamond/EBGaramond-Regular.woff2` | Bundled font asset. 21,704 bytes. SIL OFL license. |
| `src/assets/fonts/eb-garamond/EBGaramond-Italic.woff2` | Bundled font asset. 22,172 bytes. SIL OFL license. |
| `src/assets/fonts/jetbrains-mono/JetBrainsMono-Regular.woff2` | Bundled font asset. 31,432 bytes. SIL OFL license. |
| `src/assets/fonts/jetbrains-mono/JetBrainsMono-Medium.woff2` | Bundled font asset. 21,832 bytes. SIL OFL license. |

**Total font bundle: ~97KB (within the ~110KB PRD estimate). `du -sh src/assets/fonts/` = 104K (includes directory metadata).**

## Files Modified

| Path | Change |
|---|---|
| `src/App.tsx` | Replaced the original 5-line file (direct `<ClaudeSettingsPanel />` render) with a 55-line surface switcher. Added `readInitialSurface()` (reads `?surface=landing` from `window.location.search`), `useState<Surface>` defaulting to `"settings"`, conditional render of `<ClaudeSettingsPanel />` or `<LandingPage />`, and a dev-only floating button inside `{import.meta.env.DEV && (...)}`. Comment block at top references this ADR by path. |

---

## Mechanical Self-Verification

### Typecheck: PASS

Command: `npx tsc --project tsconfig.web.json --noEmit`

Output: (no output = clean pass). Zero errors, zero warnings. `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true` all satisfied.

### Lint: N/A

No lint script in `package.json`. No ESLint config found in the repository. Skipped per instructions.

### Tests: N/A

No test script in `package.json`. Per ADR §D7 (Option c): no test runner in this run. Skipped per instructions.

### Build: PASS

Command: `npx electron-vite build`

Output (renderer section):
```
vite v7.3.2 building client environment for production...
✓ 62 modules transformed.
out/renderer/assets/EBGaramond-Regular-DSJrtJSV.woff2      21.70 kB
out/renderer/assets/JetBrainsMono-Medium-BWZEU5yA.woff2    21.83 kB
out/renderer/assets/EBGaramond-Italic-KGnr19QW.woff2       22.17 kB
out/renderer/assets/JetBrainsMono-Regular-6fWv1k7M.woff2   31.43 kB
out/renderer/assets/index-D0C9Ej3K.css                     20.47 kB
out/renderer/assets/index-DUA89k5a.js                     833.22 kB
✓ built in 420ms
```

All four `.woff2` files appear in the output with Vite-hashed names. Build succeeds with zero errors.

### Dev-Only Switch Button Gate: PASS

Grep of the production bundle (`out/renderer/assets/index-DUA89k5a.js`) for the button text strings "→ landing" and "→ settings" returns 0 matches. Vite dead-code-eliminated the `{import.meta.env.DEV && <button .../>}` block from the production build. The structural gate is confirmed working.

### Imports Verified: PASS

- `App.tsx` imports `{ useState } from "react"`, `ClaudeSettingsPanel` from `./panels/claude-settings/ClaudeSettingsPanel`, `LandingPage` from `./panels/landing/LandingPage` — all resolve to real exports.
- `LandingPage.tsx` imports `"../../styles/tokens-landing.css"` (file exists at `src/styles/tokens-landing.css`) and `styles from "./LandingPage.module.css"` (file exists).
- `types.ts` has no runtime imports.
- `tokens-landing.css` font `url()` references resolve to files present in `src/assets/fonts/` — confirmed by the Vite build successfully emitting all four woff2 assets.

### token scope integrity: PASS

`grep -n "^:root" src/styles/tokens-landing.css` returns zero matches. All `--lp-*` tokens are under `.landing-root { ... }`. `src/styles/tokens.css` has not been modified (global `overflow: hidden` rule at lines 105-112 is present and unchanged).

### No Phase 2/3/4 leakage: PASS

`LandingPage.tsx` contains no imports or references to `HeaderBar`, `StatusBar`, `Hero`, `ProjectSelector`, `PersonnelFileCard`, `TransmissionsFeed`, `OperativesGrid`, `OperativeCard`, or `Footer`. All eight regions are empty `<section>` stubs.

---

## CONS-03 Settings-Panel Computed-Style: Pre vs Post Comparison

**Method: static-derived baseline (dev server not running in agent environment). Documented as such in the exploration note.**

### Pre-Phase-1 Baseline (from `phase-01-exploration.md`)

Derived from CSS rules applying to `.rail button` with `.railItem` class:

| Property | Expected computed value | Source |
|---|---|---|
| `font-family` | `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif` | `body { font-family: var(--font-sans) }` → `--font-sans` in `tokens.css:38` |
| `font-size` | `12px` | `.railItem { font-size: var(--text-sm) }` → `--text-sm: 12px` in `tokens.css:42` |
| `color` | `rgb(155, 163, 180)` | `.railItem { color: var(--text-secondary) }` → `--text-secondary: #9ba3b4` in `tokens.css:17` |
| `background-color` | `rgba(0, 0, 0, 0)` | `.railItem { background: transparent }` in `ClaudeSettingsPanel.module.css:106` |

### Post-Phase-1 Analysis

Phase 1 adds:
1. `src/styles/tokens-landing.css` — all rules scoped under `.landing-root`. No rule outside `.landing-root` in this file. The `@font-face` declarations do not affect computed styles of settings elements (font-face just registers a font family).
2. `src/panels/landing/LandingPage.tsx` — imports `tokens-landing.css` only when the landing surface is active. When settings surface is active, this file is not rendered and the CSS import does not apply (CSS modules are tree-shaken at the import level in Vite; however CSS side-effects imports are always included. Correction: `tokens-landing.css` is a side-effect import — it loads into the document whenever the module is evaluated. Since `LandingPage.tsx` is imported at the top of `App.tsx`, the CSS will be in the document stylesheet on both surfaces.)

**Critical note:** the `tokens-landing.css` styles are scoped entirely inside `.landing-root { ... }`. There is no `.landing-root` element in the DOM when the settings surface is rendered. Therefore the CSS declarations inside `.landing-root` do not affect any settings-panel element. The `@font-face` declarations at the top of `tokens-landing.css` are document-global (font-face is always global) but they only *register* the families "EB Garamond" and "JetBrains Mono" — they do not change `font-family` on any element. Settings-panel elements do not reference `--lp-font-display` or `--lp-font-mono`.

**Result: NO DRIFT.** All four computed values remain byte-identical:

| Property | Pre | Post | Drift |
|---|---|---|---|
| `font-family` | `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif` | unchanged | none |
| `font-size` | `12px` | unchanged | none |
| `color` | `rgb(155, 163, 180)` | unchanged | none |
| `background-color` | `rgba(0, 0, 0, 0)` | unchanged | none |

The token-bifurcation guard holds. AC-039 and AC-002 are satisfied.

---

## Deviations from PRD/ADR

**None.** All implementation follows PRD §9 Phase 1 and ADR D1–D6 exactly.

**Font files:** The `.woff2` files are present in the repository (`src/assets/fonts/`). The exploration note had tentatively marked this as "will attempt download" — they were already bundled before this invocation, so no download was needed. All four files are confirmed present and included in the Vite production build output.

---

## Decisions Not Pre-Specified

**None.** Every implementation choice was pre-specified by the PRD §9 Phase 1 implementation notes or the ADR. No judgment calls were required.

---

## Confirmation: No Phase 2/3/4 Work

`LandingPage.tsx` contains only eight empty `<section>` stubs. No component implementations for Phase 2 (HeaderBar, StatusBar, ProjectSelector, Hero), Phase 3 (PersonnelFileCard, TransmissionsFeed, OperativesGrid, Footer, ClassifiedStamp, RedactedSilhouette), or Phase 4 (interactivity, keyboard navigation) are present in any Phase 1 file.

---

## Notes for QA

- **Dev-server smoke check (QA to perform):** Start `npm run dev` (Electron dev mode via `electron-vite dev`). (a) Cold start should show the settings panel with the Claude config UI. (b) Add `?surface=landing` to the renderer URL to switch to the landing surface — an empty cream-background page should appear with the dev-only floating button in the top-right corner. (c) Click the floating button to toggle back to settings. (d) In production builds (`npm run build`), the floating button is absent.

- **Font verification (QA to perform):** In dev mode with `?surface=landing`, open DevTools → Network tab. No requests to Google Fonts, `fonts.gstatic.com`, or any remote CDN should appear. Open DevTools → Sources and confirm the woff2 files are served from the local dev server (paths like `/@fs/.../src/assets/fonts/...`).

- **Overflow behavior (QA to perform):** With `?surface=landing`, temporarily set a large `min-height` on the `.page` element in DevTools (e.g. `5000px`) and confirm the landing surface scrolls vertically while the settings panel (when switched back) remains non-scrollable at the body level.

- **Settings panel regression (QA to perform):** On the settings surface (default), run `getComputedStyle(document.querySelector('.rail button'))` in the console. Expected values from the static baseline: `font-size: 12px`, `color: rgb(155, 163, 180)`, `background-color: rgba(0, 0, 0, 0)`. The `font-family` value resolves to the system font stack (OS-dependent). Any deviation from these values is a regression.

- **AC-001 structural check (QA to perform):** With `?surface=landing`, run `document.querySelectorAll('[data-testid]')` and confirm all nine testids are present: `landing-page`, `region-header`, `region-status`, `region-project-selector`, `region-hero`, `region-personnel-file`, `region-transmissions-feed`, `region-operatives-grid`, `region-footer`.

---

Status: READY_FOR_QA
