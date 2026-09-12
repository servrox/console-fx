// Quantitative companion to unchanged native screenshots and observation JSON.
// A one-level 8-bit channel difference is treated as rasterization noise, not
// continued animation. Visual inspection remains a separate required review.
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const require = createRequire(import.meta.url);
const { PNG } = require(
  require
    .resolve("playwright-core/package.json", {
      paths: [require.resolve("@playwright/test")],
    })
    .replace("package.json", "lib/utilsBundle.js"),
);
function compare(first, second) {
  const a = PNG.sync.read(readFileSync(first));
  const b = PNG.sync.read(readFileSync(second));
  if (a.width !== b.width || a.height !== b.height)
    throw new Error("Frame dimensions differ");
  let changedPixels = 0,
    maxChannelDelta = 0,
    totalChannelDelta = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    let changed = false;
    for (let channel = 0; channel < 4; channel++) {
      const delta = Math.abs(a.data[i + channel] - b.data[i + channel]);
      changed ||= delta !== 0;
      maxChannelDelta = Math.max(maxChannelDelta, delta);
      totalChannelDelta += delta;
    }
    if (changed) changedPixels++;
  }
  return {
    changedPixels,
    maxChannelDelta,
    meanChannelDelta: totalChannelDelta / a.data.length,
  };
}
for (const argument of process.argv.slice(2)) {
  const source = resolve(argument);
  const observations = JSON.parse(readFileSync(source, "utf8"));
  const cases = observations.cases
    .filter((row) => row.frames.length === 4)
    .map((row) => {
      const start = compare(row.frames[0].path, row.frames[1].path);
      const finish = compare(row.frames[2].path, row.frames[3].path);
      return {
        id: row.id,
        start,
        finish,
        changed: start.maxChannelDelta > 1,
        settled: finish.maxChannelDelta <= 1,
        exactFinishMatch: finish.changedPixels === 0,
      };
    });
  const review = {
    observedAt: new Date().toISOString(),
    source,
    criterion:
      "Native image frames: motion exceeds one 8-bit channel level; finished frames differ by at most one level. Raw hashes and images are retained. Visual review remains required.",
    cases,
  };
  writeFileSync(
    resolve(dirname(source), "frame-review.json"),
    JSON.stringify(review, null, 2) + "\n",
  );
  console.log(
    JSON.stringify({
      source,
      cases: cases.length,
      notChanged: cases.filter((row) => !row.changed).map((row) => row.id),
      notSettled: cases.filter((row) => !row.settled).map((row) => row.id),
      rasterNoiseOnly: cases
        .filter((row) => row.settled && !row.exactFinishMatch)
        .map((row) => row.id),
    }),
  );
}
