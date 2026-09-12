import { mkdir, writeFile, readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, join } from "node:path";
import { defineScene } from "../packages/console-fx/dist/index.js";
import { compileConsole } from "../packages/console-fx/dist/browser/index.js";
import { exportConsoleLog } from "../packages/console-fx/dist/codegen/index.js";
import {
  badge,
  neon,
  preset,
  PRESETS,
  rainbow,
} from "../packages/console-fx/dist/presets/index.js";

const root = resolve(".artifacts/devtools");
await mkdir(root, { recursive: true });
const sourceHash = createHash("sha256");
async function hashTree(directory) {
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort(
    (a, b) => a.name.localeCompare(b.name),
  )) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await hashTree(path);
    else if (entry.name.endsWith(".js"))
      sourceHash.update(path).update(await readFile(path));
  }
}
await hashTree("packages/console-fx/dist");
const cases = [
  ...PRESETS.filter(({ group }) => group === "Cinematic Metal").flatMap(
    ({ id, name }) => {
      const scene = preset(id);
      return [
        { id: `cinematic-${id}`, title: name, scene, renderer: "svg" },
        {
          id: `cinematic-${id}-480`,
          title: `${name} / 480 pixels`,
          renderer: "svg",
          scene: defineScene({
            ...scene,
            surface: { ...scene.surface, width: 480 },
            lines: scene.lines.map((line) => ({
              ...line,
              runs: line.runs.map((run) => ({
                ...run,
                style: { ...run.style, fontSize: 46 },
              })),
            })),
          }),
        },
      ];
    },
  ),
  {
    id: "phase0-badge",
    title: "Phase 0 · Badge",
    scene: badge({ text: "ConsoleFX ready" }),
    renderer: "css",
  },
  {
    id: "phase0-multistyle",
    title: "Phase 0 · Multistyle and literal percent",
    scene: defineScene({
      schemaVersion: 1,
      label: "Literal percent",
      lines: [
        {
          runs: [
            {
              text: "100% %c %s 👩🏽‍💻 ",
              style: { color: "#22d3ee", fontSize: 22 },
            },
            { text: "second run", style: { color: "#f3bd67", fontSize: 22 } },
          ],
        },
      ],
    }),
    renderer: "css",
  },
  {
    id: "phase0-svg",
    title: "Phase 0 · Static SVG",
    scene: neon({ text: "One expressive entry" }),
    renderer: "svg",
  },
  {
    id: "phase0-motion",
    title: "Phase 0 · Finite SVG wave",
    scene: neon({ text: "One gentle wave", motion: "wave" }),
    renderer: "svg",
    motion: "allow",
  },
  ...PRESETS.filter(({ group }) => group === "Classic").map(
    ({ id, name, renderer }) => ({
      id: `gallery-${id}`,
      title: name,
      scene: preset(id, { text: name }),
      renderer,
    }),
  ),
  ...["glowPulse", "gradientDrift", "wave", "indicator"].map((motion) => ({
    id: `motion-${motion}`,
    title: motion,
    scene: rainbow({ text: "ConsoleFX", motion }),
    renderer: "svg",
    motion: "allow",
  })),
  ...[
    ...PRESETS.filter(({ group }) => group === "Classic"),
    { id: "plain", name: "Plain lettering" },
  ].flatMap(({ id, name }) =>
    ["none", "glowPulse", "gradientDrift", "wave", "indicator"].map(
      (motion) => ({
        id: `combo-${id}-${motion}`,
        title: `${name} / ${motion}`,
        scene:
          id === "plain"
            ? defineScene({
                schemaVersion: 1,
                label: "ConsoleFX",
                surface: {
                  width: 600,
                  height: 180,
                  padding: 34,
                  background: "#0c1117",
                  borderRadius: 16,
                },
                lines: [
                  {
                    align: "center",
                    runs: [
                      {
                        text: "ConsoleFX",
                        style: {
                          color: "#e8f3f5",
                          fontSize: 42,
                          fontWeight: 700,
                        },
                        effects: motion === "none" ? [] : [{ kind: motion }],
                      },
                    ],
                  },
                ],
                motion: { durationMs: 4800, finish: "freeze" },
              })
            : preset(id, {
                text: id === "rainbow" ? "ConsoleFX color" : "ConsoleFX",
                motion,
              }),
        renderer: "svg",
        ...(motion === "none" ? {} : { motion: "allow" }),
      }),
    ),
  ),
];
const fixtures = cases.map((entry) => {
  const options = {
    target: "chromium",
    renderer: entry.renderer,
    motion: entry.motion ?? "reduce",
  };
  return {
    id: entry.id,
    title: entry.title,
    scene: entry.scene,
    options,
    output: compileConsole(entry.scene, options),
    staticOutput: compileConsole(entry.scene, { ...options, motion: "reduce" }),
    code: exportConsoleLog(entry.scene, {
      ...options,
      motion: entry.motion ? "system" : "reduce",
    }).code,
  };
});
const metadata = {
  createdAt: new Date().toISOString(),
  compilerSha256: sourceHash.digest("hex"),
  cases: fixtures.map(({ id }) => id),
};
await writeFile(
  join(root, "fixtures.json"),
  JSON.stringify({ metadata, fixtures }, null, 2),
);
await writeFile(
  join(root, "index.html"),
  `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ConsoleFX · DevTools qualification</title><style>body{margin:0;background:#10151b;color:#e5eef1;font:16px system-ui}main{max-width:900px;margin:40px auto;padding:24px}button,select{font:inherit;margin:8px;padding:10px;background:#26313a;color:#e5eef1;border:1px solid #637886;border-radius:6px}button:focus-visible{outline:3px solid #22d3ee}pre{white-space:pre-wrap;overflow-wrap:anywhere;color:#c5d6de}img{max-width:100%}</style><main><h1>ConsoleFX · DevTools qualification</h1><p>Open the actual browser DevTools Console. Each button emits one entry. This page does not load an image before emission.</p><label for="fixture">Fixture</label><select id="fixture"></select><button id="emit">Emit once</button><button id="static">Emit static alternative</button><button id="repeat">Emit identical arguments again</button><p id="status" role="status">No fixture emitted.</p><pre id="metadata"></pre><div id="preview"></div></main><script type="module" src="fixture.js"></script></html>`,
);
await writeFile(
  join(root, "fixture.js"),
  `const data = await (await fetch('./fixtures.json')).json();
const select = document.querySelector('#fixture');
for (const fixture of data.fixtures) { const option = document.createElement('option'); option.value = fixture.id; option.textContent = fixture.title; select.append(option); }
const selected = () => data.fixtures.find(f => f.id === select.value);
let emissions = 0;
let previous;
function preview() { const f = selected(); document.querySelector('#metadata').textContent = JSON.stringify({ ...data.metadata, selected: f.id, options: f.options, userAgent: navigator.userAgent, viewport: [innerWidth,innerHeight] }, null, 2); document.querySelector('#preview').textContent = 'No page image is loaded during native Console qualification.'; }
function emit(args, id) { console.log(...args); previous=args; emissions++; document.querySelector('#status').textContent = emissions + ' explicit emission(s). Last: ' + id; }
document.querySelector('#emit').onclick=()=>{const f=selected();emit(f.output.args,f.id);};
document.querySelector('#repeat').onclick=()=>{if(previous)emit(previous,'identical arguments');};
document.querySelector('#static').onclick=()=>{const f=selected();emit(f.staticOutput.args,f.id+' static');};
select.onchange=preview; preview();
window.consoleFxFixtures = data;
`,
);
console.log(
  JSON.stringify(
    { ...metadata, directory: root, fixtureCount: fixtures.length },
    null,
    2,
  ),
);
