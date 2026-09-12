import assert from "node:assert/strict";
import {
  defineScene,
  parseScene,
  getEffectDescriptors,
  getPresentationDescriptors,
} from "@servrox/console-fx";
import {
  compileConsole,
  compileCssConsole,
  emitConsole,
} from "@servrox/console-fx/browser";
import {
  neon,
  lightningMetal,
  iceCathedral,
  liquidChrome,
  moltenGold,
  createPresetExample,
} from "@servrox/console-fx/presets";
import { exportConsoleLog } from "@servrox/console-fx/codegen";

const scene = defineScene(neon({ text: "100% %c package consumer 👩🏽‍💻" }));
assert.deepEqual(parseScene(JSON.parse(JSON.stringify(scene))).value, scene);
const options = { target: "chromium", renderer: "css" };
const compiled = compileConsole(scene, options);
assert.deepEqual(compileCssConsole(scene, { target: "chromium" }), compiled);
const calls = [];
emitConsole(scene, options, (...args) => calls.push(args));
assert.deepEqual(calls, [[...compiled.args]]);
assert.equal(compiled.preview.lines[0].runs[0].text, scene.label);
assert.match(exportConsoleLog(scene, options).code, /^console\.log\(/);
assert(Object.isFrozen(getEffectDescriptors()[0].parameters));
for (const factory of [
  lightningMetal,
  iceCathedral,
  liquidChrome,
  moltenGold,
]) {
  const title = factory();
  const rich = compileConsole(title, { target: "chromium", renderer: "svg" });
  assert.equal(rich.animated, false);
  assert.equal(rich.preview.kind, "svg");
  assert.match(
    exportConsoleLog(title, { target: "chromium", renderer: "svg" }).code,
    /^console\.log\(/,
  );
  assert.deepEqual(parseScene(JSON.parse(JSON.stringify(title))).value, title);
}
for (const { id } of getPresentationDescriptors()) {
  const card = createPresetExample(id);
  const options = { target: "chromium", renderer: "svg" };
  const output = compileConsole(card, options);
  assert.deepEqual(parseScene(JSON.parse(JSON.stringify(card))).value, card);
  assert.equal(output.preview.kind, "svg");
  assert.equal(output.preview.alt, output.text);
  assert.equal(output.animated, false);
  const printed = [];
  emitConsole(card, options, (...args) => printed.push(args));
  assert.deepEqual(printed, [[...output.args]]);
  assert.match(exportConsoleLog(card, options).code, /^console\.log\(/);
}
await assert.rejects(import("@servrox/console-fx/dist/index.js"), {
  // Both runtimes reject private exports, using different error codes.
  code: process.versions.bun
    ? "ERR_MODULE_NOT_FOUND"
    : "ERR_PACKAGE_PATH_NOT_EXPORTED",
});
assert(
  !import.meta.resolve("@servrox/console-fx").includes("/packages/console-fx/"),
);
console.log("Packed JavaScript consumer passed");
