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
import { standardCellEdges } from "../presentations/safe-cells.js";
import { deepFreeze, LIMITS } from "../model/limits.js";
import { fail } from "../validation/index.js";
import { presentationDescriptor } from "../presentations/catalog.js";
import {
  cardFitLayout,
  type CardFitLayout,
  type CardFitSlot,
} from "../presentations/compact.js";
import {
  cinematicEffect,
  cinematicLayout,
  type CinematicLayout,
} from "../renderers/cinematic/layout.js";
import { PROFILES } from "../renderers/cinematic/profiles.js";
import { GLYPHS } from "../renderers/cinematic/glyphs.js";
import { MetricResolver } from "./metrics.js";
import { expand, runBounds, translate, union } from "./bounds.js";
import { wrapTokens, wrapTokensToRows, type FlowRun } from "./wrap.js";

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
  readonly cardLayout?: CardFitLayout;
  readonly cardTexts?: readonly {
    readonly slot: CardFitSlot;
    readonly text: string;
    readonly baseline: number;
  }[];
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
  if (request.variant === "compact" && !scene.presentation)
    fitFailure("unsupported-layout", "This scene has no compact card layout.");
  const padding = scene.surface.padding;
  if (request.width <= 2 * padding || request.maxHeight <= 2 * padding)
    fitFailure("layout-overflow", "Frame padding leaves no content space.");
  const card = scene.presentation
    ? presentationDescriptor(scene.presentation.profile)!
    : undefined;
  const cardLayout = card ? cardFitLayout(card, request) : undefined;
  const profile = cardLayout?.profile ?? "flow/v1";
  const environment =
    options.measurementEnvironment ?? "unspecified-local-fonts";
  // A supplied snapshot is trusted only with an explicit matching environment.
  const resolver =
    suppliedResolver ??
    new MetricResolver(
      environment,
      options.measurementEnvironment ? options.measurements : undefined,
      request.algorithm,
    );
  const diagnostics: Diagnostic[] = [];
  if (
    options.measurements &&
    options.measurements.environment !== options.measurementEnvironment
  )
    diagnostics.push(
      issue(
        "stale-measurement",
        "Snapshot environment was not selected; font estimates are used.",
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
      "Container maximum width cannot exceed the image artboard.",
    );
  const floorScale = displayScale ?? 1;
  const shrink =
    request.overflow === "shrink" || request.overflow === "wrap-then-shrink";
  const wrap =
    request.overflow === "wrap" || request.overflow === "wrap-then-shrink";
  if (wrap && typeof Intl.Segmenter !== "function")
    diagnostics.push(
      issue(
        "segmentation-unavailable",
        "Grapheme segmentation is unavailable; whole paragraphs are kept intact.",
      ),
    );
  const frameScale = cardLayout
    ? Math.min(
        cardLayout.compact ? 1 : Infinity,
        (request.width - 2 * padding) / cardLayout.width,
        (request.maxHeight - 2 * padding) / cardLayout.height,
      )
    : 1;
  const slotFloor = (size: number) =>
    Math.max(
      request.minFontSize,
      cardLayout?.compact ? 12 : 0,
      card?.group === "Useful" && size >= 14 ? 12 : 0,
    );
  const visibleRuns = cardLayout
    ? cardLayout.slots.map((slot) => ({
        ...scene.lines[slot.line]!.runs[slot.run]!,
        style: slot.style,
      }))
    : scene.lines.flatMap((line) => line.runs);
  const floorPreserving = request.algorithm === "fit/v2";
  const floorRatios = visibleRuns
    .filter((run) => run.text.length)
    .map(
      (run) =>
        slotFloor(run.style.fontSize) /
        (run.style.fontSize * frameScale * floorScale),
    );
  const minimumScale = floorPreserving
    ? Math.min(1, ...floorRatios)
    : Math.max(0, ...floorRatios);
  // fit/v1: 16 uniform candidates, descending, including the exact readability floor.
  const scales =
    !shrink || minimumScale >= 1
      ? [1]
      : Array.from({ length: 16 }, (_, i) => 1 - ((1 - minimumScale) * i) / 15);
  const flowGeometry = (run: FlowRun, rowSize: number) => {
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
        quality: metric?.quality ?? ("authored-geometry" as MeasurementQuality),
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
  };
  let selected:
    | {
        scene: SceneV1;
        lines: PlannedLine[];
        fragments: LayoutFragment[];
        height: number;
        scale: number;
        rows: number;
        cardTexts?: SvgLayoutPlan["cardTexts"];
      }
    | undefined;
  let lastFailure = "Painted content exceeds its safe region.";
  let candidates = 0;
  for (const scale of scales) {
    candidates++;
    resolver.beginCandidate();
    const scaled: SceneV1 = {
      ...scene,
      surface: {
        ...scene.surface,
        width: request.width,
        height: request.maxHeight,
      },
      lines: scene.lines.map((l, li) => ({
        ...l,
        runs: l.runs.map((r, ri) => ({
          ...r,
          style: {
            ...r.style,
            fontSize: (() => {
              const base = cardLayout?.compact
                ? (cardLayout.slots.find((s) => s.line === li && s.run === ri)
                    ?.style.fontSize ?? r.style.fontSize)
                : r.style.fontSize;
              // V1 is deliberately uniform. V2 leaves small fields at their floor.
              return floorPreserving
                ? Math.min(
                    base,
                    Math.max(
                      base * scale,
                      slotFloor(base) / (frameScale * floorScale),
                    ),
                  )
                : base * scale;
            })(),
            letterSpacing: cardLayout?.compact
              ? 0
              : r.style.letterSpacing * scale,
          },
        })),
      })),
    };
    if (cardLayout && card) {
      const height = cardLayout.height * frameScale + 2 * padding;
      const offsetX = (request.width - cardLayout.width * frameScale) / 2;
      const fragments: LayoutFragment[] = [];
      const cardTexts: NonNullable<SvgLayoutPlan["cardTexts"]>[number][] = [];
      let visualRows = cardLayout.rows;
      let fits = true;
      for (const [slotIndex, slot] of cardLayout.slots.entries()) {
        const run = scaled.lines[slot.line]!.runs[slot.run]!;
        if (
          /[\n\t\u2028\u2029]/u.test(run.text) ||
          [...run.text].length > slot.maxCodePoints
        ) {
          fits = false;
          lastFailure = "A card slot exceeds its content limit.";
          break;
        }
        // Only the reviewed footer and command/description regions have extra rows.
        const footer =
          cardLayout.compact &&
          card.id === "serviceReady" &&
          slot.id === "footer";
        const command =
          cardLayout.compact &&
          card.id === "commandCard" &&
          (slot.id === "command" || slot.id === "instruction");
        const wrapping = wrap && (footer || command);
        const lineHeight = footer ? 18 : slot.id === "command" ? 24 : 18;
        const tokens = wrapTokens([{ ...run, sourceRun: slot.run }]);
        if (wrapping) resolver.suggest?.(tokens, profile);
        const texts = wrapping
          ? wrapTokensToRows(tokens, footer ? 190 : slot.safeWidth, (runs) => {
              if (!runs.length) return 0;
              const m = resolver.resolve(runs[0]!, profile);
              return Math.max(m.advance, m.inkRight) + Math.max(0, m.inkLeft);
            }).map((row) => row.map((r) => r.text).join(""))
          : [run.text];
        if (texts.length > 2) fits = false;
        visualRows += texts.length - 1;
        const anchorFactor =
          slot.anchor === "end" ? 1 : slot.anchor === "middle" ? 0.5 : 0;
        const slotStart = slot.x - slot.safeWidth * anchorFactor;
        const effectiveSize = run.style.fontSize * frameScale * floorScale;
        if (run.text && effectiveSize + 1e-8 < slotFloor(slot.style.fontSize)) {
          fits = false;
          lastFailure =
            "Card text is too small. Choose a wider frame or compact layout.";
        }
        const transform = (b: PaintBounds) => ({
          x: offsetX + b.x * frameScale,
          y: padding + b.y * frameScale,
          width: b.width * frameScale,
          height: b.height * frameScale,
        });
        for (const [row, text] of texts.entries()) {
          const metrics = resolver.resolve({ ...run, text }, profile);
          let left = slot.x - metrics.advance * anchorFactor;
          let baseline =
            slot.y + lineHeight * (footer ? row : row - (texts.length - 1) / 2);
          let ink = {
            x: left - metrics.inkLeft,
            y: baseline - metrics.ascent,
            width: metrics.inkLeft + metrics.inkRight,
            height: metrics.ascent + metrics.descent,
          };
          let local = expand(
            ink,
            card.id === "letterpress" && slot.id === "title" ? 1.5 : 0.5,
          );
          // Fixed vertical cells reserve surrounding labels and original artwork.
          const [artLeft, artRight, artTop, artBottom] =
            floorPreserving && !cardLayout.compact
              ? standardCellEdges(card.id, slotIndex)
              : [];
          const cellLeft = Math.max(slotStart - 3, artLeft ?? -Infinity);
          const cellRight = Math.min(
            slotStart + slot.safeWidth + 3,
            artRight ?? Infinity,
          );
          const top = Math.max(
            artTop ?? -Infinity,
            command
              ? slot.id === "command"
                ? 164
                : 110
              : Math.max(
                  slot.safeTop ?? 0,
                  slot.y - slot.style.fontSize * 1.4 - 2,
                ),
          );
          const bottom = Math.min(
            artBottom ?? Infinity,
            command
              ? slot.id === "command"
                ? 215
                : 148
              : Math.min(
                  cardLayout.height,
                  baseline + slot.style.fontSize * 0.5 + 2,
                ),
          );
          // V2 moves the complete paint box only inside the original cell.
          // An oversized box still fails; no artwork or cell bounds are changed.
          let shiftedSlot = slot;
          if (floorPreserving) {
            const dx = Math.max(
              cellLeft - local.x,
              Math.min(0, cellRight - local.x - local.width),
            );
            const dy = Math.max(
              top - local.y,
              Math.min(0, bottom - local.y - local.height),
            );
            left += dx;
            baseline += dy;
            ink = translate(ink, dx, dy);
            local = translate(local, dx, dy);
            shiftedSlot = { ...slot, x: slot.x + dx };
          }
          // Authored 3px bearing tolerance never permits crossing another slot.
          if (
            local.x < cellLeft ||
            local.x + local.width > cellRight ||
            local.y < top ||
            local.y + local.height > bottom
          )
            fits = false;
          cardTexts.push({ slot: shiftedSlot, text, baseline });
          fragments.push({
            sourceLine: slot.line,
            sourceRun: slot.run,
            slot: slot.id,
            text,
            x: offsetX + left * frameScale,
            baseline: padding + baseline * frameScale,
            fontSize: run.style.fontSize * frameScale,
            advance: metrics.advance * frameScale,
            ink: transform(ink),
            paint: transform(local),
            quality: metrics.quality,
          });
        }
      }
      const overlaps = fragments.some(
        (a, i) =>
          a.text &&
          fragments.some(
            (b, j) =>
              j > i &&
              b.text &&
              a.paint.x < b.paint.x + b.paint.width &&
              b.paint.x < a.paint.x + a.paint.width &&
              a.paint.y < b.paint.y + b.paint.height &&
              b.paint.y < a.paint.y + a.paint.height,
          ),
      );
      if (fits && !overlaps && visualRows <= LIMITS.lines) {
        selected = {
          scene: { ...scaled, surface: { ...scaled.surface, height } },
          lines: [],
          fragments,
          height,
          scale: scale * frameScale,
          rows: visualRows,
          cardTexts,
        };
        break;
      }
      continue;
    }
    const rows: {
      align: PlannedLine["align"];
      sourceLine: number;
      runs: FlowRun[];
    }[] = [];
    for (const [sourceLine, line] of scaled.lines.entries()) {
      const paragraphs: FlowRun[][] = [[]];
      for (const [sourceRun, run] of line.runs.entries()) {
        for (const [part, text] of run.text
          .split(/\n|\u2028|\u2029/u)
          .entries()) {
          if (part) paragraphs.push([]);
          if (text.includes("\t"))
            fitFailure(
              "unsupported-layout",
              "Visual tabs require plain text. Original captions are preserved.",
            );
          paragraphs.at(-1)!.push({ ...run, text, sourceRun });
        }
      }
      for (const paragraph of paragraphs) {
        const tokens = wrapTokens(paragraph, floorPreserving);
        if (wrap) resolver.suggest?.(tokens);
        const fragments = wrap
          ? wrapTokensToRows(tokens, request.width - 2 * padding, (runs) => {
              const rowSize = Math.max(
                8,
                ...runs.map((run) => run.style.fontSize),
              );
              return runs.reduce((total, run) => {
                const item = flowGeometry(run, rowSize);
                return (
                  total +
                  Math.max(item.advance, item.paint.x + item.paint.width) -
                  Math.min(0, item.paint.x)
                );
              }, 0);
            })
          : [paragraph];
        rows.push(
          ...fragments.map((runs) => ({ align: line.align, sourceLine, runs })),
        );
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
      const items = row.runs.map((run) => flowGeometry(run, rowSize));
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
          lastFailure = "Output text falls below the requested font floor.";
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
        "Font bounds are estimated. Measure these fragments explicitly for this environment.",
      ),
    );
  if (
    selected.fragments.some(
      (fragment) => fragment.quality === "measured-local-font",
    )
  )
    diagnostics.push(
      issue(
        "platform-font-variation",
        "Recipient fonts may differ from these local measurements.",
      ),
    );
  const requests = resolver.measurementBatch();
  if (
    floorPreserving &&
    requests.length < resolver.requests.size - resolver.available.size
  )
    diagnostics.push(
      issue(
        "measurement-batch-limited",
        "Font batch capped; remaining text stays estimated.",
      ),
    );
  if (options.measurements && requests.length)
    diagnostics.push(
      issue(
        "stale-measurement",
        "Unmeasured fragments and sizes remain estimated.",
      ),
    );
  const width = displayScale === null ? null : request.width * displayScale,
    height = displayScale === null ? null : selected.height * displayScale;
  // Output sizing owns the hard display-height limit. Preflight must still
  // collect font data that can replace these estimated content bounds.
  const report: LayoutReport = {
    algorithm: request.algorithm,
    profile,
    variant: cardLayout?.compact ? "compact" : "standard",
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
  return deepFreeze({
    scene: selected.scene,
    lines: selected.lines,
    report,
    ...(cardLayout ? { cardLayout, cardTexts: selected.cardTexts! } : {}),
  });
}
