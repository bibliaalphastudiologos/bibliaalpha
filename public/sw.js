/**
 * sw.js — Bíblia Alpha Service Worker
 *
 * Estratégia:
 *   1. App Shell (HTML + JS + CSS)  → Cache-First com revalidação em background
 *   2. API de Bíblia (JSON chapters) → Stale-While-Revalidate  (funciona offline)
 *   3. Outros recursos               → Network-First com fallback para cache
 *
 * Atualizar CACHE_VERSION ao fazer mudanças que exijam invalidação do cache.
 */

const CACHE_VERSION = 'v2';
const SHELL_CACHE   = 'bibliaalpha-shell-' + CACHE_VERSION;
const BIBLE_CACHE   = 'bibliaalpha-bible-' + CACHE_VERSION;

// Recursos do App Shell que serão pré-cacheados no install
const SHELL_ASSETS = ['/', '/index.html'];

// Domínios de APIs da Bíblia que serão cacheados para uso offline
const BIBLE_API_HOSTS = [
  'bible.helloao.org',
  'bible-api.com',
];

// ─────────────────────────────────────────────────────────────
// INSTALL — pré-cacheia o App Shell
// ─────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

// ─────────────────────────────────────────────────────────────
// ACTIVATE — remove caches de versões antigas
// ─────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => n !== SHELL_CACHE && n !== BIBLE_CACHE)
          .map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

// ─────────────────────────────────────────────────────────────
// FETCH — roteamento de requisições
// ─────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. APIs de Bíblia → Stale-While-Revalidate (offline friendly)
  if (BIBLE_API_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(BIBLE_CACHE, event.request));
    return;
  }

  // 2. Navegação (HTML) → App Shell
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((cached) => cached || fetch(event.request))
    );
    return;
  }

  // 3. Outros → Network-First com fallback para cache
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

// ─────────────────────────────────────────────────────────────
// Stale-While-Revalidate helper
// ─────────────────────────────────────────────────────────────
async function staleWhileRevalidate(cacheName, request) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkFetch = fetch(request).then((res) => {
    if (res.ok) cache.put(request, res.clone());
    return res;
  }).catch(() => null);

  return cached || networkFetch;
}
