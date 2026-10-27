"use client";

import { useRef } from "react";
import clsx from "clsx";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";
import { entranceDelay } from "@/lib/entrance";

type Tag = "h1" | "h2" | "h3" | "p";
type Mode = "lines" | "words" | "chars";

type Props = {
  as?: Tag;
  children: React.ReactNode;
  className?: string;
  id?: string;
  /** lines : masque par ligne · words : mots qui montent · chars : lettres qui tombent en place */
  mode?: Mode;
  /** Démarrer immédiatement (hero) plutôt qu'au scroll. */
  immediate?: boolean;
  delay?: number;
  start?: string;
};

/**
 * Titre révélé par masques (SplitText). Le texte reste un vrai titre sémantique :
 * SplitText ajoute aria-label sur l'élément et masque les fragments aux lecteurs d'écran.
 */
export function AnimatedHeading({
  as: Tag = "h2",
  children,
  className,
  id,
  mode = "lines",
  immediate = false,
  delay = 0,
  start = "top 92%",
}: Props) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let anim: gsap.core.Tween | null = null;
        const split = SplitText.create(el, {
          type: mode === "chars" ? "lines,words,chars" : mode === "words" ? "lines,words" : "lines",
          mask: "lines",
          linesClass: "split-line",
          wordsClass: "split-word",
          autoSplit: true,
          // aria-label n'est autorisé que sur les titres ; un paragraphe garde son texte tel quel
          aria: Tag === "p" ? "none" : "auto",
          onSplit(self) {
            const targets = mode === "chars" ? self.chars : mode === "words" ? self.words : self.lines;
            el.removeAttribute("data-reveal");
            anim?.kill();
            anim = gsap.from(targets, {
              yPercent: mode === "chars" ? 120 : 108,
              rotate: mode === "chars" ? (i: number) => (i % 2 ? 8 : -8) : 0,
              duration: mode === "chars" ? 0.7 : 0.85,
              ease: mode === "chars" ? "doka.pop" : "doka.out",
              stagger: mode === "chars" ? 0.02 : mode === "words" ? 0.04 : 0.07,
              delay: immediate ? delay + entranceDelay() : delay,
              scrollTrigger: immediate ? undefined : { trigger: el, start, once: true },
            });
            return anim;
          },
        });
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} className={clsx(className)} data-reveal={immediate ? "hero" : undefined}>
      {children}
    </Tag>
  );
}
