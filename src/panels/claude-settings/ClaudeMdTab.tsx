import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { useClaudeConfigStore } from "../../stores/claudeConfigStore";
import {
  CLAUDE_MD_SNIPPETS,
  extractImports,
  resolveImports,
  type ClaudeMdSnippet,
} from "../../services/claude-config-parser";
import styles from "./ClaudeSettingsPanel.module.css";

export function ClaudeMdTab() {
  const scope = useClaudeConfigStore((s) => s.activeScope);
  const data = useClaudeConfigStore((s) => s[s.activeScope]);
  const roots = useClaudeConfigStore((s) => s.roots);
  const saveClaudeMd = useClaudeConfigStore((s) => s.saveClaudeMd);

  const [draft, setDraft] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewText, setPreviewText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setDraft(data.claudeMd ?? "");
    setError(null);
  }, [scope, data.claudeMd]);

  const dirty = draft !== (data.claudeMd ?? "");
  const imports = extractImports(draft);
  const fileLabel =
    scope === "user" ? "~/.claude/CLAUDE.md" : "<project>/CLAUDE.md";

  async function handleSave() {
    try {
      await saveClaudeMd(scope, draft);
      setSavedFlash(true);
      setError(null);
      setTimeout(() => setSavedFlash(false), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function togglePreview() {
    if (showPreview) {
      setShowPreview(false);
      return;
    }
    if (!roots) return;
    const baseRoot =
      scope === "user" ? roots.user : roots.activeProjectRoot ?? roots.user;
    const resolved = await resolveImports(draft, async (importPath) => {
      const abs = importPath.startsWith("/")
        ? importPath
        : `${baseRoot}/${importPath}`;
      try {
        return await window.agentcon.fs.readText(abs);
      } catch {
        return null;
      }
    });
    setPreviewText(resolved);
    setShowPreview(true);
  }

  return (
    <>
      <div className={styles.tabHeader}>
        <div>
          <h2 className={styles.tabTitle}>CLAUDE.md</h2>
          <div className={styles.tabSubtitle}>
            {scope} scope · {fileLabel}
            {imports.length > 0 && (
              <>
                {" "}
                · {imports.length} import{imports.length === 1 ? "" : "s"}
              </>
            )}
          </div>
        </div>
        <div className={styles.tabActions}>
          <SnippetMenu
            onInsert={(snip) =>
              !showPreview &&
              setDraft((d) => (d.endsWith("\n\n") || d === "" ? d + snip.body : d + "\n\n" + snip.body))
            }
            disabled={showPreview}
          />
          <button
            type="button"
            className={styles.buttonSecondary}
            onClick={togglePreview}
          >
            {showPreview ? "Edit" : "Preview imports"}
          </button>
          <button
            type="button"
            className={styles.button}
            onClick={handleSave}
            disabled={!dirty}
          >
            {savedFlash ? "Saved" : "Save"}
          </button>
        </div>
      </div>
      {error && <div className={styles.errorBanner}>{error}</div>}
      <div className={styles.tabBodyMonaco}>
        <Editor
          theme="vs-dark"
          language="markdown"
          value={showPreview ? previewText : draft}
          onChange={(v) => !showPreview && setDraft(v ?? "")}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily:
              "ui-monospace, SFMono-Regular, SF Mono, Menlo, Monaco, monospace",
            tabSize: 2,
            wordWrap: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            readOnly: showPreview,
          }}
        />
      </div>
    </>
  );
}

function SnippetMenu({
  onInsert,
  disabled,
}: {
  onInsert: (snip: ClaudeMdSnippet) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        className={styles.buttonSecondary}
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        title="Append a pre-built section"
      >
        Insert section ▾
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 4,
            background: "var(--bg-elevated)",
            border: "var(--border-width) solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            padding: 4,
            minWidth: 260,
            zIndex: 10,
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          }}
          onMouseLeave={() => setOpen(false)}
        >
          {CLAUDE_MD_SNIPPETS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={styles.railItem}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "8px 10px",
              }}
              title={s.description}
              onClick={() => {
                onInsert(s);
                setOpen(false);
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
