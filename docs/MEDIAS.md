# Manifeste des médias — Doka

Source de vérité technique : `src/data/media.ts` (ce document en est la version lisible).

**Règle de placement** : une photo = un emplacement éditorial. Seule exception justifiée : les **photos produit**, affichées en vignette sur la carte `/la-carte` (et les listes qui renvoient vers une fiche) puis en vue détaillée sur la fiche du produit concerné. Une photo n'illustre jamais un autre produit que le sien.

**Traitement** : aucun changement de contenu (produits, logos, inscriptions, façade intacts), aucun agrandissement. Les originaux restent dans `media/originals/` (non déployés). `npm run images` produit un maître WebP qualité 90 et une version AVIF aux dimensions natives, avec une accentuation légère ; `next/image` sert ensuite AVIF/WebP à la bonne taille. Les visuels de campagne (texte et logo intégrés) ne sont jamais recadrés : ils sont affichés entiers sur un fond de même teinte.

**Qualité des sources** : 9 visuels en 1672 × 941 px (16:9), nets. Pas de version 4K fournie : le livrable 3840 × 2160 demande des originaux HD.

| Fichier | Sujet | Emplacement(s) | Texte alternatif | Usage autorisé | Remarque |
| --- | --- | --- | --- | --- | --- |
| `doka-cookies-presentoir` | Cookies sur le présentoir à pois rouges | Accueil — Le coin gourmand · `/la-carte` (vignette) · `/produits/cookies` | Cookies Doka sur le présentoir à pois rouges, une main en saisit un avec une pince | Produit : cookies | Parfums et prix non communiqués |
| `doka-gobelet-rue` | Gobelet passé d'une main à l'autre, rue parisienne | `/esprit-doka` — Le lieu : « Un café, ça se passe de main en main » | Un gobelet Doka tendu d'une main à une autre dans une rue de Paris | Ambiance, à emporter | Logo et enseigne bleu marine sur ce visuel : à valider |
| `doka-matcha-glace` | Visuel officiel « doka matcha — your favorite drink » | Accueil — Section matcha · `/la-carte` (vignette) · `/produits/matcha-latte` | Matcha latte glacé Doka dans un gobelet transparent, logo doka en noir | Produit : Matcha latte uniquement | Affiché en **gros plan** (`doka-matcha-glace-gros-plan`) : sans son titre anglais « your favorite drink » ni le logo, coupé au bord bas dans l'original |
| `doka-identite-logo` | Logo crème sur orange + signature | `/esprit-doka` — Identité | Logo doka crème sur fond orange avec la signature made for every day | Identité | Source du tracé vectoriel du logo |
| `doka-facade-rue-rambuteau` | Façade complète, devanture rouge | Accueil — L'adresse | La devanture rouge de Doka rue Rambuteau, avec son enseigne crème et son guichet | Lieu ; référence de la scène 3D | Prix du panneau de façade ≠ carte officielle ; n° 11 sur la porte voisine |
| `doka-carte-officielle` | La carte officielle | `/esprit-doka` — « Une carte qui tient sur un tableau » | La carte officielle de Doka avec les prix… | Source de `products.ts` | Visuel de campagne : jamais recadré |
| `doka-extraction-espresso` | Extraction d'espresso dans un gobelet Doka | Accueil — L'heure du café · `/la-carte` (vignette) · `/produits/espresso` | Un espresso coule de la machine dans un gobelet doka | Produit : Espresso | — |
| `doka-gobelet-devanture-soir` | Gobelet devant la devanture éclairée, le soir | `/esprit-doka` — Le lieu (la devanture s'agrandit) | Un gobelet doka tenu à la main devant la devanture rouge du coffee shop, le soir | Lieu | Tableau de prix en vitrine ≠ carte officielle |
| `doka-latte-glace` | Latte glacé, marbrures café/lait | Accueil — Les incontournables · `/la-carte` (vignette) · `/produits/latte` | Latte glacé Doka, marbrures de café et de lait dans un gobelet transparent | Produit : Latte (version glacée) | Visuel de campagne : jamais recadré |

## Visuels générés pour le site (illustrations, non photographiques)

| Fichier | Origine | Emplacement |
| --- | --- | --- |
| `hero-scene.webp`, `hero-scene-mobile.webp` | Rendu de la scène 3D du site (`npm run poster`) | Poster du hero (avant chargement, mouvement réduit) |
| `hero-zoom-mobile.webp` | Rendu de la scène 3D, gros plan sur le gobelet (`npm run video`) | Fin du zoom au scroll, hero mobile |
| `public/videos/hero-takeaway.{webm,mp4}` | Rendu image par image de la scène 3D (`npm run video`) | Hero mobile |
| Cartes « boisson vue de dessus » | SVG générés depuis le catalogue (`ProductArt`) | Repli pour un produit sans aucune photo |
| Logo | Vectorisation fidèle du visuel officiel | Partout (header, footer, intro, transitions, scène 3D, favicon) |

## Photos d'illustration libres de droits (produits sans visuel Doka)

Licence **CC0 1.0** uniquement (domaine public : usage commercial libre, sans attribution obligatoire ; les auteurs sont tout de même crédités dans les mentions légales). Aucune marque ni texte lisible sur les photos. Originaux réduits à 2400 px dans `media/originals/stock/` (sources pleine résolution aux adresses ci-dessous), versions web dans `public/images/doka/produits/` (`npm run images`). À remplacer par de vraies photos Doka dès que possible.

| Produit | Fichier | Auteur | Source | Remarque |
| --- | --- | --- | --- | --- |
| Allongé | `produits/allonge.webp` | Nilo Velez | [WordPress Photos](https://wordpress.org/photos/photo/16065c3b54/) | — |
| Double | `produits/double.webp` | Edan Cohen | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Glass_cup_of_beverage_(Unsplash).jpg) | Servi dans un petit verre |
| Americano | `produits/americano.webp` | Yam B Chhetri | [WordPress Photos](https://wordpress.org/photos/photo/50169d3322/) | Proche visuellement de l'allongé |
| Cappuccino | `produits/cappuccino.webp` | Drew Coffman | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Latte_art_on_cappuccino_(Unsplash).jpg) | Source déjà compressée : ne pas agrandir |
| Flat white | `produits/flat-white.webp` | Drew Coffman | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Two_Hands_Cafe_latte_art_(Unsplash).jpg) | — |
| Nuage coco-matcha | `produits/nuage-coco-matcha.webp` | Saya1611 | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Iced_green_tea_latte.jpg) | Compromis : matcha au lait glacé, sans coco visible |
| Chaï latte | `produits/chai-latte.webp` | Andy Li | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Chai_Latte_-_The_Flour_Pot_Bakery_2026-05-20.jpg) | — |
| Chocolat chaud | `produits/chocolat-chaud.webp` | Benoît Prieur | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Chocolat_chaud_au_Caf%C3%A9_Lumi%C3%A8re_(Lyon)_en_d%C3%A9cembre_2023.JPG) | — |
| Thé noir ou vert | `produits/the.webp` | freestocks.org | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Tea_on_the_countertop_(34419804081).jpg) | — |

## Recadrages

| Fichier | Depuis | Pourquoi |
| --- | --- | --- |
| `doka-matcha-glace-gros-plan` | `doka-matcha-glace.png` (zone 1072 × 452 à partir de x 300, y 222) | Gros plan sur le gobelet, sans le titre anglais « your favorite drink » ni le logo coupé : le site est entièrement en français |

## Visuels remplacés par des versions françaises

| Ancien visuel | Remplacé par | Pourquoi |
| --- | --- | --- |
| `doka-identite-logo` (logo et signatures « made for every day… ») | `IdentityCard` sur `/esprit-doka` (logo vectoriel officiel, signatures en français) et `doka-og.jpg` pour les partages (`npm run og`) | Textes anglais incrustés |
| `doka-carte-officielle` (photo du tableau : « classics », « specials », « free options »…) | `BoardCard` sur `/esprit-doka` : le tableau recomposé en français depuis `products.ts`, donc toujours à jour | Rubriques en anglais |

Les fichiers d'origine restent dans le dépôt (`identite` sert encore de logo dans les données structurées).
