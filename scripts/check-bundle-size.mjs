import assert from "node:assert/strict";
import { build } from "esbuild";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";
import {
  readJson,
  readCandidate,
  root,
  run,
  saveReceipt,
} from "./package-candidate.mjs";

const candidate = readCandidate();
const core = candidate.packages.find(
  (item) => item.name === "@servrox/console-fx",
);
const consumer = mkdtempSync(resolve(tmpdir(), "console-fx-bundle-"));
writeFileSync(
  resolve(consumer, "package.json"),
  JSON.stringify({
    private: true,
    type: "module",
    dependencies: { [core.name]: `file:${core.tarball}` },
  }),
);
run("pnpm", ["install", "--ignore-scripts", "--offline"], consumer);
const measurements = [];
for (const [fixture, renderer, effect, compiler, budget] of [
  ["css", "css", "neon", "compileCssConsole", 10 * 1024],
  ["complete-css", "css", "neon", "compileConsole", 25 * 1024],
  ["svg", "svg", "rainbow", "compileConsole", 25 * 1024],
]) {
  const path = resolve(consumer, `${fixture}.mjs`);
  writeFileSync(
    path,
    `import { defineScene } from "@servrox/console-fx";\nimport { ${compiler} } from "@servrox/console-fx/browser";\nexport const message = ${compiler}(defineScene({schemaVersion:1,label:"Bundle fixture",lines:[{runs:[{text:"Bundle fixture",effects:[{kind:"${effect}"}]}]}]}), {${compiler === "compileConsole" ? `renderer:"${renderer}",` : ""}target:"chromium"});\n`,
  );
  const result = await build({
    absWorkingDir: consumer,
    entryPoints: [path],
    bundle: true,
    write: false,
    minify: true,
    format: "esm",
    platform: "browser",
    target: "es2022",
    metafile: true,
  });
  // Scanned imports can be removed by tree shaking. Count modules with emitted bytes.
  const modules = [
    ...new Set(
      Object.values(result.metafile.outputs).flatMap((output) =>
        Object.entries(output.inputs)
          .filter(([, info]) => info.bytesInOutput > 0)
          .map(([path]) => path),
      ),
    ),
  ];
  if (compiler === "compileCssConsole")
    assert(
      !modules.some((path) =>
        /\/renderers\/(?:svg\.js|cinematic\/|presentations\/render\.js)/.test(
          path,
        ),
      ),
      "CSS consumer retained SVG artwork",
    );
  assert(
    !modules.some((name) =>
      /(?:console-fx-react|\/react\/|\/next\/|\/codegen\/|\/presets\/)/.test(
        name,
      ),
    ),
    "Unexpected framework/exporter/preset module in a basic core consumer",
  );
  const bytes = result.outputFiles[0].contents;
  const gzipBytes = gzipSync(bytes, { level: 9 }).byteLength;
  assert(
    gzipBytes <= budget,
    `${fixture} consumer is ${gzipBytes} gzip bytes, exceeding ${budget}`,
  );
  measurements.push({
    fixture,
    compiler,
    renderer,
    rawBytes: bytes.byteLength,
    gzipBytes,
    budget,
    modules,
  });
  console.log(
    `${fixture}: ${gzipBytes.toLocaleString("en-US")} gzip bytes / ${budget.toLocaleString("en-US")} budget; no React, Next, codegen or presets`,
  );
}
const rootEntry = resolve(consumer, "root.mjs");
writeFileSync(
  rootEntry,
  'export { defineScene, parseScene, getEffectDescriptors } from "@servrox/console-fx";',
);
const rootBundle = await build({
  absWorkingDir: consumer,
  entryPoints: [rootEntry],
  bundle: true,
  write: false,
  platform: "browser",
  format: "esm",
  metafile: true,
});
const rootModules = Object.keys(rootBundle.metafile.inputs);
assert(
  !rootModules.some((name) =>
    /\/(?:renderers|browser|codegen|presets)\//.test(name),
  ),
  "Root data APIs must not import rendering or glyph assets",
);
console.log(
  "Root data APIs contain no renderer, glyph, preset or exporter modules",
);
saveReceipt("bundles.json", {
  createdAt: new Date().toISOString(),
  core,
  tool: readJson(resolve(root, "package.json")).devDependencies.esbuild,
  measurements,
  rootModules,
});
