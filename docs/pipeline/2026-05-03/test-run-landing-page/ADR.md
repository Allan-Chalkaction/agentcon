# ADR — Agentcon Landing Page (spy/dossier aesthetic)

**Status:** Proposed
**Date:** 2026-05-03
**Run:** docs/pipeline/2026-05-03/test-run-landing-page/
**Authors:** Architect agent
**Supersedes:** none
**Superseded by:** none

---

## Context

The product team requested a static, presentational landing page for Agentcon in a "spy/dossier" aesthetic (cream surface, dark feed band, red brand accent, serif italic display, monospace UI). CTO approved a SIMPLIFY scope: render the mockup at pixel-reasonable fidelity with seeded data only — defer all behavioral wiring (real deploys, live feed source, project-load) to a follow-on run.

The repo today is a single-surface Electron/React/Vite/TypeScript app that renders `<ClaudeSettingsPanel />` directly from `App.tsx`. It has:

- A single global tokens file at `src/styles/tokens.css` defining a dark-mode palette, 13px base, system-font sans/mono pair.
- A global rule `html, body, #root { overflow: hidden }` because the existing surface is desktop chrome, not a scrolling document.
- No router, no test runner, no CLAUDE.md, no `docs/decisions/` precedent.
- A panels convention: top-level surfaces live under `src/panels/<feature>/` with co-located `*.module.css`.

The landing page has to coexist with the settings panel without redefining any token the settings panel currently consumes (AC-039), without breaking the settings panel's overflow behavior (AC-002, AC-003), and without introducing new top-level conventions (CTO §6).

This ADR records the decisions that shape Builder's phase work: routing/surface-switcher choice, token namespacing, overflow scoping, asset format, font-loading mechanism, test-infra posture, and visual-fidelity verification path.

---

## Decision

### D1. Surface switcher (not a router)

`App.tsx` becomes a tiny surface switcher with a `useState<"settings" | "landing">` initialized to `"settings"`. The default app entry is unchanged — the settings panel still loads on first open. The landing surface is reachable via a single dev-only affordance: a query parameter (`?surface=landing`) read from `window.location.hash`/`search` at mount, plus a tiny floating "switch surface" button rendered only in dev (`import.meta.env.DEV`).

No router framework is added. No build flag. No URL routing system. The switcher is ~30 lines in `App.tsx` and is reversible — if the team later picks a real router, the switcher is deleted in one diff.

**Why this and not the alternatives:**
- A real router (`react-router`, `wouter`) is over-engineered for two surfaces and the verdict explicitly forbids new routing infrastructure as a deliverable of this run.
- A build flag would gate the landing page out of production entirely, which conflicts with the artifact value the verdict calls out.
- Replacing `App.tsx`'s entry with the landing page would default-break AC-002 (settings panel must still load).

### D2. Token namespacing — separate file, scoped selector

A new file `src/styles/tokens-landing.css` is added. It declares all landing-only tokens under a scoped class selector `.landing-root`, **not** under `:root`. The file is imported once at the landing-page entry (`src/panels/landing/LandingPage.tsx`), which renders its root `<div>` with `className="landing-root"`.

Settings-panel tokens stay in `src/styles/tokens.css` under `:root`, untouched. There is no naming collision risk because landing tokens use a prefix: `--lp-*` (e.g. `--lp-surface-cream`, `--lp-accent-red`, `--lp-font-display`).

QA's regression check on AC-002 + AC-039 includes asserting that `getComputedStyle()` for at least one settings-panel element (the rail's first item) has identical values for `background-color`, `color`, `font-family`, and `font-size` before and after this change.

**Why this and not the alternatives:**
- Extending `:root` with `--lp-*` tokens would still satisfy AC-039 textually (no redefinition) but pollutes global scope for a feature whose entire CSS surface is a single route. Scoped is cleaner and makes the seam observable.
- A CSS-in-JS solution introduces a new dependency for one page — wrong tradeoff.
- A `<style>` injection inside the landing component is harder to review and version.

### D3. Overflow — scoped to the landing root, not lifted off the global

The global rule in `tokens.css` (`html, body, #root { overflow: hidden }`) is **not** modified. Instead, `.landing-root` declares its own scrollable container:

```css
.landing-root {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--lp-surface-cream);
}
```

When the surface switcher renders `<LandingPage />`, the landing root sits inside `#root` (still `overflow: hidden`) and provides its own scroll context. The settings panel surface switches back to its existing flexbox layout when selected, with no overflow change observable.

**Why:** Lifting the global rule has unbounded blast radius (any future surface inheriting from `body` could regress). A scoped container is provably local.

### D4. Component placement — `src/panels/landing/`

Following the existing `src/panels/claude-settings/` convention. New tree:

```
src/panels/landing/
  LandingPage.tsx              — top-level composition, owns layout + scroll container
  LandingPage.module.css       — page-level layout (grid, regions)
  components/
    HeaderBar.tsx              — AGENTCON / FILE 0427-A / 2026-04-30
    HeaderBar.module.css
    StatusBar.tsx              — SECURE CHANNEL / CONNECTION ESTABLISHED / NODE / OPERATIVES
    StatusBar.module.css
    ProjectSelector.tsx        — accessible listbox dropdown
    ProjectSelector.module.css
    Hero.tsx                   — eyebrow / h1 / paragraph
    Hero.module.css
    PersonnelFileCard.tsx      — dossier card with REDACTED photo + CLASSIFIED stamp
    PersonnelFileCard.module.css
    TransmissionsFeed.tsx      — header + LIVE indicator + rows / empty state
    TransmissionsFeed.module.css
    OperativesGrid.tsx         — three OperativeCards
    OperativeCard.tsx          — top rule + meta + Deploy button
    OperativeCard.module.css
    OperativesGrid.module.css
    Footer.tsx                 — v0.1 · ~/.CLAUDE / ENCRYPTED AT REST
    Footer.module.css
    ClassifiedStamp.tsx        — inline SVG component
    RedactedSilhouette.tsx     — inline SVG component
  data/
    seedAgent.ts               — default agent record (Hawkeye dossier)
    seedTransmissions.ts       — four seeded rows
    seedOperatives.ts          — Hawkeye / Echo / Ghost
    seedProjects.ts            — three sample project options
  types.ts                     — Agent, Transmission, Operative, ProjectOption
src/styles/
  tokens-landing.css           — scoped tokens under .landing-root
src/assets/fonts/              — bundled .woff2 files (see D6)
src/App.tsx                    — modified: surface switcher
```

### D5. Asset format — inline SVG components

The CLASSIFIED stamp and the REDACTED silhouette are React components rendering inline `<svg>`. No `.svg` files in `src/assets/`. No CSS-only renderings.

Reasoning:
- Tokens. Inline SVG can use `currentColor` and CSS variables (`fill: var(--lp-accent-red)`), which keeps the stamp's red and the silhouette's grey theme-able from the same token source as the rest of the page.
- Reviewability. The stamp text "CLASSIFIED" appears as actual `<text>` content in the markup, so AC-023 (literal string `CLASSIFIED`) is verifiable in the DOM rather than baked into a raster.
- No bundler config changes. SVGs stay co-located with their consumer.

The CLASSIFIED stamp uses an SVG `<text>` element with a stroked rectangle border and a CSS `transform: rotate(-15deg)` applied to the SVG element (within the AC-023 range of -20 to -10 degrees).

### D6. Fonts — bundled .woff2 via Vite, with explicit fallbacks

Two families are bundled as `.woff2` files imported via `@font-face` in `tokens-landing.css`:

- **Display serif:** **EB Garamond** (Regular 400, Italic 400). Open-source (SIL OFL), widely used, has a strong italic, renders well at large display sizes. Bundled from `src/assets/fonts/eb-garamond/` (`EBGaramond-Regular.woff2`, `EBGaramond-Italic.woff2`).
- **Monospace UI:** **JetBrains Mono** (Regular 400, Medium 500). Open-source (SIL OFL). Bundled from `src/assets/fonts/jetbrains-mono/` (`JetBrainsMono-Regular.woff2`, `JetBrainsMono-Medium.woff2`).

`@font-face` rules use `font-display: swap` and `unicode-range: U+0020-007F` (basic Latin only — keeps each file ≤30KB).

Token fallbacks:
```css
.landing-root {
  --lp-font-display: "EB Garamond", Georgia, "Times New Roman", serif;
  --lp-font-mono: "JetBrains Mono", "SF Mono", Menlo, Monaco, ui-monospace, monospace;
}
```

The settings panel's `--font-mono` and `--font-sans` tokens are untouched. There is no remote CDN dependency — all four `.woff2` files are checked into `src/assets/fonts/` and resolved by Vite at build time via relative `url()` references in `@font-face`.

**Why not system stack only:** the spy/dossier aesthetic is materially carried by the serif italic. Georgia is a passable system fallback but the visual impact drops noticeably. Bundling 4 woff2 files (~110KB total) is acceptable for a desktop app. The fallback chain is real — if the woff2 files fail to load, the page degrades gracefully.

**Why not Google Fonts CDN:** AC-040 forbids it, and an Electron app shouldn't have a runtime web request for fonts.

### D7. Test infrastructure — option (c): no automated tests this run

No Vitest, no Testing Library, no Playwright in this run. The phase plan does not include test-runner setup.

Rationale:
- The slug is `test-run-landing-page` and the verdict frames this as a pipeline shakedown. The pipeline test is whether PM/Architect/Builder/QA/Reviewer can converge on a static visual page; introducing test-runner setup adds a phase that doesn't exercise the visual-build pipeline and lands in a repo that has no other test consumers (no other tests for a runner to pick up after this run).
- All AC are written as deterministic DOM/computed-style/text inspections. QA can verify by running the dev build and walking the AC list against the rendered page. AC-027 (exact transmission rows), AC-032 (exact operative card content), AC-018 (exact h1 text + family + color token), AC-021 (key/value field table) are all binary checks against the live DOM.
- A follow-up phase to introduce Vitest/RTL is recorded in section 10 risks as a known gap. When a future feature wants behavioral coverage, that's the right time to bring in the runner — and that decision should weigh in on whether to use Vitest or Node's `node:test`.

QA verification path is therefore **deterministic inspection per AC**: QA opens the dev build with the landing surface active, walks the AC list, and either captures a pass via DOM snapshot in their verdict file or files a fail with the specific AC number and observed DOM/computed-style state. No Playwright baselines, no visual regression tooling.

### D8. Per-card top-rule color — single red token

All three operative cards use the same `--lp-accent-red` for their top rule. The mockup, when read carefully, shows what reads as red across all three cards (the slight per-card color variation in the rendered mockup is interpreted as printing/photo grain, not three accents). A single token is also the simpler seam — if a follow-on run wants per-class accents, adding `--lp-accent-reviewer`, `--lp-accent-analyst`, `--lp-accent-archivist` is a one-token-per-card change with no component refactor.

This locks AC-033's "or per-card accent token" branch closed: **single shared red accent.**

### D9. Transmissions seed cardinality — 4 rows

PM specified four exact rows in AC-027. Builder uses exactly those four. No extras, no fewer.

### D10. Visual-fidelity verification — named-element / text / token approach

Pinned by D7. Each visual AC names a token, an element, a literal string, or a computed-style expectation. QA passes by reading the DOM and computed styles, not by comparing rasters. This avoids Playwright/Percy infrastructure for a single-page artifact.

### D11. AC-045 responsive bounds — pinned

Existing Electron renderer has no enforced min-width in `electron-vite` or `BrowserWindow` config (see `package.json`). For the purpose of AC-045, **the responsive range is 1024px to 1680px wide**. QA tests three points: 1024, 1280, 1680. The operatives grid stays as 3 side-by-side cards across that range. Below 1024 the page may degrade — out of scope.

### D12. Disabled-state seam — explicit prop

`OperativeCard` declares `disabled?: boolean` on its props (default `false`). `OperativesGrid` does not pass it in this run (no operative is disabled). The CSS for the disabled state is implemented and visible to QA only via React DevTools or a manual prop override during testing. This satisfies AC-035's disabled-state branch as a styled-but-unwired seam.

---

## Consequences

### Positive
- Settings panel is provably untouched (separate token file, scoped class, surface switcher defaults to settings).
- Landing-page surface is a single deletable directory if the team later changes direction.
- All deferred behaviors (deploy, live feed, project load) have explicit prop seams (D4, plus AC-024/AC-026/AC-031/AC-037).
- Bundled fonts are reproducible offline.
- No new dependencies (no router, no test runner, no CSS-in-JS).

### Negative
- No automated tests for this surface. A regression in the landing page is detectable only by re-walking the AC list. Mitigation: section 10 risk registered.
- Surface switcher in `App.tsx` is non-standard. Mitigation: comment block explaining its temporary nature and pointing at this ADR.
- Bundled `.woff2` files add ~110KB to the renderer bundle. Mitigation: Latin-only subset; acceptable for a desktop app.
- Two SVG inline components (`ClassifiedStamp`, `RedactedSilhouette`) are hand-authored. If the team later wants a richer redaction photo, the silhouette gets replaced. Acceptable.

### Neutral
- Two font files per family doubles the asset count compared to a variable font. The static files are smaller individually; chosen for compatibility.

---

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| Add `react-router` and use real routes | Over-engineered for two surfaces; verdict explicitly forbids router as a deliverable. |
| Replace `App.tsx` entry with landing page; settings reachable via menu | Default-breaks AC-002; surprises existing settings users. |
| Build-flag the landing page (`VITE_SURFACE=landing`) | Removes the artifact from production builds, killing its display value. |
| Extend `:root` with `--lp-*` tokens (no scoped selector) | Pollutes global scope for a single-route feature; scoped is cleaner. |
| Inject scoped CSS via styled-components or Emotion | New runtime dependency for one page; against the grain of the existing CSS-modules + tokens approach. |
| Lift `overflow: hidden` off `html, body, #root` and re-apply only inside `ClaudeSettingsPanel` | Unbounded blast radius; scoped container is provably local. |
| Raster CLASSIFIED stamp (PNG) | Loses tokenability and AC-023 textual verification; bigger file. |
| CSS-only CLASSIFIED stamp (text + transforms) | Workable but ties typography of the stamp to the page font stack; SVG decouples cleanly. |
| Google Fonts CDN | Forbidden by AC-040 and inappropriate for an Electron app. |
| System-stack fonts only (no `.woff2` bundling) | Display serif italic is load-bearing for the aesthetic; system fallback is materially weaker. |
| Variable fonts (`EBGaramond-VariableFont.woff2`) | Larger single file; static weights cover only what AC-040 needs. |
| Vitest + Testing Library setup as Phase 0 | Verdict frames this as a pipeline shakedown; AC are verifiable by deterministic inspection; runner adds churn for no consumer in this run. |
| Playwright visual regression baselines | Heavy infra for a single-page artifact; named-element/text/token AC give cheaper deterministic checks. |
| Per-card accent tokens (three different colors) | Mockup ambiguity resolved as printing grain rather than design intent; single shared accent is simpler and equally satisfies AC-033. |

---

## References

- CTO verdict: `docs/pipeline/2026-05-03/test-run-landing-page/cto-verdict.md`
- PRD: `docs/pipeline/2026-05-03/test-run-landing-page/PRD.md`
- Mockup: `.claude/run-assets/landing-mockup.png`
- Existing tokens: `src/styles/tokens.css`
- Existing surface convention: `src/panels/claude-settings/`
- Existing entry: `src/App.tsx`, `src/main.tsx`
