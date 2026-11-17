/* Offline-cache för den statiska appen. Lokal träningsdata rörs aldrig. */
const CACHE = "lindas-revolt-static-v2";
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
    return Promise.all(keys.filter(function (k) { return k !== CACHE && k.startsWith("lindas-revolt-"); })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(function (cached) {
    const fetched = fetch(event.request).then(function (response) {
      if (response && response.ok && new URL(event.request.url).pathname.startsWith(new URL(self.registration.scope).pathname)) {
        const clone = response.clone();
        caches.open(CACHE).then(function (cache) { cache.put(event.request, clone); });
      }
      return response;
    }).catch(function () { return cached; });
    return cached || fetched;
  }));
});
