import Image from "next/image";
import clsx from "clsx";
import { media } from "@/data/media";
import type { Product } from "@/data/products";

/**
 * Visuel d'un produit.
 * - Photo authentique si elle existe pour CE produit (jamais celle d'un autre).
 * - Sinon, une composition graphique abstraite : la boisson vue de dessus
 *   (cercles de couleur), clairement illustrative, décorative pour les lecteurs d'écran.
 */
const TONES: Record<Product["tone"], { bg: string; rings: string[]; dots?: string }> = {
  espresso: { bg: "#3A1D0C", rings: ["#5B2E12", "#9A5520", "#C9843F"] },
  crema: { bg: "#4B2A14", rings: ["#6E3B18", "#B06A2C", "#D9A066"] },
  milk: { bg: "#E8D3B4", rings: ["#C99766", "#E6C79F", "#F8EDDB"] },
  matcha: { bg: "#4E7A12", rings: ["#6E9A24", "#9CC24A", "#DCEBA8"] },
  cloud: { bg: "#FFFBEA", rings: ["#7FA632", "#B9D67A", "#FFFFFF"] },
  chai: { bg: "#B86F35", rings: ["#C98345", "#E2AB72", "#F6DDBA"] },
  cocoa: { bg: "#3E1F12", rings: ["#5A2E1A", "#7B4126", "#A5633F"] },
  tea: { bg: "#7A3E12", rings: ["#9A5419", "#C27A2B", "#E3AC5C"] },
  cookie: { bg: "#C98B4A", rings: ["#D9A262", "#E6B97D", "#E6B97D"], dots: "#3A1D0C" },
};

export function ProductArt({ tone, className }: { tone: Product["tone"]; className?: string }) {
  const t = TONES[tone];
  return (
    <svg className={clsx("product-art", className)} viewBox="0 0 400 400" aria-hidden="true" focusable="false">
      <rect width="400" height="400" fill={t.bg} />
      <circle className="product-art__ring" cx="200" cy="205" r="150" fill={t.rings[0]} />
      <circle className="product-art__ring" cx="203" cy="200" r="118" fill={t.rings[1]} />
      <path
        className="product-art__ring"
        d="M200 112c48 2 86 36 84 88-2 50-40 82-88 80-46-2-80-38-78-86 2-46 36-84 82-82z"
        fill={t.rings[2]}
      />
      {t.dots &&
        [
          [160, 170, 16],
          [240, 160, 12],
          [225, 238, 18],
          [168, 242, 11],
          [205, 200, 9],
        ].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={t.dots} />)}
      {tone === "cloud" &&
        [
          [150, 180, 34],
          [195, 160, 42],
          [245, 185, 36],
          [215, 225, 30],
        ].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#FFFFFF" opacity="0.9" />)}
    </svg>
  );
}

type Props = {
  product: Product;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** Recadrage forcé ; sinon celui du média, « cover » par défaut. */
  fit?: "cover" | "contain";
  /** Petite vignette carrée (carte, favoris) : recadrée sur la boisson, texte alternatif vide (nom à côté). */
  thumb?: boolean;
};

export function ProductVisual({ product, sizes, className, priority, fit, thumb }: Props) {
  if (product.media) {
    const m = media[product.media];
    const objectFit = thumb ? "cover" : (fit ?? m.fit ?? "cover");
    const focus = (thumb && m.thumb?.focus) || m.focus;
    const zoom = thumb ? m.thumb?.zoom : undefined;
    return (
      <div
        className={clsx("product-visual", "product-visual--photo", className)}
        style={m.matte && objectFit === "contain" ? { background: m.matte } : undefined}
      >
        <Image
          src={m.file}
          alt={thumb ? "" : m.alt}
          fill
          sizes={sizes}
          quality={80}
          priority={priority}
          style={{
            objectFit,
            objectPosition: focus,
            ...(zoom ? { transform: `scale(${zoom})`, transformOrigin: focus } : {}),
          }}
        />
      </div>
    );
  }
  return (
    <div className={clsx("product-visual", "product-visual--art", className)} data-tone={product.tone}>
      <ProductArt tone={product.tone} />
    </div>
  );
}
