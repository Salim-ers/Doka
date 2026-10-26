import type { Metadata } from "next";
import { ImageGallery } from "@/components/gallery/ImageGallery";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Le coffee shop",
  description:
    "La devanture rouge de Doka au 15 rue Rambuteau, Paris 4e : un guichet ouvert sur la rue, du café de spécialité 100 % à emporter.",
  path: "/le-coffee-shop",
  image: {
    url: "/images/doka/doka-gobelet-devanture-soir.webp",
    alt: "Un gobelet doka devant la devanture rouge, le soir",
  },
});

export default function CoffeeShopPage() {
  return <ImageGallery />;
}
