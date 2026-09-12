import type { PaintBounds } from "../model/layout.js";
import type { TextRun } from "../model/types.js";
import type { FontMetric } from "./metrics.js";

export function union(bounds: readonly PaintBounds[]): PaintBounds {
  if (!bounds.length) return { x: 0, y: 0, width: 0, height: 0 };
  const x = Math.min(...bounds.map((b) => b.x)),
    y = Math.min(...bounds.map((b) => b.y));
  return {
    x,
    y,
    width: Math.max(...bounds.map((b) => b.x + b.width)) - x,
    height: Math.max(...bounds.map((b) => b.y + b.height)) - y,
  };
}
export const translate = (
  b: PaintBounds,
  x: number,
  y: number,
): PaintBounds => ({ ...b, x: b.x + x, y: b.y + y });
export const expand = (b: PaintBounds, x: number, y = x): PaintBounds => ({
  x: b.x - x,
  y: b.y - y,
  width: b.width + 2 * x,
  height: b.height + 2 * y,
});
export function runBounds(
  run: TextRun,
  metrics: FontMetric,
  allowMotion: boolean,
  rowSize = run.style.fontSize,
) {
  const ink = {
    x: -metrics.inkLeft,
    y: -metrics.ascent,
    width: metrics.inkLeft + metrics.inkRight,
    height: metrics.ascent + metrics.descent,
  };
  let paint = ink;
  for (const effect of run.effects) {
    switch (effect.kind) {
      case "badge":
        paint = union([
          paint,
          {
            x: -10,
            y: -rowSize - 3,
            width: metrics.advance + 20,
            height: rowSize * 1.4,
          },
        ]);
        break;
      case "neon":
        paint = expand(paint, 3 * (1 + effect.intensity * 3));
        break;
      case "rgbSplit":
        paint = expand(paint, effect.offset, 0);
        break;
      case "extruded":
        paint = union([
          paint,
          translate(ink, Math.floor(effect.depth), Math.floor(effect.depth)),
        ]);
        break;
      case "holographic":
        paint = union([paint, translate(ink, -1, -1)]);
        break;
      case "metallic":
        paint = union([paint, translate(ink, 2, 2)]);
        break;
      case "crt":
        paint = union([
          paint,
          { x: 0, y: -rowSize, width: metrics.advance, height: rowSize * 1.3 },
        ]);
        break;
    }
  }
  if (allowMotion) {
    const motion = run.effects.find((e) =>
      ["wave", "indicator"].includes(e.kind),
    );
    if (motion?.kind === "wave") paint = expand(paint, 0, motion.amplitude);
    if (motion?.kind === "indicator")
      paint = union([
        paint,
        {
          x: -0.5,
          y: 7.5,
          width: Math.max(14, metrics.advance) + 1,
          height: 4,
        },
      ]);
  }
  // Fixed SVG text / geometry antialiasing allowance; Gaussian extent is 3 sigma.
  return { ink, paint: expand(paint, 0.5) };
}
