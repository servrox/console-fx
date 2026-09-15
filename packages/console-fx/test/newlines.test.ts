import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { defineScene, parseScene } from "../src/index.js";
import { compileConsole } from "../src/browser/index.js";

describe("visual newline boundaries", () => {
  it("preserves consecutive lines and run styles in SVG, including a newline at a run boundary", () => {
    const scene = defineScene({
      schemaVersion: 1,
      label: "newlines",
      surface: { height: 360 },
      lines: [
        {
          runs: [
            { text: "first\r\n", style: { color: "#ff0000", fontSize: 22 } },
            {
              text: "second\nthird",
              style: { color: "#00ff00", fontSize: 22 },
            },
          ],
        },
      ],
    });
    const output = compileConsole(scene, {
      renderer: "svg",
      target: "chromium",
    });
    expect(output.text).toBe("first\nsecond\nthird");
    if (output.preview.kind !== "svg") throw new Error("Expected SVG");
    const xml = decodeURIComponent(output.preview.imageUri.split(",")[1]!);
    const document = new JSDOM(xml, { contentType: "image/svg+xml" }).window
      .document;
    const texts = [...document.querySelectorAll("text")].filter(
      (text) => text.textContent,
    );
    expect(texts.map((text) => text.textContent)).toEqual([
      "first",
      "second",
      "third",
    ]);
    expect(texts.map((text) => text.getAttribute("fill"))).toEqual([
      "#ff0000",
      "#00ff00",
      "#00ff00",
    ]);
    expect(Number(texts[0]!.getAttribute("y"))).toBeLessThan(
      Number(texts[1]!.getAttribute("y")),
    );
    expect(Number(texts[1]!.getAttribute("y"))).toBeLessThan(
      Number(texts[2]!.getAttribute("y")),
    );
  });
  it("applies the eight-line bound to embedded newlines before any renderer generates output", () => {
    const input = {
      schemaVersion: 1 as const,
      label: "lines",
      lines: [{ runs: [{ text: "a\n".repeat(8) }] }],
    };
    const result = parseScene(input);
    expect(result.ok).toBe(false);
    expect(result.diagnostics[0]?.code).toBe("resource-limit");
  });
  it("rejects arrays with properties or accessors without invoking an accessor", () => {
    const input = {
      schemaVersion: 1 as const,
      label: "array",
      lines: [{ runs: [{ text: "safe" }] }],
    };
    Object.defineProperty(input.lines, "extra", { value: "hidden" });
    expect(parseScene(input).ok).toBe(false);
    let invoked = false;
    const lines = [] as unknown[];
    Object.defineProperty(lines, "0", {
      get() {
        invoked = true;
        return {};
      },
    });
    expect(parseScene({ ...input, lines }).ok).toBe(false);
    expect(invoked).toBe(false);
  });
});
