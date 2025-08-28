// public/sw.js

// Install: take over as soon as possible
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Activate: control all open tabs immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/* (Optional) simple offline fallback
// Put an /offline.html in public/ and uncomment:
const OFFLINE_URL = "/offline.html";

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open("cardsync-offline");
        const cached = await cache.match(OFFLINE_URL);
        return cached || Response.error();
      })
    );
  }
});
*/
