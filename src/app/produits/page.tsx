import type { Metadata } from "next";
import { AnimatedHeading } from "@/components/motion/AnimatedHeading";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductsHeroPalette } from "@/components/products/ProductsHeroPalette";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Nos produits",
  description:
    "Coffee, matcha, signature drinks et sweet treats : découvre les boissons et gourmandises de Doka, coffee shop à emporter du Marais.",
  path: "/produits",
});

export default function ProduitsPage() {
  return (
    <div className="page-produits t-cream">
      <header className="produits-hero">
        <AnimatedHeading as="h1" className="display type-giant produits-hero__title" mode="chars" immediate delay={0.1}>
          nos produits
        </AnimatedHeading>
        <p className="lead produits-hero__lead">
          Coffee, matcha, une boisson signature et des cookies. Tout se prend au guichet, tout s&apos;emporte.
        </p>
        <ProductsHeroPalette />
      </header>
      <ProductGallery />
    </div>
  );
}
