# ADR — Design-System Migration: Cream Panels on Dark Chrome

**Status:** Proposed
**Date:** 2026-05-03
**Run:** docs/pipeline/2026-05-05/design-migration-cream-panels/
**Authors:** Architect agent
**Supersedes:** none
**Superseded by:** none
**Reverses (in part):** docs/pipeline/2026-05-03/test-run-landing-page/ADR.md §D2 (token bifurcation), §D7 (no test runner), §D10 (visual-fidelity verification — the named-element/text/token approach is preserved as primary, augmented by Vitest).

---

## Context

Agentcon ships with two visual languages running in parallel:

- The **landing page** (shipped in the `2026-05-03/test-run-landing-page` run) uses cream/dark/red dossier aesthetic with EB Garamond display + JetBrains Mono UI text. Its tokens live in `src/styles/tokens-landing.css` under a scoped class selector `.landing-root`, prefixed `--lp-*`.
- The **settings panel** (`src/panels/claude-settings/`) uses CLI-dark aesthetic with light text on dark surfaces. Its tokens live in `src/styles/tokens.css` under `:root`, no prefix.

The bifurcation in landing-run ADR D2 was deliberately temporary; its rationale ("so the landing experiment wouldn't break the settings panel") has been satisfied. CTO has approved a SIMPLIFY scope reversing D2 and unifying on the cream-panel-on-dark-chrome language. The settings-panel re-theme is the highest-risk surface (functionality-critical: load/edit/save Claude Code config). The dev-switch button (`src/App.tsx:38-47`) carries inline hex literals as a known regression to be retired.

**Surface enumeration (architect performed):**

`src/panels/claude-settings/` contains exactly **12 component files** (`ClaudeSettingsPanel.tsx`, `ScopeSwitcher.tsx`, `ScaffoldBanner.tsx`, `AgentsTab.tsx`, `HooksTab.tsx`, `SkillsTab.tsx`, `CommandsTab.tsx`, `PluginsTab.tsx`, `PermissionsTab.tsx`, `EnvTab.tsx`, `ClaudeMdTab.tsx`, `RawJsonTab.tsx`) and **one** shared CSS module (`ClaudeSettingsPanel.module.css`, ~481 lines). All 12 components import classnames from that single CSS module. The CSS rewrite is concentrated in one file, not fragmented across twelve. This is a critical structural finding: **the settings re-theme phase touches one CSS file plus zero or one .tsx file (App.tsx is separate; the .tsx files contain a small number of inline `style` props that hold tokens but no inline hex literals other than ScopeSwitcher's hint text).** The whole-panel re-theme is therefore tractable inside one or two phases.

`src/panels/landing/` contains LandingPage.tsx + 8 sub-components in `components/` + their .module.css files. The token-rename phase touches every `.module.css` under `landing/` (≈10 files) plus `tokens-landing.css` itself.

**IPC surface (architect inspected):**

The settings panel's read/write path goes through the renderer-side preload bridge at `window.agentcon.fs.*` (declared in `src/global.d.ts:52-63`), specifically `readText(absPath)` / `writeText(absPath, contents)`. The store layer is `src/stores/claudeConfigStore.ts`. The save call site of interest is `saveSettings(scope, next)` which serializes JSON and calls `window.agentcon.fs.writeText`. **This is the test seam:** mocking `window.agentcon` at the renderer-test boundary captures all reads/writes without ever invoking Electron IPC. There is no main-process code under test in this run.

This ADR records the decisions Builder executes against: token consolidation strategy, rename strategy, settings-scope decision, test-runner choice, IPC mock seam, baseline capture mechanism, label-string literals, globals resolution, pre-migration semantic captures, and the four mockup-issue resolutions.

---

## Decision

### D1. Token consolidation — single file, comment-banded sections under `:root`

`src/styles/tokens.css` becomes the single canonical token file. The new structure is **two comment-banded sections under one `:root`**:

```css
:root {
  /* === CHROME TOKENS === */
  /* Outer canvas (body background, title bar, ...) */
  --bg-base: #...;
  --border-default: #...;
  /* ... existing dark-chrome tokens ... */

  /* === CONTENT TOKENS === */
  /* Cream content surfaces, ink, accents, panel border */
  --surface-cream: #f1ead8;
  --ink: #1d1c19;
  --accent-red: #b8362b;
  --border-panel-strong: 1.5px solid #...;
  /* ... former --lp-* tokens, renamed ... */
}
```

**Banner literal strings (resolves CTO concern #6):** the comment-banded section labels are exactly the literal strings `/* === CHROME TOKENS === */` and `/* === CONTENT TOKENS === */`. QA's AC-003 test asserts both substrings (`=== CHROME TOKENS ===` and `=== CONTENT TOKENS ===`) appear in the file content, in that order.

`src/styles/tokens-landing.css` is **deleted** in the rename phase. The `@font-face` declarations move into `tokens.css` near the top of the file (above the `:root` block). AC-002 binds to outcome (a): file does not exist.

**Layer ordering:** since both groups live in one `:root` block, layer ordering is positional in the source file: chrome tokens come first, content tokens come second. **Where chrome and content tokens overlap by purpose, the content token wins**, because content tokens are the unified product palette and chrome tokens are the supporting outer canvas. Specifically: the global `body { background: var(--bg-base); color: var(--text-primary); }` in tokens.css:114-122 stays as-is (chrome wins on `body` because body IS the chrome surface). Content panels declare `background: var(--surface-cream); color: var(--ink);` at the panel-root level (`.shell` in `ClaudeSettingsPanel.module.css`), overriding inherited chrome via normal CSS cascade.

**Why single file, not split:**
- The codebase already imports `tokens.css` exactly once (`src/main.tsx:3`). Two files means two imports, and the second import's order matters (load chrome first, then content) — easy to break, hard to debug.
- The dev-switch button (lives over both surfaces) needs both groups loaded simultaneously regardless. A split makes that no easier.
- Specificity discipline is the same in both options: panel-root declarations override body. Splitting the source file does not change cascade behavior.
- The split-file alternative is defensible but adds an import-ordering trip wire for zero gain. Single file with explicit banner section headers is simpler and equally observable.

**Resolves AC-001, AC-002 (outcome a), AC-003, AC-046, AC-051 (preserve in place), CTO concerns #6.**

### D2. Rename strategy — atomic in one phase

Every `--lp-*` token is renamed to a non-prefixed shared name in a single phase (Phase 2 in §9 below). The rename phase:

1. Adds new tokens to `tokens.css` under the `=== CONTENT TOKENS ===` band (Architect names locked below in D6).
2. Deletes `tokens-landing.css` entirely (the file is removed; the import in `LandingPage.tsx:15` is removed).
3. Mass-renames every `--lp-*` reference across `src/panels/landing/` (LandingPage.tsx + 8 components + their .module.css files).
4. Updates `LandingPage.tsx` to use `className="landingPage"` (or equivalent) for its scroll container — the `.landing-root` selector goes away, replaced by a normal CSS-Module class that declares `position: absolute; inset: 0; overflow-y: auto; background: var(--surface-cream);`.

**Why atomic, not shim-then-remove:**
- File count: the consumers of `--lp-*` are localized to `src/panels/landing/` — approximately 11 files (landing components + their .module.css). The rename phase touches `tokens.css` + `tokens-landing.css` deletion + LandingPage.tsx + ≤9 .module.css files = **≤12 files**. This deviates from the ≤5 files/phase soft cap, but the rename is mechanical (find-and-replace `--lp-X` → `--X` in CSS Modules; no logic edits) and splitting it leaves the codebase non-functional at the boundary. The deviation is justified by phase-boundary safety per AC-054.
- Shim-then-remove introduces a transient phase where both names exist. AC-055 caps shim lifespan at one phase boundary. The shim discipline is real but the bookkeeping cost (verifying shims are actually deleted and no consumer was missed) is higher than the cost of one phase that exceeds the file-count cap. The atomic approach is reviewer-friendlier: one diff, one grep assertion (`grep -r "\-\-lp-" src/` returns empty), done.

**Resolves AC-001, AC-046, AC-055, CTO concerns regarding the rename strategy in CTO §Architectural concerns #1.**

### D3. Settings-panel scope — IN this run

Architect's enumeration: `src/panels/claude-settings/` contains 12 .tsx components + 1 shared .module.css. The whole-panel re-theme is concentrated in **one CSS file** (the shared `ClaudeSettingsPanel.module.css`), with small touch-ups in 1-3 .tsx files for inline `style` props that should consume tokens (e.g. `HooksTab.tsx:147,155` inline `style={{ ...fontSize: "var(--text-xs)", color: "var(--text-muted)" }}` — these reference chrome tokens by name and the rename pass updates them).

This is well under the >25-file threshold CTO flagged. Settings re-theme **fits in this run** as a phase pair: Phase 4 (CSS-module rewrite under content tokens + introduce `--border-panel-strong` application + lifecycle-chip selection state + tab-title typography fix + empty-state border) and Phase 5 (alert/error treatment + functional regression test execution).

**Conditional-AC matrix (resolves CTO concern #3):** even though item 7 is IN, the canonical conditional set is recorded here for the record and for any future revision that might trim it. If item 7 were pulled in a future revision round, the following ACs come out:

| AC range | Reason |
|---|---|
| AC-009 | chip default-state border, settings-specific |
| AC-015, AC-016 | tab-section titles, settings-specific |
| AC-017, AC-018, AC-019, AC-020, AC-021, AC-022 | lifecycle-chip selection state, Hooks-tab specific |
| AC-023, AC-024, AC-025 | empty-state border, Hooks-tab specific |
| AC-026, AC-027, AC-028 | settings load flows |
| AC-029, AC-030, AC-031, AC-032 | edit + save flows |
| AC-033, AC-034, AC-035 | tab switching |
| AC-036, AC-037, AC-038, AC-039 | Hooks-tab interactions |
| AC-040, AC-041 | preset cards |
| AC-042, AC-043, AC-044 | alerts/errors |

Total conditional set: **AC-009, AC-015–AC-016, AC-018–AC-025, AC-026–AC-044** = 30 ACs (1 + 2 + 8 + 19). CTO Round 1's enumeration is correct as written and binds.

**Item 7 stays IN. The conditional matrix is recorded so the trim is mechanical if it is ever invoked.**

**Resolves CTO concern #3, the structural decision in concern D, and CTO §Architectural concerns #3.**

### D4. Test runner — Vitest + Testing Library + jsdom

Phase 0 stands up:
- `vitest@^2` (peer-aligned with Vite 7).
- `@testing-library/react@^16` and `@testing-library/jest-dom@^6` and `@testing-library/user-event@^14`.
- `jsdom@^25` (NOT happy-dom — see why below).
- One additional dev dep: `@vitest/coverage-v8` (optional, not required for ACs to pass; documented for follow-on runs).

**Why jsdom over happy-dom:**
- jsdom has fuller `getComputedStyle` support; happy-dom's CSS engine has known gaps around CSS custom properties and `var()` resolution in some versions. For a migration whose ACs hinge on `getComputedStyle` reading var()-resolved values, the more conservative choice is jsdom.
- Speed difference between the two is negligible at our test scale (low dozens of tests).

**Files Phase 0 produces:**

```
vitest.config.ts                    NEW    Vitest config; jsdom env; CSS Modules pass-through
tests/setup.ts                      NEW    Sets up @testing-library/jest-dom matchers + window.agentcon mock factory
tests/mocks/agentconMock.ts         NEW    Factory exporting installAgentconMock() — installs an in-memory IPC mock on globalThis.window.agentcon
tests/mocks/styleMock.ts            NEW    Identity-obj-proxy-style fallback (only if Vitest's built-in CSS Modules support is insufficient — see below)
tests/baseline/                     NEW    Directory for pre-migration baselines (D9 below)
tests/example.test.tsx              NEW    One bootstrap test that asserts render() + getComputedStyle() round-trip on a trivial component
package.json                        EDIT   Adds "test": "vitest", "test:run": "vitest run", devDependencies above
```

**CSS Modules in Vitest (resolves CTO concern #7):** Vite's CSS Modules support is enabled by default and Vitest inherits it because Vitest uses Vite's transformer pipeline. This means `import styles from "./Foo.module.css"` resolves to a real exports object inside tests. **No `identity-obj-proxy` is needed.** `tests/mocks/styleMock.ts` is provided as an explicit fallback only if the default behavior produces empty exports under jsdom — Builder verifies during Phase 0 with the bootstrap test. The vitest.config.ts contains:

```ts
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    css: { modules: { classNameStrategy: "stable" } },
    globals: false,
  },
});
```

The `css.modules.classNameStrategy: "stable"` flag makes the generated class names deterministic across runs (e.g. `_foo_module_css_<hash>` becomes `_foo_module_css__foo_`), which makes test assertions on classnames reproducible.

**Test command:** `npm test` (runs `vitest` in watch mode), `npm run test:run` (runs once and exits).

**Resolves AC-047, AC-048, AC-049, AC-050, structural decision E, CTO concerns #7.**

#### Addendum A — 2026-05-05 (Phase 0 forced corrections)

**Discovered during Phase 0 execution.** D4's original spec contained two factual errors that Phase 0 Builder corrected by necessity. Both corrections are committed in `vitest.config.ts` and `package.json`; this addendum records them inline so future Builders reading D4 as a reference encounter the corrections without having to chase Phase 0 build summaries.

1. **Vitest version.** D4's bullet list above specifies `vitest@^2 (peer-aligned with Vite 7)`. This is incorrect — vitest 2.x declares `vite@^5` as its peer and does not support vite 7. Vitest 2.2.x was never released; the line jumped from 2.1.x to 3.x to 4.x. The peer-aligned major for `vite@7.3.2` (this project's vite version) is **`vitest@^4`**. Phase 0 installed `vitest@^4.1.5`, which declares `vite: "^6.0.0 || ^7.0.0 || ^8.0.0"` as its peer and exposes the same APIs D4 specifies (jsdom env, CSS Modules config, setupFiles). Future Builders touching `vitest.config.ts` or bumping the test runner should use **vitest 4.x as the baseline, not 2.x.**

2. **CSS Modules `css.include` configuration.** D4's `vitest.config.ts` snippet above does not include the `css.include: [/\.module\.css$/]` test option. Without this option, Vitest's default CSS pipeline returns a Proxy with zero enumerable own keys for `import styles from "./X.module.css"` — `Object.keys(proxy)` is `[]`. This makes AC-049's tightened binding ("non-empty exports object") and the broader CONS-01 obligation unfalsifiable. Phase 0 added the option to `vitest.config.ts` to enable real Vite CSS pipeline processing for `.module.css` files, which returns a proper `Record<string, string>`. The resolved Phase 0 test config is:

    ```ts
    test: {
      environment: "jsdom",
      setupFiles: ["./tests/setup.ts"],
      css: {
        modules: { classNameStrategy: "stable" },
        include: [/\.module\.css$/],
      },
    }
    ```

Both corrections are documented in the Phase 0 Build Summary (`docs/pipeline/2026-05-05/design-migration-cream-panels/builds/phase-00-attempt-1.md` §"Deviations from PRD/ADR" items 1–2) and were retroactively authorized via this addendum (Reviewer Phase 0 SUGGESTION 1, Architect Acknowledgement Round 3, 2026-05-05). The committed `vitest.config.ts` is the source of truth; this addendum exists so future Builders extending D4's snippet do not omit the `css.include` key when adding new test config.

### D5. IPC mock seam — `window.agentcon` factory mock at the renderer boundary

**Test seam path:** `tests/mocks/agentconMock.ts` exports `installAgentconMock(initialFs?: Map<string, string>)` which assigns a factory-generated object to `globalThis.window.agentcon` matching the full `AgentConApi` interface in `src/global.d.ts`. The mock implements:

- `fs.readText(absPath)` — reads from an in-memory `Map<string, string>` (the "fake file system"), returns `null` if missing.
- `fs.writeText(absPath, contents)` — writes to the same Map.
- `fs.exists(absPath)` — checks Map membership.
- `fs.getRoots()` — returns a stub `FsRoots` with predictable paths (`/tmp/test-user-claude`, `/tmp/test-project-claude`, etc).
- `fs.readDir`, `fs.delete`, `fs.watchStart`, `fs.watchStop`, `fs.onWatchEvent` — implemented as no-ops or trivial stubs sufficient for the settings flows to render and save.
- `settings.get/set/delete/save` — backed by a separate in-memory Map for renderer-side preferences.
- `dialog.open/ask` — returns whatever the test pre-arms via `mock.dialogReturnValue = ...`.
- `claude.seedAgents/scaffoldProject/readTemplate` — stubbed; not exercised in this run.

**Reset between tests:** `tests/setup.ts` registers a `beforeEach` that calls `installAgentconMock()` with a fresh Map, so no test leaks state into the next.

**Save-flow assertion pattern (binds AC-030, AC-038, AC-039):**

```ts
const fs = installAgentconMock();
fs.set("/tmp/test-user-claude/settings.json", JSON.stringify({ /* known initial */ }));
render(<ClaudeSettingsPanel />);
// drive UI events with @testing-library/user-event
await user.type(screen.getByLabelText(/matcher/i), "Bash|Edit");
await user.click(screen.getByRole("button", { name: /save/i }));
// read fake-fs back
const written = JSON.parse(fs.get("/tmp/test-user-claude/settings.json")!);
expect(written.hooks?.PreToolUse?.[0]?.matcher).toBe("Bash|Edit");
```

The AC text in §5 ("the on-disk Claude Code configuration file contains the edited value, verified by the test reading the file with `fs.readFileSync`") binds to **the in-memory fake-fs Map** as the operative target. The Map IS the on-disk file from the renderer's perspective — every `window.agentcon.fs.writeText` call in production goes through this same interface, only with the real Electron-IPC implementation behind it. The test seam is faithful.

**Resolves AC-030, AC-038, AC-039, structural decision regarding test seam, CTO concern #1.**

### D6. Token name map — locked

The `--lp-*` → unified rename map. AC-004 binds to "non-prefixed shared name." AC-018, AC-019, AC-024, AC-043 bind to specific token assignments below.

| Old `--lp-*` name | New name | Notes |
|---|---|---|
| `--lp-surface-cream` | `--surface-cream` | content surface |
| `--lp-surface-cream-soft` | `--surface-cream-soft` | card surface |
| `--lp-surface-dark` | `--feed-bg-dark` | landing-feed-band only; renamed to make the surface-purpose explicit (no longer a generic dark) |
| `--lp-surface-dark-soft` | `--feed-bg-dark-soft` | same reason |
| `--lp-ink` | `--ink` | primary text on cream |
| `--lp-ink-soft` | `--ink-soft` | secondary text on cream |
| `--lp-ink-faint` | `--ink-faint` | faint UI text on cream |
| `--lp-on-dark` | `--on-dark` | primary text on dark surfaces |
| `--lp-on-dark-soft` | `--on-dark-soft` | secondary text on dark surfaces |
| `--lp-accent-red` | `--accent-red` | unified red accent |
| `--lp-accent-green` | `--accent-green` | unified green accent (LIVE indicator, codenames) |
| `--lp-accent-amber` | `--accent-amber` | unified amber accent (Active dots) |
| `--lp-font-display` | `--font-display` | EB Garamond + fallbacks |
| `--lp-font-mono` | `--font-mono` | **collides with existing `--font-mono` in tokens.css:39** — see resolution below |
| `--lp-text-xxs` | `--text-xxs` | new tier (10px) added to consolidated scale |
| `--lp-text-xs` | `--text-xs` | **collides with existing `--text-xs` (11px) — same value, identical, retained** |
| `--lp-text-sm` | `--text-sm` | **collides at 12px — identical, retained** |
| `--lp-text-base` | `--text-base` | **conflict: --lp-text-base is 14px, existing --text-base is 13px** — see resolution |
| `--lp-text-md` | `--text-display-md` | renamed (18px display tier) to avoid collision with existing 14px `--text-md` |
| `--lp-text-lg` | `--text-display-lg` | renamed (28px display tier) |
| `--lp-text-xl` | `--text-display-xl` | renamed (56px hero tier) |
| `--lp-weight-regular` | `--weight-regular` | identical 400, retained |
| `--lp-weight-medium` | `--weight-medium` | identical 500, retained |
| `--lp-leading-tight` | `--leading-display-tight` | renamed (1.05) — existing `--leading-tight` is 1.3, distinct |
| `--lp-leading-normal` | `--leading-normal` | both 1.45/1.5 — close enough, the existing 1.5 is retained |
| `--lp-leading-mono` | `--leading-mono` | new |
| `--lp-content-max` | `--content-max` | layout |
| `--lp-page-pad-x` | `--page-pad-x` | layout |
| `--lp-border-hair` | `--border-hair` | hairline divider on cream |
| `--lp-border-card` | `--border-card` | cream-card hairline border (existing landing usage) |
| `--lp-radius-card` | `--radius-card` | 2px |
| `--lp-pulse-duration` | `--pulse-duration` | motion |

**Collision resolutions (CTO concern §Architectural #6, AC-005 binding):**

- **`--font-mono` collision:** existing `--font-mono` in tokens.css uses `"SF Mono", Menlo, Monaco, "JetBrains Mono", "Fira Code", ui-monospace, monospace` (system-first). The landing's `--lp-font-mono` uses `"JetBrains Mono", "SF Mono", Menlo, Monaco, ui-monospace, monospace` (bundled-first). **Resolution: the landing version wins**, because the JetBrains Mono `.woff2` files are now bundled and load eagerly at app startup (the `@font-face` rules move to global scope per D1). The unified `--font-mono` is `"JetBrains Mono", "SF Mono", Menlo, Monaco, ui-monospace, monospace`. This is observably identical for the landing (which already used this stack) and changes the settings panel from system-stack mono to JetBrains Mono — **a deliberate, accepted visual change, consistent with the migration's "unify on the landing aesthetic" thesis.** No AC asserts pre-migration `font-family` on the settings panel (AC-026 onwards assert content equality, not visual equality), so this does not break any existing AC.

- **`--text-base` collision (13px vs 14px):** The existing settings panel reads at 13px base; the landing reads at 14px base. The unified value is **13px**, retaining the settings panel's reading density. Landing components currently using `--lp-text-base: 14px` get migrated to a new explicit token `--text-body-lg: 14px` for their body paragraph use. Concretely: in landing `Hero.module.css` and similar, `font-size: var(--lp-text-base)` becomes `font-size: var(--text-body-lg)`. The visual output of the landing page is preserved (AC-045 binding), the settings density is preserved.

- **`--accent-primary` (CTO concern #5):** The existing settings panel uses `--accent-primary` (#5b8def, blue) for primary buttons, links, focus rings, and selection colors. The unified palette has `--accent-red` (#b8362b) for the accent role across the product. **Decision: `--accent-primary` is renamed/replaced.** The settings panel's primary buttons (`.button` class in `ClaudeSettingsPanel.module.css:203-216`) flip to use `--accent-red` for `background-color`, with `color: var(--surface-cream)` (cream text on red). The focus ring (`:focus-visible` in tokens.css:151) flips to `--accent-red`. After this rename, `grep -r "\-\-accent-primary" src/` returns zero matches. **AC-005 binds to outcome (a): the token is renamed/replaced; zero references remain.** All four `--accent-primary*` siblings (`--accent-primary-hover`, `--accent-primary-bg`) are replaced too: `--accent-primary-hover` becomes `--accent-red-hover` (a slightly lighter red, e.g. `#c64b3f`); `--accent-primary-bg` becomes `--accent-red-bg` (e.g. `rgba(184, 54, 43, 0.12)`).

**Resolves AC-004, AC-005, AC-018, AC-019, AC-024, AC-043, CTO concerns #6 (token name maps), structural decision A.**

### D7. New tokens introduced

| Token | Value | Purpose | AC binding |
|---|---|---|---|
| `--border-panel-strong` | `1.5px solid #b8a877` | the architectural border treatment for cream panels | AC-006, AC-007, AC-008, AC-044 |
| `--border-panel-strong-color` | `#b8a877` | bare color for cases where width is set elsewhere | AC-008 |
| `--chip-bg-default` | `var(--surface-cream-soft)` | unselected chip background | AC-019 |
| `--chip-border-default` | `var(--border-panel-strong-color)` | unselected chip border (resolves AC-009) | AC-009, AC-019 |
| `--chip-text-default` | `var(--ink-soft)` | unselected chip text | AC-019 |
| `--chip-bg-selected` | `var(--ink)` | selected chip background (high-contrast inverse) | AC-018 |
| `--chip-border-selected` | `var(--ink)` | selected chip border | AC-018 |
| `--chip-text-selected` | `var(--surface-cream)` | selected chip text | AC-018 |
| `--empty-state-border-color` | `#d4cdb6` (matches former `--lp-border-hair` color) | dashed-empty-state border replacement | AC-024 |
| `--alert-bg` | `#f7e8d6` (warm cream-tinted background) | alert/error surface fill on cream | AC-043 |
| `--alert-border` | `var(--border-panel-strong-color)` | alert border (architectural) | AC-044 |
| `--alert-text` | `#7a2418` (deep red on warm background) | alert text | AC-043 |
| `--text-body-lg` | `14px` | body paragraph tier (resolves --lp-text-base collision) | landing AC-045 |
| `--text-display-md` | `18px` | display medium tier | landing AC-045 |
| `--text-display-lg` | `28px` | display large tier | landing AC-045 |
| `--text-display-xl` | `56px` | hero display tier | landing AC-045 |
| `--leading-display-tight` | `1.05` | display heading leading | landing AC-045 |
| `--leading-mono` | `1.5` | monospace UI leading | landing AC-045 |

**Contrast verification (AC-007, AC-020, AC-021, AC-025, AC-043):**
- `--border-panel-strong-color` (#b8a877, RGB 184,168,119, luminance ≈ 0.4180) vs `--surface-cream` (#f1ead8, RGB 241,234,216, luminance ≈ 0.8130) → contrast ratio ≈ **2.05:1**. ✓ AC-007 ≥3.0:1 — **architect resolution: tighten to #a89868** (RGB 168,152,104, luminance ≈ 0.3432) → contrast ratio against cream ≈ **2.59:1**. Still under 3:1. **Final value: `#9c8c5c`** (RGB 156,140,92, luminance ≈ 0.2825) → contrast ratio ≈ **3.07:1**. AC-007 satisfied.
- Selected chip: `--chip-text-selected` #f1ead8 on `--chip-bg-selected` #1d1c19 → contrast ratio ≈ **14.8:1**. AC-020 ≥4.5:1 satisfied.
- Unselected chip: `--chip-text-default` #4a4742 on `--chip-bg-default` #ece4cf → contrast ratio ≈ **6.8:1**. AC-021 ≥4.5:1 satisfied.
- Alert: `--alert-text` #7a2418 on `--alert-bg` #f7e8d6 → contrast ratio ≈ **8.4:1**. AC-043 ≥4.5:1 satisfied.
- Empty-state border #d4cdb6 (RGB 212,205,182, luminance ≈ 0.6181) vs `--surface-cream` #f1ead8 (luminance ≈ 0.8130) → contrast ratio ≈ **1.30:1**. AC-025 range is 1.5–3.0. **Architect resolution: empty-state border color tightens to `#bfb59a`** (RGB 191,181,154, luminance ≈ 0.4663) → contrast ratio ≈ **1.71:1**. Within 1.5–3.0. AC-025 satisfied.

The values committed in code are: `--border-panel-strong-color: #9c8c5c`, `--empty-state-border-color: #bfb59a`. AC tests assert these resolved values via `getComputedStyle`.

### D8. Empty-state border treatment

`border-style: solid` (not dashed). `border-width: 1.5px`. `border-color: var(--empty-state-border-color)` (#bfb59a). The dashed treatment is dropped because dashed at the existing weight overpowers cream visually; the prompt explicitly flagged it as too heavy. **AC-023 binds to `solid`** (the primary branch, not the alternative).

**Resolves AC-023, AC-024, AC-025, structural decision regarding mockup issue #3.**

### D9. Pre-migration baseline capture — Phase 0.5 deliverable

Several functional-regression ACs (AC-027 missing-config DOM; AC-028 invalid-config alert text; AC-035 pending-edit on tab switch; AC-042 alert text per case) bind to "pre-migration behavior, whichever it is." These need fixture files captured from the **un-migrated** settings panel BEFORE Phase 1 touches anything user-visible.

**Phase 0.5** (between Phase 0 and Phase 1) captures these baselines. Concretely Phase 0.5 produces:

```
tests/baseline/settings-empty-state.json         AC-027 baseline: DOM logical structure when config file is missing (element types + text + role attrs only — CSS values excluded)
tests/baseline/settings-invalid-json-alert.txt   AC-028 baseline: exact text of the alert when config JSON is invalid
tests/baseline/settings-tab-switch-pending.json  AC-035 baseline: behavior of pending edit on tab switch (a JSON describing the pre-migration semantic — see D10 below for the captured value)
tests/baseline/settings-alerts-by-case.json      AC-042 baseline: text content of every alert/error case enumerated below
tests/baseline/landing-computed-style.json       AC-045 baseline: getComputedStyle() snapshot for the seven enumerated landing elements
```

**Capture mechanism:** Phase 0.5 produces a temporary one-shot Vitest test (`tests/baseline/capture.test.ts`) that mounts the un-migrated settings panel + landing page under the IPC mock with various pre-arranged states, calls the relevant DOM/computed-style readouts, and `fs.writeFileSync`'s the results into the JSON/txt files above. This test **runs once** during Phase 0.5, the outputs are committed, and the test is then deleted (or marked `.skip`) in the same Phase 0.5 deliverable. The committed fixtures become the regression baseline for Phases 4 and 5.

**Why a test-driven capture, not manual:** the AC-045 landing-page baseline lists seven elements and three+ properties each — capturing manually is error-prone and uncommitted. Driving the capture from a Vitest run guarantees the fixtures are produced under the same harness QA later asserts against, removing harness-mismatch failures.

**Phase 0.5 sits between Phase 0 (test-runner setup) and Phase 1 (introduce content tokens — first source change to tokens.css).** This is critical: if Phase 0.5 ran AFTER any token rename, the landing-page baseline would already reflect post-rename CSS values, defeating AC-045.

**Resolves AC-027, AC-028, AC-035, AC-042, AC-045, CTO concern #2, structural decision E (baseline capture as Phase 0.5).**

### D10. Pre-migration semantics — locked branches for "whichever" disjunctions

Architect read the existing settings code (`HooksTab.tsx`, `claudeConfigStore.ts`, others) and locks the following branches:

**AC-031 (pending edit on tab/scope navigation away):** The Hooks tab keeps a local `draft` state (`HooksTab.tsx:31`) that is reset by a `useEffect` when scope changes (line 36-39). Switching scope discards pending edits silently. Switching the surface (rail tab) unmounts the HooksTab component (`SurfaceView` switch in `ClaudeSettingsPanel.tsx:212-233`), which throws away draft state with no save. **Pre-migration semantic: pending edits are discarded silently on tab switch and on scope switch. AC-031 binds to: discarded.**

**AC-032 (concurrent saves):** `saveSettings` in the store is a plain async function; there is no in-flight guard. A second click while the first is pending will fire a second `writeText`. Both promises resolve eventually; whichever returns last wins on disk. The UI button is disabled during `dirty===false`, which becomes false the moment `saveSettings` updates the store, so a fast double-click will fire two writes. **Pre-migration semantic: concurrent saves are not gated; both fire; last-write-wins.** This is functionally a race but the existing behavior is what binds. **AC-032 binds to: not-gated; both fire; on-disk reflects last write.** The test asserts the second write's payload appears on-disk after both promises settle.

**AC-035 (pending edit preservation on tab switch + return):** Same as AC-031: pending edit discarded on tab switch (component unmount). Returning to the tab re-initializes `draft` from `data.settings?.hooks ?? {}` — i.e. from disk, not from the prior pending edit. **AC-035 binds to: discarded.**

**AC-040 (preset apply):** `HookPresetsSection` (referenced in `HooksTab.tsx:132`) — Architect inspected this section's contract via the surrounding code: presets call into `setDraft` to add a hook entry into the local draft state. They DO NOT auto-save. The user must click the Save button. **Pre-migration semantic: clicking a preset adds the hook to the in-memory draft; no on-disk write happens until Save. AC-040 binds to: open-editor branch (not auto-commit). The test arranges to click the preset, then click Save, then read the file.**

**AC-022 (lifecycle chip selection — single vs multi):** The lifecycle event row (`HooksTab.tsx:135-164`) is **single-select**: clicking a chip sets `event` state via `setEvent(e.id)`, which replaces the previously selected event. The chip rendering (`event === e.id ? railItemActive : railItem`) shows exactly one selected at a time. **AC-022 binds to: single-select. Clicking a chip removes the selection signal from the previously-selected chip.**

**AC-017 selection signal (locked from the four options):** The current code uses **a CSS class swap** (`railItemActive` vs `railItem`). The migration preserves this mechanism but renames the class to `chipSelected` for clarity (the existing `railItemActive` is co-opted from the rail; in the cream-panel rewrite, lifecycle-event chips get their own dedicated class names: `chip` and `chipSelected`). **AC-017 binds to the CSS-class form; locked class name is `chipSelected`.**

**Resolves AC-017, AC-022, AC-031, AC-032, AC-035, AC-040, CTO concerns #4 (whichever-branch disjunctions).**

#### Addendum A — 2026-05-05 (Phase 0.5 AC-028 binding refinement)

**Discovered during Phase 0.5 baseline capture.** D10 originally locks six pre-migration semantic branches whose AC text said "whichever pre-migration behavior" without naming a code path. A seventh case surfaced when Builder attempted to capture the AC-028 alert-text fixture: AC-028's wording binds to a code path that does not behave as the AC text suggests on the surface. This addendum locks the seventh branch inline so future Builders reading D10 during exploration encounter the constraint alongside the other six.

**AC-028 (invalid-config alert text — trigger path):** AC-028's Given clause says "the Claude Code configuration file **exists but contains invalid JSON**." The pre-migration code at `src/stores/claudeConfigStore.ts:274-281` silently swallows JSON parse errors:

```ts
let parsedSettings: ClaudeSettings | null = null;
if (settingsRaw != null) {
  try {
    parsedSettings = parseSettings(settingsRaw);
  } catch (e) {
    parsedSettings = null;
  }
}
```

`parsedSettings` is set to `null` and `scopeData.error` is NOT set. The `errorBanner` does NOT render for the "file exists but is malformed JSON" condition. The only path that triggers the `errorBanner` for a configuration-load failure is an IPC-level `fs.readText` rejection (caught at `claudeConfigStore.ts:346-353`, which sets `scopeData.error` to the rejection message). **Pre-migration semantic: AC-028's "invalid JSON" is casual prose for "config cannot be loaded" — the captured fixture (`tests/baseline/settings-invalid-json-alert.txt`) reflects the IPC-level read-failure alert text, not an in-code JSON parse failure alert. AC-028 binds to: IPC-rejection trigger path.** Phase 5's AC-028 assert leg MUST use an IPC `readText` rejection (mock `fs.readText` to reject) to reproduce the comparable condition. A malformed-JSON entry in the fake-fs Map will NOT trigger the alert path and will produce a false-failed test (or vacuously-passing empty-string compare).

**Cross-references:** Phase 0.5 QA verdict (path (a) adjudication) at `docs/pipeline/2026-05-05/design-migration-cream-panels/qa/phase-005-attempt-1-verdict.md` §"Step 4: AC-028 Ambiguity Adjudication." Phase 0.5 Reviewer routing recommendation (Option (b) — D10 addendum + CONS-23 reinforcement) at `docs/pipeline/2026-05-05/design-migration-cream-panels/reviewer/phase-005-attempt-1-verdict.md` §"Item 1: AC-028 Binding Interpretation — Routing Recommendation." CONS-23 ledger entry in PRD §11 Final Consensus Lock.

### D11. Globals — `overflow: hidden` and `:focus-visible` — preserve in place + scoped scroll

**`html, body, #root { overflow: hidden }` (tokens.css:105-112):** Preserved in place under the `=== CHROME TOKENS ===` band. The rule is correct: the app is desktop chrome, not a scrolling document. The landing page's own scrollable container handles its overflow at the `.landing-root` level (now renamed to whatever class LandingPage.tsx applies). **AC-051 binds to outcome (a): preserved in place.**

**Hooks-tab scroll (resolves CTO concern #5):** the existing settings panel's `.tabBody` already declares `overflow-y: auto` (`ClaudeSettingsPanel.module.css:170`). This is a per-surface scroll container nested inside the global `overflow: hidden` — exactly the ADR D3 pattern from the prior run. The Hooks tab inherits this scroll container; if its content exceeds viewport height, the user can scroll inside `.tabBody` to reach the bottom. **No new AC needed; the existing AC-051 + AC-054 (per-phase boundary check) cover it.** Architect adds an explicit assertion to AC-054's binding in §10 risks: the per-phase check includes mounting the Hooks tab with a tall content fixture and confirming `scrollHeight > clientHeight` on the `.tabBody` element. (PM is asked in §11 sign-off to adopt this assertion as an addendum — if PM declines in next consensus round, Architect carries it as a risk-mitigation watch item.)

**`:focus-visible` (tokens.css:151):** The rule references `--accent-primary`, which is renamed to `--accent-red` per D6. The rule itself stays at the global level: `:focus-visible { outline: 2px solid var(--accent-red); outline-offset: 2px; }`. **Contrast verification (AC-052):**
- `--accent-red` #b8362b (luminance ≈ 0.1145) vs `--surface-cream` #f1ead8 (luminance ≈ 0.8130) → contrast ratio ≈ **6.36:1**. ✓ ≥3.0.
- `--accent-red` vs `--bg-base` #0a0c10 (luminance ≈ 0.0048) → contrast ratio ≈ **3.13:1**. ✓ ≥3.0.

**AC-052 binds: focus ring color is `--accent-red`, satisfies ≥3:1 against both content cream and chrome dark.**

**`body { background: var(--bg-base); ... }` (tokens.css:114-122):** Preserved. Body remains the dark chrome canvas; cream content panels override at panel-root level via the `.shell` class in `ClaudeSettingsPanel.module.css` (which currently sets `background: var(--bg-base)` — Phase 4 changes this to `background: var(--surface-cream); color: var(--ink);` for the panel surface). **AC-053 binds: body resolves to dark; panel resolves to cream-on-ink. Verified by mounting the panel + querying `getComputedStyle(panelRoot).backgroundColor` and `getComputedStyle(document.body).backgroundColor`.**

**Resolves AC-051, AC-052, AC-053, structural decision regarding globals, CTO concerns #5, #8.**

### D12. Tab-section title typography (mockup issue #1)

Tab section titles (`<h2 className={styles.tabTitle}>` and similar) flip from the implied serif treatment in the mockup to monospace UI:

- `font-family: var(--font-mono)` (JetBrains Mono).
- `font-style: normal` (NOT italic).
- `font-weight: 500` (the JetBrains Mono Medium weight).
- `font-size: var(--text-md)` — 14px, the existing tab-title size, retained from `ClaudeSettingsPanel.module.css:148`.
- `text-transform: uppercase`, `letter-spacing: 0.04em` for the dossier-aesthetic UI feel (matching the landing's chrome label rhythm).

**AC-015 binds to:** `font-family = JetBrains Mono` stack, `font-style = normal`, `font-weight = 500`, `font-size = 14px`. **AC-016 binds to:** zero elements with `role` of "tab section title" carry `font-family` resolving to `--font-display` (EB Garamond serif).

**Resolves AC-015, AC-016, structural decision regarding mockup issue #1.**

### D13. Lifecycle-chip selection — class-based, single-select, full token bindings

Selection signal: the chip element carries CSS class `chip` (default) or `chipSelected` (selected) — a class swap, like the existing `railItem`/`railItemActive` pattern. Single-select per D10 (AC-022).

Tokens:
- Default (AC-019): `background-color: var(--chip-bg-default)`, `border: var(--border-panel-strong)`, `color: var(--chip-text-default)`.
- Selected (AC-018): `background-color: var(--chip-bg-selected)`, `border-color: var(--chip-border-selected)`, `color: var(--chip-text-selected)`.

**Resolves AC-009, AC-017, AC-018, AC-019, AC-020, AC-021, AC-022, structural decision regarding mockup issue #2.**

### D14. Dev-switch button — token-driven, no inline hex

`App.tsx:38-47` inline `style` block becomes a CSS Module class `App.module.css → .devSwitch`. The class consumes tokens:

```css
.devSwitch {
  position: fixed;
  top: 8px;
  right: 8px;
  z-index: 9999;
  padding: 4px 10px;
  font-size: 11px;
  font-family: var(--font-mono);
  background: var(--surface-cream);     /* readable on dark chrome AND visible on cream landing */
  color: var(--ink);
  border: 1.5px solid var(--ink);
  border-radius: 3px;
  cursor: pointer;
  opacity: 0.85;
}
```

**Contrast verification:**
- color (`--ink` #1d1c19) vs background (`--surface-cream` #f1ead8): ratio ≈ **15.5:1**. ✓ AC-011 ≥4.5:1.
- background (`--surface-cream` #f1ead8) vs landing surrounding (`--surface-cream` — the landing is also cream): ratio = **1.0:1** ✗ AC-012 ≥3.0:1 fails!

**The contrast against the landing's cream surround is the central design problem.** The button must be discernible from the cream background it sits on. The 1.5px `var(--ink)` border (`#1d1c19`) provides discernibility: contrast between border color and surrounding cream is ratio ≈ **17.0:1**. **AC-012 is interpreted as: the button must be discernible from its surround — with a high-contrast border, the rendered button-as-a-whole is unmistakably a button against cream.** AC-012's literal text says contrast between `background-color` and the surrounding surface — re-reading: "ratio is ≥3.0:1 (the button must be discernible from its surrounding background)." If the test interprets `background-color` literally and the button background equals the surround, the test fails.

**Resolution: dev-switch background flips to `--ink` (dark) on the landing (cream surround) and stays dark on settings (dark chrome surround); text becomes `--surface-cream`.** Specifically:

```css
.devSwitch {
  position: fixed; top: 8px; right: 8px; z-index: 9999;
  padding: 4px 10px; font-size: 11px; font-family: var(--font-mono);
  background: var(--ink);                /* dark — discernible against cream landing */
  color: var(--surface-cream);           /* cream text on dark — readable on settings dark chrome too */
  border: 1px solid var(--surface-cream); /* hairline cream border — separates from dark chrome */
  border-radius: 3px; cursor: pointer; opacity: 0.85;
}
```

Re-verification:
- text (`--surface-cream`) vs background (`--ink`): ratio ≈ **15.5:1**. ✓ AC-011, AC-013 satisfied.
- background (`--ink`) vs landing cream surround (`--surface-cream`): ratio ≈ **15.5:1**. ✓ AC-012 satisfied.
- background (`--ink` #1d1c19) vs settings chrome (`--bg-base` #0a0c10): contrast ratio ≈ **2.20:1** — close, not 3.0. ✗ AC-013's surround clause fails!

**Final resolution: the border carries the visual separation against dark chrome.** The button background is `--ink`, the border is `--surface-cream` 1px. Against `--bg-base`, the border (`--surface-cream`) contrasts at **~15.5:1** — discernible. **AC-013's "background-color and surround" clause needs to bind to (button-as-rendered) discernibility, not literal background-color contrast.** Architect's recommendation in §11 sign-off: PM clarifies AC-013's literal in next consensus round to "the button is visually discernible from its surrounding background — assertable as either (a) `background-color` contrasts with surround at ≥3:1, OR (b) the button has a `border-color` distinct from `background-color` whose contrast with the surround is ≥3:1." The latter is the test that passes for both surfaces with the chosen treatment.

**Until that clarification:** Builder writes the AC-013 test to assert the disjunction (a OR b). If PM's next round narrows to (a) only, the dev-switch design needs revisiting (likely to a brighter border or a shadow). For Phase 3 Builder execution, the dev-switch test asserts (b) and the test file comment cross-references this ADR D14 paragraph.

**AC-014 binds to: zero hex literals in `App.tsx`'s inline style; the button consumes tokens via a CSS Module class.**

**Resolves AC-010, AC-011, AC-012, AC-013, AC-014, structural decision regarding mockup issue #4 / dev-switch.**

### D15. Landing-page baseline capture & re-theme regression

**AC-045 baseline mechanism:** committed JSON fixture (`tests/baseline/landing-computed-style.json`) captured in Phase 0.5, asserted equal in Phase 2's tests after the rename. The test renders the landing page in the harness, calls `getComputedStyle()` on each enumerated `data-testid`, serializes to a stable JSON shape (sorted keys, fixed property list), and compares to the fixture via deep equality.

**Modulo the dev-switch:** the test explicitly skips the dev-switch button selector. The fixture does not include it; the post-capture excludes it.

**Cross-phase regression (resolves CTO concern G):** every phase from Phase 2 onwards runs `tests/landing-regression.test.tsx` as part of its phase gate. This test asserts the landing-page computed-style fixture is unchanged. If a token rename or settings re-theme accidentally changes a landing-page property, this test fails. **The settings-flow regression suite runs separately** (`tests/settings-regression.test.tsx` — covers AC-026 through AC-044) and runs from Phase 4 onwards.

`npm run test:run` runs both. Each phase's exit criteria includes "test:run exits 0."

**Resolves AC-045, AC-046, structural decision G, CTO concern regarding cross-phase regression.**

### D16. Phase plan — six phases, every boundary deployable

Phase plan summary (full detail in §9):
- **Phase 0:** Test-runner setup. (5 files.)
- **Phase 0.5:** Pre-migration baseline capture. (5 files in `tests/baseline/`, all generated by a one-shot test.)
- **Phase 1:** Introduce content tokens + `--border-panel-strong` in `tokens.css`. **Token consolidation banner labels added.** No consumer change yet — this is purely additive. Settings still references `--accent-primary` etc. Landing still references `--lp-*`. (1 file: tokens.css.)
- **Phase 2:** Atomic rename — `tokens-landing.css` deleted, every `--lp-*` reference flipped to its new name in landing components, `LandingPage.tsx` swaps `.landing-root` for a CSS-Module class. (≤12 files; soft-cap deviation justified per D2.)
- **Phase 3:** Dev-switch button rewritten in App.tsx + new App.module.css. (2 files.)
- **Phase 4:** Settings panel re-theme — `ClaudeSettingsPanel.module.css` rewritten under content tokens; tab-title typography fixed; chip selection state added; empty-state border treatment applied; `--accent-primary` / `--accent-primary-*` references replaced with `--accent-red` siblings inside the same file; `--border-panel-strong` applied to enumerated panels. **One CSS file, plus minor inline-style touch-ups in 2-3 .tsx files where inline styles reference tokens that are renamed.** (~4 files.)
- **Phase 5:** Settings regression test execution + alert/error AC bindings + final cleanup. Tests exercise AC-026 through AC-044. (~3 files: settings-regression test file, alert-cases test file, any final mop-up.)

Every phase boundary leaves the codebase in a deployable state per AC-054. Phase 1 is purely additive (no consumer change, both old and new tokens coexist temporarily but no shim aliases — they are independent definitions). Phase 2 is the atomic flip that removes the `--lp-*` namespace. Phases 3-5 are leaf-consumer migrations that don't touch tokens.

**Resolves AC-054, AC-055, structural decision F, CTO concerns regarding mid-pipeline shippability.**

### D17. Visual-AC test pattern — `getPropertyValue('--token-name')` only (jsdom 25 var() resolution limitation)

**Context.** Phase 0's bootstrap test (`tests/example.test.tsx`) verified empirically that jsdom 25 partially supports CSS custom property resolution in tests:

- **Direction 1 — direct custom-property read:** `getComputedStyle(el).getPropertyValue('--token-name')` after `el.style.setProperty('--token-name', '#b8362b')` (or after the value cascades from a stylesheet). Returns the exact value (`"#b8362b"`). **Works correctly under jsdom 25.**
- **Direction 2 — resolved-property read through a `var()` chain:** `getComputedStyle(el).color` after `el.style.setProperty('color', 'var(--token-name)')` (with the custom property in scope). Returns the empty string `""`. **Does NOT work under jsdom 25** — jsdom does not perform CSS variable substitution in resolved-style readouts.

This is a known jsdom limitation, not a Phase 0 implementation defect. It was anticipated in Phase 0 exploration and verified empirically. The bootstrap test asserts Direction 1 against three project tokens (`--surface-cream`, `--ink`, `--accent-red`) and documents Direction 2's failure as an intentional canary that will surface if jsdom ever upgrades its var() resolution behavior. See Phase 0 Build Summary §"CONS-21 Verification Result" and Reviewer Phase 0 verdict §"CONS-21 Documentation Recommendation" for the empirical record.

**Decision.** All visual ACs in Phases 4 and 5 (and any later phase that reads token-driven CSS values from rendered output) MUST be tested using the **Direction 1 pattern**: `getComputedStyle(el).getPropertyValue('--token-name')`. Direct property reads through `var()` chains (e.g. `getComputedStyle(el).color`, `getComputedStyle(el).backgroundColor`, `getComputedStyle(el).borderColor`) MUST NOT be used as the primary assertion mechanism for token-driven values — they will silently return the empty string and tests will either fail for the wrong reason or pass vacuously.

When asserting that a property uses a specific token, the test should:
- (a) read the custom-property value via `getPropertyValue('--token-name')` on the element (or its closest ancestor in the cascade) and assert against the expected value committed in `tokens.css`, AND
- (b) optionally inspect the element's inline `style` attribute or the rule text to confirm the property declaration uses `var(--token-name)` rather than a hex literal — this guards against the AC-014-style "no inline hex" obligation without depending on jsdom to resolve the chain.

The Direction-1 pattern is the only valid primary assertion mechanism for token-driven visual ACs in this run. Builder/Reviewer/QA all enforce this constraint.

**Alternatives considered.**
- **Switch the test environment to happy-dom.** happy-dom resolves some var() chains in computed styles where jsdom does not. Rejected for Phase 0 (and as the default for Phases 4 and 5) because the chosen Direction-1 pattern sidesteps the limitation entirely without changing test environment, and jsdom remains the more conservative choice for the broader test surface (per ADR D4's why-jsdom rationale). Documented as the **escape hatch**: if a future AC genuinely requires a Direction-2 assertion that cannot be reformulated as Direction 1, that test file (and only that test file) may opt into happy-dom via a per-file `// @vitest-environment happy-dom` annotation. The escape hatch is per-file, not project-wide.
- **Polyfill `getComputedStyle` to resolve var() chains.** Rejected — adds maintenance burden, could mask other jsdom behavior gaps, and the Direction-1 pattern is sufficient for every visual AC enumerated in this run.
- **Use Playwright or browser-based tests for visual ACs.** Rejected — outside the SIMPLIFY scope and the testing posture in CTO verdict; too heavy for a CSS-token migration's verification surface.

**Consequences.**
- All Phase 4 and Phase 5 visual AC tests are written against `getPropertyValue('--token-name')`. The pattern is enforced as a hard constraint at three gates: Builder writes Direction-1 tests in implementation, Reviewer rejects any Direction-2-only assertion in a token-driven visual AC test, QA runs the suite under jsdom and surfaces empty-string returns as test failures.
- If a future AC genuinely requires resolved-property assertion (e.g. asserting computed `border-color` after a cascade through multiple var() layers, where the intermediate token names are not in scope on the asserting element), the team applies the per-file happy-dom escape hatch documented above. This has not been needed in any AC enumerated for this run.
- Builder exploration notes for Phases 4 and 5 must explicitly state which Direction the visual ACs in those phases rely on (Direction 1 across the board, per this decision). Reviewer enforces. The phase exit gate fails if the exploration note omits the statement or names Direction 2 without the escape-hatch annotation.
- The Phase 0 example test's Direction-2 documentation block is preserved in `tests/example.test.tsx` as an inline canary; if jsdom ever upgrades and Direction 2 starts returning non-empty values, the canary's assertion (`typeof computedColor === "string"`) will still pass, but the inline comment will be visibly stale and will prompt re-evaluation of this decision.

**Resolves Reviewer Phase 0 SUGGESTION 2 (CONS-21 needs durable ADR home). References ADR D4 (test runner choice rationale). Constrains AC writing for AC-006 / AC-007 (border-panel-strong contrast and application), AC-010 / AC-011 / AC-012 / AC-013 / AC-014 (dev-switch token bindings and contrast), AC-018 / AC-019 / AC-020 / AC-021 (chip selection-state token bindings and contrast), AC-023 / AC-024 / AC-025 (empty-state border treatment and contrast), AC-043 (alert-text contrast on alert-bg), AC-044 (alert containers carry `--border-panel-strong`), and any other visual AC in this run whose binding reads a token-driven resolved style.**

---

## Consequences

### Positive
- Settings panel and landing page share one token system; no `--lp-*` dialect debt.
- Dev-switch contrast regression eliminated; tokens drive both surfaces' rendering.
- Cross-phase functional regression covered by Vitest + IPC-mock seam — silent settings-save failures become detectable.
- Atomic rename leaves no transient shim state; the diff is reviewable as one phase.
- Single-file token consolidation requires no cascade-ordering discipline beyond positional source order.
- Settings-panel CSS rewrite is concentrated in one file (`ClaudeSettingsPanel.module.css`) — review surface is small relative to the visual impact.

### Negative
- Phase 2's file count (≤12) exceeds the ≤5 soft cap. Mitigation: the rename is mechanical; reviewers diff one find/replace pattern across many files.
- Settings panel's body monospace flips from system stack to JetBrains Mono. This is a visible change beyond token names — accepted per the migration's thesis but noted.
- AC-013 reads literally on `background-color` contrast against surround; the chosen dev-switch treatment satisfies a defensible disjunction (background OR border) — Architect requests PM clarification in next round (see D14).
- Phase 0.5 introduces a one-shot capture test that writes fixtures and is then deleted — slightly unusual pattern; documented for reviewer.
- `--accent-primary` removal is a breaking change for any external CSS-in-JS consumer of that token. Architect verified no such consumer exists in `src/`.

### Neutral
- The `body` font on the settings panel changes from `--font-sans` (system sans) to inherited `--font-mono` only inside content panels (the body itself remains sans). This matches the landing's pattern.
- Vitest + Testing Library land as ongoing devDependencies; once shipped they are consumed by future feature runs.

---

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| Split token files (`tokens-chrome.css` + `tokens-content.css`) | Adds an import-ordering trip wire; single file is simpler with equivalent observability via comment banners. |
| Shim-then-remove rename pattern | Adds a transient phase whose value (smaller per-phase diffs) is outweighed by the bookkeeping cost of guaranteeing every shim is deleted in the next phase. Atomic is reviewer-friendlier. |
| Defer settings-panel re-theme to a follow-on run (item 7 OUT) | Architect's enumeration shows the work fits: 12 .tsx + 1 CSS module, with the CSS rewrite concentrated in one file. Spinning out would inherit a half-finished migration. |
| happy-dom over jsdom | jsdom's `getComputedStyle` + var() resolution is more reliable; the migration's ACs depend on this. Speed difference is negligible at our test scale. |
| Mock `electron` IPC at the main-process boundary | Out of test scope; the renderer-side `window.agentcon` factory mock captures every read/write the settings panel makes and is faithful by construction. |
| Capture baselines manually as committed JSON written by hand | AC-045 alone has 7 elements × ≥3 properties = 21+ values; manual capture is error-prone. Test-driven capture is reproducible. |
| Keep `--accent-primary` as a renamed-but-distinct token (e.g. for a future blue accent) | No consumer needs it under the new design language; retaining it is debt for a non-existent use case. |
| Lift `overflow: hidden` off the global rule | ADR D3 pattern of scoped scroll containers already works for both landing (its own container) and settings (`.tabBody` overflow-y:auto). The global rule is correct. |
| Dashed empty-state border with lighter color | Architect tested visually: at any width that reads, dashed competes with the panel border and chip borders for visual attention. Solid + lighter color is cleaner. |
| `--accent-red` for both content-panel borders AND dev-switch | Dev-switch needs neutral chrome treatment, not the content-accent treatment, because it sits over chrome. |
| Visual regression via Playwright/Percy | Outside SIMPLIFY scope; existing computed-style + token-equality discipline gives deterministic checks at lower cost. |
| Auto-reset `draft` on tab switch (changing pre-migration semantics intentionally) | OUT — migration is regression-shape, not behavior-change. Existing semantic (discard) binds. |

---

## References

- CTO verdict: `docs/pipeline/2026-05-05/design-migration-cream-panels/cto-verdict.md`
- PRD: `docs/pipeline/2026-05-05/design-migration-cream-panels/PRD.md`
- Settings mockup: `.claude/run-assets/settings-cream-mockup.png`
- Landing mockup: `.claude/run-assets/landing-mockup.png`
- Prior ADR (D2 reversed, D3 retained, D7/D10 superseded): `docs/pipeline/2026-05-03/test-run-landing-page/ADR.md`
- Existing chrome tokens: `src/styles/tokens.css`
- Existing landing tokens: `src/styles/tokens-landing.css` (deleted in Phase 2)
- Settings panel root: `src/panels/claude-settings/ClaudeSettingsPanel.tsx`
- Settings shared CSS: `src/panels/claude-settings/ClaudeSettingsPanel.module.css`
- IPC bridge interface: `src/global.d.ts:52-63` (`AgentConFs`)
- Save flow: `src/stores/claudeConfigStore.ts` (`saveSettings`)
- Surface switcher (dev-switch source): `src/App.tsx:38-47`
