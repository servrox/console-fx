import { test as base, expect } from "@playwright/test";

// Local NixOS runs may connect to the explicitly isolated Windows Chrome
// instance. CI uses Playwright's installed Chromium. Every test owns its context.
export const test = base.extend({
  browser: [
    async ({ playwright, launchOptions }, use) => {
      const port = process.env.CONSOLE_FX_CDP_PORT;
      const browser = port
        ? await playwright.chromium.connectOverCDP(`http://127.0.0.1:${port}`)
        : await playwright.chromium.launch(launchOptions);
      await use(browser);
      await browser.close();
    },
    { scope: "worker" },
  ],
});
export { expect };
