import { defineScene } from "@servrox/console-fx";
import type { RenderRecipeV1, SceneV1 } from "@servrox/console-fx";
import {
  neon,
  rgbSplit,
  chrome,
  commandCard,
  buildReceipt,
  releaseBulletin,
} from "@servrox/console-fx/presets";

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
    purpose: "A welcome with a clear next step in a command card.",
    sample: true,
  },
  {
    id: "devContext",
    name: "Know your build",
    category: "useful",
    text: "atlas-web",
    purpose: "A build receipt with its revision, checks and environment.",
    sample: true,
  },
  {
    id: "milestone",
    name: "Mark a milestone",
    category: "useful",
    text: "Build complete",
    purpose: "An editorial bulletin for a release and its highlights.",
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
  } else if (id === "sdkWelcome") {
    scene = commandCard({
      step: "01",
      title: text,
      instruction: "Sandbox mode · See the SDK guide",
      command: "await atlas.connect()",
      safety: "Command shown, never executed.",
    });
  } else if (id === "devContext") {
    scene = buildReceipt({
      project: text,
      outcome: "PASSED",
      revision: "a1b2c3d",
      duration: "2.34 s",
      checks: "48 / 48",
      environment: "preview",
    });
  } else if (id === "milestone") {
    scene = releaseBulletin({
      product: "ATLAS",
      version: "v2.4.0",
      headline: text,
      changes: ["48 checks passed", "Ready for review"],
      channel: "Preview channel",
    });
  } else {
    scene = defineScene({
      schemaVersion: 1,
      label: EXAMPLES.find((example) => example.id === id)!.name,
      surface: { width: 520, height: 166, padding: 24, background: "#0c1117" },
      lines: [text, "A small detail for developers."].map((value, index) => ({
        runs: [
          {
            text: value,
            style: {
              fontSize: index === 0 ? 25 : 14,
              fontWeight: index === 0 ? 700 : 400,
              fontFamily: "serif",
              color: index === 0 ? "#e8f3f5" : "#b9cbd2",
            },
            effects: [],
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
