/* Apps1D76 — service worker : fonctionnement hors ligne.
   Incrémenter VERSION après chaque mise en ligne pour forcer la mise à jour du cache. */
const VERSION = 'apps1d-v1';
const CORE = [
  './', './index.html', './style.css', './script.js', './outils.js', './manifest.webmanifest',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png',
  './fonts/Marianne-Regular.woff2', './fonts/Marianne-Bold.woff2', './images/Logo_DSDEN76.png'
];

self.addEventListener('install', e => {
  // allSettled : un fichier manquant (ex. logo) ne bloque pas l'installation
  e.waitUntil(caches.open(VERSION).then(c => Promise.allSettled(CORE.map(u => c.add(u)))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const put = (req, res) => { if (res.ok) caches.open(VERSION).then(c => c.put(req, res)); return res; };

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;

  // Pages et liste des outils : réseau d'abord (toujours à jour), cache si hors ligne
  if (req.mode === 'navigate' || url.pathname.endsWith('/outils.js')) {
    e.respondWith(
      fetch(req).then(res => put(req, res.clone()) && res)
        .catch(() => caches.match(req).then(r => r || (req.mode === 'navigate'
          ? new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Hors ligne</title><body style="font-family:system-ui;text-align:center;padding:3rem 1rem"><h1>Vous êtes hors ligne</h1><p>Cette page n\'a pas encore été ouverte avec une connexion.<br><a href="./">Retour à l\'accueil</a></p>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
          : Response.error())))
    );
    return;
  }
  // Autres fichiers : cache immédiat + mise à jour en arrière-plan
  e.respondWith(caches.match(req).then(cached => {
    const net = fetch(req).then(res => put(req, res.clone()) && res).catch(() => cached || Response.error());
    return cached || net;
  }));
});
