// Page evidence only. This harness does not qualify native Console output.
import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

const name = process.argv[2];
if (!name || !/^[a-z-]+$/.test(name)) throw new Error("Use a named snapshot");
const destination = resolve(".artifacts/website", name);
await mkdir(destination, { recursive: true });
const origin = process.env.CONSOLE_FX_WEBSITE_URL ?? "http://127.0.0.1:4194";
const browser = await chromium.connectOverCDP(
  process.env.CONSOLE_FX_CDP ?? "http://127.0.0.1:9344",
);
const observations = [];
for (const width of [1440, 390]) {
  const context = await browser.newContext({
    viewport: { width, height: 1000 },
    reducedMotion: "no-preference",
    hasTouch: width === 390,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    const evidence = { lcp: null, cls: 0, longTasks: [], frames: [] };
    globalThis.websiteEvidence = evidence;
    for (const type of ["largest-contentful-paint", "layout-shift", "longtask"])
      new globalThis.PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (type === "largest-contentful-paint") evidence.lcp = e.startTime;
          if (type === "layout-shift" && !e.hadRecentInput)
            evidence.cls += e.value;
          if (type === "longtask")
            evidence.longTasks.push({
              start: e.startTime,
              duration: e.duration,
            });
        }
      }).observe({ type, buffered: true });
  });
  const scripts = new Set();
  page.on("request", (r) => {
    if (r.resourceType() === "script") scripts.add(new URL(r.url()).pathname);
  });
  await page.goto(origin, { waitUntil: "networkidle" });
  await page.screenshot({ path: resolve(destination, `rest-${width}.png`) });
  const initialScripts = [...scripts].sort();
  const chunks = await Promise.all(
    initialScripts.map(async (path) => {
      const data = await readFile(resolve("apps/studio/out", `.${path}`));
      return {
        path,
        bytes: data.length,
        gzip: gzipSync(data, { level: 9 }).length,
        sha256: createHash("sha256").update(data).digest("hex"),
      };
    }),
  );
  const idleStart = await page.evaluate(() => globalThis.performance.now());
  await page.waitForTimeout(10_000);
  const idleEnd = await page.evaluate(() => globalThis.performance.now());
  // A bounded observer samples frame intervals only during the explicit task.
  await page.evaluate(() => {
    const stop = globalThis.performance.now() + 10_000;
    let last;
    const frame = (now) => {
      if (last !== undefined)
        globalThis.websiteEvidence.frames.push(now - last);
      last = now;
      if (now < stop) globalThis.requestAnimationFrame(frame);
    };
    globalThis.requestAnimationFrame(frame);
  });
  const activeStart = await page.evaluate(() => globalThis.performance.now());
  for (let i = 0; i < 10; i++) {
    const control = page
      .getByRole("button", {
        name: i % 2 ? "Styled" : "Plain",
        exact: true,
      })
      .first();
    if (await control.count()) await control.click();
    else await page.mouse.move(850 + i * 10, 360);
    await page.waitForTimeout(1000);
  }
  const state = await page.evaluate(() => ({
    ...globalThis.websiteEvidence,
    overflow: document.documentElement.scrollWidth > globalThis.innerWidth,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency,
    memory: navigator.deviceMemory ?? null,
  }));
  state.frames.sort((a, b) => a - b);
  observations.push({
    width,
    pointer: width === 390 ? "emulated-touch" : "mouse",
    motion: "no-preference",
    initialScripts: chunks,
    initialGzipBytes: chunks.reduce((n, c) => n + c.gzip, 0),
    idle: {
      duration: idleEnd - idleStart,
      longTasks: state.longTasks.filter(
        (t) => t.start >= idleStart && t.start < idleEnd,
      ),
    },
    active: {
      task: name === "before" ? "pointer movement" : "plain/styled selection",
      longTasks: state.longTasks.filter((t) => t.start >= activeStart),
      frameSamples: state.frames.length,
      frameP95: state.frames[Math.floor(state.frames.length * 0.95)] ?? null,
    },
    ...Object.fromEntries(
      Object.entries(state).filter(
        ([k]) => !["frames", "longTasks"].includes(k),
      ),
    ),
  });
  await context.close();
}
await writeFile(
  resolve(destination, "page-metrics.json"),
  JSON.stringify(
    {
      at: new Date().toISOString(),
      browser: browser.version(),
      kind: "local-page-lab; touch emulation is not mobile hardware; no field data",
      gzipLevel: 9,
      samplesPerViewport: 1,
      observations,
    },
    null,
    2,
  ) + "\n",
);
process.exit(0);
