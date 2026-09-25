// Assistant d'ajout d'un outil : npm run ajouter
// Pose quelques questions, met à jour outils.json et vérifie le résultat.
import { writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { stdin, stdout } from 'node:process';
import { FICHIER, COULEURS, lire, verifier, cheminLocal } from './outils.mjs';

// Lecture des réponses ligne par ligne (fonctionne au clavier comme en copier-coller de plusieurs lignes)
const rl = createInterface({ input: stdin, output: stdout, terminal: stdin.isTTY });
const lignes = []; let attente = null, ferme = false;
rl.on('line', l => { if (attente) { attente(l); attente = null; } else lignes.push(l); });
rl.on('close', () => { ferme = true; if (attente) attente(null); });
const lireLigne = async q => {
  stdout.write(q);
  let l = lignes.length ? lignes.shift() : ferme ? null : await new Promise(r => { attente = r; });
  if (l === null) { console.log('\nSaisie interrompue : rien n\'a été modifié.'); process.exit(1); }
  if (!stdin.isTTY) stdout.write(l + '\n');
  return l;
};
const demander = async (q, { defaut = '', requis = true, max } = {}) => {
  for (;;) {
    const r = (await lireLigne(`${q}${defaut ? ` [${defaut}]` : ''} : `)).trim() || defaut;
    if (requis && !r) { console.log('  → Réponse obligatoire.'); continue; }
    if (max && r.length > max) { console.log(`  → ${r.length} caractères, ${max} maximum.`); continue; }
    return r;
  }
};
const choisir = async (q, options) => {
  options.forEach((o, i) => console.log(`  ${i + 1}. ${o}`));
  for (;;) {
    const n = +(await lireLigne(`${q} (1-${options.length}) : `));
    if (n >= 1 && n <= options.length) return n - 1;
  }
};
const slug = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

console.log('\n=== Ajouter un outil à la page d\'accueil ===\n');
const data = lire();

// 1. Catégorie
const i = await choisir('Catégorie', [...data.categories.map(c => `${c.icone} ${c.titre}`), '➕ Nouvelle catégorie']);
let cat = data.categories[i];
if (!cat) {
  const titre = await demander('Nom de la catégorie (ex. Sciences)');
  cat = {
    id: slug(titre), titre,
    court: await demander('Nom court pour mobile', { defaut: titre.split(/[\s&]/)[0] }),
    description: await demander('Sous-titre (ex. Découverte du monde)'),
    icone: await demander('Icône (un emoji)', { defaut: '📁' }),
    couleur: COULEURS[await choisir('Couleur', COULEURS)],
    outils: []
  };
  data.categories.push(cat);
}

// 2. Outil
console.log(`\nNouvel outil dans « ${cat.titre} »`);
const outil = {
  titre: await demander('Nom de l\'outil'),
  description: await demander('Description courte (une phrase)', { max: 160 }),
  icone: await demander('Icône (un emoji)', { defaut: '🧩' }),
  lien: ''
};
for (;;) {
  outil.lien = await demander('Lien (dossier du projet ex. ./mon-outil/  ou adresse https://…)', { defaut: `./${slug(outil.titre)}/` });
  if (/^https?:\/\//.test(outil.lien) || cheminLocal(outil.lien)) break;
  console.log(`  → « ${outil.lien} » n'existe pas encore dans le projet (un dossier doit contenir un index.html).`);
  if ((await lireLigne('    Garder ce lien quand même ? La compilation échouera tant que le dossier manque (o/N) : ')).toLowerCase() === 'o') break;
}
cat.outils.push(outil);

// 3. Récapitulatif et enregistrement
console.log(`\nRécapitulatif :\n  ${cat.icone} ${cat.titre} › ${outil.icone} ${outil.titre}\n  ${outil.description}\n  → ${outil.lien}\n`);
if ((await lireLigne('Enregistrer ? (O/n) : ')).toLowerCase() === 'n') { console.log('Annulé, rien n\'a été modifié.'); process.exit(0); }
writeFileSync(FICHIER, JSON.stringify(data, null, 2) + '\n');
rl.close();

const erreurs = verifier(data);
console.log(erreurs.length ? `\n⚠ outils.json enregistré, mais à corriger :\n${erreurs.map(e => '  • ' + e).join('\n')}` : '\n✔ outils.json mis à jour et vérifié.');
console.log(`
Étapes suivantes :
  npm run build                    (aperçu : ouvrir public/index.html)
  git add outils.json ${outil.lien.startsWith('http') ? '' : outil.lien.replace(/^\.\//, '')}
  git commit -m "Ajout de l'outil ${outil.titre}"
  git push
`);
