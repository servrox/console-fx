# ADR-0015: Separate content fit from output sizing

Status: Accepted
Date: 2026-09-12
Owner: ConsoleFX maintainer
Applies when: Layout planning, text measurements, console sizing, render recipes, fit previews or their compatibility changes.
Supersedes: None
Superseded by: None
Approval: On 2026-09-12 the maintainer explicitly answered “Approve ADR-0015” for this reviewed fitting, sizing, measurement and render-recipe contract. The active request to review/merge all PRs and fully implement all specifications supplies implementation authority. Compact visual variants still need their own review.

## Context

The current SVG renderer estimates text widths and reserves a fixed-pixel console box. Content can overflow its frame or a correctly laid-out frame can overflow a narrow console. Shrinking a whole card can make meaningful text unreadable. A normal package has no supported API for measuring the DevTools message area. Proposed cinematic and card profiles increase the importance of honest geometry and readability contracts.

## Decision

Keep deterministic content layout and output-carrier sizing as separate, explicit requests within the existing core package. Layout receives chosen frame constraints, a versioned fitting policy and bounded measurement data. Carrier sizing selects a fixed width or an explicitly experimental Chromium container-relative rule. Do not expose a guessed console width, a generic `responsive: true` promise, arbitrary CSS, or a second studio renderer.

The pure compiler never reads browser geometry, creates measurement DOM, loads fonts, logs or mutates state. Optional local-font measurement is explicitly invoked outside compilation and returns validated data. Authored-geometry, measured-local-font and estimated results carry distinct confidence. Local measurements are not proof that a recipient's DevTools resolves the same font. Standalone snippets contain precompiled output and the existing single console call, not measurement, listeners or redraw loops.

Fit the entire finite paint/motion envelope into declared safe regions. Wrap or shrink only under a selected policy, preserve canonical content and readable floors at known sizes, and use structured errors or caller-authorized complete text fallback when impossible. Compact card layouts are reviewed profile variants, not silent changes to fixed design references or immutable profile IDs.

Container-relative padding is a candidate output technique, not an observation API. The frontend resolves it. Report unknown actual display dimensions and unknown image-text readability; always preserve the reset-styled native caption. Qualification must test real Windows Chrome and Edge, not merely a reconstructed page. Failed experiments retain qualified fixed/text paths and never trigger repeated logging.

Preserve SceneV1 and legacy output by default. A core-validated `consoleFxRenderRecipe` v1 wrapper carries the existing scene and explicit export/layout/sizing options for studio persistence and sharing. Do not duplicate scene text, store raw geometry, persist live font measurements, or make parseScene guess an envelope. Keep old raw-scene imports, explicit version rejection, bounded local storage and recoverable conversion. Old compilers/readers must reject new unsupported options/recipes rather than pretend to apply them.

## Alternatives

- Guess width from page/browser geometry: not the message-area contract and stale on docking/resizing.
- Uniformly scale every card: useful for some art, insufficient for information-dense cards.
- Measure inside compilation or generated code: violates determinism and single-emission/no-side-effect boundaries.
- Import arbitrary SVG or build a separate preview renderer: violates shared-model and validated-data boundaries.
- Promise responsive SVG layout switching: not established by the padding experiment; defer it.

## Consequences and dependencies

The feature adds explicit layout, confidence and recipe compatibility work, without adding a package, font service, console extension or live-output API. Old default outputs remain stable. Reflow for the accepted card presentations needs separately reviewed compact references; cinematic fitting uses Accepted ADR-0012. Acceptance of those standard profiles does not approve new compact variants or this fitting contract.

Accepted ADR-0013 owns the accessibility successor and Accepted ADR-0014 owns the ten card presentations. This new fitting proposal uses unused ID 0015. Existing Accepted ADRs 0002–0007, 0009, 0012, 0013 and 0014 remain binding; ADR-0011 is superseded. Resolve any discovered conflict through maintainer review before implementation rather than rewriting accepted intent.

## Validation

Use the [responsive fitting specification](../specs/responsive-fitting-spec.md) for old/new option/recipe fixtures, text/paint bounds, confidence, explicit fallback, multi-width compact comparisons, silent preview/SSR, single-call exports, package consumers and the actual-DevTools matrix. The [research probe](../research/console-fit/README.md) is exploratory evidence only. This ADR reports no implemented fitting API or browser qualification.
