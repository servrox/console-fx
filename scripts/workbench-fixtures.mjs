// App catalogue defaults become inputs to the existing native DevTools harness.
import { build } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const bundle = await build({
  stdin: {
    contents:
      'export { listCatalogue, resolveExample } from "./apps/studio/src/features/examples/catalogue.ts";',
    resolveDir: process.cwd(),
  },
  bundle: true,
  write: false,
  format: "esm",
  platform: "node",
});
const { listCatalogue, resolveExample } = await import(
  `data:text/javascript,${encodeURIComponent(bundle.outputFiles[0].text)}`
);
const cases = listCatalogue().examples.map((entry) => {
  const result = resolveExample({ exampleId: entry.id });
  if (!result.ok) throw Error(`${entry.id}: ${result.message}`);
  return {
    id: `workbench-${entry.id.replace(":", "-")}`,
    title: entry.name,
    scene: result.recipe.scene,
    renderer: result.recipe.options.renderer,
    options: result.recipe.options,
  };
});
const directory = resolve(".artifacts/workbench");
await mkdir(directory, { recursive: true });
await writeFile(
  resolve(directory, "native-cases.json"),
  JSON.stringify(cases, null, 2) + "\n",
);
console.log(
  `${cases.length} catalogue defaults prepared for native qualification.`,
);
