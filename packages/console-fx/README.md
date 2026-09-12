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

For a small CSS-only bundle, use the explicit CSS compiler through the same
public browser entrypoint:

```js
import { defineScene } from "@servrox/console-fx";
import { compileCssConsole } from "@servrox/console-fx/browser";

const scene = defineScene({
  schemaVersion: 1,
  label: "Ready",
  lines: [{ runs: [{ text: "Ready", effects: [{ kind: "neon" }] }] }],
});
const output = compileCssConsole(scene, { target: "chromium" });
console.log(...output.args); // explicit, single emission
```

This shares validation, CSS rendering, literal-percent handling and fallback
with `compileConsole`. It fixes the renderer to CSS and allows bundlers to omit
SVG artwork. SVG effects/cards still require `compileConsole` or explicit text
fallback. The 10 KiB gzip simple-CSS budget is checked using this public helper;
the complete compiler retains SVG support and its 25 KiB budget even when its
runtime renderer selection is CSS. Both installed consumer paths are measured.

### Useful and artful cards

The five Useful factories require supplied facts: `buildReceipt`,
`requestTrace`, `serviceReady`, `commandCard`, and `releaseBulletin`. They do not
inspect the environment, make requests, infer a status, calculate metrics, or
execute commands. `blueprint`, `contourMap`, `letterpress`, `signalHalftone`, and
`orbital` have explicit artwork defaults. All ten are static SVG presentations.

```js
import { buildReceipt } from "@servrox/console-fx/presets";
import { compileConsole } from "@servrox/console-fx/browser";

const receipt = buildReceipt({
  project: "atlas-web",
  outcome: "PASSED",
  revision: "a1b2c3d",
  duration: "2.34 s",
  checks: "48 / 48",
  environment: "preview",
}); // synthetic example values supplied by the caller
const output = compileConsole(receipt, {
  renderer: "svg",
  target: "chromium",
  motion: "reduce",
});
console.log(...output.args);
```

Request Trace requires exactly three stages and a separate explicit `tone`;
Release Bulletin requires two highlights. Signal Halftone uses an explicit
two-line title. `preset(id, options)` preserves per-ID required fields;
`createPresetExample(id)` deliberately supplies synthetic catalog examples.

`getPresentationDescriptors()` on the root entrypoint exposes read-only slots,
typography, status palettes, parameter controls and renderer compatibility.
All words remain ordinary scene text. Presentation records contain only a
closed versioned profile and validated settings. Unknown versions fail; older
readers reject presentation data. Styles and structure outside a profile's
contract produce diagnostics. Explicit detachment retains every text run.

Cards scale uniformly inside the chosen surface. Rich overflow errors preserve
the full scene; `renderer: "text"` or `unsupported: "fallback"` provides the
complete caption. Font measurements are estimates and local fonts can vary.
Page comparisons and actual DevTools qualification are tracked separately in
the [card implementation receipt](https://github.com/servrox/console-fx/blob/main/docs/specs/useful-artful-presets-evidence.md).

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

## Explicit fitting and saved render recipes

Fitting is opt-in and currently has separate qualification work in progress.
Omitting `layout` and `sizing` preserves legacy output. Choose a content frame
independently from the requested display width:

```js
import { parseRenderRecipe } from "@servrox/console-fx";
import { lightningMetal } from "@servrox/console-fx/presets";
import { compileConsole } from "@servrox/console-fx/browser";

const parsed = parseRenderRecipe({
  kind: "consoleFxRenderRecipe",
  recipeVersion: 1,
  scene: lightningMetal({ text: "BUILD 2026" }),
  options: {
    target: "chromium",
    renderer: "svg",
    motion: "reduce",
    layout: {
      algorithm: "fit/v1",
      width: 360,
      maxHeight: 400,
      variant: "standard",
      overflow: "shrink",
      minFontSize: 12,
    },
    sizing: { mode: "fixed", width: 360 },
  },
});
if (parsed.ok) {
  const output = compileConsole(parsed.value.scene, parsed.value.options);
  // Inspect output.layout and output.outputSizing before explicit emission.
  console.log(...output.args);
}
```

`layout` reports the exact plan used by the SVG serializer: fragment/paint bounds,
font sizes, wrapping, scale, measurement quality and diagnostics. Legal wrapping
preserves all text and crosses styled runs without breaking identifiers. Readable
floors and finite effects are checked at a known fixed size. Impossible fitting
fails; only `unsupported: "fallback"` permits the complete native text instead.
CSS fitting is unsupported. Standard cards retain their approved layout; compact
variants require a separate review and are currently unavailable.

Local-font estimates produce `estimated-fit`, never an exact-font claim. Explicit
`prepareTextMeasurements` and `measureTextBatch` helpers on `./browser` provide
bounded optional measurements. Preflight may return a partial batch together with
a planning/resource diagnostic; this does not establish fit. Missing fragment
measurements remain estimated. The adapter requires an empty document/worker font
set and declines page-supplied fonts before shaping. It does not fetch fonts.
Compilation never invokes the adapter. Measured local fonts can differ from a
recipient's fonts; authored cinematic geometry carries separate confidence.

`{ mode: "container-experimental", maxWidth, fillFraction }` is an experimental
carrier, not console-width detection. It reports unknown display dimensions and
unknown image-text readability. It never listens, redraws, or prints again on
resize. Current fixed/text paths remain available; container support requires its
own actual Chrome/Edge matrix.

A render recipe contains one ordinary SceneV1 plus explicit render intent. Core
`parseRenderRecipe` owns validation; `parseScene` rejects envelopes. Unknown
versions fail. Recipe data excludes transient font snapshots and environment IDs.
Scene JSON remains content-only. The studio saves recipes to a separate local key
after an explicit settings edit, retains the earlier scene draft, and restores both
scene and settings through import, sharing and undo. Clear local draft removes
both owned keys while preserving in-memory work. See the [fitting receipt](https://github.com/servrox/console-fx/blob/main/docs/specs/responsive-fitting-implementation-evidence.md)
for current evidence and remaining gates.

Literal percent specifiers are encoded internally for Chromium's rescan behavior.
Keep the original text in the scene; never pre-encode it yourself. ESC, unsafe
controls, unpaired surrogates and excessive input fail validation before rendering.
Imports create no logs, timers, requests or page changes. The core has no runtime
dependencies and does not include React, Next.js, or studio assets.

MIT © 2026 ConsoleFX contributors.
