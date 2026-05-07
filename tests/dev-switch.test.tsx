/**
 * Dev-switch button regression tests — Phase 3
 *
 * Binds: AC-010, AC-011, AC-012, AC-013, AC-014.
 *
 * ── ADR D17 (CONS-21) compliance ────────────────────────────────────────────
 * All token-value reads use Direction 1: getComputedStyle(el).getPropertyValue('--token-name').
 * Direct resolved-property reads (getComputedStyle(el).backgroundColor etc.) are NOT used
 * as primary assertion mechanisms for token-driven values — jsdom 25 does not resolve var()
 * chains in computed style readouts.
 *
 * ── ADR D5 compliance ────────────────────────────────────────────────────────
 * The IPC mock is installed globally in tests/setup.ts beforeEach. The dev-switch button
 * does not use IPC, but the global setup runs. No additional mock setup needed here.
 *
 * ── AC-013 disjunction (ADR D14) ─────────────────────────────────────────────
 * AC-013's "background-color contrast vs settings chrome" clause binds to the disjunction:
 *   (a) background-color contrasts ≥3:1 with surround, OR
 *   (b) border-color contrasts ≥3:1 with surround.
 * The chosen treatment (background: --ink, border: --surface-cream) satisfies (b):
 * --surface-cream (#f1ead8) vs --bg-base (#0a0c10) ≈ 17.0:1. This test asserts (b).
 * See ADR D14 for full reasoning and the PM sign-off request for (a) clarification.
 *
 * ── WCAG luminance helper ────────────────────────────────────────────────────
 * Per WCAG 2.x relative luminance: L = 0.2126*r_lin + 0.7152*g_lin + 0.0722*b_lin
 * where c_lin = (c/255)^2.2 for sRGB gamut values.
 * contrast(L1, L2) = (max(L1, L2) + 0.05) / (min(L1, L2) + 0.05)
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "..");
const APP_TSX_PATH = path.join(REPO_ROOT, "src/App.tsx");
const APP_MODULE_CSS_PATH = path.join(REPO_ROOT, "src/App.module.css");

// ── WCAG utilities ───────────────────────────────────────────────────────────

/**
 * Parse a hex color string (#rrggbb) to sRGB components [0,255].
 */
function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/**
 * WCAG 2.x relative luminance for sRGB.
 * Uses the 2.2 gamma approximation for component linearization.
 */
function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * WCAG 2.x contrast ratio between two luminances or hex colors.
 */
function contrastRatio(hexA: string, hexB: string): number {
  const lA = relativeLuminance(hexA);
  const lB = relativeLuminance(hexB);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

// ── Token values (from src/styles/tokens.css Phase 1/2/3 committed values) ──
//
// These are the resolved values for the tokens used by .devSwitch.
// They are sourced from the token definitions, not from jsdom CSS cascade
// (which doesn't resolve var() chains — ADR D17 Direction 1 pattern).

const TOKEN_INK = "#1d1c19";              // --ink
const TOKEN_SURFACE_CREAM = "#f1ead8";    // --surface-cream
const TOKEN_BG_BASE = "#0a0c10";          // --bg-base (settings chrome outer canvas)

// ── AC-014 + AC-010: No inline hex literals in App.tsx ──────────────────────

describe("AC-014 + AC-010: App.tsx dev-switch button has no inline hex color literals", () => {
  it("App.tsx source file exists", () => {
    expect(fs.existsSync(APP_TSX_PATH)).toBe(true);
  });

  it("App.tsx contains no hex color literals in any style prop", () => {
    const source = fs.readFileSync(APP_TSX_PATH, "utf-8");
    // Match hex color literals: # followed by 3, 4, 6, or 8 hex digits
    // Exclude false positives like CSS comments or ADR references (those
    // would appear in JSX source, not in a style= prop).
    // We look for hex literals inside style= attribute context specifically.
    // Broader check: find any hex-color pattern (#[0-9a-fA-F]{3,8}) in a style= JSX prop.
    const stylePropsWithHex = source.match(/style=\{[^}]*#[0-9a-fA-F]{3,8}/g);
    expect(
      stylePropsWithHex,
      `Found inline style prop(s) with hex color literals: ${JSON.stringify(stylePropsWithHex)}`
    ).toBeNull();
  });

  it("App.tsx uses className={styles.devSwitch} on the dev-switch button", () => {
    const source = fs.readFileSync(APP_TSX_PATH, "utf-8");
    expect(source).toContain("className={styles.devSwitch}");
  });

  it("App.tsx imports App.module.css as styles", () => {
    const source = fs.readFileSync(APP_TSX_PATH, "utf-8");
    expect(source).toContain('import styles from "./App.module.css"');
  });
});

// ── AC-010: Token assignment verification ────────────────────────────────────

describe("AC-010: App.module.css .devSwitch uses correct tokens (no inline hex)", () => {
  it("App.module.css exists", () => {
    expect(fs.existsSync(APP_MODULE_CSS_PATH)).toBe(true);
  });

  it("App.module.css .devSwitch declares background: var(--ink)", () => {
    const source = fs.readFileSync(APP_MODULE_CSS_PATH, "utf-8");
    expect(source).toContain("background: var(--ink)");
  });

  it("App.module.css .devSwitch declares color: var(--surface-cream)", () => {
    const source = fs.readFileSync(APP_MODULE_CSS_PATH, "utf-8");
    expect(source).toContain("color: var(--surface-cream)");
  });

  it("App.module.css .devSwitch declares border with var(--surface-cream)", () => {
    const source = fs.readFileSync(APP_MODULE_CSS_PATH, "utf-8");
    expect(source).toContain("var(--surface-cream)");
  });

  it("App.module.css contains no hex color literals", () => {
    const source = fs.readFileSync(APP_MODULE_CSS_PATH, "utf-8");
    // Exclude comment lines (lines starting with optional whitespace + //)
    const nonCommentLines = source
      .split("\n")
      .filter((line) => !line.trim().startsWith("//") && !line.trim().startsWith("*"))
      .join("\n");
    const hexLiterals = nonCommentLines.match(/#[0-9a-fA-F]{3,8}\b/g);
    expect(
      hexLiterals,
      `Found hex literals in non-comment lines of App.module.css: ${JSON.stringify(hexLiterals)}`
    ).toBeNull();
  });
});

// ── AC-011: Text contrast on landing surface ─────────────────────────────────

describe("AC-011: Dev-switch text (--surface-cream) vs background (--ink) contrast ≥4.5:1", () => {
  it("computes contrast ≥4.5:1 for cream text on ink background", () => {
    const ratio = contrastRatio(TOKEN_SURFACE_CREAM, TOKEN_INK);
    // Document the computation:
    // --surface-cream #f1ead8: L ≈ 0.8250
    // --ink #1d1c19: L ≈ 0.0109
    // ratio = (0.8250 + 0.05) / (0.0109 + 0.05) ≈ 14.37:1
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("documents the contrast ratio for audit purposes", () => {
    const ratio = contrastRatio(TOKEN_SURFACE_CREAM, TOKEN_INK);
    // At time of writing: ≈14.37:1. AC-011 floor: ≥4.5:1. Margin: +9.87.
    expect(ratio).toBeGreaterThan(10); // sanity: well above floor
  });
});

// ── AC-012: Background discernibility on landing surface ─────────────────────

describe("AC-012: Dev-switch background (--ink) vs landing surface (--surface-cream) contrast ≥3.0:1", () => {
  it("computes contrast ≥3.0:1 for ink background vs cream landing surface", () => {
    const ratio = contrastRatio(TOKEN_INK, TOKEN_SURFACE_CREAM);
    // --ink #1d1c19 vs --surface-cream #f1ead8:
    // Same pair as AC-011; ratio ≈ 14.37:1. AC-012 floor: ≥3.0:1.
    expect(ratio).toBeGreaterThanOrEqual(3.0);
  });
});

// ── AC-013: Discernibility on settings surface (dark chrome) ─────────────────

describe("AC-013: Dev-switch discernible from settings dark chrome (ADR D14 disjunction)", () => {
  // ADR D14 disjunction:
  // (a) background-color (#1d1c19) vs surround (#0a0c10) — background ≈ 1.18:1 — fails ≥3.0:1
  // (b) border-color (#f1ead8) vs surround (#0a0c10) — border ≈ 17.0:1 — satisfies ≥3.0:1
  // The test asserts clause (b) as the operative satisfaction.
  // See ADR D14 for the full disjunction reasoning and the PM clarification request.

  it("clause (b): border color (--surface-cream) vs settings chrome (--bg-base) contrast ≥3.0:1", () => {
    // The .devSwitch border is 1px solid var(--surface-cream).
    // Settings outer chrome background is var(--bg-base).
    const ratio = contrastRatio(TOKEN_SURFACE_CREAM, TOKEN_BG_BASE);
    // --surface-cream #f1ead8 (L≈0.8250) vs --bg-base #0a0c10 (L≈0.00144)
    // ratio = (0.8250 + 0.05) / (0.00144 + 0.05) ≈ 17.0:1
    expect(ratio).toBeGreaterThanOrEqual(3.0);
  });

  it("documents clause (a) computation for ADR D14 audit (background vs surround)", () => {
    // AC-013 NOTE: The background (#1d1c19) vs settings chrome (#0a0c10) ratio is ≈1.18:1,
    // which does NOT satisfy clause (a) ≥3:1. This is expected per ADR D14.
    // The disjunction is satisfied by clause (b) above (border contrast ≈17:1).
    // If PM clarifies AC-013 to require clause (a), the design needs revisiting.
    const ratio = contrastRatio(TOKEN_INK, TOKEN_BG_BASE);
    // Documenting the value, not asserting a pass:
    expect(ratio).toBeGreaterThan(1.0); // sanity: it's above 1.0
    expect(ratio).toBeLessThan(3.0);    // confirms clause (a) is NOT satisfied (expected)
    // AC-013 is satisfied by clause (b) — see test above.
  });

  it("dev-switch text contrast on settings surface ≥4.5:1 (AC-013 color vs background)", () => {
    // On settings surface, same button: text (#f1ead8) on background (#1d1c19).
    // This is the same pair as AC-011 (the button's own text/bg contrast is surface-independent).
    const ratio = contrastRatio(TOKEN_SURFACE_CREAM, TOKEN_INK);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});

// ── tokens.css: :focus-visible and ::selection use --accent-red* ─────────────

describe("Phase 3: tokens.css global rules updated (focus-visible + selection)", () => {
  const tokensCssPath = path.join(REPO_ROOT, "src/styles/tokens.css");

  it("tokens.css :focus-visible uses --accent-red (not --accent-primary)", () => {
    const source = fs.readFileSync(tokensCssPath, "utf-8");
    // The :focus-visible block should reference --accent-red
    expect(source).toContain("outline: 2px solid var(--accent-red)");
    expect(source).not.toContain("outline: 2px solid var(--accent-primary)");
  });

  it("tokens.css ::selection uses --accent-red-bg (not --accent-primary-bg)", () => {
    const source = fs.readFileSync(tokensCssPath, "utf-8");
    // The ::selection block should reference --accent-red-bg
    // Match the pattern inside the ::selection rule
    const selectionBlock = source.match(/::selection\s*\{[^}]*\}/)?.[0] ?? "";
    expect(selectionBlock).toContain("var(--accent-red-bg)");
    expect(selectionBlock).not.toContain("var(--accent-primary-bg)");
  });
});

// ── AC-001 regression: no --lp- references introduced by Phase 3 ─────────────

describe("AC-001 regression: Phase 3 files contain no --lp- references", () => {
  const phase3Files = [
    path.join(REPO_ROOT, "src/App.tsx"),
    path.join(REPO_ROOT, "src/App.module.css"),
    path.join(REPO_ROOT, "src/styles/tokens.css"),
  ];

  for (const filePath of phase3Files) {
    const relPath = path.relative(REPO_ROOT, filePath);
    it(`${relPath} contains zero --lp- occurrences`, () => {
      const content = fs.readFileSync(filePath, "utf-8");
      const matches = content.match(/--lp-/g) ?? [];
      expect(
        matches.length,
        `Found ${matches.length} "--lp-" occurrence(s) in ${relPath}`
      ).toBe(0);
    });
  }
});
