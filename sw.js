self.addEventListener('fetch', (event) => {
    // Respuesta mínima requerida para cumplir con la política de instalación
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
