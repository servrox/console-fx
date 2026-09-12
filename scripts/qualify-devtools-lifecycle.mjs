// Windows-only native DevTools observations. This harness may clear its own
// fixture console and copy its messages; the library never performs those actions.
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { performance } from "node:perf_hooks";
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
assert(["all", "offscreen", "policy", "cinematic", "cards"].includes(phase));
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
  const drawer = native.getByRole("button", {
    name: "Close drawer",
    exact: true,
  });
  if (await drawer.count()) await drawer.click();
  await native
    .getByRole("tab", { name: "Console", exact: true })
    .last()
    .click();
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
