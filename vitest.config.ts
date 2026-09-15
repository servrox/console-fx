import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    restoreMocks: true,
    clearMocks: true,
    testTimeout: 10_000,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["packages/**/*.test.{ts,tsx}", "apps/**/*.test.{ts,tsx}"],
        },
      },
      {
        extends: true,
        test: {
          name: "release",
          include: [
            "tests/release-artifacts.test.js",
            "tests/studio-artifact.test.js",
          ],
        },
      },
    ],
  },
});
