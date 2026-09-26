/* Apps1D76 — service worker : fonctionnement hors ligne.
   VERSION et CORE sont mis à jour par « npm run generer » : les postes récupèrent la nouvelle version. */
const VERSION = 'apps1d-169b131b59';
const CORE = ["./","./index.html","./style.css","./script.js","./outils.js","./manifest.webmanifest","./icones/apple-touch-icon.png","./icones/icon-192.png","./icones/icon-512.png","./icones/icon-maskable-512.png","./icones/icon.svg","https://cdn.jsdelivr.net/npm/@gouvfr/dsfr@1.15.3/dist/fonts/Marianne-Regular.woff2","https://cdn.jsdelivr.net/npm/@gouvfr/dsfr@1.15.3/dist/fonts/Marianne-Bold.woff2"];
const POLICES = 'https://cdn.jsdelivr.net/npm/@gouvfr/dsfr@';

self.addEventListener('install', e => {
  // allSettled : un fichier indisponible ne bloque pas l'installation
  e.waitUntil(caches.open(VERSION).then(c => Promise.allSettled(CORE.map(u => c.add(u)))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const put = (req, res) => { // copie faite tout de suite : la réponse originale part vers la page
  if (res.ok) { const copie = res.clone(); caches.open(VERSION).then(c => c.put(req, copie)); }
  return res;
};
const horsLigne = () => new Response(
  `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Hors ligne</title>
  <body style="font-family:system-ui;text-align:center;padding:3rem 1rem"><h1>Vous êtes hors ligne</h1>
  <p>Cette page n'a pas encore été ouverte avec une connexion.<br><a href="${self.registration.scope}">Retour à l'accueil</a></p>`,
  { headers: { 'Content-Type': 'text/html; charset=utf-8' } });

self.addEventListener('fetch', e => {
  const req = e.request;
  const origine = new URL(req.url).origin === location.origin;
  if (req.method !== 'GET' || !(origine || req.url.startsWith(POLICES))) return;
  const frais = req.mode === 'navigate' || (origine && req.url.split(/[?#]/)[0].endsWith('/outils.js'));
  e.respondWith(frais
    // Pages et liste des outils : réseau d'abord (toujours à jour), cache si hors ligne
    ? fetch(req).then(res => put(req, res)).catch(async () => (await caches.match(req)) || (req.mode === 'navigate' ? horsLigne() : Response.error()))
    // Autres fichiers : cache immédiat, mise à jour en arrière-plan
    : caches.match(req).then(cached => {
        const reseau = fetch(req).then(res => put(req, res)).catch(() => cached || Response.error());
        return cached || reseau;
      }));
});
