import type { TextRun } from "../../model/types.js";
import { GLYPHS } from "./glyphs.js";
import { PROFILES, type CinematicEffect } from "./profiles.js";
import type { CinematicLayout } from "./layout.js";

import { escapeXml as xml, svgNumber as n } from "../svg-values.js";

export function renderCinematic(
  run: TextRun,
  effect: CinematicEffect,
  layout: CinematicLayout,
  id: string,
  x: number,
  baseline: number,
  fontStack: string,
) {
  if (layout.empty) return { definitions: "", markup: "" };
  const profile = PROFILES[effect.profile];
  const { faceWidth: w, faceHeight: h, depth, blur } = layout;
  const originX = x + layout.insetX;
  const originY = baseline - h;
  const glyphDefinitions: string[] = [];
  let letters = "";
  if (profile.angular) {
    for (const c of new Set(layout.letters)) {
      if (GLYPHS[c]![1])
        glyphDefinitions.push(
          `<path id="${id}-g${c.codePointAt(0)}" d="${GLYPHS[c]![1]}"/>`,
        );
    }
    let advance = 0;
    layout.letters.forEach((c, index) => {
      if (GLYPHS[c]![1])
        letters += `<use href="#${id}-g${c.codePointAt(0)}" transform="translate(${n(advance)} 0) scale(${n(run.style.fontSize / 100)})"/>`;
      advance += layout.advances[index]! + run.style.letterSpacing;
    });
  } else {
    letters = `<text x="${n(w / profile.xScale / 2)}" text-anchor="middle" y="${run.style.fontSize}" font-family="${fontStack}" font-size="${run.style.fontSize}" font-weight="${run.style.fontWeight}" font-style="${profile.italic ? "italic" : "normal"}" letter-spacing="${run.style.letterSpacing}" xml:space="preserve" transform="scale(${profile.xScale} ${profile.yScale})">${xml(run.text)}</text>`;
  }
  const use = (fill: string, extra = "") =>
    `<use href="#${id}-face" fill="${fill}" ${extra}/>`;
  let ornament = "";
  if (effect.ornaments) {
    ornament = `<path d="${profile.ornamentPath}" transform="scale(${n(w / 100)} ${n(h / 100)})" vector-effect="non-scaling-stroke"/>`;
    ornament = `<g fill="url(#${id}-metal)" stroke="${effect.color}" stroke-width=".8">${ornament}</g>`;
  }
  let markup = ornament;
  if (blur > 0)
    markup += use(
      effect.color,
      `filter="url(#${id}-bloom)" opacity="${n(effect.glow * 0.7)}" stroke="${effect.color}" stroke-width="3"`,
    );
  for (let layer = depth; layer > 0; layer--)
    markup += use(
      profile.shadow,
      `transform="translate(${layer} ${layer})" stroke="${profile.edge}" stroke-width="1"`,
    );
  markup += use(profile.edge, 'stroke="' + profile.edge + '" stroke-width="4"');
  markup += use(
    `url(#${id}-metal)`,
    `stroke="${effect.color}" stroke-width="1.5"`,
  );
  markup += use(
    "none",
    'stroke="#ffffff" stroke-width=".5" opacity=".65" transform="translate(0 -.6)"',
  );
  const filter =
    blur > 0
      ? `<filter id="${id}-bloom" filterUnits="userSpaceOnUse" x="${n(-layout.insetX)}" y="${n(h - layout.ascent)}" width="${n(layout.width)}" height="${n(layout.ascent + layout.descent)}"><feGaussianBlur stdDeviation="${n(blur)}"/></filter>`
      : "";
  return {
    definitions: `${glyphDefinitions.join("")}<g id="${id}-face" fill-rule="evenodd" stroke-linejoin="bevel">${letters}</g><linearGradient id="${id}-metal" x1="0" y1="0" x2="0" y2="1">${profile.stops.map(([offset, color]) => `<stop offset="${offset}" stop-color="${color}"/>`).join("")}</linearGradient>${filter}`,
    markup: `<g transform="translate(${n(originX)} ${n(originY)})">${markup}</g>`,
  };
}
