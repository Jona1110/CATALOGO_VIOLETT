// Service Worker básico para cumplir con los requisitos de instalación PWA
const CACHE_NAME = 'violett-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // No interceptamos la red, solo lo requerimos para que el navegador permita instalar la app
    return;
});