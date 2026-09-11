# ADR-0007: Keep studio documents local

Status: Accepted
Date: 2026-09-11
Owner: ConsoleFX maintainer
Applies when: Studio rendering boundaries, editor state, drafts, imports, exports, or sharing changes.
Supersedes: None
Superseded by: None
Approval: Maintainer approved ADR-0001 through ADR-0011 as written in the setup conversation on 2026-09-11.

## Context

The initial configurator needs editing, recovery, and user-controlled sharing. These requirements do not require accounts, a backend, or a separate document-rendering implementation.

## Decision

Keep the Next.js shell and documentation server-renderable/static where practical. Feature-owned client boundaries own editing state, clipboard, local storage, media preference, and console actions. Framework routes compose these features; pure UI receives props and callbacks instead of importing persistence or trusted services. Do not add route handlers, Server Actions, authentication, a database, remote configuration, or analytics for the initial product.

Keep normalized scene data separate from transient selection, panels, preview presentation, and export tabs. A reducer owns a bounded history of 100 committed edits. Do not add a global state library without an actual need. Selecting presets, importing, and editing are silent.

The browser user controls local scene data. Imported documents are untrusted copies, validated before replacement; the current document survives invalid or unsupported imports. Apply the following lifecycle before exposing persistence:

| Data | Ownership, retention, and deletion |
| --- | --- |
| In-memory document/history | Current editor session; bounded history; discarded on session end or explicit reset |
| Local draft | Current browser origin/profile; retained until user replaces or clears it, or browser storage is cleared/evicted; provide an explicit clear-draft action and report storage failures |
| Downloaded JSON/snippet | User-controlled exported copy; deleting a local draft cannot delete downloaded or copied material |
| Shared URL fragment | User-visible copy; read and validate client-side, never auto-emit; the user controls recipients and must not treat the fragment as secret storage |

Guard storage reads/writes and support corrupt or unavailable storage without losing the current valid in-memory scene. Clear-draft deletion must be repeatable and visibly report failure rather than pretending success. No server backup or synchronization is implied.

Limit a share fragment to 8 KiB encoded and apply decoded document limits before parsing. Offer JSON export above the budget; do not truncate or introduce a backend. A future account, hosted sharing, or synchronized draft requirement reopens data ownership, retention, deletion, trust, and runtime decisions before implementation.

## Consequences

The initial app can operate without a service dependency. Local drafts are not a durable cross-device backup, and shared/exported copies cannot be revoked by clearing browser storage.

## Validation

Exercise production-build editing, one call per test click, clipboard denial, invalid/future/oversized imports, storage corruption/unavailability, history bounds, repeated clear-draft, and share-size fallback. Verify server rendering is browser-global safe and generated previews work under the selected deployment CSP when a deployment is later authorized.

## Sources and lineage

- [Specification section 7](../specs/console-fx-spec.md#7-nextjs-visual-configurator).
- Adapts AC-ADR-008 and AC-ADR-020 to a browser-local product without trusted reads or tenancy; see [provider mapping](provider-mapping.md).
