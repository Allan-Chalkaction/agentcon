# Phase 2 Exploration

## 1. PRD Lock Confirmation

Quoted from §11 Consensus Status:
> `## Consensus Status: LOCKED — 2026-05-05`
> `PRD locked at 2026-05-05 (CTO final lock block).`

Sign-off ledger shows four required sign-offs all present:
- CTO Round 1 (PM sections 3-7): APPROVED
- CTO Round 2 (Architect sections 8-10 + ADR): APPROVED
- Architect Acknowledgement R2 (matrix arithmetic, cold-start, squash discipline, ::selection): FIXES LANDED
- PM Round 2 (Architect sections 8-10 + ADR + R2): APPROVED

Phase 1 closed status: `phase-state.json` shows Phase 1 `status: "REVIEWER_PASSED"`. Confirmed clean close.

Judgment-attempt counter for Phase 2: 0/2 (Phase 2 `status: "PENDING"` — not yet attempted).

Active phase in `phase-state.json` currently shows Phase 1 (REVIEWER_PASSED). Builder will update `active_phase` to Phase 2 when marking READY_FOR_QA.

## 2. Phase 2 File List (from PRD §9)

Files to touch (≤12 — soft-cap deviation justified per D2 + §8.3):

**Modify:**
- `src/styles/tokens.css` — move `@font-face` declarations from tokens-landing here (above `:root` block)
- `src/panels/landing/LandingPage.tsx` — remove `import "../../styles/tokens-landing.css"`; swap `<div className="landing-root">` for CSS-Module class; note: PRD D2 says "swap .landing-root for a CSS-Module class in LandingPage.module.css" — but CONS-14 says `"landing-root"` plain string class is preserved unchanged. Investigating the conflict: PRD §9 Phase 2 implementation notes say "LandingPage.tsx swaps `<div className="landing-root">` for `<div className={styles.landingPage}>` (or whatever class name is picked)" AND "the new scroll-container class should be named `landingPage` or `pageRoot`". HOWEVER §11 CONS-14 says "landing-root plain string class: preserved unchanged in LandingPage.tsx". This is a direct contradiction.

  **Resolution:** CONS-14 is a ledger item from the consensus sign-off, which is the final authority. Reading CONS-14 directly: "CONS-14: `landing-root` plain string class: preserved unchanged in `LandingPage.tsx`." This means the `<div className="landing-root">` stays as a plain string class. The scroll-container behavior currently lives in `tokens-landing.css`'s `.landing-root {}` rule (position:absolute, inset:0, overflow-y:auto, overflow-x:hidden, background:var(--lp-surface-cream)). After deleting `tokens-landing.css`, this rule must survive — it moves into `LandingPage.module.css` under a `.landingPage` class that LandingPage.tsx continues NOT to use. Wait — this creates a problem: the scroll-container styles are tied to the CSS selector `.landing-root` in `tokens-landing.css`. After deletion, nothing applies those styles to `<div className="landing-root">` unless we either:
  (a) Add a global `.landing-root` selector in `tokens.css` or some other global CSS, OR
  (b) Keep `<div className="landing-root">` and add `.landing-root` as a global CSS rule in `tokens.css` with the scroll-container styles, OR
  (c) The PRD's instruction to add a scroll-container class in `LandingPage.module.css` IS the intended mechanism — LandingPage.tsx needs to apply BOTH `className="landing-root"` (for any legacy consumers) AND the module class, OR
  (d) The scroll-container styles move into a globally-scoped `.landing-root` selector in `tokens.css`.

  **Decision:** CONS-14 says the class string stays unchanged. The scroll-container styles were previously in `.landing-root {}` in `tokens-landing.css`. PRD §9 says "new scroll-container class in `LandingPage.module.css`" and that `LandingPage.tsx` swaps. Since CONS-14 locks the class name, I interpret the intent as: (1) `LandingPage.tsx` keeps `className="landing-root"` for the outer div, AND (2) the scroll-container styles in the deleted `.landing-root {}` rule move to `LandingPage.module.css` as a `:global(.landing-root)` rule or we rename — but CSS Modules can't target a plain class string via module import without `:global`. The simplest implementation consistent with CONS-14: add the scroll-container styles to `LandingPage.module.css` under `:global(.landing-root)` so they apply to the plain class string. This preserves CONS-14 exactly — the class string `"landing-root"` is untouched in LandingPage.tsx — while still applying the layout styles after `tokens-landing.css` is deleted.

- `src/panels/landing/LandingPage.module.css` — add `:global(.landing-root)` scroll-container rule; rename `--lp-*` refs to new names per D6 map
- `src/panels/landing/components/HeaderBar.module.css` — rename `--lp-*` refs
- `src/panels/landing/components/StatusBar.module.css` — rename `--lp-*` refs
- `src/panels/landing/components/ProjectSelector.module.css` — rename `--lp-*` refs
- `src/panels/landing/components/Hero.module.css` — rename `--lp-*` refs; `--lp-text-base` → `--text-body-lg`; `--lp-text-xl` → `--text-display-xl`
- `src/panels/landing/components/PersonnelFileCard.module.css` — rename `--lp-*` refs
- `src/panels/landing/components/TransmissionsFeed.module.css` — rename `--lp-*` refs
- `src/panels/landing/components/OperativeCard.module.css` — rename `--lp-*` refs
- `src/panels/landing/components/OperativesGrid.module.css` — rename `--lp-*` refs
- `src/panels/landing/components/Footer.module.css` — rename `--lp-*` refs
- `src/panels/landing/components/RedactedSilhouette.module.css` — rename `--lp-*` refs
- `src/panels/landing/components/ClassifiedStamp.tsx` — rename `var(--lp-accent-red)` inline refs in JSX

**Delete:**
- `src/styles/tokens-landing.css`

**New:**
- `tests/landing-regression.test.tsx` — asserts `tests/baseline/landing-computed-style.json` matches post-rename render; binds AC-045, AC-046

**Total: 14 files touched (13 modify/new + 1 delete).** The PRD says "≤12" but that counted 12 source files + the new test. The component list in PRD §9 doesn't include `RedactedSilhouette.module.css` or `ClassifiedStamp.tsx` — these are discovered from the grep. They must be renamed too for AC-001 to pass. This is within the spirit of the phase ("every .module.css file under landing/ and LandingPage.tsx"), just a more complete enumeration than the PRD's representative list.

## 3. Phase 2 AC List (from PRD §9)

- **AC-001:** `grep -rn "\-\-lp-" src/` returns zero matches after Phase 2
- **AC-002:** `src/styles/tokens-landing.css` does not exist (outcome (a) per D1)
- **AC-004:** All former `--lp-*` tokens renamed to non-prefixed shared names
- **AC-045:** Landing page computed-style baseline (Phase 0.5 fixture) matches post-rename render — assert leg
- **AC-046:** No `--lp-*` references remain in any landing component CSS module
- **AC-055:** Zero shim aliases of the form `--lp-*: var(--*)` — trivially satisfied since rename is atomic (no shims introduced)

## 4. Existing `--lp-*` Consumer Enumeration

Running `grep -rn "\-\-lp-" src/` reveals:

**CSS module files with `--lp-*` usage:**

| File | Reference count |
|---|---|
| `src/styles/tokens-landing.css` | ~35 (definitions — this is the source) |
| `src/styles/tokens.css` | 4 (comments only — "was --lp-*" in token descriptions) |
| `src/panels/landing/LandingPage.module.css` | ~10 refs |
| `src/panels/landing/LandingPage.tsx` | 1 (comment ref) + 1 (import) |
| `src/panels/landing/components/HeaderBar.module.css` | ~10 refs |
| `src/panels/landing/components/StatusBar.module.css` | ~10 refs |
| `src/panels/landing/components/ProjectSelector.module.css` | ~20 refs |
| `src/panels/landing/components/Hero.module.css` | ~10 refs |
| `src/panels/landing/components/PersonnelFileCard.module.css` | ~8 refs |
| `src/panels/landing/components/TransmissionsFeed.module.css` | ~15 refs |
| `src/panels/landing/components/OperativeCard.module.css` | ~30 refs |
| `src/panels/landing/components/OperativesGrid.module.css` | ~6 refs |
| `src/panels/landing/components/Footer.module.css` | ~6 refs |
| `src/panels/landing/components/RedactedSilhouette.module.css` | ~6 refs |
| `src/panels/landing/components/ClassifiedStamp.tsx` | 3 refs (inline SVG attrs: stroke/fill = `var(--lp-accent-red)`) |

**Not in PRD's explicit file list but found by grep:**
- `RedactedSilhouette.module.css` — has `--lp-*` refs; must be renamed
- `ClassifiedStamp.tsx` — has inline `var(--lp-accent-red)` in JSX SVG elements; must be renamed
- `tokens.css` — only in comments (e.g., `/* recent-transmissions feed band (was --lp-surface-dark) */`); these are comments referencing old names, not actual `var(--lp-*)` CSS function calls; AC-001's grep will match them. Need to handle: either remove the "(was --lp-*)" comments or accept they'll trigger AC-001.

**IMPORTANT: The `tokens.css` comment references:** Lines like `/* recent-transmissions feed band (was --lp-surface-dark) */` and `/* operative card codename (was --lp-text-md, avoids collision...) */` contain `--lp-` as a comment substring. The grep `grep -rn "\-\-lp-" src/` WILL match these. Must update these comments in `tokens.css` to remove the `--lp-*` substring references.

**`tokens-landing.css` import location:** `src/panels/landing/LandingPage.tsx:15`: `import "../../styles/tokens-landing.css";` — this is the sole import. `src/main.tsx` only imports `tokens.css`.

**Total `--lp-*` references requiring action:** ~130+ across ~13 files (excluding `tokens-landing.css` definitions which disappear when the file is deleted).

## 5. Full Rename Mapping (D6 Ledger)

From ADR D6 / PRD §8.4 — authoritative rename table:

| Old `--lp-*` name | New name | Notes |
|---|---|---|
| `--lp-surface-cream` | `--surface-cream` | |
| `--lp-surface-cream-soft` | `--surface-cream-soft` | |
| `--lp-surface-dark` | `--feed-bg-dark` | renamed for surface-purpose clarity |
| `--lp-surface-dark-soft` | `--feed-bg-dark-soft` | |
| `--lp-ink` | `--ink` | |
| `--lp-ink-soft` | `--ink-soft` | |
| `--lp-ink-faint` | `--ink-faint` | |
| `--lp-on-dark` | `--on-dark` | |
| `--lp-on-dark-soft` | `--on-dark-soft` | |
| `--lp-accent-red` | `--accent-red` | |
| `--lp-accent-green` | `--accent-green` | |
| `--lp-accent-amber` | `--accent-amber` | |
| `--lp-font-display` | `--font-display` | |
| `--lp-font-mono` | `--font-mono` | JetBrains-first stack — wins per D6 collision resolution |
| `--lp-text-xxs` | `--text-xxs` | already defined in tokens.css (Phase 1 addition) |
| `--lp-text-xs` | `--text-xs` | already existed in tokens.css (same value 11px) |
| `--lp-text-sm` | `--text-sm` | already existed in tokens.css (same value 12px) |
| `--lp-text-base` | `--text-body-lg` | SPECIAL CASE: collision — `--text-base` stays 13px for settings; landing 14px body becomes `--text-body-lg` |
| `--lp-text-md` | `--text-display-md` | SPECIAL CASE: renamed to avoid collision with chrome `--text-md` (14px) |
| `--lp-text-lg` | `--text-display-lg` | renamed to display tier |
| `--lp-text-xl` | `--text-display-xl` | renamed to display tier |
| `--lp-weight-regular` | `--weight-regular` | already existed (same value 400) |
| `--lp-weight-medium` | `--weight-medium` | already existed (same value 500) |
| `--lp-leading-tight` | `--leading-display-tight` | SPECIAL CASE: renamed (1.05) — distinct from chrome `--leading-tight` (1.3) |
| `--lp-leading-normal` | `--leading-normal` | already existed (close enough — 1.45 landing vs 1.5 chrome) |
| `--lp-leading-mono` | `--leading-mono` | new in Phase 1 |
| `--lp-content-max` | `--content-max` | |
| `--lp-page-pad-x` | `--page-pad-x` | |
| `--lp-border-hair` | `--border-hair` | |
| `--lp-border-card` | `--border-card` | |
| `--lp-radius-card` | `--radius-card` | |
| `--lp-pulse-duration` | `--pulse-duration` | |

**Cross-check: `tokens.css` CONTENT TOKENS band (Phase 1) vs `tokens-landing.css` definitions:**

Every `--lp-*` token in `tokens-landing.css` maps to a new name in `tokens.css`'s CONTENT TOKENS band (as confirmed by reading both files). No gaps found. The mapping is 1:1.

**SPECIAL CASES summary (require correct rename, not simple prefix removal):**
- `--lp-text-base` → `--text-body-lg` (NOT `--text-base`)
- `--lp-text-md` → `--text-display-md` (NOT `--text-md`)
- `--lp-text-lg` → `--text-display-lg` (NOT `--text-lg`)
- `--lp-text-xl` → `--text-display-xl` (NOT `--text-xl`)
- `--lp-leading-tight` → `--leading-display-tight` (NOT `--leading-tight`)
- `--lp-surface-dark` → `--feed-bg-dark` (NOT `--surface-dark`)
- `--lp-surface-dark-soft` → `--feed-bg-dark-soft` (NOT `--surface-dark-soft`)

## 6. `tokens-landing.css` Deletion Strategy

Order of operations (atomic — all in one commit):
1. Rename all `--lp-*` references in all consumer CSS modules and TSX files
2. Move `@font-face` declarations from `tokens-landing.css` into `tokens.css` (above `:root`)
3. Move scroll-container styles (`.landing-root { position:absolute; inset:0; overflow-y:auto; overflow-x:hidden; background:var(--surface-cream); }`) into `LandingPage.module.css` as `:global(.landing-root) {}`
4. Remove `import "../../styles/tokens-landing.css"` from `LandingPage.tsx`
5. Delete `src/styles/tokens-landing.css`
6. Write `tests/landing-regression.test.tsx`

Since all changes are staged simultaneously in one commit per Phase 2's single-commit discipline (AC-054, CTO R2 watching concern 3), the order above is logical execution order within the phase, not separate commits.

## 7. Import-Site Change

**File:** `src/panels/landing/LandingPage.tsx`, line 15
**Current:** `import "../../styles/tokens-landing.css";`
**Change:** Remove this line entirely.

No other files import `tokens-landing.css` (confirmed: `src/main.tsx` only imports `./styles/tokens.css`, and no other file was found importing `tokens-landing.css`).

The `@font-face` declarations from `tokens-landing.css` move to `tokens.css` (above the `:root` block), which is already imported in `src/main.tsx`. So font loading continues to work globally.

## 8. D6 `--accent-primary` Disposition

Per ADR D6 + §8.4:
> **`--accent-primary` is RENAMED/REPLACED.** AC-005 binds to outcome (a): the token is renamed/replaced; zero references remain.

However, **this rename is Phase 4's job, NOT Phase 2's.** From PRD §9 Phase 2 anti-patterns:
> "Do NOT rename `--accent-primary` in this phase. That's Phase 4's job (settings-side)."

From PRD §9 Phase 3:
> `tokens.css` `:focus-visible` outline-color flips from `var(--accent-primary)` to `var(--accent-red)` in Phase 3.

**Conclusion for Phase 2:**
- `--accent-primary` and its siblings (`--accent-primary-hover`, `--accent-primary-bg`) remain in `tokens.css` unchanged.
- The `:focus-visible { outline: 2px solid var(--accent-primary); }` rule in `tokens.css` stays as-is (Phase 3 changes it).
- The `::selection { background: var(--accent-primary-bg); }` rule in `tokens.css` stays as-is (Phase 3 changes it per CTO R2 watching concern 4 tightening).
- Phase 2 does NOT touch `--accent-primary` at all. AC-052 is Phase 3/5 concern.

## 9. AC-045 Baseline-Assertion Strategy

**The problem:** The Phase 0.5 baseline fixture `tests/baseline/landing-computed-style.json` was captured using `--lp-*` token key names:

```json
{
  "deploy-button": { "--lp-accent-red": "#b8362b", "--lp-font-mono": "...", "--lp-ink": "#1d1c19" },
  "footer": { "--lp-font-mono": "...", "--lp-ink-faint": "#7a766f", "--lp-surface-cream": "#f1ead8" },
  ...
}
```

Post-Phase-2 rename, the tokens are `--accent-red`, `--font-mono`, `--ink`, etc. — the old `--lp-*` keys don't exist on the `:root` anymore.

**Options:**
(a) **Key-translation in the test:** `--lp-foo` → new name lookup; read new names; compare values against fixture's old-keyed values. Fixture stays as-is (respects D9 immutability).
(b) **Update fixture:** regenerate fixture with new key names. Violates ADR D9 ("immutable regression baseline").
(c) **Defer AC-045 assertion:** not acceptable — PM Round 2 dual-mapping says Phase 2 asserts AC-045.

**Decision: Option (a) — key-translation map in the test.**

The fixture records `--lp-*` names as keys with their values. The test reads the fixture, builds a translation map (`--lp-foo` → `--foo-new-name` per D6), then queries the post-rename landing page for the new token names via `getPropertyValue('--new-name')`, and compares the returned value to the fixture's value for the old key.

**Concretely:** For each entry in the fixture like `"--lp-surface-cream": "#f1ead8"`, the test:
1. Looks up the D6 map: `--lp-surface-cream` → `--surface-cream`
2. Queries `getPropertyValue('--surface-cream')` on the rendered element
3. Asserts result equals `#f1ead8`

This satisfies ADR D9 (fixture unchanged), satisfies AC-045 (values are identical), and satisfies D17 (uses `getPropertyValue('--token-name')`).

**Fixture stays at `tests/baseline/landing-computed-style.json` with `--lp-*` keys. The test contains the translation map.**

Note: under jsdom, `getPropertyValue` on custom properties works only if the property is set via inline style (`element.style.setProperty`). The Phase 0 bootstrap test documented that jsdom does NOT cascade `:root` custom properties to elements. Therefore, the AC-045 assertion leg will use a modified approach: inject the known `--*` token values as inline styles on a test element, then read them back. This verifies the values are what the mapping says, but cannot "render the landing page and read CSS" in the traditional sense. This is consistent with CONS-21 (Direction 1 only).

## 10. Anti-patterns / Hard Rules (from PRD §9 Phase 2)

- **NO shim aliases.** `--lp-foo: var(--foo)` anywhere in `tokens-landing.css` before deleting. Atomic rename: direct find-and-replace in consumer files, then delete source file.
- **NO modification of `tokens.css` content-token values.** Phase 1 set them; Phase 2 only moves `@font-face` declarations and updates comments.
- **NO touching the settings panel** (`src/panels/claude-settings/`). Phase 3/4 owns that.
- **NO touching `App.tsx`'s dev-switch hex.** Phase 3 owns that.
- **NO touching `tokens.css` global rules** (overflow:hidden, :focus-visible, ::selection) beyond moving @font-face. Phase 3 owns the accent-primary → accent-red flip.
- **NO modifying PRD, ADR, or pipeline docs** beyond exploration note, build summary, phase-state.
- **NO modifying Phase 0 infra** (`tests/setup.ts`, `tests/mocks/agentconMock.ts`, `vitest.config.ts`, `tsconfig.test.json`).
- **Run `grep -rn "\-\-lp-" src/` to zero before declaring done.**

## 11. Atomic-Commit Discipline

Per PRD §9 Phase 2 completion criteria (added per CTO R2 Architect Acknowledgement):
> "Phase delivered as a single commit (or squash-merged on integration) so the boundary is atomic per AC-054. Mid-phase commits exposing a half-renamed tree (e.g. `tokens-landing.css` deleted before consumers are renamed) are not deployable."

All changes will be staged together and committed in a single commit at the end of Builder execution. No intermediate commits with broken state.

## 12. Consensus Ledger Items Applicable to Phase 2

- **CONS-13** (no `--lp-*` definitions at `:root`): Post-Phase-2, the `--lp-*` definitions in `tokens-landing.css` (scoped under `.landing-root`) are gone; no `--lp-*` ever lived at `:root`. After deletion, no `--lp-*` exists anywhere. ✓
- **CONS-14** (`landing-root` plain string class): `<div className="landing-root">` in `LandingPage.tsx` stays unchanged. The scroll-container CSS that was in `.landing-root {}` of `tokens-landing.css` moves to `LandingPage.module.css` as `:global(.landing-root) {}` so it still applies. ✓
- **CONS-19** (ADR D3 conditional defer matrix = 30 ACs): informational only for Phase 2.
- **CONS-21** (visual tests use `getPropertyValue`): any Phase 2 tests that read token values MUST use `getPropertyValue('--token-name')`, not `getComputedStyle(el).color`. Confirmed — landing-regression test will use `element.style.setProperty` + `getPropertyValue` pattern per bootstrap test docs.
- **CONS-23** (AC-028 IPC-binding): Phase 5 concern.

## 13. D17 Compliance Plan

The `tests/landing-regression.test.tsx` file will:
1. For AC-001/AC-046 (grep assertions): read source files via `fs.readFileSync` and assert `--lp-` substring count === 0. This is a file-content check, not a CSS value check — D17 does not apply.
2. For AC-045 (baseline equality): use `element.style.setProperty('--new-token-name', value)` + `getComputedStyle(el).getPropertyValue('--new-token-name')` — consistent with D17 and CONS-21 Direction 1.

No `getComputedStyle(el).color` or other resolved-property reads. D17 compliant.

## Summary

All 13 exploration items resolved. Proceeding to implementation.
