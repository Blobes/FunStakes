const STATIC_CACHE = "funstakes-static-v10";
const API_CACHE = "funstakes-api-v10";

// ---------- INSTALL ----------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll([
        "/", // app shell
        "/timeline", // main timeline
        "/manifest.json", // PWA manifest
      ])
    )
  );
  self.skipWaiting();
});

// ---------- ACTIVATE ----------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => ![STATIC_CACHE, API_CACHE].includes(k))
            .map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

// ---------- FETCH ----------
self.addEventListener("fetch", (event) => {
  const { request } = event;

  /* 🔥 ALWAYS HANDLE NAVIGATION FIRST */
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/timeline") || caches.match("/"))
    );
    return;
  }

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  /* NEVER CACHE AUTH */
  if (url.pathname.startsWith("/api/auth")) return;

  /* MANIFEST */
  if (url.pathname === "/manifest.json") {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  /* NEXT STATIC ASSETS */
  if (url.pathname.startsWith("/_next/static")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  /* STATIC WEB PAGES */
  if (url.pathname === "/" || url.pathname.startsWith("/web")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  /* TIMELINE PAGES */
  if (url.pathname.startsWith("/timeline")) {
    event.respondWith(networkFirst(request, STATIC_CACHE));
    return;
  }

  /* API DATA */
  if (
    url.pathname.startsWith("/api/posts") ||
    url.pathname.startsWith("/api/users")
  ) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }
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
