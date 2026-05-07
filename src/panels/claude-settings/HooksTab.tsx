import { useEffect, useState } from "react";
import { useClaudeConfigStore } from "../../stores/claudeConfigStore";
import {
  HOOK_EVENT_META,
  HOOK_PRESETS,
  MATCHER_TEMPLATES,
  type ClaudeHookEntry,
  type ClaudeHookGroup,
  type ClaudeHookMap,
  type HookPreset,
} from "../../services/claude-config-parser";
import styles from "./ClaudeSettingsPanel.module.css";

const EVENTS = HOOK_EVENT_META.map((e) => ({ id: e.id, hint: e.hint }));

const HOOK_TYPES = [
  { id: "command", label: "Command", hint: "Run a shell command" },
  { id: "http", label: "HTTP", hint: "POST to an HTTP endpoint" },
  { id: "mcp_tool", label: "MCP tool", hint: "Invoke a tool on an MCP server" },
  { id: "prompt", label: "Prompt", hint: "Run an inline prompt" },
  { id: "agent", label: "Agent", hint: "Hand off to a subagent" },
] as const;

type HookType = (typeof HOOK_TYPES)[number]["id"];

export function HooksTab() {
  const scope = useClaudeConfigStore((s) => s.activeScope);
  const data = useClaudeConfigStore((s) => s[s.activeScope]);
  const saveSettings = useClaudeConfigStore((s) => s.saveSettings);

  const [draft, setDraft] = useState<ClaudeHookMap>({});
  const [event, setEvent] = useState<string>("PreToolUse");
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setDraft((data.settings?.hooks ?? {}) as ClaudeHookMap);
    setError(null);
  }, [scope, data.settings]);

  const dirty =
    JSON.stringify(draft) !== JSON.stringify(data.settings?.hooks ?? {});
  const groups = draft[event] ?? [];

  function setGroups(next: ClaudeHookGroup[]) {
    const out: ClaudeHookMap = { ...draft };
    if (next.length === 0) {
      delete out[event];
    } else {
      out[event] = next;
    }
    setDraft(out);
  }

  function addGroup() {
    setGroups([...groups, { matcher: "", hooks: [makeHookEntry("command")] }]);
  }

  function updateGroup(idx: number, patch: Partial<ClaudeHookGroup>) {
    const next = groups.slice();
    next[idx] = { ...next[idx], ...patch };
    setGroups(next);
  }

  function removeGroup(idx: number) {
    setGroups(groups.filter((_, i) => i !== idx));
  }

  function addHookToGroup(gIdx: number, type: HookType) {
    const g = groups[gIdx];
    const hooks = [...(g.hooks ?? []), makeHookEntry(type)];
    updateGroup(gIdx, { hooks });
  }

  function updateHook(
    gIdx: number,
    hIdx: number,
    patch: Partial<ClaudeHookEntry>,
  ) {
    const g = groups[gIdx];
    const hooks = (g.hooks ?? []).slice();
    hooks[hIdx] = { ...hooks[hIdx], ...patch };
    updateGroup(gIdx, { hooks });
  }

  function removeHook(gIdx: number, hIdx: number) {
    const g = groups[gIdx];
    const hooks = (g.hooks ?? []).filter((_, i) => i !== hIdx);
    updateGroup(gIdx, { hooks });
  }

  async function handleSave() {
    try {
      const next = { ...(data.settings ?? {}) };
      const cleaned = pruneHookMap(draft);
      if (Object.keys(cleaned).length === 0) {
        delete next.hooks;
      } else {
        next.hooks = cleaned;
      }
      await saveSettings(scope, next);
      setSavedFlash(true);
      setError(null);
      setTimeout(() => setSavedFlash(false), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <>
      <div className={styles.tabHeader}>
        <div>
          <h2 className={styles.tabTitle}>Hooks</h2>
          <div className={styles.tabSubtitle}>
            {scope} scope · settings.json · hooks
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
        <HookPresetsSection draft={draft} setDraft={setDraft} setEvent={setEvent} />
        <div className={styles.formField}>
          <label className={styles.formLabel}>Lifecycle event</label>
          {/* AC-008: chipGroup container gets --border-panel-strong (ADR D13 / CONS-10) */}
          <div className={styles.chipGroup}>
            {EVENTS.map((e) => {
              const count = (draft[e.id] ?? []).length;
              return (
                <button
                  key={e.id}
                  type="button"
                  title={e.hint}
                  onClick={() => setEvent(e.id)}
                  className={
                    /* AC-017: CSS class swap chip ↔ chipSelected; locked class name = chipSelected (ADR D13 / §8.9) */
                    event === e.id ? styles.chipSelected : styles.chip
                  }
                >
                  {e.id}
                  {count > 0 && (
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: "var(--text-xs)",
                        color: "var(--ink-faint)",
                      }}
                    >
                      ({count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className={styles.formHint}>
            {EVENTS.find((e) => e.id === event)?.hint}
          </div>
        </div>

        <div className={styles.itemList}>
          {groups.length === 0 && (
            /* AC-023–AC-025: solid border, 1.5px, --empty-state-border-color; replaces heavy dashed treatment */
            <div className={styles.hookEmptyState}>
              No hooks configured for <code>{event}</code> at this scope.
            </div>
          )}
          {groups.map((g, gIdx) => (
            <div
              key={gIdx}
              className={styles.itemRow}
              style={{ cursor: "default" }}
            >
              <div
                style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
              >
                <div style={{ flex: 1 }}>
                  <label className={styles.formLabel}>Matcher</label>
                  <MatcherInput
                    value={g.matcher ?? ""}
                    onChange={(v) => updateGroup(gIdx, { matcher: v })}
                  />
                </div>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => removeGroup(gIdx)}
                  title="Remove this hook group"
                  style={{ marginTop: 22 }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                {(g.hooks ?? []).map((h, hIdx) => (
                  <HookEntryEditor
                    key={hIdx}
                    entry={h}
                    onChange={(patch) => updateHook(gIdx, hIdx, patch)}
                    onRemove={() => removeHook(gIdx, hIdx)}
                  />
                ))}
              </div>

              <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                {HOOK_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={styles.buttonSecondary}
                    onClick={() => addHookToGroup(gIdx, t.id)}
                    title={t.hint}
                    style={{ fontSize: "var(--text-xs)" }}
                  >
                    + {t.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 12 }}>
          <button
            type="button"
            className={styles.buttonSecondary}
            onClick={addGroup}
          >
            + Add matcher group
          </button>
        </div>
        <p className={styles.formHint} style={{ marginTop: 16 }}>
          Matchers use Claude Code's tool patterns:{" "}
          <code>Bash|Edit</code> matches multiple tools, <code>*</code> matches
          everything. The <code>if</code> field on each hook is an additional
          filter (e.g. <code>Bash(rm *)</code>) that runs the hook only when it
          matches.
        </p>
      </div>
    </>
  );
}

function HookEntryEditor({
  entry,
  onChange,
  onRemove,
}: {
  entry: ClaudeHookEntry;
  onChange: (patch: Partial<ClaudeHookEntry>) => void;
  onRemove: () => void;
}) {
  const type = (entry.type as HookType | undefined) ?? "command";
  return (
    <div
      style={{
        background: "var(--surface-cream-soft)",
        borderRadius: "var(--radius-md)",
        padding: 12,
        border: "var(--border-panel-strong)",
      }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <select
          value={type}
          onChange={(e) =>
            onChange({ type: e.target.value as HookType, ...resetForType(e.target.value as HookType, entry) })
          }
          className={styles.ruleInput}
          style={{ width: "auto", flex: "0 0 140px" }}
        >
          {HOOK_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <span className={styles.formHint} style={{ flex: 1 }}>
          {HOOK_TYPES.find((t) => t.id === type)?.hint}
        </span>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onRemove}
          title="Remove hook"
        >
          ×
        </button>
      </div>

      {type === "command" && (
        <TextField
          label="Command"
          value={(entry.command as string | undefined) ?? ""}
          onChange={(v) => onChange({ command: v })}
          placeholder="~/.claude/hooks/my-hook.sh"
        />
      )}
      {type === "http" && (
        <>
          <TextField
            label="URL"
            value={(entry.url as string | undefined) ?? ""}
            onChange={(v) => onChange({ url: v })}
            placeholder="http://localhost:8080/hook"
          />
          <JsonField
            label="Headers (JSON)"
            value={entry.headers}
            onChange={(v) => onChange({ headers: v })}
          />
        </>
      )}
      {type === "mcp_tool" && (
        <>
          <TextField
            label="Server"
            value={(entry.server as string | undefined) ?? ""}
            onChange={(v) => onChange({ server: v })}
            placeholder="server-name"
          />
          <TextField
            label="Tool"
            value={(entry.tool as string | undefined) ?? ""}
            onChange={(v) => onChange({ tool: v })}
            placeholder="tool-name"
          />
          <JsonField
            label="Input (JSON)"
            value={entry.input}
            onChange={(v) => onChange({ input: v })}
          />
        </>
      )}
      {type === "prompt" && (
        <>
          <TextField
            label="Prompt"
            value={(entry.prompt as string | undefined) ?? ""}
            onChange={(v) => onChange({ prompt: v })}
            multiline
          />
          <TextField
            label="Model"
            value={(entry.model as string | undefined) ?? ""}
            onChange={(v) => onChange({ model: v })}
            placeholder="fast-model"
          />
        </>
      )}
      {type === "agent" && (
        <TextField
          label="Prompt"
          value={(entry.prompt as string | undefined) ?? ""}
          onChange={(v) => onChange({ prompt: v })}
          multiline
        />
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
        <TextField
          label="if (additional filter)"
          value={(entry.if as string | undefined) ?? ""}
          onChange={(v) => onChange({ if: v })}
          placeholder="Bash(rm *)"
        />
        <TextField
          label="Timeout (sec)"
          value={entry.timeout != null ? String(entry.timeout) : ""}
          onChange={(v) => {
            const n = parseInt(v, 10);
            onChange({ timeout: Number.isFinite(n) ? n : undefined });
          }}
          placeholder="30"
        />
      </div>
    </div>
  );
}

function HookPresetsSection({
  draft,
  setDraft,
  setEvent,
}: {
  draft: ClaudeHookMap;
  setDraft: (next: ClaudeHookMap) => void;
  setEvent: (event: string) => void;
}) {
  function applyPreset(p: HookPreset) {
    const next: ClaudeHookMap = { ...draft };
    const groups = (next[p.event] ?? []).slice();
    groups.push(JSON.parse(JSON.stringify(p.group)) as ClaudeHookGroup);
    next[p.event] = groups;
    setDraft(next);
    setEvent(p.event);
  }

  return (
    <div className={styles.ruleListGroup}>
      <div className={styles.ruleListTitle}>
        <span>Quick presets</span>
      </div>
      <div className={styles.formHint} style={{ marginBottom: 12 }}>
        Click a preset to add it as a new hook group. Edit afterward in the
        section below.
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 12,
        }}
      >
        {HOOK_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => applyPreset(p)}
            className={styles.itemRow}
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
              {p.label}
              <span
                className={styles.itemMeta}
                style={{ marginLeft: "auto" }}
              >
                {p.event}
              </span>
            </div>
            <div className={styles.itemDescription}>{p.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function MatcherInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const matchedTemplate = MATCHER_TEMPLATES.find((t) => t.value === value);
  const [mode, setMode] = useState<"template" | "custom">(
    matchedTemplate ? "template" : "custom",
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
        <button
          type="button"
          className={
            mode === "template" ? styles.railItemActive : styles.railItem
          }
          style={{ padding: "4px 10px", fontSize: "var(--text-xs)" }}
          onClick={() => setMode("template")}
        >
          Common
        </button>
        <button
          type="button"
          className={
            mode === "custom" ? styles.railItemActive : styles.railItem
          }
          style={{ padding: "4px 10px", fontSize: "var(--text-xs)" }}
          onClick={() => setMode("custom")}
        >
          Custom
        </button>
      </div>
      {mode === "template" ? (
        <select
          className={styles.ruleInput}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {MATCHER_TEMPLATES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          className={styles.ruleInput}
          value={value}
          placeholder="Bash|Edit  (pipe-separated tool names; * = all)"
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
        />
      )}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <div className={styles.formField}>
      <label className={styles.formLabel}>{label}</label>
      {multiline ? (
        <textarea
          className={styles.formTextarea}
          value={value}
          rows={4}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
        />
      ) : (
        <input
          className={styles.ruleInput}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
        />
      )}
    </div>
  );
}

function JsonField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const [text, setText] = useState<string>(() =>
    value != null ? JSON.stringify(value, null, 2) : "",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText(value != null ? JSON.stringify(value, null, 2) : "");
  }, [value]);

  function commit(v: string) {
    setText(v);
    if (v.trim() === "") {
      onChange(undefined);
      setError(null);
      return;
    }
    try {
      onChange(JSON.parse(v));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className={styles.formField}>
      <label className={styles.formLabel}>{label}</label>
      <textarea
        className={error ? styles.ruleInputInvalid : styles.formTextarea}
        value={text}
        rows={3}
        onChange={(e) => commit(e.target.value)}
        spellCheck={false}
        placeholder='{"key": "value"}'
      />
      {error && (
        <div className={styles.formHint} style={{ color: "var(--color-danger)" }}>
          {error}
        </div>
      )}
    </div>
  );
}

function makeHookEntry(type: HookType): ClaudeHookEntry {
  switch (type) {
    case "command":
      return { type, command: "" };
    case "http":
      return { type, url: "" };
    case "mcp_tool":
      return { type, server: "", tool: "" };
    case "prompt":
      return { type, prompt: "" };
    case "agent":
      return { type, prompt: "" };
  }
}

function resetForType(
  type: HookType,
  entry: ClaudeHookEntry,
): Partial<ClaudeHookEntry> {
  // Drop fields that don't belong to the new type but keep common ones.
  const keep: Partial<ClaudeHookEntry> = {};
  if (entry.if != null) keep.if = entry.if;
  if (entry.timeout != null) keep.timeout = entry.timeout;
  return { ...makeHookEntry(type), ...keep };
}

function pruneHookMap(map: ClaudeHookMap): ClaudeHookMap {
  const out: ClaudeHookMap = {};
  for (const [event, groups] of Object.entries(map)) {
    const cleaned: ClaudeHookGroup[] = [];
    for (const g of groups) {
      const hooks = (g.hooks ?? []).filter((h) => hasMeaningfulPayload(h));
      if (hooks.length === 0) continue;
      cleaned.push({
        ...(g.matcher ? { matcher: g.matcher } : {}),
        hooks,
      });
    }
    if (cleaned.length > 0) out[event] = cleaned;
  }
  return out;
}

function hasMeaningfulPayload(h: ClaudeHookEntry): boolean {
  switch (h.type) {
    case "command":
      return Boolean((h.command as string | undefined)?.trim());
    case "http":
      return Boolean((h.url as string | undefined)?.trim());
    case "mcp_tool":
      return (
        Boolean((h.server as string | undefined)?.trim()) &&
        Boolean((h.tool as string | undefined)?.trim())
      );
    case "prompt":
    case "agent":
      return Boolean((h.prompt as string | undefined)?.trim());
    default:
      return false;
  }
}
