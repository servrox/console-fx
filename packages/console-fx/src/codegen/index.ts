import { normalizeRenderExportOptions as normalizeExportOptions } from "../validation/render-options.js";
import { SceneValidationError } from "../validation/index.js";
import { compileConsole, ConsoleCompileError } from "../browser/index.js";
import { motionGuardSource } from "../browser/motion.js";
import { deepFreeze, LIMITS, utf8ByteLength } from "../model/limits.js";
import type {
  ConsoleArgs,
  Diagnostic,
  ExportedConsole,
  ExportOptions,
  SceneInputV1,
} from "../model/types.js";

export type { ExportedConsole, ExportOptions } from "../model/types.js";
export function serializeString(value: string): string {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}
const argumentsSource = (args: ConsoleArgs): string =>
  args.map(serializeString).join(", ");

export function exportConsoleLog(
  scene: SceneInputV1,
  options: ExportOptions = {},
): ExportedConsole {
  try {
    options = normalizeExportOptions(options);
  } catch (error) {
    if (error instanceof SceneValidationError)
      throw new ConsoleCompileError(error.diagnostics);
    throw error;
  }
  const staticOutput = compileConsole(scene, { ...options, motion: "reduce" });
  let code = `console.log(${argumentsSource(staticOutput.args)});`;
  const diagnostics: Diagnostic[] = [...staticOutput.diagnostics];
  if (options.motion === "system") {
    const animatedOutput = compileConsole(scene, {
      ...options,
      motion: "allow",
    });
    if (animatedOutput.animated) {
      code = `console.log(...(${motionGuardSource()} ? [${argumentsSource(animatedOutput.args)}] : [${argumentsSource(staticOutput.args)}]));`;
      for (const entry of animatedOutput.diagnostics)
        if (
          !diagnostics.some(
            (existing) =>
              existing.code === entry.code &&
              JSON.stringify(existing.path) === JSON.stringify(entry.path),
          )
        )
          diagnostics.push(entry);
    }
  }
  const byteLength = utf8ByteLength(code);
  if (byteLength > LIMITS.snippetBytes)
    throw new ConsoleCompileError([
      {
        code: "resource-limit",
        severity: "error",
        path: [],
        message: "The complete snippet exceeds 128 KiB. Simplify the scene.",
      },
    ]);
  if (byteLength > LIMITS.snippetWarningBytes)
    diagnostics.push({
      code: "large-snippet",
      severity: "warning",
      path: [],
      message: "This complete snippet exceeds 32 KiB.",
    });
  return deepFreeze({ code, byteLength, diagnostics });
}
