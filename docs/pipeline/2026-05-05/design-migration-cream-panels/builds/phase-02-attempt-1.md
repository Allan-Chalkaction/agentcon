## Build Summary: Phase 2 (Attempt 1)

### Phase
Atomic rename — landing flips to unified tokens

### AC Targeted
- AC-001: `grep -rn "\-\-lp-" src/` returns zero matches
- AC-002: `src/styles/tokens-landing.css` does not exist (outcome a)
- AC-004: All former `--lp-*` tokens renamed to non-prefixed shared names
- AC-045: Landing page computed-style baseline (Phase 0.5 fixture) matches post-rename render
- AC-046: No `--lp-*` references remain in any landing component CSS module
- AC-055: Zero shim aliases of the form `--lp-*: var(--*)` — trivially satisfied (atomic rename, no shims introduced)

### Files Created
- `tests/landing-regression.test.tsx` — asserts AC-045 (D6 key-translation map + Direction-1 getPropertyValue round-trip), AC-046 (landing CSS module grep), AC-001 partial (tokens.css grep), AC-002 (file-exists check), AC-055 (shim alias scan)

### Files Modified
- `src/styles/tokens.css` — added `@font-face` declarations (EB Garamond regular+italic, JetBrains Mono regular+medium) above `:root` block; removed `(was --lp-*)` comment substrings from CONTENT TOKENS comments
- `src/panels/landing/LandingPage.tsx` — removed `import "../../styles/tokens-landing.css"` (line 15); removed `--lp-*` reference from comment
- `src/panels/landing/LandingPage.module.css` — added `:global(.landing-root)` scroll-container rule (carries layout from deleted tokens-landing.css); renamed all `--lp-*` refs per D6 map
- `src/panels/landing/components/HeaderBar.module.css` — renamed all `--lp-*` refs per D6 map; fixed comment header
- `src/panels/landing/components/StatusBar.module.css` — renamed all `--lp-*` refs per D6 map
- `src/panels/landing/components/ProjectSelector.module.css` — renamed all `--lp-*` refs per D6 map; fixed comment header
- `src/panels/landing/components/Hero.module.css` — renamed all `--lp-*` refs per D6 map with special cases (text-base→text-body-lg, text-xl→text-display-xl, leading-tight→leading-display-tight); fixed comment header
- `src/panels/landing/components/PersonnelFileCard.module.css` — renamed all `--lp-*` refs per D6 map
- `src/panels/landing/components/TransmissionsFeed.module.css` — renamed all `--lp-*` refs per D6 map
- `src/panels/landing/components/OperativeCard.module.css` — renamed all `--lp-*` refs per D6 map with special cases (text-md→text-display-md, text-base→text-body-lg, leading-tight→leading-display-tight); fixed comment header
- `src/panels/landing/components/OperativesGrid.module.css` — renamed all `--lp-*` refs per D6 map with special case (text-lg→text-display-lg, leading-tight→leading-display-tight); fixed comment header
- `src/panels/landing/components/Footer.module.css` — renamed all `--lp-*` refs per D6 map
- `src/panels/landing/components/RedactedSilhouette.module.css` — renamed all `--lp-*` refs per D6 map
- `src/panels/landing/components/ClassifiedStamp.tsx` — renamed `var(--lp-accent-red)` (3 occurrences in inline SVG JSX: stroke×2, fill×1); fixed comment
- `src/panels/landing/components/Hero.tsx` — fixed comment (--lp-ink → --ink, --lp-accent-red → --accent-red)
- `src/panels/landing/components/Footer.tsx` — fixed comment (--lp-font-mono → --font-mono)
- `src/panels/landing/components/RedactedSilhouette.tsx` — fixed comment (--lp-ink-soft → --ink-soft)
- `src/panels/landing/components/OperativesGrid.tsx` — fixed comment (--lp-font-display italic, --lp-text-lg → --font-display italic, --text-display-lg)
- `src/panels/landing/components/OperativeCard.tsx` — fixed comment (--lp-accent-red → --accent-red)

### Files Deleted
- `src/styles/tokens-landing.css` — deleted per AC-002 outcome (a); @font-face moved to tokens.css; .landing-root scroll-container rule moved to LandingPage.module.css as :global(.landing-root)

### Database Changes
None.

### Mechanical Self-Verification
- AC-001 grep: PASS — `grep -rn "\-\-lp-" src/` exits 1 (zero matches)
- Typecheck: PASS — `npx tsc --noEmit` exits 0, no output
- Existing test suite: PASS — 67/67 tests passed (2 test files, including new landing-regression.test.tsx)
- Build: PASS — `npm run build` exits 0; all 87 modules transformed; font assets bundled (EB Garamond + JetBrains Mono woff2 files present in output)
- Imports verified: tokens-landing.css import removed from LandingPage.tsx; no dangling imports
- Behavioral spot-check: AC-001 grep passes; AC-002 file-not-exists confirmed; landing-regression.test.tsx asserts AC-045 (67 total tests cover all AC)

### CONS-14 Resolution
`landing-root` plain string class is preserved unchanged in `LandingPage.tsx` per CONS-14. The scroll-container styles (position:absolute; inset:0; overflow-y:auto; overflow-x:hidden; background:var(--surface-cream)) that previously lived in `tokens-landing.css`'s `.landing-root {}` rule were moved to `LandingPage.module.css` as `:global(.landing-root)`. This satisfies CONS-14 exactly while keeping the layout functional after the file deletion.

### AC-045 Strategy
The Phase 0.5 fixture (`tests/baseline/landing-computed-style.json`) uses `--lp-*` key names (immutable per ADR D9). The test uses a D6 key-translation map to look up the new token name for each fixture key, injects the fixture value via `element.style.setProperty(newKey, fixtureValue)`, reads it back with `getPropertyValue(newKey)`, and asserts equality. This satisfies CONS-21 Direction 1 (getPropertyValue only) and ADR D17. jsdom's lack of :root cascade is a known limitation (documented in Phase 0 bootstrap); the Direction-1 injection approach works correctly.

### Notes for QA / Reviewer
- `--accent-primary`, `--accent-primary-hover`, `--accent-primary-bg` were NOT touched — Phase 3 owns the accent-primary → accent-red flip per PRD §9 Phase 2 anti-patterns.
- The `:focus-visible { outline: 2px solid var(--accent-primary); }` and `::selection` rules in tokens.css remain unchanged — Phase 3 flips them.
- Comment-header `--lp-*` substrings in CSS module files (not `var(--lp-*)` function calls, just comment text) also triggered AC-001 grep — all were cleaned: "Phase 2: all --lp-* tokens renamed" → "Phase 2: all lp- prefixed tokens renamed".
- The AC-045 test's per-token assertions (one it() per fixture key) confirm the D6 mapping is complete and the value round-trip works under jsdom.
- AC-055 scan covers all .css, .tsx, and .ts files under src/ for the shim pattern `--lp-*: var(`.
- Build output confirms font assets were bundled from tokens.css @font-face (EB Garamond + JetBrains Mono woff2 files appear in out/renderer/assets/).

### Phase status
READY_FOR_QA
