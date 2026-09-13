import { mkdirSync, writeFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { neon } from "../../packages/console-fx/dist/presets/index.js";
import { compileConsole } from "../../packages/console-fx/dist/browser/index.js";
import { exampleRecipe } from "../../apps/studio/src/features/landing/examples";
import { encodeShare } from "../../apps/studio/src/features/persistence/documents";
import { test, expect } from "./fixtures";

const draftKey = "console-fx:scene:v1";
const recipeKey = "console-fx:recipe:v1";
const artifact = ".artifacts/website/states";
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const probe = window as unknown as { websiteCalls: unknown[][] };
    probe.websiteCalls = [];
    const log = console.log;
    console.log = (...args) => {
      probe.websiteCalls.push(args);
      log(...args);
    };
  });
});

for (const failure of ["missing", "throws"] as const) {
  test(`optional observers ${failure}: plain workflow transfer and undo remain usable`, async ({
    page,
  }) => {
    const prior = neon({ text: "Preserve my earlier work" });
    await page.addInitScript(
      ({ prior, key, failure }) => {
        localStorage.setItem(key, JSON.stringify(prior));
        const NativeObserver = window.IntersectionObserver;
        // Fault the application's optional observers. Next's pinned router
        // constructs its prefetch observer during module evaluation, before
        // application recovery can run; preserve that separate dependency.
        Object.defineProperty(window, "IntersectionObserver", {
          configurable: true,
          value:
            failure === "missing"
              ? undefined
              : class extends NativeObserver {
                  constructor(
                    callback: IntersectionObserverCallback,
                    options?: IntersectionObserverInit,
                  ) {
                    if (options?.rootMargin === "200px") {
                      super(callback, options);
                      return;
                    }
                    const probe = window as unknown as {
                      optionalObserverFailures?: number;
                    };
                    probe.optionalObserverFailures =
                      (probe.optionalObserverFailures ?? 0) + 1;
                    throw new Error("Optional observer unavailable");
                  }
                },
        });
      },
      { prior, key: draftKey, failure },
    );
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await expect(page.locator(".example-card")).toHaveCount(6);
    const workflow = page.locator(".use-case-comparison").first();
    await workflow.getByRole("button", { name: "Plain", exact: true }).click();
    await workflow
      .getByRole("button", { name: "Edit this example", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Load example", exact: true })
      .click();
    const editor = page.locator("#editor-workspace");
    await expect(editor).toBeVisible();
    await expect(
      editor.getByRole("combobox", { name: "Output renderer", exact: true }),
    ).toHaveValue("text");
    await editor.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(
      editor.getByRole("textbox", { name: "Message text", exact: true }),
    ).toHaveValue("Preserve my earlier work");
    expect(errors).toEqual([]);
    if (failure === "throws")
      expect(
        await page.evaluate(
          () =>
            (window as unknown as { optionalObserverFailures: number })
              .optionalObserverFailures,
        ),
      ).toBeGreaterThan(0);
    expect(
      await page.evaluate(
        () =>
          (window as unknown as { websiteCalls: unknown[] }).websiteCalls
            .length,
      ),
    ).toBe(0);
  });
}

test("hero edits, comparisons and copying use one scene and print only on request", async ({
  page,
  clipboard,
}) => {
  await page.goto("/");
  const demo = page.locator(".quick-demo");
  const text = demo.getByRole("textbox", { name: "Your message", exact: true });
  await text.fill("100% %c %s 👩🏽‍💻");
  await demo
    .getByRole("combobox", { name: "Style", exact: true })
    .selectOption("chrome");
  const recipe = exampleRecipe("signature", "100% %c %s 👩🏽‍💻", "chrome");
  const output = compileConsole(recipe.scene, recipe.options);
  if (output.preview.kind !== "svg") throw Error("SVG expected");
  await expect(demo.locator(".comparison-result img")).toHaveAttribute(
    "src",
    output.preview.imageUri,
  );
  await demo
    .getByRole("button", { name: "Copy console.log", exact: true })
    .click();
  const copy = await clipboard.readText();
  const calls: unknown[][] = [];
  new Function("console", copy)({
    log: (...args: unknown[]) => calls.push(args),
  });
  expect(calls).toEqual([output.args]);
  await expect(demo.getByRole("status")).toContainText("Copied console.log");
  mkdirSync(artifact, { recursive: true });
  await demo.screenshot({
    path: `${artifact}/UX-07-${test.info().project.name}.png`,
  });
  await demo.getByRole("button", { name: "Plain", exact: true }).click();
  await expect(demo.locator(".comparison-result pre")).toHaveText(output.text);
  await demo.getByRole("button", { name: "Styled", exact: true }).click();
  await page
    .getByRole("button", { name: "Make it useful", exact: true })
    .click();
  await expect(page.locator(".example-card")).toHaveCount(3);
  await page.getByRole("button", { name: "All", exact: true }).click();
  await expect(page.locator(".example-card")).toHaveCount(6);
  expect(
    await page.evaluate(
      () => (window as unknown as { websiteCalls: unknown[][] }).websiteCalls,
    ),
  ).toEqual([]);
  await demo
    .getByRole("button", { name: "Test in console", exact: true })
    .click();
  expect(
    await page.evaluate(
      () => (window as unknown as { websiteCalls: unknown[][] }).websiteCalls,
    ),
  ).toEqual([output.args]);
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.reject(Error("denied")) },
    }),
  );
  await demo
    .getByRole("button", { name: "Copy console.log", exact: true })
    .click();
  await expect(demo.getByRole("status")).toContainText("Copy was blocked");
  await expect(
    demo.getByRole("textbox", {
      name: "Source from the blocked copy attempt",
      exact: true,
    }),
  ).toHaveValue(copy);
  await demo.screenshot({
    path: `${artifact}/UX-08-${test.info().project.name}.png`,
  });
  // Native keyboard insertion can consume Escape (notably in Firefox). Supply
  // the exact untrusted value to exercise the application's validation in each engine.
  await text.evaluate((input: HTMLInputElement) => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(input, "bad\u001b[31m");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await expect(text).toHaveValue("bad\u001b[31m");
  await expect(
    demo.getByRole("button", { name: "Test in console", exact: true }),
  ).toBeDisabled();
  await expect(
    demo.getByRole("button", { name: "Copy console.log", exact: true }),
  ).toBeDisabled();
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { websiteCalls: unknown[][] }).websiteCalls
          .length,
    ),
  ).toBe(1);
});

test("example transfers preserve a draft, cancellation, renderer, undo and full-studio sharing", async ({
  page,
}) => {
  const previous = neon({ text: "My prior work" });
  await page.addInitScript(
    ({ key, scene }) => localStorage.setItem(key, JSON.stringify(scene)),
    { key: draftKey, scene: previous },
  );
  await page.goto("/");
  const demo = page.locator(".quick-demo");
  await demo
    .getByRole("textbox", { name: "Your message", exact: true })
    .fill("New %s signature");
  await demo
    .getByRole("combobox", { name: "Style", exact: true })
    .selectOption("chrome");
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      draftKey,
    ),
  ).toEqual(previous);
  expect(
    await page.evaluate((key) => localStorage.getItem(key), recipeKey),
  ).toBeNull();
  const transfer = demo.getByRole("button", {
    name: "Edit in playground",
    exact: true,
  });
  await transfer.click();
  await expect(
    page.getByRole("dialog", { name: "Edit this example in the playground?" }),
  ).toBeVisible();
  const editor = page.locator("#editor-workspace");
  const text = editor.getByRole("textbox", {
    name: "Message text",
    exact: true,
  });
  await expect(text).toHaveValue("My prior work");
  await page
    .getByRole("button", { name: "Keep current scene", exact: true })
    .click();
  await expect(transfer).toBeFocused();
  await expect(text).toHaveValue("My prior work");
  await transfer.click();
  await page.getByRole("button", { name: "Load example", exact: true }).click();
  await expect(text).toHaveValue("New %s signature");
  await expect(
    editor.getByRole("combobox", { name: "Output renderer", exact: true }),
  ).toHaveValue("svg");
  await editor.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(text).toHaveValue("My prior work");
  await expect(
    editor.getByRole("combobox", { name: "Output renderer", exact: true }),
  ).toHaveValue("css");
  await editor.getByRole("button", { name: "Redo", exact: true }).click();
  await editor
    .getByRole("button", { name: "Open full studio", exact: true })
    .click();
  await expect(page).toHaveURL(/\/studio\/#scene=/);
  await expect(
    page.getByRole("textbox", { name: "Message text", exact: true }),
  ).toHaveValue("New %s signature");
  await expect(
    page.getByRole("combobox", { name: "Output renderer", exact: true }),
  ).toHaveValue("svg");
  expect(
    await page.evaluate(
      () => (window as unknown as { websiteCalls: unknown[][] }).websiteCalls,
    ),
  ).toEqual([]);
  await expect(page.locator(".landing-experience")).toHaveCount(0);
});

test("shared-scene decisions have priority over landing transfers", async ({
  page,
}) => {
  const previous = neon({ text: "Local draft" });
  await page.addInitScript(
    ({ key, scene }) => localStorage.setItem(key, JSON.stringify(scene)),
    { key: draftKey, scene: previous },
  );
  const share = encodeShare(exampleRecipe("devContext"));
  if (!share.ok) throw Error("Share fixture invalid");
  await page.goto(`/${share.value}`);
  await expect(
    page.getByRole("dialog", { name: "Load the shared scene?" }),
  ).toBeVisible();
  await expect(
    page
      .locator(".quick-demo")
      .getByRole("button", { name: "Edit in playground", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Load shared scene", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Message text", exact: true }),
  ).toHaveValue("atlas-web");
  await expect(
    page
      .locator(".quick-demo")
      .getByRole("textbox", { name: "Your message", exact: true }),
  ).toHaveValue("Hello, developer.");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Message text", exact: true }),
  ).toHaveValue("Local draft");
});

test("page effects are transient, bounded, cancelable and absent from exports", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const probe = window as unknown as {
      effectFrames: number;
      pendingFrames: Set<number>;
      ownedObservers: number;
    };
    probe.effectFrames = 0;
    probe.pendingFrames = new Set();
    probe.ownedObservers = 0;
    const request = window.requestAnimationFrame;
    const cancel = window.cancelAnimationFrame;
    window.requestAnimationFrame = (callback) => {
      probe.effectFrames++;
      const id = request.call(window, (time) => {
        probe.pendingFrames.delete(id);
        callback(time);
      });
      probe.pendingFrames.add(id);
      return id;
    };
    window.cancelAnimationFrame = (id) => {
      probe.pendingFrames.delete(id);
      cancel.call(window, id);
    };
    const Observer = window.IntersectionObserver;
    window.IntersectionObserver = class extends Observer {
      private owned = false;
      override observe(target: Element) {
        if (
          !this.owned &&
          target.matches(".example-card-surface, .landing-workbench")
        ) {
          this.owned = true;
          probe.ownedObservers++;
        }
        super.observe(target);
      }
      override disconnect() {
        if (this.owned) {
          this.owned = false;
          probe.ownedObservers--;
        }
        super.disconnect();
      }
    };
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const demo = page.locator(".quick-demo");
  await expect(page.locator(".landing-experience")).toHaveAttribute(
    "data-page-effects",
    "off",
  );
  await demo.locator(".demo-source > summary").click();
  const original = await demo
    .getByRole("textbox", { name: "Demo JavaScript", exact: true })
    .inputValue();
  await demo.getByRole("button", { name: "Plain", exact: true }).click();
  await expect(page.locator(".reveal-decoration")).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator(".landing-experience")).toHaveAttribute(
    "data-page-effects",
    "on",
  );
  await demo.getByRole("button", { name: "Styled", exact: true }).focus();
  await demo.screenshot({
    path: `${artifact}/UX-02-${test.info().project.name}.png`,
  });
  await page.keyboard.press("Enter");
  await expect(
    demo.getByRole("button", { name: "Styled", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".reveal-decoration")).toHaveCount(0, {
    timeout: 750,
  });
  expect(
    await demo
      .getByRole("textbox", { name: "Demo JavaScript", exact: true })
      .inputValue(),
  ).toBe(original);
  for (let i = 0; i < 8; i++)
    await demo
      .getByRole("button", { name: i % 2 ? "Styled" : "Plain", exact: true })
      .click();
  await page.getByRole("button", { name: "Turn off", exact: true }).click();
  await expect(page.locator(".reveal-decoration")).toHaveCount(0);
  expect(
    await demo
      .getByRole("textbox", { name: "Demo JavaScript", exact: true })
      .inputValue(),
  ).toBe(original);
  await demo.screenshot({
    path: `${artifact}/UX-09-${test.info().project.name}.png`,
  });
  await page.getByRole("button", { name: "Turn on", exact: true }).click();
  const card = page.locator(".example-card").first();
  await card.scrollIntoViewIfNeeded();
  const bounds = await card.boundingBox();
  if (!bounds) throw Error("Missing card bounds");
  await page.mouse.move(bounds.x + 40, bounds.y + 40);
  const targetAfter = await card.boundingBox();
  expect(targetAfter?.x).toBe(bounds.x);
  expect(targetAfter?.y).toBe(bounds.y);
  await card.screenshot({
    path: `${artifact}/UX-04-${test.info().project.name}.png`,
  });
  await page.mouse.move(1, 1);
  await page.waitForTimeout(500);
  const idle = await page.evaluate(
    () => (window as unknown as { effectFrames: number }).effectFrames,
  );
  await page.waitForTimeout(600);
  expect(
    await page.evaluate(
      () => (window as unknown as { effectFrames: number }).effectFrames,
    ),
  ).toBe(idle);
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { pendingFrames: Set<number> }).pendingFrames
          .size,
    ),
  ).toBe(0);
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator(".landing-experience")).toHaveAttribute(
    "data-page-effects",
    "off",
  );
  await page.getByRole("link", { name: "Docs", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Use ConsoleFX in your app.",
  );
  expect(
    await page.evaluate(
      () => (window as unknown as { ownedObservers: number }).ownedObservers,
    ),
  ).toBe(0);
  expect(
    await page.evaluate(
      () => (window as unknown as { websiteCalls: unknown[][] }).websiteCalls,
    ),
  ).toEqual([]);
});

test("static HTML and narrow layouts keep the explanation and actions usable", async ({
  page,
  browser,
}) => {
  test.setTimeout(90_000);
  mkdirSync(artifact, { recursive: true });
  for (const width of [320, 360, 390, 768, 1280, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    await expect(
      page
        .locator(".quick-demo")
        .getByRole("button", { name: "Copy console.log", exact: true }),
    ).toBeEnabled();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `${artifact}/UX-01-${width}-${test.info().project.name}.png`,
    });
    const violations = (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations;
    expect(violations).toEqual([]);
  }
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const staticPage = await context.newPage();
  await staticPage.goto(new URL("/", page.url()).href);
  await expect(staticPage.getByRole("heading", { level: 1 })).toHaveText(
    "Make your console worth opening.",
  );
  await expect(staticPage.locator(".comparison-result")).toContainText(
    "Hello, developer.",
  );
  await expect(
    staticPage.getByText(
      "Enable JavaScript to edit, copy or test this example.",
      { exact: false },
    ),
  ).toBeVisible();
  await expect(staticPage.locator("#use-cases")).toContainText(
    "Your app supplies the facts",
  );
  await expect(staticPage.locator("#use-in-your-app")).toContainText(
    "Core 0.1.0 is available under next",
  );
  await expect(staticPage.locator("#use-in-your-app")).toContainText(
    "React adapter publication is pending",
  );
  await staticPage.screenshot({
    path: `${artifact}/UX-01-no-js-${test.info().project.name}.png`,
  });
  writeFileSync(
    `${artifact}/static-${test.info().project.name}.html`,
    await staticPage.content(),
  );
  await context.close();
});
