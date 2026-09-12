import type { CardPresetId, PresentationStatus } from "../../model/types.js";
import { rect as r, circle as c, path } from "./shapes.js";
const p = (d: string, stroke: string, extra = "") =>
  path(d, "none", stroke, extra);
// Accepted original compact artwork. Geometry is immutable under fit/v1.
export function compactArtwork(
  id: CardPresetId,
  bg: string,
  accent: string,
  height: number,
  detailed: boolean,
  palette: PresentationStatus["palettes"][string] | undefined,
  status: string,
): string {
  let value = r(0, 0, 360, height, bg, 12);
  if (id === "buildReceipt")
    value +=
      r(4, 4, 352, height - 8, "#efeee5", 9) +
      r(4, 15, 4, height - 30, accent, 2) +
      r(238, 54, 88, 32, palette!.background, 6, palette!.stroke) +
      p("M24 104H336M24 220H336", "#9ba99f", 'stroke-dasharray="3 4"') +
      p(
        status === "PASSED"
          ? "M245 69l4 4 6-8"
          : status === "FAILED"
            ? "M244 64l10 12m0-12-10 12"
            : "M249 63l6 12h-12Zm0 4v3m0 2v1",
        palette!.marker,
        'stroke-width="1.5"',
      ) +
      [...Array(detailed ? 22 : 0)]
        .map((_, i) => p(`M354 ${12 + i * 12}l6 6-6 6`, bg))
        .join("");
  else if (id === "requestTrace")
    value +=
      r(246, 16, 88, 26, palette!.background, 6) +
      p("M24 96H336M24 242H336", "#35434d") +
      p("M32 121V209", "#33434f", 'stroke-width="2"') +
      [121, 165, 209]
        .map((y) => c(32, y, 5, bg, accent, 'stroke-width="2"'))
        .join("");
  else if (id === "serviceReady")
    value +=
      r(249, 15, 88, 28, palette!.background, 6) +
      c(260, 28, 2.5, palette!.marker) +
      p("M24 137H336M24 271H336", "#3a4650") +
      p("M144 150v107", "#39454e");
  else if (id === "commandCard")
    value +=
      r(24, 156, 312, 64, "#101920", 8, "#374950") +
      p("M27 163v50", "#4eaaad", 'stroke-width="2"') +
      p("M34 181l6 7-6 7", accent, 'stroke-width="2"');
  else if (id === "releaseBulletin")
    value +=
      r(270, 17, 67, 25, "#d7e3d7", 4) +
      p("M24 52H336M24 216H336", "#becac0") +
      r(24, 212, 54, 4, accent) +
      c(27, 146, 2, "#38816e") +
      c(27, 181, 2, "#38816e");
  else if (id === "blueprint")
    value +=
      p(
        "M50 74l37-21 39 21v45l-39 22-37-22ZM50 74l37 22 39-22M87 96v45M87 53v43",
        accent,
        'stroke-width="1.4"',
      ) +
      p("M50 119l37-23 39 23", "#72939e", 'stroke-dasharray="3 3"') +
      p("M37 52v90M32 54h10M32 141h10M24 256H336", "#638b99") +
      c(87, 96, 4, bg, "#c1e0e3") +
      r(24, 253, 28, 3, accent);
  else if (id === "contourMap")
    value +=
      Array.from({ length: detailed ? 5 : 2 }, (_, i) =>
        p(
          `M${220 + i * 18} 48c-12 9 26 12 18 26s-30 13-9 21`,
          i === 2 ? accent : "#345448",
          'stroke-width="1.1"',
        ),
      ).join("") + r(24, 202, 38, 2, "#6cc4ac");
  else if (id === "letterpress")
    value +=
      r(8, 8, 344, height - 16, "none", 8, "#f7f6ec") +
      p("M24 53H336", "#d4d5c7") +
      p("M24 55H336", "#f4f4e9") +
      r(24, 201, 51, 3, accent) +
      (detailed ? c(329, 238, 4, "#d5d9cd", "#f5f5ea") : "");
  else if (id === "signalHalftone")
    value +=
      c(271, 76, 25, "#386c60") +
      `<defs><pattern id="compact-dots" width="6" height="6" patternUnits="userSpaceOnUse">${c(2.7, 2.7, 1.65, accent)}</pattern></defs>` +
      (detailed ? c(300, 69, 29, "url(#compact-dots)") : "") +
      p("M24 254H336", "#ccd0be");
  else if (id === "orbital")
    value +=
      c(84, 77, 42, "none", "#354d5b") +
      (detailed ? c(84, 77, 27, "none", "#405e6b") : "") +
      `<ellipse cx="84" cy="77" rx="60" ry="18" fill="none" stroke="#62888f" transform="rotate(-32 84 77)"/>` +
      p("M61 41A42 42 0 0 1 111 43", accent, 'stroke-width="2"') +
      c(129, 51, 4, "#deb578") +
      c(84, 77, 2, "#a0c3c8") +
      p("M24 267H336", "#31434f");
  return value;
}
