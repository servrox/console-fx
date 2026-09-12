import assert from "node:assert/strict";
import { createElement, StrictMode, act } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import {
  neon,
  lightningMetal,
  iceCathedral,
  liquidChrome,
  moltenGold,
} from "@servrox/console-fx/presets";
import { ConsoleBanner, ConsolePreview } from "@servrox/console-fx-react";

const calls = [];
const originalLog = console.log;
console.log = (...args) => calls.push(args);
const scene = neon({ text: "Packed React banner" });
const options = { target: "chromium", renderer: "css" };
const html = renderToStaticMarkup(
  createElement(ConsolePreview, { scene, options }),
);
renderToStaticMarkup(
  createElement(ConsoleBanner, { scene, options, enabled: true }),
);
assert.match(html, /Approximate browser preview/);
for (const factory of [
  lightningMetal,
  iceCathedral,
  liquidChrome,
  moltenGold,
]) {
  const cinematic = renderToStaticMarkup(
    createElement(ConsolePreview, {
      scene: factory(),
      options: { target: "chromium", renderer: "svg" },
    }),
  );
  assert.match(cinematic, /data:image\/svg\+xml/);
  renderToStaticMarkup(
    createElement(ConsoleBanner, {
      scene: factory(),
      options: { target: "chromium", renderer: "svg" },
      enabled: true,
    }),
  );
}
assert.equal(calls.length, 0);

const dom = new JSDOM('<!doctype html><div id="root"></div>', {
  url: "https://example.invalid",
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createRoot } = await import("react-dom/client");
const root = createRoot(document.getElementById("root"));
const banner = (enabled, text = scene.label) =>
  createElement(
    StrictMode,
    null,
    createElement(ConsoleBanner, { enabled, scene: neon({ text }), options }),
  );
await act(() => root.render(banner(false)));
assert.equal(calls.length, 0);
await act(() => root.render(banner(true, "First enabled current scene")));
assert.equal(calls.length, 1);
assert(calls[0].includes("First enabled current scene"));
await act(() => root.render(banner(false)));
await act(() => root.render(banner(true, "Later edit")));
assert.equal(calls.length, 1);
await act(() => root.unmount());
const remount = createRoot(document.getElementById("root"));
await act(() => remount.render(banner(true)));
assert.equal(calls.length, 2);
await act(() => remount.unmount());
dom.window.close();
console.log = originalLog;
console.log(
  "Packed React SSR, first-enabled, Strict Mode and remount consumer passed",
);
