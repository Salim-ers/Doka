import type { Metadata } from "next";
import { AnimatedHeading } from "@/components/motion/AnimatedHeading";
import { EspritStory } from "@/components/esprit/EspritStory";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "L'esprit Doka",
  description:
    "Specialty coffee, made for all. La philosophie de Doka : un excellent café doit pouvoir faire partie du quotidien, à prix juste, chaud ou glacé, du matin au soir.",
  path: "/esprit-doka",
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
      </header>
      <EspritStory />
    </div>
  );
}
