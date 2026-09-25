# Ajouter un outil

**Principe : un outil = un dossier dans `Outils/`.** La page d'accueil le trouve et l'affiche toute seule.

## Sur la Forge (sans rien installer)

1. Ouvrir le dossier **Outils** du dépôt › **＋ › Nouveau répertoire** (ex. `calcul-flash`, sans accent ni espace de préférence).
2. **Téléverser** les fichiers de l'outil dans ce dossier (au minimum sa page `index.html`).
3. Dans le même dossier, **＋ › Nouveau fichier** nommé `outil.json` :
   ```json
   {
     "titre": "Calcul mental flash",
     "description": "Des calculs chronométrés pour travailler les automatismes.",
     "icone": "⚡",
     "categorie": "maths"
   }
   ```
   Catégories : `langues`, `maths`, `suivi`, `direction`, `autres` (liste complète dans `Outils/categories.json`).
4. **Valider**. Après 1 à 2 minutes, **Compilation › Pipelines** : ✅ vert = en ligne. ❌ rouge = cliquer pour lire le message, qui indique quoi corriger.

> Oublié la fiche ? L'outil apparaît quand même dans « Autres outils ». Il suffit d'ajouter la fiche ensuite.

## Sur son ordinateur

1. Glisser le dossier de l'outil dans `Outils/`.
2. `npm run ajouter` → choisir le dossier (ceux sans fiche sont proposés en premier), répondre aux questions.
3. `npm run apercu` pour vérifier, puis :
   ```bash
   git add Outils && git commit -m "Ajout de Calcul mental flash" && git push
   ```

## Autres opérations

| Je veux… | Je fais… |
|---|---|
| Retirer un outil | Supprimer son dossier dans `Outils/` |
| Le changer de catégorie | Modifier `"categorie"` dans son `outil.json` |
| Changer l'ordre | Ajouter `"ordre": 1`, `2`… dans les fiches (sinon ordre alphabétique) |
| Page d'entrée autre que index.html | Ajouter `"page": "ma-page.html"` dans la fiche |
| Créer une catégorie | `npm run ajouter` (option « Nouvelle catégorie ») ou ajouter un bloc dans `Outils/categories.json` |
| Proposer un outil sans accès au dépôt | Ouvrir un ticket avec le modèle « Nouvel-outil » |

⚠ Ne jamais déposer de données d'élèves, de sauvegardes ou de mots de passe dans un dossier d'outil : le contrôle de sécurité bloquera la publication.
