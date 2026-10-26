import { products, type Product } from "./products";

/** Filtres de la page « La carte » (consultation rapide des prix). */
export const menuFilters = [
  { id: "all", label: "Tout", match: () => true },
  { id: "classiques", label: "Classiques", match: (p: Product) => p.family === "coffee" },
  { id: "matcha", label: "Matcha", match: (p: Product) => p.family === "matcha" },
  { id: "autres", label: "Autres boissons", match: (p: Product) => p.family === "other" },
  { id: "specialites", label: "Spécialités", match: (p: Product) => p.boardSection === "specials" },
  { id: "gourmandises", label: "Gourmandises", match: (p: Product) => p.family === "sweet" },
  { id: "options", label: "Options", match: () => false },
] as const;

export type MenuFilterId = (typeof menuFilters)[number]["id"];

/** Catégories de la page « Nos produits » (découverte visuelle). */
export const productCategories = [
  {
    id: "coffee",
    label: "Coffee",
    intro: "Les classiques du comptoir.",
    match: (p: Product) => p.family === "coffee",
  },
  {
    id: "matcha",
    label: "Matcha",
    intro: "Chaud ou glacé, même prix.",
    match: (p: Product) => p.family === "matcha" && !p.signature,
  },
  {
    id: "signature",
    label: "Signature drinks",
    intro: "La spécialité de la carte.",
    match: (p: Product) => !!p.signature,
  },
  { id: "other", label: "Autres boissons", intro: "Chaï, chocolat, thé.", match: (p: Product) => p.family === "other" },
  {
    id: "sweet",
    label: "Sweet treats",
    intro: "Au présentoir, à côté du guichet.",
    match: (p: Product) => p.family === "sweet",
  },
] as const;

export type ProductCategoryId = (typeof productCategories)[number]["id"];

export function categoryOf(p: Product): (typeof productCategories)[number] {
  return productCategories.find((c) => c.match(p)) ?? productCategories[0];
}

export const familyLabel: Record<Product["family"], string> = {
  coffee: "Coffee",
  matcha: "Matcha",
  other: "Autres boissons",
  sweet: "Sweet treats",
};

export function productsIn(categoryId: ProductCategoryId): Product[] {
  const cat = productCategories.find((c) => c.id === categoryId);
  return cat ? products.filter(cat.match) : [];
}
