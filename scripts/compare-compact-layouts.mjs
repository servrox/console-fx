// Native-browser page comparison. DevTools qualification remains separate.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { JSDOM } from "jsdom";
import { chromium } from "@playwright/test";
const directory =
  process.env.CONSOLE_FX_FITTING_DIR ?? ".artifacts/fitting/compact-chrome";
const receipt = JSON.parse(readFileSync(`${directory}/receipt.json`, "utf8"));
const root = "docs/mockups/preset-compact-v1";
const references = JSON.parse(readFileSync(`${root}/fixtures.json`, "utf8"));
assert.equal(references.baselineStatus, "accepted");
const comparisons = references.presets.map((reference) => {
  const row = receipt.rows.find(
    (row) => row.id === reference.id && row.width === 360,
  );
  assert.equal(row.phase, "compiled");
  const original = readFileSync(`${root}/${reference.id}.svg`, "utf8");
  assert.equal(
    createHash("sha256").update(original).digest("hex"),
    reference.sha256,
  );
  const runtime = decodeURIComponent(row.imageUri.split(",")[1]);
  const document = new JSDOM(runtime, { contentType: "image/svg+xml" }).window
    .document;
  for (const slot of reference.slots) {
    const nodes = [
      ...document.querySelectorAll(`text[data-slot="${slot.id}"]`),
    ];
    assert.equal(nodes.length, slot.fragments.length);
    assert.deepEqual(
      nodes.map((node) => node.textContent),
      slot.fragments,
    );
    for (const [index, node] of nodes.entries())
      for (const [key, expected] of Object.entries({
        x: slot.x,
        y: slot.y + index * 18,
        "font-size": slot.fontSize,
        "font-family": slot.fontFamily,
        "font-weight": slot.fontWeight,
        "letter-spacing": slot.letterSpacing,
        "text-anchor": slot.anchor,
        fill: slot.color,
      }))
        assert.equal(
          node.getAttribute(key),
          String(expected),
          `${reference.id}/${slot.id}/${key}`,
        );
  }
  return {
    id: reference.id,
    height: reference.height,
    slots: reference.slots.length,
    sourceSha256: reference.sha256,
    runtimeSvgSha256: createHash("sha256").update(runtime).digest("hex"),
    original: `data:image/svg+xml,${encodeURIComponent(original)}`,
    imageUri: row.imageUri,
  };
});
const browser = await chromium.connectOverCDP(
  process.env.CONSOLE_FX_CDP ?? "http://127.0.0.1:9344",
);
const context = await browser.newContext({
  viewport: { width: 1496, height: 1880 },
  deviceScaleFactor: 1,
});
try {
  const page = await context.newPage();
  await page.setContent(
    `<style>body{margin:0;padding:12px;background:#101419;color:#eff3f6;font:14px Arial}main{display:grid;grid-template-columns:repeat(2,728px);gap:12px}figure{margin:0;min-height:356px}figcaption{padding:8px 0}.pair{display:flex;gap:8px}img{display:block;width:360px}</style><main>${comparisons.map((c) => `<figure><figcaption>${c.id} · Approved reference / Compiled output</figcaption><div class="pair"><img alt="Approved reference" height="${c.height}" src="${c.original}"><img alt="Compiled output" height="${c.height}" src="${c.imageUri}"></div></figure>`).join("")}</main>`,
  );
  await page
    .locator("img")
    .evaluateAll((nodes) => Promise.all(nodes.map((node) => node.decode())));
  await page.screenshot({
    path: `${directory}/comparison.png`,
    fullPage: true,
  });
  writeFileSync(
    `${directory}/comparison.json`,
    JSON.stringify(
      {
        observedAt: new Date().toISOString(),
        browser: await browser.version(),
        evidenceKind: "native-browser-page-reference-comparison",
        records: comparisons.map(
          ({ id, height, slots, sourceSha256, runtimeSvgSha256 }) => ({
            id,
            height,
            slots,
            sourceSha256,
            runtimeSvgSha256,
          }),
        ),
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `All ${comparisons.length} compact references preserve exact slot text, type, color and coordinates.`,
  );
} finally {
  await context.close();
}
process.exit(0);
