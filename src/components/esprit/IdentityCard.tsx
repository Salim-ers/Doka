import clsx from "clsx";
import { DokaLogo } from "@/components/brand/DokaLogo";
import { siteConfig } from "@/data/site-config";

/**
 * L'identité Doka en un visuel : le logo officiel (tracé vectoriel) crème sur orange et
 * ses signatures, en français. Remplace le visuel de campagne dont les textes étaient en anglais.
 */
export function IdentityCard({ className }: { className?: string }) {
  return (
    <figure className={clsx("es-idcard", className)}>
      <div className="es-idcard__logo">
        <DokaLogo title="Logo doka" />
      </div>
      <p className="es-idcard__sign display">{siteConfig.tagline.toLowerCase()}</p>
      <figcaption className="es-idcard__lines">
        <span>café de spécialité — pour tout le monde</span>
        <span>chaud ou glacé · du matin au soir</span>
      </figcaption>
    </figure>
  );
}
