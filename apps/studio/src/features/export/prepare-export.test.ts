import { describe, expect, it, vi } from "vitest";
import ts from "typescript";
import { defineScene, parseRenderRecipe } from "@servrox/console-fx";
import { compileConsole } from "@servrox/console-fx/browser";
import { lightningMetal, neon } from "@servrox/console-fx/presets";
import { prepareExport } from "./prepare-export";

const text = '</script> %c " \\ 👩🏽‍💻\u2028\u2029';
const snapshot = {
  scene: neon({ text }),
  options: { target: "chromium", renderer: "css", motion: "reduce" },
} as const;

describe("studio export preparation", () => {
  it("prepares silently and emits the exact compiler arguments through standalone source", () => {
    const log = vi.spyOn(console, "log");
    const prepared = prepareExport(snapshot);
    expect(log).not.toHaveBeenCalled();
    const sink = vi.fn();
    new Function("console", prepared.source("javascript"))({ log: sink });
    expect(sink).toHaveBeenCalledExactlyOnceWith(
      ...compileConsole(snapshot.scene, snapshot.options).args,
    );
  });

  it.each(["typescript", "react", "next"] as const)(
    "preserves content and render settings in executable %s examples",
    (format) => {
      const prepared = prepareExport(snapshot);
      const source = prepared.source(format);
      expect(source).not.toContain("</script>");
      expect(source).not.toMatch(/[\u2028\u2029]/u);
      const compiled = ts.transpileModule(source, {
        fileName: "example.tsx",
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          jsx: ts.JsxEmit.ReactJSX,
          target: ts.ScriptTarget.ES2022,
        },
        reportDiagnostics: true,
      });
      expect(compiled.diagnostics).toEqual([]);
      const receive = vi.fn();
      const log = vi.fn();
      const modules: Record<string, unknown> = {
        "@servrox/console-fx": { defineScene },
        "@servrox/console-fx/browser": { emitConsole: receive },
        "@servrox/console-fx-react": {
          ConsoleBanner: "ConsoleBanner",
          useConsoleScene: (scene: unknown, options: unknown) => {
            receive(scene, options);
            return { log };
          },
        },
        "react/jsx-runtime": {
          jsx: (type: unknown, props: unknown) => ({ type, props }),
        },
      };
      const exported: Record<string, () => { props: Record<string, unknown> }> =
        {};
      new Function("require", "exports", compiled.outputText)((id: string) => {
        if (!(id in modules)) throw new Error(`Unexpected import: ${id}`);
        return modules[id];
      }, exported);
      if (format === "react") {
        const button = exported.PrintMessage!();
        expect(button.props.onClick).toBe(log);
      } else if (format === "next") {
        expect(source.startsWith('"use client";')).toBe(true);
        expect(exported.default!().props).toEqual({
          scene: snapshot.scene,
          enabled: true,
          options: snapshot.options,
        });
        return;
      }
      expect(receive).toHaveBeenCalledExactlyOnceWith(
        snapshot.scene,
        snapshot.options,
      );
    },
  );

  it("excludes temporary measurements from saved recipes and preserves JSON recovery on compilation failure", () => {
    const measurements = {
      kind: "consoleFxMeasurements",
      measurementVersion: 1,
      environment: "test-local-fonts",
      records: [],
    } as const;
    const prepared = prepareExport(snapshot, measurements);
    expect(JSON.parse(prepared.source("json"))).toEqual(snapshot.scene);
    const recipe = JSON.parse(prepared.source("recipe"));
    expect(parseRenderRecipe(recipe).ok).toBe(true);
    expect(recipe.options).toEqual(snapshot.options);
    expect(prepared.options.measurements).toBe(measurements);
    expect(prepared.source("typescript")).toContain("test-local-fonts");
    const unsupported = prepareExport({ ...snapshot, scene: lightningMetal() });
    expect(unsupported.compilation.ok).toBe(false);
    expect(unsupported.source("javascript")).toBe("");
    expect(parseRenderRecipe(JSON.parse(unsupported.source("recipe"))).ok).toBe(
      true,
    );
  });

  it("keeps a static preview and retains matching diagnostic codes at distinct paths", () => {
    const motion = prepareExport({
      scene: neon({ motion: "wave" }),
      options: { target: "chromium", renderer: "svg", motion: "system" },
    });
    expect(motion.compilation.ok && motion.compilation.output.animated).toBe(
      false,
    );
    const single = lightningMetal({ text: "hello" });
    const scene = defineScene({
      ...single,
      lines: [single.lines[0]!, single.lines[0]!],
    });
    const prepared = prepareExport({
      scene,
      options: { target: "chromium", renderer: "svg" },
    });
    expect(prepared.compilation.ok).toBe(true);
    const capitalized = prepared.diagnostics.filter(
      (entry) => entry.code === "cinematic-uppercase-display",
    );
    expect(capitalized.map((entry) => entry.path)).toEqual([
      ["lines", 0, "runs", 0],
      ["lines", 1, "runs", 0],
    ]);
  });
});
