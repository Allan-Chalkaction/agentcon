import { useEffect, useState } from "react";
import { useClaudeConfigStore } from "../../stores/claudeConfigStore";
import {
  applyEnvPreset,
  ENV_PRESETS,
  ENV_VAR_CATEGORIES,
  isEnvPresetApplied,
  removeEnvPreset,
  type EnvPreset,
} from "../../services/claude-config-parser";
import styles from "./ClaudeSettingsPanel.module.css";

interface Row {
  key: string;
  value: string;
}

export function EnvTab() {
  const scope = useClaudeConfigStore((s) => s.activeScope);
  const data = useClaudeConfigStore((s) => s[s.activeScope]);
  const saveSettings = useClaudeConfigStore((s) => s.saveSettings);

  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setRows(envToRows(data.settings?.env));
    setError(null);
  }, [scope, data.settings]);

  const dirty =
    JSON.stringify(rowsToEnv(rows)) !==
    JSON.stringify(data.settings?.env ?? {});

  function update(i: number, patch: Partial<Row>) {
    const next = rows.slice();
    next[i] = { ...next[i], ...patch };
    setRows(next);
  }

  function remove(i: number) {
    setRows(rows.filter((_, idx) => idx !== i));
  }

  function addBlank() {
    setRows([...rows, { key: "", value: "" }]);
  }

  function addKnown(key: string) {
    if (rows.some((r) => r.key === key)) return;
    setRows([...rows, { key, value: "" }]);
  }

  function togglePreset(p: EnvPreset) {
    const current = rowsToEnv(rows);
    const next = isEnvPresetApplied(p, current)
      ? removeEnvPreset(p, current)
      : applyEnvPreset(p, current);
    setRows(envToRows(next));
  }

  async function handleSave() {
    try {
      const env = rowsToEnv(rows);
      const next = { ...(data.settings ?? {}) };
      if (Object.keys(env).length === 0) {
        delete next.env;
      } else {
        next.env = env;
      }
      await saveSettings(scope, next);
      setSavedFlash(true);
      setError(null);
      setTimeout(() => setSavedFlash(false), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  const currentEnv = rowsToEnv(rows);

  return (
    <>
      <div className={styles.tabHeader}>
        <div>
          <h2 className={styles.tabTitle}>Environment variables</h2>
          <div className={styles.tabSubtitle}>
            {scope} scope · settings.json · env
          </div>
        </div>
        <div className={styles.tabActions}>
          <button
            type="button"
            className={styles.buttonSecondary}
            onClick={addBlank}
          >
            + Custom var
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
      <div className={styles.tabBody}>
        <div className={styles.ruleListGroup}>
          <div className={styles.ruleListTitle}>
            <span>Quick presets</span>
          </div>
          <div className={styles.formHint} style={{ marginBottom: 12 }}>
            One-click sets of related env vars. Click again to remove.
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 12,
            }}
          >
            {ENV_PRESETS.map((p) => {
              const applied = isEnvPresetApplied(p, currentEnv);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePreset(p)}
                  className={applied ? styles.itemRowSelected : styles.itemRow}
                  style={{
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                    font: "inherit",
                    color: "inherit",
                    padding: "12px 14px",
                  }}
                >
                  <div className={styles.itemTitle}>
                    {applied ? "✓ " : ""}
                    {p.label}
                  </div>
                  <div className={styles.itemDescription}>{p.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.ruleListGroup}>
          <div className={styles.ruleListTitle}>
            <span>Active variables</span>
            <span className={styles.ruleListBadge}>{rows.length}</span>
          </div>
          {rows.length === 0 && (
            <div className={styles.itemDescription}>
              No env vars defined at this scope. Use a preset, pick from the
              catalog below, or add a custom one.
            </div>
          )}
          {rows.map((r, i) => (
            <div key={i} className={styles.ruleRow}>
              <input
                className={styles.ruleInput}
                value={r.key}
                placeholder="KEY"
                onChange={(e) => update(i, { key: e.target.value })}
                spellCheck={false}
              />
              <input
                className={styles.ruleInput}
                value={r.value}
                placeholder="value"
                onChange={(e) => update(i, { value: e.target.value })}
                spellCheck={false}
              />
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => remove(i)}
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {ENV_VAR_CATEGORIES.map((cat) => (
          <div key={cat.id} className={styles.ruleListGroup}>
            <div className={styles.ruleListTitle}>
              <span>{cat.label}</span>
            </div>
            <div className={styles.itemList}>
              {cat.vars.map((v) => {
                const present = rows.some((r) => r.key === v.key);
                return (
                  <div key={v.key} className={styles.itemRow}>
                    <div className={styles.itemTitle}>
                      <code>{v.key}</code>
                      {present && (
                        <span className={styles.itemMeta}>· in use</span>
                      )}
                    </div>
                    <div className={styles.itemDescription}>{v.hint}</div>
                    {!present && (
                      <div>
                        <button
                          type="button"
                          className={styles.buttonSecondary}
                          onClick={() => addKnown(v.key)}
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function envToRows(env: Record<string, string> | undefined): Row[] {
  if (!env) return [];
  return Object.entries(env).map(([key, value]) => ({ key, value }));
}

function rowsToEnv(rows: Row[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const r of rows) {
    const k = r.key.trim();
    if (!k) continue;
    out[k] = r.value;
  }
  return out;
}
