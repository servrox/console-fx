import { defineScene } from "@servrox/console-fx";
import type { RenderRecipeV1, SceneV1 } from "@servrox/console-fx";
import { neon, rgbSplit, chrome } from "@servrox/console-fx/presets";

export const EXAMPLES = [
  {
    id: "signature",
    name: "A signature hello",
    category: "memorable",
    text: "Hello, developer.",
    purpose: "Give a small project a recognizable welcome.",
    sample: false,
  },
  {
    id: "sdkWelcome",
    name: "Welcome to the SDK",
    category: "useful",
    text: "Atlas SDK",
    purpose: "Put a mode and a useful next step beside your welcome.",
    sample: true,
  },
  {
    id: "devContext",
    name: "Know your build",
    category: "useful",
    text: "atlas-web",
    purpose: "Keep the project, environment and revision together.",
    sample: true,
  },
  {
    id: "milestone",
    name: "Mark a milestone",
    category: "useful",
    text: "Build complete",
    purpose: "Summarize one completed moment with supplied facts.",
    sample: true,
  },
  {
    id: "chromeTitle",
    name: "A little metal",
    category: "memorable",
    text: "Keep building.",
    purpose: "Give a short title a polished finish.",
    sample: false,
  },
  {
    id: "quietEditorial",
    name: "A quieter note",
    category: "memorable",
    text: "Made with care.",
    purpose: "Let thoughtful typography carry the message.",
    sample: false,
  },
] as const;
export type ExampleId = (typeof EXAMPLES)[number]["id"];
export type SignatureStyle = "neon" | "rgbSplit" | "chrome";
export const HERO_CHOICES = [
  { id: "signature", label: "Signature" },
  { id: "devContext", label: "Dev context" },
  { id: "milestone", label: "Summary" },
] as const;

export function exampleRecipe(
  id: ExampleId,
  text = EXAMPLES.find((example) => example.id === id)!.text as string,
  style: SignatureStyle = "neon",
) {
  let scene: SceneV1;
  const metal =
    id === "chromeTitle" || (id === "signature" && style === "chrome");
  if (id === "signature" || id === "chromeTitle") {
    const factory = metal ? chrome : style === "rgbSplit" ? rgbSplit : neon;
    const source = factory({ text });
    scene = defineScene({
      ...source,
      surface: { ...source.surface, width: 520, height: 156, padding: 26 },
      lines: source.lines.map((line) => ({
        ...line,
        runs: line.runs.map((run) => ({
          ...run,
          style: { ...run.style, fontSize: 30 },
        })),
      })),
    });
  } else {
    const lines =
      id === "sdkWelcome"
        ? [text, "Sandbox mode", "See the SDK guide"]
        : id === "devContext"
          ? [text, "preview", "Revision a1b2c3d"]
          : id === "milestone"
            ? [text, "48 checks passed", "Ready for review"]
            : [text, "A small detail for developers."];
    scene = defineScene({
      schemaVersion: 1,
      label: EXAMPLES.find((example) => example.id === id)!.name,
      surface: { width: 520, height: 166, padding: 24, background: "#0c1117" },
      lines: lines.map((value, index) => ({
        runs: [
          {
            text: value,
            style: {
              fontSize: index === 0 ? 25 : 14,
              fontWeight: index === 0 ? 700 : 400,
              fontFamily: id === "quietEditorial" ? "serif" : "mono",
              color: index === 0 ? "#e8f3f5" : "#b9cbd2",
            },
            effects:
              index === 1 && id !== "quietEditorial"
                ? [{ kind: "badge", color: "#bdf4ee" }]
                : [],
          },
        ],
      })),
    });
  }
  return {
    kind: "consoleFxRenderRecipe",
    recipeVersion: 1,
    scene,
    options: {
      target: "chromium",
      // The multi-line examples use their opaque authored surface so their
      // pale type remains readable in both light and dark DevTools themes.
      renderer: metal || id !== "signature" ? "svg" : "css",
      motion: "reduce",
      unsupported: "error",
    },
  } satisfies RenderRecipeV1;
}
