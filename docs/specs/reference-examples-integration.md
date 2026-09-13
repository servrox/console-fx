# Reference example integration and specification audit

September 13, 2026. The maintainer requested every missing example from the
[combined reference](../mockups/landing-playground-combined.avif) and
[output gallery](../mockups/output-gallery.svg). The implementation adds fourteen
editable examples to the landing page and focused studio. This is example data
and integration through the existing public API; it adds no renderer, schema,
presentation profile, dependency or logging transport.

## Coverage

The [shared catalog](../../apps/studio/src/features/examples/reference-examples.ts)
materializes ordinary `SceneV1` data and explicit static SVG render recipes.
The landing page exposes **Browse 14 output examples** below its six featured
cards. Both editors expose an **Output examples** group in **Start from a preset**;
the focused studio also has the complete example gallery. Existing presets remain
available. Closed galleries do not compile or mount their fourteen image previews.

| Reference | Editable example | Treatment |
| --- | --- | --- |
| SVG 01 / combined Neon Text | Neon text | Cyan glow, title and subtitle |
| SVG 02 | ASCII-inspired | Bracketed monospace signature |
| SVG 03 / combined Gradient Text | Gradient text | Existing holographic lettering |
| SVG 04 | Boxed message | Editable Unicode text frame and message |
| SVG 05 / combined Success Message | Success message | Green confirmation, symbol and sample details |
| SVG 06 / combined Warning Message | Warning message | Amber notice with an inert suggested replacement |
| SVG 07 / combined Error Message | Error message | Red failure, sample status and recovery hint |
| SVG 08 | Animated SVG | Gradient drift and decorative indicator |
| SVG 09 | Multiline layout | Title and three ordered detail lines |
| SVG 10 | Tabular layout | Monospace sample rows in one ordinary log |
| SVG 11 | Badges and labels | Three separately editable colored labels |
| SVG 12 | Custom brand | Spaced lettering and signature |
| Combined hero | ASCII logo | Original text-built console-fx wordmark |
| Combined Animated SVG | Animated dolphin | Original text dolphin with a gentle wave |

These are editable adaptations of the output concepts. Mockup browser frames,
invented project metrics and abbreviated export code are not embedded. Scene
content uses the existing font stacks and effect capabilities. The boxed message
uses text rules; no arbitrary SVG or new surface-border contract is introduced.
The dolphin/wordmark are authored text, with no added font or third-party artwork.

Both motion examples initially show a useful static image. Play/Replay only
changes the preview. Explicit system-motion export retains the existing reduced/
unknown-preference fallback and 4.8-second finite motion. Gallery selection stays
silent; landing transfers are confirmed and undoable. Studio selection, export,
copying and draft restoration consume the same scene/recipe.

## Three audit corrections

The independent Spec and Standards reviews of `4b7bf0b` found three distinct
compiler gaps. They were corrected and tested individually:

1. Fitting measurement/resource limits and invalid sizing remain fatal even when
   `unsupported: "fallback"` is requested. Only documented rendering/layout
   limitations may become readable text.
2. Experimental container output resets the carrier style and puts the complete
   native caption on the following line in the same call. Legacy fixed-image
   arguments remain unchanged.
3. SVG run text containing U+FFFE/U+FFFF fails with a path-specific
   `unsupported-svg-text` diagnostic. Explicit text fallback preserves every
   character; CSS/text and labels not inserted in XML remain compatible.

SVG capability validation shares the existing run traversal. Fallback warning
construction is shared, and diagnostic wording is concise. The original package
budgets remain binding; no threshold was increased. The package correction is
recorded in a [patch changeset](../../.changeset/fitting-failures-svg-text.md).
The already published 0.1.0 package bytes are unchanged by these source edits;
publishing a corrected package is a separate release operation. All new example
recipes use the existing public API and can be copied as standalone output.

## Verification and remaining boundaries

The input revision was `4b7bf0b25266b5d2f3195352fe23e2f09bfd1dbb`, in the owned
`console-fx-review-20260913` worktree. The original dirty checkout and index are
preserved. Governing decisions: ADR-0002, ADR-0003, ADR-0005, ADR-0006, ADR-0007,
ADR-0009, ADR-0010 and ADR-0015. No accepted decision changes.

Local checks completed: production build/prepared CSP; formatting, lint and
types; 312 unit tests; 29 release/artifact checks; tarball inspection; and the
unchanged bundle gates (CSS 9,754 gzip bytes, complete compiler 25,596 / 25,600).
Twenty-four Chrome website journeys cover the new collection and existing page
at desktop/mobile widths. Exact preview URI, complete generated arguments,
clipboard contents, no implicit emission, one Test emission, Undo and recipe
recovery are checked. The new unit cases parse every SVG and verify both finite
motion/static alternatives. Initial failures exposed test setup/typing issues
and package-size growth; these were corrected before the successful checks.

Native observation tooling is
[qualify-featured-useful.mjs](../../scripts/qualify-featured-useful.mjs): the
optional fourth argument selects `reference` or `reference-motion`. It preserves
owned-target cleanup and records browser/OS, theme, dimensions, exact arguments,
captions, source hashes and screenshots. Motion captures compare early frames
and settled frames after the finite duration. Browser startup failures and older
installed-build observations are distinct from the final qualification evidence.
Final native review, CI and hosted observations are recorded in the accompanying
evidence receipt when completed; local success alone does not establish them.

The [full-spec audit](mvp-completion-audit.md) still tracks the unobserved
five-developer sessions, physical laptop/phone performance and Safari journeys.
Screen-reader review remains a nonblocking follow-up under ADR-0013.
