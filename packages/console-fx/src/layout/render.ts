import type { CompileOptions, Diagnostic, SceneV1 } from "../model/types.js";
import { LIMITS } from "../model/limits.js";
import { fail } from "../validation/index.js";
import { renderSvg, type SvgResult } from "../renderers/svg.js";
import { planSvgLayout } from "./planner.js";
import { svgNumber } from "../renderers/svg-values.js";
import { presentationDescriptor } from "../presentations/catalog.js";

export function renderWithLayout(
  scene: SceneV1,
  motion: boolean,
  options: CompileOptions,
): SvgResult {
  const plan = options.layout
    ? planSvgLayout(scene, options.layout, options)
    : undefined;
  const output = renderSvg(scene, motion, plan);
  const width = plan?.report.artboard.width ?? scene.surface.width;
  const height = plan?.report.artboard.height ?? scene.surface.height;
  const sizing = options.sizing;
  const diagnostics: Diagnostic[] = [
    ...output.diagnostics,
    ...(plan?.report.diagnostics ?? []),
  ];
  if (sizing?.mode === "container-experimental") {
    if (sizing.maxWidth > width)
      fail(
        "unsupported-layout",
        "Container maximum width cannot exceed the image artboard.",
        ["sizing"],
      );
    const ratio = height / width,
      fraction = sizing.fillFraction ?? 0.96;
    if (sizing.maxWidth * ratio > LIMITS.svgHeight)
      fail(
        "invalid-options",
        "Proportional display height exceeds 400 pixels.",
        ["sizing"],
      );
    diagnostics.push(
      {
        code: "experimental-container-sizing",
        severity: "warning",
        path: ["sizing"],
        message:
          "Container sizing is experimental and requires qualification in the receiving DevTools.",
      },
      {
        code: "display-readability-unknown",
        severity: "warning",
        path: ["sizing"],
        message:
          "Actual display width and image-text readability are unknown. The complete native caption remains available.",
      },
    );
    return {
      ...output,
      diagnostics,
      width: sizing.maxWidth,
      height: sizing.maxWidth * ratio,
      carrierPadding: `min(${svgNumber((sizing.maxWidth * ratio) / 2)}px, ${svgNumber(50 * fraction * ratio)}%) min(${svgNumber(sizing.maxWidth / 2)}px, ${svgNumber(50 * fraction)}%)`,
      sizing: {
        mode: sizing.mode,
        artboard: { width, height },
        resolvedDisplayWidth: null,
        resolvedDisplayHeight: null,
        displayScale: null,
        displayReadability: "unknown",
      },
      ...(plan ? { layout: plan.report } : {}),
    };
  }
  const displayWidth = sizing?.width ?? width,
    displayHeight = (displayWidth * height) / width;
  if (sizing && !plan) {
    const descriptor = scene.presentation
      ? presentationDescriptor(scene.presentation.profile)
      : undefined;
    const scale =
      (displayWidth / width) *
      (descriptor
        ? Math.min(
            (width - 2 * scene.surface.padding) / 720,
            (height - 2 * scene.surface.padding) / 240,
          )
        : 1);
    const runs = descriptor
      ? descriptor.slots.map((s) => scene.lines[s.line]!.runs[s.run]!)
      : scene.lines.flatMap((l) => l.runs);
    if (
      runs.some(
        (r) =>
          r.text &&
          r.style.fontSize * scale <
            (descriptor?.group === "Useful" && r.style.fontSize >= 14 ? 12 : 8),
      )
    )
      fail(
        "below-readable-size",
        "Fixed display sizing would violate the default readable font floor. Choose a larger width, explicit fitting or plain text.",
        ["sizing"],
      );
  }
  if (displayHeight > LIMITS.svgHeight)
    fail("invalid-options", "Proportional display height exceeds 400 pixels.", [
      "sizing",
    ]);
  return {
    ...output,
    width: displayWidth,
    height: displayHeight,
    diagnostics,
    ...(plan ? { layout: plan.report } : {}),
    ...(sizing || plan
      ? {
          sizing: {
            mode: "fixed" as const,
            artboard: { width, height },
            resolvedDisplayWidth: displayWidth,
            resolvedDisplayHeight: displayHeight,
            displayScale: displayWidth / width,
            displayReadability: plan
              ? ("meets-requested-floor" as const)
              : ("meets-default-floor" as const),
          },
        }
      : {}),
  };
}
