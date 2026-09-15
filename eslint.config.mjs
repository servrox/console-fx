import js from "@eslint/js";
import ts from "typescript-eslint";
import next from "eslint-config-next/core-web-vitals";

export default [
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/.next/**",
      "**/out/**",
      "tests/devtools/generated/**",
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...next.map((config) => ({
    ...config,
    files: ["apps/**/*.{ts,tsx}"],
  })),
  {
    files: ["apps/**/*.{ts,tsx}"],
    settings: { next: { rootDir: "apps/studio/" } },
  },
  {
    files: ["**/*.{ts,tsx,js,mjs}"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        URL: "readonly",
        TextEncoder: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        fetch: "readonly",
        document: "readonly",
        window: "readonly",
        navigator: "readonly",
      },
    },
  },
];
