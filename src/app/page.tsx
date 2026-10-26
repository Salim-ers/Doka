import type { Metadata } from "next";
import { HeroExperience } from "@/components/home/hero/HeroExperience";
import { IntroOverlay } from "@/components/home/IntroOverlay";
import { EverydayCoffee } from "@/components/home/EverydayCoffee";
import { Incontournables } from "@/components/home/Incontournables";
import { MatchaSection } from "@/components/home/MatchaSection";
import { CoffeeMoment } from "@/components/home/CoffeeMoment";
import { CoinGourmand } from "@/components/home/CoinGourmand";
import { AddressSection } from "@/components/home/AddressSection";
import { CoffeeFlow } from "@/components/motion/CoffeeFlow";
import { pageMetadata } from "@/lib/seo";
import { formatPrice, productsBySlug } from "@/data/products";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Doka Coffee Shop — café de spécialité à emporter, Paris 4e",
    description: `Doka, coffee shop 100 % à emporter au 15 rue Rambuteau (Paris 4e). Espresso à ${formatPrice(productsBySlug.espresso.price)}, latte, matcha, Coconut Matcha Cloud et cookies. Made for every day.`,
    path: "/",
  }),
  title: { absolute: "Doka Coffee Shop — café de spécialité à emporter, Paris 4e" },
};

export default function Home() {
  return (
    <>
      <IntroOverlay />
      <HeroExperience />
      <EverydayCoffee />
      <Incontournables />
      <CoffeeFlow from="var(--cream)" to="var(--matcha-deep)" lead="#9CC24A" />
      <MatchaSection />
      <CoffeeFlow from="var(--matcha-deep)" to="var(--espresso)" lead="#C27A37" />
      <CoffeeMoment />
      <CoinGourmand />
      <AddressSection />
    </>
  );
}
