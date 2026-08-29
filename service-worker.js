/* Kalenderblatt – Service Worker
   Aufgaben: App offline verfügbar machen + Mitteilungen anzeigen/anklicken.
   Bei jeder inhaltlichen Änderung an index.html die CACHE-Version hochzählen. */

const CACHE = "kalenderblatt-v6";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const isPage = req.mode === "navigate" || url.pathname.endsWith("/index.html") || url.pathname === "/" || url.pathname.endsWith("/");

  if (url.origin === location.origin && isPage) {
    // Die App-Seite selbst: erst Netz (damit Updates ankommen), sonst Cache
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put("./index.html", copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match("./index.html")))
    );
  } else if (url.origin === location.origin) {
    // Eigene Dateien (Icons, Manifest): erst Cache, dann Netz
    event.respondWith(
      caches.match(req).then((cached) => {
        const fromNet = fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => cached);
        return cached || fromNet;
      })
    );
  } else {
    // Fremde Dateien (z. B. Google Fonts): erst Netz, dann Cache
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && (res.ok || res.type === "opaque")) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
  }
});

// Push vom Kalenderblatt-Dienst -> Mitteilung anzeigen (läuft auch bei geschlossener App)
self.addEventListener("push", (event) => {
  let d = {};
  try {
    d = event.data ? event.data.json() : {};
  } catch (e) {
    d = { title: "Erinnerung", body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(d.title || "🔔 Erinnerung", {
      body: d.body || "",
      tag: d.key || d.tag || "kb-reminder",
      icon: "./icons/icon-192.png",
      badge: "./icons/icon-192.png",
      data: { url: "./" },
    })
  );
});

// Tippt der Nutzer auf die Mitteilung -> App in den Vordergrund holen
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow("./");
    })
  );
});

// Fallback: Seite kann den SW bitten, eine Mitteilung zu zeigen
self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "notify" && self.registration.showNotification) {
    self.registration.showNotification(data.title || "Erinnerung", {
      body: data.body || "",
      tag: data.tag,
      icon: "./icons/icon-192.png",
      badge: "./icons/icon-192.png"
    });
  }
});
