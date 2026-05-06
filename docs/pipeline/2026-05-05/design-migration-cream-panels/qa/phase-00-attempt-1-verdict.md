# QA Verdict: PASS

**Phase:** 0 — Test runner setup
**Attempt:** 1
**Date:** 2026-05-03
**PRD Status:** LOCKED (confirmed via §11 consensus block — "Consensus Status: LOCKED — 2026-05-05")
**Phase state at invocation:** READY_FOR_QA (confirmed in phase-state.json)

---

## Step 1 — AC Testability Pre-Check

All four ACs are in Given/When/Then form with concrete observable outcomes and no vague language. All four pass the pre-check.

| AC | Testability verdict |
|---|---|
| AC-047 | TESTABLE — falsifiable by reading package.json scripts block and running `npm run test:run` |
| AC-048 | TESTABLE — falsifiable by reading package.json devDependencies and spot-checking node_modules |
| AC-049 | TESTABLE — falsifiable by running the example test that asserts both CONS-01 legs |
| AC-050 | TESTABLE — falsifiable by design verification (single vitest.config.ts at root, single setup.ts) |

---

## Step 2 — Test Plan

| AC | Criterion (quoted from PRD §5) | Test Type | Test Description |
|---|---|---|---|
| AC-047 | "runs the test suite and exits 0 with at least one passing test" | integration | Execute `npm run test:run`, assert exit code 0, assert ≥1 test passes |
| AC-048 | "`test` script exists ... `devDependencies` entry exists for vitest + @testing-library/react" | static | Read package.json; confirm `test` and `test:run` in scripts; confirm all 5 devDeps present; spot-check node_modules |
| AC-049 | "jsdom environment is configured, CSS Modules are compiled, at least one example test demonstrating render() + getComputedStyle() round-trip" | unit | Read vitest.config.ts for jsdom env; read example.test.tsx for CONS-01 and CONS-21 assertions; run tests |
| AC-050 | "those phases' AC tests execute under the same runner without additional setup steps" | static | Verify single vitest.config.ts at root; single tests/setup.ts; no per-phase config required |

---

## Step 3 — AC-by-AC Evidence

### AC-047: test script in package.json + `npm run test:run` exits 0

**Spec:** "when a developer runs the test command Architect picks in §8 (`npm test` or `npm run test`), then Vitest executes, runs the test suite, and exits 0 with at least one passing test"

**Evidence — package.json scripts block (lines 13–14):**
```json
"test": "vitest",
"test:run": "vitest run"
```
Both scripts present. `test` invokes watch mode; `test:run` invokes one-shot mode.

**Evidence — `npm run test:run` output:**
```
 RUN  v4.1.5 /Users/.../Agentcon

 Test Files  1 passed (1)
      Tests  11 passed (11)
   Start at  08:59:21
   Duration  434ms
```
Exit code: 0. 11/11 tests pass.

**Verdict: PASS**

---

### AC-048: vitest + Testing Library + jsdom installed

**Spec:** "`devDependencies` entry exists for the chosen runner and for `@testing-library/react`"

**Evidence — package.json devDependencies (lines 27–41):**
```json
"@testing-library/jest-dom": "^6.6.3",
"@testing-library/react": "^16.3.0",
"@testing-library/user-event": "^14.5.2",
"jsdom": "^25.0.1",
"vitest": "^4.1.5"
```
All five named devDeps present.

**node_modules spot-check:**
- `node_modules/vitest` — present. Installed version: 4.1.5.
- `node_modules/@testing-library/` — present. Contents: `dom`, `jest-dom`, `react`, `user-event`.
- `node_modules/jsdom` — present. Installed version: 25.0.1.
- `node_modules/@testing-library/react` — version 16.3.2 (satisfies ^16.3.0).
- `node_modules/@testing-library/jest-dom` — version 6.9.1 (satisfies ^6.6.3).
- `node_modules/@testing-library/user-event` — version 14.6.1 (satisfies ^14.5.2).

**Verdict: PASS**

---

### AC-049: jsdom environment + CSS Modules + getComputedStyle round-trip (CONS-01 + CONS-21)

**Spec:** "a JSDOM environment is configured, CSS Modules are mocked or compiled in a way that allows component tests to render, and at least one example test exists demonstrating a `render()` + `getComputedStyle()` round-trip"

**PRD §8.6 tightened binding (CONS-01):** "the test asserts that `import styles from '*.module.css'` produces a non-empty exports object AND that `getComputedStyle()` returns non-empty values for at least one custom property"

**Evidence — vitest.config.ts:**
```ts
test: {
  environment: "jsdom",
  setupFiles: ["./tests/setup.ts"],
  css: {
    include: [/\.module\.css$/],
    modules: { classNameStrategy: "stable" },
  },
  globals: false,
}
```
- `environment: "jsdom"` present (line 7).
- `setupFiles: ["./tests/setup.ts"]` present (line 8).
- `css.modules.classNameStrategy: "stable"` present (line 22).
- `css.include: [/\.module\.css$/]` present (line 20) — Deviation 2 (see Step 5 below).

**Evidence — tests/example.test.tsx CONS-01 leg (lines 50–51):**
```ts
const keys = Object.keys(styles as Record<string, string>);
expect(keys.length).toBeGreaterThan(0);
```
Asserts CSS Module import produces a non-empty object. Builder confirmed `styles.container` resolves to `"_container_f6e565"`.

**Evidence — tests/example.test.tsx CONS-21 Direction 1 (lines 96–102):**
```ts
el.style.setProperty("--example-color", "#b8362b");
const value = getComputedStyle(el).getPropertyValue("--example-color");
expect(value).not.toBe("");
expect(value.trim()).toBe("#b8362b");
```
Asserts `getPropertyValue` reads back a non-empty, correct custom property value. This is the load-bearing direction for this run's visual ACs.

**CONS-21 Direction 2 (var() chain resolution — lines 105–128):**
The test documents and confirms that jsdom 25 does NOT resolve `var()` chains in computed properties (e.g. `getComputedStyle(el).color` on an element with `color: var(--example-color)` returns `""`). The test asserts only the non-failure condition: `typeof computedColor === "string"`. This is an acknowledged jsdom limitation documented in the test and in ADR D4. Direction 1 (`getPropertyValue`) is confirmed as the canonical assertion strategy for all visual ACs in this run.

**Assessment of CONS-21 var() limitation:**
The var() chain does not resolve in jsdom. This is a known, documented limitation. Every downstream visual AC in Phases 2–5 that needs token value assertions must use `getPropertyValue("--token-name")`, not `getComputedStyle().color`. The example test explicitly documents this. ADR D4 acknowledges it and scopes the strategy accordingly. This is not a blocker — it is the correctly documented operating constraint.

**Test run confirms both CONS-01 legs pass:** 11/11 tests pass in the run output.

**Verdict: PASS** (with the noted jsdom var() limitation documented as the run's assertion strategy constraint — Direction 1 only, per ADR D4)

---

### AC-050: no per-phase test-config drift

**Spec:** "those phases' AC tests execute under the same runner without additional setup steps"

**Evidence:**
- Single `vitest.config.ts` at repo root. No per-directory config files.
- Single `tests/setup.ts` referenced by `setupFiles`.
- `tests/setup.ts` installs `@testing-library/jest-dom` matchers globally and runs `installAgentconMock()` in `beforeEach`. Every subsequent test file that imports Testing Library will have the mock and matchers pre-wired with no additional setup.
- No package.json `"test"` script per-package (no monorepo setup). One command, one config.

**Verdict: PASS**

---

## Step 4 — CONS-21 Deep Verification

**CONS-21 scope:** "highest-risk obligation for the entire run — every visual AC downstream depends on it working"

**Two-direction assessment:**

**Direction 1 (load-bearing):** `getComputedStyle(el).getPropertyValue("--token-name")` for inline-style-set custom properties. Confirmed working under jsdom 25.0.1. The project-token test at lines 131–149 of `example.test.tsx` asserts all three design-system tokens (`--surface-cream`, `--ink`, `--accent-red`) read back correctly via `getPropertyValue`. All pass. This is the canonical pattern for Phases 4/5 visual ACs.

**Direction 2 (var() chain):** `getComputedStyle(el).color` where `color: var(--example-color)` is set. Returns `""` under jsdom 25. Does NOT resolve the var() chain. The test documents this as expected behavior, not a test failure.

**Critical assessment:** The test for Direction 2 does NOT assert that `var()` resolves to a concrete color. It asserts only `typeof computedColor === "string"`. This means any downstream AC that writes `expect(getComputedStyle(el).color).toBe("#b8362b")` will fail. The run's AC strategy must use Direction 1 exclusively for all visual token assertions.

This is the documented approach. All Phases 4/5 visual ACs bind to `getPropertyValue()` assertions per ADR D4 / §8.6. No downstream visual AC is written to rely on Direction 2. The run's assertion strategy is consistent with the documented jsdom limitation.

**Verdict: CONS-21 Direction 1 CONFIRMED WORKING. Direction 2 limitation DOCUMENTED AND ACCEPTED. Not a blocker.**

---

## Step 5 — CONS-08 Verification (write-error injection knob)

**Spec from ADR D5 / CONS-08:** `installAgentconMock(options?)` accepts `writeShouldFail?: boolean | Error`; when set, `fs.writeText()` rejects with the provided error.

**Evidence — agentconMock.ts lines 24–37:**
```ts
export interface AgentconMockOptions {
  writeShouldFail?: boolean | Error;
  initialFs?: Map<string, string>;
}
```

**Implementation (lines 65–70):**
```ts
const writeError: Error | undefined =
  options.writeShouldFail === true
    ? new Error("Mock write failure — writeShouldFail was set to true")
    : options.writeShouldFail instanceof Error
      ? options.writeShouldFail
      : undefined;
```

**writeText implementation (lines 100–106):**
```ts
writeText(absPath: string, contents: string): Promise<void> {
  if (writeError) {
    return Promise.reject(writeError);
  }
  fakeFs.set(absPath, contents);
  return Promise.resolve();
},
```

When `writeShouldFail: true`, every `writeText` call rejects with "Mock write failure — writeShouldFail was set to true". When passed a custom `Error`, that error is used.

**Evidence — example.test.tsx CONS-08 tests (lines 184–201):**
- Test at line 184: `installAgentconMock({ writeShouldFail: true })` → asserts `.rejects.toThrow("Mock write failure")`. Passes (part of 11/11).
- Test at line 195: `installAgentconMock({ writeShouldFail: new Error("EACCES: permission denied") })` → asserts `.rejects.toThrow("EACCES: permission denied")`. Passes.

**Alignment with claudeConfigStore.ts call site:** The store calls `window.agentcon.fs.writeText()` via an async chain. A rejection from `writeText()` will propagate as a rejected Promise, which the store catches in its try/catch or surfaces as an error state (driving the alert in AC-042 case 3). The mock's rejection shape (thrown Error) matches what a real Electron IPC failure would produce.

**Verdict: CONS-08 PASS — write-failure injection knob verified working for both `true` and custom `Error` cases.**

---

## Step 6 — Three Builder Deviations

### Deviation 1: vitest@^4.1.5 instead of vitest@^2

**ADR D4 text:** "vitest@^2 (peer-aligned with Vite 7)"

**Evidence — package.json line 39:** `"vite": "^7.0.4"`. Installed version confirmed as vite 7.3.2 (visible in Builder's summary).

**Assessment:** ADR D4's claim that "vitest@^2 is peer-aligned with Vite 7" is factually incorrect — vitest 2.x requires `vite@^5`, not vite 7. Builder's investigation confirmed vitest 4.1.5 explicitly supports `vite: "^6.0.0 || ^7.0.0 || ^8.0.0"`. This project runs vite 7.3.2. Vitest 4.x is the correct peer-aligned choice. The functional APIs (jsdom env, CSS modules config, setupFiles) are identical. ADR D4 should be updated in the next revision round to note this version correction.

**Decision: ACCEPT.** Vite 7 is confirmed; vitest 4.x is the correct peer. ADR D4's version spec was an error on the Architect's part that Builder correctly resolved.

---

### Deviation 2: `css.include: [/\.module\.css$/]` added to vitest.config.ts

**ADR D4 specified config:**
```ts
css: { modules: { classNameStrategy: "stable" } }
```
No `css.include` key was specified.

**Evidence — vitest.config.ts lines 19–24:**
```ts
css: {
  include: [/\.module\.css$/],
  modules: { classNameStrategy: "stable" },
},
```

**Builder's reasoning (build summary, CONS-01 verification):** Without `css.include`, Vitest's CSS pipeline returns a Proxy for `.module.css` imports with zero enumerable own keys — `Object.keys(proxy) === []`. AC-049's tightened binding (CONS-01: "produces a non-empty exports object") fails. Adding `css.include: [/\.module\.css$/]` enables real Vite CSS pipeline processing, returning a proper `Record<string, string>`.

**Assessment:** This is a necessary fix for a known Vitest gotcha that Architect did not anticipate. Without it, AC-049 cannot pass. The option is narrowly scoped (only `.module.css` files — non-module CSS is unaffected). Architect should add this to ADR D4 in a future revision as a documentation correction; it is not a substantive deviation from the ADR's intent.

**Decision: ACCEPT.** Required for AC-049 CONS-01 compliance. ADR D4 should note this in a future revision.

---

### Deviation 3: `tsconfig.test.json` as a 6th file

**PRD §9 Phase 0 file list:** Five files. The optional 6th slot was for `tests/mocks/styleMock.ts` (not needed — Vitest CSS Modules worked). `tsconfig.test.json` is not in the §9 file list.

**PRD §9 Phase 0 implementation notes text (exploration.md, line 94, quoting the implementation notes):** "If the existing `tsconfig.web.json` or `tsconfig.json` doesn't include test files, either extend it or add a `tsconfig.test.json` that does." This instruction was provided in the user prompt driving the Builder session and is characterized as "explicitly authorized by the implementation notes."

**ADR D4:** Does not mention a separate test tsconfig. However, ADR D4 specifies the test files live in `tests/`, and `tsconfig.web.json` only includes `src/**/*`. A test tsconfig is the correct mechanical solution for clean typecheck of test files without mutating the renderer build config.

**Evidence — tsconfig.test.json:**
```json
{
  "extends": "./tsconfig.web.json",
  "compilerOptions": { "composite": false, "noEmit": true, "types": ["vitest/globals", "node"] },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["src/electron/**"]
}
```
Extends the renderer config; adds `tests/**/*` to include; sets `noEmit: true` (does not affect build artifacts). Builder confirmed `npx tsc -p tsconfig.test.json --noEmit` exits 0.

**Assessment:** The file is mechanically necessary infrastructure given that `tsconfig.web.json` excludes `tests/`. The PRD's implementation notes (as quoted in the exploration file) authorized this pattern. The deviation from the 5-file list is minor: the file is pure tooling metadata, touches no source or production code, and is explicitly in the spirit of the PRD's own conditional note.

**Decision: ACCEPT.** Mechanically necessary; authorized by the implementation notes; no production impact.

---

## Step 7 — Anti-Pattern / Leakage Check

**`git status` evidence:**
- `M package.json` — expected Phase 0 modification (scripts + devDeps). CLEAN.
- `M src/App.tsx` — NOT a Phase 0 modification. This is the pre-existing change from the `2026-05-03/test-run-landing-page` prior pipeline run (confirmed by Builder's Phase 0 summary: "The pre-existing modification to `src/App.tsx` is from the `thin-test-landing-page` prior pipeline run, not from Phase 0"; confirmed by `git log` showing only one commit pre-dates this run). Phase 0 did not touch this file.
- `M .gitignore`, `M package-lock.json` — infrastructure modifications, expected.
- `?? vitest.config.ts`, `?? tsconfig.test.json`, `?? tests/` — expected new files from Phase 0.
- All other `??` entries are prior-run artifacts, new assets, or pipeline documents. None are under `src/panels/`, `src/styles/`, or `src/stores/`.

**No baseline capture:** `tests/baseline/` directory does not exist. Correct — Phase 0.5 owns that.
**No token changes:** `src/styles/tokens.css` and `src/styles/tokens-landing.css` are not listed as modified.
**No component changes:** no files under `src/panels/` are modified or created by Phase 0.
**No store changes:** no files under `src/stores/` are modified.

**Verdict: No leakage. Phase 0 stayed strictly within its authorized file set.**

---

## AC Coverage Summary

| AC | Criterion | Tests | Result |
|---|---|---|---|
| AC-047 | `npm run test:run` exits 0, ≥1 passing test | `npm run test:run` → 11/11 pass, exit 0 | PASS |
| AC-048 | `test` + `test:run` scripts in package.json; 5 devDeps present | package.json lines 13–14, 27–41; node_modules confirmed | PASS |
| AC-049 | jsdom env + CSS Modules non-empty + getComputedStyle round-trip | vitest.config.ts + example.test.tsx (11 tests, CONS-01 + CONS-21) | PASS |
| AC-050 | No per-phase config drift | Single vitest.config.ts, single tests/setup.ts, no per-phase config | PASS |

---

## Test Results

- New tests: 11/11 pass (`tests/example.test.tsx`)
- Full suite: pass (11/11, no regressions — this is the first test suite run in this repo)
- CONS-01: PASS (non-empty CSS Module export confirmed)
- CONS-21: PASS with documented limitation (Direction 1 working; Direction 2 var() chain does not resolve under jsdom 25 — expected, documented, accepted)
- CONS-08: PASS (write-failure injection knob verified for both `true` and custom Error)

---

## Notes for Reviewer

The following observations are outside QA's AC-compliance lane but noted for Reviewer's attention:

1. `vitest.config.ts` uses `defineConfig` from `"vitest/config"` rather than composing with the existing `electron.vite.config.ts`. This is intentional (tests run outside Electron) but Reviewer may want to verify the plugins array (only `@vitejs/plugin-react` is included) is sufficient for the test environment.

2. ADR D4 specifies `vitest@^2`; actual installation is `vitest@^4.1.5`. ADR D4 should be updated to reflect the correct version in a future documentation round.

3. The `css.include: [/\.module\.css$/]` key is not in ADR D4's config snippet. ADR D4 should be updated to include this configuration in a future documentation round.

---

## Phase Status

QA_PASS — advancing to Reviewer
