import { deepFreeze, LIMITS, utf8ByteLength } from "../model/limits.js";
import type {
  TextRun,
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

class PreflightMetricResolver extends MetricResolver {
  private readonly alternatives: {
    runs: Iterable<TextRun>;
    profile: string;
  }[] = [];
  override readonly suggest = (
    alternatives: Iterable<TextRun>,
    profile = "flow/v1",
  ): void => {
    this.alternatives.push({ runs: alternatives, profile });
  };
  /** Fill spare preflight capacity after required shaping work, retaining headroom
   * for different fragments on the measured pass. Speculation never exhausts it.
   */
  completePreflight(): void {
    for (const alternatives of this.alternatives)
      for (const run of alternatives.runs) {
        const request = this.request(run, alternatives.profile);
        if (this.requests.has(request.key)) continue;
        const bytes = utf8ByteLength(JSON.stringify(request)) + 256;
        if (
          this.requests.size >= 384 ||
          this.bytes + bytes > LIMITS.inputBytes * 0.75
        )
          return;
        this.requests.set(request.key, request);
        this.bytes += bytes;
      }
  }
}

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
    const resolver = new PreflightMetricResolver(
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
