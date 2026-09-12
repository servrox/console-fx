import { describe, expect, it } from "vitest";
import { parseRenderRecipe } from "@servrox/console-fx";
import { compileConsole } from "@servrox/console-fx/browser";
import { exportConsoleLog } from "@servrox/console-fx/codegen";
import { EXAMPLES, exampleRecipe } from "./examples";

describe("authored website examples", () => {
  it("keeps the same facts and order in plain/styled previews and one-call exports", () => {
    for (const example of EXAMPLES) {
      const recipe = exampleRecipe(example.id);
      expect(parseRenderRecipe(recipe).ok).toBe(true);
      const styled = compileConsole(recipe.scene, recipe.options);
      const plain = compileConsole(recipe.scene, {
        ...recipe.options,
        renderer: "text",
      });
      expect(styled.text).toBe(plain.text);
      for (const renderer of ["text", recipe.options.renderer] as const) {
        const options = { ...recipe.options, renderer };
        const calls: unknown[][] = [];
        new Function("console", exportConsoleLog(recipe.scene, options).code)({
          log: (...args: unknown[]) => calls.push(args),
        });
        expect(calls).toEqual([compileConsole(recipe.scene, options).args]);
      }
    }
  });
  it("preserves literal percent and Unicode input and rejects unsafe control text", () => {
    const text = "100% %c %s 👩🏽‍💻 Café";
    for (const style of ["neon", "rgbSplit", "chrome"] as const) {
      const recipe = exampleRecipe("signature", text, style);
      expect(compileConsole(recipe.scene, recipe.options).text).toBe(text);
    }
    expect(() => exampleRecipe("signature", "bad\u001b[31m")).toThrow();
  });
});
