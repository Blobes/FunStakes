const API_CACHE = "funstakes-api-v1";
const STATIC_CACHE = "funstakes-static-v4"; // Incremented version

const ESSENTIAL_ASSETS = [
  "/", // THE SHELL: Loads your main JS/React
  "/offline", // THE DATA PAGE: Where you show IndexedDB content
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

  // STRATEGY: Navigation Fallback to Root
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(STATIC_CACHE);
        // Serve "/" so the React app boots and handles the offline prompt
        return (await cache.match("/")) || (await cache.match("/offline"));
      }),
    );
    return;
  }

  // STRATEGY: Cache-First for Assets
  const isStatic =
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/images") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".js") || // Ensure JS chunks are caught
    url.pathname.endsWith(".css");

  if (isStatic) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
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
