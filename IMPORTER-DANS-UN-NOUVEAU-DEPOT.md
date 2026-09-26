# Créer un nouveau dépôt GitHub à partir du zip

Objectif : partir du zip du projet et obtenir un dépôt propre dont la page d'accueil est en ligne et se met à jour toute seule.
Durée : 10 minutes environ. Tout se fait dans le navigateur, sans rien installer.

---

## Étape 1 — Récupérer le zip

- **Depuis GitHub :** ouvrir le dépôt, choisir la branche **`Clean`** (bouton des branches en haut à gauche), puis **Code › Download ZIP**.
- **Ou** utiliser le zip `Apps1D76-Clean.zip` fourni.

**Décompresser** le zip (clic droit › *Extraire tout*). On obtient un dossier, par exemple `TEST-POUR-UI-Clean`.
Ouvrir ce dossier : il doit contenir directement `index.html`, `style.css`, `Outils`, `scripts`…

> ⚠ **Afficher les fichiers cachés**, car trois éléments importants commencent par un point : `.github`, `.gitlab` et `.gitignore`.
> - Windows : Explorateur › **Affichage › Afficher › Éléments masqués**
> - Mac : dans le Finder, **Cmd + Maj + .** (point)

## Étape 2 — Créer le dépôt vide

1. Sur GitHub : **+** (en haut à droite) › **New repository**.
2. **Repository name** : par exemple `apps1d76` (sans espace ni accent).
3. Visibilité **Public** : obligatoire pour GitHub Pages avec un compte gratuit.
4. **Ne rien cocher** : ni README, ni .gitignore, ni licence. Le dépôt doit être vide.
5. **Create repository**.

## Étape 3 — Déposer les fichiers

1. Sur la page du dépôt vide, cliquer sur le lien **uploading an existing file**.
2. Dans le dossier décompressé, **sélectionner tout son contenu** (Ctrl + A, ou Cmd + A sur Mac) et le **glisser** dans la page GitHub.

   > ⚠ Glisser **le contenu** du dossier, **pas le dossier lui-même**. Sinon tout se retrouve dans un sous-dossier, et la page d'accueil n'est pas trouvée : Pages affiche alors le README.
3. Attendre la fin du chargement (≈ 70 fichiers).
4. En bas, message : `Import initial du projet`, puis **Commit changes**.

## Étape 4 — Vérifier que rien ne manque

Sur la page d'accueil du dépôt, on doit voir **à la racine** :

```
.github/   .gitlab/   Outils/   a-migrer/   icones/   scripts/
.gitignore   .gitlab-ci.yml   AJOUTER-UN-OUTIL.md   CLAUDE.md   IMPORTER-DANS-UN-NOUVEAU-DEPOT.md
README.md   index.html   manifest.webmanifest   outils.js   package.json   script.js   style.css   sw.js
```

**Point le plus important :** le fichier `.github/workflows/mise-a-jour.yml` doit exister. C'est lui qui met à jour la liste des outils.

**S'il manque** (certains navigateurs ignorent les dossiers cachés) :
1. **Add file › Create new file**.
2. Taper comme nom : `.github/workflows/mise-a-jour.yml`. Les `/` créent les dossiers automatiquement.
3. Coller le contenu de ce même fichier, ouvert avec le Bloc-notes depuis le dossier décompressé.
4. **Commit changes**.

Faire de même pour `.gitignore` si besoin.

## Étape 5 — Mettre la page en ligne

1. **Settings** (onglet du dépôt) › **Pages** (menu de gauche).
2. **Source** : *Deploy from a branch*.
3. **Branch** : choisir **`main`**, puis **`/ (root)`**, puis cliquer sur **Save**.
4. Attendre 1 à 2 minutes et recharger la page des réglages. En haut s'affiche : *Your site is live at* **https://VOTRE-NOM.github.io/apps1d76/**.

## Étape 6 — Vérifier que tout fonctionne

- **La page :** ouvrir l'adresse ci-dessus. On doit voir la page d'accueil avec la carte « Tirage au sort ». En cas de doute, recharger avec **Ctrl + F5**.
- **L'automatisme :** onglet **Actions**. La ligne « Mettre à jour la page d'accueil » doit être ✅ verte.
  - Si l'onglet affiche un bouton du type *I understand my workflows, go ahead and enable them*, cliquer dessus.
  - Ensuite, choisir le workflow › **Run workflow**.

## Étape 7 — Premier test : ajouter un outil

1. Ouvrir le dossier `Outils` › **Add file › Upload files** › glisser le dossier d'un outil (avec son `index.html`) › **Commit changes**.
2. Attendre ≈ 1 minute : l'onglet **Actions** passe au vert, puis le nouvel outil apparaît dans « Autres outils ».
3. Pour le ranger dans une catégorie, ajouter sa fiche `outil.json` : voir [AJOUTER-UN-OUTIL.md](AJOUTER-UN-OUTIL.md).

---

## Variante : en ligne de commande (avec Git installé)

Pour les personnes à l'aise avec un terminal. Après avoir créé le dépôt vide (étape 2) :

```bash
cd chemin/vers/TEST-POUR-UI-Clean      # le dossier décompressé
git init -b main
git add -A
git commit -m "Import initial du projet"
git remote add origin https://github.com/VOTRE-NOM/apps1d76.git
git push -u origin main
```

Reprendre ensuite à l'étape 5.

---

## Problèmes fréquents

| Ce que je vois | Solution |
|---|---|
| Pages affiche le README | Les fichiers sont dans un sous-dossier (refaire l'étape 3 avec le **contenu** du dossier), ou la branche n'est pas choisie dans Pages (étape 5). |
| Erreur 404 | Attendre 2 minutes, vérifier l'adresse (le nom du dépôt fait partie de l'adresse), vérifier que le dépôt est **Public**. |
| Un nouvel outil n'apparaît pas | Onglet **Actions** : le workflow est-il vert ? S'il est rouge, cliquer dessus : le message indique quoi corriger. Si aucun workflow n'apparaît, le dossier `.github` manque (étape 4). |
| Le workflow échoue avec « Permission denied » | **Settings › Actions › General › Workflow permissions** : cocher *Read and write permissions*, puis **Save**. |
| « Too many files » lors du dépôt | GitHub accepte 100 fichiers par envoi : déposer en plusieurs fois (par exemple `Outils` à part). |
