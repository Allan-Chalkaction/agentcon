# Phase 4 Exploration

## 1. PRD Lock Confirmation

**LOCKED line (from §11 Final Consensus Lock block):**
> "PRD locked at 2026-05-05 (CTO final lock block). … No blocking objections survive."

Sign-off ledger confirms all four required sign-offs are present (CTO Round 1, CTO Round 2, Architect Acknowledgement R2, PM Round 2). The LOCKED section header reads: `## Consensus Status: LOCKED — 2026-05-05`.

**Phase 3 status:** `phase-state.json` confirms Phase 3 is `REVIEWER_PASSED`. Phase 3 build summary at `builds/phase-03-attempt-1.md` exists. Git commit referenced in prompt: `2bc061f`. Phase 3 carried the dev-switch re-theme + `:focus-visible`/`::selection` flips to `--accent-red*`.

**Phase 4 judgment-attempt counter:** 0/2.

---

## 2. Phase 4 File List (from PRD §9 Phase 4)

Exactly from PRD §9 Phase 4 "Files to touch (≤5)":

1. `src/panels/claude-settings/ClaudeSettingsPanel.module.css` — MODIFY — full content-token rewrite, `--border-panel-strong` applied to enumerated panels, tab-title typography, chip class names + treatment, empty-state border, alert treatment, ALL `--accent-primary*` refs replaced
2. `src/panels/claude-settings/HooksTab.tsx` — MODIFY (minor) — lifecycle-chip JSX class swap `railItemActive`/`railItem` → `chipSelected`/`chip`; empty-state container gets `emptyState` class; inline style token renames
3. `src/panels/claude-settings/ClaudeSettingsPanel.tsx` — MODIFY (minor) — any inline style references; verify `errorBanner` uses alert tokens via CSS class
4. (Optionally) one of `AgentsTab.tsx`, `ScopeSwitcher.tsx`, `EnvTab.tsx`, `PermissionsTab.tsx` — if they have inline style props referencing `--accent-primary` — confirmed via grep: **PermissionsTab.tsx** has two references to `--accent-primary`
5. `src/styles/tokens.css` — MODIFY — DELETE `--accent-primary`, `--accent-primary-hover`, `--accent-primary-bg` definitions (lines 62-64)

**Total: 5 files** (within the ≤5 cap). PermissionsTab.tsx replaces the "(optionally) one of" slot.

---

## 3. Phase 4 AC List (from PRD §9 Phase 4)

Exactly from PRD §9 Phase 4 "AC covered":

- **AC-005** — zero `--accent-primary` refs after this phase (token removal)
- **AC-006** — `--border-panel-strong` consumer assertion (width, style, color)
- **AC-007** — contrast ≥3.0:1 between border-panel-strong-color and surface-cream
- **AC-008** — `--border-panel-strong` applied to all six panel categories
- **AC-009** — chip default-state border uses chip token / border-panel-strong
- **AC-015** — tab section titles: font-mono, font-style normal, font-weight 500, font-size --text-md
- **AC-016** — no element with tab-section-title role carries font-family resolving to --font-display
- **AC-017** — selection signal on clicked chip: CSS class `chipSelected`
- **AC-018** — selected chip: background/border/color from chip-selected tokens
- **AC-019** — unselected chip: background/border/color from chip-default tokens
- **AC-020** — selected chip: color vs background contrast ≥4.5:1
- **AC-021** — unselected chip: color vs background contrast ≥4.5:1
- **AC-022** — single-select: clicking chip removes selection from previously-selected chip
- **AC-023** — empty-state border-style = solid (not dashed)
- **AC-024** — empty-state border-color = `--empty-state-border-color`, border-width = 1.5px
- **AC-025** — empty-state border contrast vs cream: 1.5:1–3.0:1 (inclusive)
- **AC-043** — alert/error: background/border/color from alert tokens; contrast ≥4.5:1
- **AC-044** — alert/error container border = `--border-panel-strong` width + color
- **AC-053** — chrome/content split: body resolves to dark, content panel resolves to cream/ink

Total: **19 ACs** (matches PRD §11 AC↔phase coverage locked table).

---

## 4. Existing Settings Panel Enumeration

**Glob result** — `src/panels/claude-settings/`:

| File | Lines | Summary |
|------|-------|---------|
| `AgentsTab.tsx` | 471 | Renders agent config list; reads agents array from settings; edit/add/remove agents. Imports styles from shared module. Has inline style `var(--text-xs)`, `var(--text-muted)` — chrome tokens, unchanged by Phase 4. |
| `ClaudeMdTab.tsx` | 191 | Renders Monaco editor for CLAUDE.md content. Uses `tabBodyMonaco` + `monacoFrame` classes. No inline `--accent-primary` references. |
| `ClaudeSettingsPanel.module.css` | 480 | The single shared CSS module. All 12 components import from this file. Full rewrite needed. |
| `ClaudeSettingsPanel.tsx` | 242 | Entry component. Renders ScopeSwitcher + rail nav + SurfaceView. Uses `errorBanner` class for init/scope errors. Inline style at line 157: `fontSize: "var(--text-xs)"` — chrome token, safe. |
| `CommandsTab.tsx` | 320 | Renders allowed/denied commands in a list with edit/add/remove. Uses `itemRow`, `itemList`, `formInput`, `button` classes. No inline `--accent-primary`. |
| `EnvTab.tsx` | 245 | Renders environment variable key/value pairs. Uses `formField`, `ruleInput`, `button` classes. No inline `--accent-primary`. |
| `HooksTab.tsx` | 668 | Heaviest component. Renders lifecycle event chip bar, hook groups list with MatcherInput + HookEntryEditor, presets section. Uses `railItemActive`/`railItem` for chips (MUST change to `chipSelected`/`chip`). Empty-state at line 171-174 uses `itemDescription` class (needs dedicated `emptyState` class or inline border treatment). |
| `PermissionsTab.tsx` | 555 | Renders permission rules (allow/ask/deny buckets). Has inline `style={{ cursor: "pointer", color: "var(--accent-primary)" }}` at line 445 and `BUCKET_META.ask.color = "var(--accent-primary)"` at line 26. BOTH must change to `var(--accent-red)`. |
| `PluginsTab.tsx` | 304 | Renders plugin list from settings. Uses `itemRow`, `button` classes. No inline `--accent-primary`. |
| `RawJsonTab.tsx` | 94 | Renders raw JSON editor (Monaco). Uses `tabBodyMonaco` + `monacoFrame`. No inline `--accent-primary`. |
| `ScaffoldBanner.tsx` | 89 | Renders scaffold banner when project settings don't exist. Uses `errorBanner` class. No inline `--accent-primary`. |
| `ScopeSwitcher.tsx` | 108 | Renders user/project/local scope tabs plus project folder picker. Uses `scopeTab`, `scopeTabActive`, `scopeBar` classes. One inline style: `style={{ color: "var(--text-muted)" }}` on hint text — chrome token, safe. No inline `--accent-primary`. |
| `SkillsTab.tsx` | 466 | Renders skills list from filesystem. Uses `itemRow`, `itemList`, `splitList`, `splitDetail` classes. No inline `--accent-primary`. |

**Confirmed count: 12 .tsx files + 1 shared .module.css = 13 files total.** Matches ADR D3 enumeration.

---

## 5. Surface-to-Treatment Mapping

### Panel Shell (`.shell`)
- **Pre-migration:** `background: var(--bg-base)` — dark canvas. No border.
- **Post-migration:** `background: var(--surface-cream); color: var(--ink); border: var(--border-panel-strong);`
- **Token change:** `--bg-base` → `--surface-cream` + `--ink` + `--border-panel-strong`

### Scope Bar (`.scopeBar`)
- **Pre-migration:** `background: var(--bg-base); border-bottom: var(--border-width) solid var(--border-default);`
- **Post-migration:** `background: var(--surface-cream); border-bottom: var(--border-panel-strong);` — same cream surface, panel-strong separator
- **Token change:** drop `--bg-base`, add `--surface-cream`; border uses `--border-panel-strong`

### Scope Tab Active (`.scopeTabActive`)
- **Pre-migration:** `background: var(--bg-elevated); border-color: var(--accent-primary);`
- **Post-migration:** `background: var(--surface-cream-soft); border-color: var(--border-panel-strong-color);`
- **Token change:** `--bg-elevated` → `--surface-cream-soft`; `--accent-primary` → `--border-panel-strong-color`

### Scope Tab Default (`.scopeTab`)
- **Pre-migration:** `background: transparent; border: solid transparent;`
- **Post-migration:** same transparent pattern, hover uses `--surface-cream-soft` instead of `--bg-elevated`

### Scope Tab Text
- `.scopeTabLabel`: `color: var(--text-primary)` → `color: var(--ink)`
- `.scopeTabHint`: `color: var(--text-muted)` → `color: var(--ink-soft)` (or retain `--text-muted`; ADR says content panels override — using `--ink-soft` for semantic alignment)
- `.scopeMeta*`: `color: var(--text-muted)` → `color: var(--ink-faint)`; `color: var(--text-secondary)` → `color: var(--ink-soft)`

### Rail Nav (`.rail`, `.railItem`, `.railItemActive`)
- **Pre-migration:** Dark chrome; `background: var(--bg-elevated)` for active, `--bg-elevated` for hover.
- **Post-migration:** These are the LEFT NAV rail — they sit within the panel so they get cream treatment. `.railItemActive: background: var(--surface-cream-soft); color: var(--ink); font-weight: var(--weight-medium);` `.railItem:hover: background: var(--surface-cream-soft); color: var(--ink);`
- **CRITICAL NOTE:** The `railItem`/`railItemActive` classes are ALSO used by lifecycle chips in HooksTab.tsx (line 145). PRD §9 Phase 4 explicitly says "Do NOT remove the existing `.railItem`/`.railItemActive` classes — they're still used by the rail (left-side tab navigation). Only the lifecycle-event chip JSX gets new classes." So rail classes remain; chip JSX gets `chip`/`chipSelected`.

### Tab Header (`.tabHeader`)
- **Pre-migration:** `border-bottom: var(--border-width) solid var(--border-default);`
- **Post-migration:** `border-bottom: var(--border-panel-strong);` — consistent panel-strong separator
- Background inherits cream from `.shell`

### Tab Title (`.tabTitle`) — MOCKUP ISSUE #1
- **Pre-migration:** `font-size: var(--text-md); font-weight: var(--weight-semibold); color: var(--text-primary);` (implicitly uses body font = `--font-sans`, not explicitly set)
- **Post-migration:** `font-family: var(--font-mono); font-style: normal; font-weight: 500; font-size: var(--text-md); text-transform: uppercase; letter-spacing: 0.04em; color: var(--ink);`
- **AC binding:** AC-015 (mono family, normal style, weight 500, size 14px), AC-016 (no serif on tab titles)

### Tab Subtitle (`.tabSubtitle`)
- **Pre-migration:** `color: var(--text-muted);`
- **Post-migration:** `color: var(--ink-faint);`

### Tab Body (`.tabBody`)
- Inherits cream background. Keep `overflow-y: auto` per ADR D11.

### Primary Button (`.button`)
- **Pre-migration:** `background: var(--accent-primary); color: var(--text-inverse);`
- **Post-migration:** `background: var(--accent-red); color: var(--surface-cream);` — cream text on red (AC-005 binding)
- **Hover:** `background: var(--accent-red-hover);`

### Secondary Button (`.buttonSecondary`)
- **Pre-migration:** `background: var(--bg-elevated); border: var(--border-width) solid var(--border-default);`
- **Post-migration:** `background: var(--surface-cream-soft); border: var(--border-panel-strong);`

### Danger Button (`.buttonDanger`)
- Keep `color: var(--color-danger)`. No `--accent-primary` involved. Possibly add hover in cream context.

### Form Input (`.formInput`, `.ruleInput`)
- **Pre-migration:** `background: var(--bg-input); border: solid var(--border-default); color: var(--text-primary);`
- **Post-migration:** `background: var(--surface-cream-soft); border: var(--border-panel-strong); color: var(--ink);`
- **Focus state:** `.formInput:focus { border-color: var(--accent-red); }` (replacing `--accent-primary`)
- `.ruleInput:focus { border-color: var(--accent-red); }`

### Form Label (`.formLabel`)
- **Pre-migration:** `color: var(--text-muted);`
- **Post-migration:** `color: var(--ink-faint);`

### Form Hint (`.formHint`)
- **Pre-migration:** `color: var(--text-muted);`
- **Post-migration:** `color: var(--ink-faint);`

### Error Banner / Alert (`.errorBanner`) — AC-043, AC-044
- **Pre-migration:** `color: var(--color-danger); background: rgba(248,113,113,0.08); border-radius only.`
- **Post-migration (AC-044 binds `--border-panel-strong`):** `background: var(--alert-bg); color: var(--alert-text); border: var(--border-panel-strong); border-color: var(--alert-border); border-radius: var(--radius-md);`
- **Resolved values:** `--alert-bg: #f7e8d6`; `--alert-text: #7a2418`; `--alert-border: var(--border-panel-strong-color)` = `#8a7a4a`

### Item Row (`.itemRow`) — project-scope cards + preset cards
- **Pre-migration:** `background: var(--bg-elevated); border: solid var(--border-default); cursor: pointer;`
- **Post-migration (AC-008 — panel gets `--border-panel-strong`):** `background: var(--surface-cream-soft); border: var(--border-panel-strong); cursor: pointer;`
- **Hover:** `border-color: var(--border-panel-strong-color);` (replacing `--accent-primary`)

### Item Row Selected (`.itemRowSelected`)
- **Pre-migration:** `border-color: var(--accent-primary); background: var(--bg-input);`
- **Post-migration:** `border-color: var(--border-panel-strong-color); background: var(--surface-cream);`

### Item Text
- `.itemTitle`: `color: var(--text-primary)` → `color: var(--ink)`
- `.itemMeta`: `color: var(--text-muted)` → `color: var(--ink-faint)`
- `.itemDescription`: `color: var(--text-secondary)` → `color: var(--ink-soft)`

### Lifecycle Chips — MOCKUP ISSUE #2 (AC-009, AC-017–AC-022)
- **Pre-migration:** Uses `railItemActive`/`railItem` classes on HooksTab.tsx line 145
- **Post-migration:** New classes `chipSelected`/`chip` with:
  - `.chip` (default): `background: var(--chip-bg-default); border: var(--border-panel-strong); color: var(--chip-text-default); border-radius: var(--radius-sm); padding: 4px 10px; cursor: pointer;` (AC-009 satisfies chip default border)
  - `.chipSelected` (selected): `background: var(--chip-bg-selected); border-color: var(--chip-border-selected); color: var(--chip-text-selected);`
- **AC-017:** CSS-class form, locked class name `chipSelected`
- **AC-022:** Single-select preserved — `onClick={() => setEvent(e.id)}` replaces old event (unchanged functional logic)

### Chip Group Container
- **AC-008 binding:** The container `<div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>` that wraps lifecycle chips needs `--border-panel-strong`. Will add a CSS class `chipGroup` to give it the architectural border treatment.

### Empty-State Container — MOCKUP ISSUE #3 (AC-023–AC-025)
- **Pre-migration:** HooksTab line 171-174 uses `itemDescription` class — `color: var(--text-secondary); font-size: var(--text-sm)`. No border treatment.
- **Post-migration:** Need dedicated `emptyState` class (or inline border on the wrapping container). PRD says Builder evaluates. Will add a new class `hookEmptyState` in the CSS module applied to the empty-state `<div>`. Treatment: `border-style: solid; border-width: 1.5px; border-color: var(--empty-state-border-color); padding: var(--space-4); color: var(--ink-soft);`
- **AC-023:** `border-style: solid` (not dashed)
- **AC-024:** `border-color: var(--empty-state-border-color)` (#bfb59a); `border-width: 1.5px`
- **AC-025:** Contrast #bfb59a vs #f1ead8 ≈ 1.71:1 (within 1.5–3.0 range per ADR D7 Addendum A)

### Tab Body Monaco (`.tabBodyMonaco`)
- No color tokens; structural only. Keep as-is.

### Monaco Frame (`.monacoFrame`)
- No color tokens. Keep as-is.

### Dividers in Split View (`.splitList`, `.splitDetail`)
- `.splitList: border-right: solid var(--border-default)` → `border-right: var(--border-panel-strong)` for cream-side consistency.

### Rule List Group and Title (`.ruleListGroup`, `.ruleListTitle`)
- `.ruleListTitle`: `color: var(--text-primary)` → `color: var(--ink)`
- `.ruleListBadge`: `color: var(--text-muted)` → `color: var(--ink-faint)`

### Icon Button (`.iconButton`)
- `color: var(--text-muted)` → `color: var(--ink-faint)`
- `:hover: background: var(--bg-elevated)` → `background: var(--surface-cream-soft)`

### Status Line (`.statusLine`)
- `color: var(--text-muted)` → `color: var(--ink-faint)`

### Saved Flash (`.savedFlash`)
- `color: var(--color-success)` — keep (semantic state color, not renamed)

---

## 6. The Four Mockup-Issue Resolutions

### Issue 1: Tab Titles → Mono Not Serif Italic (AC-015, AC-016)
- **File rendering tab titles:** `ClaudeSettingsPanel.module.css` → `.tabTitle` rule; plus `.ruleListTitle` in HooksTab context
- **Current treatment:** `.tabTitle { font-size: var(--text-md); font-weight: var(--weight-semibold); color: var(--text-primary); }` — implicitly inherits `body` font-family (`--font-sans`), not serif
- **New treatment per ADR D12 / §8.12:** `font-family: var(--font-mono); font-style: normal; font-weight: 500; font-size: var(--text-md); text-transform: uppercase; letter-spacing: 0.04em; color: var(--ink);`
- **AC-015 binds:** `font-family = JetBrains Mono stack`, `font-style = normal`, `font-weight = 500`, `font-size = 14px (var(--text-md))`
- **AC-016 binds:** zero elements with tab-section-title role carry `font-family` resolving to `--font-display` (EB Garamond)

### Issue 2: Lifecycle Chip Selection State (AC-009, AC-017–AC-022)
- **File rendering chips:** `HooksTab.tsx` lines 135-164 (chip loop) and `ClaudeSettingsPanel.module.css` (new `.chip`/`.chipSelected` classes)
- **Current treatment:** `event === e.id ? styles.railItemActive : styles.railItem` at HooksTab.tsx:145
- **New treatment per ADR D13 / §8.12:** JSX swap to `event === e.id ? styles.chipSelected : styles.chip`
- **New CSS classes:**
  - `.chip { background: var(--chip-bg-default); border: var(--border-panel-strong); color: var(--chip-text-default); border-radius: var(--radius-sm); padding: 4px 10px; cursor: pointer; }`
  - `.chipSelected { background: var(--chip-bg-selected); border-color: var(--chip-border-selected); color: var(--chip-text-selected); }`
- **AC-017 binds:** CSS class form, locked class name `chipSelected`
- **AC-022 binds:** single-select preserved (existing `setEvent(e.id)` logic unchanged)
- **Note:** `railItemActive`/`railItem` CSS classes remain in `.module.css` for the left rail nav (MatcherInput "Common"/"Custom" buttons also use them); chip JSX only gets the new class names

### Issue 3: Dashed Empty-State Border (AC-023, AC-024, AC-025)
- **File rendering empty-state:** `HooksTab.tsx` lines 171-174; `ClaudeSettingsPanel.module.css` (new `.hookEmptyState` class)
- **Current treatment:** `<div className={styles.itemDescription}>No hooks configured for...</div>` — no border
- **New treatment per ADR D8 / §8.12:** New CSS class `hookEmptyState` replacing `itemDescription` for the empty-state `<div>`. Border: `border-style: solid; border-width: 1.5px; border-color: var(--empty-state-border-color); padding: var(--space-4); color: var(--ink-soft); border-radius: var(--radius-sm);`
- **AC-023 binds:** `border-style: solid` (primary branch, not dashed)
- **AC-024 binds:** `border-color: var(--empty-state-border-color)` (#bfb59a); `border-width: 1.5px`
- **AC-025 binds:** #bfb59a vs #f1ead8 contrast ≈ 1.71:1 (within 1.5–3.0 inclusive)

### Issue 4: Dev-Switch Contrast
- **Already handled in Phase 3** (committed at `2bc061f`). Phase 4 does NOT touch `App.tsx` or `App.module.css`.
- **Verification:** `dev-switch.test.tsx` exists and passes. Tokens `--accent-red` and `--accent-red-bg` used in `tokens.css` are safe.
- **No Phase 4 work regresses it** — Phase 4 touches only settings CSS + settings TSX + tokens.css (only removing lines 62-64). `App.tsx`/`App.module.css` untouched.

---

## 7. `--accent-primary*` Token Removal Plan

### Current consumers (from grep):

**`src/panels/claude-settings/ClaudeSettingsPanel.module.css`:**
- Line 49: `.scopeTabActive { border-color: var(--accent-primary); }` → `var(--border-panel-strong-color)`
- Line 207: `.button { background: var(--accent-primary); }` → `var(--accent-red)`
- Line 215: `.button:hover { background: var(--accent-primary-hover); }` → `var(--accent-red-hover)`
- Line 300: `.itemRow:hover { border-color: var(--accent-primary); }` → `var(--border-panel-strong-color)`
- Line 304: `.itemRowSelected { border-color: var(--accent-primary); }` → `var(--border-panel-strong-color)`
- Line 357: `.formInput:focus { border-color: var(--accent-primary); }` → `var(--accent-red)`
- Line 392: `.ruleInput:focus { border-color: var(--accent-primary); }` → `var(--accent-red)`

**`src/panels/claude-settings/PermissionsTab.tsx`:**
- Line 26: `BUCKET_META.ask.color = "var(--accent-primary)"` → `"var(--accent-red)"`
- Line 445: inline `style={{ cursor: "pointer", color: "var(--accent-primary)" }}` → `"var(--accent-red)"`

**`src/styles/tokens.css`:**
- Lines 62-64: `--accent-primary`, `--accent-primary-hover`, `--accent-primary-bg` **DEFINITIONS** → DELETE these three lines

**No other consumers in `src/`.** No consumers in landing, App.tsx, or test files.

### Post-migration verification:
After migration: `grep -rn "\-\-accent-primary" src/` should return zero matches.

### Removal order (atomic):
1. Rewrite all consumers in `ClaudeSettingsPanel.module.css` (new token references)
2. Rewrite inline styles in `PermissionsTab.tsx`
3. Remove definitions from `tokens.css` lines 62-64
4. All in one commit (CONS-17 atomic discipline)

---

## 8. Functional Regression Test Plan

Phase 4 does NOT own the functional regression test files — per PRD §9, those are Phase 5 deliverables (`tests/settings-regression.test.tsx`). Phase 4's "Completion criteria" explicitly states: "Phase 5's tests are NOT required to pass yet — they get added in Phase 5."

**However**, Phase 4 owns the CSS/TSX changes that AC-053 partially depends on (`.shell` cream override). The test for AC-053 is in Phase 5.

**What Phase 4 does produce (per PRD §9 Phase 4 "AC covered"):**
- CSS/TSX implementation satisfying AC-005, AC-006, AC-007, AC-008, AC-009, AC-015–AC-025, AC-043, AC-044, AC-053
- These ACs will be exercised by tests written in Phase 5

**Phase 4 test posture:** The existing test suite (`npm run test:run`) must still pass at Phase 4 exit. No settings-regression tests are required. Phase 4 does not produce new test files.

**D17 / CONS-21 compliance for Phase 4:**
- Phase 4 produces no new test files (tests are Phase 5)
- Any visual AC assertions will use Direction 1 (`getPropertyValue('--token-name')`) when written in Phase 5
- No Direction 2 assertions will be used

**IPC mock seam (D5):** Not required for Phase 4's own deliverables. Phase 5 will use `installAgentconMock()`.

---

## 9. Anti-Patterns / Hard Rules (from PRD §9 Phase 4)

1. **Settings functionality unchanged.** Every load/edit/save/tab-switch/Hooks-CRUD/presets-apply/alerts flow must work identically. This is CSS + minor JSX class-name work only.
2. Do NOT modify `claudeConfigStore.ts`.
3. Do NOT modify Phase 0 test infrastructure (`vitest.config.ts`, `tests/setup.ts`, `tests/mocks/agentconMock.ts`, `tsconfig.test.json`).
4. Do NOT modify Phase 0.5 fixture files (immutable per ADR D9).
5. Do NOT modify `tokens.css` content-token values — only DELETE the three `--accent-primary*` definitions.
6. Do NOT touch landing source code (`src/panels/landing/`).
7. Do NOT touch `App.tsx` / `App.module.css` (Phase 3 territory).
8. Do NOT introduce `--lp-*` references anywhere (CONS-13 / AC-001 ongoing).
9. Do NOT introduce a separate ChipGroup component (JSX-className-level only).
10. Do NOT make lifecycle chips multi-select (AC-022 = single-select per D10).
11. Do NOT remove `railItem`/`railItemActive` classes — they serve the left rail nav and MatcherInput.
12. Do NOT auto-save on preset click (AC-040 = open-editor branch per D10).

---

## 10. Consensus Ledger Items Applicable to Phase 4

- **CONS-13** (AC-013 disjunction): Phase 3 already handles this via dev-switch test. Phase 4 doesn't touch AC-013.
- **CONS-14** (`landing-root` plain string): Not relevant — landing untouched.
- **CONS-15** (preserve `useEffect` reset semantics at `HooksTab.tsx:36-39`): Phase 4's JSX changes are class-name swaps only; `useEffect` dependency array is NOT touched.
- **CONS-16** (`--accent-primary` grep at Phase 4 exit): Will run `grep -rn "\-\-accent-primary" src/` after all changes and verify zero matches.
- **CONS-17** (single-commit/squash discipline): Phase 4 delivered as one atomic change-set.
- **CONS-22** (settings panel JetBrains Mono flip is intentional): Accepted per migration thesis. Phase 4 makes this change via `.tabTitle { font-family: var(--font-mono) }`.
- **CONS-23** (AC-028 IPC-binding): Phase 5 concern. Phase 4 doesn't write the assert leg.

---

## 11. Mid-Phase Shippability and Atomic-Commit Discipline

Per CONS-17, Phase 4 lands as one commit. Planned execution sequence:

1. **Rewrite `ClaudeSettingsPanel.module.css`** — full content-token pass, including:
   - Panel shell → cream surface (`--surface-cream`)
   - All chrome token replacements (`--bg-*` → `--surface-cream*`, `--text-*` → `--ink*`)
   - `--border-panel-strong` applied to 6 panel categories (AC-008)
   - Tab title typography (AC-015, AC-016)
   - New `.chip`/`.chipSelected` classes (AC-009, AC-017–AC-022)
   - New `.hookEmptyState` class (AC-023–AC-025)
   - Alert/error banner treatment (AC-043, AC-044)
   - All `--accent-primary*` → `--accent-red*` / `--border-panel-strong-color` replacements
2. **Modify `HooksTab.tsx`** — lifecycle-chip JSX class swap + empty-state class change
3. **Modify `ClaudeSettingsPanel.tsx`** — verify `errorBanner` still works (no JSX change needed; CSS class change in step 1 handles it)
4. **Modify `PermissionsTab.tsx`** — inline style `--accent-primary` → `--accent-red` (2 sites)
5. **Modify `tokens.css`** — DELETE `--accent-primary*` definitions (lines 62-64)
6. **Verify AC-005 grep:** `grep -rn "\-\-accent-primary" src/` returns zero
7. **Run typecheck + build + tests**

Each step must be done before committing — no intermediate commits.

---

## 12. D17 + D5 + Three-Witness Compliance Plan

### D17 (Direction 1 only) for Phase 4:
Phase 4 produces no new test files. Phase 5 will write all test files. This compliance note is forward-looking for Phase 5.

### D5 (IPC mock seam) for Phase 4:
No new tests in Phase 4; the seam is inherited.

### Three-Witness for contrast-bound ACs (Phase 4 build summary will include):
Phase 4's AC-043 introduces the alert contrast claim (#7a2418 on #f7e8d6). Per ADR D7, the Architect computed ≈8.4:1. Build summary will independently verify with the WCAG formula:

**Three-witness computation plan for AC-043 (`--alert-text` on `--alert-bg`):**
- `--alert-text`: `#7a2418` → R=122, G=36, B=24
  - r_lin = (122/255)^2.4/1.055+0.055/1.055 → using IEC 61966-2-1 formula
  - Compute in Build Summary
- `--alert-bg`: `#f7e8d6` → R=247, G=232, B=214
  - Compute in Build Summary
- Expected result ≈ 8.4:1 ≥ 4.5:1 (AC-043)

**Three-witness computation plan for AC-020 (selected chip: `--chip-text-selected` = `--surface-cream` on `--chip-bg-selected` = `--ink`):**
- Already computed by Architect in ADR D7: ≈14.8:1. Builder will verify in Build Summary.

**Three-witness computation plan for AC-021 (unselected chip: `--chip-text-default` = `--ink-soft` on `--chip-bg-default` = `--surface-cream-soft`):**
- Already computed by Architect in ADR D7: ≈6.8:1. Builder will verify in Build Summary.

---

## Summary: Phase 4 is Well-Scoped and Ready for Implementation

- 5 files to touch (at the ≤5 cap; justified by PermissionsTab.tsx inline style residue)
- 1 CSS module rewrite (the dominant work)
- 3 minor TSX files (class-name swaps + inline style updates)
- 1 token deletion (3 lines from tokens.css)
- No new test files (Phase 5 owns those)
- No architectural deviations identified
- All four mockup-issue resolutions locked to specific ADR decisions
- Execution order planned for atomic delivery per CONS-17
