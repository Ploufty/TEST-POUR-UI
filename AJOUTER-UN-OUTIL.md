# Ajouter un outil

**Un outil = un dossier dans `Outils/`.** La page d'accueil le trouve et l'affiche toute seule.

## Directement sur GitHub (sans rien installer)

1. Ouvrir le dossier **Outils** › **Add file › Upload files**.
2. Glisser **le dossier de l'outil** (avec son `index.html`, ses images, scripts…). Cliquer **Commit changes**.
3. Dans ce nouveau dossier : **Add file › Create new file**, nommé `outil.json` :
   ```json
   {
     "titre": "Calcul mental flash",
     "description": "Des calculs chronométrés pour travailler les automatismes.",
     "icone": "⚡",
     "categorie": "vie-de-classe"
   }
   ```
   Catégories disponibles : voir `Outils/categories.json` (champ `id`).
4. **Commit changes**. Dans l'onglet **Actions**, la mise à jour tourne (≈ 20 s) : ✅ = page à jour.
   ❌ = cliquer dessus, le message indique quoi corriger.

> Sans fiche, l'outil s'affiche quand même dans « Autres outils ».

## Sur son ordinateur

1. Glisser le dossier de l'outil dans `Outils/`.
2. `npm run ajouter` → choisir le dossier, répondre aux questions. La page est mise à jour.
3. Ouvrir `index.html` pour vérifier, puis envoyer (`git add -A`, `git commit`, `git push`).

## Options de la fiche

| Champ | Rôle |
|---|---|
| `titre`, `description`, `icone`, `categorie` | Obligatoires (description : 160 caractères max) |
| `page` | Page d'entrée si ce n'est pas `index.html` (ex. `"carnet.html"`) |
| `ordre` | Position dans la catégorie (1, 2, 3…), sinon ordre alphabétique |
| `url` | Outil hébergé ailleurs : `"https://…"` (remplace `page`) |

**Nouvelle catégorie** : ajouter un bloc dans `Outils/categories.json` (couleurs : `bleu`, `rouge`, `vert`, `orange`, `violet`, `turquoise`) ou utiliser `npm run ajouter`.
**Retirer un outil** : supprimer son dossier.

⚠ Ne jamais déposer de données d'élèves, de sauvegardes ou de mots de passe : la vérification bloquera la mise à jour.
