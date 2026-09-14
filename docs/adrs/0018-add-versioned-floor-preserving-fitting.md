# ADR-0018: Add versioned fitting that preserves readable floors

Status: Accepted
Date: 2026-09-14
Owner: ConsoleFX maintainer
Applies when: Fitting every new catalogue example without implicit font measurements.
Supersedes: ADR-0017 only for the new-example algorithm identifier; ADR-0015 remains binding except for this separately versioned algorithm addition.
Superseded by: None
Approval: On 2026-09-14 the maintainer explicitly answered "Approve ADR-0018 and 0.2.0 next" to this concrete record and release scope.

## Problem reproduced during integration

- ADR-0017 requires explicit fitting and automatic SVG sizing for all 43 new examples, without implicit font measurement.
- The initial catalogue matrix compiles 29 of 43 examples. Twelve card recipes and two text layouts fail the new unmeasured fitting path. Previously qualified compact cards used explicit font measurements.
- `fit/v1` scales every font uniformly. A 12 px caption prevents a larger title from shrinking at all when the readable floor is 12 px. Conservative bearings can also extend outside a slot whose nominal text anchor is inside it.
- Wider frames alone do not solve the card cases. The text table's box-drawing characters exceed even the maximum width at the permitted uniform scale. Exhausted reservations for possible measurement snapshots can terminate estimation before a fitting candidate is reached.
- Fitting specification §4 requires a reviewed new identifier for changed stored visual meaning. Changing `fit/v1` would also change previously successful text fallbacks. Preserve that behavior.

## Decision

1. Add **`fit/v2`** alongside unchanged `fit/v1`. Existing calls, saved recipes, measurements, failures and fallbacks using v1 keep their current behavior.
2. Use a bounded, deterministic grid of at most **16 whole-document candidates**. In v2, fonts follow the candidate scale until reaching their individual readable floor; larger type may continue shrinking while small labels stay readable. Keep the existing Useful-body and compact-card floors, with a 12 px new-example default.
3. Place the estimated/measured **paint rectangle inside each existing safe cell**, accounting for bearings, ascent, descent and decorations. Translate only within the approved cell; check overlap and ornament exclusions. Preserve approved artwork, slot order, every text field and bounded wrapping. If no safe fit exists, retain explicit failure/fallback.
4. Keep at most **512 shaping requests**, at most 512 KiB of cached data, 1,200 × 400 output, existing source/node limits, and **64 KiB input snapshots**. V2 estimation work and optional serialized measurement batches have separate counters; neither grows without a bound. Font measurement remains an explicit user action.
5. New catalogue examples use v2 plus the approved `container-experimental` carrier. Existing imported/raw/saved work remains unchanged. An explicit conversion is undoable. Keep unknown-width readability diagnostics and complete native text captions.

This changes no scene or recipe-envelope version, adds no dependency, service,
telemetry, automatic emission, or public registration API. Algorithm identity
is included in measurement keys; older readers reject the unsupported identifier.

## Release scope

The new public algorithm is an additive feature. Release core and React **0.2.0**
under the existing `next` channel, with the adapter requiring the matching core
range. Include the pending 0.1.1 fixes; do not publish an intermediate release
merely to change its label again. Registry verification remains separate.

## Required proof

- One catalogue matrix: all 43 examples, full text, floor/bounds/overlap checks, silent compilation, one-call export, recipe round trips and explicit experimental status.
- Compatibility fixtures: v1 outputs, reports, failures and fallbacks unchanged; v1/v2 measurement identity isolation; old-reader rejection.
- Meaningful failure/budget tests for impossible text, oversized input, bounded candidate/measurement work and invalid metrics.
- Real Windows Chrome/Edge DevTools for the new default combinations and updated geometry, separately from page/accessibility, package, CI and hosted checks.
- Inspect new card output against the approved compact artwork; do not claim newly invented layouts as previously approved designs.

## Alternatives considered

| Alternative | Why not selected |
| --- | --- |
| Exempt failing examples from automatic sizing | Violates the approved all-example requirement |
| Measure fonts automatically on load | Violates the explicit measurement boundary and cannot be replayed as a saved recipe |
| Lower all readable floors or loosen paint bounds | Hides the fitting problem |
| Mutate v1 or silently replace its successful text fallback | Changes saved visual meaning without versioning |
| Add v2 and retain v1 | Makes the new behavior explicit and keeps existing work stable |

Acceptance authorizes this implementation and release scope; runtime and publication results remain separate evidence.
