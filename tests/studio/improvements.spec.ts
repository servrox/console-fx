import { neon } from "../../packages/console-fx/dist/presets/index.js";
import { encodeShare } from "../../apps/studio/src/features/persistence/documents";
import { test, expect } from "./fixtures";
test.use({ legacyDraft: true });

const textName = { name: "Message text", exact: true };

test("fitting applies without replacing focus and undo synchronizes numeric controls", async ({
  page,
}) => {
  await page.goto("/studio/");
  await page.locator(".fit-section > summary").click();
  const fit = page.locator(".fit-inspector");
  const height = fit.getByRole("spinbutton", {
    name: "Maximum content height (px)",
    exact: true,
  });
  const apply = fit.getByRole("button", {
    name: "Use this width for export",
    exact: true,
  });
  await height.fill("");
  await expect(height).toHaveAttribute("aria-invalid", "true");
  await height.pressSequentially("240");
  await expect(height).toBeFocused();
  await expect(apply).toBeEnabled();
  await apply.focus();
  await apply.press("Enter");
  await expect(apply).toBeFocused();
  await expect(height).toHaveValue("240");
  await height.fill("300");
  await apply.click();
  await expect(apply).toBeFocused();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(height).toHaveValue("240");
  await fit
    .getByRole("button", { name: "Remove fitting and sizing", exact: true })
    .click();
  await expect(height).toHaveValue("400");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(height).toHaveValue("240");
  await page
    .getByRole("combobox", { name: "Format", exact: true })
    .selectOption("recipe");
  const saved = JSON.parse(
    await page.getByLabel("Generated code", { exact: true }).inputValue(),
  );
  expect(saved.options.layout.maxHeight).toBe(240);
});

for (const failure of ["missing", "constructor", "observe"] as const) {
  test(`unavailable ResizeObserver (${failure}) preserves editing and export`, async ({
    page,
  }) => {
    await page.addInitScript((failure) => {
      const probe = window as unknown as { activeObservers: number };
      probe.activeObservers = 0;
      Object.defineProperty(window, "ResizeObserver", {
        configurable: true,
        value:
          failure === "missing"
            ? undefined
            : class {
                private active = false;
                constructor() {
                  if (failure === "constructor")
                    throw new Error("Observer unavailable");
                }
                observe() {
                  this.active = true;
                  probe.activeObservers++;
                  throw new Error("Observation unavailable");
                }
                disconnect() {
                  if (this.active) probe.activeObservers--;
                  this.active = false;
                }
              },
      });
    }, failure);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/studio/");
    await page.locator(".fit-section > summary").click();
    await expect(page.locator(".fit-boundary")).toContainText(
      "Preview width observation is unavailable",
    );
    await expect(
      page.getByRole("button", {
        name: "Use this width for export",
        exact: true,
      }),
    ).toBeDisabled();
    await page
      .getByRole("textbox", textName)
      .fill("Editing survives optional API failure");
    await expect(
      page.getByLabel("Generated code", { exact: true }),
    ).toHaveValue(/Editing survives optional API failure/);
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
          (window as unknown as { activeObservers: number }).activeObservers,
      ),
    ).toBe(0);
    expect(errors).toEqual([]);
  });
}

test("motion overflow is reported separately while the fitting preview stays static and silent", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "console-fx:scene:v1",
      JSON.stringify({
        schemaVersion: 1,
        label: "Motion",
        surface: { padding: 0 },
        lines: [
          {
            runs: [
              {
                text: "Motion",
                style: { fontSize: 20 },
                effects: [{ kind: "wave", amplitude: 8 }],
              },
            ],
          },
        ],
      }),
    ),
  );
  const logs: string[] = [];
  page.on("console", (event) => {
    if (event.type() === "log") logs.push(event.text());
  });
  await page.goto("/studio/");
  await page.locator(".fit-section > summary").click();
  const fit = page.locator(".fit-inspector");
  await fit
    .getByRole("combobox", { name: "Overflow policy", exact: true })
    .selectOption("error");
  await fit
    .getByRole("spinbutton", {
      name: "Maximum content height (px)",
      exact: true,
    })
    .fill("40");
  const preview = fit.locator(".fit-boundary img");
  await expect(preview).toBeVisible();
  const staticUri = await preview.getAttribute("src");
  await page
    .getByRole("checkbox", {
      name: /Enable finite motion when the system allows it/,
    })
    .check();
  await expect(fit.locator(".fit-motion-status")).toContainText(
    "Motion-enabled SVG export:",
  );
  await expect(preview).toHaveAttribute("src", staticUri!);
  expect(decodeURIComponent(staticUri!)).not.toContain("<animate");
  await fit
    .getByRole("spinbutton", {
      name: "Maximum content height (px)",
      exact: true,
    })
    .fill("80");
  await expect(fit.locator(".fit-motion-status")).toContainText(
    "Finite motion fits",
  );
  expect(logs).toEqual([]);
});

test("surface sliders stop at the compiler's accepted limits", async ({
  page,
}) => {
  await page.goto("/studio/");
  await page.locator(".surface-controls > summary").click();
  for (const name of ["Padding", "Corners"]) {
    const slider = page.getByRole("slider", { name, exact: true });
    await expect(slider).toHaveAttribute("max", "64");
    await slider.fill("64");
    await expect(slider).toHaveValue("64");
  }
  await expect(
    page.getByRole("button", { name: "Copy console.log", exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByLabel("Generated code", { exact: true }),
  ).not.toHaveValue("");
});

type CopyProbe = {
  copies: { text: string; resolve: () => void; reject: () => void }[];
};

test("blocked clipboard preserves the exact attempted URL or source and prevents overlapping writes", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const probe = window as unknown as CopyProbe;
    probe.copies = [];
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: (text: string) =>
          new Promise<void>((resolve, reject) =>
            probe.copies.push({
              text,
              resolve,
              reject: () => reject(new Error("Denied")),
            }),
          ),
      },
    });
  });
  await page.goto("/studio/");
  const text = page.getByRole("textbox", textName);
  await text.fill("Shared version");
  const share = page.getByRole("button", {
    name: "Copy share link",
    exact: true,
  });
  const copy = page.getByRole("button", {
    name: "Copy console.log",
    exact: true,
  });
  await share.click();
  await expect(share).toBeDisabled();
  await expect(copy).toBeDisabled();
  const attempted = await page.evaluate(
    () => (window as unknown as CopyProbe).copies[0]!.text,
  );
  expect(attempted).toContain("/studio/#scene=");
  await text.fill("A later edit");
  await page.evaluate(() =>
    (window as unknown as CopyProbe).copies[0]!.reject(),
  );
  const recovery = page.getByRole("textbox", {
    name: "Share link from the blocked copy attempt",
    exact: true,
  });
  await expect(recovery).toHaveValue(attempted);
  await recovery.focus();
  expect(
    await recovery.evaluate(
      (el: HTMLTextAreaElement) => el.selectionEnd - el.selectionStart,
    ),
  ).toBe(attempted.length);
  await expect(
    page.getByRole("button", { name: "Retry local storage", exact: true }),
  ).toHaveCount(0);
  const source = await page
    .getByLabel("Generated code", { exact: true })
    .inputValue();
  await copy.click();
  await text.fill("Newer text after attempted source copy");
  await page.evaluate(() =>
    (window as unknown as CopyProbe).copies[1]!.reject(),
  );
  await expect(
    page.getByRole("textbox", {
      name: "console.log from the blocked copy attempt",
      exact: true,
    }),
  ).toHaveValue(source);
  await copy.click();
  const latest = await page
    .getByLabel("Generated code", { exact: true })
    .inputValue();
  expect(
    await page.evaluate(() =>
      (window as unknown as CopyProbe).copies.map((c) => c.text),
    ),
  ).toEqual([attempted, source, latest]);
  await page.evaluate(() =>
    (window as unknown as CopyProbe).copies[2]!.resolve(),
  );
  await expect(page.locator(".copy-recovery")).toHaveCount(0);
  await expect(copy).toBeEnabled();
  await expect(text).toHaveValue("Newer text after attempted source copy");
});

type ImportProbe = {
  reads: { resolve: (text: string) => void; reject: () => void }[];
};

for (const outcome of ["resolve", "reject"] as const) {
  test(`pending replacement decisions discard obsolete import ${outcome} and cancellation preserves work`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const probe = window as unknown as ImportProbe;
      probe.reads = [];
      File.prototype.text = () =>
        new Promise<string>((resolve, reject) =>
          probe.reads.push({
            resolve,
            reject: () => reject(new Error("Late read failure")),
          }),
        );
    });
    await page.goto("/#playground");
    const text = page.getByRole("textbox", textName);
    await text.fill("Preserved during every decision");
    const shared = encodeShare(neon({ text: "Conflicting shared scene" }));
    if (!shared.ok) throw Error("Invalid fixture");
    for (const [index, decision] of [
      "shared",
      "example",
      "reset",
      "renderer",
    ].entries()) {
      if (decision === "renderer") {
        await page.locator(".fit-section > summary").click();
        await page
          .getByRole("button", { name: "Enable automatic sizing", exact: true })
          .click();
      }
      await page.locator('input[type="file"]').setInputFiles({
        name: "delayed.json",
        mimeType: "application/json",
        buffer: Buffer.from("delayed"),
      });
      if (decision === "shared")
        await page.evaluate((fragment) => {
          location.hash = fragment;
        }, shared.value);
      else if (decision === "example")
        await page
          .getByRole("combobox", { name: "Start from a preset", exact: true })
          .selectOption("preset:lightningMetal");
      else if (decision === "renderer")
        await page
          .getByRole("combobox", { name: "Output renderer", exact: true })
          .selectOption("css");
      else
        await page.getByRole("button", { name: "Reset", exact: true }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.evaluate(
        ({ index, outcome, value }) => {
          const read = (window as unknown as ImportProbe).reads[index]!;
          if (outcome === "resolve") read.resolve(value);
          else read.reject();
        },
        {
          index,
          outcome,
          value: JSON.stringify(neon({ text: "Obsolete imported text" })),
        },
      );
      await expect(text).toHaveValue("Preserved during every decision");
      await expect(page.locator(".editor-status")).not.toContainText(
        /Document imported|could not be read/,
      );
      await page
        .getByRole("button", { name: "Keep current scene", exact: true })
        .click();
      await expect(text).toHaveValue("Preserved during every decision");
    }
  });

  test(`obsolete import ${outcome} cannot replace a later reset, edit or import`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const probe = window as unknown as ImportProbe;
      probe.reads = [];
      File.prototype.text = () =>
        new Promise<string>((resolve, reject) =>
          probe.reads.push({
            resolve,
            reject: () => reject(new Error("Late read failure")),
          }),
        );
    });
    await page.goto("/studio/");
    const text = page.getByRole("textbox", textName);
    const input = page.locator('input[type="file"]');
    const begin = () =>
      input.setInputFiles({
        name: "delayed.json",
        mimeType: "application/json",
        buffer: Buffer.from("delayed"),
      });
    const finish = (index: number, value: string) =>
      page.evaluate(
        ({ index, value, outcome }) => {
          const read = (window as unknown as ImportProbe).reads[index]!;
          if (outcome === "resolve") read.resolve(value);
          else read.reject();
        },
        { index, value, outcome },
      );
    const obsolete = JSON.stringify(neon({ text: "Obsolete imported text" }));
    await text.fill("Before reset");
    await begin();
    await page.getByRole("button", { name: "Reset", exact: true }).click();
    await page
      .getByRole("button", { name: "Reset scene", exact: true })
      .click();
    await finish(0, obsolete);
    await expect(text).toHaveValue("Hello, developer.");
    await begin();
    await text.fill("The latest edit");
    await finish(1, obsolete);
    await expect(text).toHaveValue("The latest edit");
    await begin();
    await begin();
    await page.evaluate(
      (value) => (window as unknown as ImportProbe).reads[3]!.resolve(value),
      JSON.stringify(neon({ text: "Latest import" })),
    );
    await expect(text).toHaveValue("Latest import");
    await finish(2, obsolete);
    await expect(text).toHaveValue("Latest import");
    await expect(page.locator(".editor-status")).not.toContainText(
      "could not be read",
    );
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(text).toHaveValue("The latest edit");
  });
}
