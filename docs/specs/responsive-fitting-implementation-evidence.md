# Responsive fitting implementation

Status: core, compact layouts and studio integration implemented and reviewed, 2026-09-12.
Local and recorded Windows Stable qualification passed within the scopes below. The active task authorizes implementation
and integration; ADR-0015 is Accepted. The maintainer explicitly answered
“Approve all ten compact designs” for the [separate 360 px references](../mockups/preset-compact-v1/README.md).
No fitting publication or deployment
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
is unchanged. Standard cards keep their reviewed geometry; the ten accepted
compact layouts are now explicit `fit/v1` choices. Each has its own versioned
mapping and auto-selection threshold. Compact geometry is capped at its native
360 px size, centered in wider requested frames; all visible compact text has a
12 px floor. Smaller frames can fail explicitly. Authored card decoration still
follows its original artboard clip.

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
continues to reject envelopes. The studio now imports, exports, shares and resumes
recipes. Raw scenes retain their original storage key. An explicit settings edit
or recipe import converts the current document to recipe persistence, retaining
the previous raw draft. Invalid recipes hold writes and preserve current work;
clear failures remain recoverable. Imported scenes and render settings form one
undoable change. No-op settings do not clear redo or convert a raw draft.

The fitting inspector owns its ResizeObserver and coalesces resize work into one
pending frame. Width simulation is transient; applying that width to exports is
explicit. Fixed output sizing and the experimental carrier remain separate. Local
font measurement runs only after its button is activated, in an owned worker with
an empty web-font set. It is canceled on changed inputs or unmount, and its snapshot
never enters a recipe, draft, share link or generated runtime measurement loop.
Measured exports and previews use the same compiled arguments. Package, React and
Next.js formats preserve their full materialized scene and integration semantics,
and include the validated numeric snapshot as explicit compilation data. They do
not call the measurement adapter; recipient font variation remains disclosed.

## Final verification — 2026-09-12

The [durable fitting evidence](../evidence/fitting/2026-09-12/README.md) identifies
source checkpoint `f6b4963`, exact package artifacts, fixture identities, native
observations, font reports and reviewer corrections. Later website-only changes
do not alter the compiler. Acceptance is scoped to the recorded fixtures and builds;
container sizing remains explicitly experimental with unknown display readability.

| Criteria | Evidence and result |
| --- | --- |
| FIT-01–02 | Fifty legacy argument/code cases across all 23 presets remain byte-identical; deterministic and nonmutating compilation regressions pass. The old reader rejects all 69 new option/recipe cases. |
| FIT-03–06 | Authored geometry, complete finite effect bounds, legal Unicode wrapping and explicit full-text fallback pass unit regressions. Compact text avoids neighboring slots and ornament regions; all ten samples preserve their reviewed fields. |
| FIT-04/07/09 | Each browser's local-font matrix covers 105 standard cases (72 compiled, 33 explicit failures) and 50 compact cases (40 compiled, ten 280 px floor failures). No successful text bounds escape; no measurement network request occurs. Full reports retain dimensions, confidence and diagnostics at 280/360/480/720/960. |
| FIT-08 | Maintainer approved all ten 360 px references. Slot strings, anchors, fonts and fragment counts match the runtime exactly. Original standard/cinematic references and approved SVG hashes remain intact. |
| FIT-10 | Compilation/import/preview/SSR stay silent. Explicit native calls and standalone snippets emit once; resize, reopen and offscreen return do not cause another library call. |
| FIT-11–12 | Actual Windows 11 Chrome 153.0.8010.36 and Edge 153.0.4234.32 observations cover source anchors, groups, timestamps, repeated messages, docking/drawer, browser and DevTools zoom, resizing, reopen and asserted offscreen return. Four fitted motions visibly change and settle. Fixed clipping is recorded; container image readability stays unknown. |
| FIT-13–14 | Studio tests cover recipe/draft/share round trips, invalid import recovery, one undoable import, raw-draft retention, clear failures, simulated versus applied width, measurement cancellation, keyboard and focus. |
| FIT-15 | Exact packed JS/TS/React/Next consumers and Bun checks pass. CSS is 9,670 gzip bytes; complete compiler 25,583; SVG entry 25,582, within unchanged 10/25 KiB budgets. No runtime dependency was added. |

All 257 unit tests across fifteen files passed, as did type checking, lint,
formatting, full build, release-artifact checks, package inspection and consumer
checks. The final studio suite passed fifty desktop/mobile-sized cases in the
isolated Windows browser. Its installed Edge 152 Beta context is page-test
evidence; the separate 153 Stable native matrix supplies renderer qualification.
An initial default Playwright launch had no Linux browser binary in this NixOS
environment and exercised no application cases; the documented CDP run passed.
CI and publication are recorded separately when performed.

The final core tarball SHA-256 is
`bea698087b6148bbf55fc8022bd48af35a67e0f8e951202cbca494a7b5b1d8e0`;
React is `eefa4f0b88114927efb52ad7eae1d4b3ef569e32685ad0c60db2b6939cb2483c`.
Both are version 0.1.0. The lockfile is
`a9aeac3691f826646112a9e7ba3ecc45e0fac8e5d0c3a90a0c46bda7a13c0497`.
Consumer installs use these tarballs, never workspace imports. This is not npm
publication or a public studio deployment.

## Review corrections and limits

Two independent reviewers closed the product findings: split-run wrapping,
measurement recovery, separator handling, fractional legacy dimensions, compact
floors/overlap/ornament regions, and landing transfer/recovery. Seven measured
ornament regressions reject unsafe text while retaining complete fallback. Legacy
Letterpress geometry remains unchanged. No Accepted ADR intent was rewritten.

Evidence review also corrected the fixture's merged motion policy and required
both standalone branches to match compiled arguments. Offscreen return now asserts
that the native message left the console clipping area and fully returned before
capture. Earlier inverted offscreen rows are retained and explicitly excluded.
A newer installed Edge Beta run was initially mistaken for Stable in progress
reporting; current qualification uses the separately signature-verified 153 Stable
executable. Beta receipts are never relabeled as Stable. Earlier merged standard
card evidence already used actual Stable and remains valid for its own scope.

Fixed output can overflow a narrow console, including at increased native zoom.
Container sizing preserves a measured carrier ratio and cap in the observed
contexts, but cannot promise legible image text or infer the actual console width.
Windows fonts and segmentation results are local observations, not a recipient-font
guarantee. Original canonical captions and native copying remain available.

Website integration and external follow-ups are tracked in the [value receipt](website-value-implementation-evidence.md)
and [experience receipt](website-experience-implementation-evidence.md). Exact-head
CI, npm publication and hosted launch retain their own evidence/approval gates.
The unperformed screen-reader walkthrough remains nonblocking under ADR-0013.
ADR-0002 through ADR-0010 and ADR-0012 through ADR-0015 materially governed this work.
