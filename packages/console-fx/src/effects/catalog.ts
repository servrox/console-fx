import type { EffectDescriptor, EffectKind } from "../model/types.js";
import { deepFreeze } from "../model/limits.js";

type RuntimeEffect = Omit<EffectDescriptor, "displayName" | "scopes">;

// Every built-in is run-scoped. Keep shared capability fields in one place.
function descriptor(
  kind: EffectKind,
  family: string,
  parameters: EffectDescriptor["parameters"],
  css: boolean,
  motion: EffectDescriptor["motion"],
): RuntimeEffect {
  return {
    kind,
    family,
    parameters,
    renderers: css ? ["css", "svg"] : ["svg"],
    motion,
  };
}
const runtime: readonly RuntimeEffect[] = deepFreeze([
  descriptor(
    "badge",
    "background",
    { color: { type: "color", default: "#22d3ee" } },
    true,
    "static",
  ),
  descriptor(
    "neon",
    "glow",
    {
      color: { type: "color", default: "#22d3ee" },
      intensity: { type: "number", default: 0.7, min: 0, max: 1, step: 0.1 },
    },
    true,
    "static",
  ),
  descriptor(
    "rgbSplit",
    "shadow",
    { offset: { type: "number", default: 3, min: 1, max: 8, step: 1 } },
    true,
    "static",
  ),
  descriptor(
    "extruded",
    "shadow",
    {
      depth: { type: "number", default: 6, min: 1, max: 12, step: 1 },
      color: { type: "color", default: "#168da5" },
    },
    true,
    "static",
  ),
  descriptor(
    "holographic",
    "fill",
    { intensity: { type: "number", default: 0.7, min: 0, max: 1, step: 0.1 } },
    false,
    "static",
  ),
  descriptor(
    "metallic",
    "fill",
    { variant: { type: "enum", default: "gold", values: ["gold", "chrome"] } },
    false,
    "static",
  ),
  descriptor(
    "cinematicMetal",
    "fill",
    {
      profile: {
        type: "enum",
        default: "lightning-metal-v1",
        values: [
          "lightning-metal-v1",
          "ice-cathedral-v1",
          "liquid-chrome-v1",
          "molten-gold-v1",
        ],
      },
      color: { type: "color", default: "#69dcff" },
      depth: { type: "number", default: 7, min: 0, max: 10, step: 1 },
      glow: { type: "number", default: 0.25, min: 0, max: 1, step: 0.05 },
      ornaments: { type: "boolean", default: true },
    },
    false,
    "static",
  ),
  descriptor(
    "crt",
    "fill",
    { intensity: { type: "number", default: 0.6, min: 0, max: 1, step: 0.1 } },
    false,
    "static",
  ),
  descriptor(
    "rainbow",
    "fill",
    {
      saturation: {
        type: "number",
        default: 0.85,
        min: 0.2,
        max: 1,
        step: 0.05,
      },
    },
    false,
    "static",
  ),
  descriptor(
    "glowPulse",
    "motion",
    {
      periodMs: {
        type: "number",
        default: 2400,
        min: 1000,
        max: 5000,
        step: 100,
      },
      intensity: {
        type: "number",
        default: 0.6,
        min: 0.1,
        max: 0.8,
        step: 0.1,
      },
    },
    false,
    "decorative",
  ),
  descriptor(
    "gradientDrift",
    "motion",
    {
      periodMs: {
        type: "number",
        default: 2400,
        min: 1000,
        max: 5000,
        step: 100,
      },
      distance: { type: "number", default: 30, min: 5, max: 50, step: 1 },
    },
    false,
    "decorative",
  ),
  descriptor(
    "wave",
    "motion",
    {
      amplitude: { type: "number", default: 5, min: 1, max: 10, step: 1 },
      periodMs: {
        type: "number",
        default: 2400,
        min: 1000,
        max: 5000,
        step: 100,
      },
    },
    false,
    "decorative",
  ),
  descriptor(
    "indicator",
    "motion",
    {
      color: { type: "color", default: "#22d3ee" },
      periodMs: {
        type: "number",
        default: 2400,
        min: 1000,
        max: 5000,
        step: 100,
      },
    },
    false,
    "decorative",
  ),
]);
const names: Readonly<Record<EffectKind, string>> = {
  badge: "Badge",
  neon: "Neon",
  rgbSplit: "RGB split",
  extruded: "Extruded text",
  holographic: "Holographic",
  metallic: "Gold / chrome",
  cinematicMetal: "Cinematic Metal",
  crt: "CRT",
  rainbow: "Rainbow",
  glowPulse: "Glow pulse",
  gradientDrift: "Gradient drift",
  wave: "Gentle wave",
  indicator: "Decorative moving indicator",
};
let descriptors: readonly EffectDescriptor[] | undefined;
export function getEffectDescriptors(): readonly EffectDescriptor[] {
  return (descriptors ??= deepFreeze(
    runtime.map(({ kind, family, parameters, renderers, motion }) => ({
      kind,
      displayName: names[kind],
      family,
      scopes: ["run"],
      parameters,
      renderers,
      motion,
    })),
  ));
}
export function effectDescriptor(kind: string): RuntimeEffect | undefined {
  return runtime.find((descriptor) => descriptor.kind === kind);
}
export const EFFECT_ORDER: readonly EffectKind[] = [
  "badge",
  "holographic",
  "metallic",
  "cinematicMetal",
  "crt",
  "rainbow",
  "rgbSplit",
  "extruded",
  "neon",
  "glowPulse",
  "gradientDrift",
  "wave",
  "indicator",
];
