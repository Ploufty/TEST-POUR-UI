// Contrôle de sécurité rapide du site compilé (public/)  →  npm run securite
// ✖ bloque la publication · ⚠ à examiner · ✔ conforme
import { readdirSync, readFileSync, lstatSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { execSync } from 'node:child_process';
import { RACINE } from './catalogue.mjs';

const PUB = join(RACINE, 'public');
if (!existsSync(PUB)) { console.error('✖ public/ absent : lancez d\'abord « npm run compiler ».'); process.exit(1); }
const bloquants = [], aExaminer = [];
const rel = f => f.slice(PUB.length + 1).replace(/\\/g, '/');

/* ---------- Inventaire des fichiers publiés ---------- */
const fichiers = [];
(function parcourir(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f), st = lstatSync(p);
    if (st.isSymbolicLink()) bloquants.push(`${rel(p)} : lien symbolique publié.`);
    else if (st.isDirectory()) parcourir(p);
    else fichiers.push({ p, taille: st.size });
  }
})(PUB);

// 1. Fichiers qui ne doivent jamais être en ligne
const INTERDITS = /(^|\/)(\.[^/]+|node_modules|package(-lock)?\.json|outil\.json|categories\.json|[^/]*\.(env|pem|key|p12|pfx|sql|sqlite|db|bak|zip|7z|tar|gz|log|psd|docx?|xlsx?|odt|ods))$/i;
for (const { p } of fichiers) if (INTERDITS.test(rel(p))) (/\.(docx?|xlsx?|odt|ods|zip)$/i.test(p) ? aExaminer : bloquants).push(`${rel(p)} : type de fichier à ne pas publier (données, sauvegarde, secret ?).`);

// 2. Secrets oubliés dans le code (clés, jetons, mots de passe)
const SECRETS = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'clé privée'],
  [/\bglpat-[\w-]{20,}/, 'jeton GitLab'], [/\bgh[pousr]_[A-Za-z0-9]{36}/, 'jeton GitHub'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'clé AWS'], [/\bAIza[0-9A-Za-z_-]{35}\b/, 'clé Google'], [/\bsk-[A-Za-z0-9_-]{20,}/, 'clé d\'API (OpenAI/Anthropic…)'],
  [/(pass(word|wd)?|mot_?de_?passe|secret|api[_-]?key|token)\s*[:=]\s*["'][^"'\s]{8,}["']/i, 'mot de passe ou clé en clair']
];
const TEXTE = new Set(['.html', '.htm', '.js', '.mjs', '.json', '.css', '.txt', '.md', '.xml', '.svg', '.csv', '.webmanifest']);
for (const { p, taille } of fichiers) {
  if (!TEXTE.has(extname(p).toLowerCase()) || taille > 5e6) continue;
  const t = readFileSync(p, 'utf8');
  for (const [re, nom] of SECRETS) if (re.test(t)) bloquants.push(`${rel(p)} : ${nom} détecté(e).`);
  // 3. Ressources non chiffrées (http://) : bloquées par les navigateurs sur un site https
  if (/\.(html?|js|css)$/i.test(p) && /(src|href)\s*=\s*["']http:\/\/(?!localhost|127\.0\.0\.1)/i.test(t)) aExaminer.push(`${rel(p)} : ressource chargée en http:// (non sécurisé).`);
  // 4. Scripts externes sans contrôle d'intégrité
  if (/\.html?$/i.test(p)) for (const m of t.matchAll(/<script\b[^>]*\bsrc=["'](https?:)?\/\/[^"']+["'][^>]*>/gi))
    if (!/\bintegrity=/.test(m[0])) aExaminer.push(`${rel(p)} : script externe sans « integrity » (${/src=["']([^"']+)/.exec(m[0])[1]}).`);
}

// 5. Page d'accueil durcie
const accueil = readFileSync(join(PUB, 'index.html'), 'utf8');
if (!/http-equiv="Content-Security-Policy"/.test(accueil)) bloquants.push('index.html : politique de sécurité (CSP) absente.');
if (/\son[a-z]+\s*=/i.test(accueil.replace(/<script>[\s\S]*?<\/script>/g, ''))) bloquants.push('index.html : gestionnaire d\'événement dans le HTML (onclick=…), incompatible avec la CSP.');
if (/<script\b[^>]*\bsrc=/i.test(accueil)) bloquants.push('index.html : script externe chargé.');
if (/javascript:/i.test(accueil.replace(/<script>[\s\S]*?<\/script>/g, ''))) bloquants.push('index.html : lien javascript: présent.');

// 6. Gros fichiers (lenteur sur les réseaux d'école)
for (const { p, taille } of fichiers) if (taille > 10e6) aExaminer.push(`${rel(p)} : ${(taille / 1e6).toFixed(1)} Mo, à alléger si possible.`);

// 7. Dépendances de compilation (base de vulnérabilités npm)
let audit = 'non vérifiées (hors ligne)';
try {
  const r = JSON.parse(execSync('npm audit --json', { cwd: RACINE, stdio: ['ignore', 'pipe', 'ignore'], timeout: 30000 }).toString());
  audit = 'aucune vulnérabilité connue';
  const v = r.metadata?.vulnerabilities || {};
  if (v.high || v.critical) bloquants.push(`dépendances npm : ${v.high || 0} vulnérabilité(s) élevée(s), ${v.critical || 0} critique(s) (npm audit fix).`);
  else if (v.moderate || v.low) audit = `${(v.moderate || 0) + (v.low || 0)} vulnérabilité(s) mineure(s)`;
} catch (e) {
  try { const r = JSON.parse(e.stdout?.toString() || ''); const v = r.metadata?.vulnerabilities || {}; if (v.high || v.critical) bloquants.push('dépendances npm : vulnérabilités élevées (npm audit).'); else audit = 'vérifiées'; } catch { /* hors ligne */ }
}

/* ---------- Bilan ---------- */
console.log(`\nContrôle de sécurité de public/ (${fichiers.length} fichiers)`);
if (!bloquants.some(b => b.startsWith('index.html'))) console.log('  ✔ accueil : politique de sécurité (CSP), aucun script externe ni événement dans le HTML');
if (!bloquants.length) console.log('  ✔ aucun secret, fichier sensible ni lien symbolique publié');
console.log(`  ✔ dépendances : ${audit}`);
aExaminer.forEach(a => console.log('  ⚠ ' + a));
bloquants.forEach(b => console.log('  ✖ ' + b));
if (bloquants.length) { console.error(`\n✖ ${bloquants.length} problème(s) bloquant(s) : publication refusée.\n`); process.exit(1); }
console.log(`\n✔ Aucun problème bloquant${aExaminer.length ? ` (${aExaminer.length} point(s) à examiner)` : ''}.\n`);
