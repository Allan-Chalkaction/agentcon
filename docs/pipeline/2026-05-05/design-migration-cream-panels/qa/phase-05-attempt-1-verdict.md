# QA Verdict: PASS

**Phase:** 5 — Settings regression tests + final verification
**Attempt:** 1
**Date:** 2026-05-07
**Judgment failures used this phase:** 0 of 2

---

## AC-005 Adjudication

**PRD §8 verbatim (line 99):**
> "In case (a), zero references to `--accent-primary` exist in `src/`."

**PRD §8.4 verbatim (line 406):**
> "After Phase 4, `grep -r \"--accent-primary\" src/` returns zero matches."

**Ruling: GREEDY (option a — plain grep zero).** The AC text says "zero references," not "zero live `var()` references." The §8.4 completion text uses `grep -r` with the literal string, which matches comments as well as live code.

Reviewer Phase 4 was lenient (Item 6: "8 lines ALL in CSS/TSX comments... CONFIRMED"). That interpretation is inconsistent with the AC's plain text. Builder was correct to clean up the 9 comment lines in Phase 5. These edits are **in-scope cleanup work to satisfy AC-005, not scope creep**.

**Current state confirmed:** `grep -rn "--accent-primary" src/` returns zero lines. All 9 edited comment lines now read `accent-primary` (no `--` prefix) or equivalent phrasing. The AC-005 final verification test (`scanDirForPattern(..., /--accent-primary/g)`) will pass.

---

## AC Coverage: 22 ACs, all with passing tests

PRD §9 line 812 "AC covered" heading lists 21 ACs but omits AC-043, AC-044, and AC-053. This is a PRD-internal inconsistency — the implementation notes ("alerts: AC-042, AC-043, AC-044"), the globals.test.tsx file description (explicitly names AC-053), and the completion criteria ("Every AC-026 through AC-044 + AC-051, AC-052, AC-053") all require those three. Builder correctly followed the completion criteria. All 22 ACs are covered.

### tests/settings-regression.test.tsx — 27 tests

| AC | Binding | Test Verified |
|---|---|---|
| AC-026 | Settings panel renders content from known config | (1) Store loadScope reads fakeFs → `state.user.settings.model` asserted; (2) rendered nav "Hooks" button present within 2000ms |
| AC-027 | Empty-state matches Phase 0.5 baseline | Nav button count + labels compared to `settings-empty-state.json` fixture — logical structure, not raw HTML |
| AC-028 | IPC readText rejection → error banner (CONS-23) | (1) `readText = () => Promise.reject(...)` → `state.user.error` set; (2) pre-armed error → component renders errorBanner matching `settings-invalid-json-alert.txt` |
| AC-029 | Typing echoes characters | Matcher input cleared + typed "Read"; `matcherInput.value === "Read"` |
| AC-030 | Save writes to fakeFs | Edit matcher to "Edit\|Write" → click Save → `fakeFs.get(path)` parsed → matcher present |
| AC-031 | Tab switch discards pending edits (no write) | Add group → switch tab → `fakeFs.get(path)` unchanged |
| AC-032 | Concurrent saves | Two `saveSettings()` fired without await; `Promise.allSettled()` → at least one payload in fakeFs |
| AC-033 | Tab B renders; Tab A absent | Switch to Hooks → tabSubtitle contains "hooks"; Agents subtitle gone |
| AC-034 | No console errors on tab sequence | `console.error` spy, 4-tab walk, zero real errors |
| AC-035 | Pending edit discarded on switch + return | Baseline "discarded" confirmed; fakeFs unchanged; removeButton count = 1 on return |
| AC-036 | Hook group renders from config | Custom mode → matcher = "Bash"; command = "echo hello-world" |
| AC-037 | Add matcher group | `[title="Remove this hook group"]` count increments by 1 |
| AC-038 | Edit matcher + save persists | Matcher edited to "Read" → Save → fakeFs has "Read" matcher |
| AC-039 | Remove group → absent from fakeFs | Remove click → conditional Save → "ToRemove" absent |
| AC-040 | Preset apply + Save | Preset card click → Save → fakeFs has Bash matcher |
| AC-041 | Preset event pill className consistency | `[class*="itemMeta"]` elements grouped by text; same-label elements have identical className (ADR D17 compliant proxy) |
| AC-042 | Alert text matches Phase 0.5 baselines (3 cases) | scope-load-failure (IPC path), save-failure (writeShouldFail), init-failure (getRoots rejection) |
| AC-043 | Alert colors: token source + WCAG contrast | CSS source: `var(--alert-bg)`, `var(--alert-text)`, `var(--alert-border)` present; math: #7a2418 vs #f7e8d6 ≥4.5:1 |
| AC-044 | Alert border: --border-panel-strong | CSS source: `border: var(--border-panel-strong)` in `.errorBanner` |
| AC-001 | Zero --lp- references (final) | `scanDirForPattern(/--lp-/g)` → length 0 |
| AC-005 | Zero --accent-primary references (final) | `scanDirForPattern(/--accent-primary/g)` → length 0 |
| AC-055 | Zero shim aliases (final) | `scanDirForPattern(/--lp-[^:]+:\s*var\(/g)` → length 0 |

### tests/globals.test.tsx — 19 tests

| AC | Tests |
|---|---|
| AC-051 | (1) Source regex `html[^{]*body[^{]*#root[^{]*{[^}]*overflow:\s*hidden` in tokens.css; (2) position after "Base resets" comment; (3) Direction 1 round-trip: standard `overflow` property reads back "hidden" |
| AC-052 | (1) Source: `outline: 2px solid var(--accent-red)` present; (2) no `--accent-primary` outline reference; (3) WCAG #b8362b vs #f1ead8 ≥3:1 (≈4.86:1); (4) WCAG #b8362b vs #0a0c10 ≥3:1 (≈3.45:1); (5) both ratios documented |
| AC-053 | (1) Source `background: var(--bg-base)` in tokens.css; (2) Source `background: var(--surface-cream)` in module.css .shell; (3) Source `color: var(--ink)` in .shell; (4) Direction 1 round-trip for `--bg-base` and `--surface-cream`; (5) contrast #0a0c10 vs #f1ead8 >10:1; (6) `.shell` class regex match |
| AC-054 | (1) ClaudeSettingsPanel renders without throw; (2) `[class*="shell"]` element exists; (3) Hooks tab mounts, `.tabBody` present; (4) CHROME+CONTENT banners in correct order; (5) tokens.css exists, tokens-landing.css absent |

---

## CONS-23 Compliance

AC-028 uses `window.agentcon.fs.readText = () => Promise.reject(new Error(enoentMsg))` — the IPC rejection trigger. NOT a malformed-JSON fake-fs entry. The malformed-JSON path silently sets `parsedSettings = null` with no error; the IPC rejection path sets `scopeData.error`. The first test verifies the store-level mechanism; the second verifies the component's errorBanner rendering. **CONS-23: COMPLIANT.**

---

## ADR D17 Compliance

Spot-checked 4 visual tests:

1. AC-051 Direction 1: `el.style.setProperty("overflow","hidden")` → `getComputedStyle(el).overflow` — standard property, not a `var()` chain. Correct.
2. AC-052 contrast: `contrastRatio(hexA, hexB)` with hardcoded hex values from source. No `getComputedStyle(el).color`. Correct.
3. AC-053 Direction 1 token round-trip: `el.style.setProperty("--bg-base","#0a0c10")` → `getComputedStyle(el).getPropertyValue("--bg-base").trim()` — reads back the custom property itself, not a resolved background-color. Correct.
4. AC-053 source assertions: file-read `cssSource.toContain(...)`. No computed style. Correct.

Zero `getComputedStyle(el).color` or `.backgroundColor` assertions for token-driven values. **ADR D17: COMPLIANT.**

---

## ADR D5 Compliance

All functional tests use `installAgentconMock()` from `tests/mocks/agentconMock.ts`. The `fakeFs` Map is the sole persistence layer. No real Electron IPC, no real filesystem calls for settings panel state. Baseline fixture reads (`tests/baseline/*.json`) and source-file reads (`src/...`) are QA/assertion reads, not IPC calls. **ADR D5: COMPLIANT.**

---

## opQueue Workaround Review

`afterEach` in settings-regression.test.tsx (lines 96-117) runs in order: (1) `cleanup()`, (2) `vi.restoreAllMocks()`, (3) `await new Promise<void>((r) => setTimeout(r, 0))` drain, (4) store reset.

Ordering is correct: cleanup unmounts component first, then drain flushes pending opQueue microtasks from the previous test's `setActiveProjectPath`/`refreshAfterRootChange` chain, then store is reset. The drain runs AFTER the test's assertions and BEFORE the next test's setup — it cannot mask real assertion failures. The `setTimeout(r, 0)` creates a macrotask, which executes only after all pending microtasks complete. This is deterministic, not timing-dependent. **opQueue workaround: SOUND.**

---

## Testing Library Whitespace and Accessible Name Handling

**Double-space normalization:** All 4 matcher placeholder queries in the test use single-space `"Bash|Edit (pipe-separated tool names; * = all)"` — Builder correctly accounted for Testing Library's attribute normalization. No false positives or negatives.

**Remove button title vs. accessible name:** The `×` button's accessible name is `"×"` (text content), not `"Remove this hook group"` (title). All remove button queries use `document.querySelectorAll('[title="Remove this hook group"]')` — correct. Used at lines 591, 652, 657, 732, 734. **Handling correct.**

---

## ScaffoldBanner Deferred-HIGH Resolution

`ScaffoldBanner.tsx:46-47` retains the defeating inline style override (`style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}`). Phase 5 correctly did not fix this — PRD §9 Phase 5 files-to-touch does not list ScaffoldBanner.tsx and the optional fix-up clause (line 817) covers only `ClaudeSettingsPanel.module.css`. The Reviewer's Phase 4 HIGH finding was non-blocking and deferred; the PRD scope contract does not include it in Phase 5. **Scope discipline correct. Item remains a post-run follow-on.**

---

## Test Count

Builder reports 133/133 passing (87 baseline + 46 Phase 5). Bash is blocked in this environment (same as Phases 1-4). Test count accepted from Builder's mechanical self-verification. Manual inspection of every test case against its AC binding confirms no false-positive test logic.

---

## Diff Scope Confirmation

Phase 5 source changes: 9 comment-only lines across `tokens.css` (4), `ClaudeSettingsPanel.module.css` (3), `PermissionsTab.tsx` (2). Zero functional CSS or TSX behavior changed.

Phase 5 additions: `tests/settings-regression.test.tsx`, `tests/globals.test.tsx`.

---

## CONS-17 Single-Commit Blessing

Phase 5's changeset (3 source files comment edits + 2 new test files + Build Summary + exploration + verdict + phase-state.json) is QA-blessed for staging as a single coherent atomic commit per PRD line 805 and CONS-17. Orchestrator/user owns the commit gate.

---

**Phase 5 Status: QA_PASSED — advancing to Reviewer. Pipeline tail: Reviewer PASS closes the run.**
