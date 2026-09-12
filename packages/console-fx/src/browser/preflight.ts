import { deepFreeze } from "../model/limits.js";
import type {
  CompileOptions,
  SceneInputV1,
  ValidationResult,
} from "../model/types.js";
import type { TextMeasurementRequest } from "../model/layout.js";
import {
  defineScene,
  fail,
  SceneValidationError,
} from "../validation/index.js";
import { normalizeRenderOptions } from "../validation/render-options.js";
import { planSvgLayout } from "../layout/planner.js";
import { MetricResolver } from "../layout/metrics.js";
import { diagnoseRichScene } from "./compiler.js";

/** Pure preflight. Layout failure can still supply a bounded batch for explicit measurement. */
export function prepareTextMeasurements(
  input: SceneInputV1,
  options: CompileOptions,
): ValidationResult<readonly TextMeasurementRequest[]> {
  try {
    const scene = defineScene(input),
      config = normalizeRenderOptions(options);
    if (!config.layout || !config.measurementEnvironment)
      fail(
        "invalid-options",
        "Preflight requires a layout and explicit font-environment identifier.",
        ["layout"],
      );
    if (config.renderer !== "svg")
      fail(
        "unsupported-layout",
        "Font preflight requires explicit SVG output.",
        ["renderer"],
      );
    const { unsupported } = diagnoseRichScene(scene, config);
    if (unsupported.length) return { ok: false, diagnostics: unsupported };
    const resolver = new MetricResolver(
      config.measurementEnvironment,
      config.measurements,
    );
    try {
      planSvgLayout(scene, config.layout, config, resolver);
    } catch (error) {
      if (
        error instanceof SceneValidationError &&
        error.diagnostics.every((d) =>
          ["layout-overflow", "below-readable-size", "resource-limit"].includes(
            d.code,
          ),
        )
      ) {
        resolver.completePreflight();
        return {
          ok: true,
          value: deepFreeze([...resolver.requests.values()]),
          diagnostics: error.diagnostics,
        };
      }
      throw error;
    }
    resolver.completePreflight();
    return {
      ok: true,
      value: deepFreeze([...resolver.requests.values()]),
      diagnostics: [],
    };
  } catch (error) {
    if (error instanceof SceneValidationError)
      return { ok: false, diagnostics: error.diagnostics };
    throw error;
  }
}
