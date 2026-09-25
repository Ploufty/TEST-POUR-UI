# Apps1D76 — page d'accueil des outils numériques

Page d'accueil compilée et publiée automatiquement sur la Forge (GitLab Pages).

## Organisation du dépôt

```
outils.json            ← LA LISTE DES OUTILS (seul fichier à modifier au quotidien)
accueil/               ← sources de la page d'accueil (design, comportements)
  index.html  style.css  script.js  sw.js  manifest.webmanifest  icons/  fonts/
scripts/               ← outils de compilation (ne pas modifier)
prompteurs/ course/ …  ← les applications, chacune dans son dossier avec un index.html
images/                ← logo DSDEN (images/Logo_DSDEN76.png)
.gitlab-ci.yml         ← vérification + publication automatiques
```

## Commandes (Node.js 18 ou plus)

| Commande | Effet |
|---|---|
| `npm install` | Une seule fois après le clonage |
| `npm run ajouter` | Assistant : ajoute un outil (ou une catégorie) en répondant à des questions |
| `npm run verifier` | Contrôle `outils.json` : champs, couleurs, doublons, liens existants (majuscules comprises) |
| `npm run build` | Compile dans `public/` (page optimisée en un seul fichier ≈ 11 Ko compressés) |
| `npm run apercu` | Compile puis ouvre l'aperçu sur http://localhost:8080 |

## Ce que fait la compilation

1. Vérifie `outils.json` et **bloque la publication** en cas d'erreur (message en français avec l'endroit à corriger).
2. Minifie CSS + JavaScript et les intègre, avec la liste des outils, dans `index.html` : **une seule requête** pour afficher la page.
3. Copie les dossiers des applications dans `public/`.
4. Met à jour la version du service worker automatiquement : les postes reçoivent la nouvelle version sans rien faire.
5. Police Marianne : prise dans `accueil/fonts/` (recommandé), sinon téléchargée depuis le paquet officiel du DSFR.

## Publication

Chaque `git push` sur la branche principale déclenche la publication (menu **Déploiement › Pages** de la Forge pour l'adresse).
Sur une autre branche ou une demande de fusion, la Forge vérifie seulement que tout compile.

## Personnaliser

- Couleurs, thème : haut de `accueil/style.css`. Couleurs de catégories disponibles : `bleu`, `rouge`, `vert`, `orange`, `violet`, `turquoise`.
- Textes du titre et du pied de page : `accueil/index.html`.
- Nom et icônes de l'application installable : `accueil/manifest.webmanifest` et `accueil/icons/`.

Pour ajouter un outil, voir **[AJOUTER-UN-OUTIL.md](AJOUTER-UN-OUTIL.md)**.
