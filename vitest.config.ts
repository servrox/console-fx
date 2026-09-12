import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/**/*.test.{ts,tsx}", "apps/**/*.test.{ts,tsx}"],
    environment: "node",
    restoreMocks: true,
    clearMocks: true,
    testTimeout: 10_000,
  },
});
