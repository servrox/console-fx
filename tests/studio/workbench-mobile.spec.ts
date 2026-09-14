import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
});

test("mobile discovery retains one editor through panels, confirmation, copy and Undo", async ({
  page,
  clipboard,
}) => {
  await page.goto("/studio/");
  const text = page.getByRole("textbox", { name: "Message text", exact: true });
  await text.fill("MY SIGNATURE");
  const handle = await text.elementHandle();
  await page.getByRole("tab", { name: "Output", exact: true }).click();
  await expect(page.locator(".preview-content img")).toBeVisible();
  await page.getByRole("tab", { name: "Code", exact: true }).click();
  const code = page.getByLabel("Generated code", { exact: true });
  const source = await code.inputValue();
  await page
    .getByRole("button", { name: "Copy console.log", exact: true })
    .click();
  expect(await clipboard.readText()).toBe(source);
  await page.getByRole("tab", { name: "Edit", exact: true }).click();
  expect(
    await text.evaluate((element, original) => element === original, handle),
  ).toBe(true);
  await expect(text).toHaveValue("MY SIGNATURE");
  const drawer = page.getByRole("button", { name: /Browse examples/ });
  await drawer.click();
  await page
    .getByRole("combobox", { name: "Visual style", exact: true })
    .selectOption("card");
  await page
    .getByRole("searchbox", { name: "Search examples", exact: true })
    .fill("build receipt");
  await page
    .getByRole("complementary", { name: "Example catalogue" })
    .getByRole("button", { name: /^Build Receipt/ })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Load this example?" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Keep current scene", exact: true })
    .click();
  await expect(drawer).toBeFocused();
  await expect(text).toHaveValue("MY SIGNATURE");
  await drawer.click();
  await page
    .getByRole("complementary", { name: "Example catalogue" })
    .getByRole("button", { name: /^Build Receipt/ })
    .click();
  await page.getByRole("button", { name: "Load example", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Project", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(text).toHaveValue("MY SIGNATURE");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});
test("mobile import recovery and Reset preserve content, focus and readable panels", async ({
  page,
}) => {
  await page.goto("/studio/?example=reference%3AmultilineLayout");
  const text = page.getByRole("textbox", { name: "Message text", exact: true });
  await text.fill("saved on phone");
  await page.getByLabel("Import JSON", { exact: true }).setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from("{"),
  });
  await expect(page.locator(".editor-status")).toContainText("unchanged");
  await expect(text).toHaveValue("saved on phone");
  const reset = page.getByRole("button", { name: "Reset", exact: true });
  await reset.click();
  await page.keyboard.press("Escape");
  await expect(reset).toBeFocused();
  for (const name of ["Edit", "Output", "Code"]) {
    await page.getByRole("tab", { name, exact: true }).click();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  }
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Docs", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Workbench", exact: true })
    .click();
  await expect(text).toHaveValue("saved on phone");
});
