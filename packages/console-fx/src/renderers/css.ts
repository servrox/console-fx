import type {
  CompiledPreview,
  ConsoleArgs,
  SceneV1,
  TextRun,
} from "../model/types.js";

export const FONT_STACKS = {
  sans: "Arial,Helvetica,sans-serif",
  mono: "Consolas,Liberation Mono,monospace",
  serif: "Georgia,Times New Roman,serif",
} as const;

export function literalPercent(value: string): string {
  return value.replaceAll("%", "%%");
}

function runStyle(run: TextRun): Readonly<Record<string, string>> {
  const style: Record<string, string> = {
    color: run.style.color,
    "font-size": `${run.style.fontSize}px`,
    "font-weight": String(run.style.fontWeight),
    "font-family": FONT_STACKS[run.style.fontFamily],
    "letter-spacing": `${run.style.letterSpacing}px`,
    "line-height": "1.5",
  };
  const shadows: string[] = [];
  for (const effect of run.effects) {
    switch (effect.kind) {
      case "badge":
        style.background = effect.color;
        style.color = "#071014";
        style.padding = "4px 12px";
        style["border-radius"] = "6px";
        break;
      case "neon": {
        const blur = Number((4 + effect.intensity * 12).toFixed(2));
        style.color = effect.color;
        // DevTools applies paint containment to styled spans. Reserve room for
        // the halo so it is not cut off at the first/last glyph.
        style.padding = `${Math.ceil(blur)}px`;
        shadows.push(
          `0 0 ${Number((2 + effect.intensity * 4).toFixed(2))}px ${effect.color}`,
          `0 0 ${blur}px ${effect.color}`,
        );
        break;
      }
      case "rgbSplit":
        style.padding = `${effect.offset + 1}px`;
        shadows.push(
          `${-effect.offset}px 0 #ff526f`,
          `${effect.offset}px 0 #35dfff`,
        );
        break;
      case "extruded":
        style.padding = `${effect.depth + 1}px`;
        for (let depth = 1; depth <= effect.depth; depth++)
          shadows.push(`${depth}px ${depth}px ${effect.color}`);
        break;
    }
  }
  if (shadows.length) style["text-shadow"] = shadows.join(",");
  return style;
}

export function renderCss(scene: SceneV1): {
  args: ConsoleArgs;
  preview: CompiledPreview;
} {
  let format = "";
  const values: string[] = [];
  const lines = scene.lines.map((line, index) => {
    if (index > 0) format += "\n";
    return {
      runs: line.runs.map((run) => {
        const style = runStyle(run);
        format += "%c%s";
        values.push(
          Object.entries(style)
            .map(([key, value]) => `${key}:${value}`)
            .join(";"),
          literalPercent(run.text),
        );
        return { text: run.text, style };
      }),
    };
  });
  format += "%c";
  values.push("");
  return { args: [format, ...values], preview: { kind: "css", lines } };
}
