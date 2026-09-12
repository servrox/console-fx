import { expect, it } from "vitest";
import { defineScene, parseScene } from "../src/index.js";
import { compileConsole, ConsoleCompileError } from "../src/browser/index.js";
import { PRESETS, preset } from "../src/presets/index.js";

it("keeps multi-style documents valid and recoverable while rejecting unsupported rich combinations", () => {
  const scene = defineScene({
    schemaVersion: 1,
    label: "Preserve this",
    lines: [
      {
        runs: [
          {
            text: "Preserve this",
            effects: [{ kind: "badge" }, { kind: "neon" }],
          },
        ],
      },
    ],
  });
  expect(parseScene(scene).ok).toBe(true);
  for (const renderer of ["css", "svg"] as const) {
    expect(() =>
      compileConsole(scene, { renderer, target: "chromium" }),
    ).toThrow(ConsoleCompileError);
    const fallback = compileConsole(scene, {
      renderer,
      target: "chromium",
      unsupported: "fallback",
    });
    expect(fallback.renderer).toBe("text");
    expect(fallback.args).toEqual(["Preserve this"]);
    expect(fallback.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "unsupported-combination",
          path: ["lines", 0, "runs", 0, "effects"],
        }),
      ]),
    );
  }
});

it("compiles every advertised preset/motion pair with a static alternative", () => {
  for (const { id } of PRESETS.filter((item) => item.group === "Classic")) {
    for (const motion of [
      "glowPulse",
      "gradientDrift",
      "wave",
      "indicator",
    ] as const) {
      const scene = preset(id, { motion });
      const options = { renderer: "svg", target: "chromium" } as const;
      expect(
        compileConsole(scene, { ...options, motion: "allow" }).animated,
      ).toBe(true);
      expect(
        compileConsole(scene, { ...options, motion: "reduce" }).animated,
      ).toBe(false);
    }
  }
});
