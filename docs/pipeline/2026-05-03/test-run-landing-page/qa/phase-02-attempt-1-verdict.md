# QA Verdict: PASS

**Phase:** 2 — Top sections (Header, Status, ProjectSelector, Hero)
**Attempt:** 1
**Date:** 2026-05-03
**Verification method:** Deterministic static inspection per ADR D7/D10. Each AC verified by reading component JSX, CSS module, and token resolution chain. No automated test runner (ADR D7 confirmed this is the approved verification path).

---

## Step 1 — AC Testability Pre-Check

All 8 ACs for Phase 2 (AC-004, AC-005, AC-006, AC-007, AC-008, AC-018, AC-019, AC-020) are written in testable Given/When/Then form with precise observable outcomes (literal text strings, ARIA attribute values, CSS token names, font-style values). No vague language detected. All 8 pass testability pre-check.

---

## AC Coverage: 8/8

### AC-004: Header bar — AGENTCON / FILE 0427-A / 2026-04-30 in mono font

**Spec:** Header bar contains literal texts "AGENTCON", "FILE 0427-A", "2026-04-30", each in the monospace UI font family token.

**Evidence:**
- `src/panels/landing/components/HeaderBar.tsx` lines 10-12: three `<span>` elements with exact literal strings `AGENTCON`, `FILE 0427-A`, `2026-04-30`.
- `src/panels/landing/components/HeaderBar.module.css` line 10: `.header { font-family: var(--lp-font-mono); }` — inherited by all three child spans.
- Token resolution: `--lp-font-mono` is defined in `tokens-landing.css` line 67 as `"JetBrains Mono", "SF Mono", Menlo, Monaco, ui-monospace, monospace`. JetBrains Mono woff2 files confirmed on disk (`JetBrainsMono-Regular.woff2` 31,432 bytes, `JetBrainsMono-Medium.woff2` 21,832 bytes).
- `data-testid="header-bar"` present on `<header>` element (line 9).

**Result: PASS**

---

### AC-005: Status bar — four segments in order, mono font

**Spec:** Status bar contains, in order: "SECURE CHANNEL", "CONNECTION ESTABLISHED", "NODE: ~/.CLAUDE", "3 OPERATIVES ON STANDBY", each in the monospace UI font family token.

**Evidence:**
- `src/panels/landing/components/StatusBar.tsx` lines 13, 15, 17, 19: four `<span className={styles.segment}>` elements with exact literal strings in the specified order.
- `src/panels/landing/components/StatusBar.module.css` line 11: `.statusBar { font-family: var(--lp-font-mono); }` — inherited by segment row children.
- Pipe separators are `aria-hidden="true"` (lines 14, 16, 18) — accessible text is the four segments only.
- `data-testid="status-bar"` present on root `<div>` (line 11).
- AC-005 does not specify separator format — pipe separators are an implementation detail within spec.

**Result: PASS**

---

### AC-006: Status sub-line — "Status: standby — Awaiting deployment orders"

**Spec:** A status indicator element labeled "Status: standby — Awaiting deployment orders" (or text content matching that pattern) is visible directly below or within the status bar region using the monospace UI token.

**Evidence:**
- `src/panels/landing/components/StatusBar.tsx` lines 21-23: `<div className={styles.subLine}>Status: standby — Awaiting deployment orders</div>`.
- Character verification: the em dash character U+2014 (—) is present between "standby" and "Awaiting" — confirmed by Python character inspection (em dash present: True).
- `src/panels/landing/components/StatusBar.module.css` line 11: `.statusBar { font-family: var(--lp-font-mono); }` inherited by `.subLine`. `.subLine` is a direct child of `.statusBar`, positioned below `.segmentRow`.
- AC-006 says "directly below or within the status bar region" — sub-line is the second child of the status bar root element.

**Result: PASS**

---

### AC-007: ProjectSelector — button trigger, ARIA, accessible name, visible label

**Spec:** Renders as a `<button>` with `aria-haspopup="listbox"`, `aria-expanded="false"`, accessible name containing "Project", visible label `PROJECT [ - unassigned - ]` or `PROJECT [ <selectedLabel> ]`.

**Evidence:**
- `src/panels/landing/components/ProjectSelector.tsx` line 34: `<button type="button"`.
- Line 37: `aria-haspopup="listbox"` — static attribute.
- Line 38: `aria-expanded="false"` — static string literal, NOT bound to state.
- Line 40: `aria-label={\`Project — ${valueLabel}\`}` — accessible name contains "Project" for all values of `valueLabel`.
- Lines 43-46: visible label renders `PROJECT [ <valueLabel> ]` via nested spans.
- `aria-expanded="false"` is a static hardcoded string, not a state variable — confirmed by absence of any `useState`/`useRef`/`useEffect` in the entire file (grep returned zero matches for those identifiers).
- No `<ul>`, `<li>`, `role="listbox"`, or `role="option"` markup rendered (grep returned zero matches).
- No `onKeyDown` handler present.
- No `useState` for open/isOpen/highlightedIndex.
- No `useEffect` for outside-click or focus-trap.
- `aria-controls="project-selector-listbox"` references a listbox ID that is not rendered in Phase 2 — this is an acceptable Phase 4 reservation (the attribute points forward, nothing is broken).
- Chevron glyph `▾` rendered (line 48-50) as a visual affordance indicator.
- `data-testid="project-selector"` on wrapper `<div>` (line 32).

**Result: PASS**

---

### AC-008: ProjectSelector — null selectedProjectId shows "- unassigned -"

**Spec:** When `selectedProjectId` prop is `null` or `undefined`, visible value text reads exactly `- unassigned -`.

**Evidence:**
- `src/panels/landing/components/ProjectSelector.tsx` line 24-25:
  ```
  const selected = projects.find((p) => p.id === selectedProjectId);
  const valueLabel = selected ? selected.label : "- unassigned -";
  ```
  When `selectedProjectId` is `null`, `find()` returns `undefined`, `selected` is falsy, `valueLabel` becomes `"- unassigned -"`.
- `src/panels/landing/LandingPage.tsx` line 51: `selectedProjectId={null}` passed to `ProjectSelector`.
- Line 44 of ProjectSelector renders `<span className={styles.value}>{valueLabel}</span>` — the visible value text.
- `seedProjects` has IDs `"agentcon"`, `"api-service"`, `"payments-core"` — none match `null`, confirming fallback to `"- unassigned -"`.

**Result: PASS**

---

### AC-018: Hero h1 — two lines, serif italic, red accent, real italic font

**Spec:** `h1` with line 1 "Brief once." in serif display family token, line 2 "Deploy everywhere." in serif display *italic* family token in the red brand accent color token.

**Evidence:**
- `src/panels/landing/components/Hero.tsx` lines 22-25: `<h1 className={styles.headline}>` with two `<span>` children — `headlineLine1` ("Brief once.") and `headlineLine2` ("Deploy everywhere.").
- `src/panels/landing/components/Hero.module.css` line 34: `.headline { font-family: var(--lp-font-display); }` — both spans inherit EB Garamond.
- Line 43: `.headlineLine1 { font-style: normal; color: var(--lp-ink); }`
- Lines 51-54: `.headlineLine2 { font-style: italic; color: var(--lp-accent-red); }`
- Token resolution: `--lp-accent-red: #b8362b` (tokens-landing.css line 61).
- CONS-09 (real italic, no synthetic oblique) verification:
  - `tokens-landing.css` lines 19-26 declare a separate `@font-face` block for "EB Garamond" with `font-style: italic` pointing to `../assets/fonts/eb-garamond/EBGaramond-Italic.woff2`.
  - The URL is `EBGaramond-Italic.woff2` — a distinct file from `EBGaramond-Regular.woff2`.
  - `EBGaramond-Italic.woff2` exists on disk: 22,172 bytes (confirmed by `ls -la`).
  - `EBGaramond-Regular.woff2` exists: 21,704 bytes. Different size — confirms the italic woff2 is a real italic face, not a copy of the regular.
  - When `.headlineLine2` has `font-style: italic` and inherits `font-family: "EB Garamond"`, the browser matches the `@font-face` block that declares `font-family: "EB Garamond"` + `font-style: italic` — it loads `EBGaramond-Italic.woff2`. No synthetic obliquing occurs because an explicit italic face is registered.
- Both font files confirmed present in Vite production build output (phase-02-attempt-1.md: `EBGaramond-Italic-KGnr19QW.woff2 22.17 kB`).

**Result: PASS**

---

### AC-019: Hero paragraph — exact body text, body type token

**Spec:** Paragraph element below `h1` contains exact literal text "A roster of specialized Claude subagents for code review, test authoring, and documentation. Briefed on your project's conventions. Reusable across every operation." rendered in the body type token.

**Evidence:**
- `src/panels/landing/components/Hero.tsx` lines 28-31: `<p className={styles.body}>` with JSX text content using `&apos;` for the apostrophe.
- JSX whitespace normalization: React collapses internal whitespace in JSX text to single spaces. Python verification confirmed the rendered text equals the PRD's exact string (Match: True).
- `src/panels/landing/components/Hero.module.css` line 61-62: `.body { font-size: var(--lp-text-base); line-height: var(--lp-leading-normal); }`. Token `--lp-text-base: 14px` is the "body type token" per PRD section 8 token table.
- PRD section 8 per-region notes explicitly state: "Body paragraph in default sans inherited from body (we don't override body text font here)" — Hero.module.css correctly omits `font-family` override, inheriting the system-sans body font. This matches the AC's "body type token" which the PRD defines as the size token `--lp-text-base`, not a custom font family.

**Result: PASS**

---

### AC-020: Hero eyebrow — "PERSONNEL DIVISION" + "№ 047 / NEW BRIEFING" in mono

**Spec:** Eyebrow/kicker element above `h1` contains "PERSONNEL DIVISION" in monospace UI token, accompanied by metadata "№ 047 / NEW BRIEFING" in monospace UI token.

**Evidence:**
- `src/panels/landing/components/Hero.tsx` lines 16-19: `<div className={styles.eyebrow}>` with two `<span>` children: `.kicker` ("PERSONNEL DIVISION") and `.meta` ("№ 047 / NEW BRIEFING").
- `.eyebrow` is positioned before `<h1>` in document order (above the h1).
- `src/panels/landing/components/Hero.module.css` line 16: `.eyebrow { font-family: var(--lp-font-mono); }` — both kicker and meta inherit monospace UI token.
- "PERSONNEL DIVISION" — exact string, uppercase.
- "№ 047 / NEW BRIEFING" — exact string including the № (U+2116) numero sign.

**Result: PASS**

---

## Phase 3/4 Leakage Check

**Spec:** Personnel file, transmissions, operatives grid, and footer regions must remain empty stubs.

**Evidence:**
- `src/panels/landing/LandingPage.tsx` lines 68-94: the four Phase 3/4 regions are self-closing `<section ... />` elements with no children. Confirmed by grep — no `PersonnelFileCard`, `TransmissionsFeed`, `OperativesGrid`, `OperativeCard`, `Footer`, `ClassifiedStamp`, or `RedactedSilhouette` are imported or rendered.
- Grep for Phase 3/4 imports returned zero matches in implementation code.
- `data-testid` values `region-personnel-file`, `region-transmissions-feed`, `region-operatives-grid`, `region-footer` are present as self-closing sections.

**Result: No leakage detected — PASS**

---

## Phase 1 Invariants Re-Verification

### tokens.css unchanged
- MD5 of `src/styles/tokens.css` matches MD5 of the same file at `bf7ebed` (initial commit): `e01e3e41c05c96b995c05b5bfec5e91a` both before and after Phase 2. Zero modifications.

### App.tsx not touched in Phase 2
- `App.tsx` timestamp: 2026-05-03 16:43 (set during Phase 1).
- Phase 2 component files: all timestamped 2026-05-03 18:50–18:52.
- `App.tsx` was NOT modified in Phase 2. Builder's build summary confirms this explicitly.

### tokens-landing.css — no --lp-* under :root (CONS-13)
- `grep -n "^:root" src/styles/tokens-landing.css` returns zero matches.
- All `--lp-*` tokens remain scoped under `.landing-root` selector.
- Builder confirmed no modifications to tokens-landing.css in Phase 2 (no new tokens were needed).

### CONS-15 — dev-switch button structural gate
- `src/App.tsx` line 30: `{import.meta.env.DEV && (` gates the floating switch button. Structure intact, not modified in Phase 2.

### Settings cold-start defaults to settings
- `src/App.tsx` lines 16-19: `readInitialSurface()` returns `"settings"` unless `?surface=landing` is in the URL query string. Default cold-start returns `"settings"`. Not modified in Phase 2.

---

## Observations for Reviewer (Non-Blocking)

1. `ProjectSelector.tsx` line 39: `aria-controls="project-selector-listbox"` references a listbox element that does not exist in the DOM in Phase 2. This is a forward reference (the ID is reserved for Phase 4). Per ARIA spec, `aria-controls` pointing to a non-existent ID is not an error — the attribute is ignored by assistive technology when the referenced element is absent. Reviewer may want to note this is intentional per the Phase 4 boundary.

2. `Hero.module.css` `.body` does not set `font-family` — it inherits from `body` (system-sans). This is explicitly called out as correct in PRD section 8 per-region notes and is not a defect.

3. `ProjectSelector.module.css` line 26: `cursor: default` on the trigger. Phase 4 will wire click behavior, at which point `cursor: pointer` becomes appropriate. Not a Phase 2 issue.

---

## Test Results Summary

| AC | Description | Evidence Source | Result |
|---|---|---|---|
| AC-004 | AGENTCON / FILE 0427-A / 2026-04-30, mono | HeaderBar.tsx:10-12, HeaderBar.module.css:10 | PASS |
| AC-005 | 4 segments in order, mono | StatusBar.tsx:13-19, StatusBar.module.css:11 | PASS |
| AC-006 | Sub-line exact text + em dash, mono, below status | StatusBar.tsx:21-23, StatusBar.module.css:34 | PASS |
| AC-007 | Button, aria-haspopup=listbox, aria-expanded=false, accessible name, visible label | ProjectSelector.tsx:34-50 | PASS |
| AC-008 | null selectedProjectId → "- unassigned -" | ProjectSelector.tsx:24-25, LandingPage.tsx:51 | PASS |
| AC-018 | h1 two lines, serif display, italic + red, real italic woff2 (CONS-09) | Hero.tsx:22-25, Hero.module.css:34-54, tokens-landing.css:19-26, font files on disk | PASS |
| AC-019 | Exact body paragraph text, body type token | Hero.tsx:28-31, Hero.module.css:61 | PASS |
| AC-020 | PERSONNEL DIVISION + № 047 / NEW BRIEFING, mono, above h1 | Hero.tsx:16-19, Hero.module.css:16 | PASS |
| Phase 3/4 no-leakage | Empty stub sections only | LandingPage.tsx:68-94 | PASS |
| Phase 1 tokens.css invariant | MD5 unchanged | git show bf7ebed | PASS |
| Phase 1 App.tsx not touched in P2 | Timestamps 16:43 vs 18:50+ | file timestamps | PASS |
| CONS-13 no :root in tokens-landing | grep returns zero | grep output | PASS |
| CONS-15 DEV gate | import.meta.env.DEV guard | App.tsx:30 | PASS |
| Cold-start settings default | readInitialSurface() returns "settings" | App.tsx:17-19 | PASS |

**New tests: 8/8 AC pass. All Phase 1 invariants confirmed. No regressions detected.**

---

## Phase status

QA_PASSED — advancing to Reviewer.
