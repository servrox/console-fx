import { describe, expect, it } from "vitest";
import { compileConsole } from "@servrox/console-fx/browser";
import { exportConsoleLog } from "@servrox/console-fx/codegen";
import { defineScene, getEffectDescriptors } from "@servrox/console-fx";
import { neon, lightningMetal } from "@servrox/console-fx/presets";
import {
  listCatalogue,
  STYLE_FILTERS,
  resolveExample,
  searchExamples,
  withAutomaticSizing,
} from "./catalogue";
import { resolveCapabilities } from "./capabilities";
import { documentReducer, initialDocument, recipeOf } from "../editor/document";

describe("one catalogue and current-recipe capabilities", () => {
  const catalogue = listCatalogue();
  it("accounts for all existing entries and shares valid category/hero identities", () => {
    expect(catalogue.examples).toHaveLength(43);
    expect(new Set(catalogue.examples.map((item) => item.id)).size).toBe(43);
    for (const category of catalogue.categories) {
      expect(
        catalogue.examples.find((item) => item.id === category.hero)?.category,
      ).toBe(category.id);
      expect(
        catalogue.examples.some((item) => item.category === category.id),
      ).toBe(true);
    }
    expect(searchExamples("dev context").map((item) => item.id)).toContain(
      "featured:devContext",
    );
    expect(searchExamples("dolphin", "delight")).toHaveLength(1);
    for (const { id } of STYLE_FILTERS) {
      expect(searchExamples("", undefined, id).length).toBeGreaterThan(0);
      expect(
        searchExamples("", undefined, id).every((entry) =>
          entry.styles.includes(id),
        ),
      ).toBe(true);
    }
    expect(
      searchExamples("quieter", "brand", "minimal").map((entry) => entry.id),
    ).toEqual(["featured:quietEditorial"]);
    expect(searchExamples("dolphin", "delight", "card")).toEqual([]);
  });
  it.each(catalogue.examples)(
    "$id preserves all content under automatic sizing and complete standalone export",
    ({ id }) => {
      const result = resolveExample({ exampleId: id });
      if (!result.ok) throw new Error(result.message);
      const { recipe } = result;
      expect(recipe.options).toMatchObject({
        renderer: "svg",
        target: "chromium",
        motion: "reduce",
        layout: { algorithm: "fit/v2", variant: "auto" },
        sizing: { mode: "container-experimental" },
      });
      const output = compileConsole(recipe.scene, {
        ...recipe.options,
        motion: "reduce",
      });
      expect(output.renderer).toBe("svg");
      expect(output.animated).toBe(false);
      const layout = output.layout!;
      expect(layout.displayReadability).toBe("unknown");
      expect(layout.displayScale).toBeNull();
      expect(layout.artboard.width).toBeLessThanOrEqual(1200);
      expect(layout.artboard.height).toBeLessThanOrEqual(400);
      expect(layout.shapingRequests).toBeLessThanOrEqual(512);
      expect(layout.shrinkCandidates).toBeLessThanOrEqual(16);
      const visible = layout.fragments.filter((f) => f.text.trim());
      for (const [index, fragment] of visible.entries()) {
        expect(fragment.fontSize + 1e-8).toBeGreaterThanOrEqual(12);
        expect(fragment.paint.x).toBeGreaterThanOrEqual(0);
        expect(fragment.paint.y).toBeGreaterThanOrEqual(0);
        expect(fragment.paint.x + fragment.paint.width).toBeLessThanOrEqual(
          layout.artboard.width + 1e-8,
        );
        expect(fragment.paint.y + fragment.paint.height).toBeLessThanOrEqual(
          layout.artboard.height + 1e-8,
        );
        for (const other of visible.slice(index + 1)) {
          const overlap =
            Math.min(
              fragment.paint.x + fragment.paint.width,
              other.paint.x + other.paint.width,
            ) >
              Math.max(fragment.paint.x, other.paint.x) + 1e-8 &&
            Math.min(
              fragment.paint.y + fragment.paint.height,
              other.paint.y + other.paint.height,
            ) >
              Math.max(fragment.paint.y, other.paint.y) + 1e-8;
          expect(
            overlap,
            `${fragment.slot ?? fragment.text} / ${other.slot ?? other.text}`,
          ).toBe(false);
        }
      }
      expect(output.text).toBe(
        compileConsole(recipe.scene, { renderer: "text" }).text,
      );
      expect(output.diagnostics.some((item) => item.severity === "error")).toBe(
        false,
      );
      const calls: unknown[][] = [];
      new Function(
        "console",
        exportConsoleLog(recipe.scene, recipe.options).code,
      )({ log: (...args: unknown[]) => calls.push(args) });
      expect(calls).toEqual([output.args]);
      const imported = resolveExample({
        recipe: JSON.parse(JSON.stringify(recipe)),
      });
      expect(imported).toEqual(result);
    },
  );
  it("preserves supplied settings and unsupported but structurally valid recipes", () => {
    const recipe = recipeOf(initialDocument(neon({ text: "kept 100%" })));
    const resolved = resolveExample({ recipe });
    expect(resolved).toMatchObject({ ok: true, recipe });
    expect(recipe.options.sizing).toBeUndefined();
    const cinematic = resolveExample({ exampleId: "preset:lightningMetal" });
    if (!cinematic.ok) throw Error("fixture");
    expect(
      resolveExample({
        recipe: {
          ...cinematic.recipe,
          options: { target: "chromium", renderer: "css" },
        },
      }).ok,
    ).toBe(true);
    expect(resolveExample({ exampleId: "missing" })).toMatchObject({
      ok: false,
      code: "unknown-example",
    });
    expect(resolveExample({ recipe: {} })).toMatchObject({
      ok: false,
      code: "invalid-recipe",
    });
  });
  it("limits controls from current profiles, renderer and policy; tags cannot confer support", () => {
    for (const id of ["preset:lightningMetal", "preset:buildReceipt"]) {
      const result = resolveExample({ exampleId: id });
      if (!result.ok) throw Error(result.message);
      expect(result.capabilities.controls.motion.status).toBe("unavailable");
      expect(
        resolveCapabilities(result.recipe, { motion: true }).controls.motion
          .status,
      ).toBe("unavailable");
    }
    const flow = withAutomaticSizing(recipeOf(initialDocument(neon())));
    expect(resolveCapabilities(flow).controls.motion.status).toBe(
      "experimental",
    );
    expect(
      resolveCapabilities(flow, { motion: false }).controls.motion.status,
    ).toBe("unavailable");
    expect(
      resolveCapabilities({ ...flow, options: { renderer: "text" } }).controls
        .outputSizing.status,
    ).toBe("unavailable");
  });
  it("keeps motion on ordinary runs in mixed cinematic scenes and applies policy without changing saved output", () => {
    const scene = defineScene({
      ...lightningMetal({ text: "METAL" }),
      lines: [
        ...lightningMetal({ text: "METAL" }).lines,
        ...neon({ text: "Moving detail", motion: "glowPulse" }).lines,
      ],
    });
    const recipe = {
      kind: "consoleFxRenderRecipe",
      recipeVersion: 1,
      scene,
      options: { renderer: "svg", target: "chromium", motion: "system" },
    } as const;
    const compiled = compileConsole(scene, {
      ...recipe.options,
      motion: "allow",
    });
    expect(compiled.animated).toBe(true);
    const capabilities = resolveCapabilities(recipe);
    expect(capabilities.controls.motion.status).toBe("experimental");
    expect(capabilities.motionRuns).toEqual([[false], [true]]);
    const policy = {
      content: false,
      namedFields: false,
      typography: false,
      effects: false,
      motion: false,
      fitting: false,
      outputSizing: false,
    } as const;
    const disabled = resolveCapabilities(recipe, policy);
    expect(
      Object.values(disabled.controls).every(
        (state) => state.status === "unavailable",
      ),
    ).toBe(true);
    expect(disabled.motionRuns).toEqual([[false], [false]]);
    expect(disabled.effectEditing.glowPulse.status).toBe("unavailable");
    expect(
      compileConsole(scene, { ...recipe.options, motion: "allow" }),
    ).toEqual(compiled);
  });
  it("offers only compatible effect additions and retains policy-disabled choices", () => {
    for (const initial of [undefined, ...getEffectDescriptors()]) {
      const scene = defineScene({
        schemaVersion: 1,
        label: "Effect combinations",
        lines: [
          {
            runs: [
              { text: "A", effects: initial ? [{ kind: initial.kind }] : [] },
            ],
          },
        ],
      });
      const recipe = recipeOf(initialDocument(scene));
      const settings = {
        renderer: "svg",
        target: "chromium",
        motion: "reduce",
      } as const;
      const current = { ...recipe, options: settings };
      const before = JSON.stringify(current);
      const additions = resolveCapabilities(current).effectOptions[0]![0]!;
      if (initial?.motion === "decorative") {
        expect(
          additions.find(
            ({ descriptor }) => descriptor.kind === "cinematicMetal",
          )?.state,
        ).toMatchObject({
          status: "unavailable",
          reason: expect.stringMatching(/Remove motion/),
        });
      }
      for (const { descriptor, state } of additions) {
        if (state.status === "unavailable") continue;
        const candidate = defineScene({
          ...scene,
          lines: [
            {
              runs: [
                {
                  ...scene.lines[0]!.runs[0]!,
                  effects: [
                    ...scene.lines[0]!.runs[0]!.effects,
                    { kind: descriptor.kind },
                  ],
                },
              ],
            },
          ],
        });
        expect(
          compileConsole(candidate, { ...settings, motion: "allow" }).renderer,
        ).toBe("svg");
      }
      const blocked = resolveCapabilities(current, { effects: false })
        .effectOptions[0]![0]!;
      expect(blocked.every(({ state }) => state.status === "unavailable")).toBe(
        true,
      );
      expect(JSON.stringify(current)).toBe(before);
    }
  });
  it("converts existing work in one undoable load without changing raw-scene defaults", () => {
    const original = initialDocument(neon({ text: "saved" }));
    const next = documentReducer(original, {
      type: "load",
      document: withAutomaticSizing(recipeOf(original)),
    });
    expect(next.past).toHaveLength(1);
    expect(recipeOf(documentReducer(next, { type: "undo" }))).toEqual(
      recipeOf(original),
    );
  });
});
