import { test, expect } from "../studio/fixtures";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const consumerDirectory = process.env.CONSOLE_FX_CONSUMER_DIR;
if (!consumerDirectory)
  throw new Error("Use the prepared installed consumer directory.");
// The copied ESM oracle resolves only the installed candidate's public exports.
const { getPresentationDescriptors, createPresetExample, compileConsole } =
  await import(
    pathToFileURL(resolve(consumerDirectory, "checks/oracle.mjs")).href
  );

test("all packed card previews preserve the exact compiler URI and explicit hook output", async ({
  page,
}) => {
  const calls: unknown[][] = [];
  page.on("console", async (event) => {
    if (event.type() === "log")
      calls.push(await Promise.all(event.args().map((arg) => arg.jsonValue())));
  });
  await page.goto("/");
  await expect.poll(() => calls.length).toBe(1); // Explicit instrumentation example.
  for (const [index, descriptor] of getPresentationDescriptors().entries()) {
    const scene = createPresetExample(descriptor.id);
    const output = compileConsole(scene, {
      target: "chromium",
      renderer: "svg",
    });
    if (output.preview.kind !== "svg") throw Error("SVG expected");
    const region = page.getByRole("region", {
      name: descriptor.name,
      exact: true,
    });
    await expect(region.locator("img")).toHaveAttribute(
      "src",
      output.preview.imageUri,
    );
    await expect(region.locator("img")).toHaveAttribute("alt", output.text);
    expect(calls).toHaveLength(index + 1);
    await region
      .getByRole("button", { name: `Print ${descriptor.id}`, exact: true })
      .click();
    await expect.poll(() => calls.length).toBe(index + 2);
    expect(calls.at(-1)).toEqual(output.args);
  }
});

test("packed Next startup, first-enabled root-layout banner, edits and true remount", async ({
  page,
}) => {
  const logs: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "log") logs.push(message.text());
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Packed Next consumer" }),
  ).toBeVisible();
  await expect.poll(() => logs.length).toBe(1);
  expect(logs[0]).toContain("Packed Next startup");
  await page
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("Current enabled text");
  expect(logs).toHaveLength(1);
  await page
    .getByRole("button", { name: "Enable banner", exact: true })
    .click();
  await expect.poll(() => logs.length).toBe(2);
  expect(logs[1]).toContain("Current enabled text");
  await page
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("Later edit");
  await page
    .getByRole("button", { name: "Disable banner", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Enable banner", exact: true })
    .click();
  expect(logs).toHaveLength(2);
  await page
    .getByRole("button", { name: "Remount banner", exact: true })
    .click();
  await expect.poll(() => logs.length).toBe(3);
  expect(logs[2]).toContain("Later edit");
  await page
    .getByRole("button", { name: "Print message", exact: true })
    .click();
  await expect.poll(() => logs.length).toBe(4);
  expect(logs[3]).toContain("Later edit");
  await page.reload();
  await expect.poll(() => logs.length).toBe(5);
  expect(logs[4]).toContain("Packed Next startup");
});

test("packed fitting options update the exact preview silently and emit once on request", async ({
  page,
}) => {
  const calls: unknown[][] = [];
  page.on("console", async (event) => {
    if (event.type() === "log")
      calls.push(await Promise.all(event.args().map((arg) => arg.jsonValue())));
  });
  await page.goto("/");
  await expect.poll(() => calls.length).toBe(1);
  const region = page.getByRole("region", {
    name: "Packed fitting consumer",
    exact: true,
  });
  await region
    .getByRole("button", { name: "Use 280px preview", exact: true })
    .click();
  const scene = createPresetExample("lightningMetal");
  const output = compileConsole(
    {
      ...scene,
      lines: [
        {
          ...scene.lines[0]!,
          runs: [{ ...scene.lines[0]!.runs[0]!, text: "FITTED NEXT" }],
        },
      ],
    },
    {
      target: "chromium",
      renderer: "svg",
      motion: "reduce",
      layout: {
        algorithm: "fit/v1",
        width: 280,
        maxHeight: 400,
        variant: "standard",
        overflow: "shrink",
        minFontSize: 12,
      },
    },
  );
  if (output.preview.kind !== "svg") throw Error("SVG expected");
  await expect(region.locator("img")).toHaveAttribute(
    "src",
    output.preview.imageUri,
  );
  expect(calls).toHaveLength(1);
  await region
    .getByRole("button", { name: "Print fitted message", exact: true })
    .click();
  await expect.poll(() => calls.length).toBe(2);
  expect(calls.at(-1)).toEqual(output.args);
});
