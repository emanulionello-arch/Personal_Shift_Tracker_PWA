const CACHE_NAME = 'turni-app-v13';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png', // Aggiunto!
  './icon-512.png', // Aggiunto!
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
