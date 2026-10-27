import clsx from "clsx";
import { DokaLogo } from "@/components/brand/DokaLogo";
import { bringYourOwnCup, drinkOptions, formatPrice, products } from "@/data/products";

/**
 * Le tableau de la carte, tel qu'au guichet mais en français : rubriques en minuscules,
 * lignes nom … prix. Généré depuis le catalogue (src/data/products.ts), donc toujours à jour.
 * Remplace la photo du tableau officiel, dont les rubriques étaient en anglais.
 */
export function BoardCard({ className }: { className?: string }) {
  const classiques = products.filter((p) => p.family !== "sweet" && !p.signature);
  const specialites = products.filter((p) => p.signature);
  const offertes = drinkOptions.filter((o) => o.price === 0);
  const payantes = drinkOptions.filter((o) => o.price > 0);

  return (
    <figure className={clsx("es-tableau", className)} aria-label="Le tableau de la carte Doka">
      <div className="es-tableau__cols">
        <section>
          <h3 className="es-tableau__h display">classiques</h3>
          <ul>
            {classiques.map((p) => (
              <li key={p.slug}>
                <span>{p.name}</span>
                <span className="es-tableau__dots" aria-hidden="true" />
                <span className="price">{formatPrice(p.price, { currency: false })}</span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="es-tableau__h display">spécialités</h3>
          <ul>
            {specialites.map((p) => (
              <li key={p.slug}>
                <span>{p.name}</span>
                <span className="es-tableau__dots" aria-hidden="true" />
                <span className="price">{formatPrice(p.price, { currency: false })}</span>
              </li>
            ))}
          </ul>
          <h3 className="es-tableau__h display">options offertes</h3>
          <ul>
            {offertes.map((o) => (
              <li key={o.id}>
                <span>{o.label}</span>
                <span className="es-tableau__dots" aria-hidden="true" />
                <span className="price">0</span>
              </li>
            ))}
          </ul>
          <h3 className="es-tableau__h display">options</h3>
          <ul>
            {payantes.map((o) => (
              <li key={o.id}>
                <span>{o.label}</span>
                <span className="es-tableau__dots" aria-hidden="true" />
                <span className="price">{formatPrice(o.price, { signed: true, currency: false })}</span>
              </li>
            ))}
          </ul>
          <p className="es-tableau__byoc">
            {bringYourOwnCup.label} ! <span className="price">{formatPrice(-bringYourOwnCup.discount)}</span>
          </p>
        </section>
      </div>
      <figcaption className="es-tableau__foot">
        <span>Prix en euros</span>
        <span className="es-tableau__logo" aria-hidden="true">
          <DokaLogo title={null} />
        </span>
      </figcaption>
    </figure>
  );
}
