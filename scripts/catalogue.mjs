// Catalogue des outils : parcourt Outils/, lit chaque fiche outil.json et vérifie l'ensemble.
// Utilisé par la mise à jour (generer.mjs) et l'assistant (ajouter-outil.mjs).
import { readFileSync, existsSync, statSync, readdirSync, lstatSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RACINE = fileURLToPath(new URL('..', import.meta.url));
export const OUTILS = join(RACINE, 'Outils');
export const FICHIER_CATEGORIES = join(OUTILS, 'categories.json');
export const FICHE = 'outil.json';
export const COULEURS = ['bleu', 'rouge', 'vert', 'orange', 'violet', 'turquoise'];
export const CATEGORIE_PAR_DEFAUT = 'autres';
const DESCRIPTION_MAX = 160;

/* ---------- Outils de lecture ---------- */
export function lireJSON(fichier) {
  const texte = readFileSync(fichier, 'utf8').replace(/^﻿/, ''); // BOM ajouté par certains éditeurs Windows
  try { return JSON.parse(texte); }
  catch (e) {
    const pos = +(/position (\d+)/.exec(e.message)?.[1] ?? -1);
    const ligne = pos >= 0 ? texte.slice(0, pos).split('\n').length : '?';
    throw new Error(`${relatif(fichier)} n'est pas un JSON valide (vers la ligne ${ligne}) : virgule en trop ou manquante, guillemet oublié ?`);
  }
}
export const relatif = f => f.slice(RACINE.length).replace(/\\/g, '/');
export const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const texte = v => typeof v === 'string' && v.trim() !== '';

// Le fichier existe-t-il avec exactement cette casse ? (Windows ignore les majuscules, le serveur non)
function trouver(dossier, rel) {
  let d = dossier;
  for (const part of rel.split('/')) {
    const entrees = existsSync(d) && statSync(d).isDirectory() ? readdirSync(d) : [];
    if (entrees.includes(part)) { d = join(d, part); continue; }
    const proche = entrees.find(e => e.toLowerCase() === part.toLowerCase());
    return { ok: false, proche };
  }
  return { ok: statSync(d).isFile() };
}

// Titre et description lus dans la page, pour un dossier déposé sans fiche
export function infosPage(fichier) {
  const html = readFileSync(fichier, 'utf8');
  const entites = s => s?.replace(/&(amp|lt|gt|quot|#39|apos);/g, (_, e) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", apos: "'" }[e])).trim();
  const titre = entites(/<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1]);
  const description = entites(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i.exec(html)?.[1])?.slice(0, DESCRIPTION_MAX);
  return { titre, description };
}

/* ---------- Construction du catalogue ---------- */
// Renvoie { categories, erreurs, avertissements, dossiers }
//   categories : [{ id, titre, court, description, icone, couleur, outils: [{ titre, description, icone, lien }] }]
export function construireCatalogue() {
  const erreurs = [], avertissements = [];
  if (!existsSync(OUTILS)) return { categories: [], erreurs: ['Le dossier Outils/ est introuvable.'], avertissements, dossiers: [] };

  // 1. Catégories
  let cats = [];
  try { cats = lireJSON(FICHIER_CATEGORIES); } catch (e) { erreurs.push(e.message); }
  if (!Array.isArray(cats)) { erreurs.push('Outils/categories.json doit contenir une liste [ … ].'); cats = []; }
  const ids = new Set();
  cats.forEach((c, i) => {
    const ou = `Outils/categories.json › catégorie n°${i + 1} (${c?.titre || 'sans titre'})`;
    for (const k of ['id', 'titre', 'description', 'icone', 'couleur']) if (!texte(c?.[k])) erreurs.push(`${ou} : champ « ${k} » manquant.`);
    if (texte(c?.id) && !/^[a-z0-9-]+$/.test(c.id)) erreurs.push(`${ou} : l'id « ${c.id} » doit être en minuscules sans accent (lettres, chiffres, tirets).`);
    if (ids.has(c?.id)) erreurs.push(`${ou} : l'id « ${c.id} » est déjà utilisé.`);
    if (texte(c?.couleur) && !COULEURS.includes(c.couleur)) erreurs.push(`${ou} : couleur « ${c.couleur} » inconnue. Choix : ${COULEURS.join(', ')}.`);
    ids.add(c?.id);
  });

  // 2. Un dossier = un outil
  const dossiers = readdirSync(OUTILS).filter(d => !d.startsWith('.') && !d.startsWith('_') && lstatSync(join(OUTILS, d)).isDirectory()).sort();
  const outils = [];
  for (const d of dossiers) {
    const ou = `Outils/${d}/`, cheminFiche = join(OUTILS, d, FICHE);
    let o;
    if (existsSync(cheminFiche)) {
      try { o = lireJSON(cheminFiche); } catch (e) { erreurs.push(e.message); continue; }
      if (typeof o !== 'object' || Array.isArray(o) || !o) { erreurs.push(`${ou}${FICHE} doit contenir { … }.`); continue; }
    } else {
      // Dossier glissé sans fiche : on lit la page et on range dans « Autres »
      const page = trouver(join(OUTILS, d), 'index.html');
      if (!page.ok) { erreurs.push(`${ou} : ni fiche ${FICHE} ni page index.html. Lancez « npm run ajouter » pour créer la fiche.`); continue; }
      const infos = infosPage(join(OUTILS, d, 'index.html'));
      o = { titre: infos.titre || d, description: infos.description || 'Description à compléter.', icone: '🧩', categorie: CATEGORIE_PAR_DEFAUT };
      avertissements.push(`${ou} : pas de fiche ${FICHE}, l'outil est rangé dans « Autres outils » (npm run ajouter pour la créer).`);
    }

    // Champs obligatoires et formats
    for (const k of ['titre', 'description', 'icone', 'categorie']) if (!texte(o[k])) erreurs.push(`${ou}${FICHE} : champ « ${k} » manquant.`);
    if (texte(o.description) && o.description.length > DESCRIPTION_MAX) erreurs.push(`${ou}${FICHE} : description trop longue (${o.description.length} caractères, ${DESCRIPTION_MAX} max).`);
    if (texte(o.categorie) && !ids.has(o.categorie)) erreurs.push(`${ou}${FICHE} : catégorie « ${o.categorie} » inconnue. Choix : ${[...ids].join(', ')}.`);
    if (o.ordre !== undefined && !Number.isFinite(o.ordre)) erreurs.push(`${ou}${FICHE} : « ordre » doit être un nombre.`);

    // Lien : page locale du dossier, ou adresse https:// pour un outil hébergé ailleurs
    let lien;
    if (o.url !== undefined) {
      if (typeof o.url !== 'string' || !/^https:\/\/[^\s"'<>]+$/.test(o.url)) erreurs.push(`${ou}${FICHE} : « url » doit commencer par https:// (adresse sécurisée).`);
      else lien = o.url;
    } else {
      const page = o.page ?? 'index.html';
      if (typeof page !== 'string' || page.startsWith('/') || page.split(/[\\/]/).some(p => p === '..' || p === '') || /[?#]/.test(page)) {
        erreurs.push(`${ou}${FICHE} : « page » doit être un fichier du dossier (ex. index.html), sans « .. » ni « / » au début.`);
      } else {
        const r = trouver(join(OUTILS, d), page);
        if (r.ok) lien = `./Outils/${[d, ...page.split('/')].map(encodeURIComponent).join('/')}`;
        else erreurs.push(r.proche
          ? `${ou} : « ${page} » introuvable, mais « ${r.proche} » existe. Attention aux majuscules : le serveur fait la différence, Windows non.`
          : `${ou} : la page « ${page} » est introuvable dans le dossier.`);
      }
    }
    outils.push({ dossier: d, categorie: o.categorie, ordre: o.ordre ?? 1e9, titre: o.titre, description: o.description, icone: o.icone, lien });
  }

  // 3. Regroupement par catégorie (ordre de categories.json, puis « ordre », puis titre)
  const categories = cats.filter(c => ids.has(c?.id)).map(c => ({
    id: c.id, titre: c.titre, court: c.court || c.titre, description: c.description, icone: c.icone, couleur: c.couleur,
    outils: outils.filter(o => o.categorie === c.id)
      .sort((a, b) => a.ordre - b.ordre || String(a.titre).localeCompare(String(b.titre), 'fr'))
      .map(({ titre, description, icone, lien }) => ({ titre, description, icone, lien }))
  })).filter(c => c.outils.length);

  if (!outils.length && !erreurs.length) erreurs.push('Aucun outil trouvé : déposez un dossier par outil dans Outils/.');
  return { categories, erreurs, avertissements, dossiers };
}
