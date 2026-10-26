import type { MediaId } from "./media";

/**
 * Catalogue central Doka — source unique des noms, prix et descriptions.
 * Prix en centimes, relevés sur la carte officielle transmise (media/originals/doka-carte-officielle.png).
 * `price: null` = prix non communiqué : le site affiche « Prix au comptoir », jamais un tarif inventé.
 * Les descriptions sont volontairement factuelles ; `toConfirm: true` = texte à valider par Doka.
 */

export type Family = "coffee" | "matcha" | "other" | "sweet";
export type BoardSection = "classics" | "specials" | "sweets";
export type OptionId = "iced" | "oat" | "syrup" | "extraShot";

export type Product = {
  slug: string;
  name: string;
  family: Family;
  boardSection: BoardSection;
  signature?: boolean;
  price: number | null;
  short: string;
  description: string;
  toConfirm?: boolean;
  media?: MediaId;
  mediaCaption?: string;
  options: OptionId[];
  /** Couleur de la carte typographique quand il n'y a pas de photo. */
  tone: "espresso" | "crema" | "milk" | "matcha" | "cloud" | "chai" | "cocoa" | "tea" | "cookie";
  pairsWith: string[];
};

export type ProductOption = {
  id: OptionId;
  label: string;
  boardLabel: string;
  price: number;
};

export const drinkOptions: ProductOption[] = [
  { id: "iced", label: "Version glacée", boardLabel: "Iced", price: 0 },
  { id: "oat", label: "Lait d'avoine", boardLabel: "Oat Milk", price: 0 },
  { id: "syrup", label: "Sirop vanille ou caramel", boardLabel: "Vanilla/Caramel Syrup", price: 50 },
  { id: "extraShot", label: "Extra shot café ou matcha", boardLabel: "Extra shot Coffee/Matcha", price: 100 },
];

export const bringYourOwnCup = { label: "Apporte ton gobelet", boardLabel: "Bring your own cup !", discount: 20 };

const ALL: OptionId[] = ["iced", "oat", "syrup", "extraShot"];

export const products: Product[] = [
  {
    slug: "espresso",
    name: "Espresso",
    family: "coffee",
    boardSection: "classics",
    price: 150,
    short: "Le shot du quotidien.",
    description:
      "Un espresso court et serré, la base de tout chez Doka. À 1,50 €, pour qu'un bon café reste un réflexe de tous les jours.",
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
    boardSection: "classics",
    price: 150,
    short: "Un espresso, rallongé d'eau chaude.",
    description:
      "L'espresso allongé à l'eau chaude, pour une tasse plus longue et plus douce, au même prix que l'espresso.",
    options: ALL,
    tone: "crema",
    pairsWith: ["espresso", "americano"],
  },
  {
    slug: "double",
    name: "Double",
    family: "coffee",
    boardSection: "classics",
    price: 250,
    short: "Deux shots, quand la journée en demande plus.",
    description: "Un double espresso pour les matins chargés.",
    options: ALL,
    tone: "espresso",
    pairsWith: ["espresso", "americano"],
  },
  {
    slug: "americano",
    name: "Americano",
    family: "coffee",
    boardSection: "classics",
    price: 250,
    short: "Espresso et eau chaude, en grand format.",
    description: "Un americano : de l'espresso et de l'eau chaude, à boire tranquillement en marchant.",
    options: ALL,
    tone: "crema",
    pairsWith: ["allonge", "cookies"],
  },
  {
    slug: "cappuccino",
    name: "Cappuccino",
    family: "coffee",
    boardSection: "classics",
    price: 300,
    short: "Espresso, lait et mousse de lait.",
    description: "L'équilibre classique entre espresso, lait chaud et mousse de lait.",
    options: ALL,
    tone: "milk",
    pairsWith: ["latte", "flat-white"],
  },
  {
    slug: "latte",
    name: "Latte",
    family: "coffee",
    boardSection: "classics",
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
    name: "Flat White",
    family: "coffee",
    boardSection: "classics",
    price: 400,
    short: "Plus de café, moins de mousse.",
    description: "Un flat white : un café au lait plus court et plus intense que le latte.",
    options: ALL,
    tone: "milk",
    pairsWith: ["latte", "cappuccino"],
  },
  {
    slug: "matcha-latte",
    name: "Matcha Latte",
    family: "matcha",
    boardSection: "classics",
    price: 400,
    short: "Matcha et lait, chaud ou glacé.",
    description:
      "Le matcha latte de Doka, « your favorite drink ». Chaud ou glacé au même prix, avec un extra shot de matcha si tu en veux plus.",
    media: "matcha",
    mediaCaption: "En version glacée (option gratuite)",
    options: ALL,
    tone: "matcha",
    pairsWith: ["coconut-matcha-cloud", "cookies"],
  },
  {
    slug: "chai-latte",
    name: "Chaï Latte",
    family: "other",
    boardSection: "classics",
    price: 400,
    short: "Chaï et lait.",
    description: "Un chaï latte, épicé et doux.",
    options: ALL,
    tone: "chai",
    pairsWith: ["hot-chocolate", "tea"],
  },
  {
    slug: "hot-chocolate",
    name: "Hot Chocolate",
    family: "other",
    boardSection: "classics",
    price: 450,
    short: "Un chocolat chaud.",
    description: "Un chocolat chaud, pour les jours sans café.",
    options: ["iced", "oat", "syrup"],
    tone: "cocoa",
    pairsWith: ["cookies", "chai-latte"],
  },
  {
    slug: "tea",
    name: "Tea (Black/Green)",
    family: "other",
    boardSection: "classics",
    price: 300,
    short: "Thé noir ou thé vert.",
    description: "Un thé, noir ou vert, au choix.",
    options: ["iced"],
    tone: "tea",
    pairsWith: ["matcha-latte", "chai-latte"],
  },
  {
    slug: "coconut-matcha-cloud",
    name: "Coconut Matcha Cloud",
    family: "matcha",
    boardSection: "specials",
    signature: true,
    price: 550,
    short: "La spécialité Doka, matcha et coco.",
    description: "La boisson signature de la carte, autour du matcha et de la noix de coco.",
    toConfirm: true,
    options: ["iced", "oat", "syrup", "extraShot"],
    tone: "cloud",
    pairsWith: ["matcha-latte", "cookies"],
  },
  {
    slug: "cookies",
    name: "Cookies",
    family: "sweet",
    boardSection: "sweets",
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

export const productsBySlug: Record<string, Product> = Object.fromEntries(products.map((p) => [p.slug, p]));

export function getProduct(slug: string): Product | undefined {
  return productsBySlug[slug];
}

/** Sélection éditoriale (« sous réserve de validation » par l'établissement). */
export const signatureSelection = ["espresso", "latte", "matcha-latte", "coconut-matcha-cloud"] as const;

/** Les prix du quotidien mis en scène dans « Everyday coffee ». */
export const everydayLadder = ["espresso", "americano", "cappuccino", "latte"] as const;

export function formatPrice(cents: number | null, opts: { signed?: boolean; currency?: boolean } = {}): string {
  if (cents === null) return "Prix au comptoir";
  const { signed = false, currency = true } = opts;
  const abs = Math.abs(cents);
  const value = (abs / 100).toFixed(2).replace(".", ",");
  const sign = signed ? (cents < 0 ? "−" : "+") : cents < 0 ? "−" : "";
  return `${sign}${value}${currency ? " €" : ""}`;
}

/** Fourchette de prix de la carte (calculée, jamais saisie à la main). */
export function priceRange() {
  const prices = products.map((p) => p.price).filter((p): p is number => p !== null);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
