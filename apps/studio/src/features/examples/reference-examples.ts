import { defineScene } from "@servrox/console-fx";
import type { LineInput, RunInput, RenderRecipeV1 } from "@servrox/console-fx";

// Materialized SceneV1 data, shared by the landing gallery and both editors.
// The reference frames are not embedded: every example can be edited/exported.
const ink = "#e8f3f5";
const muted = "#afc4d0";
const cyan = "#64e1ff";
function run(
  text: string,
  fontSize = 18,
  color = ink,
  extra: Omit<RunInput, "text"> = {},
): RunInput {
  return {
    text,
    ...extra,
    style: {
      fontSize,
      color,
      fontFamily: "mono",
      fontWeight: 400,
      ...extra.style,
    },
  };
}
function line(
  text: string,
  fontSize = 18,
  color = ink,
  extra: Omit<RunInput, "text"> = {},
): LineInput {
  return { runs: [run(text, fontSize, color, extra)] };
}
function centered(lines: readonly LineInput[]): LineInput[] {
  return lines.map((item) => ({ ...item, align: "center" }));
}
function title(
  text: string,
  effects: RunInput["effects"] = [],
  color = cyan,
): LineInput {
  return line(text, 46, color, {
    style: { fontFamily: "sans", fontWeight: 800 },
    effects,
  });
}
function recipe(
  label: string,
  lines: readonly LineInput[],
  height = 220,
  background = "#0c151e",
) {
  return {
    kind: "consoleFxRenderRecipe",
    recipeVersion: 1,
    scene: defineScene({
      schemaVersion: 1,
      label,
      surface: {
        width: 600,
        height,
        padding: 32,
        borderRadius: 16,
        background,
      },
      lines,
      motion: { durationMs: 4800, finish: "freeze" },
    }),
    options: {
      target: "chromium",
      renderer: "svg",
      motion: "reduce",
      unsupported: "error",
    },
  } satisfies RenderRecipeV1;
}
function status(
  label: string,
  symbol: string,
  color: string,
  background: string,
  heading: string,
  details: readonly string[],
) {
  return recipe(
    label,
    [
      {
        runs: [
          run(symbol, 30, color, { effects: [{ kind: "badge", color }] }),
          run(`   ${heading}`, 28, color, {
            style: { fontFamily: "sans", fontWeight: 700 },
          }),
        ],
      },
      ...details.map((value) => line(value, 18, ink)),
      line("Illustrative message · Sample data", 14, muted),
    ],
    220,
    background,
  );
}

const factories = {
  neonText: () =>
    recipe(
      "Neon text",
      centered([
        title("console-fx", [{ kind: "neon", color: cyan, intensity: 0.35 }]),
        line("Make your logs unforgettable.", 17, cyan),
      ]),
      180,
    ),
  asciiSignature: () =>
    recipe(
      "ASCII-inspired",
      centered([
        line("[ console-fx ]", 34, cyan, { style: { fontWeight: 700 } }),
        line("> CODE / CREATE / ENJOY", 18, muted),
      ]),
      180,
    ),
  gradientText: () =>
    recipe(
      "Gradient text",
      centered([
        title("console-fx", [{ kind: "holographic", intensity: 0 }]),
        line("Beautiful by design.", 18, muted),
      ]),
      180,
    ),
  boxedMessage: () =>
    recipe(
      "Boxed message",
      [
        line("╭─────────────────────────────────────╮", 22, cyan),
        ...["ⓘ console-fx", "", "Small details. Big developer joy."].map(
          (text) => line(`│ ${text.padEnd(35)} │`, 22, cyan),
        ),
        line("╰─────────────────────────────────────╯", 22, cyan),
      ],
      230,
    ),
  successMessage: () =>
    status("Success message", "✓", "#84e8b4", "#0e211c", "Build complete", [
      "Your changes are ready.",
      "All checks passed · Example build",
    ]),
  warningMessage: () =>
    status("Warning message", "!", "#eed18c", "#242014", "Deprecation notice", [
      "oldMethod() changes in the next release.",
      "Use newMethod() instead.",
    ]),
  errorMessage: () =>
    status("Error message", "×", "#ff9caa", "#26151b", "Request failed", [
      "Unable to reach the example API.",
      "HTTP 500 · Try the request again.",
    ]),
  animatedSvg: () =>
    recipe(
      "Animated SVG",
      centered([
        title("console-fx", [
          { kind: "holographic", intensity: 0.2 },
          { kind: "gradientDrift" },
        ]),
        line("FINITE MOTION / STATIC FALLBACK", 17, muted),
        line("Decorative motion · 4.8 seconds", 14, cyan, {
          effects: [{ kind: "indicator", color: cyan }],
        }),
      ]),
    ),
  multilineLayout: () =>
    recipe("Multiline layout", [
      title("console-fx"),
      line("One expressive console message.", 23),
      line("Typed configuration · visual presets", 18, muted),
      line("Export as standalone JavaScript.", 18, muted),
    ]),
  tabularLayout: () =>
    recipe(
      "Tabular layout",
      [
        line("DESIGN           │ RENDERER", 22, cyan),
        line("─────────────────┼────────────────", 22, muted),
        line("Neon glow        │ CSS text", 22),
        line("Aurora wave      │ SVG concept", 22),
        line("Plain message    │ Text fallback", 22),
        line("Illustrative rows · One console.log", 15, muted),
      ],
      260,
    ),
  badgesAndLabels: () =>
    recipe(
      "Badges and labels",
      centered([
        {
          runs: [
            run("DEV BUILD", 18, ink, {
              effects: [{ kind: "badge", color: "#84e8b4" }],
            }),
            run("    "),
            run("LOCAL SCENE", 18, ink, {
              effects: [{ kind: "badge", color: "#c4b2eb" }],
            }),
            run("    "),
            run("CSS PREVIEW", 18, ink, {
              effects: [{ kind: "badge", color: cyan }],
            }),
          ],
        },
        line(" ", 24),
        line("MADE WITH CARE / BY SERVROX", 18, muted),
      ]),
      190,
    ),
  customBrand: () =>
    recipe(
      "Custom brand",
      centered([
        title("S E R V R O X", [{ kind: "holographic", intensity: 0 }]),
        line("BUILD / IMPROVE / CREATE", 18, muted),
      ]),
      180,
    ),
  asciiLogo: () =>
    recipe(
      "ASCII logo",
      [
        line(
          [
            "  ___ ___  _  _ ___  ___  _    ___     _____  __",
            " / __/ _ \\| \\| / __|/ _ \\| |  | __|___| __\\ \\/ /",
            "| (_| (_) | .` \\__ \\ (_) | |__| _|___| _| >  < ",
            " \\___\\___/|_|\\_|___/\\___/|____|___|   |_| /_/\\_\\",
          ].join("\n"),
          17,
          cyan,
          { effects: [{ kind: "neon", color: cyan, intensity: 0.1 }] },
        ),
        {
          ...line("Make your logs unforgettable.", 18, muted),
          align: "center",
        },
      ],
      205,
    ),
  animatedDolphin: () =>
    recipe(
      "Animated dolphin",
      [
        {
          ...line(
            [
              "                  __",
              "              _.-'  '-._",
              "          _.-'   .-._   '-.__",
              "      _.-'      /    '-.     '-._",
              "  _.-'     __.-'        '-.  o   '-.",
              " /__..---''                '---..___>",
              "     \\_\\  /_ /",
            ]
              .map((value) => value.padEnd(36))
              .join("\n"),
            17,
            cyan,
            { effects: [{ kind: "wave", amplitude: 2, periodMs: 1800 }] },
          ),
          align: "center",
        },
        { ...line("Keep building ♥", 18, cyan), align: "center" },
      ],
      265,
    ),
};
export type ReferenceExampleId = keyof typeof factories;
export const REFERENCE_EXAMPLES = [
  {
    id: "neonText",
    name: "Neon text",
    purpose: "A bright title with a quiet second line.",
  },
  {
    id: "asciiSignature",
    name: "ASCII-inspired",
    purpose: "A classic bracketed console signature.",
  },
  {
    id: "gradientText",
    name: "Gradient text",
    purpose: "A soft spectrum across the lettering.",
  },
  {
    id: "boxedMessage",
    name: "Boxed message",
    purpose: "A text frame around an important note.",
  },
  {
    id: "successMessage",
    name: "Success message",
    purpose: "A green confirmation with readable details.",
    sample: true,
  },
  {
    id: "warningMessage",
    name: "Warning message",
    purpose: "An amber notice with the next step.",
    sample: true,
  },
  {
    id: "errorMessage",
    name: "Error message",
    purpose: "A clear failure and a recovery hint.",
    sample: true,
  },
  {
    id: "animatedSvg",
    name: "Animated SVG",
    purpose: "A drifting gradient and decorative indicator.",
    motion: true,
  },
  {
    id: "multilineLayout",
    name: "Multiline layout",
    purpose: "A title and three lines in one entry.",
  },
  {
    id: "tabularLayout",
    name: "Tabular layout",
    purpose: "Aligned sample rows, exported in one call.",
    sample: true,
  },
  {
    id: "badgesAndLabels",
    name: "Badges and labels",
    purpose: "Three compact labels and a signature.",
  },
  {
    id: "customBrand",
    name: "Custom brand",
    purpose: "Spaced lettering for a software signature.",
  },
  {
    id: "asciiLogo",
    name: "ASCII logo",
    purpose: "A large console-fx wordmark made from text.",
  },
  {
    id: "animatedDolphin",
    name: "Animated dolphin",
    purpose: "An original text dolphin with a gentle wave.",
    motion: true,
  },
] as const satisfies readonly {
  id: ReferenceExampleId;
  name: string;
  purpose: string;
  sample?: boolean;
  motion?: boolean;
}[];

export function referenceRecipe(id: ReferenceExampleId) {
  return factories[id]();
}
