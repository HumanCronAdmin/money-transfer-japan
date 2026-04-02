const CACHE_NAME = 'mt-japan-v1';
const ASSETS = [
  '/money-transfer-japan/',
  '/money-transfer-japan/index.html',
  '/money-transfer-japan/css/style.css',
  '/money-transfer-japan/js/app.js',
  '/money-transfer-japan/js/scam-checker.js',
  '/money-transfer-japan/js/large-transfers.js',
  '/money-transfer-japan/data/services.json',
  '/money-transfer-japan/data/scam-patterns.json',
  '/money-transfer-japan/favicon.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(r => {
        if (r.ok) {
          const clone = r.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
