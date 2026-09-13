import { presentationDescriptor } from "../../presentations/catalog.js";
import type { SceneV1 } from "../../model/types.js";
import { escapeXml as xml, svgNumber } from "../svg-values.js";
import { CARD_FONT_STACKS as fonts } from "../../presentations/fonts.js";
import { textDirection } from "../../layout/metrics.js";
import type { SvgLayoutPlan } from "../../layout/planner.js";
import { compactArtwork } from "./compact-art.js";
import { rect, line, path, circle } from "./shapes.js";

export function renderPresentation(
  scene: SceneV1,
  plan?: SvgLayoutPlan,
): { svg: string; letterboxed: boolean } {
  const n = plan ? String : svgNumber;
  const presentation = scene.presentation!;
  const descriptor = presentationDescriptor(presentation.profile)!;
  const { width, height, padding, background, borderRadius } = scene.surface;
  const cardWidth = plan?.cardLayout?.width ?? 720;
  const cardHeight = plan?.cardLayout?.height ?? 240;
  const scaleX = (width - 2 * padding) / cardWidth;
  const scaleY = (height - 2 * padding) / cardHeight;
  const scale = Math.min(scaleX, scaleY);
  const accent = presentation.accent;
  const detailed = presentation.detail === "standard";
  const status = descriptor.status;
  const statusSlot = descriptor.slots.find((s) => s.id === status?.slot);
  const palette =
    status && statusSlot
      ? status.palettes[
          status.source === "tone" && presentation.profile === "requestTrace/v1"
            ? presentation.tone!
            : scene.lines[statusSlot.line]!.runs[statusSlot.run]!.text
        ]
      : undefined;
  let art = "";
  if (plan?.cardLayout?.compact) {
    art = compactArtwork(
      descriptor.id,
      background,
      accent,
      cardHeight,
      detailed,
      palette,
      descriptor.id === "buildReceipt" ? scene.lines[1]!.runs[2]!.text : "",
    );
  } else if (descriptor.id === "buildReceipt") {
    const status = scene.lines[1]!.runs[2]!.text;
    art =
      rect(0, 0, 720, 240, background, borderRadius) +
      rect(4, 4, 712, 232, "#efeee5", 9) +
      rect(4, 14, 5, 212, accent, 2) +
      line(32, 108, 677, 108, "#9ba99f", 'stroke-dasharray="3 4"') +
      line(32, 187, 677, 187, "#9ba99f", 'stroke-dasharray="3 4"') +
      rect(540, 34, 123, 40, palette!.background, 7, palette!.stroke);
    art +=
      status === "PASSED"
        ? path("M551 52l5 5 8-11", "none", palette!.marker, 'stroke-width="2"')
        : status === "FAILED"
          ? path(
              "M552 47l10 12m0-12-10 12",
              "none",
              palette!.marker,
              'stroke-width="2"',
            )
          : path(
              "M557 44l7 15h-14Zm0 5v4m0 2v1",
              "none",
              palette!.marker,
              'stroke-width="1.5"',
            );
    art +=
      line(216, 126, 216, 168, "#d4d8cc") + line(417, 126, 417, 168, "#d4d8cc");
    if (detailed)
      for (let y = 12; y <= 216; y += 12)
        art += path(
          `M710 ${y}l10 6-10 6`,
          background,
          background,
          'stroke-width="1"',
        );
  } else if (descriptor.id === "letterpress") {
    art =
      rect(0, 0, 720, 240, background, borderRadius, "#d5d5c8") +
      rect(9, 9, 702, 222, "none", 8, "#f7f6ec") +
      line(36, 51, 684, 51, "#d4d5c7") +
      line(36, 53, 684, 53, "#f4f4e9") +
      rect(38, 182, 51, 3, accent);
    if (detailed)
      art +=
        '<circle cx="678" cy="213" r="5" fill="#d5d9cd" stroke="#f5f5ea"/>';
  } else if (descriptor.id === "requestTrace") {
    art =
      rect(0, 0, 720, 240, background, borderRadius, "#31414c") +
      rect(555, 13, 123, 29, palette!.background, 7) +
      line(32, 98, 686, 98, "#35434d") +
      line(62, 126, 616, 126, "#33434f", 'stroke-width="2"') +
      [62, 295, 540]
        .map((x) => circle(x, 126, 6, "#151f26", accent, 'stroke-width="2"'))
        .join("") +
      line(32, 202, 686, 202, "#303e47");
    if (detailed)
      art += path("M645 121l5 5-5 5", "none", "#627781", 'stroke-width="1.5"');
  } else if (descriptor.id === "serviceReady") {
    art =
      rect(0, 0, 720, 240, background, borderRadius, "#3c4a54") +
      rect(26, 23, 78, 92, "#111b22", 12, "#334650") +
      rect(42, 44, 45, 46, "#1a2b34", 7, "#588e98") +
      path("M51 57h26M51 68h17M51 79h26", "none", accent, 'stroke-width="2"') +
      rect(551, 24, 112, 34, palette!.background, 7) +
      circle(565, 41, 3, palette!.marker) +
      line(32, 142, 684, 142, "#3a4650") +
      line(262, 158, 262, 193, "#39454e") +
      line(499, 158, 499, 193, "#39454e") +
      line(32, 205, 684, 205, "#303e46");
  } else if (descriptor.id === "commandCard") {
    art =
      rect(0, 0, 720, 240, background, borderRadius, "#3c4952") +
      line(109, 48, 109, 105, "#3d5057") +
      rect(28, 126, 664, 64, "#101920", 8, "#374950") +
      line(31, 133, 31, 183, "#4eaaad", 'stroke-width="2"') +
      path("M45 149l8 7-8 7", "none", accent, 'stroke-width="2"');
    if (detailed)
      art += line(630, 163, 645, 163, "#5a747e", 'stroke-width="2"');
  } else if (descriptor.id === "releaseBulletin") {
    art =
      rect(0, 0, 720, 240, background, borderRadius, "#ced3c7") +
      line(32, 50, 688, 50, "#bbc8bd") +
      rect(589, 14, 98, 29, "#d7e3d7", 4) +
      circle(37, 151, 2, "#38816e") +
      circle(337, 151, 2, "#38816e") +
      line(32, 184, 688, 184, "#becac0") +
      rect(32, 180, 62, 4, accent);
    if (detailed) art += line(32, 58, 688, 58, "#dee2d6");
  } else if (descriptor.id === "blueprint") {
    art = rect(0, 0, 720, 240, background, borderRadius, "#3b5660");
    if (detailed)
      art +=
        `<defs><pattern id="card-grid" width="24" height="24" patternUnits="userSpaceOnUse">${path("M24 0H0V24", "none", "#24424c", 'stroke-width="0.6"')}</pattern></defs>` +
        rect(12, 12, 216, 216, "url(#card-grid)", 6);
    art +=
      path(
        "M58 96l62-35 64 35v73l-64 36-62-36ZM58 96l62 36 64-36M120 132v73M120 61v71",
        "none",
        accent,
        'stroke-width="1.4"',
      ) +
      path(
        "M58 169l62-37 64 37",
        "none",
        "#72939e",
        'stroke-width="0.8" stroke-dasharray="4 4"',
      );
    if (detailed)
      art +=
        line(48, 53, 48, 209, "#638b99", 'stroke-width="0.8"') +
        line(42, 61, 54, 61, "#86a9b4") +
        line(42, 205, 54, 205, "#86a9b4") +
        line(66, 224, 176, 224, "#638b99", 'stroke-width="0.8"') +
        line(63, 220, 70, 228, "#86a9b4") +
        line(172, 220, 180, 228, "#86a9b4");
    art +=
      circle(120, 132, 6, background, "#c1e0e3") +
      line(248, 166, 675, 166, "#395563") +
      rect(249, 181, 30, 3, "#6cbabf");
  } else if (descriptor.id === "contourMap") {
    art = rect(0, 0, 720, 240, background, borderRadius, "#3b5149");
    // Fourteen authored curves at most, independent of input text or time.
    for (let i = 0; i < 14; i++) {
      if (!detailed && i !== 3 && i % 3 !== 0) continue;
      const x = 498 + 13 * i;
      art += path(
        `M${x} 0C${x - 35} 41 ${x + 88} 61 ${x + 52} 111S${x - 49} 183 ${x} 240`,
        "none",
        i === 3 ? accent : "#345448",
        `stroke-width="${i === 3 ? 1.5 : 0.8}"`,
      );
    }
    art += rect(30, 181, 38, 2, "#6cc4ac");
    if (detailed)
      art +=
        circle(596, 160, 4, background, "#9ecfb9", 'stroke-width="1.2"') +
        line(586, 160, 606, 160, "#89b9a7", 'stroke-width="0.6"') +
        line(596, 150, 596, 170, "#89b9a7", 'stroke-width="0.6"');
  } else if (descriptor.id === "signalHalftone") {
    art =
      rect(0, 0, 720, 240, background, borderRadius, "#d6d2c1") +
      circle(114, 123, 79, "#386c60");
    if (detailed)
      art +=
        `<defs><pattern id="card-dots" width="6" height="6" patternUnits="userSpaceOnUse">${circle(2.7, 2.7, 1.65, accent)}</pattern></defs>` +
        circle(151, 117, 84, "url(#card-dots)");
    art +=
      path("M28 204h190M244 24v192", "none", "#b5bbab", 'stroke-width="0.8"') +
      line(271, 195, 678, 195, "#ccd0be");
  } else if (descriptor.id === "orbital") {
    art =
      rect(0, 0, 720, 240, background, borderRadius, "#344551") +
      circle(128, 126, 77, "none", "#354d5b");
    if (detailed)
      art +=
        circle(128, 126, 57, "none", "#405e6b") +
        circle(128, 126, 33, "none", "#506d77");
    art +=
      '<ellipse cx="128" cy="126" rx="107" ry="32" fill="none" stroke="#62888f" stroke-width="1.1" transform="rotate(-32 128 126)"/>' +
      path("M87 61A77 77 0 0 1 178 68", "none", accent, 'stroke-width="2"') +
      circle(207, 80, 5, "#deb578") +
      circle(128, 126, 3, "#a0c3c8") +
      line(128, 113, 128, 139, "#668895", 'stroke-width="0.8"') +
      line(115, 126, 141, 126, "#668895", 'stroke-width="0.8"') +
      line(264, 174, 681, 174, "#31434f");
  }
  const texts = (
    plan?.cardTexts ??
    descriptor.slots.map((slot) => ({
      slot,
      text: scene.lines[slot.line]!.runs[slot.run]!.text,
      baseline: slot.y,
    }))
  )
    .map(({ slot, text: value, baseline }) => {
      const run = scene.lines[slot.line]!.runs[slot.run]!;
      const direction = plan ? textDirection(value) : undefined;
      const anchor =
        direction === "rtl"
          ? slot.anchor === "start"
            ? "end"
            : slot.anchor === "middle"
              ? "middle"
              : "start"
          : slot.anchor;
      const text = (x: number, y: number, color: string, decoration = false) =>
        `<text ${decoration ? 'aria-hidden="true"' : `data-slot="${slot.id}"`} x="${x}" y="${y}" fill="${color}" font-size="${run.style.fontSize}" font-family="${fonts[run.style.fontFamily]}" font-weight="${run.style.fontWeight}" letter-spacing="${run.style.letterSpacing}" text-anchor="${anchor}" xml:space="preserve"${direction ? ` direction="${direction}"` : ""}>${xml(value)}</text>`;
      return (
        (descriptor.id === "letterpress" && slot.id === "title"
          ? text(
              plan?.cardLayout?.compact ? slot.x - 0.2 : 35.8,
              baseline + 1.3,
              "#faf9ef",
              true,
            )
          : "") + text(slot.x, baseline, run.style.color)
      );
    })
    .join("");
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${rect(0, 0, width, height, background, borderRadius)}<g transform="translate(${n((width - cardWidth * scale) / 2)} ${n((height - cardHeight * scale) / 2)}) scale(${n(scale)})">${art}${texts}</g></svg>`,
    letterboxed: Math.abs(scaleX - scaleY) > 1e-9,
  };
}
