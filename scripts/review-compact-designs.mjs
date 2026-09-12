// Design-reference browser review only; this does not exercise the compiler.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";
const root = resolve("docs/mockups/preset-compact-v1");
const destination = resolve(".artifacts/cards/compact");
mkdirSync(destination, { recursive: true });
const fixtures = JSON.parse(readFileSync(`${root}/fixtures.json`, "utf8"));
const browser = await chromium.connectOverCDP(
  process.env.CONSOLE_FX_CDP ?? "http://127.0.0.1:9344",
);
const context = await browser.newContext({
  viewport: { width: 360, height: 400 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
const session = await context.newCDPSession(page);
await session.send("DOM.enable");
await session.send("CSS.enable");
const records = [];
for (const fixture of fixtures.presets) {
  const source = readFileSync(`${root}/${fixture.id}.svg`, "utf8");
  assert.equal(
    createHash("sha256").update(source).digest("hex"),
    fixture.sha256,
  );
  await page.setViewportSize({ width: 360, height: fixture.height });
  await page.setContent(`<style>html,body{margin:0}</style>${source}`);
  const geometry = await page.locator("text[data-slot]").evaluateAll((nodes) =>
    nodes.map((node) => {
      const box = node.getBBox();
      return {
        id: node.getAttribute("data-slot"),
        text: node.textContent,
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
      };
    }),
  );
  const { root: doc } = await session.send("DOM.getDocument");
  const { nodeIds } = await session.send("DOM.querySelectorAll", {
    nodeId: doc.nodeId,
    selector: "text[data-slot]",
  });
  const fonts = [];
  for (const nodeId of nodeIds)
    fonts.push(
      ...(
        await session.send("CSS.getPlatformFontsForNode", { nodeId })
      ).fonts.map((f) => f.familyName),
    );
  const problems = [];
  for (const box of geometry) {
    const slot = fixture.slots.find((s) => s.id === box.id);
    assert.equal(box.text, slot.fragments.join(""));
    if (
      box.width > slot.safeWidth + 1 ||
      box.x < 0 ||
      box.y < 0 ||
      box.x + box.width > 361 ||
      box.y + box.height > fixture.height + 1
    )
      problems.push(box.id);
  }
  const uri = `data:image/svg+xml,${encodeURIComponent(source)}`;
  await page.setContent(
    `<style>html,body{margin:0}</style><img alt="${fixture.name}" width="360" height="${fixture.height}" src="${uri}">`,
  );
  await page.locator("img").evaluate((img) => img.decode());
  const path = `${destination}/${fixture.id}.png`;
  await page.screenshot({ path });
  records.push({
    id: fixture.id,
    sourceSha256: fixture.sha256,
    fonts: [...new Set(fonts)],
    geometry,
    problems,
    screenshot: path,
    screenshotSha256: createHash("sha256")
      .update(readFileSync(path))
      .digest("hex"),
  });
  console.log(JSON.stringify({ id: fixture.id, problems }));
}
await page.setViewportSize({ width: 1136, height: 1518 });
await page.setContent(
  `<style>body{margin:0;padding:16px;background:#10171c;color:#dfe9ec;font:14px Arial}main{display:grid;grid-template-columns:repeat(3,360px);gap:16px}figure{margin:0;min-height:360px}figcaption{padding:8px 0}img{display:block}</style><main>${fixtures.presets.map((f) => `<figure><img width="360" height="${f.height}" alt="${f.name}" src="data:image/svg+xml,${encodeURIComponent(readFileSync(`${root}/${f.id}.svg`, "utf8"))}"><figcaption>${f.name} · 360 × ${f.height}</figcaption></figure>`).join("")}</main>`,
);
await page
  .locator("img")
  .evaluateAll((images) => Promise.all(images.map((img) => img.decode())));
await page.screenshot({ path: `${destination}/overview.png`, fullPage: true });
writeFileSync(
  `${destination}/receipt.json`,
  JSON.stringify(
    {
      observedAt: new Date().toISOString(),
      browser: await browser.version(),
      platform: await page.evaluate(() => navigator.platform),
      evidenceKind: "design-reference-page-and-image",
      records,
    },
    null,
    2,
  ) + "\n",
);
await context.close();
assert(
  records.every((r) => r.problems.length === 0),
  "Review slot overflows before requesting appearance approval",
);
process.exit(0);
