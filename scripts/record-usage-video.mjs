// Record actual UI interactions in an isolated, already-running Chrome session.
// Run after building and serving the studio; no application state is simulated.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { performance } from "node:perf_hooks";
import { chromium, expect } from "@playwright/test";

const port = process.env.CONSOLE_FX_CDP_PORT
  ? Number(process.env.CONSOLE_FX_CDP_PORT)
  : undefined;
assert(
  port === undefined ||
    (Number.isInteger(port) && port >= 1024 && port <= 65535),
);
const origin = new URL(
  process.env.CONSOLE_FX_VIDEO_ORIGIN ?? "http://127.0.0.1:4210",
);
assert(
  ["localhost", "127.0.0.1"].includes(origin.hostname),
  "Record a local build",
);
const directory = resolve(
  ".artifacts/usage-video",
  new Date().toISOString().replaceAll(":", "-"),
);
await mkdir(directory, { recursive: true });
const browser = port
  ? await chromium.connectOverCDP(`http://127.0.0.1:${port}`)
  : await chromium.launch();
const consoleEntries = [];
const pause = (ms) => new Promise((done) => setTimeout(done, ms));
const cues = [];
const frames = [];
let recording = false;
let start = 0;
let capture;
let captureError;
let context;
try {
  context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 1,
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "log") consoleEntries.push(message.text());
  });
  await page.goto(origin.href);
  const hero = page.getByRole("region", { name: "Explore console use cases" });
  await expect(
    hero.getByRole("button", { name: "Copy recipe", exact: true }),
  ).toBeEnabled();
  await hero.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${directory}/poster.png` });
  const cdp = await context.newCDPSession(page);
  recording = true;
  start = performance.now();
  capture = (async () => {
    while (recording) {
      const at = (performance.now() - start) / 1000;
      const { data } = await cdp.send("Page.captureScreenshot", {
        format: "jpeg",
        quality: 90,
        captureBeyondViewport: false,
      });
      const file = `frame-${String(frames.length).padStart(5, "0")}.jpg`;
      await writeFile(`${directory}/${file}`, Buffer.from(data, "base64"));
      frames.push({ file, at });
      await pause(90);
    }
  })().catch((error) => {
    captureError = error;
    recording = false;
  });
  const cue = (text) =>
    cues.push({ at: (performance.now() - start) / 1000, text });
  const click = async (locator) => {
    await locator.hover();
    await pause(450);
    await locator.click();
  };
  cue(
    "Choose a use case. The preview and complete recipe describe the same output.",
  );
  await pause(4000);
  await click(hero.getByRole("button", { name: "Show code", exact: true }));
  await pause(3000);
  await click(hero.getByRole("button", { name: "Show output", exact: true }));
  await pause(2500);
  cue("Open the example in the workbench. Editing stays silent.");
  await click(hero.getByRole("link", { name: /Edit this example/ }));
  const editor = page.locator("#editor-workspace");
  const message = editor.getByRole("textbox", {
    name: "Message text",
    exact: true,
  });
  await expect(message).toBeVisible();
  await click(message);
  await message.fill("");
  await message.pressSequentially("HELLO DEVELOPER", { delay: 110 });
  await pause(3500);
  assert.equal(consoleEntries.length, 0);
  cue("Open DevTools → Console. Test in console prints exactly one entry.");
  await click(
    editor.getByRole("button", { name: "Test in console", exact: true }),
  );
  await expect(editor.locator(".editor-status")).toContainText(
    "One entry sent",
  );
  assert.equal(consoleEntries.length, 1);
  await pause(4000);
  cue("Copy complete JavaScript. It runs without installing ConsoleFX.");
  const copy = editor.getByRole("button", {
    name: "Copy console.log",
    exact: true,
  });
  await click(copy);
  const generated = editor.getByLabel("Generated code", { exact: true });
  await generated.scrollIntoViewIfNeeded();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(await generated.inputValue());
  await pause(3500);
  cue("Browse by purpose or style. Every example uses the same editor.");
  const sidebar = page.getByRole("complementary", {
    name: "Example catalogue",
  });
  await click(sidebar.getByRole("button", { name: /^All examples/ }));
  await sidebar
    .getByRole("combobox", { name: "Visual style", exact: true })
    .selectOption("card");
  await sidebar
    .getByRole("searchbox", { name: "Search examples" })
    .fill("build receipt");
  await pause(2500);
  await click(sidebar.getByRole("button", { name: /^Build Receipt/ }));
  cue("Confirm the replacement. Your previous work remains in Undo.");
  await pause(3000);
  await click(page.getByRole("button", { name: "Load example", exact: true }));
  const project = editor.getByRole("textbox", { name: "Project", exact: true });
  await expect(project).toBeVisible();
  await project.fill("my-web-app");
  await pause(3500);
  cue("Supply your own facts. Named fields keep the card's layout intact.");
  await pause(3500);
  await click(copy);
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(await generated.inputValue());
  cue(
    "Copy the updated output. Drafts stay in this browser; editing and copying stay silent.",
  );
  assert.equal(consoleEntries.length, 1);
  await pause(4500);
  recording = false;
  await capture;
  if (captureError) throw captureError;
  const duration = (performance.now() - start) / 1000;
  const timestamp = (seconds) =>
    new Date(Math.round(seconds * 1000)).toISOString().slice(11, 23);
  await writeFile(
    `${directory}/usage.vtt`,
    `WEBVTT\n\n${cues.map((entry, index) => `${timestamp(entry.at)} --> ${timestamp(cues[index + 1]?.at ?? duration)}\n${entry.text}\n`).join("\n")}`,
  );
  await writeFile(
    `${directory}/frames.ffconcat`,
    `ffconcat version 1.0\n${frames.map((frame, index) => `file '${frame.file}'\nduration ${((frames[index + 1]?.at ?? duration) - frame.at).toFixed(4)}\n`).join("")}file '${frames.at(-1).file}'\n`,
  );
  await writeFile(
    `${directory}/recording.json`,
    JSON.stringify(
      {
        at: new Date().toISOString(),
        browser: browser.version(),
        origin: origin.origin,
        viewport: { width: 1440, height: 960 },
        duration,
        frameCount: frames.length,
        consoleEntries: consoleEntries.length,
        clipboardVerified: true,
        cues,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(directory);
} finally {
  recording = false;
  await capture?.catch(() => {});
  try {
    await context?.close();
  } finally {
    if (!port) await browser.close();
  }
}

if (port) process.exit(0);
