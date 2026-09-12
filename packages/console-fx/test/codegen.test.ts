import { parse } from "acorn";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { compileConsole } from "../src/browser/index.js";
import { exportConsoleLog } from "../src/codegen/index.js";
import { defineScene, utf8ByteLength } from "../src/index.js";
import { neon, rainbow } from "../src/presets/index.js";

function execute(code: string, matches?: boolean): unknown[][] {
  const calls: unknown[][] = [];
  const context = {
    console: { log: (...args: unknown[]) => calls.push(args) },
    ...(matches === undefined ? {} : { matchMedia: () => ({ matches }) }),
  };
  runInNewContext(code, context, {
    timeout: 1000,
    contextCodeGeneration: { strings: false, wasm: false },
  });
  return calls;
}

// Independent, bounded model of Chromium's rescan loop, not a browser claim.
function formatted(args: readonly string[]): {
  text: string;
  styles: string[];
  remaining: number;
} {
  if (args.length === 1) return { text: args[0]!, styles: [], remaining: 0 };
  let input = args[0]!;
  let next = 1;
  let text = "";
  const styles: string[] = [];
  const regex = /%([%_Oocsdfi])/;
  for (let match = regex.exec(input); match; match = regex.exec(input)) {
    text += input.slice(0, match.index);
    let replacement = "";
    if (match[1] === "%") text += "%";
    else if (next >= args.length) text += match[0];
    else if (match[1] === "s") replacement = args[next++]!;
    else if (match[1] === "c") styles.push(args[next++]!);
    else next++;
    input = replacement + input.slice(match.index + match[0].length);
  }
  return { text: text + input, styles, remaining: args.length - next };
}

describe("standalone code generation", () => {
  it.each([
    "%",
    "%%",
    "%c",
    "%s",
    "%o",
    "%O",
    "%d",
    "%i",
    "%f",
    "%_",
    "%%%c%s%o%O",
    "tail%",
    'quotes " \\ </script> ${globalThis.pwned = true}',
    "👩🏽‍💻 é\u2028\u2029",
    "\t\n",
  ])("preserves literal %j across runs and exported execution", (text) => {
    const scene = defineScene({
      schemaVersion: 1,
      label: "fixture",
      lines: [
        {
          runs: [
            { text, style: { color: "#ff1234" } },
            { text: "tail", style: { color: "#0012ff" } },
          ],
        },
      ],
    });
    const options = { target: "chromium", renderer: "css" } as const;
    const compiled = compileConsole(scene, options);
    const exported = exportConsoleLog(scene, options);
    expect(execute(exported.code)).toEqual([[...compiled.args]]);
    const view = formatted(compiled.args);
    expect(view.text).toBe(text + "tail");
    expect(view.remaining).toBe(0);
    expect(view.styles).toHaveLength(3);
    expect(view.styles[0]).toContain("#ff1234");
    expect(view.styles[1]).toContain("#0012ff");
    expect(view.styles[2]).toBe("");
    expect(exported.byteLength).toBe(utf8ByteLength(exported.code));
    expect(exported.code).not.toContain("</script>");
    const ast = parse(exported.code, { ecmaVersion: "latest" });
    expect(ast.body).toHaveLength(1);
    expect(ast.body[0]?.type).toBe("ExpressionStatement");
  });
  it("demonstrates why raw substitution arguments alone are unsafe", () => {
    expect(
      formatted(["%c%s%c%s%c", "color:red", "%c", "color:blue", "tail", ""])
        .text,
    ).not.toBe("%ctail");
  });
  it("selects static, absent, and animated branches with exactly one log and direct parity", () => {
    const scene = rainbow({ motion: "gradientDrift" });
    const options = { target: "chromium", renderer: "svg" } as const;
    const exported = exportConsoleLog(scene, { ...options, motion: "system" });
    for (const matches of [true, false, undefined]) {
      expect(execute(exported.code, matches)).toEqual([
        [
          ...compileConsole(scene, {
            ...options,
            motion: matches ? "allow" : "reduce",
          }).args,
        ],
      ]);
    }
    expect(exported.byteLength).toBe(utf8ByteLength(exported.code));
    expect(exported.byteLength).toBeGreaterThan(
      exportConsoleLog(scene, options).byteLength,
    );
    expect(exported.code.match(/console\.log\(/g)).toHaveLength(1);
  });
  it("uses literal-only text by default, even for percent specifiers", () => {
    const output = exportConsoleLog(neon({ text: "%c %% %s" }));
    expect(execute(output.code)).toEqual([["%c %% %s"]]);
  });
});
