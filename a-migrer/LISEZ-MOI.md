# Outils à migrer depuis l'ancien site

Chaque dossier contient la **fiche** (`outil.json`) déjà remplie d'un outil de l'ancien site,
mais pas ses fichiers. Pour migrer un outil :

1. Copier les fichiers de l'outil dans son dossier ici (ex. `a-migrer/course/index.html`, ses images, scripts…).
   Pour `carnet`, `orga-recre` et `thunderstruct`, la page d'entrée est indiquée par `"page"` dans la fiche.
2. Déplacer le dossier complet dans `Outils/`.
3. `npm run compiler` (ou envoyer sur la Forge) : l'outil apparaît sur l'accueil.

Ce dossier n'est jamais publié. Supprimez-le quand tout est migré.
