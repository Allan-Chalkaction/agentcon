/**
 * IPC mock seam — agentconMock.ts
 *
 * Installs an in-memory fake implementation of window.agentcon that matches
 * the full AgentConApi shape declared in src/global.d.ts. This lets component
 * tests (running under jsdom) exercise the full save/load/watch path without
 * requiring Electron IPC.
 *
 * Pattern (from ADR D5, PRD §8.7):
 *   const fakeFs = installAgentconMock();
 *   fakeFs.set("/tmp/test-user-claude/settings.json", JSON.stringify({ ... }));
 *   render(<ClaudeSettingsPanel />);
 *   // drive UI events
 *   expect(JSON.parse(fakeFs.get("/tmp/test-user-claude/settings.json")!)).toEqual({ ... });
 *
 * CONS-08 — Write-error injection knob:
 *   installAgentconMock({ writeShouldFail: true })   // all writeText calls reject
 *   installAgentconMock({ writeShouldFail: new Error("EACCES") })  // with a custom error
 *
 * The function returns the fake-fs Map so tests can read post-Save state and
 * pre-arm initial config without going through the component.
 */

export interface AgentconMockOptions {
  /**
   * When set, every call to fs.writeText() rejects with this error.
   * Pass `true` for a generic write-failure error; pass an Error instance
   * for a specific message (e.g. the save-failure alert text in AC-042 case 3).
   */
  writeShouldFail?: boolean | Error;

  /**
   * Initial content for the fake file system. If not provided, the fake-fs
   * starts empty (all readText calls return null).
   */
  initialFs?: Map<string, string>;
}

// Predictable test paths matching the getRoots stub.
export const TEST_ROOTS = {
  user: "/tmp/test-user-claude",
  project: "/tmp/test-project-claude",
  projectClaudeMd: "/tmp/test-project-claude/CLAUDE.md",
  userClaudeJson: "/tmp/test-user-claude/.claude.json",
  activeProjectRoot: "/tmp/test-project-root",
} as const;

/**
 * Installs the agentcon mock on globalThis.window.agentcon.
 *
 * Returns the fake-fs Map so tests can read/write to it directly.
 * Calling this again (e.g. from setup.ts beforeEach) replaces the previous
 * mock instance, preventing state leakage between tests.
 */
export function installAgentconMock(
  options: AgentconMockOptions = {},
): Map<string, string> {
  const fakeFs: Map<string, string> = options.initialFs
    ? new Map(options.initialFs)
    : new Map();

  const fakeSettings: Map<string, unknown> = new Map();

  // Resolve the write-failure option to an Error (or undefined if not set).
  const writeError: Error | undefined =
    options.writeShouldFail === true
      ? new Error("Mock write failure — writeShouldFail was set to true")
      : options.writeShouldFail instanceof Error
        ? options.writeShouldFail
        : undefined;

  // Watch-event subscribers for testing watch flows.
  type WatchEventType = "add" | "change" | "unlink" | "addDir" | "unlinkDir";
  const watchEventListeners: Array<
    (evt: { watchId: string; type: WatchEventType; path: string }) => void
  > = [];
  let watchIdCounter = 0;

  const mock: Window["agentcon"] = {
    // ----- fs -----
    fs: {
      setActiveProjectPath(_absPath: string | null): Promise<void> {
        return Promise.resolve();
      },

      getRoots(): Promise<{
        user: string;
        project: string | null;
        projectClaudeMd: string | null;
        userClaudeJson: string;
        activeProjectRoot: string | null;
      }> {
        return Promise.resolve({ ...TEST_ROOTS });
      },

      readText(absPath: string): Promise<string | null> {
        return Promise.resolve(fakeFs.get(absPath) ?? null);
      },

      writeText(absPath: string, contents: string): Promise<void> {
        if (writeError) {
          return Promise.reject(writeError);
        }
        fakeFs.set(absPath, contents);
        return Promise.resolve();
      },

      exists(absPath: string): Promise<boolean> {
        return Promise.resolve(fakeFs.has(absPath));
      },

      readDir(_absPath: string): Promise<
        | { name: string; isDir: boolean; isSymlink: boolean; mtimeMs: number }[]
        | null
      > {
        // Return an empty directory listing; tests that need specific entries
        // can pre-arm the fakeFs with the SKILL.md / agent.md files.
        return Promise.resolve([]);
      },

      delete(absPath: string): Promise<void> {
        fakeFs.delete(absPath);
        return Promise.resolve();
      },

      watchStart(_absPath: string): Promise<string> {
        const id = `watch-${++watchIdCounter}`;
        return Promise.resolve(id);
      },

      watchStop(_watchId: string): Promise<void> {
        return Promise.resolve();
      },

      onWatchEvent(
        cb: (evt: { watchId: string; type: WatchEventType; path: string }) => void,
      ): () => void {
        watchEventListeners.push(cb);
        return () => {
          const idx = watchEventListeners.indexOf(cb);
          if (idx !== -1) watchEventListeners.splice(idx, 1);
        };
      },
    },

    // ----- settings -----
    settings: {
      get<T = unknown>(key: string): Promise<T | null> {
        return Promise.resolve((fakeSettings.get(key) as T) ?? null);
      },
      set(key: string, value: unknown): Promise<void> {
        fakeSettings.set(key, value);
        return Promise.resolve();
      },
      delete(key: string): Promise<void> {
        fakeSettings.delete(key);
        return Promise.resolve();
      },
      save(): Promise<void> {
        return Promise.resolve();
      },
    },

    // ----- dialog -----
    dialog: {
      open(
        _opts: { directory?: boolean; multiple?: boolean; title?: string },
      ): Promise<string | string[] | null> {
        // Tests that need a specific dialog return value should override
        // window.agentcon.dialog.open directly after installAgentconMock().
        return Promise.resolve(null);
      },
      ask(
        _message: string,
        _opts?: { title?: string; kind?: "info" | "warning" | "error" },
      ): Promise<boolean> {
        return Promise.resolve(false);
      },
    },

    // ----- opener -----
    opener: {
      revealInDir(_target: string): Promise<void> {
        return Promise.resolve();
      },
    },

    // ----- claude -----
    claude: {
      seedAgents(): Promise<{ copied: string[]; skipped: string[] }> {
        return Promise.resolve({ copied: [], skipped: [] });
      },
      scaffoldProject(_opts: {
        projectRoot: string;
        includeSettings: boolean;
        includeClaudeMd: boolean;
        projectName?: string;
      }): Promise<{ written: string[]; skipped: string[] }> {
        return Promise.resolve({ written: [], skipped: [] });
      },
      readTemplate(
        _name: "starter-settings.json" | "starter-claude-md.md",
      ): Promise<string> {
        return Promise.resolve("");
      },
    },
  };

  // Install on globalThis.window so jsdom picks it up.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).window = (globalThis as any).window ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).window.agentcon = mock;

  return fakeFs;
}
