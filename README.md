# Doka Coffee Shop — site web

Site vitrine de **Doka**, coffee shop de spécialité 100 % à emporter, 15 rue Rambuteau, Paris 4e.
_Fait pour tous les jours._

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS 4 + CSS sur mesure · GSAP (ScrollTrigger, SplitText, Flip) · Three.js (scène du hero, chargée à la demande) · Playwright.

---

## Démarrer

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # build de production
npm start            # sert le build
```

Node 20.9+ (développé et testé avec Node 22).

| Script                  | Rôle                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| `npm run lint`          | ESLint (règles Next, React Hooks, accessibilité)                                         |
| `npm run typecheck`     | TypeScript strict                                                                        |
| `npm run format`        | Prettier                                                                                 |
| `npm run images`        | Regénère les images web (`public/images/doka`) depuis `media/originals`                  |
| `npm run poster`        | Regénère les posters du hero depuis la vraie scène 3D (serveur de dev lancé)             |
| `npm run og`            | Regénère l'image de partage en français (`public/images/doka/doka-og.jpg`)                |
| `npm run video`         | Regénère la vidéo mobile du hero depuis la vraie scène 3D (serveur de dev lancé, ffmpeg) |
| `npm run test:e2e`      | Tests de parcours Playwright (build requis)                                              |

## Déployer sur Vercel

1. Importer le dépôt dans Vercel (framework détecté automatiquement, aucune configuration particulière).
2. Définir la variable `NEXT_PUBLIC_SITE_URL` avec le domaine final (ex. `https://dokacoffeeshop.fr`) : elle sert aux URL canoniques, au sitemap, à l'Open Graph et aux données structurées.
3. Déployer. Toutes les pages sont pré-rendues en statique ; les images passent par l'optimiseur Vercel (AVIF/WebP).

La route `/lab/scene` (banc d'essai de la scène 3D, utilisé par `npm run poster` et `npm run video`) renvoie une 404 en production, sauf avec `ENABLE_LAB=1`.

---

## Modifier le contenu

Tout le contenu factuel est centralisé ; la mise en page ne contient aucun prix ni horaire en dur.

| Quoi                                    | Où                                    |
| --------------------------------------- | ------------------------------------- |
| Produits, prix, descriptions, options   | `src/data/products.ts`                |
| Rubriques et filtres de la carte        | `src/data/categories.ts`              |
| Adresse, horaires, accès, Instagram, mentions légales | `src/data/site-config.ts` |
| Photos et textes alternatifs (manifeste des médias) | `src/data/media.ts` — détail dans `docs/MEDIAS.md` |

- Un prix inconnu s'écrit `price: null` : le site affiche « Prix au comptoir », jamais un tarif inventé.
- Chaque produit a une photo : un visuel officiel Doka quand il existe, sinon une photo d'illustration libre de droits (CC0 / domaine public, crédits dans `docs/MEDIAS.md`). Sans photo, une carte graphique (la boisson vue de dessus) prend le relais. Une photo n'est jamais réutilisée pour un autre produit.
- Pour masquer les horaires partout : `hours.show = false` dans `site-config.ts`.
- Les fiches produits (`/produits/[slug]`) sont générées depuis le catalogue : ajouter un produit crée sa page, son entrée de sitemap et ses données structurées. Une fiche renommée garde son ancienne adresse via `renamedSlugs` (redirection permanente).
- Tout le texte du site est en français ; seuls le nom « Doka Coffee Shop », le compte Instagram et les noms de boissons sans équivalent (espresso, latte, flat white…) restent tels quels.

## Architecture

```text
src/
  app/                    routes (accueil, la-carte, nos-favoris, produits/[slug], esprit-doka,
                          nous-trouver, mentions-legales, confidentialite),
                          sitemap.ts, robots.ts, not-found.tsx, icon.svg
                          (/produits → /la-carte et /le-coffee-shop → /esprit-doka : redirections)
  components/
    brand/                logo officiel vectorisé (lettres séparées, jamais déformées)
    layout/               Header, FullscreenMenu, SiteLoader, PageTransition, Footer, BackToTop, MobileDock
    home/                 sections de l'accueil ; hero/ = expérience « Ton café. À emporter. »
      hero/scene/         scène Three.js : maquette, personnages, textures, timing
    menu/                 MenuBoard (carte filtrable, photo par produit), MenuCategoryTabs
    products/             ProductCard, ProductVisual, ProductDetail
    favorites/            sélection éditoriale, favoris du visiteur
    esprit/               EspritStory, IdentityCard (identité en français), BoardCard (le tableau de la carte)
    gallery/              ImageGallery (le lieu, dans L'esprit Doka), Lightbox
    location/             LocationCard (avec la carte Google Maps), OpenStatus, Faq
    motion/               AnimatedHeading, RevealImage, CoffeeFlow
    ui/                   DokaButton, DLink, FavoriteButton, AnimatedPrice, DokaMarquee
  data/                   catalogue, catégories, configuration, manifeste des médias
  hooks/                  use-favorites (localStorage), use-hydrated
  lib/                    gsap (plugins, courbes Doka), seo (métadonnées, JSON-LD),
                          entrance (synchronise les animations d'entrée avec chargement et transitions)
  styles/                 tokens.css, base.css, ui.css, layout.css, home.css, pages.css
media/originals/          photos sources (non déployées)
public/images/doka/       versions web (WebP maître + AVIF), posters du hero
public/videos/            vidéo du hero mobile (WebM VP9 + MP4 H.264) et repères
scripts/                  optimisation des images, rendu des posters et de la vidéo
tests/e2e/                parcours Playwright
```

## Direction artistique

- **Couleurs** échantillonnées sur les visuels : orange `#F14323` (logo), crème `#FFFBEA`, noir `#171714`, rouge façade `#DE1F11` (scène 3D), vert matcha `#5D8A17` / `#23380A`, espresso `#3A1D0C`. Un orange plus profond (`#C02A0F`) sert aux petits textes sur crème pour le contraste.
- **Typographie** : titres en Bricolage Grotesque (axe optique à 96, très serrée, en minuscules comme les rubriques du tableau Doka « classics », « specials ») ; texte en Instrument Sans. Polices auto-hébergées.
- **Formes** : les pastilles reprennent les « points » des lettres du logo (indicateurs, favoris, tampons de prix), les pois rouges du présentoir, le quadrillage du panneau de la devanture.
- **Logo** : vectorisé depuis le visuel officiel (`src/components/brand/logo-paths.ts`), affiché tel quel ; les animations déplacent les lettres sans jamais modifier leur dessin.

## Motion design

Un langage commun (courbes `doka.out`, `doka.inOut`, `doka.pop` dans `src/lib/gsap.ts`), une animation propre à chaque contenu :

| Signature | Où | Ce qui se passe |
| --- | --- | --- |
| **Le moment Doka** — « Ton café. À emporter. » | Hero de l'accueil | Maquette 3D de la devanture : un client arrive, le barista se retourne, attrape un gobelet Doka, le tend ; le client repart. Un vrai dialogue en bulles accompagne la scène (« Salut ! Comme d'habitude ? », « Oui, un latte glacé ! », « Et voilà, bien frais ! »…) : texte et minutage dans `hero/dialogue.ts`, bulles ancrées au-dessus des têtes (positions fournies par la scène 3D, ou enregistrées dans `hero-takeaway.json` pour la vidéo mobile). Pastilles orange (prix de l'espresso, note Google, chaud ou glacé, lait d'avoine offert) et gobelet doka illustré (`DokaCup`, vapeur animée) qui flottent. Caméra qui suit la souris ; au scroll, plongée vers le gobelet puis nappe orange qui s'ouvre depuis lui. |
| **Le café du quotidien** | Accueil, section 2 | Section collante : « le bon café, / tous les jours, / dès 1,50 € », le prix quitte la phrase et grossit en comptant, puis l'échelle des prix se dessine et le fond passe de l'orange au crème. |
| **La vague de café** | Entre les grandes sections (accueil, esprit) | Transition SVG organique : le liquide de la section suivante monte en vagues, précédé d'un filet de lait ou de crema. |

Autres moments :

- **Écran de chargement** (`SiteLoader`, 100 % CSS, ≈ 2 s à chaque chargement complet) : nappe orange, lettres du logo posées une à une, signature, jauge et compteur jusqu'à 100 %, puis la nappe se lève en s'arrondissant.
- **Transition de page** (`PageTransition`, ≈ 1,3 s) : la nappe orange monte du bas (bord arrondi), les lettres du logo se posent avec le nom de la page d'arrivée, puis la nappe repart par le haut. Animée uniquement en `transform` / `opacity` avec l'API Web Animations, donc calculée par le compositeur : elle reste fluide pendant que la nouvelle page se construit (rendu et recalcul des animations au scroll se font sous la nappe). La page n'est jamais révélée avant d'être prête ; le dernier clic gagne en cas de clics rapides. Les titres de la nouvelle page attendent l'ouverture (`lib/entrance.ts`), la scène 3D aussi.
- **Barre d'accès rapide** (`MobileDock`, sous 1240 px, là où l'en-tête n'a que le bouton Menu) : « La carte » et « Itinéraire » fixés en bas de l'écran ; le hero, le pied de page et le bouton retour en haut lui laissent la place (`--dock-space`).
- Menu mobile qui gonfle depuis le bouton, titres révélés par masques (SplitText), photos révélées selon leur sujet (le café « coule » de haut en bas, le matcha s'ouvre depuis le point du « o »), frise horizontale des incontournables, carte filtrée en cascade (la liste reste dans le flux, la carte revient en haut de l'écran), cœurs qui éclatent en pastilles, cartes produits en profondeur, footer dont les lettres du logo se posent une à une.

**Mouvement réduit** (`prefers-reduced-motion`) : pas d'écran de chargement, pas de 3D (poster), sections narratives affichées en clair, navigation sans nappe. **Sans JavaScript**, tout le contenu reste lisible (les états « avant animation » n'existent que si JS tourne, avec un filet de sécurité CSS).

## La scène 3D du hero

- **Grand écran, pointeur fin, WebGL** : Three.js temps réel (`src/components/home/hero/scene`), chargé après le chargement de la page et un temps calme. Rendu suspendu hors écran et onglet masqué ; régulateur qui baisse la résolution puis la cadence si l'appareil peine.
- **Mobile, tactile, appareil modeste ou sans WebGL** : la même scène pré-rendue en vidéo (WebM 150 Ko / MP4 105 Ko, 12 s en boucle, sans Three.js) ; le slogan est synchronisé sur le temps de la vidéo ; au scroll, la vue avance vers le gobelet puis se fond dans un gros plan pré-rendu.
- **Mouvement réduit** : poster fixe (rendu de la même scène au passage du gobelet).
- La scène est une **illustration** de la devanture et du service à emporter, pas une photographie ; c'est indiqué dans le texte alternatif et les mentions légales.

## Qualité

- **SEO** : métadonnées par page, URL canoniques, Open Graph, `sitemap.xml`, `robots.txt`, données structurées `CafeOrCoffeeShop` (adresse, horaires, carte) et `MenuItem` par produit. La note Google n'apparaît que dans une pastille du hero (`siteConfig.googleRating`), jamais dans les données structurées (Google ignore les avis auto-déclarés).
- **Formats d'écran** : vérifiés sur 12 formats (téléphones 360 à 430 px, téléphone à l'horizontale, tablettes en portrait et en paysage, portables, 1080p, 1440p). Téléphone à l'horizontale : hero en deux colonnes, menu, titres et fiche produit adaptés à la hauteur. Écrans tactiles : cibles d'au moins 44 px. Un test vérifie qu'aucun élément trop large n'élargit la page sur mobile.
- **Accessibilité** : lien d'évitement, focus visibles, un seul `h1` par page, onglets ARIA au clavier, menu et visionneuse modaux (focus piégé, Échap, page inerte derrière), FAQ en `<details>`, textes alternatifs, contrastes vérifiés.
- **Vie privée** : aucun traceur propre au site. Favoris en `localStorage`, effaçables depuis `/confidentialite`. La carte Google Maps de « Nous trouver » est affichée directement (Google peut y déposer ses cookies : c'est indiqué sur `/confidentialite`).

### Mesures effectuées (conteneur sans GPU, Chromium logiciel)

Lighthouse 12, profil mobile simulé (4G lente, processeur ×4), build de production. Mesures **antérieures** à la refonte d'octobre 2026 (pages fusionnées, écran de chargement, carte Google Maps directe, photos produits) : à refaire.

| Page | Performance | Accessibilité | Bonnes pratiques | SEO | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 65 | 100 | 100 | 100 | 4,0 s | 820 ms | 0 |
| `/la-carte` | 84 | 100 | 100 | 100 | 3,4 s | 300 ms | 0 |
| `/esprit-doka` | 77 | 100 | 100 | 100 | 3,4 s | 590 ms | 0,001 |
| `/nous-trouver` | 82 | 100 | 100 | 100 | 3,4 s | 390 ms | 0 |

Lecture honnête de ces chiffres :

- Ils viennent d'un conteneur **sans carte graphique** et à 2 cœurs : le rendu y est logiciel, ce qui gonfle le temps de blocage. Sur l'accueil, passer le mobile en vidéo a fait tomber le TBT de 7,2 s à 0,8 s dans ce même environnement.
- Le **LCP mesuré reste au-dessus de l'objectif de 2,5 s** en simulation mobile lente. Le CLS est nul partout. Pistes si les mesures réelles le confirment : alléger les polices (sous-ensemble des glyphes utilisés), réduire l'hydratation des pages les plus statiques.
- **Les Core Web Vitals doivent être mesurés sur de vrais appareils** après déploiement (PageSpeed Insights, Vercel Speed Insights) ; ils n'ont pas pu l'être ici.

## Tests

```bash
npm run build
npx playwright install chromium   # une fois
npm run test:e2e
# ou avec un Chromium existant : CHROME_PATH=/chemin/vers/chrome npm run test:e2e
```

Couvre les 15 parcours du cahier des charges : accueil complet, carte et filtres, fiche produit, ajout de favori, persistance après rechargement, suppression, L'esprit Doka (le lieu) et visionneuse, itinéraire et carte Google Maps, retour à l'accueil, menu mobile (focus, verrouillage du scroll, fermeture), navigation rapide et précédent/suivant, mouvement réduit, statut 200 de toutes les pages, redirections des anciennes adresses, liens internes, images non cassées, absence d'erreurs console, pas de débordement horizontal sur mobile.

---

## À confirmer avant publication

1. **Photos** — les fichiers fournis s'appellent « Image ChatGPT… ». Confirmer qu'ils sont validés par Doka comme visuels officiels. Points visibles : tableaux de prix sur la façade (`3,3`, `3,5`…) différents de la carte, n° « 11 » sur la porte voisine, enseigne et gobelet bleu marine sur la photo du gobelet échangé.
2. **Prix** de la carte officielle et **applicabilité des options** (version glacée, avoine, sirop, extra shot) boisson par boisson.
3. **Horaires** — repris de la fiche Google (lun.–ven. 8h–18h, sam.–dim. 9h–19h).
4. **Descriptions** : composition du nuage coco-matcha (nommé « Coconut Matcha Cloud » sur le tableau), cookies (parfums, prix), sélection des « incontournables ».
5. **Note Google** affichée dans le hero (`siteConfig.googleRating`, 5,0) : à tenir à jour.
6. **Accès** : stations de métro indiquées (Rambuteau, Hôtel de Ville, Châtelet – Les Halles).
7. **Mentions légales** : e-mail de contact (absent : renvoi vers Instagram), directeur de la publication, siège social — d'après le registre.
8. **Domaine** final (`NEXT_PUBLIC_SITE_URL`).
9. **Carte Google Maps sans bandeau de consentement** : affichée directement à la demande de Doka. Google peut déposer des cookies ; selon les recommandations de la CNIL, un recueil du consentement peut être requis.

### Ressources qui amélioreraient le site

- Originaux haute définition (le livrable 3840 × 2160 n'est pas atteignable avec des sources en 1672 × 941 ; aucune image n'a été agrandie).
- Photos réelles de l'intérieur, du comptoir, de l'équipe, et une vraie photo Doka par boisson pour remplacer les photos d'illustration libres de droits (allongé, double, americano, cappuccino, flat white, chaï, chocolat, thé, nuage coco-matcha).
