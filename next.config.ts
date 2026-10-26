import type { NextConfig } from "next";
import { renamedSlugs } from "./src/data/products";

const nextConfig: NextConfig = {
  // Site éditorial entièrement statique : on garde le modèle de rendu classique
  // (les routes quittées sont démontées), ce qui garantit le nettoyage des
  // timelines GSAP / ScrollTrigger et de la scène WebGL à chaque navigation.
  cacheComponents: false,
  poweredByHeader: false,
  // pas de badge de dev : il apparaîtrait dans les rendus de la scène (posters, vidéo)
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 80, 90],
    deviceSizes: [480, 640, 828, 1080, 1280, 1672],
    imageSizes: [96, 160, 256, 384],
    localPatterns: [{ pathname: "/images/doka/**", search: "" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Pages fusionnées (« Nos produits » dans « La carte », « Le coffee shop » dans « L'esprit Doka »)
  // et fiches produits renommées en français : les anciennes adresses restent valides.
  async redirects() {
    return [
      { source: "/produits", destination: "/la-carte", permanent: true },
      { source: "/le-coffee-shop", destination: "/esprit-doka#le-lieu", permanent: true },
      ...Object.entries(renamedSlugs).map(([from, to]) => ({
        source: `/produits/${from}`,
        destination: `/produits/${to}`,
        permanent: true,
      })),
    ];
  },
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
