import { useEffect, useMemo, useState } from "react";
import { useClaudeConfigStore } from "../../stores/claudeConfigStore";
import {
  applyPreset,
  describeRule,
  findTool,
  isPresetFullyApplied,
  isValidRule,
  KNOWN_TOOLS,
  PERMISSION_PRESETS,
  presetCoverage,
  removePreset,
  type ClaudePermissions,
  type PermBucket,
  type PermissionPreset,
} from "../../services/claude-config-parser";
import styles from "./ClaudeSettingsPanel.module.css";

type Mode = "visual" | "raw";

const BUCKET_META: Record<
  PermBucket,
  { label: string; color: string; bg: string }
> = {
  allow: { label: "Allow", color: "var(--color-success)", bg: "rgba(74,222,128,0.1)" },
  /* AC-005: --accent-primary replaced with --accent-red (ADR D6, Phase 4) */
  ask: { label: "Ask", color: "var(--accent-red)", bg: "rgba(184,54,43,0.1)" },
  deny: { label: "Deny", color: "var(--color-danger)", bg: "rgba(248,113,113,0.1)" },
};

export function PermissionsTab() {
  const scope = useClaudeConfigStore((s) => s.activeScope);
  const data = useClaudeConfigStore((s) => s[s.activeScope]);
  const saveSettings = useClaudeConfigStore((s) => s.saveSettings);

  const [draft, setDraft] = useState<ClaudePermissions>({});
  const [mode, setMode] = useState<Mode>("visual");
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setDraft(data.settings?.permissions ?? {});
    setError(null);
  }, [scope, data.settings]);

  const dirty =
    JSON.stringify(draft) !== JSON.stringify(data.settings?.permissions ?? {});

  async function handleSave() {
    try {
      const next = { ...(data.settings ?? {}), permissions: prune(draft) };
      await saveSettings(scope, next);
      setSavedFlash(true);
      setError(null);
      setTimeout(() => setSavedFlash(false), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function togglePreset(preset: PermissionPreset) {
    setDraft((d) =>
      isPresetFullyApplied(preset, d) ? removePreset(preset, d) : applyPreset(preset, d),
    );
  }

  function addRule(bucket: PermBucket, rule: string) {
    const trimmed = rule.trim();
    if (!trimmed) return;
    setDraft((d) => {
      const list = d[bucket] ?? [];
      if (list.includes(trimmed)) return d;
      return { ...d, [bucket]: [...list, trimmed] };
    });
  }

  function removeRule(bucket: PermBucket, rule: string) {
    setDraft((d) => ({
      ...d,
      [bucket]: (d[bucket] ?? []).filter((r) => r !== rule),
    }));
  }

  function moveRule(rule: string, from: PermBucket, to: PermBucket) {
    setDraft((d) => {
      const fromList = (d[from] ?? []).filter((r) => r !== rule);
      const toList = d[to] ?? [];
      return {
        ...d,
        [from]: fromList,
        [to]: toList.includes(rule) ? toList : [...toList, rule],
      };
    });
  }

  return (
    <>
      <div className={styles.tabHeader}>
        <div>
          <h2 className={styles.tabTitle}>Permissions</h2>
          <div className={styles.tabSubtitle}>
            {scope} scope · settings.json · permissions
          </div>
        </div>
        <div className={styles.tabActions}>
          <div style={{ display: "flex", gap: 4, marginRight: 8 }}>
            {(["visual", "raw"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                className={mode === m ? styles.railItemActive : styles.railItem}
                style={{ padding: "4px 10px", fontSize: "var(--text-xs)" }}
                onClick={() => setMode(m)}
              >
                {m === "visual" ? "Visual" : "Raw"}
              </button>
            ))}
          </div>
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
        {mode === "visual" ? (
          <VisualMode
            draft={draft}
            togglePreset={togglePreset}
            addRule={addRule}
            removeRule={removeRule}
            moveRule={moveRule}
          />
        ) : (
          <RawMode draft={draft} setDraft={setDraft} />
        )}
      </div>
    </>
  );
}

function VisualMode({
  draft,
  togglePreset,
  addRule,
  removeRule,
  moveRule,
}: {
  draft: ClaudePermissions;
  togglePreset: (preset: PermissionPreset) => void;
  addRule: (bucket: PermBucket, rule: string) => void;
  removeRule: (bucket: PermBucket, rule: string) => void;
  moveRule: (rule: string, from: PermBucket, to: PermBucket) => void;
}) {
  return (
    <>
      <PresetsSection draft={draft} togglePreset={togglePreset} />
      <RulesSection draft={draft} removeRule={removeRule} moveRule={moveRule} />
      <AddRuleForm onAdd={addRule} />
    </>
  );
}

function PresetsSection({
  draft,
  togglePreset,
}: {
  draft: ClaudePermissions;
  togglePreset: (preset: PermissionPreset) => void;
}) {
  return (
    <div className={styles.ruleListGroup}>
      <div className={styles.ruleListTitle}>
        <span>Quick presets</span>
      </div>
      <div className={styles.formHint} style={{ marginBottom: 12 }}>
        Click to apply a curated set of rules. Click again to remove them.
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 12,
        }}
      >
        {PERMISSION_PRESETS.map((p) => {
          const cov = presetCoverage(p, draft);
          const fully = cov.applied === cov.total;
          const partial = cov.applied > 0 && !fully;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => togglePreset(p)}
              className={fully ? styles.itemRowSelected : styles.itemRow}
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
                {fully ? "✓ " : partial ? "◐ " : ""}
                {p.label}
                <span
                  className={styles.itemMeta}
                  style={{ marginLeft: "auto" }}
                >
                  {cov.applied}/{cov.total}
                </span>
              </div>
              <div className={styles.itemDescription}>{p.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface FlatRule {
  bucket: PermBucket;
  rule: string;
}

function RulesSection({
  draft,
  removeRule,
  moveRule,
}: {
  draft: ClaudePermissions;
  removeRule: (bucket: PermBucket, rule: string) => void;
  moveRule: (rule: string, from: PermBucket, to: PermBucket) => void;
}) {
  const flat: FlatRule[] = useMemo(() => {
    const out: FlatRule[] = [];
    for (const b of ["deny", "ask", "allow"] as PermBucket[]) {
      for (const r of draft[b] ?? []) out.push({ bucket: b, rule: r });
    }
    return out;
  }, [draft]);

  return (
    <div className={styles.ruleListGroup}>
      <div className={styles.ruleListTitle}>
        <span>Rules</span>
        <span className={styles.ruleListBadge}>{flat.length}</span>
      </div>
      {flat.length === 0 ? (
        <div className={styles.itemDescription}>
          No permission rules at this scope. Apply a preset above or add rules
          below.
        </div>
      ) : (
        <div className={styles.itemList}>
          {flat.map((r, idx) => (
            <RuleRow
              key={`${r.bucket}-${r.rule}-${idx}`}
              bucket={r.bucket}
              rule={r.rule}
              onRemove={() => removeRule(r.bucket, r.rule)}
              onMove={(to) => moveRule(r.rule, r.bucket, to)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RuleRow({
  bucket,
  rule,
  onRemove,
  onMove,
}: {
  bucket: PermBucket;
  rule: string;
  onRemove: () => void;
  onMove: (to: PermBucket) => void;
}) {
  const meta = BUCKET_META[bucket];
  const valid = isValidRule(rule);
  const description = describeRule(rule);
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        padding: "8px 12px",
        background: "var(--bg-elevated)",
        border: "var(--border-width) solid var(--border-default)",
        borderRadius: "var(--radius-md)",
      }}
    >
      <select
        value={bucket}
        onChange={(e) => onMove(e.target.value as PermBucket)}
        className={styles.ruleInput}
        style={{
          width: 90,
          flex: "0 0 90px",
          color: meta.color,
          background: meta.bg,
          fontWeight: 600,
        }}
      >
        <option value="allow">Allow</option>
        <option value="ask">Ask</option>
        <option value="deny">Deny</option>
      </select>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--text-primary)",
          }}
        >
          {description}
        </div>
        <code
          style={{
            display: "block",
            fontSize: "var(--text-xs)",
            color: valid ? "var(--text-muted)" : "var(--color-danger)",
            fontFamily: "var(--font-mono)",
            marginTop: 2,
            wordBreak: "break-all",
          }}
        >
          {rule}
          {!valid && " · invalid syntax"}
        </code>
      </div>
      <button
        type="button"
        className={styles.iconButton}
        onClick={onRemove}
        title="Remove rule"
      >
        ×
      </button>
    </div>
  );
}

function AddRuleForm({
  onAdd,
}: {
  onAdd: (bucket: PermBucket, rule: string) => void;
}) {
  const [bucket, setBucket] = useState<PermBucket>("deny");
  const [toolId, setToolId] = useState<string>("Bash");
  const [arg, setArg] = useState<string>("");

  const tool = findTool(toolId);
  const ruleString = arg.trim()
    ? `${toolId}(${arg.trim()})`
    : toolId;

  function commit() {
    if (!ruleString) return;
    onAdd(bucket, ruleString);
    setArg("");
  }

  return (
    <div className={styles.ruleListGroup}>
      <div className={styles.ruleListTitle}>
        <span>Add a rule</span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "120px 1fr 1fr auto",
          gap: 8,
          alignItems: "start",
        }}
      >
        <div>
          <label className={styles.formLabel}>Bucket</label>
          <select
            value={bucket}
            onChange={(e) => setBucket(e.target.value as PermBucket)}
            className={styles.ruleInput}
          >
            <option value="allow">Allow</option>
            <option value="ask">Ask</option>
            <option value="deny">Deny</option>
          </select>
        </div>
        <div>
          <label className={styles.formLabel}>Tool</label>
          <select
            value={toolId}
            onChange={(e) => setToolId(e.target.value)}
            className={styles.ruleInput}
          >
            {KNOWN_TOOLS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={styles.formLabel}>Pattern (optional)</label>
          <input
            className={styles.ruleInput}
            value={arg}
            onChange={(e) => setArg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commit()}
            placeholder={tool?.argPlaceholder ?? ""}
            spellCheck={false}
          />
        </div>
        <div style={{ paddingTop: 22 }}>
          <button
            type="button"
            className={styles.button}
            onClick={commit}
          >
            Add
          </button>
        </div>
      </div>
      {tool && (
        <div className={styles.formHint} style={{ marginTop: 8 }}>
          {tool.argHint}
          {tool.examples.length > 0 && (
            <div style={{ marginTop: 4 }}>
              Examples:{" "}
              {tool.examples.map((ex, i) => (
                <span key={ex}>
                  {i > 0 && ", "}
                  <code
                    /* AC-005: --accent-primary replaced with --accent-red (ADR D6, Phase 4) */
                    style={{ cursor: "pointer", color: "var(--accent-red)" }}
                    onClick={() => setArg(ex)}
                    title="Click to use this example"
                  >
                    {ex}
                  </code>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      <div className={styles.formHint} style={{ marginTop: 8 }}>
        Will add: <code>{ruleString}</code> to {BUCKET_META[bucket].label}.
      </div>
    </div>
  );
}

function RawMode({
  draft,
  setDraft,
}: {
  draft: ClaudePermissions;
  setDraft: (next: ClaudePermissions) => void;
}) {
  return (
    <>
      {(["allow", "ask", "deny"] as PermBucket[]).map((b) => (
        <RawBucket
          key={b}
          bucket={b}
          rules={draft[b] ?? []}
          onChange={(rules) => setDraft({ ...draft, [b]: rules })}
        />
      ))}
      <p className={styles.formHint}>
        Rule syntax: <code>Tool</code> or <code>Tool(arg-glob)</code>. Examples:{" "}
        <code>Bash(git *)</code>, <code>Read(./.env)</code>,{" "}
        <code>WebFetch(domain:example.com)</code>.
      </p>
    </>
  );
}

function RawBucket({
  bucket,
  rules,
  onChange,
}: {
  bucket: PermBucket;
  rules: string[];
  onChange: (rules: string[]) => void;
}) {
  const meta = BUCKET_META[bucket];
  function add() {
    onChange([...rules, ""]);
  }
  function update(i: number, v: string) {
    const next = rules.slice();
    next[i] = v;
    onChange(next);
  }
  function remove(i: number) {
    onChange(rules.filter((_, idx) => idx !== i));
  }
  return (
    <div className={styles.ruleListGroup}>
      <div className={styles.ruleListTitle}>
        <span style={{ color: meta.color }}>{meta.label}</span>
        <span className={styles.ruleListBadge}>{rules.length}</span>
      </div>
      {rules.map((r, i) => {
        const valid = r.trim() === "" || isValidRule(r);
        return (
          <div key={i} className={styles.ruleRow}>
            <input
              className={valid ? styles.ruleInput : styles.ruleInputInvalid}
              value={r}
              placeholder="Tool(arg-glob)"
              onChange={(e) => update(i, e.target.value)}
              spellCheck={false}
            />
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => remove(i)}
            >
              ×
            </button>
          </div>
        );
      })}
      <button type="button" className={styles.buttonSecondary} onClick={add}>
        + Add rule
      </button>
    </div>
  );
}

function prune(p: ClaudePermissions): ClaudePermissions {
  const out: ClaudePermissions = {};
  if (p.allow && p.allow.length > 0) out.allow = p.allow.filter((r) => r.trim());
  if (p.ask && p.ask.length > 0) out.ask = p.ask.filter((r) => r.trim());
  if (p.deny && p.deny.length > 0) out.deny = p.deny.filter((r) => r.trim());
  if (p.defaultMode) out.defaultMode = p.defaultMode;
  if (p.additionalDirectories && p.additionalDirectories.length > 0)
    out.additionalDirectories = p.additionalDirectories;
  return out;
}

