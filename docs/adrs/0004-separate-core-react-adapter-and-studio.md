# ADR-0004: Separate the core, React adapter, and studio

Status: Accepted
Date: 2026-09-11
Owner: ConsoleFX maintainer
Applies when: Workspace ownership, source placement, dependency direction, public entrypoints, or framework adapters change.
Supersedes: None
Superseded by: None
Approval: Maintainer approved ADR-0001 through ADR-0011 as written in the setup conversation on 2026-09-11.

## Context

ConsoleFX has a deliberate public core boundary, useful React lifecycle behavior, and a product-specific configurator. A package per renderer or a Next.js re-export wrapper would add coordination without a distinct responsibility.

## Decision

Use the following planned ownership boundaries; create their directories only as authorized implementation needs them.

| Owner | Responsibility | Allowed dependency direction |
| --- | --- | --- |
| `packages/console-fx` / `@servrox/console-fx` | Scene model, validation, effects, CSS/SVG/text renderers, presets, code generation | Runtime-neutral or explicit browser-safe modules; no React, Next.js, or studio imports |
| `packages/console-fx-react` / `@servrox/console-fx-react` | Thin hooks, mount behavior, reusable preview | Public core entrypoints; React as a peer dependency |
| `apps/studio` | Editor state, controls, local persistence, preview/export integration | Public core and React entrypoints; no private package source imports |
| `examples/` and `tests/consumers/` | Consumer integration and distribution proof | Documented package entrypoints; isolated tarballs for distribution proof |

Keep framework entrypoints thin. Place non-React validation, metadata, serialization, and persistence logic in their owning modules rather than component directories. Each architecture-affecting slice records changed file ownership, source role, runtime audience, and callers. Avoid speculative empty units and pass-through layers.

The core root exposes scene/validation contracts without importing code generation, React, Next.js, or editor code. Intentional `/browser`, `/presets`, and `/codegen` subpaths expose their own documented capabilities. Browser-safe code cannot import Node built-ins, secrets, process bootstrap, or deployment configuration. Package import remains silent and does not access browser globals at import time.

React stays unbundled as a peer; client entrypoints preserve `"use client"` in built output. The studio exercises the same public preview/emission adapter as consumers. Next.js integration uses tested recipes and an example initially. Reconsider a dedicated Next.js package only for a concrete feature requiring Next APIs or build-time integration.

## Consequences

The core remains independently consumable while the studio owns product behavior. Export maps and packed-consumer tests carry the cost of enforcing the package boundary.

## Validation

Inspect import graphs and actual export maps. Test imports and declarations through packed public entrypoints in plain JS, TS, React, and Next consumers; preserve client directives and exclude React, Next, codegen, and editor assets from a basic core consumer as applicable.

## Sources and lineage

- [Specification sections 3, 8, 10, and 13](../specs/console-fx-spec.md).
- Adapts AC-ADR-006 and AC-ADR-007 to the product's explicit package and browser audiences; see [provider mapping](provider-mapping.md).
