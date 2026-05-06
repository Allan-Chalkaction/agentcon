// Surface switcher — temporary, reversible, ≤30 lines.
// ADR: docs/pipeline/2026-05-03/test-run-landing-page/ADR.md §D1
//
// Two surfaces: "settings" (default, cold-start) and "landing" (dev-only entry).
// Switch via ?surface=landing in the URL, or via the dev-only floating button.
// The button is structurally gated on import.meta.env.DEV so Vite dead-code-
// eliminates it in production builds (CTO Round 2 watching concern #6).
// When a real router is adopted, delete this file and replace with App+Router.

import { useState } from "react";
import { ClaudeSettingsPanel } from "./panels/claude-settings/ClaudeSettingsPanel";
import { LandingPage } from "./panels/landing/LandingPage";

type Surface = "settings" | "landing";

function readInitialSurface(): Surface {
  if (typeof window === "undefined") return "settings";
  const params = new URLSearchParams(window.location.search);
  return params.get("surface") === "landing" ? "landing" : "settings";
}

export default function App() {
  const [surface, setSurface] = useState<Surface>(readInitialSurface);

  return (
    <>
      {surface === "settings" ? <ClaudeSettingsPanel /> : <LandingPage />}

      {/* Dev-only surface switcher button — structurally absent in production builds */}
      {import.meta.env.DEV && (
        <button
          type="button"
          onClick={() => setSurface((s) => (s === "settings" ? "landing" : "settings"))}
          style={{
            position: "fixed",
            top: 8,
            right: 8,
            zIndex: 9999,
            padding: "4px 10px",
            fontSize: 11,
            fontFamily: "monospace",
            background: "#1a1c19",
            color: "#d8d2bf",
            border: "1px solid #4a4742",
            borderRadius: 3,
            cursor: "pointer",
            opacity: 0.85,
          }}
        >
          {surface === "settings" ? "→ landing" : "→ settings"}
        </button>
      )}
    </>
  );
}
