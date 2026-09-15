import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("isolated public imports (build packages first)", () => {
  it.each([
    "../dist/index.js",
    "../dist/browser/index.js",
    "../dist/presets/index.js",
    "../dist/codegen/index.js",
    "../../console-fx-react/dist/index.js",
  ])("imports %s without browser access or effects", (entry) => {
    const moduleUrl = new URL(entry, import.meta.url).href;
    const probe = `
      import { writeSync } from "node:fs";
      import http from "node:http";
      import https from "node:https";
      import { syncBuiltinESMExports } from "node:module";
      const effects = [];
      const fail = name => () => { effects.push(name); throw new Error(name); };
      for (const key of Object.keys(console)) {
        if (typeof console[key] === "function") console[key] = fail("console." + key);
      }
      for (const key of ["setTimeout", "setInterval", "setImmediate", "requestAnimationFrame", "requestIdleCallback", "fetch", "WebSocket", "XMLHttpRequest"]) {
        globalThis[key] = fail(key);
      }
      for (const key of ["window", "document", "localStorage", "matchMedia"]) {
        Object.defineProperty(globalThis, key, { configurable: true, get: fail(key) });
      }
      http.request = fail("http.request"); http.get = fail("http.get");
      https.request = fail("https.request"); https.get = fail("https.get");
      syncBuiltinESMExports();
      await import(${JSON.stringify(moduleUrl)});
      writeSync(1, JSON.stringify({ imported: true, effects }));
    `;
    const output = spawnSync(
      process.execPath,
      ["--input-type=module", "-e", probe],
      {
        cwd: fileURLToPath(new URL("..", import.meta.url)),
        encoding: "utf8",
        timeout: 5_000,
        env: { ...process.env, NODE_ENV: "production" },
      },
    );
    expect(output.error).toBeUndefined();
    expect(output.status, output.stderr).toBe(0);
    // The marker also detects environments that swallow child output/status.
    expect(JSON.parse(output.stdout)).toEqual({ imported: true, effects: [] });
    expect(output.stderr).toBe("");
  });
});
