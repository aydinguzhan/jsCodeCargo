import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...

})

contextBridge.exposeInMainWorld("terminal", {
  create(options: { cwd?: string; cols: number; rows: number }) {
    return ipcRenderer.invoke("terminal:create", options)
  },
  write(terminalId: string, data: string) {
    ipcRenderer.send("terminal:write", { terminalId, data })
  },
  resize(terminalId: string, cols: number, rows: number) {
    ipcRenderer.send("terminal:resize", { terminalId, cols, rows })
  },
  close(terminalId: string) {
    return ipcRenderer.invoke("terminal:close", terminalId)
  },
  runFile(options: { filePath: string; cwd?: string; cols: number; rows: number }) {
    return ipcRenderer.invoke("terminal:run-file", options)
  },
  onData(listener: (event: { terminalId: string; data: string }) => void) {
    const handler = (_event: Electron.IpcRendererEvent, payload: { terminalId: string; data: string }) => listener(payload)
    ipcRenderer.on("terminal:data", handler)
    return () => ipcRenderer.removeListener("terminal:data", handler)
  },
  onExit(listener: (event: { terminalId: string; exitCode: number; signal?: number }) => void) {
    const handler = (_event: Electron.IpcRendererEvent, payload: { terminalId: string; exitCode: number; signal?: number }) => listener(payload)
    ipcRenderer.on("terminal:exit", handler)
    return () => ipcRenderer.removeListener("terminal:exit", handler)
  },
})

contextBridge.exposeInMainWorld("appWindow", {
  create() {
    return ipcRenderer.invoke("window:new")
  },
})
