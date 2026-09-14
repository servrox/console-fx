import { parseRenderRecipe, LIMITS } from "@servrox/console-fx";
import type { RenderRecipeV1, Diagnostic } from "@servrox/console-fx";
import { PRESETS, createPresetExample } from "@servrox/console-fx/presets";
import { EXAMPLES, exampleRecipe } from "../landing/examples";
import { REFERENCE_EXAMPLES, referenceRecipe } from "./reference-examples";
import { resolveCapabilities } from "./capabilities";

export const CATEGORIES = Object.freeze([
  {
    id: "brand",
    name: "Brand & signatures",
    shortName: "Signatures",
    purpose: "Give your project a recognizable introduction.",
    hero: "preset:lightningMetal",
  },
  {
    id: "diagnostics",
    name: "Debugging & diagnostics",
    shortName: "Debugging",
    purpose: "Put failures, context and the next step together.",
    hero: "preset:requestTrace",
  },
  {
    id: "runtime",
    name: "Runtime & environment",
    shortName: "Runtime",
    purpose: "Show what is running and where.",
    hero: "preset:serviceReady",
  },
  {
    id: "releases",
    name: "Builds & releases",
    shortName: "Releases",
    purpose: "Make a build or release easy to scan.",
    hero: "preset:buildReceipt",
  },
  {
    id: "guides",
    name: "Guides & onboarding",
    shortName: "Onboarding",
    purpose: "Leave developers a useful next action.",
    hero: "featured:sdkWelcome",
  },
  {
    id: "delight",
    name: "Easter eggs & celebrations",
    shortName: "Easter eggs",
    purpose: "Add an optional surprise to a developer’s day.",
    hero: "reference:animatedDolphin",
  },
] as const);
export type CategoryId = (typeof CATEGORIES)[number]["id"];
export const STYLE_FILTERS = Object.freeze([
  { id: "cinematic", name: "Cinematic" },
  { id: "ascii", name: "ASCII" },
  { id: "neon", name: "Neon" },
  { id: "card", name: "Card" },
  { id: "minimal", name: "Minimal" },
] as const);
export type StyleId = (typeof STYLE_FILTERS)[number]["id"];
const appearance: Readonly<Record<string, readonly StyleId[]>> = {
  badge: ["minimal"],
  neon: ["neon"],
  letterpress: ["minimal"],
  signature: ["neon"],
  quietEditorial: ["minimal"],
  sdkWelcome: ["card"],
  devContext: ["card"],
  milestone: ["card"],
  neonText: ["neon"],
  asciiSignature: ["ascii", "minimal"],
  asciiLogo: ["ascii"],
  boxedMessage: ["ascii"],
  animatedDolphin: ["ascii"],
  successMessage: ["minimal"],
  warningMessage: ["minimal"],
  errorMessage: ["minimal"],
  multilineLayout: ["minimal"],
  tabularLayout: ["ascii", "minimal"],
  badgesAndLabels: ["minimal"],
  customBrand: ["minimal"],
};
function styles(id: string, group?: string): readonly StyleId[] {
  return [
    ...(appearance[id] ?? []),
    ...(group === "Cinematic Metal"
      ? ["cinematic" as const]
      : group === "Useful" || group === "Artful"
        ? ["card" as const]
        : []),
  ];
}
export interface ExampleMetadata {
  readonly id: string;
  readonly category: CategoryId;
  readonly family: string;
  readonly name: string;
  readonly purpose: string;
  readonly tags: readonly string[];
  readonly styles: readonly StyleId[];
  readonly sampleData: boolean;
}
type Definition = ExampleMetadata & {
  readonly createRecipe: () => RenderRecipeV1;
};
const assignment: Readonly<Record<string, readonly [CategoryId, string]>> = {
  buildReceipt: ["releases", "Build receipt"],
  requestTrace: ["diagnostics", "Request trace"],
  releaseBulletin: ["releases", "Release bulletin"],
  commandCard: ["guides", "Next step"],
  serviceReady: ["runtime", "Service readiness"],
  blueprint: ["brand", "Artful signature"],
  contourMap: ["brand", "Artful signature"],
  letterpress: ["brand", "Artful signature"],
  signalHalftone: ["brand", "Artful signature"],
  orbital: ["brand", "Artful signature"],
  badge: ["brand", "Badge greeting"],
  lightningMetal: ["brand", "Cinematic signature"],
  iceCathedral: ["brand", "Cinematic signature"],
  liquidChrome: ["brand", "Cinematic signature"],
  moltenGold: ["brand", "Cinematic signature"],
  sdkWelcome: ["guides", "Next step"],
  devContext: ["releases", "Build receipt"],
  milestone: ["releases", "Release bulletin"],
  quietEditorial: ["brand", "Quiet credits"],
  asciiSignature: ["brand", "ASCII and logos"],
  customBrand: ["brand", "ASCII and logos"],
  asciiLogo: ["brand", "ASCII and logos"],
  boxedMessage: ["brand", "Framed greeting"],
  successMessage: ["releases", "Completion notice"],
  warningMessage: ["diagnostics", "Warning and next step"],
  errorMessage: ["diagnostics", "Failure and recovery"],
  animatedSvg: ["delight", "Decorative message"],
  animatedDolphin: ["delight", "Dolphin surprise"],
  multilineLayout: ["guides", "Multiline instructions"],
  tabularLayout: ["guides", "Renderer comparison"],
  badgesAndLabels: ["runtime", "Environment labels"],
};
function classify(id: string) {
  const [category, family] = assignment[id] ?? ["brand", "Styled signature"];
  return { category, family };
}
const definitions: readonly Definition[] = [
  ...PRESETS.map((item) => ({
    ...classify(item.id),
    id: `preset:${item.id}`,
    name: item.name,
    purpose: item.description,
    tags: [
      item.id,
      item.group,
      ...(item.group === "Cinematic Metal"
        ? ["cinematic", "metal"]
        : item.group === "Classic"
          ? [item.id]
          : ["card"]),
    ],
    styles: styles(item.id, item.group),
    sampleData: item.group === "Useful",
    createRecipe: (): RenderRecipeV1 => ({
      kind: "consoleFxRenderRecipe",
      recipeVersion: 1,
      scene: createPresetExample(item.id),
      options: {
        target: "chromium",
        renderer: item.renderer,
        motion: "reduce",
      },
    }),
  })),
  ...EXAMPLES.map((item) => ({
    ...classify(item.id),
    id: `featured:${item.id}`,
    name: item.name,
    purpose: item.purpose,
    tags: [
      item.id,
      item.category,
      ...(item.id === "devContext" ? ["dev context", "environment"] : []),
    ],
    styles: styles(item.id),
    sampleData: item.sample,
    createRecipe: () => exampleRecipe(item.id),
  })),
  ...REFERENCE_EXAMPLES.map((item) => ({
    ...classify(item.id),
    id: `reference:${item.id}`,
    name: item.name,
    purpose: item.purpose,
    tags: [
      item.id,
      "reference",
      ...(item.name.toLowerCase().includes("ascii") ? ["ascii"] : []),
    ],
    styles: styles(item.id),
    sampleData: "sample" in item && item.sample,
    createRecipe: () => referenceRecipe(item.id),
  })),
];
const inventory = Object.freeze({
  categories: CATEGORIES,
  examples: Object.freeze(
    definitions.map(
      ({ id, category, family, name, purpose, tags, styles, sampleData }) =>
        Object.freeze({
          id,
          category,
          family,
          name,
          purpose,
          tags: Object.freeze(tags),
          styles: Object.freeze(styles),
          sampleData,
        }),
    ),
  ),
});
export const listCatalogue = () => inventory;
export const DEFAULT_EXAMPLE_ID = CATEGORIES[0].hero;

/** Applied only when creating a new example or on an explicit conversion action. */
export function withAutomaticSizing(recipe: RenderRecipeV1): RenderRecipeV1 {
  // Start from approved full card artwork. A bounded flow frame also reserves
  // conservative Unicode bearings; compact fitting remains an explicit choice.
  const mode = resolveCapabilities(recipe).mode;
  const width =
    recipe.options.layout?.width ??
    (mode === "card"
      ? 960
      : mode === "flow"
        ? Math.max(1080, recipe.scene.surface.width)
        : recipe.scene.surface.width);
  return {
    ...recipe,
    options: {
      ...recipe.options,
      target: "chromium",
      renderer: "svg",
      layout: recipe.options.layout ?? {
        algorithm: "fit/v2",
        width,
        maxHeight: LIMITS.svgHeight,
        variant: "auto",
        overflow: recipe.scene.presentation ? "wrap-then-shrink" : "shrink",
        minFontSize: 12,
      },
      sizing: {
        mode: "container-experimental",
        maxWidth: width,
        fillFraction: 0.95,
      },
    },
  };
}
export type CatalogueResult =
  | {
      readonly ok: true;
      readonly recipe: RenderRecipeV1;
      readonly capabilities: ReturnType<typeof resolveCapabilities>;
    }
  | {
      readonly ok: false;
      readonly code: "unknown-example" | "invalid-recipe";
      readonly diagnostics: readonly Diagnostic[];
      readonly message: string;
    };
export function resolveExample(
  input: { readonly exampleId: string } | { readonly recipe: unknown },
): CatalogueResult {
  let candidate: unknown;
  if ("exampleId" in input) {
    const entry = definitions.find((item) => item.id === input.exampleId);
    if (!entry)
      return {
        ok: false,
        code: "unknown-example",
        diagnostics: [],
        message:
          "That example is unavailable. Browse All examples; your current work is preserved.",
      };
    candidate = withAutomaticSizing(entry.createRecipe());
  } else candidate = input.recipe;
  const result = parseRenderRecipe(candidate);
  if (!result.ok)
    return {
      ok: false,
      code: "invalid-recipe",
      diagnostics: result.diagnostics,
      message: result.diagnostics[0]!.message,
    };
  return {
    ok: true,
    recipe: result.value,
    capabilities: resolveCapabilities(result.value),
  };
}
export function exampleHref(id: string, category?: CategoryId) {
  return `/studio/?example=${encodeURIComponent(id)}${category ? `&category=${category}` : ""}`;
}
export function searchExamples(
  query: string,
  category?: CategoryId,
  style?: StyleId,
) {
  const normalize = (text: string) =>
    text.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  return inventory.examples.filter(
    (entry) =>
      (!category || entry.category === category) &&
      (!style || entry.styles.includes(style)) &&
      terms.every((term) =>
        normalize(
          [
            entry.name,
            entry.purpose,
            entry.family,
            ...entry.tags,
            ...entry.styles,
          ].join(" "),
        ).includes(term),
      ),
  );
}
