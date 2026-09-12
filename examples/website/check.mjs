import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import ts from "typescript";
import { createElement, StrictMode, act } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import * as recipes from "./recipes.ts";

const calls = [];
const originalLog = console.log;
const environment = process.env.NODE_ENV;
console.log = (...args) => calls.push(args);
const loaded = {};
try {
  process.env.NODE_ENV = "production";
  for (const [name, code] of Object.entries(recipes)) {
    const source = resolve("checks/website", `${name}.tsx`);
    writeFileSync(source, code);
    const javascript = ts.transpileModule(readFileSync(source, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    const path = source.replace(/\.tsx$/, ".mjs");
    writeFileSync(path, javascript);
    const before = calls.length;
    loaded[name] = await import(pathToFileURL(path));
    assert.equal(
      calls.length - before,
      name === "packageExample" ? 1 : 0,
      `${name} startup`,
    );
  }
  process.env.NODE_ENV = "development";
  const startupBefore = calls.length;
  await import(
    pathToFileURL(resolve("checks/website/startupExample.mjs")) + "?development"
  );
  assert.equal(
    calls.length,
    startupBefore + 1,
    "Development startup is explicit and static",
  );
  if (environment === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = environment;
  const before = calls.length;
  loaded.sdkExample.welcomeToSdk(false);
  loaded.contextExample.showBuild(false, {});
  loaded.summaryExample.showSummary(false, []);
  assert.equal(calls.length, before, "Caller guards are silent");
  loaded.sdkExample.welcomeToSdk(true);
  loaded.contextExample.showBuild(true, {
    project: "atlas-web",
    environment: "preview",
    revision: "a1b2c3d",
  });
  loaded.summaryExample.showSummary(true, [
    "Build complete",
    "48 checks passed",
    "Ready for review",
  ]);
  assert.equal(calls.length, before + 3, "Each explicit task emits once");
  assert.match(
    calls.at(-1).join(" "),
    /Build complete.*48 checks passed.*Ready for review/s,
  );
  renderToStaticMarkup(createElement(loaded.reactExample.PrintMessage));
  renderToStaticMarkup(
    createElement(loaded.nextExample.default, { enabled: true }),
  );
  assert.equal(
    calls.length,
    before + 3,
    "Both framework examples are silent during SSR",
  );

  const dom = new JSDOM("<main id='root'></main>", {
    url: "https://console-fx.invalid/",
  });
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(document.getElementById("root"));
  await act(async () =>
    root.render(
      createElement(
        StrictMode,
        null,
        createElement(loaded.reactExample.PrintMessage),
      ),
    ),
  );
  assert.equal(calls.length, before + 3);
  await act(async () => document.querySelector("button").click());
  assert.equal(calls.length, before + 4);
  await act(async () =>
    root.render(
      createElement(
        StrictMode,
        null,
        createElement(loaded.nextExample.default),
      ),
    ),
  );
  assert.equal(calls.length, before + 4);
  await act(async () =>
    root.render(
      createElement(
        StrictMode,
        null,
        createElement(loaded.nextExample.default, { enabled: true }),
      ),
    ),
  );
  assert.equal(calls.length, before + 5);
  await act(async () =>
    root.render(
      createElement(
        StrictMode,
        null,
        createElement(loaded.nextExample.default, { enabled: false }),
      ),
    ),
  );
  await act(async () =>
    root.render(
      createElement(
        StrictMode,
        null,
        createElement(loaded.nextExample.default, { enabled: true }),
      ),
    ),
  );
  assert.equal(calls.length, before + 5, "Banner retains first-enabled policy");
  await act(async () => root.unmount());
  dom.window.close();
} finally {
  console.log = originalLog;
  if (environment === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = environment;
}
console.log(
  "Displayed website recipes passed against the packed packages; caller guards, SSR, click and first-enabled checks passed",
);
