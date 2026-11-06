// Spark! offline support: keeps the app working with no signal.
const CACHE = 'spark-v38';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'img/logo.png', 'img/hero1.jpg', 'img/hero2.jpg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const isPage = e.request.mode === 'navigate' || /\/(index\.html)?(\?.*)?$/.test(new URL(e.request.url).pathname);
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request);
    const net = fetch(e.request, isPage ? {cache:'no-store'} : undefined).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(e.request, r.clone()); return r; }).catch(() => hit);
    // The app page itself: always try the newest version first, so GitHub updates show on the next open. Offline falls back to the saved copy.
    if (isPage) return net.then(r => r || hit).catch(() => hit);
    return hit || net;
  }));
});
