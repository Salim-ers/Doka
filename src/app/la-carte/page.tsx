import type { Metadata } from "next";
import { MenuBoard } from "@/components/menu/MenuBoard";
import { AnimatedHeading } from "@/components/motion/AnimatedHeading";
import { pageMetadata } from "@/lib/seo";
import { formatPrice, priceRange, productsBySlug } from "@/data/products";

const range = priceRange();

export const metadata: Metadata = pageMetadata({
  title: "La carte",
  description: `La carte de Doka, coffee shop à emporter rue Rambuteau : espresso ${formatPrice(productsBySlug.espresso.price)}, latte, flat white, matcha latte, Coconut Matcha Cloud. De ${formatPrice(range.min)} à ${formatPrice(range.max)}, chaud ou glacé.`,
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
          <p className="brandline carte-hero__line">Classics, specials, options.</p>
          <p className="carte-hero__sub">
            Hot or cold, morning to evening. De {formatPrice(range.min)} à {formatPrice(range.max)}, avec la version
            glacée et le lait d&apos;avoine sans supplément.
          </p>
        </div>
      </header>
      <MenuBoard />
    </div>
  );
}
