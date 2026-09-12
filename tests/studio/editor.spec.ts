import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import { neon, rainbow } from "../../packages/console-fx/dist/presets/index.js";
import { encodeShare } from "../../apps/studio/src/features/persistence/documents";
import { test, expect } from "./fixtures";

const draftKey = "console-fx:scene:v1";

test("prepared deployment CSP permits hydration, exact SVG previews and client navigation", async ({
  page,
}) => {
  const config = JSON.parse(readFileSync(".vercel/output/config.json", "utf8"));
  const csp = config.routes[0].headers["Content-Security-Policy"] as string;
  expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");
  await page.route("**/*", async (route) => {
    if (route.request().resourceType() !== "document") return route.continue();
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: { ...response.headers(), "content-security-policy": csp },
    });
  });
  await page.addInitScript(() => {
    const probe = window as unknown as { cspViolations: string[] };
    probe.cspViolations = [];
    document.addEventListener("securitypolicyviolation", (event) =>
      probe.cspViolations.push(event.violatedDirective),
    );
  });
  await page.goto("/studio/");
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
      name: "Make one message your own.",
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
  context,
}) => {
  const logs: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "log") logs.push(message.text());
  });
  await page.goto("/");
  const editor = page.locator("#playground");
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
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await editor
    .getByRole("button", { name: "Copy console.log", exact: true })
    .click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
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
  expect((await download).suggestedFilename()).toBe("console-fx-scene.json");
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
        page.getByRole("button", { name: "Load Neon preset", exact: true }),
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
