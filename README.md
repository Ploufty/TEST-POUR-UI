# Apps1D76 — page d'accueil des outils numériques

**Ouvrir `index.html` = voir la page d'accueil.** Aucune installation, aucune compilation.

## Organisation

```
index.html              ← la page d'accueil
style.css  script.js    ← son apparence et son fonctionnement
outils.js               ← liste des outils, GÉNÉRÉE AUTOMATIQUEMENT (ne pas modifier)
Outils/                 ← UN DOSSIER PAR OUTIL : c'est le seul endroit où l'on travaille
  categories.json       ← les catégories (nom, couleur, icône, ordre)
  tirage-au-sort/       ← exemple : les fichiers de l'outil + sa fiche outil.json
a-migrer/               ← fiches des outils de l'ancien site, en attente de leurs fichiers
icones/  manifest.webmanifest  sw.js   ← application installable et hors ligne
scripts/                ← assistant, mise à jour, sécurité (ne pas modifier)
```

## Ajouter un outil

1. Glisser le dossier de l'outil dans `Outils/` (avec sa page `index.html`).
2. Lui ajouter une fiche `outil.json` (ou lancer `npm run ajouter`, qui la crée en posant des questions).
3. Envoyer sur GitHub : la liste `outils.js` est mise à jour automatiquement, la page en ligne suit.

Détails et exemples : **[AJOUTER-UN-OUTIL.md](AJOUTER-UN-OUTIL.md)**.

## Commandes (facultatives, Node.js 18+)

| Commande | Effet |
|---|---|
| `npm run ajouter` | Crée la fiche d'un outil en posant des questions, puis met la page à jour |
| `npm run generer` | Relit `Outils/` et met à jour `outils.js` (+ contrôle de sécurité) |
| `npm run verifier` | Vérifie les fiches sans rien modifier |
| `npm run apercu` | Met à jour puis ouvre la page sur http://localhost:8080 |

Sans Node.js : il suffit d'envoyer sur GitHub, la mise à jour se fait en ligne (onglet **Actions**).

## Publication

- **GitHub Pages** : Settings › Pages › *Deploy from a branch* › **Clean** / (root).
- **Forge (GitLab)** : `.gitlab-ci.yml` met à jour la liste et publie sur GitLab Pages.

## Sécurité

À chaque mise à jour : fiches vérifiées (liens `https://` uniquement, pas de `../`, majuscules exactes),
textes échappés à l'affichage, politique de sécurité (CSP) de la page recalculée, recherche de mots de passe,
clés d'API et fichiers sensibles (`.sql`, `.env`, `.key`…) qui bloque la publication.
