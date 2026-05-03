import { useState } from "react";
import { useClaudeConfigStore } from "../../stores/claudeConfigStore";
import styles from "./ClaudeSettingsPanel.module.css";

/**
 * Shown at project scope when the project has no .claude/settings.json yet.
 * Offers a one-click scaffold of starter settings + CLAUDE.md.
 */
export function ScaffoldBanner({ projectRoot }: { projectRoot: string }) {
  const loadScope = useClaudeConfigStore((s) => s.loadScope);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ written: string[]; skipped: string[] } | null>(null);
  const [includeSettings, setIncludeSettings] = useState(true);
  const [includeClaudeMd, setIncludeClaudeMd] = useState(true);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const result = await window.agentcon.claude.scaffoldProject({
        projectRoot,
        includeSettings,
        includeClaudeMd,
      });
      setDone(result);
      await loadScope("project");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className={styles.errorBanner} style={{ background: "rgba(74,222,128,0.08)", color: "var(--color-success)" }}>
        Created: {done.written.join(", ") || "none"}
        {done.skipped.length > 0 && ` · skipped (already exists): ${done.skipped.join(", ")}`}
      </div>
    );
  }

  return (
    <div
      className={styles.errorBanner}
      style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}
    >
      <div style={{ marginBottom: 8, color: "var(--text-primary)", fontWeight: 600 }}>
        No Claude Code config in this project yet
      </div>
      <div style={{ marginBottom: 8 }}>
        Scaffold a starter <code>.claude/settings.json</code> and{" "}
        <code>CLAUDE.md</code> at <code>{projectRoot}</code>?
      </div>
      <label
        style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}
      >
        <input
          type="checkbox"
          checked={includeSettings}
          onChange={(e) => setIncludeSettings(e.target.checked)}
        />
        <code>.claude/settings.json</code> with sensible permission defaults
      </label>
      <label
        style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}
      >
        <input
          type="checkbox"
          checked={includeClaudeMd}
          onChange={(e) => setIncludeClaudeMd(e.target.checked)}
        />
        <code>CLAUDE.md</code> skeleton
      </label>
      <button
        type="button"
        className={styles.button}
        onClick={run}
        disabled={busy || (!includeSettings && !includeClaudeMd)}
      >
        {busy ? "Working…" : "Set up Claude Code"}
      </button>
      {error && (
        <div style={{ marginTop: 8, color: "var(--color-danger)" }}>{error}</div>
      )}
    </div>
  );
}
