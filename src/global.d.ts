/**
 * Renderer-side type declarations for the preload bridge.
 *
 * The preload script (src/electron/preload.ts) exposes window.agentcon with the
 * surface declared here. Keep this file in sync with that runtime shape.
 */

export interface AgentConSettingsApi {
  get<T = unknown>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
  save(): Promise<void>;
}

export interface AgentConDialog {
  open(opts: {
    directory?: boolean;
    multiple?: boolean;
    title?: string;
  }): Promise<string | string[] | null>;
  ask(
    message: string,
    opts?: { title?: string; kind?: "info" | "warning" | "error" },
  ): Promise<boolean>;
}

export interface AgentConOpener {
  revealInDir(target: string): Promise<void>;
}

export interface FsRoots {
  user: string;
  project: string | null;
  projectClaudeMd: string | null;
  userClaudeJson: string;
  activeProjectRoot: string | null;
}

export interface FsDirEntry {
  name: string;
  isDir: boolean;
  isSymlink: boolean;
  mtimeMs: number;
}

export interface FsWatchEvent {
  watchId: string;
  type: "add" | "change" | "unlink" | "addDir" | "unlinkDir";
  path: string;
}

export interface AgentConFs {
  setActiveProjectPath(absPath: string | null): Promise<void>;
  getRoots(): Promise<FsRoots>;
  readText(absPath: string): Promise<string | null>;
  writeText(absPath: string, contents: string): Promise<void>;
  exists(absPath: string): Promise<boolean>;
  readDir(absPath: string): Promise<FsDirEntry[] | null>;
  delete(absPath: string): Promise<void>;
  watchStart(absPath: string): Promise<string>;
  watchStop(watchId: string): Promise<void>;
  onWatchEvent(cb: (evt: FsWatchEvent) => void): () => void;
}

export interface AgentConClaude {
  seedAgents(): Promise<{ copied: string[]; skipped: string[] }>;
  scaffoldProject(opts: {
    projectRoot: string;
    includeSettings: boolean;
    includeClaudeMd: boolean;
    projectName?: string;
  }): Promise<{ written: string[]; skipped: string[] }>;
  readTemplate(
    name: "starter-settings.json" | "starter-claude-md.md",
  ): Promise<string>;
}

export interface AgentConApi {
  settings: AgentConSettingsApi;
  dialog: AgentConDialog;
  opener: AgentConOpener;
  fs: AgentConFs;
  claude: AgentConClaude;
}

declare global {
  interface Window {
    agentcon: AgentConApi;
  }
}
