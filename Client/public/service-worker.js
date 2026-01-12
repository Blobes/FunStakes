const STATIC_CACHE = "funstakes-static-v12";
const API_CACHE = "funstakes-api-v12";

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

  /* ✅ NAVIGATION */
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/timeline")));
    return;
  }

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  /* 🚫 IGNORE VERCEL LIVE */
  if (url.hostname.includes("vercel.live")) return;

  /* 🚫 NEVER CACHE AUTH */
  if (url.pathname.startsWith("/api/auth")) return;

  /* ✅ NEXT.JS STATIC CHUNKS */
  if (url.pathname.startsWith("/_next/static")) {
    event.respondWith(cacheFirstStrict(request, STATIC_CACHE));
    return;
  }

  /* ✅ MANIFEST + ICONS */
  if (
    url.pathname === "/manifest.json" ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".ico")
  ) {
    event.respondWith(cacheFirstStrict(request, STATIC_CACHE));
    return;
  }

  /* ✅ TIMELINE */
  if (url.pathname.startsWith("/timeline")) {
    event.respondWith(networkFirst(request, STATIC_CACHE));
    return;
  }

  /* ✅ API DATA */
  if (
    url.pathname.startsWith("/api/posts") ||
    url.pathname.startsWith("/api/users")
  ) {
    event.respondWith(networkFirst(request, API_CACHE));
  }
});

/* ---------- STRATEGIES ---------- */

async function cacheFirstStrict(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) return cached;

  const fresh = await fetch(request); // ❗ let this throw if offline
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
    throw new Error("Offline and no cache");
  }
}
