const STATIC_CACHE = "funstakes-static-v1";
const API_CACHE = "funstakes-api-v1";

// Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      // Add the /offline route and essential assets here
      return cache.addAll([
        "/offline",
        "/manifest.json",
        "/favicon.ico",
        // "/assets/images",
        // "/assets/svgs",
      ]);
    }),
  );
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

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(STATIC_CACHE);
        // Serve the pre-cached /offline page instead of the browser error
        return (await cache.match("/offline")) || Response.error();
      }),
    );
    return;
  }
});

/* ---------- STRATEGIES ---------- */

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // If found in cache, return it immediately
  if (cached) return cached;

  try {
    // Attempt to get it from network
    const fresh = await fetch(request);
    // Only cache if the response is valid
    if (fresh && fresh.status === 200) {
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch (error) {
    // This block catches the "Failed to fetch" error when offline
    console.warn("CacheFirst: Network failed and no cache available", error);

    // If it's a page navigation, return the offline shell
    if (request.mode === "navigate") {
      return await cache.match("/offline");
    }

    // Otherwise, return a generic error response
    return new Response("Offline and resource not cached", { status: 503 });
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
