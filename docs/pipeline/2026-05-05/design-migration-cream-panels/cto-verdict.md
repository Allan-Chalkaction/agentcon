## CTO Verdict: Design-System Migration — Cream Panels on Dark Chrome

**Decision:** SIMPLIFY
**Confidence:** Medium-High
**Date:** 2026-05-03

---

### One-line summary

Approved as a unified design-system migration, but the scope must be split: this PRD covers the **token consolidation, panel-border treatment, dev-switch fix, and the four mockup-issue resolutions** as a system foundation, with the settings-panel surface migrated as a single follow-on phase set inside the same run only if Architect can prove every phase boundary is independently shippable; otherwise the settings-panel migration spins out to a second run.

---

### Assessment

- **Strategic alignment: strong** — The bifurcation in ADR D2 was deliberately temporary. The landing-page run shipped (45/45 AC, 4 phases REVIEWER_PASSED) and validated the visual language. Letting `--lp-*` ossify as a dialect-specific namespace creates a permanent landing/settings divide that contradicts the verdict-stage premise that the landing aesthetic is the product aesthetic. Unifying now is cheaper than unifying after a third surface ships.

- **Technical feasibility: moderate, with one specific hazard** — Token rename and consolidation is mechanical. The hazard is the settings panel itself: it is functionality-critical (loads, edits, and saves Claude Code config), it has been an untouched Phase-1 invariant throughout the landing run (PRD AC-002, AC-039), and we have no visibility yet into how many CSS modules and components live inside `src/panels/claude-settings/` because no exploration was done before this verdict. Architect's first job is to enumerate that surface and report file count back. If it's >25 files, phase sizing per `.claude/rules/` (≤5 files/phase) becomes a real constraint and the settings work fragments into many phases.

- **Tech debt impact: net reducing, but creates short-term risk** — Long term: collapses two parallel token systems into one, removes the `--lp-*` prefix as a stratigraphy marker, fixes the known dev-switch color regression (App.tsx lines 38-47, currently hardcoded `#1a1c19` / `#d8d2bf` / `#4a4742` because using `--accent-primary` from the dark token system picked up the wrong color in dev mode on cream backgrounds — landing run Phase 4 QA noted this). Short term: this is a wide-blast-radius rename touching every consumer of `--lp-*` (every component under `src/panels/landing/`) plus every CSS module under settings. Half-migrated state at a phase boundary is the failure mode.

- **Effort estimate: L (1-2w real, calendar)** — Token consolidation + rename phase: S. Settings-panel CSS rewrite: M-L depending on file count. Border-token introduction + four mockup-issue resolutions: S. Dev-switch fix: trivial once tokens are unified. Cross-phase regression validation: this is the pacing item — see "Testing posture" below.

- **Risk level: medium** — Not because any single change is risky, but because the surface area is wide and the failure mode (functional regression in settings) is silent and high-impact. The landing-run regression discipline (single QA inspection per AC) does not scale to "every settings flow still works under new tokens." See specific risks section below.

---

### Key factors

**For:**
1. The bifurcation was always temporary. ADR D2's whole rationale is "so the landing experiment wouldn't break the settings panel" — that contract has been satisfied (the experiment shipped without breaking settings). Maintaining the bifurcation past its purpose is debt.
2. Tokens are the right place to fix the dev-switch regression once. App.tsx's inline-styled fallback (lines 34-49) is technical sin tolerated only because the landing run was scoped not to touch `--accent-primary`. A unified token system removes the reason for the inline workaround.
3. The four mockup issues called out in the prompt (serif italic too heavy on tab titles; chips lost selection state; dashed empty-state border too heavy; dev-switch hard to read) are real — I verified each by inspecting `.claude/run-assets/settings-cream-mockup.png`. They are not punts to defer; they are calls the planning trio must lock during PRD authoring so Builder doesn't re-litigate them. Beyond those four, the mockup also has a weak visual hierarchy on the left rail (tab labels look almost identical to body text) and the "PRETOOLUSE" / "POSTTOOLUSE" status pills on the preset cards do not have a clear rest/active distinction — Architect should treat the prompt's four-item list as non-exhaustive.

**Against:**
1. The slug is `design-migration-cream-panels` (no `test-run-` prefix this time), which signals "intent to ship" — but the previous run is the only data point we have for this pipeline. We have evidence the pipeline can converge on a 45-AC static visual surface; we do not yet have evidence it can converge on a wide-blast-radius refactor with regression risk on functionality-critical code. That is a meaningful jump in difficulty.
2. The naive single-PRD framing ("migrate everything in one run") fights the phase-size rule. A migration that needs 30 file edits to be coherent and 6 file edits per phase to be reviewable is structurally hard to plan.
3. Reverting D2 mid-run requires care: at the moment of the rename, every consumer of `--lp-*` is broken until the new tokens are in place. Either the rename is atomic in a single phase (which violates ≤5 files if the consumer count is high), or shims exist for one phase and get removed in the next (which Architect needs to design with discipline). Both have tradeoffs — flagged for Architect below.

---

### Alternatives considered

| Alternative | Effort | Impact | Ruled in/out |
|---|---|---|---|
| Do nothing — leave `--lp-*` scoped to landing | None | None on landing; permanent design dialect on settings; dev-switch color stays broken; future panels inherit ambiguity | OUT — defeats the strategic premise that the landing aesthetic is the product aesthetic |
| Unify tokens only — defer settings-panel CSS migration | S-M | Cleans up namespace and fixes dev-switch; settings stays CLI-dark visually until follow-on run | Considered seriously. Drawback: the prompt explicitly asks for the migrated settings panel, and shipping a unified token system that no settings consumer reads from would create a deferred-work hazard (next run inherits a half-finished migration). RULED OUT but noted as the natural fallback if Architect's surface enumeration shows >30 files |
| Full migration in one PRD as written | L-XL | Delivers the complete migration in one run; high coordination cost; large blast radius | This is the prompt's framing. Approved with simplifications below |
| Split: this PRD = tokens + dev-switch + landing rename + border-token + the 4 mockup-issue locks; settings-panel migration = follow-on PRD | M + M | Two ships, each with smaller blast radius and clearer phase boundaries; settings migration gets dedicated planning attention | This is what SIMPLIFY is endorsing if Architect's enumeration shows the settings panel can't fit alongside the foundation work in one coherent phase plan |
| Shim-aliased rename (`--lp-accent-red: var(--accent-red)`) as a permanent bridge | S | Defers real rename indefinitely; preserves both namespaces | OUT — defeats the cleanup the prompt requests; shims are acceptable only for a single phase as a transitional state, never as a permanent layer |
| Stand up Vitest + Testing Library before any migration work | S phase 0, M ongoing | Catches functional regression in settings; meaningful for this risk profile | Considered seriously. Recommendation in "Testing posture" below |

---

### SIMPLIFY scope

**What this run delivers (pinned in approved scope):**
1. Token consolidation: `tokens.css` + `tokens-landing.css` reorganized into a clean structure where dark chrome tokens and content tokens are clearly separated. Architect chooses the file structure (single file with comment-banded sections, or `tokens-chrome.css` + `tokens-content.css` — see architectural concerns below).
2. Token rename: every `--lp-*` token gets a non-prefixed shared name (`--surface-cream`, `--ink`, `--accent-red`, etc). No `--lp-*` references remain anywhere in the codebase after the rename phase completes.
3. New `--border-panel-strong` token (1.5-2px, dark neutral) defined and applied to all cream content panels.
4. Dev-switch button (App.tsx) rewritten to use unified tokens, with explicit AC for visibility against both the dark chrome and the cream content area.
5. Landing-page surfaces re-themed against the unified tokens (mechanical follow-on of the rename — should be a no-visible-change phase).
6. Four mockup-issue resolutions, each with explicit AC locking the resolved treatment:
   - Serif italic on tab section titles → switched to monospace UI weight (serif italic reserved for hero treatments; this is the same rule the landing run already follows).
   - Lifecycle event chips → selection state restored with explicit visual treatment (specific token for selected fill, specific token for selected border, specific contrast against cream).
   - Dashed empty-state border → reduced weight or replaced with hairline + explicit token.
   - Dev-switch button → see item 4.

**What this run delivers IF Architect's enumeration of `src/panels/claude-settings/` proves it's tractable inside the phase plan:**

7. Full re-theming of all `claude-settings/` components and CSS modules to the unified cream-panel-on-dark-chrome language, with functional regression coverage on every settings flow that exists today.

**Cut from original scope (deferred to a follow-on run if needed):**

- Settings-panel migration if file count makes phase sizing infeasible. This is the single largest scope decision in the run and Architect must make it explicit in the ADR. If item 7 is deferred, this PRD ships items 1-6 and the settings panel keeps its CLI-dark treatment one more run.
- Any change to settings-panel functionality (load, edit, save Claude Code config). The prompt is explicit on this — it stays out of scope by user direction.
- Any visual treatment for surfaces beyond settings + landing + dev-switch. "Any other surfaces in the app that haven't been converted yet" in the prompt's scope list is too open-ended; if PM finds such surfaces during exploration, they get explicitly enumerated and either pulled in with their own AC or deferred.

---

### Trigger flags (my call)

- **Security trigger: OFF.** This migration touches no auth, no IPC, no new data, no network. The settings panel reads/writes Claude Code config (existing functionality, not new), but the migration explicitly does not change that wiring. Architect: confirm by walking the diff at sign-off — if any phase plan touches `claudeConfigStore`, IPC handlers, or the file-watching infrastructure, flip this and re-open consensus.

- **Performance trigger: OFF.** Token rename and consolidation does not change render path. Bundle delta is approximately zero (renaming variables; the value count stays similar). The new `--border-panel-strong` adds 1-2px borders to many panels, which is a paint cost but not a measurable one in the Electron renderer at the data densities this app shows. Architect: confirm by checking that the consolidated token file structure doesn't introduce specificity issues that force selector escalation across many components — if it does, that's a render-perf concern.

- **Testing posture: this is the strategic call.** The landing run used Option C (no test runner, deterministic inspection per AC). For a static visual page that argument was correct — and the run validated it. For this run, **Option C is no longer sufficient on its own** because the failure mode has changed. Visual regressions are still detectable by inspection. Functional regressions in the settings panel — the user clicks save, the file doesn't write, no console error — are not detectable by reading the DOM.

  My call: **Stand up Vitest + Testing Library as Phase 0 of this run** (or an equivalent test runner — Architect to choose), with a tightly-scoped initial test suite covering the settings-panel functional flows (load config, edit a setting, save, switch tabs). This is not a pivot to "fully test everything"; it is a single-purpose regression net for the migration. If item 7 (full settings migration) is deferred to a follow-on run, the test runner still ships in this run and is consumed there. If item 7 is in scope, the tests are the regression coverage that lets us approve the migration with confidence.

  This is a strategic call that belongs at the gate. PM and Architect should not have to re-derive it. Architect can object with specific reasoning if they disagree, but the default for the planning round is: test runner is in scope.

---

### Architectural concerns for Architect

1. **The ADR D2 reversal must not leave the codebase in a half-migrated state mid-pipeline.** Every phase must be deployable on its own. Two acceptable patterns:
   - **Atomic rename in one phase**: introduce new tokens at `:root`, mass-rename every `--lp-*` reference in the codebase, delete the scoped `.landing-root` token block, all in one phase. Pro: clean. Con: large file count if many CSS modules reference `--lp-*` (Architect must count via grep before approving this).
   - **Two-phase rename with one-phase shim**: Phase N introduces new tokens at `:root`, defines aliases (`--lp-accent-red: var(--accent-red)`) inside `.landing-root` for backward compatibility. Phase N+1 deletes the aliases and updates every consumer to the new names. Pro: each phase smaller. Con: one phase exists in a transient state; reviewer must verify the aliases are deleted in N+1 and not stranded.
   Architect must pick one, document why in the ADR, and an AC must enforce that no `--lp-*` reference remains in the codebase after the final rename phase (greppable assertion: `grep -r "\-\-lp-" src/` returns empty).

2. **Token consolidation strategy.** Two options:
   - **Single file with sectioned banners** (`tokens.css` reorganized): keeps the import surface trivial — `main.tsx` already imports `tokens.css` — and the dark/content separation is documentation-only.
   - **Two files** (`tokens-chrome.css` + `tokens-content.css`): structural separation makes intent explicit but introduces import order discipline. Layer ordering matters — content tokens that override chrome defaults must load after chrome tokens, or they need higher specificity. This is non-trivial if any component crosses the chrome/content boundary (the dev-switch button arguably does — it sits over dark chrome and inside the landing surface simultaneously).
   Architect: choose, document, and pin the layer/import-order rules. Either is defensible; the wrong move is doing a "soft" split that pretends to separate them but actually leaves them coupled by specificity accidents.

3. **Settings panel scope — enumerate before approving.** The prompt says "all `claude-settings/` components and CSS modules." Before sign-off, Architect must produce: (a) total file count under `src/panels/claude-settings/`, (b) a list of which CSS modules consume which tokens, (c) which components have functional logic worth functional-regression-testing. If the count is >25 files, the phase plan needs careful slicing and item 7 may need to be its own follow-on run. If <15 files, item 7 is plausibly tractable in this run alongside foundation work.

4. **The four mockup issues — resolution must be explicit, not directional.** "Fix the dashed empty-state border" is not a Builder instruction. The PRD must contain, for each issue, an AC of the form "Given [state], when [element] is rendered, then [computed property] equals [token-derived value]." Specifically:
   - Tab titles: AC must specify the new family token (mono UI), the new weight, and that no `font-style: italic` is applied to tab-title elements.
   - Chips: AC must specify the selected-state visual treatment (token for fill, token for border, computed contrast ratio against cream).
   - Empty-state border: AC must specify the new border style (or absence), with a token reference.
   - Dev-switch: AC must specify computed contrast against both `--surface-cream` (when on landing) and `--bg-base` (when on settings, if it remains visible there).

5. **Phase breakdown safety.** A migration where phase N only half-renames tokens is a non-starter. Either each phase covers a full vertical slice (e.g. "Phase X: settings tab Y fully migrated, including tokens it consumes"), or the rename happens atomically inside one phase and subsequent phases consume the renamed tokens. Both have tradeoffs. Architect to choose, but the constraint is non-negotiable: at every phase boundary, `npm run dev` must produce a working, visually-coherent app. No phase exits with broken visuals or broken settings flow.

6. **Backward-compat shims have a one-phase lifespan, max.** The prompt says rename `--lp-*` to a shared namespace. Do not introduce shim aliases as a long-term bridge — that defeats the cleanup the prompt requests. Either the rename is atomic in one phase, or shims exist for one phase only and the next phase removes them. Architect must explicitly schedule shim removal in the same PRD, not punt it to "a future cleanup."

7. **The global `:focus-visible` rule** at `src/styles/tokens.css:151` (uses `--accent-primary` from the dark token system) — this is a known landing-run observation. The migration owns resolving it. Either this rule moves to a per-surface scope, or `--accent-primary` itself becomes a unified token that reads correctly on both dark chrome and cream content. Pick one in the ADR; the worst outcome is leaving a global focus ring that flashes the wrong color depending on which surface is active.

8. **The global `overflow: hidden` rule** at `src/styles/tokens.css:105-112` (ADR D3 from the prior run) — the settings panel relies on this; the landing surface works around it via its own scrolled container. Architect must verify whether any cream-themed settings surface needs to scroll (the Hooks tab in the mockup is taller than the viewport at typical sizes), and if so, follow the ADR D3 pattern (scoped scroll container) or lift the global rule with explicit replacement scoping. Do not modify the global rule without an explicit ADR entry justifying it.

9. **Cross-phase regression checking — not Reviewer reading every file.** The landing run's reviewer pattern (read every file, walk every AC) was tractable for ~30 files of new code. For a migration touching every existing settings component plus tokens, that pattern degrades. Recommend either (a) a build-output snapshot strategy where Architect commits a baseline of `getComputedStyle()` results for representative settings elements before the migration and the test suite asserts against the new values phase by phase, or (b) the Vitest test suite recommended in "Testing posture" doubles as the regression net. Architect's call which to use.

---

### Specific risks beyond the standard ones

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Half-renamed `--lp-*` references stranded after the rename phase (a CSS module nobody noticed) | Medium | Low-Medium (visual breakage in one component, easy to catch) | Greppable AC: `grep -r "\-\-lp-" src/` returns empty post-rename phase. Reviewer enforces. |
| Global `:focus-visible` at tokens.css:151 left pointing at the wrong accent token across both surfaces | Medium | Medium (focus rings flash wrong color, accessibility-adjacent regression) | Architect addresses in ADR; AC locks the resolved behavior. |
| Settings panel functional regression goes undetected because Option C inspection doesn't catch broken save flows | Medium | High (silent data-loss-shaped failure on the only functionality-critical surface in the app) | Stand up Vitest + Testing Library Phase 0; tests cover load/edit/save/tab-switch. |
| Specificity battle between chrome and content tokens at the dev-switch button (lives in both contexts simultaneously) | Medium | Low (visible mismatch, easy to fix) | Architect designs token-layer ordering explicitly; dev-switch AC includes computed-contrast checks against both backgrounds. |
| Mockup is treated as authoritative on issues the prompt already flagged as wrong | Low (with this verdict in place) | High if it slips (Builder ships the wrong treatment) | Prompt explicitly delegates to planning trio. PM must write resolution AC, not "match mockup." |
| Settings panel relies on inherited `body` font/color/size that the migration changes globally | Low-Medium | Medium | Architect inspects `body` declaration in tokens.css:114-122 and decides whether to scope it. Likely outcome: body gets unified tokens, settings declares overrides at panel-root level. |
| Phase size rule (≤5 files) breaks down on the rename phase if `--lp-*` is widely consumed | Medium | Medium (phase plan needs a deviation justification) | Architect counts upfront; if >5 files needed for atomic rename, ADR documents the deviation with reasoning. |
| Bundle-size regression from new font-face declarations being moved out of scoped block (now eagerly loaded for both surfaces) | Low | Low | Font files are already bundled (~110KB total). Moving the @font-face from `.landing-root`-scoped to global-scoped only affects when the browser registers the rule, not when it loads the font. Architect verifies. |

---

### Pipeline posture

The previous run was framed as a pipeline shakedown (`test-run-landing-page`). It succeeded. This run's slug is `design-migration-cream-panels` — no `test-run-` prefix — and the prompt's tone is "ship the migration," not "exercise the pipeline." Confirmed: **this is a real run, not a shakedown.** The implication for downstream agents: regression discipline matters more than coverage breadth, sign-offs cost real attention, and Builder/QA/Reviewer should treat phase failures as substantive rather than as pipeline-test signal.

---

### What I'm explicitly not pre-deciding (Architect to decide)

- Token file structure (single file vs. split chrome/content).
- Rename strategy (atomic-in-one-phase vs. shim-then-remove).
- Whether item 7 (full settings-panel migration) fits in this run or spins out.
- Whether the test runner is Vitest, node:test, or something else (but it ships in this run — that part is decided).
- Phase count.

These are all architectural calls that depend on enumerating `src/panels/claude-settings/` first. Architect: do that exploration before drafting sections 8-10.

---

### Summary for orchestrator

Pipeline advances to PM. PM should write sections 3-7 with the following non-negotiable AC quality bar:

- **Functional regression ACs**: every settings flow that exists today (load config, edit a setting, save, switch tabs, hooks tab interactions, presets, alerts, buttons) gets a specific AC verifying it still works under unified tokens. These are the ACs the test runner exists to satisfy.
- **Visual ACs that don't reduce to "matches mockup"**: every visual claim must be falsifiable via named element + specific token + specific computed style. Same standard as the landing run (see PRD AC-018, AC-021, AC-027 for the bar).
- **Token-rename safety AC**: explicit AC asserting `grep -r "\-\-lp-" src/` returns empty after the rename phase.
- **Border-token AC**: every panel that gets `--border-panel-strong` is enumerated; computed border value is asserted; contrast against dark chrome is documented (target: visibly architectural, not faint).
- **Four mockup-issue resolution ACs**: each of the four issues gets at least one AC locking the resolved treatment.
- **Dev-switch AC**: locked with computed-contrast checks against both backgrounds the button can sit over.

I will check every AC against this bar at PM sign-off. Vague ACs at sign-off will trigger objections.
