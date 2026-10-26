import { test, expect } from "@playwright/test";
import { trackErrors } from "./helpers";

test.describe("Mouvement réduit et accessibilité", () => {
  test.use({ reducedMotion: "reduce" });

  test("14. Mouvement réduit : contenu immédiat, pas d'intro, pas de 3D", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");
    await expect(page.locator(".intro")).toBeHidden();
    await expect(page.getByRole("heading", { level: 1, name: /your coffee/i })).toBeVisible();
    await expect(page.locator(".hero__stage")).toHaveAttribute("data-mode", "poster");
    await expect(page.locator(".hero__poster img")).toBeVisible();
    // les sections narratives restent lisibles sans scroll piloté
    await page.locator("#everyday").scrollIntoViewIfNeeded();
    await expect(page.locator("#ev-title")).toBeVisible();
    await expect(page.locator(".ev-ladder")).toBeVisible();
    // navigation directe, sans nappe (l'en-tête se masque en descendant : on remonte)
    await page.evaluate(() => window.scrollTo(0, 0));
    await page
      .getByRole("navigation", { name: "Navigation principale" })
      .getByRole("link", { name: "La carte" })
      .click();
    await expect(page).toHaveURL(/\/la-carte$/);
    await expect(page.getByRole("heading", { level: 1, name: "la carte" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("Clavier : lien d'évitement, onglets de la carte au clavier", async ({ page }) => {
    await page.goto("/la-carte");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Aller au contenu" })).toBeFocused();
    await page.getByRole("tab", { name: "Tout" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Classiques" })).toBeFocused();
    await expect(page.getByRole("tab", { name: "Classiques" })).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("End");
    await expect(page.getByRole("tab", { name: "Options" })).toHaveAttribute("aria-selected", "true");
  });

  test("Titres : un seul h1 par page", async ({ page }) => {
    for (const p of [
      "/",
      "/la-carte",
      "/nos-favoris",
      "/produits",
      "/produits/latte",
      "/esprit-doka",
      "/le-coffee-shop",
      "/nous-trouver",
    ]) {
      await page.goto(p);
      await expect(page.locator("h1"), p).toHaveCount(1);
    }
  });
});
