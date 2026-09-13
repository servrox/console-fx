import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  cpSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, relative, resolve } from "node:path";
import { JSDOM } from "jsdom";
import { hash, root } from "./package-candidate.mjs";

function exists(path) {
  try {
    lstatSync(path);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}
function directory(path) {
  if (!exists(path)) mkdirSync(path);
  assert(
    lstatSync(path).isDirectory(),
    `Expected an ordinary directory: ${path}`,
  );
}
function scan(root) {
  assert(
    lstatSync(root).isDirectory(),
    "Static output must be an ordinary directory",
  );
  const files = [];
  const directories = [];
  function visit(location) {
    for (const entry of readdirSync(location, { withFileTypes: true })) {
      const path = join(location, entry.name);
      assert(
        !entry.isSymbolicLink(),
        "Static output must not contain symlinks",
      );
      if (entry.isDirectory()) {
        directories.push(relative(root, path));
        visit(path);
      } else {
        assert(entry.isFile(), "Static output must contain only regular files");
        files.push({ path: relative(root, path), sha256: hash(path) });
      }
    }
  }
  visit(root);
  return {
    files: files.sort((a, b) => a.path.localeCompare(b.path)),
    directories: directories.sort(),
  };
}
function verifyOutput(output, receipt) {
  assert(
    receipt.framework === "Next static export" && Array.isArray(receipt.files),
    "Invalid output ownership receipt",
  );
  const actual = scan(output);
  const expected = [
    { path: "config.json", sha256: receipt.configSha256 },
    ...receipt.files.map((file) => ({
      path: `static/${file.path}`,
      sha256: file.sha256,
    })),
  ].sort((a, b) => a.path.localeCompare(b.path));
  assert.deepEqual(
    actual.files,
    expected,
    "The prepared output changed; preserve it before preparing again",
  );
  // Legacy receipts recorded files only. New receipts also protect empty directories.
  if (receipt.directories)
    assert.deepEqual(
      actual.directories,
      ["static", ...receipt.directories.map((path) => `static/${path}`)].sort(),
      "The prepared output directories changed",
    );
}
function previousState(output, marker, candidate) {
  const state = {
    output: exists(output),
    marker: null,
    candidate: null,
    receipt: null,
  };
  assert(
    !state.output || exists(marker),
    "An existing unowned Vercel output must be preserved",
  );
  assert(
    !exists(marker) || state.output,
    "An ownership receipt exists without its output; recover it first",
  );
  assert(
    !exists(candidate) || exists(marker),
    "An unowned candidate receipt must be preserved",
  );
  for (const [key, path] of [
    ["marker", marker],
    ["candidate", candidate],
  ]) {
    if (!exists(path)) continue;
    assert(
      lstatSync(path).isFile(),
      `The ${key} receipt must be a regular file`,
    );
    state[key] = readFileSync(path, "utf8");
  }
  if (state.marker !== null) {
    state.receipt = JSON.parse(state.marker);
    verifyOutput(output, state.receipt);
    if (state.candidate !== null)
      assert.equal(
        state.candidate,
        state.marker,
        "The candidate receipt changed independently; preserve it first",
      );
  }
  return state;
}

function stageOutput(source, output) {
  const original = scan(source);
  assert(
    original.files.some((file) => file.path === "index.html"),
    "Build the production studio first",
  );
  mkdirSync(output);
  cpSync(source, join(output, "static"), { recursive: true });
  const copied = scan(join(output, "static"));
  assert.deepEqual(
    copied,
    original,
    "Static output changed while preparing; rebuild and retry",
  );
  const { files, directories } = copied;
  const scriptHashes = new Set();
  for (const file of files.filter((file) => file.path.endsWith(".html"))) {
    const dom = new JSDOM(
      readFileSync(join(output, "static", file.path), "utf8"),
    );
    for (const script of dom.window.document.querySelectorAll(
      "script:not([src])",
    )) {
      if (script.type && !["text/javascript", "module"].includes(script.type))
        continue;
      scriptHashes.add(
        `'sha256-${createHash("sha256").update(script.textContent).digest("base64")}'`,
      );
    }
    dom.window.close();
  }
  const csp = [
    "default-src 'self'",
    `script-src 'self' ${[...scriptHashes].sort().join(" ")}`,
    // React sets the compiler's allowlisted inline CSS properties at runtime.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
    "form-action 'none'",
  ].join("; ");
  assert(
    Buffer.byteLength(csp) < 7500,
    "Review CSP header size before deployment",
  );
  const headers = {
    "Content-Security-Policy": csp,
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  };
  const config = {
    version: 3,
    routes: [
      { src: "/(.*)", headers, continue: true },
      {
        src: "/_next/static/(.*)",
        headers: { "Cache-Control": "public, max-age=31536000, immutable" },
        continue: true,
      },
      { src: "/(studio|docs)", status: 308, headers: { Location: "/$1/" } },
      { src: "/", dest: "/index.html" },
      { src: "/(studio|docs)/", dest: "/$1/index.html" },
      { handle: "filesystem" },
      { src: "/(.*)", dest: "/404.html", status: 404 },
    ],
  };

  writeFileSync(
    join(output, "config.json"),
    JSON.stringify(config, null, 2) + "\n",
  );
  return {
    createdAt: new Date().toISOString(),
    framework: "Next static export",
    files,
    directories,
    configSha256: hash(join(output, "config.json")),
    cspBytes: Buffer.byteLength(csp),
    scriptHashes: scriptHashes.size,
    deployment: "not deployed",
    source,
  };
}

/** Prepare locally. No deployment, authorization or provider mutation occurs here. */
export function prepareStudioArtifact(projectRoot = root) {
  const source = resolve(projectRoot, "apps/studio/out");
  const vercel = resolve(projectRoot, ".vercel");
  directory(vercel);
  const lock = join(vercel, "console-fx-preparation.lock");
  // An interrupted preparation leaves its journal and backups for explicit recovery.
  mkdirSync(lock);
  const output = join(vercel, "output");
  const marker = join(vercel, "console-fx-output-owned.json");
  const artifactRoot = resolve(projectRoot, ".artifacts");
  const deployment = join(artifactRoot, "deployment");
  const candidate = join(deployment, "candidate.json");
  let transaction;
  let complete = false;
  let preserveRecovery = false;
  const entries = [];
  try {
    directory(artifactRoot);
    directory(deployment);
    const previous = previousState(output, marker, candidate);
    transaction = mkdtempSync(join(vercel, ".console-fx-preparation-"));
    writeFileSync(
      join(lock, "recovery.json"),
      JSON.stringify({ transaction, output, marker, candidate }, null, 2),
    );
    const stagedOutput = join(transaction, "output");
    const receipt = stageOutput(source, stagedOutput);
    const text = JSON.stringify(receipt, null, 2) + "\n";
    for (const key of ["marker", "candidate"])
      writeFileSync(join(transaction, key), text);
    verifyOutput(stagedOutput, receipt);
    // Recheck all previous bytes after the potentially slow copy and CSP pass.
    assert.deepEqual(
      previousState(output, marker, candidate),
      previous,
      "The previous candidate changed while preparing",
    );
    for (const [key, target, staged] of [
      ["output", output, stagedOutput],
      ["marker", marker, join(transaction, "marker")],
      ["candidate", candidate, join(transaction, "candidate")],
    ]) {
      const entry = {
        key,
        target,
        staged,
        backup: join(transaction, `previous-${key}`),
        backedUp: false,
        installed: false,
        receipt,
        text,
      };
      entries.push(entry);
      if (exists(target)) {
        renameSync(target, entry.backup);
        entry.backedUp = true;
        if (key === "output") verifyOutput(entry.backup, previous.receipt);
        else
          assert.equal(
            readFileSync(entry.backup, "utf8"),
            previous[key],
            "A receipt changed during replacement",
          );
      }
      assert(
        !exists(target),
        "A concurrent candidate appeared during replacement",
      );
      renameSync(staged, target);
      entry.installed = true;
    }
    writeFileSync(
      join(transaction, "recovery.json"),
      JSON.stringify(
        {
          output,
          marker,
          candidate,
          previous: entries
            .filter((entry) => entry.backedUp)
            .map(({ target, backup }) => ({ target, backup })),
        },
        null,
        2,
      ) + "\n",
    );
    complete = true;
    return {
      receipt,
      recoveryDirectory: entries.some((entry) => entry.backedUp)
        ? transaction
        : null,
    };
  } catch (error) {
    try {
      for (const entry of [...entries].reverse()) {
        if (entry.installed) {
          if (entry.key === "output") verifyOutput(entry.target, entry.receipt);
          else
            assert.equal(
              readFileSync(entry.target, "utf8"),
              entry.text,
              "A newly prepared receipt changed concurrently",
            );
          renameSync(entry.target, entry.staged);
        }
        if (entry.backedUp) {
          assert(
            !exists(entry.target),
            "A concurrent artifact blocks recovery",
          );
          renameSync(entry.backup, entry.target);
        }
      }
    } catch (recoveryError) {
      preserveRecovery = true;
      throw new Error(
        `Preparation and automatic recovery failed. Preserve ${lock} and ${transaction} for recovery.`,
        { cause: new AggregateError([error, recoveryError]) },
      );
    }
    throw error;
  } finally {
    if (!preserveRecovery) {
      rmSync(lock, { recursive: true });
      if (
        transaction &&
        (!complete || !entries.some((entry) => entry.backedUp))
      )
        rmSync(transaction, { recursive: true });
    }
  }
}
