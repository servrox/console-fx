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
  private bytes: number;
  private readonly alternatives: {
    runs: Iterable<TextRun>;
    profile: string;
  }[] = [];
  constructor(
    readonly environment: string,
    readonly snapshot?: MeasurementSnapshot,
  ) {
    this.bytes = utf8ByteLength(
      JSON.stringify({
        kind: "consoleFxMeasurements",
        measurementVersion: 1,
        environment,
        records: [],
      }),
    );
    this.available = new Map(
      snapshot?.environment === environment
        ? snapshot.records.map((r) => [r.request.key, r])
        : [],
    );
    for (const record of this.available.values()) {
      const { request } = record;
      this.requests.set(request.key, request);
      this.bytes += utf8ByteLength(JSON.stringify(record)) + 1;
    }
  }
  suggest(alternatives: Iterable<TextRun>, profile = "flow/v1"): void {
    this.alternatives.push({ runs: alternatives, profile });
  }
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
  private request(
    run: TextRun,
    profile: string,
    italic = false,
  ): TextMeasurementRequest {
    const data = {
      algorithm: "fit/v1" as const,
      profile,
      text: run.text,
      style: run.style,
      italic,
      direction: textDirection(run.text),
      environment: this.environment,
    };
    return { key: measurementKey(data), ...data };
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
    const request = this.request(run, profile, italic);
    const key = request.key;
    if (!this.requests.has(key)) {
      // Reserve the bounded numeric metric fields and record envelope so an
      // explicitly measured batch can itself satisfy the snapshot byte limit.
      const bytes = utf8ByteLength(JSON.stringify(request)) + 256;
      if (this.requests.size >= 512 || this.bytes + bytes > LIMITS.inputBytes)
        fail("resource-limit", "Fitting exceeds its measurement budget.", [
          "layout",
        ]);
      this.bytes += bytes;
      this.requests.set(key, request);
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
