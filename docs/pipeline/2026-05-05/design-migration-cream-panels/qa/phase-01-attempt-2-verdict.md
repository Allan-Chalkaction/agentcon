# QA Verdict: PASS

**Phase:** 1
**Attempt:** 2
**Date:** 2026-05-06

---

## Scope of This Verification

Attempt 2 is a single-line fix to `--border-panel-strong-color` in `src/styles/tokens.css`. This verdict re-verifies AC-007 (the sole Attempt 1 failure) and spot-checks that the 12 PASS items from Attempt 1 are not regressed.

---

## Verification 1: Independent WCAG 2.x Recomputation

**Formula:** sRGB hex → normalize to [0,1] → linearize (c ≤ 0.03928: c/12.92; else ((c+0.055)/1.055)^2.4) → L = 0.2126·r_lin + 0.7152·g_lin + 0.0722·b_lin → ratio = (L_lighter+0.05)/(L_darker+0.05).

**`--surface-cream`: `#f1ead8` = RGB(241, 234, 216)**

| Channel | Normalized | Linearized |
|---|---|---|
| R | 241/255 = 0.945098 | ((0.945098+0.055)/1.055)^2.4 = 0.879622 |
| G | 234/255 = 0.917647 | ((0.917647+0.055)/1.055)^2.4 = 0.822786 |
| B | 216/255 = 0.847059 | ((0.847059+0.055)/1.055)^2.4 = 0.686685 |

L_cream = 0.2126×0.879622 + 0.7152×0.822786 + 0.0722×0.686685 = **0.825043**

**`--border-panel-strong-color`: `#8a7a4a` = RGB(138, 122, 74)**

| Channel | Normalized | Linearized |
|---|---|---|
| R | 138/255 = 0.541176 | ((0.541176+0.055)/1.055)^2.4 = 0.254152 |
| G | 122/255 = 0.478431 | ((0.478431+0.055)/1.055)^2.4 = 0.194618 |
| B |  74/255 = 0.290196 | ((0.290196+0.055)/1.055)^2.4 = 0.068478 |

L_border = 0.2126×0.254152 + 0.7152×0.194618 + 0.0722×0.068478 = **0.198168**

**Contrast ratio:**

```
(0.825043 + 0.05) / (0.198168 + 0.05) = 0.875043 / 0.248168 = 3.526:1
```

Verified independently via Node.js with the exact WCAG formula. Builder's stated value of 3.526:1 is correct. Ratio is 3.526:1, which is ≥3.0:1 by a margin of +0.526.

**AC-007 floor ≥3.0:1: PASS**

---

## Verification 2: Scope — Exactly One Line Changed in Attempt 2

The `git diff src/styles/tokens.css` shows the full Attempt 1 additions plus one value swap. Isolating the Attempt 2 delta: the only value-bearing line that changed between Attempt 1 and Attempt 2 is:

```diff
- --border-panel-strong-color: #9c8c5c; /* architectural border color — contrast ≈3.07:1 vs --surface-cream (AC-007) */
+ --border-panel-strong-color: #8a7a4a; /* architectural border color — contrast 3.53:1 vs --surface-cream (AC-007) */
```

No other token value, comment band, global rule, or Phase 1 deliverable changed in Attempt 2. One `-` line, one `+` line, both for `--border-panel-strong-color`.

**Scope: PASS**

---

## Verification 3: Attempt 1 PASS Items — No Regression

| Check | Evidence | Result |
|---|---|---|
| AC-003 banner literals | `grep -n "=== CHROME TOKENS ===\|=== CONTENT TOKENS ===" tokens.css` returns line 2 (chrome) and line 100 (content) — correct order | PASS |
| D7 content tokens present | `--surface-cream`, `--ink`, `--accent-red`, `--font-display`, `--border-panel-strong` all confirmed present at expected lines | PASS |
| CONS-13 no `--lp-*` definitions | `grep -n "^\s*--lp-" tokens.css` returns 0 lines | PASS |
| 4 globals preserved | `overflow: hidden` line 182, `body {` line 185, `::selection` line 216, `:focus-visible` line 222 — all present | PASS |
| `--font-mono` JetBrains-first | Line 42: `"JetBrains Mono", "SF Mono", Menlo, Monaco, ui-monospace, monospace` | PASS |
| AC-006 token structure | Line 143: `--border-panel-strong-color: #8a7a4a;`; Line 144: `--border-panel-strong: 1.5px solid var(--border-panel-strong-color)` — width 1.5px (within 1.5–2px), solid, color via token | PASS |
| Mechanical regression suite | `npm run test:run` → 11/11 pass, exit 0 | PASS |

---

## Verification 4: Scope Outside `tokens.css`

`git diff --name-only HEAD` returns:

```
docs/pipeline/2026-05-05/design-migration-cream-panels/phase-state.json
src/styles/tokens.css
```

Only `tokens.css` is a source file change. `phase-state.json` is pipeline metadata. No other source file under `src/` was touched.

**Scope outside tokens.css: PASS**

---

## Verification 5: Build Summary Properly Appended

Builder's `phase-01-attempt-1.md` contains the original Attempt 1 content intact, followed by a clearly delimited `## Attempt 2 — 2026-05-06 (AC-007 contrast fix)` section. The Attempt 2 section includes: new color value (`#8a7a4a`), full step-by-step WCAG computation, the one-line diff, mechanical verification results (tsc, build, test:run, AC-003 grep, CONS-13 grep), and status `READY_FOR_QA`. Attempt 1 content was not overwritten.

**Build Summary: PASS**

---

## AC Coverage: 3/3

| AC | Phase 1 Obligation | Result |
|---|---|---|
| AC-003 | Both banner literals present in `tokens.css`, chrome first, content second | PASS |
| AC-006 (partial) | `--border-panel-strong` defined with width 1.5px–2px, solid, color via token | PASS |
| AC-007 (partial) | `--border-panel-strong-color` value produces ≥3.0:1 contrast against `--surface-cream` | PASS — 3.526:1 |

---

## Test Results

- New tests: N/A (Phase 1 adds no tests by design)
- Full suite: 11/11 PASS (no regressions)

---

## Files Verified

- `src/styles/tokens.css` — sole Phase 1 source deliverable

---

## Phase Status

**QA_PASS — advancing to Reviewer**
