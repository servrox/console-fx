// Run from the repository root. Exercise only the runner's actual cleanup block;
// no Windows browser, DevTools setting or user tab is touched.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createHash } from "node:crypto";
import { parse } from "acorn";

const source = await readFile("scripts/qualify-featured-useful.mjs", "utf8");
const program = parse(source, { ecmaVersion: "latest", sourceType: "module" });
const finalizer = program.body.find(
  (node) => node.type === "TryStatement",
)?.finalizer;
assert(finalizer, "The runner must retain an owned-resource cleanup block");
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const finish = new AsyncFunction(
  "native",
  "originalTheme",
  "settingsTheme",
  "cdp",
  "nativeTarget",
  "context",
  "observer",
  "browser",
  "server",
  "failures",
  "report",
  "save",
  source.slice(finalizer.start + 1, finalizer.end - 1) +
    source.slice(finalizer.end),
);
const scenarios = [
  { failed: [] },
  ...["theme", "target", "context", "observer", "browser", "server"].map(
    (step) => ({ failed: [step] }),
  ),
  { failed: [], primary: true },
  { failed: ["context", "observer", "browser"], primary: true },
  { failed: ["context", "save"], primary: true },
];
const results = [];
for (const scenario of scenarios) {
  const server = createServer();
  await new Promise((done, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", done);
  });
  const seen = [];
  const primary = new Error("capture failure");
  const failures = scenario.primary ? [primary] : [];
  const report = { status: "captured; appearance review pending" };
  const step = async (name) => {
    seen.push(name);
    if (scenario.failed.includes(name)) throw new Error(name + " failure");
  };
  let thrown;
  let closedByRunner;
  try {
    await finish(
      {},
      "original",
      () => step("theme"),
      { send: () => step("target") },
      "owned-target",
      { close: () => step("context") },
      { close: () => step("observer") },
      { close: () => step("browser") },
      {
        close: (callback) => {
          seen.push("server");
          server.close((error) =>
            callback(
              error ??
                (scenario.failed.includes("server")
                  ? new Error("server failure")
                  : undefined),
            ),
          );
        },
      },
      failures,
      report,
      () => step("save"),
    );
  } catch (error) {
    thrown = error;
  } finally {
    closedByRunner = !server.listening;
    // A failing assertion must not leak even if a future runner regresses.
    if (server.listening) await new Promise((done) => server.close(done));
  }
  assert.equal(closedByRunner, true, "The runner must close its HTTP listener");
  assert.deepEqual(
    seen.filter((name) => name !== "save"),
    ["theme", "target", "context", "observer", "browser", "server"],
  );
  if (scenario.primary || scenario.failed.length) {
    assert(thrown instanceof AggregateError);
    if (scenario.primary) assert.equal(thrown.errors[0], primary);
    assert.equal(
      thrown.errors.length,
      scenario.failed.length + Number(!!scenario.primary),
    );
    assert.equal(report.status, "failed");
  } else {
    assert.equal(thrown, undefined);
    assert.equal(report.status, "captured; appearance review pending");
  }
  results.push({
    ...scenario,
    status: "verified",
    attemptedAllOwnedResources: true,
  });
}
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const receipt = {
  stage: "source/static",
  status: "verified",
  observedAt: new Date().toISOString(),
  obligation:
    "A failed native-capture cleanup step must not skip remaining resources or lose the primary failure",
  runnerSha256: sha(source),
  probeSha256: sha(await readFile(new URL(import.meta.url))),
  command:
    "node docs/evidence/website/2026-09-13-useful/native/cleanup-check.mjs",
  node: process.version,
  cases: results,
  limits: [
    "Failure injection into the actual cleanup block with fake browser resources and a real loopback HTTP server; not a new browser observation",
    "The archive preserves the earlier executed harness and native capture hashes",
  ],
};
await writeFile(
  "docs/evidence/website/2026-09-13-useful/native/runner-checks.json",
  JSON.stringify(receipt, null, 2) + "\n",
);
console.log(results.length + " cleanup scenarios passed");
