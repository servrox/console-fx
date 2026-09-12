import type { EffectDescriptor, EffectKind } from "../model/types.js";
import { deepFreeze } from "../model/limits.js";

// Every built-in is run-scoped. Keep shared capability fields in one place.
function descriptor(
  kind: EffectKind,
  displayName: string,
  family: string,
  parameters: EffectDescriptor["parameters"],
  css: boolean,
  motion: EffectDescriptor["motion"],
): EffectDescriptor {
  return {
    kind,
    displayName,
    family,
    scopes: ["run"],
    parameters,
    renderers: css ? ["css", "svg"] : ["svg"],
    motion,
  };
}
const descriptors: readonly EffectDescriptor[] = deepFreeze([
  descriptor(
    "badge",
    "Badge",
    "background",
    { color: { type: "color", default: "#22d3ee" } },
    true,
    "static",
  ),
  descriptor(
    "neon",
    "Neon",
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
    "RGB split",
    "shadow",
    { offset: { type: "number", default: 3, min: 1, max: 8, step: 1 } },
    true,
    "static",
  ),
  descriptor(
    "extruded",
    "Extruded text",
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
    "Holographic",
    "fill",
    { intensity: { type: "number", default: 0.7, min: 0, max: 1, step: 0.1 } },
    false,
    "static",
  ),
  descriptor(
    "metallic",
    "Gold / chrome",
    "fill",
    { variant: { type: "enum", default: "gold", values: ["gold", "chrome"] } },
    false,
    "static",
  ),
  descriptor(
    "cinematicMetal",
    "Cinematic Metal",
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
    "CRT",
    "fill",
    { intensity: { type: "number", default: 0.6, min: 0, max: 1, step: 0.1 } },
    false,
    "static",
  ),
  descriptor(
    "rainbow",
    "Rainbow",
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
    "Glow pulse",
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
    "Gradient drift",
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
    "Gentle wave",
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
    "Decorative moving indicator",
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
export function getEffectDescriptors(): readonly EffectDescriptor[] {
  return descriptors;
}
export function effectDescriptor(kind: string): EffectDescriptor | undefined {
  return descriptors.find((descriptor) => descriptor.kind === kind);
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
