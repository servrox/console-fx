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
const output = process.env.CONSOLE_FX_WEBSITE_OUT ?? "apps/studio/out";
const effectsOff = process.env.CONSOLE_FX_EFFECTS_OFF === "1";
const trace = process.env.CONSOLE_FX_TRACE === "1";
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
  const session = await context.newCDPSession(page);
  const { targetInfo } = await session.send("Target.getTargetInfo");
  const { windowId } = await session.send("Browser.getWindowForTarget", {
    targetId: targetInfo.targetId,
  });
  await session.send("Browser.setWindowBounds", {
    windowId,
    bounds: { windowState: "normal" },
  });
  await page.bringToFront();
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
  await page.bringToFront();
  if (effectsOff)
    await page.getByRole("button", { name: "Turn off", exact: true }).click();
  await page.screenshot({ path: resolve(destination, `rest-${width}.png`) });
  const initialScripts = [...scripts].sort();
  const chunks = await Promise.all(
    initialScripts.map(async (path) => {
      const data = await readFile(resolve(output, `.${path}`));
      return {
        path,
        bytes: data.length,
        gzip: gzipSync(data, { level: 9 }).length,
        sha256: createHash("sha256").update(data).digest("hex"),
      };
    }),
  );
  if (trace)
    await session.send("Tracing.start", {
      categories: "devtools.timeline,v8,blink.user_timing",
      transferMode: "ReturnAsStream",
    });
  const idleStart = await page.evaluate(() => {
    globalThis.performance.mark("consolefx-idle-start");
    return globalThis.performance.now();
  });
  await page.waitForTimeout(10_000);
  const idleEnd = await page.evaluate(() => {
    globalThis.performance.mark("consolefx-idle-end");
    return globalThis.performance.now();
  });
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
  const activeStart = await page.evaluate(() => {
    globalThis.performance.mark("consolefx-active-start");
    return globalThis.performance.now();
  });
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
  const state = await page.evaluate(
    (effectsOff) => ({
      ...globalThis.websiteEvidence,
      overflow: document.documentElement.scrollWidth > globalThis.innerWidth,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency,
      memory: navigator.deviceMemory ?? null,
      visibility: document.visibilityState,
      focused: document.hasFocus(),
      effectsOff,
    }),
    effectsOff,
  );
  await page.evaluate(() =>
    globalThis.performance.mark("consolefx-active-end"),
  );
  let traceArtifact;
  if (trace) {
    const complete = new Promise((done) =>
      session.once("Tracing.tracingComplete", done),
    );
    await session.send("Tracing.end");
    const { stream } = await complete;
    const parts = [];
    let bytes = 0;
    for (;;) {
      const chunk = await session.send("IO.read", { handle: stream });
      const data = Buffer.from(
        chunk.data,
        chunk.base64Encoded ? "base64" : "utf8",
      );
      bytes += data.length;
      if (bytes > 50 * 1024 * 1024)
        throw new Error("Trace exceeds the local evidence bound");
      parts.push(data);
      if (chunk.eof) break;
    }
    await session.send("IO.close", { handle: stream });
    const compressed = gzipSync(Buffer.concat(parts), { level: 9 });
    const path = `timeline-${width}.json.gz`;
    await writeFile(resolve(destination, path), compressed);
    traceArtifact = {
      path,
      rawBytes: bytes,
      gzipBytes: compressed.length,
      sha256: createHash("sha256").update(compressed).digest("hex"),
    };
  }
  state.frames.sort((a, b) => a - b);
  observations.push({
    width,
    pointer: width === 390 ? "emulated-touch" : "mouse",
    motion: "no-preference",
    trace: traceArtifact,
    initialScripts: chunks,
    initialGzipBytes: chunks.reduce((n, c) => n + c.gzip, 0),
    idle: {
      duration: idleEnd - idleStart,
      longTasks: state.longTasks.filter(
        (t) => t.start >= idleStart && t.start < idleEnd,
      ),
    },
    active: {
      task: name.startsWith("before")
        ? "pointer movement"
        : "plain/styled selection",
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
