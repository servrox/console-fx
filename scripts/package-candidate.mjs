import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const root = fileURLToPath(new URL("..", import.meta.url));
export const artifacts = resolve(root, ".artifacts/packages");
const packageDirectories = ["console-fx", "console-fx-react"];
export function run(command, args, cwd = root) {
  return execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}
export function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}
export function hash(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

/** Verify identity and bytes before any caller installs, bundles or releases them. */
export function readCandidate({
  artifactsDirectory = process.env.CONSOLE_FX_PACKAGE_ARTIFACTS ?? artifacts,
  sourceRoot = root,
} = {}) {
  const candidate = readJson(resolve(artifactsDirectory, "candidate.json"));
  assert(
    candidate && Array.isArray(candidate.packages),
    "Expected a package candidate receipt",
  );
  assert.equal(
    candidate.lockSha256,
    hash(join(sourceRoot, "pnpm-lock.yaml")),
    "Candidate lockfile differs from the checked-out source",
  );
  assert.equal(
    candidate.packages.length,
    2,
    "Expected both ConsoleFX packages",
  );
  const packages = packageDirectories.map((directory) => {
    const name = `@servrox/${directory}`;
    const source = readJson(
      join(sourceRoot, "packages", directory, "package.json"),
    );
    assert.equal(source.name, name);
    assert.match(source.version, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);
    const matches = candidate.packages.filter((item) => item?.name === name);
    assert.equal(matches.length, 1, `Expected exactly one ${name} candidate`);
    const item = matches[0];
    assert.equal(
      item.version,
      source.version,
      "Candidate version differs from source",
    );
    assert.equal(item.directory, directory);
    const filename = `servrox-${directory}-${source.version}.tgz`;
    assert.equal(typeof item.tarball, "string", "Expected a tarball filename");
    assert.equal(
      basename(item.tarball),
      filename,
      "Unexpected tarball filename",
    );
    // The recorded runner path is provenance, never an installation target.
    const tarball = resolve(artifactsDirectory, filename);
    assert(lstatSync(tarball).isFile(), "The candidate must be a regular file");
    assert.equal(
      realpathSync(tarball),
      join(realpathSync(artifactsDirectory), filename),
    );
    assert.match(item.sha256, /^[a-f0-9]{64}$/, "Expected a candidate SHA-256");
    assert.equal(
      hash(tarball),
      item.sha256,
      "Tarball differs from the candidate receipt",
    );
    const packed = JSON.parse(
      execFileSync("tar", ["-xOzf", tarball, "package/package.json"], {
        encoding: "utf8",
        maxBuffer: 1024 * 1024,
      }),
    );
    assert.equal(packed.name, name);
    assert.equal(packed.version, source.version);
    assert.equal(
      packed.repository?.url,
      "git+https://github.com/servrox/console-fx.git",
    );
    assert.equal(packed.publishConfig?.access, "public");
    return { ...item, tarball };
  });
  return { ...candidate, packages };
}

export function packCandidate() {
  mkdirSync(artifacts, { recursive: true });
  const packages = packageDirectories.map((directory) => {
    const location = resolve(root, "packages", directory);
    const manifest = readJson(resolve(location, "package.json"));
    const packed = JSON.parse(
      run(
        "pnpm",
        ["pack", "--json", "--pack-destination", artifacts],
        location,
      ),
    );
    const tarball = resolve(
      artifacts,
      `${manifest.name.replace(/^@/, "").replaceAll("/", "-")}-${manifest.version}.tgz`,
    );
    assert(packed, "pnpm must report the packed candidate");
    return {
      name: manifest.name,
      version: manifest.version,
      directory,
      tarball,
      sha256: hash(tarball),
    };
  });
  return {
    createdAt: new Date().toISOString(),
    lockSha256: hash(resolve(root, "pnpm-lock.yaml")),
    packages,
  };
}

export function saveReceipt(name, data) {
  mkdirSync(artifacts, { recursive: true });
  writeFileSync(resolve(artifacts, name), JSON.stringify(data, null, 2) + "\n");
}
