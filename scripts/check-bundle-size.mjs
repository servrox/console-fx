import assert from "node:assert/strict";
import { build } from "esbuild";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";
import {
  artifacts,
  hash,
  readJson,
  root,
  run,
  saveReceipt,
} from "./package-candidate.mjs";

const candidate = readJson(resolve(artifacts, "candidate.json"));
const core = candidate.packages.find(
  (item) => item.name === "@servrox/console-fx",
);
assert.equal(core.sha256, hash(core.tarball));
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
for (const [renderer, effect, budget] of [
  ["css", "neon", 10 * 1024],
  ["svg", "rainbow", 25 * 1024],
]) {
  const path = resolve(consumer, `${renderer}.mjs`);
  writeFileSync(
    path,
    `import { defineScene } from "@servrox/console-fx";\nimport { compileConsole } from "@servrox/console-fx/browser";\nexport const message = compileConsole(defineScene({schemaVersion:1,label:"Bundle fixture",lines:[{runs:[{text:"Bundle fixture",effects:[{kind:"${effect}"}]}]}]}), {renderer:"${renderer}",target:"chromium"});\n`,
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
  const modules = Object.keys(result.metafile.inputs);
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
    `${renderer} consumer exceeds ${budget} gzip bytes`,
  );
  measurements.push({
    renderer,
    rawBytes: bytes.byteLength,
    gzipBytes,
    budget,
    modules,
  });
  console.log(
    `${renderer}: ${gzipBytes.toLocaleString("en-US")} gzip bytes / ${budget.toLocaleString("en-US")} budget; no React, Next, codegen or presets`,
  );
}
saveReceipt("bundles.json", {
  createdAt: new Date().toISOString(),
  core,
  tool: readJson(resolve(root, "package.json")).devDependencies.esbuild,
  measurements,
});
