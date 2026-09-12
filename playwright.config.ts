import { defineConfig, devices } from "@playwright/test";

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
  },
  projects: [
    {
      name: "desktop",
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
      use:
        browserName === "firefox"
          ? { viewport: { width: 390, height: 844 }, hasTouch: true }
          : { ...devices["iPhone 13"], defaultBrowserType: browserName },
    },
  ],
  webServer: {
    command: `python3 -u -m http.server ${port} --bind 127.0.0.1 --directory apps/studio/out`,
    // Wait for our process to bind. An unopened-port HTTP probe can stall in WSL,
    // and reusing an unrelated server would not validate this build.
    wait: { stdout: /Serving HTTP on 127\.0\.0\.1 port \d+/ },
    timeout: 15_000,
    gracefulShutdown: { signal: "SIGTERM", timeout: 500 },
  },
});
