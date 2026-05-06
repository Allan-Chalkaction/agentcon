# Build Summary: Phase 3 (Attempt 1)

## Phase
Mid + bottom sections — PersonnelFile, Transmissions, OperativesGrid, Footer

---

## AC Targeted (Phase 3 per PRD §9)

**AC-021 (PersonnelFile fields):** `PersonnelFileCard.tsx` receives `agent: Agent` prop and renders a `<dl>` with 7 `<div className={styles.fieldRow}>` elements. Each maps a label from the `FIELD_LABELS` constant to `agent[key]`. `seedAgent.ts` provides the values: `fileId="0427-A"`, `codename="HAWKEYE"`, `callsign="code-review"`, `specialty="sonnet"`, `clearance="all tools"`, `lastSeen="~ 2d"`, `status="Active"`. Labels styled with `--lp-font-mono`, `--lp-text-xs`, `--lp-ink-soft`. Values styled with `--lp-font-mono`, `--lp-text-sm`, `--lp-ink`. AC satisfied.

**AC-022 (REDACTED photo + caption):** `RedactedSilhouette.tsx` renders a `<div className={styles.photoSlot}>` containing a `<div className={styles.photoBackground}>` (dark slot, `--lp-surface-dark-soft` background) with an inline `<svg>` human-bust silhouette (head circle + shoulders path, `currentColor` = `--lp-ink-soft`), followed by a separate `<p className={styles.caption}>REDACTED</p>` DOM element below the SVG. "REDACTED" is in the DOM as plain text content of a `<p>` element, not inside the SVG. AC satisfied.

**AC-023 (CLASSIFIED stamp):** `ClassifiedStamp.tsx` renders an inline `<svg viewBox="0 0 240 80">` with a stroked `<rect>` (no fill, `stroke="var(--lp-accent-red)"`, `strokeWidth="3"`) and a `<text>` element with literal content `CLASSIFIED`, `fill="var(--lp-accent-red)"`. The SVG element has `transform: rotate(-15deg)` applied via `ClassifiedStamp.module.css .stamp`. -15deg is within the -20 to -10 degree range specified in AC-023. The stamp is positioned absolutely over the lower-right of the card via `.stampWrapper` in `PersonnelFileCard.module.css`. `opacity: 0.92`. AC satisfied.

**AC-024 (PersonnelFile reads from prop — seam check):** `PersonnelFileCard.tsx` has no hardcoded agent values. The `FIELD_LABELS` array maps to `keyof Agent` and all values are read as `agent[key]`. `LandingPage.tsx` imports `seedAgent` from `./data/seedAgent` and passes it as `<PersonnelFileCard agent={seedAgent} />`. The seam is observable in the diff. AC satisfied.

**AC-025 (TransmissionsFeed header + LIVE indicator):** `TransmissionsFeed.tsx` renders a `.header` row with `<span className={styles.title}>// RECENT TRANSMISSIONS</span>` (mono, `--lp-on-dark`) and `<span className={styles.liveIndicator}>` containing the pulsing `<span className={styles.liveDot}>●</span>` + " LIVE" text in `--lp-accent-green`. The feed section's background is `--lp-surface-dark` (set in `LandingPage.module.css .regionTransmissions`). AC satisfied.

**AC-026 (transmission row visual treatment):** Each row in `TransmissionsFeed.tsx` renders: `<span className={styles.timestamp}>` (`--lp-on-dark-soft`, mono), `<span className={styles.separator}> — </span>` (`--lp-on-dark-soft`), `<span className={styles.codename}>` (`--lp-accent-green`, mono), separator, `<span className={styles.action}>` (`--lp-on-dark`, mono). AC satisfied.

**AC-027 (4 exact seed rows):** `seedTransmissions.ts` exports exactly 4 entries in order:
1. `timestamp: "01:42:07", codename: "HAWKEYE", action: "flagged 3 issues in api/auth.ts"`
2. `timestamp: "01:38:14", codename: "ECHO", action: "authored 12 tests for payments/processor.ts"`
3. `timestamp: "01:31:55", codename: "GHOST", action: "updated docs/getting-started.md"`
4. `timestamp: "01:24:02", codename: "ECHO", action: "cleared PR #2247"`
Matches AC-027 verbatim. AC satisfied.

**AC-028 (empty state):** In `TransmissionsFeed.tsx`, when `transmissions.length === 0`, the row container renders a single `<div className={styles.emptyState}>// NO TRANSMISSIONS</div>`. The LIVE indicator header continues to render above it (it's in the `.header` div, separate from the `.rows` container). AC satisfied.

**AC-029 (no timer/poll/socket — implementation observation):** `TransmissionsFeed.tsx` imports only `Transmission` type and the CSS module. No `useEffect`, no `setInterval`, no `setTimeout`, no `WebSocket`, no IPC reference. The component renders from the `transmissions` prop once. The `● LIVE` indicator uses a CSS `@keyframes livePulse` animation — no JS timing involved. `git grep useEffect src/panels/landing/components/TransmissionsFeed.tsx` returns zero code lines (only the comment line documenting the AC). AC satisfied by inspection.

**AC-030 (OperativesGrid header + h2):** `OperativesGrid.tsx` renders `<div className={styles.kicker}>QUICK START TEMPLATES</div>` (mono, `--lp-text-xs`, `--lp-ink-soft`) and `<h2 className={styles.heading}>Field-ready operatives</h2>` (`--lp-font-display`, `font-style: italic`, `--lp-text-lg` = 28px, `--lp-ink`). AC satisfied.

**AC-031 (3 cards in order):** `OperativesGrid.tsx` maps `operatives` prop array to `<OperativeCard key={operative.id} .../>`. The grid does not filter or sort. `seedOperatives.ts` exports [hawkeye, echo, ghost] in that order. With the default seed, QA will see 3 cards: Hawkeye (1), Echo (2), Ghost (3). AC satisfied.

**AC-032 (per-card content):** `seedOperatives.ts` exports three entries with the exact fields from the AC-032 table in PRD §5: index labels `// 01 //` / `// 02 //` / `// 03 //`, class labels `Reviewer-class` / `Analyst-class` / `Archivist-class`, status `● Active` for all, codenames `Hawkeye` / `Echo` / `Ghost`, callsigns `CALLSIGN — CODE-REVIEWER` / `CALLSIGN — TEST-WRITER` / `CALLSIGN — DOC-WRITER`, descriptions as specified, model `MODEL sonnet` / `MODEL default` / `MODEL default`, missions `MISSIONS 47` / `MISSIONS 23` / `MISSIONS 11`. `OperativeCard.tsx` renders all fields from the `operative` prop. AC satisfied.

**AC-033 (top rule — single shared red accent):** `OperativeCard.module.css .topRule` declares `border-top: 2px solid var(--lp-accent-red)`. This is a single CSS class applied to the `.topRule` div in every card. No per-card token variants exist. CONS-12 and ADR D8 satisfied. AC satisfied.

**AC-034 (DEPLOY button content + accessible name):** `OperativeCard.tsx` renders `<button type="button" className={styles.deployButton} aria-label={\`Deploy \${operative.codename}\`} ...>DEPLOY</button>`. Visible text content is `DEPLOY` in `--lp-font-mono`. `aria-label` is `"Deploy Hawkeye"` / `"Deploy Echo"` / `"Deploy Ghost"`. AC satisfied.

**AC-037 (OperativesGrid reads from props — seam check):** `OperativesGrid.tsx` has zero hardcoded operative data. It maps `operatives` prop. `OperativeCard.tsx` has zero hardcoded operative data. It renders `operative.index`, `operative.className`, `operative.status`, `operative.codename`, `operative.callsignLine`, `operative.description`, `operative.model`, `operative.missions`. All from prop. `LandingPage.tsx` imports `seedOperatives` and passes as `<OperativesGrid operatives={seedOperatives} />`. AC satisfied.

**AC-038 (footer content):** `Footer.tsx` renders `<footer>` containing `<span className={styles.left}>v0.1 · ~/.CLAUDE</span>` and `<span className={styles.right}>ENCRYPTED AT REST</span>`. `Footer.module.css` applies `display: flex; justify-content: space-between`. Font: `--lp-font-mono`, `--lp-text-xxs`, `--lp-ink-faint`. AC satisfied.

**AC-041 (single h1, heading hierarchy):** Document heading order:
- `h1`: "Brief once. / Deploy everywhere." in `Hero.tsx` (Phase 2) — exactly one `h1`.
- `h2`: "Field-ready operatives" in `OperativesGrid.tsx` — descends from `h1`.
- `h3`: operative codenames (`Hawkeye`, `Echo`, `Ghost`) in `OperativeCard.tsx` — descend from `h2`.
No heading elements in `PersonnelFileCard.tsx`, `TransmissionsFeed.tsx`, `Footer.tsx`, `ClassifiedStamp.tsx`, `RedactedSilhouette.tsx`. `HeaderBar.tsx` and `StatusBar.tsx` (Phase 2) use no heading elements. Heading order is `h1 → h2 → h3` with no skipping. AC satisfied.

**AC-043 (contrast pairings):** Four named pairings — computed ratios from token hex values:
- Body text on cream: `--lp-ink (#1d1c19)` on `--lp-surface-cream (#f1ead8)`. Relative luminance: #1d1c19 ≈ 0.0046, #f1ead8 ≈ 0.862. Ratio: (0.862 + 0.05) / (0.0046 + 0.05) = ~16.7:1. Passes 4.5:1. ✓
- Mono UI text on cream: `--lp-ink-soft (#4a4742)` on `--lp-surface-cream (#f1ead8)`. #4a4742 ≈ lum 0.061. Ratio: (0.862 + 0.05) / (0.061 + 0.05) ≈ 8.2:1. Passes 4.5:1. ✓
- Mono UI text on dark: `--lp-on-dark (#d8d2bf)` on `--lp-surface-dark (#131512)`. #d8d2bf ≈ lum 0.684, #131512 ≈ lum 0.0062. Ratio: (0.684 + 0.05) / (0.0062 + 0.05) ≈ 13.1:1. Passes 4.5:1. ✓
- Red accent on cream: `--lp-accent-red (#b8362b)` on `--lp-surface-cream (#f1ead8)`. PRD §10 pre-computed: 5.4:1. Passes 4.5:1. ✓
All four pairings pass WCAG 2.1 AA (≥4.5:1 for normal text). AC satisfied.

---

## Files Created

| Path | Description |
|---|---|
| `src/panels/landing/data/seedAgent.ts` | `Agent` record for Hawkeye dossier (AC-021 values). |
| `src/panels/landing/data/seedTransmissions.ts` | 4-entry `Transmission[]` (AC-027 exact rows). |
| `src/panels/landing/data/seedOperatives.ts` | 3-entry `Operative[]` for Hawkeye/Echo/Ghost (AC-032 exact content). |
| `src/panels/landing/components/ClassifiedStamp.tsx` | Inline SVG — stroked rect + `CLASSIFIED` text, fill `var(--lp-accent-red)`. |
| `src/panels/landing/components/ClassifiedStamp.module.css` | `.stamp { transform: rotate(-15deg); width: 200px; opacity: 0.92 }`. |
| `src/panels/landing/components/RedactedSilhouette.tsx` | Inline SVG human bust + adjacent `<p>REDACTED</p>` DOM element. |
| `src/panels/landing/components/RedactedSilhouette.module.css` | Photo slot + dark background + caption styling. |
| `src/panels/landing/components/PersonnelFileCard.tsx` | Receives `agent: Agent` prop. Renders RedactedSilhouette + field `<dl>` + ClassifiedStamp overlay. |
| `src/panels/landing/components/PersonnelFileCard.module.css` | Two-column layout, position:relative for stamp, field label/value styling. |
| `src/panels/landing/components/TransmissionsFeed.tsx` | Renders `transmissions` prop once. No effects/timers. LIVE indicator CSS-only. |
| `src/panels/landing/components/TransmissionsFeed.module.css` | Dark band layout, header, row styling, livePulse keyframe + reduced-motion gate. |
| `src/panels/landing/components/OperativesGrid.tsx` | Maps `operatives` prop to OperativeCard elements. No onDeploy passed through this run. |
| `src/panels/landing/components/OperativesGrid.module.css` | `repeat(3, 1fr)` grid, section header styling. |
| `src/panels/landing/components/OperativeCard.tsx` | Receives `operative` + optional `onDeploy?`. console.info fallback if no onDeploy. |
| `src/panels/landing/components/OperativeCard.module.css` | Top rule, card content layout, Deploy button idle + hover/focus/active/disabled CSS. |
| `src/panels/landing/components/Footer.tsx` | `v0.1 · ~/.CLAUDE` left, `ENCRYPTED AT REST` right. |
| `src/panels/landing/components/Footer.module.css` | Flex space-between, `--lp-font-mono`, `--lp-text-xxs`, `--lp-ink-faint`. |

## Files Modified

| Path | Change |
|---|---|
| `src/panels/landing/LandingPage.tsx` | Added 8 new imports (`PersonnelFileCard`, `TransmissionsFeed`, `OperativesGrid`, `Footer`, `seedAgent`, `seedTransmissions`, `seedOperatives`). Replaced four empty `<section>` stubs with `<PersonnelFileCard agent={seedAgent} />`, `<TransmissionsFeed transmissions={seedTransmissions} />`, `<OperativesGrid operatives={seedOperatives} />`, `<Footer />`. `onDeploy` NOT passed to OperativesGrid. |

---

## Mechanical Self-Verification

### Typecheck: PASS

Command: `npx tsc --project tsconfig.web.json --noEmit`

Output: (no output = clean pass). Zero errors, zero warnings.

Iteration count: 1 (clean on first run).

### Lint: N/A

No ESLint config in repository. No lint script in `package.json`. Same as Phase 1 and 2.

### Tests: N/A

No test runner per ADR §D7. Same as Phase 1 and 2.

### Build: PASS

Command: `npx electron-vite build`

Output:
```
vite v7.3.2 building client environment for production...
✓ 88 modules transformed.
out/renderer/assets/EBGaramond-Regular-DSJrtJSV.woff2      21.70 kB
out/renderer/assets/JetBrainsMono-Medium-BWZEU5yA.woff2    21.83 kB
out/renderer/assets/EBGaramond-Italic-KGnr19QW.woff2       22.17 kB
out/renderer/assets/JetBrainsMono-Regular-6fWv1k7M.woff2   31.43 kB
out/renderer/assets/index-Bym2FJUx.css                     39.78 kB
out/renderer/assets/index-BsueNz73.js                     854.59 kB
✓ built in 489ms
```

Module count: 88 (up from 71 in Phase 2 — 17 additional modules from Phase 3 files). CSS bundle: 39.78KB (up from 25.12KB — 14.66KB Phase 3 component styles). JS bundle: 854.59KB (up from 839.74KB — minimal growth from Phase 3 component code). Zero errors, zero warnings.

### Static Walk: PASS

`LandingPage.tsx` imports and renders all Phase 3 components inside the correct region stubs:
- `region-personnel-file`: `<PersonnelFileCard agent={seedAgent} />` — agent prop from seedAgent.ts ✓
- `region-transmissions-feed`: `<TransmissionsFeed transmissions={seedTransmissions} />` — transmissions from seedTransmissions.ts ✓
- `region-operatives-grid`: `<OperativesGrid operatives={seedOperatives} />` — no onDeploy passed ✓
- `region-footer`: `<Footer />` ✓

All 8 AC-001 regions are now populated: header (Phase 2), status (Phase 2), project-selector (Phase 2), hero (Phase 2), personnel-file (Phase 3), transmissions-feed (Phase 3), operatives-grid (Phase 3), footer (Phase 3). AC-001 fully satisfied.

### Imports Verified: PASS

- `LandingPage.tsx` → `PersonnelFileCard` from `./components/PersonnelFileCard` — exports `{ PersonnelFileCard }`. ✓
- `LandingPage.tsx` → `TransmissionsFeed` from `./components/TransmissionsFeed` — exports `{ TransmissionsFeed }`. ✓
- `LandingPage.tsx` → `OperativesGrid` from `./components/OperativesGrid` — exports `{ OperativesGrid }`. ✓
- `LandingPage.tsx` → `Footer` from `./components/Footer` — exports `{ Footer }`. ✓
- `LandingPage.tsx` → `seedAgent` from `./data/seedAgent` — exports `{ seedAgent }`. ✓
- `LandingPage.tsx` → `seedTransmissions` from `./data/seedTransmissions` — exports `{ seedTransmissions }`. ✓
- `LandingPage.tsx` → `seedOperatives` from `./data/seedOperatives` — exports `{ seedOperatives }`. ✓
- `PersonnelFileCard.tsx` → `ClassifiedStamp` from `./ClassifiedStamp` — exports `{ ClassifiedStamp }`. ✓
- `PersonnelFileCard.tsx` → `RedactedSilhouette` from `./RedactedSilhouette` — exports `{ RedactedSilhouette }`. ✓
- `OperativesGrid.tsx` → `OperativeCard` from `./OperativeCard` — exports `{ OperativeCard }`. ✓
- All seed files import `type { T }` from `../types` — all types exist in `types.ts`. ✓
- All CSS module imports resolve to co-located `.module.css` files. ✓
- Production build emitting 88 modules (vs 71 in Phase 2) confirms all new imports resolved. ✓

---

## New `--lp-*` Tokens Added

**None.** All Phase 3 components use tokens already declared in Phase 1's `tokens-landing.css`. No modifications to `tokens-landing.css` were made. No new tokens required.

---

## No-op Compliance Confirmations

### AC-029 — TransmissionsFeed no timer/poll/socket

`src/panels/landing/components/TransmissionsFeed.tsx` contains:
- Zero `useEffect` calls (only a comment on line 6 documenting the requirement)
- Zero `setInterval` / `setTimeout` calls
- Zero WebSocket references
- Zero IPC subscription references
- No React imports at all (the component uses only the JSX transform + the `Transmission` type import)

The `● LIVE` indicator pulsing is implemented entirely in `TransmissionsFeed.module.css` via `@keyframes livePulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }` applied to `.liveDot`. This is CSS-only, no JS timing.

Citation: `src/panels/landing/components/TransmissionsFeed.tsx` — no `useEffect` on any line.

### AC-036 — Deploy buttons no-op

`OperativeCard.tsx` declares `onDeploy?: (id: string) => void` as an optional prop (line 14 of the interface). The `handleDeploy` function at line 32–38 invokes `onDeploy(operative.id)` if provided, or `console.info(\`Deploy: \${operative.codename}\`)` as the fallback.

`OperativesGrid.tsx` accepts `onDeploy?: (id: string) => void` and passes it to each `OperativeCard` (line 38 `onDeploy={onDeploy}`).

`LandingPage.tsx` renders `<OperativesGrid operatives={seedOperatives} />` with NO `onDeploy` prop passed (confirmed by grep: `grep -n "onDeploy" src/panels/landing/LandingPage.tsx` returns only the comment on line 102). Each Deploy button therefore invokes `console.info(\`Deploy: <Codename>\`)` and nothing else.

No navigation, no IPC, no network call, no store mutation is present or possible in the click handler.

Citation: `src/panels/landing/components/OperativeCard.tsx` lines 32–38 (handleDeploy), `src/panels/landing/LandingPage.tsx` line 108 (no onDeploy prop).

---

## CONS-12 Confirmation (single shared `--lp-accent-red` for all three top rules)

`OperativeCard.module.css` line 24: `.topRule { border-top: 2px solid var(--lp-accent-red); }`

This is a single CSS class (`.topRule`) applied uniformly to all three operative cards via the `<div className={styles.topRule}>` in `OperativeCard.tsx`. There are no per-card CSS variants (`--lp-accent-reviewer`, `--lp-accent-analyst`, `--lp-accent-archivist`, or conditionally-applied class names) anywhere in Phase 3 code.

Citation: `src/panels/landing/components/OperativeCard.module.css` line 24.

---

## Inline SVG Confirmation (ADR §D5)

**ClassifiedStamp:** `src/panels/landing/components/ClassifiedStamp.tsx` renders `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">` inline in JSX. No `.svg` file imported. No `<img>` tag. No CSS-only rendering. The stamp text "CLASSIFIED" appears as a `<text>` child element, verifiable in the DOM.

**RedactedSilhouette:** `src/panels/landing/components/RedactedSilhouette.tsx` renders `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">` inline in JSX with `<circle>` head and `<path>` shoulders. No raster image. No external SVG file.

---

## Phase 4 Work Did Not Leak In

- **No ProjectSelector open/close state:** `ProjectSelector.tsx` is unchanged from Phase 2 — trigger-only, no `useState`, no `open` logic.
- **No keyboard focus management:** No `useRef` for focus management, no `aria-activedescendant` keyboard-navigation logic.
- **No responsive media queries beyond Phase 1:** `LandingPage.module.css` is unchanged. The only media query for the responsive range (`@media (max-width: 1279px)`) was set in Phase 1 and Phase 2. Phase 3 CSS modules add their own `@media (max-width: 1279px)` padding rules matching the established pattern.
- **Deploy button CSS states:** Per PRD §9 Phase 3 implementation notes, hover/focus-visible/active/disabled CSS states for the Deploy button ARE Phase 3 work. These are implemented in `OperativeCard.module.css`. This is not Phase 4 leakage — Phase 4 owns "keyboard and focus-management AC" (AC-044) and final AC-035 verification, not the CSS itself.
- **LIVE pulse reduced-motion rule:** The `@media (prefers-reduced-motion: reduce)` rule for `.liveDot` is in `TransmissionsFeed.module.css`. This CSS rule is safe to include in Phase 3 since it governs a Phase 3 CSS animation. AC-042 (Phase 4) is the verification AC; the rule itself is Phase 3 component work.

---

## Phase 1 + Phase 2 Invariants Hold

- **`tokens.css` unchanged:** `git diff HEAD src/styles/tokens.css` returns empty diff. Confirmed unchanged.
- **`App.tsx` unchanged from Phase 1:** Phase 3 does not touch `App.tsx`. The surface switcher from Phase 1 remains intact.
- **`tokens-landing.css` zero `--lp-*` under `:root`:** `grep -n "^:root" src/styles/tokens-landing.css` returns zero matches. All tokens remain under `.landing-root { }`.
- **`LandingPage.module.css` unchanged:** Phase 3 does not modify `LandingPage.module.css`. All region class definitions are unchanged from Phase 1.
- **Settings cold-start:** `readInitialSurface()` in `App.tsx` still returns `"settings"` by default. `ClaudeSettingsPanel` is the cold-start surface.
- **Phase 1 computed-style baseline:** `tokens-landing.css` has no rules outside `.landing-root { }`. The `@font-face` declarations only register font families — they do not apply `font-family` to any settings-panel element. All four baseline values from Phase 1 (`font-size: 12px`, `color: rgb(155, 163, 180)`, `background-color: rgba(0, 0, 0, 0)`, system `font-family`) remain unchanged.

---

## Deviations from PRD/ADR

**None.** All implementation follows PRD §9 Phase 3 implementation notes and ADR §D1–D12 exactly.

**Minor decision — inner content column for TransmissionsFeed:** The dark band (`regionTransmissions`) is full-width, so `TransmissionsFeed.tsx` wraps its content in an `.inner` div with `max-width: var(--lp-content-max); padding: 0 var(--lp-page-pad-x)` to align the feed content with the rest of the page. This is a layout necessity, not a deviation — the PRD's per-region specs in §8 describe the dark band as full-width with content alignment matching the page column.

**LIVE indicator empty-state behavior (AC-028):** AC-028 specifies "the `● LIVE` indicator continues to render" when the array is empty. This is satisfied because the `.header` div (containing the LIVE indicator) is always rendered; only the `.rows` div's content changes based on `transmissions.length`. Verified by reading `TransmissionsFeed.tsx` — the `{transmissions.length === 0 ? emptyState : rows}` conditional is inside `.rows`, not inside the whole component.

---

## Decisions Made Not Pre-Specified

**`FIELD_LABELS` constant in PersonnelFileCard:** Rather than hardcoding 7 JSX blocks individually, a `FIELD_LABELS` array maps label strings to `keyof Agent`. This is a rendering convenience, not an architectural decision — all values still come from the `agent` prop and AC-024's seam check is satisfied.

**`liveDot` wrapping span:** The pulsing CSS animation targets `.liveDot` via the `animation` property, while the outer `.liveIndicator` span handles color and font. This separation lets the pulse animation be removed by overriding `.liveDot { animation: none }` in the reduced-motion media query without affecting the text styling.

**`<article>` for PersonnelFileCard and OperativeCard:** Both cards represent self-contained content units, making `<article>` semantically correct per HTML spec. The `aria-label` distinguishes them from each other.

**`<dl>` for field table:** `PersonnelFileCard.tsx` uses `<dl>` (definition list) with `<dt>` labels and `<dd>` values for the field table. This is the correct semantic HTML for label/value pairs. AC-021 requires "labeled fields with monospace UI labels and corresponding values" — `<dl>/<dt>/<dd>` satisfies this semantically.

---

## QA Notes

**AC-021 verification:** `document.querySelectorAll('[data-testid="personnel-file-card"] dt')` should return 7 elements with text: `ACTIVE FILE`, `CODENAME`, `CALLSIGN`, `SPECIALTY`, `CLEARANCE`, `LAST SEEN`, `STATUS`. `document.querySelectorAll('... dd')` should return 7 values: `0427-A`, `HAWKEYE`, `code-review`, `sonnet`, `all tools`, `~ 2d`, `Active`.

**AC-022 verification:** `document.querySelector('[data-testid="personnel-file-card"] p').textContent` should equal `REDACTED`. The `<svg>` (silhouette) should be present inside the photo-background div. No `<img>` element should be present.

**AC-023 verification:** `document.querySelector('.ClassifiedStamp_stamp__*')` (or by role/aria) should have a computed `transform` that includes `rotate(-15deg)`. The `<svg>` should contain a `<text>` element with `textContent === 'CLASSIFIED'`. Color of the text `fill` attribute should be `var(--lp-accent-red)`.

**AC-027 verification:** `document.querySelectorAll('[data-testid="transmission-row"]')` should return exactly 4 elements. Each element's text content (normalized) should match the 4 rows in order.

**AC-029 verification:** `git grep useEffect src/panels/landing/components/TransmissionsFeed.tsx` returns zero code lines. No intervals/timeouts in the component.

**AC-030 verification:** `document.querySelector('[data-testid="operatives-grid"] h2').textContent` should equal `Field-ready operatives`. `getComputedStyle(h2).fontFamily` should begin with `"EB Garamond"`. `getComputedStyle(h2).fontStyle` should equal `italic`.

**AC-031 verification:** `document.querySelectorAll('[data-testid^="operative-card-"]')` should return 3 elements with IDs `operative-card-hawkeye`, `operative-card-echo`, `operative-card-ghost` in document order.

**AC-034 verification:** Each `[data-testid^="deploy-button-"]` button should have `type="button"`, `aria-label` matching `Deploy Hawkeye` / `Deploy Echo` / `Deploy Ghost`, and `textContent.trim() === 'DEPLOY'`.

**AC-036 verification:** Open DevTools console, click a Deploy button. Should see `Deploy: Hawkeye` (or Echo/Ghost) logged to console. No navigation, no network requests in the Network tab, no error thrown.

**AC-038 verification:** `document.querySelector('[data-testid="footer"]').textContent` should contain `v0.1 · ~/.CLAUDE` and `ENCRYPTED AT REST`. Left span and right span should be flex children with `justify-content: space-between`.

**AC-041 verification:** `document.querySelectorAll('h1')` returns exactly 1 element (the hero). `document.querySelectorAll('h2')` returns exactly 1 element ("Field-ready operatives" in OperativesGrid). `document.querySelectorAll('h3')` returns exactly 3 elements (Hawkeye, Echo, Ghost codenames). No `h4` or higher.

**AC-043 verification:** All four contrast ratios are above 4.5:1 (computed from token hex values above and confirmed by PRD §10 for the red-on-cream pairing at 5.4:1).

**Deploy button CSS states (Phase 3 implementation for Phase 4 AC-035):** QA can preview these states by hovering over a Deploy button (hover state: dark background, cream text), tabbing to it (focus-visible: 2px red outline), and clicking + holding (active: red background, cream text). To verify disabled state: use React DevTools to set `disabled: true` on one operative in the seed, or temporarily edit `seedOperatives.ts` to add `disabled: true` to one entry — button should show 50% opacity and not respond to clicks.

---

Status: READY_FOR_QA
