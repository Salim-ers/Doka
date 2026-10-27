import { expect, type Page } from "@playwright/test";

/** Collecte les erreurs console et exceptions de la page. */
export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    // ressources externes bloquées hors ligne (Google Maps n'est jamais chargé sans accord)
    if (/ERR_NAME_NOT_RESOLVED|net::ERR_INTERNET_DISCONNECTED/.test(t)) return;
    errors.push(t);
  });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  return errors;
}

/** Défile progressivement jusqu'en bas pour déclencher toutes les animations au scroll. */
export async function scrollThrough(page: Page, step = 600) {
  await page.evaluate(async (s) => {
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
    for (let y = 0; y < document.documentElement.scrollHeight; y += s) {
      window.scrollTo(0, y);
      await delay(60);
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await delay(400);
  }, step);
}

/** Vérifie que toutes les images de la page sont chargées (aucune image cassée). */
export async function expectNoBrokenImages(page: Page) {
  const broken = await page.evaluate(async () => {
    const imgs = Array.from(document.images);
    await Promise.all(
      imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((r) => {
              img.addEventListener("load", () => r(), { once: true });
              img.addEventListener("error", () => r(), { once: true });
            }),
      ),
    );
    return imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src);
  });
  expect(broken, `Images cassées : ${broken.join(", ")}`).toEqual([]);
}

/** La nappe de transition ne doit jamais rester affichée, ni le contenu rester effacé. */
export async function expectCurtainHidden(page: Page) {
  await expect(page.locator(".page-curtain")).toBeHidden({ timeout: 5000 });
  await expect(page.locator("#contenu")).toHaveCSS("opacity", "1");
}
