// Service Worker Configuration
const CACHE_NAME = 'dentistas-v1';
const urlsToCache = [
  '/',
  '/static/css/',
  '/static/js/',
  '/assets/img/',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;800&display=swap'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});
