# ADR-0006: Qualify renderer profiles in real DevTools

Status: Accepted
Date: 2026-09-11
Owner: ConsoleFX maintainer
Applies when: Renderer capabilities, compatibility claims, animation, fallback, or preview behavior changes.
Supersedes: None
Superseded by: None
Approval: Maintainer approved ADR-0001 through ADR-0011 as written in the setup conversation on 2026-09-11.

## Context

The repository contains image mockups and an exploratory script. Their existing validation does not establish how Chrome or Edge DevTools paints or animates a console entry.

## Decision

Maintain distinct CSS text, internally generated SVG image, and readable plain-text profiles with explicit diagnostics for unsupported or approximated features. An explicitly requested unsupported renderer defaults to an error; deterministic fallback requires the caller's fallback policy. Do not silently report equivalent fidelity.

Qualify a badge, multistyle text, static SVG, and declarative SVG animation in actual Chrome and Edge DevTools before claiming support. Record exact browser/build, operating system, theme, zoom, console width, case, result, artifact, and evidence location. Include clipping, filter bounds, start/stop, logging before DevTools opens, reopen/offscreen behavior, repeated identical snippets, narrow consoles, and copied text.

Ship qualified CSS/plain-text work independently. Keep animated SVG experimental without the corresponding real DevTools evidence. If only static SVG qualifies, keep its static output and disable unsupported animation controls. Never replace a failed animation with repeated logging or clearing.

Motion is precomputed decoration, not live progress. The compiler receives explicit policy; emission helpers resolve browser preference. Reduced or unknown preference selects static output. Allowed animation lasts at most five seconds with a useful static frame and no rapid flashing. Standalone system-motion output includes guarded preference handling and both required precompiled alternatives. Do not promise restarting identical cached images or controlling an already printed entry.

An SVG entry includes a readable, reset-styled caption in the same console call. CSS page preview is labeled **Approximate browser preview**. An image preview uses the compiler's exact image URI, but remains separate from DevTools proof. Preview play/replay/static actions change only the preview.

## Consequences

Rich support can vary by named profile and version. Useful static output can progress while experimental animation remains unqualified; compatibility records must be refreshed for materially changed artifacts or environments.

## Validation

Argument-count events and isolated execution prove calls and arguments. Page-image frames prove image rendering. Actual DevTools observation proves console appearance and motion for the recorded environment. Keep these claims separate and mark unavailable observations explicitly.

## Sources and lineage

- [Specification sections 2 and 5](../specs/console-fx-spec.md), [README evidence limits](../../README.md), and [mockup validation record](../mockups/README.md#validation-record).
- Applies AC-ADR-018 to the product's rendering boundary; see [provider mapping](provider-mapping.md).
