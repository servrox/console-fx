import { test as base, expect } from "@playwright/test";

// Local NixOS runs may connect to an explicitly isolated Windows Chromium
// instance. Other runs launch the selected engine. Every test owns its context.
export const test = base.extend<{
  clipboard: { readText: () => Promise<string> };
}>({
  context: async ({ context }, use, testInfo) => {
    if (!process.env.CONSOLE_FX_CDP_PORT) {
      await use(context);
      return;
    }
    // Framework tracing visits every context imported over CDP, including tabs
    // this test does not own. Preserve action/DOM diagnostics for this context
    // only; native screencasts can starve screenshot stability checks of frames.
    await context.tracing.start({
      screenshots: false,
      snapshots: true,
      sources: true,
    });
    try {
      await use(context);
    } finally {
      const path =
        testInfo.status !== testInfo.expectedStatus
          ? testInfo.outputPath("trace.zip")
          : undefined;
      await context.tracing.stop(path ? { path } : undefined);
      if (path)
        await testInfo.attach("trace", {
          path,
          contentType: "application/zip",
        });
    }
  },
  clipboard: async ({ page, context, browserName }, use) => {
    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await use({
        readText: () => page.evaluate(() => navigator.clipboard.readText()),
      });
      return;
    }
    // Firefox/WebKit cannot grant Chromium's clipboard permissions. Observe a
    // successful native write instead; do not mock a success or claim readback.
    await page.addInitScript(() => {
      const write = navigator.clipboard.writeText.bind(navigator.clipboard);
      navigator.clipboard.writeText = async (text) => {
        await write(text);
        (
          window as unknown as { completedClipboardWrite: string }
        ).completedClipboardWrite = text;
      };
    });
    await use({
      readText: async () => {
        await page.waitForFunction(
          () =>
            typeof (window as unknown as { completedClipboardWrite?: string })
              .completedClipboardWrite === "string",
        );
        return page.evaluate(
          () =>
            (window as unknown as { completedClipboardWrite: string })
              .completedClipboardWrite,
        );
      },
    });
  },
  browser: [
    async ({ playwright, launchOptions, browserName }, use) => {
      const port = process.env.CONSOLE_FX_CDP_PORT;
      if (
        port &&
        (browserName !== "chromium" ||
          !/^\d+$/.test(port) ||
          Number(port) > 65535 ||
          Number(port) < 1024)
      )
        throw new Error(
          "Native CDP requires Chromium and a port from 1024 to 65535",
        );
      const browser = port
        ? await playwright.chromium.connectOverCDP(`http://127.0.0.1:${port}`)
        : await playwright[browserName].launch(launchOptions);
      try {
        await use(browser);
      } finally {
        await browser.close();
      }
    },
    { scope: "worker" },
  ],
});
export { expect };
