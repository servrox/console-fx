import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { JSDOM } from "jsdom";
import {
  compileConsole,
  prepareTextMeasurements,
} from "../src/browser/index.js";
import { createPresetExample } from "../src/presets/index.js";
import { exportConsoleLog } from "../src/codegen/index.js";
import {
  getPresentationDescriptors,
  parseRenderRecipe,
  parseScene,
} from "../src/index.js";
import type {
  CardPresetId,
  CompileOptions,
  SceneV1,
} from "../src/model/types.js";
import { normalizeMeasurements } from "../src/validation/layout.js";

const referenceRoot = new URL(
  "../../../docs/mockups/preset-compact-v1/",
  import.meta.url,
);
const references = JSON.parse(
  readFileSync(new URL("fixtures.json", referenceRoot), "utf8"),
) as {
  baselineStatus: string;
  presets: {
    id: CardPresetId;
    height: number;
    compactBelow: number;
    sha256: string;
    slots: {
      id: string;
      x: number;
      y: number;
      fontSize: number;
      fragments: string[];
    }[];
  }[];
};
const settings: CompileOptions = {
  target: "chromium",
  renderer: "svg",
  motion: "reduce",
  layout: {
    algorithm: "fit/v1",
    width: 360,
    maxHeight: 400,
    variant: "compact",
    overflow: "wrap-then-shrink",
    minFontSize: 12,
  },
  measurementEnvironment: "synthetic-compact-test/v1",
};
// Synthetic shaping data exercises planner contracts. Appearance is tested separately in Windows.
function measure(scene: SceneV1, options = settings): CompileOptions {
  const preflight = prepareTextMeasurements(scene, options);
  if (!preflight.ok) throw new Error(JSON.stringify(preflight.diagnostics));
  return {
    ...options,
    measurements: normalizeMeasurements({
      kind: "consoleFxMeasurements",
      measurementVersion: 1,
      environment: settings.measurementEnvironment,
      records: preflight.value.map((request) => ({
        request,
        advance: request.text.length * request.style.fontSize * 0.5,
        inkLeft: 0,
        inkRight: request.text.length * request.style.fontSize * 0.5,
        ascent: request.style.fontSize * 0.75,
        descent: request.style.fontSize * 0.15,
      })),
    }),
  };
}
describe("accepted compact card layouts", () => {
  it.each([
    ["serviceReady", "footer"],
    ["commandCard", "command"],
    ["commandCard", "instruction"],
  ] as const)("allows clearing the %s %s wrapping slot", (id, field) => {
    const scene = createPresetExample(id);
    const slot = getPresentationDescriptors()
      .find((d) => d.id === id)!
      .slots.find((s) => s.id === field)!;
    const empty = {
      ...scene,
      lines: scene.lines.map((line, li) => ({
        ...line,
        runs: line.runs.map((run, ri) =>
          li === slot.line && ri === slot.run ? { ...run, text: "" } : run,
        ),
      })),
    };
    expect(parseScene(empty).ok).toBe(true);
    const output = compileConsole(empty, measure(empty));
    expect(output.renderer).toBe("svg");
    expect(
      output
        .layout!.fragments.filter((f) => f.slot === field)
        .map((f) => f.text)
        .join(""),
    ).toBe("");
  });
  it.each(["error", "shrink"] as const)(
    "does not wrap the footer under %s policy",
    (overflow) => {
      const scene = createPresetExample("serviceReady");
      const options = {
        ...settings,
        layout: { ...settings.layout!, overflow },
      };
      const output = compileConsole(scene, measure(scene, options));
      expect(
        output.layout!.fragments.filter((f) => f.slot === "footer"),
      ).toHaveLength(1);
    },
  );
  it.each([
    ["buildReceipt", "project", 60],
    ["blueprint", "title", 70],
  ] as const)(
    "rejects %s ink invading neighboring text or original artwork",
    (id, field, ascent) => {
      const scene = createPresetExample(id);
      const slot = getPresentationDescriptors()
        .find((d) => d.id === id)!
        .slots.find((s) => s.id === field)!;
      const text = scene.lines[slot.line]!.runs[slot.run]!.text;
      const options = measure(scene);
      const measurements = normalizeMeasurements({
        ...options.measurements!,
        records: options.measurements!.records.map((r) =>
          r.request.text === text ? { ...r, ascent, descent: 14 } : r,
        ),
      });
      expect(() =>
        compileConsole(scene, { ...options, measurements }),
      ).toThrow();
      expect(
        compileConsole(scene, {
          ...options,
          measurements,
          unsupported: "fallback",
        }).renderer,
      ).toBe("text");
    },
  );
  it.each([
    ["contourMap", "title", "High contours above", 250, 34, 4],
    ["signalHalftone", "title", "Signal across", 250, 34, 4],
    ["letterpress", "footer", "A complete footer near the corner", 307, 9, 2],
    ["buildReceipt", "outcome", "PASSED", 54, 9, 2],
    ["serviceReady", "state", "READY", 70, 9, 2],
    ["serviceReady", "envLabel", "ENVIRONMENT", 119.4, 9, 2],
    ["releaseBulletin", "channel", "Preview channel", 50, 21, 2],
  ] as const)(
    "keeps measured %s %s text clear of retained ornaments",
    (id, field, text, advance, ascent, descent) => {
      const original = createPresetExample(id);
      const slot = getPresentationDescriptors()
        .find((d) => d.id === id)!
        .slots.find((s) => s.id === field)!;
      const scene = {
        ...original,
        lines: original.lines.map((line, li) => ({
          ...line,
          runs: line.runs.map((run, ri) =>
            li === slot.line && ri === slot.run ? { ...run, text } : run,
          ),
        })),
      };
      const options = measure(scene, {
        ...settings,
        layout: { ...settings.layout!, overflow: "error" },
      });
      const measurements = normalizeMeasurements({
        ...options.measurements!,
        records: options.measurements!.records.map((r) =>
          r.request.text === text
            ? { ...r, advance, inkRight: advance, ascent, descent }
            : r,
        ),
      });
      expect(() =>
        compileConsole(scene, { ...options, measurements }),
      ).toThrow();
      const fallback = compileConsole(scene, {
        ...options,
        measurements,
        unsupported: "fallback",
      });
      expect(fallback.renderer).toBe("text");
      expect(fallback.text).toContain(text);
    },
  );
  it.each(references.presets)(
    "preserves $id slots, approved geometry and immutable reference bytes",
    (reference) => {
      expect(references.baselineStatus).toBe("accepted");
      expect(
        createHash("sha256")
          .update(readFileSync(new URL(`${reference.id}.svg`, referenceRoot)))
          .digest("hex"),
      ).toBe(reference.sha256);
      const scene = createPresetExample(reference.id);
      const before = JSON.stringify(scene);
      const options = measure(scene);
      const output = compileConsole(scene, options);
      expect(output.diagnostics).not.toContainEqual(
        expect.objectContaining({ code: "presentation-letterbox" }),
      );
      expect(output.layout).toMatchObject({
        profile: `${reference.id}/compact/v1`,
        variant: "compact",
        artboard: { width: 360, height: reference.height },
      });
      expect(output.layout!.visualRows).toBeLessThanOrEqual(8);
      expect(output.layout!.fragments.every((f) => f.fontSize >= 12)).toBe(
        true,
      );
      const svg = new JSDOM(
        decodeURIComponent(
          (output.preview as { imageUri: string }).imageUri.split(",")[1]!,
        ),
        { contentType: "image/svg+xml" },
      ).window.document;
      for (const slot of reference.slots) {
        const texts = [...svg.querySelectorAll(`text[data-slot="${slot.id}"]`)];
        expect(texts.map((t) => t.textContent).join("")).toBe(
          slot.fragments.join(""),
        );
        expect(texts[0]!.getAttribute("x")).toBe(String(slot.x));
        expect(texts[0]!.getAttribute("y")).toBe(String(slot.y));
        expect(texts[0]!.getAttribute("font-size")).toBe(String(slot.fontSize));
        const fragments = output.layout!.fragments.filter(
          (f) => f.slot === slot.id,
        );
        expect(fragments.map((f) => f.text).join("")).toBe(
          slot.fragments.join(""),
        );
        expect(
          fragments.every(
            (f) =>
              f.paint.x >= 0 &&
              f.paint.y >= 0 &&
              f.paint.x + f.paint.width <= 360 &&
              f.paint.y + f.paint.height <= reference.height,
          ),
        ).toBe(true);
      }
      expect(compileConsole(scene, options)).toEqual(output);
      expect(JSON.stringify(scene)).toBe(before);
      const log = vi.fn();
      const { code } = exportConsoleLog(scene, {
        ...options,
        motion: "reduce",
      });
      new Function("console", code)({ log });
      expect(log).toHaveBeenCalledExactlyOnceWith(...output.args);
      expect(code).not.toMatch(
        /measureText|ResizeObserver|requestAnimationFrame|setInterval/,
      );
    },
  );
  it("reports actual spare space around a compact card", () => {
    const scene = createPresetExample("buildReceipt");
    const options = measure(scene, {
      ...settings,
      layout: { ...settings.layout!, width: 480 },
    });
    expect(compileConsole(scene, options).diagnostics).toContainEqual(
      expect.objectContaining({ code: "presentation-letterbox" }),
    );
  });
  it.each(references.presets)(
    "uses $id's threshold and rejects unreadable 280 px scaling",
    ({ id, compactBelow }) => {
      const scene = createPresetExample(id);
      const automatic = {
        ...settings,
        layout: {
          ...settings.layout!,
          width: compactBelow - 1,
          variant: "auto" as const,
          minFontSize: 8,
        },
      };
      expect(
        compileConsole(scene, measure(scene, automatic)).layout!.variant,
      ).toBe("compact");
      const narrow = {
        ...settings,
        layout: { ...settings.layout!, width: 280 },
      };
      expect(() => compileConsole(scene, measure(scene, narrow))).toThrow();
      const fallback = compileConsole(scene, {
        ...narrow,
        unsupported: "fallback",
      });
      expect(fallback.renderer).toBe("text");
      expect(fallback.text).toBe(
        compileConsole(scene, { target: "chromium", renderer: "text" }).text,
      );
    },
  );
  it("keeps variant settings outside the scene and rejects unknown profile mappings", () => {
    const scene = createPresetExample("buildReceipt");
    const persisted = { ...settings };
    delete persisted.measurementEnvironment;
    const recipe = {
      kind: "consoleFxRenderRecipe",
      recipeVersion: 1,
      scene,
      options: persisted,
    };
    const parsed = parseRenderRecipe(recipe);
    expect(parsed.ok).toBe(true);
    expect(parseScene(recipe).ok).toBe(false);
    expect(
      parseScene(
        JSON.stringify({
          ...scene,
          presentation: {
            ...scene.presentation,
            profile: "buildReceipt/compact/v1",
          },
        }),
      ).ok,
    ).toBe(false);
    expect(
      compileConsole(scene, { target: "chromium", renderer: "svg" }).layout,
    ).toBeUndefined();
  });
  it("wraps whole command fragments and rejects an unbreakable overflowing value", () => {
    const scene = createPresetExample("commandCard");
    const slot = getPresentationDescriptors()
      .find((d) => d.id === "commandCard")!
      .slots.find((s) => s.id === "command")!;
    const command = "pnpm install --offline --frozen-lockfile";
    const changed = {
      ...scene,
      lines: scene.lines.map((line, li) => ({
        ...line,
        runs: line.runs.map((run, ri) =>
          li === slot.line && ri === slot.run ? { ...run, text: command } : run,
        ),
      })),
    };
    const output = compileConsole(changed, measure(changed));
    const fragments = output.layout!.fragments.filter(
      (f) => f.slot === "command",
    );
    expect(fragments.length).toBe(2);
    expect(fragments.map((f) => f.text).join("")).toBe(command);
    expect(output.text).toContain(command);
    const impossible = {
      ...changed,
      lines: changed.lines.map((line, li) => ({
        ...line,
        runs: line.runs.map((run, ri) =>
          li === slot.line && ri === slot.run
            ? { ...run, text: "x".repeat(70) }
            : run,
        ),
      })),
    };
    expect(() => compileConsole(impossible, measure(impossible))).toThrow();
  });
});
