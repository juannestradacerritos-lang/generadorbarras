const CACHE = "etiquetas-v3";
const ARCHIVOS = [
    "./",
    "./index.html",
    "./manifest.json",
    "./icon.svg",
    "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"
];

self.addEventListener("install", event => {
    event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ARCHIVOS)));
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(key => key !== CACHE).map(key => caches.delete(key))
        ))
    );
    self.clients.claim();
});

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    // Los datos de Firebase siempre deben consultarse en red, no desde la caché de la app.
    if (new URL(event.request.url).hostname.endsWith("firebaseio.com")) return;

    event.respondWith(
        caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
            const copia = response.clone();
            caches.open(CACHE).then(cache => cache.put(event.request, copia));
            return response;
        }).catch(() => caches.match("./index.html")))
    );
});
