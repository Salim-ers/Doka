import { defineConfig, devices } from "@playwright/test";

/**
 * Tests de parcours Doka.
 * - Par défaut : navigateurs Playwright (`npx playwright install chromium`).
 * - CHROME_PATH=/chemin/vers/chromium : utilise un Chromium existant (CI, conteneurs).
 * Le serveur de production est lancé automatiquement (build préalable requis : `npm run build`).
 */
const exe = process.env.CHROME_PATH;
const launchOptions = exe
  ? {
      executablePath: exe,
      args: [
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--use-angle=swiftshader",
        "--enable-unsafe-swiftshader",
        "--ignore-gpu-blocklist",
      ],
    }
  : {};
const PORT = Number(process.env.PORT ?? 3200);

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    launchOptions,
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, launchOptions },
      testIgnore: /mobile\.spec\.ts/,
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], launchOptions },
      testMatch: /mobile\.spec\.ts/,
    },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
