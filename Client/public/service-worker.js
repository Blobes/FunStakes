// const API_CACHE = "funstakes-api-v2";
const STATIC_CACHE = "funstakes-static-v11";

const ESSENTIAL_ASSETS = [
  "/", // THE SHELL: Loads your main JS/React
  "/offline", // THE DATA PAGE: Where we show IndexedDB content
  "/manifest.json",
  "/favicon.ico",
];

// 1. Install: Pre-cache the shell so navigation fallback works
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      // Use addAll for essential files; if one fails, install fails
      return cache.addAll(ESSENTIAL_ASSETS);
    }),
  );
  self.skipWaiting();
});

// 2. Activate: Clean up old versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k)),
        ),
      ),
  );
  self.clients.claim();
});

// 3. Fetch: The Traffic Controller
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (url.pathname.startsWith("/api")) return;

  // Inside your Fetch listener
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request)
          .then((networkResponse) => {
            // Cache anything that comes back successfully
            if (networkResponse && networkResponse.status === 200) {
              const cacheCopy = networkResponse.clone();
              caches
                .open(STATIC_CACHE)
                .then((cache) => cache.put(request, cacheCopy));
            }
            return networkResponse;
          })
          .catch(() => {
            // Fallback to prevent the ChunkLoadError crash
            return new Response("console.warn('Offline: Chunk missing');", {
              headers: { "Content-Type": "application/javascript" },
            });
          });
      }),
    );
    return;
  }

  // STRATEGY: Navigation Fallback to Root
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(STATIC_CACHE);
        // If the user is specifically heading to /offline, don't serve the root!
        if (url.pathname.includes("/offline")) {
          return await cache.match("/offline");
        }
        // Otherwise, serve the main app shell
        return (await cache.match("/")) || (await cache.match("/offline"));
      }),
    );
    return;
  }

  // STRATEGY: Cache-First for Assets
  const isStatic =
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/images") ||
    url.pathname.includes("turbopack") || // Added for Turbopack support
    /\.(js|css|png|jpg|svg|ico)$/i.test(url.pathname);

  if (isStatic) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

/* ---------- STRATEGIES ---------- */

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const cached = await cache.match(request);
    if (cached) return cached;

    const fresh = await fetch(request);
    // Cache the asset for next time if it's a successful standard response
    if (fresh && fresh.status === 200) {
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch (error) {
    // If we're offline and the asset isn't cached, return a silent 503
    return new Response(null, { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(request);
    cache.put(request, fresh.clone());
    return fresh;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    return new Response(JSON.stringify({ offline: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}
