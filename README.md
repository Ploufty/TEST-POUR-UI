# Apps1D76 — base de page d'accueil

| Fichier | Rôle | À modifier ? |
|---|---|---|
| `outils.js` | Liste des catégories et des outils | **Oui**, pour ajouter / retirer un outil |
| `index.html` | Structure de la page (titre, textes) | Textes du hero et du pied de page |
| `style.css` | Apparence (couleurs, thèmes, responsive) | Couleurs en haut du fichier |
| `script.js` | Comportements (menu, recherche, animations, préférences) | Non |
| `sw.js` | Fonctionnement hors ligne | Augmenter `VERSION` après chaque mise en ligne |
| `manifest.webmanifest`, `icons/` | Application installable | Nom et icônes |
| `fonts/` | Police Marianne (non versionnée, usage réservé à l'administration) | Déposer `Marianne-Regular.woff2` et `Marianne-Bold.woff2` |

**Ajouter un outil** : copier une ligne `{ "titre": …, "lien": … }` dans la bonne catégorie de `outils.js`.
**Ajouter une catégorie** : copier un bloc catégorie ; couleurs disponibles : `bleu`, `rouge`, `vert`, `orange`, `violet`, `turquoise`.

Le hors ligne et l'installation nécessitent un hébergement en `https://` (ou `localhost`). En double-cliquant sur `index.html`, tout le reste fonctionne.
