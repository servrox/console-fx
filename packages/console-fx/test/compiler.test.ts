import { JSDOM } from "jsdom";
import { describe, expect, it, vi } from "vitest";
import {
  compileConsole,
  compileCssConsole,
  ConsoleCompileError,
  emitConsole,
  resolveMotion,
} from "../src/browser/index.js";
import { defineScene, utf8ByteLength } from "../src/index.js";
import { neon, preset, PRESETS, rainbow } from "../src/presets/index.js";

describe("compilation and emission", () => {
  it("offers identical CSS output through the explicit CSS compiler", () => {
    for (const { id } of PRESETS.filter((p) => p.renderer === "css")) {
      const scene = preset(id, { text: '%s %c quotes " <&>' });
      expect(compileCssConsole(scene, { target: "chromium" })).toEqual(
        compileConsole(scene, { renderer: "css", target: "chromium" }),
      );
    }
    expect(() => compileCssConsole(rainbow(), { target: "chromium" })).toThrow(
      ConsoleCompileError,
    );
    expect(
      compileCssConsole(rainbow(), {
        target: "chromium",
        unsupported: "fallback",
      }).renderer,
    ).toBe("text");
    expect(() =>
      compileCssConsole(neon(), { renderer: "svg" } as never),
    ).toThrow(ConsoleCompileError);
    const getter = vi.fn(() => "chromium");
    expect(() =>
      compileCssConsole(neon(), {
        get target() {
          return getter();
        },
      } as never),
    ).toThrow(ConsoleCompileError);
    expect(getter).not.toHaveBeenCalled();
  });
  it("defaults to literal static text on unknown and terminal targets", () => {
    const scene = neon({ text: "%c 100% complete" });
    for (const target of [undefined, "node", "bun"] as const) {
      const output = compileConsole(scene, target ? { target } : {});
      expect(output.args).toEqual(["%c 100% complete"]);
      expect(output).toMatchObject({
        renderer: "text",
        animated: false,
        preview: { kind: "text", text: "%c 100% complete" },
      });
    }
  });
  it("compiles deterministically without mutating data or logging", () => {
    const log = vi.spyOn(console, "log");
    const scene = neon();
    const before = JSON.stringify(scene);
    expect(
      compileConsole(scene, { target: "chromium", renderer: "svg" }),
    ).toEqual(compileConsole(scene, { target: "chromium", renderer: "svg" }));
    expect(JSON.stringify(scene)).toBe(before);
    expect(log).not.toHaveBeenCalled();
  });
  it("exposes literal preview segments, encoded substitutions and final reset", () => {
    const output = compileConsole(neon({ text: "100% %c" }), {
      target: "chromium",
      renderer: "css",
    });
    expect(output.args[2]).toBe("100%% %%c");
    expect(output.args.at(-1)).toBe("");
    expect(
      output.preview.kind === "css" && output.preview.lines[0]?.runs[0]?.text,
    ).toBe("100% %c");
    expect(output.byteLength).toBe(
      output.args.reduce((size, value) => size + utf8ByteLength(value), 0),
    );
  });
  it("errors for unsupported explicit renderer choices and only falls back on request", () => {
    const scene = rainbow();
    expect(() => compileConsole(scene, { renderer: "svg" })).toThrow(
      ConsoleCompileError,
    );
    expect(() =>
      compileConsole(scene, { target: "chromium", renderer: "css" }),
    ).toThrow(ConsoleCompileError);
    const fallback = compileConsole(scene, {
      renderer: "svg",
      unsupported: "fallback",
    });
    expect(fallback).toMatchObject({
      renderer: "text",
      animated: false,
      preview: { kind: "text" },
    });
    expect(fallback.diagnostics).toContainEqual(
      expect.objectContaining({ code: "renderer-fallback" }),
    );
    expect(() =>
      compileConsole({ ...scene, schemaVersion: 2 } as never, {
        unsupported: "fallback",
      }),
    ).toThrow(ConsoleCompileError);
  });
  it("emits only once when requested and reads media preference only at emission", () => {
    const sink = vi.fn();
    const query = vi.fn(() => ({ matches: true }));
    vi.stubGlobal("matchMedia", query);
    const scene = neon({ motion: "wave" });
    compileConsole(scene);
    expect(query).not.toHaveBeenCalled();
    emitConsole(
      scene,
      { target: "chromium", renderer: "svg", motion: "system" },
      sink,
    );
    expect(query).toHaveBeenCalledOnce();
    expect(sink).toHaveBeenCalledOnce();
    vi.unstubAllGlobals();
  });
  it("uses static motion for absent, reduced, unknown, or throwing preferences", () => {
    for (const query of [
      undefined,
      () => ({ matches: false }),
      () => ({}),
      () => {
        throw new Error("unavailable");
      },
    ]) {
      vi.stubGlobal("matchMedia", query);
      expect(resolveMotion()).toBe("reduce");
    }
    vi.unstubAllGlobals();
  });
});

describe("generated SVG boundary", () => {
  const dom = new JSDOM();
  it.each(["\uFFFE", "\uFFFF"])(
    "rejects XML-unrepresentable text with explicit lossless fallback: %s",
    (character) => {
      for (const inLabel of [false, true]) {
        const scene = defineScene({
          ...neon({ text: inLabel ? "Visible" : `Before${character}after %s` }),
          label: inLabel ? character : "Valid label",
        });
        const options = { target: "chromium", renderer: "svg" } as const;
        expect(() => compileConsole(scene, options)).toThrowError(
          expect.objectContaining({
            diagnostics: [
              expect.objectContaining({
                code: "unsupported-svg-text",
                severity: "error",
                path: inLabel ? ["label"] : ["lines", 0, "runs", 0, "text"],
              }),
            ],
          }),
        );
        const text = scene.lines[0]!.runs[0]!.text;
        const fallback = compileConsole(scene, {
          ...options,
          unsupported: "fallback",
        });
        expect(fallback.renderer).toBe("text");
        expect(fallback.args).toEqual([text]);
        expect(
          compileConsole(scene, { ...options, renderer: "css" }).text,
        ).toBe(text);
      }
      const replacement = compileConsole(neon({ text: "\uFFFD" }), {
        target: "chromium",
        renderer: "svg",
      });
      if (replacement.preview.kind !== "svg") throw new Error("SVG expected");
      const xml = decodeURIComponent(
        replacement.preview.imageUri.split(",")[1]!,
      );
      expect(
        new dom.window.DOMParser()
          .parseFromString(xml, "image/svg+xml")
          .querySelector("parsererror"),
      ).toBeNull();
    },
  );
  const allowed = new Set([
    "svg",
    "defs",
    "rect",
    "text",
    "g",
    "path",
    "linearGradient",
    "stop",
    "filter",
    "feGaussianBlur",
    "feMerge",
    "feMergeNode",
    "pattern",
    "animate",
    "animateTransform",
  ]);
  it.each(PRESETS.filter((item) => item.group === "Classic"))(
    "renders $name as internal XML with the exact preview URI",
    ({ id }) => {
      const output = compileConsole(preset(id, { text: '<script>"& %c 👩🏽‍💻' }), {
        target: "chromium",
        renderer: "svg",
      });
      if (output.preview.kind !== "svg") throw new Error("Expected SVG");
      expect(output.args[1]).toContain(output.preview.imageUri);
      const xml = decodeURIComponent(
        output.preview.imageUri.split(",").slice(1).join(","),
      );
      const document = new dom.window.DOMParser().parseFromString(
        xml,
        "image/svg+xml",
      );
      expect(document.querySelector("parsererror")).toBeNull();
      expect(document.querySelector("text")?.textContent).toBe(
        '<script>"& %c 👩🏽‍💻',
      );
      const nodes = [...document.querySelectorAll("*")];
      expect(nodes.length).toBeLessThanOrEqual(1000);
      for (const node of nodes) {
        expect(allowed.has(node.localName)).toBe(true);
        for (const attribute of node.attributes) {
          expect(attribute.name).not.toMatch(/^on|href/);
          if (attribute.value.includes("url("))
            expect(attribute.value).toMatch(/^url\(#fx-[\w-]+\)$/);
        }
      }
      expect(document.querySelector("animate,animateTransform")).toBeNull();
    },
  );
  it.each(["glowPulse", "gradientDrift", "wave", "indicator"] as const)(
    "bounds %s motion and provides a static alternative",
    (motion) => {
      const scene = rainbow({ motion });
      const animated = compileConsole(scene, {
        target: "chromium",
        renderer: "svg",
        motion: "allow",
      });
      const still = compileConsole(scene, {
        target: "chromium",
        renderer: "svg",
      });
      expect(animated.animated).toBe(true);
      expect(still.animated).toBe(false);
      if (animated.preview.kind !== "svg" || still.preview.kind !== "svg")
        throw new Error("Expected SVG");
      const xml = decodeURIComponent(
        animated.preview.imageUri.split(",").slice(1).join(","),
      );
      expect(xml).not.toContain("indefinite");
      const document = new dom.window.DOMParser().parseFromString(
        xml,
        "image/svg+xml",
      );
      for (const animation of document.querySelectorAll(
        "animate,animateTransform",
      )) {
        expect(animation.getAttribute("repeatDur")).toBe("4800ms");
        expect(animation.getAttribute("fill")).toBe("freeze");
      }
      expect(decodeURIComponent(still.preview.imageUri)).not.toContain(
        "<animate",
      );
      expect(animated.diagnostics).toContainEqual(
        expect.objectContaining({ code: "experimental-animation" }),
      );
    },
  );
  it("returns diagnostics for likely clipping without inventing measured layout", () => {
    const output = compileConsole(
      defineScene({
        schemaVersion: 1,
        label: "long",
        surface: { width: 100, height: 80, padding: 0 },
        lines: [
          { runs: [{ text: "A long message", style: { fontSize: 96 } }] },
        ],
      }),
      { target: "chromium", renderer: "svg" },
    );
    expect(output.diagnostics).toContainEqual(
      expect.objectContaining({ code: "possible-clipping" }),
    );
  });
});
