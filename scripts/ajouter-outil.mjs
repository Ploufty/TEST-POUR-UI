// Assistant : crée ou modifie la fiche outil.json d'un dossier déposé dans Outils/  →  npm run ajouter
import { readdirSync, writeFileSync, existsSync, lstatSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import { stdin, stdout } from 'node:process';
import { execFileSync } from 'node:child_process';
import { RACINE, OUTILS, FICHE, FICHIER_CATEGORIES, COULEURS, lireJSON, slug, infosPage, construireCatalogue } from './catalogue.mjs';

/* ---------- Questions (clavier ou réponses collées en bloc) ---------- */
const rl = createInterface({ input: stdin, output: stdout, terminal: stdin.isTTY });
const file = []; let attente = null, ferme = false;
rl.on('line', l => { if (attente) { attente(l); attente = null; } else file.push(l); });
rl.on('close', () => { ferme = true; attente?.(null); });
async function ligne(q) {
  stdout.write(q);
  const l = file.length ? file.shift() : ferme ? null : await new Promise(r => { attente = r; });
  if (l === null) { console.log('\nSaisie interrompue : rien n\'a été modifié.'); process.exit(1); }
  if (!stdin.isTTY) stdout.write(l + '\n');
  return l.trim();
}
async function demander(q, { defaut = '', max } = {}) {
  for (;;) {
    const r = (await ligne(`${q}${defaut ? ` [${defaut}]` : ''} : `)) || defaut;
    if (!r) console.log('  → Réponse obligatoire.');
    else if (max && r.length > max) console.log(`  → ${r.length} caractères, ${max} maximum.`);
    else return r;
  }
}
async function choisir(q, options, defaut) {
  options.forEach((o, i) => console.log(`  ${i + 1}. ${o}`));
  for (;;) {
    const n = +((await ligne(`${q} (1-${options.length})${defaut ? ` [${defaut}]` : ''} : `)) || defaut);
    if (n >= 1 && n <= options.length) return n - 1;
  }
}
const oui = async q => !/^n/i.test(await ligne(`${q} (O/n) : `));

/* ---------- 1. Dossier de l'outil ---------- */
console.log('\n=== Fiche d\'un outil (dossier Outils/) ===\n');
const dossiers = readdirSync(OUTILS).filter(d => !/^[._]/.test(d) && lstatSync(join(OUTILS, d)).isDirectory()).sort();
if (!dossiers.length) { console.log('Aucun dossier dans Outils/ : glissez d\'abord le dossier de l\'outil dans Outils/.'); process.exit(1); }
const sansFiche = dossiers.filter(d => !existsSync(join(OUTILS, d, FICHE)));
const ordre = [...sansFiche, ...dossiers.filter(d => !sansFiche.includes(d))];
console.log(sansFiche.length ? `${sansFiche.length} dossier(s) sans fiche, proposés en premier :` : 'Tous les dossiers ont une fiche. Choisissez celle à modifier :');
const dossier = ordre[await choisir('Dossier', ordre.map(d => `${d}${sansFiche.includes(d) ? '   ← sans fiche' : ''}`), 1)];
const cheminFiche = join(OUTILS, dossier, FICHE);
const existante = existsSync(cheminFiche) ? lireJSON(cheminFiche) : {};

// Page d'entrée : index.html par défaut, sinon choix parmi les pages du dossier
const pages = readdirSync(join(OUTILS, dossier)).filter(f => /\.html?$/i.test(f));
let page = existante.page || 'index.html';
if (!pages.includes(page)) {
  if (!pages.length) { console.log(`\nLe dossier Outils/${dossier}/ ne contient aucune page .html.`); process.exit(1); }
  page = pages[await choisir('\nPage d\'accueil de l\'outil (pas de index.html)', pages, 1)];
}
// Valeurs proposées : fiche existante, sinon titre et description lus dans la page
const lu = infosPage(join(OUTILS, dossier, page));
const proposition = {
  titre: existante.titre || lu.titre || dossier,
  description: existante.description || lu.description || '',
  icone: existante.icone || '🧩'
};

/* ---------- 2. Informations affichées ---------- */
console.log(`\nOutil : Outils/${dossier}/${page}`);
const fiche = {
  titre: await demander('Nom affiché', { defaut: proposition.titre }),
  description: await demander('Description (une phrase)', { defaut: proposition.description, max: 160 }),
  icone: await demander('Icône (un emoji)', { defaut: proposition.icone })
};

/* ---------- 3. Catégorie ---------- */
const categories = lireJSON(FICHIER_CATEGORIES);
const actuelle = categories.findIndex(c => c.id === existante.categorie);
const i = await choisir('\nCatégorie', [...categories.map(c => `${c.icone} ${c.titre}`), '➕ Nouvelle catégorie'], actuelle >= 0 ? actuelle + 1 : undefined);
let categorie = categories[i];
if (!categorie) {
  const titre = await demander('Nom de la catégorie (ex. Sciences)');
  categorie = {
    id: slug(titre), titre,
    court: await demander('Nom court pour mobile', { defaut: titre.split(/[\s&]/)[0] }),
    description: await demander('Sous-titre (ex. Découverte du monde)'),
    icone: await demander('Icône (un emoji)', { defaut: '📁' }),
    couleur: COULEURS[await choisir('Couleur', COULEURS)]
  };
}
fiche.categorie = categorie.id;
if (page !== 'index.html') fiche.page = page;
for (const k of ['ordre', 'url']) if (existante[k] !== undefined) fiche[k] = existante[k];

/* ---------- 4. Enregistrement et vérification ---------- */
console.log(`\n  ${categorie.icone} ${categorie.titre} › ${fiche.icone} ${fiche.titre}\n  ${fiche.description}\n  → Outils/${dossier}/${page}\n`);
if (!(await oui('Enregistrer'))) { console.log('Annulé, rien n\'a été modifié.'); process.exit(0); }
if (i === categories.length) writeFileSync(FICHIER_CATEGORIES, JSON.stringify([...categories, categorie], null, 2) + '\n');
writeFileSync(cheminFiche, JSON.stringify(fiche, null, 2) + '\n');
rl.close();

const { erreurs } = construireCatalogue();
if (erreurs.length) console.log(`\n⚠ Fiche enregistrée, mais le catalogue signale :\n${erreurs.map(e => '  • ' + e).join('\n')}`);
else {
  execFileSync(process.execPath, [join(RACINE, 'scripts', 'generer.mjs')], { stdio: 'ignore' }); // met à jour outils.js
  console.log(`\n✔ Outils/${dossier}/${FICHE} enregistré, page d'accueil mise à jour.`);
}
console.log(`
Étapes suivantes :
  ouvrir index.html dans le navigateur pour vérifier
  git add -A
  git commit -m "Ajout de l'outil ${fiche.titre.replace(/"/g, '')}"
  git push
`);
