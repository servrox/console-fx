import type {
  EffectDescriptor,
  EffectKind,
  ParameterDescriptor,
} from "../model/types.js";
import { deepFreeze } from "../model/limits.js";

const number = (
  value: number,
  min: number,
  max: number,
  step = 0.1,
): ParameterDescriptor => ({ type: "number", default: value, min, max, step });
const color = (value: string): ParameterDescriptor => ({
  type: "color",
  default: value,
});
const period = number(2400, 1000, 5000, 100);

const descriptors: readonly EffectDescriptor[] = deepFreeze([
  {
    kind: "badge",
    displayName: "Badge",
    family: "background",
    scopes: ["run"],
    parameters: { color: color("#22d3ee") },
    renderers: ["css", "svg"],
    motion: "static",
  },
  {
    kind: "neon",
    displayName: "Neon",
    family: "glow",
    scopes: ["run"],
    parameters: { color: color("#22d3ee"), intensity: number(0.7, 0, 1) },
    renderers: ["css", "svg"],
    motion: "static",
  },
  {
    kind: "rgbSplit",
    displayName: "RGB split",
    family: "shadow",
    scopes: ["run"],
    parameters: { offset: number(3, 1, 8, 1) },
    renderers: ["css", "svg"],
    motion: "static",
  },
  {
    kind: "extruded",
    displayName: "Extruded text",
    family: "shadow",
    scopes: ["run"],
    parameters: { depth: number(6, 1, 12, 1), color: color("#168da5") },
    renderers: ["css", "svg"],
    motion: "static",
  },
  {
    kind: "holographic",
    displayName: "Holographic",
    family: "fill",
    scopes: ["run"],
    parameters: { intensity: number(0.7, 0, 1) },
    renderers: ["svg"],
    motion: "static",
  },
  {
    kind: "metallic",
    displayName: "Gold / chrome",
    family: "fill",
    scopes: ["run"],
    parameters: {
      variant: { type: "enum", default: "gold", values: ["gold", "chrome"] },
    },
    renderers: ["svg"],
    motion: "static",
  },
  {
    kind: "crt",
    displayName: "CRT",
    family: "fill",
    scopes: ["run"],
    parameters: { intensity: number(0.6, 0, 1) },
    renderers: ["svg"],
    motion: "static",
  },
  {
    kind: "rainbow",
    displayName: "Rainbow",
    family: "fill",
    scopes: ["run"],
    parameters: { saturation: number(0.85, 0.2, 1, 0.05) },
    renderers: ["svg"],
    motion: "static",
  },
  {
    kind: "glowPulse",
    displayName: "Glow pulse",
    family: "motion",
    scopes: ["run"],
    parameters: { periodMs: period, intensity: number(0.6, 0.1, 0.8) },
    renderers: ["svg"],
    motion: "decorative",
  },
  {
    kind: "gradientDrift",
    displayName: "Gradient drift",
    family: "motion",
    scopes: ["run"],
    parameters: { periodMs: period, distance: number(30, 5, 50, 1) },
    renderers: ["svg"],
    motion: "decorative",
  },
  {
    kind: "wave",
    displayName: "Gentle wave",
    family: "motion",
    scopes: ["run"],
    parameters: { amplitude: number(5, 1, 10, 1), periodMs: period },
    renderers: ["svg"],
    motion: "decorative",
  },
  {
    kind: "indicator",
    displayName: "Decorative moving indicator",
    family: "motion",
    scopes: ["run"],
    parameters: { color: color("#22d3ee"), periodMs: period },
    renderers: ["svg"],
    motion: "decorative",
  },
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
