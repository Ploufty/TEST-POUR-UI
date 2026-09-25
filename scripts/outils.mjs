// Lecture et vérification de outils.json (partagé par la compilation et l'assistant d'ajout)
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RACINE = fileURLToPath(new URL('..', import.meta.url)); // compatible Windows
export const FICHIER = join(RACINE, 'outils.json');
export const COULEURS = ['bleu', 'rouge', 'vert', 'orange', 'violet', 'turquoise'];

export function lire() {
  const texte = readFileSync(FICHIER, 'utf8');
  try { return JSON.parse(texte); }
  catch (e) {
    const pos = +(/position (\d+)/.exec(e.message)?.[1] ?? -1);
    const ligne = pos >= 0 ? texte.slice(0, pos).split('\n').length : '?';
    throw new Error(`outils.json n'est pas un JSON valide (vers la ligne ${ligne}) : virgule en trop ou manquante, guillemet oublié ?\n  ${e.message}`);
  }
}

// Renvoie la liste des erreurs (tableau vide = tout est bon)
export function verifier(data, { liens = true } = {}) {
  const err = [], ids = new Set(), liensVus = new Map();
  if (!Array.isArray(data?.categories) || !data.categories.length) return ['« categories » doit être une liste non vide.'];
  data.categories.forEach((c, ci) => {
    const ou = `Catégorie n°${ci + 1} (${c.titre || 'sans titre'})`;
    for (const k of ['id', 'titre', 'description', 'icone', 'couleur']) if (!c[k] || typeof c[k] !== 'string') err.push(`${ou} : champ « ${k} » manquant.`);
    if (c.id && !/^[a-z0-9-]+$/.test(c.id)) err.push(`${ou} : l'id « ${c.id} » ne doit contenir que des minuscules sans accent, chiffres et tirets.`);
    if (ids.has(c.id)) err.push(`${ou} : l'id « ${c.id} » est déjà utilisé.`); ids.add(c.id);
    if (c.couleur && !COULEURS.includes(c.couleur)) err.push(`${ou} : couleur « ${c.couleur} » inconnue. Choix : ${COULEURS.join(', ')}.`);
    if (!Array.isArray(c.outils)) { err.push(`${ou} : « outils » doit être une liste (même vide : []).`); return; }
    c.outils.forEach((o, oi) => {
      const lieu = `${ou} › outil n°${oi + 1} (${o.titre || 'sans titre'})`;
      for (const k of ['titre', 'description', 'icone', 'lien']) if (!o[k] || typeof o[k] !== 'string') err.push(`${lieu} : champ « ${k} » manquant.`);
      if (o.description?.length > 160) err.push(`${lieu} : description trop longue (${o.description.length} caractères, 160 max).`);
      if (!o.lien) return;
      if (liensVus.has(o.lien)) err.push(`${lieu} : le lien « ${o.lien} » est déjà utilisé par « ${liensVus.get(o.lien)} ».`);
      liensVus.set(o.lien, o.titre);
      if (liens && !/^https?:\/\//.test(o.lien)) {
        const chemin = cheminLocal(o.lien);
        if (!chemin) {
          const vrai = casseReelle(o.lien);
          err.push(vrai ? `${lieu} : le lien « ${o.lien} » a une erreur de majuscules/minuscules. Le vrai nom est « ./${vrai} » (le serveur fait la différence, Windows non).`
                        : `${lieu} : le lien « ${o.lien} » est introuvable dans le projet (dossier ou fichier absent ?).`);
        }
      }
    });
  });
  return err;
}

// Le chemin existe-t-il avec exactement cette casse ? (Windows ignore les majuscules, le serveur non)
function existeExact(rel) {
  let dossier = RACINE;
  for (const part of rel.split('/').filter(Boolean)) {
    if (!existsSync(dossier) || !statSync(dossier).isDirectory() || !readdirSync(dossier).includes(part)) return false;
    dossier = join(dossier, part);
  }
  return true;
}

// Nom réel d'un chemin trouvé sans tenir compte des majuscules (pour suggérer la correction)
function casseReelle(lien) {
  let dossier = RACINE; const reel = [];
  for (const part of decodeURI(lien.replace(/[?#].*$/, '').replace(/^\.?\//, '')).split('/').filter(Boolean)) {
    const trouve = existsSync(dossier) && statSync(dossier).isDirectory() && readdirSync(dossier).find(f => f.toLowerCase() === part.toLowerCase());
    if (!trouve) return null;
    reel.push(trouve); dossier = join(dossier, trouve);
  }
  return reel.join('/') + (lien.endsWith('/') ? '/' : '');
}

// "./dossier/" → dossier/index.html ; renvoie le chemin réel ou null
export function cheminLocal(lien) {
  let p = decodeURI(lien.replace(/[?#].*$/, '').replace(/^\.?\//, '')).replace(/\/+$/, '');
  if (!p || !existeExact(p)) return null;
  const abs = join(RACINE, p);
  if (statSync(abs).isDirectory()) return existeExact(p + '/index.html') ? join(abs, 'index.html') : null;
  return abs;
}
