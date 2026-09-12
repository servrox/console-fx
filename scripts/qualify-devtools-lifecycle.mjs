// Windows-only native DevTools observations. This harness may clear its own
// fixture console and copy its messages; the library never performs those actions.
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { performance } from "node:perf_hooks";
import { nativeBrowserZoom } from "./native-browser-zoom.mjs";
import { compileConsole } from "../packages/console-fx/dist/browser/index.js";
import { exportConsoleLog } from "../packages/console-fx/dist/codegen/index.js";
import { defineScene } from "../packages/console-fx/dist/index.js";
import {
  neon,
  PRESETS,
  createPresetExample,
} from "../packages/console-fx/dist/presets/index.js";

const [port, name, phase = "all"] = process.argv.slice(2);
assert(/^\d+$/.test(port ?? "") && /^(chrome|edge)$/.test(name ?? ""));
assert(
  [
    "all",
    "offscreen",
    "policy",
    "cinematic",
    "cards",
    "card-display",
    "card-zoom",
    "fitting",
    "fitting-context",
    "fitting-offscreen",
  ].includes(phase),
);
const directory = resolve(
  `.artifacts/devtools/${name}-lifecycle-${new Date().toISOString().replaceAll(":", "-")}`,
);
mkdirSync(directory, { recursive: true });
const pause = (ms) => new Promise((done) => setTimeout(done, ms));
const runId = Date.now().toString(36);
const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
const cdp = await browser.newBrowserCDPSession();
const pages = () => browser.contexts().flatMap((context) => context.pages());
const fixturePort = Number(process.env.CONSOLE_FX_FIXTURE_PORT ?? 4176);
const fixture = pages().find(
  (page) => page.url() === `http://127.0.0.1:${fixturePort}/`,
);
assert(fixture, "Open the dedicated fixture page first");
fixture.setDefaultTimeout(10_000);
const fixtureSession = await fixture.context().newCDPSession(fixture);
const { targetInfo: fixtureTarget } = await fixtureSession.send(
  "Target.getTargetInfo",
);
const { processInfo } = await cdp.send("SystemInfo.getProcessInfo");
const processId = processInfo.find((process) => process.type === "browser").id;
let native, nativeTarget, windowId;
async function open() {
  await cdp.send("Target.openDevTools", {
    targetId: fixtureTarget.targetId,
    panelId: "console",
  });
  let targetId;
  // Opening the frontend is asynchronous. Resolve its current target after it
  // becomes a native page, then attach a fresh observer to that exact target.
  for (let attempt = 0; attempt < 10; attempt++) {
    await pause(300);
    ({ targetId } = await cdp.send("Target.getDevToolsTarget", {
      targetId: fixtureTarget.targetId,
    }));
    if (!targetId) continue;
    const observer = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
    for (const page of observer
      .contexts()
      .flatMap((context) => context.pages())
      .filter((page) => page.url().includes("/devtools_app.html"))) {
      const session = await page.context().newCDPSession(page);
      const { targetInfo } = await session.send("Target.getTargetInfo");
      await session.detach();
      if (targetInfo.targetId === targetId) native = page;
    }
    if (native && !native.isClosed()) break;
    await pause(100);
  }
  assert(
    native && !native.isClosed(),
    "The native DevTools target was not attached",
  );
  nativeTarget = targetId;
  native.setDefaultTimeout(10_000);
  const settingsDialog = native.getByRole("dialog").filter({
    has: native.getByRole("heading", { name: "Settings", exact: true }),
  });
  if (await settingsDialog.count())
    await settingsDialog
      .getByRole("button", { name: "Close", exact: true })
      .click();
  const drawer = native.getByRole("button", {
    name: "Close drawer",
    exact: true,
  });
  if (await drawer.count()) await drawer.click();
  await native
    .getByRole("tab", { name: "Console", exact: true })
    .last()
    .click();
  await native
    .getByRole("button", {
      name: "Customize and control DevTools",
      exact: true,
    })
    .last()
    .click();
  const undock = native.getByRole("button", {
    name: "Undock into separate window",
    exact: true,
  });
  if (await undock.count()) await undock.click();
  else await native.keyboard.press("Escape");
  await pause(200);
  ({ windowId } = await cdp.send("Browser.getWindowForTarget", { targetId }));
  await resize(1400, 950);
  await native.keyboard.press("Control+0");
  await native.bringToFront();
}
async function resize(width, height) {
  await cdp.send("Browser.setWindowBounds", {
    windowId,
    bounds: { windowState: "normal" },
  });
  await cdp.send("Browser.setWindowBounds", {
    windowId,
    bounds: { width, height, left: 10, top: 10 },
  });
  await pause(150);
}
async function close() {
  await cdp.send("Target.closeTarget", { targetId: nativeTarget });
  native = undefined;
  await pause(200);
}
await open();
await fixture.reload();
await fixture.locator("#emit").waitFor();
const metadata = await fixture.evaluate(
  () => window.consoleFxFixtures.metadata,
);
const report = {
  observedAt: new Date().toISOString(),
  os: "Windows 11 25H2 build 26220.9223",
  browser: await cdp.send("Browser.getVersion"),
  compiler: metadata,
  devtoolsUrl: native.url(),
  settings: await native.evaluate(() => ({
    viewport: [window.innerWidth, window.innerHeight],
    devicePixelRatio: window.devicePixelRatio,
    theme: document.documentElement.className,
    consoleWidth: document
      .querySelector(".console-view")
      .getBoundingClientRect().width,
    zoom: "Native Ctrl+0",
  })),
  cases: [],
};
function save(record) {
  report.cases.push(record);
  writeFileSync(
    `${directory}/observations.json`,
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(
    JSON.stringify({
      id: record.id,
      calls: record.consoleCalls,
      argumentsEqual: record.argumentsEqual,
      copiedLiteral: record.copiedLiteral,
    }),
  );
}
const events = [];
fixture.on("console", (event) => {
  if (event.type() === "log") events.push(event);
});
async function clear() {
  await native.getByRole("button", { name: /Clear console/ }).click();
}
async function emit(output) {
  const before = events.length;
  await fixture.evaluate((args) => console.log(...args), output.args);
  await native?.bringToFront();
  return { before, time: performance.now() };
}
async function record(id, output, emission) {
  const args = await Promise.all(
    events
      .at(-1)
      .args()
      .map((argument) => argument.jsonValue()),
  );
  const result = {
    id,
    expectedText: output.text,
    expectedArgs: output.args,
    consoleCalls: events.length - emission.before,
    argumentsEqual: JSON.stringify(args) === JSON.stringify(output.args),
    frames: [],
  };
  assert.equal(result.consoleCalls, 1);
  assert(result.argumentsEqual);
  return result;
}
const richMessage = () =>
  native
    .locator(".console-message-text")
    .filter({ has: native.locator("span[style]") })
    .last();
async function capture(row, label, time = 0) {
  const message = richMessage();
  await message.waitFor();
  const carrier = message.locator('span[style*="background"]');
  const clip = await carrier.boundingBox();
  assert(clip);
  const path = `${directory}/${row.id}-${label}.png`;
  await native.screenshot({ path, clip });
  row.frames.push({
    name: label,
    atMs: Math.round(performance.now() - time),
    path,
  });
  row.visibleText = await message.textContent();
  row.imageBounds = clip;
}
const options = { target: "chromium", renderer: "svg", motion: "allow" };
function motionScene(label) {
  return neon({ text: label, motion: "wave" });
}

async function copyNative(row, output) {
  const powershell =
    "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe";
  const script = `Add-Type -AssemblyName UIAutomationClient; $root=[System.Windows.Automation.AutomationElement]::RootElement; $condition=New-Object System.Windows.Automation.AndCondition((New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ProcessIdProperty,${processId})),(New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty,"Copy console"))); $item=$root.FindFirst([System.Windows.Automation.TreeScope]::Descendants,$condition); if($null -eq $item){throw "Native Copy console command missing"}; $item.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke(); Start-Sleep -Milliseconds 150; [Console]::Write([Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes((Get-Clipboard -Raw))))`;
  const copied = Buffer.from(
    execFileSync(
      powershell,
      ["-NoProfile", "-NonInteractive", "-STA", "-Command", script],
      { encoding: "utf8", timeout: 10_000 },
    ).trim(),
    "base64",
  ).toString("utf8");
  // Windows native clipboard uses CRLF for the caption's line breaks. Preserve
  // the raw receipt; normalize only that platform newline convention for comparison.
  row.clipboardNewlines = copied.includes("\r\n") ? "CRLF" : "LF";
  row.copiedLiteral = copied.replaceAll("\r\n", "\n").includes(output.text);
  row.clipboardSha256 = createHash("sha256").update(copied).digest("hex");
  row.clipboardBytes = Buffer.byteLength(copied);
  row.copyMethod = "Native DevTools context menu Copy console with one message";
  // Do not retain unrelated clipboard content if a native copy command failed.
  if (row.copiedLiteral) row.copiedText = copied;
  assert(
    row.copiedLiteral,
    "Native copied text did not contain the complete literal message",
  );
}

if (["fitting", "fitting-context", "fitting-offscreen"].includes(phase)) {
  const fixtures = await fixture.evaluate(
    () => window.consoleFxFixtures.fixtures,
  );
  const compact = fixtures.filter((entry) => entry.id.startsWith("compact-"));
  const containers = fixtures.filter((entry) =>
    entry.id.startsWith("container-"),
  );
  assert.equal(compact.length, 10);
  assert.equal(containers.length, 2);
  async function surface(row, label) {
    const message = richMessage();
    await message.waitFor();
    await native.bringToFront();
    await pause(180);
    row.visibleText = await message.textContent();
    assert(row.visibleText.includes(row.expectedText));
    row.layout = await message.evaluate((element) => {
      const box = (node) => {
        const r = node.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      };
      return {
        message: box(element),
        carrier: box(element.querySelector('span[style*="background"]')),
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
        console: box(document.querySelector(".console-view")),
        viewport: [window.innerWidth, window.innerHeight],
        devicePixelRatio: window.devicePixelRatio,
        theme: document.documentElement.className,
        sourceAnchor:
          element
            .closest(".console-message-wrapper")
            ?.querySelector(".console-message-anchor")?.textContent ?? null,
        timestamp:
          element
            .closest(".console-message-wrapper")
            ?.querySelector(".console-timestamp")?.textContent ?? null,
      };
    });
    const session = await native.context().newCDPSession(native);
    const screenshot = await session.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
    });
    await session.detach();
    const path = `${directory}/${row.id}-${label}.png`;
    writeFileSync(path, Buffer.from(screenshot.data, "base64"));
    row.frames.push({ name: label, path });
  }
  async function offscreenReturn(entry) {
    await clear();
    const emission = await emit(entry.output);
    const row = await record(
      `${entry.id}-offscreen-return`,
      entry.output,
      emission,
    );
    const clipping = async () => {
      const bounds = await native.locator("#console-messages").boundingBox();
      assert(bounds);
      const message = await richMessage().boundingBox();
      return { console: bounds, message };
    };
    await richMessage().waitFor();
    await fixture.evaluate(() =>
      console.log("Qualification spacer\n".repeat(65)),
    );
    await native.bringToFront();
    await native
      .locator(".console-message-text")
      .filter({ hasText: "Qualification spacer" })
      .last()
      .waitFor();
    await native.locator("#console-messages").evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    let hidden;
    for (let attempt = 0; attempt < 30; attempt++) {
      await pause(100);
      hidden = await clipping();
      if (
        !hidden.message ||
        hidden.message.y + hidden.message.height <= hidden.console.y ||
        hidden.message.y >= hidden.console.y + hidden.console.height
      )
        break;
    }
    assert(
      !hidden.message ||
        hidden.message.y + hidden.message.height <= hidden.console.y ||
        hidden.message.y >= hidden.console.y + hidden.console.height,
      "Message must leave the console clipping area",
    );
    row.hiddenGeometry = hidden;
    // A user scroll also releases DevTools' sticky-bottom mode. Assigning
    // scrollTop alone can be immediately undone by the frontend's viewport.
    await native.locator("#console-messages").hover();
    await native.mouse.wheel(0, -10000);
    await pause(250);
    await richMessage().scrollIntoViewIfNeeded();
    let returned;
    for (let attempt = 0; attempt < 30; attempt++) {
      await pause(100);
      returned = await clipping();
      if (
        returned.message &&
        returned.message.y >= returned.console.y &&
        returned.message.y + returned.message.height <=
          returned.console.y + returned.console.height
      )
        break;
    }
    assert(
      returned.message &&
        returned.message.y >= returned.console.y &&
        returned.message.y + returned.message.height <=
          returned.console.y + returned.console.height,
      "Returned message must fit within the console clipping area",
    );
    row.returnedGeometry = returned;
    await surface(row, "returned");
    row.harnessSpacerCalls = 1;
    assert.equal(events.length - emission.before, 2);
    save(row);
  }
  if (phase === "fitting-offscreen") {
    for (const entry of containers) await offscreenReturn(entry);
  }
  if (phase === "fitting") {
    // Execute the shipped standalone expression, then copy the actual native caption.
    for (const entry of compact) {
      await clear();
      const before = events.length;
      const prompt = native.getByRole("textbox", {
        name: "Console prompt",
        exact: true,
      });
      await prompt.fill(entry.code);
      await prompt.press("Enter");
      await pause(180);
      const row = await record(`${entry.id}-generated-copy`, entry.output, {
        before,
      });
      row.code = entry.code;
      await surface(row, "native");
      await richMessage().click({ button: "right" });
      await copyNative(row, entry.output);
      save(row);
    }
    // Both carriers use the same fitted scene; resize each existing entry without logging again.
    for (const entry of containers)
      for (const mode of ["fixed", "container-experimental"]) {
        const output = compileConsole(entry.scene, {
          ...entry.options,
          sizing:
            mode === "fixed"
              ? { mode, width: entry.options.sizing.maxWidth }
              : entry.options.sizing,
        });
        await clear();
        const emission = await emit(output);
        for (const width of [280, 360, 480, 720, 960]) {
          await resize(width + 28, 950);
          const row = await record(
            `${entry.id}-${mode}-${width}`,
            output,
            emission,
          );
          row.requestedConsoleWidth = width;
          row.resizedExistingEntry = true;
          row.options = {
            ...entry.options,
            sizing:
              mode === "fixed"
                ? { mode, width: entry.options.sizing.maxWidth }
                : entry.options.sizing,
          };
          await surface(row, "resized");
          row.clippedHorizontally =
            row.layout.carrier.x + row.layout.carrier.width >
            row.layout.viewport[0];
          row.observation =
            "Measured frontend geometry; actual image-text readability remains unknown for container sizing.";
          save(row);
        }
        await resize(1400, 950);
      }
    for (const entry of [compact[0], ...containers]) {
      await clear();
      await close();
      const emission = await emit(entry.output);
      await open();
      const late = await record(
        `${entry.id}-before-open`,
        entry.output,
        emission,
      );
      await surface(late, "opened");
      save(late);
      await close();
      await open();
      const reopened = await record(
        `${entry.id}-reopened`,
        entry.output,
        emission,
      );
      await surface(reopened, "reopened");
      save(reopened);
      await clear();
      for (const repeat of [1, 2]) {
        const repeated = await record(
          `${entry.id}-repeat-${repeat}`,
          entry.output,
          await emit(entry.output),
        );
        await surface(repeated, "repeated");
        save(repeated);
      }
    }
    // Light theme and actual 200% DevTools zoom supplement the dark/100% fixture run.
    for (const [theme, steps] of [
      ["Light", 0],
      ["Dark", 5],
    ]) {
      await native.getByRole("button", { name: /^Settings - F1/ }).click();
      await native
        .getByRole("combobox", { name: "Theme:", exact: true })
        .selectOption({ label: theme });
      await native
        .getByRole("dialog")
        .getByRole("button", { name: "Close", exact: true })
        .click();
      await native.keyboard.press("Control+0");
      const base = await native.evaluate(() => window.devicePixelRatio);
      for (let i = 0; i < steps; i++)
        await native.keyboard.press("Control+Equal");
      await pause(200);
      for (const entry of compact) {
        await clear();
        const row = await record(
          `${entry.id}-${theme}-${steps ? 200 : 100}`,
          entry.output,
          await emit(entry.output),
        );
        await surface(row, "appearance");
        row.zoom = Math.round((row.layout.devicePixelRatio / base) * 100);
        assert.equal(row.zoom, steps ? 200 : 100);
        save(row);
      }
    }
    await native.keyboard.press("Control+0");
  }
  if (phase === "fitting-context") {
    for (const entry of containers) {
      const output = entry.output;
      const snap = async (label, emission, details = {}) => {
        const row = await record(`${entry.id}-${label}`, output, emission);
        Object.assign(row, details);
        await surface(row, "context");
        save(row);
      };
      await clear();
      let emission = await emit(output);
      await snap("anonymous-source", emission, {
        sourceMethod: "Harness evaluate, native anonymous VM anchor retained",
      });
      await clear();
      const before = events.length;
      await fixture.addScriptTag({
        content: `${entry.code}\n//# sourceURL=https://consolefx.invalid/qualification/a-long-source-link/unchanged-container-entry/source-context-for-the-responsive-fitting-matrix.js`,
      });
      emission = { before };
      await snap("long-source", emission, {
        sourceMethod:
          "Inline harness script with an explicit long sourceURL; no network request",
      });
      const sidebar = native.getByRole("button", {
        name: "Show Console sidebar",
        exact: true,
      });
      if (await sidebar.count()) {
        await sidebar.click();
        await snap("sidebar", emission, {
          sidebar: "visible",
          resizedExistingEntry: true,
        });
        await native
          .getByRole("button", { name: "Hide Console sidebar", exact: true })
          .click();
      }
      await native.getByRole("button", { name: /^Settings - F1/ }).click();
      const timestamps = native.getByRole("checkbox", {
        name: /^(Show timestamps|Timestamps)$/i,
      });
      if (await timestamps.count()) {
        await timestamps.check();
        await native
          .getByRole("dialog")
          .getByRole("button", { name: "Close", exact: true })
          .click();
        await snap("timestamps", emission, {
          timestamps: true,
        });
        await native.getByRole("button", { name: /^Settings - F1/ }).click();
        await timestamps.uncheck();
      } else
        save({
          id: `${entry.id}-timestamps`,
          status: "not-observed",
          reason: "Native timestamp control was unavailable",
        });
      await native
        .getByRole("dialog")
        .getByRole("button", { name: "Close", exact: true })
        .click();
      await clear();
      await fixture.evaluate(() => {
        console.group("Fitting outer group");
        console.group("Fitting inner group");
      });
      emission = await emit(output);
      await snap("nested-groups", emission, {
        groupDepth: 2,
        harnessGroupCalls: 2,
      });
      await fixture.evaluate(() => {
        console.groupEnd();
        console.groupEnd();
      });
      await clear();
      emission = await emit(output);
      const baseRatio = await native.evaluate(() => window.devicePixelRatio);
      await native.keyboard.press("Control+Equal");
      await native.keyboard.press("Control+Equal");
      await pause(200);
      const zoom = Math.round(
        ((await native.evaluate(() => window.devicePixelRatio)) / baseRatio) *
          100,
      );
      assert.equal(zoom, 125);
      await snap("zoom-125", emission, { zoom, resizedExistingEntry: true });
      await native.keyboard.press("Control+0");
      await nativeBrowserZoom(fixture, processId, 0);
      const pageBase = await fixture.evaluate(() => window.devicePixelRatio);
      await nativeBrowserZoom(fixture, processId, 2);
      const pageZoom = Math.round(
        ((await fixture.evaluate(() => window.devicePixelRatio)) / pageBase) *
          100,
      );
      assert.equal(pageZoom, 125);
      await snap("page-zoom", emission, {
        pageZoom,
        devtoolsZoom: 100,
        resizedExistingEntry: true,
      });
      await nativeBrowserZoom(fixture, processId, 0);
      for (const [dock, button] of [
        ["right", "Dock to right"],
        ["bottom", "Dock to bottom"],
        ["undocked", "Undock into separate window"],
      ]) {
        await native
          .getByRole("button", {
            name: "Customize and control DevTools",
            exact: true,
          })
          .last()
          .click();
        const control = native.getByRole("button", {
          name: button,
          exact: true,
        });
        if (!(await control.count())) {
          await native.keyboard.press("Escape");
          save({
            id: `${entry.id}-dock-${dock}`,
            status: "not-observed",
            reason: "Native docking control unavailable",
          });
          continue;
        }
        await control.click();
        await pause(250);
        await snap(`dock-${dock}`, emission, {
          docking: dock,
          resizedExistingEntry: true,
        });
      }
      await native
        .getByRole("tab", { name: "Elements", exact: true })
        .first()
        .click();
      await native.keyboard.press("Escape");
      await snap("drawer", emission, {
        docking: "undocked",
        consoleDrawer: true,
        resizedExistingEntry: true,
      });
      const drawerClose = native.getByRole("button", {
        name: "Close drawer",
        exact: true,
      });
      if (await drawerClose.count()) await drawerClose.click();
      await native
        .getByRole("tab", { name: "Console", exact: true })
        .first()
        .click();
      await offscreenReturn(entry);
      await open();
    }
  }
}

if (phase === "card-display" || phase === "card-zoom") {
  const displayCases =
    phase === "card-zoom"
      ? [["Dark", 5]]
      : [
          ["Light", 0],
          ["Dark", 0],
          ["Dark", 5],
        ];
  for (const [theme, zoomSteps] of displayCases) {
    await native.getByRole("button", { name: /^Settings - F1/ }).click();
    await native
      .getByRole("combobox", { name: "Theme:", exact: true })
      .selectOption({ label: theme });
    const selectedTheme = await native
      .getByRole("combobox", { name: "Theme:", exact: true })
      .inputValue();
    await native
      .getByRole("dialog")
      .getByRole("button", { name: "Close", exact: true })
      .click();
    await native.keyboard.press("Control+0");
    const baseRatio = await native.evaluate(() => window.devicePixelRatio);
    for (let i = 0; i < zoomSteps; i++)
      await native.keyboard.press("Control+Equal");
    await pause(300);
    const layout = await native.evaluate(() => ({
      viewport: [window.innerWidth, window.innerHeight],
      devicePixelRatio: window.devicePixelRatio,
      theme: document.documentElement.className,
      consoleWidth: document
        .querySelector(".console-view")
        .getBoundingClientRect().width,
    }));
    const zoom = Math.round((layout.devicePixelRatio / baseRatio) * 100);
    assert.equal(
      zoom,
      zoomSteps ? 200 : 100,
      "Native DevTools zoom must actually change",
    );
    for (const entry of PRESETS.filter(
      (item) => item.group === "Useful" || item.group === "Artful",
    )) {
      const output = compileConsole(createPresetExample(entry.id), {
        ...options,
        motion: "reduce",
      });
      await clear();
      const row = await record(
        `${entry.id}-${theme.toLowerCase()}-${zoom}`,
        output,
        await emit(output),
      );
      await richMessage().waitFor();
      row.visibleText = await richMessage().textContent();
      assert(row.visibleText.includes(output.text));
      row.layout = {
        ...layout,
        selectedTheme,
        zoom,
        zoomMethod: "Native Ctrl+0 then Ctrl+Equal",
      };
      row.imageBounds = await richMessage()
        .locator('span[style*="background"]')
        .boundingBox();
      row.context = `${directory}/${row.id}-console.png`;
      // The native frontend capture uses device-independent coordinates at zoom.
      // Capture its visible surface without Playwright's CSS-sized viewport clip.
      const session = await native.context().newCDPSession(native);
      const surface = await session.send("Page.captureScreenshot", {
        format: "png",
        fromSurface: true,
      });
      writeFileSync(row.context, Buffer.from(surface.data, "base64"));
      row.captureMethod =
        "CDP Page.captureScreenshot, visible surface, no clip";
      row.captureMetrics = await session.send("Page.getLayoutMetrics");
      await session.detach();
      if (zoom === 100) await capture(row, "static");
      save(row);
    }
  }
  await native.keyboard.press("Control+0");
}

if (phase === "cinematic" || phase === "cards") {
  for (const entry of PRESETS.filter((item) =>
    phase === "cinematic"
      ? item.group === "Cinematic Metal"
      : item.group === "Useful" || item.group === "Artful",
  )) {
    const scene = createPresetExample(entry.id);
    const output = compileConsole(scene, { ...options, motion: "reduce" });
    const code = exportConsoleLog(scene, {
      target: "chromium",
      renderer: "svg",
    }).code;
    const prompt = () =>
      native.getByRole("textbox", { name: "Console prompt", exact: true });
    await clear();
    let before = events.length;
    await prompt().fill(code);
    await prompt().press("Enter");
    await pause(200);
    const generated = await record(`${entry.id}-generated-copy`, output, {
      before,
    });
    generated.code = code;
    await capture(generated, "static");
    await richMessage().click({ button: "right" });
    await copyNative(generated, output);
    save(generated);

    await clear();
    await close();
    const emission = await emit(output);
    await open();
    const late = await record(`${entry.id}-before-open`, output, emission);
    await capture(late, "static");
    save(late);
    await close();
    await open();
    const reopened = await record(`${entry.id}-reopened`, output, emission);
    await capture(reopened, "static");
    save(reopened);

    await clear();
    for (const repeat of [1, 2]) {
      before = events.length;
      await prompt().fill(code);
      await prompt().press("Enter");
      await pause(150);
      const row = await record(
        `${entry.id}-repeated-snippet-${repeat}`,
        output,
        { before },
      );
      await capture(row, "static");
      save(row);
    }
    await clear();
    await resize(440, 700);
    const narrow = await record(
      `${entry.id}-narrow-console`,
      output,
      await emit(output),
    );
    narrow.visibleText = await richMessage().textContent();
    narrow.layout = await native.evaluate(() => ({
      viewport: [window.innerWidth, window.innerHeight],
      consoleWidth: document
        .querySelector(".console-view")
        .getBoundingClientRect().width,
      zoom: "Native Ctrl+0",
      theme: document.documentElement.className,
    }));
    assert(
      narrow.layout.consoleWidth <= 500,
      "Resize must narrow DevTools itself",
    );
    assert(narrow.visibleText.includes(output.text));
    narrow.context = `${directory}/${narrow.id}-console.png`;
    await native.screenshot({ path: narrow.context });
    await richMessage().click({ button: "right", position: { x: 10, y: 10 } });
    await copyNative(narrow, output);
    save(narrow);
    await resize(1400, 950);
  }
}

// The actual generated expression is entered in the native Console prompt.
if (phase === "all") {
  await clear();
  const literalScene = defineScene({
    schemaVersion: 1,
    label: "Literal formatter corpus",
    lines: [
      {
        runs: [
          {
            text: "100% %c %s %d %i %f %o %O %% %%%s 👩🏽‍💻 ",
            style: { color: "#008b9e" },
          },
          { text: "second %c %s é שלום", style: { color: "#855c0e" } },
        ],
      },
    ],
  });
  const css = compileConsole(literalScene, {
    target: "chromium",
    renderer: "css",
  });
  const code = exportConsoleLog(literalScene, {
    target: "chromium",
    renderer: "css",
  }).code;
  const prompt = native.getByRole("textbox", {
    name: "Console prompt",
    exact: true,
  });
  const before = events.length;
  await prompt.fill(code);
  await prompt.press("Enter");
  await pause(200);
  const literal = await record("generated-literal-corpus", css, { before });
  literal.code = code;
  literal.visibleText = await richMessage().textContent();
  assert.equal(literal.visibleText, css.text);
  literal.context = `${directory}/${literal.id}-console.png`;
  await native.screenshot({ path: literal.context });
  save(literal);

  // Copy the single emitted message using DevTools' native Copy console command.
  for (const [id, output] of [
    ["copy-css-literal", css],
    [
      "copy-svg-caption",
      compileConsole(motionScene("ConsoleFX copied caption 👩🏽‍💻 %c %s"), {
        ...options,
        motion: "reduce",
      }),
    ],
  ]) {
    await clear();
    const emission = await emit(output);
    const row = await record(id, output, emission);
    await richMessage().click({ button: "right" });
    await copyNative(row, output);
    row.context = `${directory}/${id}-console.png`;
    await native.screenshot({ path: row.context });
    save(row);
  }

  // Logging before open starts no JS timers or additional console emissions.
  await clear();
  await close();
  const late = compileConsole(
    motionScene(`Before ${name} ${runId.slice(-4)}`),
    options,
  );
  const lateEmission = await emit(late);
  await pause(5600);
  await open();
  const lateRow = await record("logged-before-open", late, lateEmission);
  await capture(lateRow, "opened", lateEmission.time);
  await pause(700);
  await capture(lateRow, "moving", lateEmission.time);
  await pause(5100);
  await capture(lateRow, "end", lateEmission.time);
  await pause(1200);
  await capture(lateRow, "after", lateEmission.time);
  save(lateRow);
  await close();
  await open();
  const reopen = await record("reopened-buffered-entry", late, lateEmission);
  await capture(reopen, "opened", lateEmission.time);
  await pause(900);
  await capture(reopen, "later", lateEmission.time);
  save(reopen);

  await clear();
  const repeatEmission = await emit(late);
  const repeated = await record(
    "repeated-identical-image",
    late,
    repeatEmission,
  );
  await capture(repeated, "early", repeatEmission.time);
  await pause(800);
  await capture(repeated, "moving", repeatEmission.time);
  await pause(5000);
  await capture(repeated, "end", repeatEmission.time);
  await pause(1200);
  await capture(repeated, "after", repeatEmission.time);
  save(repeated);

  // A native narrow console may clip the fixed image; the caption must remain text.
  await clear();
  const narrowOutput = compileConsole(motionScene("ConsoleFX narrow caption"), {
    ...options,
    motion: "reduce",
  });
  const narrowEmission = await emit(narrowOutput);
  await resize(440, 700);
  const narrow = await record("narrow-console", narrowOutput, narrowEmission);
  narrow.visibleText = await richMessage().textContent();
  narrow.layout = await richMessage().evaluate((element) => ({
    width: element.getBoundingClientRect().width,
    scrollWidth: element.scrollWidth,
    consoleWidth: document
      .querySelector(".console-view")
      .getBoundingClientRect().width,
  }));
  assert(narrow.visibleText.includes(narrowOutput.text));
  narrow.context = `${directory}/${narrow.id}-console.png`;
  await native.screenshot({ path: narrow.context });
  save(narrow);
  await resize(1400, 950);
}

if (phase === "policy") {
  const scene = motionScene(`Static ${name} ${runId.slice(-4)}`);
  for (const policy of ["default", "system-reduce"]) {
    await fixture.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(
      await fixture.evaluate(
        () =>
          window.matchMedia("(prefers-reduced-motion: no-preference)").matches,
      ),
      false,
    );
    await clear();
    const output = compileConsole(scene, { ...options, motion: "reduce" });
    const code = exportConsoleLog(scene, {
      target: "chromium",
      renderer: "svg",
      ...(policy === "system-reduce" ? { motion: "system" } : {}),
    }).code;
    const before = events.length;
    const started = performance.now();
    const prompt = native.getByRole("textbox", {
      name: "Console prompt",
      exact: true,
    });
    await prompt.fill(code);
    await prompt.press("Enter");
    await pause(150);
    const row = await record(`generated-${policy}`, output, { before });
    row.code = code;
    row.reducedMotion = true;
    await capture(row, "early", started);
    await pause(1000);
    await capture(row, "later", started);
    save(row);
  }
  await fixture.emulateMedia({ reducedMotion: "no-preference" });
}

// Move an animated entry out of view without asking ConsoleFX to print again.
if (phase === "all" || phase === "offscreen") {
  await clear();
  const offscreenOutput = compileConsole(
    motionScene(`Hidden ${name} ${runId.slice(-4)}`),
    options,
  );
  const offscreenEmission = await emit(offscreenOutput);
  const offscreen = await record(
    "offscreen-and-return",
    offscreenOutput,
    offscreenEmission,
  );
  await capture(offscreen, "early", offscreenEmission.time);
  const messageHandle = await richMessage().elementHandle();
  await fixture.evaluate(() =>
    console.log("Qualification spacer\n".repeat(65)),
  );
  await native.bringToFront();
  offscreen.harnessSpacerCalls = 1;
  offscreen.hiddenBounds = await messageHandle.boundingBox();
  await pause(5600);
  await native.locator("#console-messages").hover();
  await native.mouse.wheel(0, -2000);
  await pause(250);
  await capture(offscreen, "returned", offscreenEmission.time);
  await pause(900);
  await capture(offscreen, "later", offscreenEmission.time);
  save(offscreen);
}
console.log(`Lifecycle observation record: ${directory}/observations.json`);
process.exit(0);
