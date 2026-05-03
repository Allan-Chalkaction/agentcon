/**
 * Bundled-agent seeder + scaffold helpers.
 *
 * On first launch (and on app version bumps if `shippedAgentsVersion`
 * doesn't match the bundled set), copies `resources/bundled-agents/*.md`
 * to `~/.claude/agents/ac-<name>.md`. Existing files at the destination
 * are left untouched — we never silently overwrite user edits.
 *
 * Also exposes a scaffold helper for new repos: writes a starter
 * `.claude/settings.json` and `CLAUDE.md` from the templates in
 * `resources/templates/`.
 */

import { app } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { settingsGet, settingsSave, settingsSet } from "./settings-store";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SHIPPED_AGENTS_VERSION_KEY = "shippedAgentsVersion";
const CURRENT_BUNDLED_VERSION = 1;
const AGENT_PREFIX = "ac-";

function bundledAgentsDir(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, "bundled-agents")
    : path.join(__dirname, "../../resources/bundled-agents");
}

function templatesDir(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, "templates")
    : path.join(__dirname, "../../resources/templates");
}

function userAgentsDir(): string {
  return path.join(os.homedir(), ".claude", "agents");
}

export interface SeedResult {
  copied: string[];
  skipped: string[];
}

export function seedBundledAgents(): SeedResult {
  const result: SeedResult = { copied: [], skipped: [] };
  const src = bundledAgentsDir();

  if (!fs.existsSync(src)) return result;

  let entries: string[];
  try {
    entries = fs.readdirSync(src).filter((f) => f.endsWith(".md"));
  } catch {
    return result;
  }
  if (entries.length === 0) return result;

  const dst = userAgentsDir();
  fs.mkdirSync(dst, { recursive: true });

  for (const f of entries) {
    const dstName = f.startsWith(AGENT_PREFIX) ? f : `${AGENT_PREFIX}${f}`;
    const dstPath = path.join(dst, dstName);
    if (fs.existsSync(dstPath)) {
      result.skipped.push(dstName);
      continue;
    }
    try {
      fs.copyFileSync(path.join(src, f), dstPath);
      result.copied.push(dstName);
    } catch {
      // skip failures silently; user can rerun or copy manually
    }
  }

  settingsSet(SHIPPED_AGENTS_VERSION_KEY, CURRENT_BUNDLED_VERSION);
  settingsSave();
  return result;
}

export function maybeSeedOnLaunch(): SeedResult | null {
  const stored = settingsGet<number>(SHIPPED_AGENTS_VERSION_KEY);
  if (stored != null && stored >= CURRENT_BUNDLED_VERSION) return null;
  return seedBundledAgents();
}

export interface ScaffoldOptions {
  projectRoot: string;
  includeSettings: boolean;
  includeClaudeMd: boolean;
  projectName?: string;
}

export interface ScaffoldResult {
  written: string[];
  skipped: string[];
}

export function scaffoldProject(opts: ScaffoldOptions): ScaffoldResult {
  const result: ScaffoldResult = { written: [], skipped: [] };
  const root = path.resolve(opts.projectRoot);
  if (!fs.existsSync(root)) {
    throw new Error(`project root not found: ${root}`);
  }

  if (opts.includeSettings) {
    const dstDir = path.join(root, ".claude");
    fs.mkdirSync(dstDir, { recursive: true });
    const dst = path.join(dstDir, "settings.json");
    if (fs.existsSync(dst)) {
      result.skipped.push(".claude/settings.json");
    } else {
      const src = path.join(templatesDir(), "starter-settings.json");
      fs.copyFileSync(src, dst);
      result.written.push(".claude/settings.json");
    }
  }

  if (opts.includeClaudeMd) {
    const dst = path.join(root, "CLAUDE.md");
    if (fs.existsSync(dst)) {
      result.skipped.push("CLAUDE.md");
    } else {
      const src = path.join(templatesDir(), "starter-claude-md.md");
      const projectName = opts.projectName ?? path.basename(root);
      const raw = fs.readFileSync(src, "utf-8");
      const filled = raw.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
      fs.writeFileSync(dst, filled, "utf-8");
      result.written.push("CLAUDE.md");
    }
  }

  return result;
}

export function readTemplate(name: "starter-settings.json" | "starter-claude-md.md"): string {
  const src = path.join(templatesDir(), name);
  return fs.readFileSync(src, "utf-8");
}
