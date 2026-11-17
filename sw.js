/* Snabb uppdatering online, trygg offlineversion om uppkopplingen saknas. */
const CACHE = "lindas-revolt-static-v3";
const URLS = [
  "./", "./index.html", "./styles.css", "./js/program.js", "./js/storage.js", "./js/app.js",
  "./assets/icon.svg", "./assets/apple-touch-icon.png", "./manifest.webmanifest"
];

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) {
    return cache.addAll(URLS);
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) {
      return key !== CACHE && key.startsWith("lindas-revolt-static-");
    }).map(function (key) { return caches.delete(key); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (event) {
  const request = event.request;
  const url = new URL(request.url);
  const scope = new URL(self.registration.scope);
  if (request.method !== "GET" || url.origin !== scope.origin ||
      !url.pathname.startsWith(scope.pathname)) return;
  // Network-first undviker att en iPhone fastnar på en äldre appversion.
  // Sparade träningsdata finns i localStorage och påverkas inte av cachen.
  event.respondWith(fetch(request, { cache: "no-cache" }).then(function (response) {
    if (response && response.ok) {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE).then(function (cache) { return cache.put(request, copy); }));
    }
    return response;
  }).catch(function () {
    return caches.match(request).then(function (cached) {
      if (cached) return cached;
      if (request.mode === "navigate") {
        return caches.match(new URL("./index.html", self.registration.scope).href);
      }
      return Response.error();
    });
  }));
});
