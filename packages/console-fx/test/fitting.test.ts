import { describe, expect, it, vi, afterEach } from "vitest";
import { JSDOM } from "jsdom";
import {
  compileConsole,
  ConsoleCompileError,
  emitConsole,
  prepareTextMeasurements,
  measureTextBatch,
} from "../src/browser/index.js";
import { defineScene, parseScene, parseRenderRecipe } from "../src/index.js";
import {
  neon,
  lightningMetal,
  letterpress,
  liquidChrome,
  buildReceipt,
} from "../src/presets/index.js";
import { exportConsoleLog } from "../src/codegen/index.js";
import type {
  CompileOptions,
  LayoutRequest,
  MeasurementSnapshot,
  SceneInputV1,
} from "../src/model/types.js";
import { normalizeMeasurements } from "../src/validation/layout.js";

const layout: LayoutRequest = {
  algorithm: "fit/v1",
  width: 360,
  maxHeight: 400,
  variant: "standard",
  overflow: "wrap-then-shrink",
  minFontSize: 12,
};
const options: CompileOptions = { target: "chromium", renderer: "svg", layout };

describe("fitting text boundary recovery", () => {
  const fit = {
    ...options,
    layout: { ...layout, width: 70, overflow: "wrap" as const },
  };
  const message = (texts: string[]): SceneInputV1 => ({
    schemaVersion: 1,
    label: "Joined text",
    surface: { padding: 0 },
    lines: [{ runs: texts.map((text) => ({ text, style: { fontSize: 20 } })) }],
  });
  it.each(["\u2060", "\ufeff"])(
    "keeps a no-break marker joined to preceding spaces across styles: %s",
    (joiner) => {
      for (const texts of [[`A ${joiner}B`], ["A ", `${joiner}B`]]) {
        const scene = message(texts);
        expect(() => compileConsole(scene, fit)).toThrow(ConsoleCompileError);
        const fallback = compileConsole(scene, {
          ...fit,
          unsupported: "fallback",
        });
        expect(fallback.renderer).toBe("text");
        expect(fallback.text).toBe(`A ${joiner}B`);
        const calls: unknown[][] = [];
        new Function(
          "console",
          exportConsoleLog(scene, {
            ...fit,
            motion: "reduce",
            unsupported: "fallback",
          }).code,
        )({ log: (...args: unknown[]) => calls.push(args) });
        expect(calls).toEqual([fallback.args]);
      }
    },
  );
  it("retains whole paragraphs and typed recovery without Intl.Segmenter", () => {
    const descriptor = Object.getOwnPropertyDescriptor(Intl, "Segmenter")!;
    Object.defineProperty(Intl, "Segmenter", { value: undefined });
    try {
      const scene = message(["A long ", "joined paragraph"]);
      const output = compileConsole(scene, {
        ...fit,
        layout: { ...fit.layout, width: 1000 },
      });
      expect(output.renderer).toBe("svg");
      expect(output.layout?.visualRows).toBe(1);
      expect(output.layout?.fragments.map((f) => f.text).join("")).toBe(
        "A long joined paragraph",
      );
      expect(output.diagnostics.map((d) => d.code)).toContain(
        "segmentation-unavailable",
      );
      const fallback = compileConsole(scene, {
        ...fit,
        layout: { ...fit.layout, overflow: "error" },
        unsupported: "fallback",
      });
      expect(fallback.renderer).toBe("text");
      expect(fallback.text).toBe("A long joined paragraph");
      expect(fallback.diagnostics.map((d) => d.code)).toContain(
        "layout-overflow",
      );
    } finally {
      Object.defineProperty(Intl, "Segmenter", descriptor);
    }
  });
});
function simple(text: string): SceneInputV1 {
  return {
    schemaVersion: 1,
    label: "Test",
    surface: { padding: 12 },
    lines: [
      {
        runs: [
          {
            text,
            style: { fontSize: 30, fontFamily: "sans", fontWeight: 400 },
          },
        ],
      },
    ],
  };
}
function snapshot(
  scene: SceneInputV1,
  settings: CompileOptions = options,
): MeasurementSnapshot {
  const preflight = prepareTextMeasurements(scene, {
    ...settings,
    measurementEnvironment: "test-fonts-v1",
  });
  expect(preflight.ok).toBe(true);
  if (!preflight.ok) throw new Error("preflight failed");
  return normalizeMeasurements({
    kind: "consoleFxMeasurements",
    measurementVersion: 1,
    environment: "test-fonts-v1",
    records: preflight.value.map((request) => ({
      request,
      advance: request.text.length * request.style.fontSize * 0.5,
      inkLeft: 2,
      inkRight: request.text.length * request.style.fontSize * 0.5 + 3,
      ascent: request.style.fontSize * 0.8,
      descent: request.style.fontSize * 0.2,
    })),
  });
}
afterEach(() => vi.unstubAllGlobals());
describe("explicit fitting contracts", () => {
  it("preserves fractional legacy dimensions without proportional recomputation", () => {
    const output = compileConsole(
      { ...simple("x"), surface: { width: 80.1, height: 120.123 } },
      { target: "chromium", renderer: "svg" },
    );
    expect(output.preview).toMatchObject({ width: 80.1, height: 120.123 });
    expect(output.args[1]).toContain("60.0615px");
  });
  it("wraps across styled runs without inventing breaks inside identifiers", () => {
    const settings = {
      ...options,
      layout: {
        ...layout,
        width: 90,
        maxHeight: 200,
        overflow: "wrap" as const,
      },
    };
    for (const parts of [["one two"], ["one ", "two"], ["on", "e ", "two"]]) {
      const scene = defineScene({
        schemaVersion: 1,
        label: "wrapped",
        surface: { padding: 0 },
        lines: [
          {
            runs: parts.map((text) => ({
              text,
              style: { fontFamily: "mono", fontSize: 20 },
            })),
          },
        ],
      });
      const output = compileConsole(scene, settings);
      expect(output.layout?.visualRows).toBe(2);
      expect(
        output.layout?.fragments.map((fragment) => fragment.text).join(""),
      ).toBe("one two");
    }
    expect(() =>
      compileConsole(
        {
          schemaVersion: 1,
          label: "ID",
          surface: { padding: 0 },
          lines: [
            {
              runs: ["long-", "identifier"].map((text) => ({
                text,
                style: { fontFamily: "mono", fontSize: 20 },
              })),
            },
          ],
        },
        settings,
      ),
    ).toThrow(ConsoleCompileError);
  });
  it("keeps the serialized cinematic scale equal to its fitted font size", () => {
    const scene = {
      ...lightningMetal({ text: "H", depth: 0, glow: 0, ornaments: false }),
      surface: { padding: 0 },
    };
    const output = compileConsole(scene, {
      ...options,
      layout: {
        ...layout,
        width: 6.2,
        maxHeight: 12,
        overflow: "shrink",
        minFontSize: 8,
      },
      sizing: { mode: "fixed", width: 217 },
    });
    if (output.preview.kind !== "svg") throw new Error("expected svg");
    const svg = decodeURIComponent(output.preview.imageUri.split(",")[1]!);
    const scale = Number(svg.match(/translate\([^)]*\) scale\(([^)]+)\)/)?.[1]);
    expect(scale * 100).toBeCloseTo(output.layout!.fragments[0]!.fontSize, 12);
    expect(scale * 100 * output.layout!.displayScale!).toBeGreaterThanOrEqual(
      8 - 1e-8,
    );
  });
  it("shrinks rendered card slots without changing canonical separators", () => {
    const scene = buildReceipt({
      project: "H".repeat(17),
      outcome: "PASSED",
      revision: "a1b2c3",
      duration: "2s",
      checks: "4/4",
      environment: "local",
    });
    const settings: CompileOptions = {
      ...options,
      layout: {
        ...layout,
        width: 720,
        maxHeight: 240,
        overflow: "shrink",
        minFontSize: 8,
      },
    };
    const before = JSON.stringify(scene);
    const data = snapshot(scene, settings);
    const measurements = normalizeMeasurements({
      ...data,
      records: data.records.map((record) =>
        record.request.text === "H".repeat(17)
          ? {
              ...record,
              advance: record.request.style.fontSize * 15.1,
              inkLeft: 0,
              inkRight: record.request.style.fontSize * 15.1,
            }
          : record,
      ),
    });
    const output = compileConsole(scene, {
      ...settings,
      measurements,
      measurementEnvironment: "test-fonts-v1",
    });
    expect(output.layout!.contentScale).toBeLessThan(1);
    expect(output.layout!.shrinkCandidates).toBeGreaterThan(1);
    expect(
      output.layout!.fragments.every((fragment) => fragment.fontSize >= 8),
    ).toBe(true);
    expect(JSON.stringify(scene)).toBe(before);
  });
  it("preserves legacy output when fitting requests are absent", () => {
    for (const scene of [
      neon(),
      lightningMetal(),
      liquidChrome(),
      letterpress(),
    ]) {
      const legacy = compileConsole(scene, {
        target: "chromium",
        renderer: "svg",
      });
      expect(
        compileConsole(scene, {
          target: "chromium",
          renderer: "svg",
          layout: undefined,
          sizing: undefined,
        } as never),
      ).toEqual(legacy);
      expect(legacy.layout).toBeUndefined();
    }
  });
  it("reserves complete paint and wave extents while preserving canonical Unicode", () => {
    const text = "Hello %c world 👩🏽‍💻 e\u0301 中文 مرحبا\nSecond row";
    const scene = defineScene({
      ...simple(text),
      lines: [
        {
          runs: [
            {
              text,
              style: { fontSize: 30 },
              effects: [{ kind: "neon" }, { kind: "wave", amplitude: 10 }],
            },
          ],
        },
      ],
    });
    const before = JSON.stringify(scene);
    const output = compileConsole(scene, { ...options, motion: "allow" });
    expect(output.text).toBe(text);
    expect(JSON.stringify(scene)).toBe(before);
    expect(output.layout?.measurementQuality).toBe("estimated");
    expect(output.layout?.verdict).toBe("estimated-fit");
    expect(output.layout!.paint.x).toBeGreaterThanOrEqual(12 - 1e-6);
    expect(output.layout!.paint.y).toBeGreaterThanOrEqual(12 - 1e-6);
    expect(
      output.layout!.paint.x + output.layout!.paint.width,
    ).toBeLessThanOrEqual(348 + 1e-6);
    expect(
      output.layout!.paint.y + output.layout!.paint.height,
    ).toBeLessThanOrEqual(output.layout!.artboard.height - 12 + 1e-6);
    expect(output.layout!.fragments.map((f) => f.text).join("")).toBe(
      text.replaceAll("\n", ""),
    );
    expect(output.layout!.visualRows).toBeLessThanOrEqual(8);
    expect(output.layout!.shapingRequests).toBeLessThanOrEqual(512);
    expect(output.layout!.shrinkCandidates).toBeLessThanOrEqual(16);
    expect(Object.isFrozen(output.layout!.fragments[0])).toBe(true);
  });
  it("uses authored cinematic geometry for fitting and rejects impossible floors", () => {
    const output = compileConsole(
      lightningMetal({ text: "BUILD 2026" }),
      options,
    );
    expect(output.layout?.measurementQuality).toBe("authored-geometry");
    expect(output.layout?.measurementRequests).toEqual([]);
    expect(output.layout!.fragments.every((f) => f.fontSize >= 12)).toBe(true);
    expect(() =>
      compileConsole(lightningMetal({ text: "LONG BUILD TITLE" }), {
        ...options,
        layout: { ...layout, width: 20, maxHeight: 40 },
      }),
    ).toThrow(ConsoleCompileError);
  });
  it("separates fixed display sizing from fitting and reports experimental uncertainty", () => {
    const scene = simple("Hello");
    const fixed = compileConsole(scene, {
      ...options,
      sizing: { mode: "fixed", width: 240 },
    });
    expect(fixed.layout?.artboard.width).toBe(360);
    expect(fixed.layout?.resolvedDisplayWidth).toBe(240);
    expect(fixed.layout?.resolvedDisplayHeight).toBeCloseTo(
      (fixed.layout!.artboard.height * 2) / 3,
    );
    const dynamic = compileConsole(scene, {
      ...options,
      sizing: { mode: "container-experimental", maxWidth: 360 },
    });
    expect(dynamic.layout?.resolvedDisplayWidth).toBeNull();
    expect(dynamic.layout?.resolvedDisplayHeight).toBeNull();
    expect(dynamic.layout?.displayReadability).toBe("unknown");
    expect(dynamic.args[1]).toContain("min(180px, 48%)");
    expect(dynamic.diagnostics.map((d) => d.code)).toContain(
      "experimental-container-sizing",
    );
    expect(() =>
      compileConsole(scene, {
        ...options,
        sizing: { mode: "container-experimental", maxWidth: 721 },
      }),
    ).toThrow(ConsoleCompileError);
  });
  it("never hides impossible content or invalid requests behind fallback", () => {
    const text = "unbreakable/".repeat(100),
      scene = simple(text);
    const fallback = compileConsole(scene, {
      ...options,
      unsupported: "fallback",
    });
    expect(fallback.renderer).toBe("text");
    expect(fallback.args).toEqual([text]);
    expect(() =>
      compileConsole(scene, {
        ...options,
        unsupported: "fallback",
        layout: { ...layout, width: NaN },
      }),
    ).toThrow(ConsoleCompileError);
    expect(() =>
      compileConsole(scene, {
        ...options,
        unsupported: "fallback",
        layout: { ...layout, algorithm: "fit/v99" },
      } as never),
    ).toThrow(ConsoleCompileError);
    expect(() =>
      compileConsole(scene, { ...options, renderer: "css" }),
    ).toThrow(ConsoleCompileError);
    expect(
      compileConsole(scene, {
        ...options,
        renderer: "css",
        unsupported: "fallback",
      }).renderer,
    ).toBe("text");
  });
  it("does not invent compact layouts for ordinary flow scenes", () => {
    expect(() =>
      compileConsole(simple("Unprofiled"), {
        ...options,
        layout: { ...layout, variant: "compact" },
      }),
    ).toThrow(ConsoleCompileError);
  });
  it("reports unknown carrier dimensions even without a content fitting request", () => {
    const scene = simple("Hello");
    const output = compileConsole(scene, {
      target: "chromium",
      renderer: "svg",
      sizing: { mode: "container-experimental", maxWidth: 600 },
    });
    expect(output.layout).toBeUndefined();
    expect(output.outputSizing).toMatchObject({
      resolvedDisplayWidth: null,
      resolvedDisplayHeight: null,
      displayReadability: "unknown",
    });
    expect(() =>
      compileConsole(scene, {
        target: "chromium",
        renderer: "svg",
        sizing: { mode: "fixed", width: 30 },
      }),
    ).toThrow(ConsoleCompileError);
  });
  it("exports one precompiled call and never measures or emits while compiling", () => {
    const scene = simple("Hello %s 👩🏽‍💻");
    const canvas = vi.fn();
    vi.stubGlobal("OffscreenCanvas", canvas);
    const sink = vi.fn();
    const output = compileConsole(scene, options);
    expect(canvas).not.toHaveBeenCalled();
    const exported = exportConsoleLog(scene, { ...options, motion: "reduce" });
    new Function("console", exported.code)({ log: sink });
    expect(sink).toHaveBeenCalledExactlyOnceWith(...output.args);
    expect(exported.code).not.toMatch(
      /measureText|ResizeObserver|setInterval|OffscreenCanvas|document/,
    );
    const emitted = vi.fn();
    emitConsole(scene, { ...options, motion: "reduce" }, emitted);
    expect(emitted).toHaveBeenCalledOnce();
  });
});
describe("optional data-only font measurements", () => {
  it("recovers estimated CJK row overflow using a bounded measured preflight", () => {
    const text = "漢".repeat(45);
    const scene = {
      schemaVersion: 1 as const,
      label: "CJK",
      surface: { padding: 0 },
      lines: [{ runs: [{ text, style: { fontSize: 20 } }] }],
    };
    const settings: CompileOptions = {
      ...options,
      layout: { ...layout, width: 200, maxHeight: 200, overflow: "wrap" },
    };
    expect(() => compileConsole(scene, settings)).toThrow(ConsoleCompileError);
    const measurements = snapshot(scene, settings);
    expect(measurements.records.length).toBeGreaterThan(0);
    expect(measurements.records.length).toBeLessThanOrEqual(512);
    const output = compileConsole(scene, {
      ...settings,
      measurements,
      measurementEnvironment: "test-fonts-v1",
    });
    expect(output.text).toBe(text);
    expect(output.layout!.visualRows).toBeLessThanOrEqual(8);
    expect(output.layout!.measurementQuality).toBe("measured-local-font");
  });
  it("returns typed preflight failures for incompatible valid scenes", () => {
    const settings = { ...options, measurementEnvironment: "test-fonts-v1" };
    expect(
      prepareTextMeasurements(lightningMetal({ text: "漢字" }), settings),
    ).toMatchObject({
      ok: false,
      diagnostics: [{ code: "unsupported-cinematic-glyph" }],
    });
    expect(
      prepareTextMeasurements(
        { ...letterpress(), lines: [{ runs: [{ text: "detached" }] }] },
        settings,
      ).ok,
    ).toBe(false);
  });
  it("uses exact shaping records and signed overhangs only for the named environment", () => {
    const scene = simple("office WWW");
    const measurements = snapshot(scene);
    const measured = compileConsole(scene, {
      ...options,
      measurements,
      measurementEnvironment: "test-fonts-v1",
    });
    expect(measured.layout?.measurementQuality).toBe("measured-local-font");
    expect(measured.layout?.measurementRequests).toEqual([]);
    expect(measured.diagnostics.map((d) => d.code)).toContain(
      "platform-font-variation",
    );
    for (const input of [
      { measurements },
      { measurements, measurementEnvironment: "another-host" },
    ]) {
      const result = compileConsole(scene, { ...options, ...input });
      expect(result.layout?.measurementQuality).toBe("estimated");
      expect(result.diagnostics.map((d) => d.code)).toContain(
        "stale-measurement",
      );
    }
    const stale = compileConsole(simple("changed"), {
      ...options,
      measurements,
      measurementEnvironment: "test-fonts-v1",
    });
    expect(stale.layout?.measurementQuality).toBe("estimated");
  });
  it("rejects corrupt, duplicate, oversized and accessor-driven snapshots before fallback", () => {
    const scene = simple("abc");
    const measurements = snapshot(scene);
    const first = measurements.records[0]!;
    for (const invalid of [
      { ...measurements, measurementVersion: 2 },
      { ...measurements, records: [{ ...first, advance: Infinity }] },
      {
        ...measurements,
        records: [
          { ...first, request: { ...first.request, text: "not the key" } },
        ],
      },
      { ...measurements, records: [first, first] },
      { ...measurements, records: Array(513).fill(first) },
    ])
      expect(() =>
        compileConsole(scene, {
          ...options,
          measurements: invalid as never,
          unsupported: "fallback",
        }),
      ).toThrow(ConsoleCompileError);
    const getter = vi.fn();
    expect(() =>
      compileConsole(scene, {
        ...options,
        measurements: {
          get records() {
            return getter();
          },
        } as never,
      }),
    ).toThrow(ConsoleCompileError);
    expect(getter).not.toHaveBeenCalled();
  });
  it("declines unavailable or web-font-bearing contexts without making a canvas", () => {
    const scene = simple("abc");
    const preflight = prepareTextMeasurements(scene, {
      ...options,
      measurementEnvironment: "test-fonts-v1",
    });
    expect(preflight.ok).toBe(true);
    if (!preflight.ok) return;
    const makeCanvas = vi.fn();
    vi.stubGlobal("OffscreenCanvas", makeCanvas);
    vi.stubGlobal("document", {
      fonts: { size: 1 },
      createElement: makeCanvas,
    });
    expect(measureTextBatch(preflight.value, "test-fonts-v1")).toMatchObject({
      ok: false,
      diagnostics: [{ code: "measurement-unavailable" }],
    });
    expect(makeCanvas).not.toHaveBeenCalled();
  });
  it("preflights fonts even when conservative layout bounds cannot fit", () => {
    const result = prepareTextMeasurements(letterpress(), {
      ...options,
      layout: {
        ...layout,
        width: 720,
        maxHeight: 240,
        overflow: "error",
        minFontSize: 8,
      },
      measurementEnvironment: "Windows-local-v1",
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.length).toBeGreaterThan(0);
  });
});
describe("render recipe compatibility", () => {
  it("round-trips explicit intent while raw-scene parsing rejects the envelope", () => {
    const recipe = {
      kind: "consoleFxRenderRecipe",
      recipeVersion: 1,
      scene: simple("saved"),
      options: {
        ...options,
        motion: "system",
        sizing: { mode: "container-experimental", maxWidth: 360 },
      },
    };
    const parsed = parseRenderRecipe(recipe);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.options.sizing).toEqual({
      mode: "container-experimental",
      maxWidth: 360,
      fillFraction: 0.96,
    });
    expect(parseRenderRecipe(JSON.parse(JSON.stringify(parsed.value)))).toEqual(
      parsed,
    );
    expect(parseScene(parsed.value).ok).toBe(false);
    expect(Object.isFrozen(parsed.value.scene.lines)).toBe(true);
    expect(parseRenderRecipe({ ...recipe, recipeVersion: 2 }).ok).toBe(false);
    expect(
      parseRenderRecipe({
        ...recipe,
        options: { ...recipe.options, measurements: snapshot(simple("saved")) },
      }).ok,
    ).toBe(false);
  });
  it("keeps text, caption and serialized line fragments consistent", () => {
    const scene = simple("alpha beta gamma delta epsilon");
    const output = compileConsole(scene, {
      ...options,
      layout: { ...layout, width: 170 },
    });
    if (output.preview.kind !== "svg") throw new Error("expected svg");
    const document = new JSDOM().window.document;
    const div = document.createElement("div");
    div.innerHTML = decodeURIComponent(output.preview.imageUri.split(",")[1]!);
    expect(
      [...div.querySelectorAll("text")].map((t) => t.textContent).join(""),
    ).toBe(scene.lines[0]!.runs[0]!.text);
    expect(output.text).toBe(scene.lines[0]!.runs[0]!.text);
  });
});
