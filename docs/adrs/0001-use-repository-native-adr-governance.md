# ADR-0001: Use repository-native ADR governance

Status: Accepted
Date: 2026-09-11
Owner: ConsoleFX maintainer
Applies when: Architecture-affecting planning, implementation, refactoring, review, or governance work.
Supersedes: None
Superseded by: None
Approval: Maintainer approved ADR-0001 through ADR-0011 as written in the setup conversation on 2026-09-11.

## Context

The specification contains architectural proposals but explicitly does not accept them. Future agents need to distinguish intended architecture, current implementation, and operational permission without depending on an installed skill.

## Decision

Keep single-file ADRs in `docs/adrs/` and their status and succession in [the index](README.md). The root `AGENTS.md` routes agents to applicable decisions before architecture-affecting work. Each record identifies its owner, applicability, consequences, acceptance evidence, and successor relationships.

Applicable accepted local ADRs govern architecture. Proposed and rejected decisions are not implementation authority. Follow an accepted successor instead of its predecessor. Within architecture evidence, prefer applicable accepted local decisions, then specific canonical repository documentation, ADR-linked approved examples, consistent current implementation, and finally applicable provider guidance or framework defaults. Official platform constraints can expose a conflict requiring a successor; they do not silently rewrite local policy.

When a requested change conflicts with an accepted decision, name the decision, requested difference, affected scope, impact, and maintainer resolution before changing that implementation. Accept a successor before conflicting work proceeds. Ordinary work that applies an existing decision needs no new ADR. Reports name the local ADRs materially applied.

Operational instructions, current user scope, and permissions independently determine what may execute. ADR acceptance does not authorize a commit, publication, deployment, or another delivery phase. Preserve accepted decision text and record later durable changes through reciprocal successors.

## Consequences

Agents can discover intended boundaries without scanning the whole archive. The maintainer owns status and successor maintenance; unresolved decisions remain visible rather than being inferred from code.

## Validation

Check index/status/succession consistency and local links. Trace a representative package-boundary task from root instructions to its ADR. Trace a conflicting request and confirm that the written contract stops affected implementation pending a successor. Neither source inspection nor this proposal claims a host loader or enforcement test.

## Sources and lineage

- [Specification section 13](../specs/console-fx-spec.md#13-architectural-decisions-proposed-for-implementation).
- Adapts AC-ADR-005 through the [provider mapping](provider-mapping.md); local single-file records remain canonical.
