# ADR-0012: Use bounded cinematic lettering profiles

Status: Accepted
Date: 2026-09-12
Owner: ConsoleFX maintainer
Applies when: Cinematic metal presets, their shared effect contract, glyph data, rendering, or document compatibility change.
Supersedes: None
Superseded by: None
Approval: On 2026-09-12 the maintainer explicitly answered “Approve ADR-0012 and ADR-0013” when asked to accept the prepared records. The earlier request to implement commit 3c42e12d705b044809c05579f762bcb8c137890a supplies implementation authority; the original specification save alone did not.

## Context

The requested cinematic presets need original silhouettes, nonuniform metallic reflections, extrusion, glow, and ornaments. The current rich compiler allows one static effect per run, so independently stacking metallic, extruded, and neon effects is unsupported. A separate app renderer or arbitrary SVG field would violate the existing shared-model and validated-data boundaries.

## Decision

Represent a complete treatment as one static built-in `cinematicMetal` effect in the existing JSON-compatible SceneV1 model. Use four closed, versioned profile IDs and bounded parameters for accent color, depth, glow, and ornaments. Preset factories materialize ordinary scenes; the core catalog owns validation metadata, and the existing SVG compiler owns rendering. No plugin registration, arbitrary paths, font API, new npm package, or second editor renderer is introduced.

Profile-owned geometry is immutable repository-authored data. Angular treatments use original path glyphs; serif treatments use local font stacks with documented platform variation. Do not fetch, embed, extract, or redistribute font files, film logos, or credit artwork. Allow only the internal references and output forms permitted by ADR-0005.

The additive effect retains scene schema version 1 without changing existing effects. New readers accept old scenes unchanged. Old readers reject the new effect explicitly and retain their current document. Unknown profiles are errors. Versioned profile identities preserve the meaning of saved scenes; incompatible material/geometry redesigns receive new IDs. No stored-data migration or removal is authorized.

Keep one-static-effect enforcement. Initial cinematic profiles are static-only; additional static or motion combinations remain unsupported rather than silently flattened. Glyph/title limitations are rich-render capability checks, leaving explicitly selected readable plain text available. Strict unsupported requests error; fallback uses the existing explicit policy. Compilation is pure and silent, and output includes a reset-styled readable caption in the same single emission.

## Alternatives

- Stack existing effects: conflicts with current combination policy and does not provide the required lettering.
- Import a font or arbitrary SVG: conflicts with accepted resource, security, and asset boundaries.
- Introduce a generic graphics scene/plugin system: unnecessarily broad for four presets and duplicates established ownership.
- Add studio-only image templates: breaks preview/export/library parity and editable scene round trips.

## Consequences

The feature gets expressive, deterministic, inspectable output without expanding the public markup boundary. It adds a known built-in effect and compatibility obligations, not a replacement architecture. Original glyph coverage is deliberately limited; local-serif rasterization can vary. Static previews still require actual DevTools qualification before rich support is claimed. Future motion, arbitrary fonts, or a general graphics model require separate review.

## Validation

Follow the [feature specification](../specs/cinematic-metal-presets-spec.md): test old/new reader combinations, literal text and Unicode handling, strict/fallback behavior, deterministic IDs and bytes, bounded geometry/filters, single-call exports, package consumers, and exact-preview integration. Qualify each new profile in actual Windows Chrome and Edge DevTools under ADR-0006. Execution results belong in the [feature evidence](../specs/cinematic-metal-presets-evidence.md); acceptance itself reports no implementation success.

## Sources and lineage

- [Feature specification](../specs/cinematic-metal-presets-spec.md), including the creative reference and source challenge.
- [ADR-0002](0002-compile-purely-and-emit-exactly-once.md), [ADR-0003](0003-share-one-versioned-scene-model.md), [ADR-0004](0004-separate-core-react-adapter-and-studio.md), [ADR-0005](0005-generate-output-from-validated-data.md), and [ADR-0006](0006-qualify-renderer-profiles-in-real-devtools.md).
- Local feature decision; no provider-library record imported. Existing accepted records remain binding and unchanged.
