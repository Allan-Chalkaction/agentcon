import { contextBridge, ipcRenderer } from "electron";

const api = {
  settings: {
    get<T = unknown>(key: string): Promise<T | null> {
      return ipcRenderer.invoke("settings:get", key);
    },
    set(key: string, value: unknown): Promise<void> {
      return ipcRenderer.invoke("settings:set", key, value);
    },
    delete(key: string): Promise<void> {
      return ipcRenderer.invoke("settings:delete", key);
    },
    save(): Promise<void> {
      return ipcRenderer.invoke("settings:save");
    },
  },
  dialog: {
    open(opts: {
      directory?: boolean;
      multiple?: boolean;
      title?: string;
    }): Promise<string | string[] | null> {
      return ipcRenderer.invoke("dialog:open", opts);
    },
    ask(
      message: string,
      opts?: { title?: string; kind?: "info" | "warning" | "error" },
    ): Promise<boolean> {
      return ipcRenderer.invoke("dialog:ask", message, opts);
    },
  },
  opener: {
    revealInDir(target: string): Promise<void> {
      return ipcRenderer.invoke("opener:revealInDir", target);
    },
  },
  claude: {
    seedAgents(): Promise<{ copied: string[]; skipped: string[] }> {
      return ipcRenderer.invoke("claude:seedAgents");
    },
    scaffoldProject(opts: {
      projectRoot: string;
      includeSettings: boolean;
      includeClaudeMd: boolean;
      projectName?: string;
    }): Promise<{ written: string[]; skipped: string[] }> {
      return ipcRenderer.invoke("claude:scaffoldProject", opts);
    },
    readTemplate(
      name: "starter-settings.json" | "starter-claude-md.md",
    ): Promise<string> {
      return ipcRenderer.invoke("claude:readTemplate", name);
    },
  },
  fs: {
    setActiveProjectPath(absPath: string | null): Promise<void> {
      return ipcRenderer.invoke("fs:setActiveProjectPath", absPath);
    },
    getRoots(): Promise<{
      user: string;
      project: string | null;
      projectClaudeMd: string | null;
      userClaudeJson: string;
      activeProjectRoot: string | null;
    }> {
      return ipcRenderer.invoke("fs:getRoots");
    },
    readText(absPath: string): Promise<string | null> {
      return ipcRenderer.invoke("fs:readText", absPath);
    },
    writeText(absPath: string, contents: string): Promise<void> {
      return ipcRenderer.invoke("fs:writeText", absPath, contents);
    },
    exists(absPath: string): Promise<boolean> {
      return ipcRenderer.invoke("fs:exists", absPath);
    },
    readDir(absPath: string): Promise<
      | {
          name: string;
          isDir: boolean;
          isSymlink: boolean;
          mtimeMs: number;
        }[]
      | null
    > {
      return ipcRenderer.invoke("fs:readDir", absPath);
    },
    delete(absPath: string): Promise<void> {
      return ipcRenderer.invoke("fs:delete", absPath);
    },
    watchStart(absPath: string): Promise<string> {
      return ipcRenderer.invoke("fs:watchStart", absPath);
    },
    watchStop(watchId: string): Promise<void> {
      return ipcRenderer.invoke("fs:watchStop", watchId);
    },
    onWatchEvent(
      cb: (evt: { watchId: string; type: string; path: string }) => void,
    ): () => void {
      const handler = (
        _e: unknown,
        payload: { watchId: string; type: string; path: string },
      ) => cb(payload);
      ipcRenderer.on("fs:watch", handler);
      return () => {
        ipcRenderer.off("fs:watch", handler);
      };
    },
  },
};

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld("agentcon", api);
} else {
  // @ts-expect-error attaching to window in non-isolated context
  window.agentcon = api;
}

export type AgentConApi = typeof api;
