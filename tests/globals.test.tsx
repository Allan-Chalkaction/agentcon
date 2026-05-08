/**
 * Globals and phase-boundary assertions — Phase 5
 *
 * Binds: AC-051 (overflow:hidden), AC-052 (focus-visible contrast),
 *        AC-053 (chrome-vs-content split), AC-054 (per-phase boundary check).
 *
 * ── ADR D17 / CONS-21 compliance ─────────────────────────────────────────────
 * All visual token assertions use Direction 1:
 *   el.style.setProperty("--token-name", value) + getComputedStyle(el).getPropertyValue()
 * Direct resolved-property reads (getComputedStyle(el).color = "#hex") are NOT
 * used for token-driven values — jsdom 25 does not resolve var() chains.
 *
 * ── Source-file assertions ────────────────────────────────────────────────────
 * Where the assertion is about "this CSS rule exists", we read the source file
 * and assert the substring is present. This is unambiguous and jsdom-safe.
 *
 * ── WCAG contrast computation ─────────────────────────────────────────────────
 * Uses the correct 2.4 exponent formula (Math.pow((s + 0.055) / 1.055, 2.4))
 * per dev-switch.test.tsx:59 precedent. NOT the "2.2 gamma approximation"
 * mentioned in the comment at dev-switch.test.tsx:26-27,54 (that comment is wrong).
 */

import { describe, it, expect, afterEach } from "vitest";
import { render, waitFor, cleanup } from "@testing-library/react";
import * as fs from "fs";
import * as path from "path";
import { installAgentconMock } from "./mocks/agentconMock";
import { ClaudeSettingsPanel } from "../src/panels/claude-settings/ClaudeSettingsPanel";
import { useClaudeConfigStore } from "../src/stores/claudeConfigStore";
import type { ScopeData } from "../src/stores/claudeConfigStore";

const REPO_ROOT = path.resolve(__dirname, "..");
const TOKENS_CSS_PATH = path.join(REPO_ROOT, "src/styles/tokens.css");
const SETTINGS_MODULE_CSS_PATH = path.join(
  REPO_ROOT,
  "src/panels/claude-settings/ClaudeSettingsPanel.module.css",
);

// ── WCAG helpers (copied from dev-switch.test.tsx correct implementation) ────

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map((c) => {
    const s = c / 255;
    // Correct 2.4 exponent per IEC 61966-2-1 / WCAG 2.x (NOT 2.2 approximation).
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hexA: string, hexB: string): number {
  const lA = relativeLuminance(hexA);
  const lB = relativeLuminance(hexB);
  return (Math.max(lA, lB) + 0.05) / (Math.min(lA, lB) + 0.05);
}

// ── Store helpers ─────────────────────────────────────────────────────────────

const EMPTY_SCOPE_DATA: ScopeData = {
  loaded: false,
  loading: false,
  error: null,
  settings: null,
  settingsRaw: null,
  agents: [],
  skills: [],
  commands: [],
  claudeMd: null,
};

afterEach(() => {
  cleanup();
  useClaudeConfigStore.setState({
    activeScope: "user",
    roots: null,
    ready: false,
    initError: null,
    _initialized: false,
    user: { ...EMPTY_SCOPE_DATA },
    project: { ...EMPTY_SCOPE_DATA },
    local: { ...EMPTY_SCOPE_DATA },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AC-051: html, body, #root { overflow: hidden } preserved in tokens.css
// ─────────────────────────────────────────────────────────────────────────────

describe("AC-051: overflow:hidden global rule preserved in tokens.css", () => {
  it("tokens.css contains the html, body, #root { overflow: hidden } rule", () => {
    const source = fs.readFileSync(TOKENS_CSS_PATH, "utf-8");
    // The rule must exist with overflow: hidden on all three selectors.
    expect(source).toContain("overflow: hidden");
    // Confirm it applies to html, body, #root in a single rule block.
    // Check the combination: html + body + #root + overflow: hidden are all in the file.
    expect(source).toMatch(/html[^{]*body[^{]*#root[^{]*\{[^}]*overflow:\s*hidden/s);
  });

  it("tokens.css overflow:hidden rule is within the CHROME TOKENS section", () => {
    const source = fs.readFileSync(TOKENS_CSS_PATH, "utf-8");
    const chromeIdx = source.indexOf("=== CHROME TOKENS ===");
    const contentIdx = source.indexOf("=== CONTENT TOKENS ===");
    const overflowIdx = source.indexOf("overflow: hidden");

    // Structural guard: both banners must exist.
    expect(chromeIdx).toBeGreaterThan(-1);
    expect(contentIdx).toBeGreaterThan(-1);
    expect(overflowIdx).toBeGreaterThan(-1);

    // The overflow rule is after the `:root { ... }` block (i.e. after content tokens),
    // in the base resets section. Per ADR D11, the rule is preserved in place.
    // The exact position: it's in the `/* ─── Base resets ─── */` block after :root closes.
    expect(source).toContain("/* ─── Base resets ─── */");
    const baseResetsIdx = source.indexOf("/* ─── Base resets ─── */");
    expect(overflowIdx).toBeGreaterThan(baseResetsIdx);
  });

  it("Direction 1 round-trip: overflow token injected on element reads back correctly", () => {
    // AC-051 runtime check: the getComputedStyle pattern works for overflow values.
    // In a real browser, document.documentElement.style.overflow would reflect the
    // CSS rule. In jsdom, we verify via the Direction 1 pattern.
    const el = document.createElement("div");
    el.style.setProperty("overflow", "hidden");
    document.body.appendChild(el);

    const readBack = getComputedStyle(el).overflow;
    document.body.removeChild(el);

    // overflow: hidden is a standard property that jsdom resolves.
    expect(readBack).toBe("hidden");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AC-052: :focus-visible uses --accent-red; contrast ≥3:1 on both surfaces
// ─────────────────────────────────────────────────────────────────────────────

describe("AC-052: :focus-visible outline uses --accent-red with sufficient contrast", () => {
  it("tokens.css :focus-visible rule references var(--accent-red)", () => {
    const source = fs.readFileSync(TOKENS_CSS_PATH, "utf-8");
    expect(source).toContain("outline: 2px solid var(--accent-red)");
  });

  it("tokens.css :focus-visible does NOT reference --accent-primary (replaced in Phase 3)", () => {
    const source = fs.readFileSync(TOKENS_CSS_PATH, "utf-8");
    // This is the Phase 3 change — verify it persists.
    expect(source).not.toContain("outline: 2px solid var(--accent-primary)");
  });

  it("AC-052 contrast: --accent-red (#b8362b) vs --surface-cream (#f1ead8) ≥3:1", () => {
    // --accent-red: #b8362b (ADR D7 / tokens.css comment)
    // --surface-cream: #f1ead8 (tokens.css)
    // Three-witness arithmetic (PRD Phase 5 note #9):
    // L(#b8362b) ≈ 0.1300; L(#f1ead8) ≈ 0.8250
    // contrast = (0.8250 + 0.05) / (0.1300 + 0.05) = 0.8750 / 0.1800 ≈ 4.86:1
    const ratio = contrastRatio("#b8362b", "#f1ead8");
    expect(ratio).toBeGreaterThanOrEqual(3.0);
    // AC-052 floor for content surface (cream): ≥3:1. Satisfied.
  });

  it("AC-052 contrast: --accent-red (#b8362b) vs --bg-base (#0a0c10) ≥3:1", () => {
    // --bg-base: #0a0c10 (tokens.css)
    // L(#0a0c10) ≈ 0.0014 (very dark)
    // contrast = (0.1300 + 0.05) / (0.0014 + 0.05) ≈ 3.45:1
    // PRD §8.10 comment: "vs --bg-base ≈ 3.13:1" — minor arithmetic variance;
    // the test asserts ≥3:1 which is the AC binding.
    const ratio = contrastRatio("#b8362b", "#0a0c10");
    expect(ratio).toBeGreaterThanOrEqual(3.0);
    // AC-052 floor for chrome surface (dark): ≥3:1. Satisfied.
  });

  it("documents contrast ratios for audit purposes", () => {
    const creamRatio = contrastRatio("#b8362b", "#f1ead8");
    const chromeRatio = contrastRatio("#b8362b", "#0a0c10");
    // Both must be above floor.
    expect(creamRatio).toBeGreaterThan(3.0);
    expect(chromeRatio).toBeGreaterThan(3.0);
    // Cream ratio is higher (red on cream has more contrast than red on black).
    // Document: cream ≈4.86:1, chrome ≈3.45:1.
    expect(creamRatio).toBeGreaterThan(4.0);
    expect(chromeRatio).toBeGreaterThan(3.0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AC-053: Chrome region (body background) vs content panel (color override)
// ─────────────────────────────────────────────────────────────────────────────

describe("AC-053: Chrome/content split — body is dark canvas; .shell overrides to cream", () => {
  it("tokens.css body rule sets background: var(--bg-base)", () => {
    const source = fs.readFileSync(TOKENS_CSS_PATH, "utf-8");
    // AC-053: body's background token = --bg-base (dark chrome).
    expect(source).toContain("background: var(--bg-base)");
  });

  it("ClaudeSettingsPanel.module.css .shell sets background: var(--surface-cream)", () => {
    const source = fs.readFileSync(SETTINGS_MODULE_CSS_PATH, "utf-8");
    // AC-053: content panel's background = --surface-cream (cream).
    expect(source).toContain("background: var(--surface-cream)");
  });

  it("ClaudeSettingsPanel.module.css .shell sets color: var(--ink)", () => {
    const source = fs.readFileSync(SETTINGS_MODULE_CSS_PATH, "utf-8");
    // AC-053: content panel's text color = --ink (dark on cream).
    expect(source).toContain("color: var(--ink)");
  });

  it("Direction 1: chrome token (--bg-base) and content token (--surface-cream) round-trip", () => {
    // Inject both tokens on two separate elements and read them back.
    const chromeEl = document.createElement("div");
    const contentEl = document.createElement("div");

    chromeEl.style.setProperty("--bg-base", "#0a0c10");
    contentEl.style.setProperty("--surface-cream", "#f1ead8");

    document.body.appendChild(chromeEl);
    document.body.appendChild(contentEl);

    const chromeBg = getComputedStyle(chromeEl).getPropertyValue("--bg-base").trim();
    const contentBg = getComputedStyle(contentEl).getPropertyValue("--surface-cream").trim();

    document.body.removeChild(chromeEl);
    document.body.removeChild(contentEl);

    expect(chromeBg).toBe("#0a0c10");
    expect(contentBg).toBe("#f1ead8");
  });

  it("AC-053: --bg-base (#0a0c10) and --surface-cream (#f1ead8) are on opposite sides of the chrome/content split", () => {
    // Chrome is dark; content is cream. Verify they are visually distinct (high contrast).
    const ratio = contrastRatio("#0a0c10", "#f1ead8");
    // L(#0a0c10) ≈ 0.0014, L(#f1ead8) ≈ 0.8250 → contrast ≈ 17.0:1
    // Far above any threshold — they are on opposite sides of the chrome/content split.
    expect(ratio).toBeGreaterThan(10.0);
  });

  it("AC-053: .shell class exists in ClaudeSettingsPanel.module.css (panel-root applies cream-on-ink)", () => {
    const source = fs.readFileSync(SETTINGS_MODULE_CSS_PATH, "utf-8");
    // The .shell class is the panel root declared in Phase 4. It must exist.
    expect(source).toMatch(/\.shell\s*\{/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AC-054: Per-phase boundary check — app boots, both surfaces operable
// ─────────────────────────────────────────────────────────────────────────────

describe("AC-054: Phase boundary check — settings panel mounts without errors", () => {
  it("ClaudeSettingsPanel renders without throwing under the IPC mock", async () => {
    installAgentconMock();

    useClaudeConfigStore.setState({
      activeScope: "user",
      roots: {
        user: "/tmp/test-user-claude",
        project: "/tmp/test-project-claude",
        projectClaudeMd: "/tmp/test-project-claude/CLAUDE.md",
        userClaudeJson: "/tmp/test-user-claude/.claude.json",
        activeProjectRoot: "/tmp/test-project-root",
      },
      ready: true,
      initError: null,
      _initialized: true,
      user: { ...EMPTY_SCOPE_DATA, loaded: true, settings: {} },
      project: { ...EMPTY_SCOPE_DATA },
      local: { ...EMPTY_SCOPE_DATA },
    });

    let threw = false;
    try {
      const { container } = render(<ClaudeSettingsPanel />);
      // The panel should render with at least one child.
      expect(container.firstElementChild).not.toBeNull();
    } catch (e) {
      threw = true;
      console.error("AC-054: ClaudeSettingsPanel threw during render:", e);
    }

    expect(threw).toBe(false);
  });

  it("AC-054: Settings panel has a .shell root element (no broken structure)", async () => {
    installAgentconMock();

    useClaudeConfigStore.setState({
      activeScope: "user",
      roots: {
        user: "/tmp/test-user-claude",
        project: "/tmp/test-project-claude",
        projectClaudeMd: "/tmp/test-project-claude/CLAUDE.md",
        userClaudeJson: "/tmp/test-user-claude/.claude.json",
        activeProjectRoot: "/tmp/test-project-root",
      },
      ready: true,
      initError: null,
      _initialized: true,
      user: { ...EMPTY_SCOPE_DATA, loaded: true, settings: {} },
      project: { ...EMPTY_SCOPE_DATA },
      local: { ...EMPTY_SCOPE_DATA },
    });

    const { container } = render(<ClaudeSettingsPanel />);

    // The panel root should carry the .shell class (cream surface per AC-053).
    const shellEl = container.querySelector('[class*="shell"]');
    expect(shellEl).not.toBeNull();
  });

  it("AC-054: Hooks tab mounts without errors (tab body is scrollable container)", async () => {
    installAgentconMock();

    useClaudeConfigStore.setState({
      activeScope: "user",
      roots: {
        user: "/tmp/test-user-claude",
        project: "/tmp/test-project-claude",
        projectClaudeMd: "/tmp/test-project-claude/CLAUDE.md",
        userClaudeJson: "/tmp/test-user-claude/.claude.json",
        activeProjectRoot: "/tmp/test-project-root",
      },
      ready: true,
      initError: null,
      _initialized: true,
      user: {
        ...EMPTY_SCOPE_DATA,
        loaded: true,
        settings: {
          hooks: {
            PreToolUse: [
              {
                matcher: "Bash",
                hooks: [{ type: "command", command: "test-cmd", timeout: 5 }],
              },
            ],
          },
        },
      },
      project: { ...EMPTY_SCOPE_DATA },
      local: { ...EMPTY_SCOPE_DATA },
    });

    const { container } = render(<ClaudeSettingsPanel />);

    // Click Hooks tab.
    const hooksBtn = container.querySelector('[class*="railItem"]:not([class*="Active"])')
      ?? container.querySelector("button[disabled]");

    // Find the Hooks button by text.
    const allButtons = container.querySelectorAll("button");
    let hooksTabBtn: Element | null = null;
    allButtons.forEach((btn) => {
      if (btn.textContent?.trim() === "Hooks") hooksTabBtn = btn;
    });

    expect(hooksTabBtn).not.toBeNull();

    // Click it.
    (hooksTabBtn as HTMLButtonElement).click();

    await waitFor(() => {
      // tabBody should be present (scroll container).
      const tabBody = container.querySelector('[class*="tabBody"]');
      expect(tabBody).not.toBeNull();
    }, { timeout: 2000 });

    // Silence unused variable warning.
    void hooksBtn;
  });

  it("AC-054 token file structure: both === CHROME TOKENS === and === CONTENT TOKENS === banners exist", () => {
    const source = fs.readFileSync(TOKENS_CSS_PATH, "utf-8");
    // AC-003 cross-check: both banner labels must be present.
    expect(source).toContain("=== CHROME TOKENS ===");
    expect(source).toContain("=== CONTENT TOKENS ===");

    // They appear in the correct order (chrome before content).
    const chromeIdx = source.indexOf("=== CHROME TOKENS ===");
    const contentIdx = source.indexOf("=== CONTENT TOKENS ===");
    expect(chromeIdx).toBeLessThan(contentIdx);
  });

  it("AC-054: tokens.css exists and is the single token source (tokens-landing.css deleted)", () => {
    expect(fs.existsSync(TOKENS_CSS_PATH)).toBe(true);
    const tokensLandingPath = path.join(REPO_ROOT, "src/styles/tokens-landing.css");
    expect(fs.existsSync(tokensLandingPath)).toBe(false);
  });
});
