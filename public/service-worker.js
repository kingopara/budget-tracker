const CACHE_NAME = "my-site-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

const FILES_TO_CACHE = [
    // "/",
    "./index.html",
    "../css/styles.css",
    // "/icons/icon-72x72.png",
    // "/icons/icon-96x96.png",
    // "/icons/icon-128x128.png",
    // "/icons/icon-144x144.png",
    // "/icons/icon-152x152.png",
    "../icons/icon-192x192.png",
    // "/icons/icon-384-384.png",
    // "/icons/icon-512x512.png",
    "../js/idb.js",
    "../js/index.js",
    "./manifest.json"
];

// installing the service
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('installing cache : ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    )
    self.skipWaiting();
});

// activate the service worker
self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                    console.log('Removing old cache data', key);
                    return caches.delete(key);
                }
            }))
        })
    )
    self.clients.claim();
});

// intercept fetch requests
self.addEventListener('fetch', function (e) {
    if (e.request.url.includes('/api/')) {
        e.respondWith(caches
            .open(DATA_CACHE_NAME)
            .then(cache => {
                return fetch(e.request)
                .then(response => {
                    //if response was good, clone and store in the cache
                    if (response.status === 200) {
                        cache.put(e.request.url, response.clone());
                    }
                    return response;
                })
                .catch(err => {
                    // if network request failed , try to get it from the cache
                    return cache.match(e.request);
                });
            })
            .catch(err => console.log(err))
        );
        return;
    }

    e.respondWith(
        fetch(e.request).catch(function() {
            return caches.match(e.request).then(function(response) {
                if (response) {
                    return response
                } else if (e.request.headers.get('accept').includes('text/html')) {
                    //return the caches home page
                    return caches.match('/index.html');
                }
            })
        })
    )
});