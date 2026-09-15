import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { parseRenderRecipe, parseScene } from "@servrox/console-fx";
import { compileConsole } from "@servrox/console-fx/browser";
import { exportConsoleLog } from "@servrox/console-fx/codegen";
import { REFERENCE_EXAMPLES, referenceRecipe } from "./reference-examples";

describe("editable reference examples", () => {
  it.each(REFERENCE_EXAMPLES)(
    "$name preserves its complete data through static preview and export",
    ({ id }) => {
      const recipe = referenceRecipe(id);
      expect(
        parseRenderRecipe(JSON.parse(JSON.stringify(recipe))),
      ).toMatchObject({ ok: true, value: recipe });
      expect(parseScene(recipe.scene)).toMatchObject({ ok: true });
      const output = compileConsole(recipe.scene, recipe.options);
      expect(output.animated).toBe(false);
      expect(output.renderer).toBe("svg");
      expect(
        output.diagnostics.some(
          ({ code, severity }) =>
            code === "possible-clipping" || severity === "error",
        ),
      ).toBe(false);
      if (output.preview.kind !== "svg") throw new Error("SVG expected");
      const xml = decodeURIComponent(output.preview.imageUri.split(",")[1]!);
      const document = new JSDOM(xml, { contentType: "image/svg+xml" }).window
        .document;
      expect(
        document.querySelector("animate,animateTransform,script,foreignObject"),
      ).toBeNull();
      for (const text of recipe.scene.lines.flatMap((line) =>
        line.runs.flatMap((run) => run.text.split("\n")),
      )) {
        expect(
          [...document.querySelectorAll("text")].some(
            (node) => node.textContent === text,
          ),
        ).toBe(true);
      }
      const code = exportConsoleLog(recipe.scene, recipe.options).code;
      const calls: unknown[][] = [];
      new Function("console", code)({
        log: (...args: unknown[]) => calls.push(args),
      });
      expect(calls).toEqual([output.args]);
    },
  );
  it.each(
    REFERENCE_EXAMPLES.filter(
      (example) => "motion" in example && example.motion,
    ),
  )("$name has finite opt-in motion and a useful static image", ({ id }) => {
    const recipe = referenceRecipe(id);
    const moving = compileConsole(recipe.scene, {
      ...recipe.options,
      motion: "allow",
    });
    expect(moving.animated).toBe(true);
    if (moving.preview.kind !== "svg") throw new Error("SVG expected");
    const xml = decodeURIComponent(moving.preview.imageUri.split(",")[1]!);
    const document = new JSDOM(xml, { contentType: "image/svg+xml" }).window
      .document;
    const animations = [
      ...document.querySelectorAll("animate,animateTransform"),
    ];
    expect(animations.length).toBeGreaterThan(0);
    expect(
      animations.every(
        (node) =>
          node.getAttribute("repeatDur") === "4800ms" &&
          node.getAttribute("fill") === "freeze",
      ),
    ).toBe(true);
    expect(xml).not.toContain('repeatCount="indefinite"');
    const still = compileConsole(recipe.scene, recipe.options);
    expect(moving.text).toBe(still.text);
    expect(moving.preview).not.toEqual(still.preview);
  });
});
