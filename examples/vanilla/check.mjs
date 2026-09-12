import assert from "node:assert/strict";
import {
  defineScene,
  parseScene,
  getEffectDescriptors,
} from "@servrox/console-fx";
import { compileConsole, emitConsole } from "@servrox/console-fx/browser";
import { neon } from "@servrox/console-fx/presets";
import { exportConsoleLog } from "@servrox/console-fx/codegen";

const scene = defineScene(neon({ text: "100% %c package consumer 👩🏽‍💻" }));
assert.deepEqual(parseScene(JSON.parse(JSON.stringify(scene))).value, scene);
const options = { target: "chromium", renderer: "css" };
const compiled = compileConsole(scene, options);
const calls = [];
emitConsole(scene, options, (...args) => calls.push(args));
assert.deepEqual(calls, [[...compiled.args]]);
assert.equal(compiled.preview.lines[0].runs[0].text, scene.label);
assert.match(exportConsoleLog(scene, options).code, /^console\.log\(/);
assert(Object.isFrozen(getEffectDescriptors()[0].parameters));
await assert.rejects(import("@servrox/console-fx/dist/index.js"), {
  code: "ERR_PACKAGE_PATH_NOT_EXPORTED",
});
assert(
  !import.meta.resolve("@servrox/console-fx").includes("/packages/console-fx/"),
);
console.log("Packed JavaScript consumer passed");
