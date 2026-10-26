import type { Metadata } from "next";
import { siteConfig } from "@/data/site-config";
import { formatPrice, priceRange, products } from "@/data/products";

export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  image?: { url: string; alt: string };
}): Metadata {
  const image = opts.image ?? { url: "/images/doka/doka-identite-logo.webp", alt: "Logo doka sur fond orange" };
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: opts.path },
    openGraph: {
      title: `${opts.title} — Doka Coffee Shop`,
      description: opts.description,
      url: opts.path,
      images: [{ url: image.url, width: 1672, height: 941, alt: image.alt }],
    },
  };
}

/** Données structurées CafeOrCoffeeShop : uniquement des informations vérifiées (pas de note ni d'avis). */
export function localBusinessJsonLd() {
  const { address, hours, instagram, url, name, tagline } = siteConfig;
  const json: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name,
    url,
    slogan: tagline,
    image: `${url}/images/doka/doka-facade-rue-rambuteau.webp`,
    logo: `${url}/images/doka/doka-identite-logo.webp`,
    priceRange: `${formatPrice(priceRange().min)} – ${formatPrice(priceRange().max)}`,
    servesCuisine: "Café de spécialité",
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      postalCode: address.postalCode,
      addressLocality: address.city,
      addressCountry: address.country,
    },
    sameAs: [instagram.url],
    hasMenu: `${url}/la-carte`,
    hasMenuSection: {
      "@type": "MenuSection",
      name: "La carte",
      hasMenuItem: products
        .filter((p) => p.price !== null)
        .map((p) => ({
          "@type": "MenuItem",
          name: p.name,
          offers: { "@type": "Offer", price: ((p.price ?? 0) / 100).toFixed(2), priceCurrency: "EUR" },
        })),
    },
  };
  if (hours.show) {
    json.openingHoursSpecification = hours.days.map((d) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: d.schema,
      opens: d.open,
      closes: d.close,
    }));
  }
  return json;
}
