import {
  defineScene,
  getEffectDescriptors,
  parseScene,
  type SceneV1,
} from "@servrox/console-fx";
import {
  compileConsole,
  type CompileOptions,
} from "@servrox/console-fx/browser";
import { exportConsoleLog } from "@servrox/console-fx/codegen";
import { neon } from "@servrox/console-fx/presets";

const scene: SceneV1 = defineScene(neon());
const options: CompileOptions = { renderer: "css", target: "chromium" };
const output = compileConsole(scene, options);
if (output.preview.kind === "svg") output.preview.imageUri satisfies string;
const result = parseScene({});
if (!result.ok) {
  // @ts-expect-error Failed validation never exposes partial scene data.
  result.value;
}
// @ts-expect-error Descriptor metadata is publicly read-only.
getEffectDescriptors()[0]!.displayName = "changed";
// @ts-expect-error Pure compilation cannot resolve browser preference.
const invalid: CompileOptions = { motion: "system" };
void invalid;
exportConsoleLog(scene, {
  renderer: "svg",
  target: "chromium",
  motion: "system",
});
