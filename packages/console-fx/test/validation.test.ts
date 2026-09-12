import { describe, expect, it } from "vitest";
import {
  defineScene,
  getEffectDescriptors,
  parseScene,
  SceneValidationError,
} from "../src/index.js";
import { neon, preset, PRESETS } from "../src/presets/index.js";

const scene = (text = "Hello") => ({
  schemaVersion: 1,
  label: "Example",
  lines: [{ runs: [{ text }] }],
});

describe("scene boundary", () => {
  it("normalizes without changing the input and freezes nested output", () => {
    const input = scene("Hello\r\nworld\r!");
    const original = structuredClone(input);
    const parsed = parseScene(input);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) throw new Error("Expected a valid scene");
    expect(parsed.value.lines[0]?.runs[0]?.text).toBe("Hello\nworld\n!");
    expect(Object.isFrozen(parsed.value.lines[0]?.runs[0]?.style)).toBe(true);
    expect(input).toEqual(original);
    expect(parseScene(JSON.parse(JSON.stringify(parsed.value)))).toEqual(
      parsed,
    );
  });
  it.each([
    "%c %s %o %O %d %i %f %_ %%",
    "👩🏽‍💻 é مرحبا",
    '<script>"quoted"</script>',
    "\t\n",
  ])("preserves literal text %j", (text) => {
    const result = parseScene(scene(text));
    expect(result.ok && result.value.lines[0]?.runs[0]?.text).toBe(text);
  });
  it.each(["\x1b[31mred", "\0", "\u0085", "\u007f", "\ud800", "\udc00"])(
    "rejects invalid controls or Unicode %j",
    (text) => {
      expect(parseScene(scene(text)).ok).toBe(false);
    },
  );
  it("returns typed future-version errors without a partial scene", () => {
    const result = parseScene({ ...scene(), schemaVersion: 2 });
    expect(result).toMatchObject({
      ok: false,
      diagnostics: [{ code: "unsupported-schema-version" }],
    });
    expect(result).not.toHaveProperty("value");
  });
  it("rejects executable, unknown, prototype and getter properties without calling them", () => {
    let calls = 0;
    const accessor = Object.defineProperty({}, "label", {
      get: () => {
        calls++;
        return "hello";
      },
      enumerable: true,
    });
    for (const input of [
      accessor,
      { ...scene(), html: "<b>unsafe</b>" },
      JSON.parse('{"schemaVersion":1,"__proto__":{}}'),
      { ...scene(), lines: [{ runs: [{ text: () => "bad" }] }] },
    ])
      expect(parseScene(input).ok).toBe(false);
    expect(calls).toBe(0);
    expect({}).not.toHaveProperty("polluted");
  });
  it("bounds structure, values, and aggregate text before rendering", () => {
    for (const input of [
      scene("a".repeat(2001)),
      { ...scene(), lines: Array.from({ length: 9 }, () => ({ runs: [] })) },
      { ...scene(), surface: { width: Infinity } },
      { ...scene(), motion: { durationMs: 5001 } },
      {
        ...scene(),
        lines: [{ runs: Array.from({ length: 33 }, () => ({ text: "" })) }],
      },
    ])
      expect(parseScene(input).ok).toBe(false);
  });
  it("rejects conflicting families and unsafe parameter values", () => {
    expect(() =>
      defineScene({
        schemaVersion: 1,
        label: "test",
        lines: [
          {
            runs: [
              {
                text: "a",
                effects: [{ kind: "metallic" }, { kind: "rainbow" }],
              },
            ],
          },
        ],
      }),
    ).toThrow(SceneValidationError);
    const value = JSON.parse(JSON.stringify(neon()));
    value.lines[0].runs[0].effects[0].color =
      "red; background:url(https://example.com)";
    expect(parseScene(value).ok).toBe(false);
  });
});

describe("public metadata and presets", () => {
  it("exposes all built-ins as deeply immutable data with defaults accepted by validation", () => {
    expect(getEffectDescriptors()).toHaveLength(13);
    for (const descriptor of getEffectDescriptors()) {
      expect(Object.isFrozen(descriptor.parameters)).toBe(true);
      expect(
        parseScene({
          ...scene(),
          lines: [
            { runs: [{ text: "x", effects: [{ kind: descriptor.kind }] }] },
          ],
        }).ok,
      ).toBe(true);
    }
    expect(() => {
      (
        getEffectDescriptors()[0]!.parameters.color as { default: string }
      ).default = "#ffffff";
    }).toThrow();
  });
  it.each(PRESETS)(
    "materializes the $name preset as independent editable JSON",
    ({ id }) => {
      const a = preset(id);
      const b = preset(id);
      expect(a).toEqual(b);
      expect(a).not.toBe(b);
      expect(parseScene(JSON.parse(JSON.stringify(a)))).toMatchObject({
        ok: true,
        value: a,
      });
    },
  );
});
