/*
  LISTE DES OUTILS — seul fichier à modifier pour ajouter / retirer un outil.

  Catégorie : id (unique, sans espace), titre, court (libellé mobile), description,
              icone (emoji), couleur (bleu | rouge | vert | orange | violet | turquoise),
              outils (liste).
  Outil     : titre, description, icone (emoji), lien.

  Pourquoi un .js et pas un .json ? Un fichier .json ne peut pas être lu quand on ouvre
  index.html par double-clic (sécurité des navigateurs). Le contenu ci-dessous est du JSON
  pur : seule la première ligne « window.APPS1D = » le rend lisible partout.
*/
window.APPS1D = {
  "categories": [
    {
      "id": "langues",
      "titre": "Français & langues",
      "court": "Français",
      "description": "Lecture, littérature et langues vivantes",
      "icone": "📖",
      "couleur": "bleu",
      "outils": [
        { "titre": "Prompteurs de lecture", "description": "Aide à la lecture avec défilement automatique pour améliorer la fluence.", "icone": "▶️", "lien": "./prompteurs/index.html" },
        { "titre": "Littérature et numérique", "description": "Albums et documentaires pour travailler le numérique en classe.", "icone": "📚", "lien": "./Litteranum/index.html" },
        { "titre": "250 consignes en LVE", "description": "Consignes de classe en allemand, anglais, espagnol et portugais.", "icone": "🙋", "lien": "./250consignes/index.html" }
      ]
    },
    {
      "id": "maths",
      "titre": "Mathématiques",
      "court": "Maths",
      "description": "Calcul et automatismes",
      "icone": "🔢",
      "couleur": "rouge",
      "outils": [
        { "titre": "Course aux nombres", "description": "Générateur de fiches d'entraînement au calcul (CE1 pour le moment).", "icone": "🏃", "lien": "./course/index.html" }
      ]
    },
    {
      "id": "suivi",
      "titre": "Suivi & évaluation",
      "court": "Suivi",
      "description": "Suivre les progrès et aider les élèves",
      "icone": "✅",
      "couleur": "vert",
      "outils": [
        { "titre": "Carnet de suivi Maternelle", "description": "Suivi des apprentissages de ses élèves par domaine de compétence.", "icone": "📒", "lien": "./carnet.html" },
        { "titre": "Éval'aide numérique", "description": "Ressources associées aux compétences des évaluations nationales, du CP au CM2.", "icone": "🔍", "lien": "./evalaide/index.html" }
      ]
    },
    {
      "id": "direction",
      "titre": "Direction d'école",
      "court": "Direction",
      "description": "Organiser la vie de l'école",
      "icone": "🏫",
      "couleur": "orange",
      "outils": [
        { "titre": "Planning de récréation", "description": "Qui surveille quand ? Un organiseur simple avec étiquettes déplaçables.", "icone": "🕒", "lien": "./outildir/orga_recre.html" },
        { "titre": "Planifier ses classes n+1", "description": "Répartition des élèves dans les classes pour préparer la rentrée.", "icone": "📆", "lien": "./outildir/ThunderStruct.html" }
      ]
    }
  ]
};
