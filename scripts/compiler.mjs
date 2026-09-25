// Compilation : Outils/ + accueil/  →  public/ (site prêt à publier)
//   npm run compiler   compile dans public/
//   npm run verifier   vérifie seulement les fiches des outils
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync, existsSync, lstatSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync, gunzipSync } from 'node:zlib';
import { transform } from 'esbuild';
import { RACINE, OUTILS, construireCatalogue } from './catalogue.mjs';

const SRC = join(RACINE, 'accueil'), OUT = join(RACINE, 'public');
const CIBLES = ['chrome90', 'edge90', 'firefox90', 'safari14', 'ios14'];
// Police Marianne : empreintes des fichiers officiels (DSFR 1.15.3), vérifiées après téléchargement
const POLICES = {
  'Marianne-Regular.woff2': '812177facf2d71a85e7aa216f87fd46f5ce5189bee57171a0d0f654dba12b14f',
  'Marianne-Bold.woff2': '03736567d99c2c360bad2c21026ca4741b15ca1e9ab533f272162a65f94cfbfb'
};
const DSFR = '@gouvfr/dsfr@1.15.3';
const SOURCES_POLICES = [`https://cdn.jsdelivr.net/npm/${DSFR}/dist/fonts/`, `https://unpkg.com/${DSFR}/dist/fonts/`];
const ARCHIVE_DSFR = 'https://registry.npmjs.org/@gouvfr/dsfr/-/dsfr-1.15.3.tgz';

const t0 = performance.now();
const ok = m => console.log('  ✔ ' + m), warn = m => console.log('  ⚠ ' + m);
const stop = (titre, liste) => { console.error(`\n✖ ${titre}\n${liste.map(e => '  • ' + e).join('\n')}\n`); process.exit(1); };
const sha256 = b => createHash('sha256').update(b).digest('hex');
const min = async (code, loader) => (await transform(code, { loader, minify: true, target: CIBLES, charset: 'utf8', legalComments: 'none' })).code.trim();

/* ---------- 1. Catalogue des outils ---------- */
console.log('\n1. Lecture du dossier Outils/');
const { categories, erreurs, avertissements } = construireCatalogue();
avertissements.forEach(warn);
if (erreurs.length) stop(`${erreurs.length} problème(s) à corriger`, erreurs);
const nb = categories.reduce((n, c) => n + c.outils.length, 0);
ok(`${nb} outil(s) dans ${categories.length} catégorie(s)`);
if (process.argv.includes('--verifier')) process.exit(0);

/* ---------- 2. Page d'accueil en un seul fichier ---------- */
console.log('2. Page d\'accueil');
let html = readFileSync(join(SRC, 'index.html'), 'utf8');
const remplacer = (avant, apres) => {
  if (!html.includes(avant)) stop('Structure de accueil/index.html inattendue', [`Élément introuvable : ${avant}`]);
  html = html.replace(avant, () => apres);
};
const donnees = `window.APPS1D=${JSON.stringify({ categories }).replace(/</g, '\\u003c')};`;
remplacer('<link rel="stylesheet" href="style.css">', `<style>${await min(readFileSync(join(SRC, 'style.css'), 'utf8'), 'css')}</style>`);
remplacer('<script src="script.js"></script>', `<script>${donnees}${await min(readFileSync(join(SRC, 'script.js'), 'utf8'), 'js')}</script>`);
const logo = existsSync(join(SRC, 'logo.png'));
if (!logo) html = html.replace(/<img [^>]*src="logo\.png"[^>]*>\s*/, '');

// Compactage : scripts/styles mis de côté (et minifiés), commentaires et espaces superflus retirés
const blocs = [];
html = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g, m => `\u0000${blocs.push(m) - 1}\u0000`)
  .replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ')
  .replace(/\s*(<\/?(?:html|head|body|meta|link|title|header|nav|main|footer|section|div|ul|li|dialog|form|fieldset|legend|p|h1|h2|svg|path|circle|input|label|button|noscript)\b)/g, '$1');
const hashes = [];
for (let i = 0; i < blocs.length; i++) {
  let b = blocs[i];
  const m = /^<script>([\s\S]*)<\/script>$/.exec(b);
  if (m) {
    const code = b.includes('window.APPS1D=') ? m[1] : await min(m[1], 'js');
    hashes.push(`'sha256-${createHash('sha256').update(code).digest('base64')}'`);
    b = `<script>${code}</script>`;
  }
  html = html.replace(`\u0000${i}\u0000`, () => b);
}
// Politique de sécurité : seuls les scripts de la page (empreintes) et les fichiers du site sont autorisés
const csp = [`default-src 'self'`, `script-src 'self' ${hashes.join(' ')}`, `style-src 'self' 'unsafe-inline'`, `img-src 'self' data:`,
  `font-src 'self'`, `connect-src 'self'`, `manifest-src 'self'`, `worker-src 'self'`, `object-src 'none'`, `base-uri 'none'`, `form-action 'none'`].join('; ');
html = html.replace('<meta charset="UTF-8">', `<meta charset="UTF-8"><meta http-equiv="Content-Security-Policy" content="${csp}"><meta name="referrer" content="strict-origin-when-cross-origin">`).trim();
ok(`CSS + JavaScript + liste des outils intégrés et minifiés, politique de sécurité ajoutée${logo ? '' : ' (pas de accueil/logo.png : logo masqué)'}`);

/* ---------- 3. Assemblage de public/ ---------- */
console.log('3. Assemblage de public/');
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT);
writeFileSync(join(OUT, 'index.html'), html);
for (const f of ['manifest.webmanifest', 'icones', ...(logo ? ['logo.png'] : [])]) cpSync(join(SRC, f), join(OUT, f), { recursive: true });
// Outils : fichiers cachés, fiches outil.json et liens symboliques non publiés
let ignores = 0;
cpSync(OUTILS, join(OUT, 'Outils'), {
  recursive: true,
  filter: s => {
    const nom = s.split(/[\\/]/).pop();
    const garde = s === OUTILS || !(nom.startsWith('.') || nom === 'outil.json' || nom === 'categories.json' || lstatSync(s).isSymbolicLink());
    if (!garde && s !== OUTILS) ignores++;
    return garde;
  }
});
ok(`dossier Outils/ publié (${ignores} fichier(s) technique(s) ou caché(s) exclus)`);

// Police Marianne : accueil/polices/ → CDN → archive officielle npm ; empreinte contrôlée dans tous les cas
mkdirSync(join(OUT, 'polices'));
const telecharger = async url => { const r = await fetch(url, { signal: AbortSignal.timeout(20000) }); if (!r.ok) throw new Error('HTTP ' + r.status); return Buffer.from(await r.arrayBuffer()); };
const poser = (nom, buf) => { if (sha256(buf) !== POLICES[nom]) return false; writeFileSync(join(OUT, 'polices', nom), buf); return true; };
let manquantes = Object.keys(POLICES).filter(n => !(existsSync(join(SRC, 'polices', n)) && poser(n, readFileSync(join(SRC, 'polices', n)))));
const locales = manquantes.length === 0;
for (const n of [...manquantes]) for (const src of SOURCES_POLICES) {
  try { if (poser(n, await telecharger(src + n))) { manquantes = manquantes.filter(x => x !== n); break; } } catch { /* source suivante */ }
}
if (manquantes.length) try {
  const tar = gunzipSync(await telecharger(ARCHIVE_DSFR));
  for (let o = 0; o + 512 <= tar.length;) {
    const nom = tar.toString('utf8', o, o + 100).replace(/\0.*$/s, ''), taille = parseInt(tar.toString('utf8', o + 124, o + 136), 8) || 0;
    const f = nom.split('/').pop();
    if (manquantes.includes(f) && nom.includes('dist/fonts/') && poser(f, tar.subarray(o + 512, o + 512 + taille))) manquantes = manquantes.filter(x => x !== f);
    o += 512 + Math.ceil(taille / 512) * 512;
  }
} catch { /* hors ligne */ }
if (manquantes.length) warn(`police Marianne indisponible (${manquantes.join(', ')}) : police système utilisée. Déposez les fichiers officiels dans accueil/polices/.`);
else ok(locales ? 'police Marianne en place' : 'police Marianne téléchargée et vérifiée (conseil : la déposer dans accueil/polices/)');

/* ---------- 4. Service worker : version = empreinte du contenu ---------- */
const liste = d => readdirSync(join(OUT, d)).map(f => `./${d}/${f}`);
const precache = ['./', './index.html', './manifest.webmanifest', ...liste('icones'), ...liste('polices'), ...(logo ? ['./logo.png'] : [])];
const empreinte = createHash('sha256');
precache.slice(1).forEach(f => empreinte.update(readFileSync(join(OUT, f))));
const version = 'apps1d-' + empreinte.digest('hex').slice(0, 10);
const sw = readFileSync(join(SRC, 'sw.js'), 'utf8')
  .replace(/const VERSION = [^;]+;/, `const VERSION = '${version}';`)
  .replace(/const CORE = \[[^\]]*\];/, `const CORE = ${JSON.stringify(precache)};`);
writeFileSync(join(OUT, 'sw.js'), await min(sw, 'js'));
ok(`hors ligne : version ${version}, ${precache.length} fichiers`);

const page = readFileSync(join(OUT, 'index.html'));
console.log(`\n✔ Compilation réussie en ${Math.round(performance.now() - t0)} ms → public/`);
console.log(`  Page d'accueil : ${(page.length / 1024).toFixed(1)} Ko (${(gzipSync(page).length / 1024).toFixed(1)} Ko compressée)\n`);
