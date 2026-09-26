# Apps1D76 — page d'accueil des outils numériques

Chaque outil est **un dossier** déposé dans `Outils/`. À chaque envoi sur la Forge, la page d'accueil
se reconstruit toute seule : elle lit les dossiers, les range par catégorie et publie le site.

## Organisation

```
Outils/                    ← un dossier par outil (c'est ici qu'on travaille)
  categories.json          ← les catégories : ordre, nom, couleur, icône
  prompteurs/
    index.html             ← l'outil lui-même
    outil.json             ← sa fiche : titre, description, icône, catégorie
  …
accueil/                   ← la page d'accueil (design) — à ne modifier que pour les textes et couleurs
  index.html  style.css  script.js  sw.js  manifest.webmanifest
  icones/   polices/ (Marianne)   logo.png (facultatif)
scripts/                   ← compilation, assistant, contrôle de sécurité (ne pas modifier)
AJOUTER-UN-OUTIL.md        ← guide pas à pas pour les collègues
a-migrer/                  ← fiches des outils de l'ancien site, en attente de leurs fichiers (non publié)
```

Le site publié ne contient **que** la page d'accueil et le dossier `Outils/` : scripts, fiches, fichiers cachés
(`.env`, `.git`…) et liens symboliques ne sont jamais mis en ligne.

## Commandes (Node.js 18+, après `npm install`)

| Commande | Effet |
|---|---|
| `npm run ajouter` | Assistant : crée ou modifie la fiche d'un dossier (propose d'abord les dossiers sans fiche) |
| `npm run verifier` | Vérifie les fiches et les catégories |
| `npm run compiler` | Compile dans `public/` puis lance le contrôle de sécurité |
| `npm run apercu` | Compile et ouvre l'aperçu sur http://localhost:8080 |
| `npm run securite` | Contrôle de sécurité seul |

## Fiche `outil.json`

```json
{
  "titre": "Course aux nombres",
  "description": "Générateur de fiches d'entraînement au calcul.",
  "icone": "🏃",
  "categorie": "maths",
  "page": "index.html",
  "ordre": 1
}
```
`page` (défaut : `index.html`) et `ordre` (position dans la catégorie, sinon ordre alphabétique) sont facultatifs.
Outil hébergé ailleurs : remplacer `page` par `"url": "https://…"`.
**Sans fiche**, le dossier s'affiche quand même dans « Autres outils » (titre et description lus dans sa page).

## Contrôles automatiques (bloquent la publication en cas de problème)

- Fiches : champs obligatoires, catégorie existante, JSON valide, page présente **en respectant les majuscules**
  (Windows ne fait pas la différence, le serveur si), `url` en `https://` uniquement, pas de chemin `../`.
- Sécurité : secrets dans le code (mots de passe, clés d'API, jetons), fichiers sensibles (`.sql`, `.env`, `.key`, sauvegardes…),
  liens symboliques ; alertes sur les ressources `http://`, scripts externes sans `integrity`, documents bureautiques et fichiers lourds ;
  vulnérabilités des dépendances (`npm audit`).
- Page d'accueil : politique de sécurité (CSP) générée à chaque compilation, textes des fiches systématiquement échappés.

## Publication sur la Forge

Branche principale → compilation + contrôles + publication (**Déploiement › Pages**). Autres branches → contrôles seulement.
Police Marianne : déposer `Marianne-Regular.woff2` et `Marianne-Bold.woff2` dans `accueil/polices/` ; à défaut,
la compilation les récupère depuis le paquet officiel du DSFR et vérifie leur empreinte.
