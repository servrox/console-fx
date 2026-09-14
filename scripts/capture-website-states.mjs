// Page storyboard only. Native DevTools qualification has a separate harness.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";

const destination = resolve(".artifacts/website/states");
await mkdir(destination, { recursive: true });
const origin = process.env.CONSOLE_FX_WEBSITE_URL ?? "http://127.0.0.1:4188/";
const remote = process.env.CONSOLE_FX_CDP;
const browser = remote
  ? await chromium.connectOverCDP(remote)
  : await chromium.launch();
const rows = [];
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: 1000 },
      deviceScaleFactor: 1,
    });
    try {
      const page = await context.newPage();
      const calls = [];
      page.on("console", (event) => {
        if (event.type() === "log") calls.push(event.text());
      });
      await page.goto(origin);
      const hero = page.getByRole("region", {
        name: "Explore console use cases",
      });
      await expect(
        hero.getByRole("button", { name: "Copy recipe", exact: true }),
      ).toBeEnabled();
      await page.screenshot({
        path: resolve(destination, `landing-${width}.png`),
        fullPage: true,
      });
      await hero.screenshot({
        path: resolve(destination, `hero-${width}.png`),
      });
      for (const view of ["output", "code"]) {
        await hero
          .getByRole("button", { name: `Show ${view}`, exact: true })
          .click();
        await hero.screenshot({
          path: resolve(destination, `hero-${view}-${width}.png`),
        });
      }
      await hero.getByRole("link", { name: /Edit this example/ }).click();
      const editor = page.locator("#editor-workspace");
      const message = editor.getByRole("textbox", {
        name: "Message text",
        exact: true,
      });
      await expect(message).toBeVisible();
      await page.screenshot({
        path: resolve(destination, `workbench-${width}.png`),
        fullPage: true,
      });
      if (width === 390) {
        await page.getByRole("button", { name: /Browse examples/ }).click();
        await page.getByRole("button", { name: /^All examples/ }).click();
        await page
          .getByRole("combobox", { name: "Visual style", exact: true })
          .selectOption("card");
        await page
          .getByRole("searchbox", { name: "Search examples" })
          .fill("build");
        await page.screenshot({
          path: resolve(destination, `discovery-${width}.png`),
        });
        await page.keyboard.press("Escape");
        for (const name of ["Output", "Code", "Edit"]) {
          await page.getByRole("tab", { name, exact: true }).click();
          await page.screenshot({
            path: resolve(
              destination,
              `workbench-${name.toLowerCase()}-${width}.png`,
            ),
          });
        }
      }
      await page.goto(new URL("/docs/", origin).href);
      await expect(
        page.getByRole("heading", { name: "See how it works.", exact: true }),
      ).toBeVisible();
      await page.screenshot({
        path: resolve(destination, `docs-${width}.png`),
        fullPage: true,
      });
      assert.equal(calls.length, 0, "Page discovery must remain silent");
      rows.push({
        width,
        consoleCalls: calls.length,
        pages: ["landing", "workbench", "docs"],
      });
    } finally {
      await context.close();
    }
  }
  await writeFile(
    resolve(destination, "storyboard-completion.json"),
    JSON.stringify(
      {
        at: new Date().toISOString(),
        browser: browser.version(),
        kind: "Page storyboard; emulated width is not physical-device or native Console qualification",
        rows,
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  if (!remote) await browser.close();
}
if (remote) process.exit(0);
