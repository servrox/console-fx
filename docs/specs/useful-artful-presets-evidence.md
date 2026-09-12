# Useful and artful preset implementation

All ten approved standard cards are implemented and locally qualified as of
2026-09-12. Their [integration CI](../evidence/cards/2026-09-12/ci.json) passed and PR #8
was merged. Package publication and public deployment are separate gates. Compact variants, fitting/recipes and the website specifications
remain subsequent slices of the active all-spec implementation task.

The implementation follows ADR-0002 through ADR-0010 and ADR-0012 through
ADR-0015. The maintainer accepted ADR-0014, all ten standard designs, ordinary
scene slots and Windows font fallbacks. ADR-0013 keeps the unperformed
screen-reader walkthrough nonblocking. No compact design acceptance is inferred.

## Implemented behavior

All ten factories, catalog entries, closed presentation descriptors and bounded
SVG renderers share ordinary scene text with the studio, React adapter and
standalone compiler. Named fields, status/tone palettes, accent/detail controls,
explicit undoable detachment, draft/import recovery and exact format-aware copy
are integrated. Useful values are supplied by the caller; examples are synthetic.
Commands, endpoints and durations remain inert strings.

Unknown data/options fail validation. Incompatible typography, effects, structure
or overflowing content produce actionable diagnostics; only explicitly requested
plain-text fallback preserves the full content. Old presets retain their behavior.
The [older-reader test](../evidence/cards/2026-09-12/older-reader.json) records the
qualified cinematic reader rejecting every new card with `unknown-property`.

## Source, browser and package checks

The [validation record](../evidence/cards/2026-09-12/validation.json) records 193
passing unit tests, type/lint/format checks, and 26 desktop/mobile studio journeys.
The first studio run passed 24; two CSP cases lacked the local deployment-config
prerequisite. After `pnpm prepare:vercel`, both focused cases passed. Preparing
that artifact created no hosted deployment.

Packed JavaScript, TypeScript, React SSR/lifecycle and Next build/browser consumers
pass, including all ten card previews and exactly-one emissions. The installed
JavaScript fixture also passes under Nix-managed Bun 1.4.2. The [consumer receipt](../evidence/cards/2026-09-12/consumers.json)
identifies the tested core tarball `d30f62f3…` and React tarball `51a2f2dd…`.
The [README-only reconciliation](../evidence/cards/2026-09-12/readme-package-reconciliation.json)
identifies documented core tarball `34efeda7…`: every runtime, declaration and
metadata file is identical to the installed candidate, permitting evidence reuse
under ADR-0009.

The [bundle receipt](../evidence/cards/2026-09-12/bundles.json) measures the public
CSS-only helper `compileCssConsole` at 9,468 gzip bytes against 10,240. The complete
compiler measures 16,633 against 25,600. Both share the same pure CSS algorithm;
the helper permits removal of SVG artwork without adding an entrypoint, package
or runtime dependency. Root imports retain no renderer or framework modules.
Module lists count bytes retained in output, not tree-shaken inputs.

## Design and actual DevTools evidence

The [durable evidence bundle](../evidence/cards/2026-09-12/README.md) separates
same-environment reference/image comparisons from actual native DevTools captures.
All ten reference pairs and all ten default native cards in each browser were
visually inspected. Semantic slots and anchors match; repeated spaces remain
literal even where the reference SVG collapsed them.

Two hundred recorded native rows comprise 180 distinct lifecycle/theme/zoom cases
plus 20 replacement full-window zoom captures. All match the current compiler's
exact arguments, complete caption and generated source. Windows clipboard CRLF
is recorded and normalized only for semantic comparison. Current-stable Windows
Chrome 153.0.8010.36 and Edge 153.0.4234.32 were checked at light/dark 100%, dark
200%, and a 424 CSS-pixel console, including before-open, reopen, identical
repetitions and native Copy console.

Fixed 720 × 240 artwork requires scrolling in narrow/zoomed consoles. Captions
remain complete and readable; this does not qualify automatic fitting or responsive
output. Font estimates remain approximate. Independent review found a real wide
serif underestimate, now fixed with adversarial regressions; all 5,500 recorded
Windows local-font measurements remain within the new estimate. That corpus is
not a guarantee for arbitrary recipient fonts.

## Remaining gates

PR #8 passed CI run `34697850568` at reviewed head `06d6dfef…` and was merged.
Final full-spec package installation, publication and hosted qualification apply to the later release
candidate. Fitting, compact variants and the website implementation have their own
requirements and must not inherit a passing status from this card receipt.
