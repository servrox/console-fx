import assert from "node:assert/strict";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import {
  artifacts,
  hash,
  readJson,
  root,
  run,
  saveReceipt,
} from "./package-candidate.mjs";

const candidate = readJson(resolve(artifacts, "candidate.json"));
assert.equal(
  candidate.lockSha256,
  hash(resolve(root, "pnpm-lock.yaml")),
  "Repack after lockfile changes",
);
for (const item of candidate.packages)
  assert.equal(item.sha256, hash(item.tarball));
const consumer = mkdtempSync(resolve(tmpdir(), "console-fx-consumer-"));
cpSync(resolve(root, "examples/next-app"), consumer, { recursive: true });
mkdirSync(resolve(consumer, "checks"));
cpSync(resolve(root, "examples/vanilla"), resolve(consumer, "checks/vanilla"), {
  recursive: true,
});
cpSync(resolve(root, "examples/react"), resolve(consumer, "checks/react"), {
  recursive: true,
});
const manifest = readJson(resolve(consumer, "package.json"));
const workspace = readJson(resolve(root, "package.json"));
manifest.packageManager = workspace.packageManager;
for (const item of candidate.packages)
  manifest.dependencies[item.name] = `file:${item.tarball}`;
manifest.devDependencies.jsdom = workspace.devDependencies.jsdom;
for (const [name, version] of Object.entries({
  ...manifest.dependencies,
  ...manifest.devDependencies,
})) {
  if (!name.startsWith("@servrox/"))
    assert.equal(
      version,
      workspace.devDependencies[name],
      `${name} must match the locked toolchain`,
    );
}
writeFileSync(
  resolve(consumer, "package.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);
writeFileSync(
  resolve(consumer, "pnpm-workspace.yaml"),
  "strictPeerDependencies: true\nengineStrict: true\nminimumReleaseAge: 1440\nallowBuilds:\n  esbuild: false\n  sharp: false\n  unrs-resolver: false\n" +
    // The adapter's real semver dependency is inspected in check:packages.
    // Before first publication, resolve that dependency to the same candidate.
    `overrides:\n  '@servrox/console-fx': ${JSON.stringify(manifest.dependencies["@servrox/console-fx"])}\n`,
);
console.log(`Installing exact tarballs into ${consumer}`);
run("pnpm", ["install", "--ignore-scripts"], consumer);
console.log(
  run(process.execPath, ["checks/vanilla/check.mjs"], consumer).trim(),
);
console.log(run(process.execPath, ["checks/react/check.mjs"], consumer).trim());
run("pnpm", ["exec", "tsc", "--noEmit"], consumer);
console.log("Packed TypeScript declarations and React example passed");
const buildLog = run("pnpm", ["run", "build"], consumer);
assert(
  !buildLog.includes("Packed Next startup"),
  "Browser startup must not execute on the server",
);
assert(
  !buildLog.includes("Packed Next banner"),
  "Banner must not emit during server rendering",
);
assert(
  readFileSync(resolve(consumer, "out/index.html"), "utf8").includes(
    "Packed Next consumer",
  ),
);
console.log("Packed Next production build and static server rendering passed");
process.env.CONSOLE_FX_CONSUMER_DIR = consumer;
console.log(
  run("pnpm", [
    "exec",
    "playwright",
    "test",
    "--config",
    "playwright.consumers.config.ts",
  ]).trim(),
);
saveReceipt("consumers.json", {
  createdAt: new Date().toISOString(),
  candidate,
  consumer,
  checks: [
    "javascript",
    "typescript",
    "react-ssr-lifecycle",
    "next-production-build",
    "next-browser-lifecycle",
  ],
});
