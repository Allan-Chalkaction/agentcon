## CTO Verdict: Agentcon Landing Page (spy/dossier aesthetic)

**Decision:** SIMPLIFY
**Confidence:** Medium
**Date:** 2026-05-03

### One-line summary
Build the static, presentational landing page exactly as mocked — defer all live-data and "deploy" action wiring to a follow-on run, because the prompt does not define the data sources or action contracts those pieces would need.

---

### Assessment

- **Strategic alignment:** moderate. The slug `test-run-landing-page` and the absence of any product spec for this surface tell me this is partly a pipeline shakedown. As a forcing function for the planning trio (PM/Architect/Builder) and as a brand artifact, it has real value. As a load-bearing product surface, it's not on the critical path of the existing Electron settings tool.
- **Technical feasibility:** straightforward for the static version, moderate for the full version. The repo is a working Electron + React 19 + Vite + TS app with Zustand and a token-based CSS system. Adding a new route/view inside the existing renderer is mechanically easy. The complications are: (a) the existing `tokens.css` is dark-mode and dense (13px base, monochrome surface stack) — the mockup is a cream/light, marketing-grade aesthetic with serif italic display type, monospace UI text, and a red brand accent. The token vocabulary needs to be extended, not replaced. (b) `src/styles/tokens.css` sets `html, body, #root { overflow: hidden }` because the app is desktop chrome — the mockup is a scrolling document. That conflict has to be resolved per-route, not globally. (c) `App.tsx` currently renders only `<ClaudeSettingsPanel />`; there is no router. Either add one or gate the landing page behind a state flag.
- **Tech debt impact:** neutral-to-slightly-positive if executed as a self-contained route with its own scoped tokens and a clean component boundary. Risk of negative impact if the landing page leaks marketing-site assumptions into the design system the settings panel depends on.
- **Effort estimate:** S (1–2d) for the simplified static scope I'm approving. M (3–5d) for the full vision including live transmissions and deploy actions. The delta is almost entirely in defining the data contracts the prompt skips.
- **Risk level:** low for the static page; medium for the full version. Key risks: scope creep on "deploy" semantics, design-token bifurcation, and the prompt's silence on how the page is reached (new top-level surface? replaces settings panel? menu item?).

---

### Key factors

**For:**
- Mockup is detailed and unambiguous about visual intent — Builder will not need to invent layout. Good fit for an end-to-end pipeline test on a feature with clear acceptance signals (does it look like the picture).
- Self-contained route with no data dependencies (in the simplified scope) means no migrations, no auth, no API surface — clean test of the pipeline at low blast radius.

**Against:**
- The prompt conflates "render this picture" with three product features that have no defined contracts: project selector behavior, recent-transmissions live feed source, and deploy buttons. Letting those through unscoped would be a planning failure I'd own.
- Visual aesthetic is materially different from the existing app's dark, dense, utility-tool feel. Without a clear answer on whether this replaces or coexists with the settings panel, the team risks shipping a token system that fights itself.

---

### Alternatives considered

| Alternative | Effort | Impact | Ruled in/out |
|---|---|---|---|
| Do nothing | None | Pipeline doesn't get exercised; no landing page | Out — there is genuine value in both the artifact and the pipeline test. |
| Static landing page only (this verdict) | S | Visual artifact ships; deferred features have a defined home | In — gives PM/Architect a tractable scope and produces a real deliverable. |
| Full vision: live feed + working deploys + project dropdown wired to store | M | Higher fidelity but invents three contracts the prompt didn't specify | Out — too much undefined product surface for one run; the planning trio would be guessing at intent. |
| Marketing-site export (separate Vite build, ship to web) | M+ | Decouples from Electron entirely | Out — premature; no stated distribution channel. The renderer route is sufficient and reversible. |

---

### Approved scope (SIMPLIFY)

**In scope for this run — static visual implementation:**
- New route/view rendering the full mockup at pixel-reasonable fidelity: header bar, secure-channel status bar, project selector dropdown (visual only, with seeded options), hero, personnel-file card with CLASSIFIED stamp, recent-transmissions feed section (rendered from a static seeded array), field-ready operatives grid (Hawkeye / Echo / Ghost with deploy buttons), footer.
- Extend `tokens.css` (or add a scoped tokens layer) with the cream/dark/red palette, serif italic display family, and monospace UI family the mockup demands. The existing dark settings-panel tokens must remain untouched and functional.
- Resolve the `overflow: hidden` conflict in a route-scoped way so the landing page can scroll without breaking the settings panel.
- Project dropdown: renders, opens, lets user select an option, updates a local UI state. Selection is visual only — it does not load anything yet.
- Deploy buttons: render and are interactive (hover/focus states, click handler exists), but click is a no-op placeholder (e.g., logs intent or shows a toast). PM should write the AC so this is unambiguous.
- Recent transmissions feed: renders from a hardcoded array of N entries with the visual treatment shown (timestamp, agent codename in green, action description). The "● LIVE" indicator is a visual element only; no streaming.
- Personnel file card: renders the active agent's dossier from a hardcoded record matching the mockup (Hawkeye, callsign code-review, sonnet, etc.). "Active agent" defaults to the first operative; can be selected in a later run.
- Responsive handling: minimum acceptable behavior at the desktop window sizes the Electron app already supports. No mobile breakpoint work.
- Accessibility: keyboard focus on dropdown and deploy buttons; ARIA labels on the dropdown; respects `prefers-reduced-motion` if any animation is added; color contrast meets WCAG AA on the cream-on-dark and red-on-cream pairings (Architect should call this out specifically — the red accent on cream is the highest-risk pairing).

**Cut from original scope (deferred to a follow-on run):**
- "Deploy" buttons performing any actual agent deployment, scaffold, or workflow trigger. The contract is undefined.
- Recent-transmissions feed sourcing from a real event stream, file watcher, or log tail. The source is undefined.
- Project dropdown wiring into the existing `claudeConfigStore` (active project path) or any project-loading behavior. The intended interaction with the existing settings panel is undefined.
- "Active agent" being dynamically selectable or driven by the agents tab data. The relationship between the mocked dossier and the existing `AgentsTab` data model is undefined.
- Routing/navigation between the landing page and the existing settings panel. There is no router in the app today and no stated UX for where this page lives in the app shell.
- Live status indicators ("CONNECTION ESTABLISHED", "● LIVE", "ENCRYPTED AT REST") reflecting real system state.

**How deferred features should still be planned for:**
PM should ensure component boundaries leave clean seams: the transmissions feed should accept its data as a prop, the operatives grid should accept its array as a prop, the dropdown's selection should fire a callback. Architect should note the seam locations in the phase plan so the follow-on run is mechanical, not a rewrite.

---

### Architectural concerns flagged for Architect

1. **Token system bifurcation.** `src/styles/tokens.css` is a single global stylesheet defining the dark settings-panel palette. The landing page introduces a fundamentally different aesthetic (cream, serif italic, red accent). Decide explicitly: scoped tokens via a route-level wrapper class, a separate `tokens-landing.css` layered alongside the existing one, or extending the existing tokens with namespaced variables. Document the choice in the ADR. Do not let landing-page tokens overwrite settings-panel tokens.
2. **Body overflow conflict.** `tokens.css` sets `html, body, #root { overflow: hidden }`. The landing page is a scrolling document. Architect must specify whether overflow becomes route-scoped, whether the landing route uses a dedicated scroll container inside the existing layout, or whether the global rule moves down to the settings panel only.
3. **No router exists today.** `App.tsx` renders `<ClaudeSettingsPanel />` directly. Architect must decide between (a) introducing a lightweight router or state-machine surface switcher, (b) gating the landing page behind a build flag or dev-only flag, or (c) replacing the App entry. Each has different blast radius. Pick one and justify it.
4. **Component placement.** `src/panels/` is the existing convention for top-level surfaces. The landing page should live alongside as `src/panels/landing/` (or similar) with its own module CSS files, matching the pattern in `claude-settings`. Do not invent a new top-level directory.
5. **Asset handling.** The mockup includes a redacted-photo silhouette and a CLASSIFIED stamp that look like raster/vector art. Architect should specify whether these are SVGs in `src/assets/`, inline SVG components, or CSS-only renderings. Inline SVG is preferred — keeps the bundle inspectable and the styles tokenizable.
6. **Font loading.** The serif italic display face and monospace UI face are not currently in the project. Architect must specify exact families, weights, and load strategy (system fonts, bundled `.woff2` via Vite, or web fonts). Web fonts are the worst option for a desktop app — prefer bundled or system stack with explicit fallback.
7. **Phase shape.** I expect three phases: (1) tokens + scoped overflow + asset scaffolding, (2) static composition of all sections with seeded data, (3) interactivity (dropdown open/close, deploy button states, hover/focus polish). Each phase should touch ≤5 files. Architect can deviate with reasoning.

---

### Security considerations flagged

Low surface area in the simplified scope. **Recommend security trigger: OFF** for this run, with the following rationale Architect should record:
- No user input is persisted. Dropdown selection is local UI state.
- No network calls, no IPC handlers added, no file system access.
- No secrets, auth, or PII anywhere on the page.
- All "data" is hardcoded in the renderer.

If Architect chooses to wire the dropdown into the existing `claudeConfigStore` during this run (against my scope guidance), security trigger should flip ON because `setActiveProjectPath` touches the existing project-load flow and that's not landing-page surface area to test.

---

### Hard AC quality concerns for PM

The prompt is visual-heavy and behaviorally vague. PM must write AC that survives the AC quality check at sign-off. Specifically:

- **No "matches the mockup" AC.** That phrasing is not testable. Replace with concrete, observable claims: "Hero h1 renders 'Brief once. Deploy everywhere.' with the second line in italic serif at the display size token", "Personnel file card displays a 'CLASSIFIED' stamp rotated approximately -15deg overlaid on the dossier photo", etc.
- **No "feels right" or "looks good" AC.** Color, typography, and spacing claims must reference token names or specific values.
- **Each interactive element gets its own AC for each state.** Dropdown closed, dropdown open, dropdown option selected, dropdown keyboard navigation. Deploy button idle, hover, focus, click. Do not lump these.
- **The deferred behaviors get explicit AC that they are no-ops.** "When the user clicks a Deploy button, no navigation, network call, or store mutation occurs; click is logged to the console with the operative codename." This protects against Builder accidentally inventing a contract.
- **Accessibility AC must be specific.** "Project dropdown is operable via keyboard alone: Tab moves focus to it, Space/Enter opens it, ArrowDown/ArrowUp move highlight, Enter selects, Escape closes and returns focus to the trigger." Do not write "is accessible".
- **Visual fidelity AC needs a verification path.** Either a Playwright/visual regression baseline against the mockup, or a checklist of visual claims QA can verify by eye. PM should pick one with Architect.

---

### What PM and Architect need to know before they start

- This is feature-flagged in my head as a **pipeline test run** as much as a product feature. Treat it as both. The artifact has to ship looking right; the pipeline trace has to be clean enough that we trust it next time.
- The slug is `test-run-landing-page` and lives under `docs/pipeline/2026-05-03/`. Honor that path; do not relocate.
- The repo has no router, no test infrastructure visible from `package.json`, and no CLAUDE.md. Architect should not assume any of those exist. If tests are being added as part of this work, that's a phase-zero decision and needs to be called out explicitly.
- The existing `ClaudeSettingsPanel` is the entire app today. Whatever routing/surface-switching solution is chosen must not regress it. Architect's migration-safety section should include "settings panel still loads and functions" as an explicit assertion.
- The PRD template (sections 7 Data Lifecycle, 8 Data Model, 8 Access Control) is geared toward features that touch data. For this scope those sections will be near-empty — PM should write "N/A — no persisted data; all content is renderer-local seeded arrays" rather than leave them blank or invent data they don't need.

---

### Revisit conditions for the deferred scope

Promote the cut items back to scope when:
- The "deploy" action has a defined target — what command runs, what gets scaffolded, what file changes — documented as a separate prompt.
- The transmissions feed has a defined source — log file path, IPC event, file watcher target — and a defined cardinality and retention.
- The relationship between the landing page's project dropdown and the existing `claudeConfigStore.activeProjectPath` is decided. (My instinct: the landing page becomes the entry surface that sets active project, and the settings panel is reached after selection. But that's a product decision, not mine to make in this verdict.)
