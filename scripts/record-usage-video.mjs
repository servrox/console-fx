// Record actual UI interactions in an isolated, already-running Chrome session.
// Run after building and serving the studio; no application state is simulated.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { performance } from "node:perf_hooks";
import { chromium, expect } from "@playwright/test";

const port = Number(process.env.CONSOLE_FX_CDP_PORT ?? 9344);
assert(Number.isInteger(port) && port >= 1024 && port <= 65535);
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
const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
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
  const demo = page.locator(".quick-demo");
  await expect(
    demo.getByRole("button", { name: "Copy console.log", exact: true }),
  ).toBeEnabled();
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
  cue("Make a browser-console message. Start with the live example.");
  await pause(3500);
  cue("Write your message. Editing stays silent.");
  const input = demo.getByRole("textbox", { name: "Your message" });
  await click(input);
  await input.fill("");
  await input.pressSequentially("Hello from ConsoleFX!", { delay: 95 });
  await pause(2100);
  cue("Choose a style, then compare the same words as plain text.");
  await demo.getByRole("combobox").selectOption("rgbSplit");
  await pause(2200);
  await click(demo.getByRole("button", { name: "Plain", exact: true }));
  await pause(1800);
  await click(demo.getByRole("button", { name: "Styled", exact: true }));
  await pause(1800);
  assert.equal(consoleEntries.length, 0);
  cue("Open DevTools → Console. Test in console prints one entry.");
  await click(
    demo.getByRole("button", { name: "Test in console", exact: true }),
  );
  await expect(demo.getByRole("status")).toContainText("Printed one message");
  assert.equal(consoleEntries.length, 1);
  await pause(3500);
  cue("Copy the complete console.log. It runs without installing ConsoleFX.");
  await click(
    demo.getByRole("button", { name: "Copy console.log", exact: true }),
  );
  await expect(demo.getByRole("status")).toContainText("Copied console.log");
  await pause(2200);
  await click(demo.locator("summary"));
  await demo.getByLabel("Demo JavaScript").scrollIntoViewIfNeeded();
  const source = await demo.getByLabel("Demo JavaScript").inputValue();
  assert.equal(
    await page.evaluate(() => navigator.clipboard.readText()),
    source,
  );
  await pause(3200);
  cue("Need more control? Take the same scene into the playground.");
  await click(demo.getByRole("button", { name: "Edit in playground" }));
  await expect(
    page.getByRole("dialog", { name: "Edit this example in the playground?" }),
  ).toBeVisible();
  cue("Confirm Load example. Your previous scene remains in Undo.");
  await pause(2300);
  await click(page.getByRole("button", { name: "Load example", exact: true }));
  const editor = page.locator("#editor-workspace");
  await expect(
    editor.getByRole("textbox", { name: "Message text", exact: true }),
  ).toHaveValue("Hello from ConsoleFX!");
  await editor.scrollIntoViewIfNeeded();
  await pause(3200);
  cue("Keep editing, with undo and a draft saved in this browser.");
  const message = editor.getByRole("textbox", {
    name: "Message text",
    exact: true,
  });
  await click(message);
  await message.fill("Ready for your next idea.");
  await pause(2500);
  cue("Your complete export is ready to paste into your own code.");
  await click(
    editor.getByRole("button", { name: "Copy console.log", exact: true }),
  );
  const generated = editor.getByLabel("Generated code", { exact: true });
  await generated.scrollIntoViewIfNeeded();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(await generated.inputValue());
  assert.equal(
    consoleEntries.length,
    1,
    "Copying and editing must stay silent",
  );
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
    await browser.close();
  }
}
