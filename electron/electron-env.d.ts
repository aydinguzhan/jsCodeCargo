/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  ipcRenderer: import('electron').IpcRenderer
  terminal: {
    create: (options: { cwd?: string; cols: number; rows: number }) => Promise<{ terminalId: string }>
    write: (terminalId: string, data: string) => void
    resize: (terminalId: string, cols: number, rows: number) => void
    close: (terminalId: string) => Promise<void>
    runFile: (options: { filePath: string; cwd?: string; cols: number; rows: number }) => Promise<{ terminalId?: string; error?: string }>
    onData: (listener: (event: { terminalId: string; data: string }) => void) => () => void
    onExit: (listener: (event: { terminalId: string; exitCode: number; signal?: number }) => void) => () => void
  }
  appWindow: {
    create: () => Promise<{ success: boolean }>
  }
}
