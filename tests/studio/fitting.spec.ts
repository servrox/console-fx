import AxeBuilder from "@axe-core/playwright";
import {
  defineScene,
  parseRenderRecipe,
} from "../../packages/console-fx/dist/index.js";
import { compileConsole } from "../../packages/console-fx/dist/browser/index.js";
import {
  neon,
  createPresetExample,
} from "../../packages/console-fx/dist/presets/index.js";
import {
  decodeDocument,
  encodeShare,
} from "../../apps/studio/src/features/persistence/documents";
import { test, expect } from "./fixtures";

const rawKey = "console-fx:scene:v1";
const recipeKey = "console-fx:recipe:v1";

test("oversized recipe sharing offers a download that preserves render intent", async ({
  page,
}) => {
  const parsed = parseRenderRecipe({
    kind: "consoleFxRenderRecipe",
    recipeVersion: 1,
    scene: defineScene({
      schemaVersion: 1,
      label: "Large recipe",
      lines: [{ runs: [{ text: "😀".repeat(1900) }] }],
    }),
    options: {
      target: "chromium",
      renderer: "svg",
      unsupported: "fallback",
      layout: {
        algorithm: "fit/v1",
        width: 360,
        maxHeight: 200,
        minFontSize: 12,
        overflow: "error",
        variant: "standard",
      },
      sizing: { mode: "fixed", width: 480 },
    },
  });
  if (!parsed.ok) throw new Error("Invalid oversized recipe fixture");
  const document = parsed.value;
  await page.goto("/studio/");
  await page
    .locator('input[type="file"]')
    .setInputFiles({
      name: "large-recipe.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(document)),
    });
  await page
    .getByRole("button", { name: "Copy share link", exact: true })
    .click();
  await expect(page.locator(".editor-status")).toContainText(
    "Export recipe JSON",
  );
  const downloaded = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export recipe JSON", exact: true })
    .click();
  const file = await downloaded;
  expect(file.suggestedFilename()).toBe("console-fx-recipe.json");
  const stream = await file.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  expect(decodeDocument(Buffer.concat(chunks).toString("utf8"))).toEqual({
    ok: true,
    value: document,
    diagnostics: [],
  });
});

test("failed playback retains the static preview, editable text and JSON recovery", async ({
  page,
}) => {
  const scene = defineScene({
    schemaVersion: 1,
    label: "Bounded wave",
    surface: { padding: 0 },
    lines: [
      {
        runs: [
          {
            text: "A",
            style: { fontSize: 20 },
            effects: [{ kind: "wave", amplitude: 10 }],
          },
        ],
      },
    ],
  });
  const document = {
    kind: "consoleFxRenderRecipe",
    recipeVersion: 1,
    scene,
    options: {
      target: "chromium",
      renderer: "svg",
      motion: "reduce",
      layout: {
        algorithm: "fit/v1",
        width: 100,
        maxHeight: 40,
        overflow: "error",
        minFontSize: 12,
        variant: "standard",
      },
    },
  };
  await page.addInitScript(
    ({ key, document }) => localStorage.setItem(key, JSON.stringify(document)),
    { key: recipeKey, document },
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const errors: string[] = [];
  const calls: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (event) => {
    if (event.type() === "log") calls.push(event.text());
  });
  await page.goto("/studio/");
  const message = page.getByRole("textbox", {
    name: "Message text",
    exact: true,
  });
  await expect(message).toHaveValue("A");
  const preview = page.locator(".preview-content img");
  const uri = await preview.getAttribute("src");
  expect(uri).toBeTruthy();
  const source = page.getByLabel("Generated code", { exact: true });
  const exported = await source.inputValue();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(page.locator(".editor-status .error-text")).toBeVisible();
  await expect(preview).toHaveAttribute("src", uri!);
  await expect(source).toHaveValue(exported);
  await expect(
    page.getByRole("button", { name: "Show static", exact: true }),
  ).toBeDisabled();
  await message.fill("B");
  await page
    .getByRole("combobox", { name: "Format", exact: true })
    .selectOption("recipe");
  const recovered = JSON.parse(await source.inputValue());
  expect(recovered.scene.lines[0].runs[0].text).toBe("B");
  expect(recovered.options).toMatchObject(document.options);
  expect(errors).toEqual([]);
  expect(calls).toEqual([]);
});

test("compact cards keep full fields, exact measured exports and recoverable recipes", async ({
  page,
}) => {
  const card = createPresetExample("serviceReady");
  await page.addInitScript(
    ({ card, key }) => localStorage.setItem(key, JSON.stringify(card)),
    { card, key: rawKey },
  );
  const calls: string[] = [];
  page.on("console", (event) => {
    if (event.type() === "log") calls.push(event.text());
  });
  await page.goto("/studio/");
  await expect(
    page.getByRole("textbox", { name: "Service", exact: true }),
  ).toHaveValue(card.lines[1]!.runs[0]!.text);
  await page.locator(".fit-section > summary").click();
  const fit = page.locator(".fit-inspector");
  await fit
    .getByRole("combobox", { name: "Layout variant", exact: true })
    .selectOption("compact");
  await fit.getByRole("button", { name: "360px", exact: true }).click();
  await fit
    .getByRole("spinbutton", { name: "Export display width (px)", exact: true })
    .fill("360");
  await fit
    .getByRole("button", { name: "Use this width for export", exact: true })
    .click();
  await fit
    .getByRole("button", {
      name: "Measure local fonts for export",
      exact: true,
    })
    .click();
  await expect(
    fit.getByRole("button", { name: "Clear font measurements", exact: true }),
  ).toBeVisible();
  const uri = await page.locator(".preview-content img").getAttribute("src");
  const source = page.getByLabel("Generated code", { exact: true });
  const printed: unknown[][] = [];
  new Function("console", await source.inputValue())({
    log: (...args: unknown[]) => printed.push(args),
  });
  expect(printed).toHaveLength(1);
  expect(printed[0]!.join(" ")).toContain(uri!);
  await page
    .getByRole("combobox", { name: "Format", exact: true })
    .selectOption("recipe");
  const saved = JSON.parse(await source.inputValue());
  expect(saved.scene).toEqual(card);
  expect(saved.options.layout).toMatchObject({
    width: 360,
    variant: "compact",
  });
  expect(saved.options).not.toHaveProperty("measurements");
  expect(saved.options).not.toHaveProperty("measurementEnvironment");
  await expect
    .poll(() => page.evaluate((key) => localStorage.getItem(key), recipeKey))
    .toContain('"variant":"compact"');
  expect(
    JSON.parse(
      (await page.evaluate((key) => localStorage.getItem(key), rawKey))!,
    ),
  ).toEqual(card);
  await fit
    .getByRole("button", { name: "Remove fitting and sizing", exact: true })
    .click();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect(JSON.parse(await source.inputValue()).options).toEqual(saved.options);
  expect(calls).toHaveLength(0);
});
function recipe(
  text = "Local font fit",
  width = 360,
  motion: "none" | "wave" = "none",
) {
  const result = parseRenderRecipe({
    kind: "consoleFxRenderRecipe",
    recipeVersion: 1,
    scene: neon({ text, motion }),
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
      name: "Use ConsoleFX in your app.",
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
    buffer: Buffer.from(JSON.stringify(recipe("Local font fit", 360, "wave"))),
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
  expect(saved).toEqual(recipe("Local font fit", 360, "wave"));
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
  for (const [format, expected] of [
    ["typescript", "emitConsole"],
    ["react", "useConsoleScene"],
    ["next", "ConsoleBanner"],
  ]) {
    await page
      .getByRole("combobox", { name: "Format", exact: true })
      .selectOption(format!);
    const code = await source.inputValue();
    expect(code).toContain(expected!);
    expect(code).toContain("defineScene");
    expect(code).toContain('"measurements"');
    expect(code).not.toContain("measureTextBatch");
  }
  await page
    .getByRole("combobox", { name: "Format", exact: true })
    .selectOption("recipe");
  await page.getByRole("checkbox", { name: /Enable finite motion/ }).check();
  await expect
    .poll(async () => JSON.parse(await source.inputValue()).options.motion)
    .toBe("system");
  expect(
    JSON.parse(await source.inputValue()).options.measurements,
  ).toBeUndefined();
  await expect(page.locator(".editor-status")).not.toContainText(
    "Unknown field",
  );
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

test("applying a layout width preserves imported container sizing", async ({
  page,
}) => {
  await page.goto("/studio/");
  const imported = {
    ...recipe("Imported container", 960),
    options: {
      ...recipe("Imported container", 960).options,
      sizing: {
        mode: "container-experimental",
        maxWidth: 480,
        fillFraction: 0.5,
      },
    },
  };
  await page.locator('input[type="file"]').setInputFiles({
    name: "container.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(imported)),
  });
  await page.locator(".fit-section > summary").click();
  await expect(
    page.getByRole("spinbutton", {
      name: "Maximum display width (px)",
      exact: true,
    }),
  ).toHaveValue("480");
  await expect(
    page.getByRole("spinbutton", {
      name: "Container fill fraction",
      exact: true,
    }),
  ).toHaveValue("0.5");
  await page.getByRole("button", { name: "720px", exact: true }).click();
  await page
    .getByRole("button", { name: "Use this width for export", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Format", exact: true })
    .selectOption("recipe");
  const saved = JSON.parse(
    await page.getByLabel("Generated code", { exact: true }).inputValue(),
  );
  expect(saved.options.layout.width).toBe(720);
  expect(saved.options.sizing).toEqual(imported.options.sizing);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  const previous = JSON.parse(
    await page.getByLabel("Generated code", { exact: true }).inputValue(),
  );
  expect(previous.options.layout.width).toBe(960);
  expect(previous.options.sizing).toEqual(imported.options.sizing);
});
