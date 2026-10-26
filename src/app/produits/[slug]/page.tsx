import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, products, formatPrice } from "@/data/products";
import { media } from "@/data/media";
import { ProductDetail } from "@/components/products/ProductDetail";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/data/site-config";

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  const m = p.media ? media[p.media] : null;
  return pageMetadata({
    title: p.name,
    description: `${p.name}${p.price !== null ? ` à ${formatPrice(p.price)}` : ""} chez Doka, coffee shop à emporter rue Rambuteau, Paris 4e. ${p.short}`,
    path: `/produits/${p.slug}`,
    image: m ? { url: m.file, alt: m.alt } : undefined,
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: product.name,
    description: product.description,
    url: `${siteConfig.url}/produits/${product.slug}`,
    ...(product.media ? { image: `${siteConfig.url}${media[product.media].file}` } : {}),
    ...(product.price !== null
      ? { offers: { "@type": "Offer", price: (product.price / 100).toFixed(2), priceCurrency: "EUR" } }
      : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetail product={product} />
    </>
  );
}
