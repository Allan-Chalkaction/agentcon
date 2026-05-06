# Phase 1 Exploration

## 1. PRD Lock Confirmation

PRD is locked. Quote from Section 11 Final Consensus Lock block:

> **PRD locked:** "Consensus Status: LOCKED — 2026-05-05 / PRD locked at 2026-05-05 (CTO final lock block)."

All four required sign-offs are present (PM Round 1 + 2, CTO Round 1 + 2, Architect Round 1 + Acknowledgements R2/R3/R4).

---

## 2. Phase 1 File List (From PRD §9)

**Phase 1: Introduce content tokens (additive only)**

Files to touch per PRD §9:

- `src/styles/tokens.css` — MODIFY only. Add `=== CHROME TOKENS ===` banner, add `=== CONTENT TOKENS ===` banner, add all new content tokens from §8.5, add new chip/alert/border tokens. Do NOT delete or rename anything. No consumer changes.

That is the complete list. Phase 1 touches **one file** only.

**Explicitly not in Phase 1 scope:**
- `src/styles/tokens-landing.css` — NOT deleted (that is Phase 2).
- Any CSS module files — NOT touched.
- Any `.tsx` files — NOT touched.
- `App.tsx` — NOT touched (Phase 3).
- Any test files — NOT created/modified (Phase 2 adds `tests/landing-regression.test.tsx`).

---

## 3. Phase 1 AC List (From PRD §9)

Per PRD §9 Phase 1:

> **AC covered:** AC-003 (banner labels present in tokens.css). Partially: AC-006, AC-007 (token defined; consumer assertion happens later).

- **AC-003:** `tokens.css` contains both literal comment-band strings `/* === CHROME TOKENS === */` and `/* === CONTENT TOKENS === */` in that order. A test asserts both substrings appear in the file content in that order. (Phase 1 defines the banner; Phase 2's test `tests/landing-regression.test.tsx` carries the AC-003 assertion leg per CONS-02.)
- **AC-006 (partial):** `--border-panel-strong` token is defined in `tokens.css` with `border-width` in 1.5px–2px range, `border-style: solid`, and `border-color` pointing to `--border-panel-strong-color`. Consumer assertion happens in Phase 4.
- **AC-007 (partial):** `--border-panel-strong-color` `#9c8c5c` vs `--surface-cream` `#f1ead8` → contrast ratio ≈3.07:1 ≥3.0:1. Token defined here; AC-007's computed-style assertion happens in Phase 4.

---

## 4. Existing `--lp-*` Consumer Enumeration

Ran: `grep -rn "\-\-lp-" src/` excluding `tokens-landing.css`

**Results by file (reference count excluding the source definition file):**

| File | Count |
|---|---|
| `src/panels/landing/components/OperativeCard.module.css` | 54 |
| `src/panels/landing/components/ProjectSelector.module.css` | 30 |
| `src/panels/landing/components/TransmissionsFeed.module.css` | 23 |
| `src/panels/landing/components/Hero.module.css` | 14 |
| `src/panels/landing/LandingPage.module.css` | 13 |
| `src/panels/landing/components/StatusBar.module.css` | 12 |
| `src/panels/landing/components/HeaderBar.module.css` | 12 |
| `src/panels/landing/components/PersonnelFileCard.module.css` | 11 |
| `src/panels/landing/components/OperativesGrid.module.css` | 11 |
| `src/panels/landing/components/RedactedSilhouette.module.css` | 8 |
| `src/panels/landing/components/Footer.module.css` | 7 |
| `src/panels/landing/components/ClassifiedStamp.tsx` | 5 |
| `src/panels/landing/components/OperativeCard.tsx` | 2 |
| `src/panels/landing/components/Hero.tsx` | 2 |
| `src/panels/landing/components/RedactedSilhouette.tsx` | 1 |
| `src/panels/landing/components/OperativesGrid.tsx` | 1 |
| `src/panels/landing/components/Footer.tsx` | 1 |

**Total consumers: 17 files** (all inside `src/panels/landing/`). This is Phase 2's rename worklist.

**Phase 1 note:** Phase 1 does NOT rename any of these. All `--lp-*` references remain in place throughout Phase 1. Phase 1 is purely additive to `tokens.css`.

**Note on `.tsx` files:** Several `.tsx` files contain `--lp-*` references:
- `ClassifiedStamp.tsx`: 3 inline SVG attributes `stroke="var(--lp-accent-red)"` and `fill="var(--lp-accent-red)"`.
- `OperativeCard.tsx`: 2 references (comments only, not runtime CSS).
- `Hero.tsx`: 2 references (comments referencing token names).
- `RedactedSilhouette.tsx`: 1 reference (comment).
- `OperativesGrid.tsx`: 1 reference (comment).
- `Footer.tsx`: 1 reference (comment).

Inline SVG `stroke`/`fill` references in `ClassifiedStamp.tsx` are actual runtime CSS custom property references and must be renamed in Phase 2.

---

## 5. The Rename Mapping (D6 Ledger)

From ADR D6 / PRD §8.4 — the full locked rename map for Phase 2:

| Old `--lp-*` name | New name | Notes |
|---|---|---|
| `--lp-surface-cream` | `--surface-cream` | content surface |
| `--lp-surface-cream-soft` | `--surface-cream-soft` | card surface |
| `--lp-surface-dark` | `--feed-bg-dark` | renamed to make surface-purpose explicit |
| `--lp-surface-dark-soft` | `--feed-bg-dark-soft` | same reason |
| `--lp-ink` | `--ink` | primary text on cream |
| `--lp-ink-soft` | `--ink-soft` | secondary text on cream |
| `--lp-ink-faint` | `--ink-faint` | faint UI text on cream |
| `--lp-on-dark` | `--on-dark` | primary text on dark surfaces |
| `--lp-on-dark-soft` | `--on-dark-soft` | secondary text on dark surfaces |
| `--lp-accent-red` | `--accent-red` | unified red accent |
| `--lp-accent-green` | `--accent-green` | unified green accent |
| `--lp-accent-amber` | `--accent-amber` | unified amber accent |
| `--lp-font-display` | `--font-display` | EB Garamond + fallbacks |
| `--lp-font-mono` | `--font-mono` | JetBrains-first stack wins (replaces existing system-first `--font-mono`) |
| `--lp-text-xxs` | `--text-xxs` | new tier (10px) |
| `--lp-text-xs` | `--text-xs` | identical value 11px, retained |
| `--lp-text-sm` | `--text-sm` | identical value 12px, retained |
| `--lp-text-base` | `--text-body-lg` | collision resolution: existing `--text-base` is 13px; landing 14px → `--text-body-lg` |
| `--lp-text-md` | `--text-display-md` | 18px display tier, avoids collision with 14px `--text-md` |
| `--lp-text-lg` | `--text-display-lg` | 28px display tier |
| `--lp-text-xl` | `--text-display-xl` | 56px hero display tier |
| `--lp-weight-regular` | `--weight-regular` | identical 400, retained |
| `--lp-weight-medium` | `--weight-medium` | identical 500, retained |
| `--lp-leading-tight` | `--leading-display-tight` | 1.05, distinct from existing `--leading-tight` 1.3 |
| `--lp-leading-normal` | `--leading-normal` | existing 1.5 retained |
| `--lp-leading-mono` | `--leading-mono` | new |
| `--lp-content-max` | `--content-max` | layout |
| `--lp-page-pad-x` | `--page-pad-x` | layout |
| `--lp-border-hair` | `--border-hair` | hairline divider on cream |
| `--lp-border-card` | `--border-card` | cream-card hairline border |
| `--lp-radius-card` | `--radius-card` | 2px |
| `--lp-pulse-duration` | `--pulse-duration` | motion |

**Phase 1 action:** Add the right-hand column tokens (new names) to `tokens.css` under `/* === CONTENT TOKENS === */`. Leave `tokens-landing.css` and all consumers unchanged. After Phase 1, both `--lp-*` (in `tokens-landing.css` scoped to `.landing-root`) and the new unified tokens (in `tokens.css` at `:root`) coexist independently — no shim aliases.

---

## 6. Token Consolidation Plan (Phase 1 Scope)

Per PRD §9 Phase 1 and ADR D1:

**Phase 1 action on `tokens.css`:**
1. Add `/* === CHROME TOKENS === */` banner immediately inside the opening `:root {` brace (before the existing chrome token lines).
2. After the last chrome token definition (before the closing `}`), add `/* === CONTENT TOKENS === */` banner.
3. Add all new content tokens from §8.5 under the content tokens banner.
4. Add all chip tokens, alert tokens, border tokens from ADR D7/§8.5.

**Phase 1 does NOT:**
- Move `@font-face` declarations (those stay in `tokens-landing.css` for Phase 1 — per PRD §9 Phase 1 implementation notes: "The font-face declarations from `tokens-landing.css` are NOT moved yet (they stay in `tokens-landing.css` for Phase 1 because the landing still imports that file). Phase 2 moves them.")
- Delete `tokens-landing.css`.
- Rename any existing token.

**Tokens to add under `/* === CONTENT TOKENS === */`:**

Surfaces: `--surface-cream`, `--surface-cream-soft`, `--feed-bg-dark`, `--feed-bg-dark-soft`
Ink/Text: `--ink`, `--ink-soft`, `--ink-faint`, `--on-dark`, `--on-dark-soft`
Accents: `--accent-red`, `--accent-green`, `--accent-amber` (and `--accent-red-hover`, `--accent-red-bg` per §8.4)
Typography: `--font-display`, `--font-mono` (kept as separate entry — collision resolution applied in Phase 2 when `tokens-landing.css` is deleted; for Phase 1 both definitions coexist but in different scopes — `:root` gets the new JetBrains-first stack; `.landing-root` still has `--lp-font-mono`)
Size scale: `--text-xxs`, `--text-body-lg`, `--text-display-md`, `--text-display-lg`, `--text-display-xl`
Weight/Leading: `--weight-regular` (already in chrome tokens, must check for collision), `--weight-medium` (already exists), `--leading-display-tight`, `--leading-mono`, `--leading-normal` (already in chrome tokens)
Layout: `--content-max`, `--page-pad-x`
Borders/Radii: `--border-panel-strong`, `--border-panel-strong-color`, `--border-hair`, `--border-card`, `--radius-card`
Chip tokens: `--chip-bg-default`, `--chip-border-default`, `--chip-text-default`, `--chip-bg-selected`, `--chip-border-selected`, `--chip-text-selected`
Alert tokens: `--alert-bg`, `--alert-border`, `--alert-text`
Empty-state: `--empty-state-border-color`
Motion: `--pulse-duration`

**Collision check (tokens already in `tokens.css` chrome section):**
- `--weight-regular` (400) — already at line 53. Per D6: "identical 400, retained." Will add to content section as a distinct entry since it's a content-typography token. Both having value 400 is fine — the content section's definition may read as redundant but aligns with D1's structure.
- `--weight-medium` (500) — already at line 54. Same reasoning.
- `--leading-normal` (1.5) — already at line 50. D6 says: "existing 1.5 retained — landing's 1.45 is acceptable variance." Both at `:root` level will mean the content-section definition overwrites, but since values are same (using 1.5) there's no observable regression.
- `--text-xs` (11px) — already at line 41. D6: "identical value, retained." Same approach.
- `--text-sm` (12px) — already at line 42. D6: "identical value, retained."

For tokens that already exist in the chrome section with identical values, the PRD calls them "retained" — I will add them to the content section too as explicit content-side declarations for documentation clarity, but I should check the PRD's intent more carefully. The safer approach: only add tokens that don't already exist OR where the content version has a different value (e.g. `--font-mono` with JetBrains-first vs existing system-first). For tokens that are truly identical I'll add them to content tokens with a comment noting they match the chrome value.

Actually, re-reading PRD §8.2, the content token list includes `--text-xxs, --text-xs, --text-sm, --text-base, ...` as a complete unified size scale. The safest approach for Phase 1 is to add all new/renamed content tokens to the content section. Where a token name already exists in the chrome section with an identical value (e.g. `--weight-regular: 400`), adding it again to the content section with the same value is harmless — the last definition wins in a single `:root` block, but since values are identical there's no behavior change. I'll add new-valued ones (like `--font-mono` with JetBrains-first, `--text-body-lg: 14px`) and note collisions.

---

## 7. D6 Disposition for `--accent-primary`

Per ADR D6 / PRD §8.4:

> **`--accent-primary` is RENAMED/REPLACED.** AC-005 binds to outcome (a). `--accent-primary` → `--accent-red`; `--accent-primary-hover` → `--accent-red-hover`; `--accent-primary-bg` → `--accent-red-bg`.

**Phase 1 action:** Add `--accent-red`, `--accent-red-hover`, `--accent-red-bg` to the content tokens section. Keep `--accent-primary`, `--accent-primary-hover`, `--accent-primary-bg` in the chrome tokens section UNCHANGED for Phase 1 (settings panel still references them; they are removed in Phase 4).

**`:focus-visible` at `tokens.css:151`:** Currently references `var(--accent-primary)`. This is NOT changed in Phase 1. Per PRD §9 Phase 3: ":focus-visible outline-color flips from `var(--accent-primary)` to `var(--accent-red)`" happens in Phase 3, not Phase 1.

**`--accent-primary` coexistence:** After Phase 1, `--accent-primary: #5b8def` (chrome, for settings panel) and `--accent-red: #b8362b` (content, for landing and eventually settings) both exist at `:root`. Zero shim aliases. Both are independent definitions serving different phases. Phase 4 removes `--accent-primary`; Phase 3 flips `:focus-visible` to `--accent-red`.

---

## 8. `tokens-landing.css` Import Disposition

`tokens-landing.css` is imported at `src/panels/landing/LandingPage.tsx:15`:
```
import "../../styles/tokens-landing.css";
```

**Phase 1 action:** NO CHANGE. The import stays. `tokens-landing.css` is NOT deleted in Phase 1. The file and its import are left completely untouched throughout Phase 1. Phase 2 removes the import and deletes the file.

---

## 9. Globals Preservation (D11)

Per PRD §8.10 and AC-051/AC-052/AC-053:

- **`html, body, #root { overflow: hidden }` (tokens.css:105-112):** Preserved in place under the `/* === CHROME TOKENS === */` band. Phase 1 does not touch this rule. It sits outside the `:root {}` block entirely (it's a separate selector block), but conceptually belongs in the chrome section. The banner structure applies to the `:root {}` block — the global resets and rules below `:root` are preserved as-is.
- **`:focus-visible` (tokens.css:151):** Preserved exactly as-is in Phase 1. Still references `var(--accent-primary)`. The flip to `var(--accent-red)` happens in Phase 3.
- **`body { background: var(--bg-base); ... }` (tokens.css:114-122):** Preserved completely.

The banners `/* === CHROME TOKENS === */` and `/* === CONTENT TOKENS === */` live inside the `:root {}` block only. The rules below `:root` (resets, body styles, scrollbars, selection, focus-visible, button/input resets) are untouched.

---

## 10. CONS Items Applicable to Phase 1

- **CONS-13:** Post-rename, no `--lp-*` definitions can survive at `:root`. Phase 1 does NOT add any `--lp-*` at `:root`. The new content tokens under `:root` use the unified names (e.g. `--surface-cream`, not `--lp-surface-cream`). Compliant.
- **CONS-14:** `landing-root` plain string class in `LandingPage.tsx` must remain a plain string. Phase 1 does not touch `LandingPage.tsx`. Compliant by non-action.
- **CONS-21:** Visual tests must use `getPropertyValue('--token-name')`. Phase 1 does not add any tests. Compliant by non-action.
- **CONS-19:** D3 says 30 ACs in conditional defer matrix — informational only. No Phase 1 action.
- **CONS-23:** AC-028 binds to IPC path — Phase 5 concern. No Phase 1 action.
- **CONS-02:** The literal substrings `/* === CHROME TOKENS === */` and `/* === CONTENT TOKENS === */` must appear in `tokens.css` in that order. Phase 1 adds both. Verified in implementation.
- **CONS-17:** Phase 1 is additive-only, no rename, so squash discipline is trivial (one clean change to one file).

---

## 11. Anti-Patterns / Hard Rules for Phase 1

- Do NOT introduce shim aliases (`--lp-foo: var(--foo)`) — no transitional layer. Phase 1 adds new tokens with new names independently. The `--lp-*` tokens in `tokens-landing.css` are not touched.
- Do NOT delete `tokens-landing.css` — that's Phase 2.
- Do NOT rename any existing chrome token. Purely additive.
- Do NOT touch the settings panel (`src/panels/claude-settings/`) — Phase 3/4 work.
- Do NOT touch `App.tsx` — Phase 3 work.
- Do NOT modify the `:focus-visible` or `::selection` rules — Phase 3 work.
- Do NOT move `@font-face` blocks from `tokens-landing.css` — Phase 2 work.
- Do NOT add any consumer files — Phase 1 only modifies `tokens.css`.
- Do NOT modify tests or baseline fixtures.

---

## 12. Mid-Phase Shippability and Atomic-Commit Discipline

Phase 1 is additive-only and touches one file. There is no risk of a broken intermediate state. The app boots and renders identically to post-Phase-0.5 because:
- `tokens-landing.css` is unchanged, still scopes all `--lp-*` tokens under `.landing-root`.
- `tokens.css` gets new content token definitions at `:root`, but no consumer references them yet.
- The new content tokens at `:root` simply coexist without any consumer, harmlessly.

Single-commit delivery is trivial for a one-file change.

---

## 13. D17 Compliance Plan

Phase 1 does not add any new tests. Per PRD §9 Phase 1 completion criteria:
> "npm run test:run exits 0 (regression tests don't yet exist; bootstrap test still passes)."

No new visual tests are written in Phase 1. D17 compliance by non-action. The AC-003 assertion (banner labels in file) is added in Phase 2's test file (`tests/landing-regression.test.tsx`) per CONS-02.

---

## Summary

Phase 1 is the smallest phase: one file (`tokens.css`), purely additive, no consumer impact. The implementation is:

1. Add `/* === CHROME TOKENS === */` comment inside the `:root {}` block before existing chrome tokens.
2. After the last chrome token definition, close with `/* === CONTENT TOKENS === */` comment.
3. Add all new content tokens under that banner (surfaces, ink, accents, typography scale additions, layout, borders, chips, alerts, motion).
4. Verify both banner literals are present and in order.
5. Run `npm run test:run` — bootstrap test passes, no regression.

**Critical constraint on `landing-computed-style.json`:** The Phase 0.5 baseline fixture was captured using `--lp-*` token names as keys. This is correct and expected. Phase 2 (the assert leg for AC-045) will need to read these `--lp-*` keys and translate them to the new names when asserting. Phase 1 does not touch this fixture or affect the constraint.
