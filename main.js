const { shell } = require("electron");
const { spawn } = require("child_process");
const YTDlpWrap = require("yt-dlp-wrap").default;
const { app, BrowserWindow, ipcMain, dialog, screen, Notification } = require("electron");
const path = require("path");
const fs = require("fs");
const http = require("http");
const https = require("https");
const crypto = require("crypto");
const os = require("os");
const youtubeSearchApi = require("youtube-search-api");

const GITHUB_REPO = "halil-guzelkaya/HybridNeonPlayer";
const APP_VERSION = require("./package.json").version;

ipcMain.handle("open-external-url", (_event, url) => {
  if (typeof url === "string" && url.startsWith("http")) shell.openExternal(url);
});

let mainWindow;
let miniWindow;
let remoteServer;
let remoteWss;
let remoteEnabled = false;
const REMOTE_PORT = 9120;

let lastPlayerState = {
  hasMedia: false,
  playing: false
};

const binDir = path.join(__dirname, "bin");
const ytdlpPath = path.join(binDir, "yt-dlp.exe");
const ytdlp = new YTDlpWrap(ytdlpPath);

if (process.platform === "win32") {
  app.setAppUserModelId("com.halil.hybridneonplayer");
}

async function ensureYtDlp() {
  if (fs.existsSync(ytdlpPath)) return;

  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir);
  }

  await YTDlpWrap.downloadFromGithub(ytdlpPath);
}

function shouldOpenMiniPlayer() {
  return !!(lastPlayerState?.hasMedia && lastPlayerState?.playing);
}

function shouldKeepMiniPlayer() {
  return !!lastPlayerState?.hasMedia;
}

function snapMiniPlayerToTopCenter() {
  if (!miniWindow || miniWindow.isDestroyed()) return;

  const display = screen.getPrimaryDisplay();
  const workArea = display.workArea;
  const bounds = miniWindow.getBounds();

  miniWindow.setBounds({
    x: Math.round(workArea.x + (workArea.width - bounds.width) / 2),
    y: workArea.y + 14,
    width: bounds.width,
    height: bounds.height
  });
}

/* =========================================================
   REMOTE CONTROL SERVER (HTTP + WebSocket, zero deps)
   ========================================================= */

function getLanIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "127.0.0.1";
}

function acceptWebSocket(req, socket) {
  const key = req.headers["sec-websocket-key"];
  if (!key) { socket.destroy(); return null; }

  const accept = crypto
    .createHash("sha1")
    .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
    .digest("base64");

  socket.write(
    "HTTP/1.1 101 Switching Protocols\r\n" +
    "Upgrade: websocket\r\n" +
    "Connection: Upgrade\r\n" +
    "Sec-WebSocket-Accept: " + accept + "\r\n\r\n"
  );
  return socket;
}

function sendWsFrame(socket, data) {
  const payload = Buffer.from(data, "utf8");
  const len = payload.length;
  let header;

  if (len < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x81;
    header[1] = len;
  } else if (len < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }

  try { socket.write(Buffer.concat([header, payload])); } catch {}
}

function parseWsFrame(buf) {
  if (buf.length < 2) return null;

  const opcode = buf[0] & 0x0f;
  const masked = (buf[1] & 0x80) !== 0;
  let payloadLen = buf[1] & 0x7f;
  let offset = 2;

  if (payloadLen === 126) {
    if (buf.length < 4) return null;
    payloadLen = buf.readUInt16BE(2);
    offset = 4;
  } else if (payloadLen === 127) {
    if (buf.length < 10) return null;
    payloadLen = Number(buf.readBigUInt64BE(2));
    offset = 10;
  }

  if (masked) {
    if (buf.length < offset + 4) return null;
    const mask = buf.slice(offset, offset + 4);
    offset += 4;
  }

  if (buf.length < offset + payloadLen) return null;

  let payload = buf.slice(offset, offset + payloadLen);
  if (masked) {
    const mask = buf.slice(offset - 4, offset);
    for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i % 4];
  }

  return { opcode, payload, totalLen: offset + payloadLen };
}

function startRemoteServer() {
  if (remoteServer) return;

  const remoteHtmlPath = path.join(__dirname, "src", "remote.html");
  const remoteHtml = fs.readFileSync(remoteHtmlPath, "utf8");

  remoteServer = http.createServer((req, res) => {
    if (req.url === "/" || req.url.startsWith("/?")) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(remoteHtml);
    } else {
      res.writeHead(404);
      res.end("Not found");
    }
  });

  remoteWss = new Set();

  remoteServer.on("upgrade", (req, socket, head) => {
    if (req.url !== "/ws") { socket.destroy(); return; }

    const client = acceptWebSocket(req, socket);
    if (!client) return;

    remoteWss.add(client);

    // Send current state immediately
    if (lastPlayerState) {
      sendWsFrame(client, JSON.stringify({ type: "state", ...lastPlayerState }));
    }

    let buf = Buffer.alloc(0);

    client.on("data", (chunk) => {
      buf = Buffer.concat([buf, chunk]);

      while (buf.length >= 2) {
        const frame = parseWsFrame(buf);
        if (!frame) break;

        buf = buf.slice(frame.totalLen);

        if (frame.opcode === 0x08) {
          client.destroy();
          return;
        }

        if (frame.opcode === 0x01) {
          try {
            const msg = JSON.parse(frame.payload.toString("utf8"));
            handleRemoteCommand(msg, client);
          } catch {}
        }
      }
    });

    client.on("close", () => {
      remoteWss.delete(client);
    });

    client.on("error", () => {
      remoteWss.delete(client);
    });
  });

  remoteServer.listen(REMOTE_PORT, "0.0.0.0", () => {
    console.log(`Remote control server: http://${getLanIp()}:${REMOTE_PORT}`);
  });

  remoteServer.on("error", (err) => {
    console.error("Remote server error:", err.message);
    remoteServer = null;
  });
}

function stopRemoteServer() {
  if (remoteWss) {
    for (const client of remoteWss) {
      try { client.destroy(); } catch {}
    }
    remoteWss.clear();
  }
  if (remoteServer) {
    try { remoteServer.close(); } catch {}
    remoteServer = null;
  }
}

let _broadcastTimer = null;
let _lastBroadcastState = null;

function broadcastToRemotes(state) {
  if (!remoteWss || remoteWss.size === 0) return;
  _lastBroadcastState = state;
  if (_broadcastTimer) return;
  _broadcastTimer = setTimeout(() => {
    _broadcastTimer = null;
    if (!_lastBroadcastState || !remoteWss || remoteWss.size === 0) return;
    const msg = JSON.stringify({ type: "state", ..._lastBroadcastState });
    for (const client of remoteWss) {
      sendWsFrame(client, msg);
    }
  }, 100);
}

function handleRemoteCommand(msg) {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  switch (msg.cmd) {
    case "toggle-play":
      mainWindow.webContents.send("remote-command", "toggle-play");
      break;
    case "prev":
      mainWindow.webContents.send("remote-command", "prev");
      break;
    case "next":
      mainWindow.webContents.send("remote-command", "next");
      break;
    case "mute":
      mainWindow.webContents.send("remote-command", "mute");
      break;
    case "seek-back":
      mainWindow.webContents.send("remote-command", "seek-back");
      break;
    case "seek-forward":
      mainWindow.webContents.send("remote-command", "seek-forward");
      break;
    case "speed":
      mainWindow.webContents.send("remote-command", "speed");
      break;
    case "shuffle":
      mainWindow.webContents.send("remote-command", "shuffle");
      break;
    case "fullscreen":
      if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
      break;
    case "seek":
      if (typeof msg.pct === "number") {
        mainWindow.webContents.send("remote-command", { cmd: "seek", pct: msg.pct });
      }
      break;
    case "volume":
      if (typeof msg.value === "number") {
        mainWindow.webContents.send("remote-command", { cmd: "volume", value: msg.value });
      }
      break;
  }

  mainWindow.webContents.send("remote-sync");
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1250,
    height: 760,
    minWidth: 980,
    minHeight: 620,
    backgroundColor: "#050814",
    title: "Hybrid Neon Player",
    frame: false,
    titleBarStyle: "hidden",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, "src", "index.html"));

  mainWindow.on("minimize", (event) => {
    if (!shouldOpenMiniPlayer()) return;

    event.preventDefault();
    mainWindow.hide();
    createMiniPlayer();
  });

  mainWindow.on("close", () => {
    if (miniWindow && !miniWindow.isDestroyed()) {
      miniWindow.close();
    }
  });
}

function createMiniPlayer() {
  if (!shouldOpenMiniPlayer()) return;

  if (miniWindow && !miniWindow.isDestroyed()) {
    miniWindow.show();
    miniWindow.focus();
    snapMiniPlayerToTopCenter();
    return;
  }

  const display = screen.getPrimaryDisplay();
  const workArea = display.workArea;

  const width = 900;
  const height = 104;

  miniWindow = new BrowserWindow({
    width,
    height,
    x: Math.round(workArea.x + (workArea.width - width) / 2),
    y: workArea.y + 14,
    minWidth: width,
    minHeight: height,
    maxWidth: width,
    maxHeight: height,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    resizable: false,
    movable: true,
    alwaysOnTop: false,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  miniWindow.loadFile(path.join(__dirname, "src", "mini-player.html"));

  miniWindow.once("ready-to-show", () => {
    if (!shouldKeepMiniPlayer()) {
      miniWindow.close();
      return;
    }

    snapMiniPlayerToTopCenter();

    miniWindow.show();
    mainWindow?.webContents.send("mini-request-state");
  });

  miniWindow.on("closed", () => {
    miniWindow = null;
  });
}

function restoreMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  mainWindow.show();
  mainWindow.restore();
  mainWindow.focus();

  if (miniWindow && !miniWindow.isDestroyed()) {
    miniWindow.hide();
  }
}

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("open-media-files", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Select media files",
    properties: ["openFile", "multiSelections"],
    filters: [
      {
        name: "Media",
        extensions: ["mp4", "mkv", "webm", "mov", "avi", "mp3", "wav", "ogg", "flac"]
      }
    ]
  });

  if (result.canceled) return [];
  return result.filePaths;
});

ipcMain.handle("search-youtube", async (_event, query) => {
  try {
    console.log("ARAMA GELDİ:", query);

    const result = await youtubeSearchApi.GetListByKeyword(query, false, 30);

    const rawItems = result?.items || result?.data || [];

    const videos = rawItems
      .filter(item => item?.type === "video" || item?.id || item?.videoId)
      .map(video => {
        const videoId =
          video.id ||
          video.videoId ||
          video?.navigationEndpoint?.watchEndpoint?.videoId;

        return {
          title: video.title || video.name || "Untitled",
          url: videoId
            ? `https://www.youtube.com/watch?v=${videoId}`
            : video.url || "",
          thumb:
            video.thumbnail?.thumbnails?.at(-1)?.url ||
            video.thumbnail?.url ||
            video.thumbnails?.at(-1)?.url ||
            "",
          duration:
            video.length?.simpleText ||
            video.duration ||
            "",
          author:
            video.channelTitle ||
            video.channel?.name ||
            video.author ||
            ""
        };
      })
      .filter(v => v.url);

    console.log("BULUNAN VIDEO:", videos.length);

    return {
      ok: true,
      videos
    };

  } catch (err) {
    console.error("SEARCH ERROR:", err);

    return {
      ok: false,
      error: err.message || "YouTube araması başarısız."
    };
  }
});

ipcMain.handle("resolve-online-media", async (_event, url) => {
  try {
    await ensureYtDlp();

    const result = await ytdlp.execPromise([
  url,
  "--no-playlist",
  "--js-runtimes",
  "deno",
  "-f",
  "best[ext=mp4][vcodec!=none][acodec!=none]/best[vcodec!=none][acodec!=none]/best",
  "-g"
]);

    const directUrl = result
      .trim()
      .split("\n")
      .find(line => line.startsWith("http"));

    if (!directUrl) {
      return {
        ok: false,
        error: "Oynatılabilir video linki bulunamadı."
      };
    }

    return {
      ok: true,
      url: directUrl
    };

  } catch (err) {
    return {
      ok: false,
      error: err.message || "Online video çözülemedi."
    };
  }
});

ipcMain.on("window-minimize", () => {
  if (!mainWindow) return;

  if (shouldOpenMiniPlayer()) {
    mainWindow.hide();
    createMiniPlayer();
  } else {
    mainWindow.minimize();
  }
});

ipcMain.on("window-maximize", () => {
  if (!mainWindow) return;

  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on("window-close", () => {
  mainWindow?.close();
});

/* MINI PLAYER IPC */

ipcMain.on("mini-restore-main", () => {
  restoreMainWindow();
});

ipcMain.on("mini-close", () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("mini-command", "pause");
  }
  if (miniWindow && !miniWindow.isDestroyed()) {
    miniWindow.close();
  }
});

ipcMain.on("mini-command", (_event, command) => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send("mini-command", command);
});

ipcMain.on("main-player-state", (_event, state) => {
  lastPlayerState = {
    ...lastPlayerState,
    ...state
  };

  if (!shouldKeepMiniPlayer() && miniWindow && !miniWindow.isDestroyed()) {
    miniWindow.close();
    return;
  }

  if (miniWindow && !miniWindow.isDestroyed()) {
    miniWindow.webContents.send("mini-player-state", lastPlayerState);
  }

  broadcastToRemotes(lastPlayerState);
});


/* WINDOWS NATIVE NOTIFICATION */
ipcMain.on("notify-track", (_event, data) => {
  if (!Notification.isSupported()) return;

  const title = data?.title || "Hybrid Neon Player";
  const body = data?.body || data?.sub || "";

  const notification = new Notification({
    title,
    body,
    silent: false
  });

  notification.on("click", () => {
    restoreMainWindow();
  });

  notification.show();
});

/* =========================================================
   DOWNLOAD SYSTEM (VIDEO + MP3)
   ========================================================= */

ipcMain.handle("download-media", async (event, data) => {
  try {
    await ensureYtDlp();

    const { url, type, id } = data;
    const sender = event.sender;

    const downloadsDir = path.join(__dirname, "downloads");

    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir);
    }

    const outputTemplate = path.join(downloadsDir, "%(title)s.%(ext)s");

    const args = [
      url,
      "--newline",
      "--no-playlist",
      "-o",
      outputTemplate
    ];

    if (type === "mp3") {
      args.push("--extract-audio", "--audio-format", "mp3");
    } else {
      args.push("-f", "best[ext=mp4][vcodec!=none][acodec!=none]/best", "--merge-output-format", "mp4");
    }

    const proc = spawn(ytdlpPath, args);

    proc.stdout.on("data", (chunk) => {
      const text = chunk.toString();

      const match = text.match(/(\d{1,3}(?:\.\d+)?)%/);

      if (match) {
        const percent = Number(match[1]);

        sender.send("download-progress", {
          id,
          percent,
          status: `İndiriliyor ${percent.toFixed(1)}%`
        });
      }
    });

    proc.stderr.on("data", (chunk) => {
      console.log("DOWNLOAD STDERR:", chunk.toString());
    });

    return await new Promise((resolve) => {
      proc.on("close", (code) => {
        if (code === 0) {
          sender.send("download-progress", {
            id,
            percent: 100,
            status: "Tamamlandı ✔"
          });

          resolve({ ok: true });
        } else {
          sender.send("download-progress", {
            id,
            percent: 0,
            status: "Başarısız ❌"
          });

          resolve({
            ok: false,
            error: "Download failed."
          });
        }
      });
    });

  } catch (err) {
    return {
      ok: false,
      error: err.message
    };
  }
});

ipcMain.on("open-downloads-folder", () => {
  const downloadsDir = path.join(__dirname, "downloads");

  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir);
  }

  shell.openPath(downloadsDir);
});

/* REMOTE CONTROL IPC */
ipcMain.handle("remote-toggle", (_event, enable) => {
  remoteEnabled = enable;
  if (enable) {
    startRemoteServer();
  } else {
    stopRemoteServer();
  }
  return { ok: true, enabled: remoteEnabled };
});

ipcMain.handle("remote-status", () => {
  const ip = getLanIp();
  return {
    enabled: remoteEnabled,
    running: !!remoteServer,
    ip,
    port: REMOTE_PORT,
    url: `http://${ip}:${REMOTE_PORT}`
  };
});

/* ===== UPDATE CHECK (GitHub Releases) ===== */

function compareVersions(a, b) {
  const pa = a.replace(/^v/, "").split(".").map(Number);
  const pb = b.replace(/^v/, "").split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1;
    if ((pa[i] || 0) < (pb[i] || 0)) return -1;
  }
  return 0;
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { "User-Agent": "HybridNeonPlayer" } }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        return httpsGet(res.headers.location).then(resolve, reject);
      }
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        if (res.statusCode >= 400) return reject(new Error("HTTP " + res.statusCode));
        resolve(data);
      });
    });
    req.on("error", reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error("timeout")); });
  });
}

ipcMain.handle("check-for-update", async () => {
  try {
    const raw = await httpsGet(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
    const release = JSON.parse(raw);
    const latestVersion = (release.tag_name || "").replace(/^v/, "");
    const currentVersion = APP_VERSION;
    const hasUpdate = compareVersions(latestVersion, currentVersion) > 0;

    let assetUrl = null;
    let assetName = null;
    if (release.assets && release.assets.length > 0) {
      for (const a of release.assets) {
        if (a.name && a.name.endsWith(".exe")) {
          assetUrl = a.browser_download_url;
          assetName = a.name;
          break;
        }
      }
      if (!assetUrl && release.assets[0]) {
        assetUrl = release.assets[0].browser_download_url;
        assetName = release.assets[0].name;
      }
    }

    return {
      hasUpdate,
      currentVersion,
      latestVersion,
      releaseName: release.name || latestVersion,
      body: release.body || "",
      url: release.html_url || `https://github.com/${GITHUB_REPO}/releases/latest`,
      assetUrl,
      assetName,
      publishedAt: release.published_at || ""
    };
  } catch (err) {
    const msg = err.message || "";
    if (msg.includes("404")) {
      return { hasUpdate: false, noRelease: true, currentVersion: APP_VERSION };
    }
    return { hasUpdate: false, error: msg, currentVersion: APP_VERSION };
  }
});

/* ===== DOWNLOAD UPDATE ===== */

ipcMain.handle("download-update", async (_event, url) => {
  if (!url) return { error: "No URL" };

  const updateDir = path.join(app.getPath("downloads"), "HybridNeonPlayer-Update");
  if (!fs.existsSync(updateDir)) fs.mkdirSync(updateDir, { recursive: true });

  const fileName = url.split("/").pop() || "update.exe";
  const destPath = path.join(updateDir, fileName);

  try {
    await new Promise((resolve, reject) => {
      const file = fs.createWriteStream(destPath);

      const doRequest = (downloadUrl) => {
        const proto = downloadUrl.startsWith("https") ? https : http;
        proto.get(downloadUrl, (res) => {
          if (res.statusCode === 302 || res.statusCode === 301) {
            doRequest(res.headers.location);
            return;
          }
          if (res.statusCode >= 400) {
            reject(new Error("HTTP " + res.statusCode));
            return;
          }
          const total = parseInt(res.headers["content-length"] || "0", 10);
          let downloaded = 0;
          res.on("data", (chunk) => {
            downloaded += chunk.length;
            if (mainWindow && !mainWindow.isDestroyed()) {
              const pct = total > 0 ? Math.round((downloaded / total) * 100) : -1;
              mainWindow.webContents.send("update-download-progress", { pct, downloaded, total });
            }
          });
          res.pipe(file);
          file.on("finish", () => { file.close(resolve); });
        }).on("error", (err) => { fs.unlink(destPath, () => {}); reject(err); });
      };

      doRequest(url);
    });

    return { success: true, path: destPath };
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle("install-update", (_event, filePath) => {
  if (!filePath || !fs.existsSync(filePath)) return { error: "File not found" };
  shell.openExternal(filePath);
  app.quit();
  return { success: true };
});