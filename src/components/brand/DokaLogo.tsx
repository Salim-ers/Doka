import { LOGO_LETTERS, LOGO_VIEWBOX } from "./logo-paths";

type Props = {
  className?: string;
  /** Texte accessible. Passer `null` pour un logo décoratif (aria-hidden). */
  title?: string | null;
  style?: React.CSSProperties;
};

/**
 * Logo officiel « doka », tracé vectoriel fidèle au visuel de marque.
 * Couleur = currentColor. Les quatre lettres sont des <path> séparés
 * (data-letter) pour pouvoir les animer sans jamais déformer le dessin.
 */
export function DokaLogo({ className, title = "Doka", style }: Props) {
  const decorative = title === null;
  return (
    <svg
      className={className}
      style={style}
      viewBox={`0 0 ${LOGO_VIEWBOX.width} ${LOGO_VIEWBOX.height}`}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : title}
      focusable="false"
    >
      {LOGO_LETTERS.map((l) => (
        <path key={l.id} data-letter={l.id} d={l.d} fill="currentColor" fillRule="evenodd" />
      ))}
    </svg>
  );
}

export const LOGO_RATIO = LOGO_VIEWBOX.width / LOGO_VIEWBOX.height;
