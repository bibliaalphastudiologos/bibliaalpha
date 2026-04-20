/**
 * sw.js — Service Worker DESATIVADOR + LIMPADOR
 * Versao: 2026-04-20 15:33:29 UTC
 *
 * 1. Apaga TODOS os caches
 * 2. Se auto-desregistra
 * 3. Recarrega todas as abas para versao fresca do servidor
 */

// Ativa imediatamente sem esperar fechar abas
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      // 1. Apaga todos os caches
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map(key => {
        console.log('[SW-KILL] Apagando cache:', key);
        return caches.delete(key);
      }));
      console.log('[SW-KILL] Todos os caches apagados:', cacheKeys.length);

      // 2. Recarrega todas as abas
      const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      allClients.forEach(client => {
        console.log('[SW-KILL] Recarregando aba:', client.url);
        client.navigate(client.url);
      });

      // 3. Se auto-desregistra
      await self.registration.unregister();
      console.log('[SW-KILL] Service Worker desregistrado com sucesso.');
    })()
  );
});

// Sem interceptacao de fetch — tudo vai direto para a rede
// (SW se desregistra no activate, entao isso nunca sera chamado)

// Escuta SKIP_WAITING caso chamado externamente
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
