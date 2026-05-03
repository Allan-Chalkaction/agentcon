import { useEffect, useRef, useState } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { useClaudeConfigStore } from "../../stores/claudeConfigStore";
import styles from "./ClaudeSettingsPanel.module.css";

export function RawJsonTab() {
  const scope = useClaudeConfigStore((s) => s.activeScope);
  const data = useClaudeConfigStore((s) => s[s.activeScope]);
  const saveSettingsRaw = useClaudeConfigStore((s) => s.saveSettingsRaw);

  const [draft, setDraft] = useState<string>("");
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  useEffect(() => {
    setDraft(data.settingsRaw ?? "");
    setError(null);
  }, [scope, data.settingsRaw]);

  const dirty = draft !== (data.settingsRaw ?? "");
  const fileLabel =
    scope === "local" ? "settings.local.json" : "settings.json";

  async function handleSave() {
    try {
      await saveSettingsRaw(scope, draft);
      setSavedFlash(true);
      setError(null);
      setTimeout(() => setSavedFlash(false), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function handleRevert() {
    setDraft(data.settingsRaw ?? "");
    setError(null);
  }

  const onMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  return (
    <>
      <div className={styles.tabHeader}>
        <div>
          <h2 className={styles.tabTitle}>Raw JSON</h2>
          <div className={styles.tabSubtitle}>
            {scope} scope · {fileLabel}
          </div>
        </div>
        <div className={styles.tabActions}>
          <button
            type="button"
            className={styles.buttonSecondary}
            onClick={handleRevert}
            disabled={!dirty}
          >
            Revert
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
          language="json"
          value={draft}
          onChange={(v) => setDraft(v ?? "")}
          onMount={onMount}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily:
              "ui-monospace, SFMono-Regular, SF Mono, Menlo, Monaco, monospace",
            tabSize: 2,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </>
  );
}
