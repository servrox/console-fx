import assert from "node:assert/strict";
import { packCandidate, run, saveReceipt } from "./package-candidate.mjs";

const candidate = packCandidate();
for (const item of candidate.packages) {
  const files = run("tar", ["-tzf", item.tarball])
    .trim()
    .split("\n")
    .filter((path) => !path.endsWith("/"));
  const read = (path) => run("tar", ["-xOzf", item.tarball, `package/${path}`]);
  const manifest = JSON.parse(read("package.json"));
  assert.equal(manifest.name, item.name);
  assert.equal(manifest.type, "module");
  assert.equal(manifest.license, "MIT");
  assert.equal(manifest.sideEffects, false);
  assert.equal(manifest.publishConfig.access, "public");
  for (const file of ["README.md", "CHANGELOG.md", "LICENSE"])
    assert(files.includes(`package/${file}`), `Missing ${file}`);
  assert.match(read("LICENSE"), /Permission is hereby granted, free of charge/);
  assert(!JSON.stringify(manifest).includes("workspace:"));
  assert(
    !Object.keys(manifest.scripts ?? {}).some((name) =>
      /^(preinstall|install|postinstall)$/.test(name),
    ),
  );
  assert(
    files.every((path) =>
      /^package\/(dist\/[^.].*\.(js|d\.ts|js\.map|d\.ts\.map)|package\.json|README\.md|CHANGELOG\.md|LICENSE)$/.test(
        path,
      ),
    ),
    "Unexpected package contents",
  );
  for (const [entry, target] of Object.entries(manifest.exports)) {
    if (entry === "./package.json") continue;
    for (const kind of ["types", "import"]) {
      assert.equal(typeof target[kind], "string");
      assert(
        files.includes(`package/${target[kind].replace(/^\.\//, "")}`),
        `Missing ${entry} ${kind}`,
      );
    }
  }
  if (item.directory === "console-fx") {
    assert.deepEqual(manifest.dependencies ?? {}, {});
    assert.deepEqual(manifest.peerDependencies ?? {}, {});
    assert(!files.some((path) => /react|next|studio|editor|test\//.test(path)));
  } else {
    assert.equal(manifest.peerDependencies.react, "^19.0.0");
    assert.equal(
      manifest.dependencies["@servrox/console-fx"],
      `^${item.version}`,
    );
    assert.match(read("dist/index.js"), /^"use client";/);
  }
  item.files = files;
  console.log(
    `${item.name}@${item.version}: ${files.length} allowed files; exports, declarations, license and dependencies verified`,
  );
}
saveReceipt("candidate.json", candidate);
