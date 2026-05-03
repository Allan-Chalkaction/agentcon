import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  settingsDelete,
  settingsGet,
  settingsSave,
  settingsSet,
} from "./settings-store";
import {
  closeAllWatchers,
  registerFsHandlers,
  setFsRenderer,
} from "./fs-bridge";
import {
  maybeSeedOnLaunch,
  readTemplate,
  scaffoldProject,
  seedBundledAgents,
  type ScaffoldOptions,
} from "./agent-seeder";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    title: "Agentcon",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.mjs"),
      contextIsolation: true,
      sandbox: false,
      nodeIntegration: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  setFsRenderer(mainWindow.webContents);

  if (process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}

function registerIpcHandlers(): void {
  ipcMain.handle("settings:get", (_evt, key: string) => settingsGet(key));
  ipcMain.handle("settings:set", (_evt, key: string, value: unknown) =>
    settingsSet(key, value),
  );
  ipcMain.handle("settings:delete", (_evt, key: string) => settingsDelete(key));
  ipcMain.handle("settings:save", () => settingsSave());

  ipcMain.handle(
    "dialog:open",
    async (
      _evt,
      opts: { directory?: boolean; multiple?: boolean; title?: string },
    ) => {
      const properties: ("openFile" | "openDirectory" | "multiSelections")[] = [];
      if (opts.directory) properties.push("openDirectory");
      else properties.push("openFile");
      if (opts.multiple) properties.push("multiSelections");

      const result = await dialog.showOpenDialog({
        title: opts.title,
        properties,
      });
      if (result.canceled || result.filePaths.length === 0) return null;
      return opts.multiple ? result.filePaths : result.filePaths[0];
    },
  );

  ipcMain.handle(
    "dialog:ask",
    async (
      _evt,
      message: string,
      opts: { title?: string; kind?: "info" | "warning" | "error" } = {},
    ) => {
      const result = await dialog.showMessageBox({
        type: opts.kind ?? "info",
        title: opts.title,
        message,
        buttons: ["Cancel", "OK"],
        defaultId: 1,
        cancelId: 0,
      });
      return result.response === 1;
    },
  );

  ipcMain.handle("opener:revealInDir", (_evt, target: string) => {
    shell.showItemInFolder(target);
  });

  registerFsHandlers();

  ipcMain.handle("claude:seedAgents", () => seedBundledAgents());
  ipcMain.handle("claude:scaffoldProject", (_e, opts: ScaffoldOptions) =>
    scaffoldProject(opts),
  );
  ipcMain.handle(
    "claude:readTemplate",
    (_e, name: "starter-settings.json" | "starter-claude-md.md") =>
      readTemplate(name),
  );
}

app.whenReady().then(() => {
  try {
    maybeSeedOnLaunch();
  } catch (e) {
    console.error("[agentcon] bundled-agent seed failed", e);
  }
  registerIpcHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  void closeAllWatchers();
});
