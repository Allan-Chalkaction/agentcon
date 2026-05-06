# Phase 3 Exploration

---

## 1. PRD Lock Confirmation

Section 11 of the PRD contains the following lock line (from the CTO Round 2 sign-off block):

> **PRD locked:** All four sign-offs present (PM Round 1, CTO Round 1, Architect, CTO Round 2, PM Round 2). No open blocking objections. Execution authorized.

Confirmed: PRD section 11 contains full sign-off chain. The PRD header reads:

> **Status:** DRAFT | CONSENSUS_IN_PROGRESS | **LOCKED** | EXECUTING | COMPLETE | BLOCKED

Lock confirmed. Proceeding.

---

## 2. Phase 3 File List (from PRD §9 Phase 3)

Exact file list as written in PRD section 9 Phase 3 "Files to touch":

**New files to create:**
- `src/panels/landing/components/PersonnelFileCard.tsx`
- `src/panels/landing/components/PersonnelFileCard.module.css`
- `src/panels/landing/components/ClassifiedStamp.tsx` (inline SVG)
- `src/panels/landing/components/RedactedSilhouette.tsx` (inline SVG)
- `src/panels/landing/components/TransmissionsFeed.tsx`
- `src/panels/landing/components/TransmissionsFeed.module.css`
- `src/panels/landing/components/OperativesGrid.tsx`
- `src/panels/landing/components/OperativesGrid.module.css`
- `src/panels/landing/components/OperativeCard.tsx`
- `src/panels/landing/components/OperativeCard.module.css`
- `src/panels/landing/components/Footer.tsx`
- `src/panels/landing/components/Footer.module.css`
- `src/panels/landing/data/seedAgent.ts`
- `src/panels/landing/data/seedTransmissions.ts`
- `src/panels/landing/data/seedOperatives.ts`

**Files to modify:**
- `src/panels/landing/LandingPage.tsx` (wire all new components into region stubs)

Total: 15 new files + 1 modify = 16 files. Matches PRD's "14 source files + 1 modify".

Files I will NOT touch: `tokens.css`, `App.tsx`, `LandingPage.module.css` (unless strictly required by region wiring), `tokens-landing.css` (no new tokens expected; will add under `.landing-root` only if needed).

---

## 3. Phase 3 AC List (from PRD §9 Phase 3 "AC covered")

Per PRD section 9 Phase 3, exactly 18 ACs:

- **AC-021** — PersonnelFile card: exact key/value field pairs (ACTIVE FILE, CODENAME, CALLSIGN, SPECIALTY, CLEARANCE, LAST SEEN, STATUS)
- **AC-022** — PersonnelFile: REDACTED photo element + "REDACTED" caption adjacent to/overlaid on photo in mono font
- **AC-023** — PersonnelFile: CLASSIFIED stamp, CSS rotation -20 to -10 deg, red accent token, literal text "CLASSIFIED"
- **AC-024** — PersonnelFile reads all fields from `agent` prop (seam check — no hardcoded values)
- **AC-025** — TransmissionsFeed header: `// RECENT TRANSMISSIONS` in mono on dark surface + `● LIVE` indicator in green accent
- **AC-026** — TransmissionsFeed rows: timestamp (mono), codename (green accent), action (mono, body color on dark)
- **AC-027** — TransmissionsFeed seed: exactly 4 rows in exact order
- **AC-028** — TransmissionsFeed empty state: `// NO TRANSMISSIONS` placeholder; `● LIVE` continues to render
- **AC-029** — TransmissionsFeed no-op: no timer, polling, socket, IPC subscription, or file watcher started (implementation observation)
- **AC-030** — OperativesGrid header: `QUICK START TEMPLATES` kicker + `h2` "Field-ready operatives" in serif italic
- **AC-031** — OperativesGrid: exactly 3 cards in order: Hawkeye (1), Echo (2), Ghost (3)
- **AC-032** — OperativesGrid seed: per-card content matches exact table in AC-032
- **AC-033** — OperativeCard: colored top-rule using red brand accent token (single shared `--lp-accent-red`)
- **AC-034** — OperativeCard Deploy button: `<button type="button">`, accessible name "Deploy <codename>", visible text "DEPLOY" in mono
- **AC-037** — OperativesGrid reads operatives from prop, no hardcoded data (seam check)
- **AC-038** — Footer: `v0.1 · ~/.CLAUDE` left-aligned + `ENCRYPTED AT REST` right-aligned in mono
- **AC-041** — Single `h1` on page; heading hierarchy h1 → h2 → h3 in document order
- **AC-043** — Contrast: four named pairings ≥4.5:1 for normal text

Note: AC-035 (Deploy button hover/focus/active/disabled CSS states) is listed in Phase 4. PRD Phase 3 implementation notes say "The Deploy button...the visual states (hover/focus/active/disabled CSS) are also fully styled here" — I read this carefully. The exact PRD text at §9 Phase 3 reads: "This phase implements the click handler but the visual states (hover/focus/active/disabled CSS) are also fully styled here — the *keyboard* and *focus-management* AC live in Phase 4." So visual button CSS states ARE in Phase 3, but keyboard focus management (AC-044) is Phase 4. I will implement idle + hover/focus/active/disabled CSS on the Deploy button in Phase 3 as the PRD explicitly states.

Note: AC-036 (Deploy button is a no-op) is listed in Phase 4 for AC-ownership purposes, but Phase 3 implements the `console.info` fallback handler per implementation notes.

---

## 4. Reference Files Read

**`src/panels/landing/components/Hero.tsx` (Phase 2 pattern)**
- Named export `export function Hero()`
- No props (literals only)
- Single CSS module import: `import styles from "./Hero.module.css"`
- `data-testid` on root element
- Comments citing AC numbers
- No default export

**`src/panels/landing/components/HeaderBar.tsx` (Phase 2 pattern)**
- Same structure as Hero
- No props, named export

**`src/panels/landing/components/Hero.module.css` (Phase 2 CSS pattern)**
- Comments at top citing phase + AC numbers
- All colors via `var(--lp-*)` — no hardcoded hex
- All font-family via `var(--lp-font-mono)` or `var(--lp-font-display)`
- All sizes via `var(--lp-text-*)` tokens
- Responsive rules use `@media (max-width: 1279px)` pattern (matching Phase 1)

**`src/panels/landing/types.ts` (data shapes)**
- `Agent`, `Transmission`, `Operative`, `ProjectOption` interfaces
- `Operative.disabled?: boolean` already on type (ADR D12 seam)
- All field shapes confirmed against AC-021 / AC-027 / AC-032

**`src/panels/landing/LandingPage.tsx` (composition pattern)**
- Named export `export function LandingPage()`
- Imports seed data at route boundary; passes as props to children
- Phase 3 stubs are `<section className={styles.regionPersonnel} .../>` etc.
- Pattern: each component gets its seed data as a prop; no data is hardcoded inside components

**`src/panels/landing/LandingPage.module.css` (region layout)**
- `.regionTransmissions` already has `background: var(--lp-surface-dark)` — good, no change needed
- `.regionPersonnel`, `.regionOperatives` have max-width + padding layout already set
- `.regionFooter` has `margin-top: auto`

**`src/styles/tokens-landing.css` (token registry)**
- All tokens confirmed present for Phase 3 use
- `--lp-accent-red: #b8362b` — single shared red for all operative top rules (CONS-12)
- `--lp-accent-green: #6b8a3a` — LIVE indicator + codename text in transmissions
- `--lp-accent-amber: #b08740` — Active dot on operative cards
- `--lp-surface-dark: #131512` — transmissions band background
- `--lp-pulse-duration: 1.6s` — LIVE pulse duration
- No new tokens required for Phase 3 (all needed tokens already declared)

**`src/panels/landing/data/seedProjects.ts` (seed module pattern)**
- Pattern: `import type { T } from "../types"; export const seedFoo: T[] = [...]`
- Named export, typed via `import type`
- Minimal — just the data array

---

## 5. Mockup-Derived Visual Decisions

### PersonnelFileCard

From mockup inspection:

**Layout:** Two-column layout. Left column: square photo slot with the REDACTED silhouette SVG. Right column: labeled field table. CLASSIFIED stamp overlaid on the lower-right of the card, rotated.

**Card background:** Slightly off-cream (matches `--lp-surface-cream-soft: #ece4cf`). Card border: `--lp-border-card`. Radius: `--lp-radius-card: 2px`.

**Field table (AC-021 exact pairs):**
| Label | Value |
|---|---|
| ACTIVE FILE | 0427-A |
| CODENAME | HAWKEYE |
| CALLSIGN | code-review |
| SPECIALTY | sonnet |
| CLEARANCE | all tools |
| LAST SEEN | ~ 2d |
| STATUS | Active |

**Label styling:** mono, uppercase, `--lp-ink-soft`, `--lp-text-xs` (11px)
**Value styling:** mono, `--lp-ink`, `--lp-text-sm` (12px)

**REDACTED silhouette (AC-022, ADR D5):**
- Inline SVG component `RedactedSilhouette.tsx`
- Human bust (head + shoulders) as `<path>`, filled with `--lp-ink-soft` via `currentColor`
- Slight desaturated rectangle background (the photo slot background) in `--lp-surface-dark-soft` or similar
- "REDACTED" text is a separate DOM element adjacent to (below) the SVG, NOT inside the SVG — per PRD §9 Phase 3 implementation notes: "The literal text 'REDACTED' is rendered as a separate DOM element adjacent to the SVG (not inside it) per AC-022, so QA can grep for it cleanly."
- Mono, `--lp-text-xs`, `--lp-ink-faint`

**CLASSIFIED stamp (AC-023, ADR D5):**
- Inline SVG component `ClassifiedStamp.tsx`
- `<svg viewBox="0 0 240 80">` with stroked `<rect>` border (red, 3px stroke, no fill)
- `<text>` content: `CLASSIFIED`, centered, letter-spacing wide, fill `var(--lp-accent-red)`
- SVG element has `transform: rotate(-15deg)` applied (within -20 to -10 deg AC-023 range)
- Absolutely positioned over the lower-right portion of the card
- `opacity: 0.92`

### TransmissionsFeed

**Section background:** Full-width dark band, `background: var(--lp-surface-dark)` (already set in LandingPage.module.css regionTransmissions)

**Header row:** 
- Left: `// RECENT TRANSMISSIONS` — mono, `--lp-on-dark`, `--lp-text-sm`
- Right: `● LIVE` — green dot + text, `--lp-accent-green`, `--lp-text-xs`, with CSS-only opacity-pulse animation

**Row format (AC-027, ADR D9 = exactly 4 rows):**
1. `01:42:07` — `HAWKEYE` — `flagged 3 issues in api/auth.ts`
2. `01:38:14` — `ECHO` — `authored 12 tests for payments/processor.ts`
3. `01:31:55` — `GHOST` — `updated docs/getting-started.md`
4. `01:24:02` — `ECHO` — `cleared PR #2247`

**Row styling:**
- Timestamp: mono, `--lp-on-dark-soft`, `--lp-text-sm`
- Em-dash separator: mono, `--lp-on-dark-soft`
- Codename: mono, `--lp-accent-green`, `--lp-text-sm`
- Em-dash: mono, `--lp-on-dark-soft`
- Action: mono, `--lp-on-dark`, `--lp-text-sm`

**LIVE indicator:** CSS keyframe animation using `opacity` oscillation between 0.4 and 1.0. Gated by `@media (prefers-reduced-motion: reduce)` which sets `animation: none` (AC-042 note: this is a Phase 4 AC but the CSS rule is safe to add now; PRD §9 Phase 3 says the indicator has "a CSS-only opacity-pulse animation, gated by the reduced-motion media query"). I will implement the pulse CSS here since Phase 3 implementation notes say "No `useEffect`, no `setInterval`" and the CSS-only pulse is explicitly part of the component's Phase 3 implementation.

**Empty state (AC-028):** Single element with `// NO TRANSMISSIONS` in `--lp-on-dark-soft`, mono.

### OperativesGrid

**Grid layout:** `grid-template-columns: repeat(3, 1fr)`, `gap: 32px` (per PRD §8 UI Requirements)

**Section header (AC-030):**
- Kicker: `QUICK START TEMPLATES` in mono, `--lp-text-xs`, `--lp-ink-soft`
- `h2`: `Field-ready operatives` in `--lp-font-display` *italic*, `--lp-text-lg` (28px), `--lp-ink`

**Each operative card (AC-032 exact data):**

Card 1 — Hawkeye:
- Index: `// 01 //`
- Class line: `Reviewer-class` (left) / `● Active` (right, amber dot)
- Codename: `Hawkeye` (h3, display italic, `--lp-text-md` 18px)
- Callsign: `CALLSIGN — CODE-REVIEWER` (mono, `--lp-text-xs`)
- Description: `Reads diffs and PRs for correctness, security, and maintainability. Flags what matters, skips the pedantic.`
- Footer: `MODEL sonnet` (left), `MISSIONS 47` (left), `DEPLOY` button (right)

Card 2 — Echo:
- Index: `// 02 //`
- Class line: `Analyst-class` / `● Active`
- Codename: `Echo`
- Callsign: `CALLSIGN — TEST-WRITER`
- Description: `Detects your test framework, mirrors existing conventions, covers the happy path and the edges that bite.`
- Footer: `MODEL default` / `MISSIONS 23` / `DEPLOY`

Card 3 — Ghost:
- Index: `// 03 //`
- Class line: `Archivist-class` / `● Active`
- Codename: `Ghost`
- Callsign: `CALLSIGN — DOC-WRITER`
- Description: `Reads existing docs to match voice and structure. Leads with the why, then the how. Leaves no trace.`
- Footer: `MODEL default` / `MISSIONS 11` / `DEPLOY`

**Top rule (AC-033, CONS-12):** `border-top: 2px solid var(--lp-accent-red)` — SINGLE shared token for all three cards. No per-card variants.

**Deploy button (AC-034):** `<button type="button">`, `aria-label="Deploy <Codename>"`, visible text `DEPLOY` in mono. Phase 3 also implements CSS states (hover/focus/active/disabled) per PRD §9 Phase 3 note.

**Heading hierarchy (AC-041):** Hero has `h1`. OperativesGrid section has `h2` ("Field-ready operatives"). Each OperativeCard codename is `h3`. No heading elements in TransmissionsFeed header, PersonnelFileCard, Footer, HeaderBar, or StatusBar — all use `<div>` or `<span>`.

### Footer

**Content (AC-038):**
- Left: `v0.1 · ~/.CLAUDE` (mono, `--lp-ink-faint`, `--lp-text-xxs`)
- Right: `ENCRYPTED AT REST` (mono, `--lp-ink-faint`, `--lp-text-xxs`)
- Layout: flex, space-between

---

## 6. Anti-Patterns from PRD Phase 3 Implementation Notes

**Transmissions feed (AC-029 no-op):**
- NO `useEffect` in `TransmissionsFeed.tsx` for any reason
- NO `setInterval`, NO `setTimeout`, NO `setTimeout` chained
- NO websocket, NO IPC subscription, NO file watcher
- Feed renders from `transmissions` prop once, period
- `● LIVE` indicator is purely visual CSS pulse — no JS timing involved
- Verification: `git grep useEffect src/panels/landing/components/TransmissionsFeed.tsx` must return nothing

**Deploy buttons (AC-036 no-op in Phase 3):**
- Do NOT pass `onDeploy` from `LandingPage.tsx` — let the card fall to the `console.info` fallback
- `onClick` invokes `onDeploy(operative.id)` if prop provided, else `console.info(\`Deploy: \${operative.codename}\`)`
- NO navigation, NO IPC call, NO network call, NO store mutation
- `onDeploy` is declared as `onDeploy?: (id: string) => void` on OperativesGrid and OperativeCard props

**Project selector wiring:**
- Do NOT touch `ProjectSelector.tsx` — Phase 4 owns its open/close state
- Do NOT add `onDeploy` prop pass-through in `LandingPage.tsx`

**SVG assets:**
- ClassifiedStamp and RedactedSilhouette are inline SVG components — NO raster, NO external SVG files, NO CSS-only rendering

**Data hardcoding:**
- NO operative data inside OperativeCard or OperativesGrid components — all from prop (AC-037 seam)
- NO agent data inside PersonnelFileCard — all from `agent` prop (AC-024 seam)

**Heading discipline:**
- Only ONE `h1` exists in the document (Hero, Phase 2). Do not add another.

---

## 7. Consensus Ledger Items Applicable to Phase 3

**CONS-12 (single `--lp-accent-red` for all three operative top rules):**
- Confirmed: ADR D8 locks this. All three cards use `border-top: 2px solid var(--lp-accent-red)`.
- I will NOT introduce `--lp-accent-reviewer`, `--lp-accent-analyst`, `--lp-accent-archivist` or any per-card variant.
- CSS in `OperativeCard.module.css` uses a single `.topRule` class with `border-top: 2px solid var(--lp-accent-red)` — same class on all three.

**CONS-09 (real italic font, no synthetic obliquing):**
- Phase 2 verified EB Garamond Italic is loaded. Phase 3 uses `font-style: italic` on `h2` ("Field-ready operatives") and operative card codenames (h3, display italic per PRD §8 OperativeCard note: "Codename (`--lp-font-display` italic, `--lp-text-md`)").
- No new font loading needed. Existing `@font-face` declaration in `tokens-landing.css` already registers `font-style: italic` for EB Garamond Italic.

**CONS-03 / AC-039 (`tokens.css` unchanged, no `--lp-*` under `:root`):**
- Phase 3 adds NO tokens to `tokens-landing.css` — all needed tokens already exist.
- Phase 3 does NOT modify `tokens.css`.
- If any new token were needed, it would go under `.landing-root { ... }` only. (I do not expect any.)

**CONS-14 (`landing-root` plain string class):**
- `LandingPage.tsx` uses `className="landing-root"` (plain string, not CSS module). This is established in Phase 1 and must not change.
- Phase 3 components use CSS module classes internally. No conflict.

**CONS-01 (Phase 3 file count — CTO §4 accepted the over-cap justification):**
- CTO Round 2 §4 accepted 14 new source files + 1 modify. Tracked above. I will stay within this bound.

**AC-043 contrast pairings to verify and document:**
- Body text on cream: `--lp-ink (#1d1c19)` on `--lp-surface-cream (#f1ead8)` — very high contrast (dark on light), easily >10:1
- Mono UI text on cream: `--lp-ink-soft (#4a4742)` on `--lp-surface-cream (#f1ead8)` — need to verify ≥4.5:1
- Mono UI text on dark: `--lp-on-dark (#d8d2bf)` on `--lp-surface-dark (#131512)` — light on very dark, easily >10:1
- Red accent on cream: `--lp-accent-red (#b8362b)` on `--lp-surface-cream (#f1ead8)` — PRD §10 states "5.4:1 (passes 4.5:1 normal-text threshold)" — confirmed pass

**Deploy button CSS states (Phase 3 per implementation notes §9):**
- Idle: `--lp-ink` text on transparent, hairline border
- Hover: `--lp-ink` background + `--lp-surface-cream` text (invert)
- Focus-visible: 2px outline `--lp-accent-red` offset 2px
- Active: `--lp-accent-red` background + `--lp-surface-cream` text
- Disabled: `aria-disabled="true"`, opacity 0.5, pointer-events none
- These CSS states are Phase 3 work per implementation notes. The keyboard focus MANAGEMENT (AC-044 Tab order) is Phase 4.

---

## Decisions Made During Exploration

1. **PersonnelFileCard card internal layout:** Two columns — photo slot (left, square ~120px) + field table (right). CLASSIFIED stamp is absolutely positioned relative to the card root. Card root must have `position: relative`.

2. **RedactedSilhouette slot background:** The photo slot will use `background: var(--lp-surface-dark-soft)` — a desaturated dark background for the photo area, contrasting with the cream card. Matches the dark photo placeholder visible in the mockup.

3. **No new tokens needed:** All Phase 3 visual requirements are covered by existing tokens. No additions to `tokens-landing.css`.

4. **PersonnelFileCard receives `agent: Agent` prop:** Seam satisfied. `LandingPage.tsx` imports `seedAgent` and passes it.

5. **`h3` for operative codenames:** Per PRD §9 Phase 3 implementation notes: "operative card codenames are `h3`". Confirms the heading order: h1 (hero) → h2 (operatives section) → h3 (each card codename). Heading hierarchy is valid and satisfies AC-041.

6. **TransmissionsFeed section padding:** The dark band is full-width (regionTransmissions in LandingPage.module.css has `width: 100%`). The internal content uses max-width/padding matching the content column.

7. **OperativesGrid kicker (`QUICK START TEMPLATES`):** This is a `<p>` or `<div>` with mono styling, NOT a heading element. Heading hierarchy check: transmissions header is a div, operative section kicker is a div, only the `h2` and `h3` are heading elements in Phase 3 additions.
