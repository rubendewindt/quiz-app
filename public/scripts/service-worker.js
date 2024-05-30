const STATIC_CACHE_NAME = "static-version-1";
const DYNAMIC_CACHE_NAME = "dynamic-version-1";

// Array met alle static files die gecached moeten worden.
const staticFiles = [
    '/public/index.html',
    '/public/CatSelect.html',
    '/public/offline.html',
    '/public/scripts/app.js',
    '/public/scripts/service-worker.js',
    '/public/scripts/MusicPlayer.js',
    '/public/styles/style.css',
    '/public/manifest.json',
    '/public/images/openart-image_wfSvayW5_1716492442037_raw.jpg',
    '/public/images/NoConnection.gif',
    '/public/images/icons/favicon.ico',
    '/public/images/icons/vives48.png',
    '/public/images/icons/vives72.png',
    '/public/images/icons/vives96.png',
    '/public/images/icons/vives144.png',
    '/public/images/icons/vives168.png',
    '/public/images/icons/vives192.png',
    '/public/images/icons/vives512.png'
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