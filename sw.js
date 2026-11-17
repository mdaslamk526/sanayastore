// ════════════════════════════════════════════════
//  Sanaya Store — Service Worker (Instant Load & Cache)
// ════════════════════════════════════════════════
const CACHE_NAME = "sanaya-store-v2";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=1.2",
  "./app.js?v=1.2",
  "./products.json",
  "./manifest.json",
  "./favicon.png",
  "./apple-touch-icon.png",
  "./images/bow-collar-top.jpg",
  "./images/alone-green-sweatshirt.jpg",
  "./images/cropped-denim-jacket.jpg",
  "./images/hero.jpg"
];

// Install: Pre-cache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Stale-While-Revalidate for ultra-fast loading
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET and cross-origin tracking requests
  if (req.method !== "GET" || url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      const fetchPromise = fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      // Return cached version immediately if available, else wait for network
      return cachedResponse || fetchPromise;
    })
  );
});
