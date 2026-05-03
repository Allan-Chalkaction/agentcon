import { useEffect, useState } from "react";
import { useClaudeConfigStore } from "../../stores/claudeConfigStore";
import styles from "./ClaudeSettingsPanel.module.css";

interface MarketplaceEntry {
  source: string;
  repo?: string;
  url?: string;
  [k: string]: unknown;
}

export function PluginsTab() {
  const scope = useClaudeConfigStore((s) => s.activeScope);
  const data = useClaudeConfigStore((s) => s[s.activeScope]);
  const saveSettings = useClaudeConfigStore((s) => s.saveSettings);

  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [marketplaces, setMarketplaces] = useState<
    Record<string, MarketplaceEntry>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [newPluginName, setNewPluginName] = useState("");

  useEffect(() => {
    setEnabled({ ...((data.settings?.enabledPlugins as Record<string, boolean>) ?? {}) });
    setMarketplaces({
      ...((data.settings?.extraKnownMarketplaces as Record<
        string,
        MarketplaceEntry
      >) ?? {}),
    });
    setError(null);
  }, [scope, data.settings]);

  const dirty =
    JSON.stringify(enabled) !==
      JSON.stringify(data.settings?.enabledPlugins ?? {}) ||
    JSON.stringify(marketplaces) !==
      JSON.stringify(data.settings?.extraKnownMarketplaces ?? {});

  async function handleSave() {
    try {
      const next = { ...(data.settings ?? {}) };
      if (Object.keys(enabled).length === 0) {
        delete next.enabledPlugins;
      } else {
        next.enabledPlugins = enabled;
      }
      if (Object.keys(marketplaces).length === 0) {
        delete next.extraKnownMarketplaces;
      } else {
        next.extraKnownMarketplaces = marketplaces;
      }
      await saveSettings(scope, next);
      setSavedFlash(true);
      setError(null);
      setTimeout(() => setSavedFlash(false), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function togglePlugin(name: string, on: boolean) {
    setEnabled({ ...enabled, [name]: on });
  }
  function removePlugin(name: string) {
    const next = { ...enabled };
    delete next[name];
    setEnabled(next);
  }
  function addPlugin() {
    const name = newPluginName.trim();
    if (!name) return;
    setEnabled({ ...enabled, [name]: true });
    setNewPluginName("");
  }

  function addMarketplace() {
    const base = "marketplace";
    let name = base;
    let i = 2;
    while (marketplaces[name]) name = `${base}-${i++}`;
    setMarketplaces({
      ...marketplaces,
      [name]: { source: "github", repo: "" },
    });
  }
  function updateMarketplace(name: string, patch: Partial<MarketplaceEntry>) {
    setMarketplaces({
      ...marketplaces,
      [name]: { ...marketplaces[name], ...patch },
    });
  }
  function renameMarketplace(oldName: string, newName: string) {
    if (!newName.trim() || newName === oldName) return;
    const next: Record<string, MarketplaceEntry> = {};
    for (const [k, v] of Object.entries(marketplaces)) {
      next[k === oldName ? newName : k] = v;
    }
    setMarketplaces(next);
  }
  function removeMarketplace(name: string) {
    const next = { ...marketplaces };
    delete next[name];
    setMarketplaces(next);
  }

  return (
    <>
      <div className={styles.tabHeader}>
        <div>
          <h2 className={styles.tabTitle}>Plugins &amp; marketplaces</h2>
          <div className={styles.tabSubtitle}>
            {scope} scope · settings.json · enabledPlugins · extraKnownMarketplaces
          </div>
        </div>
        <div className={styles.tabActions}>
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
            <span>Enabled plugins</span>
            <span className={styles.ruleListBadge}>
              {Object.keys(enabled).length}
            </span>
          </div>
          <div className={styles.formHint} style={{ marginBottom: 8 }}>
            Plugins must already be installed via{" "}
            <code>/plugin install</code> in a Claude Code session — this
            settings page only controls which installed plugins are active.
          </div>
          {Object.keys(enabled).length === 0 && (
            <div className={styles.itemDescription}>
              No plugins enabled at this scope.
            </div>
          )}
          {Object.entries(enabled).map(([name, on]) => (
            <div key={name} className={styles.ruleRow}>
              <input
                className={styles.ruleInput}
                value={name}
                readOnly
                spellCheck={false}
              />
              <label
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={(e) => togglePlugin(name, e.target.checked)}
                />
                <span className={styles.formHint}>
                  {on ? "enabled" : "disabled"}
                </span>
              </label>
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => removePlugin(name)}
                title="Remove from settings"
              >
                ×
              </button>
            </div>
          ))}
          <div className={styles.ruleRow}>
            <input
              className={styles.ruleInput}
              value={newPluginName}
              placeholder="plugin-name"
              onChange={(e) => setNewPluginName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPlugin()}
              spellCheck={false}
            />
            <button
              type="button"
              className={styles.buttonSecondary}
              onClick={addPlugin}
              disabled={!newPluginName.trim()}
            >
              Add
            </button>
          </div>
        </div>

        <div className={styles.ruleListGroup}>
          <div className={styles.ruleListTitle}>
            <span>Extra known marketplaces</span>
            <span className={styles.ruleListBadge}>
              {Object.keys(marketplaces).length}
            </span>
          </div>
          <div className={styles.formHint} style={{ marginBottom: 8 }}>
            Additional plugin marketplaces to allow alongside the official
            registry. Useful for org-internal plugin sources.
          </div>
          {Object.keys(marketplaces).length === 0 && (
            <div className={styles.itemDescription}>
              No extra marketplaces configured.
            </div>
          )}
          {Object.entries(marketplaces).map(([name, entry]) => (
            <MarketplaceRow
              key={name}
              name={name}
              entry={entry}
              onRename={(v) => renameMarketplace(name, v)}
              onChange={(p) => updateMarketplace(name, p)}
              onRemove={() => removeMarketplace(name)}
            />
          ))}
          <button
            type="button"
            className={styles.buttonSecondary}
            onClick={addMarketplace}
          >
            + Add marketplace
          </button>
        </div>
      </div>
    </>
  );
}

function MarketplaceRow({
  name,
  entry,
  onRename,
  onChange,
  onRemove,
}: {
  name: string;
  entry: MarketplaceEntry;
  onRename: (v: string) => void;
  onChange: (p: Partial<MarketplaceEntry>) => void;
  onRemove: () => void;
}) {
  const [draftName, setDraftName] = useState(name);
  useEffect(() => setDraftName(name), [name]);

  return (
    <div
      className={styles.itemRow}
      style={{ cursor: "default", marginBottom: 8 }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          className={styles.ruleInput}
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onBlur={() => draftName !== name && onRename(draftName)}
          placeholder="marketplace key"
          spellCheck={false}
        />
        <button
          type="button"
          className={styles.iconButton}
          onClick={onRemove}
        >
          ×
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8, marginTop: 8 }}>
        <select
          value={typeof entry.source === "string" ? entry.source : "github"}
          onChange={(e) => onChange({ source: e.target.value })}
          className={styles.ruleInput}
        >
          <option value="github">github</option>
          <option value="url">url</option>
        </select>
        {entry.source === "url" ? (
          <input
            className={styles.ruleInput}
            value={entry.url ?? ""}
            placeholder="https://..."
            onChange={(e) => onChange({ url: e.target.value })}
            spellCheck={false}
          />
        ) : (
          <input
            className={styles.ruleInput}
            value={entry.repo ?? ""}
            placeholder="owner/repo"
            onChange={(e) => onChange({ repo: e.target.value })}
            spellCheck={false}
          />
        )}
      </div>
    </div>
  );
}
