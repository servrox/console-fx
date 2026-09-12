# ADR-0010: Deliver reversible phases with publication gates

Status: Accepted
Date: 2026-09-11
Owner: ConsoleFX maintainer
Applies when: Implementing delivery phases, preparing packages, promoting artifacts, or planning rollback.
Supersedes: None
Superseded by: None
Approval: Maintainer approved ADR-0001 through ADR-0011 as written in the setup conversation on 2026-09-11.

## Context

The specification separates feasibility, a core vertical slice, the studio, effects, integrations, and release readiness. Governance setup and package naming do not authorize implementation or publication.

## Decision

Before each authorized slice, record exact paths/targets, input revision and protected state, owner, acceptance evidence, dependencies, stop conditions, last reversible point, and recovery. Preserve unrelated changes and recheck the boundary before mutation. Stop affected work on material drift, an unapproved durable choice, a required failing gate, or scope expansion.

Follow the [specification phases](../specs/console-fx-spec.md#12-delivery-phases). Qualify rendering early and prioritize the complete preset-to-export path. Missing animation evidence keeps animation experimental while separately qualified static functionality can progress. Completing a phase authorizes no later phase by itself.

Release readiness includes built tarballs, file/export/declaration/peer inspection, isolated consumer installs, compatibility evidence, and current documentation. Workspace imports are not distribution proof. Promote the same identifiable candidate artifact where the delivery system permits it and record each stage separately.

Before actual npm publication, resolve license and asset/dependency rights, npm scope access and exact package-name availability, supported versions, candidate/tag, publishing prerequisites, and explicit publication authority. Before studio deployment, resolve its host, runtime/CSP behavior, exact artifact/target, rollback, and deployment authority. No provider is selected here. Changesets and trusted-publishing automation remain planned release work, not installed infrastructure or proof of readiness.

Prefer a corrective release or an explicitly authorized tag rollback over relying on unpublishing as normal recovery. Preserve readable fallback when downgrading a visual capability. Account for document/API compatibility under [ADR-0003](0003-share-one-versioned-scene-model.md); package rollback alone cannot reverse an incompatible data conversion. Irreversible steps require exact-target approval and appropriate recovery evidence.

## Consequences

Useful product slices can be reviewed and reversed independently. Release readiness, publication, installation, deployment, and actual DevTools behavior retain separate evidence and authority.

## Validation

Recheck state before each slice, map its exits to the specification's acceptance IDs, and verify recovery in proportion to impact. Report completed stages and unavailable gates explicitly. This setup runs no package, CI, release, deployment, or production operation.

## Sources and lineage

- [Specification sections 10–14](../specs/console-fx-spec.md) and the [implementation handover](../specs/console-fx-handover.md).
- Adapts AC-ADR-022 to package delivery and the studio; see [provider mapping](provider-mapping.md).
