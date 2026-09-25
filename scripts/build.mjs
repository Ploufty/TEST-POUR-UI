// Compilation : vérifie outils.json puis produit public/ (accueil optimisé + outils existants)
//   npm run build        → compile dans public/
//   npm run verifier     → vérifie seulement outils.json (utilisé par la CI sur les demandes de fusion)
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync, gunzipSync } from 'node:zlib';
import { transform } from 'esbuild';
import { RACINE, lire, verifier } from './outils.mjs';

const SRC = join(RACINE, 'accueil'), OUT = join(RACINE, 'public');
const CIBLES = ['chrome90', 'edge90', 'firefox90', 'safari14', 'ios14'];
// Fichiers et dossiers du dépôt qui ne sont PAS publiés
const EXCLUS = new Set(['public', 'accueil', 'scripts', 'node_modules', '.git', '.gitlab', '.gitlab-ci.yml', '.gitignore',
  '.claude', 'package.json', 'package-lock.json', 'outils.json', 'README.md', 'AJOUTER-UN-OUTIL.md', 'index.html']);
const POLICES = ['Marianne-Regular.woff2', 'Marianne-Bold.woff2'];
const DSFR = '@gouvfr/dsfr@1.15.3';
const CDN_POLICES = [`https://cdn.jsdelivr.net/npm/${DSFR}/dist/fonts/`, `https://unpkg.com/${DSFR}/dist/fonts/`];
const PAQUET_DSFR = 'https://registry.npmjs.org/@gouvfr/dsfr/-/dsfr-1.15.3.tgz';

const t0 = performance.now();
const ok = m => console.log('  ✔ ' + m), warn = m => console.log('  ⚠ ' + m);
const stop = (titre, erreurs) => {
  console.error(`\n✖ ${titre}\n` + erreurs.map(e => '  • ' + e).join('\n') + '\n');
  process.exit(1);
};

/* ---------- 1. Vérification de la liste des outils ---------- */
console.log('\n1. Vérification de outils.json');
let data;
try { data = lire(); } catch (e) { stop('Liste des outils illisible', [e.message]); }
const erreurs = verifier(data);
if (erreurs.length) stop(`${erreurs.length} problème(s) dans outils.json`, erreurs);
const nb = data.categories.reduce((n, c) => n + c.outils.length, 0);
ok(`${data.categories.length} catégories, ${nb} outils, tous les liens existent`);
if (process.argv.includes('--verifier')) process.exit(0);

/* ---------- 2. Minification ---------- */
console.log('2. Minification');
const min = async (code, loader) => (await transform(code, { loader, minify: true, target: CIBLES, charset: 'utf8', legalComments: 'none' })).code.trim();
const css = await min(readFileSync(join(SRC, 'style.css'), 'utf8'), 'css');
const js = await min(readFileSync(join(SRC, 'script.js'), 'utf8'), 'js');
const donnees = `window.APPS1D=${JSON.stringify(data).replace(/</g, '\\u003c')};`;

let html = readFileSync(join(SRC, 'index.html'), 'utf8');
const remplacer = (avant, apres) => {
  if (!html.includes(avant)) stop('Structure de accueil/index.html inattendue', [`Élément introuvable : ${avant}`]);
  html = html.replace(avant, () => apres);
};
remplacer('<link rel="stylesheet" href="style.css">', `<style>${css}</style>`);
remplacer('<script src="script.js"></script>', `<script>${donnees}${js}</script>`);
// Scripts et styles protégés, puis compactage du HTML (commentaires et espaces superflus)
const blocs = [];
html = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g, m => `\u0000${blocs.push(m) - 1}\u0000`);
html = html.replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').replace(/\s*(<\/?(?:html|head|body|meta|link|title|header|nav|main|footer|section|div|ul|li|dialog|form|fieldset|legend|p|h1|h2|svg|path|circle|input|label|button|noscript)\b)/g, '$1');
for (let i = 0; i < blocs.length; i++) {
  let b = blocs[i];
  const m = /^<script>([\s\S]*)<\/script>$/.exec(b);
  if (m && !b.includes('window.APPS1D=')) b = `<script>${await min(m[1], 'js')}</script>`;
  html = html.replace(`\u0000${i}\u0000`, () => b);
}
html = html.trim();
ok('CSS, JavaScript et HTML minifiés, liste des outils intégrée dans la page');

/* ---------- 3. Assemblage de public/ ---------- */
console.log('3. Assemblage de public/');
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
// Outils existants du dépôt (dossiers et fichiers à la racine, hors fichiers techniques)
let copies = 0;
for (const f of readdirSync(RACINE)) {
  if (EXCLUS.has(f) || f.startsWith('.')) continue;
  cpSync(join(RACINE, f), join(OUT, f), { recursive: true }); copies++;
}
ok(`${copies} élément(s) du projet copiés (dossiers des outils, images…)`);
// Fichiers de l'accueil
writeFileSync(join(OUT, 'index.html'), html);
cpSync(join(SRC, 'icons'), join(OUT, 'icons'), { recursive: true });
cpSync(join(SRC, 'manifest.webmanifest'), join(OUT, 'manifest.webmanifest'));
// Police Marianne : accueil/fonts/ (recommandé) → CDN → paquet officiel DSFR sur npm (dernier recours)
mkdirSync(join(OUT, 'fonts'), { recursive: true });
const manquantes = POLICES.filter(p => {
  const local = join(SRC, 'fonts', p);
  if (existsSync(local)) cpSync(local, join(OUT, 'fonts', p));
  return !existsSync(local);
});
const telecharger = async url => { const r = await fetch(url); if (!r.ok) throw new Error('HTTP ' + r.status); return Buffer.from(await r.arrayBuffer()); };
for (const p of [...manquantes]) {
  for (const cdn of CDN_POLICES) {
    try { writeFileSync(join(OUT, 'fonts', p), await telecharger(cdn + p)); manquantes.splice(manquantes.indexOf(p), 1); break; } catch { /* source suivante */ }
  }
}
if (manquantes.length) {
  try { // archive npm (≈ 23 Mo) : on n'en extrait que les polices utiles
    const tar = gunzipSync(await telecharger(PAQUET_DSFR));
    for (let o = 0; o + 512 <= tar.length;) {
      const nom = tar.toString('utf8', o, o + 100).replace(/\0.*$/s, ''), taille = parseInt(tar.toString('utf8', o + 124, o + 136), 8) || 0;
      const f = nom.split('/').pop();
      if (manquantes.includes(f) && nom.includes('dist/fonts/')) writeFileSync(join(OUT, 'fonts', f), tar.subarray(o + 512, o + 512 + taille));
      o += 512 + Math.ceil(taille / 512) * 512;
    }
  } catch { /* hors ligne : police système */ }
}
const absentes = POLICES.filter(p => !existsSync(join(OUT, 'fonts', p)));
if (absentes.length) warn(`police Marianne indisponible (${absentes.join(', ')}) : la police système sera utilisée. Déposez les fichiers dans accueil/fonts/.`);
else ok(manquantes.length || POLICES.some(p => !existsSync(join(SRC, 'fonts', p))) ? 'police Marianne téléchargée (conseil : la déposer dans accueil/fonts/)' : 'police Marianne en place');

/* ---------- 4. Service worker : version = empreinte du contenu ---------- */
const precache = ['./', './index.html', './manifest.webmanifest',
  ...readdirSync(join(OUT, 'icons')).map(f => './icons/' + f),
  ...readdirSync(join(OUT, 'fonts')).map(f => './fonts/' + f),
  ...(existsSync(join(OUT, 'images/Logo_DSDEN76.png')) ? ['./images/Logo_DSDEN76.png'] : [])];
const empreinte = createHash('sha256');
for (const f of precache.slice(1)) empreinte.update(readFileSync(join(OUT, f)));
const version = 'apps1d-' + empreinte.digest('hex').slice(0, 10);
let sw = readFileSync(join(SRC, 'sw.js'), 'utf8')
  .replace(/const VERSION = [^;]+;/, `const VERSION = '${version}';`)
  .replace(/const CORE = \[[^\]]*\];/, `const CORE = ${JSON.stringify(precache)};`);
writeFileSync(join(OUT, 'sw.js'), await min(sw, 'js'));
ok(`service worker version ${version} (${precache.length} fichiers pour le hors ligne)`);

/* ---------- Bilan ---------- */
const taille = f => statSync(join(OUT, f)).size;
const ko = n => (n / 1024).toFixed(1) + ' Ko';
const page = readFileSync(join(OUT, 'index.html'));
console.log(`\n✔ Compilation réussie en ${Math.round(performance.now() - t0)} ms → ${relative(process.cwd(), OUT) || 'public'}/`);
console.log(`  Page d'accueil : ${ko(page.length)} (${ko(gzipSync(page).length)} compressée), sw.js ${ko(taille('sw.js'))}\n`);
