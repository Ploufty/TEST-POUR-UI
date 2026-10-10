---
name: charte-ui-mission-numerique-76
description: Charte d'interface des projets de la Mission Numérique Éducatif 76 (style Apps1D76) — couleurs en palettes, police Marianne, cartes animées, mode sombre, réglages d'accessibilité. À appliquer dès qu'on crée ou modifie une page, une application web ou un outil de la Mission Numérique 76, pour garantir la même interface partout.
---

# Charte d'interface — Mission Numérique Éducatif 76

> **But :** retrouver **toujours la même interface** (celle d'Apps1D76) dans tous les projets.
> Ce fichier décrit les règles. L'**implémentation de référence** est le projet Apps1D76
> (dépôt `Ploufty/TEST-POUR-UI`, branche `Clean`) : `style.css`, `script.js` et `index.html`.
> En cas de doute, **c'est le code de référence qui fait foi** : on le copie plutôt que de le réécrire.

---

## 0. Comment utiliser cette charte

| Situation | Que faire |
|---|---|
| **Nouveau projet avec Claude** | Déposer ce fichier à la racine du projet et écrire : « Applique la charte `CHARTE-UI.md` à toute l'interface. » |
| **Pour qu'elle s'applique à tous vos projets avec Claude Code** | Copier ce fichier dans `~/.claude/skills/charte-ui/SKILL.md`, où `~` est votre dossier personnel (sous Windows : `C:\Users\<vous>\.claude\skills\charte-ui\SKILL.md`). Claude le chargera de lui-même dès qu'il travaille sur une interface. |
| **Projet existant** | Ajouter dans son `CLAUDE.md` la ligne : « Interface : suivre `CHARTE-UI.md` (style Apps1D76). » |
| **Sans Claude** | Copier `style.css` de référence, garder les sections utiles et suivre les règles ci-dessous. |

**Prompt type :**
> Crée [la page / l'outil] en suivant strictement `CHARTE-UI.md` : palette `republique`, police Marianne,
> composants et animations de la charte, mode sombre, panneau Affichage et accessibilité AA.
> Pars du `style.css` de référence d'Apps1D76 plutôt que de réinventer les styles.

---

## 1. Principes

1. **Sobre et institutionnel** : fond clair et aéré, deux couleurs principales seulement, pas de surcharge.
2. **Simple à utiliser** : une action évidente par écran, de grandes zones cliquables, des libellés clairs en français.
3. **Un effet « waouh » qui reste lisible** : animations douces, jamais pendant la lecture, toujours désactivables.
4. **Accessible par défaut** : contraste AA, clavier, lecteur d'écran, réglages d'affichage.
5. **Léger et autonome** : HTML, CSS et JavaScript simples, **aucune bibliothèque ni framework**, fonctionne même hors ligne et en double-clic.

---

## 2. Couleurs

### 2.1 Palettes : deux couleurs par site

Chaque site choisit **une palette**, qui définit deux couleurs :
- **primaire** : titres, boutons, éléments actifs ;
- **accent** : mot mis en valeur, petits détails.

Le choix se fait par un attribut sur `<html>` : `<html lang="fr" data-palette="republique">`.

| Palette | Primaire clair | Accent clair | Primaire sombre | Accent sombre | Usage conseillé |
|---|---|---|---|---|---|
| `republique` *(défaut)* | `#000091` | `#e1000f` | `#8585f6` | `#ff6f68` | Sites institutionnels |
| `ocean` | `#0b5394` | `#00727a` | `#7fb3ff` | `#4fd1d9` | Outils de ressources |
| `foret` | `#1e5631` | `#a64500` | `#6fcf8f` | `#f59e52` | Sciences, nature |
| `aubergine` | `#5b2a86` | `#c2185b` | `#c4a1ff` | `#ff7aa8` | Arts, langues |
| `ardoise` | `#334155` | `#0f766e` | `#cbd5e1` | `#5eead4` | Outils de gestion, direction |

**Créer une palette :** 4 couleurs, avec un contraste d'au moins **4,5:1** sur `#ffffff` (couleurs claires) et sur `#1c1c2b` (couleurs sombres).
Le texte posé sur la couleur primaire est blanc en clair et `#11111b` en sombre ; il doit lui aussi atteindre 4,5:1.

### 2.2 Couleurs neutres (identiques pour toutes les palettes)

| Rôle | Variable | Clair | Sombre |
|---|---|---|---|
| Fond de page | `--bg` | `#ffffff` | `#11111b` |
| Surface (cartes, panneaux) | `--surface` | `#ffffff` | `#1c1c2b` |
| Surface translucide (menus collants) | `--surface-alpha` | `rgba(255,255,255,.92)` | `rgba(28,28,43,.92)` |
| Texte | `--text` | `#1e1e2f` | `#eeeef6` |
| Texte secondaire | `--muted` | `#555566` | `#b4b4c6` |
| Bordures | `--border` | `#e5e5ee` | `#33334a` |
| Texte sur couleur primaire | `--on-accent` | `#ffffff` | `#11111b` |
| Teinte douce primaire | `--primaire-doux` | primaire 11 % sur blanc | primaire 14 % transparent |
| Teinte douce accent | `--accent-doux` | accent 9 % sur blanc | accent 12 % transparent |

**Contraste renforcé** (`data-contrast="high"`) : `--muted` prend la valeur de `--text` ; bordures `#6a6a80` en clair, `#9a9ab0` en sombre ; fond noir en sombre ; bordures des cartes à 2 px.

### 2.3 Couleurs de catégories (pour classer des contenus)

Chaque catégorie a un accent `--cat` (contraste AA) et un fond `--cat-soft`.

| Nom | Clair `--cat` / `--cat-soft` | Sombre `--cat` |
|---|---|---|
| bleu | `#000091` / `#e3e3fd` | `#8585f6` |
| rouge | `#ce0500` / `#fee9e9` | `#ff6f68` |
| vert | `#18753c` / `#dffee6` | `#3fcf7a` |
| orange | `#a94700` / `#fff0e5` | `#ff914d` |
| violet | `#6e445a` / `#fee7fc` | `#e18bd9` |
| turquoise | `#006a6f` / `#e5fbfd` | `#3fc7c9` |

En sombre, `--cat-soft` est l'accent à 12-14 % d'opacité.

### 2.4 Règles
- **Jamais de couleur écrite en dur** dans les composants : uniquement `var(--primaire)`, `var(--accent)`, les neutres et `var(--cat)`.
- Pas plus de **deux couleurs vives** sur un même écran, en plus des couleurs de catégories.
- Pas de bandeau tricolore ni de dégradés décoratifs en pleine largeur.

---

## 3. Typographie

- **Police : Marianne** (police de l'État), graisses **400** et **700** uniquement, chargée depuis le paquet officiel du DSFR :
  `https://cdn.jsdelivr.net/npm/@gouvfr/dsfr@1.15.3/dist/fonts/Marianne-{Regular,Bold}.woff2`, avec `font-display: swap`.
  Polices de repli : `system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`.
- La police Marianne **ne doit pas être stockée** dans un dépôt public (licence réservée à l'administration).

| Élément | Taille | Graisse | Détails |
|---|---|---|---|
| Titre principal `h1` | `clamp(1.9rem, 5vw, 3.4rem)` | 700 | couleur primaire, `letter-spacing: -.03em`, `line-height: 1.1`, `text-wrap: balance` |
| Mot mis en valeur dans le `h1` | idem | 700 | couleur accent + trait souligné dessiné à la main (SVG) |
| Titre de section `h2` | `1.45rem` (`1.25rem` sous 600 px) | 700 | couleur de la catégorie, `line-height: 1.2` |
| Titre de carte `h3` | `1.08rem` | 700 | `line-height: 1.3` |
| Texte courant | `1rem` | 400 | `line-height: 1.5` |
| Accroche sous le titre | `1.08rem` | 400 | `--muted`, largeur maximale de `34rem` |
| Texte de carte, sous-titres | `.92rem` à `.93rem` | 400 | `--muted` |
| Boutons, menus, libellés | `.9rem` à `.95rem` | 700 | |
| Petits compteurs | `.75rem` | 700 | |

**Taille de base :** 100 %, puis 106,25 % à partir de 1600 px, 125 % à partir de 2200 px et 162,5 % à partir de 3200 px (TBI, écrans 4K). Elle est multipliée par le réglage de l'utilisateur : 100, 115 ou 130 %.
Toutes les tailles sont en **rem**, pour que les réglages s'appliquent partout.

---

## 4. Mise en page, formes et ombres

| Élément | Valeur |
|---|---|
| Conteneur | largeur maximale `72rem`, marges latérales `1.5rem` (`1rem` sous 600 px), compatibles avec les encoches des téléphones (`env(safe-area-inset-*)`) |
| Grille de cartes | `repeat(auto-fill, minmax(min(16rem, 100%), 1fr))`, espacement `1.25rem` |
| Rayon des cartes | `1rem` (`--radius`) |
| Rayon des boutons, champs, menus | `999px` (pilule) |
| Rayon des tuiles d'icône | `.75rem` (section), `.95rem` (carte) |
| Rayon des panneaux (dialog) | `1.25rem` |
| Ombre au repos | `0 2px 10px rgba(0,0,60,.06)` (sombre : `rgba(0,0,0,.35)`) |
| Ombre au survol | `0 22px 40px -12px` dans la couleur de la catégorie à 40 % |
| Zone tactile minimale | `2.75rem` (44 px) pour tout élément cliquable |
| Hauteur du menu collant | `4rem` (`3.25rem` pour un téléphone à l'horizontale) |

---

## 5. Composants

| Composant | Description |
|---|---|
| **En-tête** | À gauche, le nom du site en gras couleur primaire, avec sa fin en couleur accent (ex. `Apps1D` + `76`), et un sous-titre `--muted`. À droite, des **boutons-icônes ronds** : basculer clair/sombre (lune/soleil), puis « Affichage ». |
| **Bouton-icône** | Pilule `2.75rem`, fond `--surface`, bordure `1.5px --border`. Survol : bordure primaire et légère montée (`-2px`). Clic : `scale(.94)`. Icônes SVG au trait, `1.2rem`, trait de 2, extrémités arrondies. |
| **Bloc d'introduction (hero)** | Centré. Titre `h1` qui apparaît **mot par mot** ; mot accent souligné d'un **trait qui se dessine**. Accroche dessous, puis **champ de recherche** en pilule. |
| **Champ de recherche** | Pilule de largeur maximale `28rem`, loupe à gauche, bordure de `2px`, police de `1rem` (évite le zoom automatique sur iOS). Focus : bordure primaire et halo primaire à 15 %. |
| **Menu collant** | Barre `--surface-alpha` collée en haut, qui prend une ombre une fois collée. Pastilles en pilule : point de couleur, libellé (version courte sous 760 px) et compteur. L'élément actif est rempli de sa couleur. Défilement horizontal sur mobile, recentré sur l'élément actif. |
| **En-tête de section** | Tuile d'icône `2.75rem` remplie de la couleur, titre `h2` coloré et sous-titre, puis un **trait dégradé** qui se déroule jusqu'au bord. |
| **Carte** | Surface, bordure de 1 px, rayon `1rem`. Contenu : **tuile emoji** `3.4rem` sur fond doux, titre `h3`, description `--muted`, lien « Ouvrir → » coloré. Toute la carte est cliquable (`<a>`). |
| **Bouton plein** | Pilule, fond primaire, texte `--on-accent`, graisse 700, hauteur `2.75rem`. Survol : montée de `-2px`. |
| **Bouton discret** | Fond transparent, bordure `1.5px --border`, texte `--text`. |
| **Sélecteur segmenté** | Choix exclusifs (Clair / Sombre / Système) : rangée de boutons dans un cadre arrondi `.9rem`. L'option choisie est remplie de la couleur primaire. |
| **Interrupteur** | Rail de `2.75rem × 1.6rem` qui devient primaire quand il est activé, curseur blanc, mouvement à ressort. |
| **Panneau (dialog)** | `<dialog>` natif, largeur `28rem`, rayon `1.25rem`, fond assombri et flouté (3 px), apparition « pop » à ressort. Se ferme avec Échap, un clic sur le fond ou le bouton Fermer. |
| **Barre de progression** | 4 px fixée en haut de page, dégradé de la couleur primaire vers l'accent, qui suit le défilement. |
| **Message d'attente** | Texte `--muted` centré, précédé d'un point accent qui pulse (« D'autres outils arrivent bientôt »). |
| **Pied de page** | Centré, `.88rem`, `--muted`, filet supérieur. |

**Panneau « Affichage » (obligatoire dans chaque projet) :**
- Thème : clair, sombre ou système.
- Taille du texte : normale, grande (115 %) ou très grande (130 %).
- Animations : activées, réduites ou système.
- Contraste renforcé.
- Bouton « Réinitialiser ».
- Si l'application est installable, un bloc « Installer » (et la marche à suivre pour iPad).

---

## 6. Animations

**Courbes :**
- `--ease: cubic-bezier(.2,.8,.2,1)` : mouvements doux ;
- `--spring: cubic-bezier(.34,1.56,.64,1)` : petits rebonds sur les boutons, les icônes et les panneaux.

| Effet | Détail |
|---|---|
| Titre mot par mot | `.8s`, décalage de 90 ms par mot, chaque mot monte de `.6em` avec une rotation de 3° |
| Trait sous le mot accent | se dessine en `1s` après `1s` de délai |
| Apparition des sections au défilement | icône (rebond, `.7s`), titre (glissement, `.6s`), trait (`1.1s`) |
| Apparition des cartes | bascule 3D depuis le bas (`rotateX 14°`, `.8s`), décalage de 90 ms entre cartes |
| Survol d'une carte | montée de 8 px, inclinaison 3D **de 4° au maximum** selon la souris, halo qui suit le curseur, bordure dégradée qui tourne (3 s), icône qui pivote (-10°) et grossit (1,15), flèche qui avance de 5 px |
| Fond | grandes formes douces qui dérivent (26 s), réagissent à la souris (parallaxe) et au défilement |
| Constellation | points et liens dans les couleurs primaire et accent, qui s'écartent de la souris (dans le bloc d'introduction uniquement) |
| Bloc d'introduction au défilement | s'estompe (jusqu'à -70 %) et descend légèrement |

**Règles de mouvement :**
- N'animer que `transform` et `opacity` (fluide, sans recalcul de mise en page) ; les gestionnaires de souris et de défilement passent par `requestAnimationFrame`.
- Le JavaScript ne déplace rien lui-même : il met à jour des **variables CSS** (`--p`, `--s`, `--h`, `--px`, `--py`, `--mx`, `--my`, `--rx`, `--ry`).
- Effets de survol réservés aux appareils à souris (`(hover: hover) and (pointer: fine)`) ; le `<canvas>` se met en pause hors écran et quand l'onglet est caché.
- Tout s'arrête avec `[data-motion="reduce"]`, appliqué selon la préférence système ou le réglage du panneau. Le contenu reste alors visible immédiatement.
- Aucun texte ne doit bouger pendant qu'on le lit. Pas d'animation en boucle, sauf les décors discrets (fond, point qui pulse).

---

## 7. Thèmes et préférences

- Attributs sur `<html>` : `data-palette`, `data-theme` (`light` ou `dark`), `data-motion` (`full` ou `reduce`), `data-contrast` (`normal` ou `high`), ainsi que la variable `--text-scale`.
- Un **petit script dans le `<head>`** applique les préférences enregistrées **avant le premier affichage**, pour éviter un flash de la mauvaise couleur.
  - Stockage : clé `localStorage` propre au projet, au format `{ theme, text, motion, contrast }`.
  - Les valeurs relues sont **validées** : seules les valeurs connues sont acceptées.
- Par défaut, l'interface **suit le système** (sombre et animations réduites).
- La balise `theme-color` (barre du navigateur sur mobile) prend la couleur primaire en clair et `--bg` en sombre.

---

## 8. Adaptation aux écrans

| Largeur | Adaptation |
|---|---|
| ≤ 360 px | logo masqué, nom du site réduit |
| ≤ 600 px | marges de 1rem, libellés des boutons-icônes masqués visuellement (mais lus par les lecteurs d'écran), formes du fond réduites |
| ≤ 760 px | libellés courts dans le menu, menu défilable horizontalement |
| Téléphone à l'horizontale (hauteur ≤ 500 px) | bloc d'introduction compacté, menu plus bas |
| ≥ 1600 / 2200 / 3200 px | police agrandie (TBI, écrans 4K) |
| Impression | décors, menu et boutons masqués ; cartes non coupées entre deux pages |

À vérifier : 280 px (téléphone pliable), 320, 390, 768, 1280, 1920 et 3840 px. **Jamais de défilement horizontal.**

---

## 9. Accessibilité (non négociable)

- [ ] Contraste AA (4,5:1) pour tous les textes, en clair, en sombre et en contraste renforcé.
- [ ] Lien d'évitement « Aller au contenu » en premier élément focusable.
- [ ] Focus visible : contour de `3px` couleur primaire, décalé de `3px`.
- [ ] Zones cliquables d'au moins 44 px.
- [ ] `aria-label` sur chaque bouton-icône ; `aria-hidden="true"` sur les décors (fond, canvas, emojis décoratifs).
- [ ] `aria-current` sur l'élément actif du menu ; `role="status"` sur les messages qui changent.
- [ ] Champs avec un `<label>` (visuellement masqué si besoin, avec `.sr-only`).
- [ ] Respect de `prefers-reduced-motion` et de `prefers-color-scheme`.
- [ ] Tout fonctionne au clavier : Tab, Entrée et Échap pour fermer un panneau.
- [ ] Page utilisable sans JavaScript, ou avec un message `<noscript>` clair.

---

## 10. Technique et sécurité

- Fichiers : `index.html`, `style.css` (sections numérotées) et `script.js` (une seule fonction autonome, en blocs commentés). Le texte de l'interface et les commentaires sont en français.
- **Aucune bibliothèque, aucune compilation obligatoire** : ouvrir `index.html` doit suffire.
- **Politique de sécurité (CSP)** dans une balise `<meta>` : `script-src 'self'` plus l'empreinte des scripts intégrés ; polices limitées à `'self'` et `cdn.jsdelivr.net`.
- Aucun `onclick=` ni autre gestionnaire d'événement dans le HTML. Tout texte injecté est **échappé**.
- Application installable (`manifest.webmanifest` et icônes 192/512/maskable) et hors ligne (service worker : réseau d'abord pour les pages, cache pour le reste).

---

## 11. Squelette de départ

Le **socle CSS des couleurs** est à copier tel quel, puis on reprend les sections 4 à 11 du `style.css` de référence :

```css
:root, [data-palette="republique"] { --primaire: #000091; --accent: #e1000f; }
[data-theme="dark"], [data-palette="republique"][data-theme="dark"] { --primaire: #8585f6; --accent: #ff6f68; }
/* … autres palettes : voir § 2.1 … */
:root {
  --bg: #ffffff; --surface: #ffffff; --surface-alpha: rgba(255, 255, 255, .92);
  --text: #1e1e2f; --muted: #555566; --border: #e5e5ee;
  --primaire-doux: color-mix(in srgb, var(--primaire) 11%, #fff);
  --accent-doux: color-mix(in srgb, var(--accent) 9%, #fff);
  --on-accent: #ffffff;
  --shadow: 0 2px 10px rgba(0, 0, 60, .06); --shadow-hover: 0 22px 40px -12px rgba(0, 0, 60, .25);
  --radius: 1rem; --nav-h: 4rem;
  --font: Marianne, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  --ease: cubic-bezier(.2, .8, .2, 1); --spring: cubic-bezier(.34, 1.56, .64, 1);
  color-scheme: light;
}
[data-theme="dark"] {
  --bg: #11111b; --surface: #1c1c2b; --surface-alpha: rgba(28, 28, 43, .92);
  --text: #eeeef6; --muted: #b4b4c6; --border: #33334a;
  --primaire-doux: color-mix(in srgb, var(--primaire) 14%, transparent);
  --accent-doux: color-mix(in srgb, var(--accent) 12%, transparent);
  --on-accent: #11111b; --shadow: 0 2px 10px rgba(0, 0, 0, .35); --shadow-hover: 0 22px 40px -12px rgba(0, 0, 0, .6);
  color-scheme: dark;
}
[data-contrast="high"] { --muted: var(--text); --border: #6a6a80; }
[data-theme="dark"][data-contrast="high"] { --border: #9a9ab0; --bg: #000; --surface: #0b0b12; }
```

Structure HTML attendue :

```html
<html lang="fr" data-palette="republique" data-theme="light">
<head>  <!-- meta CSP, theme-color, manifest, police Marianne (préchargement), style.css, script de préférences -->  </head>
<body>
  <a class="skip" href="#main">Aller au contenu</a>
  <div class="progress" aria-hidden="true"></div>
  <div class="bg" aria-hidden="true">…formes du fond…</div>
  <header>
    <div class="brandbar container"> nom du site + boutons thème et Affichage </div>
    <section class="hero"> canvas, h1 animé, accroche, recherche </section>
  </header>
  <nav class="catnav">…</nav>          <!-- si le contenu est classé -->
  <main class="main container" id="main">…</main>
  <footer class="footer">…</footer>
  <dialog id="settings">…panneau Affichage…</dialog>
  <script src="script.js"></script>
</body>
</html>
```

---

## 12. Contrôle final : « est-ce bien notre interface ? »

- [ ] Palette choisie avec `data-palette`, aucune couleur écrite en dur.
- [ ] Marianne 400/700 ; titre principal mot par mot avec un mot accent souligné.
- [ ] Cartes avec tuile emoji, survol 3D léger, bordure tournante et flèche « Ouvrir → ».
- [ ] Boutons en pilule ; bouton thème et panneau « Affichage » en haut à droite.
- [ ] Fond clair et aéré avec les formes douces ; en sombre, fond `#11111b` et surfaces `#1c1c2b`.
- [ ] Animations coupées en mode « réduites », contenu toujours lisible.
- [ ] Contrôles de l'accessibilité (§ 9) et des écrans (§ 8) passés.
