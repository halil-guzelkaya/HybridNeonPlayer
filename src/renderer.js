const resolveCache = new Map();

const player = document.getElementById("player");

const openFilesBtn = document.getElementById("openFilesBtn");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const onlineGrid = document.getElementById("onlineGrid");
const onlineResultCount = document.getElementById("onlineResultCount");

const playlistEl = document.getElementById("playlist");
const mediaTitle = document.getElementById("mediaTitle");
const mediaDesc = document.getElementById("mediaDesc");
const libraryCount = document.getElementById("libraryCount");

const minimizeBtn = document.getElementById("minimizeBtn");
const maximizeBtn = document.getElementById("maximizeBtn");
const closeBtn = document.getElementById("closeBtn");

const hero = document.querySelector(".hero");
const heroPlayBtn = document.getElementById("heroPlayBtn");
const centerPlayBtn = document.getElementById("centerPlayBtn");
const toggleControlsBtn = document.getElementById("toggleControlsBtn");

const playPauseBtn = document.getElementById("playPauseBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const muteBtn = document.getElementById("muteBtn");
const back10Btn = document.getElementById("back10Btn");
const forward10Btn = document.getElementById("forward10Btn");
const speedBtn = document.getElementById("speedBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const seekbar = document.getElementById("seekbar");
const seekFill = document.getElementById("seekFill");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const volumeSlider = document.getElementById("volumeSlider");
const cockpitTitle = document.getElementById("cockpitTitle");
const cockpitSub = document.getElementById("cockpitSub");
const cockpitType = document.getElementById("cockpitType");
const cockpitSpeed = document.getElementById("cockpitSpeed");
const cockpitVol = document.getElementById("cockpitVol");
const cockpitCover = document.getElementById("cockpitCover");

const clearPlaylistBtn = document.getElementById("clearPlaylistBtn");

let playlist = [];
let activeIndex = -1;
let currentLang = localStorage.getItem("app_lang") || "en";
let hideTimer = null;
let settings = null;

const translations = {
  en: {
    nowPlaying: "Now Playing",
    noMedia: "No media selected",
    desc: "Open local media or search YouTube.",
    play: "▶ Play",
    pause: "⏸ Pause",
    controls: "Controls",
    showControls: "Show Controls",
    clear: "Clear",
    items: "items",
    searching: "⏳",
    searchIcon: "🔍",
    searchFailed: "Search failed.",
    resolveFailed: "Video could not be resolved.",

    topSearch: "Search YouTube...",
    library: "Library",
    ready: "Ready",
    idle: "IDLE",

    settingsTitle: "⚙ Settings",
    settingsDesc: "Customize your Hybrid Neon Player experience.",
    tabGeneral: "General",
    tabPlayer: "Player",
    tabDesign: "Design",
    tabLibrary: "Library",

    appName: "App Name",
    defaultLanguage: "Default Language",
    glassEffect: "Glass Effect",
    glassEffectDesc: "Enable blur and glassmorphism",

    autoHideInterface: "Auto Hide Interface",
    autoHideInterfaceDesc: "Hide topbar, rail, playlist and controls while watching",
    autoplayNext: "Autoplay Next",
    autoplayNextDesc: "Play next item automatically",
    defaultVolume: "Default Volume",

    themeGlow: "Theme Glow",
    accentColor: "Accent Color",

    rememberLibrary: "Remember Library",
    rememberLibraryDesc: "Keep playlist after restart",
    rightPlaylist: "Right Playlist",
    rightPlaylistDesc: "Vertical library on right side",

    reset: "Reset",
    saveSettings: "Save Settings",

    navHome: "Home",
    navAddMedia: "Add Media",
    navSearch: "Search",
    navLibrary: "Library",
    navFavorites: "Favorites",
    navSettings: "Settings",
    playNext: "Play Next",
    tabThemes: "Themes",
    tabUpdate: "Update",
    tabAbout: "About",
    themesDesc: "Choose a full page theme for the entire application.",
    updateTitle: "Hybrid Neon Player",
    upToDate: "You are up to date!",
    checkUpdate: "Check for Updates",
    checking: "Checking...",
    updateAvailable: "Update available",
    updateError: "Update check failed",
    openGitHub: "Open GitHub",
    noRelease: "No releases available yet",
    downloadInstall: "Download & Install",
    downloading: "Downloading",
    downloadFailed: "Download failed",
    installing: "Installing...",
    changelog: "Changelog",
    aboutTagline: "Next-gen media player with neon aesthetics",
    aboutFeatures: "Features",
    aboutCredits: "Credits",
    aboutCreditsText: "Built with Electron, powered by yt-dlp for media downloading and youtube-search-api for search. Neon UI designed with CSS custom properties and glassmorphism.",
    aboutLinks: "Links",
    reportBug: "Report a Bug",
    license: "License",
    muted: "MUTE",
    playing: "PLAYING",
    paused: "PAUSED",
    bgPlaying: "Playing in background",
    typeAudio: "AUDIO",
    typeVideo: "VIDEO",
    typeOnline: "ONLINE",
    prev: "Previous",
    next: "Next",
    togglePlay: "Play/Pause",
    mute: "Mute",
    restore: "Restore",
    close: "Close",
    invalidPlaylistFile: "Invalid playlist file",
    playlistLoadError: "Playlist could not be loaded.",
    noSearchResults: "No results found.",
    noOnlineMedia: "No online media selected.",
    onlyYouTube: "Only YouTube videos can be downloaded.",
    downloadFail: "Download could not be added.",
    downloadNotConnected: "Download module not connected.",
    folderNotConnected: "Open folder module not connected.",
    downloadManager: "Download Manager",
    continueWatching: "Continue Watching",
    recentlyAdded: "Recently Added",
    youtubeResults: "YouTube Results",
    audioMode: "Audio mode",
    remoteControl: "Remote Control",
    remoteControlDesc: "Control playback from your phone",
    remoteScanQR: "Scan QR or open the URL below",
    copyLink: "Copy Link",
    copied: "Copied!"
  },

  tr: {
    nowPlaying: "Şimdi Oynatılıyor",
    noMedia: "Medya seçilmedi",
    desc: "Yerel medya aç veya YouTube'da ara.",
    play: "▶ Oynat",
    pause: "⏸ Duraklat",
    controls: "Kontroller",
    showControls: "Kontrolleri Göster",
    clear: "Temizle",
    items: "öğe",
    searching: "⏳",
    searchIcon: "🔍",
    searchFailed: "Arama başarısız.",
    resolveFailed: "Video çözülemedi.",

    topSearch: "YouTube'da ara...",
    library: "Kütüphane",
    ready: "Hazır",
    idle: "BOŞTA",

    settingsTitle: "⚙ Ayarlar",
    settingsDesc: "Hybrid Neon Player deneyimini özelleştir.",
    tabGeneral: "Genel",
    tabPlayer: "Oynatıcı",
    tabDesign: "Tema",
    tabLibrary: "Kütüphane",

    appName: "Uygulama Adı",
    defaultLanguage: "Varsayılan Dil",
    glassEffect: "Cam Efekti",
    glassEffectDesc: "Bulanıklık ve cam görünümünü aç",

    autoHideInterface: "Arayüzü Otomatik Gizle",
    autoHideInterfaceDesc: "İzlerken üst barı, menüyü, listeyi ve kontrolleri gizle",
    autoplayNext: "Sonrakini Otomatik Oynat",
    autoplayNextDesc: "Sıradaki medyayı otomatik başlat",
    defaultVolume: "Varsayılan Ses",

    themeGlow: "Tema Parlaklığı",
    accentColor: "Vurgu Rengi",

    rememberLibrary: "Kütüphaneyi Hatırla",
    rememberLibraryDesc: "Uygulama yeniden açılınca listeyi koru",
    rightPlaylist: "Sağ Liste",
    rightPlaylistDesc: "Kütüphaneyi sağ tarafta dikey göster",

    reset: "Sıfırla",
    saveSettings: "Ayarları Kaydet",

    navHome: "Ana Sayfa",
    navAddMedia: "Medya Ekle",
    navSearch: "Arama",
    navLibrary: "Kütüphane",
    navFavorites: "Favoriler",
    navSettings: "Ayarlar",
    playNext: "Sıradaki",
    tabThemes: "Temalar",
    tabUpdate: "Güncelleme",
    tabAbout: "Hakkında",
    themesDesc: "Tüm uygulama için tam sayfa tema seçin.",
    updateTitle: "Hybrid Neon Player",
    upToDate: "Güncelsiniz!",
    checkUpdate: "Güncelleme Kontrol Et",
    checking: "Kontrol ediliyor...",
    updateAvailable: "Güncelleme mevcut",
    updateError: "Güncelleme kontrolü başarısız",
    openGitHub: "GitHub'ı Aç",
    noRelease: "Henüz yayınlanmamış",
    downloadInstall: "İndir ve Yükle",
    downloading: "İndiriliyor",
    downloadFailed: "İndirme başarısız",
    installing: "Yükleniyor...",
    changelog: "Değişiklik Kaydı",
    aboutTagline: "Neon estetiğiyle yeni nesil medya oynatıcı",
    aboutFeatures: "Özellikler",
    aboutCredits: "Katkıda Bulunanlar",
    aboutCreditsText: "Electron ile geliştirildi, medya indirme için yt-dlp ve arama için youtube-search-api ile güçlendirildi. Neon arayüzü CSS değişkenleri ve glassmorphism ile tasarlandı.",
    aboutLinks: "Bağlantılar",
    reportBug: "Hata Bildir",
    license: "Lisans",
    muted: "SESSİZ",
    playing: "OYNATILIYOR",
    paused: "DURAKLATILDI",
    bgPlaying: "Arka planda oynatılıyor",
    typeAudio: "SES",
    typeVideo: "VİDEO",
    typeOnline: "ÇEVRİMİÇİ",
    prev: "Önceki",
    next: "Sonraki",
    togglePlay: "Oynat/Duraklat",
    mute: "Ses Kapat",
    restore: "Geri Yükle",
    close: "Kapat",
    invalidPlaylistFile: "Geçersiz playlist dosyası",
    playlistLoadError: "Playlist yüklenemedi.",
    noSearchResults: "Sonuç bulunamadı.",
    noOnlineMedia: "Çevrimiçi medya seçilmedi.",
    onlyYouTube: "Sadece YouTube videoları indirilebilir.",
    downloadFail: "İndirme eklenemedi.",
    downloadNotConnected: "İndirme modülü bağlı değil.",
    folderNotConnected: "Klasör açma modülü bağlı değil.",
    downloadManager: "İndirme Yöneticisi",
    continueWatching: "İzlemeye Devam Et",
    recentlyAdded: "Son Eklenenler",
    youtubeResults: "YouTube Sonuçları",
    audioMode: "Ses modu",
    remoteControl: "Uzaktan Kumanda",
    remoteControlDesc: "Telefonundan oynatmayı kontrol et",
    remoteScanQR: "Aynı WiFi ağındaki telefondan açın",
    copyLink: "Linki Kopyala",
    copied: "Kopyalandı!"
  },

  de: {
    nowPlaying: "Wiedergabe",
    noMedia: "Kein Medium ausgewählt",
    desc: "Lokale Medien öffnen oder auf YouTube suchen.",
    play: "▶ Abspielen",
    pause: "⏸ Pause",
    controls: "Steuerung",
    showControls: "Steuerung anzeigen",
    clear: "Leeren",
    items: "Elemente",
    searching: "⏳",
    searchIcon: "🔍",
    searchFailed: "Suche fehlgeschlagen.",
    resolveFailed: "Video konnte nicht aufgelöst werden.",

    topSearch: "Auf YouTube suchen...",
    library: "Bibliothek",
    ready: "Bereit",
    idle: "LEER",

    settingsTitle: "⚙ Einstellungen",
    settingsDesc: "Hybrid Neon Player anpassen.",
    tabGeneral: "Allgemein",
    tabPlayer: "Player",
    tabDesign: "Design",
    tabLibrary: "Bibliothek",

    appName: "App-Name",
    defaultLanguage: "Standardsprache",
    glassEffect: "Glaseffekt",
    glassEffectDesc: "Unschärfe und Glasereffekt aktivieren",

    autoHideInterface: "Oberfläche automatisch ausblenden",
    autoHideInterfaceDesc: "Topbar, Menü, Playlist und Steuerung beim Anschauen ausblenden",
    autoplayNext: "Automatisch nächste",
    autoplayNextDesc: "Nächstes Medium automatisch abspielen",
    defaultVolume: "Standardlautstärke",

    themeGlow: "Thema-Leuchten",
    accentColor: "Akzentfarbe",

    rememberLibrary: "Bibliothek merken",
    rememberLibraryDesc: "Playlist nach Neustart beibehalten",
    rightPlaylist: "Rechte Playlist",
    rightPlaylistDesc: "Bibliothek vertikal rechts anzeigen",

    reset: "Zurücksetzen",
    saveSettings: "Einstellungen speichern",

    navHome: "Startseite",
    navAddMedia: "Medien hinzufügen",
    navSearch: "Suche",
    navLibrary: "Bibliothek",
    navFavorites: "Favoriten",
    navSettings: "Einstellungen",
    playNext: "Nächstes",
    tabThemes: "Themen",
    tabUpdate: "Update",
    tabAbout: "Über",
    themesDesc: "Wählen Sie ein vollständiges Seiten-Theme für die gesamte Anwendung.",
    updateTitle: "Hybrid Neon Player",
    upToDate: "Sie sind auf dem neuesten Stand!",
    checkUpdate: "Nach Updates suchen",
    checking: "Überprüfe...",
    updateAvailable: "Update verfügbar",
    updateError: "Update-Überprüfung fehlgeschlagen",
    openGitHub: "GitHub öffnen",
    noRelease: "Noch keine Releases verfügbar",
    downloadInstall: "Herunterladen & Installieren",
    downloading: "Herunterladen",
    downloadFailed: "Download fehlgeschlagen",
    installing: "Installiere...",
    changelog: "Änderungsprotokoll",
    aboutTagline: "Medienplayer der nächsten Generation mit Neon-Ästhetik",
    aboutFeatures: "Funktionen",
    aboutCredits: "Danksagungen",
    aboutCreditsText: "Entwickelt mit Electron, unterstützt durch yt-dlp zum Medien-Download und youtube-search-api für die Suche. Neon-UI mit CSS Custom Properties und Glassmorphism gestaltet.",
    aboutLinks: "Links",
    reportBug: "Fehler melden",
    license: "Lizenz",
    muted: "STUMM",
    playing: "WIEDERGABE",
    paused: "PAUSIERT",
    bgPlaying: "Wiedergabe im Hintergrund",
    typeAudio: "AUDIO",
    typeVideo: "VIDEO",
    typeOnline: "ONLINE",
    prev: "Vorherige",
    next: "Nächste",
    togglePlay: "Abspielen/Pause",
    mute: "Stumm",
    restore: "Wiederherstellen",
    close: "Schließen",
    invalidPlaylistFile: "Ungültige Playlist-Datei",
    playlistLoadError: "Playlist konnte nicht geladen werden.",
    noSearchResults: "Keine Ergebnisse gefunden.",
    noOnlineMedia: "Kein Online-Medium ausgewählt.",
    onlyYouTube: "Nur YouTube-Videos können heruntergeladen werden.",
    downloadFail: "Download konnte nicht hinzugefügt werden.",
    downloadNotConnected: "Download-Modul nicht verbunden.",
    folderNotConnected: "Ordner-Modul nicht verbunden.",
    downloadManager: "Download-Manager",
    continueWatching: "Weiterschauen",
    recentlyAdded: "Kürzlich hinzugefügt",
    youtubeResults: "YouTube-Ergebnisse",
    audioMode: "Audio-Modus",
    remoteControl: "Fernsteuerung",
    remoteControlDesc: "Wiedergabe vom Handy steuern",
    remoteScanQR: "QR scannen oder URL unten öffnen",
    copyLink: "Link kopieren",
    copied: "Kopiert!"
  },

  es: {
    nowPlaying: "Reproduciendo",
    noMedia: "Sin medios seleccionados",
    desc: "Abrir medios locales o buscar en YouTube.",
    play: "▶ Reproducir",
    pause: "⏸ Pausar",
    controls: "Controles",
    showControls: "Mostrar controles",
    clear: "Limpiar",
    items: "elementos",
    searching: "⏳",
    searchIcon: "🔍",
    searchFailed: "Búsqueda fallida.",
    resolveFailed: "No se pudo resolver el video.",

    topSearch: "Buscar en YouTube...",
    library: "Biblioteca",
    ready: "Listo",
    idle: "INACTIVO",

    settingsTitle: "⚙ Configuración",
    settingsDesc: "Personaliza tu experiencia de Hybrid Neon Player.",
    tabGeneral: "General",
    tabPlayer: "Reproductor",
    tabDesign: "Diseño",
    tabLibrary: "Biblioteca",

    appName: "Nombre de la App",
    defaultLanguage: "Idioma predeterminado",
    glassEffect: "Efecto de vidrio",
    glassEffectDesc: "Activar desenfoque y vidrio",

    autoHideInterface: "Ocultar interfaz automáticamente",
    autoHideInterfaceDesc: "Ocultar barra, menú, lista y controles al ver",
    autoplayNext: "Reproducir siguiente automáticamente",
    autoplayNextDesc: "Reproducir el siguiente medio automáticamente",
    defaultVolume: "Volumen predeterminado",

    themeGlow: "Brillo del tema",
    accentColor: "Color de acento",

    rememberLibrary: "Recordar biblioteca",
    rememberLibraryDesc: "Mantener la lista después de reiniciar",
    rightPlaylist: "Lista derecha",
    rightPlaylistDesc: "Biblioteca vertical en el lado derecho",

    reset: "Restablecer",
    saveSettings: "Guardar configuración",

    navHome: "Inicio",
    navAddMedia: "Agregar medio",
    navSearch: "Buscar",
    navLibrary: "Biblioteca",
    navFavorites: "Favoritos",
    navSettings: "Configuración",
    playNext: "Siguiente",
    tabThemes: "Temas",
    tabUpdate: "Actualización",
    tabAbout: "Acerca de",
    themesDesc: "Elige un tema de página completa para toda la aplicación.",
    updateTitle: "Hybrid Neon Player",
    upToDate: "¡Estás actualizado!",
    checkUpdate: "Buscar actualizaciones",
    checking: "Buscando...",
    updateAvailable: "Actualización disponible",
    updateError: "Error al buscar actualizaciones",
    openGitHub: "Abrir GitHub",
    noRelease: "No hay versiones disponibles aún",
    downloadInstall: "Descargar e instalar",
    downloading: "Descargando",
    downloadFailed: "Error de descarga",
    installing: "Instalando...",
    changelog: "Registro de cambios",
    aboutTagline: "Reproductor de medios de nueva generación con estética neon",
    aboutFeatures: "Características",
    aboutCredits: "Créditos",
    aboutCreditsText: "Desarrollado con Electron, impulsado por yt-dlp para descargas y youtube-search-api para búsqueda. UI neon diseñada con CSS custom properties y glassmorphism.",
    aboutLinks: "Enlaces",
    reportBug: "Reportar error",
    license: "Licencia",
    muted: "SILENCIADO",
    playing: "REPRODUCIENDO",
    paused: "PAUSADO",
    bgPlaying: "Reproduciendo en segundo plano",
    typeAudio: "AUDIO",
    typeVideo: "VIDEO",
    typeOnline: "EN LÍNEA",
    prev: "Anterior",
    next: "Siguiente",
    togglePlay: "Reproducir/Pausar",
    mute: "Silenciar",
    restore: "Restaurar",
    close: "Cerrar",
    invalidPlaylistFile: "Archivo de playlist inválido",
    playlistLoadError: "No se pudo cargar la playlist.",
    noSearchResults: "No se encontraron resultados.",
    noOnlineMedia: "No se seleccionó medio en línea.",
    onlyYouTube: "Solo se pueden descargar videos de YouTube.",
    downloadFail: "No se pudo agregar la descarga.",
    downloadNotConnected: "Módulo de descarga no conectado.",
    folderNotConnected: "Módulo de carpeta no conectado.",
    downloadManager: "Gestor de descargas",
    continueWatching: "Seguir viendo",
    recentlyAdded: "Añadido recientemente",
    youtubeResults: "Resultados de YouTube",
    audioMode: "Modo de audio",
    remoteControl: "Mando a distancia",
    remoteControlDesc: "Controla la reproducción desde tu móvil",
    remoteScanQR: "Escanea el QR o abre la URL",
    copyLink: "Copiar enlace",
    copied: "¡Copiado!"
  },

  fr: {
    nowPlaying: "En lecture",
    noMedia: "Aucun média sélectionné",
    desc: "Ouvrir des médias locaux ou rechercher sur YouTube.",
    play: "▶ Lecture",
    pause: "⏸ Pause",
    controls: "Contrôles",
    showControls: "Afficher les contrôles",
    clear: "Effacer",
    items: "éléments",
    searching: "⏳",
    searchIcon: "🔍",
    searchFailed: "Échec de la recherche.",
    resolveFailed: "Impossible de résoudre la vidéo.",

    topSearch: "Rechercher sur YouTube...",
    library: "Bibliothèque",
    ready: "Prêt",
    idle: "INACTIF",

    settingsTitle: "⚙ Paramètres",
    settingsDesc: "Personnalisez votre expérience Hybrid Neon Player.",
    tabGeneral: "Général",
    tabPlayer: "Lecteur",
    tabDesign: "Design",
    tabLibrary: "Bibliothèque",

    appName: "Nom de l'app",
    defaultLanguage: "Langue par défaut",
    glassEffect: "Effet vitre",
    glassEffectDesc: "Activer le flou et l'effet vitre",

    autoHideInterface: "Masquer l'interface automatiquement",
    autoHideInterfaceDesc: "Masquer la barre, le menu, la liste et les contrôles pendant la lecture",
    autoplayNext: "Lecture automatique suivante",
    autoplayNextDesc: "Lire automatiquement le média suivant",
    defaultVolume: "Volume par défaut",

    themeGlow: "Luminosité du thème",
    accentColor: "Couleur d'accent",

    rememberLibrary: "Mémoriser la bibliothèque",
    rememberLibraryDesc: "Conserver la liste après redémarrage",
    rightPlaylist: "Playlist droite",
    rightPlaylistDesc: "Bibliothèque verticale sur le côté droit",

    reset: "Réinitialiser",
    saveSettings: "Enregistrer",

    navHome: "Accueil",
    navAddMedia: "Ajouter un média",
    navSearch: "Recherche",
    navLibrary: "Bibliothèque",
    navFavorites: "Favoris",
    navSettings: "Paramètres",
    playNext: "Suivant",
    tabThemes: "Thèmes",
    tabUpdate: "Mise à jour",
    tabAbout: "À propos",
    themesDesc: "Choisissez un thème pour l'ensemble de l'application.",
    updateTitle: "Hybrid Neon Player",
    upToDate: "Vous êtes à jour !",
    checkUpdate: "Vérifier les mises à jour",
    checking: "Vérification...",
    updateAvailable: "Mise à jour disponible",
    updateError: "Échec de la vérification",
    openGitHub: "Ouvrir GitHub",
    noRelease: "Aucune version disponible pour le moment",
    downloadInstall: "Télécharger et installer",
    downloading: "Téléchargement",
    downloadFailed: "Échec du téléchargement",
    installing: "Installation...",
    changelog: "Journal des modifications",
    aboutTagline: "Lecteur média nouvelle génération avec esthétique néon",
    aboutFeatures: "Fonctionnalités",
    aboutCredits: "Crédits",
    aboutCreditsText: "Développé avec Electron, propulsé par yt-dlp pour les téléchargements et youtube-search-api pour la recherche. Interface néon conçue avec CSS custom properties et glassmorphism.",
    aboutLinks: "Liens",
    reportBug: "Signaler un bug",
    license: "Licence",
    muted: "MUET",
    playing: "EN LECTURE",
    paused: "EN PAUSE",
    bgPlaying: "Lecture en arrière-plan",
    typeAudio: "AUDIO",
    typeVideo: "VIDÉO",
    typeOnline: "EN LIGNE",
    prev: "Précédent",
    next: "Suivant",
    togglePlay: "Lecture/Pause",
    mute: "Muet",
    restore: "Restaurer",
    close: "Fermer",
    invalidPlaylistFile: "Fichier playlist invalide",
    playlistLoadError: "Impossible de charger la playlist.",
    noSearchResults: "Aucun résultat trouvé.",
    noOnlineMedia: "Aucun média en ligne sélectionné.",
    onlyYouTube: "Seuls les vidéos YouTube peuvent être téléchargées.",
    downloadFail: "Impossible d'ajouter le téléchargement.",
    downloadNotConnected: "Module de téléchargement non connecté.",
    folderNotConnected: "Module dossier non connecté.",
    downloadManager: "Gestionnaire de téléchargement",
    continueWatching: "Continuer à regarder",
    recentlyAdded: "Récemment ajouté",
    youtubeResults: "Résultats YouTube",
    audioMode: "Mode audio",
    remoteControl: "Télécommande",
    remoteControlDesc: "Contrôlez la lecture depuis votre téléphone",
    remoteScanQR: "Scannez le QR ou ouvrez l'URL ci-dessous",
    copyLink: "Copier le lien",
    copied: "Copié !"
  },

  ru: {
    nowPlaying: "Сейчас играет",
    noMedia: "Медиа не выбрано",
    desc: "Откройте локальные файлы или ищите на YouTube.",
    play: "▶ Воспроизвести",
    pause: "⏸ Пауза",
    controls: "Управление",
    showControls: "Показать управление",
    clear: "Очистить",
    items: "элементов",
    searching: "⏳",
    searchIcon: "🔍",
    searchFailed: "Поиск не удался.",
    resolveFailed: "Не удалось загрузить видео.",

    topSearch: "Поиск на YouTube...",
    library: "Библиотека",
    ready: "Готово",
    idle: "ПУСТО",

    settingsTitle: "⚙ Настройки",
    settingsDesc: "Настройте Hybrid Neon Player под себя.",
    tabGeneral: "Общие",
    tabPlayer: "Плеер",
    tabDesign: "Оформление",
    tabLibrary: "Библиотека",

    appName: "Название приложения",
    defaultLanguage: "Язык по умолчанию",
    glassEffect: "Стеклянный эффект",
    glassEffectDesc: "Включить размытие и стеклянный эффект",

    autoHideInterface: "Автоскрытие интерфейса",
    autoHideInterfaceDesc: "Скрывать панели и управление при просмотре",
    autoplayNext: "Автовоспроизведение",
    autoplayNextDesc: "Автоматически воспроизводить следующий файл",
    defaultVolume: "Громкость по умолчанию",

    themeGlow: "Свечение темы",
    accentColor: "Цвет акцента",

    rememberLibrary: "Запоминать библиотеку",
    rememberLibraryDesc: "Сохранять список после перезапуска",
    rightPlaylist: "Правый плейлист",
    rightPlaylistDesc: "Вертикальная библиотека справа",

    reset: "Сбросить",
    saveSettings: "Сохранить настройки",

    navHome: "Главная",
    navAddMedia: "Добавить медиа",
    navSearch: "Поиск",
    navLibrary: "Библиотека",
    navFavorites: "Избранное",
    navSettings: "Настройки",
    playNext: "Следующий",
    tabThemes: "Темы",
    tabUpdate: "Обновление",
    tabAbout: "О программе",
    themesDesc: "Выберите тему для всего приложения.",
    updateTitle: "Hybrid Neon Player",
    upToDate: "У вас последняя версия!",
    checkUpdate: "Проверить обновления",
    checking: "Проверка...",
    updateAvailable: "Доступно обновление",
    updateError: "Ошибка проверки обновлений",
    openGitHub: "Открыть GitHub",
    noRelease: "Пока нет доступных релизов",
    downloadInstall: "Скачать и установить",
    downloading: "Загрузка",
    downloadFailed: "Ошибка загрузки",
    installing: "Установка...",
    changelog: "Список изменений",
    aboutTagline: "Медиаплеер нового поколения с неоновой эстетикой",
    aboutFeatures: "Возможности",
    aboutCredits: "Авторы",
    aboutCreditsText: "Разработано на Electron, с использованием yt-dlp для загрузки и youtube-search-api для поиска. Неоновый интерфейс создан с CSS custom properties и glassmorphism.",
    aboutLinks: "Ссылки",
    reportBug: "Сообщить об ошибке",
    license: "Лицензия",
    muted: "ЗВУК ВЫКЛ",
    playing: "ВОСПРОИЗВЕДЕНИЕ",
    paused: "ПАУЗА",
    bgPlaying: "Воспроизведение в фоне",
    typeAudio: "АУДИО",
    typeVideo: "ВИДЕО",
    typeOnline: "ОНЛАЙН",
    prev: "Предыдущий",
    next: "Следующий",
    togglePlay: "Воспроизвести/Пауза",
    mute: "Звук выкл",
    restore: "Восстановить",
    close: "Закрыть",
    invalidPlaylistFile: "Неверный файл плейлиста",
    playlistLoadError: "Не удалось загрузить плейлист.",
    noSearchResults: "Результаты не найдены.",
    noOnlineMedia: "Онлайн-медиа не выбрано.",
    onlyYouTube: "Можно скачивать только видео YouTube.",
    downloadFail: "Не удалось добавить загрузку.",
    downloadNotConnected: "Модуль загрузки не подключён.",
    folderNotConnected: "Модуль папки не подключён.",
    downloadManager: "Менеджер загрузок",
    continueWatching: "Продолжить просмотр",
    recentlyAdded: "Недавно добавленные",
    youtubeResults: "Результаты YouTube",
    audioMode: "Аудио режим",
    remoteControl: "Дистанционное управление",
    remoteControlDesc: "Управляйте воспроизведением с телефона",
    remoteScanQR: "Отсканируйте QR или откройте ссылку",
    copyLink: "Копировать ссылку",
    copied: "Скопировано!"
  },

  ar: {
    nowPlaying: "يعمل الآن",
    noMedia: "لم يتم اختيار وسائط",
    desc: "افتح وسائط محلية أو ابحث في يوتيوب.",
    play: "▶ تشغيل",
    pause: "⏸ إيقاف",
    controls: "التحكم",
    showControls: "إظهار التحكم",
    clear: "مسح",
    items: "عناصر",
    searching: "⏳",
    searchIcon: "🔍",
    searchFailed: "فشل البحث.",
    resolveFailed: "تعذر تحميل الفيديو.",

    topSearch: "ابحث في يوتيوب...",
    library: "المكتبة",
    ready: "جاهز",
    idle: "خامل",

    settingsTitle: "⚙ الإعدادات",
    settingsDesc: "خصّص تجربة Hybrid Neon Player.",
    tabGeneral: "عام",
    tabPlayer: "المشغل",
    tabDesign: "التصميم",
    tabLibrary: "المكتبة",

    appName: "اسم التطبيق",
    defaultLanguage: "اللغة الافتراضية",
    glassEffect: "تأثير الزجاج",
    glassEffectDesc: "تفعيل التمويه والتأثير الزجاجي",

    autoHideInterface: "إخفاء الواجهة تلقائيًا",
    autoHideInterfaceDesc: "إخفاء الأشرطة والقوائم والتحكم أثناء المشاهدة",
    autoplayNext: "تشغيل التلقائي",
    autoplayNextDesc: "تشغيل الوسيلة التالية تلقائيًا",
    defaultVolume: "الصوت الافتراضي",

    themeGlow: "توهج السمة",
    accentColor: "لون التمييز",

    rememberLibrary: "تذكر المكتبة",
    rememberLibraryDesc: "الحفاظ على القائمة بعد إعادة التشغيل",
    rightPlaylist: "قائمة التشغيل اليمنى",
    rightPlaylistDesc: "عرض المكتبة عموديًا على اليمين",

    reset: "إعادة تعيين",
    saveSettings: "حفظ الإعدادات",

    navHome: "الرئيسية",
    navAddMedia: "إضافة وسائط",
    navSearch: "بحث",
    navLibrary: "المكتبة",
    navFavorites: "المفضلة",
    navSettings: "الإعدادات",
    playNext: "التالي",
    tabThemes: "السمات",
    tabUpdate: "تحديث",
    tabAbout: "حول",
    themesDesc: "اختر سمة صفحة كاملة لجميع التطبيق.",
    updateTitle: "Hybrid Neon Player",
    upToDate: "أنت تستخدم أحدث إصدار!",
    checkUpdate: "التحقق من التحديثات",
    checking: "جارٍ التحقق...",
    updateAvailable: "تحديث متاح",
    updateError: "فشل التحقق من التحديث",
    openGitHub: "فتح GitHub",
    noRelease: "لا توجد إصدارات متاحة بعد",
    downloadInstall: "تنزيل وتثبيت",
    downloading: "جارٍ التنزيل",
    downloadFailed: "فشل التنزيل",
    installing: "جارٍ التثبيت...",
    changelog: "سجل التغييرات",
    aboutTagline: "مشغل وسائط من الجيل التالي بجمالي نيون",
    aboutFeatures: "الميزات",
    aboutCredits: "الائتمانات",
    aboutCreditsText: "تم بناؤه بـ Electron، ومدعوم بـ yt-dlp للتنزيل و youtube-search-api للبحث. واجهة نيون مصممة بـ CSS custom properties و glassmorphism.",
    aboutLinks: "روابط",
    reportBug: "الإبلاغ عن خطأ",
    license: "الرخصة",
    muted: "كتم",
    playing: "يعمل الآن",
    paused: "متوقف",
    bgPlaying: "يُشغَّل في الخلفية",
    typeAudio: "صوتي",
    typeVideo: "فيديو",
    typeOnline: "عبر الإنترنت",
    prev: "السابق",
    next: "التالي",
    togglePlay: "تشغيل/إيقاف",
    mute: "كتم الصوت",
    restore: "استعادة",
    close: "إغلاق",
    invalidPlaylistFile: "ملف قائمة تشغيل غير صالح",
    playlistLoadError: "تعذر تحميل قائمة التشغيل.",
    noSearchResults: "لم يتم العثور على نتائج.",
    noOnlineMedia: "لم يتم اختيار وسائط عبر الإنترنت.",
    onlyYouTube: "يمكن تنزيل فيديوهات يوتيوب فقط.",
    downloadFail: "تعذر إضافة التنزيل.",
    downloadNotConnected: "وحدة التنزيل غير متصلة.",
    folderNotConnected: "وحدة فتح المجلد غير متصلة.",
    downloadManager: "مدير التنزيلات",
    continueWatching: "متابعة المشاهدة",
    recentlyAdded: "أُضيف مؤخراً",
    youtubeResults: "نتائج يوتيوب",
    audioMode: "وضع الصوت",
    remoteControl: "التحكم عن بُعد",
    remoteControlDesc: "تحكم بالتشغيل من هاتفك",
    remoteScanQR: "امسح الرمز أو افتح الرابط أدناه",
    copyLink: "نسخ الرابط",
    copied: "تم النسخ!"
  },

  ja: {
    nowPlaying: "再生中",
    noMedia: "メディア未選択",
    desc: "ローカルメディアを開くか、YouTubeで検索。",
    play: "▶ 再生",
    pause: "⏸ 一時停止",
    controls: "コントロール",
    showControls: "コントロールを表示",
    clear: "クリア",
    items: "件",
    searching: "⏳",
    searchIcon: "🔍",
    searchFailed: "検索に失敗しました。",
    resolveFailed: "ビデオを取得できませんでした。",

    topSearch: "YouTubeで検索...",
    library: "ライブラリ",
    ready: "準備完了",
    idle: "待機中",

    settingsTitle: "⚙ 設定",
    settingsDesc: "Hybrid Neon Playerをカスタマイズ。",
    tabGeneral: "一般",
    tabPlayer: "プレーヤー",
    tabDesign: "デザイン",
    tabLibrary: "ライブラリ",

    appName: "アプリ名",
    defaultLanguage: "デフォルト言語",
    glassEffect: "グラスエフェクト",
    glassEffectDesc: "ぼかしとガラス効果を有効化",

    autoHideInterface: "インターフェースを自動非表示",
    autoHideInterfaceDesc: "視聴中バー、メニュー、リスト、コントロールを非表示",
    autoplayNext: "自動再生",
    autoplayNextDesc: "次のメディアを自動再生",
    defaultVolume: "デフォルト音量",

    themeGlow: "テーマグロー",
    accentColor: "アクセントカラー",

    rememberLibrary: "ライブラリを記憶",
    rememberLibraryDesc: "再起動後もリストを保持",
    rightPlaylist: "右プレイリスト",
    rightPlaylistDesc: "ライブラリを右側に縦表示",

    reset: "リセット",
    saveSettings: "設定を保存",

    navHome: "ホーム",
    navAddMedia: "メディア追加",
    navSearch: "検索",
    navLibrary: "ライブラリ",
    navFavorites: "お気に入り",
    navSettings: "設定",
    playNext: "次へ",
    tabThemes: "テーマ",
    tabUpdate: "更新",
    tabAbout: "概要",
    themesDesc: "アプリ全体のテーマを選択。",
    updateTitle: "Hybrid Neon Player",
    upToDate: "最新バージョンです！",
    checkUpdate: "アップデートを確認",
    checking: "確認中...",
    updateAvailable: "アップデートがあります",
    updateError: "アップデート確認に失敗しました",
    openGitHub: "GitHubを開く",
    noRelease: "リリースはまだありません",
    downloadInstall: "ダウンロードしてインストール",
    downloading: "ダウンロード中",
    downloadFailed: "ダウンロード失敗",
    installing: "インストール中...",
    changelog: "変更履歴",
    aboutTagline: "ネオン美学の次世代メディアプレーヤー",
    aboutFeatures: "機能",
    aboutCredits: "クレジット",
    aboutCreditsText: "Electronで構築、yt-dlpでダウンロード、youtube-search-apiで検索をサポート。CSS custom propertiesとglassmorphismでデザインされたネオンUI。",
    aboutLinks: "リンク",
    reportBug: "バグ報告",
    license: "ライセンス",
    muted: "ミュート",
    playing: "再生中",
    paused: "一時停止",
    bgPlaying: "バックグラウンドで再生中",
    typeAudio: "オーディオ",
    typeVideo: "ビデオ",
    typeOnline: "オンライン",
    prev: "前へ",
    next: "次へ",
    togglePlay: "再生/一時停止",
    mute: "ミュート",
    restore: "復元",
    close: "閉じる",
    invalidPlaylistFile: "無効なプレイリストファイル",
    playlistLoadError: "プレイリストを読み込めませんでした。",
    noSearchResults: "結果が見つかりません。",
    noOnlineMedia: "オンラインメディアが選択されていません。",
    onlyYouTube: "YouTubeビデオのみダウンロード可能です。",
    downloadFail: "ダウンロードを追加できませんでした。",
    downloadNotConnected: "ダウンロードモジュールが接続されていません。",
    folderNotConnected: "フォルダモジュールが接続されていません。",
    downloadManager: "ダウンロードマネージャー",
    continueWatching: "視聴を続ける",
    recentlyAdded: "最近追加されたもの",
    youtubeResults: "YouTube検索結果",
    audioMode: "オーディオモード",
    remoteControl: "リモートコントロール",
    remoteControlDesc: "スマートフォンから再生を操作",
    remoteScanQR: "QRコードをスキャンまたはURLを開く",
    copyLink: "リンクをコピー",
    copied: "コピーしました！"
  },

  zh: {
    nowPlaying: "正在播放",
    noMedia: "未选择媒体",
    desc: "打开本地媒体或在YouTube上搜索。",
    play: "▶ 播放",
    pause: "⏸ 暂停",
    controls: "控制",
    showControls: "显示控制",
    clear: "清除",
    items: "个项目",
    searching: "⏳",
    searchIcon: "🔍",
    searchFailed: "搜索失败。",
    resolveFailed: "无法加载视频。",

    topSearch: "在YouTube上搜索...",
    library: "媒体库",
    ready: "就绪",
    idle: "空闲",

    settingsTitle: "⚙ 设置",
    settingsDesc: "自定义Hybrid Neon Player体验。",
    tabGeneral: "通用",
    tabPlayer: "播放器",
    tabDesign: "设计",
    tabLibrary: "媒体库",

    appName: "应用名称",
    defaultLanguage: "默认语言",
    glassEffect: "玻璃效果",
    glassEffectDesc: "启用模糊和玻璃拟态",

    autoHideInterface: "自动隐藏界面",
    autoHideInterfaceDesc: "观看时隐藏工具栏、菜单、列表和控制",
    autoplayNext: "自动播放下一个",
    autoplayNextDesc: "自动播放下一个媒体",
    defaultVolume: "默认音量",

    themeGlow: "主题光效",
    accentColor: "强调色",

    rememberLibrary: "记住媒体库",
    rememberLibraryDesc: "重启后保留播放列表",
    rightPlaylist: "右侧播放列表",
    rightPlaylistDesc: "在右侧垂直显示媒体库",

    reset: "重置",
    saveSettings: "保存设置",

    navHome: "主页",
    navAddMedia: "添加媒体",
    navSearch: "搜索",
    navLibrary: "媒体库",
    navFavorites: "收藏",
    navSettings: "设置",
    playNext: "下一个",
    tabThemes: "主题",
    tabUpdate: "更新",
    tabAbout: "关于",
    themesDesc: "为整个应用选择全页主题。",
    updateTitle: "Hybrid Neon Player",
    upToDate: "已是最新版本！",
    checkUpdate: "检查更新",
    checking: "检查中...",
    updateAvailable: "有可用更新",
    updateError: "检查更新失败",
    openGitHub: "打开 GitHub",
    noRelease: "暂无可用版本",
    downloadInstall: "下载并安装",
    downloading: "下载中",
    downloadFailed: "下载失败",
    installing: "安装中...",
    changelog: "更新日志",
    aboutTagline: "具有霓虹美学的下一代媒体播放器",
    aboutFeatures: "功能",
    aboutCredits: "致谢",
    aboutCreditsText: "基于Electron构建，由yt-dlp提供下载支持，youtube-search-api提供搜索支持。霓虹UI采用CSS自定义属性和玻璃拟态设计。",
    aboutLinks: "链接",
    reportBug: "报告错误",
    license: "许可证",
    muted: "已静音",
    playing: "播放中",
    paused: "已暂停",
    bgPlaying: "后台播放中",
    typeAudio: "音频",
    typeVideo: "视频",
    typeOnline: "在线",
    prev: "上一个",
    next: "下一个",
    togglePlay: "播放/暂停",
    mute: "静音",
    restore: "还原",
    close: "关闭",
    invalidPlaylistFile: "无效的播放列表文件",
    playlistLoadError: "无法加载播放列表。",
    noSearchResults: "未找到结果。",
    noOnlineMedia: "未选择在线媒体。",
    onlyYouTube: "仅可下载YouTube视频。",
    downloadFail: "无法添加下载。",
    downloadNotConnected: "下载模块未连接。",
    folderNotConnected: "打开文件夹模块未连接。",
    downloadManager: "下载管理器",
    continueWatching: "继续观看",
    recentlyAdded: "最近添加",
    youtubeResults: "YouTube搜索结果",
    audioMode: "音频模式",
    remoteControl: "远程控制",
    remoteControlDesc: "用手机控制播放",
    remoteScanQR: "扫描二维码或打开下方链接",
    copyLink: "复制链接",
    copied: "已复制！"
  }
};

function t(key) {
  return translations[currentLang]?.[key] || translations.en[key] || key;
}

function applyI18nText() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (key) el.textContent = t(key);
  });

  if (searchInput) searchInput.placeholder = t("topSearch");

  const languageText = document.getElementById("languageSelectText");
  if (languageText) {
    const langNames = { en: "English", tr: "Türkçe", de: "Deutsch", es: "Español", fr: "Français", ru: "Русский", ar: "العربية", ja: "日本語", zh: "中文" };
    languageText.textContent = langNames[currentLang] || "English";
  }
}

function setCustomLanguageSelect(lang) {
  const hidden = document.getElementById("settingLanguage");
  const text = document.getElementById("languageSelectText");

  if (hidden) hidden.value = lang;
  if (text) {
    const langNames = { en: "English", tr: "Türkçe", de: "Deutsch", es: "Español", fr: "Français", ru: "Русский", ar: "العربية", ja: "日本語", zh: "中文" };
    text.textContent = langNames[lang] || "English";
  }

  document.querySelectorAll("[data-lang-value]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.langValue === lang);
  });
}

function setupCustomLanguageSelect() {
  const trigger = document.getElementById("languageSelectTrigger");
  const menu = document.getElementById("languageSelectMenu");
  const wrap = document.getElementById("languageSelect");
  const hidden = document.getElementById("settingLanguage");

  if (!trigger || !menu || !wrap || !hidden) return;

  trigger.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    wrap.classList.toggle("open");
  });

  menu.querySelectorAll("[data-lang-value]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      currentLang = btn.dataset.langValue;
      hidden.value = currentLang;
      setCustomLanguageSelect(currentLang);
      applyLanguage();

      wrap.classList.remove("open");
    });
  });

  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) wrap.classList.remove("open");
  });
}

function applyLanguage() {
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";

  const eyebrow = document.querySelector(".eyebrow");
  if (eyebrow) eyebrow.textContent = t("nowPlaying");

  if (toggleControlsBtn) {
    toggleControlsBtn.textContent = document.body.classList.contains("controls-manual-hidden")
      ? t("showControls")
      : t("controls");
  }

  if (clearPlaylistBtn) clearPlaylistBtn.textContent = t("clear");

  if (activeIndex === -1) {
    mediaTitle.textContent = t("noMedia");
    mediaDesc.textContent = t("desc");
  }

  applyI18nText();
  updatePlayButtons();
  updateLibraryCount();
  if (typeof updateCockpit === "function") updateCockpit();

  localStorage.setItem("app_lang", currentLang);
}

if (minimizeBtn) minimizeBtn.onclick = () => window.api?.windowMinimize?.();
if (maximizeBtn) maximizeBtn.onclick = () => window.api?.windowMaximize?.();
if (closeBtn) closeBtn.onclick = () => window.api?.windowClose?.();

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getFileName(filePath) {
  return filePath.split(/[\\/]/).pop();
}

function toFileUrl(filePath) {
  if (filePath.startsWith("file:///")) return filePath;
  return `file:///${filePath.replace(/\\/g, "/")}`;
}

function getTypeFromSource(src) {
  if (/\.(mp3|wav|ogg|m4a|flac)$/i.test(src)) return "audio";
  if (/^https?:\/\//i.test(src)) return "online";
  return "video";
}

function generateVideoThumb(filePath) {
  return new Promise((resolve) => {
    const ext = filePath.split(".").pop().toLowerCase();

    if (["mp3", "wav", "ogg", "m4a", "flac"].includes(ext)) {
      resolve("");
      return;
    }

    const video = document.createElement("video");
    video.src = toFileUrl(filePath);
    video.muted = true;
    video.preload = "metadata";

    video.onloadeddata = () => {
      try {
        video.currentTime = Math.min(2, video.duration / 2 || 1);
      } catch {
        resolve("");
      }
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = 180;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/jpeg", 0.7));
      } catch {
        resolve("");
      }
    };

    video.onerror = () => resolve("");
  });
}

function updateLibraryCount() {
  if (libraryCount) {
    libraryCount.textContent = `${playlist.length} ${t("items")}`;
  }
}

function updatePlayButtons() {
  const playing = !!(player.src && !player.paused);

  if (playing) {
    playPauseBtn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22"><rect x="6" y="4" width="4" height="16" rx="1.5" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1.5" fill="currentColor"/></svg>';
  } else {
    playPauseBtn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22"><polygon points="8,4 20,12 8,20" fill="currentColor"/></svg>';
  }
  centerPlayBtn.textContent = "▶";
  heroPlayBtn.textContent = playing ? t("pause") : t("play");

  hero.classList.toggle("playing", playing);
  updateCockpit();
}


function updateCockpit(item = playlist[activeIndex]) {
  if (!cockpitTitle) return;

  if (!item) {
    cockpitTitle.textContent = t("noMedia");
    cockpitSub.textContent = t("ready");
    cockpitType.textContent = t("idle");
    cockpitSpeed.textContent = `${player.playbackRate || 1}x`;
    cockpitVol.textContent = `${Math.round((player.volume || 0) * 100)}%`;
    cockpitCover.textContent = "♪";
    cockpitCover.style.backgroundImage = "";
    return;
  }

  cockpitTitle.textContent = item.title || t("noMedia");
  cockpitSub.textContent = `${item.author || t("type" + item.type.charAt(0).toUpperCase() + item.type.slice(1))} ${item.duration ? "• " + item.duration : ""}`;
  cockpitType.textContent = t("type" + item.type.charAt(0).toUpperCase() + item.type.slice(1));
  cockpitSpeed.textContent = `${player.playbackRate || 1}x`;
  cockpitVol.textContent = `${Math.round((player.volume || 0) * 100)}%`;

  if (item.thumb) {
    cockpitCover.textContent = "";
    cockpitCover.style.backgroundImage = `url("${item.thumb}")`;
  } else {
    cockpitCover.style.backgroundImage = "";
    cockpitCover.textContent = item.type === "audio" ? "♪" : item.type === "online" ? "🌐" : "▶";
  }
}

function renderPlaylist() {
  playlistEl.innerHTML = "";

  playlist.forEach((item, index) => {
    const li = document.createElement("li");
    li.classList.toggle("active", index === activeIndex);

    let thumb;

    if (item.thumb) {
      thumb = document.createElement("img");
      thumb.className = "play-thumb";
      thumb.src = item.thumb;
    } else {
      thumb = document.createElement("div");
      thumb.className = "play-thumb-fallback";
      thumb.textContent =
        item.type === "audio" ? "🎵" :
        item.type === "online" ? "🌐" :
        "🎬";
    }

    const info = document.createElement("div");
    info.className = "play-info";

    const title = document.createElement("div");
    title.className = "play-title";
    title.textContent = item.title;

    const sub = document.createElement("div");
    sub.className = "play-sub";
    sub.textContent = `${item.author || ""} ${item.duration ? "• " + item.duration : ""}`;

    const type = document.createElement("div");
    type.className = "play-type";
    type.textContent = t("type" + item.type.charAt(0).toUpperCase() + item.type.slice(1));

    info.appendChild(title);
    info.appendChild(sub);

    const actions = document.createElement("div");
    actions.className = "li-actions";

    const playBtn = document.createElement("button");
    playBtn.className = "li-play-btn";
    playBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14"><polygon points="6,3 20,12 6,21" fill="currentColor"/></svg>`;
    playBtn.title = t("play");
    playBtn.onclick = (e) => { e.stopPropagation(); playItem(index); };

    const nextBtn = document.createElement("button");
    nextBtn.className = "li-next-btn";
    nextBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14"><polygon points="4,4 14,12 4,20" fill="currentColor"/><rect x="15" y="4" width="4" height="16" rx="1" fill="currentColor"/></svg>`;
    nextBtn.title = t("playNext");
    nextBtn.onclick = (e) => {
      e.stopPropagation();
      if (index === activeIndex && activeIndex + 1 < playlist.length) {
        playItem(activeIndex + 1);
      } else if (index > activeIndex) {
        playItem(index);
      } else {
        playlist.splice(activeIndex + 1, 0, playlist.splice(index, 1)[0]);
        renderPlaylist();
      }
    };

    actions.appendChild(playBtn);
    actions.appendChild(nextBtn);

    li.appendChild(thumb);
    li.appendChild(info);
    li.appendChild(actions);
    li.appendChild(type);

    li.onclick = () => playItem(index);

    playlistEl.appendChild(li);

    if (index === activeIndex) {
      setTimeout(() => {
        li.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });
      }, 120);
    }
  });

  updateLibraryCount();
  savePlaylistIfAllowed();
}

function updateAllRows() {
  renderRow("recentRow", playlist.slice(-10).reverse());
  renderRow("continueRow", playlist.slice(0, 5));
}

function addToPlaylist(items) {
  playlist.push(...items);
  updateAllRows();
  renderPlaylist();

  if (activeIndex === -1 && playlist.length > 0) {
    playItem(0);
  }
}

async function resolveOnlineItem(item, showAlert = true) {
  if (item.resolvedSrc) return item.resolvedSrc;

  if (resolveCache.has(item.src)) {
    item.resolvedSrc = resolveCache.get(item.src);
    return item.resolvedSrc;
  }

  const result = await window.api.resolveOnlineMedia(item.src);

  if (!result?.ok || !result.url) {
    if (showAlert) alert(result?.error || t("resolveFailed"));
    return null;
  }

  resolveCache.set(item.src, result.url);
  item.resolvedSrc = result.url;

  return item.resolvedSrc;
}

function preloadOnlineItems(items, limit = 3) {
  items
    .filter(item => item.type === "online")
    .slice(0, limit)
    .forEach(item => {
      resolveOnlineItem(item, false).catch(() => {});
    });
}

async function playItem(index) {
  const item = playlist[index];
  if (!item) return;

  activeIndex = index;
  mediaTitle.textContent = item.title;
  mediaDesc.textContent = t("type" + item.type.charAt(0).toUpperCase() + item.type.slice(1));
updateCockpit(item);
updateAllRows();

/* Spotify tarzı arka plan blur */
const bg = document.getElementById("bgBlur");

if (bg && item?.thumb) {
  bg.style.backgroundImage = `url("${item.thumb}")`;
  bg.style.opacity = "1";

  if (item.type === "audio") {
    bg.style.filter = "blur(100px) brightness(0.4)";
  } else {
    bg.style.filter = "blur(80px) brightness(0.5)";
  }
}

if (bg && !item?.thumb) {
  bg.style.backgroundImage = "";
  bg.style.opacity = "0";
}

  let src = item.src;

  if (item.type === "online") {
    const resolved = await resolveOnlineItem(item);
    if (!resolved) return;
    src = resolved;
  }

  player.muted = volumeSlider.value === "0";
  player.src = src;
  player.play().catch(() => {});

  renderPlaylist();
  showInterface();
}

openFilesBtn.onclick = async () => {
  const files = await window.api.openMediaFiles();
  if (!files || files.length === 0) return;

  const items = await Promise.all(files.map(async (filePath) => ({
    title: getFileName(filePath),
    src: toFileUrl(filePath),
    originalPath: filePath,
    type: getTypeFromSource(filePath),
    thumb: await generateVideoThumb(filePath)
  })));

  addToPlaylist(items);
};
renderRow("recentRow", playlist.slice(-10).reverse());
async function runYoutubeSearch() {
  const query = searchInput.value.trim();
  if (!query) return;

  searchBtn.disabled = true;
  searchBtn.textContent = t("searching");

  try {
    const res = await window.api.searchYouTube(query);

    if (!res?.ok) {
      alert(res?.error || t("searchFailed"));
      return;
    }
if (!res.videos || res.videos.length === 0) {
  alert(t("noSearchResults"));
  return;
}
    const items = res.videos.map(v => ({
  title: v.title,
  src: v.url,
  type: "online",
  thumb: v.thumb || "",
  duration: v.duration || "",
  author: v.author || ""
}));

addToPlaylist(items);
renderRow("searchRow", items);
preloadOnlineItems(items, 3);
searchInput.value = "";

  } catch (err) {
    alert(err.message || t("searchFailed"));
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = t("searchIcon");
  }
}

function renderOnlineResults(items) {
  let box = document.getElementById("onlineResultsFixed");

  if (!box) {
    box = document.createElement("div");
    box.id = "onlineResultsFixed";
    document.body.appendChild(box);
  }

  box.style.cssText = `
    position: fixed;
    left: 90px;
    right: 330px;
    top: 90px;
    bottom: 30px;
    z-index: 999999;
    overflow-y: auto;
    padding: 18px;
    background: rgba(5,8,20,0.96);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 22px;
    box-shadow: 0 0 45px rgba(255,0,90,0.35);
  `;

  box.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
      <h2 style="color:white;margin:0;">Online Results - ${items.length}</h2>
      <button id="closeOnlineResults" style="background:#ff0055;color:white;border:0;border-radius:10px;padding:8px 14px;cursor:pointer;">Kapat</button>
    </div>

    <div id="onlineGridReal" style="
      display:grid;
      grid-template-columns:repeat(auto-fill,minmax(210px,1fr));
      gap:16px;
    "></div>
  `;

  document.getElementById("closeOnlineResults").onclick = () => {
    box.remove();
  };

  const grid = document.getElementById("onlineGridReal");

  items.forEach((item) => {
    const card = document.createElement("div");

    card.style.cssText = `
      cursor:pointer;
      border-radius:18px;
      overflow:hidden;
      background:rgba(255,255,255,0.08);
      border:1px solid rgba(255,255,255,0.12);
    `;

    card.innerHTML = `
  ${item.thumb ? `<img src="${item.thumb}">` : `<div class="row-fallback">▶</div>`}

  <div class="row-hover-info">
    <div class="row-hover-play">▶</div>
    <b>${item.title || "Untitled"}</b>
    <span>${item.author || item.type || "Media"}</span>
  </div>

  <div class="row-title">${item.title}</div>
`;

    card.onclick = () => {
      const index = playlist.length;
      addToPlaylist([item]);
      playItem(index);
      box.remove();
    };

    grid.appendChild(card);
  });
}

searchBtn.onclick = runYoutubeSearch;

searchInput.onkeydown = (e) => {
  if (e.key === "Enter") {
    runYoutubeSearch();
  }
};

clearPlaylistBtn.onclick = () => {
  playlist = [];
  activeIndex = -1;
  resolveCache.clear();

  player.pause();
  player.removeAttribute("src");
  player.load();

  mediaTitle.textContent = t("noMedia");
  mediaDesc.textContent = t("desc");

  seekFill.style.width = "0%";
  currentTimeEl.textContent = "00:00";
  durationEl.textContent = "00:00";

  hero.classList.remove("playing");
  hero.classList.remove("controls-hidden");

  localStorage.removeItem("hn_playlist");

  renderPlaylist();
  updateAllRows();
  updatePlayButtons();
};

function togglePlay() {
  if (!player.src) return;

  if (player.paused) {
    player.play().catch(() => {});
  } else {
    player.pause();
  }
}

heroPlayBtn.onclick = togglePlay;
centerPlayBtn.onclick = togglePlay;
playPauseBtn.onclick = togglePlay;

prevBtn.onclick = () => {
  if (activeIndex > 0) playItem(activeIndex - 1);
};

nextBtn.onclick = () => {
  if (activeIndex + 1 < playlist.length) playItem(activeIndex + 1);
};

back10Btn.onclick = () => {
  if (!player.duration) return;
  player.currentTime = Math.max(0, player.currentTime - 10);
};

forward10Btn.onclick = () => {
  if (!player.duration) return;
  player.currentTime = Math.min(player.duration, player.currentTime + 10);
};

const speeds = [1, 1.25, 1.5, 1.75, 2, 0.75];
let speedIndex = 0;

speedBtn.onclick = () => {
  speedIndex = (speedIndex + 1) % speeds.length;
  player.playbackRate = speeds[speedIndex];
  speedBtn.textContent = `${speeds[speedIndex]}x`;
  if (cockpitSpeed) cockpitSpeed.textContent = `${speeds[speedIndex]}x`;
};

fullscreenBtn.onclick = async () => {
  const heroEl = document.querySelector(".hero");

  if (!document.fullscreenElement) {
    await heroEl.requestFullscreen();
    heroEl.classList.add("fullscreen-mode");
  } else {
    await document.exitFullscreen();
    heroEl.classList.remove("fullscreen-mode");
  }
};

document.addEventListener("fullscreenchange", () => {
  const heroEl = document.querySelector(".hero");

  if (!document.fullscreenElement) {
    heroEl.classList.remove("fullscreen-mode");
  } else {
    heroEl.classList.add("fullscreen-mode");
  }
});

muteBtn.onclick = () => {
  player.muted = !player.muted;
  muteBtn.textContent = player.muted ? "🔇" : "🔊";
  if (cockpitVol) cockpitVol.textContent = player.muted ? t("muted") : `${Math.round(player.volume * 100)}%`;
};

volumeSlider.oninput = () => {
  player.volume = Number(volumeSlider.value);
  player.muted = player.volume === 0;
  muteBtn.textContent = player.muted ? "🔇" : "🔊";
  if (cockpitVol) cockpitVol.textContent = player.muted ? t("muted") : `${Math.round(player.volume * 100)}%`;
};

seekbar.onclick = e => {
  if (!player.duration) return;

  const rect = seekbar.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;

  player.currentTime = percent * player.duration;
};

function showInterface() {
  document.body.classList.remove("ui-hidden");

  if (!document.body.classList.contains("controls-manual-hidden")) {
    hero.classList.remove("controls-hidden");
  }

  clearTimeout(hideTimer);

  if (settings?.autoHide && !player.paused && player.src) {
    hideTimer = setTimeout(() => {
      document.body.classList.add("ui-hidden");

      if (!document.body.classList.contains("controls-manual-hidden")) {
        hero.classList.add("controls-hidden");
      }
    }, 2600);
  }
}

toggleControlsBtn.onclick = (e) => {
  e.preventDefault();
  e.stopPropagation();

  const manualHidden = document.body.classList.toggle("controls-manual-hidden");

  if (manualHidden) {
    hero.classList.add("controls-hidden");
    toggleControlsBtn.textContent = t("showControls");
  } else {
    document.body.classList.remove("ui-hidden");
    hero.classList.remove("controls-hidden");
    toggleControlsBtn.textContent = t("controls");
  }
};

document.addEventListener("mousemove", showInterface);
document.addEventListener("click", (e) => {
  if (e.target === toggleControlsBtn) return;
  showInterface();
});
document.addEventListener("keydown", showInterface);
hero.addEventListener("mousemove", showInterface);
hero.addEventListener("click", showInterface);

player.addEventListener("timeupdate", () => {
  const percent = player.duration
    ? (player.currentTime / player.duration) * 100
    : 0;

  seekFill.style.width = `${percent}%`;
  currentTimeEl.textContent = formatTime(player.currentTime);
});

player.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(player.duration);
});

player.addEventListener("play", () => {
  updatePlayButtons();
  showInterface();
});

player.addEventListener("pause", () => {
  updatePlayButtons();
  document.body.classList.remove("ui-hidden");

  if (!document.body.classList.contains("controls-manual-hidden")) {
    hero.classList.remove("controls-hidden");
  }
});

player.addEventListener("ended", () => {
  hero.classList.remove("playing");
  hero.classList.remove("controls-hidden");
  document.body.classList.remove("ui-hidden");

  if (settings?.autoplayNext && activeIndex + 1 < playlist.length) {
    playItem(activeIndex + 1);
  } else {
    updatePlayButtons();
  }
});

const navButtons = document.querySelectorAll(".rail-btn");

function setActivePage(page) {
  navButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });

  if (page === "home") {
    document.querySelector(".hero")?.scrollIntoView({ behavior: "smooth" });
  }

  if (page === "library") {
    document.querySelector(".right-playlist")?.classList.add("playlist-pulse");
    setTimeout(() => document.querySelector(".right-playlist")?.classList.remove("playlist-pulse"), 700);
  }

  if (page === "online") {
    searchInput?.focus();
  }

  if (page === "settings") {
    openSettings();
  }
}

document.querySelectorAll("[data-page]").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActivePage(btn.dataset.page);
  });
});

/* ===== MANUAL TOGGLE DASHBOARD + PLAYLIST ===== */

const toggleDashboardBtn = document.getElementById("toggleDashboard");
const togglePlaylistBtn = document.getElementById("togglePlaylist");

if (toggleDashboardBtn) {
  toggleDashboardBtn.onclick = () => {
    const hidden = document.body.classList.toggle("dashboard-manual-hidden");
    toggleDashboardBtn.classList.toggle("active-toggle", !hidden);
    const rowsPanel = document.querySelector(".netflix-rows");
    if (rowsPanel) rowsPanel.classList.toggle("rows-panel-closed", hidden);
  };
}

if (togglePlaylistBtn) {
  togglePlaylistBtn.onclick = () => {
    const hidden = document.body.classList.toggle("playlist-manual-hidden");
    togglePlaylistBtn.classList.toggle("active-toggle", !hidden);
  };
}

document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

  if (e.ctrlKey && e.key === "b") {
    e.preventDefault();
    toggleDashboardBtn?.click();
  }
  if (e.ctrlKey && e.key === "l") {
    e.preventDefault();
    togglePlaylistBtn?.click();
  }
});

/* SETTINGS */

const settingsOverlay = document.getElementById("settingsOverlay");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const resetSettingsBtn = document.getElementById("resetSettingsBtn");

const defaultSettings = {
  appName: "Hybrid Neon Player",
  language: "en",
  rememberLibrary: true,
  autoHide: true,
  autoplayNext: true,
  defaultVolume: 80,
  glow: 70,
  accent: "red",
  glass: true
};

function getSavedSettings() {
  try {
    return { ...defaultSettings, ...(JSON.parse(localStorage.getItem("hn_settings")) || {}) };
  } catch {
    return defaultSettings;
  }
}

function openSettings() {
  settingsOverlay.classList.add("show");
  loadSettingsToPanel();
  document.body.classList.remove("ui-hidden");
}

function closeSettings() {
  settingsOverlay.classList.remove("show");
}

closeSettingsBtn.addEventListener("click", closeSettings);

settingsOverlay.addEventListener("click", (e) => {
  if (e.target === settingsOverlay) closeSettings();
});

document.querySelectorAll(".settings-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".settings-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".settings-page").forEach(p => p.classList.remove("active"));

    tab.classList.add("active");

    const target = tab.dataset.tab;
    document
      .querySelector(`[data-settings-page="${target}"]`)
      .classList.add("active");
  });
});

function loadSettingsToPanel() {
  const s = getSavedSettings();

  document.getElementById("settingAppName").value = s.appName;
  document.getElementById("settingLanguage").value = s.language;
  setCustomLanguageSelect(s.language);
  document.getElementById("settingRememberLibrary").checked = s.rememberLibrary;
  document.getElementById("settingAutoHide").checked = s.autoHide;
  document.getElementById("settingAutoplayNext").checked = s.autoplayNext;
  document.getElementById("settingDefaultVolume").value = s.defaultVolume;
  const glowEl = document.getElementById("settingGlow2") || document.getElementById("settingGlow");
  if (glowEl) glowEl.value = s.glow;
  const accentEl = document.getElementById("settingAccent");
  if (accentEl) accentEl.value = s.accent;
  document.getElementById("settingGlass").checked = s.glass;
}

function collectSettings() {
  const glowEl = document.getElementById("settingGlow2") || document.getElementById("settingGlow");
  return {
    appName: document.getElementById("settingAppName").value,
    language: document.getElementById("settingLanguage").value,
    rememberLibrary: document.getElementById("settingRememberLibrary").checked,
    autoHide: document.getElementById("settingAutoHide").checked,
    autoplayNext: document.getElementById("settingAutoplayNext").checked,
    defaultVolume: Number(document.getElementById("settingDefaultVolume").value),
    glow: Number(glowEl?.value || 70),
    accent: document.getElementById("settingAccent")?.value || "red",
    glass: document.getElementById("settingGlass").checked
  };
}

function applySettings(s) {
  settings = s;

  document.documentElement.style.setProperty("--neon-glow", `${s.glow / 100}`);
  document.body.classList.toggle("no-glass", !s.glass);
  document.body.dataset.accent = s.accent;

  currentLang = s.language || "en";
  setCustomLanguageSelect(currentLang);
  applyLanguage();

  const brand = document.querySelector(".brand");
  if (brand) {
    const clean = s.appName || "Hybrid Neon Player";
    const parts = clean.split(" ");
    if (parts.length >= 2) {
      brand.innerHTML = `${parts[0]}<span>${parts.slice(1).join(" ")}</span>`;
    } else {
      brand.textContent = clean;
    }
  }

  player.volume = s.defaultVolume / 100;
  volumeSlider.value = String(player.volume);
}

saveSettingsBtn.addEventListener("click", () => {
  const s = collectSettings();
  localStorage.setItem("hn_settings", JSON.stringify(s));
  applySettings(s);
  savePlaylistIfAllowed();
  closeSettings();
});

resetSettingsBtn.addEventListener("click", () => {
  localStorage.setItem("hn_settings", JSON.stringify(defaultSettings));
  loadSettingsToPanel();
  applySettings(defaultSettings);
});

/* ===== THEME SYSTEM ===== */
const themeCSS = {
  "dark-neon": {
    bg: "#0a0c14", surface: "#141828", card: "#1a1e32", border: "rgba(255,255,255,.08)",
    text: "#fff", muted: "rgba(255,255,255,.55)", topbar: "rgba(3,5,10,.72)",
    accent2: "#00eaff", sidebar: "#0f1220"
  },
  "midnight-blue": {
    bg: "#0b1628", surface: "#162544", card: "#1d3058", border: "rgba(100,160,255,.12)",
    text: "#e4ecff", muted: "rgba(180,200,240,.5)", topbar: "rgba(11,22,40,.78)",
    accent2: "#4d8bff", sidebar: "#0e1c36"
  },
  "cyber-punk": {
    bg: "#0a0014", surface: "#1a0030", card: "#2a0050", border: "rgba(200,0,255,.15)",
    text: "#f0e0ff", muted: "rgba(200,160,255,.5)", topbar: "rgba(10,0,20,.78)",
    accent2: "#c026d3", sidebar: "#120024"
  },
  "aurora-green": {
    bg: "#041210", surface: "#0a2a22", card: "#10382e", border: "rgba(16,185,129,.12)",
    text: "#e0fff4", muted: "rgba(160,220,200,.5)", topbar: "rgba(4,18,16,.78)",
    accent2: "#10b981", sidebar: "#071e18"
  },
  "sunset-red": {
    bg: "#140808", surface: "#2a1212", card: "#381818", border: "rgba(229,9,20,.15)",
    text: "#ffe4e4", muted: "rgba(255,180,180,.5)", topbar: "rgba(20,8,8,.78)",
    accent2: "#e50914", sidebar: "#1e0c0c"
  },
  "pure-light": {
    bg: "#e8eaed", surface: "#d0d3d8", card: "#f0f1f4", border: "rgba(0,0,0,.08)",
    text: "#1a1a2e", muted: "rgba(0,0,0,.45)", topbar: "rgba(240,241,244,.88)",
    accent2: "#3b82f6", sidebar: "#dcdfe4"
  }
};

const themeAccents = {
  red: "#e50914",
  cyan: "#00eaff",
  purple: "#8b5cf6",
  pink: "#ec4899",
  green: "#10b981"
};

function applyTheme(themeName) {
  if (!themeCSS[themeName]) return;
  document.body.dataset.theme = themeName;
  localStorage.setItem("hn_theme", themeName);
}

function applyAccent(accentName) {
  const hex = themeAccents[accentName];
  if (!hex) return;

  const root = document.documentElement;
  root.style.setProperty("--accent", hex);
  document.body.dataset.accent = accentName;
  localStorage.setItem("hn_accent", accentName);
}

/* Theme card click */
document.querySelectorAll(".theme-card").forEach((card) => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".theme-card").forEach(c => c.classList.remove("active"));
    card.classList.add("active");
    applyTheme(card.dataset.theme);
  });
});

/* Accent dot click */
document.querySelectorAll(".accent-dot").forEach((dot) => {
  dot.addEventListener("click", () => {
    document.querySelectorAll(".accent-dot").forEach(d => d.classList.remove("active"));
    dot.classList.add("active");
    applyAccent(dot.dataset.accent);
    document.getElementById("settingAccent").value = dot.dataset.accent;
  });
});

/* Sync glow slider from themes page to old settings */
const glow2 = document.getElementById("settingGlow2");
if (glow2) {
  glow2.addEventListener("input", () => {
    const old = document.getElementById("settingGlow");
    if (old) old.value = glow2.value;
    document.documentElement.style.setProperty("--neon-glow", `${glow2.value / 100}`);
  });
}

/* Load saved theme on startup */
(function loadSavedTheme() {
  const savedTheme = localStorage.getItem("hn_theme") || "dark-neon";
  const savedAccent = localStorage.getItem("hn_accent") || "red";
  applyTheme(savedTheme);
  applyAccent(savedAccent);

  document.querySelectorAll(".theme-card").forEach(c => {
    c.classList.toggle("active", c.dataset.theme === savedTheme);
  });
  document.querySelectorAll(".accent-dot").forEach(d => {
    d.classList.toggle("active", d.dataset.accent === savedAccent);
  });
})();

function savePlaylistIfAllowed() {
  if (!settings?.rememberLibrary) return;

  const safePlaylist = playlist.map(item => ({
    title: item.title,
    src: item.src,
    type: item.type,
    thumb: item.thumb || "",
    duration: item.duration || "",
    author: item.author || ""
  }));

  localStorage.setItem("hn_playlist", JSON.stringify(safePlaylist));
}

function loadRememberedPlaylist() {
  if (!settings?.rememberLibrary) return;

  try {
    const saved = JSON.parse(localStorage.getItem("hn_playlist")) || [];
    playlist = saved;
  } catch {
    playlist = [];
  }
}

setupCustomLanguageSelect();
applySettings(getSavedSettings());
loadRememberedPlaylist();
renderPlaylist();
updatePlayButtons();



/* =========================================================
   CEPTO NEXT LEVEL FULL INTEGRATION
   - Notification
   - Control Center extras
   - Playlist save/load/favorites/repeat/shuffle
   - Real audio visualizer
   - TR/EN context menu
   ========================================================= */

/* ---------- Extra translation keys ---------- */
(function extendTranslations() {
  if (typeof translations === "undefined") return;

  translations.en = {
    ...translations.en,
    playPause: "Play / Pause",
    previous: "Previous",
    next: "Next",
    mute: "Mute / Unmute",
    fullscreen: "Fullscreen",
    addMedia: "Add Media",
    copyTitle: "Copy Title",
    settings: "Settings",
    clearLibrary: "Clear Library",
    favorite: "Favorite",
    savePlaylist: "Save Playlist",
    loadPlaylist: "Load Playlist",
    nowPlayingToast: "Now playing",
    playlistSaved: "Playlist saved",
    playlistLoaded: "Playlist loaded",
    addedFavorite: "Added to favorites",
    removedFavorite: "Removed from favorites",
    defaultSpeed: "Default Speed",
    repeatMode: "Repeat Mode",
    repeatOff: "Off",
    repeatOne: "Repeat One",
    repeatAll: "Repeat All",
    shuffle: "Shuffle",
    shuffleDesc: "Play library in random order",
    notifications: "Notifications",
    notificationsDesc: "Show neon notifications",
    visualizerMode: "Visualizer Mode",
    visualizerReactive: "Reactive",
    visualizerSoft: "Soft"
  };

  translations.tr = {
    ...translations.tr,
    playPause: "Oynat / Duraklat",
    previous: "Önceki",
    next: "Sonraki",
    mute: "Sessiz / Sesli",
    fullscreen: "Tam Ekran",
    addMedia: "Medya Ekle",
    copyTitle: "Başlığı Kopyala",
    settings: "Ayarlar",
    clearLibrary: "Kütüphaneyi Temizle",
    favorite: "Favori",
    savePlaylist: "Listeyi Kaydet",
    loadPlaylist: "Liste Yükle",
    nowPlayingToast: "Şimdi oynatılıyor",
    playlistSaved: "Liste kaydedildi",
    playlistLoaded: "Liste yüklendi",
    addedFavorite: "Favorilere eklendi",
    removedFavorite: "Favorilerden çıkarıldı",
    defaultSpeed: "Varsayılan Hız",
    repeatMode: "Tekrar Modu",
    repeatOff: "Kapalı",
    repeatOne: "Tekrar: Tek",
    repeatAll: "Tekrar: Tümü",
    shuffle: "Karışık Çal",
    shuffleDesc: "Kütüphaneyi rastgele sırayla oynat",
    notifications: "Bildirimler",
    notificationsDesc: "Neon bildirimleri göster",
    visualizerMode: "Görselleştirici Modu",
    visualizerReactive: "Tepkisel",
    visualizerSoft: "Yumuşak"
  };

  translations.de = {
    ...translations.de,
    playPause: "Abspielen / Pause",
    previous: "Vorherige",
    next: "Nächste",
    mute: "Stummschalten",
    fullscreen: "Vollbild",
    addMedia: "Medien hinzufügen",
    copyTitle: "Titel kopieren",
    settings: "Einstellungen",
    clearLibrary: "Bibliothek leeren",
    favorite: "Favorit",
    savePlaylist: "Playlist speichern",
    loadPlaylist: "Playlist laden",
    nowPlayingToast: "Wird abgespielen",
    playlistSaved: "Playlist gespeichert",
    playlistLoaded: "Playlist geladen",
    addedFavorite: "Zu Favoriten hinzugefügt",
    removedFavorite: "Aus Favoriten entfernt",
    defaultSpeed: "Standardgeschwindigkeit",
    repeatMode: "Wiederholungsmodus",
    repeatOff: "Aus",
    repeatOne: "Einen wiederholen",
    repeatAll: "Alle wiederholen",
    shuffle: "Zufällig",
    shuffleDesc: "Bibliothek in zufälliger Reihenfolge abspielen",
    notifications: "Benachrichtigungen",
    notificationsDesc: "Neon-Benachrichtigungen anzeigen",
    visualizerMode: "Visualizer-Modus",
    visualizerReactive: "Reaktiv",
    visualizerSoft: "Sanft"
  };

  translations.es = {
    ...translations.es,
    playPause: "Reproducir / Pausar",
    previous: "Anterior",
    next: "Siguiente",
    mute: "Silenciar",
    fullscreen: "Pantalla completa",
    addMedia: "Agregar medio",
    copyTitle: "Copiar título",
    settings: "Configuración",
    clearLibrary: "Limpiar biblioteca",
    favorite: "Favorito",
    savePlaylist: "Guardar lista",
    loadPlaylist: "Cargar lista",
    nowPlayingToast: "Reproduciendo ahora",
    playlistSaved: "Lista guardada",
    playlistLoaded: "Lista cargada",
    addedFavorite: "Agregado a favoritos",
    removedFavorite: "Eliminado de favoritos",
    defaultSpeed: "Velocidad predeterminada",
    repeatMode: "Modo de repetición",
    repeatOff: "Desactivado",
    repeatOne: "Repetir uno",
    repeatAll: "Repetir todo",
    shuffle: "Aleatorio",
    shuffleDesc: "Reproducir biblioteca en orden aleatorio",
    notifications: "Notificaciones",
    notificationsDesc: "Mostrar notificaciones neon",
    visualizerMode: "Modo visualizador",
    visualizerReactive: "Reactivo",
    visualizerSoft: "Suave"
  };

  translations.fr = {
    ...translations.fr,
    playPause: "Lecture / Pause",
    previous: "Précédent",
    next: "Suivant",
    mute: "Muet",
    fullscreen: "Plein écran",
    addMedia: "Ajouter un média",
    copyTitle: "Copier le titre",
    settings: "Paramètres",
    clearLibrary: "Vider la bibliothèque",
    favorite: "Favori",
    savePlaylist: "Enregistrer la playlist",
    loadPlaylist: "Charger la playlist",
    nowPlayingToast: "Lecture en cours",
    playlistSaved: "Playlist enregistrée",
    playlistLoaded: "Playlist chargée",
    addedFavorite: "Ajouté aux favoris",
    removedFavorite: "Retiré des favoris",
    defaultSpeed: "Vitesse par défaut",
    repeatMode: "Mode répétition",
    repeatOff: "Désactivé",
    repeatOne: "Répéter un",
    repeatAll: "Répéter tout",
    shuffle: "Aléatoire",
    shuffleDesc: "Lire la bibliothèque en ordre aléatoire",
    notifications: "Notifications",
    notificationsDesc: "Afficher les notifications néon",
    visualizerMode: "Mode visualiseur",
    visualizerReactive: "Réactif",
    visualizerSoft: "Doux"
  };

  translations.ru = {
    ...translations.ru,
    playPause: "Воспроизвести / Пауза",
    previous: "Предыдущий",
    next: "Следующий",
    mute: "Звук",
    fullscreen: "Полный экран",
    addMedia: "Добавить медиа",
    copyTitle: "Копировать название",
    settings: "Настройки",
    clearLibrary: "Очистить библиотеку",
    favorite: "Избранное",
    savePlaylist: "Сохранить плейлист",
    loadPlaylist: "Загрузить плейлист",
    nowPlayingToast: "Сейчас играет",
    playlistSaved: "Плейлист сохранён",
    playlistLoaded: "Плейлист загружен",
    addedFavorite: "Добавлено в избранное",
    removedFavorite: "Удалено из избранного",
    defaultSpeed: "Скорость по умолчанию",
    repeatMode: "Режим повтора",
    repeatOff: "Выкл",
    repeatOne: "Повтор одного",
    repeatAll: "Повтор всех",
    shuffle: "Случайный порядок",
    shuffleDesc: "Воспроизводить библиотеку в случайном порядке",
    notifications: "Уведомления",
    notificationsDesc: "Показывать неоновые уведомления",
    visualizerMode: "Режим визуализатора",
    visualizerReactive: "Реактивный",
    visualizerSoft: "Мягкий"
  };

  translations.ar = {
    ...translations.ar,
    playPause: "تشغيل / إيقاف",
    previous: "السابق",
    next: "التالي",
    mute: "كتم الصوت",
    fullscreen: "ملء الشاشة",
    addMedia: "إضافة وسائط",
    copyTitle: "نسخ العنوان",
    settings: "الإعدادات",
    clearLibrary: "مسح المكتبة",
    favorite: "مفضل",
    savePlaylist: "حفظ قائمة التشغيل",
    loadPlaylist: "تحميل قائمة التشغيل",
    nowPlayingToast: "يُشغَّل الآن",
    playlistSaved: "تم حفظ القائمة",
    playlistLoaded: "تم تحميل القائمة",
    addedFavorite: "تمت الإضافة للمفضلة",
    removedFavorite: "تمت الإزالة من المفضلة",
    defaultSpeed: "السرعة الافتراضية",
    repeatMode: "وضع التكرار",
    repeatOff: "إيقاف",
    repeatOne: "تكرار واحد",
    repeatAll: "تكرار الكل",
    shuffle: "عشوائي",
    shuffleDesc: "تشغيل المكتبة بترتيب عشوائي",
    notifications: "الإشعارات",
    notificationsDesc: "عرض إشعارات نيون",
    visualizerMode: "وضع العارض",
    visualizerReactive: "تفاعلي",
    visualizerSoft: "ناعم"
  };

  translations.ja = {
    ...translations.ja,
    playPause: "再生 / 一時停止",
    previous: "前へ",
    next: "次へ",
    mute: "ミュート",
    fullscreen: "フルスクリーン",
    addMedia: "メディア追加",
    copyTitle: "タイトルをコピー",
    settings: "設定",
    clearLibrary: "ライブラリをクリア",
    favorite: "お気に入り",
    savePlaylist: "プレイリストを保存",
    loadPlaylist: "プレイリストを読み込む",
    nowPlayingToast: "再生中",
    playlistSaved: "プレイリストを保存しました",
    playlistLoaded: "プレイリストを読み込みました",
    addedFavorite: "お気に入りに追加しました",
    removedFavorite: "お気に入りから削除しました",
    defaultSpeed: "デフォルト速度",
    repeatMode: "リピートモード",
    repeatOff: "オフ",
    repeatOne: "1曲リピート",
    repeatAll: "全曲リピート",
    shuffle: "シャッフル",
    shuffleDesc: "ライブラリをランダムに再生",
    notifications: "通知",
    notificationsDesc: "ネオン通知を表示",
    visualizerMode: "ビジュアライザーモード",
    visualizerReactive: "リアクティブ",
    visualizerSoft: "ソフト"
  };

  translations.zh = {
    ...translations.zh,
    playPause: "播放 / 暂停",
    previous: "上一个",
    next: "下一个",
    mute: "静音",
    fullscreen: "全屏",
    addMedia: "添加媒体",
    copyTitle: "复制标题",
    settings: "设置",
    clearLibrary: "清空媒体库",
    favorite: "收藏",
    savePlaylist: "保存播放列表",
    loadPlaylist: "加载播放列表",
    nowPlayingToast: "正在播放",
    playlistSaved: "播放列表已保存",
    playlistLoaded: "播放列表已加载",
    addedFavorite: "已添加到收藏",
    removedFavorite: "已从收藏移除",
    defaultSpeed: "默认速度",
    repeatMode: "循环模式",
    repeatOff: "关闭",
    repeatOne: "单曲循环",
    repeatAll: "全部循环",
    shuffle: "随机播放",
    shuffleDesc: "随机顺序播放媒体库",
    notifications: "通知",
    notificationsDesc: "显示霓虹通知",
    visualizerMode: "可视化模式",
    visualizerReactive: "反应式",
    visualizerSoft: "柔和"
  };

  if (typeof applyLanguage === "function") {
    applyLanguage();
  }
})();

/* ---------- Neon toast notification system ---------- */
function showNeonToast(title, sub = "Hybrid Neon Player") {
  if (localStorage.getItem("notifications_enabled") === "false") return;

  let container = document.getElementById("neonToastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "neonToastContainer";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "neon-toast";
  toast.innerHTML = `
    <div class="neon-toast-icon">♫</div>
    <div class="neon-toast-body">
      <span class="neon-toast-title">${title || "Hybrid Neon Player"}</span>
      <span class="neon-toast-sub">${sub || ""}</span>
    </div>
  `;

  toast.addEventListener("click", () => {
    toast.classList.add("neon-toast-exit");
    setTimeout(() => toast.remove(), 350);
  });

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("neon-toast-show"));

  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add("neon-toast-exit");
      setTimeout(() => toast.remove(), 350);
    }
  }, 3500);
}

/* ---------- Control Center extras ---------- */
function getNextLevelSettings() {
  return {
    repeatMode: localStorage.getItem("repeat_mode") || "off",
    shuffleMode: localStorage.getItem("shuffle_mode") === "true",
    defaultSpeed: Number(localStorage.getItem("default_speed") || 1),
    notifications: localStorage.getItem("notifications_enabled") !== "false",
    visualizerMode: localStorage.getItem("visualizer_mode") || "reactive"
  };
}

function applyNextLevelSettings() {
  const s = getNextLevelSettings();

  if (player) {
    player.playbackRate = s.defaultSpeed;
  }

  if (typeof speedBtn !== "undefined" && speedBtn) {
    speedBtn.textContent = `${s.defaultSpeed}x`;
  }

  document.body.dataset.visualizerMode = s.visualizerMode;
}

function injectControlCenterExtraSettings() {
  if (document.getElementById("nextLevelSettingsBlock")) return;

  const playerPage = document.querySelector('[data-settings-page="player"]');
  if (!playerPage) return;

  const s = getNextLevelSettings();

  const block = document.createElement("div");
  block.id = "nextLevelSettingsBlock";
  block.innerHTML = `
    <label data-i18n="defaultSpeed">${t("defaultSpeed")}</label>
    <select id="settingDefaultSpeed">
      <option value="0.75">0.75x</option>
      <option value="1">1x</option>
      <option value="1.25">1.25x</option>
      <option value="1.5">1.5x</option>
      <option value="2">2x</option>
    </select>

    <label data-i18n="repeatMode">${t("repeatMode")}</label>
    <select id="settingRepeatMode">
      <option value="off">${t("repeatOff")}</option>
      <option value="one">${t("repeatOne")}</option>
      <option value="all">${t("repeatAll")}</option>
    </select>

    <label data-i18n="visualizerMode">${t("visualizerMode")}</label>
    <select id="settingVisualizerMode">
      <option value="reactive">${t("visualizerReactive")}</option>
      <option value="soft">${t("visualizerSoft")}</option>
    </select>

    <div class="setting-card">
      <div>
        <b data-i18n="shuffle">${t("shuffle")}</b>
        <small data-i18n="shuffleDesc">${t("shuffleDesc")}</small>
      </div>
      <input id="settingShuffleMode" type="checkbox" />
    </div>

    <div class="setting-card">
      <div>
        <b data-i18n="notifications">${t("notifications")}</b>
        <small data-i18n="notificationsDesc">${t("notificationsDesc")}</small>
      </div>
      <input id="settingNotifications" type="checkbox" />
    </div>
  `;

  playerPage.appendChild(block);

  document.getElementById("settingDefaultSpeed").value = String(s.defaultSpeed);
  document.getElementById("settingRepeatMode").value = s.repeatMode;
  document.getElementById("settingVisualizerMode").value = s.visualizerMode;
  document.getElementById("settingShuffleMode").checked = s.shuffleMode;
  document.getElementById("settingNotifications").checked = s.notifications;

  if (typeof applyI18nText === "function") {
    applyI18nText();
  }
}

function saveNextLevelSettings() {
  const speed = document.getElementById("settingDefaultSpeed")?.value;
  const repeat = document.getElementById("settingRepeatMode")?.value;
  const visualizer = document.getElementById("settingVisualizerMode")?.value;
  const shuffle = document.getElementById("settingShuffleMode")?.checked;
  const notifications = document.getElementById("settingNotifications")?.checked;

  if (speed) localStorage.setItem("default_speed", speed);
  if (repeat) localStorage.setItem("repeat_mode", repeat);
  if (visualizer) localStorage.setItem("visualizer_mode", visualizer);
  if (typeof shuffle === "boolean") localStorage.setItem("shuffle_mode", String(shuffle));
  if (typeof notifications === "boolean") localStorage.setItem("notifications_enabled", String(notifications));

  applyNextLevelSettings();
}

/* Wrap openSettings if it exists */
if (typeof openSettings === "function" && !window.__cepoOpenSettingsWrapped) {
  window.__cepoOpenSettingsWrapped = true;
  const _openSettings = openSettings;

  openSettings = function () {
    _openSettings();
    injectControlCenterExtraSettings();
  };
}

document.addEventListener("click", (e) => {
  if (e.target?.id === "saveSettingsBtn") {
    saveNextLevelSettings();
  }
});

applyNextLevelSettings();

/* ---------- Playlist save/load/favorites/repeat/shuffle ---------- */
let favoriteMap = {};

try {
  favoriteMap = JSON.parse(localStorage.getItem("hn_favorites") || "{}");
} catch {
  favoriteMap = {};
}

function saveCurrentPlaylistToFile() {
  const payload = {
    app: "Hybrid Neon Player",
    createdAt: new Date().toISOString(),
    playlist
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "hybrid-neon-playlist.json";
  a.click();

  URL.revokeObjectURL(a.href);
  showNeonToast(t("playlistSaved"));
}

function loadPlaylistFromFile() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,application/json";

  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data.playlist)) {
        alert(t("invalidPlaylistFile"));
        return;
      }

      playlist = data.playlist;
      activeIndex = -1;
      renderPlaylist();
      showNeonToast(t("playlistLoaded"));
    } catch (err) {
      alert(t("playlistLoadError"));
    }
  };

  input.click();
}

function toggleFavoriteCurrent() {
  const item = playlist[activeIndex];
  if (!item) return;

  const key = item.src || item.title;
  favoriteMap[key] = !favoriteMap[key];

  localStorage.setItem("hn_favorites", JSON.stringify(favoriteMap));
  showNeonToast(favoriteMap[key] ? t("addedFavorite") : t("removedFavorite"));

  renderPlaylist();
}

function getNextIndexSmart() {
  const repeat = localStorage.getItem("repeat_mode") || "off";
  const shuffle = localStorage.getItem("shuffle_mode") === "true";

  if (repeat === "one") return activeIndex;

  if (shuffle && playlist.length > 1) {
    let randomIndex = activeIndex;
    while (randomIndex === activeIndex) {
      randomIndex = Math.floor(Math.random() * playlist.length);
    }
    return randomIndex;
  }

  if (activeIndex + 1 < playlist.length) {
    return activeIndex + 1;
  }

  if (repeat === "all" && playlist.length > 0) {
    return 0;
  }

  return -1;
}

/* Ek playlist butonlarını sağ liste başlığına yerleştir */
function injectPlaylistActionButtons() {
  if (document.getElementById("savePlaylistBtn")) return;

  const head = document.querySelector(".playlist-head");
  if (!head) return;

  const wrap = document.createElement("div");
  wrap.className = "playlist-actions";
  wrap.innerHTML = `
    <button id="savePlaylistBtn" title="${t("savePlaylist")}">💾</button>
    <button id="loadPlaylistBtn" title="${t("loadPlaylist")}">📂</button>
    <button id="favCurrentBtn" title="${t("favorite")}">★</button>
  `;

  head.appendChild(wrap);

  document.getElementById("savePlaylistBtn").onclick = saveCurrentPlaylistToFile;
  document.getElementById("loadPlaylistBtn").onclick = loadPlaylistFromFile;
  document.getElementById("favCurrentBtn").onclick = toggleFavoriteCurrent;
}

setTimeout(injectPlaylistActionButtons, 300);

/* Akıllı next, default ended handler'dan sonra da çalışır; eski handler boşta kalırsa bu devreye girer */
player.addEventListener("ended", () => {
  const next = getNextIndexSmart();

  if (next >= 0) {
    setTimeout(() => playItem(next), 80);
  }
});

/* ---------- Audio visualizer bridge + real analyser ---------- */
const audioVisualizer = document.getElementById("audioVisualizer");
const audioTitle = document.getElementById("audioTitle");
const audioSub = document.getElementById("audioSub");
const audioCover = document.getElementById("audioCover");

function updateAudioVisualizer(item = playlist[activeIndex]) {
  if (!audioVisualizer || !hero) return;

  const isAudio = item?.type === "audio";

  hero.classList.toggle("audio-mode", !!isAudio);

  if (!isAudio || !item) return;

  if (audioTitle) {
    audioTitle.textContent = item.title || t("noMedia");
  }

  if (audioSub) {
    audioSub.textContent = item.author
      ? item.author
      : item.type?.toUpperCase?.() || "AUDIO";
  }

  if (audioCover) {
    if (item.thumb) {
      audioCover.textContent = "";
      audioCover.style.backgroundImage = `url("${item.thumb}")`;
    } else {
      audioCover.style.backgroundImage = "";
      audioCover.textContent = "♪";
    }
  }
}

let audioCtx = null;
let analyser = null;
let audioSource = null;
let visualizerRAF = null;

function initRealAudioVisualizer() {
  if (audioCtx || !player) return;

  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;

    audioSource = audioCtx.createMediaElementSource(player);
    audioSource.connect(analyser);
    analyser.connect(audioCtx.destination);
  } catch (err) {
    console.warn("Audio visualizer could not start:", err);
  }
}

function startRealAudioVisualizer() {
  initRealAudioVisualizer();

  if (!analyser) return;

  const bars = document.querySelectorAll(".audio-wave i");
  if (!bars.length) return;

  const data = new Uint8Array(analyser.frequencyBinCount);

  function draw() {
    analyser.getByteFrequencyData(data);

    bars.forEach((bar, index) => {
      const value = data[index * 2] || 0;
      const height = 12 + (value / 255) * 62;

      bar.style.height = `${height}px`;
      bar.style.opacity = String(0.45 + (value / 255) * 0.55);
    });

    visualizerRAF = requestAnimationFrame(draw);
  }

  cancelAnimationFrame(visualizerRAF);
  draw();
}

function stopRealAudioVisualizer() {
  cancelAnimationFrame(visualizerRAF);
}

player.addEventListener("play", async () => {
  updateAudioVisualizer();

  if (audioCtx?.state === "suspended") {
    await audioCtx.resume();
  }

  const item = playlist[activeIndex];

  if (item?.type === "audio") {
    startRealAudioVisualizer();
  }

  if (item) {
    showNeonToast(t("nowPlayingToast"), item.title);
  }
});

player.addEventListener("pause", () => {
  updateAudioVisualizer();
  stopRealAudioVisualizer();
});

player.addEventListener("loadedmetadata", () => updateAudioVisualizer());
player.addEventListener("emptied", () => {
  hero?.classList.remove("audio-mode");
  stopRealAudioVisualizer();
});

/* Wrap playItem so audio visualizer always updates */
if (typeof playItem === "function" && !window.__cepoPlayItemWrapped) {
  window.__cepoPlayItemWrapped = true;
  const _playItem = playItem;

  playItem = async function (index) {
    await _playItem(index);
    updateAudioVisualizer(playlist[index]);
  };
}

/* ---------- Premium neon context menu with TR/EN ---------- */
function createNeonContextMenu() {
  const oldMenu = document.getElementById("neonContextMenu");
  const oldBackdrop = document.getElementById("contextBackdrop");

  if (oldMenu) oldMenu.remove();
  if (oldBackdrop) oldBackdrop.remove();

  const backdrop = document.createElement("div");
  backdrop.className = "context-backdrop";
  backdrop.id = "contextBackdrop";

  const menu = document.createElement("div");
  menu.className = "neon-context-menu";
  menu.id = "neonContextMenu";

  menu.innerHTML = `
    <div class="context-head">
      <div class="context-title" id="ctxTitle">Hybrid Neon Player</div>
      <div class="context-sub" id="ctxSub">READY</div>
    </div>

    <button class="context-row" data-action="toggle-play">
      <span class="ctx-icon">▶</span>
      <span>${t("playPause")}</span>
      <span class="ctx-key">Space</span>
    </button>

    <button class="context-row" data-action="prev">
      <span class="ctx-icon">⏮</span>
      <span>${t("previous")}</span>
      <span class="ctx-key">←</span>
    </button>

    <button class="context-row" data-action="next">
      <span class="ctx-icon">⏭</span>
      <span>${t("next")}</span>
      <span class="ctx-key">→</span>
    </button>

    <div class="context-divider"></div>

<button class="context-row" data-action="download-video">
  <span class="ctx-icon">⬇</span>
  <span>Download Video</span>
</button>

<button class="context-row" data-action="download-mp3">
  <span class="ctx-icon">🎵</span>
  <span>Download MP3</span>
</button>

    <button class="context-row" data-action="mute">
      <span class="ctx-icon">🔊</span>
      <span>${t("mute")}</span>
      <span class="ctx-key">M</span>
    </button>

    <button class="context-row" data-action="fullscreen">
      <span class="ctx-icon">⛶</span>
      <span>${t("fullscreen")}</span>
      <span class="ctx-key">F</span>
    </button>

    <div class="context-divider"></div>

    <button class="context-row" data-action="favorite">
      <span class="ctx-icon">★</span>
      <span>${t("favorite")}</span>
      <span class="ctx-key">Fav</span>
    </button>

    <button class="context-row" data-action="save-playlist">
      <span class="ctx-icon">💾</span>
      <span>${t("savePlaylist")}</span>
      <span class="ctx-key">JSON</span>
    </button>

    <button class="context-row" data-action="load-playlist">
      <span class="ctx-icon">📂</span>
      <span>${t("loadPlaylist")}</span>
      <span class="ctx-key">JSON</span>
    </button>

    <div class="context-divider"></div>

    <button class="context-row" data-action="add-media">
      <span class="ctx-icon">＋</span>
      <span>${t("addMedia")}</span>
      <span class="ctx-key">A</span>
    </button>

    <button class="context-row" data-action="copy-title">
      <span class="ctx-icon">⧉</span>
      <span>${t("copyTitle")}</span>
      <span class="ctx-key">C</span>
    </button>

    <button class="context-row" data-action="settings">
      <span class="ctx-icon">⚙</span>
      <span>${t("settings")}</span>
      <span class="ctx-key">S</span>
    </button>

    <div class="context-divider"></div>

    <button class="context-row danger" data-action="clear-library">
      <span class="ctx-icon">×</span>
      <span>${t("clearLibrary")}</span>
      <span class="ctx-key">Del</span>
    </button>
  `;

  document.body.appendChild(backdrop);
  document.body.appendChild(menu);

  backdrop.addEventListener("click", hideNeonContextMenu);

  menu.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      runContextAction(btn.dataset.action);
      hideNeonContextMenu();
    });
  });
}

function getContextItem() {
  return playlist?.[activeIndex] || null;
}

function updateContextHeader() {
  const item = getContextItem();
  const title = document.getElementById("ctxTitle");
  const sub = document.getElementById("ctxSub");

  if (title) {
    title.textContent = item?.title || mediaTitle?.textContent || "Hybrid Neon Player";
  }

  if (sub) {
    const state = player?.src
      ? player.paused ? t("paused") : t("playing")
      : t("ready");

    sub.textContent = item
      ? `${t("type" + (item.type?.charAt?.(0)?.toUpperCase?.() || "") + (item.type?.slice?.(1) || ""))} • ${state}`
      : state;
  }

  const playIcon = document.querySelector('[data-action="toggle-play"] .ctx-icon');
  if (playIcon) playIcon.textContent = player?.src && !player.paused ? "Ⅱ" : "▶";

  const muteIcon = document.querySelector('[data-action="mute"] .ctx-icon');
  if (muteIcon) muteIcon.textContent = player?.muted ? "🔇" : "🔊";

  const noMedia = !(player && player.src);

  ["toggle-play", "prev", "next", "mute", "fullscreen", "copy-title", "favorite"].forEach((action) => {
    const btn = document.querySelector(`[data-action="${action}"]`);
    if (!btn) return;
    btn.classList.toggle("disabled", noMedia);
  });

  const prev = document.querySelector('[data-action="prev"]');
  const next = document.querySelector('[data-action="next"]');

  if (prev) prev.classList.toggle("disabled", activeIndex <= 0);
  if (next) next.classList.toggle("disabled", activeIndex < 0 || activeIndex + 1 >= playlist.length);
}

function showNeonContextMenu(x, y) {
  createNeonContextMenu();
  updateContextHeader();

  const menu = document.getElementById("neonContextMenu");
  const backdrop = document.getElementById("contextBackdrop");
  if (!menu || !backdrop) return;

  backdrop.classList.add("show");
  menu.classList.add("show");

  const rect = menu.getBoundingClientRect();
  const padding = 12;

  const safeX = Math.min(x, window.innerWidth - rect.width - padding);
  const safeY = Math.min(y, window.innerHeight - rect.height - padding);

  menu.style.left = `${Math.max(padding, safeX)}px`;
  menu.style.top = `${Math.max(padding, safeY)}px`;
}

function hideNeonContextMenu() {
  const menu = document.getElementById("neonContextMenu");
  const backdrop = document.getElementById("contextBackdrop");

  if (menu) menu.classList.remove("show");
  if (backdrop) backdrop.classList.remove("show");
}

function runContextAction(action) {
  if (action === "download-video") downloadCurrent("video");
  if (action === "download-mp3") downloadCurrent("mp3");
  if (action === "toggle-play") togglePlay();
  if (action === "prev" && activeIndex > 0) playItem(activeIndex - 1);
  if (action === "next" && activeIndex + 1 < playlist.length) playItem(activeIndex + 1);
  if (action === "mute") muteBtn?.click();
  if (action === "fullscreen") fullscreenBtn?.click();
  if (action === "add-media") openFilesBtn?.click();
  if (action === "settings") typeof openSettings === "function" ? openSettings() : document.querySelector('[data-page="settings"]')?.click();
  if (action === "copy-title") {
    const item = getContextItem();
    const text = item?.title || mediaTitle?.textContent || "Hybrid Neon Player";
    navigator.clipboard?.writeText(text).catch(() => {});
  }
  if (action === "clear-library") clearPlaylistBtn?.click();
  if (action === "favorite") toggleFavoriteCurrent();
  if (action === "save-playlist") saveCurrentPlaylistToFile();
  if (action === "load-playlist") loadPlaylistFromFile();
}

document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  e.stopPropagation();
  showNeonContextMenu(e.clientX, e.clientY);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") hideNeonContextMenu();
});

/* Dil değişince menü yeniden oluşsun */
if (typeof applyLanguage === "function" && !window.__cepoApplyLanguageWrapped) {
  window.__cepoApplyLanguageWrapped = true;
  const _applyLanguage = applyLanguage;

  applyLanguage = function () {
    _applyLanguage();
    if (typeof hideNeonContextMenu === "function") hideNeonContextMenu();
  };
}

function compactPlaylistHeaderButtons() {
  const clearBtn = document.getElementById("clearPlaylistBtn");
  const head = document.querySelector(".playlist-head");

  if (!clearBtn || !head) return;

  clearBtn.textContent = "🗑";
  clearBtn.title = t ? t("clearLibrary") : "Clear Library";
  clearBtn.setAttribute("aria-label", "Clear Library");

  let actions = document.querySelector(".playlist-actions");

  if (!actions) {
    actions = document.createElement("div");
    actions.className = "playlist-actions";
    head.appendChild(actions);
  }

  if (!actions.contains(clearBtn)) {
    actions.prepend(clearBtn);
  }

  const saveBtn = document.getElementById("savePlaylistBtn");
  const loadBtn = document.getElementById("loadPlaylistBtn");
  const favBtn = document.getElementById("favCurrentBtn");

  if (saveBtn) {
    saveBtn.textContent = "💾";
    saveBtn.title = t ? t("savePlaylist") : "Save Playlist";
  }

  if (loadBtn) {
    loadBtn.textContent = "📂";
    loadBtn.title = t ? t("loadPlaylist") : "Load Playlist";
  }

  if (favBtn) {
    favBtn.textContent = "★";
    favBtn.title = t ? t("favorite") : "Favorite";
  }
}

setTimeout(compactPlaylistHeaderButtons, 500);
document.addEventListener("click", () => {
  setTimeout(compactPlaylistHeaderButtons, 80);
});

if (typeof applyLanguage === "function" && !window.__compactPlaylistLangWrapped) {
  window.__compactPlaylistLangWrapped = true;
  const __oldApplyLanguageCompact = applyLanguage;

  applyLanguage = function () {
    __oldApplyLanguageCompact();
    compactPlaylistHeaderButtons();
  };
}

if (!window.__miniBridgeReady) {
  window.__miniBridgeReady = true;

  function getMiniPlayerState() {
    const item = playlist[activeIndex];

    const hasMedia = !!(player && player.src);

    const progress = player.duration
      ? (player.currentTime / player.duration) * 100
      : 0;

    return {
      hasMedia,
      title: item?.title || mediaTitle?.textContent || "Hybrid Neon Player",
      sub: item
        ? `${t("type" + (item.type?.charAt?.(0)?.toUpperCase?.() || "") + (item.type?.slice?.(1) || ""))} ${item.author ? "• " + item.author : ""}`
        : t("ready"),
      type: item?.type || "idle",
      thumb: item?.thumb || "",
      playing: !!(player.src && !player.paused),
      progress
    };
  }

  function sendMiniPlayerState() {
    window.api?.sendMainPlayerState?.(getMiniPlayerState());
  }

  window.api?.onMiniCommand?.((command) => {
    if (command === "toggle-play") {
  return;
}

    if (command === "prev" && activeIndex > 0) {
      playItem(activeIndex - 1);
    }

    if (command === "next" && activeIndex + 1 < playlist.length) {
      playItem(activeIndex + 1);
    }

    if (typeof command === "object" && command?.type === "seek") {
      if (player.duration) {
        player.currentTime = (Number(command.percent) / 100) * player.duration;
      }
    }

    setTimeout(sendMiniPlayerState, 120);
  });

  window.api?.onMiniRequestState?.(() => {
    sendMiniPlayerState();
  });

  player.addEventListener("play", sendMiniPlayerState);
  player.addEventListener("pause", sendMiniPlayerState);
  player.addEventListener("timeupdate", sendMiniPlayerState);
  player.addEventListener("loadedmetadata", sendMiniPlayerState);
  player.addEventListener("ended", sendMiniPlayerState);
  player.addEventListener("emptied", sendMiniPlayerState);

  setInterval(sendMiniPlayerState, 1200);
  sendMiniPlayerState();
}

window.api.onMiniCommand((cmd) => {
  if (cmd === "toggle-play") togglePlay();

  if (cmd === "pause" && player && !player.paused) {
    player.pause();
  }

  if (cmd === "prev" && activeIndex > 0) {
    playItem(activeIndex - 1);
  }

  if (cmd === "next" && activeIndex + 1 < playlist.length) {
    playItem(activeIndex + 1);
  }

  if (cmd === "mute") {
    player.muted = !player.muted;
    if (muteBtn) muteBtn.textContent = player.muted ? "🔇" : "🔊";
  }

  if (typeof cmd === "object" && cmd.type === "seek") {
    if (player.duration) {
      player.currentTime = (cmd.percent / 100) * player.duration;
    }
  }

  if (typeof cmd === "object" && cmd.type === "volume") {
    player.volume = Math.max(0, Math.min(1, cmd.value));
    player.muted = player.volume === 0;

    if (volumeSlider) volumeSlider.value = player.volume;
    if (muteBtn) muteBtn.textContent = player.muted ? "🔇" : "🔊";
  }

  setTimeout(sendMiniState, 100);
});

let _stateThrottleTimer = null;
function sendMiniStateImmediate() {
  const item = playlist[activeIndex];

  window.api.sendMainPlayerState({
    hasMedia: !!player.src,
    title: item?.title || mediaTitle.textContent || "Hybrid Neon Player",
    sub: item?.author || item?.type?.toUpperCase?.() || "",
    type: item?.type || "idle",
    thumb: item?.thumb || "",
    playing: !!player.src && !player.paused,
    progress: player.duration ? (player.currentTime / player.duration) * 100 : 0,
    currentTime: player.currentTime || 0,
    duration: player.duration || 0,
    volume: player.volume,
    muted: player.muted
  });
}

function sendMiniState() {
  if (_stateThrottleTimer) return;
  _stateThrottleTimer = setTimeout(() => {
    _stateThrottleTimer = null;
    sendMiniStateImmediate();
  }, 100);
}

window.api.onMiniRequestState(sendMiniStateImmediate);

player.addEventListener("play", sendMiniStateImmediate);
player.addEventListener("pause", sendMiniStateImmediate);
player.addEventListener("timeupdate", sendMiniState);
player.addEventListener("loadedmetadata", sendMiniStateImmediate);
player.addEventListener("volumechange", sendMiniStateImmediate);

let downloadCounter = 0;

function addDownloadItem(title, type) {
  const id = `dl-${Date.now()}-${++downloadCounter}`;
  const list = document.getElementById("downloadList");
  if (!list) return id;

  const el = document.createElement("div");
  el.className = "download-item";
  el.id = id;
  el.innerHTML = `
    <div class="download-top">
      <div class="download-title">${title}</div>
      <button class="download-remove" title="Kaldir">×</button>
    </div>
    <div class="download-status">${type.toUpperCase()} indiriliyor...</div>
    <div class="download-bar"><div class="download-fill" style="width:0%"></div></div>
  `;

  el.querySelector(".download-remove").onclick = () => el.remove();
  list.prepend(el);

  return id;
}

window.api?.onDownloadProgress?.((data) => {
  const el = document.getElementById(data.id);
  if (!el) return;

  const fill = el.querySelector(".download-fill");
  const status = el.querySelector(".download-status");

  if (fill) fill.style.width = `${data.percent || 0}%`;
  if (status) status.textContent = data.status || "";
});

async function downloadCurrent(type = "video") {
  const item = playlist[activeIndex];

  if (!item) {
    alert(t("noOnlineMedia"));
    return;
  }

  if (item.type !== "online") {
    alert(t("onlyYouTube"));
    return;
  }

  const downloadId = addDownloadItem(item.title, type);

  console.log("DOWNLOAD CLICKED:", type, item.title, downloadId);

  if (!downloadId) {
    alert(t("downloadFail"));
    return;
  }

  if (!window.api?.downloadMedia) {
    alert(t("downloadNotConnected"));
    return;
  }

  const res = await window.api.downloadMedia({
    id: downloadId,
    url: item.src,
    type,
    title: item.title
  });

  if (res?.ok) {
    showNeonToast("Download complete", item.title);
  } else {
    alert(res?.error || t("downloadFail"));
  }
}

function renderRow(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  items.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "row-card";

    card.innerHTML = `
      ${item.thumb ? `<img src="${item.thumb}">` : ""}
      <div class="row-title">${item.title}</div>
    `;

    card.onclick = () => {
      const startIndex = playlist.length;
      addToPlaylist([item]);
      playItem(startIndex);
    };

    container.appendChild(card);
  });
}
renderRow("continueRow", playlist.slice(0, 5));

document.querySelectorAll(".row-scroll").forEach((row) => {
  row.addEventListener("wheel", (e) => {
    e.preventDefault();
    row.scrollLeft += e.deltaY;
  }, { passive: false });
});


/* DOWNLOAD / NETFLIX ROWS PANEL - CLEAN FINAL */

(function () {
  var rowsPanel = document.querySelector(".netflix-rows");
  var closeBtn = document.getElementById("closeDownloadManager");
  var folderBtn = document.getElementById("openDownloadsFolderBtn");

  if (!rowsPanel || !closeBtn) return;

  closeBtn.onclick = function (e) {
    e.preventDefault();
    e.stopPropagation();

    document.body.classList.add("dashboard-manual-hidden");
    rowsPanel.classList.add("rows-panel-closed");
    if (toggleDashboardBtn) toggleDashboardBtn.classList.add("active-toggle");
  };

  if (folderBtn) {
    folderBtn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();

      if (window.api?.openDownloadsFolder) {
        window.api.openDownloadsFolder();
      } else {
        alert(t("folderNotConnected"));
      }
    };
  }
})();

/* =========================================================
   REMOTE CONTROL
   ========================================================= */
(function setupRemoteControl() {
  const remoteToggle = document.getElementById("settingRemote");
  const remoteInfo = document.getElementById("remoteInfo");
  const remoteUrl = document.getElementById("remoteUrl");
  const copyBtn = document.getElementById("copyRemoteUrl");
  const copyStatus = document.getElementById("copyStatus");

  if (!remoteToggle || !remoteInfo || !remoteUrl) return;

  const saved = localStorage.getItem("remote_enabled") === "true";
  remoteToggle.checked = saved;

  if (saved) {
    initRemote();
  }

  remoteToggle.addEventListener("change", () => {
    const enabled = remoteToggle.checked;
    localStorage.setItem("remote_enabled", enabled);
    if (enabled) {
      initRemote();
    } else {
      if (window.api?.remoteToggle) window.api.remoteToggle(false);
      remoteInfo.style.display = "none";
    }
  });

  async function initRemote() {
    if (!window.api?.remoteToggle) return;
    await window.api.remoteToggle(true);
    const status = await window.api.remoteStatus?.();
    if (!status || !status.running) return;

    remoteUrl.textContent = status.url;
    remoteUrl.href = status.url;
    remoteInfo.style.display = "block";

    if (typeof QRCode !== "undefined") {
      drawQR(status.url);
    }
  }

  function drawQR(url) {
    const canvas = document.getElementById("remoteQR");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    try {
      const qr = QRCode.generate(url);
      const n = qr.size;
      const quiet = 4;
      const total = n + quiet * 2;
      const px = Math.floor(180 / total);
      canvas.width = canvas.height = total * px;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#000000";
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (qr.modules[r][c]) {
            ctx.fillRect((quiet + c) * px, (quiet + r) * px, px, px);
          }
        }
      }
    } catch (e) {
      console.error("QR generation failed:", e);
      canvas.style.display = "none";
    }
  }

  if (copyBtn) {
    copyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(remoteUrl.textContent);
        if (copyStatus) {
          copyStatus.textContent = t("copied") || "Kopyalandı!";
          copyStatus.style.opacity = "1";
          setTimeout(() => { copyStatus.style.opacity = "0"; }, 2000);
        }
      } catch {
        const ta = document.createElement("textarea");
        ta.value = remoteUrl.textContent;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        if (copyStatus) {
          copyStatus.textContent = t("copied") || "Kopyalandı!";
          copyStatus.style.opacity = "1";
          setTimeout(() => { copyStatus.style.opacity = "0"; }, 2000);
        }
      }
    };
  }

  if (window.api?.onRemoteCommand) {
    window.api.onRemoteCommand((command) => {
      if (typeof command === "string") {
        handleRemoteStrCommand(command);
      } else if (command && typeof command.cmd === "string") {
        handleRemoteObjCommand(command);
      }
    });
  }

  if (window.api?.onRemoteSync) {
    window.api.onRemoteSync(() => {
      setTimeout(sendMiniStateImmediate, 50);
    });
  }

  function handleRemoteStrCommand(cmd) {
    switch (cmd) {
      case "toggle-play":
        document.getElementById("playPauseBtn")?.click();
        break;
      case "prev":
        document.getElementById("prevBtn")?.click();
        break;
      case "next":
        document.getElementById("nextBtn")?.click();
        break;
      case "mute":
        document.getElementById("muteBtn")?.click();
        break;
      case "seek-back":
        if (player && player.duration) {
          player.currentTime = Math.max(0, player.currentTime - 10);
        }
        break;
      case "seek-forward":
        if (player && player.duration) {
          player.currentTime = Math.min(player.duration, player.currentTime + 10);
        }
        break;
      case "speed":
        document.getElementById("speedBtn")?.click();
        break;
      case "shuffle": {
        const shuffleSetting = document.getElementById("settingShuffleMode");
        if (shuffleSetting) {
          shuffleSetting.checked = !shuffleSetting.checked;
          localStorage.setItem("shuffle_mode", String(shuffleSetting.checked));
        }
        break;
      }
      case "fullscreen":
        break;
    }
  }

  function handleRemoteObjCommand(command) {
    switch (command.cmd) {
      case "seek":
        if (player && player.duration && typeof command.pct === "number") {
          player.currentTime = command.pct * player.duration;
        }
        break;
      case "volume":
        if (typeof command.value === "number") {
          player.volume = Math.max(0, Math.min(1, command.value));
          player.muted = command.value === 0;
          document.getElementById("volumeSlider").value = command.value * 100;
        }
        break;
    }
  }

  /* ===== UPDATE CHECK ===== */
  const checkUpdateBtn = document.getElementById("checkUpdateBtn");
  const updateStatusEl = document.getElementById("updateStatus");
  const currentVersionEl = document.getElementById("currentVersion");
  let updateProgressBar = document.getElementById("updateProgressBar");

  if (!updateProgressBar && checkUpdateBtn) {
    updateProgressBar = document.createElement("div");
    updateProgressBar.id = "updateProgressBar";
    updateProgressBar.style.cssText = "width:100%;max-width:340px;height:6px;background:rgba(255,255,255,.08);border-radius:3px;margin:12px auto 0;display:none;overflow:hidden;";
    updateProgressBar.innerHTML = '<div style="height:100%;width:0%;background:var(--accent,#00e5ff);border-radius:3px;transition:width .3s;box-shadow:0 0 8px rgba(0,229,255,.4)"></div>';
    checkUpdateBtn.parentNode.insertBefore(updateProgressBar, checkUpdateBtn.nextSibling);
  }

  if (window.api?.onUpdateDownloadProgress && updateProgressBar) {
    window.api.onUpdateDownloadProgress((data) => {
      if (data.pct >= 0) {
        updateProgressBar.style.display = "block";
        updateProgressBar.querySelector("div").style.width = data.pct + "%";
        updateStatusEl.textContent = (t("downloading") || "Downloading") + "... " + data.pct + "%";
      }
    });
  }

  if (checkUpdateBtn && window.api?.checkForUpdate) {
    checkUpdateBtn.onclick = async () => {
      checkUpdateBtn.disabled = true;
      checkUpdateBtn.textContent = "...";
      updateStatusEl.textContent = t("checking") || "Checking...";
      if (updateProgressBar) updateProgressBar.style.display = "none";

      try {
        const info = await window.api.checkForUpdate();

        if (info.error) {
          updateStatusEl.textContent = (t("updateError") || "Update check failed") + ": " + info.error;
          updateStatusEl.style.color = "#ff6b6b";
          checkUpdateBtn.disabled = false;
          checkUpdateBtn.textContent = t("checkUpdate") || "Check for Updates";
        } else if (info.noRelease) {
          updateStatusEl.textContent = t("noRelease") || "No releases available yet";
          updateStatusEl.style.color = "var(--muted, rgba(255,255,255,.45))";
          checkUpdateBtn.disabled = false;
          checkUpdateBtn.textContent = t("checkUpdate") || "Check for Updates";
        } else if (currentVersionEl) {
          currentVersionEl.textContent = "v" + info.currentVersion;

          if (info.hasUpdate) {
            updateStatusEl.textContent = (t("updateAvailable") || "Update available") + ": v" + info.latestVersion;
            updateStatusEl.style.color = "#00e5ff";

            if (info.assetUrl) {
              checkUpdateBtn.textContent = t("downloadInstall") || "Download & Install";
              checkUpdateBtn.disabled = false;
              checkUpdateBtn.onclick = async () => {
                checkUpdateBtn.disabled = true;
                checkUpdateBtn.textContent = "...";
                updateStatusEl.textContent = (t("downloading") || "Downloading") + "...";

                try {
                  const result = await window.api.downloadUpdate(info.assetUrl);
                  if (result.error) {
                    updateStatusEl.textContent = (t("downloadFailed") || "Download failed") + ": " + result.error;
                    updateStatusEl.style.color = "#ff6b6b";
                    checkUpdateBtn.disabled = false;
                    checkUpdateBtn.textContent = t("downloadInstall") || "Download & Install";
                  } else if (result.success) {
                    updateStatusEl.textContent = t("installing") || "Installing...";
                    updateStatusEl.style.color = "#d500f9";
                    checkUpdateBtn.textContent = t("installing") || "Installing...";
                    if (updateProgressBar) {
                      updateProgressBar.style.display = "block";
                      updateProgressBar.querySelector("div").style.width = "100%";
                    }
                    await window.api.installUpdate(result.path);
                  }
                } catch (e) {
                  updateStatusEl.textContent = (t("downloadFailed") || "Download failed");
                  updateStatusEl.style.color = "#ff6b6b";
                  checkUpdateBtn.disabled = false;
                  checkUpdateBtn.textContent = t("downloadInstall") || "Download & Install";
                }
              };
            } else {
              checkUpdateBtn.textContent = t("openGitHub") || "Open GitHub";
              checkUpdateBtn.disabled = false;
              checkUpdateBtn.onclick = () => {
                if (info.url) window.api?.openURL ? window.api.openURL(info.url) : window.open(info.url, "_blank");
              };
            }

            let changelogDiv = document.querySelector(".update-changelog");
            if (changelogDiv && info.body) {
              const existingVersions = changelogDiv.querySelectorAll(".cl-version");
              let alreadyHasVersion = false;
              existingVersions.forEach(v => { if (v.textContent === "v" + info.latestVersion) alreadyHasVersion = true; });

              if (!alreadyHasVersion) {
                const item = document.createElement("div");
                item.className = "changelog-item";
                const dateStr = info.publishedAt ? new Date(info.publishedAt).toLocaleDateString() : "";
                const bodyLines = info.body.split("\n").filter(l => l.trim());
                const listItems = bodyLines.map(l => {
                  l = l.replace(/^[-*]\s*/, "");
                  return "<li>" + l.replace(/</g, "&lt;") + "</li>";
                }).join("");
                item.innerHTML =
                  '<span class="cl-version">v' + info.latestVersion + "</span>" +
                  '<span class="cl-date">' + dateStr + "</span>" +
                  "<ul>" + listItems + "</ul>";
                changelogDiv.insertBefore(item, changelogDiv.firstChild);
              }
            }
          } else {
            updateStatusEl.textContent = t("upToDate") || "You are up to date!";
            updateStatusEl.style.color = "#00e676";
            checkUpdateBtn.textContent = t("checkUpdate") || "Check for Updates";
            checkUpdateBtn.disabled = false;
          }
        }
      } catch (e) {
        updateStatusEl.textContent = (t("updateError") || "Update check failed");
        updateStatusEl.style.color = "#ff6b6b";
        checkUpdateBtn.disabled = false;
        checkUpdateBtn.textContent = t("checkUpdate") || "Check for Updates";
      }
    };
  }
})();
