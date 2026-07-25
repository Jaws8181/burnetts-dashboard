const CACHE_NAME = 'burnetts-dashboard-v6';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/js/config.js',
  '/js/auth.js',
  '/js/router.js',
  '/js/dashboard.js',
  '/js/orders.js',
  '/js/inventory.js',
  '/js/users.js',
  '/js/settings.js',
  '/js/app.js',
  '/css/styles.css',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
