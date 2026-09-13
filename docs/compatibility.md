# ConsoleFX compatibility

Both approved 0.1.0 packages are published under `next`, and the
[studio is public](https://console-fx-servroxs-projects.vercel.app). The
[completion audit](specs/mvp-completion-audit.md) separates verified implementation
and release evidence from the remaining developer-study, physical-device and
Safari observations. These are observations for exact fixtures and recorded
browser builds, not a guarantee for every browser version or scene.

| Profile | Behavior |
| --- | --- |
| Plain text | Default; one literal argument, no decoration or motion |
| CSS text / explicit Chromium target | Badge, neon, RGB split and extrusion; approximate native layout |
| SVG image / explicit Chromium target | Fixed-size internally generated image and readable caption in one call |
| Other rich targets | Error unless the caller explicitly requests static text fallback |

The first release supports one static style effect and one optional decorative
motion per text run. Multi-style documents remain valid data and can be exported
as JSON or plain text; rich compilation reports `unsupported-combination`.
Descriptor metadata describes implemented renderer capabilities. It does not
replace this browser evidence.

## Cinematic Metal collection

`lightningMetal`, `iceCathedral`, `liquidChrome` and `moltenGold` are static SVG
profiles introduced after the dated baseline below. See their
[separate implementation and qualification ledger](specs/cinematic-metal-presets-evidence.md).
They reject decorative motion even when reduced. Angular profiles use original
A–Z/0–9/space/hyphen outlines and display ASCII lowercase as capitals; captions keep
the saved text. Serif profiles use local fonts and report platform variation.
The [2026-09-12 native qualification](evidence/devtools/2026-09-12-cinematic/README.md)
passed all four static profiles at 840 × 270 and adjusted 480 × 270 in actual
current-stable Windows Chrome/Edge builds, plus generated copy, before-open,
reopen and repeated-snippet checks. The maintainer approved all four appearances.
This evidence belongs to the exact cinematic candidate, separately from the
older matrix below.

Titles are single-line and at most 24 code points. Other glyph/title requests
require a compatible profile or explicit plain-text fallback.

## Useful and Artful cards

Build Receipt, Request Trace, Service Ready, Command Card, Release Bulletin,
Blueprint, Contour Map, Letterpress, Signal Halftone and Orbital are static,
closed SVG presentations. Their [standard-card qualification](evidence/cards/2026-09-12/README.md)
records all ten approved examples in actual Windows Chrome 153.0.8010.36 and
Edge 153.0.4234.32, light/dark themes and native zoom, plus generated copy,
before-open, reopen, repeated entries and narrow consoles.

The 720 × 240 image remains fixed: narrow or zoomed consoles can require scrolling.
The complete native caption remains available. Local fonts vary; rich overflow
reports an error or uses explicitly requested complete text fallback. This does
not qualify compact layouts, automatic fitting or experimental container sizing.
See the [card implementation receipt](specs/useful-artful-presets-evidence.md)
for separate package, CI and release status.

## Explicit fitting and compact cards

The [2026-09-12 fitting qualification](evidence/fitting/2026-09-12/README.md) adds
explicit `fit/v1`, the ten maintainer-approved 360 px compact layouts, optional
local-font measurement and saved render recipes. Omitted options preserve old
output. Compact designs center at their native width in wider frames; all ten
sample designs explicitly fail at 280 px rather than shrink below their 12 px floor.

Actual Windows Chrome 153.0.8010.36 and Edge 153.0.4234.32 observations include
fixed/container resize, native copy, light/dark and zoom, source anchors, groups,
timestamps, docking/drawer, repeated entries, reopening and verified offscreen
return. All four fitted motion families visibly changed and settled in the recorded
fixtures. The complete caption remains available. Fixed output can require scrolling.

`container-experimental` stays opt-in and experimental. Observed carriers preserve
the ratio and cap across the recorded contexts; actual image-text readability and
display dimensions are unknown to the compiler. It never reads DevTools geometry,
selects a compact variant at print time, or logs again when the console resizes.
Font/Unicode results are local observations, not universal recipient guarantees.

## Runtime consumption

The isolated packed JavaScript fixture passes under Node 24.20.0 and the existing
Nix-managed Bun 1.4.2 runtime. The [Bun receipt](evidence/packages/2026-09-11/bun-smoke.json)
records public entry imports, validation, immutable descriptors, compilation,
one explicit emission and code generation. Both runtimes reject a private package
subpath: Node reports `ERR_PACKAGE_PATH_NOT_EXPORTED`, while this Bun build reports
`ERR_MODULE_NOT_FOUND`. The shared fixture checks that recorded difference.
No library implementation changed. This is Bun runtime consumption of tarballs
installed by pnpm, not Bun installation/build-tool or terminal-renderer qualification.

## Recorded Windows observations

Observed on 2026-09-11, Windows 11 25H2 build 26220.9223, native DevTools at 100%
zoom in the light theme. Initial console widths were 1,384 CSS pixels. Isolated
Chrome for Testing 153.0.8010.36 and portable Microsoft Edge 153.0.4234.32 were
checked against their official stable feeds. Exact engine revisions, console
dimensions, fixture arguments, screenshots and frame timestamps are recorded in
the local observation JSON.

The initial badge, multistyle/literal-percent, static SVG and finite wave fixtures
were observed in both browsers before building the full editor. The required
gallery contains badge, neon, RGB split, extruded text, holographic, gold, chrome,
CRT and rainbow. All four motion families have static alternatives. The extended
matrix contains fifty SVG fixtures: nine preset variants and plain lettering,
each static and with glow pulse, gradient drift, gentle wave and an indicator.

Native observations exposed two defaults that were corrected: CSS paint containment
cut off shadow edges, and a cyan indicator was invisible over a cyan badge. CSS
padding and a dark outline for badge indicators resolved those samples. Changed
arguments were compared explicitly; unaffected fixture evidence is retained.

Repeated identical SVG image data can retain a finished animation frame. Fresh
rainbow fixtures changed and settled in both browsers after cached repetitions
were observed. No API promises restarting an identical printed image. Wave motion
keeps each text run intact to preserve Unicode shaping.

Frame comparison retains exact PNG hashes and also measures pixel differences.
Differences of at most one level in an 8-bit color channel are recorded separately
as rasterization noise. They do not count as visible motion. This distinction
revealed the invisible badge indicator; a hash change alone was insufficient.
Quantitative frame checks do not replace visual review or lifecycle qualification.

## Evidence locations and remaining gates

The [durable native evidence bundle](evidence/devtools/2026-09-11/README.md)
contains the selected matrix, original reports and PNGs, exact input archives,
compiler/output identity checks and file hashes. Local captures also remain in
`.artifacts/devtools/`. The harnesses under `scripts/` observe the actual native
Console and preserve quantitative measurements separately from visual conclusions.

All 100 combination terminal states were inspected through 53 distinct bitmaps.
The selected motion rows change visibly and settle. Generated literal-percent
source, native copied CSS text and SVG captions, logging before open, close/reopen,
identical output, narrow consoles and offscreen return were observed in both browsers.
The 424-pixel console exposes horizontal scrolling for a 600-pixel image while
keeping the complete caption as text. Image timing on first open/reopen depends on
native rendering and caching; no restart guarantee applies to printed entries.
Additional generated default/system-reduce cases remain static in both browsers.
Moving frames for all four motion families and all twenty style/plain wave
combinations were visually inspected without content clipping in those samples.

The production studio's Play and Replay controls both produced changing frames and
the same useful finished frame in a dedicated Chrome page check. The exact SVG URI
was retained; CSS previews remain labeled approximate. These page observations do
not replace native DevTools evidence. Representative screen-reader/browser review
is nonblocking follow-up under [ADR-0013](adrs/0013-keep-screen-reader-review-as-nonblocking-follow-up.md). [Merged-main source CI](evidence/ci/2026-09-12/main.json)
passed; the later local release update still needs its own CI result. The separate
[protected hosted checks](evidence/hosting/2026-09-11/preview.json) passed against the
approved studio artifact.

Motion defaults to static. Browser helpers resolve system preference at explicit
emission and retain static output for reduced, unknown or unavailable preference.
Standalone output contains precompiled branches with a read-only preference guard;
a modified host API that throws remains an execution error. Animation is decoration
bounded to at most five seconds, with no timers, clearing or repeated logging.

See the [working implementation receipt](specs/console-fx-implementation-evidence.md)
for local, package, CI, publication and deployment status. All eight required effect
families, both metallic variants and all four motions remain mandatory for full launch.
