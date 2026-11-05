// =========================================================
// SERVICE WORKER – działanie offline (PWA)
//  • pliki aplikacji: najpierw sieć (zawsze świeża wersja), awaryjnie pamięć podręczna
//  • biblioteki z CDN (sql.js): najpierw pamięć podręczna (wersje są przypięte)
//  Po zmianie listy SHELL zwiększ CACHE_VERSION.
// =========================================================

const CACHE_VERSION = 'inf04-v1.0.0';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/tokens.css',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './js/main.js',
  './js/config.js',
  './vendor/marked.umd.js',
  './vendor/purify.min.js',
  './vendor/highlight.min.js',
  './data/manifest.json',
  './assets/icons/favicon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // CDN – cache first
  if (url.origin !== self.location.origin) {
    if (url.hostname === 'cdn.jsdelivr.net') {
      event.respondWith(
        caches.match(request).then((hit) => hit || fetch(request).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(request, copy));
          }
          return res;
        }))
      );
    }
    return;
  }

  // Własne pliki – network first
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(request, copy));
        }
        return res;
      })
      .catch(() => caches.match(request, { ignoreSearch: true }).then((hit) => hit || caches.match('./index.html')))
  );
});
