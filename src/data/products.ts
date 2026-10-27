import type { MediaId } from "./media";

/**
 * Catalogue central Doka — source unique des noms, prix et descriptions.
 * Prix en centimes, relevés sur la carte officielle transmise (media/originals/doka-carte-officielle.png).
 * `price: null` = prix non communiqué : le site affiche « Prix au comptoir », jamais un tarif inventé.
 * Les descriptions sont volontairement factuelles ; `toConfirm: true` = texte à valider par Doka.
 */

export type Family = "coffee" | "matcha" | "other" | "sweet";
export type OptionId = "iced" | "oat" | "syrup" | "extraShot";

export type Product = {
  slug: string;
  name: string;
  family: Family;
  signature?: boolean;
  price: number | null;
  short: string;
  description: string;
  toConfirm?: boolean;
  media?: MediaId;
  mediaCaption?: string;
  options: OptionId[];
  /** Couleur de la carte graphique quand il n'y a pas de photo. */
  tone: "espresso" | "crema" | "milk" | "matcha" | "cloud" | "chai" | "cocoa" | "tea" | "cookie";
  pairsWith: string[];
};

export type ProductOption = {
  id: OptionId;
  label: string;
  price: number;
};

export const drinkOptions: ProductOption[] = [
  { id: "iced", label: "Version glacée", price: 0 },
  { id: "oat", label: "Lait d'avoine", price: 0 },
  { id: "syrup", label: "Sirop vanille ou caramel", price: 50 },
  { id: "extraShot", label: "Dose supplémentaire de café ou de matcha", price: 100 },
];

export const bringYourOwnCup = { label: "Apporte ton gobelet", discount: 20 };

const ALL: OptionId[] = ["iced", "oat", "syrup", "extraShot"];

export const products: Product[] = [
  {
    slug: "espresso",
    name: "Espresso",
    family: "coffee",
    price: 150,
    short: "Le petit noir du quotidien.",
    description:
      "Un espresso court et serré, la base de tout chez Doka. À 1,50 €, pour qu'un bon café reste un réflexe de tous les jours.",
    media: "espresso",
    mediaCaption: "Extraction dans un gobelet Doka",
    options: ALL,
    tone: "espresso",
    pairsWith: ["double", "allonge", "cookies"],
  },
  {
    slug: "allonge",
    name: "Allongé",
    family: "coffee",
    price: 150,
    short: "Un espresso, rallongé d'eau chaude.",
    description:
      "L'espresso allongé à l'eau chaude, pour une tasse plus longue et plus douce, au même prix que l'espresso.",
    media: "allonge",
    options: ALL,
    tone: "crema",
    pairsWith: ["espresso", "americano"],
  },
  {
    slug: "double",
    name: "Double",
    family: "coffee",
    price: 250,
    short: "Deux doses d'espresso, quand la journée en demande plus.",
    description: "Un double espresso pour les matins chargés.",
    media: "double",
    options: ALL,
    tone: "espresso",
    pairsWith: ["espresso", "americano"],
  },
  {
    slug: "americano",
    name: "Americano",
    family: "coffee",
    price: 250,
    short: "Espresso et eau chaude, en grand format.",
    description: "Un americano : de l'espresso et de l'eau chaude, à boire tranquillement en marchant.",
    media: "americano",
    options: ALL,
    tone: "crema",
    pairsWith: ["allonge", "cookies"],
  },
  {
    slug: "cappuccino",
    name: "Cappuccino",
    family: "coffee",
    price: 300,
    short: "Espresso, lait et mousse de lait.",
    description: "L'équilibre classique entre espresso, lait chaud et mousse de lait.",
    media: "cappuccino",
    options: ALL,
    tone: "milk",
    pairsWith: ["latte", "flat-white"],
  },
  {
    slug: "latte",
    name: "Latte",
    family: "coffee",
    price: 350,
    short: "Espresso et beaucoup de lait. Chaud ou glacé.",
    description:
      "Un latte : espresso et lait. Il existe aussi en version glacée, sans supplément, avec du lait d'avoine si tu préfères.",
    media: "latteGlace",
    mediaCaption: "En version glacée (option gratuite)",
    options: ALL,
    tone: "milk",
    pairsWith: ["flat-white", "cappuccino", "cookies"],
  },
  {
    slug: "flat-white",
    name: "Flat white",
    family: "coffee",
    price: 400,
    short: "Plus de café, moins de mousse.",
    description: "Un flat white : un café au lait plus court et plus intense que le latte.",
    media: "flatWhite",
    options: ALL,
    tone: "milk",
    pairsWith: ["latte", "cappuccino"],
  },
  {
    slug: "matcha-latte",
    name: "Matcha latte",
    family: "matcha",
    price: 400,
    short: "Matcha et lait, chaud ou glacé.",
    description:
      "Le matcha latte de Doka, « ta boisson préférée ». Chaud ou glacé au même prix, avec une dose de matcha en plus si tu en veux davantage.",
    media: "matcha",
    mediaCaption: "En version glacée (option gratuite)",
    options: ALL,
    tone: "matcha",
    pairsWith: ["nuage-coco-matcha", "cookies"],
  },
  {
    slug: "nuage-coco-matcha",
    name: "Nuage coco-matcha",
    family: "matcha",
    signature: true,
    price: 550,
    short: "La spécialité Doka, matcha et coco.",
    description: "La boisson signature de la carte, autour du matcha et de la noix de coco.",
    toConfirm: true,
    media: "nuageCocoMatcha",
    options: ["iced", "oat", "syrup", "extraShot"],
    tone: "cloud",
    pairsWith: ["matcha-latte", "cookies"],
  },
  {
    slug: "chai-latte",
    name: "Chaï latte",
    family: "other",
    price: 400,
    short: "Chaï et lait.",
    description: "Un chaï latte, épicé et doux.",
    media: "chaiLatte",
    options: ALL,
    tone: "chai",
    pairsWith: ["chocolat-chaud", "the"],
  },
  {
    slug: "chocolat-chaud",
    name: "Chocolat chaud",
    family: "other",
    price: 450,
    short: "Un vrai chocolat chaud.",
    description: "Un chocolat chaud, pour les jours sans café.",
    media: "chocolatChaud",
    options: ["iced", "oat", "syrup"],
    tone: "cocoa",
    pairsWith: ["cookies", "chai-latte"],
  },
  {
    slug: "the",
    name: "Thé noir ou vert",
    family: "other",
    price: 300,
    short: "Thé noir ou thé vert, au choix.",
    description: "Un thé, noir ou vert, au choix.",
    media: "the",
    options: ["iced"],
    tone: "tea",
    pairsWith: ["matcha-latte", "chai-latte"],
  },
  {
    slug: "cookies",
    name: "Cookies",
    family: "sweet",
    price: null,
    short: "Les cookies du présentoir.",
    description:
      "Les cookies de Doka, posés sur le présentoir à côté du guichet. Parfums et prix à découvrir au comptoir.",
    toConfirm: true,
    media: "cookies",
    mediaCaption: "Sur le présentoir",
    options: [],
    tone: "cookie",
    pairsWith: ["espresso", "latte", "matcha-latte"],
  },
];

/** Anciennes adresses des fiches renommées (redirections permanentes). */
export const renamedSlugs: Record<string, string> = {
  "hot-chocolate": "chocolat-chaud",
  tea: "the",
  "coconut-matcha-cloud": "nuage-coco-matcha",
};

export const productsBySlug: Record<string, Product> = Object.fromEntries(products.map((p) => [p.slug, p]));

export function getProduct(slug: string): Product | undefined {
  return productsBySlug[slug];
}

/** Sélection éditoriale (« sous réserve de validation » par l'établissement). */
export const signatureSelection = ["espresso", "latte", "matcha-latte", "nuage-coco-matcha"] as const;

/** Les prix du quotidien mis en scène dans « le bon café, tous les jours ». */
export const everydayLadder = ["espresso", "americano", "cappuccino", "latte"] as const;

export function formatPrice(cents: number | null, opts: { signed?: boolean; currency?: boolean } = {}): string {
  if (cents === null) return "Prix au comptoir";
  const { signed = false, currency = true } = opts;
  const abs = Math.abs(cents);
  const value = (abs / 100).toFixed(2).replace(".", ",");
  const sign = signed ? (cents < 0 ? "−" : "+") : cents < 0 ? "−" : "";
  // espace insécable : le « € » ne passe jamais seul à la ligne
  return `${sign}${value}${currency ? "\u00a0€" : ""}`;
}

/** Fourchette de prix de la carte (calculée, jamais saisie à la main). */
export function priceRange() {
  const prices = products.map((p) => p.price).filter((p): p is number => p !== null);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
