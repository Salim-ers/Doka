/**
 * Manifeste des médias Doka.
 * Règle : une photo = un emplacement éditorial. Les seules réutilisations sont
 * les photos produit, affichées en miniature dans le catalogue (/produits) puis
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
  | "latteGlace";

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
    placements: ["Accueil — Le coin gourmand", "/produits (miniature)", "/produits/cookies (détail)"],
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
    placements: ["/le-coffee-shop — Un café, ça se passe de main en main"],
    alt: "Un gobelet Doka tendu d'une main à une autre dans une rue de Paris",
    usage: "Ambiance, vente à emporter. Ne pas associer à une boisson précise.",
    sourceQuality: SOURCE + " Logo et enseigne en bleu marine sur ce visuel : à valider avec la marque.",
    focus: "55% 45%",
  },
  matcha: {
    id: "matcha",
    file: "/images/doka/doka-matcha-glace.webp",
    original: "media/originals/doka-matcha-glace.png",
    description: "Visuel officiel « doka matcha — your favorite drink » : matcha latte glacé, logo noir en pied.",
    subject: "Produit — Matcha Latte (version glacée)",
    format: "16:9",
    width: W,
    height: H,
    placements: ["Accueil — Section matcha", "/produits (miniature)", "/produits/matcha-latte (détail)"],
    alt: "Matcha latte glacé Doka dans un gobelet transparent, logo doka en noir",
    usage: "Produit : Matcha Latte uniquement",
    sourceQuality: SOURCE + " Visuel de campagne avec texte intégré : cadrage centré obligatoire.",
    focus: "50% 50%",
    fit: "contain",
    matte: "#FEFDF2",
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
    placements: ["/esprit-doka — Le manifeste"],
    alt: "Logo doka crème sur fond orange avec la signature made for every day",
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
    placements: ["/esprit-doka — Une carte qui tient sur un tableau"],
    alt: "La carte officielle de Doka avec les prix, de l'espresso à 1,50 € au Coconut Matcha Cloud à 5,50 €",
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
    placements: ["Accueil — Coffee moment", "/produits (miniature)", "/produits/espresso (détail)"],
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
    placements: ["/le-coffee-shop — Ouverture"],
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
    placements: ["Accueil — Les incontournables (Latte)", "/produits (miniature)", "/produits/latte (détail)"],
    alt: "Latte glacé Doka, marbrures de café et de lait dans un gobelet transparent",
    usage: "Produit : Latte, version glacée (option gratuite)",
    sourceQuality: SOURCE,
    focus: "50% 40%",
    fit: "contain",
    matte: "#FFFFFF",
  },
};
