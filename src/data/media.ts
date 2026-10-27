/**
 * Manifeste des médias Doka.
 * Règle : une photo = un emplacement éditorial. Les seules réutilisations sont
 * les photos produit, affichées en vignette sur la carte (/la-carte) puis
 * en vue détaillée sur la fiche du produit concerné.
 *
 * Sources : visuels fournis par le client (fichiers « Image ChatGPT … »), 1672 × 941 px.
 * Aucune retouche de contenu, aucun agrandissement. Le livrable 3840 × 2160 demandé
 * nécessite des originaux en plus haute définition (voir README).
 */
export type MediaId =
  | "cookies"
  | "gobeletRue"
  | "matcha"
  | "identite"
  | "facade"
  | "carteOfficielle"
  | "espresso"
  | "devantureSoir"
  | "latteGlace"
  | StockId;

/** Photos d'illustration libres de droits, une par produit sans visuel Doka. */
type StockId =
  | "allonge"
  | "double"
  | "americano"
  | "cappuccino"
  | "flatWhite"
  | "nuageCocoMatcha"
  | "chaiLatte"
  | "chocolatChaud"
  | "the";

export type MediaItem = {
  id: MediaId;
  file: string;
  original: string;
  description: string;
  subject: string;
  format: string;
  width: number;
  height: number;
  placements: string[];
  alt: string;
  usage: string;
  sourceQuality: string;
  /** Point focal (object-position) pour les recadrages responsives. */
  focus: string;
  /**
   * Visuels de campagne (texte et logo intégrés) : jamais recadrés, affichés en entier
   * sur un fond de la même teinte que le visuel.
   */
  fit?: "contain";
  matte?: string;
  /** Vignette carrée (carte, favoris) : point focal et zoom pour cadrer la boisson, pas le texte. */
  thumb?: { focus: string; zoom: number };
  /** Photo d'illustration libre de droits (banque d'images), pas une photo de Doka. */
  credit?: { title: string; author: string; license: string; source: string };
};

/** Photo d'illustration libre de droits (CC0 ou domaine public) pour un produit sans visuel Doka. */
function stock(
  id: StockId,
  slug: string,
  o: {
    subject: string;
    alt: string;
    width: number;
    height: number;
    focus: string;
    thumb?: MediaItem["thumb"];
    credit: NonNullable<MediaItem["credit"]>;
  },
): MediaItem {
  return {
    id,
    file: `/images/doka/produits/${slug}.webp`,
    original: `media/originals/stock/${slug}.jpg`,
    description: `Photo d'illustration libre de droits : ${o.subject.toLowerCase()}.`,
    subject: `Produit — ${o.subject} (illustration)`,
    format: `${o.width} × ${o.height}`,
    width: o.width,
    height: o.height,
    placements: ["/la-carte (vignette)", `/produits/${slug} (détail)`],
    alt: o.alt,
    usage: `Produit : ${o.subject} uniquement. Photo d'illustration, à remplacer par une photo Doka.`,
    sourceQuality: `${o.credit.license} — ${o.credit.source}`,
    focus: o.focus,
    thumb: o.thumb,
    credit: o.credit,
  };
}

const CC0 = "CC0 1.0 (domaine public)";

/** Sélection : Wikimedia Commons et WordPress Photo Directory, licence CC0 uniquement (oct. 2026). */
const STOCK_PHOTOS: Record<StockId, MediaItem> = {
  allonge: stock("allonge", "allonge", {
    subject: "Allongé",
    alt: "Un café allongé à la crème dorée dans une tasse en verre à anse métallique, sur une table en bois",
    width: 1672,
    height: 1115,
    focus: "62% 50%",
    credit: {
      title: "Espresso lungo coffee in a cup made of glass and steel",
      author: "Nilo Velez",
      license: CC0,
      source: "https://wordpress.org/photos/photo/16065c3b54/",
    },
  }),
  double: stock("double", "double", {
    subject: "Double",
    alt: "Un double espresso et sa fine crème dans un petit verre, sur un comptoir en bois",
    width: 1672,
    height: 1115,
    focus: "50% 50%",
    credit: {
      title: "Glass cup of beverage",
      author: "Edan Cohen",
      license: CC0,
      source: "https://commons.wikimedia.org/wiki/File:Glass_cup_of_beverage_(Unsplash).jpg",
    },
  }),
  americano: stock("americano", "americano", {
    subject: "Americano",
    alt: "Un americano dans une grande tasse en verre sur sa soucoupe, posé sur une table en bois",
    width: 1335,
    height: 1672,
    focus: "50% 62%",
    thumb: { focus: "50% 75%", zoom: 1 },
    credit: {
      title: "A glass cup filled with dark coffee",
      author: "Yam B Chhetri",
      license: CC0,
      source: "https://wordpress.org/photos/photo/50169d3322/",
    },
  }),
  cappuccino: stock("cappuccino", "cappuccino", {
    subject: "Cappuccino",
    alt: "Un cappuccino mousseux orné d'une feuille dessinée dans la mousse, dans une tasse blanche",
    width: 1672,
    height: 941,
    focus: "20% 50%",
    credit: {
      title: "Latte art on cappuccino",
      author: "Drew Coffman",
      license: CC0,
      source: "https://commons.wikimedia.org/wiki/File:Latte_art_on_cappuccino_(Unsplash).jpg",
    },
  }),
  flatWhite: stock("flatWhite", "flat-white", {
    subject: "Flat white",
    alt: "Un flat white à la mousse de lait soyeuse dessinant une tulipe, vu de dessus dans une tasse blanche",
    width: 1672,
    height: 1115,
    focus: "40% 50%",
    credit: {
      title: "Two Hands Cafe latte art",
      author: "Drew Coffman",
      license: CC0,
      source: "https://commons.wikimedia.org/wiki/File:Two_Hands_Cafe_latte_art_(Unsplash).jpg",
    },
  }),
  nuageCocoMatcha: stock("nuageCocoMatcha", "nuage-coco-matcha", {
    subject: "Nuage coco-matcha",
    alt: "Un matcha au lait glacé dans un grand verre avec une paille, posé sur une table en bois",
    width: 1115,
    height: 1672,
    focus: "50% 62%",
    thumb: { focus: "50% 75%", zoom: 1 },
    credit: {
      title: "Iced green tea latte",
      author: "Saya1611",
      license: CC0,
      source: "https://commons.wikimedia.org/wiki/File:Iced_green_tea_latte.jpg",
    },
  }),
  chaiLatte: stock("chaiLatte", "chai-latte", {
    subject: "Chaï latte",
    alt: "Un chaï latte saupoudré d'épices avec un cœur dessiné dans la mousse, dans une tasse anthracite",
    width: 1672,
    height: 1259,
    focus: "40% 50%",
    credit: {
      title: "Chai Latte - The Flour Pot Bakery",
      author: "Andy Li",
      license: CC0,
      source: "https://commons.wikimedia.org/wiki/File:Chai_Latte_-_The_Flour_Pot_Bakery_2026-05-20.jpg",
    },
  }),
  chocolatChaud: stock("chocolatChaud", "chocolat-chaud", {
    subject: "Chocolat chaud",
    alt: "Un chocolat chaud onctueux et mousseux dans une tasse blanche, sur une table en bois",
    width: 1672,
    height: 1326,
    focus: "45% 50%",
    credit: {
      title: "Chocolat chaud au Café Lumière (Lyon)",
      author: "Benoît Prieur",
      license: CC0,
      source:
        "https://commons.wikimedia.org/wiki/File:Chocolat_chaud_au_Caf%C3%A9_Lumi%C3%A8re_(Lyon)_en_d%C3%A9cembre_2023.JPG",
    },
  }),
  the: stock("the", "the", {
    subject: "Thé",
    alt: "Une tasse en verre de thé noir fumant avec son sachet, baignée de lumière sur un plan de travail",
    width: 1672,
    height: 1115,
    focus: "25% 50%",
    credit: {
      title: "Tea on the countertop",
      author: "freestocks.org",
      license: CC0,
      source: "https://commons.wikimedia.org/wiki/File:Tea_on_the_countertop_(34419804081).jpg",
    },
  }),
};

const W = 1672;
const H = 941;
const SOURCE = "Visuel client 1672 × 941 px, net, sans compression visible. Pas de version 4K fournie.";

export const media: Record<MediaId, MediaItem> = {
  cookies: {
    id: "cookies",
    file: "/images/doka/doka-cookies-presentoir.webp",
    original: "media/originals/doka-cookies-presentoir.png",
    description: "Cookies posés sur grille, sur le présentoir à pois rouges ; une main les attrape à la pince.",
    subject: "Gourmandises — cookies",
    format: "16:9",
    width: W,
    height: H,
    placements: ["Accueil — Le coin gourmand", "/la-carte (vignette)", "/produits/cookies (détail)"],
    alt: "Cookies Doka sur le présentoir à pois rouges, une main en saisit un avec une pince",
    usage: "Produit : cookies (parfums et prix non communiqués)",
    sourceQuality: SOURCE,
    focus: "60% 55%",
  },
  gobeletRue: {
    id: "gobeletRue",
    file: "/images/doka/doka-gobelet-rue.webp",
    original: "media/originals/doka-gobelet-rue.png",
    description: "Un gobelet Doka passe d'une main à l'autre dans une rue parisienne ensoleillée.",
    subject: "Lieu — à emporter",
    format: "16:9",
    width: W,
    height: H,
    placements: ["/esprit-doka — Le lieu : un café, ça se passe de main en main"],
    alt: "Un gobelet Doka tendu d'une main à une autre dans une rue de Paris",
    usage: "Ambiance, vente à emporter. Ne pas associer à une boisson précise.",
    sourceQuality: SOURCE + " Logo et enseigne en bleu marine sur ce visuel : à valider avec la marque.",
    focus: "55% 45%",
  },
  matcha: {
    id: "matcha",
    file: "/images/doka/doka-matcha-glace-gros-plan.webp",
    original: "media/originals/doka-matcha-glace.png",
    description:
      "Visuel officiel doka matcha recadré en gros plan sur le gobelet : sans son titre anglais « your favorite drink » ni le logo, coupé au bord bas dans le visuel d'origine.",
    subject: "Produit — Matcha latte (version glacée)",
    format: "1072 × 452",
    width: 1072,
    height: 452,
    placements: ["Accueil — Section matcha", "/la-carte (vignette)", "/produits/matcha-latte (détail)"],
    alt: "Matcha latte glacé dans un gobelet transparent, glaçons et mousse verte, en gros plan",
    usage: "Produit : Matcha latte uniquement",
    sourceQuality: SOURCE + " Recadrage généré par scripts/optimize-images.mjs (texte et logo retirés).",
    focus: "50% 45%",
  },
  identite: {
    id: "identite",
    file: "/images/doka/doka-identite-logo.webp",
    original: "media/originals/doka-identite-logo.png",
    description: "Logo crème sur orange : « doka — made for every day, specialty coffee — made for all ».",
    subject: "Identité de marque",
    format: "16:9",
    width: W,
    height: H,
    placements: ["Plus affiché : remplacé par IdentityCard (textes en français) et l'image de partage doka-og.jpg"],
    alt: "Logo doka crème sur fond orange avec sa signature",
    usage: "Identité. Source du tracé vectoriel du logo (src/components/brand/logo-paths.ts).",
    sourceQuality: SOURCE,
    focus: "50% 50%",
  },
  facade: {
    id: "facade",
    file: "/images/doka/doka-facade-rue-rambuteau.webp",
    original: "media/originals/doka-facade-rue-rambuteau.png",
    description: "Façade complète : devanture rouge, store, enseigne crème « doka made for everyday », guichet.",
    subject: "Lieu — façade",
    format: "16:9",
    width: W,
    height: H,
    placements: ["Accueil — L'adresse"],
    alt: "La devanture rouge de Doka rue Rambuteau, avec son enseigne crème et son guichet",
    usage: "Lieu. Référence de la scène 3D du hero.",
    sourceQuality: SOURCE + " Le panneau de prix visible sur la façade diffère de la carte officielle : à vérifier.",
    focus: "50% 50%",
  },
  carteOfficielle: {
    id: "carteOfficielle",
    file: "/images/doka/doka-carte-officielle.webp",
    original: "media/originals/doka-carte-officielle.png",
    description: "La carte officielle : classics, specials, free options, options, bring your own cup.",
    subject: "Carte et prix",
    format: "16:9",
    width: W,
    height: H,
    placements: ["Plus affiché : remplacé par BoardCard (le tableau en français, généré depuis le catalogue)"],
    alt: "La carte officielle de Doka avec les prix, de l'espresso à 1,50 € à la boisson signature coco-matcha à 5,50 €",
    usage: "Source des données de src/data/products.ts",
    sourceQuality: SOURCE,
    focus: "40% 50%",
  },
  espresso: {
    id: "espresso",
    file: "/images/doka/doka-extraction-espresso.webp",
    original: "media/originals/doka-extraction-espresso.png",
    description: "Extraction d'un espresso directement dans un gobelet Doka, lumière chaude du matin.",
    subject: "Produit — Espresso",
    format: "16:9",
    width: W,
    height: H,
    placements: ["Accueil — L'heure du café", "/la-carte (vignette)", "/produits/espresso (détail)"],
    alt: "Un espresso coule de la machine dans un gobelet doka",
    usage: "Produit : Espresso",
    sourceQuality: SOURCE,
    focus: "30% 50%",
  },
  devantureSoir: {
    id: "devantureSoir",
    file: "/images/doka/doka-gobelet-devanture-soir.webp",
    original: "media/originals/doka-gobelet-devanture-soir.png",
    description: "Un gobelet Doka tenu devant la devanture rouge éclairée, en soirée.",
    subject: "Lieu — devanture en soirée",
    format: "16:9",
    width: W,
    height: H,
    placements: ["/esprit-doka — Le lieu (devanture qui s'agrandit)"],
    alt: "Un gobelet doka tenu à la main devant la devanture rouge du coffee shop, le soir",
    usage: "Lieu",
    sourceQuality: SOURCE + " Le tableau de prix visible sur la vitrine diffère de la carte officielle : à vérifier.",
    focus: "52% 50%",
  },
  latteGlace: {
    id: "latteGlace",
    file: "/images/doka/doka-latte-glace.webp",
    original: "media/originals/doka-latte-glace.png",
    description: "Latte glacé aux marbrures de café et de lait, logo doka noir.",
    subject: "Produit — Latte (version glacée)",
    format: "16:9",
    width: W,
    height: H,
    placements: ["Accueil — Les incontournables (Latte)", "/la-carte (vignette)", "/produits/latte (détail)"],
    alt: "Latte glacé Doka, marbrures de café et de lait dans un gobelet transparent",
    usage: "Produit : Latte, version glacée (option gratuite)",
    sourceQuality: SOURCE,
    focus: "50% 40%",
    fit: "contain",
    matte: "#FFFFFF",
    thumb: { focus: "50% 22%", zoom: 1.4 },
  },
  ...STOCK_PHOTOS,
};
