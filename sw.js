const CACHE_NAME = 'burnetts-dashboard-v3';
const CACHE_URLS = [
  '/burnetts-dashboard/',
  '/burnetts-dashboard/index.html',
  '/burnetts-dashboard/manifest.json',
  '/burnetts-dashboard/js/config.js',
  '/burnetts-dashboard/js/auth.js',
  '/burnetts-dashboard/js/router.js',
  '/burnetts-dashboard/js/dashboard.js',
  '/burnetts-dashboard/js/orders.js',
  '/burnetts-dashboard/js/inventory.js',
  '/burnetts-dashboard/js/users.js',
  '/burnetts-dashboard/js/settings.js',
  '/burnetts-dashboard/js/app.js',
  '/burnetts-dashboard/css/styles.css',
  '/burnetts-dashboard/icons/icon-192.png',
  '/burnetts-dashboard/icons/icon-512.png',
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
