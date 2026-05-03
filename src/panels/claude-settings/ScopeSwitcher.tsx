import type { Scope } from "../../stores/claudeConfigStore";
import styles from "./ClaudeSettingsPanel.module.css";

const SCOPES: { id: Scope; label: string; hint: string }[] = [
  {
    id: "project",
    label: "Project",
    hint: "<project>/.claude — committed to git",
  },
  {
    id: "user",
    label: "User",
    hint: "~/.claude — applies to every project",
  },
  {
    id: "local",
    label: "Project local",
    hint: ".claude/settings.local.json — gitignored",
  },
];

export function ScopeSwitcher({
  scope,
  onChange,
  projectRoot,
  onPickFolder,
  onClearFolder,
}: {
  scope: Scope;
  onChange: (scope: Scope) => void;
  projectRoot: string | null;
  onPickFolder: () => void;
  onClearFolder: () => void;
}) {
  return (
    <header className={styles.scopeBar}>
      <div className={styles.scopeTabs}>
        {SCOPES.map((s) => {
          const projectScope = s.id !== "user";
          const disabled = projectScope && !projectRoot;
          return (
            <button
              key={s.id}
              type="button"
              className={
                scope === s.id ? styles.scopeTabActive : styles.scopeTab
              }
              disabled={disabled}
              onClick={() => onChange(s.id)}
              title={
                disabled
                  ? "Pick a folder (right side) or select a Plan with a project root to enable this scope"
                  : s.hint
              }
            >
              <span className={styles.scopeTabLabel}>{s.label}</span>
              <span className={styles.scopeTabHint}>{s.hint}</span>
            </button>
          );
        })}
      </div>
      <div className={styles.scopeMeta}>
        {projectRoot ? (
          <>
            <span className={styles.scopeMetaLabel}>Project</span>
            <span
              className={styles.scopeMetaValue}
              title={projectRoot}
              style={{ maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {projectRoot}
            </span>
            <button
              type="button"
              className={styles.buttonSecondary}
              style={{ padding: "2px 8px", fontSize: "var(--text-xs)" }}
              onClick={onPickFolder}
              title="Pick a different folder"
            >
              Change
            </button>
            <button
              type="button"
              className={styles.iconButton}
              style={{ width: 24, height: 24 }}
              onClick={onClearFolder}
              title="Clear folder selection"
            >
              ×
            </button>
          </>
        ) : (
          <>
            <span className={styles.scopeMetaLabel}>No project</span>
            <button
              type="button"
              className={styles.buttonSecondary}
              style={{ padding: "2px 10px", fontSize: "var(--text-xs)" }}
              onClick={onPickFolder}
            >
              Pick a folder…
            </button>
          </>
        )}
      </div>
    </header>
  );
}
