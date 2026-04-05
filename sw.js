// Spectra Service Worker
const CACHE = 'spectra-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(r => {
        if (r.ok) caches.open(CACHE).then(c => c.put(e.request, r.clone()));
        return r;
      });
      return cached || network;
    })
  );
});

// Handle share target
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.pathname === '/spectra/' && url.searchParams.has('url')) {
    const clients = self.clients.matchAll({type:'window',includeUncontrolled:true});
    clients.then(cs => {
      const sharedUrl = url.searchParams.get('url') || '';
      const raw = url.searchParams.get('text') || sharedUrl;
      cs.forEach(c => c.postMessage({type:'SHARE_RECEIVED', raw, url: sharedUrl}));
    });
  }
});
