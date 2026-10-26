import type { Metadata } from "next";
import { AnimatedHeading } from "@/components/motion/AnimatedHeading";
import { LocationCard } from "@/components/location/LocationCard";
import { Faq } from "@/components/location/Faq";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/data/site-config";
import { bringYourOwnCup, drinkOptions, formatPrice } from "@/data/products";

export const metadata: Metadata = pageMetadata({
  title: "Nous trouver",
  description:
    "Doka Coffee Shop, 15 rue Rambuteau, 75004 Paris : horaires, itinéraire, accès métro. Café de spécialité 100 % à emporter.",
  path: "/nous-trouver",
});

const iced = drinkOptions.find((o) => o.id === "iced");
const oat = drinkOptions.find((o) => o.id === "oat");

const faq = [
  {
    q: "Peut-on s'installer sur place ?",
    a: "Non : Doka est un coffee shop 100 % à emporter. On commande au guichet et on repart avec son gobelet.",
  },
  {
    q: "Y a-t-il du lait végétal ?",
    a: `Oui, du lait d'avoine${oat?.price === 0 ? ", sans supplément" : ""}.`,
  },
  {
    q: "Les boissons existent-elles en version glacée ?",
    a: `Oui, la version glacée est une option de la carte${iced?.price === 0 ? ", sans supplément" : ""}. Demande au guichet pour la boisson qui te tente.`,
  },
  {
    q: "Je peux venir avec mon propre gobelet ?",
    a: `Avec plaisir : ta boisson coûte alors ${formatPrice(bringYourOwnCup.discount)} de moins.`,
  },
];

export default function NousTrouverPage() {
  return (
    <div className="page-trouver t-cream">
      <header className="trouver-hero">
        <AnimatedHeading as="h1" className="display trouver-hero__title" mode="chars" immediate delay={0.1}>
          nous trouver
        </AnimatedHeading>
        <p className="trouver-hero__addr display" aria-hidden="true">
          <span>{siteConfig.address.street.split(" ")[0]}</span>{" "}
          {siteConfig.address.street.split(" ").slice(1).join(" ")}
        </p>
        <p className="lead">
          Dans le Marais, {siteConfig.address.district}. Un guichet rouge sur la rue : on commande, on emporte.
        </p>
      </header>

      <LocationCard />

      <section className="trouver-faq" aria-labelledby="faq-title">
        <AnimatedHeading id="faq-title" className="display type-2" mode="words">
          bon à savoir
        </AnimatedHeading>
        <Faq items={faq} />
      </section>
    </div>
  );
}
