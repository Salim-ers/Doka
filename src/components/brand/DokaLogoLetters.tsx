import clsx from "clsx";
import { LOGO_LETTERS, LOGO_VIEWBOX } from "./logo-paths";

/**
 * Logo « doka » décomposé : une couche par lettre, superposées dans le même cadre.
 * Chaque lettre est un élément HTML à part entière, animable en `transform`
 * (calculé par le compositeur du navigateur, donc fluide même si la page travaille).
 * Le dessin reste celui du logo officiel : les lettres bougent, jamais ne se déforment.
 */
export function DokaLogoLetters({ className }: { className?: string }) {
  const box = `0 0 ${LOGO_VIEWBOX.width} ${LOGO_VIEWBOX.height}`;
  return (
    <span
      className={clsx("logo-letters", className)}
      style={{ aspectRatio: `${LOGO_VIEWBOX.width} / ${LOGO_VIEWBOX.height}` }}
      aria-hidden="true"
    >
      {LOGO_LETTERS.map((l) => (
        <svg key={l.id} className="logo-letters__l" data-letter={l.id} viewBox={box} focusable="false">
          <path d={l.d} fill="currentColor" fillRule="evenodd" />
        </svg>
      ))}
    </span>
  );
}
