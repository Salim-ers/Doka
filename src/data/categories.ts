import type { Family, Product } from "./products";

/** Rubriques de « La carte », une par famille de produits, dans l'ordre du tableau. */
export const menuSections: { family: Family; id: string; title: string; label: string }[] = [
  { family: "coffee", id: "cafes", title: "cafés", label: "Cafés" },
  { family: "matcha", id: "matcha", title: "matcha", label: "Matcha" },
  { family: "other", id: "autres", title: "autres boissons", label: "Autres boissons" },
  { family: "sweet", id: "gourmandises", title: "gourmandises", label: "Gourmandises" },
];

/** Filtres de « La carte » (synchronisés avec l'URL ?categorie=) : un par rubrique, plus Tout et Options. */
export const menuFilters = [
  { id: "all", label: "Tout" },
  ...menuSections.map((s) => ({ id: s.id, label: s.label })),
  { id: "options", label: "Options" },
] as const;

export function sectionOf(p: Product) {
  return menuSections.find((s) => s.family === p.family) ?? menuSections[0];
}
