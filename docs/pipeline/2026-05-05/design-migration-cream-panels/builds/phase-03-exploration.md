# Phase 3 Exploration

## 1. PRD Lock Confirmation

PRD status line (from file): `**Status:** DRAFT`

Note: The PRD header says DRAFT but Section 11 must show LOCKED. Checking Section 11...

Section 11 Final Consensus Lock (from file read): The PRD contains "PRD locked:" at the consensus ledger section. The phase-state.json confirms all prior phases are REVIEWER_PASSED:
- Phase 0: REVIEWER_PASSED
- Phase 0.5: REVIEWER_PASSED
- Phase 1: REVIEWER_PASSED
- Phase 2: REVIEWER_PASSED
- Phase 3: PENDING (active — ready to execute)

Phase 2 closed cleanly (REVIEWER_PASSED). Phase 3 judgment-attempt counter: 0/2.

**IMPORTANT CLARIFICATION on Phase 3 scope:** The user prompt describes Phase 3 as "settings panel cream-migration + dev-switch re-theme + --accent-primary flip + 4 mockup-issue resolutions + functional regression tests." However, reading PRD §9 Phase 3 verbatim shows Phase 3 is SPECIFICALLY and ONLY:

- Dev-switch button re-themed (App.tsx)
- AC covered: AC-010, AC-011, AC-012, AC-013, AC-014. Globals: `:focus-visible` re-points to `--accent-red` here.
- Files to touch (3): `src/App.tsx`, `src/App.module.css` (NEW), `src/styles/tokens.css`

The settings panel re-theme is Phase 4. The functional regression tests are Phase 5. The user prompt describes a different (larger) scope than what the locked PRD §9 specifies. Per agent rules, the PRD is the contract. I execute Phase 3 as written in §9.

## 2. Phase 3 File List (from PRD §9)

Exactly 3 files per PRD §9 Phase 3 "Files to touch (3)":

1. `src/App.tsx` — MODIFY: replace inline `style={{...}}` with `className={styles.devSwitch}`; add `import styles from "./App.module.css"`.
2. `src/App.module.css` — NEW: `.devSwitch` class consuming tokens per ADR D14.
3. `src/styles/tokens.css` — MODIFY: `:focus-visible` outline-color flips from `var(--accent-primary)` to `var(--accent-red)`; `::selection` background flips from `var(--accent-primary-bg)` to `var(--accent-red-bg)`.

Additional (from PRD §9 completion criteria): A test file asserting AC-010 through AC-014.
- `tests/dev-switch.test.tsx` — NEW (per PRD §9 completion criteria, `tests/landing-regression.test.tsx` or new `tests/dev-switch.test.tsx`).

Total: 3 source files + 1 test file.

## 3. Phase 3 AC List (from PRD §9)

Per PRD §9 Phase 3 "AC covered: AC-010, AC-011, AC-012, AC-013, AC-014":

- **AC-010:** No inline hex literals in `App.tsx` dev-switch button; `background-color`, `color`, `border-color` resolve to specific tokens (no `#1a1c19`, `#d8d2bf`, `#4a4742`). Test asserts no inline hex.
- **AC-011:** Contrast between dev-switch button `color` and `background-color` ≥4.5:1 on landing surface.
- **AC-012:** Contrast between dev-switch button `background-color` and surrounding landing surface (`--surface-cream`) ≥3.0:1.
- **AC-013:** On settings surface: contrast between dev-switch `color` and `background-color` ≥4.5:1 AND button discernible from settings chrome. Per ADR D14, AC-013's "background vs surround" clause binds to disjunction (a OR b): either `background-color` contrasts ≥3:1 with surround, OR `border-color` contrasts ≥3:1 with surround.
- **AC-014:** `src/App.tsx` source has no hex color literals in inline `style` prop.

Also: `:focus-visible` global (tokens.css:261) flips to `--accent-red` (ADR D11 / PRD §9 notes).
Also: `::selection` global (tokens.css:255) flips to `--accent-red-bg` (PRD §9 notes).

NOT in Phase 3: AC-005 (zero `--accent-primary` refs) — that's Phase 4 after settings CSS is migrated. The settings module still uses `--accent-primary` at this boundary; deleting it now would break Phase 3's mid-pipeline shippability.

## 4. Existing Settings Panel Enumeration

Not Phase 3's scope — included here for awareness. Phase 3 does not touch settings panel files. Settings panel migration is Phase 4.

Phase 3 touches only `src/App.tsx` (currently 55 lines), the new `src/App.module.css`, and `src/styles/tokens.css` (~285 lines post-Phase-2).

## 5. Surface-to-Treatment Mapping (Dev-Switch Only)

### Dev-Switch Button (App.tsx)

**Pre-migration treatment (current):**
```tsx
style={{
  position: "fixed", top: 8, right: 8, zIndex: 9999,
  padding: "4px 10px", fontSize: 11, fontFamily: "monospace",
  background: "#1a1c19",    // inline hex — AC-014 violation
  color: "#d8d2bf",          // inline hex
  border: "1px solid #4a4742", // inline hex
  borderRadius: 3, cursor: "pointer", opacity: 0.85,
}}
```

**Post-migration treatment (per ADR D14):**
```css
.devSwitch {
  position: fixed; top: 8px; right: 8px; z-index: 9999;
  padding: 4px 10px; font-size: 11px; font-family: var(--font-mono);
  background: var(--ink);            /* dark — discernible against cream landing */
  color: var(--surface-cream);       /* cream text on dark — readable on settings dark chrome too */
  border: 1px solid var(--surface-cream); /* hairline cream border — separates from dark chrome */
  border-radius: 3px; cursor: pointer; opacity: 0.85;
}
```

**No new tokens needed.** `--ink`, `--surface-cream`, and `--font-mono` all exist in tokens.css from Phase 1.

## 6. Four Mockup-Issue Resolutions

Phase 3 covers ONLY the dev-switch issue (resolution #4). Issues #1, #2, #3 are Phase 4.

**Dev-switch contrast (AC-010-014):**
- Problem: inline hex colors fail AC-014 and produce poor contrast
- Resolution: new `App.module.css` `.devSwitch` class with `background: var(--ink); color: var(--surface-cream); border: 1px solid var(--surface-cream);`
- WCAG verification (computed from ADR D14):
  - `--ink` #1d1c19, `--surface-cream` #f1ead8
  - text (`--surface-cream`) vs background (`--ink`): luminance(#f1ead8) ≈ 0.8250, luminance(#1d1c19) ≈ 0.0109; ratio = (0.8250+0.05)/(0.0109+0.05) = 0.8750/0.0609 ≈ 14.37:1. AC-011 ≥4.5:1 satisfied.
  - button background (`--ink` #1d1c19) vs landing surface (`--surface-cream` #f1ead8): same luminances; ratio ≈ 14.37:1. AC-012 ≥3.0:1 satisfied.
  - On settings (dark chrome): button background (`--ink` #1d1c19) vs `--bg-base` #0a0c10. luminance(#0a0c10) ≈ 0.00144. ratio = (0.0109+0.05)/(0.00144+0.05) = 0.0609/0.05144 ≈ 1.18:1. Background vs surround fails ≥3:1 — per ADR D14, border provides separation. Border (`--surface-cream` #f1ead8, luminance ≈ 0.8250) vs surround (`--bg-base` #0a0c10, luminance ≈ 0.00144): ratio ≈ (0.8250+0.05)/(0.00144+0.05) = 0.875/0.05144 ≈ 17.0:1. AC-013 binds to disjunction (a OR b); (b) satisfied.

## 7. `--accent-primary` Flip per ADR D6

**ADR D6 disposition:** `--accent-primary` is RENAMED/REPLACED. AC-005 binds to outcome (a). After Phase 4 (not Phase 3), `grep -r "--accent-primary" src/` returns zero matches.

**Phase 3 scope:** Only the two global rules in `tokens.css` that reference `--accent-primary*`:
1. `::selection { background: var(--accent-primary-bg); }` → `background: var(--accent-red-bg)`
2. `:focus-visible { outline: 2px solid var(--accent-primary); }` → `outline: 2px solid var(--accent-red)`

**`--accent-primary` is NOT deleted in Phase 3.** The token definitions remain in tokens.css because `ClaudeSettingsPanel.module.css` still references `--accent-primary` and `--accent-primary-hover` (found in Phase 4's scope). Deleting the definitions now would break the settings panel mid-pipeline, violating AC-054.

**All consumers of `--accent-primary` in `src/`:**
- `src/styles/tokens.css:255` — `::selection` background → FIXED IN PHASE 3
- `src/styles/tokens.css:261` — `:focus-visible` outline → FIXED IN PHASE 3
- `src/panels/claude-settings/ClaudeSettingsPanel.module.css:49` — `border-color: var(--accent-primary)` → Phase 4
- `src/panels/claude-settings/ClaudeSettingsPanel.module.css:207` — `background: var(--accent-primary)` → Phase 4
- `src/panels/claude-settings/ClaudeSettingsPanel.module.css:215` — `background: var(--accent-primary-hover)` → Phase 4
- `src/panels/claude-settings/ClaudeSettingsPanel.module.css:300` — `border-color: var(--accent-primary)` → Phase 4
- `src/panels/claude-settings/ClaudeSettingsPanel.module.css:304` — `border-color: var(--accent-primary)` → Phase 4
- `src/panels/claude-settings/ClaudeSettingsPanel.module.css:357` — `border-color: var(--accent-primary)` → Phase 4
- `src/panels/claude-settings/ClaudeSettingsPanel.module.css:392` — `border-color: var(--accent-primary)` → Phase 4
- `src/panels/claude-settings/PermissionsTab.tsx:26` — inline style color → Phase 4
- `src/panels/claude-settings/PermissionsTab.tsx:445` — inline style color → Phase 4

**Post-Phase-3 behavior:** `:focus-visible` and `::selection` use `--accent-red`. Settings panel buttons/inputs still reference `--accent-primary` but the token is defined; they continue to work (render with blue accent). This is the PRD-documented "acceptable transient state at Phase 3 boundary" (settings panel still CLI-dark, red focus ring reads at 3.13:1 against dark chrome per ADR D11 contrast check).

## 8. Functional Regression Test Plan

Phase 3 test file: `tests/dev-switch.test.tsx`

Per PRD §9 Phase 3 completion criteria, the test must assert AC-010 through AC-014:
- AC-010: No hex literal in `App.tsx` source (read file via fs, regex check)
- AC-011/AC-012/AC-013: Contrast computations (using ADR D17 Direction-1 pattern — `getPropertyValue('--token-name')`)
- AC-014: Source-read assertion (same as AC-010, or specifically checks no `style=` prop contains hex)

Per ADR D17: visual reads use `getPropertyValue('--token-name')` only (Direction 1). No `getComputedStyle(el).backgroundColor` etc.

Per ADR D5: IPC mock is installed globally via `tests/setup.ts` `beforeEach` — no manual mock setup needed in the dev-switch test (the dev-switch button doesn't use IPC, but the setup runs regardless).

**AC-013 disjunction binding (from ADR D14):** The test asserts (a) `bg vs surround ≥3:1` OR (b) `border vs surround ≥3:1`. A comment in the test file cross-references ADR D14.

## 9. Anti-Patterns / Hard Rules from PRD §9 Phase 3

- Do NOT keep ANY hex literal in `App.tsx` (AC-014 binds)
- Do NOT use `--accent-red` for the dev-switch border — per D14, use `--surface-cream` border on `--ink` background
- Do NOT change the `import.meta.env.DEV` gate or button's positioning/onClick semantics — visual change only
- Do NOT delete `--accent-primary` token definitions from tokens.css in Phase 3 — settings still consumes them; Phase 4 handles that
- Do NOT modify settings panel files (`ClaudeSettingsPanel.module.css`, any `.tsx` under `claude-settings/`)
- Do NOT modify Phase 0 test infrastructure (`vitest.config.ts`, `tests/setup.ts`, `tests/mocks/agentconMock.ts`)
- Do NOT modify Phase 0.5 fixture files (immutable per ADR D9)
- Do NOT touch `claudeConfigStore.ts`
- Do NOT modify the landing source code (`src/panels/landing/`)

## 10. Consensus Ledger Items Applicable to Phase 3

- **CONS-13** (no `--lp-*` definitions): Phase 2 confirmed zero; Phase 3 must not introduce any. Confirmed: no `--lp-*` in App.tsx, App.module.css, or the two tokens.css lines being changed.
- **CONS-21** (visual tests use `getPropertyValue`): The dev-switch test uses Direction 1 only.
- **CONS-22** (settings panel body monospace flip): Not relevant to Phase 3.
- **CONS-23** (AC-028 IPC-binding): Not relevant to Phase 3 (AC-028 is Phase 5).

## 11. D17 + D5 Compliance Plan

**Test files Phase 3 creates:** `tests/dev-switch.test.tsx`

**D17 compliance:** All token value reads in the test use `getComputedStyle(el).getPropertyValue('--token-name')` (Direction 1). No use of `getComputedStyle(el).color`, `getComputedStyle(el).backgroundColor`, etc.

**D5 compliance:** IPC mock is installed globally in `tests/setup.ts` beforeEach. The dev-switch test doesn't explicitly need IPC, but the global setup runs and provides a clean window.agentcon.

**AC-013 disjunction test pattern:**
```ts
// Assert AC-013 per ADR D14 disjunction (a OR b):
// (a) background vs surround contrast ≥3:1, OR
// (b) border-color vs surround contrast ≥3:1
// Verify border-color satisfies (b) since background fails on dark chrome
const borderTokenValue = /* getPropertyValue('--surface-cream') on a test element */;
// Compute luminances and assert ratio ≥3:1
```

## 12. Mid-Phase Shippability

Phase 3 is 3 source files + 1 test file. Execution order:

1. Modify `src/styles/tokens.css` — flip `::selection` and `:focus-visible` global rules
2. Create `src/App.module.css` — new `.devSwitch` class per ADR D14
3. Modify `src/App.tsx` — replace inline style with className reference; add import
4. Create `tests/dev-switch.test.tsx` — AC-010 through AC-014 assertions
5. Run typecheck + build + test:run

All changes are coherent as a unit: the CSS module must exist before App.tsx references it (typecheck). The tokens.css change is independent.

Each step is independently safe to roll back because tokens.css flips only non-settings globals, App.tsx change is purely presentational, and no settings functionality is touched.
