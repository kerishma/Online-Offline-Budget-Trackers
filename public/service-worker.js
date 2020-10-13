const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "index.js", 
    "/db.js", 
    "/style.css",
    "/manifest.json",
    "/icon-192X192.png",
    "/icon-512X512.png"
  ];

const CACHENAME = "staticcache-v2";
const DATACACHENAME = "datacache-v1";

// install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
    .open(CACHENAME)
    .then(cache => cache.addAll(FILES_TO_CACHE))
      // console.log("did it work");
      .then(self.skipWaiting())
    );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
    .keys()
    .then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            // console.log("Remove old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});


self.addEventListener("fetch", event => {
    if(event.request.url.includes('/api/')) {
        console.log('[Service Worker] Fetch(data)', event.request.url);
        event.respondWith(
          caches.open(DATACACHENAME).then(cache => {
              return fetch(event.request)
                .then(response => {
                    if (response.status === 200){
                        cache.put(event.request.url, response.clone());
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
    caches.open(CACHENAME).then( cache => {
      return cache.match(event.request).then(response => {
        return response || fetch(evt.request);
      });
    })
  );
});