import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";
import { compileConsole } from "../packages/console-fx/dist/browser/index.js";
import { createPresetExample } from "../packages/console-fx/dist/presets/index.js";

// Page/image comparison is separate from native DevTools qualification.
const endpoint = process.env.CONSOLE_FX_CDP ?? "http://127.0.0.1:9343";
const destination = resolve(
  process.env.CONSOLE_FX_COMPARISON_DIR ?? ".artifacts/cards/comparison",
);
mkdirSync(destination, { recursive: true });
const references = resolve("docs/mockups/preset-collection-v1");
const fixtures = JSON.parse(
  readFileSync(resolve(references, "fixtures.json"), "utf8"),
);
const digest = (value) => createHash("sha256").update(value).digest("hex");
const browser = await chromium.connectOverCDP(endpoint);
const context = await browser.newContext({
  viewport: { width: 720, height: 240 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
const { windowId } = await cdp.send("Browser.getWindowForTarget");
await cdp.send("Browser.setWindowBounds", {
  windowId,
  bounds: { windowState: "normal" },
});
await page.bringToFront();
await cdp.send("DOM.enable");
await cdp.send("CSS.enable");
const rows = [];
try {
  for (const fixture of fixtures.presets) {
    const reference = readFileSync(resolve(references, fixture.svg), "utf8");
    const scene = createPresetExample(fixture.id);
    const output = compileConsole(scene, {
      renderer: "svg",
      target: "chromium",
    });
    assert.equal(output.preview.kind, "svg");
    const actual = decodeURIComponent(output.preview.imageUri.split(",")[1]);
    const row = {
      id: fixture.id,
      referenceSha256: digest(reference),
      sceneSha256: digest(JSON.stringify(scene)),
      svgSha256: digest(actual),
      argsSha256: digest(JSON.stringify(output.args)),
      text: output.text,
    };
    writeFileSync(resolve(destination, `${fixture.id}.svg`), actual);
    for (const [kind, source] of [
      ["reference", reference],
      ["actual", actual],
    ]) {
      await page.setContent(
        `<style>html,body{margin:0;padding:0;width:720px;height:240px;overflow:hidden}</style>${source}`,
      );
      await page.evaluate(() => document.fonts.ready);
      const geometry = await page
        .locator('text[data-slot]:not([aria-hidden="true"])')
        .evaluateAll((nodes) =>
          nodes.map((node) => {
            const box = node.getBBox();
            return {
              slot: node.getAttribute("data-slot"),
              text: node.textContent,
              anchorX: Number(node.getAttribute("x")),
              anchorY: Number(node.getAttribute("y")),
              x: box.x,
              y: box.y,
              width: box.width,
              height: box.height,
              inside:
                box.x >= -1 &&
                box.y >= -1 &&
                box.x + box.width <= 721 &&
                box.y + box.height <= 241,
            };
          }),
        );
      const { root } = await cdp.send("DOM.getDocument");
      const { nodeIds } = await cdp.send("DOM.querySelectorAll", {
        nodeId: root.nodeId,
        selector: 'text[data-slot]:not([aria-hidden="true"])',
      });
      const fonts = [];
      for (const nodeId of nodeIds)
        fonts.push(
          ...(
            await cdp.send("CSS.getPlatformFontsForNode", { nodeId })
          ).fonts.map((font) => font.familyName),
        );
      // Capture the actual secure SVG image context, not just the inline SVG.
      const uri =
        kind === "actual"
          ? output.preview.imageUri
          : `data:image/svg+xml,${encodeURIComponent(source)}`;
      await page.setContent(
        `<style>html,body{margin:0;padding:0;width:720px;height:240px;overflow:hidden}</style><img width="720" height="240" alt="Design comparison" src="${uri}">`,
      );
      await page.locator("img").evaluate((image) => image.decode());
      const screenshot = resolve(destination, `${fixture.id}-${kind}.png`);
      await page.screenshot({ path: screenshot });
      row[kind] = {
        geometry,
        fonts: [...new Set(fonts)],
        screenshot,
        screenshotSha256: digest(readFileSync(screenshot)),
      };
    }
    assert.equal(row.reference.geometry.length, row.actual.geometry.length);
    for (const actual of row.actual.geometry) {
      const reference = row.reference.geometry.find(
        (item) => item.slot === actual.slot,
      );
      assert.equal(
        actual.text,
        reference.text,
        `${fixture.id}/${actual.slot} text`,
      );
      assert(actual.inside, `${fixture.id}/${actual.slot} outside artboard`);
      for (const key of ["anchorX", "anchorY"])
        assert(
          Math.abs(actual[key] - reference[key]) <= 1,
          `${fixture.id}/${actual.slot}/${key} changed`,
        );
    }
    row.inkBoundDeltas = row.actual.geometry.flatMap((actual) => {
      const reference = row.reference.geometry.find(
        (item) => item.slot === actual.slot,
      );
      return Math.abs(actual.width - reference.width) > 1
        ? [
            {
              slot: actual.slot,
              referenceWidth: reference.width,
              actualWidth: actual.width,
              text: actual.text,
            },
          ]
        : [];
    });
    await page.setViewportSize({ width: 1440, height: 240 });
    await page.setContent(
      `<style>html,body{margin:0;padding:0;display:flex;width:1440px;height:240px;overflow:hidden}img{display:block;width:720px;height:240px}</style><img alt="Approved reference" src="data:image/svg+xml,${encodeURIComponent(reference)}"><img alt="Implemented output" src="${output.preview.imageUri}">`,
    );
    await page
      .locator("img")
      .evaluateAll((images) =>
        Promise.all(images.map((image) => image.decode())),
      );
    row.sideBySide = resolve(destination, `${fixture.id}-comparison.png`);
    await page.screenshot({ path: row.sideBySide });
    await page.setViewportSize({ width: 720, height: 240 });
    row.semanticAndAnchorChecks = "passed";
    rows.push(row);
    console.log(`${fixture.id}: semantic content and local-font anchors match`);
  }
  writeFileSync(
    resolve(destination, "receipt.json"),
    JSON.stringify(
      {
        observedAt: new Date().toISOString(),
        browser: await browser.version(),
        endpoint,
        platform: await page.evaluate(() => navigator.platform),
        viewport: { width: 720, height: 240 },
        deviceScaleFactor: 1,
        method:
          "Same-environment Windows browser image capture with separate inline text bounds and resolved local fonts. Not DevTools qualification. Raster appearance requires inspection.",
        rows,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    JSON.stringify(
      rows.map((row) => ({
        id: row.id,
        result: row.semanticAndAnchorChecks,
        fonts: row.actual.fonts,
      })),
      null,
      2,
    ),
  );
} finally {
  await context.close();
}
// Disconnect without closing the dedicated browser or other qualification tabs.
process.exit(0);
