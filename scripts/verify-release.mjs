import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { appendFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readCandidate } from "./package-candidate.mjs";

const repository = "servrox/console-fx";
const root = fileURLToPath(new URL("..", import.meta.url));

export function verifyRegistryConsumerLock(lock, packages) {
  // Match protocol values, not pnpm keys such as excludeLinksFromLockfile
  // or a registry dependency named "file".
  assert(
    !/\b(?:file|link):(?=\S)/.test(lock),
    "Registry consumers must not resolve local packages",
  );
  for (const item of packages)
    assert(
      lock.includes(item.integrity),
      "Consumer lock is missing the verified registry integrity",
    );
}

export function verifyRegistryMetadata(metadata, candidate) {
  // npm view --json can wrap a single exact version in an array.
  if (Array.isArray(metadata)) {
    assert.equal(metadata.length, 1, "Expected exactly one registry version");
    metadata = metadata[0];
  }
  assert(
    metadata && typeof metadata === "object" && !Array.isArray(metadata),
    "Expected a registry metadata object",
  );
  assert.equal(metadata.name, candidate.name, "Wrong registry package");
  assert.equal(metadata.version, candidate.version, "Wrong registry version");
  const bytes = readFileSync(candidate.tarball);
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    candidate.sha256,
    "Candidate bytes changed",
  );
  const integrity = `sha512-${createHash("sha512").update(bytes).digest("base64")}`;
  assert.equal(
    metadata.dist?.integrity,
    integrity,
    "Registry integrity differs from the tested candidate",
  );
  const url = new URL(metadata.dist.tarball);
  assert.equal(
    url.origin,
    "https://registry.npmjs.org",
    "Unexpected registry tarball host",
  );
  assert(!url.username && !url.password, "Unexpected registry credentials");
  return {
    name: candidate.name,
    version: candidate.version,
    tarball: url.href,
    sha256: candidate.sha256,
    integrity,
  };
}

export function verifyValidationRun(run, artifacts, commit) {
  assert.match(commit, /^[a-f0-9]{40}$/, "A full source commit is required");
  assert.equal(run.repository?.full_name, repository, "Wrong repository");
  assert.equal(run.path, ".github/workflows/validate.yml", "Wrong workflow");
  assert.equal(run.head_sha, commit, "Validation is for a different commit");
  assert.equal(run.head_branch, "main", "Validate the merged main candidate");
  assert(["push", "workflow_dispatch"].includes(run.event), "Wrong run event");
  assert.equal(run.status, "completed", "Validation has not completed");
  assert.equal(run.conclusion, "success", "Validation did not pass");
  assert.equal(
    artifacts.total_count,
    artifacts.artifacts.length,
    "Artifact listing is incomplete",
  );
  const matches = artifacts.artifacts.filter(
    (artifact) => artifact.name === `console-fx-candidate-${commit}`,
  );
  assert.equal(matches.length, 1, "Expected one identified candidate artifact");
  const artifact = matches[0];
  assert(!artifact.expired, "Candidate artifact has expired");
  assert(
    Number.isSafeInteger(artifact.id) && artifact.id > 0,
    "Invalid artifact ID",
  );
  assert.equal(
    artifact.workflow_run?.id,
    run.id,
    "Artifact belongs to another run",
  );
  assert.equal(
    artifact.workflow_run?.head_sha,
    commit,
    "Artifact source mismatch",
  );
  return artifact.id;
}

export function verifyReleaseArtifacts({
  artifactsDirectory,
  sourceRoot = root,
  expectedHashes,
  tag,
}) {
  assert(
    ["latest", "next"].includes(tag),
    "Choose the reviewed latest or next tag",
  );
  const candidate = readCandidate({ artifactsDirectory, sourceRoot });
  return candidate.packages.map(({ name, version, tarball, sha256 }, index) => {
    const expected = expectedHashes[index];
    assert.match(
      expected,
      /^[a-f0-9]{64}$/,
      `A reviewed SHA-256 is required for ${name}`,
    );
    assert.equal(sha256, expected, "Receipt differs from the reviewed hash");
    if (tag === "latest")
      assert(!version.includes("-"), "A prerelease cannot use the stable tag");
    return { name, version, tarball, sha256, tag };
  });
}

function output(values) {
  for (const [key, value] of Object.entries(values)) {
    assert(!String(value).includes("\n") && !String(value).includes("\r"));
    if (process.env.GITHUB_OUTPUT)
      appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
  }
  console.log(JSON.stringify(values, null, 2));
}

async function main() {
  if (process.argv[2] === "run") {
    assert.equal(process.env.GITHUB_REPOSITORY, repository);
    assert.equal(process.env.GITHUB_REF, "refs/heads/main");
    const runId = process.env.CONSOLE_FX_VALIDATION_RUN_ID;
    assert.match(runId, /^[1-9]\d*$/, "A validation run ID is required");
    assert(process.env.GITHUB_TOKEN, "GitHub Actions read access is required");
    async function get(path) {
      const response = await fetch(
        `https://api.github.com/repos/${repository}/${path}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2026-03-10",
          },
          signal: globalThis.AbortSignal.timeout(30_000),
        },
      );
      assert(
        response.ok,
        `GitHub metadata request failed (${response.status})`,
      );
      return response.json();
    }
    const [run, artifacts] = await Promise.all([
      get(`actions/runs/${runId}`),
      get(`actions/runs/${runId}/artifacts?per_page=100`),
    ]);
    assert.equal(String(run.id), runId);
    output({
      artifact_id: verifyValidationRun(run, artifacts, process.env.GITHUB_SHA),
    });
  } else if (process.argv[2] === "artifacts") {
    const packages = verifyReleaseArtifacts({
      artifactsDirectory: resolve(
        process.env.CONSOLE_FX_RELEASE_ARTIFACTS ?? ".artifacts/packages",
      ),
      expectedHashes: [
        process.env.CONSOLE_FX_CORE_SHA256,
        process.env.CONSOLE_FX_REACT_SHA256,
      ],
      tag: process.env.CONSOLE_FX_DIST_TAG,
    });
    output({
      core_tarball: packages[0].tarball,
      core_version: packages[0].version,
      core_sha256: packages[0].sha256,
      react_tarball: packages[1].tarball,
      react_version: packages[1].version,
      react_sha256: packages[1].sha256,
      dist_tag: packages[0].tag,
    });
  } else {
    throw new Error(
      "Usage: node scripts/verify-release.mjs run|artifacts (verification only)",
    );
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  await main();
