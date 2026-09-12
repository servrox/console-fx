// Controlled storyboard captures; paused reveal frames are not timing evidence.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";
import { build } from "esbuild";

const destination = resolve(".artifacts/website/states");
await mkdir(destination, { recursive: true });
const bundle = await build({
  stdin: {
    contents:
      'export { exampleRecipe } from "./apps/studio/src/features/landing/examples.ts"; export { compileConsole } from "./packages/console-fx/dist/browser/index.js";',
    resolveDir: process.cwd(),
  },
  bundle: true,
  write: false,
  format: "esm",
  platform: "node",
});
const api = await import(
  `data:text/javascript,${encodeURIComponent(bundle.outputFiles[0].text)}`
);
const browser = await chromium.connectOverCDP(
  process.env.CONSOLE_FX_CDP ?? "http://127.0.0.1:9344",
);
const rows = [];
for (const width of [1440, 390]) {
  const context = await browser.newContext({
    viewport: { width, height: 1000 },
    deviceScaleFactor: 1,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  const calls = [];
  page.on("console", (event) => {
    if (event.type() === "log") calls.push(event.text());
  });
  await page.goto(
    process.env.CONSOLE_FX_WEBSITE_URL ?? "http://127.0.0.1:4197/",
  );
  await page.bringToFront();
  await expect(page.locator(".landing-experience")).toHaveAttribute(
    "data-page-effects",
    "on",
  );
  const demo = page.locator(".quick-demo");
  const frame = demo.locator(".reveal-frame");
  await frame.scrollIntoViewIfNeeded();
  const pause = await page.addStyleTag({
    content: ".reveal-decoration{animation-play-state:paused!important}",
  });
  await demo.getByRole("button", { name: "Plain", exact: true }).click();
  const overlay = demo.locator(".reveal-decoration");
  await expect(overlay).toHaveCount(1);
  await expect(overlay).toHaveAttribute("aria-hidden", "true");
  await expect(overlay).toHaveAttribute("inert", "");
  await expect(
    demo.getByRole("button", { name: "Plain", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  for (const [label, time] of [
    ["start", 0],
    ["intermediate", 140],
  ]) {
    await overlay.evaluate(
      (node, time) =>
        node.getAnimations().forEach((animation) => {
          animation.currentTime = time;
        }),
      time,
    );
    await frame.screenshot({
      path: resolve(destination, `UX-03-${label}-${width}.png`),
      animations: "allow",
    });
  }
  await pause.evaluate((node) => node.remove());
  await expect(overlay).toHaveCount(0);
  await frame.screenshot({
    path: resolve(destination, `UX-03-final-${width}.png`),
  });
  await demo.getByRole("button", { name: "Styled", exact: true }).click();
  const input = demo.getByRole("textbox", {
    name: "Your message",
    exact: true,
  });
  await input.fill("100% %c %s 👩🏽‍💻 é שלום");
  await demo
    .getByRole("combobox", { name: "Style", exact: true })
    .selectOption("chrome");
  const edited = api.exampleRecipe(
    "signature",
    await input.inputValue(),
    "chrome",
  );
  const editedOutput = api.compileConsole(edited.scene, edited.options);
  await expect(demo.locator(".comparison-result img")).toHaveAttribute(
    "src",
    editedOutput.preview.imageUri,
  );
  await expect(overlay).toHaveCount(0);
  await demo.screenshot({ path: resolve(destination, `UX-06-${width}.png`) });
  const card = page.getByRole("button", {
    name: "Edit Welcome to the SDK example",
    exact: true,
  });
  await card.click();
  const load = page.getByRole("button", { name: "Load example", exact: true });
  await expect(load).toBeVisible();
  await load.click();
  const editor = page.locator("#editor-workspace");
  await expect(
    editor.getByRole("textbox", { name: "Message text", exact: true }),
  ).toHaveValue("Atlas SDK");
  await expect(card).toHaveAttribute("aria-pressed", "true");
  const source = await editor
    .getByRole("textbox", { name: "Generated code", exact: true })
    .inputValue();
  const emitted = [];
  new Function("console", source)({ log: (...args) => emitted.push(args) });
  const selected = api.exampleRecipe("sdkWelcome");
  assert.deepEqual(emitted, [
    api.compileConsole(selected.scene, selected.options).args,
  ]);
  await card.screenshot({
    path: resolve(destination, `UX-05-selected-${width}.png`),
  });
  await editor.screenshot({
    path: resolve(destination, `UX-05-editor-${width}.png`),
  });
  assert.equal(calls.length, 0);
  rows.push({
    width,
    reveal:
      "Paused authored CSS animation at 0 and 140ms, then naturally completed; semantic selection was immediate",
    selectedExample: "sdkWelcome",
    selectedCodeMatchesCompiler: true,
    editedUnicodeUriMatchesCompiler: true,
    realConsoleCalls: calls.length,
  });
  await context.close();
}
await writeFile(
  resolve(destination, "storyboard-completion.json"),
  JSON.stringify(
    {
      at: new Date().toISOString(),
      browser: browser.version(),
      kind: "native-browser page storyboard; not native DevTools qualification or motion timing",
      rows,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "UX-03/05/06 captured with exact compiler identity and zero real console emissions.",
);
process.exit(0);
