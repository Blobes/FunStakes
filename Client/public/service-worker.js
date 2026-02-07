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

  try {
    const cached = await cache.match(request);
    if (cached) return cached;

    // Not in cache, try network
    const fresh = await fetch(request);

    // Optimization: Only cache successful standard responses
    if (fresh && fresh.status === 200 && fresh.type === "basic") {
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch (error) {
    // This is where the "Failed to fetch" is caught
    console.warn(
      "Offline: Asset not in cache ->",
      new URL(request.url).pathname,
    );

    if (request.mode === "navigate") {
      const offlinePage = await cache.match("/offline");
      if (offlinePage) return offlinePage;
    }

    // For JS/CSS chunks, returning a 503 is technically correct but
    // you could return a empty script to prevent console crashes
    return new Response("Offline", {
      status: 503,
      statusText: "Service Unavailable",
    });
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
