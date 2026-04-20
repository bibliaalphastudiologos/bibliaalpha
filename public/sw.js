/**
 * sw.js — Biblia Alpha Service Worker v6
 *
 * v6: staleWhileRevalidate para /assets/* (garante que updates cheguem na proxima carga)
 *     networkFirst para HTML/navigate (sempre busca index.html atualizado)
 *     message SKIP_WAITING para atualização forçada via UI
 *     limpeza agressiva de caches antigos
 */

const CACHE_VERSION = 'v6';
const SHELL_CACHE    = 'bibliaalpha-shell-'    + CACHE_VERSION;
const BIBLE_CACHE    = 'bibliaalpha-bible-'    + CACHE_VERSION;
const RESEARCH_CACHE = 'bibliaalpha-research-' + CACHE_VERSION;

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

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter(n => n.startsWith('bibliaalpha-') && ![SHELL_CACHE, BIBLE_CACHE, RESEARCH_CACHE].includes(n))
        .map(n => {
          console.log('[SW v6] Removendo cache antigo:', n);
          return caches.delete(n);
        })
    );
    await self.clients.claim();
    console.log('[SW v6] Ativado — todos os caches antigos removidos');
  })());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))));
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  if (BIBLE_API_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(BIBLE_CACHE, event.request));
    return;
  }

  if (RESEARCH_API_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(RESEARCH_CACHE, event.request));
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(SHELL_CACHE, event.request));
    return;
  }

  // v6: staleWhileRevalidate para assets — serve do cache mas ja busca versao nova
  // em background. Na proxima visita o usuario ja tem o asset atualizado.
  // Hashes Vite garantem que assets novos (novo hash) sao sempre buscados da rede.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(staleWhileRevalidate(SHELL_CACHE, event.request));
    return;
  }

  event.respondWith(networkFirst(SHELL_CACHE, event.request));
});

async function networkFirst(cacheName, request) {
  try {
    const response = await fetch(request);
    if (response.ok || response.type === 'opaque') {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

async function staleWhileRevalidate(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok || response.type === 'opaque') {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);

  return cached || fetchPromise;
}
