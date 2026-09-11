import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const root = fileURLToPath(new URL("..", import.meta.url));
export const artifacts = resolve(root, ".artifacts/packages");
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

export function packCandidate() {
  mkdirSync(artifacts, { recursive: true });
  const packages = ["console-fx", "console-fx-react"].map((directory) => {
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
