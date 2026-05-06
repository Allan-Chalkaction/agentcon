# Phase 0.5 Exploration

## 1. PRD Lock Confirmation

Section 11 header reads: **"Consensus Status: LOCKED — 2026-05-05"**

Body: "PRD locked at 2026-05-05 (CTO final lock block)."

All four sign-offs present: PM Round 1, CTO Round 1, CTO Round 2, Architect Acknowledgement Round 2, PM Round 2. No blocking objections survive.

---

## 2. Phase 0.5 File List (from PRD §9 Phase 0.5)

**Files to Create (fixtures — written by capture test, remain committed):**
- `tests/baseline/landing-computed-style.json` — getComputedStyle snapshot of 7 AC-045 elements
- `tests/baseline/settings-empty-state.json` — DOM logical structure when config file is missing (AC-027)
- `tests/baseline/settings-invalid-json-alert.txt` — exact alert text for invalid JSON config (AC-028)
- `tests/baseline/settings-tab-switch-pending.json` — pre-migration semantic for tab-switch pending edit (AC-035)
- `tests/baseline/settings-alerts-by-case.json` — text content of all alert/error cases (AC-042)

**Files to Create then Delete (one-shot capture test):**
- `tests/baseline/capture.test.ts` — created, run once to produce fixtures, then deleted in the same Phase 0.5 deliverable

**Files NOT touched:**
- No `src/` files. Phase 0.5 is read-only against `src/`.
- No PRD, ADR, or other pipeline docs.

---

## 3. Phase 0.5 AC List

Phase 0.5 covers these ACs (all baseline-binding — the *capture leg* of dual-mapped ACs):

| AC | Description | This phase produces | Assert leg (later phase) |
|---|---|---|---|
| AC-027 | Missing-config DOM structure matches pre-migration baseline | `settings-empty-state.json` fixture (capture leg) | Phase 5 |
| AC-028 | Invalid-config alert text matches pre-migration baseline | `settings-invalid-json-alert.txt` fixture (capture leg) | Phase 5 |
| AC-035 | Pending-edit behavior on tab switch matches pre-migration semantic | `settings-tab-switch-pending.json` fixture (capture leg) | Phase 5 |
| AC-042 | Alert text per case matches pre-migration baseline | `settings-alerts-by-case.json` fixture (capture leg) | Phase 5 |
| AC-045 | Landing page computed styles match pre-migration baseline | `landing-computed-style.json` fixture (capture leg) | Phase 2 |

PM Round 2 coverage walk confirms: AC-027/028/035/042 are dual-mapped Phase 0.5 (capture) + Phase 5 (assert). AC-045 is dual-mapped Phase 0.5 (capture) + Phase 2 (assert).

---

## 4. The 5 Fixtures — Names, AC Bindings, Data Shape, File Paths

### Fixture 1: `tests/baseline/landing-computed-style.json`
**AC binding:** AC-045

**AC-045 quoted text (from PRD §5):**
> "Given the landing page was rendered before the rename phase (baseline), and the landing page is rendered after the rename phase (post), when `getComputedStyle()` is captured for each of the following representative elements at both times, then every captured property's computed value is **identical** between baseline and post (modulo the dev-switch button, which is intentionally changed by this migration):
> - `[data-testid="landing-page"]` — `background-color`, `font-family`, `color`
> - the `h1` first line — `font-family`, `font-size`, `color`
> - the `h1` second line (italic) — `font-family`, `font-style`, `color`
> - a transmissions-feed row — `background-color`, `color`, `font-family`
> - an operative card — `background-color`, `border-color`, `border-width`
> - an operative card's Deploy button — `background-color`, `color`, `border-color`
> - the footer — `background-color`, `color`, `font-family`"

**Data shape:** JSON object, sorted keys, fixed property allowlist per element. Structure:
```json
{
  "landing-page": { "background-color": "...", "color": "...", "font-family": "..." },
  "headline-line1": { "color": "...", "font-family": "...", "font-size": "..." },
  "headline-line2": { "color": "...", "font-family": "...", "font-style": "..." },
  "transmission-row": { "background-color": "...", "color": "...", "font-family": "..." },
  "operative-card": { "background-color": "...", "border-color": "...", "border-width": "..." },
  "deploy-button": { "background-color": "...", "border-color": "...", "color": "..." },
  "footer": { "background-color": "...", "color": "...", "font-family": "..." }
}
```

**Per D17:** all property reads use `getPropertyValue('--token-name')` on the element (Direction 1). The PRD lists resolved properties (background-color, font-family, etc.) but jsdom will return `""` for those via Direction 2. Resolution: for landing-page CSS custom properties that flow through the `.landing-root` scoping class, the fixture captures the `--lp-*` token values set on the `.landing-root` element via Direction 1 (`getPropertyValue('--lp-surface-cream')`, etc.). The AC's "computed value identical" then compares the same custom property reads pre vs post rename — post rename, these same properties will be read as the new `--surface-cream` etc. on the element. **The landing fixture will use `getPropertyValue` reads on the element for each CSS custom property token, not the resolved property (background-color). The fixture JSON will store token values, not resolved RGB values.** This is compliant with D17 and avoids the jsdom empty-string problem.

### Fixture 2: `tests/baseline/settings-empty-state.json`
**AC binding:** AC-027

**AC-027 quoted text (from PRD §5):**
> "Given the Claude Code configuration file is missing, when the settings panel mounts, then the panel renders the same empty/initial state it rendered before the migration (specific assertion: a test captures the pre-migration DOM snapshot for this case as a baseline string and the post-migration render produces the same logical content — child element types, text, role attributes match the baseline; CSS values are expected to differ)."

**Data shape:** JSON — recursive DOM serialization capturing only element type, text content, and role attributes. CSS values, classNames, inline styles explicitly excluded.
```json
{
  "tag": "div",
  "role": null,
  "text": "",
  "children": [
    { "tag": "div", "role": null, "text": "Loading Claude Code config…", "children": [] },
    ...
  ]
}
```
Capture condition: mount `ClaudeSettingsPanel` with empty fake-fs (no settings.json). The panel shows the loading/empty state (before init resolves). After `init()` completes with no settings file, it shows the empty state via `EmptyState` component.

### Fixture 3: `tests/baseline/settings-invalid-json-alert.txt`
**AC binding:** AC-028

**AC-028 quoted text (from PRD §5):**
> "Given the Claude Code configuration file exists but contains invalid JSON, when the settings panel mounts, then the panel renders an error/alert surface containing the same error message text it rendered before the migration (test reads the rendered DOM for the alert region and asserts its text content matches the pre-migration baseline)."

**Data shape:** Plain text — the full text content of the `errorBanner` div rendered when config JSON is invalid.

From `ClaudeSettingsPanel.tsx:140`:
```
banner = initError ?? surfaceError
```
From `§8.11` case 2 (scope load failure): text is `"Could not load Claude Code config: ${scopeData.error}"`.

The invalid-JSON case triggers a scope load failure (the store tries to parse the file, fails, sets `scopeData.error`). The fixture captures the full rendered text of `styles.errorBanner`.

### Fixture 4: `tests/baseline/settings-tab-switch-pending.json`
**AC binding:** AC-035

**AC-035 quoted text (from PRD §5):**
> "Given the settings panel is mounted and an edit is pending in Tab A, when the user switches to Tab B and back to Tab A, then the pending edit's state matches pre-migration behavior (preserved or discarded — Architect documents in §8, AC binds to whichever applies)."

**Data shape:** Per PRD §9 Phase 0.5 implementation notes and ADR D10: the pre-migration semantic is documented (not dynamically captured), since the behavior is code-deterministic.
```json
{
  "behavior": "discarded",
  "captured_at": "phase-0.5",
  "verified_against_code": "HooksTab.tsx draft useEffect lines 36-39 — draft resets to data.settings?.hooks on scope/data.settings change; tab switch unmounts HooksTab (SurfaceView switch in ClaudeSettingsPanel.tsx:212-233), destroying local draft state with no write"
}
```

### Fixture 5: `tests/baseline/settings-alerts-by-case.json`
**AC binding:** AC-042

**AC-042 quoted text (from PRD §5):**
> "Given the settings panel is mounted and an alert/error condition is triggered (config parse failure, write failure — Architect enumerates the cases in §8), when the alert renders, then its text content matches the pre-migration text content for that case (test asserts text content equality against a recorded baseline per case)."

**Three cases from §8.11:**
1. **Init failure** — `ClaudeSettingsPanel.tsx:140` reads `initError` → `errorBanner`. Text: `"Could not load Claude Code config: ${initError}"`.
2. **Scope load failure** — same `errorBanner`, sourced from `scopeData.error`. Text: `"Could not load Claude Code config: ${scopeData.error}"`.
3. **Save failure (HooksTab)** — `HooksTab.tsx:130` `<div className={styles.errorBanner}>{error}</div>`. Text: the caught error message from `handleSave`.

**Data shape:**
```json
{
  "init-failure": "Could not load Claude Code config: <error text>",
  "scope-load-failure": "Could not load Claude Code config: <error text>",
  "save-failure": "<error message text>"
}
```
The exact strings depend on the mock error messages used. The mock will use deterministic error strings (e.g. `"Mock write failure — writeShouldFail was set to true"` for save failure).

---

## 5. Reference Patterns from Phase 0

**Mock installation:** `tests/setup.ts` registers a `beforeEach(() => installAgentconMock())`. The capture test does NOT rely on setup.ts's beforeEach for state — it installs its own mock instances with specific pre-armed states using `installAgentconMock({ initialFs: ... })` or `installAgentconMock({ writeShouldFail: true })`. This gives each capture case a clean, deterministic state.

**DOM idioms:** Testing Library `render()`, `screen.getByRole()`, `screen.getByTestId()`. Capture test uses `render(<ClaudeSettingsPanel />)`, `render(<LandingPage />)` pattern. After render, uses `waitFor` / `act` for async init.

**CSS module asserts:** Phase 0 example uses `Object.keys(styles).length > 0`. Not needed in capture test; we're reading DOM content and token values.

**D17 pattern:** All landing-page CSS custom property reads via `getPropertyValue('--lp-token-name')` only. The capture test uses `el.style.getPropertyValue('--lp-surface-cream')` on the `.landing-root` element (after render, query it by `data-testid="landing-page"` which is the `.landing-root` div). Since the tokens are declared on `.landing-root` in `tokens-landing.css`, they must be on that element's computed style. The capture writes whatever `getPropertyValue` returns — if it's empty, the phase fails loud (per PRD anti-pattern: "Do NOT capture in JSDOM if `getComputedStyle` returns the empty string").

**Fixtures that need D17 discipline:** Fixture 1 (`landing-computed-style.json`) — all 7 element × property reads must use Direction 1 (getPropertyValue on the custom property name). Fixtures 2, 3, 5 capture DOM text content — no Direction 2 reads needed.

---

## 6. Immutability of Fixture Outputs

Once Phase 0.5 commits these 5 fixtures, every subsequent assert leg in later phases compares against them:
- Phase 2 landing-regression test reads `landing-computed-style.json` and asserts equality after the rename.
- Phase 5 settings-regression test reads `settings-empty-state.json`, `settings-invalid-json-alert.txt`, `settings-alerts-by-case.json` and asserts equality post-migration.
- `settings-tab-switch-pending.json` is a semantic description, not a computed snapshot, so it is immutable by construction.

**Risk:** If the landing fixture captures an empty string for a token (jsdom issue), Phase 2's regression test would trivially pass (comparing `""` to `""` before and after rename). This would hollow out AC-045.

**Verification plan during Phase 0.5:**
1. After running the capture test, read each fixture file and manually inspect values against source CSS.
2. For `landing-computed-style.json`: verify each token value matches the corresponding `--lp-*` value in `src/styles/tokens-landing.css` (e.g. `--lp-surface-cream: #f1ead8`). If any value is `""` or blank, the capture is hollow — fail the phase.
3. For `settings-empty-state.json`: verify the JSON structure contains meaningful text content (e.g. "Loading Claude Code config…" or the EmptyState text).
4. For `settings-invalid-json-alert.txt`: verify the text contains "Could not load Claude Code config:" followed by a non-empty error string.
5. For `settings-alerts-by-case.json`: verify all 3 cases have non-empty text strings.

If any fixture is hollow, the implementation of the capture test must be fixed before the phase is declared done.

---

## 7. One-Shot Delete Pattern

**Mechanism:** After the capture test runs and produces the 5 fixture files (verified as non-empty), the capture test file `tests/baseline/capture.test.ts` is deleted using the Bash `rm` command (via the tool). The fixture files remain.

**Verification:** After deletion:
- `ls tests/baseline/capture.test.ts` returns "No such file or directory".
- `npm run test:run` exits 0 with the full suite (Phase 0 bootstrap tests all pass, no broken imports).
- `git status` shows: 5 new fixture files in `tests/baseline/` (untracked/added), 0 test file (the capture.test.ts is gone — net effect is it was created and deleted within the same phase, so `git status` will not show it unless it was staged).

**Discipline:** The file must be deleted before the Build Summary is written. The Build Summary will confirm `ls tests/baseline/capture.test.ts` returns non-existent.

---

## 8. Anti-Patterns and Hard Rules

From PRD §9 Phase 0.5:
- **Do NOT mutate any `src/` source file.** Phase 0.5 is read-only against `src/`. Only `tests/baseline/` is touched.
- **Do NOT capture computed styles for the dev-switch button.** AC-045 explicitly excludes it.
- **Do NOT leave `capture.test.ts` runnable in subsequent phases.** File is deleted in this same phase.
- **Do NOT capture in JSDOM if `getComputedStyle` returns the empty string.** Fail loud, fix the test, do not commit a hollow fixture.
- **Do NOT proceed to Phase 1 token consolidation.** Separate phase boundary.
- **Do NOT modify PRD, ADR, or pipeline docs** beyond exploration + build summary + phase-state update.

From ADR D17: Landing baseline uses `getPropertyValue('--token-name')` only. No `getComputedStyle(el).color`-style reads.

---

## 9. Consensus Ledger Items Applicable to Phase 0.5

Reading §11 ledger entries:

**CONS-05 (pre-migration semantic captures):** Ledger item #4 confirms: "Pre-migration semantic captures (5 disjunctions) — ADR D9 + §8.8 — Phase 0.5 with 5 fixture files." Phase 0.5 satisfies CONS-05 by capturing all 5 fixture files. The AC-035 fixture in particular captures the "discarded" semantic verified against `HooksTab.tsx:36-39`.

**CONS-09 (real italic font / mock parity — CONS-09 per the Phase 0 build summary):** From the ADR D4 Addendum A record: the Phase 0 bootstrap test verified Direction 1 (getPropertyValue) works for custom properties. CONS-09 relates to the EB Garamond italic font being real (bundled) vs synthetic oblique. In the landing baseline capture, `getPropertyValue('--lp-font-display')` reads the font-family token value. The actual italic font rendering is not assertable via jsdom (jsdom doesn't load real fonts). The landing fixture captures the token value string (e.g. `'"EB Garamond", Georgia, "Times New Roman", serif'`) — which confirms the font-family token is set, not that the actual italic file loaded. This is acceptable per D17's Direction-1 constraint. CONS-09's parity concern is addressed insofar as the mock environment is the same harness that Phase 2's assertion test will use.

**CONS-11 (alert text baselines):** Ledger item #11 confirms: "Pre-migration alert text baselines — §8.11 + ADR D9 — three alert/error cases enumerated (init failure, scope load failure, save failure) traced to `ClaudeSettingsPanel.tsx:140` and `HooksTab.tsx:130/:105-107`; `tests/baseline/settings-alerts-by-case.json` captures each via Phase 0.5's one-shot test." Phase 0.5 satisfies CONS-11 by capturing all 3 cases in `settings-alerts-by-case.json`. The IPC mock's `writeShouldFail: true` option (implemented in Phase 0's `agentconMock.ts`) provides the save-failure injection knob needed for case 3. No mock extension is needed (Phase 0 already included `writeShouldFail` per the CONS-08 requirement).
