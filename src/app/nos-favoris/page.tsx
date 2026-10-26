import type { Metadata } from "next";
import { AnimatedHeading } from "@/components/motion/AnimatedHeading";
import { EditorialSelection } from "@/components/favorites/EditorialSelection";
import { FavoritesBoard } from "@/components/favorites/FavoritesBoard";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Nos favoris",
  description:
    "Les incontournables de Doka (espresso, latte, matcha latte, nuage coco-matcha) et tes propres favoris, enregistrés dans ton navigateur.",
  path: "/nos-favoris",
});

export default function FavorisPage() {
  return (
    <div className="page-favoris">
      <header className="favoris-hero t-orange">
        <AnimatedHeading as="h1" className="display type-giant" mode="chars" immediate delay={0.1}>
          nos favoris.
        </AnimatedHeading>
        <nav className="favoris-hero__jump" aria-label="Sur cette page">
          <a href="#selection">La sélection Doka</a>
          <a href="#mes-favoris">Mes favoris</a>
        </nav>
      </header>

      <section id="selection" className="favoris-sel t-cream" aria-labelledby="sel-title">
        <div className="favoris-sel__head">
          <AnimatedHeading id="sel-title" className="display type-2" mode="words">
            la sélection doka
          </AnimatedHeading>
          <p className="lead">Quatre boissons qu&apos;on recommande sans hésiter.</p>
        </div>
        <EditorialSelection />
      </section>

      <section id="mes-favoris" className="favoris-mine t-paper" aria-labelledby="mine-title">
        <AnimatedHeading id="mine-title" className="display type-2" mode="words">
          mes favoris
        </AnimatedHeading>
        <FavoritesBoard />
      </section>
    </div>
  );
}
