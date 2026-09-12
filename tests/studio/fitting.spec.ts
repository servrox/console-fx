import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { parseRenderRecipe } from "../../packages/console-fx/dist/index.js";
import { compileConsole } from "../../packages/console-fx/dist/browser/index.js";
import { neon } from "../../packages/console-fx/dist/presets/index.js";
import { encodeShare } from "../../apps/studio/src/features/persistence/documents";
import { test, expect } from "./fixtures";

const rawKey = "console-fx:scene:v1";
const recipeKey = "console-fx:recipe:v1";
function recipe(text = "Local font fit", width = 360) {
  const result = parseRenderRecipe({
    kind: "consoleFxRenderRecipe",
    recipeVersion: 1,
    scene: neon({ text }),
    options: {
      target: "chromium",
      renderer: "svg",
      motion: "reduce",
      layout: {
        algorithm: "fit/v1",
        width,
        maxHeight: 400,
        variant: "standard",
        overflow: "wrap-then-shrink",
        minFontSize: 12,
      },
      sizing: { mode: "fixed", width },
    },
  });
  if (!result.ok) throw Error("invalid fixture");
  return result.value;
}

test("simulation is silent and transient; applied fitting persists as an exact export recipe", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const probe = window as unknown as { fittingObservers: number };
    probe.fittingObservers = 0;
    const Original = window.ResizeObserver;
    window.ResizeObserver = class extends Original {
      private owned = false;
      override observe(target: Element, options?: ResizeObserverOptions) {
        if (target.matches(".fit-boundary") && !this.owned) {
          this.owned = true;
          probe.fittingObservers++;
        }
        super.observe(target, options);
      }
      override disconnect() {
        if (this.owned) {
          this.owned = false;
          probe.fittingObservers--;
        }
        super.disconnect();
      }
    };
  });
  const calls: string[] = [];
  page.on("console", (event) => {
    if (event.type() === "log") calls.push(event.text());
  });
  await page.goto("/studio/");
  await page
    .getByRole("textbox", { name: "Message text", exact: true })
    .fill("A chosen width");
  await expect
    .poll(() => page.evaluate((key) => localStorage.getItem(key), rawKey))
    .toContain("A chosen width");
  const raw = await page.evaluate((key) => localStorage.getItem(key), rawKey);
  const source = page.getByLabel("Generated code", { exact: true });
  const before = await source.inputValue();
  await page.locator(".fit-section > summary").click();
  const inspector = page.locator(".fit-inspector");
  const minimum = inspector.getByRole("spinbutton", {
    name: "Minimum type size (CSS px)",
    exact: true,
  });
  await minimum.fill("");
  await minimum.pressSequentially("20");
  await expect(minimum).toHaveValue("20");
  await minimum.fill("12");
  for (const width of [280, 360, 480, 720, 960]) {
    await inspector
      .getByRole("button", { name: `${width}px`, exact: true })
      .click();
    await expect(inspector).toContainText(`Simulation: ${width}px content box`);
    await expect(source).toHaveValue(before);
  }
  expect(calls).toHaveLength(0);
  expect(
    await page.evaluate((key) => localStorage.getItem(key), recipeKey),
  ).toBeNull();
  await inspector.getByRole("button", { name: "360px", exact: true }).click();
  await inspector
    .getByRole("button", { name: "Use this width for export", exact: true })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Output renderer", exact: true }),
  ).toHaveValue("svg");
  await expect
    .poll(() => page.evaluate((key) => localStorage.getItem(key), recipeKey))
    .toContain('"algorithm":"fit/v1"');
  const saved = JSON.parse(
    (await page.evaluate((key) => localStorage.getItem(key), recipeKey))!,
  );
  expect(saved.options.layout.width).toBe(360);
  expect(await page.evaluate((key) => localStorage.getItem(key), rawKey)).toBe(
    raw,
  );
  const output = compileConsole(saved.scene, saved.options);
  if (output.preview.kind !== "svg") throw Error("SVG expected");
  await expect(page.locator(".preview-content img")).toHaveAttribute(
    "src",
    output.preview.imageUri,
  );
  const exported: unknown[][] = [];
  new Function("console", await source.inputValue())({
    log: (...args: unknown[]) => exported.push(args),
  });
  expect(exported).toEqual([[...output.args]]);
  await page
    .getByRole("button", { name: "Test in console", exact: true })
    .click();
  expect(calls).toHaveLength(1);
  await page.reload();
  await expect(page.locator(".preview-content img")).toHaveAttribute(
    "src",
    output.preview.imageUri,
  );
  await page
    .getByRole("combobox", { name: "Format", exact: true })
    .selectOption("recipe");
  expect(JSON.parse(await source.inputValue())).toEqual(saved);
  expect(calls).toHaveLength(1);
  await page.getByRole("link", { name: "Docs", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Make one message your own.",
      exact: true,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { fittingObservers: number }).fittingObservers,
    ),
  ).toBe(0);
});

test("explicit local measurement runs under deployment CSP and preview matches precompiled export", async ({
  page,
}) => {
  const config = JSON.parse(readFileSync(".vercel/output/config.json", "utf8"));
  await page.route("**/*", async (route) => {
    if (route.request().resourceType() !== "document") return route.continue();
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        "content-security-policy":
          config.routes[0].headers["Content-Security-Policy"],
      },
    });
  });
  await page.addInitScript(() => {
    const probe = window as unknown as { fittingCsp: string[] };
    probe.fittingCsp = [];
    document.addEventListener("securitypolicyviolation", (event) =>
      probe.fittingCsp.push(event.violatedDirective),
    );
  });
  await page.goto("/studio/");
  await page.locator('input[type="file"]').setInputFiles({
    name: "fit.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(recipe())),
  });
  await expect(
    page.getByRole("textbox", { name: "Message text", exact: true }),
  ).toHaveValue("Local font fit");
  await page.locator(".fit-section > summary").click();
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page
    .getByRole("button", {
      name: "Measure local fonts for export",
      exact: true,
    })
    .click();
  await expect(page.locator(".fit-inspector [role=status]")).toContainText(
    "Local font data is ready",
    { timeout: 12_000 },
  );
  expect(requests.some((url) => /\.(woff2?|ttf|otf)(?:\?|$)/.test(url))).toBe(
    false,
  );
  const source = page.getByLabel("Generated code", { exact: true });
  const args: unknown[][] = [];
  new Function("console", await source.inputValue())({
    log: (...values: unknown[]) => args.push(values),
  });
  expect(args).toHaveLength(1);
  const uri = await page.locator(".preview-content img").getAttribute("src");
  expect(args[0]!.join("")).toContain(uri);
  await page
    .getByRole("combobox", { name: "Format", exact: true })
    .selectOption("recipe");
  const saved = JSON.parse(await source.inputValue());
  expect(saved).toEqual(recipe());
  expect(saved.options.measurements).toBeUndefined();
  expect(saved.options.measurementEnvironment).toBeUndefined();
  expect(
    await page.evaluate(
      () => (window as unknown as { fittingCsp: string[] }).fittingCsp,
    ),
  ).toEqual([]);
  expect(
    (await new AxeBuilder({ page }).include("#playground").analyze())
      .violations,
  ).toEqual([]);
});

test("recipe imports, shared-setting conflicts and undo retain render intent", async ({
  page,
}) => {
  await page.goto("/studio/");
  const input = page.locator('input[type="file"]');
  const text = page.getByRole("textbox", { name: "Message text", exact: true });
  await text.fill("My prior scene");
  await input.setInputFiles({
    name: "recipe.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(recipe("Imported fit"))),
  });
  await expect(text).toHaveValue("Imported fit");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(text).toHaveValue("My prior scene");
  await expect(
    page.getByRole("combobox", { name: "Output renderer", exact: true }),
  ).toHaveValue("css");
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Format", exact: true })
    .selectOption("recipe");
  const source = page.getByLabel("Generated code", { exact: true });
  expect(JSON.parse(await source.inputValue())).toEqual(recipe("Imported fit"));
  await input.setInputFiles({
    name: "future.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ ...recipe(), recipeVersion: 9 })),
  });
  expect(JSON.parse(await source.inputValue())).toEqual(recipe("Imported fit"));
  const shared = encodeShare(recipe("Imported fit", 480));
  if (!shared.ok) throw Error("share fixture failed");
  await page.evaluate((hash) => {
    location.hash = hash;
  }, shared.value);
  await expect(page.getByRole("dialog")).toBeVisible();
  await page
    .getByRole("button", { name: "Load shared scene", exact: true })
    .click();
  expect(JSON.parse(await source.inputValue())).toEqual(
    recipe("Imported fit", 480),
  );
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect(JSON.parse(await source.inputValue())).toEqual(recipe("Imported fit"));
  await page
    .getByRole("button", { name: "Clear local draft", exact: true })
    .click();
  expect(
    await page.evaluate(
      ([raw, fit]) => [localStorage.getItem(raw!), localStorage.getItem(fit!)],
      [rawKey, recipeKey],
    ),
  ).toEqual([null, null]);
  expect(JSON.parse(await source.inputValue())).toEqual(recipe("Imported fit"));
});
