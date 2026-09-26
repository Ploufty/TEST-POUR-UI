# Guide du projet Apps1D76

> Ce fichier sert de **notice** pour les personnes qui maintiennent le projet et de **mémoire de travail** pour Claude
> (Claude Code le lit automatiquement au début de chaque session). À tenir à jour quand l'organisation change.

---

## 1. Le projet en une minute

**Apps1D76** est la page d'accueil des outils numériques de la **Mission Numérique Éducatif 76** (DSDEN de Seine-Maritime).
Elle présente des applications web pour l'école primaire, rangées par catégories, avec recherche, mode sombre,
réglages d'accessibilité, installation comme application et fonctionnement hors connexion.

Le principe :

> **Un outil = un dossier dans `Outils/`.** Un script relit ce dossier et met à jour la liste affichée.

Le site est **100 % statique** (HTML, CSS, JavaScript). Il n'y a ni serveur, ni base de données, ni dépendance à installer.

---

## 2. Organisation des fichiers

```
index.html              La page d'accueil (structure HTML)
style.css               Toute l'apparence (couleurs, thèmes, animations, responsive)
script.js               Tout le fonctionnement (affichage des outils, menu, recherche, réglages, animations)
outils.js               ⚙ GÉNÉRÉ : la liste des outils (ne jamais modifier à la main)
sw.js                   Service worker : fonctionnement hors ligne (VERSION et CORE mis à jour automatiquement)
manifest.webmanifest    Fiche de l'application installable (nom, couleurs, icônes)
icones/                 Icônes de l'application et favicon

Outils/                 ★ LES OUTILS : un dossier par outil
  categories.json       Liste et ordre des catégories
  tirage-au-sort/       Exemple d'outil : ses fichiers + sa fiche outil.json

a-migrer/               Fiches des 8 outils de l'ancien site, en attente de leurs fichiers (voir LISEZ-MOI.md)

scripts/                Outils de maintenance (Node.js, sans dépendance)
  catalogue.mjs         Lit Outils/, vérifie les fiches, construit la liste
  generer.mjs           Écrit outils.js + met à jour la sécurité (CSP) et le hors ligne
  ajouter-outil.mjs     Assistant en questions/réponses pour créer une fiche
  securite.mjs          Contrôle de sécurité (secrets, fichiers sensibles, CSP…)

.github/workflows/mise-a-jour.yml   GitHub : relance generer.mjs à chaque envoi sur la branche Clean
.gitlab-ci.yml                      Forge (GitLab) : génère puis publie sur GitLab Pages
.gitlab/                            Modèles de ticket et de demande de fusion « Nouvel-outil »
README.md                           Présentation courte
AJOUTER-UN-OUTIL.md                 Tutoriel pour les collègues (sans connaissances techniques)
CLAUDE.md                           Ce guide (lu automatiquement par Claude Code)
```

**Règle d'or :** on travaille dans `Outils/`. On ne touche à `index.html`, `style.css` et `script.js` que pour changer
le design ou le comportement de la page.

---

## 3. Comment ça marche

```
Outils/                     scripts/generer.mjs              index.html (dans le navigateur)
├─ categories.json   ──┐                                      ├─ charge outils.js  → window.APPS1D
├─ outil-a/outil.json ─┼──►  lit, vérifie, trie  ──►  outils.js    └─ charge script.js → dessine les cartes
└─ outil-b/outil.json ─┘     + met à jour CSP dans index.html
                             + met à jour VERSION/CORE dans sw.js
```

1. **`scripts/catalogue.mjs`** parcourt `Outils/`. Chaque sous-dossier est un outil. Les dossiers qui commencent par `.` ou `_` sont ignorés.
   - Si le dossier a une fiche `outil.json`, elle est lue et vérifiée.
   - Sinon, l'outil va dans la catégorie `autres`. Son titre et sa description sont lus dans les balises `<title>` et `<meta name="description">` de sa page.
2. **`scripts/generer.mjs`** écrit `outils.js` (`window.APPS1D = { categories: [...] }`) et fait deux mises à jour :
   - l'empreinte SHA-256 du petit script intégré à `index.html` dans la balise **Content-Security-Policy** ;
   - `VERSION` (empreinte du contenu) et `CORE` (fichiers à garder hors ligne) dans `sw.js`.

   Le script n'écrit un fichier que si son contenu change. Le relancer sans rien modifier ne produit donc aucun changement.
3. **`script.js`** lit `window.APPS1D`, génère les sections, les cartes et le menu, puis active les interactions.
   Tous les textes venant des fiches sont **échappés** (fonction `esc`) : une fiche ne peut pas injecter de HTML.
4. **Automatismes :**
   - sur GitHub, le workflow `mise-a-jour.yml` exécute `npm run generer` à chaque envoi sur `Clean` et enregistre `outils.js` s'il a changé (commit « Mise à jour automatique… ») ;
   - sur la Forge, `.gitlab-ci.yml` fait la même chose puis publie.

### Format des fichiers de données

`Outils/categories.json` est une liste. L'ordre de la liste est l'ordre d'affichage.
```json
[{ "id": "maths", "titre": "Mathématiques", "court": "Maths", "description": "Calcul et automatismes", "icone": "🔢", "couleur": "rouge" }]
```
- `id` : minuscules, chiffres et tirets.
- `court` : libellé affiché sur mobile.
- `couleur` : `bleu`, `rouge`, `vert`, `orange`, `violet` ou `turquoise`.
- La catégorie `autres` doit exister : elle reçoit les dossiers sans fiche.
- Une catégorie sans outil n'est pas affichée.

`Outils/<dossier>/outil.json` :
```json
{ "titre": "Tirage au sort", "description": "Une phrase (160 caractères max).", "icone": "🎲", "categorie": "vie-de-classe" }
```
Champs facultatifs :
- `"page": "carnet.html"` : page d'entrée si ce n'est pas `index.html` ;
- `"ordre": 1` : position dans la catégorie (sinon ordre alphabétique) ;
- `"url": "https://…"` : outil hébergé ailleurs, à la place de `page`.

---

## 4. Tutoriel : modifier le projet

### Ajouter un outil
1. Copier le dossier de l'outil dans `Outils/`. Un nom sans espace ni accent est préférable, par exemple `calcul-flash`.
2. Créer la fiche : `npm run ajouter` (l'assistant pose les questions et met la page à jour), ou écrire `outil.json` à la main puis lancer `npm run generer`.
3. Ouvrir `index.html` pour vérifier, puis envoyer (commit et push).

Pour ne copier que ce qui sert : prendre les fichiers de l'application, sans les `README.md`, notes de développement ni `node_modules`.

### Retirer ou déplacer un outil
- **Retirer :** supprimer son dossier, puis `npm run generer`.
- **Changer de catégorie ou d'ordre :** modifier `categorie` ou `ordre` dans sa fiche, puis `npm run generer`.

### Ajouter une catégorie
Ajouter un bloc dans `Outils/categories.json` (ou choisir « Nouvelle catégorie » dans `npm run ajouter`).
Pour une **nouvelle couleur** :
1. dans `style.css`, section 3, ajouter `.cat-xxx { --cat: …; --cat-soft: …; }` et sa variante `[data-theme="dark"] .cat-xxx` ;
2. dans `scripts/catalogue.mjs`, ajouter `'xxx'` à `COULEURS`.

La couleur `--cat` doit avoir un **contraste d'au moins 4,5:1** sur le fond (blanc en clair, `#1c1c2b` en sombre).

### Changer les textes de la page
Dans `index.html` :
- le titre est la balise `<h1>`. Chaque mot est un `<span style="--w:N">` pour l'animation mot par mot ; la partie rouge soulignée est `.accent` ;
- l'accroche est le `<p>` qui suit ;
- le pied de page est `<footer>` ;
- le nom et le sous-titre sont dans `.brand`.

Pour le logo : déposer `logo.png` à la racine, décommenter la ligne `<img src="logo.png">` dans `index.html`, puis lancer `npm run generer` (le logo est alors ajouté au hors ligne).

### Changer les couleurs, la police ou l'aspect
Tout est dans `style.css`, découpé en 11 sections numérotées :

| Section | Contenu |
|---|---|
| 1 | Police Marianne (chargée depuis le paquet officiel du DSFR sur jsDelivr) |
| 2 | **Thème** : toutes les couleurs en variables (`:root` = clair, `[data-theme="dark"]` = sombre, `[data-contrast="high"]` = contraste renforcé) |
| 3 | Couleurs des catégories |
| 4 | Base (typographie, liens, focus clavier, conteneur) |
| 5 | Fond animé (formes, points ; réagit à la souris `--px/--py` et au défilement `--s`) |
| 6 | En-tête, titre, recherche |
| 7 | Menu collant des catégories |
| 8 | Sections et cartes (apparition au défilement, survol 3D, bordure tournante) |
| 9 | Panneau « Affichage » (boîte de dialogue) |
| 10 | Animations réduites (`[data-motion="reduce"]`) |
| 11 | Responsive (du téléphone de 280 px au TBI 4K, paysage, impression) |

Pour changer une couleur, modifier **la variable**, jamais les valeurs dispersées dans le fichier.

### Changer un comportement
`script.js` est une seule fonction découpée en 7 blocs :
1. préférences d'affichage (enregistrées dans le navigateur, valeurs contrôlées par `nettoyer`) ;
2. rendu des outils et du menu ;
3. recherche (insensible aux accents) ;
4. défilement (barre de progression, fond, catégorie active) ;
5. effets de souris (appareils à souris uniquement) ;
6. constellation animée de l'en-tête (`<canvas>`, en pause hors écran) ;
7. installation et hors ligne.

Les animations passent par des **variables CSS** que le script met à jour. Le script ne déplace jamais les éléments lui-même.

⚠ Le petit `<script>` intégré dans le `<head>` de `index.html` applique les réglages avant l'affichage. **Après toute modification de ce script, lancer `npm run generer`**, sinon la politique de sécurité le bloquera (son empreinte a changé).

---

## 5. Commandes

Toutes les commandes demandent Node.js 18 ou plus, et **aucun `npm install`**.

| Commande | Rôle |
|---|---|
| `npm run ajouter` | Assistant : crée ou modifie une fiche, puis met la page à jour |
| `npm run generer` | Relit `Outils/`, écrit `outils.js`, met à jour la CSP et `sw.js`, puis lance le contrôle de sécurité |
| `npm run verifier` | Vérifie les fiches sans rien écrire (code de sortie 1 en cas d'erreur) |
| `npm run securite` | Contrôle de sécurité seul |
| `npm run apercu` | `generer`, puis serveur local sur http://localhost:8080 (télécharge le petit serveur `http-server` au premier lancement) |

Pour tester l'installation et le hors ligne, il faut passer par `npm run apercu` ou par un site en `https://`. Ces deux fonctions ne marchent pas en ouvrant le fichier par double-clic (`file://`) ; le reste de la page fonctionne.

---

## 6. Sécurité

- **Fiches :** `url` en `https://` uniquement ; `page` sans `..` ni `/` au début ; nom de fichier vérifié **en respectant les majuscules** (Windows ne fait pas la différence, le serveur si) ; catégorie et couleur prises dans une liste fermée.
- **Affichage :** tout texte venant d'une fiche est échappé ; les réglages enregistrés dans le navigateur sont validés.
- **CSP** dans `index.html` : seuls les scripts du site et l'empreinte du script intégré sont autorisés ; les polices ne peuvent venir que du site ou de `cdn.jsdelivr.net` ; aucun `onclick=` n'est permis dans le HTML.
- **`securite.mjs`** bloque la mise à jour en cas de clés privées, jetons (GitLab, GitHub, AWS, Google, API), mots de passe en clair, fichiers `.env`, `.sql`, `.key`, `.pem`, `.bak`, archives `.7z`/`.tar`/`.gz`, ou liens symboliques. Il signale aussi (sans bloquer) les ressources en `http://`, les scripts externes sans `integrity`, les `.zip` et documents bureautiques, et les fichiers de plus de 10 Mo.
- **Données personnelles :** ne jamais déposer de données d'élèves dans `Outils/`. Tout le contenu de la branche est public.

---

## 7. Publication

- **GitHub Pages :** Settings › Pages › *Deploy from a branch* › **`Clean`** / (root). Pages publie la branche telle quelle, avec Jekyll, qui ignore les fichiers commençant par `.`.
- **Forge (GitLab) :** `.gitlab-ci.yml` exécute `npm run generer`, copie les fichiers du site dans `public/` et publie. Sur les autres branches, il ne fait que vérifier.
- **Hors ligne :** chaque changement de contenu modifie `VERSION` dans `sw.js`, et les navigateurs récupèrent alors la nouvelle version. `outils.js` et les pages passent d'abord par le réseau, pour qu'un nouvel outil apparaisse tout de suite.

---

## 8. Pièges connus

| Symptôme | Cause et solution |
|---|---|
| Pages affiche le README | La source de Pages n'est pas la branche `Clean`. Voir la section 7. |
| Un outil n'apparaît pas | `outils.js` n'a pas été régénéré : lancer `npm run generer`, ou vérifier l'onglet Actions de GitHub. |
| « introuvable, mais X existe » | Erreur de majuscules dans `page` ou dans le nom du dossier. |
| Page sans réglages ni thème après une modification | L'empreinte CSP n'est plus à jour : `npm run generer`. |
| Police différente de Marianne | Le CDN jsDelivr est bloqué par le réseau. La police système prend le relais, c'est normal. |
| Ancienne version affichée | Cache du service worker : recharger avec Ctrl + F5, ou vérifier que `sw.js` a bien une nouvelle `VERSION`. |
| Pas de bouton « Installer » | Normal en double-clic (`file://`) et sur iPad ; le panneau affiche alors la marche à suivre pour iOS. |

---

## 9. Consignes pour Claude (et pour tout développeur)

- **Langue :** interface, messages, commentaires et documentation en **français**. Commits en anglais, avec les lignes d'attribution demandées.
- **Aucune dépendance npm.** Les scripts n'utilisent que Node.js et le site n'utilise que des fichiers statiques. Ne pas réintroduire d'étape de compilation : le principe est « ouvrir `index.html` = voir la page ».
- **Ne jamais modifier `outils.js` à la main.** Après toute modification de `Outils/`, du script du `<head>` ou des fichiers de l'accueil, lancer `npm run generer` et commiter les fichiers qu'il a modifiés.
- **Style du code :** CSS par variables et sections numérotées ; JS en une seule fonction autonome, sans bibliothèque ; échapper tout texte injecté ; pas de gestionnaire d'événement dans le HTML (CSP).
- **Accessibilité à maintenir :** contraste AA, zones tactiles d'au moins 44 px, focus visible, `aria-label` sur les boutons-icônes, respect de `prefers-reduced-motion` et de `[data-motion="reduce"]`.
- **Vérifier avant d'envoyer :**
  1. `node --check` sur chaque fichier JS modifié ;
  2. `npm run generer`, qui doit afficher « Aucun problème bloquant » ;
  3. ouvrir `index.html` en double-clic et via `npm run apercu` : cartes, menu, recherche, thème, panneau, ouverture d'un outil, aucune erreur dans la console ;
  4. tester les largeurs 320, 390, 768, 1280 et 1920 px, sans défilement horizontal ;
  5. en cas de modification visuelle, vérifier les modes clair, sombre, contraste renforcé et texte à 130 %.
- **Branches :** `Clean` est la branche de référence. Les branches `claude/*` sont l'historique des versions précédentes (v1 à v4).
- **Fonctionnalités écartées volontairement :** compilation et minification (v3/v4, jugées trop complexes pour l'équipe), police Marianne stockée dans le dépôt (licence réservée à l'administration).

---

## 10. Historique des décisions

| Version | Décision |
|---|---|
| v1 | Fond blanc, bleu-blanc-rouge, sobriété, animations au survol et en fond |
| v2 | Catégories colorées, menu collant, police Marianne, mode sombre, panneau d'accessibilité, application installable et hors ligne |
| v3 | Compilation pour la Forge (abandonnée) |
| v4 | « Un outil = un dossier dans `Outils/` » avec une fiche `outil.json`, et contrôle de sécurité |
| **Clean** | Page directement à la racine sans compilation, `outils.js` généré automatiquement, zéro dépendance |
