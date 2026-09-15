# ADR-0005: Generate output from validated data

Status: Accepted
Date: 2026-09-11
Owner: ConsoleFX maintainer
Applies when: Scene import, CSS/SVG generation, standalone JavaScript serialization, or resource limits change.
Supersedes: None
Superseded by: None
Approval: Maintainer approved ADR-0001 through ADR-0011 as written in the setup conversation on 2026-09-11.

## Context

The product turns user-authored text and configuration into console arguments, image data, and inspectable JavaScript. Each conversion must preserve text as data and bound rendering work.

## Decision

Validate untrusted values before normalization or rendering. Reject unknown executable forms, dangerous property names, nonfinite numbers, invalid enums/colors, and out-of-range settings. Traverse schema-owned fields; do not merge arbitrary objects into prototypes. Errors remain readable data and do not echo secrets or create extra console calls.

Construct CSS format strings from controlled `%c`/`%s` tokens, pass user text as separate arguments, apply a conservative property/value allowlist, and reset styles explicitly. Do not accept raw CSS.

Generate SVG solely from internal templates and validated scene data with XML escaping. Permit only internal fragment references. Forbid scripts, event attributes, `foreignObject`, external resources, font fetching/embedding, and user-authored SVG. Encode Unicode without a browser dependency on Node's `Buffer`. Preview the exact generated image URI through an image element, never imported markup insertion.

Serialize JavaScript strings with a dedicated serializer covering quotes, backslashes, controls, `<`, and Unicode line separators. Do not interpolate raw input into executable templates. The editor tests compiled argument arrays; it never evaluates generated source. Standalone snippets remain complete and inspectable.

Apply these initial engineering limits from specification section 9 before costly work. They are product policy, not measured browser limits.

| Resource | Limit |
| --- | --- |
| Imported JSON | 64 KiB before parsing |
| Document text | 2,000 Unicode code points |
| Structure | 8 lines; 32 total runs; 4 compatible effects per run |
| Per-glyph animation | 80 graphemes, then whole-run fallback with diagnostics |
| SVG output | At most 1,200 × 400 CSS px and 1,000 elements; bounded filter/blur parameters |
| Generated snippet | Warn at 32 KiB; refuse above 128 KiB, including both motion branches |

Motion limits belong to [ADR-0006](0006-qualify-renderer-profiles-in-real-devtools.md); local history and sharing limits belong to [ADR-0007](0007-keep-studio-documents-local.md). Validate decoded input and cap allocations before building large arrays or strings. Perform a focused threat review when these import/code-generation boundaries are implemented or materially changed.

## Consequences

The initial API trades arbitrary markup and styles for predictable, inspectable output. New effects must fit the schema, allowed output forms, and budgets before becoming supported.

## Validation

Use an adversarial text corpus, boundary/fuzz cases, parsed-SVG structural checks, AST checks, and isolated generated-source execution with a recording sink. Prove preserved literal percent tokens and Unicode, no forbidden output, no extra side effects, and deterministic failure for oversized inputs. This setup does not claim those runtime tests exist or pass.

## Sources and lineage

- [Specification sections 5, 6, and 9](../specs/console-fx-spec.md).
- Adapts AC-ADR-019 and the resource-budget portion of AC-ADR-025; see [provider mapping](provider-mapping.md).
