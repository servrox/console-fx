# Responsive fitting implementation

Status: fixed-fitting core implementation under review, 2026-09-12. This receipt
does not mark all FIT criteria complete. The active task authorizes implementation
and integration; ADR-0015 is Accepted. Compact references are prepared separately
and still await maintainer visual acceptance. No fitting publication or deployment
has occurred.

## Current core slice

The existing compiler accepts explicit `layout` and `sizing` requests. Omitted
options preserve legacy renderer output. Fitted SVGs use a shared data plan for
placement, complete finite effect/motion bounds, text fragments and serialization.
The result's frozen `layout` report records dimensions, fragment/glyph/paint bounds,
font sizes, content/display scales, confidence, diagnostics and measurement work.
`outputSizing` separately reports fixed dimensions or unknown container dimensions.
CSS fitting fails explicitly; caller-authorized text fallback retains all content.

`fit/v1` selects at most sixteen uniformly scaled candidates, descending from the
source size to the requested display font floor. It uses whole grapheme clusters
with ASCII-space and CJK-letter break opportunities; unspaced identifiers and other
scripts remain intact unless an explicitly allowed shrink fits them. Canonical
text and original newlines remain in the caption. Derived wrapping stays within
eight visual rows and the 400px height limit. Wrapping considers occupied space across styled runs; changing style does not introduce a break inside an identifier. Native segmentation is recorded as
`fit/v1-grapheme-space-cjk`; cross-runtime segmentation still needs qualification.

The layout reserves extrusion, offset copies, badge/background regions and finite
motion extrema, including the entire wave amplitude and moving indicator range.
Neon and cinematic blur use a finite three-sigma allowance. Fitted neon uses an
explicit filter region, including for short glyphs. Legacy filter serialization
is unchanged. Current standard cards keep their reviewed geometry; small sizes
can fail the declared readable floor until separately reviewed compact layouts
are integrated. Authored card decoration still follows its original artboard clip.

## Optional measurement and saved recipes

`prepareTextMeasurements(scene, options)` is pure and returns a bounded batch.
It requires an explicit layout, SVG target and a caller-owned font-environment
identifier. Even a conservative fit failure can return useful preflight requests. A stopped planning budget returns the collected batch with its structured resource diagnostic; this is not a successful fit verdict. Request accounting reserves room for the resulting numeric metrics and snapshot envelope. Optional wrapping lookahead fills at most three quarters of the byte/request budget after required work, leaving capacity for changed fragments in the measured pass.
The caller may explicitly invoke `measureTextBatch(requests, environment)` and
pass the returned snapshot to compilation/export. Neither compilation nor logging
calls the adapter. Missing exact fragments/sizes remain visibly estimated; there
is no hidden retry or exact-font promise. Budgets cover 512 unique requests and
64KiB of snapshot data for an attempt, including supplied records.

Keys include exact text, normalized style, profile, algorithm, direction, italic
setting and environment. Signed ink bearings are distinct from advances. The
adapter uses the matching closed local stack, Canvas spacing and shaping settings,
an OffscreenCanvas where available, or a detached canvas. It declines before font
operations if the relevant FontFaceSet is unavailable or nonempty, avoiding
page-supplied/downloadable fonts. No `document.fonts.load`, network call, attached
measurement DOM or font file is used. The Canvas [font-source rules](https://html.spec.whatwg.org/multipage/canvas.html#text-styles)
and [FontFaceSet source contract](https://www.w3.org/TR/css-font-loading-3/#font-face-source)
explain this conservative guard; browser observations establish its actual result.

`parseRenderRecipe` validates a separate `consoleFxRenderRecipe` v1 envelope with
one SceneV1 and explicit export/layout/sizing options. It rejects measurements,
environment identifiers, unknown/future versions and excess data. `parseScene`
continues to reject envelopes. Core recipe parsing exists; studio draft/share
conversion and recovery integration are still pending.

## Current observations

Existing 193 unit regressions passed after the first opt-in seam. New focused
fitting tests cover Unicode/content preservation, geometry, explicit fallback,
no implicit measurement, one-call exports, strict snapshots, preflight failures,
recipe compatibility and unknown sizing. Latest final counts belong to the next
saved validation receipt rather than this provisional paragraph.

The first Windows Chrome 153.0.8010.36 owned-page run checked 105 cases across
280/360/480/720/960 widths: 72 compiled, 33 returned explicit size/readability
failures. All successful text stayed inside its artboard; 62 used recorded local
font measurements and ten used authored geometry. The adapter made zero network
requests and did not change the page DOM; a page-supplied font was declined. The
four cinematic, RTL, CJK, combining, emoji and short-glow sample images were
inspected. Raw artifacts are local under `.artifacts/fitting/fonts/`. Later source
changes and Edge results need their own reconciliation; this is page/font evidence,
not actual DevTools qualification.

## Fixed-core review corrections

The independent Standards and Spec reviews at `e67719a` found five distinct
regressions: split-run wrapping, estimate-only wrapping blocking measurement
recovery, invisible card separators preventing shrinking, rounded cinematic glyphs
violating a reported floor, and changed fractional legacy dimensions. Corrections
use row-wide legal breaks and matching measurements, visible descriptor slots,
full-precision fitted serialization, and an untouched legacy renderer branch.
Original SceneV1 separators and unfitted serialization remain unchanged.

After these corrections, all 213 unit tests passed across 13 files, including five
new regression cases. Type checking, lint and formatting passed. Package validation
passed; installed-bundle checks measured 9,670 gzip bytes for CSS and 23,485 for the
complete compiler, within the unchanged 10/25KiB budgets. The first restricted
sandbox run could not spawn Node for five import tests (`EPERM`); the authorized
Linux subprocess rerun passed all tests. This is local evidence; new packed-consumer
and native fitting observations are still pending. Protected root checks confirmed
all 205 recorded files, its HEAD and Git index were unchanged.

## Remaining work

- Independent fixed-core review, final package/bundle/consumer checks and actual
  Windows Chrome/Edge fitting observations with candidate fingerprints.
- Compact reference acceptance and runtime integration, with per-slot comparisons.
- Container qualification across docking/drawer, source anchors, groups, timestamps,
  repeats, zoom, resize, reopen and offscreen return. The opt-in carrier is explicitly
  experimental; it reports unknown image readability and never reprints on resize.
- Fit inspector, owned ResizeObserver lifecycle, simulation/export separation,
  explicit local measurement, and recipe draft/share/import/undo/recovery integration.
- Full website value/experience specifications, their interaction/accessibility and
  performance evidence, then final CI, publication and hosted launch gates.

ADR-0002 through ADR-0010 and ADR-0012 through ADR-0015 govern this work. The
unperformed screen-reader walkthrough remains nonblocking under ADR-0013.
