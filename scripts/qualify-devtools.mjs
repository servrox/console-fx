// Observation harness: connects to a separately launched Windows browser.
// Screenshots come from its native DevTools application, never the page preview.
import { chromium } from "@playwright/test";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { performance } from "node:perf_hooks";

const [port, browserName, prefix = "phase0-"] = process.argv.slice(2);
if (!/^\d+$/.test(port ?? "") || !/^(chrome|edge)$/.test(browserName ?? ""))
  throw new Error(
    "Usage: node scripts/qualify-devtools.mjs PORT chrome|edge [case-prefix]",
  );
const require = createRequire(import.meta.url);
// Pinned Playwright's PNG decoder is used only for local evidence comparison.
const { PNG } = require(
  require
    .resolve("playwright-core/package.json", {
      paths: [require.resolve("@playwright/test")],
    })
    .replace("package.json", "lib/utilsBundle.js"),
);
const pause = (ms) => new Promise((done) => setTimeout(done, ms));
const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
const cdp = await browser.newBrowserCDPSession();
const pages = () => browser.contexts().flatMap((context) => context.pages());
const fixturePort = Number(process.env.CONSOLE_FX_FIXTURE_PORT ?? 4176);
const fixture = pages().find((page) =>
  page.url().startsWith(`http://127.0.0.1:${fixturePort}/`),
);
async function nativeConsole() {
  const candidates = pages().filter((page) =>
    page.url().includes("/devtools_app.html"),
  );
  if (!process.env.CONSOLE_FX_DEVTOOLS_TARGET) {
    if (candidates.length > 1)
      throw new Error(
        "Select the fixture's native DevTools target with CONSOLE_FX_DEVTOOLS_TARGET.",
      );
    return candidates[0];
  }
  for (const page of candidates) {
    const session = await page.context().newCDPSession(page);
    const { targetInfo } = await session.send("Target.getTargetInfo");
    await session.detach();
    if (targetInfo.targetId === process.env.CONSOLE_FX_DEVTOOLS_TARGET)
      return page;
  }
}
let devtools = await nativeConsole();
if (!fixture || !devtools)
  throw new Error("Open the fixture and actual DevTools before qualification.");
await devtools
  .getByRole("button", { name: "Customize and control DevTools", exact: true })
  .last()
  .click();
const undock = devtools.getByRole("button", {
  name: "Undock into separate window",
  exact: true,
});
if (await undock.count()) await undock.click();
else await devtools.keyboard.press("Escape");
await pause(300);
devtools = await nativeConsole();
const devtoolsSession = await devtools.context().newCDPSession(devtools);
const { targetInfo: target } = await devtoolsSession.send(
  "Target.getTargetInfo",
);
await devtoolsSession.detach();
const { windowId } = await cdp.send("Browser.getWindowForTarget", {
  targetId: target.targetId,
});
await cdp.send("Browser.setWindowBounds", {
  windowId,
  bounds: { windowState: "normal" },
});
await cdp.send("Browser.setWindowBounds", {
  windowId,
  bounds: { width: 1400, height: 950, left: 10, top: 10 },
});
const drawer = devtools.getByRole("button", {
  name: "Close drawer",
  exact: true,
});
if (await drawer.count()) await drawer.click();
await devtools.getByRole("tab", { name: "Console", exact: true }).click();
await devtools.keyboard.press("Control+0");
await fixture.reload();
await fixture.locator("#fixture option").first().waitFor({ state: "attached" });
const data = await fixture.evaluate(() => window.consoleFxFixtures);
const directory = resolve(
  `.artifacts/devtools/${browserName}-${new Date().toISOString().replaceAll(":", "-")}`,
);
await mkdir(directory, { recursive: true });
const report = {
  observedAt: new Date().toISOString(),
  browser: await cdp.send("Browser.getVersion"),
  compiler: data.metadata,
  devtoolsUrl: devtools.url(),
  environment: await devtools.evaluate(() => ({
    viewport: [window.innerWidth, window.innerHeight],
    devicePixelRatio: window.devicePixelRatio,
    themeClasses: document.documentElement.className,
    background: window.getComputedStyle(document.body).backgroundColor,
    zoom: "Reset with native Ctrl+0 before observation",
    consoleWidth:
      document.querySelector(".console-view")?.getBoundingClientRect().width ??
      null,
  })),
  os:
    process.env.CONSOLE_FX_WINDOWS_BUILD ??
    "Windows build not recorded by this run",
  evidenceKind:
    "Actual native DevTools Console; raw frame hashes are not a motion verdict. Run review-devtools-frames and inspect the images before qualification.",
  cases: [],
};
const events = [];
fixture.on("console", (event) => {
  if (event.type() === "log") events.push(event);
});
for (const entry of data.fixtures.filter(({ id }) => id.startsWith(prefix))) {
  await devtools.getByRole("button", { name: /Clear console/ }).click();
  await fixture.locator("#fixture").selectOption(entry.id);
  const before = events.length;
  await fixture.locator("#emit").click();
  const emittedAt = performance.now();
  await devtools.bringToFront();
  const message = devtools.locator(".console-message-text").last();
  await message.waitFor();
  const record = {
    id: entry.id,
    options: entry.options,
    expectedText: entry.output.text,
    visibleText: await message.textContent(),
    consoleCalls: events.length - before,
    argumentsEqual:
      JSON.stringify(
        await Promise.all(
          events
            .at(-1)
            .args()
            .map((arg) => arg.jsonValue()),
        ),
      ) === JSON.stringify(entry.output.args),
    frames: [],
    nativeStyles: await message
      .locator("span[style]")
      .evaluateAll((spans) => spans.map((span) => span.getAttribute("style"))),
  };
  if (entry.output.preview.kind === "svg") {
    const carrier = message.locator('span[style*="background"]');
    await carrier.waitFor();
    const clip = await carrier.boundingBox();
    const viewport = await devtools.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }));
    if (
      !clip ||
      clip.x < 0 ||
      clip.y < 0 ||
      clip.x + clip.width > viewport.width ||
      clip.y + clip.height > viewport.height
    )
      throw new Error(
        `Capture bounds are clipped for ${entry.id}: ${JSON.stringify(clip)}`,
      );
    record.imageBounds = clip;
    const schedule = entry.output.animated
      ? [
          ["early", 150],
          ["moving", 850],
          ["end", 5600],
          ["after", 6900],
        ]
      : [["static", 300]];
    for (const [name, at] of schedule) {
      await pause(Math.max(0, at - (performance.now() - emittedAt)));
      const path = `${directory}/${entry.id}-${name}.png`;
      const png = PNG.sync.read(await devtools.screenshot({ path, clip }));
      record.frames.push({
        name,
        atMs: Math.round(performance.now() - emittedAt),
        path,
        pixelSha256: createHash("sha256").update(png.data).digest("hex"),
      });
    }
    if (entry.output.animated) {
      record.motionChanged =
        record.frames[0].pixelSha256 !== record.frames[1].pixelSha256;
      record.motionSettled =
        record.frames[2].pixelSha256 === record.frames[3].pixelSha256;
    }
  }
  record.context = `${directory}/${entry.id}-console.png`;
  await devtools.screenshot({ path: record.context });
  report.cases.push(record);
  await writeFile(
    `${directory}/observations.json`,
    JSON.stringify(report, null, 2),
  );
  console.log(
    JSON.stringify({
      id: record.id,
      calls: record.consoleCalls,
      argumentsEqual: record.argumentsEqual,
      visibleText: record.visibleText,
      motionChanged: record.motionChanged,
      motionSettled: record.motionSettled,
    }),
  );
}
console.log(`Observation record: ${directory}/observations.json`);
// Disconnect this harness only. The dedicated browser stays available for the
// remaining lifecycle, clipboard, theme and narrow-console observations.
process.exit(0);
