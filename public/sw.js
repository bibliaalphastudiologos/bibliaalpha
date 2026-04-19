/**
 * sw.js — Biblia Alpha Service Worker v3
 *
 * Estrategias de cache:
 * 1. App Shell (HTML + JS + CSS) → Cache-First com revalidacao em background
 * 2. APIs de Biblia (HelloAO, bible-api.com) → Stale-While-Revalidate
 * 3. APIs de Pesquisa (Wikipedia, Google Books) → Stale-While-Revalidate
 * 4. Outros recursos → Network-First com fallback para cache
 */

const CACHE_VERSION = 'v3';
const SHELL_CACHE  = 'bibliaalpha-shell-'  + CACHE_VERSION;
const BIBLE_CACHE  = 'bibliaalpha-bible-'  + CACHE_VERSION;
const RESEARCH_CACHE = 'bibliaalpha-research-' + CACHE_VERSION;

const SHELL_ASSETS = ['/', '/index.html'];

const BIBLE_API_HOSTS = [
  'bible.helloao.org',
  'bible-api.com',
];

const RESEARCH_API_HOSTS = [
  'pt.wikipedia.org',
  'en.wikipedia.org',
  'www.googleapis.com',
  'kgsearch.googleapis.com',
];

// ── INSTALL ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

// ── ACTIVATE ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => n !== SHELL_CACHE && n !== BIBLE_CACHE && n !== RESEARCH_CACHE)
          .map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

// ── FETCH ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. APIs da Biblia → Stale-While-Revalidate
  if (BIBLE_API_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(BIBLE_CACHE, event.request));
    return;
  }

  // 2. APIs de Pesquisa (Wikipedia, Google Books, KG) → Stale-While-Revalidate
  if (RESEARCH_API_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(RESEARCH_CACHE, event.request));
    return;
  }

  // 3. Navegacao (HTML) → App Shell
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((cached) => cached || fetch(event.request))
    );
    return;
  }

  // 4. Outros → Network-First com fallback para cache
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

// ── Stale-While-Revalidate ────────────────────────────────────────────────────
async function staleWhileRevalidate(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkFetch = fetch(request)
    .then((res) => { if (res.ok) cache.put(request, res.clone()); return res; })
    .catch(() => null);
  return cached || networkFetch;
}
