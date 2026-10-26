import { test, expect } from "@playwright/test";
import { trackErrors, expectCurtainHidden } from "./helpers";

test("12. Menu mobile : ouverture, focus, navigation, fermeture", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Menu" });
  await expect(toggle).toBeVisible();
  await toggle.click();
  const menu = page.getByRole("dialog", { name: "Menu" });
  await expect(menu).toBeVisible();
  await expect(page.getByRole("button", { name: "Fermer" })).toBeFocused();
  await expect(page.locator("body")).toHaveClass(/is-locked/);
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(toggle).toBeFocused();

  await toggle.click();
  await menu.getByRole("link", { name: "nous trouver" }).click();
  await expect(page).toHaveURL(/\/nous-trouver$/);
  await expect(menu).toBeHidden();
  await expectCurtainHidden(page);
  await expect(page.locator("body")).not.toHaveClass(/is-locked/);
  // pas de débordement horizontal
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  expect(errors).toEqual([]);
});

test("Mobile : carrousel des incontournables au toucher, pas de débordement", async ({ page }) => {
  await page.goto("/");
  for (const p of ["/", "/la-carte", "/produits/latte", "/nous-trouver", "/esprit-doka"]) {
    await page.goto(p);
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
    });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, p).toBeLessThanOrEqual(1);
  }
  await page.goto("/");
  const viewport = page.locator(".inc-viewport");
  await viewport.scrollIntoViewIfNeeded();
  await expect(viewport).toBeVisible();
  const scrollable = await viewport.evaluate((el) => el.scrollWidth > el.clientWidth);
  expect(scrollable).toBe(true);
});

test("Mobile : barre du bas « La carte » et « Itinéraire »", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/nous-trouver");
  const dock = page.getByRole("navigation", { name: "Accès rapide" });
  await expect(dock).toBeVisible();
  const itin = dock.getByRole("link", { name: /Itinéraire/ });
  await expect(itin).toHaveAttribute("href", /google\.com\/maps\/dir\/\?api=1&destination=/);
  await expect(itin).toHaveAttribute("target", "_blank");
  // la barre ne masque pas la fin de la page : le pied de page reste lisible au-dessus
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const legal = page.locator(".footer-legal");
  const [legalBox, dockBox] = await Promise.all([legal.boundingBox(), dock.boundingBox()]);
  expect(legalBox!.y + legalBox!.height).toBeLessThanOrEqual(dockBox!.y);
  await dock.getByRole("link", { name: "La carte" }).click();
  await expect(page).toHaveURL(/\/la-carte$/);
  await expectCurtainHidden(page);
  await expect(dock.getByRole("link", { name: "La carte" })).toHaveAttribute("aria-current", "page");
  expect(errors).toEqual([]);
});
