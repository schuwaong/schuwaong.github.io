const CACHE_VERSION = "ic-educate-pwa-v9";
const APP_SHELL = [
  "./",
  "./index.html",
  "./admin.html",
  "./student-resources.html",
  "./ai-tutor-prompts.html",
  "./privacy.html",
  "./terms.html",
  "./support.html",
  "./delete-account.html",
  "./find-tutor.html",
  "./teachers.html",
  "./leads.html",
  "./hong-kong.html",
  "./offline.html",
  "./instaphoto/index.html",
  "./instaphoto/ai-tutor-prompts.html",
  "./styles.css",
  "./landing.js",
  "./app.js",
  "./admin.js",
  "./delete-account.js",
  "./find-tutor.js",
  "./pwa.js",
  "./teachers.js",
  "./instaphoto/app.js",
  "./instaphoto/styles.css",
  "./login/index.html",
  "./login/login.js",
  "./config.js",
  "./manifest.webmanifest",
  "./assets/pwa/icon-192.png",
  "./assets/pwa/icon-512.png",
  "./assets/pwa/apple-touch-icon.png",
  "./assets/space-bg.svg",
  "./assets/space-dashboard.svg",
  "./assets/space-teacher-orbit.svg",
  "./assets/space-memory-loop.svg",
  "./assets/weak-topic-recovery-hero.svg",
  "./assets/tutor-match-visual.svg",
  "./assets/seven-day-recovery-board.svg",
  "./assets/teacher-guidance-BjXlXmXR.png",
  "./assets/materials-preview-BxrShBP-.png",
  "./assets/teacher-portraits-sheet-DXmfbI93.png",
  "./assets/student-portraits-gemini.png"
];

const isSameOrigin = (request) => new URL(request.url).origin === self.location.origin;
const isHtmlRequest = (request) =>
  request.mode === "navigate" || request.headers.get("accept")?.includes("text/html");
const isReleaseCriticalAsset = (request) => {
  const { pathname } = new URL(request.url);
  return (
    ["script", "style", "worker", "manifest"].includes(request.destination)
    || /\.(?:js|css|webmanifest)$/i.test(pathname)
  );
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (!isSameOrigin(request) || request.method !== "GET") return;

  if (isHtmlRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("./offline.html")))
    );
    return;
  }

  if (isReleaseCriticalAsset(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
