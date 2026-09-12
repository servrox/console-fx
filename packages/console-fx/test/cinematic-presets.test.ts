import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { parse } from "acorn";
import { describe, expect, it, vi } from "vitest";
import {
  defineScene,
  getEffectDescriptors,
  parseScene,
  SceneValidationError,
} from "../src/index.js";
import type { CompileOptions, SceneV1 } from "../src/index.js";
import {
  compileConsole,
  ConsoleCompileError,
  emitConsole,
} from "../src/browser/index.js";
import { exportConsoleLog } from "../src/codegen/index.js";
import {
  iceCathedral,
  lightningMetal,
  liquidChrome,
  moltenGold,
  PRESETS,
  preset,
} from "../src/presets/index.js";

const rich = { target: "chromium", renderer: "svg" } as const;
const factories = { lightningMetal, iceCathedral, liquidChrome, moltenGold };
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const failure = (scene: SceneV1, options: CompileOptions = rich) => {
  try {
    compileConsole(scene, options);
  } catch (error) {
    expect(error).toBeInstanceOf(ConsoleCompileError);
    return (error as ConsoleCompileError).diagnostics;
  }
  throw new Error("Expected a structured compile error");
};

describe("cinematic public data contract", () => {
  it.each(Object.entries(factories))(
    "materializes %s independently with resolved static settings",
    (id, factory) => {
      const scene = factory();
      expect(preset(id as keyof typeof factories)).toEqual(scene);
      expect(preset(id as keyof typeof factories)).not.toBe(scene);
      expect(Object.isFrozen(scene.lines[0]!.runs[0]!.effects[0])).toBe(true);
      expect(scene.surface).toMatchObject({ width: 840, height: 270 });
      expect(scene.lines[0]!.runs[0]!.effects).toEqual([
        expect.objectContaining({
          kind: "cinematicMetal",
          profile: expect.stringMatching(/-v1$/),
          color: expect.any(String),
          depth: expect.any(Number),
          glow: expect.any(Number),
          ornaments: true,
        }),
      ]);
      expect(parseScene(JSON.parse(JSON.stringify(scene)))).toMatchObject({
        ok: true,
        value: scene,
      });
      expect(PRESETS.find((entry) => entry.id === id)).toMatchObject({
        group: "Cinematic Metal",
        renderer: "svg",
      });
      expect(compileConsole(scene, { ...rich, motion: "allow" }).animated).toBe(
        false,
      );
    },
  );
  it("uses catalog validation for every new setting without exposing markup or geometry", () => {
    const descriptor = getEffectDescriptors().find(
      (entry) => entry.kind === "cinematicMetal",
    )!;
    expect(descriptor).toMatchObject({
      family: "fill",
      scopes: ["run"],
      renderers: ["svg"],
      motion: "static",
    });
    expect(Object.isFrozen(descriptor.parameters.profile)).toBe(true);
    for (const override of [
      { profile: "future" },
      { depth: -1 },
      { depth: 11 },
      { depth: NaN },
      { glow: Infinity },
      { glow: -0.1 },
      { glow: 1.1 },
      { ornaments: "yes" },
      { color: "url(https://invalid)" },
      { path: "M0 0" },
      { svg: "<script/>" },
      { fontUrl: "https://invalid" },
      JSON.parse('{"__proto__":{}}'),
    ]) {
      const scene = JSON.parse(JSON.stringify(lightningMetal()));
      scene.lines[0].runs[0].effects[0] = {
        ...scene.lines[0].runs[0].effects[0],
        ...override,
      };
      expect(parseScene(scene).ok).toBe(false);
    }
    expect(() => lightningMetal({ depth: Number.NaN })).toThrow(
      SceneValidationError,
    );
    expect(
      lightningMetal({ color: "#abc", depth: 0, glow: 0, ornaments: false })
        .lines[0]!.runs[0]!.effects[0],
    ).toMatchObject({ color: "#aabbcc", depth: 0, glow: 0, ornaments: false });
  });
  it.each(["glowPulse", "gradientDrift", "wave", "indicator"] as const)(
    "rejects cinematic %s even when reduced",
    (motion) => {
      expect(() => lightningMetal({ motion } as never)).toThrow(
        SceneValidationError,
      );
      expect(() => preset("lightningMetal", { motion } as never)).toThrow(
        SceneValidationError,
      );
      const input = lightningMetal();
      const run = input.lines[0]!.runs[0]!;
      const scene = defineScene({
        ...input,
        lines: [
          { runs: [{ ...run, effects: [...run.effects, { kind: motion }] }] },
        ],
      });
      for (const policy of ["allow", "reduce"] as const) {
        expect(failure(scene, { ...rich, motion: policy })).toContainEqual(
          expect.objectContaining({ code: "unsupported-combination" }),
        );
        expect(
          compileConsole(scene, {
            ...rich,
            motion: policy,
            unsupported: "fallback",
          }).args,
        ).toEqual([scene.label]);
      }
    },
  );
  it("retains the one-static-effect guard", () => {
    const scene = lightningMetal();
    const run = scene.lines[0]!.runs[0]!;
    const stacked = defineScene({
      ...scene,
      lines: [
        { runs: [{ ...run, effects: [...run.effects, { kind: "neon" }] }] },
      ],
    });
    expect(failure(stacked)).toContainEqual(
      expect.objectContaining({ code: "unsupported-combination" }),
    );
  });
  it("preserves all nine previously qualified preset scenes and output bytes", () => {
    const baseline = JSON.parse(
      readFileSync(
        new URL("./fixtures/pre-cinematic.json", import.meta.url),
        "utf8",
      ),
    ) as {
      cases: {
        id: string;
        scene: SceneV1;
        options: CompileOptions & { motion?: "reduce" };
        argsSha256: string;
        svgSha256: string;
        codeSha256: string;
      }[];
    };
    expect(baseline.cases).toHaveLength(9);
    for (const item of baseline.cases) {
      expect(parseScene(item.scene)).toMatchObject({
        ok: true,
        value: item.scene,
      });
      expect(preset(item.id as Parameters<typeof preset>[0])).toEqual(
        item.scene,
      );
      expect(
        hash(JSON.stringify(compileConsole(item.scene, item.options).args)),
      ).toBe(item.argsSha256);
      expect(
        hash(
          JSON.stringify(
            compileConsole(item.scene, { ...item.options, renderer: "svg" })
              .args,
          ),
        ),
      ).toBe(item.svgSha256);
      expect(hash(exportConsoleLog(item.scene, item.options).code)).toBe(
        item.codeSha256,
      );
    }
  });
});

describe("cinematic text and export boundaries", () => {
  it.each([
    "%c %s %d %%",
    "&<>\"'",
    "\\",
    "</script>",
    "é",
    "e\u0301",
    "漢字",
    "👩🏽‍💻",
  ])(
    "preserves unsupported angular title %j with explicit fallback",
    (text) => {
      const scene = lightningMetal({ text });
      expect(parseScene(scene).ok).toBe(true);
      expect(failure(scene)).toContainEqual(
        expect.objectContaining({
          code: "unsupported-cinematic-glyph",
          path: ["lines", 0, "runs", 0, "text"],
        }),
      );
      expect(
        compileConsole(scene, { ...rich, unsupported: "fallback" }).args,
      ).toEqual([text]);
      for (const target of ["node", "bun", "unknown"] as const)
        expect(
          compileConsole(scene, { target, renderer: "text" }).args,
        ).toEqual([text]);
    },
  );
  it("bounds titles without losing graphemes or imposing rich limits on plain text", () => {
    expect(
      compileConsole(lightningMetal({ text: "A".repeat(24) }), rich).renderer,
    ).toBe("svg");
    for (const text of ["A".repeat(25), "A\nB", "A\u2028B", "A\u2029B"]) {
      const scene = liquidChrome({ text });
      expect(failure(scene)).toContainEqual(
        expect.objectContaining({ code: "unsupported-cinematic-title" }),
      );
      expect(
        compileConsole(scene, { ...rich, unsupported: "fallback" }).args,
      ).toEqual([text]);
    }
    for (const text of ["\x1b[31m", "\u0000", "\ud800"])
      expect(() => lightningMetal({ text })).toThrow(SceneValidationError);
    expect(
      compileConsole(lightningMetal({ text: "Build 2026" }), rich).diagnostics,
    ).toContainEqual(
      expect.objectContaining({ code: "cinematic-uppercase-display" }),
    );
    expect(
      compileConsole(lightningMetal({ text: "Build 2026" }), rich).args[3],
    ).toBe("Build 2026");
  });
  it("does not broaden target or CSS support", () => {
    for (const target of [
      "node",
      "bun",
      "unknown",
      "firefox",
      "safari",
    ] as const) {
      expect(
        failure(iceCathedral(), { renderer: "svg", target }),
      ).toContainEqual(
        expect.objectContaining({ code: "unsupported-renderer" }),
      );
    }
    expect(
      failure(lightningMetal(), { target: "chromium", renderer: "css" }),
    ).toContainEqual(expect.objectContaining({ code: "unsupported-effect" }));
  });
  it.each(Object.entries(factories))(
    "exports %s as one complete static call with exact arguments",
    (_, factory) => {
      const log = vi.spyOn(console, "log");
      const scene = factory();
      const before = JSON.stringify(scene);
      const output = compileConsole(scene, rich);
      expect(compileConsole(scene, rich)).toEqual(output);
      const exported = exportConsoleLog(scene, { ...rich, motion: "system" });
      expect(exported).toEqual(
        exportConsoleLog(scene, { ...rich, motion: "reduce" }),
      );
      expect(exported.byteLength).toBe(
        new TextEncoder().encode(exported.code).byteLength,
      );
      expect(exported.byteLength).toBeLessThan(32 * 1024);
      const tree = parse(exported.code, { ecmaVersion: "latest" });
      expect(tree.body).toHaveLength(1);
      const statement = tree.body[0]!;
      expect(statement.type).toBe("ExpressionStatement");
      if (
        statement.type !== "ExpressionStatement" ||
        statement.expression.type !== "CallExpression"
      )
        throw new Error("Expected one call");
      expect(statement.expression.callee).toMatchObject({
        type: "MemberExpression",
        computed: false,
        object: { type: "Identifier", name: "console" },
        property: { type: "Identifier", name: "log" },
      });
      expect(
        statement.expression.arguments.every(
          (arg) => arg.type === "Literal" && typeof arg.value === "string",
        ),
      ).toBe(true);
      const sink = vi.fn();
      runInNewContext(
        exported.code,
        { console: { log: sink } },
        { timeout: 1000 },
      );
      expect(sink).toHaveBeenCalledExactlyOnceWith(...output.args);
      expect(output.args.slice(2)).toEqual(["", scene.label, ""]);
      expect(log).not.toHaveBeenCalled();
      expect(JSON.stringify(scene)).toBe(before);
      const emitter = vi.fn();
      emitConsole(scene, rich, emitter);
      expect(emitter).toHaveBeenCalledExactlyOnceWith(...output.args);
    },
  );
  it("serializes hostile serif text without formatter or JavaScript execution", () => {
    const scene = liquidChrome({ text: '%c %s </script> " \\' });
    const output = compileConsole(scene, rich);
    expect(output.args[3]).toBe('%%c %%s </script> " \\');
    const sink = vi.fn();
    runInNewContext(
      exportConsoleLog(scene, rich).code,
      { console: { log: sink } },
      { timeout: 1000 },
    );
    expect(sink).toHaveBeenCalledExactlyOnceWith(...output.args);
  });
});
