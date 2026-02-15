
const CACHE_NAME = 'radio-vida-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Network First para o stream e metadados, Cache First para o resto
  if (event.request.url.includes('/api/') || event.request.url.includes('stream')) {
    return; // Não cachear chamadas de API ou Stream
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
