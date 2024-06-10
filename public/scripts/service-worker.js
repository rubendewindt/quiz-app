const STATIC_CACHE_NAME = "static-version-1";
const DYNAMIC_CACHE_NAME = "dynamic-version-1";

// Array with all static files to be cached
const staticFiles = [
    /*
    //cache paden voor ofline (localhost)
    '/public/index.html',
    '/public/CatSelect.html',
    '/public/offline.html',
    '/public/scripts/app.js',
    '/public/scripts/service-worker.js',
    '/public/scripts/musicPlayer.js',
    '/public/scripts/serial.js',
    '/public/scripts/index.js',
    '/public/scripts/CatSelect.js',
    '/public/scripts/TheQuiz.js',
    '/public/scripts/EindeQuiz.js',
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
    */
    
    //cache paden voor online (firebase)
    '/index.html',
    '/CatSelect.html',
    '/offline.html',
    '/scripts/app.js',
    '/scripts/service-worker.js',
    '/scripts/musicPlayer.js',
    '/scripts/serial.js',
    '/scripts/index.js',
    '/scripts/CatSelect.js',
    '/scripts/TheQuiz.js',
    '/scripts/EindeQuiz.js',
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

    // First time the app starts, cache the files.
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME).then(cache => {
            console.log("Caching static files...");
            return cache.addAll(staticFiles).catch(err => {
                console.error("Failed to cache static files:", err);
            });
        })
    );
});

self.addEventListener("activate", (event) => {
    console.log("Service worker activated: ", event);

    // On a new version of the Service Worker, clear old cache if needed.
    event.waitUntil(
        caches.keys().then(keys => {
            console.log("Cache keys: ", keys);

            return Promise.all(keys
                .filter(key => ((key !== STATIC_CACHE_NAME) && (key !== DYNAMIC_CACHE_NAME)))
                .map(key => caches.delete(key))
            );
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
                return caches.match('offline.html');
            });
        })
    );
});
