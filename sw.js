const CACHE_NAME = 'multi-viewer-v1';
const urlsToCache = [
  '/Multi-Viewer/',
  '/Multi-Viewer/index.html',
  '/Multi-Viewer/manifest.json',
  '/Multi-Viewer/favicon.ico',
  '/Multi-Viewer/vite.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});