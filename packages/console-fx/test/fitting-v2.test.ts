import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, it, expect, vi } from "vitest";
import {
  compileConsole,
  prepareTextMeasurements,
} from "../src/browser/index.js";
import { exportConsoleLog } from "../src/codegen/index.js";
import {
  createPresetExample,
  letterpress,
  type PresetId,
} from "../src/presets/index.js";
import {
  defineScene,
  parseRenderRecipe,
  getEffectDescriptors,
  getPresentationDescriptors,
} from "../src/index.js";
import { normalizeMeasurements } from "../src/validation/layout.js";
import type { CompileOptions, LayoutRequest } from "../src/model/types.js";

const layout: LayoutRequest = {
  algorithm: "fit/v2",
  width: 360,
  maxHeight: 400,
  variant: "auto",
  overflow: "wrap-then-shrink",
  minFontSize: 12,
};
const options: CompileOptions = {
  renderer: "svg",
  target: "chromium",
  motion: "reduce",
  layout,
};
const hash = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
const baseline = JSON.parse(
  readFileSync(
    new URL("./fixtures/fit-v1-compatibility.json", import.meta.url),
    "utf8",
  ),
) as {
  source: string;
  descriptors: unknown;
  cases: {
    id: PresetId;
    mode: string;
    options: CompileOptions;
    expected: { compiled?: string; exported?: string; diagnostics?: unknown };
  }[];
};

describe("versioned fitting compatibility", () => {
  it("preserves every recorded v1 output, report, export, failure and fallback", () => {
    expect({
      cards: getPresentationDescriptors(),
      effects: getEffectDescriptors(),
    }).toEqual(baseline.descriptors);
    for (const fixture of baseline.cases) {
      const scene = createPresetExample(fixture.id);
      let actual;
      try {
        actual = {
          compiled: hash(compileConsole(scene, fixture.options)),
          exported: hash(
            exportConsoleLog(scene, { ...fixture.options, motion: "reduce" }),
          ),
        };
      } catch (error) {
        actual = {
          diagnostics: (error as { diagnostics: unknown }).diagnostics,
        };
      }
      expect(actual, `${fixture.id}/${fixture.mode}`).toEqual(fixture.expected);
    }
  });
  it("clamps small fields while fitting larger text, without mutating the source", () => {
    const scene = defineScene({
      schemaVersion: 1,
      label: "Readability",
      surface: { padding: 8 },
      lines: [
        { runs: [{ text: "A larger heading", style: { fontSize: 48 } }] },
        { runs: [{ text: "small but readable", style: { fontSize: 12 } }] },
      ],
    });
    const original = JSON.stringify(scene);
    expect(() =>
      compileConsole(scene, {
        ...options,
        layout: { ...layout, algorithm: "fit/v1", overflow: "shrink" },
      }),
    ).toThrow();
    const log = vi.spyOn(console, "log");
    try {
      const result = compileConsole(scene, {
        ...options,
        layout: { ...layout, overflow: "shrink" },
      });
      expect(result.layout!.fragments.map((f) => f.fontSize)).toEqual([
        expect.any(Number),
        12,
      ]);
      expect(result.layout!.fragments[0]!.fontSize).toBeLessThan(48);
      expect(result.layout!.shrinkCandidates).toBeLessThanOrEqual(16);
      expect(result.layout!.shapingRequests).toBeLessThanOrEqual(512);
      expect(result.layout!.measurementQuality).toBe("estimated");
      expect(log).not.toHaveBeenCalled();
      expect(JSON.stringify(scene)).toBe(original);
    } finally {
      log.mockRestore();
    }
  });
  it("keeps algorithm identities isolated and validates optional font data", () => {
    const scene = defineScene({
      schemaVersion: 1,
      label: "",
      surface: { padding: 8 },
      lines: [{ runs: [{ text: "text", style: { fontSize: 20 } }] }],
    });
    const settings = { ...options, measurementEnvironment: "test-fonts" };
    const v1 = prepareTextMeasurements(scene, {
      ...settings,
      layout: { ...layout, algorithm: "fit/v1" },
    });
    const v2 = prepareTextMeasurements(scene, settings);
    if (!v1.ok || !v2.ok) throw new Error("preflight failed");
    expect(v1.value[0]!.key).not.toBe(v2.value[0]!.key);
    const snapshot = normalizeMeasurements({
      kind: "consoleFxMeasurements",
      measurementVersion: 1,
      environment: "test-fonts",
      records: v1.value.map((request) => ({
        request,
        advance: 40,
        inkLeft: 0,
        inkRight: 40,
        ascent: 15,
        descent: 5,
      })),
    });
    expect(
      compileConsole(scene, { ...settings, measurements: snapshot }).layout!
        .measurementQuality,
    ).toBe("estimated");
    expect(() =>
      normalizeMeasurements({
        ...snapshot,
        records: [{ ...snapshot.records[0], ascent: NaN }],
      }),
    ).toThrow();
    expect(
      parseRenderRecipe({
        kind: "consoleFxRenderRecipe",
        recipeVersion: 1,
        scene,
        options,
      }).ok,
    ).toBe(true);
    expect(
      parseRenderRecipe({
        kind: "consoleFxRenderRecipe",
        recipeVersion: 1,
        scene,
        options: { ...options, layout: { ...layout, algorithm: "fit/v3" } },
      }).ok,
    ).toBe(false);
  });
  it("keeps measured paint below the original letterpress dividers", () => {
    const scene = letterpress({ title: "A" });
    const settings: CompileOptions = {
      ...options,
      layout: { ...layout, width: 960, variant: "standard", overflow: "error" },
      measurementEnvironment: "large-ascent",
    };
    const batch = prepareTextMeasurements(scene, settings);
    if (!batch.ok) throw new Error("preflight failed");
    const measurements = normalizeMeasurements({
      kind: "consoleFxMeasurements",
      measurementVersion: 1,
      environment: "large-ascent",
      records: batch.value.map((request) => ({
        request,
        advance: request.style.fontSize,
        inkLeft: 0,
        inkRight: request.style.fontSize,
        ascent: request.text === "A" ? 100 : request.style.fontSize * 0.75,
        descent: request.text === "A" ? 0 : request.style.fontSize * 0.15,
      })),
    });
    // A candidate can fail or remain within the existing cell; it cannot cross y=53.
    try {
      const output = compileConsole(scene, { ...settings, measurements });
      const title = output.layout!.fragments.find(
        (fragment) => fragment.slot === "title",
      )!;
      expect(title.paint.y).toBeGreaterThanOrEqual((54 * 960) / 720);
    } catch (error) {
      expect(error).toMatchObject({
        diagnostics: expect.arrayContaining([
          expect.objectContaining({ code: "layout-overflow" }),
        ]),
      });
    }
  });
  it("retains explicit failure/fallback and bounded optional batches for impossible content", () => {
    const scene = defineScene({
      schemaVersion: 1,
      label: "",
      surface: { padding: 0 },
      lines: [{ runs: [{ text: "W".repeat(200), style: { fontSize: 96 } }] }],
    });
    const settings = {
      ...options,
      layout: {
        ...layout,
        width: 80,
        maxHeight: 40,
        overflow: "shrink" as const,
      },
      measurementEnvironment: "test",
    };
    expect(() => compileConsole(scene, settings)).toThrow();
    expect(
      compileConsole(scene, { ...settings, unsupported: "fallback" }).renderer,
    ).toBe("text");
    const preflight = prepareTextMeasurements(scene, settings);
    if (!preflight.ok) throw new Error("preflight failed");
    expect(preflight.value.length).toBeGreaterThan(0);
    expect(preflight.value.length).toBeLessThanOrEqual(512);
    const measured = normalizeMeasurements({
      kind: "consoleFxMeasurements",
      measurementVersion: 1,
      environment: "test",
      records: preflight.value.map((request) => ({
        request,
        advance: 900,
        inkLeft: 0,
        inkRight: 900,
        ascent: 12,
        descent: 4,
      })),
    });
    expect(Buffer.byteLength(JSON.stringify(measured))).toBeLessThanOrEqual(
      65536,
    );
    expect(() =>
      normalizeMeasurements({
        ...measured,
        records: Array.from({ length: 513 }, () => measured.records[0]),
      }),
    ).toThrow();
  });
});
