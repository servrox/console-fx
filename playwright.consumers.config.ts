import { defineConfig } from "@playwright/test";

const directory = process.env.CONSOLE_FX_CONSUMER_DIR;
if (!directory || !/^\/[-\w./]+$/.test(directory))
  throw new Error("Run through test:consumers with its isolated directory");
export default defineConfig({
  testDir: "tests/consumers",
  workers: 1,
  retries: 0,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:4177", trace: "retain-on-failure" },
  webServer: {
    command: `python3 -u -m http.server 4177 --bind 127.0.0.1 --directory '${directory}/out'`,
    wait: { stdout: /Serving HTTP on 127\.0\.0\.1 port 4177/ },
    timeout: 15_000,
    gracefulShutdown: { signal: "SIGTERM", timeout: 500 },
  },
});
