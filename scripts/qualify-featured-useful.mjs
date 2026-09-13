// Observation harness only: owns a blank fixture and its actual native DevTools.
// Run sequentially for the dedicated Windows Chrome and Edge CDP instances.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createServer } from "node:http";
import { resolve, join, dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium, expect } from "@playwright/test";

const [port, name, destination] = process.argv.slice(2);
assert(/^\d+$/.test(port ?? "") && /^(chrome|edge)$/.test(name ?? ""));
assert(destination, "Supply a new evidence directory");
const directory = resolve(destination);
await mkdir(dirname(directory), { recursive: true });
await mkdir(directory);
const root = process.cwd();
const { EXAMPLES, exampleRecipe } = await import(
  pathToFileURL(join(root, "apps/studio/src/features/landing/examples.ts"))
);
const { compileConsole } = await import(
  pathToFileURL(join(root, "packages/console-fx/dist/browser/index.js"))
);
const { exportConsoleLog } = await import(
  pathToFileURL(join(root, "packages/console-fx/dist/codegen/index.js"))
);
const sha = (content) => createHash("sha256").update(content).digest("hex");
const fixtures = EXAMPLES.filter(
  (example) => example.category === "useful",
).map(({ id }) => {
  const recipe = exampleRecipe(id);
  const output = compileConsole(recipe.scene, recipe.options);
  const code = exportConsoleLog(recipe.scene, recipe.options).code;
  assert.equal(output.preview.kind, "svg");
  assert.equal(output.animated, false);
  return { id, recipe, output, code, codeSha256: sha(code) };
});
assert(fixtures.length > 0);
const fixtureBytes = JSON.stringify(fixtures, null, 2) + "\n";
await writeFile(join(directory, "fixtures.json"), fixtureBytes);
const windows = JSON.parse(
  execFileSync(
    "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe",
    [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      "Get-CimInstance Win32_OperatingSystem | Select-Object Caption,Version,BuildNumber | ConvertTo-Json -Compress",
    ],
    { encoding: "utf8", timeout: 15_000 },
  ),
);
const report = {
  observedAt: new Date().toISOString(),
  stage: "local",
  status: "in_progress",
  obligation: "WVS-17: exact featured Useful snippets in native DevTools",
  sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim(),
  windows,
  browser: null,
  fixturesSha256: sha(fixtureBytes),
  harnessSha256: sha(await readFile(new URL(import.meta.url))),
  examplesSha256: sha(
    await readFile("apps/studio/src/features/landing/examples.ts"),
  ),
  lockfileSha256: sha(await readFile("pnpm-lock.yaml")),
  cases: [],
  limits: [
    "Static featured samples only; existing profile lifecycle qualification remains separate",
    "Native appearance requires inspection of the captured Console surfaces",
    "No physical-device, Safari or participant evidence",
  ],
};
const save = () =>
  writeFile(
    join(directory, "observations.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
const server = createServer((_request, response) => {
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  response.end(
    "<!doctype html><title>ConsoleFX Useful qualification</title><h1>Owned native Console fixture</h1><p>No page image or script is loaded.</p>",
  );
});
await new Promise((done, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", done);
});
let browser, observer, context, native, nativeTarget, originalTheme;
let cdp;
const failures = [];
async function settingsTheme(value) {
  await native.getByRole("button", { name: /^Settings - F1/ }).click();
  const selector = native.getByRole("combobox", {
    name: "Theme:",
    exact: true,
  });
  const previous = await selector.inputValue();
  if (value) await selector.selectOption(value);
  await native
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  return previous;
}
try {
  browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
  cdp = await browser.newBrowserCDPSession();
  report.browser = await cdp.send("Browser.getVersion");
  context = await browser.newContext({
    viewport: { width: 1100, height: 800 },
  });
  const fixture = await context.newPage();
  await fixture.goto(`http://127.0.0.1:${server.address().port}/`);
  const fixtureSession = await context.newCDPSession(fixture);
  const { targetInfo } = await fixtureSession.send("Target.getTargetInfo");
  await fixtureSession.detach();
  await cdp.send("Target.openDevTools", {
    targetId: targetInfo.targetId,
    panelId: "console",
  });
  await expect
    .poll(async () => {
      const target = await cdp.send("Target.getDevToolsTarget", {
        targetId: targetInfo.targetId,
      });
      nativeTarget = target.targetId;
      return !!nativeTarget;
    })
    .toBe(true);
  await expect
    .poll(
      async () => {
        // Native DevTools targets may become attachable after initial discovery.
        await observer?.close();
        observer = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
        for (const page of observer
          .contexts()
          .flatMap((item) => item.pages())) {
          if (!page.url().includes("/devtools_app.html")) continue;
          const session = await page.context().newCDPSession(page);
          const target = await session.send("Target.getTargetInfo");
          await session.detach();
          if (target.targetInfo.targetId === nativeTarget) native = page;
        }
        return !!native;
      },
      { timeout: 20_000 },
    )
    .toBe(true);
  native.setDefaultTimeout(10_000);
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
  const { windowId } = await cdp.send("Browser.getWindowForTarget", {
    targetId: nativeTarget,
  });
  await cdp.send("Browser.setWindowBounds", {
    windowId,
    bounds: { windowState: "normal" },
  });
  await cdp.send("Browser.setWindowBounds", {
    windowId,
    bounds: { width: 1400, height: 950 },
  });
  await native.keyboard.press("Control+0");
  const drawer = native.getByRole("button", {
    name: "Close drawer",
    exact: true,
  });
  if (await drawer.count()) await drawer.click();
  originalTheme = await settingsTheme();
  const events = [];
  fixture.on("console", (event) => {
    if (event.type() === "log") events.push(event);
  });
  for (const theme of ["Dark", "Light"]) {
    await settingsTheme({ label: theme });
    for (const entry of fixtures) {
      await native.getByRole("button", { name: /Clear console/ }).click();
      const prompt = native.getByRole("textbox", {
        name: "Console prompt",
        exact: true,
      });
      const before = events.length;
      await prompt.fill(entry.code);
      await prompt.press("Enter");
      await expect.poll(() => events.length).toBe(before + 1);
      const actualArgs = await Promise.all(
        events
          .at(-1)
          .args()
          .map((arg) => arg.jsonValue()),
      );
      assert.deepEqual(actualArgs, entry.output.args);
      const message = native
        .locator(".console-message-text")
        .filter({ has: native.locator('span[style*="background"]') })
        .last();
      await expect(message).toContainText(entry.output.text);
      const carrier = message.locator('span[style*="background"]');
      const bounds = await carrier.boundingBox();
      assert(bounds && bounds.width >= 720 && bounds.height >= 240);
      const environment = await native.evaluate(() => ({
        viewport: [window.innerWidth, window.innerHeight],
        devicePixelRatio: window.devicePixelRatio,
        theme: document.documentElement.className,
        consoleWidth: document
          .querySelector(".console-view")
          ?.getBoundingClientRect().width,
      }));
      assert(
        bounds.x >= 0 &&
          bounds.y >= 0 &&
          bounds.x + bounds.width <= environment.viewport[0] &&
          bounds.y + bounds.height <= environment.viewport[1],
      );
      const prefix = `${entry.id}-${theme.toLowerCase()}`;
      await native.bringToFront();
      await carrier.screenshot({
        path: join(directory, `${prefix}-plate.png`),
      });
      await native.screenshot({
        path: join(directory, `${prefix}-console.png`),
      });
      report.cases.push({
        id: entry.id,
        theme,
        codeSha256: entry.codeSha256,
        consoleCalls: events.length - before,
        argumentsEqual: true,
        completeCaption: true,
        visibleText: await message.textContent(),
        imageBounds: bounds,
        environment,
        zoom: "Native Ctrl+0, 100%",
        plate: `${prefix}-plate.png`,
        plateSha256: sha(
          await readFile(join(directory, `${prefix}-plate.png`)),
        ),
        console: `${prefix}-console.png`,
        consoleSha256: sha(
          await readFile(join(directory, `${prefix}-console.png`)),
        ),
      });
      await save();
      console.log(
        `${name} ${entry.id} ${theme}: one call, exact arguments, complete caption, unclipped 720x240 image`,
      );
    }
  }
  report.status = "captured; appearance review pending";
  await save();
} catch (error) {
  failures.push(error);
} finally {
  // Keep order: the browser connection must remain available to close its
  // owned context. A failed step must not prevent later resources from closing.
  for (const close of [
    () =>
      native && originalTheme !== undefined
        ? settingsTheme(originalTheme)
        : undefined,
    () =>
      cdp && nativeTarget
        ? cdp.send("Target.closeTarget", { targetId: nativeTarget })
        : undefined,
    () => context?.close(),
    () => observer?.close(),
    () => browser?.close(),
    () =>
      new Promise((done, reject) =>
        server.close((error) => (error ? reject(error) : done())),
      ),
  ]) {
    try {
      await close();
    } catch (error) {
      failures.push(error);
    }
  }
}
if (failures.length) {
  report.status = "failed";
  report.errors = failures.map((error) => String(error));
  try {
    await save();
  } catch (error) {
    failures.push(error);
  }
  throw new AggregateError(failures, "Native qualification or cleanup failed");
}
