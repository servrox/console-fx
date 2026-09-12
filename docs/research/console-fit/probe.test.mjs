// Documentation-probe tests, not a browser or package qualification suite.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = readFileSync(
  new URL("./responsive-console-probe.js", import.meta.url), "utf8",
);

function capture() {
  const calls = [];
  const sandbox = {
    console: Object.freeze({ log: (...args) => calls.push(args) }),
  };
  for (const name of [
    "window", "document", "innerWidth", "outerWidth", "devicePixelRatio",
    "fetch", "XMLHttpRequest", "WebSocket", "ResizeObserver",
    "OffscreenCanvas", "requestAnimationFrame", "setInterval", "setTimeout",
  ]) {
    Object.defineProperty(sandbox, name, {
      get() { throw new Error(`Unexpected probe access: ${name}`); },
    });
  }
  vm.runInNewContext(source, sandbox, {
    timeout: 1000,
    contextCodeGeneration: { strings: false, wasm: false },
  });
  return calls;
}

test("one deterministic string-only log, with no page/measurement/timer access", () => {
  const first = capture();
  assert.equal(first.length, 1);
  assert.equal(first[0].length, 4);
  assert.ok(first[0].every(value => typeof value === "string"));
  assert.deepEqual(first, capture());
  assert.equal((source.match(/console\.log\s*\(/g) ?? []).length, 1);
  assert.equal(first[0][0], "%c %c\n%s");
  assert.equal(first[0][2], "");
  assert.equal(first[0][3],
    "console-fx\nResize the console pane.\nONE ENTRY / RELATIVE PADDING\nExperimental responsive SVG; native caption.");
});

test("bounded static SVG carrier and readable caption", () => {
  const [, style] = capture()[0];
  assert.match(style, /font-size:0;line-height:0;/);
  assert.match(style, /padding:min\(120px,16%\) min\(360px,48%\);/);
  const match = style.match(/background:url\("(data:image\/svg\+xml,[^"]+)"\)/);
  assert.ok(match);
  const svg = decodeURIComponent(match[1].slice("data:image/svg+xml,".length));
  assert.match(svg, /viewBox="0 0 720 240"/);
  assert.match(svg, />console-fx<\/text>/);
  assert.doesNotMatch(svg, /<(?:script|foreignObject|image|animate)\b/i);
  assert.doesNotMatch(svg, /\s(?:on[a-z]+|(?:xlink:)?href)\s*=/i);
  assert.doesNotMatch(svg, /url\(/i);
  assert.ok(Buffer.byteLength(source, "utf8") < 32 * 1024);
});

test("padding model preserves 3:1 ratio and 720px cap; not a rendering test", () => {
  for (const width of [280, 360, 400, 480, 720, 960, 1000]) {
    const modeledWidth = 2 * Math.min(360, width * 0.48);
    const modeledHeight = 2 * Math.min(120, width * 0.16);
    assert.ok(modeledWidth <= width);
    assert.ok(modeledWidth <= 720);
    assert.ok(modeledHeight <= 240);
    assert.ok(Math.abs(modeledWidth / modeledHeight - 3) < 1e-9);
  }
});
