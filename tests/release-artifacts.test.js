import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  renameSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  verifyReleaseArtifacts,
  verifyRegistryMetadata,
  verifyValidationRun,
} from "../scripts/verify-release.mjs";
import { readCandidate } from "../scripts/package-candidate.mjs";

const commit = "a".repeat(40);
const run = {
  id: 123,
  repository: { full_name: "servrox/console-fx" },
  path: ".github/workflows/validate.yml",
  head_sha: commit,
  head_branch: "main",
  event: "push",
  status: "completed",
  conclusion: "success",
};
const artifact = {
  id: 456,
  name: `console-fx-candidate-${commit}`,
  expired: false,
  workflow_run: { id: run.id, head_sha: commit },
};
const listing = { total_count: 1, artifacts: [artifact] };

test("release selection binds a successful main run to its exact artifact", () => {
  assert.equal(verifyValidationRun(run, listing, commit), artifact.id);
  for (const changed of [
    { head_sha: "b".repeat(40) },
    { head_branch: "feature" },
    { event: "pull_request" },
    { path: ".github/workflows/unrelated.yml" },
    { repository: { full_name: "someone/console-fx" } },
    { status: "in_progress" },
    { conclusion: "failure" },
  ])
    assert.throws(() =>
      verifyValidationRun({ ...run, ...changed }, listing, commit),
    );
});

test("missing, expired, ambiguous and foreign artifacts cannot publish", () => {
  for (const artifacts of [
    [],
    [{ ...artifact, expired: true }],
    [artifact, artifact],
    [{ ...artifact, workflow_run: { id: 999, head_sha: commit } }],
    [{ ...artifact, workflow_run: { id: run.id, head_sha: "b".repeat(40) } }],
  ])
    assert.throws(() =>
      verifyValidationRun(
        run,
        { total_count: artifacts.length, artifacts },
        commit,
      ),
    );
  assert.throws(() =>
    verifyValidationRun(run, { ...listing, total_count: 101 }, commit),
  );
});

function fixture(t) {
  const sourceRoot = mkdtempSync(join(tmpdir(), "console-fx-release-test-"));
  t.after(() => rmSync(sourceRoot, { recursive: true, force: true }));
  const artifactsDirectory = join(sourceRoot, "artifacts");
  mkdirSync(artifactsDirectory);
  const hash = (path) =>
    createHash("sha256").update(readFileSync(path)).digest("hex");
  writeFileSync(join(sourceRoot, "pnpm-lock.yaml"), "locked candidate\n");
  const packages = ["console-fx", "console-fx-react"].map((directory) => {
    const manifest = {
      name: `@servrox/${directory}`,
      version: "0.1.0",
      repository: { url: "git+https://github.com/servrox/console-fx.git" },
      publishConfig: { access: "public" },
    };
    const location = join(sourceRoot, "packages", directory);
    mkdirSync(join(location, "package"), { recursive: true });
    writeFileSync(join(location, "package.json"), JSON.stringify(manifest));
    writeFileSync(
      join(location, "package/package.json"),
      JSON.stringify(manifest),
    );
    const tarball = join(artifactsDirectory, `servrox-${directory}-0.1.0.tgz`);
    execFileSync("tar", ["-czf", tarball, "package"], { cwd: location });
    return {
      name: manifest.name,
      directory,
      version: manifest.version,
      tarball,
      sha256: hash(tarball),
    };
  });
  const candidate = {
    packages,
    lockSha256: hash(join(sourceRoot, "pnpm-lock.yaml")),
  };
  const save = () =>
    writeFileSync(
      join(artifactsDirectory, "candidate.json"),
      JSON.stringify(candidate),
    );
  save();
  return {
    options: {
      sourceRoot,
      artifactsDirectory,
      expectedHashes: packages.map((p) => p.sha256),
      tag: "latest",
    },
    candidate,
    save,
  };
}

test("registry consumers bind exact names, versions, bytes and the public registry", (t) => {
  const { candidate } = fixture(t);
  const item = candidate.packages[0];
  const integrity = `sha512-${createHash("sha512").update(readFileSync(item.tarball)).digest("base64")}`;
  const metadata = {
    name: item.name,
    version: item.version,
    dist: {
      integrity,
      tarball:
        "https://registry.npmjs.org/@servrox/console-fx/-/console-fx-0.1.0.tgz",
    },
  };
  assert.deepEqual(verifyRegistryMetadata(metadata, item), {
    name: item.name,
    version: item.version,
    tarball: metadata.dist.tarball,
    integrity,
    sha256: item.sha256,
  });
  for (const changed of [
    { name: "@someone/console-fx" },
    { version: "0.2.0" },
    { dist: { ...metadata.dist, integrity: "sha512-different" } },
    ...[
      "https://registry.npmjs.org.example.com/package.tgz",
      "http://registry.npmjs.org/package.tgz",
      "file:///tmp/package.tgz",
      "https://user:password@registry.npmjs.org/package.tgz",
    ].map((tarball) => ({ dist: { ...metadata.dist, tarball } })),
  ])
    assert.throws(() =>
      verifyRegistryMetadata({ ...metadata, ...changed }, item),
    );
  writeFileSync(item.tarball, "changed after packing");
  assert.throws(
    () => verifyRegistryMetadata(metadata, item),
    /Candidate bytes changed/,
  );
});

test("reviewed tarballs are resolved from the download directory", (t) => {
  const f = fixture(t);
  for (const item of f.candidate.packages)
    item.tarball = `/original-runner/${item.tarball.split("/").at(-1)}`;
  f.save();
  const result = verifyReleaseArtifacts(f.options);
  assert.deepEqual(
    readCandidate(f.options).packages.map(
      ({ name, version, tarball, sha256 }) => ({
        name,
        version,
        tarball,
        sha256,
        tag: "latest",
      }),
    ),
    result,
  );
  assert.deepEqual(
    result.map((p) => p.name),
    ["@servrox/console-fx", "@servrox/console-fx-react"],
  );
  assert(
    result.every((p) =>
      p.tarball.startsWith(f.options.artifactsDirectory + "/"),
    ),
  );
});

test("an approved receipt cannot hide modified tarball bytes", (t) => {
  const f = fixture(t);
  writeFileSync(f.candidate.packages[0].tarball, "modified artifact");
  assert.throws(() => verifyReleaseArtifacts(f.options), /Tarball differs/);
});

test("a forged receipt hash cannot substitute a different approved candidate", (t) => {
  const f = fixture(t);
  f.candidate.packages[0].sha256 = "0".repeat(64);
  f.save();
  assert.throws(() => verifyReleaseArtifacts(f.options), /Tarball differs/);
});

test("source, version and filename drift stop publication", (t) => {
  const f = fixture(t);
  f.candidate.packages[0].version = "0.2.0";
  f.save();
  assert.throws(() => verifyReleaseArtifacts(f.options), /version differs/);
  f.candidate.packages[0].version = "0.1.0";
  f.candidate.packages[0].tarball = "../../outside.tgz";
  f.save();
  assert.throws(() => verifyReleaseArtifacts(f.options), /filename/);
  writeFileSync(
    join(f.options.sourceRoot, "pnpm-lock.yaml"),
    "different dependency input\n",
  );
  assert.throws(() => verifyReleaseArtifacts(f.options), /lockfile differs/);
});

test("publication requires explicit valid hashes and a supported tag", (t) => {
  const f = fixture(t);
  assert.throws(() =>
    verifyReleaseArtifacts({
      ...f.options,
      expectedHashes: [undefined, undefined],
    }),
  );
  assert.throws(
    () => verifyReleaseArtifacts({ ...f.options, tag: "--registry=elsewhere" }),
    /tag/,
  );
});

test("candidate readers reject duplicate, missing or foreign packages before consumption", (t) => {
  const f = fixture(t);
  const original = [...f.candidate.packages];
  for (const packages of [
    [],
    [original[0]],
    [original[0], original[0]],
    [original[0], { ...original[1], name: "@someone/console-fx-react" }],
  ]) {
    f.candidate.packages = packages;
    f.save();
    assert.throws(() => readCandidate(f.options), /Expected/);
  }
});

test("candidate readers reject symlinked tarballs even when bytes match", (t) => {
  const f = fixture(t);
  const tarball = f.candidate.packages[0].tarball;
  renameSync(tarball, tarball + ".original");
  symlinkSync(tarball + ".original", tarball);
  assert.throws(() => readCandidate(f.options), /regular file/);
});

test("packed identity is verified independently of a receipt hash", (t) => {
  const f = fixture(t);
  const item = f.candidate.packages[0];
  const directory = join(f.options.sourceRoot, "packages", item.directory);
  const manifest = JSON.parse(
    readFileSync(join(directory, "package/package.json"), "utf8"),
  );
  writeFileSync(
    join(directory, "package/package.json"),
    JSON.stringify({ ...manifest, name: "@someone/substitute" }),
  );
  execFileSync("tar", ["-czf", item.tarball, "package"], { cwd: directory });
  item.sha256 = createHash("sha256")
    .update(readFileSync(item.tarball))
    .digest("hex");
  f.save();
  assert.throws(() => readCandidate(f.options), /@someone\/substitute/);
});

test("valid candidate bytes still require their separately reviewed release hash", (t) => {
  const f = fixture(t);
  assert.doesNotThrow(() => readCandidate(f.options));
  assert.throws(
    () =>
      verifyReleaseArtifacts({
        ...f.options,
        expectedHashes: ["0".repeat(64), f.options.expectedHashes[1]],
      }),
    /Receipt differs from the reviewed hash/,
  );
});
