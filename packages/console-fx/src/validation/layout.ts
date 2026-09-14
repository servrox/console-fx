import { deepFreeze, LIMITS, utf8ByteLength } from "../model/limits.js";
import type {
  LayoutRequest,
  OutputSizing,
  MeasurementSnapshot,
  TextMeasurementRequest,
  TextMeasurement,
} from "../model/layout.js";
import { array, defineScene, fail, record, text } from "./index.js";

export function fitNumber(
  value: unknown,
  min: number,
  max: number,
  path: readonly (string | number)[],
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < min ||
    value > max
  )
    fail(
      "invalid-number",
      "Expected a finite fitting value within limits.",
      path,
    );
  return value;
}
function choice<T extends string>(
  input: unknown,
  choices: readonly T[],
  path: readonly (string | number)[],
): T {
  if (typeof input !== "string" || !choices.includes(input as T))
    fail("invalid-options", "Choose a documented fitting option.", path);
  return input as T;
}
export function normalizeLayout(input: unknown): LayoutRequest {
  const d = record(
    input,
    ["algorithm", "width", "maxHeight", "variant", "overflow", "minFontSize"],
    ["layout"],
  );
  return deepFreeze({
    algorithm: choice(
      d.algorithm,
      ["fit/v1", "fit/v2"],
      ["layout", "algorithm"],
    ),
    width: fitNumber(d.width, 1, LIMITS.svgWidth, ["layout", "width"]),
    maxHeight: fitNumber(d.maxHeight, 1, LIMITS.svgHeight, [
      "layout",
      "maxHeight",
    ]),
    variant: choice(
      d.variant,
      ["standard", "compact", "auto"],
      ["layout", "variant"],
    ),
    overflow: choice(
      d.overflow,
      ["error", "wrap", "shrink", "wrap-then-shrink"],
      ["layout", "overflow"],
    ),
    minFontSize: fitNumber(d.minFontSize, 8, 160, ["layout", "minFontSize"]),
  });
}
export function normalizeSizing(input: unknown): OutputSizing {
  const d = record(
    input,
    ["mode", "width", "maxWidth", "fillFraction"],
    ["sizing"],
  );
  if (d.mode === "fixed") {
    record(input, ["mode", "width"], ["sizing"]);
    return deepFreeze({
      mode: "fixed",
      width: fitNumber(d.width, 1, LIMITS.svgWidth, ["sizing", "width"]),
    });
  }
  record(input, ["mode", "maxWidth", "fillFraction"], ["sizing"]);
  return deepFreeze({
    mode: choice(d.mode, ["container-experimental"], ["sizing", "mode"]),
    maxWidth: fitNumber(d.maxWidth, 1, LIMITS.svgWidth, ["sizing", "maxWidth"]),
    fillFraction: fitNumber(d.fillFraction ?? 0.96, 0.5, 0.98, [
      "sizing",
      "fillFraction",
    ]),
  });
}
export function measurementEnvironment(input: unknown): string {
  const value = text(input, ["measurementEnvironment"]);
  if (!value || value.length > 160 || /[\n\t]/u.test(value))
    fail(
      "invalid-measurement",
      "Use a short explicit font-environment identifier.",
      ["measurementEnvironment"],
    );
  return value;
}
/** Collision-free identity, bounded by the snapshot/request budgets. No content hash guesses. */
export function measurementKey(r: Omit<TextMeasurementRequest, "key">): string {
  return JSON.stringify([
    r.algorithm,
    r.profile,
    r.text,
    r.style.color,
    r.style.fontFamily,
    r.style.fontSize,
    r.style.fontWeight,
    r.style.letterSpacing,
    r.italic,
    r.direction,
    r.environment,
  ]);
}
export function normalizeMeasurementRequest(
  input: unknown,
): TextMeasurementRequest {
  const d = record(
    input,
    [
      "key",
      "algorithm",
      "profile",
      "text",
      "style",
      "italic",
      "direction",
      "environment",
    ],
    ["measurement"],
  );
  const profile = text(d.profile, ["measurement", "profile"]);
  if (
    !/^(flow\/v1|(?:buildReceipt|requestTrace|serviceReady|commandCard|releaseBulletin|blueprint|contourMap|letterpress|signalHalftone|orbital)\/(?:compact\/)?v1|(?:lightning-metal|ice-cathedral|liquid-chrome|molten-gold)-v1)$/u.test(
      profile,
    )
  )
    fail("invalid-measurement", "Unknown measurement profile.", [
      "measurement",
      "profile",
    ]);
  // Reuse the strict scene style/text validator, including accessor/control checks.
  const suppliedStyle = record(
    d.style,
    ["color", "fontSize", "fontWeight", "fontFamily", "letterSpacing"],
    ["measurement", "style"],
  );
  // Derived artboard type may be below 8px when explicit output upscaling keeps
  // the requested display floor. This never changes the source scene's limits.
  const fontSize = fitNumber(suppliedStyle.fontSize, 0.0001, 96, [
    "measurement",
    "style",
    "fontSize",
  ]);
  const run = defineScene({
    schemaVersion: 1,
    label: "",
    lines: [
      {
        runs: [
          {
            text: d.text as string,
            style: { ...suppliedStyle, fontSize: Math.max(8, fontSize) },
          },
        ],
      },
    ],
  }).lines[0]!.runs[0]!;
  if (/[\n\t\u2028\u2029]/u.test(run.text))
    fail("invalid-measurement", "Measure one complete visual fragment.", [
      "measurement",
      "text",
    ]);
  if (typeof d.italic !== "boolean")
    fail("invalid-measurement", "Specify the font style.", [
      "measurement",
      "italic",
    ]);
  const r = {
    algorithm: choice(
      d.algorithm,
      ["fit/v1", "fit/v2"],
      ["measurement", "algorithm"],
    ),
    profile,
    text: run.text,
    style: { ...run.style, fontSize },
    italic: d.italic,
    direction: choice(
      d.direction,
      ["ltr", "rtl"],
      ["measurement", "direction"],
    ),
    environment: measurementEnvironment(d.environment),
  };
  const key = measurementKey(r);
  if (d.key !== key)
    fail(
      "invalid-measurement",
      "Measurement key does not match its exact text, style and environment.",
      ["measurement", "key"],
    );
  return deepFreeze({ key, ...r });
}
export function normalizeMeasurements(input: unknown): MeasurementSnapshot {
  const d = record(
    input,
    ["kind", "measurementVersion", "environment", "records"],
    ["measurements"],
  );
  if (d.kind !== "consoleFxMeasurements" || d.measurementVersion !== 1)
    fail("invalid-measurement", "Unsupported measurement snapshot.", [
      "measurements",
    ]);
  const environment = measurementEnvironment(d.environment);
  let bytes = utf8ByteLength(environment) + 100;
  const seen = new Set<string>();
  const records = array(d.records, 512, ["measurements", "records"]).map(
    (input): TextMeasurement => {
      const r = record(
        input,
        ["request", "advance", "inkLeft", "inkRight", "ascent", "descent"],
        ["measurements", "records"],
      );
      const request = normalizeMeasurementRequest(r.request);
      if (request.environment !== environment || seen.has(request.key))
        fail(
          "invalid-measurement",
          "Duplicate or mismatched measurement environment.",
          ["measurements"],
        );
      seen.add(request.key);
      const metrics = {
        request,
        advance: fitNumber(r.advance, 0, 1e6, ["measurements", "advance"]),
        inkLeft: fitNumber(r.inkLeft, -1e6, 1e6, ["measurements", "inkLeft"]),
        inkRight: fitNumber(r.inkRight, -1e6, 1e6, [
          "measurements",
          "inkRight",
        ]),
        ascent: fitNumber(r.ascent, -1e6, 1e6, ["measurements", "ascent"]),
        descent: fitNumber(r.descent, -1e6, 1e6, ["measurements", "descent"]),
      };
      if (
        metrics.inkRight + metrics.inkLeft < 0 ||
        metrics.ascent + metrics.descent < 0
      )
        fail("invalid-measurement", "Inverted text ink bounds.", [
          "measurements",
        ]);
      bytes += utf8ByteLength(JSON.stringify(metrics));
      if (bytes > LIMITS.inputBytes)
        fail(
          "resource-limit",
          "Measurement snapshots must fit within 64 KiB.",
          ["measurements"],
        );
      return metrics;
    },
  );
  const value = {
    kind: "consoleFxMeasurements" as const,
    measurementVersion: 1 as const,
    environment,
    records,
  };
  if (utf8ByteLength(JSON.stringify(value)) > LIMITS.inputBytes)
    fail("resource-limit", "Measurement snapshots must fit within 64 KiB.", [
      "measurements",
    ]);
  return deepFreeze(value);
}
