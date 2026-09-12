import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { JSDOM } from "jsdom";
import { describe, expect, it, vi } from "vitest";
import {
  defineScene,
  getPresentationDescriptors,
  parseScene,
  SceneValidationError,
} from "../src/index.js";
import type { CardPresetId, SceneV1 } from "../src/index.js";
import {
  compileConsole,
  ConsoleCompileError,
  emitConsole,
} from "../src/browser/index.js";
import { exportConsoleLog } from "../src/codegen/index.js";
import {
  buildReceipt,
  letterpress,
  createPresetExample,
  requestTrace,
  serviceReady,
  releaseBulletin,
} from "../src/presets/index.js";

const fixtures = JSON.parse(
  readFileSync(
    new URL(
      "../../../docs/mockups/preset-collection-v1/scene-fixtures.json",
      import.meta.url,
    ),
    "utf8",
  ),
).presets as { id: string; scene: SceneV1; caption: string }[];
const rich = { target: "chromium", renderer: "svg" } as const;
const receipt = () =>
  buildReceipt({
    project: "atlas-web",
    outcome: "PASSED",
    revision: "a1b2c3d",
    duration: "2.34 s",
    checks: "48 / 48",
    environment: "preview",
  });
const cases = fixtures.map(
  (f) => [f.id, () => createPresetExample(f.id as CardPresetId)] as const,
);

describe("closed presentation contract", () => {
  it.each([compileConsole, exportConsoleLog, emitConsole])(
    "rejects hostile options before access or emission (%s)",
    (operation) => {
      const read = vi.fn();
      const options = Object.defineProperty({}, "target", {
        get: read,
        enumerable: true,
      });
      expect(() => operation(receipt(), options)).toThrow(ConsoleCompileError);
      expect(read).not.toHaveBeenCalled();
      expect(() =>
        operation(receipt(), Object.create({ renderer: "text" })),
      ).toThrow(ConsoleCompileError);
      expect(() =>
        operation(receipt(), { ...rich, unsafe: true } as never),
      ).toThrow(ConsoleCompileError);
    },
  );
  it.each(["", "שלום", "e\u0301", "👩🏽‍💻", '%c %s <&> \\"', "日本語"])(
    "preserves literal content in rich output and executable exports: %s",
    (title) => {
      const scene = letterpress({ title });
      const output = compileConsole(scene, rich);
      expect(output.text).toContain(title);
      const log = vi.fn();
      runInNewContext(exportConsoleLog(scene, rich).code, { console: { log } });
      expect(log).toHaveBeenCalledExactlyOnceWith(...output.args);
      if (output.preview.kind !== "svg") throw Error("SVG expected");
      const doc = new JSDOM(
        decodeURIComponent(output.preview.imageUri.split(",")[1]!),
        { contentType: "image/svg+xml" },
      ).window.document;
      expect(doc.querySelector('[data-slot="title"]')!.textContent).toBe(title);
    },
  );
  it("reports letterboxing and preserves oversized or multiline content in explicit fallback", () => {
    const scene = letterpress();
    const output = compileConsole(
      {
        ...scene,
        surface: { ...scene.surface, width: 720, height: 300, padding: 20 },
      },
      rich,
    );
    expect(output.diagnostics).toContainEqual(
      expect.objectContaining({ code: "presentation-letterbox" }),
    );
    for (const title of [
      "H".repeat(14),
      "I".repeat(24),
      "क" + "ा".repeat(30),
      "W".repeat(48),
      "First\nSecond",
      "Wide 👩🏽‍💻".repeat(10),
    ]) {
      const scene = letterpress({ title });
      expect(() => compileConsole(scene, rich)).toThrow(ConsoleCompileError);
      const fallback = compileConsole(scene, {
        ...rich,
        unsupported: "fallback",
      });
      expect(fallback.renderer).toBe("text");
      expect(fallback.text).toContain(title);
      expect(fallback.diagnostics).toContainEqual(
        expect.objectContaining({
          code: "presentation-overflow",
          message: expect.stringContaining("Title"),
        }),
      );
    }
  });
  it("rejects inherited status names without treating them as owned palette entries", () => {
    const base = receipt();
    const scene = {
      ...base,
      lines: base.lines.map((line, li) => ({
        ...line,
        runs: line.runs.map((run, ri) =>
          li === 1 && ri === 2 ? { ...run, text: "__proto__" } : run,
        ),
      })),
    };
    expect(() => compileConsole(scene, rich)).toThrow(ConsoleCompileError);
    expect(
      compileConsole(scene, { ...rich, unsupported: "fallback" }).text,
    ).toContain("__proto__");
  });
  it("owns bounded parameter and status metadata shared by every consumer", () => {
    const descriptors = getPresentationDescriptors();
    expect(descriptors).toHaveLength(10);
    expect(Object.isFrozen(descriptors[0]!.slots[0]!.style)).toBe(true);
    for (const outcome of ["PASSED", "FAILED", "WARNING", "UNKNOWN"] as const) {
      const scene = buildReceipt({
        project: "Test",
        outcome,
        revision: "r1",
        duration: "1s",
        checks: "1 / 1",
        environment: "test",
      });
      expect(compileConsole(scene, rich).text).toContain(outcome);
      expect(scene.lines[1]!.runs[2]!.style.color).toBe(
        descriptors.find((d) => d.id === "buildReceipt")!.status!.palettes[
          outcome
        ]!.ink,
      );
    }
    for (const state of ["READY", "DEGRADED", "OFFLINE", "UNKNOWN"] as const)
      expect(
        compileConsole(
          serviceReady({
            service: "Atlas",
            state,
            endpoint: "http://localhost:3000",
            environment: "local",
            runtime: "Node",
            region: "local",
          }),
          rich,
        ).text,
      ).toContain(state);
    const base = receipt();
    expect(
      compileConsole(
        { ...base, presentation: { ...base.presentation!, accent: "#abcdef" } },
        rich,
      ).text,
    ).toBe(compileConsole(base, rich).text);
  });
  it("persists request tone independently from arbitrary status text and accent", () => {
    const stages = [
      { label: "ONE", duration: "a" },
      { label: "TWO", duration: "b" },
      { label: "THREE", duration: "c" },
    ] as const;
    for (const tone of ["success", "warning", "error", "neutral"] as const) {
      const scene = requestTrace({
        method: "GET",
        path: "/demo",
        status: "custom",
        total: "supplied",
        stages,
        requestId: "demo",
        tone,
      });
      expect(scene.presentation).toMatchObject({ tone });
      expect(parseScene(JSON.parse(JSON.stringify(scene)))).toMatchObject({
        ok: true,
        value: scene,
      });
      expect(compileConsole(scene, rich).text).toContain("custom");
      expect(
        compileConsole(
          {
            ...scene,
            presentation: { ...scene.presentation!, accent: "#abccde" },
          },
          rich,
        ).text,
      ).toBe(compileConsole(scene, rich).text);
    }
    expect(() => requestTrace({ stages: [] } as never)).toThrow(
      SceneValidationError,
    );
    expect(() => releaseBulletin({ changes: ["one"] } as never)).toThrow(
      SceneValidationError,
    );
    const read = vi.fn();
    const invalid = {
      get project() {
        return read();
      },
    };
    expect(() => buildReceipt(invalid as never)).toThrow(SceneValidationError);
    expect(read).not.toHaveBeenCalled();
  });
  it.each(cases)(
    "keeps %s deterministic and static with minimal detail",
    (_id, factory) => {
      const scene = factory();
      const minimal = defineScene({
        ...scene,
        presentation: { ...scene.presentation!, detail: "minimal" },
      });
      expect(compileConsole(minimal, rich).text).toBe(
        compileConsole(scene, rich).text,
      );
      expect(compileConsole(minimal, { ...rich, motion: "allow" })).toEqual(
        compileConsole(minimal, rich),
      );
      expect(compileConsole(scene, rich).args).toEqual(
        compileConsole(scene, rich).args,
      );
    },
  );
  it.each(cases)(
    "materializes the approved %s scene and complete caption",
    (id, factory) => {
      const scene = factory();
      const fixture = fixtures.find((f) => f.id === id)!;
      expect(scene).toEqual(fixture.scene);
      expect(Object.isFrozen(scene.presentation)).toBe(true);
      expect(parseScene(JSON.parse(JSON.stringify(scene)))).toMatchObject({
        ok: true,
        value: scene,
      });
      const compiled = compileConsole(scene, { ...rich, motion: "allow" });
      expect(compiled.text).toBe(fixture.caption);
      expect(compiled.animated).toBe(false);
      expect(compiled.preview.kind).toBe("svg");
      if (compiled.preview.kind !== "svg") throw Error("SVG expected");
      const svg = decodeURIComponent(compiled.preview.imageUri.split(",")[1]!);
      const doc = new JSDOM(svg, { contentType: "image/svg+xml" }).window
        .document;
      const descriptor = getPresentationDescriptors().find((d) => d.id === id)!;
      const semanticText = [...doc.querySelectorAll("text[data-slot]")];
      expect(semanticText.map((t) => t.textContent)).toEqual(
        descriptor.slots.map((s) => scene.lines[s.line]!.runs[s.run]!.text),
      );
      for (const slot of descriptor.slots) {
        const text = doc.querySelector(`[data-slot="${slot.id}"]`)!;
        expect(Number(text.getAttribute("x"))).toBe(slot.x);
        expect(Number(text.getAttribute("y"))).toBe(slot.y);
      }
      expect(doc.querySelectorAll("*").length).toBeLessThan(1000);
      expect(
        doc.querySelector(
          "script,foreignObject,image,a,animate,animateTransform",
        ),
      ).toBeNull();
      const log = vi.fn();
      runInNewContext(exportConsoleLog(scene, rich).code, { console: { log } });
      expect(log).toHaveBeenCalledExactlyOnceWith(...compiled.args);
      emitConsole(scene, rich, log);
      expect(log).toHaveBeenCalledTimes(2);
    },
  );
  it("keeps complete valid content in explicit fallback and never truncates", () => {
    const scene = letterpress({ title: "W".repeat(80) });
    expect(() => compileConsole(scene, rich)).toThrow(ConsoleCompileError);
    expect(
      compileConsole(scene, { ...rich, unsupported: "fallback" }),
    ).toMatchObject({
      renderer: "text",
      text: expect.stringContaining("W".repeat(80)),
    });
    expect(() =>
      compileConsole(receipt(), { ...rich, renderer: "css" }),
    ).toThrow(ConsoleCompileError);
  });
  it("rejects malformed profiles, geometry injection and missing useful facts", () => {
    for (const presentation of [
      { kind: "presetCard", profile: "letterpress/v2" },
      { ...letterpress().presentation, svg: "<script/>" },
      { ...letterpress().presentation, tone: "success" },
      { ...letterpress().presentation, accent: "url(https://invalid)" },
    ])
      expect(parseScene({ ...letterpress(), presentation }).ok).toBe(false);
    expect(() => buildReceipt({} as never)).toThrow(SceneValidationError);
    expect(() => buildReceipt({ project: {} } as never)).toThrow(
      SceneValidationError,
    );
    expect(() => letterpress({ title: "unsafe\u001b[0m" })).toThrow(
      SceneValidationError,
    );
  });
  it("rejects incompatible structure/effects and permits explicit detachment", () => {
    const base = receipt();
    const changed = defineScene({
      ...base,
      lines: [
        { runs: [{ text: "keep %s %c <&> 😀", effects: [{ kind: "neon" }] }] },
      ],
    });
    expect(() => compileConsole(changed, rich)).toThrow(ConsoleCompileError);
    expect(
      compileConsole(changed, { ...rich, unsupported: "fallback" }).text,
    ).toBe("keep %s %c <&> 😀");
    const detached = { ...changed };
    delete detached.presentation;
    expect(compileConsole(detached, rich).text).toBe("keep %s %c <&> 😀");
  });
});
