# QA Verdict: FAIL

**Phase:** 4 — Settings panel re-theme
**Attempt:** 1
**Date:** 2026-05-07
**Judgment failure counter (Phase 4):** 1 of 2 — routing back to Builder

---

## Verdict Summary

Phase 4 correctly implements 18 of 19 targeted ACs at the code level. However, it introduces a layout regression — the cream settings panel no longer fills the viewport — that contradicts the migration's core invariant (PRD §1, §3, §8, §9: "functionality unchanged, only visuals migrate") and the PRD §9 Phase 4 completion criterion binding to the `npm run dev` visual check. The regression was confirmed by user smoke-testing the dev server post-Phase-4.

---

## Per-AC Walk

**AC-005 — PASS.** `grep -rn "var(--accent-primary" src/` returns zero matches. All seven `.module.css` consumers replaced, two `PermissionsTab.tsx` inline styles replaced (`PermissionsTab.tsx:27,447`), three token definitions deleted from `tokens.css:62-64`. Only CSS comments remain.

**AC-006 — PASS.** `tokens.css:180`: `--border-panel-strong: 1.5px solid var(--border-panel-strong-color)`. Width 1.5px is within 1.5–2px. Style solid. `--border-panel-strong-color: #8a7a4a` is darker than `--surface-cream` #f1ead8.

**AC-007 — PASS.** #8a7a4a (L≈0.198168) vs #f1ead8 (L≈0.825043): 0.875043/0.248168 = **3.53:1** ≥ 3.0:1. Consistent with ADR D7 Addendum A three-witness record.

**AC-008 — PASS.** All six panel categories confirmed:
1. `.itemRow` (project-scope cards): `ClaudeSettingsPanel.module.css:340` — `border: var(--border-panel-strong)`.
2. `.shell` (settings-tab content panel): `ClaudeSettingsPanel.module.css:11` — `border: var(--border-panel-strong)`.
3. `.formInput` (form panels): `ClaudeSettingsPanel.module.css:395` — `border: var(--border-panel-strong)`. `.formTextarea` inherits via `composes: formInput`.
4. Preset cards (HooksTab): `HooksTab.tsx:431` — `className={styles.itemRow}`.
5. `.chipGroup` (chip group container): `ClaudeSettingsPanel.module.css:591` — `border: var(--border-panel-strong)`.
6. `.errorBanner` (alert containers): `ClaudeSettingsPanel.module.css:320` — `border: var(--border-panel-strong)`.

**AC-009 — PASS.** `.chip { border: var(--border-panel-strong); }` — `ClaudeSettingsPanel.module.css:558`.

**AC-015 — PASS.** `ClaudeSettingsPanel.module.css:171-175`: `font-family: var(--font-mono); font-style: normal; font-weight: 500; font-size: var(--text-md);` — all four properties match.

**AC-016 — PASS.** `.tabTitle` uses exclusively `var(--font-mono)`. No `--font-display` reference in the module.

**AC-017 — PASS.** `HooksTab.tsx:147`: `event === e.id ? styles.chipSelected : styles.chip`. Locked class name `chipSelected` per ADR D13 / §8.9.

**AC-018 — PASS.** `ClaudeSettingsPanel.module.css:574-577`: `background: var(--chip-bg-selected); border-color: var(--chip-border-selected); color: var(--chip-text-selected);` Resolves to `--ink`/`--ink`/`--surface-cream` per `tokens.css:189-191`.

**AC-019 — PASS.** `ClaudeSettingsPanel.module.css:557-559`: `background: var(--chip-bg-default); border: var(--border-panel-strong); color: var(--chip-text-default);` Resolves to `--surface-cream-soft`/1.5px solid #8a7a4a/`--ink-soft`.

**AC-020 — PASS.** #f1ead8 (L≈0.825043) on #1d1c19 (L≈0.011619): 0.875043/0.061619 = **14.2:1** ≥ 4.5:1.

**AC-021 — PASS.** #4a4742 (L≈0.063557) on #ece4cf (L≈0.778247): 0.828247/0.113557 = **7.3:1** ≥ 4.5:1.

**AC-022 — PASS.** `HooksTab.tsx:144`: `onClick={() => setEvent(e.id)}` atomically replaces state. One chip carries `chipSelected` at a time. `useEffect:36-39` dep array `[scope, data.settings]` untouched (CONS-15).

**AC-023 — PASS.** `ClaudeSettingsPanel.module.css:602`: `border-style: solid;`.

**AC-024 — PASS.** `ClaudeSettingsPanel.module.css:603-604`: `border-width: 1.5px; border-color: var(--empty-state-border-color);` — resolves to #bfb59a per `tokens.css:194`.

**AC-025 — PASS.** #bfb59a (L≈0.464572) vs #f1ead8 (L≈0.825043): 0.875043/0.514572 = **1.70:1** — within [1.5, 3.0] inclusive.

**AC-043 — PASS.** `ClaudeSettingsPanel.module.css:318-322`: alert tokens confirmed. #7a2418 (L≈0.054653) on #f7e8d6 (L≈0.823424): 0.873424/0.104653 = **8.35:1** ≥ 4.5:1.

**AC-044 — PASS.** `ClaudeSettingsPanel.module.css:320-321`: `border: var(--border-panel-strong); border-color: var(--alert-border);` — border-width from shorthand = 1.5px; `--alert-border` resolves to `--border-panel-strong-color` (#8a7a4a).

**AC-053 — PASS.** `tokens.css:221-226`: `body { background: var(--bg-base); }`. `ClaudeSettingsPanel.module.css:9-11`: `.shell { background: var(--surface-cream); color: var(--ink); }`. Both sides confirmed.

---

## PRIMARY FAILURE: Layout Regression — Panel Does Not Fill Viewport

**Severity: CRITICAL**
**Gate: PRD §9 Phase 4 completion criterion (line 801) + PRD §1/§3 core invariant**

**Root cause — file and line:** `ClaudeSettingsPanel.module.css:4-12` (`.shell` rule, post-Phase-4).

**What the regression is:** The cream settings panel renders at content height only. Dark body chrome (`--bg-base` = #0a0c10) is exposed below the panel when the window is taller than the panel content. Resizing the window taller widens the dark band, not the cream panel.

**Why this happened:**

Pre-Phase-4, `.shell` had `background: var(--bg-base)` — matching the body background. The panel was always content-height-only (`.shell`'s `flex: 1` has no effect because `#root` has no `display: flex`), but the matching dark colors made this invisible.

Post-Phase-4, `.shell` has `background: var(--surface-cream)` (cream). The content-height boundary is now a sharp visible line against the dark body below.

**CSS evidence:**

`tokens.css:212-218` — `html, body, #root { height: 100%; overflow: hidden; }`. No `display: flex` on `#root`. `#root` is a block container.

`ClaudeSettingsPanel.module.css:4-12` (post-Phase-4):
```css
.shell {
  display: flex;
  flex-direction: column;
  flex: 1;          /* ignored — parent #root has no flex context */
  min-height: 0;
  background: var(--surface-cream);
  color: var(--ink);
  border: var(--border-panel-strong);
}
```

`App.tsx:28`: `<ClaudeSettingsPanel />` inside a React Fragment. `.shell` div's CSS parent is `#root` (block layout, no flex).

**Why it fails the gate:**

PRD §9 Phase 4 completion criterion (line 801): "`npm run dev` shows the migrated settings panel rendered with cream content surfaces..." — user's smoke test falsifies this.

PRD §1/§3 core invariant: "functionality unchanged, only visuals migrate." The pre-migration user experience showed a panel appearing to fill the viewport. The post-migration experience does not.

**Remediation for Attempt 2:**

Add `height: 100%` to `.shell` in `ClaudeSettingsPanel.module.css:4-12`. Since `#root` is a block container with `height: 100%` (inherited from `body` and `html`), a block child declaring `height: 100%` will fill the available space.

Minimal change:
```css
.shell {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;          /* ADD: fills block parent's 100%-height context */
  background: var(--surface-cream);
  color: var(--ink);
  border: var(--border-panel-strong);
}
```

Builder must verify the fix by running `npm run dev` and confirming the cream panel fills the full viewport on all 9 tabs before declaring READY_FOR_QA for Attempt 2.

---

## AC Coverage Summary

| AC | Result |
|---|---|
| AC-005 | PASS — zero `var(--accent-primary)` in src/ |
| AC-006 | PASS — `tokens.css:180` |
| AC-007 | PASS — 3.53:1 |
| AC-008 | PASS — all six panels, code-confirmed |
| AC-009 | PASS — `ClaudeSettingsPanel.module.css:558` |
| AC-015 | PASS — `ClaudeSettingsPanel.module.css:171-175` |
| AC-016 | PASS — no `--font-display` in tabTitle |
| AC-017 | PASS — `HooksTab.tsx:147` |
| AC-018 | PASS — `ClaudeSettingsPanel.module.css:574-577` |
| AC-019 | PASS — `ClaudeSettingsPanel.module.css:557-559` |
| AC-020 | PASS — 14.2:1 |
| AC-021 | PASS — 7.3:1 |
| AC-022 | PASS — single-select, CONS-15 preserved |
| AC-023 | PASS — `ClaudeSettingsPanel.module.css:602` |
| AC-024 | PASS — `ClaudeSettingsPanel.module.css:603-604` |
| AC-025 | PASS — 1.70:1 |
| AC-043 | PASS — `ClaudeSettingsPanel.module.css:318-322`, 8.35:1 |
| AC-044 | PASS — `ClaudeSettingsPanel.module.css:320-321` |
| AC-053 | PASS — body dark, panel cream-on-ink confirmed |
| **Core invariant** | **FAIL — cream panel does not fill viewport; dark body exposed below content boundary** |

---

## Additional Notes

- **`--lp-` guard:** `grep -rn "\-\-lp-" src/` → zero matches. AC-001 ongoing guard holds.
- **Test suite:** Builder reports 87/87 pass (sandbox blocked independent verification). No existing test covers the viewport-filling layout behavior — it is not caught by the test harness.
- **CONS-15:** `HooksTab.tsx:36-39` useEffect dep array `[scope, data.settings]` untouched. Confirmed.
- **Commit discipline:** Phase 4 changes are in the working tree, not committed. PRD line 805 requires a single commit. Reviewer concern; does not affect this QA gate.
- **Build Summary format:** Structurally complete — includes AC table, files-touched ledger, mockup-issue resolution summary, `--accent-primary` disposition table, three-witness contrast computations, and mechanical self-verification. Matches sibling build summaries.

---

**Phase Status: FAILED — ROUTING BACK TO BUILDER (judgment failure 1 of 2 for Phase 4)**

The sole blocker is the layout regression. All 19 AC-level code items are correctly implemented. Builder Attempt 2 needs only the one-line `height: 100%` addition to `.shell` plus a visual smoke-test confirmation before resubmitting.
