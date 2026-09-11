# ConsoleFX compatibility candidate

The implementation is under release qualification. npm publication and public
studio launch are pending. These are observations for exact local fixtures and
recorded browser builds, not a guarantee for every browser version or scene.

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
not replace native DevTools evidence. Manual web accessibility and remote CI/hosted
checks remain launch gates.

Motion defaults to static. Browser helpers resolve system preference at explicit
emission and retain static output for reduced, unknown or unavailable preference.
Standalone output contains precompiled branches with a read-only preference guard;
a modified host API that throws remains an execution error. Animation is decoration
bounded to at most five seconds, with no timers, clearing or repeated logging.

See the [working implementation receipt](specs/console-fx-implementation-evidence.md)
for local, package, CI, publication and deployment status. All eight required effect
families, both metallic variants and all four motions remain mandatory for full launch.
