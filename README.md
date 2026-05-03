# Agentcon

A standalone macOS app for configuring Claude Code. Edit your agents, skills, slash commands, CLAUDE.md, hooks, permissions, env vars, MCP servers, and plugins from a single window — at user, project, or local scope.

## Stack

- Electron 41 + React 19 + TypeScript + Vite (via electron-vite)
- Monaco Editor for CLAUDE.md and raw JSON editing
- chokidar for live-watching `~/.claude` and the active project's `.claude/` dir
- Path-allowlisted IPC bridge between renderer and main process — the renderer never touches disk directly

## Development

    npm install
    npm run dev

`electron-vite dev` builds the main + preload bundles, starts the Vite renderer dev server on port 1420, and launches Electron.

## Packaging

    npm run package

Produces a `.dmg` and `.zip` under `release/` (arm64 only by default). Code signing + notarization will be wired up after Apple Developer ID + DUNS enrollment.

## Repository layout

- `src/` — React renderer (Vite)
- `src/electron/` — Electron main process + preload script
- `src/panels/claude-settings/` — the configurator UI (one tab per surface)
- `src/stores/claudeConfigStore.ts` — Zustand store wrapping the fs bridge
- `src/services/claude-config-parser.ts` — YAML + JSON parsers/serializers for Claude Code config files
- `resources/` — starter templates, bundled agents, icons (bundled into the packaged app)
- `build/` — entitlements and other electron-builder inputs

## Architecture

The renderer reaches the OS only through `window.agentcon`, exposed by `src/electron/preload.ts` under `contextIsolation`. The surface is: `settings`, `dialog`, `opener`, `fs`, `claude`.

The `fs` bridge is path-allowlisted: it only permits reads/writes inside `~/.claude/`, `<activeProjectRoot>/.claude/`, the user's `~/.claude.json`, and the project's `CLAUDE.md`. Anything else is rejected.

The currently-selected project folder is persisted via `settings:set` under `lastProjectPath` and restored on relaunch.
