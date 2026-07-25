const miniPlayBtn = document.getElementById("miniPlayBtn");

const miniLang = localStorage.getItem("app_lang") || "en";
const miniTranslations = {
  en: { appName: "Hybrid Neon Player", bgPlaying: "Playing in background", playing: "PLAYING", paused: "PAUSED", ready: "READY" },
  tr: { appName: "Hybrid Neon Player", bgPlaying: "Arka planda oynatılıyor", playing: "OYNATILIYOR", paused: "DURAKLATILDI", ready: "HAZIR" },
  de: { appName: "Hybrid Neon Player", bgPlaying: "Wiedergabe im Hintergrund", playing: "WIEDERGABE", paused: "PAUSIERT", ready: "BEREIT" },
  es: { appName: "Hybrid Neon Player", bgPlaying: "Reproduciendo en segundo plano", playing: "REPRODUCIENDO", paused: "PAUSADO", ready: "LISTO" },
  fr: { appName: "Hybrid Neon Player", bgPlaying: "Lecture en arrière-plan", playing: "EN LECTURE", paused: "EN PAUSE", ready: "PRÊT" },
  ru: { appName: "Hybrid Neon Player", bgPlaying: "Воспроизведение в фоне", playing: "ВОСПРОИЗВЕДЕНИЕ", paused: "ПАУЗА", ready: "ГОТОВ" },
  ar: { appName: "Hybrid Neon Player", bgPlaying: "يُشغَّل في الخلفية", playing: "يعمل الآن", paused: "متوقف", ready: "جاهز" },
  ja: { appName: "Hybrid Neon Player", bgPlaying: "バックグラウンドで再生中", playing: "再生中", paused: "一時停止", ready: "準備完了" },
  zh: { appName: "Hybrid Neon Player", bgPlaying: "后台播放中", playing: "播放中", paused: "已暂停", ready: "就绪" }
};
function miniT(key) { return miniTranslations[miniLang]?.[key] || miniTranslations.en[key] || key; }

/* Apply mini i18n */
(function applyMiniI18n() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (key) el.textContent = miniT(key);
  });
  document.querySelectorAll("[data-i18n-title]").forEach(el => {
    const key = el.dataset.i18nTitle;
    if (key) el.title = miniT(key);
  });
})();

/* Load theme from shared localStorage */
(function applyMiniTheme() {
  const theme = localStorage.getItem("hn_theme") || "dark-neon";
  const accent = localStorage.getItem("hn_accent") || "red";
  document.body.dataset.theme = theme;
  document.body.dataset.accent = accent;
})();

const miniPrevBtn = document.getElementById("miniPrevBtn");
const miniNextBtn = document.getElementById("miniNextBtn");
const miniRestoreBtn = document.getElementById("miniRestoreBtn");
const miniCloseBtn = document.getElementById("miniCloseBtn");
const miniMuteBtn = document.getElementById("miniMuteBtn");
const miniVolumeSlider = document.getElementById("miniVolumeSlider");

const miniTitle = document.getElementById("miniTitle");
const miniSub = document.getElementById("miniSub");
const miniArt = document.getElementById("miniArt");

const miniProgress = document.getElementById("miniProgress");
const miniProgressFill = document.getElementById("miniProgressFill");

const miniCurrent = document.getElementById("miniCurrent");
const miniDuration = document.getElementById("miniDuration");
const miniState = document.getElementById("miniState");
if (miniState) miniState.textContent = miniT("ready");

function send(cmd) {
  window.api?.miniCommand?.(cmd);
}

miniPlayBtn.onclick = () => send("toggle-play");
miniPrevBtn.onclick = () => send("prev");
miniNextBtn.onclick = () => send("next");
miniRestoreBtn.onclick = () => window.api?.miniRestoreMain?.();
miniCloseBtn.onclick = () => window.api?.miniClose?.();
miniMuteBtn.onclick = () => send("mute");

miniVolumeSlider.oninput = () => {
  send({
    type: "volume",
    value: Number(miniVolumeSlider.value)
  });
};

miniProgress.onclick = (e) => {
  const rect = miniProgress.getBoundingClientRect();
  const percent = ((e.clientX - rect.left) / rect.width) * 100;

  send({
    type: "seek",
    percent
  });
};

function formatTime(sec) {
  if (!Number.isFinite(sec)) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

window.api?.onMiniPlayerState?.((state) => {
  if (!state) return;

  miniTitle.textContent = state.title || miniT("appName");
  miniSub.textContent = state.sub || miniT("bgPlaying");
  miniPlayBtn.innerHTML = state.playing
    ? '<svg viewBox="0 0 24 24" width="18" height="18"><rect x="6" y="4" width="4" height="16" rx="1.5" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1.5" fill="currentColor"/></svg>'
    : '<svg viewBox="0 0 24 24" width="18" height="18"><polygon points="8,4 20,12 8,20" fill="currentColor"/></svg>';

  miniProgressFill.style.width = `${Math.max(0, Math.min(100, state.progress || 0))}%`;

  miniCurrent.textContent = formatTime(state.currentTime || 0);
  miniDuration.textContent = formatTime(state.duration || 0);
  miniState.textContent = state.playing ? miniT("playing") : miniT("paused");

  miniMuteBtn.innerHTML = state.muted
    ? '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M16.5 12A4.5 4.5 0 0 0 14 8.3v1.5l2.3 2.3c.06-.16.1-.33.1-.5z" fill="currentColor"/><path d="M19 12c0 1.6-.5 3.1-1.4 4.3l1.4 1.4c1.2-1.6 1.9-3.6 1.9-5.7s-.7-4.1-1.9-5.7l-1.4 1.4c.9 1.2 1.4 2.7 1.4 4.3z" fill="currentColor"/><path d="M4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" fill="currentColor"/></svg>'
    : '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor"/><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63z" fill="currentColor"/><path d="M19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.8 8.8 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71z" fill="currentColor"/><path d="M4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" fill="currentColor"/></svg>';

  if (Number.isFinite(state.volume)) {
    miniVolumeSlider.value = String(state.volume);
  }

  if (state.thumb) {
    miniArt.textContent = "";
    miniArt.style.backgroundImage = `url("${state.thumb}")`;
  } else {
    miniArt.style.backgroundImage = "";
    miniArt.textContent = state.type === "audio" ? "♪" : "▶";
  }
});

const miniShellForExpand = document.getElementById("miniShell");

if (miniShellForExpand && !window.__miniExpandFixed) {
  window.__miniExpandFixed = true;

  let miniExpandTimer = null;

  miniShellForExpand.addEventListener("mouseenter", () => {
    clearTimeout(miniExpandTimer);
    miniShellForExpand.classList.add("expanded");
  });

  miniShellForExpand.addEventListener("mouseleave", () => {
    miniExpandTimer = setTimeout(() => {
      miniShellForExpand.classList.remove("expanded");
    }, 120);
  });
}

/* Sync theme when main window changes it */
window.addEventListener("storage", (e) => {
  if (e.key === "hn_theme") {
    document.body.dataset.theme = e.newValue || "dark-neon";
  }
  if (e.key === "hn_accent") {
    document.body.dataset.accent = e.newValue || "red";
  }
});
