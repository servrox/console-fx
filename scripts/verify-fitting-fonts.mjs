// Owned-page local-font evidence only; this is not native DevTools qualification.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { build } from "esbuild";
import { chromium } from "@playwright/test";
const destination = resolve(
  process.env.CONSOLE_FX_FITTING_DIR ?? ".artifacts/fitting/fonts",
);
mkdirSync(destination, { recursive: true });
const bundle = await build({
  stdin: {
    contents: `import * as api from './packages/console-fx/src/browser/index.ts';import * as presets from './packages/console-fx/src/presets/index.ts';import {defineScene} from './packages/console-fx/src/index.ts';globalThis.consoleFxTest={...api,...presets,defineScene};`,
    resolveDir: process.cwd(),
    sourcefile: "font-verification.ts",
  },
  bundle: true,
  format: "iife",
  platform: "browser",
  write: false,
});
const browser = await chromium.connectOverCDP(
  process.env.CONSOLE_FX_CDP ?? "http://127.0.0.1:9344",
);
const context = await browser.newContext({
  viewport: { width: 1100, height: 700 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
const requests = [];
page.on("request", (r) => requests.push(r.url()));
await page.setContent(
  '<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#17202a;color:white}img{display:block}</style><main></main>',
);
await page.addScriptTag({ content: bundle.outputFiles[0].text });
try {
  const results = await page.evaluate(() => {
    const api = globalThis.consoleFxTest;
    const environment = `${navigator.platform};${navigator.userAgent};fonts-empty/v1`;
    // Keep the explicit identifier within the core's bound and record the full UA separately.
    const id = `${navigator.platform};Chrome153;fonts-empty/v1`;
    const sample = (text, effects = []) =>
      api.defineScene({
        schemaVersion: 1,
        label: "Font check",
        surface: { padding: 16 },
        lines: [
          {
            runs: [
              {
                text,
                style: { fontSize: 32, fontFamily: "sans", fontWeight: 400 },
                effects,
              },
            ],
          },
        ],
      });
    const cases = [
      ...api.PRESETS.filter(
        (p) =>
          p.group === "Useful" ||
          p.group === "Artful" ||
          p.group === "Cinematic Metal",
      ).map((p) => ({ id: p.id, scene: api.createPresetExample(p.id) })),
      ...[
        ["latin-wide", "WWWW WWWW office AV"],
        ["combining", "Cafe\u0301 e\u0301"],
        ["cjk", "漢字の読みやすい表示"],
        ["rtl", "مرحبا بالعالم שלום"],
        ["emoji", "👩🏽‍💻 👨‍👩‍👧‍👦 🇩🇪"],
        ["lines", "First line\nSecond line"],
        ["short-glow", "i"],
      ].map(([id, text]) => ({
        id,
        scene: sample(
          text,
          id === "short-glow"
            ? [
                { kind: "neon", intensity: 1 },
                { kind: "wave", amplitude: 10 },
              ]
            : [],
        ),
      })),
    ];
    const rows = [];
    const main = document.querySelector("main");
    let measuredCalls = 0;
    for (const item of cases)
      for (const width of [280, 360, 480, 720, 960]) {
        const options = {
          target: "chromium",
          renderer: "svg",
          motion: "allow",
          layout: {
            algorithm: "fit/v1",
            width,
            maxHeight: 400,
            variant: "standard",
            overflow: "shrink",
            minFontSize: 10,
          },
          measurementEnvironment: id,
        };
        const before = JSON.stringify(item.scene);
        const preflight = api.prepareTextMeasurements(item.scene, options);
        if (!preflight.ok) {
          rows.push({
            id: item.id,
            width,
            phase: "preflight",
            diagnostics: preflight.diagnostics,
          });
          continue;
        }
        const nodeCount = document.querySelectorAll("*").length;
        const measured = api.measureTextBatch(preflight.value, id);
        measuredCalls++;
        if (document.querySelectorAll("*").length !== nodeCount)
          throw new Error("Measurement changed page DOM");
        if (!measured.ok) {
          rows.push({
            id: item.id,
            width,
            phase: "measurement",
            diagnostics: measured.diagnostics,
          });
          continue;
        }
        try {
          const output = api.compileConsole(item.scene, {
            ...options,
            measurements: measured.value,
          });
          if (before !== JSON.stringify(item.scene))
            throw new Error("Scene mutated");
          if (output.preview.kind !== "svg")
            throw new Error("Unexpected fallback");
          main.innerHTML = decodeURIComponent(
            output.preview.imageUri.split(",")[1],
          );
          const svg = main.querySelector("svg");
          const svgRect = svg.getBoundingClientRect();
          const textBounds = [
            ...svg.querySelectorAll('text:not([aria-hidden="true"])'),
          ].map((t) => {
            const r = t.getBoundingClientRect();
            return {
              text: t.textContent,
              x: r.x - svgRect.x,
              y: r.y - svgRect.y,
              width: r.width,
              height: r.height,
              inside:
                r.x >= svgRect.x - 0.75 &&
                r.y >= svgRect.y - 0.75 &&
                r.right <= svgRect.right + 0.75 &&
                r.bottom <= svgRect.bottom + 0.75,
            };
          });
          rows.push({
            id: item.id,
            width,
            phase: "compiled",
            report: output.layout,
            text: output.text,
            imageUri: output.preview.imageUri,
            textBounds,
          });
        } catch (error) {
          rows.push({
            id: item.id,
            width,
            phase: "fit-failure",
            diagnostics: error.diagnostics ?? String(error),
          });
        }
      }
    const blocked = new globalThis.FontFace(
      "Arial",
      'url("https://invalid.example/console-fx-forbidden-font.woff")',
    );
    document.fonts.add(blocked);
    const p = api.prepareTextMeasurements(sample("Blocked font"), {
      target: "chromium",
      renderer: "svg",
      layout: {
        algorithm: "fit/v1",
        width: 360,
        maxHeight: 400,
        variant: "standard",
        overflow: "error",
        minFontSize: 10,
      },
      measurementEnvironment: id,
    });
    const denied = p.ok ? api.measureTextBatch(p.value, id) : p;
    document.fonts.delete(blocked);
    return {
      environment,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      rows,
      measuredCalls,
      webFontGuard: denied,
    };
  });
  const escaped = results.rows.filter((r) =>
    r.textBounds?.some((b) => !b.inside),
  );
  const compiled = results.rows.filter((r) => r.phase === "compiled");
  const failures = results.rows.filter((r) => r.phase !== "compiled");
  assert.equal(requests.length, 0, "Library measurement fetched a resource");
  assert.equal(results.webFontGuard.ok, false);
  writeFileSync(
    resolve(destination, "receipt.json"),
    JSON.stringify(
      {
        observedAt: new Date().toISOString(),
        sourceTree: execFileSync(
          "git",
          ["rev-parse", "HEAD:packages/console-fx/src"],
          { encoding: "utf8" },
        ).trim(),
        bundledSourceSha256: createHash("sha256")
          .update(bundle.outputFiles[0].contents)
          .digest("hex"),
        browser: await browser.version(),
        evidenceKind: "owned-page-font-measurement-and-svg-bounds",
        networkRequests: requests,
        ...results,
      },
      null,
      2,
    ) + "\n",
  );
  for (const row of compiled.filter(
    (r) => r.width === 720 || (r.id === "short-glow" && r.width === 280),
  )) {
    await page.locator("main").evaluate((main, uri) => {
      main.replaceChildren(
        Object.assign(document.createElement("img"), {
          src: uri,
          alt: "Fitted source image",
        }),
      );
    }, row.imageUri);
    await page.locator("img").evaluate((img) => img.decode());
    await page
      .locator("img")
      .screenshot({ path: resolve(destination, `${row.id}-${row.width}.png`) });
  }
  console.log(
    JSON.stringify({
      cases: results.rows.length,
      compiled: compiled.length,
      failures: failures.map(({ id, width, phase, diagnostics }) => ({
        id,
        width,
        phase,
        diagnostics,
      })),
      escaped: escaped.map(({ id, width, textBounds }) => ({
        id,
        width,
        textBounds: textBounds.filter((b) => !b.inside),
      })),
      networkRequests: requests.length,
      webFontGuard: results.webFontGuard,
    }),
  );
  assert.equal(escaped.length, 0, "Fitted SVG text escaped its artboard");
} finally {
  await context.close();
}
// Leave the externally launched browser running; this CLI owns only its context.
process.exit(0);
