# Phase 1 Exploration

## 1. PRD Lock Confirmation

From PRD.md section 11, the final consensus block reads:

> ## Consensus Status: LOCKED — 2026-05-03
> **PRD locked at 2026-05-03 (CTO final lock block).**

Lock confirmed. Proceeding.

## 2. Phase 1 File List (from PRD §9)

Exactly per the PRD:

- `src/styles/tokens-landing.css` (new) — full `--lp-*` token set scoped under `.landing-root`, `@font-face` declarations
- `src/assets/fonts/eb-garamond/EBGaramond-Regular.woff2` (new — binary asset)
- `src/assets/fonts/eb-garamond/EBGaramond-Italic.woff2` (new — binary asset)
- `src/assets/fonts/jetbrains-mono/JetBrainsMono-Regular.woff2` (new — binary asset)
- `src/assets/fonts/jetbrains-mono/JetBrainsMono-Medium.woff2` (new — binary asset)
- `src/panels/landing/LandingPage.tsx` (new) — root `<div className="landing-root">` with stub regions
- `src/panels/landing/LandingPage.module.css` (new) — page layout, scrollable container, region scaffolding
- `src/panels/landing/types.ts` (new) — type declarations from §8 Data Model
- `src/App.tsx` (modify) — surface switcher with dev-only trigger

## 3. Reference Files Read

### `src/App.tsx`
Current state: 5 lines. Imports `ClaudeSettingsPanel` and returns it directly. Pattern to match: keep it terse (PRD says ≤30 lines for the switcher). I'll replace the default export function with the surface-switcher version, preserving the import of `ClaudeSettingsPanel`.

### `src/panels/claude-settings/ClaudeSettingsPanel.tsx`
Surface composition pattern: single function component, wires state, renders into a single shell `<div className={styles.shell}>`. Children are co-located components. I'll follow this for `LandingPage.tsx` — single function, single root `<div className="landing-root">` (not via CSS module for the root class, per ADR D2 — the `.landing-root` class name must be a plain string so it can serve as the CSS token scope selector).

### `src/panels/claude-settings/ClaudeSettingsPanel.module.css`
Pattern for consuming `var(--*)` tokens inside `.module.css` files. Uses variable references like `var(--bg-base)`, `var(--text-secondary)`, `var(--font-mono)` throughout. I'll match this pattern in `LandingPage.module.css` consuming `var(--lp-*)` tokens.

### `src/styles/tokens.css` lines 1-96
Token vocabulary structure: grouped with comment headers (`Colors: backgrounds`, `Colors: borders`, `Colors: text`, `Colors: accents`, `Colors: state`, `Typography`, `Spacing`, `Borders`, `Layout`, `Shadows`, `Transitions`, `Z-index`). I'll mirror this grouping pattern in `tokens-landing.css` using the headers: `Surfaces`, `Accents`, `Typography`, `Layout`, `Borders/Radii`, `Motion`.

### `src/styles/tokens.css` lines 105-112
The critical rule:
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
**Do NOT modify this.** The landing root will be an `position: absolute; inset: 0; overflow-y: auto` container inside `#root`.

### `src/main.tsx`
`tokens.css` is imported here at the app root. This means `tokens.css` tokens are always available at `:root`. `tokens-landing.css` must be imported from `LandingPage.tsx` (not here) so it only loads with the landing surface — per PRD implementation notes.

### `electron.vite.config.ts`
Renderer root is `.` with `react()` plugin. Vite will handle `url()` references in CSS files for font assets. Relative paths from `tokens-landing.css` to the fonts dir: `url("../assets/fonts/eb-garamond/EBGaramond-Regular.woff2")`. The CSS file is at `src/styles/tokens-landing.css`, so relative path goes up one (`..`) to `src/`, then into `assets/fonts/`. This resolves correctly.

### `tsconfig.web.json`
`strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`. I must not introduce unused imports or parameters in any `.ts`/`.tsx` file.

## 4. Anti-Patterns to Avoid

From CONS ledger and phase implementation notes:

- **CONS-01 (token scope):** Do NOT put `--lp-*` tokens under `:root`. They must be scoped to `.landing-root` only. Any accidental `:root` rule in `tokens-landing.css` breaks AC-039 and risks AC-002.

- **CONS-02 (tokens.css untouched):** Do NOT modify `src/styles/tokens.css`. Any edit there breaks AC-039 by potentially redefining settings-panel tokens.

- **CONS-03 (overflow global rule):** Do NOT lift `overflow: hidden` off the global `html, body, #root` rule. The landing root must declare its own scrollable container (`position: absolute; inset: 0; overflow-y: auto`).

- **CONS-04 (no router):** Do NOT install `react-router`, `wouter`, or any routing dependency. Surface switcher only.

- **CONS-05 (no CDN fonts):** Do NOT register fonts via `<link>` tags, Google Fonts, or any runtime web request. `@font-face` only with bundled relative URLs.

- **CONS-06 (cold-start default):** Do NOT default the surface switcher to `"landing"`. The `useState` default must be `"settings"` (or the result of `readInitialSurface()` which also defaults to `"settings"`).

- **CONS-07 (structural gate):** The dev-only switch button must be inside `{import.meta.env.DEV && ...}` — structurally gated, not visually hidden. (CTO Round 2 watching concern #6.)

- **CONS-08 (no new deps):** Do not install any new package. Use only what's in `package.json`.

- **CONS-09 (no Phase 2/3/4 leakage):** `LandingPage.tsx` in Phase 1 must only contain stub `<section>` elements with `data-testid` attributes. No HeaderBar, StatusBar, Hero, ProjectSelector, etc.

- **CONS-10 (font URL path):** `@font-face` src URLs must be Vite-resolvable relative paths from the CSS file location: `url("../assets/fonts/...")`. Not absolute paths, not imports.

- **CONS-11 (types.ts imports):** `src/panels/landing/types.ts` is type-only. No runtime imports there.

- **CONS-12 (tokens-landing imported from LandingPage):** Import `tokens-landing.css` from `LandingPage.tsx`, not from `main.tsx`.

- **CONS-13 (no synthetic italic):** `@font-face` for italic must declare `font-style: italic` and point to the italic `.woff2` file. Do not synthesize oblique from the regular file.

- **CONS-14 (no modules for root class):** The `.landing-root` class on `LandingPage`'s root `<div>` is a plain string `"landing-root"`, not a CSS module reference. The token scoping selector in `tokens-landing.css` is `.landing-root`. If the root class were CSS-module-hashed, it would never match.

- **CONS-15 (structural DEV gate):** Per CTO Round 2 watching concern #6: the switcher button is `{import.meta.env.DEV && <button .../>}`, which Vite dead-code-eliminates in production builds.

## 5. CONS-03 Settings-Panel Baseline (Pre-Phase-1)

**Method: static-derived baseline.** The dev server is not running in this environment, so I derive expected computed values from the CSS rules that apply to a `.rail button` element (specifically `.railItem` class, the default state for non-active buttons).

The CSS chain for a `.rail button` in its default (`.railItem`) state:

**`font-family`**
- `.railItem` does not set `font-family` — inherits from `body`.
- `body` (in `tokens.css` line 117): `font-family: var(--font-sans)`
- `--font-sans` (tokens.css line 38): `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif`
- Expected computed value: the system's resolved first match from that stack. On macOS: `-apple-system` resolves to `BlinkMacSystemFont` / "San Francisco". In `getComputedStyle`, this typically returns `"-apple-system"` or the resolved system face.
- Static-derived baseline: **`-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif`** (the property value as declared; the computed face depends on OS, but the CSS value is stable).

**`font-size`**
- `.railItem` (ClaudeSettingsPanel.module.css line 104): `font-size: var(--text-sm)`
- `--text-sm` (tokens.css line 42): `12px`
- Static-derived baseline: **`12px`**

**`color`**
- `.railItem` (ClaudeSettingsPanel.module.css line 105): `color: var(--text-secondary)`
- `--text-secondary` (tokens.css line 17): `#9ba3b4`
- Static-derived baseline: **`rgb(155, 163, 180)`** (browser computes hex to rgb)

**`background-color`**
- `.railItem` (ClaudeSettingsPanel.module.css line 106): `background: transparent`
- Static-derived baseline: **`rgba(0, 0, 0, 0)`** (browser renders transparent as rgba(0,0,0,0))

These four values must remain byte-identical after Phase 1 lands. The token-bifurcation guard passes if no `--lp-*` token leaks into `:root` and no rule in `tokens-landing.css` overrides any of the above properties on elements outside `.landing-root`.

**Source: static-derived baseline (dev server not running in agent environment).**

## Font File Strategy

The font `.woff2` files (EBGaramond-Regular, EBGaramond-Italic, JetBrainsMono-Regular, JetBrainsMono-Medium) are not present in the repo. Per the PRD/ADR D6 guidance and the Phase 1 implementation note option (b):

I will download the font files from their open-source (SIL OFL) repositories as part of this phase. Both fonts are permissively licensed (SIL OFL 1.1) and the PRD/ADR explicitly authorizes bundling them. If download is not feasible in this environment, I will leave clearly-marked TODO stubs and use system-stack fallbacks, flagging this prominently in the build summary.

I will attempt the download now during implementation and document the outcome.
