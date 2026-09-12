import {
  defineScene,
  fail,
  SceneValidationError,
} from "../validation/index.js";
import { deepFreeze } from "../model/limits.js";
import type {
  CardPresetId,
  CinematicProfile,
  EffectInput,
  SceneV1,
} from "../model/types.js";
import { getPresentationDescriptors } from "../presentations/catalog.js";
import {
  buildReceipt,
  requestTrace,
  serviceReady,
  commandCard,
  releaseBulletin,
  blueprint,
  contourMap,
  letterpress,
  signalHalftone,
  orbital,
  cardExample,
} from "./cards.js";
import type {
  BuildReceiptOptions,
  RequestTraceOptions,
  ServiceReadyOptions,
  CommandCardOptions,
  ReleaseBulletinOptions,
  ArtfulOptions,
} from "./cards.js";
export {
  buildReceipt,
  requestTrace,
  serviceReady,
  commandCard,
  releaseBulletin,
  blueprint,
  contourMap,
  letterpress,
  signalHalftone,
  orbital,
} from "./cards.js";
export type {
  BuildReceiptOptions,
  RequestTraceOptions,
  RequestStage,
  ServiceReadyOptions,
  CommandCardOptions,
  ReleaseBulletinOptions,
  CardOptions,
  ArtfulOptions,
} from "./cards.js";

export type PresetId =
  | "badge"
  | "neon"
  | "rgbSplit"
  | "extruded"
  | "holographic"
  | "gold"
  | "chrome"
  | "crt"
  | "rainbow"
  | CinematicPresetId
  | CardPresetId;
export type CinematicPresetId =
  "lightningMetal" | "iceCathedral" | "liquidChrome" | "moltenGold";
export type MotionId =
  "none" | "glowPulse" | "gradientDrift" | "wave" | "indicator";
export interface PresetOptions {
  readonly text?: string;
  readonly color?: string;
  readonly motion?: MotionId;
}
export interface CinematicPresetOptions extends Omit<PresetOptions, "motion"> {
  readonly depth?: number;
  readonly glow?: number;
  readonly ornaments?: boolean;
  readonly motion?: "none";
}
export const PRESETS = deepFreeze([
  {
    id: "badge",
    name: "Badge",
    description: "A small message with presence.",
    renderer: "css",
    group: "Classic",
  },
  {
    id: "neon",
    name: "Neon",
    description: "A crisp line with a soft glow.",
    renderer: "css",
    group: "Classic",
  },
  {
    id: "rgbSplit",
    name: "RGB split",
    description: "Three channels, slightly apart.",
    renderer: "css",
    group: "Classic",
  },
  {
    id: "extruded",
    name: "Extruded text",
    description: "A little depth goes a long way.",
    renderer: "css",
    group: "Classic",
  },
  {
    id: "holographic",
    name: "Holographic",
    description: "Iridescent color, held in light.",
    renderer: "svg",
    group: "Classic",
  },
  {
    id: "gold",
    name: "Gold",
    description: "Warm metal and sharp highlights.",
    renderer: "svg",
    group: "Classic",
  },
  {
    id: "chrome",
    name: "Chrome",
    description: "Cool reflections, polished edges.",
    renderer: "svg",
    group: "Classic",
  },
  {
    id: "crt",
    name: "CRT",
    description: "A quiet nod to the phosphor screen.",
    renderer: "svg",
    group: "Classic",
  },
  {
    id: "rainbow",
    name: "Rainbow",
    description: "The whole spectrum in one line.",
    renderer: "svg",
    group: "Classic",
  },
  {
    id: "lightningMetal",
    name: "Lightning Metal",
    description: "Angular lettering, cold reflections and electric edges.",
    renderer: "svg",
    group: "Cinematic Metal",
  },
  {
    id: "iceCathedral",
    name: "Ice Cathedral",
    description: "Tall ice-blue serifs between pointed ornaments.",
    renderer: "svg",
    group: "Cinematic Metal",
  },
  {
    id: "liquidChrome",
    name: "Liquid Chrome",
    description: "Swept chrome lettering and a hard reflection break.",
    renderer: "svg",
    group: "Cinematic Metal",
  },
  {
    id: "moltenGold",
    name: "Molten Gold",
    description: "Sharp gold faces above deep red metal.",
    renderer: "svg",
    group: "Cinematic Metal",
  },
  ...getPresentationDescriptors().map((descriptor) => ({
    id: descriptor.id,
    name: descriptor.name,
    description:
      descriptor.group === "Useful"
        ? "A supplied snapshot. Sample data."
        : "An original, static graphic signature.",
    renderer: "svg" as const,
    group: descriptor.group,
  })),
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

function cinematic(
  profile: CinematicProfile,
  text: string,
  color: string,
  depth: number,
  glow: number,
  fontSize: number,
  options: CinematicPresetOptions = {},
): SceneV1 {
  if (options.motion !== undefined && options.motion !== "none")
    throw new SceneValidationError([
      {
        code: "unsupported-combination",
        severity: "error",
        path: ["motion"],
        message: "Cinematic Metal presets support static output only.",
      },
    ]);
  const title = options.text ?? text;
  const angular =
    profile === "lightning-metal-v1" || profile === "molten-gold-v1";
  return defineScene({
    schemaVersion: 1,
    label: title,
    surface: {
      width: 840,
      height: 270,
      padding: 32,
      background: "#0c1117",
      borderRadius: 16,
    },
    lines: [
      {
        align: "center",
        runs: [
          {
            text: title,
            style: {
              fontFamily: angular ? "mono" : "serif",
              fontSize,
              fontWeight: angular ? 700 : 900,
              letterSpacing: angular ? 1 : 0,
            },
            effects: [
              {
                kind: "cinematicMetal",
                profile,
                color: options.color ?? color,
                depth: options.depth ?? depth,
                glow: options.glow ?? glow,
                ornaments: options.ornaments ?? true,
              },
            ],
          },
        ],
      },
    ],
    motion: { durationMs: 4800, finish: "freeze" },
  });
}
export function lightningMetal(options: CinematicPresetOptions = {}): SceneV1 {
  return cinematic(
    "lightning-metal-v1",
    "CONSOLE FX",
    "#69dcff",
    7,
    0.25,
    84,
    options,
  );
}
export function iceCathedral(options: CinematicPresetOptions = {}): SceneV1 {
  return cinematic(
    "ice-cathedral-v1",
    "STARK AI",
    "#a8edff",
    3,
    0.15,
    90,
    options,
  );
}
export function liquidChrome(options: CinematicPresetOptions = {}): SceneV1 {
  return cinematic(
    "liquid-chrome-v1",
    "Overdrive",
    "#a9d5ed",
    5,
    0.1,
    96,
    options,
  );
}
export function moltenGold(options: CinematicPresetOptions = {}): SceneV1 {
  return cinematic(
    "molten-gold-v1",
    "HOT RELOAD",
    "#ffba52",
    8,
    0.2,
    84,
    options,
  );
}
export type UsefulPresetId =
  | "buildReceipt"
  | "requestTrace"
  | "serviceReady"
  | "commandCard"
  | "releaseBulletin";
export type PresetOptionsMap = {
  readonly [Id in PresetId]: Id extends "buildReceipt"
    ? BuildReceiptOptions
    : Id extends "requestTrace"
      ? RequestTraceOptions
      : Id extends "serviceReady"
        ? ServiceReadyOptions
        : Id extends "commandCard"
          ? CommandCardOptions
          : Id extends "releaseBulletin"
            ? ReleaseBulletinOptions
            : Id extends CardPresetId
              ? ArtfulOptions
              : Id extends CinematicPresetId
                ? CinematicPresetOptions
                : PresetOptions;
};
type PresetArguments<Id extends PresetId> = Id extends UsefulPresetId
  ? [options: PresetOptionsMap[Id]]
  : [options?: PresetOptionsMap[Id]];
export function preset<Id extends PresetId>(
  id: Id,
  ...args: PresetArguments<Id>
): SceneV1;
export function preset(
  id: PresetId,
  options?: PresetOptionsMap[PresetId],
): SceneV1 {
  const factories = {
    badge,
    neon,
    rgbSplit,
    extruded,
    holographic,
    gold,
    chrome,
    crt,
    rainbow,
    lightningMetal,
    iceCathedral,
    liquidChrome,
    moltenGold,
    buildReceipt,
    requestTrace,
    serviceReady,
    commandCard,
    releaseBulletin,
    blueprint,
    contourMap,
    letterpress,
    signalHalftone,
    orbital,
  };
  if (!Object.hasOwn(factories, id))
    fail("invalid-preset", "Choose a documented preset.", ["id"]);
  // The public ID/options overload preserves correlation; each factory validates data at runtime.
  return factories[id](options as never);
}

/** Materialize an explicit authored catalog example, including synthetic useful facts. */
export function createPresetExample(id: PresetId): SceneV1 {
  return getPresentationDescriptors().some((d) => d.id === id)
    ? cardExample(id as CardPresetId)
    : preset(id);
}
