// Service worker v1 (reset / simple cache-first for app shell)
const CACHE = 'ydm-v1';
const CORE = [
  './',
  './index.html',
  './services.html',
  './contact.html',
  './style.css',
  './main.js?v=1',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // only same-origin GET requests
  if (req.method !== 'GET' || url.origin !== location.origin) return;

  // App shell: cache-first, fall back to network
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).catch(() => hit))
  );
});