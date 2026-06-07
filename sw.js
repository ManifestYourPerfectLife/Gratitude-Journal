const CACHE_NAME = 'mtpl-journal-v2';
 
self.addEventListener('install', function(event) {
  self.skipWaiting();
});
 
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});
 
self.addEventListener('fetch', function(event) {
  // Network first — always try to get fresh content
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // Cache the fresh response
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(function() {
        // If offline, fall back to cache
        return caches.match(event.request);
      })
  );
});
 
