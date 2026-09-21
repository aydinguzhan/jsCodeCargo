"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
  // You can expose other APTs you need here.
  // ...
});
electron.contextBridge.exposeInMainWorld("terminal", {
  create(options) {
    return electron.ipcRenderer.invoke("terminal:create", options);
  },
  write(terminalId, data) {
    electron.ipcRenderer.send("terminal:write", { terminalId, data });
  },
  resize(terminalId, cols, rows) {
    electron.ipcRenderer.send("terminal:resize", { terminalId, cols, rows });
  },
  close(terminalId) {
    return electron.ipcRenderer.invoke("terminal:close", terminalId);
  },
  runFile(options) {
    return electron.ipcRenderer.invoke("terminal:run-file", options);
  },
  onData(listener) {
    const handler = (_event, payload) => listener(payload);
    electron.ipcRenderer.on("terminal:data", handler);
    return () => electron.ipcRenderer.removeListener("terminal:data", handler);
  },
  onExit(listener) {
    const handler = (_event, payload) => listener(payload);
    electron.ipcRenderer.on("terminal:exit", handler);
    return () => electron.ipcRenderer.removeListener("terminal:exit", handler);
  }
});
electron.contextBridge.exposeInMainWorld("appWindow", {
  create() {
    return electron.ipcRenderer.invoke("window:new");
  }
});
