import type { ExportOptions, MeasurementSnapshot } from "@servrox/console-fx";
import {
  compileConsole,
  ConsoleCompileError,
} from "@servrox/console-fx/browser";
import { exportConsoleLog } from "@servrox/console-fx/codegen";
import { recipeOf, type EditorSnapshot } from "../editor/document";

export type ExportFormat =
  "javascript" | "typescript" | "react" | "next" | "json" | "recipe";
export const formats = {
  javascript: {
    copy: "Copy console.log",
    description: "Self-contained JavaScript. No imports. One console.log.",
  },
  typescript: {
    copy: "Copy TypeScript example",
    description: "A complete example using the core package.",
  },
  react: {
    copy: "Copy React example",
    description: "An explicit button action using the core and React adapter.",
  },
  next: {
    copy: "Copy Next.js example",
    description: "A client component using the core and React adapter.",
  },
  json: {
    copy: "Copy scene JSON",
    description:
      "Content only. Render settings are excluded; use Recipe JSON to retain them.",
  },
  recipe: {
    copy: "Copy recipe JSON",
    description:
      "Scene plus explicit render settings. Local font measurements are excluded.",
  },
} as const;
const sourceString = (value: unknown) =>
  JSON.stringify(value, null, 2)
    .replaceAll("<", "\\u003c")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");

/** Pure export preparation; saved recipes never capture temporary font measurements. */
export function prepareExport(
  { scene, options: settings }: EditorSnapshot,
  measurements?: MeasurementSnapshot,
) {
  const options: ExportOptions = {
    ...settings,
    ...(measurements
      ? { measurements, measurementEnvironment: measurements.environment }
      : {}),
  };
  const compilation = (() => {
    try {
      return {
        ok: true as const,
        output: compileConsole(scene, {
          ...options,
          motion: "reduce",
        }),
        exported: exportConsoleLog(scene, options),
      };
    } catch (error) {
      if (error instanceof ConsoleCompileError)
        return { ok: false as const, diagnostics: error.diagnostics };
      throw error;
    }
  })();
  const diagnostics = compilation.ok
    ? [
        ...compilation.output.diagnostics,
        ...compilation.exported.diagnostics,
      ].filter(
        (entry, index, all) =>
          all.findIndex(
            (other) =>
              other.code === entry.code &&
              other.severity === entry.severity &&
              other.message === entry.message &&
              JSON.stringify(other.path) === JSON.stringify(entry.path),
          ) === index,
      )
    : compilation.diagnostics;
  function source(format: ExportFormat) {
    if (format === "json") return JSON.stringify(scene, null, 2);
    if (format === "recipe")
      return JSON.stringify(recipeOf({ scene, options: settings }), null, 2);
    if (format === "javascript")
      return compilation.ok ? compilation.exported.code : "";
    const measurementNote = measurements
      ? "// Fixed local-font metrics are included as data, not measured at runtime.\n// Recipient fonts can differ; remeasure explicitly or omit metrics after edits.\n"
      : "";
    const sceneCode = sourceString(scene);
    const optionsCode = sourceString(options);
    if (format === "typescript")
      return `${measurementNote}import { defineScene } from "@servrox/console-fx";\nimport { emitConsole } from "@servrox/console-fx/browser";\n\nconst scene = defineScene(${sceneCode});\nemitConsole(scene, ${optionsCode});`;
    if (format === "next")
      return `"use client";\n\n${measurementNote}import { defineScene } from "@servrox/console-fx";\nimport { ConsoleBanner } from "@servrox/console-fx-react";\n\nconst scene = defineScene(${sceneCode});\n\nexport default function StartupBanner() {\n  return <ConsoleBanner scene={scene} enabled options={${optionsCode}} />;\n}`;
    return `${measurementNote}import { defineScene } from "@servrox/console-fx";\nimport { useConsoleScene } from "@servrox/console-fx-react";\n\nconst scene = defineScene(${sceneCode});\n\nexport function PrintMessage() {\n  const { log } = useConsoleScene(scene, ${optionsCode});\n  return <button onClick={log}>Print message</button>;\n}`;
  }
  return { options, compilation, diagnostics, source };
}
