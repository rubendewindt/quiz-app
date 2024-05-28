const STATIC_CACHE_NAME = "static-version-1";
const DYNAMIC_CACHE_NAME = "dynamic-version-1";

// Array met alle static files die gecached moeten worden.
const staticFiles = [
    '/index.html',
    '/CatSelect.html',
    '/offline.html',
    '/scripts/app.js',
    '/scripts/service-worker.js',
    '/scripts/MusicPlayer.js',
    '/styles/style.css',
    '/manifest.json',
    '/images/openart-image_wfSvayW5_1716492442037_raw.jpg',
    '/images/NoConnection.gif',
    '/images/icons/favicon.ico',
    '/images/icons/vives48.png',
    '/images/icons/vives72.png',
    '/images/icons/vives96.png',
    '/images/icons/vives144.png',
    '/images/icons/vives168.png',
    '/images/icons/vives192.png',
    '/images/icons/vives512.png'
];

self.addEventListener("install", (event) => {
    console.log("Service worker installed: ", event);

    // De eerste keer dat de app opstart, de cache vullen.
    //wachten tot alle promises voldaan zijn
    //dus alle code hieronder
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME).then(cache => {
            console.log("Caching static files...");
            //verwacht een itreble bv een array
            cache.addAll(staticFiles);
        })
    )
});

self.addEventListener("activate", (event) => {
    console.log("Service worker activated: ", event);

    // Bij een nieuwe versie van de Service Worker, eventueel de oude cache wissen.
    event.waitUntil(
        caches.keys().then(keys => {
            console.log("Cache keys: ", keys);

            return Promise.all(keys
                .filter(key => ((key !== STATIC_CACHE_NAME) && (key !== DYNAMIC_CACHE_NAME)))
                .map(key => caches.delete(key))
                )
        })
    );
});

self.addEventListener("fetch", (event) => {
    console.log("Fetch-event: ", event);

    event.respondWith(
        caches.match(event.request).then(cacheResponse => {
            return cacheResponse || fetch(event.request).then(fetchResponse => {
                return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
                    cache.put(event.request.url, fetchResponse.clone());
                    return fetchResponse;
                });
            }).catch(() => {
                // If fetch fails (e.g., when offline), return the offline page
                return caches.match('/offline.html');
            });
        })
    );
});