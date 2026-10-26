import type { Metadata } from "next";
import { siteConfig } from "@/data/site-config";
import { pageMetadata } from "@/lib/seo";
import { products } from "@/data/products";
import { media } from "@/data/media";

export const metadata: Metadata = pageMetadata({
  title: "Mentions légales",
  description: "Mentions légales du site Doka Coffee Shop : éditeur, hébergeur, propriété intellectuelle.",
  path: "/mentions-legales",
});

/** Photos d'illustration libres de droits utilisées pour les produits sans photo Doka. */
const credits = products.flatMap((p) => {
  const credit = p.media ? media[p.media].credit : undefined;
  return credit ? [{ product: p.name, credit }] : [];
});

export default function MentionsLegales() {
  const l = siteConfig.legal;
  return (
    <article className="legal t-cream">
      <h1 className="display type-1">mentions légales</h1>
      <div className="legal__body">
        <section>
          <h2>Éditeur du site</h2>
          <p>
            {l.company}, {l.form} au capital de {l.capital}
            <br />
            Siège social : {l.headOffice}
            <br />
            SIREN {l.siren} — {l.rcs}
            <br />
            SIRET du siège : {l.siret}
            <br />
            TVA intracommunautaire : {l.vat}
          </p>
          <p>
            Établissement : Doka Coffee Shop, {siteConfig.address.full}
            <br />
            Directeur de la publication : {l.publicationDirector}
            <br />
            Contact :{" "}
            {l.contactEmail ? (
              <a href={`mailto:${l.contactEmail}`}>{l.contactEmail}</a>
            ) : (
              <>
                via Instagram,{" "}
                <a href={siteConfig.instagram.url} target="_blank" rel="noopener noreferrer">
                  {siteConfig.instagram.handle}
                </a>
              </>
            )}
          </p>
        </section>
        <section>
          <h2>Hébergement</h2>
          <p>
            {l.host.name}, {l.host.address}. <a href={l.host.url}>{l.host.url.replace("https://", "")}</a>
          </p>
        </section>
        <section>
          <h2>Propriété intellectuelle</h2>
          <p>
            Le nom Doka, le logo, les photographies et les visuels présents sur ce site appartiennent à {l.company} ou
            sont utilisés avec son autorisation, à l&apos;exception des photos libres de droits listées ci-dessous.
            Toute reproduction sans accord préalable est interdite.
          </p>
          <p>
            La scène 3D de la page d&apos;accueil est une illustration de la devanture et du service à emporter ; elle
            ne constitue pas une photographie du lieu ou des produits.
          </p>
        </section>
        {credits.length > 0 && (
          <section>
            <h2>Crédits photos</h2>
            <p>
              Certaines boissons sont illustrées par des photos libres de droits (domaine public ou licence CC0), en
              attendant des photos Doka :
            </p>
            <ul>
              {credits.map(({ product, credit }) => (
                <li key={product}>
                  {product} : photo de {credit.author}, {credit.license} —{" "}
                  <a href={credit.source} target="_blank" rel="noopener noreferrer">
                    voir la source<span className="sr-only"> (nouvel onglet)</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
        <section>
          <h2>Prix et informations</h2>
          <p>
            Les prix et horaires affichés sont donnés à titre indicatif et peuvent évoluer. Les prix en vigueur sont
            ceux affichés au guichet.
          </p>
        </section>
      </div>
    </article>
  );
}
