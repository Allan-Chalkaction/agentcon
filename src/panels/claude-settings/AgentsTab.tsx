import { useEffect, useState } from "react";
import { useClaudeConfigStore } from "../../stores/claudeConfigStore";
import {
  AGENT_TEMPLATES,
  deriveAgentName,
  type AgentDefinition,
  type AgentFrontmatter,
  type AgentTemplate,
} from "../../services/claude-config-parser";
import styles from "./ClaudeSettingsPanel.module.css";

export function AgentsTab() {
  const scope = useClaudeConfigStore((s) => s.activeScope);
  const data = useClaudeConfigStore((s) => s[s.activeScope]);
  const saveAgent = useClaudeConfigStore((s) => s.saveAgent);
  const deleteAgent = useClaudeConfigStore((s) => s.deleteAgent);

  const loadScope = useClaudeConfigStore((s) => s.loadScope);

  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftAgent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedReport, setSeedReport] = useState<string | null>(null);

  async function handleSeed() {
    setSeeding(true);
    try {
      const result = await window.agentcon.claude.seedAgents();
      const parts = [];
      if (result.copied.length > 0)
        parts.push(`copied ${result.copied.length}`);
      if (result.skipped.length > 0)
        parts.push(`skipped ${result.skipped.length}`);
      setSeedReport(parts.join(", ") || "no bundled agents to seed");
      await loadScope("user");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSeeding(false);
      setTimeout(() => setSeedReport(null), 2500);
    }
  }

  useEffect(() => {
    setSelected((cur) => {
      if (cur && data.agents.find((a) => a.filename === cur)) return cur;
      return data.agents[0]?.filename ?? null;
    });
  }, [scope, data.agents]);

  useEffect(() => {
    if (!selected) {
      setDraft(null);
      return;
    }
    const found = data.agents.find((a) => a.filename === selected);
    setDraft(found ? agentToDraft(found) : null);
    setError(null);
  }, [selected, data.agents]);

  const dirty = draft && originalChanged(draft, data.agents);

  async function handleSave() {
    if (!draft) return;
    if (!draft.name.trim()) {
      setError("Name is required");
      return;
    }
    try {
      const filename = draft.filename || `${draft.name.trim()}.md`;
      const fm: AgentFrontmatter = {
        name: draft.name.trim(),
        description: draft.description.trim() || undefined,
        model: draft.model.trim() || undefined,
        tools: draft.tools.trim() || undefined,
        color: draft.color.trim() || undefined,
      };
      await saveAgent(scope, filename, fm, draft.body);
      setSelected(filename);
      setSavedFlash(true);
      setError(null);
      setTimeout(() => setSavedFlash(false), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function handleDelete() {
    if (!selected) return;
    if (
      !(await window.agentcon.dialog.ask(
        `Delete agent ${selected}?`,
        { kind: "warning", title: "Delete agent" },
      ))
    )
      return;
    try {
      await deleteAgent(scope, selected);
      setSelected(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function handleNew() {
    const newDraft: DraftAgent = {
      filename: "",
      name: "new-agent",
      description: "",
      model: "",
      tools: "",
      color: "",
      body: "You are a helpful Claude Code subagent.\n",
    };
    setSelected(null);
    setDraft(newDraft);
  }

  function handleNewFromTemplate(t: AgentTemplate) {
    const newDraft: DraftAgent = {
      filename: "",
      name: t.frontmatter.name ?? deriveAgentName(t.filename),
      description: t.frontmatter.description ?? "",
      model: t.frontmatter.model ?? "",
      tools: Array.isArray(t.frontmatter.tools)
        ? t.frontmatter.tools.join(", ")
        : (t.frontmatter.tools ?? ""),
      color: t.frontmatter.color ?? "",
      body: t.body,
    };
    setSelected(null);
    setDraft(newDraft);
  }

  return (
    <>
      <div className={styles.tabHeader}>
        <div>
          <h2 className={styles.tabTitle}>Agents</h2>
          <div className={styles.tabSubtitle}>
            {scope} scope ·{" "}
            {scope === "user" ? "~/.claude/agents/" : "<project>/.claude/agents/"}
          </div>
        </div>
        <div className={styles.tabActions}>
          {scope === "user" && (
            <button
              type="button"
              className={styles.buttonSecondary}
              onClick={handleSeed}
              disabled={seeding}
              title="Copy bundled Agentcon agents into ~/.claude/agents/"
            >
              {seeding ? "Seeding…" : "Seed bundled"}
            </button>
          )}
          <TemplateMenu onPick={handleNewFromTemplate} />
          <button
            type="button"
            className={styles.buttonSecondary}
            onClick={handleNew}
          >
            New agent
          </button>
          {seedReport && (
            <span className={styles.statusLine}>{seedReport}</span>
          )}
        </div>
      </div>
      {error && <div className={styles.errorBanner}>{error}</div>}
      <div className={styles.tabBody}>
        {data.agents.length === 0 && !draft && (
          <TemplateGallery onPick={handleNewFromTemplate} />
        )}
        <div className={styles.split}>
          <div className={styles.splitList}>
            {data.agents.length === 0 && !draft && (
              <div className={styles.itemDescription}>
                No agents at this scope yet. Click <em>New agent</em> to create one.
              </div>
            )}
            <div className={styles.itemList}>
              {data.agents.map((a) => {
                const name = a.frontmatter.name ?? deriveAgentName(a.filename);
                return (
                  <div
                    key={a.filename}
                    className={
                      selected === a.filename
                        ? styles.itemRowSelected
                        : styles.itemRow
                    }
                    onClick={() => setSelected(a.filename)}
                  >
                    <div className={styles.itemTitle}>
                      {name}
                      {a.parseError && (
                        <span
                          className={styles.itemMeta}
                          style={{
                            color: "var(--color-danger)",
                            marginLeft: "auto",
                          }}
                          title={a.parseError}
                        >
                          parse error
                        </span>
                      )}
                    </div>
                    <div className={styles.itemMeta}>{a.filename}</div>
                    {a.frontmatter.description && (
                      <div className={styles.itemDescription}>
                        {a.frontmatter.description}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className={styles.splitDetail}>
            {!draft ? (
              <div className={styles.emptyHint}>
                Select an agent on the left or create a new one.
              </div>
            ) : (
              <div className={styles.detail}>
                <div className={styles.detailHead}>
                  <div className={styles.detailTitle}>
                    {selected ?? "New agent"}
                  </div>
                  <div className={styles.tabActions}>
                    {selected && (
                      <button
                        type="button"
                        className={styles.buttonDanger}
                        onClick={handleDelete}
                      >
                        Delete
                      </button>
                    )}
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
                <DraftField
                  label="Name"
                  value={draft.name}
                  onChange={(v) => setDraft({ ...draft, name: v })}
                  hint="Used to invoke the agent. Lowercase, hyphenated."
                />
                <DraftField
                  label="Description"
                  value={draft.description}
                  multiline
                  onChange={(v) => setDraft({ ...draft, description: v })}
                  hint="Claude uses this to decide when to delegate to this agent."
                />
                <DraftField
                  label="Model"
                  value={draft.model}
                  onChange={(v) => setDraft({ ...draft, model: v })}
                  hint="Optional. e.g. sonnet, haiku, claude-sonnet-4-6."
                />
                <DraftField
                  label="Tools"
                  value={draft.tools}
                  onChange={(v) => setDraft({ ...draft, tools: v })}
                  hint="Optional. Comma-separated list, or leave blank for all."
                />
                <DraftField
                  label="Color"
                  value={draft.color}
                  onChange={(v) => setDraft({ ...draft, color: v })}
                  hint="Optional UI color tag."
                />
                <DraftField
                  label="System prompt"
                  value={draft.body}
                  multiline
                  rows={16}
                  onChange={(v) => setDraft({ ...draft, body: v })}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

interface DraftAgent {
  filename: string;
  name: string;
  description: string;
  model: string;
  tools: string;
  color: string;
  body: string;
}

function agentToDraft(a: AgentDefinition): DraftAgent {
  const fm = a.frontmatter;
  return {
    filename: a.filename,
    name: fm.name ?? deriveAgentName(a.filename),
    description: fm.description ?? "",
    model: fm.model ?? "",
    tools: Array.isArray(fm.tools) ? fm.tools.join(", ") : (fm.tools ?? ""),
    color: fm.color ?? "",
    body: a.body,
  };
}

function originalChanged(draft: DraftAgent, agents: AgentDefinition[]): boolean {
  if (!draft.filename) return true;
  const a = agents.find((x) => x.filename === draft.filename);
  if (!a) return true;
  const cur = agentToDraft(a);
  return (
    cur.name !== draft.name ||
    cur.description !== draft.description ||
    cur.model !== draft.model ||
    cur.tools !== draft.tools ||
    cur.color !== draft.color ||
    cur.body !== draft.body
  );
}

function DraftField({
  label,
  value,
  onChange,
  hint,
  multiline,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <div className={styles.formField}>
      <label className={styles.formLabel}>{label}</label>
      {multiline ? (
        <textarea
          className={styles.formTextarea}
          value={value}
          rows={rows ?? 4}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={styles.formInput}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {hint && <div className={styles.formHint}>{hint}</div>}
    </div>
  );
}

function TemplateGallery({
  onPick,
}: {
  onPick: (t: AgentTemplate) => void;
}) {
  return (
    <div className={styles.ruleListGroup}>
      <div className={styles.ruleListTitle}>
        <span>Start from a template</span>
      </div>
      <div className={styles.formHint} style={{ marginBottom: 12 }}>
        Pre-built agents you can save as-is or tweak first.
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 12,
        }}
      >
        {AGENT_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onPick(t)}
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
            <div className={styles.itemTitle}>{t.label}</div>
            <div className={styles.itemDescription}>{t.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function TemplateMenu({ onPick }: { onPick: (t: AgentTemplate) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        className={styles.buttonSecondary}
        onClick={() => setOpen((o) => !o)}
      >
        From template ▾
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
            minWidth: 220,
            zIndex: 10,
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          }}
          onMouseLeave={() => setOpen(false)}
        >
          {AGENT_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={styles.railItem}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "8px 10px",
              }}
              onClick={() => {
                onPick(t);
                setOpen(false);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
