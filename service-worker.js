// Basic offline cache for the single page app
const CACHE = 'mcfattys-v3';
const ASSETS = [
  './',
  './index.html',
  './logo.png',
  './css/themes.css',
  './css/base.css',
  './css/layout.css',
  './css/tiles.css',
  './js/main.js',
  './js/tiles.js',
  './js/tiles/logo.js',
  './js/tiles/manifesto.js',
  './js/tiles/welcome.js',
  './js/tiles/growth.js',
  './js/tiles/support.js',
  './js/tiles/stats.js',
  './js/tiles/quick-add.js',
  './js/tiles/recent-log.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon-180.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Network-first for navigations, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put('./', copy)).catch(()=>{});
        return r;
      }).catch(() => caches.match('./'))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
      return r;
    }))
  );
});