"use client";

import { useRef } from "react";
import { MapPin } from "lucide-react";
import { InstagramGlyph } from "@/components/ui/icons";
import { gsap, useGSAP } from "@/lib/gsap";
import { RevealImage } from "@/components/motion/RevealImage";
import { DokaButton } from "@/components/ui/DokaButton";
import { siteConfig } from "@/data/site-config";

/**
 * L'adresse : « 15 rue rambuteau » en très grand, la façade qui passe d'un cadre
 * à la pleine largeur, puis le fond bascule du crème à l'orange signature,
 * qui se prolonge dans le footer.
 */
export function AddressSection() {
  const root = useRef<HTMLElement>(null);
  const { address, maps, instagram } = siteConfig;

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".ad-photo",
          { "--inset": "14%" },
          {
            "--inset": "0%",
            ease: "none",
            scrollTrigger: { trigger: ".ad-photo", start: "top 90%", end: "center 50%", scrub: 0.5 },
          },
        );
        gsap.to(el, {
          "--ad-bg": "#F14323",
          "--ad-fg": "#FFFBEA",
          "--ad-soft": "#171714",
          ease: "none",
          scrollTrigger: { trigger: ".ad-bottom", start: "top 85%", end: "top 35%", scrub: true },
        });
        gsap.from(".ad-number", {
          yPercent: 60,
          autoAlpha: 0,
          duration: 1.2,
          ease: "doka.pop",
          scrollTrigger: { trigger: ".ad-title", start: "top 85%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="ad" aria-labelledby="ad-title">
      <h2 id="ad-title" className="ad-title display">
        <span className="ad-number">15</span> rue rambuteau
      </h2>
      <p className="ad-sub">
        {address.district}, dans le Marais. Un guichet rouge sur la rue, le café se prend à emporter.
      </p>
      <RevealImage id="facade" reveal="none" className="ad-photo" sizes="100vw" parallax={6} />
      <div className="ad-bottom">
        <p className="ad-big display">viens prendre ton café.</p>
        <div className="ad-ctas">
          <DokaButton
            href={maps.directions}
            external
            variant="ink"
            size="lg"
            icon={<MapPin size={18} strokeWidth={2.4} />}
          >
            Itinéraire
          </DokaButton>
          <DokaButton href="/esprit-doka#le-lieu" variant="cream" size="lg">
            Découvrir le lieu
          </DokaButton>
          <DokaButton href={instagram.url} external variant="outline" size="lg" icon={<InstagramGlyph />}>
            Instagram
          </DokaButton>
        </div>
      </div>
    </section>
  );
}
