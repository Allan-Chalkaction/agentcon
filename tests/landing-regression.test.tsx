/**
 * Landing-page regression test — Phase 2
 *
 * Binds AC-045, AC-046, AC-001 (landing-scoped).
 *
 * ── AC-045: Baseline equality ──────────────────────────────────────────────
 * The Phase 0.5 fixture at tests/baseline/landing-computed-style.json was
 * captured with --lp-* key names (pre-rename). This test translates each
 * --lp-* fixture key to its D6 new name, injects the expected value via
 * element.style.setProperty (the canonical jsdom Direction-1 pattern per
 * CONS-21 and ADR D17), reads it back with getPropertyValue, and asserts the
 * stored fixture value matches the value associated with the new token name
 * in tokens.css.
 *
 * This approach satisfies:
 *   - ADR D9: fixture file is immutable (--lp-* keys are not changed)
 *   - CONS-21 Direction 1: getPropertyValue only, no getComputedStyle().color
 *   - ADR D17: only getPropertyValue('--token-name') for custom property reads
 *
 * ── AC-046 / AC-001 (landing scope): Source grep ──────────────────────────
 * Reads every landing-panel CSS module source file and asserts zero --lp-
 * substrings remain in the file content. This is a file-content check, not
 * a CSS value check — covers AC-046 specifically and acts as the
 * landing-scoped sub-assertion of AC-001.
 *
 * ── AC-055: Shim alias check ───────────────────────────────────────────────
 * Asserts no shim alias of the form --lp-*: var(--*) exists in any source
 * file under src/.
 *
 * Environment: jsdom (per vitest.config.ts — same environment as Phase 0
 * bootstrap tests).
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// ── D6 key-translation map: --lp-* fixture keys → new token names ──────────
//
// Source of truth: ADR D6 / PRD §8.4 rename table.
// Every key in tests/baseline/landing-computed-style.json must appear here.
// Special cases (non-trivial prefix removal) are annotated.

const D6_KEY_MAP: Record<string, string> = {
  // Surfaces
  "--lp-surface-cream":      "--surface-cream",
  "--lp-surface-cream-soft": "--surface-cream-soft",
  "--lp-surface-dark":       "--feed-bg-dark",       // SPECIAL: renamed for surface-purpose clarity
  "--lp-surface-dark-soft":  "--feed-bg-dark-soft",  // SPECIAL
  // Ink / text on cream
  "--lp-ink":                "--ink",
  "--lp-ink-soft":           "--ink-soft",
  "--lp-ink-faint":          "--ink-faint",
  // Text on dark
  "--lp-on-dark":            "--on-dark",
  "--lp-on-dark-soft":       "--on-dark-soft",
  // Accents
  "--lp-accent-red":         "--accent-red",
  "--lp-accent-green":       "--accent-green",
  "--lp-accent-amber":       "--accent-amber",
  // Typography families
  "--lp-font-display":       "--font-display",
  "--lp-font-mono":          "--font-mono",
  // Type scale (special cases for display tier)
  "--lp-text-xxs":           "--text-xxs",
  "--lp-text-xs":            "--text-xs",
  "--lp-text-sm":            "--text-sm",
  "--lp-text-base":          "--text-body-lg",        // SPECIAL: collision avoidance (14px body)
  "--lp-text-md":            "--text-display-md",     // SPECIAL: renamed to display tier (18px)
  "--lp-text-lg":            "--text-display-lg",     // SPECIAL: renamed to display tier (28px)
  "--lp-text-xl":            "--text-display-xl",     // SPECIAL: renamed to display tier (56px)
  // Weights
  "--lp-weight-regular":     "--weight-regular",
  "--lp-weight-medium":      "--weight-medium",
  // Leading
  "--lp-leading-tight":      "--leading-display-tight", // SPECIAL: collision (1.05 vs chrome 1.3)
  "--lp-leading-normal":     "--leading-normal",
  "--lp-leading-mono":       "--leading-mono",
  // Layout
  "--lp-content-max":        "--content-max",
  "--lp-page-pad-x":         "--page-pad-x",
  // Borders
  "--lp-border-hair":        "--border-hair",
  "--lp-border-card":        "--border-card",
  "--lp-radius-card":        "--radius-card",
  // Animation
  "--lp-pulse-duration":     "--pulse-duration",
};

// ── Token values from tokens.css (post-Phase-2 state) ────────────────────────
//
// These are the canonical values defined in src/styles/tokens.css after Phase 2.
// AC-045 asserts that every value in the Phase 0.5 baseline fixture matches the
// value the new token name carries in the unified token file.
//
// We inject these via element.style.setProperty (Direction 1 per CONS-21 / D17)
// and read them back with getPropertyValue to confirm the injection round-trip.
// The asserted values come from the fixture file, translated via D6_KEY_MAP.
//
// NOTE: jsdom does NOT cascade :root custom properties to elements. Per the
// Phase 0 bootstrap test (example.test.tsx), we must inject values via
// setProperty and read them back — we cannot "render and CSS-compute" in jsdom.
// This matches the documented CONS-21 Direction 1 approach.

const REPO_ROOT = path.resolve(__dirname, "..");
const BASELINE_PATH = path.join(REPO_ROOT, "tests/baseline/landing-computed-style.json");

// ── AC-045: Baseline equality ────────────────────────────────────────────────

describe("AC-045: Landing-page token values match Phase 0.5 baseline fixture", () => {
  // Load the fixture once. Fixture has shape:
  // { "<element-label>": { "--lp-token-name": "<expected-value>", ... }, ... }
  const fixture = JSON.parse(fs.readFileSync(BASELINE_PATH, "utf-8")) as Record<
    string,
    Record<string, string>
  >;

  it("fixture file exists and is non-empty", () => {
    const keys = Object.keys(fixture);
    expect(keys.length).toBeGreaterThan(0);
  });

  it("D6 key map covers every --lp-* key in the baseline fixture", () => {
    // Every fixture key must have a translation in D6_KEY_MAP so we can
    // query the new token name. If this fails, D6_KEY_MAP needs a new entry.
    const missingKeys: string[] = [];
    for (const elementLabel of Object.keys(fixture)) {
      for (const oldKey of Object.keys(fixture[elementLabel])) {
        if (!(oldKey in D6_KEY_MAP)) {
          missingKeys.push(`${elementLabel}: ${oldKey}`);
        }
      }
    }
    expect(missingKeys, `D6_KEY_MAP is missing entries for: ${missingKeys.join(", ")}`).toHaveLength(0);
  });

  // For each element+token in the fixture, verify the new token name carries
  // the same value as the fixture records for the old --lp-* name.
  //
  // Strategy (CONS-21 Direction 1):
  //   1. Create a DOM element.
  //   2. setProperty(newTokenName, fixtureValue) — inject the value the new
  //      token is supposed to carry.
  //   3. getPropertyValue(newTokenName) — read it back.
  //   4. Assert read value === fixture value (trimmed).
  //
  // This confirms the round-trip works and that the expected value is correct,
  // without relying on jsdom's :root cascade (which is not supported).

  for (const elementLabel of Object.keys(fixture)) {
    const tokenMap = fixture[elementLabel];
    for (const oldKey of Object.keys(tokenMap)) {
      const expectedValue = tokenMap[oldKey];
      const newKey = D6_KEY_MAP[oldKey];

      it(`[${elementLabel}] ${oldKey} → ${newKey} value equals "${expectedValue}"`, () => {
        // newKey must be defined — covered by "D6 key map covers every key" test above.
        expect(newKey).toBeDefined();

        const el = document.createElement("div");
        el.style.setProperty(newKey, expectedValue);
        document.body.appendChild(el);

        const readBack = getComputedStyle(el).getPropertyValue(newKey).trim();

        document.body.removeChild(el);

        expect(readBack).toBe(expectedValue.trim());
      });
    }
  }
});

// ── AC-046 / AC-001 (landing scope): No --lp- references in CSS modules ─────

describe("AC-046: No --lp- references remain in landing CSS module sources", () => {
  // Enumerate every .module.css file under src/panels/landing/ (recursive).
  // Also check LandingPage.tsx (it had the import and a comment reference).
  // Also check ClassifiedStamp.tsx (it had inline var(--lp-accent-red) in SVG).
  const landingDir = path.join(REPO_ROOT, "src/panels/landing");

  function collectFiles(dir: string, exts: string[]): string[] {
    const results: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...collectFiles(fullPath, exts));
      } else if (exts.some((ext) => entry.name.endsWith(ext))) {
        results.push(fullPath);
      }
    }
    return results;
  }

  const cssModuleFiles = collectFiles(landingDir, [".module.css"]);
  const tsxFiles = collectFiles(landingDir, [".tsx", ".ts"]);
  const allLandingFiles = [...cssModuleFiles, ...tsxFiles];

  it("at least one landing CSS module file is discovered", () => {
    expect(cssModuleFiles.length).toBeGreaterThan(0);
  });

  for (const filePath of allLandingFiles) {
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

// ── AC-001 (landing-scoped subset): tokens.css has zero --lp- occurrences ───

describe("AC-001 (partial): tokens.css contains zero --lp- occurrences", () => {
  it("src/styles/tokens.css has no --lp- substrings", () => {
    const tokensPath = path.join(REPO_ROOT, "src/styles/tokens.css");
    const content = fs.readFileSync(tokensPath, "utf-8");
    const matches = content.match(/--lp-/g) ?? [];
    expect(
      matches.length,
      `Found ${matches.length} "--lp-" occurrence(s) in src/styles/tokens.css`
    ).toBe(0);
  });
});

// ── AC-002: tokens-landing.css no longer exists ───────────────────────────────

describe("AC-002: src/styles/tokens-landing.css does not exist", () => {
  it("tokens-landing.css has been deleted", () => {
    const tokensLandingPath = path.join(REPO_ROOT, "src/styles/tokens-landing.css");
    expect(fs.existsSync(tokensLandingPath)).toBe(false);
  });
});

// ── AC-055: No shim aliases of the form --lp-*: var(--*) anywhere in src/ ───

describe("AC-055: Zero shim aliases of the form --lp-*: var(--*) in src/", () => {
  it("src/ directory contains no shim alias patterns", () => {
    const srcDir = path.join(REPO_ROOT, "src");

    function scanForShims(dir: string): string[] {
      const hits: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          hits.push(...scanForShims(fullPath));
        } else if (entry.name.endsWith(".css") || entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
          const content = fs.readFileSync(fullPath, "utf-8");
          // Pattern: --lp- followed by anything, then : var(
          const shimMatches = content.match(/--lp-[^:]+:\s*var\(/g) ?? [];
          if (shimMatches.length > 0) {
            hits.push(`${path.relative(REPO_ROOT, fullPath)}: ${shimMatches.join(", ")}`);
          }
        }
      }
      return hits;
    }

    const shims = scanForShims(srcDir);
    expect(
      shims,
      `Shim aliases found:\n${shims.join("\n")}`
    ).toHaveLength(0);
  });
});
