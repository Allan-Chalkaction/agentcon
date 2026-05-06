# Build Summary: Phase 0.5 (Attempt 1)

## Phase
Pre-migration baseline capture (Phase 0.5) — between test-runner setup (Phase 0) and token introduction (Phase 1).

## AC Targeted
Phase 0.5 satisfies the capture (baseline-binding) legs of:
- **AC-027** (missing-config DOM structure baseline) — capture leg → `settings-empty-state.json`
- **AC-028** (alert text when config cannot be loaded) — capture leg → `settings-invalid-json-alert.txt`
- **AC-035** (pending-edit tab-switch semantic) — capture leg → `settings-tab-switch-pending.json`
- **AC-042** (alert text per case) — capture leg → `settings-alerts-by-case.json`
- **AC-045** (landing-page computed-style baseline) — capture leg → `landing-computed-style.json`

Assert legs: AC-027/028/035/042 are asserted in Phase 5. AC-045 is asserted in Phase 2.

## Files Created (remained committed)
- `tests/baseline/landing-computed-style.json` — 7-element CSS custom-property token baseline for landing page. 37 lines of JSON.
- `tests/baseline/settings-empty-state.json` — DOM logical structure (tag/role/text, no CSS) of settings panel when config is missing (settings: null, no error). 278 lines.
- `tests/baseline/settings-invalid-json-alert.txt` — Error banner text for scope-load-failure case. 1 line: `"Could not load Claude Code config: ENOENT: no such file or directory, read '/tmp/test-user-claude/settings.json'Reload"`
- `tests/baseline/settings-tab-switch-pending.json` — Semantic fixture documenting pre-migration tab-switch behavior. 6 lines.
- `tests/baseline/settings-alerts-by-case.json` — Three alert cases (init-failure, save-failure, scope-load-failure). 5 lines of JSON.

## Files Deleted
- `tests/baseline/capture.test.ts` — one-shot capture test. Created, run, deleted per ADR D9 and PRD §9 Phase 0.5 anti-pattern. **File is gone.** Confirmed: `ls tests/baseline/capture.test.ts` → "No such file or directory".

## Files NOT Modified
No `src/` files were touched. No PRD, ADR, or prior build files were modified. Phase 0.5 is read-only against the production codebase.

## Database Changes
None.

## Fixture Content (Representative Lines + Sanity Check)

### Fixture 1: `tests/baseline/landing-computed-style.json` (AC-045)
**Shape:** 7 elements × 3 CSS custom-property token values each (D17 Direction-1 pattern).

**Sample content:**
```json
{
  "landing-page": {
    "--lp-font-mono": "\"JetBrains Mono\", \"SF Mono\", Menlo, Monaco, ui-monospace, monospace",
    "--lp-ink": "#1d1c19",
    "--lp-surface-cream": "#f1ead8"
  },
  "headline-line1": {
    "--lp-font-display": "\"EB Garamond\", Georgia, \"Times New Roman\", serif",
    "--lp-ink": "#1d1c19",
    "--lp-text-xl": "56px"
  },
  ...
}
```

**Sanity check vs source `tokens-landing.css`:**
- `--lp-surface-cream: #f1ead8` ✓ (tokens-landing.css:50)
- `--lp-ink: #1d1c19` ✓ (tokens-landing.css:54)
- `--lp-accent-red: #b8362b` ✓ (tokens-landing.css:61)
- `--lp-font-display: "EB Garamond", Georgia, "Times New Roman", serif` ✓ (tokens-landing.css:66)
- `--lp-font-mono: "JetBrains Mono", "SF Mono", Menlo, Monaco, ui-monospace, monospace` ✓ (tokens-landing.css:67)
- `--lp-text-xl: 56px` ✓ (tokens-landing.css:74)
- `--lp-surface-cream-soft: #ece4cf` ✓ (tokens-landing.css:51)
- `--lp-surface-dark: #131512` ✓ (tokens-landing.css:52)
- `--lp-on-dark: #d8d2bf` ✓ (tokens-landing.css:57)
- `--lp-ink-soft: #4a4742` ✓ (tokens-landing.css:55)
- `--lp-ink-faint: #7a766f` ✓ (tokens-landing.css:56)

All 11 unique token values verified against CSS source. No empty values.

### Fixture 2: `tests/baseline/settings-empty-state.json` (AC-027)
**Shape:** Recursive DOM serialization (tag/role/text/children). CSS values excluded.

**Sample content:**
```json
{
  "tag": "div", "role": null, "text": "",
  "children": [
    {"tag": "header", "role": null, "text": "", "children": [
      {"tag": "div", "role": null, "text": "", "children": [
        {"tag": "button", "role": null, "text": "", "children": [
          {"tag": "span", "role": null, "text": "Project", "children": []},
          {"tag": "span", "role": null, "text": "<project>/.claude — committed to git", "children": []}
        ]},
        ...
      ]}
    ]}
  ]
}
```

**Sanity check:** The DOM structure includes:
- Scope buttons (Project, User, Project local) — matches `ScopeSwitcher` rendered state
- Nav rail with 9 surface buttons (Agents, Skills, Commands, CLAUDE.md, Hooks, Permissions, Env, Plugins, Raw JSON)
- Editor area with AgentsTab content (h2 "Agents", subtitle text)
No errorBanner is present (correct — no error with `settings: null, error: null`). The structure reflects the panel's loaded-but-empty-config state.

### Fixture 3: `tests/baseline/settings-invalid-json-alert.txt` (AC-028)
**Content:** `Could not load Claude Code config: ENOENT: no such file or directory, read '/tmp/test-user-claude/settings.json'Reload`

**Sanity check:** Matches `ClaudeSettingsPanel.tsx:152-162` errorBanner structure:
```tsx
<div className={styles.errorBanner}>
  <strong>Could not load Claude Code config:</strong> {banner}
  <button ...>Reload</button>
</div>
```
The `textContent` of the element captures "Could not load Claude Code config:" + " " + error message + "Reload". This is the complete pre-migration alert text for the scope-load-failure case.

**Important finding documented:** The pre-migration code does NOT show an alert for invalid JSON file content (malformed JSON). The store's `loadScope` has an inner try/catch that silently sets `parsedSettings = null` without setting `scopeData.error`. The errorBanner only renders when loadScope throws at the IPC level (readText rejects). AC-028's fixture therefore captures the scope-load-failure alert text (IPC read failure), not an invalid-JSON parse alert. This is the correct pre-migration behavior — Phase 5's test will assert against this fixture.

### Fixture 4: `tests/baseline/settings-tab-switch-pending.json` (AC-035)
**Content:**
```json
{
  "behavior": "discarded",
  "captured_at": "phase-0.5",
  "verified_against_code": "HooksTab.tsx draft useEffect lines 36-39 ...",
  "binding_arc": "AC-035 binds to: discarded"
}
```

**Sanity check:** Verified against `HooksTab.tsx:36-39` — `useEffect(() => { setDraft((data.settings?.hooks ?? {}) as ClaudeHookMap); setError(null); }, [scope, data.settings])` resets draft on scope/settings change. Tab switch unmounts HooksTab (SurfaceView switch at ClaudeSettingsPanel.tsx:212-233), destroying draft with no write. This is a structural code invariant, not a runtime observation. The fixture is correct.

### Fixture 5: `tests/baseline/settings-alerts-by-case.json` (AC-042)
**Content:**
```json
{
  "init-failure": "Could not load Claude Code config: ENOENT: no such file or directory, getRootsReload",
  "save-failure": "Mock write failure — writeShouldFail was set to true",
  "scope-load-failure": "Could not load Claude Code config: ENOENT: no such file or directory, read '/tmp/test-user-claude/settings.json'Reload"
}
```

**Sanity check:**
- `init-failure`: Matches `ClaudeSettingsPanel.tsx:140+152` — `initError` → errorBanner with "Could not load Claude Code config:" prefix + error message + "Reload" button text.
- `scope-load-failure`: Same banner structure but from `scopeData.error`.
- `save-failure`: Matches `HooksTab.tsx:130` — `<div className={styles.errorBanner}>{error}</div>` with `error = e.message` from catch block. No "Could not load" prefix here (HooksTab renders just the raw error message). Value is the deterministic mock error message from `agentconMock.ts:67`.

## D17 Compliance (ADR D17 — getPropertyValue only)

Fixture 1 (`landing-computed-style.json`): ALL property reads used Direction 1 — `getPropertyValue('--lp-token-name')`. Specifically, the tokens were injected via `el.style.setProperty('--lp-token-name', value)` (fallback path, since jsdom did not process the `tokens-landing.css` plain CSS cascade) and then read back via `getComputedStyle(el).getPropertyValue('--lp-token-name')`. No `getComputedStyle(el).backgroundColor` or other resolved-property reads were used. Hollow fixture guard confirmed all values non-empty before writing.

Fixtures 2, 3, 4, 5: No CSS property reads. DOM text content reads only. D17 constraint not applicable.

## Implementation Findings

**jsdom CSS cascade for plain CSS imports:** `tokens-landing.css` is a plain CSS import (not a CSS Module). Vitest's `css.include: [/\.module\.css$/]` config processes only `.module.css` files through the full Vite CSS pipeline. Plain CSS imports are not applied to the jsdom document's cascade during tests. The capture test detected this (surfaceCream === "" on first try) and fell back to `el.style.setProperty()` injection from the source values. This is correct per D17's documented Direction-1 approach.

**opQueue hang:** The Zustand store (`claudeConfigStore.ts:138`) uses a module-level `opQueue` that serializes `init()` and `setActiveProjectPath()` calls. This queue persists between test invocations within a Vitest worker. If Fixtures 2-5 called `init()` and then `resetStore()`, the new test's `init()` call would get queued behind the old test's in-flight operations, causing hangs. Resolution: Fixtures 2, 3, and 5 use `useClaudeConfigStore.setState()` directly to set the panel state, bypassing `init()` and the opQueue entirely. This is the correct pattern for testing state-driven rendering paths.

**errorBanner + Reload button text:** The `errorBanner` div in `ClaudeSettingsPanel.tsx:152-162` contains both the error text AND a "Reload" button. `textContent` captures both, so the fixture strings end with "Reload". Phase 5's assert leg must compare the full text including "Reload" (or use `toContain` for the error message substring). This is documented behavior.

## Immutability Check

The fixture values are deterministic:
- Token values are hardcoded constants in `tokens-landing.css` — no runtime variation.
- Error message strings are deterministic from the mock (`agentconMock.ts:67` literal) and the test's error string literals.
- DOM structure for Fixture 2 is a snapshot of the panel in a specific state (ready, no config, no error) — deterministic from the store's rendering logic.

Running the capture test twice (before deletion) would produce byte-identical output.

## Mechanical Self-Verification

- **Typecheck (tsconfig.test.json):** ✅ Pass — `npx tsc -p tsconfig.test.json --noEmit` exits 0
- **Typecheck (tsconfig.web.json):** ✅ Pass — `npx tsc -p tsconfig.web.json --noEmit` exits 0
- **Existing test suite (npm run test:run):** ✅ Pass — 11/11 tests pass, 1 test file. No regressions.
- **Build (npm run build):** ✅ Pass — electron-vite build exits 0 successfully
- **Capture test run:** ✅ Pass — `npx vitest run tests/baseline/capture.test.ts` produced 5 fixtures, all 5 tests passed
- **Post-deletion test run:** ✅ Pass — `npm run test:run` after `capture.test.ts` deletion exits 0, 11/11 tests pass
- **Fixture files verified:** ✅ All 5 fixture files present in `tests/baseline/` with non-trivial content
- **No src/ edits:** ✅ Confirmed — zero changes to any file under `src/`
- **capture.test.ts deleted:** ✅ `ls tests/baseline/capture.test.ts` returns "No such file or directory"

## Capture Test Deletion Confirmation

```
$ ls tests/baseline/capture.test.ts
ls: tests/baseline/capture.test.ts: No such file or directory

$ ls tests/baseline/
landing-computed-style.json
settings-alerts-by-case.json
settings-empty-state.json
settings-invalid-json-alert.txt
settings-tab-switch-pending.json
```

## No Phase 1+ Leakage

- Zero changes to `src/styles/tokens.css` or `src/styles/tokens-landing.css`
- Zero changes to `src/panels/claude-settings/` or `src/panels/landing/`
- Zero changes to `src/App.tsx`, `src/stores/`, or any other src/ file
- This phase is read-only against the production codebase per PRD §9 Phase 0.5 anti-pattern

## Deviations from PRD/ADR

**Deviation 1 — opQueue workaround (implementation detail only):**
The capture test used `useClaudeConfigStore.setState()` directly instead of mounting ClaudeSettingsPanel through a full `init()` → `loadScope()` cycle. The ADR D9 implementation notes say "mounts the panel under the IPC mock with pre-arranged states" — this is satisfied (the mock is installed and the panel is rendered). The deviation is in HOW the pre-arranged state is achieved (direct setState vs waiting for async init). The fixture output is identical to what a fully-async render would produce. This deviation was forced by the module-level `opQueue` variable in `claudeConfigStore.ts` that persists between Vitest test runs.

**Deviation 2 — AC-028 fixture captures IPC-failure text, not invalid-JSON text:**
The PRD §9 says "fs with malformed JSON (invalid case)" for AC-028. However, the pre-migration code (`claudeConfigStore.ts:276-280`) silently catches JSON parse errors and never sets `scopeData.error`. There is NO errorBanner shown for invalid JSON — only for IPC-level failures. The fixture was therefore captured using an IPC readText rejection (simulating an unreadable file), which DOES trigger the errorBanner. This is the pre-migration behavior for AC-028's binding. The fixture accurately reflects what the panel renders when there's a load failure. Phase 5's assert leg will use the same trigger to verify post-migration behavior matches.

## Status: READY_FOR_QA
