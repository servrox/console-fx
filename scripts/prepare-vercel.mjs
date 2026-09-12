import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, relative, resolve } from "node:path";
import { JSDOM } from "jsdom";
import { hash, root } from "./package-candidate.mjs";

const source = resolve(root, "apps/studio/out");
assert(
  existsSync(join(source, "index.html")),
  "Build the production studio first",
);
const output = resolve(root, ".vercel/output");
const marker = resolve(root, ".vercel/console-fx-output-owned.json");
assert(
  !existsSync(output) || existsSync(marker),
  "An existing unowned Vercel output must be preserved",
);
const files = [];
function visit(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort(
    (a, b) => a.name.localeCompare(b.name),
  )) {
    assert(!entry.isSymbolicLink(), "Static output must not contain symlinks");
    const path = join(directory, entry.name);
    if (entry.isDirectory()) visit(path);
    else files.push({ path: relative(source, path), sha256: hash(path) });
  }
}
visit(source);
const scriptHashes = new Set();
for (const file of files.filter((file) => file.path.endsWith(".html"))) {
  const dom = new JSDOM(readFileSync(join(source, file.path), "utf8"));
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
if (existsSync(output)) rmSync(output, { recursive: true });
mkdirSync(output, { recursive: true });
cpSync(source, join(output, "static"), { recursive: true });
writeFileSync(
  join(output, "config.json"),
  JSON.stringify(config, null, 2) + "\n",
);
const receipt = {
  createdAt: new Date().toISOString(),
  framework: "Next static export",
  files,
  configSha256: hash(join(output, "config.json")),
  cspBytes: Buffer.byteLength(csp),
  scriptHashes: scriptHashes.size,
  deployment: "not deployed",
  source,
};
writeFileSync(marker, JSON.stringify(receipt, null, 2) + "\n");
mkdirSync(resolve(root, ".artifacts/deployment"), { recursive: true });
writeFileSync(
  resolve(root, ".artifacts/deployment/candidate.json"),
  JSON.stringify(receipt, null, 2) + "\n",
);
console.log(
  `Prepared ${files.length} static files for Vercel; ${scriptHashes.size} hashed inline scripts, ${receipt.cspBytes} CSP bytes. No deployment performed.`,
);
