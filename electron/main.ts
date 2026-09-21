import { app, BrowserWindow, ipcMain } from 'electron'
// import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from "node:fs/promises";
import dotenv from "dotenv";
import {
  closeAllTerminals,
  closeTerminal,
  closeTerminalsFor,
  createTerminal,
  resizeTerminal,
  runFileTerminal,
  writeTerminal,
} from "./terminal";
import {
  createNewFile,
  openFile,
  openWorkspace,
  findWorkspaceFiles,
  searchWorkspaceText,
  readFile,
  readWorkspaceDirectory,
  writeFile,
} from './fs';
import { createCommit, getGitOverview, pushCurrentBranch, stageAll, stageFile, unstageFile } from "./git";

dotenv.config();
// const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let mainWindow: BrowserWindow | null = null
const windows = new Set<BrowserWindow>()
const workspaceRoots = new Map<number, string>()
const settingsFilePath = () => path.join(app.getPath("userData"), "jscargocode-settings.json")

async function readSavedTheme() {
  try {
    const settings = JSON.parse(await fs.readFile(settingsFilePath(), "utf-8")) as { theme?: string };
    return settings.theme === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

async function saveTheme(theme: "light" | "dark") {
  await fs.mkdir(app.getPath("userData"), { recursive: true });
  await fs.writeFile(settingsFilePath(), JSON.stringify({ theme }), "utf-8");
}

function isPathInWorkspace(workspaceRoot: string, requestedPath: string) {
  const relativePath = path.relative(path.resolve(workspaceRoot), path.resolve(requestedPath));
  return relativePath === "" || (!relativePath.startsWith(`..${path.sep}`) && relativePath !== ".." && !path.isAbsolute(relativePath));
}

function isWorkspaceRelativeFile(workspaceRoot: string, filePath: string) {
  return !path.isAbsolute(filePath) && isPathInWorkspace(workspaceRoot, path.resolve(workspaceRoot, filePath));
}

function createWindow() {
  const newWindow = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })
  windows.add(newWindow)
  mainWindow ??= newWindow
  const windowWebContents = newWindow.webContents;
  newWindow.on("closed", () => {
    closeTerminalsFor(windowWebContents)
    workspaceRoots.delete(windowWebContents.id)
    windows.delete(newWindow)
    if (mainWindow === newWindow) {
      mainWindow = null
    }
  })


  if (VITE_DEV_SERVER_URL) {
    newWindow.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    newWindow.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  return newWindow
}

function registerIpcHandlers() {
  ipcMain.handle("terminal:create", createTerminal);
  ipcMain.on(
    "terminal:write",
    (event, { terminalId, data }: { terminalId: string; data: string }) =>
      writeTerminal(event, terminalId, data),
  );
  ipcMain.on(
    "terminal:resize",
    (event, { terminalId, cols, rows }: { terminalId: string; cols: number; rows: number }) =>
      resizeTerminal(event, terminalId, cols, rows),
  );
  ipcMain.handle("terminal:close", closeTerminal);
  ipcMain.handle("terminal:run-file", runFileTerminal);
  ipcMain.handle("window:new", () => {
    createWindow()
    return { success: true }
  });
  ipcMain.handle("settings:theme:get", readSavedTheme);
  ipcMain.handle("settings:theme:set", (_, theme: "light" | "dark") => saveTheme(theme));
  ipcMain.handle("create:file", createNewFile);
  ipcMain.handle("write:file", (_, filePath: string, content: string) =>
    writeFile(filePath, content),
  );
  ipcMain.handle("workspace:open", async (event) => {
    const result = await openWorkspace();
    if (result.success && result.rootPath) {
      workspaceRoots.set(event.sender.id, result.rootPath);
    }
    return result;
  });
  ipcMain.handle("workspace:restore-root", (event, rootPath: string) => {
    if (!rootPath) {
      return false;
    }
    // Vite geliştirme modunda ana süreç yeniden başlatılabilir; renderer'daki açık
    // çalışma alanını aynı pencere için tekrar ilişkilendiriyoruz.
    workspaceRoots.set(event.sender.id, rootPath);
    return true;
  });
  ipcMain.handle("workspace:read-directory", (event, directoryPath: string) => {
    const workspaceRoot = workspaceRoots.get(event.sender.id);
    if (!workspaceRoot || !isPathInWorkspace(workspaceRoot, directoryPath)) {
      return [];
    }
    return readWorkspaceDirectory(directoryPath);
  });
  ipcMain.handle("workspace:find-files", (event, rootPath: string, query: string) => {
    const workspaceRoot = workspaceRoots.get(event.sender.id);
    if (!workspaceRoot || path.resolve(rootPath) !== path.resolve(workspaceRoot)) {
      return [];
    }
    return findWorkspaceFiles(workspaceRoot, query);
  });
  ipcMain.handle("workspace:search-text", (event, rootPath: string, query: string) => {
    const workspaceRoot = workspaceRoots.get(event.sender.id);
    if (!workspaceRoot || path.resolve(rootPath) !== path.resolve(workspaceRoot)) {
      return [];
    }
    return searchWorkspaceText(workspaceRoot, query);
  });
  ipcMain.handle("git:overview", (event) => {
    const workspaceRoot = workspaceRoots.get(event.sender.id);
    return workspaceRoot ? getGitOverview(workspaceRoot) : { isRepository: false, changes: [], commits: [], branch: null, ahead: 0, behind: 0, canPush: false, hasUpstream: false };
  });
  ipcMain.handle("git:stage-all", async (event) => {
    const workspaceRoot = workspaceRoots.get(event.sender.id);
    return workspaceRoot ? stageAll(workspaceRoot) : { success: false, error: "Open a workspace first" };
  });
  ipcMain.handle("git:stage-file", (event, filePath: string) => {
    const workspaceRoot = workspaceRoots.get(event.sender.id);
    if (!workspaceRoot || !isWorkspaceRelativeFile(workspaceRoot, filePath)) return { success: false, error: "Invalid workspace file" };
    return stageFile(workspaceRoot, filePath);
  });
  ipcMain.handle("git:unstage-file", (event, filePath: string) => {
    const workspaceRoot = workspaceRoots.get(event.sender.id);
    if (!workspaceRoot || !isWorkspaceRelativeFile(workspaceRoot, filePath)) return { success: false, error: "Invalid workspace file" };
    return unstageFile(workspaceRoot, filePath);
  });
  ipcMain.handle("git:commit", async (event, message: string) => {
    const workspaceRoot = workspaceRoots.get(event.sender.id);
    if (!workspaceRoot) return { success: false, error: "Open a workspace first" };
    if (!message.trim()) return { success: false, error: "Commit message is required" };
    return createCommit(workspaceRoot, message.trim());
  });
  ipcMain.handle("git:push", (event) => {
    const workspaceRoot = workspaceRoots.get(event.sender.id);
    return workspaceRoot ? pushCurrentBranch(workspaceRoot) : { success: false, error: "Open a workspace first" };
  });
  ipcMain.handle("file:open", openFile);
  ipcMain.handle("file:read", (_, filePath: string) => readFile(filePath));
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    mainWindow = null
    windows.clear()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (windows.size === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  registerIpcHandlers()
  createWindow()
})

app.on("before-quit", closeAllTerminals)
