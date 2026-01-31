const STATIC_CACHE = "funstakes-static-v3";
const API_CACHE = "funstakes-api-v3";

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

  if (request.method !== "GET") return;

  /* NEVER CACHE SERVER APIs */
  if (url.pathname.startsWith("/api/")) return;

  /* NEXT STATIC ASSETS */
  if (url.pathname.startsWith("/_next/static")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  /* MANIFEST + ICONS */
  if (
    url.pathname === "/manifest.json" ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".ico")
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  /* STATIC WEB PAGES */
  const staticPages = [
    "/about",
    "/support",
    "/pricing",
    "/privacy",
    "/terms",
    "/blogs",
    "/news",
  ];
  const isWeb = staticPages.some((page) => url.pathname.startsWith(page));
  if (isWeb) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  /* POST PAGES */
  if (url.pathname === "/" || url.pathname.startsWith("/post")) {
    event.respondWith(networkFirst(request, STATIC_CACHE));
    return;
  }

  /* API DATA */
  // if (
  //   url.pathname.startsWith("/api/posts") ||
  //   url.pathname.startsWith("/api/users")
  // ) {
  //   event.respondWith(networkFirst(request, API_CACHE));
  //   return;
  // }
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
