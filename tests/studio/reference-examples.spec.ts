import { mkdirSync } from "node:fs";
import { compileConsole } from "../../packages/console-fx/dist/browser/index.js";
import {
  REFERENCE_EXAMPLES,
  referenceRecipe,
} from "../../apps/studio/src/features/examples/reference-examples";
import { test, expect } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const probe = window as unknown as { referenceCalls: unknown[][] };
    probe.referenceCalls = [];
    console.log = (...args) => probe.referenceCalls.push(args);
  });
});

test("all reference examples are editable, export exact data and undo as one step", async ({
  page,
}) => {
  await page.goto("/studio/");
  const message = page.getByRole("textbox", {
    name: "Message text",
    exact: true,
  });
  await message.fill("Keep this draft %s");
  const picker = page.getByRole("combobox", {
    name: "Start from a preset",
    exact: true,
  });
  for (const { id } of REFERENCE_EXAMPLES) {
    await picker.selectOption(`example:${id}`);
    const recipe = referenceRecipe(id);
    const output = compileConsole(recipe.scene, recipe.options);
    if (output.preview.kind !== "svg") throw new Error("SVG expected");
    await expect(page.locator(".preview-content img")).toHaveAttribute(
      "src",
      output.preview.imageUri,
    );
    const calls: unknown[][] = [];
    new Function(
      "console",
      await page.getByLabel("Generated code", { exact: true }).inputValue(),
    )({ log: (...args: unknown[]) => calls.push(args) });
    expect(calls).toEqual([output.args]);
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(message).toHaveValue("Keep this draft %s");
  }
  expect(
    await page.evaluate(
      () => (window as unknown as { referenceCalls: unknown[] }).referenceCalls,
    ),
  ).toEqual([]);
});

test("the complete gallery transfers the exact dolphin, keeps it static and copies without logging", async ({
  page,
  clipboard,
}) => {
  await page.goto("/");
  const gallery = page.locator(".reference-gallery");
  await expect(gallery.locator("img")).toHaveCount(0);
  await gallery.locator("summary").click();
  await expect(gallery.locator(".example-card")).toHaveCount(
    REFERENCE_EXAMPLES.length,
  );
  for (const { id, name } of REFERENCE_EXAMPLES) {
    const output = compileConsole(
      referenceRecipe(id).scene,
      referenceRecipe(id).options,
    );
    if (output.preview.kind !== "svg") throw new Error("SVG expected");
    const card = gallery.getByRole("button", {
      name: `Edit ${name} example`,
      exact: true,
    });
    await expect(card.locator("img")).toHaveAttribute(
      "src",
      output.preview.imageUri,
    );
  }
  await expect
    .poll(() =>
      gallery
        .locator("img")
        .evaluateAll((images) =>
          images.every(
            (image) =>
              (image as HTMLImageElement).complete &&
              (image as HTMLImageElement).naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
  mkdirSync(".artifacts/reference-examples", { recursive: true });
  await gallery.screenshot({
    path: `.artifacts/reference-examples/gallery-${test.info().project.name}.png`,
  });
  await gallery
    .getByRole("button", { name: "Edit Animated dolphin example", exact: true })
    .click();
  const confirm = page.getByRole("button", {
    name: "Load example",
    exact: true,
  });
  await confirm.click();
  const editor = page.locator("#editor-workspace");
  const recipe = referenceRecipe("animatedDolphin");
  await expect(
    editor.getByRole("textbox", { name: "Message text", exact: true }),
  ).toHaveValue(recipe.scene.lines[0]!.runs[0]!.text);
  const code = await editor
    .getByLabel("Generated code", { exact: true })
    .inputValue();
  await editor
    .getByRole("button", { name: "Copy console.log", exact: true })
    .click();
  expect(await clipboard.readText()).toBe(code);
  expect(
    await page.evaluate(
      () => (window as unknown as { referenceCalls: unknown[] }).referenceCalls,
    ),
  ).toEqual([]);
  await editor
    .getByRole("button", { name: "Test in console", exact: true })
    .click();
  expect(
    await page.evaluate(
      () => (window as unknown as { referenceCalls: unknown[] }).referenceCalls,
    ),
  ).toEqual([compileConsole(recipe.scene, recipe.options).args]);
  await expect
    .poll(() =>
      page.evaluate(() =>
        JSON.parse(localStorage.getItem("console-fx:recipe:v1") ?? "null"),
      ),
    )
    .toEqual(recipe);
  await page.reload();
  await page.locator("#playground").scrollIntoViewIfNeeded();
  await expect(
    editor.getByRole("textbox", { name: "Message text", exact: true }),
  ).toHaveValue(recipe.scene.lines[0]!.runs[0]!.text);
});
