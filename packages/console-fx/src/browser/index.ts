import { effectDescriptor } from "../effects/catalog.js";
import { deepFreeze, utf8ByteLength } from "../model/limits.js";
import type {
  CompileOptions,
  CompiledConsole,
  ConsoleArgs,
  Diagnostic,
  SceneInputV1,
  SceneV1,
} from "../model/types.js";
import { parseScene } from "../validation/index.js";
import { literalPercent, renderCss } from "../renderers/css.js";
import { renderSvg } from "../renderers/svg.js";

export type {
  CompileOptions,
  CompiledConsole,
  CompiledPreview,
  ConsoleArgs,
} from "../model/types.js";
export class ConsoleCompileError extends Error {
  readonly diagnostics: readonly Diagnostic[];
  constructor(diagnostics: readonly Diagnostic[]) {
    super(diagnostics[0]?.message ?? "The scene could not be compiled.");
    this.name = "ConsoleCompileError";
    this.diagnostics = deepFreeze([...diagnostics]);
  }
}
const problem = (
  code: string,
  message: string,
  path: readonly (string | number)[] = [],
): Diagnostic => ({ code, message, path, severity: "error" });
function options(input: CompileOptions): Required<CompileOptions> {
  if (input === null || typeof input !== "object" || Array.isArray(input))
    throw new ConsoleCompileError([
      problem("invalid-options", "Expected compilation options."),
    ]);
  const supported = {
    target: ["chromium", "firefox", "safari", "node", "bun", "unknown"],
    renderer: ["css", "svg", "text"],
    motion: ["allow", "reduce"],
    unsupported: ["error", "fallback"],
  };
  for (const [key, value] of Object.entries(input)) {
    if (
      !(key in supported) ||
      (value !== undefined &&
        !supported[key as keyof typeof supported].includes(value as never))
    ) {
      throw new ConsoleCompileError([
        problem("invalid-options", "Choose documented compilation options.", [
          key,
        ]),
      ]);
    }
  }
  return {
    target: input.target ?? "unknown",
    renderer: input.renderer ?? "text",
    motion: input.motion ?? "reduce",
    unsupported: input.unsupported ?? "error",
  };
}
function readableText(scene: SceneV1): string {
  return (
    scene.lines
      .map((line) => line.runs.map((run) => run.text).join(""))
      .join("\n") || scene.label
  );
}
function result(output: Omit<CompiledConsole, "byteLength">): CompiledConsole {
  return deepFreeze({
    ...output,
    byteLength: output.args.reduce(
      (bytes, argument) => bytes + utf8ByteLength(argument),
      0,
    ),
  });
}

export function compileConsole(
  input: SceneInputV1,
  inputOptions: CompileOptions = {},
): CompiledConsole {
  const parsed = parseScene(input);
  if (!parsed.ok) throw new ConsoleCompileError(parsed.diagnostics);
  const scene = parsed.value;
  const configuration = options(inputOptions);
  const text = readableText(scene);
  const diagnostics: Diagnostic[] = [];
  const plain = () =>
    result({
      args: [text],
      renderer: "text",
      text,
      animated: false,
      preview: { kind: "text", text },
      diagnostics,
    });
  if (configuration.renderer === "text") {
    diagnostics.push({
      code: "plain-text",
      severity: "info",
      path: [],
      message: "Readable text omits visual decoration and motion.",
    });
    return plain();
  }
  const unsupported: Diagnostic[] = [];
  if (configuration.target !== "chromium")
    unsupported.push(
      problem(
        "unsupported-renderer",
        "This target does not have a qualified rich-renderer profile.",
        ["target"],
      ),
    );
  for (const [lineIndex, line] of scene.lines.entries())
    for (const [runIndex, run] of line.runs.entries()) {
      if (
        run.effects.filter(
          (effect) => effectDescriptor(effect.kind)!.motion === "static",
        ).length > 1
      )
        unsupported.push(
          problem(
            "unsupported-combination",
            "Rich output supports one style effect and one decorative motion per text run. Remove an extra style effect or choose plain text.",
            ["lines", lineIndex, "runs", runIndex, "effects"],
          ),
        );
      for (const effect of run.effects) {
        const descriptor = effectDescriptor(effect.kind)!;
        if (
          descriptor.motion === "decorative" &&
          configuration.motion === "reduce"
        )
          continue;
        if (!descriptor.renderers.includes(configuration.renderer))
          unsupported.push(
            problem(
              "unsupported-effect",
              "This effect requires the SVG renderer.",
              ["lines", lineIndex, "runs", runIndex, "effects"],
            ),
          );
      }
    }
  if (unsupported.length) {
    if (configuration.unsupported === "error")
      throw new ConsoleCompileError(unsupported);
    diagnostics.push(
      ...unsupported.map((entry): Diagnostic => ({
        ...entry,
        severity: "warning",
      })),
      {
        code: "renderer-fallback",
        severity: "warning",
        path: [],
        message: `Requested ${configuration.renderer} output resolved to static text.`,
      },
    );
    return plain();
  }
  if (configuration.renderer === "css") {
    const output = renderCss(scene);
    diagnostics.push({
      code: "approximate-layout",
      severity: "info",
      path: [],
      message:
        "CSS text uses the console's layout; surface dimensions and alignment are approximate.",
    });
    return result({
      ...output,
      renderer: "css",
      text,
      animated: false,
      diagnostics,
    });
  }
  let output;
  try {
    output = renderSvg(scene, configuration.motion === "allow");
  } catch (error) {
    if (error instanceof RangeError)
      throw new ConsoleCompileError([
        problem(
          "resource-limit",
          "The scene exceeds the generated SVG element limit.",
        ),
      ]);
    throw error;
  }
  diagnostics.push(...output.diagnostics);
  if (output.animated)
    diagnostics.push({
      code: "experimental-animation",
      severity: "warning",
      path: ["motion"],
      message:
        "SVG motion requires qualification in your exact DevTools build. The full launch matrix is pending.",
    });
  const { width, height } = scene.surface;
  const args: ConsoleArgs = [
    "%c %c%s%c",
    `font-size:0;line-height:0;padding:${height / 2}px ${width / 2}px;background:url("${output.imageUri}") center/contain no-repeat`,
    "",
    literalPercent(text),
    "",
  ];
  return result({
    args,
    renderer: "svg",
    text,
    animated: output.animated,
    preview: {
      kind: "svg",
      imageUri: output.imageUri,
      width,
      height,
      alt: text,
    },
    diagnostics,
  });
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
  const output = compileConsole(input, {
    ...options,
    motion: options.motion === "system" ? resolveMotion() : "reduce",
  });
  sink(...output.args);
  return output;
}
