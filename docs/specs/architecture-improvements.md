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
| 3 | Deferred import invalidation and document lifecycle rules are spread across editor effects and event handlers. | `features/editor/use-document-session.ts` owns hydration, reducer dispatch, import generations, draft lifecycle and shared/example/reset decisions. The view supplies visual transition callbacks. | Ten session tests and 28 persistence tests pass; independent source review found no extraction regression. Production browser journeys remain in the final gate. |
| 4 | Standalone motion selection fails on throwing media preferences while direct emission correctly falls back to static output. | `browser/motion.ts` owns the shared query, runtime policy and explicit source guard. Generated snippets catch unavailable preferences and emit the precompiled static branch once. | 32 codegen/grammar checks pass, including nine runtime/source parity cases and four negative grammar fixtures. |
| 5 | Consumer, bundle and release checks interpret the same package receipt differently; only release checks relocate downloaded CI tarballs. | The existing `package-candidate.mjs` owns `readCandidate`; all three checks use its identity, byte, source and relocation validation. | Twelve release/candidate checks pass. The shared reader also verified both historical main-CI tarballs after relocation without modifying the receipt. |
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

Pass 3 keeps browser session ownership in the studio. The existing reducer still
owns bounded history, and DraftStore still owns local keys and write retention.
All user decisions cross the session interface, so no view handler knows an
import generation or storage hold/release sequence. ADR-0003, ADR-0004, ADR-0007
and ADR-0015 govern these preserved contracts. Session tests exercise controlled
file promises and browser storage rather than reaching into internal refs.

Pass 4 preserves the public `resolveMotion`, compiler and exporter interfaces.
Runtime preference reads and standalone source are two adapters to the same
guarded policy; neither introduces browser reads during compilation. The source
representation is explicit and never obtained by evaluating/stringifying a
runtime function. ADR-0002, ADR-0004, ADR-0005 and ADR-0006 govern it. Static
snippets and compiled argument arrays are unchanged; system-motion snippet bytes
change, so prior package/deployment candidates require replacement.

Pass 5 deepens the existing Node-only candidate module. It returns verified local
tarball paths to consumer, bundle and release callers. ADR-0008 governs package
identity and the toolchain, ADR-0009 evidence ownership, and ADR-0010 separate
release approval. Exact reviewed hashes and tags remain release-verifier checks;
a valid candidate is not publication authority. The historical relocation check
does not qualify those old tarballs as the newly changed source.
