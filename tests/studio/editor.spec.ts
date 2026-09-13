import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import { parseRenderRecipe } from "../../packages/console-fx/dist/index.js";
import { exportConsoleLog } from "../../packages/console-fx/dist/codegen/index.js";
import { neon, rainbow } from "../../packages/console-fx/dist/presets/index.js";
import { encodeShare } from "../../apps/studio/src/features/persistence/documents";
import { test, expect } from "./fixtures";

const draftKey = "console-fx:scene:v1";

test("structural additions advance selection only after a valid undoable edit", async ({
  page,
}) => {
  await page.goto("/studio/");
  const text = page.getByRole("textbox", { name: "Message text", exact: true });
  const undo = page.getByRole("button", { name: "Undo", exact: true });
  const redo = page.getByRole("button", { name: "Redo", exact: true });
  await text.fill("Before import");
  const atLimit = {
    ...neon(),
    label: "",
    lines: [
      { runs: [{ text: "a".repeat(1998) }, { text: "b" }] },
      { runs: [{ text: "c" }] },
    ],
  };
  await page.locator('input[type="file"]').setInputFiles({
    name: "at-limit.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(atLimit)),
  });
  await expect(text).toHaveValue(atLimit.lines[0]!.runs[0]!.text);
  await page
    .getByRole("combobox", { name: "Format", exact: true })
    .selectOption("json");
  const source = page.getByLabel("Generated code", { exact: true });
  const imported = await source.inputValue();
  for (const name of ["+ Line", "+ Text run"]) {
    await page.getByRole("button", { name, exact: true }).click();
    await expect(page.locator(".editor-status")).toContainText("2,000");
    await expect(text).toHaveValue(atLimit.lines[0]!.runs[0]!.text);
    await expect(
      page.getByRole("button", { name: "Line 1", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(source).toHaveValue(imported);
    await expect(redo).toBeDisabled();
  }
  await undo.click();
  await expect(text).toHaveValue("Before import");
  await redo.click();
  await expect(source).toHaveValue(imported);
  await undo.click();
  const baseline = await source.inputValue();
  for (const [name, addedText] of [
    ["+ Line", "Another line"],
    ["+ Text run", " New text"],
  ]) {
    await page.getByRole("button", { name, exact: true }).click();
    await expect(text).toHaveValue(addedText!);
    await expect(redo).toBeDisabled();
    await undo.click();
    await expect(source).toHaveValue(baseline);
    await expect(text).toHaveValue("Before import");
  }
});

test("empty lines remain removable and structural deletion stays undoable", async ({
  page,
}) => {
  await page.goto("/studio/");
  const text = page.getByRole("textbox", { name: "Message text", exact: true });
  const removeRun = page.getByRole("button", {
    name: "Remove run",
    exact: true,
  });
  const removeLine = page.getByRole("button", {
    name: "Remove line",
    exact: true,
  });
  const undo = page.getByRole("button", { name: "Undo", exact: true });
  const redo = page.getByRole("button", { name: "Redo", exact: true });
  const lines = page.locator(".line-list .line-label");
  await expect(text).toHaveValue("Hello, developer.");
  await removeRun.click();
  await expect(text).toHaveCount(0);
  await expect(removeRun).toHaveCount(0);
  await removeLine.click();
  await expect(lines).toHaveCount(0);
  await expect(removeLine).toHaveCount(0);
  await undo.click();
  await expect(lines).toHaveCount(1);
  await expect(removeLine).toBeVisible();
  await expect(text).toHaveCount(0);
  await undo.click();
  await expect(text).toHaveValue("Hello, developer.");
  await redo.click();
  await expect(text).toHaveCount(0);
  await redo.click();
  await expect(lines).toHaveCount(0);
  for (const runs of [[], [{ runs: [] }]]) {
    await page.locator('input[type="file"]').setInputFiles({
      name: "empty.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify({ ...neon(), lines: runs })),
    });
    await expect(lines).toHaveCount(runs.length);
    if (runs.length) {
      await removeLine.click();
      await expect(lines).toHaveCount(0);
    }
    await page.getByRole("button", { name: "+ Text run", exact: true }).click();
    await expect(text).toHaveValue("Another line");
    await undo.click();
    await expect(lines).toHaveCount(0);
  }
});

test("explicit rich renderer selection updates an imported target in one undoable step", async ({
  page,
}) => {
  const logs: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "log") logs.push(message.text());
  });
  await page.goto("/studio/");
  const renderer = page.getByRole("combobox", {
    name: "Output renderer",
    exact: true,
  });
  const format = page.getByRole("combobox", { name: "Format", exact: true });
  const source = page.getByLabel("Generated code", { exact: true });
  for (const fixture of [
    { renderer: "svg", options: { target: "node", renderer: "text" } },
    { renderer: "css", options: { unsupported: "fallback" } },
  ] as const) {
    const parsed = parseRenderRecipe({
      kind: "consoleFxRenderRecipe",
      recipeVersion: 1,
      scene: neon({ text: `Imported ${fixture.renderer} message` }),
      options: fixture.options,
    });
    if (!parsed.ok) throw new Error("Invalid imported recipe fixture");
    const imported = parsed.value;
    await page.locator('input[type="file"]').setInputFiles({
      name: "recipe.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(imported)),
    });
    await format.selectOption("recipe");
    await renderer.selectOption("text");
    expect(JSON.parse(await source.inputValue())).toEqual(imported);
    await renderer.selectOption(fixture.renderer);
    const selected = {
      ...imported,
      options: {
        ...imported.options,
        renderer: fixture.renderer,
        target: "chromium",
      },
    } as const;
    expect(JSON.parse(await source.inputValue())).toEqual(selected);
    if (fixture.renderer === "svg")
      await expect(
        page.getByRole("img", { name: "Imported svg message", exact: true }),
      ).toBeVisible();
    else
      await expect(
        page.getByText("Approximate browser preview", { exact: true }),
      ).toBeVisible();
    await format.selectOption("javascript");
    await expect(source).toHaveValue(
      exportConsoleLog(selected.scene, selected.options).code,
    );
    await format.selectOption("recipe");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    expect(JSON.parse(await source.inputValue())).toEqual(imported);
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    expect(JSON.parse(await source.inputValue())).toEqual(selected);
    await renderer.selectOption("text");
    expect(JSON.parse(await source.inputValue())).toEqual({
      ...selected,
      options: { ...selected.options, renderer: "text" },
    });
  }
  expect(logs).toEqual([]);
});

test("prepared deployment CSP permits hydration, exact SVG previews and client navigation", async ({
  page,
}) => {
  const config = JSON.parse(readFileSync(".vercel/output/config.json", "utf8"));
  const headers = config.routes[0].headers as Record<string, string>;
  const csp = headers["Content-Security-Policy"];
  expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");
  await page.addInitScript(() => {
    const probe = window as unknown as { cspViolations: string[] };
    probe.cspViolations = [];
    document.addEventListener("securitypolicyviolation", (event) =>
      probe.cspViolations.push(event.violatedDirective),
    );
  });
  const response = await page.goto("/studio/");
  for (const [name, value] of Object.entries(headers))
    expect(response?.headers()[name.toLowerCase()]).toBe(value);
  await page
    .getByRole("textbox", { name: "Message text", exact: true })
    .fill("CSP preview");
  await page
    .getByRole("combobox", { name: "Output renderer", exact: true })
    .selectOption("svg");
  const preview = page.getByRole("img", { name: "CSP preview", exact: true });
  await expect(preview).toBeVisible();
  expect(
    await preview.evaluate(
      (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
    ),
  ).toBe(true);
  await page.getByRole("link", { name: "Docs", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Use ConsoleFX in your app.",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Playground", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Message text", exact: true }),
  ).toHaveValue("CSP preview");
  expect(
    await page.evaluate(
      () => (window as unknown as { cspViolations: string[] }).cspViolations,
    ),
  ).toEqual([]);
});
test("gallery, editing, one explicit emission and complete clipboard export", async ({
  page,
  clipboard,
}) => {
  const logs: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "log") logs.push(message.text());
  });
  await page.goto("/#playground");
  await page.locator(".full-preset-gallery > summary").click();
  const editor = page.locator("#editor-workspace");
  await expect(
    page.getByRole("button", { name: "Load Neon preset", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Load Neon preset", exact: true })
    .click();
  await editor
    .getByRole("textbox", { name: "Message text", exact: true })
    .fill("100% %c %s 👩🏽‍💻");
  await expect(
    editor.getByLabel("Generated code", { exact: true }),
  ).toHaveValue(/100%% %%c %%s/);
  expect(logs).toHaveLength(0);
  await editor
    .getByRole("button", { name: "Test in console", exact: true })
    .click();
  expect(logs).toHaveLength(1);
  await editor
    .getByRole("button", { name: "Copy console.log", exact: true })
    .click();
  const copied = await clipboard.readText();
  expect(copied).toBe(
    await editor.getByLabel("Generated code", { exact: true }).inputValue(),
  );
  expect(copied.match(/console\.log\(/g)).toHaveLength(1);
  expect(logs).toHaveLength(1);
  await expect
    .poll(() => page.evaluate((key) => localStorage.getItem(key), draftKey))
    .toContain("100% %c %s");
  await page.reload();
  await expect(
    editor.getByRole("textbox", { name: "Message text", exact: true }),
  ).toHaveValue("100% %c %s 👩🏽‍💻");
  expect(logs).toHaveLength(1);
});

test("imports validate before replacement, preserve failure state, and undo/redo once", async ({
  page,
}) => {
  await page.goto("/studio/");
  const text = page.getByRole("textbox", { name: "Message text", exact: true });
  await text.fill("My saved work");
  const input = page.locator('input[type="file"]');
  for (const source of [
    "{",
    '{"schemaVersion":99}',
    JSON.stringify(neon({ text: "bad" })).replace('"bad"', '"\\u001b[31m"'),
  ]) {
    await input.setInputFiles({
      name: "invalid.json",
      mimeType: "application/json",
      buffer: Buffer.from(source),
    });
    await expect(page.locator(".editor-status")).toContainText(/unchanged/);
    await expect(text).toHaveValue("My saved work");
  }
  await input.setInputFiles({
    name: "valid.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(rainbow({ text: "Imported scene" }))),
  });
  await expect(text).toHaveValue("Imported scene");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(text).toHaveValue("My saved work");
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(text).toHaveValue("Imported scene");
  await page
    .getByRole("combobox", { name: "Output renderer", exact: true })
    .selectOption("svg");
  await expect(
    page.getByRole("img", { name: "Imported scene", exact: true }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe("console-fx-scene.json");
  const chunks: Buffer[] = [];
  for await (const chunk of await file.createReadStream())
    chunks.push(Buffer.from(chunk));
  expect(JSON.parse(Buffer.concat(chunks).toString("utf8"))).toEqual(
    rainbow({ text: "Imported scene" }),
  );
});

test("valid drafts resume without writes and conflicting shared scenes confirm", async ({
  page,
}) => {
  const draft = neon({ text: "Local draft" });
  const shared = neon({ text: "Shared scene" });
  const fragment = encodeShare(shared);
  if (!fragment.ok) throw new Error("fixture invalid");
  await page.addInitScript(
    ({ key, value }) => {
      localStorage.setItem(key, value);
      const original = Storage.prototype.setItem;
      const observation = window as unknown as { draftWrites: number };
      observation.draftWrites = 0;
      Storage.prototype.setItem = function (...args) {
        observation.draftWrites++;
        return original.apply(this, args);
      };
    },
    { key: draftKey, value: JSON.stringify(draft) },
  );
  await page.goto(`/${fragment.value}`);
  await expect(
    page.getByRole("dialog", { name: "Load the shared scene?" }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Message text", exact: true }),
  ).toHaveValue("Local draft");
  expect(
    await page.evaluate(
      () => (window as unknown as { draftWrites: number }).draftWrites,
    ),
  ).toBe(0);
  await page
    .getByRole("button", { name: "Keep current scene", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Message text", exact: true }),
  ).toHaveValue("Local draft");
  await page.reload();
  await page
    .getByRole("button", { name: "Load shared scene", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Message text", exact: true }),
  ).toHaveValue("Shared scene");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Message text", exact: true }),
  ).toHaveValue("Local draft");
});

test("reset confirms and repeated clear prevents stale autosave resurrection", async ({
  page,
}) => {
  await page.goto("/studio/");
  const text = page.getByRole("textbox", { name: "Message text", exact: true });
  await text.fill("Keep this work");
  await expect
    .poll(() => page.evaluate((key) => localStorage.getItem(key), draftKey))
    .toContain("Keep this work");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page
    .getByRole("button", { name: "Keep current scene", exact: true })
    .click();
  await expect(text).toHaveValue("Keep this work");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByRole("button", { name: "Reset scene", exact: true }).click();
  await expect(text).toHaveValue("Hello, developer.");
  await expect(
    page.getByRole("button", { name: "Undo", exact: true }),
  ).toBeDisabled();
  await page.waitForTimeout(500);
  expect(
    await page.evaluate((key) => localStorage.getItem(key), draftKey),
  ).toContain("Keep this work");
  await text.fill("An edit queued for saving");
  await page
    .getByRole("button", { name: "Clear local draft", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Clear local draft", exact: true })
    .click();
  await page.waitForTimeout(500);
  expect(
    await page.evaluate((key) => localStorage.getItem(key), draftKey),
  ).toBeNull();
  await expect(text).toHaveValue("An edit queued for saving");
  await text.fill("A later committed edit");
  await expect
    .poll(() => page.evaluate((key) => localStorage.getItem(key), draftKey))
    .toContain("A later committed edit");
});

test("corrupt storage is retained until clear and clipboard denial is recoverable", async ({
  page,
}) => {
  await page.addInitScript((key) => {
    localStorage.setItem(key, "corrupt draft");
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("denied");
        },
      },
    });
  }, draftKey);
  await page.goto("/studio/");
  await expect(page.locator(".editor-status")).toContainText(
    "could not be restored",
  );
  await page
    .getByRole("textbox", { name: "Message text", exact: true })
    .fill("Still editable");
  await page
    .getByRole("button", { name: "Copy console.log", exact: true })
    .click();
  await expect(page.locator(".editor-status")).toContainText(
    "Clipboard access failed",
  );
  await page.waitForTimeout(500);
  expect(
    await page.evaluate((key) => localStorage.getItem(key), draftKey),
  ).toBe("corrupt draft");
  await page
    .getByRole("button", { name: "Clear local draft", exact: true })
    .click();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), draftKey),
  ).toBeNull();
  await expect(
    page.getByRole("textbox", { name: "Message text", exact: true }),
  ).toHaveValue("Still editable");
});

test("reduced motion, labelled controls, keyboard focus, reflow and automated accessibility", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/studio/");
  await page
    .getByRole("combobox", { name: "Output renderer", exact: true })
    .selectOption("svg");
  await page
    .getByRole("combobox", { name: "Add an effect", exact: true })
    .selectOption("wave");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(page.locator(".editor-status")).toContainText("reduced motion");
  const uri = await page
    .getByRole("img", { name: "Hello, developer.", exact: true })
    .getAttribute("src");
  expect(decodeURIComponent(uri!)).not.toContain("<animate");
  await expect(
    page.getByRole("slider", { name: "Font size", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("dialog", { name: "Start a fresh message?" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Reset", exact: true }),
  ).toBeFocused();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `.artifacts/studio-${testInfo.project.name}.png`,
    fullPage: true,
  });
});

test("landing and documentation have no automated critical accessibility violations", async ({
  page,
}) => {
  for (const path of ["/", "/docs/"]) {
    await page.goto(path);
    if (path === "/")
      await expect(
        page
          .locator(".quick-demo")
          .getByRole("button", { name: "Test in console", exact: true }),
      ).toBeEnabled();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    ).toBe(true);
  }
});
