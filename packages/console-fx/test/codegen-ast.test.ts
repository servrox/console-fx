import { parse, type Node } from "acorn";
import { expect, it } from "vitest";
import { exportConsoleLog } from "../src/codegen/index.js";
import { neon, rainbow } from "../src/presets/index.js";

type Ast = Node & Record<string, unknown>;

function assertSourceGrammar(source: string) {
  let logs = 0;
  let mediaQueries = 0;
  const allowed = new Set([
    "Program",
    "ExpressionStatement",
    "CallExpression",
    "MemberExpression",
    "Identifier",
    "Literal",
    "SpreadElement",
    "ConditionalExpression",
    "ArrayExpression",
    "LogicalExpression",
    "BinaryExpression",
    "UnaryExpression",
    "ChainExpression",
  ]);
  function visit(node: Ast) {
    expect(allowed.has(node.type), node.type).toBe(true);
    if (node.type === "Program") expect(node.body).toHaveLength(1);
    if (node.type === "Identifier")
      expect([
        "console",
        "log",
        "globalThis",
        "matchMedia",
        "matches",
      ]).toContain(node.name);
    if (node.type === "Literal")
      expect(["string", "boolean"]).toContain(typeof node.value);
    if (node.type === "MemberExpression") expect(node.computed).toBe(false);
    if (node.type === "CallExpression") {
      const callee = node.callee as Ast;
      expect(callee.type).toBe("MemberExpression");
      const owner = callee.object as Ast;
      const property = callee.property as Ast;
      expect(owner.type).toBe("Identifier");
      if (owner.name === "console") {
        expect(property.name).toBe("log");
        logs++;
      } else {
        expect(owner.name).toBe("globalThis");
        expect(property.name).toBe("matchMedia");
        mediaQueries++;
        const args = node.arguments as Ast[];
        expect(args).toHaveLength(1);
        expect(args[0]?.value).toBe("(prefers-reduced-motion: no-preference)");
      }
    }
    if (node.type === "UnaryExpression") expect(node.operator).toBe("typeof");
    if (node.type === "BinaryExpression") expect(node.operator).toBe("===");
    if (node.type === "LogicalExpression") expect(node.operator).toBe("&&");
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        for (const child of value) if (child?.type) visit(child as Ast);
      } else if (value && typeof value === "object" && "type" in value)
        visit(value as Ast);
    }
  }
  visit(parse(source, { ecmaVersion: "latest" }) as unknown as Ast);
  expect(logs).toBe(1);
  expect(mediaQueries).toBeLessThanOrEqual(1);
}

it("allows only one log statement, literal data, and the documented read-only media guard", () => {
  for (const scene of [
    neon({ text: "');fetch('https://example.invalid'); // ${window.x=1}" }),
    rainbow({ motion: "gradientDrift" }),
  ]) {
    for (const motion of ["reduce", "system"] as const) {
      for (const renderer of ["text", "svg"] as const) {
        assertSourceGrammar(
          exportConsoleLog(scene, { target: "chromium", renderer, motion })
            .code,
        );
      }
    }
  }
});

it.each([
  'console.log((async () => { try { return globalThis.matchMedia("(prefers-reduced-motion: no-preference)").matches; } catch { return false; } })());',
  "console.log(((matches) => { try { return matches; } catch { return false; } })(true));",
  'console.log((() => { try { return fetch("https://example.invalid"); } catch { return false; } })());',
  'console.log((() => { try { return globalThis.matchMedia("(prefers-reduced-motion: no-preference)").matches; } catch { console.log("extra"); return false; } })());',
])(
  "rejects helper functions and extra capabilities in standalone source: %s",
  (source) => {
    expect(() => assertSourceGrammar(source)).toThrow();
  },
);
