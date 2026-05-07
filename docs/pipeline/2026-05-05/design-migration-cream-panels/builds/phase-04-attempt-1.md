# Build Summary: Phase 4 (Attempt 1)

## Phase

Settings panel re-theme — `ClaudeSettingsPanel.module.css` full content-token rewrite + four mockup-issue resolutions + `--accent-primary*` token removal.

---

## AC Targeted

| AC | How this code satisfies it |
|---|---|
| **AC-005** | `var(--accent-primary*)` usages removed from `ClaudeSettingsPanel.module.css` (7 occurrences), `PermissionsTab.tsx` (2 occurrences), and the `--accent-primary*` definitions removed from `tokens.css`. `grep -rn "var(--accent-primary" src/` returns zero. |
| **AC-006** | `.shell`, `.itemRow`, `.errorBanner`, `.formInput`, `.ruleInput`, `.chipGroup`, `.chipSelected`/`.chip`, `.splitList`, `.tabHeader`, `.scopeBar` all declare `border: var(--border-panel-strong)` or `border-color: var(--border-panel-strong-color)`. The token resolves to `1.5px solid #8a7a4a`. |
| **AC-007** | `--border-panel-strong-color` (`#8a7a4a`, L≈0.198168) vs `--surface-cream` (`#f1ead8`, L≈0.825043) → contrast = 3.526:1 ≥ 3.0:1. (Token unchanged from Phase 1 Attempt 2 committed value; contrast verified three-witness at 3.52–3.53:1 per ADR D7 Addendum A.) |
| **AC-008** | `--border-panel-strong` applied to all six panel categories: (1) `.itemRow` (project-scope cards / preset cards), (2) `.shell` (settings-tab content panel), (3) `.formInput` (form panels — the `composes: formInput` on `.formTextarea` inherits it), (4) `.itemRow` via HooksTab preset cards, (5) `.chipGroup` (lifecycle-chip group container), (6) `.errorBanner` (alert/error containers). |
| **AC-009** | `.chip` (default state) declares `border: var(--border-panel-strong)` — which resolves to the `--border-panel-strong-color` architectural border token per AC-009 binding (ADR D7 / §8.12). |
| **AC-015** | `.tabTitle { font-family: var(--font-mono); font-style: normal; font-weight: 500; font-size: var(--text-md); text-transform: uppercase; letter-spacing: 0.04em; }` — JetBrains Mono, normal, 500, 14px, locked per ADR D12 / §8.12. |
| **AC-016** | `.tabTitle` does not reference `var(--font-display)` (EB Garamond); no CSS Module class assigned to tab-section title elements uses the serif display family. |
| **AC-017** | `HooksTab.tsx` line 147: `event === e.id ? styles.chipSelected : styles.chip` — CSS class swap; selected chip carries `chipSelected`, others carry `chip`. Locked class name `chipSelected` per ADR D10 / §8.9. |
| **AC-018** | `.chipSelected { background: var(--chip-bg-selected); border-color: var(--chip-border-selected); color: var(--chip-text-selected); }` — three tokens locked per ADR D13. |
| **AC-019** | `.chip { background: var(--chip-bg-default); border: var(--border-panel-strong); color: var(--chip-text-default); }` — three tokens locked per ADR D13. |
| **AC-020** | Selected chip: `--chip-text-selected` = `--surface-cream` (#f1ead8, L≈0.825043) on `--chip-bg-selected` = `--ink` (#1d1c19, L≈0.011619) → contrast = **14.201:1** ≥ 4.5:1. |
| **AC-021** | Unselected chip: `--chip-text-default` = `--ink-soft` (#4a4742, L≈0.063557) on `--chip-bg-default` = `--surface-cream-soft` (#ece4cf, L≈0.778247) → contrast = **7.294:1** ≥ 4.5:1. |
| **AC-022** | Single-select logic unchanged: `HooksTab.tsx` `onClick={() => setEvent(e.id)}` replaces the previously-selected value; `chipSelected` is applied to exactly one chip at a time. The `useEffect` dependency array at lines 36-39 is untouched (CONS-15). |
| **AC-023** | `.hookEmptyState { border-style: solid; ... }` — solid branch per ADR D8 primary resolution. |
| **AC-024** | `.hookEmptyState { border-width: 1.5px; border-color: var(--empty-state-border-color); }` — `--empty-state-border-color: #bfb59a` per ADR D7. |
| **AC-025** | Empty-state border (#bfb59a, L≈0.464572) vs cream (#f1ead8, L≈0.825043) → contrast = **1.701:1** (within 1.5–3.0 range, AC-025 satisfied). |
| **AC-043** | `.errorBanner { background: var(--alert-bg); color: var(--alert-text); border-color: var(--alert-border); }` — `--alert-text` (#7a2418, L≈0.054653) on `--alert-bg` (#f7e8d6, L≈0.823424) → contrast = **8.346:1** ≥ 4.5:1. |
| **AC-044** | `.errorBanner` declares `border: var(--border-panel-strong); border-color: var(--alert-border);` — border-width = 1.5px (from `--border-panel-strong`); border-color = `--alert-border` = `var(--border-panel-strong-color)` = `#8a7a4a`. |
| **AC-053** | `.shell { background: var(--surface-cream); color: var(--ink); }` — content panel overrides body's dark-chrome background (`var(--bg-base)`) with cream (#f1ead8) and sets text to ink (#1d1c19). Chrome region (`body`) resolves to `--bg-base` (#0a0c10). |

---

## Files-Touched Ledger

### `src/panels/claude-settings/ClaudeSettingsPanel.module.css` — FULL REWRITE

**Pre-migration:** 480 lines, dark CLI aesthetic with `--bg-*`, `--text-*`, `--accent-primary*` chrome tokens throughout.

**Post-migration:** 609 lines (within ≤720 perf bound). Key changes:

- **`.shell`:** `background: var(--bg-base)` → `background: var(--surface-cream); color: var(--ink); border: var(--border-panel-strong);` — AC-053 cream-on-ink override; AC-008 architectural border.
- **`.scopeBar`:** `background: var(--bg-base)` → `background: var(--surface-cream);`; border → `var(--border-panel-strong)`.
- **`.scopeTabActive`:** `border-color: var(--accent-primary)` → `var(--border-panel-strong-color)`.
- **Text tokens:** All `--text-primary` → `--ink`; `--text-secondary` → `--ink-soft`; `--text-muted` → `--ink-faint`.
- **Background tokens:** All `--bg-elevated` → `--surface-cream-soft`; `--bg-input` → `--surface-cream-soft`.
- **`.rail`:** Added `background: var(--surface-cream)`; border → `var(--border-panel-strong)`.
- **`.railItem`/`.railItemActive`:** Updated to cream-surface colors. NOT removed (still used by left rail nav + MatcherInput).
- **`.tabTitle`:** Full ADR D12 typography treatment — `font-family: var(--font-mono)`, `font-style: normal`, `font-weight: 500`, `font-size: var(--text-md)`, `text-transform: uppercase`, `letter-spacing: 0.04em` (AC-015, AC-016).
- **`.button`:** `background: var(--accent-primary)` → `var(--accent-red)`; `color: var(--text-inverse)` → `var(--surface-cream)` (AC-005).
- **`.button:hover`:** `var(--accent-primary-hover)` → `var(--accent-red-hover)` (AC-005).
- **`.buttonSecondary`:** `background: var(--bg-elevated); border: solid var(--border-default)` → `background: var(--surface-cream-soft); border: var(--border-panel-strong)`.
- **`.errorBanner`:** `color: var(--color-danger); background: rgba(248,...)` → `background: var(--alert-bg); color: var(--alert-text); border: var(--border-panel-strong); border-color: var(--alert-border)` (AC-043, AC-044).
- **`.itemRow`:** `background: var(--bg-elevated); border: solid var(--border-default)` → `background: var(--surface-cream-soft); border: var(--border-panel-strong)` (AC-008).
- **`.itemRow:hover`:** `border-color: var(--accent-primary)` → `var(--border-panel-strong-color)` (AC-005).
- **`.itemRowSelected`:** `border-color: var(--accent-primary)` → `var(--border-panel-strong-color)` (AC-005).
- **`.formInput`/`.formInput:focus`:** `background: var(--bg-input)` → `var(--surface-cream-soft)`; `border: solid var(--border-default)` → `var(--border-panel-strong)`; `color: var(--text-primary)` → `var(--ink)`; focus `border-color: var(--accent-primary)` → `var(--accent-red)` (AC-005).
- **`.ruleInput`/`.ruleInput:focus`:** Same as `.formInput` (AC-005).
- **`.splitList`:** `border-right: solid var(--border-default)` → `var(--border-panel-strong)`.
- **NEW `.chip`:** Default lifecycle chip class — `background: var(--chip-bg-default); border: var(--border-panel-strong); color: var(--chip-text-default)` (AC-009, AC-019, AC-021).
- **NEW `.chipSelected`:** Selected lifecycle chip class — `background: var(--chip-bg-selected); border-color: var(--chip-border-selected); color: var(--chip-text-selected)` (AC-017, AC-018, AC-020).
- **NEW `.chipGroup`:** Chip group container — `border: var(--border-panel-strong)` (AC-008).
- **NEW `.hookEmptyState`:** Empty-state container — `border-style: solid; border-width: 1.5px; border-color: var(--empty-state-border-color)` (AC-023, AC-024, AC-025).

### `src/panels/claude-settings/HooksTab.tsx` — MINOR MODIFY

- **Line 136:** `<div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>` → `<div className={styles.chipGroup}>` — chip group container gets architectural border (AC-008).
- **Line 147:** `event === e.id ? styles.railItemActive : styles.railItem` → `event === e.id ? styles.chipSelected : styles.chip` — lifecycle chip class swap (AC-017, AC-022).
- **Line 157:** `color: "var(--text-muted)"` → `color: "var(--ink-faint)"` — inline span inside chip updated to cream-surface token.
- **Line 174:** `<div className={styles.itemDescription}>` → `<div className={styles.hookEmptyState}>` — empty-state class (AC-023–AC-025).
- **Line 266-270:** `HookEntryEditor` inline style: `background: "var(--bg-input)"` → `"var(--surface-cream-soft)"`; `border: "var(--border-width) solid var(--border-default)"` → `"var(--border-panel-strong)"` — cream-surface treatment inside hook group card.

### `src/panels/claude-settings/PermissionsTab.tsx` — MINOR MODIFY

- **Line 26:** `BUCKET_META.ask.color = "var(--accent-primary)"` → `"var(--accent-red)"`; `bg: "rgba(99,102,241,0.1)"` → `"rgba(184,54,43,0.1)"` — AC-005 inline style replacement. Note: the `bg` rgba value updated from indigo (91,141,239 → the old `--accent-primary-bg` color) to red-tinted.
- **Line 446:** `style={{ cursor: "pointer", color: "var(--accent-primary)" }}` → `color: "var(--accent-red)"` — AC-005 inline style replacement.

### `src/styles/tokens.css` — MODIFY (deletion)

- **Lines 62-64 (pre-migration):** `--accent-primary: #5b8def`, `--accent-primary-hover: #7aa4f5`, `--accent-primary-bg: rgba(91, 141, 239, 0.12)` — DELETED and replaced with a comment note documenting the removal. The `--accent-red*` siblings already exist in the `=== CONTENT TOKENS ===` band from Phase 1.

---

## Mockup-Issue Resolution Summary

| Issue | Treatment applied | AC | File:line |
|---|---|---|---|
| Tab titles → mono not serif italic | `.tabTitle { font-family: var(--font-mono); font-style: normal; font-weight: 500; font-size: var(--text-md); text-transform: uppercase; letter-spacing: 0.04em; }` | AC-015, AC-016 | `ClaudeSettingsPanel.module.css:171-178` |
| Lifecycle chip selection state | CSS class swap `chip` ↔ `chipSelected`; `.chip` uses `--chip-bg-default`/`var(--border-panel-strong)`/`--chip-text-default`; `.chipSelected` uses `--chip-bg-selected`/`--chip-border-selected`/`--chip-text-selected`; single-select; `chipGroup` container gets panel border | AC-009, AC-017–AC-022 | `ClaudeSettingsPanel.module.css:554-592`; `HooksTab.tsx:136-165` |
| Empty-state border (dashed too heavy) | `.hookEmptyState { border-style: solid; border-width: 1.5px; border-color: var(--empty-state-border-color); }` — #bfb59a, 1.71:1 contrast vs cream | AC-023, AC-024, AC-025 | `ClaudeSettingsPanel.module.css:600-608`; `HooksTab.tsx:174` |
| Dev-switch contrast | Already handled in Phase 3 (committed at `2bc061f`). No Phase 4 changes to `App.tsx`/`App.module.css`. | AC-010–AC-014 | (Phase 3 territory — unchanged) |

---

## `--accent-primary*` Disposition

### Consumer migration (all seven references in ClaudeSettingsPanel.module.css):
| Rule | Old | New |
|---|---|---|
| `.scopeTabActive { border-color }` | `var(--accent-primary)` | `var(--border-panel-strong-color)` |
| `.button { background }` | `var(--accent-primary)` | `var(--accent-red)` |
| `.button:hover { background }` | `var(--accent-primary-hover)` | `var(--accent-red-hover)` |
| `.itemRow:hover { border-color }` | `var(--accent-primary)` | `var(--border-panel-strong-color)` |
| `.itemRowSelected { border-color }` | `var(--accent-primary)` | `var(--border-panel-strong-color)` |
| `.formInput:focus { border-color }` | `var(--accent-primary)` | `var(--accent-red)` |
| `.ruleInput:focus { border-color }` | `var(--accent-primary)` | `var(--accent-red)` |

### Consumer migration (PermissionsTab.tsx — 2 references):
| Location | Old | New |
|---|---|---|
| `BUCKET_META.ask.color` | `"var(--accent-primary)"` | `"var(--accent-red)"` |
| inline `style.color` at line 446 | `"var(--accent-primary)"` | `"var(--accent-red)"` |

### Token definition removal (tokens.css lines 62-64):
- `--accent-primary: #5b8def` — DELETED
- `--accent-primary-hover: #7aa4f5` — DELETED
- `--accent-primary-bg: rgba(91, 141, 239, 0.12)` — DELETED

### Final grep result:
`grep -rn "var(--accent-primary" src/` → **zero matches** ✓

Note: grep of the string `--accent-primary` (without `var(`) returns matches in comments only (CSS comments in `.module.css` and `tokens.css` documenting the removal). No live token references remain.

---

## Functional Regression Test Additions

Phase 4 owns no new test files per PRD §9. Tests for AC-026–AC-044 are Phase 5 deliverables (`tests/settings-regression.test.tsx`). Phase 5 will use:
- `installAgentconMock()` from `tests/mocks/agentconMock.ts`
- `getPropertyValue('--token-name')` (Direction 1, ADR D17) for all visual assertions
- Three-witness contrast computations from the locked token values

---

## Mechanical Self-Verification

| Check | Result |
|---|---|
| **Typecheck** | ✅ Pass — `npx tsc --noEmit` exits 0 (zero errors) |
| **Build** | ✅ Pass — `npm run build` exits 0; CSS bundle: 53.01 kB (pre-migration baseline was ~53 kB — within 1.3x perf bound; net change from `--accent-primary` comment replacement is negligible) |
| **Existing test suite** | ✅ Pass — `npm run test:run` exits 0; **87/87 tests** pass (no regressions) |
| **Lint** | No `npm run lint` script configured in this project (consistent with Phases 0–3) |
| **AC-001 grep** | ✅ `grep -rn "\-\-lp-" src/` returns **zero matches** |
| **AC-005 grep** | ✅ `grep -rn "var(--accent-primary" src/` returns **zero matches** |
| **Perf bound check** | ✅ `ClaudeSettingsPanel.module.css`: 609 lines ≤ 720-line cap |
| **Import verification** | ✅ All imports resolve — `ClaudeSettingsPanel.module.css` new classes (`chip`, `chipSelected`, `chipGroup`, `hookEmptyState`) all referenced from `HooksTab.tsx`; no dangling class references |
| **Behavioral spot-check** | ✅ All 19 targeted ACs satisfiable (see AC table above) |

---

## Functionality-Preservation Statement

Phase 4 changed only CSS class styling and two JSX class-name swaps (chip class + empty-state class in `HooksTab.tsx`) and two inline style value swaps in `PermissionsTab.tsx`. No functional logic was changed:

- **Load flow:** `init()` + `loadScope()` in `ClaudeSettingsPanel.tsx` — untouched
- **Edit flow:** React state management in each tab — untouched
- **Save flow:** `saveSettings(scope, next)` → `window.agentcon.fs.writeText` — untouched
- **Tab switching:** `SurfaceView` switch + `setSurface` state — untouched
- **Hooks CRUD:** `setDraft`/`setGroups`/`addGroup`/`removeGroup`/`updateHook`/`removeHook` in `HooksTab.tsx` — untouched
- **Presets apply:** `applyPreset` → `setDraft(next)` + `setEvent` in `HooksTab.tsx` — untouched (AC-040: open-editor branch; no auto-save)
- **Alert display:** `errorBanner` class applied when `banner` is truthy — logic unchanged; only CSS treatment changed
- **Single-select chip:** `onClick={() => setEvent(e.id)}` replaces event atomically — unchanged, only class names changed

The `useEffect` reset at `HooksTab.tsx:36-39` is untouched (CONS-15: AC-031/AC-035 bindings depend on this).

87/87 pre-Phase-4 tests pass with zero regressions, confirming no functionality regression.

---

## Phase 0/0.5/1/2/3 Invariants Intact

- **Phase 0:** `vitest.config.ts`, `tests/setup.ts`, `tests/mocks/agentconMock.ts` — not modified
- **Phase 0.5:** Fixture files under `tests/baseline/` — not modified
- **Phase 1:** `tokens.css` content-token VALUES unchanged (only `--accent-primary*` definitions deleted from chrome band)
- **Phase 2:** Landing files unchanged — `grep -rn "\-\-lp-" src/` still returns zero
- **Phase 3:** `App.tsx`/`App.module.css` — not modified; `:focus-visible`/`::selection` rules in `tokens.css` — not modified

---

## Three-Witness Contrast Computations (Phase 4 new ACs)

**WCAG 2.x formula:** L = 0.2126·r_lin + 0.7152·g_lin + 0.0722·b_lin; c_lin = ((c/255 + 0.055)/1.055)^2.4 for c/255 > 0.04045; contrast = (L_hi + 0.05)/(L_lo + 0.05)

### AC-020: Selected chip (cream text on ink bg)
- `--chip-text-selected` = `--surface-cream` = `#f1ead8`: L = 0.825043
- `--chip-bg-selected` = `--ink` = `#1d1c19`: L = 0.011619
- **Builder computed: 14.201:1** ✓ ≥ 4.5:1 (margin: +9.7)
- ADR D7 stated ≈14.8:1 (minor variation due to gamma formula precision — both >4.5:1 floor)

### AC-021: Unselected chip (ink-soft text on cream-soft bg)
- `--chip-text-default` = `--ink-soft` = `#4a4742`: L = 0.063557
- `--chip-bg-default` = `--surface-cream-soft` = `#ece4cf`: L = 0.778247
- **Builder computed: 7.294:1** ✓ ≥ 4.5:1 (margin: +2.8)
- ADR D7 stated ≈6.8:1 (slight variance — both well above floor)

### AC-043: Alert text on alert background
- `--alert-text` = `#7a2418`: L = 0.054653
- `--alert-bg` = `#f7e8d6`: L = 0.823424
- **Builder computed: 8.346:1** ✓ ≥ 4.5:1 (margin: +3.8)
- ADR D7 stated ≈8.4:1 — consistent

### AC-025: Empty-state border vs cream surface
- `--empty-state-border-color` = `#bfb59a`: L = 0.464572
- `--surface-cream` = `#f1ead8`: L = 0.825043
- **Builder computed: 1.701:1** ✓ within 1.5–3.0 range (AC-025 satisfied)
- ADR D7 stated ≈1.71:1 — consistent

### AC-007 (verification): Border-panel-strong-color vs cream
- `--border-panel-strong-color` = `#8a7a4a`: L = 0.198168
- `--surface-cream` = `#f1ead8`: L = 0.825043
- **Builder computed: 3.526:1** ✓ ≥ 3.0:1 (ADR D7 Addendum A three-witness record: 3.52–3.53:1)

---

## Atomic-Commit Posture Statement (CONS-17)

Phase 4 is delivered as a single staged change-set. All five files are modified together:
1. `ClaudeSettingsPanel.module.css` (CSS rewrite)
2. `HooksTab.tsx` (class-name swaps)
3. `PermissionsTab.tsx` (inline style token replacement)
4. `tokens.css` (definition deletion)
5. Exploration note + Build Summary (pipeline artifacts)

No intermediate state exists where new CSS class names (`chipSelected`, `chip`, `hookEmptyState`) are referenced from TSX without corresponding CSS definitions, or where `--accent-primary*` definitions are deleted before consumer CSS is migrated. The change-set is coherent end-to-end.

---

## Deviations from PRD/ADR

**None.** All implementation follows the locked ADR decisions (D7, D8, D12, D13) and PRD §9 Phase 4 implementation notes verbatim.

One minor builder judgment: the HookEntryEditor inline style in `HooksTab.tsx` was updated from `var(--bg-input)` / `var(--border-width) solid var(--border-default)` to `var(--surface-cream-soft)` / `var(--border-panel-strong)` — these were chrome-token inline styles inside a cream panel surface. This is consistent with the migration thesis (cream panels use cream tokens throughout) and doesn't change any functional behavior. The PRD's "inline style props that reference renamed tokens" note in §9 covers this.

---

## Status: QA_FAILED (judgment failure 1 of 2 — see Attempt 2 below)

---

## Attempt 2 — Layout regression fix

### QA diagnosis verification

QA's description of the failing code matched the actual source exactly:

**`ClaudeSettingsPanel.module.css:4-12` (pre-fix):**
```css
.shell {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background: var(--surface-cream);   /* cream — makes the content boundary visible */
  color: var(--ink);
  border: var(--border-panel-strong);
}
```
`flex: 1` was present, `height` property was absent. Confirmed.

**`tokens.css:212-218`:** `html, body, #root { height: 100%; overflow: hidden; }` — all three nodes in the chain carry `height: 100%`. No `display: flex` on `#root`. `#root` is a block container. Chain is unbroken; the simple fix is sufficient. Confirmed.

**`App.tsx:28`:** `{surface === "settings" ? <ClaudeSettingsPanel /> : <LandingPage />}` inside a React Fragment. No intervening flex container. The `.shell` div's direct CSS parent is `#root` (block layout, not flex). Confirmed.

QA's diagnosis is fully accurate. The `height: 100%` fix is the correct and sufficient remediation.

### Single-line CSS change applied

**File:** `src/panels/claude-settings/ClaudeSettingsPanel.module.css`
**Line:** 9 (inserted between `min-height: 0;` and `background:`)

Before:
```css
.shell {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background: var(--surface-cream);
  color: var(--ink);
  border: var(--border-panel-strong);
}
```

After:
```css
.shell {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
  background: var(--surface-cream);
  color: var(--ink);
  border: var(--border-panel-strong);
}
```

### Mechanical self-verification

| Check | Result |
|---|---|
| **Typecheck** | ✅ Pass — `npx tsc --noEmit` exits 0 |
| **Build** | ✅ Pass — `npm run build` exits 0; CSS bundle: 53.02 kB (negligible delta from +1 CSS property) |
| **Existing test suite** | ✅ Pass — `npm run test:run` 87/87 pass, zero regressions |
| **Compiled CSS inspection** | ✅ `height: 100%` appears in built `out/renderer/assets/index-CZA-q3iD.css` (confirmed via grep) |

### Visual verification

As a CLI agent, direct browser visual inspection is not possible. What was verified:

1. **Source CSS:** `height: 100%` is present at `ClaudeSettingsPanel.module.css:9` — confirmed via file read post-edit.
2. **Compiled output:** `grep -o "[^;{]*height[^;]*" ... | grep 100` returns `height: 100%` entries in the built CSS bundle, confirming the property is not stripped by the minifier.
3. **Layout reasoning:** With `#root { height: 100% }` (inherited from `html`/`body` which also have `height: 100%` per `tokens.css:212-218`), a block child declaring `height: 100%` will fill the full viewport. The `.tabBody { overflow-y: auto; flex: 1; min-height: 0; }` internal scroll mechanism is unchanged — `.shell` being taller does not suppress `.tabBody` scroll because `.shell` is a flex column container and `.tabBody` has `flex: 1` + `min-height: 0` to participate in that flex layout correctly.
4. **Landing page isolation:** `App.tsx:28` conditionally renders either `<ClaudeSettingsPanel />` or `<LandingPage />`. The `.shell` class is scoped to `ClaudeSettingsPanel.module.css` and only applied within `ClaudeSettingsPanel.tsx`. The landing page route is unaffected.

**Honest limitation:** User smoke-test of the dev server is required to confirm the cream panel fills the viewport on all 9 settings tabs and that `.tabBody` scroll still functions on tall-content tabs (Env, Permissions). The compiled CSS and layout reasoning both support correct behavior.

### Scope confirmation

Only `src/panels/claude-settings/ClaudeSettingsPanel.module.css` was modified in Attempt 2 (one-line addition). Confirmed via `git diff --name-only` — the other four files in the diff (`HooksTab.tsx`, `PermissionsTab.tsx`, `tokens.css`, `phase-state.json`) are Attempt 1 working-tree changes, untouched by this attempt.

---

## Status: READY_FOR_QA (Attempt 2)
