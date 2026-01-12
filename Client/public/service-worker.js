const STATIC_CACHE = "funstakes-static-v11";
const API_CACHE = "funstakes-api-v11";

/* ---------- INSTALL ---------- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) =>
        cache.addAll(["/", "/timeline", "/manifest.json", "/favicon.ico"])
      )
  );
  self.skipWaiting();
});

/* ---------- ACTIVATE ---------- */
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

/* ---------- FETCH ---------- */
self.addEventListener("fetch", (event) => {
  const { request } = event;

  /* ✅ ALWAYS HANDLE NAVIGATION */
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/timeline")));
    return;
  }

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  /* 🚫 NEVER TOUCH THESE */
  if (
    url.hostname.includes("vercel.live") ||
    url.pathname.startsWith("/_next-live")
  ) {
    return;
  }

  /* NEVER CACHE AUTH */
  if (url.pathname.startsWith("/api/auth")) return;

  /* MANIFEST + ICONS */
  if (
    url.pathname === "/manifest.json" ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".ico")
  ) {
    event.respondWith(cacheFirstSafe(request, STATIC_CACHE));
    return;
  }

  /* NEXT STATIC ASSETS */
  if (url.pathname.startsWith("/_next/static")) {
    event.respondWith(cacheFirstSafe(request, STATIC_CACHE));
    return;
  }

  /* TIMELINE */
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

async function cacheFirstSafe(request, cacheName) {
  const cache = await caches.open(cacheName);

  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const fresh = await fetch(request);
    cache.put(request, fresh.clone());
    return fresh;
  } catch {
    // 🔥 DO NOT THROW — return a noop response
    return new Response("", { status: 204 });
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
