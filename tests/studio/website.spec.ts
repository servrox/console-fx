import AxeBuilder from "@axe-core/playwright";
import { compileConsole } from "../../packages/console-fx/dist/browser/index.js";
import { neon } from "../../packages/console-fx/dist/presets/index.js";
import {
  CATEGORIES,
  resolveExample,
} from "../../apps/studio/src/features/examples/catalogue";
import { prepareExport } from "../../apps/studio/src/features/export/prepare-export";
import { test, expect } from "./fixtures";

const get = (id: string) => {
  const result = resolveExample({ exampleId: id });
  if (!result.ok) throw Error(result.message);
  return result.recipe;
};
test("cinematic hero pairs exact static output and complete copyable code without changing drafts", async ({
  page,
  clipboard,
}) => {
  const prior = neon({ text: "Keep my draft" });
  await page.addInitScript(
    (scene) =>
      localStorage.setItem("console-fx:scene:v1", JSON.stringify(scene)),
    prior,
  );
  const logs: string[] = [];
  page.on("console", (entry) => {
    if (entry.type() === "log") logs.push(entry.text());
  });
  await page.goto("/");
  const hero = page.getByRole("region", { name: "Explore console use cases" });
  await expect(hero.getByRole("tab")).toHaveCount(6);
  await expect(hero.getByLabel("Cinematic design")).toHaveValue(
    "preset:lightningMetal",
  );
  await expect(page.locator("#editor-workspace")).toHaveCount(0);
  await expect(page.locator("video")).toHaveCount(0);
  await hero.getByRole("button", { name: "Show output", exact: true }).click();
  const recipe = get("preset:lightningMetal");
  const output = compileConsole(recipe.scene, {
    ...recipe.options,
    motion: "reduce",
  });
  if (output.preview.kind !== "svg") throw Error("SVG expected");
  await expect(hero.locator(".complete-output img")).toHaveAttribute(
    "src",
    output.preview.imageUri,
  );
  await hero.getByLabel("Cinematic design").selectOption("preset:moltenGold");
  await hero.getByRole("button", { name: "Show code", exact: true }).click();
  const source = prepareExport(get("preset:moltenGold")).source("typescript");
  await expect(hero.getByLabel("Complete package recipe")).toHaveText(source);
  const copy = hero.getByRole("button", { name: "Copy recipe", exact: true });
  await copy.hover();
  await expect(hero.locator(".copy-status")).not.toContainText("copied");
  await copy.click();
  expect(await clipboard.readText()).toBe(source);
  await expect(hero.locator(".copy-status")).toContainText("Recipe copied");
  expect(logs).toEqual([]);
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("console-fx:scene:v1")!),
    ),
  ).toEqual(prior);
});
test("use-case tabs and reveal work with keyboard and complete narrow panels", async ({
  page,
}, info) => {
  await page.goto("/");
  const hero = page.getByRole("region", { name: "Explore console use cases" });
  const first = hero.getByRole("tab").first();
  await first.focus();
  await page.keyboard.press("End");
  await expect(hero.getByRole("tab").last()).toBeFocused();
  await expect(hero.getByRole("tab").last()).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.keyboard.press("Home");
  await expect(first).toBeFocused();
  if (info.project.name === "desktop") {
    await hero.getByRole("button", { name: "Compare", exact: true }).click();
    const slider = hero.getByRole("slider", { name: "Reveal output and code" });
    await slider.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(slider).toHaveValue("61");
    const bounds = await slider.boundingBox();
    if (!bounds) throw Error("slider missing");
    await page.mouse.click(
      bounds.x + bounds.width * 0.8,
      bounds.y + bounds.height / 2,
    );
    expect(Number(await slider.inputValue())).toBeGreaterThan(70);
  } else await expect(hero.getByRole("slider")).toBeHidden();
  await hero.getByRole("button", { name: "Show code", exact: true }).click();
  await expect(hero.getByLabel("Complete package recipe")).toBeVisible();
  await hero.getByRole("button", { name: "Show output", exact: true }).click();
  await expect(hero.locator(".complete-output img")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});
test("blocked hero copying retains the exact attempted recipe across tab changes", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw Error("denied");
        },
      },
    }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Copy recipe", exact: true }).click();
  const recovery = page.getByLabel("Recipe from the blocked copy attempt");
  const expected = prepareExport(get("preset:lightningMetal")).source(
    "typescript",
  );
  await expect(recovery).toHaveValue(expected);
  await page
    .getByRole("tab", { name: CATEGORIES[1]!.name, exact: true })
    .click();
  await expect(recovery).toHaveValue(expected);
  await expect(
    page.getByRole("button", { name: "Copy recipe", exact: true }),
  ).toBeEnabled();
});
test("effects off and reduced motion preserve usable content and static recipes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.getByRole("button", { name: "Turn off", exact: true }).click();
  await expect(page.locator("[data-page-effects]")).toHaveAttribute(
    "data-page-effects",
    "off",
  );
  await page.getByRole("tab").last().click();
  await page.getByRole("button", { name: "Show code", exact: true }).click();
  const code = await page.getByLabel("Complete package recipe").textContent();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Turn on", exact: true }).click();
  await expect(page.locator("[data-page-effects]")).toHaveAttribute(
    "data-page-effects",
    "off",
  );
  await expect(page.getByLabel("Complete package recipe")).toHaveText(code!);
  expect(
    await page.evaluate(
      () =>
        document.getAnimations().filter((a) => a.playState === "running")
          .length,
    ),
  ).toBe(0);
});
test("landing and Docs keep complete navigation, notices and accessible content", async ({
  page,
}) => {
  for (const path of ["/", "/docs/"]) {
    await page.goto(path);
    await expect(
      page
        .getByRole("navigation", { name: "Main navigation" })
        .getByRole("link", { name: "Workbench", exact: true }),
    ).toHaveAttribute("href", "/studio/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  }
  const notices = await page.request.get("/licenses.txt");
  expect(await notices.text()).toContain("SYED  SUBHAN UDDIN");
});
test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("product explanation, default output, categories and Docs remain available", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator(".complete-output img")).toBeVisible();
    await expect(page.locator(".category-links a")).toHaveCount(6);
    await expect(
      page.getByRole("button", { name: "Copy recipe", exact: true }),
    ).toBeDisabled();
    await page
      .getByRole("link", { name: "Integration guide", exact: true })
      .click();
    await expect(page.locator(".docs-page")).toBeVisible();
  });
});
