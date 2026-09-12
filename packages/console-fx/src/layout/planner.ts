import type {
  CompileOptions,
  Diagnostic,
  SceneV1,
  TextRun,
} from "../model/types.js";
import type {
  LayoutFragment,
  LayoutReport,
  LayoutRequest,
  PaintBounds,
  MeasurementQuality,
} from "../model/layout.js";
import { deepFreeze, LIMITS } from "../model/limits.js";
import { fail } from "../validation/index.js";
import { presentationDescriptor } from "../presentations/catalog.js";
import {
  cinematicEffect,
  cinematicLayout,
  type CinematicLayout,
} from "../renderers/cinematic/layout.js";
import { PROFILES } from "../renderers/cinematic/profiles.js";
import { GLYPHS } from "../renderers/cinematic/glyphs.js";
import { MetricResolver, type FontMetric } from "./metrics.js";
import { expand, runBounds, translate, union } from "./bounds.js";
import { wrapRun } from "./wrap.js";

export interface PlannedRun {
  readonly run: TextRun & { readonly sourceRun: number };
  readonly fragment: LayoutFragment;
  readonly cinematic: CinematicLayout | undefined;
}
export interface PlannedLine {
  readonly align: "left" | "center" | "right";
  readonly sourceLine: number;
  readonly runs: readonly PlannedRun[];
  readonly baseline: number;
}
export interface SvgLayoutPlan {
  readonly scene: SceneV1;
  readonly lines: readonly PlannedLine[];
  readonly report: LayoutReport;
}
const issue = (code: string, message: string): Diagnostic => ({
  code,
  message,
  severity: "warning",
  path: ["layout"],
});
const quality = (fragments: readonly LayoutFragment[]): MeasurementQuality =>
  fragments.some((f) => f.quality === "estimated")
    ? "estimated"
    : fragments.some((f) => f.quality === "measured-local-font")
      ? "measured-local-font"
      : "authored-geometry";
function fitFailure(code: string, message: string): never {
  fail(code, message, ["layout"]);
}

/** Internal data plan. Only this validated scene's geometry reaches the serializer. */
export function planSvgLayout(
  scene: SceneV1,
  request: LayoutRequest,
  options: CompileOptions,
  suppliedResolver?: MetricResolver,
): SvgLayoutPlan {
  if (request.variant === "compact")
    fitFailure(
      "unsupported-layout",
      "This compact layout has not yet completed its separate visual review.",
    );
  const padding = scene.surface.padding;
  if (request.width <= 2 * padding || request.maxHeight <= 2 * padding)
    fitFailure(
      "layout-overflow",
      "The requested frame leaves no padded content space.",
    );
  const profile = scene.presentation?.profile ?? "flow/v1";
  const environment =
    options.measurementEnvironment ?? "unspecified-local-fonts";
  // A supplied snapshot is trusted only with an explicit matching environment.
  const resolver =
    suppliedResolver ??
    new MetricResolver(
      environment,
      options.measurementEnvironment ? options.measurements : undefined,
    );
  const diagnostics: Diagnostic[] = [];
  if (
    options.measurements &&
    options.measurements.environment !== options.measurementEnvironment
  )
    diagnostics.push(
      issue(
        "stale-measurement",
        "The snapshot's environment was not explicitly selected; font estimates are used.",
      ),
    );
  const sizing = options.sizing;
  const displayScale =
    sizing?.mode === "container-experimental"
      ? null
      : (sizing?.width ?? request.width) / request.width;
  if (
    sizing?.mode === "container-experimental" &&
    sizing.maxWidth > request.width
  )
    fitFailure(
      "unsupported-layout",
      "Container maximum width cannot exceed the laid-out artboard.",
    );
  const floorScale = displayScale ?? 1;
  const shrink =
    request.overflow === "shrink" || request.overflow === "wrap-then-shrink";
  const wrap =
    request.overflow === "wrap" || request.overflow === "wrap-then-shrink";
  const bodyRuns = scene.lines
    .flatMap((l) => l.runs)
    .filter((r) => r.text.length);
  const minimumScale = Math.max(
    0,
    ...bodyRuns.map(
      (r) => request.minFontSize / (r.style.fontSize * floorScale),
    ),
  );
  // fit/v1: 16 uniform candidates, descending, including the exact readability floor.
  const scales =
    !shrink || minimumScale >= 1
      ? [1]
      : Array.from({ length: 16 }, (_, i) => 1 - ((1 - minimumScale) * i) / 15);
  let selected:
    | {
        scene: SceneV1;
        lines: PlannedLine[];
        fragments: LayoutFragment[];
        height: number;
        scale: number;
        rows: number;
      }
    | undefined;
  let lastFailure = "The complete painted content exceeds the chosen frame.";
  let candidates = 0;
  for (const scale of scales) {
    candidates++;
    const scaled: SceneV1 = {
      ...scene,
      surface: {
        ...scene.surface,
        width: request.width,
        height: request.maxHeight,
      },
      lines: scene.lines.map((l) => ({
        ...l,
        runs: l.runs.map((r) => ({
          ...r,
          style: {
            ...r.style,
            fontSize: r.style.fontSize * scale,
            letterSpacing: r.style.letterSpacing * scale,
          },
        })),
      })),
    };
    if (scene.presentation) {
      const descriptor = presentationDescriptor(scene.presentation.profile)!;
      const frameScale = Math.min(
        (request.width - 2 * padding) / 720,
        (request.maxHeight - 2 * padding) / 240,
      );
      const height = 240 * frameScale + 2 * padding;
      const offsetX = (request.width - 720 * frameScale) / 2;
      const fragments: LayoutFragment[] = [];
      let fits = true;
      for (const slot of descriptor.slots) {
        const run = scaled.lines[slot.line]!.runs[slot.run]!;
        // Standard card slots stay single-line. Compact variants own reviewed reflow.
        if (
          /[\n\t\u2028\u2029]/u.test(run.text) ||
          [...run.text].length > slot.maxCodePoints
        ) {
          fits = false;
          lastFailure =
            "A named slot exceeds this standard profile's content contract.";
          break;
        }
        const metrics = resolver.resolve(run, profile);
        const left = slot.anchor === "end" ? slot.x - metrics.advance : slot.x;
        const local = expand(
          {
            x: left - metrics.inkLeft,
            y: slot.y - metrics.ascent,
            width: metrics.inkLeft + metrics.inkRight,
            height: metrics.ascent + metrics.descent,
          },
          descriptor.id === "letterpress" && slot.id === "title" ? 1.5 : 0.5,
        );
        const slotStart =
          slot.anchor === "end" ? slot.x - slot.safeWidth : slot.x;
        // An ink bearing may occupy the authored 3px tolerance without colliding with a neighbor.
        if (
          local.x < slotStart - 3 ||
          local.x + local.width > slotStart + slot.safeWidth + 3 ||
          local.y < 0 ||
          local.y + local.height > 240
        )
          fits = false;
        const effectiveSize = run.style.fontSize * frameScale * floorScale;
        const bodyFloor =
          descriptor.group === "Useful" && slot.style.fontSize >= 14
            ? 12
            : request.minFontSize;
        if (
          run.text &&
          effectiveSize + 1e-8 < Math.max(request.minFontSize, bodyFloor)
        ) {
          fits = false;
          lastFailure =
            "Fixed scaling would make card text smaller than the requested readable floor. Use a wider frame or a reviewed compact layout.";
        }
        const transform = (b: PaintBounds) => ({
          x: offsetX + b.x * frameScale,
          y: padding + b.y * frameScale,
          width: b.width * frameScale,
          height: b.height * frameScale,
        });
        fragments.push({
          sourceLine: slot.line,
          sourceRun: slot.run,
          slot: slot.id,
          text: run.text,
          x: offsetX + left * frameScale,
          baseline: padding + slot.y * frameScale,
          fontSize: run.style.fontSize * frameScale,
          advance: metrics.advance * frameScale,
          ink: transform({
            x: left - metrics.inkLeft,
            y: slot.y - metrics.ascent,
            width: metrics.inkLeft + metrics.inkRight,
            height: metrics.ascent + metrics.descent,
          }),
          paint: transform(local),
          quality: metrics.quality,
        });
      }
      if (fits) {
        selected = {
          scene: { ...scaled, surface: { ...scaled.surface, height } },
          lines: [],
          fragments,
          height,
          scale: scale * frameScale,
          rows: scene.lines.length,
        };
        break;
      }
      continue;
    }
    const rows: {
      align: PlannedLine["align"];
      sourceLine: number;
      runs: (TextRun & { sourceRun: number })[];
    }[] = [];
    for (const [sourceLine, line] of scaled.lines.entries()) {
      let row: {
        align: PlannedLine["align"];
        sourceLine: number;
        runs: (TextRun & { sourceRun: number })[];
      } = { align: line.align, sourceLine, runs: [] };
      rows.push(row);
      for (const [sourceRun, run] of line.runs.entries()) {
        const explicit = run.text.split(/\n|\u2028|\u2029/u);
        for (const [part, text] of explicit.entries()) {
          if (part) {
            row = { align: line.align, sourceLine, runs: [] };
            rows.push(row);
          }
          if (text.includes("\t"))
            fitFailure(
              "unsupported-layout",
              "Replace visual tabs with spaces or request plain text; original captions are preserved.",
            );
          // Reserve the finite effect envelope before selecting wrap opportunities.
          const estimate = { ...run, text };
          const metric: FontMetric = {
            advance: 0,
            inkLeft: 0,
            inkRight: 0,
            ascent: run.style.fontSize * 1.3,
            descent: run.style.fontSize * 0.4,
            quality: "estimated",
          };
          const envelope = runBounds(
            estimate,
            metric,
            options.motion === "allow",
          ).paint;
          const usable =
            request.width -
            2 * padding -
            Math.max(0, -envelope.x) -
            Math.max(0, envelope.x + envelope.width);
          const fragments =
            wrap && !cinematicEffect(run)
              ? wrapRun(estimate, Math.max(1, usable))
              : [text];
          fragments.forEach((fragment, i) => {
            if (i) {
              row = { align: line.align, sourceLine, runs: [] };
              rows.push(row);
            }
            row.runs.push({ ...run, text: fragment, sourceRun });
          });
        }
      }
    }
    if (rows.length > LIMITS.lines) {
      lastFailure = "Wrapping exceeds the eight visual-row limit.";
      continue;
    }
    const planned: PlannedLine[] = [];
    let y = padding;
    let fits = true;
    for (const row of rows) {
      const rowSize = Math.max(8, ...row.runs.map((r) => r.style.fontSize));
      const items = row.runs.map((run) => {
        const cinematic = cinematicEffect(run);
        if (cinematic) {
          const descriptor = PROFILES[cinematic.profile];
          const metric = descriptor.angular
            ? undefined
            : resolver.resolve(
                { ...run, style: { ...run.style, fontFamily: "serif" } },
                cinematic.profile,
                descriptor.italic,
              );
          const layout = cinematicLayout(run, cinematic, metric);
          return {
            run,
            advance: layout.width,
            ink: metric
              ? {
                  x: layout.insetX - metric.inkLeft * descriptor.xScale,
                  y: -metric.ascent * descriptor.yScale,
                  width: (metric.inkLeft + metric.inkRight) * descriptor.xScale,
                  height: (metric.ascent + metric.descent) * descriptor.yScale,
                }
              : {
                  x: layout.insetX,
                  y: -layout.faceHeight,
                  width: layout.faceWidth,
                  height: layout.faceHeight,
                },
            paint: {
              x: 0,
              y: -layout.ascent,
              width: layout.width,
              height: layout.ascent + layout.descent,
            },
            quality:
              metric?.quality ?? ("authored-geometry" as MeasurementQuality),
            cinematic: layout,
          };
        }
        const metrics = resolver.resolve(run, "flow/v1");
        return {
          run,
          advance: metrics.advance,
          ...runBounds(run, metrics, options.motion === "allow", rowSize),
          quality: metrics.quality,
          cinematic: undefined,
        };
      });
      const widths = items.map(
        (r) =>
          Math.max(r.advance, r.paint.x + r.paint.width) -
          Math.min(0, r.paint.x),
      );
      const total = widths.reduce((a, b) => a + b, 0);
      const above = Math.max(rowSize, ...items.map((r) => -r.paint.y)),
        below = Math.max(
          rowSize * 0.25,
          ...items.map((r) => r.paint.y + r.paint.height),
        );
      const baseline = y + above;
      let cursor =
        row.align === "center"
          ? (request.width - total) / 2
          : row.align === "right"
            ? request.width - padding - total
            : padding;
      if (
        total > request.width - 2 * padding ||
        baseline + below > request.maxHeight - padding
      )
        fits = false;
      const runs = items.map((item, i): PlannedRun => {
        const x = cursor - Math.min(0, item.paint.x);
        cursor += widths[i]!;
        if (
          item.run.text &&
          item.run.style.fontSize * floorScale + 1e-8 < request.minFontSize
        ) {
          fits = false;
          lastFailure =
            "The output would fall below the requested minimum font size.";
        }
        return {
          run: item.run,
          cinematic: item.cinematic,
          fragment: {
            sourceLine: row.sourceLine,
            sourceRun: item.run.sourceRun,
            text: item.run.text,
            x,
            baseline,
            fontSize: item.run.style.fontSize,
            advance: item.advance,
            ink: translate(item.ink, x, baseline),
            paint: translate(item.paint, x, baseline),
            quality: item.quality,
          },
        };
      });
      planned.push({
        align: row.align,
        sourceLine: row.sourceLine,
        runs,
        baseline,
      });
      y = baseline + below + rowSize * 0.2;
    }
    if (fits) {
      const height = Math.min(
        request.maxHeight,
        Math.max(
          1,
          y -
            (rows.at(-1)
              ? Math.max(8, ...rows.at(-1)!.runs.map((r) => r.style.fontSize)) *
                0.2
              : 0) +
            padding,
        ),
      );
      selected = {
        scene: { ...scaled, surface: { ...scaled.surface, height } },
        lines: planned,
        fragments: planned.flatMap((l) => l.runs.map((r) => r.fragment)),
        height,
        scale,
        rows: rows.length,
      };
      break;
    }
  }
  if (!selected) fitFailure("layout-overflow", lastFailure);
  const measuredQuality = quality(selected.fragments);
  if (measuredQuality === "estimated")
    diagnostics.push(
      issue(
        "unverified-font-metrics",
        "Estimated font bounds are not a verified fit. Measure the returned fragments explicitly for this environment.",
      ),
    );
  if (measuredQuality === "measured-local-font")
    diagnostics.push(
      issue(
        "platform-font-variation",
        "These local font measurements do not prove recipient font resolution.",
      ),
    );
  const requests = [...resolver.requests.values()].filter(
    (r) => !resolver.available.has(r.key),
  );
  if (options.measurements && requests.length)
    diagnostics.push(
      issue(
        "stale-measurement",
        "Some exact fragments or sizes have no matching measurement; their confidence remains estimated.",
      ),
    );
  const width = displayScale === null ? null : request.width * displayScale,
    height = displayScale === null ? null : selected.height * displayScale;
  if (height !== null && height > LIMITS.svgHeight)
    fitFailure(
      "below-readable-size",
      "The proportional display height exceeds 400 pixels.",
    );
  const report: LayoutReport = {
    algorithm: "fit/v1",
    profile,
    variant: "standard",
    artboard: { width: request.width, height: selected.height },
    paint: scene.presentation
      ? { x: 0, y: 0, width: request.width, height: selected.height }
      : union(selected.fragments.map((f) => f.paint)),
    fragments: selected.fragments,
    glyphBounds: selected.lines.flatMap((line) =>
      line.runs.flatMap((item) => {
        const effect = cinematicEffect(item.run);
        if (!effect || !PROFILES[effect.profile].angular || !item.cinematic)
          return [];
        let advance = 0;
        return item.cinematic.letters.map((letter, index) => {
          const ink = {
            x: item.fragment.x + item.cinematic!.insetX + advance,
            y: item.fragment.baseline - item.cinematic!.faceHeight,
            width: (GLYPHS[letter]![2] * item.run.style.fontSize) / 100,
            height: letter === " " ? 0 : item.cinematic!.faceHeight,
          };
          advance +=
            item.cinematic!.advances[index]! + item.run.style.letterSpacing;
          return {
            sourceLine: line.sourceLine,
            sourceRun: item.run.sourceRun,
            index,
            ink,
          };
        });
      }),
    ),
    visualRows: selected.rows,
    contentScale: selected.scale,
    displayScale,
    resolvedDisplayWidth: width,
    resolvedDisplayHeight: height,
    displayReadability:
      displayScale === null ? "unknown" : "meets-requested-floor",
    measurementQuality: measuredQuality,
    measurementEnvironment:
      measuredQuality === "authored-geometry" ? null : environment,
    verdict:
      measuredQuality === "estimated"
        ? "estimated-fit"
        : "fits-under-recorded-conditions",
    measurementRequests: requests,
    shapingRequests: resolver.requests.size,
    shrinkCandidates: candidates,
    segmentation: "fit/v1-grapheme-space-cjk",
    blurTolerance: "3-sigma",
    diagnostics,
  };
  return deepFreeze({ scene: selected.scene, lines: selected.lines, report });
}
