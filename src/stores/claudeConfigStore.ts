/**
 * Claude Code config store.
 *
 * Loads and caches Claude Code config files from the canonical paths
 * (~/.claude and <projectRoot>/.claude), exposes parsed views (settings,
 * agents, CLAUDE.md), and writes back via the path-allowlisted fs bridge.
 *
 * Scopes:
 *   - user:    ~/.claude/{settings.json, agents/, CLAUDE.md}
 *   - project: <projectRoot>/.claude/{settings.json, agents/} + <projectRoot>/CLAUDE.md
 *   - local:   <projectRoot>/.claude/settings.local.json
 *
 * Path joining uses POSIX `/` (macOS-only build today).
 */

import { create } from "zustand";
import {
  parseAgent,
  parseCommand,
  parseSettings,
  parseSkill,
  serializeAgent,
  serializeCommand,
  serializeSettings,
  serializeSkill,
  type AgentDefinition,
  type AgentFrontmatter,
  type ClaudeSettings,
  type CommandDefinition,
  type SkillDefinition,
  type SkillFrontmatter,
} from "../services/claude-config-parser";
import type { FsRoots } from "../global";

export type Scope = "user" | "project" | "local";

export interface ScopeData {
  loaded: boolean;
  loading: boolean;
  error: string | null;
  settings: ClaudeSettings | null;
  settingsRaw: string | null;
  agents: AgentDefinition[];
  skills: SkillDefinition[];
  commands: CommandDefinition[];
  claudeMd: string | null;
}

interface ClaudeConfigState {
  activeScope: Scope;
  roots: FsRoots | null;
  user: ScopeData;
  project: ScopeData;
  local: ScopeData;
  watchIds: string[];
  /** Top-level error from init or refresh — surfaces a banner in the panel. */
  initError: string | null;
  /** True once init() has completed at least once (success or fail). */
  ready: boolean;
  _initialized: boolean;
  _watchUnsub: (() => void) | null;

  init: () => Promise<void>;
  setActiveProjectPath: (absPath: string | null) => Promise<void>;
  setScope: (scope: Scope) => void;
  loadScope: (scope: Scope) => Promise<void>;
  saveSettings: (
    scope: Scope,
    next: ClaudeSettings,
  ) => Promise<void>;
  saveSettingsRaw: (scope: Scope, raw: string) => Promise<void>;
  saveAgent: (
    scope: Scope,
    filename: string,
    frontmatter: AgentFrontmatter,
    body: string,
  ) => Promise<void>;
  deleteAgent: (scope: Scope, filename: string) => Promise<void>;
  saveSkill: (
    scope: Scope,
    dirname: string,
    frontmatter: SkillFrontmatter,
    body: string,
  ) => Promise<void>;
  deleteSkill: (scope: Scope, dirname: string) => Promise<void>;
  saveCommand: (
    scope: Scope,
    filename: string,
    frontmatter: SkillFrontmatter,
    body: string,
  ) => Promise<void>;
  deleteCommand: (scope: Scope, filename: string) => Promise<void>;
  migrateCommandToSkill: (scope: Scope, filename: string) => Promise<void>;
  saveClaudeMd: (scope: Scope, text: string) => Promise<void>;
}

const EMPTY_SCOPE: ScopeData = {
  loaded: false,
  loading: false,
  error: null,
  settings: null,
  settingsRaw: null,
  agents: [],
  skills: [],
  commands: [],
  claudeMd: null,
};

function settingsPath(scope: Scope, roots: FsRoots): string | null {
  if (scope === "user") return `${roots.user}/settings.json`;
  if (scope === "project") return roots.project ? `${roots.project}/settings.json` : null;
  if (scope === "local") return roots.project ? `${roots.project}/settings.local.json` : null;
  return null;
}

function agentsDir(scope: Scope, roots: FsRoots): string | null {
  if (scope === "local") return null; // local has no agents
  if (scope === "user") return `${roots.user}/agents`;
  return roots.project ? `${roots.project}/agents` : null;
}

function skillsDir(scope: Scope, roots: FsRoots): string | null {
  if (scope === "local") return null;
  if (scope === "user") return `${roots.user}/skills`;
  return roots.project ? `${roots.project}/skills` : null;
}

function commandsDir(scope: Scope, roots: FsRoots): string | null {
  if (scope === "local") return null;
  if (scope === "user") return `${roots.user}/commands`;
  return roots.project ? `${roots.project}/commands` : null;
}

// Serialize all watcher/root operations through a single in-flight promise.
// init() and setActiveProjectPath both mutate watchIds and roots, so running
// them concurrently produces dangling watchers and stale state. This queue
// ensures only one such operation runs at a time.
let opQueue: Promise<void> = Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const next = opQueue.then(fn).catch(async (e) => {
    throw e;
  });
  opQueue = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

async function refreshAfterRootChange(
  set: (
    partial:
      | Partial<ClaudeConfigState>
      | ((s: ClaudeConfigState) => Partial<ClaudeConfigState>),
  ) => void,
  get: () => ClaudeConfigState,
): Promise<void> {
  const oldIds = get().watchIds;
  await Promise.all(
    oldIds.map((id) => window.agentcon.fs.watchStop(id).catch(() => undefined)),
  );
  const roots = await window.agentcon.fs.getRoots();
  const ids = await Promise.all(
    watchTargets(roots).map((p) =>
      window.agentcon.fs.watchStart(p).catch(() => null),
    ),
  );
  set({
    roots,
    watchIds: ids.filter((x): x is string => typeof x === "string"),
    project: { ...EMPTY_SCOPE },
    local: { ...EMPTY_SCOPE },
    initError: null,
  });
}

function claudeMdPath(scope: Scope, roots: FsRoots): string | null {
  if (scope === "local") return null;
  if (scope === "user") return `${roots.user}/CLAUDE.md`;
  return roots.projectClaudeMd;
}

function watchTargets(roots: FsRoots): string[] {
  const list = [roots.user];
  if (roots.project) list.push(roots.project);
  if (roots.projectClaudeMd && roots.activeProjectRoot)
    list.push(roots.activeProjectRoot);
  return list;
}

export const useClaudeConfigStore = create<ClaudeConfigState>((set, get) => ({
  activeScope: "user",
  roots: null,
  user: { ...EMPTY_SCOPE },
  project: { ...EMPTY_SCOPE },
  local: { ...EMPTY_SCOPE },
  watchIds: [],
  initError: null,
  ready: false,
  _initialized: false,
  _watchUnsub: null,

  init: () =>
    enqueue(async () => {
      if (get()._initialized) return;
      set({ _initialized: true, initError: null });
      try {
        const roots = await window.agentcon.fs.getRoots();
        const unsub = window.agentcon.fs.onWatchEvent((evt) => {
          const r = get().roots;
          if (!r) return;
          const p = evt.path;
          if (p.startsWith(r.user)) {
            set({ user: { ...get().user, loaded: false } });
          }
          if (r.project && p.startsWith(r.project)) {
            set({
              project: { ...get().project, loaded: false },
              local: { ...get().local, loaded: false },
            });
          }
          if (r.projectClaudeMd && p === r.projectClaudeMd) {
            set({ project: { ...get().project, loaded: false } });
          }
        });
        const ids = await Promise.all(
          watchTargets(roots).map((p) =>
            window.agentcon.fs.watchStart(p).catch(() => null),
          ),
        );
        set({
          roots,
          _watchUnsub: unsub,
          watchIds: ids.filter((x): x is string => typeof x === "string"),
          ready: true,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        // Reset _initialized so the user can retry via Reload.
        set({ _initialized: false, ready: true, initError: msg });
        // eslint-disable-next-line no-console
        console.error("[claude-config] init failed", e);
      }
    }),

  setActiveProjectPath: (absPath: string | null) =>
    enqueue(async () => {
      try {
        await window.agentcon.fs.setActiveProjectPath(absPath);
        await refreshAfterRootChange(set, get);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        set({ initError: msg });
        console.error("[claude-config] setActiveProjectPath failed", e);
      }
    }),

  setScope: (scope) => set({ activeScope: scope }),

  loadScope: async (scope) => {
    const state = get();
    const roots = state.roots;
    if (!roots) return;
    const slot = state[scope];
    if (slot.loading) return;
    set({ [scope]: { ...slot, loading: true, error: null } } as Partial<ClaudeConfigState>);
    try {
      const sp = settingsPath(scope, roots);
      const ad = agentsDir(scope, roots);
      const cm = claudeMdPath(scope, roots);

      const settingsRaw = sp ? await window.agentcon.fs.readText(sp) : null;
      let parsedSettings: ClaudeSettings | null = null;
      if (settingsRaw != null) {
        try {
          parsedSettings = parseSettings(settingsRaw);
        } catch (e) {
          parsedSettings = null;
        }
      }

      let agents: AgentDefinition[] = [];
      if (ad) {
        const entries = await window.agentcon.fs.readDir(ad);
        if (entries) {
          const md = entries.filter((e) => !e.isDir && e.name.endsWith(".md"));
          agents = await Promise.all(
            md.map(async (e) => {
              const raw = (await window.agentcon.fs.readText(`${ad}/${e.name}`)) ?? "";
              return parseAgent(e.name, raw);
            }),
          );
          agents.sort((a, b) => a.filename.localeCompare(b.filename));
        }
      }

      const sd = skillsDir(scope, roots);
      let skills: SkillDefinition[] = [];
      if (sd) {
        const entries = await window.agentcon.fs.readDir(sd);
        if (entries) {
          const dirs = entries.filter((e) => e.isDir);
          skills = await Promise.all(
            dirs.map(async (d) => {
              const raw =
                (await window.agentcon.fs.readText(`${sd}/${d.name}/SKILL.md`)) ?? "";
              return parseSkill(d.name, raw);
            }),
          );
          skills.sort((a, b) => a.dirname.localeCompare(b.dirname));
        }
      }

      const cd = commandsDir(scope, roots);
      let commands: CommandDefinition[] = [];
      if (cd) {
        const entries = await window.agentcon.fs.readDir(cd);
        if (entries) {
          const md = entries.filter((e) => !e.isDir && e.name.endsWith(".md"));
          commands = await Promise.all(
            md.map(async (e) => {
              const raw = (await window.agentcon.fs.readText(`${cd}/${e.name}`)) ?? "";
              return parseCommand(e.name, raw);
            }),
          );
          commands.sort((a, b) => a.filename.localeCompare(b.filename));
        }
      }

      const claudeMd = cm ? await window.agentcon.fs.readText(cm) : null;

      set({
        [scope]: {
          loaded: true,
          loading: false,
          error: null,
          settings: parsedSettings,
          settingsRaw,
          agents,
          skills,
          commands,
          claudeMd,
        },
      } as Partial<ClaudeConfigState>);
    } catch (e) {
      set({
        [scope]: {
          ...slot,
          loading: false,
          error: e instanceof Error ? e.message : String(e),
        },
      } as Partial<ClaudeConfigState>);
    }
  },

  saveSettings: async (scope, next) => {
    const roots = get().roots;
    if (!roots) throw new Error("config store not initialized");
    const sp = settingsPath(scope, roots);
    if (!sp) throw new Error(`no settings file for scope ${scope}`);
    const raw = serializeSettings(next);
    await window.agentcon.fs.writeText(sp, raw);
    set({
      [scope]: {
        ...get()[scope],
        settings: next,
        settingsRaw: raw,
        loaded: true,
      },
    } as Partial<ClaudeConfigState>);
  },

  saveSettingsRaw: async (scope, raw) => {
    const roots = get().roots;
    if (!roots) throw new Error("config store not initialized");
    const sp = settingsPath(scope, roots);
    if (!sp) throw new Error(`no settings file for scope ${scope}`);
    let parsed: ClaudeSettings | null = null;
    try {
      parsed = parseSettings(raw);
    } catch (e) {
      throw new Error(`invalid JSON: ${e instanceof Error ? e.message : String(e)}`);
    }
    await window.agentcon.fs.writeText(sp, raw.endsWith("\n") ? raw : raw + "\n");
    set({
      [scope]: {
        ...get()[scope],
        settings: parsed,
        settingsRaw: raw,
        loaded: true,
      },
    } as Partial<ClaudeConfigState>);
  },

  saveAgent: async (scope, filename, frontmatter, body) => {
    const roots = get().roots;
    if (!roots) throw new Error("config store not initialized");
    const ad = agentsDir(scope, roots);
    if (!ad) throw new Error(`no agents dir for scope ${scope}`);
    const fname = filename.endsWith(".md") ? filename : `${filename}.md`;
    const raw = serializeAgent(frontmatter, body);
    await window.agentcon.fs.writeText(`${ad}/${fname}`, raw);
    const slot = get()[scope];
    const next = parseAgent(fname, raw);
    const others = slot.agents.filter((a) => a.filename !== fname);
    set({
      [scope]: {
        ...slot,
        agents: [...others, next].sort((a, b) =>
          a.filename.localeCompare(b.filename),
        ),
      },
    } as Partial<ClaudeConfigState>);
  },

  deleteAgent: async (scope, filename) => {
    const roots = get().roots;
    if (!roots) throw new Error("config store not initialized");
    const ad = agentsDir(scope, roots);
    if (!ad) throw new Error(`no agents dir for scope ${scope}`);
    await window.agentcon.fs.delete(`${ad}/${filename}`);
    const slot = get()[scope];
    set({
      [scope]: {
        ...slot,
        agents: slot.agents.filter((a) => a.filename !== filename),
      },
    } as Partial<ClaudeConfigState>);
  },

  saveSkill: async (scope, dirname, frontmatter, body) => {
    const roots = get().roots;
    if (!roots) throw new Error("config store not initialized");
    const sd = skillsDir(scope, roots);
    if (!sd) throw new Error(`no skills dir for scope ${scope}`);
    const dn = dirname.trim();
    if (!dn) throw new Error("skill dirname is required");
    const raw = serializeSkill(frontmatter, body);
    await window.agentcon.fs.writeText(`${sd}/${dn}/SKILL.md`, raw);
    const slot = get()[scope];
    const next = parseSkill(dn, raw);
    const others = slot.skills.filter((s) => s.dirname !== dn);
    set({
      [scope]: {
        ...slot,
        skills: [...others, next].sort((a, b) =>
          a.dirname.localeCompare(b.dirname),
        ),
      },
    } as Partial<ClaudeConfigState>);
  },

  deleteSkill: async (scope, dirname) => {
    const roots = get().roots;
    if (!roots) throw new Error("config store not initialized");
    const sd = skillsDir(scope, roots);
    if (!sd) throw new Error(`no skills dir for scope ${scope}`);
    // Only delete the SKILL.md to avoid wiping supporting files unintentionally;
    // user can clean up the directory if they want.
    await window.agentcon.fs.delete(`${sd}/${dirname}/SKILL.md`);
    const slot = get()[scope];
    set({
      [scope]: {
        ...slot,
        skills: slot.skills.filter((s) => s.dirname !== dirname),
      },
    } as Partial<ClaudeConfigState>);
  },

  saveCommand: async (scope, filename, frontmatter, body) => {
    const roots = get().roots;
    if (!roots) throw new Error("config store not initialized");
    const cd = commandsDir(scope, roots);
    if (!cd) throw new Error(`no commands dir for scope ${scope}`);
    const fname = filename.endsWith(".md") ? filename : `${filename}.md`;
    const raw = serializeCommand(frontmatter, body);
    await window.agentcon.fs.writeText(`${cd}/${fname}`, raw);
    const slot = get()[scope];
    const next = parseCommand(fname, raw);
    const others = slot.commands.filter((c) => c.filename !== fname);
    set({
      [scope]: {
        ...slot,
        commands: [...others, next].sort((a, b) =>
          a.filename.localeCompare(b.filename),
        ),
      },
    } as Partial<ClaudeConfigState>);
  },

  deleteCommand: async (scope, filename) => {
    const roots = get().roots;
    if (!roots) throw new Error("config store not initialized");
    const cd = commandsDir(scope, roots);
    if (!cd) throw new Error(`no commands dir for scope ${scope}`);
    await window.agentcon.fs.delete(`${cd}/${filename}`);
    const slot = get()[scope];
    set({
      [scope]: {
        ...slot,
        commands: slot.commands.filter((c) => c.filename !== filename),
      },
    } as Partial<ClaudeConfigState>);
  },

  migrateCommandToSkill: async (scope, filename) => {
    const slot = get()[scope];
    const cmd = slot.commands.find((c) => c.filename === filename);
    if (!cmd) throw new Error(`command not found: ${filename}`);
    const dirname = filename.replace(/\.md$/i, "");
    await get().saveSkill(scope, dirname, cmd.frontmatter, cmd.body);
    await get().deleteCommand(scope, filename);
  },

  saveClaudeMd: async (scope, text) => {
    const roots = get().roots;
    if (!roots) throw new Error("config store not initialized");
    const cm = claudeMdPath(scope, roots);
    if (!cm) throw new Error(`no CLAUDE.md path for scope ${scope}`);
    await window.agentcon.fs.writeText(cm, text);
    set({
      [scope]: { ...get()[scope], claudeMd: text },
    } as Partial<ClaudeConfigState>);
  },

}));

export function selectScopeData(state: ClaudeConfigState): ScopeData {
  return state[state.activeScope];
}
