# QA Verdict: PASS

**Phase:** 1 — Foundation (tokens, fonts, surface switcher, overflow scope)
**Attempt:** 1
**Date:** 2026-05-03
**QA method:** Deterministic inspection per ADR §D7/D10 (no test runner this run)

---

## Step 1 — AC Testability Pre-Check

All five Phase 1 ACs were evaluated for falsifiability by deterministic inspection alone.

| AC | Testability | Verdict |
|---|---|---|
| AC-001 | Data-testid attributes in document order — binary DOM check | TESTABLE |
| AC-002 | Cold-start default surface + settings panel behavioral regression — code + computed-style check | TESTABLE |
| AC-003 | Overflow CSS chain — static rule analysis (no live browser required) | TESTABLE |
| AC-039 | Absence of `:root` selector in `tokens-landing.css` + `tokens.css` diff from baseline | TESTABLE |
| AC-040 | `@font-face` declarations, `font-display: swap`, font-style: italic, absence of CDN references, woff2 files on disk, hashed files in production bundle | TESTABLE |

No AC rejected as untestable. No planning-trio escalation required.

---

## Step 2 — AC Verification

### AC-001: Page shell with data-testid regions in document order

**Spec:** A top-level container with `data-testid="landing-page"` containing, in document order, eight child regions: header, status, project-selector, hero, personnel-file, transmissions-feed, operatives-grid, footer.

**Evidence:**

`src/panels/landing/LandingPage.tsx` — lines 16–74:

```tsx
<div className="landing-root" data-testid="landing-page">
  <div className={styles.page}>
    <section data-testid="region-header" aria-label="Header" />
    <section data-testid="region-status" aria-label="Status" />
    <section data-testid="region-project-selector" aria-label="Project selector" />
    <section data-testid="region-hero" aria-label="Hero" />
    <section data-testid="region-personnel-file" aria-label="Personnel file" />
    <section data-testid="region-transmissions-feed" aria-label="Recent transmissions" />
    <section data-testid="region-operatives-grid" aria-label="Field-ready operatives" />
    <section data-testid="region-footer" aria-label="Footer" />
  </div>
</div>
```

All nine `data-testid` values present: `landing-page` (root), plus one per region in the exact document order specified. Regions are empty stubs — no Phase 2/3/4 content has leaked in. The root div carries the plain class string `"landing-root"` (not a CSS-module-hashed class — satisfies CONS-14).

**Verdict: PASS**

---

### AC-002: Settings panel loads as cold-start default; no regression

**Spec:** Cold open renders `ClaudeSettingsPanel` without errors; all controls operable. Regression guard.

**Evidence:**

`src/App.tsx` lines 16–19:
```tsx
function readInitialSurface(): Surface {
  if (typeof window === "undefined") return "settings";
  const params = new URLSearchParams(window.location.search);
  return params.get("surface") === "landing" ? "landing" : "settings";
}
```

`readInitialSurface()` returns `"settings"` for every URL that does not contain `?surface=landing`. The `useState` is initialized via `useState<Surface>(readInitialSurface)` — the function reference (not call) — so this is the initializer form, evaluated once at mount. Cold open with no query param renders `<ClaudeSettingsPanel />`.

CONS-03 regression check (static-derived, matching Builder's exploration baseline):

The only changes to the document CSS are:
1. `tokens-landing.css` is a side-effect import in `LandingPage.tsx`. Because `LandingPage.tsx` is imported at the top of `App.tsx`, the stylesheet is included in the bundle. However, every rule in `tokens-landing.css` is either: (a) an `@font-face` declaration — these register font families but do not change computed styles of any element that does not reference those families by name; or (b) scoped inside `.landing-root { ... }` — this selector does not match anything in the settings panel DOM.
2. `tokens.css` is unchanged (confirmed: `grep "^:root" tokens.css` returns exactly 1 match at line 1, unchanged structure; `grep "overflow: hidden" tokens.css` returns line 111, unchanged).

Settings-panel computed-style baseline (static derivation, unchanged post-Phase-1):

| Property | Baseline | Post-Phase-1 | Drift |
|---|---|---|---|
| `font-family` | `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif` | unchanged | none |
| `font-size` | `12px` | unchanged | none |
| `color` | `rgb(155, 163, 180)` | unchanged | none |
| `background-color` | `rgba(0, 0, 0, 0)` | unchanged | none |

Source: `tokens.css:38` (`--font-sans`), `tokens.css:42` (`--text-sm: 12px`), `tokens.css:17` (`--text-secondary: #9ba3b4` → `rgb(155, 163, 180)`), `ClaudeSettingsPanel.module.css:106` (`background: transparent` → `rgba(0,0,0,0)`).

**Verdict: PASS**

---

### AC-003: Landing surface scrolls; settings panel overflow unaffected

**Spec:** Landing route is not blocked by global `overflow: hidden`. Settings panel overflow unchanged.

**Evidence:**

`src/styles/tokens.css` lines 105–112 — **unmodified**:
```css
html,
body,
#root {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden; /* the app is a desktop chrome, not a scrolling document */
}
```

`src/styles/tokens-landing.css` lines 93–98 — scoped scroll container:
```css
/* scroll container scoped so global overflow:hidden stays untouched */
position: absolute;
inset: 0;
overflow-y: auto;
overflow-x: hidden;
```

These rules are inside the `.landing-root { ... }` block (lines 48–100). The `<div className="landing-root">` is a child of `#root`. Because `#root` is `overflow: hidden` and `.landing-root` is `position: absolute; inset: 0`, the landing root fills the viewport and its own `overflow-y: auto` provides the scroll context. Vertical content taller than the viewport will scroll within `.landing-root`, not at `body` or `#root`. The settings panel surface (`<ClaudeSettingsPanel />`) is rendered instead when `surface === "settings"` — there is no `.landing-root` element in the DOM at that time, so the overflow scoping has zero effect on it.

**Verdict: PASS**

---

### AC-039: Landing tokens namespaced, scoped, do not redefine settings tokens

**Spec:** Cream surface, dark feed, red accent tokens exist under a namespaced landing token set. No existing `ClaudeSettingsPanel` token is redefined.

**Evidence: no `:root` selector in tokens-landing.css**

```
$ grep -n "^:root\|^\s*:root" src/styles/tokens-landing.css
(no output)
```

The only mention of `:root` in the file is in a comment on line 3 ("Scoped under .landing-root — NEVER under :root."). There is no `:root {}` rule.

All `--lp-*` tokens are declared inside `.landing-root { ... }` (lines 48–100). Token names: `--lp-surface-cream`, `--lp-surface-dark`, `--lp-accent-red`, `--lp-font-display`, `--lp-font-mono`, etc. — every name starts with `--lp-`. No name overlaps with any token in `tokens.css` (`--bg-*`, `--border-*`, `--text-*`, `--accent-primary`, `--font-sans`, `--font-mono`, etc.).

**Evidence: tokens.css unchanged**

```
$ grep -c "^:root" src/styles/tokens.css
1
$ grep -c "overflow: hidden" src/styles/tokens.css
1
```

One `:root` block, one `overflow: hidden` rule — both at the expected lines, structure identical to the baseline in the exploration note.

CONS-13 check: the `@font-face` block for EB Garamond italic declares `font-style: italic` (line 21 of `tokens-landing.css`) and points to `EBGaramond-Italic.woff2`. No synthetic oblique from the regular file.

**Verdict: PASS**

---

### AC-040: Display font serif + mono UI font, no CDN, font-display: swap

**Spec:** Display headings use serif display family token; UI labels use mono UI family token. Both loaded via bundled `.woff2` with explicit fallbacks, no CDN dependency.

**Evidence: @font-face declarations**

`tokens-landing.css` lines 10–44:
- EB Garamond Regular 400: `font-style: normal`, `font-weight: 400`, `font-display: swap`, `url("../assets/fonts/eb-garamond/EBGaramond-Regular.woff2")`
- EB Garamond Italic 400: `font-style: italic`, `font-weight: 400`, `font-display: swap`, `url("../assets/fonts/eb-garamond/EBGaramond-Italic.woff2")`
- JetBrains Mono Regular 400: `font-style: normal`, `font-weight: 400`, `font-display: swap`, `url("../assets/fonts/jetbrains-mono/JetBrainsMono-Regular.woff2")`
- JetBrains Mono Medium 500: `font-style: normal`, `font-weight: 500`, `font-display: swap`, `url("../assets/fonts/jetbrains-mono/JetBrainsMono-Medium.woff2")`

`font-display: swap` present on all four (`grep -c "font-display: swap" tokens-landing.css` → `4`).

**Evidence: font files exist on disk**

```
src/assets/fonts/eb-garamond/EBGaramond-Regular.woff2   21,704 bytes
src/assets/fonts/eb-garamond/EBGaramond-Italic.woff2    22,172 bytes
src/assets/fonts/jetbrains-mono/JetBrainsMono-Regular.woff2  31,432 bytes
src/assets/fonts/jetbrains-mono/JetBrainsMono-Medium.woff2   21,832 bytes
```

**Evidence: production bundle contains all four with Vite content hashes**

```
out/renderer/assets/EBGaramond-Regular-DSJrtJSV.woff2
out/renderer/assets/EBGaramond-Italic-KGnr19QW.woff2
out/renderer/assets/JetBrainsMono-Regular-6fWv1k7M.woff2
out/renderer/assets/JetBrainsMono-Medium-BWZEU5yA.woff2
```

**Evidence: no CDN references**

```
$ grep -r "fonts.googleapis.com|fonts.gstatic.com|cdn.jsdelivr|unpkg.com|cdnjs.cloudflare" src/ public/ index.html
(no output)
```

**Evidence: fallback chains**

`tokens-landing.css` inside `.landing-root`:
```css
--lp-font-display: "EB Garamond", Georgia, "Times New Roman", serif;
--lp-font-mono: "JetBrains Mono", "SF Mono", Menlo, Monaco, ui-monospace, monospace;
```

Both token values include explicit multi-level fallback chains ending in a generic keyword (`serif`, `monospace`).

**Verdict: PASS**

---

## Step 3 — CONS-15 Production Bundle Structural Gate

**Check:** Dev switch button strings `"→ landing"` and `"→ settings"` must be absent from the production bundle (`out/renderer/assets/index-DUA89k5a.js`).

```
$ grep -c "→ landing\|→ settings" out/renderer/assets/index-DUA89k5a.js
0
```

Zero matches. Vite dead-code-eliminated the `{import.meta.env.DEV && (<button.../>)}` block. The structural gate (`import.meta.env.DEV` at line 30 of `App.tsx`) — not CSS visibility — is confirmed to be working.

**CONS-15: PASS**

---

## Step 4 — Anti-Pattern / Leakage Checks

**No Phase 2/3/4 component leakage:**

`src/panels/landing/LandingPage.tsx` has exactly two import statements (lines 6–7):
- `import "../../styles/tokens-landing.css";`
- `import styles from "./LandingPage.module.css";`

No imports of `HeaderBar`, `StatusBar`, `ProjectSelector`, `Hero`, `PersonnelFileCard`, `TransmissionsFeed`, `OperativesGrid`, `OperativeCard`, `Footer`, `ClassifiedStamp`, or `RedactedSilhouette`. All eight regions are empty `<section>` stubs. CONS-09: PASS.

**No router:**

```
$ grep -i "react-router|wouter|@remix-run" package.json
(no output)
```

CONS-04: PASS.

**No font-loading library:**

No `webfontloader`, `fontsource`, or any font-cdn npm package added.

CONS-05 / CONS-08: PASS.

**CONS-06 (cold-start default):** `readInitialSurface()` returns `"settings"` unless `?surface=landing` is explicitly in the query string. PASS.

**CONS-07 (structural DEV gate):** `import.meta.env.DEV` wraps the button at `App.tsx:30`. PASS.

**CONS-13 (no synthetic italic):** EB Garamond italic `@font-face` declares `font-style: italic` (line 21 of `tokens-landing.css`) and points to the dedicated italic woff2 file. PASS.

**CONS-14 (no module hash on root class):** `<div className="landing-root">` uses a plain string. PASS.

---

## AC Coverage Summary

| AC | Criterion | Tests | Result |
|---|---|---|---|
| AC-001 | Page shell + 8 regions in document order | DOM structure inspection of `LandingPage.tsx` | PASS |
| AC-002 | Settings panel default; no computed-style regression | `readInitialSurface()` logic + static CSS chain analysis + CONS-03 table | PASS |
| AC-003 | Landing scrolls; settings overflow unaffected | CSS chain inspection of `tokens.css` + `tokens-landing.css` | PASS |
| AC-039 | Token bifurcation: no `:root` in landing tokens, `tokens.css` untouched | grep `tokens-landing.css` for `:root` selector; verify `tokens.css` unchanged | PASS |
| AC-040 | Fonts bundled, no CDN, `font-display: swap`, fallbacks present | `@font-face` inspection, disk file check, production bundle file list, CDN grep | PASS |

5 / 5 AC covered, 5 / 5 PASS.

---

## CONS Summary

| CONS | Description | Result |
|---|---|---|
| CONS-03 | Settings panel computed-style unchanged | PASS |
| CONS-13 | No synthetic italic (real italic woff2 + `font-style: italic`) | PASS |
| CONS-15 | Dev switch button absent from production bundle | PASS |

---

## Test Results

- New tests (deterministic inspection checks): 5/5 PASS
- Full suite: N/A — no test runner in this run (ADR §D7)
- Regressions: none detected (settings-panel CSS chain analysis shows zero drift)

---

## Files Inspected

| File | Covers |
|---|---|
| `src/App.tsx` | AC-001, AC-002, CONS-06, CONS-07, CONS-15 |
| `src/styles/tokens-landing.css` | AC-003, AC-039, AC-040, CONS-01, CONS-10, CONS-13 |
| `src/styles/tokens.css` | AC-002, AC-003, AC-039, CONS-02 |
| `src/panels/landing/LandingPage.tsx` | AC-001, CONS-09, CONS-12, CONS-14 |
| `src/panels/landing/LandingPage.module.css` | AC-003 (scroll container layout) |
| `src/panels/landing/types.ts` | CONS-11 (type-only, no runtime imports) |
| `src/assets/fonts/eb-garamond/` | AC-040 (woff2 files present, correct sizes) |
| `src/assets/fonts/jetbrains-mono/` | AC-040 (woff2 files present, correct sizes) |
| `out/renderer/assets/` | AC-040 (hashed woff2 in bundle), CONS-15 |
| `package.json` | CONS-04, CONS-08 |

---

## Observations for Reviewer (non-blocking)

1. `tokens-landing.css` imports are side-effect-only (`import "../../styles/tokens-landing.css"` in `LandingPage.tsx`). Because `LandingPage.tsx` is always imported by `App.tsx` at module parse time, the CSS is always included in the bundle even when the landing surface is never rendered. This is expected for Vite CSS side-effect imports, and has no behavioral impact since all rules are scoped to `.landing-root`. Reviewer may want to note this for future phases.

2. The `LandingPage.module.css` `.regionTransmissions` stub already sets `background: var(--lp-surface-dark)` on an empty region. This is Phase 3 content that leaked into the Phase 1 scaffold CSS, but it has zero visible impact since the region is empty and the class is only applied to a stub `<section>`. Not a Phase 1 AC violation — surfacing for Reviewer awareness.

3. `App.tsx` is 55 lines. The PRD §9 implementation notes specify "≤30 lines for the switcher." The function itself (`readInitialSurface` + `App` component) is 30 lines of logic; the additional 25 lines are comments/whitespace and the `style` object for the dev button. This is at the Reviewer's discretion to assess; it does not affect any Phase 1 AC.

---

## Phase Status

QA_PASS — advancing to Reviewer.
