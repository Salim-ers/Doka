import type { Metadata } from "next";
import { AnimatedHeading } from "@/components/motion/AnimatedHeading";
import { EspritStory } from "@/components/esprit/EspritStory";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "L'esprit Doka",
  description:
    "Du café de spécialité pour tout le monde. La philosophie de Doka et son guichet rouge du 15 rue Rambuteau (Paris 4e) : un bon café à prix juste, chaud ou glacé, du matin au soir, 100 % à emporter.",
  path: "/esprit-doka",
  image: {
    url: "/images/doka/doka-gobelet-devanture-soir.webp",
    alt: "Un gobelet doka devant la devanture rouge, le soir",
  },
});

export default function EspritPage() {
  return (
    <div className="page-esprit">
      <header className="esprit-hero t-orange">
        <p className="brandline esprit-hero__kicker">l&apos;esprit doka</p>
        <AnimatedHeading as="h1" className="display esprit-hero__title" mode="words" immediate delay={0.1}>
          un excellent café doit pouvoir faire partie du quotidien.
        </AnimatedHeading>
        <p className="esprit-hero__sub">
          Pas un rituel réservé au week-end, pas un luxe. Un bon café, au guichet, à emporter, tous les jours.
        </p>
        <nav className="esprit-hero__jump" aria-label="Sur cette page">
          <a href="#philosophie">Notre philosophie</a>
          <a href="#le-lieu">Le lieu</a>
        </nav>
      </header>
      <EspritStory />
    </div>
  );
}
