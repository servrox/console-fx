# ADR-0013: Use closed preset presentations

Status: Proposed
Date: 2026-09-12
Owner: ConsoleFX maintainer
Applies when: Useful/artful card presets, shared presentation data, profile rendering, or their document compatibility change.
Supersedes: None
Superseded by: None
Approval: Pending explicit maintainer review; permission to create this specification PR is not acceptance.

## Context

The ten proposed presets need full-card composition: labels, aligned facts, inset regions, original ornamentation, and typography. The current SVG renderer lays out text in flow and the rich compiler allows only one static effect per run. Stacking effects or storing a studio-only SVG would not supply a coherent editable card across the core, preview, export, and saved document.

Proposed ADR-0012 addresses single-run cinematic lettering. It does not authorize a card-wide layout boundary and remains proposed. A general graphics scene, font API, template uploader, or separate package is not justified by this collection.

## Proposed decision

Extend SceneV1 with an optional, closed `presentation` field for static `presetCard` profiles. Profiles have immutable versioned IDs, bounded accent/detail parameters, fixed slot schemas, and core-owned geometry. Existing scenes omit the field and retain their normalization/meaning. All visible text remains in existing lines/runs, in reading order; the descriptor maps slots to those positions. Do not duplicate text in the presentation object or persist raw SVG/CSS, executable templates, paths, JSX, or arbitrary metadata.

Preset factories materialize the complete normalized scene and resolved settings. A profile ID names a versioned renderer algorithm, not mutable preset defaults. The same descriptor owns validation, supported structure/typography, controls, content limits, renderer compatibility, and original decorative geometry. The studio consumes that shared metadata; it does not own a second layout/compiler or silently detach content from its profile.

Initial presentation scenes are static and permit no extra run effects. Preserve existing effect rules for ordinary scenes. Incompatible structure/style/effect edits require a reversible explicit conversion or a diagnostic. No hidden ignored fields or missing rows. Compilation is pure. Emission/export remains exactly once with complete, reset-styled readable text; commands and endpoint strings are inert data.

New readers accept old scenes unchanged; old readers explicitly reject new presentation data while preserving current work. Unknown profile versions and malformed data are errors. Valid-but-rich-incompatible or overflowing content can use only the caller's explicit plain-text fallback. New profile algorithms require new IDs; no destructive migration, profile removal, or release is authorized here. Test this matrix before introducing the public extension.

Use internal authored SVG and local font stacks under ADR-0005's security/resource limits. Keep all artwork deterministic and bounded. No downloaded/embedded fonts, resources, randomness, polling, live metrics, or public renderer plugins. Mockup/fixture files are comparison evidence, not a runtime import schema or proof of support. Actual DevTools qualification remains governed by ADR-0006.

## Alternatives considered

- Existing flow scenes only: suitable for simplified summaries, but cannot honestly meet all reviewed composition targets.
- Add a composite effect per text run: suitable for cinematic lettering, awkward for card-wide slot alignment and decorative regions.
- General-purpose layout/graphics schema: broadens the public/security surface beyond this fixed set of presets.
- Store finished SVGs in the studio: breaks editability, shared-model ownership, complete text fallback, and export/library parity.

## Consequences and review gate

The collection becomes an additive but real shared-API/document extension. It introduces compatibility and slot-mapping work, not a free styling tweak. Implementation is blocked until this proposal and the design baselines are reviewed and accepted. Acceptance may revise the proposed additive-v1 strategy; do not infer it from merging documentation. Accepted ADRs remain binding and unchanged; ADR-0012 is neither accepted nor superseded.

## Validation

Follow the [collection spec](../specs/useful-artful-presets-spec.md) and [comparison protocol](../mockups/preset-collection-v1/comparison.md). Prove old/new reader behavior, exact text/order, bounded profile geometry, no additional effects or side effects, safe standalone code, shared preview/export/draft behavior, package boundaries, and actual DevTools appearance. Fixed SVGs and hashes establish design provenance only. No runtime implementation or qualification is claimed by this record.

## Governing decisions

[ADR-0002](0002-compile-purely-and-emit-exactly-once.md), [ADR-0003](0003-share-one-versioned-scene-model.md), [ADR-0004](0004-separate-core-react-adapter-and-studio.md), [ADR-0005](0005-generate-output-from-validated-data.md), [ADR-0006](0006-qualify-renderer-profiles-in-real-devtools.md), [ADR-0007](0007-keep-studio-documents-local.md), [ADR-0009](0009-validate-changed-contracts-with-proportional-evidence.md), and [ADR-0011](0011-adopt-an-explicit-accessibility-baseline.md).
