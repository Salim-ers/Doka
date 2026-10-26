import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/data/site-config";
import { PrivacyControls } from "@/components/location/PrivacyControls";

export const metadata: Metadata = pageMetadata({
  title: "Confidentialité",
  description:
    "Politique de confidentialité du site Doka Coffee Shop : aucune mesure d'audience, favoris stockés localement, carte Google Maps intégrée.",
  path: "/confidentialite",
});

export default function Confidentialite() {
  return (
    <article className="legal t-cream">
      <h1 className="display type-1">confidentialité</h1>
      <div className="legal__body">
        <section>
          <h2>En résumé</h2>
          <p>
            Ce site ne demande aucun compte, ne contient aucun formulaire et n&apos;utilise ni outil de mesure
            d&apos;audience ni publicité. Aucune donnée personnelle n&apos;est collectée par {siteConfig.legal.company}.
          </p>
        </section>
        <section>
          <h2>Ce qui reste dans ton navigateur</h2>
          <ul>
            <li>
              <strong>Tes favoris</strong> : la liste des produits marqués d&apos;un cœur est enregistrée dans le
              stockage local de ton navigateur (localStorage). Elle n&apos;est jamais envoyée à un serveur.
            </li>
          </ul>
        </section>
        <section>
          <h2>Contenus tiers</h2>
          <p>
            La carte interactive de la page « Nous trouver » est fournie par Google Maps et s&apos;affiche directement
            sur cette page. Google peut alors déposer ses propres cookies, régis par sa politique de confidentialité.
            Les liens vers Instagram et Google Maps ouvrent ces services dans un nouvel onglet.
          </p>
        </section>
        <section>
          <h2>Gérer ces données</h2>
          <PrivacyControls />
        </section>
      </div>
    </article>
  );
}
