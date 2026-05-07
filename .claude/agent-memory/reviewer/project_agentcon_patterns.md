---
name: Agentcon project — recurring patterns and anti-patterns to fast-scan for
description: Patterns established in Phases 1-4 of the landing-page run AND Phase 0 of the design-migration-cream-panels run; reference for any future phases
type: project
---

## From landing-page run (Phases 1-4, 2026-05-03)

Builder implemented all 4 phases with zero BLOCKING findings across all phases. Run is complete as of 2026-05-03.

**Confirmed correct patterns (scan quickly):**
- `className="landing-root"` must remain a plain string literal (CONS-14) — if it ever appears as `styles.landingRoot` or any CSS-module reference, the token scope breaks.
- All `--lp-*` CSS custom properties must stay inside `.landing-root {}` in `tokens-landing.css`. Any `--lp-*` token found under `:root` is BLOCKING.
- Dev-only UI must use `{import.meta.env.DEV && ...}` structural gate — never `style={{ display: ... }}` or class-based hiding (CONS-15).
- `readInitialSurface()` must default to `"settings"` — if anyone swaps it to `"landing"`, AC-002 silently breaks.
- `tokens.css` must remain untouched — any modification is BLOCKING per CONS-02 (landing-page run only; this run intentionally modifies tokens.css in Phases 1-4).
- Named exports only (no `export default` in component files) — pattern confirmed across all Phase 1-4 components.
- Spacing uses 4px-grid inline values; no spacing tokens exist in this project. Inline values (8px, 24px, 32px, etc.) are correct and not a convention violation.
- `letter-spacing` and `line-height` values are typographic refinements with no token equivalents — inline values are correct.
- All hardcoded hex values are legitimate: only appear in `tokens-landing.css` as token definitions (under `.landing-root`), never in component CSS files. One exception: `rgba(29,28,25,0.12)` for the listbox box-shadow in `ProjectSelector.module.css` — a pre-justified one-off NIT.
- `@font-face` blocks: must only exist in `tokens-landing.css`. If any Phase 4+ component CSS declares a new `@font-face`, that is BLOCKING.

**Phase 4 HIGH finding (for future calibration):**
- `aria-activedescendant` should be placed on the focused element (the trigger `<button>`) for maximum AT compatibility per WAI-ARIA 1.2, not on the non-focused `<ul role="listbox">`. Builder placed it on the `<ul>`. This is a defensible pattern used in many real-world implementations but is not spec-strict. Severity: HIGH (not BLOCKING) because the AC text permits "aria-activedescendant or focus" and the visual highlight still works. If future phases add more interactive components, watch for this pattern.

**Phase 3 findings (resolved, for calibration):**
- `ClassifiedStamp.tsx` aria-hidden + role="img" contradiction — resolved in Phase 4 by removing role="img".
- `Footer.module.css` empty class bodies — SUGGESTION, still present, not blocking.
- `fontFamily` SVG presentation attribute on `<text>` — NIT, intentional.

**Focus-visible audit result (Phase 4):**
- The global `:focus-visible` rule in `tokens.css:151` (blue `--accent-primary` outline) does NOT affect any user-visible landing-page element. All 4 landing-page buttons (1 trigger + 3 deploy buttons) have explicit CSS module overrides that win on specificity. No `<a>` elements exist in the landing page. Dev-switch button picks up the global blue ring but is dev-only and outside `.landing-root`.

---

## From design-migration-cream-panels run (Phase 0, 2026-05-06)

Phase 0 (test runner setup) passed with zero BLOCKING findings.

**CONS-21 jsdom Direction-2 limitation — LOAD-BEARING CONSTRAINT:**
- jsdom 25 supports Direction 1: `getComputedStyle(el).getPropertyValue("--token-name")` reads back token values set via `el.style.setProperty()` or inline CSS. CONFIRMED WORKING.
- jsdom 25 does NOT support Direction 2: `getComputedStyle(el).color` on an element with `color: var(--token)` returns `""` (empty string). var() chains are NOT resolved.
- **All visual AC assertions in Phases 4/5 MUST use Direction 1 (getPropertyValue) only.** Asserting `getComputedStyle(el).color` / `.backgroundColor` on elements where the value is set via `var()` will return `""` and produce false negatives. This is the canonical Phase 5 test-writer trap — scan any test that asserts `.color` or `.backgroundColor` and verify it's using `getPropertyValue` instead.
- Source: confirmed in `tests/example.test.tsx` Direction-2 test and Builder's Phase 0 Build Summary CONS-21 section.

**IPC mock seam — verified clean shape:**
- `tests/mocks/agentconMock.ts` implements full `AgentConApi` (all 5 namespaces: `fs`, `settings`, `dialog`, `opener`, `claude`; 20 total methods). TypeScript shape check via `mock: Window["agentcon"]` annotation enforces parity at compile time.
- Install path: `(globalThis as any).window.agentcon = mock` — works under jsdom where `globalThis.window === window`.
- State isolation: each `installAgentconMock()` call creates fresh `fakeFs` and `fakeSettings` Maps. `beforeEach` in `tests/setup.ts` resets state before every test.
- Write-failure injection: `installAgentconMock({ writeShouldFail: true | Error })` — needed for AC-042 case 3 (save-failure alert). Already built and verified.

**ADR errors to be aware of:**
- ADR D4 specifies `vitest@^2 (peer-aligned with Vite 7)` — this is WRONG. vitest 2.x requires vite@^5; the project uses vite 7.3.2; vitest 4.x is the correct choice. Builder used 4.1.5.
- ADR D4 config snippet omits `css.include: [/\.module\.css$/]` — this IS required for non-empty CSS Module exports. Without it, Vitest returns a Proxy with zero enumerable keys, breaking CONS-01.
- Both are documented as forced corrections in the Phase 0 Reviewer verdict.

**Fast-scan items for Phases 1-5:**
- Any test asserting `getComputedStyle(el).color` or `.backgroundColor` = a hex value → likely wrong; should use `getPropertyValue("--token-name")`.
- Any test that writes `expect(computedStyle.someProperty).toBe("#hexval")` → verify it's reading a property that doesn't depend on var() resolution.
- Phase 5's settings-regression tests: every token-value assertion must use Direction 1. If Builder uses Direction 2, the test will always pass (returns "") unless they're asserting non-empty, which would also pass vacuously.
- `tests/setup.ts` `beforeEach` correctly resets `window.agentcon`. If any Phase 5 test needs a non-default mock (e.g. `writeShouldFail`), it re-calls `installAgentconMock()` with options after the `beforeEach` has already run — this overrides the beforeEach's default mock. Verify any such test cleans up after itself or relies on the next beforeEach to restore defaults.

---

## From design-migration-cream-panels run (Phase 0.5, 2026-05-06)

Phase 0.5 (pre-migration baseline capture) passed with 0 BLOCKING, 1 HIGH, 2 SUGGESTION, 1 NIT findings.

**CRITICAL: AC-028 binds to IPC rejection path, not parse-failure path.**
- `claudeConfigStore.ts:274-281` silently swallows JSON parse errors (sets `parsedSettings = null`, does NOT set `scopeData.error`).
- The `errorBanner` in `ClaudeSettingsPanel.tsx:151-163` only renders when `initError` (from `getRoots()` failure) OR `scopeData.error` (from IPC-level `readText` rejection in `loadScope`) is truthy.
- Phase 5 Builder must use an IPC `readText` rejection (not a malformed-JSON fake-fs entry) as the AC-028 test trigger.
- ADR D10 addendum + CONS-23 are routed to Architect to document this before Phase 5.

**opQueue singleton — module-level, not reset by beforeEach:**
- `claudeConfigStore.ts:138` `let opQueue: Promise<void> = Promise.resolve()` is shared across all tests in a Vitest worker.
- Phase 0.5 correctly bypassed `init()` via `useClaudeConfigStore.setState()` for all 5 settings-fixture captures.
- Phase 5 Builder MUST use the same `setState()` bypass for test setup, not `init()` directly. If `init()` is needed, reset `_initialized: false` first.

**`settings-empty-state.json` truncation artifacts:**
- The DOM serializer produced `"tag": "..."` sentinel nodes at depth in the fixture (approximately 12 locations).
- These are symmetric (same serializer used in both pre/post phases) so equality comparison still works.
- Phase 5 must use the same depth limit in the serializer; do not upgrade/change the serializer between Phase 0.5 capture and Phase 5 assert.

**Fixtures are in working tree but not committed (HIGH finding):**
- `tests/` directory is entirely untracked. Fixture files exist but are vulnerable to `git clean -fd`, reclone, branch switch.
- ADR D9 requires "outputs are committed." This is a mandatory Builder follow-up before Phase 1 opens.
- The full `tests/` directory (setup.ts, mocks/, baseline/, example.test.tsx) needs to be committed.

**landing-computed-style.json: token-property mapping notes for Phase 2:**
- `headline-line2` captures `--lp-text-xl` (font-size) instead of a `font-style` token (none exists for italic — it's a literal CSS value).
- `operative-card` captures `--lp-accent-red`, `--lp-ink-soft`, `--lp-surface-cream-soft` (card top rule color, text, card background).
- Phase 2 assert test must map `--lp-X` → `--X` per ADR D6 rename map and compare the same token values. The assertion is NOT "resolved `background-color` RGB equals X" — it's "token `--surface-cream` value equals fixture's `--lp-surface-cream` value."

**Fixture format — `settings-invalid-json-alert.txt` includes "Reload" suffix:**
- `textContent` of the errorBanner div captures the Reload button's text. Phase 5 must either compare the full string (including "Reload") or use `toContain` for just the error message portion.
- The `"Reload"` suffix is documented in the Build Summary; don't treat it as a bug.

---

## From design-migration-cream-panels run (Phase 1, 2026-05-06)

Phase 1 (Introduce content tokens — additive only) passed Reviewer on Attempt 2 with 0 BLOCKING, 0 HIGH, 1 SUGGESTION, 0 NIT.

**Phase 1 specific patterns established:**

**ADR D7 arithmetic errors — LOAD-BEARING:**
- ADR D7's original luminance arithmetic for `--border-panel-strong-color` is wrong: border luminance overstated (0.2825 vs. actual 0.2660), cream luminance understated (0.8130 vs. actual 0.8250). The original ADR-selected value `#9c8c5c` computes 2.769:1 (not 3.07:1 as claimed) — below AC-007's 3.0:1 floor.
- Corrected value committed in Phase 1 Attempt 2: `#8a7a4a` (RGB 138,122,74) — all three agents computed ≈3.52–3.53:1 independently.
- Architect Acknowledgement Round 5 (D7 addendum correcting value + arithmetic) is recommended before Phase 2 opens — see verdict Item 2 for proposed addendum text.

**WCAG cross-check discipline for this run:**
- For AC-007 and any future WCAG assertions: do NOT trust ADR arithmetic. The D7 error was significant (0.3 ratio units off). Always recompute from hex values.
- Correct cream luminance: L(`#f1ead8`) ≈ 0.8249. Use this as the reference for all future contrast checks against `--surface-cream`.
- Correct border luminance: L(`#8a7a4a`) ≈ 0.1983. Contrast vs. cream: ≈3.52:1.

**Phase 1 confirmed correct patterns (fast-scan for Phase 2+):**
- `tokens.css` phase-1 structure: `:root {}` contains exactly two banner comments — `/* === CHROME TOKENS === */` at line 2 and `/* === CONTENT TOKENS === */` at line 100. Both are single occurrences. AC-003 greps for these exact strings.
- `--font-mono` is now JetBrains-first (line 42). "Fira Code" removed. This is intentional per D6 migration thesis.
- All four globals (overflow:hidden, body styles, ::selection, :focus-visible) preserved at lines 176-225 with `--accent-primary` references still intact (Phase 3 flips them to `--accent-red`).
- CONS-13: zero `--lp-*` CSS variable definitions in `tokens.css`. Comments containing "lp" notation are fine.
- `tokens-landing.css` is NOT deleted in Phase 1 (Phase 2 deletes it). Any Phase 2+ Builder who deletes it in an earlier phase has introduced a scope violation.
- Phase 1 only file: `src/styles/tokens.css` (modified). Zero other files.

**`--text-xxs` placement quirk:**
- `--text-xxs: 10px` is in the content tokens section (line 128) with a comment that says "chrome labels (header bar, status bar)." This is mildly confusing — a Phase 4 Builder looking for a 10px tier in chrome tokens won't find it there. Flagged as SUGGESTION in Phase 1 verdict; still unresolved. Watch for Phase 4 Builder confusion.

**Judgment counter state entering Phase 2:**
- Phase 1 closed with 1/2 judgment failures used (1 QA failure, 0 Reviewer failures). Phase 2 starts at 0/2.

---

## From design-migration-cream-panels run (Phase 2, 2026-05-06)

Phase 2 (Atomic rename — landing flips to unified tokens) passed Reviewer on Attempt 1 with 0 BLOCKING, 0 HIGH, 1 SUGGESTION, 0 NIT.

**Phase 2 confirmed correct patterns (fast-scan for Phases 3-5):**

- `:global(.landing-root)` in `LandingPage.module.css` correctly carries scroll-container styles (position:absolute; inset:0; overflow-y:auto; overflow-x:hidden; background:var(--surface-cream)) after deletion of tokens-landing.css. CONS-14 preserved — class string remains plain "landing-root" in LandingPage.tsx:45.
- `@font-face` blocks (4 total: EB Garamond regular+italic, JetBrains Mono regular+medium) now live in `tokens.css` above `:root` at lines 1-37. If any Phase 3-5 code adds @font-face elsewhere, that is BLOCKING.
- All 31 D6 token renames confirmed clean. Special cases correctly applied: `--lp-text-md` → `--text-display-md` (NOT `--text-md`), `--lp-text-base` → `--text-body-lg` (NOT `--text-base`), `--lp-leading-tight` → `--leading-display-tight` (NOT `--leading-tight`), `--lp-surface-dark` → `--feed-bg-dark`, `--lp-text-xl` → `--text-display-xl`, `--lp-text-lg` → `--text-display-lg`.
- `--lp-leading-normal: 1.45` intentionally resolved to `--leading-normal: 1.5` (existing chrome value retained). This is documented architectural variance, not a bug. The value 1.5 is the unified normal leading.
- The AC-045 test strategy is D6_KEY_MAP translation: fixture uses `--lp-*` keys (immutable, ADR D9); test maps to new names, injects via `setProperty`, reads back with `getPropertyValue`. This is the correct CONS-21 Direction 1 pattern.
- `tests/landing-regression.test.tsx` runs as part of the full suite from Phase 2 onwards. Every subsequent phase's exit criteria must include `npm run test:run` with this file passing.
- 67 tests total (2 test files): `tests/example.test.tsx` (bootstrap, Phase 0) + `tests/landing-regression.test.tsx` (Phase 2). Phase 5 will add `tests/settings-regression.test.tsx` for a larger total.
- `--accent-primary`, `--accent-primary-hover`, `--accent-primary-bg` remain at tokens.css lines 62-64 — untouched through Phase 2. Phase 3 flips `--accent-primary` in `:focus-visible`; Phase 4 removes all `--accent-primary*` from settings CSS.
- `::selection { background: var(--accent-primary-bg) }` and `:focus-visible { outline: 2px solid var(--accent-primary) }` remain unchanged after Phase 2 — both flip in Phase 3 together (CTO R2 watching concern 4 — both must flip in the same Phase 3 commit).

**Judgment counter state entering Phase 3:**
- Phase 2 closed with 0/2 judgment failures. Phase 3 starts at 0/2 (fresh judgment budget for each phase).

**SUGGESTION note from Phase 2:**
- Rename mapping tables with 10+ entries and special cases should be cross-referenced (one line) from the Build Summary to the exploration note §5, rather than reproduced in full. The ADR is always the canonical source; the Build Summary cross-reference saves future readers a directory-hop.

---

## From design-migration-cream-panels run (Phase 3, 2026-05-06)

Phase 3 (Dev-switch button re-themed) passed Reviewer on Attempt 1 with 0 BLOCKING, 0 HIGH, 1 SUGGESTION, 2 NIT.

**Phase 3 confirmed correct patterns (fast-scan for Phases 4-5):**

- App.tsx uses `import styles from "./App.module.css"` + `className={styles.devSwitch}` on the dev-switch button. Any return to inline `style=` with hex literals is BLOCKING (AC-014).
- `import.meta.env.DEV` gate is the correct production-elimination pattern for dev-only UI. Verified intact through Phase 3.
- `--accent-primary` definitions remain at tokens.css lines 62-64 through Phase 3. Phase 4 removes them after settings CSS migrates. If Phase 4 Builder's diff does NOT remove these definitions, that is a completion-criteria failure.
- `::selection { background: var(--accent-red-bg) }` and `:focus-visible { outline: 2px solid var(--accent-red) }` are now set at tokens.css lines 254-265. Phase 4 must NOT revert these to `--accent-primary*`.
- Dev-switch token treatment is locked: `background: var(--ink); color: var(--surface-cream); border: 1px solid var(--surface-cream)`. Phase 4+ must not change App.module.css color values.

**WCAG computation accuracy — LOAD-BEARING WARNING:**
- Builder's Build Summary WCAG intermediate linearization values are systematically inflated (~50% per channel) relative to the correct WCAG 2.x formula.
- Root cause: Build Summary used an approximated formula; test code at line 59 correctly implements `Math.pow((s + 0.055) / 1.055, 2.4)`.
- Correct luminance values for recurring tokens:
  - L(--surface-cream #f1ead8) ≈ 0.82504
  - L(--ink #1d1c19) ≈ 0.01162
  - L(--bg-base #0a0c10) ≈ 0.003649
  - Cream vs ink contrast: ≈14.20:1 (Builder's ~13.07:1 is an underestimate)
  - Cream border vs bg-base: ≈16.31:1 (Builder's ~15.69:1 is an underestimate)
- When verifying WCAG claims in Build Summaries for Phases 4-5, do NOT trust intermediate linearization values; recompute or verify the test code uses the 2.4 exponent.
- WCAG test helper comment at dev-switch.test.tsx:26-27,54 says "2.2 gamma approximation" — this is WRONG (code uses 2.4). Phase 5 Builder should not copy this comment.

**AC-013 disjunction — governing contract:**
- AC-013 §5 says "and" (conjunctive). The operative contract is "or" (disjunction) per ADR D14, PRD §8.12, PRD §9 line 756, PM Round 2 sign-off.
- Architect Acknowledgement Round 6 recommended to correct §5 wording. Until that lands, Phase 5 must implement AC-013 tests using the disjunction binding.
- Clause (a) — ink-background vs bg-base chrome: ≈1.15:1 — intentionally fails. Expected per ADR D14.
- Clause (b) — cream-border vs bg-base chrome: ≈16.31:1 — passes. This is the operative satisfaction.

**Phase 3 boundary state entering Phase 4:**
- Dev-switch: ink background, cream text, cream border. Locked.
- Focus rings: `--accent-red` (#b8362b) globally. Settings panel will show red focus rings until Phase 4 migrates settings CSS.
- Selection highlight: `--accent-red-bg` globally.
- `--accent-primary*` definitions still present — Phase 4 removes after settings CSS migrated.
- All prior phase tokens/fixtures/infrastructure: unchanged and clean.

**Judgment counter state entering Phase 4:**
- Phase 3 closed with 0/2 judgment failures. Phase 4 starts at 0/2 (fresh budget).

---

## From design-migration-cream-panels run (Phase 4, 2026-05-07)

Phase 4 (Settings panel re-theme) passed Reviewer on Attempt 2 (QA Attempt 1 failed layout regression; QA Attempt 2 passed). 0 BLOCKING, 1 HIGH, 1 SUGGESTION, 1 NIT findings.

**Phase 4 confirmed correct patterns (fast-scan for Phase 5):**

- `ClaudeSettingsPanel.module.css` is now 610 lines (cream surface migration complete). The four new classes are: `.chip` (line 555), `.chipSelected` (line 572), `.chipGroup` (line 587), `.hookEmptyState` (line 601).
- `.shell { height: 100%; }` at line 9 is the Attempt-2 layout fix — this is load-bearing for viewport fill. If Phase 5 ever needs to adjust `.shell`, verify `height: 100%` is preserved.
- `railItemActive`/`railItem` classes are intentionally preserved in the CSS module — they serve the left rail nav AND MatcherInput buttons (per ADR D13 comment block at line 101-103). These are NOT the lifecycle chip classes.
- `--accent-primary*` definitions are deleted from tokens.css (lines 62-64 pre-migration; now a comment). Phase 5 must NOT re-introduce any `var(--accent-primary*)` reference.

**HIGH finding from Phase 4 (for Phase 5 fast-scan):**
- `ScaffoldBanner.tsx:47` has `className={styles.errorBanner}` with inline `style={{ background: "var(--bg-elevated)" }}` that defeats the Phase 4 `.errorBanner` cream treatment. Phase 5 should fix this: remove the `background`/`color` inline overrides and let the CSS class drive the surface. This is a cleanup item that escaped Phase 4's `--accent-primary` grep scope.
- Audit pattern for Phase 5: when a CSS class is migrated, grep for ALL `className={styles.classname}` usages across the codebase to check for inline style overrides.

**Residual chrome tokens in unmodified .tsx files (SUGGESTION for Phase 5):**
- `PermissionsTab.tsx:294-303` — `PermRuleRow` inline style uses `--bg-elevated` (#1a1e26). Inline content, most visually inconsistent of the residuals.
- `ClaudeMdTab.tsx:157-158`, `AgentsTab.tsx:438-439`, `SkillsTab.tsx:433-434` — floating dropdown popup menus use `--bg-elevated`. Position-absolute, dark popup over cream panel. Defensible UX but inconsistent with migration thesis.
- These were all pre-Phase-4 and not in Phase 4's scope (only `--accent-primary` was targetable per PRD §9).

**Phase 4 boundary state entering Phase 5:**
- `--accent-primary*` definitions: DELETED from tokens.css. No live references anywhere in src/.
- `.errorBanner` CSS class: fully cream-migrated (AC-043, AC-044 satisfied). ScaffoldBanner.tsx defeats it with inline override — Phase 5 cleanup.
- `.chip`/`.chipSelected`/`.chipGroup`/`.hookEmptyState`: new classes in place, no regression on rail nav.
- `App.tsx`/`App.module.css`: untouched through Phase 4. Dev-switch tokens locked.
- 87/87 tests pass. Phase 5 adds settings-regression.test.tsx, dev-switch.test.tsx, globals.test.tsx.

**Judgment counter state entering Phase 5:**
- Phase 4 closed with 1/2 judgment failures (QA Attempt 1 layout fail only). Phase 5 starts at 0/2 (fresh budget).
