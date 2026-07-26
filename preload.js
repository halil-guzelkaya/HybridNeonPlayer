const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  windowMinimize: () => ipcRenderer.send("window-minimize"),
  windowMaximize: () => ipcRenderer.send("window-maximize"),
  windowClose: () => ipcRenderer.send("window-close"),

  openDownloadsFolder: () => ipcRenderer.send("open-downloads-folder"),
  openMediaFiles: () => ipcRenderer.invoke("open-media-files"),
  searchYouTube: (query) => ipcRenderer.invoke("search-youtube", query),
  resolveOnlineMedia: (url) => ipcRenderer.invoke("resolve-online-media", url),

  notifyTrack: (data) => ipcRenderer.send("notify-track", data),
  downloadMedia: (data) => ipcRenderer.invoke("download-media", data),

  onDownloadProgress: (callback) =>
  ipcRenderer.on("download-progress", (_e, data) => callback(data)),

  sendMainPlayerState: (state) => ipcRenderer.send("main-player-state", state),
  onMiniCommand: (callback) => ipcRenderer.on("mini-command", (_e, command) => callback(command)),
  onMiniRequestState: (callback) => ipcRenderer.on("mini-request-state", callback),

  miniRestoreMain: () => ipcRenderer.send("mini-restore-main"),
  miniClose: () => ipcRenderer.send("mini-close"),
  miniCommand: (command) => ipcRenderer.send("mini-command", command),
  onMiniPlayerState: (callback) => ipcRenderer.on("mini-player-state", (_e, state) => callback(state)),

  remoteToggle: (enable) => ipcRenderer.invoke("remote-toggle", enable),
  remoteStatus: () => ipcRenderer.invoke("remote-status"),
  onRemoteCommand: (callback) => ipcRenderer.on("remote-command", (_e, command) => callback(command)),
  onRemoteSync: (callback) => ipcRenderer.on("remote-sync", () => callback()),
  checkForUpdate: () => ipcRenderer.invoke("check-for-update"),
  downloadUpdate: (url) => ipcRenderer.invoke("download-update", url),
  installUpdate: (filePath) => ipcRenderer.invoke("install-update", filePath),
  onUpdateDownloadProgress: (callback) =>
    ipcRenderer.on("update-download-progress", (_e, data) => callback(data)),
  openURL: (url) => ipcRenderer.invoke("open-external-url", url)
});