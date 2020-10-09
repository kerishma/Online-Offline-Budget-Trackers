const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "index.js", 
    "/db.js", 
    "/style.css"
  ];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

// install
self.addEventListener("install", function(evt) {
  evt.waitUntil(
    caches
    .open(CACHE_NAME)
    .then(cache => cache.addAll(FILES_TO_CACHE))
      // console.log("did it work");
      .then(self.skipWaiting)
    )
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener("activate", function(evt) {
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Remove old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// fetch
self.addEventListener("fetch", event => {
    if(event.request.url.includes('/api/')) {
        console.log('[Service Worker] Fetch(data)', event.request.url);
        event.respondWith(
          caches.open(DATA_CACHE_NAME).then(cache => {
              return fetch(evt.request)
                .then(response => {
                    if (response.status === 200){
                        cache.put(evt.request.url, response.clone());
                    }
                    return response;
                })
                .catch(err => {
                    return cache.match(event.request);
                });
            })
            );
            return;
        }

event.respondWith(
    caches.open(CACHE_NAME).then( cache => {
      return cache.match(event.request).then(response => {
        return response || fetch(evt.request);
      });
    })
  );
});