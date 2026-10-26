import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { siteConfig } from "@/data/site-config";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransitionProvider } from "@/components/layout/PageTransition";
import { BackToTop } from "@/components/layout/BackToTop";
import { SiteLoader } from "@/components/layout/SiteLoader";
import { localBusinessJsonLd } from "@/lib/seo";

const bricolage = localFont({
  src: "../fonts/bricolage-grotesque-opsz.woff2",
  variable: "--font-bricolage",
  weight: "200 800",
  display: "swap",
  preload: true,
});

const instrument = localFont({
  src: "../fonts/instrument-sans-wght.woff2",
  variable: "--font-instrument",
  weight: "400 700",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Doka Coffee Shop — café de spécialité à emporter, Paris 4e",
    template: "%s — Doka Coffee Shop",
  },
  description: siteConfig.description,
  applicationName: "Doka Coffee Shop",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Doka Coffee Shop",
    images: [
      { url: "/images/doka/doka-identite-logo.webp", width: 1672, height: 941, alt: "Logo doka sur fond orange" },
    ],
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f14323",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${bricolage.variable} ${instrument.variable}`} suppressHydrationWarning>
      <head>
        {/* Active les états « avant animation » uniquement quand JavaScript tourne. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
        />
      </head>
      <body>
        <SiteLoader />
        <a className="skip-link" href="#contenu">
          Aller au contenu
        </a>
        <PageTransitionProvider>
          <Header />
          <main id="contenu" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <BackToTop />
        </PageTransitionProvider>
      </body>
    </html>
  );
}
