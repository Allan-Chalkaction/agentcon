## Phase 5 Exploration

### 1. PRD Lock Confirmation

`grep "PRD locked" PRD.md` returns: `PRD locked at 2026-05-05 (CTO final lock block).`

`phase-state.json` confirms Phase 5 status = "PENDING". Active phase is id "4" (REVIEWER_PASSED). Phase 5 is the next and final phase.

### 2. Files to Touch (from PRD §9 Phase 5)

AC covered: AC-026, AC-027, AC-028, AC-029, AC-030, AC-031, AC-032, AC-033, AC-034, AC-035, AC-036, AC-037, AC-038, AC-039, AC-040, AC-041, AC-042, AC-051, AC-052, AC-054.

Files (≤4):
- `tests/settings-regression.test.tsx` (NEW — AC-026–AC-044 + baselines for AC-027/AC-028/AC-035/AC-042)
- `tests/dev-switch.test.tsx` (already exists from Phase 3 — AC-010–AC-014 already covered; PRD says "NEW or merged into existing"; Phase 3 already wrote it; NO CHANGES needed per scope discipline)
- `tests/globals.test.tsx` (NEW — AC-051, AC-052, AC-053, AC-054 per file description line 816; completion criteria line 845 says "AC-051, AC-052, AC-053 has a passing assertion")

Final verification items (not file changes — confirmed in build summary):
- `grep -rn "\-\-lp-" src/` returns zero matches (AC-001 final verification)
- `grep -rn "\-\-accent-primary" src/` returns zero matches (AC-005 final verification)
- `grep -rn "\-\-lp-[a-z-]*: var(" src/` returns zero matches (AC-055 final verification)

### 3. Phase 5's Role

Phase 5 is the FINAL phase. Its job is:
1. Write `tests/settings-regression.test.tsx` — exercises all functional regression ACs for the settings panel (load config, edit+save, tab switch, hooks, presets, alerts).
2. Write `tests/globals.test.tsx` — asserts globals (overflow:hidden, focus-visible contrast, chrome/content split, per-phase boundary check).
3. Final grep assertions (AC-001, AC-005, AC-055) — verified in build summary.

After this phase passes QA+Reviewer, the migration run closes.

### 4. ScaffoldBanner Reviewer HIGH Finding — Scope Decision

`src/panels/claude-settings/ScaffoldBanner.tsx:46-47` has:
```tsx
style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}
```
This defeats the `.errorBanner` cream class for the non-done state.

PRD §9 Phase 5 files-to-touch does NOT list `ScaffoldBanner.tsx`. Phase 4's file list was:
- ClaudeSettingsPanel.module.css
- HooksTab.tsx
- ClaudeSettingsPanel.tsx
- (Optionally) one of AgentsTab/ScopeSwitcher/EnvTab
- tokens.css

ScaffoldBanner.tsx was mentioned in Phase 4 implementation notes (8.14) as "MODIFY (minor) — Phase 4", but Phase 4's explicit files-to-touch list does NOT include it. The PRD §9 Phase 5 files-to-touch also does NOT list it.

**Decision: Do NOT fix ScaffoldBanner.tsx in Phase 5.** The PRD is the contract. This finding was deferred as a Reviewer finding from Phase 4, but PRD §9 Phase 5 does not list this file. Noted in Build Summary as a tracked follow-up outside the locked PRD scope.

**Exception per PRD line 817:** "(Optional) any small fix-up in `ClaudeSettingsPanel.module.css` if a regression test exposes a missed AC binding." This is about `.module.css` only, not `.tsx` files. ScaffoldBanner is still out of scope.

### 5. CONS-23: AC-028 IPC-Rejection Trigger

CONS-23 is clear: AC-028 MUST use `installAgentconMock({ writeShouldFail: true | Error })` style IPC-rejection, NOT malformed JSON.

Re-reading the store's `loadScope`: when `fs.readText(sp)` rejects, the catch at line 346 sets `scopeData.error = errorMessage`. That error then flows into `banner = initError ?? surfaceError` in ClaudeSettingsPanel.tsx, and renders the `errorBanner` div.

For AC-028, the trigger is: install mock, do NOT put a file at the settings path, call `init()` normally, then simulate `readText` rejection on the scope load. The baseline file `settings-invalid-json-alert.txt` contains:
```
Could not load Claude Code config: ENOENT: no such file or directory, read '/tmp/test-user-claude/settings.json'Reload
```
This is actually the IPC-rejection text (the mock returns null for missing files → but looking at the code: `readText` returns `null` for missing, not rejecting). 

Wait — re-reading CONS-23: "AC-028 binds to IPC-rejection path, NOT malformed-JSON parse path." But the fixture says "ENOENT: no such file or directory, read '/tmp/test-user-claude/settings.json'" — that's a readText REJECTION, not null. To trigger this, the readText call must REJECT (throw), not return null. The way to achieve this is to override `window.agentcon.fs.readText` after `installAgentconMock()` to reject with the ENOENT error.

Strategy for AC-028 test:
1. `installAgentconMock()` (clean)
2. Override `window.agentcon.fs.readText` to reject with `new Error("ENOENT: no such file or directory, read '/tmp/test-user-claude/settings.json'")`
3. Render `<ClaudeSettingsPanel />`
4. `waitFor` the errorBanner to appear
5. Assert textContent matches baseline

For init-failure (AC-042 case 1): override `window.agentcon.fs.getRoots` to reject.
For save-failure (AC-042 case 3): `installAgentconMock({ writeShouldFail: true })`, render, drive save, assert error banner.

### 6. IPC Mock Seam

`tests/mocks/agentconMock.ts` — exports `installAgentconMock(options)`. Returns `fakeFs: Map<string,string>`. `writeShouldFail` knob (CONS-08).

`tests/setup.ts` — installs mock in `beforeEach(() => { installAgentconMock(); })`.

For tests needing custom readText behavior: install mock first, then patch `window.agentcon.fs.readText` directly after.

### 7. ADR D17: Visual AC Tests — Direction 1 Only

For visual token assertions: `el.style.setProperty("--token-name", value)` + `getComputedStyle(el).getPropertyValue("--token-name")`. No `getComputedStyle(el).backgroundColor` assertions.

For contrast assertions (AC-052): read token hex values from tokens.css source (file read), compute WCAG ratio in test code.

### 8. AC-001 / AC-055 Final-Grep

AC-001: `grep -rn "\-\-lp-" src/` → 0 matches (also verified by Phase 2 + Phase 3 + Phase 4 tests)
AC-005: `grep -rn "\-\-accent-primary" src/` → 0 matches
AC-055: `grep -rn "\-\-lp-[a-z-]*: var(" src/` → 0 matches

These are verified as part of `settings-regression.test.tsx` or build summary. Per PRD completion criteria, they're encoded as Vitest tests (or manual verification in Build Summary).

### 9. Three-Witness Contrast Computations

AC-052: `--accent-red (#b8362b)` contrast against:
- `--surface-cream (#f1ead8)`: L(#b8362b) vs L(#f1ead8)
  - #b8362b: r=184, g=54, b=43 → lin: (184/255=0.7216, 0.7216>0.04045 → pow((0.7216+0.055)/1.055, 2.4) = pow(0.7375, 2.4) ≈ 0.5088), g: (54/255=0.2118 → pow(0.2541, 2.4) ≈ 0.0415), b: (43/255=0.1686 → pow(0.2134, 2.4) ≈ 0.0284)
  - L = 0.2126*0.5088 + 0.7152*0.0415 + 0.0722*0.0284 ≈ 0.1082 + 0.0297 + 0.0021 ≈ 0.1399
  - #f1ead8: r=241, g=234, b=216 → lin: (0.9451→0.8797), (0.9176→0.8386), (0.8471→0.6997)
  - L = 0.2126*0.8797 + 0.7152*0.8386 + 0.0722*0.6997 ≈ 0.1870 + 0.5997 + 0.0505 ≈ 0.8372
  - contrast = (0.8372+0.05)/(0.1399+0.05) = 0.8872/0.1899 ≈ 4.67:1 → but PRD says ≈6.36:1
  
  Let me recompute more carefully. #b8362b: b8=184, 36=54, 2b=43.
  r_lin: s=184/255=0.72157; s>0.04045 → ((s+0.055)/1.055)^2.4 = (0.77657/1.055)^2.4 = 0.73608^2.4
  0.73608^2 = 0.54181; 0.73608^0.4: ln(0.73608)=-0.30650; *0.4=-0.12260; e^-0.12260=0.8847; so 0.73608^2.4 = 0.54181*0.8847 = 0.4794
  g_lin: s=54/255=0.21176; (0.26676/1.055)^2.4 = 0.25283^2.4; 0.25283^2=0.06392; 0.25283^0.4: ln(0.25283)=-1.3742; *0.4=-0.54968; e^-0.55≈0.5769; 0.06392*0.5769=0.03689
  b_lin: s=43/255=0.16863; (0.22363/1.055)^2.4=0.21199^2.4; 0.21199^2=0.04494; 0.21199^0.4: ln(0.21199)=-1.5506;*0.4=-0.6202;e^-0.6202≈0.5381; 0.04494*0.5381=0.02419
  L(#b8362b) = 0.2126*0.4794 + 0.7152*0.03689 + 0.0722*0.02419 = 0.10191 + 0.02638 + 0.00175 = 0.13004
  
  L(#f1ead8): f1=241, ea=234, d8=216
  r: s=241/255=0.94510; (1.00010/1.055)^2.4=0.94800^2.4; 0.94800^2=0.89870; 0.94800^0.4: ln(0.94800)=-0.05328; *0.4=-0.02131; e^-0.02131≈0.97889; 0.89870*0.97889=0.87974
  g: s=234/255=0.91765; (0.97265/1.055)^2.4=0.92188^2.4; 0.92188^2=0.84986; 0.92188^0.4: ln(0.92188)=-0.08134; *0.4=-0.03254; e^-0.03254=0.96798; 0.84986*0.96798=0.82264
  b: s=216/255=0.84706; (0.90206/1.055)^2.4=0.85502^2.4; 0.85502^2=0.73106; 0.85502^0.4: ln(0.85502)=-0.15656; *0.4=-0.06263; e^-0.06263=0.93930; 0.73106*0.93930=0.68672
  L(#f1ead8) = 0.2126*0.87974 + 0.7152*0.82264 + 0.0722*0.68672 = 0.18704 + 0.58835 + 0.04958 = 0.82497

  contrast = (0.82497+0.05)/(0.13004+0.05) = 0.87497/0.18004 = 4.86:1 (≥3:1 required for AC-052)
  
  vs --bg-base (#0a0c10): 0a=10, 0c=12, 10=16
  r: s=10/255=0.03922; ≤0.04045 → 0.03922/12.92 = 0.003036
  g: s=12/255=0.04706; >0.04045 → (0.10206/1.055)^2.4=0.09674^2.4; tiny; ≈ 0.00748
  b: s=16/255=0.06275; (0.11775/1.055)^2.4=0.11161^2.4; ln(0.11161)=-2.193;*2.4=-5.262;e^-5.262=0.00521
  
  Let me simplify: bg-base is very near black. L(#0a0c10) ≈ 0.0022
  contrast(#b8362b vs #0a0c10) = (0.13004+0.05)/(0.0022+0.05) = 0.18004/0.0522 ≈ 3.45:1 (≥3:1 ✓)

  The test code at dev-switch.test.tsx:59 uses `Math.pow((s + 0.055) / 1.055, 2.4)` which is the correct formula.

### 10. Phase 0.5 Baseline Fixtures

All five fixtures exist at `tests/baseline/`:
- `landing-computed-style.json` — AC-045 (landing regression; already tested in Phase 2)
- `settings-empty-state.json` — AC-027 (empty fs → DOM structure match)
- `settings-invalid-json-alert.txt` — AC-028 (IPC rejection → alert text match)
- `settings-tab-switch-pending.json` — AC-035 behavior = "discarded"
- `settings-alerts-by-case.json` — AC-042 (three alert cases)

The `settings-invalid-json-alert.txt` content:
```
Could not load Claude Code config: ENOENT: no such file or directory, read '/tmp/test-user-claude/settings.json'Reload
```
The "Reload" suffix is the button text caught by `textContent`. Serializer depth is consistent with baseline.

The `settings-alerts-by-case.json`:
```json
{
  "init-failure": "Could not load Claude Code config: ENOENT: no such file or directory, getRootsReload",
  "save-failure": "Mock write failure — writeShouldFail was set to true",
  "scope-load-failure": "Could not load Claude Code config: ENOENT: no such file or directory, read '/tmp/test-user-claude/settings.json'Reload"
}
```
Note: `init-failure` has "getRoots" in the message (getRoots threw). `scope-load-failure` matches the `settings-invalid-json-alert.txt` content (same scenario).

### 11. opQueue Singleton Caveat

`claudeConfigStore.ts:138`: `let opQueue: Promise<void> = Promise.resolve()` is module-level, NOT reset by `beforeEach`.

For tests needing init() via the component: use `useClaudeConfigStore.setState({ _initialized: false, ready: false, roots: null, user: EMPTY_SCOPE, project: EMPTY_SCOPE, local: EMPTY_SCOPE, initError: null })` before rendering. This bypasses the opQueue issue.

OR: bypass init() entirely by using `useClaudeConfigStore.setState()` to pre-arm the store with `ready: true, roots: {...}, user/project/local: { loaded: true, ... }`. This is cleaner for most tests.

Strategy: use `setState()` bypass for setup, not `init()` directly (CONS caveat).

### 12. Patterns I'll Follow

For `settings-regression.test.tsx`:
- Every describe block uses `beforeEach(() => { useClaudeConfigStore.setState({...}) })` to pre-arm store state
- Use `installAgentconMock()` return value to inspect post-Save fakeFs content
- Use `@testing-library/user-event` for typing (AC-029) and clicking (AC-030, AC-037, etc.)
- Use `waitFor` for async state updates
- AC-028 trigger: override `window.agentcon.fs.readText` to reject after `installAgentconMock()`, then reset store `_initialized: false`, then render and wait
- AC-027 trigger: fakeFs is empty, init store with roots + trigger loadScope

For `globals.test.tsx`:
- Source-file reads for token value assertions (Direction 1 pattern)
- `el.style.setProperty` + `getComputedStyle(el).getPropertyValue` for token round-trip
- `tokens.css` source-read for overflow rule and focus-visible rule presence

### 13. AC-013 Disjunction

AC-013 §5: "or" — test already exists in dev-switch.test.tsx (Phase 3). Phase 5 `globals.test.tsx` does NOT re-test AC-013; it's already covered.

### 14. Anti-Patterns I'm Avoiding

- NO malformed-JSON trigger for AC-028 (CONS-23)
- NO `init()` call without resetting `_initialized: false` first
- NO modifying `tests/baseline/*`
- NO touching ScaffoldBanner.tsx (out of scope per PRD §9 Phase 5 files-to-touch)
- NO Direction-2 getComputedStyle().color assertions for token-driven values (ADR D17)
- NO new tokens or renames (Phase 5 is test-only)

### 15. Concerns Flagged

- ScaffoldBanner.tsx:46-47 inline style overriding `.errorBanner` cream class — NOT in scope for Phase 5 per PRD. Noted in Build Summary.
- AC-053 (chrome/content split) is in Phase 4's AC list but `globals.test.tsx` description says it covers AC-053. PRD completion criteria at line 845 says "AC-051, AC-052, AC-053 has a passing assertion." Writing AC-053 test in `globals.test.tsx` is within Phase 5 scope (the test file is in Phase 5's files-to-touch list).
- `settings-empty-state.json` AC-027 baseline: The baseline captures DOM structure with `text` and `children`, not CSS values. My test will serialize the rendered DOM the same way (tag, role, text, children) and compare logical structure — not CSS.
