import { test, expect } from "@playwright/test";
import { trackErrors, scrollThrough, expectNoBrokenImages, expectCurtainHidden } from "./helpers";

/** Hauteur maximale de chaque page sur téléphone et tablette, en nombre d'écrans. */
const BUDGET: Record<string, number> = {
  "/": 7,
  "/la-carte": 4,
  "/nos-favoris": 3.5,
  "/esprit-doka": 6,
  "/nous-trouver": 3.5,
  "/produits/latte": 3.5,
};

test("Téléphone et tablette : chaque page tient dans son budget de défilement", async ({ page }) => {
  for (const [path, screens] of Object.entries(BUDGET)) {
    await page.goto(path);
    const measured = await page.evaluate(() => document.documentElement.scrollHeight / window.innerHeight);
    expect(measured, path).toBeLessThanOrEqual(screens);
  }
});

test("Téléphone et tablette : aucune section ne capte le défilement", async ({ page }) => {
  const errors = trackErrors(page);
  const viewport = page.viewportSize()!.height;
  await page.goto("/");
  await expect(page.locator(".ev")).not.toHaveClass(/is-animated/);
  await expect(page.locator(".inc")).not.toHaveClass(/is-scrubbed/);
  const hero = await page.locator(".hero").boundingBox();
  expect(hero!.height).toBeLessThanOrEqual(Math.max(viewport, 560) + 1);
  await scrollThrough(page);
  await expectNoBrokenImages(page);

  await page.goto("/esprit-doka");
  await expect(page.locator(".es")).not.toHaveClass(/is-animated/);
  const lieu = await page.locator(".cs-open").boundingBox();
  expect(lieu!.height).toBeLessThanOrEqual(viewport);
  await scrollThrough(page);
  await expect(page.locator(".ch-item").last()).toBeVisible();
  expect(errors).toEqual([]);
});

test("Téléphone et tablette : le prix compte à l'arrivée, l'échelle des prix suit", async ({ page }) => {
  await page.goto("/");
  await page.locator("#everyday").scrollIntoViewIfNeeded();
  await expect(page.locator("#everyday [data-inline-value]")).toHaveText("1,50");
  await page.locator(".ev-ladder").scrollIntoViewIfNeeded();
  await expect(page.locator(".ev-ladder__row")).toHaveCount(4);
  await expect(page.locator(".ev-ladder__row").first()).toBeVisible();
});

test("Téléphone et tablette : les cartes de « Nos favoris » ouvrent la fiche, le cœur reste séparé", async ({
  page,
}) => {
  const errors = trackErrors(page);
  await page.goto("/nos-favoris");
  const card = page.locator(".sel-item").first();
  const fav = card.getByRole("button", { name: /favoris/i });
  await fav.click();
  await expect(fav).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveURL(/\/nos-favoris$/);
  await expect(card.getByRole("link", { name: "Voir la fiche Espresso" })).toBeAttached();
  // toute la carte ouvre la fiche : un vrai toucher au centre, le lien lui-même n'a pas de taille
  const box = (await card.boundingBox())!;
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page).toHaveURL(/\/produits\/espresso$/);
  await expectCurtainHidden(page);
  expect(errors).toEqual([]);
});

test("Les visuels générés par IA sont signalés comme tels", async ({ page }) => {
  for (const slug of ["latte", "matcha-latte", "nuage-coco-matcha"]) {
    await page.goto(`/produits/${slug}`);
    await expect(page.locator(".pd-caption"), slug).toContainText("Visuel généré par IA");
  }
  await page.goto("/produits/espresso");
  await expect(page.locator(".pd-caption")).toContainText("Photo :");
});
