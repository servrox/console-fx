import type { TextRun } from "../../model/types.js";
import { GLYPHS } from "./glyphs.js";
import { PROFILES, type CinematicEffect } from "./profiles.js";

export function cinematicEffect(run: TextRun): CinematicEffect | undefined {
  return run.effects.find(
    (effect): effect is CinematicEffect => effect.kind === "cinematicMetal",
  );
}

export function cinematicLayout(run: TextRun, effect: CinematicEffect) {
  const profile = PROFILES[effect.profile];
  const display = profile.angular
    ? run.text.replace(/[a-z]/g, (c) => c.toUpperCase())
    : run.text;
  const empty = !display.trim();
  const letters = empty ? [] : [...display];
  const scale = run.style.fontSize / 100;
  let cursor = 0;
  let inkRight = 0;
  const advances = letters.map((letter) => {
    const advance = profile.angular
      ? GLYPHS[letter]![0] * scale
      : run.style.fontSize *
        (/[\silI1.,']/u.test(letter)
          ? 0.32
          : /[MW@]/u.test(letter)
            ? 0.92
            : 0.65);
    inkRight = Math.max(
      inkRight,
      cursor + (profile.angular ? GLYPHS[letter]![2] * scale : advance),
    );
    cursor += advance + run.style.letterSpacing;
    return advance;
  });
  const faceWidth =
    Math.max(
      0,
      inkRight,
      cursor - (letters.length ? run.style.letterSpacing : 0),
    ) * profile.xScale;
  const faceHeight = run.style.fontSize * profile.yScale;
  const blur = effect.glow * 6;
  const guard = 3 + blur * 3;
  const depth = Math.floor(effect.depth);
  const side = effect.ornaments
    ? faceWidth * (profile.ornament === "spires" ? 0.07 : 0.03)
    : 0;
  const above =
    effect.ornaments && profile.ornament === "spires" ? faceHeight * 0.12 : 0;
  const below = effect.ornaments
    ? faceHeight * (profile.ornament === "sweep" ? 0.24 : 0.16)
    : 0;
  const overhang = profile.angular
    ? 0
    : run.style.fontSize * (profile.italic ? 0.25 : 0.08);
  const insetX = guard + side + overhang;
  const ascent = faceHeight + above + guard;
  const descent =
    run.style.fontSize * (profile.angular ? 0 : 0.25) + below + depth + guard;
  return {
    letters,
    advances,
    faceWidth,
    faceHeight,
    blur,
    depth,
    guard,
    insetX,
    width: empty ? 0 : faceWidth + insetX * 2 + depth,
    ascent: empty ? 0 : ascent,
    descent: empty ? 0 : descent,
    empty,
  };
}
export type CinematicLayout = ReturnType<typeof cinematicLayout>;

/** Count bounded instances before geometry or SVG strings are allocated. */
export function cinematicElementBound(
  run: TextRun,
  effect: CinematicEffect,
): number {
  if (!run.text.trim()) return 0;
  const profile = PROFILES[effect.profile];
  const visible = [...run.text.toUpperCase()].filter((c) => c !== " ");
  const letters = profile.angular ? visible.length + new Set(visible).size : 1;
  return (
    letters +
    Math.floor(effect.depth) +
    6 +
    profile.stops.length +
    (effect.glow > 0 ? 3 : 0) +
    (effect.ornaments ? 2 : 0)
  );
}
