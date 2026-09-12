import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium, expect } from "@playwright/test";
import { nativeBrowserZoom } from "./native-browser-zoom.mjs";
const directory = ".artifacts/website/native-zoom";
await mkdir(directory, { recursive: true });
const browser = await chromium.connectOverCDP(
  process.env.CONSOLE_FX_CDP ?? "http://127.0.0.1:9344",
);
const cdp = await browser.newBrowserCDPSession();
const { processInfo } = await cdp.send("SystemInfo.getProcessInfo");
const processId = processInfo.find((process) => process.type === "browser").id;
const context = await browser.newContext({ viewport: null });
const page = await context.newPage();
const session = await context.newCDPSession(page);
const { targetInfo } = await session.send("Target.getTargetInfo");
const { windowId } = await cdp.send("Browser.getWindowForTarget", {
  targetId: targetInfo.targetId,
});
await cdp.send("Browser.setWindowBounds", {
  windowId,
  bounds: { windowState: "normal" },
});
await cdp.send("Browser.setWindowBounds", {
  windowId,
  bounds: { width: 1440, height: 1000 },
});
const origin = process.env.CONSOLE_FX_WEBSITE_URL ?? "http://127.0.0.1:4197";
const rows = [];
try {
  await page.goto(origin);
  const baseline = await page.evaluate(() => window.devicePixelRatio);
  for (const [percent, steps] of [
    [200, 5],
    [400, 8],
  ]) {
    await nativeBrowserZoom(page, processId, steps);
    assert.equal(
      Math.round(
        ((await page.evaluate(() => window.devicePixelRatio)) / baseline) * 100,
      ),
      percent,
    );
    for (const [path, label] of [
      ["/", "landing"],
      ["/studio/", "studio"],
      ["/docs/", "docs"],
    ]) {
      await page.goto(`${origin}${path}`);
      await page.waitForTimeout(250);
      const size = await page.evaluate(() => ({
        width: window.innerWidth,
        height: window.innerHeight,
        dpr: window.devicePixelRatio,
        documentWidth: document.documentElement.scrollWidth,
      }));
      assert(
        size.documentWidth <= size.width,
        `${label} page overflows at ${percent}%`,
      );
      const screenshot = `${directory}/${label}-${percent}.png`;
      const { data } = await session.send("Page.captureScreenshot", {
        format: "png",
        fromSurface: true,
        captureBeyondViewport: false,
      });
      await writeFile(screenshot, Buffer.from(data, "base64"));
      rows.push({ path, percent, ...size, screenshot });
    }
  }
  await page.goto(`${origin}/studio/`);
  const input = page.getByRole("textbox", {
    name: "Message text",
    exact: true,
  });
  await input.fill("Zoomed %s editing 👩🏽‍💻");
  const reset = page.getByRole("button", { name: "Reset", exact: true });
  await reset.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(reset).toBeFocused();
  await expect(input).toHaveValue("Zoomed %s editing 👩🏽‍💻");
  rows.push({
    journey: "400% edit and Reset cancellation",
    focusReturned: true,
    textPreserved: true,
  });
  await writeFile(
    `${directory}/receipt.json`,
    JSON.stringify(
      {
        at: new Date().toISOString(),
        browser: browser.version(),
        method:
          "Native Windows browser menu via UI Automation after verified foreground-window selection; measured DPR and layout viewport",
        rows,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    "Native 200%/400% landing, studio and docs reflow passed; 400% editing and Reset recovery passed.",
  );
} finally {
  await nativeBrowserZoom(page, processId, 0);
  await context.close();
}
process.exit(0);
