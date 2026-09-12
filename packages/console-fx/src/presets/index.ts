import { defineScene } from "../validation/index.js";
import { deepFreeze } from "../model/limits.js";
import type { EffectInput, SceneV1 } from "../model/types.js";

export type PresetId =
  | "badge"
  | "neon"
  | "rgbSplit"
  | "extruded"
  | "holographic"
  | "gold"
  | "chrome"
  | "crt"
  | "rainbow";
export type MotionId =
  "none" | "glowPulse" | "gradientDrift" | "wave" | "indicator";
export interface PresetOptions {
  readonly text?: string;
  readonly color?: string;
  readonly motion?: MotionId;
}
export const PRESETS = deepFreeze([
  {
    id: "badge",
    name: "Badge",
    description: "A small message with presence.",
    renderer: "css",
  },
  {
    id: "neon",
    name: "Neon",
    description: "A crisp line with a soft glow.",
    renderer: "css",
  },
  {
    id: "rgbSplit",
    name: "RGB split",
    description: "Three channels, slightly apart.",
    renderer: "css",
  },
  {
    id: "extruded",
    name: "Extruded text",
    description: "A little depth goes a long way.",
    renderer: "css",
  },
  {
    id: "holographic",
    name: "Holographic",
    description: "Iridescent color, held in light.",
    renderer: "svg",
  },
  {
    id: "gold",
    name: "Gold",
    description: "Warm metal and sharp highlights.",
    renderer: "svg",
  },
  {
    id: "chrome",
    name: "Chrome",
    description: "Cool reflections, polished edges.",
    renderer: "svg",
  },
  {
    id: "crt",
    name: "CRT",
    description: "A quiet nod to the phosphor screen.",
    renderer: "svg",
  },
  {
    id: "rainbow",
    name: "Rainbow",
    description: "The whole spectrum in one line.",
    renderer: "svg",
  },
] as const);

function create(effect: EffectInput, options: PresetOptions = {}): SceneV1 {
  const text = options.text ?? "Hello, developer.";
  const effects: EffectInput[] = [effect];
  if (options.motion && options.motion !== "none")
    effects.push({ kind: options.motion });
  return defineScene({
    schemaVersion: 1,
    label: text,
    surface: {
      width: 600,
      height: 180,
      background: "#0c1117",
      padding: 34,
      borderRadius: 16,
    },
    lines: [
      {
        align: "center",
        runs: [
          {
            text,
            style: {
              color: options.color ?? "#e8f3f5",
              fontFamily: "mono",
              fontSize: 42,
              fontWeight: 700,
            },
            effects,
          },
        ],
      },
    ],
    motion: { durationMs: 4800, finish: "freeze" },
  });
}
export function badge(options: PresetOptions = {}): SceneV1 {
  return create({ kind: "badge", color: options.color ?? "#22d3ee" }, options);
}
export function neon(options: PresetOptions = {}): SceneV1 {
  return create({ kind: "neon", color: options.color ?? "#22d3ee" }, options);
}
export function rgbSplit(options: PresetOptions = {}): SceneV1 {
  return create({ kind: "rgbSplit" }, options);
}
export function extruded(options: PresetOptions = {}): SceneV1 {
  return create(
    { kind: "extruded", color: options.color ?? "#168da5" },
    options,
  );
}
export function holographic(options: PresetOptions = {}): SceneV1 {
  return create({ kind: "holographic" }, options);
}
export function gold(options: PresetOptions = {}): SceneV1 {
  return create({ kind: "metallic", variant: "gold" }, options);
}
export function chrome(options: PresetOptions = {}): SceneV1 {
  return create({ kind: "metallic", variant: "chrome" }, options);
}
export function crt(options: PresetOptions = {}): SceneV1 {
  return create({ kind: "crt" }, options);
}
export function rainbow(options: PresetOptions = {}): SceneV1 {
  return create({ kind: "rainbow" }, options);
}

export function preset(id: PresetId, options: PresetOptions = {}): SceneV1 {
  return {
    badge,
    neon,
    rgbSplit,
    extruded,
    holographic,
    gold,
    chrome,
    crt,
    rainbow,
  }[id](options);
}
