# Build Summary: Phase 0 (Attempt 1)

## Phase

Phase 0 — Test runner setup (AC-047, AC-048, AC-049, AC-050)

---

## AC Targeted

- **AC-047:** `npm run test:run` exits 0 with at least 1 passing test (the bootstrap). SATISFIED: 11 tests pass.
- **AC-048:** `package.json` contains `"test"` and `"test:run"` scripts; devDeps include `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`. SATISFIED: all five devDeps present.
- **AC-049:** jsdom environment configured; CSS Modules compile with non-empty exports (`import styles` returns `{ container: "_container_f6e565" }`); at least one `render()` + `getComputedStyle()` round-trip example test. TIGHTENED BINDING: test asserts both `import styles` non-empty AND `getPropertyValue("--token")` returns non-empty value. SATISFIED: 11 tests pass, both assertions present.
- **AC-050:** Subsequent phases' tests run under the same harness without additional setup steps (single `vitest.config.ts` at root; single `tests/setup.ts`). SATISFIED: design ensures no per-phase config drift.

---

## Files Created

- `/Users/allanmittelstaedt/Desktop/B-Projects/GP/Agentcon/vitest.config.ts` — Vitest config: `environment: "jsdom"`, `setupFiles: ["./tests/setup.ts"]`, `css.include: [/\.module\.css$/]`, `css.modules.classNameStrategy: "stable"`. React plugin included.
- `/Users/allanmittelstaedt/Desktop/B-Projects/GP/Agentcon/tests/setup.ts` — Global test setup: imports `@testing-library/jest-dom/vitest`, registers `beforeEach` that calls `installAgentconMock()` to ensure fresh mock state per test.
- `/Users/allanmittelstaedt/Desktop/B-Projects/GP/Agentcon/tests/mocks/agentconMock.ts` — Full `AgentConApi` shape mock. Exports `installAgentconMock(options?)`. In-memory `Map<string, string>` fake-fs. `writeShouldFail` option (CONS-08). Returns fake-fs Map handle.
- `/Users/allanmittelstaedt/Desktop/B-Projects/GP/Agentcon/tests/fixtures/Example.module.css` — Tiny CSS fixture with `.container` class declaring `--example-color` and `--example-bg` custom properties. Used by bootstrap test.
- `/Users/allanmittelstaedt/Desktop/B-Projects/GP/Agentcon/tests/example.test.tsx` — Bootstrap test: CSS Modules pass-through (CONS-01), `getComputedStyle` round-trip (CONS-21), IPC mock seam shape verification, fake-fs round-trip, CONS-08 write-failure injection.
- `/Users/allanmittelstaedt/Desktop/B-Projects/GP/Agentcon/tsconfig.test.json` — Test-specific tsconfig extending `tsconfig.web.json`, adding `tests/**/*` to include list. Not in the PRD's 5-file list but explicitly called out in the implementation notes as required if `tsconfig.web.json` doesn't include test files (it doesn't).

## Files Modified

- `/Users/allanmittelstaedt/Desktop/B-Projects/GP/Agentcon/package.json` — Added `"test"` and `"test:run"` scripts; added devDependencies: `@testing-library/jest-dom@^6.6.3`, `@testing-library/react@^16.3.0`, `@testing-library/user-event@^14.5.2`, `jsdom@^25.0.1`, `vitest@^4.1.5`.

---

## Database Changes

None. Phase 0 is test infrastructure only.

---

## Mechanical Self-Verification

- **Typecheck (tsconfig.web.json):** PASS — `npx tsc -p tsconfig.web.json --noEmit` exits 0 with no errors
- **Typecheck (tsconfig.test.json):** PASS — `npx tsc -p tsconfig.test.json --noEmit` exits 0 with no errors (2 errors found and fixed during implementation: unused `React` import, `FsWatchEvent.type` string union mismatch in mock)
- **Existing test suite:** N/A — no tests existed before Phase 0
- **Lint:** N/A — no lint script exists in `package.json`
- **Build:** PASS — `npm run build` succeeds, all three electron-vite targets built (main: 11.47 kB, preload: 2.15 kB, renderer: 859.02 kB JS + 45.89 kB CSS)
- **Tests (npm run test:run):** PASS — 11/11 tests pass in `tests/example.test.tsx`
- **Imports verified:** All imports in test files resolve to real exports. `@testing-library/jest-dom/vitest` resolves. `@testing-library/react` cleanup/render/screen all resolve.
- **Behavioral spot-check:** AC-047 ✓ (npm run test:run exits 0); AC-048 ✓ (package.json scripts + devDeps); AC-049 ✓ (jsdom env + CSS Modules + round-trip test); AC-050 ✓ (single config, no drift).

---

## CONS-21 Verification Result

**Environment chosen: jsdom 25.0.1** (per ADR D4 / PRD §8.6 — more reliable than happy-dom for `getComputedStyle` + custom-property-read path).

**What the bootstrap test asserts:**

- Direction 1 (load-bearing for this run's visual ACs): `el.style.setProperty("--example-color", "#b8362b")` then `getComputedStyle(el).getPropertyValue("--example-color").trim() === "#b8362b"`. **PASS — confirmed working.**
- Direction 1 (project tokens): `setProperty("--surface-cream", "#f1ead8")` etc., then `getPropertyValue` returns the exact value. **PASS — all three tokens read back correctly.**
- Direction 2 (var() substitution in computed properties): `el.style.setProperty("color", "var(--example-color)")` then `getComputedStyle(el).color`. Under jsdom 25, this returns `""` (empty string) — jsdom does NOT perform full CSS variable substitution for computed properties. **DOCUMENTED LIMITATION — not a PASS for var() resolution, but Direction 1 is the canonical pattern for all visual ACs in this run.**

**Mitigation strategy:** This run's Phase 5 visual ACs (token values in computed styles) will use `getPropertyValue("--token-name")` for token value assertions rather than `getComputedStyle().color`. This is explicitly documented in the test file and is consistent with how jsdom behaves. The test runner setup is sufficient for the actual AC assertion strategy.

---

## CONS-01 Verification Result

`import styles from "./fixtures/Example.module.css"` returns `{ container: "_container_f6e565" }` — non-empty object with enumerable keys. `styles.container` is a non-empty string. `getPropertyValue("--example-color")` returns `"#b8362b"`. Both clauses of the tightened AC-049 binding satisfied.

**Root cause of initial failure:** Vitest's default CSS handling with no `css.include` option creates a Proxy object (not a plain object) for `.module.css` imports. The Proxy generates class names on property access but has no enumerable own keys — `Object.keys(proxy) === []`. 

**Fix applied:** `css.include: [/\.module\.css$/]` in `vitest.config.ts` enables real Vite CSS pipeline processing for `.module.css` files, which returns a proper `Record<string, string>` with original class names as keys and hashed values. This is the correct configuration for the run's assertion strategy.

---

## CONS-08 Verification Result

`installAgentconMock({ writeShouldFail: true })` causes every `fs.writeText()` call to reject with `"Mock write failure — writeShouldFail was set to true"`. `installAgentconMock({ writeShouldFail: new Error("EACCES: permission denied") })` rejects with the custom message. Both cases verified by tests in `example.test.tsx` that assert `.rejects.toThrow(...)`.

**Pattern chosen:** Options flag `AgentconMockOptions.writeShouldFail?: boolean | Error`. This is the cleanest pattern for Phase 0.5's baseline capture of AC-042 case 3 (save-failure alert) and Phase 5's assertion.

---

## IPC Mock Seam

`tests/mocks/agentconMock.ts` implements the full `AgentConApi` shape sourced from:
- `src/global.d.ts:52-90` — canonical interface declaration (`AgentConFs`, `AgentConSettingsApi`, `AgentConDialog`, `AgentConOpener`, `AgentConClaude`, `AgentConApi`)
- `src/electron/preload.ts` — production implementation (verified method signatures match)
- `src/stores/claudeConfigStore.ts` — call sites verified (`readText`, `writeText`, `getRoots`, `exists`, `readDir`, `delete`, `watchStart`, `watchStop`, `onWatchEvent`, `setActiveProjectPath`)

All five namespaces implemented: `fs`, `settings`, `dialog`, `opener`, `claude`. `opener` namespace added (present in `AgentConApi` but not in ADR D5's explicit list — required to satisfy TypeScript shape check).

---

## Deviations from PRD/ADR

1. **vitest@^4.1.5 instead of vitest@^2.** ADR D4 specifies "vitest@^2 (peer-aligned with Vite 7)." However, vitest 2.x requires `vite@^5.0.0` as a peer and does not support vite 7. Vitest 2.2.x was never released (the version range jumped from 2.1.x to 3.x to 4.x). vitest@4.1.5 is the current stable release and explicitly supports `vite: "^6.0.0 || ^7.0.0 || ^8.0.0"`. This is the correct peer-aligned choice for the project's actual vite version (7.3.2). The version used (4.1.5) provides all the same APIs the ADR specifies (jsdom environment, CSS Modules config, setupFiles). Functional impact: none.

2. **`css.include: [/\.module\.css$/]` added to vitest config.** The ADR/PRD specify `test.css.modules.classNameStrategy: "stable"` but do not specify `css.include`. Without `css.include`, Vitest's CSS pipeline returns a Proxy for `.module.css` files with zero enumerable keys, which fails the AC-049 tightened binding ("produces a non-empty exports object"). Adding `css.include: [/\.module\.css$/]` enables real Vite CSS pipeline processing only for CSS Module files, satisfying CONS-01. No impact on non-module CSS files.

3. **`tsconfig.test.json` created (6th file).** The PRD's Phase 0 "Files to touch (5)" list does not include a test tsconfig. However, the implementation notes explicitly say "If the existing `tsconfig.web.json` or `tsconfig.json` doesn't include test files, either extend it or add a `tsconfig.test.json`." Since `tsconfig.web.json` only includes `src/**/*` and test files live in `tests/`, the tsconfig.test.json is necessary for clean typecheck. This is explicitly authorized by the implementation notes.

4. **`tests/fixtures/Example.module.css` created (7th file).** The example test needs a CSS module to import. This fixture is test infrastructure, not a source file, and is required for CONS-01/CONS-21 verification. No impact on production code.

---

## Phase Boundary Safety (AC-054)

- No `src/` source files were modified by Phase 0
- `npm run build` succeeds — production build is unchanged
- The app boots and renders identically to pre-Phase-0 from production's perspective
- Test infra is unused by production code

---

## Confirmation of No Phase 0.5/1/2/3/4/5 Leakage

- No baseline fixtures created (Phase 0.5 owns that)
- No token changes in `src/styles/tokens.css` or `src/styles/tokens-landing.css`
- No modifications to `src/panels/` components or CSS modules
- No modifications to `src/stores/` files
- No modifications to `src/App.tsx` (the pre-existing modification to `src/App.tsx` is from the `thin-test-landing-page` prior pipeline run, not from Phase 0)
- No `--lp-*` → renamed-token work
- No mockup-issue resolution work

---

Status: READY_FOR_QA
