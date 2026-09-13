import { test as base, expect } from "@playwright/test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Local NixOS runs may connect to an explicitly isolated Windows Chromium
// instance. Other runs launch the selected engine. Every test owns its context.
export const test = base.extend<
  { clipboard: { readText: () => Promise<string> } },
  { nativeArtifactsDir: string | undefined }
>({
  nativeArtifactsDir: [
    async ({}, use) => {
      const directory = process.env.CONSOLE_FX_CDP_PORT
        ? await mkdtemp(join(tmpdir(), "console-fx-native-artifacts-"))
        : undefined;
      try {
        await use(directory);
      } finally {
        if (directory) await rm(directory, { recursive: true, force: true });
      }
    },
    { scope: "worker" },
  ],
  context: async (
    { context, browser, acceptDownloads, nativeArtifactsDir },
    use,
    testInfo,
  ) => {
    if (!process.env.CONSOLE_FX_CDP_PORT) {
      await use(context);
      return;
    }
    const downloadSession = await browser.newBrowserCDPSession();
    try {
      if (
        nativeArtifactsDir &&
        acceptDownloads !== false &&
        process.platform === "linux"
      ) {
        const probe = await context.newPage();
        try {
          const session = await context.newCDPSession(probe);
          const { userAgent } =
            await downloadSession.send("Browser.getVersion");
          if (userAgent.includes("Windows NT")) {
            const distribution = process.env.WSL_DISTRO_NAME;
            if (!distribution || !/^[a-zA-Z0-9._-]+$/.test(distribution))
              throw new Error(
                "Windows CDP downloads require a named WSL distribution",
              );
            const { targetInfo } = await session.send("Target.getTargetInfo");
            // Chrome writes through WSL's share; Playwright reads the same owned
            // files through Linux. The unmodified Linux path cancels downloads.
            // Keep this browser session alive through the test. A page session
            // loses its override when the temporary setup page closes.
            await downloadSession.send("Browser.setDownloadBehavior", {
              behavior: "allowAndName",
              browserContextId: targetInfo.browserContextId,
              downloadPath: `\\\\wsl.localhost\\${distribution}${nativeArtifactsDir.replaceAll("/", "\\")}`,
              eventsEnabled: true,
            });
          }
        } finally {
          await probe.close();
        }
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
    } finally {
      await downloadSession.detach();
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
    async (
      { playwright, launchOptions, browserName, nativeArtifactsDir },
      use,
    ) => {
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
        ? await playwright.chromium.connectOverCDP(`http://127.0.0.1:${port}`, {
            ...(nativeArtifactsDir ? { artifactsDir: nativeArtifactsDir } : {}),
          })
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
