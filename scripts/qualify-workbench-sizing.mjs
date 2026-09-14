// Resize already emitted entries in their actual native Windows DevTools window.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";

const [port, name] = process.argv.slice(2);
assert(/^\d+$/.test(port ?? "") && /^(chrome|edge)$/.test(name ?? ""));
const fixturePort = Number(process.env.CONSOLE_FX_FIXTURE_PORT ?? 4176);
const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
const cdp = await browser.newBrowserCDPSession();
const pages = browser.contexts().flatMap((context) => context.pages());
const fixture = pages.find(
  (page) => page.url() === `http://127.0.0.1:${fixturePort}/`,
);
assert(fixture, "Open the dedicated fixture first");
const session = await fixture.context().newCDPSession(fixture);
const { targetInfo } = await session.send("Target.getTargetInfo");
await session.detach();
const { targetId } = await cdp.send("Target.getDevToolsTarget", {
  targetId: targetInfo.targetId,
});
let native;
for (const page of pages.filter((page) =>
  page.url().includes("/devtools_app.html"),
)) {
  const probe = await page.context().newCDPSession(page);
  const { targetInfo } = await probe.send("Target.getTargetInfo");
  await probe.detach();
  if (targetInfo.targetId === targetId) native = page;
}
assert(native, "Open the fixture's native DevTools Console first");
const { windowId } = await cdp.send("Browser.getWindowForTarget", { targetId });
const directory = resolve(
  `.artifacts/devtools/${name}-workbench-sizing-${new Date().toISOString().replaceAll(":", "-")}`,
);
await mkdir(directory, { recursive: true });
await fixture.reload();
const data = await fixture.evaluate(() => window.consoleFxFixtures);
const report = {
  observedAt: new Date().toISOString(),
  browser: await cdp.send("Browser.getVersion"),
  os: process.env.CONSOLE_FX_WINDOWS_BUILD,
  compiler: data.metadata,
  note: "Actual native Console geometry. Container text readability remains unknown; complete captions are verified separately.",
  cases: [],
};
const events = [];
fixture.on("console", (event) => {
  if (event.type() === "log") events.push(event);
});
try {
  for (const entry of data.fixtures.filter((entry) =>
    entry.id.startsWith("workbench-"),
  )) {
    await native.getByRole("button", { name: /Clear console/ }).click();
    await fixture.locator("#fixture").selectOption(entry.id);
    const before = events.length;
    await fixture.locator("#emit").click();
    const message = native.locator(".console-message-text").last();
    await message.waitFor();
    for (const width of [560, 1000]) {
      await cdp.send("Browser.setWindowBounds", {
        windowId,
        bounds: { windowState: "normal" },
      });
      await cdp.send("Browser.setWindowBounds", {
        windowId,
        bounds: { width, height: 950, left: 10, top: 10 },
      });
      await native.waitForTimeout(180);
      const carrier = message.locator('span[style*="background"]');
      const geometry = await carrier.evaluate((element) => {
        const box = element.getBoundingClientRect();
        const view = document
          .querySelector(".console-view")
          .getBoundingClientRect();
        return {
          x: box.x,
          width: box.width,
          height: box.height,
          right: box.right,
          consoleWidth: view.width,
          consoleRight: view.right,
          viewport: window.innerWidth,
        };
      });
      const caption = await message.textContent();
      assert(
        caption.includes(entry.output.text),
        "The complete native caption must remain present",
      );
      assert.equal(events.length - before, 1, "Resizing must not re-emit");
      assert(
        geometry.width > 0 &&
          geometry.height > 0 &&
          geometry.right <= geometry.consoleRight + 1,
        "Automatic carrier must remain within the native console",
      );
      assert(
        geometry.width <= entry.options.sizing.maxWidth + 1,
        "Carrier maximum width must hold",
      );
      const path = `${entry.id}-${width}.png`;
      await carrier.screenshot({ path: resolve(directory, path) });
      report.cases.push({
        id: entry.id,
        requestedWindowWidth: width,
        geometry,
        caption,
        consoleCalls: events.length - before,
        resizedExistingEntry: true,
        image: path,
      });
    }
  }
  await writeFile(
    resolve(directory, "observations.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(
    JSON.stringify({ directory, cases: report.cases.length, pass: true }),
  );
} finally {
  await cdp.send("Browser.setWindowBounds", {
    windowId,
    bounds: { width: 1400, height: 950, left: 10, top: 10 },
  });
}
process.exit(0);
