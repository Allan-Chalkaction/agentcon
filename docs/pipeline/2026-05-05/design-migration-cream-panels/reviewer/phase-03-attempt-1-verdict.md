## Reviewer Verdict: PASS

**Phase:** 3 — Dev-switch button re-themed (App.tsx)
**Attempt:** 1
**Date:** 2026-05-06
**Judgment failure counter (Phase 3):** 0/2 — no failures consumed

---

### Findings Summary

- BLOCKING: 0
- HIGH: 0
- SUGGESTION: 1 (AC-013 wording — routes to Architect, not Builder)
- NIT: 2 (test comment accuracy; CSS comment ratios)

---

### Convention Compliance

All conventions confirmed:
- No `--lp-*` references introduced (grep returns zero).
- `import.meta.env.DEV` structural gate preserved unchanged.
- `readInitialSurface()` still defaults to `"settings"`.
- No `@font-face` blocks added in Phase 3.
- CSS Module import pattern (`import styles from "./App.module.css"`) correct.
- `default export` for App component preserved (this project's pattern; only component files use named exports — App.tsx is the entry-point component, its export-default is correct).

---

### Convention Compliance — Phase 3 Rules

Per Builder's exploration note anti-patterns (cross-checked against delivered code):
- No hex literal left in `App.tsx` (AC-014 bound). Confirmed: diff shows all 7 original inline hex literals removed.
- `--accent-red` NOT used for dev-switch border — `--surface-cream` used. Correct per D14.
- `import.meta.env.DEV` gate unchanged — visual change only. Confirmed.
- `--accent-primary` definitions NOT deleted in Phase 3 — still present at tokens.css lines 62-64. Correct.
- Settings panel files: untouched. Confirmed.
- Phase 0 test infra: untouched. Confirmed.
- Phase 0.5 fixtures: untouched. Confirmed.
- `claudeConfigStore.ts`: untouched (not in diff).

---

### Builder Exploration Consistency

Exploration claimed: 3 source files + 1 test file. Delivered: exactly `src/App.tsx` (modified), `src/App.module.css` (new), `src/styles/tokens.css` (modified), `tests/dev-switch.test.tsx` (new). Exact match.

Token treatment: exploration §5 prescribed `background: var(--ink); color: var(--surface-cream); border: 1px solid var(--surface-cream)`. Delivered App.module.css is character-for-character consistent with this prescription.

AC-013 disjunction: exploration §5 correctly derived clause (a) failing and clause (b) satisfying. Test implements identical logic.

`--accent-primary` retention: exploration §7 enumerated 11 consumer sites in settings. Phase 3 only redirected `::selection` and `:focus-visible` globals. All other consumers preserved. Correct.

No deviations found between exploration and delivered work.

---

### Correctness

All logic correct.

- `type="button"` attribute retained on the button element — prevents accidental form submission in any future wrapping context. Good hygiene.
- `opacity: 0.85` preserved from original — visual continuity with prior behavior. Correct.
- `border-radius: 3px` preserved. Correct.
- The `onClick` toggle logic (`(s) => (s === "settings" ? "landing" : "settings")`) unchanged. Correct.

Edge cases: the button only renders in `import.meta.env.DEV` mode (dead-code eliminated in production by Vite). No runtime logic changed.

---

### Correctness — Verification Item 1: Independent WCAG Recomputation (Third Witness)

This is an independent computation from scratch using the WCAG 2.x formula. My computation produces different intermediate values than Builder's/QA's — the discrepancy is traced and explained; all AC floors pass regardless.

**Formula:** For c ∈ {0..255}: s = c/255. If s ≤ 0.04045: c_lin = s/12.92. Else: c_lin = ((s + 0.055)/1.055)^2.4.
Luminance L = 0.2126×r_lin + 0.7152×g_lin + 0.0722×b_lin.
Contrast = (L_lighter + 0.05) / (L_darker + 0.05).

**Color: `--surface-cream` #f1ead8 = RGB(241, 234, 216)**
- r: 241/255=0.94510; ((0.94510+0.055)/1.055)^2.4 = (0.94797)^2.4 ≈ 0.87993
- g: 234/255=0.91765; ((0.91765+0.055)/1.055)^2.4 = (0.92194)^2.4 ≈ 0.82270
- b: 216/255=0.84706; ((0.84706+0.055)/1.055)^2.4 = (0.85527)^2.4 ≈ 0.68717
- L_cream = 0.2126×0.87993 + 0.7152×0.82270 + 0.0722×0.68717 = 0.18705 + 0.58838 + 0.04961 = **0.82504**

**Color: `--ink` #1d1c19 = RGB(29, 28, 25)**
- r: 29/255=0.11373; ((0.11373+0.055)/1.055)^2.4 = (0.15994)^2.4 ≈ 0.01229
- g: 28/255=0.10980; ((0.10980+0.055)/1.055)^2.4 = (0.15621)^2.4 ≈ 0.01161
- b: 25/255=0.09804; ((0.09804+0.055)/1.055)^2.4 = (0.14507)^2.4 ≈ 0.00972
- L_ink = 0.2126×0.01229 + 0.7152×0.01161 + 0.0722×0.00972 = 0.002613 + 0.008303 + 0.000702 = **0.011618**

**Ratio 1 — cream text on ink background (AC-011 / AC-012):**
- (0.82504 + 0.05) / (0.011618 + 0.05) = 0.87504 / 0.061618 = **14.20:1**
- AC-011 floor ≥4.5:1: margin +9.70. PASS.
- AC-012 floor ≥3.0:1: margin +11.20. PASS.

**Color: `--bg-base` #0a0c10 = RGB(10, 12, 16)** (dark chrome background token for settings surface)
- r: 10/255=0.03922; 0.03922 ≤ 0.04045 → r_lin = 0.03922/12.92 = 0.003035
- g: 12/255=0.04706; ((0.04706+0.055)/1.055)^2.4 = (0.09674)^2.4 ≈ 0.003678
- b: 16/255=0.06275; ((0.06275+0.055)/1.055)^2.4 = (0.11161)^2.4 ≈ 0.005186
- L_base = 0.2126×0.003035 + 0.7152×0.003678 + 0.0722×0.005186 = 0.000645 + 0.002630 + 0.000374 = **0.003649**

Token used for dark chrome background: `--bg-base: #0a0c10` — confirmed at `tokens.css` line 44 (`/* app background */`). This is the outer canvas token. Correct.

**Ratio 2 — cream border on dark chrome (AC-013 clause b):**
- (0.82504 + 0.05) / (0.003649 + 0.05) = 0.87504 / 0.053649 = **16.31:1**
- AC-013 clause (b) floor ≥3.0:1: margin +13.31. PASS.

**Comparison with Builder (13.07:1) and QA (13.08:1) for ratio 1:**
My value of 14.20:1 is higher (larger contrast gap). The discrepancy traces to L_ink: Builder's L_ink ≈ 0.01691 vs my L_ink ≈ 0.01162. Builder's intermediate linearization values are inflated by approximately 50% for all three channels of --ink — consistent with using an informal or approximated computation rather than the precise WCAG 2.x formula. The test code at `tests/dev-switch.test.tsx:59` uses the correct formula `Math.pow((s + 0.055) / 1.055, 2.4)`. Since the tests pass, the actual runtime ratio is consistent with my computation (≈14.20:1), not Builder's summary approximation.

All AC floors pass with large margin regardless of which numeric source is used (13.07:1 or 14.20:1 — both clear 4.5:1 by a wide margin).

**Comparison with Builder (15.69:1) and QA (15.70:1) for ratio 2:**
My value of 16.31:1 is higher. Same root cause — Builder's L_base (≈0.005765) is inflated vs my L_base (≈0.003649). PASS regardless.

**Conclusion:** The third witness confirms both AC floors pass comfortably. The specific ratio values diverge from Builder's/QA's due to Build Summary arithmetic using an approximated linearization that doesn't match the `2.4` exponent in the actual test code. This is a documentation quality issue, not a correctness issue.

---

### Correctness — Verification Item 2: AC-013 Disjunction Sanity-Check

**AC-013 verbatim (PRD §5, line 127):**
> "Given the app is running in dev mode and the settings surface is active, when the dev-switch button is rendered (it remains visible per current behavior), then contrast between its `color` and `background-color` is ≥4.5:1, **and** contrast between its `background-color` and the settings outer chrome background (`--bg-base` or renamed equivalent) is ≥3.0:1."

AC-013 §5 text says **"and"** (conjunctive). Both clauses must pass on a literal reading.

**PRD §8.12 verbatim (line 494):**
> "| Dev-switch unreadable | ... | AC-010, AC-011, AC-012, AC-013 (disjunction-binding — see ADR D14), AC-014 |"

§8.12 uses "disjunction-binding" and defers to ADR D14.

**ADR D14 verbatim (relevant paragraph):**
> "Architect's recommendation in §11 sign-off: PM clarifies AC-013's literal in next consensus round to 'the button is visually discernible from its surrounding background — assertable as either (a) `background-color` contrasts with surround at ≥3:1, OR (b) the button has a `border-color` distinct from `background-color` whose contrast with the surround is ≥3:1.'"
> "For Phase 3 Builder execution, the dev-switch test asserts (b) and the test file comment cross-references this ADR D14 paragraph."

**Governance chain:**
- PRD §9 line 756 (implementation notes): "AC-013 binding to the disjunction documented in D14 — Builder writes the test to assert (a) `bg vs surround ≥3:1` OR (b) `border vs surround ≥3:1`."
- PM sign-off §11 (line 1430): "PM accepts the disjunction binding for Phase 3 execution; I'm not narrowing AC-013 to literal-`background-color`-only."

**Outcome: Path (b).** AC-013 §5 says "and"; §8.12/D14/§9/PM acceptance all say "or" (disjunction). The discrepancy is real and well-documented in the governance chain. The operative contract for Phase 3 is the disjunction, accepted at the highest approval tier (PM sign-off).

**Decision on Architect Acknowledgement Round 6:**

Recommend an Architect Acknowledgement Round 6 to correct AC-013's §5 wording. Rationale: a Phase 5 Builder reading §5 verbatim would see "and," infer both clauses must independently pass, and flag clause (a)'s intentional 1.20:1 ratio as a failure. The §8.12 pointer ("see ADR D14") requires two hops and is not prominent in the AC text itself. The discrepancy is load-bearing for Phase 5's test interpretation.

**Recommended addendum text for Architect Acknowledgement Round 6:**

> **AC-013 Wording Correction (D14 disjunction lock)**
>
> AC-013's §5 text uses a conjunctive "and" for the background-vs-surround clause ("contrast between its `background-color` and the settings outer chrome background ... is ≥3.0:1"). This conflicts with the operative disjunction established in ADR D14, PRD §8.12, PRD §9 line 756, and PM Round 2 acceptance.
>
> Corrected AC-013 §5 wording (underline marks changed text):
>
> "Given the app is running in dev mode and the settings surface is active, when the dev-switch button is rendered (it remains visible per current behavior), then contrast between its `color` and `background-color` is ≥4.5:1, **and** the button is visually discernible from the settings outer chrome background (`--bg-base` or renamed equivalent) — assertable as (a) `background-color` contrasts ≥3.0:1 with the surround, OR (b) `border-color` contrasts ≥3.0:1 with the surround."
>
> This correction is backward-compatible with the Phase 3 implementation (clause (b) satisfied at 16.31:1) and forward-compatible with Phase 5 testing (test asserts the disjunction per ADR D14 and PRD §9).
>
> This does NOT require re-opening Phase 3 or modifying any code or test. Wording change only.

This is a recommendation for Architect, not a Builder fault. Phase 3 is not failed over this.

---

### Correctness — Verification Item 3: Independent AC Walk

**AC-010 — Token-bound, no inline hex:**
- `grep -E "#[0-9a-fA-F]{3,8}" src/App.tsx src/App.module.css` returns only comment lines in App.module.css (contrast ratios documented as comments, not CSS declarations). Zero hex values in property declarations in either file.
- App.tsx uses `className={styles.devSwitch}`. No `style=` prop on the button.
- App.module.css uses `var(--ink)`, `var(--surface-cream)`, `var(--font-mono)` for all color/font properties. PASS.

**AC-011 — Text contrast ≥4.5:1:**
Confirmed by Verification Item 1: 14.20:1 ≥ 4.5:1. PASS.

**AC-012 — Background contrast vs cream ≥3.0:1:**
Same pair (--ink vs --surface-cream): 14.20:1 ≥ 3.0:1. PASS.

**AC-013 — Disjunction per D14:**
Clause (a): L_ink (0.01162) vs L_base (0.003649): (0.011618+0.05)/(0.003649+0.05) = 0.061618/0.053649 = 1.149:1 — does NOT satisfy ≥3.0:1. Expected per ADR D14.
Clause (b): L_cream (0.82504) vs L_base (0.003649): 16.31:1 — satisfies ≥3.0:1. Per D14 disjunction, clause (b) is sufficient. PASS.
Color vs background (AC-013 first clause): 14.20:1 ≥ 4.5:1. PASS.

**AC-014 — No inline hex in App.tsx:**
Diff confirms all 7 prior inline hex literals (`#1a1c19`, `#d8d2bf`, `#4a4742`, `#1a1c19` bg, etc.) removed. No `style=` prop on the button element. PASS.

---

### Correctness — Verification Item 4: Visual Fidelity (Static Walk)

Cannot render visually (read-only agent). Static walk performed.

App.module.css tokens resolve as:
- `--ink: #1d1c19` (near-black with warm undertone)
- `--surface-cream: #f1ead8` (warm cream)

Rendered appearance on landing (cream surround): dark ink button with cream text and hairline cream border. Against the surrounding cream (#f1ead8), the ink background (#1d1c19) contrasts at 14.20:1 — the button reads as a high-contrast dark rectangle. The cream border provides a secondary separation signal (also at 14.20:1 vs surround, since border equals surround color — but the border rides between ink background and cream surround, creating a visible edge).

Rendered appearance on settings (dark chrome surround, --bg-base #0a0c10): dark ink button sits nearly flush with the chrome (1.15:1 background contrast), but the cream border (#f1ead8) at 16.31:1 against #0a0c10 makes the button clearly outlined. The cream text is readable at 14.20:1.

This is distinctly NOT blue/CLI-default style. Prior treatment picked up the global `--accent-primary` (#5b8def, blue) for focus rings, and used hardcoded intermediate-gray palette (`#1a1c19`/`#d8d2bf`/`#4a4742`). The new treatment is explicitly cream-palette, consistent with the dossier aesthetic.

Aesthetic intent: confirmed. The button functions as a cream-outlined dark island in both surface contexts.

---

### Cross-Phase Regression — Verification Item 5

All checks PASS:

| Check | Token/File | Location | Status |
|---|---|---|---|
| --border-panel-strong-color Phase 1 fix | `#8a7a4a` | tokens.css line 181 | PASS |
| overflow: hidden | `overflow: hidden` | tokens.css line 220 | PASS |
| body background | `background: var(--bg-base)` | tokens.css line 224 | PASS |
| ::selection flipped | `var(--accent-red-bg)` | tokens.css line 255 | PASS (Phase 3 owns this flip) |
| :focus-visible flipped | `var(--accent-red)` | tokens.css line 263 | PASS (Phase 3 owns this flip) |
| --lp- grep | zero matches | `grep -rn "--lp-" src/` | PASS |
| Settings panel | no changes | git diff --stat src/panels/claude-settings/ | PASS (empty diff) |
| Landing panel | no changes | git diff --stat src/panels/landing/ | PASS (empty diff) |
| Phase 0 test infra | no changes | git diff tests/setup.ts mocks/ vitest.config.ts tsconfig.test.json | PASS (empty diff) |
| Phase 0.5 fixtures | no changes | git diff tests/baseline/ | PASS (empty diff) |
| --accent-primary definitions | still present at lines 62-64 | tokens.css | PASS (correct; Phase 4 removes) |

---

### D17 Compliance — Verification Item 6

The test file `tests/dev-switch.test.tsx` uses NO DOM rendering and NO `getComputedStyle` calls whatsoever for its primary assertions. All 20 tests operate on one of two patterns:

1. **File-read + regex** (AC-010, AC-014, global rule flip, AC-001 regression tests): `fs.readFileSync` + string matching. No DOM. D17 not applicable (there is no jsdom call); pattern is safe.

2. **Pure WCAG math** (AC-011, AC-012, AC-013): hardcoded token hex constants from tokens.css, fed into `contrastRatio()` — no jsdom, no `getComputedStyle`, no `getPropertyValue`. These tests do not depend on jsdom's CSS variable resolution at all. D17 is satisfied because the constraint is "do not use resolved-property reads (`getComputedStyle(el).color` etc.) as primary assertions" — and no such calls exist.

The preamble explicitly states: "Direct resolved-property reads (getComputedStyle(el).backgroundColor etc.) are NOT used as primary assertion mechanisms for token-driven values."

Three spot-checked tests:
- Line 92 ("App.tsx contains no hex color literals in any style prop"): fs.readFileSync + regex. No DOM. PASS.
- Line 157 ("computes contrast ≥4.5:1 for cream text on ink background"): `contrastRatio(TOKEN_SURFACE_CREAM, TOKEN_INK)` — pure math. No DOM. PASS.
- Line 193 ("clause (b): border color vs settings chrome ≥3.0:1"): `contrastRatio(TOKEN_SURFACE_CREAM, TOKEN_BG_BASE)` — pure math. No DOM. PASS.

CONS-21 / ADR D17 fully complied with.

---

### D17 Compliance — Note on Test Strategy vs D17 Scope

ADR D17 was written primarily for Phases 4 and 5 (where components render and token-driven CSS needs assertions). Phase 3's test file doesn't render components at all — it's a source-inspection + math test. This is a valid and stricter compliance posture: by not relying on jsdom at all, it avoids the Direction-2 pitfall entirely.

---

### Performance

No red flags. Changes are CSS-only + JSX attribute swap. No component logic changed. No new dependencies. Bundle impact: App.module.css adds ~1KB of CSS (one class, ~12 declarations). Negligible.

---

### Security Smells

None. No user input, no auth, no network, no new APIs. Inline hex literals removed (slightly reduces fingerprinting of internal color palette in source, though that's minor). No hardcoded secrets.

---

### UI Spec Compliance

Dev-switch button matches §8.12 locked treatment exactly:
- `background: var(--ink)` ✓
- `color: var(--surface-cream)` ✓
- `border: 1px solid var(--surface-cream)` ✓
- No inline hex ✓
- Token-driven typography (`var(--font-mono)`) ✓

---

### Builder Exploration Consistency — Verification Item 7

File list: exploration §2 said "3 source files + 1 test file." Delivered exactly 3 modified/new source files + 1 new test file. Match.

`--accent-primary` retention strategy: exploration §7 explicitly enumerated all 11 consumer sites and confirmed the Phase 3 boundary retains the token definitions. Delivered code retains them. Match.

AC-013 disjunction reasoning: exploration §5 computed clause (a) = 1.18:1 (fails) and clause (b) ≈17.0:1 (passes). Test implements identical logic. Match.

Exploration anti-patterns list (§9): all anti-patterns avoided in delivery — no hex in App.tsx, no `--accent-red` for border, `import.meta.env.DEV` gate preserved, `--accent-primary` definitions intact, no settings/landing/Phase-0/Phase-0.5 files touched.

No deviations.

---

### Single-Commit Discipline — Verification Item 8

Phase 3 is NOT subject to the single-commit / squash discipline. The single-commit requirement applies only to Phase 2 and Phase 4 (PRD §9 lines 718 and 803 respectively; CONS-17 explicitly lists "Phase 2, Phase 4"). Phase 3 has no such completion criterion.

Change-set coherence check: the working tree modifications are `src/App.tsx` (modified), `src/styles/tokens.css` (modified), `src/App.module.css` (new), `tests/dev-switch.test.tsx` (new). App.tsx imports App.module.css before referencing `styles.devSwitch` — the import would typecheck only if the CSS module exists, which it does. The tokens.css changes are independent (they affect globals, not the CSS module). No half-applied work, no leaked debug code, no stray references to old token names in code (comments reference ADR D14 / AC numbers correctly).

The change-set is coherent and would stage cleanly as one commit when ready.

---

### Non-Blocking Findings

#### NIT 1: Test file comment says "2.2 gamma approximation" — code uses correct 2.4 exponent

**File:** `tests/dev-switch.test.tsx:26-27` (file header) and `:54` (JSDoc)
**Category:** Documentation accuracy
**Issue:** Two locations claim "2.2 gamma approximation":
- Line 26-27: `* where c_lin = (c/255)^2.2 for sRGB gamut values.`
- Line 54 JSDoc: `* Uses the 2.2 gamma approximation for component linearization.`

The implementation at line 59 correctly uses: `Math.pow((s + 0.055) / 1.055, 2.4)` — the WCAG 2.x IEC sRGB linearization with the piecewise linear segment and 2.4 exponent. This is NOT a "2.2 gamma approximation"; the 2.2 approximation would be just `c^2.2`. The comment also omits the `+0.055/1.055` correction and the 0.04045 threshold — making it wrong in multiple ways.

**Why worth fixing:** A future developer reading the comment, rather than the implementation, could transcribe the 2.2 formula for their own code and get systematically wrong luminance values. These errors are small per channel but compound across multiple contrast checks.

**Recommended fix:** Replace lines 26-27 with:
```
 * where c_lin = s/12.92 (if s ≤ 0.04045) else ((s + 0.055)/1.055)^2.4 for sRGB values.
```
Replace line 54 JSDoc with:
```
 * Uses the WCAG 2.x piecewise sRGB linearization (IEC 61966-2-1; 2.4 exponent).
```

Note: this is the same inaccuracy QA flagged. QA correctly characterized it as "inaccurate comment, correct math." Confirmed.

#### NIT 2: App.module.css comment block shows Build Summary approximations, not verified WCAG values

**File:** `src/App.module.css:13-15`
**Category:** Documentation accuracy
**Issue:** The comment block shows contrast ratios as "≈14.37:1" and "≈17.0:1". My third-witness computation gives 14.20:1 and 16.31:1 respectively. These are based on Build Summary's informal linearization (consistent with using gamma ≈2.05 rather than the correct 2.4). The comment values are inflated by ~1–2%.

The comment is purely informational (not a binding assertion). Both sets of values pass the AC floors by wide margins.

**Recommended fix:** Update the comment to use the corrected values or cite the test code as the authoritative source. Low priority.

#### SUGGESTION: AC-013 §5 wording should be corrected in Architect Acknowledgement Round 6

**Document:** PRD §5 line 127
**Category:** Planning document consistency
**Issue:** AC-013 in §5 uses a conjunctive "and" for the background-vs-surround clause, while the operative governance (§8.12, ADR D14, §9, PM Round 2 sign-off) establishes a disjunction ("or"). A Phase 5 Builder reading §5 verbatim could be misled into requiring both clauses to pass — and would find clause (a)'s intentional 1.15:1 ratio non-compliant.

**Disposition:** This is a planning-document concern, not a Builder fault. Phase 3 is not failed. Route to Architect for Acknowledgement Round 6. Recommended addendum text provided in Verification Item 2 section above.

**Why Architect Acknowledgement (not "leave it"):** The §8.12 pointer to D14 requires two hops and is not in-line with the AC text. Phase 5 Builder will read §5 first; the discrepancy is material enough to cause confusion or an incorrect test design. The correction is a one-paragraph wording change; no code or test changes needed.

---

### Phase status

REVIEWER_PASS — no security trigger; phase complete, advance to Phase 4.
