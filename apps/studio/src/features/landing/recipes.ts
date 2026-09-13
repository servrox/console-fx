// These complete source strings are also compiled and executed by the example checks.
export const packageExample = `import { badge } from "@servrox/console-fx/presets";
import { compileConsole } from "@servrox/console-fx/browser";

const scene = badge({ text: "Preview build" });
const output = compileConsole(scene, {
  target: "chromium", renderer: "css", motion: "reduce",
});
console.log(...output.args);`;

export const sdkExample = `import { defineScene } from "@servrox/console-fx";
import { emitConsole } from "@servrox/console-fx/browser";

export function welcomeToSdk(showWelcome: boolean) {
  if (!showWelcome) return;
  const scene = defineScene({
    schemaVersion: 1,
    label: "SDK welcome",
    lines: [
      { runs: [{ text: "Atlas SDK" }] },
      { runs: [{ text: "Sandbox mode", effects: [{ kind: "badge" }] }] },
      { runs: [{ text: "See the SDK guide" }] },
    ],
  });
  emitConsole(scene, {
    target: "chromium", renderer: "svg", motion: "reduce", unsupported: "fallback",
    layout: { algorithm: "fit/v1", width: 600, maxHeight: 400,
      variant: "standard", overflow: "wrap-then-shrink", minFontSize: 12 },
  });
}`;

export const contextExample = `import { defineScene } from "@servrox/console-fx";
import { emitConsole } from "@servrox/console-fx/browser";

type Build = { project: string; environment: string; revision: string };
export function showBuild(development: boolean, build: Build) {
  if (!development) return;
  const scene = defineScene({
    schemaVersion: 1,
    label: "Development context",
    lines: [
      { runs: [{ text: build.project }] },
      { runs: [{ text: build.environment, effects: [{ kind: "badge" }] }] },
      { runs: [{ text: "Revision " + build.revision }] },
    ],
  });
  emitConsole(scene, {
    target: "chromium", renderer: "svg", motion: "reduce", unsupported: "fallback",
    layout: { algorithm: "fit/v1", width: 600, maxHeight: 400,
      variant: "standard", overflow: "wrap-then-shrink", minFontSize: 12 },
  });
}`;

export const summaryExample = `import { defineScene } from "@servrox/console-fx";
import { emitConsole } from "@servrox/console-fx/browser";

// The caller supplies only facts approved for the console.
export function showSummary(approved: boolean, facts: readonly string[]) {
  if (!approved) return;
  const scene = defineScene({
    schemaVersion: 1,
    label: "Supplied summary",
    lines: facts.map((text) => ({ runs: [{ text }] })),
  });
  emitConsole(scene, {
    target: "chromium", renderer: "svg", motion: "reduce", unsupported: "fallback",
    layout: { algorithm: "fit/v1", width: 600, maxHeight: 400,
      variant: "standard", overflow: "wrap-then-shrink", minFontSize: 12 },
  });
}`;

export const reactExample = `import { neon } from "@servrox/console-fx/presets";
import { useConsoleScene } from "@servrox/console-fx-react";

const scene = neon({ text: "Hello, developer." });
export function PrintMessage() {
  const { log } = useConsoleScene(scene, {
    target: "chromium", renderer: "css", motion: "reduce",
  });
  return <button onClick={log}>Print message</button>;
}`;

export const nextExample = `"use client";
import { badge } from "@servrox/console-fx/presets";
import { ConsoleBanner } from "@servrox/console-fx-react";

const scene = badge({ text: "Preview build" });
export default function BuildBanner({ enabled = false }: { enabled?: boolean }) {
  return <ConsoleBanner scene={scene} enabled={enabled} options={{
    target: "chromium", renderer: "css", motion: "reduce",
  }} />;
}`;

export const startupExample = `// instrumentation-client.ts (or src/instrumentation-client.ts)
import { badge } from "@servrox/console-fx/presets";
import { emitConsole } from "@servrox/console-fx/browser";

// Next supplies this build-time value; ConsoleFX never reads it.
if (process.env.NODE_ENV === "development") {
  emitConsole(badge({ text: "Development build" }), {
    target: "chromium", renderer: "css", motion: "reduce",
  });
}`;
