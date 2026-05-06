# Phase 0 Exploration

## 1. PRD Lock Confirmation

The lock line from the consensus block at the end of §11 reads:

> **Consensus Status: LOCKED — 2026-05-05**
> **PRD locked at 2026-05-05 (CTO final lock block).**

The sign-off ledger shows: PM Round 1 APPROVED, CTO Round 1 APPROVED, Architect Round 1 APPROVED (self-flagged), CTO Round 2 APPROVED. PM Round 2 verdict: "APPROVED with named concerns. Pipeline advances to Builder execution starting at Phase 0."

The PRD is confirmed locked. Builder proceeds.

---

## 2. Phase 0 File List (from PRD §9 Phase 0)

PRD §9 Phase 0 "Files to touch (5):" lists:

1. `package.json` — modify: add devDependencies + `test` and `test:run` scripts
2. `vitest.config.ts` — new: at repo root
3. `tests/setup.ts` — new
4. `tests/mocks/agentconMock.ts` — new
5. `tests/example.test.tsx` — new: bootstrap test demonstrating `render()` + `getComputedStyle()` round-trip

Optional 6th file: `tests/mocks/styleMock.ts` — only if Vitest's built-in CSS Modules support produces empty exports under jsdom (verified by the bootstrap test). The PRD says "if yes, this file is not created."

Phase 0 does NOT create:
- `tests/baseline/` — Phase 0.5 owns baseline capture
- `tests/landing-regression.test.tsx` — Phase 2
- `tests/settings-regression.test.tsx` — Phase 5

---

## 3. Phase 0 AC List

Per PRD §9 Phase 0 header: **AC-047, AC-048, AC-049, AC-050.**

Summary:
- **AC-047:** `npm run test:run` exits 0 with at least 1 passing test
- **AC-048:** `package.json` has `test` script in scripts block + devDeps include vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom
- **AC-049:** jsdom environment configured, CSS Modules compiled (non-empty styles export), at least one `render()` + `getComputedStyle()` round-trip example test. Tightened per §11 Architect Sign-off: the test asserts `import styles` produces a non-empty object AND `getComputedStyle()` returns a non-empty value for at least one custom property.
- **AC-050:** Subsequent phases' AC tests run under the same harness without additional setup steps (no per-phase test-config drift)

---

## 4. Build-Config Reconnaissance

### Confirm electron-vite

`package.json` scripts block contains:
```json
"dev": "electron-vite dev",
"build": "electron-vite build",
"preview": "electron-vite preview",
```
`devDependencies` includes `"electron-vite": "^5.0.0"`. This is electron-vite, NOT plain Vite.

The `electron.vite.config.ts` uses `defineConfig` from `electron-vite` and structures three build targets: `main`, `preload`, and `renderer`. The renderer section has `root: "."` and uses `@vitejs/plugin-react`. There is no custom CSS Modules configuration in the current config — CSS Modules pass-through is Vite's default behavior and flows through electron-vite's renderer target unchanged.

### Existing CSS Modules Configuration

No custom `css` key appears in `electron.vite.config.ts`. The renderer target inherits Vite's default CSS Modules support. Per ADR D4 and PRD §8.6, the Vitest config will add `test.css.modules.classNameStrategy: "stable"` to make generated class names deterministic across runs.

### Renderer Entry Point

`src/main.tsx` is the renderer entry: `ReactDOM.createRoot(document.getElementById("root")!).render(...)`. It imports `./styles/tokens.css` globally.

### `window.agentcon` preload bridge

`src/electron/preload.ts` uses `contextBridge.exposeInMainWorld("agentcon", api)` to expose the `agentcon` object. The interface is declared in `src/global.d.ts` as `AgentConApi`:

```typescript
interface AgentConApi {
  settings: AgentConSettingsApi;   // get, set, delete, save
  dialog: AgentConDialog;          // open, ask
  opener: AgentConOpener;          // revealInDir
  fs: AgentConFs;                  // setActiveProjectPath, getRoots, readText, writeText,
                                   // exists, readDir, delete, watchStart, watchStop, onWatchEvent
  claude: AgentConClaude;          // seedAgents, scaffoldProject, readTemplate
}
```

### TypeScript Config Split

- `tsconfig.json` — project references only: references `tsconfig.node.json` and `tsconfig.web.json`
- `tsconfig.node.json` — covers `src/electron/**/*` and `electron.vite.config.ts`; target ES2022, Node+Electron types
- `tsconfig.web.json` — covers `src/**/*` excluding `src/electron/**`; target ES2020, lib DOM; `jsx: react-jsx`; `strict: true`

The web tsconfig `include` is `["src/**/*"]` with `exclude: ["src/electron/**"]`. Test files live in `tests/` which is NOT included by `tsconfig.web.json`. I need to either extend `tsconfig.web.json` to include `tests/` or create a `tsconfig.test.json`.

Decision: create `tsconfig.test.json` that extends `tsconfig.web.json` and adds `"include": ["src/**/*", "tests/**/*"]`. This avoids mutating the renderer TS config (which is a build artifact) and satisfies Vitest's need to type-check test files. The `vitest.config.ts` will reference this tsconfig.

Actually, per the PRD's "Files to touch" list, `tsconfig.test.json` is not listed. Let me reconsider: Vitest does not require a separate tsconfig to run. It will inherit Vite's transform pipeline and use the project's tsconfig. Since `tsconfig.web.json` only includes `src/**/*`, the test files at `tests/**/*` won't be included in the type-checker. To keep type-checking clean with `npx tsc`, I'll add a `tsconfig.test.json` at the root. This is a supporting file not enumerated in the PRD's "Files to touch" but is mechanical infrastructure. PRD §9 Phase 0 says "If the existing tsconfig.web.json or tsconfig.json doesn't include test files, either extend it or add a tsconfig.test.json that does." — this instruction is from the user prompt, so it is in scope.

Decision: create `tsconfig.test.json` extending `tsconfig.web.json`, adding `tests/**/*` to include. Note this as a 6th file (within the spirit of the PRD, which acknowledges the optional `styleMock.ts` as a 6th file slot).

---

## 5. CONS-21: jsdom `getComputedStyle()` + `var()` Round-Trip

### Hypothesis Being Verified

jsdom resolves CSS custom properties (`--token-name`) when:
- (Direction 1) Calling `getComputedStyle(el).getPropertyValue('--token-name')` returns the raw token value
- (Direction 2) Calling `getComputedStyle(el).borderColor` (or similar property) where the value is set via `var(--token-name)` returns either (a) the resolved concrete value, or (b) the raw `var(--token-name)` string

**Key risk:** jsdom has known limitations with CSS custom property resolution. It does NOT perform full CSS variable substitution for computed properties: `getComputedStyle(el).color` set via `color: var(--ink)` will NOT return `#1d1c19` — jsdom will return the raw `var(--ink)` string or an empty string, depending on the jsdom version. However, `getComputedStyle(el).getPropertyValue('--ink')` WILL return the raw token value when it's set via `el.style.setProperty()` or via injected CSS that jsdom can parse.

### Verification Plan for the Bootstrap Test

The bootstrap test at `tests/example.test.tsx` will:

1. Create a tiny CSS module (inline style injection in the test, not a real .module.css import initially) that declares a CSS custom property, then apply it to a rendered element
2. Assert `getComputedStyle(el).getPropertyValue('--test-color')` returns the expected value (Direction 1)
3. Assert `getComputedStyle(el).color` resolves via the var() chain (Direction 2 — expected to be the raw `var()` string or the resolved value depending on jsdom version)

**Escape hatches if round-trip fails:**
- If jsdom returns empty strings: switch to happy-dom (which has better CSS resolution in recent versions)
- If neither resolves var() in computed properties: fall back to asserting on raw stylesheet text for properties that use var(), and use direct `getPropertyValue('--token')` assertions for token value reads
- The PRD and ADR both specify jsdom as the choice (ADR D4), so I'll try jsdom first and switch to happy-dom only if the bootstrap test fails

### Expected Output Format

- `getComputedStyle(el).getPropertyValue('--test-token')` on an element that has `--test-token: #ff0000` in scope: expected to return `"#ff0000"` or `" #ff0000"` (with leading space). PASS criterion: non-empty string.
- `getComputedStyle(el).color` on an element with `color: var(--test-token)` where `--test-token: #ff0000`: jsdom behavior is to return `""` or `"var(--test-token)"`. The PRD's visual ACs need the token READ path (direction 1) more than the computed-property path (direction 2). Direction 2 is "nice to have" for computed style assertions.

The bootstrap test will assert Direction 1 (getPropertyValue) and attempt Direction 2 but not fail if it returns the raw var() string — this will be documented in the test comment and the build summary.

---

## 6. CONS-01 (AC-049 Tightened Binding) Plan

Per the §11 Architect sign-off tightening: "the test asserts that `import styles from '*.module.css'` produces a non-empty exports object AND that `getComputedStyle()` returns non-empty values for at least one custom property."

The bootstrap test at `tests/example.test.tsx` will:
1. Import a CSS module (create a tiny fixture module `tests/fixtures/Example.module.css` with at least one class that sets a CSS custom property)
2. Assert `Object.keys(styles).length > 0` (non-empty styles export)
3. Render a component that uses the styles class
4. Inject or rely on the CSS module to define a custom property
5. Assert `getComputedStyle(el).getPropertyValue('--some-token')` returns a non-empty string

File path of the example test: `/Users/allanmittelstaedt/Desktop/B-Projects/GP/Agentcon/tests/example.test.tsx`

---

## 7. CONS-08 (Write-Error Injection Knob in `agentconMock.ts`)

PM Round 2 flagged that AC-042 case 3 (save-failure alert) needs a way to make the mock simulate a write error.

**Chosen pattern:** An options flag `installAgentconMock(options?: { writeShouldFail?: boolean | Error })`.

When `writeShouldFail` is truthy, every call to `fs.writeText()` will reject with the provided Error (or a default `Error("Mock write failure")` if `true` is passed).

Example usage:
```typescript
const mock = installAgentconMock({ writeShouldFail: new Error("EACCES: permission denied") });
// mount panel, try to save, assert alert text matches baseline
```

This is simple, covers the AC-042 case 3 requirement, and doesn't require a stateful method call. The option can be set per-test via `installAgentconMock({ writeShouldFail: true })` in that test's setup.

---

## 8. Phase 0 Anti-Patterns (Hard Rules)

Per PRD §9 Phase 0 Anti-patterns:
- Do NOT install `identity-obj-proxy` unless the bootstrap test demonstrates Vitest's built-in CSS Modules don't work under jsdom
- Do NOT mock `electron` directly — the renderer never sees `electron`; it sees `window.agentcon` via the preload bridge
- Do NOT `vi.mock("../../stores/claudeConfigStore", ...)` — the store is in scope; the IPC bridge below it is what gets mocked
- Do NOT add `@testing-library/dom` separately — `@testing-library/react` includes it

Per the user prompt's hard rules:
- Do NOT edit `src/App.tsx`, `src/styles/tokens.css`, `src/styles/tokens-landing.css`, any `src/panels/` component or CSS module, any `src/stores/` file
- Do NOT capture pre-migration baselines (Phase 0.5 owns that)
- Do NOT introduce any token rename or mockup-issue resolution work

---

## 9. Consensus Ledger Items Applicable to Phase 0

**CONS-21 (CTO Round 2 #6, Architect watching #4, PM Round 2 watching #3):** "Phase 0 bootstrap test must demonstrate `getComputedStyle()` + `var()` round-trip under jsdom. Builder must not advance past Phase 0 with a hollow bootstrap."

Phase 0 satisfies this by: creating `tests/example.test.tsx` with an explicit round-trip assertion. The test renders a component with a known CSS custom property in scope and asserts `getPropertyValue('--test-token')` is non-empty. If it fails, I switch to happy-dom before marking READY_FOR_QA.

**CONS-01 (AC-049 tightening from Architect §11 sign-off):** "The test asserts that `import styles from '*.module.css'` produces a non-empty exports object AND that `getComputedStyle()` returns non-empty values for at least one custom property."

Phase 0 satisfies this by: the bootstrap test imports a CSS module fixture, asserts the styles object is non-empty, and asserts the computed style round-trip returns a non-empty value.

**CONS-08 (PM Round 2 watching #1):** "AC-042 case 3 (save-failure alert) needs a write-error injection knob in `agentconMock.ts`."

Phase 0 satisfies this by: `agentconMock.ts` exports `installAgentconMock(options?: { writeShouldFail?: boolean | Error })` which makes `fs.writeText` reject when the flag is set. This knob is available for Phase 0.5's baseline capture of case 3 and Phase 5's assertion.

**AC-047 (Phase 0 bootstrap test exits 0):** Satisfied by `npm run test:run` exiting 0 with the passing example test.

**AC-048 (package.json scripts + devDeps):** Satisfied by adding `test` and `test:run` scripts and the required devDependencies.

**AC-049 (jsdom + CSS Modules + round-trip):** Satisfied by the vitest config + bootstrap test.

**AC-050 (no per-phase test-config drift):** Satisfied by design — single `vitest.config.ts` at root, single `tests/setup.ts`, all subsequent phases add test files without needing new config.
