/**
 * Path-allowlisted file system bridge for the Claude Code settings UI.
 *
 * The renderer is sandboxed and cannot touch disk directly. This bridge
 * exposes targeted file operations restricted to:
 *   - ~/.claude/**            (user-scope Claude Code config)
 *   - <activeProjectRoot>/.claude/**   (project-scope Claude Code config)
 *   - <activeProjectRoot>/CLAUDE.md    (project-root memory file)
 *
 * The active project root is set explicitly by the renderer via
 * fs:setActiveProjectPath whenever the user picks a folder.
 */

import { ipcMain, type WebContents } from "electron";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import chokidar, { type FSWatcher } from "chokidar";

let activeProjectRoot: string | null = null;
let webContents: WebContents | null = null;
const watchers = new Map<string, FSWatcher>();
let nextWatchId = 1;

export function setFsRenderer(wc: WebContents): void {
  webContents = wc;
}

function userClaudeRoot(): string {
  return path.join(os.homedir(), ".claude");
}

function projectClaudeRoot(): string | null {
  return activeProjectRoot ? path.join(activeProjectRoot, ".claude") : null;
}

function projectClaudeMd(): string | null {
  return activeProjectRoot ? path.join(activeProjectRoot, "CLAUDE.md") : null;
}

function expandTilde(p: string): string {
  if (p === "~") return os.homedir();
  if (p.startsWith("~/")) return path.join(os.homedir(), p.slice(2));
  return p;
}

function checkPath(input: string): string {
  const resolved = path.resolve(expandTilde(input));
  const allowedDirs: string[] = [userClaudeRoot()];
  const proj = projectClaudeRoot();
  if (proj) allowedDirs.push(proj);
  const allowedFiles: string[] = [];
  const md = projectClaudeMd();
  if (md) allowedFiles.push(md);

  for (const root of allowedDirs) {
    if (resolved === root) return resolved;
    if (resolved.startsWith(root + path.sep)) return resolved;
  }
  for (const f of allowedFiles) {
    if (resolved === f) return resolved;
  }
  throw new Error(
    `fs-bridge: access denied (path outside allowed scopes): ${resolved}`,
  );
}

async function readText(p: string): Promise<string | null> {
  const safe = checkPath(p);
  try {
    return await fs.promises.readFile(safe, "utf-8");
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw e;
  }
}

async function writeText(p: string, contents: string): Promise<void> {
  const safe = checkPath(p);
  await fs.promises.mkdir(path.dirname(safe), { recursive: true });
  const tmp = `${safe}.agentcon-tmp-${process.pid}-${Date.now()}`;
  await fs.promises.writeFile(tmp, contents, "utf-8");
  await fs.promises.rename(tmp, safe);
}

async function deletePath(p: string): Promise<void> {
  const safe = checkPath(p);
  await fs.promises.rm(safe, { force: true });
}

async function existsPath(p: string): Promise<boolean> {
  try {
    const safe = checkPath(p);
    await fs.promises.access(safe);
    return true;
  } catch {
    return false;
  }
}

export interface DirEntry {
  name: string;
  isDir: boolean;
  isSymlink: boolean;
  mtimeMs: number;
}

async function readDir(p: string): Promise<DirEntry[] | null> {
  const safe = checkPath(p);
  let entries: fs.Dirent[];
  try {
    entries = await fs.promises.readdir(safe, { withFileTypes: true });
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw e;
  }
  const out: DirEntry[] = [];
  for (const e of entries) {
    const full = path.join(safe, e.name);
    try {
      const stat = await fs.promises.stat(full);
      out.push({
        name: e.name,
        isDir: e.isDirectory(),
        isSymlink: e.isSymbolicLink(),
        mtimeMs: stat.mtimeMs,
      });
    } catch {
      continue;
    }
  }
  return out;
}

export interface WatchEvent {
  watchId: string;
  type: "add" | "change" | "unlink" | "addDir" | "unlinkDir";
  path: string;
}

function startWatch(p: string): string {
  const safe = checkPath(p);
  const id = `w${nextWatchId++}`;
  const watcher = chokidar.watch(safe, {
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 50, pollInterval: 50 },
    depth: 99,
  });
  watcher.on("all", (type, watchedPath) => {
    if (!webContents || webContents.isDestroyed()) return;
    const evt: WatchEvent = {
      watchId: id,
      type: type as WatchEvent["type"],
      path: typeof watchedPath === "string" ? watchedPath : "",
    };
    webContents.send("fs:watch", evt);
  });
  watchers.set(id, watcher);
  return id;
}

async function stopWatch(id: string): Promise<void> {
  const w = watchers.get(id);
  if (!w) return;
  await w.close();
  watchers.delete(id);
}

export async function closeAllWatchers(): Promise<void> {
  await Promise.all([...watchers.values()].map((w) => w.close()));
  watchers.clear();
}

export function setActiveProjectByPath(absPath: string | null): void {
  if (!absPath) {
    activeProjectRoot = null;
    return;
  }
  activeProjectRoot = path.resolve(expandTilde(absPath));
}

export interface FsRoots {
  user: string;
  project: string | null;
  projectClaudeMd: string | null;
  userClaudeJson: string;
  activeProjectRoot: string | null;
}

export function getRoots(): FsRoots {
  return {
    user: userClaudeRoot(),
    project: projectClaudeRoot(),
    projectClaudeMd: projectClaudeMd(),
    userClaudeJson: userClaudeJson(),
    activeProjectRoot,
  };
}

export function registerFsHandlers(): void {
  ipcMain.handle(
    "fs:setActiveProjectPath",
    (_e, absPath: string | null) => setActiveProjectByPath(absPath),
  );
  ipcMain.handle("fs:getRoots", () => getRoots());
  ipcMain.handle("fs:readText", (_e, p: string) => readText(p));
  ipcMain.handle("fs:writeText", (_e, p: string, contents: string) =>
    writeText(p, contents),
  );
  ipcMain.handle("fs:exists", (_e, p: string) => existsPath(p));
  ipcMain.handle("fs:readDir", (_e, p: string) => readDir(p));
  ipcMain.handle("fs:delete", (_e, p: string) => deletePath(p));
  ipcMain.handle("fs:watchStart", (_e, p: string) => startWatch(p));
  ipcMain.handle("fs:watchStop", (_e, id: string) => stopWatch(id));
}
