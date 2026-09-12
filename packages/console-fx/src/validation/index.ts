import { effectDescriptor, EFFECT_ORDER } from "../effects/catalog.js";
import { deepFreeze, LIMITS } from "../model/limits.js";
import type {
  Diagnostic,
  Effect,
  SceneInputV1,
  SceneV1,
  ValidationResult,
} from "../model/types.js";

type Path = readonly (string | number)[];
export class SceneValidationError extends Error {
  readonly diagnostics: readonly Diagnostic[];
  constructor(diagnostics: readonly Diagnostic[]) {
    super(diagnostics[0]?.message ?? "Invalid scene.");
    this.name = "SceneValidationError";
    this.diagnostics = deepFreeze([...diagnostics]);
  }
}

function fail(code: string, message: string, path: Path): never {
  throw new SceneValidationError([{ code, severity: "error", message, path }]);
}
function record(
  input: unknown,
  keys: readonly string[],
  path: Path,
): Record<string, unknown> {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    fail("invalid-object", "Expected a plain data object.", path);
  }
  const prototype = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null)
    fail("invalid-object", "Only plain data objects are supported.", path);
  const descriptors = Object.getOwnPropertyDescriptors(input);
  const result: Record<string, unknown> = Object.create(null) as Record<
    string,
    unknown
  >;
  for (const key of Reflect.ownKeys(descriptors)) {
    if (
      typeof key !== "string" ||
      !keys.includes(key) ||
      ["__proto__", "prototype", "constructor"].includes(key)
    ) {
      fail(
        "unknown-property",
        "The document contains an unsupported property.",
        path,
      );
    }
    const descriptor = descriptors[key]!;
    if (!("value" in descriptor) || !descriptor.enumerable)
      fail(
        "invalid-property",
        "Accessors and hidden properties are not scene data.",
        [...path, key],
      );
    result[key] = descriptor.value;
  }
  return result;
}
function array(input: unknown, max: number, path: Path): readonly unknown[] {
  if (!Array.isArray(input)) fail("invalid-array", "Expected an array.", path);
  if (Object.getPrototypeOf(input) !== Array.prototype)
    fail("invalid-array", "Only plain arrays are supported.", path);
  if (input.length > max)
    fail("resource-limit", "The document exceeds a structure limit.", path);
  for (const key of Reflect.ownKeys(input)) {
    if (
      key !== "length" &&
      (typeof key !== "string" ||
        !/^(0|[1-9]\d*)$/.test(key) ||
        Number(key) >= input.length)
    )
      fail("unknown-property", "Arrays cannot contain extra properties.", path);
  }
  // Validate data descriptors before accessing items; never invoke an imported getter.
  for (let index = 0; index < input.length; index++) {
    const descriptor = Object.getOwnPropertyDescriptor(input, index);
    if (!descriptor || !("value" in descriptor))
      fail(
        "invalid-array",
        "Sparse arrays and accessors are not supported.",
        path,
      );
  }
  return input;
}
function numeric(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
  path: Path,
): number {
  if (value === undefined) return fallback;
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < min ||
    value > max
  ) {
    fail(
      "invalid-number",
      "Expected a finite number within the documented limits.",
      path,
    );
  }
  return value;
}
function choice<T extends string>(
  value: unknown,
  fallback: T,
  values: readonly T[],
  path: Path,
): T {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || !values.includes(value as T))
    fail("invalid-enum", "Choose one of the documented options.", path);
  return value as T;
}
function color(value: unknown, fallback: string, path: Path): string {
  if (value === undefined) return fallback;
  if (
    typeof value !== "string" ||
    !/^#(?:[\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i.test(value)
  )
    fail("invalid-color", "Use a hexadecimal color.", path);
  const normalized = value.toLowerCase();
  return normalized.length === 4
    ? `#${[...normalized.slice(1)].map((part) => part + part).join("")}`
    : normalized;
}
function text(value: unknown, path: Path): string {
  if (typeof value !== "string") fail("invalid-text", "Expected text.", path);
  if (value.length > LIMITS.textCodePoints * 2)
    fail("resource-limit", "The document text is too long.", path);
  // eslint-disable-next-line no-control-regex -- This boundary deliberately rejects forbidden control characters.
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/u.test(value))
    fail(
      "invalid-control-character",
      "Control and ANSI escape characters are not supported.",
      path,
    );
  if (
    /[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/u.test(
      value,
    )
  )
    fail(
      "invalid-unicode",
      "Text contains an unpaired Unicode surrogate.",
      path,
    );
  return value.replace(/\r\n?/g, "\n");
}
function normalize(input: unknown): SceneV1 {
  const root = record(
    input,
    ["schemaVersion", "label", "surface", "lines", "motion"],
    [],
  );
  if (root.schemaVersion !== 1)
    fail("unsupported-schema-version", "This scene version is not supported.", [
      "schemaVersion",
    ]);
  const label = text(root.label, ["label"]);
  let textCount = [...label].length;
  let runCount = 0;
  const surface = record(
    root.surface ?? {},
    ["width", "height", "background", "padding", "borderRadius"],
    ["surface"],
  );
  const normalizedSurface = {
    width: numeric(surface.width, 600, 80, LIMITS.svgWidth, [
      "surface",
      "width",
    ]),
    height: numeric(surface.height, 180, 40, LIMITS.svgHeight, [
      "surface",
      "height",
    ]),
    background: color(surface.background, "#0c1117", ["surface", "background"]),
    padding: numeric(surface.padding, 20, 0, 64, ["surface", "padding"]),
    borderRadius: numeric(surface.borderRadius, 16, 0, 64, [
      "surface",
      "borderRadius",
    ]),
  };
  if (
    normalizedSurface.padding * 2 >=
    Math.min(normalizedSurface.width, normalizedSurface.height)
  )
    fail("invalid-surface", "Padding must leave room for the message.", [
      "surface",
      "padding",
    ]);
  const motion = record(
    root.motion ?? {},
    ["durationMs", "finish"],
    ["motion"],
  );
  const lines = array(root.lines, LIMITS.lines, ["lines"]).map(
    (value, lineIndex) => {
      const path: Path = ["lines", lineIndex];
      const line = record(value, ["align", "runs"], path);
      const runs = array(line.runs, LIMITS.runs, [...path, "runs"]).map(
        (value, runIndex) => {
          const runPath: Path = [...path, "runs", runIndex];
          if (++runCount > LIMITS.runs)
            fail(
              "resource-limit",
              "A scene supports at most 32 runs.",
              runPath,
            );
          const run = record(value, ["text", "style", "effects"], runPath);
          const runText = text(run.text, [...runPath, "text"]);
          textCount += [...runText].length;
          if (textCount > LIMITS.textCodePoints)
            fail(
              "resource-limit",
              "A scene supports at most 2,000 text code points, including its label.",
              runPath,
            );
          const style = record(
            run.style ?? {},
            ["color", "fontSize", "fontWeight", "fontFamily", "letterSpacing"],
            [...runPath, "style"],
          );
          const families = new Set<string>();
          const effects = array(run.effects ?? [], LIMITS.effectsPerRun, [
            ...runPath,
            "effects",
          ])
            .map((value, effectIndex) => {
              const effectPath = [...runPath, "effects", effectIndex];
              // Inspect kind as a data property before choosing the catalog-owned schema.
              if (value === null || typeof value !== "object")
                fail(
                  "invalid-effect",
                  "Expected an effect object.",
                  effectPath,
                );
              const kindProperty = Object.getOwnPropertyDescriptor(
                value,
                "kind",
              );
              if (
                !kindProperty ||
                !("value" in kindProperty) ||
                typeof kindProperty.value !== "string"
              )
                fail("invalid-effect", "Choose a built-in effect.", effectPath);
              const descriptor = effectDescriptor(kindProperty.value);
              if (!descriptor)
                fail("invalid-effect", "Choose a built-in effect.", effectPath);
              if (families.has(descriptor.family))
                fail(
                  "effect-conflict",
                  "Effects in the same family cannot be combined.",
                  effectPath,
                );
              families.add(descriptor.family);
              const effect = record(
                value,
                ["kind", ...Object.keys(descriptor.parameters)],
                effectPath,
              );
              const normalized: Record<string, unknown> = {
                kind: descriptor.kind,
              };
              for (const [key, parameter] of Object.entries(
                descriptor.parameters,
              )) {
                const parameterPath = [...effectPath, key];
                switch (parameter.type) {
                  case "number":
                    normalized[key] = numeric(
                      effect[key],
                      parameter.default,
                      parameter.min,
                      parameter.max,
                      parameterPath,
                    );
                    break;
                  case "color":
                    normalized[key] = color(
                      effect[key],
                      parameter.default,
                      parameterPath,
                    );
                    break;
                  case "enum":
                    normalized[key] = choice(
                      effect[key],
                      parameter.default,
                      parameter.values,
                      parameterPath,
                    );
                    break;
                  case "boolean":
                    if (
                      effect[key] !== undefined &&
                      typeof effect[key] !== "boolean"
                    )
                      fail(
                        "invalid-boolean",
                        "Expected a boolean.",
                        parameterPath,
                      );
                    normalized[key] = effect[key] ?? parameter.default;
                }
              }
              return normalized as unknown as Effect;
            })
            .sort(
              (a, b) =>
                EFFECT_ORDER.indexOf(a.kind) - EFFECT_ORDER.indexOf(b.kind),
            );
          return {
            text: runText,
            style: {
              color: color(style.color, "#e8f3f5", [
                ...runPath,
                "style",
                "color",
              ]),
              fontSize: numeric(style.fontSize, 36, 8, 96, [
                ...runPath,
                "style",
                "fontSize",
              ]),
              fontWeight: numeric(style.fontWeight, 700, 100, 900, [
                ...runPath,
                "style",
                "fontWeight",
              ]),
              fontFamily: choice(
                style.fontFamily,
                "mono",
                ["sans", "mono", "serif"],
                [...runPath, "style", "fontFamily"],
              ),
              letterSpacing: numeric(style.letterSpacing, 0, -2, 10, [
                ...runPath,
                "style",
                "letterSpacing",
              ]),
            },
            effects,
          };
        },
      );
      return {
        align: choice(
          line.align,
          "left",
          ["left", "center", "right"],
          [...path, "align"],
        ),
        runs,
      };
    },
  );
  if (textCount > LIMITS.textCodePoints)
    fail("resource-limit", "The document text is too long.", ["label"]);
  const visualLineCount =
    lines.length +
    lines.reduce(
      (count, line) =>
        count +
        line.runs.reduce(
          (count, run) => count + run.text.split("\n").length - 1,
          0,
        ),
      0,
    );
  if (visualLineCount > LIMITS.lines)
    fail(
      "resource-limit",
      "A scene supports at most eight visual lines, including newlines inside text runs.",
      ["lines"],
    );
  return deepFreeze({
    schemaVersion: 1,
    label,
    surface: normalizedSurface,
    lines,
    motion: {
      durationMs: numeric(motion.durationMs, 4800, 1000, LIMITS.motionMs, [
        "motion",
        "durationMs",
      ]),
      finish: choice(motion.finish, "freeze", ["freeze"], ["motion", "finish"]),
    },
  });
}

export function parseScene(input: unknown): ValidationResult<SceneV1> {
  try {
    return { ok: true, value: normalize(input), diagnostics: [] };
  } catch (error) {
    if (error instanceof SceneValidationError)
      return { ok: false, diagnostics: error.diagnostics };
    throw error;
  }
}

export function defineScene(input: SceneInputV1): SceneV1 {
  const result = parseScene(input);
  if (!result.ok) throw new SceneValidationError(result.diagnostics);
  return result.value;
}
