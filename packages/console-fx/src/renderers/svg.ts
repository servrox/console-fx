import { LIMITS } from "../model/limits.js";
import type { Diagnostic, Effect, SceneV1, TextRun } from "../model/types.js";
import { FONT_STACKS } from "./css.js";
import {
  cinematicEffect,
  cinematicLayout,
  cinematicElementBound,
} from "./cinematic/layout.js";
import { renderCinematic } from "./cinematic/render.js";
import { renderPresentation } from "./presentations/render.js";
import type { SvgLayoutPlan } from "../layout/planner.js";
import type { LayoutReport, OutputSizingReport } from "../model/layout.js";
import { textDirection } from "../layout/metrics.js";

import { escapeXml, svgNumber } from "./svg-values.js";
export { escapeXml } from "./svg-values.js";
function dataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`)}`;
}
function gradient(
  id: string,
  colors: readonly string[],
  drift?: Effect,
): string {
  let animation = "";
  if (drift?.kind === "gradientDrift") {
    animation = `<animateTransform attributeName="gradientTransform" type="translate" values="0 0;${drift.distance / 100} 0;0 0" dur="${drift.periodMs}ms" repeatCount="indefinite"/>`;
  }
  return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">${colors.map((color, index) => `<stop offset="${svgNumber(index / (colors.length - 1))}" stop-color="${color}"/>`).join("")}${animation}</linearGradient>`;
}
function motionEffect(run: TextRun): Effect | undefined {
  return run.effects.find((effect) =>
    ["glowPulse", "gradientDrift", "wave", "indicator"].includes(effect.kind),
  );
}

function visualLines(scene: SceneV1) {
  return scene.lines.flatMap((line, sourceLine) => {
    const result: {
      align: typeof line.align;
      sourceLine: number;
      runs: (TextRun & { sourceRun: number })[];
    }[] = [{ align: line.align, sourceLine, runs: [] }];
    for (const [sourceRun, run] of line.runs.entries()) {
      run.text.split("\n").forEach((text, part) => {
        if (part > 0) result.push({ align: line.align, sourceLine, runs: [] });
        result.at(-1)!.runs.push({ ...run, text, sourceRun });
      });
    }
    return result;
  });
}

export interface SvgResult {
  readonly imageUri: string;
  readonly animated: boolean;
  readonly diagnostics: readonly Diagnostic[];
  readonly layout?: LayoutReport;
  readonly width?: number;
  readonly height?: number;
  readonly carrierPadding?: string;
  readonly sizing?: OutputSizingReport;
}

export function renderSvg(
  scene: SceneV1,
  allowMotion: boolean,
  plan?: SvgLayoutPlan,
): SvgResult {
  // Fitted geometry must retain the precision used for paint/readability checks.
  const number = plan ? String : svgNumber;
  scene = plan?.scene ?? scene;
  if (scene.presentation) {
    const svg = renderPresentation(scene, plan);
    if ((svg.match(/<[a-z]/g)?.length ?? 0) > LIMITS.svgElements)
      throw new RangeError();
    const { width, height, padding } = scene.surface;
    const diagnostics: Diagnostic[] = [
      {
        code: "platform-font-variation",
        severity: "info",
        path: ["presentation"],
        message: "Local fonts vary; slot widths use conservative estimates.",
      },
    ];
    if (width - padding * 2 !== (height - padding * 2) * 3)
      diagnostics.push({
        code: "presentation-letterbox",
        severity: "info",
        path: ["surface"],
        message:
          "The card is scaled uniformly and centered inside the padded surface; the different aspect ratio leaves space.",
      });
    return {
      imageUri: dataUri(svg),
      animated: false,
      diagnostics,
    };
  }
  const definitions: string[] = [];
  const elements: string[] = [];
  const diagnostics: Diagnostic[] = [];
  const { width, height, padding, background, borderRadius } = scene.surface;
  let animated = false;
  const lines = plan
    ? plan.lines.map((line) => ({ ...line, runs: line.runs.map((r) => r.run) }))
    : visualLines(scene);
  const cinematicCount = scene.lines.reduce(
    (count, line) =>
      count +
      line.runs.reduce((sum, run) => {
        const effect = cinematicEffect(run);
        return sum + (effect ? cinematicElementBound(run, effect) : 0);
      }, 0),
    3,
  );
  if (cinematicCount > LIMITS.svgElements) throw new RangeError();
  const measurements = lines.map((line, lineNumber) => {
    const layouts = line.runs.map((run, runNumber) => {
      const effect = cinematicEffect(run);
      return (
        plan?.lines[lineNumber]?.runs[runNumber]?.cinematic ??
        (effect ? cinematicLayout(run, effect) : undefined)
      );
    });
    const cinematic = layouts.some(Boolean);
    const maxSize = Math.max(8, ...line.runs.map((run) => run.style.fontSize));
    const ascent = cinematic
      ? Math.max(
          ...line.runs.map(
            (run, i) => layouts[i]?.ascent ?? run.style.fontSize,
          ),
        )
      : maxSize;
    const descent = cinematic
      ? Math.max(
          ...line.runs.map(
            (run, i) => layouts[i]?.descent ?? run.style.fontSize * 0.25,
          ),
        )
      : maxSize * 0.25;
    return {
      layouts,
      cinematic,
      ascent,
      descent,
      maxSize,
      gap: cinematic ? maxSize * 0.2 : maxSize * 0.15,
    };
  });
  const contentHeight =
    measurements.reduce((sum, m) => sum + m.ascent + m.descent + m.gap, 0) -
    (measurements.at(-1)?.gap ?? 0);
  let y =
    padding +
    (measurements.some((m) => m.cinematic)
      ? Math.max(0, (height - padding * 2 - contentHeight) / 2)
      : 0);
  let identity = 0;
  const duration = scene.motion.durationMs;

  // Finish all declarative motion at a finite outer duration. Each animation
  // receives repeatDur as well; no animation relies on an unbounded timer.
  const boundedAnimation = (markup: string): string =>
    markup.replaceAll(
      'repeatCount="indefinite"',
      `repeatDur="${duration}ms" fill="freeze"`,
    );

  for (const [visualIndex, line] of lines.entries()) {
    const measurement = measurements[visualIndex]!;
    const lineIndex = line.sourceLine;
    const maxSize = Math.max(8, ...line.runs.map((run) => run.style.fontSize));
    const estimatedWidths = line.runs.map(
      (run, index) =>
        plan?.lines[visualIndex]?.runs[index]?.fragment.advance ??
        measurement.layouts[index]?.width ??
        [...run.text].length *
          (run.style.fontSize * (run.style.fontFamily === "mono" ? 0.61 : 0.6) +
            run.style.letterSpacing),
    );
    const estimatedWidth = estimatedWidths.reduce(
      (sum, value) => sum + value,
      0,
    );
    let x =
      line.align === "center"
        ? (width - estimatedWidth) / 2
        : line.align === "right"
          ? width - padding - estimatedWidth
          : padding;
    y += measurement.ascent;
    if (plan) y = plan.lines[visualIndex]!.baseline;
    if (
      estimatedWidth > width - padding * 2 ||
      y + measurement.descent > height - padding
    ) {
      diagnostics.push({
        code: "possible-clipping",
        severity: "warning",
        path: ["lines", lineIndex],
        message: "Possible clipping: reduce text size or enlarge the surface.",
      });
    }
    for (const [runIndex, run] of line.runs.entries()) {
      if (plan) x = plan.lines[visualIndex]!.runs[runIndex]!.fragment.x;
      const id = `fx-${identity++}`;
      const cinematic = cinematicEffect(run);
      if (cinematic) {
        const output = renderCinematic(
          run,
          cinematic,
          measurement.layouts[runIndex]!,
          id,
          x,
          y,
          FONT_STACKS.serif,
          Boolean(plan),
        );
        definitions.push(output.definitions);
        elements.push(output.markup);
        x += estimatedWidths[runIndex] ?? 0;
        continue;
      }
      const motion = allowMotion ? motionEffect(run) : undefined;
      let fill = run.style.color;
      const filters: string[] = [];
      let underlay = "";
      let overlay = "";
      const content = escapeXml(run.text);
      const attributes = `x="${number(x)}" y="${number(y)}" font-family="${FONT_STACKS[run.style.fontFamily]}" font-size="${run.style.fontSize}" font-weight="${run.style.fontWeight}" letter-spacing="${run.style.letterSpacing}" xml:space="preserve"${plan ? ` direction="${textDirection(run.text)}" text-anchor="${textDirection(run.text) === "rtl" ? "end" : "start"}"` : ""}`;
      const text = (ink: string, extra = "") =>
        `<text ${attributes} fill="${ink}" ${extra}>${content}</text>`;
      for (const effect of run.effects) {
        switch (effect.kind) {
          case "badge":
            underlay += `<rect x="${number(x - 10)}" y="${number(y - maxSize - 3)}" width="${number((estimatedWidths[runIndex] ?? 0) + 20)}" height="${number(maxSize * 1.4)}" rx="7" fill="${effect.color}"/>`;
            fill = "#071014";
            break;
          case "neon":
            fill = effect.color;
            definitions.push(
              `<filter id="${id}-glow" ${
                plan
                  ? (() => {
                      const ink =
                        plan.lines[visualIndex]!.runs[runIndex]!.fragment.ink;
                      const extent = 3 * (1 + effect.intensity * 3);
                      return `filterUnits="userSpaceOnUse" x="${number(ink.x - extent)}" y="${number(ink.y - extent)}" width="${number(ink.width + 2 * extent)}" height="${number(ink.height + 2 * extent)}"`;
                    })()
                  : 'x="-30%" y="-100%" width="160%" height="300%"'
              }><feGaussianBlur stdDeviation="${number(1 + effect.intensity * 3)}"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
            );
            filters.push(`filter="url(#${id}-glow)"`);
            break;
          case "rgbSplit":
            underlay +=
              text(
                "#ff526f",
                `transform="translate(${-effect.offset} 0)" opacity=".8"`,
              ) +
              text(
                "#35dfff",
                `transform="translate(${effect.offset} 0)" opacity=".8"`,
              );
            break;
          case "extruded":
            for (let depth = Math.floor(effect.depth); depth > 0; depth--)
              underlay += text(
                effect.color,
                `transform="translate(${depth} ${depth})"`,
              );
            break;
          case "holographic":
            definitions.push(
              gradient(
                `${id}-fill`,
                [
                  "#81fff0",
                  "#c4a2ff",
                  "#fff3be",
                  "#82d5ff",
                  "#ffb8dc",
                  "#81fff0",
                ],
                motion,
              ),
            );
            fill = `url(#${id}-fill)`;
            underlay += text(
              "#7effe9",
              `transform="translate(-1 -1)" opacity="${number(effect.intensity * 0.5)}"`,
            );
            break;
          case "metallic":
            definitions.push(
              gradient(
                `${id}-fill`,
                effect.variant === "gold"
                  ? ["#fff6c8", "#b47c21", "#ffe399", "#81551d", "#ffedb0"]
                  : ["#fafcff", "#738498", "#e5f5ff", "#445161", "#f4fcff"],
                motion,
              ),
            );
            fill = `url(#${id}-fill)`;
            underlay += text(
              effect.variant === "gold" ? "#73501b" : "#3c4958",
              'transform="translate(2 2)"',
            );
            break;
          case "crt":
            fill = "#8bffa2";
            definitions.push(
              `<pattern id="${id}-scan" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 1h4" stroke="${background}" stroke-width="${number(effect.intensity * 1.5)}"/></pattern>`,
            );
            overlay += `<rect x="${number(x)}" y="${number(y - maxSize)}" width="${number(estimatedWidths[runIndex] ?? 0)}" height="${number(maxSize * 1.3)}" fill="url(#${id}-scan)"/>`;
            break;
          case "rainbow": {
            const colors = [0, 45, 95, 165, 205, 265, 320].map(
              (hue) =>
                `hsl(${hue} ${Math.round(effect.saturation * 100)}% 70%)`,
            );
            definitions.push(gradient(`${id}-fill`, colors, motion));
            fill = `url(#${id}-fill)`;
            break;
          }
        }
      }
      if (motion?.kind === "gradientDrift" && !fill.startsWith("url(")) {
        definitions.push(
          gradient(
            `${id}-drift`,
            [run.style.color, "#f1a8d5", "#8affe0", run.style.color],
            motion,
          ),
        );
        fill = `url(#${id}-drift)`;
      }
      let markup = underlay + text(fill, filters.join(" ")) + overlay;
      if (motion) {
        animated = true;
        switch (motion.kind) {
          case "glowPulse":
            markup = `<g>${markup}<animate attributeName="opacity" values="1;${number(1 - motion.intensity)};1" dur="${motion.periodMs}ms" repeatDur="${duration}ms" fill="freeze"/></g>`;
            break;
          case "wave":
            markup = `<g>${markup}<animateTransform attributeName="transform" type="translate" values="0 0;0 ${-motion.amplitude};0 0;0 ${motion.amplitude};0 0" dur="${motion.periodMs}ms" repeatDur="${duration}ms" fill="freeze"/></g>`;
            diagnostics.push({
              code: "whole-run-motion",
              severity: "info",
              path: ["lines", lineIndex, "runs", run.sourceRun],
              message:
                "Wave moves whole runs to preserve graphemes and shaping.",
            });
            break;
          case "indicator": {
            const outline = run.effects.some(
              (effect) => effect.kind === "badge",
            )
              ? ' stroke="#071014" stroke-width="1"'
              : "";
            markup += `<rect x="${number(x)}" y="${number(y + 8)}" width="14" height="3" rx="1.5" fill="${motion.color}"${outline}><animateTransform attributeName="transform" type="translate" values="0 0;${number(Math.max(0, (estimatedWidths[runIndex] ?? 14) - 14))} 0;0 0" dur="${motion.periodMs}ms" repeatDur="${duration}ms" fill="freeze"/></rect>`;
            break;
          }
        }
      }
      elements.push(markup);
      x += estimatedWidths[runIndex] ?? 0;
    }
    y += measurement.cinematic
      ? measurement.descent + measurement.gap
      : maxSize * 0.4;
  }
  const svg = boundedAnimation(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs>${definitions.join("")}</defs><rect width="${width}" height="${height}" rx="${borderRadius}" fill="${background}"/>${elements.join("")}</svg>`,
  );
  if ((svg.match(/<[a-z]/g)?.length ?? 0) > LIMITS.svgElements)
    throw new RangeError();
  return { imageUri: dataUri(svg), animated, diagnostics };
}
