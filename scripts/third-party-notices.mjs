import { createRequire } from "node:module";
import {
  readFileSync,
  readdirSync,
  mkdirSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { root } from "./package-candidate.mjs";

const require = createRequire(import.meta.url);
const notices = new Map();
function add(path, label) {
  const text = readFileSync(path, "utf8").trim();
  const names = notices.get(text) ?? [];
  names.push(label);
  notices.set(text, names);
}
add(resolve(root, "LICENSE"), "ConsoleFX");
for (const name of ["next", "react", "react-dom"]) {
  const directory = dirname(require.resolve(`${name}/package.json`));
  const manifest = JSON.parse(
    readFileSync(join(directory, "package.json"), "utf8"),
  );
  const file = ["LICENSE", "LICENSE.md", "license.md"].find((file) =>
    existsSync(join(directory, file)),
  );
  if (!file) throw new Error(`Missing ${name} license`);
  add(join(directory, file), `${name}@${manifest.version}`);
  if (name === "next") {
    function visit(path) {
      for (const entry of readdirSync(path, { withFileTypes: true }).sort(
        (a, b) => a.name.localeCompare(b.name),
      )) {
        const file = join(path, entry.name);
        if (entry.isDirectory()) visit(file);
        else if (/^(LICENSE|NOTICE)(\.(txt|md))?$/i.test(entry.name))
          add(file, `Next.js vendored ${file.slice(directory.length + 1)}`);
      }
    }
    visit(join(directory, "dist/compiled"));
    const nextRequire = createRequire(join(directory, "package.json"));
    for (const dependency of ["styled-jsx", "@swc/helpers"]) {
      const dependencyRoot = dirname(
        nextRequire.resolve(`${dependency}/package.json`),
      );
      const file = ["LICENSE", "LICENSE.md", "license.md"].find((file) =>
        existsSync(join(dependencyRoot, file)),
      );
      if (!file) throw new Error(`Missing ${dependency} license`);
      add(join(dependencyRoot, file), dependency);
    }
  }
}
const output =
  "ConsoleFX and third-party notices\n\nReact and Next.js license texts, including Next.js vendored components. Some listed components are used only by build tooling.\n\n" +
  [...notices]
    .map(([text, names]) => `${names.join("\n")}\n\n${text}`)
    .join(
      "\n\n------------------------------------------------------------\n\n",
    ) +
  "\n";
mkdirSync(resolve(root, "apps/studio/public"), { recursive: true });
writeFileSync(resolve(root, "apps/studio/public/licenses.txt"), output);
console.log(
  `Prepared ${notices.size} distinct license/notice texts for the static studio.`,
);
