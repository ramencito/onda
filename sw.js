/*
 * Onda service worker:
 *  - cachea el "shell" de la app para que abra sin conexión
 *  - cachea estáticos (JS/CSS/imagenes del propio origen)
 *  - NO toca la API de música ni el audio: eso se decide en la app
 *    (lo descargado se guarda en IndexedDB)
 * Nota: al publicar una versión nueva, cambia VERSION para refrescar la caché.
 */
const VERSION = "onda-v1";
const SHELL = ["./", "./index.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(() => {})
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Solo gestionamos nuestro propio origen. La API y el audio van directos.
  if (url.origin !== self.location.origin) return;

  // Navegación: red primero, caché como respaldo (así abre offline).
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("./index.html").then((r) => r || Response.error()))
    );
    return;
  }

  // Estáticos: caché primero (rápido y offline), red como respaldo.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => Response.error());
    })
  );
});
