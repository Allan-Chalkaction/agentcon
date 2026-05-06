## Reviewer Verdict: PASS

**Phase:** 0 — Test runner setup
**Attempt:** 1
**Date:** 2026-05-06
**QA status at invocation:** QA_PASSED (confirmed in phase-state.json)

---

### Findings Summary

- BLOCKING: 0
- HIGH: 0
- SUGGESTION: 2
- NIT: 1

---

### Convention Compliance

All conventions followed. No `.claude/rules/` directory exists for this project; conventions were checked against CLAUDE.md (not present) and PRD/ADR requirements directly.

- Import patterns: `@testing-library/jest-dom/vitest` import in `tests/setup.ts` is the correct vitest-specific entry point. All other imports are standard.
- File organization: `vitest.config.ts` at repo root, `tests/` at repo root, mocks in `tests/mocks/`, fixtures in `tests/fixtures/` — all per ADR D4 / PRD §8.14.
- TypeScript hygiene: Two `// eslint-disable-next-line @typescript-eslint/no-explicit-any` comments in `agentconMock.ts:210-213` — unavoidable for the `globalThis` type-widening required to install the mock on `window`. Explicitly annotated. Acceptable.
- `globals: false` in `vitest.config.ts` is consistent with explicit `import { describe, it, expect, ... } from "vitest"` in the test file. Correct.

---

### Builder Exploration Consistency

Implementation matches claimed patterns.

Builder's exploration section 5 (CONS-21 verification plan) explicitly anticipated the Direction-2 (var() chain) failure: *"jsdom has known limitations with CSS custom property resolution. It does NOT perform full CSS variable substitution for computed properties"* (exploration.md line 108). The planned escape hatch (happy-dom, raw stylesheet text) is documented. The actual implementation follows the plan exactly: Direction-2 test documents the limitation and asserts only the non-failure condition (`typeof computedColor === "string"`), exactly as the exploration specified.

The Build Summary's CONS-21 section accurately reports the Direction-2 limitation as "DOCUMENTED LIMITATION — not a PASS for var() resolution." The QA verdict's review prompt framing characterizing this as Builder "overstating" the result is not borne out by the actual Build Summary text — Builder documented the limitation correctly.

Exploration claims vs. actuals:
- CONS-21 two-direction verification plan: matched exactly
- CONS-01 CSS Modules non-empty object assertion: matched
- CONS-08 `writeShouldFail` options flag shape: matched exactly
- `window.agentcon` shape from `claudeConfigStore.ts`: matched — mock covers all 5 namespaces
- `tsconfig.test.json` as authorized 6th file: decision documented in exploration; authorization from PRD §9 Phase 0 implementation notes confirmed in both exploration and build summary

No discrepancies between exploration claims and actual code.

---

### Correctness

All logic is correct. Edge cases handled:

- Null/missing paths: `fakeFs.get(absPath) ?? null` returns `null` correctly (`agentconMock.ts:97`).
- Write-failure injection: `writeError` resolved once at factory call time, not lazily — correct; all subsequent `writeText` calls in the test share the same rejection path (`agentconMock.ts:65-70`, `100-106`).
- State isolation: each `installAgentconMock()` call creates a fresh `fakeFs = new Map()` and `fakeSettings = new Map()`. The `beforeEach` in `setup.ts:13-15` calls `installAgentconMock()` with default options, resetting all state. Tests that need a non-default mock re-call `installAgentconMock()` with specific options, which replaces `window.agentcon` entirely — no state leak path.
- Watch event subscribers (`watchEventListeners` array, `agentconMock.ts:74-77`): cleaned up correctly — `onWatchEvent` returns an unsubscribe function that splices the listener out. However, the `watchEventListeners` array is scoped to the `installAgentconMock()` closure and is replaced entirely on each `beforeEach` call (a new array is created each time), so there is no cross-test accumulation even if tests forget to call the unsubscribe.
- `getRoots()` returns a spread of `TEST_ROOTS` (`{...TEST_ROOTS}`), ensuring the returned object is a fresh copy each call — callers that mutate the result don't affect the mock's internal constants.
- `options.initialFs ? new Map(options.initialFs) : new Map()` — copy-on-construction ensures the passed-in Map is not mutated by the mock.

One correctness note (informational, not a finding): The mock's `onWatchEvent` callback type uses a local `WatchEventType = "add" | "change" | "unlink" | "addDir" | "unlinkDir"` union (`agentconMock.ts:73`), which matches the `FsWatchEvent.type` union in `global.d.ts:47-49`. The preload (`preload.ts:99`) uses the wider `type: string`. The mock correctly follows the tighter interface definition, not the implementation. The TypeScript shape check (`mock: Window["agentcon"]`) enforces this at compile time. Confirmed clean by Builder's `tsc -p tsconfig.test.json --noEmit` exit 0.

---

### IPC Mock Shape vs. Real API

Full parity confirmed. Verified against `src/global.d.ts` (canonical interface) and `src/electron/preload.ts` (production implementation) and `src/stores/claudeConfigStore.ts` + all renderer consumers.

| Namespace | Real methods | Mock implements | Parity |
|---|---|---|---|
| `fs` | `setActiveProjectPath`, `getRoots`, `readText`, `writeText`, `exists`, `readDir`, `delete`, `watchStart`, `watchStop`, `onWatchEvent` (10) | All 10 | FULL |
| `settings` | `get`, `set`, `delete`, `save` (4) | All 4 | FULL |
| `dialog` | `open`, `ask` (2) | Both | FULL |
| `opener` | `revealInDir` (1) | Present | FULL |
| `claude` | `seedAgents`, `scaffoldProject`, `readTemplate` (3) | All 3 | FULL |

`opener` namespace: not in ADR D5's explicit list but present in `AgentConApi` (`global.d.ts:81`). Builder correctly added it to satisfy the TypeScript shape check. The `mock: Window["agentcon"]` type annotation at `agentconMock.ts:79` means TypeScript enforced full shape compliance at compile time.

Global install path: `(globalThis as any).window.agentcon = mock` (`agentconMock.ts:213`). Under jsdom, `globalThis.window` is the window object (`window.window === window` by the DOM spec's reflexive window reference). Setting `globalThis.window.agentcon` is equivalent to setting `window.agentcon`. Since `claudeConfigStore.ts` accesses `window.agentcon.*` directly (e.g. line 163, 209, 210, etc.) with no import indirection, the mock IS consulted on every call. The install path is faithful.

---

### Test Substance

11 tests reviewed. Tally:

| # | Test | Classification |
|---|---|---|
| 1 | CSS Modules non-empty object with original class key | SUBSTANTIVE — exact key membership + typeof assertion |
| 2 | Renders component using CSS module class | BORDERLINE — minimal but tests className passthrough meaningfully |
| 3 | Direction 1: getPropertyValue reads custom property | SUBSTANTIVE — exact value assertion `#b8362b` |
| 4 | Direction 2: color via var() documents jsdom behavior | INTENTIONAL DOCUMENTATION — asserts only non-throw; known always-pass |
| 5 | Direction 1 (project tokens): three design-system token values | SUBSTANTIVE — exact value assertions for 3 tokens |
| 6 | window.agentcon installed by setup.ts beforeEach | SUBSTANTIVE — shape verification across 6 methods |
| 7 | fake fs returns null for missing paths | SUBSTANTIVE |
| 8 | fake fs round-trips written content | SUBSTANTIVE — write + read + JSON parse |
| 9 | CONS-08: writeShouldFail option makes writeText reject | SUBSTANTIVE |
| 10 | CONS-08: writeShouldFail with custom Error | SUBSTANTIVE |
| 11 | getRoots returns predictable test paths | SUBSTANTIVE |

Result: 9 substantive, 1 borderline (meaningful), 1 intentional documentation test. The Direction-2 documentation test is appropriate — it is a canary that will surface if jsdom ever improves its var() resolution behavior, and its comment explicitly explains why Phase 5 tests must use Direction 1. No trivial "expect(true).toBe(true)" tests.

---

### Performance

No red flags. Test infrastructure only; no production code path changes.

---

### Security Smells

None. Test infrastructure only. No secrets, no XSS risk, no auth issues, no sensitive logging.

---

### UI Spec Compliance

Not applicable — Phase 0 produces no UI.

---

### ADR Compliance

Phase 0 follows ADR D4 and D5 as specified. The three deviations are classified below under Non-Blocking Findings.

Phase 0 implementation notes (PRD §9 Phase 0) fully followed:
- Anti-patterns respected: no `identity-obj-proxy`, no `vi.mock("electron")`, no `vi.mock("../../stores/claudeConfigStore")`, no separate `@testing-library/dom` install.
- File set: 5 authorized files + 1 explicitly authorized 6th file (`tsconfig.test.json`) + 1 fixture file (`tests/fixtures/Example.module.css`) needed by the bootstrap test. `tests/mocks/styleMock.ts` NOT created (correctly — Vitest's CSS Modules passthrough worked; the PRD conditional says "if yes, this file is not created").
- No `src/` source file modified by Phase 0.
- Phase boundary safety (AC-054): `npm run build` exits 0; production build unchanged.

---

### CONS-21 Documentation Recommendation

**Context:** jsdom 25 supports Direction 1 (direct read via `getPropertyValue('--token-name')`) but does NOT support Direction 2 (`var()` chain resolution in computed properties — `getComputedStyle(el).color` returns `""` when set via `var()`). This constraint is load-bearing: every visual AC in Phases 4/5 that asserts token values must use Direction 1 only.

**Current state:** The constraint is documented in (a) `tests/example.test.tsx` inline comments, (b) Builder's Phase 0 Build Summary, and (c) QA's Phase 0 verdict. None of these are read by Builder in subsequent phases by default.

**Recommended action for Architect or PM (not a Builder fault — no FAIL):**

Add a **D17 entry in the ADR** (append-only, referencing D4) documenting:
- jsdom 25 Direction-2 limitation confirmed in Phase 0 bootstrap test
- Requirement: all visual AC assertions in Phases 4/5 that read token-driven CSS values MUST use `getPropertyValue("--token-name")`, NOT `getComputedStyle(el).color/backgroundColor`
- Escape hatch if Direction-1 is insufficient for a future AC: switch to happy-dom environment per the Phase 0 exploration's documented alternatives

**Why ADR D17 over a consensus ledger entry:** Builders read relevant ADR decisions during exploration. A D17 appended to the existing ADR sits alongside D4 (the test-runner decision it constrains) and will be encountered naturally during Phase 4/5 exploration when the Builder reads D4 as a reference file. A consensus ledger entry (CONS-NN appended to PRD section 11) requires reopening the locked PRD — appropriate but heavier, and the constraint is technical rather than scope-level. The inline example test comment is a good secondary reference for test-writers who copy-paste the pattern.

Option (d) (inline hazard comment in `tests/example.test.tsx`) is already implemented by Builder and serves the copy-paste guidance role. The ADR entry is the durable, exploration-phase-accessible record.

---

### Non-Blocking Findings

#### SUGGESTION 1: ADR D4 should be updated with two forced-correction addenda

**Files:** ADR.md (not a code file — for Architect action)
**Category:** ADR documentation gap
**Issue:** Two deviations from ADR D4 were forced corrections to errors in the ADR itself, not Builder scope expansions:
- Deviation 1: ADR D4 specifies `vitest@^2 (peer-aligned with Vite 7)` — factually incorrect; vitest 2.x requires `vite@^5`; the project uses vite 7.3.2; vitest 4.x is the correct peer-aligned choice.
- Deviation 2: ADR D4's config snippet omits `css.include: [/\.module\.css$/]` — without this key, Vitest's CSS pipeline returns a Proxy with zero enumerable keys, failing AC-049's CONS-01 requirement.
**Why it matters:** Future ADR readers (and subsequent Builder phases that reference D4) should see the correct version spec and the complete required config. If Phase 1 or later Builders reference D4's config snippet, they may omit `css.include` when extending test configuration.
**Recommended fix:** Architect appends a correction note to ADR D4 (or a new D17) documenting: (a) vitest version correction from `^2` to `^4.x` with the vite-peer explanation; (b) `css.include: [/\.module\.css$/]` is required for non-empty CSS Module exports under Vitest's default config.

#### SUGGESTION 2: CONS-21 jsdom limitation needs a durable ADR home

See the dedicated "CONS-21 Documentation Recommendation" section above. No Builder action needed; Architect/PM action recommended.

#### NIT 1: Double cleanup call in `tests/example.test.tsx`

**File:** `tests/example.test.tsx:38-41`
**Issue:** `afterEach(() => { cleanup(); })` is called explicitly, but `@testing-library/react` v16+ automatically registers an `afterEach(cleanup)` hook when it detects a test framework. Under Vitest, RTL's automatic cleanup runs first, then the explicit `afterEach` runs a second time. Double cleanup is idempotent in RTL and harmless, but the explicit call is redundant.
**Why NIT:** No observable impact; harmless. Mentioned so future test-writers who copy-paste this pattern don't propagate the redundancy unnecessarily.
**Recommended fix:** Remove the explicit `afterEach(() => { cleanup(); })` block from `example.test.tsx:38-41` if RTL's automatic cleanup is confirmed active (it is, in RTL v16 with Vitest). Or retain it as an explicit declaration for clarity — either is fine.

---

### Phase Status

REVIEWER_PASS — security trigger is OFF per PRD §1 and confirmed in the locked scope section of §11. Phase 0 is complete. Advancing to Phase 0.5.
