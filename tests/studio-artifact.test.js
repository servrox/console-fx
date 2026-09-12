import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { prepareStudioArtifact } from "../scripts/studio-artifact.mjs";

const hash = (value) => createHash("sha256").update(value).digest("hex");
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "console-fx-artifact-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const source = join(root, "apps/studio/out");
  mkdirSync(join(source, "studio"), { recursive: true });
  writeFileSync(
    join(source, "index.html"),
    '<h1>Original</h1><script>window.ready=true;</script><script type="application/json">{"data":true}</script>',
  );
  writeFileSync(join(source, "studio/index.html"), "<h1>Studio</h1>");
  writeFileSync(join(source, "404.html"), "<h1>Not found</h1>");
  return {
    root,
    source,
    output: join(root, ".vercel/output"),
    marker: join(root, ".vercel/console-fx-output-owned.json"),
    candidate: join(root, ".artifacts/deployment/candidate.json"),
    prepare: () => prepareStudioArtifact(root),
  };
}
function saved(f) {
  return [
    f.marker,
    f.candidate,
    join(f.output, "config.json"),
    join(f.output, "static/index.html"),
  ].map((path) => readFileSync(path, "utf8"));
}

test("preparation produces the exact static files, security headers and routes without deployment", (t) => {
  const f = fixture(t);
  const { receipt, recoveryDirectory } = f.prepare();
  assert.equal(recoveryDirectory, null);
  assert.equal(receipt.deployment, "not deployed");
  assert.equal(receipt.scriptHashes, 1);
  assert.equal(
    receipt.configSha256,
    hash(readFileSync(join(f.output, "config.json"))),
  );
  for (const file of receipt.files)
    assert.equal(
      file.sha256,
      hash(readFileSync(join(f.output, "static", file.path))),
    );
  const config = JSON.parse(
    readFileSync(join(f.output, "config.json"), "utf8"),
  );
  const csp = config.routes[0].headers["Content-Security-Policy"];
  assert(
    csp.includes(
      `'sha256-${createHash("sha256").update("window.ready=true;").digest("base64")}'`,
    ),
  );
  assert(!csp.includes("unsafe-eval"));
  assert.deepEqual(config.routes.slice(2), [
    { src: "/(studio|docs)", status: 308, headers: { Location: "/$1/" } },
    { src: "/", dest: "/index.html" },
    { src: "/(studio|docs)/", dest: "/$1/index.html" },
    { handle: "filesystem" },
    { src: "/(.*)", dest: "/404.html", status: 404 },
  ]);
  assert.equal(
    readFileSync(f.marker, "utf8"),
    readFileSync(f.candidate, "utf8"),
  );
});

test("replacement retains the complete previous candidate and both receipts for recovery", (t) => {
  const f = fixture(t);
  f.prepare();
  const before = saved(f);
  writeFileSync(join(f.source, "index.html"), "<h1>Replacement</h1>");
  const { recoveryDirectory } = f.prepare();
  assert.equal(
    readFileSync(join(f.output, "static/index.html"), "utf8"),
    "<h1>Replacement</h1>",
  );
  assert.deepEqual(
    [
      readFileSync(join(recoveryDirectory, "previous-marker"), "utf8"),
      readFileSync(join(recoveryDirectory, "previous-candidate"), "utf8"),
      readFileSync(
        join(recoveryDirectory, "previous-output/config.json"),
        "utf8",
      ),
      readFileSync(
        join(recoveryDirectory, "previous-output/static/index.html"),
        "utf8",
      ),
    ],
    before,
  );
});

test("an unowned output and its files are never replaced", (t) => {
  const f = fixture(t);
  mkdirSync(f.output, { recursive: true });
  writeFileSync(join(f.output, "valuable"), "keep this");
  assert.throws(f.prepare, /unowned/);
  assert.equal(readFileSync(join(f.output, "valuable"), "utf8"), "keep this");
});

for (const change of [
  "content",
  "config",
  "additional file",
  "empty directory",
  "candidate receipt",
  "symlink",
]) {
  test(`changed ${change} is preserved instead of trusting an ownership marker`, (t) => {
    const f = fixture(t);
    f.prepare();
    const target = join(f.output, "static/index.html");
    if (change === "content") writeFileSync(target, "concurrent edit");
    if (change === "config")
      writeFileSync(join(f.output, "config.json"), "concurrent config");
    if (change === "additional file")
      writeFileSync(join(f.output, "extra"), "concurrent file");
    if (change === "empty directory")
      mkdirSync(join(f.output, "new-directory"));
    if (change === "candidate receipt")
      writeFileSync(f.candidate, "concurrent receipt");
    if (change === "symlink") symlinkSync(f.source, join(f.output, "linked"));
    const before = saved(f);
    assert.throws(f.prepare, /changed|symlink/);
    assert.deepEqual(saved(f), before);
    if (change === "additional file")
      assert.equal(
        readFileSync(join(f.output, "extra"), "utf8"),
        "concurrent file",
      );
    if (change === "empty directory")
      assert(existsSync(join(f.output, "new-directory")));
    if (change === "symlink") assert(existsSync(join(f.output, "linked")));
  });
}

test("a staging failure preserves the previous candidate and permits a later retry", (t) => {
  const f = fixture(t);
  f.prepare();
  const before = saved(f);
  writeFileSync(
    join(f.source, "index.html"),
    Array.from(
      { length: 180 },
      (_, index) => `<script>window.value=${index};</script>`,
    ).join(""),
  );
  assert.throws(f.prepare, /CSP header/);
  assert.deepEqual(saved(f), before);
  writeFileSync(join(f.source, "index.html"), "<h1>Recovered</h1>");
  assert.doesNotThrow(f.prepare);
});

test("receipt replacement failure rolls back output and ownership bytes already replaced", (t) => {
  const f = fixture(t);
  f.prepare();
  const before = saved(f);
  writeFileSync(join(f.source, "index.html"), "<h1>Must roll back</h1>");
  const directory = join(f.root, ".artifacts/deployment");
  chmodSync(directory, 0o500);
  try {
    assert.throws(f.prepare, /EACCES/);
    assert.deepEqual(saved(f), before);
  } finally {
    chmodSync(directory, 0o700);
  }
  assert.doesNotThrow(f.prepare);
});

test("a concurrent or interrupted preparation lock is preserved", (t) => {
  const f = fixture(t);
  const lock = join(f.root, ".vercel/console-fx-preparation.lock");
  mkdirSync(lock, { recursive: true });
  writeFileSync(join(lock, "recovery.json"), "existing recovery");
  assert.throws(f.prepare, /EEXIST/);
  assert.equal(
    readFileSync(join(lock, "recovery.json"), "utf8"),
    "existing recovery",
  );
});

test("legacy file-only receipts are verified and retained while new receipts cover directories", (t) => {
  const f = fixture(t);
  const old = f.prepare().receipt;
  delete old.directories;
  const text = JSON.stringify(old, null, 2) + "\n";
  writeFileSync(f.marker, text);
  writeFileSync(f.candidate, text);
  const prepared = f.prepare();
  assert.deepEqual(prepared.receipt.directories, ["studio"]);
  assert.equal(
    readFileSync(join(prepared.recoveryDirectory, "previous-marker"), "utf8"),
    text,
  );
});
