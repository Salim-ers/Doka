# Manifeste des médias — Doka

Source de vérité technique : `src/data/media.ts` (ce document en est la version lisible).

**Règle de placement** : une photo = un emplacement éditorial. Seule exception justifiée : les **photos produit**, affichées en miniature dans le catalogue `/produits` (et les listes qui renvoient vers une fiche) puis en vue détaillée sur la fiche du produit concerné. Une photo n'illustre jamais un autre produit que le sien.

**Traitement** : aucun changement de contenu (produits, logos, inscriptions, façade intacts), aucun agrandissement. Les originaux restent dans `media/originals/` (non déployés). `npm run images` produit un maître WebP qualité 90 et une version AVIF aux dimensions natives, avec une accentuation légère ; `next/image` sert ensuite AVIF/WebP à la bonne taille. Les visuels de campagne (texte et logo intégrés) ne sont jamais recadrés : ils sont affichés entiers sur un fond de même teinte.

**Qualité des sources** : 9 visuels en 1672 × 941 px (16:9), nets. Pas de version 4K fournie : le livrable 3840 × 2160 demande des originaux HD.

| Fichier | Sujet | Emplacement(s) | Texte alternatif | Usage autorisé | Remarque |
| --- | --- | --- | --- | --- | --- |
| `doka-cookies-presentoir` | Cookies sur le présentoir à pois rouges | Accueil — Le coin gourmand · `/produits` (miniature) · `/produits/cookies` | Cookies Doka sur le présentoir à pois rouges, une main en saisit un avec une pince | Produit : cookies | Parfums et prix non communiqués |
| `doka-gobelet-rue` | Gobelet passé d'une main à l'autre, rue parisienne | `/le-coffee-shop` — « Un café, ça se passe de main en main » | Un gobelet Doka tendu d'une main à une autre dans une rue de Paris | Ambiance, à emporter | Logo et enseigne bleu marine sur ce visuel : à valider |
| `doka-matcha-glace` | Visuel officiel « doka matcha — your favorite drink » | Accueil — Section matcha · `/produits` (miniature) · `/produits/matcha-latte` | Matcha latte glacé Doka dans un gobelet transparent, logo doka en noir | Produit : Matcha Latte uniquement | Visuel de campagne : jamais recadré |
| `doka-identite-logo` | Logo crème sur orange + signature | `/esprit-doka` — Identité | Logo doka crème sur fond orange avec la signature made for every day | Identité | Source du tracé vectoriel du logo |
| `doka-facade-rue-rambuteau` | Façade complète, devanture rouge | Accueil — L'adresse | La devanture rouge de Doka rue Rambuteau, avec son enseigne crème et son guichet | Lieu ; référence de la scène 3D | Prix du panneau de façade ≠ carte officielle ; n° 11 sur la porte voisine |
| `doka-carte-officielle` | La carte officielle | `/esprit-doka` — « Une carte qui tient sur un tableau » | La carte officielle de Doka avec les prix… | Source de `products.ts` | Visuel de campagne : jamais recadré |
| `doka-extraction-espresso` | Extraction d'espresso dans un gobelet Doka | Accueil — Coffee moment · `/produits` (miniature) · `/produits/espresso` | Un espresso coule de la machine dans un gobelet doka | Produit : Espresso | — |
| `doka-gobelet-devanture-soir` | Gobelet devant la devanture éclairée, le soir | `/le-coffee-shop` — Ouverture | Un gobelet doka tenu à la main devant la devanture rouge du coffee shop, le soir | Lieu | Tableau de prix en vitrine ≠ carte officielle |
| `doka-latte-glace` | Latte glacé, marbrures café/lait | Accueil — Les incontournables · `/produits` (miniature) · `/produits/latte` | Latte glacé Doka, marbrures de café et de lait dans un gobelet transparent | Produit : Latte (version glacée) | Visuel de campagne : jamais recadré |

## Visuels générés pour le site (illustrations, non photographiques)

| Fichier | Origine | Emplacement |
| --- | --- | --- |
| `hero-scene.webp`, `hero-scene-mobile.webp` | Rendu de la scène 3D du site (`npm run poster`) | Poster du hero (avant chargement, mouvement réduit) |
| `hero-zoom-mobile.webp` | Rendu de la scène 3D, gros plan sur le gobelet (`npm run video`) | Fin du zoom au scroll, hero mobile |
| `public/videos/hero-takeaway.{webm,mp4}` | Rendu image par image de la scène 3D (`npm run video`) | Hero mobile |
| Cartes « boisson vue de dessus » | SVG générés depuis le catalogue (`ProductArt`) | Produits sans photo authentique |
| Logo | Vectorisation fidèle du visuel officiel | Partout (header, footer, intro, transitions, scène 3D, favicon) |
