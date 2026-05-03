import { useEffect, useState } from "react";
import { useClaudeConfigStore } from "../../stores/claudeConfigStore";
import {
  SKILL_TEMPLATES,
  type SkillDefinition,
  type SkillFrontmatter,
  type SkillTemplate,
} from "../../services/claude-config-parser";
import styles from "./ClaudeSettingsPanel.module.css";

export function SkillsTab() {
  const scope = useClaudeConfigStore((s) => s.activeScope);
  const data = useClaudeConfigStore((s) => s[s.activeScope]);
  const saveSkill = useClaudeConfigStore((s) => s.saveSkill);
  const deleteSkill = useClaudeConfigStore((s) => s.deleteSkill);

  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftSkill | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setSelected((cur) => {
      if (cur && data.skills.find((s) => s.dirname === cur)) return cur;
      return data.skills[0]?.dirname ?? null;
    });
  }, [scope, data.skills]);

  useEffect(() => {
    if (!selected) {
      setDraft(null);
      return;
    }
    const found = data.skills.find((s) => s.dirname === selected);
    setDraft(found ? skillToDraft(found) : null);
    setError(null);
  }, [selected, data.skills]);

  const dirty = draft && originalChanged(draft, data.skills);

  async function handleSave() {
    if (!draft) return;
    if (!draft.dirname.trim()) {
      setError("Directory name is required");
      return;
    }
    try {
      const fm: SkillFrontmatter = {
        name: draft.name.trim() || undefined,
        description: draft.description.trim() || undefined,
        "allowed-tools": draft.allowedTools.trim() || undefined,
        "disable-model-invocation": draft.disableModelInvocation || undefined,
        model: draft.model.trim() || undefined,
      };
      await saveSkill(scope, draft.dirname.trim(), fm, draft.body);
      setSelected(draft.dirname.trim());
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
        `Delete SKILL.md for '${selected}'? Supporting files in the directory are kept.`,
        { kind: "warning", title: "Delete skill" },
      ))
    )
      return;
    try {
      await deleteSkill(scope, selected);
      setSelected(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function handleNew() {
    const newDraft: DraftSkill = {
      dirname: "new-skill",
      name: "",
      description: "",
      allowedTools: "",
      disableModelInvocation: false,
      model: "",
      body: "Skill instructions go here.\n",
      isNew: true,
    };
    setSelected(null);
    setDraft(newDraft);
  }

  function handleNewFromTemplate(t: SkillTemplate) {
    const allowedTools = t.frontmatter["allowed-tools"];
    const newDraft: DraftSkill = {
      dirname: t.dirname,
      name: t.frontmatter.name ?? "",
      description: t.frontmatter.description ?? "",
      allowedTools: typeof allowedTools === "string" ? allowedTools : "",
      disableModelInvocation: t.frontmatter["disable-model-invocation"] === true,
      model: t.frontmatter.model ?? "",
      body: t.body,
      isNew: true,
    };
    setSelected(null);
    setDraft(newDraft);
  }

  return (
    <>
      <div className={styles.tabHeader}>
        <div>
          <h2 className={styles.tabTitle}>Skills</h2>
          <div className={styles.tabSubtitle}>
            {scope} scope ·{" "}
            {scope === "user" ? "~/.claude/skills/" : "<project>/.claude/skills/"}
          </div>
        </div>
        <div className={styles.tabActions}>
          <SkillTemplateMenu onPick={handleNewFromTemplate} />
          <button
            type="button"
            className={styles.buttonSecondary}
            onClick={handleNew}
          >
            New skill
          </button>
        </div>
      </div>
      {error && <div className={styles.errorBanner}>{error}</div>}
      <div className={styles.tabBody}>
        {data.skills.length === 0 && !draft && (
          <SkillTemplateGallery onPick={handleNewFromTemplate} />
        )}
        <div className={styles.split}>
          <div className={styles.splitList}>
            {data.skills.length === 0 && !draft && (
              <div className={styles.itemDescription}>
                No skills at this scope yet.
              </div>
            )}
            <div className={styles.itemList}>
              {data.skills.map((s) => {
                const name = s.frontmatter.name ?? s.dirname;
                return (
                  <div
                    key={s.dirname}
                    className={
                      selected === s.dirname
                        ? styles.itemRowSelected
                        : styles.itemRow
                    }
                    onClick={() => setSelected(s.dirname)}
                  >
                    <div className={styles.itemTitle}>
                      {name}
                      {s.parseError && (
                        <span
                          className={styles.itemMeta}
                          style={{
                            color: "var(--color-danger)",
                            marginLeft: "auto",
                          }}
                          title={s.parseError}
                        >
                          parse error
                        </span>
                      )}
                    </div>
                    <div className={styles.itemMeta}>{s.dirname}/SKILL.md</div>
                    {s.frontmatter.description && (
                      <div className={styles.itemDescription}>
                        {s.frontmatter.description}
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
                Select a skill on the left or create a new one.
              </div>
            ) : (
              <div className={styles.detail}>
                <div className={styles.detailHead}>
                  <div className={styles.detailTitle}>
                    {selected ?? "New skill"}
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
                <Field
                  label="Directory name"
                  value={draft.dirname}
                  onChange={(v) => setDraft({ ...draft, dirname: v })}
                  hint="Lives at <scope>/skills/<this>/SKILL.md. Lowercase, hyphenated."
                  disabled={!draft.isNew}
                />
                <Field
                  label="Name (frontmatter)"
                  value={draft.name}
                  onChange={(v) => setDraft({ ...draft, name: v })}
                  hint="Optional. Defaults to directory name."
                />
                <Field
                  label="Description"
                  value={draft.description}
                  multiline
                  onChange={(v) => setDraft({ ...draft, description: v })}
                  hint="Claude uses this to decide when to autonomously invoke the skill."
                />
                <Field
                  label="Allowed tools"
                  value={draft.allowedTools}
                  onChange={(v) => setDraft({ ...draft, allowedTools: v })}
                  hint="Permission-rule syntax granted while this skill is active. e.g. Bash(npm *) Read"
                />
                <Field
                  label="Model override"
                  value={draft.model}
                  onChange={(v) => setDraft({ ...draft, model: v })}
                  hint="Optional. inherit | sonnet | haiku | claude-sonnet-4-6"
                />
                <div className={styles.formField}>
                  <label
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <input
                      type="checkbox"
                      checked={draft.disableModelInvocation}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          disableModelInvocation: e.target.checked,
                        })
                      }
                    />
                    <span className={styles.formLabel} style={{ margin: 0 }}>
                      Disable model invocation
                    </span>
                  </label>
                  <div className={styles.formHint}>
                    Only invokable explicitly via /{draft.name || draft.dirname}.
                  </div>
                </div>
                <Field
                  label="Body (instructions)"
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

interface DraftSkill {
  dirname: string;
  name: string;
  description: string;
  allowedTools: string;
  disableModelInvocation: boolean;
  model: string;
  body: string;
  isNew?: boolean;
}

function skillToDraft(s: SkillDefinition): DraftSkill {
  const fm = s.frontmatter;
  const allowedTools = fm["allowed-tools"];
  return {
    dirname: s.dirname,
    name: fm.name ?? "",
    description: fm.description ?? "",
    allowedTools: typeof allowedTools === "string" ? allowedTools : "",
    disableModelInvocation: fm["disable-model-invocation"] === true,
    model: fm.model ?? "",
    body: s.body,
  };
}

function originalChanged(draft: DraftSkill, skills: SkillDefinition[]): boolean {
  if (draft.isNew) return true;
  const s = skills.find((x) => x.dirname === draft.dirname);
  if (!s) return true;
  const cur = skillToDraft(s);
  return (
    cur.name !== draft.name ||
    cur.description !== draft.description ||
    cur.allowedTools !== draft.allowedTools ||
    cur.disableModelInvocation !== draft.disableModelInvocation ||
    cur.model !== draft.model ||
    cur.body !== draft.body
  );
}

function Field({
  label,
  value,
  onChange,
  hint,
  multiline,
  rows,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
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
          disabled={disabled}
        />
      ) : (
        <input
          className={styles.formInput}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      )}
      {hint && <div className={styles.formHint}>{hint}</div>}
    </div>
  );
}

function SkillTemplateGallery({
  onPick,
}: {
  onPick: (t: SkillTemplate) => void;
}) {
  return (
    <div className={styles.ruleListGroup}>
      <div className={styles.ruleListTitle}>
        <span>Start from a template</span>
      </div>
      <div className={styles.formHint} style={{ marginBottom: 12 }}>
        Pre-built skills you can save as-is or tweak first.
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 12,
        }}
      >
        {SKILL_TEMPLATES.map((t) => (
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

function SkillTemplateMenu({
  onPick,
}: {
  onPick: (t: SkillTemplate) => void;
}) {
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
          {SKILL_TEMPLATES.map((t) => (
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
