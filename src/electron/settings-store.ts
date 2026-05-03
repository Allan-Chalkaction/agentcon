import { app } from "electron";
import path from "node:path";
import fs from "node:fs";

let cache: Record<string, unknown> | null = null;
let cachePath: string | null = null;

function storePath(): string {
  if (cachePath) return cachePath;
  cachePath = path.join(app.getPath("userData"), "settings.json");
  return cachePath;
}

function load(): Record<string, unknown> {
  if (cache) return cache;
  try {
    const raw = fs.readFileSync(storePath(), "utf-8");
    cache = JSON.parse(raw) as Record<string, unknown>;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") {
      cache = {};
    } else {
      throw e;
    }
  }
  return cache!;
}

function persist(): void {
  if (!cache) return;
  fs.writeFileSync(storePath(), JSON.stringify(cache, null, 2), "utf-8");
}

export function settingsGet<T = unknown>(key: string): T | null {
  const data = load();
  return (data[key] as T | undefined) ?? null;
}

export function settingsSet(key: string, value: unknown): void {
  const data = load();
  data[key] = value;
  persist();
}

export function settingsDelete(key: string): void {
  const data = load();
  delete data[key];
  persist();
}

export function settingsSave(): void {
  persist();
}
