# Ajouter un outil sur la page d'accueil

Trois façons, de la plus simple à la plus complète. Dans tous les cas, **la Forge vérifie tout automatiquement** : en cas d'erreur, la page en ligne n'est pas modifiée et un message explique quoi corriger.

---

## Méthode 1 — Directement sur la Forge (aucune installation)

1. **Déposer l'outil** : dans le dépôt, bouton **＋ › Nouveau répertoire** (ex. `calcul-flash`), puis **Téléverser un fichier** pour y mettre l'`index.html` et les fichiers de l'outil.
2. **L'ajouter à la liste** : ouvrir `outils.json` › **Modifier** › copier un bloc outil existant dans la bonne catégorie et l'adapter :

   ```json
   {
     "titre": "Calcul mental flash",
     "description": "Des calculs chronométrés pour travailler les automatismes.",
     "icone": "⚡",
     "lien": "./calcul-flash/"
   },
   ```
   ⚠ Une virgule sépare deux blocs, **pas de virgule après le dernier** de la liste.
3. **Valider les modifications** (message : « Ajout de Calcul mental flash »).
4. Après 1 à 2 minutes : **Compilation › Pipelines** doit être ✅ vert. La page en ligne est à jour.
   ❌ rouge ? Cliquer dessus : le message indique la ligne ou le lien à corriger.

## Méthode 2 — Avec l'assistant (sur son ordinateur)

```bash
npm run ajouter      # répondre aux questions : catégorie, nom, description, icône, lien
npm run apercu       # vérifier le rendu
git add . && git commit -m "Ajout de Calcul mental flash" && git push
```

## Méthode 3 — Proposer un outil sans modifier le dépôt

**Tickets › Nouveau ticket › modèle « Nouvel-outil »**, remplir la fiche. Un mainteneur l'ajoutera.

---

## Règles de la liste (`outils.json`)

| Champ | Règle |
|---|---|
| `titre` | Court, sans le mot « outil » |
| `description` | Une phrase, 160 caractères maximum |
| `icone` | Un seul emoji |
| `lien` | `./dossier/` (dossier contenant un `index.html`) ou `https://…` — **respecter les majuscules** |
| Catégorie `id` | minuscules, chiffres et tirets (ex. `sciences`) |
| Catégorie `couleur` | `bleu`, `rouge`, `vert`, `orange`, `violet` ou `turquoise` |

Retirer un outil : supprimer son bloc dans `outils.json` (et son dossier si besoin).
Changer l'ordre : déplacer les blocs, l'ordre du fichier est l'ordre d'affichage.
