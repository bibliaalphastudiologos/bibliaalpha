// Biblia Alpha Service Worker - v4 (force-update)
    const CACHE_VERSION = 'bibliaalpha-v4';
    const ASSETS_CACHE  = 'bibliaalpha-assets-v4';
    const STATIC_CACHE  = 'bibliaalpha-static-v4';

    const BYPASS_HOSTS = [
      'firestore.googleapis.com',
      'identitytoolkit.googleapis.com',
      'securetoken.googleapis.com',
      'googleapis.com',
      'firebase.googleapis.com',
      'firebaseio.com',
    ];

    // Install - ativa imediatamente sem esperar abas fecharem
    self.addEventListener('install', (event) => {
      console.log('[SW v4] Installing...');
      self.skipWaiting();
    });

    // Activate - limpa TODOS os caches antigos
    self.addEventListener('activate', (event) => {
      console.log('[SW v4] Activating - clearing old caches...');
      event.waitUntil(
        caches.keys().then((keys) => {
          return Promise.all(
            keys
              .filter((k) => k !== CACHE_VERSION && k !== ASSETS_CACHE && k !== STATIC_CACHE)
              .map((k) => {
                console.log('[SW v4] Deleting old cache:', k);
                return caches.delete(k);
              })
          );
        }).then(() => {
          console.log('[SW v4] Claiming all clients...');
          return self.clients.claim();
        })
      );
    });

    // Message - force update / skip waiting
    self.addEventListener('message', (event) => {
      if (event.data && (event.data.type === 'SKIP_WAITING' || event.data.type === 'FORCE_UPDATE')) {
        console.log('[SW v4] Force skip waiting');
        self.skipWaiting();
      }
    });

    // Fetch
    self.addEventListener('fetch', (event) => {
      const url = new URL(event.request.url);

      // Bypass: non-GET, chrome-extension, etc.
      if (event.request.method !== 'GET') return;
      if (!url.protocol.startsWith('http')) return;

      // Bypass: Firebase/Google APIs - nunca interceptar
      if (BYPASS_HOSTS.some((h) => url.hostname.includes(h))) return;

      // Assets com hash (imutaveis) - cache first
      if (url.pathname.startsWith('/assets/')) {
        event.respondWith(
          caches.open(ASSETS_CACHE).then((cache) =>
            cache.match(event.request).then((cached) => {
              if (cached) return cached;
              return fetch(event.request, { cache: 'no-store' }).then((resp) => {
                if (resp.ok) cache.put(event.request, resp.clone());
                return resp;
              });
            })
          )
        );
        return;
      }

      // HTML / navegacao - SEMPRE network first, sem cache
      if (
        event.request.mode === 'navigate' ||
        event.request.headers.get('accept')?.includes('text/html')
      ) {
        event.respondWith(
          fetch(event.request, { cache: 'no-store' }).catch(() => {
            // Offline fallback: tenta cache
            return caches.match('/') || caches.match('/index.html');
          })
        );
        return;
      }

      // Default - network first
      event.respondWith(fetch(event.request, { cache: 'no-store' }));
    });
    