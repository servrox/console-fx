import type { ExportOptions, SceneV1, TextStyle, Diagnostic } from "./types.js";

export type LayoutAlgorithm = "fit/v1" | "fit/v2";

export interface LayoutRequest {
  readonly algorithm: LayoutAlgorithm;
  readonly width: number;
  readonly maxHeight: number;
  readonly variant: "standard" | "compact" | "auto";
  readonly overflow: "error" | "wrap" | "shrink" | "wrap-then-shrink";
  readonly minFontSize: number;
}
export type OutputSizing =
  | { readonly mode: "fixed"; readonly width: number }
  | {
      readonly mode: "container-experimental";
      readonly maxWidth: number;
      readonly fillFraction?: number;
    };
export type MeasurementQuality =
  "authored-geometry" | "measured-local-font" | "estimated";
export interface PaintBounds {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}
/** Text is shaped as a complete fragment. The key is validated against every field. */
export interface TextMeasurementRequest {
  readonly key: string;
  readonly algorithm: LayoutAlgorithm;
  readonly profile: string;
  readonly text: string;
  readonly style: TextStyle;
  readonly italic: boolean;
  readonly direction: "ltr" | "rtl";
  readonly environment: string;
}
export interface TextMeasurement {
  readonly request: TextMeasurementRequest;
  readonly advance: number;
  readonly inkLeft: number;
  readonly inkRight: number;
  readonly ascent: number;
  readonly descent: number;
}
export interface MeasurementSnapshot {
  readonly kind: "consoleFxMeasurements";
  readonly measurementVersion: 1;
  readonly environment: string;
  readonly records: readonly TextMeasurement[];
}
export interface LayoutFragment {
  readonly sourceLine: number;
  readonly sourceRun: number;
  readonly slot?: string;
  readonly text: string;
  readonly x: number;
  readonly baseline: number;
  readonly fontSize: number;
  readonly advance: number;
  readonly ink: PaintBounds;
  readonly paint: PaintBounds;
  readonly quality: MeasurementQuality;
}
export interface LayoutReport {
  readonly algorithm: LayoutAlgorithm;
  readonly profile: string;
  readonly variant: "standard" | "compact";
  readonly artboard: { readonly width: number; readonly height: number };
  readonly paint: PaintBounds;
  readonly fragments: readonly LayoutFragment[];
  readonly glyphBounds: readonly {
    readonly sourceLine: number;
    readonly sourceRun: number;
    readonly index: number;
    readonly ink: PaintBounds;
  }[];
  readonly visualRows: number;
  /** Candidate scale; fit/v2 clamps each field separately at its readable floor. */
  readonly contentScale: number;
  readonly displayScale: number | null;
  readonly resolvedDisplayWidth: number | null;
  readonly resolvedDisplayHeight: number | null;
  readonly displayReadability: "meets-requested-floor" | "unknown";
  readonly measurementQuality: MeasurementQuality;
  readonly measurementEnvironment: string | null;
  readonly verdict: "fits-under-recorded-conditions" | "estimated-fit";
  readonly measurementRequests: readonly TextMeasurementRequest[];
  readonly shapingRequests: number;
  readonly shrinkCandidates: number;
  readonly segmentation: "fit/v1-grapheme-space-cjk";
  readonly blurTolerance: "3-sigma";
  readonly diagnostics: readonly Diagnostic[];
}
export interface RenderRecipeV1 {
  readonly kind: "consoleFxRenderRecipe";
  readonly recipeVersion: 1;
  readonly scene: SceneV1;
  readonly options: Omit<
    ExportOptions,
    "measurements" | "measurementEnvironment"
  >;
}
export interface OutputSizingReport {
  readonly mode: "fixed" | "container-experimental";
  readonly artboard: { readonly width: number; readonly height: number };
  readonly resolvedDisplayWidth: number | null;
  readonly resolvedDisplayHeight: number | null;
  readonly displayScale: number | null;
  readonly displayReadability:
    "meets-requested-floor" | "meets-default-floor" | "unknown";
}
