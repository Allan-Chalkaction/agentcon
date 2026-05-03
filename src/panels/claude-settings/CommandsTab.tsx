import { useEffect, useState } from "react";
import { useClaudeConfigStore } from "../../stores/claudeConfigStore";
import type {
  CommandDefinition,
  SkillFrontmatter,
} from "../../services/claude-config-parser";
import styles from "./ClaudeSettingsPanel.module.css";

/**
 * Slash commands are the legacy form. Claude Code recommends migrating to
 * skills (which support autonomous invocation in addition to /name). This
 * tab exposes the existing commands and offers a one-click migration.
 */
export function CommandsTab() {
  const scope = useClaudeConfigStore((s) => s.activeScope);
  const data = useClaudeConfigStore((s) => s[s.activeScope]);
  const saveCommand = useClaudeConfigStore((s) => s.saveCommand);
  const deleteCommand = useClaudeConfigStore((s) => s.deleteCommand);
  const migrate = useClaudeConfigStore((s) => s.migrateCommandToSkill);

  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftCommand | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setSelected((cur) => {
      if (cur && data.commands.find((c) => c.filename === cur)) return cur;
      return data.commands[0]?.filename ?? null;
    });
  }, [scope, data.commands]);

  useEffect(() => {
    if (!selected) {
      setDraft(null);
      return;
    }
    const found = data.commands.find((c) => c.filename === selected);
    setDraft(found ? cmdToDraft(found) : null);
    setError(null);
  }, [selected, data.commands]);

  const dirty = draft && originalChanged(draft, data.commands);

  async function handleSave() {
    if (!draft) return;
    if (!draft.filename.trim()) {
      setError("Filename is required");
      return;
    }
    try {
      const fm: SkillFrontmatter = {
        name: draft.name.trim() || undefined,
        description: draft.description.trim() || undefined,
      };
      const fname = draft.filename.endsWith(".md")
        ? draft.filename
        : `${draft.filename}.md`;
      await saveCommand(scope, fname, fm, draft.body);
      setSelected(fname);
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
      !(await window.agentcon.dialog.ask(`Delete command ${selected}?`, {
        kind: "warning",
        title: "Delete command",
      }))
    )
      return;
    try {
      await deleteCommand(scope, selected);
      setSelected(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function handleMigrate() {
    if (!selected) return;
    if (
      !(await window.agentcon.dialog.ask(
        `Migrate ${selected} to a skill? The command file will be removed and a new skill directory will be created at the same scope.`,
        { kind: "info", title: "Migrate to skill" },
      ))
    )
      return;
    try {
      await migrate(scope, selected);
      setSelected(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function handleNew() {
    const newDraft: DraftCommand = {
      filename: "new-command.md",
      name: "",
      description: "",
      body: "Slash command body.\n",
      isNew: true,
    };
    setSelected(null);
    setDraft(newDraft);
  }

  return (
    <>
      <div className={styles.tabHeader}>
        <div>
          <h2 className={styles.tabTitle}>Slash commands (legacy)</h2>
          <div className={styles.tabSubtitle}>
            {scope} scope ·{" "}
            {scope === "user"
              ? "~/.claude/commands/"
              : "<project>/.claude/commands/"}{" "}
            · prefer Skills for new work
          </div>
        </div>
        <div className={styles.tabActions}>
          <button
            type="button"
            className={styles.buttonSecondary}
            onClick={handleNew}
          >
            New command
          </button>
        </div>
      </div>
      {error && <div className={styles.errorBanner}>{error}</div>}
      <div className={styles.tabBody}>
        <div className={styles.split}>
          <div className={styles.splitList}>
            {data.commands.length === 0 && !draft && (
              <div className={styles.itemDescription}>
                No slash commands at this scope. Skills are the recommended
                replacement — see the Skills tab.
              </div>
            )}
            <div className={styles.itemList}>
              {data.commands.map((c) => {
                const name = c.frontmatter.name ?? c.filename.replace(/\.md$/i, "");
                return (
                  <div
                    key={c.filename}
                    className={
                      selected === c.filename
                        ? styles.itemRowSelected
                        : styles.itemRow
                    }
                    onClick={() => setSelected(c.filename)}
                  >
                    <div className={styles.itemTitle}>/{name}</div>
                    <div className={styles.itemMeta}>{c.filename}</div>
                    {c.frontmatter.description && (
                      <div className={styles.itemDescription}>
                        {c.frontmatter.description}
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
                Select a command on the left or create a new one.
              </div>
            ) : (
              <div className={styles.detail}>
                <div className={styles.detailHead}>
                  <div className={styles.detailTitle}>
                    {selected ?? "New command"}
                  </div>
                  <div className={styles.tabActions}>
                    {selected && (
                      <>
                        <button
                          type="button"
                          className={styles.buttonSecondary}
                          onClick={handleMigrate}
                          title="Convert this command into a skill"
                        >
                          Migrate to skill
                        </button>
                        <button
                          type="button"
                          className={styles.buttonDanger}
                          onClick={handleDelete}
                        >
                          Delete
                        </button>
                      </>
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
                  label="Filename"
                  value={draft.filename}
                  onChange={(v) => setDraft({ ...draft, filename: v })}
                  hint="The basename becomes the slash command. e.g. ship.md → /ship"
                  disabled={!draft.isNew}
                />
                <Field
                  label="Name (frontmatter)"
                  value={draft.name}
                  onChange={(v) => setDraft({ ...draft, name: v })}
                  hint="Optional. Defaults to filename without .md."
                />
                <Field
                  label="Description"
                  value={draft.description}
                  multiline
                  onChange={(v) => setDraft({ ...draft, description: v })}
                />
                <Field
                  label="Body"
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

interface DraftCommand {
  filename: string;
  name: string;
  description: string;
  body: string;
  isNew?: boolean;
}

function cmdToDraft(c: CommandDefinition): DraftCommand {
  return {
    filename: c.filename,
    name: c.frontmatter.name ?? "",
    description: c.frontmatter.description ?? "",
    body: c.body,
  };
}

function originalChanged(
  draft: DraftCommand,
  commands: CommandDefinition[],
): boolean {
  if (draft.isNew) return true;
  const c = commands.find((x) => x.filename === draft.filename);
  if (!c) return true;
  const cur = cmdToDraft(c);
  return (
    cur.name !== draft.name ||
    cur.description !== draft.description ||
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
