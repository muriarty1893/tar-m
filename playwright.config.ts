import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "tr-TR",
    // Visitors who already answered the first-visit welcome question (tests/e2e/welcome.spec.ts starts fresh).
    storageState: "tests/e2e/state/welcome-seen.json",
    // Hardware WebGL: the site skips the 3D phone on software renderers (headless default).
    // Hardware video decoding is off: on this Intel/Mesa machine it crashes the GPU process under
    // forced ANGLE GL, which takes WebGL (the 3D demo) down with it once the hero video plays.
    launchOptions: { args: ["--use-angle=gl", "--disable-accelerated-video-decode"] },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npm run build && npm start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: {
      APPS_SCRIPT_URL: "http://localhost:9/not-used-in-e2e",
      NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
    },
  },
});
