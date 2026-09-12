import { normalizeExportOptions } from "../validation/options.js";
import type {
  CompileOptions,
  CompiledConsole,
  ConsoleArgs,
  SceneInputV1,
} from "../model/types.js";
import { compileScene } from "./compiler.js";
import { renderSvg } from "../renderers/svg.js";
import { record, SceneValidationError } from "../validation/index.js";
import { ConsoleCompileError } from "./compiler.js";
export { ConsoleCompileError } from "./compiler.js";
export type {
  CompileOptions,
  CompiledConsole,
  CompiledPreview,
  ConsoleArgs,
} from "../model/types.js";

/** Complete CSS/SVG/text compiler; retains the existing defaults and output. */
export function compileConsole(
  input: SceneInputV1,
  options: CompileOptions = {},
): CompiledConsole {
  return compileScene(input, options, renderSvg);
}

export type CssCompileOptions = Omit<CompileOptions, "renderer">;
/** Explicit CSS compilation that lets bundlers omit SVG artwork; fallback remains opt-in. */
export function compileCssConsole(
  input: SceneInputV1,
  options: CssCompileOptions = {},
): CompiledConsole {
  let data: Record<string, unknown>;
  try {
    data = record(options, ["target", "motion", "unsupported"], []);
  } catch (error) {
    if (error instanceof SceneValidationError)
      throw new ConsoleCompileError(error.diagnostics);
    throw error;
  }
  return compileScene(input, { ...data, renderer: "css" });
}

export type BrowserOptions = Omit<CompileOptions, "motion"> & {
  readonly motion?: "system" | "reduce";
};
export function resolveMotion(): "allow" | "reduce" {
  try {
    return typeof globalThis.matchMedia === "function" &&
      globalThis.matchMedia("(prefers-reduced-motion: no-preference)")
        .matches === true
      ? "allow"
      : "reduce";
  } catch {
    return "reduce";
  }
}
export function emitConsole(
  input: SceneInputV1,
  options: BrowserOptions = {},
  sink: (...args: ConsoleArgs) => void = (...args) => console.log(...args),
): CompiledConsole {
  let configuration: ReturnType<typeof normalizeExportOptions>;
  try {
    configuration = normalizeExportOptions(options);
  } catch (error) {
    if (error instanceof SceneValidationError)
      throw new ConsoleCompileError(error.diagnostics);
    throw error;
  }
  const output = compileConsole(input, {
    ...configuration,
    motion: configuration.motion === "system" ? resolveMotion() : "reduce",
  });
  sink(...output.args);
  return output;
}
