# ConsoleFX

Compose one expressive console entry. Compilation is silent; emission is explicit.
ESM JavaScript and TypeScript declarations are included. The release candidate is
tested on Node 24; rich output targets the recorded Windows Chromium profiles.
See the repository's [compatibility evidence](https://github.com/servrox/console-fx/blob/main/docs/compatibility.md)
before relying on a particular DevTools treatment. Publication is pending.

```js
import { neon } from "@servrox/console-fx/presets";
import { compileConsole, emitConsole } from "@servrox/console-fx/browser";
import { exportConsoleLog } from "@servrox/console-fx/codegen";

const scene = neon({ text: "100% your message" });
const options = { target: "chromium", renderer: "css" };
const output = compileConsole(scene, options); // no logging
emitConsole(scene, options); // exactly one console.log
const standalone = exportConsoleLog(scene, options); // complete JavaScript
```

With omitted options, compilation and emission use static plain text. Select
`target: "chromium"` and `renderer: "css" | "svg"` explicitly for rich output.
Unsupported requests throw `ConsoleCompileError` with structured diagnostics;
`unsupported: "fallback"` explicitly selects readable static text. Invalid data
always fails validation. There is no automatic renderer promotion.

`defineScene` validates and normalizes developer data; `parseScene(unknown)`
returns `{ ok: true, value, diagnostics }` or `{ ok: false, diagnostics }`.
`getEffectDescriptors()` exposes deeply read-only built-in controls, defaults,
and renderer metadata. No registration or raw CSS/SVG input is supported.

The compiler returns `args`, `text`, resolved `renderer`, `animated`, diagnostics,
and structured `preview`. CSS preview includes literal text and allowlisted style
maps. SVG preview contains the exact generated image URI, dimensions, and readable
caption. CSS page layout is approximate; page images do not prove DevTools behavior.
Payload `byteLength` counts UTF-8 argument bytes; exporter `byteLength` counts the
complete source, including both motion branches when present.

The gallery contains badge, neon, RGB split, extrusion, holographic, gold, chrome,
CRT and rainbow presets. Motion treatments are glow pulse, gradient drift, gentle
wave and a decorative moving indicator. A rich text run supports one style effect
and one optional motion; unsupported multi-style documents remain valid JSON/text
and report `unsupported-combination` for rich compilation. Motion is static by default, lasts at
most five seconds, and cannot update an already printed entry. Browser emission
and standalone export accept `motion: "system"` and choose animation only on a
positive no-preference result. The pure compiler accepts already-resolved
`motion: "allow" | "reduce"`. Repeated identical SVG images may retain their
finished frame. Full release qualification remains pending for this candidate.

Literal percent specifiers are encoded internally for Chromium's rescan behavior.
Keep the original text in the scene; never pre-encode it yourself. ESC, unsafe
controls, unpaired surrogates and excessive input fail validation before rendering.
Imports create no logs, timers, requests or page changes. The core has no runtime
dependencies and does not include React, Next.js, or studio assets.

MIT © 2026 ConsoleFX contributors.
