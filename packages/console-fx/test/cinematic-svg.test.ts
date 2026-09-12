import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { defineScene } from "../src/index.js";
import { compileConsole, ConsoleCompileError } from "../src/browser/index.js";
import {
  iceCathedral,
  lightningMetal,
  liquidChrome,
  moltenGold,
} from "../src/presets/index.js";
import type { SceneV1 } from "../src/index.js";
import { GLYPHS } from "../src/renderers/cinematic/glyphs.js";

const dom = new JSDOM();
function svg(scene: SceneV1) {
  const result = compileConsole(scene, { target: "chromium", renderer: "svg" });
  if (result.preview.kind !== "svg") throw new Error("Expected SVG");
  const document = new dom.window.DOMParser().parseFromString(
    decodeURIComponent(result.preview.imageUri.split(",").slice(1).join(",")),
    "image/svg+xml",
  );
  expect(document.querySelector("parsererror")).toBeNull();
  return { document, result };
}
describe("bounded cinematic geometry", () => {
  it("reserves the ink overhang of every authored angular glyph", () => {
    for (const [letter, [advance, , inkRight]] of Object.entries(GLYPHS)) {
      if (inkRight <= advance) continue;
      const original = lightningMetal({
        text: letter + letter,
        depth: 0,
        glow: 0,
        ornaments: false,
      });
      const run = original.lines[0]!.runs[0]!;
      const scene = defineScene({
        ...original,
        surface: {
          ...original.surface,
          width: 2 * advance * 0.96 + 4,
          height: 104,
          padding: 0,
        },
        lines: [
          {
            runs: [
              {
                ...run,
                style: { ...run.style, fontSize: 96, letterSpacing: -2 },
              },
            ],
          },
        ],
      });
      expect(svg(scene).result.diagnostics, letter).toContainEqual(
        expect.objectContaining({ code: "possible-clipping" }),
      );
    }
  });
  it.each([lightningMetal, iceCathedral, liquidChrome, moltenGold])(
    "contains the glow below an unadorned, unextruded face",
    (factory) => {
      const scene = factory({
        text: "H",
        glow: 0.25,
        depth: 0,
        ornaments: false,
      });
      const { document, result } = svg(scene);
      const filter = document.querySelector("filter")!;
      const blur = Number(
        filter.querySelector("feGaussianBlur")!.getAttribute("stdDeviation"),
      );
      const top = Number(filter.getAttribute("y"));
      const bottom = top + Number(filter.getAttribute("height"));
      const height =
        scene.lines[0]!.runs[0]!.style.fontSize *
        (factory === iceCathedral ? 1.3 : 1);
      expect(top).toBeLessThanOrEqual(-3 * blur - 1.5);
      expect(bottom).toBeGreaterThanOrEqual(height + 3 * blur + 1.5);
      expect(
        result.diagnostics.some((d) => d.code === "possible-clipping"),
      ).toBe(false);
    },
  );
  it.each([lightningMetal, iceCathedral, liquidChrome, moltenGold])(
    "uses only internal definitions and safe finite static SVG",
    (factory) => {
      const { document, result } = svg(factory());
      expect(
        result.diagnostics.some((d) => d.code === "possible-clipping"),
      ).toBe(false);
      const allowed = new Set([
        "svg",
        "defs",
        "rect",
        "g",
        "path",
        "text",
        "use",
        "linearGradient",
        "stop",
        "filter",
        "feGaussianBlur",
      ]);
      const ids = [...document.querySelectorAll("[id]")].map((node) => node.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(document.querySelectorAll("*").length).toBeLessThanOrEqual(1000);
      for (const node of document.querySelectorAll("*")) {
        expect(allowed.has(node.localName)).toBe(true);
        for (const attribute of node.attributes) {
          expect(attribute.name).not.toMatch(/^on/);
          if (attribute.name === "href")
            expect(ids).toContain(attribute.value.slice(1));
          if (attribute.value.startsWith("url("))
            expect(ids).toContain(attribute.value.slice(5, -1));
          if (attribute.name === "href")
            expect(attribute.value).toMatch(/^#fx-/);
        }
      }
      for (const blur of document.querySelectorAll("feGaussianBlur"))
        expect(Number(blur.getAttribute("stdDeviation"))).toBeLessThanOrEqual(
          6,
        );
      const stops = [...document.querySelectorAll("stop")].map((node) =>
        Number(node.getAttribute("offset")),
      );
      expect(
        stops.some((offset, i) => i > 0 && offset - stops[i - 1]! <= 0.03),
      ).toBe(true);
    },
  );
  it("serializes only selected original glyphs, covers all ASCII capitals/digits, and preserves source case", () => {
    const { document, result } = svg(lightningMetal({ text: "AA-A" }));
    expect(document.querySelectorAll('defs > path[id*="-g"]')).toHaveLength(2);
    expect(document.querySelectorAll('use[href$="g65"]')).toHaveLength(3);
    expect(result.preview).toMatchObject({ alt: "AA-A" });
    for (const title of [
      "ABCDEFGHIJKLMNOPQRSTUVWX",
      "YZ0123456789 -",
      "Build 2026",
    ])
      expect(
        svg(moltenGold({ text: title })).document.querySelector("path"),
      ).not.toBeNull();
  });
  it("keeps internal references unique across multiple runs and profiles", () => {
    const a = lightningMetal({ text: "A" }).lines[0]!.runs[0]!;
    const b = moltenGold({ text: "B" }).lines[0]!.runs[0]!;
    const { document } = svg(
      defineScene({
        schemaVersion: 1,
        label: "A B",
        surface: { width: 840, height: 270 },
        lines: [{ runs: [a, b, a] }],
      }),
    );
    const ids = [...document.querySelectorAll("[id]")].map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const use of document.querySelectorAll("use"))
      expect(ids).toContain(use.getAttribute("href")!.slice(1));
  });
  it("removes zero-glow filters, floors bounded extrusion and handles empty titles", () => {
    const { document } = svg(
      lightningMetal({ glow: 0, depth: 2.9, ornaments: false }),
    );
    expect(document.querySelector("filter")).toBeNull();
    expect(
      document.querySelectorAll(
        'use[transform^="translate("][stroke-width="1"]',
      ),
    ).toHaveLength(2);
    for (const text of ["", "   ", "\t"]) {
      const empty = svg(lightningMetal({ text })).document;
      expect(empty.querySelector("path,text,use,filter")).toBeNull();
    }
  });
  it("diagnoses insufficient surfaces and supports an explicitly resized 480-pixel scene", () => {
    const scene = lightningMetal();
    const run = scene.lines[0]!.runs[0]!;
    const narrow = defineScene({
      ...scene,
      surface: { ...scene.surface, width: 480 },
      lines: [
        {
          ...scene.lines[0]!,
          runs: [{ ...run, style: { ...run.style, fontSize: 46 } }],
        },
      ],
    });
    expect(
      svg(narrow).result.diagnostics.some(
        (d) => d.code === "possible-clipping",
      ),
    ).toBe(false);
    expect(
      svg(
        defineScene({
          ...scene,
          surface: { ...scene.surface, width: 150, height: 120 },
        }),
      ).result.diagnostics,
    ).toContainEqual(expect.objectContaining({ code: "possible-clipping" }));
  });
  it("rejects oversized instance work before serializing a large scene", () => {
    const run = lightningMetal({ text: "ABCDEFGHIJKLMNOPQRSTUVWX", depth: 10 })
      .lines[0]!.runs[0]!;
    const scene = defineScene({
      schemaVersion: 1,
      label: "Bounded",
      surface: { width: 1200, height: 400 },
      lines: [{ runs: Array.from({ length: 32 }, () => run) }],
    });
    expect(() => svg(scene)).toThrow(ConsoleCompileError);
    expect(compileConsole(scene, { renderer: "text" }).renderer).toBe("text");
  });
});
