import AxeBuilder from "@axe-core/playwright";
import { getPresentationDescriptors } from "../../packages/console-fx/dist/index.js";
import { compileConsole } from "../../packages/console-fx/dist/browser/index.js";
import { createPresetExample } from "../../packages/console-fx/dist/presets/index.js";
import { test, expect } from "./fixtures";

test("all ten card previews use the shared compiler and named fields stay silent", async ({
  page,
  context,
}) => {
  const calls: string[] = [];
  page.on("console", (event) => {
    if (event.type() === "log") calls.push(event.text());
  });
  await page.goto("/#playground");
  await page.locator(".full-preset-gallery > summary").click();
  const editor = page.locator("#editor-workspace");
  for (const descriptor of getPresentationDescriptors()) {
    const scene = createPresetExample(descriptor.id);
    const output = compileConsole(scene, {
      renderer: "svg",
      target: "chromium",
    });
    if (output.preview.kind !== "svg") throw Error("SVG expected");
    const card = page.getByRole("button", {
      name: `Load ${descriptor.name} preset`,
      exact: true,
    });
    await expect(card.locator("img")).toHaveAttribute(
      "src",
      output.preview.imageUri,
    );
    await card.click();
    await expect(editor.getByLabel("Scene label", { exact: true })).toHaveValue(
      scene.label,
    );
    await expect(editor.locator(".preview-content img")).toHaveAttribute(
      "src",
      output.preview.imageUri,
    );
    for (const slot of descriptor.slots)
      await expect(
        editor.getByRole(slot.values ? "combobox" : "textbox", {
          name: slot.label,
          exact: true,
        }),
      ).toHaveValue(scene.lines[slot.line]!.runs[slot.run]!.text);
  }
  await page.locator(".full-preset-gallery > summary").click();
  await editor
    .getByRole("combobox", { name: "Start from a preset", exact: true })
    .selectOption("buildReceipt");
  await editor
    .getByRole("textbox", { name: "Project", exact: true })
    .fill("My %s build");
  await editor
    .getByRole("combobox", { name: "Outcome", exact: true })
    .selectOption("WARNING");
  await expect(editor.getByLabel("Font size", { exact: true })).toBeDisabled();
  await expect(
    editor.getByRole("combobox", { name: "Add an effect", exact: true }),
  ).toBeDisabled();
  await editor
    .getByRole("combobox", { name: "Format", exact: true })
    .selectOption("json");
  const source = editor.getByLabel("Generated code", { exact: true });
  const saved = JSON.parse(await source.inputValue());
  expect(saved.lines[1].runs[0].text).toBe("My %s build");
  expect(saved.presentation.profile).toBe("buildReceipt/v1");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await editor
    .getByRole("button", { name: "Copy scene JSON", exact: true })
    .click();
  expect(
    JSON.parse(await page.evaluate(() => navigator.clipboard.readText())),
  ).toEqual(saved);
  expect(calls).toHaveLength(0);
  await editor
    .getByRole("button", { name: "Test in console", exact: true })
    .click();
  expect(calls).toHaveLength(1);
  await editor
    .getByRole("button", { name: "Detach card layout", exact: true })
    .click();
  expect(JSON.parse(await source.inputValue()).presentation).toBeUndefined();
  await editor.getByRole("button", { name: "Undo", exact: true }).click();
  expect(JSON.parse(await source.inputValue())).toEqual(saved);
  expect(
    (await new AxeBuilder({ page }).include("#editor-workspace").analyze())
      .violations,
  ).toEqual([]);
});

test("card tone, valid drafts and imports survive errors, undo and reload", async ({
  page,
}) => {
  const calls: string[] = [];
  page.on("console", (event) => {
    if (event.type() === "log") calls.push(event.text());
  });
  await page.goto("/studio/");
  const editor = page.locator("#playground");
  await editor
    .getByRole("combobox", { name: "Start from a preset", exact: true })
    .selectOption("requestTrace");
  await editor
    .getByRole("combobox", { name: "Tone", exact: true })
    .selectOption("error");
  await editor
    .getByRole("combobox", { name: "Format", exact: true })
    .selectOption("json");
  const source = editor.getByLabel("Generated code", { exact: true });
  const saved = await source.inputValue();
  expect(JSON.parse(saved).presentation.tone).toBe("error");
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("console-fx:scene:v1")),
    )
    .toContain("requestTrace/v1");
  await page.reload();
  await expect(
    editor.getByRole("combobox", { name: "Tone", exact: true }),
  ).toHaveValue("error");
  await editor
    .getByRole("combobox", { name: "Format", exact: true })
    .selectOption("json");
  expect(JSON.parse(await source.inputValue())).toEqual(JSON.parse(saved));
  await page.getByLabel("Import JSON", { exact: true }).setInputFiles({
    name: "future.json",
    mimeType: "application/json",
    buffer: Buffer.from(saved.replace("requestTrace/v1", "requestTrace/v9")),
  });
  expect(JSON.parse(await source.inputValue())).toEqual(JSON.parse(saved));
  const letterpress = createPresetExample("letterpress");
  await page.getByLabel("Import JSON", { exact: true }).setInputFiles({
    name: "letterpress.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(letterpress)),
  });
  await expect(
    editor.getByRole("textbox", { name: "Title", exact: true }),
  ).toHaveValue("Make it matter.");
  await editor.getByRole("button", { name: "Undo", exact: true }).click();
  expect(JSON.parse(await source.inputValue())).toEqual(JSON.parse(saved));
  expect(calls).toHaveLength(0);
});

test("long card content stays available for JSON and explicit text output", async ({
  page,
}) => {
  await page.goto("/studio/");
  const editor = page.locator("#playground");
  await editor
    .getByRole("combobox", { name: "Start from a preset", exact: true })
    .selectOption("letterpress");
  await editor
    .getByRole("textbox", { name: "Title", exact: true })
    .fill("W".repeat(90));
  await expect(
    editor.getByRole("button", { name: "Test in console", exact: true }),
  ).toBeDisabled();
  await editor
    .getByRole("combobox", { name: "Format", exact: true })
    .selectOption("json");
  await expect(
    editor.getByRole("button", { name: "Copy scene JSON", exact: true }),
  ).toBeEnabled();
  expect(
    JSON.parse(
      await editor.getByLabel("Generated code", { exact: true }).inputValue(),
    ).lines[1].runs[0].text,
  ).toBe("W".repeat(90));
  await editor
    .getByRole("combobox", { name: "Output renderer", exact: true })
    .selectOption("text");
  await expect(
    editor.getByRole("button", { name: "Test in console", exact: true }),
  ).toBeEnabled();
});
