const CACHE_NAME = "afterservice-shell-v1";
const APP_SHELL_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
];

async function cacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(APP_SHELL_URLS);
}

async function clearOldCaches() {
  const cacheNames = await caches.keys();

  await Promise.all(
    cacheNames
      .filter((cacheName) => cacheName !== CACHE_NAME)
      .map((cacheName) => caches.delete(cacheName)),
  );
}

async function cacheResponse(request, response) {
  if (!response || response.status !== 200 || response.type === "opaque") {
    return;
  }

  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}

async function handleNavigation(request) {
  try {
    const response = await fetch(request);

    await cacheResponse("/", response);

    return response;
  } catch {
    const cache = await caches.open(CACHE_NAME);

    return (
      (await cache.match(request)) ||
      (await cache.match("/")) ||
      new Response("afterservice is offline", {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
        status: 503,
      })
    );
  }
}

async function handleAsset(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await fetch(request);

  await cacheResponse(request, response);

  return response;
}

self.addEventListener("install", (event) => {
  event.waitUntil(cacheAppShell().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clearOldCaches().then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(handleNavigation(event.request));
    return;
  }

  if (new URL(event.request.url).origin === self.location.origin) {
    event.respondWith(handleAsset(event.request));
  }
});
