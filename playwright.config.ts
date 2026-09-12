import { defineConfig, devices } from "@playwright/test";

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
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1000 },
      },
    },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: {
    command: `python3 -m http.server ${port} --bind 127.0.0.1 --directory apps/studio/out`,
    url: `http://127.0.0.1:${port}/`,
    reuseExistingServer: !process.env.CI,
  },
});
