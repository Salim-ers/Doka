import { test, expect } from "@playwright/test";
import { trackErrors, scrollThrough, expectNoBrokenImages, expectCurtainHidden } from "./helpers";

test.describe("Parcours principal", () => {
  test("1-2. Accueil : arrivée puis parcours complet jusqu'au footer", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: /ton café/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Découvrir la carte" }).first()).toBeVisible();
    // grand écran : la navigation est dans l'en-tête, pas de barre du bas
    await expect(page.getByRole("navigation", { name: "Accès rapide" })).toBeHidden();
    await scrollThrough(page);
    await expect(page.locator(".site-footer")).toBeInViewport();
    await expect(page.getByRole("heading", { name: /15 rue rambuteau/i })).toBeAttached();
    await expectNoBrokenImages(page);
    expect(errors).toEqual([]);
  });

  test("Accueil : le dialogue au guichet s'affiche, jamais de bulle vide", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");
    // une réplique apparaît dans la boucle de 12 s de la scène
    const shown = page.locator(".hero-talk[data-show] .hero-talk__bubble");
    await expect(shown.first()).toBeVisible({ timeout: 20_000 });
    await expect(shown.first()).toHaveText(/\S/);
    // sur la suite de la boucle, toute bulle affichée a un texte
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(700);
      const texts = await page.$$eval(".hero-talk[data-show]", (els) => els.map((e) => e.textContent?.trim() ?? ""));
      for (const t of texts) expect(t).not.toBe("");
    }
    expect(errors).toEqual([]);
  });

  test("3-8. Carte, filtre, fiche produit, favori persistant puis supprimé", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");
    await page.getByRole("link", { name: "Découvrir la carte" }).first().click();
    await expect(page).toHaveURL(/\/la-carte$/);
    await expect(page.getByRole("heading", { level: 1, name: "la carte" })).toBeVisible();
    await expectCurtainHidden(page);

    // 4. filtrer
    await page.getByRole("tab", { name: "Matcha" }).click();
    await expect(page).toHaveURL(/categorie=matcha/);
    const list = page.locator("#carte-liste");
    await expect(list.getByRole("link", { name: "Matcha latte", exact: true })).toBeVisible();
    await expect(list.getByRole("link", { name: /Nuage coco-matcha/ })).toBeVisible();
    await expect(list.getByRole("link", { name: "Espresso", exact: true })).toBeHidden();
    await page.getByRole("tab", { name: "Options" }).click();
    await expect(page.locator(".mb-options").getByText("Sirop vanille ou caramel", { exact: true })).toBeVisible();
    await page.getByRole("tab", { name: "Tout" }).click();
    await expect(list.getByRole("link", { name: "Espresso", exact: true })).toBeVisible();

    // 5. consulter un produit
    await list.getByRole("link", { name: "Matcha latte", exact: true }).click();
    await expect(page).toHaveURL(/\/produits\/matcha-latte$/);
    await expect(page.getByRole("heading", { level: 1, name: /matcha latte/i })).toBeVisible();
    await expect(page.getByText("4,00 €").first()).toBeAttached();

    // 6. ajouter un favori
    const fav = page.locator(".pd-actions").getByRole("button", { name: /favoris/i });
    await fav.click();
    await expect(fav).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("link", { name: "Mes favoris : 1" })).toBeVisible();

    // 7. actualiser : le favori est toujours là
    await page.reload();
    await expect(page.locator(".pd-actions").getByRole("button", { name: /favoris/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.getByRole("link", { name: "Mes favoris : 1" })).toBeVisible();

    // 8. supprimer depuis « Nos favoris »
    await page.getByRole("link", { name: "Mes favoris : 1" }).click();
    await expect(page).toHaveURL(/\/nos-favoris$/);
    await page.getByRole("button", { name: "Retirer Matcha latte des favoris" }).click();
    await expect(page.getByText(/rien ici, pour l.instant/i)).toBeVisible();
    await expect(page.getByRole("link", { name: "Mes favoris : 0" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("9-11. L'esprit Doka et le lieu, visionneuse, itinéraire et carte, retour à l'accueil", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Navigation principale" })
      .getByRole("link", { name: "L'esprit Doka" })
      .click();
    await expect(page).toHaveURL(/\/esprit-doka$/);
    await expect(page.getByRole("heading", { level: 1, name: /un excellent café/ })).toBeVisible();
    await expectCurtainHidden(page);
    await page.locator("#le-lieu").scrollIntoViewIfNeeded();
    await expect(page.getByRole("heading", { level: 2, name: "le lieu" })).toBeAttached();

    await page.getByRole("button", { name: "Agrandir la photo" }).first().click();
    const dialog = page.getByRole("dialog", { name: "Photo agrandie" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(dialog.getByText("2 / 2")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    // 10. itinéraire (lien externe Google Maps, nouvel onglet)
    await page.goto("/nous-trouver");
    const itin = page.getByRole("link", { name: /Itinéraire/ }).first();
    await expect(itin).toHaveAttribute("href", /google\.com\/maps\/dir\/\?api=1&destination=/);
    await expect(itin).toHaveAttribute("target", "_blank");
    await expect(page.locator(".map iframe")).toHaveAttribute("src", /google\.com\/maps/); // vraie carte Google Maps

    // 11. retour à l'accueil par le logo
    await page.getByRole("link", { name: "Doka, retour à l'accueil" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expectCurtainHidden(page);
    expect(errors).toEqual([]);
  });

  test("13. Navigation rapide entre les pages, précédent / suivant", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/la-carte");
    const nav = page.getByRole("navigation", { name: "Navigation principale" });
    for (const name of ["L'esprit Doka", "Nous trouver", "Accueil", "Nos favoris"]) {
      await nav.getByRole("link", { name }).click();
      await page.waitForTimeout(120);
    }
    await expect(page).toHaveURL(/\/nos-favoris$/);
    await expectCurtainHidden(page);
    await expect(page.locator("main")).toBeVisible();
    await page.goBack();
    await expect(page).not.toHaveURL(/\/nos-favoris$/);
    await page.goForward();
    await expect(page).toHaveURL(/\/nos-favoris$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("15. Toutes les pages : statut 200, sans erreur ni image cassée", async ({ page, request }) => {
    const paths = [
      "/",
      "/la-carte",
      "/nos-favoris",
      "/produits/espresso",
      "/produits/nuage-coco-matcha",
      "/produits/cookies",
      "/esprit-doka",
      "/nous-trouver",
      "/mentions-legales",
      "/confidentialite",
      "/sitemap.xml",
      "/robots.txt",
    ];
    for (const p of paths) {
      const res = await request.get(p);
      expect(res.status(), p).toBe(200);
    }
    // liens internes : aucun lien mort
    const seen = new Set<string>();
    for (const p of paths.filter((x) => !x.endsWith(".xml") && !x.endsWith(".txt"))) {
      const errors = trackErrors(page);
      await page.goto(p);
      await scrollThrough(page, 900);
      await expectNoBrokenImages(page);
      const hrefs = await page.$$eval("a[href^='/']", (as) => as.map((a) => a.getAttribute("href")!.split("#")[0]));
      hrefs.forEach((h) => h && seen.add(h));
      expect(errors, p).toEqual([]);
    }
    for (const h of seen) {
      const res = await request.get(h);
      expect(res.status(), `lien interne ${h}`).toBe(200);
    }
    expect((await request.get("/page-inexistante")).status()).toBe(404);
    // pages fusionnées et fiches renommées : redirections permanentes
    for (const [from, to] of [
      ["/produits", "/la-carte"],
      ["/le-coffee-shop", "/esprit-doka#le-lieu"],
      ["/produits/coconut-matcha-cloud", "/produits/nuage-coco-matcha"],
    ]) {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status(), from).toBe(308);
      expect(res.headers()["location"], from).toBe(to);
    }
  });
});
