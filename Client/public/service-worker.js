const STATIC_CACHE = "funstakes-static-v1";
const API_CACHE = "funstakes-api-v1";

// Install
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => ![STATIC_CACHE, API_CACHE].includes(k))
            .map((k) => caches.delete(k)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. STRICT GUARD: Only intercept GET requests
  if (request.method !== "GET") return;

  // 2. STRICT GUARD: Completely ignore anything starting with /api
  if (url.pathname.startsWith("/api")) return;

  // 3. ALLOW-LIST: Static Assets (Next.js internals, manifest, images)
  const isStaticAsset =
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/images") || // Add your images folder if applicable
    url.pathname === "/manifest.json" ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".svg");

  if (isStaticAsset) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // 4. ALLOW-LIST: Static Pages & Offline Shell
  const staticPages = [
    "/about",
    "/support",
    "/pricing",
    "/privacy",
    "/terms",
    "/blogs",
    "/news",
    "/offline",
  ];

  const isStaticPage = staticPages.some(
    (page) => url.pathname === page || url.pathname.startsWith(page + "/"),
  );

  if (isStaticPage) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
  return;
});

/* ---------- STRATEGIES ---------- */

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const fresh = await fetch(request);
  cache.put(request, fresh.clone());
  return fresh;
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
