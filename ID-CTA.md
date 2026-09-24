# CTA du livre ouvert

## ID HTML des CTA existants

Renseigner ces valeurs dans le champ **ID CSS / ID HTML** de chaque bouton, sans `#`.
Un ID doit être unique dans la page. Le script accepte également l’ID sur le
conteneur du bouton (notamment Elementor). Pour un bouton de type lien, mettre `#`
dans le champ URL : le script prend en charge le clic.

| CTA | ID HTML | Image |
| --- | --- | --- |
| Avant de commencer | `cta-avant-propos` | 1.png |
| Sommaire | `cta-sommaire` | 2.png |
| Introduction | `cta-introduction` | 3.png |
| Chapitre 1 — Dissiper les doutes | `cta-chapitre-1` | 4.png |
| Chapitre 2 — Le Finance Engineer | `cta-chapitre-2` | 5.png |
| Chapitre 3 — La gouvernance | `cta-chapitre-3` | 6.png |
| Chapitre 4 — La carte des gains | `cta-chapitre-4` | 7.png |
| Chapitre 5 — Identifier et prioriser | `cta-chapitre-5` | 8.png |
| Paroles d’experts | `cta-paroles-experts` | 9.png |
| Chapitre 6 — Choisir l’agent | `cta-chapitre-6` | 10.png |
| Chapitre 7 — Packs d’agents | `cta-chapitre-7` | 11.png |
| Bonus — Facturation électronique | `cta-bonus` | 12.png |
| Chapitre 8 — Le cadrage | `cta-chapitre-8` | 14.png |
| Chapitre 9 — Mesurer l’impact | `cta-chapitre-9` | 13.png |

Exemple :

```html
<a id="cta-chapitre-3" href="#">La gouvernance</a>
```

Le script n’ajoute aucun CTA et ne modifie pas leur style. Il intercepte les clics,
met à jour le contenu du livre sans recharger le modèle et conserve son orientation.
Il marque le CTA actif avec `aria-current="page"`.

Les raccourcis `chapitre-8` et `chapitre-9` pointent respectivement sur **14.png**
et **13.png**, conformément aux titres imprimés.


Les ID `cta-double-page-01` à `cta-double-page-14` sélectionnent directement les images.
Pour plusieurs CTA vers un même chapitre, utiliser `data-phacet-page="chapitre-3"`
avec des ID HTML distincts. Les ID de chapitre restent inchangés.
