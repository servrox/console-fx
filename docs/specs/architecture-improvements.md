# ConsoleFX architecture improvement passes

The maintainer requested `improve-codebase-architecture`, separate fixes for all
findings, and at least six review/fix passes. The review starts at `e80f1fc` and
prioritizes recent editor, compiler and release-harness changes. Existing public
interfaces and Accepted ADRs remain the contract. Reports are temporary HTML
artifacts; this record preserves each finding, ownership and verification.

| Pass | Finding | Implementation | Verification |
| --- | --- | --- | --- |
| 1 | Clipboard attempt/recovery ownership is duplicated; the demo lacks a synchronous exclusion guard. | Shared `features/export/use-clipboard-copy.ts` owns exclusion, captured recovery, retry and unmount cancellation for studio and quick demo. | Three hook-interface tests pass: overlap/retry, unavailable clipboard and late completion. Browser journeys remain in the final gate. |
| 2 | Six export formats and compilation diagnostic handling are embedded in editor markup. | `features/export/prepare-export.ts` owns compilation, format metadata, source serialization, diagnostic identity and measurement exclusion from saved recipes. | Six tests pass through its interface, including executable sources, hostile text, static preview, distinct diagnostic paths and JSON recovery. |
| 3 | Deferred import invalidation and document lifecycle rules are spread across editor effects and event handlers. | Pending. | Pending. |
| 4 | Standalone motion selection fails on throwing media preferences while direct emission correctly falls back to static output. | Pending. | Reproduced through both existing public interfaces: standalone emits zero calls; direct helper emits one. |
| 5 | Consumer, bundle and release checks interpret the same package receipt differently; only release checks relocate downloaded CI tarballs. | Pending. | Existing main-CI download has valid local tarballs and nonexistent original runner paths. |
| 6 | Artifact preparation trusts marker existence and deletes the previous candidate before its replacement is complete. | Pending. | Source review confirms deletion precedes copying/configuration/receipt writes. |

The [domain glossary](../../CONTEXT.md) records existing product terms only.
No new ADR or acceptance change is required for internal module consolidation.
Publication and deployment are separate from these implementation passes.

Pass 1 owns browser clipboard state inside the studio package; both interactive
callers consume the same hook interface. ADR-0004 keeps it out of the core and
React adapter packages; ADR-0007 governs recovery; ADR-0009 governs tests. Its
deletion would return asynchronous ordering and recovery knowledge to both
callers. No new dependency or product interaction was added.

Pass 2 owns pure export preparation inside the studio and consumes only public
core entrypoints. The editor selects a format from its result. ADR-0002 governs
silence and single emission, ADR-0004 module placement, ADR-0005 source escaping,
and ADR-0015 saved-versus-temporary measurement data. The private interface is
tested directly; no new package or public export was added.
