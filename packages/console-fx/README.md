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

## Cinematic Metal

```js
import {
  lightningMetal,
  iceCathedral,
  liquidChrome,
  moltenGold,
  preset,
} from "@servrox/console-fx/presets";

const title = lightningMetal({
  text: "BUILD 2026",
  color: "#69dcff",
  depth: 7,
  glow: 0.25,
  ornaments: true,
});
const compiled = compileConsole(title, { target: "chromium", renderer: "svg" });
const sameTitle = preset("lightningMetal", { text: "BUILD 2026" });
```

The four static factories belong to `PRESETS` group **Cinematic Metal**. They use
one `cinematicMetal` effect with a closed, versioned `profile`, an accent color,
depth 0–10 (floored for layer count), glow 0–1 and optional ornaments. They reject
motion effects, including under reduced-motion compilation. Other presets retain
their defaults. Every result is ordinary normalized V1 data, ready for JSON,
`ConsolePreview`, `ConsoleBanner` and the existing React hook/Next recipes.

Titles support one line of at most 24 code points. Lightning Metal and Molten Gold
use original ConsoleFX angular paths for A–Z, 0–9, spaces and hyphens. ASCII
lowercase displays as capitals with `cinematic-uppercase-display`; the saved title
and readable caption keep their original case. Ice Cathedral and Liquid Chrome use
a local serif stack: `platform-font-variation` identifies platform-dependent glyph
coverage, shaping and width. No font files, film lettering or external assets are
embedded. These original treatments have no film/studio endorsement or affiliation.

Unsupported angular glyphs report `unsupported-cinematic-glyph`; multiline/long
titles report `unsupported-cinematic-title`. The scene remains valid for JSON and
plain text. Unknown profiles/keys fail validation. CSS fails explicitly; the library
never silently chooses SVG. `unsupported: "fallback"` preserves the whole scene as
static readable text. `possible-clipping` asks you to reduce font size or enlarge
the surface; text is never silently truncated. Defaults use 840 × 270; use a smaller
font size (for example 46) when explicitly changing the scene to 480 pixels wide.

The profile owns letter shapes and its material palette. Angular font/weight and
serif font-family settings are retained in saved data but do not reshape the
profile. The studio explains and disables those controls; size/spacing and bounded
material controls remain editable. Older ConsoleFX versions reject cinematic
scenes as unknown effects: retain JSON/drafts for a compatible version after rollback.
The new collection has a separate qualification ledger; old browser evidence does
not establish support for these profiles.

Literal percent specifiers are encoded internally for Chromium's rescan behavior.
Keep the original text in the scene; never pre-encode it yourself. ESC, unsafe
controls, unpaired surrogates and excessive input fail validation before rendering.
Imports create no logs, timers, requests or page changes. The core has no runtime
dependencies and does not include React, Next.js, or studio assets.

MIT © 2026 ConsoleFX contributors.
