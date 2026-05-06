## Reviewer Verdict: PASS

**Phase:** 1 — Foundation (tokens, fonts, surface switcher, overflow scope)
**Attempt:** 1
**Date:** 2026-05-03

---

### Findings Summary

- BLOCKING: 0
- HIGH: 0
- SUGGESTION: 0
- NIT: 3 (all three are the QA observations — assessed and classified below)

---

### Convention Compliance

All conventions from `.claude/rules/`, the ADR, and the PRD §9 Phase 1 implementation notes are followed.

- CONS-01 (token scope): all `--lp-*` tokens declared inside `.landing-root {}`. Zero `:root` rules. PASS.
- CONS-02 (tokens.css untouched): `src/styles/tokens.css` confirmed unmodified. PASS.
- CONS-03 (overflow global rule): `html, body, #root { overflow: hidden }` at `tokens.css:105-112` is untouched. `.landing-root` declares its own `position: absolute; inset: 0; overflow-y: auto`. PASS.
- CONS-04 (no router): confirmed by `package.json` — no `react-router`, `wouter`, or `@remix-run/*` in dependencies. PASS.
- CONS-05 (no CDN fonts): no `<link>` tags for remote fonts in `index.html`. No CDN references in any Phase 1 file. PASS.
- CONS-06 (cold-start default): `readInitialSurface()` returns `"settings"` for every URL without `?surface=landing`. PASS.
- CONS-07 / CONS-15 (structural DEV gate): `App.tsx:30` uses `{import.meta.env.DEV && (...)}` — structural gate, not CSS-hidden. The button is absent from the JSX tree in production, not merely hidden. PASS.
- CONS-08 (no new deps): `package.json` unchanged. PASS.
- CONS-09 (no Phase 2/3/4 leakage): `LandingPage.tsx` has exactly two imports; no component imports. Eight empty `<section>` stubs only. PASS. (One NIT on the CSS file — see below.)
- CONS-10 (font URL path): `@font-face` src values use `url("../assets/fonts/...")` relative to `src/styles/tokens-landing.css`. Vite-resolvable. PASS.
- CONS-11 (types.ts type-only): `types.ts` has zero `import` statements. PASS.
- CONS-12 (tokens-landing imported from LandingPage): import is at `LandingPage.tsx:6`, not from `main.tsx`. PASS.
- CONS-13 (no synthetic italic): EB Garamond Italic `@font-face` declares `font-style: italic` at `tokens-landing.css:21` and points to `EBGaramond-Italic.woff2`. Not synthesized from the regular file. PASS.
- CONS-14 (no module hash on root class): `LandingPage.tsx:16` uses `className="landing-root"` as a plain string literal. PASS.

CONS-13 scope discipline spot-check: `tokens-landing.css` has exactly five top-level blocks — four `@font-face` declarations and one `.landing-root {}` block. No `@layer`, no `*` selector, no `html`/`body`/`#root` rules, no implicit global tricks. All `--lp-*` tokens are declared inside `.landing-root`. The discipline is clean.

---

### Builder Exploration Consistency

Implementation matches all claimed patterns from `phase-01-exploration.md`.

- Surface switcher pattern matches the exact code template in the exploration note (and the PRD §9 template).
- CONS-03 baseline derivation is identical between exploration note and build summary.
- The `readInitialSurface()` implementation matches the function signature Builder described.
- The exploration note's "critical self-correction" on CSS side-effect imports correctly identifies the behavior and correctly concludes the scoping makes it safe — this was not a surprise in the final code.
- Font files were pre-existing in the repo. Builder disclosed this clearly in the build summary ("they were already bundled before this invocation"). This is not a process concern — the deliverable is correct regardless of origin.
- No anti-patterns in the exploration list were violated in the final implementation.

---

### Correctness

**`readInitialSurface()` (`App.tsx:16-20`):** Uses `new URLSearchParams(window.location.search)` with `.get("surface") === "landing"` — a pure string equality check. Safe against malformed URLs (no manual string slicing). SSR-safe with the `typeof window === "undefined"` guard. The value never flows to `dangerouslySetInnerHTML`, `eval`, or any sink. It feeds only the `useState` initial value. Correct.

**`useState<Surface>(readInitialSurface)` (`App.tsx:23`):** Passes the function reference (lazy initializer), not a call. Evaluated once at mount. Correct React idiom.

**Conditional render (`App.tsx:27`):** `{surface === "settings" ? <ClaudeSettingsPanel /> : <LandingPage />}` — exactly two surfaces, exhaustive. No edge case where both render simultaneously. Correct.

**AC-001 region order:** `LandingPage.tsx` regions appear in document order: header → status → project-selector → hero → personnel-file → transmissions-feed → operatives-grid → footer. Matches PRD AC-001 ordering exactly. Correct.

**TypeScript types (`types.ts`):** All four interfaces match the PRD §8 data model exactly:
- `Agent`: fileId, codename, callsign, specialty, clearance, lastSeen, status — all present.
- `Transmission`: timestamp, codename, action — matches AC-026 row shape.
- `Operative`: id, index, className, status, codename, callsignLine, description, model, missions, disabled? — matches AC-031/032/037 seam. The `disabled?` seam (ADR §D12) is present.
- `ProjectOption`: id, label — matches AC-007/AC-008 seam.

No drift from PRD data model. All prop seams for AC-024/026/031/037 are correct.

**Overflow scoping (`tokens-landing.css:93-99`):** `.landing-root` declares `position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden;` inside the `.landing-root {}` block — correctly scoped. `#root` remains `overflow: hidden`. The two containers coexist cleanly: `#root` clips everything, `.landing-root` fills the clip region and provides its own vertical scroll context. Correct.

---

### Performance

No N+1 queries, no synchronous heavy compute, no subscriptions without cleanup, no unstable prop references, no avoidable network round-trips. This phase is a CSS + shell scaffold.

**Font preload directives:** `index.html` has no `<link rel="preload">` for the woff2 files. This is consistent with the ADR §D6 decision to use `@font-face` with `font-display: swap`. The `swap` strategy allows text to render with system fallbacks immediately, then swaps in the custom fonts when they load. This is the correct tradeoff for a desktop Electron app where latency is local I/O, not network. No preload is needed and the ADR does not prescribe it.

**CSS import loading:** `tokens-landing.css` is imported via `LandingPage.tsx` which is always imported by `App.tsx`. Vite CSS side-effect imports are always bundled. The CSS enters the bundle whether or not the landing surface is rendered. This is the known behavior described in the ADR. See NIT-1 below.

No render-blocking `@import` chains. No HTTP import chains. All CSS is bundled by Vite. Clean.

---

### Security Smells

None found.

- No hardcoded secrets, API keys, or tokens.
- `?surface=landing` reader: pure string equality at `App.tsx:19`. Value goes only into `useState` to seed a `"settings" | "landing"` union type. No XSS path.
- No raw SQL, no `dangerouslySetInnerHTML`, no `eval`.
- No auth check missing (no auth surface in this phase).
- No sensitive data logged (the dev button renders label text "→ landing" / "→ settings" — not sensitive).
- No third-party fetches. No analytics. No CDN. No telemetry.
- No service-role client patterns (no backend in this app layer).

---

### UI Spec Compliance

Phase 1 visual scope is "empty shell." The rendered DOM at `?surface=landing` has:
- One root `<div className="landing-root" data-testid="landing-page">` — the cream scroll container.
- Eight empty `<section>` stubs with `data-testid` and `aria-label` attributes only.
- No visible content beyond the cream background color.

This is exactly correct for Phase 1. Nothing in Phase 1 contradicts the locked visual spec in the mockup. The mockup confirms the cream surface base color, which is established by `.landing-root { background: var(--lp-surface-cream) }` — correct token applied.

Token values in `tokens-landing.css` match the PRD §8 UI Requirements token table exactly:
- `--lp-surface-cream: #f1ead8` ✓
- `--lp-surface-dark: #131512` ✓
- `--lp-accent-red: #b8362b` ✓
- `--lp-accent-green: #6b8a3a` ✓
- `--lp-accent-amber: #b08740` ✓
- `--lp-font-display` and `--lp-font-mono` fallback chains ✓
- All size, weight, leading, layout, border, motion tokens ✓

---

### ADR Compliance

All twelve ADR decisions are honored in Phase 1:

- D1 (surface switcher): `useState<"settings" | "landing">` with `readInitialSurface()`, dev-only button, no router. ✓
- D2 (token namespacing): separate file, `.landing-root` scope, `--lp-*` prefix. ✓
- D3 (overflow scoping): `.landing-root` provides scroll context; global rule untouched. ✓
- D4 (component placement): `src/panels/landing/` directory created correctly. ✓
- D6 (fonts): EB Garamond Regular+Italic and JetBrains Mono Regular+Medium bundled as woff2 with `font-display: swap`, Latin subset, fallback chains. ✓
- D7/D10 (no test runner): no test infrastructure added. ✓

---

### QA Observation Verdicts

**(a) `tokens-landing.css` loads unconditionally — NIT**

`LandingPage.tsx` is always imported by `App.tsx` at module parse time, so the CSS side-effect import is always bundled. All rules inside the file are scoped to `.landing-root` (which only exists in the DOM when the landing surface is active) or are `@font-face` declarations (which only register font families, not affecting any element's computed styles). Zero behavioral impact. The 20.47KB CSS in the production bundle is the price of the scoped-token-file approach chosen in ADR §D2. Splitting the import is not possible without restructuring (importing fonts separately from tokens would require two CSS files with interdependency, which is more complex). This is an accepted architectural tradeoff documented in the ADR. No fix needed.

**(b) `regionTransmissions` stub has `background: var(--lp-surface-dark)` — NIT**

`LandingPage.module.css:47-50`: the `.regionTransmissions` stub applies the dark background. The section is empty in Phase 1, so the element has zero height and the rule produces no visible pixels. It anticipates Phase 3 layout. The CONS-09 constraint is written against `LandingPage.tsx` (no component imports, no Phase 2/3/4 JSX content) not `LandingPage.module.css`. This is a small discipline slip — CSS scaffold that belongs in Phase 3 was written in Phase 1. Since it has zero visible impact and the style will simply be kept as-is in Phase 3, this is not worth a retry. No fix required.

**(c) `App.tsx` is 55 lines vs the "≤30 lines" guideline — NIT**

The ADR D1 says "~30 lines" (tilde, not an exact bound). The 55-line file breaks down as: 8 comment lines, 6 blank lines, 15 lines for the inline `style={{}}` object on the dev-only button, leaving 26 lines of actual logic. The switcher logic itself (`Surface` type declaration, `readInitialSurface` function, `useState`, conditional render, dev guard) is well under 30 lines. The inline style object is unavoidable without introducing a CSS module for a dev-only button, which would be disproportionate. The guideline's intent is met. No fix required.

---

### Phase Status

REVIEWER_PASS — phase complete (security trigger: OFF per PRD §10; no security agent invocation required). Advancing to Phase 2.
