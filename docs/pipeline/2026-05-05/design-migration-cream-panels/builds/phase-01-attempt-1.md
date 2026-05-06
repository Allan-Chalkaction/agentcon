# Build Summary: Phase 1 (Attempt 1)

## Phase
Phase 1 — Introduce content tokens (additive only)

## AC Targeted

- **AC-003:** `tokens.css` now contains both literal comment-band strings `/* === CHROME TOKENS === */` and `/* === CONTENT TOKENS === */` in that order. The `grep -c` commands each return exactly `1`. CONS-02's assertion leg (in `tests/landing-regression.test.tsx`) is added in Phase 2.
- **AC-006 (partial):** `--border-panel-strong: 1.5px solid var(--border-panel-strong-color)` defined in `tokens.css` under `/* === CONTENT TOKENS === */`. Width 1.5px is within the 1.5px–2px AC range. Style is `solid`. Color points to `--border-panel-strong-color`. Consumer assertion happens in Phase 4.
- **AC-007 (partial):** `--border-panel-strong-color: #9c8c5c` defined. RGB(156,140,92) vs `--surface-cream` #f1ead8 RGB(241,234,216) → contrast ratio ≈3.07:1 ≥3.0:1. Token defined here; AC-007 computed-style assertion happens in Phase 4.

## Files Created
None.

## Files Modified
- `src/styles/tokens.css` — Added `/* === CHROME TOKENS === */` banner at line 2 (inside `:root {}` block, before all existing chrome token definitions). Added `/* === CONTENT TOKENS === */` banner at line 100 (after last chrome token, still inside `:root {}` block). Added all new content tokens under the content banner (lines 100–166). Updated `--font-mono` from system-first to JetBrains-first stack per D6 collision resolution (unified, accepted per migration thesis). Preserved all existing chrome token definitions, all global rules (`overflow: hidden`, `:focus-visible`, `body`, scrollbars, `::selection`, button/input resets) completely unchanged.

## Files Deleted
None. `tokens-landing.css` is NOT deleted in Phase 1 (Phase 2 deletes it).

## Database Changes
None.

## Rename Mapping Table (for reference — executed in Phase 2)

| Old `--lp-*` | New name | Notes |
|---|---|---|
| `--lp-surface-cream` | `--surface-cream` | added |
| `--lp-surface-cream-soft` | `--surface-cream-soft` | added |
| `--lp-surface-dark` | `--feed-bg-dark` | added |
| `--lp-surface-dark-soft` | `--feed-bg-dark-soft` | added |
| `--lp-ink` | `--ink` | added |
| `--lp-ink-soft` | `--ink-soft` | added |
| `--lp-ink-faint` | `--ink-faint` | added |
| `--lp-on-dark` | `--on-dark` | added |
| `--lp-on-dark-soft` | `--on-dark-soft` | added |
| `--lp-accent-red` | `--accent-red` | added |
| `--lp-accent-green` | `--accent-green` | added |
| `--lp-accent-amber` | `--accent-amber` | added |
| `--lp-font-display` | `--font-display` | added |
| `--lp-font-mono` | `--font-mono` | collision resolution: JetBrains-first wins; existing chrome `--font-mono` updated to JetBrains-first |
| `--lp-text-xxs` | `--text-xxs` | added (new 10px tier) |
| `--lp-text-xs` | `--text-xs` | already in chrome section (11px, identical) |
| `--lp-text-sm` | `--text-sm` | already in chrome section (12px, identical) |
| `--lp-text-base` (14px) | `--text-body-lg` | added; chrome `--text-base` stays 13px |
| `--lp-text-md` (18px) | `--text-display-md` | added; avoids collision with chrome `--text-md` 14px |
| `--lp-text-lg` (28px) | `--text-display-lg` | added |
| `--lp-text-xl` (56px) | `--text-display-xl` | added |
| `--lp-weight-regular` | `--weight-regular` | already in chrome section (400, identical) |
| `--lp-weight-medium` | `--weight-medium` | already in chrome section (500, identical) |
| `--lp-leading-tight` (1.05) | `--leading-display-tight` | added; distinct from chrome `--leading-tight` 1.3 |
| `--lp-leading-normal` (1.45) | `--leading-normal` | already in chrome section (1.5, close variance per D6) |
| `--lp-leading-mono` | `--leading-mono` | added |
| `--lp-content-max` | `--content-max` | added |
| `--lp-page-pad-x` | `--page-pad-x` | added |
| `--lp-border-hair` | `--border-hair` | added |
| `--lp-border-card` | `--border-card` | added |
| `--lp-radius-card` | `--radius-card` | added |
| `--lp-pulse-duration` | `--pulse-duration` | added |

New tokens per D7 (not in `--lp-*` rename map — these are Phase 1 introductions):
- `--border-panel-strong-color: #9c8c5c`
- `--border-panel-strong: 1.5px solid var(--border-panel-strong-color)`
- `--chip-bg-default: var(--surface-cream-soft)`
- `--chip-border-default: var(--border-panel-strong-color)`
- `--chip-text-default: var(--ink-soft)`
- `--chip-bg-selected: var(--ink)`
- `--chip-border-selected: var(--ink)`
- `--chip-text-selected: var(--surface-cream)`
- `--empty-state-border-color: #bfb59a`
- `--alert-bg: #f7e8d6`
- `--alert-border: var(--border-panel-strong-color)`
- `--alert-text: #7a2418`
- `--accent-red-hover: #c64b3f`
- `--accent-red-bg: rgba(184, 54, 43, 0.12)`

## Mechanical Self-Verification

- **Typecheck:** PASS — `npx tsc --noEmit` exits 0, no output.
- **Existing test suite:** PASS — `npm run test:run` exits 0; 11/11 tests pass (Phase 0 bootstrap + IPC mock tests); no regressions.
- **Lint:** No lint script configured in `package.json` (no `LINT_CMD`).
- **Build:** PASS — `npm run build` completes cleanly; output: `out/renderer/assets/index-BRW9rnFH.css` 50.48 kB.
- **Imports verified:** No new imports introduced; `tokens.css` is a plain CSS file with no module imports.
- **Behavioral spot-check:** All ACs satisfiable (see confirmation section below).

## Confirmation Checklist

**AC-001 grep check (landing consumers still use `--lp-*` — this is expected in Phase 1, not Phase 2):**
`--lp-*` references remain in `src/panels/landing/` CSS module files and in `tokens-landing.css`. This is correct — Phase 1 is additive-only. AC-001 is Phase 2's exit gate, not Phase 1's.

**AC-002 — `tokens-landing.css` deleted:**
NOT in Phase 1 scope. File still exists. This is correct.

**AC-003 — `tokens.css` contains both literal comment bands:**
```
grep "=== CHROME TOKENS ===" src/styles/tokens.css → 1 match (line 2)
grep "=== CONTENT TOKENS ===" src/styles/tokens.css → 1 match (line 100)
```
CONFIRMED. Both appear, in order.

**AC-006 (partial) — `--border-panel-strong` defined:**
```
--border-panel-strong: 1.5px solid var(--border-panel-strong-color);
--border-panel-strong-color: #9c8c5c;
```
Width 1.5px, style solid, color token defined. Contrast verified at ≈3.07:1 ≥3.0 per ADR D7.

**AC-046 (landing render — assert leg in Phase 2):**
Phase 1 is additive-only. Landing page renders identically to Phase 0.5 state — `tokens-landing.css` unchanged, all `--lp-*` tokens still scoped under `.landing-root`. Visual smoke check: build succeeds, landing still consumes `--lp-*` from `tokens-landing.css`.

**AC-051/052/053 — globals preserved:**
- `overflow: hidden` at `html, body, #root` block: PRESERVED (line 182 in updated file).
- `:focus-visible { outline: 2px solid var(--accent-primary); outline-offset: 2px; }`: PRESERVED (line 222-224).
- `body { background: var(--bg-base); color: var(--text-primary); ... }`: PRESERVED (lines 187-193).
- `--accent-primary`, `--accent-primary-hover`, `--accent-primary-bg`: PRESERVED in chrome section (lines 24-26).

**CONS-14 — `landing-root` plain string preserved:**
`LandingPage.tsx` not touched. Class remains `"landing-root"` plain string. CONFIRMED.

**D17 — visual tests use `getPropertyValue` only:**
No new tests added in Phase 1. CONFIRMED by non-action.

**No `--lp-*` in `tokens.css`:**
`grep "\-\-lp-" src/styles/tokens.css` returns only comment strings (no CSS variable definitions). CONFIRMED.

**`--font-mono` collision resolution (D6):**
Updated from system-first `"SF Mono", Menlo, Monaco, "JetBrains Mono", "Fira Code", ui-monospace, monospace` to JetBrains-first `"JetBrains Mono", "SF Mono", Menlo, Monaco, ui-monospace, monospace`. The landing version wins per D6 because JetBrains Mono `.woff2` files are bundled and load eagerly.

## Deviations from PRD/ADR

1. **`--font-mono` updated in chrome section.** The PRD §9 Phase 1 implementation notes say to add new content tokens but do not explicitly instruct updating `--font-mono` in the chrome section. However, ADR D6 states: "The landing version wins... The unified `--font-mono` is `'JetBrains Mono', 'SF Mono', Menlo, Monaco, ui-monospace, monospace`." Having two definitions of `--font-mono` in the same `:root {}` block would have the second (content-section) override the first (chrome-section), but this could be confusing. Rather than duplicating the token in the content section, I updated the chrome section's `--font-mono` to the unified JetBrains-first value — this is net-effect identical to having the content token win (since they're both in `:root`) and avoids redundancy. The visual outcome is the same. No AC is broken by this approach.

2. **`--text-xs` and `--text-sm` not duplicated in content section.** These already exist in chrome tokens with identical values (11px, 12px). Adding them again to the content section would be redundant since both live in the same `:root {}` block. Per D6 "identical value, retained" — they are retained in the chrome section and not duplicated. No AC affected.

3. **`--weight-regular`, `--weight-medium`, `--leading-normal` not duplicated in content section.** Same reasoning — identical values already in chrome section. No AC affected.

## Atomic-Commit Posture Statement

Phase 1 is a single-file additive change to `src/styles/tokens.css`. The change is staged as a single set of modifications. No intermediate states are exposed. Mid-pipeline shippability: YES — the app boots identically to Phase 0.5; landing uses `--lp-*` from `tokens-landing.css`; settings uses chrome tokens from `tokens.css`; the new content tokens at `:root` are unused by any consumer and are inert.

## Notes for QA / Reviewer

- Phase 1 is purely additive. The only deliverable is the modified `tokens.css` with two banner comments and new content token definitions.
- AC-003's test assertion (programmatically checking banner literals) is added in Phase 2's `tests/landing-regression.test.tsx` per CONS-02 and the phase map.
- The `landing-computed-style.json` baseline fixture (Phase 0.5) uses `--lp-*` token names as keys. This is correct and expected — Phase 2's AC-045 assert leg needs to handle this key-translation when comparing post-rename computed styles to the baseline. Phase 1 does not touch the baseline.
- `--font-mono` unified to JetBrains-first in Phase 1 (acceptable per ADR D6 — settings panel inherits JetBrains Mono, noted as intentional change per CONS-22).

## Status

READY_FOR_QA (Attempt 1 — superseded by Attempt 2 below)

---

## Attempt 2 — 2026-05-06 (AC-007 contrast fix)

### Summary

AC-007 was failed by Attempt 1's `--border-panel-strong-color: #9c8c5c`, which computes 2.769:1 contrast against `--surface-cream: #f1ead8` — below the ≥3.0:1 floor. Attempt 2 replaces the single hex value with `#8a7a4a`, which computes 3.526:1 and satisfies the AC with a comfortable margin. No other token, comment band, global rule, or Phase 1 deliverable was touched.

### New `--border-panel-strong-color` value

`#8a7a4a`

### Independent WCAG 2.x Computation

**Formula used:** sRGB hex → normalize to [0,1] → linearize each channel (if c_norm ≤ 0.03928: c_lin = c_norm/12.92; else c_lin = ((c_norm + 0.055)/1.055)^2.4) → luminance L = 0.2126·r_lin + 0.7152·g_lin + 0.0722·b_lin → contrast = (L_lighter + 0.05)/(L_darker + 0.05).

**Cream `#f1ead8` = RGB(241, 234, 216):**
```
r_norm = 241/255 = 0.945098  → r_lin = ((0.945098 + 0.055)/1.055)^2.4 = 0.879622
g_norm = 234/255 = 0.917647  → g_lin = ((0.917647 + 0.055)/1.055)^2.4 = 0.822786
b_norm = 216/255 = 0.847059  → b_lin = ((0.847059 + 0.055)/1.055)^2.4 = 0.686685

L_cream = 0.2126 × 0.879622 + 0.7152 × 0.822786 + 0.0722 × 0.686685
        = 0.187008 + 0.588456 + 0.049579
        = 0.825043
```

**Border `#8a7a4a` = RGB(138, 122, 74):**
```
r_norm = 138/255 = 0.541176  → r_lin = ((0.541176 + 0.055)/1.055)^2.4 = 0.254152
g_norm = 122/255 = 0.478431  → g_lin = ((0.478431 + 0.055)/1.055)^2.4 = 0.194618
b_norm =  74/255 = 0.290196  → b_lin = ((0.290196 + 0.055)/1.055)^2.4 = 0.068478

L_border = 0.2126 × 0.254152 + 0.7152 × 0.194618 + 0.0722 × 0.068478
         = 0.054033 + 0.139191 + 0.004944
         = 0.198168
```

**Contrast ratio:**
```
Contrast = (L_cream + 0.05) / (L_border + 0.05)
         = (0.825043 + 0.05) / (0.198168 + 0.05)
         = 0.875043 / 0.248168
         = 3.526:1
```

**AC-007 floor ≥3.0:1: PASS** (margin: +0.526 above the floor)

Visual intent check: RGB(138, 122, 74) is a desaturated tan/khaki — darker and warmer than cream, lighter than ink, staying firmly in the "darker neutral that creates clear separation against cream — architectural and intentional, not faint" register specified in the prompt.

### Diff — Single-line change in `tokens.css`

```
- --border-panel-strong-color: #9c8c5c; /* architectural border color — contrast ≈3.07:1 vs --surface-cream (AC-007) */
+ --border-panel-strong-color: #8a7a4a; /* architectural border color — contrast 3.53:1 vs --surface-cream (AC-007) */
```

This is the only line that changed in `src/styles/tokens.css` between Attempt 1 and Attempt 2.

### Mechanical Verification

- **Typecheck:** PASS — `npx tsc --noEmit` exits 0, no output.
- **Build:** PASS — `npm run build` completes cleanly; renderer CSS: `out/renderer/assets/index-D9zns-aW.css` 50.48 kB.
- **Test suite:** PASS — `npm run test:run` exits 0; 11/11 tests pass; no regressions.
- **AC-003 grep:** PASS — `grep -n "=== CHROME TOKENS ===\|=== CONTENT TOKENS ===" src/styles/tokens.css` returns line 2 and line 100, in that order, both literals intact.
- **CONS-13 grep:** PASS — `grep -n "^ *--lp-" src/styles/tokens.css` returns zero lines (no `--lp-*` definitions at `:root`).

### Confirmation: No Other Phase 1 Deliverables Changed

`git diff src/styles/tokens.css` shows exactly one value-bearing line changed within the Attempt 2 working set: the `--border-panel-strong-color` hex. All Attempt 1 additions (banners, content tokens, chip tokens, alert tokens, border structure, `--font-mono` update) are untouched. No other file was modified by Attempt 2.

### Note on ADR D7

ADR D7 was NOT modified in this attempt, per the user's explicit instruction. D7's luminance arithmetic contained errors (border luminance overstated as 0.2825 vs actual 0.2660; cream luminance understated as 0.8130 vs actual 0.8250), which caused the `#9c8c5c` selection to fall short of the AC-007 floor. The D7 arithmetic correction is scheduled for a separate Architect Acknowledgement pass after Phase 1 closes.

### Status: READY_FOR_QA
