import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve, relative } from "node:path";
import { verifyRegistryMetadata } from "./verify-release.mjs";
import {
  artifacts,
  hash,
  readJson,
  readCandidate,
  root,
  run,
  saveReceipt,
} from "./package-candidate.mjs";

const registryMode = process.argv.includes("--registry");
assert(
  process.argv.slice(2).every((arg) => arg === "--registry"),
  "Use check-consumers.mjs [--registry]",
);
const candidate = readCandidate();
const published = [];
if (registryMode) {
  for (const item of candidate.packages) {
    const metadata = JSON.parse(
      run("npm", [
        "view",
        `${item.name}@${item.version}`,
        "--json",
        "--registry=https://registry.npmjs.org",
      ]),
    );
    const verified = verifyRegistryMetadata(metadata, item);
    const response = await fetch(verified.tarball, {
      signal: globalThis.AbortSignal.timeout(30_000),
      redirect: "error",
    });
    assert(response.ok, `Registry tarball fetch failed (${response.status})`);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      item.sha256,
      "Registry bytes differ from the tested candidate",
    );
    published.push(verified);
  }
}
const consumer = mkdtempSync(resolve(tmpdir(), "console-fx-consumer-"));
cpSync(resolve(root, "examples/next-app"), consumer, { recursive: true });
mkdirSync(resolve(consumer, "checks"));
cpSync(resolve(root, "examples/vanilla"), resolve(consumer, "checks/vanilla"), {
  recursive: true,
});
cpSync(resolve(root, "examples/react"), resolve(consumer, "checks/react"), {
  recursive: true,
});
cpSync(resolve(root, "examples/website"), resolve(consumer, "checks/website"), {
  recursive: true,
});
cpSync(
  resolve(root, "apps/studio/src/features/landing/recipes.ts"),
  resolve(consumer, "checks/website/recipes.ts"),
);
const manifest = readJson(resolve(consumer, "package.json"));
const workspace = readJson(resolve(root, "package.json"));
manifest.packageManager = workspace.packageManager;
for (const item of candidate.packages)
  manifest.dependencies[item.name] = registryMode
    ? item.version
    : `file:${item.tarball}`;
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
  "strictPeerDependencies: true\nengineStrict: true\nminimumReleaseAge: 1440\nminimumReleaseAgeStrict: true\nallowBuilds:\n  esbuild: false\n  sharp: false\n  unrs-resolver: false\n" +
    (registryMode
      ? // Only the exact, independently verified first release bypasses the age delay.
        "minimumReleaseAgeExclude:\n" +
        candidate.packages
          .map(
            (item) => `  - ${JSON.stringify(`${item.name}@${item.version}`)}\n`,
          )
          .join("")
      : // Before first publication, the adapter resolves to the same local candidate.
        `overrides:\n  '@servrox/console-fx': ${JSON.stringify(manifest.dependencies["@servrox/console-fx"])}\n`),
);
// Generated public registry selection only; never copy the user's auth config.
writeFileSync(
  resolve(consumer, ".npmrc"),
  "registry=https://registry.npmjs.org/\n@servrox:registry=https://registry.npmjs.org/\n",
);
const fixtureFiles = [];
function visit(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) visit(path);
    else
      fixtureFiles.push({ path: relative(consumer, path), sha256: hash(path) });
  }
}
visit(consumer);
console.log(
  `Installing exact ${registryMode ? "registry versions" : "tarballs"} into ${consumer}`,
);
run("pnpm", ["install", "--ignore-scripts"], consumer);
const environmentDirectory = resolve(
  artifacts,
  registryMode ? "registry-consumer-environment" : "consumer-environment",
);
mkdirSync(environmentDirectory, { recursive: true });
const environmentFiles = [
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "package.json",
  ".npmrc",
].map((name) => {
  const path = resolve(environmentDirectory, name);
  cpSync(resolve(consumer, name), path);
  return { path: relative(artifacts, path), sha256: hash(path) };
});
const consumerLock = readFileSync(resolve(consumer, "pnpm-lock.yaml"), "utf8");
if (registryMode) {
  assert(
    !consumerLock.includes("file:") && !consumerLock.includes("link:"),
    "Registry consumers must not resolve local packages",
  );
  for (const item of published)
    assert(
      consumerLock.includes(item.integrity),
      "Consumer lock is missing the verified registry integrity",
    );
}
console.log(
  run(process.execPath, ["checks/vanilla/check.mjs"], consumer).trim(),
);
console.log(run(process.execPath, ["checks/react/check.mjs"], consumer).trim());
console.log(
  run(process.execPath, ["checks/website/check.mjs"], consumer).trim(),
);
run("pnpm", ["exec", "tsc", "--noEmit"], consumer);
console.log("Installed TypeScript declarations and React example passed");
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
console.log(
  "Installed Next production build and static server rendering passed",
);
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
saveReceipt(registryMode ? "registry-consumers.json" : "consumers.json", {
  createdAt: new Date().toISOString(),
  candidate,
  consumer,
  mode: registryMode ? "registry" : "tarballs",
  published,
  environment: {
    node: process.version,
    pnpm: run("pnpm", ["--version"]).trim(),
    platform: process.platform,
    architecture: process.arch,
    files: environmentFiles,
    fixtureFiles,
    harness: [
      "scripts/check-consumers.mjs",
      "scripts/package-candidate.mjs",
      "scripts/verify-release.mjs",
      "playwright.consumers.config.ts",
      "tests/consumers/next.spec.ts",
      "tests/studio/fixtures.ts",
      "tests/native-browser-diagnostics.ts",
    ].map((path) => ({ path, sha256: hash(resolve(root, path)) })),
  },
  checks: [
    "javascript",
    "typescript",
    "react-ssr-lifecycle",
    "next-production-build",
    "next-browser-lifecycle",
    "displayed-website-recipes",
  ],
});
