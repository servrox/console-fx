import AxeBuilder from "@axe-core/playwright";
import {
  lightningMetal,
  iceCathedral,
  liquidChrome,
  moltenGold,
} from "../../packages/console-fx/dist/presets/index.js";
import { compileConsole } from "../../packages/console-fx/dist/browser/index.js";
import { encodeShare } from "../../apps/studio/src/features/persistence/documents";
import { test, expect } from "./fixtures";

const titles = [
  ["Lightning Metal", lightningMetal],
  ["Ice Cathedral", iceCathedral],
  ["Liquid Chrome", liquidChrome],
  ["Molten Gold", moltenGold],
] as const;

test("cinematic gallery uses exact static previews, editable controls and one explicit call", async ({
  page,
  clipboard,
}) => {
  const calls: string[] = [];
  page.on("console", (event) => {
    if (event.type() === "log") calls.push(event.text());
  });
  await page.goto("/#playground");
  await page.locator(".full-preset-gallery > summary").click();
  const editor = page.locator("#editor-workspace");
  for (const [name, factory] of titles) {
    const card = page.getByRole("button", {
      name: `Load ${name} preset`,
      exact: true,
    });
    const output = compileConsole(factory(), {
      target: "chromium",
      renderer: "svg",
    });
    if (output.preview.kind !== "svg") throw new Error("SVG fixture required");
    await expect(card.locator("img")).toHaveAttribute(
      "src",
      output.preview.imageUri,
    );
    await card.click();
    await expect(
      editor.getByRole("combobox", { name: "Output renderer", exact: true }),
    ).toHaveValue("svg");
    await expect(
      editor.getByRole("img", { name: factory().label, exact: true }),
    ).toHaveAttribute("src", output.preview.imageUri);
  }
  await editor
    .getByRole("textbox", { name: "Message text", exact: true })
    .fill("BUILD 2026");
  await expect(
    editor.getByRole("combobox", { name: "Font", exact: true }),
  ).toBeDisabled();
  await expect(
    editor.getByRole("slider", { name: "Weight", exact: true }),
  ).toBeDisabled();
  await expect(
    editor.getByRole("slider", { name: "Font size", exact: true }),
  ).toBeEnabled();
  await expect(
    editor.getByRole("slider", { name: "Letter spacing", exact: true }),
  ).toBeEnabled();
  await editor
    .getByRole("checkbox", { name: "Ornaments", exact: true })
    .uncheck();
  await expect(
    editor.getByLabel("Generated code", { exact: true }),
  ).toHaveValue(/^console\.log\(/);
  const renderer = editor.getByRole("combobox", {
    name: "Output renderer",
    exact: true,
  });
  await renderer.selectOption("css");
  await editor
    .getByRole("textbox", { name: "Message text", exact: true })
    .fill("EDIT IN CSS");
  await expect(renderer).toHaveValue("css");
  await expect(
    editor.getByRole("button", { name: "Copy console.log", exact: true }),
  ).toBeDisabled();
  await editor
    .getByRole("button", { name: "Use SVG renderer", exact: true })
    .click();
  expect(calls).toHaveLength(0);
  await editor
    .getByRole("button", { name: "Copy console.log", exact: true })
    .click();
  const code = await editor
    .getByLabel("Generated code", { exact: true })
    .inputValue();
  expect(await clipboard.readText()).toBe(code);
  expect(code.match(/console\.log\(/g)).toHaveLength(1);
  expect(code).not.toMatch(/matchMedia|<animate|requestAnimationFrame/);
  expect(calls).toHaveLength(0);
  await editor
    .getByRole("button", { name: "Test in console", exact: true })
    .click();
  expect(calls).toHaveLength(1);
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("console-fx:recipe:v1")),
    )
    .toContain("EDIT IN CSS");
  await page.reload();
  await expect(
    editor.getByRole("combobox", { name: "Output renderer", exact: true }),
  ).toHaveValue("svg");
  await expect(
    editor.getByRole("textbox", { name: "Message text", exact: true }),
  ).toHaveValue("EDIT IN CSS");
  expect(calls).toHaveLength(1);
});

test("cinematic import, history, shared scenes and invalid glyph recovery preserve work", async ({
  page,
}) => {
  await page.goto("/studio/");
  const text = page.getByRole("textbox", { name: "Message text", exact: true });
  const renderer = page.getByRole("combobox", {
    name: "Output renderer",
    exact: true,
  });
  await text.fill("Original work");
  const scene = lightningMetal({ text: "IMPORTED" });
  await page.locator('input[type="file"]').setInputFiles({
    name: "scene.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(scene)),
  });
  await expect(renderer).toHaveValue("svg");
  await expect(text).toHaveValue("IMPORTED");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(text).toHaveValue("Original work");
  await renderer.selectOption("css");
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(renderer).toHaveValue("svg");
  await text.fill("100% 👩🏽‍💻");
  await expect(
    page.getByRole("button", { name: "Copy console.log", exact: true }),
  ).toBeDisabled();
  await expect(text).toHaveValue("100% 👩🏽‍💻");
  await page
    .getByRole("combobox", { name: "Profile", exact: true })
    .selectOption("liquid-chrome-v1");
  await expect(
    page.getByRole("button", { name: "Copy console.log", exact: true }),
  ).toBeEnabled();
  const share = encodeShare(moltenGold({ text: "SHARED" }));
  if (!share.ok) throw new Error("Invalid fixture");
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("console-fx:scene:v1")),
    )
    .toContain("100%");
  await page.goto(`/studio/${share.value}`);
  await page
    .getByRole("button", { name: "Load shared scene", exact: true })
    .click();
  await expect(text).toHaveValue("SHARED");
  await expect(renderer).toHaveValue("svg");
  await page.getByRole("button", { name: "Reset", exact: true }).focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Reset", exact: true }),
  ).toBeFocused();
  await expect(text).toHaveValue("SHARED");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
});
