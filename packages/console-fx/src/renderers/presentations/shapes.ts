// Numeric authored geometry and validated palette values only.
export const rect = (
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  radius = 0,
  stroke = "none",
) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" rx="${radius}" stroke="${stroke}"/>`;
export const line = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  extra = "",
) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" ${extra}/>`;
export const path = (d: string, fill: string, stroke: string, extra = "") =>
  `<path d="${d}" fill="${fill}" stroke="${stroke}" ${extra}/>`;
export const circle = (
  x: number,
  y: number,
  r: number,
  fill: string,
  stroke = "none",
  extra = "",
) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" ${extra}/>`;
