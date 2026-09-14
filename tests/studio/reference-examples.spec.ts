import { compileConsole } from "../../packages/console-fx/dist/browser/index.js";
import { resolveExample } from "../../apps/studio/src/features/examples/catalogue";
import { test, expect } from "./fixtures";
const get = (id: string) => {
  const result = resolveExample({ exampleId: `reference:${id}` });
  if (!result.ok) throw Error(result.message);
  return result.recipe;
};
test("catalogue selection exports complete data and undoes as one step", async ({
  page,
}) => {
  await page.goto("/studio/");
  const message = page.getByRole("textbox", {
    name: "Message text",
    exact: true,
  });
  await message.fill("KEEP THIS DRAFT");
  const picker = page.getByRole("combobox", {
    name: "Start from a preset",
    exact: true,
  });
  await expect(picker.locator("option")).toHaveCount(44);
  await picker.selectOption("reference:multilineLayout");
  await page.getByRole("button", { name: "Load example", exact: true }).click();
  const recipe = get("multilineLayout");
  const output = compileConsole(recipe.scene, {
    ...recipe.options,
    motion: "reduce",
  });
  if (output.preview.kind !== "svg") throw Error("SVG expected");
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
  await expect(message).toHaveValue("KEEP THIS DRAFT");
});
test("search finds the full dolphin; static export, deliberate playback and draft recovery share one recipe", async ({
  page,
  clipboard,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    (window as unknown as { calls: unknown[][] }).calls = [];
    console.log = (...args) =>
      (window as unknown as { calls: unknown[][] }).calls.push(args);
  });
  await page.goto("/studio/");
  await page
    .getByRole("searchbox", { name: "Search examples", exact: true })
    .fill("dolphin");
  const catalogue = page.getByRole("complementary", {
    name: "Example catalogue",
  });
  await catalogue.getByRole("button", { name: /^Animated dolphin/ }).click();
  await page.getByRole("button", { name: "Load example", exact: true }).click();
  const recipe = get("animatedDolphin");
  const still = compileConsole(recipe.scene, {
    ...recipe.options,
    motion: "reduce",
  });
  const moving = compileConsole(recipe.scene, {
    ...recipe.options,
    motion: "allow",
  });
  if (still.preview.kind !== "svg" || moving.preview.kind !== "svg")
    throw Error("SVG expected");
  await expect(page.locator(".preview-content img")).toHaveAttribute(
    "src",
    still.preview.imageUri,
  );
  const source = page.getByLabel("Generated code", { exact: true });
  const code = await source.inputValue();
  await page
    .getByRole("button", { name: "Copy console.log", exact: true })
    .click();
  expect(await clipboard.readText()).toBe(code);
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(page.locator(".preview-content img")).toHaveAttribute(
    "src",
    moving.preview.imageUri,
  );
  await page.getByRole("button", { name: "Show static", exact: true }).click();
  await expect(page.locator(".preview-content img")).toHaveAttribute(
    "src",
    still.preview.imageUri,
  );
  await expect(source).toHaveValue(code);
  expect(
    await page.evaluate(
      () => (window as unknown as { calls: unknown[][] }).calls,
    ),
  ).toEqual([]);
  await page
    .getByRole("button", { name: "Test in console", exact: true })
    .click();
  expect(
    await page.evaluate(
      () => (window as unknown as { calls: unknown[][] }).calls,
    ),
  ).toEqual([still.args]);
  await expect
    .poll(() =>
      page.evaluate(() =>
        JSON.parse(localStorage.getItem("console-fx:recipe:v1") ?? "null"),
      ),
    )
    .toEqual(recipe);
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "Message text", exact: true }),
  ).toHaveValue(recipe.scene.lines[0]!.runs[0]!.text);
});
