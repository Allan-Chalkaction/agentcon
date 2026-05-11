// Surface switcher — temporary, reversible, ≤30 lines.
// ADR: docs/pipeline/2026-05-03/test-run-landing-page/ADR.md §D1
//
// Two surfaces: "settings" (default, cold-start) and "landing" (dev-only entry).
// Switch via ?surface=landing in the URL, or via the dev-only floating button.
// The button is structurally gated on import.meta.env.DEV so Vite dead-code-
// eliminates it in production builds (CTO Round 2 watching concern #6).
// When a real router is adopted, delete this file and replace with App+Router.

import { useEffect, useState } from "react";
import { ClaudeSettingsPanel } from "./panels/claude-settings/ClaudeSettingsPanel";
import { LandingPage } from "./panels/landing/LandingPage";
import { usePreferencesStore } from "./stores/preferencesStore";
import styles from "./App.module.css";

type Surface = "settings" | "landing";

function readInitialSurface(): Surface {
  if (typeof window === "undefined") return "settings";
  const params = new URLSearchParams(window.location.search);
  return params.get("surface") === "landing" ? "landing" : "settings";
}

export default function App() {
  const [surface, setSurface] = useState<Surface>(readInitialSurface);

  // Hydrate user preferences once on mount. Uses getState() so App does NOT
  // subscribe to the store and avoids re-renders on expertMode changes (ADR D3).
  useEffect(() => {
    void usePreferencesStore.getState().hydrate();
  }, []);

  return (
    <>
      {surface === "settings" ? <ClaudeSettingsPanel /> : <LandingPage />}

      {/* Dev-only surface switcher button — structurally absent in production builds */}
      {/* Phase 3: replaced inline hex style with App.module.css .devSwitch class (ADR D14, AC-010–AC-014) */}
      {import.meta.env.DEV && (
        <button
          type="button"
          className={styles.devSwitch}
          onClick={() => setSurface((s) => (s === "settings" ? "landing" : "settings"))}
        >
          {surface === "settings" ? "→ landing" : "→ settings"}
        </button>
      )}
    </>
  );
}
