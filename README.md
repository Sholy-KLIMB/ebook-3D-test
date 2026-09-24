# Livres 3D Phacet

Ce dossier contient les fichiers prêts à publier sur GitHub Pages.

## Déposer les fichiers

Déposer **le contenu de ce dossier à la racine du dépôt** `Sholy-KLIMB/phacet-livre-3d`,
et non le dossier `A-METTRE-SUR-GITHUB` lui-même. Remplacer les fichiers existants
portant le même nom. Conserver les sous-dossiers `ouvert/` et `documentation/`.
Ne pas ajouter les archives ZIP, tests, scripts de génération ni sauvegardes du
répertoire de travail situé au-dessus de ce dossier.

Le fichier vide `.nojekyll` doit être conservé ; il peut être masqué dans le Finder.

## Contenu

- `index.html`, `livre.glb` : livre fermé aminci.
- `model-viewer.min.js` : lecteur partagé par les deux livres.
- `ouvert/` : livre ouvert, scripts et les 14 doubles pages originales.
- `documentation/` : codes d’embed WordPress et correspondance des ID des CTA.
- `.nojekyll`, `.gitignore` : configuration minimale du dépôt.

Les deux lecteurs affichent uniquement le modèle 3D sur fond transparent.
Aucun menu ni bouton de chapitre n’est créé dans l’embed.

## Adresses prévues après publication

- Livre fermé : https://sholy-klimb.github.io/phacet-livre-3d/
- Livre ouvert : https://sholy-klimb.github.io/phacet-livre-3d/ouvert/#chapitre-1

Les chemins existants sont conservés. Ce dossier a été préparé localement ;
aucun envoi sur GitHub ni changement de WordPress n’a été effectué.

## WordPress

Copier le contenu de `documentation/embed-livre-ouvert.html` dans un bloc HTML
personnalisé pour le livre ouvert. Le script doit être autorisé par WordPress.
Utiliser les ID HTML `cta-chapitre-1` à `cta-chapitre-9` sur les CTA existants,
sans `#` dans le champ ID. La liste complète et les exemples figurent dans
`documentation/INTEGRATION.md`.

Le livre ouvert démarre sur le chapitre 1. Les CTA changent sa double page sans
recharger le modèle et conservent l’orientation choisie par le visiteur.

Pour le livre fermé, utiliser `documentation/embed-livre-ferme.html`.

## Licence du lecteur

Google model-viewer 4.1.0, Apache-2.0. Les mentions du lecteur tiers sont conservées
dans `model-viewer.min.js`.
