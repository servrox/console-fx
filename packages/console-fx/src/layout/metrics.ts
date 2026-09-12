import type {
  MeasurementSnapshot,
  MeasurementQuality,
  TextMeasurement,
  TextMeasurementRequest,
} from "../model/layout.js";
import type { TextRun } from "../model/types.js";
import { LIMITS, utf8ByteLength } from "../model/limits.js";
import { measurementKey } from "../validation/layout.js";
import { fail } from "../validation/index.js";
import { estimatedTextWidth } from "../renderers/presentations/layout.js";

export type FontMetric = Omit<TextMeasurement, "request"> & {
  readonly quality: MeasurementQuality;
  readonly direction?: "ltr" | "rtl";
};
export function textDirection(text: string): "ltr" | "rtl" {
  for (const c of text)
    if (/\p{Letter}/u.test(c))
      return /[\p{Script=Arabic}\p{Script=Hebrew}]/u.test(c) ? "rtl" : "ltr";
  return "ltr";
}
/** Per-attempt bounded data cache. Never retained between compilations. */
export class MetricResolver {
  readonly requests = new Map<string, TextMeasurementRequest>();
  readonly available: ReadonlyMap<string, TextMeasurement>;
  private bytes = 0;
  constructor(
    readonly environment: string,
    readonly snapshot?: MeasurementSnapshot,
  ) {
    this.available = new Map(
      snapshot?.environment === environment
        ? snapshot.records.map((r) => [r.request.key, r])
        : [],
    );
    for (const { request } of this.available.values()) {
      this.requests.set(request.key, request);
      this.bytes += utf8ByteLength(JSON.stringify(request));
    }
  }
  resolve(run: TextRun, profile: string, italic = false): FontMetric {
    if (!run.text)
      return {
        advance: 0,
        inkLeft: 0,
        inkRight: 0,
        ascent: 0,
        descent: 0,
        quality: "authored-geometry",
      };
    const request = {
      algorithm: "fit/v1" as const,
      profile,
      text: run.text,
      style: run.style,
      italic,
      direction: textDirection(run.text),
      environment: this.environment,
    };
    const key = measurementKey(request);
    if (!this.requests.has(key)) {
      const value = { key, ...request };
      this.bytes += utf8ByteLength(JSON.stringify(value));
      if (this.requests.size >= 512 || this.bytes > LIMITS.inputBytes)
        fail(
          "resource-limit",
          "This fitting attempt exceeds its measurement work budget.",
          ["layout"],
        );
      this.requests.set(key, value);
    }
    const measured = this.available.get(key);
    if (measured)
      return {
        ...measured,
        quality: "measured-local-font",
        direction: request.direction,
      };
    const advance =
      estimatedTextWidth(run.text, run.style) +
      Math.max(0, run.style.letterSpacing);
    const overhang = run.text ? run.style.fontSize * (italic ? 0.35 : 0.12) : 0;
    return {
      advance,
      inkLeft: overhang,
      inkRight: advance + overhang,
      ascent: run.text ? run.style.fontSize * 1.3 : 0,
      descent: run.text ? run.style.fontSize * 0.4 : 0,
      quality: "estimated",
      direction: request.direction,
    };
  }
}
