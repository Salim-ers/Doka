/**
 * Configuration centrale du site Doka.
 * Toute information pratique affichée sur le site provient d'ici.
 * Les champs marqués `toConfirm` figurent dans la liste « à confirmer » du README.
 */
export const siteConfig = {
  name: "Doka Coffee Shop",
  shortName: "Doka",
  tagline: "Fait pour tous les jours",
  promise: "Du café de spécialité, pour tout le monde",
  description:
    "Doka, coffee shop de spécialité 100 % à emporter au 15 rue Rambuteau, Paris 4e. Espresso, latte, matcha, cookies. Fait pour tous les jours.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://doka-coffee-shop.vercel.app",
  locale: "fr_FR",
  takeawayOnly: true,
  address: {
    street: "15 rue Rambuteau",
    postalCode: "75004",
    city: "Paris",
    district: "Paris 4e",
    country: "FR",
    full: "15 rue Rambuteau, 75004 Paris",
  },
  instagram: {
    handle: "@dokacoffeeshop",
    url: "https://www.instagram.com/dokacoffeeshop/",
  },
  maps: {
    directions:
      "https://www.google.com/maps/dir/?api=1&destination=Doka+coffee+shop%2C+15+Rue+Rambuteau%2C+75004+Paris",
    place: "https://www.google.com/maps/search/?api=1&query=Doka+coffee+shop%2C+15+Rue+Rambuteau%2C+75004+Paris",
    embed: "https://www.google.com/maps?q=Doka+coffee+shop,+15+Rue+Rambuteau,+75004+Paris&z=17&hl=fr&output=embed",
  },
  /** Note Google communiquée par l'établissement (pastille du hero). */
  googleRating: {
    value: "5,0",
    stars: 5,
  },
  /**
   * Horaires relevés sur la fiche Google de l'établissement (oct. 2026),
   * cohérents avec la bio Instagram (lun.–ven. 8h–18h). toConfirm.
   * Mettre `show: false` pour les masquer partout.
   */
  hours: {
    show: true,
    toConfirm: true,
    days: [
      { day: "Lundi", short: "Lun.", schema: "Monday", open: "08:00", close: "18:00" },
      { day: "Mardi", short: "Mar.", schema: "Tuesday", open: "08:00", close: "18:00" },
      { day: "Mercredi", short: "Mer.", schema: "Wednesday", open: "08:00", close: "18:00" },
      { day: "Jeudi", short: "Jeu.", schema: "Thursday", open: "08:00", close: "18:00" },
      { day: "Vendredi", short: "Ven.", schema: "Friday", open: "08:00", close: "18:00" },
      { day: "Samedi", short: "Sam.", schema: "Saturday", open: "09:00", close: "19:00" },
      { day: "Dimanche", short: "Dim.", schema: "Sunday", open: "09:00", close: "19:00" },
    ],
    summary: [
      { label: "Lundi – vendredi", value: "8h – 18h" },
      { label: "Samedi – dimanche", value: "9h – 19h" },
    ],
  },
  /** Accès transports. toConfirm (stations les plus proches de la rue Rambuteau). */
  access: {
    toConfirm: true,
    lines: [
      { name: "Rambuteau", detail: "Métro ligne 11" },
      { name: "Hôtel de Ville", detail: "Métro lignes 1 et 11" },
      { name: "Châtelet – Les Halles", detail: "RER A, B, D" },
    ],
  },
  /** Données légales publiques (registre RNE / INSEE), transmises pour le projet. */
  legal: {
    company: "DOKA",
    form: "Société par actions simplifiée (SAS)",
    capital: "1 095 €",
    headOffice: "45 rue du Simplon, 75018 Paris",
    siren: "105 713 770",
    siret: "105 713 770 00011",
    rcs: "RCS Paris 105 713 770",
    vat: "FR16105713770",
    publicationDirector: "Arthur-Louis Jacquier",
    contactEmail: null as string | null,
    host: {
      name: "Vercel Inc.",
      address: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
      url: "https://vercel.com",
    },
  },
} as const;

export const mainNav = [
  { href: "/", label: "Accueil" },
  { href: "/la-carte", label: "La carte" },
  { href: "/nos-favoris", label: "Nos favoris" },
  { href: "/esprit-doka", label: "L'esprit Doka" },
  { href: "/nous-trouver", label: "Nous trouver" },
] as const;

export const legalNav = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/confidentialite", label: "Confidentialité" },
] as const;

/** « 08:00 » → « 8h », « 08:30 » → « 8h30 ». */
export function formatHour(hhmm: string) {
  const [h, m] = hhmm.split(":");
  return `${Number(h)}h${m === "00" ? "" : m}`;
}
