/* Offline support. Everything is fetched fresh while online (so a new deploy
   shows up straight away) and served from the cache when there is no network,
   so the games keep working in the car or on a plane. Bump VERSION to drop
   old caches. */
var VERSION = 'heshvi-v2';
var CORE = [
  './', 'index.html', 'learn.html', 'find.html', 'discover.html', 'trace.html',
  'stories.html', 'print.html', 'worksheet.html',
  'css/style.css', 'js/common.js', 'js/data.js', 'js/telugu.js', 'js/game.js',
  'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/apple-touch-icon.png'
];
var NETWORK_TIMEOUT_MS = 4000;

// Cloudflare Pages redirects /page.html to /page; a redirected response can't
// be replayed for a navigation, so store a plain copy instead.
function plainCopy(res) {
  if (!res.redirected) return Promise.resolve(res);
  return res.blob().then(function (body) {
    return new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers });
  });
}

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(VERSION).then(function (cache) {
    return Promise.all(CORE.map(function (url) {
      return fetch(url, { cache: 'reload' }).then(function (res) {
        if (!res.ok) return null;
        return plainCopy(res).then(function (copy) { return cache.put(url, copy); });
      }).catch(function () { return null; });
    }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function fromCache(req) {
  return caches.match(req, { ignoreSearch: true }).then(function (hit) {
    if (hit || req.mode !== 'navigate') return hit;
    // the same page under its other name: /learn <-> /learn.html, / <-> /index.html
    var path = new URL(req.url).pathname;
    var alt = /\.html$/.test(path) ? path.replace(/\.html$/, '')
      : /\/$/.test(path) ? path + 'index.html' : path + '.html';
    return caches.match(alt, { ignoreSearch: true }).then(function (h) {
      return h || caches.match('index.html');
    });
  });
}

// One cache entry per file: ?v=7, ?v=8... replace each other instead of piling up.
function cacheKey(req) {
  var url = new URL(req.url);
  return url.origin + url.pathname;
}

function networkFirst(event) {
  var req = event.request;
  var stored = Promise.resolve();
  var network = fetch(req).then(function (res) {
    if (res.ok && res.type === 'basic') {
      var copy = res.clone();
      stored = caches.open(VERSION).then(function (c) { return c.put(cacheKey(req), copy); });
    }
    return res;
  });
  event.waitUntil(network.then(function () { return stored; }).catch(function () {}));

  return new Promise(function (resolve) {
    var settled = false;
    function settle(res) { if (!settled && res) { settled = true; resolve(res); } }
    // On a crawling connection, show the cached copy rather than a blank screen.
    var timer = setTimeout(function () { fromCache(req).then(settle); }, NETWORK_TIMEOUT_MS);
    network.then(function (res) {
      clearTimeout(timer);
      settle(res);
    }, function () {
      clearTimeout(timer);
      fromCache(req).then(function (hit) { settle(hit || Response.error()); });
    });
  });
}

// Google Fonts files never change for a given URL.
function cacheFirst(event) {
  var req = event.request;
  return caches.match(req).then(function (hit) {
    if (hit) return hit;
    return fetch(req).then(function (res) {
      if (res.ok || res.type === 'opaque') {
        var copy = res.clone();
        event.waitUntil(caches.open(VERSION).then(function (c) { return c.put(req, copy); }));
      }
      return res;
    });
  });
}

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(event));
  } else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(event));
  }
});
