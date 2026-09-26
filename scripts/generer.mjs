// Met à jour la page d'accueil à partir du dossier Outils/  →  npm run generer
//   outils.js  : liste des outils rangés par catégorie (lue par la page)
//   index.html : empreinte du script intégré dans la politique de sécurité (CSP)
//   sw.js      : version et liste des fichiers pour le hors ligne
// « npm run verifier » vérifie seulement, sans rien écrire.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { RACINE, construireCatalogue } from './catalogue.mjs';

const verifierSeulement = process.argv.includes('--verifier');
const POLICES = 'https://cdn.jsdelivr.net/npm/@gouvfr/dsfr@1.15.3/dist/fonts/';
const lire = f => readFileSync(join(RACINE, f), 'utf8');
const ecrits = [];
const ecrire = (f, contenu) => { if (lire(f) !== contenu) { writeFileSync(join(RACINE, f), contenu); ecrits.push(f); } };

/* ---------- 1. Catalogue ---------- */
const { categories, erreurs, avertissements } = construireCatalogue();
avertissements.forEach(a => console.log('  ⚠ ' + a));
if (erreurs.length) {
  console.error(`\n✖ ${erreurs.length} problème(s) à corriger :\n${erreurs.map(e => '  • ' + e).join('\n')}\n`);
  process.exit(1);
}
const nb = categories.reduce((n, c) => n + c.outils.length, 0);
console.log(`  ✔ ${nb} outil(s) dans ${categories.length} catégorie(s)`);
if (verifierSeulement) process.exit(0);

/* ---------- 2. outils.js ---------- */
if (!existsSync(join(RACINE, 'outils.js'))) writeFileSync(join(RACINE, 'outils.js'), '');
ecrire('outils.js', `// Fichier généré automatiquement à partir du dossier Outils/ : ne pas modifier à la main.
// Pour ajouter un outil : voir AJOUTER-UN-OUTIL.md
window.APPS1D = ${JSON.stringify({ categories }, null, 2).replace(/</g, '\\u003c')};
`);

/* ---------- 3. Politique de sécurité de index.html ---------- */
let html = lire('index.html');
const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => `'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`);
const csp = [`default-src 'self'`, `script-src 'self' ${inline.join(' ')}`, `style-src 'self' 'unsafe-inline'`, `img-src 'self' data:`,
  `font-src 'self' https://cdn.jsdelivr.net`, `connect-src 'self' https://cdn.jsdelivr.net`, `manifest-src 'self'`, `worker-src 'self'`,
  `object-src 'none'`, `base-uri 'none'`, `form-action 'none'`].join('; ');
html = html.replace(/(<meta http-equiv="Content-Security-Policy" content=")[^"]*(">)/, (_, a, b) => a + csp + b);
ecrire('index.html', html);

/* ---------- 4. Service worker ---------- */
const locaux = ['index.html', 'style.css', 'script.js', 'outils.js', 'manifest.webmanifest',
  ...readdirSync(join(RACINE, 'icones')).map(f => 'icones/' + f), ...(existsSync(join(RACINE, 'logo.png')) ? ['logo.png'] : [])];
const empreinte = createHash('sha256');
locaux.forEach(f => empreinte.update(readFileSync(join(RACINE, f))));
const core = ['./', ...locaux.map(f => './' + f), POLICES + 'Marianne-Regular.woff2', POLICES + 'Marianne-Bold.woff2'];
ecrire('sw.js', lire('sw.js')
  .replace(/const VERSION = [^;]+;/, `const VERSION = 'apps1d-${empreinte.digest('hex').slice(0, 10)}';`)
  .replace(/const CORE = \[[^\]]*\];/, `const CORE = ${JSON.stringify(core)};`));

console.log(ecrits.length ? `  ✔ mis à jour : ${ecrits.join(', ')}` : '  ✔ déjà à jour, rien à modifier');
