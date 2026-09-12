import type {
  MeasurementSnapshot,
  TextMeasurementRequest,
} from "../model/layout.js";
import type { ValidationResult } from "../model/types.js";
import { LIMITS, utf8ByteLength } from "../model/limits.js";
import { FONT_STACKS } from "../renderers/css.js";
import { CARD_FONT_STACKS } from "../presentations/fonts.js";
import { array, fail, SceneValidationError } from "../validation/index.js";
import {
  measurementEnvironment,
  normalizeMeasurementRequest,
  normalizeMeasurements,
} from "../validation/layout.js";

/** Explicit local-font batch. Never called by compilation, preview rendering or emission. */
export function measureTextBatch(
  input: readonly TextMeasurementRequest[],
  environment: string,
): ValidationResult<MeasurementSnapshot> {
  try {
    const id = measurementEnvironment(environment);
    const requests = array(input, 512, ["requests"]).map(
      normalizeMeasurementRequest,
    );
    if (utf8ByteLength(JSON.stringify(requests)) > LIMITS.inputBytes)
      fail("resource-limit", "Measurement requests must fit within 64 KiB.", [
        "requests",
      ]);
    if (requests.some((r) => r.environment !== id))
      fail(
        "invalid-measurement",
        "Requests must name this exact font environment.",
        ["requests"],
      );
    const source =
      typeof document === "object"
        ? document
        : (globalThis as unknown as { fonts?: FontFaceSet });
    // Canvas uses its document/worker FontFaceSet. An empty set excludes downloadable
    // or page-supplied faces; otherwise decline before any text/font operation.
    if (!source.fonts || source.fonts.size !== 0)
      fail(
        "measurement-unavailable",
        "Local-only measurements require an available, empty web-font set.",
        ["measurements"],
      );
    const canvas =
      typeof OffscreenCanvas === "function"
        ? new OffscreenCanvas(1, 1)
        : typeof document === "object"
          ? document.createElement("canvas")
          : null;
    const context = canvas?.getContext("2d") as
      CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
    if (!context || !("letterSpacing" in context))
      fail(
        "measurement-unavailable",
        "This environment cannot measure the exact spacing contract.",
        ["measurements"],
      );
    context.textAlign = "left";
    context.textBaseline = "alphabetic";
    context.fontKerning = "auto";
    const records = requests.map((request) => {
      const stacks =
        request.profile !== "flow/v1" && request.profile.endsWith("/v1")
          ? CARD_FONT_STACKS
          : FONT_STACKS;
      context.font = `${request.italic ? "italic" : "normal"} ${request.style.fontWeight} ${request.style.fontSize}px ${stacks[request.style.fontFamily]}`;
      context.direction = request.direction;
      context.letterSpacing = `${request.style.letterSpacing}px`;
      const m = context.measureText(request.text);
      return {
        request,
        advance: m.width,
        inkLeft: m.actualBoundingBoxLeft,
        inkRight: m.actualBoundingBoxRight,
        ascent: m.actualBoundingBoxAscent,
        descent: m.actualBoundingBoxDescent,
      };
    });
    return {
      ok: true,
      value: normalizeMeasurements({
        kind: "consoleFxMeasurements",
        measurementVersion: 1,
        environment: id,
        records,
      }),
      diagnostics: [],
    };
  } catch (error) {
    if (error instanceof SceneValidationError)
      return { ok: false, diagnostics: error.diagnostics };
    return {
      ok: false,
      diagnostics: [
        {
          code: "measurement-unavailable",
          severity: "error",
          path: ["measurements"],
          message:
            "This environment could not provide local font measurements.",
        },
      ],
    };
  }
}
