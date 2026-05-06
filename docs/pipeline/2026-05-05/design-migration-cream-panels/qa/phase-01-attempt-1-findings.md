# QA Verdict: FAIL

**Phase:** 1
**Attempt:** 1
**Date:** 2026-05-06

---

## Step 1: Phase Scope Confirmation

Per PRD §9, Phase 1 is titled "Introduce content tokens (additive only)." The PRD §9 Phase 1 entry states:

> **AC covered:** AC-003 (banner labels present in tokens.css). Partially: AC-006, AC-007 (token defined; consumer assertion happens later).
> **Files to touch (1):** `src/styles/tokens.css` (modify — add `=== CHROME TOKENS ===` and `=== CONTENT TOKENS ===` banners; add the new content tokens listed in §8.5; do NOT delete or rename anything).

Confirmed:
- Phase 1 is additive content-token introduction, NOT the atomic `--lp-*` rename.
- AC-001 (`grep -r "\-\-lp-" src/` zero) is NOT in Phase 1's AC list — it is Phase 2.
- AC-002 (`tokens-landing.css` deleted) is NOT in Phase 1's AC list — it is Phase 2.

Builder's interpretation matches the PRD exactly. No scope mismatch.

---

## Step 2: AC Testability Pre-Check

Phase 1 ACs: AC-003 (primary), AC-006 (partial), AC-007 (partial).

- **AC-003:** Given/When/Then form, concrete observable outcome (literal substrings present in file content in order), greppable. Testable. PASS.
- **AC-006 (partial):** Phase 1's obligation is that the token is defined with values in the AC's ranges (width 1.5px–2px, style solid, color pointing to the color token). Inspectable from file content. Testable. PASS.
- **AC-007 (partial):** Phase 1's obligation is that `--border-panel-strong-color` is defined with a value that produces ≥3.0:1 contrast against `--surface-cream` per the WCAG formula. Computable from the committed hex values. Testable. PASS.

No untestable ACs. Pipeline proceeds to verification.

---

## Step 3: Verification — All 7 User-Called-Out Checks

---

### Check 1: AC-003 Comment Band Literals

**Spec:** Both `/* === CHROME TOKENS === */` and `/* === CONTENT TOKENS === */` must exist verbatim, chrome first, content second.

**Evidence:**

```
Line 2:   /* === CHROME TOKENS === */
Line 100: /* === CONTENT TOKENS === */
```

Verified by `grep -n "=== CHROME TOKENS ===" src/styles/tokens.css` returning line 2 and `grep -n "=== CONTENT TOKENS ===" src/styles/tokens.css` returning line 100. Order is correct: chrome (line 2) precedes content (line 100).

**Result: PASS**

---

### Check 2: Full Content Token Set per ADR D7

**Spec:** Every token named in ADR D7's table must be present with a value.

ADR D7 specifies the following new tokens (those in D7's table that Phase 1 introduces):

| Token | Expected Value | Present? |
|---|---|---|
| `--border-panel-strong` | `1.5px solid var(--border-panel-strong-color)` | YES — line 144 |
| `--border-panel-strong-color` | `#9c8c5c` | YES — line 143 |
| `--chip-bg-default` | `var(--surface-cream-soft)` | YES — line 150 |
| `--chip-border-default` | `var(--border-panel-strong-color)` | YES — line 151 |
| `--chip-text-default` | `var(--ink-soft)` | YES — line 152 |
| `--chip-bg-selected` | `var(--ink)` | YES — line 153 |
| `--chip-border-selected` | `var(--ink)` | YES — line 154 |
| `--chip-text-selected` | `var(--surface-cream)` | YES — line 155 |
| `--empty-state-border-color` | `#bfb59a` | YES — line 158 |
| `--alert-bg` | `#f7e8d6` | YES — line 161 |
| `--alert-border` | `var(--border-panel-strong-color)` | YES — line 162 |
| `--alert-text` | `#7a2418` | YES — line 163 |
| `--text-body-lg` | `14px` | YES — line 129 |
| `--text-display-md` | `18px` | YES — line 130 |
| `--text-display-lg` | `28px` | YES — line 131 |
| `--text-display-xl` | `56px` | YES — line 132 |
| `--leading-display-tight` | `1.05` | YES — line 135 |
| `--leading-mono` | `1.5` | YES — line 136 |

All D7 tokens present. No D7 token missing. No Builder additions outside D7's scope were detected that would constitute scope creep — the content token section is exactly D7 plus the D6 rename-map additions (which are also specified by the PRD §8.5).

**Result: PASS (token presence). The AC-007 contrast value is flagged separately in Check 6.**

---

### Check 3: CONS-13 — No `--lp-*` Definitions in `tokens.css`

**Spec:** `grep -n "\-\-lp-" src/styles/tokens.css` must return only comment strings, not CSS variable definitions.

**Evidence:** Running the grep returns 6 lines — all are CSS comments (e.g., `/* recent-transmissions feed band (was --lp-surface-dark) */`). No line takes the form `--lp-xxx: value;` or `var(--lp-xxx)`. Confirmed with explicit checks:
- `grep -n "var(--lp-" src/styles/tokens.css` returns no matches.
- `grep -n "^\s*--lp-" src/styles/tokens.css` returns no matches.

**Result: PASS**

---

### Check 4: Globals Preserved per ADR D11

**Spec:** All four global rules must be unchanged from the pre-Phase-1 committed state.

**Evidence — rule-by-rule comparison:**

1. `html, body, #root { overflow: hidden }`:
   - Prior committed (HEAD): lines 107-113, `overflow: hidden; /* the app is a desktop chrome, not a scrolling document */`
   - Current: lines 176-183, identical rule at same selector, same comment, same value.
   - PASS.

2. `:focus-visible { outline: 2px solid var(--accent-primary); outline-offset: 2px; }`:
   - Prior committed (HEAD): lines 151-154, identical text.
   - Current: lines 222-225, identical text. The `--accent-primary` reference is intentionally preserved in Phase 1 per the exploration note (flip to `--accent-red` happens in Phase 3).
   - PASS.

3. `::selection { background: var(--accent-primary-bg); color: var(--text-primary); }`:
   - Prior committed (HEAD): lines 145-148, identical rule.
   - Current: lines 215-219, identical rule. Flip to `--accent-red-bg` is Phase 3.
   - PASS.

4. `body { background: var(--bg-base); color: var(--text-primary); font-family: var(--font-sans); ... }`:
   - Prior committed (HEAD): lines 114-122, all properties identical.
   - Current: lines 185-193, identical rule block.
   - PASS.

**All four globals: PASS**

---

### Check 5: `--font-mono` Updated to JetBrains-First Stack per ADR D6

**Spec:** ADR D6 mandates the unified `--font-mono` value is `"JetBrains Mono", "SF Mono", Menlo, Monaco, ui-monospace, monospace` (JetBrains-first, without "Fira Code").

**Evidence:**

Prior committed value (HEAD, line 41):
```css
--font-mono: "SF Mono", Menlo, Monaco, "JetBrains Mono", "Fira Code", ui-monospace, monospace;
```

Current value (line 42):
```css
--font-mono: "JetBrains Mono", "SF Mono", Menlo, Monaco, ui-monospace, monospace;
```

JetBrains Mono is now first. "Fira Code" has been removed (correct — the ADR D6 spec does not include it in the unified stack). The stack matches the ADR D6 mandate exactly.

**Result: PASS**

---

### Check 6: `--border-panel-strong` Token Correctness and AC-007 Contrast

**Spec:** Width in 1.5px–2px range, solid style, `#9c8c5c` color, and contrast ≥3.0:1 against `--surface-cream` (#f1ead8).

**Evidence — token structure:**
```css
--border-panel-strong-color: #9c8c5c;
--border-panel-strong: 1.5px solid var(--border-panel-strong-color);
```

- Token name: `--border-panel-strong` (exact, no variant suffix). PASS.
- Width: `1.5px` — within AC-006's 1.5px to 2px range. PASS.
- Style: `solid`. PASS.
- Color: `#9c8c5c` (via `var(--border-panel-strong-color)`).

**Contrast computation (WCAG relative-luminance formula):**

```
#9c8c5c = RGB(156, 140, 92)
  R linear = ((156/255 + 0.055) / 1.055)^2.4 = 0.332452
  G linear = ((140/255 + 0.055) / 1.055)^2.4 = 0.262251
  B linear = ((92/255  + 0.055) / 1.055)^2.4 = 0.107023
  Luminance = 0.2126 * 0.332452 + 0.7152 * 0.262251 + 0.0722 * 0.107023 = 0.2660

#f1ead8 = RGB(241, 234, 216)
  Luminance = 0.8250

Contrast = (0.8250 + 0.05) / (0.2660 + 0.05) = 0.8750 / 0.3160 = 2.769:1
```

**2.769:1 is BELOW the AC-007 floor of ≥3.0:1.**

The ADR D7 claimed a contrast of ≈3.07:1 for `#9c8c5c` against `#f1ead8`, using luminance values of 0.2825 (border) and 0.8130 (cream). Both of these luminance claims are incorrect:
- Actual border luminance: 0.2660 (ADR claimed 0.2825, overstated by 0.0165).
- Actual cream luminance: 0.8250 (ADR claimed 0.8130, understated by 0.0120).

The correct threshold: for the border to achieve 3.0:1 contrast against actual cream (#f1ead8 luminance 0.8250), the border luminance must be ≤ (0.8250 + 0.05) / 3.0 − 0.05 = 0.2417. The committed value has luminance 0.2660, which is above this threshold — the color is too light.

**Result: CRITICAL FAIL — AC-007 partial obligation not met.**

The token `--border-panel-strong-color: #9c8c5c` is the committed value for Phase 1. Phase 1's completion criteria require "tokens.css contains every new token in §8.5 with correct values." The value is factually incorrect for AC-007's ≥3.0:1 requirement. The defect will manifest as a test failure when Phase 4 writes the AC-007 computed-style assertion. The value must be corrected before Phase 1 can pass.

To satisfy AC-007 at 3.0:1, a darker value is required. Example: `#8a7a4a` (RGB 138, 122, 74) gives luminance ≈ 0.1961, contrast ≈ 3.72:1. The ADR D7's own iterative narrowing toward `#9c8c5c` stopped one step short of actually satisfying its own stated threshold.

---

### Check 7: Mechanical Regression — `npm run test:run` 11/11

**Evidence:**

```
> agentcon@0.1.0 test:run
> vitest run

 RUN  v4.1.5 /Users/allanmittelstaedt/Desktop/B-Projects/GP/Agentcon

 Test Files  1 passed (1)
      Tests  11 passed (11)
   Start at  16:56:39
   Duration  487ms
```

Exit 0. 11/11 tests pass. No regressions.

**Result: PASS**

---

## Additional Checks

### Diff is Purely Additive

The `git diff HEAD -- src/styles/tokens.css` shows exactly three categories of change:

**Deletions (3 lines):**
1. Comment `/* ─── Colors: accents ─── */` → replaced with updated comment `/* ─── Colors: accents (chrome — replaced by --accent-red in Phase 4) ─── */`
2. Comment `/* ─── Typography ─── */` → replaced with `/* ─── Typography (chrome) ─── */`
3. `--font-mono: "SF Mono", Menlo, Monaco, "JetBrains Mono", "Fira Code", ui-monospace, monospace;`

**Additions (76 lines):**
1. `/* === CHROME TOKENS === */` banner and its sub-comment.
2. Updated comment text for accents and typography sections.
3. New JetBrains-first `--font-mono` value.
4. `/* === CONTENT TOKENS === */` banner and all content token definitions (lines 100–167).

Every deletion is either a comment update or the D6-mandated `--font-mono` value replacement. No existing chrome token value was changed. No global rule was altered. No unrelated tweak was made.

**Result: PASS (diff shape)**

### Phase 1 Only Touched `tokens.css`

`git diff --name-only HEAD` shows exactly two files changed:
- `docs/pipeline/2026-05-05/design-migration-cream-panels/phase-state.json` (pipeline metadata — expected)
- `src/styles/tokens.css` (the Phase 1 deliverable)

No landing component CSS, no settings panel files, no `App.tsx`, no test files were touched.

**Result: PASS (scope)**

### `tokens-landing.css` and `--lp-*` Consumers Untouched

`tokens-landing.css` exists at `src/styles/tokens-landing.css` (4,486 bytes, timestamp May 3). `git diff HEAD -- src/styles/tokens-landing.css` returns 0 bytes — file is unchanged. All 17 consumer files under `src/panels/landing/` still reference `--lp-*` tokens as expected; these are Phase 2's rename worklist and must remain untouched in Phase 1.

**Result: PASS**

### D17 Compliance

Builder added zero new tests in Phase 1. D17's constraint (visual tests must use `getPropertyValue` only) does not apply — compliance by non-action.

**Result: PASS**

### CONS-22 (Settings Mono Font Flip)

`--font-mono` is now JetBrains-first, which means the settings panel inherits JetBrains Mono. Per CONS-22 and ADR D6, this is intentional and accepted per the migration thesis. No AC asserts pre-migration `font-family` on settings. Documented here as noted.

**Result: Intentional change — no finding.**

---

## Failures

### CRITICAL (1)

**AC-007 (partial) — `--border-panel-strong-color` contrast below the 3.0:1 floor**

- **AC text (PRD §5):** "when contrast is computed between the resolved `border-color` of `--border-panel-strong` and `--surface-cream` using the WCAG relative-luminance formula, then the contrast ratio is ≥3.0:1."
- **Phase 1 obligation (PRD §9):** "tokens.css contains every new token in §8.5 with correct values."
- **Committed value:** `--border-panel-strong-color: #9c8c5c`
- **Computed contrast (verified independently):** `#9c8c5c` (luminance 0.2660) vs `#f1ead8` (luminance 0.8250) = **2.769:1**
- **Required:** ≥3.0:1
- **Shortfall:** 0.231 contrast ratio units below the floor
- **Root cause:** ADR D7's luminance arithmetic contains errors for both values (border luminance overstated as 0.2825 rather than actual 0.2660; cream luminance understated as 0.8130 rather than actual 0.8250). The final selection of `#9c8c5c` was based on the incorrect luminance of 0.2825, which would have given a contrast of ~2.60:1 against ADR's cream of 0.8130 — itself below the 3.0 floor. The ADR's claimed ratio of 3.07:1 for this color is incorrect by any formulation of the WCAG formula.
- **Required fix:** Replace `--border-panel-strong-color` with a darker value whose actual WCAG contrast against `#f1ead8` is ≥3.0:1. The required border luminance ceiling is ≤0.2417. A value such as `#877348` (RGB 135, 115, 72, luminance ≈ 0.175, contrast ≈ 3.94:1) or `#8a7a4a` (RGB 138, 122, 74, luminance ≈ 0.196, contrast ≈ 3.72:1) would satisfy the requirement while remaining in the desaturated tan/khaki family the design intends. Builder must verify the selected replacement value with an independent WCAG computation before re-submitting.
- **File:** `src/styles/tokens.css`, line 143
- **AC binding:** AC-007 (partial in Phase 1; full consumer assertion in Phase 4, but the token value is defective at the point of definition)

---

## AC Coverage Summary

| AC | Phase 1 Obligation | Result |
|---|---|---|
| AC-003 | Both banner literals present in correct order | PASS |
| AC-006 (partial) | `--border-panel-strong` defined with correct structure (width, style, color reference) | PASS |
| AC-007 (partial) | `--border-panel-strong-color` value produces ≥3.0:1 contrast against cream | **FAIL** |

---

## Test Results

- New tests: N/A (Phase 1 adds no tests per design)
- Full suite: 11/11 PASS (no regressions)

---

## Phase Status

**QA_FAILED — ROUTING BACK TO BUILDER (judgment failure 1 of 2)**

Builder must correct `--border-panel-strong-color` in `src/styles/tokens.css` to a value whose WCAG contrast ratio against `#f1ead8` (--surface-cream) is ≥3.0:1. All other Phase 1 deliverables are correct.
