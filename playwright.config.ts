import { defineConfig, devices } from "@playwright/test";
import { nativeBrowserDiagnostics } from "./tests/native-browser-diagnostics";

const browserName = process.env.CONSOLE_FX_TEST_BROWSER ?? "chromium";
if (
  browserName !== "chromium" &&
  browserName !== "firefox" &&
  browserName !== "webkit"
)
  throw new Error(
    "CONSOLE_FX_TEST_BROWSER must be chromium, firefox or webkit",
  );
if (process.env.CONSOLE_FX_CDP_PORT && browserName !== "chromium")
  throw new Error("Native CDP requires CONSOLE_FX_TEST_BROWSER=chromium");
const port = Number(process.env.CONSOLE_FX_STUDIO_PORT ?? 4175);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error("Invalid studio test port");

export default defineConfig({
  testDir: "tests/studio",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    browserName,
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    ...nativeBrowserDiagnostics,
  },
  projects: [
    {
      name: "desktop",
      testIgnore: "**/workbench-mobile.spec.ts",
      use: {
        ...devices[
          browserName === "firefox"
            ? "Desktop Firefox"
            : browserName === "webkit"
              ? "Desktop Safari"
              : "Desktop Chrome"
        ],
        viewport: { width: 1440, height: 1000 },
      },
    },
    {
      name: "mobile",
      // Layout-independent recovery/fitting regressions run once on desktop.
      // Mobile owns actual drawer, mounted-panel, copy/import and focus journeys.
      testMatch: [
        "**/website.spec.ts",
        "**/workbench-mobile.spec.ts",
        "**/usage-video.spec.ts",
      ],
      use:
        browserName === "firefox"
          ? { viewport: { width: 390, height: 844 }, hasTouch: true }
          : { ...devices["iPhone 13"], defaultBrowserType: browserName },
    },
  ],
  webServer: {
    command: `python3 -u scripts/serve-studio.py ${port}`,
    // Wait for our process to bind. An unopened-port HTTP probe can stall in WSL,
    // and reusing an unrelated server would not validate this build.
    wait: { stdout: /Serving prepared studio on http:\/\/127\.0\.0\.1:\d+/ },
    timeout: 15_000,
    gracefulShutdown: { signal: "SIGTERM", timeout: 500 },
  },
});
