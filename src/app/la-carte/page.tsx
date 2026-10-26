import type { Metadata } from "next";
import { MenuBoard } from "@/components/menu/MenuBoard";
import { AnimatedHeading } from "@/components/motion/AnimatedHeading";
import { pageMetadata } from "@/lib/seo";
import { formatPrice, priceRange, productsBySlug } from "@/data/products";

const range = priceRange();

export const metadata: Metadata = pageMetadata({
  title: "La carte",
  description: `La carte de Doka, coffee shop à emporter rue Rambuteau : espresso ${formatPrice(productsBySlug.espresso.price)}, latte, flat white, matcha latte, nuage coco-matcha, chaï, chocolat chaud et cookies. De ${formatPrice(range.min)} à ${formatPrice(range.max)}, chaud ou glacé.`,
  path: "/la-carte",
});

export default function CartePage() {
  return (
    <div className="page-carte t-cream">
      <header className="carte-hero">
        <AnimatedHeading as="h1" className="display type-giant carte-hero__title" mode="chars" immediate delay={0.1}>
          la carte
        </AnimatedHeading>
        <div className="carte-hero__meta">
          <p className="brandline carte-hero__line">Cafés, matcha, gourmandises.</p>
          <p className="carte-hero__sub">
            Chaud ou glacé, du matin au soir. De {formatPrice(range.min)} à {formatPrice(range.max)}, avec la version
            glacée et le lait d&apos;avoine sans supplément. Touche une boisson pour voir sa fiche.
          </p>
        </div>
      </header>
      <MenuBoard />
    </div>
  );
}
