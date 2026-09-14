import type {
  LayoutAlgorithm,
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
import type { FlowRun } from "./wrap.js";

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
  protected bytes: number;
  private readonly candidate = new Set<string>();
  declare readonly suggest?: (
    tokens: readonly (readonly FlowRun[])[],
    profile?: string,
  ) => void;
  constructor(
    readonly environment: string,
    snapshot?: MeasurementSnapshot,
    readonly algorithm: LayoutAlgorithm = "fit/v1",
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
  beginCandidate(): void {
    this.candidate.clear();
  }
  /** V2 keeps estimation work separate from a serializable explicit font batch.
   * Current candidate first, then prior sizes; reserve the complete metric envelope.
   * A partial batch remains explicitly estimated on the next compile.
   */
  measurementBatch(
    includeAvailable = false,
  ): readonly TextMeasurementRequest[] {
    const missing = (request: TextMeasurementRequest) =>
      includeAvailable || !this.available.has(request.key);
    if (this.algorithm === "fit/v1")
      return [...this.requests.values()].filter(missing);
    const keys = new Set([...this.candidate, ...this.requests.keys()]);
    const batch: TextMeasurementRequest[] = [];
    let bytes = utf8ByteLength(this.environment) + 128;
    for (const key of keys) {
      const request = this.requests.get(key)!;
      if (request.algorithm !== this.algorithm || !missing(request)) continue;
      const reserved = utf8ByteLength(JSON.stringify(request)) + 256;
      if (bytes + reserved > LIMITS.inputBytes) continue;
      bytes += reserved;
      batch.push(request);
    }
    return batch;
  }
  protected request(
    run: TextRun,
    profile: string,
    italic = false,
  ): TextMeasurementRequest {
    const data = {
      algorithm: this.algorithm,
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
      const limit =
        this.algorithm === "fit/v2" ? 512 * 1024 : LIMITS.inputBytes;
      if (this.requests.size >= 512 || this.bytes + bytes > limit)
        fail("resource-limit", "Fitting exceeds its measurement budget.", [
          "layout",
        ]);
      this.bytes += bytes;
      this.requests.set(key, request);
    }
    this.candidate.add(key);
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
    const overhang = run.style.fontSize * (italic ? 0.35 : 0.12);
    return {
      advance,
      inkLeft: overhang,
      inkRight: advance + overhang,
      ascent: run.style.fontSize * 1.3,
      descent: run.style.fontSize * 0.4,
      quality: "estimated",
      direction: request.direction,
    };
  }
}
