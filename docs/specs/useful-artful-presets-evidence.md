# Useful and artful preset implementation

Status: implementation and qualification in progress, 2026-09-12. No publication
or public deployment is claimed. The maintainer accepted ADR-0014 and all ten
standard references, then ADR-0015; compact variants still require visual review.

The current isolated integration adds all ten factories, ordinary scene slots,
strict presentation data, status palettes, bounded SVG geometry, shared preview
and standalone output, named studio fields and undoable detachment. The
implementation follows ADR-0002 through ADR-0010 and ADR-0012 through ADR-0015;
ADR-0013 keeps the unperformed screen-reader walkthrough nonblocking.

## Source and local checks

The complete unit suite currently passes 193 tests. Approved scene fixtures and
captions match for all ten profiles; old presets and cinematic output remain in
the regression suite. Status/tone handling, deterministic minimal variants,
malformed data, literal-percent exports, full text fallback, and one-call emission
are exercised. Hostile options and multilingual captions also pass. Six new desktop/mobile
studio journeys pass, including exact previews, clipboard output, tone/draft
recovery, import failures, undo and accessible controls. Packed JavaScript,
TypeScript, React SSR/lifecycle and Next lifecycle checks pass; the additional
all-card Next browser case is being finalized.

## Design comparison

All ten standard SVGs were rendered beside their immutable references in the same
Windows Chrome for Testing 153.0.8010.36 environment at 720 × 240. Local font
stacks resolve to Arial, Consolas and Georgia. Every semantic slot and declared
anchor matches; all text remains inside its artboard. All ten comparison pairs
were inspected individually.

The implementation preserves repeated spaces in supplied text. Build Receipt's
environment field and Request Trace's request ID are approximately one local
space wider than the reference's collapsed-space display; captions and semantic
strings are exact and both remain in their safe regions. Other raster differences
are confined to the outer corners, where a backing surface changes antialiasing.
No whole-image percentage threshold was used to excuse a missing word or clipping.

Reproduce after building packages with `node scripts/compare-card-references.mjs`
and an explicitly launched Windows browser at `CONSOLE_FX_CDP`. Current raw
comparison artifacts are retained locally in `.artifacts/cards/comparison/`.
The dedicated profile disables background throttling because the older comparison
window intermittently timed out during screenshots. This is page/image evidence,
not actual DevTools qualification. Durable release evidence will include final
candidate and artifact fingerprints.

## Package boundaries

An installed simple CSS consumer uses the public `compileCssConsole` helper and
measures 9,433 gzip bytes against 10,240. The complete compiler, including SVG
artwork, measures 16,602 against 25,600 with either CSS or SVG selected. The helper
shares the pure compiler and CSS renderer; it introduces no package, entrypoint,
plugin registry or alternative CSS algorithm. The original complete compiler's
defaults and output remain covered by compatibility tests.

Bundle receipts count modules that contribute emitted bytes, distinguishing them
from imports a bundler scans and removes. The CSS artifact retains no SVG artwork;
root data imports retain no renderer or framework modules. Current packed-file
checks pass. Final tarballs, framework installations and release authorization
remain separate from these provisional size observations.

## Remaining evidence

Complete studio recovery/copy/accessibility journeys, installed JS/TS/React/Next
consumers, actual Windows Chrome and Edge DevTools observations per card (themes,
narrow console, zoom, repeats, native copy), independent review, CI, and final
candidate reconciliation remain pending. Fitting/recipes and the website value
story are separate approved slices of the active all-spec implementation task.
